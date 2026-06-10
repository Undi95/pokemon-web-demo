// AUTO-GENERATED from data/maps/MauvilleCity_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MauvilleCity_Mart/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MauvilleCity_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MauvilleCity_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'MauvilleCity_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'MauvilleCity_Mart_EventScript_ExpertM', isGlobal: true, instrIndex: 9 },
  { name: 'MauvilleCity_Mart_EventScript_Man', isGlobal: true, instrIndex: 11 },
  { name: 'MauvilleCity_Mart_Text_ItemsToTemporarilyElevateStats', isGlobal: false, instrIndex: 13 },
  { name: 'MauvilleCity_Mart_Text_DecisionsDetermineBattle', isGlobal: false, instrIndex: 13 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=12, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.2byte', vals: ["ITEM_GUARD_SPEC"] },
  { kind: '.2byte', vals: ["ITEM_DIRE_HIT"] },
  { kind: '.2byte', vals: ["ITEM_X_ACCURACY"] },
  { kind: '.string', vals: ["\"Certains objets augmentent de façon\\n\""] },
  { kind: '.string', vals: ["\"temporaire les stats d'un POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Ceux qu'on utilise au combat sont\\n\""] },
  { kind: '.string', vals: ["\"l'ATTAQUE + et la DEFENSE +.\\p\""] },
  { kind: '.string', vals: ["\"Je crois qu'il y en a encore \\n\""] },
  { kind: '.string', vals: ["\"d'autres comme ça.$\""] },
  { kind: '.string', vals: ["\"Utiliser une certaine capacité ou\\n\""] },
  { kind: '.string', vals: ["\"utiliser un objet à la place…\\p\""] },
  { kind: '.string', vals: ["\"A mon avis, les décisions des DRESSEURS\\n\""] },
  { kind: '.string', vals: ["\"influent sur le déroulement du combat.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 13 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["MauvilleCity_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["MauvilleCity_Mart_Text_ItemsToTemporarilyElevateStats","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_Mart_Text_DecisionsDetermineBattle","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
