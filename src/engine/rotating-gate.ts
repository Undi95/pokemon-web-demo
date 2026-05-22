/**
 * rotating-gate.ts — 1:1 décomp port `src/rotating_gate.c`.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/rotating_gate.c`
 *
 * Rotating gates puzzle = Fortree City Gym + Trick House Puzzle 6.
 * Aucune de ces maps n'est dans la démo (= Brendan house / Litoral 101+102 /
 * Bourg-en-Vol). `GetCurrentMapRotatingGatePuzzleType()` retourne PUZZLE_NONE
 * sur les démo maps → `CheckForRotatingGatePuzzleCollision*` early-return false.
 *
 * Port partiel 1:1 strict : signature + early-return path complets, détail
 * puzzle config + RotatingGate_GetRotationInfo en R4 dette explicite (= à
 * porter quand Fortree/Trick House ajoutés).
 */

import { gMapHeader } from './map-loader';

/** 1:1 décomp `enum` (rotating_gate.c:176-180). */
export const PUZZLE_NONE                       = 0;
export const PUZZLE_FORTREE_CITY_GYM           = 1;
export const PUZZLE_ROUTE110_TRICK_HOUSE_PUZZLE6 = 2;

/** 1:1 décomp `GetCurrentMapRotatingGatePuzzleType(void)`
 *  (rotating_gate.c:625-640).
 *
 *  ```c
 *  if (gSaveBlock1Ptr->location.mapGroup == MAP_GROUP(MAP_FORTREE_CITY_GYM)
 *      && gSaveBlock1Ptr->location.mapNum == MAP_NUM(MAP_FORTREE_CITY_GYM))
 *      return PUZZLE_FORTREE_CITY_GYM;
 *  if (gSaveBlock1Ptr->location.mapGroup == MAP_GROUP(MAP_ROUTE110_TRICK_HOUSE_PUZZLE6)
 *      && gSaveBlock1Ptr->location.mapNum == MAP_NUM(MAP_ROUTE110_TRICK_HOUSE_PUZZLE6))
 *      return PUZZLE_ROUTE110_TRICK_HOUSE_PUZZLE6;
 *  return PUZZLE_NONE;
 *  ```
 *
 *  Notre impl : check via gMapHeader.id string (= notre source unique mapId).
 *  Functionnellement équivalent à MAP_GROUP+MAP_NUM compare. */
export function GetCurrentMapRotatingGatePuzzleType(): number {
  const mapId = gMapHeader?.id;
  if (mapId === 'FortreeCity_Gym') return PUZZLE_FORTREE_CITY_GYM;
  if (mapId === 'Route110_TrickHousePuzzle6') return PUZZLE_ROUTE110_TRICK_HOUSE_PUZZLE6;
  return PUZZLE_NONE;
}

/** 1:1 décomp `CheckForRotatingGatePuzzleCollision(u8 direction, s16 x, s16 y)`
 *  (rotating_gate.c:961-997). Early-return FALSE si pas une rotating gate map.
 *
 *  ```c
 *  if (!GetCurrentMapRotatingGatePuzzleType()) return FALSE;
 *  for (i = 0; i < sRotatingGate_PuzzleCount; i++) {
 *      // ... compare position aux gates configurées ...
 *      // ... RotatingGate_GetRotationInfo + collision check ...
 *  }
 *  return FALSE;
 *  ```
 *
 *  Détail puzzle config + RotatingGate_GetRotationInfo = R4 dette explicite
 *  (= à porter avec Fortree Gym / Trick House Puzzle 6). Sur démo : early-
 *  return FALSE = correct car maps non concernées. */
export function CheckForRotatingGatePuzzleCollision(
  _direction: number, _x: number, _y: number,
): boolean {
  if (!GetCurrentMapRotatingGatePuzzleType()) return false;
  // R4 dette explicite : porter sRotatingGate_PuzzleConfig +
  // RotatingGate_GetRotationInfo + RotatingGate_PushAndRotate quand
  // Fortree Gym ou Trick House Puzzle 6 ajoutés à la démo.
  return false;
}

/** 1:1 décomp `CheckForRotatingGatePuzzleCollisionWithoutAnimation(u8 direction, s16 x, s16 y)`
 *  (rotating_gate.c:999-1035). Variante de la précédente : check identique mais
 *  ne déclenche pas l'animation de rotation (= used par
 *  `CheckForObjectEventStaticCollision` pour trainer line-of-sight). */
export function CheckForRotatingGatePuzzleCollisionWithoutAnimation(
  _direction: number, _x: number, _y: number,
): boolean {
  if (!GetCurrentMapRotatingGatePuzzleType()) return false;
  // R4 dette explicite : même détail R4 que CheckForRotatingGatePuzzleCollision.
  return false;
}
