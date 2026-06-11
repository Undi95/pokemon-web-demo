// AUTO-GENERATED from data/maps/MauvilleCity_BikeShop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=120, bytes=955, labels=27, unknownOps=0, unresolvedSymbols=37

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MauvilleCity_BikeShop_MapScripts": 0,
  "MauvilleCity_BikeShop_EventScript_Rydel": 0,
  "MauvilleCity_BikeShop_EventScript_SkipGreeting": 81,
  "MauvilleCity_BikeShop_EventScript_ChooseBike": 134,
  "MauvilleCity_BikeShop_EventScript_NotFar": 215,
  "MauvilleCity_BikeShop_EventScript_YesFar": 228,
  "MauvilleCity_BikeShop_EventScript_GetMachBike": 237,
  "MauvilleCity_BikeShop_EventScript_GetAcroBike": 263,
  "MauvilleCity_BikeShop_EventScript_ComeBackToSwitchBikes": 289,
  "MauvilleCity_BikeShop_EventScript_AskSwitchBikes": 303,
  "MauvilleCity_BikeShop_EventScript_SwitchBikes": 356,
  "MauvilleCity_BikeShop_EventScript_KeepBike": 428,
  "MauvilleCity_BikeShop_EventScript_SwitchAcroForMach": 438,
  "MauvilleCity_BikeShop_EventScript_SwitchMachForAcro": 471,
  "MauvilleCity_BikeShop_EventScript_Assistant": 504,
  "MauvilleCity_BikeShop_EventScript_MachBikeHandbook": 513,
  "MauvilleCity_BikeShop_EventScript_ChooseMachHandbookPage": 525,
  "MauvilleCity_BikeShop_EventScript_HowToRide": 696,
  "MauvilleCity_BikeShop_EventScript_HowToTurn": 708,
  "MauvilleCity_BikeShop_EventScript_SandySlopes": 720,
  "MauvilleCity_BikeShop_EventScript_ExitMachHandbook": 732,
  "MauvilleCity_BikeShop_EventScript_AcroBikeHandbook": 734,
  "MauvilleCity_BikeShop_EventScript_ChooseAcroHandbookPage": 746,
  "MauvilleCity_BikeShop_EventScript_Wheelies": 917,
  "MauvilleCity_BikeShop_EventScript_BunnyHops": 929,
  "MauvilleCity_BikeShop_EventScript_Jumps": 941,
  "MauvilleCity_BikeShop_EventScript_ExitAcroHandbook": 953,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,0,0,7,1,47,1,0,0,44,0,0,7,1,81,0,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,228,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,215,0,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,228,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,215,0,0,0,7,1,0,0,0,0,3,104,0,0,0,0,103,112,21,8,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,237,0,0,0,34,237,0,0,0,7,1,0,0,0,0,7,1,237,0,0,0,35,0,0,1,0,34,0,0,1,0,35,7,1,0,0,34,7,1,0,0,7,1,0,0,0,0,7,1,7,1,0,0,3,42,0,0,16,0,0,0,0,0,10,4,109,3,42,0,0,6,134,0,0,0,3,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,6,33,1,0,0,3,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,6,33,1,0,0,3,16,0,0,0,0,0,10,4,38,0,0,0,109,3,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,100,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,172,1,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,72,0,0,1,0,35,0,0,1,0,34,0,0,1,0,7,1,182,1,0,0,7,1,0,0,0,0,72,0,0,1,0,35,0,0,1,0,34,0,0,1,0,7,1,215,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,196,0,16,0,0,0,0,0,10,4,70,0,0,1,0,27,0,0,0,0,27,0,0,1,0,10,0,6,33,1,0,0,3,196,0,16,0,0,0,0,0,10,4,70,0,0,1,0,27,0,0,0,0,27,0,0,1,0,10,0,6,33,1,0,0,3,16,0,0,0,0,0,10,2,3,104,0,0,0,0,103,6,13,2,0,0,3,112,0,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,184,2,0,0,34,184,2,0,0,7,1,0,0,0,0,7,1,184,2,0,0,35,0,0,1,0,34,0,0,1,0,35,196,2,0,0,34,196,2,0,0,7,1,0,0,0,0,7,1,196,2,0,0,35,0,0,2,0,34,0,0,2,0,35,208,2,0,0,34,208,2,0,0,7,1,0,0,0,0,7,1,208,2,0,0,35,0,0,3,0,34,0,0,3,0,35,220,2,0,0,34,220,2,0,0,7,1,0,0,0,0,7,1,220,2,0,0,35,0,0,0,0,34,0,0,0,0,35,220,2,0,0,34,220,2,0,0,7,1,0,0,0,0,7,1,220,2,0,0,3,104,0,0,0,0,103,6,13,2,0,0,3,104,0,0,0,0,103,6,13,2,0,0,3,104,0,0,0,0,103,6,13,2,0,0,3,109,3,104,0,0,0,0,103,6,234,2,0,0,3,112,0,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,149,3,0,0,34,149,3,0,0,7,1,0,0,0,0,7,1,149,3,0,0,35,0,0,1,0,34,0,0,1,0,35,161,3,0,0,34,161,3,0,0,7,1,0,0,0,0,7,1,161,3,0,0,35,0,0,2,0,34,0,0,2,0,35,173,3,0,0,34,173,3,0,0,7,1,0,0,0,0,7,1,173,3,0,0,35,0,0,3,0,34,0,0,3,0,35,185,3,0,0,34,185,3,0,0,7,1,0,0,0,0,7,1,185,3,0,0,35,0,0,0,0,34,0,0,0,0,35,185,3,0,0,34,185,3,0,0,7,1,0,0,0,0,7,1,185,3,0,0,3,104,0,0,0,0,103,6,234,2,0,0,3,104,0,0,0,0,103,6,234,2,0,0,3,104,0,0,0,0,103,6,234,2,0,0,3,109,3] as const;

export const STATS = { ops: 120, bytes: 955, labels: 27, unknownOps: 0, unresolvedSymbols: 37 } as const;
