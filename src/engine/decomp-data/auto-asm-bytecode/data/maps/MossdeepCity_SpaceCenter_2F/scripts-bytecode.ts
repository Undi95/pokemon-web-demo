// AUTO-GENERATED from data/maps/MossdeepCity_SpaceCenter_2F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=268, bytes=1917, labels=41, unknownOps=19, unresolvedSymbols=66

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MossdeepCity_SpaceCenter_2F_MapScripts": 0,
  "MossdeepCity_SpaceCenter_2F_OnTransition": 10,
  "MossdeepCity_SpaceCenter_2F_EventScript_MoveCivilians": 31,
  "MossdeepCity_SpaceCenter_2F_EventScript_MoveDefeatedGrunts": 67,
  "MossdeepCity_SpaceCenter_2F_OnFrame": 88,
  "MossdeepCity_SpaceCenter_2F_EventScript_ThreeMagmaGrunts": 96,
  "MossdeepCity_SpaceCenter_2F_Movement_PlayerExit": 224,
  "MossdeepCity_SpaceCenter_2F_EventScript_BattleThreeMagmaGrunts": 224,
  "MossdeepCity_SpaceCenter_2F_Movement_Grunt6Defeated": 797,
  "MossdeepCity_SpaceCenter_2F_Movement_Grunt5Defeated": 797,
  "MossdeepCity_SpaceCenter_2F_Movement_Grunt7Defeated": 797,
  "MossdeepCity_SpaceCenter_2F_EventScript_Scientist": 797,
  "MossdeepCity_SpaceCenter_2F_EventScript_ScientistNormal": 834,
  "MossdeepCity_SpaceCenter_2F_EventScript_ScientistMagma": 844,
  "MossdeepCity_SpaceCenter_2F_EventScript_Gentleman": 854,
  "MossdeepCity_SpaceCenter_2F_EventScript_GentlemanNormal": 891,
  "MossdeepCity_SpaceCenter_2F_EventScript_GentlemanMagma": 901,
  "MossdeepCity_SpaceCenter_2F_EventScript_RichBoy": 911,
  "MossdeepCity_SpaceCenter_2F_EventScript_RichBoyNormal": 948,
  "MossdeepCity_SpaceCenter_2F_EventScript_RichBoyMagma": 958,
  "MossdeepCity_SpaceCenter_2F_EventScript_Grunt6": 968,
  "MossdeepCity_SpaceCenter_2F_EventScript_Grunt7": 977,
  "MossdeepCity_SpaceCenter_2F_EventScript_Grunt5": 986,
  "MossdeepCity_SpaceCenter_2F_EventScript_Tabitha": 995,
  "MossdeepCity_SpaceCenter_2F_EventScript_Maxie": 1031,
  "MossdeepCity_SpaceCenter_2F_EventScript_Steven": 1042,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFightMovementSouth": 1103,
  "MossdeepCity_SpaceCenter_2F_Movement_StevenFight": 1129,
  "MossdeepCity_SpaceCenter_2F_Movement_StevenFightSouth": 1129,
  "MossdeepCity_SpaceCenter_2F_EventScript_ReadyForBattlePrompt": 1129,
  "MossdeepCity_SpaceCenter_2F_EventScript_ChoosePartyForMultiBattle": 1206,
  "MossdeepCity_SpaceCenter_2F_EventScript_DoStevenMultiBattle": 1259,
  "MossdeepCity_SpaceCenter_2F_EventScript_DefeatedMaxieTabitha": 1314,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFacePlayer": 1587,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFacePlayerSouth": 1587,
  "MossdeepCity_SpaceCenter_2F_EventScript_StevenFacePlayerWest": 1591,
  "MossdeepCity_SpaceCenter_2F_EventScript_MaxieTrainer": 1595,
  "MossdeepCity_SpaceCenter_2F_EventScript_TabithaTrainer": 1734,
  "MossdeepCity_SpaceCenter_2F_EventScript_RivalRayquazaCall": 1873,
  "MossdeepCity_SpaceCenter_2F_EventScript_MayRayquazaCall": 1901,
  "MossdeepCity_SpaceCenter_2F_EventScript_BrendanRayquazaCall": 1909,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,2,88,0,0,0,35,93,64,2,0,34,93,64,2,0,35,159,64,2,0,34,159,64,2,0,90,43,205,0,100,0,0,5,0,3,0,102,0,0,10,100,0,0,3,0,2,0,102,0,0,10,100,0,0,1,0,3,0,102,0,0,10,100,0,0,11,0,2,0,100,0,0,15,0,2,0,100,0,0,13,0,4,0,159,64,1,0,96,0,0,0,9,21,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,80,255,0,224,0,0,0,81,255,0,224,0,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,13,255,255,255,255,255,13,0,1,0,13,1,0,0,0,0,108,90,16,0,0,0,0,0,10,0,93,3,76,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,29,3,0,0,81,0,0,29,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,77,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,29,3,0,0,81,0,0,29,3,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,93,3,78,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,29,3,0,0,81,0,0,29,3,0,0,0,0,82,0,0,83,0,0,0,0,113,159,2,0,101,0,0,101,0,0,101,0,0,108,90,107,91,44,0,0,7,1,66,3,0,0,35,93,64,2,0,34,93,64,2,0,35,93,64,2,0,34,93,64,2,0,89,76,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,0,0,7,1,123,3,0,0,35,93,64,2,0,34,93,64,2,0,35,93,64,2,0,34,93,64,2,0,89,133,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,0,0,7,1,180,3,0,0,35,93,64,2,0,34,93,64,2,0,35,93,64,2,0,34,93,64,2,0,89,190,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,16,0,0,0,0,0,10,0,108,90,106,44,205,0,7,1,105,4,0,0,42,205,0,16,0,0,0,0,0,10,0,16,0,0,0,0,0,10,0,105,4,30,9,12,0,80,0,0,105,4,0,0,81,0,0,105,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,80,0,0,105,4,0,0,81,0,0,105,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,108,90,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,38,0,0,0,152,1,38,0,0,0,35,13,128,0,0,34,13,128,0,0,38,0,0,0,89,105,4,0,0,38,0,0,0,113,4,2,0,113,5,4,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,8,0,113,5,0,0,38,0,0,0,113,4,6,0,38,0,0,0,38,0,0,0,152,1,38,0,0,0,16,0,0,0,0,0,10,0,105,4,20,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,60,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,20,16,0,0,0,0,0,10,0,105,113,93,3,0,54,152,1,113,159,3,0,42,244,2,42,94,3,42,55,3,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,88,0,0,5,0,6,0,92,0,0,1,88,0,0,11,0,8,0,92,0,0,2,88,0,0,6,0,2,0,92,0,0,2,88,51,6,0,0,152,0,16,0,0,0,0,0,10,0,105,152,1,42,117,0,42,199,3,84,0,0,85,0,0,0,0,42,225,2,43,199,3,113,198,1,0,42,20,3,84,0,0,85,0,0,0,0,100,0,0,5,0,6,0,102,0,0,2,86,0,0,87,0,0,0,0,152,0,108,90,92,0,0,2,92,0,0,4,93,10,222,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,93,11,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,106,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,105,43,117,0,108,90,224,0,0,0,0,0,0,0,224,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 268, bytes: 1917, labels: 41, unknownOps: 19, unresolvedSymbols: 66 } as const;
