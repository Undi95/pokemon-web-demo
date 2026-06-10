// AUTO-GENERATED from data/scripts/trainer_script.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/trainer_script.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Std_RegisteredInMatchCall', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_TryGetTrainerScript', isGlobal: true, instrIndex: 10 },
  { name: 'EventScript_GotoTrainerScript', isGlobal: true, instrIndex: 14 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"buffertrainerclassname",args:["STR_VAR_1","VAR_0x8000"]},
  {op:"buffertrainername",args:["STR_VAR_2","VAR_0x8000"]},
  {op:"closemessage",args:[]},
  {op:"delay",args:[30]},
  {op:"playfanfare",args:["MUS_REGISTER_MATCH_CALL"]},
  {op:"msgbox",args:["gText_RegisteredTrainerinPokeNav","MSGBOX_DEFAULT"]},
  {op:"waitfanfare",args:[]},
  {op:"closemessage",args:[]},
  {op:"delay",args:[30]},
  {op:"return",args:[]},
  {op:"special",args:["ShouldTryGetTrainerScript"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"EventScript_GotoTrainerScript"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"gotobeatenscript",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
