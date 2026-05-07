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
} from './tilemap-loader';
import { DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './direction-coords';

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
