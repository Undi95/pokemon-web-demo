/**
 * script.ts — moteur de script overworld, 1:1 de `src/script.c`.
 *
 * VRAIE VM bytecode (byte-VM = le SEUL moteur). Seule adaptation irréplicable (pas
 * d'espace d'adresses ROM) : `const u8 *scriptPtr` → curseur `{ buf, off }`. Les
 * pointeurs de script (goto/call) sont des OFFSETS dans l'image globale (cf.
 * scripts/compile-scripts.cjs / docs/BYTE-VM-PLAN.md). Les pointeurs vers ressources
 * irréplicables (texte/mouvement/natif/RAM) = ids de symboles résolus par les handlers.
 *
 * Contenu (= tout `script.c`) :
 *   - VM core : RunScriptCommand, gScriptCmdTable, ScriptRead{Byte,Halfword,Word},
 *     Script{Jump,Call,Return}, ScriptContext_* (contexte global + immédiat), snapshot.
 *   - Lock/Unlock contrôles joueur (flag unifié globalThis).
 *   - Loader de l'image bytecode (label → offset) + DONNÉES map-script chargées en JSON
 *     (notre adaptation : scripts/texts/movements pré-extraits par map).
 *   - Triggers `RunOn*MapScript` / `TryRun*` (1:1 script.c + fieldmap.c).
 *
 * API publique pointeur : un « pointeur de script » est représenté soit par un LABEL
 * (string = point d'entrée, notre représentation), soit par un `ScriptPtr` (curseur).
 * `ScriptContext_SetupScript` / `RunScriptImmediately` acceptent les deux.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/script.c (1:1).
 */

import { VarGet } from './engine/script/script-vars';
// Migration TEXTE byte-level 1:1 (flip direct) : getText retourne des bytes charmap
// (data source lisible → encodée au 1er accès via encodeOwText = notre préproc, cache).
import { encodeOwText, isOwCharmapReady } from '../include/text';

// ─── enums (1:1 script.c:11-21) ──────────────────────────────────────────────
export const SCRIPT_MODE_STOPPED = 0;
export const SCRIPT_MODE_BYTECODE = 1;
export const SCRIPT_MODE_NATIVE = 2;

export const CONTEXT_RUNNING = 0;
export const CONTEXT_WAITING = 1;
export const CONTEXT_SHUTDOWN = 2;

// ─── scriptPtr : curseur (remplace const u8*) ────────────────────────────────
/** Curseur dans un buffer de bytecode (image globale, RAM script, ou event injecté). */
export interface ScriptPtr { buf: Uint8Array; off: number; }

/** ScrCmdFunc — un handler lit ses args via ScriptRead* et renvoie TRUE pour wait. */
export type ScrCmdFunc = (ctx: ScriptContext) => boolean;

// ─── struct ScriptContext (1:1 include/script.h:9-20) ────────────────────────
export interface ScriptContext {
  stackDepth: number;            // u8
  mode: number;                  // u8
  comparisonResult: number;      // u8
  nativePtr: (() => boolean) | null;
  scriptPtr: ScriptPtr | null;   // const u8*
  stack: (ScriptPtr | null)[];   // const u8*[20]
  cmdTable: ScrCmdFunc[];        // ScrCmdFunc*
  cmdTableEnd: number;           // index de fin (= longueur de la table)
  data: number[];                // u32[4]
}

/** Une opcode map-script chargée en JSON (= "msgbox X, MSGBOX_NPC" →
 *  { name: 'msgbox', args: ['X', 'MSGBOX_NPC'] }). Notre adaptation : les tables de
 *  triggers (map_script_2) + le data-loader travaillent sur ces opcodes string-encodés
 *  (pas le bytecode), car ce sont des DONNÉES lues au runtime, pas du flux exécuté. */
export interface Opcode {
  name: string;
  args: string[];
}

const STACK_SIZE = 20;
const DATA_SIZE = 4;

// La table de commandes globale (gScriptCmdTable) : 227 handlers indexés par cmdId.
// Remplie par scrcmd.ts (installByteVmHandlers) ; les slots non portés restent `null`.
export const gScriptCmdTable: (ScrCmdFunc | null)[] = new Array(227).fill(null);
export const gScriptCmdTableEnd = gScriptCmdTable.length;

// ─── module state (1:1 script.c:25-28) ───────────────────────────────────────
let sGlobalScriptContextStatus = CONTEXT_SHUTDOWN;
const sGlobalScriptContext: ScriptContext = createContext();
const sImmediateScriptContext: ScriptContext = createContext();
// Lock de contrôles joueur UNIFIÉ via globalThis : combat/warp/global peuvent appeler
// Lock/Unlock depuis plusieurs chemins ; un flag partagé élimine la désync dual-flag.
const _GLK = globalThis as Record<string, unknown>;

