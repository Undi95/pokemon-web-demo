/**
 * metatile-behavior.ts — 1:1 décomp port `src/metatile_behavior.c`.
 *
 * Helpers `MetatileBehavior_Is*` pour classifier les metatile behaviors.
 * Ce fichier ne contient QUE les helpers liés au système warp/door/hole/escalator
 * (= phase 1 chantier OW 1:1 strict). Les autres helpers (encounter, surf,
 * jump, sand, etc.) sont à porter dans des fichiers dédiés si nécessaire.
 *
 * Pattern décomp pour chaque fonction :
 * ```c
 * bool8 MetatileBehavior_IsX(u8 metatileBehavior) {
 *     if (metatileBehavior == MB_X) return TRUE;
 *     else return FALSE;
 * }
 * ```
 *
 * Notre port : fonction simple `boolean` retour, sans `TRUE/FALSE` enum
 * (= TS booleans direct). Conserve nom exact (= `MetatileBehavior_Is*` avec
 * underscore_case pour matcher décomp grep-ability).
 */

import {
  // Door / Ladder / Escalator / Warp
  MB_ANIMATED_DOOR,
  MB_NON_ANIMATED_DOOR,
  MB_WATER_DOOR,
  MB_DEEP_SOUTH_WARP,
  MB_LADDER,
  MB_NORTH_ARROW_WARP,
  MB_SOUTH_ARROW_WARP,
  MB_EAST_ARROW_WARP,
  MB_WEST_ARROW_WARP,
  MB_AQUA_HIDEOUT_WARP,
  MB_CRACKED_FLOOR_HOLE,
  MB_CRACKED_FLOOR,
  MB_MT_PYRE_HOLE,
  MB_UP_ESCALATOR,
  MB_DOWN_ESCALATOR,
  MB_PETALBURG_GYM_DOOR,
  MB_LAVARIDGE_GYM_B1F_WARP,
  MB_LAVARIDGE_GYM_1F_WARP,
  MB_MOSSDEEP_GYM_WARP,
  MB_BATTLE_PYRAMID_WARP,
  MB_STAIRS_OUTSIDE_ABANDONED_SHIP,
  MB_WATER_SOUTH_ARROW_WARP,
  MB_SHOAL_CAVE_ENTRANCE,
  MB_BRIDGE_OVER_OCEAN,
  // Grass / Sand / Ice / Water
  MB_NORMAL,
  MB_TALL_GRASS,
  MB_LONG_GRASS,
  MB_SHORT_GRASS,
  MB_LONG_GRASS_SOUTH_EDGE,
  MB_ASHGRASS,
  MB_SAND,
  MB_DEEP_SAND,
  MB_ICE,
  MB_THIN_ICE,
  MB_CRACKED_ICE,
  MB_HOT_SPRINGS,
  MB_PUDDLE,
  MB_SHALLOW_WATER,
  MB_POND_WATER,
  MB_OCEAN_WATER,
  MB_DEEP_WATER,
  MB_INTERIOR_DEEP_WATER,
  MB_SOOTOPOLIS_DEEP_WATER,
  MB_WATERFALL,
  MB_REFLECTION_UNDER_BRIDGE,
  // Jumps / Slides / Walks / Currents
  MB_JUMP_EAST,
  MB_JUMP_WEST,
  MB_JUMP_NORTH,
  MB_JUMP_SOUTH,
  MB_WALK_EAST,
  MB_WALK_WEST,
  MB_WALK_NORTH,
  MB_WALK_SOUTH,
  MB_SLIDE_EAST,
  MB_SLIDE_WEST,
  MB_SLIDE_NORTH,
  MB_SLIDE_SOUTH,
  MB_EASTWARD_CURRENT,
  MB_WESTWARD_CURRENT,
  MB_NORTHWARD_CURRENT,
  MB_SOUTHWARD_CURRENT,
  MB_TRICK_HOUSE_PUZZLE_8_FLOOR,
  // Blockers
  MB_IMPASSABLE_EAST,
  MB_IMPASSABLE_WEST,
  MB_IMPASSABLE_NORTH,
  MB_IMPASSABLE_SOUTH,
  MB_IMPASSABLE_NORTHEAST,
  MB_IMPASSABLE_NORTHWEST,
  MB_IMPASSABLE_SOUTHEAST,
  MB_IMPASSABLE_SOUTHWEST,
  MB_IMPASSABLE_SOUTH_AND_NORTH,
  MB_IMPASSABLE_WEST_AND_EAST,
  // Bridges / Pacifidlog / Fortree
  MB_BRIDGE_OVER_POND_LOW,
  MB_BRIDGE_OVER_POND_MED,
  MB_BRIDGE_OVER_POND_HIGH,
  MB_BRIDGE_OVER_POND_MED_EDGE_1,
  MB_BRIDGE_OVER_POND_MED_EDGE_2,
  MB_BRIDGE_OVER_POND_HIGH_EDGE_1,
  MB_BRIDGE_OVER_POND_HIGH_EDGE_2,
  MB_PACIFIDLOG_VERTICAL_LOG_TOP,
  MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM,
  MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT,
  MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT,
  MB_FORTREE_BRIDGE,
  MB_BIKE_BRIDGE_OVER_BARRIER,
  // Slopes / Rails / Mountain
  MB_MUDDY_SLOPE,
  MB_BUMPY_SLOPE,
  MB_ISOLATED_VERTICAL_RAIL,
  MB_ISOLATED_HORIZONTAL_RAIL,
  MB_VERTICAL_RAIL,
  MB_HORIZONTAL_RAIL,
  MB_MOUNTAIN_TOP,
  MB_NO_RUNNING,
  MB_NO_SURFACING,
  MB_FOOTPRINTS,
  // Encounter types
  MB_CAVE,
  MB_INDOOR_ENCOUNTER,
  MB_SEAWEED,
  MB_SEAWEED_NO_SURFACING,
  // Interaction tiles
  MB_TELEVISION as MB_TV,
  MB_PC,
  MB_PICTURE_BOOK_SHELF,
  MB_BOOKSHELF,
  MB_POKEMON_CENTER_BOOKSHELF,
  MB_VASE,
  MB_TRASH_CAN,
  MB_SHOP_SHELF,
  MB_BLUEPRINT,
  MB_QUESTIONNAIRE,
  MB_TRAINER_HILL_TIMER,
  MB_COUNTER,
  MB_RUNNING_SHOES_INSTRUCTION,
  MB_REGION_MAP,
  MB_POKEBLOCK_FEEDER,
  MB_PLAYER_ROOM_PC_ON,
  MB_CABLE_BOX_RESULTS_1,
  MB_CABLE_BOX_RESULTS_2,
  MB_WIRELESS_BOX_RESULTS,
  MB_CLOSED_SOOTOPOLIS_DOOR,
  MB_SKY_PILLAR_CLOSED_DOOR,
  MB_TRICK_HOUSE_PUZZLE_DOOR,
} from './decomp-bridge';

