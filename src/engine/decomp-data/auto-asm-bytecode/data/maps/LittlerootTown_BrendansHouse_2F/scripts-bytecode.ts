// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=199, bytes=863, labels=34, unknownOps=2, unresolvedSymbols=20

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_2F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_2F_OnTransition": 10,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckShouldUpdateBrendanPos": 50,
  "LittlerootTown_BrendansHouse_2F_EventScript_TryUpdateBrendanPos": 74,
  "LittlerootTown_BrendansHouse_2F_EventScript_Ret": 107,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckSetReadyToMeetBrendan": 108,
  "LittlerootTown_BrendansHouse_2F_EventScript_SetReadyToMeetBrendan": 120,
  "LittlerootTown_BrendansHouse_2F_OnWarp": 125,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckInitDecor": 133,
  "LittlerootTown_BrendansHouse_2F_EventScript_RivalsPokeBall": 145,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendan": 166,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanNorth": 317,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanSouth": 415,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanWest": 513,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanEast": 611,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanEnters": 693,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerNorth": 697,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCNorth": 703,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanNorth": 712,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerSouth": 720,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCSouth": 724,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanSouth": 731,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerWest": 737,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCWest": 742,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanWest": 751,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerEast": 758,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCEast": 765,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanEast": 770,
  "LittlerootTown_BrendansHouse_2F_EventScript_PC": 774,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckPlayersPC": 797,
  "LittlerootTown_BrendansHouse_2F_EventScript_TurnOffPlayerPC": 822,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckRivalsPC": 835,
  "PlayersHouse_2F_EventScript_Notebook": 845,
  "PlayersHouse_2F_EventScript_GameCube": 854,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,125,0,0,0,35,141,64,2,0,34,141,64,2,0,35,141,64,3,0,34,141,64,3,0,35,146,64,4,0,34,146,64,4,0,88,0,0,0,0,113,137,0,0,90,44,36,1,7,1,74,0,0,0,35,132,64,2,0,34,132,64,2,0,89,74,0,0,0,161,35,13,128,0,0,34,13,128,0,0,35,211,64,2,0,34,211,64,2,0,100,0,0,0,0,2,0,102,0,0,7,15,15,161,35,13,128,1,0,34,13,128,1,0,15,113,141,2,0,15,137,64,0,0,133,0,0,0,161,35,13,128,0,0,34,13,128,0,0,90,106,35,141,64,2,0,34,141,64,2,0,16,0,0,0,0,0,10,0,108,90,4,10,86,0,0,87,0,0,0,0,80,0,0,181,2,0,0,81,0,0,181,2,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,10,52,165,1,1,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,113,141,3,0,42,49,3,43,248,2,113,80,1,0,53,0,0,54,108,90,80,0,0,185,2,0,0,81,0,0,185,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,200,2,0,0,81,255,0,200,2,0,0,0,0,80,0,0,191,2,0,0,81,0,0,191,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,208,2,0,0,81,0,0,208,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,219,2,0,0,81,255,0,219,2,0,0,0,0,80,0,0,212,2,0,0,81,0,0,212,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,225,2,0,0,81,0,0,225,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,239,2,0,0,81,255,0,239,2,0,0,0,0,80,0,0,230,2,0,0,81,0,0,230,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,246,2,0,0,81,0,0,246,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,253,2,0,0,81,0,0,253,2,0,0,0,0,82,0,0,83,0,0,0,0,15,8,8,39,254,10,10,8,8,10,254,9,9,9,10,10,10,10,38,254,20,38,20,20,20,20,39,254,10,10,10,254,9,10,10,10,10,38,254,20,38,20,20,39,254,10,10,8,39,254,9,9,10,10,10,10,10,38,254,19,20,38,20,20,39,254,10,10,10,10,10,37,254,9,10,10,38,254,20,20,39,254,106,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,113,4,1,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,0,38,0,0,0,108,90,113,4,1,0,9,3,0,38,0,0,0,108,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 199, bytes: 863, labels: 34, unknownOps: 2, unresolvedSymbols: 20 } as const;
