// AUTO-GENERATED from data/maps/OldaleTown/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=253, bytes=855, labels=43, unknownOps=19, unresolvedSymbols=26

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "OldaleTown_MapScripts": 0,
  "OldaleTown_OnTransition": 5,
  "OldaleTown_EventScript_SetOldaleState": 41,
  "OldaleTown_EventScript_BlockWestEntrance": 45,
  "OldaleTown_EventScript_MoveMartEmployee": 56,
  "OldaleTown_EventScript_TownSign": 67,
  "OldaleTown_EventScript_Girl": 76,
  "OldaleTown_EventScript_MartEmployee": 85,
  "OldaleTown_EventScript_GoToMartSouth": 122,
  "OldaleTown_EventScript_GoToMartNorth": 168,
  "OldaleTown_EventScript_GoToMartEast": 214,
  "OldaleTown_EventScript_ExplainPokemonMart": 260,
  "OldaleTown_EventScript_ExplainPotion": 304,
  "OldaleTown_EventScript_BagIsFull": 314,
  "OldaleTown_Movement_EmployeeEast": 325,
  "OldaleTown_Movement_EmployeeSouth": 325,
  "OldaleTown_Movement_EmployeeNorth": 325,
  "OldaleTown_Movement_Unknown1": 325,
  "OldaleTown_Movement_PlayerEast": 325,
  "OldaleTown_Movement_PlayerSouth": 325,
  "OldaleTown_Movement_PlayerNorth": 325,
  "OldaleTown_Movement_Unknown2": 325,
  "OldaleTown_EventScript_FootprintsMan": 325,
  "OldaleTown_EventScript_BlockedPath": 371,
  "OldaleTown_EventScript_NotBlockingPath": 447,
  "OldaleTown_EventScript_Rival": 457,
  "OldaleTown_EventScript_RivalTrigger1": 492,
  "OldaleTown_EventScript_RivalTrigger2": 551,
  "OldaleTown_EventScript_RivalTrigger3": 610,
  "OldaleTown_EventScript_ShowRivalMessage": 669,
  "OldaleTown_EventScript_ShowMayMessage": 691,
  "OldaleTown_EventScript_ShowBrendanMessage": 705,
  "OldaleTown_EventScript_RivalFinish": 719,
  "OldaleTown_EventScript_DoExitMovement1": 781,
  "OldaleTown_EventScript_DoExitMovement2": 815,
  "OldaleTown_Movement_RivalApproachPlayer1": 855,
  "OldaleTown_Movement_RivalApproachPlayer2": 855,
  "OldaleTown_Movement_RivalApproachPlayer3": 855,
  "OldaleTown_Movement_RivalExit": 855,
  "OldaleTown_Movement_WatchRivalExit": 855,
  "OldaleTown_Movement_PlayerStepBack": 855,
  "OldaleTown_Movement_BackUp": 855,
  "OldaleTown_Movement_ReturnToOriginalPosition": 855,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,88,0,0,0,0,42,0,0,44,116,0,8,0,45,0,0,0,44,132,0,8,0,56,0,0,0,44,116,0,8,1,41,0,0,0,90,113,81,1,0,100,0,0,1,0,11,0,102,0,0,9,100,0,0,13,0,14,0,102,0,0,8,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,132,0,7,1,48,1,0,0,44,0,0,7,1,48,1,0,0,42,0,0,52,164,1,0,16,0,0,0,0,0,10,0,105,90,80,0,0,69,1,0,0,81,0,0,69,1,0,0,0,0,80,255,0,69,1,0,0,81,255,0,69,1,0,0,0,0,82,0,0,83,0,0,0,0,89,4,1,0,0,90,80,0,0,69,1,0,0,81,0,0,69,1,0,0,0,0,80,255,0,69,1,0,0,81,255,0,69,1,0,0,0,0,82,0,0,83,0,0,0,0,89,4,1,0,0,90,80,255,0,69,1,0,0,81,255,0,69,1,0,0,0,0,80,0,0,69,1,0,0,81,0,0,69,1,0,0,0,0,82,0,0,83,0,0,0,0,89,4,1,0,0,90,16,0,0,0,0,0,10,0,27,0,128,13,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,132,0,54,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,54,109,90,107,91,44,116,0,7,1,191,1,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,80,255,0,87,3,0,0,81,255,0,87,3,0,0,0,0,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,0,109,90,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,0,0,89,157,2,0,0,90,106,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,157,2,0,0,90,106,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,157,2,0,0,90,106,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,9,1,0,89,157,2,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,89,207,2,0,0,90,16,0,0,0,0,0,10,0,89,207,2,0,0,90,105,35,9,128,0,0,34,9,128,0,0,35,9,128,1,0,34,9,128,1,0,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,113,199,2,0,42,211,3,108,90,35,12,128,1,0,34,12,128,1,0,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,87,3,0,0,81,255,0,87,3,0,0,0,0,80,0,0,87,3,0,0,81,0,0,87,3,0,0,0,0,82,0,0,83,0,0,0,0] as const;

export const STATS = { ops: 253, bytes: 855, labels: 43, unknownOps: 19, unresolvedSymbols: 26 } as const;
