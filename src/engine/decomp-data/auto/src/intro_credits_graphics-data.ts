// AUTO-GENERATED from src/intro_credits_graphics.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/intro_credits_graphics.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_BICYCLE = 1001;
export const TAG_BRENDAN = 1002;
export const TAG_MAY = 1003;
export const TAG_FLYGON_LATIOS = 1004;
export const TAG_FLYGON_LATIAS = 1005;
export const TAG_MOVING_SCENERY = 2000;
/** Raw expr: `data[0]` */
export const tMode_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tBg1Speed_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBg1PosHi_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBg1PosLo_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tBg2Speed_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tBg2PosHi_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tBg2PosLo_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tBg3Speed_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tBg3PosHi_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tBg3PosLo_EXPR = "data[9]";
/** Raw expr: `data[0]` */
export const tHasVerticalMove_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tXOffset_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tXPos_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const sPlayerSpriteId_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sLeftSpriteId_EXPR = "data[0]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Player = { y: "DISPLAY_HEIGHT", shape: "SPRITE_SHAPE(64x64)", size: "SPRITE_SIZE(64x64)", priority: 1 } as const;
export const sOamData_Bicycle = { y: "DISPLAY_HEIGHT", shape: "SPRITE_SHAPE(64x32)", size: "SPRITE_SIZE(64x32)", priority: 1 } as const;
export const sOamData_Flygon = { y: "DISPLAY_HEIGHT", shape: "SPRITE_SHAPE(64x64)", size: "SPRITE_SIZE(64x64)", priority: 1 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_MovingScenery = { tileTag: "TAG_MOVING_SCENERY", paletteTag: "TAG_NONE", oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_MovingScenery" } as const;
export const sSpriteTemplate_Brendan = { tileTag: "TAG_BRENDAN", paletteTag: "TAG_BRENDAN", oam: "&sOamData_Player", anims: "sAnims_Player", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Player" } as const;
export const sSpriteTemplate_May = { tileTag: "TAG_MAY", paletteTag: "TAG_MAY", oam: "&sOamData_Player", anims: "sAnims_Player", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Player" } as const;
export const sSpriteTemplate_BrendanBicycle = { tileTag: "TAG_BICYCLE", paletteTag: "TAG_BRENDAN", oam: "&sOamData_Bicycle", anims: "sAnims_Bicycle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Bicycle" } as const;
export const sSpriteTemplate_MayBicycle = { tileTag: "TAG_BICYCLE", paletteTag: "TAG_MAY", oam: "&sOamData_Bicycle", anims: "sAnims_Bicycle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Bicycle" } as const;
export const sSpriteTemplate_FlygonLatios = { tileTag: "TAG_FLYGON_LATIOS", paletteTag: "TAG_FLYGON_LATIOS", oam: "&sOamData_Flygon", anims: "sAnims_Flygon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_FlygonLeftHalf" } as const;
export const sSpriteTemplate_FlygonLatias = { tileTag: "TAG_FLYGON_LATIAS", paletteTag: "TAG_FLYGON_LATIAS", oam: "&sOamData_Flygon", anims: "sAnims_Flygon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_FlygonLeftHalf" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_Clouds = { data: "sClouds_Gfx", size: 1024, tag: "TAG_MOVING_SCENERY" } as const;
export const sSpriteSheet_TreesSmall = { data: "sTreesSmall_Gfx", size: 1024, tag: "TAG_MOVING_SCENERY" } as const;
export const sSpriteSheet_HouseSilhouette = { data: "sHouseSilhouette_Gfx", size: 1024, tag: "TAG_MOVING_SCENERY" } as const;
export const gSpriteSheet_IntroBrendan = { data: "gIntroBrendan_Gfx", size: 8192, tag: "TAG_BRENDAN" } as const;
export const gSpriteSheet_IntroMay = { data: "gIntroMay_Gfx", size: 8192, tag: "TAG_MAY" } as const;
export const gSpriteSheet_IntroBicycle = { data: "sBicycle_Gfx", size: 4096, tag: "TAG_BICYCLE" } as const;
export const sSpriteSheet_IntroFlygon_Unused = { data: "gIntroFlygon_Gfx", size: 4096, tag: "TAG_FLYGON_LATIOS" } as const;
export const gSpriteSheet_IntroFlygon = { data: "gIntroFlygon_Gfx", size: 4096, tag: "TAG_FLYGON_LATIAS" } as const;
export const gSpriteSheet_CreditsBrendan = { data: "sBrendanCredits_Gfx", size: 14336, tag: "TAG_BRENDAN" } as const;
export const gSpriteSheet_CreditsMay = { data: "sMayCredits_Gfx", size: 14336, tag: "TAG_MAY" } as const;
export const gSpriteSheet_CreditsBicycle = { data: "sBicycle_Gfx", size: 4096, tag: "TAG_BICYCLE" } as const;
export const sSpriteSheet_Latios = { data: "sLatios_Gfx", size: 4096, tag: "TAG_FLYGON_LATIOS" } as const;
export const sSpriteSheet_Latias = { data: "sLatias_Gfx", size: 4096, tag: "TAG_FLYGON_LATIAS" } as const;
export const gSpriteSheet_CreditsRivalBrendan = { data: "sBrendanCredits_Gfx", size: 8192, tag: "TAG_BRENDAN" } as const;
export const gSpriteSheet_CreditsRivalMay = { data: "sMayCredits_Gfx", size: 8192, tag: "TAG_MAY" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const gSpritePalettes_IntroPlayerFlygon = [
  { data: "gIntroPlayer_Pal", tag: "TAG_BRENDAN" },
  { data: "gIntroPlayer_Pal", tag: "TAG_MAY" },
  { data: "gIntroFlygon_Pal", tag: "TAG_FLYGON_LATIOS" },
  { data: "gIntroFlygon_Pal", tag: "TAG_FLYGON_LATIAS" },
] as const;
export const gSpritePalettes_Credits = [
  { data: "sBrendanCredits_Pal", tag: "TAG_BRENDAN" },
  { data: "sMayCredits_Pal", tag: "TAG_MAY" },
  { data: "sLatios_Pal", tag: "TAG_FLYGON_LATIOS" },
  { data: "sLatias_Pal", tag: "TAG_FLYGON_LATIAS" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sGrass_Pal': { path: 'graphics/intro/scene_2/grass.png', ext: '.gbapal', type: 'u16' },
  'sGrassSunset_Pal': { path: 'graphics/intro/scene_2/grass_sunset.pal', ext: '.gbapal', type: 'u16' },
  'sGrassNight_Pal': { path: 'graphics/intro/scene_2/grass_night.pal', ext: '.gbapal', type: 'u16' },
  'sGrass_Gfx': { path: 'graphics/intro/scene_2/grass.png', ext: '.4bpp.lz', type: 'u32' },
  'sGrass_Tilemap': { path: 'graphics/intro/scene_2/grass_map.bin', ext: '.lz', type: 'u32' },
  'sCloudsBg_Pal': { path: 'graphics/intro/scene_2/clouds_bg.pal', ext: '.gbapal', type: 'u16' },
  'sCloudsBgSunset_Pal': { path: 'graphics/intro/scene_2/clouds_bg_sunset.pal', ext: '.gbapal', type: 'u16' },
  'sCloudsBg_Gfx': { path: 'graphics/intro/scene_2/clouds_bg.png', ext: '.4bpp.lz', type: 'u32' },
  'sCloudsBg_Tilemap': { path: 'graphics/intro/scene_2/clouds_bg_map.bin', ext: '.lz', type: 'u32' },
  'sClouds_Pal': { path: 'graphics/intro/scene_2/clouds.png', ext: '.gbapal', type: 'u16' },
  'sCloudsSunset_Pal': { path: 'graphics/intro/scene_2/clouds_sunset.pal', ext: '.gbapal', type: 'u16' },
  'sClouds_Gfx': { path: 'graphics/intro/scene_2/clouds.png', ext: '.4bpp.lz', type: 'u32' },
  'sTrees_Pal': { path: 'graphics/intro/scene_2/trees.png', ext: '.gbapal', type: 'u16' },
  'sTreesSunset_Pal': { path: 'graphics/intro/scene_2/trees_sunset.pal', ext: '.gbapal', type: 'u16' },
  'sTrees_Gfx': { path: 'graphics/intro/scene_2/trees.png', ext: '.4bpp.lz', type: 'u32' },
  'sTrees_Tilemap': { path: 'graphics/intro/scene_2/trees_map.bin', ext: '.lz', type: 'u32' },
  'sTreesSmall_Pal': { path: 'graphics/intro/scene_2/trees_small.png', ext: '.gbapal', type: 'u16' },
  'sTreesSmall_Gfx': { path: 'graphics/intro/scene_2/trees_small.png', ext: '.4bpp.lz', type: 'u32' },
  'sHouses_Pal': { path: 'graphics/intro/scene_2/houses.pal', ext: '.gbapal', type: 'u16' },
  'sHouses_Gfx': { path: 'graphics/intro/scene_2/houses.png', ext: '.4bpp.lz', type: 'u32' },
  'sHouseSilhouette_Pal': { path: 'graphics/intro/scene_2/house_silhouette.png', ext: '.gbapal', type: 'u16' },
  'sHouses_Tilemap': { path: 'graphics/intro/scene_2/houses_map.bin', ext: '.lz', type: 'u32' },
  'sHouseSilhouette_Gfx': { path: 'graphics/intro/scene_2/house_silhouette.png', ext: '.4bpp.lz', type: 'u32' },
  'sBrendanCredits_Pal': { path: 'graphics/intro/scene_2/brendan_credits.png', ext: '.gbapal', type: 'u16' },
  'sBrendanCredits_Gfx': { path: 'graphics/intro/scene_2/brendan_credits.png', ext: '.4bpp.lz', type: 'u32' },
  'sMayCredits_Pal': { path: 'graphics/intro/scene_2/may_credits.png', ext: '.gbapal', type: 'u16' },
  'sMayCredits_Gfx': { path: 'graphics/intro/scene_2/may_credits.png', ext: '.4bpp.lz', type: 'u32' },
  'sBicycle_Gfx': { path: 'graphics/intro/scene_2/bicycle.png', ext: '.4bpp.lz', type: 'u32' },
  'sLatios_Pal': { path: 'graphics/intro/scene_2/latios.png', ext: '.gbapal', type: 'u16' },
  'sLatios_Gfx': { path: 'graphics/intro/scene_2/latios.png', ext: '.4bpp.lz', type: 'u32' },
  'sLatias_Pal': { path: 'graphics/intro/scene_2/latias.png', ext: '.gbapal', type: 'u16' },
  'sLatias_Gfx': { path: 'graphics/intro/scene_2/latias.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'gIntroCredits_MovingSceneryVBase', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gIntroCredits_MovingSceneryVOffset', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gIntroCredits_MovingSceneryState', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCB_MovingScenery', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Player', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Bicycle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_FlygonLeftHalf', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateCloudSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTreeSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateHouseSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Task_BicycleBgAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadIntroPart2Graphics', ret: "void", arity: 1, params: "u8 scenery" },
  { name: 'SetIntroPart2BgCnt', ret: "void", arity: 1, params: "u8 scenery" },
  { name: 'LoadCreditsSceneGraphics', ret: "void", arity: 1, params: "u8 scene" },
  { name: 'SetCreditsSceneBgCnt', ret: "void", arity: 1, params: "u8 scene" },
  { name: 'CreateBicycleBgAnimationTask', ret: "u8", arity: 4, params: "u8 mode, u16 bg1Speed, u16 bg2Speed, u16 bg3Speed" },
  { name: 'SetGpuReg', ret: "else", arity: 2, params: "REG_OFFSET_BG2VOFS, gIntroCredits_MovingSceneryVBase" },
  { name: 'CycleSceneryPalette', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'CreateMovingScenerySprites', ret: "void", arity: 4, params: "bool8 hasVerticalMove, const struct IntroCreditsSpriteMetadata *metadata, const union AnimCmd *const *anims, u8 numSprites" },
  { name: 'CreateIntroBrendanSprite', ret: "u8", arity: 2, params: "s16 x, s16 y" },
  { name: 'CreateIntroMaySprite', ret: "u8", arity: 2, params: "s16 x, s16 y" },
  { name: 'SpriteCB_FlygonRightHalf', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateIntroFlygonSprite_Unused', ret: "UNUSED", arity: 2, params: "s16 x, s16 y" },
  { name: 'CreateIntroFlygonSprite', ret: "u8", arity: 2, params: "s16 x, s16 y" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BicycleBgAnimation',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'intro_credits_graphics.h',
  'palette.h',
  'decompress.h',
  'gpu_regs.h',
  'task.h',
  'main.h',
  'graphics.h',
  'constants/rgb.h',
] as const;
