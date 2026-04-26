// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=231, bytes=1194, labels=42, unknownOps=0, unresolvedSymbols=29

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
  "LittlerootTown_MaysHouse_1F_EventScript_PetalburgGymReport": 336,
  "LittlerootTown_MaysHouse_1F_EventScript_YoureNewNeighbor": 351,
  "LittlerootTown_MaysHouse_1F_Movement_RivalMomApproach": 464,
  "RivalsHouse_1F_EventScript_RivalMom": 471,
  "RivalsHouse_1F_EventScript_RivalTooBusy": 527,
  "RivalsHouse_1F_EventScript_RivalIsOnRoute103": 537,
  "RivalsHouse_1F_EventScript_GoHomeEverySoOften": 547,
  "RivalsHouse_1F_EventScript_RivalSibling": 557,
  "LittlerootTown_MaysHouse_1F_EventScript_GoSeeRoom": 573,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival0": 612,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival1": 623,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival2": 634,
  "LittlerootTown_MaysHouse_1F_EventScript_MeetRival": 645,
  "LittlerootTown_MaysHouse_1F_EventScript_PlayerFaceMay": 914,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer0": 939,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer1": 964,
  "LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer2": 989,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer0": 1014,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer1": 1022,
  "LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer2": 1026,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs0": 1034,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs1": 1075,
  "LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs2": 1116,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit0": 1157,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit1": 1161,
  "LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit2": 1168,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs0": 1172,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs1": 1178,
  "LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs2": 1188,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,15,0,0,0,3,100,0,0,0,2,203,0,0,0,35,146,64,6,0,34,146,64,6,0,8,0,47,0,0,0,8,0,146,64,0,0,44,18,1,8,1,66,0,0,0,90,163,5,0,4,0,112,2,1,0,163,5,0,2,0,104,2,1,0,15,161,35,13,128,1,0,34,13,128,1,0,7,1,90,0,0,0,7,1,13,128,0,0,15,163,6,0,7,0,147,2,1,0,15,35,146,64,3,0,34,146,64,3,0,8,1,191,0,0,0,8,1,146,64,0,0,35,146,64,5,0,34,146,64,5,0,8,1,167,0,0,0,8,1,146,64,0,0,35,146,64,6,0,34,146,64,6,0,8,1,179,0,0,0,8,1,146,64,0,0,90,100,0,0,2,0,4,0,102,0,0,7,15,100,0,0,6,0,5,0,102,0,0,7,15,100,0,0,1,0,8,0,102,0,0,7,15,146,64,3,0,65,1,0,0,146,64,5,0,243,0,0,0,146,64,6,0,80,1,0,0,140,64,1,0,95,1,0,0,130,64,3,0,0,0,0,0,106,16,0,0,0,0,0,10,0,105,80,255,0,63,1,0,0,81,255,0,63,1,0,0,0,0,80,0,0,63,1,0,0,81,0,0,63,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,1,255,255,255,255,255,1,0,1,0,1,1,0,0,0,0,108,90,9,254,106,113,4,0,0,113,5,1,0,89,0,0,0,0,90,106,113,4,1,0,113,5,0,0,89,0,0,0,0,90,106,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,208,1,0,0,81,0,0,208,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,42,87,0,113,140,2,0,108,90,8,10,10,10,10,10,254,107,91,44,130,0,7,1,35,2,0,0,44,0,0,7,1,25,2,0,0,35,141,64,3,0,34,141,64,3,0,7,1,15,2,0,0,7,1,141,64,0,0,38,0,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,38,0,0,0,16,0,0,0,0,0,10,0,109,90,106,113,4,0,0,113,5,1,0,80,4,128,0,0,0,0,81,4,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,0,0,0,0,90,106,113,8,0,0,89,133,2,0,0,90,106,113,8,1,0,89,133,2,0,0,90,106,113,8,2,0,89,133,2,0,0,90,9,9,0,4,10,86,0,0,87,0,0,0,0,4,30,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,1,0,34,8,128,1,0,8,5,146,3,0,0,8,5,8,128,0,0,52,159,1,1,35,8,128,0,0,34,8,128,0,0,8,1,171,3,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,196,3,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,221,3,0,0,8,1,8,128,0,0,16,0,0,0,0,0,10,0,105,35,8,128,0,0,34,8,128,0,0,8,1,10,4,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,51,4,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,92,4,0,0,8,1,8,128,0,0,9,9,0,84,0,0,85,0,0,0,0,42,234,2,42,50,3,43,210,2,4,30,113,141,3,0,113,80,1,0,53,0,0,54,108,90,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,246,3,0,0,81,0,0,246,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,254,3,0,0,81,0,0,254,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,2,4,0,0,81,0,0,2,4,0,0,0,0,82,0,0,83,0,0,0,0,15,39,10,38,9,9,9,9,254,9,9,9,254,40,11,38,9,9,9,9,254,80,255,0,133,4,0,0,81,255,0,133,4,0,0,0,0,80,0,0,148,4,0,0,81,0,0,148,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,137,4,0,0,81,255,0,137,4,0,0,0,0,80,0,0,154,4,0,0,81,0,0,154,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,144,4,0,0,81,255,0,144,4,0,0,0,0,80,0,0,164,4,0,0,81,0,0,164,4,0,0,0,0,82,0,0,83,0,0,0,0,15,20,19,40,254,20,19,40,20,20,38,254,20,19,39,254,40,11,38,9,9,254,40,11,38,9,9,39,10,38,9,254,39,10,38,9,9,254] as const;

export const STATS = { ops: 231, bytes: 1194, labels: 42, unknownOps: 0, unresolvedSymbols: 29 } as const;
