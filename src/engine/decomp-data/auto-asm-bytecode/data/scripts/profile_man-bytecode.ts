// AUTO-GENERATED from data/scripts/profile_man-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=66, bytes=230, labels=13, unknownOps=5, unresolvedSymbols=18

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "ProfileMan_EventScript_Man": 0,
  "ProfileMan_EventScript_AskToSeeProfile": 25,
  "ProfileMan_EventScript_Info": 39,
  "ProfileMan_EventScript_CreateProfile": 53,
  "ProfileMan_EventScript_CancelShowProfile": 94,
  "ProfileMan_EventScript_ShowProfile": 104,
  "ProfileMan_EventScript_DeclineShowProfile": 127,
  "ProfileMan_EventScript_GivenProfileBefore": 137,
  "ProfileMan_EventScript_AskToSeeNewProfile": 151,
  "ProfileMan_EventScript_InfoNewProfile": 165,
  "ProfileMan_EventScript_CreateNewProfile": 179,
  "ProfileMan_EventScript_DeclineNewProfile": 220,
  "ProfileMan_EventScript_Ret": 230,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,0,0,7,1,137,0,0,0,16,0,0,0,0,0,10,0,89,25,0,0,0,90,16,0,0,0,0,0,10,0,112,17,6,20,0,90,16,0,0,0,0,0,10,0,89,25,0,0,0,90,16,0,0,0,0,0,10,0,105,113,4,0,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,109,90,113,4,0,0,38,0,0,0,0,0,0,4,80,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,89,151,0,0,0,90,16,0,0,0,0,0,10,0,112,17,6,20,0,90,16,0,0,0,0,0,10,0,89,151,0,0,0,90,16,0,0,0,0,0,10,0,105,113,4,0,0,88,0,0,0,0,107,91,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 66, bytes: 230, labels: 13, unknownOps: 5, unresolvedSymbols: 18 } as const;
