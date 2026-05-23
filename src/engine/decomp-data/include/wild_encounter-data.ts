// AUTO-GENERATED from include/wild_encounter.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/wild_encounter.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DisableWildEncounters', ret: "void", arity: 1, params: "bool8 disabled" },
  { name: 'StandardWildEncounter', ret: "bool8", arity: 2, params: "u16 curMetatileBehavior, u16 prevMetatileBehavior" },
  { name: 'SweetScentWildEncounter', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoesCurrentMapHaveFishingMons', ret: "bool8", arity: 0, params: "void" },
  { name: 'FishingWildEncounter', ret: "void", arity: 1, params: "u8 rod" },
  { name: 'GetLocalWildMon', ret: "u16", arity: 1, params: "bool8 *isWaterMon" },
  { name: 'GetLocalWaterMon', ret: "u16", arity: 0, params: "void" },
  { name: 'UpdateRepelCounter', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/wild_encounter.h',
] as const;
