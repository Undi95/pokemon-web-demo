// AUTO-GENERATED from data/scripts/gift_old_sea_map.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_old_sea_map.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_OldSeaMap', isGlobal: true, instrIndex: 0 },
  { name: 'OldSeaMap_NoBagSpace', isGlobal: false, instrIndex: 20 },
  { name: 'OldSeaMap_Obtained', isGlobal: false, instrIndex: 25 },
  { name: 'sText_MysteryGiftOldSeaMapForYou', isGlobal: false, instrIndex: 30 },
  { name: 'sText_MysteryGiftOldSeaMapUseAtPort', isGlobal: false, instrIndex: 30 },
  { name: 'sText_MysteryGiftOldSeaMapThankYou', isGlobal: false, instrIndex: 30 },
  { name: 'sText_MysteryGiftOldSeaMapBagFull', isGlobal: false, instrIndex: 30 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=14
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"Vous devez être {PLAYER}.\\n\""] },
  { kind: '.string', vals: ["\"Il y a une VIEILLECARTE pour vous.$\""] },
  { kind: '.string', vals: ["\"Elle peut être utilisée au port de\\n\""] },
  { kind: '.string', vals: ["\"NENUCRIQUE.\\p\""] },
  { kind: '.string', vals: ["\"Essayez-la pour voir de quoi \\n\""] },
  { kind: '.string', vals: ["\"il s'agit.$\""] },
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.$\""] },
  { kind: '.string', vals: ["\"Oh, je regrette, {PLAYER}. La POCHE\\n\""] },
  { kind: '.string', vals: ["\"OBJ. RARES du SAC est pleine.\\p\""] },
  { kind: '.string', vals: ["\"Faites de la place dans votre SAC\\n\""] },
  { kind: '.string', vals: ["\"et revenez me voir.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_OldSeaMap"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vgoto_if_set",args:["FLAG_RECEIVED_OLD_SEA_MAP","OldSeaMap_Obtained"]},
  {op:"vgoto_if_set",args:["FLAG_CAUGHT_MEW","OldSeaMap_Obtained"]},
  {op:"checkitem",args:["ITEM_OLD_SEA_MAP"]},
  {op:"vgoto_if_eq",args:["VAR_RESULT",1,"OldSeaMap_Obtained"]},
  {op:"vmessage",args:["sText_MysteryGiftOldSeaMapForYou"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"checkitemspace",args:["ITEM_OLD_SEA_MAP"]},
  {op:"vgoto_if_eq",args:["VAR_RESULT",0,"OldSeaMap_NoBagSpace"]},
  {op:"giveitem",args:["ITEM_OLD_SEA_MAP"]},
  {op:"setflag",args:["FLAG_ENABLE_SHIP_FARAWAY_ISLAND"]},
  {op:"setflag",args:["FLAG_RECEIVED_OLD_SEA_MAP"]},
  {op:"vmessage",args:["sText_MysteryGiftOldSeaMapUseAtPort"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftOldSeaMapBagFull"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftOldSeaMapThankYou"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
