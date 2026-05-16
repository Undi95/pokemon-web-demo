// AUTO-GENERATED from data/maps/BattleFrontier_ScottsHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=154, bytes=1190, labels=28, unknownOps=0, unresolvedSymbols=47

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
  "BattleFrontier_ScottsHouse_EventScript_GiveSilverShield": 535,
  "BattleFrontier_ScottsHouse_EventScript_NoRoomForShield": 584,
  "BattleFrontier_ScottsHouse_EventScript_GivenShield": 594,
  "BattleFrontier_ScottsHouse_EventScript_CheckGiveGoldShield": 604,
  "BattleFrontier_ScottsHouse_EventScript_GiveGoldShield": 724,
  "BattleFrontier_ScottsHouse_EventScript_GivenBattlePoints": 773,
  "BattleFrontier_ScottsHouse_EventScript_WelcomeToFrontier": 783,
  "BattleFrontier_ScottsHouse_EventScript_Give4BattlePoints": 994,
  "BattleFrontier_ScottsHouse_EventScript_Give3BattlePoints": 1011,
  "BattleFrontier_ScottsHouse_EventScript_Give2BattlePoints": 1028,
  "BattleFrontier_ScottsHouse_EventScript_Give1BattlePoint": 1045,
  "BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints": 1062,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayNorth": 1090,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwaySouth": 1115,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayEast": 1140,
  "BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayWest": 1165,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,0,0,7,1,72,1,0,0,44,0,0,7,1,82,2,0,0,44,0,0,7,1,5,3,0,0,89,35,0,0,0,90,44,209,1,7,0,15,3,0,0,44,92,0,7,0,92,0,0,0,44,210,1,7,0,205,0,0,0,89,68,0,0,0,90,44,237,0,7,0,159,1,0,0,44,238,0,7,0,92,2,0,0,89,82,1,0,0,90,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,16,0,0,0,0,0,10,4,27,0,128,173,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,62,1,0,0,7,1,13,128,0,0,42,92,0,42,0,0,109,90,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,44,0,0,7,0,68,0,0,0,16,0,0,0,0,0,10,4,27,0,128,174,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,62,1,0,0,7,1,13,128,0,0,42,210,1,42,0,0,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,144,3,0,35,13,128,1,0,34,13,128,1,0,7,1,139,1,0,0,7,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,7,1,149,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,113,206,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,50,0,34,13,128,50,0,7,4,23,2,0,0,7,4,13,128,0,0,113,4,2,0,113,5,1,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,50,0,34,13,128,50,0,7,4,23,2,0,0,7,4,13,128,0,0,89,82,1,0,0,90,16,0,0,0,0,0,10,4,27,0,128,42,0,10,7,35,13,128,0,0,34,13,128,0,0,7,1,72,2,0,0,7,1,13,128,0,0,42,237,0,42,0,0,89,82,2,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,113,206,0,0,113,4,2,0,113,5,1,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,100,0,34,13,128,100,0,7,4,212,2,0,0,7,4,13,128,0,0,113,4,2,0,113,5,1,0,26,6,128,1,0,113,6,1,0,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,100,0,34,13,128,100,0,7,4,212,2,0,0,7,4,13,128,0,0,89,82,1,0,0,90,16,0,0,0,0,0,10,4,27,0,128,43,0,10,7,35,13,128,0,0,34,13,128,0,0,7,1,72,2,0,0,7,1,13,128,0,0,42,238,0,42,0,0,89,82,2,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,105,4,30,35,12,128,2,0,34,12,128,2,0,8,1,66,4,0,0,8,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,91,4,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,116,4,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,141,4,0,0,8,1,12,128,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,35,209,64,13,0,34,209,64,13,0,7,1,226,3,0,0,7,1,209,64,0,0,35,209,64,9,0,34,209,64,9,0,7,4,243,3,0,0,7,4,209,64,0,0,35,209,64,6,0,34,209,64,6,0,7,4,4,4,0,0,7,4,209,64,0,0,89,21,4,0,0,90,132,0,1,2,0,4,0,113,4,4,0,89,38,4,0,0,90,132,0,1,2,0,3,0,113,4,3,0,89,38,4,0,0,90,132,0,1,2,0,2,0,113,4,2,0,89,38,4,0,0,90,132,0,1,2,0,1,0,113,4,1,0,89,38,4,0,0,90,38,0,0,0,16,0,0,0,0,0,10,9,16,0,0,0,0,0,10,4,42,209,1,42,0,0,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15] as const;

export const STATS = { ops: 154, bytes: 1190, labels: 28, unknownOps: 0, unresolvedSymbols: 47 } as const;
