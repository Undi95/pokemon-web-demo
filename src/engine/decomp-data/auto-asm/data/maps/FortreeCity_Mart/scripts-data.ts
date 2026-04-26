// AUTO-GENERATED from data/maps/FortreeCity_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_Mart/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'FortreeCity_Mart_EventScript_Woman', isGlobal: true, instrIndex: 9 },
  { name: 'FortreeCity_Mart_EventScript_Girl', isGlobal: true, instrIndex: 11 },
  { name: 'FortreeCity_Mart_EventScript_Boy', isGlobal: true, instrIndex: 13 },
  { name: 'FortreeCity_Mart_Text_SuperRepelBetter', isGlobal: false, instrIndex: 15 },
  { name: 'FortreeCity_Mart_Text_StockUpOnItems', isGlobal: false, instrIndex: 15 },
  { name: 'FortreeCity_Mart_Text_RareCandyMakesMonGrow', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=10, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_ULTRA_BALL"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_HYPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_REVIVE"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_WOOD_MAIL"] },
  { kind: '.string', vals: ["\"SUPEREPOUSSE dure longtemps et\\n\""] },
  { kind: '.string', vals: ["\"fait tout le boulot.\\p\""] },
  { kind: '.string', vals: ["\"C'est plus efficace qu'un REPOUSSE\\n\""] },
  { kind: '.string', vals: ["\"ordinaire.$\""] },
  { kind: '.string', vals: ["\"Je prends toujours plus d'objets qu'il\\n\""] },
  { kind: '.string', vals: ["\"ne m'en faut réellement.\\p\""] },
  { kind: '.string', vals: ["\"On ne sait jamais ce qui peut arriver.\\n\""] },
  { kind: '.string', vals: ["\"Mieux vaut prévenir que guérir!$\""] },
  { kind: '.string', vals: ["\"Un SUPER BONBON fait automatiquement\\n\""] },
  { kind: '.string', vals: ["\"monter un POKéMON d'un niveau.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["FortreeCity_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["FortreeCity_Mart_Text_SuperRepelBetter","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_Mart_Text_StockUpOnItems","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_Mart_Text_RareCandyMakesMonGrow","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
