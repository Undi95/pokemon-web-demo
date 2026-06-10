// AUTO-GENERATED from data/maps/FarawayIsland_Entrance/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FarawayIsland_Entrance/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FarawayIsland_Entrance_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FarawayIsland_Entrance_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'FarawayIsland_Entrance_EventScript_SetCloudsWeather', isGlobal: true, instrIndex: 3 },
  { name: 'FarawayIsland_Entrance_EventScript_ClearWeather', isGlobal: true, instrIndex: 6 },
  { name: 'FarawayIsland_Entrance_EventScript_Sailor', isGlobal: true, instrIndex: 9 },
  { name: 'FarawayIsland_Entrance_EventScript_AsYouLike', isGlobal: true, instrIndex: 25 },
  { name: 'FarawayIsland_Entrance_EventScript_Sign', isGlobal: true, instrIndex: 28 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","FarawayIsland_Entrance_OnTransition"]},
  {op:"setflag",args:["FLAG_ARRIVED_ON_FARAWAY_ISLAND"]},
  {op:"end",args:[]},
  {op:"setweather",args:["WEATHER_SUNNY_CLOUDS"]},
  {op:"doweather",args:[]},
  {op:"end",args:[]},
  {op:"setweather",args:["WEATHER_NONE"]},
  {op:"doweather",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["FarawayIsland_Entrance_Text_SailorReturn","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","FarawayIsland_Entrance_EventScript_AsYouLike"]},
  {op:"msgbox",args:["EventTicket_Text_SailHome","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_WalkInPlaceFasterDown"]},
  {op:"waitmovement",args:[0]},
  {op:"delay",args:[30]},
  {op:"hideobjectat",args:["LOCALID_FARAWAY_ISLAND_SAILOR","MAP_FARAWAY_ISLAND_ENTRANCE"]},
  {op:"setvar",args:["VAR_0x8004","LOCALID_FARAWAY_ISLAND_SS_TIDAL"]},
  {op:"call",args:["Common_EventScript_FerryDepartIsland"]},
  {op:"warp",args:["MAP_LILYCOVE_CITY_HARBOR",8,11]},
  {op:"waitstate",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EventTicket_Text_AsYouLike","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FarawayIsland_Entrance_Text_Sign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
