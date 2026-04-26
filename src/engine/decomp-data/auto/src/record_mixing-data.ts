// AUTO-GENERATED from src/record_mixing.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/record_mixing.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const BUFFER_CHUNK_SIZE = 200;
export const NUM_SWAP_COMBOS = 3;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tCounter_EXPR = "data[0]";
/** Raw expr: `data[8]` */
export const tTimer_EXPR = "data[8]";
/** Raw expr: `data[10]` */
export const tLinkTaskId_EXPR = "data[10]";
/** Raw expr: `data[15]` */
export const tSoundTaskId_EXPR = "data[15]";
/** Raw expr: `data[2]` */
export const tSentRecord_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const tNumChunksSent_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tMultiplayerId_EXPR = "data[5]";
/** Raw expr: `data[10]` */
export const tCopyTaskId_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const tParentTaskId_EXPR = "data[0]";
/** Raw expr: `data[5]` */
export const tRecvRecords_EXPR = "data[5]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MULTIPLAYER_0 = {
  MULTIPLAYER_ID: 0,
  DAYCARE_SLOT: 1,
} as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sPlayerIdxOrders_2Player: readonly number[] = [1,0] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct RecordMixingDaycareMail", name: 'sRecordMixMail', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_RecordMixing_Main', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_MixingRecordsRecv', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SendPacket', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CopyReceiveBuffer', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SendPacket_SwitchToReceive', ret: "void", arity: 1, params: "u8" },
  { name: 'StorePtrInTaskData', ret: "void", arity: 2, params: "void *, u16 *" },
  { name: 'GetMultiplayerId_', ret: "u8", arity: 0, params: "void" },
  { name: 'ReceiveOldManData', ret: "void", arity: 3, params: "OldMan *, size_t, u8" },
  { name: 'ReceiveBattleTowerData', ret: "void", arity: 3, params: "void *, size_t, u8" },
  { name: 'ReceiveLilycoveLadyData', ret: "void", arity: 3, params: "LilycoveLady *, size_t, u8" },
  { name: 'CalculateDaycareMailRandSum', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'ReceiveDaycareMailData', ret: "void", arity: 4, params: "struct RecordMixingDaycareMail *, size_t, u8, TVShow *" },
  { name: 'ReceiveGiftItem', ret: "void", arity: 2, params: "u16 *, u8" },
  { name: 'Task_DoRecordMixing', ret: "void", arity: 1, params: "u8" },
  { name: 'GetSavedApprentices', ret: "void", arity: 2, params: "struct Apprentice *, struct Apprentice *" },
  { name: 'ReceiveApprenticeData', ret: "void", arity: 3, params: "struct Apprentice *, size_t, u32" },
  { name: 'ReceiveRankingHallRecords', ret: "void", arity: 3, params: "struct PlayerHallRecords *, size_t, u32" },
  { name: 'GetRecordMixingDaycareMail', ret: "void", arity: 1, params: "struct RecordMixingDaycareMail *" },
  { name: 'SanitizeDaycareMailForRuby', ret: "void", arity: 1, params: "struct RecordMixingDaycareMail *" },
  { name: 'SanitizeEmeraldBattleTowerRecord', ret: "void", arity: 1, params: "struct EmeraldBattleTowerRecord *" },
  { name: 'SanitizeRubyBattleTowerRecord', ret: "void", arity: 1, params: "struct RSBattleTowerRecord *" },
  { name: 'RecordMixingPlayerSpotTriggered', ret: "void", arity: 0, params: "void" },
  { name: 'SetSrcLookupPointers', ret: "void", arity: 0, params: "void" },
  { name: 'PrepareUnknownExchangePacket', ret: "void", arity: 1, params: "struct PlayerRecordRS *dest" },
  { name: 'PrepareExchangePacketForRubySapphire', ret: "void", arity: 1, params: "struct PlayerRecordRS *dest" },
  { name: 'PrepareExchangePacket', ret: "void", arity: 0, params: "void" },
  { name: 'ReceiveExchangePacket', ret: "void", arity: 1, params: "u32 multiplayerId" },
  { name: 'PrintTextOnRecordMixing', ret: "void", arity: 1, params: "const u8 *src" },
  { name: 'Task_RecordMixing_SoundEffect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'memcpy', ret: "else", arity: 3, params: "dest, src, BUFFER_CHUNK_SIZE" },
  { name: 'Task_WaitReceivePacket', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReceivePacket', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShufflePlayerIndices', ret: "void", arity: 1, params: "u32 *data" },
  { name: 'SanitizeReceivedEmeraldOldMan', ret: "else", arity: 3, params: "oldMan, version, language" },
  { name: 'GetDaycareMailItemId', ret: "u8", arity: 1, params: "struct DaycareMail *mail" },
  { name: 'GetDaycareMailRandSum', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPlayerHallRecords', ret: "void", arity: 1, params: "struct PlayerHallRecords *dst" },
  { name: 'IsApprenticeAlreadySaved', ret: "bool32", arity: 2, params: "struct Apprentice *mixApprentice, struct Apprentice *apprentices" },
  { name: 'GetNewHallRecords', ret: "void", arity: 5, params: "struct RecordMixingHallRecords *dst, void *records, size_t recordSize, u32 multiplayerId, s32 linkPlayerCount" },
  { name: 'FillWinStreakRecords1P', ret: "void", arity: 2, params: "struct RankingHall1P *playerRecords, struct RankingHall1P *mixRecords" },
  { name: 'FillWinStreakRecords2P', ret: "void", arity: 2, params: "struct RankingHall2P *playerRecords, struct RankingHall2P *mixRecords" },
  { name: 'SaveHighestWinStreakRecords', ret: "void", arity: 1, params: "struct RecordMixingHallRecords *mixHallRecords" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CopyReceiveBuffer',
  'Task_DoRecordMixing',
  'Task_MixingRecordsRecv',
  'Task_ReceivePacket',
  'Task_RecordMixing_Main',
  'Task_RecordMixing_SoundEffect',
  'Task_SendPacket',
  'Task_SendPacket_SwitchToReceive',
  'Task_WaitReceivePacket',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'random.h',
  'constants/items.h',
  'text.h',
  'item.h',
  'task.h',
  'save.h',
  'load_save.h',
  'pokemon.h',
  'cable_club.h',
  'link.h',
  'link_rfu.h',
  'tv.h',
  'battle_tower.h',
  'window.h',
  'mystery_event_script.h',
  'secret_base.h',
  'mauville_old_man.h',
  'sound.h',
  'constants/songs.h',
  'menu.h',
  'overworld.h',
  'field_screen_effect.h',
  'fldeff_misc.h',
  'script.h',
  'event_data.h',
  'lilycove_lady.h',
  'strings.h',
  'string_util.h',
  'record_mixing.h',
  'new_game.h',
  'daycare.h',
  'international_string_util.h',
  'constants/battle_frontier.h',
  'dewford_trend.h',
] as const;
