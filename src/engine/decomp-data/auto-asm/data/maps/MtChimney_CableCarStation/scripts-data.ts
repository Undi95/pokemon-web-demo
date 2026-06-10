// AUTO-GENERATED from data/maps/MtChimney_CableCarStation/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MtChimney_CableCarStation/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MtChimney_CableCarStation_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MtChimney_CableCarStation_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'MtChimney_CableCarStation_EventScript_MoveAttendantAside', isGlobal: true, instrIndex: 4 },
  { name: 'MtChimney_CableCarStation_OnFrame', isGlobal: false, instrIndex: 7 },
  { name: 'MtChimney_CableCarStation_EventScript_ExitCableCar', isGlobal: true, instrIndex: 8 },
  { name: 'MtChimney_CableCarStation_EventScript_Attendant', isGlobal: true, instrIndex: 17 },
  { name: 'MtChimney_CableCarStation_EventScript_RideCableCar', isGlobal: true, instrIndex: 23 },
  { name: 'MtChimney_CableCarStation_EventScript_DeclineRide', isGlobal: true, instrIndex: 35 },
  { name: 'MtChimney_CableCarStation_Movement_LeadPlayerToCableCar', isGlobal: false, instrIndex: 38 },
  { name: 'MtChimney_CableCarStation_Movement_FollowPlayerOutFromCableCar', isGlobal: false, instrIndex: 43 },
  { name: 'MtChimney_CableCarStation_Movement_BoardCableCar', isGlobal: false, instrIndex: 48 },
  { name: 'MtChimney_CableCarStation_Movement_ExitCableCar', isGlobal: false, instrIndex: 53 },
  { name: 'MtChimney_CableCarStation_Text_CableCarReadyGetOn', isGlobal: false, instrIndex: 58 },
  { name: 'MtChimney_CableCarStation_Text_StepThisWay', isGlobal: false, instrIndex: 58 },
  { name: 'MtChimney_CableCarStation_Text_RideAnotherTime', isGlobal: false, instrIndex: 58 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Le TELEPHERIQUE est sur le point\\n\""] },
  { kind: '.string', vals: ["\"de descendre. Voulez-vous l'emprunter?$\""] },
  { kind: '.string', vals: ["\"Entrez, je vous en prie.$\""] },
  { kind: '.string', vals: ["\"N'hésitez pas à revenir nous voir.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 58 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","MtChimney_CableCarStation_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","MtChimney_CableCarStation_OnFrame"]},
  {op:"call_if_eq",args:["VAR_CABLE_CAR_STATION_STATE",1,"MtChimney_CableCarStation_EventScript_MoveAttendantAside"]},
  {op:"end",args:[]},
  {op:"setobjectxyperm",args:["LOCALID_MT_CHIMNEY_CABLE_CAR_ATTENDANT",5,4]},
  {op:"setobjectmovementtype",args:["LOCALID_MT_CHIMNEY_CABLE_CAR_ATTENDANT","MOVEMENT_TYPE_FACE_RIGHT"]},
  {op:"return",args:[]},
  {op:"map_script_2",args:["VAR_CABLE_CAR_STATION_STATE",1,"MtChimney_CableCarStation_EventScript_ExitCableCar"]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","MtChimney_CableCarStation_Movement_ExitCableCar"]},
  {op:"applymovement",args:["LOCALID_MT_CHIMNEY_CABLE_CAR_ATTENDANT","MtChimney_CableCarStation_Movement_FollowPlayerOutFromCableCar"]},
  {op:"waitmovement",args:[0]},
  {op:"setvar",args:["VAR_CABLE_CAR_STATION_STATE",0]},
  {op:"setobjectxyperm",args:["LOCALID_MT_CHIMNEY_CABLE_CAR_ATTENDANT",6,7]},
  {op:"setobjectmovementtype",args:["LOCALID_MT_CHIMNEY_CABLE_CAR_ATTENDANT","MOVEMENT_TYPE_FACE_DOWN"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["MtChimney_CableCarStation_Text_CableCarReadyGetOn","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","MtChimney_CableCarStation_EventScript_RideCableCar"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","MtChimney_CableCarStation_EventScript_DeclineRide"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MtChimney_CableCarStation_Text_StepThisWay","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_MT_CHIMNEY_CABLE_CAR_ATTENDANT","MtChimney_CableCarStation_Movement_LeadPlayerToCableCar"]},
  {op:"applymovement",args:["LOCALID_PLAYER","MtChimney_CableCarStation_Movement_BoardCableCar"]},
  {op:"waitmovement",args:[0]},
  {op:"setvar",args:["VAR_0x8004",1]},
  {op:"setvar",args:["VAR_CABLE_CAR_STATION_STATE",2]},
  {op:"incrementgamestat",args:["GAME_STAT_RODE_CABLE_CAR"]},
  {op:"special",args:["CableCarWarp"]},
  {op:"special",args:["CableCar"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MtChimney_CableCarStation_Text_RideAnotherTime","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_in_place_faster_right",args:[]},
  {op:"step_end",args:[]},
  {op:"delay_16",args:[]},
  {op:"walk_right",args:[]},
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
