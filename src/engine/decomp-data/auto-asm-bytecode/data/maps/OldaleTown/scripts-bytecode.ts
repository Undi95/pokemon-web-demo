// AUTO-GENERATED from data/maps/OldaleTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=253, bytes=1036, labels=43, unknownOps=2, unresolvedSymbols=27

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "OldaleTown_MapScripts": 0,
  "OldaleTown_OnTransition": 5,
  "OldaleTown_EventScript_SetOldaleState": 41,
  "OldaleTown_EventScript_BlockWestEntrance": 46,
  "OldaleTown_EventScript_MoveMartEmployee": 58,
  "OldaleTown_EventScript_TownSign": 70,
  "OldaleTown_EventScript_Girl": 79,
  "OldaleTown_EventScript_MartEmployee": 88,
  "OldaleTown_EventScript_GoToMartSouth": 190,
  "OldaleTown_EventScript_GoToMartNorth": 236,
  "OldaleTown_EventScript_GoToMartEast": 282,
  "OldaleTown_EventScript_ExplainPokemonMart": 328,
  "OldaleTown_EventScript_ExplainPotion": 372,
  "OldaleTown_EventScript_BagIsFull": 382,
  "OldaleTown_Movement_EmployeeEast": 393,
  "OldaleTown_Movement_EmployeeSouth": 402,
  "OldaleTown_Movement_EmployeeNorth": 413,
  "OldaleTown_Movement_Unknown1": 422,
  "OldaleTown_Movement_PlayerEast": 436,
  "OldaleTown_Movement_PlayerSouth": 444,
  "OldaleTown_Movement_PlayerNorth": 454,
  "OldaleTown_Movement_Unknown2": 462,
  "OldaleTown_EventScript_FootprintsMan": 474,
  "OldaleTown_EventScript_BlockedPath": 520,
  "OldaleTown_EventScript_NotBlockingPath": 596,
  "OldaleTown_EventScript_Rival": 606,
  "OldaleTown_EventScript_RivalTrigger1": 641,
  "OldaleTown_EventScript_RivalTrigger2": 700,
  "OldaleTown_EventScript_RivalTrigger3": 759,
  "OldaleTown_EventScript_ShowRivalMessage": 818,
  "OldaleTown_EventScript_ShowMayMessage": 840,
  "OldaleTown_EventScript_ShowBrendanMessage": 854,
  "OldaleTown_EventScript_RivalFinish": 868,
  "OldaleTown_EventScript_DoExitMovement1": 930,
  "OldaleTown_EventScript_DoExitMovement2": 965,
  "OldaleTown_Movement_RivalApproachPlayer1": 1006,
  "OldaleTown_Movement_RivalApproachPlayer2": 1009,
  "OldaleTown_Movement_RivalApproachPlayer3": 1011,
  "OldaleTown_Movement_RivalExit": 1013,
  "OldaleTown_Movement_WatchRivalExit": 1020,
  "OldaleTown_Movement_PlayerStepBack": 1024,
  "OldaleTown_Movement_BackUp": 1027,
  "OldaleTown_Movement_ReturnToOriginalPosition": 1033,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,88,0,0,0,0,42,0,0,44,116,0,8,0,46,0,0,0,44,132,0,8,0,58,0,0,0,44,116,0,8,1,41,0,0,0,90,113,81,1,0,15,100,0,0,1,0,11,0,102,0,0,9,15,100,0,0,13,0,14,0,102,0,0,8,15,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,132,0,7,1,116,1,0,0,44,0,0,7,1,116,1,0,0,42,0,0,52,164,1,0,16,0,0,0,0,0,10,0,105,26,0,128,12,128,35,0,128,1,0,34,0,128,1,0,35,190,0,0,0,34,190,0,0,0,35,0,128,2,0,34,0,128,2,0,35,236,0,0,0,34,236,0,0,0,35,0,128,4,0,34,0,128,4,0,35,26,1,0,0,34,26,1,0,0,90,80,0,0,146,1,0,0,81,0,0,146,1,0,0,0,0,80,255,0,188,1,0,0,81,255,0,188,1,0,0,0,0,82,0,0,83,0,0,0,0,89,72,1,0,0,90,80,0,0,157,1,0,0,81,0,0,157,1,0,0,0,0,80,255,0,198,1,0,0,81,255,0,198,1,0,0,0,0,82,0,0,83,0,0,0,0,89,72,1,0,0,90,80,255,0,180,1,0,0,81,255,0,180,1,0,0,0,0,80,0,0,137,1,0,0,81,0,0,137,1,0,0,0,0,82,0,0,83,0,0,0,0,89,72,1,0,0,90,16,0,0,0,0,0,10,0,27,0,128,13,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,132,0,54,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,54,109,90,9,9,9,9,9,9,9,37,254,10,9,9,11,9,9,9,9,9,37,254,9,9,9,9,9,9,9,37,254,9,9,11,11,11,11,9,9,9,9,9,19,37,254,11,9,9,9,9,9,9,254,20,20,20,20,9,9,9,9,9,254,9,9,9,9,9,9,9,254,10,9,9,11,11,11,11,9,9,9,9,254,107,91,44,116,0,7,1,84,2,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,80,255,0,0,4,0,0,81,255,0,0,4,0,0,0,0,80,0,0,3,4,0,0,81,0,0,3,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,9,4,0,0,81,0,0,9,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,0,109,90,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,0,0,89,50,3,0,0,90,106,80,0,0,238,3,0,0,81,0,0,238,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,50,3,0,0,90,106,80,0,0,241,3,0,0,81,0,0,241,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,50,3,0,0,90,106,80,0,0,243,3,0,0,81,0,0,243,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,50,3,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,89,100,3,0,0,90,16,0,0,0,0,0,10,0,89,100,3,0,0,90,105,35,9,128,0,0,34,9,128,0,0,35,9,128,1,0,34,9,128,1,0,80,0,0,245,3,0,0,81,0,0,245,3,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,113,199,2,0,42,211,3,108,90,35,12,128,1,0,34,12,128,1,0,80,0,0,245,3,0,0,81,0,0,245,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,252,3,0,0,81,255,0,252,3,0,0,0,0,80,0,0,245,3,0,0,81,0,0,245,3,0,0,0,0,82,0,0,83,0,0,0,0,15,10,10,254,10,254,2,254,8,8,8,8,8,8,254,19,18,37,254,19,11,254,22,39,64,11,65,254,8,10,254] as const;

export const STATS = { ops: 253, bytes: 1036, labels: 43, unknownOps: 2, unresolvedSymbols: 27 } as const;