function createContext(): ScriptContext {
  return {
    stackDepth: 0, mode: SCRIPT_MODE_STOPPED, comparisonResult: 0,
    nativePtr: null, scriptPtr: null,
    stack: new Array(STACK_SIZE).fill(null),
    cmdTable: gScriptCmdTable as ScrCmdFunc[], cmdTableEnd: gScriptCmdTableEnd,
    data: new Array(DATA_SIZE).fill(0),
  };
}

// ─── InitScriptContext (1:1 script.c:34-50) ──────────────────────────────────
export function InitScriptContext(ctx: ScriptContext, cmdTable: ScrCmdFunc[], cmdTableEnd: number): void {
  ctx.mode = SCRIPT_MODE_STOPPED;
  ctx.scriptPtr = null;
  ctx.stackDepth = 0;
  ctx.nativePtr = null;
  ctx.cmdTable = cmdTable;
  ctx.cmdTableEnd = cmdTableEnd;
  for (let i = 0; i < DATA_SIZE; i++) ctx.data[i] = 0;
  for (let i = 0; i < STACK_SIZE; i++) ctx.stack[i] = null;
}

// ─── SetupBytecodeScript (1:1 script.c:52-57) ────────────────────────────────
export function SetupBytecodeScript(ctx: ScriptContext, ptr: ScriptPtr): number {
  ctx.scriptPtr = ptr;
  ctx.mode = SCRIPT_MODE_BYTECODE;
  return 1;
}

// ─── SetupNativeScript (1:1 script.c:59-63) ──────────────────────────────────
export function SetupNativeScript(ctx: ScriptContext, ptr: () => boolean): void {
  ctx.mode = SCRIPT_MODE_NATIVE;
  ctx.nativePtr = ptr;
}

// ─── StopScript (1:1 script.c:65-69) ─────────────────────────────────────────
export function StopScript(ctx: ScriptContext): void {
  ctx.mode = SCRIPT_MODE_STOPPED;
  ctx.scriptPtr = null;
}

// ─── RunScriptCommand (1:1 script.c:71-125) ──────────────────────────────────
export function RunScriptCommand(ctx: ScriptContext): boolean {
  if (ctx.mode === SCRIPT_MODE_STOPPED)
    return false;

  // 1:1 script.c switch(mode) avec fallthrough NATIVE→BYTECODE, rendu en if/else
  // (TS interdit le fallthrough de case ; logique strictement identique).
  if (ctx.mode === SCRIPT_MODE_NATIVE) {
    // Try to call a function in C ; continue to bytecode si pas de fn ou si TRUE.
    if (ctx.nativePtr) {
      if (ctx.nativePtr() === true)
        ctx.mode = SCRIPT_MODE_BYTECODE;
      return true;
    }
    ctx.mode = SCRIPT_MODE_BYTECODE;
    // fallthrough → SCRIPT_MODE_BYTECODE
  }

  // SCRIPT_MODE_BYTECODE
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!ctx.scriptPtr) {
      ctx.mode = SCRIPT_MODE_STOPPED;
      return false;
    }
    // (script.c:103-107 : gNullScriptPtr → HALT. N/A : pas de pointeur ROM
    //  sentinelle chez nous ; un scriptPtr null est déjà géré ci-dessus.)

    const cmdCode = ctx.scriptPtr.buf[ctx.scriptPtr.off];
    ctx.scriptPtr.off++;

    // func = &cmdTable[cmdCode] ; if (func >= cmdTableEnd) stop.
    if (cmdCode >= ctx.cmdTableEnd) {
      ctx.mode = SCRIPT_MODE_STOPPED;
      return false;
    }
    const func = ctx.cmdTable[cmdCode];
    if (!func) {
      // Handler pas encore porté : arrêt propre + signal une fois.
      warnMissingCmd(cmdCode);
      ctx.mode = SCRIPT_MODE_STOPPED;
      return false;
    }

    if (func(ctx) === true)
      return true;
  }
}

const _warnedCmd = new Set<number>();
function warnMissingCmd(cmdCode: number): void {
  if (_warnedCmd.has(cmdCode)) return;
  _warnedCmd.add(cmdCode);
  console.warn(`[byte-vm] cmd 0x${cmdCode.toString(16)} non porté (handler null)`);
}

// ─── stack (1:1 script.c:127-148) ────────────────────────────────────────────
function ScriptPush(ctx: ScriptContext, ptr: ScriptPtr | null): boolean {
  if (ctx.stackDepth + 1 >= STACK_SIZE) {
    return true;
  } else {
    // Snapshot par valeur (const u8* = valeur en C) : copie {buf, off}.
    ctx.stack[ctx.stackDepth] = ptr ? { buf: ptr.buf, off: ptr.off } : null;
    ctx.stackDepth++;
    return false;
  }
}

