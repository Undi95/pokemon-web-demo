// AUTO-GENERATED from include/palette_util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/palette_util.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 << 15)` */
export const FLASHUTIL_USE_EXISTING_COLOR_EXPR = "(1 << 15)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitPulseBlendPaletteSettings', ret: "int", arity: 2, params: "struct PulseBlend *pulseBlend, const struct PulseBlendSettings *settings" },
  { name: 'InitPulseBlend', ret: "void", arity: 1, params: "struct PulseBlend *pulseBlend" },
  { name: 'MarkUsedPulseBlendPalettes', ret: "void", arity: 3, params: "struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection" },
  { name: 'UnloadUsedPulseBlendPalettes', ret: "void", arity: 3, params: "struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection" },
  { name: 'UnmarkUsedPulseBlendPalettes', ret: "void", arity: 3, params: "struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection" },
  { name: 'UpdatePulseBlend', ret: "void", arity: 1, params: "struct PulseBlend *pulseBlend" },
  { name: 'FillTilemapRect', ret: "void", arity: 6, params: "u16 *dest, u16 value, u8 left, u8 top, u8 width, u8 height" },
  { name: 'SetTilemapRect', ret: "void", arity: 6, params: "u16 *dest, u16 *src, u8 left, u8 top, u8 width, u8 height" },
  { name: 'RouletteFlash_Run', ret: "void", arity: 1, params: "struct RouletteFlashUtil *flash" },
  { name: 'RouletteFlash_Reset', ret: "void", arity: 1, params: "struct RouletteFlashUtil *flash" },
  { name: 'RouletteFlash_Add', ret: "u8", arity: 3, params: "struct RouletteFlashUtil *flash, u8 id, const struct RouletteFlashSettings *settings" },
  { name: 'RouletteFlash_Stop', ret: "void", arity: 2, params: "struct RouletteFlashUtil *flash, u16 flags" },
  { name: 'RouletteFlash_Enable', ret: "void", arity: 2, params: "struct RouletteFlashUtil *flash, u16 flags" },
] as const;
