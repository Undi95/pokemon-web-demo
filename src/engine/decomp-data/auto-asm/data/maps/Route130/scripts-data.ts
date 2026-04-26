// AUTO-GENERATED from data/maps/Route130/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route130/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route130_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route130_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route130_EventScript_SetMirageIslandLayout', isGlobal: true, instrIndex: 21 },
  { name: 'Route130_EventScript_CheckSetAbnormalWeather', isGlobal: true, instrIndex: 23 },
  { name: 'Route130_EventScript_Rodney', isGlobal: true, instrIndex: 25 },
  { name: 'Route130_EventScript_Katie', isGlobal: true, instrIndex: 28 },
  { name: 'Route130_EventScript_Santiago', isGlobal: true, instrIndex: 31 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 34 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route130_OnTransition"]},
  {op:"call_if_ge",args:["VAR_SOOTOPOLIS_CITY_STATE",4,"Route130_EventScript_CheckSetAbnormalWeather"]},
  {op:"specialvar",args:["VAR_RESULT","IsMirageIslandPresent"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route130_EventScript_SetMirageIslandLayout"]},
  {op:"setflag",args:["FLAG_TEMP_HIDE_MIRAGE_ISLAND_BERRY_TREE"]},
  {op:"setflag",args:["FLAG_TEMP_12"]},
  {op:"setflag",args:["FLAG_TEMP_13"]},
  {op:"setflag",args:["FLAG_TEMP_14"]},
  {op:"setflag",args:["FLAG_TEMP_15"]},
  {op:"setflag",args:["FLAG_TEMP_16"]},
  {op:"setflag",args:["FLAG_TEMP_17"]},
  {op:"setflag",args:["FLAG_TEMP_18"]},
  {op:"setflag",args:["FLAG_TEMP_19"]},
  {op:"setflag",args:["FLAG_TEMP_1A"]},
  {op:"setflag",args:["FLAG_TEMP_1B"]},
  {op:"setflag",args:["FLAG_TEMP_1C"]},
  {op:"setflag",args:["FLAG_TEMP_1D"]},
  {op:"setflag",args:["FLAG_TEMP_1E"]},
  {op:"setflag",args:["FLAG_TEMP_1F"]},
  {op:"setmaplayoutindex",args:["LAYOUT_ROUTE130"]},
  {op:"end",args:[]},
  {op:"setmaplayoutindex",args:["LAYOUT_ROUTE130_MIRAGE_ISLAND"]},
  {op:"end",args:[]},
  {op:"call_if_set",args:["FLAG_SYS_WEATHER_CTRL","Common_EventScript_SetAbnormalWeather"]},
  {op:"return",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_RODNEY","Route130_Text_RodneyIntro","Route130_Text_RodneyDefeat"]},
  {op:"msgbox",args:["Route130_Text_RodneyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KATIE","Route130_Text_KatieIntro","Route130_Text_KatieDefeat"]},
  {op:"msgbox",args:["Route130_Text_KatiePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SANTIAGO","Route130_Text_SantiagoIntro","Route130_Text_SantiagoDefeat"]},
  {op:"msgbox",args:["Route130_Text_SantiagoPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
