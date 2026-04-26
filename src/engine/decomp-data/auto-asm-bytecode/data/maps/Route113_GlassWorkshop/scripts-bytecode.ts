// AUTO-GENERATED from data/maps/Route113_GlassWorkshop/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=214, bytes=1304, labels=34, unknownOps=2, unresolvedSymbols=31

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "Route113_GlassWorkshop_MapScripts": 0,
  "Route113_GlassWorkshop_OnTransition": 5,
  "Route113_GlassWorkshop_EventScript_ReenterWorkshopAfterSootSack": 19,
  "Route113_GlassWorkshop_EventScript_GlassWorker": 24,
  "Route113_GlassWorkshop_EventScript_ExplainSootSack": 90,
  "Route113_GlassWorkshop_EventScript_CheckCollectedAsh": 100,
  "Route113_GlassWorkshop_EventScript_SootSackNotInBag": 147,
  "Route113_GlassWorkshop_EventScript_ChooseGlassItem": 157,
  "Route113_GlassWorkshop_EventScript_BlueFlute": 355,
  "Route113_GlassWorkshop_EventScript_YellowFlute": 413,
  "Route113_GlassWorkshop_EventScript_RedFlute": 471,
  "Route113_GlassWorkshop_EventScript_WhiteFlute": 529,
  "Route113_GlassWorkshop_EventScript_BlackFlute": 587,
  "Route113_GlassWorkshop_EventScript_PrettyChair": 645,
  "Route113_GlassWorkshop_EventScript_PrettyDesk": 707,
  "Route113_GlassWorkshop_EventScript_CancelGlassItemSelect": 769,
  "Route113_GlassWorkshop_EventScript_NotEnoughAsh": 779,
  "Route113_GlassWorkshop_EventScript_NotEnoughAshForItem": 805,
  "Route113_GlassWorkshop_EventScript_ChooseDifferentItem": 831,
  "Route113_GlassWorkshop_EventScript_MakeGlassItem": 845,
  "Route113_GlassWorkshop_EventScript_GiveGlassFlute": 897,
  "Route113_GlassWorkshop_EventScript_GiveGlassDecor": 920,
  "Route113_GlassWorkshop_EventScript_NoRoomForFlute": 938,
  "Route113_GlassWorkshop_EventScript_NoRoomForDecor": 953,
  "Route113_GlassWorkshop_EventScript_GiveItemAfterNoRoom": 968,
  "Route113_GlassWorkshop_EventScript_GiveBlueFlute": 1114,
  "Route113_GlassWorkshop_EventScript_GiveYellowFlute": 1135,
  "Route113_GlassWorkshop_EventScript_GiveRedFlute": 1156,
  "Route113_GlassWorkshop_EventScript_GiveWhiteFlute": 1177,
  "Route113_GlassWorkshop_EventScript_GiveBlackFlute": 1198,
  "Route113_GlassWorkshop_EventScript_GivePrettyChair": 1219,
  "Route113_GlassWorkshop_EventScript_GivePrettyDesk": 1240,
  "Route113_GlassWorkshop_EventScript_TryGiveItemAgain": 1261,
  "Route113_GlassWorkshop_EventScript_NinjaBoy": 1295,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,35,190,64,1,0,34,190,64,1,0,90,113,190,2,0,15,107,91,35,190,64,10,0,34,190,64,10,0,35,190,64,2,0,34,190,64,2,0,35,190,64,1,0,34,190,64,1,0,16,0,0,0,0,0,10,0,27,0,128,14,1,27,1,128,1,0,10,0,113,190,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,72,14,1,1,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,35,72,64,0,0,34,72,64,0,0,104,0,0,0,0,0,0,0,89,157,0,0,0,90,16,0,0,0,0,0,10,0,109,90,113,9,0,0,113,4,1,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,99,1,0,0,34,99,1,0,0,35,0,128,1,0,34,0,128,1,0,35,157,1,0,0,34,157,1,0,0,35,0,128,2,0,34,0,128,2,0,35,215,1,0,0,34,215,1,0,0,35,0,128,3,0,34,0,128,3,0,35,17,2,0,0,34,17,2,0,0,35,0,128,4,0,34,0,128,4,0,35,75,2,0,0,34,75,2,0,0,35,0,128,5,0,34,0,128,5,0,35,133,2,0,0,34,133,2,0,0,35,0,128,6,0,34,0,128,6,0,35,195,2,0,0,34,195,2,0,0,35,0,128,7,0,34,0,128,7,0,35,1,3,0,0,34,1,3,0,0,35,0,128,127,0,34,0,128,127,0,35,1,3,0,0,34,1,3,0,0,90,113,8,39,0,129,0,1,2,0,8,128,113,10,250,0,35,72,64,250,0,34,72,64,250,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,10,0,25,72,64,250,0,89,77,3,0,0,90,113,8,40,0,129,0,1,2,0,8,128,113,10,244,1,35,72,64,244,1,34,72,64,244,1,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,11,0,25,72,64,244,1,89,77,3,0,0,90,113,8,41,0,129,0,1,2,0,8,128,113,10,244,1,35,72,64,244,1,34,72,64,244,1,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,12,0,25,72,64,244,1,89,77,3,0,0,90,113,8,43,0,129,0,1,2,0,8,128,113,10,232,3,35,72,64,232,3,34,72,64,232,3,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,13,0,25,72,64,232,3,89,77,3,0,0,90,113,8,42,0,129,0,1,2,0,8,128,113,10,232,3,35,72,64,232,3,34,72,64,232,3,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,14,0,25,72,64,232,3,89,77,3,0,0,90,113,9,1,0,113,8,13,0,130,0,1,2,0,8,128,113,10,112,23,35,72,64,112,23,34,72,64,112,23,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,15,0,25,72,64,112,23,89,77,3,0,0,90,113,9,1,0,113,8,6,0,130,0,1,2,0,8,128,113,10,64,31,35,72,64,64,31,34,72,64,64,31,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,113,190,16,0,25,72,64,64,31,89,77,3,0,0,90,16,0,0,0,0,0,10,0,109,90,113,10,0,0,25,10,128,72,64,132,0,1,2,0,10,128,16,0,0,0,0,0,10,0,109,90,25,10,128,72,64,132,0,1,2,0,10,128,104,0,0,0,0,0,0,0,89,157,0,0,0,90,104,0,0,0,0,0,0,0,89,157,0,0,0,90,16,0,0,0,0,0,10,0,105,152,1,9,5,0,4,30,152,0,16,0,0,0,0,0,10,0,35,9,128,0,0,34,9,128,0,0,35,9,128,1,0,34,9,128,1,0,113,190,2,0,109,90,27,0,128,8,128,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,15,27,0,128,8,128,10,0,35,13,128,0,0,34,13,128,0,0,15,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,26,0,128,190,64,35,0,128,10,0,34,0,128,10,0,35,90,4,0,0,34,90,4,0,0,35,0,128,11,0,34,0,128,11,0,35,111,4,0,0,34,111,4,0,0,35,0,128,12,0,34,0,128,12,0,35,132,4,0,0,34,132,4,0,0,35,0,128,13,0,34,0,128,13,0,35,153,4,0,0,34,153,4,0,0,35,0,128,14,0,34,0,128,14,0,35,174,4,0,0,34,174,4,0,0,35,0,128,15,0,34,0,128,15,0,35,195,4,0,0,34,195,4,0,0,35,0,128,16,0,34,0,128,16,0,35,216,4,0,0,34,216,4,0,0,90,113,9,0,0,113,8,39,0,129,0,1,2,0,8,128,89,237,4,0,0,90,113,9,0,0,113,8,40,0,129,0,1,2,0,8,128,89,237,4,0,0,90,113,9,0,0,113,8,41,0,129,0,1,2,0,8,128,89,237,4,0,0,90,113,9,0,0,113,8,43,0,129,0,1,2,0,8,128,89,237,4,0,0,90,113,9,0,0,113,8,42,0,129,0,1,2,0,8,128,89,237,4,0,0,90,113,9,1,0,113,8,13,0,130,0,1,2,0,13,0,89,237,4,0,0,90,113,9,1,0,113,8,6,0,130,0,1,2,0,6,0,89,237,4,0,0,90,16,0,0,0,0,0,10,0,35,9,128,0,0,34,9,128,0,0,35,9,128,1,0,34,9,128,1,0,113,190,2,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 214, bytes: 1304, labels: 34, unknownOps: 2, unresolvedSymbols: 31 } as const;
