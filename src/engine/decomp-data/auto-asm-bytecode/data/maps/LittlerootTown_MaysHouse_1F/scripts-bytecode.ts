// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=231, bytes=1038, labels=42, unknownOps=2, unresolvedSymbols=29

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_MaysHouse_1F_MapScripts": 0,
  "LittlerootTown_MaysHouse_1F_OnLoad": 15,
  "LittlerootTown_MaysHouse_1F_EventScript_SetMovingBoxes": 35,
  "LittlerootTown_MaysHouse_1F_EventScript_CheckShowShoesManual": 54,
  "LittlerootTown_MaysHouse_1F_EventScript_ShowRunningShoesManual": 66,
  "LittlerootTown_MaysHouse_1F_OnTransition": 76,
  "LittlerootTown_MaysHouse_1F_EventScript_MoveMomToStairs": 107,
  "LittlerootTown_MaysHouse_1F_EventScript_MoveMomToTV": 119,
  "LittlerootTown_MaysHouse_1F_EventScript_MoveMomToDoor": 131,
  "LittlerootTown_MaysHouse_1F_OnFrame": 143,
  "LittlerootTown_MaysHouse_1F_EventScript_GoUpstairsToSetClock": 183,
  "LittlerootTown_MaysHouse_1F_Movement_PushTowardStairs": 259,
  "LittlerootTown_MaysHouse_1F_EventScript_EnterHouseMovingIn": 261,
  "LittlerootTown_MaysHouse_1F_EventScript_PetalburgGymReport": 276,
  "LittlerootTown_MaysHouse_1F_EventScript_YoureNewNeighbor": 291,
  "LittlerootTown_MaysHouse_1F_Movement_RivalMomApproach": 404,
  "RivalsHouse_1F_EventScript_RivalMom": 411,
  "RivalsHouse_1F_EventScript_RivalTooBusy": 455,
  "RivalsHouse_1F_EventScript_RivalIsOnRoute103": 465,
  "RivalsHouse_1F_EventScript_GoHomeEverySoOften": 475,
  "RivalsHouse_1F_EventScript_RivalSibling": 485,
  "LittlerootTown_MaysHouse_1F_EventScript_GoSeeRoom": 501,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival0": 540,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival1": 551,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival2": 562,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival": 573,
  "LittlerootTown_MaysHouse_1F_EventScript_PlayerFaceMay": 758,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer0": 783,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer1": 808,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer2": 833,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer0": 858,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer1": 866,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer2": 870,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs0": 878,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs1": 919,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs2": 960,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit0": 1001,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit1": 1005,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit2": 1012,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs0": 1016,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs1": 1022,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs2": 1032,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,15,0,0,0,3,76,0,0,0,2,143,0,0,0,35,146,64,6,0,34,146,64,6,0,44,18,1,8,1,54,0,0,0,90,163,5,0,4,0,112,2,1,0,163,5,0,2,0,104,2,1,0,15,161,35,13,128,1,0,34,13,128,1,0,15,163,6,0,7,0,147,2,1,0,15,35,146,64,3,0,34,146,64,3,0,35,146,64,5,0,34,146,64,5,0,35,146,64,6,0,34,146,64,6,0,90,100,0,0,2,0,4,0,102,0,0,7,15,100,0,0,6,0,5,0,102,0,0,7,15,100,0,0,1,0,8,0,102,0,0,7,15,146,64,3,0,5,1,0,0,146,64,5,0,183,0,0,0,146,64,6,0,20,1,0,0,140,64,1,0,35,1,0,0,130,64,3,0,0,0,0,0,106,16,0,0,0,0,0,10,0,105,80,255,0,3,1,0,0,81,255,0,3,1,0,0,0,0,80,0,0,3,1,0,0,81,0,0,3,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,1,0,1,1,0,0,0,0,108,90,9,254,106,113,4,0,0,113,5,1,0,89,0,0,0,0,90,106,113,4,1,0,113,5,0,0,89,0,0,0,0,90,106,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,148,1,0,0,81,0,0,148,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,42,87,0,113,140,2,0,108,90,8,10,10,10,10,10,254,107,91,44,130,0,7,1,219,1,0,0,44,0,0,7,1,209,1,0,0,35,141,64,3,0,34,141,64,3,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,38,0,0,0,16,0,0,0,0,0,10,0,109,90,106,113,4,0,0,113,5,1,0,80,4,128,0,0,0,0,81,4,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,0,0,0,0,90,106,113,8,0,0,89,61,2,0,0,90,106,113,8,1,0,89,61,2,0,0,90,106,113,8,2,0,89,61,2,0,0,90,9,9,0,4,10,86,0,0,87,0,0,0,0,4,30,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,1,0,34,8,128,1,0,52,159,1,1,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,16,0,0,0,0,0,10,0,105,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,35,8,128,2,0,34,8,128,2,0,9,9,0,84,0,0,85,0,0,0,0,42,234,2,42,50,3,43,210,2,4,30,113,141,3,0,113,80,1,0,53,0,0,54,108,90,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,90,3,0,0,81,0,0,90,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,98,3,0,0,81,0,0,98,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,102,3,0,0,81,0,0,102,3,0,0,0,0,82,0,0,83,0,0,0,0,15,39,10,38,9,9,9,9,254,9,9,9,254,40,11,38,9,9,9,9,254,80,255,0,233,3,0,0,81,255,0,233,3,0,0,0,0,80,0,0,248,3,0,0,81,0,0,248,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,237,3,0,0,81,255,0,237,3,0,0,0,0,80,0,0,254,3,0,0,81,0,0,254,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,244,3,0,0,81,255,0,244,3,0,0,0,0,80,0,0,8,4,0,0,81,0,0,8,4,0,0,0,0,82,0,0,83,0,0,0,0,15,20,19,40,254,20,19,40,20,20,38,254,20,19,39,254,40,11,38,9,9,254,40,11,38,9,9,39,10,38,9,254,39,10,38,9,9,254] as const;

export const STATS = { ops: 231, bytes: 1038, labels: 42, unknownOps: 2, unresolvedSymbols: 29 } as const;
