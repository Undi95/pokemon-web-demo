// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=226, bytes=908, labels=40, unknownOps=11, unresolvedSymbols=24

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_MaysHouse_2F_MapScripts": 0,
  "LittlerootTown_MaysHouse_2F_OnTransition": 10,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckShouldUpdateMayPos": 50,
  "LittlerootTown_MaysHouse_2F_EventScript_TryUpdateMayPos": 74,
  "LittlerootTown_MaysHouse_2F_EventScript_Ret": 106,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckSetReadyToMeetMay": 106,
  "LittlerootTown_MaysHouse_2F_EventScript_SetReadyToMeetMay": 117,
  "LittlerootTown_MaysHouse_2F_OnWarp": 121,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckInitDecor": 129,
  "LittlerootTown_MaysHouse_2F_EventScript_RivalsPokeBall": 141,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMay": 162,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayNorth": 313,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMaySouth": 410,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayWest": 507,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayEast": 588,
  "LittlerootTown_MaysHouse_2F_Movement_MayEnters": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerNorth": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCNorth": 685,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayNorth": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerSouth": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCSouth": 685,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMaySouth": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerWest": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCWest": 685,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayWest": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerEast": 685,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCEast": 685,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayEast": 685,
  "RivalsHouse_2F_EventScript_Rival": 685,
  "RivalsHouse_2F_EventScript_May": 717,
  "RivalsHouse_2F_EventScript_Brendan": 727,
  "RivalsHouse_2F_EventScript_RivalPostLilycove": 737,
  "RivalsHouse_2F_EventScript_MayPostLilycove": 787,
  "RivalsHouse_2F_EventScript_BrendanPostLilycove": 804,
  "RivalsHouse_2F_EventScript_MayWhereShouldIGoNext": 821,
  "RivalsHouse_2F_EventScript_BrendanWhereShouldIGoNext": 829,
  "LittlerootTown_MaysHouse_2F_EventScript_PC": 837,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckRivalsPC": 860,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckPlayersPC": 870,
  "LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC": 895,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,121,0,0,0,35,141,64,2,0,34,141,64,2,0,35,141,64,3,0,34,141,64,3,0,35,146,64,4,0,34,146,64,4,0,88,0,0,0,0,113,137,0,0,90,44,36,1,7,1,74,0,0,0,35,132,64,2,0,34,132,64,2,0,89,74,0,0,0,161,35,13,128,1,0,34,13,128,1,0,35,211,64,2,0,34,211,64,2,0,100,0,0,8,0,2,0,102,0,0,7,161,35,13,128,0,0,34,13,128,0,0,113,141,2,0,137,64,0,0,129,0,0,0,161,35,13,128,1,0,34,13,128,1,0,90,106,35,141,64,2,0,34,141,64,2,0,16,0,0,0,0,0,10,0,108,90,4,10,86,0,0,87,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,10,52,159,1,1,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,35,12,128,3,0,34,12,128,3,0,35,12,128,4,0,34,12,128,4,0,113,141,3,0,42,50,3,43,210,2,113,80,1,0,53,0,0,54,108,90,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,173,2,0,0,81,255,0,173,2,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,173,2,0,0,81,255,0,173,2,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,173,2,0,0,81,255,0,173,2,0,0,0,0,80,0,0,173,2,0,0,81,0,0,173,2,0,0,0,0,82,0,0,83,0,0,0,0,106,44,36,1,7,1,225,2,0,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,42,37,1,108,90,44,37,1,7,1,53,3,0,0,16,0,0,0,0,0,10,0,44,37,1,7,1,61,3,0,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,106,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,108,90,113,4,2,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,0,38,0,0,0,108,90,113,4,2,0,9,3,0,38,0,0,0,108,90] as const;

export const STATS = { ops: 226, bytes: 908, labels: 40, unknownOps: 11, unresolvedSymbols: 24 } as const;
