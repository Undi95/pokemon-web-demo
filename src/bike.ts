// 1:1 STRICT mirror de `src/bike.c` (pokeemerald) — sous-système vélo (Mach + Acro).
//
// Une « bike transition » est un callback qui modifie la direction/le momentum du vélo.
// Le Mach n'a PAS de input handler (les transitions sont calculées directement) ; l'Acro
// a des input handlers (sAcroBikeInputHandlers) car il a besoin des boutons pour ses tricks
// (wheelie, bunny hop, side jump, turn jump).
//
// Câblé 1:1 : `MovePlayerOnBike` est appelé par `MovePlayerAvatarUsingKeypadInput`
// (field_player_avatar.c → player-avatar.ts) quand gPlayerAvatar.flags porte MACH/ACRO_BIKE.
// `GetOnOffBike` est appelé par `ItemUseOnFieldCB_Bike` (item_use.c → bag-menu-ctx.ts).

import {
  gPlayerAvatar,
  GetPlayerMovementDirection,
  GetPlayerFacingDirection,
  PlayerGetDestCoords,
  TestPlayerAvatarFlags,
  SetPlayerAvatarTransitionFlags,
  CheckForObjectEventCollision,
  PlayerSetAnimId,
  PlayerFaceDirection,
  PlayerTurnInPlace,
  PlayerJumpLedge,
  PlayerWalkNormal,
  PlayerWalkFast,
  PlayerWalkFaster,
  PlayerRideWaterCurrent,
  PlayerOnBikeCollide,
  PlayerOnBikeCollideWithFarawayIslandMew,
  IsPlayerCollidingWithFarawayIslandMew,
  PlayerStartWheelie,
  PlayerEndWheelie,
  PlayerIdleWheelie,
  PlayerStandingHoppingWheelie,
  PlayerMovingHoppingWheelie,
  PlayerLedgeHoppingWheelie,
  PlayerAcroTurnJump,
  PlayerWheelieInPlace,
  PlayerPopWheelieWhileMoving,
  PlayerWheelieMove,
  PlayerEndWheelieWhileMoving,
  PlayerUseAcroBikeOnBumpySlope,
} from './field_player_avatar';
import { gObjectEvents, SetObjectEventDirection } from './event_object_movement';
import {
  COLLISION_OBJECT_EVENT, COLLISION_STOP_SURFING, COLLISION_LEDGE_JUMP,
  COLLISION_PUSHED_BOULDER, COLLISION_ROTATING_GATE, COLLISION_WHEELIE_HOP,
  COLLISION_ISOLATED_VERTICAL_RAIL, COLLISION_ISOLATED_HORIZONTAL_RAIL,
  COLLISION_VERTICAL_RAIL, COLLISION_HORIZONTAL_RAIL, COLLISION_NONE,
  COLLISION_IMPASSABLE, GetJumpMovementAction,
} from './event_object_movement';
import { MoveCoords, GetOppositeDirection } from './engine/field/direction-coords';
import { MAP_TYPE_INDOOR } from '../include/constants/map_types';
import { gMapHeader, MapGridGetMetatileBehaviorAt } from './fieldmap';
import {
  MetatileBehavior_IsBumpySlope, MetatileBehavior_IsVerticalRail,
  MetatileBehavior_IsHorizontalRail, MetatileBehavior_IsIsolatedVerticalRail,
  MetatileBehavior_IsIsolatedHorizontalRail, MetatileBehavior_IsRunningDisallowed,
  MetatileBehavior_IsFortreeBridge,
} from './metatile_behavior';
import { PlayerGetElevation } from './field_player_avatar';
import {
  Overworld_ClearSavedMusic, Overworld_PlaySpecialMapMusic,
  Overworld_SetSavedMusic, Overworld_ChangeMusicTo,
} from './overworld';
import { gBikeCycling } from './field_specials';
import { MUS_CYCLING } from '../include/constants/songs';
import { SE_BIKE_HOP } from '../include/constants/songs';
import { PlaySE } from '../harness/runtime/decomp-globals';
import { DIR_NORTH, DIR_SOUTH, DIR_WEST, DIR_EAST, DIR_NONE } from './engine/field/direction-coords';
import { DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, A_BUTTON, B_BUTTON, SELECT_BUTTON, START_BUTTON } from './engine/decomp-data/include/gba/io_reg-data';
import {
  PLAYER_AVATAR_FLAG_ON_FOOT, PLAYER_AVATAR_FLAG_MACH_BIKE, PLAYER_AVATAR_FLAG_ACRO_BIKE,
  PLAYER_AVATAR_FLAG_SURFING, PLAYER_AVATAR_FLAG_UNDERWATER, PLAYER_AVATAR_FLAG_DASH,
  NOT_MOVING, MOVING, TURN_DIRECTION,
} from './field_player_avatar';
import type { ObjectEvent } from './event_object_movement';

