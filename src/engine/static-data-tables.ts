/**
 * static-data-tables.ts — port des `static const u8 sX[]` data tables manquantes.
 *
 * Les bodies auto-portés des fichiers `event_object_movement.c`,
 * `movement_action_func_tables.h`, etc. référencent des `static const` arrays
 * qui ne sont PAS extraits par `transpile-decomp-all.mjs` (qui ne capture que
 * les fonctions). Ce module porte manuellement les tables critiques.
 *
 * Source : `public/decomp/em/static-tables/<file>.json` (= généré par
 * `scripts/extract-static-data-tables.mjs`).
 *
 * Le bridge `decomp-bridge.ts` re-exporte ces tables pour que les auto-files
 * puissent les destructure et les utiliser.
 *
 * Manual port pour les tables critiques (= les autres tables sont disponibles
 * via getStaticTable(file, name) async).
 */

// ─── ANIM_STD_GO_X constants (= include/constants/anims.h) ───────────────────
// 1:1 décomp `sprite.h` ANIM_STD_X enum.
export const ANIM_STD_GO_SOUTH       = 0;
export const ANIM_STD_GO_NORTH       = 1;
export const ANIM_STD_GO_WEST        = 2;
export const ANIM_STD_GO_EAST        = 3;
export const ANIM_STD_GO_FAST_SOUTH  = 4;
export const ANIM_STD_GO_FAST_NORTH  = 5;
export const ANIM_STD_GO_FAST_WEST   = 6;
export const ANIM_STD_GO_FAST_EAST   = 7;
export const ANIM_STD_GO_FASTER_SOUTH = 8;
export const ANIM_STD_GO_FASTER_NORTH = 9;
export const ANIM_STD_GO_FASTER_WEST  = 10;
export const ANIM_STD_GO_FASTER_EAST  = 11;
export const ANIM_STD_GO_FASTEST_SOUTH = 12;
export const ANIM_STD_GO_FASTEST_NORTH = 13;
export const ANIM_STD_GO_FASTEST_WEST  = 14;
export const ANIM_STD_GO_FASTEST_EAST  = 15;
// Diagonal directions reuse 4-cardinal anims in décomp.

// Direction enum offsets (= 1:1 décomp `include/constants/global.h`).
// Migré vers imports decomp-data global-data.ts (cleanup B7).
import {
  DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
  DIR_SOUTHWEST, DIR_SOUTHEAST, DIR_NORTHWEST, DIR_NORTHEAST,
} from './decomp-data/include/constants/global-data';

// ─── sMoveDirectionAnimNums (= event_object_movement.c) ─────────────────────
/** 1:1 décomp `event_object_movement.c sMoveDirectionAnimNums[]`.
 *  Indexed by DIR_X → ANIM_STD_GO_X. Diagonals fall back to cardinal. */
export const sMoveDirectionAnimNums: ReadonlyArray<number> = (() => {
  const a = new Array<number>(9).fill(ANIM_STD_GO_SOUTH);
  a[DIR_NONE]      = ANIM_STD_GO_SOUTH;
  a[DIR_SOUTH]     = ANIM_STD_GO_SOUTH;
  a[DIR_NORTH]     = ANIM_STD_GO_NORTH;
  a[DIR_WEST]      = ANIM_STD_GO_WEST;
  a[DIR_EAST]      = ANIM_STD_GO_EAST;
  a[DIR_SOUTHWEST] = ANIM_STD_GO_SOUTH;
  a[DIR_SOUTHEAST] = ANIM_STD_GO_SOUTH;
  a[DIR_NORTHWEST] = ANIM_STD_GO_NORTH;
  a[DIR_NORTHEAST] = ANIM_STD_GO_NORTH;
  return a;
})();

/** 1:1 décomp `event_object_movement.c sMoveDirectionFastAnimNums[]`. */
export const sMoveDirectionFastAnimNums: ReadonlyArray<number> = (() => {
  const a = new Array<number>(9).fill(ANIM_STD_GO_FAST_SOUTH);
  a[DIR_NONE]      = ANIM_STD_GO_FAST_SOUTH;
  a[DIR_SOUTH]     = ANIM_STD_GO_FAST_SOUTH;
  a[DIR_NORTH]     = ANIM_STD_GO_FAST_NORTH;
  a[DIR_WEST]      = ANIM_STD_GO_FAST_WEST;
  a[DIR_EAST]      = ANIM_STD_GO_FAST_EAST;
  a[DIR_SOUTHWEST] = ANIM_STD_GO_FAST_SOUTH;
  a[DIR_SOUTHEAST] = ANIM_STD_GO_FAST_SOUTH;
  a[DIR_NORTHWEST] = ANIM_STD_GO_FAST_NORTH;
  a[DIR_NORTHEAST] = ANIM_STD_GO_FAST_NORTH;
  return a;
})();

