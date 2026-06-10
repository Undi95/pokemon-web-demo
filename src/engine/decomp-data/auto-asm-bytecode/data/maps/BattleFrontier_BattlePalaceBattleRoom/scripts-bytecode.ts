// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=333, bytes=3078, labels=54, unknownOps=0, unresolvedSymbols=121

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePalaceBattleRoom_MapScripts": 0,
  "BattleFrontier_BattlePalaceBattleRoom_OnTransition": 15,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfx": 30,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxMale": 76,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxFemale": 87,
  "BattleFrontier_BattlePalaceBattleRoom_OnFrame": 98,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_EnterRoom": 106,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BeginChallenge": 221,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_NextOpponentEnter": 245,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyLost": 346,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedOpponent": 375,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponent": 570,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponentNoRecord": 949,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRecordBattle": 1087,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_RecordBattle": 1200,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskPauseChallenge": 1210,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRetireChallenge": 1319,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ContinueChallenge": 1432,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyWon": 1470,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_PauseChallenge": 1499,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_MavenUpNext": 1535,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMaven": 1570,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMavenNoRecord": 1773,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenser": 1911,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserSilver": 2216,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserSilver": 2256,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_IntroSpenserGold": 2440,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserGold": 2508,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserGold": 2548,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DoPalaceBattle": 2732,
  "BattleFrontier_BattlePalaceBattleRoom_OnWarp": 2803,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetUpRoomObjects": 2811,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor2ndOpponent": 2883,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor3rdOpponent": 2890,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor4thOpponent": 2897,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor5thOpponent": 2904,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor6thOpponent": 2911,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor7thOpponent": 2918,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SetInvisible": 2925,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerEnterRoom": 2927,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceRight": 2932,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceUp": 2934,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerReturnToChallenge": 2936,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentEnter": 2942,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentExit": 2948,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceDown": 2953,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter1": 2955,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter2": 2960,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter3": 2963,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobby": 2968,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyDoubles": 3020,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_DusclopsEnter": 3045,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_AzurillEnter": 3053,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SpenserEnter": 3064,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,15,0,0,0,0,98,0,0,0,0,243,10,0,0,23,0,0,0,0,38,0,0,0,5,30,0,0,0,3,161,35,0,0,0,0,34,0,0,0,0,7,1,76,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,87,0,0,0,7,1,0,0,0,0,4,23,0,0,0,0,23,0,0,0,0,4,23,0,0,0,0,23,0,0,0,0,4,0,0,0,0,106,0,0,0,89,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,221,0,0,0,7,1,0,0,0,0,80,0,0,120,11,0,0,81,0,0,120,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,137,11,0,0,81,0,0,137,11,0,0,0,0,23,0,0,1,0,23,0,0,0,0,23,0,0,0,0,26,0,0,1,0,23,0,0,1,0,38,0,0,0,6,58,2,0,0,80,0,0,111,11,0,0,81,0,0,111,11,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,126,11,0,0,81,0,0,126,11,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,103,5,172,10,0,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,119,1,0,0,34,119,1,0,0,7,1,0,0,0,0,7,1,119,1,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,152,11,0,0,5,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,24,0,0,1,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,7,0,34,0,0,7,0,35,190,5,0,0,34,190,5,0,0,7,1,0,0,0,0,7,1,190,5,0,0,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,118,11,0,0,81,0,0,118,11,0,0,0,0,80,0,0,137,11,0,0,81,0,0,137,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,50,0,0,51,38,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,255,5,0,0,7,5,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,67,11,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,74,11,0,0,8,1,0,0,0,0,35,0,0,3,0,34,0,0,3,0,8,1,81,11,0,0,8,1,0,0,0,0,35,0,0,4,0,34,0,0,4,0,8,1,88,11,0,0,8,1,0,0,0,0,35,0,0,5,0,34,0,0,5,0,8,1,95,11,0,0,8,1,0,0,0,0,35,0,0,6,0,34,0,0,6,0,8,1,102,11,0,0,8,1,0,0,0,0,5,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,181,3,0,0,7,1,0,0,0,0,112,19,4,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,152,5,0,0,34,152,5,0,0,7,1,0,0,0,0,7,1,152,5,0,0,35,0,0,1,0,34,0,0,1,0,35,63,4,0,0,34,63,4,0,0,7,1,0,0,0,0,7,1,63,4,0,0,35,0,0,2,0,34,0,0,2,0,35,186,4,0,0,34,186,4,0,0,7,1,0,0,0,0,7,1,186,4,0,0,35,0,0,3,0,34,0,0,3,0,35,39,5,0,0,34,39,5,0,0,7,1,0,0,0,0,7,1,39,5,0,0,35,0,0,0,0,34,0,0,0,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,112,20,6,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,152,5,0,0,34,152,5,0,0,7,1,0,0,0,0,7,1,152,5,0,0,35,0,0,1,0,34,0,0,1,0,35,186,4,0,0,34,186,4,0,0,7,1,0,0,0,0,7,1,186,4,0,0,35,0,0,2,0,34,0,0,2,0,35,39,5,0,0,34,39,5,0,0,7,1,0,0,0,0,7,1,39,5,0,0,35,0,0,0,0,34,0,0,0,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,35,0,0,0,0,34,0,0,0,0,35,176,4,0,0,34,176,4,0,0,7,1,0,0,0,0,7,1,176,4,0,0,35,0,0,0,0,34,0,0,0,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,5,0,0,0,0,6,58,2,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,35,0,0,1,0,34,0,0,1,0,35,219,5,0,0,34,219,5,0,0,7,1,0,0,0,0,7,1,219,5,0,0,35,0,0,0,0,34,0,0,0,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,35,0,0,0,0,34,0,0,0,0,35,90,1,0,0,34,90,1,0,0,7,1,0,0,0,0,7,1,90,1,0,0,35,0,0,0,0,34,0,0,0,0,35,58,2,0,0,34,58,2,0,0,7,1,0,0,0,0,7,1,58,2,0,0,80,0,0,116,11,0,0,81,0,0,116,11,0,0,0,0,80,0,0,116,11,0,0,81,0,0,116,11,0,0,0,0,105,6,245,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,152,11,0,0,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,0,0,49,152,0,23,0,0,0,0,38,0,0,0,3,35,0,0,1,0,34,0,0,1,0,7,1,34,6,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,1,0,104,0,0,0,0,103,5,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,237,6,0,0,7,1,0,0,0,0,112,19,4,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,119,7,0,0,34,119,7,0,0,7,1,0,0,0,0,7,1,119,7,0,0,35,0,0,1,0,34,0,0,1,0,35,63,4,0,0,34,63,4,0,0,7,1,0,0,0,0,7,1,63,4,0,0,35,0,0,2,0,34,0,0,2,0,35,186,4,0,0,34,186,4,0,0,7,1,0,0,0,0,7,1,186,4,0,0,35,0,0,3,0,34,0,0,3,0,35,39,5,0,0,34,39,5,0,0,7,1,0,0,0,0,7,1,39,5,0,0,35,0,0,0,0,34,0,0,0,0,35,34,6,0,0,34,34,6,0,0,7,1,0,0,0,0,7,1,34,6,0,0,112,20,6,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,119,7,0,0,34,119,7,0,0,7,1,0,0,0,0,7,1,119,7,0,0,35,0,0,1,0,34,0,0,1,0,35,186,4,0,0,34,186,4,0,0,7,1,0,0,0,0,7,1,186,4,0,0,35,0,0,2,0,34,0,0,2,0,35,39,5,0,0,34,39,5,0,0,7,1,0,0,0,0,7,1,39,5,0,0,35,0,0,0,0,34,0,0,0,0,35,34,6,0,0,34,34,6,0,0,7,1,0,0,0,0,7,1,34,6,0,0,5,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,116,11,0,0,81,0,0,116,11,0,0,0,0,80,0,0,116,11,0,0,81,0,0,116,11,0,0,0,0,100,0,0,15,0,1,0,86,0,0,87,0,0,0,0,90,0,0,0,0,88,0,0,13,0,1,0,100,0,0,13,0,1,0,80,0,0,229,11,0,0,81,0,0,229,11,0,0,0,0,80,0,0,237,11,0,0,81,0,0,237,11,0,0,0,0,80,0,0,248,11,0,0,81,0,0,248,11,0,0,0,0,82,0,0,83,0,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,136,9,0,0,34,136,9,0,0,7,1,0,0,0,0,7,1,136,9,0,0,35,0,0,0,0,34,0,0,0,0,35,168,8,0,0,34,168,8,0,0,7,1,0,0,0,0,7,1,168,8,0,0,35,0,0,0,0,34,0,0,0,0,35,204,9,0,0,34,204,9,0,0,7,1,0,0,0,0,7,1,204,9,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,168,8,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,16,0,0,0,0,0,10,4,5,172,10,0,0,35,0,0,1,0,34,0,0,1,0,7,1,208,8,0,0,7,1,0,0,0,0,6,90,1,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,190,5,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,118,11,0,0,81,0,0,118,11,0,0,0,0,80,0,0,137,11,0,0,81,0,0,137,11,0,0,0,0,16,0,0,0,0,0,10,4,50,0,0,104,0,0,0,0,103,51,23,0,0,0,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,6,190,5,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,204,9,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,16,0,0,0,0,0,10,4,5,172,10,0,0,35,0,0,1,0,34,0,0,1,0,7,1,244,9,0,0,7,1,0,0,0,0,6,90,1,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,2,0,34,0,0,2,0,7,1,190,5,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,118,11,0,0,81,0,0,118,11,0,0,0,0,80,0,0,137,11,0,0,81,0,0,137,11,0,0,0,0,16,0,0,0,0,0,10,4,50,0,0,104,0,0,0,0,103,51,23,0,0,0,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,6,190,5,0,0,105,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,4,0,0,0,0,251,10,0,0,90,0,0,0,0,5,30,0,0,0,23,0,0,1,0,80,0,0,109,11,0,0,81,0,0,109,11,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,109,11,0,0,81,0,0,109,11,0,0,0,0,80,0,0,109,11,0,0,81,0,0,109,11,0,0,0,0,3,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,204,11,0,0,7,1,0,0,0,0,58,0,0,0,255,255,255,255,5,255,255,255,255,0,5,0,7,0,5,7,0,0,0,0,3,58,0,0,0,255,255,255,255,19,255,255,255,255,0,19,0,7,0,19,7,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 333, bytes: 3078, labels: 54, unknownOps: 0, unresolvedSymbols: 121 } as const;
