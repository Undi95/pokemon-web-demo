// AUTO-GENERATED from data/maps/MeteorFalls_1F_1R/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=194, bytes=887, labels=19, unknownOps=0, unresolvedSymbols=25

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MeteorFalls_1F_1R_MapScripts": 0,
  "MeteorFalls_1F_1R_OnLoad": 5,
  "MeteorFalls_1F_1R_EventScript_OpenStevensCave": 15,
  "MeteorFalls_1F_1R_EventScript_MagmaStealsMeteoriteScene": 52,
  "MeteorFalls_1F_1R_Movement_MagmaGruntApproachPlayer": 752,
  "MeteorFalls_1F_1R_Movement_MagmaGrunt1Exit": 756,
  "MeteorFalls_1F_1R_Movement_MagmaGrunt2Exit": 766,
  "MeteorFalls_1F_1R_Movement_ArchieArrive": 777,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1Arrive": 784,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2Arrive": 792,
  "MeteorFalls_1F_1R_Movement_ArchieExit": 800,
  "MeteorFalls_1F_1R_Movement_ArchieApproachPlayer": 808,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1Exit": 814,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1ApproachArchie": 824,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2Exit": 829,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2ApproachArchie": 840,
  "MeteorFalls_1F_1R_Movement_PushPlayerOutOfWay": 845,
  "MeteorFalls_1F_1R_EventScript_ProfCozmo": 853,
  "MeteorFalls_1F_1R_EventScript_MetCozmo": 877,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,5,0,0,0,44,0,0,8,1,15,0,0,0,90,163,4,0,1,0,70,2,1,0,163,3,0,2,0,77,2,1,0,163,4,0,2,0,78,2,0,0,163,5,0,2,0,79,2,1,0,15,106,52,185,1,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,240,2,0,0,81,0,0,240,2,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,52,163,1,0,80,0,0,9,3,0,0,81,0,0,9,3,0,0,0,0,80,0,0,16,3,0,0,81,0,0,16,3,0,0,0,0,80,0,0,24,3,0,0,81,0,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,77,3,0,0,81,255,0,77,3,0,0,0,0,80,0,0,244,2,0,0,81,0,0,244,2,0,0,0,0,80,0,0,254,2,0,0,81,0,0,254,2,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,40,3,0,0,81,0,0,40,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,56,3,0,0,81,0,0,56,3,0,0,0,0,80,0,0,72,3,0,0,81,0,0,72,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,32,3,0,0,81,0,0,32,3,0,0,0,0,80,0,0,46,3,0,0,81,0,0,46,3,0,0,0,0,80,0,0,61,3,0,0,81,0,0,61,3,0,0,0,0,82,0,0,83,0,0,0,0,54,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,42,51,3,42,207,0,42,255,2,113,191,1,0,108,90,11,11,38,254,22,22,24,24,24,24,24,24,24,254,22,22,22,24,24,24,24,24,24,24,254,11,11,11,11,11,11,254,20,20,11,11,11,11,11,254,20,20,11,11,11,11,11,254,11,11,11,11,11,11,11,254,11,11,9,9,39,254,9,9,11,11,11,11,11,11,11,254,11,11,11,38,254,9,9,9,11,11,11,11,11,11,11,254,11,11,11,38,254,37,18,40,64,10,65,3,254,107,91,44,244,0,7,1,109,3,0,0,42,244,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90] as const;

export const STATS = { ops: 194, bytes: 887, labels: 19, unknownOps: 0, unresolvedSymbols: 25 } as const;
