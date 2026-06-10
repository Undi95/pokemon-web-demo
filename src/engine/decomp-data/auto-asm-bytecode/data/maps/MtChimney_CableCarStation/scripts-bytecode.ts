// AUTO-GENERATED from data/maps/MtChimney_CableCarStation/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=58, bytes=268, labels=12, unknownOps=0, unresolvedSymbols=23

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MtChimney_CableCarStation_MapScripts": 0,
  "MtChimney_CableCarStation_OnTransition": 10,
  "MtChimney_CableCarStation_EventScript_MoveAttendantAside": 33,
  "MtChimney_CableCarStation_OnFrame": 45,
  "MtChimney_CableCarStation_EventScript_ExitCableCar": 53,
  "MtChimney_CableCarStation_EventScript_Attendant": 112,
  "MtChimney_CableCarStation_EventScript_RideCableCar": 167,
  "MtChimney_CableCarStation_EventScript_DeclineRide": 238,
  "MtChimney_CableCarStation_Movement_LeadPlayerToCableCar": 248,
  "MtChimney_CableCarStation_Movement_FollowPlayerOutFromCableCar": 253,
  "MtChimney_CableCarStation_Movement_BoardCableCar": 258,
  "MtChimney_CableCarStation_Movement_ExitCableCar": 263,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,10,0,0,0,0,45,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,33,0,0,0,8,1,0,0,0,0,3,100,0,0,5,0,4,0,102,0,0,0,4,0,0,1,0,53,0,0,0,106,80,0,0,7,1,0,0,81,0,0,7,1,0,0,0,0,80,0,0,253,0,0,0,81,0,0,253,0,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,100,0,0,6,0,7,0,102,0,0,0,108,3,107,91,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,167,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,238,0,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,105,80,0,0,248,0,0,0,81,0,0,248,0,0,0,0,0,80,0,0,2,1,0,0,81,0,0,2,1,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,1,0,23,0,0,2,0,196,0,38,0,0,0,38,0,0,0,109,3,16,0,0,0,0,0,10,4,109,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 58, bytes: 268, labels: 12, unknownOps: 0, unresolvedSymbols: 23 } as const;