// ─── bike.h enums ────────────────────────────────────────────────────────────
import { ENUM_PLAYER_0, ENUM_MACH_1, ENUM_ACRO_2, ENUM_ACRO_3 } from './engine/decomp-data/include/bike-data';
const { PLAYER_SPEED_STANDING, PLAYER_SPEED_NORMAL, PLAYER_SPEED_FAST, PLAYER_SPEED_FASTER, PLAYER_SPEED_FASTEST } = ENUM_PLAYER_0;
const { MACH_TRANS_FACE_DIRECTION, MACH_TRANS_TURN_DIRECTION, MACH_TRANS_KEEP_MOVING, MACH_TRANS_START_MOVING } = ENUM_MACH_1;
const { ACRO_STATE_NORMAL, ACRO_STATE_TURNING, ACRO_STATE_WHEELIE_STANDING, ACRO_STATE_BUNNY_HOP, ACRO_STATE_WHEELIE_MOVING, ACRO_STATE_SIDE_JUMP, ACRO_STATE_TURN_JUMP } = ENUM_ACRO_2;
const {
  ACRO_TRANS_FACE_DIRECTION, ACRO_TRANS_TURN_DIRECTION, ACRO_TRANS_MOVING,
  ACRO_TRANS_NORMAL_TO_WHEELIE, ACRO_TRANS_WHEELIE_TO_NORMAL, ACRO_TRANS_WHEELIE_IDLE,
  ACRO_TRANS_WHEELIE_HOPPING_STANDING, ACRO_TRANS_WHEELIE_HOPPING_MOVING,
  ACRO_TRANS_SIDE_JUMP, ACRO_TRANS_TURN_JUMP, ACRO_TRANS_WHEELIE_MOVING,
  ACRO_TRANS_WHEELIE_RISING_MOVING, ACRO_TRANS_WHEELIE_LOWERING_MOVING,
} = ENUM_ACRO_3;

const COPY_MOVE_WALK = 1;  // 1:1 décomp constants/event_objects.h

// ─── const rom data ──────────────────────────────────────────────────────────

// Face vs Turn : Face n'a pas d'anim, Turn oui (et Turn check la collision → bonk SE).
const sMachBikeTransitions: ReadonlyArray<(direction: number) => void> = [
  MachBikeTransition_FaceDirection,
  MachBikeTransition_TurnDirection,
  MachBikeTransition_TrySpeedUp,
  MachBikeTransition_TrySlowDown,
];

// bikeFrameCounter (index) → callback de vitesse (selon sMachBikeSpeeds).
const sMachBikeSpeedCallbacks: ReadonlyArray<(direction: number) => void> = [
  PlayerWalkNormal,
  PlayerWalkFast,
  PlayerWalkFaster,
];

const sAcroBikeTransitions: ReadonlyArray<(direction: number) => void> = [
  AcroBikeTransition_FaceDirection,
  AcroBikeTransition_TurnDirection,
  AcroBikeTransition_Moving,
  AcroBikeTransition_NormalToWheelie,
  AcroBikeTransition_WheelieToNormal,
  AcroBikeTransition_WheelieIdle,
  AcroBikeTransition_WheelieHoppingStanding,
  AcroBikeTransition_WheelieHoppingMoving,
  AcroBikeTransition_SideJump,
  AcroBikeTransition_TurnJump,
  AcroBikeTransition_WheelieMoving,
  AcroBikeTransition_WheelieRisingMoving,
  AcroBikeTransition_WheelieLoweringMoving,
];

const sAcroBikeInputHandlers: ReadonlyArray<(newDirection: { value: number }, newKeys: number, heldKeys: number) => number> = [
  AcroBikeHandleInputNormal,
  AcroBikeHandleInputTurning,
  AcroBikeHandleInputWheelieStanding,
  AcroBikeHandleInputBunnyHop,
  AcroBikeHandleInputWheelieMoving,
  AcroBikeHandleInputSidewaysJump,
  AcroBikeHandleInputTurnJump,
];

// used with bikeFrameCounter from mach bike
const sMachBikeSpeeds: ReadonlyArray<number> = [PLAYER_SPEED_NORMAL, PLAYER_SPEED_FAST, PLAYER_SPEED_FASTEST];

// liste de timers comparés ; terminée par 0. Le seul timer comparé = 4 frames.
const sAcroBikeJumpTimerList: ReadonlyArray<number> = [4, 0];

interface BikeHistoryInputInfo {
  dirHistoryMatch: number;
  abStartSelectHistoryMatch: number;
  dirHistoryMask: number;
  abStartSelectHistoryMask: number;
  dirTimerHistoryList: ReadonlyArray<number>;
  abStartSelectHistoryList: ReadonlyArray<number>;
  direction: number;
}

// le 0xF masque chaque octet de l'historique pour ne checker que la dernière entrée.
const sAcroBikeTricksList: ReadonlyArray<BikeHistoryInputInfo> = [
  { dirHistoryMatch: DIR_SOUTH, abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xF, abStartSelectHistoryMask: 0xF, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_SOUTH },
  { dirHistoryMatch: DIR_NORTH, abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xF, abStartSelectHistoryMask: 0xF, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_NORTH },
  { dirHistoryMatch: DIR_WEST,  abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xF, abStartSelectHistoryMask: 0xF, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_WEST },
  { dirHistoryMatch: DIR_EAST,  abStartSelectHistoryMatch: B_BUTTON, dirHistoryMask: 0xF, abStartSelectHistoryMask: 0xF, dirTimerHistoryList: sAcroBikeJumpTimerList, abStartSelectHistoryList: sAcroBikeJumpTimerList, direction: DIR_EAST },
];

// ─── code ────────────────────────────────────────────────────────────────────

