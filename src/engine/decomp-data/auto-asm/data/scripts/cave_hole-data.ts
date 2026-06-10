// AUTO-GENERATED from data/scripts/cave_hole.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/cave_hole.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'CaveHole_CheckFallDownHole', isGlobal: false, instrIndex: 0 },
  { name: 'CaveHole_FixCrackedGround', isGlobal: false, instrIndex: 1 },
  { name: 'EventScript_FallDownHole', isGlobal: true, instrIndex: 4 },
  { name: 'EventScript_FallDownHoleMtPyre', isGlobal: true, instrIndex: 13 },
  { name: 'Movement_SetInvisible', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .2byte=1
export const DATA_DIRECTIVES = [
  { kind: '.2byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 23 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script_2",args:["VAR_ICE_STEP_COUNT",0,"EventScript_FallDownHole"]},
  {op:"setvar",args:["VAR_ICE_STEP_COUNT",1]},
  {op:"copyvar",args:["VAR_ICE_STEP_COUNT",1,"warn=FALSE"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"delay",args:[20]},
  {op:"applymovement",args:["LOCALID_PLAYER","Movement_SetInvisible"]},
  {op:"waitmovement",args:[0]},
  {op:"playse",args:["SE_FALL"]},
  {op:"delay",args:[60]},
  {op:"warphole",args:["MAP_UNDEFINED"]},
  {op:"waitstate",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"delay",args:[20]},
  {op:"applymovement",args:["LOCALID_PLAYER","Movement_SetInvisible"]},
  {op:"waitmovement",args:[0]},
  {op:"playse",args:["SE_FALL"]},
  {op:"delay",args:[60]},
  {op:"special",args:["DoFallWarp"]},
  {op:"end",args:[]},
  {op:"set_invisible",args:[]},
  {op:"step_end",args:[]},
] as const;
