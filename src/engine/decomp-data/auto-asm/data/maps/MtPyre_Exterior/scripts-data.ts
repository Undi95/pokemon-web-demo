// AUTO-GENERATED from data/maps/MtPyre_Exterior/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MtPyre_Exterior/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MtPyre_Exterior_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_Exterior_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'MtPyre_Exterior_EventScript_CheckEnterFromSummit', isGlobal: true, instrIndex: 3 },
  { name: 'MtPyre_Exterior_EventScript_EnterFromSummit', isGlobal: true, instrIndex: 6 },
  { name: 'MtPyre_Exterior_EventScript_FogTrigger', isGlobal: true, instrIndex: 8 },
  { name: 'MtPyre_Exterior_EventScript_SunTrigger', isGlobal: true, instrIndex: 11 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","MtPyre_Exterior_OnTransition"]},
  {op:"call",args:["MtPyre_Exterior_EventScript_CheckEnterFromSummit"]},
  {op:"end",args:[]},
  {op:"getplayerxy",args:["VAR_TEMP_0","VAR_TEMP_1"]},
  {op:"goto_if_lt",args:["VAR_TEMP_1",12,"MtPyre_Exterior_EventScript_EnterFromSummit"]},
  {op:"return",args:[]},
  {op:"setweather",args:["WEATHER_FOG_HORIZONTAL"]},
  {op:"return",args:[]},
  {op:"setweather",args:["WEATHER_FOG_HORIZONTAL"]},
  {op:"doweather",args:[]},
  {op:"end",args:[]},
  {op:"setweather",args:["WEATHER_SUNNY"]},
  {op:"doweather",args:[]},
  {op:"end",args:[]},
] as const;