export function MovePlayerOnBike(direction: number, newKeys: number, heldKeys: number): void {
  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_MACH_BIKE)
    MovePlayerOnMachBike(direction, newKeys, heldKeys);
  else
    MovePlayerOnAcroBike(direction, newKeys, heldKeys);
}

function MovePlayerOnMachBike(direction: number, _newKeys: number, _heldKeys: number): void {
  // GetMachBikeTransition prend &direction (in/out) — on passe par un box {value}.
  const dirBox = { value: direction };
  sMachBikeTransitions[GetMachBikeTransition(dirBox)](dirBox.value);
}

// dirTraveling = 0 quand le joueur est à l'arrêt.
function GetMachBikeTransition(dirTraveling: { value: number }): number {
  const direction = GetPlayerMovementDirection();

  if (dirTraveling.value === 0) {
    dirTraveling.value = direction;  // on a soit fait face soit démarré.
    if (gPlayerAvatar.bikeSpeed === PLAYER_SPEED_STANDING) {
      gPlayerAvatar.runningState = NOT_MOVING;
      return MACH_TRANS_FACE_DIRECTION;
    }
    gPlayerAvatar.runningState = MOVING;
    return MACH_TRANS_START_MOVING;
  }

  if (dirTraveling.value !== direction && gPlayerAvatar.runningState !== MOVING) {
    if (gPlayerAvatar.bikeSpeed !== PLAYER_SPEED_STANDING) {
      dirTraveling.value = direction;
      gPlayerAvatar.runningState = MOVING;
      return MACH_TRANS_START_MOVING;
    }
    gPlayerAvatar.runningState = TURN_DIRECTION;
    return MACH_TRANS_TURN_DIRECTION;
  } else {
    gPlayerAvatar.runningState = MOVING;
    return MACH_TRANS_KEEP_MOVING;
  }
}

function MachBikeTransition_FaceDirection(direction: number): void {
  PlayerFaceDirection(direction);
  Bike_SetBikeStill();
}

function MachBikeTransition_TurnDirection(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior)) {
    PlayerTurnInPlace(direction);
    Bike_SetBikeStill();
  } else {
    MachBikeTransition_FaceDirection(playerObjEvent.facingDirection);
  }
}

function MachBikeTransition_TrySpeedUp(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  let collision: number;

  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false) {
    if (gPlayerAvatar.bikeSpeed)
      MachBikeTransition_TrySlowDown(playerObjEvent.movementDirection);
    else
      MachBikeTransition_FaceDirection(playerObjEvent.movementDirection);
  } else {
    collision = GetBikeCollision(direction);
    if (collision > 0 && collision < COLLISION_VERTICAL_RAIL) {
      if (collision === COLLISION_LEDGE_JUMP) {
        PlayerJumpLedge(direction);
      } else {
        Bike_SetBikeStill();
        if (collision === COLLISION_OBJECT_EVENT && IsPlayerCollidingWithFarawayIslandMew(direction))
          PlayerOnBikeCollideWithFarawayIslandMew(direction);
        else if (collision < COLLISION_STOP_SURFING || collision > COLLISION_ROTATING_GATE)
          PlayerOnBikeCollide(direction);
      }
    } else {
      // rien ne nous ralentit → callback d'avancement (selon bikeFrameCounter) + accel.
      sMachBikeSpeedCallbacks[gPlayerAvatar.bikeFrameCounter](direction);
      gPlayerAvatar.bikeSpeed = gPlayerAvatar.bikeFrameCounter + (gPlayerAvatar.bikeFrameCounter >> 1);
      if (gPlayerAvatar.bikeFrameCounter < 2)
        gPlayerAvatar.bikeFrameCounter++;
    }
  }
}

function MachBikeTransition_TrySlowDown(direction: number): void {
  let collision: number;

  if (gPlayerAvatar.bikeSpeed !== PLAYER_SPEED_STANDING)
    gPlayerAvatar.bikeFrameCounter = --gPlayerAvatar.bikeSpeed;

  collision = GetBikeCollision(direction);

  if (collision > 0 && collision < COLLISION_VERTICAL_RAIL) {
    if (collision === COLLISION_LEDGE_JUMP) {
      PlayerJumpLedge(direction);
    } else {
      Bike_SetBikeStill();
      if (collision === COLLISION_OBJECT_EVENT && IsPlayerCollidingWithFarawayIslandMew(direction))
        PlayerOnBikeCollideWithFarawayIslandMew(direction);
      else if (collision < COLLISION_STOP_SURFING || collision > COLLISION_ROTATING_GATE)
        PlayerOnBikeCollide(direction);
    }
  } else {
    sMachBikeSpeedCallbacks[gPlayerAvatar.bikeFrameCounter](direction);
  }
}

// l'acro a besoin de l'input handler exécuté avant la transition.
function MovePlayerOnAcroBike(newDirection: number, newKeys: number, heldKeys: number): void {
  const dirBox = { value: newDirection };
  sAcroBikeTransitions[CheckMovementInputAcroBike(dirBox, newKeys, heldKeys)](dirBox.value);
}

function CheckMovementInputAcroBike(newDirection: { value: number }, newKeys: number, heldKeys: number): number {
  return sAcroBikeInputHandlers[gPlayerAvatar.acroBikeState](newDirection, newKeys, heldKeys);
}

