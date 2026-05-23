// AUTO-GENERATED from src/contest_link_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/contest_link_util.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[9]` */
export const tCategory_EXPR = "data[9]";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_LinkContest_CommunicateMonsEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_StartCommunicateRngEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_CommunicateRngEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_StartCommunicateLeaderIdsEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_CommunicateLeaderIdsEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_StartCommunicateCategoryEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_CommunicateCategoryEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_SetUpContestEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_CommunicateAIMonsEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_CalculateRound1Em', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_CalculateTurnOrderEm', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_StartCommunicationEm', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_LinkContest_CalculateRound1Em',
  'Task_LinkContest_CalculateTurnOrderEm',
  'Task_LinkContest_CommunicateAIMonsEm',
  'Task_LinkContest_CommunicateCategoryEm',
  'Task_LinkContest_CommunicateLeaderIdsEm',
  'Task_LinkContest_CommunicateMonsEm',
  'Task_LinkContest_CommunicateRngEm',
  'Task_LinkContest_SetUpContestEm',
  'Task_LinkContest_StartCommunicateCategoryEm',
  'Task_LinkContest_StartCommunicateLeaderIdsEm',
  'Task_LinkContest_StartCommunicateRngEm',
  'Task_LinkContest_StartCommunicationEm',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'contest.h',
  'contest_link.h',
  'event_data.h',
  'link.h',
  'random.h',
  'task.h',
] as const;
