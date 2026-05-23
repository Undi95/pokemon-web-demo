// AUTO-GENERATED from src/trig.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/trig.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Sin', ret: "s16", arity: 2, params: "s16 index, s16 amplitude" },
  { name: 'Cos', ret: "s16", arity: 2, params: "s16 index, s16 amplitude" },
  { name: 'Sin2', ret: "s16", arity: 1, params: "u16 angle" },
  { name: 'Cos2', ret: "s16", arity: 1, params: "u16 angle" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'trig.h',
] as const;
