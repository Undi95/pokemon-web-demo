// AUTO-GENERATED from data/maps/MauvilleCity/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=353, bytes=1491, labels=53, unknownOps=16, unresolvedSymbols=54

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MauvilleCity_MapScripts": 0,
  "MauvilleCity_OnTransition": 5,
  "MauvilleCity_EventScript_MoveWattsonBackToGym": 34,
  "MauvilleCity_EventScript_Boy": 43,
  "MauvilleCity_EventScript_Maniac": 52,
  "MauvilleCity_EventScript_Woman": 61,
  "MauvilleCity_EventScript_RichBoy": 70,
  "MauvilleCity_EventScript_CitySign": 79,
  "MauvilleCity_EventScript_GymSign": 88,
  "MauvilleCity_EventScript_BikeShopSign": 97,
  "MauvilleCity_EventScript_GameCornerSign": 106,
  "MauvilleCity_EventScript_SchoolKidM": 115,
  "MauvilleCity_EventScript_TVExplained": 139,
  "MauvilleCity_EventScript_WallysUncle": 149,
  "MauvilleCity_EventScript_UncleAskPlayerToBattleWally": 195,
  "MauvilleCity_EventScript_Wally": 230,
  "MauvilleCity_EventScript_BattleWallyPrompt": 377,
  "MauvilleCity_EventScript_WallyAndUncleExitNorth": 399,
  "MauvilleCity_EventScript_WallyAndUncleExitEast": 592,
  "MauvilleCity_EventScript_DefeatedWally": 769,
  "MauvilleCity_EventScript_ScottApproachPlayerNorth": 887,
  "MauvilleCity_EventScript_ScottApproachPlayerEast": 919,
  "MauvilleCity_EventScript_ScottExitNorth": 958,
  "MauvilleCity_EventScript_ScottExitEast": 998,
  "MauvilleCity_EventScript_BattleWally": 1038,
  "MauvilleCity_EventScript_DeclineWallyBattle": 1280,
  "MauvilleCity_EventScript_WallyRequestBattleAgain": 1293,
  "MauvilleCity_Movement_WallyExitNorth1": 1331,
  "MauvilleCity_Movement_WallyExitEast1": 1331,
  "MauvilleCity_Movement_WallyExitNorth2": 1331,
  "MauvilleCity_Movement_WallyExitEast2": 1331,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth2": 1331,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast2": 1331,
  "MauvilleCity_Movement_PlayerWatchScottExitNorth": 1331,
  "MauvilleCity_Movement_PlayerWatchScottExitEast": 1331,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast1": 1331,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth1": 1331,
  "MauvilleCity_Movement_WallysUncleExitNorth1": 1331,
  "MauvilleCity_Movement_WallysUncleExitEast1": 1331,
  "MauvilleCity_Movement_PlayerFaceUncleNorth": 1331,
  "MauvilleCity_Movement_WallysUncleApproachPlayerNorth": 1331,
  "MauvilleCity_Movement_WallysUncleApproachPlayerEast": 1331,
  "MauvilleCity_Movement_WallysUncleExitNorth2": 1331,
  "MauvilleCity_Movement_WallysUncleExitEast2": 1331,
  "MauvilleCity_Movement_ScottApproachPlayerNorth": 1331,
  "MauvilleCity_Movement_ScottApproachPlayerEast": 1331,
  "MauvilleCity_Movement_ScottExitNorth": 1331,
  "MauvilleCity_Movement_ScottExitEast": 1331,
  "MauvilleCity_EventScript_Wattson": 1331,
  "MauvilleCity_EventScript_BegunNewMauville": 1394,
  "MauvilleCity_EventScript_CompletedNewMauville": 1404,
  "MauvilleCity_EventScript_ReceivedThunderbolt": 1447,
  "MauvilleCity_EventScript_RegisterWallyCall": 1457,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,43,157,0,43,193,3,42,0,0,43,99,0,113,147,0,0,44,209,0,8,1,34,0,0,0,90,43,145,3,42,144,3,42,91,0,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,98,0,7,1,139,0,0,0,16,0,0,0,0,0,10,0,42,98,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,28,1,7,1,195,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,44,28,1,7,1,13,5,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,121,1,0,0,90,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,105,90,80,255,0,51,5,0,0,81,255,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,255,0,51,5,0,0,81,255,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,51,5,0,0,81,255,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,89,1,3,0,0,90,80,255,0,51,5,0,0,81,255,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,51,5,0,0,81,255,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,89,1,3,0,0,90,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,43,38,3,43,41,3,42,190,0,113,242,0,0,42,136,0,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,115,209,1,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,84,0,0,85,0,0,0,0,108,90,86,0,0,87,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,100,0,0,12,0,13,0,86,0,0,87,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,51,5,0,0,81,255,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,51,5,0,0,81,255,0,51,5,0,0,0,0,80,0,0,51,5,0,0,81,0,0,51,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,144,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,42,28,1,16,0,0,0,0,0,10,0,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,121,1,0,0,90,107,91,44,209,0,7,1,167,5,0,0,35,186,64,2,0,34,186,64,2,0,44,208,0,7,1,114,5,0,0,16,0,0,0,0,0,10,0,27,0,128,15,1,27,1,128,1,0,10,0,42,208,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,209,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,106,224,0,0,0,0,0,0,0,4,30,50,204,1,16,0,0,0,0,0,10,0,51,105,4,30,42,214,0,43,136,0,108,90] as const;

export const STATS = { ops: 353, bytes: 1491, labels: 53, unknownOps: 16, unresolvedSymbols: 54 } as const;
