// AUTO-GENERATED from data/maps/MossdeepCity/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=236, bytes=832, labels=34, unknownOps=0, unresolvedSymbols=33

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
  "MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter": 169,
  "MossdeepCity_Movement_MaxieGestureToSpaceCenter": 405,
  "MossdeepCity_Movement_GruntFaceSpaceCenter": 415,
  "MossdeepCity_Movement_MaxieEnterSpaceCenter": 420,
  "MossdeepCity_Movement_Grunt1EnterSpaceCenter": 434,
  "MossdeepCity_Movement_Grunt2EnterSpaceCenter": 453,
  "MossdeepCity_Movement_Grunt3EnterSpaceCenter": 471,
  "MossdeepCity_Movement_Grunt4EnterSpaceCenter": 488,
  "MossdeepCity_EventScript_Man": 504,
  "MossdeepCity_EventScript_KingsRockBoy": 540,
  "MossdeepCity_EventScript_ReceivedKingsRock": 628,
  "MossdeepCity_EventScript_DeclineKingsRock": 638,
  "MossdeepCity_EventScript_BlackBelt": 648,
  "MossdeepCity_EventScript_Scott": 657,
  "MossdeepCity_EventScript_ScottExitNorth": 725,
  "MossdeepCity_EventScript_ScottExitEast": 766,
  "MossdeepCity_Movement_PlayerWatchScottExit": 807,
  "MossdeepCity_Movement_ScottExitNorth": 811,
  "MossdeepCity_Movement_ScottExitEast": 821,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,5,0,0,0,43,100,0,43,101,0,43,102,0,43,103,0,44,0,0,8,1,0,0,0,0,90,107,91,44,123,0,7,1,48,0,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,107,91,44,123,0,7,1,79,0,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,42,0,0,113,0,1,0,90,106,80,0,0,149,1,0,0,81,0,0,149,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,159,1,0,0,81,0,0,159,1,0,0,0,0,80,0,0,159,1,0,0,81,0,0,159,1,0,0,0,0,80,0,0,159,1,0,0,81,0,0,159,1,0,0,0,0,80,0,0,159,1,0,0,81,0,0,159,1,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,164,1,0,0,81,0,0,164,1,0,0,0,0,80,0,0,178,1,0,0,81,0,0,178,1,0,0,0,0,80,0,0,197,1,0,0,81,0,0,197,1,0,0,0,0,80,0,0,215,1,0,0,81,0,0,215,1,0,0,0,0,80,0,0,232,1,0,0,81,0,0,232,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,4,30,113,93,2,0,42,55,3,108,90,20,3,20,20,20,20,2,20,20,254,3,20,20,20,254,8,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,8,8,8,11,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,8,8,11,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,8,11,11,11,8,8,8,11,11,11,11,11,11,11,254,20,19,11,11,11,8,8,8,11,11,11,11,11,11,11,254,107,91,16,0,0,0,0,0,10,4,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,44,20,1,7,1,116,2,0,0,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,126,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,27,0,128,187,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,20,1,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,2,90,107,91,16,0,0,0,0,0,10,4,105,35,12,128,2,0,34,12,128,2,0,8,1,213,2,0,0,8,1,12,128,0,0,35,12,128,4,0,34,12,128,4,0,8,1,254,2,0,0,8,1,12,128,0,0,115,209,1,84,0,0,85,0,0,0,0,109,90,80,255,0,39,3,0,0,81,255,0,39,3,0,0,0,0,80,0,0,43,3,0,0,81,0,0,43,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,39,3,0,0,81,255,0,39,3,0,0,0,0,80,0,0,53,3,0,0,81,0,0,53,3,0,0,0,0,82,0,0,83,0,0,0,0,15,20,20,39,254,10,10,10,10,10,10,10,10,10,254,8,10,10,10,10,10,10,10,10,10,254] as const;

export const STATS = { ops: 236, bytes: 832, labels: 34, unknownOps: 0, unresolvedSymbols: 33 } as const;
