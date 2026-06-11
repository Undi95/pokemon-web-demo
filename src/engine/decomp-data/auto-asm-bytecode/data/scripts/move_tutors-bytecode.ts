// AUTO-GENERATED from data/scripts/move_tutors-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=206, bytes=1386, labels=32, unknownOps=0, unresolvedSymbols=65

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_PokemonFanClub_EventScript_SwaggerTutor": 0,
  "MoveTutor_EventScript_SwaggerDeclined": 117,
  "MoveTutor_EventScript_SwaggerTaught": 127,
  "MauvilleCity_EventScript_RolloutTutor": 137,
  "MoveTutor_EventScript_RolloutDeclined": 254,
  "MoveTutor_EventScript_RolloutTaught": 264,
  "VerdanturfTown_PokemonCenter_1F_EventScript_FuryCutterTutor": 274,
  "MoveTutor_EventScript_FuryCutterDeclined": 391,
  "MoveTutor_EventScript_FuryCutterTaught": 401,
  "LavaridgeTown_House_EventScript_MimicTutor": 411,
  "MoveTutor_EventScript_MimicDeclined": 528,
  "MoveTutor_EventScript_MimicTaught": 538,
  "FallarborTown_Mart_EventScript_MetronomeTutor": 548,
  "MoveTutor_EventScript_MetronomeDeclined": 665,
  "MoveTutor_EventScript_MetronomeTaught": 675,
  "FortreeCity_House2_EventScript_SleepTalkTutor": 685,
  "MoveTutor_EventScript_SleepTalkDeclined": 802,
  "MoveTutor_EventScript_SleepTalkTaught": 812,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SubstituteTutor": 822,
  "MoveTutor_EventScript_SubstituteDeclined": 939,
  "MoveTutor_EventScript_SubstituteTaught": 949,
  "MossdeepCity_EventScript_DynamicPunchTutor": 959,
  "MoveTutor_EventScript_DynamicPunchDeclined": 1076,
  "MoveTutor_EventScript_DynamicPunchTaught": 1086,
  "SootopolisCity_PokemonCenter_1F_EventScript_DoubleEdgeTutor": 1096,
  "MoveTutor_EventScript_DoubleEdgeDeclined": 1213,
  "MoveTutor_EventScript_DoubleEdgeTaught": 1223,
  "PacifidlogTown_PokemonCenter_1F_EventScript_ExplosionTutor": 1233,
  "MoveTutor_EventScript_ExplosionDeclined": 1350,
  "MoveTutor_EventScript_ExplosionTaught": 1360,
  "MoveTutor_EventScript_OpenPartyMenu": 1370,
  "MoveTutor_EventScript_CanOnlyBeLearnedOnce": 1377,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,0,0,7,1,127,0,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,117,0,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,117,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,117,0,0,0,7,1,0,0,0,0,42,0,0,6,127,0,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,8,1,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,254,0,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,254,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,254,0,0,0,7,1,0,0,0,0,42,0,0,6,8,1,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,145,1,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,135,1,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,135,1,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,135,1,0,0,7,1,0,0,0,0,42,0,0,6,145,1,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,26,2,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,16,2,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,16,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,16,2,0,0,7,1,0,0,0,0,42,0,0,6,26,2,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,163,2,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,153,2,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,153,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,153,2,0,0,7,1,0,0,0,0,42,0,0,6,163,2,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,44,3,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,34,3,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,34,3,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,34,3,0,0,7,1,0,0,0,0,42,0,0,6,44,3,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,181,3,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,171,3,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,171,3,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,171,3,0,0,7,1,0,0,0,0,42,0,0,6,181,3,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,62,4,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,52,4,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,52,4,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,52,4,0,0,7,1,0,0,0,0,42,0,0,6,62,4,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,199,4,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,189,4,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,189,4,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,189,4,0,0,7,1,0,0,0,0,42,0,0,6,199,4,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,80,5,0,0,16,0,0,0,0,0,10,5,35,0,0,0,0,34,0,0,0,0,7,1,70,5,0,0,7,1,0,0,0,0,5,97,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,70,5,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,5,90,5,0,0,35,0,0,0,0,34,0,0,0,0,7,1,70,5,0,0,7,1,0,0,0,0,42,0,0,6,80,5,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,38,0,0,0,107,91,4,16,0,0,0,0,0,10,5,4] as const;

export const STATS = { ops: 206, bytes: 1386, labels: 32, unknownOps: 0, unresolvedSymbols: 65 } as const;
