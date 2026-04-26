// AUTO-GENERATED from data/maps/MauvilleCity_BikeShop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=120, bytes=967, labels=27, unknownOps=0, unresolvedSymbols=34

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MauvilleCity_BikeShop_MapScripts": 0,
  "MauvilleCity_BikeShop_EventScript_Rydel": 0,
  "MauvilleCity_BikeShop_EventScript_SkipGreeting": 81,
  "MauvilleCity_BikeShop_EventScript_ChooseBike": 134,
  "MauvilleCity_BikeShop_EventScript_NotFar": 217,
  "MauvilleCity_BikeShop_EventScript_YesFar": 230,
  "MauvilleCity_BikeShop_EventScript_GetMachBike": 239,
  "MauvilleCity_BikeShop_EventScript_GetAcroBike": 265,
  "MauvilleCity_BikeShop_EventScript_ComeBackToSwitchBikes": 291,
  "MauvilleCity_BikeShop_EventScript_AskSwitchBikes": 305,
  "MauvilleCity_BikeShop_EventScript_SwitchBikes": 358,
  "MauvilleCity_BikeShop_EventScript_KeepBike": 430,
  "MauvilleCity_BikeShop_EventScript_SwitchAcroForMach": 440,
  "MauvilleCity_BikeShop_EventScript_SwitchMachForAcro": 470,
  "MauvilleCity_BikeShop_EventScript_Assistant": 500,
  "MauvilleCity_BikeShop_EventScript_MachBikeHandbook": 509,
  "MauvilleCity_BikeShop_EventScript_ChooseMachHandbookPage": 523,
  "MauvilleCity_BikeShop_EventScript_HowToRide": 694,
  "MauvilleCity_BikeShop_EventScript_HowToTurn": 708,
  "MauvilleCity_BikeShop_EventScript_SandySlopes": 722,
  "MauvilleCity_BikeShop_EventScript_ExitMachHandbook": 736,
  "MauvilleCity_BikeShop_EventScript_AcroBikeHandbook": 738,
  "MauvilleCity_BikeShop_EventScript_ChooseAcroHandbookPage": 752,
  "MauvilleCity_BikeShop_EventScript_Wheelies": 923,
  "MauvilleCity_BikeShop_EventScript_BunnyHops": 937,
  "MauvilleCity_BikeShop_EventScript_Jumps": 951,
  "MauvilleCity_BikeShop_EventScript_ExitAcroHandbook": 965,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,90,0,7,1,49,1,0,0,44,89,0,7,1,81,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,230,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,217,0,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,230,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,217,0,0,0,7,1,13,128,0,0,90,104,0,0,0,0,0,0,0,112,21,8,12,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,239,0,0,0,34,239,0,0,0,7,1,0,0,0,0,7,1,239,0,0,0,35,0,128,1,0,34,0,128,1,0,35,9,1,0,0,34,9,1,0,0,7,1,0,0,0,0,7,1,9,1,0,0,90,42,89,0,16,0,0,0,0,0,10,0,109,90,42,90,0,89,134,0,0,0,90,16,0,0,0,0,0,10,0,27,0,128,3,1,27,1,128,1,0,10,0,89,35,1,0,0,90,16,0,0,0,0,0,10,0,27,0,128,16,1,27,1,128,1,0,10,0,89,35,1,0,0,90,16,0,0,0,0,0,10,0,38,0,0,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,102,1,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,174,1,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,0,72,16,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,184,1,0,0,7,1,13,128,0,0,72,3,1,1,0,35,13,128,1,0,34,13,128,1,0,7,1,214,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,0,4,16,0,0,0,0,0,10,0,0,16,27,0,128,3,1,27,1,128,1,0,10,0,89,35,1,0,0,90,0,4,16,0,0,0,0,0,10,0,0,3,27,0,128,16,1,27,1,128,1,0,10,0,89,35,1,0,0,90,16,0,0,0,0,0,10,0,90,104,0,0,0,0,0,0,0,89,11,2,0,0,90,112,0,0,43,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,182,2,0,0,34,182,2,0,0,7,1,0,0,0,0,7,1,182,2,0,0,35,0,128,1,0,34,0,128,1,0,35,196,2,0,0,34,196,2,0,0,7,1,0,0,0,0,7,1,196,2,0,0,35,0,128,2,0,34,0,128,2,0,35,210,2,0,0,34,210,2,0,0,7,1,0,0,0,0,7,1,210,2,0,0,35,0,128,3,0,34,0,128,3,0,35,224,2,0,0,34,224,2,0,0,7,1,0,0,0,0,7,1,224,2,0,0,35,0,128,127,0,34,0,128,127,0,35,224,2,0,0,34,224,2,0,0,7,1,0,0,0,0,7,1,224,2,0,0,90,104,0,0,0,0,0,0,0,89,11,2,0,0,90,104,0,0,0,0,0,0,0,89,11,2,0,0,90,104,0,0,0,0,0,0,0,89,11,2,0,0,90,109,90,104,0,0,0,0,0,0,0,89,240,2,0,0,90,112,0,0,44,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,155,3,0,0,34,155,3,0,0,7,1,0,0,0,0,7,1,155,3,0,0,35,0,128,1,0,34,0,128,1,0,35,169,3,0,0,34,169,3,0,0,7,1,0,0,0,0,7,1,169,3,0,0,35,0,128,2,0,34,0,128,2,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,3,0,34,0,128,3,0,35,197,3,0,0,34,197,3,0,0,7,1,0,0,0,0,7,1,197,3,0,0,35,0,128,127,0,34,0,128,127,0,35,197,3,0,0,34,197,3,0,0,7,1,0,0,0,0,7,1,197,3,0,0,90,104,0,0,0,0,0,0,0,89,240,2,0,0,90,104,0,0,0,0,0,0,0,89,240,2,0,0,90,104,0,0,0,0,0,0,0,89,240,2,0,0,90,109,90] as const;

export const STATS = { ops: 120, bytes: 967, labels: 27, unknownOps: 0, unresolvedSymbols: 34 } as const;
