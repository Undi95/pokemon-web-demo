// AUTO-GENERATED from data/maps/RustboroCity_PokemonSchool/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=146, bytes=755, labels=27, unknownOps=0, unresolvedSymbols=26

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RustboroCity_PokemonSchool_MapScripts": 0,
  "RustboroCity_PokemonSchool_EventScript_Blackboard": 0,
  "RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic": 15,
  "RustboroCity_PokemonSchool_EventScript_Poison": 259,
  "RustboroCity_PokemonSchool_EventScript_Paralysis": 273,
  "RustboroCity_PokemonSchool_EventScript_Sleep": 287,
  "RustboroCity_PokemonSchool_EventScript_Burn": 301,
  "RustboroCity_PokemonSchool_EventScript_Freeze": 315,
  "RustboroCity_PokemonSchool_EventScript_ExitTopicSelect": 329,
  "RustboroCity_PokemonSchool_EventScript_GameboyKid1": 331,
  "RustboroCity_PokemonSchool_EventScript_GameboyKid2": 340,
  "RustboroCity_PokemonSchool_EventScript_RichBoy": 349,
  "RustboroCity_PokemonSchool_EventScript_Lass": 358,
  "RustboroCity_PokemonSchool_EventScript_SchoolKidM": 367,
  "RustboroCity_PokemonSchool_EventScript_StudentNotebook": 376,
  "RustboroCity_PokemonSchool_EventScript_Teacher": 385,
  "RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsEast": 512,
  "RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsWest": 537,
  "RustboroCity_PokemonSchool_EventScript_GaveQuickClaw": 562,
  "RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsWest": 597,
  "RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsEast": 620,
  "RustboroCity_PokemonSchool_EventScript_Scott": 645,
  "RustboroCity_PokemonSchool_EventScript_ScottSpokeAlready": 690,
  "RustboroCity_PokemonSchool_EventScript_ScottGreetHasBadge": 709,
  "RustboroCity_PokemonSchool_EventScript_ScottNoticeBadge": 723,
  "RustboroCity_PokemonSchool_EventScript_MetScottAfterBadge": 737,
  "RustboroCity_PokemonSchool_EventScript_ScottWatchStudents": 745,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,16,0,0,0,0,0,10,4,89,15,0,0,0,90,104,0,0,0,0,0,0,0,114,8,1,13,3,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,3,1,0,0,34,3,1,0,0,7,1,0,0,0,0,7,1,3,1,0,0,35,0,128,1,0,34,0,128,1,0,35,17,1,0,0,34,17,1,0,0,7,1,0,0,0,0,7,1,17,1,0,0,35,0,128,2,0,34,0,128,2,0,35,31,1,0,0,34,31,1,0,0,7,1,0,0,0,0,7,1,31,1,0,0,35,0,128,3,0,34,0,128,3,0,35,45,1,0,0,34,45,1,0,0,7,1,0,0,0,0,7,1,45,1,0,0,35,0,128,4,0,34,0,128,4,0,35,59,1,0,0,34,59,1,0,0,7,1,0,0,0,0,7,1,59,1,0,0,35,0,128,5,0,34,0,128,5,0,35,73,1,0,0,34,73,1,0,0,7,1,0,0,0,0,7,1,73,1,0,0,35,0,128,127,0,34,0,128,127,0,35,73,1,0,0,34,73,1,0,0,7,1,0,0,0,0,7,1,73,1,0,0,90,16,0,0,0,0,0,10,4,89,15,0,0,0,90,16,0,0,0,0,0,10,4,89,15,0,0,0,90,16,0,0,0,0,0,10,4,89,15,0,0,0,90,16,0,0,0,0,0,10,4,89,15,0,0,0,90,16,0,0,0,0,0,10,4,89,15,0,0,0,90,108,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,3,90,107,91,44,19,1,7,1,50,2,0,0,35,12,128,4,0,34,12,128,4,0,8,1,0,2,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,25,2,0,0,8,1,12,128,0,0,16,0,0,0,0,0,10,4,27,0,128,183,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,42,19,1,109,90,80,15,128,108,2,0,0,81,15,128,108,2,0,0,0,0,82,0,0,83,0,0,0,0,15,80,15,128,85,2,0,0,81,15,128,85,2,0,0,0,0,82,0,0,83,0,0,0,0,15,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,10,8,8,11,37,20,20,20,8,39,20,20,11,20,20,19,9,10,10,9,9,11,254,11,11,8,8,10,10,37,20,20,20,8,39,20,20,11,20,20,19,9,11,9,9,10,10,254,107,91,44,203,1,7,1,233,2,0,0,44,54,1,7,1,178,2,0,0,44,0,0,7,1,197,2,0,0,16,0,0,0,0,0,10,4,115,209,1,42,54,1,109,90,44,0,0,7,1,211,2,0,0,16,0,0,0,0,0,10,4,109,90,16,0,0,0,0,0,10,4,89,225,2,0,0,90,16,0,0,0,0,0,10,4,89,225,2,0,0,90,115,209,1,42,203,1,109,90,16,0,0,0,0,0,10,4,109,90] as const;

export const STATS = { ops: 146, bytes: 755, labels: 27, unknownOps: 0, unresolvedSymbols: 26 } as const;
