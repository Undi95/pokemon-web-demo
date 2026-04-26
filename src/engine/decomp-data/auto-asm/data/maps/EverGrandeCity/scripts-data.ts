// AUTO-GENERATED from data/maps/EverGrandeCity/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/EverGrandeCity/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EverGrandeCity_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'EverGrandeCity_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'EverGrandeCity_EventScript_VictoryRoadSign', isGlobal: true, instrIndex: 3 },
  { name: 'EverGrandeCity_EventScript_CitySign', isGlobal: true, instrIndex: 5 },
  { name: 'EverGrandeCity_EventScript_PokemonLeagueSign', isGlobal: true, instrIndex: 7 },
  { name: 'EverGrandeCity_EventScript_SetVisitedEverGrande', isGlobal: true, instrIndex: 9 },
  { name: 'EverGrandeCity_Text_EnteringVictoryRoad', isGlobal: false, instrIndex: 12 },
  { name: 'EverGrandeCity_Text_EnteringPokemonLeague', isGlobal: false, instrIndex: 12 },
  { name: 'EverGrandeCity_Text_CitySign', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"DEBUT DE LA ROUTE VICTOIRE$\""] },
  { kind: '.string', vals: ["\"ENTREE DE LA LIGUE POKéMON\\n\""] },
  { kind: '.string', vals: ["\"DROIT DEVANT$\""] },
  { kind: '.string', vals: ["\"ETERNARA\\p\""] },
  { kind: '.string', vals: ["\"“Le paradis des fleurs, de la mer et\\n\""] },
  { kind: '.string', vals: ["\"des POKéMON.”$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","EverGrandeCity_OnTransition"]},
  {op:"call_if_set",args:["FLAG_SYS_WEATHER_CTRL","Common_EventScript_SetAbnormalWeather"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EverGrandeCity_Text_EnteringVictoryRoad","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EverGrandeCity_Text_CitySign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["EverGrandeCity_Text_EnteringPokemonLeague","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_VISITED_EVER_GRANDE_CITY"]},
  {op:"setvar",args:["VAR_TEMP_1",1]},
  {op:"end",args:[]},
] as const;
