// AUTO-GENERATED from src/roamer.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/roamer.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ROAMER_MAP_GROUP = 0;
/** Raw expr: `(&gSaveBlock1Ptr->roamer)` */
export const ROAMER_EXPR = "(&gSaveBlock1Ptr->roamer)";
/** Raw expr: `MAP_NUM(MAP_UNDEFINED)` */
export const ____EXPR = "MAP_NUM(MAP_UNDEFINED)";
/** Raw expr: `(ARRAY_COUNT(sRoamerLocations) - 1)` */
export const NUM_LOCATION_SETS_EXPR = "(ARRAY_COUNT(sRoamerLocations) - 1)";
/** Raw expr: `(ARRAY_COUNT(sRoamerLocations[0]))` */
export const NUM_LOCATIONS_PER_SET_EXPR = "(ARRAY_COUNT(sRoamerLocations[0]))";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MAP_0 = {
  MAP_GRP: 0,
  MAP_NUM: 1,
} as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sRoamerLocation', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearRoamerData', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRoamerLocationData', ret: "void", arity: 0, params: "void" },
  { name: 'CreateInitialRoamerMon', ret: "void", arity: 1, params: "bool16 createLatios" },
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

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'pokemon.h',
  'random.h',
  'roamer.h',
] as const;
