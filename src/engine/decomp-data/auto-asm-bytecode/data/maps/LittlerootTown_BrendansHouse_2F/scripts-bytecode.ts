// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=199, bytes=1043, labels=34, unknownOps=0, unresolvedSymbols=21

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_2F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_2F_OnTransition": 10,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckShouldUpdateBrendanPos": 86,
  "LittlerootTown_BrendansHouse_2F_EventScript_TryUpdateBrendanPos": 122,
  "LittlerootTown_BrendansHouse_2F_EventScript_Ret": 179,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckSetReadyToMeetBrendan": 180,
  "LittlerootTown_BrendansHouse_2F_EventScript_SetReadyToMeetBrendan": 204,
  "LittlerootTown_BrendansHouse_2F_OnWarp": 209,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckInitDecor": 217,
  "LittlerootTown_BrendansHouse_2F_EventScript_RivalsPokeBall": 241,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendan": 274,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanNorth": 473,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanSouth": 571,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanWest": 669,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanEast": 767,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanEnters": 849,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerNorth": 853,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCNorth": 859,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanNorth": 868,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerSouth": 876,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCSouth": 880,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanSouth": 887,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerWest": 893,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCWest": 898,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanWest": 907,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerEast": 914,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCEast": 921,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanEast": 926,
  "LittlerootTown_BrendansHouse_2F_EventScript_PC": 930,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckPlayersPC": 977,
  "LittlerootTown_BrendansHouse_2F_EventScript_TurnOffPlayerPC": 1002,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckRivalsPC": 1015,
  "PlayersHouse_2F_EventScript_Notebook": 1025,
  "PlayersHouse_2F_EventScript_GameCube": 1034,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,209,0,0,0,35,141,64,2,0,34,141,64,2,0,8,0,180,0,0,0,8,0,141,64,0,0,35,141,64,3,0,34,141,64,3,0,8,4,86,0,0,0,8,4,141,64,0,0,35,146,64,4,0,34,146,64,4,0,8,1,0,0,0,0,8,1,146,64,0,0,88,0,0,0,0,113,137,0,0,90,44,36,1,7,1,122,0,0,0,35,132,64,2,0,34,132,64,2,0,7,4,179,0,0,0,7,4,132,64,0,0,89,122,0,0,0,161,35,13,128,0,0,34,13,128,0,0,7,1,179,0,0,0,7,1,13,128,0,0,35,211,64,2,0,34,211,64,2,0,7,4,0,0,0,0,7,4,211,64,0,0,100,0,0,0,0,2,0,102,0,0,7,15,15,161,35,13,128,1,0,34,13,128,1,0,7,1,204,0,0,0,7,1,13,128,0,0,15,113,141,2,0,15,137,64,0,0,217,0,0,0,161,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,90,106,35,141,64,2,0,34,141,64,2,0,7,1,18,1,0,0,7,1,141,64,0,0,16,0,0,0,0,0,10,4,108,90,4,10,86,0,0,87,0,0,0,0,80,0,0,81,3,0,0,81,0,0,81,3,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,10,52,165,1,1,35,12,128,2,0,34,12,128,2,0,8,1,217,1,0,0,8,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,59,2,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,157,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,255,2,0,0,8,1,12,128,0,0,113,141,3,0,42,49,3,43,248,2,113,80,1,0,53,0,0,54,108,90,80,0,0,85,3,0,0,81,0,0,85,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,100,3,0,0,81,255,0,100,3,0,0,0,0,80,0,0,91,3,0,0,81,0,0,91,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,108,3,0,0,81,0,0,108,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,119,3,0,0,81,255,0,119,3,0,0,0,0,80,0,0,112,3,0,0,81,0,0,112,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,125,3,0,0,81,0,0,125,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,139,3,0,0,81,255,0,139,3,0,0,0,0,80,0,0,130,3,0,0,81,0,0,130,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,146,3,0,0,81,0,0,146,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,153,3,0,0,81,0,0,153,3,0,0,0,0,82,0,0,83,0,0,0,0,15,8,8,39,254,10,10,8,8,10,254,9,9,9,10,10,10,10,38,254,20,38,20,20,20,20,39,254,10,10,10,254,9,10,10,10,10,38,254,20,38,20,20,39,254,10,10,8,39,254,9,9,10,10,10,10,10,38,254,19,20,38,20,20,39,254,10,10,10,10,10,37,254,9,10,10,38,254,20,20,39,254,106,161,35,13,128,0,0,34,13,128,0,0,7,1,209,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,247,3,0,0,7,1,13,128,0,0,90,113,4,1,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,4,38,0,0,0,108,90,113,4,1,0,9,3,0,38,0,0,0,108,90,16,0,0,0,0,0,10,4,108,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90] as const;

export const STATS = { ops: 199, bytes: 1043, labels: 34, unknownOps: 0, unresolvedSymbols: 21 } as const;
