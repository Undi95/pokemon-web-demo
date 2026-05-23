// AUTO-GENERATED from src/item_menu_icons.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/item_menu_icons.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_BERRY_CHECK_CIRCLE_GFX = 10000;
export const TAG_BERRY_PIC_PAL = 30020;
/** Raw expr: `data[0]` */
export const sPocketId_EXPR = "data[0]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_TAG_0 = {
  TAG_BAG_GFX: 100,
  TAG_ROTATING_BALL_GFX: 101,
  TAG_ITEM_ICON: 102,
  TAG_ITEM_ICON_ALT: 103,
} as const;
export const ENUM_ANIM_1 = {
  ANIM_BAG_NORMAL: 0,
  ANIM_BAG_SHAKE: 1,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sBagOamData = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sRotatingBallOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 4, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sBerryPicOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 7, affineParam: 0 } as const;
export const sBerryPicRotatingOamData = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 7, affineParam: 0 } as const;
export const sBerryCheckCircleOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sBagSpriteTemplate = { tileTag: "TAG_BAG_GFX", paletteTag: "TAG_BAG_GFX", oam: "&sBagOamData", anims: "sBagSpriteAnimTable", images: 0, affineAnims: "sBagAffineAnimCmds", callback: "SpriteCallbackDummy" } as const;
export const sRotatingBallSpriteTemplate = { tileTag: "TAG_ROTATING_BALL_GFX", paletteTag: "TAG_ROTATING_BALL_GFX", oam: "&sRotatingBallOamData", anims: "sRotatingBallSpriteAnimTable", images: 0, affineAnims: "sRotatingBallAnimCmds", callback: "SpriteCB_SwitchPocketRotatingBallInit" } as const;
export const sBerryPicSpriteTemplate = { tileTag: "TAG_NONE", paletteTag: "TAG_BERRY_PIC_PAL", oam: "&sBerryPicOamData", anims: "sBerryPicSpriteAnimTable", images: "sBerryPicSpriteImageTable", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sBerryPicRotatingSpriteTemplate = { tileTag: "TAG_NONE", paletteTag: "TAG_BERRY_PIC_PAL", oam: "&sBerryPicRotatingOamData", anims: "sBerryPicSpriteAnimTable", images: "sBerryPicSpriteImageTable", affineAnims: "sBerryPicRotatingAnimCmds", callback: "SpriteCallbackDummy" } as const;
export const sBerryCheckCircleSpriteTemplate = { tileTag: "TAG_BERRY_CHECK_CIRCLE_GFX", paletteTag: "TAG_BERRY_CHECK_CIRCLE_GFX", oam: "&sBerryCheckCircleOamData", anims: "sBerryCheckCircleSpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sRotatingBall_Pal': { path: 'graphics/bag/rotating_ball.png', ext: '.gbapal', type: 'u16' },
  'sRotatingBall_Gfx': { path: 'graphics/bag/rotating_ball.png', ext: '.4bpp', type: 'u8' },
  'sCherryUnused': { path: 'graphics/unused/cherry.png', ext: '.4bpp', type: 'u8' },
  'sCherryUnused_Pal': { path: 'graphics/unused/cherry.png', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCB_BagVisualSwitchingPockets', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ShakeBagSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_SwitchPocketRotatingBallInit', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_SwitchPocketRotatingBallContinue', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'RemoveBagSprite', ret: "void", arity: 1, params: "u8 id" },
  { name: 'AddBagVisualSprite', ret: "void", arity: 1, params: "u8 bagPocketId" },
  { name: 'SetBagVisualPocketId', ret: "void", arity: 2, params: "u8 bagPocketId, bool8 isSwitchingPockets" },
  { name: 'ShakeBagSprite', ret: "void", arity: 0, params: "void" },
  { name: 'AddSwitchPocketRotatingBallSprite', ret: "void", arity: 1, params: "s16 rotationDirection" },
  { name: 'UpdateSwitchPocketRotatingBallCoords', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AddBagItemIconSprite', ret: "void", arity: 2, params: "u16 itemId, u8 id" },
  { name: 'RemoveBagItemIconSprite', ret: "void", arity: 1, params: "u8 id" },
  { name: 'CreateItemMenuSwapLine', ret: "void", arity: 0, params: "void" },
  { name: 'SetItemMenuSwapLineInvisibility', ret: "void", arity: 1, params: "bool8 invisible" },
  { name: 'UpdateItemMenuSwapLinePos', ret: "void", arity: 1, params: "u8 y" },
  { name: 'ArrangeBerryGfx', ret: "void", arity: 2, params: "void *src, void *dest" },
  { name: 'LoadBerryGfx', ret: "void", arity: 1, params: "u8 berryId" },
  { name: 'CreateBerryTagSprite', ret: "u8", arity: 3, params: "u8 id, s16 x, s16 y" },
  { name: 'FreeBerryTagSpritePalette', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSpinningBerrySprite', ret: "u8", arity: 4, params: "u8 berryId, u8 x, u8 y, bool8 startAffine" },
  { name: 'CreateBerryFlavorCircleSprite', ret: "u8", arity: 1, params: "s16 x" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'berry.h',
  'decompress.h',
  'graphics.h',
  'item.h',
  'item_menu.h',
  'item_icon.h',
  'item_menu_icons.h',
  'menu_helpers.h',
  'sprite.h',
  'window.h',
  'constants/items.h',
] as const;
