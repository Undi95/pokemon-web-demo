// AUTO-GENERATED from data/maps/RustboroCity_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_Mart/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Mart_EventScript_PokemartBasic', isGlobal: true, instrIndex: 7 },
  { name: 'RustboroCity_Mart_Pokemart_Basic', isGlobal: false, instrIndex: 11 },
  { name: 'RustboroCity_Mart_EventScript_PokemartExpanded', isGlobal: true, instrIndex: 12 },
  { name: 'RustboroCity_Mart_Pokemart_Expanded', isGlobal: false, instrIndex: 16 },
  { name: 'RustboroCity_Mart_EventScript_PokefanF', isGlobal: true, instrIndex: 17 },
  { name: 'RustboroCity_Mart_EventScript_Boy', isGlobal: true, instrIndex: 19 },
  { name: 'RustboroCity_Mart_EventScript_BugCatcher', isGlobal: true, instrIndex: 21 },
  { name: 'RustboroCity_Mart_Text_BuyingHealsInCaseOfShroomish', isGlobal: false, instrIndex: 23 },
  { name: 'RustboroCity_Mart_Text_ShouldBuySuperPotionsInstead', isGlobal: false, instrIndex: 23 },
  { name: 'RustboroCity_Mart_Text_GettingEscapeRopeJustInCase', isGlobal: false, instrIndex: 23 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=22, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_ESCAPE_ROPE"] },
  { kind: '.2byte', vals: ["ITEM_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_TIMER_BALL"] },
  { kind: '.2byte', vals: ["ITEM_REPEAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_ESCAPE_ROPE"] },
  { kind: '.2byte', vals: ["ITEM_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.string', vals: ["\"J'achète des ANTI-PARA et des\\n\""] },
  { kind: '.string', vals: ["\"ANTIDOTES.\\p\""] },
  { kind: '.string', vals: ["\"C'est juste au cas où je tomberais sur\\n\""] },
  { kind: '.string', vals: ["\"un BALIGNON au BOIS CLEMENTI.$\""] },
  { kind: '.string', vals: ["\"Mon POKéMON a évolué.\\n\""] },
  { kind: '.string', vals: ["\"Il a plein de PV maintenant.\\p\""] },
  { kind: '.string', vals: ["\"Je ferais mieux d'acheter des SUPER\\n\""] },
  { kind: '.string', vals: ["\"POTIONS plutôt que de simples POTIONS.$\""] },
  { kind: '.string', vals: ["\"J'ai pris une CORDE SORTIE, juste au\\n\""] },
  { kind: '.string', vals: ["\"cas où je me perdrais dans une caverne.\\p\""] },
  { kind: '.string', vals: ["\"Il me suffit de l'utiliser pour me\\n\""] },
  { kind: '.string', vals: ["\"retrouver directement à l'entrée.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 23 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"goto_if_unset",args:["FLAG_MET_DEVON_EMPLOYEE","RustboroCity_Mart_EventScript_PokemartBasic"]},
  {op:"goto_if_set",args:["FLAG_MET_DEVON_EMPLOYEE","RustboroCity_Mart_EventScript_PokemartExpanded"]},
  {op:"end",args:[]},
  {op:"pokemart",args:["RustboroCity_Mart_Pokemart_Basic"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"pokemart",args:["RustboroCity_Mart_Pokemart_Expanded"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["RustboroCity_Mart_Text_BuyingHealsInCaseOfShroomish","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_Mart_Text_ShouldBuySuperPotionsInstead","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_Mart_Text_GettingEscapeRopeJustInCase","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
