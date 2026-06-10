// AUTO-GENERATED from data/maps/AbandonedShip_Underwater2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AbandonedShip_Underwater2/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AbandonedShip_Underwater2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Underwater2_OnResume', isGlobal: false, instrIndex: 1 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 3 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","AbandonedShip_Underwater2_OnResume"]},
  {op:"setdivewarp",args:["MAP_ABANDONED_SHIP_ROOMS_B1F",13,7]},
  {op:"end",args:[]},
] as const;
