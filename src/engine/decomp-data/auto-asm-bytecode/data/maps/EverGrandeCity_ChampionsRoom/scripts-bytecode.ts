// AUTO-GENERATED from data/maps/EverGrandeCity_ChampionsRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=166, bytes=1073, labels=26, unknownOps=0, unresolvedSymbols=33

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
  "EverGrandeCity_ChampionsRoom_EventScript_PlayMayMusic": 404,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayBrendanMusic": 409,
  "EverGrandeCity_ChampionsRoom_EventScript_MayAdvice": 414,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanAdvice": 494,
  "EverGrandeCity_ChampionsRoom_EventScript_BirchArrivesExitForHoF": 574,
  "EverGrandeCity_ChampionsRoom_EventScript_MayCongratulations": 934,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanCongratulations": 943,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalApproachPlayer": 952,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalLookBackAndForth": 1001,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExitStart": 1026,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExit": 1029,
  "EverGrandeCity_ChampionsRoom_Movement_RivalApproachPlayer": 1035,
  "EverGrandeCity_ChampionsRoom_Movement_RivalLookBackAndForth": 1044,
  "EverGrandeCity_ChampionsRoom_Movement_RivalFollows": 1053,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExitStart": 1056,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExit": 1060,
  "EverGrandeCity_ChampionsRoom_Movement_BirchArrives": 1064,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,21,0,0,0,2,34,0,0,0,88,0,0,0,0,90,0,0,0,0,29,0,0,0,92,255,0,2,90,0,0,0,0,42,0,0,0,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,40,80,255,0,104,0,0,0,81,255,0,104,0,0,0,0,0,82,0,0,83,0,0,0,0,113,0,1,0,89,107,0,0,0,108,90,9,9,254,52,198,1,0,16,0,0,0,0,0,10,4,93,3,79,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,7,1,0,0,90,9,8,0,163,6,0,1,0,70,3,0,0,163,6,0,2,0,71,3,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,9,8,0,161,35,13,128,0,0,34,13,128,0,0,8,1,148,1,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,153,1,0,0,8,1,13,128,0,0,86,0,0,87,0,0,0,0,88,184,3,0,0,161,35,13,128,0,0,34,13,128,0,0,7,1,158,1,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,238,1,0,0,7,1,13,128,0,0,90,52,159,1,0,15,52,165,1,0,15,16,0,0,0,0,0,10,4,4,40,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,88,233,3,0,0,16,0,0,0,0,0,10,4,89,62,2,0,0,90,16,0,0,0,0,0,10,4,4,40,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,88,233,3,0,0,16,0,0,0,0,0,10,4,89,62,2,0,0,90,105,86,0,0,87,0,0,0,0,80,0,0,40,4,0,0,81,0,0,40,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,88,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,20,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,4,30,80,0,0,32,4,0,0,81,0,0,32,4,0,0,0,0,80,255,0,2,4,0,0,81,255,0,2,4,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,29,4,0,0,81,0,0,29,4,0,0,0,0,82,0,0,83,0,0,0,0,4,20,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,161,35,13,128,0,0,34,13,128,0,0,8,1,166,3,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,175,3,0,0,8,1,13,128,0,0,105,80,0,0,36,4,0,0,81,0,0,36,4,0,0,0,0,80,255,0,5,4,0,0,81,255,0,5,4,0,0,0,0,82,0,0,83,0,0,0,0,42,13,3,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,16,0,7,16,0,0,0,0,108,90,16,0,0,0,0,0,10,4,15,16,0,0,0,0,0,10,4,15,80,0,0,11,4,0,0,81,0,0,11,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,20,4,0,0,81,0,0,20,4,0,0,0,0,82,0,0,83,0,0,0,0,15,9,9,254,9,20,9,19,84,254,9,9,9,9,9,10,9,40,254,38,20,40,20,38,19,40,20,254,11,9,254,9,9,37,254,9,19,84,254,9,9,9,9,9,11,9,39,254] as const;

export const STATS = { ops: 166, bytes: 1073, labels: 26, unknownOps: 0, unresolvedSymbols: 33 } as const;
