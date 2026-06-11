// AUTO-GENERATED from data/maps/BattleFrontier_OutsideWest/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=196, bytes=1198, labels=50, unknownOps=0, unresolvedSymbols=78

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideWest_MapScripts": 0,
  "BattleFrontier_OutsideWest_OnTransition": 5,
  "BattleFrontier_OutsideWest_EventScript_FerryAttendant": 14,
  "BattleFrontier_OutsideWest_EventScript_ChooseFerryDestination": 63,
  "BattleFrontier_OutsideWest_EventScript_NoSSTicket": 203,
  "BattleFrontier_OutsideWest_EventScript_FerryToSlateport": 213,
  "BattleFrontier_OutsideWest_EventScript_FerryToLilycove": 282,
  "BattleFrontier_OutsideWest_EventScript_ChooseNewFerryDestination": 351,
  "BattleFrontier_OutsideWest_EventScript_BoardFerry": 363,
  "BattleFrontier_OutsideWest_EventScript_CancelFerrySelect": 407,
  "BattleFrontier_OutsideWest_EventScript_BattleDomeSign": 417,
  "BattleFrontier_OutsideWest_EventScript_BattleFactorySign": 426,
  "BattleFrontier_OutsideWest_EventScript_BattlePikeSign": 435,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC1": 444,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC2": 453,
  "BattleFrontier_OutsideWest_EventScript_Boy1": 462,
  "BattleFrontier_OutsideWest_EventScript_Fisherman2": 471,
  "BattleFrontier_OutsideWest_EventScript_Man1": 506,
  "BattleFrontier_OutsideWest_EventScript_Maniac1": 515,
  "BattleFrontier_OutsideWest_EventScript_Maniac2": 522,
  "BattleFrontier_OutsideWest_EventScript_FactoryChallengersTalk": 529,
  "BattleFrontier_OutsideWest_EventScript_Camper": 639,
  "BattleFrontier_OutsideWest_EventScript_CamperFaceFactory": 742,
  "BattleFrontier_OutsideWest_EventScript_CamperAlreadyFacingFactory": 767,
  "BattleFrontier_OutsideWest_EventScript_Girl": 768,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderNorth": 867,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderSouth": 892,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderWest": 917,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderEast": 942,
  "BattleFrontier_OutsideWest_Movement_GirlShudderNorth": 967,
  "BattleFrontier_OutsideWest_Movement_GirlShudderSouth": 970,
  "BattleFrontier_OutsideWest_Movement_GirlShudderWest": 973,
  "BattleFrontier_OutsideWest_Movement_GirlShudderEast": 976,
  "BattleFrontier_OutsideWest_EventScript_Woman2": 979,
  "BattleFrontier_OutsideWest_EventScript_WomanWonRockPaperScissors": 1020,
  "BattleFrontier_OutsideWest_EventScript_WomanLostRockPaperScissors": 1030,
  "BattleFrontier_OutsideWest_EventScript_Fisherman1": 1040,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC3": 1049,
  "BattleFrontier_OutsideWest_EventScript_Gentleman": 1058,
  "BattleFrontier_OutsideWest_EventScript_Lass": 1067,
  "BattleFrontier_OutsideWest_EventScript_ExpertM": 1076,
  "BattleFrontier_OutsideWest_EventScript_Man2": 1085,
  "BattleFrontier_OutsideWest_EventScript_Woman1": 1094,
  "BattleFrontier_OutsideWest_EventScript_FatMan1": 1103,
  "BattleFrontier_OutsideWest_EventScript_FatMan2": 1112,
  "BattleFrontier_OutsideWest_EventScript_Woman3": 1121,
  "BattleFrontier_OutsideWest_EventScript_Boy2": 1132,
  "BattleFrontier_OutsideWest_EventScript_OldMan": 1143,
  "BattleFrontier_OutsideWest_EventScript_Man4": 1152,
  "BattleFrontier_OutsideWest_EventScript_PokefanF": 1189,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,5,0,0,0,23,0,0,0,0,42,0,0,3,107,91,16,0,0,0,0,0,10,4,72,0,0,1,0,35,0,0,0,0,34,0,0,0,0,7,1,203,0,0,0,7,1,0,0,0,0,104,0,0,0,0,103,6,63,0,0,0,3,113,18,6,0,2,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,213,0,0,0,34,213,0,0,0,7,1,0,0,0,0,7,1,213,0,0,0,35,0,0,1,0,34,0,0,1,0,35,26,1,0,0,34,26,1,0,0,7,1,0,0,0,0,7,1,26,1,0,0,35,0,0,2,0,34,0,0,2,0,35,151,1,0,0,34,151,1,0,0,7,1,0,0,0,0,7,1,151,1,0,0,35,0,0,0,0,34,0,0,0,0,35,151,1,0,0,34,151,1,0,0,7,1,0,0,0,0,7,1,151,1,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,95,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,5,107,1,0,0,58,0,0,0,255,255,255,255,8,255,255,255,255,0,8,0,11,0,8,11,0,0,0,0,109,3,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,95,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,5,107,1,0,0,58,0,0,0,255,255,255,255,8,255,255,255,255,0,8,0,11,0,8,11,0,0,0,0,109,3,104,0,0,0,0,103,6,63,0,0,0,3,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,30,0,90,0,0,0,0,23,0,0,0,0,5,0,0,0,0,4,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,104,0,0,0,0,103,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,110,109,3,16,0,0,0,0,0,10,2,3,107,6,17,2,0,0,3,107,6,17,2,0,0,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,41,25,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,107,91,41,20,0,35,0,0,0,0,34,0,0,0,0,8,1,230,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,255,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,230,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,230,2,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,4,107,91,104,0,0,0,0,103,35,0,0,0,0,34,0,0,0,0,8,1,99,3,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,124,3,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,149,3,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,174,3,0,0,8,1,0,0,0,0,110,109,3,80,0,0,199,3,0,0,81,0,0,199,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,202,3,0,0,81,0,0,202,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,205,3,0,0,81,0,0,205,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,208,3,0,0,81,0,0,208,3,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,107,91,16,0,0,0,0,0,10,4,144,2,0,35,0,0,1,0,34,0,0,1,0,7,1,252,3,0,0,7,1,0,0,0,0,6,6,4,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,16,0,0,0,0,0,10,4,109,3,107,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,107,91,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,16,0,0,0,0,0,10,2,3] as const;

export const STATS = { ops: 196, bytes: 1198, labels: 50, unknownOps: 0, unresolvedSymbols: 78 } as const;
