// AUTO-GENERATED from data/maps/LilycoveCity_LilycoveMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=97, bytes=640, labels=31, unknownOps=0, unresolvedSymbols=34

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_LilycoveMuseum_1F_MapScripts": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Greeter": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Curator": 9,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotYet": 84,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SawPaintings": 93,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotInterested": 146,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_InterestedInPaintings": 156,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorNorth": 298,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorWest": 348,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorEast": 398,
  "LilycoveCity_LilycoveMuseum_1F_Movement_CuratorEnterStairs": 448,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorWest": 450,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorEast": 453,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorNorth": 456,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_OldPainting": 459,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FantasyPainting": 468,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_WomanPainting": 477,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_LegendaryPokemonPainting": 486,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_GrassPokemonPainting": 495,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_BerryPainting": 504,
  "LilycoveCity_LilycoveMuseum_EventScript_BirdSculpture": 513,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PokeBallSculpture": 522,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet": 531,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SchoolKidM": 540,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist1": 549,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NinjaBoy": 558,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman1": 567,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman2": 576,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PsychicM": 585,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist2": 594,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FatMan": 631,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,3,90,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,112,20,8,16,1,35,13,128,0,0,34,13,128,0,0,7,1,93,0,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,84,0,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,5,35,13,128,0,0,34,13,128,0,0,7,1,146,0,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,156,0,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,3,108,90,16,0,0,0,0,0,10,3,80,0,0,192,1,0,0,81,0,0,192,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,26,0,128,12,128,35,0,128,2,0,34,0,128,2,0,35,42,1,0,0,34,42,1,0,0,7,1,0,0,0,0,7,1,42,1,0,0,35,0,128,3,0,34,0,128,3,0,35,92,1,0,0,34,92,1,0,0,7,1,0,0,0,0,7,1,92,1,0,0,35,0,128,4,0,34,0,128,4,0,35,142,1,0,0,34,142,1,0,0,7,1,0,0,0,0,7,1,142,1,0,0,90,106,80,255,0,200,1,0,0,81,255,0,200,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,106,80,255,0,194,1,0,0,81,255,0,194,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,106,80,255,0,197,1,0,0,81,255,0,197,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,9,254,10,9,254,11,9,254,9,9,254,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,3,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,91,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,2,90] as const;

export const STATS = { ops: 97, bytes: 640, labels: 31, unknownOps: 0, unresolvedSymbols: 34 } as const;
