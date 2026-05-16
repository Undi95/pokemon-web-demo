// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=231, bytes=1209, labels=42, unknownOps=0, unresolvedSymbols=27

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_MaysHouse_1F_MapScripts": 0,
  "LittlerootTown_MaysHouse_1F_OnLoad": 15,
  "LittlerootTown_MaysHouse_1F_EventScript_SetMovingBoxes": 47,
  "LittlerootTown_MaysHouse_1F_EventScript_CheckShowShoesManual": 66,
  "LittlerootTown_MaysHouse_1F_EventScript_ShowRunningShoesManual": 90,
  "LittlerootTown_MaysHouse_1F_OnTransition": 100,
  "LittlerootTown_MaysHouse_1F_EventScript_MoveMomToStairs": 167,
  "LittlerootTown_MaysHouse_1F_EventScript_MoveMomToTV": 179,
  "LittlerootTown_MaysHouse_1F_EventScript_MoveMomToDoor": 191,
  "LittlerootTown_MaysHouse_1F_OnFrame": 203,
  "LittlerootTown_MaysHouse_1F_EventScript_GoUpstairsToSetClock": 243,
  "LittlerootTown_MaysHouse_1F_Movement_PushTowardStairs": 319,
  "LittlerootTown_MaysHouse_1F_EventScript_EnterHouseMovingIn": 321,
  "LittlerootTown_MaysHouse_1F_EventScript_PetalburgGymReport": 338,
  "LittlerootTown_MaysHouse_1F_EventScript_YoureNewNeighbor": 355,
  "LittlerootTown_MaysHouse_1F_Movement_RivalMomApproach": 469,
  "RivalsHouse_1F_EventScript_RivalMom": 476,
  "RivalsHouse_1F_EventScript_RivalTooBusy": 532,
  "RivalsHouse_1F_EventScript_RivalIsOnRoute103": 542,
  "RivalsHouse_1F_EventScript_GoHomeEverySoOften": 552,
  "RivalsHouse_1F_EventScript_RivalSibling": 562,
  "LittlerootTown_MaysHouse_1F_EventScript_GoSeeRoom": 578,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival0": 619,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival1": 631,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival2": 643,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival": 655,
  "LittlerootTown_MaysHouse_1F_EventScript_PlayerFaceMay": 929,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer0": 954,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer1": 979,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer2": 1004,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer0": 1029,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer1": 1037,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer2": 1041,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs0": 1049,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs1": 1090,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs2": 1131,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit0": 1172,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit1": 1176,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit2": 1183,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs0": 1187,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs1": 1193,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs2": 1203,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,15,0,0,0,3,100,0,0,0,2,203,0,0,0,35,146,64,6,0,34,146,64,6,0,8,0,47,0,0,0,8,0,146,64,0,0,44,18,1,8,1,66,0,0,0,3,163,5,0,4,0,112,2,1,0,163,5,0,2,0,104,2,1,0,4,161,35,13,128,1,0,34,13,128,1,0,7,1,90,0,0,0,7,1,13,128,0,0,4,163,6,0,7,0,147,2,1,0,4,35,146,64,3,0,34,146,64,3,0,8,1,191,0,0,0,8,1,146,64,0,0,35,146,64,5,0,34,146,64,5,0,8,1,167,0,0,0,8,1,146,64,0,0,35,146,64,6,0,34,146,64,6,0,8,1,179,0,0,0,8,1,146,64,0,0,3,100,0,0,2,0,4,0,102,0,0,7,4,100,0,0,6,0,5,0,102,0,0,7,4,100,0,0,1,0,8,0,102,0,0,7,4,146,64,3,0,65,1,0,0,146,64,5,0,243,0,0,0,146,64,6,0,82,1,0,0,140,64,1,0,99,1,0,0,130,64,3,0,0,0,0,0,106,16,0,0,0,0,0,10,4,105,80,255,0,63,1,0,0,81,255,0,63,1,0,0,0,0,80,0,0,63,1,0,0,81,0,0,63,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,1,0,1,1,0,0,0,58,108,3,9,254,106,23,4,128,0,0,23,5,128,1,0,6,0,0,0,0,3,106,23,4,128,1,0,23,5,128,0,0,6,0,0,0,0,3,106,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,213,1,0,0,81,0,0,213,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,58,16,0,0,0,0,0,10,4,42,87,0,23,140,64,2,0,108,3,8,10,10,10,10,10,254,107,91,44,130,0,7,1,40,2,0,0,44,0,0,7,1,30,2,0,0,35,141,64,3,0,34,141,64,3,0,7,1,20,2,0,0,7,1,141,64,0,0,38,0,0,58,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,38,0,0,58,16,0,0,0,0,0,10,4,109,3,106,23,4,128,0,0,23,5,128,1,0,80,4,128,0,0,0,0,81,4,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,6,0,0,0,0,3,106,23,8,128,0,0,6,143,2,0,0,3,106,23,8,128,1,0,6,143,2,0,0,3,106,23,8,128,2,0,6,143,2,0,0,3,48,9,0,41,10,0,86,0,0,87,0,0,0,0,41,30,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,1,0,34,8,128,1,0,8,5,161,3,0,0,8,5,8,128,0,0,52,159,1,1,35,8,128,0,0,34,8,128,0,0,8,1,186,3,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,211,3,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,236,3,0,0,8,1,8,128,0,0,16,0,0,0,0,0,10,4,105,35,8,128,0,0,34,8,128,0,0,8,1,25,4,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,66,4,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,107,4,0,0,8,1,8,128,0,0,48,9,0,84,0,0,85,0,0,0,0,42,234,2,42,50,3,43,210,2,41,30,0,23,141,64,3,0,23,80,64,1,0,53,0,0,54,108,3,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,5,4,0,0,81,0,0,5,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,13,4,0,0,81,0,0,13,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,17,4,0,0,81,0,0,17,4,0,0,0,0,82,0,0,83,0,0,0,0,4,39,10,38,9,9,9,9,254,9,9,9,254,40,11,38,9,9,9,9,254,80,255,0,148,4,0,0,81,255,0,148,4,0,0,0,0,80,0,0,163,4,0,0,81,0,0,163,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,152,4,0,0,81,255,0,152,4,0,0,0,0,80,0,0,169,4,0,0,81,0,0,169,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,159,4,0,0,81,255,0,159,4,0,0,0,0,80,0,0,179,4,0,0,81,0,0,179,4,0,0,0,0,82,0,0,83,0,0,0,0,4,20,19,40,254,20,19,40,20,20,38,254,20,19,39,254,40,11,38,9,9,254,40,11,38,9,9,39,10,38,9,254,39,10,38,9,9,254] as const;

export const STATS = { ops: 231, bytes: 1209, labels: 42, unknownOps: 0, unresolvedSymbols: 27 } as const;
