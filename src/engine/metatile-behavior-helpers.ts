/**
 * metatile-behavior-helpers.ts — 1:1 décomp `src/metatile_behavior.c` +
 * `src/event_object_movement.c:IsMetatileDirectionallyImpassable`.
 *
 * Manage les checks "directionnels" sur les metatile_behaviors :
 *   - Impassable directionnel (= IsEastBlocked / IsWestBlocked / etc.)
 *   - Ledges (= IsJumpEast / IsJumpWest / etc.)
 *   - Combinaison : IsMetatileDirectionallyImpassable check les 2 côtés
 *     (current tile blocked exit + target tile blocked entry).
 *
 * Source de vérité décomp :
 *   - `metatile_behavior.c:143-173` (IsJump*)
 *   - `metatile_behavior.c:933-977` (IsBlocked*)
 *   - `event_object_movement.c:893-905` (gOpposite/DirectionBlockedMetatileFuncs)
 *   - `event_object_movement.c:4715-4722` (IsMetatileDirectionallyImpassable)
 *   - `field_player_avatar.c:727` (ShouldJumpLedge)
 */

import {
  MB_IMPASSABLE_EAST, MB_IMPASSABLE_WEST, MB_IMPASSABLE_NORTH, MB_IMPASSABLE_SOUTH,
  MB_IMPASSABLE_NORTHEAST, MB_IMPASSABLE_NORTHWEST,
  MB_IMPASSABLE_SOUTHEAST, MB_IMPASSABLE_SOUTHWEST,
  MB_IMPASSABLE_SOUTH_AND_NORTH, MB_IMPASSABLE_WEST_AND_EAST,
  MB_SECRET_BASE_BREAKABLE_DOOR,
  MB_JUMP_EAST, MB_JUMP_WEST, MB_JUMP_NORTH, MB_JUMP_SOUTH,
  MB_LONG_GRASS,
} from './tilemap-loader';
import { ENUM_MB_0 } from './decomp-data/include/constants/metatile_behaviors-data';
import { DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './direction-coords';
import { gMapHeader } from './map-loader';

// ─── Constants pour running checks (= 1:1 décomp metatile_behavior.c:1043+) ──
const MB_NO_RUNNING                       = ENUM_MB_0.MB_NO_RUNNING;
const MB_HOT_SPRINGS                      = ENUM_MB_0.MB_HOT_SPRINGS;
const MB_PACIFIDLOG_VERTICAL_LOG_TOP      = ENUM_MB_0.MB_PACIFIDLOG_VERTICAL_LOG_TOP;
const MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM   = ENUM_MB_0.MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM;
const MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT   = ENUM_MB_0.MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT;
const MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT  = ENUM_MB_0.MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT;

// ─── IsBlocked* — directional blocks (= 1:1 metatile_behavior.c:933+) ──────

/** 1:1 décomp `MetatileBehavior_IsEastBlocked` (metatile_behavior.c:933).
 *  Returns TRUE si ce tile bloque le passage VERS l'EST (= player on tile
 *  ne peut pas walk east). */
export function MetatileBehavior_IsEastBlocked(behavior: number): boolean {
  return behavior === MB_IMPASSABLE_EAST
      || behavior === MB_IMPASSABLE_NORTHEAST
      || behavior === MB_IMPASSABLE_SOUTHEAST
      || behavior === MB_IMPASSABLE_WEST_AND_EAST
      || behavior === MB_SECRET_BASE_BREAKABLE_DOOR;
}

/** 1:1 décomp `MetatileBehavior_IsWestBlocked` (metatile_behavior.c:945). */
export function MetatileBehavior_IsWestBlocked(behavior: number): boolean {
  return behavior === MB_IMPASSABLE_WEST
      || behavior === MB_IMPASSABLE_NORTHWEST
      || behavior === MB_IMPASSABLE_SOUTHWEST
      || behavior === MB_IMPASSABLE_WEST_AND_EAST
      || behavior === MB_SECRET_BASE_BREAKABLE_DOOR;
}

/** 1:1 décomp `MetatileBehavior_IsNorthBlocked` (metatile_behavior.c:957). */
export function MetatileBehavior_IsNorthBlocked(behavior: number): boolean {
  return behavior === MB_IMPASSABLE_NORTH
      || behavior === MB_IMPASSABLE_NORTHEAST
      || behavior === MB_IMPASSABLE_NORTHWEST
      || behavior === MB_IMPASSABLE_SOUTH_AND_NORTH;
}

/** 1:1 décomp `MetatileBehavior_IsSouthBlocked` (metatile_behavior.c:968). */
export function MetatileBehavior_IsSouthBlocked(behavior: number): boolean {
  return behavior === MB_IMPASSABLE_SOUTH
      || behavior === MB_IMPASSABLE_SOUTHEAST
      || behavior === MB_IMPASSABLE_SOUTHWEST
      || behavior === MB_IMPASSABLE_SOUTH_AND_NORTH;
}

// ─── IsJump* — ledges (= 1:1 metatile_behavior.c:143+) ─────────────────────

/** 1:1 décomp `MetatileBehavior_IsJumpEast` (metatile_behavior.c:143). */
export function MetatileBehavior_IsJumpEast(behavior: number): boolean {
  return behavior === MB_JUMP_EAST;
}

/** 1:1 décomp `MetatileBehavior_IsJumpWest` (metatile_behavior.c:151). */
export function MetatileBehavior_IsJumpWest(behavior: number): boolean {
  return behavior === MB_JUMP_WEST;
}

/** 1:1 décomp `MetatileBehavior_IsJumpNorth` (metatile_behavior.c:159). */
export function MetatileBehavior_IsJumpNorth(behavior: number): boolean {
  return behavior === MB_JUMP_NORTH;
}

/** 1:1 décomp `MetatileBehavior_IsJumpSouth` (metatile_behavior.c:167). */
export function MetatileBehavior_IsJumpSouth(behavior: number): boolean {
  return behavior === MB_JUMP_SOUTH;
}

// ─── Terrain predicates (= 1:1 décomp metatile_behavior.c) ────────────────────
//
// Ports inline from `decomp-data/auto/src-all/metatile_behavior-all-auto.ts`
// pour éviter circular imports (= bridge re-exports ces, mais le auto-file
// importe le bridge → cycle).

/** 1:1 décomp `MetatileBehavior_IsTallGrass`. */
export function MetatileBehavior_IsTallGrass(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_TALL_GRASS;
}
/** 1:1 décomp `MetatileBehavior_IsLongGrass`. */
export function MetatileBehavior_IsLongGrass(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_LONG_GRASS;
}
/** 1:1 décomp `MetatileBehavior_IsLongGrass_Duplicate` (metatile_behavior.c:1380).
 *  Doublon littéral de MetatileBehavior_IsLongGrass dans le décomp (= utilisé
 *  par FixLongGrassMetatilesWindowTop) — porté tel quel pour rester 1:1. */
export function MetatileBehavior_IsLongGrass_Duplicate(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_LONG_GRASS;
}
/** 1:1 décomp `MetatileBehavior_IsLongGrassSouthEdge` (metatile_behavior.c:1388). */
export function MetatileBehavior_IsLongGrassSouthEdge(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_LONG_GRASS_SOUTH_EDGE;
}
/** 1:1 décomp `MetatileBehavior_IsShortGrass`. */
export function MetatileBehavior_IsShortGrass(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_SHORT_GRASS;
}
/** 1:1 décomp `MetatileBehavior_IsHotSprings`. */
export function MetatileBehavior_IsHotSprings(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_HOT_SPRINGS;
}
/** 1:1 décomp `MetatileBehavior_IsIce`. */
export function MetatileBehavior_IsIce(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_ICE;
}
/** 1:1 décomp `MetatileBehavior_IsPuddle`. */
export function MetatileBehavior_IsPuddle(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_PUDDLE;
}
/** 1:1 décomp `MetatileBehavior_IsShallowFlowingWater`. */
export function MetatileBehavior_IsShallowFlowingWater(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_SHALLOW_WATER;
}
/** 1:1 décomp `MetatileBehavior_IsSandOrDeepSand`. */
export function MetatileBehavior_IsSandOrDeepSand(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_SAND || behavior === ENUM_MB_0.MB_DEEP_SAND;
}
/** 1:1 décomp `MetatileBehavior_IsDeepSand`. */
export function MetatileBehavior_IsDeepSand(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_DEEP_SAND;
}
/** 1:1 décomp `MetatileBehavior_IsSeaweed`. */
export function MetatileBehavior_IsSeaweed(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_SEAWEED;
}
/** 1:1 décomp `MetatileBehavior_IsReflective`. */
export function MetatileBehavior_IsReflective(behavior: number): boolean {
  return (
    behavior === ENUM_MB_0.MB_POND_WATER ||
    behavior === ENUM_MB_0.MB_PUDDLE ||
    behavior === ENUM_MB_0.MB_INTERIOR_DEEP_WATER ||
    behavior === ENUM_MB_0.MB_DEEP_WATER ||
    behavior === ENUM_MB_0.MB_SOOTOPOLIS_DEEP_WATER ||
    behavior === ENUM_MB_0.MB_OCEAN_WATER ||
    behavior === ENUM_MB_0.MB_SHALLOW_WATER
  );
}
/** 1:1 décomp `MetatileBehavior_IsFootprints`. */
export function MetatileBehavior_IsFootprints(behavior: number): boolean {
  return behavior === ENUM_MB_0.MB_FOOTPRINTS;
}
/** 1:1 décomp `MetatileBehavior_HasRipples`. */
export function MetatileBehavior_HasRipples(behavior: number): boolean {
  return (
    behavior === ENUM_MB_0.MB_POND_WATER ||
    behavior === ENUM_MB_0.MB_PUDDLE ||
    behavior === ENUM_MB_0.MB_SOOTOPOLIS_DEEP_WATER
  );
}
// MetatileBehavior_IsRunningDisallowed + MetatileBehavior_IsPacifidlogLog déjà
// définis plus bas dans le fichier (= cherche `MB_NO_RUNNING || MB_HOT_SPRINGS`).

// ─── Lookup tables — 1:1 décomp event_object_movement.c:893-905 ────────────

/** 1:1 décomp `gOppositeDirectionBlockedMetatileFuncs` (event_object_movement.c:893).
 *  Indexé par direction-1 (= [DIR_SOUTH-1] = [0]). Check si le tile COURANT
 *  (= where player IS) bloque l'EXIT dans cette direction. */
const sOppositeDirectionBlockedFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsSouthBlocked,  // direction = DIR_SOUTH → exit south blocked
  MetatileBehavior_IsNorthBlocked,
  MetatileBehavior_IsWestBlocked,
  MetatileBehavior_IsEastBlocked,
];

