// AUTO-GENERATED from data/maps/BattleFrontier_BattlePyramidFloor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=88, bytes=985, labels=19, unknownOps=0, unresolvedSymbols=63

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePyramidFloor_MapScripts": 0,
  "BattleFrontier_BattlePyramidFloor_OnFrame": 15,
  "BattleFrontier_BattlePyramidFloor_EventScript_UpdateLight": 39,
  "BattleFrontier_BattlePyramidFloor_EventScript_UpdateLightLoop": 65,
  "BattleFrontier_BattlePyramidFloor_EventScript_ShowMapName": 101,
  "BattleFrontier_BattlePyramidFloor_EventScript_PlayPyramidMusic": 111,
  "BattleFrontier_BattlePyramidFloor_OnResume": 121,
  "BattleFrontier_BattlePyramidFloor_EventScript_ResetParty": 405,
  "BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost": 415,
  "BattleFrontier_BattlePyramid_EventScript_WarpToLobby": 458,
  "BattleFrontier_BattlePyramidFloor_EventScript_ReadyChallenge": 520,
  "BattleFrontier_BattlePyramidFloor_OnTransition": 591,
  "BattleFrontier_BattlePyramidFloor_EventScript_SetLightRadius": 602,
  "BattlePyramid_WarpToNextFloor": 627,
  "BattlePyramid_WarpToTop": 760,
  "BattlePyramid_TrainerBattle": 785,
  "BattlePyramid_FindItemBall": 937,
  "BattlePyramid_FindItemBallEnd": 979,
  "BattlePyramid_Retire": 980,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,121,0,0,0,0,15,0,0,0,0,79,2,0,0,0,0,1,0,39,0,0,0,0,0,0,0,111,0,0,0,0,0,1,0,101,0,0,0,106,23,0,0,0,0,23,0,0,4,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,41,2,0,35,0,0,2,0,34,0,0,2,0,7,5,65,0,0,0,7,5,0,0,0,0,23,0,0,0,0,108,3,38,0,0,0,23,0,0,0,0,3,52,0,0,0,23,0,0,1,0,3,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,8,2,0,0,34,8,2,0,0,7,1,0,0,0,0,7,1,8,2,0,0,35,0,0,0,0,34,0,0,0,0,35,202,1,0,0,34,202,1,0,0,7,1,0,0,0,0,7,1,202,1,0,0,35,0,0,0,0,34,0,0,0,0,35,8,2,0,0,34,8,2,0,0,7,1,0,0,0,0,7,1,8,2,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,149,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,149,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,149,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,159,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,159,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,159,1,0,0,7,1,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,1,0,23,0,0,0,0,38,0,0,0,3,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,255,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,255,255,38,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,59,0,0,0,255,255,255,255,7,255,255,255,255,0,7,0,13,0,7,13,0,0,0,0,3,23,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,1,0,3,5,90,2,0,0,23,0,0,1,0,3,23,0,0,0,0,23,0,0,32,0,23,0,0,0,0,23,0,0,255,255,38,0,0,0,4,5,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,24,0,0,1,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,7,0,34,0,0,7,0,7,1,248,2,0,0,7,1,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,58,0,0,0,255,255,255,255,1,255,255,255,255,0,1,0,1,0,1,1,0,0,0,0,3,58,0,0,0,255,255,255,255,17,255,255,255,255,0,17,0,17,0,17,17,0,0,0,0,3,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,0,38,0,0,0,103,110,105,108,3,23,0,0,0,0,38,0,0,0,10,1,35,0,0,0,0,34,0,0,0,0,7,1,211,3,0,0,7,1,0,0,0,0,23,0,0,0,0,38,0,0,0,3,6,159,1,0,0] as const;

export const STATS = { ops: 88, bytes: 985, labels: 19, unknownOps: 0, unresolvedSymbols: 63 } as const;
