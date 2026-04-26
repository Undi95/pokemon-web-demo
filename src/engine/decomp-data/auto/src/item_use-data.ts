// AUTO-GENERATED from src/item_use.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/item_use.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[3]` */
export const tUsingRegisteredKeyItem_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tEnigmaBerryType_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const tItemDistanceX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tItemDistanceY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tItemFound_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCounter_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tItemfinderBeeps_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tFacingDir_EXPR = "data[5]";
/** Raw expr: `(x - MAP_OFFSET)` */
export const localX_EXPR = "(x - MAP_OFFSET)";
/** Raw expr: `(y - MAP_OFFSET)` */
export const localY_EXPR = "(y - MAP_OFFSET)";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "TaskFunc", name: 'sItemUseOnFieldCB', isArray: false, init: "NULL" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetUpItemUseCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'FieldCB_UseItemOnField', ret: "void", arity: 0, params: "void" },
  { name: 'Task_CallItemUseOnFieldCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_UseItemfinder', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CloseItemfinderMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HiddenItemNearby', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StandingOnHiddenItem', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemfinderCheckForHiddenItems', ret: "bool8", arity: 2, params: "const struct MapEvents *, u8" },
  { name: 'GetDirectionToHiddenItem', ret: "u8", arity: 2, params: "s16, s16" },
  { name: 'PlayerFaceHiddenItem', ret: "void", arity: 1, params: "u8" },
  { name: 'CheckForHiddenItemsInMapConnection', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_OpenRegisteredPokeblockCase', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemUseOnFieldCB_Bike', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemUseOnFieldCB_Rod', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemUseOnFieldCB_Itemfinder', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemUseOnFieldCB_Berry', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemUseOnFieldCB_WailmerPailBerry', ret: "void", arity: 1, params: "u8" },
  { name: 'ItemUseOnFieldCB_WailmerPailSudowoodo', ret: "void", arity: 1, params: "u8" },
  { name: 'TryToWaterSudowoodo', ret: "bool8", arity: 0, params: "void" },
  { name: 'BootUpSoundTMHM', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowTMHMContainedMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'UseTMHMYesNo', ret: "void", arity: 1, params: "u8" },
  { name: 'UseTMHM', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartUseRepel', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_UseRepel', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CloseCantUseKeyItemMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'SetDistanceOfClosestHiddenItem', ret: "void", arity: 3, params: "u8, s16, s16" },
  { name: 'CB2_OpenPokeblockFromBag', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpItemUseOnFieldCallback', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DisplayCannotUseItemMessage', ret: "void", arity: 3, params: "u8 taskId, bool8 isUsingRegisteredKeyItemOnField, const u8 *str" },
  { name: 'DisplayItemMessageInBattlePyramid', ret: "else", arity: 3, params: "taskId, gText_DadsAdvice, Task_CloseBattlePyramidBagMessage" },
  { name: 'DisplayDadsAdviceCannotUseItemMessage', ret: "void", arity: 2, params: "u8 taskId, bool8 isUsingRegisteredKeyItemOnField" },
  { name: 'DisplayCannotDismountBikeMessage', ret: "void", arity: 2, params: "u8 taskId, bool8 isUsingRegisteredKeyItemOnField" },
  { name: 'CheckIfItemIsTMHMOrEvolutionStone', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'CB2_CheckMail', ret: "void", arity: 0, params: "void" },
  { name: 'ItemUseOutOfBattle_Mail', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Bike', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetOnOffBike', ret: "else", arity: 1, params: "PLAYER_AVATAR_FLAG_ACRO_BIKE" },
  { name: 'CanFish', ret: "bool32", arity: 0, params: "void" },
  { name: 'ItemUseOutOfBattle_Rod', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Itemfinder', ret: "void", arity: 1, params: "u8 var" },
  { name: 'DisplayItemMessageOnField', ret: "else", arity: 3, params: "taskId, gText_ItemFinderNothing, Task_CloseItemfinderMessage" },
  { name: 'IsHiddenItemPresentAtCoords', ret: "bool8", arity: 3, params: "const struct MapEvents *events, s16 x, s16 y" },
  { name: 'IsHiddenItemPresentInConnection', ret: "bool8", arity: 3, params: "const struct MapConnection *connection, int x, int y" },
  { name: 'ItemUseOutOfBattle_PokeblockCase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_CoinCase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_PowderJar', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Berry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_WailmerPail', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Medicine', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_ReduceEV', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_SacredAsh', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_PPRecovery', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_PPUp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_RareCandy', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_TMHM', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DisplayItemMessage', ret: "else", arity: 4, params: "taskId, FONT_NORMAL, gText_BootedUpTM, BootUpSoundTMHM" },
  { name: 'RemoveUsedItem', ret: "void", arity: 0, params: "void" },
  { name: 'ItemUseOutOfBattle_Repel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_UsedBlackWhiteFlute', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_BlackWhiteFlute', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_UseDigEscapeRopeOnField', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOnFieldCB_EscapeRope', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CanUseDigOrEscapeRopeOnCurMap', ret: "bool8", arity: 0, params: "void" },
  { name: 'ItemUseOutOfBattle_EscapeRope', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_EvolutionStone', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_PokeBall', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CloseBattlePyramidBag', ret: "else", arity: 1, params: "taskId" },
  { name: 'Task_CloseStatIncreaseMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_UseStatIncreaseItem', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_StatIncrease', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_ShowPartyMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_Medicine', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_SacredAsh', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_PPRecovery', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_Escape', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_EnigmaBerry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_EnigmaBerry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_CannotUse', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CallItemUseOnFieldCallback',
  'Task_CloseCantUseKeyItemMessage',
  'Task_CloseItemfinderMessage',
  'Task_CloseStatIncreaseMessage',
  'Task_HiddenItemNearby',
  'Task_OpenRegisteredPokeblockCase',
  'Task_ShowTMHMContainedMessage',
  'Task_StandingOnHiddenItem',
  'Task_StartUseRepel',
  'Task_UseDigEscapeRopeOnField',
  'Task_UseItemfinder',
  'Task_UseRepel',
  'Task_UseStatIncreaseItem',
  'Task_UsedBlackWhiteFlute',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_CheckMail',
  'CB2_OpenPokeblockFromBag',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'item_use.h',
  'battle.h',
  'battle_pyramid.h',
  'battle_pyramid_bag.h',
  'berry.h',
  'berry_powder.h',
  'bike.h',
  'coins.h',
  'data.h',
  'event_data.h',
  'event_object_lock.h',
  'event_object_movement.h',
  'event_scripts.h',
  'fieldmap.h',
  'field_effect.h',
  'field_player_avatar.h',
  'field_screen_effect.h',
  'field_weather.h',
  'item.h',
  'item_menu.h',
  'item_use.h',
  'mail.h',
  'main.h',
  'menu.h',
  'menu_helpers.h',
  'metatile_behavior.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'pokeblock.h',
  'pokemon.h',
  'script.h',
  'sound.h',
  'strings.h',
  'string_util.h',
  'task.h',
  'text.h',
  'constants/event_bg.h',
  'constants/event_objects.h',
  'constants/item_effects.h',
  'constants/items.h',
  'constants/songs.h',
] as const;
