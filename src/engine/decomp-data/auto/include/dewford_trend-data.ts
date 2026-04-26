// AUTO-GENERATED from include/dewford_trend.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/dewford_trend.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitDewfordTrend', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateDewfordTrendPerDay', ret: "void", arity: 1, params: "u16 days" },
  { name: 'TrySetTrendyPhrase', ret: "bool8", arity: 1, params: "u16 *phrase" },
  { name: 'ReceiveDewfordTrendData', ret: "void", arity: 3, params: "struct DewfordTrend *linkedTrends, size_t size, u8 unused" },
] as const;
