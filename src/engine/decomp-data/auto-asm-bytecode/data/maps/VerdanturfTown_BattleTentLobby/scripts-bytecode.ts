// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=236, bytes=1134, labels=45, unknownOps=8, unresolvedSymbols=56

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
  "VerdanturfTown_BattleTentLobby_EventScript_NoRoomForPrize": 260,
  "VerdanturfTown_BattleTentLobby_EventScript_PrizeWaiting": 278,
  "VerdanturfTown_BattleTentLobby_EventScript_LostChallenge": 293,
  "VerdanturfTown_BattleTentLobby_EventScript_ResumeChallenge": 354,
  "VerdanturfTown_BattleTentLobby_EventScript_Attendant": 417,
  "VerdanturfTown_BattleTentLobby_EventScript_AskEnterChallenge": 449,
  "VerdanturfTown_BattleTentLobby_EventScript_TryEnterChallenge": 462,
  "VerdanturfTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 553,
  "VerdanturfTown_BattleTentLobby_EventScript_EnterChallenge": 654,
  "VerdanturfTown_BattleTentLobby_EventScript_ExplainChallenge": 713,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMons": 726,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 726,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 739,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 752,
  "VerdanturfTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 778,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallenge": 782,
  "VerdanturfTown_BattleTentLobby_EventScript_EndCancelChallenge": 790,
  "VerdanturfTown_BattleTentLobby_EventScript_WalkToDoor": 792,
  "VerdanturfTown_BattleTentLobby_Movement_WalkToDoor": 884,
  "VerdanturfTown_BattleTentLobby_Movement_AttendantEnterDoor": 884,
  "VerdanturfTown_BattleTentLobby_Movement_PlayerEnterDoor": 884,
  "VerdanturfTown_BattleTentLobby_EventScript_AttractGiver": 884,
  "VerdanturfTown_BattleTentLobby_EventScript_ReceivedAttract": 938,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy1": 948,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy2": 957,
  "VerdanturfTown_BattleTentLobby_EventScript_Scott": 968,
  "VerdanturfTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 995,
  "VerdanturfTown_BattleTentLobby_EventScript_LittleBoy": 1005,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBoard": 1016,
  "VerdanturfTown_BattleTentLobby_EventScript_ReadRulesBoard": 1031,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesLevel": 1048,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBasics": 1062,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesNature": 1076,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesMoves": 1090,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesUnderpowered": 1104,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesWhenInDanger": 1118,
  "VerdanturfTown_BattleTentLobby_EventScript_ExitRules": 1132,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,98,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,37,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,6,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,113,4,7,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,16,0,0,0,0,0,10,0,0,0,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,0,89,196,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,5,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,142,2,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,113,207,2,0,113,206,0,0,113,13,2,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,152,1,113,4,1,0,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,88,24,3,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,193,1,0,0,16,0,0,0,0,0,10,0,89,22,3,0,0,16,0,0,0,0,0,10,0,89,22,3,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,14,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,80,0,0,116,3,0,0,81,0,0,116,3,0,0,0,0,80,255,0,116,3,0,0,81,255,0,116,3,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,116,3,0,0,81,0,0,116,3,0,0,0,0,80,255,0,116,3,0,0,81,255,0,116,3,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,107,91,44,235,0,7,1,170,3,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,235,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,91,44,204,1,7,1,227,3,0,0,16,0,0,0,0,0,10,0,115,209,1,42,204,1,109,90,16,0,0,0,0,0,10,0,109,90,107,16,0,0,0,0,0,10,0,109,90,106,16,0,0,0,0,0,10,0,89,7,4,0,0,90,104,0,0,0,0,0,0,0,113,4,12,0,38,0,0,0,90,16,0,0,0,0,0,10,0,89,7,4,0,0,90,16,0,0,0,0,0,10,0,89,7,4,0,0,90,16,0,0,0,0,0,10,0,89,7,4,0,0,90,16,0,0,0,0,0,10,0,89,7,4,0,0,90,16,0,0,0,0,0,10,0,89,7,4,0,0,90,16,0,0,0,0,0,10,0,89,7,4,0,0,90,108,90] as const;

export const STATS = { ops: 236, bytes: 1134, labels: 45, unknownOps: 8, unresolvedSymbols: 56 } as const;
