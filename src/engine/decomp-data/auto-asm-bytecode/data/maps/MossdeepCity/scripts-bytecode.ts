// AUTO-GENERATED from data/maps/MossdeepCity/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=236, bytes=837, labels=34, unknownOps=0, unresolvedSymbols=31

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "MossdeepCity_MapScripts": 0,
  "MossdeepCity_OnTransition": 5,
  "MossdeepCity_EventScript_PokefanF": 27,
  "MossdeepCity_EventScript_PokefanFMagmaGone": 48,
  "MossdeepCity_EventScript_Sailor": 58,
  "MossdeepCity_EventScript_SailorMagmaGone": 79,
  "MossdeepCity_EventScript_NinjaBoy": 89,
  "MossdeepCity_EventScript_ExpertM": 98,
  "MossdeepCity_EventScript_Girl": 107,
  "MossdeepCity_EventScript_Woman": 116,
  "MossdeepCity_EventScript_WhiteRock": 125,
  "MossdeepCity_EventScript_GymSign": 134,
  "MossdeepCity_EventScript_CitySign": 143,
  "MossdeepCity_EventScript_SpaceCenterSign": 152,
  "MossdeepCity_EventScript_VisitedMossdeep": 161,
  "MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter": 170,
  "MossdeepCity_Movement_MaxieGestureToSpaceCenter": 408,
  "MossdeepCity_Movement_GruntFaceSpaceCenter": 418,
  "MossdeepCity_Movement_MaxieEnterSpaceCenter": 423,
  "MossdeepCity_Movement_Grunt1EnterSpaceCenter": 437,
  "MossdeepCity_Movement_Grunt2EnterSpaceCenter": 456,
  "MossdeepCity_Movement_Grunt3EnterSpaceCenter": 474,
  "MossdeepCity_Movement_Grunt4EnterSpaceCenter": 491,
  "MossdeepCity_EventScript_Man": 507,
  "MossdeepCity_EventScript_KingsRockBoy": 543,
  "MossdeepCity_EventScript_ReceivedKingsRock": 631,
  "MossdeepCity_EventScript_DeclineKingsRock": 641,
  "MossdeepCity_EventScript_BlackBelt": 651,
  "MossdeepCity_EventScript_Scott": 660,
  "MossdeepCity_EventScript_ScottExitNorth": 730,
  "MossdeepCity_EventScript_ScottExitEast": 771,
  "MossdeepCity_Movement_PlayerWatchScottExit": 812,
  "MossdeepCity_Movement_ScottExitNorth": 816,
  "MossdeepCity_Movement_ScottExitEast": 826,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,43,100,0,43,101,0,43,102,0,43,103,0,44,0,0,8,1,0,0,0,0,3,107,91,44,123,0,7,1,48,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,123,0,7,1,79,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,42,0,0,23,0,0,1,0,3,106,80,0,0,152,1,0,0,81,0,0,152,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,162,1,0,0,81,0,0,162,1,0,0,0,0,80,0,0,162,1,0,0,81,0,0,162,1,0,0,0,0,80,0,0,162,1,0,0,81,0,0,162,1,0,0,0,0,80,0,0,162,1,0,0,81,0,0,162,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,167,1,0,0,81,0,0,167,1,0,0,0,0,80,0,0,181,1,0,0,81,0,0,181,1,0,0,0,0,80,0,0,200,1,0,0,81,0,0,200,1,0,0,0,0,80,0,0,218,1,0,0,81,0,0,218,1,0,0,0,0,80,0,0,235,1,0,0,81,0,0,235,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,41,30,0,23,93,64,2,0,42,55,3,108,3,20,3,20,20,20,20,2,20,20,254,3,20,20,20,254,8,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,8,8,8,11,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,8,8,11,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,8,11,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,11,11,11,8,8,8,11,11,11,11,11,11,11,254,107,91,16,0,0,0,0,0,10,4,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,107,91,44,20,1,7,1,119,2,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,129,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,27,0,128,187,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,20,1,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,107,91,16,0,0,0,0,0,10,4,105,35,12,128,2,0,34,12,128,2,0,8,1,218,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,3,3,0,0,8,1,12,128,0,0,24,209,64,1,0,84,0,0,85,0,0,0,0,109,3,80,255,0,44,3,0,0,81,255,0,44,3,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,44,3,0,0,81,255,0,44,3,0,0,0,0,80,0,0,58,3,0,0,81,0,0,58,3,0,0,0,0,82,0,0,83,0,0,0,0,4,20,20,39,254,10,10,10,10,10,10,10,10,10,254,8,10,10,10,10,10,10,10,10,10,254] as const;

export const STATS = { ops: 236, bytes: 837, labels: 34, unknownOps: 0, unresolvedSymbols: 31 } as const;
