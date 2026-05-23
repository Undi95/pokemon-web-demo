// AUTO-GENERATED from src/option_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/option_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tMenuSelection_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTextSpeed_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBattleSceneOff_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBattleStyle_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tSound_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tButtonMode_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tWindowFrameType_EXPR = "data[6]";
/** Raw expr: `(MENUITEM_TEXTSPEED * 16)` */
export const YPOS_TEXTSPEED_EXPR = "(MENUITEM_TEXTSPEED * 16)";
/** Raw expr: `(MENUITEM_BATTLESCENE * 16)` */
export const YPOS_BATTLESCENE_EXPR = "(MENUITEM_BATTLESCENE * 16)";
/** Raw expr: `(MENUITEM_BATTLESTYLE * 16)` */
export const YPOS_BATTLESTYLE_EXPR = "(MENUITEM_BATTLESTYLE * 16)";
/** Raw expr: `(MENUITEM_SOUND * 16)` */
export const YPOS_SOUND_EXPR = "(MENUITEM_SOUND * 16)";
/** Raw expr: `(MENUITEM_BUTTONMODE * 16)` */
export const YPOS_BUTTONMODE_EXPR = "(MENUITEM_BUTTONMODE * 16)";
/** Raw expr: `(MENUITEM_FRAMETYPE * 16)` */
export const YPOS_FRAMETYPE_EXPR = "(MENUITEM_FRAMETYPE * 16)";
export const TILE_TOP_CORNER_L = 418;
export const TILE_TOP_EDGE = 419;
export const TILE_TOP_CORNER_R = 420;
export const TILE_LEFT_EDGE = 421;
export const TILE_RIGHT_EDGE = 423;
export const TILE_BOT_CORNER_L = 424;
export const TILE_BOT_EDGE = 425;
export const TILE_BOT_CORNER_R = 426;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MENUITEM_0 = {
  MENUITEM_TEXTSPEED: 0,
  MENUITEM_BATTLESCENE: 1,
  MENUITEM_BATTLESTYLE: 2,
  MENUITEM_SOUND: 3,
  MENUITEM_BUTTONMODE: 4,
  MENUITEM_FRAMETYPE: 5,
  MENUITEM_CANCEL: 6,
  MENUITEM_COUNT: 7,
} as const;
export const ENUM_WIN_1 = {
  WIN_HEADER: 0,
  WIN_OPTIONS: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sOptionMenuWinTemplates = [
  { bg: 1, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 2, paletteNum: 1, baseBlock: 2 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 5, width: 26, height: 14, paletteNum: 1, baseBlock: 54 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sOptionMenuBgTemplates = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 0, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sOptionMenuText_Pal': { path: 'graphics/interface/option_menu_text.pal', ext: '.gbapal', type: 'u16' },
  'sEqualSignGfx': { path: 'graphics/interface/option_menu_equals_sign.png', ext: '.4bpp', type: 'u8' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const sOptionMenuBg_Pal_COLORS = [{r:136,g:144,b:248}] as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sOptionMenuItemsNames = ['gText_TextSpeed', 'gText_BattleScene', 'gText_BattleStyle', 'gText_Sound', 'gText_ButtonMode', 'gText_Frame', 'gText_OptionMenuCancel'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sArrowPressed', isArray: false, init: "FALSE" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_OptionMenuFadeIn', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_OptionMenuProcessInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_OptionMenuSave', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_OptionMenuFadeOut', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'HighlightOptionMenuItem', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'TextSpeed_ProcessInput', ret: "u8", arity: 1, params: "u8 selection" },
  { name: 'TextSpeed_DrawChoices', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'BattleScene_ProcessInput', ret: "u8", arity: 1, params: "u8 selection" },
  { name: 'BattleScene_DrawChoices', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'BattleStyle_ProcessInput', ret: "u8", arity: 1, params: "u8 selection" },
  { name: 'BattleStyle_DrawChoices', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'Sound_ProcessInput', ret: "u8", arity: 1, params: "u8 selection" },
  { name: 'Sound_DrawChoices', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'FrameType_ProcessInput', ret: "u8", arity: 1, params: "u8 selection" },
  { name: 'FrameType_DrawChoices', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'ButtonMode_ProcessInput', ret: "u8", arity: 1, params: "u8 selection" },
  { name: 'ButtonMode_DrawChoices', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'DrawHeaderText', ret: "void", arity: 0, params: "void" },
  { name: 'DrawOptionMenuTexts', ret: "void", arity: 0, params: "void" },
  { name: 'DrawBgWindowFrames', ret: "void", arity: 0, params: "void" },
  { name: 'MainCB2', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitOptionMenu', ret: "void", arity: 0, params: "void" },
  { name: 'DrawOptionMenuChoice', ret: "void", arity: 4, params: "const u8 *text, u8 x, u8 y, u8 style" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_OptionMenuFadeIn',
  'Task_OptionMenuFadeOut',
  'Task_OptionMenuProcessInput',
  'Task_OptionMenuSave',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitOptionMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'option_menu.h',
  'bg.h',
  'gpu_regs.h',
  'international_string_util.h',
  'main.h',
  'menu.h',
  'palette.h',
  'scanline_effect.h',
  'sprite.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'window.h',
  'gba/m4a_internal.h',
  'constants/rgb.h',
] as const;
