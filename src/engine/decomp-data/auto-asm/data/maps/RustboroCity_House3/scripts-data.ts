// AUTO-GENERATED from data/maps/RustboroCity_House3/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_House3/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_House3_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_House3_EventScript_OldMan', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_House3_EventScript_OldWoman', isGlobal: true, instrIndex: 2 },
  { name: 'RustboroCity_House3_EventScript_Pekachu', isGlobal: true, instrIndex: 4 },
  { name: 'RustboroCity_House3_Text_IGivePerfectlySuitedNicknames', isGlobal: false, instrIndex: 12 },
  { name: 'RustboroCity_House3_Text_NamingPikachuPekachu', isGlobal: false, instrIndex: 12 },
  { name: 'RustboroCity_House3_Text_Pekachu', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Moi, à mes POKéMON, je leur donne\\n\""] },
  { kind: '.string', vals: ["\"des surnoms très appropriés!\\p\""] },
  { kind: '.string', vals: ["\"C'est l'expression de, euh…\\n\""] },
  { kind: '.string', vals: ["\"mon originalité, oui, c'est ça!$\""] },
  { kind: '.string', vals: ["\"Mais surnommer PEKACHU un PIKACHU,\\n\""] },
  { kind: '.string', vals: ["\"ça ne rime à rien.\\p\""] },
  { kind: '.string', vals: ["\"C'est sûrement bien d'utiliser un nom\\n\""] },
  { kind: '.string', vals: ["\"facile à comprendre, mais de là à…$\""] },
  { kind: '.string', vals: ["\"PEKACHU: Peka!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["RustboroCity_House3_Text_IGivePerfectlySuitedNicknames","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_House3_Text_NamingPikachuPekachu","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_PIKACHU","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["RustboroCity_House3_Text_Pekachu","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
