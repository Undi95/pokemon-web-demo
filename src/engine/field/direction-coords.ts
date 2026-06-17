/**
 * direction-coords.ts — Foundation 1:1 décomp `event_object_movement.c`.
 *
 * Source unique pour les directions overworld + leurs vecteurs (dx/dy) +
 * inverses + helpers `MoveCoords`. Avant cet unification, ces tables étaient
 * dupliquées dans player-avatar.ts, object-events.ts, script-opcodes.ts —
 * risque de divergence lors d'updates futurs.
 *
 * Source de vérité décomp :
 *   - `event_object_movement.c:907` `sDirectionToVectors[]`
 *   - `include/global.fieldmap.h` `enum Direction`
 *   - `event_object_movement.c:GetOppositeDirection`
 */

// ─── Direction enum 1:1 décomp `enum Direction` (global.fieldmap.h:308) ────

export const DIR_NONE      = 0;
export const DIR_SOUTH     = 1;
export const DIR_NORTH     = 2;
export const DIR_WEST      = 3;
export const DIR_EAST      = 4;
export const DIR_SOUTHWEST = 5;
export const DIR_SOUTHEAST = 6;
export const DIR_NORTHWEST = 7;
export const DIR_NORTHEAST = 8;

// ─── Direction → vecteur (dx, dy) — 1:1 décomp `sDirectionToVectors` ────────

/** dx par direction. 1:1 décomp `sDirectionToVectors[N].x` (event_object_movement.c:907). */
export const DIR_TO_DX: readonly number[] = [
  /* DIR_NONE      */  0,
  /* DIR_SOUTH     */  0,
  /* DIR_NORTH     */  0,
  /* DIR_WEST      */ -1,
  /* DIR_EAST      */  1,
  /* DIR_SOUTHWEST */ -1,
  /* DIR_SOUTHEAST */  1,
  /* DIR_NORTHWEST */ -1,
  /* DIR_NORTHEAST */  1,
];

/** dy par direction. 1:1 décomp `sDirectionToVectors[N].y` (event_object_movement.c:907). */
export const DIR_TO_DY: readonly number[] = [
  /* DIR_NONE      */  0,
  /* DIR_SOUTH     */  1,
  /* DIR_NORTH     */ -1,
  /* DIR_WEST      */  0,
  /* DIR_EAST      */  0,
  /* DIR_SOUTHWEST */  1,
  /* DIR_SOUTHEAST */  1,
  /* DIR_NORTHWEST */ -1,
  /* DIR_NORTHEAST */ -1,
];

// ─── Direction opposée — 1:1 décomp `GetOppositeDirection` ─────────────────

/** Direction opposée. 1:1 décomp `GetOppositeDirection` :
 *    SOUTH ↔ NORTH, WEST ↔ EAST. Diagonales : flip both axes.
 *  Utilisé par object-events (= NPC turn 180° via `OPPOSITE_DIR[npc.facing]`)
 *  et script-opcodes (= turnobject opcode). */
