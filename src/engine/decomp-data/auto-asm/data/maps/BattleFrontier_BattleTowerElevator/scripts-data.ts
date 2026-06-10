// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerElevator/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_BattleTowerElevator/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_BattleTowerElevator_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_BattleTowerElevator_OnFrame', isGlobal: false, instrIndex: 2 },
  { name: 'BattleFrontier_BattleTowerElevator_EventScript_EnterElevator', isGlobal: true, instrIndex: 3 },
  { name: 'BattleFrontier_BattleTowerElevator_EventScript_WarpToNextRoom', isGlobal: true, instrIndex: 16 },
  { name: 'BattleFrontier_BattleTowerElevator_EventScript_WarpToCorridor', isGlobal: true, instrIndex: 21 },
  { name: 'BattleFrontier_BattleTowerElevator_EventScript_WarpToNextRoomMulti', isGlobal: true, instrIndex: 24 },
  { name: 'BattleFrontier_BattleTowerElevator_EventScript_WarpToCorridorMulti', isGlobal: true, instrIndex: 28 },
  { name: 'BattleFrontier_BattleTowerElevator_EventScript_WarpToPartnerRoom', isGlobal: true, instrIndex: 31 },
  { name: 'BattleFrontier_BattleTowerElevator_Movement_AttendantEnter', isGlobal: false, instrIndex: 34 },
  { name: 'BattleFrontier_BattleTowerElevator_Movement_PlayerEnter', isGlobal: false, instrIndex: 38 },
  { name: 'BattleFrontier_BattleTowerElevator_Movement_AttendantExit', isGlobal: false, instrIndex: 42 },
  { name: 'BattleFrontier_BattleTowerElevator_Movement_PlayerExit', isGlobal: false, instrIndex: 46 },
  { name: 'BattleFrontier_BattleTowerElevator_OnWarp', isGlobal: false, instrIndex: 50 },
  { name: 'BattleFrontier_BattleTowerElevator_EventScript_TurnPlayerNorth', isGlobal: true, instrIndex: 51 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 54 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","BattleFrontier_BattleTowerElevator_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","BattleFrontier_BattleTowerElevator_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"BattleFrontier_BattleTowerElevator_EventScript_EnterElevator"]},
  {op:"setvar",args:["VAR_TEMP_0",1]},
  {op:"applymovement",args:["LOCALID_TOWER_ELEVATOR_ATTENDANT","BattleFrontier_BattleTowerElevator_Movement_AttendantEnter"]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattleTowerElevator_Movement_PlayerEnter"]},
  {op:"waitmovement",args:[0]},
  {op:"special",args:["BufferBattleTowerElevatorFloors"]},
  {op:"waitse",args:[]},
  {op:"special",args:["MoveElevator"]},
  {op:"delay",args:[48]},
  {op:"applymovement",args:["LOCALID_TOWER_ELEVATOR_ATTENDANT","BattleFrontier_BattleTowerElevator_Movement_AttendantExit"]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattleTowerElevator_Movement_PlayerExit"]},
  {op:"waitmovement",args:[0]},
  {op:"call",args:["BattleFrontier_BattleTowerElevator_EventScript_WarpToNextRoom"]},
  {op:"end",args:[]},
  {op:"call_if_eq",args:["VAR_FRONTIER_BATTLE_MODE","FRONTIER_MODE_SINGLES","BattleFrontier_BattleTowerElevator_EventScript_WarpToCorridor"]},
  {op:"call_if_eq",args:["VAR_FRONTIER_BATTLE_MODE","FRONTIER_MODE_DOUBLES","BattleFrontier_BattleTowerElevator_EventScript_WarpToCorridor"]},
  {op:"call_if_eq",args:["VAR_FRONTIER_BATTLE_MODE","FRONTIER_MODE_MULTIS","BattleFrontier_BattleTowerElevator_EventScript_WarpToNextRoomMulti"]},
  {op:"call_if_eq",args:["VAR_FRONTIER_BATTLE_MODE","FRONTIER_MODE_LINK_MULTIS","BattleFrontier_BattleTowerElevator_EventScript_WarpToCorridorMulti"]},
  {op:"return",args:[]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_TOWER_CORRIDOR",8,1]},
  {op:"waitstate",args:[]},
  {op:"return",args:[]},
  {op:"goto_if_unset",args:["FLAG_CHOSEN_MULTI_BATTLE_NPC_PARTNER","BattleFrontier_BattleTowerElevator_EventScript_WarpToPartnerRoom"]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_TOWER_MULTI_CORRIDOR",7,2]},
  {op:"waitstate",args:[]},
  {op:"return",args:[]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_TOWER_MULTI_CORRIDOR",7,2]},
  {op:"waitstate",args:[]},
  {op:"return",args:[]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_TOWER_MULTI_PARTNER_ROOM",10,1]},
  {op:"waitstate",args:[]},
  {op:"return",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_right",args:[]},
  {op:"face_down",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"face_down",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"step_end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"BattleFrontier_BattleTowerElevator_EventScript_TurnPlayerNorth"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
] as const;
