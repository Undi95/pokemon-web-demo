// AUTO-GENERATED from data/maps/OldaleTown_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/OldaleTown_Mart/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'OldaleTown_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'OldaleTown_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'OldaleTown_Mart_Pokemart_Basic', isGlobal: false, instrIndex: 9 },
  { name: 'OldaleTown_Mart_ExpandedItems', isGlobal: true, instrIndex: 10 },
  { name: 'OldaleTown_Mart_Pokemart_Expanded', isGlobal: false, instrIndex: 14 },
  { name: 'OldaleTown_Mart_EventScript_Woman', isGlobal: true, instrIndex: 15 },
  { name: 'OldaleTown_Mart_EventScript_PokeBallsInStock', isGlobal: true, instrIndex: 21 },
  { name: 'OldaleTown_Mart_EventScript_Boy', isGlobal: true, instrIndex: 24 },
  { name: 'OldaleTown_Mart_Text_PokeBallsAreSoldOut', isGlobal: false, instrIndex: 26 },
  { name: 'OldaleTown_Mart_Text_ImGoingToBuyPokeBalls', isGlobal: false, instrIndex: 26 },
  { name: 'OldaleTown_Mart_Text_RestoreHPWithPotion', isGlobal: false, instrIndex: 26 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=9, .string=8
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.string', vals: ["\"Le stock est épuisé. Je ne peux pas\\n\""] },
  { kind: '.string', vals: ["\"acheter de POKé BALLS.$\""] },
  { kind: '.string', vals: ["\"Je vais acheter plein de POKé BALLS\\n\""] },
  { kind: '.string', vals: ["\"et attraper plein de POKéMON!$\""] },
  { kind: '.string', vals: ["\"Si un POKéMON est blessé et perd ses\\n\""] },
  { kind: '.string', vals: ["\"PV, il est K.O. et ne peut plus se battre.\\p\""] },
  { kind: '.string', vals: ["\"Pour éviter que tes POKéMON ne soient\\n\""] },
  { kind: '.string', vals: ["\"K.O., soigne-les avec une POTION.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 26 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"goto_if_set",args:["FLAG_ADVENTURE_STARTED","OldaleTown_Mart_ExpandedItems"]},
  {op:"pokemart",args:["OldaleTown_Mart_Pokemart_Basic"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"pokemart",args:["OldaleTown_Mart_Pokemart_Expanded"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_ADVENTURE_STARTED","OldaleTown_Mart_EventScript_PokeBallsInStock"]},
  {op:"msgbox",args:["OldaleTown_Mart_Text_PokeBallsAreSoldOut","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["OldaleTown_Mart_Text_ImGoingToBuyPokeBalls","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["OldaleTown_Mart_Text_RestoreHPWithPotion","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
