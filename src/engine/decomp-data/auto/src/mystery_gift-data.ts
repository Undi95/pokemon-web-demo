// AUTO-GENERATED from src/mystery_gift.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_gift.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GAME_DATA_VALID_VAR = 257;
/** Raw expr: `(1 << 2)` */
export const GAME_DATA_VALID_GIFT_TYPE_1_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 9)` */
export const GAME_DATA_VALID_GIFT_TYPE_2_EXPR = "(1 << 9)";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "bool32", name: 'sStatsEnabled', isArray: false, init: "FALSE" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearSavedWonderNewsMetadata', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSavedWonderNews', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSavedWonderCard', ret: "void", arity: 0, params: "void" },
  { name: 'ValidateWonderNews', ret: "bool32", arity: 1, params: "const struct WonderNews *" },
  { name: 'ValidateWonderCard', ret: "bool32", arity: 1, params: "const struct WonderCard *" },
  { name: 'ClearSavedWonderCardMetadata', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSavedTrainerIds', ret: "void", arity: 0, params: "void" },
  { name: 'IncrementCardStatForNewTrainer', ret: "void", arity: 4, params: "u32, u32, u32 *, int" },
  { name: 'ClearMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSavedWonderNewsAndRelated', ret: "void", arity: 0, params: "void" },
  { name: 'SaveWonderNews', ret: "bool32", arity: 1, params: "const struct WonderNews *news" },
  { name: 'ValidateSavedWonderNews', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsSendingSavedWonderNewsAllowed', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsWonderNewsSameAsSaved', ret: "bool32", arity: 1, params: "const u8 *news" },
  { name: 'ClearSavedWonderCardAndRelated', ret: "void", arity: 0, params: "void" },
  { name: 'SaveWonderCard', ret: "bool32", arity: 1, params: "const struct WonderCard *card" },
  { name: 'ValidateSavedWonderCard', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsSendingSavedWonderCardAllowed', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetWonderCardFlagID', ret: "u16", arity: 0, params: "void" },
  { name: 'DisableWonderCardSending', ret: "void", arity: 1, params: "struct WonderCard *card" },
  { name: 'IsWonderCardFlagIDInValidRange', ret: "bool32", arity: 1, params: "u16 flagId" },
  { name: 'IsSavedWonderCardGiftNotReceived', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetNumStampsInMetadata', ret: "int", arity: 2, params: "const struct WonderCardMetadata *data, int size" },
  { name: 'IsStampInMetadata', ret: "bool32", arity: 3, params: "const struct WonderCardMetadata *metadata, const u16 *stamp, int maxStamps" },
  { name: 'ValidateStamp', ret: "bool32", arity: 1, params: "const u16 *stamp" },
  { name: 'GetNumStampsInSavedCard', ret: "int", arity: 0, params: "void" },
  { name: 'MysteryGift_TrySaveStamp', ret: "bool32", arity: 1, params: "const u16 *stamp" },
  { name: 'MysteryGift_LoadLinkGameData', ret: "void", arity: 2, params: "struct MysteryGiftLinkGameData *data, bool32 isWonderNews" },
  { name: 'MysteryGift_ValidateLinkGameData', ret: "bool32", arity: 2, params: "const struct MysteryGiftLinkGameData *data, bool32 isWonderNews" },
  { name: 'MysteryGift_CompareCardFlags', ret: "u32", arity: 3, params: "const u16 *flagId, const struct MysteryGiftLinkGameData *data, const void *unused" },
  { name: 'MysteryGift_CheckStamps', ret: "u32", arity: 3, params: "const u16 *stamp, const struct MysteryGiftLinkGameData *data, const void *unused" },
  { name: 'MysteryGift_DoesQuestionnaireMatch', ret: "bool32", arity: 2, params: "const struct MysteryGiftLinkGameData *data, const u16 *words" },
  { name: 'GetNumStampsInLinkData', ret: "int", arity: 1, params: "const struct MysteryGiftLinkGameData *data" },
  { name: 'MysteryGift_GetCardStatFromLinkData', ret: "u16", arity: 2, params: "const struct MysteryGiftLinkGameData *data, u32 stat" },
  { name: 'IncrementCardStat', ret: "void", arity: 1, params: "u32 statType" },
  { name: 'MysteryGift_GetCardStat', ret: "u16", arity: 1, params: "u32 stat" },
  { name: 'MysteryGift_DisableStats', ret: "void", arity: 0, params: "void" },
  { name: 'MysteryGift_TryEnableStatsByFlagId', ret: "bool32", arity: 1, params: "u16 flagId" },
  { name: 'MysteryGift_TryIncrementStat', ret: "void", arity: 2, params: "u32 stat, u32 trainerId" },
  { name: 'RecordTrainerId', ret: "bool32", arity: 3, params: "u32 trainerId, u32 *trainerIds, int size" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'util.h',
  'main.h',
  'event_data.h',
  'easy_chat.h',
  'script.h',
  'battle_tower.h',
  'wonder_news.h',
  'string_util.h',
  'new_game.h',
  'mystery_gift.h',
  'constants/mystery_gift.h',
] as const;