/** 1:1 décomp `event_object_movement.c sMoveDirectionFasterAnimNums[]`. */
export const sMoveDirectionFasterAnimNums: ReadonlyArray<number> = (() => {
  const a = new Array<number>(9).fill(ANIM_STD_GO_FASTER_SOUTH);
  a[DIR_NONE]      = ANIM_STD_GO_FASTER_SOUTH;
  a[DIR_SOUTH]     = ANIM_STD_GO_FASTER_SOUTH;
  a[DIR_NORTH]     = ANIM_STD_GO_FASTER_NORTH;
  a[DIR_WEST]      = ANIM_STD_GO_FASTER_WEST;
  a[DIR_EAST]      = ANIM_STD_GO_FASTER_EAST;
  a[DIR_SOUTHWEST] = ANIM_STD_GO_FASTER_SOUTH;
  a[DIR_SOUTHEAST] = ANIM_STD_GO_FASTER_SOUTH;
  a[DIR_NORTHWEST] = ANIM_STD_GO_FASTER_NORTH;
  a[DIR_NORTHEAST] = ANIM_STD_GO_FASTER_NORTH;
  return a;
})();

/** 1:1 décomp `event_object_movement.c sMoveDirectionFastestAnimNums[]`. */
export const sMoveDirectionFastestAnimNums: ReadonlyArray<number> = (() => {
  const a = new Array<number>(9).fill(ANIM_STD_GO_FASTEST_SOUTH);
  a[DIR_NONE]      = ANIM_STD_GO_FASTEST_SOUTH;
  a[DIR_SOUTH]     = ANIM_STD_GO_FASTEST_SOUTH;
  a[DIR_NORTH]     = ANIM_STD_GO_FASTEST_NORTH;
  a[DIR_WEST]      = ANIM_STD_GO_FASTEST_WEST;
  a[DIR_EAST]      = ANIM_STD_GO_FASTEST_EAST;
  return a;
})();

// ─── Direction lookup tables (= event_object_movement.c) ─────────────────────

/** 1:1 décomp `gOppositeDirections[]` : DIR_X → opposite DIR. */
export const sOppositeDirections: ReadonlyArray<number> = [
  DIR_NORTH,  // [0] = DIR_NONE-ish fallback, use NORTH safely
  DIR_NORTH,  // [DIR_SOUTH]
  DIR_SOUTH,  // [DIR_NORTH]
  DIR_EAST,   // [DIR_WEST]
  DIR_WEST,   // [DIR_EAST]
  DIR_NORTHEAST,  // [DIR_SOUTHWEST]
  DIR_NORTHWEST,  // [DIR_SOUTHEAST]
  DIR_SOUTHEAST,  // [DIR_NORTHWEST]
  DIR_SOUTHWEST,  // [DIR_NORTHEAST]
];

/** 1:1 décomp `gStandardDirections[]` : the 4 cardinal DIRs. */
export const gStandardDirections: ReadonlyArray<number> = [
  DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
];

// ─── sJumpInitDisplacements (= movement_action_func_tables.h) ────────────────
//
// 1:1 décomp `movement_action_func_tables.h` :
//   static const s16 sJumpInitDisplacements[] = {
//       [JUMP_DISTANCE_IN_PLACE] = 0,
//       [JUMP_DISTANCE_NORMAL]   = 1,
//       [JUMP_DISTANCE_FAR]      = 2,
//   };
export const sJumpInitDisplacements: ReadonlyArray<number> = [0, 1, 2];

/** 1:1 décomp `movement_action_func_tables.h` :
 *    static const s16 sJumpDisplacements[] = {
 *        [JUMP_DISTANCE_IN_PLACE] = 0,
 *        [JUMP_DISTANCE_NORMAL]   = 1,
 *        [JUMP_DISTANCE_FAR]      = 1,
 *    };
 */
export const sJumpDisplacements: ReadonlyArray<number> = [0, 1, 1];

// ─── sDirectionAnimFuncsBySpeed (= movement_action_func_tables.h) ────────────
//
// 1:1 décomp `movement_action_func_tables.h:605` :
//   static u8 (*const sDirectionAnimFuncsBySpeed[])(u8) = {
//       [MOVE_SPEED_NORMAL]  = GetMoveDirectionAnimNum,
//       [MOVE_SPEED_FAST_1]  = GetMoveDirectionFastAnimNum,
//       [MOVE_SPEED_FAST_2]  = GetMoveDirectionFastAnimNum,
//       [MOVE_SPEED_FASTER]  = GetMoveDirectionFasterAnimNum,
//       [MOVE_SPEED_FASTEST] = GetMoveDirectionFastestAnimNum,
//   };
//
// On exporte un getter qui résout à runtime via le bridge — évite circular
// import (= bridge import ce module qui import bridge).
export function _resolveDirectionAnimFuncsBySpeed(
  GetMoveDirectionAnimNum: any,
  GetMoveDirectionFastAnimNum: any,
  GetMoveDirectionFasterAnimNum: any,
  GetMoveDirectionFastestAnimNum: any,
): ReadonlyArray<(dir: number) => number> {
  return [
    GetMoveDirectionAnimNum,        // MOVE_SPEED_NORMAL
    GetMoveDirectionFastAnimNum,    // MOVE_SPEED_FAST_1
    GetMoveDirectionFastAnimNum,    // MOVE_SPEED_FAST_2
    GetMoveDirectionFasterAnimNum,  // MOVE_SPEED_FASTER
    GetMoveDirectionFastestAnimNum, // MOVE_SPEED_FASTEST
  ];
}

