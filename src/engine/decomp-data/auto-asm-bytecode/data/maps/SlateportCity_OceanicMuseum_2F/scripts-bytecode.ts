// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=204, bytes=1104, labels=32, unknownOps=16, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_OceanicMuseum_2F_MapScripts": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_CaptStern": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_ReadyRegisterBirch": 859,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerFaceGrunts": 863,
  "SlateportCity_OceanicMuseum_2F_EventScript_SternFaceGrunts": 887,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntSouth": 911,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntWest": 935,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntSouth": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntWest": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_Unused": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieApproachPlayer": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieEnter": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntApproachToBattle": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntEnter": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntApproach": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntDefeated": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntEnter": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntApproach": 959,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntMoveForArchie": 959,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample1": 959,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample2": 968,
  "SlateportCity_OceanicMuseum_2F_EventScript_PressureExperiment": 977,
  "SlateportCity_OceanicMuseum_2F_EventScript_HoennModel": 986,
  "SlateportCity_OceanicMuseum_2F_EventScript_DeepSeawaterDisplay": 995,
  "SlateportCity_OceanicMuseum_2F_EventScript_SurfaceSeawaterDisplay": 1004,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica": 1013,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica": 1022,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmersibleReplica": 1031,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSAnneReplica": 1040,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron1": 1049,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron2": 1058,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron3": 1067,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,16,0,0,0,0,0,10,0,105,52,163,1,1,86,0,0,87,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,35,12,128,1,0,34,12,128,1,0,35,12,128,4,0,34,12,128,4,0,16,0,0,0,0,0,10,0,35,12,128,4,0,34,12,128,4,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,105,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,93,3,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,4,35,86,0,0,87,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,191,3,0,0,81,0,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,53,0,0,54,152,1,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,152,0,4,30,42,115,3,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,113,4,13,1,88,0,0,0,0,16,0,0,0,0,0,10,0,105,152,1,50,112,1,51,38,0,0,0,84,0,0,85,0,0,0,0,42,132,3,35,218,64,0,0,34,218,64,0,0,42,149,0,43,179,3,42,181,3,113,210,1,0,152,0,109,90,113,218,1,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,191,3,0,0,81,255,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,191,3,0,0,81,255,0,191,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90] as const;

export const STATS = { ops: 204, bytes: 1104, labels: 32, unknownOps: 16, unresolvedSymbols: 44 } as const;
