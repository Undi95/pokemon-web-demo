// AUTO-GENERATED from src/trader.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/trader.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[3]` */
export const tWindowId_EXPR = "data[3]";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const windowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 10, paletteNum: 15, baseBlock: 1 } as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sDefaultTraderNames = ['gText_Tristan', 'gText_Philip', 'gText_Dennis', 'gText_Roberto'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'TraderSetup', ret: "void", arity: 0, params: "void" },
  { name: 'Trader_ResetFlag', ret: "void", arity: 0, params: "void" },
  { name: 'CreateAvailableDecorationsMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AddTextPrinterParameterized', ret: "else", arity: 7, params: "tWindowId, FONT_NORMAL, gDecorations[trader->decorations[i]].name, 8, 16 * i + 1, TEXT_SKIP_DRAW, NULL" },
  { name: 'Task_BufferDecorSelectionAndCloseWindow', ret: "void", arity: 2, params: "u8 taskId, u8 decorationId" },
  { name: 'Task_HandleGetDecorationMenuInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetTraderTradedFlag', ret: "void", arity: 0, params: "void" },
  { name: 'DoesPlayerHaveNoDecorations', ret: "void", arity: 0, params: "void" },
  { name: 'IsDecorationCategoryFull', ret: "void", arity: 0, params: "void" },
  { name: 'TraderShowDecorationMenu', ret: "void", arity: 0, params: "void" },
  { name: 'DecorationItemsMenuAction_Trade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ExitTraderMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TraderDoDecorationTrade', ret: "void", arity: 0, params: "void" },
  { name: 'TraderMenuGetDecoration', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BufferDecorSelectionAndCloseWindow',
  'Task_HandleGetDecorationMenuInput',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'constants/decorations.h',
  'constants/mauville_old_man.h',
  'decoration.h',
  'decoration_inventory.h',
  'event_data.h',
  'main.h',
  'menu.h',
  'menu_helpers.h',
  'script.h',
  'constants/songs.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'script_menu.h',
] as const;
