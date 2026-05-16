// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=325, bytes=3114, labels=56, unknownOps=0, unresolvedSymbols=48

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SetUpObjects": 18,
  "BattleFrontier_BattleTowerBattleRoom_OnFrame": 39,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EnterRoom": 47,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_OpponentEnter": 187,
  "BattleFrontier_BattleTower_EventScript_WarpToLobbyLost": 292,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedOpponent": 342,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponent": 518,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponentNoRecord": 767,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRecordBattle": 905,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RecordBattle": 1020,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskPauseChallenge": 1030,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRetireChallenge": 1139,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ContinueChallenge": 1254,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyWon": 1308,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_PauseChallenge": 1358,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyForOpponent": 1393,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor2ndOpponent": 1595,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor3rdOpponent": 1604,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor4thOpponent": 1613,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor5thOpponent": 1622,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor6thOpponent": 1631,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor7thOpponent": 1640,
  "BattleFrontier_EventScript_IncrementWinStreak": 1649,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SecondAttendantEnter": 1658,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_MaidenUpNext": 1822,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaiden": 1856,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaidenNoRecord": 2061,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabel": 2199,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelSilver": 2449,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelSilver": 2489,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AnabelGoldIntro": 2565,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelGold": 2628,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelGold": 2668,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DoTowerBattle": 2744,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EndTowerBattle": 2833,
  "BattleFrontier_EventScript_SetBrainObjectGfx": 2854,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerEnter": 2863,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceAttendant": 2868,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceBattle": 2870,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentEnter": 2872,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentExit": 2878,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantApproachPlayer": 2883,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantReturnToPos": 2888,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SetInvisible": 2894,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantEnter": 2896,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantExit": 2903,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantDelay": 2908,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantFaceSecondAttendant": 2913,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AnabelEnter": 2920,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobby": 2926,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyDoubles": 3022,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyMultis": 3047,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyLinkMultis": 3072,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RetireChallenge": 3105,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,39,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,80,0,0,78,11,0,0,81,0,0,78,11,0,0,0,0,90,0,0,0,0,47,0,0,0,113,0,1,0,80,255,0,47,11,0,0,81,255,0,47,11,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,187,0,0,0,7,1,13,128,0,0,80,0,0,67,11,0,0,81,0,0,67,11,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,52,11,0,0,81,255,0,52,11,0,0,0,0,82,0,0,83,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,6,2,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,56,11,0,0,81,0,0,56,11,0,0,0,0,82,0,0,83,0,0,0,0,113,4,7,0,113,5,0,0,38,0,0,0,16,0,0,0,0,0,10,4,0,0,0,88,184,10,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,86,1,0,0,34,86,1,0,0,7,1,0,0,0,0,7,1,86,1,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,110,11,0,0,88,113,6,0,0,113,4,4,0,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,28,5,0,0,34,28,5,0,0,7,1,0,0,0,0,7,1,28,5,0,0,80,0,0,62,11,0,0,81,0,0,62,11,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,8,5,122,6,0,0,8,5,13,128,0,0,80,0,0,67,11,0,0,81,0,0,67,11,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,52,11,0,0,81,255,0,52,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,7,5,30,7,0,0,7,5,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,88,113,5,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,255,2,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,230,4,0,0,34,230,4,0,0,7,1,0,0,0,0,7,1,230,4,0,0,35,0,128,1,0,34,0,128,1,0,35,137,3,0,0,34,137,3,0,0,7,1,0,0,0,0,7,1,137,3,0,0,35,0,128,2,0,34,0,128,2,0,35,6,4,0,0,34,6,4,0,0,7,1,0,0,0,0,7,1,6,4,0,0,35,0,128,3,0,34,0,128,3,0,35,115,4,0,0,34,115,4,0,0,7,1,0,0,0,0,7,1,115,4,0,0,35,0,128,127,0,34,0,128,127,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,230,4,0,0,34,230,4,0,0,7,1,0,0,0,0,7,1,230,4,0,0,35,0,128,1,0,34,0,128,1,0,35,6,4,0,0,34,6,4,0,0,7,1,0,0,0,0,7,1,6,4,0,0,35,0,128,2,0,34,0,128,2,0,35,115,4,0,0,34,115,4,0,0,7,1,0,0,0,0,7,1,115,4,0,0,35,0,128,127,0,34,0,128,127,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,35,0,128,0,0,34,0,128,0,0,35,252,3,0,0,34,252,3,0,0,7,1,0,0,0,0,7,1,252,3,0,0,35,0,128,127,0,34,0,128,127,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,88,0,0,0,0,89,6,2,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,35,0,128,1,0,34,0,128,1,0,35,78,5,0,0,34,78,5,0,0,7,1,0,0,0,0,7,1,78,5,0,0,35,0,128,127,0,34,0,128,127,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,35,0,128,0,0,34,0,128,0,0,35,33,12,0,0,34,33,12,0,0,7,1,0,0,0,0,7,1,33,12,0,0,35,0,128,127,0,34,0,128,127,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,105,80,255,0,54,11,0,0,81,255,0,54,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,72,11,0,0,81,0,0,72,11,0,0,0,0,82,0,0,83,0,0,0,0,89,187,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,110,11,0,0,104,0,0,0,0,0,0,0,113,4,6,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,59,6,0,0,34,59,6,0,0,7,1,0,0,0,0,7,1,59,6,0,0,35,0,128,2,0,34,0,128,2,0,35,68,6,0,0,34,68,6,0,0,7,1,0,0,0,0,7,1,68,6,0,0,35,0,128,3,0,34,0,128,3,0,35,77,6,0,0,34,77,6,0,0,7,1,0,0,0,0,7,1,77,6,0,0,35,0,128,4,0,34,0,128,4,0,35,86,6,0,0,34,86,6,0,0,7,1,0,0,0,0,7,1,86,6,0,0,35,0,128,5,0,34,0,128,5,0,35,95,6,0,0,34,95,6,0,0,7,1,0,0,0,0,7,1,95,6,0,0,35,0,128,6,0,34,0,128,6,0,35,104,6,0,0,34,104,6,0,0,7,1,0,0,0,0,7,1,104,6,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,113,4,17,0,38,0,0,0,15,80,0,0,80,11,0,0,81,0,0,80,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,92,11,0,0,81,0,0,92,11,0,0,0,0,80,0,0,97,11,0,0,81,0,0,97,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,87,11,0,0,81,0,0,87,11,0,0,0,0,82,0,0,83,0,0,0,0,15,35,0,0,1,0,34,0,0,1,0,7,1,64,7,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,13,8,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,151,8,0,0,34,151,8,0,0,7,1,0,0,0,0,7,1,151,8,0,0,35,0,128,1,0,34,0,128,1,0,35,137,3,0,0,34,137,3,0,0,7,1,0,0,0,0,7,1,137,3,0,0,35,0,128,2,0,34,0,128,2,0,35,6,4,0,0,34,6,4,0,0,7,1,0,0,0,0,7,1,6,4,0,0,35,0,128,3,0,34,0,128,3,0,35,115,4,0,0,34,115,4,0,0,7,1,0,0,0,0,7,1,115,4,0,0,35,0,128,127,0,34,0,128,127,0,35,64,7,0,0,34,64,7,0,0,7,1,0,0,0,0,7,1,64,7,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,151,8,0,0,34,151,8,0,0,7,1,0,0,0,0,7,1,151,8,0,0,35,0,128,1,0,34,0,128,1,0,35,6,4,0,0,34,6,4,0,0,7,1,0,0,0,0,7,1,6,4,0,0,35,0,128,2,0,34,0,128,2,0,35,115,4,0,0,34,115,4,0,0,7,1,0,0,0,0,7,1,115,4,0,0,35,0,128,127,0,34,0,128,127,0,35,64,7,0,0,34,64,7,0,0,7,1,0,0,0,0,7,1,64,7,0,0,88,38,11,0,0,105,80,255,0,54,11,0,0,81,255,0,54,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,72,11,0,0,81,0,0,72,11,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,104,11,0,0,81,0,0,104,11,0,0,0,0,82,0,0,83,0,0,0,0,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,5,10,0,0,34,5,10,0,0,7,1,0,0,0,0,7,1,5,10,0,0,35,0,128,3,0,34,0,128,3,0,35,145,9,0,0,34,145,9,0,0,7,1,0,0,0,0,7,1,145,9,0,0,35,0,128,4,0,34,0,128,4,0,35,68,10,0,0,34,68,10,0,0,7,1,0,0,0,0,7,1,68,10,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,145,9,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,4,88,184,10,0,0,35,13,128,1,0,34,13,128,1,0,7,1,185,9,0,0,7,1,13,128,0,0,89,36,1,0,0,88,113,6,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,28,5,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,4,89,28,5,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,68,10,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,4,88,184,10,0,0,35,13,128,1,0,34,13,128,1,0,7,1,108,10,0,0,7,1,13,128,0,0,89,36,1,0,0,88,113,6,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,7,1,28,5,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,4,89,28,5,0,0,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,0,0,113,5,0,0,38,0,0,0,26,4,128,206,64,35,4,128,3,0,34,4,128,3,0,7,1,17,11,0,0,7,1,4,128,0,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,113,4,15,0,38,0,0,0,113,4,1,0,113,5,5,0,38,0,0,0,15,113,4,22,0,38,0,0,0,15,9,9,9,3,254,0,254,3,254,8,8,8,8,2,254,9,9,9,9,254,11,11,11,9,254,8,10,10,10,3,254,84,254,85,20,9,10,10,19,254,11,11,8,84,254,20,20,20,20,254,3,20,20,20,20,32,254,4,4,4,4,2,254,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,7,1,206,11,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,231,11,0,0,7,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,7,1,0,12,0,0,7,1,13,128,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,90,58,0,0,255,255,255,255,255,10,255,255,255,255,255,10,0,6,0,10,6,0,0,0,0,90,58,0,0,255,255,255,255,255,14,255,255,255,255,255,14,0,6,0,14,6,0,0,0,0,90,113,4,13,0,38,0,0,0,58,0,0,255,255,255,255,255,18,255,255,255,255,255,18,0,6,0,18,6,0,0,0,0,90,42,119,0,89,36,1,0,0,90] as const;

export const STATS = { ops: 325, bytes: 3114, labels: 56, unknownOps: 0, unresolvedSymbols: 48 } as const;
