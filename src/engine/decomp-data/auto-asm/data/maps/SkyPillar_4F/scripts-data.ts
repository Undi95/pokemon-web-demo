// AUTO-GENERATED from data/maps/SkyPillar_4F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SkyPillar_4F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SkyPillar_4F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SkyPillar_4F_OnTransition', isGlobal: false, instrIndex: 3 },
  { name: 'SkyPillar_4F_EventScript_CleanFloor', isGlobal: true, instrIndex: 7 },
  { name: 'SkyPillar_4F_SetHoleWarp', isGlobal: false, instrIndex: 9 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","CaveHole_CheckFallDownHole"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SkyPillar_4F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","SkyPillar_4F_SetHoleWarp"]},
  {op:"call_if_lt",args:["VAR_SKY_PILLAR_STATE",2,"SkyPillar_4F_EventScript_CleanFloor"]},
  {op:"setvar",args:["VAR_ICE_STEP_COUNT",1]},
  {op:"copyvar",args:["VAR_ICE_STEP_COUNT",1,"warn=FALSE"]},
  {op:"end",args:[]},
  {op:"setmaplayoutindex",args:["LAYOUT_SKY_PILLAR_4F_CLEAN"]},
  {op:"return",args:[]},
  {op:"setstepcallback",args:["STEP_CB_CRACKED_FLOOR"]},
  {op:"setholewarp",args:["MAP_SKY_PILLAR_3F"]},
  {op:"end",args:[]},
] as const;
