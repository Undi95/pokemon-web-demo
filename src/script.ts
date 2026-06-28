/**
 * script-runtime.ts — overworld script engine 1:1 décomp.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/script.c` (= 1:1).
 *
 * Pokemon Emerald scripts = bytecode. Chaque opcode = 1 byte + args. Notre
 * version : opcodes pré-extraits par map en JSON (= `/decomp/em/scripts/`),
 * format `"opname arg1, arg2, ..."` per opcode. On parse ces strings comme
 * "instructions haut-niveau" — équivalent fonctionnel du bytecode décomp.
 *
 * Architecture 1:1 décomp :
 *   - 2 contexts : `sGlobalScriptContext` (= peut wait, used pour NPC dialog)
 *     + `sImmediateScriptContext` (= synchronous, pour OnTransition / OnLoad).
 *   - 3 modes : STOPPED / BYTECODE / NATIVE (= polling C function).
 *   - 3 statuts globaux : RUNNING / WAITING / SHUTDOWN.
 *
 * Public API :
 *   - ScriptContext_SetupScript(label) : démarre un script dans le global ctx
 *   - ScriptContext_RunScript() : tick une fois ; appelé chaque frame
 *   - ScriptContext_Stop() / ScriptContext_Enable() : pause/resume
 *   - RunScriptImmediately(label) : run synchronous
 *   - LockPlayerFieldControls() / UnlockPlayerFieldControls() : freeze input
 *   - ArePlayerFieldControlsLocked() : pour PlayerStep skip input
 *   - loadMapScripts(mapName) : fetch + parse JSON scripts d'une map
 */

import { VarGet } from './engine/script/script-vars';
// Migration TEXTE byte-level 1:1 (flip direct) : getText retourne des bytes charmap
// (data source lisible → encodée au 1er accès via encodeOwText = notre préproc, cache).
import { encodeOwText, isOwCharmapReady } from '../include/text';
// ── Phase 5 byte-VM : SWAP flag-gated (`?bytevm`) ──
// L'EXÉCUTION des scripts overworld passe par le VRAI byte-VM (image bytecode +
// gScriptCmdTable) — `script.ts` GARDE son API publique et délègue l'exécution à
// `script_bytevm.ts` (BV). Les DONNÉES (tables map_script_2, getText/getMovement) restent
// chargées par loadMapScripts ; le byte-VM exécute depuis son image (ptrFromLabel).
// SWAP FINALISÉ + CLEAN (2026-06-28) : le byte-VM est le SEUL moteur (le moteur parsé a été
// retiré). Cf docs/BYTE-VM-PLAN.md Phase 5.
import * as BV from './script_bytevm';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

export const SCRIPT_MODE_STOPPED  = 0;
export const SCRIPT_MODE_BYTECODE = 1;
export const SCRIPT_MODE_NATIVE   = 2;

export const CONTEXT_RUNNING  = 0;
export const CONTEXT_WAITING  = 1;
export const CONTEXT_SHUTDOWN = 2;

const STACK_DEPTH = 20;
const CTX_DATA_SIZE = 4;

// ─── Types ───────────────────────────────────────────────────────────────────

/** Une opcode parsed (= "msgbox X, MSGBOX_NPC" → { name: 'msgbox', args: ['X', 'MSGBOX_NPC'] }). */
export interface Opcode {
  name: string;
  args: string[];
}

export interface ScriptContext {
  mode: number;
  /** Pointer "courant" dans le script : reference à un script (= array d'opcodes)
   *  + offset (= index opcode courant). Combiné = équivalent `scriptPtr` décomp. */
  scriptOpcodes: Opcode[] | null;
  scriptIdx: number;
  /** Stack pour call/return. Chaque entrée = (opcodes ref, index). */
  stack: Array<{ opcodes: Opcode[]; idx: number } | null>;
  stackDepth: number;
  /** ctx->data[i] (= 4 entries). Used par msgbox pour stocker text label, etc. */
  data: number[];
  /** Pour SCRIPT_MODE_NATIVE : polling fn. Returns TRUE → revient en BYTECODE. */
  nativeFn: (() => boolean) | null;
  /** ctx->comparisonResult : LESS_THAN/EQUAL/GREATER_THAN après `compare`. */
  comparisonResult: number;
}

function createContext(): ScriptContext {
  return {
    mode: SCRIPT_MODE_STOPPED,
    scriptOpcodes: null,
    scriptIdx: 0,
    stack: Array.from({ length: STACK_DEPTH }, () => null),
    stackDepth: 0,
    data: new Array(CTX_DATA_SIZE).fill(0),
    nativeFn: null,
    comparisonResult: 0,
  };
}

// ─── Module state ────────────────────────────────────────────────────────────

const sGlobalScriptContext = createContext();
const sImmediateScriptContext = createContext();
let sGlobalScriptContextStatus = CONTEXT_SHUTDOWN;
// Lock de contrôles joueur UNIFIÉ (parsé + byte-VM) via globalThis : au swap Phase 5, les
// chemins de combat/warp/global peuvent appeler Lock/Unlock sur l'un OU l'autre moteur ;
// un flag partagé élimine la désync dual-flag (sinon : freeze post-combat / warp cassé).
const _GLK = globalThis as Record<string, unknown>;
function _lockGet(): boolean { return _GLK.__sLockFieldControls === true; }
function _lockSet(v: boolean): void { _GLK.__sLockFieldControls = v; }

