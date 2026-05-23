// AUTO-GENERATED from src/play_time.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/play_time.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_STOPPED_0 = {
  STOPPED: 0,
  RUNNING: 1,
  MAXED_OUT: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PlayTimeCounter_Reset', ret: "void", arity: 0, params: "void" },
  { name: 'PlayTimeCounter_Start', ret: "void", arity: 0, params: "void" },
  { name: 'PlayTimeCounter_Stop', ret: "void", arity: 0, params: "void" },
  { name: 'PlayTimeCounter_Update', ret: "void", arity: 0, params: "void" },
  { name: 'PlayTimeCounter_SetToMax', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'play_time.h',
] as const;
