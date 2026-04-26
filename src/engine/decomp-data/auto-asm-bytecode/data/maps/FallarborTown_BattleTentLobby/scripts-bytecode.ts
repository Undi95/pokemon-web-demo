// AUTO-GENERATED from data/maps/FallarborTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=217, bytes=1674, labels=43, unknownOps=0, unresolvedSymbols=47

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
  "FallarborTown_BattleTentLobby_EventScript_NoRoomForPrize": 297,
  "FallarborTown_BattleTentLobby_EventScript_PrizeWaiting": 315,
  "FallarborTown_BattleTentLobby_EventScript_LostChallenge": 330,
  "FallarborTown_BattleTentLobby_EventScript_ResumeChallenge": 391,
  "FallarborTown_BattleTentLobby_EventScript_Attendant": 446,
  "FallarborTown_BattleTentLobby_EventScript_AskEnterChallenge": 490,
  "FallarborTown_BattleTentLobby_EventScript_TryEnterChallenge": 636,
  "FallarborTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 852,
  "FallarborTown_BattleTentLobby_EventScript_EnterChallenge": 965,
  "FallarborTown_BattleTentLobby_EventScript_ExplainChallenge": 1024,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMons": 1037,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 1106,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 1119,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 1132,
  "FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 1158,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallenge": 1162,
  "FallarborTown_BattleTentLobby_EventScript_EndCancelChallenge": 1170,
  "FallarborTown_BattleTentLobby_EventScript_WalkToDoor": 1172,
  "FallarborTown_BattleTentLobby_Movement_AttendantWalkToDoor": 1265,
  "FallarborTown_BattleTentLobby_Movement_AttendantEnterDoor": 1269,
  "FallarborTown_BattleTentLobby_Movement_PlayerWalkToDoor": 1272,
  "FallarborTown_BattleTentLobby_Movement_PlayerEnterDoor": 1276,
  "FallarborTown_BattleTentLobby_EventScript_Hiker": 1280,
  "FallarborTown_BattleTentLobby_EventScript_LittleBoy": 1289,
  "FallarborTown_BattleTentLobby_EventScript_Lass": 1298,
  "FallarborTown_BattleTentLobby_EventScript_Scott": 1307,
  "FallarborTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 1334,
  "FallarborTown_BattleTentLobby_EventScript_RulesBoard": 1344,
  "FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard": 1359,
  "FallarborTown_BattleTentLobby_EventScript_RulesLevel": 1602,
  "FallarborTown_BattleTentLobby_EventScript_RulesBattle": 1616,
  "FallarborTown_BattleTentLobby_EventScript_RulesMind": 1630,
  "FallarborTown_BattleTentLobby_EventScript_RulesSkill": 1644,
  "FallarborTown_BattleTentLobby_EventScript_RulesBody": 1658,
  "FallarborTown_BattleTentLobby_EventScript_ExitRules": 1672,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,135,1,0,0,0,0,3,0,134,0,0,0,0,0,4,0,74,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,4,105,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,108,90,106,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,113,4,4,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,113,4,5,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,41,1,0,0,34,41,1,0,0,7,1,0,0,0,0,7,1,41,1,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,104,0,0,0,0,0,0,0,50,114,1,51,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,16,0,0,0,0,0,10,4,0,0,0,105,113,0,255,0,108,90,106,16,0,0,0,0,0,10,4,89,196,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,197,3,0,0,107,91,113,4,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,59,1,0,0,7,5,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,124,2,0,0,34,124,2,0,0,7,1,0,0,0,0,7,1,124,2,0,0,35,0,128,1,0,34,0,128,1,0,35,0,4,0,0,34,0,4,0,0,7,1,0,0,0,0,7,1,0,4,0,0,35,0,128,2,0,34,0,128,2,0,35,138,4,0,0,34,138,4,0,0,7,1,0,0,0,0,7,1,138,4,0,0,35,0,128,127,0,34,0,128,127,0,35,138,4,0,0,34,138,4,0,0,7,1,0,0,0,0,7,1,138,4,0,0,113,207,3,0,113,206,0,0,113,13,2,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,7,1,13,4,0,0,7,1,4,128,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,4,152,1,113,4,2,0,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,134,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,134,4,0,0,34,134,4,0,0,7,1,0,0,0,0,7,1,134,4,0,0,35,0,128,1,0,34,0,128,1,0,35,84,3,0,0,34,84,3,0,0,7,1,0,0,0,0,7,1,84,3,0,0,35,0,128,127,0,34,0,128,127,0,35,134,4,0,0,34,134,4,0,0,7,1,0,0,0,0,7,1,134,4,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,7,1,108,4,0,0,7,1,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,4,105,88,148,4,0,0,58,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,4,89,234,1,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,82,4,0,0,34,82,4,0,0,7,1,0,0,0,0,7,1,82,4,0,0,35,0,128,1,0,34,0,128,1,0,35,95,4,0,0,34,95,4,0,0,7,1,0,0,0,0,7,1,95,4,0,0,16,0,0,0,0,0,10,4,89,146,4,0,0,16,0,0,0,0,0,10,4,89,146,4,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,138,4,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,90,80,0,0,241,4,0,0,81,0,0,241,4,0,0,0,0,80,255,0,248,4,0,0,81,255,0,248,4,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,245,4,0,0,81,0,0,245,4,0,0,0,0,80,255,0,252,4,0,0,81,255,0,252,4,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,15,9,9,9,254,9,84,254,9,9,9,254,9,9,84,254,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,91,44,205,1,7,1,54,5,0,0,16,0,0,0,0,0,10,4,115,209,1,42,205,1,109,90,16,0,0,0,0,0,10,4,109,90,106,16,0,0,0,0,0,10,4,89,79,5,0,0,90,104,0,0,0,0,0,0,0,112,17,0,112,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,66,6,0,0,34,66,6,0,0,7,1,0,0,0,0,7,1,66,6,0,0,35,0,128,1,0,34,0,128,1,0,35,80,6,0,0,34,80,6,0,0,7,1,0,0,0,0,7,1,80,6,0,0,35,0,128,2,0,34,0,128,2,0,35,94,6,0,0,34,94,6,0,0,7,1,0,0,0,0,7,1,94,6,0,0,35,0,128,3,0,34,0,128,3,0,35,108,6,0,0,34,108,6,0,0,7,1,0,0,0,0,7,1,108,6,0,0,35,0,128,4,0,34,0,128,4,0,35,122,6,0,0,34,122,6,0,0,7,1,0,0,0,0,7,1,122,6,0,0,35,0,128,5,0,34,0,128,5,0,35,136,6,0,0,34,136,6,0,0,7,1,0,0,0,0,7,1,136,6,0,0,35,0,128,127,0,34,0,128,127,0,35,136,6,0,0,34,136,6,0,0,7,1,0,0,0,0,7,1,136,6,0,0,90,16,0,0,0,0,0,10,4,89,79,5,0,0,90,16,0,0,0,0,0,10,4,89,79,5,0,0,90,16,0,0,0,0,0,10,4,89,79,5,0,0,90,16,0,0,0,0,0,10,4,89,79,5,0,0,90,16,0,0,0,0,0,10,4,89,79,5,0,0,90,108,90] as const;

export const STATS = { ops: 217, bytes: 1674, labels: 43, unknownOps: 0, unresolvedSymbols: 47 } as const;
