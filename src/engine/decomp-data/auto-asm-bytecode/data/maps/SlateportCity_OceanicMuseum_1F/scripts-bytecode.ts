// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=147, bytes=690, labels=38, unknownOps=11, unresolvedSymbols=40

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
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt1": 233,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt2": 242,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt3": 251,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt4": 260,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt5": 269,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt6": 278,
  "SlateportCity_OceanicMuseum_1F_EventScript_WhirlpoolExperiment": 287,
  "SlateportCity_OceanicMuseum_1F_EventScript_WaterfallExperiment": 296,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanSoilDisplay": 305,
  "SlateportCity_OceanicMuseum_1F_EventScript_BeachSandDisplay": 314,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact1": 323,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact2": 332,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact3": 341,
  "SlateportCity_OceanicMuseum_1F_EventScript_FossilDisplay": 350,
  "SlateportCity_OceanicMuseum_1F_EventScript_DepthMeasuringMachine": 359,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron1": 368,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron2": 377,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron3": 386,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron4": 395,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGrunt": 404,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitNorth": 542,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitSouth": 588,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitWestEast": 618,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited": 664,
  "SlateportCity_OceanicMuseum_1F_EventScript_NoRoomForThief": 680,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitNorth": 690,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitWestEast": 690,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExit": 690,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExitNorth": 690,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,0,90,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,71,0,0,0,90,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,71,0,0,0,90,148,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,105,149,0,0,80,255,0,233,0,0,0,81,255,0,233,0,0,0,0,0,82,0,0,83,0,0,0,0,108,90,147,50,0,0,0,0,35,13,128,0,0,34,13,128,0,0,9,95,0,146,50,0,0,0,0,150,0,0,0,16,0,0,0,0,0,10,0,113,170,1,0,149,0,0,108,90,44,149,0,7,0,216,0,0,0,16,0,0,0,0,0,10,0,105,149,0,0,80,255,0,233,0,0,0,81,255,0,233,0,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,0,113,170,1,0,149,0,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,4,8,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,13,1,16,0,0,0,0,0,10,0,105,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,90,80,255,0,178,2,0,0,81,255,0,178,2,0,0,0,0,80,0,0,178,2,0,0,81,0,0,178,2,0,0,0,0,82,0,0,83,0,0,0,0,89,152,2,0,0,90,80,0,0,178,2,0,0,81,0,0,178,2,0,0,0,0,82,0,0,83,0,0,0,0,89,152,2,0,0,90,80,255,0,178,2,0,0,81,255,0,178,2,0,0,0,0,80,0,0,178,2,0,0,81,0,0,178,2,0,0,0,0,82,0,0,83,0,0,0,0,89,152,2,0,0,90,42,197,3,9,9,0,84,0,0,85,0,0,0,0,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 147, bytes: 690, labels: 38, unknownOps: 11, unresolvedSymbols: 40 } as const;
