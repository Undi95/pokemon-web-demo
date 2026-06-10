// AUTO-GENERATED from data/maps/BattleFrontier_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'BattleFrontier_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 4 },
  { name: 'BattleFrontier_PokemonCenter_1F_EventScript_SchoolKid', isGlobal: true, instrIndex: 10 },
  { name: 'BattleFrontier_PokemonCenter_1F_EventScript_Man', isGlobal: true, instrIndex: 12 },
  { name: 'BattleFrontier_PokemonCenter_1F_EventScript_Picnicker', isGlobal: true, instrIndex: 14 },
  { name: 'BattleFrontier_PokemonCenter_1F_EventScript_Skitty', isGlobal: true, instrIndex: 16 },
  { name: 'BattleFrontier_PokemonCenter_1F_Text_NeverSeenPokemon', isGlobal: false, instrIndex: 24 },
  { name: 'BattleFrontier_PokemonCenter_1F_Text_NextStopBattleArena', isGlobal: false, instrIndex: 24 },
  { name: 'BattleFrontier_PokemonCenter_1F_Text_GoingThroughEveryChallenge', isGlobal: false, instrIndex: 24 },
  { name: 'BattleFrontier_PokemonCenter_1F_Text_Skitty', isGlobal: false, instrIndex: 24 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"J'ai vu quelqu'un utiliser un POKéMON\\n\""] },
  { kind: '.string', vals: ["\"que je ne connaissais pas!\\p\""] },
  { kind: '.string', vals: ["\"En tout cas, je n'en avais jamais\\n\""] },
  { kind: '.string', vals: ["\"entendu parler à l'ECOLE DE DRESSEURS.\\p\""] },
  { kind: '.string', vals: ["\"Je me demande bien où tu peux\\n\""] },
  { kind: '.string', vals: ["\"attraper ce genre de POKéMON.$\""] },
  { kind: '.string', vals: ["\"Bien! Prochain arrêt, le DOJO DE COMBAT!\\n\""] },
  { kind: '.string', vals: ["\"Je vais prendre des POKéMON du système\\l\""] },
  { kind: '.string', vals: ["\"de Gestion de Stocks de POKéMON.$\""] },
  { kind: '.string', vals: ["\"Hi, hi, hi… Je vais relever tous\\n\""] },
  { kind: '.string', vals: ["\"les défis avec mon bébé!$\""] },
  { kind: '.string', vals: ["\"SKITTY: Kiiiiity!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 24 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","BattleFrontier_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_BATTLE_FRONTIER_OUTSIDE_EAST"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_FRONTIER_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_PokemonCenter_1F_Text_NeverSeenPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_PokemonCenter_1F_Text_NextStopBattleArena","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_PokemonCenter_1F_Text_GoingThroughEveryChallenge","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_SKITTY","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["BattleFrontier_PokemonCenter_1F_Text_Skitty","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
