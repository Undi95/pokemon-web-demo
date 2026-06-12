// AUTO-GENERATED from data/maps/EverGrandeCity_ChampionsRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=166, bytes=1080, labels=26, unknownOps=0, unresolvedSymbols=29

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "EverGrandeCity_ChampionsRoom_MapScripts": 0,
  "EverGrandeCity_ChampionsRoom_OnTransition": 15,
  "EverGrandeCity_ChampionsRoom_OnWarp": 21,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayerTurnNorth": 29,
  "EverGrandeCity_ChampionsRoom_OnFrame": 34,
  "EverGrandeCity_ChampionsRoom_EventScript_EnterRoom": 42,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerApproachWallace": 106,
  "EverGrandeCity_ChampionsRoom_EventScript_Wallace": 109,
  "EverGrandeCity_ChampionsRoom_EventScript_Defeated": 265,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayMayMusic": 406,
  "EverGrandeCity_ChampionsRoom_EventScript_PlayBrendanMusic": 411,
  "EverGrandeCity_ChampionsRoom_EventScript_MayAdvice": 416,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanAdvice": 497,
  "EverGrandeCity_ChampionsRoom_EventScript_BirchArrivesExitForHoF": 578,
  "EverGrandeCity_ChampionsRoom_EventScript_MayCongratulations": 941,
  "EverGrandeCity_ChampionsRoom_EventScript_BrendanCongratulations": 950,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalApproachPlayer": 959,
  "EverGrandeCity_ChampionsRoom_EventScript_RivalLookBackAndForth": 1008,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExitStart": 1033,
  "EverGrandeCity_ChampionsRoom_Movement_PlayerExit": 1036,
  "EverGrandeCity_ChampionsRoom_Movement_RivalApproachPlayer": 1042,
  "EverGrandeCity_ChampionsRoom_Movement_RivalLookBackAndForth": 1051,
  "EverGrandeCity_ChampionsRoom_Movement_RivalFollows": 1060,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExitStart": 1063,
  "EverGrandeCity_ChampionsRoom_Movement_WallaceExit": 1067,
  "EverGrandeCity_ChampionsRoom_Movement_BirchArrives": 1071,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,21,0,0,0,2,34,0,0,0,5,0,0,0,0,3,0,0,0,0,29,0,0,0,92,255,0,2,3,0,0,0,0,42,0,0,0,106,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,40,0,80,255,0,106,0,0,0,81,255,0,106,0,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,1,0,6,109,0,0,0,108,3,9,9,254,52,198,1,0,16,0,0,0,0,0,10,4,93,3,79,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,9,1,0,0,3,48,8,0,163,6,0,1,0,70,3,0,0,163,6,0,2,0,71,3,0,0,38,0,0,58,16,0,0,0,0,0,10,4,105,48,8,0,161,35,13,128,0,0,34,13,128,0,0,8,1,150,1,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,155,1,0,0,8,1,13,128,0,0,86,0,0,87,0,0,0,0,5,191,3,0,0,161,35,13,128,0,0,34,13,128,0,0,7,1,160,1,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,241,1,0,0,7,1,13,128,0,0,3,52,159,1,0,4,52,165,1,0,4,16,0,0,0,0,0,10,4,41,40,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,5,240,3,0,0,16,0,0,0,0,0,10,4,6,66,2,0,0,3,16,0,0,0,0,0,10,4,41,40,0,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,5,240,3,0,0,16,0,0,0,0,0,10,4,6,66,2,0,0,3,105,86,0,0,87,0,0,0,0,80,0,0,47,4,0,0,81,0,0,47,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,5,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,41,20,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,41,30,0,80,0,0,39,4,0,0,81,0,0,39,4,0,0,0,0,80,255,0,9,4,0,0,81,255,0,9,4,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,36,4,0,0,81,0,0,36,4,0,0,0,0,82,0,0,83,0,0,0,0,41,20,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,161,35,13,128,0,0,34,13,128,0,0,8,1,173,3,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,182,3,0,0,8,1,13,128,0,0,105,80,0,0,43,4,0,0,81,0,0,43,4,0,0,0,0,80,255,0,12,4,0,0,81,255,0,12,4,0,0,0,0,82,0,0,83,0,0,0,0,42,13,3,58,0,0,255,255,255,255,255,7,255,255,255,255,255,7,0,16,0,7,16,0,0,0,58,108,3,16,0,0,0,0,0,10,4,4,16,0,0,0,0,0,10,4,4,80,0,0,18,4,0,0,81,0,0,18,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,27,4,0,0,81,0,0,27,4,0,0,0,0,82,0,0,83,0,0,0,0,4,9,9,254,9,20,9,19,84,254,9,9,9,9,9,10,9,40,254,38,20,40,20,38,19,40,20,254,11,9,254,9,9,37,254,9,19,84,254,9,9,9,9,9,11,9,39,254] as const;

export const STATS = { ops: 166, bytes: 1080, labels: 26, unknownOps: 0, unresolvedSymbols: 29 } as const;
