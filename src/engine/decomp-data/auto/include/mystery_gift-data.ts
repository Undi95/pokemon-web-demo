// AUTO-GENERATED from include/mystery_gift.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mystery_gift.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSavedWonderNewsAndRelated', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSavedWonderCardAndRelated', ret: "void", arity: 0, params: "void" },
  { name: 'SaveWonderNews', ret: "bool32", arity: 1, params: "const struct WonderNews *news" },
  { name: 'SaveWonderCard', ret: "bool32", arity: 1, params: "const struct WonderCard *card" },
  { name: 'ValidateSavedWonderNews', ret: "bool32", arity: 0, params: "void" },
  { name: 'ValidateSavedWonderCard', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsWonderNewsSameAsSaved', ret: "bool32", arity: 1, params: "const u8 *news" },
  { name: 'IsSendingSavedWonderNewsAllowed', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsSendingSavedWonderCardAllowed', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetWonderCardFlagID', ret: "u16", arity: 0, params: "void" },
  { name: 'DisableWonderCardSending', ret: "void", arity: 1, params: "struct WonderCard *card" },
  { name: 'IsSavedWonderCardGiftNotReceived', ret: "bool32", arity: 0, params: "void" },
  { name: 'MysteryGift_TrySaveStamp', ret: "bool32", arity: 1, params: "const u16 *stamp" },
  { name: 'MysteryGift_LoadLinkGameData', ret: "void", arity: 2, params: "struct MysteryGiftLinkGameData *data, bool32 isWonderNews" },
  { name: 'MysteryGift_ValidateLinkGameData', ret: "bool32", arity: 2, params: "const struct MysteryGiftLinkGameData *data, bool32 isWonderNews" },
  { name: 'MysteryGift_CompareCardFlags', ret: "u32", arity: 3, params: "const u16 *flagId, const struct MysteryGiftLinkGameData *data, const void *unused" },
  { name: 'MysteryGift_CheckStamps', ret: "u32", arity: 3, params: "const u16 *stamp, const struct MysteryGiftLinkGameData *data, const void *unused" },
  { name: 'MysteryGift_DoesQuestionnaireMatch', ret: "bool32", arity: 2, params: "const struct MysteryGiftLinkGameData *data, const u16 *words" },
  { name: 'MysteryGift_GetCardStatFromLinkData', ret: "u16", arity: 2, params: "const struct MysteryGiftLinkGameData *data, u32 stat" },
  { name: 'MysteryGift_GetCardStat', ret: "u16", arity: 1, params: "u32 stat" },
  { name: 'MysteryGift_DisableStats', ret: "void", arity: 0, params: "void" },
  { name: 'MysteryGift_TryEnableStatsByFlagId', ret: "bool32", arity: 1, params: "u16 flagId" },
  { name: 'MysteryGift_TryIncrementStat', ret: "void", arity: 2, params: "u32 stat, u32 trainerId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
  'constants/mystery_gift.h',
] as const;