// Secret base spot constants — re-exported depuis decomp-bridge si présentes.
// 1:1 décomp `MetatileBehavior_IsOpenSecretBaseDoor` (metatile_behavior.c:507).
// Couvre 7 secret base spot "open" variants. Si certains MB n'existent pas dans
// notre decomp-bridge.ts, le check sera `false` constant → safe (= jeu ne croise
// jamais ces tiles hors secret base content qui n'est pas dans démo).
import * as MBC from './decomp-bridge';

// ─── Door behaviors ─────────────────────────────────────────────────────────

/** 1:1 décomp `MetatileBehavior_IsWarpDoor` (metatile_behavior.c:220-226).
 *  Seul `MB_ANIMATED_DOOR` est "warp door" (= door avec anim ouvert/fermé).
 *  Used par `TryDoorWarp` (= push UP sur door) pour distinguer du non_anim. */
export function MetatileBehavior_IsWarpDoor(metatileBehavior: number): boolean {
  return metatileBehavior === MB_ANIMATED_DOOR;
}

/** 1:1 décomp `MetatileBehavior_IsDoor` (metatile_behavior.c:228-235).
 *  Inclut `MB_PETALBURG_GYM_DOOR` (= door spéciale Petalburg gym) + `MB_ANIMATED_DOOR`.
 *  Used par `SetUpWarpExitTask` pour décider si l'exit task est `Task_ExitDoor`. */
export function MetatileBehavior_IsDoor(metatileBehavior: number): boolean {
  return metatileBehavior === MB_PETALBURG_GYM_DOOR
      || metatileBehavior === MB_ANIMATED_DOOR;
}

/** 1:1 décomp `MetatileBehavior_IsNonAnimDoor` (metatile_behavior.c:262-269).
 *  Inclut 3 metatiles : `MB_NON_ANIMATED_DOOR`, `MB_WATER_DOOR`, `MB_DEEP_SOUTH_WARP`.
 *  Used par `SetUpWarpExitTask` → `Task_ExitNonAnimDoor` (= juste walk-down sans
 *  anim porte). */
export function MetatileBehavior_IsNonAnimDoor(metatileBehavior: number): boolean {
  return metatileBehavior === MB_NON_ANIMATED_DOOR
      || metatileBehavior === MB_WATER_DOOR
      || metatileBehavior === MB_DEEP_SOUTH_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsDeepSouthWarp` (metatile_behavior.c:272-278).
 *  Spécifique au warp "deep south" (= player vient du sud, donc facing post-warp
 *  = DIR_NORTH). Used par `GetAdjustedInitialDirection`. */
export function MetatileBehavior_IsDeepSouthWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_DEEP_SOUTH_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsLadder` (metatile_behavior.c:254-260).
 *  Used par `IsWarpMetatileBehavior` + `GetAdjustedInitialDirection` (= preserve
 *  facing après ladder warp). */
export function MetatileBehavior_IsLadder(metatileBehavior: number): boolean {
  return metatileBehavior === MB_LADDER;
}

/** 1:1 décomp `MetatileBehavior_IsEscalator` (metatile_behavior.c:237-244).
 *  Inclut UP + DOWN escalator. Used par `IsWarpMetatileBehavior`. */
export function MetatileBehavior_IsEscalator(metatileBehavior: number): boolean {
  return metatileBehavior === MB_UP_ESCALATOR
      || metatileBehavior === MB_DOWN_ESCALATOR;
}

// ─── Arrow warp behaviors ───────────────────────────────────────────────────

/** 1:1 décomp `MetatileBehavior_IsEastArrowWarp` (metatile_behavior.c:288-294). */
export function MetatileBehavior_IsEastArrowWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_EAST_ARROW_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsWestArrowWarp` (metatile_behavior.c:296-302). */
export function MetatileBehavior_IsWestArrowWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_WEST_ARROW_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsNorthArrowWarp` (metatile_behavior.c:304-311).
 *  Inclut `MB_STAIRS_OUTSIDE_ABANDONED_SHIP` (= stairs externes Abandoned Ship
 *  agissent comme north arrow warp). */
export function MetatileBehavior_IsNorthArrowWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_NORTH_ARROW_WARP
      || metatileBehavior === MB_STAIRS_OUTSIDE_ABANDONED_SHIP;
}

/** 1:1 décomp `MetatileBehavior_IsSouthArrowWarp` (metatile_behavior.c:313-320).
 *  Inclut `MB_WATER_SOUTH_ARROW_WARP` (= water south, e.g. Shoal Cave entry water)
 *  et `MB_SHOAL_CAVE_ENTRANCE`. */
export function MetatileBehavior_IsSouthArrowWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_SOUTH_ARROW_WARP
      || metatileBehavior === MB_WATER_SOUTH_ARROW_WARP
      || metatileBehavior === MB_SHOAL_CAVE_ENTRANCE;
}

// ─── Forced movement warps (= warps qui run un script ou anim spéciale) ────

