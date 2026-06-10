// AUTO-GENERATED from data/scripts/day_care-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=206, bytes=1310, labels=30, unknownOps=0, unresolvedSymbols=75

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route117_EventScript_DaycareMan": 0,
  "Route117_EventScript_DaycareEggWaiting": 88,
  "Route117_EventScript_DaycareAcceptEgg": 165,
  "Route117_EventScript_DaycareReceiveEgg": 203,
  "Route117_EventScript_CheckMonReceivedMail": 230,
  "Route117_EventScript_MonReceivedMail": 259,
  "Route117_EventScript_CheckOnOneMon": 268,
  "Route117_EventScript_CheckOnTwoMons": 292,
  "Route117_PokemonDayCare_EventScript_DaycareWoman": 336,
  "Route117_PokemonDayCare_EventScript_GiveMonToRaise": 450,
  "Route117_PokemonDayCare_EventScript_ComeAgain": 627,
  "Route117_PokemonDayCare_EventScript_CanRaiseOneMore": 637,
  "Route117_PokemonDayCare_EventScript_OnlyOneMon": 673,
  "Route117_PokemonDayCare_EventScript_OnlyOneAliveMon": 683,
  "Route117_PokemonDayCare_EventScript_OnlyTwoAliveMons": 693,
  "Route117_PokemonDayCare_EventScript_EggWaiting": 703,
  "Route117_PokemonDayCare_EventScript_YourMonHasGrownXLevels": 713,
  "Route117_PokemonDayCare_EventScript_DisplayLevelsGained": 722,
  "Route117_PokemonDayCare_EventScript_OneMonInDaycare": 751,
  "Route117_PokemonDayCare_EventScript_TryRetrieveMon": 835,
  "Route117_PokemonDayCare_EventScript_CostPrompt": 933,
  "Route117_PokemonDayCare_EventScript_CheckEnoughMoney": 973,
  "Route117_PokemonDayCare_EventScript_RetrieveMon": 1011,
  "Route117_PokemonDayCare_EventScript_AskRetrieveOtherMon": 1105,
  "Route117_PokemonDayCare_EventScript_NoRoom": 1141,
  "Route117_PokemonDayCare_Movement_RetrieveDaycareMon": 1151,
  "Route117_PokemonDayCare_EventScript_UnusedEnd": 1171,
  "Route117_PokemonDayCare_EventScript_TwoMonsInDaycare": 1172,
  "Route117_PokemonDayCare_EventScript_UnusedRetrieveMon": 1240,
  "EventScript_EggHatch": 1295,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,38,0,0,0,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,88,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,12,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,36,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,165,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,165,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,43,0,0,38,0,0,0,109,3,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,203,0,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,109,3,104,0,0,0,0,50,111,1,51,110,16,0,0,0,0,0,10,4,38,0,0,0,43,0,0,109,3,39,0,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,3,1,0,0,8,1,0,0,0,0,4,16,0,0,0,0,0,10,4,4,38,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,230,0,0,0,109,3,38,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,38,0,0,0,103,110,23,0,0,0,0,5,230,0,0,0,23,0,0,1,0,5,230,0,0,0,109,3,107,91,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,191,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,239,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,148,4,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,194,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,39,0,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,161,2,0,0,7,1,0,0,0,0,39,0,0,0,0,0,35,0,0,2,0,34,0,0,2,0,7,1,181,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,152,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,115,2,0,0,7,1,0,0,0,0,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,171,2,0,0,7,1,0,0,0,0,39,0,0,0,0,0,49,162,0,0,0,0,16,0,0,0,0,0,10,4,198,38,0,0,0,196,0,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,125,2,0,0,7,1,0,0,0,0,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,194,1,0,0,7,1,0,0,0,0,6,115,2,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,4,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,5,201,2,0,0,8,5,0,0,0,0,4,16,0,0,0,0,0,10,4,23,0,0,0,0,5,210,2,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,194,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,67,3,0,0,7,1,0,0,0,0,6,115,2,0,0,3,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,117,4,0,0,7,1,0,0,0,0,39,0,0,0,0,0,23,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,165,3,0,0,7,1,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,115,2,0,0,7,1,0,0,0,0,6,165,3,0,0,3,38,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,205,3,0,0,7,1,0,0,0,0,6,115,2,0,0,3,39,0,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,243,3,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,80,0,0,127,4,0,0,81,0,0,127,4,0,0,0,0,82,0,0,83,0,0,0,0,39,0,0,0,0,0,38,0,0,0,48,95,0,16,0,0,0,0,0,10,4,49,162,0,0,0,0,16,0,0,0,0,0,10,4,198,39,0,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,81,4,0,0,7,1,0,0,0,0,6,115,2,0,0,3,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,67,3,0,0,7,1,0,0,0,0,6,115,2,0,0,3,16,0,0,0,0,0,10,4,109,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,16,0,0,0,0,0,10,4,23,0,0,0,0,5,210,2,0,0,23,0,0,1,0,5,210,2,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,67,3,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,38,0,0,0,35,0,0,2,0,34,0,0,2,0,7,1,115,2,0,0,7,1,0,0,0,0,26,0,0,0,0,39,0,0,0,0,0,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,109,3,106,16,0,0,0,0,0,10,4,38,0,0,0,108,3] as const;

export const STATS = { ops: 206, bytes: 1310, labels: 30, unknownOps: 0, unresolvedSymbols: 75 } as const;
