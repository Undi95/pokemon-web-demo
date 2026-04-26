// AUTO-GENERATED from src/palette.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/palette.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_PALETTE_STRUCTS = 16;
/** Raw expr: `data[0]` */
export const tCoeff_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCoeffTarget_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCoeffDelta_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tDelay_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tDelayTimer_EXPR = "data[4]";
export const tPalettes = 5;
/** Raw expr: `data[7]` */
export const tColor_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tId_EXPR = "data[8]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_NORMAL_0 = {
  NORMAL_FADE: 0,
  FAST_FADE: 1,
  HARDWARE_FADE: 2,
} as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sRoundedDownGrayscaleMap: readonly number[] = [0,0,0,0,0,5,5,5,5,5,11,11,11,11,11,16,16,16,16,16,21,21,21,21,21,27,27,27,27,27,31,31] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'gPlttBufferUnfaded', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gPlttBufferFaded', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct PaletteStruct", name: 'sPaletteStructs', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct PaletteFadeControl", name: 'gPaletteFade', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sFiller', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sPlttBufferTransferPending', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PaletteStruct_Copy', ret: "void", arity: 2, params: "struct PaletteStruct *, u32 *" },
  { name: 'PaletteStruct_Blend', ret: "void", arity: 2, params: "struct PaletteStruct *, u32 *" },
  { name: 'PaletteStruct_TryEnd', ret: "void", arity: 1, params: "struct PaletteStruct *" },
  { name: 'PaletteStruct_Reset', ret: "void", arity: 1, params: "u8" },
  { name: 'PaletteStruct_GetPalNum', ret: "u8", arity: 1, params: "u16" },
  { name: 'UpdateNormalPaletteFade', ret: "u8", arity: 0, params: "void" },
  { name: 'BeginFastPaletteFadeInternal', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateFastPaletteFade', ret: "u8", arity: 0, params: "void" },
  { name: 'UpdateHardwarePaletteFade', ret: "u8", arity: 0, params: "void" },
  { name: 'UpdateBlendRegisters', ret: "void", arity: 0, params: "void" },
  { name: 'IsSoftwarePaletteFadeFinishing', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_BlendPalettesGradually', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LoadCompressedPalette', ret: "void", arity: 3, params: "const u32 *src, u16 offset, u16 size" },
  { name: 'LoadPalette', ret: "void", arity: 3, params: "const void *src, u16 offset, u16 size" },
  { name: 'FillPalette', ret: "void", arity: 3, params: "u16 value, u16 offset, u16 size" },
  { name: 'TransferPlttBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePaletteFade', ret: "u8", arity: 0, params: "void" },
  { name: 'ResetPaletteFade', ret: "void", arity: 0, params: "void" },
  { name: 'ReadPlttIntoBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'BeginNormalPaletteFade', ret: "bool8", arity: 5, params: "u32 selectedPalettes, s8 delay, u8 startY, u8 targetY, u16 blendColor" },
  { name: 'BeginPlttFade', ret: "UNUSED", arity: 5, params: "u32 selectedPalettes, u8 delay, u8 startY, u8 targetY, u16 blendColor" },
  { name: 'PaletteStruct_Run', ret: "UNUSED", arity: 2, params: "u8 a1, u32 *unkFlags" },
  { name: 'PaletteStruct_ResetById', ret: "void", arity: 1, params: "u16 id" },
  { name: 'ResetPaletteFadeControl', ret: "void", arity: 0, params: "void" },
  { name: 'PaletteStruct_SetUnusedFlag', ret: "UNUSED", arity: 1, params: "u16 id" },
  { name: 'PaletteStruct_ClearUnusedFlag', ret: "UNUSED", arity: 1, params: "u16 id" },
  { name: 'InvertPlttBuffer', ret: "void", arity: 1, params: "u32 selectedPalettes" },
  { name: 'TintPlttBuffer', ret: "void", arity: 4, params: "u32 selectedPalettes, s8 r, s8 g, s8 b" },
  { name: 'UnfadePlttBuffer', ret: "void", arity: 1, params: "u32 selectedPalettes" },
  { name: 'BeginFastPaletteFade', ret: "void", arity: 1, params: "u8 submode" },
  { name: 'BeginHardwarePaletteFade', ret: "void", arity: 5, params: "u8 blendCnt, u8 delay, u8 y, u8 targetY, u8 shouldResetBlendRegisters" },
  { name: 'BlendPalettes', ret: "void", arity: 3, params: "u32 selectedPalettes, u8 coeff, u16 color" },
  { name: 'BlendPalettesUnfaded', ret: "void", arity: 3, params: "u32 selectedPalettes, u8 coeff, u16 color" },
  { name: 'TintPalette_GrayScale', ret: "void", arity: 2, params: "u16 *palette, u16 count" },
  { name: 'TintPalette_GrayScale2', ret: "void", arity: 2, params: "u16 *palette, u16 count" },
  { name: 'TintPalette_SepiaTone', ret: "void", arity: 2, params: "u16 *palette, u16 count" },
  { name: 'TintPalette_CustomTone', ret: "void", arity: 5, params: "u16 *palette, u16 count, u16 rTone, u16 gTone, u16 bTone" },
  { name: 'BlendPalettesGradually', ret: "void", arity: 7, params: "u32 selectedPalettes, s8 delay, u8 coeff, u8 coeffTarget, u16 color, u8 priority, u8 id" },
  { name: 'IsBlendPalettesGraduallyTaskActive', ret: "UNUSED", arity: 1, params: "u8 id" },
  { name: 'DestroyBlendPalettesGraduallyTask', ret: "UNUSED", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BlendPalettesGradually',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'palette.h',
  'util.h',
  'decompress.h',
  'gpu_regs.h',
  'task.h',
  'constants/rgb.h',
] as const;
