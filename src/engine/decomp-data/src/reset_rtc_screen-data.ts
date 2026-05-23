// AUTO-GENERATED from src/reset_rtc_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/reset_rtc_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const PALTAG_ARROW = 4096;
/** Raw expr: `data[0]` */
export const tFinished_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSetTime_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tSelection_EXPR = "data[2]";
/** Raw expr: `data[DATAIDX_DAYS]` */
export const tDays_EXPR = "data[DATAIDX_DAYS]";
/** Raw expr: `data[DATAIDX_HOURS]` */
export const tHours_EXPR = "data[DATAIDX_HOURS]";
/** Raw expr: `data[DATAIDX_MINS]` */
export const tMinutes_EXPR = "data[DATAIDX_MINS]";
/** Raw expr: `data[DATAIDX_SECS]` */
export const tSeconds_EXPR = "data[DATAIDX_SECS]";
/** Raw expr: `data[DATAIDX_CONFIRM]` */
export const tConfirm_EXPR = "data[DATAIDX_CONFIRM]";
/** Raw expr: `data[8]` */
export const tWindowId_EXPR = "data[8]";
/** Raw expr: `data[0]` */
export const sTaskId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sState_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSubTaskId_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_DATAIDX_0 = {
  DATAIDX_DAYS: 3,
  DATAIDX_HOURS: 4,
  DATAIDX_MINS: 5,
  DATAIDX_SECS: 6,
  DATAIDX_CONFIRM: 7,
} as const;
export const ENUM_SELECTION_1 = {
  SELECTION_DAYS: 1,
  SELECTION_HOURS: 2,
  SELECTION_MINS: 3,
  SELECTION_SECS: 4,
  SELECTION_CONFIRM: 5,
  SELECTION_NONE: 6,
} as const;
export const ENUM_WIN_2 = {
  WIN_TIME: 0,
  WIN_MSG: 1,
} as const;
export const ENUM_ARROW_3 = {
  ARROW_DOWN: 0,
  ARROW_UP: 1,
  ARROW_RIGHT: 2,
} as const;
export const ENUM_MAINSTATE_4 = {
  MAINSTATE_FADE_IN: 0,
  MAINSTATE_CHECK_SAVE: 1,
  MAINSTATE_START_SET_TIME: 2,
  MAINSTATE_WAIT_SET_TIME: 3,
  MAINSTATE_SAVE: 4,
  MAINSTATE_WAIT_EXIT: 5,
  MAINSTATE_EXIT: 6,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 19, height: 9, paletteNum: 15, baseBlock: 341 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 233 },
] as const;
export const sInputTimeWindow = { bg: 0, tilemapLeft: 4, tilemapTop: 9, width: 21, height: 2, paletteNum: 15, baseBlock: 191 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Arrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_Arrow = { tileTag: "TAG_NONE", paletteTag: "PALTAG_ARROW", oam: "&sOamData_Arrow", anims: "sAnims_Arrow", images: "sPicTable_Arrow", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sArrowDown_Gfx': { path: 'graphics/reset_rtc_screen/arrow_down.png', ext: '.4bpp', type: 'u8' },
  'sArrowRight_Gfx': { path: 'graphics/reset_rtc_screen/arrow_right.png', ext: '.4bpp', type: 'u8' },
  'sArrow_Pal': { path: 'graphics/reset_rtc_screen/arrow.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_ResetRtcScreen', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ResetRtcScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitResetRtcScreenBgAndWindows', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Cursor_UpOrRight', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Cursor_Down', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateCursor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FreeCursorPalette', ret: "void", arity: 0, params: "void" },
  { name: 'HideChooseTimeWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'PrintTime', ret: "void", arity: 7, params: "u8 windowId, u8 x, u8 y, u16 days, u8 hours, u8 minutes, u8 seconds" },
  { name: 'ShowChooseTimeWindow', ret: "void", arity: 5, params: "u8 windowId, u16 days, u8 hours, u8 minutes, u8 seconds" },
  { name: 'MoveTimeUpDown', ret: "bool32", arity: 4, params: "s16 *val, int minVal, int maxVal, u16 keys" },
  { name: 'Task_ResetRtc_SetFinished', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ResetRtc_Exit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ResetRtc_HandleInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ResetRtc_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CB2_InitResetRtcScreen', ret: "void", arity: 0, params: "void" },
  { name: 'ShowMessage', ret: "void", arity: 1, params: "const u8 *str" },
  { name: 'Task_ShowResetRtcPrompt', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ResetRtcScreen',
  'Task_ResetRtc_Exit',
  'Task_ResetRtc_HandleInput',
  'Task_ResetRtc_Init',
  'Task_ResetRtc_SetFinished',
  'Task_ShowResetRtcPrompt',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitResetRtcScreen',
  'CB2_ResetRtcScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'reset_rtc_screen.h',
  'event_data.h',
  'main.h',
  'menu.h',
  'palette.h',
  'rtc.h',
  'save.h',
  'sprite.h',
  'constants/songs.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'scanline_effect.h',
  'bg.h',
  'window.h',
  'gpu_regs.h',
  'constants/rgb.h',
] as const;
