// AUTO-GENERATED from data/maps/Route127/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route127/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route127_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route127_OnTransition', isGlobal: false, instrIndex: 3 },
  { name: 'Route127_OnLoad', isGlobal: false, instrIndex: 8 },
  { name: 'Route127_OnFrame', isGlobal: false, instrIndex: 11 },
  { name: 'Route127_EventScript_Camden', isGlobal: true, instrIndex: 12 },
  { name: 'Route127_EventScript_Donny', isGlobal: true, instrIndex: 15 },
  { name: 'Route127_EventScript_Jonah', isGlobal: true, instrIndex: 18 },
  { name: 'Route127_EventScript_Henry', isGlobal: true, instrIndex: 21 },
  { name: 'Route127_EventScript_Roger', isGlobal: true, instrIndex: 24 },
  { name: 'Route127_EventScript_Aidan', isGlobal: true, instrIndex: 27 },
  { name: 'Route127_EventScript_Athena', isGlobal: true, instrIndex: 30 },
  { name: 'Route127_EventScript_Koji', isGlobal: true, instrIndex: 33 },
  { name: 'Route127_EventScript_RegisterKoji', isGlobal: true, instrIndex: 39 },
  { name: 'Route127_EventScript_RematchKoji', isGlobal: true, instrIndex: 45 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 48 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route127_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","Route127_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","Route127_OnFrame"]},
  {op:"call_if_set",args:["FLAG_SYS_WEATHER_CTRL","Common_EventScript_SetAbnormalWeather"]},
  {op:"call_if_eq",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_HideMapNamePopup"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_127_NORTH","AbnormalWeather_StartKyogreWeather"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_127_SOUTH","AbnormalWeather_StartKyogreWeather"]},
  {op:"end",args:[]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_127_NORTH","AbnormalWeather_EventScript_PlaceTilesRoute127North"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_127_SOUTH","AbnormalWeather_EventScript_PlaceTilesRoute127South"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_EndEventAndCleanup_1"]},
  {op:"trainerbattle_single",args:["TRAINER_CAMDEN","Route127_Text_CamdenIntro","Route127_Text_CamdenDefeat"]},
  {op:"msgbox",args:["Route127_Text_CamdenPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DONNY","Route127_Text_DonnyIntro","Route127_Text_DonnyDefeat"]},
  {op:"msgbox",args:["Route127_Text_DonnyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_JONAH","Route127_Text_JonahIntro","Route127_Text_JonahDefeat"]},
  {op:"msgbox",args:["Route127_Text_JonahPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_HENRY","Route127_Text_HenryIntro","Route127_Text_HenryDefeat"]},
  {op:"msgbox",args:["Route127_Text_HenryPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ROGER","Route127_Text_RogerIntro","Route127_Text_RogerDefeat"]},
  {op:"msgbox",args:["Route127_Text_RogerPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_AIDAN","Route127_Text_AidanIntro","Route127_Text_AidanDefeat"]},
  {op:"msgbox",args:["Route127_Text_AidanPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ATHENA","Route127_Text_AthenaIntro","Route127_Text_AthenaDefeat"]},
  {op:"msgbox",args:["Route127_Text_AthenaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KOJI_1","Route127_Text_KojiIntro","Route127_Text_KojiDefeat","Route127_EventScript_RegisterKoji"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route127_EventScript_RematchKoji"]},
  {op:"msgbox",args:["Route127_Text_KojiPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route127_Text_KojiRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_KOJI_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_KOJI_1","Route127_Text_KojiRematchIntro","Route127_Text_KojiRematchDefeat"]},
  {op:"msgbox",args:["Route127_Text_KojiPostRematch","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
