// AUTO-GENERATED from src/dewford_trend.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/dewford_trend.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(sizeof(struct DewfordTrend) * SAVED_TRENDS_COUNT)` */
export const SAVED_TRENDS_SIZE_EXPR = "(sizeof(struct DewfordTrend) * SAVED_TRENDS_COUNT)";
/** Raw expr: `max(SAVED_TRENDS_SIZE * MAX_LINK_PLAYERS, 0x100)` */
export const BUFFER_SIZE_EXPR = "max(SAVED_TRENDS_SIZE * MAX_LINK_PLAYERS, 0x100)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SORT_0 = {
  SORT_MODE_NORMAL: 0,
  SORT_MODE_MAX_FIRST: 1,
  SORT_MODE_FULL: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SortTrends', ret: "void", arity: 3, params: "struct DewfordTrend *, u16, u8" },
  { name: 'CompareTrends', ret: "bool8", arity: 3, params: "struct DewfordTrend *, struct DewfordTrend *, u8" },
  { name: 'SeedTrendRng', ret: "void", arity: 1, params: "struct DewfordTrend *" },
  { name: 'IsPhraseInSavedTrends', ret: "bool8", arity: 1, params: "u16 *" },
  { name: 'IsEasyChatPairEqual', ret: "bool8", arity: 2, params: "u16 *, u16 *" },
  { name: 'GetSavedTrendIndex', ret: "s16", arity: 3, params: "struct DewfordTrend *, struct DewfordTrend *, u16" },
  { name: 'InitDewfordTrend', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateDewfordTrendPerDay', ret: "void", arity: 1, params: "u16 days" },
  { name: 'TrySetTrendyPhrase', ret: "bool8", arity: 1, params: "u16 *phrase" },
  { name: 'ReceiveDewfordTrendData', ret: "void", arity: 3, params: "struct DewfordTrend *linkedTrends, size_t size, u8 unused" },
  { name: 'BufferTrendyPhraseString', ret: "void", arity: 0, params: "void" },
  { name: 'IsTrendyPhraseBoring', ret: "void", arity: 0, params: "void" },
  { name: 'GetDewfordHallPaintingNameIndex', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'dewford_trend.h',
  'easy_chat.h',
  'event_data.h',
  'link.h',
  'malloc.h',
  'random.h',
  'text.h',
  'tv.h',
  'string_util.h',
] as const;