/** 1:1 décomp `gDirectionBlockedMetatileFuncs` (event_object_movement.c:900).
 *  Indexé par direction-1. Check si le tile TARGET (= where player WOULD GO)
 *  bloque l'ENTRY depuis la direction opposée. */
const sDirectionBlockedFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsNorthBlocked,  // direction = DIR_SOUTH → target tile bloque entry from north
  MetatileBehavior_IsSouthBlocked,
  MetatileBehavior_IsEastBlocked,
  MetatileBehavior_IsWestBlocked,
];

/** Lookup ledge (jump) direction → check function. Indexé par direction-1.
 *  Utilisé par `ShouldJumpLedge` : si target tile = MB_JUMP_X et direction = X
 *  (= south for JUMP_SOUTH), trigger ledge jump. */
const sJumpFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsJumpSouth,  // direction = DIR_SOUTH → check JUMP_SOUTH
  MetatileBehavior_IsJumpNorth,
  MetatileBehavior_IsJumpWest,
  MetatileBehavior_IsJumpEast,
];

// ─── Public API ────────────────────────────────────────────────────────────

/** 1:1 décomp `IsMetatileDirectionallyImpassable` (event_object_movement.c:4715).
 *  Returns TRUE si le couple (current tile, target tile) bloque le movement
 *  dans la direction donnée :
 *    - Current tile bloque l'EXIT dans cette direction (= e.g. MB_IMPASSABLE_NORTH
 *      sur tile courant + player walks NORTH)
 *    OR
 *    - Target tile bloque l'ENTRY depuis la direction opposée (= e.g.
 *      MB_IMPASSABLE_SOUTH sur tile target + player walks NORTH = arrive from south)
 *
 *  @param currentBehavior metatile_behavior du tile courant du player
 *  @param targetBehavior  metatile_behavior du tile target
 *  @param direction       DIR_SOUTH/NORTH/WEST/EAST
 *  @returns TRUE si bloqué
 */
