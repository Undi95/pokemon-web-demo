// AUTO-GENERATED from data/maps/LittlerootTown_MaysHouse_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=226, bytes=1230, labels=40, unknownOps=0, unresolvedSymbols=25

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_MaysHouse_2F_MapScripts": 0,
  "LittlerootTown_MaysHouse_2F_OnTransition": 10,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckShouldUpdateMayPos": 86,
  "LittlerootTown_MaysHouse_2F_EventScript_TryUpdateMayPos": 122,
  "LittlerootTown_MaysHouse_2F_EventScript_Ret": 179,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckSetReadyToMeetMay": 180,
  "LittlerootTown_MaysHouse_2F_EventScript_SetReadyToMeetMay": 204,
  "LittlerootTown_MaysHouse_2F_OnWarp": 209,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckInitDecor": 217,
  "LittlerootTown_MaysHouse_2F_EventScript_RivalsPokeBall": 241,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMay": 274,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayNorth": 473,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMaySouth": 571,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayWest": 669,
  "LittlerootTown_MaysHouse_2F_EventScript_MeetMayEast": 751,
  "LittlerootTown_MaysHouse_2F_Movement_MayEnters": 849,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerNorth": 853,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCNorth": 859,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayNorth": 869,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerSouth": 877,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCSouth": 881,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMaySouth": 889,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerWest": 895,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCWest": 902,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayWest": 907,
  "LittlerootTown_MaysHouse_2F_Movement_MayApproachPlayerEast": 911,
  "LittlerootTown_MaysHouse_2F_Movement_MayWalkToPCEast": 916,
  "LittlerootTown_MaysHouse_2F_Movement_PlayerWatchMayEast": 925,
  "RivalsHouse_2F_EventScript_Rival": 931,
  "RivalsHouse_2F_EventScript_May": 987,
  "RivalsHouse_2F_EventScript_Brendan": 997,
  "RivalsHouse_2F_EventScript_RivalPostLilycove": 1007,
  "RivalsHouse_2F_EventScript_MayPostLilycove": 1081,
  "RivalsHouse_2F_EventScript_BrendanPostLilycove": 1099,
  "RivalsHouse_2F_EventScript_MayWhereShouldIGoNext": 1117,
  "RivalsHouse_2F_EventScript_BrendanWhereShouldIGoNext": 1126,
  "LittlerootTown_MaysHouse_2F_EventScript_PC": 1135,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckRivalsPC": 1182,
  "LittlerootTown_MaysHouse_2F_EventScript_CheckPlayersPC": 1192,
  "LittlerootTown_MaysHouse_2F_EventScript_TurnOffPlayerPC": 1217,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,209,0,0,0,35,141,64,2,0,34,141,64,2,0,8,0,180,0,0,0,8,0,141,64,0,0,35,141,64,3,0,34,141,64,3,0,8,4,86,0,0,0,8,4,141,64,0,0,35,146,64,4,0,34,146,64,4,0,8,1,0,0,0,0,8,1,146,64,0,0,88,0,0,0,0,113,137,0,0,90,44,36,1,7,1,122,0,0,0,35,132,64,2,0,34,132,64,2,0,7,4,179,0,0,0,7,4,132,64,0,0,89,122,0,0,0,161,35,13,128,1,0,34,13,128,1,0,7,1,179,0,0,0,7,1,13,128,0,0,35,211,64,2,0,34,211,64,2,0,7,4,179,0,0,0,7,4,211,64,0,0,100,0,0,8,0,2,0,102,0,0,7,15,15,161,35,13,128,0,0,34,13,128,0,0,7,1,204,0,0,0,7,1,13,128,0,0,15,113,141,2,0,15,137,64,0,0,217,0,0,0,161,35,13,128,1,0,34,13,128,1,0,7,1,0,0,0,0,7,1,13,128,0,0,90,106,35,141,64,2,0,34,141,64,2,0,7,1,18,1,0,0,7,1,141,64,0,0,16,0,0,0,0,0,10,4,108,90,4,10,86,0,0,87,0,0,0,0,80,0,0,81,3,0,0,81,0,0,81,3,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,10,52,159,1,1,35,12,128,2,0,34,12,128,2,0,8,1,217,1,0,0,8,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,59,2,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,157,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,239,2,0,0,8,1,12,128,0,0,113,141,3,0,42,50,3,43,210,2,113,80,1,0,53,0,0,54,108,90,80,0,0,85,3,0,0,81,0,0,85,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,101,3,0,0,81,255,0,101,3,0,0,0,0,80,0,0,91,3,0,0,81,0,0,91,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,109,3,0,0,81,0,0,109,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,121,3,0,0,81,255,0,121,3,0,0,0,0,80,0,0,113,3,0,0,81,0,0,113,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,127,3,0,0,81,0,0,127,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,134,3,0,0,81,0,0,134,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,143,3,0,0,81,0,0,143,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,157,3,0,0,81,255,0,157,3,0,0,0,0,80,0,0,148,3,0,0,81,0,0,148,3,0,0,0,0,82,0,0,83,0,0,0,0,15,8,8,40,254,11,11,8,8,11,254,9,9,9,40,11,11,11,11,38,254,20,38,20,20,20,20,40,254,11,11,11,254,9,40,11,11,11,11,38,254,20,38,20,20,40,254,11,11,11,11,11,37,254,9,11,11,38,254,20,20,40,254,11,11,8,40,254,9,9,11,11,11,11,11,38,254,20,38,20,20,40,254,106,44,36,1,7,1,239,3,0,0,161,35,13,128,0,0,34,13,128,0,0,7,1,219,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,229,3,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,4,108,90,16,0,0,0,0,0,10,4,108,90,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,161,35,13,128,0,0,34,13,128,0,0,8,1,57,4,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,75,4,0,0,8,1,13,128,0,0,42,37,1,108,90,44,37,1,7,1,93,4,0,0,16,0,0,0,0,0,10,4,15,44,37,1,7,1,102,4,0,0,16,0,0,0,0,0,10,4,15,16,0,0,0,0,0,10,4,15,16,0,0,0,0,0,10,4,15,106,161,35,13,128,0,0,34,13,128,0,0,7,1,158,4,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,168,4,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,4,108,90,113,4,2,0,38,0,0,0,9,4,0,16,0,0,0,0,0,10,4,38,0,0,0,108,90,113,4,2,0,9,3,0,38,0,0,0,108,90] as const;

export const STATS = { ops: 226, bytes: 1230, labels: 40, unknownOps: 0, unresolvedSymbols: 25 } as const;
