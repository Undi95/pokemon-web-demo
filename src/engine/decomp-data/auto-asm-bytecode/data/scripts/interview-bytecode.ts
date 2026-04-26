// AUTO-GENERATED from data/scripts/interview-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=239, bytes=1277, labels=40, unknownOps=2, unresolvedSymbols=47

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
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion1": 481,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion2": 495,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion3": 509,
  "SlateportCity_PokemonFanClub_EventScript_ContinueInterview": 523,
  "SlateportCity_PokemonFanClub_EventScript_DeclineInterview": 605,
  "SlateportCity_PokemonFanClub_EventScript_AlreadyInterviewed": 615,
  "LilycoveCity_ContestLobby_EventScript_Reporter": 625,
  "LilycoveCity_ContestLobby_EventScript_AcceptInterview": 688,
  "LilycoveCity_ContestLobby_EventScript_DeclineInterview": 737,
  "LilycoveCity_ContestLobby_EventScript_SubmitResponse": 747,
  "LilycoveCity_ContestLobby_EventScript_AlreadyInterviewed": 814,
  "LilycoveCity_ContestLobby_EventScript_TryShowContestReporter": 824,
  "LilycoveCity_ContestLobby_EventScript_ShowContestReporter": 978,
  "LilycoveCity_ContestLobby_EventScript_DontShowContestReporter": 982,
  "BattleFrontier_BattleTowerLobby_EventScript_Reporter": 983,
  "BattleFrontier_BattleTowerLobby_EventScript_AcceptInterview": 1046,
  "BattleFrontier_BattleTowerLobby_EventScript_DeclineInterview": 1129,
  "BattleFrontier_BattleTowerLobby_EventScript_Satisfied": 1139,
  "BattleFrontier_BattleTowerLobby_EventScript_Dissatisfied": 1148,
  "BattleFrontier_BattleTowerLobby_EventScript_SubmitResponse": 1157,
  "BattleFrontier_BattleTowerLobby_EventScript_CancelInterview": 1193,
  "BattleFrontier_BattleTowerLobby_EventScript_AlreadyInterviewed": 1203,
  "BattleFrontier_BattleTowerLobby_EventScript_ShowOrHideReporter": 1213,
  "BattleFrontier_BattleTowerLobby_EventScript_HideReporter": 1245,
  "EventScript_ContestLiveInterview": 1249,
  "EventScript_ContestLiveInterviewEnd": 1276,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [38,0,0,0,0,6,109,90,113,5,1,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,5,0,26,5,128,9,128,113,6,1,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,5,1,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,44,105,0,7,1,213,0,0,0,42,105,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,5,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,5,2,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,113,5,3,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,144,3,0,26,10,128,13,128,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,225,1,0,0,34,225,1,0,0,35,0,128,1,0,34,0,128,1,0,35,239,1,0,0,34,239,1,0,0,35,0,128,2,0,34,0,128,2,0,35,253,1,0,0,34,253,1,0,0,90,16,0,0,0,0,0,10,0,89,11,2,0,0,90,16,0,0,0,0,0,10,0,89,11,2,0,0,90,16,0,0,0,0,0,10,0,89,11,2,0,0,90,113,4,7,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,6,1,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,26,7,128,10,128,113,5,3,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,0,0,7,1,46,3,0,0,113,5,6,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,11,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,113,4,24,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,11,0,26,5,128,9,128,113,6,1,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,0,0,113,5,6,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,35,134,64,2,0,34,134,64,2,0,113,5,6,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,0,128,136,64,35,0,128,0,0,34,0,128,0,0,35,214,3,0,0,34,214,3,0,0,35,0,128,2,0,34,0,128,2,0,35,210,3,0,0,34,210,3,0,0,35,0,128,1,0,34,0,128,1,0,35,210,3,0,0,34,210,3,0,0,35,0,128,3,0,34,0,128,3,0,35,210,3,0,0,34,210,3,0,0,35,0,128,4,0,34,0,128,4,0,35,210,3,0,0,34,210,3,0,0,35,0,128,5,0,34,0,128,5,0,35,214,3,0,0,34,214,3,0,0,90,43,34,3,15,15,107,91,44,0,0,7,1,179,4,0,0,113,5,7,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,104,0,0,0,0,0,0,0,112,20,8,45,1,26,8,128,13,128,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,113,4,12,0,26,5,128,9,128,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,0,0,26,4,128,8,128,113,5,7,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,35,188,64,0,0,34,188,64,0,0,113,5,7,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,43,150,3,15,42,150,3,15,113,5,8,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,113,5,8,0,38,0,0,0,15,15] as const;

export const STATS = { ops: 239, bytes: 1277, labels: 40, unknownOps: 2, unresolvedSymbols: 47 } as const;
