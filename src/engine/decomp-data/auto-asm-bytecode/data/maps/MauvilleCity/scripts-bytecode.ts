// AUTO-GENERATED from data/maps/MauvilleCity/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=353, bytes=1814, labels=53, unknownOps=0, unresolvedSymbols=89

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MauvilleCity_MapScripts": 0,
  "MauvilleCity_OnTransition": 5,
  "MauvilleCity_EventScript_MoveWattsonBackToGym": 35,
  "MauvilleCity_EventScript_Boy": 45,
  "MauvilleCity_EventScript_Maniac": 54,
  "MauvilleCity_EventScript_Woman": 63,
  "MauvilleCity_EventScript_RichBoy": 72,
  "MauvilleCity_EventScript_CitySign": 81,
  "MauvilleCity_EventScript_GymSign": 90,
  "MauvilleCity_EventScript_BikeShopSign": 99,
  "MauvilleCity_EventScript_GameCornerSign": 108,
  "MauvilleCity_EventScript_SchoolKidM": 117,
  "MauvilleCity_EventScript_TVExplained": 141,
  "MauvilleCity_EventScript_WallysUncle": 151,
  "MauvilleCity_EventScript_UncleAskPlayerToBattleWally": 197,
  "MauvilleCity_EventScript_Wally": 232,
  "MauvilleCity_EventScript_BattleWallyPrompt": 379,
  "MauvilleCity_EventScript_WallyAndUncleExitNorth": 494,
  "MauvilleCity_EventScript_WallyAndUncleExitEast": 688,
  "MauvilleCity_EventScript_DefeatedWally": 866,
  "MauvilleCity_EventScript_ScottApproachPlayerNorth": 1035,
  "MauvilleCity_EventScript_ScottApproachPlayerEast": 1068,
  "MauvilleCity_EventScript_ScottExitNorth": 1108,
  "MauvilleCity_EventScript_ScottExitEast": 1149,
  "MauvilleCity_EventScript_BattleWally": 1190,
  "MauvilleCity_EventScript_DeclineWallyBattle": 1433,
  "MauvilleCity_EventScript_WallyRequestBattleAgain": 1446,
  "MauvilleCity_Movement_WallyExitNorth1": 1484,
  "MauvilleCity_Movement_WallyExitEast1": 1490,
  "MauvilleCity_Movement_WallyExitNorth2": 1496,
  "MauvilleCity_Movement_WallyExitEast2": 1508,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth2": 1520,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast2": 1524,
  "MauvilleCity_Movement_PlayerWatchScottExitNorth": 1529,
  "MauvilleCity_Movement_PlayerWatchScottExitEast": 1532,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast1": 1536,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth1": 1539,
  "MauvilleCity_Movement_WallysUncleExitNorth1": 1542,
  "MauvilleCity_Movement_WallysUncleExitEast1": 1548,
  "MauvilleCity_Movement_PlayerFaceUncleNorth": 1554,
  "MauvilleCity_Movement_WallysUncleApproachPlayerNorth": 1559,
  "MauvilleCity_Movement_WallysUncleApproachPlayerEast": 1563,
  "MauvilleCity_Movement_WallysUncleExitNorth2": 1566,
  "MauvilleCity_Movement_WallysUncleExitEast2": 1575,
  "MauvilleCity_Movement_ScottApproachPlayerNorth": 1585,
  "MauvilleCity_Movement_ScottApproachPlayerEast": 1597,
  "MauvilleCity_Movement_ScottExitNorth": 1609,
  "MauvilleCity_Movement_ScottExitEast": 1619,
  "MauvilleCity_EventScript_Wattson": 1630,
  "MauvilleCity_EventScript_BegunNewMauville": 1705,
  "MauvilleCity_EventScript_CompletedNewMauville": 1715,
  "MauvilleCity_EventScript_ReceivedThunderbolt": 1770,
  "MauvilleCity_EventScript_RegisterWallyCall": 1780,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,5,0,0,0,42,0,0,43,0,0,43,0,0,42,0,0,43,0,0,23,0,0,0,0,44,0,0,8,1,35,0,0,0,3,43,0,0,42,0,0,42,0,0,4,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,107,91,44,0,0,7,1,141,0,0,0,16,0,0,0,0,0,10,4,42,0,0,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,197,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,106,44,0,0,7,1,166,5,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,6,123,1,0,0,3,35,0,0,1,0,34,0,0,1,0,8,1,166,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,153,5,0,0,7,1,0,0,0,0,105,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,238,1,0,0,34,238,1,0,0,7,1,0,0,0,0,7,1,238,1,0,0,35,0,0,0,0,34,0,0,0,0,35,176,2,0,0,34,176,2,0,0,7,1,0,0,0,0,7,1,176,2,0,0,3,80,0,0,3,6,0,0,81,0,0,3,6,0,0,0,0,80,0,0,204,5,0,0,81,0,0,204,5,0,0,0,0,80,0,0,6,6,0,0,81,0,0,6,6,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,30,0,80,0,0,18,6,0,0,81,0,0,18,6,0,0,0,0,80,0,0,23,6,0,0,81,0,0,23,6,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,240,5,0,0,81,0,0,240,5,0,0,0,0,80,0,0,30,6,0,0,81,0,0,30,6,0,0,0,0,80,0,0,216,5,0,0,81,0,0,216,5,0,0,0,0,82,0,0,83,0,0,0,0,6,98,3,0,0,3,80,0,0,0,6,0,0,81,0,0,0,6,0,0,0,0,80,0,0,210,5,0,0,81,0,0,210,5,0,0,0,0,80,0,0,12,6,0,0,81,0,0,12,6,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,30,0,80,0,0,27,6,0,0,81,0,0,27,6,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,244,5,0,0,81,0,0,244,5,0,0,0,0,80,0,0,39,6,0,0,81,0,0,39,6,0,0,0,0,80,0,0,228,5,0,0,81,0,0,228,5,0,0,0,0,82,0,0,83,0,0,0,0,6,98,3,0,0,3,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,43,0,0,43,0,0,42,0,0,23,0,0,0,0,42,0,0,35,0,0,0,0,34,0,0,0,0,8,1,11,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,44,4,0,0,8,1,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,24,0,0,1,0,35,0,0,0,0,34,0,0,0,0,8,1,84,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,125,4,0,0,8,1,0,0,0,0,84,0,0,85,0,0,0,0,108,3,86,0,0,87,0,0,0,0,80,0,0,49,6,0,0,81,0,0,49,6,0,0,0,0,82,0,0,83,0,0,0,0,4,100,0,0,12,0,13,0,86,0,0,87,0,0,0,0,80,0,0,61,6,0,0,81,0,0,61,6,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,249,5,0,0,81,0,0,249,5,0,0,0,0,80,0,0,73,6,0,0,81,0,0,73,6,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,252,5,0,0,81,0,0,252,5,0,0,0,0,80,0,0,83,6,0,0,81,0,0,83,6,0,0,0,0,82,0,0,83,0,0,0,0,4,16,0,0,0,0,0,10,4,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,4,42,0,0,16,0,0,0,0,0,10,4,109,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,6,123,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,91,44,0,0,7,1,234,6,0,0,35,0,0,2,0,34,0,0,2,0,7,1,179,6,0,0,7,1,0,0,0,0,44,0,0,7,1,169,6,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,42,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,106,224,0,0,0,0,103,41,30,0,50,0,0,16,0,0,0,0,0,10,4,51,105,41,30,0,42,0,0,43,0,0,108,3] as const;

export const STATS = { ops: 353, bytes: 1814, labels: 53, unknownOps: 0, unresolvedSymbols: 89 } as const;