// Script library : labels → array of opcodes. Loaded au map switch.
let _scriptsByLabel: Map<string, Opcode[]> = new Map();
// Texts library : label → raw text string.
let _textsByLabel: Map<string, string> = new Map();   // source lisible (1:1 `_("…")`)
let _textBytesCache: Map<string, Uint8Array> = new Map();  // encodée (notre préproc), invalidée au load
// Movements library : extracted comme "scripts" dans le JSON, mais ce sont des
// movement label sequences. Stockés ensemble pour simplicité ; runtime distingue.
// e.g. "LittlerootTown_Movement_PlayerEnterHouse" → ["walk_up", "walk_up", "step_end"].
let _movementsByLabel: Map<string, string[]> = new Map();

// ─── Map script JSON loader ──────────────────────────────────────────────────

/** Format JSON d'une map :
 *    { scripts: { label: [opcodeStr, ...], ... }, texts: { label: rawText, ... } }
 *  Les "scripts" peuvent être en fait des movement sequences (= strings comme
 *  "walk_up", "face_down", "step_end") plutôt que des opcodes. On classe par
 *  contenu : si toutes les entries sont des single-word strings sans args et
 *  finissent par "step_end", c'est un movement. */
interface MapScriptsJson {
  scripts: Record<string, string[]>;
  texts: Record<string, string>;
}

function classifyAsMovement(lines: string[]): boolean {
  if (lines.length === 0) return false;
  const last = lines[lines.length - 1].trim();
  if (last !== 'step_end' && last !== 'face_default' && last !== 'walk_in_place_down')
    return false;
  // Movement actions sont single-word ou avec un nombre (= delay_8, delay_16).
  // Opcodes ont typiquement des args avec virgules ou underscores plus complexes.
  for (const line of lines) {
    const trimmed = line.trim();
    // Opcode key reconnaissable : présence de virgule = args multiples.
    if (trimmed.includes(',')) return false;
    // Opcode key : commence par "msgbox", "lock", "release", "goto", etc.
    if (/^(msgbox|lockall|releaseall|lock|release|faceplayer|message|waitmessage|closemessage|waitbuttonpress|setvar|setflag|clearflag|checkflag|compare|goto_if|call_if|gotostd|callstd|goto|call|return|end|delay|special|waitstate|playse|playfanfare|waitfanfare|opendoor|closedoor|waitdooranim|setobjectxy|setobjectxyperm|setobjectmovementtype|addobject|removeobject|hideobject|showobject|warp|warpsilent|signpost|applymovement|waitmovement|copyvar|setflag|setdooropen|checkplayergender|playmoncry|loadword|loadbyte|setptr|map_script|map_script_2|hideplayer|showpalettefade|fadeoutbgm|fadeinbgm|releaseobjectevent|moveobjectoffscreen)\b/.test(trimmed))
      return false;
  }
  return true;
}

/** Parse une opcode line : "name arg1, arg2, arg3" → {name, args}. */
export function parseOpcode(line: string): Opcode {
  const trimmed = line.trim();
  if (trimmed.length === 0) return { name: '', args: [] };
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return { name: trimmed, args: [] };
  const name = trimmed.slice(0, spaceIdx);
  const argsStr = trimmed.slice(spaceIdx + 1);
  const args = argsStr.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  return { name, args };
}

/** Common scripts/movements/texts loaded once au boot et merged dans chaque map.
 *  Source : `public/decomp/em/scripts/_common.json` (= contient
 *  Common_Movement_FacePlayer, Common_EventScript_*, etc.). */
let _commonJson: MapScriptsJson | null = null;
let _commonLoading: Promise<void> | null = null;

async function _loadCommonScripts(): Promise<void> {
  if (_commonJson) return;
  if (_commonLoading) return _commonLoading;
  _commonLoading = (async () => {
    try {
      const r = await fetch('/decomp/em/scripts/_common.json');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      _commonJson = await r.json() as MapScriptsJson;
      const sCount = Object.keys(_commonJson.scripts ?? {}).length;
      const tCount = Object.keys(_commonJson.texts ?? {}).length;
      console.log(`[script-runtime] _common.json loaded : ${sCount} scripts + ${tCount} texts`);
    } catch (e) {
      console.warn('[script-runtime] _common.json load failed:', e);
      _commonJson = { scripts: {}, texts: {} };
    } finally {
      _commonLoading = null;
    }
  })();
  return _commonLoading;
}

/** Charge les scripts d'une map depuis le JSON pré-extrait + merge _common.json
 *  (= scripts/movements partagés comme Common_Movement_FacePlayer). */