// ─── sStep1Funcs / sStep2Funcs / sStep3Funcs / sStep4Funcs / sStep8Funcs ────
//
// 1:1 décomp `event_object_movement.c sStepXFuncs[]` : 4 funcs (DIR_SOUTH..EAST)
// par speed. Each func returns true when step-anim done.
//
// Ces fonctions sont définies dans event_object_movement.c et exportées par
// l'auto-file. On peut les résoudre lazy via le bridge.
export interface SpriteStepFunc {
  (sprite: any, direction: number): boolean;
}

// ─── sStepTimes (= 1:1 décomp event_object_movement.c) ──────────────────────
//
// Frames for each speed (= duration of the step).
export const sStepTimes: ReadonlyArray<number> = [
  16, // MOVE_SPEED_NORMAL  = 16 frames per tile (= 1px/frame)
   8, // MOVE_SPEED_FAST_1  = 8 frames (= 2px/frame)
   8, // MOVE_SPEED_FAST_2  = water current / acro
   4, // MOVE_SPEED_FASTER  = 4 frames (= 4px/frame)
   2, // MOVE_SPEED_FASTEST = 2 frames (= 8px/frame)
];

// ─── sDirectionToVectors (= event_object_movement.c) ────────────────────────
//
// 1:1 décomp : DIR_X → {dx, dy} offset.
// Index 0 = DIR_NONE. SOUTH = +y. NORTH = -y. WEST = -x. EAST = +x.
// Diagonals : SOUTHWEST = (-x,+y), SOUTHEAST = (+x,+y), etc.
export interface Coords16 { x: number; y: number; }
export const sDirectionToVectors: ReadonlyArray<Coords16> = [
  { x: 0, y: 0 },   // DIR_NONE
  { x: 0, y: 1 },   // DIR_SOUTH
  { x: 0, y: -1 },  // DIR_NORTH
  { x: -1, y: 0 },  // DIR_WEST
  { x: 1, y: 0 },   // DIR_EAST
  { x: -1, y: 1 },  // DIR_SOUTHWEST
  { x: 1, y: 1 },   // DIR_SOUTHEAST
  { x: -1, y: -1 }, // DIR_NORTHWEST
  { x: 1, y: -1 },  // DIR_NORTHEAST
];

// ─── gFaceDirectionMovementActions etc (= event_object_movement.c) ──────────

/** 1:1 décomp `event_object_movement.c gFaceDirectionMovementActions[]` */
export const gFaceDirectionMovementActions: ReadonlyArray<number> = [
  0x00, // DIR_NONE → MOVEMENT_ACTION_FACE_DOWN
  0x00, // DIR_SOUTH → MOVEMENT_ACTION_FACE_DOWN
  0x01, // DIR_NORTH → MOVEMENT_ACTION_FACE_UP
  0x02, // DIR_WEST → MOVEMENT_ACTION_FACE_LEFT
  0x03, // DIR_EAST → MOVEMENT_ACTION_FACE_RIGHT
];

/** 1:1 décomp `gWalkSlowMovementActions[]` */
export const gWalkSlowMovementActions: ReadonlyArray<number> = [
  0x04, 0x04, 0x05, 0x06, 0x07,
];

/** 1:1 décomp `gWalkNormalMovementActions[]` */
export const gWalkNormalMovementActions: ReadonlyArray<number> = [
  0x08, 0x08, 0x09, 0x0A, 0x0B,
];

/** 1:1 décomp `gWalkFastMovementActions[]` */
export const gWalkFastMovementActions: ReadonlyArray<number> = [
  0x0C, 0x0C, 0x0D, 0x0E, 0x0F,
];

// ─── Lazy fetch helper for arbitrary tables ──────────────────────────────────
//
// `getStaticTable('event_object_movement', 'sX')` → fetch from JSON.
const _tableCache = new Map<string, any>();
export async function getStaticTable(file: string, tableName: string): Promise<any> {
  const key = `${file}::${tableName}`;
  if (_tableCache.has(key)) return _tableCache.get(key);
  try {
    const resp = await fetch(`/decomp/em/static-tables/${file}.json`);
    if (!resp.ok) return null;
    const data = await resp.json() as { tables: Record<string, any> };
    const t = data.tables[tableName] ?? null;
    _tableCache.set(key, t);
    return t;
  } catch {
    return null;
  }
}