function AcroBikeHandleInputNormal(newDirection: { value: number }, newKeys: number, heldKeys: number): number {
  const direction = GetPlayerMovementDirection();

  gPlayerAvatar.bikeFrameCounter = 0;
  if (newDirection.value === DIR_NONE) {
    if (newKeys & B_BUTTON) {
      // À l'arrêt + B → wheelie.
      newDirection.value = direction;
      gPlayerAvatar.runningState = NOT_MOVING;
      gPlayerAvatar.acroBikeState = ACRO_STATE_WHEELIE_STANDING;
      return ACRO_TRANS_NORMAL_TO_WHEELIE;
    } else {
      newDirection.value = direction;
      gPlayerAvatar.runningState = NOT_MOVING;
      return ACRO_TRANS_FACE_DIRECTION;
    }
  }
  if (newDirection.value === direction && (heldKeys & B_BUTTON) && gPlayerAvatar.bikeSpeed === PLAYER_SPEED_STANDING) {
    gPlayerAvatar.bikeSpeed++;
    gPlayerAvatar.acroBikeState = ACRO_STATE_WHEELIE_MOVING;
    return ACRO_TRANS_WHEELIE_RISING_MOVING;
  }
  if (newDirection.value !== direction && gPlayerAvatar.runningState !== MOVING) {
    gPlayerAvatar.acroBikeState = ACRO_STATE_TURNING;
    gPlayerAvatar.newDirBackup = newDirection.value;
    gPlayerAvatar.runningState = NOT_MOVING;
    return CheckMovementInputAcroBike(newDirection, newKeys, heldKeys);
  }
  gPlayerAvatar.runningState = MOVING;
  return ACRO_TRANS_MOVING;
}

function AcroBikeHandleInputTurning(newDirection: { value: number }, newKeys: number, heldKeys: number): number {
  let direction: number;

  newDirection.value = gPlayerAvatar.newDirBackup;
  gPlayerAvatar.bikeFrameCounter++;

  // attendre 6 frames avant de changer réellement de direction (= 6 frames pour 1 tuile).
  if (gPlayerAvatar.bikeFrameCounter > 6) {
    gPlayerAvatar.runningState = TURN_DIRECTION;
    gPlayerAvatar.acroBikeState = ACRO_STATE_NORMAL;
    Bike_SetBikeStill();
    return ACRO_TRANS_TURN_DIRECTION;
  }
  direction = GetPlayerMovementDirection();
  if (newDirection.value === AcroBike_GetJumpDirection()) {
    Bike_SetBikeStill();
    gPlayerAvatar.bikeSpeed = PLAYER_SPEED_NORMAL;
    if (newDirection.value === GetOppositeDirection(direction)) {
      gPlayerAvatar.acroBikeState = ACRO_STATE_TURN_JUMP;
      return ACRO_TRANS_TURN_JUMP;
    } else {
      gPlayerAvatar.runningState = MOVING;
      gPlayerAvatar.acroBikeState = ACRO_STATE_SIDE_JUMP;
      return ACRO_TRANS_SIDE_JUMP;
    }
  }
  newDirection.value = direction;
  return ACRO_TRANS_FACE_DIRECTION;
}

function AcroBikeHandleInputWheelieStanding(newDirection: { value: number }, _newKeys: number, heldKeys: number): number {
  const direction = GetPlayerMovementDirection();
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  gPlayerAvatar.runningState = NOT_MOVING;

  if (heldKeys & B_BUTTON) {
    gPlayerAvatar.bikeFrameCounter++;
  } else {
    // B relâché.
    gPlayerAvatar.bikeFrameCounter = 0;
    if (!MetatileBehavior_IsBumpySlope(playerObjEvent.currentMetatileBehavior)) {
      newDirection.value = direction;
      gPlayerAvatar.acroBikeState = ACRO_STATE_NORMAL;
      Bike_SetBikeStill();
      return ACRO_TRANS_WHEELIE_TO_NORMAL;
    }
  }
  if (gPlayerAvatar.bikeFrameCounter >= 40) {
    newDirection.value = direction;
    gPlayerAvatar.acroBikeState = ACRO_STATE_BUNNY_HOP;
    Bike_SetBikeStill();
    return ACRO_TRANS_WHEELIE_HOPPING_STANDING;
  }
  if (newDirection.value === direction) {
    gPlayerAvatar.runningState = MOVING;
    gPlayerAvatar.acroBikeState = ACRO_STATE_WHEELIE_MOVING;
    Bike_SetBikeStill();
    return ACRO_TRANS_WHEELIE_MOVING;
  }
  if (newDirection.value === 0) {
    newDirection.value = direction;
    return ACRO_TRANS_WHEELIE_IDLE;
  }
  gPlayerAvatar.runningState = TURN_DIRECTION;
  return ACRO_TRANS_WHEELIE_IDLE;
}