export async function loadMapScripts(mapName: string): Promise<void> {
  // Phase 5 byte-VM : si le flag ?bytevm est actif, s'assurer que le moteur byte-VM
  // (image + handlers + specials) est installé AVANT de charger les données de map.
  // Import dynamique = même instance live (pas de cycle statique script→scrcmd_bytevm).
  await import('./bytevm-boot').then((m) => m.loadByteVmEngine());
  await _loadCommonScripts();
  const url = `/decomp/em/scripts/${mapName}.json`;
  let json: MapScriptsJson;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    json = await r.json();
  } catch (e) {
    console.warn(`[script-runtime] loadMapScripts(${mapName}) failed:`, e);
    json = { scripts: {}, texts: {} };
  }

  _scriptsByLabel = new Map();
  _textsByLabel = new Map();
  _textBytesCache = new Map();   // invalide le cache d'encodage (nouvelle data map)
  _movementsByLabel = new Map();

  // Merge order : map-specific scripts override common ones (rare). Common load
  // FIRST permet aux scripts map-specific de réutiliser les Common_* labels.
  const sources: Array<{ scripts?: Record<string, string[]>; texts?: Record<string, string> }> = [
    _commonJson ?? { scripts: {}, texts: {} },
    json,
  ];

  let scriptCount = 0;
  let movementCount = 0;
  for (const src of sources) {
    for (const [label, lines] of Object.entries(src.scripts ?? {})) {
      if (classifyAsMovement(lines)) {
        _movementsByLabel.set(label, lines);
        movementCount++;
      } else {
        _scriptsByLabel.set(label, lines.map(parseOpcode));
        scriptCount++;
      }
    }
    for (const [label, raw] of Object.entries(src.texts ?? {})) {
      _textsByLabel.set(label, raw);
    }
  }
  console.log(`[script-runtime] loaded ${scriptCount} scripts + ${movementCount} movements + ${_textsByLabel.size} texts for ${mapName} (incl. _common)`);
}

export function getScript(label: string): Opcode[] | undefined {
  return _scriptsByLabel.get(label);
}
/** 1:1 décomp : un script charge un `const u8 *` (bytes charmap) par label. La
 *  data source reste lisible (`_textsByLabel`, comme `_("…")`) ; on l'encode en
 *  bytes au 1er accès (= notre préproc, `encodeOwText`) avec cache. Si la charmap
 *  n'est pas encore prête, on encode sans cacher (ré-encodage propre ensuite). */
export function getText(label: string): Uint8Array | undefined {
  const raw = _textsByLabel.get(label);
  if (raw === undefined) return undefined;
  const cached = _textBytesCache.get(label);
  if (cached !== undefined) return cached;
  const bytes = encodeOwText(raw);
  if (isOwCharmapReady()) _textBytesCache.set(label, bytes);
  return bytes;
}
export function getMovement(label: string): string[] | undefined {
  return _movementsByLabel.get(label);
}

// Phase 4.10 : register movement label resolver vers movement-system.
// Hook au chargement de ce module (= side-effect import side dans
// TestOverworldScene → script-opcodes → movement-system).
import { setMovementLabelResolver } from './engine/field/movement-system';
setMovementLabelResolver((label: string) => _movementsByLabel.get(label) ?? null);

// ─── Lock / Unlock 1:1 décomp ────────────────────────────────────────────────

export function LockPlayerFieldControls(): void { _lockSet(true); }
export function UnlockPlayerFieldControls(): void { _lockSet(false); }
export function ArePlayerFieldControlsLocked(): boolean { return _lockGet(); }

// ─── Context primitives 1:1 décomp ───────────────────────────────────────────

export function InitScriptContext(ctx: ScriptContext): void {
  ctx.mode = SCRIPT_MODE_STOPPED;
  ctx.scriptOpcodes = null;
  ctx.scriptIdx = 0;
  ctx.nativeFn = null;
  ctx.stackDepth = 0;
  ctx.comparisonResult = 0;
  for (let i = 0; i < CTX_DATA_SIZE; i++) ctx.data[i] = 0;
  for (let i = 0; i < STACK_DEPTH; i++) ctx.stack[i] = null;
}

export function SetupBytecodeScript(ctx: ScriptContext, opcodes: Opcode[]): boolean {
  ctx.scriptOpcodes = opcodes;
  ctx.scriptIdx = 0;
  ctx.mode = SCRIPT_MODE_BYTECODE;
  return true;
}

export function SetupNativeScript(ctx: ScriptContext, fn: () => boolean): void {
  ctx.mode = SCRIPT_MODE_NATIVE;
  ctx.nativeFn = fn;
}

export function StopScript(ctx: ScriptContext): void {
  ctx.mode = SCRIPT_MODE_STOPPED;
  ctx.scriptOpcodes = null;
}

export function ScriptJump(ctx: ScriptContext, opcodes: Opcode[]): void {
  ctx.scriptOpcodes = opcodes;
  ctx.scriptIdx = 0;
}

/** 1:1 STRICT décomp `ScriptCall(ctx, ptr)` (script.c:155-159) :
 *    ScriptPush(ctx, ctx->scriptPtr);   ← push, ignore overflow result
 *    ctx->scriptPtr = ptr;              ← set new ptr REGARDLESS of overflow
 *  ScriptPush retourne TRUE si overflow (stackDepth + 1 >= STACK_DEPTH) mais
 *  ScriptCall ignore la valeur — le décomp continue à set ptr quoi qu'il arrive. */
export function ScriptCall(ctx: ScriptContext, opcodes: Opcode[]): void {
  // Push (= 1:1 ScriptPush) : si overflow, warn silencieux mais set ptr quand même.
  if (ctx.stackDepth + 1 < STACK_DEPTH) {
    ctx.stack[ctx.stackDepth] = { opcodes: ctx.scriptOpcodes ?? [], idx: ctx.scriptIdx };
    ctx.stackDepth++;
  } else {
    console.warn('[script-runtime] stack overflow on call (= dropped push, set ptr anyway)');
  }
  ctx.scriptOpcodes = opcodes;
  ctx.scriptIdx = 0;
}

