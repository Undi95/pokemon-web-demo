// AUTO-GENERATED from src/cable_club.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/cable_club.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMinPlayers_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tMaxPlayers_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tNumPlayers_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tTimer_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tWindowId_EXPR = "data[5]";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplate_LinkPlayerCount = { bg: 0, tilemapLeft: 16, tilemapTop: 11, width: 11, height: 2, paletteNum: 15, baseBlock: 293 } as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sTrainerCardColorNames = ['gText_BronzeCard', 'gText_CopperCard', 'gText_SilverCard', 'gText_GoldCard'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_LinkupStart', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupAwaitConnection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupConfirmWhenReady', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupAwaitConfirmation', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupTryConfirmation', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupConfirm', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupExchangeDataWithLeader', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupCheckStatusAfterConfirm', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupAwaitTrainerCardData', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StopLinkup', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupFailed', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkupConnectionError', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryLinkTimeout', ret: "bool8", arity: 1, params: "u8 taskId" },
  { name: 'Task_ValidateMixingGameLanguage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReestablishLink', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReestablishLinkAwaitConnection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReestablishLinkLeader', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReestablishLinkAwaitConfirmation', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateLinkupTask', ret: "void", arity: 2, params: "u8 minPlayers, u8 maxPlayers" },
  { name: 'PrintNumPlayersInLink', ret: "void", arity: 2, params: "u16 windowId, u32 numPlayers" },
  { name: 'ClearLinkPlayerCountWindow', ret: "void", arity: 1, params: "u16 windowId" },
  { name: 'UpdateLinkPlayerCountDisplay', ret: "void", arity: 2, params: "u8 taskId, u8 numPlayers" },
  { name: 'ExchangeDataAndGetLinkupStatus', ret: "u32", arity: 2, params: "u8 minPlayers, u8 maxPlayers" },
  { name: 'CheckLinkErrored', ret: "bool32", arity: 1, params: "u8 taskId" },
  { name: 'CheckLinkCanceledBeforeConnection', ret: "bool32", arity: 1, params: "u8 taskId" },
  { name: 'CheckLinkCanceled', ret: "bool32", arity: 1, params: "u8 taskId" },
  { name: 'CheckSioErrored', ret: "bool32", arity: 1, params: "u8 taskId" },
  { name: 'Task_DelayedBlockRequest', ret: "UNUSED", arity: 1, params: "u8 taskId" },
  { name: 'AreBattleTowerLinkSpeciesSame', ret: "bool32", arity: 2, params: "u16 *speciesList1, u16 *speciesList2" },
  { name: 'FinishLinkup', ret: "void", arity: 2, params: "u16 *linkupStatus, u32 taskId" },
  { name: 'TryBattleLinkup', ret: "void", arity: 0, params: "void" },
  { name: 'TryTradeLinkup', ret: "void", arity: 0, params: "void" },
  { name: 'TryRecordMixLinkup', ret: "void", arity: 0, params: "void" },
  { name: 'ValidateMixingGameLanguage', ret: "void", arity: 0, params: "void" },
  { name: 'TryBerryBlenderLinkup', ret: "void", arity: 0, params: "void" },
  { name: 'TryContestGModeLinkup', ret: "void", arity: 0, params: "void" },
  { name: 'TryContestEModeLinkup', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTask_ReestablishCableClubLink', ret: "u8", arity: 0, params: "void" },
  { name: 'CableClubSaveGame', ret: "void", arity: 0, params: "void" },
  { name: 'SetLinkBattleTypeFlags', ret: "void", arity: 1, params: "int linkService" },
  { name: 'Task_StartWiredCableClubBattle', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlayMapChosenOrBattleBGM', ret: "else", arity: 1, params: "MUS_VS_TRAINER" },
  { name: 'Task_StartWirelessCableClubBattle', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CB2_ReturnFromUnionRoomBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnFromCableClubBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CleanupLinkRoomState', ret: "void", arity: 0, params: "void" },
  { name: 'ExitLinkRoom', ret: "void", arity: 0, params: "void" },
  { name: 'Task_EnterCableClubSeat', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateTask_EnterCableClubSeat', ret: "void", arity: 1, params: "TaskFunc followupFunc" },
  { name: 'Task_StartWiredTrade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StartWirelessTrade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlayerEnteredTradeSeat', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTask_StartWiredTrade', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'Script_StartWiredTrade', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'ColosseumPlayerSpotTriggered', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTask_EnterCableClubSeatNoFollowup', ret: "void", arity: 0, params: "void" },
  { name: 'Script_ShowLinkTrainerCard', ret: "void", arity: 0, params: "void" },
  { name: 'GetLinkTrainerCardColor', ret: "bool32", arity: 1, params: "u8 linkPlayerIndex" },
  { name: 'Task_WaitForLinkPlayerConnection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitExitToScript', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ExitLinkToScript', ret: "UNUSED", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReconnectWithLinkPlayers', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TrySetBattleTowerLinkType', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_EnterCableClubSeat',
  'Task_LinkupAwaitConfirmation',
  'Task_LinkupAwaitConnection',
  'Task_LinkupAwaitTrainerCardData',
  'Task_LinkupCheckStatusAfterConfirm',
  'Task_LinkupConfirm',
  'Task_LinkupConfirmWhenReady',
  'Task_LinkupConnectionError',
  'Task_LinkupExchangeDataWithLeader',
  'Task_LinkupFailed',
  'Task_LinkupStart',
  'Task_LinkupTryConfirmation',
  'Task_ReconnectWithLinkPlayers',
  'Task_ReestablishLink',
  'Task_ReestablishLinkAwaitConfirmation',
  'Task_ReestablishLinkAwaitConnection',
  'Task_ReestablishLinkLeader',
  'Task_StartWiredCableClubBattle',
  'Task_StartWiredTrade',
  'Task_StartWirelessCableClubBattle',
  'Task_StartWirelessTrade',
  'Task_StopLinkup',
  'Task_ValidateMixingGameLanguage',
  'Task_WaitExitToScript',
  'Task_WaitForLinkPlayerConnection',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ReturnFromCableClubBattle',
  'CB2_ReturnFromUnionRoomBattle',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'battle.h',
  'battle_records.h',
  'battle_setup.h',
  'cable_club.h',
  'data.h',
  'event_data.h',
  'field_message_box.h',
  'field_specials.h',
  'field_weather.h',
  'international_string_util.h',
  'link.h',
  'link_rfu.h',
  'load_save.h',
  'm4a.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'union_room.h',
  'mystery_gift.h',
  'script.h',
  'script_pokemon_util.h',
  'sound.h',
  'start_menu.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'trade.h',
  'trainer_card.h',
  'party_menu.h',
  'window.h',
  'constants/battle_frontier.h',
  'constants/cable_club.h',
  'constants/songs.h',
  'constants/trainers.h',
] as const;
