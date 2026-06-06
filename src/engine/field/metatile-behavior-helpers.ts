/**
 * metatile-behavior-helpers.ts — fonctions DIRECTIONNELLES de movement/bike +
 * re-export des prédicats du miroir.
 *
 * Migration miroir 2026-06-05 : les ~21 prédicats `MetatileBehavior_*` qui étaient
 * dupliqués ici (et DIVERGEAIENT du miroir + du décomp) sont supprimés → ce fichier
 * RE-EXPORTE désormais tous les prédicats du miroir 1:1 `src/game/metatile_behavior.ts`
 * (source unique, corrigés). Restent ici les fonctions qui appartiennent à d'AUTRES
 * fichiers décomp (à mettre dans leurs miroirs quand portés) :
 *   - `IsMetatileDirectionallyImpassable` (event_object_movement.c:4715) + ses 2 tables
 *   - `ShouldJumpLedge` (field_player_avatar.c:727) + sa table
 *   - `IsRunningDisallowed*` (bike.c:901/1056)
 */

import {
  MetatileBehavior_IsSouthBlocked, MetatileBehavior_IsNorthBlocked,
  MetatileBehavior_IsEastBlocked, MetatileBehavior_IsWestBlocked,
  MetatileBehavior_IsJumpSouth, MetatileBehavior_IsJumpNorth,
  MetatileBehavior_IsJumpWest, MetatileBehavior_IsJumpEast,
  MetatileBehavior_IsRunningDisallowed,
} from '../../game/metatile_behavior';
import { gMapHeader } from './map-loader';

// Tous les prédicats `MetatileBehavior_*` viennent du miroir (source unique, 1:1).
export * from '../../game/metatile_behavior';

// ─── Lookup tables — 1:1 décomp event_object_movement.c:893-905 ────────────
/** 1:1 décomp `gOppositeDirectionBlockedMetatileFuncs`. Indexé par direction-1.
 *  Check si le tile COURANT bloque l'EXIT dans cette direction. */
const sOppositeDirectionBlockedFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsSouthBlocked, MetatileBehavior_IsNorthBlocked,
  MetatileBehavior_IsWestBlocked, MetatileBehavior_IsEastBlocked,
];
/** 1:1 décomp `gDirectionBlockedMetatileFuncs`. Indexé par direction-1. Check si le
 *  tile TARGET bloque l'ENTRY depuis la direction opposée. */
const sDirectionBlockedFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsNorthBlocked, MetatileBehavior_IsSouthBlocked,
  MetatileBehavior_IsEastBlocked, MetatileBehavior_IsWestBlocked,
];
/** Lookup ledge (jump) direction → check function. Indexé par direction-1. */
const sJumpFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsJumpSouth, MetatileBehavior_IsJumpNorth,
  MetatileBehavior_IsJumpWest, MetatileBehavior_IsJumpEast,
];

// ─── Public API (movement / bike) ────────────────────────────────────────────

/** 1:1 décomp `IsMetatileDirectionallyImpassable` (event_object_movement.c:4715).
 *  TRUE si (current bloque l'exit dans la direction) OU (target bloque l'entry
 *  depuis la direction opposée). direction = DIR_SOUTH/NORTH/WEST/EAST (1..4). */
export function IsMetatileDirectionallyImpassable(
  currentBehavior: number, targetBehavior: number, direction: number,
): boolean {
  const idx = direction - 1;
  if (idx < 0 || idx >= 4) return false;
  return sOppositeDirectionBlockedFuncs[idx](currentBehavior)
      || sDirectionBlockedFuncs[idx](targetBehavior);
}

/** 1:1 décomp `ShouldJumpLedge` (field_player_avatar.c:727). TRUE si le tile target
 *  = MB_JUMP_X et direction = X (= ledge drop). */
export function ShouldJumpLedge(targetBehavior: number, direction: number): boolean {
  const idx = direction - 1;
  if (idx < 0 || idx >= 4) return false;
  return sJumpFuncs[idx](targetBehavior);
}

/** 1:1 décomp `IsRunningDisallowedByMetatile` (bike.c:901). (Fortree-bridge edge
 *  case omis = rare, requiert elevation odd-bit.) */
export function IsRunningDisallowedByMetatile(behavior: number): boolean {
  return MetatileBehavior_IsRunningDisallowed(behavior);
}

/** 1:1 décomp `IsRunningDisallowed` (bike.c:1056). TRUE si gMapHeader.allowRunning
 *  FALSE OU si le metatile courant interdit running. */
export function IsRunningDisallowed(behavior: number): boolean {
  if (!gMapHeader) return true;
  return !gMapHeader.allowRunning || IsRunningDisallowedByMetatile(behavior);
}
