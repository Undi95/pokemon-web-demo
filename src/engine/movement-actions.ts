/**
 * movement-actions.ts — 1:1 décomp port `src/event_object_movement.c` dispatch
 * tables `gXMovementActions[]` + accompagnateurs `GetXMovementAction(direction)`.
 *
 *  Pattern décomp (= event_object_movement.c:919-1009 + suivants) :
 *  ```c
 *  const u8 gXMovementActions[] = {
 *      MOVEMENT_ACTION_X_DOWN,  // [0] = fallback (DIR_NONE)
 *      MOVEMENT_ACTION_X_DOWN,  // [1] = DIR_SOUTH
 *      MOVEMENT_ACTION_X_UP,    // [2] = DIR_NORTH
 *      MOVEMENT_ACTION_X_LEFT,  // [3] = DIR_WEST
 *      MOVEMENT_ACTION_X_RIGHT, // [4] = DIR_EAST
 *  };
 *  u8 GetXMovementAction(u32 direction) {
 *      return gXMovementActions[direction];
 *  }
 *  ```
 *
 *  Used par `PlayerStep`, `MovementType_*`, `MovementAction_*` handlers, et
 *  scripts (= applymovement opcode) pour résoudre un movement action ID depuis
 *  une direction.
 */

import {
  MOVEMENT_ACTION_FACE_DOWN,
  MOVEMENT_ACTION_FACE_UP,
  MOVEMENT_ACTION_FACE_LEFT,
  MOVEMENT_ACTION_FACE_RIGHT,
  MOVEMENT_ACTION_WALK_SLOW_DOWN,
  MOVEMENT_ACTION_WALK_SLOW_UP,
  MOVEMENT_ACTION_WALK_SLOW_LEFT,
  MOVEMENT_ACTION_WALK_SLOW_RIGHT,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  MOVEMENT_ACTION_WALK_NORMAL_UP,
  MOVEMENT_ACTION_WALK_NORMAL_LEFT,
  MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
  MOVEMENT_ACTION_WALK_FAST_DOWN,
  MOVEMENT_ACTION_WALK_FAST_UP,
  MOVEMENT_ACTION_WALK_FAST_LEFT,
  MOVEMENT_ACTION_WALK_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_FASTER_DOWN,
  MOVEMENT_ACTION_WALK_FASTER_UP,
  MOVEMENT_ACTION_WALK_FASTER_LEFT,
  MOVEMENT_ACTION_WALK_FASTER_RIGHT,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT,
  MOVEMENT_ACTION_SLIDE_DOWN,
  MOVEMENT_ACTION_SLIDE_UP,
  MOVEMENT_ACTION_SLIDE_LEFT,
  MOVEMENT_ACTION_SLIDE_RIGHT,
  MOVEMENT_ACTION_PLAYER_RUN_DOWN,
  MOVEMENT_ACTION_PLAYER_RUN_UP,
  MOVEMENT_ACTION_PLAYER_RUN_LEFT,
  MOVEMENT_ACTION_PLAYER_RUN_RIGHT,
  MOVEMENT_ACTION_JUMP_2_DOWN,
  MOVEMENT_ACTION_JUMP_2_UP,
  MOVEMENT_ACTION_JUMP_2_LEFT,
  MOVEMENT_ACTION_JUMP_2_RIGHT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP,
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT,
  MOVEMENT_ACTION_JUMP_DOWN,
  MOVEMENT_ACTION_JUMP_UP,
  MOVEMENT_ACTION_JUMP_LEFT,
  MOVEMENT_ACTION_JUMP_RIGHT,
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN,
  MOVEMENT_ACTION_JUMP_SPECIAL_UP,
  MOVEMENT_ACTION_JUMP_SPECIAL_LEFT,
  MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_LEFT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT,
} from './decomp-data/include/constants/event_object_movement-data';

// ─── Dispatch tables 1:1 décomp event_object_movement.c:919-1009+ ──────────

/** 1:1 décomp `gFaceDirectionMovementActions[]` (event_object_movement.c:919-925). */
export const gFaceDirectionMovementActions: readonly number[] = [
  MOVEMENT_ACTION_FACE_DOWN,   // [0] DIR_NONE fallback = DOWN
  MOVEMENT_ACTION_FACE_DOWN,   // [1] DIR_SOUTH
  MOVEMENT_ACTION_FACE_UP,     // [2] DIR_NORTH
  MOVEMENT_ACTION_FACE_LEFT,   // [3] DIR_WEST
  MOVEMENT_ACTION_FACE_RIGHT,  // [4] DIR_EAST
];

