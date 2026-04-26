// AUTO-GENERATED from data/scripts/day_care-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=206, bytes=933, labels=30, unknownOps=13, unresolvedSymbols=61

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route117_EventScript_DaycareMan": 0,
  "Route117_EventScript_DaycareEggWaiting": 52,
  "Route117_EventScript_DaycareAcceptEgg": 105,
  "Route117_EventScript_DaycareReceiveEgg": 131,
  "Route117_EventScript_CheckMonReceivedMail": 158,
  "Route117_EventScript_MonReceivedMail": 174,
  "Route117_EventScript_CheckOnOneMon": 182,
  "Route117_EventScript_CheckOnTwoMons": 205,
  "Route117_PokemonDayCare_EventScript_DaycareWoman": 249,
  "Route117_PokemonDayCare_EventScript_GiveMonToRaise": 315,
  "Route117_PokemonDayCare_EventScript_ComeAgain": 432,
  "Route117_PokemonDayCare_EventScript_CanRaiseOneMore": 442,
  "Route117_PokemonDayCare_EventScript_OnlyOneMon": 466,
  "Route117_PokemonDayCare_EventScript_OnlyOneAliveMon": 476,
  "Route117_PokemonDayCare_EventScript_OnlyTwoAliveMons": 486,
  "Route117_PokemonDayCare_EventScript_EggWaiting": 496,
  "Route117_PokemonDayCare_EventScript_YourMonHasGrownXLevels": 506,
  "Route117_PokemonDayCare_EventScript_DisplayLevelsGained": 514,
  "Route117_PokemonDayCare_EventScript_OneMonInDaycare": 530,
  "Route117_PokemonDayCare_EventScript_TryRetrieveMon": 589,
  "Route117_PokemonDayCare_EventScript_CostPrompt": 650,
  "Route117_PokemonDayCare_EventScript_CheckEnoughMoney": 678,
  "Route117_PokemonDayCare_EventScript_RetrieveMon": 704,
  "Route117_PokemonDayCare_EventScript_AskRetrieveOtherMon": 786,
  "Route117_PokemonDayCare_EventScript_NoRoom": 810,
  "Route117_PokemonDayCare_Movement_RetrieveDaycareMon": 820,
  "Route117_PokemonDayCare_EventScript_UnusedEnd": 820,
  "Route117_PokemonDayCare_EventScript_TwoMonsInDaycare": 821,
  "Route117_PokemonDayCare_EventScript_UnusedRetrieveMon": 875,
  "EventScript_EggHatch": 918,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,38,0,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,43,134,0,38,0,0,0,109,90,39,13,128,0,0,0,35,13,128,6,0,34,13,128,6,0,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,50,111,1,51,110,16,0,0,0,0,0,10,0,38,0,0,0,43,134,0,109,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,0,0,88,158,0,0,0,109,90,38,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,0,0,0,110,113,4,0,0,88,158,0,0,0,113,4,1,0,88,158,0,0,0,109,90,107,91,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,35,13,128,3,0,34,13,128,3,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,109,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,39,13,128,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,152,1,38,0,0,0,35,4,128,255,0,34,4,128,255,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,39,5,128,0,0,0,49,162,5,128,0,0,16,0,0,0,0,0,10,0,198,38,0,0,0,0,47,39,13,128,0,0,0,35,13,128,2,0,34,13,128,2,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,176,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,39,13,128,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,0,0,88,2,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,176,1,0,0,90,39,13,128,0,0,0,35,13,128,6,0,34,13,128,6,0,39,13,128,0,0,0,113,4,0,0,35,13,128,2,0,34,13,128,2,0,38,0,0,0,26,4,128,13,128,35,13,128,2,0,34,13,128,2,0,89,138,2,0,0,90,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,176,1,0,0,90,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,109,90,80,0,0,52,3,0,0,81,0,0,52,3,0,0,0,0,82,0,0,83,0,0,0,0,39,13,128,0,0,0,38,0,0,0,9,95,0,16,0,0,0,0,0,10,0,49,162,13,128,0,0,16,0,0,0,0,0,10,0,198,39,13,128,0,0,0,35,13,128,2,0,34,13,128,2,0,89,176,1,0,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,89,176,1,0,0,90,16,0,0,0,0,0,10,0,109,90,90,16,0,0,0,0,0,10,0,113,4,0,0,88,2,2,0,0,113,4,1,0,88,2,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,109,90,38,0,0,0,35,13,128,2,0,34,13,128,2,0,26,4,128,13,128,39,13,128,0,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,109,90,106,16,0,0,0,0,0,10,0,38,0,0,0,108,90] as const;

export const STATS = { ops: 206, bytes: 933, labels: 30, unknownOps: 13, unresolvedSymbols: 61 } as const;
