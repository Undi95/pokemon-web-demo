// AUTO-GENERATED from data/scripts/berry_tree-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=134, bytes=835, labels=23, unknownOps=0, unresolvedSymbols=37

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BerryTreeScript": 0,
  "BerryTree_EventScript_Sparkling": 234,
  "BerryTree_EventScript_CheckSoil": 246,
  "BerryTree_EventScript_WantToPlant": 287,
  "BerryTree_EventScript_ChooseBerryToPlant": 340,
  "BerryTree_EventScript_CancelPlanting": 376,
  "BerryTree_EventScript_CheckBerryStage1": 378,
  "BerryTree_EventScript_CheckBerryStage2": 397,
  "BerryTree_EventScript_CheckBerryStage3": 416,
  "BerryTree_EventScript_CheckBerryStage4": 435,
  "BerryTree_EventScript_GetCareAdverb": 459,
  "BerryTree_EventScript_SetAdverbGreat": 513,
  "BerryTree_EventScript_SetAdverbPoor": 523,
  "BerryTree_EventScript_CheckBerryFullyGrown": 533,
  "BerryTree_EventScript_PickBerry": 598,
  "BerryTree_EventScript_BerryPocketFull": 656,
  "BerryTree_EventScript_CancelPickingBerry": 667,
  "BerryTree_EventScript_ItemUsePlantBerry": 678,
  "BerryTree_EventScript_WantToWater": 690,
  "BerryTree_EventScript_DontWater": 773,
  "BerryTree_EventScript_ItemUseWailmerPail": 775,
  "BerryTree_EventScript_WaterBerry": 780,
  "BerryTree_EventScript_PlantBerry": 811,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [38,0,0,0,26,0,128,4,128,35,0,128,255,0,34,0,128,255,0,35,234,0,0,0,34,234,0,0,0,7,1,0,0,0,0,7,1,234,0,0,0,35,0,128,0,0,34,0,128,0,0,35,246,0,0,0,34,246,0,0,0,7,1,0,0,0,0,7,1,246,0,0,0,35,0,128,1,0,34,0,128,1,0,35,122,1,0,0,34,122,1,0,0,7,1,0,0,0,0,7,1,122,1,0,0,35,0,128,2,0,34,0,128,2,0,35,141,1,0,0,34,141,1,0,0,7,1,0,0,0,0,7,1,141,1,0,0,35,0,128,3,0,34,0,128,3,0,35,160,1,0,0,34,160,1,0,0,7,1,0,0,0,0,7,1,160,1,0,0,35,0,128,4,0,34,0,128,4,0,35,179,1,0,0,34,179,1,0,0,7,1,0,0,0,0,7,1,179,1,0,0,35,0,128,5,0,34,0,128,5,0,35,21,2,0,0,34,21,2,0,0,7,1,0,0,0,0,7,1,21,2,0,0,90,106,104,0,0,0,0,0,0,0,110,108,90,107,91,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,31,1,0,0,7,1,13,128,0,0,104,0,0,0,0,0,0,0,110,109,90,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,84,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,120,1,0,0,7,1,13,128,0,0,90,152,1,105,38,0,0,0,35,14,128,0,0,34,14,128,0,0,7,1,120,1,0,0,7,1,14,128,0,0,0,14,88,43,3,0,0,109,90,106,38,0,0,0,104,0,0,0,0,0,0,0,110,89,178,2,0,0,106,38,0,0,0,104,0,0,0,0,0,0,0,110,89,178,2,0,0,106,38,0,0,0,104,0,0,0,0,0,0,0,110,89,178,2,0,0,88,203,1,0,0,106,38,0,0,0,104,0,0,0,0,0,0,0,110,89,178,2,0,0,35,5,128,0,0,34,5,128,0,0,7,1,11,2,0,0,7,1,5,128,0,0,35,5,128,4,0,34,5,128,4,0,7,1,1,2,0,0,7,1,5,128,0,0,134,0,1,2,0,0,0,0,0,15,134,0,1,2,0,0,0,0,0,15,134,0,1,2,0,0,0,0,0,15,132,0,1,2,0,6,128,107,91,38,0,0,0,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,86,2,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,155,2,0,0,7,1,13,128,0,0,38,0,0,0,35,4,128,0,0,34,4,128,0,0,7,1,144,2,0,0,7,1,4,128,0,0,38,0,0,0,38,0,0,0,104,0,0,0,0,50,131,1,0,0,0,51,110,104,0,0,0,0,0,0,0,110,109,90,104,0,0,0,0,0,0,0,110,109,90,104,0,0,0,0,0,0,0,110,109,90,106,38,0,0,0,88,43,3,0,0,108,90,72,12,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,5,3,0,0,7,1,13,128,0,0,38,0,0,0,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,12,3,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,5,3,0,0,7,1,13,128,0,0,108,90,38,0,0,0,106,38,0,0,0,104,0,0,0,0,0,0,0,38,0,0,0,38,0,0,0,104,0,0,0,0,0,0,0,110,108,90,38,0,0,0,0,3,38,0,0,0,38,0,0,0,104,0,0,0,0,0,0,0,110,15] as const;

export const STATS = { ops: 134, bytes: 835, labels: 23, unknownOps: 0, unresolvedSymbols: 37 } as const;
