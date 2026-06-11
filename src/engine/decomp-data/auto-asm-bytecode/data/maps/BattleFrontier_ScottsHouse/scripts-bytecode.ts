// AUTO-GENERATED from data/maps/BattleFrontier_ScottsHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=154, bytes=1217, labels=28, unknownOps=0, unresolvedSymbols=74

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_ScottsHouse_MapScripts": 0,
  "BattleFrontier_ScottsHouse_EventScript_Scott": 0,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveItems": 35,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveShield": 68,
  "BattleFrontier_ScottsHouse_EventScript_CheckSilverSymbols": 92,
  "BattleFrontier_ScottsHouse_EventScript_CheckGoldSymbols": 205,
  "BattleFrontier_ScottsHouse_EventScript_BerryPocketFull": 318,
  "BattleFrontier_ScottsHouse_EventScript_GivenBerry": 328,
  "BattleFrontier_ScottsHouse_EventScript_RandomComment": 338,
  "BattleFrontier_ScottsHouse_EventScript_FrontierBrainComment": 395,
  "BattleFrontier_ScottsHouse_EventScript_ArtisanCaveComment": 405,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveSilverShield": 415,
  "BattleFrontier_ScottsHouse_EventScript_GiveSilverShield": 546,
  "BattleFrontier_ScottsHouse_EventScript_NoRoomForShield": 595,
  "BattleFrontier_ScottsHouse_EventScript_GivenShield": 605,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveGoldShield": 615,
  "BattleFrontier_ScottsHouse_EventScript_GiveGoldShield": 746,
  "BattleFrontier_ScottsHouse_EventScript_GivenBattlePoints": 795,
  "BattleFrontier_ScottsHouse_EventScript_WelcomeToFrontier": 805,
  "BattleFrontier_ScottsHouse_EventScript_Give4BattlePoints": 1017,
  "BattleFrontier_ScottsHouse_EventScript_Give3BattlePoints": 1035,
  "BattleFrontier_ScottsHouse_EventScript_Give2BattlePoints": 1053,
  "BattleFrontier_ScottsHouse_EventScript_Give1BattlePoint": 1071,
  "BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints": 1089,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayNorth": 1117,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwaySouth": 1142,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayEast": 1167,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayWest": 1192,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,0,0,7,1,72,1,0,0,44,0,0,7,1,93,2,0,0,44,0,0,7,1,27,3,0,0,6,35,0,0,0,3,44,0,0,7,0,37,3,0,0,44,0,0,7,0,92,0,0,0,44,0,0,7,0,205,0,0,0,6,68,0,0,0,3,44,0,0,7,0,159,1,0,0,44,0,0,7,0,103,2,0,0,6,82,1,0,0,3,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,62,1,0,0,7,1,0,0,0,0,42,0,0,42,0,0,109,3,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,62,1,0,0,7,1,0,0,0,0,42,0,0,42,0,0,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,144,3,0,35,0,0,1,0,34,0,0,1,0,7,1,139,1,0,0,7,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,7,1,149,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,50,0,34,0,0,50,0,7,4,34,2,0,0,7,4,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,50,0,34,0,0,50,0,7,4,34,2,0,0,7,4,0,0,0,0,6,82,1,0,0,3,16,0,0,0,0,0,10,4,27,0,0,0,0,10,7,35,0,0,0,0,34,0,0,0,0,7,1,83,2,0,0,7,1,0,0,0,0,42,0,0,42,0,0,6,93,2,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,100,0,34,0,0,100,0,7,4,234,2,0,0,7,4,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,100,0,34,0,0,100,0,7,4,234,2,0,0,7,4,0,0,0,0,6,82,1,0,0,3,16,0,0,0,0,0,10,4,27,0,0,0,0,10,7,35,0,0,0,0,34,0,0,0,0,7,1,83,2,0,0,7,1,0,0,0,0,42,0,0,42,0,0,6,93,2,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,105,41,30,0,35,0,0,0,0,34,0,0,0,0,8,1,93,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,118,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,143,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,168,4,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,35,0,0,13,0,34,0,0,13,0,7,1,249,3,0,0,7,1,0,0,0,0,35,0,0,9,0,34,0,0,9,0,7,4,11,4,0,0,7,4,0,0,0,0,35,0,0,6,0,34,0,0,6,0,7,4,29,4,0,0,7,4,0,0,0,0,6,47,4,0,0,3,132,0,1,2,0,4,0,23,0,0,4,0,6,65,4,0,0,3,132,0,1,2,0,3,0,23,0,0,3,0,6,65,4,0,0,3,132,0,1,2,0,2,0,23,0,0,2,0,6,65,4,0,0,3,132,0,1,2,0,1,0,23,0,0,1,0,6,65,4,0,0,3,38,0,0,0,16,0,0,0,0,0,10,9,16,0,0,0,0,0,10,4,42,0,0,42,0,0,109,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4] as const;

export const STATS = { ops: 154, bytes: 1217, labels: 28, unknownOps: 0, unresolvedSymbols: 74 } as const;
