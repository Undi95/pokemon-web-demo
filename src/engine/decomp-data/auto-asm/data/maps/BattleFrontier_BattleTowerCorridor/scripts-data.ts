// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerCorridor/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_BattleTowerCorridor/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_BattleTowerCorridor_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_BattleTowerCorridor_OnLoad', isGlobal: false, instrIndex: 2 },
  { name: 'BattleFrontier_BattleTowerCorridor_EventScript_OpenFarDoor', isGlobal: true, instrIndex: 6 },
  { name: 'BattleFrontier_BattleTowerCorridor_OnFrame', isGlobal: false, instrIndex: 9 },
  { name: 'BattleFrontier_BattleTowerCorridor_EventScript_EnterCorridor', isGlobal: true, instrIndex: 10 },
  { name: 'BattleFrontier_BattleTowerCorridor_EventScript_WalkToFarDoor', isGlobal: true, instrIndex: 16 },
  { name: 'BattleFrontier_BattleTowerCorridor_EventScript_WarpToBattleRoom', isGlobal: true, instrIndex: 19 },
  { name: 'BattleFrontier_BattleTowerCorridor_Movement_PlayerWalkToFarDoor', isGlobal: false, instrIndex: 23 },
  { name: 'BattleFrontier_BattleTowerCorridor_Movement_AttendantWalkToFarDoor', isGlobal: false, instrIndex: 24 },
  { name: 'BattleFrontier_BattleTowerCorridor_Movement_PlayerWalkToDoor', isGlobal: false, instrIndex: 26 },
  { name: 'BattleFrontier_BattleTowerCorridor_Movement_AttendantWalkToDoor', isGlobal: false, instrIndex: 27 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 33 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","BattleFrontier_BattleTowerCorridor_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","BattleFrontier_BattleTowerCorridor_OnFrame"]},
  {op:"goto_if_eq",args:["VAR_0x8006",1,"BattleFrontier_BattleTowerCorridor_EventScript_OpenFarDoor"]},
  {op:"setmetatile",args:[12,0,"METATILE_BattleFrontier_CorridorOpenDoor_Top",0]},
  {op:"setmetatile",args:[12,1,"METATILE_BattleFrontier_CorridorOpenDoor_Bottom",0]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[15,0,"METATILE_BattleFrontier_CorridorOpenDoor_Top",0]},
  {op:"setmetatile",args:[15,1,"METATILE_BattleFrontier_CorridorOpenDoor_Bottom",0]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"BattleFrontier_BattleTowerCorridor_EventScript_EnterCorridor"]},
  {op:"setvar",args:["VAR_TEMP_0",1]},
  {op:"goto_if_eq",args:["VAR_0x8006",1,"BattleFrontier_BattleTowerCorridor_EventScript_WalkToFarDoor"]},
  {op:"applymovement",args:["LOCALID_TOWER_CORRIDOR_ATTENDANT","BattleFrontier_BattleTowerCorridor_Movement_AttendantWalkToDoor"]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattleTowerCorridor_Movement_PlayerWalkToDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"goto",args:["BattleFrontier_BattleTowerCorridor_EventScript_WarpToBattleRoom"]},
  {op:"applymovement",args:["LOCALID_TOWER_CORRIDOR_ATTENDANT","BattleFrontier_BattleTowerCorridor_Movement_AttendantWalkToFarDoor"]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattleTowerCorridor_Movement_PlayerWalkToFarDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"setvar",args:["VAR_TEMP_0",0]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_TOWER_BATTLE_ROOM",4,8]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_up",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
] as const;
