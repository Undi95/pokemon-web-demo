// AUTO-GENERATED from data/maps/BattleFrontier_BattlePyramidTop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=160, bytes=936, labels=29, unknownOps=15, unresolvedSymbols=39

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePyramidTop_MapScripts": 0,
  "BattleFrontier_BattlePyramidTop_OnTransition": 20,
  "BattleFrontier_BattlePyramidTop_OnWarp": 45,
  "BattleFrontier_BattlePyramidTop_EventScript_SetUpObjects": 53,
  "BattleFrontier_BattlePyramidTop_EventScript_EndSetUpObjects": 78,
  "BattleFrontier_BattlePyramidTop_OnResume": 79,
  "BattleFrontier_BattlePyramidTop_EventScript_CheckChallengeStatus": 102,
  "BattleFrontier_BattlePyramidTop_OnFrame": 158,
  "BattleFrontier_BattlePyramidTop_EventScript_PlayPyramidMusic": 174,
  "BattleFrontier_BattlePyramidTop_EventScript_ShowMapName": 183,
  "BattleFrontier_BattlePyramidTop_EventScript_ReadyChallenge": 192,
  "BattleFrontier_BattlePyramidTop_EventScript_Attendant": 254,
  "BattleFrontier_BattlePyramidTop_EventScript_WarpToLobbyWon": 370,
  "BattleFrontier_BattlePyramidTop_EventScript_StepForwardWhenReady": 416,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHereMoveAside": 426,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandon": 456,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHeardSilverSpeech": 575,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandonSilver": 599,
  "BattleFrontier_BattlePyramidTop_EventScript_DefeatedBrandonSilver": 631,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonIntroGold": 690,
  "BattleFrontier_BattlePyramidTop_EventScript_BrandonHeardGoldSpeech": 808,
  "BattleFrontier_BattlePyramidTop_EventScript_BattleBrandonGold": 832,
  "BattleFrontier_BattlePyramidTop_EventScript_DefeatedBrandonGold": 864,
  "BattleFrontier_BattlePyramidTop_EventScript_DoBrandonBattle": 923,
  "BattleFrontier_BattlePyramidTop_Movement_AttendantMoveAside": 936,
  "BattleFrontier_BattlePyramidTop_Movement_AttendantBlockPath": 936,
  "BattleFrontier_BattlePyramidTop_Movement_PlayerClimbToTop": 936,
  "BattleFrontier_BattlePyramidTop_Movement_BrandonApproachPlayer": 936,
  "BattleFrontier_BattlePyramidTop_Movement_CameraPanUp": 936,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,79,0,0,0,2,158,0,0,0,3,20,0,0,0,4,45,0,0,0,113,4,13,0,113,5,200,0,113,6,0,0,113,7,255,255,38,0,0,0,113,0,1,0,90,0,0,0,0,53,0,0,0,113,0,1,0,92,255,0,2,35,0,0,0,0,34,0,0,0,0,100,0,0,0,0,0,0,90,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,26,0,0,13,128,113,4,0,0,38,0,0,0,113,4,1,0,113,5,5,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,35,13,128,9,0,34,13,128,9,0,90,0,0,0,0,174,0,0,0,0,0,1,0,183,0,0,0,52,206,1,0,113,0,1,0,90,38,0,0,0,113,0,0,0,90,113,4,3,0,113,5,1,0,38,0,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,9,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,113,0,1,0,90,107,91,35,0,0,0,0,34,0,0,0,0,35,0,0,0,0,34,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,168,3,0,0,81,0,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,168,3,0,0,81,255,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,168,3,0,0,81,0,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,104,0,0,0,0,0,0,0,50,203,1,51,105,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,13,0,7,13,0,0,0,0,90,16,0,0,0,0,0,10,0,105,90,16,0,0,0,0,0,10,0,80,0,0,168,3,0,0,81,0,0,168,3,0,0,0,0,113,0,1,0,105,90,106,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,80,127,0,168,3,0,0,81,127,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,168,3,0,0,81,0,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,87,2,0,0,90,80,0,0,168,3,0,0,81,0,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,88,155,3,0,0,52,206,1,0,35,13,128,1,0,34,13,128,1,0,89,0,0,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,114,1,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,80,127,0,168,3,0,0,81,127,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,80,0,0,168,3,0,0,81,0,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,64,3,0,0,90,80,0,0,168,3,0,0,81,0,0,168,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,88,155,3,0,0,52,206,1,0,35,13,128,1,0,34,13,128,1,0,89,0,0,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,114,1,0,0,105,113,4,10,0,113,5,0,0,38,0,0,0] as const;

export const STATS = { ops: 160, bytes: 936, labels: 29, unknownOps: 15, unresolvedSymbols: 39 } as const;
