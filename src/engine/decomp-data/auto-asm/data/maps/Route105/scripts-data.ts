// AUTO-GENERATED from data/maps/Route105/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route105/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route105_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route105_OnLoad', isGlobal: false, instrIndex: 3 },
  { name: 'Route105_CloseRegiEntrance', isGlobal: true, instrIndex: 7 },
  { name: 'Route105_OnTransition', isGlobal: false, instrIndex: 10 },
  { name: 'Route105_OnFrame', isGlobal: false, instrIndex: 14 },
  { name: 'Route105_EventScript_Foster', isGlobal: true, instrIndex: 15 },
  { name: 'Route105_EventScript_Luis', isGlobal: true, instrIndex: 18 },
  { name: 'Route105_EventScript_Dominik', isGlobal: true, instrIndex: 21 },
  { name: 'Route105_EventScript_Beverly', isGlobal: true, instrIndex: 24 },
  { name: 'Route105_EventScript_Imani', isGlobal: true, instrIndex: 27 },
  { name: 'Route105_EventScript_Josue', isGlobal: true, instrIndex: 30 },
  { name: 'Route105_EventScript_Andres', isGlobal: true, instrIndex: 33 },
  { name: 'Route105_EventScript_AndresRegisterMatchCallAfterBattle', isGlobal: true, instrIndex: 39 },
  { name: 'Route105_EventScript_AndresRematch', isGlobal: true, instrIndex: 45 },
  { name: 'Route104_Text_DadPokenavCall', isGlobal: false, instrIndex: 48 },
  { name: 'Route104_Text_RegisteredDadInPokenav', isGlobal: false, instrIndex: 48 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1, .string=17
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"… … … … … …\\n\""] },
  { kind: '.string', vals: ["\"… … … … … Bip!\\p\""] },
  { kind: '.string', vals: ["\"PAPA: Oh, {PLAYER}?\\p\""] },
  { kind: '.string', vals: ["\"… … … … … …\\p\""] },
  { kind: '.string', vals: ["\"Où es-tu, on dirait que le vent\\n\""] },
  { kind: '.string', vals: ["\"souffle fort là où tu te trouves.\\p\""] },
  { kind: '.string', vals: ["\"M. ROCHARD de DEVON vient de me\\n\""] },
  { kind: '.string', vals: ["\"parler de ton POKéNAV, alors je me\\l\""] },
  { kind: '.string', vals: ["\"suis dit que je devrais t'appeler!\\p\""] },
  { kind: '.string', vals: ["\"On dirait que tu vas plutôt bien,\\n\""] },
  { kind: '.string', vals: ["\"je n'ai pas vraiment de raisons de\\l\""] },
  { kind: '.string', vals: ["\"m'inquiéter à ce que je vois.\\p\""] },
  { kind: '.string', vals: ["\"Fais attention à toi.\\p\""] },
  { kind: '.string', vals: ["\"… … … … … …\\n\""] },
  { kind: '.string', vals: ["\"… … … … … Clic!$\""] },
  { kind: '.string', vals: ["\"Vous avez enregistré PAPA NORMAN\\n\""] },
  { kind: '.string', vals: ["\"dans le POKéNAV.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 48 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","Route105_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route105_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","Route105_OnFrame"]},
  {op:"call_if_unset",args:["FLAG_REGI_DOORS_OPENED","Route105_CloseRegiEntrance"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_105_NORTH","AbnormalWeather_EventScript_PlaceTilesRoute105North"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_105_SOUTH","AbnormalWeather_EventScript_PlaceTilesRoute105South"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[9,19,"METATILE_General_RockWall_RockBase",1]},
  {op:"setmetatile",args:[9,20,"METATILE_General_RockWall_SandBase",1]},
  {op:"return",args:[]},
  {op:"call_if_eq",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_HideMapNamePopup"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_105_NORTH","AbnormalWeather_StartKyogreWeather"]},
  {op:"call_if_eq",args:["VAR_ABNORMAL_WEATHER_LOCATION","ABNORMAL_WEATHER_ROUTE_105_SOUTH","AbnormalWeather_StartKyogreWeather"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_SHOULD_END_ABNORMAL_WEATHER",1,"AbnormalWeather_EventScript_EndEventAndCleanup_1"]},
  {op:"trainerbattle_single",args:["TRAINER_FOSTER","Route105_Text_FosterIntro","Route105_Text_FosterDefeated"]},
  {op:"msgbox",args:["Route105_Text_FosterPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_LUIS","Route105_Text_LuisIntro","Route105_Text_LuisDefeated"]},
  {op:"msgbox",args:["Route105_Text_LuisPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DOMINIK","Route105_Text_DominikIntro","Route105_Text_DominikDefeated"]},
  {op:"msgbox",args:["Route105_Text_DominikPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_BEVERLY","Route105_Text_BeverlyIntro","Route105_Text_BeverlyDefeated"]},
  {op:"msgbox",args:["Route105_Text_PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_IMANI","Route105_Text_ImaniIntro","Route105_Text_ImaniDefeated"]},
  {op:"msgbox",args:["Route105_Text_ImaniPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_JOSUE","Route105_Text_JosueIntro","Route105_Text_JosueDefeated"]},
  {op:"msgbox",args:["Route105_Text_JosuePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ANDRES_1","Route105_Text_AndresIntro","Route105_Text_AndresDefeated","Route105_EventScript_AndresRegisterMatchCallAfterBattle"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route105_EventScript_AndresRematch"]},
  {op:"msgbox",args:["Route105_Text_AndresPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route105_Text_AndresRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_ANDRES_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_ANDRES_1","Route105_Text_AndresRematchIntro","Route105_Text_AndresRematchDefeated"]},
  {op:"msgbox",args:["Route105_Text_AndresRematchPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
