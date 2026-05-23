// AUTO-GENERATED from src/decompress.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/decompress.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DuplicateDeoxysTiles', ret: "void", arity: 2, params: "void *pointer, s32 species" },
  { name: 'LZDecompressWram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'LZDecompressVram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'LoadCompressedSpriteSheet', ret: "u16", arity: 1, params: "const struct CompressedSpriteSheet *src" },
  { name: 'LoadCompressedSpriteSheetOverrideBuffer', ret: "void", arity: 2, params: "const struct CompressedSpriteSheet *src, void *buffer" },
  { name: 'LoadCompressedSpritePalette', ret: "void", arity: 1, params: "const struct CompressedSpritePalette *src" },
  { name: 'LoadCompressedSpritePaletteOverrideBuffer', ret: "void", arity: 2, params: "const struct CompressedSpritePalette *src, void *buffer" },
  { name: 'DecompressPicFromTable', ret: "void", arity: 3, params: "const struct CompressedSpriteSheet *src, void *buffer, s32 species" },
  { name: 'LZ77UnCompWram', ret: "else", arity: 2, params: "src->data, buffer" },
  { name: 'HandleLoadSpecialPokePic', ret: "void", arity: 4, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality" },
  { name: 'LoadSpecialPokePic', ret: "void", arity: 5, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality, bool8 isFrontPic" },
  { name: 'Unused_LZDecompressWramIndirect', ret: "void", arity: 2, params: "const void **src, void *dest" },
  { name: 'StitchObjectsOn8x8Canvas', ret: "UNUSED", arity: 4, params: "s32 object_size, s32 object_count, u8 *src_tiles, u8 *dest_tiles" },
  { name: 'GetDecompressedDataSize', ret: "u32", arity: 1, params: "const u32 *ptr" },
  { name: 'LoadCompressedSpriteSheetUsingHeap', ret: "bool8", arity: 1, params: "const struct CompressedSpriteSheet *src" },
  { name: 'LoadCompressedSpritePaletteUsingHeap', ret: "bool8", arity: 1, params: "const struct CompressedSpritePalette *src" },
  { name: 'DecompressPicFromTable_2', ret: "void", arity: 3, params: "const struct CompressedSpriteSheet *src, void *buffer, s32 species" },
  { name: 'LoadSpecialPokePic_2', ret: "void", arity: 5, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality, bool8 isFrontPic" },
  { name: 'HandleLoadSpecialPokePic_2', ret: "void", arity: 4, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality" },
  { name: 'DecompressPicFromTable_DontHandleDeoxys', ret: "void", arity: 3, params: "const struct CompressedSpriteSheet *src, void *buffer, s32 species" },
  { name: 'HandleLoadSpecialPokePic_DontHandleDeoxys', ret: "void", arity: 4, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality" },
  { name: 'LoadSpecialPokePic_DontHandleDeoxys', ret: "void", arity: 5, params: "const struct CompressedSpriteSheet *src, void *dest, s32 species, u32 personality, bool8 isFrontPic" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'data.h',
  'decompress.h',
  'pokemon.h',
  'text.h',
] as const;
