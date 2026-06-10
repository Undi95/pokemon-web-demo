// AUTO-GENERATED from data/maps/PacifidlogTown_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PacifidlogTown_PokemonCenter_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PacifidlogTown_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'PacifidlogTown_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 4 },
  { name: 'PacifidlogTown_PokemonCenter_1F_EventScript_Girl', isGlobal: true, instrIndex: 10 },
  { name: 'PacifidlogTown_PokemonCenter_1F_EventScript_Woman', isGlobal: true, instrIndex: 12 },
  { name: 'PacifidlogTown_PokemonCenter_1F_EventScript_OldMan', isGlobal: true, instrIndex: 14 },
  { name: 'PacifidlogTown_PokemonCenter_1F_Text_WhatColorTrainerCard', isGlobal: false, instrIndex: 16 },
  { name: 'PacifidlogTown_PokemonCenter_1F_Text_OnColonyOfCorsola', isGlobal: false, instrIndex: 16 },
  { name: 'PacifidlogTown_PokemonCenter_1F_Text_AncestorsLivedOnBoats', isGlobal: false, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"De quelle couleur est ta CARTE DE\\n\""] },
  { kind: '.string', vals: ["\"DRESSEUR? La mienne est cuivrée!$\""] },
  { kind: '.string', vals: ["\"PACIFIVILLE flotte au-dessus\\n\""] },
  { kind: '.string', vals: ["\"d'une colonie de CORAYON.\\p\""] },
  { kind: '.string', vals: ["\"Ça semble incroyable, non?$\""] },
  { kind: '.string', vals: ["\"On dit que les ancêtres des habitants\\n\""] },
  { kind: '.string', vals: ["\"de PACIFIVILLE sont nés sur\\l\""] },
  { kind: '.string', vals: ["\"des bateaux, pour y vivre et y mourir.\\p\""] },
  { kind: '.string', vals: ["\"Je crois qu'ils vivaient comme ça\\n\""] },
  { kind: '.string', vals: ["\"parce qu'ils cherchaient quelque\\l\""] },
  { kind: '.string', vals: ["\"chose.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 16 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","PacifidlogTown_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_PACIFIDLOG_TOWN"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_PACIFIDLOG_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_PokemonCenter_1F_Text_WhatColorTrainerCard","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_PokemonCenter_1F_Text_OnColonyOfCorsola","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_PokemonCenter_1F_Text_AncestorsLivedOnBoats","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
