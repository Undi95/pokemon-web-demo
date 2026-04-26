// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=325, bytes=1578, labels=56, unknownOps=19, unresolvedSymbols=50

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SetUpObjects": 18,
  "BattleFrontier_BattleTowerBattleRoom_OnFrame": 39,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EnterRoom": 47,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_OpponentEnter": 175,
  "BattleFrontier_BattleTower_EventScript_WarpToLobbyLost": 243,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedOpponent": 293,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponent": 420,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponentNoRecord": 480,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRecordBattle": 485,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RecordBattle": 499,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskPauseChallenge": 509,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRetireChallenge": 517,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ContinueChallenge": 531,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyWon": 585,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_PauseChallenge": 635,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyForOpponent": 670,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor2ndOpponent": 675,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor3rdOpponent": 683,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor4thOpponent": 691,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor5thOpponent": 699,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor6thOpponent": 707,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor7thOpponent": 715,
  "BattleFrontier_EventScript_IncrementWinStreak": 723,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SecondAttendantEnter": 731,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_MaidenUpNext": 894,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaiden": 916,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaidenNoRecord": 944,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabel": 949,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelSilver": 1086,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelSilver": 1114,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AnabelGoldIntro": 1178,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelGold": 1229,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelGold": 1257,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DoTowerBattle": 1321,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EndTowerBattle": 1398,
  "BattleFrontier_EventScript_SetBrainObjectGfx": 1418,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerEnter": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceAttendant": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceBattle": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentEnter": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentExit": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantApproachPlayer": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantReturnToPos": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SetInvisible": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantEnter": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantExit": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantDelay": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantFaceSecondAttendant": 1426,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AnabelEnter": 1426,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobby": 1426,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyDoubles": 1486,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyMultis": 1511,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyLinkMultis": 1536,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RetireChallenge": 1569,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,39,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,90,0,0,0,0,47,0,0,0,113,0,1,0,80,255,0,146,5,0,0,81,255,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,146,5,0,0,81,255,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,164,1,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,113,4,7,0,113,5,0,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,41,5,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,146,5,0,0,88,211,2,0,0,113,4,4,0,38,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,146,5,0,0,81,255,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,88,158,2,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,112,20,6,104,1,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,89,164,1,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,105,80,255,0,146,5,0,0,81,255,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,89,175,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,146,5,0,0,104,0,0,0,0,0,0,0,113,4,6,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,26,0,0,13,128,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,113,4,17,0,38,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,112,20,6,104,1,88,138,5,0,0,105,80,255,0,146,5,0,0,81,255,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,146,5,0,0,81,0,0,146,5,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,41,5,0,0,35,13,128,1,0,34,13,128,1,0,89,243,0,0,0,88,211,2,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,73,2,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,41,5,0,0,35,13,128,1,0,34,13,128,1,0,89,243,0,0,0,88,211,2,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,73,2,0,0,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,0,0,113,5,0,0,38,0,0,0,26,4,128,206,64,35,4,128,3,0,34,4,128,3,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,113,4,15,0,38,0,0,0,113,4,1,0,113,5,5,0,38,0,0,0,113,4,22,0,38,0,0,0,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,90,58,0,0,255,255,255,255,255,10,255,255,255,255,255,10,0,6,0,10,6,0,0,0,0,90,58,0,0,255,255,255,255,255,14,255,255,255,255,255,14,0,6,0,14,6,0,0,0,0,90,113,4,13,0,38,0,0,0,58,0,0,255,255,255,255,255,18,255,255,255,255,255,18,0,6,0,18,6,0,0,0,0,90,42,119,0,89,243,0,0,0,90] as const;

export const STATS = { ops: 325, bytes: 1578, labels: 56, unknownOps: 19, unresolvedSymbols: 50 } as const;
