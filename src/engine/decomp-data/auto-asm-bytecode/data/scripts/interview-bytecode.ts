// AUTO-GENERATED from data/scripts/interview-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=239, bytes=1079, labels=40, unknownOps=5, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Interview_EventScript_EndInterview": 0,
  "SlateportCity_PokemonFanClub_EventScript_ReporterNoNickname": 8,
  "SlateportCity_PokemonFanClub_EventScript_AcceptInterview2": 60,
  "SlateportCity_PokemonFanClub_EventScript_DeclineInterview2": 109,
  "SlateportCity_PokemonFanClub_EventScript_SubmitResponse2": 119,
  "SlateportCity_PokemonFanClub_EventScript_AlreadyInterviewed2": 137,
  "SlateportCity_OceanicMuseum_1F_EventScript_Reporter": 147,
  "SlateportCity_OceanicMuseum_1F_EventScript_RequestInterviewShort": 213,
  "SlateportCity_OceanicMuseum_1F_EventScript_AcceptInterview": 242,
  "SlateportCity_OceanicMuseum_1F_EventScript_DeclineInterview": 291,
  "SlateportCity_OceanicMuseum_1F_EventScript_SubmitResponse": 301,
  "SlateportCity_OceanicMuseum_1F_EventScript_AlreadyInterviewed": 319,
  "SlateportCity_PokemonFanClub_EventScript_Reporter": 329,
  "SlateportCity_PokemonFanClub_EventScript_AcceptInterview": 399,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion1": 416,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion2": 430,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion3": 444,
  "SlateportCity_PokemonFanClub_EventScript_ContinueInterview": 458,
  "SlateportCity_PokemonFanClub_EventScript_DeclineInterview": 540,
  "SlateportCity_PokemonFanClub_EventScript_AlreadyInterviewed": 550,
  "LilycoveCity_ContestLobby_EventScript_Reporter": 560,
  "LilycoveCity_ContestLobby_EventScript_AcceptInterview": 623,
  "LilycoveCity_ContestLobby_EventScript_DeclineInterview": 672,
  "LilycoveCity_ContestLobby_EventScript_SubmitResponse": 682,
  "LilycoveCity_ContestLobby_EventScript_AlreadyInterviewed": 749,
  "LilycoveCity_ContestLobby_EventScript_TryShowContestReporter": 759,
  "LilycoveCity_ContestLobby_EventScript_ShowContestReporter": 788,
  "LilycoveCity_ContestLobby_EventScript_DontShowContestReporter": 791,
  "BattleFrontier_BattleTowerLobby_EventScript_Reporter": 791,
  "BattleFrontier_BattleTowerLobby_EventScript_AcceptInterview": 854,
  "BattleFrontier_BattleTowerLobby_EventScript_DeclineInterview": 937,
  "BattleFrontier_BattleTowerLobby_EventScript_Satisfied": 947,
  "BattleFrontier_BattleTowerLobby_EventScript_Dissatisfied": 955,
  "BattleFrontier_BattleTowerLobby_EventScript_SubmitResponse": 963,
  "BattleFrontier_BattleTowerLobby_EventScript_CancelInterview": 999,
  "BattleFrontier_BattleTowerLobby_EventScript_AlreadyInterviewed": 1009,
  "BattleFrontier_BattleTowerLobby_EventScript_ShowOrHideReporter": 1019,
  "BattleFrontier_BattleTowerLobby_EventScript_HideReporter": 1050,
  "EventScript_ContestLiveInterview": 1053,
  "EventScript_ContestLiveInterviewEnd": 1079,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [38,0,0,0,0,6,109,90,113,5,1,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,5,0,26,5,128,9,128,113,6,1,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,5,1,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,44,105,0,7,1,213,0,0,0,42,105,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,5,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,5,2,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,113,5,3,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,144,3,0,26,10,128,13,128,90,16,0,0,0,0,0,10,0,89,202,1,0,0,90,16,0,0,0,0,0,10,0,89,202,1,0,0,90,16,0,0,0,0,0,10,0,89,202,1,0,0,90,113,4,7,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,6,1,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,26,7,128,10,128,113,5,3,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,0,0,7,1,237,2,0,0,113,5,6,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,11,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,113,4,24,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,11,0,26,5,128,9,128,113,6,1,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,0,0,113,5,6,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,35,134,64,2,0,34,134,64,2,0,113,5,6,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,90,43,34,3,107,91,44,0,0,7,1,241,3,0,0,113,5,7,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,104,0,0,0,0,0,0,0,112,20,8,45,1,26,8,128,13,128,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,113,4,12,0,26,5,128,9,128,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,0,0,26,4,128,8,128,113,5,7,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,35,188,64,0,0,34,188,64,0,0,113,5,7,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,43,150,3,42,150,3,113,5,8,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,113,5,8,0,38,0,0,0] as const;

export const STATS = { ops: 239, bytes: 1079, labels: 40, unknownOps: 5, unresolvedSymbols: 47 } as const;
