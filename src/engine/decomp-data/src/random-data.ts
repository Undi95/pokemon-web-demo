// AUTO-GENERATED from src/random.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/random.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnknown', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sRandCount', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'gRngValue', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'gRng2Value', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Random', ret: "u16", arity: 0, params: "void" },
  { name: 'SeedRng', ret: "void", arity: 1, params: "u16 seed" },
  { name: 'SeedRng2', ret: "void", arity: 1, params: "u16 seed" },
  { name: 'Random2', ret: "u16", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'random.h',
] as const;
