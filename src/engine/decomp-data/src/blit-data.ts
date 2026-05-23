// AUTO-GENERATED from src/blit.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/blit.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BlitBitmapRect4BitWithoutColorKey', ret: "void", arity: 8, params: "const struct Bitmap *src, struct Bitmap *dst, u16 srcX, u16 srcY, u16 dstX, u16 dstY, u16 width, u16 height" },
  { name: 'BlitBitmapRect4Bit', ret: "void", arity: 9, params: "const struct Bitmap *src, struct Bitmap *dst, u16 srcX, u16 srcY, u16 dstX, u16 dstY, u16 width, u16 height, u8 colorKey" },
  { name: 'FillBitmapRect4Bit', ret: "void", arity: 6, params: "struct Bitmap *surface, u16 x, u16 y, u16 width, u16 height, u8 fillValue" },
  { name: 'BlitBitmapRect4BitTo8Bit', ret: "void", arity: 10, params: "const struct Bitmap *src, struct Bitmap *dst, u16 srcX, u16 srcY, u16 dstX, u16 dstY, u16 width, u16 height, u8 colorKey, u8 paletteOffset" },
  { name: 'FillBitmapRect8Bit', ret: "void", arity: 6, params: "struct Bitmap *surface, u16 x, u16 y, u16 width, u16 height, u8 fillValue" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'blit.h',
] as const;
