// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=259, bytes=1274, labels=58, unknownOps=8, unresolvedSymbols=60

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
  "BattleFrontier_BattlePalaceLobby_EventScript_RecordMatch": 343,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge": 348,
  "BattleFrontier_BattlePalaceLobby_EventScript_ResumeChallenge": 348,
  "BattleFrontier_BattlePalaceLobby_EventScript_SinglesAttendant": 411,
  "BattleFrontier_BattlePalaceLobby_EventScript_DoublesAttendant": 427,
  "BattleFrontier_BattlePalaceLobby_EventScript_Attendant": 443,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeChallenge": 489,
  "BattleFrontier_BattlePalaceLobby_EventScript_TryEnterChallenge": 517,
  "BattleFrontier_BattlePalaceLobby_EventScript_SaveBeforeChallenge": 615,
  "BattleFrontier_BattlePalaceLobby_EventScript_EnterChallenge": 732,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainChallenge": 791,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExplainDoublesChallenge": 814,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMons": 827,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLv50": 827,
  "BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLvOpen": 840,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallengeSaveFailed": 853,
  "BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge": 879,
  "BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge": 883,
  "BattleFrontier_BattlePalaceLobby_EventScript_EndCancelChallenge": 891,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForSingleBattle": 893,
  "BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForDoubleBattle": 901,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeSingleBattleChallenge": 909,
  "BattleFrontier_BattlePalaceLobby_EventScript_AskTakeDoubleBattleChallenge": 914,
  "BattleFrontier_BattlePalaceLobby_EventScript_WalkToDoor": 919,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToSinglesAttendant": 1061,
  "BattleFrontier_BattlePalaceLobby_EventScript_TalkedToDoublesAttendant": 1065,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenSinglesHallDoor": 1069,
  "BattleFrontier_BattlePalaceLobby_EventScript_OpenDoublesHallDoor": 1074,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseSinglesHallDoor": 1079,
  "BattleFrontier_BattlePalaceLobby_EventScript_CloseDoublesHallDoor": 1084,
  "BattleFrontier_BattlePalaceLobby_Movement_WalkToDoor": 1089,
  "BattleFrontier_BattlePalaceLobby_Movement_AttendantEnterDoor": 1089,
  "BattleFrontier_BattlePalaceLobby_Movement_PlayerEnterDoor": 1089,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowSinglesResults": 1089,
  "BattleFrontier_BattlePalaceLobby_EventScript_ShowDoublesResults": 1113,
  "BattleFrontier_BattlePalaceLobby_EventScript_BlackBelt": 1137,
  "BattleFrontier_BattlePalaceLobby_EventScript_Man": 1146,
  "BattleFrontier_BattlePalaceLobby_EventScript_Beauty": 1155,
  "BattleFrontier_BattlePalaceLobby_EventScript_Maniac": 1164,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBoard": 1173,
  "BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard": 1188,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesBasics": 1202,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesNature": 1216,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesMoves": 1230,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesUnderpowered": 1244,
  "BattleFrontier_BattlePalaceLobby_EventScript_RulesWhenInDanger": 1258,
  "BattleFrontier_BattlePalaceLobby_EventScript_ExitRules": 1272,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,92,1,0,0,0,0,3,0,145,0,0,0,0,0,4,0,237,0,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,1,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,89,185,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,88,26,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,2,0,113,5,2,0,113,6,0,0,38,0,0,0,88,26,1,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,113,4,8,0,38,0,0,0,38,0,0,0,38,0,0,0,113,4,7,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,106,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,7,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,89,220,2,0,0,107,91,113,207,2,0,113,206,0,0,89,187,1,0,0,90,107,91,113,207,2,0,113,206,1,0,89,187,1,0,0,90,113,4,1,0,113,5,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,0,0,0,112,17,6,23,0,104,0,0,0,0,0,0,0,112,17,6,24,0,113,4,15,0,38,0,0,0,35,4,128,1,0,34,4,128,1,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,152,1,88,0,0,0,0,26,4,128,13,128,113,5,3,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,2,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,88,151,3,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,13,0,8,13,0,0,0,113,0,0,0,0,90,35,206,64,1,0,34,206,64,1,0,16,0,0,0,0,0,10,0,89,233,1,0,0,16,0,0,0,0,0,10,0,89,233,1,0,0,16,0,0,0,0,0,10,0,89,123,3,0,0,16,0,0,0,0,0,10,0,89,123,3,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,115,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,104,0,0,0,0,104,0,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,80,15,128,65,4,0,0,81,15,128,65,4,0,0,0,0,80,255,0,65,4,0,0,81,255,0,65,4,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,175,80,15,128,65,4,0,0,81,15,128,65,4,0,0,0,0,80,255,0,65,4,0,0,81,255,0,65,4,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,175,113,15,0,0,113,15,0,0,173,5,0,4,0,173,19,0,4,0,174,5,0,4,0,174,19,0,4,0,106,113,4,7,0,113,5,2,0,113,6,0,0,38,0,0,0,110,38,0,0,0,108,90,106,113,4,7,0,113,5,2,0,113,6,1,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,164,4,0,0,90,104,0,0,0,0,0,0,0,112,16,0,100,0,90,16,0,0,0,0,0,10,0,89,164,4,0,0,90,16,0,0,0,0,0,10,0,89,164,4,0,0,90,16,0,0,0,0,0,10,0,89,164,4,0,0,90,16,0,0,0,0,0,10,0,89,164,4,0,0,90,16,0,0,0,0,0,10,0,89,164,4,0,0,90,108,90] as const;

export const STATS = { ops: 259, bytes: 1274, labels: 58, unknownOps: 8, unresolvedSymbols: 60 } as const;
