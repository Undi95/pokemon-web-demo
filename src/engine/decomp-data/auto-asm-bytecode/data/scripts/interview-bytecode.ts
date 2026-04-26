// AUTO-GENERATED from data/scripts/interview-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=239, bytes=1829, labels=40, unknownOps=0, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Interview_EventScript_EndInterview": 0,
  "SlateportCity_PokemonFanClub_EventScript_ReporterNoNickname": 8,
  "SlateportCity_PokemonFanClub_EventScript_AcceptInterview2": 96,
  "SlateportCity_PokemonFanClub_EventScript_DeclineInterview2": 169,
  "SlateportCity_PokemonFanClub_EventScript_SubmitResponse2": 179,
  "SlateportCity_PokemonFanClub_EventScript_AlreadyInterviewed2": 197,
  "SlateportCity_OceanicMuseum_1F_EventScript_Reporter": 207,
  "SlateportCity_OceanicMuseum_1F_EventScript_RequestInterviewShort": 309,
  "SlateportCity_OceanicMuseum_1F_EventScript_AcceptInterview": 362,
  "SlateportCity_OceanicMuseum_1F_EventScript_DeclineInterview": 435,
  "SlateportCity_OceanicMuseum_1F_EventScript_SubmitResponse": 445,
  "SlateportCity_OceanicMuseum_1F_EventScript_AlreadyInterviewed": 463,
  "SlateportCity_PokemonFanClub_EventScript_Reporter": 473,
  "SlateportCity_PokemonFanClub_EventScript_AcceptInterview": 591,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion1": 709,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion2": 723,
  "SlateportCity_PokemonFanClub_EventScript_RandomQuestion3": 737,
  "SlateportCity_PokemonFanClub_EventScript_ContinueInterview": 751,
  "SlateportCity_PokemonFanClub_EventScript_DeclineInterview": 857,
  "SlateportCity_PokemonFanClub_EventScript_AlreadyInterviewed": 867,
  "LilycoveCity_ContestLobby_EventScript_Reporter": 877,
  "LilycoveCity_ContestLobby_EventScript_AcceptInterview": 976,
  "LilycoveCity_ContestLobby_EventScript_DeclineInterview": 1049,
  "LilycoveCity_ContestLobby_EventScript_SubmitResponse": 1059,
  "LilycoveCity_ContestLobby_EventScript_AlreadyInterviewed": 1138,
  "LilycoveCity_ContestLobby_EventScript_TryShowContestReporter": 1148,
  "LilycoveCity_ContestLobby_EventScript_ShowContestReporter": 1398,
  "LilycoveCity_ContestLobby_EventScript_DontShowContestReporter": 1402,
  "BattleFrontier_BattleTowerLobby_EventScript_Reporter": 1403,
  "BattleFrontier_BattleTowerLobby_EventScript_AcceptInterview": 1502,
  "BattleFrontier_BattleTowerLobby_EventScript_DeclineInterview": 1633,
  "BattleFrontier_BattleTowerLobby_EventScript_Satisfied": 1643,
  "BattleFrontier_BattleTowerLobby_EventScript_Dissatisfied": 1652,
  "BattleFrontier_BattleTowerLobby_EventScript_SubmitResponse": 1661,
  "BattleFrontier_BattleTowerLobby_EventScript_CancelInterview": 1709,
  "BattleFrontier_BattleTowerLobby_EventScript_AlreadyInterviewed": 1719,
  "BattleFrontier_BattleTowerLobby_EventScript_ShowOrHideReporter": 1729,
  "BattleFrontier_BattleTowerLobby_EventScript_HideReporter": 1785,
  "EventScript_ContestLiveInterview": 1789,
  "EventScript_ContestLiveInterviewEnd": 1828,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [38,0,0,0,0,6,109,90,113,5,1,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,197,0,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,96,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,169,0,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,5,0,26,5,128,9,128,113,6,1,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,179,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,169,0,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,5,1,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,207,1,0,0,7,1,13,128,0,0,26,9,128,6,128,44,105,0,7,1,53,1,0,0,42,105,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,106,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,179,1,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,106,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,179,1,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,5,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,189,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,179,1,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,5,2,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,107,91,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,8,0,0,0,7,1,13,128,0,0,113,5,3,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,99,3,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,79,2,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,89,3,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,144,3,0,26,10,128,13,128,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,197,2,0,0,34,197,2,0,0,7,1,0,0,0,0,7,1,197,2,0,0,35,0,128,1,0,34,0,128,1,0,35,211,2,0,0,34,211,2,0,0,7,1,0,0,0,0,7,1,211,2,0,0,35,0,128,2,0,34,0,128,2,0,35,225,2,0,0,34,225,2,0,0,7,1,0,0,0,0,7,1,225,2,0,0,90,16,0,0,0,0,0,10,0,89,239,2,0,0,90,16,0,0,0,0,0,10,0,89,239,2,0,0,90,16,0,0,0,0,0,10,0,89,239,2,0,0,90,113,4,7,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,7,1,89,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,113,6,1,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,7,1,89,3,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,26,7,128,10,128,113,5,3,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,0,0,7,1,114,4,0,0,113,5,6,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,114,4,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,208,3,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,25,4,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,113,4,11,0,26,5,128,9,128,113,6,0,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,35,4,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,25,4,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,113,4,24,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,11,0,26,5,128,9,128,113,6,1,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,7,1,25,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,42,0,0,113,5,6,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,35,134,64,2,0,34,134,64,2,0,7,5,122,5,0,0,7,5,134,64,0,0,113,5,6,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,122,5,0,0,7,1,13,128,0,0,26,0,128,136,64,35,0,128,0,0,34,0,128,0,0,35,122,5,0,0,34,122,5,0,0,7,1,0,0,0,0,7,1,122,5,0,0,35,0,128,2,0,34,0,128,2,0,35,118,5,0,0,34,118,5,0,0,7,1,0,0,0,0,7,1,118,5,0,0,35,0,128,1,0,34,0,128,1,0,35,118,5,0,0,34,118,5,0,0,7,1,0,0,0,0,7,1,118,5,0,0,35,0,128,3,0,34,0,128,3,0,35,118,5,0,0,34,118,5,0,0,7,1,0,0,0,0,7,1,118,5,0,0,35,0,128,4,0,34,0,128,4,0,35,118,5,0,0,34,118,5,0,0,7,1,0,0,0,0,7,1,118,5,0,0,35,0,128,5,0,34,0,128,5,0,35,122,5,0,0,34,122,5,0,0,7,1,0,0,0,0,7,1,122,5,0,0,90,43,34,3,15,15,107,91,44,0,0,7,1,183,6,0,0,113,5,7,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,183,6,0,0,7,1,13,128,0,0,26,9,128,6,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,222,5,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,97,6,0,0,7,1,13,128,0,0,90,104,0,0,0,0,0,0,0,112,20,8,45,1,26,8,128,13,128,35,13,128,0,0,34,13,128,0,0,8,1,107,6,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,116,6,0,0,8,1,13,128,0,0,16,0,0,0,0,0,10,0,113,4,12,0,26,5,128,9,128,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,125,6,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,173,6,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,35,13,128,0,0,34,13,128,0,0,7,1,173,6,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,42,0,0,26,4,128,8,128,113,5,7,0,89,0,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,35,188,64,0,0,34,188,64,0,0,7,1,249,6,0,0,7,1,188,64,0,0,113,5,7,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,249,6,0,0,7,1,13,128,0,0,43,150,3,15,42,150,3,15,113,5,8,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,36,7,0,0,7,1,13,128,0,0,113,5,8,0,38,0,0,0,15,15] as const;

export const STATS = { ops: 239, bytes: 1829, labels: 40, unknownOps: 0, unresolvedSymbols: 47 } as const;
