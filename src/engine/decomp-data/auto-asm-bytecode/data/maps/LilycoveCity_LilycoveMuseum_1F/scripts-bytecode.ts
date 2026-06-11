// AUTO-GENERATED from data/maps/LilycoveCity_LilycoveMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=97, bytes=638, labels=31, unknownOps=0, unresolvedSymbols=43

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_LilycoveMuseum_1F_MapScripts": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Greeter": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Curator": 9,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotYet": 82,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SawPaintings": 91,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotInterested": 144,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_InterestedInPaintings": 154,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorNorth": 296,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorWest": 346,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorEast": 396,
  "LilycoveCity_LilycoveMuseum_1F_Movement_CuratorEnterStairs": 446,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorWest": 448,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorEast": 451,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorNorth": 454,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_OldPainting": 457,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FantasyPainting": 466,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_WomanPainting": 475,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_LegendaryPokemonPainting": 484,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_GrassPokemonPainting": 493,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_BerryPainting": 502,
  "LilycoveCity_LilycoveMuseum_EventScript_BirdSculpture": 511,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PokeBallSculpture": 520,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet": 529,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SchoolKidM": 538,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist1": 547,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NinjaBoy": 556,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman1": 565,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman2": 574,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PsychicM": 583,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist2": 592,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FatMan": 629,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,3,3,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,104,0,0,0,0,103,112,20,8,0,1,35,0,0,0,0,34,0,0,0,0,7,1,91,0,0,0,7,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,82,0,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,144,0,0,0,7,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,154,0,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,3,108,3,16,0,0,0,0,0,10,3,80,0,0,190,1,0,0,81,0,0,190,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,40,1,0,0,34,40,1,0,0,7,1,0,0,0,0,7,1,40,1,0,0,35,0,0,0,0,34,0,0,0,0,35,90,1,0,0,34,90,1,0,0,7,1,0,0,0,0,7,1,90,1,0,0,35,0,0,0,0,34,0,0,0,0,35,140,1,0,0,34,140,1,0,0,7,1,0,0,0,0,7,1,140,1,0,0,3,106,80,0,0,198,1,0,0,81,0,0,198,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,0,255,255,255,255,11,255,255,255,255,0,11,0,8,0,11,8,0,0,0,0,3,106,80,0,0,192,1,0,0,81,0,0,192,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,0,255,255,255,255,11,255,255,255,255,0,11,0,8,0,11,8,0,0,0,0,3,106,80,0,0,195,1,0,0,81,0,0,195,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,0,255,255,255,255,11,255,255,255,255,0,11,0,8,0,11,8,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,3,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,16,0,0,0,0,0,10,2,3] as const;

export const STATS = { ops: 97, bytes: 638, labels: 31, unknownOps: 0, unresolvedSymbols: 43 } as const;
