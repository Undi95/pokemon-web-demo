// AUTO-GENERATED from src/field_special_scene.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_special_scene.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const BOX1_X_OFFSET = 3;
export const BOX1_Y_OFFSET = 3;
export const BOX2_X_OFFSET = 0;
export const BOX2_Y_OFFSET = -3;
export const BOX3_X_OFFSET = -3;
export const BOX3_Y_OFFSET = 0;
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tTimerHorizontal_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMoveStep_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTimerVertical_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const tTaskId1_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tTaskId2_EXPR = "data[3]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_INIT_0 = {
  INIT_PORTHOLE: 0,
  IDLE_CHECK: 1,
  EXECUTE_MOVEMENT: 2,
  EXIT_PORTHOLE: 3,
} as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sTruckCamera_HorizontalTable: readonly number[] = [0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,-1,-1,-1,0] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_Truck3', ret: "void", arity: 1, params: "u8" },
  { name: 'GetTruckCameraBobbingY', ret: "s16", arity: 1, params: "int time" },
  { name: 'GetTruckBoxYMovement', ret: "s16", arity: 1, params: "int time" },
  { name: 'Task_Truck1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Truck2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleTruckSequence', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ExecuteTruckSequence', ret: "void", arity: 0, params: "void" },
  { name: 'EndTruckSequence', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TrySetPortholeWarpDestination', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_HandlePorthole', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowSSTidalWhileSailing', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ShowPortholeView', ret: "void", arity: 0, params: "void" },
  { name: 'LookThroughPorthole', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandlePorthole',
  'Task_HandleTruckSequence',
  'Task_Truck1',
  'Task_Truck2',
  'Task_Truck3',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'event_object_movement.h',
  'field_camera.h',
  'field_screen_effect.h',
  'field_specials.h',
  'fieldmap.h',
  'main.h',
  'overworld.h',
  'palette.h',
  'script.h',
  'script_movement.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'constants/event_objects.h',
  'constants/event_object_movement.h',
  'constants/field_specials.h',
  'constants/songs.h',
  'constants/metatile_labels.h',
] as const;
