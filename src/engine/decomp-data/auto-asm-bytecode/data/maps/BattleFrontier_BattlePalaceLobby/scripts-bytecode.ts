// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=259, bytes=2201, labels=58, unknownOps=0, unresolvedSymbols=63

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePalaceLobby_MapScripts": 0,
  "BattleFrontier_BattlePalaceLobby_OnWarp": 10,
  "BattleFrontier_BattlePalaceLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattlePalaceLobby_OnFrame": 27,
  "BattleFrontier_BattlePalaceLobby_EventScript_GetChallengeStatus": 67,
  "BattleFrontier_BattlePalaceLobby_EventScript_QuitWithoutSaving": 76,
  "BattleFrontier_BattlePalaceLobby_EventScript_WonChallenge": 145,
  "BattleFrontier_BattlePalaceLobby_EventScript_DefeatedMaven": 189,
  "BattleFrontier_BattlePalaceLobby_EventScript_GiveBattlePoints": 197,
  "BattleFrontier_BattlePalaceLobby_EventScript_LostChallenge": 249,
  "BattleFrontier_BattlePalaceLobby_EventScript_SaveAfterChallenge": 294,
  "BattleFrontier_BattlePalaceLobby_EventScript_RecordMatch": 468,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge": 473,
  "BattleFrontier_BattlePalaceLobby_EventScript_ResumeChallenge": 474,
  "BattleFrontier_BattlePalaceLobby_EventScript_SinglesAttendant": 537,
  "BattleFrontier_BattlePalaceLobby_EventScript_DoublesAttendant": 553,
  "BattleFrontier_BattlePalaceLobby_EventScript_Attendant": 569,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeChallenge": 651,
  "BattleFrontier_BattlePalaceLobby_EventScript_TryEnterChallenge": 836,
  "BattleFrontier_BattlePalaceLobby_EventScript_SaveBeforeChallenge": 1128,
  "BattleFrontier_BattlePalaceLobby_EventScript_EnterChallenge": 1257,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainChallenge": 1316,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainDoublesChallenge": 1351,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMons": 1364,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLv50": 1433,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLvOpen": 1446,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallengeSaveFailed": 1459,
  "BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge": 1485,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge": 1489,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndCancelChallenge": 1497,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForSingleBattle": 1499,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForDoubleBattle": 1508,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeSingleBattleChallenge": 1517,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeDoubleBattleChallenge": 1523,
  "BattleFrontier_BattlePalaceLobby_EventScript_WalkToDoor": 1529,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToSinglesAttendant": 1744,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToDoublesAttendant": 1749,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenSinglesHallDoor": 1754,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenDoublesHallDoor": 1760,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseSinglesHallDoor": 1766,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseDoublesHallDoor": 1772,
  "BattleFrontier_BattlePalaceLobby_Movement_WalkToDoor": 1778,
  "BattleFrontier_BattlePalaceLobby_Movement_AttendantEnterDoor": 1780,
  "BattleFrontier_BattlePalaceLobby_Movement_PlayerEnterDoor": 1783,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowSinglesResults": 1787,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowDoublesResults": 1811,
  "BattleFrontier_BattlePalaceLobby_EventScript_BlackBelt": 1835,
  "BattleFrontier_BattlePalaceLobby_EventScript_Man": 1844,
  "BattleFrontier_BattlePalaceLobby_EventScript_Beauty": 1853,
  "BattleFrontier_BattlePalaceLobby_EventScript_Maniac": 1862,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBoard": 1871,
  "BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard": 1886,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBasics": 2129,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesNature": 2143,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesMoves": 2157,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesUnderpowered": 2171,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesWhenInDanger": 2185,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExitRules": 2199,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,218,1,0,0,0,0,3,0,145,0,0,0,0,0,4,0,249,0,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,1,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,189,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,89,197,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,88,38,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,2,0,113,6,0,0,38,0,0,0,88,38,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,113,4,8,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,7,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,217,1,0,0,7,1,13,128,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,217,1,0,0,34,217,1,0,0,7,1,0,0,0,0,7,1,217,1,0,0,35,0,128,0,0,34,0,128,0,0,35,212,1,0,0,34,212,1,0,0,7,1,0,0,0,0,7,1,212,1,0,0,35,0,128,127,0,34,0,128,127,0,35,217,1,0,0,34,217,1,0,0,7,1,0,0,0,0,7,1,217,1,0,0,88,0,0,0,0,15,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,7,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,233,4,0,0,107,91,113,207,2,0,113,206,0,0,89,57,2,0,0,90,107,91,113,207,2,0,113,206,1,0,89,57,2,0,0,90,113,4,1,0,113,5,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,145,0,0,0,7,5,13,128,0,0,38,0,0,0,35,206,64,0,0,34,206,64,0,0,8,1,219,5,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,228,5,0,0,8,1,206,64,0,0,35,206,64,0,0,34,206,64,0,0,8,1,237,5,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,243,5,0,0,8,1,206,64,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,68,3,0,0,34,68,3,0,0,7,1,0,0,0,0,7,1,68,3,0,0,35,0,128,1,0,34,0,128,1,0,35,36,5,0,0,34,36,5,0,0,7,1,0,0,0,0,7,1,36,5,0,0,35,0,128,2,0,34,0,128,2,0,35,209,5,0,0,34,209,5,0,0,7,1,0,0,0,0,7,1,209,5,0,0,35,0,128,127,0,34,0,128,127,0,35,209,5,0,0,34,209,5,0,0,7,1,0,0,0,0,7,1,209,5,0,0,104,0,0,0,0,0,0,0,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,209,5,0,0,34,209,5,0,0,7,1,0,0,0,0,7,1,209,5,0,0,35,0,128,127,0,34,0,128,127,0,35,209,5,0,0,34,209,5,0,0,7,1,0,0,0,0,7,1,209,5,0,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,7,1,84,5,0,0,7,1,4,128,0,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,205,5,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,205,5,0,0,34,205,5,0,0,7,1,0,0,0,0,7,1,205,5,0,0,35,0,128,0,0,34,0,128,0,0,35,104,4,0,0,34,104,4,0,0,7,1,0,0,0,0,7,1,104,4,0,0,35,0,128,127,0,34,0,128,127,0,35,205,5,0,0,34,205,5,0,0,7,1,0,0,0,0,7,1,205,5,0,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,2,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,7,1,179,5,0,0,7,1,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,88,249,5,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,13,0,8,13,0,0,0,113,0,0,0,0,90,35,206,64,1,0,34,206,64,1,0,7,1,71,5,0,0,7,1,206,64,0,0,16,0,0,0,0,0,10,0,89,139,2,0,0,16,0,0,0,0,0,10,0,89,139,2,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,153,5,0,0,34,153,5,0,0,7,1,0,0,0,0,7,1,153,5,0,0,35,0,128,1,0,34,0,128,1,0,35,166,5,0,0,34,166,5,0,0,7,1,0,0,0,0,7,1,166,5,0,0,16,0,0,0,0,0,10,0,89,217,5,0,0,16,0,0,0,0,0,10,0,89,217,5,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,209,5,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,104,0,0,0,0,15,104,0,0,0,0,15,35,206,64,0,0,34,206,64,0,0,8,1,208,6,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,213,6,0,0,8,1,206,64,0,0,80,15,128,242,6,0,0,81,15,128,242,6,0,0,0,0,80,255,0,242,6,0,0,81,255,0,242,6,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,8,1,218,6,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,224,6,0,0,8,1,206,64,0,0,175,80,15,128,244,6,0,0,81,15,128,244,6,0,0,0,0,80,255,0,247,6,0,0,81,255,0,247,6,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,8,1,230,6,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,236,6,0,0,8,1,206,64,0,0,175,15,113,15,0,0,15,113,15,0,0,15,173,5,0,4,0,15,173,19,0,4,0,15,174,5,0,4,0,15,174,19,0,4,0,15,9,254,9,84,254,9,9,84,254,106,113,4,7,0,113,5,2,0,113,6,0,0,38,0,0,0,110,38,0,0,0,108,90,106,113,4,7,0,113,5,2,0,113,6,1,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,94,7,0,0,90,104,0,0,0,0,0,0,0,112,16,0,100,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,81,8,0,0,34,81,8,0,0,7,1,0,0,0,0,7,1,81,8,0,0,35,0,128,1,0,34,0,128,1,0,35,95,8,0,0,34,95,8,0,0,7,1,0,0,0,0,7,1,95,8,0,0,35,0,128,2,0,34,0,128,2,0,35,109,8,0,0,34,109,8,0,0,7,1,0,0,0,0,7,1,109,8,0,0,35,0,128,3,0,34,0,128,3,0,35,123,8,0,0,34,123,8,0,0,7,1,0,0,0,0,7,1,123,8,0,0,35,0,128,4,0,34,0,128,4,0,35,137,8,0,0,34,137,8,0,0,7,1,0,0,0,0,7,1,137,8,0,0,35,0,128,5,0,34,0,128,5,0,35,151,8,0,0,34,151,8,0,0,7,1,0,0,0,0,7,1,151,8,0,0,35,0,128,127,0,34,0,128,127,0,35,151,8,0,0,34,151,8,0,0,7,1,0,0,0,0,7,1,151,8,0,0,90,16,0,0,0,0,0,10,0,89,94,7,0,0,90,16,0,0,0,0,0,10,0,89,94,7,0,0,90,16,0,0,0,0,0,10,0,89,94,7,0,0,90,16,0,0,0,0,0,10,0,89,94,7,0,0,90,16,0,0,0,0,0,10,0,89,94,7,0,0,90,108,90] as const;

export const STATS = { ops: 259, bytes: 2201, labels: 58, unknownOps: 0, unresolvedSymbols: 63 } as const;
