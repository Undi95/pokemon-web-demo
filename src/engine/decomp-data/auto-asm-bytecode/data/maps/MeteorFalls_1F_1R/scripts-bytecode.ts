// AUTO-GENERATED from data/maps/MeteorFalls_1F_1R/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=194, bytes=889, labels=19, unknownOps=0, unresolvedSymbols=23

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MeteorFalls_1F_1R_MapScripts": 0,
  "MeteorFalls_1F_1R_OnLoad": 5,
  "MeteorFalls_1F_1R_EventScript_OpenStevensCave": 15,
  "MeteorFalls_1F_1R_EventScript_MagmaStealsMeteoriteScene": 52,
  "MeteorFalls_1F_1R_Movement_MagmaGruntApproachPlayer": 754,
  "MeteorFalls_1F_1R_Movement_MagmaGrunt1Exit": 758,
  "MeteorFalls_1F_1R_Movement_MagmaGrunt2Exit": 768,
  "MeteorFalls_1F_1R_Movement_ArchieArrive": 779,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1Arrive": 786,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2Arrive": 794,
  "MeteorFalls_1F_1R_Movement_ArchieExit": 802,
  "MeteorFalls_1F_1R_Movement_ArchieApproachPlayer": 810,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1Exit": 816,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1ApproachArchie": 826,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2Exit": 831,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2ApproachArchie": 842,
  "MeteorFalls_1F_1R_Movement_PushPlayerOutOfWay": 847,
  "MeteorFalls_1F_1R_EventScript_ProfCozmo": 855,
  "MeteorFalls_1F_1R_EventScript_MetCozmo": 879,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,5,0,0,0,44,0,0,8,1,15,0,0,0,3,163,4,0,1,0,70,2,1,0,163,3,0,2,0,77,2,1,0,163,4,0,2,0,78,2,0,0,163,5,0,2,0,79,2,1,0,4,106,52,185,1,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,30,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,242,2,0,0,81,0,0,242,2,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,52,163,1,0,80,0,0,11,3,0,0,81,0,0,11,3,0,0,0,0,80,0,0,18,3,0,0,81,0,0,18,3,0,0,0,0,80,0,0,26,3,0,0,81,0,0,26,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,79,3,0,0,81,255,0,79,3,0,0,0,0,80,0,0,246,2,0,0,81,0,0,246,2,0,0,0,0,80,0,0,0,3,0,0,81,0,0,0,3,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,42,3,0,0,81,0,0,42,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,58,3,0,0,81,0,0,58,3,0,0,0,0,80,0,0,74,3,0,0,81,0,0,74,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,34,3,0,0,81,0,0,34,3,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,80,0,0,63,3,0,0,81,0,0,63,3,0,0,0,0,82,0,0,83,0,0,0,0,54,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,42,51,3,42,207,0,42,255,2,23,191,64,1,0,108,3,11,11,38,254,22,22,24,24,24,24,24,24,24,254,22,22,22,24,24,24,24,24,24,24,254,11,11,11,11,11,11,254,20,20,11,11,11,11,11,254,20,20,11,11,11,11,11,254,11,11,11,11,11,11,11,254,11,11,9,9,39,254,9,9,11,11,11,11,11,11,11,254,11,11,11,38,254,9,9,9,11,11,11,11,11,11,11,254,11,11,11,38,254,37,18,40,64,10,65,3,254,107,91,44,244,0,7,1,111,3,0,0,42,244,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 194, bytes: 889, labels: 19, unknownOps: 0, unresolvedSymbols: 23 } as const;
