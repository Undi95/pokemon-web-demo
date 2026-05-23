// AUTO-GENERATED from src/event_object_lock.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/event_object_lock.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tPlayerFrozen_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tObjectFrozen_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tObjectId_EXPR = "data[2]";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'IsPlayerStandingStill', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_FreezePlayer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'IsFreezePlayerFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreezeObjects_WaitForPlayer', ret: "void", arity: 0, params: "void" },
  { name: 'Task_FreezeSelectedObjectAndPlayer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'IsFreezeSelectedObjectAndPlayerFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreezeObjects_WaitForPlayerAndSelected', ret: "void", arity: 0, params: "void" },
  { name: 'ScriptUnfreezeObjectEvents', ret: "void", arity: 0, params: "void" },
  { name: 'UnionRoom_UnlockPlayerAndChatPartner', ret: "void", arity: 0, params: "void" },
  { name: 'Script_FacePlayer', ret: "void", arity: 0, params: "void" },
  { name: 'Script_ClearHeldMovement', ret: "void", arity: 0, params: "void" },
  { name: 'Task_FreezeObjectAndPlayer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FreezeForApproachingTrainers', ret: "void", arity: 0, params: "void" },
  { name: 'IsFreezeObjectAndPlayerFinished', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FreezeObjectAndPlayer',
  'Task_FreezePlayer',
  'Task_FreezeSelectedObjectAndPlayer',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'event_object_lock.h',
  'event_object_movement.h',
  'field_player_avatar.h',
  'script_movement.h',
  'task.h',
  'trainer_see.h',
  'constants/event_objects.h',
] as const;
