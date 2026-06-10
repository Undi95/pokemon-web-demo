// AUTO-GENERATED from data/maps/FallarborTown_PokemonCenter_2F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FallarborTown_PokemonCenter_2F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FallarborTown_PokemonCenter_2F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FallarborTown_PokemonCenter_2F_EventScript_Colosseum', isGlobal: true, instrIndex: 4 },
  { name: 'FallarborTown_PokemonCenter_2F_EventScript_TradeCenter', isGlobal: true, instrIndex: 6 },
  { name: 'FallarborTown_PokemonCenter_2F_EventScript_RecordCorner', isGlobal: true, instrIndex: 8 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 10 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","CableClub_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","CableClub_OnWarp"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","CableClub_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","CableClub_OnTransition"]},
  {op:"call",args:["CableClub_EventScript_Colosseum"]},
  {op:"end",args:[]},
  {op:"call",args:["CableClub_EventScript_TradeCenter"]},
  {op:"end",args:[]},
  {op:"call",args:["CableClub_EventScript_RecordCorner"]},
  {op:"end",args:[]},
] as const;