export function ScriptReturn(ctx: ScriptContext): void {
  if (ctx.stackDepth === 0) {
    // 1:1 décomp : ScriptPop returns NULL → ctx->scriptPtr = NULL → mode = STOPPED.
    ctx.scriptOpcodes = null;
    return;
  }
  ctx.stackDepth--;
  const top = ctx.stack[ctx.stackDepth];
  if (top) {
    ctx.scriptOpcodes = top.opcodes;
    ctx.scriptIdx = top.idx;
  } else {
    ctx.scriptOpcodes = null;
  }
}

// ─── Opcode handler registry ─────────────────────────────────────────────────

/** Handler signature : returns
 *    true  → wait (= ScriptContext_Stop, defer to next frame)
 *    false → continue (= advance to next opcode)
 *  Le throw "STOP" peut être utilisé pour terminer le script. */
export type OpcodeHandler = (ctx: ScriptContext, args: string[]) => boolean;

const _handlers: Map<string, OpcodeHandler> = new Map();

export function registerOpcode(name: string, handler: OpcodeHandler): void {
  _handlers.set(name, handler);
}

/** Audit session 126 (post-test) : public accessor pour aliasing opcodes
 *  (= setdoor_opened → setdooropen). Returns undefined si pas registered. */
export function getOpcodeHandler(name: string): OpcodeHandler | undefined {
  return _handlers.get(name);
}

/** Lookup handler. Si pas trouvé : warn une fois, then noop. */
const _warnedMissing = new Set<string>();
function dispatchOpcode(ctx: ScriptContext, op: Opcode): boolean {
  const handler = _handlers.get(op.name);
  if (!handler) {
    if (!_warnedMissing.has(op.name)) {
      console.warn(`[script-runtime] opcode '${op.name}' not implemented (args: ${op.args.join(', ')}) — skipping`);
      _warnedMissing.add(op.name);
    }
    return false;  // continue
  }
  return handler(ctx, op.args);
}

// ─── Run loop 1:1 décomp ─────────────────────────────────────────────────────

/** 1:1 décomp `RunScriptCommand(ctx)`. Returns FALSE quand script done.
 *  Tick :
 *   - STOPPED : returns FALSE
 *   - NATIVE  : poll nativeFn ; si TRUE, switch en BYTECODE ; returns TRUE
 *   - BYTECODE : loop opcodes jusqu'à wait OR end. */
export function RunScriptCommand(ctx: ScriptContext): boolean {
  if (ctx.mode === SCRIPT_MODE_STOPPED) return false;
  if (ctx.mode === SCRIPT_MODE_NATIVE) {
    if (ctx.nativeFn) {
      if (ctx.nativeFn() === true) {
        ctx.mode = SCRIPT_MODE_BYTECODE;
      }
      return true;  // wait
    }
    ctx.mode = SCRIPT_MODE_BYTECODE;
    // fallthrough
  }
  // BYTECODE : loop until wait or end
  // Safety : cap iterations pour éviter infinite loop si bug dans script.
  for (let iter = 0; iter < 10000; iter++) {
    if (!ctx.scriptOpcodes) {
      ctx.mode = SCRIPT_MODE_STOPPED;
      return false;
    }
    if (ctx.scriptIdx >= ctx.scriptOpcodes.length) {
      // Fall off the end (= no explicit end opcode). Stop.
      ctx.mode = SCRIPT_MODE_STOPPED;
      return false;
    }
    const op = ctx.scriptOpcodes[ctx.scriptIdx];
    ctx.scriptIdx++;
    // Devtools ring buffer pour scope.scriptHistory(). Push silently si dispo
    // — aucun effet runtime si __scriptOpcodeLog absent. Cap à 256 entries.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _olog = (globalThis as any).__scriptOpcodeLog as Array<{
      frame: number; label: string; opcode: string; args: unknown[]; idx: number; ts: number;
    }> | undefined;
    if (_olog) {
      if (_olog.length >= 256) _olog.shift();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _rt = (globalThis as any).dev?._rt;
      _olog.push({
        frame: _rt?.gIntroFrameCounter ?? 0,
        label: _currentScriptLabel ?? 'native',
        opcode: op.name,
        args: op.args,
        idx: ctx.scriptIdx - 1,
        ts: performance.now(),
      });
    }
    const wait = dispatchOpcode(ctx, op);
    if (wait) return true;
    // Si dispatchOpcode a set mode = STOPPED (= via end opcode), bail.
    if (ctx.mode === SCRIPT_MODE_STOPPED) return false;
  }
  console.warn('[script-runtime] iteration cap hit (10000) — runaway script?');
  ctx.mode = SCRIPT_MODE_STOPPED;
  return false;
}

// ─── ScriptContext_* (= primary global ctx avec wait support) ────────────────

export function ScriptContext_IsEnabled(): boolean {
  return BV.ScriptContext_IsEnabled();
}

export function ScriptContext_Init(): void {
  BV.ScriptContext_Init();
}

