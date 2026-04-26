// AUTO-GENERATED from data/scripts/pc-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=45, bytes=323, labels=9, unknownOps=0, unresolvedSymbols=17

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EventScript_PC": 0,
  "EventScript_PCMainMenu": 26,
  "EventScript_AccessPC": 44,
  "EventScript_AccessPlayersPC": 210,
  "EventScript_AccessPokemonStorage": 231,
  "EventScript_AccessSomeonesPC": 270,
  "EventScript_AccessLanettesPC": 279,
  "EventScript_TurnOffPC": 288,
  "EventScript_AccessHallOfFame": 301,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,113,4,0,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,4,89,26,0,0,0,90,104,0,0,0,0,0,0,0,38,0,0,0,89,44,0,0,0,90,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,231,0,0,0,34,231,0,0,0,7,1,0,0,0,0,7,1,231,0,0,0,35,0,128,1,0,34,0,128,1,0,35,210,0,0,0,34,210,0,0,0,7,1,0,0,0,0,7,1,210,0,0,0,35,0,128,2,0,34,0,128,2,0,35,45,1,0,0,34,45,1,0,0,7,1,0,0,0,0,7,1,45,1,0,0,35,0,128,3,0,34,0,128,3,0,35,32,1,0,0,34,32,1,0,0,7,1,0,0,0,0,7,1,32,1,0,0,35,0,128,127,0,34,0,128,127,0,35,32,1,0,0,34,32,1,0,0,7,1,0,0,0,0,7,1,32,1,0,0,90,9,2,0,16,0,0,0,0,0,10,4,38,0,0,0,89,26,0,0,0,90,9,2,0,44,0,0,8,0,14,1,0,0,44,0,0,8,1,23,1,0,0,16,0,0,0,0,0,10,4,38,0,0,0,89,26,0,0,0,90,16,0,0,0,0,0,10,4,15,16,0,0,0,0,0,10,4,15,113,4,0,0,9,3,0,38,0,0,0,108,90,44,0,0,7,0,32,1,0,0,9,2,0,38,0,0,0,89,44,0,0,0,90] as const;

export const STATS = { ops: 45, bytes: 323, labels: 9, unknownOps: 0, unresolvedSymbols: 17 } as const;
