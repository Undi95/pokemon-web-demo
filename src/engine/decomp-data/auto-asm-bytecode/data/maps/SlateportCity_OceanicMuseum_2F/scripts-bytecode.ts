// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=204, bytes=1185, labels=32, unknownOps=2, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_OceanicMuseum_2F_MapScripts": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_CaptStern": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_ReadyRegisterBirch": 859,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerFaceGrunts": 864,
  "SlateportCity_OceanicMuseum_2F_EventScript_SternFaceGrunts": 889,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntSouth": 914,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntWest": 939,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntSouth": 964,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntWest": 968,
  "SlateportCity_OceanicMuseum_2F_Movement_Unused": 974,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieApproachPlayer": 988,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieEnter": 990,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntApproachToBattle": 1000,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntEnter": 1002,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntApproach": 1006,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntDefeated": 1013,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntEnter": 1017,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntApproach": 1019,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntMoveForArchie": 1028,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample1": 1040,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample2": 1049,
  "SlateportCity_OceanicMuseum_2F_EventScript_PressureExperiment": 1058,
  "SlateportCity_OceanicMuseum_2F_EventScript_HoennModel": 1067,
  "SlateportCity_OceanicMuseum_2F_EventScript_DeepSeawaterDisplay": 1076,
  "SlateportCity_OceanicMuseum_2F_EventScript_SurfaceSeawaterDisplay": 1085,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica": 1094,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica": 1103,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmersibleReplica": 1112,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSAnneReplica": 1121,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron1": 1130,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron2": 1139,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron3": 1148,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,16,0,0,0,0,0,10,0,105,52,163,1,1,86,0,0,87,0,0,0,0,80,0,0,234,3,0,0,81,0,0,234,3,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,249,3,0,0,81,0,0,249,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,238,3,0,0,81,0,0,238,3,0,0,0,0,80,0,0,251,3,0,0,81,0,0,251,3,0,0,0,0,82,0,0,83,0,0,0,0,35,12,128,1,0,34,12,128,1,0,35,12,128,4,0,34,12,128,4,0,16,0,0,0,0,0,10,0,35,12,128,4,0,34,12,128,4,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,105,80,0,0,232,3,0,0,81,0,0,232,3,0,0,0,0,82,0,0,83,0,0,0,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,93,3,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,245,3,0,0,81,0,0,245,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,232,3,0,0,81,0,0,232,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,245,3,0,0,81,0,0,245,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,4,35,86,0,0,87,0,0,0,0,80,0,0,222,3,0,0,81,0,0,222,3,0,0,0,0,80,0,0,4,4,0,0,81,0,0,4,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,220,3,0,0,81,0,0,220,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,53,0,0,54,152,1,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,152,0,4,30,42,115,3,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,113,4,13,1,88,0,0,0,0,16,0,0,0,0,0,10,0,105,152,1,50,112,1,51,38,0,0,0,84,0,0,85,0,0,0,0,42,132,3,35,218,64,0,0,34,218,64,0,0,42,149,0,43,179,3,42,181,3,113,210,1,0,152,0,109,90,113,218,1,0,15,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,196,3,0,0,81,255,0,196,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,200,3,0,0,81,255,0,200,3,0,0,0,0,82,0,0,83,0,0,0,0,15,10,8,39,254,9,10,10,8,39,254,9,10,10,10,10,10,9,9,10,10,9,9,19,254,11,254,8,8,8,8,8,11,11,11,11,254,11,254,8,11,37,254,8,8,8,11,11,11,254,64,10,65,254,8,254,8,8,8,8,11,11,11,11,254,20,20,20,20,20,20,20,20,19,21,38,254,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90] as const;

export const STATS = { ops: 204, bytes: 1185, labels: 32, unknownOps: 2, unresolvedSymbols: 44 } as const;