/** 1:1 décomp `gWalkSlowMovementActions[]` (event_object_movement.c:926-932). */
export const gWalkSlowMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_SLOW_DOWN,
  MOVEMENT_ACTION_WALK_SLOW_DOWN,
  MOVEMENT_ACTION_WALK_SLOW_UP,
  MOVEMENT_ACTION_WALK_SLOW_LEFT,
  MOVEMENT_ACTION_WALK_SLOW_RIGHT,
];

/** 1:1 décomp `gWalkNormalMovementActions[]` (event_object_movement.c:933-939). */
export const gWalkNormalMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  MOVEMENT_ACTION_WALK_NORMAL_UP,
  MOVEMENT_ACTION_WALK_NORMAL_LEFT,
  MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
];

/** 1:1 décomp `gWalkFastMovementActions[]` (event_object_movement.c:940-946). */
export const gWalkFastMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_FAST_DOWN,
  MOVEMENT_ACTION_WALK_FAST_DOWN,
  MOVEMENT_ACTION_WALK_FAST_UP,
  MOVEMENT_ACTION_WALK_FAST_LEFT,
  MOVEMENT_ACTION_WALK_FAST_RIGHT,
];

/** 1:1 décomp `gRideWaterCurrentMovementActions[]` (event_object_movement.c:947-953). */
export const gRideWaterCurrentMovementActions: readonly number[] = [
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT,
];

/** 1:1 décomp `gWalkFasterMovementActions[]` (event_object_movement.c:954-960). */
export const gWalkFasterMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_FASTER_DOWN,
  MOVEMENT_ACTION_WALK_FASTER_DOWN,
  MOVEMENT_ACTION_WALK_FASTER_UP,
  MOVEMENT_ACTION_WALK_FASTER_LEFT,
  MOVEMENT_ACTION_WALK_FASTER_RIGHT,
];

/** 1:1 décomp `gSlideMovementActions[]` (event_object_movement.c:961-967). */
export const gSlideMovementActions: readonly number[] = [
  MOVEMENT_ACTION_SLIDE_DOWN,
  MOVEMENT_ACTION_SLIDE_DOWN,
  MOVEMENT_ACTION_SLIDE_UP,
  MOVEMENT_ACTION_SLIDE_LEFT,
  MOVEMENT_ACTION_SLIDE_RIGHT,
];

/** 1:1 décomp `gPlayerRunMovementActions[]` (event_object_movement.c:968-974). */
export const gPlayerRunMovementActions: readonly number[] = [
  MOVEMENT_ACTION_PLAYER_RUN_DOWN,
  MOVEMENT_ACTION_PLAYER_RUN_DOWN,
  MOVEMENT_ACTION_PLAYER_RUN_UP,
  MOVEMENT_ACTION_PLAYER_RUN_LEFT,
  MOVEMENT_ACTION_PLAYER_RUN_RIGHT,
];

/** 1:1 décomp `gJump2MovementActions[]` (event_object_movement.c:975-981).
 *  Jump 2 = ledge jump (= MovementAction_Jump2_X). 2 tiles distance. */
export const gJump2MovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_2_DOWN,
  MOVEMENT_ACTION_JUMP_2_DOWN,
  MOVEMENT_ACTION_JUMP_2_UP,
  MOVEMENT_ACTION_JUMP_2_LEFT,
  MOVEMENT_ACTION_JUMP_2_RIGHT,
];

/** 1:1 décomp `gJumpInPlaceMovementActions[]` (event_object_movement.c:982-988). */
export const gJumpInPlaceMovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT,
];

/** 1:1 décomp `gJumpInPlaceTurnAroundMovementActions[]` (event_object_movement.c:989-995). */
export const gJumpInPlaceTurnAroundMovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP,
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT,
];

/** 1:1 décomp `gJumpMovementActions[]` (event_object_movement.c:996-1002). */
export const gJumpMovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_DOWN,
  MOVEMENT_ACTION_JUMP_DOWN,
  MOVEMENT_ACTION_JUMP_UP,
  MOVEMENT_ACTION_JUMP_LEFT,
  MOVEMENT_ACTION_JUMP_RIGHT,
];

/** 1:1 décomp `gJumpSpecialMovementActions[]` (event_object_movement.c:1003-1009).
 *  Jump special = jump with no tile change (= for events like ledge dive into water). */
