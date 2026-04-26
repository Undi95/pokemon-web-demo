// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=207, bytes=869, labels=37, unknownOps=13, unresolvedSymbols=22

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_1F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_1F_OnLoad": 15,
  "LittlerootTown_BrendansHouse_1F_EventScript_SetMovingBoxes": 35,
  "LittlerootTown_BrendansHouse_1F_EventScript_CheckShowShoesManual": 53,
  "LittlerootTown_BrendansHouse_1F_EventScript_ShowRunningShoesManual": 64,
  "LittlerootTown_BrendansHouse_1F_OnTransition": 73,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToStairs": 104,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToTV": 115,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToDoor": 126,
  "LittlerootTown_BrendansHouse_1F_OnFrame": 137,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoUpstairsToSetClock": 177,
  "LittlerootTown_BrendansHouse_1F_Movement_PushTowardStairs": 253,
  "LittlerootTown_BrendansHouse_1F_EventScript_EnterHouseMovingIn": 253,
  "LittlerootTown_BrendansHouse_1F_EventScript_PetalburgGymReport": 268,
  "LittlerootTown_BrendansHouse_1F_EventScript_YoureNewNeighbor": 283,
  "LittlerootTown_BrendansHouse_1F_Movement_RivalMomApproach": 396,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoSeeRoom": 396,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival0": 435,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival1": 446,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival2": 457,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival": 468,
  "LittlerootTown_BrendansHouse_1F_EventScript_PlayerFaceBrendan": 653,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer0": 677,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer1": 701,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer2": 725,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer0": 749,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer1": 749,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer2": 749,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs0": 749,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs1": 789,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs2": 829,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit0": 869,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit1": 869,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit2": 869,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs0": 869,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs1": 869,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs2": 869,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,15,0,0,0,3,73,0,0,0,2,137,0,0,0,35,146,64,6,0,34,146,64,6,0,44,18,1,8,1,53,0,0,0,90,163,5,0,4,0,112,2,1,0,163,5,0,2,0,104,2,1,0,161,35,13,128,0,0,34,13,128,0,0,163,3,0,7,0,147,2,1,0,35,146,64,3,0,34,146,64,3,0,35,146,64,5,0,34,146,64,5,0,35,146,64,6,0,34,146,64,6,0,90,100,0,0,8,0,4,0,102,0,0,7,100,0,0,4,0,5,0,102,0,0,7,100,0,0,9,0,8,0,102,0,0,7,146,64,3,0,253,0,0,0,146,64,5,0,177,0,0,0,146,64,6,0,12,1,0,0,130,64,1,0,27,1,0,0,130,64,3,0,0,0,0,0,106,16,0,0,0,0,0,10,0,105,80,255,0,253,0,0,0,81,255,0,253,0,0,0,0,0,80,0,0,253,0,0,0,81,0,0,253,0,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,1,0,7,1,0,0,0,0,108,90,106,113,4,0,0,113,5,0,0,89,0,0,0,0,90,106,113,4,0,0,113,5,0,0,89,0,0,0,0,90,106,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,140,1,0,0,81,0,0,140,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,42,87,0,113,130,2,0,108,90,106,113,4,0,0,113,5,0,0,80,4,128,0,0,0,0,81,4,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,0,0,0,0,90,106,113,8,0,0,89,212,1,0,0,90,106,113,8,1,0,89,212,1,0,0,90,106,113,8,2,0,89,212,1,0,0,90,9,9,0,4,10,86,0,0,87,0,0,0,0,4,30,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,1,0,34,8,128,1,0,52,165,1,1,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,16,0,0,0,0,0,10,0,105,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,9,9,0,84,0,0,85,0,0,0,0,42,233,2,42,49,3,43,248,2,4,30,113,141,3,0,113,80,1,0,53,0,0,54,108,90,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,237,2,0,0,81,0,0,237,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,237,2,0,0,81,0,0,237,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,237,2,0,0,81,0,0,237,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,101,3,0,0,81,255,0,101,3,0,0,0,0,80,0,0,101,3,0,0,81,0,0,101,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,101,3,0,0,81,255,0,101,3,0,0,0,0,80,0,0,101,3,0,0,81,0,0,101,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,101,3,0,0,81,255,0,101,3,0,0,0,0,80,0,0,101,3,0,0,81,0,0,101,3,0,0,0,0,82,0,0,83,0,0,0,0] as const;

export const STATS = { ops: 207, bytes: 869, labels: 37, unknownOps: 13, unresolvedSymbols: 22 } as const;
