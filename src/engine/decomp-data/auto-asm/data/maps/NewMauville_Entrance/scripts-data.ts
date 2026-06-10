// AUTO-GENERATED from data/maps/NewMauville_Entrance/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/NewMauville_Entrance/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'NewMauville_Entrance_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'NewMauville_Entrance_OnLoad', isGlobal: false, instrIndex: 2 },
  { name: 'NewMauville_Entrance_EventScript_CloseDoor', isGlobal: true, instrIndex: 4 },
  { name: 'NewMauville_Entrance_OnTransition', isGlobal: false, instrIndex: 11 },
  { name: 'NewMauville_Entrance_EventScript_Door', isGlobal: true, instrIndex: 13 },
  { name: 'NewMauville_Entrance_EventScript_DontOpenDoor', isGlobal: true, instrIndex: 33 },
  { name: 'NewMauville_Entrance_Text_DoorIsLocked', isGlobal: false, instrIndex: 35 },
  { name: 'NewMauville_Entrance_Text_UseBasementKey', isGlobal: false, instrIndex: 35 },
  { name: 'NewMauville_Entrance_Text_UsedBasementKey', isGlobal: false, instrIndex: 35 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"La porte est fermée.$\""] },
  { kind: '.string', vals: ["\"Utiliser la CLE SOUS-SOL?$\""] },
  { kind: '.string', vals: ["\"{PLAYER} utilise la CLE SOUS-SOL.\\p\""] },
  { kind: '.string', vals: ["\"La porte s'ouvre!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 35 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","NewMauville_Entrance_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","NewMauville_Entrance_OnTransition"]},
  {op:"call_if_eq",args:["VAR_NEW_MAUVILLE_STATE",0,"NewMauville_Entrance_EventScript_CloseDoor"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[3,0,"METATILE_Facility_NewMauvilleDoor_Closed_Tile0",1]},
  {op:"setmetatile",args:[4,0,"METATILE_Facility_NewMauvilleDoor_Closed_Tile1",1]},
  {op:"setmetatile",args:[5,0,"METATILE_Facility_NewMauvilleDoor_Closed_Tile2",1]},
  {op:"setmetatile",args:[3,1,"METATILE_Facility_NewMauvilleDoor_Closed_Tile3",1]},
  {op:"setmetatile",args:[4,1,"METATILE_Facility_NewMauvilleDoor_Closed_Tile4",1]},
  {op:"setmetatile",args:[5,1,"METATILE_Facility_NewMauvilleDoor_Closed_Tile5",1]},
  {op:"return",args:[]},
  {op:"setflag",args:["FLAG_LANDMARK_NEW_MAUVILLE"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_WalkInPlaceFasterUp"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["NewMauville_Entrance_Text_DoorIsLocked","MSGBOX_DEFAULT"]},
  {op:"checkitem",args:["ITEM_BASEMENT_KEY"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"NewMauville_Entrance_EventScript_DontOpenDoor"]},
  {op:"msgbox",args:["NewMauville_Entrance_Text_UseBasementKey","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","NewMauville_Entrance_EventScript_DontOpenDoor"]},
  {op:"msgbox",args:["NewMauville_Entrance_Text_UsedBasementKey","MSGBOX_DEFAULT"]},
  {op:"setmetatile",args:[3,0,"METATILE_Facility_NewMauvilleDoor_Open_Tile0",0]},
  {op:"setmetatile",args:[4,0,"METATILE_Facility_NewMauvilleDoor_Open_Tile1",0]},
  {op:"setmetatile",args:[5,0,"METATILE_Facility_NewMauvilleDoor_Open_Tile2",0]},
  {op:"setmetatile",args:[3,1,"METATILE_Facility_NewMauvilleDoor_Open_Tile3",1]},
  {op:"setmetatile",args:[4,1,"METATILE_Facility_NewMauvilleDoor_Open_Tile4",0]},
  {op:"setmetatile",args:[5,1,"METATILE_Facility_NewMauvilleDoor_Open_Tile5",1]},
  {op:"special",args:["DrawWholeMapView"]},
  {op:"playse",args:["SE_BANG"]},
  {op:"setvar",args:["VAR_NEW_MAUVILLE_STATE",1]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
