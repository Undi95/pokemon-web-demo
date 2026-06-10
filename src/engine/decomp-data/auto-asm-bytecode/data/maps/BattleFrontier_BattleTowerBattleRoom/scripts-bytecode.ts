// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=325, bytes=3150, labels=56, unknownOps=0, unresolvedSymbols=43

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SetUpObjects": 18,
  "BattleFrontier_BattleTowerBattleRoom_OnFrame": 40,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EnterRoom": 48,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_OpponentEnter": 195,
  "BattleFrontier_BattleTower_EventScript_WarpToLobbyLost": 301,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedOpponent": 358,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponent": 536,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponentNoRecord": 788,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRecordBattle": 926,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RecordBattle": 1039,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskPauseChallenge": 1049,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRetireChallenge": 1158,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ContinueChallenge": 1271,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyWon": 1325,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_PauseChallenge": 1382,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyForOpponent": 1418,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor2ndOpponent": 1620,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor3rdOpponent": 1627,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor4thOpponent": 1634,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor5thOpponent": 1641,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor6thOpponent": 1648,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor7thOpponent": 1655,
  "BattleFrontier_EventScript_IncrementWinStreak": 1662,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SecondAttendantEnter": 1672,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_MaidenUpNext": 1836,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaiden": 1871,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaidenNoRecord": 2074,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabel": 2212,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelSilver": 2467,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelSilver": 2507,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AnabelGoldIntro": 2583,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelGold": 2651,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelGold": 2691,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DoTowerBattle": 2767,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EndTowerBattle": 2864,
  "BattleFrontier_EventScript_SetBrainObjectGfx": 2888,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerEnter": 2898,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceAttendant": 2903,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceBattle": 2905,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentEnter": 2907,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentExit": 2913,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantApproachPlayer": 2918,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantReturnToPos": 2923,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SetInvisible": 2929,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantEnter": 2931,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantExit": 2938,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantDelay": 2943,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantFaceSecondAttendant": 2948,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AnabelEnter": 2955,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobby": 2961,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyDoubles": 3057,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyMultis": 3082,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyLinkMultis": 3107,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RetireChallenge": 3141,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,40,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,80,0,0,113,11,0,0,81,0,0,113,11,0,0,0,0,3,0,0,0,0,48,0,0,0,23,0,0,1,0,80,255,0,82,11,0,0,81,255,0,82,11,0,0,0,0,82,0,0,83,0,0,0,0,23,4,128,1,0,23,5,128,2,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,195,0,0,0,7,1,13,128,0,0,80,0,0,102,11,0,0,81,0,0,102,11,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,87,11,0,0,81,255,0,87,11,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,1,0,23,4,128,2,0,23,5,128,6,0,26,6,128,1,0,23,6,128,1,0,38,0,0,58,6,24,2,0,0,23,4,128,3,0,38,0,0,58,86,0,0,87,0,0,0,0,80,0,0,91,11,0,0,81,0,0,91,11,0,0,0,0,82,0,0,83,0,0,0,0,23,4,128,7,0,23,5,128,0,0,38,0,0,58,16,0,0,0,0,0,10,4,103,5,207,10,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,102,1,0,0,34,102,1,0,0,7,1,0,0,0,0,7,1,102,1,0,0,23,4,128,2,0,23,5,128,0,0,26,6,128,4,0,23,6,128,4,0,38,0,0,58,23,4,128,2,0,23,5,128,3,0,23,6,128,255,255,38,0,0,58,23,4,128,3,0,38,0,0,58,6,145,11,0,0,5,126,6,0,0,23,4,128,4,0,38,0,0,58,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,45,5,0,0,34,45,5,0,0,7,1,0,0,0,0,7,1,45,5,0,0,80,0,0,97,11,0,0,81,0,0,97,11,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,23,4,128,9,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,8,5,136,6,0,0,8,5,13,128,0,0,80,0,0,102,11,0,0,81,0,0,102,11,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,87,11,0,0,81,255,0,87,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,50,112,1,51,38,0,0,58,23,4,128,9,0,38,0,0,58,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,7,5,44,7,0,0,7,5,13,128,0,0,23,4,128,1,0,23,5,128,2,0,38,0,0,58,5,138,5,0,0,5,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,20,3,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,247,4,0,0,34,247,4,0,0,7,1,0,0,0,0,7,1,247,4,0,0,35,0,128,1,0,34,0,128,1,0,35,158,3,0,0,34,158,3,0,0,7,1,0,0,0,0,7,1,158,3,0,0,35,0,128,2,0,34,0,128,2,0,35,25,4,0,0,34,25,4,0,0,7,1,0,0,0,0,7,1,25,4,0,0,35,0,128,3,0,34,0,128,3,0,35,134,4,0,0,34,134,4,0,0,7,1,0,0,0,0,7,1,134,4,0,0,35,0,128,127,0,34,0,128,127,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,247,4,0,0,34,247,4,0,0,7,1,0,0,0,0,7,1,247,4,0,0,35,0,128,1,0,34,0,128,1,0,35,25,4,0,0,34,25,4,0,0,7,1,0,0,0,0,7,1,25,4,0,0,35,0,128,2,0,34,0,128,2,0,35,134,4,0,0,34,134,4,0,0,7,1,0,0,0,0,7,1,134,4,0,0,35,0,128,127,0,34,0,128,127,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,35,0,128,0,0,34,0,128,0,0,35,15,4,0,0,34,15,4,0,0,7,1,0,0,0,0,7,1,15,4,0,0,35,0,128,127,0,34,0,128,127,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,5,0,0,0,0,6,24,2,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,35,0,128,1,0,34,0,128,1,0,35,102,5,0,0,34,102,5,0,0,7,1,0,0,0,0,7,1,102,5,0,0,35,0,128,127,0,34,0,128,127,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,35,0,128,0,0,34,0,128,0,0,35,69,12,0,0,34,69,12,0,0,7,1,0,0,0,0,7,1,69,12,0,0,35,0,128,127,0,34,0,128,127,0,35,24,2,0,0,34,24,2,0,0,7,1,0,0,0,0,7,1,24,2,0,0,105,80,255,0,89,11,0,0,81,255,0,89,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,107,11,0,0,81,0,0,107,11,0,0,0,0,82,0,0,83,0,0,0,0,6,195,0,0,0,23,4,128,2,0,23,5,128,0,0,26,6,128,3,0,23,6,128,3,0,38,0,0,58,23,4,128,2,0,23,5,128,3,0,23,6,128,255,255,38,0,0,58,23,4,128,3,0,38,0,0,58,6,145,11,0,0,104,0,0,0,0,103,23,4,128,6,0,23,5,128,2,0,38,0,0,58,48,55,0,49,152,1,23,4,128,4,0,38,0,0,58,3,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,84,6,0,0,34,84,6,0,0,7,1,0,0,0,0,7,1,84,6,0,0,35,0,128,2,0,34,0,128,2,0,35,91,6,0,0,34,91,6,0,0,7,1,0,0,0,0,7,1,91,6,0,0,35,0,128,3,0,34,0,128,3,0,35,98,6,0,0,34,98,6,0,0,7,1,0,0,0,0,7,1,98,6,0,0,35,0,128,4,0,34,0,128,4,0,35,105,6,0,0,34,105,6,0,0,7,1,0,0,0,0,7,1,105,6,0,0,35,0,128,5,0,34,0,128,5,0,35,112,6,0,0,34,112,6,0,0,7,1,0,0,0,0,7,1,112,6,0,0,35,0,128,6,0,34,0,128,6,0,35,119,6,0,0,34,119,6,0,0,7,1,0,0,0,0,7,1,119,6,0,0,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,23,4,128,17,0,38,0,0,58,4,80,0,0,115,11,0,0,81,0,0,115,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,127,11,0,0,81,0,0,127,11,0,0,0,0,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,122,11,0,0,81,0,0,122,11,0,0,0,0,82,0,0,83,0,0,0,0,4,35,0,0,1,0,34,0,0,1,0,7,1,79,7,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,1,0,104,0,0,0,0,103,5,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,26,8,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,164,8,0,0,34,164,8,0,0,7,1,0,0,0,0,7,1,164,8,0,0,35,0,128,1,0,34,0,128,1,0,35,158,3,0,0,34,158,3,0,0,7,1,0,0,0,0,7,1,158,3,0,0,35,0,128,2,0,34,0,128,2,0,35,25,4,0,0,34,25,4,0,0,7,1,0,0,0,0,7,1,25,4,0,0,35,0,128,3,0,34,0,128,3,0,35,134,4,0,0,34,134,4,0,0,7,1,0,0,0,0,7,1,134,4,0,0,35,0,128,127,0,34,0,128,127,0,35,79,7,0,0,34,79,7,0,0,7,1,0,0,0,0,7,1,79,7,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,164,8,0,0,34,164,8,0,0,7,1,0,0,0,0,7,1,164,8,0,0,35,0,128,1,0,34,0,128,1,0,35,25,4,0,0,34,25,4,0,0,7,1,0,0,0,0,7,1,25,4,0,0,35,0,128,2,0,34,0,128,2,0,35,134,4,0,0,34,134,4,0,0,7,1,0,0,0,0,7,1,134,4,0,0,35,0,128,127,0,34,0,128,127,0,35,79,7,0,0,34,79,7,0,0,7,1,0,0,0,0,7,1,79,7,0,0,5,72,11,0,0,105,80,255,0,89,11,0,0,81,255,0,89,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,107,11,0,0,81,0,0,107,11,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,139,11,0,0,81,0,0,139,11,0,0,0,0,82,0,0,83,0,0,0,0,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,23,10,0,0,34,23,10,0,0,7,1,0,0,0,0,7,1,23,10,0,0,35,0,128,3,0,34,0,128,3,0,35,163,9,0,0,34,163,9,0,0,7,1,0,0,0,0,7,1,163,9,0,0,35,0,128,4,0,34,0,128,4,0,35,91,10,0,0,34,91,10,0,0,7,1,0,0,0,0,7,1,91,10,0,0,23,4,128,1,0,23,5,128,7,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,163,9,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,23,4,128,2,0,23,5,128,7,0,26,6,128,255,255,23,6,128,255,255,38,0,0,58,16,0,0,0,0,0,10,4,5,207,10,0,0,35,13,128,1,0,34,13,128,1,0,7,1,203,9,0,0,7,1,13,128,0,0,6,45,1,0,0,5,126,6,0,0,23,4,128,12,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,45,5,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,103,51,23,4,128,13,0,38,0,0,58,16,0,0,0,0,0,10,4,6,45,5,0,0,23,4,128,1,0,23,5,128,7,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,91,10,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,23,4,128,2,0,23,5,128,7,0,26,6,128,255,255,23,6,128,255,255,38,0,0,58,16,0,0,0,0,0,10,4,5,207,10,0,0,35,13,128,1,0,34,13,128,1,0,7,1,131,10,0,0,7,1,13,128,0,0,6,45,1,0,0,5,126,6,0,0,23,4,128,12,0,38,0,0,58,35,13,128,2,0,34,13,128,2,0,7,1,45,5,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,103,51,23,4,128,13,0,38,0,0,58,16,0,0,0,0,0,10,4,6,45,5,0,0,105,23,0,0,0,0,23,4,128,2,0,23,5,128,6,0,26,6,128,0,0,23,6,128,0,0,38,0,0,58,38,0,0,58,23,4,128,0,0,23,5,128,0,0,38,0,0,58,26,4,128,206,64,35,4,128,3,0,34,4,128,3,0,7,1,48,11,0,0,7,1,4,128,0,0,23,4,128,18,0,38,0,0,58,38,0,0,58,23,4,128,21,0,38,0,0,58,23,4,128,15,0,38,0,0,58,23,4,128,1,0,23,5,128,5,0,38,0,0,58,4,23,4,128,22,0,38,0,0,58,4,9,9,9,3,254,0,254,3,254,8,8,8,8,2,254,9,9,9,9,254,11,11,11,9,254,8,10,10,10,3,254,84,254,85,20,9,10,10,19,254,11,11,8,84,254,20,20,20,20,254,3,20,20,20,20,32,254,4,4,4,4,2,254,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,7,1,241,11,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,10,12,0,0,7,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,7,1,35,12,0,0,7,1,13,128,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,58,3,58,0,0,255,255,255,255,255,10,255,255,255,255,255,10,0,6,0,10,6,0,0,0,58,3,58,0,0,255,255,255,255,255,14,255,255,255,255,255,14,0,6,0,14,6,0,0,0,58,3,23,4,128,13,0,38,0,0,58,58,0,0,255,255,255,255,255,18,255,255,255,255,255,18,0,6,0,18,6,0,0,0,58,3,42,119,0,6,45,1,0,0,3] as const;

export const STATS = { ops: 325, bytes: 3150, labels: 56, unknownOps: 0, unresolvedSymbols: 43 } as const;
