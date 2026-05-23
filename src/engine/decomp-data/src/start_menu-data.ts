// AUTO-GENERATED from src/start_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/start_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[2]` */
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

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplate_SafariBalls = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 9, height: 4, paletteNum: 15, baseBlock: 8 } as const;
export const sWindowTemplate_PyramidFloor = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 4, paletteNum: 15, baseBlock: 8 } as const;
export const sWindowTemplate_PyramidPeak = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 12, height: 4, paletteNum: 15, baseBlock: 8 } as const;
export const sWindowTemplates_LinkBattleSave = { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 404 } as const;
export const sSaveInfoWindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 14, height: 10, paletteNum: 15, baseBlock: 8 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates_LinkBattleSave = { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── MenuAction ─────────────────────────────────────────────────────────────
export const sStartMenuItems = [
  { u8_void: "StartMenuPokedexCallback" },
  { u8_void: "StartMenuPokemonCallback" },
  { u8_void: "StartMenuBagCallback" },
  { u8_void: "StartMenuPokeNavCallback" },
  { u8_void: "StartMenuPlayerNameCallback" },
  { u8_void: "StartMenuSaveCallback" },
  { u8_void: "StartMenuOptionCallback" },
  { u8_void: "StartMenuExitCallback" },
  { u8_void: "StartMenuSafariZoneRetireCallback" },
  { u8_void: "StartMenuLinkModePlayerNameCallback" },
  { u8_void: "StartMenuSaveCallback" },
  { u8_void: "StartMenuBattlePyramidRetireCallback" },
  { u8_void: "StartMenuBattlePyramidBagCallback" },
] as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sPyramidFloorNames = ['gText_Floor1', 'gText_Floor2', 'gText_Floor3', 'gText_Floor4', 'gText_Floor5', 'gText_Floor6', 'gText_Floor7', 'gText_Peak'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSafariBallsWindowId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBattlePyramidFloorWindowId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sStartMenuCursorPos', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sNumStartMenuActions', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sCurrentStartMenuActions', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s8", name: 'sInitStartMenuData', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSaveDialogTimer', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sSavingComplete', isArray: false, init: "FALSE" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSaveInfoWindowId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'StartMenuPokedexCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuPokemonCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuBagCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuPokeNavCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuPlayerNameCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuSaveCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuOptionCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuExitCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuSafariZoneRetireCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuLinkModePlayerNameCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuBattlePyramidRetireCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartMenuBattlePyramidBagCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'SaveStartCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'SaveCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'BattlePyramidRetireStartCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'BattlePyramidRetireReturnCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'BattlePyramidRetireCallback', ret: "bool8", arity: 0, params: "void" },
  { name: 'HandleStartMenuInput', ret: "bool8", arity: 0, params: "void" },
  { name: 'SaveConfirmSaveCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveYesNoCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveConfirmInputCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveFileExistsCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveConfirmOverwriteDefaultNoCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveConfirmOverwriteCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveOverwriteInputCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveSavingMessageCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveDoSaveCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveSuccessCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveReturnSuccessCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveErrorCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SaveReturnErrorCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'BattlePyramidConfirmRetireCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'BattlePyramidRetireYesNoCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'BattlePyramidRetireInputCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'StartMenuTask', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SaveGameTask', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SaveAfterLinkBattle', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitForBattleTowerLinkSave', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_ReturnToFieldStartMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'BuildStartMenuActions', ret: "void", arity: 0, params: "void" },
  { name: 'AddStartMenuAction', ret: "void", arity: 1, params: "u8 action" },
  { name: 'BuildNormalStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BuildSafariZoneStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BuildLinkModeStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BuildUnionRoomStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BuildBattlePikeStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BuildBattlePyramidStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BuildMultiPartnerRoomStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ShowSafariBallsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPyramidFloorWindow', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveExtraStartMenuWindows', ret: "void", arity: 0, params: "void" },
  { name: 'PrintStartMenuActions', ret: "bool32", arity: 2, params: "s8 *pIndex, u32 count" },
  { name: 'InitStartMenuStep', ret: "bool32", arity: 0, params: "void" },
  { name: 'InitStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CreateStartMenuTask', ret: "void", arity: 1, params: "TaskFunc followupFunc" },
  { name: 'InitSave', ret: "void", arity: 0, params: "void" },
  { name: 'RunSaveCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'HideSaveMessageWindow', ret: "void", arity: 0, params: "void" },
  { name: 'HideSaveInfoWindow', ret: "void", arity: 0, params: "void" },
  { name: 'SaveStartTimer', ret: "void", arity: 0, params: "void" },
  { name: 'SaveSuccesTimer', ret: "bool8", arity: 0, params: "void" },
  { name: 'SaveErrorTimer', ret: "bool8", arity: 0, params: "void" },
  { name: 'InitBattlePyramidRetire', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_LinkBattleSave', ret: "void", arity: 0, params: "void" },
  { name: 'InitSaveWindowAfterLinkBattle', ret: "bool32", arity: 1, params: "u8 *par1" },
  { name: 'CB2_SaveAfterLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'ShowSaveInfoWindow', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveSaveInfoWindow', ret: "void", arity: 0, params: "void" },
  { name: 'HideStartMenuWindow', ret: "void", arity: 0, params: "void" },
  { name: 'SetDexPokemonPokenavFlags', ret: "void", arity: 0, params: "void" },
  { name: 'ShowReturnToFieldStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ShowStartMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPlayerTrainerCard', ret: "else", arity: 1, params: "CB2_ReturnToFieldWithOpenMenu" },
  { name: 'ShowBattlePyramidStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'SaveGame', ret: "void", arity: 0, params: "void" },
  { name: 'ShowSaveMessage', ret: "else", arity: 2, params: "gText_SaveError, SaveErrorCallback" },
  { name: 'CB2_SetUpSaveAfterLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SaveForBattleTowerLink', ret: "void", arity: 0, params: "void" },
  { name: 'HideStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'AppendToList', ret: "void", arity: 3, params: "u8 *list, u8 *pos, u8 newEntry" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
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

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_pike.h',
  'battle_pyramid.h',
  'battle_pyramid_bag.h',
  'bg.h',
  'event_data.h',
  'event_object_movement.h',
  'event_object_lock.h',
  'event_scripts.h',
  'fieldmap.h',
  'field_effect.h',
  'field_player_avatar.h',
  'field_specials.h',
  'field_weather.h',
  'field_screen_effect.h',
  'frontier_pass.h',
  'frontier_util.h',
  'gpu_regs.h',
  'international_string_util.h',
  'item_menu.h',
  'link.h',
  'load_save.h',
  'main.h',
  'menu.h',
  'new_game.h',
  'option_menu.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'pokedex.h',
  'pokenav.h',
  'safari_zone.h',
  'save.h',
  'scanline_effect.h',
  'script.h',
  'sound.h',
  'start_menu.h',
  'strings.h',
  'string_util.h',
  'task.h',
  'text.h',
  'text_window.h',
  'trainer_card.h',
  'window.h',
  'union_room.h',
  'constants/battle_frontier.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
