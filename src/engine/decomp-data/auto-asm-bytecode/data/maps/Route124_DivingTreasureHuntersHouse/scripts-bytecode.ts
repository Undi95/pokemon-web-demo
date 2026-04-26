// AUTO-GENERATED from data/maps/Route124_DivingTreasureHuntersHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=208, bytes=558, labels=38, unknownOps=5, unresolvedSymbols=24

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route124_DivingTreasureHuntersHouse_MapScripts": 0,
  "Route124_DivingTreasureHuntersHouse_OnTransition": 5,
  "Route124_DivingTreasureHuntersHouse_EventScript_TreasureHunter": 9,
  "Route124_DivingTreasureHuntersHouse_EventScript_SkipGreeting": 37,
  "Route124_DivingTreasureHuntersHouse_EventScript_CheckPlayerHasShard": 51,
  "Route124_DivingTreasureHuntersHouse_EventScript_GetPlayersShards": 72,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasRedShard": 136,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasYellowShard": 139,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasBlueShard": 142,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasGreenShard": 145,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasShard": 148,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShowTradeOptions": 162,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsR": 171,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsY": 182,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRY": 193,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsB": 204,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRB": 215,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsYB": 226,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRYB": 237,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsG": 248,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRG": 259,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsYG": 270,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRYG": 281,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsBG": 292,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRBG": 303,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsYBG": 314,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRYBG": 325,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeRedShard": 336,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeYellowShard": 349,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeBlueShard": 362,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeGreenShard": 375,
  "Route124_DivingTreasureHuntersHouse_EventScript_TryTradeShard": 388,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeShard": 456,
  "Route124_DivingTreasureHuntersHouse_EventScript_BagFull": 517,
  "Route124_DivingTreasureHuntersHouse_EventScript_DeclineTrade": 527,
  "Route124_DivingTreasureHuntersHouse_EventScript_NoShards": 537,
  "Route124_DivingTreasureHuntersHouse_EventScript_EndTrade": 547,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardTradeBoard": 549,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,90,107,91,44,217,0,7,1,37,0,0,0,16,0,0,0,0,0,10,0,42,217,0,89,51,0,0,0,90,16,0,0,0,0,0,10,0,89,51,0,0,0,90,88,72,0,0,0,35,0,0,0,0,34,0,0,0,0,89,148,0,0,0,90,113,0,0,0,72,48,0,1,0,35,13,128,1,0,34,13,128,1,0,72,50,0,1,0,35,13,128,1,0,34,13,128,1,0,72,49,0,1,0,35,13,128,1,0,34,13,128,1,0,72,51,0,1,0,35,13,128,1,0,34,13,128,1,0,115,0,1,115,0,2,115,0,4,115,0,8,16,0,0,0,0,0,10,0,89,162,0,0,0,90,104,0,0,0,0,0,0,0,90,112,0,0,58,0,89,15,2,0,0,90,112,0,0,59,0,89,15,2,0,0,90,112,0,0,60,0,89,15,2,0,0,90,112,0,0,61,0,89,15,2,0,0,90,112,0,0,62,0,89,15,2,0,0,90,112,0,0,63,0,89,15,2,0,0,90,112,0,0,64,0,89,15,2,0,0,90,112,0,0,65,0,89,15,2,0,0,90,112,0,0,66,0,89,15,2,0,0,90,112,0,0,67,0,89,15,2,0,0,90,112,0,0,68,0,89,15,2,0,0,90,112,0,0,69,0,89,15,2,0,0,90,112,0,0,70,0,89,15,2,0,0,90,112,0,0,71,0,89,15,2,0,0,90,112,0,0,72,0,89,15,2,0,0,90,113,8,48,0,113,9,95,0,89,132,1,0,0,113,8,50,0,113,9,96,0,89,132,1,0,0,113,8,49,0,113,9,97,0,89,132,1,0,0,113,8,51,0,113,9,98,0,89,132,1,0,0,129,0,1,2,0,8,128,129,0,1,2,0,9,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,71,9,128,1,0,35,13,128,1,0,34,13,128,1,0,72,8,128,2,0,35,13,128,0,0,34,13,128,0,0,89,5,2,0,0,90,0,8,27,0,128,9,128,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,88,72,0,0,0,35,0,0,0,0,34,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,15,2,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 208, bytes: 558, labels: 38, unknownOps: 5, unresolvedSymbols: 24 } as const;
