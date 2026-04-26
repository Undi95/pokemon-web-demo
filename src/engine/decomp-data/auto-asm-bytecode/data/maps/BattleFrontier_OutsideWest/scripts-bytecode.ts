// AUTO-GENERATED from data/maps/BattleFrontier_OutsideWest/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=196, bytes=1009, labels=50, unknownOps=2, unresolvedSymbols=68

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideWest_MapScripts": 0,
  "BattleFrontier_OutsideWest_OnTransition": 5,
  "BattleFrontier_OutsideWest_EventScript_FerryAttendant": 13,
  "BattleFrontier_OutsideWest_EventScript_ChooseFerryDestination": 52,
  "BattleFrontier_OutsideWest_EventScript_NoSSTicket": 144,
  "BattleFrontier_OutsideWest_EventScript_FerryToSlateport": 154,
  "BattleFrontier_OutsideWest_EventScript_FerryToLilycove": 211,
  "BattleFrontier_OutsideWest_EventScript_ChooseNewFerryDestination": 268,
  "BattleFrontier_OutsideWest_EventScript_BoardFerry": 282,
  "BattleFrontier_OutsideWest_EventScript_CancelFerrySelect": 324,
  "BattleFrontier_OutsideWest_EventScript_BattleDomeSign": 334,
  "BattleFrontier_OutsideWest_EventScript_BattleFactorySign": 343,
  "BattleFrontier_OutsideWest_EventScript_BattlePikeSign": 352,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC1": 361,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC2": 370,
  "BattleFrontier_OutsideWest_EventScript_Boy1": 379,
  "BattleFrontier_OutsideWest_EventScript_Fisherman2": 388,
  "BattleFrontier_OutsideWest_EventScript_Man1": 425,
  "BattleFrontier_OutsideWest_EventScript_Maniac1": 434,
  "BattleFrontier_OutsideWest_EventScript_Maniac2": 441,
  "BattleFrontier_OutsideWest_EventScript_FactoryChallengersTalk": 448,
  "BattleFrontier_OutsideWest_EventScript_Camper": 557,
  "BattleFrontier_OutsideWest_EventScript_CamperFaceFactory": 611,
  "BattleFrontier_OutsideWest_EventScript_CamperAlreadyFacingFactory": 636,
  "BattleFrontier_OutsideWest_EventScript_Girl": 637,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderNorth": 690,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderSouth": 715,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderWest": 740,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderEast": 765,
  "BattleFrontier_OutsideWest_Movement_GirlShudderNorth": 790,
  "BattleFrontier_OutsideWest_Movement_GirlShudderSouth": 793,
  "BattleFrontier_OutsideWest_Movement_GirlShudderWest": 796,
  "BattleFrontier_OutsideWest_Movement_GirlShudderEast": 799,
  "BattleFrontier_OutsideWest_EventScript_Woman2": 802,
  "BattleFrontier_OutsideWest_EventScript_WomanWonRockPaperScissors": 831,
  "BattleFrontier_OutsideWest_EventScript_WomanLostRockPaperScissors": 841,
  "BattleFrontier_OutsideWest_EventScript_Fisherman1": 851,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC3": 860,
  "BattleFrontier_OutsideWest_EventScript_Gentleman": 869,
  "BattleFrontier_OutsideWest_EventScript_Lass": 878,
  "BattleFrontier_OutsideWest_EventScript_ExpertM": 887,
  "BattleFrontier_OutsideWest_EventScript_Man2": 896,
  "BattleFrontier_OutsideWest_EventScript_Woman1": 905,
  "BattleFrontier_OutsideWest_EventScript_FatMan1": 914,
  "BattleFrontier_OutsideWest_EventScript_FatMan2": 923,
  "BattleFrontier_OutsideWest_EventScript_Woman3": 932,
  "BattleFrontier_OutsideWest_EventScript_Boy2": 943,
  "BattleFrontier_OutsideWest_EventScript_OldMan": 954,
  "BattleFrontier_OutsideWest_EventScript_Man4": 963,
  "BattleFrontier_OutsideWest_EventScript_PokefanF": 1000,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,113,188,0,0,42,150,3,90,107,91,16,0,0,0,0,0,10,0,72,9,1,1,0,35,13,128,0,0,34,13,128,0,0,104,0,0,0,0,0,0,0,89,52,0,0,0,90,113,18,6,53,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,154,0,0,0,34,154,0,0,0,35,0,128,1,0,34,0,128,1,0,35,211,0,0,0,34,211,0,0,0,35,0,128,2,0,34,0,128,2,0,35,68,1,0,0,34,68,1,0,0,35,0,128,127,0,34,0,128,127,0,35,68,1,0,0,34,68,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,88,26,1,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,88,26,1,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,104,0,0,0,0,0,0,0,89,52,0,0,0,90,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,90,0,0,0,0,113,4,0,0,88,0,0,0,0,15,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,104,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,110,109,90,16,0,0,0,0,0,10,0,90,107,89,192,1,0,0,90,107,89,192,1,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,4,25,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,4,20,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,16,0,0,0,0,0,10,0,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,15,107,91,104,0,0,0,0,0,0,0,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,110,109,90,80,0,0,22,3,0,0,81,0,0,22,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,25,3,0,0,81,0,0,25,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,28,3,0,0,81,0,0,28,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,31,3,0,0,81,0,0,31,3,0,0,0,0,82,0,0,83,0,0,0,0,15,37,37,254,38,38,254,40,40,254,39,39,254,107,91,16,0,0,0,0,0,10,0,144,2,0,35,13,128,1,0,34,13,128,1,0,89,73,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 196, bytes: 1009, labels: 50, unknownOps: 2, unresolvedSymbols: 68 } as const;
