// AUTO-GENERATED from data/maps/FallarborTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=217, bytes=1724, labels=43, unknownOps=0, unresolvedSymbols=87

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FallarborTown_BattleTentLobby_MapScripts": 0,
  "FallarborTown_BattleTentLobby_OnWarp": 10,
  "FallarborTown_BattleTentLobby_EventScript_TurnPlayerNorth": 18,
  "FallarborTown_BattleTentLobby_OnFrame": 28,
  "FallarborTown_BattleTentLobby_EventScript_GetChallengeStatus": 68,
  "FallarborTown_BattleTentLobby_EventScript_QuitWithoutSaving": 78,
  "FallarborTown_BattleTentLobby_EventScript_WonChallenge": 143,
  "FallarborTown_BattleTentLobby_EventScript_GivePrize": 209,
  "FallarborTown_BattleTentLobby_EventScript_NoRoomForPrize": 313,
  "FallarborTown_BattleTentLobby_EventScript_PrizeWaiting": 330,
  "FallarborTown_BattleTentLobby_EventScript_LostChallenge": 345,
  "FallarborTown_BattleTentLobby_EventScript_ResumeChallenge": 410,
  "FallarborTown_BattleTentLobby_EventScript_Attendant": 469,
  "FallarborTown_BattleTentLobby_EventScript_AskEnterChallenge": 514,
  "FallarborTown_BattleTentLobby_EventScript_TryEnterChallenge": 658,
  "FallarborTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 883,
  "FallarborTown_BattleTentLobby_EventScript_EnterChallenge": 1009,
  "FallarborTown_BattleTentLobby_EventScript_ExplainChallenge": 1071,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMons": 1084,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 1153,
  "FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 1166,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 1179,
  "FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 1208,
  "FallarborTown_BattleTentLobby_EventScript_CancelChallenge": 1212,
  "FallarborTown_BattleTentLobby_EventScript_EndCancelChallenge": 1220,
  "FallarborTown_BattleTentLobby_EventScript_WalkToDoor": 1222,
  "FallarborTown_BattleTentLobby_Movement_AttendantWalkToDoor": 1315,
  "FallarborTown_BattleTentLobby_Movement_AttendantEnterDoor": 1319,
  "FallarborTown_BattleTentLobby_Movement_PlayerWalkToDoor": 1322,
  "FallarborTown_BattleTentLobby_Movement_PlayerEnterDoor": 1326,
  "FallarborTown_BattleTentLobby_EventScript_Hiker": 1330,
  "FallarborTown_BattleTentLobby_EventScript_LittleBoy": 1339,
  "FallarborTown_BattleTentLobby_EventScript_Lass": 1348,
  "FallarborTown_BattleTentLobby_EventScript_Scott": 1357,
  "FallarborTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 1386,
  "FallarborTown_BattleTentLobby_EventScript_RulesBoard": 1396,
  "FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard": 1411,
  "FallarborTown_BattleTentLobby_EventScript_RulesLevel": 1652,
  "FallarborTown_BattleTentLobby_EventScript_RulesBattle": 1666,
  "FallarborTown_BattleTentLobby_EventScript_RulesMind": 1680,
  "FallarborTown_BattleTentLobby_EventScript_RulesSkill": 1694,
  "FallarborTown_BattleTentLobby_EventScript_RulesBody": 1708,
  "FallarborTown_BattleTentLobby_EventScript_ExitRules": 1722,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,28,0,0,0,0,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,92,0,0,0,3,0,0,0,0,68,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,154,1,0,0,0,0,0,0,143,0,0,0,0,0,0,0,89,1,0,0,23,0,0,0,0,38,0,0,0,3,106,16,0,0,0,0,0,10,4,105,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,108,3,106,16,0,0,0,0,0,10,4,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,57,1,0,0,34,57,1,0,0,7,1,0,0,0,0,7,1,57,1,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,104,0,0,0,0,103,50,114,1,51,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,16,0,0,0,0,0,10,4,103,105,23,0,0,255,0,108,3,106,16,0,0,0,0,0,10,4,6,209,0,0,0,3,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,6,241,3,0,0,107,91,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,74,1,0,0,7,5,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,146,2,0,0,34,146,2,0,0,7,1,0,0,0,0,7,1,146,2,0,0,35,0,0,1,0,34,0,0,1,0,35,47,4,0,0,34,47,4,0,0,7,1,0,0,0,0,7,1,47,4,0,0,35,0,0,2,0,34,0,0,2,0,35,188,4,0,0,34,188,4,0,0,7,1,0,0,0,0,7,1,188,4,0,0,35,0,0,0,0,34,0,0,0,0,35,188,4,0,0,34,188,4,0,0,7,1,0,0,0,0,7,1,188,4,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,2,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,60,4,0,0,7,1,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,152,0,23,0,0,2,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,184,4,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,184,4,0,0,34,184,4,0,0,7,1,0,0,0,0,7,1,184,4,0,0,35,0,0,1,0,34,0,0,1,0,35,115,3,0,0,34,115,3,0,0,7,1,0,0,0,0,7,1,115,3,0,0,35,0,0,0,0,34,0,0,0,0,35,184,4,0,0,34,184,4,0,0,7,1,0,0,0,0,7,1,184,4,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,105,41,2,0,5,0,0,0,0,23,0,0,255,0,35,0,0,0,0,34,0,0,0,0,7,1,155,4,0,0,7,1,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,5,198,4,0,0,58,0,0,0,255,255,255,255,2,255,255,255,255,0,2,0,7,0,2,7,0,0,0,23,0,0,0,0,0,3,16,0,0,0,0,0,10,4,6,2,2,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,129,4,0,0,34,129,4,0,0,7,1,0,0,0,0,7,1,129,4,0,0,35,0,0,0,0,34,0,0,0,0,35,142,4,0,0,34,142,4,0,0,7,1,0,0,0,0,7,1,142,4,0,0,16,0,0,0,0,0,10,4,6,196,4,0,0,16,0,0,0,0,0,10,4,6,196,4,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,188,4,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,3,80,0,0,35,5,0,0,81,0,0,35,5,0,0,0,0,80,0,0,42,5,0,0,81,0,0,42,5,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,39,5,0,0,81,0,0,39,5,0,0,0,0,80,0,0,46,5,0,0,81,0,0,46,5,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,44,0,0,7,1,106,5,0,0,16,0,0,0,0,0,10,4,24,0,0,1,0,42,0,0,109,3,16,0,0,0,0,0,10,4,109,3,106,16,0,0,0,0,0,10,4,6,131,5,0,0,3,104,0,0,0,0,103,112,17,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,116,6,0,0,34,116,6,0,0,7,1,0,0,0,0,7,1,116,6,0,0,35,0,0,1,0,34,0,0,1,0,35,130,6,0,0,34,130,6,0,0,7,1,0,0,0,0,7,1,130,6,0,0,35,0,0,2,0,34,0,0,2,0,35,144,6,0,0,34,144,6,0,0,7,1,0,0,0,0,7,1,144,6,0,0,35,0,0,3,0,34,0,0,3,0,35,158,6,0,0,34,158,6,0,0,7,1,0,0,0,0,7,1,158,6,0,0,35,0,0,4,0,34,0,0,4,0,35,172,6,0,0,34,172,6,0,0,7,1,0,0,0,0,7,1,172,6,0,0,35,0,0,5,0,34,0,0,5,0,35,186,6,0,0,34,186,6,0,0,7,1,0,0,0,0,7,1,186,6,0,0,35,0,0,0,0,34,0,0,0,0,35,186,6,0,0,34,186,6,0,0,7,1,0,0,0,0,7,1,186,6,0,0,3,16,0,0,0,0,0,10,4,6,131,5,0,0,3,16,0,0,0,0,0,10,4,6,131,5,0,0,3,16,0,0,0,0,0,10,4,6,131,5,0,0,3,16,0,0,0,0,0,10,4,6,131,5,0,0,3,16,0,0,0,0,0,10,4,6,131,5,0,0,3,108,3] as const;

export const STATS = { ops: 217, bytes: 1724, labels: 43, unknownOps: 0, unresolvedSymbols: 87 } as const;
