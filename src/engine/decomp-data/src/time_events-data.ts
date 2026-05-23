// AUTO-GENERATED from src/time_events.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/time_events.c
// Generated: 2026-04-26

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const tide: readonly number[] = [1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetMirageRnd', ret: "u32", arity: 0, params: "void" },
  { name: 'SetMirageRnd', ret: "void", arity: 1, params: "u32 rnd" },
  { name: 'InitMirageRnd', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateMirageRnd', ret: "void", arity: 1, params: "u16 days" },
  { name: 'IsMirageIslandPresent', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateShoalTideFlag', ret: "void", arity: 0, params: "void" },
  { name: 'FlagClear', ret: "else", arity: 1, params: "FLAG_SYS_SHOAL_TIDE" },
  { name: 'Task_WaitWeather', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'WaitWeather', ret: "void", arity: 0, params: "void" },
  { name: 'InitBirchState', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateBirchState', ret: "void", arity: 1, params: "u16 days" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_WaitWeather',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'time_events.h',
  'event_data.h',
  'field_weather.h',
  'pokemon.h',
  'random.h',
  'overworld.h',
  'rtc.h',
  'script.h',
  'task.h',
] as const;
