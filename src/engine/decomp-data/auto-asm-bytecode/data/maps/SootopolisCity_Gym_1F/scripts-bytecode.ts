// AUTO-GENERATED from data/maps/SootopolisCity_Gym_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=126, bytes=1095, labels=26, unknownOps=2, unresolvedSymbols=34

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SootopolisCity_Gym_1F_MapScripts": 0,
  "SootopolisCity_Gym_1F_OnTransition": 20,
  "SootopolisCity_Gym_1F_OnResume": 25,
  "SootopolisCity_Gym_1F_OnLoad": 28,
  "SootopolisCity_Gym_1F_EventScript_CheckSetStairMetatiles": 38,
  "SootopolisCity_Gym_1F_EventScript_OpenFirstAndSecondStairs": 86,
  "SootopolisCity_Gym_1F_EventScript_OpenFirstStairs": 104,
  "SootopolisCity_Gym_1F_EventScript_StopCheckingStairs": 122,
  "SootopolisCity_Gym_1F_OnFrame": 123,
  "SootopolisCity_Gym_1F_EventScript_UnlockFirstStairs": 155,
  "SootopolisCity_Gym_1F_EventScript_UnlockSecondStairs": 173,
  "SootopolisCity_Gym_1F_EventScript_UnlockThirdStairs": 191,
  "SootopolisCity_Gym_1F_EventScript_FallThroughIce": 209,
  "SootopolisCity_Gym_1F_Movement_FallThroughIce": 246,
  "SootopolisCity_Gym_1F_EventScript_Juan": 248,
  "SootopolisCity_Gym_1F_EventScript_JuanDefeated": 706,
  "SootopolisCity_Gym_1F_EventScript_GiveWaterPulse": 786,
  "SootopolisCity_Gym_1F_EventScript_GiveWaterPulse2": 820,
  "SootopolisCity_Gym_1F_EventScript_GoGetFortreeBadge": 855,
  "SootopolisCity_Gym_1F_EventScript_JuanRematch": 865,
  "SootopolisCity_Gym_1F_EventScript_GymGuide": 1012,
  "SootopolisCity_Gym_1F_EventScript_GymGuidePostVictory": 1033,
  "SootopolisCity_Gym_1F_EventScript_LeftGymStatue": 1043,
  "SootopolisCity_Gym_1F_EventScript_RightGymStatue": 1059,
  "SootopolisCity_Gym_1F_EventScript_GymStatueCertified": 1075,
  "SootopolisCity_Gym_1F_EventScript_GymStatue": 1085,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,123,0,0,0,5,25,0,0,0,1,28,0,0,0,3,20,0,0,0,113,34,1,0,90,167,4,90,88,38,0,0,0,38,0,0,0,90,35,34,64,8,0,34,34,64,8,0,35,34,64,28,0,34,34,64,28,0,35,34,64,67,0,34,34,64,67,0,163,8,0,4,0,7,2,0,0,163,8,0,5,0,7,2,0,0,163,8,0,10,0,7,2,0,0,163,8,0,11,0,7,2,0,0,163,8,0,15,0,7,2,0,0,163,8,0,16,0,7,2,0,0,15,34,64,8,0,155,0,0,0,34,64,28,0,173,0,0,0,34,64,67,0,191,0,0,0,34,64,0,0,209,0,0,0,115,34,1,4,40,9,40,0,88,38,0,0,0,38,0,0,0,90,115,34,1,4,40,9,40,0,88,38,0,0,0,38,0,0,0,90,115,34,1,4,40,9,40,0,88,38,0,0,0,38,0,0,0,90,106,4,20,80,255,0,246,0,0,0,81,255,0,246,0,0,0,0,0,82,0,0,83,0,0,0,0,9,43,0,4,60,61,0,0,0,90,84,254,93,0,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,2,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,1,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,194,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,13,128,0,0,0,35,13,128,1,0,34,13,128,1,0,44,172,0,7,0,52,3,0,0,44,0,0,7,0,87,3,0,0,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,0,0,0,88,0,0,0,0,16,0,0,0,0,0,10,0,42,247,4,42,0,0,42,86,3,42,205,3,42,48,3,113,94,6,0,43,71,3,113,8,8,0,88,0,0,0,0,88,18,3,0,0,105,4,30,50,204,1,16,0,0,0,0,0,10,0,51,105,4,30,42,217,1,109,90,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,172,0,15,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,42,172,0,109,90,16,0,0,0,0,0,10,0,109,90,93,7,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,90,107,91,44,247,4,7,1,9,4,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,106,44,0,0,7,1,51,4,0,0,89,61,4,0,0,90,106,44,0,0,7,1,51,4,0,0,89,61,4,0,0,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90] as const;

export const STATS = { ops: 126, bytes: 1095, labels: 26, unknownOps: 2, unresolvedSymbols: 34 } as const;
