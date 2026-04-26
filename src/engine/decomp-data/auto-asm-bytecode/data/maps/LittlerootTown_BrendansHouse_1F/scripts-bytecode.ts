// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=207, bytes=948, labels=37, unknownOps=2, unresolvedSymbols=22

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_1F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_1F_OnLoad": 15,
  "LittlerootTown_BrendansHouse_1F_EventScript_SetMovingBoxes": 35,
  "LittlerootTown_BrendansHouse_1F_EventScript_CheckShowShoesManual": 54,
  "LittlerootTown_BrendansHouse_1F_EventScript_ShowRunningShoesManual": 66,
  "LittlerootTown_BrendansHouse_1F_OnTransition": 76,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToStairs": 107,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToTV": 119,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToDoor": 131,
  "LittlerootTown_BrendansHouse_1F_OnFrame": 143,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoUpstairsToSetClock": 183,
  "LittlerootTown_BrendansHouse_1F_Movement_PushTowardStairs": 259,
  "LittlerootTown_BrendansHouse_1F_EventScript_EnterHouseMovingIn": 261,
  "LittlerootTown_BrendansHouse_1F_EventScript_PetalburgGymReport": 276,
  "LittlerootTown_BrendansHouse_1F_EventScript_YoureNewNeighbor": 291,
  "LittlerootTown_BrendansHouse_1F_Movement_RivalMomApproach": 404,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoSeeRoom": 411,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival0": 450,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival1": 461,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival2": 472,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival": 483,
  "LittlerootTown_BrendansHouse_1F_EventScript_PlayerFaceBrendan": 668,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer0": 693,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer1": 718,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer2": 743,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer0": 768,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer1": 776,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer2": 780,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs0": 788,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs1": 829,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs2": 870,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit0": 911,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit1": 915,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit2": 922,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs0": 926,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs1": 932,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs2": 942,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,15,0,0,0,3,76,0,0,0,2,143,0,0,0,35,146,64,6,0,34,146,64,6,0,44,18,1,8,1,54,0,0,0,90,163,5,0,4,0,112,2,1,0,163,5,0,2,0,104,2,1,0,15,161,35,13,128,0,0,34,13,128,0,0,15,163,3,0,7,0,147,2,1,0,15,35,146,64,3,0,34,146,64,3,0,35,146,64,5,0,34,146,64,5,0,35,146,64,6,0,34,146,64,6,0,90,100,0,0,8,0,4,0,102,0,0,7,15,100,0,0,4,0,5,0,102,0,0,7,15,100,0,0,9,0,8,0,102,0,0,7,15,146,64,3,0,5,1,0,0,146,64,5,0,183,0,0,0,146,64,6,0,20,1,0,0,130,64,1,0,35,1,0,0,130,64,3,0,0,0,0,0,106,16,0,0,0,0,0,10,0,105,80,255,0,3,1,0,0,81,255,0,3,1,0,0,0,0,80,0,0,3,1,0,0,81,0,0,3,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,1,0,7,1,0,0,0,0,108,90,9,254,106,113,4,0,0,113,5,0,0,89,0,0,0,0,90,106,113,4,0,0,113,5,0,0,89,0,0,0,0,90,106,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,148,1,0,0,81,0,0,148,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,42,87,0,113,130,2,0,108,90,8,11,11,11,11,11,254,106,113,4,0,0,113,5,0,0,80,4,128,0,0,0,0,81,4,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,0,0,0,0,90,106,113,8,0,0,89,227,1,0,0,90,106,113,8,1,0,89,227,1,0,0,90,106,113,8,2,0,89,227,1,0,0,90,9,9,0,4,10,86,0,0,87,0,0,0,0,4,30,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,1,0,34,8,128,1,0,52,165,1,1,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,16,0,0,0,0,0,10,0,105,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,9,9,0,84,0,0,85,0,0,0,0,42,233,2,42,49,3,43,248,2,4,30,113,141,3,0,113,80,1,0,53,0,0,54,108,90,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,3,0,0,81,0,0,0,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,8,3,0,0,81,0,0,8,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,12,3,0,0,81,0,0,12,3,0,0,0,0,82,0,0,83,0,0,0,0,15,39,10,38,9,9,9,9,254,9,9,9,254,40,11,38,9,9,9,9,254,80,255,0,143,3,0,0,81,255,0,143,3,0,0,0,0,80,0,0,158,3,0,0,81,0,0,158,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,147,3,0,0,81,255,0,147,3,0,0,0,0,80,0,0,164,3,0,0,81,0,0,164,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,154,3,0,0,81,255,0,154,3,0,0,0,0,80,0,0,174,3,0,0,81,0,0,174,3,0,0,0,0,82,0,0,83,0,0,0,0,15,20,19,40,254,20,19,40,20,20,38,254,20,19,39,254,40,11,38,9,9,254,40,11,38,9,9,39,10,38,9,254,39,10,38,9,9,254] as const;

export const STATS = { ops: 207, bytes: 948, labels: 37, unknownOps: 2, unresolvedSymbols: 22 } as const;
