// AUTO-GENERATED from data/maps/OldaleTown_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/OldaleTown_House1/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'OldaleTown_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'OldaleTown_House1_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'OldaleTown_House1_Text_LeftPokemonGoesOutFirst', isGlobal: false, instrIndex: 2 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=7
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Quand un combat de POKéMON commence,\\n\""] },
  { kind: '.string', vals: ["\"celui qui est à gauche de la liste part\\l\""] },
  { kind: '.string', vals: ["\"au combat le premier.\\p\""] },
  { kind: '.string', vals: ["\"Donc, quand tu auras plus de POKéMON\\n\""] },
  { kind: '.string', vals: ["\"dans ton équipe, tu pourras modifier\\l\""] },
  { kind: '.string', vals: ["\"l'ordre des POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Ça pourrait te donner l'avantage.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 2 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["OldaleTown_House1_Text_LeftPokemonGoesOutFirst","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