export const gJumpSpecialMovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN,
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN,
  MOVEMENT_ACTION_JUMP_SPECIAL_UP,
  MOVEMENT_ACTION_JUMP_SPECIAL_LEFT,
  MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT,
];

/** 1:1 décomp `gWalkInPlaceNormalMovementActions[]` (event_object_movement.c). */
export const gWalkInPlaceNormalMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT,
];

/** 1:1 décomp `gWalkInPlaceFastMovementActions[]` (event_object_movement.c).
 *  Used pour `PlayerTurnInPlace` (= 8 frames turn anim). */
export const gWalkInPlaceFastMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT,
];

/** 1:1 décomp `gWalkInPlaceFasterMovementActions[]` (event_object_movement.c). */
export const gWalkInPlaceFasterMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_LEFT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT,
];

// ─── Getters 1:1 décomp (= inline functions dans le décomp) ────────────────

/** 1:1 décomp `GetFaceDirectionMovementAction(direction)` (= lookup table). */
export function GetFaceDirectionMovementAction(direction: number): number {
  return gFaceDirectionMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkSlowMovementAction(direction)`. */
export function GetWalkSlowMovementAction(direction: number): number {
  return gWalkSlowMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkNormalMovementAction(direction)`. */
export function GetWalkNormalMovementAction(direction: number): number {
  return gWalkNormalMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkFastMovementAction(direction)`. */
export function GetWalkFastMovementAction(direction: number): number {
  return gWalkFastMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkFasterMovementAction(direction)`. */
export function GetWalkFasterMovementAction(direction: number): number {
  return gWalkFasterMovementActions[direction]!;
}

/** 1:1 décomp `GetRideWaterCurrentMovementAction(direction)`. */
export function GetRideWaterCurrentMovementAction(direction: number): number {
  return gRideWaterCurrentMovementActions[direction]!;
}

/** 1:1 décomp `GetSlideMovementAction(direction)`. */
export function GetSlideMovementAction(direction: number): number {
  return gSlideMovementActions[direction]!;
}

/** 1:1 décomp `GetPlayerRunMovementAction(direction)`. */
export function GetPlayerRunMovementAction(direction: number): number {
  return gPlayerRunMovementActions[direction]!;
}

/** 1:1 décomp `GetJump2MovementAction(direction)`. */
export function GetJump2MovementAction(direction: number): number {
  return gJump2MovementActions[direction]!;
}

/** 1:1 décomp `GetJumpMovementAction(direction)`. */
export function GetJumpMovementAction(direction: number): number {
  return gJumpMovementActions[direction]!;
}

/** 1:1 décomp `GetJumpSpecialMovementAction(direction)`. */
export function GetJumpSpecialMovementAction(direction: number): number {
  return gJumpSpecialMovementActions[direction]!;
}

/** 1:1 décomp `GetJumpInPlaceMovementAction(direction)`. */
export function GetJumpInPlaceMovementAction(direction: number): number {
  return gJumpInPlaceMovementActions[direction]!;
}

/** 1:1 décomp `GetJumpInPlaceTurnAroundMovementAction(direction)`. */
export function GetJumpInPlaceTurnAroundMovementAction(direction: number): number {
  return gJumpInPlaceTurnAroundMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkInPlaceNormalMovementAction(direction)`. */
export function GetWalkInPlaceNormalMovementAction(direction: number): number {
  return gWalkInPlaceNormalMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkInPlaceFastMovementAction(direction)`.
 *  Used par PlayerStep TURN_DIRECTION path (= 8 frames turn anim). */
export function GetWalkInPlaceFastMovementAction(direction: number): number {
  return gWalkInPlaceFastMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkInPlaceFasterMovementAction(direction)`. */
export function GetWalkInPlaceFasterMovementAction(direction: number): number {
  return gWalkInPlaceFasterMovementActions[direction]!;
}

/** 1:1 décomp `GetWalkInPlaceSlowMovementAction(direction)`.
 *  Used par `PlayerNotOnBikeCollide` (= 32 frames slow walk anim = "bump"). */
export function GetWalkInPlaceSlowMovementAction(direction: number): number {
  // Walk in place slow = same as normal walk-in-place at 32 frames (= identique
  // walk normal table mais durée différente côté MovementAction handler).
  return gWalkInPlaceNormalMovementActions[direction]!;
}
