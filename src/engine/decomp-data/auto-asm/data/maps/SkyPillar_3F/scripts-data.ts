// AUTO-GENERATED from data/maps/SkyPillar_3F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SkyPillar_3F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SkyPillar_3F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SkyPillar_3F_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'SkyPillar_3F_EventScript_CleanFloor', isGlobal: true, instrIndex: 3 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 5 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SkyPillar_3F_OnTransition"]},
  {op:"call_if_lt",args:["VAR_SKY_PILLAR_STATE",2,"SkyPillar_3F_EventScript_CleanFloor"]},
  {op:"end",args:[]},
  {op:"setmaplayoutindex",args:["LAYOUT_SKY_PILLAR_3F_CLEAN"]},
  {op:"return",args:[]},
] as const;