function ScriptPop(ctx: ScriptContext): ScriptPtr | null {
  if (ctx.stackDepth === 0)
    return null;
  ctx.stackDepth--;
  return ctx.stack[ctx.stackDepth];
}

// ─── ScriptJump / ScriptCall / ScriptReturn (1:1 script.c:150-164) ───────────
export function ScriptJump(ctx: ScriptContext, ptr: ScriptPtr): void {
  ctx.scriptPtr = ptr;
}

export function ScriptCall(ctx: ScriptContext, ptr: ScriptPtr): void {
  ScriptPush(ctx, ctx.scriptPtr);
  ctx.scriptPtr = ptr;
}

export function ScriptReturn(ctx: ScriptContext): void {
  ctx.scriptPtr = ScriptPop(ctx);
}

// ─── ScriptRead{Byte,Halfword,Word} (1:1 script.h:22 + script.c:166-180) ─────
/** `*(ctx->scriptPtr++)` (macro ScriptReadByte). */
export function ScriptReadByte(ctx: ScriptContext): number {
  const p = ctx.scriptPtr!;
  const v = p.buf[p.off];
  p.off++;
  return v;
}

export function ScriptReadHalfword(ctx: ScriptContext): number {
  const p = ctx.scriptPtr!;
  let value = p.buf[p.off]; p.off++;
  value |= p.buf[p.off] << 8; p.off++;
  return value;
}

export function ScriptReadWord(ctx: ScriptContext): number {
  const p = ctx.scriptPtr!;
  const value0 = p.buf[p.off]; p.off++;
  const value1 = p.buf[p.off]; p.off++;
  const value2 = p.buf[p.off]; p.off++;
  const value3 = p.buf[p.off]; p.off++;
  return ((((((value3 << 8) + value2) << 8) + value1) << 8) + value0) >>> 0;
}

// ─── Lock / Unlock 1:1 décomp (script.c:182-195) ─────────────────────────────
export function LockPlayerFieldControls(): void { _GLK.__sLockFieldControls = true; }
export function UnlockPlayerFieldControls(): void { _GLK.__sLockFieldControls = false; }
export function ArePlayerFieldControlsLocked(): boolean { return _GLK.__sLockFieldControls === true; }

// ─── ScriptContext_* (contexte global) (1:1 script.c:201-260) ────────────────
export function ScriptContext_IsEnabled(): boolean {
  return sGlobalScriptContextStatus === CONTEXT_RUNNING;
}

export function ScriptContext_Init(): void {
  InitScriptContext(sGlobalScriptContext, gScriptCmdTable as ScrCmdFunc[], gScriptCmdTableEnd);
  sGlobalScriptContextStatus = CONTEXT_SHUTDOWN;
  // SWAP-safety : réinit du contexte = aucun script ⇒ déverrouille le lock-script.
  // Au retour de combat / map-load, le contexte est reset à SHUTDOWN ; sans ça un lock
  // posé pendant le script déclencheur (dowildbattle/trainerbattle) reste fantôme →
  // joueur figé. Init n'est appelé qu'au reset (pas chaque frame) → n'interfère ni avec
  // la marche ni la séquence de warp (le lock d'animation de porte précède le map-load).
  UnlockPlayerFieldControls();
}

export function ScriptContext_RunScript(): boolean {
  if (sGlobalScriptContextStatus === CONTEXT_SHUTDOWN)
    return false;
  if (sGlobalScriptContextStatus === CONTEXT_WAITING)
    return false;

  LockPlayerFieldControls();

  if (!RunScriptCommand(sGlobalScriptContext)) {
    sGlobalScriptContextStatus = CONTEXT_SHUTDOWN;
    UnlockPlayerFieldControls();
    return false;
  }
  return true;
}

// Session 133 : track current label pour devtool scope.script() debug.
let _currentScriptLabel: string | null = null;

/** 1:1 décomp `ScriptContext_SetupScript(const u8 *ptr)`. Adapté : accepte un LABEL
 *  (string = point d'entrée = notre représentation d'un pointeur) OU un `ScriptPtr`
 *  (curseur direct, utilisé par les devtools avec du bytecode synthétique). */
export function ScriptContext_SetupScript(ptrOrLabel: ScriptPtr | string): boolean {
  const ptr = typeof ptrOrLabel === 'string' ? ptrFromLabel(ptrOrLabel) : ptrOrLabel;
  if (!ptr) { console.warn(`[byte-vm] script '${ptrOrLabel}' absent de l'image`); return false; }
  InitScriptContext(sGlobalScriptContext, gScriptCmdTable as ScrCmdFunc[], gScriptCmdTableEnd);
  SetupBytecodeScript(sGlobalScriptContext, ptr);
  LockPlayerFieldControls();
  sGlobalScriptContextStatus = CONTEXT_RUNNING;
  _currentScriptLabel = typeof ptrOrLabel === 'string' ? ptrOrLabel : null;
  return true;
}

