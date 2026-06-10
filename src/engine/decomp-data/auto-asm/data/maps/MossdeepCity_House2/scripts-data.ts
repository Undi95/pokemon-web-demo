// AUTO-GENERATED from data/maps/MossdeepCity_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MossdeepCity_House2/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MossdeepCity_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House2_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House2_EventScript_Twin', isGlobal: true, instrIndex: 2 },
  { name: 'MossdeepCity_House2_EventScript_Wingull', isGlobal: true, instrIndex: 4 },
  { name: 'MossdeepCity_House2_EventScript_WingullExitNorth', isGlobal: true, instrIndex: 18 },
  { name: 'MossdeepCity_House2_EventScript_WingullExitWest', isGlobal: true, instrIndex: 21 },
  { name: 'MossdeepCity_House2_Movement_WingullExitNorth', isGlobal: false, instrIndex: 24 },
  { name: 'MossdeepCity_House2_Movement_WingullExitEast', isGlobal: false, instrIndex: 31 },
  { name: 'MossdeepCity_House2_Text_SisterMailsBoyfriendInFortree', isGlobal: false, instrIndex: 36 },
  { name: 'MossdeepCity_House2_Text_PokemonCarriesMailBackAndForth', isGlobal: false, instrIndex: 36 },
  { name: 'MossdeepCity_House2_Text_Wingull', isGlobal: false, instrIndex: 36 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ma petite sœur échange des LETTRES\\n\""] },
  { kind: '.string', vals: ["\"avec son petit ami de CIMETRONELLE.\\p\""] },
  { kind: '.string', vals: ["\"Je ne l'envie pas du tout.$\""] },
  { kind: '.string', vals: ["\"Même si je ne peux pas voir mon ami à\\n\""] },
  { kind: '.string', vals: ["\"CIMETRONELLE, mon POKéMON fait les\\l\""] },
  { kind: '.string', vals: ["\"allers et retours avec nos LETTRES.\\p\""] },
  { kind: '.string', vals: ["\"Nous sommes séparés, mais je ne\\n\""] },
  { kind: '.string', vals: ["\"me sens pas seule.$\""] },
  { kind: '.string', vals: ["\"GOELISE: Goéééliiise!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 36 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["MossdeepCity_House2_Text_SisterMailsBoyfriendInFortree","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_House2_Text_PokemonCarriesMailBackAndForth","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_WINGULL","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["MossdeepCity_House2_Text_Wingull","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"closemessage",args:[]},
  {op:"setflag",args:["FLAG_WINGULL_DELIVERED_MAIL"]},
  {op:"clearflag",args:["FLAG_HIDE_FORTREE_CITY_HOUSE_4_WINGULL"]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_NORTH","MossdeepCity_House2_EventScript_WingullExitNorth"]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_WEST","MossdeepCity_House2_EventScript_WingullExitWest"]},
  {op:"removeobject",args:["LOCALID_MOSSDEEP_HOUSE_WINGULL"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["LOCALID_MOSSDEEP_HOUSE_WINGULL","MossdeepCity_House2_Movement_WingullExitNorth"]},
  {op:"waitmovement",args:[0]},
  {op:"return",args:[]},
  {op:"applymovement",args:["LOCALID_MOSSDEEP_HOUSE_WINGULL","MossdeepCity_House2_Movement_WingullExitEast"]},
  {op:"waitmovement",args:[0]},
  {op:"return",args:[]},
  {op:"walk_fast_right",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"walk_fast_left",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"delay_8",args:[]},
  {op:"step_end",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"delay_8",args:[]},
  {op:"step_end",args:[]},
] as const;
