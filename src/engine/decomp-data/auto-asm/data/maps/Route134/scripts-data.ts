// AUTO-GENERATED from data/maps/Route134/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route134/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route134_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route134_OnResume', isGlobal: false, instrIndex: 1 },
  { name: 'Route134_EventScript_Jack', isGlobal: true, instrIndex: 3 },
  { name: 'Route134_EventScript_Laurel', isGlobal: true, instrIndex: 6 },
  { name: 'Route134_EventScript_Alex', isGlobal: true, instrIndex: 9 },
  { name: 'Route134_EventScript_Aaron', isGlobal: true, instrIndex: 12 },
  { name: 'Route134_EventScript_Hitoshi', isGlobal: true, instrIndex: 15 },
  { name: 'Route134_EventScript_Hudson', isGlobal: true, instrIndex: 18 },
  { name: 'Route134_EventScript_Reyna', isGlobal: true, instrIndex: 21 },
  { name: 'Route134_EventScript_Marley', isGlobal: true, instrIndex: 24 },
  { name: 'Route134_EventScript_Kelvin', isGlobal: true, instrIndex: 27 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","Route134_OnResume"]},
  {op:"setdivewarp",args:["MAP_UNDERWATER_ROUTE134",8,6]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_JACK","Route134_Text_JackIntro","Route134_Text_JackDefeat"]},
  {op:"msgbox",args:["Route134_Text_JackPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_LAUREL","Route134_Text_LaurelIntro","Route134_Text_LaurelDefeat"]},
  {op:"msgbox",args:["Route134_Text_LaurelPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ALEX","Route134_Text_AlexIntro","Route134_Text_AlexDefeat"]},
  {op:"msgbox",args:["Route134_Text_AlexPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_AARON","Route134_Text_AaronIntro","Route134_Text_AaronDefeat"]},
  {op:"msgbox",args:["Route134_Text_AaronPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_HITOSHI","Route134_Text_HitoshiIntro","Route134_Text_HitoshiDefeat"]},
  {op:"msgbox",args:["Route134_Text_HitoshiPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_HUDSON","Route134_Text_HudsonIntro","Route134_Text_HudsonDefeat"]},
  {op:"msgbox",args:["Route134_Text_HudsonPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_REYNA","Route134_Text_ReynaIntro","Route134_Text_ReynaDefeat"]},
  {op:"msgbox",args:["Route134_Text_ReynaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_MARLEY","Route134_Text_MarleyIntro","Route134_Text_MarleyDefeat"]},
  {op:"msgbox",args:["Route134_Text_MarleyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KELVIN","Route134_Text_KelvinIntro","Route134_Text_KelvinDefeat"]},
  {op:"msgbox",args:["Route134_Text_KelvinPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
