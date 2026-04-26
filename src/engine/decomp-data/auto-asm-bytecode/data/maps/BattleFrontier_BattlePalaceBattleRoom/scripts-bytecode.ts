// AUTO-GENERATED from data/maps/BattleFrontier_BattlePalaceBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=333, bytes=1644, labels=54, unknownOps=20, unresolvedSymbols=60

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePalaceBattleRoom_MapScripts": 0,
  "BattleFrontier_BattlePalaceBattleRoom_OnTransition": 15,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfx": 29,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxMale": 50,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetPlayerGfxFemale": 58,
  "BattleFrontier_BattlePalaceBattleRoom_OnFrame": 66,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_EnterRoom": 74,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BeginChallenge": 171,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_NextOpponentEnter": 195,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyLost": 259,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedOpponent": 285,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponent": 434,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForOpponentNoRecord": 549,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRecordBattle": 554,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_RecordBattle": 568,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskPauseChallenge": 578,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskRetireChallenge": 586,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ContinueChallenge": 600,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyWon": 638,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_PauseChallenge": 664,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_MavenUpNext": 699,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMaven": 721,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_AskReadyForMavenNoRecord": 749,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenser": 754,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserSilver": 941,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserSilver": 969,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_IntroSpenserGold": 1140,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_BattleSpenserGold": 1191,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DefeatedSpenserGold": 1219,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_DoPalaceBattle": 1390,
  "BattleFrontier_BattlePalaceBattleRoom_OnWarp": 1452,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_SetUpRoomObjects": 1460,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor2ndOpponent": 1531,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor3rdOpponent": 1539,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor4thOpponent": 1547,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor5thOpponent": 1555,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor6thOpponent": 1563,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_ReadyFor7thOpponent": 1571,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SetInvisible": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerEnterRoom": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceRight": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceUp": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_PlayerReturnToChallenge": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentEnter": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_OpponentExit": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_FaceDown": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter1": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter2": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_UnusedOpponentEnter3": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobby": 1579,
  "BattleFrontier_BattlePalaceBattleRoom_EventScript_WarpToLobbyDoubles": 1619,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_DusclopsEnter": 1644,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_AzurillEnter": 1644,
  "BattleFrontier_BattlePalaceBattleRoom_Movement_SpenserEnter": 1644,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,66,0,0,0,4,172,5,0,0,113,4,5,0,38,0,0,0,88,29,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,113,17,100,0,113,16,100,0,113,17,105,0,113,16,105,0,0,0,0,0,74,0,0,0,89,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,178,1,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,82,0,0,83,0,0,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,82,0,0,83,0,0,0,0,113,4,5,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,110,5,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,89,43,6,0,0,88,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,35,13,128,6,0,34,13,128,6,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,112,20,6,104,1,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,89,178,1,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,105,89,195,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,89,43,6,0,0,104,0,0,0,0,0,0,0,113,4,7,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,112,20,6,104,1,88,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,100,0,0,15,0,1,0,86,0,0,87,0,0,0,0,90,0,0,0,0,88,0,0,13,0,1,0,100,0,0,13,0,1,0,80,0,0,108,6,0,0,81,0,0,108,6,0,0,0,0,80,0,0,108,6,0,0,81,0,0,108,6,0,0,0,0,80,0,0,108,6,0,0,81,0,0,108,6,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,110,5,0,0,35,13,128,1,0,34,13,128,1,0,89,3,1,0,0,113,4,6,0,38,0,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,126,2,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,110,5,0,0,35,13,128,1,0,34,13,128,1,0,89,3,1,0,0,113,4,6,0,38,0,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,126,2,0,0,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,4,0,113,5,0,0,38,0,0,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,0,0,0,0,180,5,0,0,90,0,0,0,0,88,29,0,0,0,113,0,1,0,80,255,0,43,6,0,0,81,255,0,43,6,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,90,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,7,0,5,7,0,0,0,0,90,58,0,0,255,255,255,255,255,19,255,255,255,255,255,19,0,7,0,19,7,0,0,0,0,90] as const;

export const STATS = { ops: 333, bytes: 1644, labels: 54, unknownOps: 20, unresolvedSymbols: 60 } as const;
