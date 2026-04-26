// AUTO-GENERATED from data/maps/Route113_GlassWorkshop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=214, bytes=971, labels=34, unknownOps=5, unresolvedSymbols=31

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route113_GlassWorkshop_MapScripts": 0,
  "Route113_GlassWorkshop_OnTransition": 5,
  "Route113_GlassWorkshop_EventScript_ReenterWorkshopAfterSootSack": 19,
  "Route113_GlassWorkshop_EventScript_GlassWorker": 23,
  "Route113_GlassWorkshop_EventScript_ExplainSootSack": 89,
  "Route113_GlassWorkshop_EventScript_CheckCollectedAsh": 99,
  "Route113_GlassWorkshop_EventScript_SootSackNotInBag": 146,
  "Route113_GlassWorkshop_EventScript_ChooseGlassItem": 156,
  "Route113_GlassWorkshop_EventScript_BlueFlute": 169,
  "Route113_GlassWorkshop_EventScript_YellowFlute": 227,
  "Route113_GlassWorkshop_EventScript_RedFlute": 285,
  "Route113_GlassWorkshop_EventScript_WhiteFlute": 343,
  "Route113_GlassWorkshop_EventScript_BlackFlute": 401,
  "Route113_GlassWorkshop_EventScript_PrettyChair": 459,
  "Route113_GlassWorkshop_EventScript_PrettyDesk": 521,
  "Route113_GlassWorkshop_EventScript_CancelGlassItemSelect": 583,
  "Route113_GlassWorkshop_EventScript_NotEnoughAsh": 593,
  "Route113_GlassWorkshop_EventScript_NotEnoughAshForItem": 619,
  "Route113_GlassWorkshop_EventScript_ChooseDifferentItem": 645,
  "Route113_GlassWorkshop_EventScript_MakeGlassItem": 659,
  "Route113_GlassWorkshop_EventScript_GiveGlassFlute": 711,
  "Route113_GlassWorkshop_EventScript_GiveGlassDecor": 733,
  "Route113_GlassWorkshop_EventScript_NoRoomForFlute": 750,
  "Route113_GlassWorkshop_EventScript_NoRoomForDecor": 765,
  "Route113_GlassWorkshop_EventScript_GiveItemAfterNoRoom": 780,
  "Route113_GlassWorkshop_EventScript_GiveBlueFlute": 781,
  "Route113_GlassWorkshop_EventScript_GiveYellowFlute": 802,
  "Route113_GlassWorkshop_EventScript_GiveRedFlute": 823,
  "Route113_GlassWorkshop_EventScript_GiveWhiteFlute": 844,
  "Route113_GlassWorkshop_EventScript_GiveBlackFlute": 865,
  "Route113_GlassWorkshop_EventScript_GivePrettyChair": 886,
  "Route113_GlassWorkshop_EventScript_GivePrettyDesk": 907,
  "Route113_GlassWorkshop_EventScript_TryGiveItemAgain": 928,
  "Route113_GlassWorkshop_EventScript_NinjaBoy": 962,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,35,190,64,1,0,34,190,64,1,0,90,113,190,2,0,107,91,35,190,64,10,0,34,190,64,10,0,35,190,64,2,0,34,190,64,2,0,35,190,64,1,0,34,190,64,1,0,16,0,0,0,0,0,10,0,27,0,128,14,1,27,1,128,1,0,10,0,113,190,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,72,14,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,72,64,0,0,34,72,64,0,0,104,0,0,0,0,0,0,0,89,156,0,0,0,90,16,0,0,0,0,0,10,0,109,90,113,9,0,0,113,4,1,0,38,0,0,0,90,113,8,39,0,129,0,1,2,0,8,128,113,10,250,0,35,72,64,250,0,34,72,64,250,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,10,0,25,72,64,250,0,89,147,2,0,0,90,113,8,40,0,129,0,1,2,0,8,128,113,10,244,1,35,72,64,244,1,34,72,64,244,1,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,11,0,25,72,64,244,1,89,147,2,0,0,90,113,8,41,0,129,0,1,2,0,8,128,113,10,244,1,35,72,64,244,1,34,72,64,244,1,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,12,0,25,72,64,244,1,89,147,2,0,0,90,113,8,43,0,129,0,1,2,0,8,128,113,10,232,3,35,72,64,232,3,34,72,64,232,3,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,13,0,25,72,64,232,3,89,147,2,0,0,90,113,8,42,0,129,0,1,2,0,8,128,113,10,232,3,35,72,64,232,3,34,72,64,232,3,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,14,0,25,72,64,232,3,89,147,2,0,0,90,113,9,1,0,113,8,13,0,130,0,1,2,0,8,128,113,10,112,23,35,72,64,112,23,34,72,64,112,23,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,15,0,25,72,64,112,23,89,147,2,0,0,90,113,9,1,0,113,8,6,0,130,0,1,2,0,8,128,113,10,64,31,35,72,64,64,31,34,72,64,64,31,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,16,0,25,72,64,64,31,89,147,2,0,0,90,16,0,0,0,0,0,10,0,109,90,113,10,0,0,25,10,128,72,64,132,0,1,2,0,10,128,16,0,0,0,0,0,10,0,109,90,25,10,128,72,64,132,0,1,2,0,10,128,104,0,0,0,0,0,0,0,89,156,0,0,0,90,104,0,0,0,0,0,0,0,89,156,0,0,0,90,16,0,0,0,0,0,10,0,105,152,1,9,5,0,4,30,152,0,16,0,0,0,0,0,10,0,35,9,128,0,0,34,9,128,0,0,35,9,128,1,0,34,9,128,1,0,113,190,2,0,109,90,27,0,128,8,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,27,0,128,8,128,10,0,35,13,128,0,0,34,13,128,0,0,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,90,113,9,0,0,113,8,39,0,129,0,1,2,0,8,128,89,160,3,0,0,90,113,9,0,0,113,8,40,0,129,0,1,2,0,8,128,89,160,3,0,0,90,113,9,0,0,113,8,41,0,129,0,1,2,0,8,128,89,160,3,0,0,90,113,9,0,0,113,8,43,0,129,0,1,2,0,8,128,89,160,3,0,0,90,113,9,0,0,113,8,42,0,129,0,1,2,0,8,128,89,160,3,0,0,90,113,9,1,0,113,8,13,0,130,0,1,2,0,13,0,89,160,3,0,0,90,113,9,1,0,113,8,6,0,130,0,1,2,0,6,0,89,160,3,0,0,90,16,0,0,0,0,0,10,0,35,9,128,0,0,34,9,128,0,0,35,9,128,1,0,34,9,128,1,0,113,190,2,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 214, bytes: 971, labels: 34, unknownOps: 5, unresolvedSymbols: 31 } as const;
