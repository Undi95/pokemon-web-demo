// AUTO-GENERATED from data/maps/Route125/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route125/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route125_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route125_OnTransition', isGlobal: false, instrIndex: 3 },
  { name: 'Route125_OnLoad', isGlobal: false, instrIndex: 8 },
  { name: 'Route125_OnFrame', isGlobal: false, instrIndex: 11 },
  { name: 'Route125_EventScript_Nolen', isGlobal: true, instrIndex: 12 },
  { name: 'Route125_EventScript_Stan', isGlobal: true, instrIndex: 15 },
  { name: 'Route125_EventScript_Tanya', isGlobal: true, instrIndex: 18 },
  { name: 'Route125_EventScript_Sharon', isGlobal: true, instrIndex: 21 },
  { name: 'Route125_EventScript_Ernest', isGlobal: true, instrIndex: 24 },
  { name: 'Route125_EventScript_RegisterErnest', isGlobal: true, instrIndex: 30 },
  { name: 'Route125_EventScript_RematchErnest', isGlobal: true, instrIndex: 36 },
  { name: 'Route125_EventScript_Kim', isGlobal: true, instrIndex: 39 },
  { name: 'Route125_EventScript_Iris', isGlobal: true, instrIndex: 42 },
  { name: 'Route125_EventScript_Presley', isGlobal: true, instrIndex: 45 },
  { name: 'Route125_EventScript_Auron', isGlobal: true, instrIndex: 48 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 51 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route125_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","Route125_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","Route125_OnFrame"]},
  {op:"call_if_set",args:["FLAG_SYS_WEATHER_CTRL","Common_EventScript_SetAbnormalWeather"]},
  {op:"call_if_eq",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_HideMapNamePopup"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_125_WEST","AbnormalWeather_StartKyogreWeather"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_125_EAST","AbnormalWeather_StartKyogreWeather"]},
  {op:"end",args:[]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_125_WEST","AbnormalWeather_EventScript_PlaceTilesRoute125West"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_125_EAST","AbnormalWeather_EventScript_PlaceTilesRoute125East"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_EndEventAndCleanup_1"]},
  {op:"trainerbattle_single",args:["TRAINER_NOLEN","Route125_Text_NolenIntro","Route125_Text_NolenDefeat"]},
  {op:"msgbox",args:["Route125_Text_NolenPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_STAN","Route125_Text_StanIntro","Route125_Text_StanDefeat"]},
  {op:"msgbox",args:["Route125_Text_StanPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_TANYA","Route125_Text_TanyaIntro","Route125_Text_TanyaDefeat"]},
  {op:"msgbox",args:["Route125_Text_TanyaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SHARON","Route125_Text_SharonIntro","Route125_Text_SharonDefeat"]},
  {op:"msgbox",args:["Route125_Text_SharonPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ERNEST_1","Route125_Text_ErnestIntro","Route125_Text_ErnestDefeat","Route125_EventScript_RegisterErnest"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route125_EventScript_RematchErnest"]},
  {op:"msgbox",args:["Route125_Text_ErnestPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route125_Text_ErnestRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_ERNEST_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_ERNEST_1","Route125_Text_ErnestRematchIntro","Route125_Text_ErnestRematchDefeat"]},
  {op:"msgbox",args:["Route125_Text_ErnestRematchPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_double",args:["TRAINER_KIM_AND_IRIS","Route125_Text_KimIntro","Route125_Text_KimDefeat","Route125_Text_KimNotEnoughMons"]},
  {op:"msgbox",args:["Route125_Text_KimPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_double",args:["TRAINER_KIM_AND_IRIS","Route125_Text_IrisIntro","Route125_Text_IrisDefeat","Route125_Text_IrisNotEnoughMons"]},
  {op:"msgbox",args:["Route125_Text_IrisPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_PRESLEY","Route125_Text_PresleyIntro","Route125_Text_PresleyDefeat"]},
  {op:"msgbox",args:["Route125_Text_PresleyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_AURON","Route125_Text_AuronIntro","Route125_Text_AuronDefeat"]},
  {op:"msgbox",args:["Route125_Text_AuronPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
