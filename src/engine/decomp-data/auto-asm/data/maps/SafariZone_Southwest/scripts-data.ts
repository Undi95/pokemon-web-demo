// AUTO-GENERATED from data/maps/SafariZone_Southwest/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SafariZone_Southwest/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SafariZone_Southwest_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SafariZone_Southwest_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'SafariZone_Southwest_EventScript_RestHouseSign', isGlobal: true, instrIndex: 2 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["SafariZone_Southwest_Text_Woman","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SafariZone_Southwest_Text_RestHouseSign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