function AcroBikeHandleInputBunnyHop(newDirection: { value: number }, newKeys: number, heldKeys: number): number {
  const direction = GetPlayerMovementDirection();
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!(heldKeys & B_BUTTON)) {
    // B relâché.
    Bike_SetBikeStill();
    if (MetatileBehavior_IsBumpySlope(playerObjEvent.currentMetatileBehavior)) {
      gPlayerAvatar.acroBikeState = ACRO_STATE_WHEELIE_STANDING;
      return CheckMovementInputAcroBike(newDirection, newKeys, heldKeys);
    } else {
      newDirection.value = direction;
      gPlayerAvatar.runningState = NOT_MOVING;
      gPlayerAvatar.acroBikeState = ACRO_STATE_NORMAL;
      return ACRO_TRANS_WHEELIE_TO_NORMAL;
    }
  }

  // B toujours tenu.
  if (newDirection.value === DIR_NONE) {
    newDirection.value = direction;
    gPlayerAvatar.runningState = NOT_MOVING;
    return ACRO_TRANS_WHEELIE_HOPPING_STANDING;
  }
  if (newDirection.value !== direction && gPlayerAvatar.runningState !== MOVING) {
    gPlayerAvatar.runningState = TURN_DIRECTION;
    return ACRO_TRANS_WHEELIE_HOPPING_STANDING;
  }
  gPlayerAvatar.runningState = MOVING;
  return ACRO_TRANS_WHEELIE_HOPPING_MOVING;
}

function AcroBikeHandleInputWheelieMoving(newDirection: { value: number }, newKeys: number, heldKeys: number): number {
  const direction = GetPlayerFacingDirection();
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!(heldKeys & B_BUTTON)) {
    Bike_SetBikeStill();
    if (!MetatileBehavior_IsBumpySlope(playerObjEvent.currentMetatileBehavior)) {
      gPlayerAvatar.acroBikeState = ACRO_STATE_NORMAL;
      if (newDirection.value === DIR_NONE) {
        newDirection.value = direction;
        gPlayerAvatar.runningState = NOT_MOVING;
        return ACRO_TRANS_WHEELIE_TO_NORMAL;
      }
      if (newDirection.value !== direction && gPlayerAvatar.runningState !== MOVING) {
        gPlayerAvatar.runningState = NOT_MOVING;
        return ACRO_TRANS_WHEELIE_TO_NORMAL;
      }
      gPlayerAvatar.runningState = MOVING;
      return ACRO_TRANS_WHEELIE_LOWERING_MOVING;
    }
    gPlayerAvatar.acroBikeState = ACRO_STATE_WHEELIE_STANDING;
    return CheckMovementInputAcroBike(newDirection, newKeys, heldKeys);
  }
  // B toujours tenu.
  if (newDirection.value === DIR_NONE) {
    newDirection.value = direction;
    gPlayerAvatar.acroBikeState = ACRO_STATE_WHEELIE_STANDING;
    gPlayerAvatar.runningState = NOT_MOVING;
    Bike_SetBikeStill();
    return ACRO_TRANS_WHEELIE_IDLE;
  }
  if (direction !== newDirection.value && gPlayerAvatar.runningState !== MOVING) {
    gPlayerAvatar.runningState = NOT_MOVING;
    return ACRO_TRANS_WHEELIE_IDLE;
  }
  gPlayerAvatar.runningState = MOVING;
  return ACRO_TRANS_WHEELIE_MOVING;
}

function AcroBikeHandleInputSidewaysJump(ptr: { value: number }, newKeys: number, heldKeys: number): number {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];

  playerObjEvent.facingDirectionLocked = false;
  SetObjectEventDirection(playerObjEvent, playerObjEvent.facingDirection);
  gPlayerAvatar.acroBikeState = ACRO_STATE_NORMAL;
  return CheckMovementInputAcroBike(ptr, newKeys, heldKeys);
}

function AcroBikeHandleInputTurnJump(ptr: { value: number }, newKeys: number, heldKeys: number): number {
  gPlayerAvatar.acroBikeState = ACRO_STATE_NORMAL;
  return CheckMovementInputAcroBike(ptr, newKeys, heldKeys);
}

function AcroBikeTransition_FaceDirection(direction: number): void {
  PlayerFaceDirection(direction);
}

function AcroBikeTransition_TurnDirection(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false)
    direction = playerObjEvent.movementDirection;
  PlayerFaceDirection(direction);
}

function AcroBikeTransition_Moving(direction: number): void {
  let collision: number;
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];

  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false) {
    AcroBikeTransition_FaceDirection(playerObjEvent.movementDirection);
    return;
  }
  collision = GetBikeCollision(direction);
  if (collision > 0 && collision < COLLISION_VERTICAL_RAIL) {
    if (collision === COLLISION_LEDGE_JUMP)
      PlayerJumpLedge(direction);
    else if (collision === COLLISION_OBJECT_EVENT && IsPlayerCollidingWithFarawayIslandMew(direction))
      PlayerOnBikeCollideWithFarawayIslandMew(direction);
    else if (collision < COLLISION_STOP_SURFING || collision > COLLISION_ROTATING_GATE)
      PlayerOnBikeCollide(direction);
  } else {
    PlayerRideWaterCurrent(direction);
  }
}

function AcroBikeTransition_NormalToWheelie(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false)
    direction = playerObjEvent.movementDirection;
  PlayerStartWheelie(direction);
}

function AcroBikeTransition_WheelieToNormal(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false)
    direction = playerObjEvent.movementDirection;
  PlayerEndWheelie(direction);
}

function AcroBikeTransition_WheelieIdle(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false)
    direction = playerObjEvent.movementDirection;
  PlayerIdleWheelie(direction);
}

function AcroBikeTransition_WheelieHoppingStanding(direction: number): void {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false)
    direction = playerObjEvent.movementDirection;
  PlayerStandingHoppingWheelie(direction);
}

