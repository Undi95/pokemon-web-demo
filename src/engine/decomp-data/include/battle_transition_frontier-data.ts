// AUTO-GENERATED from include/battle_transition_frontier.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_transition_frontier.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_FrontierCirclesMeet', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesCross', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesAsymmetricSpiral', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesSymmetricSpiral', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesMeetInSeq', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesCrossInSeq', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesAsymmetricSpiralInSeq', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesSymmetricSpiralInSeq', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FrontierCirclesAsymmetricSpiral',
  'Task_FrontierCirclesAsymmetricSpiralInSeq',
  'Task_FrontierCirclesCross',
  'Task_FrontierCirclesCrossInSeq',
  'Task_FrontierCirclesMeet',
  'Task_FrontierCirclesMeetInSeq',
  'Task_FrontierCirclesSymmetricSpiral',
  'Task_FrontierCirclesSymmetricSpiralInSeq',
] as const;
