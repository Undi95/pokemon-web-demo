// AUTO-GENERATED from data/maps/Route123_BerryMastersHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=99, bytes=762, labels=15, unknownOps=0, unresolvedSymbols=18

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route123_BerryMastersHouse_MapScripts": 0,
  "Route123_BerryMastersHouse_OnTransition": 5,
  "Route123_BerryMastersHouse_EventScript_BerryMaster": 9,
  "Route123_BerryMastersHouse_EventScript_ReceivedBerryToday": 144,
  "Route123_BerryMastersHouse_EventScript_BerryMastersWife": 154,
  "Route123_BerryMastersHouse_EventScript_CancelPhrase": 231,
  "Route123_BerryMastersHouse_EventScript_GavePhrase": 249,
  "Route123_BerryMastersHouse_EventScript_GiveNormalBerry": 382,
  "Route123_BerryMastersHouse_EventScript_GiveSpelonBerry": 439,
  "Route123_BerryMastersHouse_EventScript_GivePamtreBerry": 499,
  "Route123_BerryMastersHouse_EventScript_GiveWatmelBerry": 559,
  "Route123_BerryMastersHouse_EventScript_GiveDurinBerry": 619,
  "Route123_BerryMastersHouse_EventScript_GiveBelueBerry": 679,
  "Route123_BerryMastersHouse_EventScript_ReceivedWifeBerryToday": 739,
  "Route123_BerryMastersHouse_EventScript_GaveBerry": 749,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,3,107,91,46,44,0,0,7,1,144,0,0,0,16,0,0,0,0,0,10,4,144,0,0,24,13,128,0,0,24,13,128,0,0,27,0,128,13,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,0,0,16,0,0,0,0,0,10,4,144,0,0,24,13,128,0,0,24,13,128,0,0,27,0,128,13,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,46,44,0,0,7,1,227,2,0,0,16,0,0,0,0,0,10,4,23,4,128,13,0,5,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,249,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,231,0,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,109,3,35,4,128,0,0,34,4,128,0,0,7,1,126,1,0,0,7,1,4,128,0,0,35,4,128,1,0,34,4,128,1,0,7,1,183,1,0,0,7,1,4,128,0,0,35,4,128,2,0,34,4,128,2,0,7,1,243,1,0,0,7,1,4,128,0,0,35,4,128,3,0,34,4,128,3,0,7,1,47,2,0,0,7,1,4,128,0,0,35,4,128,4,0,34,4,128,4,0,7,1,107,2,0,0,7,1,4,128,0,0,35,4,128,5,0,34,4,128,5,0,7,1,167,2,0,0,7,1,4,128,0,0,3,16,0,0,0,0,0,10,4,144,0,0,24,13,128,0,0,27,0,128,13,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,6,237,2,0,0,109,3,44,248,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,128,163,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,248,0,6,237,2,0,0,3,44,249,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,128,164,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,249,0,6,237,2,0,0,3,44,250,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,128,165,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,250,0,6,237,2,0,0,3,44,251,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,128,166,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,251,0,6,237,2,0,0,3,44,252,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,128,167,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,252,0,6,237,2,0,0,3,16,0,0,0,0,0,10,4,109,3,42,0,0,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 99, bytes: 762, labels: 15, unknownOps: 0, unresolvedSymbols: 18 } as const;
