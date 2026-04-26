// AUTO-GENERATED from data/maps/LittlerootTown_BrendansHouse_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=207, bytes=1092, labels=37, unknownOps=0, unresolvedSymbols=22

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LittlerootTown_BrendansHouse_1F_MapScripts": 0,
  "LittlerootTown_BrendansHouse_1F_OnLoad": 15,
  "LittlerootTown_BrendansHouse_1F_EventScript_SetMovingBoxes": 47,
  "LittlerootTown_BrendansHouse_1F_EventScript_CheckShowShoesManual": 66,
  "LittlerootTown_BrendansHouse_1F_EventScript_ShowRunningShoesManual": 90,
  "LittlerootTown_BrendansHouse_1F_OnTransition": 100,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToStairs": 167,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToTV": 179,
  "LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToDoor": 191,
  "LittlerootTown_BrendansHouse_1F_OnFrame": 203,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoUpstairsToSetClock": 243,
  "LittlerootTown_BrendansHouse_1F_Movement_PushTowardStairs": 319,
  "LittlerootTown_BrendansHouse_1F_EventScript_EnterHouseMovingIn": 321,
  "LittlerootTown_BrendansHouse_1F_EventScript_PetalburgGymReport": 336,
  "LittlerootTown_BrendansHouse_1F_EventScript_YoureNewNeighbor": 351,
  "LittlerootTown_BrendansHouse_1F_Movement_RivalMomApproach": 464,
  "LittlerootTown_BrendansHouse_1F_EventScript_GoSeeRoom": 471,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival0": 510,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival1": 521,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival2": 532,
  "LittlerootTown_BrendansHouse_1F_EventScript_MeetRival": 543,
  "LittlerootTown_BrendansHouse_1F_EventScript_PlayerFaceBrendan": 812,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer0": 837,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer1": 862,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer2": 887,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer0": 912,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer1": 920,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer2": 924,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs0": 932,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs1": 973,
  "LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs2": 1014,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit0": 1055,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit1": 1059,
  "LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit2": 1066,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs0": 1070,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs1": 1076,
  "LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs2": 1086,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [1,15,0,0,0,3,100,0,0,0,2,203,0,0,0,35,146,64,6,0,34,146,64,6,0,8,0,47,0,0,0,8,0,146,64,0,0,44,18,1,8,1,66,0,0,0,90,163,5,0,4,0,112,2,1,0,163,5,0,2,0,104,2,1,0,15,161,35,13,128,0,0,34,13,128,0,0,7,1,90,0,0,0,7,1,13,128,0,0,15,163,3,0,7,0,147,2,1,0,15,35,146,64,3,0,34,146,64,3,0,8,1,191,0,0,0,8,1,146,64,0,0,35,146,64,5,0,34,146,64,5,0,8,1,167,0,0,0,8,1,146,64,0,0,35,146,64,6,0,34,146,64,6,0,8,1,179,0,0,0,8,1,146,64,0,0,90,100,0,0,8,0,4,0,102,0,0,7,15,100,0,0,4,0,5,0,102,0,0,7,15,100,0,0,9,0,8,0,102,0,0,7,15,146,64,3,0,65,1,0,0,146,64,5,0,243,0,0,0,146,64,6,0,80,1,0,0,130,64,1,0,95,1,0,0,130,64,3,0,0,0,0,0,106,16,0,0,0,0,0,10,0,105,80,255,0,63,1,0,0,81,255,0,63,1,0,0,0,0,80,0,0,63,1,0,0,81,0,0,63,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,1,0,7,1,0,0,0,0,108,90,9,254,106,113,4,0,0,113,5,0,0,89,0,0,0,0,90,106,113,4,0,0,113,5,0,0,89,0,0,0,0,90,106,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,80,0,0,208,1,0,0,81,0,0,208,1,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,42,87,0,113,130,2,0,108,90,8,11,11,11,11,11,254,106,113,4,0,0,113,5,0,0,80,4,128,0,0,0,0,81,4,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,89,0,0,0,0,90,106,113,8,0,0,89,31,2,0,0,90,106,113,8,1,0,89,31,2,0,0,90,106,113,8,2,0,89,31,2,0,0,90,9,9,0,4,10,86,0,0,87,0,0,0,0,4,30,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,1,0,34,8,128,1,0,8,5,44,3,0,0,8,5,8,128,0,0,52,165,1,1,35,8,128,0,0,34,8,128,0,0,8,1,69,3,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,94,3,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,119,3,0,0,8,1,8,128,0,0,16,0,0,0,0,0,10,0,105,35,8,128,0,0,34,8,128,0,0,8,1,164,3,0,0,8,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,8,1,205,3,0,0,8,1,8,128,0,0,35,8,128,2,0,34,8,128,2,0,8,1,246,3,0,0,8,1,8,128,0,0,9,9,0,84,0,0,85,0,0,0,0,42,233,2,42,49,3,43,248,2,4,30,113,141,3,0,113,80,1,0,53,0,0,54,108,90,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,144,3,0,0,81,0,0,144,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,152,3,0,0,81,0,0,152,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,156,3,0,0,81,0,0,156,3,0,0,0,0,82,0,0,83,0,0,0,0,15,39,10,38,9,9,9,9,254,9,9,9,254,40,11,38,9,9,9,9,254,80,255,0,31,4,0,0,81,255,0,31,4,0,0,0,0,80,0,0,46,4,0,0,81,0,0,46,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,35,4,0,0,81,255,0,35,4,0,0,0,0,80,0,0,52,4,0,0,81,0,0,52,4,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,42,4,0,0,81,255,0,42,4,0,0,0,0,80,0,0,62,4,0,0,81,0,0,62,4,0,0,0,0,82,0,0,83,0,0,0,0,15,20,19,40,254,20,19,40,20,20,38,254,20,19,39,254,40,11,38,9,9,254,40,11,38,9,9,39,10,38,9,254,39,10,38,9,9,254] as const;

export const STATS = { ops: 207, bytes: 1092, labels: 37, unknownOps: 0, unresolvedSymbols: 22 } as const;
