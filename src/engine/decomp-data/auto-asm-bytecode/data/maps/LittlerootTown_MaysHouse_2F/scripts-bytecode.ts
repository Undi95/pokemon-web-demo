// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=226, bytes=1002, labels=40, unknownOps=2, unresolvedSymbols=24

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_MaysHouse_2F_MapScripts": 0,
  "LittlerootTown_MaysHouse_2F_OnTransition": 10,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckShouldUpdateMayPos": 50,
  "LittlerootTown_MaysHouse_2F_EventScript_TryUpdateMayPos": 74,
  "LittlerootTown_MaysHouse_2F_EventScript_Ret": 107,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckSetReadyToMeetMay": 108,
  "LittlerootTown_MaysHouse_2F_EventScript_SetReadyToMeetMay": 120,
  "LittlerootTown_MaysHouse_2F_OnWarp": 125,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckInitDecor": 133,
  "LittlerootTown_MaysHouse_2F_EventScript_RivalsPokeBall": 145,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMay": 166,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayNorth": 317,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMaySouth": 415,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayWest": 513,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayEast": 595,
  "LittlerootTown_MaysHouse_2F_Movement_MayEnters": 693,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerNorth": 697,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCNorth": 703,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayNorth": 713,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerSouth": 721,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCSouth": 725,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMaySouth": 733,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerWest": 739,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCWest": 746,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayWest": 751,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerEast": 755,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCEast": 760,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayEast": 769,
  "RivalsHouse_2F_EventScript_Rival": 775,
  "RivalsHouse_2F_EventScript_May": 807,
  "RivalsHouse_2F_EventScript_Brendan": 817,
  "RivalsHouse_2F_EventScript_RivalPostLilycove": 827,
  "RivalsHouse_2F_EventScript_MayPostLilycove": 877,
  "RivalsHouse_2F_EventScript_BrendanPostLilycove": 895,
  "RivalsHouse_2F_EventScript_MayWhereShouldIGoNext": 913,
  "RivalsHouse_2F_EventScript_BrendanWhereShouldIGoNext": 922,
  "LittlerootTown_MaysHouse_2F_EventScript_PC": 931,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckRivalsPC": 954,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckPlayersPC": 964,
  "LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC": 989,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,125,0,0,0,35,141,64,2,0,34,141,64,2,0,35,141,64,3,0,34,141,64,3,0,35,146,64,4,0,34,146,64,4,0,88,0,0,0,0,113,137,0,0,90,44,36,1,7,1,74,0,0,0,35,132,64,2,0,34,132,64,2,0,89,74,0,0,0,161,35,13,128,1,0,34,13,128,1,0,35,211,64,2,0,34,211,64,2,0,100,0,0,8,0,2,0,102,0,0,7,15,15,161,35,13,128,0,0,34,13,128,0,0,15,113,141,2,0,15,137,64,0,0,133,0,0,0,161,35,13,128,1,0,34,13,128,1,0,90,106,35,141,64,2,0,34,141,64,2,0,16,0,0,0,0,0,10,0,108,90,4,10,86,0,0,87,0,0,0,0,80,0,0,181,2,0,0,81,0,0,181,2,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,10,52,159,1,1,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,113,141,3,0,42,50,3,43,210,2,113,80,1,0,53,0,0,54,108,90,80,0,0,185,2,0,0,81,0,0,185,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,201,2,0,0,81,255,0,201,2,0,0,0,0,80,0,0,191,2,0,0,81,0,0,191,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,209,2,0,0,81,0,0,209,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,221,2,0,0,81,255,0,221,2,0,0,0,0,80,0,0,213,2,0,0,81,0,0,213,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,227,2,0,0,81,0,0,227,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,234,2,0,0,81,0,0,234,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,243,2,0,0,81,0,0,243,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,1,3,0,0,81,255,0,1,3,0,0,0,0,80,0,0,248,2,0,0,81,0,0,248,2,0,0,0,0,82,0,0,83,0,0,0,0,15,8,8,40,254,11,11,8,8,11,254,9,9,9,40,11,11,11,11,38,254,20,38,20,20,20,20,40,254,11,11,11,254,9,40,11,11,11,11,38,254,20,38,20,20,40,254,11,11,11,11,11,37,254,9,11,11,38,254,20,20,40,254,11,11,8,40,254,9,9,11,11,11,11,11,38,254,20,38,20,20,40,254,106,44,36,1,7,1,59,3,0,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,42,37,1,108,90,44,37,1,7,1,145,3,0,0,16,0,0,0,0,0,10,0,15,44,37,1,7,1,154,3,0,0,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,106,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,108,90,113,4,2,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,0,38,0,0,0,108,90,113,4,2,0,9,3,0,38,0,0,0,108,90] as const;

export const STATS = { ops: 226, bytes: 1002, labels: 40, unknownOps: 2, unresolvedSymbols: 24 } as const;
