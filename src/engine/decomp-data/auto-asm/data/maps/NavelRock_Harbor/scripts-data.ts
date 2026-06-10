// AUTO-GENERATED from data/maps/NavelRock_Harbor/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/NavelRock_Harbor/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'NavelRock_Harbor_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'NavelRock_Harbor_EventScript_Sailor', isGlobal: true, instrIndex: 0 },
  { name: 'NavelRock_Harbor_EventScript_AsYouLike', isGlobal: true, instrIndex: 16 },
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
  {op:"msgbox",args:["NavelRock_Harbor_Text_SailorReturn","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","NavelRock_Harbor_EventScript_AsYouLike"]},
  {op:"msgbox",args:["EventTicket_Text_SailHome","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_WalkInPlaceFasterDown"]},
  {op:"waitmovement",args:[0]},
  {op:"delay",args:[30]},
  {op:"hideobjectat",args:["LOCALID_NAVEL_ROCK_SAILOR","MAP_NAVEL_ROCK_HARBOR"]},
  {op:"setvar",args:["VAR_0x8004","LOCALID_NAVEL_ROCK_SS_TIDAL"]},
  {op:"call",args:["Common_EventScript_FerryDepartIsland"]},
  {op:"warp",args:["MAP_LILYCOVE_CITY_HARBOR",8,11]},
  {op:"waitstate",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EventTicket_Text_AsYouLike","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
