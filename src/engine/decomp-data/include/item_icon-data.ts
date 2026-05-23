// AUTO-GENERATED from include/item_icon.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/item_icon.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AllocItemIconTemporaryBuffers', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreeItemIconTemporaryBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'CopyItemIconPicTo4x4Buffer', ret: "void", arity: 2, params: "const void *src, void *dest" },
  { name: 'AddItemIconSprite', ret: "u8", arity: 3, params: "u16 tilesTag, u16 paletteTag, u16 itemId" },
  { name: 'AddCustomItemIconSprite', ret: "u8", arity: 4, params: "const struct SpriteTemplate *customSpriteTemplate, u16 tilesTag, u16 paletteTag, u16 itemId" },
] as const;
