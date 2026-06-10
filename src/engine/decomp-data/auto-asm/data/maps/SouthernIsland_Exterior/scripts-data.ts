// AUTO-GENERATED from data/maps/SouthernIsland_Exterior/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SouthernIsland_Exterior/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SouthernIsland_Exterior_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SouthernIsland_Exterior_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'SouthernIsland_Exterior_EventScript_Sailor', isGlobal: true, instrIndex: 3 },
  { name: 'SouthernIsland_Exterior_EventScript_AsYouLike', isGlobal: true, instrIndex: 19 },
  { name: 'Ferry_EventScript_DepartIslandSouth', isGlobal: true, instrIndex: 22 },
  { name: 'Ferry_EventScript_DepartIslandWest', isGlobal: true, instrIndex: 25 },
  { name: 'Ferry_Movement_DepartIslandBoardSouth', isGlobal: false, instrIndex: 28 },
  { name: 'Ferry_Movement_DepartIslandBoardWest', isGlobal: false, instrIndex: 30 },
  { name: 'SouthernIsland_Exterior_EventScript_Sign', isGlobal: true, instrIndex: 33 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 35 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SouthernIsland_Exterior_OnTransition"]},
  {op:"setflag",args:["FLAG_LANDMARK_SOUTHERN_ISLAND"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["EventTicket_Text_SouthernIslandSailBack","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","SouthernIsland_Exterior_EventScript_AsYouLike"]},
  {op:"msgbox",args:["EventTicket_Text_SailHome","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_WalkInPlaceFasterDown"]},
  {op:"waitmovement",args:[0]},
  {op:"delay",args:[30]},
  {op:"hideobjectat",args:["LOCALID_SOUTHERN_ISLAND_SAILOR","MAP_SOUTHERN_ISLAND_EXTERIOR"]},
  {op:"setvar",args:["VAR_0x8004","LOCALID_SOUTHERN_ISLAND_SS_TIDAL"]},
  {op:"call",args:["Common_EventScript_FerryDepartIsland"]},
  {op:"warp",args:["MAP_LILYCOVE_CITY_HARBOR",8,11]},
  {op:"waitstate",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EventTicket_Text_AsYouLike","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Ferry_Movement_DepartIslandBoardSouth"]},
  {op:"waitmovement",args:[0]},
  {op:"return",args:[]},
  {op:"applymovement",args:["LOCALID_PLAYER","Ferry_Movement_DepartIslandBoardWest"]},
  {op:"waitmovement",args:[0]},
  {op:"return",args:[]},
  {op:"walk_down",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_left",args:[]},
  {op:"walk_in_place_faster_down",args:[]},
  {op:"step_end",args:[]},
  {op:"msgbox",args:["SouthernIsland_Exterior_Text_Sign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
