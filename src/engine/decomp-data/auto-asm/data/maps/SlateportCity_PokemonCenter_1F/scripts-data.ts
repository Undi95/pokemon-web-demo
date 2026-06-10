// AUTO-GENERATED from data/maps/SlateportCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SlateportCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SlateportCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'SlateportCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 5 },
  { name: 'SlateportCity_PokemonCenter_1F_EventScript_Sailor', isGlobal: true, instrIndex: 11 },
  { name: 'SlateportCity_PokemonCenter_1F_EventScript_Woman', isGlobal: true, instrIndex: 13 },
  { name: 'SlateportCity_PokemonCenter_1F_Text_RaiseDifferentTypesOfPokemon', isGlobal: false, instrIndex: 15 },
  { name: 'SlateportCity_PokemonCenter_1F_Text_TradedMonWithFriend', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Une petite astuce pour combattre?\\p\""] },
  { kind: '.string', vals: ["\"Il faut faire progresser divers types\\n\""] },
  { kind: '.string', vals: ["\"de POKéMON en même temps.\\p\""] },
  { kind: '.string', vals: ["\"Ce n'est pas bien d'avoir un seul\\n\""] },
  { kind: '.string', vals: ["\"POKéMON qui soit fort.\\p\""] },
  { kind: '.string', vals: ["\"S'il a un handicap à cause de son type,\\n\""] },
  { kind: '.string', vals: ["\"il n'aura aucune chance.$\""] },
  { kind: '.string', vals: ["\"J'échange des POKéMON avec mes amis.\\p\""] },
  { kind: '.string', vals: ["\"Quand le POKéMON échangé porte\\n\""] },
  { kind: '.string', vals: ["\"un objet, je suis encore plus contente.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","SlateportCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_SLATEPORT_CITY"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_SLATEPORT_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SlateportCity_PokemonCenter_1F_Text_RaiseDifferentTypesOfPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SlateportCity_PokemonCenter_1F_Text_TradedMonWithFriend","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
