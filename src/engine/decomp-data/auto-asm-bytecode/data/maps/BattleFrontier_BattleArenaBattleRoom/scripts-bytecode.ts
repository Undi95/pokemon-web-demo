// AUTO-GENERATED from data/maps/BattleFrontier_BattleArenaBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=373, bytes=2827, labels=58, unknownOps=2, unresolvedSymbols=74

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleArenaBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleArenaBattleRoom_OnResume": 20,
  "BattleFrontier_BattleArenaBattleRoom_OnTransition": 25,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetPlayerGfx": 39,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetPlayerGfxMale": 61,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetPlayerGfxFemale": 66,
  "BattleFrontier_BattleArenaBattleRoom_OnFrame": 71,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_EnterRoom": 79,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AnnounceTrainers": 193,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DeclareOpponentWinner": 489,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_WarpToLobbyLost": 597,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DefeatedOpponent": 642,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForOpponent": 832,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForOpponentNoRecord": 1052,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskRecordBattle": 1142,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_RecordBattle": 1221,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskPauseChallenge": 1231,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskRetireChallenge": 1304,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ContinueChallenge": 1383,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReturnToLobbyWon": 1430,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor2ndOpponent": 1477,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor3rdOpponent": 1486,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor4thOpponent": 1495,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor5thOpponent": 1504,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor6thOpponent": 1513,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_ReadyFor7thOpponent": 1522,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_PauseChallenge": 1531,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_TycoonUpNext": 1566,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForTycoon": 1588,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_AskReadyForTycoonNoRecord": 1721,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_BattleGreta": 1811,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_BattleGretaSilver": 2192,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DefeatedGretaSilver": 2220,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_IntroGretaGold": 2308,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_BattleGretaGold": 2425,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DefeatedGretaGold": 2453,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_StartArenaBattle": 2541,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DoArenaBattle": 2555,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_DeclarePlayerWinner": 2618,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerEnter": 2725,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerStepForwardLong": 2727,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerStepForward": 2728,
  "BattleFrontier_BattleArenaBattleRoom_Movement_PlayerWalkBackToLine": 2730,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceLeft": 2734,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceRight": 2736,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentEnter": 2738,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentStepForwardLong": 2740,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentStepForward": 2741,
  "BattleFrontier_BattleArenaBattleRoom_Movement_GretaEnter": 2743,
  "BattleFrontier_BattleArenaBattleRoom_Movement_OpponentExit": 2749,
  "BattleFrontier_BattleArenaBattleRoom_Movement_JumpInPlaceDown": 2757,
  "BattleFrontier_BattleArenaBattleRoom_Movement_JumpInPlaceUp": 2760,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceDown": 2763,
  "BattleFrontier_BattleArenaBattleRoom_Movement_WalkInPlaceRight2": 2765,
  "BattleFrontier_BattleArenaBattleRoom_OnWarp": 2767,
  "BattleFrontier_BattleArenaBattleRoom_EventScript_SetUpRoomObjects": 2775,
  "BattleFrontier_BattleArenaBattleRoom_Movement_GretaLookAroundPlayer": 2814,
  "BattleFrontier_BattleArenaBattleRoom_Movement_GretaWalkBackToCenter": 2824,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,25,0,0,0,2,71,0,0,0,4,207,10,0,0,5,20,0,0,0,38,0,0,0,90,113,4,5,0,38,0,0,0,88,39,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,15,113,17,100,0,15,113,17,105,0,15,0,0,0,0,79,0,0,0,106,89,0,0,0,0,80,0,0,165,10,0,0,81,0,0,165,10,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,203,10,0,0,81,0,0,203,10,0,0,0,0,80,0,0,174,10,0,0,81,0,0,174,10,0,0,0,0,113,0,1,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,64,3,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,178,10,0,0,81,0,0,178,10,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,168,10,0,0,81,0,0,168,10,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,113,4,6,0,38,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,181,10,0,0,81,0,0,181,10,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,168,10,0,0,81,0,0,168,10,0,0,0,0,80,0,0,181,10,0,0,81,0,0,181,10,0,0,0,0,82,0,0,83,0,0,0,0,113,4,5,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,251,9,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,130,2,0,0,34,130,2,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,80,0,0,200,10,0,0,81,0,0,200,10,0,0,0,0,80,0,0,200,10,0,0,81,0,0,200,10,0,0,0,0,9,197,0,49,82,0,0,83,0,0,0,0,113,4,6,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,8,0,7,8,0,0,0,0,88,58,10,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,150,5,0,0,34,150,5,0,0,80,0,0,170,10,0,0,81,0,0,170,10,0,0,0,0,80,0,0,189,10,0,0,81,0,0,189,10,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,203,10,0,0,81,0,0,203,10,0,0,0,0,80,0,0,174,10,0,0,81,0,0,174,10,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,35,13,128,6,0,34,13,128,6,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,103,5,0,0,34,103,5,0,0,35,0,128,1,0,34,0,128,1,0,35,118,4,0,0,34,118,4,0,0,35,0,128,2,0,34,0,128,2,0,35,207,4,0,0,34,207,4,0,0,35,0,128,3,0,34,0,128,3,0,35,24,5,0,0,34,24,5,0,0,35,0,128,127,0,34,0,128,127,0,35,64,3,0,0,34,64,3,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,103,5,0,0,34,103,5,0,0,35,0,128,1,0,34,0,128,1,0,35,207,4,0,0,34,207,4,0,0,35,0,128,2,0,34,0,128,2,0,35,24,5,0,0,34,24,5,0,0,35,0,128,127,0,34,0,128,127,0,35,64,3,0,0,34,64,3,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,64,3,0,0,34,64,3,0,0,35,0,128,0,0,34,0,128,0,0,35,197,4,0,0,34,197,4,0,0,35,0,128,127,0,34,0,128,127,0,35,64,3,0,0,34,64,3,0,0,88,0,0,0,0,89,64,3,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,64,3,0,0,34,64,3,0,0,35,0,128,0,0,34,0,128,0,0,35,251,5,0,0,34,251,5,0,0,35,0,128,127,0,34,0,128,127,0,35,64,3,0,0,34,64,3,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,64,3,0,0,34,64,3,0,0,35,0,128,0,0,34,0,128,0,0,35,85,2,0,0,34,85,2,0,0,35,0,128,127,0,34,0,128,127,0,35,64,3,0,0,34,64,3,0,0,105,80,0,0,176,10,0,0,81,0,0,176,10,0,0,0,0,80,0,0,176,10,0,0,81,0,0,176,10,0,0,0,0,82,0,0,83,0,0,0,0,89,193,0,0,0,0,4,60,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,8,0,7,8,0,0,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,0,0,1,0,34,0,0,1,0,16,0,0,0,0,0,10,0,113,0,1,0,104,0,0,0,0,0,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,19,7,0,0,34,19,7,0,0,35,0,128,1,0,34,0,128,1,0,35,118,4,0,0,34,118,4,0,0,35,0,128,2,0,34,0,128,2,0,35,207,4,0,0,34,207,4,0,0,35,0,128,3,0,34,0,128,3,0,35,24,5,0,0,34,24,5,0,0,35,0,128,127,0,34,0,128,127,0,35,52,6,0,0,34,52,6,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,19,7,0,0,34,19,7,0,0,35,0,128,1,0,34,0,128,1,0,35,207,4,0,0,34,207,4,0,0,35,0,128,2,0,34,0,128,2,0,35,24,5,0,0,34,24,5,0,0,35,0,128,127,0,34,0,128,127,0,35,52,6,0,0,34,52,6,0,0,88,0,0,0,0,80,0,0,176,10,0,0,81,0,0,176,10,0,0,0,0,80,0,0,176,10,0,0,81,0,0,176,10,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,167,10,0,0,81,0,0,167,10,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,86,0,0,87,0,0,0,0,80,0,0,183,10,0,0,81,0,0,183,10,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,181,10,0,0,81,0,0,181,10,0,0,0,0,82,0,0,83,0,0,0,0,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,4,9,0,0,34,4,9,0,0,35,0,128,3,0,34,0,128,3,0,35,144,8,0,0,34,144,8,0,0,35,0,128,4,0,34,0,128,4,0,35,121,9,0,0,34,121,9,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,254,10,0,0,81,0,0,254,10,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,8,11,0,0,81,0,0,8,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,88,237,9,0,0,35,13,128,1,0,34,13,128,1,0,89,233,1,0,0,88,58,10,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,180,10,0,0,81,0,0,180,10,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,150,5,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,254,10,0,0,81,0,0,254,10,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,8,11,0,0,81,0,0,8,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,88,237,9,0,0,35,13,128,1,0,34,13,128,1,0,89,233,1,0,0,88,58,10,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,80,0,0,180,10,0,0,81,0,0,180,10,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,150,5,0,0,16,0,0,0,0,0,10,0,88,251,9,0,0,15,105,113,0,0,0,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,5,0,113,5,0,0,38,0,0,0,113,4,18,0,38,0,0,0,38,0,0,0,113,4,21,0,38,0,0,0,15,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,80,0,0,197,10,0,0,81,0,0,197,10,0,0,0,0,80,0,0,200,10,0,0,81,0,0,200,10,0,0,0,0,80,0,0,200,10,0,0,81,0,0,200,10,0,0,0,0,9,20,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,88,0,0,0,0,15,11,11,11,11,254,10,10,40,254,38,254,40,254,10,10,10,10,254,23,23,23,23,23,254,11,11,11,11,11,11,11,254,81,70,254,81,71,254,37,254,40,254,0,0,0,0,215,10,0,0,90,0,0,0,0,84,0,0,85,0,0,0,0,88,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,113,0,1,0,90,8,39,20,20,20,20,9,9,39,254,8,39,254] as const;

export const STATS = { ops: 373, bytes: 2827, labels: 58, unknownOps: 2, unresolvedSymbols: 74 } as const;
