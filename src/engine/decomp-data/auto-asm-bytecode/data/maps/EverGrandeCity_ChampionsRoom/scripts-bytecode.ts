// AUTO-GENERATED from data/maps/EverGrandeCity_ChampionsRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=166, bytes=945, labels=26, unknownOps=14, unresolvedSymbols=34

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EverGrandeCity_ChampionsRoom_MapScripts": 0,
  "EverGrandeCity_ChampionsRoom_OnTransition": 15,
  "EverGrandeCity_ChampionsRoom_OnWarp": 21,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayerTurnNorth": 29,
  "EverGrandeCity_ChampionsRoom_OnFrame": 34,
  "EverGrandeCity_ChampionsRoom_EventScript_EnterRoom": 42,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerApproachWallace": 104,
  "EverGrandeCity_ChampionsRoom_EventScript_Wallace": 104,
  "EverGrandeCity_ChampionsRoom_EventScript_Defeated": 260,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayMayMusic": 353,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayBrendanMusic": 357,
  "EverGrandeCity_ChampionsRoom_EventScript_MayAdvice": 361,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanAdvice": 441,
  "EverGrandeCity_ChampionsRoom_EventScript_BirchArrivesExitForHoF": 521,
  "EverGrandeCity_ChampionsRoom_EventScript_MayCongratulations": 857,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanCongratulations": 865,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalApproachPlayer": 873,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalLookBackAndForth": 921,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExitStart": 945,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExit": 945,
  "EverGrandeCity_ChampionsRoom_Movement_RivalApproachPlayer": 945,
  "EverGrandeCity_ChampionsRoom_Movement_RivalLookBackAndForth": 945,
  "EverGrandeCity_ChampionsRoom_Movement_RivalFollows": 945,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExitStart": 945,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExit": 945,
  "EverGrandeCity_ChampionsRoom_Movement_BirchArrives": 945,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,21,0,0,0,2,34,0,0,0,88,0,0,0,0,90,0,0,0,0,29,0,0,0,92,255,0,2,90,0,0,0,0,42,0,0,0,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,40,80,255,0,104,0,0,0,81,255,0,104,0,0,0,0,0,82,0,0,83,0,0,0,0,113,0,1,0,89,104,0,0,0,108,90,52,198,1,0,16,0,0,0,0,0,10,0,93,3,79,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,4,1,0,0,90,9,8,0,163,6,0,1,0,70,3,0,0,163,6,0,2,0,71,3,0,0,38,0,0,0,16,0,0,0,0,0,10,0,105,9,8,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,86,0,0,87,0,0,0,0,88,105,3,0,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,52,159,1,0,52,165,1,0,16,0,0,0,0,0,10,0,4,40,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,88,153,3,0,0,16,0,0,0,0,0,10,0,89,9,2,0,0,90,16,0,0,0,0,0,10,0,4,40,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,88,153,3,0,0,16,0,0,0,0,0,10,0,89,9,2,0,0,90,105,86,0,0,87,0,0,0,0,80,0,0,177,3,0,0,81,0,0,177,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,88,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,20,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,4,30,80,0,0,177,3,0,0,81,0,0,177,3,0,0,0,0,80,255,0,177,3,0,0,81,255,0,177,3,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,177,3,0,0,81,0,0,177,3,0,0,0,0,82,0,0,83,0,0,0,0,4,20,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,105,80,0,0,177,3,0,0,81,0,0,177,3,0,0,0,0,80,255,0,177,3,0,0,81,255,0,177,3,0,0,0,0,82,0,0,83,0,0,0,0,42,13,3,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,16,0,7,16,0,0,0,0,108,90,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,80,0,0,177,3,0,0,81,0,0,177,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,177,3,0,0,81,0,0,177,3,0,0,0,0,82,0,0,83,0,0,0,0] as const;

export const STATS = { ops: 166, bytes: 945, labels: 26, unknownOps: 14, unresolvedSymbols: 34 } as const;
