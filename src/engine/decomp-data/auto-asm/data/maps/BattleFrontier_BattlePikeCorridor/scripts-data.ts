// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeCorridor/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_BattlePikeCorridor/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_BattlePikeCorridor_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_BattlePikeCorridor_OnFrame', isGlobal: false, instrIndex: 2 },
  { name: 'BattleFrontier_BattlePikeCorridor_EventScript_EnterCorridor', isGlobal: true, instrIndex: 3 },
  { name: 'BattleFrontier_BattlePikeCorridor_OnWarp', isGlobal: false, instrIndex: 21 },
  { name: 'BattleFrontier_BattlePikeCorridor_EventScript_TurnPlayerNorth', isGlobal: true, instrIndex: 22 },
  { name: 'BattleFrontier_BattlePikeCorridor_Movement_PlayerEnterCorridor', isGlobal: false, instrIndex: 25 },
  { name: 'BattleFrontier_BattlePikeCorridor_Movement_PlayerExitCorridor', isGlobal: false, instrIndex: 28 },
  { name: 'BattleFrontier_BattlePikeCorridor_Movement_AttendantEnterCorridor', isGlobal: false, instrIndex: 32 },
  { name: 'BattleFrontier_BattlePikeCorridor_Text_YourChallengeHasBegun', isGlobal: false, instrIndex: 37 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=2
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"Votre COMBAT HASARD a\\n\""] },
  { kind: '.string', vals: ["\"commencé…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 37 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","BattleFrontier_BattlePikeCorridor_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","BattleFrontier_BattlePikeCorridor_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"BattleFrontier_BattlePikeCorridor_EventScript_EnterCorridor"]},
  {op:"delay",args:[16]},
  {op:"frontier_set",args:["FRONTIER_DATA_BATTLE_NUM",1]},
  {op:"pike_cleartrainerids",args:[]},
  {op:"pike_nohealing",args:[1]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattlePikeCorridor_Movement_PlayerEnterCorridor"]},
  {op:"applymovement",args:["LOCALID_PIKE_CORRIDOR_ATTENDANT","BattleFrontier_BattlePikeCorridor_Movement_AttendantEnterCorridor"]},
  {op:"waitmovement",args:[0]},
  {op:"lockall",args:[]},
  {op:"msgbox",args:["BattleFrontier_BattlePikeCorridor_Text_YourChallengeHasBegun","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"releaseall",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","BattleFrontier_BattlePikeCorridor_Movement_PlayerExitCorridor"]},
  {op:"waitmovement",args:[0]},
  {op:"frontier_set",args:["FRONTIER_DATA_CHALLENGE_STATUS",99]},
  {op:"call",args:["BattleFrontier_BattlePike_EventScript_CloseCurtain"]},
  {op:"warpsilent",args:["MAP_BATTLE_FRONTIER_BATTLE_PIKE_THREE_PATH_ROOM",6,10]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"BattleFrontier_BattlePikeCorridor_EventScript_TurnPlayerNorth"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_up",args:[]},
  {op:"walk_left",args:[]},
  {op:"face_down",args:[]},
  {op:"step_end",args:[]},
] as const;
