// AUTO-GENERATED from src/start_menu.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/start_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tInBattleTower_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MENU_0 = {
  MENU_ACTION_POKEDEX: 0,
  MENU_ACTION_POKEMON: 1,
  MENU_ACTION_BAG: 2,
  MENU_ACTION_POKENAV: 3,
  MENU_ACTION_PLAYER: 4,
  MENU_ACTION_SAVE: 5,
  MENU_ACTION_OPTION: 6,
  MENU_ACTION_EXIT: 7,
  MENU_ACTION_RETIRE_SAFARI: 8,
  MENU_ACTION_PLAYER_LINK: 9,
  MENU_ACTION_REST_FRONTIER: 10,
  MENU_ACTION_RETIRE_FRONTIER: 11,
  MENU_ACTION_PYRAMID_BAG: 12,
} as const;
export const ENUM_SAVE_1 = {
  SAVE_IN_PROGRESS: 0,
  SAVE_SUCCESS: 1,
  SAVE_CANCELED: 2,
  SAVE_ERROR: 3,
} as const;

// ─── WindowTemplates ─────────────────────────────────────────────────────────
export const sWindowTemplates_LinkBattleSave = { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 404 } as const;

// ─── BgTemplates ─────────────────────────────────────────────────────────────
export const sBgTemplates_LinkBattleSave = { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── Text pointer arrays (gText_* string keys) ──────────────────────────────
export const sPyramidFloorNames = ['gText_Floor1', 'gText_Floor2', 'gText_Floor3', 'gText_Floor4', 'gText_Floor5', 'gText_Floor6', 'gText_Floor7', 'gText_Peak'] as const;

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
export const TASK_NAMES = [
  'Task_SaveAfterLinkBattle',
  'Task_ShowStartMenu',
  'Task_WaitForBattleTowerLinkSave',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_SaveAfterLinkBattle',
  'CB2_SetUpSaveAfterLinkBattle',
] as const;
