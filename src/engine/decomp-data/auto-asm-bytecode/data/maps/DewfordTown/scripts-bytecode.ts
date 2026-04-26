// AUTO-GENERATED from data/maps/DewfordTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=557, bytes=920, labels=35, unknownOps=16, unresolvedSymbols=57

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "DewfordTown_MapScripts": 0,
  "DewfordTown_OnTransition": 5,
  "DewfordTown_EventScript_Briney": 9,
  "DewfordTown_EventScript_ChoosePetalburg": 35,
  "DewfordTown_EventScript_ChooseSlateport": 51,
  "DewfordTown_EventScript_CancelSailSelect": 67,
  "DewfordTown_EventScript_ReturnToPetalburgPrompt": 78,
  "DewfordTown_EventScript_SailBackToPetalburg": 106,
  "DewfordTown_EventScript_Woman": 121,
  "DewfordTown_EventScript_TownSign": 130,
  "DewfordTown_EventScript_GymSign": 139,
  "DewfordTown_EventScript_HallSign": 148,
  "DewfordTown_EventScript_OldRodFisherman": 157,
  "DewfordTown_EventScript_GiveOldRod": 197,
  "DewfordTown_EventScript_NotGettingItchToFish": 230,
  "DewfordTown_EventScript_HowsFishing": 240,
  "DewfordTown_EventScript_FishingExcellent": 274,
  "DewfordTown_EventScript_FishingNotSoGood": 284,
  "DewfordTown_EventScript_SailToPetalburg": 294,
  "DewfordTown_EventScript_SailToSlateport": 513,
  "DewfordTown_EventScript_LandedSlateportDeliverGoods": 776,
  "DewfordTown_EventScript_LandedSlateport": 784,
  "DewfordTown_Movement_SailToPetalburg": 792,
  "DewfordTown_Movement_SailToSlateport": 792,
  "DewfordTown_Movement_PlayerBoardBoat": 792,
  "DewfordTown_Movement_ExitBoatPetalburg": 792,
  "DewfordTown_Movement_ExitBoatSlateport": 792,
  "DewfordTown_Movement_BrineyBoardBoat": 792,
  "DewfordTown_Movement_BrineyExitBoat": 792,
  "DewfordTown_EventScript_TrendyPhraseBoy": 792,
  "DewfordTown_EventScript_ConfirmTrendyPhrase": 828,
  "DewfordTown_EventScript_RejectTrendyPhrase": 838,
  "DewfordTown_EventScript_GiveNewTrendyPhrase": 878,
  "DewfordTown_EventScript_CancelNewTrendyPhrase": 900,
  "DewfordTown_EventScript_PhraseNotTrendyEnough": 910,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,42,0,0,90,107,91,44,189,0,7,0,78,0,0,0,104,0,0,0,0,0,0,0,113,21,6,0,2,0,90,16,0,0,0,0,0,10,0,105,89,38,1,0,0,109,90,16,0,0,0,0,0,10,0,105,89,1,2,0,0,109,90,16,0,0,0,0,0,10,0,105,109,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,105,89,38,1,0,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,1,1,7,1,240,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,27,0,128,6,1,27,1,128,1,0,10,0,42,1,1,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,0,0,0,112,20,8,50,1,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,88,0,0,0,0,169,0,0,0,0,0,169,255,0,0,0,0,80,0,0,24,3,0,0,81,0,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,255,0,24,3,0,0,81,255,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,90,255,0,0,0,88,0,0,0,0,80,0,0,24,3,0,0,81,0,0,24,3,0,0,0,0,80,255,0,24,3,0,0,81,255,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,89,255,0,0,0,88,0,0,0,0,80,255,0,24,3,0,0,81,255,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,89,255,0,0,0,43,227,2,43,113,3,43,230,2,42,231,2,90,0,0,0,0,113,142,2,0,170,255,0,0,0,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,4,0,5,4,0,0,0,26,150,64,8,128,0,109,90,88,0,0,0,0,169,0,0,0,0,0,169,255,0,0,0,1,80,0,0,24,3,0,0,81,0,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,255,0,24,3,0,0,81,255,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,90,255,0,0,0,88,0,0,0,0,80,0,0,24,3,0,0,81,0,0,24,3,0,0,0,0,80,255,0,24,3,0,0,81,255,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,89,255,0,0,0,80,255,0,24,3,0,0,81,255,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,100,0,0,21,0,26,0,86,0,0,87,0,0,0,0,169,0,0,0,0,0,80,0,0,24,3,0,0,81,0,0,24,3,0,0,0,0,82,0,0,83,0,0,0,0,43,229,2,86,0,0,87,0,0,0,0,43,232,2,42,231,2,90,0,0,0,0,44,149,0,8,0,8,3,0,0,44,149,0,8,1,16,3,0,0,105,26,150,64,8,128,170,255,0,0,0,170,0,0,0,0,101,0,0,109,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,113,4,9,0,88,0,0,0,0,107,91,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,90,0,2,35,4,128,0,0,34,4,128,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 557, bytes: 920, labels: 35, unknownOps: 16, unresolvedSymbols: 57 } as const;
