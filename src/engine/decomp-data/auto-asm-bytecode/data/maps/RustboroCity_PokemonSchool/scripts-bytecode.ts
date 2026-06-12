// AUTO-GENERATED from data/maps/RustboroCity_PokemonSchool/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=146, bytes=757, labels=27, unknownOps=0, unresolvedSymbols=23

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RustboroCity_PokemonSchool_MapScripts": 0,
  "RustboroCity_PokemonSchool_EventScript_Blackboard": 0,
  "RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic": 15,
  "RustboroCity_PokemonSchool_EventScript_Poison": 257,
  "RustboroCity_PokemonSchool_EventScript_Paralysis": 271,
  "RustboroCity_PokemonSchool_EventScript_Sleep": 285,
  "RustboroCity_PokemonSchool_EventScript_Burn": 299,
  "RustboroCity_PokemonSchool_EventScript_Freeze": 313,
  "RustboroCity_PokemonSchool_EventScript_ExitTopicSelect": 327,
  "RustboroCity_PokemonSchool_EventScript_GameboyKid1": 329,
  "RustboroCity_PokemonSchool_EventScript_GameboyKid2": 338,
  "RustboroCity_PokemonSchool_EventScript_RichBoy": 347,
  "RustboroCity_PokemonSchool_EventScript_Lass": 356,
  "RustboroCity_PokemonSchool_EventScript_SchoolKidM": 365,
  "RustboroCity_PokemonSchool_EventScript_StudentNotebook": 374,
  "RustboroCity_PokemonSchool_EventScript_Teacher": 383,
  "RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsEast": 510,
  "RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsWest": 535,
  "RustboroCity_PokemonSchool_EventScript_GaveQuickClaw": 560,
  "RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsWest": 595,
  "RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsEast": 618,
  "RustboroCity_PokemonSchool_EventScript_Scott": 643,
  "RustboroCity_PokemonSchool_EventScript_ScottSpokeAlready": 690,
  "RustboroCity_PokemonSchool_EventScript_ScottGreetHasBadge": 709,
  "RustboroCity_PokemonSchool_EventScript_ScottNoticeBadge": 723,
  "RustboroCity_PokemonSchool_EventScript_MetScottAfterBadge": 737,
  "RustboroCity_PokemonSchool_EventScript_ScottWatchStudents": 747,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,16,0,0,0,0,0,10,4,6,15,0,0,0,3,104,0,0,0,0,103,114,8,1,13,3,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,1,1,0,0,34,1,1,0,0,7,1,0,0,0,0,7,1,1,1,0,0,35,0,128,1,0,34,0,128,1,0,35,15,1,0,0,34,15,1,0,0,7,1,0,0,0,0,7,1,15,1,0,0,35,0,128,2,0,34,0,128,2,0,35,29,1,0,0,34,29,1,0,0,7,1,0,0,0,0,7,1,29,1,0,0,35,0,128,3,0,34,0,128,3,0,35,43,1,0,0,34,43,1,0,0,7,1,0,0,0,0,7,1,43,1,0,0,35,0,128,4,0,34,0,128,4,0,35,57,1,0,0,34,57,1,0,0,7,1,0,0,0,0,7,1,57,1,0,0,35,0,128,5,0,34,0,128,5,0,35,71,1,0,0,34,71,1,0,0,7,1,0,0,0,0,7,1,71,1,0,0,35,0,128,127,0,34,0,128,127,0,35,71,1,0,0,34,71,1,0,0,7,1,0,0,0,0,7,1,71,1,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,108,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,107,91,44,19,1,7,1,48,2,0,0,35,12,128,4,0,34,12,128,4,0,8,1,254,1,0,0,8,1,12,128,0,0,35,12,128,3,0,34,12,128,3,0,8,1,23,2,0,0,8,1,12,128,0,0,16,0,0,0,0,0,10,4,27,0,128,183,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,7,1,0,0,0,0,7,1,13,128,0,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,42,19,1,109,3,80,15,128,106,2,0,0,81,15,128,106,2,0,0,0,0,82,0,0,83,0,0,0,0,4,80,15,128,83,2,0,0,81,15,128,83,2,0,0,0,0,82,0,0,83,0,0,0,0,4,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,10,8,8,11,37,20,20,20,8,39,20,20,11,20,20,19,9,10,10,9,9,11,254,11,11,8,8,10,10,37,20,20,20,8,39,20,20,11,20,20,19,9,11,9,9,10,10,254,107,91,44,203,1,7,1,235,2,0,0,44,54,1,7,1,178,2,0,0,44,0,0,7,1,197,2,0,0,16,0,0,0,0,0,10,4,24,209,64,1,0,42,54,1,109,3,44,0,0,7,1,211,2,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,6,225,2,0,0,3,16,0,0,0,0,0,10,4,6,225,2,0,0,3,24,209,64,1,0,42,203,1,109,3,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 146, bytes: 757, labels: 27, unknownOps: 0, unresolvedSymbols: 23 } as const;
