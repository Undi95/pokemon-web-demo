// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=259, bytes=1745, labels=58, unknownOps=2, unresolvedSymbols=63

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePalaceLobby_MapScripts": 0,
  "BattleFrontier_BattlePalaceLobby_OnWarp": 10,
  "BattleFrontier_BattlePalaceLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattlePalaceLobby_OnFrame": 27,
  "BattleFrontier_BattlePalaceLobby_EventScript_GetChallengeStatus": 67,
  "BattleFrontier_BattlePalaceLobby_EventScript_QuitWithoutSaving": 76,
  "BattleFrontier_BattlePalaceLobby_EventScript_WonChallenge": 145,
  "BattleFrontier_BattlePalaceLobby_EventScript_DefeatedMaven": 177,
  "BattleFrontier_BattlePalaceLobby_EventScript_GiveBattlePoints": 185,
  "BattleFrontier_BattlePalaceLobby_EventScript_LostChallenge": 237,
  "BattleFrontier_BattlePalaceLobby_EventScript_SaveAfterChallenge": 282,
  "BattleFrontier_BattlePalaceLobby_EventScript_RecordMatch": 408,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge": 413,
  "BattleFrontier_BattlePalaceLobby_EventScript_ResumeChallenge": 414,
  "BattleFrontier_BattlePalaceLobby_EventScript_SinglesAttendant": 477,
  "BattleFrontier_BattlePalaceLobby_EventScript_DoublesAttendant": 493,
  "BattleFrontier_BattlePalaceLobby_EventScript_Attendant": 509,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeChallenge": 555,
  "BattleFrontier_BattlePalaceLobby_EventScript_TryEnterChallenge": 668,
  "BattleFrontier_BattlePalaceLobby_EventScript_SaveBeforeChallenge": 876,
  "BattleFrontier_BattlePalaceLobby_EventScript_EnterChallenge": 993,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainChallenge": 1052,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainDoublesChallenge": 1075,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMons": 1088,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLv50": 1133,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLvOpen": 1146,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallengeSaveFailed": 1159,
  "BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge": 1185,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge": 1189,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndCancelChallenge": 1197,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForSingleBattle": 1199,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForDoubleBattle": 1208,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeSingleBattleChallenge": 1217,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeDoubleBattleChallenge": 1223,
  "BattleFrontier_BattlePalaceLobby_EventScript_WalkToDoor": 1229,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToSinglesAttendant": 1372,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToDoublesAttendant": 1377,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenSinglesHallDoor": 1382,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenDoublesHallDoor": 1388,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseSinglesHallDoor": 1394,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseDoublesHallDoor": 1400,
  "BattleFrontier_BattlePalaceLobby_Movement_WalkToDoor": 1406,
  "BattleFrontier_BattlePalaceLobby_Movement_AttendantEnterDoor": 1408,
  "BattleFrontier_BattlePalaceLobby_Movement_PlayerEnterDoor": 1411,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowSinglesResults": 1415,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowDoublesResults": 1439,
  "BattleFrontier_BattlePalaceLobby_EventScript_BlackBelt": 1463,
  "BattleFrontier_BattlePalaceLobby_EventScript_Man": 1472,
  "BattleFrontier_BattlePalaceLobby_EventScript_Beauty": 1481,
  "BattleFrontier_BattlePalaceLobby_EventScript_Maniac": 1490,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBoard": 1499,
  "BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard": 1514,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBasics": 1673,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesNature": 1687,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesMoves": 1701,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesUnderpowered": 1715,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesWhenInDanger": 1729,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExitRules": 1743,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,158,1,0,0,0,0,3,0,145,0,0,0,0,0,4,0,237,0,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,1,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,89,185,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,88,26,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,2,0,113,6,0,0,38,0,0,0,88,26,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,113,4,8,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,7,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,157,1,0,0,34,157,1,0,0,35,0,128,0,0,34,0,128,0,0,35,152,1,0,0,34,152,1,0,0,35,0,128,127,0,34,0,128,127,0,35,157,1,0,0,34,157,1,0,0,88,0,0,0,0,15,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,7,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,225,3,0,0,107,91,113,207,2,0,113,206,0,0,89,253,1,0,0,90,107,91,113,207,2,0,113,206,1,0,89,253,1,0,0,90,113,4,1,0,113,5,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,156,2,0,0,34,156,2,0,0,35,0,128,1,0,34,0,128,1,0,35,28,4,0,0,34,28,4,0,0,35,0,128,2,0,34,0,128,2,0,35,165,4,0,0,34,165,4,0,0,35,0,128,127,0,34,0,128,127,0,35,165,4,0,0,34,165,4,0,0,104,0,0,0,0,0,0,0,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,165,4,0,0,34,165,4,0,0,35,0,128,127,0,34,0,128,127,0,35,165,4,0,0,34,165,4,0,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,161,4,0,0,34,161,4,0,0,35,0,128,0,0,34,0,128,0,0,35,108,3,0,0,34,108,3,0,0,35,0,128,127,0,34,0,128,127,0,35,161,4,0,0,34,161,4,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,2,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,88,205,4,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,13,0,8,13,0,0,0,113,0,0,0,0,90,35,206,64,1,0,34,206,64,1,0,16,0,0,0,0,0,10,0,89,43,2,0,0,16,0,0,0,0,0,10,0,89,43,2,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,109,4,0,0,34,109,4,0,0,35,0,128,1,0,34,0,128,1,0,35,122,4,0,0,34,122,4,0,0,16,0,0,0,0,0,10,0,89,173,4,0,0,16,0,0,0,0,0,10,0,89,173,4,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,165,4,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,104,0,0,0,0,15,104,0,0,0,0,15,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,80,15,128,126,5,0,0,81,15,128,126,5,0,0,0,0,80,255,0,126,5,0,0,81,255,0,126,5,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,175,80,15,128,128,5,0,0,81,15,128,128,5,0,0,0,0,80,255,0,131,5,0,0,81,255,0,131,5,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,175,15,113,15,0,0,15,113,15,0,0,15,173,5,0,4,0,15,173,19,0,4,0,15,174,5,0,4,0,15,174,19,0,4,0,15,9,254,9,84,254,9,9,84,254,106,113,4,7,0,113,5,2,0,113,6,0,0,38,0,0,0,110,38,0,0,0,108,90,106,113,4,7,0,113,5,2,0,113,6,1,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,234,5,0,0,90,104,0,0,0,0,0,0,0,112,16,0,100,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,137,6,0,0,34,137,6,0,0,35,0,128,1,0,34,0,128,1,0,35,151,6,0,0,34,151,6,0,0,35,0,128,2,0,34,0,128,2,0,35,165,6,0,0,34,165,6,0,0,35,0,128,3,0,34,0,128,3,0,35,179,6,0,0,34,179,6,0,0,35,0,128,4,0,34,0,128,4,0,35,193,6,0,0,34,193,6,0,0,35,0,128,5,0,34,0,128,5,0,35,207,6,0,0,34,207,6,0,0,35,0,128,127,0,34,0,128,127,0,35,207,6,0,0,34,207,6,0,0,90,16,0,0,0,0,0,10,0,89,234,5,0,0,90,16,0,0,0,0,0,10,0,89,234,5,0,0,90,16,0,0,0,0,0,10,0,89,234,5,0,0,90,16,0,0,0,0,0,10,0,89,234,5,0,0,90,16,0,0,0,0,0,10,0,89,234,5,0,0,90,108,90] as const;

export const STATS = { ops: 259, bytes: 1745, labels: 58, unknownOps: 2, unresolvedSymbols: 63 } as const;
