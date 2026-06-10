// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeRoomFinal/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_BattlePikeRoomFinal/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_BattlePikeRoomFinal_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_BattlePikeRoomFinal_OnFrame', isGlobal: false, instrIndex: 2 },
  { name: 'BattleFrontier_BattlePikeRoomFinal_EventScript_EnterRoom', isGlobal: true, instrIndex: 3 },
  { name: 'BattleFrontier_BattlePikeRoomFinal_Movement_AttendantApproachPlayer', isGlobal: false, instrIndex: 14 },
  { name: 'BattleFrontier_BattlePikeRoomFinal_OnWarp', isGlobal: false, instrIndex: 17 },
  { name: 'BattleFrontier_BattlePikeRoomFinal_EventScript_TurnPlayerNorth', isGlobal: true, instrIndex: 18 },
  { name: 'BattleFrontier_BattlePikeRoomFinal_Text_CongratsThisWayPlease', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=2
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Félicitations…\\n\""] },
  { kind: '.string', vals: ["\"Par ici, s'il vous plaît…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","BattleFrontier_BattlePikeRoomFinal_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","BattleFrontier_BattlePikeRoomFinal_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"BattleFrontier_BattlePikeRoomFinal_EventScript_EnterRoom"]},
  {op:"delay",args:[16]},
  {op:"applymovement",args:["LOCALID_PIKE_FINAL_ROOM_ATTENDANT","BattleFrontier_BattlePikeRoomFinal_Movement_AttendantApproachPlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"frontier_set",args:["FRONTIER_DATA_CHALLENGE_STATUS","CHALLENGE_STATUS_WON"]},
  {op:"lockall",args:[]},
  {op:"msgbox",args:["BattleFrontier_BattlePikeRoomFinal_Text_CongratsThisWayPlease","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"releaseall",args:[]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_PIKE_LOBBY",5,6]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"walk_down",args:[]},
  {op:"walk_down",args:[]},
  {op:"step_end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_4",0,"BattleFrontier_BattlePikeRoomFinal_EventScript_TurnPlayerNorth"]},
  {op:"setvar",args:["VAR_TEMP_4",1]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
] as const;
