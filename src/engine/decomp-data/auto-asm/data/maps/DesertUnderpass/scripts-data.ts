// AUTO-GENERATED from data/maps/DesertUnderpass/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/DesertUnderpass/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'DesertUnderpass_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'DesertUnderpass_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'DesertUnderpass_EventScript_Fossil', isGlobal: true, instrIndex: 3 },
  { name: 'DesertUnderpass_EventScript_GiveClawFossil', isGlobal: true, instrIndex: 9 },
  { name: 'DesertUnderpass_EventScript_GiveRootFossil', isGlobal: true, instrIndex: 13 },
  { name: 'DesertUnderpass_Text_FoundRootFossil', isGlobal: true, instrIndex: 17 },
  { name: 'DesertUnderpass_Text_FoundClawFossil', isGlobal: true, instrIndex: 17 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=2
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"{PLAYER} found the ROOT FOSSIL.$\""] },
  { kind: '.string', vals: ["\"{PLAYER} found the CLAW FOSSIL.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","DesertUnderpass_OnTransition"]},
  {op:"setflag",args:["FLAG_LANDMARK_DESERT_UNDERPASS"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_CHOSE_ROOT_FOSSIL","DesertUnderpass_EventScript_GiveClawFossil"]},
  {op:"goto_if_set",args:["FLAG_CHOSE_CLAW_FOSSIL","DesertUnderpass_EventScript_GiveRootFossil"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"giveitem",args:["ITEM_CLAW_FOSSIL"]},
  {op:"removeobject",args:["LOCALID_UNDERPASS_FOSSIL"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"giveitem",args:["ITEM_ROOT_FOSSIL"]},
  {op:"removeobject",args:["LOCALID_UNDERPASS_FOSSIL"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
