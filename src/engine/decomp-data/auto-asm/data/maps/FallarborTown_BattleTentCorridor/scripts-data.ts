// AUTO-GENERATED from data/maps/FallarborTown_BattleTentCorridor/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FallarborTown_BattleTentCorridor/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FallarborTown_BattleTentCorridor_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FallarborTown_BattleTentCorridor_OnFrame', isGlobal: false, instrIndex: 1 },
  { name: 'FallarborTown_BattleTentCorridor_EventScript_EnterCorridor', isGlobal: true, instrIndex: 2 },
  { name: 'FallarborTown_BattleTentCorridor_Movement_WalkToDoor', isGlobal: false, instrIndex: 19 },
  { name: 'FallarborTown_BattleTentCorridor_Movement_PlayerEnterDoor', isGlobal: false, instrIndex: 24 },
  { name: 'FallarborTown_BattleTentCorridor_Movement_AttendantEnterDoor', isGlobal: false, instrIndex: 25 },
  { name: 'FallarborTown_ContestHall_Text_DoAllRightInPreliminary', isGlobal: false, instrIndex: 28 },
  { name: 'FallarborTown_ContestHall_Text_MonAllTheseRibbons', isGlobal: false, instrIndex: 28 },
  { name: 'FallarborTown_ContestHall_Text_CantWinEverywhere', isGlobal: false, instrIndex: 28 },
  { name: 'FallarborTown_ContestHall_Text_SuperRankStage', isGlobal: false, instrIndex: 28 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1, .string=14
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"We do all right in the preliminary round,\\n\""] },
  { kind: '.string', vals: ["\"but we can never win the appeals…\\p\""] },
  { kind: '.string', vals: ["\"Maybe it means I have to watch what\\n\""] },
  { kind: '.string', vals: ["\"other contestants are doing…$\""] },
  { kind: '.string', vals: ["\"See!\\n\""] },
  { kind: '.string', vals: ["\"My POKéMON won all these RIBBONS!\\p\""] },
  { kind: '.string', vals: ["\"Have your POKéMON earned any RIBBONS?\\n\""] },
  { kind: '.string', vals: ["\"You can check them on your POKéNAV.$\""] },
  { kind: '.string', vals: ["\"I can't beat GYM LEADERS…\\p\""] },
  { kind: '.string', vals: ["\"I can't win any CONTESTS…\\p\""] },
  { kind: '.string', vals: ["\"I've been here, there, and everywhere,\\n\""] },
  { kind: '.string', vals: ["\"and it's all for naught…$\""] },
  { kind: '.string', vals: ["\"POKéMON CONTESTS\\n\""] },
  { kind: '.string', vals: ["\"SUPER RANK STAGE!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 28 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","FallarborTown_BattleTentCorridor_OnFrame"]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"FallarborTown_BattleTentCorridor_EventScript_EnterCorridor"]},
  {op:"lockall",args:[]},
  {op:"setvar",args:["VAR_TEMP_0",1]},
  {op:"applymovement",args:["LOCALID_FALLARBOR_TENT_CORRIDOR_ATTENDANT","FallarborTown_BattleTentCorridor_Movement_WalkToDoor"]},
  {op:"applymovement",args:["LOCALID_PLAYER","FallarborTown_BattleTentCorridor_Movement_WalkToDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"opendoor",args:[2,1]},
  {op:"waitdooranim",args:[]},
  {op:"applymovement",args:["LOCALID_FALLARBOR_TENT_CORRIDOR_ATTENDANT","FallarborTown_BattleTentCorridor_Movement_AttendantEnterDoor"]},
  {op:"applymovement",args:["LOCALID_PLAYER","FallarborTown_BattleTentCorridor_Movement_PlayerEnterDoor"]},
  {op:"waitmovement",args:[0]},
  {op:"closedoor",args:[2,1]},
  {op:"waitdooranim",args:[]},
  {op:"setvar",args:["VAR_0x8006",0]},
  {op:"warp",args:["MAP_FALLARBOR_TOWN_BATTLE_TENT_BATTLE_ROOM",4,4]},
  {op:"waitstate",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
] as const;
