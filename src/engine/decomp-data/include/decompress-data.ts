// AUTO-GENERATED from include/decompress.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/decompress.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LZDecompressWram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'LZDecompressVram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'LoadCompressedSpriteSheet', ret: "u16", arity: 1, params: "const struct CompressedSpriteSheet *src" },
  { name: 'LoadCompressedSpriteSheetOverrideBuffer', ret: "void", arity: 2, params: "const struct CompressedSpriteSheet *src, void *buffer" },
  { name: 'LoadCompressedSpriteSheetUsingHeap', ret: "bool8", arity: 1, params: "const struct CompressedSpriteSheet *src" },
  { name: 'LoadCompressedSpritePalette', ret: "void", arity: 1, params: "const struct CompressedSpritePalette *src" },
  { name: 'LoadCompressedSpritePaletteOverrideBuffer', ret: "void", arity: 2, params: "const struct CompressedSpritePalette *src, void *buffer" },
  { name: 'LoadCompressedSpritePaletteUsingHeap', ret: "bool8", arity: 1, params: "const struct CompressedSpritePalette *src" },
  { name: 'DecompressPicFromTable', ret: "void", arity: 3, params: "const struct CompressedSpriteSheet *src, void *buffer, s32 species" },
  { name: 'DecompressPicFromTable_2', ret: "void", arity: 3, params: "const struct CompressedSpriteSheet *src, void *buffer, s32 species" },
  { name: 'DecompressPicFromTable_DontHandleDeoxys', ret: "void", arity: 3, params: "const struct CompressedSpriteSheet *src, void *buffer, s32 species" },
  { name: 'HandleLoadSpecialPokePic', ret: "void", arity: 4, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality" },
  { name: 'HandleLoadSpecialPokePic_2', ret: "void", arity: 4, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality" },
  { name: 'HandleLoadSpecialPokePic_DontHandleDeoxys', ret: "void", arity: 4, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality" },
  { name: 'LoadSpecialPokePic', ret: "void", arity: 5, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality, bool8 isFrontPic" },
  { name: 'LoadSpecialPokePic_2', ret: "void", arity: 5, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality, bool8 isFrontPic" },
  { name: 'LoadSpecialPokePic_DontHandleDeoxys', ret: "void", arity: 5, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality, bool8 isFrontPic" },
  { name: 'GetDecompressedDataSize', ret: "u32", arity: 1, params: "const u32 *ptr" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'sprite.h',
] as const;
