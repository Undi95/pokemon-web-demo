// AUTO-GENERATED from src/hof_pc.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/hof_pc.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ReshowPCMenuAfterHallOfFamePC', ret: "void", arity: 0, params: "void" },
  { name: 'Task_WaitForPaletteFade', ret: "void", arity: 1, params: "u8" },
  { name: 'AccessHallOfFamePC', ret: "void", arity: 0, params: "void" },
  { name: 'ReturnFromHallOfFamePC', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_WaitForPaletteFade',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'hall_of_fame.h',
  'main.h',
  'palette.h',
  'overworld.h',
  'script.h',
  'script_menu.h',
  'task.h',
  'constants/rgb.h',
] as const;
