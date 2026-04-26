// AUTO-GENERATED from data/scripts/obtain_item-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=134, bytes=724, labels=28, unknownOps=2, unresolvedSymbols=23

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Std_ObtainItem": 0,
  "EventScript_ObtainItemMessage": 16,
  "EventScript_BufferPocketNameAndTryFanfare": 54,
  "EventScript_BufferItemsPocket": 160,
  "EventScript_BufferKeyItemsPocket": 178,
  "EventScript_BufferPokeballsPocket": 196,
  "EventScript_BufferTMHMsPocket": 214,
  "EventScript_BufferBerriesPocket": 232,
  "EventScript_ObtainedItem": 250,
  "EventScript_NoRoomForItem": 269,
  "EventScript_PlayFanfareObtainedItem": 274,
  "EventScript_PlayFanfareObtainedTMHM": 278,
  "Std_ObtainDecoration": 282,
  "EventScript_ObtainDecorationMessage": 296,
  "EventScript_ObtainedDecor": 324,
  "EventScript_NoRoomForDecor": 346,
  "Std_FindItem": 351,
  "EventScript_PickUpItem": 413,
  "EventScript_PutBattlePyramidItemInBag": 497,
  "EventScript_FoundTMHM": 506,
  "EventScript_FoundItem": 521,
  "EventScript_NoRoomToPickUpItem": 527,
  "EventScript_HiddenItemScript": 548,
  "EventScript_PickUpHiddenItem": 598,
  "EventScript_FoundHiddenTMHM": 635,
  "EventScript_FoundHiddenItem": 655,
  "EventScript_PutHiddenItemInPocket": 666,
  "EventScript_NoRoomForHiddenItem": 702,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [69,0,0,0,0,26,7,128,13,128,88,16,0,0,0,15,227,0,1,2,0,0,0,0,0,73,0,0,88,54,0,0,0,35,7,128,1,0,34,7,128,1,0,35,7,128,0,0,34,7,128,0,0,15,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,160,0,0,0,34,160,0,0,0,35,0,128,5,0,34,0,128,5,0,35,178,0,0,0,34,178,0,0,0,35,0,128,2,0,34,0,128,2,0,35,196,0,0,0,34,196,0,0,0,35,0,128,3,0,34,0,128,3,0,35,214,0,0,0,34,214,0,0,0,35,0,128,4,0,34,0,128,4,0,35,232,0,0,0,34,232,0,0,0,90,133,0,1,2,0,14,0,35,7,128,1,0,34,7,128,1,0,15,133,0,1,2,0,15,0,35,7,128,1,0,34,7,128,1,0,15,133,0,1,2,0,16,0,35,7,128,1,0,34,7,128,1,0,15,133,0,1,2,0,17,0,35,7,128,1,0,34,7,128,1,0,15,133,0,1,2,0,18,0,35,7,128,1,0,34,7,128,1,0,15,104,0,0,0,0,51,16,0,0,0,0,0,10,0,113,13,1,0,15,113,13,0,0,15,50,114,1,15,50,116,1,15,76,0,0,26,7,128,13,128,88,40,1,0,0,15,130,0,1,2,0,0,0,35,7,128,1,0,34,7,128,1,0,35,7,128,0,0,34,7,128,0,0,15,50,114,1,104,0,0,0,0,51,16,0,0,0,0,0,10,0,113,13,1,0,15,113,13,0,0,15,107,91,49,26,4,128,0,0,26,5,128,0,0,71,0,0,0,0,26,7,128,13,128,227,0,1,2,0,0,0,0,0,73,0,0,88,54,0,0,0,35,7,128,1,0,34,7,128,1,0,35,7,128,0,0,34,7,128,0,0,109,15,84,15,128,85,15,128,0,0,69,4,128,5,128,39,13,128,0,0,0,26,8,128,13,128,35,8,128,1,0,34,8,128,1,0,35,8,128,0,0,34,8,128,0,0,51,0,0,0,227,0,1,2,0,4,128,5,128,113,4,12,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,227,0,1,2,0,4,128,5,128,104,0,0,0,0,15,104,0,0,0,0,15,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,13,0,0,15,106,49,69,5,128,1,0,26,7,128,13,128,227,0,1,2,0,5,128,1,0,73,5,128,88,54,0,0,0,35,7,128,1,0,34,7,128,1,0,35,7,128,0,0,34,7,128,0,0,90,26,8,128,4,128,26,4,128,5,128,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,227,0,1,2,0,4,128,1,0,104,0,0,0,0,89,154,2,0,0,90,104,0,0,0,0,89,154,2,0,0,90,0,0,0,51,227,0,1,2,0,4,128,1,0,26,4,128,8,128,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,108,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,113,13,0,0,108,90] as const;

export const STATS = { ops: 134, bytes: 724, labels: 28, unknownOps: 2, unresolvedSymbols: 23 } as const;