/** 1:1 décomp `MetatileBehavior_IsLavaridgeB1FWarp` (metatile_behavior.c:1118-1124).
 *  Lavaridge Gym B1F warp = pop le player vers F1 via une "fire warp" anim
 *  spéciale. Used par `TryStartWarpEventScript` → `DoLavaridgeGymB1FWarp`. */
export function MetatileBehavior_IsLavaridgeB1FWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_LAVARIDGE_GYM_B1F_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsLavaridge1FWarp` (metatile_behavior.c:1126-1132).
 *  Lavaridge Gym 1F warp = drop le player vers B1F via "hole fall" anim.
 *  Used par `TryStartWarpEventScript` → `DoLavaridgeGym1FWarp`. */
export function MetatileBehavior_IsLavaridge1FWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_LAVARIDGE_GYM_1F_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsAquaHideoutWarp` (metatile_behavior.c:1134-1140).
 *  Aqua Hideout teleporter tile (= spin warp). Used par
 *  `TryStartWarpEventScript` → `DoTeleportTileWarp`. */
export function MetatileBehavior_IsAquaHideoutWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_AQUA_HIDEOUT_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsUnionRoomWarp` (metatile_behavior.c:1142-1151).
 *  ⚠️ Note décomp originale : "This metatile behavior is re-used for some reason
 *  by the Union Room exit metatile." Donc le check est sur `MB_BRIDGE_OVER_OCEAN`
 *  (= reused). Used par `TryStartWarpEventScript` → `DoSpinExitWarp`. */
export function MetatileBehavior_IsUnionRoomWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_BRIDGE_OVER_OCEAN;
}

/** 1:1 décomp `MetatileBehavior_IsMossdeepGymWarp` (metatile_behavior.c:1153-1159).
 *  Mossdeep Gym warp = spin warp custom. Used par `TryStartWarpEventScript`
 *  + `TryArrowWarp` → `DoMossdeepGymWarp`. */
export function MetatileBehavior_IsMossdeepGymWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_MOSSDEEP_GYM_WARP;
}

/** 1:1 décomp `MetatileBehavior_IsMtPyreHole` (metatile_behavior.c:1178-1184).
 *  Mt Pyre hole tile = setup script `EventScript_FallDownHoleMtPyre`. Used par
 *  `TryStartWarpEventScript` → run script direct (PAS de DoWarp). */
export function MetatileBehavior_IsMtPyreHole(metatileBehavior: number): boolean {
  return metatileBehavior === MB_MT_PYRE_HOLE;
}

/** 1:1 décomp `MetatileBehavior_IsCrackedFloorHole` (metatile_behavior.c:1186-1192).
 *  Cracked floor hole tile = post-cracked-floor fall warp. Used par player
 *  collision logic (= player marche sur cracked floor, devient cracked floor
 *  hole, player tombe via fall warp à proximité). */
export function MetatileBehavior_IsCrackedFloorHole(metatileBehavior: number): boolean {
  return metatileBehavior === MB_CRACKED_FLOOR_HOLE;
}

/** 1:1 décomp `MetatileBehavior_IsCrackedFloor` (metatile_behavior.c:1194-1200).
 *  Cracked floor tile (= player ROM step → tile devient `MB_CRACKED_FLOOR_HOLE`
 *  next step). Used par player step logic. */
export function MetatileBehavior_IsCrackedFloor(metatileBehavior: number): boolean {
  return metatileBehavior === MB_CRACKED_FLOOR;
}

/** 1:1 décomp `MetatileBehavior_IsBattlePyramidWarp` (metatile_behavior.c:1344-1350).
 *  Battle Pyramid warp (= floor-up dans pyramid). Used par scripts pyramid. */
export function MetatileBehavior_IsBattlePyramidWarp(metatileBehavior: number): boolean {
  return metatileBehavior === MB_BATTLE_PYRAMID_WARP;
}

// ─── Secret base behaviors (= scope minimal pour warp dispatch) ─────────────

/** 1:1 décomp `MetatileBehavior_IsOpenSecretBaseDoor` (metatile_behavior.c:507-518).
 *  Inclut 7 secret base spot "open" variants (red/brown/yellow/blue cave + tree
 *  left/right + shrub). Used par `TryDoorWarp` (= push NORTH sur secret base
 *  ouvert → `WarpIntoSecretBase`).
 *
 *  Dépendance : nécessite les constantes `MB_SECRET_BASE_SPOT_*_OPEN` côté
 *  decomp-bridge. Si absentes (= secret bases hors scope démo), helper retourne
 *  toujours `false` (= safe fallback). */
export function MetatileBehavior_IsOpenSecretBaseDoor(metatileBehavior: number): boolean {
  return metatileBehavior === ((MBC as unknown as Record<string, number>).MB_SECRET_BASE_SPOT_RED_CAVE_OPEN ?? -1)
      || metatileBehavior === ((MBC as unknown as Record<string, number>).MB_SECRET_BASE_SPOT_BROWN_CAVE_OPEN ?? -1)
      || metatileBehavior === ((MBC as unknown as Record<string, number>).MB_SECRET_BASE_SPOT_YELLOW_CAVE_OPEN ?? -1)
      || metatileBehavior === ((MBC as unknown as Record<string, number>).MB_SECRET_BASE_SPOT_TREE_LEFT_OPEN ?? -1)
      || metatileBehavior === ((MBC as unknown as Record<string, number>).MB_SECRET_BASE_SPOT_SHRUB_OPEN ?? -1)
      || metatileBehavior === ((MBC as unknown as Record<string, number>).MB_SECRET_BASE_SPOT_BLUE_CAVE_OPEN ?? -1)
      || metatileBehavior === ((MBC as unknown as Record<string, number>).MB_SECRET_BASE_SPOT_TREE_RIGHT_OPEN ?? -1);
}

// ─── Dispatchers (= field_control_avatar.c:751 + 767) ──────────────────────

/** 1:1 décomp `IsWarpMetatileBehavior` (field_control_avatar.c:751-765).
 *
 *  Body décomp :
 *  ```c
 *  static bool8 IsWarpMetatileBehavior(u16 metatileBehavior) {
 *      if (MetatileBehavior_IsWarpDoor(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsLadder(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsEscalator(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsNonAnimDoor(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsLavaridgeB1FWarp(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsLavaridge1FWarp(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsAquaHideoutWarp(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsMtPyreHole(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsMossdeepGymWarp(metatileBehavior) != TRUE
 *       && MetatileBehavior_IsUnionRoomWarp(metatileBehavior) != TRUE)
 *          return FALSE;
 *      return TRUE;
 *  }
 *  ```
 *  Used par `TryStartWarpEventScript` + `TryDoorWarp` pour gate l'execution
 *  d'un warp. */
export function IsWarpMetatileBehavior(metatileBehavior: number): boolean {
  return MetatileBehavior_IsWarpDoor(metatileBehavior)
      || MetatileBehavior_IsLadder(metatileBehavior)
      || MetatileBehavior_IsEscalator(metatileBehavior)
      || MetatileBehavior_IsNonAnimDoor(metatileBehavior)
      || MetatileBehavior_IsLavaridgeB1FWarp(metatileBehavior)
      || MetatileBehavior_IsLavaridge1FWarp(metatileBehavior)
      || MetatileBehavior_IsAquaHideoutWarp(metatileBehavior)
      || MetatileBehavior_IsMtPyreHole(metatileBehavior)
      || MetatileBehavior_IsMossdeepGymWarp(metatileBehavior)
      || MetatileBehavior_IsUnionRoomWarp(metatileBehavior);
}

/** 1:1 décomp `IsArrowWarpMetatileBehavior` (field_control_avatar.c:767-781).
 *
 *  Body décomp :
 *  ```c
 *  static bool8 IsArrowWarpMetatileBehavior(u16 metatileBehavior, u8 direction) {
 *      switch (direction) {
 *      case DIR_NORTH: return MetatileBehavior_IsNorthArrowWarp(metatileBehavior);
 *      case DIR_SOUTH: return MetatileBehavior_IsSouthArrowWarp(metatileBehavior);
 *      case DIR_WEST:  return MetatileBehavior_IsWestArrowWarp(metatileBehavior);
 *      case DIR_EAST:  return MetatileBehavior_IsEastArrowWarp(metatileBehavior);
 *      }
 *      return FALSE;
 *  }
 *  ```
 *  Used par `TryArrowWarp` (= player on arrow tile + held direction match). */
export function IsArrowWarpMetatileBehavior(
  metatileBehavior: number, direction: number,
): boolean {
  // 1:1 décomp : DIR_NORTH=2, DIR_SOUTH=1, DIR_WEST=3, DIR_EAST=4. Cf.
  // global.fieldmap.h enum `Direction` (= shared via direction-coords.ts).
  switch (direction) {
    case 2 /* DIR_NORTH */: return MetatileBehavior_IsNorthArrowWarp(metatileBehavior);
    case 1 /* DIR_SOUTH */: return MetatileBehavior_IsSouthArrowWarp(metatileBehavior);
    case 3 /* DIR_WEST  */: return MetatileBehavior_IsWestArrowWarp(metatileBehavior);
    case 4 /* DIR_EAST  */: return MetatileBehavior_IsEastArrowWarp(metatileBehavior);
    default: return false;
  }
}

// ─── sTileBitAttributes table 1:1 décomp (metatile_behavior.c:9-128) ────────

/** 1:1 décomp `TILE_FLAG_HAS_ENCOUNTERS` (metatile_behavior.c:5). */
export const TILE_FLAG_HAS_ENCOUNTERS = 1 << 0;
/** 1:1 décomp `TILE_FLAG_SURFABLE` (metatile_behavior.c:6). */
export const TILE_FLAG_SURFABLE = 1 << 1;
/** 1:1 décomp `TILE_FLAG_UNUSED` (metatile_behavior.c:7).
 *  "Roughly all of the traversable metatiles. Set but never read" — décomp note. */
export const TILE_FLAG_UNUSED = 1 << 2;

/** 1:1 décomp `sTileBitAttributes[NUM_METATILE_BEHAVIORS]` (metatile_behavior.c:9-128).
 *
 *  Table 128 entries u8 où chaque MB est tagué avec ses bit flags
 *  (HAS_ENCOUNTERS | SURFABLE | UNUSED). Used par :
 *    - `MetatileBehavior_IsEncounterTile` (= bit 0)
 *    - `MetatileBehavior_IsSurfableWaterOrUnderwater` (= bit 1)
 *
 *  Sparse-init au 1:1 : array de 128 entries indexées par MB const value.
 *  Default = 0 si MB absent (= comportement "no flags").
 */
export const sTileBitAttributes: Uint8Array = (() => {
  const t = new Uint8Array(256);  // 256 pour safety (= NUM_METATILE_BEHAVIORS = 256 dans em)
  const U = TILE_FLAG_UNUSED;
  const E = TILE_FLAG_HAS_ENCOUNTERS;
  const S = TILE_FLAG_SURFABLE;
  // 1:1 décomp ordering (= metatile_behavior.c:11-127).
  t[MB_NORMAL]                        = U;
  t[MB_TALL_GRASS]                    = U | E;
  t[MB_LONG_GRASS]                    = U | E;
  // MB_UNUSED_05 = 0x05 (= ENCOUNTERS only, pas dans bridge donc inline).
  t[0x05]                             = E;
  t[MB_DEEP_SAND]                     = U | E;
  t[MB_SHORT_GRASS]                   = U;
  t[MB_CAVE]                          = U | E;
  t[MB_LONG_GRASS_SOUTH_EDGE]         = U;
  t[MB_NO_RUNNING]                    = U;
  t[MB_INDOOR_ENCOUNTER]              = U | E;
  t[MB_MOUNTAIN_TOP]                  = U;
  t[MB_BATTLE_PYRAMID_WARP]           = U;
  t[MB_MOSSDEEP_GYM_WARP]             = U;
  t[MB_MT_PYRE_HOLE]                  = U;
  t[MB_POND_WATER]                    = U | S | E;
  t[MB_INTERIOR_DEEP_WATER]           = U | S | E;
  t[MB_DEEP_WATER]                    = U | S | E;
  t[MB_WATERFALL]                     = U | S;
  t[MB_SOOTOPOLIS_DEEP_WATER]         = U | S;
  t[MB_OCEAN_WATER]                   = U | S | E;
  t[MB_PUDDLE]                        = U;
  t[MB_SHALLOW_WATER]                 = U;
  t[MB_NO_SURFACING]                  = U | S;
  t[MB_STAIRS_OUTSIDE_ABANDONED_SHIP] = U;
  t[MB_SHOAL_CAVE_ENTRANCE]           = U;
  t[MB_ICE]                           = U;
  t[MB_SAND]                          = U;
  t[MB_SEAWEED]                       = U | S | E;
  // MB_UNUSED_23 = 0x23, inline.
  t[0x23]                             = U;
  t[MB_ASHGRASS]                      = U | E;
  t[MB_FOOTPRINTS]                    = U | E;
  t[MB_THIN_ICE]                      = U;
  t[MB_CRACKED_ICE]                   = U;
  t[MB_HOT_SPRINGS]                   = U;
  t[MB_LAVARIDGE_GYM_B1F_WARP]        = U;
  t[MB_SEAWEED_NO_SURFACING]          = U | S | E;
  t[MB_REFLECTION_UNDER_BRIDGE]       = U;
  t[MB_IMPASSABLE_EAST]               = U;
  t[MB_IMPASSABLE_WEST]               = U;
  t[MB_IMPASSABLE_NORTH]              = U;
  t[MB_IMPASSABLE_SOUTH]              = U;
  t[MB_IMPASSABLE_NORTHEAST]          = U;
  t[MB_IMPASSABLE_NORTHWEST]          = U;
  t[MB_IMPASSABLE_SOUTHEAST]          = U;
  t[MB_IMPASSABLE_SOUTHWEST]          = U;
  // MB_JUMP_NE/NW/SE/SW = 0x2E..0x31 (diagonal jumps non-cardinal), inline.
  t[0x2E]                             = U;  // MB_JUMP_NORTHEAST
  t[0x2F]                             = U;
  t[0x30]                             = U;
  t[0x31]                             = U;
  t[MB_WALK_EAST]                     = U;
  t[MB_WALK_WEST]                     = U;
  t[MB_WALK_NORTH]                    = U;
  t[MB_WALK_SOUTH]                    = U;
  t[MB_SLIDE_EAST]                    = U;
  t[MB_SLIDE_WEST]                    = U;
  t[MB_SLIDE_NORTH]                   = U;
  t[MB_SLIDE_SOUTH]                   = U;
  t[MB_TRICK_HOUSE_PUZZLE_8_FLOOR]    = U;
  t[MB_EASTWARD_CURRENT]              = U | S;
  t[MB_WESTWARD_CURRENT]              = U | S;
  t[MB_NORTHWARD_CURRENT]             = U | S;
  t[MB_SOUTHWARD_CURRENT]             = U | S;
  t[MB_NON_ANIMATED_DOOR]             = U;
  t[MB_LADDER]                        = U;
  t[MB_EAST_ARROW_WARP]               = U;
  t[MB_WEST_ARROW_WARP]               = U;
  t[MB_NORTH_ARROW_WARP]              = U;
  t[MB_SOUTH_ARROW_WARP]              = U;
  t[MB_CRACKED_FLOOR_HOLE]            = U;
  t[MB_AQUA_HIDEOUT_WARP]             = U;
  t[MB_LAVARIDGE_GYM_1F_WARP]         = U;
  t[MB_ANIMATED_DOOR]                 = U;
  t[MB_UP_ESCALATOR]                  = U;
  t[MB_DOWN_ESCALATOR]                = U;
  t[MB_WATER_DOOR]                    = U | S;
  t[MB_WATER_SOUTH_ARROW_WARP]        = U | S;
  t[MB_DEEP_SOUTH_WARP]               = U;
  // MB_UNUSED_6F = 0x6F (surfable but unused), inline.
  t[0x6F]                             = U | S;
  t[MB_BRIDGE_OVER_POND_LOW]          = U;
  t[MB_BRIDGE_OVER_POND_MED]          = U;
  t[MB_BRIDGE_OVER_POND_HIGH]         = U;
  t[MB_PACIFIDLOG_VERTICAL_LOG_TOP]   = U;
  t[MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM]= U;
  t[MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT]= U;
  t[MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT]= U;
  t[MB_FORTREE_BRIDGE]                = U;
  t[MB_BRIDGE_OVER_POND_MED_EDGE_1]   = U;
  t[MB_BRIDGE_OVER_POND_MED_EDGE_2]   = U;
  t[MB_BRIDGE_OVER_POND_HIGH_EDGE_1]  = U;
  t[MB_BRIDGE_OVER_POND_HIGH_EDGE_2]  = U;
  // MB_UNUSED_BRIDGE = 0x7D, inline.
  t[0x7D]                             = U;
  t[MB_BIKE_BRIDGE_OVER_BARRIER]      = U;
  t[MB_PLAYER_ROOM_PC_ON]             = U;
  t[MB_MUDDY_SLOPE]                   = U;
  t[MB_BUMPY_SLOPE]                   = U;
  t[MB_CRACKED_FLOOR]                 = U;
  t[MB_ISOLATED_VERTICAL_RAIL]        = U;
  t[MB_ISOLATED_HORIZONTAL_RAIL]      = U;
  t[MB_VERTICAL_RAIL]                 = U;
  t[MB_HORIZONTAL_RAIL]               = U;
  t[MB_IMPASSABLE_SOUTH_AND_NORTH]    = U;
  t[MB_IMPASSABLE_WEST_AND_EAST]      = U;
  return t;
})();

// ─── MetatileBehavior_Is* helpers 1:1 décomp (= reste de metatile_behavior.c) ──

/** 1:1 décomp `MetatileBehavior_IsATile` (metatile_behavior.c:130-133).
 *  Décomp : `return TRUE;` (= tile générique, jamais "non-tile"). */
export function MetatileBehavior_IsATile(_metatileBehavior: number): boolean {
  return true;
}

/** 1:1 décomp `MetatileBehavior_IsEncounterTile` (metatile_behavior.c:135-141). */
export function MetatileBehavior_IsEncounterTile(metatileBehavior: number): boolean {
  return (sTileBitAttributes[metatileBehavior] & TILE_FLAG_HAS_ENCOUNTERS) !== 0;
}

/** 1:1 décomp `MetatileBehavior_IsSurfableWaterOrUnderwater` (metatile_behavior.c:280-286). */
export function MetatileBehavior_IsSurfableWaterOrUnderwater(metatileBehavior: number): boolean {
  return (sTileBitAttributes[metatileBehavior] & TILE_FLAG_SURFABLE) !== 0;
}

// Jump tiles (= ledges, hop avec animation).
export function MetatileBehavior_IsJumpEast(mb: number): boolean { return mb === MB_JUMP_EAST; }
export function MetatileBehavior_IsJumpWest(mb: number): boolean { return mb === MB_JUMP_WEST; }
export function MetatileBehavior_IsJumpNorth(mb: number): boolean { return mb === MB_JUMP_NORTH; }
export function MetatileBehavior_IsJumpSouth(mb: number): boolean { return mb === MB_JUMP_SOUTH; }

// Grass tiles.
export function MetatileBehavior_IsPokeGrass(mb: number): boolean {
  return mb === MB_TALL_GRASS || mb === MB_LONG_GRASS;
}
export function MetatileBehavior_IsTallGrass(mb: number): boolean {
  return mb === MB_TALL_GRASS;
}
export function MetatileBehavior_IsLongGrass(mb: number): boolean {
  return mb === MB_LONG_GRASS;
}
export function MetatileBehavior_IsAshGrass(mb: number): boolean {
  return mb === MB_ASHGRASS;
}
export function MetatileBehavior_IsShortGrass(mb: number): boolean {
  return mb === MB_SHORT_GRASS;
}
export function MetatileBehavior_IsLongGrassSouthEdge(mb: number): boolean {
  return mb === MB_LONG_GRASS_SOUTH_EDGE;
}

// Sand tiles.
export function MetatileBehavior_IsSandOrDeepSand(mb: number): boolean {
  return mb === MB_SAND || mb === MB_DEEP_SAND;
}
export function MetatileBehavior_IsDeepSand(mb: number): boolean {
  return mb === MB_DEEP_SAND;
}

// Ice tiles.
export function MetatileBehavior_IsIce(mb: number): boolean { return mb === MB_ICE; }
export function MetatileBehavior_IsThinIce(mb: number): boolean { return mb === MB_THIN_ICE; }
export function MetatileBehavior_IsCrackedIce(mb: number): boolean { return mb === MB_CRACKED_ICE; }
/** 1:1 décomp `MetatileBehavior_IsIce_2` (metatile_behavior.c:353-359).
 *  Note décomp : c'est un duplicate de IsIce (= probable copy-paste bug ROM). */
export function MetatileBehavior_IsIce_2(mb: number): boolean { return mb === MB_ICE; }

// Water tiles.
export function MetatileBehavior_IsReflective(mb: number): boolean {
  return mb === MB_POND_WATER
      || mb === MB_PUDDLE
      || mb === MB_ICE
      || mb === MB_SOOTOPOLIS_DEEP_WATER
      || mb === MB_REFLECTION_UNDER_BRIDGE;
}
export function MetatileBehavior_IsPuddle(mb: number): boolean { return mb === MB_PUDDLE; }
export function MetatileBehavior_IsShallowFlowingWater(mb: number): boolean {
  return mb === MB_SHALLOW_WATER
      || mb === MB_NO_SURFACING
      || mb === MB_STAIRS_OUTSIDE_ABANDONED_SHIP;
}
export function MetatileBehavior_IsWaterfall(mb: number): boolean { return mb === MB_WATERFALL; }
export function MetatileBehavior_IsHotSprings(mb: number): boolean { return mb === MB_HOT_SPRINGS; }
export function MetatileBehavior_IsDeepOrOceanWater(mb: number): boolean {
  return mb === MB_DEEP_WATER
      || mb === MB_OCEAN_WATER
      || mb === MB_INTERIOR_DEEP_WATER;
}
export function MetatileBehavior_IsSurfableAndNotWaterfall(mb: number): boolean {
  return MetatileBehavior_IsSurfableWaterOrUnderwater(mb) && mb !== MB_WATERFALL;
}
export function MetatileBehavior_IsDiveable(mb: number): boolean {
  return mb === MB_DEEP_WATER
      || mb === MB_SOOTOPOLIS_DEEP_WATER
      || mb === MB_INTERIOR_DEEP_WATER;
}
export function MetatileBehavior_IsUnableToEmerge(mb: number): boolean {
  return mb === MB_NO_SURFACING
      || mb === MB_SEAWEED_NO_SURFACING;
}
export function MetatileBehavior_IsSeaweed(mb: number): boolean {
  return mb === MB_SEAWEED || mb === MB_SEAWEED_NO_SURFACING;
}

// Forced movement / slide tiles.
export function MetatileBehavior_IsWalkNorth(mb: number): boolean { return mb === MB_WALK_NORTH; }
export function MetatileBehavior_IsWalkSouth(mb: number): boolean { return mb === MB_WALK_SOUTH; }
export function MetatileBehavior_IsWalkWest(mb: number): boolean { return mb === MB_WALK_WEST; }
export function MetatileBehavior_IsWalkEast(mb: number): boolean { return mb === MB_WALK_EAST; }
export function MetatileBehavior_IsSlideNorth(mb: number): boolean { return mb === MB_SLIDE_NORTH; }
export function MetatileBehavior_IsSlideSouth(mb: number): boolean { return mb === MB_SLIDE_SOUTH; }
export function MetatileBehavior_IsSlideWest(mb: number): boolean { return mb === MB_SLIDE_WEST; }
export function MetatileBehavior_IsSlideEast(mb: number): boolean { return mb === MB_SLIDE_EAST; }
export function MetatileBehavior_IsNorthwardCurrent(mb: number): boolean { return mb === MB_NORTHWARD_CURRENT; }
export function MetatileBehavior_IsSouthwardCurrent(mb: number): boolean { return mb === MB_SOUTHWARD_CURRENT; }
export function MetatileBehavior_IsWestwardCurrent(mb: number): boolean { return mb === MB_WESTWARD_CURRENT; }
export function MetatileBehavior_IsEastwardCurrent(mb: number): boolean { return mb === MB_EASTWARD_CURRENT; }
export function MetatileBehavior_IsTrickHouseSlipperyFloor(mb: number): boolean {
  return mb === MB_TRICK_HOUSE_PUZZLE_8_FLOOR;
}
/** 1:1 décomp `MetatileBehavior_IsForcedMovementTile` (metatile_behavior.c:338-351).
 *  Dispatch toutes les forced movement tiles (= walk/slide/current). */
export function MetatileBehavior_IsForcedMovementTile(mb: number): boolean {
  return MetatileBehavior_IsIce(mb)
      || MetatileBehavior_IsTrickHouseSlipperyFloor(mb)
      || MetatileBehavior_IsWalkNorth(mb)
      || MetatileBehavior_IsWalkSouth(mb)
      || MetatileBehavior_IsWalkWest(mb)
      || MetatileBehavior_IsWalkEast(mb)
      || MetatileBehavior_IsSlideNorth(mb)
      || MetatileBehavior_IsSlideSouth(mb)
      || MetatileBehavior_IsSlideWest(mb)
      || MetatileBehavior_IsSlideEast(mb)
      || MetatileBehavior_IsNorthwardCurrent(mb)
      || MetatileBehavior_IsSouthwardCurrent(mb)
      || MetatileBehavior_IsWestwardCurrent(mb)
      || MetatileBehavior_IsEastwardCurrent(mb)
      || MetatileBehavior_IsWaterfall(mb)
      || MetatileBehavior_IsMuddySlope(mb);
}

// Blocked direction tiles.
export function MetatileBehavior_IsEastBlocked(mb: number): boolean {
  return mb === MB_IMPASSABLE_EAST
      || mb === MB_IMPASSABLE_NORTHEAST
      || mb === MB_IMPASSABLE_SOUTHEAST
      || mb === MB_IMPASSABLE_WEST_AND_EAST;
}
export function MetatileBehavior_IsWestBlocked(mb: number): boolean {
  return mb === MB_IMPASSABLE_WEST
      || mb === MB_IMPASSABLE_NORTHWEST
      || mb === MB_IMPASSABLE_SOUTHWEST
      || mb === MB_IMPASSABLE_WEST_AND_EAST;
}
export function MetatileBehavior_IsNorthBlocked(mb: number): boolean {
  return mb === MB_IMPASSABLE_NORTH
      || mb === MB_IMPASSABLE_NORTHEAST
      || mb === MB_IMPASSABLE_NORTHWEST
      || mb === MB_IMPASSABLE_SOUTH_AND_NORTH;
}
export function MetatileBehavior_IsSouthBlocked(mb: number): boolean {
  return mb === MB_IMPASSABLE_SOUTH
      || mb === MB_IMPASSABLE_SOUTHEAST
      || mb === MB_IMPASSABLE_SOUTHWEST
      || mb === MB_IMPASSABLE_SOUTH_AND_NORTH;
}

// Slope tiles.
export function MetatileBehavior_IsMuddySlope(mb: number): boolean { return mb === MB_MUDDY_SLOPE; }
export function MetatileBehavior_IsBumpySlope(mb: number): boolean { return mb === MB_BUMPY_SLOPE; }

// Rail tiles (= Mauville/Pacifidlog).
export function MetatileBehavior_IsIsolatedVerticalRail(mb: number): boolean {
  return mb === MB_ISOLATED_VERTICAL_RAIL;
}
export function MetatileBehavior_IsIsolatedHorizontalRail(mb: number): boolean {
  return mb === MB_ISOLATED_HORIZONTAL_RAIL;
}
export function MetatileBehavior_IsVerticalRail(mb: number): boolean {
  return mb === MB_VERTICAL_RAIL;
}
export function MetatileBehavior_IsHorizontalRail(mb: number): boolean {
  return mb === MB_HORIZONTAL_RAIL;
}

// Bridge tiles.
export function MetatileBehavior_IsBridgeOverWater(mb: number): boolean {
  return mb === MB_BRIDGE_OVER_POND_LOW
      || mb === MB_BRIDGE_OVER_POND_MED
      || mb === MB_BRIDGE_OVER_POND_HIGH
      || mb === MB_BRIDGE_OVER_POND_MED_EDGE_1
      || mb === MB_BRIDGE_OVER_POND_MED_EDGE_2
      || mb === MB_BRIDGE_OVER_POND_HIGH_EDGE_1
      || mb === MB_BRIDGE_OVER_POND_HIGH_EDGE_2
      || mb === MB_BRIDGE_OVER_OCEAN;
}
export function MetatileBehavior_IsBridgeOverWaterNoEdge(mb: number): boolean {
  return mb === MB_BRIDGE_OVER_POND_LOW
      || mb === MB_BRIDGE_OVER_POND_MED
      || mb === MB_BRIDGE_OVER_POND_HIGH;
}
export function MetatileBehavior_IsFortreeBridge(mb: number): boolean {
  return mb === MB_FORTREE_BRIDGE;
}

// Pacifidlog log tiles.
export function MetatileBehavior_IsPacifidlogVerticalLogTop(mb: number): boolean {
  return mb === MB_PACIFIDLOG_VERTICAL_LOG_TOP;
}
export function MetatileBehavior_IsPacifidlogVerticalLogBottom(mb: number): boolean {
  return mb === MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM;
}
export function MetatileBehavior_IsPacifidlogHorizontalLogLeft(mb: number): boolean {
  return mb === MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT;
}
export function MetatileBehavior_IsPacifidlogHorizontalLogRight(mb: number): boolean {
  return mb === MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT;
}
export function MetatileBehavior_IsPacifidlogLog(mb: number): boolean {
  return MetatileBehavior_IsPacifidlogVerticalLogTop(mb)
      || MetatileBehavior_IsPacifidlogVerticalLogBottom(mb)
      || MetatileBehavior_IsPacifidlogHorizontalLogLeft(mb)
      || MetatileBehavior_IsPacifidlogHorizontalLogRight(mb);
}

// Misc terrain.
export function MetatileBehavior_IsMountain(mb: number): boolean {
  return mb === MB_MOUNTAIN_TOP;
}
export function MetatileBehavior_IsFootprints(mb: number): boolean {
  return mb === MB_FOOTPRINTS;
}
export function MetatileBehavior_IsRunningDisallowed(mb: number): boolean {
  return mb === MB_NO_RUNNING
      || mb === MB_LONG_GRASS
      || mb === MB_HOT_SPRINGS
      || MetatileBehavior_IsPacifidlogLog(mb);
}
export function MetatileBehavior_IsCuttableGrass(mb: number): boolean {
  return mb === MB_TALL_GRASS
      || mb === MB_LONG_GRASS
      || mb === MB_ASHGRASS
      || mb === MB_LONG_GRASS_SOUTH_EDGE;
}

// Encounter type queries.
export function MetatileBehavior_IsLandWildEncounter(mb: number): boolean {
  return MetatileBehavior_IsEncounterTile(mb)
      && !MetatileBehavior_IsSurfableWaterOrUnderwater(mb);
}
export function MetatileBehavior_IsWaterWildEncounter(mb: number): boolean {
  return MetatileBehavior_IsEncounterTile(mb)
      && MetatileBehavior_IsSurfableWaterOrUnderwater(mb);
}
export function MetatileBehavior_IsIndoorEncounter(mb: number): boolean {
  return mb === MB_INDOOR_ENCOUNTER;
}

// Interaction tiles (= A button targets).
export function MetatileBehavior_IsCounter(mb: number): boolean { return mb === MB_COUNTER; }
export function MetatileBehavior_IsPC(mb: number): boolean { return mb === MB_PC; }
export function MetatileBehavior_IsPlayerFacingTVScreen(mb: number, direction: number): boolean {
  // 1:1 décomp `MetatileBehavior_IsPlayerFacingTVScreen` (metatile_behavior.c:481-489).
  // Requires direction == DIR_NORTH (=2) AND tile = MB_TELEVISION.
  return direction === 2 && mb === MB_TV;
}
export function MetatileBehavior_IsPlayerRoomPCOn(mb: number): boolean {
  return mb === MB_PLAYER_ROOM_PC_ON;
}
export function MetatileBehavior_IsRunningShoesManual(mb: number): boolean {
  return mb === MB_RUNNING_SHOES_INSTRUCTION;
}
export function MetatileBehavior_IsPictureBookShelf(mb: number): boolean {
  return mb === MB_PICTURE_BOOK_SHELF;
}
export function MetatileBehavior_IsBookShelf(mb: number): boolean { return mb === MB_BOOKSHELF; }
export function MetatileBehavior_IsPokeCenterBookShelf(mb: number): boolean {
  return mb === MB_POKEMON_CENTER_BOOKSHELF;
}
export function MetatileBehavior_IsVase(mb: number): boolean { return mb === MB_VASE; }
export function MetatileBehavior_IsTrashCan(mb: number): boolean { return mb === MB_TRASH_CAN; }
export function MetatileBehavior_IsShopShelf(mb: number): boolean { return mb === MB_SHOP_SHELF; }
export function MetatileBehavior_IsBlueprint(mb: number): boolean { return mb === MB_BLUEPRINT; }
export function MetatileBehavior_IsQuestionnaire(mb: number): boolean { return mb === MB_QUESTIONNAIRE; }
export function MetatileBehavior_IsTrainerHillTimer(mb: number): boolean { return mb === MB_TRAINER_HILL_TIMER; }
export function MetatileBehavior_IsCableBoxResults1(mb: number): boolean { return mb === MB_CABLE_BOX_RESULTS_1; }
export function MetatileBehavior_IsCableBoxResults2(mb: number, direction: number): boolean {
  // 1:1 décomp `MetatileBehavior_IsCableBoxResults2` (metatile_behavior.c:1362-1370).
  // direction != DIR_EAST (=4) AND tile = MB_CABLE_BOX_RESULTS_2.
  return direction !== 4 && mb === MB_CABLE_BOX_RESULTS_2;
}
export function MetatileBehavior_IsPlayerFacingWirelessBoxResults(mb: number, direction: number): boolean {
  // 1:1 décomp `MetatileBehavior_IsPlayerFacingWirelessBoxResults` (metatile_behavior.c:1352-1360).
  // direction != DIR_EAST AND tile = MB_WIRELESS_BOX_RESULTS.
  return direction !== 4 && mb === MB_WIRELESS_BOX_RESULTS;
}
export function MetatileBehavior_IsRegionMap(mb: number): boolean { return mb === MB_REGION_MAP; }
export function MetatileBehavior_IsClosedSootopolisDoor(mb: number): boolean {
  return mb === MB_CLOSED_SOOTOPOLIS_DOOR;
}
export function MetatileBehavior_IsSkyPillarClosedDoor(mb: number): boolean {
  return mb === MB_SKY_PILLAR_CLOSED_DOOR;
}
export function MetatileBehavior_IsTrickHousePuzzleDoor(mb: number): boolean {
  return mb === MB_TRICK_HOUSE_PUZZLE_DOOR;
}
export function MetatileBehavior_IsPokeblockFeeder(mb: number): boolean {
  return mb === MB_POKEBLOCK_FEEDER;
}

// Normal tile (= no special behavior).
export function MetatileBehavior_IsNormal(mb: number): boolean { return mb === MB_NORMAL; }
