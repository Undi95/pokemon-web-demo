// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=199, bytes=1051, labels=34, unknownOps=0, unresolvedSymbols=51

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_2F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_2F_OnTransition": 10,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckShouldUpdateBrendanPos": 87,
  "LittlerootTown_BrendansHouse_2F_EventScript_TryUpdateBrendanPos": 123,
  "LittlerootTown_BrendansHouse_2F_EventScript_Ret": 180,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckSetReadyToMeetBrendan": 181,
  "LittlerootTown_BrendansHouse_2F_EventScript_SetReadyToMeetBrendan": 205,
  "LittlerootTown_BrendansHouse_2F_OnWarp": 211,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckInitDecor": 219,
  "LittlerootTown_BrendansHouse_2F_EventScript_RivalsPokeBall": 243,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendan": 276,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanNorth": 479,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanSouth": 577,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanWest": 675,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanEast": 773,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanEnters": 855,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerNorth": 859,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCNorth": 865,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanNorth": 874,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerSouth": 882,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCSouth": 886,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanSouth": 893,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerWest": 899,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCWest": 904,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanWest": 913,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerEast": 920,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCEast": 927,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanEast": 932,
  "LittlerootTown_BrendansHouse_2F_EventScript_PC": 936,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckPlayersPC": 983,
  "LittlerootTown_BrendansHouse_2F_EventScript_TurnOffPlayerPC": 1009,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckRivalsPC": 1023,
  "PlayersHouse_2F_EventScript_Notebook": 1033,
  "PlayersHouse_2F_EventScript_GameCube": 1042,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,10,0,0,0,0,211,0,0,0,35,0,0,2,0,34,0,0,2,0,8,0,181,0,0,0,8,0,0,0,0,0,35,0,0,3,0,34,0,0,3,0,8,4,87,0,0,0,8,4,0,0,0,0,35,0,0,4,0,34,0,0,4,0,8,1,0,0,0,0,8,1,0,0,0,0,5,0,0,0,0,23,0,0,0,0,3,44,0,0,7,1,123,0,0,0,35,0,0,2,0,34,0,0,2,0,7,4,180,0,0,0,7,4,0,0,0,0,6,123,0,0,0,161,35,0,0,0,0,34,0,0,0,0,7,1,180,0,0,0,7,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,7,4,0,0,0,0,7,4,0,0,0,0,100,0,0,0,0,2,0,102,0,0,0,4,4,161,35,0,0,0,0,34,0,0,0,0,7,1,205,0,0,0,7,1,0,0,0,0,4,23,0,0,2,0,4,0,0,0,0,219,0,0,0,161,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,3,106,35,0,0,2,0,34,0,0,2,0,7,1,20,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,108,3,41,10,0,86,0,0,87,0,0,0,0,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,10,0,52,165,1,1,35,0,0,0,0,34,0,0,0,0,8,1,223,1,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,65,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,163,2,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,5,3,0,0,8,1,0,0,0,0,23,0,0,3,0,42,0,0,43,0,0,23,0,0,1,0,53,0,0,54,108,3,80,0,0,91,3,0,0,81,0,0,91,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,106,3,0,0,81,0,0,106,3,0,0,0,0,80,0,0,97,3,0,0,81,0,0,97,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,114,3,0,0,81,0,0,114,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,125,3,0,0,81,0,0,125,3,0,0,0,0,80,0,0,118,3,0,0,81,0,0,118,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,131,3,0,0,81,0,0,131,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,145,3,0,0,81,0,0,145,3,0,0,0,0,80,0,0,136,3,0,0,81,0,0,136,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,152,3,0,0,81,0,0,152,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,159,3,0,0,81,0,0,159,3,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,106,161,35,0,0,0,0,34,0,0,0,0,7,1,215,3,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,255,3,0,0,7,1,0,0,0,0,3,23,0,0,0,0,38,0,0,0,48,4,0,16,0,0,0,0,0,10,4,38,0,0,0,108,3,23,0,0,0,0,48,3,0,38,0,0,0,108,3,16,0,0,0,0,0,10,4,108,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3] as const;

export const STATS = { ops: 199, bytes: 1051, labels: 34, unknownOps: 0, unresolvedSymbols: 51 } as const;
