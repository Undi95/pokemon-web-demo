// AUTO-GENERATED from data/maps/Route107/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route107/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route107_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route107_EventScript_Darrin', isGlobal: true, instrIndex: 0 },
  { name: 'Route107_EventScript_Tony', isGlobal: true, instrIndex: 3 },
  { name: 'Route107_EventScript_TonyRegisterMatchCallAfterBattle', isGlobal: true, instrIndex: 9 },
  { name: 'Route107_EventScript_TonyRematch', isGlobal: true, instrIndex: 15 },
  { name: 'Route107_EventScript_Denise', isGlobal: true, instrIndex: 18 },
  { name: 'Route107_EventScript_Beth', isGlobal: true, instrIndex: 21 },
  { name: 'Route107_EventScript_Lisa', isGlobal: true, instrIndex: 24 },
  { name: 'Route107_EventScript_Ray', isGlobal: true, instrIndex: 27 },
  { name: 'Route107_EventScript_Camron', isGlobal: true, instrIndex: 30 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 33 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_DARRIN","Route107_Text_DarrinIntro","Route107_Text_DarrinDefeated"]},
  {op:"msgbox",args:["Route107_Text_DarrinPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_TONY_1","Route107_Text_TonyIntro","Route107_Text_TonyDefeated","Route107_EventScript_TonyRegisterMatchCallAfterBattle"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route107_EventScript_TonyRematch"]},
  {op:"msgbox",args:["Route107_Text_TonyPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route107_Text_TonyRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_TONY_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_TONY_1","Route107_Text_TonyRematchIntro","Route107_Text_TonyRematchDefeated"]},
  {op:"msgbox",args:["Route107_Text_TonyRematchPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DENISE","Route107_Text_DeniseIntro","Route107_Text_DeniseDefeated"]},
  {op:"msgbox",args:["Route107_Text_DenisePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_BETH","Route107_Text_BethIntro","Route107_Text_BethDefeated"]},
  {op:"msgbox",args:["Route107_Text_BethPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_double",args:["TRAINER_LISA_AND_RAY","Route107_Text_LisaIntro","Route107_Text_LisaDefeated","Route107_Text_LisaNotEnoughPokemon"]},
  {op:"msgbox",args:["Route107_Text_LisaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_double",args:["TRAINER_LISA_AND_RAY","Route107_Text_RayIntro","Route107_Text_RayDefeated","Route107_Text_RayNotEnoughPokemon"]},
  {op:"msgbox",args:["Route107_Text_RayPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CAMRON","Route107_Text_CamronIntro","Route107_Text_CamronDefeated"]},
  {op:"msgbox",args:["Route107_Text_CamronPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
