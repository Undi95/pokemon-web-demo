// AUTO-GENERATED from data/maps/EverGrandeCity_ChampionsRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=166, bytes=1001, labels=26, unknownOps=2, unresolvedSymbols=34

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EverGrandeCity_ChampionsRoom_MapScripts": 0,
  "EverGrandeCity_ChampionsRoom_OnTransition": 15,
  "EverGrandeCity_ChampionsRoom_OnWarp": 21,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayerTurnNorth": 29,
  "EverGrandeCity_ChampionsRoom_OnFrame": 34,
  "EverGrandeCity_ChampionsRoom_EventScript_EnterRoom": 42,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerApproachWallace": 104,
  "EverGrandeCity_ChampionsRoom_EventScript_Wallace": 107,
  "EverGrandeCity_ChampionsRoom_EventScript_Defeated": 263,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayMayMusic": 356,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayBrendanMusic": 361,
  "EverGrandeCity_ChampionsRoom_EventScript_MayAdvice": 366,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanAdvice": 446,
  "EverGrandeCity_ChampionsRoom_EventScript_BirchArrivesExitForHoF": 526,
  "EverGrandeCity_ChampionsRoom_EventScript_MayCongratulations": 862,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanCongratulations": 871,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalApproachPlayer": 880,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalLookBackAndForth": 929,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExitStart": 954,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExit": 957,
  "EverGrandeCity_ChampionsRoom_Movement_RivalApproachPlayer": 963,
  "EverGrandeCity_ChampionsRoom_Movement_RivalLookBackAndForth": 972,
  "EverGrandeCity_ChampionsRoom_Movement_RivalFollows": 981,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExitStart": 984,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExit": 988,
  "EverGrandeCity_ChampionsRoom_Movement_BirchArrives": 992,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,21,0,0,0,2,34,0,0,0,88,0,0,0,0,90,0,0,0,0,29,0,0,0,92,255,0,2,90,0,0,0,0,42,0,0,0,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,40,80,255,0,104,0,0,0,81,255,0,104,0,0,0,0,0,82,0,0,83,0,0,0,0,113,0,1,0,89,107,0,0,0,108,90,9,9,254,52,198,1,0,16,0,0,0,0,0,10,0,93,3,79,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,7,1,0,0,90,9,8,0,163,6,0,1,0,70,3,0,0,163,6,0,2,0,71,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,105,9,8,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,86,0,0,87,0,0,0,0,88,112,3,0,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,52,159,1,0,15,52,165,1,0,15,16,0,0,0,0,0,10,0,4,40,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,88,161,3,0,0,16,0,0,0,0,0,10,0,89,14,2,0,0,90,16,0,0,0,0,0,10,0,4,40,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,88,161,3,0,0,16,0,0,0,0,0,10,0,89,14,2,0,0,90,105,86,0,0,87,0,0,0,0,80,0,0,224,3,0,0,81,0,0,224,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,88,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,20,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,4,30,80,0,0,216,3,0,0,81,0,0,216,3,0,0,0,0,80,255,0,186,3,0,0,81,255,0,186,3,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,213,3,0,0,81,0,0,213,3,0,0,0,0,82,0,0,83,0,0,0,0,4,20,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,105,80,0,0,220,3,0,0,81,0,0,220,3,0,0,0,0,80,255,0,189,3,0,0,81,255,0,189,3,0,0,0,0,82,0,0,83,0,0,0,0,42,13,3,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,16,0,7,16,0,0,0,0,108,90,16,0,0,0,0,0,10,0,15,16,0,0,0,0,0,10,0,15,80,0,0,195,3,0,0,81,0,0,195,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,204,3,0,0,81,0,0,204,3,0,0,0,0,82,0,0,83,0,0,0,0,15,9,9,254,9,20,9,19,84,254,9,9,9,9,9,10,9,40,254,38,20,40,20,38,19,40,20,254,11,9,254,9,9,37,254,9,19,84,254,9,9,9,9,9,11,9,39,254] as const;

export const STATS = { ops: 166, bytes: 1001, labels: 26, unknownOps: 2, unresolvedSymbols: 34 } as const;
