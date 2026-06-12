// AUTO-GENERATED from data/maps/SootopolisCity_Gym_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=126, bytes=1181, labels=26, unknownOps=0, unresolvedSymbols=28

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SootopolisCity_Gym_1F_MapScripts": 0,
  "SootopolisCity_Gym_1F_OnTransition": 20,
  "SootopolisCity_Gym_1F_OnResume": 26,
  "SootopolisCity_Gym_1F_OnLoad": 29,
  "SootopolisCity_Gym_1F_EventScript_CheckSetStairMetatiles": 39,
  "SootopolisCity_Gym_1F_EventScript_OpenFirstAndSecondStairs": 123,
  "SootopolisCity_Gym_1F_EventScript_OpenFirstStairs": 141,
  "SootopolisCity_Gym_1F_EventScript_StopCheckingStairs": 159,
  "SootopolisCity_Gym_1F_OnFrame": 160,
  "SootopolisCity_Gym_1F_EventScript_UnlockFirstStairs": 192,
  "SootopolisCity_Gym_1F_EventScript_UnlockSecondStairs": 213,
  "SootopolisCity_Gym_1F_EventScript_UnlockThirdStairs": 234,
  "SootopolisCity_Gym_1F_EventScript_FallThroughIce": 255,
  "SootopolisCity_Gym_1F_Movement_FallThroughIce": 294,
  "SootopolisCity_Gym_1F_EventScript_Juan": 296,
  "SootopolisCity_Gym_1F_EventScript_JuanDefeated": 766,
  "SootopolisCity_Gym_1F_EventScript_GiveWaterPulse": 848,
  "SootopolisCity_Gym_1F_EventScript_GiveWaterPulse2": 894,
  "SootopolisCity_Gym_1F_EventScript_GoGetFortreeBadge": 941,
  "SootopolisCity_Gym_1F_EventScript_JuanRematch": 951,
  "SootopolisCity_Gym_1F_EventScript_GymGuide": 1098,
  "SootopolisCity_Gym_1F_EventScript_GymGuidePostVictory": 1119,
  "SootopolisCity_Gym_1F_EventScript_LeftGymStatue": 1129,
  "SootopolisCity_Gym_1F_EventScript_RightGymStatue": 1145,
  "SootopolisCity_Gym_1F_EventScript_GymStatueCertified": 1161,
  "SootopolisCity_Gym_1F_EventScript_GymStatue": 1171,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,160,0,0,0,5,26,0,0,0,1,29,0,0,0,3,20,0,0,0,23,34,64,1,0,3,167,4,3,5,39,0,0,0,38,0,0,58,3,35,34,64,8,0,34,34,64,8,0,7,0,159,0,0,0,7,0,34,64,0,0,35,34,64,28,0,34,34,64,28,0,7,0,141,0,0,0,7,0,34,64,0,0,35,34,64,67,0,34,34,64,67,0,7,0,123,0,0,0,7,0,34,64,0,0,163,8,0,4,0,7,2,0,0,163,8,0,5,0,7,2,0,0,163,8,0,10,0,7,2,0,0,163,8,0,11,0,7,2,0,0,163,8,0,15,0,7,2,0,0,163,8,0,16,0,7,2,0,0,4,34,64,8,0,192,0,0,0,34,64,28,0,213,0,0,0,34,64,67,0,234,0,0,0,34,64,0,0,255,0,0,0,24,34,64,1,0,41,40,0,48,40,0,5,39,0,0,0,38,0,0,58,3,24,34,64,1,0,41,40,0,48,40,0,5,39,0,0,0,38,0,0,58,3,24,34,64,1,0,41,40,0,48,40,0,5,39,0,0,0,38,0,0,58,3,106,41,20,0,80,255,0,38,1,0,0,81,255,0,38,1,0,0,0,0,82,0,0,83,0,0,0,0,48,43,0,41,60,0,61,0,0,58,3,84,254,93,0,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,2,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,1,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,13,128,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,183,3,0,0,7,1,13,128,0,0,44,172,0,7,0,126,3,0,0,44,0,0,7,0,173,3,0,0,16,0,0,0,0,0,10,4,109,3,104,0,0,0,0,103,5,0,0,0,0,16,0,0,0,0,0,10,4,42,247,4,42,0,0,42,86,3,42,205,3,42,48,3,23,94,64,6,0,43,71,3,23,8,128,8,0,5,0,0,0,0,5,80,3,0,0,105,41,30,0,50,204,1,16,0,0,0,0,0,10,4,51,105,41,30,0,42,217,1,109,3,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,172,0,4,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,42,172,0,109,3,16,0,0,0,0,0,10,4,109,3,93,7,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,6,3,107,91,44,247,4,7,1,95,4,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,106,44,0,0,7,1,137,4,0,0,6,147,4,0,0,3,106,44,0,0,7,1,137,4,0,0,6,147,4,0,0,3,16,0,0,0,0,0,10,4,108,3,16,0,0,0,0,0,10,4,108,3] as const;

export const STATS = { ops: 126, bytes: 1181, labels: 26, unknownOps: 0, unresolvedSymbols: 28 } as const;
