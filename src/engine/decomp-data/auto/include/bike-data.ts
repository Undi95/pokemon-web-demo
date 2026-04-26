// AUTO-GENERATED from include/bike.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/bike.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PLAYER_0 = {
  PLAYER_SPEED_STANDING: 0,
  PLAYER_SPEED_NORMAL: 1,
  PLAYER_SPEED_FAST: 2,
  PLAYER_SPEED_FASTER: 3,
  PLAYER_SPEED_FASTEST: 4,
} as const;
export const ENUM_MACH_1 = {
  MACH_TRANS_FACE_DIRECTION: 0,
  MACH_TRANS_TURN_DIRECTION: 1,
  MACH_TRANS_KEEP_MOVING: 2,
  MACH_TRANS_START_MOVING: 3,
} as const;
export const ENUM_ACRO_2 = {
  ACRO_STATE_NORMAL: 0,
  ACRO_STATE_TURNING: 1,
  ACRO_STATE_WHEELIE_STANDING: 2,
  ACRO_STATE_BUNNY_HOP: 3,
  ACRO_STATE_WHEELIE_MOVING: 4,
  ACRO_STATE_SIDE_JUMP: 5,
  ACRO_STATE_TURN_JUMP: 6,
} as const;
export const ENUM_ACRO_3 = {
  ACRO_TRANS_FACE_DIRECTION: 0,
  ACRO_TRANS_TURN_DIRECTION: 1,
  ACRO_TRANS_MOVING: 2,
  ACRO_TRANS_NORMAL_TO_WHEELIE: 3,
  ACRO_TRANS_WHEELIE_TO_NORMAL: 4,
  ACRO_TRANS_WHEELIE_IDLE: 5,
  ACRO_TRANS_WHEELIE_HOPPING_STANDING: 6,
  ACRO_TRANS_WHEELIE_HOPPING_MOVING: 7,
  ACRO_TRANS_SIDE_JUMP: 8,
  ACRO_TRANS_TURN_JUMP: 9,
  ACRO_TRANS_WHEELIE_MOVING: 10,
  ACRO_TRANS_WHEELIE_RISING_MOVING: 11,
  ACRO_TRANS_WHEELIE_LOWERING_MOVING: 12,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MovePlayerOnBike', ret: "void", arity: 3, params: "u8 direction, u16 newKeys, u16 heldKeys" },
  { name: 'Bike_TryAcroBikeHistoryUpdate', ret: "void", arity: 2, params: "u16 newKeys, u16 heldKeys" },
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
