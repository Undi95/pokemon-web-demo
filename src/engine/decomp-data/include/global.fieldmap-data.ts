// AUTO-GENERATED from include/global.fieldmap.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAPGRID_METATILE_ID_MASK = 1023;
export const MAPGRID_COLLISION_MASK = 3072;
export const MAPGRID_ELEVATION_MASK = 61440;
export const MAPGRID_METATILE_ID_SHIFT = 0;
export const MAPGRID_COLLISION_SHIFT = 10;
export const MAPGRID_ELEVATION_SHIFT = 12;
/** Raw expr: `MAPGRID_METATILE_ID_MASK` */
export const MAPGRID_UNDEFINED_EXPR = "MAPGRID_METATILE_ID_MASK";
/** Raw expr: `MAPGRID_COLLISION_MASK` */
export const MAPGRID_IMPASSABLE_EXPR = "MAPGRID_COLLISION_MASK";
export const METATILE_ATTR_BEHAVIOR_MASK = 255;
export const METATILE_ATTR_LAYER_MASK = 61440;
export const METATILE_ATTR_BEHAVIOR_SHIFT = 0;
export const METATILE_ATTR_LAYER_SHIFT = 12;
export const METATILE_ROW_WIDTH = 8;
/** Raw expr: `(1 << 0)` */
export const PLAYER_AVATAR_FLAG_ON_FOOT_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const PLAYER_AVATAR_FLAG_MACH_BIKE_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const PLAYER_AVATAR_FLAG_ACRO_BIKE_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const PLAYER_AVATAR_FLAG_SURFING_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const PLAYER_AVATAR_FLAG_UNDERWATER_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const PLAYER_AVATAR_FLAG_CONTROLLABLE_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const PLAYER_AVATAR_FLAG_FORCED_MOVE_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const PLAYER_AVATAR_FLAG_DASH_EXPR = "(1 << 7)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_METATILE_0 = {
  METATILE_LAYER_TYPE_NORMAL: 0,
  METATILE_LAYER_TYPE_COVERED: 1,
  METATILE_LAYER_TYPE_SPLIT: 2,
} as const;
export const ENUM_PLAYER_1 = {
  PLAYER_AVATAR_STATE_NORMAL: 0,
  PLAYER_AVATAR_STATE_MACH_BIKE: 1,
  PLAYER_AVATAR_STATE_ACRO_BIKE: 2,
  PLAYER_AVATAR_STATE_SURFING: 3,
  PLAYER_AVATAR_STATE_UNDERWATER: 4,
  PLAYER_AVATAR_STATE_FIELD_MOVE: 5,
  PLAYER_AVATAR_STATE_FISHING: 6,
  PLAYER_AVATAR_STATE_WATERING: 7,
} as const;
export const ENUM_ACRO_2 = {
  ACRO_BIKE_NORMAL: 0,
  ACRO_BIKE_TURNING: 1,
  ACRO_BIKE_WHEELIE_STANDING: 2,
  ACRO_BIKE_BUNNY_HOP: 3,
  ACRO_BIKE_WHEELIE_MOVING: 4,
  ACRO_BIKE_STATE5: 5,
  ACRO_BIKE_STATE6: 6,
} as const;
export const ENUM_COLLISION_3 = {
  COLLISION_NONE: 0,
  COLLISION_OUTSIDE_RANGE: 1,
  COLLISION_IMPASSABLE: 2,
  COLLISION_ELEVATION_MISMATCH: 3,
  COLLISION_OBJECT_EVENT: 4,
  COLLISION_STOP_SURFING: 5,
  COLLISION_LEDGE_JUMP: 6,
  COLLISION_PUSHED_BOULDER: 7,
  COLLISION_ROTATING_GATE: 8,
  COLLISION_WHEELIE_HOP: 9,
  COLLISION_ISOLATED_VERTICAL_RAIL: 10,
  COLLISION_ISOLATED_HORIZONTAL_RAIL: 11,
  COLLISION_VERTICAL_RAIL: 12,
  COLLISION_HORIZONTAL_RAIL: 13,
} as const;
export const ENUM_NOT_4 = {
  NOT_MOVING: 0,
  TURN_DIRECTION: 1,
  MOVING: 2,
} as const;
export const ENUM_T_5 = {
  T_NOT_MOVING: 0,
  T_TILE_TRANSITION: 1,
  T_TILE_CENTER: 2,
} as const;
