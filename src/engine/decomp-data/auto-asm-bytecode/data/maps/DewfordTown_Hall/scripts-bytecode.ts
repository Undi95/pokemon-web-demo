// AUTO-GENERATED from data/maps/DewfordTown_Hall/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=181, bytes=1422, labels=37, unknownOps=0, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "DewfordTown_Hall_MapScripts": 0,
  "DewfordTown_Hall_EventScript_Girl": 0,
  "DewfordTown_Hall_EventScript_GirlBoredOfTrend": 43,
  "DewfordTown_Hall_EventScript_Woman": 53,
  "DewfordTown_Hall_EventScript_Man": 70,
  "DewfordTown_Hall_EventScript_ConfirmTrendLink": 134,
  "DewfordTown_Hall_EventScript_RejectTrendLink": 144,
  "DewfordTown_Hall_EventScript_ExpertM": 154,
  "DewfordTown_Hall_EventScript_Twin": 196,
  "DewfordTown_Hall_EventScript_LittleBoy": 238,
  "DewfordTown_Hall_EventScript_Bookshelf": 255,
  "DewfordTown_Hall_EventScript_Painting": 271,
  "DewfordTown_Hall_EventScript_ScreamTitle": 543,
  "DewfordTown_Hall_EventScript_SmileTitle": 553,
  "DewfordTown_Hall_EventScript_LastTitle": 563,
  "DewfordTown_Hall_EventScript_BirthTitle": 573,
  "DewfordTown_Hall_EventScript_SchoolKidM": 583,
  "DewfordTown_Hall_EventScript_PsychicM": 594,
  "DewfordTown_Hall_EventScript_DoTrendDebate": 605,
  "DewfordTown_Hall_EventScript_TrendDebate1": 876,
  "DewfordTown_Hall_EventScript_TrendDebate2": 904,
  "DewfordTown_Hall_EventScript_TrendDebate3": 932,
  "DewfordTown_Hall_EventScript_TrendDebate4": 960,
  "DewfordTown_Hall_EventScript_TrendDebate5": 988,
  "DewfordTown_Hall_EventScript_DontMovePlayer1": 1016,
  "DewfordTown_Hall_EventScript_DebateReact1": 1017,
  "DewfordTown_Hall_EventScript_PlayerReactWest": 1086,
  "DewfordTown_Hall_EventScript_DontMovePlayer2": 1133,
  "DewfordTown_Hall_EventScript_DebateReact2": 1134,
  "DewfordTown_Hall_EventScript_PlayerReactNorthSouth": 1203,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceUp": 1248,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceDown": 1273,
  "DewfordTown_Hall_EventScript_PlayerReactEast": 1298,
  "DewfordTown_Hall_Movement_PsychicWalkInPlaceLeft": 1345,
  "DewfordTown_Hall_Movement_SchoolKidWalkInPlaceRight": 1347,
  "DewfordTown_Hall_EventScript_SludgeBombMan": 1349,
  "DewfordTown_Hall_EventScript_ReceivedSludgeBomb": 1412,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,88,0,0,0,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,43,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,4,109,90,107,91,88,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,5,35,13,128,1,0,34,13,128,1,0,7,1,134,0,0,0,7,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,7,1,144,0,0,0,7,1,13,128,0,0,90,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,88,0,0,0,0,16,0,0,0,0,0,10,4,109,90,106,88,0,0,0,0,16,0,0,0,0,0,10,4,108,90,106,88,0,0,0,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,31,2,0,0,34,31,2,0,0,7,1,0,0,0,0,7,1,31,2,0,0,35,0,128,4,0,34,0,128,4,0,35,31,2,0,0,34,31,2,0,0,7,1,0,0,0,0,7,1,31,2,0,0,35,0,128,1,0,34,0,128,1,0,35,41,2,0,0,34,41,2,0,0,7,1,0,0,0,0,7,1,41,2,0,0,35,0,128,5,0,34,0,128,5,0,35,31,2,0,0,34,31,2,0,0,7,1,0,0,0,0,7,1,31,2,0,0,35,0,128,2,0,34,0,128,2,0,35,51,2,0,0,34,51,2,0,0,7,1,0,0,0,0,7,1,51,2,0,0,35,0,128,6,0,34,0,128,6,0,35,51,2,0,0,34,51,2,0,0,7,1,0,0,0,0,7,1,51,2,0,0,35,0,128,3,0,34,0,128,3,0,35,61,2,0,0,34,61,2,0,0,7,1,0,0,0,0,7,1,61,2,0,0,35,0,128,7,0,34,0,128,7,0,35,51,2,0,0,34,51,2,0,0,7,1,0,0,0,0,7,1,51,2,0,0,90,16,0,0,0,0,0,10,4,108,90,16,0,0,0,0,0,10,4,108,90,16,0,0,0,0,0,10,4,108,90,16,0,0,0,0,0,10,4,108,90,106,113,8,0,0,89,93,2,0,0,90,106,113,8,1,0,89,93,2,0,0,90,88,0,0,0,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,108,3,0,0,34,108,3,0,0,7,1,0,0,0,0,7,1,108,3,0,0,35,0,128,1,0,34,0,128,1,0,35,108,3,0,0,34,108,3,0,0,7,1,0,0,0,0,7,1,108,3,0,0,35,0,128,2,0,34,0,128,2,0,35,136,3,0,0,34,136,3,0,0,7,1,0,0,0,0,7,1,136,3,0,0,35,0,128,3,0,34,0,128,3,0,35,136,3,0,0,34,136,3,0,0,7,1,0,0,0,0,7,1,136,3,0,0,35,0,128,4,0,34,0,128,4,0,35,164,3,0,0,34,164,3,0,0,7,1,0,0,0,0,7,1,164,3,0,0,35,0,128,5,0,34,0,128,5,0,35,164,3,0,0,34,164,3,0,0,7,1,0,0,0,0,7,1,164,3,0,0,35,0,128,6,0,34,0,128,6,0,35,192,3,0,0,34,192,3,0,0,7,1,0,0,0,0,7,1,192,3,0,0,35,0,128,7,0,34,0,128,7,0,35,220,3,0,0,34,220,3,0,0,7,1,0,0,0,0,7,1,220,3,0,0,90,88,249,3,0,0,16,0,0,0,0,0,10,4,88,110,4,0,0,16,0,0,0,0,0,10,4,108,90,88,249,3,0,0,16,0,0,0,0,0,10,4,88,110,4,0,0,16,0,0,0,0,0,10,4,108,90,88,249,3,0,0,16,0,0,0,0,0,10,4,88,110,4,0,0,16,0,0,0,0,0,10,4,108,90,88,249,3,0,0,16,0,0,0,0,0,10,4,88,110,4,0,0,16,0,0,0,0,0,10,4,108,90,88,249,3,0,0,16,0,0,0,0,0,10,4,88,110,4,0,0,16,0,0,0,0,0,10,4,108,90,15,80,0,0,65,5,0,0,81,0,0,65,5,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,0,0,34,8,128,0,0,7,1,62,4,0,0,7,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,7,1,109,4,0,0,7,1,8,128,0,0,90,35,12,128,4,0,34,12,128,4,0,7,1,248,3,0,0,7,1,12,128,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,15,80,0,0,67,5,0,0,81,0,0,67,5,0,0,0,0,82,0,0,83,0,0,0,0,35,8,128,0,0,34,8,128,0,0,7,1,179,4,0,0,7,1,8,128,0,0,35,8,128,1,0,34,8,128,1,0,7,1,18,5,0,0,7,1,8,128,0,0,90,35,12,128,2,0,34,12,128,2,0,8,1,224,4,0,0,8,1,12,128,0,0,35,12,128,1,0,34,12,128,1,0,8,1,249,4,0,0,8,1,12,128,0,0,15,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,35,12,128,3,0,34,12,128,3,0,7,1,248,3,0,0,7,1,12,128,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,31,254,32,254,107,91,88,0,0,0,0,44,230,0,7,1,132,5,0,0,16,0,0,0,0,0,10,4,27,0,128,0,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,42,230,0,109,90,16,0,0,0,0,0,10,4,109,90] as const;

export const STATS = { ops: 181, bytes: 1422, labels: 37, unknownOps: 0, unresolvedSymbols: 44 } as const;
