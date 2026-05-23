// AUTO-GENERATED from include/pokemon_summary_screen.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokemon_summary_screen.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PokemonSummaryScreenMode = {
  SUMMARY_MODE_NORMAL: 0,
  SUMMARY_MODE_LOCK_MOVES: 1,
  SUMMARY_MODE_BOX: 2,
  SUMMARY_MODE_SELECT_MOVE: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetMoveSlotToReplace', ret: "u8", arity: 0, params: "void" },
  { name: 'SummaryScreen_SetAnimDelayTaskId', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
] as const;
