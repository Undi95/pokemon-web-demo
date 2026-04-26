// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=199, bytes=774, labels=34, unknownOps=12, unresolvedSymbols=20

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_2F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_2F_OnTransition": 10,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckShouldUpdateBrendanPos": 50,
  "LittlerootTown_BrendansHouse_2F_EventScript_TryUpdateBrendanPos": 74,
  "LittlerootTown_BrendansHouse_2F_EventScript_Ret": 106,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckSetReadyToMeetBrendan": 106,
  "LittlerootTown_BrendansHouse_2F_EventScript_SetReadyToMeetBrendan": 117,
  "LittlerootTown_BrendansHouse_2F_OnWarp": 121,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckInitDecor": 129,
  "LittlerootTown_BrendansHouse_2F_EventScript_RivalsPokeBall": 141,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendan": 162,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanNorth": 313,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanSouth": 410,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanWest": 507,
  "LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanEast": 604,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanEnters": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerNorth": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCNorth": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanNorth": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerSouth": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCSouth": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanSouth": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerWest": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCWest": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanWest": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerEast": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCEast": 685,
  "LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanEast": 685,
  "LittlerootTown_BrendansHouse_2F_EventScript_PC": 685,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckPlayersPC": 708,
  "LittlerootTown_BrendansHouse_2F_EventScript_TurnOffPlayerPC": 733,
  "LittlerootTown_BrendansHouse_2F_EventScript_CheckRivalsPC": 746,
  "PlayersHouse_2F_EventScript_Notebook": 756,
  "PlayersHouse_2F_EventScript_GameCube": 765,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,121,0,0,0,35,141,64,2,0,34,141,64,2,0,35,141,64,3,0,34,141,64,3,0,35,146,64,4,0,34,146,64,4,0,88,0,0,0,0,113,137,0,0,90,44,36,1,7,1,74,0,0,0,35,132,64,2,0,34,132,64,2,0,89,74,0,0,0,161,35,13,128,0,0,34,13,128,0,0,35,211,64,2,0,34,211,64,2,0,100,0,0,0,0,2,0,102,0,0,7,161,35,13,128,1,0,34,13,128,1,0,113,141,2,0,137,64,0,0,129,0,0,0,161,35,13,128,0,0,34,13,128,0,0,90,106,35,141,64,2,0,34,141,64,2,0,16,0,0,0,0,0,10,0,108,90,4,10,86,0,0,87,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,10,52,165,1,1,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,113,141,3,0,42,49,3,43,248,2,113,80,1,0,53,0,0,54,108,90,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,173,2,0,0,81,255,0,173,2,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,173,2,0,0,81,255,0,173,2,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,173,2,0,0,81,255,0,173,2,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,106,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,113,4,1,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,0,38,0,0,0,108,90,113,4,1,0,9,3,0,38,0,0,0,108,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 199, bytes: 774, labels: 34, unknownOps: 12, unresolvedSymbols: 20 } as const;
