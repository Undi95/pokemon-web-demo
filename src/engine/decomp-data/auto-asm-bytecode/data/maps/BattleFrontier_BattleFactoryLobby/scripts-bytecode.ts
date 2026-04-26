// AUTO-GENERATED from data/maps/BattleFrontier_BattleFactoryLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=225, bytes=1514, labels=49, unknownOps=2, unresolvedSymbols=56

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleFactoryLobby_MapScripts": 0,
  "BattleFrontier_BattleFactoryLobby_OnWarp": 10,
  "BattleFrontier_BattleFactoryLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleFactoryLobby_OnFrame": 27,
  "BattleFrontier_BattleFactoryLobby_EventScript_GetChallengeStatus": 67,
  "BattleFrontier_BattleFactoryLobby_EventScript_QuitWithoutSaving": 76,
  "BattleFrontier_BattleFactoryLobby_EventScript_WonChallenge": 184,
  "BattleFrontier_BattleFactoryLobby_EventScript_DefeatedFactoryHead": 219,
  "BattleFrontier_BattleFactoryLobby_EventScript_GiveBattlePoints": 230,
  "BattleFrontier_BattleFactoryLobby_EventScript_LostChallenge": 296,
  "BattleFrontier_BattleFactoryLobby_EventScript_AskRecordBattle": 354,
  "BattleFrontier_BattleFactoryLobby_EventScript_RecordBattle": 448,
  "BattleFrontier_BattleFactoryLobby_EventScript_EndRecordBattle": 453,
  "BattleFrontier_BattleFactoryLobby_EventScript_ResumeChallenge": 468,
  "BattleFrontier_BattleFactoryLobby_EventScript_SinglesAttendant": 527,
  "BattleFrontier_BattleFactoryLobby_EventScript_DoublesAttendant": 543,
  "BattleFrontier_BattleFactoryLobby_EventScript_Attendant": 557,
  "BattleFrontier_BattleFactoryLobby_EventScript_AskTakeChallenge": 581,
  "BattleFrontier_BattleFactoryLobby_EventScript_TryEnterChallenge": 694,
  "BattleFrontier_BattleFactoryLobby_EventScript_SaveBeforeChallenge": 846,
  "BattleFrontier_BattleFactoryLobby_EventScript_EnterChallenge": 947,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToSinglesAttendant": 1049,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToDoublesAttendant": 1054,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainChallenge": 1059,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallengeSaveFailed": 1084,
  "BattleFrontier_BattleFactoryLobby_EventScript_LoadPartyAndCancelChallenge": 1110,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallenge": 1114,
  "BattleFrontier_BattleFactoryLobby_Movement_AttendantEnterDoor": 1124,
  "BattleFrontier_BattleFactoryLobby_Movement_PlayerEnterDoor": 1129,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForSingleBattle": 1134,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForDoubleBattle": 1143,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeSinglesChallenge": 1152,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeDoublesChallenge": 1158,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainSinglesChallenge": 1164,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainDoublesChallenge": 1173,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowSinglesResults": 1182,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowDoublesResults": 1206,
  "BattleFrontier_BattleFactoryLobby_EventScript_Woman": 1230,
  "BattleFrontier_BattleFactoryLobby_EventScript_Camper": 1239,
  "BattleFrontier_BattleFactoryLobby_EventScript_Picnicker": 1248,
  "BattleFrontier_BattleFactoryLobby_EventScript_FatMan": 1259,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBoard": 1268,
  "BattleFrontier_BattleFactoryLobby_EventScript_ReadRulesBoard": 1283,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBasics": 1442,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapPartner": 1456,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNumber": 1470,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNotes": 1484,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesOpenLv": 1498,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExitRules": 1512,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,212,1,0,0,0,0,3,0,184,0,0,0,0,0,4,0,40,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,8,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,0,0,0,89,230,0,0,0,16,0,0,0,0,0,10,0,0,0,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,89,98,1,0,0,90,106,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,197,1,0,0,34,197,1,0,0,35,0,128,0,0,34,0,128,0,0,35,192,1,0,0,34,192,1,0,0,35,0,128,127,0,34,0,128,127,0,35,197,1,0,0,34,197,1,0,0,88,0,0,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,6,2,0,89,179,3,0,0,107,91,113,207,4,0,113,206,0,0,89,45,2,0,0,90,113,207,4,0,113,206,1,0,89,45,2,0,0,90,38,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,0,0,0,112,17,6,23,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,182,2,0,0,34,182,2,0,0,35,0,128,1,0,34,0,128,1,0,35,35,4,0,0,34,35,4,0,0,35,0,128,2,0,34,0,128,2,0,35,90,4,0,0,34,90,4,0,0,35,0,128,127,0,34,0,128,127,0,35,90,4,0,0,34,90,4,0,0,104,0,0,0,0,0,0,0,112,17,6,24,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,90,4,0,0,34,90,4,0,0,35,0,128,127,0,34,0,128,127,0,35,90,4,0,0,34,90,4,0,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,86,4,0,0,34,86,4,0,0,35,0,128,0,0,34,0,128,0,0,35,78,3,0,0,34,78,3,0,0,35,0,128,127,0,34,0,128,127,0,35,86,4,0,0,34,86,4,0,0,113,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,105,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,80,15,128,100,4,0,0,81,15,128,100,4,0,0,0,0,80,255,0,105,4,0,0,81,255,0,105,4,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,13,0,8,13,0,0,0,113,0,0,0,0,90,113,15,0,0,15,113,15,0,0,15,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,89,69,2,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,90,4,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,9,9,9,84,254,9,9,9,9,254,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,104,0,0,0,0,15,104,0,0,0,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,106,113,4,7,0,113,5,4,0,113,6,0,0,38,0,0,0,110,38,0,0,0,108,90,106,113,4,7,0,113,5,4,0,113,6,1,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,3,5,0,0,90,104,0,0,0,0,0,0,0,112,17,0,99,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,162,5,0,0,34,162,5,0,0,35,0,128,1,0,34,0,128,1,0,35,176,5,0,0,34,176,5,0,0,35,0,128,2,0,34,0,128,2,0,35,190,5,0,0,34,190,5,0,0,35,0,128,3,0,34,0,128,3,0,35,204,5,0,0,34,204,5,0,0,35,0,128,4,0,34,0,128,4,0,35,218,5,0,0,34,218,5,0,0,35,0,128,5,0,34,0,128,5,0,35,232,5,0,0,34,232,5,0,0,35,0,128,127,0,34,0,128,127,0,35,232,5,0,0,34,232,5,0,0,90,16,0,0,0,0,0,10,0,89,3,5,0,0,90,16,0,0,0,0,0,10,0,89,3,5,0,0,90,16,0,0,0,0,0,10,0,89,3,5,0,0,90,16,0,0,0,0,0,10,0,89,3,5,0,0,90,16,0,0,0,0,0,10,0,89,3,5,0,0,90,108,90] as const;

export const STATS = { ops: 225, bytes: 1514, labels: 49, unknownOps: 2, unresolvedSymbols: 56 } as const;
