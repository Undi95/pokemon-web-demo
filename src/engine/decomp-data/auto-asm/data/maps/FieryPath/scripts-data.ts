// AUTO-GENERATED from data/maps/FieryPath/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FieryPath/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FieryPath_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FieryPath_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'FieryPath_EventScript_MoveScottToFallarbor', isGlobal: true, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 7 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","FieryPath_OnTransition"]},
  {op:"call_if_unset",args:["FLAG_LANDMARK_FIERY_PATH","FieryPath_EventScript_MoveScottToFallarbor"]},
  {op:"setflag",args:["FLAG_LANDMARK_FIERY_PATH"]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_HIDE_VERDANTURF_TOWN_SCOTT"]},
  {op:"clearflag",args:["FLAG_HIDE_FALLARBOR_TOWN_BATTLE_TENT_SCOTT"]},
  {op:"return",args:[]},
] as const;
