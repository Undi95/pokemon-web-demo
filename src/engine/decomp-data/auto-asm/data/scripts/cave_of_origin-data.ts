// AUTO-GENERATED from data/scripts/cave_of_origin.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/cave_of_origin.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'CaveOfOrigin_EventScript_LegendaryCry', isGlobal: true, instrIndex: 0 },
  { name: 'CaveOfOrigin_EventScript_Shake1', isGlobal: true, instrIndex: 7 },
  { name: 'CaveOfOrigin_EventScript_Shake2', isGlobal: true, instrIndex: 11 },
  { name: 'CaveOfOrigin_EventScript_Shake3', isGlobal: true, instrIndex: 15 },
  { name: 'CaveOfOrigin_EventScript_Shake', isGlobal: true, instrIndex: 19 },
  { name: 'CaveOfOrigin_EventScript_DisableTriggers', isGlobal: true, instrIndex: 27 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 33 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_KYOGRE","CRY_MODE_ENCOUNTER"]},
  {op:"waitmoncry",args:[]},
  {op:"setvar",args:["VAR_TEMP_5",1]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"goto",args:["CaveOfOrigin_EventScript_Shake"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"setvar",args:["VAR_TEMP_2",1]},
  {op:"goto",args:["CaveOfOrigin_EventScript_Shake"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"setvar",args:["VAR_TEMP_3",1]},
  {op:"goto",args:["CaveOfOrigin_EventScript_Shake"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004",1]},
  {op:"setvar",args:["VAR_0x8005",1]},
  {op:"setvar",args:["VAR_0x8006",8]},
  {op:"setvar",args:["VAR_0x8007",5]},
  {op:"special",args:["ShakeCamera"]},
  {op:"waitstate",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"setvar",args:["VAR_TEMP_2",1]},
  {op:"setvar",args:["VAR_TEMP_3",1]},
  {op:"setvar",args:["VAR_TEMP_4",1]},
  {op:"setvar",args:["VAR_TEMP_5",1]},
  {op:"return",args:[]},
] as const;
