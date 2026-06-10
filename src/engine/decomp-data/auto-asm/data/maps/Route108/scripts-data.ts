// AUTO-GENERATED from data/maps/Route108/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route108/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route108_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route108_EventScript_Jerome', isGlobal: true, instrIndex: 0 },
  { name: 'Route108_EventScript_Matthew', isGlobal: true, instrIndex: 3 },
  { name: 'Route108_EventScript_Tara', isGlobal: true, instrIndex: 6 },
  { name: 'Route108_EventScript_Missy', isGlobal: true, instrIndex: 9 },
  { name: 'Route108_EventScript_Carolina', isGlobal: true, instrIndex: 12 },
  { name: 'Route108_EventScript_Cory', isGlobal: true, instrIndex: 15 },
  { name: 'Route108_EventScript_CoryRegisterMatchCallAfterBattle', isGlobal: true, instrIndex: 21 },
  { name: 'Route108_EventScript_CoryRematch', isGlobal: true, instrIndex: 27 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_JEROME","Route108_Text_JeromeIntro","Route108_Text_JeromeDefeated"]},
  {op:"msgbox",args:["Route108_Text_JeromePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_MATTHEW","Route108_Text_MatthewIntro","Route108_Text_MatthewDefeated"]},
  {op:"msgbox",args:["Route108_Text_MatthewPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_TARA","Route108_Text_TaraIntro","Route108_Text_TaraDefeated"]},
  {op:"msgbox",args:["Route108_Text_TaraPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_MISSY","Route108_Text_MissyIntro","Route108_Text_MissyDefeated"]},
  {op:"msgbox",args:["Route108_Text_MissyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CAROLINA","Route108_Text_CarolinaIntro","Route108_Text_CarolinaDefeated"]},
  {op:"msgbox",args:["Route108_Text_CarolinaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CORY_1","Route108_Text_CoryIntro","Route108_Text_CoryDefeated","Route108_EventScript_CoryRegisterMatchCallAfterBattle"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route108_EventScript_CoryRematch"]},
  {op:"msgbox",args:["Route108_Text_CoryPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route108_Text_CoryRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_CORY_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_CORY_1","Route108_Text_CoryRematchIntro","Route108_Text_CoryRematchDefeated"]},
  {op:"msgbox",args:["Route108_Text_CoryRematchPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