function AcroBikeTransition_WheelieHoppingMoving(direction: number): void {
  let collision: number;
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];

  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false) {
    AcroBikeTransition_WheelieHoppingStanding(playerObjEvent.movementDirection);
    return;
  }
  collision = GetBikeCollision(direction);
  if (collision && collision !== COLLISION_WHEELIE_HOP) {
    if (collision === COLLISION_LEDGE_JUMP) {
      PlayerLedgeHoppingWheelie(direction);
      return;
    }
    if (collision >= COLLISION_STOP_SURFING && collision <= COLLISION_ROTATING_GATE) {
      return;
    }
    if (collision < COLLISION_VERTICAL_RAIL) {
      AcroBikeTransition_WheelieHoppingStanding(direction);
      return;
    }
  }
  PlayerMovingHoppingWheelie(direction);
}

function AcroBikeTransition_SideJump(direction: number): void {
  let collision: number;
  let playerObjEvent: ObjectEvent;

  collision = GetBikeCollision(direction);
  if (collision) {
    if (collision === COLLISION_PUSHED_BOULDER)
      return;
    if (collision < COLLISION_ISOLATED_VERTICAL_RAIL) {
      AcroBikeTransition_TurnDirection(direction);
      return;
    }
    if (WillPlayerCollideWithCollision(collision, direction) === false) {
      AcroBikeTransition_TurnDirection(direction);
      return;
    }
  }
  playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  PlaySE(SE_BIKE_HOP);
  playerObjEvent.facingDirectionLocked = true;
  PlayerSetAnimId(GetJumpMovementAction(direction), COPY_MOVE_WALK);
}

function AcroBikeTransition_TurnJump(direction: number): void {
  PlayerAcroTurnJump(direction);
}

function AcroBikeTransition_WheelieMoving(direction: number): void {
  let collision: number;
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];

  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false) {
    PlayerIdleWheelie(playerObjEvent.movementDirection);
    return;
  }
  collision = GetBikeCollision(direction);
  if (collision > 0 && collision < COLLISION_VERTICAL_RAIL) {
    if (collision === COLLISION_LEDGE_JUMP) {
      PlayerLedgeHoppingWheelie(direction);
    } else if (collision === COLLISION_WHEELIE_HOP) {
      PlayerIdleWheelie(direction);
    } else if (collision < COLLISION_STOP_SURFING) {
      if (MetatileBehavior_IsBumpySlope(playerObjEvent.currentMetatileBehavior))
        PlayerIdleWheelie(direction);
      else
        PlayerWheelieInPlace(direction);
    }
    return;
  }
  PlayerWheelieMove(direction);
  gPlayerAvatar.runningState = MOVING;
}

function AcroBikeTransition_WheelieRisingMoving(direction: number): void {
  let collision: number;
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];

  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false) {
    PlayerStartWheelie(playerObjEvent.movementDirection);
    return;
  }
  collision = GetBikeCollision(direction);
  if (collision > 0 && collision < COLLISION_VERTICAL_RAIL) {
    if (collision === COLLISION_LEDGE_JUMP) {
      PlayerLedgeHoppingWheelie(direction);
    } else if (collision === COLLISION_WHEELIE_HOP) {
      PlayerIdleWheelie(direction);
    } else if (collision < COLLISION_STOP_SURFING) {
      if (MetatileBehavior_IsBumpySlope(playerObjEvent.currentMetatileBehavior))
        PlayerIdleWheelie(direction);
      else
        PlayerWheelieInPlace(direction);
    }
    return;
  }
  PlayerPopWheelieWhileMoving(direction);
  gPlayerAvatar.runningState = MOVING;
}

function AcroBikeTransition_WheelieLoweringMoving(direction: number): void {
  let collision: number;
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];

  if (CanBikeFaceDirOnMetatile(direction, playerObjEvent.currentMetatileBehavior) === false) {
    PlayerEndWheelie(playerObjEvent.movementDirection);
    return;
  }
  collision = GetBikeCollision(direction);
  if (collision > 0 && collision < COLLISION_VERTICAL_RAIL) {
    if (collision === COLLISION_LEDGE_JUMP)
      PlayerJumpLedge(direction);
    else if (collision < COLLISION_STOP_SURFING || collision > COLLISION_ROTATING_GATE)
      PlayerEndWheelie(direction);
    return;
  }
  PlayerEndWheelieWhileMoving(direction);
}

export function Bike_TryAcroBikeHistoryUpdate(newKeys: number, heldKeys: number): void {
  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_ACRO_BIKE)
    AcroBike_TryHistoryUpdate(newKeys, heldKeys);
}

function AcroBike_TryHistoryUpdate(_newKeys: number, heldKeys: number): void {  // newKeys unused
  let direction = Bike_DPadToDirection(heldKeys);

  if (direction === (gPlayerAvatar.directionHistory & 0xF)) {
    if (gPlayerAvatar.dirTimerHistory[0] < 0xFF)
      gPlayerAvatar.dirTimerHistory[0]++;
  } else {
    Bike_UpdateDirTimerHistory(direction);
    gPlayerAvatar.bikeSpeed = PLAYER_SPEED_STANDING;
  }

  direction = heldKeys & (A_BUTTON | B_BUTTON | SELECT_BUTTON | START_BUTTON);  // réutilisé.
  if (direction === (gPlayerAvatar.abStartSelectHistory & 0xF)) {
    if (gPlayerAvatar.abStartSelectTimerHistory[0] < 0xFF)
      gPlayerAvatar.abStartSelectTimerHistory[0]++;
  } else {
    Bike_UpdateABStartSelectHistory(direction);
    gPlayerAvatar.bikeSpeed = PLAYER_SPEED_STANDING;
  }
}

