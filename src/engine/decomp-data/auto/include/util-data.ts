// AUTO-GENERATED from include/util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/util.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'StoreWordInTwoHalfwords', ret: "void", arity: 2, params: "u16 *h, u32 w" },
  { name: 'LoadWordFromTwoHalfwords', ret: "void", arity: 2, params: "u16 *h, u32 *w" },
  { name: 'CountTrailingZeroBits', ret: "int", arity: 1, params: "u32 value" },
  { name: 'CalcCRC16', ret: "u16", arity: 2, params: "const u8 *data, s32 length" },
  { name: 'CalcCRC16WithTable', ret: "u16", arity: 2, params: "const u8 *data, u32 length" },
  { name: 'CalcByteArraySum', ret: "u32", arity: 2, params: "const u8 *data, u32 length" },
  { name: 'BlendPalette', ret: "void", arity: 4, params: "u16 palOffset, u16 numEntries, u8 coeff, u16 blendColor" },
  { name: 'DoBgAffineSet', ret: "void", arity: 8, params: "struct BgAffineDstData *dest, u32 texX, u32 texY, s16 scrX, s16 scrY, s16 sx, s16 sy, u16 alpha" },
  { name: 'CopySpriteTiles', ret: "void", arity: 5, params: "u8 shape, u8 size, u8 *tiles, u16 *tilemap, u8 *output" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'sprite.h',
] as const;
