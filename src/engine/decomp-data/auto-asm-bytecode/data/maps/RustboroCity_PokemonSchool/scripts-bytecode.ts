// AUTO-GENERATED from data/maps/RustboroCity_PokemonSchool/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=146, bytes=757, labels=27, unknownOps=0, unresolvedSymbols=46

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
export const BYTECODE: readonly number[] = [106,16,0,0,0,0,0,10,4,6,15,0,0,0,3,104,0,0,0,0,103,114,8,1,0,3,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,1,1,0,0,34,1,1,0,0,7,1,0,0,0,0,7,1,1,1,0,0,35,0,0,1,0,34,0,0,1,0,35,15,1,0,0,34,15,1,0,0,7,1,0,0,0,0,7,1,15,1,0,0,35,0,0,2,0,34,0,0,2,0,35,29,1,0,0,34,29,1,0,0,7,1,0,0,0,0,7,1,29,1,0,0,35,0,0,3,0,34,0,0,3,0,35,43,1,0,0,34,43,1,0,0,7,1,0,0,0,0,7,1,43,1,0,0,35,0,0,4,0,34,0,0,4,0,35,57,1,0,0,34,57,1,0,0,7,1,0,0,0,0,7,1,57,1,0,0,35,0,0,5,0,34,0,0,5,0,35,71,1,0,0,34,71,1,0,0,7,1,0,0,0,0,7,1,71,1,0,0,35,0,0,0,0,34,0,0,0,0,35,71,1,0,0,34,71,1,0,0,7,1,0,0,0,0,7,1,71,1,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,16,0,0,0,0,0,10,4,6,15,0,0,0,3,108,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,3,3,107,91,44,0,0,7,1,48,2,0,0,35,0,0,0,0,34,0,0,0,0,8,1,254,1,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,23,2,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,42,0,0,109,3,80,0,0,106,2,0,0,81,0,0,106,2,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,83,2,0,0,81,0,0,83,2,0,0,0,0,82,0,0,83,0,0,0,0,4,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,91,44,0,0,7,1,235,2,0,0,44,0,0,7,1,178,2,0,0,44,0,0,7,1,197,2,0,0,16,0,0,0,0,0,10,4,24,0,0,1,0,42,0,0,109,3,44,0,0,7,1,211,2,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,6,225,2,0,0,3,16,0,0,0,0,0,10,4,6,225,2,0,0,3,24,0,0,1,0,42,0,0,109,3,16,0,0,0,0,0,10,4,109,3] as const;

export const STATS = { ops: 146, bytes: 757, labels: 27, unknownOps: 0, unresolvedSymbols: 46 } as const;
