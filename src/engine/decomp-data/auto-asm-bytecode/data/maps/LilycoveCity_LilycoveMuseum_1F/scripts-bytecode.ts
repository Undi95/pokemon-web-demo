// AUTO-GENERATED from data/maps/LilycoveCity_LilycoveMuseum_1F/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=97, bytes=480, labels=31, unknownOps=8, unresolvedSymbols=40

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "LilycoveCity_LilycoveMuseum_1F_MapScripts": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Greeter": 0,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Curator": 9,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotYet": 60,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SawPaintings": 69,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NotInterested": 98,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_InterestedInPaintings": 108,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorNorth": 149,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorWest": 199,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FollowCuratorEast": 249,
  "LilycoveCity_LilycoveMuseum_1F_Movement_CuratorEnterStairs": 299,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorWest": 299,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorEast": 299,
  "LilycoveCity_LilycoveMuseum_1F_Movement_FollowCuratorNorth": 299,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_OldPainting": 299,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FantasyPainting": 308,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_WomanPainting": 317,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_LegendaryPokemonPainting": 326,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_GrassPokemonPainting": 335,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_BerryPainting": 344,
  "LilycoveCity_LilycoveMuseum_EventScript_BirdSculpture": 353,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PokeBallSculpture": 362,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_StoneTablet": 371,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_SchoolKidM": 380,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist1": 389,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_NinjaBoy": 398,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman1": 407,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Woman2": 416,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_PsychicM": 425,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_Artist2": 434,
  "LilycoveCity_LilycoveMuseum_1F_EventScript_FatMan": 471,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [16,0,0,0,0,0,10,0,90,106,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,112,20,8,16,1,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,80,0,0,43,1,0,0,81,0,0,43,1,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,90,106,80,255,0,43,1,0,0,81,255,0,43,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,106,80,255,0,43,1,0,0,81,255,0,43,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,106,80,255,0,43,1,0,0,81,255,0,43,1,0,0,0,0,82,0,0,83,0,0,0,0,58,0,0,255,255,255,255,255,11,255,255,255,255,255,11,0,8,0,11,8,0,0,0,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 97, bytes: 480, labels: 31, unknownOps: 8, unresolvedSymbols: 40 } as const;
