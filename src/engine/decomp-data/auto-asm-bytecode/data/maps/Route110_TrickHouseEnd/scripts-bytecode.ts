// AUTO-GENERATED from data/maps/Route110_TrickHouseEnd/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=186, bytes=1200, labels=30, unknownOps=2, unresolvedSymbols=43

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route110_TrickHouseEnd_MapScripts": 0,
  "Route110_TrickHouseEnd_OnResume": 20,
  "Route110_TrickHouseEnd_OnTransition": 31,
  "Route110_TrickHouseEnd_OnWarp": 44,
  "Route110_TrickHouseEnd_EventScript_SetTrickMasterPos": 52,
  "Route110_TrickHouseEnd_OnFrame": 70,
  "Route110_TrickHouseEnd_EventScript_CloseDoor": 78,
  "Route110_TrickHouseEnd_EventScript_SetDoorClosedMetatile": 92,
  "Route110_TrickHouseEnd_EventScript_TrickMaster": 102,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle1": 282,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle2": 340,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle3": 398,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle4": 456,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle5": 514,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle6": 572,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle7": 630,
  "Route110_TrickHouseEnd_EventScript_CompletedPuzzle8": 688,
  "Route110_TrickHouseEnd_EventScript_ChooseTent": 820,
  "Route110_TrickHouseEnd_EventScript_GiveRedTent": 855,
  "Route110_TrickHouseEnd_EventScript_GiveBlueTent": 863,
  "Route110_TrickHouseEnd_EventScript_TrickMasterExit": 871,
  "Route110_TrickHouseEnd_EventScript_BagFull": 934,
  "Route110_TrickHouseEnd_EventScript_NoRoomForTent": 952,
  "Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwaySouth": 970,
  "Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayNorth": 995,
  "Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayWest": 1020,
  "Route110_TrickHouseEnd_EventScript_TrickMasterFaceAwayEast": 1045,
  "Route110_TrickHouseEnd_EventScript_TrickMasterExitTrigger": 1070,
  "Route110_TrickHouseEnd_Movement_KeepPlayerInRoom": 1196,
  "Route110_TrickHouseEnd_Movement_TrickMasterSurprise": 1198,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,20,0,0,0,3,31,0,0,0,2,70,0,0,0,4,44,0,0,0,35,0,0,1,0,34,0,0,1,0,90,113,0,0,0,113,0,0,0,38,0,0,0,90,0,0,0,0,52,0,0,0,86,0,0,87,0,0,0,0,89,0,0,0,0,92,0,0,4,90,0,0,0,0,78,0,0,0,113,0,1,0,88,92,0,0,0,38,0,0,0,90,163,10,0,1,0,27,2,1,0,15,107,91,16,0,0,0,0,0,10,0,113,0,1,0,26,0,128,68,64,35,0,128,0,0,34,0,128,0,0,35,26,1,0,0,34,26,1,0,0,35,0,128,1,0,34,0,128,1,0,35,84,1,0,0,34,84,1,0,0,35,0,128,2,0,34,0,128,2,0,35,142,1,0,0,34,142,1,0,0,35,0,128,3,0,34,0,128,3,0,35,200,1,0,0,34,200,1,0,0,35,0,128,4,0,34,0,128,4,0,35,2,2,0,0,34,2,2,0,0,35,0,128,5,0,34,0,128,5,0,35,60,2,0,0,34,60,2,0,0,35,0,128,6,0,34,0,128,6,0,35,118,2,0,0,34,118,2,0,0,35,0,128,7,0,34,0,128,7,0,35,176,2,0,0,34,176,2,0,0,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,193,0,0,27,0,128,68,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,88,103,3,0,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,193,0,0,27,0,128,10,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,88,103,3,0,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,193,0,0,27,0,128,204,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,88,103,3,0,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,193,0,0,27,0,128,194,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,88,103,3,0,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,193,0,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,88,103,3,0,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,193,0,0,27,0,128,208,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,88,103,3,0,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,193,0,0,27,0,128,71,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,88,103,3,0,0,109,90,16,0,0,0,0,0,10,0,105,35,12,128,1,0,34,12,128,1,0,35,12,128,2,0,34,12,128,2,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,4,30,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,16,0,0,0,0,0,10,0,113,193,0,0,88,52,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,88,103,3,0,0,38,0,0,0,109,90,112,0,0,88,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,87,3,0,0,34,87,3,0,0,89,95,3,0,0,27,0,128,31,0,10,0,15,27,0,128,32,0,10,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,178,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,115,68,1,15,88,0,0,0,0,16,0,0,0,0,0,10,0,113,193,1,0,15,88,0,0,0,0,16,0,0,0,0,0,10,0,113,193,1,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,106,92,0,0,3,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,20,80,0,0,174,4,0,0,81,0,0,174,4,0,0,0,0,82,0,0,83,0,0,0,0,9,178,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,172,4,0,0,81,255,0,172,4,0,0,0,0,82,0,0,83,0,0,0,0,4,4,92,0,0,4,108,90,8,254,72,254] as const;

export const STATS = { ops: 186, bytes: 1200, labels: 30, unknownOps: 2, unresolvedSymbols: 43 } as const;
