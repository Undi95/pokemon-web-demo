// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=325, bytes=2466, labels=56, unknownOps=2, unresolvedSymbols=52

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerBattleRoom_OnWarp": 10,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SetUpObjects": 18,
  "BattleFrontier_BattleTowerBattleRoom_OnFrame": 39,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EnterRoom": 47,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_OpponentEnter": 175,
  "BattleFrontier_BattleTower_EventScript_WarpToLobbyLost": 268,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedOpponent": 318,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponent": 470,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForOpponentNoRecord": 635,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRecordBattle": 725,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RecordBattle": 804,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskPauseChallenge": 814,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskRetireChallenge": 887,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ContinueChallenge": 966,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyWon": 1020,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_PauseChallenge": 1070,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyForOpponent": 1105,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor2ndOpponent": 1235,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor3rdOpponent": 1244,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor4thOpponent": 1253,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor5thOpponent": 1262,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor6thOpponent": 1271,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_ReadyFor7thOpponent": 1280,
  "BattleFrontier_EventScript_IncrementWinStreak": 1289,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_SecondAttendantEnter": 1298,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_MaidenUpNext": 1462,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaiden": 1484,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AskReadyForMaidenNoRecord": 1617,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabel": 1707,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelSilver": 1909,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelSilver": 1937,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_AnabelGoldIntro": 2001,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_BattleAnabelGold": 2052,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DefeatedAnabelGold": 2080,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_DoTowerBattle": 2144,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_EndTowerBattle": 2221,
  "BattleFrontier_EventScript_SetBrainObjectGfx": 2242,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerEnter": 2251,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceAttendant": 2256,
  "BattleFrontier_BattleTowerBattleRoom_Movement_PlayerFaceBattle": 2258,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentEnter": 2260,
  "BattleFrontier_BattleTowerBattleRoom_Movement_OpponentExit": 2266,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantApproachPlayer": 2271,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantReturnToPos": 2276,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SetInvisible": 2282,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantEnter": 2284,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantExit": 2291,
  "BattleFrontier_BattleTowerBattleRoom_Movement_SecondAttendantDelay": 2296,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AttendantFaceSecondAttendant": 2301,
  "BattleFrontier_BattleTowerBattleRoom_Movement_AnabelEnter": 2308,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobby": 2314,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyDoubles": 2374,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyMultis": 2399,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_WarpToLobbyLinkMultis": 2424,
  "BattleFrontier_BattleTowerBattleRoom_EventScript_RetireChallenge": 2457,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,39,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,80,0,0,234,8,0,0,81,0,0,234,8,0,0,0,0,90,0,0,0,0,47,0,0,0,113,0,1,0,80,255,0,203,8,0,0,81,255,0,203,8,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,223,8,0,0,81,0,0,223,8,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,208,8,0,0,81,255,0,208,8,0,0,0,0,82,0,0,83,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,214,1,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,212,8,0,0,81,0,0,212,8,0,0,0,0,82,0,0,83,0,0,0,0,113,4,7,0,113,5,0,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,96,8,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,62,1,0,0,34,62,1,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,10,9,0,0,88,9,5,0,0,113,4,4,0,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,252,3,0,0,34,252,3,0,0,80,0,0,218,8,0,0,81,0,0,218,8,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,223,8,0,0,81,0,0,223,8,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,208,8,0,0,81,255,0,208,8,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,88,81,4,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,198,3,0,0,34,198,3,0,0,35,0,128,1,0,34,0,128,1,0,35,213,2,0,0,34,213,2,0,0,35,0,128,2,0,34,0,128,2,0,35,46,3,0,0,34,46,3,0,0,35,0,128,3,0,34,0,128,3,0,35,119,3,0,0,34,119,3,0,0,35,0,128,127,0,34,0,128,127,0,35,214,1,0,0,34,214,1,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,198,3,0,0,34,198,3,0,0,35,0,128,1,0,34,0,128,1,0,35,46,3,0,0,34,46,3,0,0,35,0,128,2,0,34,0,128,2,0,35,119,3,0,0,34,119,3,0,0,35,0,128,127,0,34,0,128,127,0,35,214,1,0,0,34,214,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,214,1,0,0,34,214,1,0,0,35,0,128,0,0,34,0,128,0,0,35,36,3,0,0,34,36,3,0,0,35,0,128,127,0,34,0,128,127,0,35,214,1,0,0,34,214,1,0,0,88,0,0,0,0,89,214,1,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,214,1,0,0,34,214,1,0,0,35,0,128,0,0,34,0,128,0,0,35,46,4,0,0,34,46,4,0,0,35,0,128,127,0,34,0,128,127,0,35,214,1,0,0,34,214,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,214,1,0,0,34,214,1,0,0,35,0,128,0,0,34,0,128,0,0,35,153,9,0,0,34,153,9,0,0,35,0,128,127,0,34,0,128,127,0,35,214,1,0,0,34,214,1,0,0,105,80,255,0,210,8,0,0,81,255,0,210,8,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,228,8,0,0,81,0,0,228,8,0,0,0,0,82,0,0,83,0,0,0,0,89,175,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,10,9,0,0,104,0,0,0,0,0,0,0,113,4,6,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,211,4,0,0,34,211,4,0,0,35,0,128,2,0,34,0,128,2,0,35,220,4,0,0,34,220,4,0,0,35,0,128,3,0,34,0,128,3,0,35,229,4,0,0,34,229,4,0,0,35,0,128,4,0,34,0,128,4,0,35,238,4,0,0,34,238,4,0,0,35,0,128,5,0,34,0,128,5,0,35,247,4,0,0,34,247,4,0,0,35,0,128,6,0,34,0,128,6,0,35,0,5,0,0,34,0,5,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,113,4,17,0,38,0,0,0,15,80,0,0,236,8,0,0,81,0,0,236,8,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,248,8,0,0,81,0,0,248,8,0,0,0,0,80,0,0,253,8,0,0,81,0,0,253,8,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,243,8,0,0,81,0,0,243,8,0,0,0,0,82,0,0,83,0,0,0,0,15,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,171,6,0,0,34,171,6,0,0,35,0,128,1,0,34,0,128,1,0,35,213,2,0,0,34,213,2,0,0,35,0,128,2,0,34,0,128,2,0,35,46,3,0,0,34,46,3,0,0,35,0,128,3,0,34,0,128,3,0,35,119,3,0,0,34,119,3,0,0,35,0,128,127,0,34,0,128,127,0,35,204,5,0,0,34,204,5,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,171,6,0,0,34,171,6,0,0,35,0,128,1,0,34,0,128,1,0,35,46,3,0,0,34,46,3,0,0,35,0,128,2,0,34,0,128,2,0,35,119,3,0,0,34,119,3,0,0,35,0,128,127,0,34,0,128,127,0,35,204,5,0,0,34,204,5,0,0,88,194,8,0,0,105,80,255,0,210,8,0,0,81,255,0,210,8,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,228,8,0,0,81,0,0,228,8,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,4,9,0,0,81,0,0,4,9,0,0,0,0,82,0,0,83,0,0,0,0,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,209,7,0,0,34,209,7,0,0,35,0,128,3,0,34,0,128,3,0,35,117,7,0,0,34,117,7,0,0,35,0,128,4,0,34,0,128,4,0,35,4,8,0,0,34,4,8,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,96,8,0,0,35,13,128,1,0,34,13,128,1,0,89,12,1,0,0,88,9,5,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,252,3,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,96,8,0,0,35,13,128,1,0,34,13,128,1,0,89,12,1,0,0,88,9,5,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,252,3,0,0,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,0,0,113,5,0,0,38,0,0,0,26,4,128,206,64,35,4,128,3,0,34,4,128,3,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,113,4,15,0,38,0,0,0,113,4,1,0,113,5,5,0,38,0,0,0,15,113,4,22,0,38,0,0,0,15,9,9,9,3,254,0,254,3,254,8,8,8,8,2,254,9,9,9,9,254,11,11,11,9,254,8,10,10,10,3,254,84,254,85,20,9,10,10,19,254,11,11,8,84,254,20,20,20,20,254,3,20,20,20,20,32,254,4,4,4,4,2,254,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,90,58,0,0,255,255,255,255,255,10,255,255,255,255,255,10,0,6,0,10,6,0,0,0,0,90,58,0,0,255,255,255,255,255,14,255,255,255,255,255,14,0,6,0,14,6,0,0,0,0,90,113,4,13,0,38,0,0,0,58,0,0,255,255,255,255,255,18,255,255,255,255,255,18,0,6,0,18,6,0,0,0,0,90,42,119,0,89,12,1,0,0,90] as const;

export const STATS = { ops: 325, bytes: 2466, labels: 56, unknownOps: 2, unresolvedSymbols: 52 } as const;
