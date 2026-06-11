// AUTO-GENERATED from data/scripts/berry_tree-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=134, bytes=812, labels=23, unknownOps=0, unresolvedSymbols=50

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BerryTreeScript": 0,
  "BerryTree_EventScript_Sparkling": 234,
  "BerryTree_EventScript_CheckSoil": 244,
  "BerryTree_EventScript_WantToPlant": 283,
  "BerryTree_EventScript_ChooseBerryToPlant": 336,
  "BerryTree_EventScript_CancelPlanting": 375,
  "BerryTree_EventScript_CheckBerryStage1": 377,
  "BerryTree_EventScript_CheckBerryStage2": 394,
  "BerryTree_EventScript_CheckBerryStage3": 411,
  "BerryTree_EventScript_CheckBerryStage4": 428,
  "BerryTree_EventScript_GetCareAdverb": 450,
  "BerryTree_EventScript_SetAdverbGreat": 504,
  "BerryTree_EventScript_SetAdverbPoor": 514,
  "BerryTree_EventScript_CheckBerryFullyGrown": 524,
  "BerryTree_EventScript_PickBerry": 589,
  "BerryTree_EventScript_BerryPocketFull": 643,
  "BerryTree_EventScript_CancelPickingBerry": 652,
  "BerryTree_EventScript_ItemUsePlantBerry": 661,
  "BerryTree_EventScript_WantToWater": 673,
  "BerryTree_EventScript_DontWater": 756,
  "BerryTree_EventScript_ItemUseWailmerPail": 758,
  "BerryTree_EventScript_WaterBerry": 763,
  "BerryTree_EventScript_PlantBerry": 790,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,234,0,0,0,34,234,0,0,0,7,1,0,0,0,0,7,1,234,0,0,0,35,0,0,0,0,34,0,0,0,0,35,244,0,0,0,34,244,0,0,0,7,1,0,0,0,0,7,1,244,0,0,0,35,0,0,0,0,34,0,0,0,0,35,121,1,0,0,34,121,1,0,0,7,1,0,0,0,0,7,1,121,1,0,0,35,0,0,0,0,34,0,0,0,0,35,138,1,0,0,34,138,1,0,0,7,1,0,0,0,0,7,1,138,1,0,0,35,0,0,0,0,34,0,0,0,0,35,155,1,0,0,34,155,1,0,0,7,1,0,0,0,0,7,1,155,1,0,0,35,0,0,0,0,34,0,0,0,0,35,172,1,0,0,34,172,1,0,0,7,1,0,0,0,0,7,1,172,1,0,0,35,0,0,0,0,34,0,0,0,0,35,12,2,0,0,34,12,2,0,0,7,1,0,0,0,0,7,1,12,2,0,0,3,106,104,0,0,0,0,103,110,108,3,107,91,39,0,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,27,1,0,0,7,1,0,0,0,0,104,0,0,0,0,103,110,109,3,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,80,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,119,1,0,0,7,1,0,0,0,0,3,152,0,105,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,119,1,0,0,7,1,0,0,0,0,70,0,0,1,0,5,22,3,0,0,109,3,106,38,0,0,0,104,0,0,0,0,103,110,6,161,2,0,0,106,38,0,0,0,104,0,0,0,0,103,110,6,161,2,0,0,106,38,0,0,0,104,0,0,0,0,103,110,6,161,2,0,0,5,194,1,0,0,106,38,0,0,0,104,0,0,0,0,103,110,6,161,2,0,0,35,0,0,0,0,34,0,0,0,0,7,1,2,2,0,0,7,1,0,0,0,0,35,0,0,4,0,34,0,0,4,0,7,1,248,1,0,0,7,1,0,0,0,0,134,0,1,2,0,0,0,0,0,4,134,0,1,2,0,0,0,0,0,4,134,0,1,2,0,0,0,0,0,4,132,0,1,2,0,0,0,107,91,38,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,77,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,140,2,0,0,7,1,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,131,2,0,0,7,1,0,0,0,0,38,0,0,0,38,0,0,0,104,0,0,0,0,50,131,1,103,51,110,104,0,0,0,0,103,110,109,3,104,0,0,0,0,103,110,109,3,104,0,0,0,0,103,110,109,3,106,38,0,0,0,5,22,3,0,0,108,3,72,0,0,1,0,35,0,0,0,0,34,0,0,0,0,7,1,244,2,0,0,7,1,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,251,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,244,2,0,0,7,1,0,0,0,0,108,3,38,0,0,0,106,38,0,0,0,104,0,0,0,0,103,38,0,0,0,38,0,0,0,104,0,0,0,0,103,110,108,3,38,0,0,0,196,0,38,0,0,0,38,0,0,0,104,0,0,0,0,103,110,4] as const;

export const STATS = { ops: 134, bytes: 812, labels: 23, unknownOps: 0, unresolvedSymbols: 50 } as const;
