// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=226, bytes=1238, labels=40, unknownOps=0, unresolvedSymbols=61

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_MaysHouse_2F_MapScripts": 0,
  "LittlerootTown_MaysHouse_2F_OnTransition": 10,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckShouldUpdateMayPos": 87,
  "LittlerootTown_MaysHouse_2F_EventScript_TryUpdateMayPos": 123,
  "LittlerootTown_MaysHouse_2F_EventScript_Ret": 180,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckSetReadyToMeetMay": 181,
  "LittlerootTown_MaysHouse_2F_EventScript_SetReadyToMeetMay": 205,
  "LittlerootTown_MaysHouse_2F_OnWarp": 211,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckInitDecor": 219,
  "LittlerootTown_MaysHouse_2F_EventScript_RivalsPokeBall": 243,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMay": 276,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayNorth": 479,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMaySouth": 577,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayWest": 675,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayEast": 757,
  "LittlerootTown_MaysHouse_2F_Movement_MayEnters": 855,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerNorth": 859,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCNorth": 865,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayNorth": 875,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerSouth": 883,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCSouth": 887,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMaySouth": 895,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerWest": 901,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCWest": 908,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayWest": 913,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerEast": 917,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCEast": 922,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayEast": 931,
  "RivalsHouse_2F_EventScript_Rival": 937,
  "RivalsHouse_2F_EventScript_May": 993,
  "RivalsHouse_2F_EventScript_Brendan": 1003,
  "RivalsHouse_2F_EventScript_RivalPostLilycove": 1013,
  "RivalsHouse_2F_EventScript_MayPostLilycove": 1087,
  "RivalsHouse_2F_EventScript_BrendanPostLilycove": 1105,
  "RivalsHouse_2F_EventScript_MayWhereShouldIGoNext": 1123,
  "RivalsHouse_2F_EventScript_BrendanWhereShouldIGoNext": 1132,
  "LittlerootTown_MaysHouse_2F_EventScript_PC": 1141,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckRivalsPC": 1188,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckPlayersPC": 1198,
  "LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC": 1224,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,10,0,0,0,0,211,0,0,0,35,0,0,2,0,34,0,0,2,0,8,0,181,0,0,0,8,0,0,0,0,0,35,0,0,3,0,34,0,0,3,0,8,4,87,0,0,0,8,4,0,0,0,0,35,0,0,4,0,34,0,0,4,0,8,1,0,0,0,0,8,1,0,0,0,0,5,0,0,0,0,23,0,0,0,0,3,44,0,0,7,1,123,0,0,0,35,0,0,2,0,34,0,0,2,0,7,4,180,0,0,0,7,4,0,0,0,0,6,123,0,0,0,161,35,0,0,0,0,34,0,0,0,0,7,1,180,0,0,0,7,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,7,4,180,0,0,0,7,4,0,0,0,0,100,0,0,8,0,2,0,102,0,0,0,4,4,161,35,0,0,0,0,34,0,0,0,0,7,1,205,0,0,0,7,1,0,0,0,0,4,23,0,0,2,0,4,0,0,0,0,219,0,0,0,161,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,3,106,35,0,0,2,0,34,0,0,2,0,7,1,20,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,108,3,41,10,0,86,0,0,87,0,0,0,0,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,48,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,10,0,52,0,0,1,35,0,0,0,0,34,0,0,0,0,8,1,223,1,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,65,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,163,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,245,2,0,0,8,1,0,0,0,0,23,0,0,3,0,42,0,0,43,0,0,23,0,0,1,0,53,0,0,54,108,3,80,0,0,91,3,0,0,81,0,0,91,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,107,3,0,0,81,0,0,107,3,0,0,0,0,80,0,0,97,3,0,0,81,0,0,97,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,115,3,0,0,81,0,0,115,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,127,3,0,0,81,0,0,127,3,0,0,0,0,80,0,0,119,3,0,0,81,0,0,119,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,133,3,0,0,81,0,0,133,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,140,3,0,0,81,0,0,140,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,149,3,0,0,81,0,0,149,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,163,3,0,0,81,0,0,163,3,0,0,0,0,80,0,0,154,3,0,0,81,0,0,154,3,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,106,44,0,0,7,1,245,3,0,0,161,35,0,0,0,0,34,0,0,0,0,7,1,225,3,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,235,3,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,108,3,16,0,0,0,0,0,10,4,108,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,161,35,0,0,0,0,34,0,0,0,0,8,1,63,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,81,4,0,0,8,1,0,0,0,0,42,0,0,108,3,44,0,0,7,1,99,4,0,0,16,0,0,0,0,0,10,4,4,44,0,0,7,1,108,4,0,0,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,106,161,35,0,0,0,0,34,0,0,0,0,7,1,164,4,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,174,4,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,108,3,23,0,0,0,0,38,0,0,0,48,0,0,16,0,0,0,0,0,10,4,38,0,0,0,108,3,23,0,0,0,0,48,0,0,38,0,0,0,108,3] as const;

export const STATS = { ops: 226, bytes: 1238, labels: 40, unknownOps: 0, unresolvedSymbols: 61 } as const;
