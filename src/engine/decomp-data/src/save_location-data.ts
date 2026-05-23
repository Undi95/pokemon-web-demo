// AUTO-GENERATED from src/save_location.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/save_location.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const LIST_END = 65535;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'IsCurMapInLocationList', ret: "bool32", arity: 1, params: "const u16 *list" },
  { name: 'IsCurMapPokeCenter', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsCurMapReloadLocation', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsCurMapInEmptyList', ret: "bool32", arity: 0, params: "void" },
  { name: 'TrySetPokeCenterWarpStatus', ret: "void", arity: 0, params: "void" },
  { name: 'TrySetReloadWarpStatus', ret: "void", arity: 0, params: "void" },
  { name: 'TrySetUnknownWarpStatus', ret: "void", arity: 0, params: "void" },
  { name: 'TrySetMapSaveWarpStatus', ret: "void", arity: 0, params: "void" },
  { name: 'SetUnlockedPokedexFlags', ret: "void", arity: 0, params: "void" },
  { name: 'SetChampionSaveWarp', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'save_location.h',
] as const;
