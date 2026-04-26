// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=333, bytes=2420, labels=54, unknownOps=2, unresolvedSymbols=62

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePalaceBattleRoom_MapScripts": 0,
  "BattleFrontier_BattlePalaceBattleRoom_OnTransition": 15,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfx": 29,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxMale": 51,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxFemale": 60,
  "BattleFrontier_BattlePalaceBattleRoom_OnFrame": 69,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_EnterRoom": 77,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BeginChallenge": 174,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_NextOpponentEnter": 198,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyLost": 287,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedOpponent": 313,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponent": 487,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponentNoRecord": 707,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRecordBattle": 797,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_RecordBattle": 876,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskPauseChallenge": 886,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRetireChallenge": 959,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ContinueChallenge": 1038,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyWon": 1076,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_PauseChallenge": 1102,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_MavenUpNext": 1137,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMaven": 1159,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMavenNoRecord": 1292,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenser": 1382,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserSilver": 1634,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserSilver": 1662,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_IntroSpenserGold": 1833,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserGold": 1884,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserGold": 1912,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DoPalaceBattle": 2083,
  "BattleFrontier_BattlePalaceBattleRoom_OnWarp": 2146,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetUpRoomObjects": 2154,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor2ndOpponent": 2225,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor3rdOpponent": 2234,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor4thOpponent": 2243,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor5thOpponent": 2252,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor6thOpponent": 2261,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor7thOpponent": 2270,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SetInvisible": 2279,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerEnterRoom": 2281,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceRight": 2286,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceUp": 2288,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerReturnToChallenge": 2290,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentEnter": 2296,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentExit": 2302,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceDown": 2307,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter1": 2309,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter2": 2314,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter3": 2317,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobby": 2322,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyDoubles": 2362,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_DusclopsEnter": 2387,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_AzurillEnter": 2395,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SpenserEnter": 2406,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,69,0,0,0,4,98,8,0,0,113,4,5,0,38,0,0,0,88,29,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,15,113,17,100,0,113,16,100,0,15,113,17,105,0,113,16,105,0,15,0,0,0,0,77,0,0,0,89,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,242,8,0,0,81,0,0,242,8,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,3,9,0,0,81,0,0,3,9,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,231,1,0,0,80,0,0,233,8,0,0,81,0,0,233,8,0,0,0,0,82,0,0,83,0,0,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,248,8,0,0,81,0,0,248,8,0,0,0,0,82,0,0,83,0,0,0,0,113,4,5,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,35,8,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,57,1,0,0,34,57,1,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,89,18,9,0,0,88,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,52,4,0,0,34,52,4,0,0,80,0,0,254,8,0,0,81,0,0,254,8,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,240,8,0,0,81,0,0,240,8,0,0,0,0,80,0,0,3,9,0,0,81,0,0,3,9,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,35,13,128,6,0,34,13,128,6,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,14,4,0,0,34,14,4,0,0,35,0,128,1,0,34,0,128,1,0,35,29,3,0,0,34,29,3,0,0,35,0,128,2,0,34,0,128,2,0,35,118,3,0,0,34,118,3,0,0,35,0,128,3,0,34,0,128,3,0,35,191,3,0,0,34,191,3,0,0,35,0,128,127,0,34,0,128,127,0,35,231,1,0,0,34,231,1,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,14,4,0,0,34,14,4,0,0,35,0,128,1,0,34,0,128,1,0,35,118,3,0,0,34,118,3,0,0,35,0,128,2,0,34,0,128,2,0,35,191,3,0,0,34,191,3,0,0,35,0,128,127,0,34,0,128,127,0,35,231,1,0,0,34,231,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,231,1,0,0,34,231,1,0,0,35,0,128,0,0,34,0,128,0,0,35,108,3,0,0,34,108,3,0,0,35,0,128,127,0,34,0,128,127,0,35,231,1,0,0,34,231,1,0,0,88,0,0,0,0,89,231,1,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,231,1,0,0,34,231,1,0,0,35,0,128,0,0,34,0,128,0,0,35,78,4,0,0,34,78,4,0,0,35,0,128,127,0,34,0,128,127,0,35,231,1,0,0,34,231,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,231,1,0,0,34,231,1,0,0,35,0,128,0,0,34,0,128,0,0,35,31,1,0,0,34,31,1,0,0,35,0,128,127,0,34,0,128,127,0,35,231,1,0,0,34,231,1,0,0,80,0,0,238,8,0,0,81,0,0,238,8,0,0,0,0,80,0,0,238,8,0,0,81,0,0,238,8,0,0,0,0,105,89,198,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,89,18,9,0,0,104,0,0,0,0,0,0,0,113,4,7,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,102,5,0,0,34,102,5,0,0,35,0,128,1,0,34,0,128,1,0,35,29,3,0,0,34,29,3,0,0,35,0,128,2,0,34,0,128,2,0,35,118,3,0,0,34,118,3,0,0,35,0,128,3,0,34,0,128,3,0,35,191,3,0,0,34,191,3,0,0,35,0,128,127,0,34,0,128,127,0,35,135,4,0,0,34,135,4,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,102,5,0,0,34,102,5,0,0,35,0,128,1,0,34,0,128,1,0,35,118,3,0,0,34,118,3,0,0,35,0,128,2,0,34,0,128,2,0,35,191,3,0,0,34,191,3,0,0,35,0,128,127,0,34,0,128,127,0,35,135,4,0,0,34,135,4,0,0,88,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,238,8,0,0,81,0,0,238,8,0,0,0,0,80,0,0,238,8,0,0,81,0,0,238,8,0,0,0,0,100,0,0,15,0,1,0,86,0,0,87,0,0,0,0,90,0,0,0,0,88,0,0,13,0,1,0,100,0,0,13,0,1,0,80,0,0,83,9,0,0,81,0,0,83,9,0,0,0,0,80,0,0,91,9,0,0,81,0,0,91,9,0,0,0,0,80,0,0,102,9,0,0,81,0,0,102,9,0,0,0,0,82,0,0,83,0,0,0,0,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,41,7,0,0,34,41,7,0,0,35,0,128,3,0,34,0,128,3,0,35,98,6,0,0,34,98,6,0,0,35,0,128,4,0,34,0,128,4,0,35,92,7,0,0,34,92,7,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,35,8,0,0,35,13,128,1,0,34,13,128,1,0,89,31,1,0,0,113,4,6,0,38,0,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,80,0,0,240,8,0,0,81,0,0,240,8,0,0,0,0,80,0,0,3,9,0,0,81,0,0,3,9,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,52,4,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,35,8,0,0,35,13,128,1,0,34,13,128,1,0,89,31,1,0,0,113,4,6,0,38,0,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,80,0,0,240,8,0,0,81,0,0,240,8,0,0,0,0,80,0,0,3,9,0,0,81,0,0,3,9,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,52,4,0,0,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,4,0,113,5,0,0,38,0,0,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,15,0,0,0,0,106,8,0,0,90,0,0,0,0,88,29,0,0,0,113,0,1,0,80,255,0,231,8,0,0,81,255,0,231,8,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,231,8,0,0,81,0,0,231,8,0,0,0,0,80,0,0,231,8,0,0,81,0,0,231,8,0,0,0,0,90,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,84,254,85,9,9,9,9,3,254,1,254,85,9,9,9,9,254,8,8,8,8,2,254,9,9,9,9,254,0,254,85,4,4,2,254,85,4,254,4,4,4,2,254,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,7,0,5,7,0,0,0,0,90,58,0,0,255,255,255,255,255,19,255,255,255,255,255,19,0,7,0,19,7,0,0,0,0,90,20,20,85,8,11,8,39,254,85,21,24,21,21,21,21,21,39,20,254,20,20,20,20,20,20,20,85,4,4,4,4,2,254] as const;

export const STATS = { ops: 333, bytes: 2420, labels: 54, unknownOps: 2, unresolvedSymbols: 62 } as const;
