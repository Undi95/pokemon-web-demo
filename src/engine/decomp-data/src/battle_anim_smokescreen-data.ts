// AUTO-GENERATED from src/battle_anim_smokescreen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_smokescreen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_SMOKESCREEN = 55019;
export const PALTAG_SHADOW = 55039;
export const GFXTAG_SHADOW = 55129;
/** Raw expr: `data[0]` */
export const sActiveSprites_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sPersist_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sMainSpriteId_EXPR = "data[0]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_SmokescreenImpact = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_EnemyShadow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSmokescreenImpactSpriteTemplate = { tileTag: "TAG_SMOKESCREEN", paletteTag: "TAG_SMOKESCREEN", oam: "&sOamData_SmokescreenImpact", anims: "sAnims_SmokescreenImpact", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SmokescreenImpact" } as const;
export const gSpriteTemplate_EnemyShadow = { tileTag: "GFXTAG_SHADOW", paletteTag: "PALTAG_SHADOW", oam: "&sOamData_EnemyShadow", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SetInvisible" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSmokescreenImpactSpriteSheet = { data: "gSmokescreenImpactTiles", size: 384, tag: "TAG_SMOKESCREEN" } as const;
export const gSpriteSheet_EnemyShadow = { data: "gEnemyMonShadow_Gfx", size: 128, tag: "GFXTAG_SHADOW" } as const;

// ─── CompressedSpritePalette ─────────────────────────────────────────────────────────────
export const sSmokescreenImpactSpritePalette = { data: "gSmokescreenImpactPalette", tag: "TAG_SMOKESCREEN" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCB_SmokescreenImpactMain', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_SmokescreenImpact', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SmokescreenImpact', ret: "u8", arity: 3, params: "s16 x, s16 y, bool8 persist" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_gfx_sfx_util.h',
  'data.h',
  'decompress.h',
  'graphics.h',
  'sprite.h',
  'util.h',
  'constants/battle_palace.h',
] as const;
