// AUTO-GENERATED from src/map_name_popup.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/map_name_popup.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const POPUP_OFFSCREEN_Y = 40;
export const POPUP_SLIDE_SPEED = 2;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tOnscreenTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tYOffset_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tIncomingPopUp_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tPrintTimer_EXPR = "data[4]";
export const TILE_TOP_EDGE_START = 541;
export const TILE_TOP_EDGE_END = 552;
export const TILE_LEFT_EDGE_TOP = 553;
export const TILE_RIGHT_EDGE_TOP = 554;
export const TILE_LEFT_EDGE_MID = 555;
export const TILE_RIGHT_EDGE_MID = 556;
export const TILE_LEFT_EDGE_BOT = 557;
export const TILE_RIGHT_EDGE_BOT = 558;
export const TILE_BOT_EDGE_START = 559;
export const TILE_BOT_EDGE_END = 570;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MapPopUp_Themes = {
  MAPPOPUP_THEME_WOOD: 0,
  MAPPOPUP_THEME_MARBLE: 1,
  MAPPOPUP_THEME_STONE: 2,
  MAPPOPUP_THEME_BRICK: 3,
  MAPPOPUP_THEME_UNDERWATER: 4,
  MAPPOPUP_THEME_STONE2: 5,
} as const;
export const ENUM_STATE_0 = {
  STATE_SLIDE_IN: 0,
  STATE_WAIT: 1,
  STATE_SLIDE_OUT: 2,
  STATE_UNUSED: 3,
  STATE_ERASE: 4,
  STATE_END: 5,
  STATE_PRINT: 6,
} as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sBattlePyramid_MapHeaderStrings = ['sText_PyramidFloor1', 'sText_PyramidFloor2', 'sText_PyramidFloor3', 'sText_PyramidFloor4', 'sText_PyramidFloor5', 'sText_PyramidFloor6', 'sText_PyramidFloor7', 'sText_Pyramid'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sPopupTaskId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_MapNamePopUpWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowMapNamePopUpWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMapNamePopUpWindowBg', ret: "void", arity: 0, params: "void" },
  { name: 'StartMenu_ShowMapNamePopup', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'ShowMapNamePopup', ret: "void", arity: 0, params: "void" },
  { name: 'HideMapNamePopUpWindow', ret: "void", arity: 0, params: "void" },
  { name: 'DrawMapNamePopUpFrame', ret: "void", arity: 6, params: "u8 bg, u8 x, u8 y, u8 deltaX, u8 deltaY, u8 unused" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_MapNamePopUpWindow',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_pyramid.h',
  'bg.h',
  'event_data.h',
  'gpu_regs.h',
  'international_string_util.h',
  'menu.h',
  'map_name_popup.h',
  'palette.h',
  'region_map.h',
  'start_menu.h',
  'string_util.h',
  'task.h',
  'text.h',
  'constants/battle_frontier.h',
  'constants/layouts.h',
  'constants/region_map_sections.h',
  'constants/weather.h',
] as const;
