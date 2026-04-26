// AUTO-GENERATED from data/scripts/day_care-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=206, bytes=957, labels=30, unknownOps=2, unresolvedSymbols=61

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route117_EventScript_DaycareMan": 0,
  "Route117_EventScript_DaycareEggWaiting": 52,
  "Route117_EventScript_DaycareAcceptEgg": 105,
  "Route117_EventScript_DaycareReceiveEgg": 131,
  "Route117_EventScript_CheckMonReceivedMail": 158,
  "Route117_EventScript_MonReceivedMail": 175,
  "Route117_EventScript_CheckOnOneMon": 184,
  "Route117_EventScript_CheckOnTwoMons": 207,
  "Route117_PokemonDayCare_EventScript_DaycareWoman": 251,
  "Route117_PokemonDayCare_EventScript_GiveMonToRaise": 317,
  "Route117_PokemonDayCare_EventScript_ComeAgain": 434,
  "Route117_PokemonDayCare_EventScript_CanRaiseOneMore": 444,
  "Route117_PokemonDayCare_EventScript_OnlyOneMon": 468,
  "Route117_PokemonDayCare_EventScript_OnlyOneAliveMon": 478,
  "Route117_PokemonDayCare_EventScript_OnlyTwoAliveMons": 488,
  "Route117_PokemonDayCare_EventScript_EggWaiting": 498,
  "Route117_PokemonDayCare_EventScript_YourMonHasGrownXLevels": 508,
  "Route117_PokemonDayCare_EventScript_DisplayLevelsGained": 517,
  "Route117_PokemonDayCare_EventScript_OneMonInDaycare": 534,
  "Route117_PokemonDayCare_EventScript_TryRetrieveMon": 593,
  "Route117_PokemonDayCare_EventScript_CostPrompt": 654,
  "Route117_PokemonDayCare_EventScript_CheckEnoughMoney": 682,
  "Route117_PokemonDayCare_EventScript_RetrieveMon": 708,
  "Route117_PokemonDayCare_EventScript_AskRetrieveOtherMon": 790,
  "Route117_PokemonDayCare_EventScript_NoRoom": 814,
  "Route117_PokemonDayCare_Movement_RetrieveDaycareMon": 824,
  "Route117_PokemonDayCare_EventScript_UnusedEnd": 844,
  "Route117_PokemonDayCare_EventScript_TwoMonsInDaycare": 845,
  "Route117_PokemonDayCare_EventScript_UnusedRetrieveMon": 899,
  "EventScript_EggHatch": 942,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,38,0,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,43,134,0,38,0,0,0,109,90,39,13,128,0,0,0,35,13,128,6,0,34,13,128,6,0,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,50,111,1,51,110,16,0,0,0,0,0,10,0,38,0,0,0,43,134,0,109,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,15,16,0,0,0,0,0,10,0,15,38,0,0,0,16,0,0,0,0,0,10,0,113,4,0,0,88,158,0,0,0,109,90,38,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,0,0,0,110,113,4,0,0,88,158,0,0,0,113,4,1,0,88,158,0,0,0,109,90,107,91,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,109,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,39,13,128,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,152,1,38,0,0,0,35,4,128,255,0,34,4,128,255,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,39,5,128,0,0,0,49,162,5,128,0,0,16,0,0,0,0,0,10,0,198,38,0,0,0,0,47,39,13,128,0,0,0,35,13,128,2,0,34,13,128,2,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,178,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,15,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,15,16,0,0,0,0,0,10,0,113,4,0,0,88,5,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,178,1,0,0,90,39,13,128,0,0,0,35,13,128,6,0,34,13,128,6,0,39,13,128,0,0,0,113,4,0,0,35,13,128,2,0,34,13,128,2,0,38,0,0,0,26,4,128,13,128,35,13,128,2,0,34,13,128,2,0,89,142,2,0,0,90,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,178,1,0,0,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,109,90,80,0,0,56,3,0,0,81,0,0,56,3,0,0,0,0,82,0,0,83,0,0,0,0,39,13,128,0,0,0,38,0,0,0,9,95,0,16,0,0,0,0,0,10,0,49,162,13,128,0,0,16,0,0,0,0,0,10,0,198,39,13,128,0,0,0,35,13,128,2,0,34,13,128,2,0,89,178,1,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,178,1,0,0,90,16,0,0,0,0,0,10,0,109,90,20,20,2,20,20,3,20,20,1,5,84,20,20,20,20,20,0,85,4,254,90,16,0,0,0,0,0,10,0,113,4,0,0,88,5,2,0,0,113,4,1,0,88,5,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,109,90,38,0,0,0,35,13,128,2,0,34,13,128,2,0,26,4,128,13,128,39,13,128,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,109,90,106,16,0,0,0,0,0,10,0,38,0,0,0,108,90] as const;

export const STATS = { ops: 206, bytes: 957, labels: 30, unknownOps: 2, unresolvedSymbols: 61 } as const;
