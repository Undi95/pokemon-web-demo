// AUTO-GENERATED from data/maps/MauvilleCity_BikeShop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=120, bytes=727, labels=27, unknownOps=2, unresolvedSymbols=34

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MauvilleCity_BikeShop_MapScripts": 0,
  "MauvilleCity_BikeShop_EventScript_Rydel": 0,
  "MauvilleCity_BikeShop_EventScript_SkipGreeting": 57,
  "MauvilleCity_BikeShop_EventScript_ChooseBike": 86,
  "MauvilleCity_BikeShop_EventScript_NotFar": 145,
  "MauvilleCity_BikeShop_EventScript_YesFar": 158,
  "MauvilleCity_BikeShop_EventScript_GetMachBike": 167,
  "MauvilleCity_BikeShop_EventScript_GetAcroBike": 193,
  "MauvilleCity_BikeShop_EventScript_ComeBackToSwitchBikes": 219,
  "MauvilleCity_BikeShop_EventScript_AskSwitchBikes": 233,
  "MauvilleCity_BikeShop_EventScript_SwitchBikes": 262,
  "MauvilleCity_BikeShop_EventScript_KeepBike": 310,
  "MauvilleCity_BikeShop_EventScript_SwitchAcroForMach": 320,
  "MauvilleCity_BikeShop_EventScript_SwitchMachForAcro": 350,
  "MauvilleCity_BikeShop_EventScript_Assistant": 380,
  "MauvilleCity_BikeShop_EventScript_MachBikeHandbook": 389,
  "MauvilleCity_BikeShop_EventScript_ChooseMachHandbookPage": 403,
  "MauvilleCity_BikeShop_EventScript_HowToRide": 514,
  "MauvilleCity_BikeShop_EventScript_HowToTurn": 528,
  "MauvilleCity_BikeShop_EventScript_SandySlopes": 542,
  "MauvilleCity_BikeShop_EventScript_ExitMachHandbook": 556,
  "MauvilleCity_BikeShop_EventScript_AcroBikeHandbook": 558,
  "MauvilleCity_BikeShop_EventScript_ChooseAcroHandbookPage": 572,
  "MauvilleCity_BikeShop_EventScript_Wheelies": 683,
  "MauvilleCity_BikeShop_EventScript_BunnyHops": 697,
  "MauvilleCity_BikeShop_EventScript_Jumps": 711,
  "MauvilleCity_BikeShop_EventScript_ExitAcroHandbook": 725,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,90,0,7,1,233,0,0,0,44,89,0,7,1,57,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,104,0,0,0,0,0,0,0,112,21,8,12,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,167,0,0,0,34,167,0,0,0,35,0,128,1,0,34,0,128,1,0,35,193,0,0,0,34,193,0,0,0,90,42,89,0,16,0,0,0,0,0,10,0,109,90,42,90,0,89,86,0,0,0,90,16,0,0,0,0,0,10,0,27,0,128,3,1,27,1,128,1,0,10,0,89,219,0,0,0,90,16,0,0,0,0,0,10,0,27,0,128,16,1,27,1,128,1,0,10,0,89,219,0,0,0,90,16,0,0,0,0,0,10,0,38,0,0,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,72,16,1,1,0,35,13,128,1,0,34,13,128,1,0,72,3,1,1,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,0,4,16,0,0,0,0,0,10,0,0,16,27,0,128,3,1,27,1,128,1,0,10,0,89,219,0,0,0,90,0,4,16,0,0,0,0,0,10,0,0,3,27,0,128,16,1,27,1,128,1,0,10,0,89,219,0,0,0,90,16,0,0,0,0,0,10,0,90,104,0,0,0,0,0,0,0,89,147,1,0,0,90,112,0,0,43,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,2,2,0,0,34,2,2,0,0,35,0,128,1,0,34,0,128,1,0,35,16,2,0,0,34,16,2,0,0,35,0,128,2,0,34,0,128,2,0,35,30,2,0,0,34,30,2,0,0,35,0,128,3,0,34,0,128,3,0,35,44,2,0,0,34,44,2,0,0,35,0,128,127,0,34,0,128,127,0,35,44,2,0,0,34,44,2,0,0,90,104,0,0,0,0,0,0,0,89,147,1,0,0,90,104,0,0,0,0,0,0,0,89,147,1,0,0,90,104,0,0,0,0,0,0,0,89,147,1,0,0,90,109,90,104,0,0,0,0,0,0,0,89,60,2,0,0,90,112,0,0,44,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,171,2,0,0,34,171,2,0,0,35,0,128,1,0,34,0,128,1,0,35,185,2,0,0,34,185,2,0,0,35,0,128,2,0,34,0,128,2,0,35,199,2,0,0,34,199,2,0,0,35,0,128,3,0,34,0,128,3,0,35,213,2,0,0,34,213,2,0,0,35,0,128,127,0,34,0,128,127,0,35,213,2,0,0,34,213,2,0,0,90,104,0,0,0,0,0,0,0,89,60,2,0,0,90,104,0,0,0,0,0,0,0,89,60,2,0,0,90,104,0,0,0,0,0,0,0,89,60,2,0,0,90,109,90] as const;

export const STATS = { ops: 120, bytes: 727, labels: 27, unknownOps: 2, unresolvedSymbols: 34 } as const;
