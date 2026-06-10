// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeRoomWildMons/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_BattlePikeRoomWildMons/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_BattlePikeRoomWildMons_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_BattlePikeRoomWildMons_OnFrame', isGlobal: false, instrIndex: 3 },
  { name: 'BattleFrontier_BattlePikeRoomWildMons_EventScript_SetInWildMonRoom', isGlobal: true, instrIndex: 5 },
  { name: 'BattleFrontier_BattlePikeRoomWildMons_EventScript_WarpToLobbyLost', isGlobal: true, instrIndex: 8 },
  { name: 'BattleFrontier_BattlePikeRoomWildMons_OnWarp', isGlobal: false, instrIndex: 12 },
  { name: 'BattleFrontier_BattlePikeRoomWildMons_EventScript_TurnPlayerNorth', isGlobal: true, instrIndex: 13 },
  { name: 'BattleFrontier_BattlePikeRoomWildMons_OnResume', isGlobal: false, instrIndex: 16 },
  { name: 'BattleFrontier_BattlePikeRoomWildMons_EventScript_SetLost', isGlobal: true, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 23 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","BattleFrontier_BattlePikeRoomWildMons_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","BattleFrontier_BattlePikeRoomWildMons_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","BattleFrontier_BattlePikeRoomWildMons_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_0",0,"BattleFrontier_BattlePikeRoomWildMons_EventScript_SetInWildMonRoom"]},
  {op:"map_script_2",args:["VAR_TEMP_1",1,"BattleFrontier_BattlePikeRoomWildMons_EventScript_WarpToLobbyLost"]},
  {op:"setvar",args:["VAR_TEMP_0",1]},
  {op:"pike_inwildmonroom",args:[]},
  {op:"end",args:[]},
  {op:"frontier_set",args:["FRONTIER_DATA_CHALLENGE_STATUS","CHALLENGE_STATUS_LOST"]},
  {op:"warp",args:["MAP_BATTLE_FRONTIER_BATTLE_PIKE_LOBBY",5,6]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_4",0,"BattleFrontier_BattlePikeRoomWildMons_EventScript_TurnPlayerNorth"]},
  {op:"setvar",args:["VAR_TEMP_4",1]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
  {op:"call",args:["BattleFrontier_BattlePikeRoom_EventScript_ResetSketchedMoves"]},
  {op:"frontier_get",args:["FRONTIER_DATA_BATTLE_OUTCOME"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_LOST","BattleFrontier_BattlePikeRoomWildMons_EventScript_SetLost"]},
  {op:"goto_if_eq",args:["VAR_RESULT","B_OUTCOME_DREW","BattleFrontier_BattlePikeRoomWildMons_EventScript_SetLost"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"end",args:[]},
] as const;
