// AUTO-GENERATED from data/maps/Route131/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route131/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route131_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route131_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route131_EventScript_SetLayout', isGlobal: true, instrIndex: 4 },
  { name: 'Route131_EventScript_CheckSetAbnormalWeather', isGlobal: true, instrIndex: 6 },
  { name: 'Route131_EventScript_Richard', isGlobal: true, instrIndex: 8 },
  { name: 'Route131_EventScript_Herman', isGlobal: true, instrIndex: 11 },
  { name: 'Route131_EventScript_Susie', isGlobal: true, instrIndex: 14 },
  { name: 'Route131_EventScript_Kara', isGlobal: true, instrIndex: 17 },
  { name: 'Route131_EventScript_Reli', isGlobal: true, instrIndex: 20 },
  { name: 'Route131_EventScript_Ian', isGlobal: true, instrIndex: 23 },
  { name: 'Route131_EventScript_Talia', isGlobal: true, instrIndex: 26 },
  { name: 'Route131_EventScript_Kevin', isGlobal: true, instrIndex: 29 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 32 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route131_OnTransition"]},
  {op:"call_if_ge",args:["VAR_SOOTOPOLIS_CITY_STATE",4,"Route131_EventScript_CheckSetAbnormalWeather"]},
  {op:"call",args:["Route131_EventScript_SetLayout"]},
  {op:"end",args:[]},
  {op:"setmaplayoutindex",args:["LAYOUT_ROUTE131_SKY_PILLAR"]},
  {op:"return",args:[]},
  {op:"call_if_set",args:["FLAG_SYS_WEATHER_CTRL","Common_EventScript_SetAbnormalWeather"]},
  {op:"return",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_RICHARD","Route131_Text_RichardIntro","Route131_Text_RichardDefeat"]},
  {op:"msgbox",args:["Route131_Text_RichardPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_HERMAN","Route131_Text_HermanIntro","Route131_Text_HermanDefeat"]},
  {op:"msgbox",args:["Route131_Text_HermanPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SUSIE","Route131_Text_SusieIntro","Route131_Text_SusieDefeat"]},
  {op:"msgbox",args:["Route131_Text_SusiePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KARA","Route131_Text_KaraIntro","Route131_Text_KaraDefeat"]},
  {op:"msgbox",args:["Route131_Text_KaraPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_double",args:["TRAINER_RELI_AND_IAN","Route131_Text_ReliIntro","Route131_Text_ReliDefeat","Route131_Text_ReliNotEnoughMons"]},
  {op:"msgbox",args:["Route131_Text_ReliPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_double",args:["TRAINER_RELI_AND_IAN","Route131_Text_IanIntro","Route131_Text_IanDefeat","Route131_Text_IanNotEnoughMons"]},
  {op:"msgbox",args:["Route131_Text_IanPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_TALIA","Route131_Text_TaliaIntro","Route131_Text_TaliaDefeat"]},
  {op:"msgbox",args:["Route131_Text_TaliaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KEVIN","Route131_Text_KevinIntro","Route131_Text_KevinDefeat"]},
  {op:"msgbox",args:["Route131_Text_KevinPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
