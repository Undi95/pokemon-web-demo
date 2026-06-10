// AUTO-GENERATED from data/maps/BirthIsland_Harbor/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BirthIsland_Harbor/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BirthIsland_Harbor_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BirthIsland_Harbor_EventScript_Sailor', isGlobal: true, instrIndex: 0 },
  { name: 'BirthIsland_Harbor_EventScript_AsYouLike', isGlobal: true, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 19 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["BirthIsland_Harbor_Text_SailorReturn","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","BirthIsland_Harbor_EventScript_AsYouLike"]},
  {op:"msgbox",args:["EventTicket_Text_SailHome","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_WalkInPlaceFasterDown"]},
  {op:"waitmovement",args:[0]},
  {op:"delay",args:[30]},
  {op:"hideobjectat",args:["LOCALID_BIRTH_ISLAND_SAILOR","MAP_BIRTH_ISLAND_HARBOR"]},
  {op:"setvar",args:["VAR_0x8004","LOCALID_BIRTH_ISLAND_SS_TIDAL"]},
  {op:"call",args:["Common_EventScript_FerryDepartIsland"]},
  {op:"warp",args:["MAP_LILYCOVE_CITY_HARBOR",8,11]},
  {op:"waitstate",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EventTicket_Text_AsYouLike","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
