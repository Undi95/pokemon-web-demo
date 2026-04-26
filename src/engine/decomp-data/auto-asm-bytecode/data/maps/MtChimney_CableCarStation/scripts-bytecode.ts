// AUTO-GENERATED from data/maps/MtChimney_CableCarStation/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=58, bytes=229, labels=12, unknownOps=2, unresolvedSymbols=14

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MtChimney_CableCarStation_MapScripts": 0,
  "MtChimney_CableCarStation_OnTransition": 10,
  "MtChimney_CableCarStation_EventScript_MoveAttendantAside": 21,
  "MtChimney_CableCarStation_OnFrame": 33,
  "MtChimney_CableCarStation_EventScript_ExitCableCar": 41,
  "MtChimney_CableCarStation_EventScript_Attendant": 99,
  "MtChimney_CableCarStation_EventScript_RideCableCar": 130,
  "MtChimney_CableCarStation_EventScript_DeclineRide": 199,
  "MtChimney_CableCarStation_Movement_LeadPlayerToCableCar": 209,
  "MtChimney_CableCarStation_Movement_FollowPlayerOutFromCableCar": 214,
  "MtChimney_CableCarStation_Movement_BoardCableCar": 219,
  "MtChimney_CableCarStation_Movement_ExitCableCar": 224,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,33,0,0,0,35,163,64,1,0,34,163,64,1,0,90,100,0,0,5,0,4,0,102,0,0,10,15,163,64,1,0,41,0,0,0,106,80,255,0,224,0,0,0,81,255,0,224,0,0,0,0,0,80,0,0,214,0,0,0,81,0,0,214,0,0,0,0,0,82,0,0,83,0,0,0,0,113,163,0,0,100,0,0,6,0,7,0,102,0,0,8,108,90,107,91,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,105,80,0,0,209,0,0,0,81,0,0,209,0,0,0,0,0,80,255,0,219,0,0,0,81,255,0,219,0,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,163,2,0,0,48,38,0,0,0,38,0,0,0,109,90,16,0,0,0,0,0,10,0,109,90,9,9,10,40,254,20,11,8,8,254,9,9,9,20,254,8,8,8,20,254] as const;

export const STATS = { ops: 58, bytes: 229, labels: 12, unknownOps: 2, unresolvedSymbols: 14 } as const;
