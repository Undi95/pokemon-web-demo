// AUTO-GENERATED from data/maps/BattleFrontier_ScottsHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=154, bytes=986, labels=28, unknownOps=2, unresolvedSymbols=51

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_ScottsHouse_MapScripts": 0,
  "BattleFrontier_ScottsHouse_EventScript_Scott": 0,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveItems": 35,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveShield": 68,
  "BattleFrontier_ScottsHouse_EventScript_CheckSilverSymbols": 92,
  "BattleFrontier_ScottsHouse_EventScript_CheckGoldSymbols": 193,
  "BattleFrontier_ScottsHouse_EventScript_BerryPocketFull": 294,
  "BattleFrontier_ScottsHouse_EventScript_GivenBerry": 304,
  "BattleFrontier_ScottsHouse_EventScript_RandomComment": 314,
  "BattleFrontier_ScottsHouse_EventScript_FrontierBrainComment": 347,
  "BattleFrontier_ScottsHouse_EventScript_ArtisanCaveComment": 357,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveSilverShield": 367,
  "BattleFrontier_ScottsHouse_EventScript_GiveSilverShield": 463,
  "BattleFrontier_ScottsHouse_EventScript_NoRoomForShield": 500,
  "BattleFrontier_ScottsHouse_EventScript_GivenShield": 510,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveGoldShield": 520,
  "BattleFrontier_ScottsHouse_EventScript_GiveGoldShield": 616,
  "BattleFrontier_ScottsHouse_EventScript_GivenBattlePoints": 653,
  "BattleFrontier_ScottsHouse_EventScript_WelcomeToFrontier": 663,
  "BattleFrontier_ScottsHouse_EventScript_Give4BattlePoints": 790,
  "BattleFrontier_ScottsHouse_EventScript_Give3BattlePoints": 807,
  "BattleFrontier_ScottsHouse_EventScript_Give2BattlePoints": 824,
  "BattleFrontier_ScottsHouse_EventScript_Give1BattlePoint": 841,
  "BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints": 858,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayNorth": 886,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwaySouth": 911,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayEast": 936,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayWest": 961,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,0,0,7,1,48,1,0,0,44,0,0,7,1,254,1,0,0,44,0,0,7,1,141,2,0,0,89,35,0,0,0,90,44,209,1,7,0,151,2,0,0,44,92,0,7,0,92,0,0,0,44,210,1,7,0,193,0,0,0,89,68,0,0,0,90,44,237,0,7,0,111,1,0,0,44,238,0,7,0,8,2,0,0,89,58,1,0,0,90,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,16,0,0,0,0,0,10,0,27,0,128,173,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,92,0,42,0,0,109,90,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,16,0,0,0,0,0,10,0,27,0,128,174,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,210,1,42,0,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,144,3,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,113,206,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,50,0,34,13,128,50,0,113,4,2,0,113,5,1,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,50,0,34,13,128,50,0,89,58,1,0,0,90,16,0,0,0,0,0,10,0,27,0,128,42,0,10,0,35,13,128,0,0,34,13,128,0,0,42,237,0,42,0,0,89,254,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,113,206,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,100,0,34,13,128,100,0,113,4,2,0,113,5,1,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,100,0,34,13,128,100,0,89,58,1,0,0,90,16,0,0,0,0,0,10,0,27,0,128,43,0,10,0,35,13,128,0,0,34,13,128,0,0,42,238,0,42,0,0,89,254,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,105,4,30,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,4,0,34,12,128,4,0,35,12,128,3,0,34,12,128,3,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,209,64,13,0,34,209,64,13,0,35,209,64,9,0,34,209,64,9,0,35,209,64,6,0,34,209,64,6,0,89,73,3,0,0,90,132,0,1,2,0,4,0,113,4,4,0,89,90,3,0,0,90,132,0,1,2,0,3,0,113,4,3,0,89,90,3,0,0,90,132,0,1,2,0,2,0,113,4,2,0,89,90,3,0,0,90,132,0,1,2,0,1,0,113,4,1,0,89,90,3,0,0,90,38,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,42,209,1,42,0,0,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15] as const;

export const STATS = { ops: 154, bytes: 986, labels: 28, unknownOps: 2, unresolvedSymbols: 51 } as const;
