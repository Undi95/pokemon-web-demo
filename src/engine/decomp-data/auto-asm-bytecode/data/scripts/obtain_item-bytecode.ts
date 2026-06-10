// AUTO-GENERATED from data/scripts/obtain_item-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=134, bytes=1003, labels=28, unknownOps=0, unresolvedSymbols=38

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Std_ObtainItem": 0,
  "EventScript_ObtainItemMessage": 16,
  "EventScript_BufferPocketNameAndTryFanfare": 78,
  "EventScript_BufferItemsPocket": 244,
  "EventScript_BufferKeyItemsPocket": 274,
  "EventScript_BufferPokeballsPocket": 304,
  "EventScript_BufferTMHMsPocket": 334,
  "EventScript_BufferBerriesPocket": 364,
  "EventScript_ObtainedItem": 394,
  "EventScript_NoRoomForItem": 414,
  "EventScript_PlayFanfareObtainedItem": 420,
  "EventScript_PlayFanfareObtainedTMHM": 424,
  "Std_ObtainDecoration": 428,
  "EventScript_ObtainDecorationMessage": 442,
  "EventScript_ObtainedDecor": 494,
  "EventScript_NoRoomForDecor": 517,
  "Std_FindItem": 523,
  "EventScript_PickUpItem": 609,
  "EventScript_PutBattlePyramidItemInBag": 728,
  "EventScript_FoundTMHM": 737,
  "EventScript_FoundItem": 752,
  "EventScript_NoRoomToPickUpItem": 758,
  "EventScript_HiddenItemScript": 780,
  "EventScript_PickUpHiddenItem": 854,
  "EventScript_FoundHiddenTMHM": 915,
  "EventScript_FoundHiddenItem": 935,
  "EventScript_PutHiddenItemInPocket": 946,
  "EventScript_NoRoomForHiddenItem": 980,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [69,0,0,0,0,26,0,0,0,0,5,16,0,0,0,4,227,0,1,2,0,0,0,0,0,73,0,0,5,78,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,138,1,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,158,1,0,0,8,1,0,0,0,0,4,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,244,0,0,0,34,244,0,0,0,7,1,0,0,0,0,7,1,244,0,0,0,35,0,0,0,0,34,0,0,0,0,35,18,1,0,0,34,18,1,0,0,7,1,0,0,0,0,7,1,18,1,0,0,35,0,0,0,0,34,0,0,0,0,35,48,1,0,0,34,48,1,0,0,7,1,0,0,0,0,7,1,48,1,0,0,35,0,0,0,0,34,0,0,0,0,35,78,1,0,0,34,78,1,0,0,7,1,0,0,0,0,7,1,78,1,0,0,35,0,0,0,0,34,0,0,0,0,35,108,1,0,0,34,108,1,0,0,7,1,0,0,0,0,7,1,108,1,0,0,3,133,0,1,2,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,164,1,0,0,8,1,0,0,0,0,4,133,0,1,2,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,164,1,0,0,8,1,0,0,0,0,4,133,0,1,2,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,164,1,0,0,8,1,0,0,0,0,4,133,0,1,2,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,168,1,0,0,8,1,0,0,0,0,4,133,0,1,2,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,164,1,0,0,8,1,0,0,0,0,4,104,0,0,0,0,51,16,0,0,0,0,0,10,4,23,0,0,1,0,4,23,0,0,0,0,4,50,114,1,4,50,116,1,4,76,0,0,26,0,0,0,0,5,186,1,0,0,4,130,0,1,2,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,238,1,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,5,2,0,0,8,1,0,0,0,0,4,50,114,1,104,0,0,0,0,51,16,0,0,0,0,0,10,4,23,0,0,1,0,4,23,0,0,0,0,4,107,91,49,26,0,0,0,0,26,0,0,0,0,71,0,0,0,0,26,0,0,0,0,227,0,1,2,0,0,0,0,0,73,0,0,5,78,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,97,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,246,2,0,0,8,1,0,0,0,0,109,4,84,0,0,85,0,0,0,0,69,0,0,0,0,39,0,0,0,0,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,225,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,240,2,0,0,8,1,0,0,0,0,51,103,227,0,1,2,0,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,216,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,227,0,1,2,0,0,0,0,0,104,0,0,0,0,4,104,0,0,0,0,4,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,23,0,0,0,0,4,106,49,69,0,0,1,0,26,0,0,0,0,227,0,1,2,0,0,0,1,0,73,0,0,5,78,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,86,3,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,212,3,0,0,7,1,0,0,0,0,3,26,0,0,0,0,26,0,0,0,0,39,0,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,147,3,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,167,3,0,0,7,1,0,0,0,0,3,227,0,1,2,0,0,0,1,0,104,0,0,0,0,6,178,3,0,0,3,104,0,0,0,0,6,178,3,0,0,3,103,51,227,0,1,2,0,0,0,1,0,26,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,38,0,0,0,108,3,16,0,0,0,0,0,10,4,16,0,0,0,0,0,10,4,23,0,0,0,0,108,3] as const;

export const STATS = { ops: 134, bytes: 1003, labels: 28, unknownOps: 0, unresolvedSymbols: 38 } as const;
