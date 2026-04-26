// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=147, bytes=714, labels=38, unknownOps=2, unresolvedSymbols=40

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_OceanicMuseum_1F_MapScripts": 0,
  "SlateportCity_OceanicMuseum_1F_EventScript_EntranceAttendant": 0,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeLeft": 9,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeRight": 40,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFee": 71,
  "SlateportCity_OceanicMuseum_1F_EventScript_CheckMoneyForFee": 123,
  "SlateportCity_OceanicMuseum_1F_EventScript_NotEnoughMoney": 169,
  "SlateportCity_OceanicMuseum_1F_EventScript_AllowEntranceAnyway": 216,
  "SlateportCity_OceanicMuseum_1F_Movement_PushPlayerBackFromCounter": 233,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt1": 235,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt2": 244,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt3": 253,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt4": 262,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt5": 271,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt6": 280,
  "SlateportCity_OceanicMuseum_1F_EventScript_WhirlpoolExperiment": 289,
  "SlateportCity_OceanicMuseum_1F_EventScript_WaterfallExperiment": 298,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanSoilDisplay": 307,
  "SlateportCity_OceanicMuseum_1F_EventScript_BeachSandDisplay": 316,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact1": 325,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact2": 334,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact3": 343,
  "SlateportCity_OceanicMuseum_1F_EventScript_FossilDisplay": 352,
  "SlateportCity_OceanicMuseum_1F_EventScript_DepthMeasuringMachine": 361,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron1": 370,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron2": 379,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron3": 388,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron4": 397,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGrunt": 406,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitNorth": 544,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitSouth": 590,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitWestEast": 620,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited": 666,
  "SlateportCity_OceanicMuseum_1F_EventScript_NoRoomForThief": 682,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitNorth": 692,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitWestEast": 697,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExit": 700,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExitNorth": 707,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,0,90,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,71,0,0,0,90,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,71,0,0,0,90,148,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,105,149,0,0,80,255,0,233,0,0,0,81,255,0,233,0,0,0,0,0,82,0,0,83,0,0,0,0,108,90,147,50,0,0,0,0,35,13,128,0,0,34,13,128,0,0,9,95,0,146,50,0,0,0,0,150,0,0,0,16,0,0,0,0,0,10,0,113,170,1,0,149,0,0,108,90,44,149,0,7,0,216,0,0,0,16,0,0,0,0,0,10,0,105,149,0,0,80,255,0,233,0,0,0,81,255,0,233,0,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,0,113,170,1,0,149,0,0,108,90,8,254,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,4,8,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,13,1,16,0,0,0,0,0,10,0,105,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,90,80,255,0,180,2,0,0,81,255,0,180,2,0,0,0,0,80,0,0,195,2,0,0,81,0,0,195,2,0,0,0,0,82,0,0,83,0,0,0,0,89,154,2,0,0,90,80,0,0,188,2,0,0,81,0,0,188,2,0,0,0,0,82,0,0,83,0,0,0,0,89,154,2,0,0,90,80,255,0,185,2,0,0,81,255,0,185,2,0,0,0,0,80,0,0,188,2,0,0,81,0,0,188,2,0,0,0,0,82,0,0,83,0,0,0,0,89,154,2,0,0,90,42,197,3,9,9,0,84,0,0,85,0,0,0,0,109,90,16,0,0,0,0,0,10,0,109,90,20,19,18,37,254,20,37,254,0,21,21,21,21,19,254,24,21,21,21,21,19,254] as const;

export const STATS = { ops: 147, bytes: 714, labels: 38, unknownOps: 2, unresolvedSymbols: 40 } as const;