export function ScriptContext_RunScript(): boolean {
  return BV.ScriptContext_RunScript();
}

/** Run an inline native script via the global script context. The script
 *  consists of a single `tickFn` that returns true when done. Useful for
 *  triggering UI flows (= ChooseStarter, BirchTutorialBattle, …) from devtools
 *  without a label-named script. */
export function ScriptContext_SetupInlineNative(tickFn: () => boolean): boolean {
  // DÉLÈGUE au byte-VM (le SEUL moteur tické par ScriptContext_RunScript). Avant :
  // montait le tick sur le contexte parsé MORT → jamais pollé (dev.starter.choose
  // ne se lançait pas). Même résidu de clean que Enable/snapshot.
  BV.ScriptContext_SetupInlineNative(tickFn);
  return true;
}

// Session 133 add : track current label pour devtool scope.script() debug.
let _currentScriptLabel: string | null = null;

/** 1:1 décomp `ScriptContext_SetupScript(const u8 *ptr)`. */
export function ScriptContext_SetupScript(label: string): boolean {
  const ptr = BV.ptrFromLabel(label);
  if (!ptr) { console.warn(`[byte-vm] script '${label}' absent de l'image`); return false; }
  BV.ScriptContext_SetupScript(ptr);
  _currentScriptLabel = label;
  return true;
}

export function ScriptContext_Stop(): void {
  BV.ScriptContext_Stop();
}

/** Devtools-only : setup un script inline composé d'opcodes pré-construits
 *  (= pas besoin d'un label dans _scriptsByLabel). Utilisé par scope.action()
 *  pour exécuter un opcode unique sans setup d'un script complet. */
export function ScriptContext_SetupInlineBytecode(opcodes: Opcode[], devLabel = 'inline'): boolean {
  // NON SUPPORTÉ avec le byte-VM (le SEUL moteur) : il exécute du BYTECODE, pas des
  // Opcode[] parsés ; assembler un opcode isolé exigerait l'assembleur build-time (CJS,
  // absent du navigateur). Avant le clean ça montait un contexte parsé MORT → no-op
  // silencieux. On warn explicitement plutôt (devtool scope.action). Pour exécuter un
  // vrai script : __byteVm.launchScript(label).
  console.warn(`[byte-vm] scope.action('${devLabel}', ${opcodes.length} op) non supporté : ` +
    `le byte-VM n'exécute pas d'Opcode[] parsés. Utilise __byteVm.launchScript(label).`);
  return false;
}

export function ScriptContext_Enable(): void {
  // DÉLÈGUE au byte-VM (le SEUL moteur). Avant : posait le statut du contexte PARSÉ
  // MORT → un script byte-VM suspendu par ScriptContext_Stop (field_poison whiteout,
  // WaitWeather) ne reprenait JAMAIS (byte-VM restait WAITING). Même résidu de clean
  // que le bug snapshot/restore. Les UI flows waitstate (Cut/RockSmash) signalent en
  // plus via SignalWaitState ; pour eux ce délégué est correct (statut déjà RUNNING).
  BV.ScriptContext_Enable();
}

/** Snapshot complet du ScriptContext global byte-VM + status. Alias du type BV :
 *  le byte-VM est le SEUL moteur, donc on capture/restaure SON contexte (scriptPtr
 *  + nativePtr), pas l'ancien contexte parsé mort. */
export type ScriptCtxSnapshot = BV.ByteVmScriptCtxSnapshot;

/** 1:1 décomp `CB2_ReturnToFieldContinueScript*` — PRÉSERVE le ScriptContext
 *  global à travers un re-init complet du field. `loadAndInitMap` appelle
 *  `ScriptContext_Init()` (reset total : approprié pour boot/new-game, mais
 *  PAS pour le retour-au-field-CONTINUE post-combat / post-menu plein écran où
 *  le script suspendu — ex. tuto Birch sur `special ChooseStarter`, ou le
 *  `pokemart` waitstate après le buy-menu — DOIT reprendre exactement où il
 *  était). Snapshot AVANT le re-init, Restore APRÈS = "le ScriptContext survit
 *  au CB2 swap". Si aucun script en vol (status SHUTDOWN, ctx vide) = no-op.
 *
 *  ⚠️ DÉLÈGUE au byte-VM (BV) : le byte-VM est le SEUL moteur. Capturer le
 *  contexte parsé MORT de ce module (scriptOpcodes/nativeFn) au lieu du contexte
 *  byte-VM (scriptPtr/nativePtr) perdait le poll natif → bug shop (textbox
 *  "anything else?" figée + plus de reprise après QUITTER). */
export function ScriptContext_Snapshot(): ScriptCtxSnapshot {
  return BV.ScriptContext_Snapshot();
}

export function ScriptContext_Restore(s: ScriptCtxSnapshot): void {
  BV.ScriptContext_Restore(s);
}

/** 1:1 décomp `RunScriptImmediately(const u8 *ptr)`. Run synchronous (=
 *  utilisé par OnTransition / OnLoad / OnWarp).
 *
 *  Audit session 126 LOT C10 : fallback common scripts si label pas dans
 *  `_scriptsByLabel`. Permet `RunScriptImmediately('EventScript_ResetAllMap
 *  Flags')` AVANT que la 1ère map soit loaded (= use case new-game-init).
 *  Le `_commonJson` est chargé au boot par `loadCommonScripts`. */
