// AUTO-GENERATED from data/maps/SSTidalCorridor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=183, bytes=837, labels=33, unknownOps=2, unresolvedSymbols=35

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SSTidalCorridor_MapScripts": 0,
  "SSTidalCorridor_OnFrame": 5,
  "SSTidalCorridor_EventScript_DepartSlateportForLilycove": 45,
  "SSTidalCorridor_EventScript_DepartLilycoveForSlateport": 67,
  "SSTidalRooms_EventScript_HalfwayToSlateport": 85,
  "SSTidalRooms_EventScript_ArrivedInLilycove": 105,
  "SSTidalCorridor_EventScript_ReachedStepCount": 125,
  "SSTidalCorridor_EventScript_HalfwayToLilycove": 146,
  "SSTidalCorridor_EventScript_ArrivedInSlateport": 168,
  "SSTidalRooms_EventScript_ArrivedInSlateport": 190,
  "SSTidalRooms_EventScript_ProgessCruiseAfterBed": 210,
  "SSTidalCorridor_EventScript_Briney": 296,
  "SSTidalCorridor_EventScript_Peeko": 305,
  "SSTidalCorridor_EventScript_Cabin1Sign": 324,
  "SSTidalCorridor_EventScript_Cabin2Sign": 333,
  "SSTidalCorridor_EventScript_Cabin3Sign": 342,
  "SSTidalCorridor_EventScript_Cabin4Sign": 351,
  "SSTidalCorridor_EventScript_ExitSailor": 360,
  "SSTidalCorridor_EventScript_ExitLilycove": 392,
  "SSTidalCorridor_EventScript_ExitSlateport": 438,
  "SSTidalCorridor_EventScript_HideSnatchGiver": 484,
  "SSTidalCorridor_EventScript_Porthole": 488,
  "SSTidalCorridor_EventScript_LookThroughPorthole": 519,
  "SSTidalCorridor_EventScript_Sailor": 524,
  "SSTidalCorridor_EventScript_EnjoyYourCruise": 550,
  "SSTidalCorridor_EventScript_CheckIfTrainersDefeated": 560,
  "SSTidalCorridor_EventScript_TrainerNotDefeated": 641,
  "SSTidalCorridor_EventScript_ScottScene": 642,
  "SSTidalCorridor_Movement_ScottApproachPlayer": 803,
  "SSTidalCorridor_Movement_ScottExit": 811,
  "SSTidalCorridor_Movement_PlayerWatchScottExit": 819,
  "SSTidalCorridor_Movement_SailorMoveForScott": 826,
  "SSTidalCorridor_Movement_SailorReturn": 833,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,5,0,0,0,212,64,0,0,130,2,0,0,180,64,1,0,45,0,0,0,180,64,5,0,67,0,0,0,180,64,9,0,146,0,0,0,180,64,10,0,168,0,0,0,38,0,0,0,113,180,2,0,106,9,73,0,16,0,0,0,0,0,10,0,108,90,113,180,6,0,106,9,73,0,16,0,0,0,0,0,10,0,108,90,38,0,0,0,113,180,7,0,9,73,0,16,0,0,0,0,0,10,0,15,38,0,0,0,113,180,4,0,9,73,0,16,0,0,0,0,0,10,0,15,35,180,64,2,0,34,180,64,2,0,35,180,64,7,0,34,180,64,7,0,90,38,0,0,0,113,180,3,0,106,9,73,0,16,0,0,0,0,0,10,0,108,90,38,0,0,0,113,180,8,0,106,9,73,0,16,0,0,0,0,0,10,0,108,90,38,0,0,0,113,180,8,0,9,73,0,16,0,0,0,0,0,10,0,15,26,0,128,180,64,35,0,128,2,0,34,0,128,2,0,35,105,0,0,0,34,105,0,0,0,35,0,128,3,0,34,0,128,3,0,35,105,0,0,0,34,105,0,0,0,35,0,128,6,0,34,0,128,6,0,35,85,0,0,0,34,85,0,0,0,35,0,128,7,0,34,0,128,7,0,35,190,0,0,0,34,190,0,0,0,15,16,0,0,0,0,0,10,0,90,107,91,49,162,53,1,0,0,16,0,0,0,0,0,10,0,198,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,35,180,64,4,0,34,180,64,4,0,35,180,64,8,0,34,180,64,8,0,16,0,0,0,0,0,10,0,109,90,160,0,0,16,0,0,0,0,0,10,0,44,4,1,8,1,228,1,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,160,0,0,16,0,0,0,0,0,10,0,44,4,1,8,1,228,1,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,42,183,3,15,106,35,180,64,2,0,34,180,64,2,0,35,180,64,7,0,34,180,64,7,0,16,0,0,0,0,0,10,0,108,90,38,0,0,0,90,107,91,44,247,0,7,1,38,2,0,0,88,48,2,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,97,238,1,7,0,129,2,0,0,97,239,1,7,0,129,2,0,0,97,38,1,7,0,129,2,0,0,97,255,0,7,0,129,2,0,0,97,0,1,7,0,129,2,0,0,97,129,2,7,0,129,2,0,0,97,138,0,7,0,129,2,0,0,97,119,0,7,0,129,2,0,0,42,247,0,89,38,2,0,0,15,15,106,80,0,0,35,3,0,0,81,0,0,35,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,51,3,0,0,81,255,0,51,3,0,0,0,0,80,0,0,58,3,0,0,81,0,0,58,3,0,0,0,0,80,0,0,43,3,0,0,81,0,0,43,3,0,0,0,0,82,0,0,83,0,0,0,0,9,9,0,49,84,0,0,85,0,0,0,0,80,0,0,65,3,0,0,81,0,0,65,3,0,0,0,0,82,0,0,83,0,0,0,0,4,30,42,208,1,113,212,1,0,108,90,10,10,10,10,10,10,10,254,37,20,20,20,20,8,10,254,20,20,20,20,19,37,254,20,11,11,38,20,39,254,10,10,38,254] as const;

export const STATS = { ops: 183, bytes: 837, labels: 33, unknownOps: 2, unresolvedSymbols: 35 } as const;
