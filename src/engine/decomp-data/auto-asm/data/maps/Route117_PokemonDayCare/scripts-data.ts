// AUTO-GENERATED from data/maps/Route117_PokemonDayCare/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route117_PokemonDayCare/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route117_PokemonDayCare_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route117_PokemonDayCare_OnTransition', isGlobal: false, instrIndex: 1 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 3 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route117_PokemonDayCare_OnTransition"]},
  {op:"setflag",args:["FLAG_LANDMARK_POKEMON_DAYCARE"]},
  {op:"end",args:[]},
] as const;
