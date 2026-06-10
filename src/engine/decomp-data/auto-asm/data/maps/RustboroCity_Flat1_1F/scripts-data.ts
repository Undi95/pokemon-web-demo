// AUTO-GENERATED from data/maps/RustboroCity_Flat1_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_Flat1_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_Flat1_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat1_1F_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat1_1F_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'RustboroCity_Flat1_1F_Text_EveryPokemonHasAbility', isGlobal: false, instrIndex: 4 },
  { name: 'RustboroCity_Flat1_1F_Text_PokemonStrange', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Chaque POKéMON a une capacité\\n\""] },
  { kind: '.string', vals: ["\"spéciale qu'il peut utiliser.$\""] },
  { kind: '.string', vals: ["\"Les POKéMON sont des créatures\\n\""] },
  { kind: '.string', vals: ["\"si étranges!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["RustboroCity_Flat1_1F_Text_EveryPokemonHasAbility","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_Flat1_1F_Text_PokemonStrange","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
