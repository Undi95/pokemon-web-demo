// AUTO-GENERATED from src/post_battle_event_funcs.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/post_battle_event_funcs.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GameClear', ret: "int", arity: 0, params: "void" },
  { name: 'SetContinueGameWarpToHealLocation', ret: "else", arity: 1, params: "HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE_2F" },
  { name: 'SetCB2WhiteOut', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'credits.h',
  'event_data.h',
  'hall_of_fame.h',
  'load_save.h',
  'overworld.h',
  'script_pokemon_util.h',
  'tv.h',
  'constants/heal_locations.h',
] as const;
