// AUTO-GENERATED from data/maps/BattleFrontier_BattlePyramidFloor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=88, bytes=930, labels=19, unknownOps=0, unresolvedSymbols=21

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePyramidFloor_MapScripts": 0,
  "BattleFrontier_BattlePyramidFloor_OnFrame": 15,
  "BattleFrontier_BattlePyramidFloor_EventScript_UpdateLight": 39,
  "BattleFrontier_BattlePyramidFloor_EventScript_UpdateLightLoop": 60,
  "BattleFrontier_BattlePyramidFloor_EventScript_ShowMapName": 94,
  "BattleFrontier_BattlePyramidFloor_EventScript_PlayPyramidMusic": 103,
  "BattleFrontier_BattlePyramidFloor_OnResume": 112,
  "BattleFrontier_BattlePyramidFloor_EventScript_ResetParty": 389,
  "BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost": 398,
  "BattleFrontier_BattlePyramid_EventScript_WarpToLobby": 435,
  "BattleFrontier_BattlePyramidFloor_EventScript_ReadyChallenge": 492,
  "BattleFrontier_BattlePyramidFloor_OnTransition": 554,
  "BattleFrontier_BattlePyramidFloor_EventScript_SetLightRadius": 564,
  "BattlePyramid_WarpToNextFloor": 585,
  "BattlePyramid_WarpToTop": 706,
  "BattlePyramid_TrainerBattle": 731,
  "BattlePyramid_FindItemBall": 884,
  "BattlePyramid_FindItemBallEnd": 924,
  "BattlePyramid_Retire": 925,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,112,0,0,0,2,15,0,0,0,3,42,2,0,0,0,0,1,0,39,0,0,0,0,0,0,0,103,0,0,0,0,0,1,0,94,0,0,0,106,113,4,13,0,113,5,4,0,113,6,1,0,113,7,55,0,113,13,0,0,38,0,0,0,4,2,35,13,128,2,0,34,13,128,2,0,7,5,60,0,0,0,7,5,13,128,0,0,113,0,0,0,108,90,38,0,0,0,113,0,0,0,90,52,205,1,0,113,0,1,0,90,113,4,15,0,38,0,0,0,113,4,0,0,38,0,0,0,26,0,128,0,0,35,0,128,0,0,34,0,128,0,0,35,236,1,0,0,34,236,1,0,0,7,1,0,0,0,0,7,1,236,1,0,0,35,0,128,1,0,34,0,128,1,0,35,179,1,0,0,34,179,1,0,0,7,1,0,0,0,0,7,1,179,1,0,0,35,0,128,2,0,34,0,128,2,0,35,236,1,0,0,34,236,1,0,0,7,1,0,0,0,0,7,1,236,1,0,0,113,4,1,0,113,5,5,0,38,0,0,0,35,13,128,4,0,34,13,128,4,0,7,1,133,1,0,0,7,1,13,128,0,0,35,13,128,5,0,34,13,128,5,0,7,1,133,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,133,1,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,142,1,0,0,7,1,13,128,0,0,35,13,128,3,0,34,13,128,3,0,7,1,142,1,0,0,7,1,13,128,0,0,35,13,128,9,0,34,13,128,9,0,7,1,142,1,0,0,7,1,13,128,0,0,113,4,14,0,113,5,0,0,38,0,0,0,113,0,1,0,113,4,17,0,38,0,0,0,90,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,113,4,2,0,113,5,7,0,113,6,255,0,38,0,0,0,113,4,13,0,113,5,0,0,113,6,0,0,113,7,255,255,38,0,0,0,113,4,14,0,38,0,0,0,38,0,0,0,59,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,13,0,7,13,0,0,0,0,90,113,4,3,0,113,5,1,0,38,0,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,9,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,113,0,1,0,90,88,52,2,0,0,113,0,1,0,90,113,4,13,0,113,5,32,0,113,6,0,0,113,7,255,255,38,0,0,0,15,88,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,35,13,128,7,0,34,13,128,7,0,7,1,194,2,0,0,7,1,13,128,0,0,113,4,6,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,13,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,1,0,1,1,0,0,0,0,90,58,0,0,255,255,255,255,255,17,255,255,255,255,255,17,0,17,0,17,17,0,0,0,0,90,93,9,238,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,113,4,10,0,38,0,0,0,0,0,0,110,105,108,90,113,4,7,0,38,0,0,0,10,1,35,7,128,0,0,34,7,128,0,0,7,1,156,3,0,0,7,1,7,128,0,0,113,4,8,0,38,0,0,0,90,89,142,1,0,0] as const;

export const STATS = { ops: 88, bytes: 930, labels: 19, unknownOps: 0, unresolvedSymbols: 21 } as const;
