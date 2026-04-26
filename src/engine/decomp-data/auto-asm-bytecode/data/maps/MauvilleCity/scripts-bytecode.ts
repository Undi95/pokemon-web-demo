// AUTO-GENERATED from data/maps/MauvilleCity/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=353, bytes=1688, labels=53, unknownOps=2, unresolvedSymbols=54

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
  "MauvilleCity_EventScript_WallyAndUncleExitNorth": 445,
  "MauvilleCity_EventScript_WallyAndUncleExitEast": 638,
  "MauvilleCity_EventScript_DefeatedWally": 815,
  "MauvilleCity_EventScript_ScottApproachPlayerNorth": 933,
  "MauvilleCity_EventScript_ScottApproachPlayerEast": 966,
  "MauvilleCity_EventScript_ScottExitNorth": 1006,
  "MauvilleCity_EventScript_ScottExitEast": 1047,
  "MauvilleCity_EventScript_BattleWally": 1088,
  "MauvilleCity_EventScript_DeclineWallyBattle": 1331,
  "MauvilleCity_EventScript_WallyRequestBattleAgain": 1344,
  "MauvilleCity_Movement_WallyExitNorth1": 1382,
  "MauvilleCity_Movement_WallyExitEast1": 1388,
  "MauvilleCity_Movement_WallyExitNorth2": 1394,
  "MauvilleCity_Movement_WallyExitEast2": 1406,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth2": 1418,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast2": 1422,
  "MauvilleCity_Movement_PlayerWatchScottExitNorth": 1427,
  "MauvilleCity_Movement_PlayerWatchScottExitEast": 1430,
  "MauvilleCity_Movement_PlayerWatchWallyExitEast1": 1434,
  "MauvilleCity_Movement_PlayerWatchWallyExitNorth1": 1437,
  "MauvilleCity_Movement_WallysUncleExitNorth1": 1440,
  "MauvilleCity_Movement_WallysUncleExitEast1": 1446,
  "MauvilleCity_Movement_PlayerFaceUncleNorth": 1452,
  "MauvilleCity_Movement_WallysUncleApproachPlayerNorth": 1457,
  "MauvilleCity_Movement_WallysUncleApproachPlayerEast": 1461,
  "MauvilleCity_Movement_WallysUncleExitNorth2": 1464,
  "MauvilleCity_Movement_WallysUncleExitEast2": 1473,
  "MauvilleCity_Movement_ScottApproachPlayerNorth": 1483,
  "MauvilleCity_Movement_ScottApproachPlayerEast": 1495,
  "MauvilleCity_Movement_ScottExitNorth": 1507,
  "MauvilleCity_Movement_ScottExitEast": 1517,
  "MauvilleCity_EventScript_Wattson": 1528,
  "MauvilleCity_EventScript_BegunNewMauville": 1591,
  "MauvilleCity_EventScript_CompletedNewMauville": 1601,
  "MauvilleCity_EventScript_ReceivedThunderbolt": 1644,
  "MauvilleCity_EventScript_RegisterWallyCall": 1654,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,43,157,0,43,193,3,42,0,0,43,99,0,113,147,0,0,44,209,0,8,1,34,0,0,0,90,43,145,3,42,144,3,42,91,0,15,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,98,0,7,1,140,0,0,0,16,0,0,0,0,0,10,0,42,98,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,28,1,7,1,196,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,44,28,1,7,1,64,5,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,122,1,0,0,90,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,105,26,0,128,12,128,35,0,128,2,0,34,0,128,2,0,35,189,1,0,0,34,189,1,0,0,35,0,128,4,0,34,0,128,4,0,35,126,2,0,0,34,126,2,0,0,90,80,255,0,157,5,0,0,81,255,0,157,5,0,0,0,0,80,0,0,102,5,0,0,81,0,0,102,5,0,0,0,0,80,0,0,160,5,0,0,81,0,0,160,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,255,0,172,5,0,0,81,255,0,172,5,0,0,0,0,80,0,0,177,5,0,0,81,0,0,177,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,138,5,0,0,81,255,0,138,5,0,0,0,0,80,0,0,184,5,0,0,81,0,0,184,5,0,0,0,0,80,0,0,114,5,0,0,81,0,0,114,5,0,0,0,0,82,0,0,83,0,0,0,0,89,47,3,0,0,90,80,255,0,154,5,0,0,81,255,0,154,5,0,0,0,0,80,0,0,108,5,0,0,81,0,0,108,5,0,0,0,0,80,0,0,166,5,0,0,81,0,0,166,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,30,80,0,0,181,5,0,0,81,0,0,181,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,142,5,0,0,81,255,0,142,5,0,0,0,0,80,0,0,193,5,0,0,81,0,0,193,5,0,0,0,0,80,0,0,126,5,0,0,81,0,0,126,5,0,0,0,0,82,0,0,83,0,0,0,0,89,47,3,0,0,90,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,43,38,3,43,41,3,42,190,0,113,242,0,0,42,136,0,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,115,209,1,35,12,128,2,0,34,12,128,2,0,35,12,128,4,0,34,12,128,4,0,84,0,0,85,0,0,0,0,108,90,86,0,0,87,0,0,0,0,80,0,0,203,5,0,0,81,0,0,203,5,0,0,0,0,82,0,0,83,0,0,0,0,15,100,0,0,12,0,13,0,86,0,0,87,0,0,0,0,80,0,0,215,5,0,0,81,0,0,215,5,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,147,5,0,0,81,255,0,147,5,0,0,0,0,80,0,0,227,5,0,0,81,0,0,227,5,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,150,5,0,0,81,255,0,150,5,0,0,0,0,80,0,0,237,5,0,0,81,0,0,237,5,0,0,0,0,82,0,0,83,0,0,0,0,15,16,0,0,0,0,0,10,0,93,3,144,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,15,42,28,1,16,0,0,0,0,0,10,0,109,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,89,122,1,0,0,90,10,10,8,8,10,254,8,8,10,10,10,254,20,20,10,10,10,10,10,10,10,10,19,254,20,20,10,10,10,10,10,10,10,10,19,254,20,19,39,254,20,20,20,39,254,20,39,254,20,20,39,254,20,37,254,20,39,254,10,10,10,8,8,254,10,8,8,10,10,254,20,19,18,37,254,11,11,38,254,11,9,254,10,10,10,10,10,10,10,10,254,8,10,10,10,10,10,10,10,10,254,9,9,9,9,9,9,10,10,10,10,38,254,9,9,9,9,9,10,10,10,10,10,9,254,10,10,10,10,10,10,10,10,10,254,8,10,10,10,10,10,10,10,10,10,254,107,91,44,209,0,7,1,108,6,0,0,35,186,64,2,0,34,186,64,2,0,44,208,0,7,1,55,6,0,0,16,0,0,0,0,0,10,0,27,0,128,15,1,27,1,128,1,0,10,0,42,208,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,209,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,106,224,0,0,0,0,0,0,0,4,30,50,204,1,16,0,0,0,0,0,10,0,51,105,4,30,42,214,0,43,136,0,108,90] as const;

export const STATS = { ops: 353, bytes: 1688, labels: 53, unknownOps: 2, unresolvedSymbols: 54 } as const;
