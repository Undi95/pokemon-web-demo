// AUTO-GENERATED from data/maps/Route112_CableCarStation/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route112_CableCarStation/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route112_CableCarStation_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route112_CableCarStation_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'Route112_CableCarStation_EventScript_MoveAttendantAside', isGlobal: true, instrIndex: 5 },
  { name: 'Route112_CableCarStation_OnFrame', isGlobal: false, instrIndex: 8 },
  { name: 'Route112_CableCarStation_EventScript_ExitCableCar', isGlobal: true, instrIndex: 9 },
  { name: 'Route112_CableCarStation_EventScript_Attendant', isGlobal: true, instrIndex: 18 },
  { name: 'Route112_CableCarStation_EventScript_RideCableCar', isGlobal: true, instrIndex: 24 },
  { name: 'Route112_CableCarStation_EventScript_DeclineRide', isGlobal: true, instrIndex: 36 },
  { name: 'Route112_CableCarStation_Movement_LeadPlayerToCableCar', isGlobal: false, instrIndex: 39 },
  { name: 'Route112_CableCarStation_Movement_FollowPlayerOutFromCableCar', isGlobal: false, instrIndex: 44 },
  { name: 'Route112_CableCarStation_Movement_BoardCableCar', isGlobal: false, instrIndex: 49 },
  { name: 'Route112_CableCarStation_Movement_ExitCableCar', isGlobal: false, instrIndex: 54 },
  { name: 'Route112_CableCarStation_Text_CableCarReadyGetOn', isGlobal: false, instrIndex: 59 },
  { name: 'Route112_CableCarStation_Text_StepThisWay', isGlobal: false, instrIndex: 59 },
  { name: 'Route112_CableCarStation_Text_RideAnotherTime', isGlobal: false, instrIndex: 59 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Le TELEPHERIQUE est sur le point\\n\""] },
  { kind: '.string', vals: ["\"de monter. Voulez-vous l'emprunter?$\""] },
  { kind: '.string', vals: ["\"Entrez, je vous en prie.$\""] },
  { kind: '.string', vals: ["\"N'hésitez pas à revenir nous voir.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 59 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route112_CableCarStation_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","Route112_CableCarStation_OnFrame"]},
  {op:"setescapewarp",args:["MAP_ROUTE112",28,28]},
  {op:"call_if_eq",args:["VAR_CABLE_CAR_STATION_STATE",2,"Route112_CableCarStation_EventScript_MoveAttendantAside"]},
  {op:"end",args:[]},
  {op:"setobjectxyperm",args:["LOCALID_ROUTE112_CABLE_CAR_ATTENDANT",7,4]},
  {op:"setobjectmovementtype",args:["LOCALID_ROUTE112_CABLE_CAR_ATTENDANT","MOVEMENT_TYPE_FACE_LEFT"]},
  {op:"return",args:[]},
  {op:"map_script_2",args:["VAR_CABLE_CAR_STATION_STATE",2,"Route112_CableCarStation_EventScript_ExitCableCar"]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Route112_CableCarStation_Movement_ExitCableCar"]},
  {op:"applymovement",args:["LOCALID_ROUTE112_CABLE_CAR_ATTENDANT","Route112_CableCarStation_Movement_FollowPlayerOutFromCableCar"]},
  {op:"waitmovement",args:[0]},
  {op:"setvar",args:["VAR_CABLE_CAR_STATION_STATE",0]},
  {op:"setobjectxyperm",args:["LOCALID_ROUTE112_CABLE_CAR_ATTENDANT",6,7]},
  {op:"setobjectmovementtype",args:["LOCALID_ROUTE112_CABLE_CAR_ATTENDANT","MOVEMENT_TYPE_FACE_DOWN"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["Route112_CableCarStation_Text_CableCarReadyGetOn","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","Route112_CableCarStation_EventScript_RideCableCar"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","Route112_CableCarStation_EventScript_DeclineRide"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route112_CableCarStation_Text_StepThisWay","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_ROUTE112_CABLE_CAR_ATTENDANT","Route112_CableCarStation_Movement_LeadPlayerToCableCar"]},
  {op:"applymovement",args:["LOCALID_PLAYER","Route112_CableCarStation_Movement_BoardCableCar"]},
  {op:"waitmovement",args:[0]},
  {op:"setvar",args:["VAR_0x8004",0]},
  {op:"setvar",args:["VAR_CABLE_CAR_STATION_STATE",1]},
  {op:"incrementgamestat",args:["GAME_STAT_RODE_CABLE_CAR"]},
  {op:"special",args:["CableCarWarp"]},
  {op:"special",args:["CableCar"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route112_CableCarStation_Text_RideAnotherTime","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_in_place_faster_left",args:[]},
  {op:"step_end",args:[]},
  {op:"delay_16",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"delay_16",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"delay_16",args:[]},
  {op:"step_end",args:[]},
] as const;