/** Devtools : monte un native-script inline (tickFn pollé jusqu'à TRUE) sur le contexte
 *  GLOBAL → tické chaque frame par ScriptContext_RunScript (mode NATIVE). Utilisé par
 *  dev.starter.choose() etc. */
export function ScriptContext_SetupInlineNative(tickFn: () => boolean): boolean {
  InitScriptContext(sGlobalScriptContext, gScriptCmdTable as ScrCmdFunc[], gScriptCmdTableEnd);
  SetupNativeScript(sGlobalScriptContext, tickFn);
  LockPlayerFieldControls();
  sGlobalScriptContextStatus = CONTEXT_RUNNING;
  return true;
}

/** Devtools-only : setup un script inline composé d'opcodes PARSÉS pré-construits.
 *  NON SUPPORTÉ par le byte-VM (il exécute du BYTECODE, pas des Opcode[]) : assembler un
 *  opcode isolé exigerait l'assembleur build-time (CJS, absent du navigateur). On warn
 *  (devtool scope.action). Pour un vrai script : __byteVm.launchScript(label). */
export function ScriptContext_SetupInlineBytecode(opcodes: Opcode[], devLabel = 'inline'): boolean {
  console.warn(`[byte-vm] scope.action('${devLabel}', ${opcodes.length} op) non supporté : ` +
    `le byte-VM n'exécute pas d'Opcode[] parsés. Utilise __byteVm.launchScript(label).`);
  return false;
}

export function ScriptContext_Stop(): void {
  sGlobalScriptContextStatus = CONTEXT_WAITING;
}

export function ScriptContext_Enable(): void {
  sGlobalScriptContextStatus = CONTEXT_RUNNING;
  LockPlayerFieldControls();
}
// Pont anti-cycle : field_specials (StopCameraShake, 1:1 field_specials.c:1505) réactive le
// contexte script via ce pont plutôt qu'un import statique `./script` — une nouvelle arête
// depuis field_specials (module éval tôt) réordonnerait l'éval ESM → TDZ. Même philosophie que
// `__SignalWaitState` (scrcmd.ts) et le no-op ShakeCamera historique qui prescrivait ce pont.
(globalThis as Record<string, unknown>).__ScriptContext_Enable = ScriptContext_Enable;

// ─── Snapshot / Restore du ScriptContext global ──────────────────────────────
// Préserve le contexte SUSPENDU (scriptPtr + nativePtr + pile + data + status) à travers
// un re-init complet du field. `_restoreOverworldFromMenu` fait loadAndInitMap →
// ScriptContext_Init (reset TOTAL) ; sans snapshot/restore, le script déclencheur en
// attente (= `pokemart` waitstate, `special ChooseStarter`, `special Bag_ChooseBerry`)
// serait détruit et ne reprendrait jamais.
// ⚠️ CRITIQUE : capturer `nativePtr` (closure JS du poll natif) + `scriptPtr` (curseur).
export interface ByteVmScriptCtxSnapshot {
  mode: number;
  scriptPtr: ScriptPtr | null;
  stack: (ScriptPtr | null)[];
  stackDepth: number;
  nativePtr: (() => boolean) | null;
  comparisonResult: number;
  data: number[];
  status: number;
}
/** Alias historique (= ce que les consommateurs overworld importent). */
export type ScriptCtxSnapshot = ByteVmScriptCtxSnapshot;

export function ScriptContext_Snapshot(): ByteVmScriptCtxSnapshot {
  const c = sGlobalScriptContext;
  return {
    mode: c.mode,
    scriptPtr: c.scriptPtr ? { buf: c.scriptPtr.buf, off: c.scriptPtr.off } : null,
    stack: c.stack.map((p) => (p ? { buf: p.buf, off: p.off } : null)),
    stackDepth: c.stackDepth,
    nativePtr: c.nativePtr,
    comparisonResult: c.comparisonResult,
    data: c.data.slice(),
    status: sGlobalScriptContextStatus,
  };
}

export function ScriptContext_Restore(s: ByteVmScriptCtxSnapshot): void {
  const c = sGlobalScriptContext;
  c.mode = s.mode;
  c.scriptPtr = s.scriptPtr ? { buf: s.scriptPtr.buf, off: s.scriptPtr.off } : null;
  c.stackDepth = s.stackDepth;
  c.nativePtr = s.nativePtr;
  c.comparisonResult = s.comparisonResult;
  for (let i = 0; i < c.stack.length; i++) c.stack[i] = s.stack[i] ?? null;
  for (let i = 0; i < c.data.length; i++) c.data[i] = s.data[i] ?? 0;
  sGlobalScriptContextStatus = s.status;
}

