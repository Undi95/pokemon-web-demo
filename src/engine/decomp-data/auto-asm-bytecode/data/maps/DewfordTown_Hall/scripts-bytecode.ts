// AUTO-GENERATED from data/maps/DewfordTown_Hall/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=181, bytes=745, labels=37, unknownOps=8, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "DewfordTown_Hall_MapScripts": 0,
  "DewfordTown_Hall_EventScript_Girl": 0,
  "DewfordTown_Hall_EventScript_GirlBoredOfTrend": 31,
  "DewfordTown_Hall_EventScript_Woman": 41,
  "DewfordTown_Hall_EventScript_Man": 58,
  "DewfordTown_Hall_EventScript_ConfirmTrendLink": 98,
  "DewfordTown_Hall_EventScript_RejectTrendLink": 108,
  "DewfordTown_Hall_EventScript_ExpertM": 118,
  "DewfordTown_Hall_EventScript_Twin": 160,
  "DewfordTown_Hall_EventScript_LittleBoy": 202,
  "DewfordTown_Hall_EventScript_Bookshelf": 219,
  "DewfordTown_Hall_EventScript_Painting": 235,
  "DewfordTown_Hall_EventScript_ScreamTitle": 246,
  "DewfordTown_Hall_EventScript_SmileTitle": 256,
  "DewfordTown_Hall_EventScript_LastTitle": 266,
  "DewfordTown_Hall_EventScript_BirthTitle": 276,
  "DewfordTown_Hall_EventScript_SchoolKidM": 286,
  "DewfordTown_Hall_EventScript_PsychicM": 297,
  "DewfordTown_Hall_EventScript_DoTrendDebate": 308,
  "DewfordTown_Hall_EventScript_TrendDebate1": 318,
  "DewfordTown_Hall_EventScript_TrendDebate2": 346,
  "DewfordTown_Hall_EventScript_TrendDebate3": 374,
  "DewfordTown_Hall_EventScript_TrendDebate4": 402,
  "DewfordTown_Hall_EventScript_TrendDebate5": 430,
  "DewfordTown_Hall_EventScript_DontMovePlayer1": 458,
  "DewfordTown_Hall_EventScript_DebateReact1": 458,
  "DewfordTown_Hall_EventScript_PlayerReactWest": 503,
  "DewfordTown_Hall_EventScript_DontMovePlayer2": 537,
  "DewfordTown_Hall_EventScript_DebateReact2": 537,
  "DewfordTown_Hall_EventScript_PlayerReactNorthSouth": 582,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceUp": 602,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceDown": 626,
  "DewfordTown_Hall_EventScript_PlayerReactEast": 650,
  "DewfordTown_Hall_Movement_PsychicWalkInPlaceLeft": 684,
  "DewfordTown_Hall_Movement_SchoolKidWalkInPlaceRight": 684,
  "DewfordTown_Hall_EventScript_SludgeBombMan": 684,
  "DewfordTown_Hall_EventScript_ReceivedSludgeBomb": 735,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,88,0,0,0,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,107,91,88,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,106,88,0,0,0,0,16,0,0,0,0,0,10,0,108,90,106,88,0,0,0,0,38,0,0,0,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,106,113,8,0,0,89,52,1,0,0,90,106,113,8,1,0,89,52,1,0,0,90,88,0,0,0,0,38,0,0,0,90,88,202,1,0,0,16,0,0,0,0,0,10,0,88,25,2,0,0,16,0,0,0,0,0,10,0,108,90,88,202,1,0,0,16,0,0,0,0,0,10,0,88,25,2,0,0,16,0,0,0,0,0,10,0,108,90,88,202,1,0,0,16,0,0,0,0,0,10,0,88,25,2,0,0,16,0,0,0,0,0,10,0,108,90,88,202,1,0,0,16,0,0,0,0,0,10,0,88,25,2,0,0,16,0,0,0,0,0,10,0,108,90,88,202,1,0,0,16,0,0,0,0,0,10,0,88,25,2,0,0,16,0,0,0,0,0,10,0,108,90,80,0,0,172,2,0,0,81,0,0,172,2,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,90,35,12,128,4,0,34,12,128,4,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,172,2,0,0,81,0,0,172,2,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,90,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,35,12,128,3,0,34,12,128,3,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,107,91,88,0,0,0,0,44,230,0,7,1,223,2,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,230,0,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 181, bytes: 745, labels: 37, unknownOps: 8, unresolvedSymbols: 47 } as const;
