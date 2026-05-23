// AUTO-GENERATED from src/credits.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/credits.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `RGB(7, 11, 6)` */
export const COLOR_DARK_GREEN_EXPR = "RGB(7, 11, 6)";
/** Raw expr: `RGB(13, 20, 12)` */
export const COLOR_LIGHT_GREEN_EXPR = "RGB(13, 20, 12)";
export const TAG_MON_BG = 1001;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tTaskId_BgScenery_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTaskId_BikeScene_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTaskId_SceneryPal_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tTaskId_ShowMons_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tEndCredits_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tPlayerSpriteId_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tRivalSpriteId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tSceneNum_EXPR = "data[7]";
/** Raw expr: `data[11]` */
export const tNextMode_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tTheEndDelay_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tCurrentMode_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tPrintedPage_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tTaskId_UpdatePage_EXPR = "data[15]";
export const NUM_MON_SLIDES = 71;
/** Raw expr: `(MON_PIC_SIZE * 3)` */
export const MONBG_OFFSET_EXPR = "(MON_PIC_SIZE * 3)";
/** Raw expr: `data[1]` */
export const tMainTaskId_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tDelay_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const tCurrentPage_EXPR = "data[2]";
/** Raw expr: `(PAGE_COUNT / 9)` */
export const PAGE_INTERVAL_EXPR = "(PAGE_COUNT / 9)";
/** Raw expr: `data[2]` */
export const tPlayer_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tRival_EXPR = "data[3]";
/** Raw expr: `data[5]` */
export const tSinIdx_EXPR = "data[5]";
export const TIMER_STOP = 32767;
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sPosition_EXPR = "data[1]";
/** Raw expr: `data[6]` */
export const sSpriteId_EXPR = "data[6]";
/** Raw expr: `data[0]` */
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

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 0, tilemapTop: 9, width: "DISPLAY_TILE_WIDTH", height: 12, paletteNum: 8, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBackgroundTemplates = { bg: 0, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_MonBg = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_CreditsMonBg = { tileTag: "TAG_MON_BG", paletteTag: "TAG_MON_BG", oam: "&sOamData_MonBg", anims: "sAnims_MonBg", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CreditsMonBg" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sCredits_Pal': { path: 'graphics/credits/credits.pal', ext: '.gbapal', type: 'u16' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "s16 UNUSED", name: 'sUnkVar', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sSavedTaskId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gHasHallOfFameRecords', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sUsedSpeedUp', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCB_CreditsMonBg', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_WaitPaletteFade', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsMain', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ReadyBikeScene', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SetBikeScene', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LoadShowMons', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ReadyShowMons', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsTheEnd1', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsTheEnd2', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsTheEnd3', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsTheEnd4', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsTheEnd5', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsTheEnd6', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CreditsSoftReset', ret: "void", arity: 1, params: "u8" },
  { name: 'ResetGpuAndVram', ret: "void", arity: 0, params: "void" },
  { name: 'Task_UpdatePage', ret: "void", arity: 1, params: "u8" },
  { name: 'CheckChangeScene', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'Task_ShowMons', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CycleSceneryPalette', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BikeScene', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadBikeScene', ret: "bool8", arity: 2, params: "u8 data, u8" },
  { name: 'ResetCreditsTasks', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadTheEndScreen', ret: "void", arity: 3, params: "u16, u16, u16" },
  { name: 'DrawTheEnd', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'SpriteCB_Player', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Rival', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateCreditsMonSprite', ret: "u8", arity: 4, params: "u16, s16, s16, u16" },
  { name: 'DeterminePokemonToShow', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Credits', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_Credits', ret: "void", arity: 0, params: "void" },
  { name: 'InitCreditsBgsAndWindows', ret: "void", arity: 0, params: "void" },
  { name: 'FreeCreditsBgsAndWindows', ret: "void", arity: 0, params: "void" },
  { name: 'PrintCreditsText', ret: "void", arity: 3, params: "const u8 *string, u8 y, bool8 isTitle" },
  { name: 'CB2_StartCreditsSequence', ret: "void", arity: 0, params: "void" },
  { name: 'BeginNormalPaletteFade', ret: "else", arity: 5, params: "0x300, 0, 16, 0, COLOR_DARK_GREEN" },
  { name: 'SetBikeScene', ret: "void", arity: 2, params: "u8 scene, u8 taskId" },
  { name: 'StartSpriteAnimIfDifferent', ret: "else", arity: 2, params: "sprite, 2" },
  { name: 'SpriteCB_CreditsMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
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

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'palette.h',
  'main.h',
  'task.h',
  'bg.h',
  'malloc.h',
  'window.h',
  'text.h',
  'menu.h',
  'international_string_util.h',
  'constants/songs.h',
  'gpu_regs.h',
  'm4a.h',
  'constants/rgb.h',
  'trainer_pokemon_sprites.h',
  'starter_choose.h',
  'decompress.h',
  'intro_credits_graphics.h',
  'sound.h',
  'trig.h',
  'graphics.h',
  'pokedex.h',
  'event_data.h',
  'random.h',
  'data/credits.h',
] as const;
