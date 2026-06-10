// AUTO-GENERATED from data/maps/LilycoveCity_DepartmentStore_2F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LilycoveCity_DepartmentStore_2F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_DepartmentStore_2F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_2F_EventScript_Cook', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_DepartmentStore_2F_EventScript_PokefanF', isGlobal: true, instrIndex: 2 },
  { name: 'LilycoveCity_DepartmentStore_2F_EventScript_Sailor', isGlobal: true, instrIndex: 4 },
  { name: 'LilycoveCity_DepartmentStore_2F_EventScript_ClerkLeft', isGlobal: true, instrIndex: 6 },
  { name: 'LilycoveCity_DepartmentStore_2F_Pokemart1', isGlobal: false, instrIndex: 14 },
  { name: 'LilycoveCity_DepartmentStore_2F_EventScript_ClerkRight', isGlobal: true, instrIndex: 15 },
  { name: 'LilycoveCity_DepartmentStore_2F_Pokemart2', isGlobal: false, instrIndex: 23 },
  { name: 'LilycoveCity_DepartmentStore_2F_Text_LearnToUseItemsProperly', isGlobal: false, instrIndex: 24 },
  { name: 'LilycoveCity_DepartmentStore_2F_Text_GoodGiftForHusband', isGlobal: false, instrIndex: 24 },
  { name: 'LilycoveCity_DepartmentStore_2F_Text_StockUpOnItems', isGlobal: false, instrIndex: 24 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=21, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_POKE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_ULTRA_BALL"] },
  { kind: '.2byte', vals: ["ITEM_ESCAPE_ROPE"] },
  { kind: '.2byte', vals: ["ITEM_FULL_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_BURN_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_ICE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_FLUFFY_TAIL"] },
  { kind: '.2byte', vals: ["ITEM_POTION"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_HYPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_MAX_POTION"] },
  { kind: '.2byte', vals: ["ITEM_REVIVE"] },
  { kind: '.2byte', vals: ["ITEM_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_MAX_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_WAVE_MAIL"] },
  { kind: '.2byte', vals: ["ITEM_MECH_MAIL"] },
  { kind: '.string', vals: ["\"Apprendre à utiliser correctement les\\n\""] },
  { kind: '.string', vals: ["\"objets, c'est vraiment la base de tout.$\""] },
  { kind: '.string', vals: ["\"Mon mari m'attend à la maison.\\n\""] },
  { kind: '.string', vals: ["\"Qu'est-ce qui pourrait lui faire plaisir?$\""] },
  { kind: '.string', vals: ["\"Je pars pour un long voyage.\\n\""] },
  { kind: '.string', vals: ["\"Il faut que je fasse le plein d'objets.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 24 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_2F_Text_LearnToUseItemsProperly","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_2F_Text_GoodGiftForHusband","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_DepartmentStore_2F_Text_StockUpOnItems","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LilycoveCity_DepartmentStore_2F_Pokemart1"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LilycoveCity_DepartmentStore_2F_Pokemart2"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
] as const;
