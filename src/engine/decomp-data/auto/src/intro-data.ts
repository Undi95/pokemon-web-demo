// AUTO-GENERATED from src/intro.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/intro.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_VOLBEAT = 1500;
export const TAG_TORCHIC = 1501;
export const TAG_MANECTRIC = 1502;
export const TAG_LIGHTNING = 1503;
export const TAG_BUBBLES = 1504;
export const TAG_SPARKLE = 1505;
export const GFXTAG_DROPS_LOGO = 2000;
export const PALTAG_DROPS = 2000;
export const PALTAG_LOGO = 2001;
export const TAG_FLYGON_SILHOUETTE = 2002;
export const TAG_RAYQUAZA_ORB = 2003;
export const COLOSSEUM_GAME_CODE = 1698063175;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
export const TIMER_BIG_DROP_START = 76;
export const TIMER_LOGO_APPEAR = 128;
export const TIMER_LOGO_LETTERS_COLOR = 144;
export const TIMER_BIG_DROP_FALLS = 251;
export const TIMER_LOGO_BLEND_OUT = 256;
export const TIMER_LOGO_DISAPPEAR = 272;
export const TIMER_SMALL_DROP_1 = 368;
export const TIMER_SMALL_DROP_2 = 384;
export const TIMER_SPARKLES = 560;
export const TIMER_FLYGON_SILHOUETTE_APPEAR = 832;
export const TIMER_END_PAN_UP = 904;
export const TIMER_END_SCENE_1 = 1007;
export const TIMER_START_SCENE_2 = 1026;
export const TIMER_MANECTRIC_ENTER = 1088;
export const TIMER_PLAYER_DRIFT_BACK = 1109;
export const TIMER_MANECTRIC_RUN_CIRCULAR = 1168;
export const TIMER_PLAYER_MOVE_FORWARD = 1214;
export const TIMER_TORCHIC_ENTER = 1224;
export const TIMER_FLYGON_ENTER = 1394;
export const TIMER_PLAYER_MOVE_BACKWARD = 1398;
export const TIMER_PLAYER_HOLD_POSITION = 1576;
export const TIMER_PLAYER_EXIT = 1727;
export const TIMER_TORCHIC_SPEED_UP = 1735;
export const TIMER_TORCHIC_EXIT = 1856;
export const TIMER_END_SCENE_2 = 1946;
export const TIMER_START_SCENE_3 = 2068;
export const TIMER_POKEBALL_FADE = 28;
export const TIMER_START_LEGENDARIES = 43;
export const NUM_BUBBLES_IN_SET = 6;
export const NUM_GF_LETTERS = 9;
/** Raw expr: `data[0]` */
export const sBigDropSpriteId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tBg2PosHi_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBg2PosLo_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBg1PosHi_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tBg1PosLo_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tBg3PosHi_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tBg3PosLo_EXPR = "data[6]";
/** Raw expr: `data[1]` */
export const tDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTimer_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tTimerSteps_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tNumSparkles_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const sTimer_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tBgAnimTaskId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tPlayerSpriteId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tFlygonSpriteId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tFlygonTimer_EXPR = "data[3]";
/** Raw expr: `data[1]` */
export const sStateDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sNextState_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sCosYIdx_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sSinXIdx_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sSinYIdx_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sFig8Loops_EXPR = "data[6]";
/** Raw expr: `data[1]` */
export const sMoveTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sDelay_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const sSinIdx_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sCosIdx_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tAlpha_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tZoomDiv_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tZoomDivSpeed_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tWinPos_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tScreenX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tScreenY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tZoom_EXPR = "data[3]";
export const NARROW_HEIGHT = 32;
/** Raw expr: `data[4]` */
export const tYShake_EXPR = "data[4]";
/** Raw expr: `data[6]` */
export const tTrigIdx_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tPalIdx_EXPR = "data[7]";
/** Raw expr: `data[1]` */
export const sRockId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSpeed_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const sTaskId_EXPR = "data[4]";
/** Raw expr: `data[2]` */
export const sBaseY_EXPR = "data[2]";
/** Raw expr: `data[7]` */
export const sUnk_EXPR = "data[7]";
/** Raw expr: `data[6]` */
export const tCloudPos_EXPR = "data[6]";
/** Raw expr: `data[1]` */
export const sPalIdx_EXPR = "data[1]";
/** Raw expr: `data[4]` */
export const tRayquazaTaskId_EXPR = "data[4]";
/** Raw expr: `data[2]` */
export const sLetterId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sColorDelay_EXPR = "data[3]";
/** Raw expr: `data[3]` */
export const sLetterX_EXPR = "data[3]";
export const COLOR_CHANGES = 9;
/** Raw expr: `data[1]` */
export const sScale_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sRot_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sPos_EXPR = "data[3]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_COPYRIGHT_0 = {
  COPYRIGHT_INITIALIZE: 0,
  COPYRIGHT_START_FADE: 140,
  COPYRIGHT_START_INTRO: 141,
} as const;
export const ENUM_TORCHIC_1 = {
  TORCHIC_ANIM_WALK: 0,
  TORCHIC_ANIM_RUN: 1,
  TORCHIC_ANIM_TRIP: 2,
} as const;
export const ENUM_DROP_2 = {
  DROP_ANIM_UPPER_HALF: 0,
  DROP_ANIM_LOWER_HALF: 1,
  DROP_ANIM_REFLECTION: 2,
  DROP_ANIM_RIPPLE: 3,
} as const;
export const ENUM_GAMEFREAK_3 = {
  GAMEFREAK_G: 0,
  GAMEFREAK_A: 1,
  GAMEFREAK_M: 2,
  GAMEFREAK_E: 3,
  GAMEFREAK_F: 4,
  GAMEFREAK_R: 5,
  GAMEFREAK_K: 6,
} as const;
export const ENUM_PRESENTS_4 = {
  PRESENTS_P: 0,
  PRESENTS_R: 1,
  PRESENTS_E: 2,
  PRESENTS_S: 3,
  PRESENTS_N: 4,
  PRESENTS_T: 5,
} as const;
export const ENUM_VOLBEAT_5 = {
  VOLBEAT_WAIT_ENTER: 0,
  VOLBEAT_ENTER: 1,
  VOLBEAT_ZIP_BACKWARD: 2,
  VOLBEAT_ZIP_DOWN: 3,
  VOLBEAT_ZIP_FORWARD: 4,
  VOLBEAT_INIT_FIGURE_8: 5,
  VOLBEAT_FIGURE_8: 6,
  VOLBEAT_EXIT: 7,
  VOLBEAT_WAIT_STATE: 8,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Sparkle = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Volbeat = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Torchic = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Manectric = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Lightning = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Bubbles = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_WaterDrop = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_GameFreakLetter = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_PresentsLetter = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_GameFreakLogo = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_BLEND", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_FlygonSilhouette = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_RayquazaOrb = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_Sparkle = { tileTag: "TAG_SPARKLE", paletteTag: "TAG_SPARKLE", oam: "&sOamData_Sparkle", anims: "sAnims_Sparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Sparkle" } as const;
export const sSpriteTemplate_Volbeat = { tileTag: "TAG_VOLBEAT", paletteTag: "TAG_VOLBEAT", oam: "&sOamData_Volbeat", anims: "sAnims_Volbeat", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Volbeat" } as const;
export const sSpriteTemplate_Torchic = { tileTag: "TAG_TORCHIC", paletteTag: "TAG_TORCHIC", oam: "&sOamData_Torchic", anims: "sAnims_Torchic", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Torchic" } as const;
export const sSpriteTemplate_Manectric = { tileTag: "TAG_MANECTRIC", paletteTag: "TAG_MANECTRIC", oam: "&sOamData_Manectric", anims: "sAnims_Manectric", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Manectric" } as const;
export const sSpriteTemplate_Lightning = { tileTag: "TAG_LIGHTNING", paletteTag: "TAG_LIGHTNING", oam: "&sOamData_Lightning", anims: "sAnims_Lightning", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Lightning" } as const;
export const sSpriteTemplate_Bubbles = { tileTag: "TAG_BUBBLES", paletteTag: "TAG_BUBBLES", oam: "&sOamData_Bubbles", anims: "sAnims_Bubbles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_KyogreBubbles" } as const;
export const sSpriteTemplate_WaterDrop = { tileTag: "GFXTAG_DROPS_LOGO", paletteTag: "PALTAG_DROPS", oam: "&sOamData_WaterDrop", anims: "sAnims_WaterDrop", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WaterDrop" } as const;
export const sSpriteTemplate_GameFreakLetter = { tileTag: "GFXTAG_DROPS_LOGO", paletteTag: "PALTAG_LOGO", oam: "&sOamData_GameFreakLetter", anims: "sAnims_GameFreakLetter", images: 0, affineAnims: "sAffineAnims_GameFreak", callback: "SpriteCB_LogoLetter" } as const;
export const sSpriteTemplate_PresentsLetter = { tileTag: "GFXTAG_DROPS_LOGO", paletteTag: "PALTAG_LOGO", oam: "&sOamData_PresentsLetter", anims: "sAnims_PresentsLetter", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_LogoLetter" } as const;
export const sSpriteTemplate_GameFreakLogo = { tileTag: "GFXTAG_DROPS_LOGO", paletteTag: "PALTAG_LOGO", oam: "&sOamData_GameFreakLogo", anims: "sAnims_GameFreakLogo", images: 0, affineAnims: "sAffineAnims_GameFreak", callback: "SpriteCB_GameFreakLogo" } as const;
export const sSpriteTemplate_FlygonSilhouette = { tileTag: "TAG_FLYGON_SILHOUETTE", paletteTag: "TAG_FLYGON_SILHOUETTE", oam: "&sOamData_FlygonSilhouette", anims: "sAnims_FlygonSilhouette", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_FlygonSilhouette" } as const;
export const sSpriteTemplate_RayquazaOrb = { tileTag: "TAG_RAYQUAZA_ORB", paletteTag: "TAG_RAYQUAZA_ORB", oam: "&sOamData_RayquazaOrb", anims: "sAnims_RayquazaOrb", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_RayquazaOrb" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sIntroDrops_Pal': { path: 'graphics/intro/scene_1/drops.pal', ext: '.gbapal', type: 'u16' },
  'sIntroLogo_Pal': { path: 'graphics/intro/scene_1/logo.pal', ext: '.gbapal', type: 'u16' },
  'sIntroDropsLogo_Gfx': { path: 'graphics/intro/scene_1/drops_logo.png', ext: '.4bpp.lz', type: 'u32' },
  'sIntro1Bg_Pal': { path: 'graphics/intro/scene_1/bg.pal', ext: '.gbapal', type: 'u16' },
  'sIntro1Bg0_Tilemap': { path: 'graphics/intro/scene_1/bg0_map.bin', ext: '.lz', type: 'u32' },
  'sIntro1Bg1_Tilemap': { path: 'graphics/intro/scene_1/bg1_map.bin', ext: '.lz', type: 'u32' },
  'sIntro1Bg2_Tilemap': { path: 'graphics/intro/scene_1/bg2_map.bin', ext: '.lz', type: 'u32' },
  'sIntro1Bg3_Tilemap': { path: 'graphics/intro/scene_1/bg3_map.bin', ext: '.lz', type: 'u32' },
  'sIntro1Bg_Gfx': { path: 'graphics/intro/scene_1/bg.png', ext: '.4bpp.lz', type: 'u32' },
  'sIntroPokeball_Pal': { path: 'graphics/intro/scene_3/pokeball.png', ext: '.gbapal', type: 'u16' },
  'sIntroPokeball_Tilemap': { path: 'graphics/intro/scene_3/pokeball_map.bin', ext: '.lz', type: 'u32' },
  'sIntroPokeball_Gfx': { path: 'graphics/intro/scene_3/pokeball.png', ext: '.8bpp.lz', type: 'u32' },
  'sIntroStreaks_Pal': { path: 'graphics/intro/scene_3/streaks.png', ext: '.gbapal', type: 'u16' },
  'sIntroStreaks_Gfx': { path: 'graphics/intro/scene_3/streaks.png', ext: '.4bpp.lz', type: 'u32' },
  'sIntroStreaks_Tilemap': { path: 'graphics/intro/scene_3/streaks_map.bin', ext: '.lz', type: 'u32' },
  'sIntroRayquzaOrb_Pal': { path: 'graphics/intro/scene_3/rayquaza_orb.pal', ext: '.gbapal', type: 'u16' },
  'sIntroMisc_Pal': { path: 'graphics/intro/scene_3/misc.pal', ext: '.gbapal', type: 'u16' },
  'sIntroMisc_Gfx': { path: 'graphics/intro/scene_3/misc.png', ext: '.4bpp.lz', type: 'u32' },
  'sIntroFlygonSilhouette_Pal': { path: 'graphics/intro/scene_1/flygon.png', ext: '.gbapal', type: 'u16' },
  'sIntroLati_Gfx': { path: 'graphics/intro/scene_1/lati.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sUnusedData: readonly number[] = [2,3,4,5,1,1,1,6,7,8,9,10,11,12,2,13,14,15,16,17,18,19,20,21,22,23,24,25,2,13,14,15,16,17,18,26,27,28,29,30,31,32,33,2,13,14,15,16,17,18,34,35,36,37,38,39,40,41,42,0] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'sIntroCharacterGender', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16 UNUSED", name: 'sUnusedVar', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sFlygonYOffset', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'gIntroFrameCounter', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "struct GcmbStruct", name: 'gMultibootProgramStruct', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_Scene1_Load', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene1_FadeIn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene1_WaterDrops', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene1_PanUp', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene1_End', ret: "void", arity: 1, params: "u8" },
  { name: 'IntroResetGpuRegs', ret: "void", arity: 0, params: "void" },
  { name: 'CreateGameFreakLogoSprites', ret: "u8", arity: 3, params: "s16, s16, s16" },
  { name: 'Task_BlendLogoIn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BlendLogoOut', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreateSparkles', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateWaterDrop', ret: "u8", arity: 6, params: "s16, s16, u16, u16, u16, u8" },
  { name: 'SpriteCB_WaterDrop', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_WaterDrop_Slide', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_WaterDrop_ReachLeafEnd', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_WaterDrop_DangleFromLeaf', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_WaterDrop_Fall', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_WaterDrop_Ripple', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Sparkle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_LogoLetter', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_GameFreakLogo', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_FlygonSilhouette', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Task_Scene2_Load', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene2_CreateSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene2_BikeRide', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene2_End', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_Torchic', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Manectric', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Volbeat', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Flygon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_PlayerOnBicycle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_Scene3_Load', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_SpinPokeball', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_WaitGroudon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_LoadGroudon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_InitGroudonBg', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_NarrowWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_EndNarrowWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_StartGroudon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_Groudon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_LoadKyogre', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_Kyogre', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_LoadClouds1', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_LoadClouds2', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_InitClouds', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_Clouds', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_LoadLightning', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_Lightning', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_LoadRayquazaAttack', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Scene3_Rayquaza', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_EndIntroMovie', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateGroudonRockSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateKyogreBubbleSprites_Body', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateKyogreBubbleSprites_Fins', ret: "void", arity: 0, params: "void" },
  { name: 'Task_RayquazaAttack', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_GroudonRocks', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_KyogreBubbles', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Lightning', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_RayquazaOrb', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'MainCB2_EndIntro', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Intro', ret: "void", arity: 0, params: "void" },
  { name: 'MainCB2_Intro', ret: "void", arity: 0, params: "void" },
  { name: 'LoadCopyrightGraphics', ret: "void", arity: 3, params: "u16 tilesetAddress, u16 tilemapAddress, u16 paletteOffset" },
  { name: 'SerialCB_CopyrightScreen', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpCopyrightScreen', ret: "u8", arity: 0, params: "void" },
  { name: 'CB2_InitCopyrightScreenAfterBootup', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitCopyrightScreenAfterTitleScreen', ret: "void", arity: 0, params: "void" },
  { name: 'LoadCompressedSpriteSheet', ret: "else", arity: 1, params: "gSpriteSheet_IntroMay" },
  { name: 'PanFadeAndZoomScreen', ret: "void", arity: 4, params: "u16 screenX, u16 screenY, u16 zoom, u16 alpha" },
  { name: 'SpriteCB_WaterDropHalf', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_WaterDropShort', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BlendLogoIn',
  'Task_BlendLogoOut',
  'Task_CreateSparkles',
  'Task_EndIntroMovie',
  'Task_RayquazaAttack',
  'Task_Scene1_End',
  'Task_Scene1_FadeIn',
  'Task_Scene1_Load',
  'Task_Scene1_PanUp',
  'Task_Scene1_WaterDrops',
  'Task_Scene2_BikeRide',
  'Task_Scene2_CreateSprites',
  'Task_Scene2_End',
  'Task_Scene2_Load',
  'Task_Scene3_Clouds',
  'Task_Scene3_EndNarrowWindow',
  'Task_Scene3_Groudon',
  'Task_Scene3_InitClouds',
  'Task_Scene3_InitGroudonBg',
  'Task_Scene3_Kyogre',
  'Task_Scene3_Lightning',
  'Task_Scene3_Load',
  'Task_Scene3_LoadClouds1',
  'Task_Scene3_LoadClouds2',
  'Task_Scene3_LoadGroudon',
  'Task_Scene3_LoadKyogre',
  'Task_Scene3_LoadLightning',
  'Task_Scene3_LoadRayquazaAttack',
  'Task_Scene3_NarrowWindow',
  'Task_Scene3_Rayquaza',
  'Task_Scene3_SpinPokeball',
  'Task_Scene3_StartGroudon',
  'Task_Scene3_WaitGroudon',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitCopyrightScreenAfterBootup',
  'CB2_InitCopyrightScreenAfterTitleScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'palette.h',
  'scanline_effect.h',
  'task.h',
  'title_screen.h',
  'libgcnmultiboot.h',
  'malloc.h',
  'gpu_regs.h',
  'link.h',
  'multiboot_pokemon_colosseum.h',
  'load_save.h',
  'save.h',
  'new_game.h',
  'm4a.h',
  'random.h',
  'decompress.h',
  'constants/songs.h',
  'intro_credits_graphics.h',
  'trig.h',
  'intro.h',
  'graphics.h',
  'sound.h',
  'util.h',
  'title_screen.h',
  'constants/rgb.h',
  'constants/battle_anim.h',
] as const;
