// AUTO-GENERATED from data/maps/LavaridgeTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=191, bytes=1120, labels=41, unknownOps=0, unresolvedSymbols=33

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LavaridgeTown_MapScripts": 0,
  "LavaridgeTown_OnTransition": 10,
  "LavaridgeTown_EventScript_ClearLavaridgeWhiteOut": 86,
  "LavaridgeTown_EventScript_CheckSetRivalPos": 90,
  "LavaridgeTown_EventScript_SetRivalPos": 118,
  "LavaridgeTown_EventScript_ShowMtChimneyTrainers": 140,
  "LavaridgeTown_EventScript_HideMapNamePopup": 144,
  "LavaridgeTown_OnFrame": 148,
  "LavaridgeTown_EventScript_RivalGiveGoGoggles": 156,
  "LavaridgeTown_EventScript_MayGiveGoGoggles": 344,
  "LavaridgeTown_EventScript_BrendanGiveGoGoggles": 381,
  "LavaridgeTown_EventScript_RivalExit": 418,
  "LavaridgeTown_EventScript_PlayMayMusic": 504,
  "LavaridgeTown_EventScript_PlayBrendanMusic": 509,
  "LavaridgeTown_EventScript_RivalNoticePlayer": 514,
  "LavaridgeTown_EventScript_RivalExitHerbShop": 590,
  "LavaridgeTown_EventScript_RivalApproachPlayer1": 734,
  "LavaridgeTown_EventScript_RivalApproachPlayer2": 759,
  "LavaridgeTown_EventScript_RivalExit1": 784,
  "LavaridgeTown_EventScript_RivalExit2": 825,
  "LavaridgeTown_Movement_RivalExit2": 850,
  "LavaridgeTown_Movement_PlayerWatchRivalExit": 861,
  "LavaridgeTown_Movement_RivalExit1": 865,
  "LavaridgeTown_Movement_RivalApproachPlayer2": 875,
  "LavaridgeTown_Movement_RivalApproachPlayer1": 882,
  "LavaridgeTown_Movement_RivalExitHerbShop": 886,
  "LavaridgeTown_EventScript_HotSpringsTrigger": 888,
  "LavaridgeTown_EventScript_EnteredHotSprings": 917,
  "LavaridgeTown_EventScript_ExpertM": 920,
  "LavaridgeTown_EventScript_OldMan": 929,
  "LavaridgeTown_EventScript_Twin": 938,
  "LavaridgeTown_EventScript_HotSpringsOldWoman1": 947,
  "LavaridgeTown_EventScript_HotSpringsOldWoman2": 956,
  "LavaridgeTown_EventScript_ExpertF": 965,
  "LavaridgeTown_EventScript_EggWoman": 974,
  "LavaridgeTown_EventScript_ReceivedEgg": 1063,
  "LavaridgeTown_EventScript_NoRoomForEgg": 1073,
  "LavaridgeTown_EventScript_DeclineEgg": 1083,
  "LavaridgeTown_EventScript_TownSign": 1093,
  "LavaridgeTown_EventScript_GymSign": 1102,
  "LavaridgeTown_EventScript_HerbShopSign": 1111,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,148,0,0,0,42,0,0,44,108,0,8,1,86,0,0,0,44,139,0,8,1,140,0,0,0,5,0,0,0,0,5,0,0,0,0,35,83,64,1,0,34,83,64,1,0,8,1,90,0,0,0,8,1,83,64,0,0,35,83,64,1,0,34,83,64,1,0,8,1,144,0,0,0,8,1,83,64,0,0,3,43,108,0,4,67,4,128,5,128,35,4,128,9,0,34,4,128,9,0,7,1,118,0,0,0,7,1,4,128,0,0,4,100,0,0,11,0,9,0,100,0,0,9,0,8,0,102,0,0,7,43,161,3,4,43,109,3,4,42,0,0,4,83,64,1,0,156,0,0,0,106,67,8,128,9,128,35,8,128,9,0,34,8,128,9,0,8,1,2,2,0,0,8,1,8,128,0,0,35,8,128,9,0,34,8,128,9,0,8,5,78,2,0,0,8,5,8,128,0,0,41,20,0,161,35,13,128,0,0,34,13,128,0,0,8,1,248,1,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,253,1,0,0,8,1,13,128,0,0,35,8,128,9,0,34,8,128,9,0,8,1,222,2,0,0,8,1,8,128,0,0,35,8,128,9,0,34,8,128,9,0,8,5,247,2,0,0,8,5,8,128,0,0,161,35,13,128,0,0,34,13,128,0,0,7,1,88,1,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,125,1,0,0,7,1,13,128,0,0,3,16,0,0,0,0,0,10,4,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,4,6,162,1,0,0,3,16,0,0,0,0,0,10,4,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,4,6,162,1,0,0,3,105,84,0,0,85,0,0,0,0,86,0,0,87,0,0,0,0,41,30,0,35,8,128,9,0,34,8,128,9,0,8,1,16,3,0,0,8,1,8,128,0,0,35,8,128,9,0,34,8,128,9,0,8,5,57,3,0,0,8,5,8,128,0,0,84,0,0,85,0,0,0,0,23,83,64,2,0,43,0,0,53,0,0,54,108,3,52,159,1,1,4,52,165,1,1,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,173,12,0,15,0,175,86,0,0,87,0,0,0,0,80,0,0,118,3,0,0,81,0,0,118,3,0,0,0,0,82,0,0,83,0,0,0,0,174,12,0,15,0,175,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,114,3,0,0,81,0,0,114,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,107,3,0,0,81,0,0,107,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,93,3,0,0,81,255,0,93,3,0,0,0,0,80,0,0,97,3,0,0,81,0,0,97,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,82,3,0,0,81,0,0,82,3,0,0,0,0,82,0,0,83,0,0,0,0,4,24,24,24,22,22,22,22,22,22,22,254,20,19,40,254,21,24,24,24,24,24,24,24,24,254,10,10,10,10,10,10,254,10,10,9,254,8,254,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,149,3,0,0,7,1,13,128,0,0,3,196,49,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,44,10,1,7,1,39,4,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,59,4,0,0,7,1,13,128,0,0,68,35,13,128,6,0,34,13,128,6,0,7,1,49,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,10,1,50,114,1,104,0,0,0,0,51,123,104,1,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3] as const;

export const STATS = { ops: 191, bytes: 1120, labels: 41, unknownOps: 0, unresolvedSymbols: 33 } as const;
