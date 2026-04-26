// AUTO-GENERATED from data/maps/MauvilleCity/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=353, bytes=1808, labels=53, unknownOps=0, unresolvedSymbols=48

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MauvilleCity_MapScripts": 0,
  "MauvilleCity_OnTransition": 5,
  "MauvilleCity_EventScript_MoveWattsonBackToGym": 34,
  "MauvilleCity_EventScript_Boy": 44,
  "MauvilleCity_EventScript_Maniac": 53,
  "MauvilleCity_EventScript_Woman": 62,
  "MauvilleCity_EventScript_RichBoy": 71,
  "MauvilleCity_EventScript_CitySign": 80,
  "MauvilleCity_EventScript_GymSign": 89,
  "MauvilleCity_EventScript_BikeShopSign": 98,
  "MauvilleCity_EventScript_GameCornerSign": 107,
  "MauvilleCity_EventScript_SchoolKidM": 116,
  "MauvilleCity_EventScript_TVExplained": 140,
  "MauvilleCity_EventScript_WallysUncle": 150,
  "MauvilleCity_EventScript_UncleAskPlayerToBattleWally": 196,
  "MauvilleCity_EventScript_Wally": 231,
  "MauvilleCity_EventScript_BattleWallyPrompt": 378,
  "MauvilleCity_EventScript_WallyAndUncleExitNorth": 493,
  "MauvilleCity_EventScript_WallyAndUncleExitEast": 686,
  "MauvilleCity_EventScript_DefeatedWally": 863,
  "MauvilleCity_EventScript_ScottApproachPlayerNorth": 1029,
  "MauvilleCity_EventScript_ScottApproachPlayerEast": 1062,
  "MauvilleCity_EventScript_ScottExitNorth": 1102,
  "MauvilleCity_EventScript_ScottExitEast": 1143,
  "MauvilleCity_EventScript_BattleWally": 1184,
  "MauvilleCity_EventScript_DeclineWallyBattle": 1427,
  "MauvilleCity_EventScript_WallyRequestBattleAgain": 1440,
  "MauvilleCity_Movement_WallyExitNorth1": 1478,
  "MauvilleCity_Movement_WallyExitEast1": 1484,
  "MauvilleCity_Movement_WallyExitNorth2": 1490,
  "MauvilleCity_Movement_WallyExitEast2": 1502,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth2": 1514,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast2": 1518,
  "MauvilleCity_Movement_PlayerWatchScottExitNorth": 1523,
  "MauvilleCity_Movement_PlayerWatchScottExitEast": 1526,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast1": 1530,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth1": 1533,
  "MauvilleCity_Movement_WallysUncleExitNorth1": 1536,
  "MauvilleCity_Movement_WallysUncleExitEast1": 1542,
  "MauvilleCity_Movement_PlayerFaceUncleNorth": 1548,
  "MauvilleCity_Movement_WallysUncleApproachPlayerNorth": 1553,
  "MauvilleCity_Movement_WallysUncleApproachPlayerEast": 1557,
  "MauvilleCity_Movement_WallysUncleExitNorth2": 1560,
  "MauvilleCity_Movement_WallysUncleExitEast2": 1569,
  "MauvilleCity_Movement_ScottApproachPlayerNorth": 1579,
  "MauvilleCity_Movement_ScottApproachPlayerEast": 1591,
  "MauvilleCity_Movement_ScottExitNorth": 1603,
  "MauvilleCity_Movement_ScottExitEast": 1613,
  "MauvilleCity_EventScript_Wattson": 1624,
  "MauvilleCity_EventScript_BegunNewMauville": 1699,
  "MauvilleCity_EventScript_CompletedNewMauville": 1709,
  "MauvilleCity_EventScript_ReceivedThunderbolt": 1764,
  "MauvilleCity_EventScript_RegisterWallyCall": 1774,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,43,157,0,43,193,3,42,0,0,43,99,0,113,147,0,0,44,209,0,8,1,34,0,0,0,90,43,145,3,42,144,3,42,91,0,15,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,107,91,44,98,0,7,1,140,0,0,0,16,0,0,0,0,0,10,4,42,98,0,109,90,16,0,0,0,0,0,10,4,109,90,107,91,44,28,1,7,1,196,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,44,28,1,7,1,160,5,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,89,122,1,0,0,90,35,13,128,1,0,34,13,128,1,0,8,1,160,4,0,0,8,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,147,5,0,0,7,1,13,128,0,0,105,26,0,128,12,128,35,0,128,2,0,34,0,128,2,0,35,237,1,0,0,34,237,1,0,0,7,1,0,0,0,0,7,1,237,1,0,0,35,0,128,4,0,34,0,128,4,0,35,174,2,0,0,34,174,2,0,0,7,1,0,0,0,0,7,1,174,2,0,0,90,80,255,0,253,5,0,0,81,255,0,253,5,0,0,0,0,80,0,0,198,5,0,0,81,0,0,198,5,0,0,0,0,80,0,0,0,6,0,0,81,0,0,0,6,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,255,0,12,6,0,0,81,255,0,12,6,0,0,0,0,80,0,0,17,6,0,0,81,0,0,17,6,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,234,5,0,0,81,255,0,234,5,0,0,0,0,80,0,0,24,6,0,0,81,0,0,24,6,0,0,0,0,80,0,0,210,5,0,0,81,0,0,210,5,0,0,0,0,82,0,0,83,0,0,0,0,89,95,3,0,0,90,80,255,0,250,5,0,0,81,255,0,250,5,0,0,0,0,80,0,0,204,5,0,0,81,0,0,204,5,0,0,0,0,80,0,0,6,6,0,0,81,0,0,6,6,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,0,0,21,6,0,0,81,0,0,21,6,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,238,5,0,0,81,255,0,238,5,0,0,0,0,80,0,0,33,6,0,0,81,0,0,33,6,0,0,0,0,80,0,0,222,5,0,0,81,0,0,222,5,0,0,0,0,82,0,0,83,0,0,0,0,89,95,3,0,0,90,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,43,38,3,43,41,3,42,190,0,113,242,0,0,42,136,0,35,12,128,2,0,34,12,128,2,0,8,1,5,4,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,38,4,0,0,8,1,12,128,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,115,209,1,35,12,128,2,0,34,12,128,2,0,8,1,78,4,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,119,4,0,0,8,1,12,128,0,0,84,0,0,85,0,0,0,0,108,90,86,0,0,87,0,0,0,0,80,0,0,43,6,0,0,81,0,0,43,6,0,0,0,0,82,0,0,83,0,0,0,0,15,100,0,0,12,0,13,0,86,0,0,87,0,0,0,0,80,0,0,55,6,0,0,81,0,0,55,6,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,243,5,0,0,81,255,0,243,5,0,0,0,0,80,0,0,67,6,0,0,81,0,0,67,6,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,246,5,0,0,81,255,0,246,5,0,0,0,0,80,0,0,77,6,0,0,81,0,0,77,6,0,0,0,0,82,0,0,83,0,0,0,0,15,16,0,0,0,0,0,10,4,93,3,144,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,15,42,28,1,16,0,0,0,0,0,10,4,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,5,89,122,1,0,0,90,10,10,8,8,10,254,8,8,10,10,10,254,20,20,10,10,10,10,10,10,10,10,19,254,20,20,10,10,10,10,10,10,10,10,19,254,20,19,39,254,20,20,20,39,254,20,39,254,20,20,39,254,20,37,254,20,39,254,10,10,10,8,8,254,10,8,8,10,10,254,20,19,18,37,254,11,11,38,254,11,9,254,10,10,10,10,10,10,10,10,254,8,10,10,10,10,10,10,10,10,254,9,9,9,9,9,9,10,10,10,10,38,254,9,9,9,9,9,10,10,10,10,10,9,254,10,10,10,10,10,10,10,10,10,254,8,10,10,10,10,10,10,10,10,10,254,107,91,44,209,0,7,1,228,6,0,0,35,186,64,2,0,34,186,64,2,0,7,1,173,6,0,0,7,1,186,64,0,0,44,208,0,7,1,163,6,0,0,16,0,0,0,0,0,10,4,27,0,128,15,1,27,1,128,1,0,10,0,42,208,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,209,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,106,224,0,0,0,0,0,0,0,4,30,50,204,1,16,0,0,0,0,0,10,4,51,105,4,30,42,214,0,43,136,0,108,90] as const;

export const STATS = { ops: 353, bytes: 1808, labels: 53, unknownOps: 0, unresolvedSymbols: 48 } as const;
