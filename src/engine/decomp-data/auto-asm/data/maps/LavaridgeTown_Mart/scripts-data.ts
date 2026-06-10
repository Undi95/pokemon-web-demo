// AUTO-GENERATED from data/maps/LavaridgeTown_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LavaridgeTown_Mart/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LavaridgeTown_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'LavaridgeTown_Mart_EventScript_ExpertM', isGlobal: true, instrIndex: 9 },
  { name: 'LavaridgeTown_Mart_EventScript_OldWoman', isGlobal: true, instrIndex: 11 },
  { name: 'LavaridgeTown_Mart_Text_XSpeedFirstStrike', isGlobal: false, instrIndex: 13 },
  { name: 'LavaridgeTown_Mart_Text_LocalSpecialtyOnMtChimney', isGlobal: false, instrIndex: 13 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=9, .string=8
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_BURN_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_REVIVE"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.string', vals: ["\"Utilise VITESSE + pour augmenter la\\n\""] },
  { kind: '.string', vals: ["\"VITESSE d'un POKéMON au combat.\\p\""] },
  { kind: '.string', vals: ["\"Ça lui donnera plus de chances de\\n\""] },
  { kind: '.string', vals: ["\"frapper le premier, un sacré avantage!$\""] },
  { kind: '.string', vals: ["\"Au sommet du MONT CHIMNEE, on\\n\""] },
  { kind: '.string', vals: ["\"trouve une spécialité locale qu'on ne\\l\""] },
  { kind: '.string', vals: ["\"peut acheter que là-haut.\\p\""] },
  { kind: '.string', vals: ["\"Donne-la à un POKéMON. Il sera ravi.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 13 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LavaridgeTown_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["LavaridgeTown_Mart_Text_XSpeedFirstStrike","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LavaridgeTown_Mart_Text_LocalSpecialtyOnMtChimney","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
