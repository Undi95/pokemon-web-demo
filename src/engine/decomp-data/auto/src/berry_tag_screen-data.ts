// AUTO-GENERATED from src/berry_tag_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/berry_tag_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const BG_TILE = 66;
/** Raw expr: `data[0]` */
export const tBerryY_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tBgOp_EXPR = "data[1]";
export const DISPLAY_SPEED = 16;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_BERRY_NAME: 0,
  WIN_SIZE_FIRM: 1,
  WIN_DESC: 2,
  WIN_BERRY_TAG: 3,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 1, tilemapLeft: 11, tilemapTop: 4, width: 8, height: 2, paletteNum: 15, baseBlock: 72 },
  { bg: 1, tilemapLeft: 11, tilemapTop: 7, width: 18, height: 4, paletteNum: 15, baseBlock: 88 },
  { bg: 1, tilemapLeft: 3, tilemapTop: 14, width: 27, height: 4, paletteNum: 15, baseBlock: 160 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 0, width: 8, height: 2, paletteNum: 15, baseBlock: 268 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBackgroundTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sFontPalette': { path: 'graphics/bag/berry_tag_screen.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitBerryTagScreen', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInitBackgrounds', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInitWindows', ret: "void", arity: 0, params: "void" },
  { name: 'AddBerryTagTextToBg0', ret: "void", arity: 0, params: "void" },
  { name: 'PrintAllBerryData', ret: "void", arity: 0, params: "void" },
  { name: 'CreateBerrySprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateFlavorCircleSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetFlavorCirclesVisiblity', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBerryNumberAndName', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBerrySize', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBerryFirmness', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBerryDescription1', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBerryDescription2', ret: "void", arity: 0, params: "void" },
  { name: 'InitBerryTagScreen', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadBerryTagGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_HandleInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_CloseBerryTagScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DisplayAnotherBerry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryChangeDisplayedBerry', ret: "void", arity: 2, params: "u8 taskId, s8 toMove" },
  { name: 'HandleBagCursorPositionChange', ret: "void", arity: 1, params: "s8 toMove" },
  { name: 'DoBerryTagScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_BerryTagScreen', ret: "void", arity: 0, params: "void" },
  { name: 'VblankCB', ret: "void", arity: 0, params: "void" },
  { name: 'PrintTextInBerryTagScreen', ret: "void", arity: 6, params: "u8 windowId, const u8 *text, u8 x, u8 y, s32 speed, u8 colorStructId" },
  { name: 'AddTextPrinterParameterized', ret: "else", arity: 7, params: "WIN_SIZE_FIRM, FONT_NORMAL, gText_ThreeMarks, 0x28, 0x11, 0, NULL" },
  { name: 'DestroyBerrySprite', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyFlavorCircleSprites', ret: "void", arity: 0, params: "void" },
  { name: 'PrepareToCloseBerryTagScreen', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CloseBerryTagScreen',
  'Task_DisplayAnotherBerry',
  'Task_HandleInput',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_BerryTagScreen',
  'CB2_InitBerryTagScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'berry_tag_screen.h',
  'berry.h',
  'decompress.h',
  'event_object_movement.h',
  'item_menu.h',
  'item.h',
  'item_use.h',
  'main.h',
  'menu.h',
  'text.h',
  'window.h',
  'task.h',
  'menu_helpers.h',
  'palette.h',
  'overworld.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'bg.h',
  'malloc.h',
  'scanline_effect.h',
  'gpu_regs.h',
  'graphics.h',
  'item_menu_icons.h',
  'decompress.h',
  'international_string_util.h',
  'constants/items.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
