// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=204, bytes=1257, labels=32, unknownOps=0, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_OceanicMuseum_2F_MapScripts": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_CaptStern": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_ReadyRegisterBirch": 931,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerFaceGrunts": 936,
  "SlateportCity_OceanicMuseum_2F_EventScript_SternFaceGrunts": 961,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntSouth": 986,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntWest": 1011,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntSouth": 1036,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntWest": 1040,
  "SlateportCity_OceanicMuseum_2F_Movement_Unused": 1046,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieApproachPlayer": 1060,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieEnter": 1062,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntApproachToBattle": 1072,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntEnter": 1074,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntApproach": 1078,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntDefeated": 1085,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntEnter": 1089,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntApproach": 1091,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntMoveForArchie": 1100,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample1": 1112,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample2": 1121,
  "SlateportCity_OceanicMuseum_2F_EventScript_PressureExperiment": 1130,
  "SlateportCity_OceanicMuseum_2F_EventScript_HoennModel": 1139,
  "SlateportCity_OceanicMuseum_2F_EventScript_DeepSeawaterDisplay": 1148,
  "SlateportCity_OceanicMuseum_2F_EventScript_SurfaceSeawaterDisplay": 1157,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica": 1166,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica": 1175,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmersibleReplica": 1184,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSAnneReplica": 1193,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron1": 1202,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron2": 1211,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron3": 1220,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,16,0,0,0,0,0,10,0,105,52,163,1,1,86,0,0,87,0,0,0,0,80,0,0,50,4,0,0,81,0,0,50,4,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,65,4,0,0,81,0,0,65,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,54,4,0,0,81,0,0,54,4,0,0,0,0,80,0,0,67,4,0,0,81,0,0,67,4,0,0,0,0,82,0,0,83,0,0,0,0,35,12,128,1,0,34,12,128,1,0,8,1,168,3,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,168,3,0,0,8,1,12,128,0,0,16,0,0,0,0,0,10,0,35,12,128,4,0,34,12,128,4,0,8,5,193,3,0,0,8,5,12,128,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,105,80,0,0,48,4,0,0,81,0,0,48,4,0,0,0,0,82,0,0,83,0,0,0,0,35,12,128,1,0,34,12,128,1,0,8,1,218,3,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,243,3,0,0,8,1,12,128,0,0,93,3,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,61,4,0,0,81,0,0,61,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,48,4,0,0,81,0,0,48,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,61,4,0,0,81,0,0,61,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,4,35,86,0,0,87,0,0,0,0,80,0,0,38,4,0,0,81,0,0,38,4,0,0,0,0,80,0,0,76,4,0,0,81,0,0,76,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,36,4,0,0,81,0,0,36,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,53,0,0,54,152,1,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,152,0,4,30,42,115,3,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,113,4,13,1,88,0,0,0,0,16,0,0,0,0,0,10,0,105,152,1,50,112,1,51,38,0,0,0,84,0,0,85,0,0,0,0,42,132,3,35,218,64,0,0,34,218,64,0,0,8,1,163,3,0,0,8,1,218,64,0,0,42,149,0,43,179,3,42,181,3,113,210,1,0,152,0,109,90,113,218,1,0,15,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,12,4,0,0,81,255,0,12,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,16,4,0,0,81,255,0,16,4,0,0,0,0,82,0,0,83,0,0,0,0,15,10,8,39,254,9,10,10,8,39,254,9,10,10,10,10,10,9,9,10,10,9,9,19,254,11,254,8,8,8,8,8,11,11,11,11,254,11,254,8,11,37,254,8,8,8,11,11,11,254,64,10,65,254,8,254,8,8,8,8,11,11,11,11,254,20,20,20,20,20,20,20,20,19,21,38,254,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90] as const;

export const STATS = { ops: 204, bytes: 1257, labels: 32, unknownOps: 0, unresolvedSymbols: 44 } as const;
