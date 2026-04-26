// AUTO-GENERATED from data/maps/Route133/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route133/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route133_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route133_EventScript_Franklin', isGlobal: true, instrIndex: 0 },
  { name: 'Route133_EventScript_Debra', isGlobal: true, instrIndex: 3 },
  { name: 'Route133_EventScript_Linda', isGlobal: true, instrIndex: 6 },
  { name: 'Route133_EventScript_Warren', isGlobal: true, instrIndex: 9 },
  { name: 'Route133_EventScript_Beck', isGlobal: true, instrIndex: 12 },
  { name: 'Route133_EventScript_Mollie', isGlobal: true, instrIndex: 15 },
  { name: 'Route133_EventScript_Conor', isGlobal: true, instrIndex: 18 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_FRANKLIN","Route133_Text_FranklinIntro","Route133_Text_FranklinDefeat"]},
  {op:"msgbox",args:["Route133_Text_FranklinPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DEBRA","Route133_Text_DebraIntro","Route133_Text_DebraDefeat"]},
  {op:"msgbox",args:["Route133_Text_DebraPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_LINDA","Route133_Text_LindaIntro","Route133_Text_LindaDefeat"]},
  {op:"msgbox",args:["Route133_Text_LindaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_WARREN","Route133_Text_WarrenIntro","Route133_Text_WarrenDefeat"]},
  {op:"msgbox",args:["Route133_Text_WarrenPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_BECK","Route133_Text_BeckIntro","Route133_Text_BeckDefeat"]},
  {op:"msgbox",args:["Route133_Text_BeckPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_MOLLIE","Route133_Text_MollieIntro","Route133_Text_MollieDefeat"]},
  {op:"msgbox",args:["Route133_Text_MolliePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CONOR","Route133_Text_ConorIntro","Route133_Text_ConorDefeat"]},
  {op:"msgbox",args:["Route133_Text_ConorPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