export function RunScriptImmediately(label: string): void {
  if (!BV.RunScriptImmediatelyByLabel(label)) console.warn(`[byte-vm] RunScriptImmediately: '${label}' absent de l'image`);
}

/** Audit session 126 LOT C10 : ensure common scripts are loaded. Public
 *  accessor pour modules qui doivent run un script common avant que la
 *  1ère map soit loaded (= ex. new-game-init). */
export async function ensureCommonScriptsLoaded(): Promise<void> {
  await _loadCommonScripts();
}

// ─── Map script hooks (= 1:1 décomp `RunOn*MapScript`) ──────────────────────
//
// Audit Opus §3.3 : RunOnLoadMapScript était commenté TODO. Implémenté ici.
//
// Le `mapScripts` field de gMapHeader pointe vers un label "MapScripts" qui
// contient une liste d'opcodes `map_script TYPE, scriptLabel`. On parse cette
// liste pour trouver le scriptLabel correspondant à un type donné, puis on
// run ce scriptLabel via RunScriptImmediately.
//
// Types supportés (1:1 décomp constants/map_scripts.h) :
//   MAP_SCRIPT_ON_LOAD       (= entrée map = setdooropen, hide objects)
//   MAP_SCRIPT_ON_TRANSITION (= load map après warp = position NPCs)
//   MAP_SCRIPT_ON_FRAME_TABLE (= polled chaque frame)
//   MAP_SCRIPT_ON_RESUME     (= return to overworld depuis menu/battle)
//   MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE (= sur warp arrival)
//   MAP_SCRIPT_ON_DIVE_WARP (= dive)

/** Find le scriptLabel d'un type donné dans le mapScripts table.
 *  @param mapScriptsLabel Label de la map_scripts table (= header.mapScripts)
 *  @param scriptType Type de script (e.g. 'MAP_SCRIPT_ON_LOAD')
 *  @returns Le scriptLabel à run, ou null si pas de script de ce type. */
function findMapScriptLabel(mapScriptsLabel: string, scriptType: string): string | null {
  // Le mapScripts table est stocké comme un script regular (= entrée dans
  // _scriptsByLabel) avec opcodes `map_script TYPE, label`.
  const opcodes = _scriptsByLabel.get(mapScriptsLabel);
  if (!opcodes) return null;
  for (const opcode of opcodes) {
    if (opcode.name === 'map_script' && opcode.args[0] === scriptType) {
      return opcode.args[1] ?? null;
    }
  }
  return null;
}

/** 1:1 décomp `RunOnLoadMapScript()` (fieldmap.c). Run le script `MAP_SCRIPT_ON_LOAD`
 *  de la current map. Appelé par `InitMap` via le hook `setOnLoadMapScriptHook`.
 *
 *  Ce script est typiquement utilisé pour :
 *  - `setmetatile` : modifier des tiles map (ex. moving boxes au début intro)
 *  - `setdooropen` : ouvrir des doors selon flags
 *  - `setflag` / `clearflag` : init state flags */
export function RunOnLoadMapScript(): void {
  // Lookup mapHeader.mapScripts via globalThis pour éviter circular import.
  // map-loader.ts → script-runtime.ts → map-loader (= circular). Avec
  // globalThis on évite le cycle.
  if (!gMapHeader?.mapScripts) return;
  const onLoadLabel = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_LOAD');
  if (!onLoadLabel) return;
  console.log(`[script-runtime] RunOnLoadMapScript : ${onLoadLabel}`);
  RunScriptImmediately(onLoadLabel);
}

/** 1:1 décomp `RunOnTransitionMapScript()` (fieldmap.c). Run le script
 *  `MAP_SCRIPT_ON_TRANSITION`. Appelé après warp, pour positionner les NPCs
 *  selon plot state. */
export function RunOnTransitionMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_TRANSITION');
  if (!label) return;
  console.log(`[script-runtime] RunOnTransitionMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `RunOnResumeMapScript()` (script.c:338) :
 *      MapHeaderRunScriptType(MAP_SCRIPT_ON_RESUME);
 *  Appelé sur retour à l'overworld depuis menu/battle (= overworld.c:820/2150).
 *  Dette R3 wire : nos CB2 swap (= LoadMapFromCameraTransition équivalent) ne
 *  call pas encore cet hook. Exposé pour wire futur. */
export function RunOnResumeMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_RESUME');
  if (!label) return;
  console.log(`[script-runtime] RunOnResumeMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `RunOnReturnToFieldMapScript()` (script.c:343) :
 *      MapHeaderRunScriptType(MAP_SCRIPT_ON_RETURN_TO_FIELD);
 *  Appelé sur retour au field post-CB2 swap (= overworld.c:2184).
 *  Dette R3 wire : non wired actuellement. Exposé pour wire futur. */
export function RunOnReturnToFieldMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_RETURN_TO_FIELD');
  if (!label) return;
  console.log(`[script-runtime] RunOnReturnToFieldMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `RunOnDiveWarpMapScript()` (script.c:348) :
 *      MapHeaderRunScriptType(MAP_SCRIPT_ON_DIVE_WARP);
 *  Appelé lors d'un dive warp (= overworld.c:766).
 *  Dette R3 wire : Dive subsystem non porté côté field. Exposé pour wire futur. */
export function RunOnDiveWarpMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_DIVE_WARP');
  if (!label) return;
  console.log(`[script-runtime] RunOnDiveWarpMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `MapHeaderRunScriptType(u8 tag)` (script.c:292-297) :
 *      u8 *ptr = MapHeaderGetScriptTable(tag);
 *      if (ptr) RunScriptImmediately(ptr);
 *  Notre port : tag est une string ('MAP_SCRIPT_ON_LOAD' etc.) car `findMapScriptLabel`
 *  travaille avec des opcodes string-encoded. Exposé pour callers décomp qui
 *  utilisent ce nom direct. */
export function MapHeaderRunScriptType(tag: string): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, tag);
  if (!label) return;
  RunScriptImmediately(label);
}

