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
