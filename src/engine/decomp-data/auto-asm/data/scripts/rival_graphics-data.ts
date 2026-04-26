// AUTO-GENERATED from data/scripts/rival_graphics.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/rival_graphics.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Common_EventScript_SetupRivalGfxId', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_SetupRivalGfxIdFemale', isGlobal: true, instrIndex: 4 },
  { name: 'EventScript_SetupRivalGfxIdMale', isGlobal: true, instrIndex: 6 },
  { name: 'Common_EventScript_SetupRivalOnBikeGfxId', isGlobal: true, instrIndex: 8 },
  { name: 'EventScript_SetupRivalOnBikeGfxIdFemale', isGlobal: true, instrIndex: 12 },
  { name: 'EventScript_SetupRivalOnBikeGfxIdMale', isGlobal: true, instrIndex: 14 },
  { name: 'Common_EventScript_SetupRivalGfxIdSameGender', isGlobal: true, instrIndex: 16 },
  { name: 'EventScript_SetupRivalGfxIdMale2', isGlobal: true, instrIndex: 20 },
  { name: 'EventScript_SetupRivalGfxIdFemale2', isGlobal: true, instrIndex: 22 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 24 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"checkplayergender",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT","MALE","EventScript_SetupRivalGfxIdFemale"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FEMALE","EventScript_SetupRivalGfxIdMale"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_0","OBJ_EVENT_GFX_RIVAL_MAY_NORMAL"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_0","OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL"]},
  {op:"return",args:[]},
  {op:"checkplayergender",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT","MALE","EventScript_SetupRivalOnBikeGfxIdFemale"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FEMALE","EventScript_SetupRivalOnBikeGfxIdMale"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_3","OBJ_EVENT_GFX_RIVAL_MAY_MACH_BIKE"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_3","OBJ_EVENT_GFX_RIVAL_BRENDAN_MACH_BIKE"]},
  {op:"return",args:[]},
  {op:"checkplayergender",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT","MALE","EventScript_SetupRivalGfxIdMale2"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FEMALE","EventScript_SetupRivalGfxIdFemale2"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_0","OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_OBJ_GFX_ID_0","OBJ_EVENT_GFX_RIVAL_MAY_NORMAL"]},
  {op:"return",args:[]},
] as const;
