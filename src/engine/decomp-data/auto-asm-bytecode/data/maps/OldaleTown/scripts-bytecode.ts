// AUTO-GENERATED from data/maps/OldaleTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=253, bytes=1150, labels=43, unknownOps=0, unresolvedSymbols=55

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "OldaleTown_MapScripts": 0,
  "OldaleTown_OnTransition": 5,
  "OldaleTown_EventScript_SetOldaleState": 41,
  "OldaleTown_EventScript_BlockWestEntrance": 47,
  "OldaleTown_EventScript_MoveMartEmployee": 59,
  "OldaleTown_EventScript_TownSign": 71,
  "OldaleTown_EventScript_Girl": 80,
  "OldaleTown_EventScript_MartEmployee": 89,
  "OldaleTown_EventScript_GoToMartSouth": 227,
  "OldaleTown_EventScript_GoToMartNorth": 273,
  "OldaleTown_EventScript_GoToMartEast": 319,
  "OldaleTown_EventScript_ExplainPokemonMart": 365,
  "OldaleTown_EventScript_ExplainPotion": 421,
  "OldaleTown_EventScript_BagIsFull": 431,
  "OldaleTown_Movement_EmployeeEast": 442,
  "OldaleTown_Movement_EmployeeSouth": 451,
  "OldaleTown_Movement_EmployeeNorth": 462,
  "OldaleTown_Movement_Unknown1": 471,
  "OldaleTown_Movement_PlayerEast": 485,
  "OldaleTown_Movement_PlayerSouth": 493,
  "OldaleTown_Movement_PlayerNorth": 503,
  "OldaleTown_Movement_Unknown2": 511,
  "OldaleTown_EventScript_FootprintsMan": 523,
  "OldaleTown_EventScript_BlockedPath": 569,
  "OldaleTown_EventScript_NotBlockingPath": 645,
  "OldaleTown_EventScript_Rival": 655,
  "OldaleTown_EventScript_RivalTrigger1": 691,
  "OldaleTown_EventScript_RivalTrigger2": 751,
  "OldaleTown_EventScript_RivalTrigger3": 811,
  "OldaleTown_EventScript_ShowRivalMessage": 871,
  "OldaleTown_EventScript_ShowMayMessage": 917,
  "OldaleTown_EventScript_ShowBrendanMessage": 931,
  "OldaleTown_EventScript_RivalFinish": 945,
  "OldaleTown_EventScript_DoExitMovement1": 1032,
  "OldaleTown_EventScript_DoExitMovement2": 1079,
  "OldaleTown_Movement_RivalApproachPlayer1": 1120,
  "OldaleTown_Movement_RivalApproachPlayer2": 1123,
  "OldaleTown_Movement_RivalApproachPlayer3": 1125,
  "OldaleTown_Movement_RivalExit": 1127,
  "OldaleTown_Movement_WatchRivalExit": 1134,
  "OldaleTown_Movement_PlayerStepBack": 1138,
  "OldaleTown_Movement_BackUp": 1141,
  "OldaleTown_Movement_ReturnToOriginalPosition": 1147,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,5,0,0,0,5,0,0,0,0,42,0,0,44,0,0,8,0,47,0,0,0,44,0,0,8,0,59,0,0,0,44,0,0,8,1,41,0,0,0,3,23,0,0,1,0,4,100,0,0,1,0,11,0,102,0,0,0,4,100,0,0,13,0,14,0,102,0,0,0,4,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,107,91,44,0,0,7,1,165,1,0,0,44,0,0,7,1,165,1,0,0,42,0,0,52,164,1,0,16,0,0,0,0,0,10,4,105,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,227,0,0,0,34,227,0,0,0,7,1,0,0,0,0,7,1,227,0,0,0,35,0,0,0,0,34,0,0,0,0,35,17,1,0,0,34,17,1,0,0,7,1,0,0,0,0,7,1,17,1,0,0,35,0,0,0,0,34,0,0,0,0,35,63,1,0,0,34,63,1,0,0,7,1,0,0,0,0,7,1,63,1,0,0,3,80,0,0,195,1,0,0,81,0,0,195,1,0,0,0,0,80,0,0,237,1,0,0,81,0,0,237,1,0,0,0,0,82,0,0,83,0,0,0,0,6,109,1,0,0,3,80,0,0,206,1,0,0,81,0,0,206,1,0,0,0,0,80,0,0,247,1,0,0,81,0,0,247,1,0,0,0,0,82,0,0,83,0,0,0,0,6,109,1,0,0,3,80,0,0,229,1,0,0,81,0,0,229,1,0,0,0,0,80,0,0,186,1,0,0,81,0,0,186,1,0,0,0,0,82,0,0,83,0,0,0,0,6,109,1,0,0,3,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,175,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,42,0,0,54,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,54,109,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,91,44,0,0,7,1,133,2,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,106,80,0,0,114,4,0,0,81,0,0,114,4,0,0,0,0,80,0,0,117,4,0,0,81,0,0,117,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,123,4,0,0,81,0,0,123,4,0,0,0,0,82,0,0,83,0,0,0,0,108,3,16,0,0,0,0,0,10,4,109,3,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,6,103,3,0,0,3,106,80,0,0,96,4,0,0,81,0,0,96,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,1,0,6,103,3,0,0,3,106,80,0,0,99,4,0,0,81,0,0,99,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,1,0,6,103,3,0,0,3,106,80,0,0,101,4,0,0,81,0,0,101,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,1,0,6,103,3,0,0,3,161,35,0,0,0,0,34,0,0,0,0,7,1,149,3,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,163,3,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,6,177,3,0,0,3,16,0,0,0,0,0,10,4,6,177,3,0,0,3,105,35,0,0,0,0,34,0,0,0,0,8,1,8,4,0,0,8,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,55,4,0,0,8,1,0,0,0,0,80,0,0,103,4,0,0,81,0,0,103,4,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,23,0,0,2,0,42,0,0,108,3,35,0,0,0,0,34,0,0,0,0,7,5,55,4,0,0,7,5,0,0,0,0,80,0,0,103,4,0,0,81,0,0,103,4,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,110,4,0,0,81,0,0,110,4,0,0,0,0,80,0,0,103,4,0,0,81,0,0,103,4,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 253, bytes: 1150, labels: 43, unknownOps: 0, unresolvedSymbols: 55 } as const;
