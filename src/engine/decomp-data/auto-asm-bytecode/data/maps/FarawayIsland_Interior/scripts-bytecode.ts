// AUTO-GENERATED from data/maps/FarawayIsland_Interior/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=134, bytes=772, labels=24, unknownOps=0, unresolvedSymbols=14

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FarawayIsland_Interior_MapScripts": 0,
  "FarawayIsland_Interior_OnReturnToField": 20,
  "FarawayIsland_Interior_EventScript_TrySetMewAboveGrass": 30,
  "FarawayIsland_Interior_EventScript_SetMewAboveGrass": 125,
  "FarawayIsland_Interior_OnResume": 135,
  "FarawayIsland_Interior_EventScript_TryRemoveMew": 145,
  "FarawayIsland_Interior_OnTransition": 182,
  "FarawayIsland_Interior_EventScript_TryShowMew": 202,
  "FarawayIsland_Interior_OnFrame": 220,
  "FarawayIsland_Interior_EventScript_FindMew": 228,
  "FarawayIsland_Interior_Movement_MewMoveAndHide": 314,
  "FarawayIsland_Interior_Movement_MewAppear": 320,
  "FarawayIsland_Interior_Movement_MewFloatUpNorth": 322,
  "FarawayIsland_Interior_Movement_MewFloatUpSouth": 329,
  "FarawayIsland_Interior_Movement_MewFloatUpWest": 336,
  "FarawayIsland_Interior_Movement_MewFloatUpEast": 343,
  "FarawayIsland_Interior_EventScript_Mew": 350,
  "FarawayIsland_Interior_EventScript_MewDefeated": 620,
  "FarawayIsland_Interior_EventScript_PlayerOrMewRan": 634,
  "FarawayIsland_Interior_EventScript_FoundMewNorth": 645,
  "FarawayIsland_Interior_EventScript_FoundMewSouth": 670,
  "FarawayIsland_Interior_EventScript_FoundMewWest": 695,
  "FarawayIsland_Interior_EventScript_FoundMewEast": 720,
  "FarawayIsland_Interior_EventScript_HideMewWhenGrassCut": 745,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,135,0,0,0,3,182,0,0,0,2,220,0,0,0,7,20,0,0,0,44,0,0,8,1,30,0,0,0,3,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,125,0,0,0,7,1,13,128,0,0,35,13,128,4,0,34,13,128,4,0,7,1,125,0,0,0,7,1,13,128,0,0,35,13,128,5,0,34,13,128,5,0,7,1,125,0,0,0,7,1,13,128,0,0,35,13,128,10,0,34,13,128,10,0,7,1,125,0,0,0,7,1,13,128,0,0,4,23,4,128,1,0,38,0,0,58,4,44,0,0,8,1,145,0,0,0,3,39,13,128,0,0,58,35,13,128,7,0,34,13,128,7,0,7,5,0,0,0,0,7,5,13,128,0,0,84,15,128,85,15,128,0,0,4,23,58,64,0,0,23,0,0,1,0,44,202,1,8,0,202,0,0,0,3,44,199,1,7,1,0,0,0,0,43,206,2,23,0,0,0,0,4,0,0,0,0,228,0,0,0,106,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,58,1,0,0,81,0,0,58,1,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,23,0,0,1,0,108,3,9,9,9,37,84,254,85,254,64,22,22,65,29,29,254,64,22,22,65,30,30,254,64,22,22,65,32,32,254,64,22,22,65,31,31,254,107,91,80,0,0,64,1,0,0,81,0,0,64,1,0,0,0,0,82,0,0,83,0,0,0,0,23,4,128,0,0,38,0,0,58,104,0,0,0,0,49,162,151,0,2,0,35,12,128,2,0,34,12,128,2,0,8,1,133,2,0,0,8,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,158,2,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,183,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,208,2,0,0,8,1,12,128,0,0,38,0,0,58,41,40,0,198,23,4,128,151,0,23,5,128,30,0,23,6,128,0,0,38,0,0,58,42,0,0,38,0,0,58,43,0,0,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,108,2,0,0,7,1,13,128,0,0,35,13,128,4,0,34,13,128,4,0,7,1,122,2,0,0,7,1,13,128,0,0,35,13,128,5,0,34,13,128,5,0,7,1,122,2,0,0,7,1,13,128,0,0,35,13,128,10,0,34,13,128,10,0,7,1,122,2,0,0,7,1,13,128,0,0,42,202,1,109,3,42,199,1,23,4,128,151,0,6,0,0,0,0,3,23,4,128,151,0,6,0,0,0,0,3,80,0,0,66,1,0,0,81,0,0,66,1,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,73,1,0,0,81,0,0,73,1,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,80,1,0,0,81,0,0,80,1,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,87,1,0,0,81,0,0,87,1,0,0,0,0,82,0,0,83,0,0,0,0,4,106,221,1,42,206,2,84,0,0,85,0,0,0,0,221,0,16,0,0,0,0,0,10,4,105,108,3] as const;

export const STATS = { ops: 134, bytes: 772, labels: 24, unknownOps: 0, unresolvedSymbols: 14 } as const;
