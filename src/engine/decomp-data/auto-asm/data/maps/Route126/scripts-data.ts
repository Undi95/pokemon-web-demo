// AUTO-GENERATED from data/maps/Route126/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route126/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route126_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route126_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route126_EventScript_Barry', isGlobal: true, instrIndex: 3 },
  { name: 'Route126_EventScript_Dean', isGlobal: true, instrIndex: 6 },
  { name: 'Route126_EventScript_Nikki', isGlobal: true, instrIndex: 9 },
  { name: 'Route126_EventScript_Brenda', isGlobal: true, instrIndex: 12 },
  { name: 'Route126_EventScript_Leonardo', isGlobal: true, instrIndex: 15 },
  { name: 'Route126_EventScript_Isobel', isGlobal: true, instrIndex: 18 },
  { name: 'Route126_EventScript_Sienna', isGlobal: true, instrIndex: 21 },
  { name: 'Route126_EventScript_Pablo', isGlobal: true, instrIndex: 24 },
  { name: 'Route126_EventScript_RegisterPablo', isGlobal: true, instrIndex: 30 },
  { name: 'Route126_EventScript_RematchPablo', isGlobal: true, instrIndex: 36 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 39 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route126_OnTransition"]},
  {op:"call_if_set",args:["FLAG_SYS_WEATHER_CTRL","Common_EventScript_SetAbnormalWeather"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_BARRY","Route126_Text_BarryIntro","Route126_Text_BarryDefeat"]},
  {op:"msgbox",args:["Route126_Text_BarryPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DEAN","Route126_Text_DeanIntro","Route126_Text_DeanDefeat"]},
  {op:"msgbox",args:["Route126_Text_DeanPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_NIKKI","Route126_Text_NikkiIntro","Route126_Text_NikkiDefeat"]},
  {op:"msgbox",args:["Route126_Text_NikkiPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_BRENDA","Route126_Text_BrendaIntro","Route126_Text_BrendaDefeat"]},
  {op:"msgbox",args:["Route126_Text_BrendaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_LEONARDO","Route126_Text_LeonardoIntro","Route126_Text_LeonardoDefeat"]},
  {op:"msgbox",args:["Route126_Text_LeonardoPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ISOBEL","Route126_Text_IsobelIntro","Route126_Text_IsobelDefeat"]},
  {op:"msgbox",args:["Route126_Text_IsobelPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SIENNA","Route126_Text_SiennaIntro","Route126_Text_SiennaDefeat"]},
  {op:"msgbox",args:["Route126_Text_SiennaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_PABLO_1","Route126_Text_PabloIntro","Route126_Text_PabloDefeat","Route126_EventScript_RegisterPablo"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route126_EventScript_RematchPablo"]},
  {op:"msgbox",args:["Route126_Text_PabloPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route126_Text_PabloRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_PABLO_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_PABLO_1","Route126_Text_PabloRematchIntro","Route126_Text_PabloRematchDefeat"]},
  {op:"msgbox",args:["Route126_Text_PabloPostRematch","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
