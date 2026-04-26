// AUTO-GENERATED from include/palette.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/palette.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(gPaletteFade.multipurpose1)` */
export const gPaletteFade_selectedPalettes_EXPR = "(gPaletteFade.multipurpose1)";
/** Raw expr: `(gPaletteFade.multipurpose1)` */
export const gPaletteFade_blendCnt_EXPR = "(gPaletteFade.multipurpose1)";
/** Raw expr: `(gPaletteFade.multipurpose2)` */
export const gPaletteFade_delay_EXPR = "(gPaletteFade.multipurpose2)";
/** Raw expr: `(gPaletteFade.multipurpose2)` */
export const gPaletteFade_submode_EXPR = "(gPaletteFade.multipurpose2)";
/** Raw expr: `(PLTT_SIZE / sizeof(u16))` */
export const PLTT_BUFFER_SIZE_EXPR = "(PLTT_SIZE / sizeof(u16))";
export const PALETTE_FADE_STATUS_DELAY = 2;
export const PALETTE_FADE_STATUS_ACTIVE = 1;
export const PALETTE_FADE_STATUS_DONE = 0;
export const PALETTE_FADE_STATUS_LOADING = 255;
export const PALETTES_BG = 65535;
export const PALETTES_OBJECTS = 4294901760;
/** Raw expr: `(PALETTES_BG | PALETTES_OBJECTS)` */
export const PALETTES_ALL_EXPR = "(PALETTES_BG | PALETTES_OBJECTS)";
export const BG_PLTT_OFFSET = 0;
export const OBJ_PLTT_OFFSET = 256;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_FAST_0 = {
  FAST_FADE_IN_FROM_WHITE: 0,
  FAST_FADE_OUT_TO_WHITE: 1,
  FAST_FADE_IN_FROM_BLACK: 2,
  FAST_FADE_OUT_TO_BLACK: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadCompressedPalette', ret: "void", arity: 3, params: "const u32 *src, u16 offset, u16 size" },
  { name: 'LoadPalette', ret: "void", arity: 3, params: "const void *src, u16 offset, u16 size" },
  { name: 'FillPalette', ret: "void", arity: 3, params: "u16 value, u16 offset, u16 size" },
  { name: 'TransferPlttBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePaletteFade', ret: "u8", arity: 0, params: "void" },
  { name: 'ResetPaletteFade', ret: "void", arity: 0, params: "void" },
  { name: 'BeginNormalPaletteFade', ret: "bool8", arity: 5, params: "u32 selectedPalettes, s8 delay, u8 startY, u8 targetY, u16 blendColor" },
  { name: 'PaletteStruct_ResetById', ret: "void", arity: 1, params: "u16 id" },
  { name: 'ResetPaletteFadeControl', ret: "void", arity: 0, params: "void" },
  { name: 'InvertPlttBuffer', ret: "void", arity: 1, params: "u32 selectedPalettes" },
  { name: 'TintPlttBuffer', ret: "void", arity: 4, params: "u32 selectedPalettes, s8 r, s8 g, s8 b" },
  { name: 'UnfadePlttBuffer', ret: "void", arity: 1, params: "u32 selectedPalettes" },
  { name: 'BeginFastPaletteFade', ret: "void", arity: 1, params: "u8 submode" },
  { name: 'BeginHardwarePaletteFade', ret: "void", arity: 5, params: "u8 blendCnt, u8 delay, u8 y, u8 targetY, u8 shouldResetBlendRegisters" },
  { name: 'BlendPalettes', ret: "void", arity: 3, params: "u32 selectedPalettes, u8 coeff, u16 color" },
  { name: 'BlendPalettesUnfaded', ret: "void", arity: 3, params: "u32 selectedPalettes, u8 coeff, u16 color" },
  { name: 'BlendPalettesGradually', ret: "void", arity: 7, params: "u32 selectedPalettes, s8 delay, u8 coeff, u8 coeffTarget, u16 color, u8 priority, u8 id" },
  { name: 'TintPalette_GrayScale', ret: "void", arity: 2, params: "u16 *palette, u16 count" },
  { name: 'TintPalette_GrayScale2', ret: "void", arity: 2, params: "u16 *palette, u16 count" },
  { name: 'TintPalette_SepiaTone', ret: "void", arity: 2, params: "u16 *palette, u16 count" },
  { name: 'TintPalette_CustomTone', ret: "void", arity: 5, params: "u16 *palette, u16 count, u16 rTone, u16 gTone, u16 bTone" },
  { name: 'SetBackdropFromColor', ret: "void", arity: 1, params: "u16 color" },
  { name: 'SetBackdropFromPalette', ret: "void", arity: 1, params: "const u16 *palette" },
] as const;
