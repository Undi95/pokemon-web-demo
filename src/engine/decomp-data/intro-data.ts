// AUTO-GENERATED from src/intro.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
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
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
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
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sBigDropSpriteId_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tBg2PosHi_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tBg2PosLo_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tBg1PosHi_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tBg1PosLo_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tBg3PosHi_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tBg3PosLo_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tDelay_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tTimer_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tTimerSteps_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tNumSparkles_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sTimer_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tBgAnimTaskId_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tPlayerSpriteId_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tFlygonSpriteId_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tFlygonTimer_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sStateDelay_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sNextState_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const sCosYIdx_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const sSinXIdx_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const sSinYIdx_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const sFig8Loops_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sMoveTimer_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sDelay_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sSinIdx_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sCosIdx_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tAlpha_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tZoomDiv_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tZoomDivSpeed_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tWinPos_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tScreenX_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tScreenY_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tZoom_EXPR = "data[3]";
export const NARROW_HEIGHT = 32;
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tYShake_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tTrigIdx_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[7]` */
export const tPalIdx_EXPR = "data[7]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sRockId_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sSpeed_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const sTaskId_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sBaseY_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[7]` */
export const sUnk_EXPR = "data[7]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tCloudPos_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sPalIdx_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tRayquazaTaskId_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sLetterId_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const sColorDelay_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const sLetterX_EXPR = "data[3]";
export const COLOR_CHANGES = 9;
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sScale_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sRot_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
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

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
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

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 8, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL & ~1", delay: 3, startY: 0, endY: 16, color: "RGB_WHITE" },
  { palettes: "PALETTES_ALL & ~1", delay: 0, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL & ~1", delay: 3, startY: 0, endY: 16, color: "RGB_WHITE" },
  { palettes: "PALETTES_ALL & ~1", delay: 0, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_BG & ~1", delay: 3, startY: 0, endY: 16, color: "RGB(9" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_WHITE" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
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
