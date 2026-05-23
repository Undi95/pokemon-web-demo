// AUTO-GENERATED from src/contest_link.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/contest_link.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDelayTimer_EXPR = "data[1]";
/** Raw expr: `data[9]` */
export const tCategory_EXPR = "data[9]";
/** Raw expr: `data[11]` */
export const tTimer_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tStandbyState_EXPR = "data[12]";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_LinkContest_StartInitFlags', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_InitFlags', ret: "void", arity: 1, params: "u8" },
  { name: 'LinkContest_SendBlock', ret: "bool32", arity: 2, params: "void *src, u16 size" },
  { name: 'LinkContest_GetBlockReceived', ret: "bool8", arity: 1, params: "u8 flag" },
  { name: 'LinkContest_GetBlockReceivedFromAllPlayers', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_LinkContest_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LinkContest_TryLinkStandby', ret: "bool32", arity: 1, params: "s16 *state" },
  { name: 'Task_LinkContest_CommunicateMonsRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateRngRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateCategoryRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateMonIdxs', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateMoveSelections', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateFinalStandings', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateAppealsState', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateLeaderIdsRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateRound1Points', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateTurnOrder', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_LinkContest_CommunicateAppealsState',
  'Task_LinkContest_CommunicateCategoryRS',
  'Task_LinkContest_CommunicateFinalStandings',
  'Task_LinkContest_CommunicateLeaderIdsRS',
  'Task_LinkContest_CommunicateMonIdxs',
  'Task_LinkContest_CommunicateMonsRS',
  'Task_LinkContest_CommunicateMoveSelections',
  'Task_LinkContest_CommunicateRngRS',
  'Task_LinkContest_CommunicateRound1Points',
  'Task_LinkContest_CommunicateTurnOrder',
  'Task_LinkContest_Init',
  'Task_LinkContest_InitFlags',
  'Task_LinkContest_StartInitFlags',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'contest.h',
  'decompress.h',
  'event_data.h',
  'link.h',
  'pokemon.h',
  'random.h',
  'task.h',
  'contest_link.h',
] as const;
