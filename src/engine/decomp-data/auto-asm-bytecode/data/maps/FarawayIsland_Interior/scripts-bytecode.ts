// AUTO-GENERATED from data/maps/FarawayIsland_Interior/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=134, bytes=772, labels=24, unknownOps=0, unresolvedSymbols=56

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
export const BYTECODE: readonly number[] = [0,135,0,0,0,0,182,0,0,0,0,220,0,0,0,0,20,0,0,0,44,0,0,8,1,30,0,0,0,3,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,125,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,125,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,125,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,125,0,0,0,7,1,0,0,0,0,4,23,0,0,1,0,38,0,0,0,4,44,0,0,8,1,145,0,0,0,3,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,0,0,0,0,7,5,0,0,0,0,84,0,0,85,0,0,0,0,4,23,0,0,0,0,23,0,0,1,0,44,0,0,8,0,202,0,0,0,3,44,0,0,7,1,0,0,0,0,43,0,0,23,0,0,0,0,4,0,0,0,0,228,0,0,0,106,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,58,1,0,0,81,0,0,58,1,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,23,0,0,1,0,108,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,91,80,0,0,64,1,0,0,81,0,0,64,1,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,38,0,0,0,104,0,0,0,0,49,162,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,133,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,158,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,183,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,208,2,0,0,8,1,0,0,0,0,38,0,0,0,41,40,0,198,23,0,0,0,0,23,0,0,30,0,23,0,0,0,0,38,0,0,0,42,0,0,38,0,0,0,43,0,0,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,108,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,122,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,122,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,122,2,0,0,7,1,0,0,0,0,42,0,0,109,3,42,0,0,23,0,0,0,0,6,0,0,0,0,3,23,0,0,0,0,6,0,0,0,0,3,80,0,0,66,1,0,0,81,0,0,66,1,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,73,1,0,0,81,0,0,73,1,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,80,1,0,0,81,0,0,80,1,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,87,1,0,0,81,0,0,87,1,0,0,0,0,82,0,0,83,0,0,0,0,4,106,221,0,42,0,0,84,0,0,85,0,0,0,0,221,0,16,0,0,0,0,0,10,4,105,108,3] as const;

export const STATS = { ops: 134, bytes: 772, labels: 24, unknownOps: 0, unresolvedSymbols: 56 } as const;
