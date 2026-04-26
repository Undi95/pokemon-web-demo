// AUTO-GENERATED from src/palette_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/palette_util.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RouletteFlash_Reset', ret: "void", arity: 1, params: "struct RouletteFlashUtil *flash" },
  { name: 'RouletteFlash_Add', ret: "u8", arity: 3, params: "struct RouletteFlashUtil *flash, u8 id, const struct RouletteFlashSettings *settings" },
  { name: 'RouletteFlash_Remove', ret: "UNUSED", arity: 2, params: "struct RouletteFlashUtil *flash, u8 id" },
  { name: 'RouletteFlash_FadePalette', ret: "u8", arity: 1, params: "struct RouletteFlashPalette *pal" },
  { name: 'RouletteFlash_FlashPalette', ret: "u8", arity: 1, params: "struct RouletteFlashPalette *pal" },
  { name: 'RouletteFlash_Run', ret: "void", arity: 1, params: "struct RouletteFlashUtil *flash" },
  { name: 'RouletteFlash_Enable', ret: "void", arity: 2, params: "struct RouletteFlashUtil *flash, u16 flags" },
  { name: 'RouletteFlash_Stop', ret: "void", arity: 2, params: "struct RouletteFlashUtil *flash, u16 flags" },
  { name: 'InitPulseBlend', ret: "void", arity: 1, params: "struct PulseBlend *pulseBlend" },
  { name: 'InitPulseBlendPaletteSettings', ret: "int", arity: 2, params: "struct PulseBlend *pulseBlend, const struct PulseBlendSettings *settings" },
  { name: 'ClearPulseBlendPalettesSettings', ret: "void", arity: 1, params: "struct PulseBlendPalette *pulseBlendPalette" },
  { name: 'UnloadUsedPulseBlendPalettes', ret: "void", arity: 3, params: "struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection" },
  { name: 'MarkUsedPulseBlendPalettes', ret: "void", arity: 3, params: "struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection" },
  { name: 'UnmarkUsedPulseBlendPalettes', ret: "void", arity: 3, params: "struct PulseBlend *pulseBlend, u16 pulseBlendPaletteSelector, u8 multiSelection" },
  { name: 'UpdatePulseBlend', ret: "void", arity: 1, params: "struct PulseBlend *pulseBlend" },
  { name: 'FillTilemapRect', ret: "void", arity: 6, params: "u16 *dest, u16 value, u8 left, u8 top, u8 width, u8 height" },
  { name: 'SetTilemapRect', ret: "void", arity: 6, params: "u16 *dest, u16 *src, u8 left, u8 top, u8 width, u8 height" },
  { name: 'FillTilemapRect_Unused', ret: "UNUSED", arity: 6, params: "void *dest, u16 value, u8 left, u8 top, u8 width, u8 height" },
  { name: 'SetTilemapRect_Unused', ret: "UNUSED", arity: 6, params: "void *dest, const u16 *src, u8 left, u8 top, u8 width, u8 height" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'palette.h',
  'palette_util.h',
  'util.h',
] as const;
