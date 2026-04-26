// AUTO-GENERATED from src/recorded_battle.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/recorded_battle.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const BATTLER_RECORD_SIZE = 664;
/** Raw expr: `data[0]` */
export const tFramesToWait_EXPR = "data[0]";
export const ACTION_MOVE_CHANGE = 6;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u32", name: 'gRecordedBattleRngSeed', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gBattlePalaceMoveSelectionRngValue', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sBattlerRecordSizes', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sBattlerPrevRecordSizes', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sBattlerSavedRecordSizes', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sRecordMode', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sLvlMode', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sFrontierFacility', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sFrontierBrainSymbol', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "MainCallback", name: 'sCallback2_AfterRecordedBattle', isArray: false, init: "NULL" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gRecordedBattleMultiplayerId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sFrontierPassFlag', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBattleScene', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sTextSpeed', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sBattleFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sAI_Scripts', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct Pokemon", name: 'sSavedPlayerParty', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct Pokemon", name: 'sSavedOpponentParty', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct PlayerInfo", name: 'sPlayers', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sIsPlaybackFinished', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sRecordMixFriendName', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sRecordMixFriendClass', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sApprenticeId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sEasyChatSpeech', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBattleOutcome', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetNextRecordedDataByte', ret: "u8", arity: 3, params: "u8 *, u8 *, u8 *" },
  { name: 'CopyRecordedBattleFromSave', ret: "bool32", arity: 1, params: "struct RecordedBattleSave *" },
  { name: 'RecordedBattle_RestoreSavedParties', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_RecordedBattle', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_Init', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'RecordedBattle_SetTrainerInfo', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_SetBattlerAction', ret: "void", arity: 2, params: "u8 battler, u8 action" },
  { name: 'RecordedBattle_ClearBattlerAction', ret: "void", arity: 2, params: "u8 battler, u8 bytesToClear" },
  { name: 'RecordedBattle_GetBattlerAction', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'GetRecordedBattleMode', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'RecordedBattle_BufferNewBattlerData', ret: "u8", arity: 1, params: "u8 *dst" },
  { name: 'RecordedBattle_RecordAllBattlerData', ret: "void", arity: 1, params: "u8 *src" },
  { name: 'CanCopyRecordedBattleSaveData', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsRecordedBattleSaveValid', ret: "bool32", arity: 1, params: "struct RecordedBattleSave *save" },
  { name: 'RecordedBattleToSave', ret: "bool32", arity: 2, params: "struct RecordedBattleSave *battleSave, struct RecordedBattleSave *saveSector" },
  { name: 'MoveRecordedBattleToSaveData', ret: "bool32", arity: 0, params: "void" },
  { name: 'TryCopyRecordedBattleSaveData', ret: "bool32", arity: 2, params: "struct RecordedBattleSave *dst, struct SaveSector *saveBuffer" },
  { name: 'CB2_RecordedBattleEnd', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartAfterCountdown', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetVariablesForRecordedBattle', ret: "void", arity: 1, params: "struct RecordedBattleSave *src" },
  { name: 'GetRecordedBattleFrontierFacility', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleFronterBrainSymbol', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_SaveParties', ret: "void", arity: 0, params: "void" },
  { name: 'GetActiveBattlerLinkPlayerGender', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_ClearFrontierPassFlag', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_SetFrontierPassFlagFromHword', ret: "void", arity: 1, params: "u16 flags" },
  { name: 'RecordedBattle_GetFrontierPassFlag', ret: "u8", arity: 0, params: "void" },
  { name: 'GetBattleSceneInRecordedBattle', ret: "u8", arity: 0, params: "void" },
  { name: 'GetTextSpeedInRecordedBattle', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_CopyBattlerMoves', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_CheckMovesetChanges', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'GetAiScriptsInRecordedBattle', ret: "u32", arity: 0, params: "void" },
  { name: 'RecordedBattle_SetPlaybackFinished', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_CanStopPlayback', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleRecordMixFriendName', ret: "void", arity: 1, params: "u8 *dst" },
  { name: 'GetRecordedBattleRecordMixFriendClass', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleApprenticeId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleRecordMixFriendLanguage', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleApprenticeLanguage', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_SaveBattleOutcome', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_StartAfterCountdown',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_RecordedBattle',
  'CB2_RecordedBattleEnd',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_controllers.h',
  'recorded_battle.h',
  'main.h',
  'pokemon.h',
  'random.h',
  'event_data.h',
  'link.h',
  'string_util.h',
  'palette.h',
  'save.h',
  'malloc.h',
  'util.h',
  'task.h',
  'text.h',
  'battle_setup.h',
  'frontier_util.h',
  'constants/trainers.h',
  'constants/rgb.h',
] as const;
