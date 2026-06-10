// AUTO-GENERATED from data/scripts/interview-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=239, bytes=1854, labels=40, unknownOps=0, unresolvedSymbols=40

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Interview_EventScript_EndInterview": 0,
  "SlateportCity_PokemonFanClub_EventScript_ReporterNoNickname": 8,
  "SlateportCity_PokemonFanClub_EventScript_AcceptInterview2": 97,
  "SlateportCity_PokemonFanClub_EventScript_DeclineInterview2": 172,
  "SlateportCity_PokemonFanClub_EventScript_SubmitResponse2": 182,
  "SlateportCity_PokemonFanClub_EventScript_AlreadyInterviewed2": 201,
  "SlateportCity_OceanicMuseum_1F_EventScript_Reporter": 211,
  "SlateportCity_OceanicMuseum_1F_EventScript_RequestInterviewShort": 314,
  "SlateportCity_OceanicMuseum_1F_EventScript_AcceptInterview": 367,
  "SlateportCity_OceanicMuseum_1F_EventScript_DeclineInterview": 442,
  "SlateportCity_OceanicMuseum_1F_EventScript_SubmitResponse": 452,
  "SlateportCity_OceanicMuseum_1F_EventScript_AlreadyInterviewed": 471,
  "SlateportCity_PokemonFanClub_EventScript_Reporter": 481,
  "SlateportCity_PokemonFanClub_EventScript_AcceptInterview": 600,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion1": 718,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion2": 732,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion3": 746,
  "SlateportCity_PokemonFanClub_EventScript_ContinueInterview": 760,
  "SlateportCity_PokemonFanClub_EventScript_DeclineInterview": 870,
  "SlateportCity_PokemonFanClub_EventScript_AlreadyInterviewed": 880,
  "LilycoveCity_ContestLobby_EventScript_Reporter": 890,
  "LilycoveCity_ContestLobby_EventScript_AcceptInterview": 990,
  "LilycoveCity_ContestLobby_EventScript_DeclineInterview": 1065,
  "LilycoveCity_ContestLobby_EventScript_SubmitResponse": 1075,
  "LilycoveCity_ContestLobby_EventScript_AlreadyInterviewed": 1158,
  "LilycoveCity_ContestLobby_EventScript_TryShowContestReporter": 1168,
  "LilycoveCity_ContestLobby_EventScript_ShowContestReporter": 1419,
  "LilycoveCity_ContestLobby_EventScript_DontShowContestReporter": 1423,
  "BattleFrontier_BattleTowerLobby_EventScript_Reporter": 1424,
  "BattleFrontier_BattleTowerLobby_EventScript_AcceptInterview": 1524,
  "BattleFrontier_BattleTowerLobby_EventScript_DeclineInterview": 1654,
  "BattleFrontier_BattleTowerLobby_EventScript_Satisfied": 1664,
  "BattleFrontier_BattleTowerLobby_EventScript_Dissatisfied": 1673,
  "BattleFrontier_BattleTowerLobby_EventScript_SubmitResponse": 1682,
  "BattleFrontier_BattleTowerLobby_EventScript_CancelInterview": 1731,
  "BattleFrontier_BattleTowerLobby_EventScript_AlreadyInterviewed": 1741,
  "BattleFrontier_BattleTowerLobby_EventScript_ShowOrHideReporter": 1751,
  "BattleFrontier_BattleTowerLobby_EventScript_HideReporter": 1808,
  "EventScript_ContestLiveInterview": 1812,
  "EventScript_ContestLiveInterviewEnd": 1853,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [38,0,0,58,196,6,109,3,23,5,128,1,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,201,0,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,97,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,172,0,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,23,4,128,5,0,26,5,128,9,128,23,6,128,1,0,5,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,182,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,172,0,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,23,5,128,1,0,6,0,0,0,0,3,16,0,0,0,0,0,10,4,109,3,107,91,23,5,128,2,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,215,1,0,0,7,1,13,128,0,0,26,9,128,6,128,44,105,0,7,1,58,1,0,0,42,105,0,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,111,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,186,1,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,111,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,186,1,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,23,4,128,5,0,26,5,128,9,128,23,6,128,0,0,5,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,196,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,186,1,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,23,5,128,2,0,6,0,0,0,0,3,16,0,0,0,0,0,10,4,109,3,107,91,39,13,128,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,8,0,0,0,7,1,13,128,0,0,23,5,128,3,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,112,3,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,88,2,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,102,3,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,144,3,0,26,10,128,13,128,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,206,2,0,0,34,206,2,0,0,7,1,0,0,0,0,7,1,206,2,0,0,35,0,128,1,0,34,0,128,1,0,35,220,2,0,0,34,220,2,0,0,7,1,0,0,0,0,7,1,220,2,0,0,35,0,128,2,0,34,0,128,2,0,35,234,2,0,0,34,234,2,0,0,7,1,0,0,0,0,7,1,234,2,0,0,3,16,0,0,0,0,0,10,4,6,248,2,0,0,3,16,0,0,0,0,0,10,4,6,248,2,0,0,3,16,0,0,0,0,0,10,4,6,248,2,0,0,3,23,4,128,7,0,26,5,128,9,128,23,6,128,0,0,5,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,7,1,102,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,23,6,128,1,0,5,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,7,1,102,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,26,7,128,10,128,23,5,128,3,0,6,0,0,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,134,4,0,0,23,5,128,6,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,134,4,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,222,3,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,41,4,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,23,4,128,11,0,26,5,128,9,128,23,6,128,0,0,5,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,51,4,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,41,4,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,109,3,23,4,128,24,0,38,0,0,58,16,0,0,0,0,0,10,4,23,4,128,11,0,26,5,128,9,128,23,6,128,1,0,5,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,7,1,41,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,0,0,23,5,128,6,0,6,0,0,0,0,3,16,0,0,0,0,0,10,4,109,3,35,134,64,2,0,34,134,64,2,0,7,5,143,5,0,0,7,5,134,64,0,0,23,5,128,6,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,143,5,0,0,7,1,13,128,0,0,26,0,128,136,64,35,0,128,0,0,34,0,128,0,0,35,143,5,0,0,34,143,5,0,0,7,1,0,0,0,0,7,1,143,5,0,0,35,0,128,2,0,34,0,128,2,0,35,139,5,0,0,34,139,5,0,0,7,1,0,0,0,0,7,1,139,5,0,0,35,0,128,1,0,34,0,128,1,0,35,139,5,0,0,34,139,5,0,0,7,1,0,0,0,0,7,1,139,5,0,0,35,0,128,3,0,34,0,128,3,0,35,139,5,0,0,34,139,5,0,0,7,1,0,0,0,0,7,1,139,5,0,0,35,0,128,4,0,34,0,128,4,0,35,139,5,0,0,34,139,5,0,0,7,1,0,0,0,0,7,1,139,5,0,0,35,0,128,5,0,34,0,128,5,0,35,143,5,0,0,34,143,5,0,0,7,1,0,0,0,0,7,1,143,5,0,0,3,43,34,3,4,4,107,91,44,0,0,7,1,205,6,0,0,23,5,128,7,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,205,6,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,244,5,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,118,6,0,0,7,1,13,128,0,0,3,104,0,0,0,0,103,112,20,8,45,1,26,8,128,13,128,35,13,128,0,0,34,13,128,0,0,8,1,128,6,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,137,6,0,0,8,1,13,128,0,0,16,0,0,0,0,0,10,4,23,4,128,12,0,26,5,128,9,128,5,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,146,6,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,195,6,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,35,13,128,0,0,34,13,128,0,0,7,1,195,6,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,0,0,26,4,128,8,128,23,5,128,7,0,6,0,0,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,35,188,64,0,0,34,188,64,0,0,7,1,16,7,0,0,7,1,188,64,0,0,23,5,128,7,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,16,7,0,0,7,1,13,128,0,0,43,150,3,4,42,150,3,4,23,5,128,8,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,61,7,0,0,7,1,13,128,0,0,23,5,128,8,0,38,0,0,58,4,4] as const;

export const STATS = { ops: 239, bytes: 1854, labels: 40, unknownOps: 0, unresolvedSymbols: 40 } as const;
