// AUTO-GENERATED from data/maps/SootopolisCity_MysteryEventsHouse_B1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_MysteryEventsHouse_B1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_OnFrame', isGlobal: false, instrIndex: 4 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleVisitingTrainer', isGlobal: true, instrIndex: 5 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleTie', isGlobal: true, instrIndex: 27 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleWon', isGlobal: true, instrIndex: 30 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleLost', isGlobal: true, instrIndex: 35 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerEnterBasement', isGlobal: false, instrIndex: 40 },
  { name: 'SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerExitBasement', isGlobal: false, instrIndex: 46 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 54 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SootopolisCity_MysteryEventsHouse_B1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","SootopolisCity_MysteryEventsHouse_B1F_OnFrame"]},
  {op:"special",args:["SetEReaderTrainerGfxId"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleVisitingTrainer"]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerEnterBasement"]},
  {op:"waitmovement",args:[0]},
  {op:"special",args:["CopyEReaderTrainerGreeting"]},
  {op:"msgbox",args:["gStringVar4","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"setvar",args:["VAR_0x8004","SPECIAL_BATTLE_EREADER"]},
  {op:"setvar",args:["VAR_0x8005",0]},
  {op:"special",args:["DoSpecialTrainerBattle"]},
  {op:"call_if_eq",args:["VAR_RESULT","B_OUTCOME_DREW","SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleTie"]},
  {op:"call_if_eq",args:["VAR_RESULT","B_OUTCOME_WON","SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleWon"]},
  {op:"call_if_eq",args:["VAR_RESULT","B_OUTCOME_LOST","SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleLost"]},
  {op:"closemessage",args:[]},
  {op:"special",args:["HealPlayerParty"]},
  {op:"applymovement",args:["LOCALID_PLAYER","SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerExitBasement"]},
  {op:"waitmovement",args:[0]},
  {op:"special",args:["LoadPlayerParty"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"warp",args:["MAP_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_1F",3,1]},
  {op:"waitstate",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE",3]},
  {op:"msgbox",args:["SootopolisCity_MysteryEventsHouse_B1F_Text_MatchEndedUpDraw","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE",1]},
  {op:"special",args:["ShowFieldMessageStringVar4"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE",2]},
  {op:"special",args:["ShowFieldMessageStringVar4"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"return",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"delay_8",args:[]},
  {op:"step_end",args:[]},
] as const;