export function IsMetatileDirectionallyImpassable(
  currentBehavior: number, targetBehavior: number, direction: number,
): boolean {
  const idx = direction - 1;
  if (idx < 0 || idx >= 4) return false;
  return sOppositeDirectionBlockedFuncs[idx](currentBehavior)
      || sDirectionBlockedFuncs[idx](targetBehavior);
}

/** 1:1 décomp `ShouldJumpLedge(x, y, direction)` (field_player_avatar.c:727).
 *  Returns TRUE si le tile target = MB_JUMP_X et direction = X (= ledge drop).
 *
 *  @param targetBehavior metatile_behavior du tile target
 *  @param direction      DIR_SOUTH/NORTH/WEST/EAST
 */
export function ShouldJumpLedge(targetBehavior: number, direction: number): boolean {
  const idx = direction - 1;
  if (idx < 0 || idx >= 4) return false;
  return sJumpFuncs[idx](targetBehavior);
}

// ─── Running disallowed checks — 1:1 décomp bike.c + metatile_behavior.c ─────

/** 1:1 décomp `MetatileBehavior_IsPacifidlogLog` (metatile_behavior.c:1043). */
export function MetatileBehavior_IsPacifidlogLog(behavior: number): boolean {
  return behavior === MB_PACIFIDLOG_VERTICAL_LOG_TOP
      || behavior === MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM
      || behavior === MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT
      || behavior === MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT;
}

