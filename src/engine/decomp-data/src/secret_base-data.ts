// AUTO-GENERATED from src/secret_base.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/secret_base.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_SCROLL_ARROW = 5112;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tNumBases_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSelectedRow_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tScrollOffset_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tMaxShownItems_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tSelectedBaseId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tListTaskId_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tMainWindowId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tActionWindowId_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tArrowTaskId_EXPR = "data[8]";
/** Raw expr: `data[0]` */
export const tStepCb_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const tPlayerX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPlayerY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tFldEff_EXPR = "data[4]";
/** Raw expr: `(1 << 0)` */
export const DELETED_BASE_A_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const DELETED_BASE_B_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const DELETED_BASE_C_EXPR = "(1 << 2)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_UNREGISTERED_0 = {
  UNREGISTERED: 0,
  REGISTERED: 1,
  NEW: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sRegistryWindowTemplates = [
  { bg: 0, tilemapLeft: 17, tilemapTop: 1, width: 12, height: 18, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 28, height: 4, paletteNum: 15, baseBlock: 217 },
] as const;

// ─── MenuAction ─────────────────────────────────────────────────────────────
export const sRegistryMenuActions = [
  { text: "gText_DelRegist", func: "{ .void_u8 = ShowRegistryMenuDeleteConfirmation" },
  { text: "gText_Cancel", func: "{ .void_u8 = ReturnToMainRegistryMenu" },
] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sCurSecretBaseId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sInFriendSecretBase', isArray: false, init: "FALSE" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_ShowSecretBaseRegistryMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'BuildRegistryMenuItems', ret: "void", arity: 1, params: "u8" },
  { name: 'RegistryMenu_OnCursorMove', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'FinalizeRegistryMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'AddRegistryMenuScrollArrows', ret: "void", arity: 1, params: "u8" },
  { name: 'HandleRegistryMenuInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowRegistryMenuActions', ret: "void", arity: 1, params: "u8" },
  { name: 'HandleRegistryMenuActionsInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowRegistryMenuDeleteConfirmation', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowRegistryMenuDeleteYesNo', ret: "void", arity: 1, params: "u8" },
  { name: 'DeleteRegistry_Yes', ret: "void", arity: 1, params: "u8" },
  { name: 'DeleteRegistry_No', ret: "void", arity: 1, params: "u8" },
  { name: 'ReturnToMainRegistryMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'GoToSecretBasePCRegisterMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'GetSecretBaseOwnerType', ret: "u8", arity: 1, params: "u8" },
  { name: 'ClearSecretBase', ret: "void", arity: 1, params: "struct SecretBase *secretBase" },
  { name: 'ClearSecretBases', ret: "void", arity: 0, params: "void" },
  { name: 'SetCurSecretBaseId', ret: "void", arity: 0, params: "void" },
  { name: 'TrySetCurSecretBaseIndex', ret: "void", arity: 0, params: "void" },
  { name: 'CheckPlayerHasSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'GetSecretBaseTypeInFrontOfPlayer_', ret: "u8", arity: 0, params: "void" },
  { name: 'GetSecretBaseTypeInFrontOfPlayer', ret: "void", arity: 0, params: "void" },
  { name: 'FindMetatileIdMapCoords', ret: "void", arity: 3, params: "s16 *x, s16 *y, u16 metatileId" },
  { name: 'ToggleSecretBaseEntranceMetatile', ret: "void", arity: 0, params: "void" },
  { name: 'GetNameLength', ret: "u8", arity: 1, params: "const u8 *secretBaseOwnerName" },
  { name: 'SetPlayerSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'SetOccupiedSecretBaseEntranceMetatiles', ret: "void", arity: 1, params: "struct MapEvents const *events" },
  { name: 'SetSecretBaseWarpDestination', ret: "void", arity: 0, params: "void" },
  { name: 'Task_EnterSecretBase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'EnterSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'SecretBaseMapPopupEnabled', ret: "bool8", arity: 0, params: "void" },
  { name: 'EnterNewlyCreatedSecretBase_WaitFadeIn', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'EnterNewlyCreatedSecretBase_StartFadeIn', ret: "void", arity: 0, params: "void" },
  { name: 'Task_EnterNewlyCreatedSecretBase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'EnterNewlyCreatedSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'CurMapIsSecretBase', ret: "bool8", arity: 0, params: "void" },
  { name: 'InitSecretBaseAppearance', ret: "void", arity: 1, params: "bool8 hidePC" },
  { name: 'InitSecretBaseDecorationSprites', ret: "void", arity: 0, params: "void" },
  { name: 'HideSecretBaseDecorationSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetSecretBaseOwnerGfxId', ret: "void", arity: 0, params: "void" },
  { name: 'SetCurSecretBaseIdFromPosition', ret: "void", arity: 2, params: "const struct MapPosition *position, const struct MapEvents *events" },
  { name: 'WarpIntoSecretBase', ret: "void", arity: 2, params: "const struct MapPosition *position, const struct MapEvents *events" },
  { name: 'TrySetCurSecretBase', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_WarpOutOfSecretBase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'WarpOutOfSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'IsCurSecretBaseOwnedByAnotherPlayer', ret: "void", arity: 0, params: "void" },
  { name: 'CopyCurSecretBaseOwnerName_StrVar1', ret: "void", arity: 0, params: "void" },
  { name: 'IsSecretBaseRegistered', ret: "bool8", arity: 1, params: "u8 secretBaseIdx" },
  { name: 'GetAverageEVs', ret: "u8", arity: 1, params: "struct Pokemon *pokemon" },
  { name: 'SetPlayerSecretBaseParty', ret: "void", arity: 0, params: "void" },
  { name: 'ClearAndLeaveSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'MoveOutOfSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'ClosePlayerSecretBaseEntrance', ret: "void", arity: 0, params: "void" },
  { name: 'MoveOutOfSecretBaseFromOutside', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumRegisteredSecretBases', ret: "u8", arity: 0, params: "void" },
  { name: 'GetCurSecretBaseRegistrationValidity', ret: "void", arity: 0, params: "void" },
  { name: 'ToggleCurSecretBaseRegistry', ret: "void", arity: 0, params: "void" },
  { name: 'ShowSecretBaseDecorationMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ShowSecretBaseRegistryMenu', ret: "void", arity: 0, params: "void" },
  { name: 'DeleteRegistry_Yes_Callback', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ScriptContext_SetupScript', ret: "else", arity: 1, params: "SecretBase_EventScript_ShowRegisterMenu" },
  { name: 'PrepSecretBaseBattleFlags', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattledOwnerFromResult', ret: "void", arity: 0, params: "void" },
  { name: 'GetSecretBaseOwnerAndState', ret: "void", arity: 0, params: "void" },
  { name: 'SecretBasePerStepCallback', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SaveSecretBase', ret: "void", arity: 4, params: "u8 secretBaseIdx, struct SecretBase *secretBase, u32 version, u32 language" },
  { name: 'SecretBasesHaveSameTrainerId', ret: "bool8", arity: 2, params: "struct SecretBase *secretBase1, struct SecretBase *secretBase2" },
  { name: 'SecretBasesHaveSameTrainerName', ret: "bool8", arity: 2, params: "struct SecretBase *sbr1, struct SecretBase *sbr2" },
  { name: 'SecretBasesBelongToSamePlayer', ret: "bool8", arity: 2, params: "struct SecretBase *secretBase1, struct SecretBase *secretBase2" },
  { name: 'GetSecretBaseIndexFromId', ret: "s16", arity: 1, params: "u8 secretBaseId" },
  { name: 'FindAvailableSecretBaseIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'FindUnregisteredSecretBaseIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'TrySaveFriendsSecretBase', ret: "u8", arity: 3, params: "struct SecretBase *secretBase, u32 version, u32 language" },
  { name: 'SortSecretBasesByRegistryStatus', ret: "void", arity: 0, params: "void" },
  { name: 'TrySaveFriendsSecretBases', ret: "void", arity: 2, params: "struct SecretBaseRecordMixer *mixer, u8 registryStatus" },
  { name: 'SecretBaseBelongsToPlayer', ret: "bool8", arity: 1, params: "struct SecretBase *secretBase" },
  { name: 'DeleteFirstOldBaseFromPlayerInRecordMixingFriendsRecords', ret: "void", arity: 3, params: "struct SecretBase *basesA, struct SecretBase *basesB, struct SecretBase *basesC" },
  { name: 'ClearDuplicateOwnedSecretBase', ret: "bool8", arity: 3, params: "struct SecretBase *secretBase, struct SecretBase *secretBases, u8 idx" },
  { name: 'ClearDuplicateOwnedSecretBases', ret: "void", arity: 4, params: "struct SecretBase *playersBases, struct SecretBase *friendsBasesA, struct SecretBase *friendsBasesB, struct SecretBase *friendsBasesC" },
  { name: 'TrySaveRegisteredDuplicate', ret: "void", arity: 3, params: "struct SecretBase *base, u32 version, u32 language" },
  { name: 'TrySaveRegisteredDuplicates', ret: "void", arity: 1, params: "struct SecretBaseRecordMixer *mixers" },
  { name: 'SaveRecordMixBases', ret: "void", arity: 1, params: "struct SecretBaseRecordMixer *mixers" },
  { name: 'ReceiveSecretBasesData', ret: "void", arity: 3, params: "void *secretBases, size_t recordSize, u8 linkIdx" },
  { name: 'ClearJapaneseSecretBases', ret: "void", arity: 1, params: "struct SecretBase *bases" },
  { name: 'InitSecretBaseVars', ret: "void", arity: 0, params: "void" },
  { name: 'VarSet', ret: "else", arity: 2, params: "VAR_SECRET_BASE_IS_NOT_LOCAL, FALSE" },
  { name: 'CheckLeftFriendsSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsDollDecor', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsCushionDecor', ret: "void", arity: 0, params: "void" },
  { name: 'DeclinedSecretBaseBattle', ret: "void", arity: 0, params: "void" },
  { name: 'WonSecretBaseBattle', ret: "void", arity: 0, params: "void" },
  { name: 'LostSecretBaseBattle', ret: "void", arity: 0, params: "void" },
  { name: 'DrewSecretBaseBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsPosterDecor', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsFurnitureBottom', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsFurnitureMiddle', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsFurnitureTop', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsSandOrnament', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_EnterNewlyCreatedSecretBase',
  'Task_EnterSecretBase',
  'Task_ShowSecretBaseRegistryMenu',
  'Task_WarpOutOfSecretBase',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_setup.h',
  'decoration.h',
  'event_data.h',
  'event_object_movement.h',
  'event_scripts.h',
  'field_camera.h',
  'field_effect.h',
  'field_player_avatar.h',
  'field_screen_effect.h',
  'field_specials.h',
  'field_weather.h',
  'fieldmap.h',
  'fldeff.h',
  'fldeff_misc.h',
  'international_string_util.h',
  'item_menu.h',
  'link.h',
  'list_menu.h',
  'main.h',
  'map_name_popup.h',
  'menu.h',
  'menu_helpers.h',
  'metatile_behavior.h',
  'overworld.h',
  'palette.h',
  'script.h',
  'secret_base.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'tv.h',
  'window.h',
  'constants/event_bg.h',
  'constants/decorations.h',
  'constants/event_objects.h',
  'constants/field_specials.h',
  'constants/items.h',
  'constants/map_types.h',
  'constants/metatile_behaviors.h',
  'constants/metatile_labels.h',
  'constants/moves.h',
  'constants/secret_bases.h',
  'constants/songs.h',
  'constants/trainers.h',
] as const;
