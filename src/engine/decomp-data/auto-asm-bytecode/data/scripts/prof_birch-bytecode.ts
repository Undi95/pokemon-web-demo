// AUTO-GENERATED from data/scripts/prof_birch-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=61, bytes=313, labels=9, unknownOps=2, unresolvedSymbols=16

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "ProfBirch_EventScript_UpdateLocation": 0,
  "ProfBirch_EventScript_MoveToLab": 100,
  "ProfBirch_EventScript_MoveToRoute101": 113,
  "ProfBirch_EventScript_MoveToRoute103": 126,
  "ProfBirch_EventScript_RatePokedexOrRegister": 139,
  "ProfBirch_EventScript_AskRatePokedex": 159,
  "ProfBirch_EventScript_DeclineRating": 184,
  "ProfBirch_EventScript_ShowRatingMessage": 194,
  "ProfBirch_EventScript_RatePokedex": 208,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [35,133,64,0,0,34,133,64,0,0,44,0,0,7,1,100,0,0,0,35,73,64,0,0,34,73,64,0,0,35,73,64,1,0,34,73,64,1,0,35,73,64,2,0,34,73,64,2,0,35,73,64,3,0,34,73,64,3,0,35,73,64,4,0,34,73,64,4,0,35,73,64,5,0,34,73,64,5,0,35,73,64,6,0,34,73,64,6,0,35,73,64,7,0,34,73,64,7,0,15,43,209,2,43,128,3,42,129,3,42,130,3,15,43,129,3,42,209,2,42,128,3,42,130,3,15,43,130,3,42,129,3,42,209,2,42,128,3,15,107,91,44,47,1,7,0,159,0,0,0,44,25,1,7,0,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,208,0,0,0,109,90,16,0,0,0,0,0,10,0,109,90,26,4,128,9,128,38,0,0,0,0,0,0,110,15,113,4,0,0,39,13,128,0,0,0,26,8,128,5,128,26,9,128,6,128,26,10,128,13,128,132,0,1,2,0,8,128,132,0,1,2,0,9,128,16,0,0,0,0,0,10,0,88,194,0,0,0,35,10,128,0,0,34,10,128,0,0,113,4,1,0,39,13,128,0,0,0,26,8,128,5,128,26,9,128,6,128,132,0,1,2,0,8,128,132,0,1,2,0,9,128,16,0,0,0,0,0,10,0,15] as const;

export const STATS = { ops: 61, bytes: 313, labels: 9, unknownOps: 2, unresolvedSymbols: 16 } as const;
