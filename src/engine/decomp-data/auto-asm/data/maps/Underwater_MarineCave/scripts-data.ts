// AUTO-GENERATED from data/maps/Underwater_MarineCave/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Underwater_MarineCave/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Underwater_MarineCave_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Underwater_MarineCave_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'Underwater_MarineCave_OnResume', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","Underwater_MarineCave_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Underwater_MarineCave_OnTransition"]},
  {op:"setflag",args:["FLAG_ARRIVED_AT_MARINE_CAVE_EMERGE_SPOT"]},
  {op:"end",args:[]},
  {op:"setdivewarp",args:["MAP_MARINE_CAVE_ENTRANCE",10,17]},
  {op:"end",args:[]},
] as const;
