// AUTO-GENERATED from data/maps/SouthernIsland_Interior/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=106, bytes=579, labels=19, unknownOps=0, unresolvedSymbols=13

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SouthernIsland_Interior_MapScripts": 0,
  "SouthernIsland_Interior_OnResume": 10,
  "SouthernIsland_Interior_EventScript_TryRemoveLati": 20,
  "SouthernIsland_Interior_OnTransition": 57,
  "SouthernIsland_Interior_EventScript_SetUpLatios": 107,
  "SouthernIsland_Interior_EventScript_SetUpLatias": 118,
  "SouthernIsland_Interior_EventScript_SetUpPlayerGfx": 129,
  "SouthernIsland_Interior_EventScript_SetBrendanGfx": 175,
  "SouthernIsland_Interior_EventScript_SetMayGfx": 181,
  "SouthernIsland_Interior_EventScript_TryLatiEncounter": 187,
  "SouthernIsland_Interior_EventScript_Lati": 199,
  "SouthernIsland_Interior_EventScript_LatiDefeated": 476,
  "SouthernIsland_Interior_EventScript_RanFromLati": 490,
  "SouthernIsland_Interior_EventScript_Sign": 501,
  "SouthernIsland_Interior_EventScript_SetLatiosBattleVars": 511,
  "SouthernIsland_Interior_EventScript_SetLatiasBattleVars": 531,
  "SouthernIsland_Interior_Movement_CameraPanUp": 551,
  "SouthernIsland_Interior_Movement_CameraPanDown": 555,
  "SouthernIsland_Interior_Movement_LatiApproach": 567,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,10,0,0,0,3,57,0,0,0,44,0,0,8,1,20,0,0,0,3,39,13,128,0,0,58,35,13,128,7,0,34,13,128,7,0,7,5,0,0,0,0,7,5,13,128,0,0,84,0,0,85,0,0,0,0,4,35,213,64,0,0,34,213,64,0,0,8,1,107,0,0,0,8,1,213,64,0,0,35,213,64,0,0,34,213,64,0,0,8,5,118,0,0,0,8,5,213,64,0,0,5,129,0,0,0,3,23,17,64,188,0,23,0,0,152,1,4,23,17,64,187,0,23,0,0,151,1,4,161,35,13,128,0,0,34,13,128,0,0,7,1,175,0,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,181,0,0,0,7,1,13,128,0,0,3,23,16,64,100,0,4,23,16,64,105,0,4,106,23,8,128,12,0,6,199,0,0,0,3,44,0,0,7,1,245,1,0,0,44,200,1,7,1,245,1,0,0,44,201,1,7,1,245,1,0,0,44,0,0,7,0,245,1,0,0,42,206,0,42,0,0,38,0,0,58,80,127,0,39,2,0,0,81,127,0,39,2,0,0,0,0,82,0,0,83,0,0,0,0,41,50,0,49,162,0,0,0,0,41,30,0,198,86,0,0,87,0,0,0,0,41,30,0,80,127,0,43,2,0,0,81,127,0,43,2,0,0,0,0,80,0,0,55,2,0,0,81,0,0,55,2,0,0,0,0,82,0,0,83,0,0,0,0,41,50,0,38,0,0,58,23,15,128,0,0,35,213,64,0,0,34,213,64,0,0,8,1,255,1,0,0,8,1,213,64,0,0,35,213,64,0,0,34,213,64,0,0,8,5,19,2,0,0,8,5,213,64,0,0,42,0,0,38,0,0,58,43,0,0,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,220,1,0,0,7,1,13,128,0,0,35,13,128,4,0,34,13,128,4,0,7,1,234,1,0,0,7,1,13,128,0,0,35,13,128,5,0,34,13,128,5,0,7,1,234,1,0,0,7,1,13,128,0,0,42,201,1,108,3,42,200,1,26,4,128,0,0,6,0,0,0,0,3,26,4,128,0,0,6,0,0,0,0,3,16,0,0,0,0,0,10,4,108,3,23,4,128,152,1,23,5,128,50,0,23,6,128,191,0,38,0,0,58,4,23,4,128,151,1,23,5,128,50,0,23,6,128,191,0,38,0,0,58,4,9,9,9,254,20,20,20,20,20,20,20,8,8,8,38,254,8,8,8,8,8,20,20,8,8,8,8,254] as const;

export const STATS = { ops: 106, bytes: 579, labels: 19, unknownOps: 0, unresolvedSymbols: 13 } as const;
