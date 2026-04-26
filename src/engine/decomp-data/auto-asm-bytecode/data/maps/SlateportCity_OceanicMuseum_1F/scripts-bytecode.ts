// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=147, bytes=798, labels=38, unknownOps=0, unresolvedSymbols=40

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_OceanicMuseum_1F_MapScripts": 0,
  "SlateportCity_OceanicMuseum_1F_EventScript_EntranceAttendant": 0,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeLeft": 9,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeRight": 40,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFee": 71,
  "SlateportCity_OceanicMuseum_1F_EventScript_CheckMoneyForFee": 135,
  "SlateportCity_OceanicMuseum_1F_EventScript_NotEnoughMoney": 193,
  "SlateportCity_OceanicMuseum_1F_EventScript_AllowEntranceAnyway": 240,
  "SlateportCity_OceanicMuseum_1F_Movement_PushPlayerBackFromCounter": 257,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt1": 259,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt2": 268,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt3": 277,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt4": 286,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt5": 295,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt6": 304,
  "SlateportCity_OceanicMuseum_1F_EventScript_WhirlpoolExperiment": 313,
  "SlateportCity_OceanicMuseum_1F_EventScript_WaterfallExperiment": 322,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanSoilDisplay": 331,
  "SlateportCity_OceanicMuseum_1F_EventScript_BeachSandDisplay": 340,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact1": 349,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact2": 358,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact3": 367,
  "SlateportCity_OceanicMuseum_1F_EventScript_FossilDisplay": 376,
  "SlateportCity_OceanicMuseum_1F_EventScript_DepthMeasuringMachine": 385,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron1": 394,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron2": 403,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron3": 412,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron4": 421,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGrunt": 430,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitNorth": 628,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitSouth": 674,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitWestEast": 704,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited": 750,
  "SlateportCity_OceanicMuseum_1F_EventScript_NoRoomForThief": 766,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitNorth": 776,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitWestEast": 781,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExit": 784,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExitNorth": 791,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,0,90,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,71,0,0,0,90,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,71,0,0,0,90,148,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,135,0,0,0,7,1,13,128,0,0,105,149,0,0,80,255,0,1,1,0,0,81,255,0,1,1,0,0,0,0,82,0,0,83,0,0,0,0,108,90,147,50,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,193,0,0,0,7,1,13,128,0,0,9,95,0,146,50,0,0,0,0,150,0,0,0,16,0,0,0,0,0,10,0,113,170,1,0,149,0,0,108,90,44,149,0,7,0,240,0,0,0,16,0,0,0,0,0,10,0,105,149,0,0,80,255,0,1,1,0,0,81,255,0,1,1,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,0,113,170,1,0,149,0,0,108,90,8,254,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,4,8,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,254,2,0,0,7,1,13,128,0,0,42,13,1,16,0,0,0,0,0,10,0,105,35,12,128,2,0,34,12,128,2,0,7,1,116,2,0,0,7,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,7,1,162,2,0,0,7,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,7,1,192,2,0,0,7,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,7,1,192,2,0,0,7,1,12,128,0,0,90,80,255,0,8,3,0,0,81,255,0,8,3,0,0,0,0,80,0,0,23,3,0,0,81,0,0,23,3,0,0,0,0,82,0,0,83,0,0,0,0,89,238,2,0,0,90,80,0,0,16,3,0,0,81,0,0,16,3,0,0,0,0,82,0,0,83,0,0,0,0,89,238,2,0,0,90,80,255,0,13,3,0,0,81,255,0,13,3,0,0,0,0,80,0,0,16,3,0,0,81,0,0,16,3,0,0,0,0,82,0,0,83,0,0,0,0,89,238,2,0,0,90,42,197,3,9,9,0,84,0,0,85,0,0,0,0,109,90,16,0,0,0,0,0,10,0,109,90,20,19,18,37,254,20,37,254,0,21,21,21,21,19,254,24,21,21,21,21,19,254] as const;

export const STATS = { ops: 147, bytes: 798, labels: 38, unknownOps: 0, unresolvedSymbols: 40 } as const;
