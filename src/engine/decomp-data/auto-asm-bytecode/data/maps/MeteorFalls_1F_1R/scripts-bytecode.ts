// AUTO-GENERATED from data/maps/MeteorFalls_1F_1R/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=194, bytes=785, labels=19, unknownOps=16, unresolvedSymbols=26

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MeteorFalls_1F_1R_MapScripts": 0,
  "MeteorFalls_1F_1R_OnLoad": 5,
  "MeteorFalls_1F_1R_EventScript_OpenStevensCave": 15,
  "MeteorFalls_1F_1R_EventScript_MagmaStealsMeteoriteScene": 51,
  "MeteorFalls_1F_1R_Movement_MagmaGruntApproachPlayer": 751,
  "MeteorFalls_1F_1R_Movement_MagmaGrunt1Exit": 751,
  "MeteorFalls_1F_1R_Movement_MagmaGrunt2Exit": 751,
  "MeteorFalls_1F_1R_Movement_ArchieArrive": 751,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1Arrive": 751,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2Arrive": 751,
  "MeteorFalls_1F_1R_Movement_ArchieExit": 751,
  "MeteorFalls_1F_1R_Movement_ArchieApproachPlayer": 751,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1Exit": 751,
  "MeteorFalls_1F_1R_Movement_AquaGrunt1ApproachArchie": 751,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2Exit": 751,
  "MeteorFalls_1F_1R_Movement_AquaGrunt2ApproachArchie": 751,
  "MeteorFalls_1F_1R_Movement_PushPlayerOutOfWay": 751,
  "MeteorFalls_1F_1R_EventScript_ProfCozmo": 751,
  "MeteorFalls_1F_1R_EventScript_MetCozmo": 775,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,5,0,0,0,44,0,0,8,1,15,0,0,0,90,163,4,0,1,0,70,2,1,0,163,3,0,2,0,77,2,1,0,163,4,0,2,0,78,2,0,0,163,5,0,2,0,79,2,1,0,106,52,185,1,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,52,163,1,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,239,2,0,0,81,255,0,239,2,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,80,0,0,239,2,0,0,81,0,0,239,2,0,0,0,0,82,0,0,83,0,0,0,0,54,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,42,51,3,42,207,0,42,255,2,113,191,1,0,108,90,107,91,44,244,0,7,1,7,3,0,0,42,244,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 194, bytes: 785, labels: 19, unknownOps: 16, unresolvedSymbols: 26 } as const;
