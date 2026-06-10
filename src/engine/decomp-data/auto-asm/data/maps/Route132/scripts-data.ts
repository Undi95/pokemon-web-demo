// AUTO-GENERATED from data/maps/Route132/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route132/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route132_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route132_EventScript_Gilbert', isGlobal: true, instrIndex: 0 },
  { name: 'Route132_EventScript_Dana', isGlobal: true, instrIndex: 3 },
  { name: 'Route132_EventScript_Ronald', isGlobal: true, instrIndex: 6 },
  { name: 'Route132_EventScript_Kiyo', isGlobal: true, instrIndex: 9 },
  { name: 'Route132_EventScript_Paxton', isGlobal: true, instrIndex: 12 },
  { name: 'Route132_EventScript_Darcy', isGlobal: true, instrIndex: 15 },
  { name: 'Route132_EventScript_Jonathan', isGlobal: true, instrIndex: 18 },
  { name: 'Route132_EventScript_Makayla', isGlobal: true, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 24 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_GILBERT","Route132_Text_GilbertIntro","Route132_Text_GilbertDefeat"]},
  {op:"msgbox",args:["Route132_Text_GilbertPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DANA","Route132_Text_DanaIntro","Route132_Text_DanaDefeat"]},
  {op:"msgbox",args:["Route132_Text_DanaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_RONALD","Route132_Text_RonaldIntro","Route132_Text_RonaldDefeat"]},
  {op:"msgbox",args:["Route132_Text_RonaldPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KIYO","Route132_Text_KiyoIntro","Route132_Text_KiyoDefeat"]},
  {op:"msgbox",args:["Route132_Text_KiyoPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_PAXTON","Route132_Text_PaxtonIntro","Route132_Text_PaxtonDefeat"]},
  {op:"msgbox",args:["Route132_Text_PaxtonPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DARCY","Route132_Text_DarcyIntro","Route132_Text_DarcyDefeat"]},
  {op:"msgbox",args:["Route132_Text_DarcyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_JONATHAN","Route132_Text_JonathanIntro","Route132_Text_JonathanDefeat"]},
  {op:"msgbox",args:["Route132_Text_JonathanPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_MAKAYLA","Route132_Text_MakaylaIntro","Route132_Text_MakaylaDefeat"]},
  {op:"msgbox",args:["Route132_Text_MakaylaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
