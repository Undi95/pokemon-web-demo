// AUTO-GENERATED from src/naming_screen.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/naming_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const KBROW_COUNT = 4;
export const KBCOL_COUNT = 9;
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tFrameCount_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tButtonId_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tKeepFlashing_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tAllowFlash_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tColor_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tColorIncr_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tColorDelay_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tColorDelta_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sX_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sY_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const sPrevX_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const sPrevY_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4] & 0x00FF` */
export const sInvisible_EXPR = "data[4] & 0x00FF";
/** Raw expr from .c (can't be evaluated): `data[4] & 0xFF00` */
export const sFlashing_EXPR = "data[4] & 0xFF00";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const sColor_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const sColorIncr_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[7]` */
export const sColorDelay_EXPR = "data[7]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sDelay_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sXPosId_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sId_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sYPosId_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const sPage_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const sTextSpriteId_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[7]` */
export const sButtonSpriteId_EXPR = "data[7]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tKeyboardEvent_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_INPUT_0 = {
  INPUT_NONE: 0,
  INPUT_DPAD_UP: 1,
  INPUT_DPAD_DOWN: 2,
  INPUT_DPAD_LEFT: 3,
  INPUT_DPAD_RIGHT: 4,
  INPUT_A_BUTTON: 5,
  INPUT_B_BUTTON: 6,
  INPUT_LR_BUTTON: 7,
  INPUT_SELECT: 8,
  INPUT_START: 9,
} as const;
export const ENUM_GFXTAG_1 = {
  GFXTAG_BACK_BUTTON: 0,
  GFXTAG_OK_BUTTON: 1,
  GFXTAG_PAGE_SWAP_FRAME: 2,
  GFXTAG_PAGE_SWAP_BUTTON: 3,
  GFXTAG_PAGE_SWAP_UPPER: 4,
  GFXTAG_PAGE_SWAP_LOWER: 5,
  GFXTAG_PAGE_SWAP_OTHERS: 6,
  GFXTAG_CURSOR: 7,
  GFXTAG_CURSOR_SQUISHED: 8,
  GFXTAG_CURSOR_FILLED: 9,
  GFXTAG_INPUT_ARROW: 10,
  GFXTAG_UNDERSCORE: 11,
} as const;
export const ENUM_PALTAG_2 = {
  PALTAG_MENU: 0,
  PALTAG_PAGE_SWAP_UPPER: 1,
  PALTAG_PAGE_SWAP_LOWER: 2,
  PALTAG_PAGE_SWAP_OTHERS: 3,
  PALTAG_PAGE_SWAP: 4,
  PALTAG_CURSOR: 5,
  PALTAG_BACK_BUTTON: 6,
  PALTAG_OK_BUTTON: 7,
} as const;
export const ENUM_WIN_3 = {
  WIN_KB_PAGE_1: 0,
  WIN_KB_PAGE_2: 1,
  WIN_TEXT_ENTRY: 2,
  WIN_TEXT_ENTRY_BOX: 3,
  WIN_BANNER: 4,
  WIN_COUNT: 5,
} as const;
export const ENUM_KBPAGE_4 = {
  KBPAGE_SYMBOLS: 0,
  KBPAGE_LETTERS_UPPER: 1,
  KBPAGE_LETTERS_LOWER: 2,
  KBPAGE_COUNT: 3,
} as const;
export const ENUM_KEYBOARD_5 = {
  KEYBOARD_LETTERS_LOWER: 0,
  KEYBOARD_LETTERS_UPPER: 1,
  KEYBOARD_SYMBOLS: 2,
} as const;
export const ENUM_PAGE_6 = {
  PAGE_SWAP_UPPER: 0,
  PAGE_SWAP_OTHERS: 1,
  PAGE_SWAP_LOWER: 2,
} as const;
export const ENUM_KEY_7 = {
  KEY_ROLE_CHAR: 0,
  KEY_ROLE_PAGE: 1,
  KEY_ROLE_BACKSPACE: 2,
  KEY_ROLE_OK: 3,
} as const;
export const ENUM_BUTTON_8 = {
  BUTTON_PAGE: 0,
  BUTTON_BACK: 1,
  BUTTON_OK: 2,
  BUTTON_COUNT: 3,
} as const;
export const ENUM_STATE_9 = {
  STATE_FADE_IN: 0,
  STATE_WAIT_FADE_IN: 1,
  STATE_HANDLE_INPUT: 2,
  STATE_MOVE_TO_OK_BUTTON: 3,
  STATE_START_PAGE_SWAP: 4,
  STATE_WAIT_PAGE_SWAP: 5,
  STATE_PRESSED_OK: 6,
  STATE_WAIT_SENT_TO_PC_MESSAGE: 7,
  STATE_FADE_OUT: 8,
  STATE_EXIT: 9,
} as const;
export const ENUM_INPUT_10 = {
  INPUT_STATE_DISABLED: 0,
  INPUT_STATE_ENABLED: 1,
  INPUT_STATE_OVERRIDE: 2,
} as const;

// ─── WindowTemplates ─────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 1, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 48 },
  { bg: 2, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 200 },
  { bg: 3, tilemapLeft: 8, tilemapTop: 6, width: 17, height: 2, paletteNum: 10, baseBlock: 48 },
  { bg: 3, tilemapLeft: 8, tilemapTop: 4, width: 17, height: 2, paletteNum: 10, baseBlock: 82 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: "DISPLAY_TILE_WIDTH", height: 2, paletteNum: 11, baseBlock: 116 },
] as const;

// ─── BgTemplates ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 30, priority: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 29, priority: 1 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, priority: 2 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 31, priority: 3 },
] as const;

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sPCIconOff_Gfx': { path: 'graphics/naming_screen/pc_icon_off.png', ext: '.4bpp', type: 'u8' },
  'sPCIconOn_Gfx': { path: 'graphics/naming_screen/pc_icon_on.png', ext: '.4bpp', type: 'u8' },
  'sKeyboard_Pal': { path: 'graphics/naming_screen/keyboard.pal', ext: '.gbapal', type: 'u16' },
  'sRival_Pal': { path: 'graphics/naming_screen/rival.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Text pointer arrays (gText_* string keys) ──────────────────────────────
export const sTransferredToPCMessages = ['gText_PkmnTransferredSomeonesPC', 'gText_PkmnTransferredLanettesPC', 'gText_PkmnTransferredSomeonesPCBoxFull', 'gText_PkmnTransferredLanettesPCBoxFull'] as const;

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
export const TASK_NAMES = [
  'Task_HandleInput',
  'Task_HandlePageSwapAnim',
  'Task_NamingScreen',
  'Task_UpdateButtonFlash',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_LoadNamingScreen',
  'CB2_NamingScreen',
] as const;
