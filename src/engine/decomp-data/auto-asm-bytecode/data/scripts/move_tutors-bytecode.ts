// AUTO-GENERATED from data/scripts/move_tutors-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=206, bytes=1016, labels=32, unknownOps=2, unresolvedSymbols=46

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_PokemonFanClub_EventScript_SwaggerTutor": 0,
  "MoveTutor_EventScript_SwaggerDeclined": 80,
  "MoveTutor_EventScript_SwaggerTaught": 90,
  "MauvilleCity_EventScript_RolloutTutor": 100,
  "MoveTutor_EventScript_RolloutDeclined": 180,
  "MoveTutor_EventScript_RolloutTaught": 190,
  "VerdanturfTown_PokemonCenter_1F_EventScript_FuryCutterTutor": 200,
  "MoveTutor_EventScript_FuryCutterDeclined": 280,
  "MoveTutor_EventScript_FuryCutterTaught": 290,
  "LavaridgeTown_House_EventScript_MimicTutor": 300,
  "MoveTutor_EventScript_MimicDeclined": 380,
  "MoveTutor_EventScript_MimicTaught": 390,
  "FallarborTown_Mart_EventScript_MetronomeTutor": 400,
  "MoveTutor_EventScript_MetronomeDeclined": 480,
  "MoveTutor_EventScript_MetronomeTaught": 490,
  "FortreeCity_House2_EventScript_SleepTalkTutor": 500,
  "MoveTutor_EventScript_SleepTalkDeclined": 580,
  "MoveTutor_EventScript_SleepTalkTaught": 590,
  "LilycoveCity_DepartmentStoreRooftop_EventScript_SubstituteTutor": 600,
  "MoveTutor_EventScript_SubstituteDeclined": 680,
  "MoveTutor_EventScript_SubstituteTaught": 690,
  "MossdeepCity_EventScript_DynamicPunchTutor": 700,
  "MoveTutor_EventScript_DynamicPunchDeclined": 780,
  "MoveTutor_EventScript_DynamicPunchTaught": 790,
  "SootopolisCity_PokemonCenter_1F_EventScript_DoubleEdgeTutor": 800,
  "MoveTutor_EventScript_DoubleEdgeDeclined": 880,
  "MoveTutor_EventScript_DoubleEdgeTaught": 890,
  "PacifidlogTown_PokemonCenter_1F_EventScript_ExplosionTutor": 900,
  "MoveTutor_EventScript_ExplosionDeclined": 980,
  "MoveTutor_EventScript_ExplosionTaught": 990,
  "MoveTutor_EventScript_OpenPartyMenu": 1000,
  "MoveTutor_EventScript_CanOnlyBeLearnedOnce": 1007,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [107,91,44,177,1,7,1,90,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,23,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,177,1,89,90,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,178,1,7,1,190,0,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,16,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,178,1,89,190,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,179,1,7,1,34,1,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,29,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,179,1,89,34,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,180,1,7,1,134,1,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,7,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,180,1,89,134,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,181,1,7,1,234,1,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,8,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,181,1,89,234,1,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,182,1,7,1,78,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,24,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,182,1,89,78,2,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,183,1,7,1,178,2,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,14,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,183,1,89,178,2,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,184,1,7,1,22,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,15,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,184,1,89,22,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,185,1,7,1,122,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,4,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,185,1,89,122,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,44,186,1,7,1,222,3,0,0,16,0,0,0,0,0,10,0,35,13,128,0,0,34,13,128,0,0,88,239,3,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,5,12,0,88,232,3,0,0,35,13,128,0,0,34,13,128,0,0,42,186,1,89,222,3,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,38,0,0,0,107,91,15,16,0,0,0,0,0,10,0,15] as const;

export const STATS = { ops: 206, bytes: 1016, labels: 32, unknownOps: 2, unresolvedSymbols: 46 } as const;
