// AUTO-GENERATED from include/region_map.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/region_map.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAP_NAME_LENGTH = 16;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MAP_0 = {
  MAP_INPUT_NONE: 0,
  MAP_INPUT_MOVE_START: 1,
  MAP_INPUT_MOVE_CONT: 2,
  MAP_INPUT_MOVE_END: 3,
  MAP_INPUT_A_BUTTON: 4,
  MAP_INPUT_B_BUTTON: 5,
} as const;
export const ENUM_MAPSECTYPE_1 = {
  MAPSECTYPE_NONE: 0,
  MAPSECTYPE_ROUTE: 1,
  MAPSECTYPE_CITY_CANFLY: 2,
  MAPSECTYPE_CITY_CANTFLY: 3,
  MAPSECTYPE_BATTLE_FRONTIER: 4,
  NUM_MAPSEC_TYPES: 5,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitRegionMapData', ret: "void", arity: 3, params: "struct RegionMap *regionMap, const struct BgTemplate *template, bool8 zoomed" },
  { name: 'LoadRegionMapGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateRegionMapVideoRegs', ret: "void", arity: 0, params: "void" },
  { name: 'InitRegionMap', ret: "void", arity: 2, params: "struct RegionMap *regionMap, bool8 zoomed" },
  { name: 'DoRegionMapInputCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'UpdateRegionMapZoom', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreeRegionMapIconResources', ret: "void", arity: 0, params: "void" },
  { name: 'GetRegionMapSecIdAt', ret: "mapsec_u16_t", arity: 2, params: "u16 x, u16 y" },
  { name: 'CreateRegionMapPlayerIcon', ret: "void", arity: 2, params: "u16 tileTag, u16 paletteTag" },
  { name: 'CreateRegionMapCursor', ret: "void", arity: 2, params: "u16 tileTag, u16 paletteTag" },
  { name: 'IsEventIslandMapSecId', ret: "bool32", arity: 1, params: "mapsec_u8_t mapSecId" },
  { name: 'CorrectSpecialMapSecId', ret: "mapsec_u16_t", arity: 1, params: "mapsec_u16_t mapSecId" },
  { name: 'ShowRegionMapForPokedexAreaScreen', ret: "void", arity: 1, params: "struct RegionMap *regionMap" },
  { name: 'PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'CB2_OpenFlyMap', ret: "void", arity: 0, params: "void" },
  { name: 'IsRegionMapZoomed', ret: "bool8", arity: 0, params: "void" },
  { name: 'TrySetPlayerIconBlink', ret: "void", arity: 0, params: "void" },
  { name: 'BlendRegionMap', ret: "void", arity: 2, params: "u16 color, u32 coeff" },
  { name: 'SetRegionMapDataForZoom', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_OpenFlyMap',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'bg.h',
] as const;
