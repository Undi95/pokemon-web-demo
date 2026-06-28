/**
 * script_bytevm.ts — VM bytecode 1:1 de `src/script.c` (byte-VM, Phase 3).
 *
 * TRANSITOIRE : remplacera `src/script.ts` (moteur dispatch-par-nom actuel) une
 * fois le slice vertical + les ~225 handlers prouvés (mon A/B en jeu). Tant que
 * non câblé, ce module n'affecte pas le jeu.
 *
 * MIRROR STRICT de script.c. Seule adaptation (irréplicable : pas d'espace
 * d'adresses ROM) : `const u8 *scriptPtr` → curseur `{ buf: Uint8Array, off }`.
 * Les pointeurs de script (goto/call) sont des OFFSETS dans l'image globale
 * (cf. compile-scripts.cjs / docs/BYTE-VM-PLAN.md) → `{ buf: gScriptImage, off }`.
 * Les pointeurs vers ressources irréplicables (texte/mouvement/natif/RAM) sont des
 * ids de symboles résolus par les handlers (Phase 4).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/script.c (1:1).
 */

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

const STACK_SIZE = 20;
const DATA_SIZE = 4;

// La table de commandes globale (gScriptCmdTable) : 227 handlers indexés par cmdId.
// Remplie en Phase 4 ; les slots non encore portés restent `null` (→ arrêt propre).
export const gScriptCmdTable: (ScrCmdFunc | null)[] = new Array(227).fill(null);
export const gScriptCmdTableEnd = gScriptCmdTable.length;

// ─── module state (1:1 script.c:25-28) ───────────────────────────────────────
let sGlobalScriptContextStatus = CONTEXT_SHUTDOWN;
const sGlobalScriptContext: ScriptContext = createContext();
const sImmediateScriptContext: ScriptContext = createContext();
// Lock UNIFIÉ avec script.ts via globalThis (cf script.ts _lockSet) — le swap Phase 5
// route l'exécution ici mais combat/warp/global tapent les fns de script.ts : un seul flag.
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
      // Handler pas encore porté (Phase 4) : arrêt propre + signal une fois.
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

// ─── Lock / Unlock (1:1 script.c:182-195) ────────────────────────────────────
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
  // SWAP-safety (Phase 5) : réinit du contexte = aucun script ⇒ déverrouille le lock-script.
  // Au retour de combat / map-load, le contexte est reset à SHUTDOWN ; sans ça un lock posé
  // pendant le script déclencheur (dowildbattle/trainerbattle) reste fantôme → joueur figé.
  // Init n'est appelé qu'au reset (pas chaque frame) → n'interfère ni avec la marche ni la
  // séquence de warp (le lock d'animation de porte précède le map-load).
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

/** 1:1 `ScriptContext_SetupScript(const u8 *ptr)`. Adapté : `label` → offset image. */
export function ScriptContext_SetupScript(ptr: ScriptPtr): void {
  InitScriptContext(sGlobalScriptContext, gScriptCmdTable as ScrCmdFunc[], gScriptCmdTableEnd);
  SetupBytecodeScript(sGlobalScriptContext, ptr);
  LockPlayerFieldControls();
  sGlobalScriptContextStatus = CONTEXT_RUNNING;
}

/** Devtools : monte un native-script inline (tickFn pollé jusqu'à TRUE) sur le
 *  contexte byte-VM GLOBAL → tické chaque frame par ScriptContext_RunScript (mode
 *  NATIVE). Utilisé par dev.starter.choose() etc. Avant le clean, script.ts montait
 *  ça sur son contexte parsé mort → jamais tické (RunScript ticke le byte-VM). */
export function ScriptContext_SetupInlineNative(tickFn: () => boolean): void {
  InitScriptContext(sGlobalScriptContext, gScriptCmdTable as ScrCmdFunc[], gScriptCmdTableEnd);
  SetupNativeScript(sGlobalScriptContext, tickFn);
  LockPlayerFieldControls();
  sGlobalScriptContextStatus = CONTEXT_RUNNING;
}

export function ScriptContext_Stop(): void {
  sGlobalScriptContextStatus = CONTEXT_WAITING;
}

export function ScriptContext_Enable(): void {
  sGlobalScriptContextStatus = CONTEXT_RUNNING;
  LockPlayerFieldControls();
}

// ─── Snapshot / Restore du ScriptContext global (byte-VM) ────────────────────
// Préserve le contexte SUSPENDU (scriptPtr + nativePtr + pile + data + status) à
// travers un re-init complet du field. `_restoreOverworldFromMenu` fait
// loadAndInitMap → ScriptContext_Init (reset TOTAL) ; sans snapshot/restore, le
// script déclencheur en attente (= `pokemart` waitstate, `special ChooseStarter`,
// `special Bag_ChooseBerry`) serait détruit et ne reprendrait jamais.
// ⚠️ CRITIQUE : capturer `nativePtr` (closure JS du poll natif) + `scriptPtr`
// (curseur byte-VM). L'ancien snapshot vivait dans script.ts sur le contexte PARSÉ
// mort (champs scriptOpcodes/nativeFn) → il ne capturait NI l'un NI l'autre → au
// retour de buy-menu shop, le poll `doPokemart` était perdu → la textbox "anything
// else?" restait figée et `msgbox PleaseComeAgain`/`release` ne tournaient jamais.
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
export function RunScriptImmediately(ptr: ScriptPtr): void {
  InitScriptContext(sImmediateScriptContext, gScriptCmdTable as ScrCmdFunc[], gScriptCmdTableEnd);
  SetupBytecodeScript(sImmediateScriptContext, ptr);
  // eslint-disable-next-line no-empty
  while (RunScriptCommand(sImmediateScriptContext) === true) { /* run jusqu'à fin */ }
}

// Accès interne (pour le loader / les handlers Phase 4).
export function _getGlobalContext(): ScriptContext { return sGlobalScriptContext; }
export function _getGlobalStatus(): number { return sGlobalScriptContextStatus; }

// ─────────────────────────────────────────────────────────────────────────────
// Loader de l'image bytecode (cf. scripts/compile-scripts.cjs)
// L'image globale + les tables de symboles sont chargées une fois ; les pointeurs
// de script sont des offsets dans cette image (= adresses ROM).
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
 *  l'argument pointeur cible une donnée référencée par label DANS l'image (= reloc offset, pas
 *  symbole synthétique) : ScrCmd_pokemart pointe vers une liste mart (label_Pokemart). */
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

/** Helper : démarre un script (par label) dans le contexte global. */
export function ScriptContext_SetupScriptByLabel(label: string): boolean {
  const ptr = ptrFromLabel(label);
  if (!ptr) { console.warn(`[byte-vm] script introuvable: ${label}`); return false; }
  ScriptContext_SetupScript(ptr);
  return true;
}

/** Helper : run synchrone (par label). */
export function RunScriptImmediatelyByLabel(label: string): boolean {
  const ptr = ptrFromLabel(label);
  if (!ptr) { console.warn(`[byte-vm] script introuvable: ${label}`); return false; }
  RunScriptImmediately(ptr);
  return true;
}