function HasPlayerInputTakenLongerThanList(dirTimerList: ReadonlyArray<number>, abStartSelectTimerList: ReadonlyArray<number>): boolean {
  let i: number;
  for (i = 0; dirTimerList[i] !== 0; i++) {
    if (gPlayerAvatar.dirTimerHistory[i] > dirTimerList[i])
      return false;
  }
  for (i = 0; abStartSelectTimerList[i] !== 0; i++) {
    if (gPlayerAvatar.abStartSelectTimerHistory[i] > abStartSelectTimerList[i])
      return false;
  }
  return true;
}

function AcroBike_GetJumpDirection(): number {
  for (let i = 0; i < sAcroBikeTricksList.length; i++) {
    const historyInputInfo = sAcroBikeTricksList[i];
    let dirHistory = gPlayerAvatar.directionHistory;
    let abStartSelectHistory = gPlayerAvatar.abStartSelectHistory;

    dirHistory &= historyInputInfo.dirHistoryMask;
    abStartSelectHistory &= historyInputInfo.abStartSelectHistoryMask;
    if (dirHistory === historyInputInfo.dirHistoryMatch && abStartSelectHistory === historyInputInfo.abStartSelectHistoryMatch
      && HasPlayerInputTakenLongerThanList(historyInputInfo.dirTimerHistoryList, historyInputInfo.abStartSelectHistoryList))
      return historyInputInfo.direction;
  }
  return 0;
}

function Bike_UpdateDirTimerHistory(dir: number): void {
  gPlayerAvatar.directionHistory = ((gPlayerAvatar.directionHistory << 4) | (dir & 0xF)) >>> 0;

  for (let i = gPlayerAvatar.dirTimerHistory.length - 1; i !== 0; i--)
    gPlayerAvatar.dirTimerHistory[i] = gPlayerAvatar.dirTimerHistory[i - 1];
  gPlayerAvatar.dirTimerHistory[0] = 1;
}

function Bike_UpdateABStartSelectHistory(input: number): void {
  gPlayerAvatar.abStartSelectHistory = ((gPlayerAvatar.abStartSelectHistory << 4) | (input & 0xF)) >>> 0;

  for (let i = gPlayerAvatar.abStartSelectTimerHistory.length - 1; i !== 0; i--)
    gPlayerAvatar.abStartSelectTimerHistory[i] = gPlayerAvatar.abStartSelectTimerHistory[i - 1];
  gPlayerAvatar.abStartSelectTimerHistory[0] = 1;
}

function Bike_DPadToDirection(heldKeys: number): number {
  if (heldKeys & DPAD_UP)    return DIR_NORTH;
  if (heldKeys & DPAD_DOWN)  return DIR_SOUTH;
  if (heldKeys & DPAD_LEFT)  return DIR_WEST;
  if (heldKeys & DPAD_RIGHT) return DIR_EAST;
  return DIR_NONE;
}

function GetBikeCollision(direction: number): number {
  const playerObjEvent = gObjectEvents[gPlayerAvatar.objectEventId];
  const nc = MoveCoords(direction, playerObjEvent.currentCoordsX, playerObjEvent.currentCoordsY);
  const metatileBehavior = MapGridGetMetatileBehaviorAt(nc.x, nc.y);
  return GetBikeCollisionAt(playerObjEvent, nc.x, nc.y, direction, metatileBehavior);
}

function GetBikeCollisionAt(objectEvent: ObjectEvent, x: number, y: number, direction: number, metatileBehavior: number): number {
  let collision = CheckForObjectEventCollision(objectEvent, x, y, direction, metatileBehavior);

  if (collision > COLLISION_OBJECT_EVENT)
    return collision;

  if (collision === COLLISION_NONE && IsRunningDisallowedByMetatile(metatileBehavior))
    collision = COLLISION_IMPASSABLE;

  if (collision)
    Bike_TryAdvanceCyclingRoadCollisions();

  return collision;
}

export function RS_IsRunningDisallowed(tile: number): boolean {
  // 1:1 décomp : `gMapHeader.mapType == MAP_TYPE_INDOOR`. mapType est typé string mais
  // porte une valeur numérique au runtime (idiome cast, cf. field-control-avatar.ts).
  if (IsRunningDisallowedByMetatile(tile) !== false
    || (gMapHeader && (gMapHeader.mapType as unknown as number) === MAP_TYPE_INDOOR))
    return true;
  else
    return false;
}

function IsRunningDisallowedByMetatile(tile: number): boolean {
  if (MetatileBehavior_IsRunningDisallowed(tile))
    return true;
  if (MetatileBehavior_IsFortreeBridge(tile) && (PlayerGetElevation() & 1) === 0)
    return true;
  return false;
}

function Bike_TryAdvanceCyclingRoadCollisions(): void {
  if (gBikeCycling.challenge !== 0 && gBikeCycling.collisions < 100)
    gBikeCycling.collisions++;
}

