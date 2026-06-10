// AUTO-GENERATED from data/maps/SafariZone_RestHouse/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SafariZone_RestHouse/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SafariZone_RestHouse_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SafariZone_RestHouse_EventScript_Youngster', isGlobal: true, instrIndex: 0 },
  { name: 'SafariZone_RestHouse_EventScript_PsychicM', isGlobal: true, instrIndex: 2 },
  { name: 'SafariZone_RestHouse_EventScript_FatMan', isGlobal: true, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["SafariZone_RestHouse_Text_Youngster","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SafariZone_RestHouse_Text_PsychicM","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SafariZone_RestHouse_Text_FatMan","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
