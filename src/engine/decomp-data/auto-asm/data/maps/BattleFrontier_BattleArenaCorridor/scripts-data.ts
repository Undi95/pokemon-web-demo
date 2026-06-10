// AUTO-GENERATED from data/maps/BattleFrontier_BattleArenaCorridor/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_BattleArenaCorridor/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_BattleArenaCorridor_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_BattleArenaCorridor_OnFrame', isGlobal: false, instrIndex: 1 },
  { name: 'BattleFrontier_BattleArenaCorridor_EventScript_WalkToBattleRoom', isGlobal: true, instrIndex: 2 },
  { name: 'BattleFrontier_BattleArenaCorridor_Movement_PlayerWalkToDoor', isGlobal: false, instrIndex: 18 },
  { name: 'BattleFrontier_BattleArenaCorridor_Movement_PlayerEnterDoor', isGlobal: false, instrIndex: 39 },
  { name: 'BattleFrontier_BattleArenaCorridor_Movement_AttendantWalkToDoor', isGlobal: false, instrIndex: 42 },
  { name: 'BattleFrontier_BattleArenaCorridor_Movement_AttendantFacePlayer', isGlobal: false, instrIndex: 63 },
  { name: 'BattleFrontier_BattleArenaCorridor_Movement_AttendantMoveOutOfWay', isGlobal: false, instrIndex: 65 },
  { name: 'BattleFrontier_BattleArenaCorridor_Text_PleaseStepIn', isGlobal: false, instrIndex: 68 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1, .string=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Entrez et surpassez-vous!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 68 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","BattleFrontier_BattleArenaCorridor_OnFrame"]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"BattleFrontier_BattleArenaCorridor_EventScript_WalkToBattleRoom"]},
  {op:"delay",args:[16]},
  {op:"setvar",args:["VAR_TEMP_0",1]},
  {op:"applymovement",args:["LOCALID_ARENA_CORRIDOR_ATTENDANT","BattleFrontier_BattleArenaCorridor_Movement_AttendantWalkToDoor"]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattleArenaCorridor_Movement_PlayerWalkToDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_ARENA_CORRIDOR_ATTENDANT","BattleFrontier_BattleArenaCorridor_Movement_AttendantFacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["BattleFrontier_BattleArenaCorridor_Text_PleaseStepIn","MSGBOX_SIGN"]},
  {op:"applymovement",args:["LOCALID_ARENA_CORRIDOR_ATTENDANT","BattleFrontier_BattleArenaCorridor_Movement_AttendantMoveOutOfWay"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattleArenaCorridor_Movement_PlayerEnterDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"setvar",args:["VAR_0x8006",0]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_ARENA_BATTLE_ROOM",7,5]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_right",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"walk_right",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_in_place_faster_left",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_in_place_faster_down",args:[]},
  {op:"step_end",args:[]},
] as const;
