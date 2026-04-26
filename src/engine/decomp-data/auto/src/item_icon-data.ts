// AUTO-GENERATED from src/item_icon.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/item_icon.c
// Generated: 2026-04-26

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_ItemIcon = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 2, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gItemIconSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&sOamData_ItemIcon", anims: "sSpriteAnimTable_ItemIcon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AllocItemIconTemporaryBuffers', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreeItemIconTemporaryBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'CopyItemIconPicTo4x4Buffer', ret: "void", arity: 2, params: "const void *src, void *dest" },
  { name: 'AddItemIconSprite', ret: "u8", arity: 3, params: "u16 tilesTag, u16 paletteTag, u16 itemId" },
  { name: 'AddCustomItemIconSprite', ret: "u8", arity: 4, params: "const struct SpriteTemplate *customSpriteTemplate, u16 tilesTag, u16 paletteTag, u16 itemId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'decompress.h',
  'graphics.h',
  'item_icon.h',
  'malloc.h',
  'sprite.h',
  'constants/items.h',
  'data/item_icon_table.h',
] as const;
