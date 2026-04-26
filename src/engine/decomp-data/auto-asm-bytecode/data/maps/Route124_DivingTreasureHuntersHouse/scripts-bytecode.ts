// AUTO-GENERATED from data/maps/Route124_DivingTreasureHuntersHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=208, bytes=1883, labels=38, unknownOps=2, unresolvedSymbols=24

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route124_DivingTreasureHuntersHouse_MapScripts": 0,
  "Route124_DivingTreasureHuntersHouse_OnTransition": 5,
  "Route124_DivingTreasureHuntersHouse_EventScript_TreasureHunter": 9,
  "Route124_DivingTreasureHuntersHouse_EventScript_SkipGreeting": 37,
  "Route124_DivingTreasureHuntersHouse_EventScript_CheckPlayerHasShard": 51,
  "Route124_DivingTreasureHuntersHouse_EventScript_GetPlayersShards": 72,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasRedShard": 137,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasYellowShard": 141,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasBlueShard": 145,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasGreenShard": 149,
  "Route124_DivingTreasureHuntersHouse_EventScript_HasShard": 153,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShowTradeOptions": 167,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsR": 481,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsY": 537,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRY": 593,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsB": 669,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRB": 725,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsYB": 801,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRYB": 877,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsG": 973,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRG": 1029,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsYG": 1105,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRYG": 1181,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsBG": 1277,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRBG": 1353,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsYBG": 1449,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardOptionsRYBG": 1545,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeRedShard": 1661,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeYellowShard": 1674,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeBlueShard": 1687,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeGreenShard": 1700,
  "Route124_DivingTreasureHuntersHouse_EventScript_TryTradeShard": 1713,
  "Route124_DivingTreasureHuntersHouse_EventScript_TradeShard": 1781,
  "Route124_DivingTreasureHuntersHouse_EventScript_BagFull": 1842,
  "Route124_DivingTreasureHuntersHouse_EventScript_DeclineTrade": 1852,
  "Route124_DivingTreasureHuntersHouse_EventScript_NoShards": 1862,
  "Route124_DivingTreasureHuntersHouse_EventScript_EndTrade": 1872,
  "Route124_DivingTreasureHuntersHouse_EventScript_ShardTradeBoard": 1874,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,90,107,91,44,217,0,7,1,37,0,0,0,16,0,0,0,0,0,10,0,42,217,0,89,51,0,0,0,90,16,0,0,0,0,0,10,0,89,51,0,0,0,90,88,72,0,0,0,35,0,0,0,0,34,0,0,0,0,89,153,0,0,0,90,113,0,0,0,72,48,0,1,0,35,13,128,1,0,34,13,128,1,0,72,50,0,1,0,35,13,128,1,0,34,13,128,1,0,72,49,0,1,0,35,13,128,1,0,34,13,128,1,0,72,51,0,1,0,35,13,128,1,0,34,13,128,1,0,15,115,0,1,15,115,0,2,15,115,0,4,15,115,0,8,15,16,0,0,0,0,0,10,0,89,167,0,0,0,90,104,0,0,0,0,0,0,0,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,225,1,0,0,34,225,1,0,0,35,0,128,2,0,34,0,128,2,0,35,25,2,0,0,34,25,2,0,0,35,0,128,3,0,34,0,128,3,0,35,81,2,0,0,34,81,2,0,0,35,0,128,4,0,34,0,128,4,0,35,157,2,0,0,34,157,2,0,0,35,0,128,5,0,34,0,128,5,0,35,213,2,0,0,34,213,2,0,0,35,0,128,6,0,34,0,128,6,0,35,33,3,0,0,34,33,3,0,0,35,0,128,7,0,34,0,128,7,0,35,109,3,0,0,34,109,3,0,0,35,0,128,8,0,34,0,128,8,0,35,205,3,0,0,34,205,3,0,0,35,0,128,9,0,34,0,128,9,0,35,5,4,0,0,34,5,4,0,0,35,0,128,10,0,34,0,128,10,0,35,81,4,0,0,34,81,4,0,0,35,0,128,11,0,34,0,128,11,0,35,157,4,0,0,34,157,4,0,0,35,0,128,12,0,34,0,128,12,0,35,253,4,0,0,34,253,4,0,0,35,0,128,13,0,34,0,128,13,0,35,73,5,0,0,34,73,5,0,0,35,0,128,14,0,34,0,128,14,0,35,169,5,0,0,34,169,5,0,0,35,0,128,15,0,34,0,128,15,0,35,9,6,0,0,34,9,6,0,0,90,112,0,0,58,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,59,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,138,6,0,0,34,138,6,0,0,35,0,128,1,0,34,0,128,1,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,60,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,138,6,0,0,34,138,6,0,0,35,0,128,2,0,34,0,128,2,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,61,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,151,6,0,0,34,151,6,0,0,35,0,128,1,0,34,0,128,1,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,62,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,151,6,0,0,34,151,6,0,0,35,0,128,2,0,34,0,128,2,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,63,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,138,6,0,0,34,138,6,0,0,35,0,128,1,0,34,0,128,1,0,35,151,6,0,0,34,151,6,0,0,35,0,128,2,0,34,0,128,2,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,64,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,138,6,0,0,34,138,6,0,0,35,0,128,2,0,34,0,128,2,0,35,151,6,0,0,34,151,6,0,0,35,0,128,3,0,34,0,128,3,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,65,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,164,6,0,0,34,164,6,0,0,35,0,128,1,0,34,0,128,1,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,66,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,164,6,0,0,34,164,6,0,0,35,0,128,2,0,34,0,128,2,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,67,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,138,6,0,0,34,138,6,0,0,35,0,128,1,0,34,0,128,1,0,35,164,6,0,0,34,164,6,0,0,35,0,128,2,0,34,0,128,2,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,68,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,138,6,0,0,34,138,6,0,0,35,0,128,2,0,34,0,128,2,0,35,164,6,0,0,34,164,6,0,0,35,0,128,3,0,34,0,128,3,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,69,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,151,6,0,0,34,151,6,0,0,35,0,128,1,0,34,0,128,1,0,35,164,6,0,0,34,164,6,0,0,35,0,128,2,0,34,0,128,2,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,70,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,151,6,0,0,34,151,6,0,0,35,0,128,2,0,34,0,128,2,0,35,164,6,0,0,34,164,6,0,0,35,0,128,3,0,34,0,128,3,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,71,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,138,6,0,0,34,138,6,0,0,35,0,128,1,0,34,0,128,1,0,35,151,6,0,0,34,151,6,0,0,35,0,128,2,0,34,0,128,2,0,35,164,6,0,0,34,164,6,0,0,35,0,128,3,0,34,0,128,3,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,112,0,0,72,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,6,0,0,34,125,6,0,0,35,0,128,1,0,34,0,128,1,0,35,138,6,0,0,34,138,6,0,0,35,0,128,2,0,34,0,128,2,0,35,151,6,0,0,34,151,6,0,0,35,0,128,3,0,34,0,128,3,0,35,164,6,0,0,34,164,6,0,0,35,0,128,4,0,34,0,128,4,0,35,60,7,0,0,34,60,7,0,0,89,60,7,0,0,90,113,8,48,0,113,9,95,0,89,177,6,0,0,113,8,50,0,113,9,96,0,89,177,6,0,0,113,8,49,0,113,9,97,0,89,177,6,0,0,113,8,51,0,113,9,98,0,89,177,6,0,0,129,0,1,2,0,8,128,129,0,1,2,0,9,128,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,71,9,128,1,0,35,13,128,1,0,34,13,128,1,0,72,8,128,2,0,35,13,128,0,0,34,13,128,0,0,89,50,7,0,0,90,0,8,27,0,128,9,128,27,1,128,1,0,10,0,16,0,0,0,0,0,10,0,88,72,0,0,0,35,0,0,0,0,34,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,60,7,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 208, bytes: 1883, labels: 38, unknownOps: 2, unresolvedSymbols: 24 } as const;
