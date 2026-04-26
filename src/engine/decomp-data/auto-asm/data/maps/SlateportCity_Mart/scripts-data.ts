// AUTO-GENERATED from data/maps/SlateportCity_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SlateportCity_Mart/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SlateportCity_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'SlateportCity_Mart_EventScript_BlackBelt', isGlobal: true, instrIndex: 9 },
  { name: 'SlateportCity_Mart_EventScript_Man', isGlobal: true, instrIndex: 11 },
  { name: 'SlateportCity_Mart_Text_SomeItemsOnlyAtMart', isGlobal: false, instrIndex: 13 },
  { name: 'SlateportCity_Mart_Text_GreatBallIsBetter', isGlobal: false, instrIndex: 13 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=9, .string=8
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_ESCAPE_ROPE"] },
  { kind: '.2byte', vals: ["ITEM_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_HARBOR_MAIL"] },
  { kind: '.string', vals: ["\"Il doit y avoir certains produits\\n\""] },
  { kind: '.string', vals: ["\"intéressants au MARCHE.\\p\""] },
  { kind: '.string', vals: ["\"Mais certains objets ne sont en vente\\n\""] },
  { kind: '.string', vals: ["\"que dans les BOUTIQUES POKéMON.$\""] },
  { kind: '.string', vals: ["\"La SUPER BALL est plus efficace que la\\n\""] },
  { kind: '.string', vals: ["\"POKé BALL pour attraper des POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Avec ça, je devrais pouvoir attraper\\n\""] },
  { kind: '.string', vals: ["\"ce POKéMON insaisissable…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 13 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["SlateportCity_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["SlateportCity_Mart_Text_SomeItemsOnlyAtMart","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SlateportCity_Mart_Text_GreatBallIsBetter","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
