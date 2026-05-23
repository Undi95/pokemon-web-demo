// AUTO-GENERATED from src/script_movement.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/script_movement.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ScriptMovement_StartMoveObjects', ret: "void", arity: 1, params: "u8 priority" },
  { name: 'GetMoveObjectsTaskId', ret: "u8", arity: 0, params: "void" },
  { name: 'ScriptMovement_TryAddNewMovement', ret: "bool8", arity: 3, params: "u8 taskId, u8 objEventId, const u8 *movementScript" },
  { name: 'GetMovementScriptIdFromObjectEventId', ret: "u8", arity: 2, params: "u8 taskId, u8 objEventId" },
  { name: 'IsMovementScriptFinished', ret: "bool8", arity: 2, params: "u8 taskId, u8 moveScrId" },
  { name: 'ScriptMovement_AddNewMovement', ret: "void", arity: 4, params: "u8 taskId, u8 moveScrId, u8 objEventId, const u8 *movementScript" },
  { name: 'ScriptMovement_UnfreezeActiveObjects', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ScriptMovement_MoveObjects', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ScriptMovement_TakeStep', ret: "void", arity: 4, params: "u8 taskId, u8 moveScrId, u8 objEventId, const u8 *movementScript" },
  { name: 'ScriptMovement_StartObjectMovementScript', ret: "bool8", arity: 4, params: "u8 localId, u8 mapNum, u8 mapGroup, const u8 *movementScript" },
  { name: 'ScriptMovement_IsObjectMovementFinished', ret: "bool8", arity: 3, params: "u8 localId, u8 mapNum, u8 mapGroup" },
  { name: 'ScriptMovement_UnfreezeObjectEvents', ret: "void", arity: 0, params: "void" },
  { name: 'LoadObjectEventIdPtrFromMovementScript', ret: "void", arity: 3, params: "u8 taskId, u8 moveScrId, u8 **pObjEventId" },
  { name: 'SetObjectEventIdAtMovementScript', ret: "void", arity: 3, params: "u8 taskId, u8 moveScrId, u8 objEventId" },
  { name: 'LoadObjectEventIdFromMovementScript', ret: "void", arity: 3, params: "u8 taskId, u8 moveScrId, u8 *objEventId" },
  { name: 'ClearMovementScriptFinished', ret: "void", arity: 2, params: "u8 taskId, u8 moveScrId" },
  { name: 'SetMovementScriptFinished', ret: "void", arity: 2, params: "u8 taskId, u8 moveScrId" },
  { name: 'SetMovementScript', ret: "void", arity: 2, params: "u8 moveScrId, const u8 *movementScript" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'script_movement.h',
  'event_object_movement.h',
  'task.h',
  'util.h',
  'constants/event_objects.h',
  'constants/event_object_movement.h',
] as const;
