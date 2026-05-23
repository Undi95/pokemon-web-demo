// AUTO-GENERATED from src/field_tasks.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_tasks.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tCallbackId_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tAmbientCryState_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tAmbientCryDelay_EXPR = "data[2]";
/** Raw expr: `(1 << 12)` */
export const TIME_UPDATE_INTERVAL_EXPR = "(1 << 12)";
/** Raw expr: `data[2]` */
export const tPrevX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPrevY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tToRaiseX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tToRaiseY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tDelay_EXPR = "data[6]";
/** Raw expr: `data[4]` */
export const tOldBridgeX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tOldBridgeY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tBounceTime_EXPR = "data[6]";
export const ICE_PUZZLE_L = 3;
export const ICE_PUZZLE_R = 13;
export const ICE_PUZZLE_T = 6;
export const ICE_PUZZLE_B = 19;
/** Raw expr: `(ICE_PUZZLE_R - ICE_PUZZLE_L + 1)` */
export const ICE_PUZZLE_WIDTH_EXPR = "(ICE_PUZZLE_R - ICE_PUZZLE_L + 1)";
/** Raw expr: `(ICE_PUZZLE_B - ICE_PUZZLE_T + 1)` */
export const ICE_PUZZLE_HEIGHT_EXPR = "(ICE_PUZZLE_B - ICE_PUZZLE_T + 1)";
/** Raw expr: `data[4]` */
export const tIceX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tIceY_EXPR = "data[5]";
/** Raw expr: `data[4]` */
export const tFloor1Delay_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tFloor1X_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tFloor1Y_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tFloor2Delay_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tFloor2X_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tFloor2Y_EXPR = "data[9]";
/** Raw expr: `data[0]` */
export const tMapId_EXPR = "data[0]";
export const SLOPE_DATA_START = 4;
/** Raw expr: `(3 * SLOPE_DATA_SIZE + SLOPE_DATA_START)` */
export const SLOPE_DATA_END_EXPR = "(3 * SLOPE_DATA_SIZE + SLOPE_DATA_START)";
export const SLOPE_ANIM_TIME = 32;
/** Raw expr: `(SLOPE_ANIM_TIME / (int)ARRAY_COUNT(sMuddySlopeMetatiles))` */
export const SLOPE_ANIM_STEP_TIME_EXPR = "(SLOPE_ANIM_TIME / (int)ARRAY_COUNT(sMuddySlopeMetatiles))";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SLOPE_0 = {
  SLOPE_TIME: 0,
  SLOPE_X: 1,
  SLOPE_Y: 2,
  SLOPE_DATA_SIZE: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DummyPerStepCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'AshGrassPerStepCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'FortreeBridgePerStepCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'PacifidlogBridgePerStepCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'SootopolisGymIcePerStepCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'CrackedFloorPerStepCallback', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_MuddySlope', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RunPerStepCallback', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RunTimeBasedEvents', ret: "void", arity: 1, params: "s16 *data" },
  { name: 'Task_RunTimeBasedEvents', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetUpFieldTasks', ret: "void", arity: 0, params: "void" },
  { name: 'ActivatePerStepCallback', ret: "void", arity: 1, params: "u8 callbackId" },
  { name: 'ResetFieldTasksArgs', ret: "void", arity: 0, params: "void" },
  { name: 'TrySetPacifidlogBridgeMetatiles', ret: "void", arity: 4, params: "const struct PacifidlogMetatileOffsets *offsets, s16 x, s16 y, bool32 redrawMap" },
  { name: 'TrySetLogBridgeHalfSubmerged', ret: "void", arity: 3, params: "s16 x, s16 y, bool32 redrawMap" },
  { name: 'TrySetLogBridgeFullySubmerged', ret: "void", arity: 3, params: "s16 x, s16 y, bool32 redrawMap" },
  { name: 'TrySetLogBridgeFloating', ret: "void", arity: 3, params: "s16 x, s16 y, bool32 redrawMap" },
  { name: 'ShouldRaisePacifidlogLogs', ret: "bool32", arity: 4, params: "s16 newX, s16 newY, s16 oldX, s16 oldY" },
  { name: 'ShouldSinkPacifidlogLogs', ret: "bool32", arity: 4, params: "s16 newX, s16 newY, s16 oldX, s16 oldY" },
  { name: 'TryLowerFortreeBridge', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'TryRaiseFortreeBridge', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'CoordInIcePuzzleRegion', ret: "bool32", arity: 2, params: "s16 x, s16 y" },
  { name: 'MarkIcePuzzleCoordVisited', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'IsIcePuzzleCoordVisited', ret: "bool32", arity: 2, params: "s16 x, s16 y" },
  { name: 'SetSootopolisGymCrackedIceMetatiles', ret: "void", arity: 0, params: "void" },
  { name: 'StartAshFieldEffect', ret: "else", arity: 4, params: "x, y, METATILE_Lavaridge_NormalGrass, 4" },
  { name: 'SetCrackedFloorHoleMetatile', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'SetMuddySlopeMetatile', ret: "void", arity: 3, params: "s16 *data, s16 x, s16 y" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_MuddySlope',
  'Task_RunPerStepCallback',
  'Task_RunTimeBasedEvents',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bike.h',
  'clock.h',
  'event_data.h',
  'field_camera.h',
  'field_effect_helpers.h',
  'field_player_avatar.h',
  'field_special_scene.h',
  'field_tasks.h',
  'fieldmap.h',
  'item.h',
  'main.h',
  'metatile_behavior.h',
  'overworld.h',
  'script.h',
  'secret_base.h',
  'sound.h',
  'task.h',
  'constants/field_tasks.h',
  'constants/items.h',
  'constants/songs.h',
  'constants/metatile_labels.h',
] as const;
