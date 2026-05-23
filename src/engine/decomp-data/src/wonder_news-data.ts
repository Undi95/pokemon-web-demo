// AUTO-GENERATED from src/wonder_news.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/wonder_news.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_SENT_REWARD = 4;
export const MAX_REWARD = 5;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetRewardItem', ret: "u32", arity: 1, params: "struct WonderNewsMetadata *" },
  { name: 'GetRewardType', ret: "u32", arity: 1, params: "struct WonderNewsMetadata *" },
  { name: 'IncrementRewardCounter', ret: "void", arity: 1, params: "struct WonderNewsMetadata *" },
  { name: 'IncrementSentRewardCounter', ret: "void", arity: 1, params: "struct WonderNewsMetadata *" },
  { name: 'ResetSentRewardCounter', ret: "void", arity: 1, params: "struct WonderNewsMetadata *" },
  { name: 'WonderNews_SetReward', ret: "void", arity: 1, params: "u32 newsType" },
  { name: 'WonderNews_Reset', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_IncrementStepCounter', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_GetRewardInfo', ret: "u16", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'mystery_gift.h',
  'random.h',
  'event_data.h',
  'wonder_news.h',
  'constants/items.h',
] as const;
