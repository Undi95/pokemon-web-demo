// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=236, bytes=1807, labels=45, unknownOps=0, unresolvedSymbols=53

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
  "VerdanturfTown_BattleTentLobby_EventScript_NoRoomForPrize": 297,
  "VerdanturfTown_BattleTentLobby_EventScript_PrizeWaiting": 315,
  "VerdanturfTown_BattleTentLobby_EventScript_LostChallenge": 330,
  "VerdanturfTown_BattleTentLobby_EventScript_ResumeChallenge": 391,
  "VerdanturfTown_BattleTentLobby_EventScript_Attendant": 454,
  "VerdanturfTown_BattleTentLobby_EventScript_AskEnterChallenge": 498,
  "VerdanturfTown_BattleTentLobby_EventScript_TryEnterChallenge": 644,
  "VerdanturfTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 860,
  "VerdanturfTown_BattleTentLobby_EventScript_EnterChallenge": 973,
  "VerdanturfTown_BattleTentLobby_EventScript_ExplainChallenge": 1032,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMons": 1045,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 1114,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 1127,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 1140,
  "VerdanturfTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 1166,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallenge": 1170,
  "VerdanturfTown_BattleTentLobby_EventScript_EndCancelChallenge": 1178,
  "VerdanturfTown_BattleTentLobby_EventScript_WalkToDoor": 1180,
  "VerdanturfTown_BattleTentLobby_Movement_WalkToDoor": 1273,
  "VerdanturfTown_BattleTentLobby_Movement_AttendantEnterDoor": 1277,
  "VerdanturfTown_BattleTentLobby_Movement_PlayerEnterDoor": 1280,
  "VerdanturfTown_BattleTentLobby_EventScript_AttractGiver": 1284,
  "VerdanturfTown_BattleTentLobby_EventScript_ReceivedAttract": 1350,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy1": 1360,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy2": 1369,
  "VerdanturfTown_BattleTentLobby_EventScript_Scott": 1380,
  "VerdanturfTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 1407,
  "VerdanturfTown_BattleTentLobby_EventScript_LittleBoy": 1417,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBoard": 1428,
  "VerdanturfTown_BattleTentLobby_EventScript_ReadRulesBoard": 1443,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesLevel": 1721,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBasics": 1735,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesNature": 1749,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesMoves": 1763,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesUnderpowered": 1777,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesWhenInDanger": 1791,
  "VerdanturfTown_BattleTentLobby_EventScript_ExitRules": 1805,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,135,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,74,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,4,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,113,4,6,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,113,4,7,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,41,1,0,0,34,41,1,0,0,7,1,0,0,0,0,7,1,41,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,16,0,0,0,0,0,10,4,0,0,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,4,89,196,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,113,4,5,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,205,3,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,59,1,0,0,7,5,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,132,2,0,0,34,132,2,0,0,7,1,0,0,0,0,7,1,132,2,0,0,35,0,128,1,0,34,0,128,1,0,35,8,4,0,0,34,8,4,0,0,7,1,0,0,0,0,7,1,8,4,0,0,35,0,128,2,0,34,0,128,2,0,35,146,4,0,0,34,146,4,0,0,7,1,0,0,0,0,7,1,146,4,0,0,35,0,128,127,0,34,0,128,127,0,35,146,4,0,0,34,146,4,0,0,7,1,0,0,0,0,7,1,146,4,0,0,113,207,2,0,113,206,0,0,113,13,2,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,7,1,21,4,0,0,7,1,4,128,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,4,152,1,113,4,1,0,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,142,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,142,4,0,0,34,142,4,0,0,7,1,0,0,0,0,7,1,142,4,0,0,35,0,128,1,0,34,0,128,1,0,35,92,3,0,0,34,92,3,0,0,7,1,0,0,0,0,7,1,92,3,0,0,35,0,128,127,0,34,0,128,127,0,35,142,4,0,0,34,142,4,0,0,7,1,0,0,0,0,7,1,142,4,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,7,1,116,4,0,0,7,1,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,4,105,88,156,4,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,4,89,242,1,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,90,4,0,0,34,90,4,0,0,7,1,0,0,0,0,7,1,90,4,0,0,35,0,128,1,0,34,0,128,1,0,35,103,4,0,0,34,103,4,0,0,7,1,0,0,0,0,7,1,103,4,0,0,16,0,0,0,0,0,10,4,89,154,4,0,0,16,0,0,0,0,0,10,4,89,154,4,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,146,4,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,90,80,0,0,249,4,0,0,81,0,0,249,4,0,0,0,0,80,255,0,249,4,0,0,81,255,0,249,4,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,253,4,0,0,81,0,0,253,4,0,0,0,0,80,255,0,0,5,0,0,81,255,0,0,5,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,15,9,9,9,254,9,84,254,9,9,84,254,107,91,44,235,0,7,1,70,5,0,0,16,0,0,0,0,0,10,4,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,235,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,107,16,0,0,0,0,0,10,4,109,90,107,91,44,204,1,7,1,127,5,0,0,16,0,0,0,0,0,10,4,115,209,1,42,204,1,109,90,16,0,0,0,0,0,10,4,109,90,107,16,0,0,0,0,0,10,4,109,90,106,16,0,0,0,0,0,10,4,89,163,5,0,0,90,104,0,0,0,0,0,0,0,113,4,12,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,185,6,0,0,34,185,6,0,0,7,1,0,0,0,0,7,1,185,6,0,0,35,0,128,1,0,34,0,128,1,0,35,199,6,0,0,34,199,6,0,0,7,1,0,0,0,0,7,1,199,6,0,0,35,0,128,2,0,34,0,128,2,0,35,213,6,0,0,34,213,6,0,0,7,1,0,0,0,0,7,1,213,6,0,0,35,0,128,3,0,34,0,128,3,0,35,227,6,0,0,34,227,6,0,0,7,1,0,0,0,0,7,1,227,6,0,0,35,0,128,4,0,34,0,128,4,0,35,241,6,0,0,34,241,6,0,0,7,1,0,0,0,0,7,1,241,6,0,0,35,0,128,5,0,34,0,128,5,0,35,255,6,0,0,34,255,6,0,0,7,1,0,0,0,0,7,1,255,6,0,0,35,0,128,6,0,34,0,128,6,0,35,13,7,0,0,34,13,7,0,0,7,1,0,0,0,0,7,1,13,7,0,0,35,0,128,127,0,34,0,128,127,0,35,13,7,0,0,34,13,7,0,0,7,1,0,0,0,0,7,1,13,7,0,0,90,16,0,0,0,0,0,10,4,89,163,5,0,0,90,16,0,0,0,0,0,10,4,89,163,5,0,0,90,16,0,0,0,0,0,10,4,89,163,5,0,0,90,16,0,0,0,0,0,10,4,89,163,5,0,0,90,16,0,0,0,0,0,10,4,89,163,5,0,0,90,16,0,0,0,0,0,10,4,89,163,5,0,0,90,108,90] as const;

export const STATS = { ops: 236, bytes: 1807, labels: 45, unknownOps: 0, unresolvedSymbols: 53 } as const;
