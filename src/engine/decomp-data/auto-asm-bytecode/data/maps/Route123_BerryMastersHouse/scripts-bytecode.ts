// AUTO-GENERATED from data/maps/Route123_BerryMastersHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=99, bytes=762, labels=15, unknownOps=0, unresolvedSymbols=40

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
export const BYTECODE: readonly number[] = [0,5,0,0,0,42,0,0,3,107,91,46,44,0,0,7,1,144,0,0,0,16,0,0,0,0,0,10,4,144,0,0,24,0,0,0,0,24,0,0,0,0,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,16,0,0,0,0,0,10,4,144,0,0,24,0,0,0,0,24,0,0,0,0,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,46,44,0,0,7,1,227,2,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,0,0,0,0,107,91,35,0,0,1,0,34,0,0,1,0,7,1,249,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,231,0,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,109,3,35,0,0,0,0,34,0,0,0,0,7,1,126,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,183,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,243,1,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,47,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,107,2,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,167,2,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,144,0,0,24,0,0,0,0,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,6,237,2,0,0,109,3,44,0,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,6,237,2,0,0,3,44,0,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,6,237,2,0,0,3,44,0,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,6,237,2,0,0,3,44,0,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,6,237,2,0,0,3,44,0,0,7,1,126,1,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,6,237,2,0,0,3,16,0,0,0,0,0,10,4,109,3,42,0,0,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 99, bytes: 762, labels: 15, unknownOps: 0, unresolvedSymbols: 40 } as const;
