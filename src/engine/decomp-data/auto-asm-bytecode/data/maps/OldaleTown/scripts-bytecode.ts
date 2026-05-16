// AUTO-GENERATED from data/maps/OldaleTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=253, bytes=1144, labels=43, unknownOps=0, unresolvedSymbols=23

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
  "OldaleTown_EventScript_GoToMartSouth": 226,
  "OldaleTown_EventScript_GoToMartNorth": 272,
  "OldaleTown_EventScript_GoToMartEast": 318,
  "OldaleTown_EventScript_ExplainPokemonMart": 364,
  "OldaleTown_EventScript_ExplainPotion": 420,
  "OldaleTown_EventScript_BagIsFull": 430,
  "OldaleTown_Movement_EmployeeEast": 441,
  "OldaleTown_Movement_EmployeeSouth": 450,
  "OldaleTown_Movement_EmployeeNorth": 461,
  "OldaleTown_Movement_Unknown1": 470,
  "OldaleTown_Movement_PlayerEast": 484,
  "OldaleTown_Movement_PlayerSouth": 492,
  "OldaleTown_Movement_PlayerNorth": 502,
  "OldaleTown_Movement_Unknown2": 510,
  "OldaleTown_EventScript_FootprintsMan": 522,
  "OldaleTown_EventScript_BlockedPath": 568,
  "OldaleTown_EventScript_NotBlockingPath": 644,
  "OldaleTown_EventScript_Rival": 654,
  "OldaleTown_EventScript_RivalTrigger1": 689,
  "OldaleTown_EventScript_RivalTrigger2": 748,
  "OldaleTown_EventScript_RivalTrigger3": 807,
  "OldaleTown_EventScript_ShowRivalMessage": 866,
  "OldaleTown_EventScript_ShowMayMessage": 912,
  "OldaleTown_EventScript_ShowBrendanMessage": 926,
  "OldaleTown_EventScript_RivalFinish": 940,
  "OldaleTown_EventScript_DoExitMovement1": 1026,
  "OldaleTown_EventScript_DoExitMovement2": 1073,
  "OldaleTown_Movement_RivalApproachPlayer1": 1114,
  "OldaleTown_Movement_RivalApproachPlayer2": 1117,
  "OldaleTown_Movement_RivalApproachPlayer3": 1119,
  "OldaleTown_Movement_RivalExit": 1121,
  "OldaleTown_Movement_WatchRivalExit": 1128,
  "OldaleTown_Movement_PlayerStepBack": 1132,
  "OldaleTown_Movement_BackUp": 1135,
  "OldaleTown_Movement_ReturnToOriginalPosition": 1141,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,88,0,0,0,0,42,0,0,44,116,0,8,0,46,0,0,0,44,132,0,8,0,58,0,0,0,44,116,0,8,1,41,0,0,0,90,113,81,1,0,15,100,0,0,1,0,11,0,102,0,0,9,15,100,0,0,13,0,14,0,102,0,0,8,15,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,2,90,107,91,44,132,0,7,1,164,1,0,0,44,0,0,7,1,164,1,0,0,42,0,0,52,164,1,0,16,0,0,0,0,0,10,4,105,26,0,128,12,128,35,0,128,1,0,34,0,128,1,0,35,226,0,0,0,34,226,0,0,0,7,1,0,0,0,0,7,1,226,0,0,0,35,0,128,2,0,34,0,128,2,0,35,16,1,0,0,34,16,1,0,0,7,1,0,0,0,0,7,1,16,1,0,0,35,0,128,4,0,34,0,128,4,0,35,62,1,0,0,34,62,1,0,0,7,1,0,0,0,0,7,1,62,1,0,0,90,80,0,0,194,1,0,0,81,0,0,194,1,0,0,0,0,80,255,0,236,1,0,0,81,255,0,236,1,0,0,0,0,82,0,0,83,0,0,0,0,89,108,1,0,0,90,80,0,0,205,1,0,0,81,0,0,205,1,0,0,0,0,80,255,0,246,1,0,0,81,255,0,246,1,0,0,0,0,82,0,0,83,0,0,0,0,89,108,1,0,0,90,80,255,0,228,1,0,0,81,255,0,228,1,0,0,0,0,80,0,0,185,1,0,0,81,0,0,185,1,0,0,0,0,82,0,0,83,0,0,0,0,89,108,1,0,0,90,16,0,0,0,0,0,10,4,27,0,128,13,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,174,1,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,132,0,54,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,54,109,90,9,9,9,9,9,9,9,37,254,10,9,9,11,9,9,9,9,9,37,254,9,9,9,9,9,9,9,37,254,9,9,11,11,11,11,9,9,9,9,9,19,37,254,11,9,9,9,9,9,9,254,20,20,20,20,9,9,9,9,9,254,9,9,9,9,9,9,9,254,10,9,9,11,11,11,11,9,9,9,9,254,107,91,44,116,0,7,1,132,2,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,80,255,0,108,4,0,0,81,255,0,108,4,0,0,0,0,80,0,0,111,4,0,0,81,0,0,111,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,117,4,0,0,81,0,0,117,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,4,109,90,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,0,0,89,98,3,0,0,90,106,80,0,0,90,4,0,0,81,0,0,90,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,98,3,0,0,90,106,80,0,0,93,4,0,0,81,0,0,93,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,98,3,0,0,90,106,80,0,0,95,4,0,0,81,0,0,95,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,98,3,0,0,90,161,35,13,128,0,0,34,13,128,0,0,7,1,144,3,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,158,3,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,4,89,172,3,0,0,90,16,0,0,0,0,0,10,4,89,172,3,0,0,90,105,35,9,128,0,0,34,9,128,0,0,8,1,2,4,0,0,8,1,9,128,0,0,35,9,128,1,0,34,9,128,1,0,8,1,49,4,0,0,8,1,9,128,0,0,80,0,0,97,4,0,0,81,0,0,97,4,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,113,199,2,0,42,211,3,108,90,35,12,128,1,0,34,12,128,1,0,7,5,49,4,0,0,7,5,12,128,0,0,80,0,0,97,4,0,0,81,0,0,97,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,104,4,0,0,81,255,0,104,4,0,0,0,0,80,0,0,97,4,0,0,81,0,0,97,4,0,0,0,0,82,0,0,83,0,0,0,0,15,10,10,254,10,254,2,254,8,8,8,8,8,8,254,19,18,37,254,19,11,254,22,39,64,11,65,254,8,10,254] as const;

export const STATS = { ops: 253, bytes: 1144, labels: 43, unknownOps: 0, unresolvedSymbols: 23 } as const;
