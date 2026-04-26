// AUTO-GENERATED from data/maps/FallarborTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=217, bytes=1422, labels=43, unknownOps=2, unresolvedSymbols=52

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
  "FallarborTown_BattleTentLobby_EventScript_NoRoomForPrize": 285,
  "FallarborTown_BattleTentLobby_EventScript_PrizeWaiting": 303,
  "FallarborTown_BattleTentLobby_EventScript_LostChallenge": 318,
  "FallarborTown_BattleTentLobby_EventScript_ResumeChallenge": 379,
  "FallarborTown_BattleTentLobby_EventScript_Attendant": 434,
  "FallarborTown_BattleTentLobby_EventScript_AskEnterChallenge": 466,
  "FallarborTown_BattleTentLobby_EventScript_TryEnterChallenge": 564,
  "FallarborTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 720,
  "FallarborTown_BattleTentLobby_EventScript_EnterChallenge": 821,
  "FallarborTown_BattleTentLobby_EventScript_ExplainChallenge": 880,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMons": 893,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 938,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 951,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 964,
  "FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 990,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallenge": 994,
  "FallarborTown_BattleTentLobby_EventScript_EndCancelChallenge": 1002,
  "FallarborTown_BattleTentLobby_EventScript_WalkToDoor": 1004,
  "FallarborTown_BattleTentLobby_Movement_AttendantWalkToDoor": 1097,
  "FallarborTown_BattleTentLobby_Movement_AttendantEnterDoor": 1101,
  "FallarborTown_BattleTentLobby_Movement_PlayerWalkToDoor": 1104,
  "FallarborTown_BattleTentLobby_Movement_PlayerEnterDoor": 1108,
  "FallarborTown_BattleTentLobby_EventScript_Hiker": 1112,
  "FallarborTown_BattleTentLobby_EventScript_LittleBoy": 1121,
  "FallarborTown_BattleTentLobby_EventScript_Lass": 1130,
  "FallarborTown_BattleTentLobby_EventScript_Scott": 1139,
  "FallarborTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 1166,
  "FallarborTown_BattleTentLobby_EventScript_RulesBoard": 1176,
  "FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard": 1191,
  "FallarborTown_BattleTentLobby_EventScript_RulesLevel": 1350,
  "FallarborTown_BattleTentLobby_EventScript_RulesBattle": 1364,
  "FallarborTown_BattleTentLobby_EventScript_RulesMind": 1378,
  "FallarborTown_BattleTentLobby_EventScript_RulesSkill": 1392,
  "FallarborTown_BattleTentLobby_EventScript_RulesBody": 1406,
  "FallarborTown_BattleTentLobby_EventScript_ExitRules": 1420,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,123,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,62,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,4,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,113,4,5,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,29,1,0,0,34,29,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,16,0,0,0,0,0,10,0,0,0,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,0,89,196,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,53,3,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,52,2,0,0,34,52,2,0,0,35,0,128,1,0,34,0,128,1,0,35,112,3,0,0,34,112,3,0,0,35,0,128,2,0,34,0,128,2,0,35,226,3,0,0,34,226,3,0,0,35,0,128,127,0,34,0,128,127,0,35,226,3,0,0,34,226,3,0,0,113,207,3,0,113,206,0,0,113,13,2,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,152,1,113,4,2,0,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,222,3,0,0,34,222,3,0,0,35,0,128,0,0,34,0,128,0,0,35,208,2,0,0,34,208,2,0,0,35,0,128,127,0,34,0,128,127,0,35,222,3,0,0,34,222,3,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,88,236,3,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,210,1,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,170,3,0,0,34,170,3,0,0,35,0,128,1,0,34,0,128,1,0,35,183,3,0,0,34,183,3,0,0,16,0,0,0,0,0,10,0,89,234,3,0,0,16,0,0,0,0,0,10,0,89,234,3,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,226,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,80,0,0,73,4,0,0,81,0,0,73,4,0,0,0,0,80,255,0,80,4,0,0,81,255,0,80,4,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,77,4,0,0,81,0,0,77,4,0,0,0,0,80,255,0,84,4,0,0,81,255,0,84,4,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,15,9,9,9,254,9,84,254,9,9,9,254,9,9,84,254,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,205,1,7,1,142,4,0,0,16,0,0,0,0,0,10,0,115,209,1,42,205,1,109,90,16,0,0,0,0,0,10,0,109,90,106,16,0,0,0,0,0,10,0,89,167,4,0,0,90,104,0,0,0,0,0,0,0,112,17,0,112,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,70,5,0,0,34,70,5,0,0,35,0,128,1,0,34,0,128,1,0,35,84,5,0,0,34,84,5,0,0,35,0,128,2,0,34,0,128,2,0,35,98,5,0,0,34,98,5,0,0,35,0,128,3,0,34,0,128,3,0,35,112,5,0,0,34,112,5,0,0,35,0,128,4,0,34,0,128,4,0,35,126,5,0,0,34,126,5,0,0,35,0,128,5,0,34,0,128,5,0,35,140,5,0,0,34,140,5,0,0,35,0,128,127,0,34,0,128,127,0,35,140,5,0,0,34,140,5,0,0,90,16,0,0,0,0,0,10,0,89,167,4,0,0,90,16,0,0,0,0,0,10,0,89,167,4,0,0,90,16,0,0,0,0,0,10,0,89,167,4,0,0,90,16,0,0,0,0,0,10,0,89,167,4,0,0,90,16,0,0,0,0,0,10,0,89,167,4,0,0,90,108,90] as const;

export const STATS = { ops: 217, bytes: 1422, labels: 43, unknownOps: 2, unresolvedSymbols: 52 } as const;
