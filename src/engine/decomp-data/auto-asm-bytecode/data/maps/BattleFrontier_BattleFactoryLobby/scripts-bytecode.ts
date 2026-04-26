// AUTO-GENERATED from data/maps/BattleFrontier_BattleFactoryLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=225, bytes=1874, labels=49, unknownOps=0, unresolvedSymbols=50

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleFactoryLobby_MapScripts": 0,
  "BattleFrontier_BattleFactoryLobby_OnWarp": 10,
  "BattleFrontier_BattleFactoryLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleFactoryLobby_OnFrame": 27,
  "BattleFrontier_BattleFactoryLobby_EventScript_GetChallengeStatus": 67,
  "BattleFrontier_BattleFactoryLobby_EventScript_QuitWithoutSaving": 76,
  "BattleFrontier_BattleFactoryLobby_EventScript_WonChallenge": 184,
  "BattleFrontier_BattleFactoryLobby_EventScript_DefeatedFactoryHead": 231,
  "BattleFrontier_BattleFactoryLobby_EventScript_GiveBattlePoints": 242,
  "BattleFrontier_BattleFactoryLobby_EventScript_LostChallenge": 308,
  "BattleFrontier_BattleFactoryLobby_EventScript_AskRecordBattle": 366,
  "BattleFrontier_BattleFactoryLobby_EventScript_RecordBattle": 508,
  "BattleFrontier_BattleFactoryLobby_EventScript_EndRecordBattle": 513,
  "BattleFrontier_BattleFactoryLobby_EventScript_ResumeChallenge": 528,
  "BattleFrontier_BattleFactoryLobby_EventScript_SinglesAttendant": 587,
  "BattleFrontier_BattleFactoryLobby_EventScript_DoublesAttendant": 603,
  "BattleFrontier_BattleFactoryLobby_EventScript_Attendant": 617,
  "BattleFrontier_BattleFactoryLobby_EventScript_AskTakeChallenge": 665,
  "BattleFrontier_BattleFactoryLobby_EventScript_TryEnterChallenge": 850,
  "BattleFrontier_BattleFactoryLobby_EventScript_SaveBeforeChallenge": 1062,
  "BattleFrontier_BattleFactoryLobby_EventScript_EnterChallenge": 1175,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToSinglesAttendant": 1301,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToDoublesAttendant": 1306,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainChallenge": 1311,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallengeSaveFailed": 1360,
  "BattleFrontier_BattleFactoryLobby_EventScript_LoadPartyAndCancelChallenge": 1386,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallenge": 1390,
  "BattleFrontier_BattleFactoryLobby_Movement_AttendantEnterDoor": 1400,
  "BattleFrontier_BattleFactoryLobby_Movement_PlayerEnterDoor": 1405,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForSingleBattle": 1410,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForDoubleBattle": 1419,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeSinglesChallenge": 1428,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeDoublesChallenge": 1434,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainSinglesChallenge": 1440,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainDoublesChallenge": 1449,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowSinglesResults": 1458,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowDoublesResults": 1482,
  "BattleFrontier_BattleFactoryLobby_EventScript_Woman": 1506,
  "BattleFrontier_BattleFactoryLobby_EventScript_Camper": 1515,
  "BattleFrontier_BattleFactoryLobby_EventScript_Picnicker": 1524,
  "BattleFrontier_BattleFactoryLobby_EventScript_FatMan": 1535,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBoard": 1544,
  "BattleFrontier_BattleFactoryLobby_EventScript_ReadRulesBoard": 1559,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBasics": 1802,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapPartner": 1816,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNumber": 1830,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNotes": 1844,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesOpenLv": 1858,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExitRules": 1872,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,16,2,0,0,0,0,3,0,184,0,0,0,0,0,4,0,52,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,4,105,113,4,8,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,231,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,0,0,0,89,242,0,0,0,16,0,0,0,0,0,10,4,0,0,0,16,0,0,0,0,0,10,4,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,9,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,89,110,1,0,0,90,106,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,1,2,0,0,7,1,13,128,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,1,2,0,0,34,1,2,0,0,7,1,0,0,0,0,7,1,1,2,0,0,35,0,128,0,0,34,0,128,0,0,35,252,1,0,0,34,252,1,0,0,7,1,0,0,0,0,7,1,252,1,0,0,35,0,128,127,0,34,0,128,127,0,35,1,2,0,0,34,1,2,0,0,7,1,0,0,0,0,7,1,1,2,0,0,88,0,0,0,0,16,0,0,0,0,0,10,4,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,6,2,0,89,151,4,0,0,107,91,113,207,4,0,113,206,0,0,89,105,2,0,0,90,113,207,4,0,113,206,1,0,89,105,2,0,0,90,38,0,0,0,35,206,64,0,0,34,206,64,0,0,8,1,130,5,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,139,5,0,0,8,1,206,64,0,0,35,206,64,0,0,34,206,64,0,0,8,1,148,5,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,154,5,0,0,8,1,206,64,0,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,82,3,0,0,34,82,3,0,0,7,1,0,0,0,0,7,1,82,3,0,0,35,0,128,1,0,34,0,128,1,0,35,31,5,0,0,34,31,5,0,0,7,1,0,0,0,0,7,1,31,5,0,0,35,0,128,2,0,34,0,128,2,0,35,110,5,0,0,34,110,5,0,0,7,1,0,0,0,0,7,1,110,5,0,0,35,0,128,127,0,34,0,128,127,0,35,110,5,0,0,34,110,5,0,0,7,1,0,0,0,0,7,1,110,5,0,0,104,0,0,0,0,0,0,0,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,110,5,0,0,34,110,5,0,0,7,1,0,0,0,0,7,1,110,5,0,0,35,0,128,127,0,34,0,128,127,0,35,110,5,0,0,34,110,5,0,0,7,1,0,0,0,0,7,1,110,5,0,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,106,5,0,0,34,106,5,0,0,7,1,0,0,0,0,7,1,106,5,0,0,35,0,128,1,0,34,0,128,1,0,35,38,4,0,0,34,38,4,0,0,7,1,0,0,0,0,7,1,38,4,0,0,35,0,128,127,0,34,0,128,127,0,35,106,5,0,0,34,106,5,0,0,7,1,0,0,0,0,7,1,106,5,0,0,113,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,7,1,80,5,0,0,7,1,13,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,35,206,64,0,0,34,206,64,0,0,8,1,21,5,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,26,5,0,0,8,1,206,64,0,0,80,15,128,120,5,0,0,81,15,128,120,5,0,0,0,0,80,255,0,125,5,0,0,81,255,0,125,5,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,13,0,8,13,0,0,0,113,0,0,0,0,90,113,15,0,0,15,113,15,0,0,15,35,206,64,0,0,34,206,64,0,0,8,1,160,5,0,0,8,1,206,64,0,0,35,206,64,1,0,34,206,64,1,0,8,1,169,5,0,0,8,1,206,64,0,0,89,153,2,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,110,5,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,90,9,9,9,84,254,9,9,9,9,254,16,0,0,0,0,0,10,4,15,16,0,0,0,0,0,10,4,15,104,0,0,0,0,15,104,0,0,0,0,15,16,0,0,0,0,0,10,4,15,16,0,0,0,0,0,10,4,15,106,113,4,7,0,113,5,4,0,113,6,0,0,38,0,0,0,110,38,0,0,0,108,90,106,113,4,7,0,113,5,4,0,113,6,1,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,106,16,0,0,0,0,0,10,4,89,23,6,0,0,90,104,0,0,0,0,0,0,0,112,17,0,99,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,10,7,0,0,34,10,7,0,0,7,1,0,0,0,0,7,1,10,7,0,0,35,0,128,1,0,34,0,128,1,0,35,24,7,0,0,34,24,7,0,0,7,1,0,0,0,0,7,1,24,7,0,0,35,0,128,2,0,34,0,128,2,0,35,38,7,0,0,34,38,7,0,0,7,1,0,0,0,0,7,1,38,7,0,0,35,0,128,3,0,34,0,128,3,0,35,52,7,0,0,34,52,7,0,0,7,1,0,0,0,0,7,1,52,7,0,0,35,0,128,4,0,34,0,128,4,0,35,66,7,0,0,34,66,7,0,0,7,1,0,0,0,0,7,1,66,7,0,0,35,0,128,5,0,34,0,128,5,0,35,80,7,0,0,34,80,7,0,0,7,1,0,0,0,0,7,1,80,7,0,0,35,0,128,127,0,34,0,128,127,0,35,80,7,0,0,34,80,7,0,0,7,1,0,0,0,0,7,1,80,7,0,0,90,16,0,0,0,0,0,10,4,89,23,6,0,0,90,16,0,0,0,0,0,10,4,89,23,6,0,0,90,16,0,0,0,0,0,10,4,89,23,6,0,0,90,16,0,0,0,0,0,10,4,89,23,6,0,0,90,16,0,0,0,0,0,10,4,89,23,6,0,0,90,108,90] as const;

export const STATS = { ops: 225, bytes: 1874, labels: 49, unknownOps: 0, unresolvedSymbols: 50 } as const;
