// AUTO-GENERATED from data/maps/LilycoveCity_LilycoveMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=97, bytes=556, labels=31, unknownOps=2, unresolvedSymbols=40

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_LilycoveMuseum_1F_MapScripts": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Greeter": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Curator": 9,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotYet": 60,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SawPaintings": 69,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotInterested": 98,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_InterestedInPaintings": 108,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorNorth": 214,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorWest": 264,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorEast": 314,
  "LilycoveCity_LilycoveMuseum_1F_Movement_CuratorEnterStairs": 364,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorWest": 366,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorEast": 369,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorNorth": 372,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_OldPainting": 375,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FantasyPainting": 384,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_WomanPainting": 393,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_LegendaryPokemonPainting": 402,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_GrassPokemonPainting": 411,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_BerryPainting": 420,
  "LilycoveCity_LilycoveMuseum_EventScript_BirdSculpture": 429,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PokeBallSculpture": 438,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet": 447,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SchoolKidM": 456,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist1": 465,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NinjaBoy": 474,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman1": 483,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman2": 492,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PsychicM": 501,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist2": 510,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FatMan": 547,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,0,90,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,112,20,8,16,1,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,80,0,0,108,1,0,0,81,0,0,108,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,26,0,128,12,128,35,0,128,2,0,34,0,128,2,0,35,214,0,0,0,34,214,0,0,0,35,0,128,3,0,34,0,128,3,0,35,8,1,0,0,34,8,1,0,0,35,0,128,4,0,34,0,128,4,0,35,58,1,0,0,34,58,1,0,0,90,106,80,255,0,116,1,0,0,81,255,0,116,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,106,80,255,0,110,1,0,0,81,255,0,110,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,106,80,255,0,113,1,0,0,81,255,0,113,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,9,254,10,9,254,11,9,254,9,9,254,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 97, bytes: 556, labels: 31, unknownOps: 2, unresolvedSymbols: 40 } as const;
