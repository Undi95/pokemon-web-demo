// AUTO-GENERATED from src/fldeff_escalator.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/fldeff_escalator.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ESCALATOR_STAGES = 3;
/** Raw expr: `(ESCALATOR_STAGES - 1)` */
export const LAST_ESCALATOR_STAGE_EXPR = "(ESCALATOR_STAGES - 1)";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTransitionStage_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tGoingUp_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tDrawingEscalator_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tPlayerX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tPlayerY_EXPR = "data[5]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sEscalatorAnim_TaskId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetEscalatorMetatile', ret: "void", arity: 3, params: "u8 taskId, const s16 *metatileIds, u16 metatileMasks" },
  { name: 'Task_DrawEscalator', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'MapGridSetMetatileIdAt', ret: "else", arity: 3, params: "x + j, y + i, metatileMasks | metatileIds[0]" },
  { name: 'CreateEscalatorTask', ret: "u8", arity: 1, params: "bool16 goingUp" },
  { name: 'StartEscalator', ret: "void", arity: 1, params: "bool8 goingUp" },
  { name: 'StopEscalator', ret: "void", arity: 0, params: "void" },
  { name: 'IsEscalatorMoving', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DrawEscalator',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'field_camera.h',
  'field_player_avatar.h',
  'fieldmap.h',
  'fldeff.h',
  'task.h',
  'constants/metatile_labels.h',
] as const;
