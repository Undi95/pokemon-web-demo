// AUTO-GENERATED from data/maps/RustboroCity_PokemonSchool/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=146, bytes=635, labels=27, unknownOps=2, unresolvedSymbols=29

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RustboroCity_PokemonSchool_MapScripts": 0,
  "RustboroCity_PokemonSchool_EventScript_Blackboard": 0,
  "RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic": 15,
  "RustboroCity_PokemonSchool_EventScript_Poison": 175,
  "RustboroCity_PokemonSchool_EventScript_Paralysis": 189,
  "RustboroCity_PokemonSchool_EventScript_Sleep": 203,
  "RustboroCity_PokemonSchool_EventScript_Burn": 217,
  "RustboroCity_PokemonSchool_EventScript_Freeze": 231,
  "RustboroCity_PokemonSchool_EventScript_ExitTopicSelect": 245,
  "RustboroCity_PokemonSchool_EventScript_GameboyKid1": 247,
  "RustboroCity_PokemonSchool_EventScript_GameboyKid2": 256,
  "RustboroCity_PokemonSchool_EventScript_RichBoy": 265,
  "RustboroCity_PokemonSchool_EventScript_Lass": 274,
  "RustboroCity_PokemonSchool_EventScript_SchoolKidM": 283,
  "RustboroCity_PokemonSchool_EventScript_StudentNotebook": 292,
  "RustboroCity_PokemonSchool_EventScript_Teacher": 301,
  "RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsEast": 392,
  "RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsWest": 417,
  "RustboroCity_PokemonSchool_EventScript_GaveQuickClaw": 442,
  "RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsWest": 477,
  "RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsEast": 500,
  "RustboroCity_PokemonSchool_EventScript_Scott": 525,
  "RustboroCity_PokemonSchool_EventScript_ScottSpokeAlready": 570,
  "RustboroCity_PokemonSchool_EventScript_ScottGreetHasBadge": 589,
  "RustboroCity_PokemonSchool_EventScript_ScottNoticeBadge": 603,
  "RustboroCity_PokemonSchool_EventScript_MetScottAfterBadge": 617,
  "RustboroCity_PokemonSchool_EventScript_ScottWatchStudents": 625,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [106,16,0,0,0,0,0,10,0,89,15,0,0,0,90,104,0,0,0,0,0,0,0,114,8,1,13,3,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,175,0,0,0,34,175,0,0,0,35,0,128,1,0,34,0,128,1,0,35,189,0,0,0,34,189,0,0,0,35,0,128,2,0,34,0,128,2,0,35,203,0,0,0,34,203,0,0,0,35,0,128,3,0,34,0,128,3,0,35,217,0,0,0,34,217,0,0,0,35,0,128,4,0,34,0,128,4,0,35,231,0,0,0,34,231,0,0,0,35,0,128,5,0,34,0,128,5,0,35,245,0,0,0,34,245,0,0,0,35,0,128,127,0,34,0,128,127,0,35,245,0,0,0,34,245,0,0,0,90,16,0,0,0,0,0,10,0,89,15,0,0,0,90,16,0,0,0,0,0,10,0,89,15,0,0,0,90,16,0,0,0,0,0,10,0,89,15,0,0,0,90,16,0,0,0,0,0,10,0,89,15,0,0,0,90,16,0,0,0,0,0,10,0,89,15,0,0,0,90,108,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,44,19,1,7,1,186,1,0,0,35,12,128,4,0,34,12,128,4,0,35,12,128,3,0,34,12,128,3,0,16,0,0,0,0,0,10,0,27,0,128,183,0,27,1,128,1,0,10,0,35,13,128,0,0,34,13,128,0,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,42,19,1,109,90,80,15,128,244,1,0,0,81,15,128,244,1,0,0,0,0,82,0,0,83,0,0,0,0,15,80,15,128,221,1,0,0,81,15,128,221,1,0,0,0,0,82,0,0,83,0,0,0,0,15,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,10,8,8,11,37,20,20,20,8,39,20,20,11,20,20,19,9,10,10,9,9,11,254,11,11,8,8,10,10,37,20,20,20,8,39,20,20,11,20,20,19,9,11,9,9,10,10,254,107,91,44,203,1,7,1,113,2,0,0,44,54,1,7,1,58,2,0,0,44,0,0,7,1,77,2,0,0,16,0,0,0,0,0,10,0,115,209,1,42,54,1,109,90,44,0,0,7,1,91,2,0,0,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,89,105,2,0,0,90,16,0,0,0,0,0,10,0,89,105,2,0,0,90,115,209,1,42,203,1,109,90,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 146, bytes: 635, labels: 27, unknownOps: 2, unresolvedSymbols: 29 } as const;
