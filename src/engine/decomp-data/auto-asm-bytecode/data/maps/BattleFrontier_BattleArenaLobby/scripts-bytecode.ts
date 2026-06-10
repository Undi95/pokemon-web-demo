// AUTO-GENERATED from data/maps/BattleFrontier_BattleArenaLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=260, bytes=2021, labels=47, unknownOps=0, unresolvedSymbols=99

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleArenaLobby_MapScripts": 0,
  "BattleFrontier_BattleArenaLobby_OnWarp": 10,
  "BattleFrontier_BattleArenaLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleArenaLobby_OnFrame": 28,
  "BattleFrontier_BattleArenaLobby_EventScript_GetChallengeStatus": 68,
  "BattleFrontier_BattleArenaLobby_EventScript_QuitWithoutSaving": 78,
  "BattleFrontier_BattleArenaLobby_EventScript_WonChallenge": 167,
  "BattleFrontier_BattleArenaLobby_EventScript_DefeatedTycoon": 212,
  "BattleFrontier_BattleArenaLobby_EventScript_GiveBattlePoints": 220,
  "BattleFrontier_BattleArenaLobby_EventScript_LostChallenge": 272,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveAfterChallenge": 324,
  "BattleFrontier_BattleArenaLobby_EventScript_RecordMatch": 499,
  "BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge": 504,
  "BattleFrontier_BattleArenaLobby_EventScript_ResumeChallenge": 505,
  "BattleFrontier_BattleArenaLobby_EventScript_Attendant": 564,
  "BattleFrontier_BattleArenaLobby_EventScript_AskTakeChallenge": 588,
  "BattleFrontier_BattleArenaLobby_EventScript_TryEnterChallenge": 732,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveBeforeChallenge": 1027,
  "BattleFrontier_BattleArenaLobby_EventScript_EnterChallenge": 1177,
  "BattleFrontier_BattleArenaLobby_EventScript_ExplainChallenge": 1292,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMons": 1305,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLv50": 1374,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLvOpen": 1387,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallengeSaveFailed": 1400,
  "BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge": 1429,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge": 1433,
  "BattleFrontier_BattleArenaLobby_EventScript_EndCancelChallenge": 1441,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLv50": 1443,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToLeftDoor": 1536,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantEnterDoor": 1546,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToLeftDoor": 1549,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerEnterDoor": 1560,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLvOpen": 1564,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToRightDoor": 1657,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToRightDoor": 1666,
  "BattleFrontier_BattleArenaLobby_EventScript_ShowResults": 1676,
  "BattleFrontier_BattleArenaLobby_EventScript_Youngster": 1703,
  "BattleFrontier_BattleArenaLobby_EventScript_Man": 1712,
  "BattleFrontier_BattleArenaLobby_EventScript_Camper": 1721,
  "BattleFrontier_BattleArenaLobby_EventScript_Woman": 1730,
  "BattleFrontier_BattleArenaLobby_EventScript_RulesBoard": 1739,
  "BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard": 1754,
  "BattleFrontier_BattleArenaLobby_EventScript_BattleRules": 1963,
  "BattleFrontier_BattleArenaLobby_EventScript_MindRules": 1977,
  "BattleFrontier_BattleArenaLobby_EventScript_SkillRules": 1991,
  "BattleFrontier_BattleArenaLobby_EventScript_BodyRules": 2005,
  "BattleFrontier_BattleArenaLobby_EventScript_ExitRules": 2019,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,28,0,0,0,0,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,92,0,0,0,3,0,0,0,0,68,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,249,1,0,0,0,0,0,0,167,0,0,0,0,0,0,0,16,1,0,0,23,0,0,0,0,38,0,0,0,3,106,16,0,0,0,0,0,10,4,105,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,108,3,106,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,212,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,6,220,0,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,9,104,0,0,0,0,103,5,68,1,0,0,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,5,68,1,0,0,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,23,0,0,0,0,38,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,5,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,248,1,0,0,7,1,0,0,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,248,1,0,0,34,248,1,0,0,7,1,0,0,0,0,7,1,248,1,0,0,35,0,0,0,0,34,0,0,0,0,35,243,1,0,0,34,243,1,0,0,7,1,0,0,0,0,7,1,243,1,0,0,35,0,0,0,0,34,0,0,0,0,35,248,1,0,0,34,248,1,0,0,7,1,0,0,0,0,7,1,248,1,0,0,5,0,0,0,0,4,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,6,153,4,0,0,107,91,23,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,220,2,0,0,34,220,2,0,0,7,1,0,0,0,0,7,1,220,2,0,0,35,0,0,1,0,34,0,0,1,0,35,12,5,0,0,34,12,5,0,0,7,1,0,0,0,0,7,1,12,5,0,0,35,0,0,2,0,34,0,0,2,0,35,153,5,0,0,34,153,5,0,0,7,1,0,0,0,0,7,1,153,5,0,0,35,0,0,0,0,34,0,0,0,0,35,153,5,0,0,34,153,5,0,0,7,1,0,0,0,0,7,1,153,5,0,0,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,153,5,0,0,34,153,5,0,0,7,1,0,0,0,0,7,1,153,5,0,0,35,0,0,0,0,34,0,0,0,0,35,153,5,0,0,34,153,5,0,0,7,1,0,0,0,0,7,1,153,5,0,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,25,5,0,0,7,1,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,152,0,5,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,149,5,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,149,5,0,0,34,149,5,0,0,7,1,0,0,0,0,7,1,149,5,0,0,35,0,0,1,0,34,0,0,1,0,35,3,4,0,0,34,3,4,0,0,7,1,0,0,0,0,7,1,3,4,0,0,35,0,0,0,0,34,0,0,0,0,35,149,5,0,0,34,149,5,0,0,7,1,0,0,0,0,7,1,149,5,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,1,0,23,0,0,1,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,105,41,2,0,5,0,0,0,0,23,0,0,255,0,35,0,0,0,0,34,0,0,0,0,7,1,120,5,0,0,7,1,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,163,5,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,28,6,0,0,8,1,0,0,0,0,58,0,0,0,255,255,255,255,9,255,255,255,255,0,9,0,13,0,9,13,0,0,0,23,0,0,0,0,0,3,16,0,0,0,0,0,10,4,6,76,2,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,94,5,0,0,34,94,5,0,0,7,1,0,0,0,0,7,1,94,5,0,0,35,0,0,0,0,34,0,0,0,0,35,107,5,0,0,34,107,5,0,0,7,1,0,0,0,0,7,1,107,5,0,0,16,0,0,0,0,0,10,4,6,161,5,0,0,16,0,0,0,0,0,10,4,6,161,5,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,153,5,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,3,80,0,0,0,6,0,0,81,0,0,0,6,0,0,0,0,80,0,0,13,6,0,0,81,0,0,13,6,0,0,0,0,82,0,0,83,0,0,0,0,173,2,0,2,0,175,80,0,0,10,6,0,0,81,0,0,10,6,0,0,0,0,80,0,0,24,6,0,0,81,0,0,24,6,0,0,0,0,82,0,0,83,0,0,0,0,174,2,0,2,0,175,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,121,6,0,0,81,0,0,121,6,0,0,0,0,80,0,0,130,6,0,0,81,0,0,130,6,0,0,0,0,82,0,0,83,0,0,0,0,173,11,0,2,0,175,80,0,0,10,6,0,0,81,0,0,10,6,0,0,0,0,80,0,0,24,6,0,0,81,0,0,24,6,0,0,0,0,82,0,0,83,0,0,0,0,174,11,0,2,0,175,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,106,23,0,0,0,0,23,0,0,0,0,23,0,0,255,0,38,0,0,0,110,38,0,0,0,108,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,106,16,0,0,0,0,0,10,4,6,218,6,0,0,3,104,0,0,0,0,103,112,17,2,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,171,7,0,0,34,171,7,0,0,7,1,0,0,0,0,7,1,171,7,0,0,35,0,0,1,0,34,0,0,1,0,35,185,7,0,0,34,185,7,0,0,7,1,0,0,0,0,7,1,185,7,0,0,35,0,0,2,0,34,0,0,2,0,35,199,7,0,0,34,199,7,0,0,7,1,0,0,0,0,7,1,199,7,0,0,35,0,0,3,0,34,0,0,3,0,35,213,7,0,0,34,213,7,0,0,7,1,0,0,0,0,7,1,213,7,0,0,35,0,0,4,0,34,0,0,4,0,35,227,7,0,0,34,227,7,0,0,7,1,0,0,0,0,7,1,227,7,0,0,35,0,0,0,0,34,0,0,0,0,35,227,7,0,0,34,227,7,0,0,7,1,0,0,0,0,7,1,227,7,0,0,3,16,0,0,0,0,0,10,4,6,218,6,0,0,3,16,0,0,0,0,0,10,4,6,218,6,0,0,3,16,0,0,0,0,0,10,4,6,218,6,0,0,3,16,0,0,0,0,0,10,4,6,218,6,0,0,3,108,3] as const;

export const STATS = { ops: 260, bytes: 2021, labels: 47, unknownOps: 0, unresolvedSymbols: 99 } as const;
