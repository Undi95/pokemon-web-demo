// AUTO-GENERATED from src/option_menu.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/option_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tMenuSelection_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tTextSpeed_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tBattleSceneOff_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tBattleStyle_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tSound_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tButtonMode_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tWindowFrameType_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `(MENUITEM_TEXTSPEED * 16)` */
export const YPOS_TEXTSPEED_EXPR = "(MENUITEM_TEXTSPEED * 16)";
/** Raw expr from .c (can't be evaluated): `(MENUITEM_BATTLESCENE * 16)` */
export const YPOS_BATTLESCENE_EXPR = "(MENUITEM_BATTLESCENE * 16)";
/** Raw expr from .c (can't be evaluated): `(MENUITEM_BATTLESTYLE * 16)` */
export const YPOS_BATTLESTYLE_EXPR = "(MENUITEM_BATTLESTYLE * 16)";
/** Raw expr from .c (can't be evaluated): `(MENUITEM_SOUND * 16)` */
export const YPOS_SOUND_EXPR = "(MENUITEM_SOUND * 16)";
/** Raw expr from .c (can't be evaluated): `(MENUITEM_BUTTONMODE * 16)` */
export const YPOS_BUTTONMODE_EXPR = "(MENUITEM_BUTTONMODE * 16)";
/** Raw expr from .c (can't be evaluated): `(MENUITEM_FRAMETYPE * 16)` */
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

// ─── WindowTemplates ─────────────────────────────────────────────────────────
export const sOptionMenuWinTemplates = [
  { bg: 1, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 2, paletteNum: 1, baseBlock: 2 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 5, width: 26, height: 14, paletteNum: 1, baseBlock: 54 },
] as const;

// ─── BgTemplates ─────────────────────────────────────────────────────────────
export const sOptionMenuBgTemplates = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 0, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sOptionMenuText_Pal': { path: 'graphics/interface/option_menu_text.pal', ext: '.gbapal', type: 'u16' },
  'sEqualSignGfx': { path: 'graphics/interface/option_menu_equals_sign.png', ext: '.4bpp', type: 'u8' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 via ×8) ──────────────────────────
export const sOptionMenuBg_Pal_COLORS = [{r:136,g:144,b:248}] as const;

// ─── Text pointer arrays (gText_* string keys) ──────────────────────────────
export const sOptionMenuItemsNames = ['gText_TextSpeed', 'gText_BattleScene', 'gText_BattleStyle', 'gText_Sound', 'gText_ButtonMode', 'gText_Frame', 'gText_OptionMenuCancel'] as const;

// ─── FillBgTilemapBufferRect calls (frame layout, top-level constants only) ─
export const FILL_BG_CALLS = [
  { bg: 1, tile: "TILE_TOP_CORNER_L", x: 1, y: 0, w: 1, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_TOP_EDGE", x: 2, y: 0, w: 27, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_TOP_CORNER_R", x: 28, y: 0, w: 1, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_LEFT_EDGE", x: 1, y: 1, w: 1, h: 2, palNum: 7 },
  { bg: 1, tile: "TILE_RIGHT_EDGE", x: 28, y: 1, w: 1, h: 2, palNum: 7 },
  { bg: 1, tile: "TILE_BOT_CORNER_L", x: 1, y: 3, w: 1, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_BOT_EDGE", x: 2, y: 3, w: 27, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_BOT_CORNER_R", x: 28, y: 3, w: 1, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_TOP_CORNER_L", x: 1, y: 4, w: 1, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_TOP_EDGE", x: 2, y: 4, w: 26, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_TOP_CORNER_R", x: 28, y: 4, w: 1, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_LEFT_EDGE", x: 1, y: 5, w: 1, h: 18, palNum: 7 },
  { bg: 1, tile: "TILE_RIGHT_EDGE", x: 28, y: 5, w: 1, h: 18, palNum: 7 },
  { bg: 1, tile: "TILE_BOT_CORNER_L", x: 1, y: 19, w: 1, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_BOT_EDGE", x: 2, y: 19, w: 26, h: 1, palNum: 7 },
  { bg: 1, tile: "TILE_BOT_CORNER_R", x: 28, y: 19, w: 1, h: 1, palNum: 7 },
] as const;

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
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
