// AUTO-GENERATED from data/maps/DewfordTown_Hall/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=181, bytes=1424, labels=37, unknownOps=0, unresolvedSymbols=56

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
  "DewfordTown_Hall_EventScript_PsychicM": 595,
  "DewfordTown_Hall_EventScript_DoTrendDebate": 607,
  "DewfordTown_Hall_EventScript_TrendDebate1": 878,
  "DewfordTown_Hall_EventScript_TrendDebate2": 906,
  "DewfordTown_Hall_EventScript_TrendDebate3": 934,
  "DewfordTown_Hall_EventScript_TrendDebate4": 962,
  "DewfordTown_Hall_EventScript_TrendDebate5": 990,
  "DewfordTown_Hall_EventScript_DontMovePlayer1": 1018,
  "DewfordTown_Hall_EventScript_DebateReact1": 1019,
  "DewfordTown_Hall_EventScript_PlayerReactWest": 1088,
  "DewfordTown_Hall_EventScript_DontMovePlayer2": 1135,
  "DewfordTown_Hall_EventScript_DebateReact2": 1136,
  "DewfordTown_Hall_EventScript_PlayerReactNorthSouth": 1205,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceUp": 1250,
  "DewfordTown_Hall_EventScript_PlayerWalkInPlaceDown": 1275,
  "DewfordTown_Hall_EventScript_PlayerReactEast": 1300,
  "DewfordTown_Hall_Movement_PsychicWalkInPlaceLeft": 1347,
  "DewfordTown_Hall_Movement_SchoolKidWalkInPlaceRight": 1349,
  "DewfordTown_Hall_EventScript_SludgeBombMan": 1351,
  "DewfordTown_Hall_EventScript_ReceivedSludgeBomb": 1414,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,5,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,43,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,5,0,0,0,0,16,0,0,0,0,0,10,4,109,3,107,91,5,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,5,35,0,0,1,0,34,0,0,1,0,7,1,134,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,144,0,0,0,7,1,0,0,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,5,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,107,91,5,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,107,91,5,0,0,0,0,16,0,0,0,0,0,10,4,109,3,106,5,0,0,0,0,16,0,0,0,0,0,10,4,108,3,106,5,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,31,2,0,0,34,31,2,0,0,7,1,0,0,0,0,7,1,31,2,0,0,35,0,0,4,0,34,0,0,4,0,35,31,2,0,0,34,31,2,0,0,7,1,0,0,0,0,7,1,31,2,0,0,35,0,0,1,0,34,0,0,1,0,35,41,2,0,0,34,41,2,0,0,7,1,0,0,0,0,7,1,41,2,0,0,35,0,0,5,0,34,0,0,5,0,35,31,2,0,0,34,31,2,0,0,7,1,0,0,0,0,7,1,31,2,0,0,35,0,0,2,0,34,0,0,2,0,35,51,2,0,0,34,51,2,0,0,7,1,0,0,0,0,7,1,51,2,0,0,35,0,0,6,0,34,0,0,6,0,35,51,2,0,0,34,51,2,0,0,7,1,0,0,0,0,7,1,51,2,0,0,35,0,0,3,0,34,0,0,3,0,35,61,2,0,0,34,61,2,0,0,7,1,0,0,0,0,7,1,61,2,0,0,35,0,0,7,0,34,0,0,7,0,35,51,2,0,0,34,51,2,0,0,7,1,0,0,0,0,7,1,51,2,0,0,3,16,0,0,0,0,0,10,4,108,3,16,0,0,0,0,0,10,4,108,3,16,0,0,0,0,0,10,4,108,3,16,0,0,0,0,0,10,4,108,3,106,23,0,0,0,0,6,95,2,0,0,3,106,23,0,0,1,0,6,95,2,0,0,3,5,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,110,3,0,0,34,110,3,0,0,7,1,0,0,0,0,7,1,110,3,0,0,35,0,0,1,0,34,0,0,1,0,35,110,3,0,0,34,110,3,0,0,7,1,0,0,0,0,7,1,110,3,0,0,35,0,0,2,0,34,0,0,2,0,35,138,3,0,0,34,138,3,0,0,7,1,0,0,0,0,7,1,138,3,0,0,35,0,0,3,0,34,0,0,3,0,35,138,3,0,0,34,138,3,0,0,7,1,0,0,0,0,7,1,138,3,0,0,35,0,0,4,0,34,0,0,4,0,35,166,3,0,0,34,166,3,0,0,7,1,0,0,0,0,7,1,166,3,0,0,35,0,0,5,0,34,0,0,5,0,35,166,3,0,0,34,166,3,0,0,7,1,0,0,0,0,7,1,166,3,0,0,35,0,0,6,0,34,0,0,6,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,35,0,0,7,0,34,0,0,7,0,35,222,3,0,0,34,222,3,0,0,7,1,0,0,0,0,7,1,222,3,0,0,3,5,251,3,0,0,16,0,0,0,0,0,10,4,5,112,4,0,0,16,0,0,0,0,0,10,4,108,3,5,251,3,0,0,16,0,0,0,0,0,10,4,5,112,4,0,0,16,0,0,0,0,0,10,4,108,3,5,251,3,0,0,16,0,0,0,0,0,10,4,5,112,4,0,0,16,0,0,0,0,0,10,4,108,3,5,251,3,0,0,16,0,0,0,0,0,10,4,5,112,4,0,0,16,0,0,0,0,0,10,4,108,3,5,251,3,0,0,16,0,0,0,0,0,10,4,5,112,4,0,0,16,0,0,0,0,0,10,4,108,3,4,80,0,0,67,5,0,0,81,0,0,67,5,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,64,4,0,0,7,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,111,4,0,0,7,1,0,0,0,0,3,35,0,0,0,0,34,0,0,0,0,7,1,250,3,0,0,7,1,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,4,80,0,0,69,5,0,0,81,0,0,69,5,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,181,4,0,0,7,1,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,20,5,0,0,7,1,0,0,0,0,3,35,0,0,0,0,34,0,0,0,0,8,1,226,4,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,251,4,0,0,8,1,0,0,0,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,35,0,0,0,0,34,0,0,0,0,7,1,250,3,0,0,7,1,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,0,0,0,0,107,91,5,0,0,0,0,44,0,0,7,1,134,5,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,109,3,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 181, bytes: 1424, labels: 37, unknownOps: 0, unresolvedSymbols: 56 } as const;
