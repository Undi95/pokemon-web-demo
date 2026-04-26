// AUTO-GENERATED from data/scripts/record_mix.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/record_mix.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EventScript_MixRecordsPrompt', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_MixRecords', isGlobal: true, instrIndex: 6 },
  { name: 'EventScript_EndMixRecords', isGlobal: true, instrIndex: 9 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["Text_WouldYouLikeToMixRecords","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","EventScript_MixRecords"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","EventScript_EndMixRecords"]},
  {op:"goto",args:["EventScript_EndMixRecords"]},
  {op:"special",args:["RecordMixingPlayerSpotTriggered"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["Text_WeHopeToSeeYouAgain"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
