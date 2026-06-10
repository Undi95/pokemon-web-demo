// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=204, bytes=1262, labels=32, unknownOps=0, unresolvedSymbols=73

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_OceanicMuseum_2F_MapScripts": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_CaptStern": 0,
  "SlateportCity_OceanicMuseum_2F_EventScript_ReadyRegisterBirch": 935,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerFaceGrunts": 941,
  "SlateportCity_OceanicMuseum_2F_EventScript_SternFaceGrunts": 966,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntSouth": 991,
  "SlateportCity_OceanicMuseum_2F_EventScript_PlayerApproachGruntWest": 1016,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntSouth": 1041,
  "SlateportCity_OceanicMuseum_2F_Movement_PlayerApproachGruntWest": 1045,
  "SlateportCity_OceanicMuseum_2F_Movement_Unused": 1051,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieApproachPlayer": 1065,
  "SlateportCity_OceanicMuseum_2F_Movement_ArchieEnter": 1067,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntApproachToBattle": 1077,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntEnter": 1079,
  "SlateportCity_OceanicMuseum_2F_Movement_FirstGruntApproach": 1083,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntDefeated": 1090,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntEnter": 1094,
  "SlateportCity_OceanicMuseum_2F_Movement_SecondGruntApproach": 1096,
  "SlateportCity_OceanicMuseum_2F_Movement_GruntMoveForArchie": 1105,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample1": 1117,
  "SlateportCity_OceanicMuseum_2F_EventScript_WaterQualitySample2": 1126,
  "SlateportCity_OceanicMuseum_2F_EventScript_PressureExperiment": 1135,
  "SlateportCity_OceanicMuseum_2F_EventScript_HoennModel": 1144,
  "SlateportCity_OceanicMuseum_2F_EventScript_DeepSeawaterDisplay": 1153,
  "SlateportCity_OceanicMuseum_2F_EventScript_SurfaceSeawaterDisplay": 1162,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSTidalReplica": 1171,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmarineReplica": 1180,
  "SlateportCity_OceanicMuseum_2F_EventScript_SubmersibleReplica": 1189,
  "SlateportCity_OceanicMuseum_2F_EventScript_SSAnneReplica": 1198,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron1": 1207,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron2": 1216,
  "SlateportCity_OceanicMuseum_2F_EventScript_MuseumPatron3": 1225,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,16,0,0,0,0,0,10,4,105,52,163,1,1,86,0,0,87,0,0,0,0,80,0,0,55,4,0,0,81,0,0,55,4,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,70,4,0,0,81,0,0,70,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,59,4,0,0,81,0,0,59,4,0,0,0,0,80,0,0,72,4,0,0,81,0,0,72,4,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,173,3,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,173,3,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,35,0,0,0,0,34,0,0,0,0,8,5,198,3,0,0,8,5,0,0,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,105,80,0,0,53,4,0,0,81,0,0,53,4,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,223,3,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,248,3,0,0,8,1,0,0,0,0,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,66,4,0,0,81,0,0,66,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,53,4,0,0,81,0,0,53,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,66,4,0,0,81,0,0,66,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,41,35,0,86,0,0,87,0,0,0,0,80,0,0,43,4,0,0,81,0,0,43,4,0,0,0,0,80,0,0,81,4,0,0,81,0,0,81,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,41,4,0,0,81,0,0,41,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,53,0,0,54,152,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,152,0,41,30,0,42,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,0,0,0,0,16,0,0,0,0,0,10,4,105,152,0,50,112,1,51,38,0,0,0,84,0,0,85,0,0,0,0,42,0,0,35,0,0,0,0,34,0,0,0,0,8,1,167,3,0,0,8,1,0,0,0,0,42,0,0,43,0,0,42,0,0,23,0,0,1,0,152,0,109,3,23,0,0,1,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,17,4,0,0,81,0,0,17,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,21,4,0,0,81,0,0,21,4,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3] as const;

export const STATS = { ops: 204, bytes: 1262, labels: 32, unknownOps: 0, unresolvedSymbols: 73 } as const;
