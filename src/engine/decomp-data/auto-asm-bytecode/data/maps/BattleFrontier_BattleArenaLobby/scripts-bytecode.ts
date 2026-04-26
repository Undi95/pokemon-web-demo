// AUTO-GENERATED from data/maps/BattleFrontier_BattleArenaLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=260, bytes=1973, labels=47, unknownOps=0, unresolvedSymbols=58

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleArenaLobby_MapScripts": 0,
  "BattleFrontier_BattleArenaLobby_OnWarp": 10,
  "BattleFrontier_BattleArenaLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleArenaLobby_OnFrame": 27,
  "BattleFrontier_BattleArenaLobby_EventScript_GetChallengeStatus": 67,
  "BattleFrontier_BattleArenaLobby_EventScript_QuitWithoutSaving": 76,
  "BattleFrontier_BattleArenaLobby_EventScript_WonChallenge": 155,
  "BattleFrontier_BattleArenaLobby_EventScript_DefeatedTycoon": 199,
  "BattleFrontier_BattleArenaLobby_EventScript_GiveBattlePoints": 207,
  "BattleFrontier_BattleArenaLobby_EventScript_LostChallenge": 259,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveAfterChallenge": 309,
  "BattleFrontier_BattleArenaLobby_EventScript_RecordMatch": 483,
  "BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge": 488,
  "BattleFrontier_BattleArenaLobby_EventScript_ResumeChallenge": 489,
  "BattleFrontier_BattleArenaLobby_EventScript_Attendant": 544,
  "BattleFrontier_BattleArenaLobby_EventScript_AskTakeChallenge": 566,
  "BattleFrontier_BattleArenaLobby_EventScript_TryEnterChallenge": 712,
  "BattleFrontier_BattleArenaLobby_EventScript_SaveBeforeChallenge": 1004,
  "BattleFrontier_BattleArenaLobby_EventScript_EnterChallenge": 1138,
  "BattleFrontier_BattleArenaLobby_EventScript_ExplainChallenge": 1248,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMons": 1261,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLv50": 1330,
  "BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLvOpen": 1343,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallengeSaveFailed": 1356,
  "BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge": 1382,
  "BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge": 1386,
  "BattleFrontier_BattleArenaLobby_EventScript_EndCancelChallenge": 1394,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLv50": 1396,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToLeftDoor": 1489,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantEnterDoor": 1499,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToLeftDoor": 1502,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerEnterDoor": 1513,
  "BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLvOpen": 1517,
  "BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToRightDoor": 1610,
  "BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToRightDoor": 1619,
  "BattleFrontier_BattleArenaLobby_EventScript_ShowResults": 1629,
  "BattleFrontier_BattleArenaLobby_EventScript_Youngster": 1653,
  "BattleFrontier_BattleArenaLobby_EventScript_Man": 1662,
  "BattleFrontier_BattleArenaLobby_EventScript_Camper": 1671,
  "BattleFrontier_BattleArenaLobby_EventScript_Woman": 1680,
  "BattleFrontier_BattleArenaLobby_EventScript_RulesBoard": 1689,
  "BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard": 1704,
  "BattleFrontier_BattleArenaLobby_EventScript_BattleRules": 1915,
  "BattleFrontier_BattleArenaLobby_EventScript_MindRules": 1929,
  "BattleFrontier_BattleArenaLobby_EventScript_SkillRules": 1943,
  "BattleFrontier_BattleArenaLobby_EventScript_BodyRules": 1957,
  "BattleFrontier_BattleArenaLobby_EventScript_ExitRules": 1971,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,233,1,0,0,0,0,3,0,155,0,0,0,0,0,4,0,3,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,199,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,89,207,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,88,53,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,88,53,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,113,4,8,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,232,1,0,0,7,1,13,128,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,232,1,0,0,34,232,1,0,0,7,1,0,0,0,0,7,1,232,1,0,0,35,0,128,0,0,34,0,128,0,0,35,227,1,0,0,34,227,1,0,0,7,1,0,0,0,0,7,1,227,1,0,0,35,0,128,127,0,34,0,128,127,0,35,232,1,0,0,34,232,1,0,0,7,1,0,0,0,0,7,1,232,1,0,0,88,0,0,0,0,15,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,114,4,0,0,107,91,113,207,3,0,113,206,0,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,200,2,0,0,34,200,2,0,0,7,1,0,0,0,0,7,1,200,2,0,0,35,0,128,1,0,34,0,128,1,0,35,224,4,0,0,34,224,4,0,0,7,1,0,0,0,0,7,1,224,4,0,0,35,0,128,2,0,34,0,128,2,0,35,106,5,0,0,34,106,5,0,0,7,1,0,0,0,0,7,1,106,5,0,0,35,0,128,127,0,34,0,128,127,0,35,106,5,0,0,34,106,5,0,0,7,1,0,0,0,0,7,1,106,5,0,0,104,0,0,0,0,0,0,0,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,106,5,0,0,34,106,5,0,0,7,1,0,0,0,0,7,1,106,5,0,0,35,0,128,127,0,34,0,128,127,0,35,106,5,0,0,34,106,5,0,0,7,1,0,0,0,0,7,1,106,5,0,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,7,1,237,4,0,0,7,1,4,128,0,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,102,5,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,102,5,0,0,34,102,5,0,0,7,1,0,0,0,0,7,1,102,5,0,0,35,0,128,0,0,34,0,128,0,0,35,236,3,0,0,34,236,3,0,0,7,1,0,0,0,0,7,1,236,3,0,0,35,0,128,127,0,34,0,128,127,0,35,102,5,0,0,34,102,5,0,0,7,1,0,0,0,0,7,1,102,5,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,7,1,76,5,0,0,7,1,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,8,1,116,5,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,237,5,0,0,8,1,13,128,0,0,58,0,0,255,255,255,255,255,9,255,255,255,255,255,9,0,13,0,9,13,0,0,0,113,0,0,0,0,90,16,0,0,0,0,0,10,0,89,54,2,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,50,5,0,0,34,50,5,0,0,7,1,0,0,0,0,7,1,50,5,0,0,35,0,128,1,0,34,0,128,1,0,35,63,5,0,0,34,63,5,0,0,7,1,0,0,0,0,7,1,63,5,0,0,16,0,0,0,0,0,10,0,89,114,5,0,0,16,0,0,0,0,0,10,0,89,114,5,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,106,5,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,80,0,0,209,5,0,0,81,0,0,209,5,0,0,0,0,80,255,0,222,5,0,0,81,255,0,222,5,0,0,0,0,82,0,0,83,0,0,0,0,173,2,0,2,0,175,80,0,0,219,5,0,0,81,0,0,219,5,0,0,0,0,80,255,0,233,5,0,0,81,255,0,233,5,0,0,0,0,82,0,0,83,0,0,0,0,174,2,0,2,0,175,15,9,9,9,10,10,10,10,10,9,254,9,84,254,9,9,9,9,10,10,10,10,10,38,254,9,9,84,254,80,0,0,74,6,0,0,81,0,0,74,6,0,0,0,0,80,255,0,83,6,0,0,81,255,0,83,6,0,0,0,0,82,0,0,83,0,0,0,0,173,11,0,2,0,175,80,0,0,219,5,0,0,81,0,0,219,5,0,0,0,0,80,255,0,233,5,0,0,81,255,0,233,5,0,0,0,0,82,0,0,83,0,0,0,0,174,11,0,2,0,175,15,9,9,9,11,11,11,11,9,254,9,9,9,9,11,11,11,11,38,254,106,113,4,7,0,113,5,3,0,113,6,255,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,168,6,0,0,90,104,0,0,0,0,0,0,0,112,17,2,96,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,123,7,0,0,34,123,7,0,0,7,1,0,0,0,0,7,1,123,7,0,0,35,0,128,1,0,34,0,128,1,0,35,137,7,0,0,34,137,7,0,0,7,1,0,0,0,0,7,1,137,7,0,0,35,0,128,2,0,34,0,128,2,0,35,151,7,0,0,34,151,7,0,0,7,1,0,0,0,0,7,1,151,7,0,0,35,0,128,3,0,34,0,128,3,0,35,165,7,0,0,34,165,7,0,0,7,1,0,0,0,0,7,1,165,7,0,0,35,0,128,4,0,34,0,128,4,0,35,179,7,0,0,34,179,7,0,0,7,1,0,0,0,0,7,1,179,7,0,0,35,0,128,127,0,34,0,128,127,0,35,179,7,0,0,34,179,7,0,0,7,1,0,0,0,0,7,1,179,7,0,0,90,16,0,0,0,0,0,10,0,89,168,6,0,0,90,16,0,0,0,0,0,10,0,89,168,6,0,0,90,16,0,0,0,0,0,10,0,89,168,6,0,0,90,16,0,0,0,0,0,10,0,89,168,6,0,0,90,108,90] as const;

export const STATS = { ops: 260, bytes: 1973, labels: 47, unknownOps: 0, unresolvedSymbols: 58 } as const;
