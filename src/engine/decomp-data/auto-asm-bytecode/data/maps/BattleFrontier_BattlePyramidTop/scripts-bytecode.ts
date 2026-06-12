// AUTO-GENERATED from data/maps/BattleFrontier_BattlePyramidTop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=160, bytes=1349, labels=29, unknownOps=0, unresolvedSymbols=35

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePyramidTop_MapScripts": 0,
  "BattleFrontier_BattlePyramidTop_OnTransition": 20,
  "BattleFrontier_BattlePyramidTop_OnWarp": 50,
  "BattleFrontier_BattlePyramidTop_EventScript_SetUpObjects": 58,
  "BattleFrontier_BattlePyramidTop_EventScript_EndSetUpObjects": 96,
  "BattleFrontier_BattlePyramidTop_OnResume": 97,
  "BattleFrontier_BattlePyramidTop_EventScript_CheckChallengeStatus": 133,
  "BattleFrontier_BattlePyramidTop_OnFrame": 329,
  "BattleFrontier_BattlePyramidTop_EventScript_PlayPyramidMusic": 345,
  "BattleFrontier_BattlePyramidTop_EventScript_ShowMapName": 355,
  "BattleFrontier_BattlePyramidTop_EventScript_ReadyChallenge": 365,
  "BattleFrontier_BattlePyramidTop_EventScript_Attendant": 436,
  "BattleFrontier_BattlePyramidTop_EventScript_WarpToLobbyWon": 574,
  "BattleFrontier_BattlePyramidTop_EventScript_StepForwardWhenReady": 623,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHereMoveAside": 633,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandon": 664,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHeardSilverSpeech": 901,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandonSilver": 925,
  "BattleFrontier_BattlePyramidTop_EventScript_DefeatedBrandonSilver": 969,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonIntroGold": 1040,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHeardGoldSpeech": 1175,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandonGold": 1199,
  "BattleFrontier_BattlePyramidTop_EventScript_DefeatedBrandonGold": 1243,
  "BattleFrontier_BattlePyramidTop_EventScript_DoBrandonBattle": 1314,
  "BattleFrontier_BattlePyramidTop_Movement_AttendantMoveAside": 1330,
  "BattleFrontier_BattlePyramidTop_Movement_AttendantBlockPath": 1333,
  "BattleFrontier_BattlePyramidTop_Movement_PlayerClimbToTop": 1336,
  "BattleFrontier_BattlePyramidTop_Movement_BrandonApproachPlayer": 1343,
  "BattleFrontier_BattlePyramidTop_Movement_CameraPanUp": 1345,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,97,0,0,0,2,73,1,0,0,3,20,0,0,0,4,50,0,0,0,23,4,128,13,0,23,5,128,200,0,23,6,128,0,0,23,7,128,255,255,38,0,0,58,23,0,0,1,0,3,0,0,0,0,58,0,0,0,23,0,0,1,0,92,255,0,2,35,0,0,0,0,34,0,0,0,0,7,5,96,0,0,0,7,5,0,0,0,0,100,0,0,0,0,0,0,3,23,4,128,9,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,133,0,0,0,7,1,13,128,0,0,5,0,0,0,0,26,0,0,13,128,23,4,128,0,0,38,0,0,58,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,109,1,0,0,34,109,1,0,0,7,1,0,0,0,0,7,1,109,1,0,0,35,0,128,1,0,34,0,128,1,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,35,0,128,2,0,34,0,128,2,0,35,109,1,0,0,34,109,1,0,0,7,1,0,0,0,0,7,1,109,1,0,0,23,4,128,1,0,23,5,128,5,0,38,0,0,58,35,13,128,2,0,34,13,128,2,0,7,1,0,0,0,0,7,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,7,1,0,0,0,0,7,1,13,128,0,0,35,13,128,9,0,34,13,128,9,0,7,1,0,0,0,0,7,1,13,128,0,0,3,0,0,0,0,89,1,0,0,0,0,1,0,99,1,0,0,52,206,1,0,23,0,0,1,0,3,38,0,0,58,23,0,0,0,0,3,23,4,128,3,0,23,5,128,1,0,38,0,0,58,38,0,0,58,23,4,128,2,0,23,5,128,0,0,26,6,128,0,0,23,6,128,0,0,38,0,0,58,23,4,128,9,0,38,0,0,58,23,4,128,3,0,23,5,128,3,0,38,0,0,58,23,0,0,1,0,3,107,91,35,0,0,0,0,34,0,0,0,0,7,5,111,2,0,0,7,5,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,121,2,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,50,5,0,0,81,0,0,50,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,56,5,0,0,81,255,0,56,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,53,5,0,0,81,0,0,53,5,0,0,0,0,82,0,0,83,0,0,0,0,104,0,0,0,0,103,50,203,1,51,105,23,4,128,2,0,23,5,128,0,0,26,6,128,3,0,23,6,128,3,0,38,0,0,58,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,13,0,7,13,0,0,0,58,3,16,0,0,0,0,0,10,4,105,3,16,0,0,0,0,0,10,4,80,0,0,50,5,0,0,81,0,0,50,5,0,0,0,0,23,0,0,1,0,105,3,106,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,16,4,0,0,34,16,4,0,0,7,1,0,0,0,0,7,1,16,4,0,0,35,0,128,3,0,34,0,128,3,0,35,133,3,0,0,34,133,3,0,0,7,1,0,0,0,0,7,1,133,3,0,0,35,0,128,4,0,34,0,128,4,0,35,151,4,0,0,34,151,4,0,0,7,1,0,0,0,0,7,1,151,4,0,0,23,4,128,1,0,23,5,128,7,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,133,3,0,0,7,5,13,128,0,0,38,0,0,58,80,127,0,65,5,0,0,81,127,0,65,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,23,4,128,2,0,23,5,128,7,0,26,6,128,255,255,23,6,128,255,255,38,0,0,58,80,0,0,63,5,0,0,81,0,0,63,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,6,157,3,0,0,3,80,0,0,63,5,0,0,81,0,0,63,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,5,34,5,0,0,52,206,1,0,35,13,128,1,0,34,13,128,1,0,7,1,201,3,0,0,7,1,13,128,0,0,6,0,0,0,0,23,4,128,12,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,62,2,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,103,51,23,4,128,13,0,38,0,0,58,16,0,0,0,0,0,10,4,6,62,2,0,0,23,4,128,1,0,23,5,128,7,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,151,4,0,0,7,5,13,128,0,0,38,0,0,58,80,127,0,65,5,0,0,81,127,0,65,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,23,4,128,2,0,23,5,128,7,0,26,6,128,255,255,23,6,128,255,255,38,0,0,58,80,0,0,63,5,0,0,81,0,0,63,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,6,175,4,0,0,3,80,0,0,63,5,0,0,81,0,0,63,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,5,34,5,0,0,52,206,1,0,35,13,128,1,0,34,13,128,1,0,7,1,219,4,0,0,7,1,13,128,0,0,6,0,0,0,0,23,4,128,12,0,38,0,0,58,35,13,128,2,0,34,13,128,2,0,7,1,62,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,103,51,23,4,128,13,0,38,0,0,58,16,0,0,0,0,0,10,4,6,62,2,0,0,105,23,4,128,10,0,23,5,128,0,0,38,0,0,58,4,11,39,254,10,38,254,9,9,9,9,9,37,254,21,254,5,5,20,254] as const;

export const STATS = { ops: 160, bytes: 1349, labels: 29, unknownOps: 0, unresolvedSymbols: 35 } as const;
