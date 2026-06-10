// AUTO-GENERATED from data/maps/MirageTower_2F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MirageTower_2F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MirageTower_2F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MirageTower_2F_SetHoleWarp', isGlobal: false, instrIndex: 3 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","CaveHole_CheckFallDownHole"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","CaveHole_FixCrackedGround"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","MirageTower_2F_SetHoleWarp"]},
  {op:"setstepcallback",args:["STEP_CB_CRACKED_FLOOR"]},
  {op:"setholewarp",args:["MAP_MIRAGE_TOWER_1F"]},
  {op:"end",args:[]},
] as const;
