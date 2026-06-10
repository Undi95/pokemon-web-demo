// AUTO-GENERATED from data/maps/CaveOfOrigin_UnusedRubySapphireMap1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/CaveOfOrigin_UnusedRubySapphireMap1/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'CaveOfOrigin_UnusedRubySapphireMap1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'CaveOfOrigin_UnusedRubySapphireMap1_OnTransition', isGlobal: false, instrIndex: 1 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 3 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","CaveOfOrigin_UnusedRubySapphireMap1_OnTransition"]},
  {op:"call_if_set",args:["FLAG_UNUSED_RS_LEGENDARY_BATTLE_DONE","CaveOfOrigin_EventScript_DisableTriggers"]},
  {op:"end",args:[]},
] as const;
