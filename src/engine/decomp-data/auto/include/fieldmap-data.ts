// AUTO-GENERATED from include/fieldmap.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/fieldmap.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_TILES_IN_PRIMARY = 512;
export const NUM_TILES_TOTAL = 1024;
export const NUM_METATILES_IN_PRIMARY = 512;
export const NUM_METATILES_TOTAL = 1024;
export const NUM_PALS_IN_PRIMARY = 6;
export const NUM_PALS_TOTAL = 13;
export const MAX_MAP_DATA_SIZE = 10240;
export const NUM_TILES_PER_METATILE = 8;
export const MAP_OFFSET = 7;
/** Raw expr: `(MAP_OFFSET * 2 + 1)` */
export const MAP_OFFSET_W_EXPR = "(MAP_OFFSET * 2 + 1)";
/** Raw expr: `(MAP_OFFSET * 2)` */
export const MAP_OFFSET_H_EXPR = "(MAP_OFFSET * 2)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MapGridGetMetatileIdAt', ret: "u32", arity: 2, params: "int x, int y" },
  { name: 'MapGridGetMetatileBehaviorAt', ret: "u32", arity: 2, params: "int x, int y" },
  { name: 'MapGridSetMetatileIdAt', ret: "void", arity: 3, params: "int x, int y, u16 metatile" },
  { name: 'MapGridSetMetatileEntryAt', ret: "void", arity: 3, params: "int x, int y, u16 metatile" },
  { name: 'GetCameraCoords', ret: "void", arity: 2, params: "u16 *x, u16 *y" },
  { name: 'MapGridGetCollisionAt', ret: "u8", arity: 2, params: "int x, int y" },
  { name: 'GetMapBorderIdAt', ret: "int", arity: 2, params: "int x, int y" },
  { name: 'CanCameraMoveInDirection', ret: "bool32", arity: 1, params: "int direction" },
  { name: 'GetMetatileAttributesById', ret: "u16", arity: 1, params: "u16 metatile" },
  { name: 'GetCameraFocusCoords', ret: "void", arity: 2, params: "u16 *x, u16 *y" },
  { name: 'MapGridGetMetatileLayerTypeAt', ret: "u8", arity: 2, params: "int x, int y" },
  { name: 'MapGridGetElevationAt', ret: "u8", arity: 2, params: "int x, int y" },
  { name: 'CameraMove', ret: "bool8", arity: 2, params: "int x, int y" },
  { name: 'SaveMapView', ret: "void", arity: 0, params: "void" },
  { name: 'SetCameraFocusCoords', ret: "void", arity: 2, params: "u16 x, u16 y" },
  { name: 'InitMap', ret: "void", arity: 0, params: "void" },
  { name: 'InitMapFromSavedGame', ret: "void", arity: 0, params: "void" },
  { name: 'InitTrainerHillMap', ret: "void", arity: 0, params: "void" },
  { name: 'InitBattlePyramidMap', ret: "void", arity: 1, params: "bool8 setPlayerPosition" },
  { name: 'CopyMapTilesetsToVram', ret: "void", arity: 1, params: "struct MapLayout const *mapLayout" },
  { name: 'LoadMapTilesetPalettes', ret: "void", arity: 1, params: "struct MapLayout const *mapLayout" },
  { name: 'LoadSecondaryTilesetPalette', ret: "void", arity: 1, params: "struct MapLayout const *mapLayout" },
  { name: 'CopySecondaryTilesetToVramUsingHeap', ret: "void", arity: 1, params: "struct MapLayout const *mapLayout" },
  { name: 'CopyPrimaryTilesetToVram', ret: "void", arity: 1, params: "struct MapLayout const *mapLayout" },
  { name: 'CopySecondaryTilesetToVram', ret: "void", arity: 1, params: "struct MapLayout const *mapLayout" },
  { name: 'GetMapHeaderFromConnection', ret: "const", arity: 1, params: "const struct MapConnection *connection" },
  { name: 'MapGridSetMetatileImpassabilityAt', ret: "void", arity: 3, params: "int x, int y, bool32 impassable" },
  { name: 'FieldInitRegionMap', ret: "void", arity: 1, params: "MainCallback callback" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
] as const;
