// AUTO-GENERATED from data/maps/EverGrandeCity_Hall2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/EverGrandeCity_Hall2/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_Hall2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_Hall2_OnWarp', isGlobal: false, instrIndex: 1 },
  { name: 'EverGrandeCity_Hall2_EventScript_TurnPlayerNorth', isGlobal: true, instrIndex: 2 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","EverGrandeCity_Hall2_OnWarp"]},
  {op:"map_script_2",args:["VAR_TEMP_1",0,"EverGrandeCity_Hall2_EventScript_TurnPlayerNorth"]},
  {op:"turnobject",args:["LOCALID_PLAYER","DIR_NORTH"]},
  {op:"end",args:[]},
] as const;
