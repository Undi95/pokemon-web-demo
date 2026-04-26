// AUTO-GENERATED from data/maps/Route123_BerryMastersHouse/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=99, bytes=751, labels=15, unknownOps=0, unresolvedSymbols=18

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route123_BerryMastersHouse_MapScripts": 0,
  "Route123_BerryMastersHouse_OnTransition": 5,
  "Route123_BerryMastersHouse_EventScript_BerryMaster": 9,
  "Route123_BerryMastersHouse_EventScript_ReceivedBerryToday": 136,
  "Route123_BerryMastersHouse_EventScript_BerryMastersWife": 146,
  "Route123_BerryMastersHouse_EventScript_CancelPhrase": 222,
  "Route123_BerryMastersHouse_EventScript_GavePhrase": 240,
  "Route123_BerryMastersHouse_EventScript_GiveNormalBerry": 373,
  "Route123_BerryMastersHouse_EventScript_GiveSpelonBerry": 428,
  "Route123_BerryMastersHouse_EventScript_GivePamtreBerry": 488,
  "Route123_BerryMastersHouse_EventScript_GiveWatmelBerry": 548,
  "Route123_BerryMastersHouse_EventScript_GiveDurinBerry": 608,
  "Route123_BerryMastersHouse_EventScript_GiveBelueBerry": 668,
  "Route123_BerryMastersHouse_EventScript_ReceivedWifeBerryToday": 728,
  "Route123_BerryMastersHouse_EventScript_GaveBerry": 738,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,90,107,91,46,44,0,0,7,1,136,0,0,0,16,0,0,0,0,0,10,4,144,0,0,115,13,0,115,13,0,27,0,128,13,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,0,0,16,0,0,0,0,0,10,4,144,0,0,115,13,0,115,13,0,27,0,128,13,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,107,91,46,44,0,0,7,1,216,2,0,0,16,0,0,0,0,0,10,4,113,4,13,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,7,1,240,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,222,0,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,109,90,35,4,128,0,0,34,4,128,0,0,7,1,117,1,0,0,7,1,4,128,0,0,35,4,128,1,0,34,4,128,1,0,7,1,172,1,0,0,7,1,4,128,0,0,35,4,128,2,0,34,4,128,2,0,7,1,232,1,0,0,7,1,4,128,0,0,35,4,128,3,0,34,4,128,3,0,7,1,36,2,0,0,7,1,4,128,0,0,35,4,128,4,0,34,4,128,4,0,7,1,96,2,0,0,7,1,4,128,0,0,35,4,128,5,0,34,4,128,5,0,7,1,156,2,0,0,7,1,4,128,0,0,90,16,0,0,0,0,0,10,4,144,0,0,115,13,0,27,0,128,13,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,89,226,2,0,0,109,90,44,248,0,7,1,117,1,0,0,16,0,0,0,0,0,10,4,27,0,128,163,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,248,0,89,226,2,0,0,90,44,249,0,7,1,117,1,0,0,16,0,0,0,0,0,10,4,27,0,128,164,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,249,0,89,226,2,0,0,90,44,250,0,7,1,117,1,0,0,16,0,0,0,0,0,10,4,27,0,128,165,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,250,0,89,226,2,0,0,90,44,251,0,7,1,117,1,0,0,16,0,0,0,0,0,10,4,27,0,128,166,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,251,0,89,226,2,0,0,90,44,252,0,7,1,117,1,0,0,16,0,0,0,0,0,10,4,27,0,128,167,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,252,0,89,226,2,0,0,90,16,0,0,0,0,0,10,4,109,90,42,0,0,16,0,0,0,0,0,10,4,109,90] as const;

export const STATS = { ops: 99, bytes: 751, labels: 15, unknownOps: 0, unresolvedSymbols: 18 } as const;
