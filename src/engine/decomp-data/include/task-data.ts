// AUTO-GENERATED from include/task.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/task.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const HEAD_SENTINEL = 254;
export const TAIL_SENTINEL = 255;
/** Raw expr: `TAIL_SENTINEL` */
export const TASK_NONE_EXPR = "TAIL_SENTINEL";
export const NUM_TASKS = 16;
export const NUM_TASK_DATA = 16;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
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
