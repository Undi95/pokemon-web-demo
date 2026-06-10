// AUTO-GENERATED from data/maps/FallarborTown_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FallarborTown_Mart/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FallarborTown_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FallarborTown_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'FallarborTown_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'FallarborTown_Mart_EventScript_Woman', isGlobal: true, instrIndex: 9 },
  { name: 'FallarborTown_Mart_EventScript_PokefanM', isGlobal: true, instrIndex: 11 },
  { name: 'FallarborTown_Mart_EventScript_Skitty', isGlobal: true, instrIndex: 13 },
  { name: 'FallarborTown_Mart_Text_DecidingSkittyEvolve', isGlobal: false, instrIndex: 21 },
  { name: 'FallarborTown_Mart_Text_Skitty', isGlobal: false, instrIndex: 21 },
  { name: 'FallarborTown_Mart_Text_SellNuggetIFound', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=12, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_ESCAPE_ROPE"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPECIAL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPEED"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.2byte', vals: ["ITEM_DIRE_HIT"] },
  { kind: '.2byte', vals: ["ITEM_GUARD_SPEC"] },
  { kind: '.string', vals: ["\"J'ai du mal à me décider. Faut-il que\\n\""] },
  { kind: '.string', vals: ["\"je fasse évoluer mon SKITTY?\\p\""] },
  { kind: '.string', vals: ["\"Il me suffirait d'utiliser cette PIERRE\\n\""] },
  { kind: '.string', vals: ["\"LUNE, mais je n'arrive pas à me décider…\\p\""] },
  { kind: '.string', vals: ["\"Si je le fais évoluer, il sera bien plus\\n\""] },
  { kind: '.string', vals: ["\"puissant.\\p\""] },
  { kind: '.string', vals: ["\"Mais il changera aussi d'apparence.$\""] },
  { kind: '.string', vals: ["\"SKITTY: Kiiiiity?$\""] },
  { kind: '.string', vals: ["\"J'ai trouvé une PEPITE, ici…\\n\""] },
  { kind: '.string', vals: ["\"Je suppose que je vais devoir la vendre,\\l\""] },
  { kind: '.string', vals: ["\"puisqu'elle ne sert à rien d'autre.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["FallarborTown_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["FallarborTown_Mart_Text_DecidingSkittyEvolve","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_Mart_Text_SellNuggetIFound","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_SKITTY","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["FallarborTown_Mart_Text_Skitty","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
