// AUTO-GENERATED from include/contest_ai.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/contest_ai.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_CONTESTAI_0 = {
  CONTESTAI_SETTING_UP: 0,
  CONTESTAI_PROCESSING: 1,
  CONTESTAI_FINISHED: 2,
  CONTESTAI_DO_NOT_PROCESS: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ContestAI_ResetAI', ret: "void", arity: 1, params: "u8 contestantAI" },
  { name: 'ContestAI_GetActionToUse', ret: "u8", arity: 0, params: "void" },
] as const;
