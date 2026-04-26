// AUTO-GENERATED from data/maps/BattleFrontier_BattleArenaLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=260, bytes=1649, labels=47, unknownOps=2, unresolvedSymbols=58

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleArenaLobby_MapScripts": 0,
  "BattleFrontier_BattleArenaLobby_OnWarp": 10,
  "BattleFrontier_BattleArenaLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleArenaLobby_OnFrame": 27,
  "BattleFrontier_BattleArenaLobby_EventScript_GetChallengeStatus": 67,
  "BattleFrontier_BattleArenaLobby_EventScript_QuitWithoutSaving": 76,
  "BattleFrontier_BattleArenaLobby_EventScript_WonChallenge": 155,
  "BattleFrontier_BattleArenaLobby_EventScript_DefeatedTycoon": 187,
  "BattleFrontier_BattleArenaLobby_EventScript_GiveBattlePoints": 195,
  "BattleFrontier_BattleArenaLobby_EventScript_LostChallenge": 247,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveAfterChallenge": 297,
  "BattleFrontier_BattleArenaLobby_EventScript_RecordMatch": 423,
  "BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge": 428,
  "BattleFrontier_BattleArenaLobby_EventScript_ResumeChallenge": 429,
  "BattleFrontier_BattleArenaLobby_EventScript_Attendant": 484,
  "BattleFrontier_BattleArenaLobby_EventScript_AskTakeChallenge": 506,
  "BattleFrontier_BattleArenaLobby_EventScript_TryEnterChallenge": 604,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveBeforeChallenge": 812,
  "BattleFrontier_BattleArenaLobby_EventScript_EnterChallenge": 934,
  "BattleFrontier_BattleArenaLobby_EventScript_ExplainChallenge": 1020,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMons": 1033,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLv50": 1078,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLvOpen": 1091,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallengeSaveFailed": 1104,
  "BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge": 1130,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge": 1134,
  "BattleFrontier_BattleArenaLobby_EventScript_EndCancelChallenge": 1142,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLv50": 1144,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToLeftDoor": 1237,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantEnterDoor": 1247,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToLeftDoor": 1250,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerEnterDoor": 1261,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLvOpen": 1265,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToRightDoor": 1358,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToRightDoor": 1367,
  "BattleFrontier_BattleArenaLobby_EventScript_ShowResults": 1377,
  "BattleFrontier_BattleArenaLobby_EventScript_Youngster": 1401,
  "BattleFrontier_BattleArenaLobby_EventScript_Man": 1410,
  "BattleFrontier_BattleArenaLobby_EventScript_Camper": 1419,
  "BattleFrontier_BattleArenaLobby_EventScript_Woman": 1428,
  "BattleFrontier_BattleArenaLobby_EventScript_RulesBoard": 1437,
  "BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard": 1452,
  "BattleFrontier_BattleArenaLobby_EventScript_BattleRules": 1591,
  "BattleFrontier_BattleArenaLobby_EventScript_MindRules": 1605,
  "BattleFrontier_BattleArenaLobby_EventScript_SkillRules": 1619,
  "BattleFrontier_BattleArenaLobby_EventScript_BodyRules": 1633,
  "BattleFrontier_BattleArenaLobby_EventScript_ExitRules": 1647,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,173,1,0,0,0,0,3,0,155,0,0,0,0,0,4,0,247,0,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,89,195,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,88,41,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,88,41,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,113,4,8,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,172,1,0,0,34,172,1,0,0,35,0,128,0,0,34,0,128,0,0,35,167,1,0,0,34,167,1,0,0,35,0,128,127,0,34,0,128,127,0,35,172,1,0,0,34,172,1,0,0,88,0,0,0,0,15,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,166,3,0,0,107,91,113,207,3,0,113,206,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,92,2,0,0,34,92,2,0,0,35,0,128,1,0,34,0,128,1,0,35,252,3,0,0,34,252,3,0,0,35,0,128,2,0,34,0,128,2,0,35,110,4,0,0,34,110,4,0,0,35,0,128,127,0,34,0,128,127,0,35,110,4,0,0,34,110,4,0,0,104,0,0,0,0,0,0,0,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,110,4,0,0,34,110,4,0,0,35,0,128,127,0,34,0,128,127,0,35,110,4,0,0,34,110,4,0,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,106,4,0,0,34,106,4,0,0,35,0,128,0,0,34,0,128,0,0,35,44,3,0,0,34,44,3,0,0,35,0,128,127,0,34,0,128,127,0,35,106,4,0,0,34,106,4,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,58,0,0,255,255,255,255,255,9,255,255,255,255,255,9,0,13,0,9,13,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,250,1,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,54,4,0,0,34,54,4,0,0,35,0,128,1,0,34,0,128,1,0,35,67,4,0,0,34,67,4,0,0,16,0,0,0,0,0,10,0,89,118,4,0,0,16,0,0,0,0,0,10,0,89,118,4,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,110,4,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,80,0,0,213,4,0,0,81,0,0,213,4,0,0,0,0,80,255,0,226,4,0,0,81,255,0,226,4,0,0,0,0,82,0,0,83,0,0,0,0,173,2,0,2,0,175,80,0,0,223,4,0,0,81,0,0,223,4,0,0,0,0,80,255,0,237,4,0,0,81,255,0,237,4,0,0,0,0,82,0,0,83,0,0,0,0,174,2,0,2,0,175,15,9,9,9,10,10,10,10,10,9,254,9,84,254,9,9,9,9,10,10,10,10,10,38,254,9,9,84,254,80,0,0,78,5,0,0,81,0,0,78,5,0,0,0,0,80,255,0,87,5,0,0,81,255,0,87,5,0,0,0,0,82,0,0,83,0,0,0,0,173,11,0,2,0,175,80,0,0,223,4,0,0,81,0,0,223,4,0,0,0,0,80,255,0,237,4,0,0,81,255,0,237,4,0,0,0,0,82,0,0,83,0,0,0,0,174,11,0,2,0,175,15,9,9,9,11,11,11,11,9,254,9,9,9,9,11,11,11,11,38,254,106,113,4,7,0,113,5,3,0,113,6,255,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,172,5,0,0,90,104,0,0,0,0,0,0,0,112,17,2,96,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,55,6,0,0,34,55,6,0,0,35,0,128,1,0,34,0,128,1,0,35,69,6,0,0,34,69,6,0,0,35,0,128,2,0,34,0,128,2,0,35,83,6,0,0,34,83,6,0,0,35,0,128,3,0,34,0,128,3,0,35,97,6,0,0,34,97,6,0,0,35,0,128,4,0,34,0,128,4,0,35,111,6,0,0,34,111,6,0,0,35,0,128,127,0,34,0,128,127,0,35,111,6,0,0,34,111,6,0,0,90,16,0,0,0,0,0,10,0,89,172,5,0,0,90,16,0,0,0,0,0,10,0,89,172,5,0,0,90,16,0,0,0,0,0,10,0,89,172,5,0,0,90,16,0,0,0,0,0,10,0,89,172,5,0,0,90,108,90] as const;

export const STATS = { ops: 260, bytes: 1649, labels: 47, unknownOps: 2, unresolvedSymbols: 58 } as const;
