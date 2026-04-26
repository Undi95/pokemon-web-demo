// AUTO-GENERATED from src/field_message_box.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_message_box.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sFieldMessageBoxMode', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ExpandStringAndStartDrawFieldMessage', ret: "void", arity: 2, params: "const u8 *, bool32" },
  { name: 'StartDrawFieldMessage', ret: "void", arity: 0, params: "void" },
  { name: 'InitFieldMessageBox', ret: "void", arity: 0, params: "void" },
  { name: 'Task_DrawFieldMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateTask_DrawFieldMessage', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyTask_DrawFieldMessage', ret: "void", arity: 0, params: "void" },
  { name: 'ShowFieldMessage', ret: "bool8", arity: 1, params: "const u8 *str" },
  { name: 'Task_HidePokenavMessageWhenDone', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowPokenavFieldMessage', ret: "bool8", arity: 1, params: "const u8 *str" },
  { name: 'ShowFieldAutoScrollMessage', ret: "bool8", arity: 1, params: "const u8 *str" },
  { name: 'ForceShowFieldAutoScrollMessage', ret: "UNUSED", arity: 1, params: "const u8 *str" },
  { name: 'ShowFieldMessageFromBuffer', ret: "bool8", arity: 0, params: "void" },
  { name: 'HideFieldMessageBox', ret: "void", arity: 0, params: "void" },
  { name: 'GetFieldMessageBoxMode', ret: "u8", arity: 0, params: "void" },
  { name: 'IsFieldMessageBoxHidden', ret: "bool8", arity: 0, params: "void" },
  { name: 'ReplaceFieldMessageWithFrame', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'StopFieldMessage', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DrawFieldMessage',
  'Task_HidePokenavMessageWhenDone',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'menu.h',
  'string_util.h',
  'task.h',
  'text.h',
  'match_call.h',
  'field_message_box.h',
] as const;
