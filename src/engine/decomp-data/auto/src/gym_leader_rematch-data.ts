// AUTO-GENERATED from src/gym_leader_rematch.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/gym_leader_rematch.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'UpdateGymLeaderRematchFromArray', ret: "void", arity: 3, params: "const u16 *data, size_t size, u32 maxRematch" },
  { name: 'GetRematchIndex', ret: "s32", arity: 1, params: "u32 trainerIdx" },
  { name: 'UpdateGymLeaderRematch', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'random.h',
  'event_data.h',
  'battle_setup.h',
  'gym_leader_rematch.h',
] as const;
