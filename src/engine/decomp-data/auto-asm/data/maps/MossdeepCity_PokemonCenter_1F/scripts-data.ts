// AUTO-GENERATED from data/maps/MossdeepCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MossdeepCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MossdeepCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'MossdeepCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 4 },
  { name: 'MossdeepCity_PokemonCenter_1F_EventScript_Woman', isGlobal: true, instrIndex: 10 },
  { name: 'MossdeepCity_PokemonCenter_1F_EventScript_Girl', isGlobal: true, instrIndex: 12 },
  { name: 'MossdeepCity_PokemonCenter_1F_Text_GymLeaderDuoFormidable', isGlobal: false, instrIndex: 14 },
  { name: 'MossdeepCity_PokemonCenter_1F_Text_AbilitiesMightChangeMoves', isGlobal: false, instrIndex: 14 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=7
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les CHAMPIONS D'ARENE de cette ville\\n\""] },
  { kind: '.string', vals: ["\"font la paire.\\p\""] },
  { kind: '.string', vals: ["\"La combinaison de leurs attaques est\\n\""] },
  { kind: '.string', vals: ["\"excellente. Waouh!$\""] },
  { kind: '.string', vals: ["\"Selon les capacités spéciales d'un\\n\""] },
  { kind: '.string', vals: ["\"POKéMON, certaines attaques peuvent\\l\""] },
  { kind: '.string', vals: ["\"échouer ou leur effet peut changer.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","MossdeepCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_MOSSDEEP_CITY"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_MOSSDEEP_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_PokemonCenter_1F_Text_GymLeaderDuoFormidable","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_PokemonCenter_1F_Text_AbilitiesMightChangeMoves","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
