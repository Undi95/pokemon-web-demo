// AUTO-GENERATED from src/pokenav.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'gNextLoopedTaskId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetCurrentMenuCB', ret: "u32", arity: 0, params: "void" },
  { name: 'IsActiveMenuLoopTaskActive_', ret: "u32", arity: 0, params: "void" },
  { name: 'SetActivePokenavMenu', ret: "bool32", arity: 1, params: "u32" },
  { name: 'AnyMonHasRibbon', ret: "bool32", arity: 0, params: "void" },
  { name: 'InitPokenavResources', ret: "void", arity: 1, params: "struct PokenavResources *" },
  { name: 'InitKeys_', ret: "void", arity: 0, params: "void" },
  { name: 'FreePokenavResources', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Pokenav', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_Pokenav', ret: "void", arity: 0, params: "void" },
  { name: 'Task_RunLoopedTask_LinkMode', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RunLoopedTask', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Pokenav', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_InitPokenavForTutorial', ret: "void", arity: 0, params: "void" },
  { name: 'CreateLoopedTask', ret: "u32", arity: 2, params: "LoopedTask loopedTask, u32 priority" },
  { name: 'IsLoopedTaskActive', ret: "bool32", arity: 1, params: "u32 taskId" },
  { name: 'FuncIsActiveLoopedTask', ret: "bool32", arity: 1, params: "LoopedTask func" },
  { name: 'CB2_InitPokeNav', ret: "void", arity: 0, params: "void" },
  { name: 'OpenPokenavForTutorial', ret: "void", arity: 0, params: "void" },
  { name: 'SetMainCallback2', ret: "else", arity: 1, params: "CB2_ReturnToFieldWithOpenMenu" },
  { name: 'SetVBlankCallback_', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'SetPokenavVBlankCallback', ret: "void", arity: 0, params: "void" },
  { name: 'FreePokenavSubstruct', ret: "void", arity: 1, params: "u32 index" },
  { name: 'GetPokenavMode', ret: "u32", arity: 0, params: "void" },
  { name: 'SetPokenavMode', ret: "void", arity: 1, params: "u16 mode" },
  { name: 'SetSelectedConditionSearch', ret: "void", arity: 1, params: "u32 cursorPos" },
  { name: 'GetSelectedConditionSearch', ret: "u32", arity: 0, params: "void" },
  { name: 'CanViewRibbonsMenu', ret: "bool32", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_Pokenav',
  'Task_RunLoopedTask',
  'Task_RunLoopedTask_LinkMode',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitPokeNav',
  'CB2_InitPokenavForTutorial',
  'CB2_Pokenav',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'task.h',
  'main.h',
  'overworld.h',
  'field_weather.h',
  'palette.h',
  'pokemon_storage_system.h',
  'pokenav.h',
] as const;
