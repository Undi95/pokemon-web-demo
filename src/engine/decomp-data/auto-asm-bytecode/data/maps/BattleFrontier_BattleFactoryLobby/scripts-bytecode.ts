// AUTO-GENERATED from data/maps/BattleFrontier_BattleFactoryLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=225, bytes=1924, labels=49, unknownOps=0, unresolvedSymbols=90

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleFactoryLobby_MapScripts": 0,
  "BattleFrontier_BattleFactoryLobby_OnWarp": 10,
  "BattleFrontier_BattleFactoryLobby_EventScript_TurnPlayerNorth": 18,
  "BattleFrontier_BattleFactoryLobby_OnFrame": 28,
  "BattleFrontier_BattleFactoryLobby_EventScript_GetChallengeStatus": 68,
  "BattleFrontier_BattleFactoryLobby_EventScript_QuitWithoutSaving": 78,
  "BattleFrontier_BattleFactoryLobby_EventScript_WonChallenge": 200,
  "BattleFrontier_BattleFactoryLobby_EventScript_DefeatedFactoryHead": 246,
  "BattleFrontier_BattleFactoryLobby_EventScript_GiveBattlePoints": 255,
  "BattleFrontier_BattleFactoryLobby_EventScript_LostChallenge": 323,
  "BattleFrontier_BattleFactoryLobby_EventScript_AskRecordBattle": 385,
  "BattleFrontier_BattleFactoryLobby_EventScript_RecordBattle": 525,
  "BattleFrontier_BattleFactoryLobby_EventScript_EndRecordBattle": 530,
  "BattleFrontier_BattleFactoryLobby_EventScript_ResumeChallenge": 546,
  "BattleFrontier_BattleFactoryLobby_EventScript_SinglesAttendant": 610,
  "BattleFrontier_BattleFactoryLobby_EventScript_DoublesAttendant": 628,
  "BattleFrontier_BattleFactoryLobby_EventScript_Attendant": 644,
  "BattleFrontier_BattleFactoryLobby_EventScript_AskTakeChallenge": 692,
  "BattleFrontier_BattleFactoryLobby_EventScript_TryEnterChallenge": 875,
  "BattleFrontier_BattleFactoryLobby_EventScript_SaveBeforeChallenge": 1088,
  "BattleFrontier_BattleFactoryLobby_EventScript_EnterChallenge": 1215,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToSinglesAttendant": 1342,
  "BattleFrontier_BattleFactoryLobby_EventScript_TalkedToDoublesAttendant": 1348,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainChallenge": 1354,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallengeSaveFailed": 1403,
  "BattleFrontier_BattleFactoryLobby_EventScript_LoadPartyAndCancelChallenge": 1432,
  "BattleFrontier_BattleFactoryLobby_EventScript_CancelChallenge": 1436,
  "BattleFrontier_BattleFactoryLobby_Movement_AttendantEnterDoor": 1446,
  "BattleFrontier_BattleFactoryLobby_Movement_PlayerEnterDoor": 1451,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForSingleBattle": 1456,
  "BattleFrontier_BattleFactoryLobby_EventScript_WelcomeForDoubleBattle": 1465,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeSinglesChallenge": 1474,
  "BattleFrontier_BattleFactoryLobby_EventScript_TakeDoublesChallenge": 1480,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainSinglesChallenge": 1486,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExplainDoublesChallenge": 1495,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowSinglesResults": 1504,
  "BattleFrontier_BattleFactoryLobby_EventScript_ShowDoublesResults": 1531,
  "BattleFrontier_BattleFactoryLobby_EventScript_Woman": 1558,
  "BattleFrontier_BattleFactoryLobby_EventScript_Camper": 1567,
  "BattleFrontier_BattleFactoryLobby_EventScript_Picnicker": 1576,
  "BattleFrontier_BattleFactoryLobby_EventScript_FatMan": 1587,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBoard": 1596,
  "BattleFrontier_BattleFactoryLobby_EventScript_ReadRulesBoard": 1611,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesBasics": 1852,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapPartner": 1866,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNumber": 1880,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesSwapNotes": 1894,
  "BattleFrontier_BattleFactoryLobby_EventScript_RulesOpenLv": 1908,
  "BattleFrontier_BattleFactoryLobby_EventScript_ExitRules": 1922,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,28,0,0,0,0,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,92,0,0,0,3,0,0,0,0,68,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,34,2,0,0,0,0,0,0,200,0,0,0,0,0,0,0,67,1,0,0,23,0,0,0,0,38,0,0,0,3,106,16,0,0,0,0,0,10,4,105,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,108,3,106,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,246,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,103,6,255,0,0,0,16,0,0,0,0,0,10,4,103,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,9,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,6,129,1,0,0,3,106,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,5,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,18,2,0,0,7,1,0,0,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,18,2,0,0,34,18,2,0,0,7,1,0,0,0,0,7,1,18,2,0,0,35,0,0,0,0,34,0,0,0,0,35,13,2,0,0,34,13,2,0,0,7,1,0,0,0,0,7,1,13,2,0,0,35,0,0,0,0,34,0,0,0,0,35,18,2,0,0,34,18,2,0,0,7,1,0,0,0,0,7,1,18,2,0,0,5,0,0,0,0,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,23,0,0,2,0,6,191,4,0,0,107,91,23,0,0,0,0,23,0,0,0,0,6,132,2,0,0,3,23,0,0,0,0,23,0,0,0,0,6,132,2,0,0,3,38,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,176,5,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,185,5,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,194,5,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,200,5,0,0,8,1,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,107,3,0,0,34,107,3,0,0,7,1,0,0,0,0,7,1,107,3,0,0,35,0,0,1,0,34,0,0,1,0,35,74,5,0,0,34,74,5,0,0,7,1,0,0,0,0,7,1,74,5,0,0,35,0,0,2,0,34,0,0,2,0,35,156,5,0,0,34,156,5,0,0,7,1,0,0,0,0,7,1,156,5,0,0,35,0,0,0,0,34,0,0,0,0,35,156,5,0,0,34,156,5,0,0,7,1,0,0,0,0,7,1,156,5,0,0,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,156,5,0,0,34,156,5,0,0,7,1,0,0,0,0,7,1,156,5,0,0,35,0,0,0,0,34,0,0,0,0,35,156,5,0,0,34,156,5,0,0,7,1,0,0,0,0,7,1,156,5,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,152,5,0,0,34,152,5,0,0,7,1,0,0,0,0,7,1,152,5,0,0,35,0,0,1,0,34,0,0,1,0,35,64,4,0,0,34,64,4,0,0,7,1,0,0,0,0,7,1,64,4,0,0,35,0,0,0,0,34,0,0,0,0,35,152,5,0,0,34,152,5,0,0,7,1,0,0,0,0,7,1,152,5,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,1,0,23,0,0,1,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,105,41,2,0,5,0,0,0,0,23,0,0,255,0,35,0,0,0,0,34,0,0,0,0,7,1,123,5,0,0,7,1,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,35,0,0,0,0,34,0,0,0,0,8,1,62,5,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,68,5,0,0,8,1,0,0,0,0,80,0,0,166,5,0,0,81,0,0,166,5,0,0,0,0,80,0,0,171,5,0,0,81,0,0,171,5,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,0,255,255,255,255,8,255,255,255,255,0,8,0,13,0,8,13,0,0,0,23,0,0,0,0,0,3,23,0,0,0,0,4,23,0,0,0,0,4,35,0,0,0,0,34,0,0,0,0,8,1,206,5,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,215,5,0,0,8,1,0,0,0,0,6,180,2,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,156,5,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,3,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,104,0,0,0,0,4,104,0,0,0,0,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,106,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,110,38,0,0,0,108,3,106,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,110,38,0,0,0,108,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,106,16,0,0,0,0,0,10,4,6,75,6,0,0,3,104,0,0,0,0,103,112,17,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,60,7,0,0,34,60,7,0,0,7,1,0,0,0,0,7,1,60,7,0,0,35,0,0,1,0,34,0,0,1,0,35,74,7,0,0,34,74,7,0,0,7,1,0,0,0,0,7,1,74,7,0,0,35,0,0,2,0,34,0,0,2,0,35,88,7,0,0,34,88,7,0,0,7,1,0,0,0,0,7,1,88,7,0,0,35,0,0,3,0,34,0,0,3,0,35,102,7,0,0,34,102,7,0,0,7,1,0,0,0,0,7,1,102,7,0,0,35,0,0,4,0,34,0,0,4,0,35,116,7,0,0,34,116,7,0,0,7,1,0,0,0,0,7,1,116,7,0,0,35,0,0,5,0,34,0,0,5,0,35,130,7,0,0,34,130,7,0,0,7,1,0,0,0,0,7,1,130,7,0,0,35,0,0,0,0,34,0,0,0,0,35,130,7,0,0,34,130,7,0,0,7,1,0,0,0,0,7,1,130,7,0,0,3,16,0,0,0,0,0,10,4,6,75,6,0,0,3,16,0,0,0,0,0,10,4,6,75,6,0,0,3,16,0,0,0,0,0,10,4,6,75,6,0,0,3,16,0,0,0,0,0,10,4,6,75,6,0,0,3,16,0,0,0,0,0,10,4,6,75,6,0,0,3,108,3] as const;

export const STATS = { ops: 225, bytes: 1924, labels: 49, unknownOps: 0, unresolvedSymbols: 90 } as const;
