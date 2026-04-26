// AUTO-GENERATED from data/maps/PacifidlogTown/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PacifidlogTown/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PacifidlogTown_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'PacifidlogTown_OnResume', isGlobal: false, instrIndex: 4 },
  { name: 'PacifidlogTown_EventScript_NinjaBoy', isGlobal: true, instrIndex: 6 },
  { name: 'PacifidlogTown_EventScript_Girl', isGlobal: true, instrIndex: 8 },
  { name: 'PacifidlogTown_EventScript_Fisherman', isGlobal: true, instrIndex: 10 },
  { name: 'PacifidlogTown_EventScript_TownSign', isGlobal: true, instrIndex: 12 },
  { name: 'PacifidlogTown_Text_FastRunningCurrent', isGlobal: false, instrIndex: 14 },
  { name: 'PacifidlogTown_Text_NeatHousesOnWater', isGlobal: false, instrIndex: 14 },
  { name: 'PacifidlogTown_Text_SkyPillarTooScary', isGlobal: false, instrIndex: 14 },
  { name: 'PacifidlogTown_Text_TownSign', isGlobal: false, instrIndex: 14 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=18
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Le courant de la mer entre PACIFIVILLE\\n\""] },
  { kind: '.string', vals: ["\"et POIVRESSEL est très fort.\\p\""] },
  { kind: '.string', vals: ["\"Si tu décidais de faire du SURF,\\n\""] },
  { kind: '.string', vals: ["\"tu pourrais te faire emporter et\\l\""] },
  { kind: '.string', vals: ["\"te retrouver très loin d'ici.$\""] },
  { kind: '.string', vals: ["\"Regarde comme c'est chouette!\\n\""] },
  { kind: '.string', vals: ["\"Ces maisons sont construites sur l'eau.\\p\""] },
  { kind: '.string', vals: ["\"Je suis né ici!$\""] },
  { kind: '.string', vals: ["\"LE PILIER CELESTE?\\p\""] },
  { kind: '.string', vals: ["\"Oh, tu veux sûrement parler de cette\\n\""] },
  { kind: '.string', vals: ["\"très très grande tour un peu plus loin.\\p\""] },
  { kind: '.string', vals: ["\"Si tu veux mon avis, il faut être fou\\n\""] },
  { kind: '.string', vals: ["\"pour vouloir monter si haut!\\p\""] },
  { kind: '.string', vals: ["\"Vivre au niveau de la mer, ici à\\n\""] },
  { kind: '.string', vals: ["\"PACIFIVILLE, voilà ce qui me va!$\""] },
  { kind: '.string', vals: ["\"PACIFIVILLE\\p\""] },
  { kind: '.string', vals: ["\"“Là où le soleil du matin se reflète\\n\""] },
  { kind: '.string', vals: ["\"sur les eaux.”$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","PacifidlogTown_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","PacifidlogTown_OnResume"]},
  {op:"setflag",args:["FLAG_VISITED_PACIFIDLOG_TOWN"]},
  {op:"end",args:[]},
  {op:"setstepcallback",args:["STEP_CB_PACIFIDLOG_BRIDGE"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_Text_NeatHousesOnWater","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_Text_FastRunningCurrent","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_Text_SkyPillarTooScary","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_Text_TownSign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
