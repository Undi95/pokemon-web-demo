// AUTO-GENERATED from include/roamer.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/roamer.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearRoamerData', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRoamerLocationData', ret: "void", arity: 0, params: "void" },
  { name: 'InitRoamer', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateLocationHistoryForRoamer', ret: "void", arity: 0, params: "void" },
  { name: 'RoamerMoveToOtherLocationSet', ret: "void", arity: 0, params: "void" },
  { name: 'RoamerMove', ret: "void", arity: 0, params: "void" },
  { name: 'IsRoamerAt', ret: "bool8", arity: 2, params: "u8 mapGroup, u8 mapNum" },
  { name: 'CreateRoamerMonInstance', ret: "void", arity: 0, params: "void" },
  { name: 'TryStartRoamerEncounter', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateRoamerHPStatus', ret: "void", arity: 1, params: "struct Pokemon *mon" },
  { name: 'SetRoamerInactive', ret: "void", arity: 0, params: "void" },
  { name: 'GetRoamerLocation', ret: "void", arity: 2, params: "u8 *mapGroup, u8 *mapNum" },
] as const;
