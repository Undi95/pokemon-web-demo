// AUTO-GENERATED from src/scanline_effect.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/scanline_effect.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tStartLine_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tEndLine_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tWaveLength_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tSrcBufferOffset_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tFramesUntilMove_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tDelayInterval_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tRegOffset_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tApplyBattleBgOffsets_EXPR = "data[7]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct ScanlineEffect", name: 'gScanlineEffect', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sShouldStopWaveTask', isArray: false, init: "FALSE" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CopyValue16Bit', ret: "void", arity: 0, params: "void" },
  { name: 'CopyValue32Bit', ret: "void", arity: 0, params: "void" },
  { name: 'ScanlineEffect_Stop', ret: "void", arity: 0, params: "void" },
  { name: 'ScanlineEffect_Clear', ret: "void", arity: 0, params: "void" },
  { name: 'ScanlineEffect_SetParams', ret: "void", arity: 1, params: "struct ScanlineEffectParams params" },
  { name: 'ScanlineEffect_InitHBlankDmaTransfer', ret: "void", arity: 0, params: "void" },
  { name: 'TaskFunc_UpdateWavePerFrame', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GenerateWave', ret: "void", arity: 4, params: "u16 *buffer, u8 frequency, u8 amplitude, u8 unused" },
  { name: 'ScanlineEffect_InitWave', ret: "u8", arity: 7, params: "u8 startLine, u8 endLine, u8 frequency, u8 amplitude, u8 delayInterval, u8 regOffset, bool8 applyBattleBgOffsets" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'data.h',
  'task.h',
  'trig.h',
  'scanline_effect.h',
] as const;
