// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=207, bytes=1107, labels=37, unknownOps=0, unresolvedSymbols=55

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_1F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_1F_OnLoad": 15,
  "LittlerootTown_BrendansHouse_1F_EventScript_SetMovingBoxes": 47,
  "LittlerootTown_BrendansHouse_1F_EventScript_CheckShowShoesManual": 66,
  "LittlerootTown_BrendansHouse_1F_EventScript_ShowRunningShoesManual": 90,
  "LittlerootTown_BrendansHouse_1F_OnTransition": 100,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToStairs": 167,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToTV": 179,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToDoor": 191,
  "LittlerootTown_BrendansHouse_1F_OnFrame": 203,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoUpstairsToSetClock": 243,
  "LittlerootTown_BrendansHouse_1F_Movement_PushTowardStairs": 319,
  "LittlerootTown_BrendansHouse_1F_EventScript_EnterHouseMovingIn": 321,
  "LittlerootTown_BrendansHouse_1F_EventScript_PetalburgGymReport": 338,
  "LittlerootTown_BrendansHouse_1F_EventScript_YoureNewNeighbor": 355,
  "LittlerootTown_BrendansHouse_1F_Movement_RivalMomApproach": 469,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoSeeRoom": 476,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival0": 517,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival1": 529,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival2": 541,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival": 553,
  "LittlerootTown_BrendansHouse_1F_EventScript_PlayerFaceBrendan": 827,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer0": 852,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer1": 877,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer2": 902,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer0": 927,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer1": 935,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer2": 939,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs0": 947,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs1": 988,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs2": 1029,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit0": 1070,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit1": 1074,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit2": 1081,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs0": 1085,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs1": 1091,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs2": 1101,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,15,0,0,0,0,100,0,0,0,0,203,0,0,0,35,0,0,6,0,34,0,0,6,0,8,0,47,0,0,0,8,0,0,0,0,0,44,0,0,8,1,66,0,0,0,3,163,5,0,4,0,0,0,1,0,163,5,0,2,0,0,0,1,0,4,161,35,0,0,0,0,34,0,0,0,0,7,1,90,0,0,0,7,1,0,0,0,0,4,163,3,0,7,0,0,0,1,0,4,35,0,0,3,0,34,0,0,3,0,8,1,191,0,0,0,8,1,0,0,0,0,35,0,0,5,0,34,0,0,5,0,8,1,167,0,0,0,8,1,0,0,0,0,35,0,0,6,0,34,0,0,6,0,8,1,179,0,0,0,8,1,0,0,0,0,3,100,0,0,8,0,4,0,102,0,0,0,4,100,0,0,4,0,5,0,102,0,0,0,4,100,0,0,9,0,8,0,102,0,0,0,4,0,0,3,0,65,1,0,0,0,0,5,0,243,0,0,0,0,0,6,0,82,1,0,0,0,0,1,0,99,1,0,0,0,0,3,0,0,0,0,0,106,16,0,0,0,0,0,10,4,105,80,0,0,63,1,0,0,81,0,0,63,1,0,0,0,0,80,0,0,63,1,0,0,81,0,0,63,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,0,255,255,255,255,7,255,255,255,255,0,7,0,1,0,7,1,0,0,0,0,108,3,0,0,106,23,0,0,0,0,23,0,0,0,0,6,0,0,0,0,3,106,23,0,0,0,0,23,0,0,0,0,6,0,0,0,0,3,106,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,213,1,0,0,81,0,0,213,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,42,0,0,23,0,0,2,0,108,3,0,0,0,0,0,0,0,106,23,0,0,0,0,23,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,6,0,0,0,0,3,106,23,0,0,0,0,6,41,2,0,0,3,106,23,0,0,1,0,6,41,2,0,0,3,106,23,0,0,2,0,6,41,2,0,0,3,48,0,0,41,10,0,86,0,0,87,0,0,0,0,41,30,0,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,5,59,3,0,0,8,5,0,0,0,0,52,0,0,1,35,0,0,0,0,34,0,0,0,0,8,1,84,3,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,109,3,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,134,3,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,105,35,0,0,0,0,34,0,0,0,0,8,1,179,3,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,220,3,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,5,4,0,0,8,1,0,0,0,0,48,0,0,84,0,0,85,0,0,0,0,42,0,0,42,0,0,43,0,0,41,30,0,23,0,0,3,0,23,0,0,1,0,53,0,0,54,108,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,159,3,0,0,81,0,0,159,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,167,3,0,0,81,0,0,167,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,171,3,0,0,81,0,0,171,3,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,46,4,0,0,81,0,0,46,4,0,0,0,0,80,0,0,61,4,0,0,81,0,0,61,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,50,4,0,0,81,0,0,50,4,0,0,0,0,80,0,0,67,4,0,0,81,0,0,67,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,57,4,0,0,81,0,0,57,4,0,0,0,0,80,0,0,77,4,0,0,81,0,0,77,4,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 207, bytes: 1107, labels: 37, unknownOps: 0, unresolvedSymbols: 55 } as const;
