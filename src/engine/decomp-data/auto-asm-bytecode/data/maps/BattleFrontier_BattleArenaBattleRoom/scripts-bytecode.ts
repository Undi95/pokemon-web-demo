// AUTO-GENERATED from data/maps/BattleFrontier_BattleArenaBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=373, bytes=2070, labels=58, unknownOps=19, unresolvedSymbols=72

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleArenaBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleArenaBattleRoom_OnResume": 20,
  "BattleFrontier_BattleArenaBattleRoom_OnTransition": 25,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetPlayerGfx": 39,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetPlayerGfxMale": 60,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetPlayerGfxFemale": 64,
  "BattleFrontier_BattleArenaBattleRoom_OnFrame": 68,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_EnterRoom": 76,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AnnounceTrainers": 190,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DeclareOpponentWinner": 461,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_WarpToLobbyLost": 569,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DefeatedOpponent": 614,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForOpponent": 779,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForOpponentNoRecord": 894,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskRecordBattle": 899,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_RecordBattle": 913,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskPauseChallenge": 923,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskRetireChallenge": 931,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ContinueChallenge": 945,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReturnToLobbyWon": 992,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor2ndOpponent": 1039,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor3rdOpponent": 1047,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor4thOpponent": 1055,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor5thOpponent": 1063,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor6thOpponent": 1071,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor7thOpponent": 1079,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_PauseChallenge": 1087,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_TycoonUpNext": 1122,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForTycoon": 1144,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForTycoonNoRecord": 1172,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_BattleGreta": 1177,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_BattleGretaSilver": 1493,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DefeatedGretaSilver": 1521,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_IntroGretaGold": 1609,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_BattleGretaGold": 1726,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DefeatedGretaGold": 1754,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_StartArenaBattle": 1842,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DoArenaBattle": 1855,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DeclarePlayerWinner": 1917,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerEnter": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerStepForwardLong": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerStepForward": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerWalkBackToLine": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceLeft": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceRight": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentEnter": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentStepForwardLong": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentStepForward": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_GretaEnter": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentExit": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_JumpInPlaceDown": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_JumpInPlaceUp": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceDown": 2023,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceRight2": 2023,
  "BattleFrontier_BattleArenaBattleRoom_OnWarp": 2023,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetUpRoomObjects": 2031,
  "BattleFrontier_BattleArenaBattleRoom_Movement_GretaLookAroundPlayer": 2070,
  "BattleFrontier_BattleArenaBattleRoom_Movement_GretaWalkBackToCenter": 2070,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,25,0,0,0,2,68,0,0,0,4,231,7,0,0,5,20,0,0,0,38,0,0,0,90,113,4,5,0,38,0,0,0,88,39,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,113,17,100,0,113,17,105,0,0,0,0,0,76,0,0,0,106,89,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,11,3,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,113,4,6,0,38,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,113,4,5,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,63,7,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,9,197,0,49,82,0,0,83,0,0,0,0,113,4,6,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,8,0,7,8,0,0,0,0,88,125,7,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,35,13,128,6,0,34,13,128,6,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,112,20,6,104,1,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,89,11,3,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,105,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,89,190,0,0,0,0,4,60,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,8,0,7,8,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,112,20,6,104,1,88,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,86,0,0,87,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,22,8,0,0,81,0,0,22,8,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,22,8,0,0,81,0,0,22,8,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,88,50,7,0,0,35,13,128,1,0,34,13,128,1,0,89,205,1,0,0,88,125,7,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,224,3,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,22,8,0,0,81,0,0,22,8,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,22,8,0,0,81,0,0,22,8,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,88,50,7,0,0,35,13,128,1,0,34,13,128,1,0,89,205,1,0,0,88,125,7,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,224,3,0,0,16,0,0,0,0,0,10,0,88,63,7,0,0,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,80,0,0,231,7,0,0,81,0,0,231,7,0,0,0,0,9,20,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,88,0,0,0,0,0,0,0,0,239,7,0,0,90,0,0,0,0,84,0,0,85,0,0,0,0,88,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,113,0,1,0,90] as const;

export const STATS = { ops: 373, bytes: 2070, labels: 58, unknownOps: 19, unresolvedSymbols: 72 } as const;
