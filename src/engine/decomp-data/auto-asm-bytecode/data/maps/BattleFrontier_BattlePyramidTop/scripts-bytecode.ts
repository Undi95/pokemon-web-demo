// AUTO-GENERATED from data/maps/BattleFrontier_BattlePyramidTop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=160, bytes=1314, labels=29, unknownOps=0, unresolvedSymbols=40

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePyramidTop_MapScripts": 0,
  "BattleFrontier_BattlePyramidTop_OnTransition": 20,
  "BattleFrontier_BattlePyramidTop_OnWarp": 45,
  "BattleFrontier_BattlePyramidTop_EventScript_SetUpObjects": 53,
  "BattleFrontier_BattlePyramidTop_EventScript_EndSetUpObjects": 90,
  "BattleFrontier_BattlePyramidTop_OnResume": 91,
  "BattleFrontier_BattlePyramidTop_EventScript_CheckChallengeStatus": 126,
  "BattleFrontier_BattlePyramidTop_OnFrame": 319,
  "BattleFrontier_BattlePyramidTop_EventScript_PlayPyramidMusic": 335,
  "BattleFrontier_BattlePyramidTop_EventScript_ShowMapName": 344,
  "BattleFrontier_BattlePyramidTop_EventScript_ReadyChallenge": 353,
  "BattleFrontier_BattlePyramidTop_EventScript_Attendant": 415,
  "BattleFrontier_BattlePyramidTop_EventScript_WarpToLobbyWon": 555,
  "BattleFrontier_BattlePyramidTop_EventScript_StepForwardWhenReady": 601,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHereMoveAside": 611,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandon": 641,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHeardSilverSpeech": 873,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandonSilver": 897,
  "BattleFrontier_BattlePyramidTop_EventScript_DefeatedBrandonSilver": 941,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonIntroGold": 1012,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHeardGoldSpeech": 1142,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandonGold": 1166,
  "BattleFrontier_BattlePyramidTop_EventScript_DefeatedBrandonGold": 1210,
  "BattleFrontier_BattlePyramidTop_EventScript_DoBrandonBattle": 1281,
  "BattleFrontier_BattlePyramidTop_Movement_AttendantMoveAside": 1295,
  "BattleFrontier_BattlePyramidTop_Movement_AttendantBlockPath": 1298,
  "BattleFrontier_BattlePyramidTop_Movement_PlayerClimbToTop": 1301,
  "BattleFrontier_BattlePyramidTop_Movement_BrandonApproachPlayer": 1308,
  "BattleFrontier_BattlePyramidTop_Movement_CameraPanUp": 1310,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,91,0,0,0,2,63,1,0,0,3,20,0,0,0,4,45,0,0,0,113,4,13,0,113,5,200,0,113,6,0,0,113,7,255,255,38,0,0,0,113,0,1,0,90,0,0,0,0,53,0,0,0,113,0,1,0,92,255,0,2,35,0,0,0,0,34,0,0,0,0,7,5,90,0,0,0,7,5,0,0,0,0,100,0,0,0,0,0,0,90,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,126,0,0,0,7,1,13,128,0,0,88,0,0,0,0,26,0,0,13,128,113,4,0,0,38,0,0,0,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,97,1,0,0,34,97,1,0,0,7,1,0,0,0,0,7,1,97,1,0,0,35,0,128,1,0,34,0,128,1,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,35,0,128,2,0,34,0,128,2,0,35,97,1,0,0,34,97,1,0,0,7,1,0,0,0,0,7,1,97,1,0,0,113,4,1,0,113,5,5,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,7,1,0,0,0,0,7,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,7,1,0,0,0,0,7,1,13,128,0,0,35,13,128,9,0,34,13,128,9,0,7,1,0,0,0,0,7,1,13,128,0,0,90,0,0,0,0,79,1,0,0,0,0,1,0,88,1,0,0,52,206,1,0,113,0,1,0,90,38,0,0,0,113,0,0,0,90,113,4,3,0,113,5,1,0,38,0,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,9,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,113,0,1,0,90,107,91,35,0,0,0,0,34,0,0,0,0,7,5,89,2,0,0,7,5,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,99,2,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,15,5,0,0,81,0,0,15,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,21,5,0,0,81,255,0,21,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,18,5,0,0,81,0,0,18,5,0,0,0,0,82,0,0,83,0,0,0,0,104,0,0,0,0,0,0,0,50,203,1,51,105,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,13,0,7,13,0,0,0,0,90,16,0,0,0,0,0,10,4,105,90,16,0,0,0,0,0,10,4,80,0,0,15,5,0,0,81,0,0,15,5,0,0,0,0,113,0,1,0,105,90,106,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,244,3,0,0,34,244,3,0,0,7,1,0,0,0,0,7,1,244,3,0,0,35,0,128,3,0,34,0,128,3,0,35,105,3,0,0,34,105,3,0,0,7,1,0,0,0,0,7,1,105,3,0,0,35,0,128,4,0,34,0,128,4,0,35,118,4,0,0,34,118,4,0,0,7,1,0,0,0,0,7,1,118,4,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,105,3,0,0,7,5,13,128,0,0,38,0,0,0,80,127,0,30,5,0,0,81,127,0,30,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,28,5,0,0,81,0,0,28,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,89,129,3,0,0,90,80,0,0,28,5,0,0,81,0,0,28,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,88,1,5,0,0,52,206,1,0,35,13,128,1,0,34,13,128,1,0,7,1,173,3,0,0,7,1,13,128,0,0,89,0,0,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,43,2,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,4,89,43,2,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,118,4,0,0,7,5,13,128,0,0,38,0,0,0,80,127,0,30,5,0,0,81,127,0,30,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,28,5,0,0,81,0,0,28,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,89,142,4,0,0,90,80,0,0,28,5,0,0,81,0,0,28,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,88,1,5,0,0,52,206,1,0,35,13,128,1,0,34,13,128,1,0,7,1,186,4,0,0,7,1,13,128,0,0,89,0,0,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,7,1,43,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,4,89,43,2,0,0,105,113,4,10,0,113,5,0,0,38,0,0,0,15,11,39,254,10,38,254,9,9,9,9,9,37,254,21,254,5,5,20,254] as const;

export const STATS = { ops: 160, bytes: 1314, labels: 29, unknownOps: 0, unresolvedSymbols: 40 } as const;
