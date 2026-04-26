// AUTO-GENERATED from data/maps/LilycoveCity_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LilycoveCity_House1/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_House1_EventScript_ExpertM', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_House1_EventScript_Kecleon', isGlobal: true, instrIndex: 2 },
  { name: 'LilycoveCity_House1_Text_PokemonPartnersNotTools', isGlobal: false, instrIndex: 10 },
  { name: 'LilycoveCity_House1_Text_Kecleon', isGlobal: false, instrIndex: 10 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=5
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les POKéMON sont les partenaires des\\n\""] },
  { kind: '.string', vals: ["\"hommes. Ils ne sont pas nos outils.\\p\""] },
  { kind: '.string', vals: ["\"Malheureusement, certaines personnes\\n\""] },
  { kind: '.string', vals: ["\"ne veulent pas comprendre ça…$\""] },
  { kind: '.string', vals: ["\"KECLEON: Kécléééon?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 10 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["LilycoveCity_House1_Text_PokemonPartnersNotTools","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_KECLEON","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["LilycoveCity_House1_Text_Kecleon","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
