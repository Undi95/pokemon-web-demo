// AUTO-GENERATED from data/maps/LavaridgeTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=191, bytes=1117, labels=41, unknownOps=0, unresolvedSymbols=35

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
  "LavaridgeTown_EventScript_MayGiveGoGoggles": 343,
  "LavaridgeTown_EventScript_BrendanGiveGoGoggles": 380,
  "LavaridgeTown_EventScript_RivalExit": 417,
  "LavaridgeTown_EventScript_PlayMayMusic": 501,
  "LavaridgeTown_EventScript_PlayBrendanMusic": 506,
  "LavaridgeTown_EventScript_RivalNoticePlayer": 511,
  "LavaridgeTown_EventScript_RivalExitHerbShop": 587,
  "LavaridgeTown_EventScript_RivalApproachPlayer1": 731,
  "LavaridgeTown_EventScript_RivalApproachPlayer2": 756,
  "LavaridgeTown_EventScript_RivalExit1": 781,
  "LavaridgeTown_EventScript_RivalExit2": 822,
  "LavaridgeTown_Movement_RivalExit2": 847,
  "LavaridgeTown_Movement_PlayerWatchRivalExit": 858,
  "LavaridgeTown_Movement_RivalExit1": 862,
  "LavaridgeTown_Movement_RivalApproachPlayer2": 872,
  "LavaridgeTown_Movement_RivalApproachPlayer1": 879,
  "LavaridgeTown_Movement_RivalExitHerbShop": 883,
  "LavaridgeTown_EventScript_HotSpringsTrigger": 885,
  "LavaridgeTown_EventScript_EnteredHotSprings": 914,
  "LavaridgeTown_EventScript_ExpertM": 917,
  "LavaridgeTown_EventScript_OldMan": 926,
  "LavaridgeTown_EventScript_Twin": 935,
  "LavaridgeTown_EventScript_HotSpringsOldWoman1": 944,
  "LavaridgeTown_EventScript_HotSpringsOldWoman2": 953,
  "LavaridgeTown_EventScript_ExpertF": 962,
  "LavaridgeTown_EventScript_EggWoman": 971,
  "LavaridgeTown_EventScript_ReceivedEgg": 1060,
  "LavaridgeTown_EventScript_NoRoomForEgg": 1070,
  "LavaridgeTown_EventScript_DeclineEgg": 1080,
  "LavaridgeTown_EventScript_TownSign": 1090,
  "LavaridgeTown_EventScript_GymSign": 1099,
  "LavaridgeTown_EventScript_HerbShopSign": 1108,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,148,0,0,0,42,0,0,44,108,0,8,1,86,0,0,0,44,139,0,8,1,140,0,0,0,88,0,0,0,0,88,0,0,0,0,35,83,64,1,0,34,83,64,1,0,8,1,90,0,0,0,8,1,83,64,0,0,35,83,64,1,0,34,83,64,1,0,8,1,144,0,0,0,8,1,83,64,0,0,90,43,108,0,15,67,4,128,5,128,35,4,128,9,0,34,4,128,9,0,7,1,118,0,0,0,7,1,4,128,0,0,15,100,0,0,11,0,9,0,100,0,0,9,0,8,0,102,0,0,7,43,161,3,15,43,109,3,15,42,0,0,15,83,64,1,0,156,0,0,0,106,67,8,128,9,128,35,8,128,9,0,34,8,128,9,0,8,1,255,1,0,0,8,1,8,128,0,0,35,8,128,9,0,34,8,128,9,0,8,5,75,2,0,0,8,5,8,128,0,0,4,20,161,35,13,128,0,0,34,13,128,0,0,8,1,245,1,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,250,1,0,0,8,1,13,128,0,0,35,8,128,9,0,34,8,128,9,0,8,1,219,2,0,0,8,1,8,128,0,0,35,8,128,9,0,34,8,128,9,0,8,5,244,2,0,0,8,5,8,128,0,0,161,35,13,128,0,0,34,13,128,0,0,7,1,87,1,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,124,1,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,4,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,4,89,161,1,0,0,90,16,0,0,0,0,0,10,4,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,4,89,161,1,0,0,90,105,84,0,0,85,0,0,0,0,86,0,0,87,0,0,0,0,4,30,35,8,128,9,0,34,8,128,9,0,8,1,13,3,0,0,8,1,8,128,0,0,35,8,128,9,0,34,8,128,9,0,8,5,54,3,0,0,8,5,8,128,0,0,84,0,0,85,0,0,0,0,113,83,2,0,43,0,0,53,0,0,54,108,90,52,159,1,1,15,52,165,1,1,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,173,12,0,15,0,175,86,0,0,87,0,0,0,0,80,0,0,115,3,0,0,81,0,0,115,3,0,0,0,0,82,0,0,83,0,0,0,0,174,12,0,15,0,175,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,111,3,0,0,81,0,0,111,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,104,3,0,0,81,0,0,104,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,90,3,0,0,81,255,0,90,3,0,0,0,0,80,0,0,94,3,0,0,81,0,0,94,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,79,3,0,0,81,0,0,79,3,0,0,0,0,82,0,0,83,0,0,0,0,15,24,24,24,22,22,22,22,22,22,22,254,20,19,40,254,21,24,24,24,24,24,24,24,24,254,10,10,10,10,10,10,254,10,10,9,254,8,254,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,146,3,0,0,7,1,13,128,0,0,90,0,49,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,91,44,10,1,7,1,36,4,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,56,4,0,0,7,1,13,128,0,0,68,35,13,128,6,0,34,13,128,6,0,7,1,46,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,10,1,50,114,1,104,0,0,0,0,51,123,104,1,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90] as const;

export const STATS = { ops: 191, bytes: 1117, labels: 41, unknownOps: 0, unresolvedSymbols: 35 } as const;
