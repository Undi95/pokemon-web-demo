// AUTO-GENERATED from data/maps/SlateportCity_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=194, bytes=1495, labels=40, unknownOps=0, unresolvedSymbols=43

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_BattleTentLobby_MapScripts": 0,
  "SlateportCity_BattleTentLobby_OnWarp": 10,
  "SlateportCity_BattleTentLobby_EventScript_TurnPlayerNorth": 18,
  "SlateportCity_BattleTentLobby_OnFrame": 27,
  "SlateportCity_BattleTentLobby_EventScript_GetChallengeStatus": 67,
  "SlateportCity_BattleTentLobby_EventScript_QuitWithoutSaving": 76,
  "SlateportCity_BattleTentLobby_EventScript_WonChallenge": 134,
  "SlateportCity_BattleTentLobby_EventScript_GivePrize": 188,
  "SlateportCity_BattleTentLobby_EventScript_NoRoomForPrize": 279,
  "SlateportCity_BattleTentLobby_EventScript_LostChallenge": 292,
  "SlateportCity_BattleTentLobby_EventScript_EndGivePrize": 338,
  "SlateportCity_BattleTentLobby_EventScript_ResumeChallenge": 353,
  "SlateportCity_BattleTentLobby_EventScript_Attendant": 412,
  "SlateportCity_BattleTentLobby_EventScript_AskEnterChallenge": 456,
  "SlateportCity_BattleTentLobby_EventScript_TryEnterChallenge": 602,
  "SlateportCity_BattleTentLobby_EventScript_SaveBeforeChallenge": 740,
  "SlateportCity_BattleTentLobby_EventScript_EnterChallenge": 853,
  "SlateportCity_BattleTentLobby_EventScript_WalkToDoor": 896,
  "SlateportCity_BattleTentLobby_Movement_AttendantWalkToDoor": 989,
  "SlateportCity_BattleTentLobby_Movement_AttendantEnterDoor": 993,
  "SlateportCity_BattleTentLobby_Movement_PlayerWalkToDoor": 996,
  "SlateportCity_BattleTentLobby_Movement_PlayerEnterDoor": 1000,
  "SlateportCity_BattleTentLobby_EventScript_ExplainChallenge": 1004,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 1017,
  "SlateportCity_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 1043,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallenge": 1047,
  "SlateportCity_BattleTentLobby_Movement_UnusedEnterDoor": 1057,
  "SlateportCity_BattleTentLobby_EventScript_TormentGiver": 1062,
  "SlateportCity_BattleTentLobby_EventScript_ReceivedTorment": 1128,
  "SlateportCity_BattleTentLobby_EventScript_Man": 1138,
  "SlateportCity_BattleTentLobby_EventScript_Girl": 1147,
  "SlateportCity_BattleTentLobby_EventScript_Woman": 1156,
  "SlateportCity_BattleTentLobby_EventScript_RulesBoard": 1165,
  "SlateportCity_BattleTentLobby_EventScript_ReadRulesBoard": 1180,
  "SlateportCity_BattleTentLobby_EventScript_RulesBasics": 1423,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapPartner": 1437,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNumber": 1451,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNotes": 1465,
  "SlateportCity_BattleTentLobby_EventScript_RulesMons": 1479,
  "SlateportCity_BattleTentLobby_EventScript_ExitRules": 1493,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,97,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,36,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,4,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,104,0,0,0,0,0,0,0,113,4,4,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,113,4,5,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,23,1,0,0,34,23,1,0,0,7,1,0,0,0,0,7,1,23,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,89,82,1,0,0,16,0,0,0,0,0,10,4,89,82,1,0,0,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,6,2,0,89,85,3,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,188,0,0,0,7,5,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,90,2,0,0,34,90,2,0,0,7,1,0,0,0,0,7,1,90,2,0,0,35,0,128,1,0,34,0,128,1,0,35,236,3,0,0,34,236,3,0,0,7,1,0,0,0,0,7,1,236,3,0,0,35,0,128,2,0,34,0,128,2,0,35,23,4,0,0,34,23,4,0,0,7,1,0,0,0,0,7,1,23,4,0,0,35,0,128,127,0,34,0,128,127,0,35,23,4,0,0,34,23,4,0,0,7,1,0,0,0,0,7,1,23,4,0,0,113,207,4,0,113,206,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,19,4,0,0,34,19,4,0,0,7,1,0,0,0,0,7,1,19,4,0,0,35,0,128,1,0,34,0,128,1,0,35,228,2,0,0,34,228,2,0,0,7,1,0,0,0,0,7,1,228,2,0,0,35,0,128,127,0,34,0,128,127,0,35,19,4,0,0,34,19,4,0,0,7,1,0,0,0,0,7,1,19,4,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,7,1,249,3,0,0,7,1,13,128,0,0,113,6,0,0,16,0,0,0,0,0,10,4,105,88,128,3,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,80,0,0,221,3,0,0,81,0,0,221,3,0,0,0,0,80,255,0,228,3,0,0,81,255,0,228,3,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,225,3,0,0,81,0,0,225,3,0,0,0,0,80,255,0,232,3,0,0,81,255,0,232,3,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,15,9,9,9,254,9,84,254,9,9,9,254,9,9,84,254,16,0,0,0,0,0,10,4,89,200,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,23,4,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,90,9,9,9,84,254,107,91,44,9,1,7,1,104,4,0,0,16,0,0,0,0,0,10,4,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,9,1,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,106,16,0,0,0,0,0,10,4,89,156,4,0,0,90,104,0,0,0,0,0,0,0,112,17,0,111,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,143,5,0,0,34,143,5,0,0,7,1,0,0,0,0,7,1,143,5,0,0,35,0,128,1,0,34,0,128,1,0,35,157,5,0,0,34,157,5,0,0,7,1,0,0,0,0,7,1,157,5,0,0,35,0,128,2,0,34,0,128,2,0,35,171,5,0,0,34,171,5,0,0,7,1,0,0,0,0,7,1,171,5,0,0,35,0,128,3,0,34,0,128,3,0,35,185,5,0,0,34,185,5,0,0,7,1,0,0,0,0,7,1,185,5,0,0,35,0,128,4,0,34,0,128,4,0,35,199,5,0,0,34,199,5,0,0,7,1,0,0,0,0,7,1,199,5,0,0,35,0,128,5,0,34,0,128,5,0,35,213,5,0,0,34,213,5,0,0,7,1,0,0,0,0,7,1,213,5,0,0,35,0,128,127,0,34,0,128,127,0,35,213,5,0,0,34,213,5,0,0,7,1,0,0,0,0,7,1,213,5,0,0,90,16,0,0,0,0,0,10,4,89,156,4,0,0,90,16,0,0,0,0,0,10,4,89,156,4,0,0,90,16,0,0,0,0,0,10,4,89,156,4,0,0,90,16,0,0,0,0,0,10,4,89,156,4,0,0,90,16,0,0,0,0,0,10,4,89,156,4,0,0,90,108,90] as const;

export const STATS = { ops: 194, bytes: 1495, labels: 40, unknownOps: 0, unresolvedSymbols: 43 } as const;
