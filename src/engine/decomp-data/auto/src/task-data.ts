// AUTO-GENERATED from src/task.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/task.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "struct Task", name: 'gTasks', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InsertTask', ret: "void", arity: 1, params: "u8 newTaskId" },
  { name: 'FindFirstActiveTask', ret: "u8", arity: 0, params: "void" },
  { name: 'ResetTasks', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTask', ret: "u8", arity: 2, params: "TaskFunc func, u8 priority" },
  { name: 'DestroyTask', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RunTasks', ret: "void", arity: 0, params: "void" },
  { name: 'TaskDummy', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetTaskFuncWithFollowupFunc', ret: "void", arity: 3, params: "u8 taskId, TaskFunc func, TaskFunc followupFunc" },
  { name: 'SwitchTaskToFollowupFunc', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FuncIsActiveTask', ret: "bool8", arity: 1, params: "TaskFunc func" },
  { name: 'FindTaskIdByFunc', ret: "u8", arity: 1, params: "TaskFunc func" },
  { name: 'GetTaskCount', ret: "u8", arity: 0, params: "void" },
  { name: 'SetWordTaskArg', ret: "void", arity: 3, params: "u8 taskId, u8 dataElem, u32 value" },
  { name: 'GetWordTaskArg', ret: "u32", arity: 2, params: "u8 taskId, u8 dataElem" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'task.h',
] as const;
