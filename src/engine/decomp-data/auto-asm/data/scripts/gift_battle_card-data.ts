// AUTO-GENERATED from data/scripts/gift_battle_card.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/gift_battle_card.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MysteryGiftScript_BattleCard', isGlobal: true, instrIndex: 0 },
  { name: 'MysteryGiftScript_BattleCardInfo', isGlobal: false, instrIndex: 14 },
  { name: 'sText_MysteryGiftBattleCountCard', isGlobal: false, instrIndex: 21 },
  { name: 'sText_MysteryGiftBattleCountCard_WonPrize', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=18
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"La CARTE COMBAT garde la trace\\n\""] },
  { kind: '.string', vals: ["\"de vos combats contre les\\p\""] },
  { kind: '.string', vals: ["\"DRESSEURS ayant la même\\n\""] },
  { kind: '.string', vals: ["\"CARTE.\\p\""] },
  { kind: '.string', vals: ["\"Recherchez les DRESSEURS ayant\\n\""] },
  { kind: '.string', vals: ["\"la même carte que vous.\\p\""] },
  { kind: '.string', vals: ["\"Vous pouvez voir le classement\\n\""] },
  { kind: '.string', vals: ["\"général en lisant les JOURNAUX.\\p\""] },
  { kind: '.string', vals: ["\"Vous devriez essayer!$\""] },
  { kind: '.string', vals: ["\"Merci d'utiliser le système\\n\""] },
  { kind: '.string', vals: ["\"CADEAU MYST.\\p\""] },
  { kind: '.string', vals: ["\"Félicitations!\\p\""] },
  { kind: '.string', vals: ["\"Vous recevez un prix pour avoir\\n\""] },
  { kind: '.string', vals: ["\"gagné trois combats!\\p\""] },
  { kind: '.string', vals: ["\"On espère que ça vous donnera\\n\""] },
  { kind: '.string', vals: ["\"encore plus envie de combattre.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"setvaddress",args:["MysteryGiftScript_BattleCard"]},
  {op:"vgoto_if_set",args:["FLAG_MYSTERY_GIFT_DONE","MysteryGiftScript_BattleCardInfo"]},
  {op:"setorcopyvar",args:["VAR_RESULT","GET_CARD_BATTLES_WON"]},
  {op:"specialvar",args:["VAR_0x8008","GetMysteryGiftCardStat"]},
  {op:"vgoto_if_ne",args:["VAR_0x8008","REQUIRED_CARD_BATTLES","MysteryGiftScript_BattleCardInfo"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftBattleCountCard_WonPrize"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"giveitem",args:["ITEM_POTION"]},
  {op:"release",args:[]},
  {op:"setflag",args:["FLAG_MYSTERY_GIFT_DONE"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"vmessage",args:["sText_MysteryGiftBattleCountCard"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
