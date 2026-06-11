// AUTO-GENERATED from data/maps/SSTidalCorridor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=183, bytes=966, labels=33, unknownOps=0, unresolvedSymbols=65

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SSTidalCorridor_MapScripts": 0,
  "SSTidalCorridor_OnFrame": 5,
  "SSTidalCorridor_EventScript_DepartSlateportForLilycove": 45,
  "SSTidalCorridor_EventScript_DepartLilycoveForSlateport": 68,
  "SSTidalRooms_EventScript_HalfwayToSlateport": 87,
  "SSTidalRooms_EventScript_ArrivedInLilycove": 108,
  "SSTidalCorridor_EventScript_ReachedStepCount": 129,
  "SSTidalCorridor_EventScript_HalfwayToLilycove": 174,
  "SSTidalCorridor_EventScript_ArrivedInSlateport": 197,
  "SSTidalRooms_EventScript_ArrivedInSlateport": 220,
  "SSTidalRooms_EventScript_ProgessCruiseAfterBed": 241,
  "SSTidalCorridor_EventScript_Briney": 375,
  "SSTidalCorridor_EventScript_Peeko": 384,
  "SSTidalCorridor_EventScript_Cabin1Sign": 403,
  "SSTidalCorridor_EventScript_Cabin2Sign": 412,
  "SSTidalCorridor_EventScript_Cabin3Sign": 421,
  "SSTidalCorridor_EventScript_Cabin4Sign": 430,
  "SSTidalCorridor_EventScript_ExitSailor": 439,
  "SSTidalCorridor_EventScript_ExitLilycove": 495,
  "SSTidalCorridor_EventScript_ExitSlateport": 541,
  "SSTidalCorridor_EventScript_HideSnatchGiver": 587,
  "SSTidalCorridor_EventScript_Porthole": 591,
  "SSTidalCorridor_EventScript_LookThroughPorthole": 646,
  "SSTidalCorridor_EventScript_Sailor": 651,
  "SSTidalCorridor_EventScript_EnjoyYourCruise": 677,
  "SSTidalCorridor_EventScript_CheckIfTrainersDefeated": 687,
  "SSTidalCorridor_EventScript_TrainerNotDefeated": 768,
  "SSTidalCorridor_EventScript_ScottScene": 769,
  "SSTidalCorridor_Movement_ScottApproachPlayer": 932,
  "SSTidalCorridor_Movement_ScottExit": 940,
  "SSTidalCorridor_Movement_PlayerWatchScottExit": 948,
  "SSTidalCorridor_Movement_SailorMoveForScott": 955,
  "SSTidalCorridor_Movement_SailorReturn": 962,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,5,0,0,0,0,0,0,0,1,3,0,0,0,0,0,0,45,0,0,0,0,0,0,0,68,0,0,0,0,0,0,0,174,0,0,0,0,0,0,0,197,0,0,0,38,0,0,0,23,0,0,0,0,106,48,73,0,16,0,0,0,0,0,10,4,108,3,23,0,0,0,0,106,48,73,0,16,0,0,0,0,0,10,4,108,3,38,0,0,0,23,0,0,0,0,48,73,0,16,0,0,0,0,0,10,4,4,38,0,0,0,23,0,0,0,0,48,73,0,16,0,0,0,0,0,10,4,4,35,0,0,0,0,34,0,0,0,0,7,1,174,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,197,0,0,0,7,1,0,0,0,0,3,38,0,0,0,23,0,0,0,0,106,48,73,0,16,0,0,0,0,0,10,4,108,3,38,0,0,0,23,0,0,0,0,106,48,73,0,16,0,0,0,0,0,10,4,108,3,38,0,0,0,23,0,0,0,0,48,73,0,16,0,0,0,0,0,10,4,4,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,108,0,0,0,34,108,0,0,0,7,1,0,0,0,0,7,1,108,0,0,0,35,0,0,0,0,34,0,0,0,0,35,108,0,0,0,34,108,0,0,0,7,1,0,0,0,0,7,1,108,0,0,0,35,0,0,0,0,34,0,0,0,0,35,87,0,0,0,34,87,0,0,0,7,1,0,0,0,0,7,1,87,0,0,0,35,0,0,0,0,34,0,0,0,0,35,220,0,0,0,34,220,0,0,0,7,1,0,0,0,0,7,1,220,0,0,0,4,16,0,0,0,0,0,10,2,3,107,91,49,162,53,1,0,0,16,0,0,0,0,0,10,4,198,109,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,107,91,35,0,0,0,0,34,0,0,0,0,7,1,239,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,29,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,160,0,0,16,0,0,0,0,0,10,4,44,0,0,8,1,75,2,0,0,58,0,0,0,255,255,255,255,8,255,255,255,255,0,8,0,11,0,8,11,0,0,0,0,109,3,160,0,0,16,0,0,0,0,0,10,4,44,0,0,8,1,75,2,0,0,58,0,0,0,255,255,255,255,8,255,255,255,255,0,8,0,11,0,8,11,0,0,0,0,109,3,42,0,0,4,106,35,0,0,0,0,34,0,0,0,0,7,1,134,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,134,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,108,3,38,0,0,0,3,107,91,44,0,0,7,1,165,2,0,0,5,175,2,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,97,0,0,7,0,0,3,0,0,97,0,0,7,0,0,3,0,0,97,0,0,7,0,0,3,0,0,97,0,0,7,0,0,3,0,0,97,0,0,7,0,0,3,0,0,97,0,0,7,0,0,3,0,0,97,0,0,7,0,0,3,0,0,97,0,0,7,0,0,3,0,0,42,0,0,6,165,2,0,0,4,4,106,80,0,0,164,3,0,0,81,0,0,164,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,180,3,0,0,81,0,0,180,3,0,0,0,0,80,0,0,187,3,0,0,81,0,0,187,3,0,0,0,0,80,0,0,172,3,0,0,81,0,0,172,3,0,0,0,0,82,0,0,83,0,0,0,0,48,9,0,49,84,0,0,85,0,0,0,0,80,0,0,194,3,0,0,81,0,0,194,3,0,0,0,0,82,0,0,83,0,0,0,0,41,30,0,42,0,0,23,0,0,1,0,108,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 183, bytes: 966, labels: 33, unknownOps: 0, unresolvedSymbols: 65 } as const;