/** 1:1 décomp `MetatileBehavior_IsRunningDisallowed` (metatile_behavior.c:1258). */
export function MetatileBehavior_IsRunningDisallowed(behavior: number): boolean {
  return behavior === MB_NO_RUNNING
      || behavior === MB_LONG_GRASS
      || behavior === MB_HOT_SPRINGS
      || MetatileBehavior_IsPacifidlogLog(behavior);
}

/** 1:1 décomp `IsRunningDisallowedByMetatile` (bike.c:901-908).
 *  Phase 4.9 first cut : MetatileBehavior_IsFortreeBridge edge case omis (=
 *  rare, requires PlayerGetElevation odd-bit check). À ajouter avec elevation
 *  system si nécessaire pour Fortree gym. */
export function IsRunningDisallowedByMetatile(behavior: number): boolean {
  return MetatileBehavior_IsRunningDisallowed(behavior);
}

/** 1:1 décomp `IsRunningDisallowed` (bike.c:1056-1062).
 *  Returns TRUE si :
 *    - gMapHeader.allowRunning est FALSE (= map header flag, e.g. caves) OR
 *    - le metatile courant interdit running (= MB_NO_RUNNING / LONG_GRASS / etc.) */
export function IsRunningDisallowed(behavior: number): boolean {
  if (!gMapHeader) return true;  // safety : pas de map = pas de run
  return !gMapHeader.allowRunning || IsRunningDisallowedByMetatile(behavior);
}
