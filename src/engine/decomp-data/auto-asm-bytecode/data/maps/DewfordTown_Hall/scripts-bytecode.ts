// AUTO-GENERATED from data/maps/DewfordTown_Hall/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=181, bytes=1086, labels=37, unknownOps=2, unresolvedSymbols=48

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
  "DewfordTown_Hall_EventScript_ScreamTitle": 411,
  "DewfordTown_Hall_EventScript_SmileTitle": 421,
  "DewfordTown_Hall_EventScript_LastTitle": 431,
  "DewfordTown_Hall_EventScript_BirthTitle": 441,
  "DewfordTown_Hall_EventScript_SchoolKidM": 451,
  "DewfordTown_Hall_EventScript_PsychicM": 462,
  "DewfordTown_Hall_EventScript_DoTrendDebate": 473,
  "DewfordTown_Hall_EventScript_TrendDebate1": 648,
  "DewfordTown_Hall_EventScript_TrendDebate2": 676,
  "DewfordTown_Hall_EventScript_TrendDebate3": 704,
  "DewfordTown_Hall_EventScript_TrendDebate4": 732,
  "DewfordTown_Hall_EventScript_TrendDebate5": 760,
  "DewfordTown_Hall_EventScript_DontMovePlayer1": 788,
  "DewfordTown_Hall_EventScript_DebateReact1": 789,
  "DewfordTown_Hall_EventScript_PlayerReactWest": 834,
  "DewfordTown_Hall_EventScript_DontMovePlayer2": 869,
  "DewfordTown_Hall_EventScript_DebateReact2": 870,
  "DewfordTown_Hall_EventScript_PlayerReactNorthSouth": 915,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceUp": 936,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceDown": 961,
  "DewfordTown_Hall_EventScript_PlayerReactEast": 986,
  "DewfordTown_Hall_Movement_PsychicWalkInPlaceLeft": 1021,
  "DewfordTown_Hall_Movement_SchoolKidWalkInPlaceRight": 1023,
  "DewfordTown_Hall_EventScript_SludgeBombMan": 1025,
  "DewfordTown_Hall_EventScript_ReceivedSludgeBomb": 1076,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,88,0,0,0,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,107,91,88,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,35,13,128,0,0,34,13,128,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,0,109,90,106,88,0,0,0,0,16,0,0,0,0,0,10,0,108,90,106,88,0,0,0,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,155,1,0,0,34,155,1,0,0,35,0,128,4,0,34,0,128,4,0,35,155,1,0,0,34,155,1,0,0,35,0,128,1,0,34,0,128,1,0,35,165,1,0,0,34,165,1,0,0,35,0,128,5,0,34,0,128,5,0,35,155,1,0,0,34,155,1,0,0,35,0,128,2,0,34,0,128,2,0,35,175,1,0,0,34,175,1,0,0,35,0,128,6,0,34,0,128,6,0,35,175,1,0,0,34,175,1,0,0,35,0,128,3,0,34,0,128,3,0,35,185,1,0,0,34,185,1,0,0,35,0,128,7,0,34,0,128,7,0,35,175,1,0,0,34,175,1,0,0,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,16,0,0,0,0,0,10,0,108,90,106,113,8,0,0,89,217,1,0,0,90,106,113,8,1,0,89,217,1,0,0,90,88,0,0,0,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,136,2,0,0,34,136,2,0,0,35,0,128,1,0,34,0,128,1,0,35,136,2,0,0,34,136,2,0,0,35,0,128,2,0,34,0,128,2,0,35,164,2,0,0,34,164,2,0,0,35,0,128,3,0,34,0,128,3,0,35,164,2,0,0,34,164,2,0,0,35,0,128,4,0,34,0,128,4,0,35,192,2,0,0,34,192,2,0,0,35,0,128,5,0,34,0,128,5,0,35,192,2,0,0,34,192,2,0,0,35,0,128,6,0,34,0,128,6,0,35,220,2,0,0,34,220,2,0,0,35,0,128,7,0,34,0,128,7,0,35,248,2,0,0,34,248,2,0,0,90,88,21,3,0,0,16,0,0,0,0,0,10,0,88,102,3,0,0,16,0,0,0,0,0,10,0,108,90,88,21,3,0,0,16,0,0,0,0,0,10,0,88,102,3,0,0,16,0,0,0,0,0,10,0,108,90,88,21,3,0,0,16,0,0,0,0,0,10,0,88,102,3,0,0,16,0,0,0,0,0,10,0,108,90,88,21,3,0,0,16,0,0,0,0,0,10,0,88,102,3,0,0,16,0,0,0,0,0,10,0,108,90,88,21,3,0,0,16,0,0,0,0,0,10,0,88,102,3,0,0,16,0,0,0,0,0,10,0,108,90,15,80,0,0,253,3,0,0,81,0,0,253,3,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,90,35,12,128,4,0,34,12,128,4,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,15,80,0,0,255,3,0,0,81,0,0,255,3,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,0,0,34,8,128,0,0,35,8,128,1,0,34,8,128,1,0,90,35,12,128,2,0,34,12,128,2,0,35,12,128,1,0,34,12,128,1,0,15,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,35,12,128,3,0,34,12,128,3,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,31,254,32,254,107,91,88,0,0,0,0,44,230,0,7,1,52,4,0,0,16,0,0,0,0,0,10,0,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,42,230,0,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 181, bytes: 1086, labels: 37, unknownOps: 2, unresolvedSymbols: 48 } as const;
