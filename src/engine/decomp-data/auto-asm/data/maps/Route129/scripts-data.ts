// AUTO-GENERATED from data/maps/Route129/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route129/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route129_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route129_OnLoad', isGlobal: false, instrIndex: 3 },
  { name: 'Route129_OnTransition', isGlobal: false, instrIndex: 6 },
  { name: 'Route129_EventScript_CheckSetAbnormalWeather', isGlobal: true, instrIndex: 11 },
  { name: 'Route129_OnFrame', isGlobal: false, instrIndex: 13 },
  { name: 'Route129_EventScript_Chase', isGlobal: true, instrIndex: 14 },
  { name: 'Route129_EventScript_Allison', isGlobal: true, instrIndex: 17 },
  { name: 'Route129_EventScript_Reed', isGlobal: true, instrIndex: 20 },
  { name: 'Route129_EventScript_Tisha', isGlobal: true, instrIndex: 23 },
  { name: 'Route129_EventScript_Clarence', isGlobal: true, instrIndex: 26 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 29 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route129_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","Route129_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","Route129_OnFrame"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_129_WEST","AbnormalWeather_EventScript_PlaceTilesRoute129West"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_129_EAST","AbnormalWeather_EventScript_PlaceTilesRoute129East"]},
  {op:"end",args:[]},
  {op:"call_if_eq",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_HideMapNamePopup"]},
  {op:"call_if_ge",args:["VAR_SOOTOPOLIS_CITY_STATE",4,"Route129_EventScript_CheckSetAbnormalWeather"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_129_WEST","AbnormalWeather_StartKyogreWeather"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_129_EAST","AbnormalWeather_StartKyogreWeather"]},
  {op:"end",args:[]},
  {op:"call_if_set",args:["FLAG_SYS_WEATHER_CTRL","Common_EventScript_SetAbnormalWeather"]},
  {op:"return",args:[]},
  {op:"map_script_2",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_EndEventAndCleanup_1"]},
  {op:"trainerbattle_single",args:["TRAINER_CHASE","Route129_Text_ChaseIntro","Route129_Text_ChaseDefeat"]},
  {op:"msgbox",args:["Route129_Text_ChasePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ALLISON","Route129_Text_AllisonIntro","Route129_Text_AllisonDefeat"]},
  {op:"msgbox",args:["Route129_Text_AllisonPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_REED","Route129_Text_ReedIntro","Route129_Text_ReedDefeat"]},
  {op:"msgbox",args:["Route129_Text_ReedPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_TISHA","Route129_Text_TishaIntro","Route129_Text_TishaDefeat"]},
  {op:"msgbox",args:["Route129_Text_TishaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CLARENCE","Route129_Text_ClarenceIntro","Route129_Text_ClarenceDefeat"]},
  {op:"msgbox",args:["Route129_Text_ClarencePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
