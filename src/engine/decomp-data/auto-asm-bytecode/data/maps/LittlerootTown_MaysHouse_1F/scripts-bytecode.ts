// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=231, bytes=1209, labels=42, unknownOps=0, unresolvedSymbols=60

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
export const BYTECODE: readonly number[] = [0,15,0,0,0,0,100,0,0,0,0,203,0,0,0,35,0,0,6,0,34,0,0,6,0,8,0,47,0,0,0,8,0,0,0,0,0,44,0,0,8,1,66,0,0,0,3,163,5,0,4,0,0,0,1,0,163,5,0,2,0,0,0,1,0,4,161,35,0,0,0,0,34,0,0,0,0,7,1,90,0,0,0,7,1,0,0,0,0,4,163,6,0,7,0,0,0,1,0,4,35,0,0,3,0,34,0,0,3,0,8,1,191,0,0,0,8,1,0,0,0,0,35,0,0,5,0,34,0,0,5,0,8,1,167,0,0,0,8,1,0,0,0,0,35,0,0,6,0,34,0,0,6,0,8,1,179,0,0,0,8,1,0,0,0,0,3,100,0,0,2,0,4,0,102,0,0,0,4,100,0,0,6,0,5,0,102,0,0,0,4,100,0,0,1,0,8,0,102,0,0,0,4,0,0,3,0,65,1,0,0,0,0,5,0,243,0,0,0,0,0,6,0,82,1,0,0,0,0,1,0,99,1,0,0,0,0,3,0,0,0,0,0,106,16,0,0,0,0,0,10,4,105,80,0,0,63,1,0,0,81,0,0,63,1,0,0,0,0,80,0,0,63,1,0,0,81,0,0,63,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,0,255,255,255,255,1,255,255,255,255,0,1,0,1,0,1,1,0,0,0,0,108,3,0,0,106,23,0,0,0,0,23,0,0,0,0,6,0,0,0,0,3,106,23,0,0,0,0,23,0,0,0,0,6,0,0,0,0,3,106,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,213,1,0,0,81,0,0,213,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,42,0,0,23,0,0,2,0,108,3,0,0,0,0,0,0,0,107,91,44,0,0,7,1,40,2,0,0,44,0,0,7,1,30,2,0,0,35,0,0,3,0,34,0,0,3,0,7,1,20,2,0,0,7,1,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,38,0,0,0,16,0,0,0,0,0,10,4,109,3,106,23,0,0,0,0,23,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,6,0,0,0,0,3,106,23,0,0,0,0,6,143,2,0,0,3,106,23,0,0,1,0,6,143,2,0,0,3,106,23,0,0,2,0,6,143,2,0,0,3,48,9,0,41,10,0,86,0,0,87,0,0,0,0,41,30,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,5,161,3,0,0,8,5,0,0,0,0,52,159,1,1,35,0,0,0,0,34,0,0,0,0,8,1,186,3,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,211,3,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,236,3,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,105,35,0,0,0,0,34,0,0,0,0,8,1,25,4,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,66,4,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,107,4,0,0,8,1,0,0,0,0,48,9,0,84,0,0,85,0,0,0,0,42,0,0,42,0,0,43,0,0,41,30,0,23,0,0,3,0,23,0,0,1,0,53,0,0,54,108,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,5,4,0,0,81,0,0,5,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,13,4,0,0,81,0,0,13,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,17,4,0,0,81,0,0,17,4,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,148,4,0,0,81,0,0,148,4,0,0,0,0,80,0,0,163,4,0,0,81,0,0,163,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,152,4,0,0,81,0,0,152,4,0,0,0,0,80,0,0,169,4,0,0,81,0,0,169,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,159,4,0,0,81,0,0,159,4,0,0,0,0,80,0,0,179,4,0,0,81,0,0,179,4,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 231, bytes: 1209, labels: 42, unknownOps: 0, unresolvedSymbols: 60 } as const;
