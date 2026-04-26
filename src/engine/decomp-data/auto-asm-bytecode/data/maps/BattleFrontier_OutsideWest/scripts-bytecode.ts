// AUTO-GENERATED from data/maps/BattleFrontier_OutsideWest/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=196, bytes=905, labels=50, unknownOps=10, unresolvedSymbols=68

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_OutsideWest_MapScripts": 0,
  "BattleFrontier_OutsideWest_OnTransition": 5,
  "BattleFrontier_OutsideWest_EventScript_FerryAttendant": 13,
  "BattleFrontier_OutsideWest_EventScript_ChooseFerryDestination": 52,
  "BattleFrontier_OutsideWest_EventScript_NoSSTicket": 59,
  "BattleFrontier_OutsideWest_EventScript_FerryToSlateport": 69,
  "BattleFrontier_OutsideWest_EventScript_FerryToLilycove": 126,
  "BattleFrontier_OutsideWest_EventScript_ChooseNewFerryDestination": 183,
  "BattleFrontier_OutsideWest_EventScript_BoardFerry": 197,
  "BattleFrontier_OutsideWest_EventScript_CancelFerrySelect": 238,
  "BattleFrontier_OutsideWest_EventScript_BattleDomeSign": 248,
  "BattleFrontier_OutsideWest_EventScript_BattleFactorySign": 257,
  "BattleFrontier_OutsideWest_EventScript_BattlePikeSign": 266,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC1": 275,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC2": 284,
  "BattleFrontier_OutsideWest_EventScript_Boy1": 293,
  "BattleFrontier_OutsideWest_EventScript_Fisherman2": 302,
  "BattleFrontier_OutsideWest_EventScript_Man1": 339,
  "BattleFrontier_OutsideWest_EventScript_Maniac1": 348,
  "BattleFrontier_OutsideWest_EventScript_Maniac2": 355,
  "BattleFrontier_OutsideWest_EventScript_FactoryChallengersTalk": 362,
  "BattleFrontier_OutsideWest_EventScript_Camper": 471,
  "BattleFrontier_OutsideWest_EventScript_CamperFaceFactory": 525,
  "BattleFrontier_OutsideWest_EventScript_CamperAlreadyFacingFactory": 549,
  "BattleFrontier_OutsideWest_EventScript_Girl": 549,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderNorth": 602,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderSouth": 626,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderWest": 650,
  "BattleFrontier_OutsideWest_EventScript_GirlShudderEast": 674,
  "BattleFrontier_OutsideWest_Movement_GirlShudderNorth": 698,
  "BattleFrontier_OutsideWest_Movement_GirlShudderSouth": 698,
  "BattleFrontier_OutsideWest_Movement_GirlShudderWest": 698,
  "BattleFrontier_OutsideWest_Movement_GirlShudderEast": 698,
  "BattleFrontier_OutsideWest_EventScript_Woman2": 698,
  "BattleFrontier_OutsideWest_EventScript_WomanWonRockPaperScissors": 727,
  "BattleFrontier_OutsideWest_EventScript_WomanLostRockPaperScissors": 737,
  "BattleFrontier_OutsideWest_EventScript_Fisherman1": 747,
  "BattleFrontier_OutsideWest_EventScript_UnusedNPC3": 756,
  "BattleFrontier_OutsideWest_EventScript_Gentleman": 765,
  "BattleFrontier_OutsideWest_EventScript_Lass": 774,
  "BattleFrontier_OutsideWest_EventScript_ExpertM": 783,
  "BattleFrontier_OutsideWest_EventScript_Man2": 792,
  "BattleFrontier_OutsideWest_EventScript_Woman1": 801,
  "BattleFrontier_OutsideWest_EventScript_FatMan1": 810,
  "BattleFrontier_OutsideWest_EventScript_FatMan2": 819,
  "BattleFrontier_OutsideWest_EventScript_Woman3": 828,
  "BattleFrontier_OutsideWest_EventScript_Boy2": 839,
  "BattleFrontier_OutsideWest_EventScript_OldMan": 850,
  "BattleFrontier_OutsideWest_EventScript_Man4": 859,
  "BattleFrontier_OutsideWest_EventScript_PokefanF": 896,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,113,188,0,0,42,150,3,90,107,91,16,0,0,0,0,0,10,0,72,9,1,1,0,35,13,128,0,0,34,13,128,0,0,104,0,0,0,0,0,0,0,89,52,0,0,0,90,113,18,6,53,2,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,88,197,0,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,88,197,0,0,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,11,0,8,11,0,0,0,0,109,90,104,0,0,0,0,0,0,0,89,52,0,0,0,90,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,90,0,0,0,0,113,4,0,0,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,104,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,110,109,90,16,0,0,0,0,0,10,0,90,107,89,106,1,0,0,90,107,89,106,1,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,4,25,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,4,20,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,16,0,0,0,0,0,10,0,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,107,91,104,0,0,0,0,0,0,0,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,110,109,90,80,0,0,186,2,0,0,81,0,0,186,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,186,2,0,0,81,0,0,186,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,186,2,0,0,81,0,0,186,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,186,2,0,0,81,0,0,186,2,0,0,0,0,82,0,0,83,0,0,0,0,107,91,16,0,0,0,0,0,10,0,144,2,0,35,13,128,1,0,34,13,128,1,0,89,225,2,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,16,0,0,0,0,0,10,0,109,90,107,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 196, bytes: 905, labels: 50, unknownOps: 10, unresolvedSymbols: 68 } as const;