export const OPPOSITE_DIR: readonly number[] = [
  /* DIR_NONE      */ DIR_NONE,
  /* DIR_SOUTH     */ DIR_NORTH,
  /* DIR_NORTH     */ DIR_SOUTH,
  /* DIR_WEST      */ DIR_EAST,
  /* DIR_EAST      */ DIR_WEST,
  /* DIR_SOUTHWEST */ DIR_NORTHEAST,
  /* DIR_SOUTHEAST */ DIR_NORTHWEST,
  /* DIR_NORTHWEST */ DIR_SOUTHEAST,
  /* DIR_NORTHEAST */ DIR_SOUTHWEST,
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/** 1:1 décomp `MoveCoords(direction, x, y)` (event_object_movement.c).
 *  Modifie x, y selon la direction donnée. */
export function MoveCoords(direction: number, x: number, y: number): { x: number; y: number } {
  return {
    x: x + (DIR_TO_DX[direction] ?? 0),
    y: y + (DIR_TO_DY[direction] ?? 0),
  };
}

/** Camera speed delta vector pour une direction donnée (1 px/frame movement).
 *  Player walks vers la direction donnée → camera scrolle dans la même direction.
 *  Utilisé par player-avatar.PlayerStep + ExitTask walks. */
export function dirToCameraSpeed(direction: number): { x: number; y: number } {
  return {
    x: DIR_TO_DX[direction] ?? 0,
    y: DIR_TO_DY[direction] ?? 0,
  };
}

/** Convertit GBA keys → direction (priority order : down/up/left/right comme décomp).
 *  GBA keys : DOWN=0x80, UP=0x40, LEFT=0x20, RIGHT=0x10.
 *  1:1 décomp `GetPlayerMovementDirection` priority order. */
export function getInputDirection(heldKeys: number): number {
  if (heldKeys & 0x80) return DIR_SOUTH;
  if (heldKeys & 0x40) return DIR_NORTH;
  if (heldKeys & 0x20) return DIR_WEST;
  if (heldKeys & 0x10) return DIR_EAST;
  return DIR_NONE;
}

/** 1:1 décomp `GetOppositeDirection` (event_object_movement.c:4991-5000).
 *
 *  Body décomp :
 *  ```c
 *  u8 GetOppositeDirection(u8 direction) {
 *      u8 directions[sizeof sOppositeDirections];
 *      memcpy(directions, sOppositeDirections, sizeof sOppositeDirections);
 *      if (direction <= DIR_NONE || direction > (sizeof sOppositeDirections))
 *          return direction;
 *      return directions[direction - 1];
 *  }
 *  ```
 *
 *  Wrapper sur `OPPOSITE_DIR` table avec bounds check 1:1 décomp. */
export function GetOppositeDirection(direction: number): number {
  // 1:1 décomp : direction <= DIR_NONE (0) ou > 8 → return direction unchanged.
  if (direction <= DIR_NONE || direction > 8) return direction;
  return OPPOSITE_DIR[direction]!;
}

// ─── Anim num tables 1:1 décomp event_object_movement.c:715-769 ─────────────
//
// Each table maps DIR_* index (0..8) to ANIM_STD_* constant pour sprite
// animation lookup. Used par updateSpriteFrame / NPC dispatch.

/** 1:1 décomp ANIM_STD_* constants (= sprite anim numbers).
 *  Cf. include/constants/event_object_movement.h. */
const ANIM_STD_FACE_SOUTH      = 0;
const ANIM_STD_FACE_NORTH      = 1;
const ANIM_STD_FACE_WEST       = 2;
const ANIM_STD_FACE_EAST       = 3;
const ANIM_STD_GO_SOUTH        = 4;
const ANIM_STD_GO_NORTH        = 5;
const ANIM_STD_GO_WEST         = 6;
const ANIM_STD_GO_EAST         = 7;
const ANIM_STD_GO_FAST_SOUTH   = 8;
const ANIM_STD_GO_FAST_NORTH   = 9;
const ANIM_STD_GO_FAST_WEST    = 10;
const ANIM_STD_GO_FAST_EAST    = 11;
const ANIM_STD_GO_FASTER_SOUTH = 12;
const ANIM_STD_GO_FASTER_NORTH = 13;
const ANIM_STD_GO_FASTER_WEST  = 14;
const ANIM_STD_GO_FASTER_EAST  = 15;
const ANIM_STD_GO_FASTEST_SOUTH = 16;
const ANIM_STD_GO_FASTEST_NORTH = 17;
const ANIM_STD_GO_FASTEST_WEST  = 18;
const ANIM_STD_GO_FASTEST_EAST  = 19;

/** 1:1 décomp `sFaceDirectionAnimNums[]` (event_object_movement.c:715-725). */
const sFaceDirectionAnimNums: readonly number[] = [
  ANIM_STD_FACE_SOUTH,  // DIR_NONE → fallback SOUTH
  ANIM_STD_FACE_SOUTH,  // DIR_SOUTH
  ANIM_STD_FACE_NORTH,  // DIR_NORTH
  ANIM_STD_FACE_WEST,   // DIR_WEST
  ANIM_STD_FACE_EAST,   // DIR_EAST
  ANIM_STD_FACE_SOUTH,  // DIR_SOUTHWEST
  ANIM_STD_FACE_SOUTH,  // DIR_SOUTHEAST
  ANIM_STD_FACE_NORTH,  // DIR_NORTHWEST
  ANIM_STD_FACE_NORTH,  // DIR_NORTHEAST
];

/** 1:1 décomp `sMoveDirectionAnimNums[]` (event_object_movement.c:726-736). */
const sMoveDirectionAnimNums: readonly number[] = [
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_NORTH,
  ANIM_STD_GO_WEST,
  ANIM_STD_GO_EAST,
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_NORTH,
  ANIM_STD_GO_NORTH,
];

/** 1:1 décomp `sMoveDirectionFastAnimNums[]` (event_object_movement.c:737-747). */
const sMoveDirectionFastAnimNums: readonly number[] = [
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_NORTH,
  ANIM_STD_GO_FAST_WEST,
  ANIM_STD_GO_FAST_EAST,
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_NORTH,
  ANIM_STD_GO_FAST_NORTH,
];

/** 1:1 décomp `sMoveDirectionFasterAnimNums[]`. */
const sMoveDirectionFasterAnimNums: readonly number[] = [
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_NORTH,
  ANIM_STD_GO_FASTER_WEST,
  ANIM_STD_GO_FASTER_EAST,
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_NORTH,
  ANIM_STD_GO_FASTER_NORTH,
];

/** 1:1 décomp `sMoveDirectionFastestAnimNums[]`. */
const sMoveDirectionFastestAnimNums: readonly number[] = [
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_NORTH,
  ANIM_STD_GO_FASTEST_WEST,
  ANIM_STD_GO_FASTEST_EAST,
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_NORTH,
  ANIM_STD_GO_FASTEST_NORTH,
];

// 1:1 décomp ANIM_BUNNY_HOP_BACK_WHEEL_* (= ANIM_STD_COUNT + 0..3 ; ANIM_STD_COUNT = 20).
// Indices d'anim du sprite acro bike (wheelie sur la roue arrière).
const ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH = 20;
const ANIM_BUNNY_HOP_BACK_WHEEL_NORTH = 21;
const ANIM_BUNNY_HOP_BACK_WHEEL_WEST  = 22;
const ANIM_BUNNY_HOP_BACK_WHEEL_EAST  = 23;

/** 1:1 décomp `sAcroWheelieDirectionAnimNums[]` (event_object_movement.c:781). */
const sAcroWheelieDirectionAnimNums: readonly number[] = [
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_NONE
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_SOUTH
  ANIM_BUNNY_HOP_BACK_WHEEL_NORTH,  // DIR_NORTH
  ANIM_BUNNY_HOP_BACK_WHEEL_WEST,   // DIR_WEST
  ANIM_BUNNY_HOP_BACK_WHEEL_EAST,   // DIR_EAST
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_SOUTHWEST
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_SOUTHEAST
  ANIM_BUNNY_HOP_BACK_WHEEL_NORTH,  // DIR_NORTHWEST
  ANIM_BUNNY_HOP_BACK_WHEEL_NORTH,  // DIR_NORTHEAST
];

/** 1:1 décomp `GetFaceDirectionAnimNum` (event_object_movement.c:4495-4498). */
export function GetFaceDirectionAnimNum(direction: number): number {
  return sFaceDirectionAnimNums[direction] ?? ANIM_STD_FACE_SOUTH;
}

/** 1:1 décomp `GetAcroWheelieDirectionAnimNum` (event_object_movement.c:4525). */
export function GetAcroWheelieDirectionAnimNum(direction: number): number {
  return sAcroWheelieDirectionAnimNums[direction] ?? ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionAnimNum` (event_object_movement.c:4500-4503). */
export function GetMoveDirectionAnimNum(direction: number): number {
  return sMoveDirectionAnimNums[direction] ?? ANIM_STD_GO_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionFastAnimNum` (event_object_movement.c:4505-4508). */
export function GetMoveDirectionFastAnimNum(direction: number): number {
  return sMoveDirectionFastAnimNums[direction] ?? ANIM_STD_GO_FAST_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionFasterAnimNum`. */
export function GetMoveDirectionFasterAnimNum(direction: number): number {
  return sMoveDirectionFasterAnimNums[direction] ?? ANIM_STD_GO_FASTER_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionFastestAnimNum`. */
export function GetMoveDirectionFastestAnimNum(direction: number): number {
  return sMoveDirectionFastestAnimNums[direction] ?? ANIM_STD_GO_FASTEST_SOUTH;
}
