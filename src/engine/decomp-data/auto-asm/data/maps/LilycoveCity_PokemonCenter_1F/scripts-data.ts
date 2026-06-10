// AUTO-GENERATED from data/maps/LilycoveCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LilycoveCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'LilycoveCity_PokemonCenter_1F_EventScript_SetLilycoveLadyGfx', isGlobal: true, instrIndex: 5 },
  { name: 'LilycoveCity_PokemonCenter_1F_EventScript_HideContestLadyMon', isGlobal: true, instrIndex: 9 },
  { name: 'LilycoveCity_PokemonCenter_1F_EventScript_ShowContestLadyMon', isGlobal: true, instrIndex: 11 },
  { name: 'LilycoveCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 13 },
  { name: 'LilycoveCity_PokemonCenter_1F_EventScript_Boy', isGlobal: true, instrIndex: 19 },
  { name: 'LilycoveCity_PokemonCenter_1F_EventScript_Maniac', isGlobal: true, instrIndex: 21 },
  { name: 'LilycoveCity_PokemonCenter_1F_EventScript_ManiacBadTeamGone', isGlobal: true, instrIndex: 27 },
  { name: 'LilycoveCity_PokemonCenter_1F_Text_HowManyKindsOfPokemon', isGlobal: false, instrIndex: 30 },
  { name: 'LilycoveCity_PokemonCenter_1F_Text_HeardAboutRottenScoundrels', isGlobal: false, instrIndex: 30 },
  { name: 'LilycoveCity_PokemonCenter_1F_Text_HaventSeenRottenScoundrels', isGlobal: false, instrIndex: 30 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je me demande combien de types de\\n\""] },
  { kind: '.string', vals: ["\"POKéMON il existe dans le monde.\\p\""] },
  { kind: '.string', vals: ["\"Ce serait super de traverser les océans\\n\""] },
  { kind: '.string', vals: ["\"et d'échanger des POKéMON très\\l\""] },
  { kind: '.string', vals: ["\"loin d'ici.$\""] },
  { kind: '.string', vals: ["\"J'ai entendu parler d'une bande de\\n\""] },
  { kind: '.string', vals: ["\"sales vauriens qui volent les POKéMON\\l\""] },
  { kind: '.string', vals: ["\"et qui piquent les METEORITES.$\""] },
  { kind: '.string', vals: ["\"Ces sales vauriens qui volent les\\n\""] },
  { kind: '.string', vals: ["\"POKéMON et piquent les METEORITES…\\p\""] },
  { kind: '.string', vals: ["\"Je ne les ai pas vus dans les parages.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","LilycoveCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_LILYCOVE_CITY"]},
  {op:"goto",args:["LilycoveCity_PokemonCenter_1F_EventScript_SetLilycoveLadyGfx"]},
  {op:"end",args:[]},
  {op:"special",args:["SetLilycoveLadyGfx"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"LilycoveCity_PokemonCenter_1F_EventScript_HideContestLadyMon"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"LilycoveCity_PokemonCenter_1F_EventScript_ShowContestLadyMon"]},
  {op:"end",args:[]},
  {op:"setflag",args:["FLAG_HIDE_LILYCOVE_POKEMON_CENTER_CONTEST_LADY_MON"]},
  {op:"end",args:[]},
  {op:"clearflag",args:["FLAG_HIDE_LILYCOVE_POKEMON_CENTER_CONTEST_LADY_MON"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_LILYCOVE_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_PokemonCenter_1F_Text_HowManyKindsOfPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_BADGE07_GET","LilycoveCity_PokemonCenter_1F_EventScript_ManiacBadTeamGone"]},
  {op:"msgbox",args:["LilycoveCity_PokemonCenter_1F_Text_HeardAboutRottenScoundrels","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_PokemonCenter_1F_Text_HaventSeenRottenScoundrels","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
