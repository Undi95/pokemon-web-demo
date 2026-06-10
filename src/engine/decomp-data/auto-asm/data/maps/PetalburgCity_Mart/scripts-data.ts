// AUTO-GENERATED from data/maps/PetalburgCity_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PetalburgCity_Mart/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PetalburgCity_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PetalburgCity_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'PetalburgCity_Mart_Pokemart_Basic', isGlobal: false, instrIndex: 9 },
  { name: 'PetalburgCity_Mart_EventScript_ExpandedItems', isGlobal: true, instrIndex: 10 },
  { name: 'PetalburgCity_Mart_Pokemart_Expanded', isGlobal: false, instrIndex: 14 },
  { name: 'PetalburgCity_Mart_EventScript_Woman', isGlobal: true, instrIndex: 15 },
  { name: 'PetalburgCity_Mart_EventScript_Boy', isGlobal: true, instrIndex: 17 },
  { name: 'PetalburgCity_Mart_EventScript_Man', isGlobal: true, instrIndex: 19 },
  { name: 'PetalburgCity_Mart_Text_WeakWillGrowStronger', isGlobal: false, instrIndex: 21 },
  { name: 'PetalburgCity_Mart_Text_RepelIsUseful', isGlobal: false, instrIndex: 21 },
  { name: 'PetalburgCity_Mart_Text_TakeSomeAntidotesWithYou', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=24, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_ESCAPE_ROPE"] },
  { kind: '.2byte', vals: ["ITEM_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.2byte', vals: ["ITEM_ORANGE_MAIL"] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_ESCAPE_ROPE"] },
  { kind: '.2byte', vals: ["ITEM_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.2byte', vals: ["ITEM_ORANGE_MAIL"] },
  { kind: '.string', vals: ["\"Même si un POKéMON est faible pour\\n\""] },
  { kind: '.string', vals: ["\"le moment, il deviendra plus fort.\\p\""] },
  { kind: '.string', vals: ["\"Le plus important, c'est l'amour!\\n\""] },
  { kind: '.string', vals: ["\"L'amour pour tes POKéMON!$\""] },
  { kind: '.string', vals: ["\"Utilises-tu REPOUSSE?\\n\""] },
  { kind: '.string', vals: ["\"Ça maintient les POKéMON éloignés.\\p\""] },
  { kind: '.string', vals: ["\"Très utile quand tu veux te dépêcher!$\""] },
  { kind: '.string', vals: ["\"As-tu des ANTIDOTES avec toi?\\p\""] },
  { kind: '.string', vals: ["\"Si tu avances avec un POKéMON\\n\""] },
  { kind: '.string', vals: ["\"empoisonné, il va perdre ses PV\\l\""] },
  { kind: '.string', vals: ["\"jusqu'à ce qu'il soit K.O. Alors\\l\""] },
  { kind: '.string', vals: ["\"prends des ANTIDOTES avec toi!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"goto_if_set",args:["FLAG_PETALBURG_MART_EXPANDED_ITEMS","PetalburgCity_Mart_EventScript_ExpandedItems"]},
  {op:"pokemart",args:["PetalburgCity_Mart_Pokemart_Basic"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"pokemart",args:["PetalburgCity_Mart_Pokemart_Expanded"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["PetalburgCity_Mart_Text_WeakWillGrowStronger","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PetalburgCity_Mart_Text_RepelIsUseful","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PetalburgCity_Mart_Text_TakeSomeAntidotesWithYou","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
