// AUTO-GENERATED from data/maps/FarawayIsland_Interior/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=134, bytes=560, labels=24, unknownOps=15, unresolvedSymbols=18

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FarawayIsland_Interior_MapScripts": 0,
  "FarawayIsland_Interior_OnReturnToField": 20,
  "FarawayIsland_Interior_EventScript_TrySetMewAboveGrass": 30,
  "FarawayIsland_Interior_EventScript_SetMewAboveGrass": 76,
  "FarawayIsland_Interior_OnResume": 84,
  "FarawayIsland_Interior_EventScript_TryRemoveMew": 94,
  "FarawayIsland_Interior_OnTransition": 118,
  "FarawayIsland_Interior_EventScript_TryShowMew": 136,
  "FarawayIsland_Interior_OnFrame": 152,
  "FarawayIsland_Interior_EventScript_FindMew": 160,
  "FarawayIsland_Interior_Movement_MewMoveAndHide": 245,
  "FarawayIsland_Interior_Movement_MewAppear": 245,
  "FarawayIsland_Interior_Movement_MewFloatUpNorth": 245,
  "FarawayIsland_Interior_Movement_MewFloatUpSouth": 245,
  "FarawayIsland_Interior_Movement_MewFloatUpWest": 245,
  "FarawayIsland_Interior_Movement_MewFloatUpEast": 245,
  "FarawayIsland_Interior_EventScript_Mew": 245,
  "FarawayIsland_Interior_EventScript_MewDefeated": 414,
  "FarawayIsland_Interior_EventScript_PlayerOrMewRan": 427,
  "FarawayIsland_Interior_EventScript_FoundMewNorth": 437,
  "FarawayIsland_Interior_EventScript_FoundMewSouth": 461,
  "FarawayIsland_Interior_EventScript_FoundMewWest": 485,
  "FarawayIsland_Interior_EventScript_FoundMewEast": 509,
  "FarawayIsland_Interior_EventScript_HideMewWhenGrassCut": 533,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,84,0,0,0,3,118,0,0,0,2,152,0,0,0,7,20,0,0,0,44,0,0,8,1,30,0,0,0,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,35,13,128,10,0,34,13,128,10,0,113,4,1,0,38,0,0,0,44,0,0,8,1,94,0,0,0,90,39,13,128,0,0,0,35,13,128,7,0,34,13,128,7,0,84,15,128,85,15,128,0,0,113,58,0,0,113,0,1,0,44,202,1,8,0,136,0,0,0,90,44,199,1,7,1,0,0,0,0,43,206,2,113,0,0,0,0,0,0,0,160,0,0,0,106,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,245,0,0,0,81,0,0,245,0,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,113,0,1,0,108,90,107,91,80,0,0,245,0,0,0,81,0,0,245,0,0,0,0,0,82,0,0,83,0,0,0,0,113,4,0,0,38,0,0,0,104,0,0,0,0,49,162,151,0,2,0,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,38,0,0,0,4,40,198,113,4,151,0,113,5,30,0,113,6,0,0,38,0,0,0,42,0,0,38,0,0,0,43,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,4,0,34,13,128,4,0,35,13,128,5,0,34,13,128,5,0,35,13,128,10,0,34,13,128,10,0,42,202,1,109,90,42,199,1,113,4,151,0,89,0,0,0,0,90,113,4,151,0,89,0,0,0,0,90,80,0,0,245,0,0,0,81,0,0,245,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,245,0,0,0,81,0,0,245,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,245,0,0,0,81,0,0,245,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,245,0,0,0,81,0,0,245,0,0,0,0,0,82,0,0,83,0,0,0,0,106,221,1,42,206,2,84,0,0,85,0,0,0,0,221,0,16,0,0,0,0,0,10,0,105,108,90] as const;

export const STATS = { ops: 134, bytes: 560, labels: 24, unknownOps: 15, unresolvedSymbols: 18 } as const;
