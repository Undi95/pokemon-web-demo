// AUTO-GENERATED from data/maps/BattleFrontier_Lounge8/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_Lounge8/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_Lounge8_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Lounge8_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Lounge8_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'BattleFrontier_Lounge8_EventScript_NinjaBoy', isGlobal: true, instrIndex: 4 },
  { name: 'BattleFrontier_Lounge8_Text_WhatATrainerNeeds', isGlobal: false, instrIndex: 6 },
  { name: 'BattleFrontier_Lounge8_Text_KnowAboutFrontierBrains', isGlobal: false, instrIndex: 6 },
  { name: 'BattleFrontier_Lounge8_Text_ToldMeIHaveTalentForBattling', isGlobal: false, instrIndex: 6 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=23
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ce dont un DRESSEUR a besoin…\\p\""] },
  { kind: '.string', vals: ["\"Savoir…\\n\""] },
  { kind: '.string', vals: ["\"Tactique…\\l\""] },
  { kind: '.string', vals: ["\"Chance…\\l\""] },
  { kind: '.string', vals: ["\"Cran…\\l\""] },
  { kind: '.string', vals: ["\"Esprit…\\l\""] },
  { kind: '.string', vals: ["\"Bravoure…\\l\""] },
  { kind: '.string', vals: ["\"Capacité…\\p\""] },
  { kind: '.string', vals: ["\"Parfait, je suis prêt!\\n\""] },
  { kind: '.string', vals: ["\"Je vais relever tous les défis!\\p\""] },
  { kind: '.string', vals: ["\"Quoi? Des POKéMON?\\n\""] },
  { kind: '.string', vals: ["\"C'est quoi ça?$\""] },
  { kind: '.string', vals: ["\"Tu as entendu parler des MENEURS DE\\n\""] },
  { kind: '.string', vals: ["\"ZONE?\\p\""] },
  { kind: '.string', vals: ["\"C'est ainsi que SCOTT appelle les sept\\n\""] },
  { kind: '.string', vals: ["\"DRESSEURS responsables de chaque\\l\""] },
  { kind: '.string', vals: ["\"bâtiment de la ZONE DE COMBAT.$\""] },
  { kind: '.string', vals: ["\"A la TOUR DE COMBAT, une fille m'a dit\\n\""] },
  { kind: '.string', vals: ["\"que j'avais beaucoup de talent!\\p\""] },
  { kind: '.string', vals: ["\"Moi, je préfère les CONCOURS POKéMON!\\n\""] },
  { kind: '.string', vals: ["\"Mais je ne suis pas fort!\\p\""] },
  { kind: '.string', vals: ["\"On n'est pas forcément doué pour les\\n\""] },
  { kind: '.string', vals: ["\"choses qu'on aime…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["BattleFrontier_Lounge8_Text_WhatATrainerNeeds","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_Lounge8_Text_KnowAboutFrontierBrains","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_Lounge8_Text_ToldMeIHaveTalentForBattling","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
