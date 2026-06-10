// AUTO-GENERATED from data/maps/FortreeCity_DecorationShop/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_DecorationShop/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_DecorationShop_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_DecorationShop_EventScript_PokefanM', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_DecorationShop_EventScript_Girl', isGlobal: true, instrIndex: 2 },
  { name: 'FortreeCity_DecorationShop_EventScript_ClerkDesks', isGlobal: true, instrIndex: 4 },
  { name: 'FortreeCity_DecorationShop_PokemartDecor_Desks', isGlobal: false, instrIndex: 12 },
  { name: 'FortreeCity_DecorationShop_EventScript_ClerkChairs', isGlobal: true, instrIndex: 13 },
  { name: 'FortreeCity_DecorationShop_PokemartDecor_Chairs', isGlobal: false, instrIndex: 21 },
  { name: 'FortreeCity_DecorationShop_Text_MerchandiseSentToPC', isGlobal: false, instrIndex: 22 },
  { name: 'FortreeCity_DecorationShop_Text_BuyingDeskForDolls', isGlobal: false, instrIndex: 22 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=16, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["DECOR_SMALL_DESK"] },
  { kind: '.2byte', vals: ["DECOR_POKEMON_DESK"] },
  { kind: '.2byte', vals: ["DECOR_HEAVY_DESK"] },
  { kind: '.2byte', vals: ["DECOR_RAGGED_DESK"] },
  { kind: '.2byte', vals: ["DECOR_COMFORT_DESK"] },
  { kind: '.2byte', vals: ["DECOR_BRICK_DESK"] },
  { kind: '.2byte', vals: ["DECOR_CAMP_DESK"] },
  { kind: '.2byte', vals: ["DECOR_HARD_DESK"] },
  { kind: '.2byte', vals: ["DECOR_SMALL_CHAIR"] },
  { kind: '.2byte', vals: ["DECOR_POKEMON_CHAIR"] },
  { kind: '.2byte', vals: ["DECOR_HEAVY_CHAIR"] },
  { kind: '.2byte', vals: ["DECOR_RAGGED_CHAIR"] },
  { kind: '.2byte', vals: ["DECOR_COMFORT_CHAIR"] },
  { kind: '.2byte', vals: ["DECOR_BRICK_CHAIR"] },
  { kind: '.2byte', vals: ["DECOR_CAMP_CHAIR"] },
  { kind: '.2byte', vals: ["DECOR_HARD_CHAIR"] },
  { kind: '.string', vals: ["\"Ce que tu achètes ici est directement\\n\""] },
  { kind: '.string', vals: ["\"envoyé sur ton PC.\\p\""] },
  { kind: '.string', vals: ["\"C'est génial! J'aimerais bien qu'on me\\n\""] },
  { kind: '.string', vals: ["\"livre aussi comme ça, chez moi.$\""] },
  { kind: '.string', vals: ["\"Je vais acheter un beau bureau et\\n\""] },
  { kind: '.string', vals: ["\"mettre mes jolies POUPEES dessus.\\p\""] },
  { kind: '.string', vals: ["\"Sinon, quand je vais décorer ma BASE\\n\""] },
  { kind: '.string', vals: ["\"SECRETE, mes POUPEES vont être salies\\l\""] },
  { kind: '.string', vals: ["\"et couvertes d'échardes.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 22 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["FortreeCity_DecorationShop_Text_MerchandiseSentToPC","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_DecorationShop_Text_BuyingDeskForDolls","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemartdecoration",args:["FortreeCity_DecorationShop_PokemartDecor_Desks"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemartdecoration",args:["FortreeCity_DecorationShop_PokemartDecor_Chairs"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
] as const;
