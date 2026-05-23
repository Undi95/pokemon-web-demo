// AUTO-GENERATED from src/script_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/script_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tLeft_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTop_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tRight_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBottom_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tIgnoreBPress_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tDoWrap_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tWindowId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tMultichoiceId_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMonSpecies_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tMonSpriteId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tWindowX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tWindowY_EXPR = "data[4]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sProcessInputDelay', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_HandleMultichoiceInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleYesNoInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleMultichoiceGridInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DrawMultichoiceMenu', ret: "void", arity: 5, params: "u8 left, u8 top, u8 multichoiceId, bool8 ignoreBPress, u8 cursorPos" },
  { name: 'InitMultichoiceCheckWrap', ret: "void", arity: 4, params: "bool8 ignoreBPress, u8 count, u8 windowId, u8 multichoiceId" },
  { name: 'DrawLinkServicesMultichoiceMenu', ret: "void", arity: 1, params: "u8 multichoiceId" },
  { name: 'CreatePCMultichoice', ret: "void", arity: 0, params: "void" },
  { name: 'CreateLilycoveSSTidalMultichoice', ret: "void", arity: 0, params: "void" },
  { name: 'IsPicboxClosed', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateStartMenuForPokenavTutorial', ret: "void", arity: 0, params: "void" },
  { name: 'InitMultichoiceNoWrap', ret: "void", arity: 4, params: "bool8 ignoreBPress, u8 unusedCount, u8 windowId, u8 multichoiceId" },
  { name: 'ScriptMenu_Multichoice', ret: "bool8", arity: 4, params: "u8 left, u8 top, u8 multichoiceId, bool8 ignoreBPress" },
  { name: 'ScriptMenu_MultichoiceWithDefault', ret: "bool8", arity: 5, params: "u8 left, u8 top, u8 multichoiceId, bool8 ignoreBPress, u8 defaultChoice" },
  { name: 'GetLengthWithExpandedPlayerName', ret: "UNUSED", arity: 1, params: "const u8 *str" },
  { name: 'ScriptMenu_YesNo', ret: "bool8", arity: 2, params: "u8 left, u8 top" },
  { name: 'IsScriptActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'ScriptMenu_MultichoiceGrid', ret: "bool8", arity: 5, params: "u8 left, u8 top, u8 multichoiceId, bool8 ignoreBPress, u8 columnCount" },
  { name: 'ScriptMenu_CreatePCMultichoice', ret: "bool16", arity: 0, params: "void" },
  { name: 'AddTextPrinterParameterized', ret: "else", arity: 7, params: "windowId, FONT_NORMAL, gText_SomeonesPC, x, 1, TEXT_SKIP_DRAW, NULL" },
  { name: 'ScriptMenu_DisplayPCStartupPrompt', ret: "void", arity: 0, params: "void" },
  { name: 'ScriptMenu_CreateLilycoveSSTidalMultichoice', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetLilycoveSSTidalSelection', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PokemonPicWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ScriptMenu_ShowPokemonPic', ret: "bool8", arity: 3, params: "u16 species, u8 x, u8 y" },
  { name: 'CreateWindowFromRect', ret: "u8", arity: 4, params: "u8 x, u8 y, u8 width, u8 height" },
  { name: 'ClearToTransparentAndRemoveWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'ScriptMenu_CreateStartMenuForPokenavTutorial', ret: "bool16", arity: 0, params: "void" },
  { name: 'DisplayTextAndGetWidthInternal', ret: "int", arity: 1, params: "const u8 *str" },
  { name: 'DisplayTextAndGetWidth', ret: "int", arity: 2, params: "const u8 *str, int prevWidth" },
  { name: 'ConvertPixelWidthToTileWidth', ret: "int", arity: 1, params: "int width" },
  { name: 'ScriptMenu_AdjustLeftCoordFromWidth', ret: "int", arity: 2, params: "int left, int width" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleMultichoiceGridInput',
  'Task_HandleMultichoiceInput',
  'Task_HandleYesNoInput',
  'Task_PokemonPicWindow',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'event_data.h',
  'field_effect.h',
  'field_specials.h',
  'item.h',
  'menu.h',
  'palette.h',
  'script.h',
  'script_menu.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'constants/field_specials.h',
  'constants/items.h',
  'constants/script_menu.h',
  'constants/songs.h',
  'data/script_menu.h',
] as const;
