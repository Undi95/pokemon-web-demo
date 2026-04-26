// AUTO-GENERATED from data/maps/SlateportCity_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=194, bytes=1279, labels=40, unknownOps=2, unresolvedSymbols=48

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
  "SlateportCity_BattleTentLobby_EventScript_NoRoomForPrize": 267,
  "SlateportCity_BattleTentLobby_EventScript_LostChallenge": 280,
  "SlateportCity_BattleTentLobby_EventScript_EndGivePrize": 326,
  "SlateportCity_BattleTentLobby_EventScript_ResumeChallenge": 341,
  "SlateportCity_BattleTentLobby_EventScript_Attendant": 400,
  "SlateportCity_BattleTentLobby_EventScript_AskEnterChallenge": 432,
  "SlateportCity_BattleTentLobby_EventScript_TryEnterChallenge": 530,
  "SlateportCity_BattleTentLobby_EventScript_SaveBeforeChallenge": 632,
  "SlateportCity_BattleTentLobby_EventScript_EnterChallenge": 733,
  "SlateportCity_BattleTentLobby_EventScript_WalkToDoor": 776,
  "SlateportCity_BattleTentLobby_Movement_AttendantWalkToDoor": 869,
  "SlateportCity_BattleTentLobby_Movement_AttendantEnterDoor": 873,
  "SlateportCity_BattleTentLobby_Movement_PlayerWalkToDoor": 876,
  "SlateportCity_BattleTentLobby_Movement_PlayerEnterDoor": 880,
  "SlateportCity_BattleTentLobby_EventScript_ExplainChallenge": 884,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 897,
  "SlateportCity_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 923,
  "SlateportCity_BattleTentLobby_EventScript_CancelChallenge": 927,
  "SlateportCity_BattleTentLobby_Movement_UnusedEnterDoor": 937,
  "SlateportCity_BattleTentLobby_EventScript_TormentGiver": 942,
  "SlateportCity_BattleTentLobby_EventScript_ReceivedTorment": 996,
  "SlateportCity_BattleTentLobby_EventScript_Man": 1006,
  "SlateportCity_BattleTentLobby_EventScript_Girl": 1015,
  "SlateportCity_BattleTentLobby_EventScript_Woman": 1024,
  "SlateportCity_BattleTentLobby_EventScript_RulesBoard": 1033,
  "SlateportCity_BattleTentLobby_EventScript_ReadRulesBoard": 1048,
  "SlateportCity_BattleTentLobby_EventScript_RulesBasics": 1207,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapPartner": 1221,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNumber": 1235,
  "SlateportCity_BattleTentLobby_EventScript_RulesSwapNotes": 1249,
  "SlateportCity_BattleTentLobby_EventScript_RulesMons": 1263,
  "SlateportCity_BattleTentLobby_EventScript_ExitRules": 1277,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,85,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,24,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,104,0,0,0,0,0,0,0,113,4,4,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,113,4,5,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,11,1,0,0,34,11,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,89,70,1,0,0,16,0,0,0,0,0,10,0,89,70,1,0,0,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,6,2,0,89,221,2,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,18,2,0,0,34,18,2,0,0,35,0,128,1,0,34,0,128,1,0,35,116,3,0,0,34,116,3,0,0,35,0,128,2,0,34,0,128,2,0,35,159,3,0,0,34,159,3,0,0,35,0,128,127,0,34,0,128,127,0,35,159,3,0,0,34,159,3,0,0,113,207,4,0,113,206,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,155,3,0,0,34,155,3,0,0,35,0,128,0,0,34,0,128,0,0,35,120,2,0,0,34,120,2,0,0,35,0,128,127,0,34,0,128,127,0,35,155,3,0,0,34,155,3,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,113,6,0,0,16,0,0,0,0,0,10,0,105,88,8,3,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,80,0,0,101,3,0,0,81,0,0,101,3,0,0,0,0,80,255,0,108,3,0,0,81,255,0,108,3,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,105,3,0,0,81,0,0,105,3,0,0,0,0,80,255,0,112,3,0,0,81,255,0,112,3,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,15,9,9,9,254,9,84,254,9,9,9,254,9,9,84,254,16,0,0,0,0,0,10,0,89,176,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,159,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,9,9,9,84,254,107,91,44,9,1,7,1,228,3,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,9,1,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,24,4,0,0,90,104,0,0,0,0,0,0,0,112,17,0,111,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,183,4,0,0,34,183,4,0,0,35,0,128,1,0,34,0,128,1,0,35,197,4,0,0,34,197,4,0,0,35,0,128,2,0,34,0,128,2,0,35,211,4,0,0,34,211,4,0,0,35,0,128,3,0,34,0,128,3,0,35,225,4,0,0,34,225,4,0,0,35,0,128,4,0,34,0,128,4,0,35,239,4,0,0,34,239,4,0,0,35,0,128,5,0,34,0,128,5,0,35,253,4,0,0,34,253,4,0,0,35,0,128,127,0,34,0,128,127,0,35,253,4,0,0,34,253,4,0,0,90,16,0,0,0,0,0,10,0,89,24,4,0,0,90,16,0,0,0,0,0,10,0,89,24,4,0,0,90,16,0,0,0,0,0,10,0,89,24,4,0,0,90,16,0,0,0,0,0,10,0,89,24,4,0,0,90,16,0,0,0,0,0,10,0,89,24,4,0,0,90,108,90] as const;

export const STATS = { ops: 194, bytes: 1279, labels: 40, unknownOps: 2, unresolvedSymbols: 48 } as const;
