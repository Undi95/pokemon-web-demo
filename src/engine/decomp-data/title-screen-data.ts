// AUTO-GENERATED from src/title_screen.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/title_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const VERSION_BANNER_RIGHT_TILEOFFSET = 64;
export const VERSION_BANNER_LEFT_X = 98;
export const VERSION_BANNER_RIGHT_X = 162;
export const VERSION_BANNER_Y = 4;
export const VERSION_BANNER_Y_GOAL = 68;
export const START_BANNER_X = 128;
/** Raw expr from .c (can't be evaluated): `(B_BUTTON | SELECT_BUTTON | DPAD_UP)` */
export const CLEAR_SAVE_BUTTON_COMBO_EXPR = "(B_BUTTON | SELECT_BUTTON | DPAD_UP)";
/** Raw expr from .c (can't be evaluated): `(B_BUTTON | SELECT_BUTTON | DPAD_LEFT)` */
export const RESET_RTC_BUTTON_COMBO_EXPR = "(B_BUTTON | SELECT_BUTTON | DPAD_LEFT)";
/** Raw expr from .c (can't be evaluated): `(B_BUTTON | SELECT_BUTTON)` */
export const BERRY_UPDATE_BUTTON_COMBO_EXPR = "(B_BUTTON | SELECT_BUTTON)";
/** Raw expr from .c (can't be evaluated): `(A_BUTTON | B_BUTTON | START_BUTTON | SELECT_BUTTON)` */
export const A_B_START_SELECT_EXPR = "(A_BUTTON | B_BUTTON | START_BUTTON | SELECT_BUTTON)";
export const NUM_PRESS_START_FRAMES = 5;
export const NUM_COPYRIGHT_FRAMES = 5;
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tCounter_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tSkipToNext_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tPointless_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tBg2Y_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tBg1Y_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sAlphaBlendIdx_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sParentTaskId_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sAnimate_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sTimer_EXPR = "data[1]";
export const SHINE_SPEED = 4;
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sMode_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sBgColor_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_TAG_0 = {
  TAG_VERSION: 1000,
  TAG_PRESS_START_COPYRIGHT: 1001,
  TAG_LOGO_SHINE: 1002,
} as const;
export const ENUM_SHINE_1 = {
  SHINE_MODE_SINGLE_NO_BG_COLOR: 0,
  SHINE_MODE_DOUBLE: 1,
  SHINE_MODE_SINGLE: 2,
} as const;

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUnusedUnknownPal': { path: 'graphics/title_screen/unused.pal', ext: '.gbapal', type: 'u16' },
  'sTitleScreenRayquazaGfx': { path: 'graphics/title_screen/rayquaza.png', ext: '.4bpp.lz', type: 'u32' },
  'sTitleScreenRayquazaTilemap': { path: 'graphics/title_screen/rayquaza.bin', ext: '.lz', type: 'u32' },
  'sTitleScreenLogoShineGfx': { path: 'graphics/title_screen/logo_shine.png', ext: '.4bpp.lz', type: 'u32' },
  'sTitleScreenCloudsGfx': { path: 'graphics/title_screen/clouds.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 1, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
export const TASK_NAMES = [
  'Task_TitleScreenPhase1',
  'Task_TitleScreenPhase2',
  'Task_TitleScreenPhase3',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_GoToBerryFixScreen',
  'CB2_GoToClearSaveDataScreen',
  'CB2_GoToCopyrightScreen',
  'CB2_GoToMainMenu',
  'CB2_GoToResetRtcScreen',
  'CB2_InitTitleScreen',
] as const;
