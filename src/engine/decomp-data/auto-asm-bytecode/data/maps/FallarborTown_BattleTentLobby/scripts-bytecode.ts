// AUTO-GENERATED from data/maps/FallarborTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=217, bytes=1041, labels=43, unknownOps=8, unresolvedSymbols=50

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FallarborTown_BattleTentLobby_MapScripts": 0,
  "FallarborTown_BattleTentLobby_OnWarp": 10,
  "FallarborTown_BattleTentLobby_EventScript_TurnPlayerNorth": 18,
  "FallarborTown_BattleTentLobby_OnFrame": 27,
  "FallarborTown_BattleTentLobby_EventScript_GetChallengeStatus": 67,
  "FallarborTown_BattleTentLobby_EventScript_QuitWithoutSaving": 76,
  "FallarborTown_BattleTentLobby_EventScript_WonChallenge": 134,
  "FallarborTown_BattleTentLobby_EventScript_GivePrize": 196,
  "FallarborTown_BattleTentLobby_EventScript_NoRoomForPrize": 260,
  "FallarborTown_BattleTentLobby_EventScript_PrizeWaiting": 278,
  "FallarborTown_BattleTentLobby_EventScript_LostChallenge": 293,
  "FallarborTown_BattleTentLobby_EventScript_ResumeChallenge": 354,
  "FallarborTown_BattleTentLobby_EventScript_Attendant": 409,
  "FallarborTown_BattleTentLobby_EventScript_AskEnterChallenge": 441,
  "FallarborTown_BattleTentLobby_EventScript_TryEnterChallenge": 454,
  "FallarborTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 545,
  "FallarborTown_BattleTentLobby_EventScript_EnterChallenge": 646,
  "FallarborTown_BattleTentLobby_EventScript_ExplainChallenge": 705,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMons": 718,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 718,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 731,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 744,
  "FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 770,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallenge": 774,
  "FallarborTown_BattleTentLobby_EventScript_EndCancelChallenge": 782,
  "FallarborTown_BattleTentLobby_EventScript_WalkToDoor": 784,
  "FallarborTown_BattleTentLobby_Movement_AttendantWalkToDoor": 876,
  "FallarborTown_BattleTentLobby_Movement_AttendantEnterDoor": 876,
  "FallarborTown_BattleTentLobby_Movement_PlayerWalkToDoor": 876,
  "FallarborTown_BattleTentLobby_Movement_PlayerEnterDoor": 876,
  "FallarborTown_BattleTentLobby_EventScript_Hiker": 876,
  "FallarborTown_BattleTentLobby_EventScript_LittleBoy": 885,
  "FallarborTown_BattleTentLobby_EventScript_Lass": 894,
  "FallarborTown_BattleTentLobby_EventScript_Scott": 903,
  "FallarborTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 930,
  "FallarborTown_BattleTentLobby_EventScript_RulesBoard": 940,
  "FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard": 955,
  "FallarborTown_BattleTentLobby_EventScript_RulesLevel": 969,
  "FallarborTown_BattleTentLobby_EventScript_RulesBattle": 983,
  "FallarborTown_BattleTentLobby_EventScript_RulesMind": 997,
  "FallarborTown_BattleTentLobby_EventScript_RulesSkill": 1011,
  "FallarborTown_BattleTentLobby_EventScript_RulesBody": 1025,
  "FallarborTown_BattleTentLobby_EventScript_ExitRules": 1039,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,98,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,37,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,4,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,113,4,5,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,16,0,0,0,0,0,10,0,0,0,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,0,89,196,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,134,2,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,113,207,3,0,113,206,0,0,113,13,2,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,152,1,113,4,2,0,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,88,16,3,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,185,1,0,0,16,0,0,0,0,0,10,0,89,14,3,0,0,16,0,0,0,0,0,10,0,89,14,3,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,6,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,80,0,0,108,3,0,0,81,0,0,108,3,0,0,0,0,80,255,0,108,3,0,0,81,255,0,108,3,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,108,3,0,0,81,0,0,108,3,0,0,0,0,80,255,0,108,3,0,0,81,255,0,108,3,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,205,1,7,1,162,3,0,0,16,0,0,0,0,0,10,0,115,209,1,42,205,1,109,90,16,0,0,0,0,0,10,0,109,90,106,16,0,0,0,0,0,10,0,89,187,3,0,0,90,104,0,0,0,0,0,0,0,112,17,0,112,0,90,16,0,0,0,0,0,10,0,89,187,3,0,0,90,16,0,0,0,0,0,10,0,89,187,3,0,0,90,16,0,0,0,0,0,10,0,89,187,3,0,0,90,16,0,0,0,0,0,10,0,89,187,3,0,0,90,16,0,0,0,0,0,10,0,89,187,3,0,0,90,108,90] as const;

export const STATS = { ops: 217, bytes: 1041, labels: 43, unknownOps: 8, unresolvedSymbols: 50 } as const;
