// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=259, bytes=2256, labels=58, unknownOps=0, unresolvedSymbols=52

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePalaceLobby_MapScripts": 0,
  "BattleFrontier_BattlePalaceLobby_OnWarp": 10,
  "BattleFrontier_BattlePalaceLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattlePalaceLobby_OnFrame": 28,
  "BattleFrontier_BattlePalaceLobby_EventScript_GetChallengeStatus": 68,
  "BattleFrontier_BattlePalaceLobby_EventScript_QuitWithoutSaving": 78,
  "BattleFrontier_BattlePalaceLobby_EventScript_WonChallenge": 157,
  "BattleFrontier_BattlePalaceLobby_EventScript_DefeatedMaven": 202,
  "BattleFrontier_BattlePalaceLobby_EventScript_GiveBattlePoints": 210,
  "BattleFrontier_BattlePalaceLobby_EventScript_LostChallenge": 262,
  "BattleFrontier_BattlePalaceLobby_EventScript_SaveAfterChallenge": 309,
  "BattleFrontier_BattlePalaceLobby_EventScript_RecordMatch": 484,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge": 489,
  "BattleFrontier_BattlePalaceLobby_EventScript_ResumeChallenge": 490,
  "BattleFrontier_BattlePalaceLobby_EventScript_SinglesAttendant": 557,
  "BattleFrontier_BattlePalaceLobby_EventScript_DoublesAttendant": 575,
  "BattleFrontier_BattlePalaceLobby_EventScript_Attendant": 593,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeChallenge": 677,
  "BattleFrontier_BattlePalaceLobby_EventScript_TryEnterChallenge": 860,
  "BattleFrontier_BattlePalaceLobby_EventScript_SaveBeforeChallenge": 1155,
  "BattleFrontier_BattlePalaceLobby_EventScript_EnterChallenge": 1300,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainChallenge": 1362,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainDoublesChallenge": 1397,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMons": 1410,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLv50": 1479,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLvOpen": 1492,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallengeSaveFailed": 1505,
  "BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge": 1534,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge": 1538,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndCancelChallenge": 1546,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForSingleBattle": 1548,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForDoubleBattle": 1557,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeSingleBattleChallenge": 1566,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeDoubleBattleChallenge": 1572,
  "BattleFrontier_BattlePalaceLobby_EventScript_WalkToDoor": 1578,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToSinglesAttendant": 1793,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToDoublesAttendant": 1799,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenSinglesHallDoor": 1805,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenDoublesHallDoor": 1811,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseSinglesHallDoor": 1817,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseDoublesHallDoor": 1823,
  "BattleFrontier_BattlePalaceLobby_Movement_WalkToDoor": 1829,
  "BattleFrontier_BattlePalaceLobby_Movement_AttendantEnterDoor": 1831,
  "BattleFrontier_BattlePalaceLobby_Movement_PlayerEnterDoor": 1834,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowSinglesResults": 1838,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowDoublesResults": 1865,
  "BattleFrontier_BattlePalaceLobby_EventScript_BlackBelt": 1892,
  "BattleFrontier_BattlePalaceLobby_EventScript_Man": 1901,
  "BattleFrontier_BattlePalaceLobby_EventScript_Beauty": 1910,
  "BattleFrontier_BattlePalaceLobby_EventScript_Maniac": 1919,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBoard": 1928,
  "BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard": 1943,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBasics": 2184,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesNature": 2198,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesMoves": 2212,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesUnderpowered": 2226,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesWhenInDanger": 2240,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExitRules": 2254,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,28,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,92,255,0,2,3,0,0,0,0,68,0,0,0,0,0,1,0,78,0,0,0,0,0,2,0,234,1,0,0,0,0,3,0,157,0,0,0,0,0,4,0,6,1,0,0,23,4,128,0,0,38,0,0,58,3,106,16,0,0,0,0,0,10,4,105,23,4,128,2,0,23,5,128,1,0,23,6,128,0,0,38,0,0,58,23,4,128,2,0,23,5,128,2,0,23,6,128,0,0,38,0,0,58,23,4,128,2,0,23,5,128,0,0,26,6,128,0,0,23,6,128,0,0,38,0,0,58,23,0,0,255,0,108,3,106,23,4,128,10,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,202,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,6,210,0,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,23,4,128,11,0,38,0,0,58,16,0,0,0,0,0,10,9,104,0,0,0,0,103,5,53,1,0,0,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,106,104,0,0,0,0,103,23,4,128,2,0,23,5,128,2,0,23,6,128,0,0,38,0,0,58,5,53,1,0,0,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,23,4,128,8,0,38,0,0,58,38,0,0,58,38,0,0,58,23,4,128,7,0,23,5,128,0,0,38,0,0,58,48,55,0,49,5,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,233,1,0,0,7,1,13,128,0,0,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,233,1,0,0,34,233,1,0,0,7,1,0,0,0,0,7,1,233,1,0,0,35,0,128,0,0,34,0,128,0,0,35,228,1,0,0,34,228,1,0,0,7,1,0,0,0,0,7,1,228,1,0,0,35,0,128,127,0,34,0,128,127,0,35,233,1,0,0,34,233,1,0,0,7,1,0,0,0,0,7,1,233,1,0,0,5,0,0,0,0,4,106,16,0,0,0,0,0,10,4,104,0,0,0,0,103,23,4,128,7,0,23,5,128,1,0,38,0,0,58,48,55,0,49,23,4,128,2,0,23,5,128,3,0,26,6,128,0,0,23,6,128,0,0,38,0,0,58,23,0,0,255,0,6,20,5,0,0,107,91,23,207,64,2,0,23,206,64,0,0,6,81,2,0,0,3,107,91,23,207,64,2,0,23,206,64,1,0,6,81,2,0,0,3,23,4,128,1,0,23,5,128,0,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,157,0,0,0,7,5,13,128,0,0,38,0,0,58,35,206,64,0,0,34,206,64,0,0,8,1,12,6,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,21,6,0,0,8,1,206,64,0,0,35,206,64,0,0,34,206,64,0,0,8,1,30,6,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,36,6,0,0,8,1,206,64,0,0,103,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,92,3,0,0,34,92,3,0,0,7,1,0,0,0,0,7,1,92,3,0,0,35,0,128,1,0,34,0,128,1,0,35,82,5,0,0,34,82,5,0,0,7,1,0,0,0,0,7,1,82,5,0,0,35,0,128,2,0,34,0,128,2,0,35,2,6,0,0,34,2,6,0,0,7,1,0,0,0,0,7,1,2,6,0,0,35,0,128,127,0,34,0,128,127,0,35,2,6,0,0,34,2,6,0,0,7,1,0,0,0,0,7,1,2,6,0,0,104,0,0,0,0,103,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,2,6,0,0,34,2,6,0,0,7,1,0,0,0,0,7,1,2,6,0,0,35,0,128,127,0,34,0,128,127,0,35,2,6,0,0,34,2,6,0,0,7,1,0,0,0,0,7,1,2,6,0,0,23,4,128,15,0,38,0,0,58,35,4,128,1,0,34,4,128,1,0,7,1,130,5,0,0,7,1,4,128,0,0,23,4,128,2,0,23,5,128,1,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,16,0,0,0,0,0,10,4,152,1,5,0,0,0,0,26,4,128,13,128,23,5,128,3,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,254,5,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,254,5,0,0,34,254,5,0,0,7,1,0,0,0,0,7,1,254,5,0,0,35,0,128,1,0,34,0,128,1,0,35,131,4,0,0,34,131,4,0,0,7,1,0,0,0,0,7,1,131,4,0,0,35,0,128,127,0,34,0,128,127,0,35,254,5,0,0,34,254,5,0,0,7,1,0,0,0,0,7,1,254,5,0,0,23,0,0,0,0,23,4,128,2,0,23,5,128,4,0,26,6,128,255,255,23,6,128,255,255,38,0,0,58,23,4,128,0,0,38,0,0,58,23,4,128,2,0,23,5,128,2,0,23,6,128,1,0,38,0,0,58,23,4,128,2,0,23,5,128,0,0,26,6,128,1,0,23,6,128,1,0,38,0,0,58,23,4,128,2,0,23,5,128,3,0,26,6,128,0,0,23,6,128,0,0,38,0,0,58,38,0,0,58,105,41,2,0,5,0,0,0,0,23,0,0,255,0,35,13,128,0,0,34,13,128,0,0,7,1,225,5,0,0,7,1,13,128,0,0,38,0,0,58,23,4,128,3,0,23,5,128,3,0,38,0,0,58,16,0,0,0,0,0,10,4,105,5,42,6,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,13,0,8,13,0,0,0,23,0,0,0,0,58,3,35,206,64,1,0,34,206,64,1,0,7,1,117,5,0,0,7,1,206,64,0,0,16,0,0,0,0,0,10,4,6,165,2,0,0,16,0,0,0,0,0,10,4,6,165,2,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,199,5,0,0,34,199,5,0,0,7,1,0,0,0,0,7,1,199,5,0,0,35,0,128,1,0,34,0,128,1,0,35,212,5,0,0,34,212,5,0,0,7,1,0,0,0,0,7,1,212,5,0,0,16,0,0,0,0,0,10,4,6,10,6,0,0,16,0,0,0,0,0,10,4,6,10,6,0,0,23,4,128,2,0,23,5,128,0,0,26,6,128,0,0,23,6,128,0,0,38,0,0,58,6,2,6,0,0,38,0,0,58,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,104,0,0,0,0,4,104,0,0,0,0,4,35,206,64,0,0,34,206,64,0,0,8,1,1,7,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,7,7,0,0,8,1,206,64,0,0,80,15,128,37,7,0,0,81,15,128,37,7,0,0,0,0,80,255,0,37,7,0,0,81,255,0,37,7,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,8,1,13,7,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,19,7,0,0,8,1,206,64,0,0,175,80,15,128,39,7,0,0,81,15,128,39,7,0,0,0,0,80,255,0,42,7,0,0,81,255,0,42,7,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,8,1,25,7,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,31,7,0,0,8,1,206,64,0,0,175,4,23,15,128,0,0,4,23,15,128,0,0,4,173,5,0,4,0,4,173,19,0,4,0,4,174,5,0,4,0,4,174,19,0,4,0,4,9,254,9,84,254,9,9,84,254,106,23,4,128,7,0,23,5,128,2,0,23,6,128,0,0,38,0,0,58,110,38,0,0,58,108,3,106,23,4,128,7,0,23,5,128,2,0,23,6,128,1,0,38,0,0,58,110,38,0,0,58,108,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,106,16,0,0,0,0,0,10,4,6,151,7,0,0,3,104,0,0,0,0,103,112,16,0,100,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,136,8,0,0,34,136,8,0,0,7,1,0,0,0,0,7,1,136,8,0,0,35,0,128,1,0,34,0,128,1,0,35,150,8,0,0,34,150,8,0,0,7,1,0,0,0,0,7,1,150,8,0,0,35,0,128,2,0,34,0,128,2,0,35,164,8,0,0,34,164,8,0,0,7,1,0,0,0,0,7,1,164,8,0,0,35,0,128,3,0,34,0,128,3,0,35,178,8,0,0,34,178,8,0,0,7,1,0,0,0,0,7,1,178,8,0,0,35,0,128,4,0,34,0,128,4,0,35,192,8,0,0,34,192,8,0,0,7,1,0,0,0,0,7,1,192,8,0,0,35,0,128,5,0,34,0,128,5,0,35,206,8,0,0,34,206,8,0,0,7,1,0,0,0,0,7,1,206,8,0,0,35,0,128,127,0,34,0,128,127,0,35,206,8,0,0,34,206,8,0,0,7,1,0,0,0,0,7,1,206,8,0,0,3,16,0,0,0,0,0,10,4,6,151,7,0,0,3,16,0,0,0,0,0,10,4,6,151,7,0,0,3,16,0,0,0,0,0,10,4,6,151,7,0,0,3,16,0,0,0,0,0,10,4,6,151,7,0,0,3,16,0,0,0,0,0,10,4,6,151,7,0,0,3,108,3] as const;

export const STATS = { ops: 259, bytes: 2256, labels: 58, unknownOps: 0, unresolvedSymbols: 52 } as const;