// ─── RunScriptImmediately (1:1 script.c:265-270) ─────────────────────────────
/** Run synchrone (= OnTransition / OnLoad / OnWarp). Adapté : accepte un LABEL ou un
 *  `ScriptPtr` (cf ScriptContext_SetupScript). */
export function RunScriptImmediately(ptrOrLabel: ScriptPtr | string): void {
  const ptr = typeof ptrOrLabel === 'string' ? ptrFromLabel(ptrOrLabel) : ptrOrLabel;
  if (!ptr) { console.warn(`[byte-vm] RunScriptImmediately: '${ptrOrLabel}' absent de l'image`); return; }
  InitScriptContext(sImmediateScriptContext, gScriptCmdTable as ScrCmdFunc[], gScriptCmdTableEnd);
  SetupBytecodeScript(sImmediateScriptContext, ptr);
  // eslint-disable-next-line no-empty
  while (RunScriptCommand(sImmediateScriptContext) === true) { /* run jusqu'à fin */ }
}

/** Helper : run synchrone par label (renvoie false si le label est absent de l'image). */
export function RunScriptImmediatelyByLabel(label: string): boolean {
  const ptr = ptrFromLabel(label);
  if (!ptr) { console.warn(`[byte-vm] script introuvable: ${label}`); return false; }
  RunScriptImmediately(ptr);
  return true;
}

// Accès interne (pour le loader / les handlers).
export function _getGlobalContext(): ScriptContext { return sGlobalScriptContext; }
export function _getGlobalStatus(): number { return sGlobalScriptContextStatus; }

// ─────────────────────────────────────────────────────────────────────────────
// Loader de l'image bytecode (cf. scripts/compile-scripts.cjs)
// L'image globale + les tables de symboles sont chargées une fois ; les pointeurs de
// script sont des offsets dans cette image (= adresses ROM).
// ─────────────────────────────────────────────────────────────────────────────
export interface ByteVmSymbol { kind: string; label: string; }

let gScriptImage: Uint8Array = new Uint8Array(0);
let _scriptOffsets: Record<string, number> = {};
let _symbols: ByteVmSymbol[] = [];
let _mapSymbols: string[] = [];
let _mapScriptTables: Record<string, { name: string; args: string[] }[]> = {};
let _loaded = false;

function _b64ToU8(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  // Node (tests) : Buffer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Uint8Array.from((globalThis as any).Buffer.from(b64, 'base64'));
}

export async function loadByteVmImage(url = '/decomp/em/script-bytecode.json'): Promise<void> {
  if (_loaded) return;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`[byte-vm] image HTTP ${r.status}`);
  const j = await r.json();
  gScriptImage = _b64ToU8(j.image);
  _scriptOffsets = j.scriptOffsets ?? {};
  _offsetToLabel = null;   // invalide le cache reverse (réutilisé par getLabelAtOffset)
  _symbols = j.symbols ?? [];
  _mapSymbols = j.mapSymbols ?? [];
  _mapScriptTables = j.mapScriptTables ?? {};
  _loaded = true;
  console.log(`[byte-vm] image chargée : ${gScriptImage.length} octets, ${Object.keys(_scriptOffsets).length} scripts, ${_symbols.length} symboles`);
}

export function isByteVmLoaded(): boolean { return _loaded; }
export function getScriptImage(): Uint8Array { return gScriptImage; }
export function resolveSymbol(id: number): ByteVmSymbol | undefined { return _symbols[id]; }
export function getSymbols(): ByteVmSymbol[] { return _symbols; }
export function resolveMapSymbol(id: number): string | undefined { return _mapSymbols[id]; }
export function getMapSymbols(): string[] { return _mapSymbols; }
export function getScriptOffset(label: string): number | undefined { return _scriptOffsets[label]; }
export function getMapScriptTable(label: string): { name: string; args: string[] }[] | undefined { return _mapScriptTables[label]; }

/** Reverse lookup offset → label (1er label à cet offset). Utilisé par les handlers dont
 *  l'argument pointeur cible une donnée référencée par label DANS l'image (= reloc offset,
 *  pas symbole synthétique) : ScrCmd_pokemart pointe vers une liste mart (label_Pokemart). */
let _offsetToLabel: Map<number, string> | null = null;
export function getLabelAtOffset(off: number): string | undefined {
  if (!_offsetToLabel) {
    _offsetToLabel = new Map();
    for (const label of Object.keys(_scriptOffsets)) {
      const o = _scriptOffsets[label];
      if (!_offsetToLabel.has(o)) _offsetToLabel.set(o, label);
    }
  }
  return _offsetToLabel.get(off);
}

