// AUTO-GENERATED from src/credits.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/credits.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr from .c (can't be evaluated): `RGB(7, 11, 6)` */
export const COLOR_DARK_GREEN_EXPR = "RGB(7, 11, 6)";
/** Raw expr from .c (can't be evaluated): `RGB(13, 20, 12)` */
export const COLOR_LIGHT_GREEN_EXPR = "RGB(13, 20, 12)";
export const TAG_MON_BG = 1001;
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tTaskId_BgScenery_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tTaskId_BikeScene_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tTaskId_SceneryPal_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tTaskId_ShowMons_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tEndCredits_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tPlayerSpriteId_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tRivalSpriteId_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[7]` */
export const tSceneNum_EXPR = "data[7]";
/** Raw expr from .c (can't be evaluated): `data[11]` */
export const tNextMode_EXPR = "data[11]";
/** Raw expr from .c (can't be evaluated): `data[12]` */
export const tTheEndDelay_EXPR = "data[12]";
/** Raw expr from .c (can't be evaluated): `data[13]` */
export const tCurrentMode_EXPR = "data[13]";
/** Raw expr from .c (can't be evaluated): `data[14]` */
export const tPrintedPage_EXPR = "data[14]";
/** Raw expr from .c (can't be evaluated): `data[15]` */
export const tTaskId_UpdatePage_EXPR = "data[15]";
export const NUM_MON_SLIDES = 71;
/** Raw expr from .c (can't be evaluated): `(MON_PIC_SIZE * 3)` */
export const MONBG_OFFSET_EXPR = "(MON_PIC_SIZE * 3)";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tMainTaskId_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tDelay_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tCurrentPage_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `(PAGE_COUNT / 9)` */
export const PAGE_INTERVAL_EXPR = "(PAGE_COUNT / 9)";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tPlayer_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tRival_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tSinIdx_EXPR = "data[5]";
export const TIMER_STOP = 32767;
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sPosition_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const sSpriteId_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sMonSpriteId_EXPR = "data[0]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_POS_0 = {
  POS_LEFT: 0,
  POS_CENTER: 1,
  POS_RIGHT: 2,
} as const;
export const ENUM_MODE_1 = {
  MODE_NONE: 0,
  MODE_BIKE_SCENE: 1,
  MODE_SHOW_MONS: 2,
} as const;

// ─── WindowTemplates ─────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 0, tilemapTop: 9, width: "DISPLAY_TILE_WIDTH", height: 12, paletteNum: 8, baseBlock: 1 } as const;

// ─── BgTemplates ─────────────────────────────────────────────────────────────
export const sBackgroundTemplates = { bg: 0, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sCredits_Pal': { path: 'graphics/credits/credits.pal', ext: '.gbapal', type: 'u16' },
};

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 12, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 8, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 6, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 8, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
  { palettes: "0x300", delay: 0, startY: 16, endY: 0, color: "COLOR_LIGHT_GREEN" },
  { palettes: "0x300", delay: 0, startY: 16, endY: 0, color: "COLOR_DARK_GREEN" },
  { palettes: "0x300", delay: 0, startY: 0, endY: 16, color: "COLOR_LIGHT_GREEN" },
  { palettes: "0x300", delay: 0, startY: 0, endY: 16, color: "COLOR_DARK_GREEN" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
export const TASK_NAMES = [
  'Task_BikeScene',
  'Task_CreditsMain',
  'Task_CreditsSoftReset',
  'Task_CreditsTheEnd1',
  'Task_CreditsTheEnd2',
  'Task_CreditsTheEnd3',
  'Task_CreditsTheEnd4',
  'Task_CreditsTheEnd5',
  'Task_CreditsTheEnd6',
  'Task_CycleSceneryPalette',
  'Task_LoadShowMons',
  'Task_ReadyBikeScene',
  'Task_ReadyShowMons',
  'Task_SetBikeScene',
  'Task_ShowMons',
  'Task_UpdatePage',
  'Task_WaitPaletteFade',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_Credits',
  'CB2_StartCreditsSequence',
] as const;
