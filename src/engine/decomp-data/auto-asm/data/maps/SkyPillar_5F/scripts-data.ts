// AUTO-GENERATED from data/maps/SkyPillar_5F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SkyPillar_5F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SkyPillar_5F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SkyPillar_5F_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'SkyPillar_5F_EventScript_CleanFloor', isGlobal: true, instrIndex: 3 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 5 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SkyPillar_5F_OnTransition"]},
  {op:"call_if_lt",args:["VAR_SKY_PILLAR_STATE",2,"SkyPillar_5F_EventScript_CleanFloor"]},
  {op:"return",args:[]},
  {op:"setmaplayoutindex",args:["LAYOUT_SKY_PILLAR_5F_CLEAN"]},
  {op:"return",args:[]},
] as const;
