// AUTO-GENERATED from data/maps/LilycoveCity_LilycoveMuseum_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=147, bytes=919, labels=34, unknownOps=0, unresolvedSymbols=24

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_LilycoveMuseum_2F_MapScripts": 0,
  "LilycoveCity_LilycoveMuseum_2F_OnLoad": 10,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_CheckBeautyPainting": 25,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_CheckCutePainting": 40,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_CheckSmartPainting": 55,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_CheckToughPainting": 70,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_SetCoolPainting": 80,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_SetBeautyPainting": 104,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_SetCutePainting": 128,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_SetSmartPainting": 152,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_SetToughPainting": 176,
  "LilycoveCity_LilycoveMuseum_2F_OnFrame": 195,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ShowExhibitHall": 203,
  "LilycoveCity_LilycoveMuseum_2F_Movement_PlayerWalkInPlaceLeft": 376,
  "LilycoveCity_LilycoveMuseum_2F_Movement_FaceExhibitHall": 378,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_Curator": 381,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_AddedPainting": 571,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ThankPlayer": 580,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_GiveGlassOrnament": 642,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_NoRoomForGlassOrnament": 701,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ReceivedGlassOrnament": 717,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_CutePainting": 727,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ToughPainting": 746,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_CoolPainting": 765,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_BeautyPainting": 784,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_SmartPainting": 803,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_Girl": 822,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ExpertM": 831,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_RichBoy": 840,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ShowCoolPainting": 849,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ShowBeautyPainting": 863,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ShowCutePainting": 877,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ShowSmartPainting": 891,
  "LilycoveCity_LilycoveMuseum_2F_EventScript_ShowToughPainting": 905,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,10,0,0,0,2,195,0,0,0,44,160,0,7,1,80,0,0,0,6,25,0,0,0,3,44,161,0,7,1,104,0,0,0,6,40,0,0,0,3,44,162,0,7,1,128,0,0,0,6,55,0,0,0,3,44,163,0,7,1,152,0,0,0,6,70,0,0,0,3,44,164,0,7,1,176,0,0,0,3,163,10,0,6,0,94,2,1,0,163,11,0,6,0,95,2,1,0,6,25,0,0,0,3,163,18,0,6,0,92,2,1,0,163,19,0,6,0,93,2,1,0,6,40,0,0,0,3,163,14,0,10,0,96,2,1,0,163,15,0,10,0,97,2,1,0,6,55,0,0,0,3,163,6,0,10,0,90,2,1,0,163,7,0,10,0,91,2,1,0,6,70,0,0,0,3,163,2,0,6,0,98,2,1,0,163,3,0,6,0,99,2,1,0,3,148,64,0,0,203,0,0,0,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,255,0,120,1,0,0,81,255,0,120,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,3,80,0,0,122,1,0,0,81,0,0,122,1,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,122,1,0,0,81,255,0,122,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,120,1,0,0,81,255,0,120,1,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,3,23,148,64,1,0,26,148,64,1,0,108,3,39,254,1,20,254,106,44,236,0,7,1,205,2,0,0,39,4,128,0,0,58,26,0,128,4,128,35,0,128,1,0,34,0,128,1,0,35,59,2,0,0,34,59,2,0,0,7,1,0,0,0,0,7,1,59,2,0,0,35,0,128,2,0,34,0,128,2,0,35,59,2,0,0,34,59,2,0,0,7,1,0,0,0,0,7,1,59,2,0,0,35,0,128,3,0,34,0,128,3,0,35,59,2,0,0,34,59,2,0,0,7,1,0,0,0,0,7,1,59,2,0,0,35,0,128,4,0,34,0,128,4,0,35,59,2,0,0,34,59,2,0,0,7,1,0,0,0,0,7,1,59,2,0,0,35,0,128,5,0,34,0,128,5,0,35,68,2,0,0,34,68,2,0,0,7,1,0,0,0,0,7,1,68,2,0,0,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,122,1,0,0,81,0,0,122,1,0,0,0,0,16,0,0,0,0,0,10,4,6,130,2,0,0,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,4,27,0,128,44,0,10,7,35,13,128,0,0,34,13,128,0,0,7,1,189,2,0,0,7,1,13,128,0,0,42,236,0,105,108,3,5,0,0,0,0,16,0,0,0,0,0,10,4,105,108,3,16,0,0,0,0,0,10,2,108,3,106,44,162,0,7,1,109,3,0,0,16,0,0,0,0,0,10,3,3,106,44,164,0,7,1,137,3,0,0,16,0,0,0,0,0,10,3,3,106,44,160,0,7,1,81,3,0,0,16,0,0,0,0,0,10,3,3,106,44,161,0,7,1,95,3,0,0,16,0,0,0,0,0,10,3,3,106,44,163,0,7,1,123,3,0,0,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,152,1,120,9,108,3,16,0,0,0,0,0,10,3,152,1,120,10,108,3,16,0,0,0,0,0,10,3,152,1,120,11,108,3,16,0,0,0,0,0,10,3,152,1,120,12,108,3,16,0,0,0,0,0,10,3,152,1,120,13,108,3] as const;

export const STATS = { ops: 147, bytes: 919, labels: 34, unknownOps: 0, unresolvedSymbols: 24 } as const;
