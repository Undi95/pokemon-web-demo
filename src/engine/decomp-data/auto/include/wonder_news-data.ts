// AUTO-GENERATED from include/wonder_news.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/wonder_news.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WONDER_0 = {
  WONDER_NEWS_NONE: 0,
  WONDER_NEWS_RECV_FRIEND: 1,
  WONDER_NEWS_RECV_WIRELESS: 2,
  WONDER_NEWS_SENT: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'WonderNews_Reset', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_SetReward', ret: "void", arity: 1, params: "u32 newsType" },
] as const;
