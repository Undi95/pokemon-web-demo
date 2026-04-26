// AUTO-GENERATED from src/bike.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/bike.c
// Generated: 2026-04-26

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sAcroBikeJumpTimerList: readonly number[] = [4,0] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sMachBikeTransitions = ['MachBikeTransition_FaceDirection', 'MachBikeTransition_TurnDirection', 'MachBikeTransition_TrySpeedUp', 'MachBikeTransition_TrySlowDown'] as const;
export const sMachBikeSpeedCallbacks = ['PlayerWalkNormal', 'PlayerWalkFast', 'PlayerWalkFaster'] as const;
export const sAcroBikeTransitions = ['AcroBikeTransition_FaceDirection', 'AcroBikeTransition_TurnDirection', 'AcroBikeTransition_Moving', 'AcroBikeTransition_NormalToWheelie', 'AcroBikeTransition_WheelieToNormal', 'AcroBikeTransition_WheelieIdle', 'AcroBikeTransition_WheelieHoppingStanding', 'AcroBikeTransition_WheelieHoppingMoving', 'AcroBikeTransition_SideJump', 'AcroBikeTransition_TurnJump', 'AcroBikeTransition_WheelieMoving', 'AcroBikeTransition_WheelieRisingMoving', 'AcroBikeTransition_WheelieLoweringMoving'] as const;
export const sAcroBikeInputHandlers = ['AcroBikeHandleInputNormal', 'AcroBikeHandleInputTurning', 'AcroBikeHandleInputWheelieStanding', 'AcroBikeHandleInputBunnyHop', 'AcroBikeHandleInputWheelieMoving', 'AcroBikeHandleInputSidewaysJump', 'AcroBikeHandleInputTurnJump'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MovePlayerOnMachBike', ret: "void", arity: 3, params: "u8, u16, u16" },
  { name: 'GetMachBikeTransition', ret: "u8", arity: 1, params: "u8 *" },
  { name: 'MachBikeTransition_FaceDirection', ret: "void", arity: 1, params: "u8" },
  { name: 'MachBikeTransition_TurnDirection', ret: "void", arity: 1, params: "u8" },
  { name: 'MachBikeTransition_TrySpeedUp', ret: "void", arity: 1, params: "u8" },
  { name: 'MachBikeTransition_TrySlowDown', ret: "void", arity: 1, params: "u8" },
  { name: 'MovePlayerOnAcroBike', ret: "void", arity: 3, params: "u8, u16, u16" },
  { name: 'CheckMovementInputAcroBike', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeHandleInputNormal', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeHandleInputTurning', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeHandleInputWheelieStanding', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeHandleInputBunnyHop', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeHandleInputWheelieMoving', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeHandleInputSidewaysJump', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeHandleInputTurnJump', ret: "u8", arity: 3, params: "u8 *, u16, u16" },
  { name: 'AcroBikeTransition_FaceDirection', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_TurnDirection', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_Moving', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_NormalToWheelie', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_WheelieToNormal', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_WheelieIdle', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_WheelieHoppingStanding', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_WheelieHoppingMoving', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_SideJump', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_TurnJump', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_WheelieMoving', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_WheelieRisingMoving', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBikeTransition_WheelieLoweringMoving', ret: "void", arity: 1, params: "u8" },
  { name: 'AcroBike_TryHistoryUpdate', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'AcroBike_GetJumpDirection', ret: "u8", arity: 0, params: "void" },
  { name: 'Bike_UpdateDirTimerHistory', ret: "void", arity: 1, params: "u8" },
  { name: 'Bike_UpdateABStartSelectHistory', ret: "void", arity: 1, params: "u8" },
  { name: 'Bike_DPadToDirection', ret: "u8", arity: 1, params: "u16" },
  { name: 'GetBikeCollision', ret: "u8", arity: 1, params: "u8" },
  { name: 'GetBikeCollisionAt', ret: "u8", arity: 5, params: "struct ObjectEvent *, s16, s16, u8, u8" },
  { name: 'IsRunningDisallowedByMetatile', ret: "bool8", arity: 1, params: "u8" },
  { name: 'Bike_TryAdvanceCyclingRoadCollisions', ret: "void", arity: 0, params: "" },
  { name: 'CanBikeFaceDirOnMetatile', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'WillPlayerCollideWithCollision', ret: "bool8", arity: 2, params: "u8, u8" },
  { name: 'Bike_SetBikeStill', ret: "void", arity: 0, params: "void" },
  { name: 'MovePlayerOnBike', ret: "void", arity: 3, params: "u8 direction, u16 newKeys, u16 heldKeys" },
  { name: 'PlayerWheelieInPlace', ret: "else", arity: 1, params: "direction" },
  { name: 'Bike_TryAcroBikeHistoryUpdate', ret: "void", arity: 2, params: "u16 newKeys, u16 heldKeys" },
  { name: 'HasPlayerInputTakenLongerThanList', ret: "bool8", arity: 2, params: "const u8 *dirTimerList, const u8 *abStartSelectTimerList" },
  { name: 'RS_IsRunningDisallowed', ret: "bool8", arity: 1, params: "u8 tile" },
  { name: 'IsBikingDisallowedByPlayer', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsPlayerNotUsingAcroBikeOnBumpySlope', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetOnOffBike', ret: "void", arity: 1, params: "u8 transitionFlags" },
  { name: 'BikeClearState', ret: "void", arity: 2, params: "int newDirHistory, int newAbStartHistory" },
  { name: 'Bike_UpdateBikeCounterSpeed', ret: "void", arity: 1, params: "u8 counter" },
  { name: 'GetPlayerSpeed', ret: "s16", arity: 0, params: "void" },
  { name: 'Bike_HandleBumpySlopeJump', ret: "void", arity: 0, params: "void" },
  { name: 'IsRunningDisallowed', ret: "bool32", arity: 1, params: "u8 metatile" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bike.h',
  'event_object_movement.h',
  'field_player_avatar.h',
  'fieldmap.h',
  'field_specials.h',
  'metatile_behavior.h',
  'overworld.h',
  'sound.h',
  'constants/map_types.h',
  'constants/songs.h',
] as const;