/** 1:1 décomp `MapHeaderCheckScriptTable(MAP_SCRIPT_ON_FRAME_TABLE)`
 *  (script.c:299). Iterate les entries `map_script_2 VAR_X, value, scriptLabel`
 *  du table. Pour chaque entry : si VarGet(VAR_X) === value → SetupScript +
 *  return TRUE (= 1er match wins, comme decomp).
 *
 *  Polled chaque frame depuis MainCB2_Overworld. Ne re-trigger PAS si script
 *  déjà running (= sGlobalScriptContextStatus check). 1:1 décomp décrémente
 *  VAR à zéro après trigger pour éviter re-trigger ; nos scripts font
 *  `setvar VAR_LITTLEROOT_INTRO_STATE, X+1` pour avancer le state. */
export function TryRunOnFrameMapScript(): boolean {
  // Skip si script déjà actif (= sinon race condition / re-trigger en boucle).
  // ⚠️ statut du byte-VM (BV), PAS du contexte parsé mort : sinon la gate ne bloque
  // JAMAIS → un OnFrame avec wait (movement/msgbox) avant son setvar de state se
  // relance chaque frame (ScriptContext_SetupScript reset le script) → intro/cutscenes
  // cassées. Même résidu de clean que le bug snapshot/restore + ScriptContext_Enable.
  if (BV._getGlobalStatus() !== CONTEXT_SHUTDOWN) return false;
  if (!gMapHeader?.mapScripts) return false;
  const tableLabel = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_FRAME_TABLE');
  if (!tableLabel) return false;
  const opcodes = _scriptsByLabel.get(tableLabel);
  if (!opcodes) return false;
  for (const op of opcodes) {
    if (op.name !== 'map_script_2') continue;
    const [varName, valueTok, scriptLabel] = op.args;
    if (!varName || !valueTok || !scriptLabel) continue;
    // Audit session 126 fix B5 : avant `expected = Number(valueTok) ?? 0`
    // → si valueTok = "MALE" / "FEMALE" / "METATILE_X", parsing échoue
    // silencieusement → 0, et VarGet(varName) match 0 par accident → wrong
    // script fired. 1:1 décomp event_data.c:VarGet(id) returns id si pas une
    // var ; resolveDecompConstant idem pour les constants C compile-time.
    const expected = VarGet(valueTok);
    if (VarGet(varName) === expected) {
      console.log(`[script-runtime] OnFrame match : ${varName}=${expected} → ${scriptLabel}`);
      // 1:1 décomp : OnFrame scripts can have waits (msgbox, applymovement +
      // waitmovement, etc.). Use ScriptContext_SetupScript (= global ctx with
      // wait support) plutôt que RunScriptImmediately (= sync, ne supporte
      // pas les waits).
      ScriptContext_SetupScript(scriptLabel);
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `TryRunOnWarpIntoMapScript()` (script.c:364).
 *  Run le script `MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE` SI le var match.
 *  Comme OnFrame mais utilise `RunScriptImmediately` (= sync, no waits — typically
 *  setobjectxy / setflag pour positionner NPCs). À call APRÈS spawn NPCs.
 *
 *  Audit Littleroot A2 : ce dispatcher manquait → BrendansHouse_2F_OnWarp jamais
 *  fire → décorations chambre 2F absentes. Idem pour LittlerootTown_OnWarp qui
 *  set Rival/Birch positions pour DexUpgrade scene.
 *
 *  Note importante : sGlobalScriptContextStatus check skip l'exécution si un
 *  script tourne déjà — typique au warp arrival, sGlobalScriptContext est
 *  freshly setup. Ce check protège des call superflus. */
export function TryRunOnWarpIntoMapScript(): boolean {
  // 1:1 décomp : NE check PAS le script status — RunScriptImmediately est sync,
  // ne va pas conflicter. Mais notre RunScriptImmediately appelle ctx pas global.
  if (!gMapHeader?.mapScripts) return false;
  const tableLabel = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE');
  if (!tableLabel) return false;
  const opcodes = _scriptsByLabel.get(tableLabel);
  if (!opcodes) return false;
  // Iter map_script_2 entries comme MapHeaderCheckScriptTable (script.c:299).
  for (const op of opcodes) {
    if (op.name !== 'map_script_2') continue;
    const [varName, valueTok, scriptLabel] = op.args;
    if (!varName || !valueTok || !scriptLabel) continue;
    const expected = /^-?\d+$/.test(valueTok) ? Number(valueTok) : 0;
    if (VarGet(varName) === expected) {
      console.log(`[script-runtime] OnWarpIntoMap match : ${varName}=${expected} → ${scriptLabel}`);
      // 1:1 décomp `RunScriptImmediately(ptr)` — sync run, no waits.
      RunScriptImmediately(scriptLabel);
      return true;
    }
  }
  return false;
}

/** Coord trigger : check si player est sur une coord_event qui match VAR.
 *  À call chaque step end depuis PlayerStep. 1:1 décomp `TryRunCoordEventScript`
 *  (field_control_avatar.c) qui iterate gMapHeader.events.coordEvents et trigger
 *  si player at (x, y) AND var_name == var_value. */
export function TryRunCoordEventScript(playerX: number, playerY: number): boolean {
  // Statut byte-VM (cf TryRunOnFrameMapScript) — PAS le contexte parsé mort, sinon
  // un coord-event peut re-trigger pendant qu'un script tourne.
  if (BV._getGlobalStatus() !== CONTEXT_SHUTDOWN) return false;
  // 1:1 décomp `gMapHeader.events->coordEvents` (= struct MapEvents).
  const coordEvents = gMapHeader?.events?.coordEvents;
  if (!coordEvents || coordEvents.length === 0) return false;
  for (const ce of coordEvents) {
    if (ce.x !== playerX || ce.y !== playerY) continue;
    // 1:1 décomp `TryRunCoordEventScript` (field_control_avatar.c:877) :
    //   if (coordEvent->script == NULL) { DoCoordEventWeather(coordEvent->trigger); return NULL; }
    // Un coord event SANS script = un trigger MÉTÉO (Route 113 ash : `trigger` =
    // COORD_EVENT_WEATHER_*). Dispatché via hook (évite le cycle ESM script-runtime ↔
    // field_weather_effect ↔ player-avatar ↔ script-runtime).
    if (!ce.script) {
      if (_doCoordEventWeatherHook) _doCoordEventWeatherHook(ce.trigger);
      return false;
    }
    // Trigger var var_value matching : si trigger = '' → always trigger ;
    // sinon check VarGet(trigger) === index.
    if (ce.trigger && VarGet(ce.trigger) !== ce.index) continue;
    console.log(`[script-runtime] CoordEvent at (${playerX},${playerY}) match : ${ce.script}`);
    // SetIntroFlags doesn't have waits, but be safe: use SetupScript pour
    // supporter les scripts avec applymovement / msgbox.
    ScriptContext_SetupScript(ce.script);
    return true;
  }
  return false;
}

// Setup le hook map-loader → ce module. À call au boot une seule fois.
import { setOnLoadMapScriptHook, gMapHeader } from './fieldmap';
setOnLoadMapScriptHook(RunOnLoadMapScript);

// Hook DoCoordEventWeather (game/coord_event_weather) — posé par ce module au boot via
// `setDoCoordEventWeatherHook`. Découple TryRunCoordEventScript du sous-système météo
// (sinon cycle ESM via field_weather_effect → player-avatar → script-runtime).
let _doCoordEventWeatherHook: ((coordEventWeather: string | number) => void) | null = null;
/** Enregistre le dispatcher météo des coord events (= game/coord_event_weather.DoCoordEventWeather,
 *  wrappé pour résoudre la constante COORD_EVENT_WEATHER_* string → id). */
export function setDoCoordEventWeatherHook(fn: (coordEventWeather: string | number) => void): void {
  _doCoordEventWeatherHook = fn;
}

// ─── Expose pour debug ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__scriptRuntime = {
  sGlobalScriptContext,
  scripts: _scriptsByLabel,
  texts: _textsByLabel,
  // Statut du byte-VM (le SEUL moteur) — pas le contexte parsé mort (qui resterait
  // figé à SHUTDOWN) → scope.script().status reflète l'état réel du script en cours.
  status: () => BV._getGlobalStatus(),
  // Session 133 add : helpers pour devtool scope.script() enrichi.
  getCurrentLabel: () => _currentScriptLabel,
  getCurrentOpcodeIdx: () => sGlobalScriptContext.scriptIdx,
  getRemainingOpcodes: () => {
    const ops = sGlobalScriptContext.scriptOpcodes;
    return ops ? Math.max(0, ops.length - sGlobalScriptContext.scriptIdx) : 0;
  },
  getCurrentOpcode: () => {
    const ops = sGlobalScriptContext.scriptOpcodes;
    if (!ops || sGlobalScriptContext.scriptIdx >= ops.length) return null;
    const op = ops[sGlobalScriptContext.scriptIdx];
    return { name: op.name, args: op.args };
  },
  // Vérif DÉTERMINISTE du fix "préserve ScriptContext au retour-field" :
  // snapshot/restore/init/enable exposés pour prouver (anti-eyeball) que
  // ScriptContext_Init wipe le ctx ET que Restore le ramène 1:1.
  snapshot: ScriptContext_Snapshot,
  restore: ScriptContext_Restore,
  init: ScriptContext_Init,
  enable: ScriptContext_Enable,
  // Audit opcodes (campagne 1:1) : invoquer un handler en isolation pour vérif
  // déterministe d'un opcode (ex. gotostd_if condition, random RNG).
  getOpcodeHandler,
};