/** Curseur vers un offset de l'image globale (= déréf d'un pointeur de script). */
export function ptrFromOffset(off: number): ScriptPtr { return { buf: gScriptImage, off }; }

/** Curseur au point d'entrée d'un script nommé (label → offset image). */
export function ptrFromLabel(label: string): ScriptPtr | null {
  const off = _scriptOffsets[label];
  return off === undefined ? null : { buf: gScriptImage, off };
}

// ═════════════════════════════════════════════════════════════════════════════
// DONNÉES map-script (notre adaptation : scripts/texts/movements pré-extraits par map,
// servis en JSON depuis /decomp/em/scripts/). Le data-loader peuple les libs ci-dessous ;
// les triggers map-script (RunOn*/TryRun*) les lisent. L'EXÉCUTION passe par l'image
// bytecode (ptrFromLabel) ; ces tables fournissent texts/movements + tables de triggers.
// ═════════════════════════════════════════════════════════════════════════════

// Script library : labels → array of opcodes. Loaded au map switch.
let _scriptsByLabel: Map<string, Opcode[]> = new Map();
// Texts library : label → raw text string.
let _textsByLabel: Map<string, string> = new Map();   // source lisible (1:1 `_("…")`)
let _textBytesCache: Map<string, Uint8Array> = new Map();  // encodée (notre préproc), invalidée au load
// Movements library : extracted comme "scripts" dans le JSON, mais ce sont des movement
// label sequences (e.g. "LittlerootTown_Movement_X" → ["walk_up", "step_end"]).
let _movementsByLabel: Map<string, string[]> = new Map();

/** Format JSON d'une map :
 *    { scripts: { label: [opcodeStr, ...], ... }, texts: { label: rawText, ... } }
 *  Les "scripts" peuvent être en fait des movement sequences. On classe par contenu :
 *  si toutes les entries sont des single-word strings sans args et finissent par
 *  "step_end", c'est un movement. */
interface MapScriptsJson {
  scripts: Record<string, string[]>;
  texts: Record<string, string>;
}

