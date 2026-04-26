// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=236, bytes=1531, labels=45, unknownOps=2, unresolvedSymbols=58

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "VerdanturfTown_BattleTentLobby_MapScripts": 0,
  "VerdanturfTown_BattleTentLobby_OnWarp": 10,
  "VerdanturfTown_BattleTentLobby_EventScript_TurnPlayerNorth": 18,
  "VerdanturfTown_BattleTentLobby_OnFrame": 27,
  "VerdanturfTown_BattleTentLobby_EventScript_GetChallengeStatus": 67,
  "VerdanturfTown_BattleTentLobby_EventScript_QuitWithoutSaving": 76,
  "VerdanturfTown_BattleTentLobby_EventScript_WonChallenge": 134,
  "VerdanturfTown_BattleTentLobby_EventScript_GivePrize": 196,
  "VerdanturfTown_BattleTentLobby_EventScript_NoRoomForPrize": 285,
  "VerdanturfTown_BattleTentLobby_EventScript_PrizeWaiting": 303,
  "VerdanturfTown_BattleTentLobby_EventScript_LostChallenge": 318,
  "VerdanturfTown_BattleTentLobby_EventScript_ResumeChallenge": 379,
  "VerdanturfTown_BattleTentLobby_EventScript_Attendant": 442,
  "VerdanturfTown_BattleTentLobby_EventScript_AskEnterChallenge": 474,
  "VerdanturfTown_BattleTentLobby_EventScript_TryEnterChallenge": 572,
  "VerdanturfTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 728,
  "VerdanturfTown_BattleTentLobby_EventScript_EnterChallenge": 829,
  "VerdanturfTown_BattleTentLobby_EventScript_ExplainChallenge": 888,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMons": 901,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 946,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 959,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 972,
  "VerdanturfTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 998,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallenge": 1002,
  "VerdanturfTown_BattleTentLobby_EventScript_EndCancelChallenge": 1010,
  "VerdanturfTown_BattleTentLobby_EventScript_WalkToDoor": 1012,
  "VerdanturfTown_BattleTentLobby_Movement_WalkToDoor": 1105,
  "VerdanturfTown_BattleTentLobby_Movement_AttendantEnterDoor": 1109,
  "VerdanturfTown_BattleTentLobby_Movement_PlayerEnterDoor": 1112,
  "VerdanturfTown_BattleTentLobby_EventScript_AttractGiver": 1116,
  "VerdanturfTown_BattleTentLobby_EventScript_ReceivedAttract": 1170,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy1": 1180,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy2": 1189,
  "VerdanturfTown_BattleTentLobby_EventScript_Scott": 1200,
  "VerdanturfTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 1227,
  "VerdanturfTown_BattleTentLobby_EventScript_LittleBoy": 1237,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBoard": 1248,
  "VerdanturfTown_BattleTentLobby_EventScript_ReadRulesBoard": 1263,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesLevel": 1445,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBasics": 1459,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesNature": 1473,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesMoves": 1487,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesUnderpowered": 1501,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesWhenInDanger": 1515,
  "VerdanturfTown_BattleTentLobby_EventScript_ExitRules": 1529,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,123,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,62,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,6,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,113,4,7,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,29,1,0,0,34,29,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,16,0,0,0,0,0,10,0,0,0,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,0,89,196,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,5,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,61,3,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,60,2,0,0,34,60,2,0,0,35,0,128,1,0,34,0,128,1,0,35,120,3,0,0,34,120,3,0,0,35,0,128,2,0,34,0,128,2,0,35,234,3,0,0,34,234,3,0,0,35,0,128,127,0,34,0,128,127,0,35,234,3,0,0,34,234,3,0,0,113,207,2,0,113,206,0,0,113,13,2,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,152,1,113,4,1,0,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,230,3,0,0,34,230,3,0,0,35,0,128,0,0,34,0,128,0,0,35,216,2,0,0,34,216,2,0,0,35,0,128,127,0,34,0,128,127,0,35,230,3,0,0,34,230,3,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,88,244,3,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,218,1,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,178,3,0,0,34,178,3,0,0,35,0,128,1,0,34,0,128,1,0,35,191,3,0,0,34,191,3,0,0,16,0,0,0,0,0,10,0,89,242,3,0,0,16,0,0,0,0,0,10,0,89,242,3,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,234,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,80,0,0,81,4,0,0,81,0,0,81,4,0,0,0,0,80,255,0,81,4,0,0,81,255,0,81,4,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,85,4,0,0,81,0,0,85,4,0,0,0,0,80,255,0,88,4,0,0,81,255,0,88,4,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,15,9,9,9,254,9,84,254,9,9,84,254,107,91,44,235,0,7,1,146,4,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,235,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,91,44,204,1,7,1,203,4,0,0,16,0,0,0,0,0,10,0,115,209,1,42,204,1,109,90,16,0,0,0,0,0,10,0,109,90,107,16,0,0,0,0,0,10,0,109,90,106,16,0,0,0,0,0,10,0,89,239,4,0,0,90,104,0,0,0,0,0,0,0,113,4,12,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,165,5,0,0,34,165,5,0,0,35,0,128,1,0,34,0,128,1,0,35,179,5,0,0,34,179,5,0,0,35,0,128,2,0,34,0,128,2,0,35,193,5,0,0,34,193,5,0,0,35,0,128,3,0,34,0,128,3,0,35,207,5,0,0,34,207,5,0,0,35,0,128,4,0,34,0,128,4,0,35,221,5,0,0,34,221,5,0,0,35,0,128,5,0,34,0,128,5,0,35,235,5,0,0,34,235,5,0,0,35,0,128,6,0,34,0,128,6,0,35,249,5,0,0,34,249,5,0,0,35,0,128,127,0,34,0,128,127,0,35,249,5,0,0,34,249,5,0,0,90,16,0,0,0,0,0,10,0,89,239,4,0,0,90,16,0,0,0,0,0,10,0,89,239,4,0,0,90,16,0,0,0,0,0,10,0,89,239,4,0,0,90,16,0,0,0,0,0,10,0,89,239,4,0,0,90,16,0,0,0,0,0,10,0,89,239,4,0,0,90,16,0,0,0,0,0,10,0,89,239,4,0,0,90,108,90] as const;

export const STATS = { ops: 236, bytes: 1531, labels: 45, unknownOps: 2, unresolvedSymbols: 58 } as const;
