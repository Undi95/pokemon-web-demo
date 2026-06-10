// AUTO-GENERATED from data/maps/SlateportCity_OceanicMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=147, bytes=801, labels=38, unknownOps=0, unresolvedSymbols=57

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_OceanicMuseum_1F_MapScripts": 0,
  "SlateportCity_OceanicMuseum_1F_EventScript_EntranceAttendant": 0,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeLeft": 9,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFeeRight": 40,
  "SlateportCity_OceanicMuseum_1F_EventScript_PayEntranceFee": 71,
  "SlateportCity_OceanicMuseum_1F_EventScript_CheckMoneyForFee": 135,
  "SlateportCity_OceanicMuseum_1F_EventScript_NotEnoughMoney": 194,
  "SlateportCity_OceanicMuseum_1F_EventScript_AllowEntranceAnyway": 241,
  "SlateportCity_OceanicMuseum_1F_Movement_PushPlayerBackFromCounter": 259,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt1": 261,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt2": 270,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt3": 279,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt4": 288,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt5": 297,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumGrunt6": 306,
  "SlateportCity_OceanicMuseum_1F_EventScript_WhirlpoolExperiment": 315,
  "SlateportCity_OceanicMuseum_1F_EventScript_WaterfallExperiment": 324,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanSoilDisplay": 333,
  "SlateportCity_OceanicMuseum_1F_EventScript_BeachSandDisplay": 342,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact1": 351,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact2": 360,
  "SlateportCity_OceanicMuseum_1F_EventScript_OceanicMinifact3": 369,
  "SlateportCity_OceanicMuseum_1F_EventScript_FossilDisplay": 378,
  "SlateportCity_OceanicMuseum_1F_EventScript_DepthMeasuringMachine": 387,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron1": 396,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron2": 405,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron3": 414,
  "SlateportCity_OceanicMuseum_1F_EventScript_MuseumPatron4": 423,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGrunt": 432,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitNorth": 631,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitSouth": 677,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExitWestEast": 707,
  "SlateportCity_OceanicMuseum_1F_EventScript_FamiliarGruntExited": 753,
  "SlateportCity_OceanicMuseum_1F_EventScript_NoRoomForThief": 769,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitNorth": 779,
  "SlateportCity_OceanicMuseum_1F_Movement_PlayerWatchGruntExitWestEast": 784,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExit": 787,
  "SlateportCity_OceanicMuseum_1F_Movement_FamiliarGruntExitNorth": 794,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,2,3,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,6,71,0,0,0,3,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,6,71,0,0,0,3,148,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,135,0,0,0,7,1,0,0,0,0,105,149,0,0,80,0,0,3,1,0,0,81,0,0,3,1,0,0,0,0,82,0,0,83,0,0,0,0,108,3,147,50,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,194,0,0,0,7,1,0,0,0,0,48,0,0,146,50,0,0,0,0,150,0,0,0,16,0,0,0,0,0,10,4,23,0,0,1,0,149,0,0,108,3,44,0,0,7,0,241,0,0,0,16,0,0,0,0,0,10,4,105,149,0,0,80,0,0,3,1,0,0,81,0,0,3,1,0,0,0,0,82,0,0,83,0,0,0,0,108,3,16,0,0,0,0,0,10,4,23,0,0,1,0,149,0,0,108,3,0,0,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,41,8,0,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,1,3,0,0,7,1,0,0,0,0,42,0,0,16,0,0,0,0,0,10,4,105,35,0,0,0,0,34,0,0,0,0,7,1,119,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,165,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,195,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,195,2,0,0,7,1,0,0,0,0,3,80,0,0,11,3,0,0,81,0,0,11,3,0,0,0,0,80,0,0,26,3,0,0,81,0,0,26,3,0,0,0,0,82,0,0,83,0,0,0,0,6,241,2,0,0,3,80,0,0,19,3,0,0,81,0,0,19,3,0,0,0,0,82,0,0,83,0,0,0,0,6,241,2,0,0,3,80,0,0,16,3,0,0,81,0,0,16,3,0,0,0,0,80,0,0,19,3,0,0,81,0,0,19,3,0,0,0,0,82,0,0,83,0,0,0,0,6,241,2,0,0,3,42,0,0,48,0,0,84,0,0,85,0,0,0,0,109,3,16,0,0,0,0,0,10,4,109,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 147, bytes: 801, labels: 38, unknownOps: 0, unresolvedSymbols: 57 } as const;
