// AUTO-GENERATED from data/maps/DewfordTown_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/DewfordTown_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'DewfordTown_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'DewfordTown_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'DewfordTown_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 5 },
  { name: 'DewfordTown_PokemonCenter_1F_EventScript_PokefanF', isGlobal: true, instrIndex: 11 },
  { name: 'DewfordTown_PokemonCenter_1F_EventScript_Man', isGlobal: true, instrIndex: 13 },
  { name: 'DewfordTown_PokemonCenter_1F_Text_StoneCavern', isGlobal: false, instrIndex: 15 },
  { name: 'DewfordTown_PokemonCenter_1F_Text_FaintedMonCanUseHM', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Il y a une caverne en bordure de\\n\""] },
  { kind: '.string', vals: ["\"la ville.\\p\""] },
  { kind: '.string', vals: ["\"J'ai entendu dire qu'on y trouve des\\n\""] },
  { kind: '.string', vals: ["\"pierres très rares.$\""] },
  { kind: '.string', vals: ["\"Même si un POKéMON est K.O. et ne\\n\""] },
  { kind: '.string', vals: ["\"peut pas se battre, il peut quand\\p\""] },
  { kind: '.string', vals: ["\"même utiliser les coups appris d'une\\n\""] },
  { kind: '.string', vals: ["\"CS ou CAPSULE SECRETE en dehors\\l\""] },
  { kind: '.string', vals: ["\"d'un combat.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","DewfordTown_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_DEWFORD_TOWN"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_DEWFORD_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["DewfordTown_PokemonCenter_1F_Text_StoneCavern","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["DewfordTown_PokemonCenter_1F_Text_FaintedMonCanUseHM","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
