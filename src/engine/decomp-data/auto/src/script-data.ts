// AUTO-GENERATED from src/script.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/script.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const RAM_SCRIPT_MAGIC = 51;
/** Raw expr: `LOCALID_PLAYER` */
export const NO_OBJECT_EXPR = "LOCALID_PLAYER";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SCRIPT_0 = {
  SCRIPT_MODE_STOPPED: 0,
  SCRIPT_MODE_BYTECODE: 1,
  SCRIPT_MODE_NATIVE: 2,
} as const;
export const ENUM_CONTEXT_1 = {
  CONTEXT_RUNNING: 0,
  CONTEXT_WAITING: 1,
  CONTEXT_SHUTDOWN: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitScriptContext', ret: "void", arity: 3, params: "struct ScriptContext *ctx, void *cmdTable, void *cmdTableEnd" },
  { name: 'SetupBytecodeScript', ret: "u8", arity: 2, params: "struct ScriptContext *ctx, const u8 *ptr" },
  { name: 'StopScript', ret: "void", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'RunScriptCommand', ret: "bool8", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'ScriptPush', ret: "bool8", arity: 2, params: "struct ScriptContext *ctx, const u8 *ptr" },
  { name: 'ScriptJump', ret: "void", arity: 2, params: "struct ScriptContext *ctx, const u8 *ptr" },
  { name: 'ScriptCall', ret: "void", arity: 2, params: "struct ScriptContext *ctx, const u8 *ptr" },
  { name: 'ScriptReturn', ret: "void", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'ScriptReadHalfword', ret: "u16", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'ScriptReadWord', ret: "u32", arity: 1, params: "struct ScriptContext *ctx" },
  { name: 'LockPlayerFieldControls', ret: "void", arity: 0, params: "void" },
  { name: 'UnlockPlayerFieldControls', ret: "void", arity: 0, params: "void" },
  { name: 'ArePlayerFieldControlsLocked', ret: "bool8", arity: 0, params: "void" },
  { name: 'ScriptContext_IsEnabled', ret: "bool8", arity: 0, params: "void" },
  { name: 'ScriptContext_Init', ret: "void", arity: 0, params: "void" },
  { name: 'ScriptContext_RunScript', ret: "bool8", arity: 0, params: "void" },
  { name: 'ScriptContext_SetupScript', ret: "void", arity: 1, params: "const u8 *ptr" },
  { name: 'ScriptContext_Stop', ret: "void", arity: 0, params: "void" },
  { name: 'ScriptContext_Enable', ret: "void", arity: 0, params: "void" },
  { name: 'RunScriptImmediately', ret: "void", arity: 1, params: "const u8 *ptr" },
  { name: 'MapHeaderRunScriptType', ret: "void", arity: 1, params: "u8 tag" },
  { name: 'RunOnLoadMapScript', ret: "void", arity: 0, params: "void" },
  { name: 'RunOnTransitionMapScript', ret: "void", arity: 0, params: "void" },
  { name: 'RunOnResumeMapScript', ret: "void", arity: 0, params: "void" },
  { name: 'RunOnReturnToFieldMapScript', ret: "void", arity: 0, params: "void" },
  { name: 'RunOnDiveWarpMapScript', ret: "void", arity: 0, params: "void" },
  { name: 'TryRunOnFrameMapScript', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryRunOnWarpIntoMapScript', ret: "void", arity: 0, params: "void" },
  { name: 'CalculateRamScriptChecksum', ret: "u32", arity: 0, params: "void" },
  { name: 'ClearRamScript', ret: "void", arity: 0, params: "void" },
  { name: 'InitRamScript', ret: "bool8", arity: 5, params: "const u8 *script, u16 scriptSize, u8 mapGroup, u8 mapNum, u8 localId" },
  { name: 'ValidateSavedRamScript', ret: "bool32", arity: 0, params: "void" },
  { name: 'InitRamScript_NoObjectEvent', ret: "void", arity: 2, params: "u8 *script, u16 scriptSize" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'script.h',
  'event_data.h',
  'mystery_gift.h',
  'util.h',
  'constants/event_objects.h',
  'constants/map_scripts.h',
] as const;
