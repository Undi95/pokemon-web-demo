// AUTO-GENERATED from data/maps/MossdeepCity_SpaceCenter_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=268, bytes=2053, labels=41, unknownOps=2, unresolvedSymbols=66

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MossdeepCity_SpaceCenter_2F_MapScripts": 0,
  "MossdeepCity_SpaceCenter_2F_OnTransition": 10,
  "MossdeepCity_SpaceCenter_2F_EventScript_MoveCivilians": 31,
  "MossdeepCity_SpaceCenter_2F_EventScript_MoveDefeatedGrunts": 68,
  "MossdeepCity_SpaceCenter_2F_OnFrame": 90,
  "MossdeepCity_SpaceCenter_2F_EventScript_ThreeMagmaGrunts": 98,
  "MossdeepCity_SpaceCenter_2F_Movement_PlayerExit": 226,
  "MossdeepCity_SpaceCenter_2F_EventScript_BattleThreeMagmaGrunts": 228,
  "MossdeepCity_SpaceCenter_2F_Movement_Grunt6Defeated": 801,
  "MossdeepCity_SpaceCenter_2F_Movement_Grunt5Defeated": 805,
  "MossdeepCity_SpaceCenter_2F_Movement_Grunt7Defeated": 809,
  "MossdeepCity_SpaceCenter_2F_EventScript_Scientist": 813,
  "MossdeepCity_SpaceCenter_2F_EventScript_ScientistNormal": 850,
  "MossdeepCity_SpaceCenter_2F_EventScript_ScientistMagma": 860,
  "MossdeepCity_SpaceCenter_2F_EventScript_Gentleman": 870,
  "MossdeepCity_SpaceCenter_2F_EventScript_GentlemanNormal": 907,
  "MossdeepCity_SpaceCenter_2F_EventScript_GentlemanMagma": 917,
  "MossdeepCity_SpaceCenter_2F_EventScript_RichBoy": 927,
  "MossdeepCity_SpaceCenter_2F_EventScript_RichBoyNormal": 964,
  "MossdeepCity_SpaceCenter_2F_EventScript_RichBoyMagma": 974,
  "MossdeepCity_SpaceCenter_2F_EventScript_Grunt6": 984,
  "MossdeepCity_SpaceCenter_2F_EventScript_Grunt7": 993,
  "MossdeepCity_SpaceCenter_2F_EventScript_Grunt5": 1002,
  "MossdeepCity_SpaceCenter_2F_EventScript_Tabitha": 1011,
  "MossdeepCity_SpaceCenter_2F_EventScript_Maxie": 1047,
  "MossdeepCity_SpaceCenter_2F_EventScript_Steven": 1058,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFightMovementSouth": 1144,
  "MossdeepCity_SpaceCenter_2F_Movement_StevenFight": 1170,
  "MossdeepCity_SpaceCenter_2F_Movement_StevenFightSouth": 1179,
  "MossdeepCity_SpaceCenter_2F_EventScript_ReadyForBattlePrompt": 1190,
  "MossdeepCity_SpaceCenter_2F_EventScript_ChoosePartyForMultiBattle": 1267,
  "MossdeepCity_SpaceCenter_2F_EventScript_DoStevenMultiBattle": 1320,
  "MossdeepCity_SpaceCenter_2F_EventScript_DefeatedMaxieTabitha": 1400,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFacePlayer": 1673,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFacePlayerSouth": 1719,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFacePlayerWest": 1724,
  "MossdeepCity_SpaceCenter_2F_EventScript_MaxieTrainer": 1729,
  "MossdeepCity_SpaceCenter_2F_EventScript_TabithaTrainer": 1868,
  "MossdeepCity_SpaceCenter_2F_EventScript_RivalRayquazaCall": 2007,
  "MossdeepCity_SpaceCenter_2F_EventScript_MayRayquazaCall": 2035,
  "MossdeepCity_SpaceCenter_2F_EventScript_BrendanRayquazaCall": 2044,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,90,0,0,0,35,93,64,2,0,34,93,64,2,0,35,159,64,2,0,34,159,64,2,0,90,43,205,0,100,0,0,5,0,3,0,102,0,0,10,100,0,0,3,0,2,0,102,0,0,10,100,0,0,1,0,3,0,102,0,0,10,15,100,0,0,11,0,2,0,100,0,0,15,0,2,0,100,0,0,13,0,4,0,15,159,64,1,0,98,0,0,0,9,21,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,80,255,0,226,0,0,0,81,255,0,226,0,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,13,255,255,255,255,255,13,0,1,0,13,1,0,0,0,0,108,90,9,254,16,0,0,0,0,0,10,0,93,3,76,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,37,3,0,0,81,0,0,37,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,77,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,33,3,0,0,81,0,0,33,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,78,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,41,3,0,0,81,0,0,41,3,0,0,0,0,82,0,0,83,0,0,0,0,113,159,2,0,101,0,0,101,0,0,101,0,0,108,90,64,10,65,254,64,8,65,254,64,11,65,254,107,91,44,0,0,7,1,82,3,0,0,35,93,64,2,0,34,93,64,2,0,35,93,64,2,0,34,93,64,2,0,89,92,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,0,0,7,1,139,3,0,0,35,93,64,2,0,34,93,64,2,0,35,93,64,2,0,34,93,64,2,0,89,149,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,0,0,7,1,196,3,0,0,35,93,64,2,0,34,93,64,2,0,35,93,64,2,0,34,93,64,2,0,89,206,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,16,0,0,0,0,0,10,0,108,90,106,44,205,0,7,1,166,4,0,0,42,205,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,105,4,30,9,12,0,26,0,128,12,128,35,0,128,1,0,34,0,128,1,0,35,120,4,0,0,34,120,4,0,0,80,0,0,146,4,0,0,81,0,0,146,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,80,0,0,155,4,0,0,81,0,0,155,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,64,22,22,65,20,20,4,4,254,2,64,24,24,65,20,20,6,6,0,254,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,108,90,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,152,1,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,89,166,4,0,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,8,0,113,5,0,0,38,0,0,0,113,4,6,0,38,0,0,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,120,5,0,0,34,120,5,0,0,152,1,38,0,0,0,16,0,0,0,0,0,10,0,105,4,20,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,60,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,20,16,0,0,0,0,0,10,0,105,113,93,3,0,54,152,1,113,159,3,0,42,244,2,42,94,3,42,55,3,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,88,0,0,5,0,6,0,92,0,0,1,88,0,0,11,0,8,0,92,0,0,2,88,0,0,6,0,2,0,92,0,0,2,88,137,6,0,0,152,0,16,0,0,0,0,0,10,0,105,152,1,42,117,0,42,199,3,84,0,0,85,0,0,0,0,42,225,2,43,199,3,113,198,1,0,42,20,3,84,0,0,85,0,0,0,0,100,0,0,5,0,6,0,102,0,0,2,86,0,0,87,0,0,0,0,152,0,108,90,26,0,128,12,128,35,0,128,1,0,34,0,128,1,0,35,183,6,0,0,34,183,6,0,0,35,0,128,3,0,34,0,128,3,0,35,188,6,0,0,34,188,6,0,0,15,92,0,0,2,15,92,0,0,4,15,93,10,222,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,93,11,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,106,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,105,43,117,0,108,90,224,0,0,0,0,0,0,0,15,224,0,0,0,0,0,0,0,15] as const;

export const STATS = { ops: 268, bytes: 2053, labels: 41, unknownOps: 2, unresolvedSymbols: 66 } as const;