function CanBikeFaceDirOnMetatile(direction: number, tile: number): boolean {
  if (direction === DIR_EAST || direction === DIR_WEST) {
    // pas de face E/W sur un rail vertical.
    if (MetatileBehavior_IsIsolatedVerticalRail(tile) || MetatileBehavior_IsVerticalRail(tile))
      return false;
  } else {
    // pas de face N/S sur un rail horizontal.
    if (MetatileBehavior_IsIsolatedHorizontalRail(tile) || MetatileBehavior_IsHorizontalRail(tile))
      return false;
  }
  return true;
}

function WillPlayerCollideWithCollision(newTileCollision: number, direction: number): boolean {
  if (direction === DIR_NORTH || direction === DIR_SOUTH) {
    if (newTileCollision === COLLISION_ISOLATED_VERTICAL_RAIL || newTileCollision === COLLISION_VERTICAL_RAIL)
      return false;
  } else if (newTileCollision === COLLISION_ISOLATED_HORIZONTAL_RAIL || newTileCollision === COLLISION_HORIZONTAL_RAIL) {
    return false;
  }
  return true;
}

export function IsBikingDisallowedByPlayer(): boolean {
  let tileBehavior: number;

  if (!(gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_UNDERWATER))) {
    const coords = PlayerGetDestCoords();
    tileBehavior = MapGridGetMetatileBehaviorAt(coords.x, coords.y);
    if (!IsRunningDisallowedByMetatile(tileBehavior))
      return false;
  }
  return true;
}

export function IsPlayerNotUsingAcroBikeOnBumpySlope(): boolean {
  if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_ACRO_BIKE)
    && MetatileBehavior_IsBumpySlope(gObjectEvents[gPlayerAvatar.objectEventId].currentMetatileBehavior))
    return false;
  else
    return true;
}

export function GetOnOffBike(transitionFlags: number): void {
  gUnusedBikeCameraAheadPanback = false;

  if (gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    SetPlayerAvatarTransitionFlags(PLAYER_AVATAR_FLAG_ON_FOOT);
    Overworld_ClearSavedMusic();
    Overworld_PlaySpecialMapMusic();
  } else {
    SetPlayerAvatarTransitionFlags(transitionFlags);
    Overworld_SetSavedMusic(MUS_CYCLING);
    Overworld_ChangeMusicTo(MUS_CYCLING);
  }
}

export function BikeClearState(newDirHistory: number, newAbStartHistory: number): void {
  gPlayerAvatar.acroBikeState = ACRO_STATE_NORMAL;
  gPlayerAvatar.newDirBackup = DIR_NONE;
  gPlayerAvatar.bikeFrameCounter = 0;
  gPlayerAvatar.bikeSpeed = PLAYER_SPEED_STANDING;
  gPlayerAvatar.directionHistory = newDirHistory >>> 0;
  gPlayerAvatar.abStartSelectHistory = newAbStartHistory >>> 0;

  for (let i = 0; i < gPlayerAvatar.dirTimerHistory.length; i++)
    gPlayerAvatar.dirTimerHistory[i] = 0;

  for (let i = 0; i < gPlayerAvatar.abStartSelectTimerHistory.length; i++)
    gPlayerAvatar.abStartSelectTimerHistory[i] = 0;
}

export function Bike_UpdateBikeCounterSpeed(counter: number): void {
  gPlayerAvatar.bikeFrameCounter = counter;
  gPlayerAvatar.bikeSpeed = gPlayerAvatar.bikeFrameCounter + (gPlayerAvatar.bikeFrameCounter >> 1);  // ×1.5
}

function Bike_SetBikeStill(): void {
  gPlayerAvatar.bikeFrameCounter = 0;
  gPlayerAvatar.bikeSpeed = PLAYER_SPEED_STANDING;
}

export function GetPlayerSpeed(): number {
  // le joueur a pressé une direction → ne renvoie jamais 0 (vitesse courante).
  const machSpeeds = sMachBikeSpeeds;

  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_MACH_BIKE)
    return machSpeeds[gPlayerAvatar.bikeFrameCounter];
  else if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_ACRO_BIKE)
    return PLAYER_SPEED_FASTER;
  else if (gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_SURFING | PLAYER_AVATAR_FLAG_DASH))
    return PLAYER_SPEED_FAST;
  else
    return PLAYER_SPEED_NORMAL;
}

export function Bike_HandleBumpySlopeJump(): void {
  let tileBehavior: number;

  if (gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_ACRO_BIKE) {
    const coords = PlayerGetDestCoords();
    tileBehavior = MapGridGetMetatileBehaviorAt(coords.x, coords.y);
    if (MetatileBehavior_IsBumpySlope(tileBehavior)) {
      gPlayerAvatar.acroBikeState = ACRO_STATE_WHEELIE_STANDING;
      PlayerUseAcroBikeOnBumpySlope(GetPlayerMovementDirection());
    }
  }
}

export function IsRunningDisallowed(metatile: number): boolean {
  if (!(gMapHeader && gMapHeader.allowRunning) || IsRunningDisallowedByMetatile(metatile) === true)
    return true;
  else
    return false;
}

// 1:1 décomp `gUnusedBikeCameraAheadPanback` (bike.c global, EWRAM, inutilisé hors GetOnOffBike).
let gUnusedBikeCameraAheadPanback = false;
void gUnusedBikeCameraAheadPanback;

// silence "unused" pour les enums importés mais référencés seulement via les tables.
void PLAYER_SPEED_FASTEST; void ACRO_STATE_TURNING;
