// AUTO-GENERATED from data/maps/OldaleTown_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/OldaleTown_PokemonCenter_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'OldaleTown_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'OldaleTown_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'OldaleTown_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 5 },
  { name: 'OldaleTown_PokemonCenter_1F_EventScript_Gentleman', isGlobal: true, instrIndex: 11 },
  { name: 'OldaleTown_PokemonCenter_1F_EventScript_Boy', isGlobal: true, instrIndex: 13 },
  { name: 'OldaleTown_PokemonCenter_1F_EventScript_Girl', isGlobal: true, instrIndex: 15 },
  { name: 'OldaleTown_PokemonCenter_1F_EventScript_WirelessClubAvailable', isGlobal: true, instrIndex: 21 },
  { name: 'OldaleTown_PokemonCenter_1F_Text_TrainersCanUsePC', isGlobal: false, instrIndex: 24 },
  { name: 'OldaleTown_PokemonCenter_1F_Text_PokemonCentersAreGreat', isGlobal: false, instrIndex: 24 },
  { name: 'OldaleTown_PokemonCenter_1F_Text_WirelessClubNotAvailable', isGlobal: false, instrIndex: 24 },
  { name: 'OldaleTown_PokemonCenter_1F_Text_TradedInWirelessClub', isGlobal: false, instrIndex: 24 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=16
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Le PC dans le coin est à la\\n\""] },
  { kind: '.string', vals: ["\"disposition des DRESSEURS de POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Naturellement, tu peux l'utiliser\\n\""] },
  { kind: '.string', vals: ["\"quand tu veux.$\""] },
  { kind: '.string', vals: ["\"Les CENTRES POKéMON sont géniaux!\\p\""] },
  { kind: '.string', vals: ["\"Tu peux utiliser leurs services autant\\n\""] },
  { kind: '.string', vals: ["\"que tu veux. En plus, c'est gratuit.\\p\""] },
  { kind: '.string', vals: ["\"Pas de souci!$\""] },
  { kind: '.string', vals: ["\"L'étage du CENTRE POKéMON\\n\""] },
  { kind: '.string', vals: ["\"vient d'être construit.\\p\""] },
  { kind: '.string', vals: ["\"Mais ils prétendent avoir encore besoin\\n\""] },
  { kind: '.string', vals: ["\"de faire quelques petits travaux.$\""] },
  { kind: '.string', vals: ["\"L'étage du CENTRE POKéMON\\n\""] },
  { kind: '.string', vals: ["\"vient d'être construit.\\p\""] },
  { kind: '.string', vals: ["\"J'y ai tout de suite échangé des\\n\""] },
  { kind: '.string', vals: ["\"POKéMON.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 24 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","OldaleTown_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_OLDALE_TOWN"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_OLDALE_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["OldaleTown_PokemonCenter_1F_Text_TrainersCanUsePC","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["OldaleTown_PokemonCenter_1F_Text_PokemonCentersAreGreat","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_SYS_POKEDEX_GET","OldaleTown_PokemonCenter_1F_EventScript_WirelessClubAvailable"]},
  {op:"msgbox",args:["OldaleTown_PokemonCenter_1F_Text_WirelessClubNotAvailable","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["OldaleTown_PokemonCenter_1F_Text_TradedInWirelessClub","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
