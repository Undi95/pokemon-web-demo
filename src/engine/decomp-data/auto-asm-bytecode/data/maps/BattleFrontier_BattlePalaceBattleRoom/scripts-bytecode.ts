// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=333, bytes=3044, labels=54, unknownOps=0, unresolvedSymbols=58

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePalaceBattleRoom_MapScripts": 0,
  "BattleFrontier_BattlePalaceBattleRoom_OnTransition": 15,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfx": 29,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxMale": 75,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxFemale": 84,
  "BattleFrontier_BattlePalaceBattleRoom_OnFrame": 93,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_EnterRoom": 101,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BeginChallenge": 210,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_NextOpponentEnter": 234,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyLost": 335,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedOpponent": 361,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponent": 547,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponentNoRecord": 923,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRecordBattle": 1061,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_RecordBattle": 1176,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskPauseChallenge": 1186,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRetireChallenge": 1295,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ContinueChallenge": 1410,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyWon": 1448,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_PauseChallenge": 1474,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_MavenUpNext": 1509,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMaven": 1543,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMavenNoRecord": 1748,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenser": 1886,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserSilver": 2186,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserSilver": 2226,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_IntroSpenserGold": 2409,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserGold": 2472,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserGold": 2512,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DoPalaceBattle": 2695,
  "BattleFrontier_BattlePalaceBattleRoom_OnWarp": 2758,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetUpRoomObjects": 2766,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor2ndOpponent": 2837,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor3rdOpponent": 2846,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor4thOpponent": 2855,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor5thOpponent": 2864,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor6thOpponent": 2873,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor7thOpponent": 2882,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SetInvisible": 2891,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerEnterRoom": 2893,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceRight": 2898,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceUp": 2900,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerReturnToChallenge": 2902,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentEnter": 2908,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentExit": 2914,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceDown": 2919,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter1": 2921,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter2": 2926,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter3": 2929,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobby": 2934,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyDoubles": 2986,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_DusclopsEnter": 3011,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_AzurillEnter": 3019,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SpenserEnter": 3030,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,93,0,0,0,4,198,10,0,0,113,4,5,0,38,0,0,0,88,29,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,7,1,75,0,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,84,0,0,0,7,1,13,128,0,0,15,113,17,100,0,113,16,100,0,15,113,17,105,0,113,16,105,0,15,0,0,0,0,101,0,0,0,89,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,210,0,0,0,7,1,13,128,0,0,80,0,0,86,11,0,0,81,0,0,86,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,103,11,0,0,81,0,0,103,11,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,35,2,0,0,80,0,0,77,11,0,0,81,0,0,77,11,0,0,0,0,82,0,0,83,0,0,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,92,11,0,0,81,0,0,92,11,0,0,0,0,82,0,0,83,0,0,0,0,113,4,5,0,38,0,0,0,16,0,0,0,0,0,10,4,0,0,0,88,135,10,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,105,1,0,0,34,105,1,0,0,7,1,0,0,0,0,7,1,105,1,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,89,118,11,0,0,88,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,168,5,0,0,34,168,5,0,0,7,1,0,0,0,0,7,1,168,5,0,0,80,0,0,98,11,0,0,81,0,0,98,11,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,84,11,0,0,81,0,0,84,11,0,0,0,0,80,0,0,103,11,0,0,81,0,0,103,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,7,5,229,5,0,0,7,5,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,21,11,0,0,8,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,8,1,30,11,0,0,8,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,8,1,39,11,0,0,8,1,13,128,0,0,35,13,128,4,0,34,13,128,4,0,8,1,48,11,0,0,8,1,13,128,0,0,35,13,128,5,0,34,13,128,5,0,8,1,57,11,0,0,8,1,13,128,0,0,35,13,128,6,0,34,13,128,6,0,8,1,66,11,0,0,8,1,13,128,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,155,3,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,130,5,0,0,34,130,5,0,0,7,1,0,0,0,0,7,1,130,5,0,0,35,0,128,1,0,34,0,128,1,0,35,37,4,0,0,34,37,4,0,0,7,1,0,0,0,0,7,1,37,4,0,0,35,0,128,2,0,34,0,128,2,0,35,162,4,0,0,34,162,4,0,0,7,1,0,0,0,0,7,1,162,4,0,0,35,0,128,3,0,34,0,128,3,0,35,15,5,0,0,34,15,5,0,0,7,1,0,0,0,0,7,1,15,5,0,0,35,0,128,127,0,34,0,128,127,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,130,5,0,0,34,130,5,0,0,7,1,0,0,0,0,7,1,130,5,0,0,35,0,128,1,0,34,0,128,1,0,35,162,4,0,0,34,162,4,0,0,7,1,0,0,0,0,7,1,162,4,0,0,35,0,128,2,0,34,0,128,2,0,35,15,5,0,0,34,15,5,0,0,7,1,0,0,0,0,7,1,15,5,0,0,35,0,128,127,0,34,0,128,127,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,35,0,128,0,0,34,0,128,0,0,35,152,4,0,0,34,152,4,0,0,7,1,0,0,0,0,7,1,152,4,0,0,35,0,128,127,0,34,0,128,127,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,88,0,0,0,0,89,35,2,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,35,0,128,1,0,34,0,128,1,0,35,194,5,0,0,34,194,5,0,0,7,1,0,0,0,0,7,1,194,5,0,0,35,0,128,127,0,34,0,128,127,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,35,0,128,0,0,34,0,128,0,0,35,79,1,0,0,34,79,1,0,0,7,1,0,0,0,0,7,1,79,1,0,0,35,0,128,127,0,34,0,128,127,0,35,35,2,0,0,34,35,2,0,0,7,1,0,0,0,0,7,1,35,2,0,0,80,0,0,82,11,0,0,81,0,0,82,11,0,0,0,0,80,0,0,82,11,0,0,81,0,0,82,11,0,0,0,0,105,89,234,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,89,118,11,0,0,104,0,0,0,0,0,0,0,113,4,7,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,0,0,1,0,34,0,0,1,0,7,1,7,6,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,212,6,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,94,7,0,0,34,94,7,0,0,7,1,0,0,0,0,7,1,94,7,0,0,35,0,128,1,0,34,0,128,1,0,35,37,4,0,0,34,37,4,0,0,7,1,0,0,0,0,7,1,37,4,0,0,35,0,128,2,0,34,0,128,2,0,35,162,4,0,0,34,162,4,0,0,7,1,0,0,0,0,7,1,162,4,0,0,35,0,128,3,0,34,0,128,3,0,35,15,5,0,0,34,15,5,0,0,7,1,0,0,0,0,7,1,15,5,0,0,35,0,128,127,0,34,0,128,127,0,35,7,6,0,0,34,7,6,0,0,7,1,0,0,0,0,7,1,7,6,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,94,7,0,0,34,94,7,0,0,7,1,0,0,0,0,7,1,94,7,0,0,35,0,128,1,0,34,0,128,1,0,35,162,4,0,0,34,162,4,0,0,7,1,0,0,0,0,7,1,162,4,0,0,35,0,128,2,0,34,0,128,2,0,35,15,5,0,0,34,15,5,0,0,7,1,0,0,0,0,7,1,15,5,0,0,35,0,128,127,0,34,0,128,127,0,35,7,6,0,0,34,7,6,0,0,7,1,0,0,0,0,7,1,7,6,0,0,88,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,82,11,0,0,81,0,0,82,11,0,0,0,0,80,0,0,82,11,0,0,81,0,0,82,11,0,0,0,0,100,0,0,15,0,1,0,86,0,0,87,0,0,0,0,90,0,0,0,0,88,0,0,13,0,1,0,100,0,0,13,0,1,0,80,0,0,195,11,0,0,81,0,0,195,11,0,0,0,0,80,0,0,203,11,0,0,81,0,0,203,11,0,0,0,0,80,0,0,214,11,0,0,81,0,0,214,11,0,0,0,0,82,0,0,83,0,0,0,0,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,105,9,0,0,34,105,9,0,0,7,1,0,0,0,0,7,1,105,9,0,0,35,0,128,3,0,34,0,128,3,0,35,138,8,0,0,34,138,8,0,0,7,1,0,0,0,0,7,1,138,8,0,0,35,0,128,4,0,34,0,128,4,0,35,168,9,0,0,34,168,9,0,0,7,1,0,0,0,0,7,1,168,9,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,138,8,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,4,88,135,10,0,0,35,13,128,1,0,34,13,128,1,0,7,1,178,8,0,0,7,1,13,128,0,0,89,79,1,0,0,113,4,6,0,38,0,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,168,5,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,80,0,0,84,11,0,0,81,0,0,84,11,0,0,0,0,80,0,0,103,11,0,0,81,0,0,103,11,0,0,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,89,168,5,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,168,9,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,4,88,135,10,0,0,35,13,128,1,0,34,13,128,1,0,7,1,208,9,0,0,7,1,13,128,0,0,89,79,1,0,0,113,4,6,0,38,0,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,7,1,168,5,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,80,0,0,84,11,0,0,81,0,0,84,11,0,0,0,0,80,0,0,103,11,0,0,81,0,0,103,11,0,0,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,89,168,5,0,0,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,4,0,113,5,0,0,38,0,0,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,15,0,0,0,0,206,10,0,0,90,0,0,0,0,88,29,0,0,0,113,0,1,0,80,255,0,75,11,0,0,81,255,0,75,11,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,75,11,0,0,81,0,0,75,11,0,0,0,0,80,0,0,75,11,0,0,81,0,0,75,11,0,0,0,0,90,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,84,254,85,9,9,9,9,3,254,1,254,85,9,9,9,9,254,8,8,8,8,2,254,9,9,9,9,254,0,254,85,4,4,2,254,85,4,254,4,4,4,2,254,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,7,1,170,11,0,0,7,1,13,128,0,0,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,7,0,5,7,0,0,0,0,90,58,0,0,255,255,255,255,255,19,255,255,255,255,255,19,0,7,0,19,7,0,0,0,0,90,20,20,85,8,11,8,39,254,85,21,24,21,21,21,21,21,39,20,254,20,20,20,20,20,20,20,85,4,4,4,4,2,254] as const;

export const STATS = { ops: 333, bytes: 3044, labels: 54, unknownOps: 0, unresolvedSymbols: 58 } as const;
