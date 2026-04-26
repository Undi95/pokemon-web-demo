// AUTO-GENERATED from data/maps/BattleFrontier_OutsideWest/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=196, bytes=1201, labels=50, unknownOps=0, unresolvedSymbols=63

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideWest_MapScripts": 0,
  "BattleFrontier_OutsideWest_OnTransition": 5,
  "BattleFrontier_OutsideWest_EventScript_FerryAttendant": 13,
  "BattleFrontier_OutsideWest_EventScript_ChooseFerryDestination": 64,
  "BattleFrontier_OutsideWest_EventScript_NoSSTicket": 204,
  "BattleFrontier_OutsideWest_EventScript_FerryToSlateport": 214,
  "BattleFrontier_OutsideWest_EventScript_FerryToLilycove": 283,
  "BattleFrontier_OutsideWest_EventScript_ChooseNewFerryDestination": 352,
  "BattleFrontier_OutsideWest_EventScript_BoardFerry": 366,
  "BattleFrontier_OutsideWest_EventScript_CancelFerrySelect": 408,
  "BattleFrontier_OutsideWest_EventScript_BattleDomeSign": 418,
  "BattleFrontier_OutsideWest_EventScript_BattleFactorySign": 427,
  "BattleFrontier_OutsideWest_EventScript_BattlePikeSign": 436,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC1": 445,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC2": 454,
  "BattleFrontier_OutsideWest_EventScript_Boy1": 463,
  "BattleFrontier_OutsideWest_EventScript_Fisherman2": 472,
  "BattleFrontier_OutsideWest_EventScript_Man1": 509,
  "BattleFrontier_OutsideWest_EventScript_Maniac1": 518,
  "BattleFrontier_OutsideWest_EventScript_Maniac2": 525,
  "BattleFrontier_OutsideWest_EventScript_FactoryChallengersTalk": 532,
  "BattleFrontier_OutsideWest_EventScript_Camper": 641,
  "BattleFrontier_OutsideWest_EventScript_CamperFaceFactory": 743,
  "BattleFrontier_OutsideWest_EventScript_CamperAlreadyFacingFactory": 768,
  "BattleFrontier_OutsideWest_EventScript_Girl": 769,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderNorth": 870,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderSouth": 895,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderWest": 920,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderEast": 945,
  "BattleFrontier_OutsideWest_Movement_GirlShudderNorth": 970,
  "BattleFrontier_OutsideWest_Movement_GirlShudderSouth": 973,
  "BattleFrontier_OutsideWest_Movement_GirlShudderWest": 976,
  "BattleFrontier_OutsideWest_Movement_GirlShudderEast": 979,
  "BattleFrontier_OutsideWest_EventScript_Woman2": 982,
  "BattleFrontier_OutsideWest_EventScript_WomanWonRockPaperScissors": 1023,
  "BattleFrontier_OutsideWest_EventScript_WomanLostRockPaperScissors": 1033,
  "BattleFrontier_OutsideWest_EventScript_Fisherman1": 1043,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC3": 1052,
  "BattleFrontier_OutsideWest_EventScript_Gentleman": 1061,
  "BattleFrontier_OutsideWest_EventScript_Lass": 1070,
  "BattleFrontier_OutsideWest_EventScript_ExpertM": 1079,
  "BattleFrontier_OutsideWest_EventScript_Man2": 1088,
  "BattleFrontier_OutsideWest_EventScript_Woman1": 1097,
  "BattleFrontier_OutsideWest_EventScript_FatMan1": 1106,
  "BattleFrontier_OutsideWest_EventScript_FatMan2": 1115,
  "BattleFrontier_OutsideWest_EventScript_Woman3": 1124,
  "BattleFrontier_OutsideWest_EventScript_Boy2": 1135,
  "BattleFrontier_OutsideWest_EventScript_OldMan": 1146,
  "BattleFrontier_OutsideWest_EventScript_Man4": 1155,
  "BattleFrontier_OutsideWest_EventScript_PokefanF": 1192,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,113,188,0,0,42,150,3,90,107,91,16,0,0,0,0,0,10,4,72,9,1,1,0,35,13,128,0,0,34,13,128,0,0,7,1,204,0,0,0,7,1,13,128,0,0,104,0,0,0,0,0,0,0,89,64,0,0,0,90,113,18,6,53,2,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,214,0,0,0,34,214,0,0,0,7,1,0,0,0,0,7,1,214,0,0,0,35,0,128,1,0,34,0,128,1,0,35,27,1,0,0,34,27,1,0,0,7,1,0,0,0,0,7,1,27,1,0,0,35,0,128,2,0,34,0,128,2,0,35,152,1,0,0,34,152,1,0,0,7,1,0,0,0,0,7,1,152,1,0,0,35,0,128,127,0,34,0,128,127,0,35,152,1,0,0,34,152,1,0,0,7,1,0,0,0,0,7,1,152,1,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,96,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,88,110,1,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,96,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,88,110,1,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,104,0,0,0,0,0,0,0,89,64,0,0,0,90,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,90,0,0,0,0,113,4,0,0,88,0,0,0,0,15,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,91,104,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,110,109,90,16,0,0,0,0,0,10,2,90,107,89,20,2,0,0,90,107,89,20,2,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,4,25,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,4,20,35,12,128,2,0,34,12,128,2,0,8,1,231,2,0,0,8,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,0,3,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,231,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,231,2,0,0,8,1,12,128,0,0,16,0,0,0,0,0,10,4,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,15,107,91,104,0,0,0,0,0,0,0,35,12,128,2,0,34,12,128,2,0,8,1,102,3,0,0,8,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,127,3,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,152,3,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,177,3,0,0,8,1,12,128,0,0,110,109,90,80,0,0,202,3,0,0,81,0,0,202,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,205,3,0,0,81,0,0,205,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,208,3,0,0,81,0,0,208,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,211,3,0,0,81,0,0,211,3,0,0,0,0,82,0,0,83,0,0,0,0,15,37,37,254,38,38,254,40,40,254,39,39,254,107,91,16,0,0,0,0,0,10,4,144,2,0,35,13,128,1,0,34,13,128,1,0,7,1,255,3,0,0,7,1,13,128,0,0,89,9,4,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,16,0,0,0,0,0,10,4,109,90,107,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,107,91,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,2,90] as const;

export const STATS = { ops: 196, bytes: 1201, labels: 50, unknownOps: 0, unresolvedSymbols: 63 } as const;