function classifyAsMovement(lines: string[]): boolean {
  if (lines.length === 0) return false;
  const last = lines[lines.length - 1].trim();
  if (last !== 'step_end' && last !== 'face_default' && last !== 'walk_in_place_down')
    return false;
  // Movement actions sont single-word ou avec un nombre (= delay_8, delay_16). Opcodes
  // ont typiquement des args avec virgules ou underscores plus complexes.
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
 *  Source : `public/decomp/em/scripts/_common.json`. */
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

/** Charge les scripts d'une map depuis le JSON pré-extrait + merge _common.json. */
export async function loadMapScripts(mapName: string): Promise<void> {
  // S'assurer que le moteur byte-VM (image + handlers + specials) est installé AVANT de
  // charger les données de map. Import dynamique = même instance live (pas de cycle
  // statique script→scrcmd via bytevm-boot).
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

  // Merge order : map-specific scripts override common ones (rare). Common load FIRST
  // permet aux scripts map-specific de réutiliser les Common_* labels.
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
/** 1:1 décomp : un script charge un `const u8 *` (bytes charmap) par label. La data source
 *  reste lisible (`_textsByLabel`, comme `_("…")`) ; on l'encode en bytes au 1er accès (=
 *  notre préproc, `encodeOwText`) avec cache. Si la charmap n'est pas encore prête, on
 *  encode sans cacher (ré-encodage propre ensuite). */
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

/** Audit session 126 LOT C10 : ensure common scripts are loaded. Public accessor pour
 *  modules qui doivent run un script common avant que la 1ère map soit loaded. */
export async function ensureCommonScriptsLoaded(): Promise<void> {
  await _loadCommonScripts();
}

// Register movement label resolver vers movement-system (side-effect import).
import { setMovementLabelResolver } from './engine/field/movement-system';
setMovementLabelResolver((label: string) => _movementsByLabel.get(label) ?? null);

// ─── Map script hooks (= 1:1 décomp `RunOn*MapScript`) ──────────────────────
//
// Le `mapScripts` field de gMapHeader pointe vers un label "MapScripts" qui contient une
// liste d'opcodes `map_script TYPE, scriptLabel`. On parse cette liste pour trouver le
// scriptLabel correspondant à un type donné, puis on run ce scriptLabel.
//
// Types supportés (1:1 décomp constants/map_scripts.h) :
//   MAP_SCRIPT_ON_LOAD / ON_TRANSITION / ON_FRAME_TABLE / ON_RESUME /
//   ON_WARP_INTO_MAP_TABLE / ON_DIVE_WARP

/** Find le scriptLabel d'un type donné dans le mapScripts table. */
function findMapScriptLabel(mapScriptsLabel: string, scriptType: string): string | null {
  // Le mapScripts table est stocké comme un script regular (= entrée dans _scriptsByLabel)
  // avec opcodes `map_script TYPE, label`.
  const opcodes = _scriptsByLabel.get(mapScriptsLabel);
  if (!opcodes) return null;
  for (const opcode of opcodes) {
    if (opcode.name === 'map_script' && opcode.args[0] === scriptType) {
      return opcode.args[1] ?? null;
    }
  }
  return null;
}

/** 1:1 décomp `RunOnLoadMapScript()` (fieldmap.c). Run le script `MAP_SCRIPT_ON_LOAD` de
 *  la current map. Appelé par `InitMap` via le hook `setOnLoadMapScriptHook`. */
export function RunOnLoadMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const onLoadLabel = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_LOAD');
  if (!onLoadLabel) return;
  console.log(`[script-runtime] RunOnLoadMapScript : ${onLoadLabel}`);
  RunScriptImmediately(onLoadLabel);
}

/** 1:1 décomp `RunOnTransitionMapScript()` (fieldmap.c). Run `MAP_SCRIPT_ON_TRANSITION`.
 *  Appelé après warp, pour positionner les NPCs selon plot state. */
export function RunOnTransitionMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_TRANSITION');
  if (!label) return;
  console.log(`[script-runtime] RunOnTransitionMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `RunOnResumeMapScript()` (script.c:338). Appelé sur retour à l'overworld
 *  depuis menu/battle. Dette R3 wire : nos CB2 swap ne call pas encore cet hook. */
export function RunOnResumeMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_RESUME');
  if (!label) return;
  console.log(`[script-runtime] RunOnResumeMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `RunOnReturnToFieldMapScript()` (script.c:343). Dette R3 wire : non wired. */
export function RunOnReturnToFieldMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_RETURN_TO_FIELD');
  if (!label) return;
  console.log(`[script-runtime] RunOnReturnToFieldMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `RunOnDiveWarpMapScript()` (script.c:348). Dette R3 wire : Dive non porté. */
export function RunOnDiveWarpMapScript(): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_DIVE_WARP');
  if (!label) return;
  console.log(`[script-runtime] RunOnDiveWarpMapScript : ${label}`);
  RunScriptImmediately(label);
}

/** 1:1 décomp `MapHeaderRunScriptType(u8 tag)` (script.c:292-297). Notre port : tag est
 *  une string ('MAP_SCRIPT_ON_LOAD' etc.) car `findMapScriptLabel` travaille avec des
 *  opcodes string-encoded. */
export function MapHeaderRunScriptType(tag: string): void {
  if (!gMapHeader?.mapScripts) return;
  const label = findMapScriptLabel(gMapHeader.mapScripts, tag);
  if (!label) return;
  RunScriptImmediately(label);
}

/** 1:1 décomp `MapHeaderCheckScriptTable(MAP_SCRIPT_ON_FRAME_TABLE)` (script.c:299).
 *  Iterate les entries `map_script_2 VAR_X, value, scriptLabel` du table. Pour chaque
 *  entry : si VarGet(VAR_X) === value → SetupScript + return TRUE (= 1er match wins).
 *
 *  Polled chaque frame depuis MainCB2_Overworld. Ne re-trigger PAS si script déjà running
 *  (= status check). */
export function TryRunOnFrameMapScript(): boolean {
  // Skip si script déjà actif (= sinon race / re-trigger en boucle). Statut du contexte
  // global : sinon un OnFrame avec wait (movement/msgbox) avant son setvar de state se
  // relance chaque frame (SetupScript reset le script) → intro/cutscenes cassées.
  if (_getGlobalStatus() !== CONTEXT_SHUTDOWN) return false;
  if (!gMapHeader?.mapScripts) return false;
  const tableLabel = findMapScriptLabel(gMapHeader.mapScripts, 'MAP_SCRIPT_ON_FRAME_TABLE');
  if (!tableLabel) return false;
  const opcodes = _scriptsByLabel.get(tableLabel);
  if (!opcodes) return false;
  for (const op of opcodes) {
    if (op.name !== 'map_script_2') continue;
    const [varName, valueTok, scriptLabel] = op.args;
    if (!varName || !valueTok || !scriptLabel) continue;
    // 1:1 décomp event_data.c:VarGet(id) returns id si pas une var ; resolveDecompConstant
    // idem pour les constants C compile-time (sinon "MALE"/"METATILE_X" → 0 par accident).
    const expected = VarGet(valueTok);
    if (VarGet(varName) === expected) {
      console.log(`[script-runtime] OnFrame match : ${varName}=${expected} → ${scriptLabel}`);
      // OnFrame scripts can have waits (msgbox, applymovement + waitmovement) → SetupScript
      // (= global ctx avec wait support) plutôt que RunScriptImmediately (= sync).
      ScriptContext_SetupScript(scriptLabel);
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `TryRunOnWarpIntoMapScript()` (script.c:364). Run `MAP_SCRIPT_ON_WARP_INTO_
 *  MAP_TABLE` SI le var match. Comme OnFrame mais utilise `RunScriptImmediately` (= sync —
 *  typiquement setobjectxy / setflag pour positionner NPCs). À call APRÈS spawn NPCs. */
export function TryRunOnWarpIntoMapScript(): boolean {
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
    // 1:1 décomp MapHeaderCheckScriptTable (script.c:299) : les DEUX côtés passent par
    // VarGet — `if (VarGet(varIndex1) == VarGet(varIndex2))` ; un littéral traverse VarGet
    // inchangé, un nom VAR_* est déréférencé. Même pattern que TryRunOnFrameMapScript :732.
    // (Avant : `Number(valueTok)` sinon 0 → une valeur symbolique était toujours lue 0.)
    const expected = VarGet(valueTok);
    if (VarGet(varName) === expected) {
      console.log(`[script-runtime] OnWarpIntoMap match : ${varName}=${expected} → ${scriptLabel}`);
      RunScriptImmediately(scriptLabel);
      return true;
    }
  }
  return false;
}

/** Coord trigger : check si player est sur une coord_event qui match VAR. À call chaque
 *  step end depuis PlayerStep. 1:1 décomp `TryRunCoordEventScript` (field_control_avatar.c)
 *  qui iterate gMapHeader.events.coordEvents et trigger si player at (x, y) AND var match. */
export function TryRunCoordEventScript(playerX: number, playerY: number): boolean {
  // Statut global (cf TryRunOnFrameMapScript) — sinon un coord-event peut re-trigger
  // pendant qu'un script tourne.
  if (_getGlobalStatus() !== CONTEXT_SHUTDOWN) return false;
  // 1:1 décomp `gMapHeader.events->coordEvents` (= struct MapEvents).
  const coordEvents = gMapHeader?.events?.coordEvents;
  if (!coordEvents || coordEvents.length === 0) return false;
  for (const ce of coordEvents) {
    if (ce.x !== playerX || ce.y !== playerY) continue;
    // 1:1 décomp `TryRunCoordEventScript` (field_control_avatar.c:877) :
    //   if (coordEvent->script == NULL) { DoCoordEventWeather(coordEvent->trigger); return NULL; }
    // Un coord event SANS script = un trigger MÉTÉO (Route 113 ash). Dispatché via hook
    // (évite le cycle ESM script ↔ field_weather_effect ↔ player-avatar ↔ script).
    if (!ce.script) {
      if (_doCoordEventWeatherHook) _doCoordEventWeatherHook(ce.trigger);
      return false;
    }
    // Trigger var var_value matching : si trigger = '' → always trigger ; sinon check
    // VarGet(trigger) === index.
    if (ce.trigger && VarGet(ce.trigger) !== ce.index) continue;
    console.log(`[script-runtime] CoordEvent at (${playerX},${playerY}) match : ${ce.script}`);
    // SetIntroFlags doesn't have waits, but be safe: use SetupScript pour supporter les
    // scripts avec applymovement / msgbox.
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
// (sinon cycle ESM via field_weather_effect → player-avatar → script).
let _doCoordEventWeatherHook: ((coordEventWeather: string | number) => void) | null = null;
/** Enregistre le dispatcher météo des coord events (= game/coord_event_weather.
 *  DoCoordEventWeather, wrappé pour résoudre la constante COORD_EVENT_WEATHER_* → id). */
export function setDoCoordEventWeatherHook(fn: (coordEventWeather: string | number) => void): void {
  _doCoordEventWeatherHook = fn;
}

// ─── Expose pour debug ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__scriptRuntime = {
  scripts: _scriptsByLabel,
  texts: _textsByLabel,
  status: () => _getGlobalStatus(),
  getCurrentLabel: () => _currentScriptLabel,
  // Curseur opcode : N/A en byte-VM (c'est du bytecode, pas un index d'Opcode[]). Le vrai
  // curseur live = `__byteVm.diag().scriptPtrOff`. Stubs pour ne pas casser scope.script().
  getCurrentOpcodeIdx: () => 0,
  getRemainingOpcodes: () => 0,
  getCurrentOpcode: () => null,
  snapshot: ScriptContext_Snapshot,
  restore: ScriptContext_Restore,
  init: ScriptContext_Init,
  enable: ScriptContext_Enable,
};
