// AUTO-GENERATED from data/scripts/pc-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=45, bytes=156, labels=9, unknownOps=3, unresolvedSymbols=18

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_PC": 0,
  "EventScript_PCMainMenu": 26,
  "EventScript_AccessPC": 44,
  "EventScript_AccessPlayersPC": 45,
  "EventScript_AccessPokemonStorage": 66,
  "EventScript_AccessSomeonesPC": 105,
  "EventScript_AccessLanettesPC": 113,
  "EventScript_TurnOffPC": 121,
  "EventScript_AccessHallOfFame": 134,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,113,4,0,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,0,89,26,0,0,0,90,104,0,0,0,0,0,0,0,38,0,0,0,89,44,0,0,0,90,90,9,2,0,16,0,0,0,0,0,10,0,38,0,0,0,89,26,0,0,0,90,9,2,0,44,0,0,8,0,105,0,0,0,44,0,0,8,1,113,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,89,26,0,0,0,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,4,0,0,9,3,0,38,0,0,0,108,90,44,0,0,7,0,121,0,0,0,9,2,0,38,0,0,0,89,44,0,0,0,90] as const;

export const STATS = { ops: 45, bytes: 156, labels: 9, unknownOps: 3, unresolvedSymbols: 18 } as const;
