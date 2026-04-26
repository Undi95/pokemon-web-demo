// AUTO-GENERATED from include/contest.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/contest.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(*gContestResources->contest)` */
export const eContest_EXPR = "(*gContestResources->contest)";
/** Raw expr: `(gContestResources->status)` */
export const eContestantStatus_EXPR = "(gContestResources->status)";
/** Raw expr: `(*gContestResources->appealResults)` */
export const eContestAppealResults_EXPR = "(*gContestResources->appealResults)";
/** Raw expr: `(*gContestResources->aiData)` */
export const eContestAI_EXPR = "(*gContestResources->aiData)";
/** Raw expr: `(*gContestResources->excitement)` */
export const eContestExcitement_EXPR = "(*gContestResources->excitement)";
/** Raw expr: `(gContestResources->gfxState)` */
export const eContestGfxState_EXPR = "(gContestResources->gfxState)";
/** Raw expr: `(gHeap + 0x18000)` */
export const eUnzippedContestAudience_Gfx_EXPR = "(gHeap + 0x18000)";
/** Raw expr: `(gHeap + 0x19000)` */
export const eContestAudienceFrame2_Gfx_EXPR = "(gHeap + 0x19000)";
/** Raw expr: `(gHeap[0x1a000])` */
export const eContestDebugMode_EXPR = "(gHeap[0x1a000])";
/** Raw expr: `(*(struct ContestTempSave *)(gHeap + 0x1a004))` */
export const eContestTempSave_EXPR = "(*(struct ContestTempSave *)(gHeap + 0x1a004))";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_CONTEST_0 = {
  CONTEST_STRING_MORE_CONSCIOUS: 0,
  CONTEST_STRING_NO_APPEAL: 1,
  CONTEST_STRING_SETTLE_DOWN: 2,
  CONTEST_STRING_OBLIVIOUS_TO_OTHERS: 3,
  CONTEST_STRING_LESS_AWARE: 4,
  CONTEST_STRING_STOPPED_CARING: 5,
  CONTEST_STRING_STARTLE_ATTEMPT: 6,
  CONTEST_STRING_DAZZLE_ATTEMPT: 7,
  CONTEST_STRING_JUDGE_LOOK_AWAY2: 8,
  CONTEST_STRING_UNNERVE_ATTEMPT: 9,
  CONTEST_STRING_NERVOUS: 10,
  CONTEST_STRING_UNNERVE_WAITING: 11,
  CONTEST_STRING_TAUNT_WELL: 12,
  CONTEST_STRING_REGAINED_FORM: 13,
  CONTEST_STRING_JAM_WELL: 14,
  CONTEST_STRING_HUSTLE_STANDOUT: 15,
  CONTEST_STRING_WORK_HARD_UNNOTICED: 16,
  CONTEST_STRING_WORK_BEFORE: 17,
  CONTEST_STRING_APPEAL_NOT_WELL: 18,
  CONTEST_STRING_WORK_PRECEDING: 19,
  CONTEST_STRING_APPEAL_NOT_WELL2: 20,
  CONTEST_STRING_APPEAL_NOT_SHOWN_WELL: 21,
  CONTEST_STRING_APPEAL_SLIGHTLY_WELL: 22,
  CONTEST_STRING_APPEAL_PRETTY_WELL: 23,
  CONTEST_STRING_APPEAL_EXCELLENTLY: 24,
  CONTEST_STRING_APPEAL_DUD: 25,
  CONTEST_STRING_APPEAL_NOT_VERY_WELL: 26,
  CONTEST_STRING_APPEAL_SLIGHTLY_WELL2: 27,
  CONTEST_STRING_APPEAL_PRETTY_WELL2: 28,
  CONTEST_STRING_APPEAL_VERY_WELL: 29,
  CONTEST_STRING_APPEAL_EXCELLENTLY2: 30,
  CONTEST_STRING_SAME_TYPE_GOOD: 31,
  CONTEST_STRING_DIFF_TYPE_GOOD: 32,
  CONTEST_STRING_STOOD_OUT_AS_MUCH: 33,
  CONTEST_STRING_NOT_AS_WELL: 34,
  CONTEST_STRING_CONDITION_ROSE: 35,
  CONTEST_STRING_HOT_STATUS: 36,
  CONTEST_STRING_MOVE_UP_LINE: 37,
  CONTEST_STRING_MOVE_BACK_LINE: 38,
  CONTEST_STRING_SCRAMBLE_ORDER: 39,
  CONTEST_STRING_JUDGE_EXPECTANTLY2: 40,
  CONTEST_STRING_WENT_OVER_WELL: 41,
  CONTEST_STRING_WENT_OVER_VERY_WELL: 42,
  CONTEST_STRING_APPEAL_COMBO_EXCELLENTLY: 43,
  CONTEST_STRING_AVERT_GAZE: 44,
  CONTEST_STRING_AVOID_SEEING: 45,
  CONTEST_STRING_NOT_FAZED: 46,
  CONTEST_STRING_LITTLE_DISTRACTED: 47,
  CONTEST_STRING_ATTEMPT_STARTLE: 48,
  CONTEST_STRING_LOOKED_DOWN: 49,
  CONTEST_STRING_TURNED_BACK: 50,
  CONTEST_STRING_UTTER_CRY: 51,
  CONTEST_STRING_LEAPT_UP: 52,
  CONTEST_STRING_TRIPPED_OVER: 53,
  CONTEST_STRING_MESSED_UP2: 54,
  CONTEST_STRING_FAILED_TARGET_NERVOUS: 55,
  CONTEST_STRING_FAILED_ANYONE_NERVOUS: 56,
  CONTEST_STRING_IGNORED: 57,
  CONTEST_STRING_NO_CONDITION_IMPROVE: 58,
  CONTEST_STRING_BAD_CONDITION_WEAK_APPEAL: 59,
  CONTEST_STRING_UNAFFECTED: 60,
  CONTEST_STRING_ATTRACTED_ATTENTION: 61,
  CONTEST_STRING_NONE: 255,
} as const;
export const ENUM_CONTEST_1 = {
  CONTEST_FILTER_NONE: 0,
  CONTEST_FILTER_NO_POSTGAME: 1,
  CONTEST_FILTER_ONLY_POSTGAME: 2,
} as const;
export const ENUM_CONDITION_2 = {
  CONDITION_NO_CHANGE: 0,
  CONDITION_GAIN: 1,
  CONDITION_LOSE: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ResetLinkContestBoolean', ret: "void", arity: 0, params: "void" },
  { name: 'LoadContestBgAfterMoveAnim', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_StartContest', ret: "void", arity: 0, params: "void" },
  { name: 'CreateContestMonFromParty', ret: "void", arity: 1, params: "u8 partyIndex" },
  { name: 'SetContestants', ret: "void", arity: 2, params: "u8 contestType, u8 rank" },
  { name: 'SetLinkAIContestants', ret: "void", arity: 3, params: "u8 contestType, u8 rank, bool32 isPostgame" },
  { name: 'GetContestEntryEligibility', ret: "u8", arity: 1, params: "struct Pokemon *pkmn" },
  { name: 'CalculateRound1Points', ret: "void", arity: 1, params: "u8 contestCategory" },
  { name: 'IsSpeciesNotUnown', ret: "bool8", arity: 1, params: "u16 species" },
  { name: 'Contest_IsMonsTurnDisabled', ret: "bool8", arity: 1, params: "u8 contestant" },
  { name: 'SaveLinkContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'SortContestants', ret: "void", arity: 1, params: "bool8 useRanking" },
  { name: 'SetContestantEffectStringID', ret: "void", arity: 2, params: "u8 contestant, u8 effectStringId" },
  { name: 'SetContestantEffectStringID2', ret: "void", arity: 2, params: "u8 contestant, u8 effectStringId" },
  { name: 'SetStartledString', ret: "void", arity: 2, params: "u8 contestant, u8 jam" },
  { name: 'MakeContestantNervous', ret: "void", arity: 1, params: "u8 p" },
  { name: 'Contest_GetMoveExcitement', ret: "s8", arity: 1, params: "u16 move" },
  { name: 'IsContestantAllowedToCombo', ret: "bool8", arity: 1, params: "u8 contestant" },
  { name: 'Contest_PrintTextToBg0WindowAt', ret: "void", arity: 5, params: "u32 windowId, u8 *currChar, s32 x, s32 y, s32 fontId" },
  { name: 'ResetContestLinkResults', ret: "void", arity: 0, params: "void" },
  { name: 'SaveContestWinner', ret: "bool8", arity: 1, params: "u8 rank" },
  { name: 'GetContestWinnerSaveIdx', ret: "u8", arity: 2, params: "u8 rank, bool8 shift" },
  { name: 'ClearContestWinnerPicsInContestHall', ret: "void", arity: 0, params: "void" },
  { name: 'StripPlayerAndMonNamesForLinkContest', ret: "void", arity: 2, params: "struct ContestPokemon *mon, s32 language" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_StartContest',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'palette.h',
  'constants/contest.h',
] as const;
