// AUTO-GENERATED from src/mystery_gift_view.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_gift_view.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_STAMP_SHADOW = 32768;
export const TAG_ARROWS = 4096;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_CARD_0 = {
  CARD_WIN_HEADER: 0,
  CARD_WIN_BODY: 1,
  CARD_WIN_FOOTER: 2,
  CARD_WIN_COUNT: 3,
} as const;
export const ENUM_NEWS_1 = {
  NEWS_WIN_TITLE: 0,
  NEWS_WIN_BODY: 1,
  NEWS_WIN_COUNT: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sCard_WindowTemplates = [
  { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 25, height: 4, paletteNum: 2, baseBlock: 668 },
  { bg: 1, tilemapLeft: 1, tilemapTop: 6, width: 28, height: 8, paletteNum: 2, baseBlock: 444 },
  { bg: 1, tilemapLeft: 1, tilemapTop: 14, width: 28, height: 5, paletteNum: 2, baseBlock: 304 },
] as const;
export const sNews_WindowTemplates = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 0, width: 28, height: 3, paletteNum: 2, baseBlock: 684 },
  { bg: 2, tilemapLeft: 1, tilemapTop: 3, width: 28, height: "DISPLAY_TILE_HEIGHT", paletteNum: 2, baseBlock: 124 },
] as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_StampShadow = { tileTag: "TAG_STAMP_SHADOW", paletteTag: "TAG_STAMP_SHADOW", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sWonderCardBgPal1': { path: 'graphics/wonder_card/bg1.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgPal2': { path: 'graphics/wonder_card/bg2.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgPal3': { path: 'graphics/wonder_card/bg3.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgPal4': { path: 'graphics/wonder_card/bg4.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgPal5': { path: 'graphics/wonder_card/bg5.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgPal6': { path: 'graphics/wonder_card/bg6.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgPal7': { path: 'graphics/wonder_card/bg7.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgPal8': { path: 'graphics/wonder_card/bg8.png', ext: '.gbapal', type: 'u16' },
  'sWonderCardBgGfx1': { path: 'graphics/wonder_card/bg1.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderCardBgTilemap1': { path: 'graphics/wonder_card/bg1.bin', ext: '.lz', type: 'u32' },
  'sWonderCardBgGfx2': { path: 'graphics/wonder_card/bg2.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderCardBgTilemap2': { path: 'graphics/wonder_card/bg2.bin', ext: '.lz', type: 'u32' },
  'sWonderCardBgGfx3': { path: 'graphics/wonder_card/bg3.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderCardBgTilemap3': { path: 'graphics/wonder_card/bg3.bin', ext: '.lz', type: 'u32' },
  'sWonderCardBgGfx7': { path: 'graphics/wonder_card/bg7.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderCardBgTilemap7': { path: 'graphics/wonder_card/bg7.bin', ext: '.lz', type: 'u32' },
  'sWonderCardBgGfx8': { path: 'graphics/wonder_card/bg8.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderCardBgTilemap8': { path: 'graphics/wonder_card/bg8.bin', ext: '.lz', type: 'u32' },
  'sStampShadowPal1': { path: 'graphics/wonder_card/stamp_shadow_1.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowPal2': { path: 'graphics/wonder_card/stamp_shadow_2.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowPal3': { path: 'graphics/wonder_card/stamp_shadow_3.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowPal4': { path: 'graphics/wonder_card/stamp_shadow_4.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowPal5': { path: 'graphics/wonder_card/stamp_shadow_5.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowPal6': { path: 'graphics/wonder_card/stamp_shadow_6.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowPal7': { path: 'graphics/wonder_card/stamp_shadow_7.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowPal8': { path: 'graphics/wonder_card/stamp_shadow_8.pal', ext: '.gbapal', type: 'u16' },
  'sStampShadowGfx': { path: 'graphics/wonder_card/stamp_shadow.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderNewsPal1': { path: 'graphics/wonder_news/bg1.png', ext: '.gbapal', type: 'u16' },
  'sWonderNewsPal7': { path: 'graphics/wonder_news/bg7.png', ext: '.gbapal', type: 'u16' },
  'sWonderNewsPal8': { path: 'graphics/wonder_news/bg8.png', ext: '.gbapal', type: 'u16' },
  'sWonderNewsGfx1': { path: 'graphics/wonder_news/bg1.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderNewsTilemap1': { path: 'graphics/wonder_news/bg1.bin', ext: '.lz', type: 'u32' },
  'sWonderNewsGfx2': { path: 'graphics/wonder_news/bg2.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderNewsTilemap2': { path: 'graphics/wonder_news/bg2.bin', ext: '.lz', type: 'u32' },
  'sWonderNewsGfx3': { path: 'graphics/wonder_news/bg3.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderNewsTilemap3': { path: 'graphics/wonder_news/bg3.bin', ext: '.lz', type: 'u32' },
  'sWonderNewsGfx7': { path: 'graphics/wonder_news/bg7.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderNewsTilemap7': { path: 'graphics/wonder_news/bg7.bin', ext: '.lz', type: 'u32' },
  'sWonderNewsGfx8': { path: 'graphics/wonder_news/bg8.png', ext: '.4bpp.lz', type: 'u32' },
  'sWonderNewsTilemap8': { path: 'graphics/wonder_news/bg8.bin', ext: '.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BufferCardText', ret: "void", arity: 0, params: "void" },
  { name: 'DrawCardWindow', ret: "void", arity: 1, params: "u8 whichWindow" },
  { name: 'CreateCardSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyCardSprites', ret: "void", arity: 0, params: "void" },
  { name: 'WonderCard_Init', ret: "bool32", arity: 2, params: "struct WonderCard *card, struct WonderCardMetadata *metadata" },
  { name: 'WonderCard_Destroy', ret: "void", arity: 0, params: "void" },
  { name: 'WonderCard_Enter', ret: "s32", arity: 0, params: "void" },
  { name: 'WonderCard_Exit', ret: "s32", arity: 1, params: "bool32 useCancel" },
  { name: 'BufferNewsText', ret: "void", arity: 0, params: "void" },
  { name: 'DrawNewsWindows', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateNewsScroll', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_Init', ret: "bool32", arity: 1, params: "const struct WonderNews *news" },
  { name: 'WonderNews_Destroy', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_Enter', ret: "s32", arity: 0, params: "void" },
  { name: 'WonderNews_Exit', ret: "s32", arity: 1, params: "bool32 useCancel" },
  { name: 'WonderNews_RemoveScrollIndicatorArrowPair', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_AddScrollIndicatorArrowPair', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_GetInput', ret: "u32", arity: 1, params: "u16 input" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'gpu_regs.h',
  'palette.h',
  'decompress.h',
  'malloc.h',
  'menu.h',
  'pokemon_icon.h',
  'union_room.h',
  'list_menu.h',
  'text_window.h',
  'string_util.h',
  'link_rfu.h',
  'mystery_gift.h',
  'mystery_gift_menu.h',
  'mystery_gift_view.h',
  'constants/rgb.h',
  'constants/mystery_gift.h',
] as const;
