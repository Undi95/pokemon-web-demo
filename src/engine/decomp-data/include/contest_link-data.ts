// AUTO-GENERATED from include/contest_link.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/contest_link.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_LinkContest_CommunicateAppealsState', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateFinalStandings', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateMonsRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateRngRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateLeaderIdsRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateCategoryRS', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateMonIdxs', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_StartCommunicationEm', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateRound1Points', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateTurnOrder', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_FinalizeConnection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContest_CommunicateMoveSelections', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LinkContest_TryLinkStandby', ret: "bool32", arity: 1, params: "s16 *state" },
  { name: 'LinkContest_SendBlock', ret: "bool32", arity: 2, params: "void *src, u16 size" },
  { name: 'LinkContest_GetBlockReceivedFromAllPlayers', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkContest_GetBlockReceived', ret: "bool8", arity: 1, params: "u8 flag" },
  { name: 'LinkContest_GetLeaderIndex', ret: "u8", arity: 1, params: "u8 *ids" },
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
  'Task_LinkContest_FinalizeConnection',
  'Task_LinkContest_Init',
  'Task_LinkContest_StartCommunicationEm',
] as const;
