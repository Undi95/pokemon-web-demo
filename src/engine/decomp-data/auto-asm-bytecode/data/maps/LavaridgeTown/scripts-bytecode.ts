// AUTO-GENERATED from data/maps/LavaridgeTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=191, bytes=874, labels=41, unknownOps=13, unresolvedSymbols=41

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LavaridgeTown_MapScripts": 0,
  "LavaridgeTown_OnTransition": 10,
  "LavaridgeTown_EventScript_ClearLavaridgeWhiteOut": 62,
  "LavaridgeTown_EventScript_CheckSetRivalPos": 65,
  "LavaridgeTown_EventScript_SetRivalPos": 80,
  "LavaridgeTown_EventScript_ShowMtChimneyTrainers": 101,
  "LavaridgeTown_EventScript_HideMapNamePopup": 104,
  "LavaridgeTown_OnFrame": 107,
  "LavaridgeTown_EventScript_RivalGiveGoGoggles": 115,
  "LavaridgeTown_EventScript_MayGiveGoGoggles": 206,
  "LavaridgeTown_EventScript_BrendanGiveGoGoggles": 243,
  "LavaridgeTown_EventScript_RivalExit": 280,
  "LavaridgeTown_EventScript_PlayMayMusic": 340,
  "LavaridgeTown_EventScript_PlayBrendanMusic": 344,
  "LavaridgeTown_EventScript_RivalNoticePlayer": 348,
  "LavaridgeTown_EventScript_RivalExitHerbShop": 423,
  "LavaridgeTown_EventScript_RivalApproachPlayer1": 566,
  "LavaridgeTown_EventScript_RivalApproachPlayer2": 590,
  "LavaridgeTown_EventScript_RivalExit1": 614,
  "LavaridgeTown_EventScript_RivalExit2": 654,
  "LavaridgeTown_Movement_RivalExit2": 678,
  "LavaridgeTown_Movement_PlayerWatchRivalExit": 678,
  "LavaridgeTown_Movement_RivalExit1": 678,
  "LavaridgeTown_Movement_RivalApproachPlayer2": 678,
  "LavaridgeTown_Movement_RivalApproachPlayer1": 678,
  "LavaridgeTown_Movement_RivalExitHerbShop": 678,
  "LavaridgeTown_EventScript_HotSpringsTrigger": 678,
  "LavaridgeTown_EventScript_EnteredHotSprings": 695,
  "LavaridgeTown_EventScript_ExpertM": 698,
  "LavaridgeTown_EventScript_OldMan": 707,
  "LavaridgeTown_EventScript_Twin": 716,
  "LavaridgeTown_EventScript_HotSpringsOldWoman1": 725,
  "LavaridgeTown_EventScript_HotSpringsOldWoman2": 734,
  "LavaridgeTown_EventScript_ExpertF": 743,
  "LavaridgeTown_EventScript_EggWoman": 752,
  "LavaridgeTown_EventScript_ReceivedEgg": 817,
  "LavaridgeTown_EventScript_NoRoomForEgg": 827,
  "LavaridgeTown_EventScript_DeclineEgg": 837,
  "LavaridgeTown_EventScript_TownSign": 847,
  "LavaridgeTown_EventScript_GymSign": 856,
  "LavaridgeTown_EventScript_HerbShopSign": 865,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,107,0,0,0,42,0,0,44,108,0,8,1,62,0,0,0,44,139,0,8,1,101,0,0,0,88,0,0,0,0,88,0,0,0,0,35,83,64,1,0,34,83,64,1,0,35,83,64,1,0,34,83,64,1,0,90,43,108,0,67,4,128,5,128,35,4,128,9,0,34,4,128,9,0,100,0,0,11,0,9,0,100,0,0,9,0,8,0,102,0,0,7,43,161,3,43,109,3,42,0,0,83,64,1,0,115,0,0,0,106,67,8,128,9,128,35,8,128,9,0,34,8,128,9,0,35,8,128,9,0,34,8,128,9,0,4,20,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,35,8,128,9,0,34,8,128,9,0,35,8,128,9,0,34,8,128,9,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,0,89,24,1,0,0,90,16,0,0,0,0,0,10,0,27,0,128,23,1,27,1,128,1,0,10,0,42,221,0,16,0,0,0,0,0,10,0,89,24,1,0,0,90,105,84,0,0,85,0,0,0,0,86,0,0,87,0,0,0,0,4,30,35,8,128,9,0,34,8,128,9,0,35,8,128,9,0,34,8,128,9,0,84,0,0,85,0,0,0,0,113,83,2,0,43,0,0,53,0,0,54,108,90,52,159,1,1,52,165,1,1,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,12,0,15,0,175,86,0,0,87,0,0,0,0,80,0,0,166,2,0,0,81,0,0,166,2,0,0,0,0,82,0,0,83,0,0,0,0,174,12,0,15,0,175,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,166,2,0,0,81,0,0,166,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,166,2,0,0,81,0,0,166,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,166,2,0,0,81,255,0,166,2,0,0,0,0,80,0,0,166,2,0,0,81,0,0,166,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,166,2,0,0,81,0,0,166,2,0,0,0,0,82,0,0,83,0,0,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,90,0,49,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,10,1,7,1,49,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,68,35,13,128,6,0,34,13,128,6,0,16,0,0,0,0,0,10,0,42,10,1,50,114,1,104,0,0,0,0,51,123,104,1,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 191, bytes: 874, labels: 41, unknownOps: 13, unresolvedSymbols: 41 } as const;
