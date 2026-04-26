// AUTO-GENERATED from data/maps/BattleFrontier_BattleFactoryLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=225, bytes=1091, labels=49, unknownOps=8, unresolvedSymbols=53

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
  "BattleFrontier_BattleFactoryLobby_EventScript_RecordBattle": 383,
  "BattleFrontier_BattleFactoryLobby_EventScript_EndRecordBattle": 388,
  "BattleFrontier_BattleFactoryLobby_EventScript_ResumeChallenge": 403,
  "BattleFrontier_BattleFactoryLobby_EventScript_SinglesAttendant": 462,
  "BattleFrontier_BattleFactoryLobby_EventScript_DoublesAttendant": 478,
  "BattleFrontier_BattleFactoryLobby_EventScript_Attendant": 492,
  "BattleFrontier_BattleFactoryLobby_EventScript_AskTakeChallenge": 516,
  "BattleFrontier_BattleFactoryLobby_EventScript_TryEnterChallenge": 544,
  "BattleFrontier_BattleFactoryLobby_EventScript_SaveBeforeChallenge": 586,
  "BattleFrontier_BattleFactoryLobby_EventScript_EnterChallenge": 687,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToSinglesAttendant": 789,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToDoublesAttendant": 793,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainChallenge": 797,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallengeSaveFailed": 822,
  "BattleFrontier_BattleFactoryLobby_EventScript_LoadPartyAndCancelChallenge": 848,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallenge": 852,
  "BattleFrontier_BattleFactoryLobby_Movement_AttendantEnterDoor": 862,
  "BattleFrontier_BattleFactoryLobby_Movement_PlayerEnterDoor": 862,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForSingleBattle": 862,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForDoubleBattle": 870,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeSinglesChallenge": 878,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeDoublesChallenge": 883,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainSinglesChallenge": 888,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainDoublesChallenge": 896,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowSinglesResults": 904,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowDoublesResults": 928,
  "BattleFrontier_BattleFactoryLobby_EventScript_Woman": 952,
  "BattleFrontier_BattleFactoryLobby_EventScript_Camper": 961,
  "BattleFrontier_BattleFactoryLobby_EventScript_Picnicker": 970,
  "BattleFrontier_BattleFactoryLobby_EventScript_FatMan": 981,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBoard": 990,
  "BattleFrontier_BattleFactoryLobby_EventScript_ReadRulesBoard": 1005,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBasics": 1019,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapPartner": 1033,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNumber": 1047,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNotes": 1061,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesOpenLv": 1075,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExitRules": 1089,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,27,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,92,255,0,2,90,0,0,0,0,67,0,0,0,0,0,1,0,76,0,0,0,0,0,2,0,147,1,0,0,0,0,3,0,184,0,0,0,0,0,4,0,40,1,0,0,113,4,0,0,38,0,0,0,90,106,16,0,0,0,0,0,10,0,105,113,4,8,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,108,90,106,113,4,10,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,0,0,0,89,230,0,0,0,16,0,0,0,0,0,10,0,0,0,0,16,0,0,0,0,0,10,0,113,4,11,0,38,0,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,89,98,1,0,0,90,106,104,0,0,0,0,0,0,0,113,4,8,0,38,0,0,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,3,0,113,5,0,0,38,0,0,0,9,55,0,49,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,16,0,0,0,0,0,10,0,105,113,0,255,0,108,90,106,104,0,0,0,0,0,0,0,113,4,3,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,113,6,2,0,89,175,2,0,0,107,91,113,207,4,0,113,206,0,0,89,236,1,0,0,90,113,207,4,0,113,206,1,0,89,236,1,0,0,90,38,0,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,0,0,0,112,17,6,23,0,104,0,0,0,0,0,0,0,112,17,6,24,0,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,16,0,0,0,0,0,10,0,113,0,0,0,113,4,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,2,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,105,4,2,88,0,0,0,0,113,0,255,0,35,13,128,0,0,34,13,128,0,0,113,6,0,0,38,0,0,0,16,0,0,0,0,0,10,0,105,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,80,15,128,94,3,0,0,81,15,128,94,3,0,0,0,0,80,255,0,94,3,0,0,81,255,0,94,3,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,13,0,8,13,0,0,0,113,0,0,0,0,90,113,15,0,0,113,15,0,0,35,206,64,0,0,34,206,64,0,0,35,206,64,1,0,34,206,64,1,0,89,4,2,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,89,84,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,104,0,0,0,0,104,0,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,106,113,4,7,0,113,5,4,0,113,6,0,0,38,0,0,0,110,38,0,0,0,108,90,106,113,4,7,0,113,5,4,0,113,6,1,0,38,0,0,0,110,38,0,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,106,16,0,0,0,0,0,10,0,89,237,3,0,0,90,104,0,0,0,0,0,0,0,112,17,0,99,0,90,16,0,0,0,0,0,10,0,89,237,3,0,0,90,16,0,0,0,0,0,10,0,89,237,3,0,0,90,16,0,0,0,0,0,10,0,89,237,3,0,0,90,16,0,0,0,0,0,10,0,89,237,3,0,0,90,16,0,0,0,0,0,10,0,89,237,3,0,0,90,108,90] as const;

export const STATS = { ops: 225, bytes: 1091, labels: 49, unknownOps: 8, unresolvedSymbols: 53 } as const;
