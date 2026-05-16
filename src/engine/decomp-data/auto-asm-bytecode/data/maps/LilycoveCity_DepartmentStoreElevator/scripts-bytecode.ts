// AUTO-GENERATED from data/maps/LilycoveCity_DepartmentStoreElevator/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=89, bytes=877, labels=16, unknownOps=0, unresolvedSymbols=14

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_DepartmentStoreElevator_MapScripts": 0,
  "LilycoveCity_DepartmentStoreElevator_EventScript_Attendant": 0,
  "LilycoveCity_DepartmentStoreElevator_EventScript_ChooseFloorFrom5th": 208,
  "LilycoveCity_DepartmentStoreElevator_EventScript_ChooseFloorFrom4th": 220,
  "LilycoveCity_DepartmentStoreElevator_EventScript_ChooseFloorFrom3rd": 232,
  "LilycoveCity_DepartmentStoreElevator_EventScript_ChooseFloorFrom2nd": 244,
  "LilycoveCity_DepartmentStoreElevator_EventScript_ChooseFloorFrom1st": 256,
  "LilycoveCity_DepartmentStoreElevator_EventScript_ChooseFloor": 268,
  "LilycoveCity_DepartmentStoreElevator_EventScript_1stFloor": 498,
  "LilycoveCity_DepartmentStoreElevator_EventScript_2ndFloor": 564,
  "LilycoveCity_DepartmentStoreElevator_EventScript_3rdFloor": 630,
  "LilycoveCity_DepartmentStoreElevator_EventScript_4thFloor": 696,
  "LilycoveCity_DepartmentStoreElevator_EventScript_5thFloor": 762,
  "LilycoveCity_DepartmentStoreElevator_EventScript_ExitFloorSelect": 828,
  "LilycoveCity_DepartmentStoreElevator_EventScript_MoveElevator": 834,
  "LilycoveCity_DepartmentStoreElevator_EventScript_SetFloor": 872,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,23,4,128,0,0,44,0,0,8,0,104,3,0,0,26,5,128,67,64,38,0,0,58,104,0,0,0,0,103,23,4,128,0,0,39,13,128,0,0,58,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,208,0,0,0,34,208,0,0,0,7,1,0,0,0,0,7,1,208,0,0,0,35,0,128,1,0,34,0,128,1,0,35,220,0,0,0,34,220,0,0,0,7,1,0,0,0,0,7,1,220,0,0,0,35,0,128,2,0,34,0,128,2,0,35,232,0,0,0,34,232,0,0,0,7,1,0,0,0,0,7,1,232,0,0,0,35,0,128,3,0,34,0,128,3,0,35,244,0,0,0,34,244,0,0,0,7,1,0,0,0,0,7,1,244,0,0,0,35,0,128,4,0,34,0,128,4,0,35,0,1,0,0,34,0,1,0,0,7,1,0,0,0,0,7,1,0,1,0,0,3,113,0,0,57,0,0,6,12,1,0,0,3,113,0,0,57,1,0,6,12,1,0,0,3,113,0,0,57,2,0,6,12,1,0,0,3,113,0,0,57,3,0,6,12,1,0,0,3,113,0,0,57,4,0,6,12,1,0,0,3,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,250,2,0,0,34,250,2,0,0,7,1,0,0,0,0,7,1,250,2,0,0,35,0,128,1,0,34,0,128,1,0,35,184,2,0,0,34,184,2,0,0,7,1,0,0,0,0,7,1,184,2,0,0,35,0,128,2,0,34,0,128,2,0,35,118,2,0,0,34,118,2,0,0,7,1,0,0,0,0,7,1,118,2,0,0,35,0,128,3,0,34,0,128,3,0,35,52,2,0,0,34,52,2,0,0,7,1,0,0,0,0,7,1,52,2,0,0,35,0,128,4,0,34,0,128,4,0,35,242,1,0,0,34,242,1,0,0,7,1,0,0,0,0,7,1,242,1,0,0,35,0,128,5,0,34,0,128,5,0,35,60,3,0,0,34,60,3,0,0,7,1,0,0,0,0,7,1,60,3,0,0,35,0,128,127,0,34,0,128,127,0,35,60,3,0,0,34,60,3,0,0,7,1,0,0,0,0,7,1,60,3,0,0,3,23,6,128,4,0,64,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,1,0,2,1,0,0,0,35,67,64,4,0,34,67,64,4,0,7,1,60,3,0,0,7,1,67,64,0,0,5,66,3,0,0,23,67,64,4,0,6,60,3,0,0,3,23,6,128,5,0,64,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,1,0,2,1,0,0,0,35,67,64,5,0,34,67,64,5,0,7,1,60,3,0,0,7,1,67,64,0,0,5,66,3,0,0,23,67,64,5,0,6,60,3,0,0,3,23,6,128,6,0,64,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,1,0,2,1,0,0,0,35,67,64,6,0,34,67,64,6,0,7,1,60,3,0,0,7,1,67,64,0,0,5,66,3,0,0,23,67,64,6,0,6,60,3,0,0,3,23,6,128,7,0,64,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,1,0,2,1,0,0,0,35,67,64,7,0,34,67,64,7,0,7,1,60,3,0,0,7,1,67,64,0,0,5,66,3,0,0,23,67,64,7,0,6,60,3,0,0,3,23,6,128,8,0,64,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,1,0,2,1,0,0,0,35,67,64,8,0,34,67,64,8,0,7,1,60,3,0,0,7,1,67,64,0,0,5,66,3,0,0,23,67,64,8,0,6,60,3,0,0,3,38,0,0,58,109,3,38,0,0,58,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,49,38,0,0,58,42,0,0,4,38,0,0,58,4] as const;

export const STATS = { ops: 89, bytes: 877, labels: 16, unknownOps: 0, unresolvedSymbols: 14 } as const;
