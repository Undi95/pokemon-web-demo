// AUTO-GENERATED from data/maps/LavaridgeTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=191, bytes=925, labels=41, unknownOps=2, unresolvedSymbols=41

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LavaridgeTown_MapScripts": 0,
  "LavaridgeTown_OnTransition": 10,
  "LavaridgeTown_EventScript_ClearLavaridgeWhiteOut": 62,
  "LavaridgeTown_EventScript_CheckSetRivalPos": 66,
  "LavaridgeTown_EventScript_SetRivalPos": 82,
  "LavaridgeTown_EventScript_ShowMtChimneyTrainers": 104,
  "LavaridgeTown_EventScript_HideMapNamePopup": 108,
  "LavaridgeTown_OnFrame": 112,
  "LavaridgeTown_EventScript_RivalGiveGoGoggles": 120,
  "LavaridgeTown_EventScript_MayGiveGoGoggles": 211,
  "LavaridgeTown_EventScript_BrendanGiveGoGoggles": 248,
  "LavaridgeTown_EventScript_RivalExit": 285,
  "LavaridgeTown_EventScript_PlayMayMusic": 345,
  "LavaridgeTown_EventScript_PlayBrendanMusic": 350,
  "LavaridgeTown_EventScript_RivalNoticePlayer": 355,
  "LavaridgeTown_EventScript_RivalExitHerbShop": 431,
  "LavaridgeTown_EventScript_RivalApproachPlayer1": 575,
  "LavaridgeTown_EventScript_RivalApproachPlayer2": 600,
  "LavaridgeTown_EventScript_RivalExit1": 625,
  "LavaridgeTown_EventScript_RivalExit2": 666,
  "LavaridgeTown_Movement_RivalExit2": 691,
  "LavaridgeTown_Movement_PlayerWatchRivalExit": 702,
  "LavaridgeTown_Movement_RivalExit1": 706,
  "LavaridgeTown_Movement_RivalApproachPlayer2": 716,
  "LavaridgeTown_Movement_RivalApproachPlayer1": 723,
  "LavaridgeTown_Movement_RivalExitHerbShop": 727,
  "LavaridgeTown_EventScript_HotSpringsTrigger": 729,
  "LavaridgeTown_EventScript_EnteredHotSprings": 746,
  "LavaridgeTown_EventScript_ExpertM": 749,
  "LavaridgeTown_EventScript_OldMan": 758,
  "LavaridgeTown_EventScript_Twin": 767,
  "LavaridgeTown_EventScript_HotSpringsOldWoman1": 776,
  "LavaridgeTown_EventScript_HotSpringsOldWoman2": 785,
  "LavaridgeTown_EventScript_ExpertF": 794,
  "LavaridgeTown_EventScript_EggWoman": 803,
  "LavaridgeTown_EventScript_ReceivedEgg": 868,
  "LavaridgeTown_EventScript_NoRoomForEgg": 878,
  "LavaridgeTown_EventScript_DeclineEgg": 888,
  "LavaridgeTown_EventScript_TownSign": 898,
  "LavaridgeTown_EventScript_GymSign": 907,
  "LavaridgeTown_EventScript_HerbShopSign": 916,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,112,0,0,0,42,0,0,44,108,0,8,1,62,0,0,0,44,139,0,8,1,104,0,0,0,88,0,0,0,0,88,0,0,0,0,35,83,64,1,0,34,83,64,1,0,35,83,64,1,0,34,83,64,1,0,90,43,108,0,15,67,4,128,5,128,35,4,128,9,0,34,4,128,9,0,15,100,0,0,11,0,9,0,100,0,0,9,0,8,0,102,0,0,7,43,161,3,15,43,109,3,15,42,0,0,15,83,64,1,0,120,0,0,0,106,67,8,128,9,128,35,8,128,9,0,34,8,128,9,0,35,8,128,9,0,34,8,128,9,0,4,20,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,35,8,128,9,0,34,8,128,9,0,35,8,128,9,0,34,8,128,9,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,0,89,29,1,0,0,90,16,0,0,0,0,0,10,0,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,0,89,29,1,0,0,90,105,84,0,0,85,0,0,0,0,86,0,0,87,0,0,0,0,4,30,35,8,128,9,0,34,8,128,9,0,35,8,128,9,0,34,8,128,9,0,84,0,0,85,0,0,0,0,113,83,2,0,43,0,0,53,0,0,54,108,90,52,159,1,1,15,52,165,1,1,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,173,12,0,15,0,175,86,0,0,87,0,0,0,0,80,0,0,215,2,0,0,81,0,0,215,2,0,0,0,0,82,0,0,83,0,0,0,0,174,12,0,15,0,175,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,211,2,0,0,81,0,0,211,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,204,2,0,0,81,0,0,204,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,190,2,0,0,81,255,0,190,2,0,0,0,0,80,0,0,194,2,0,0,81,0,0,194,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,179,2,0,0,81,0,0,179,2,0,0,0,0,82,0,0,83,0,0,0,0,15,24,24,24,22,22,22,22,22,22,22,254,20,19,40,254,21,24,24,24,24,24,24,24,24,254,10,10,10,10,10,10,254,10,10,9,254,8,254,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,90,0,49,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,10,1,7,1,100,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,68,35,13,128,6,0,34,13,128,6,0,16,0,0,0,0,0,10,0,42,10,1,50,114,1,104,0,0,0,0,51,123,104,1,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 191, bytes: 925, labels: 41, unknownOps: 2, unresolvedSymbols: 41 } as const;
