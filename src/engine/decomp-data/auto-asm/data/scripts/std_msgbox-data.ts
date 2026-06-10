// AUTO-GENERATED from data/scripts/std_msgbox.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/std_msgbox.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Std_MsgboxNPC', isGlobal: false, instrIndex: 0 },
  { name: 'Std_MsgboxSign', isGlobal: false, instrIndex: 7 },
  { name: 'Std_MsgboxDefault', isGlobal: false, instrIndex: 13 },
  { name: 'Std_MsgboxYesNo', isGlobal: false, instrIndex: 17 },
  { name: 'Std_MsgboxGetPoints', isGlobal: false, instrIndex: 21 },
  { name: 'Std_MsgboxPokenav', isGlobal: false, instrIndex: 26 },
  { name: 'EventScript_UnusedReturn', isGlobal: false, instrIndex: 29 },
  { name: 'Common_EventScript_SaveGame', isGlobal: true, instrIndex: 30 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 32 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["NULL"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"message",args:["NULL"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"releaseall",args:[]},
  {op:"return",args:[]},
  {op:"message",args:["NULL"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"return",args:[]},
  {op:"message",args:["NULL"]},
  {op:"waitmessage",args:[]},
  {op:"yesnobox",args:[20,8]},
  {op:"return",args:[]},
  {op:"message",args:["NULL"]},
  {op:"playfanfare",args:["MUS_OBTAIN_B_POINTS"]},
  {op:"waitfanfare",args:[]},
  {op:"waitmessage",args:[]},
  {op:"return",args:[]},
  {op:"pokenavcall",args:["NULL"]},
  {op:"waitmessage",args:[]},
  {op:"return",args:[]},
  {op:"return",args:[]},
  {op:"special",args:["SaveGame"]},
  {op:"return",args:[]},
] as const;
