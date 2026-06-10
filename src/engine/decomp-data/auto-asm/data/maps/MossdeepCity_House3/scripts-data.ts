// AUTO-GENERATED from data/maps/MossdeepCity_House3/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MossdeepCity_House3/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MossdeepCity_House3_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House3_EventScript_SuperRodFisherman', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House3_EventScript_ReceivedSuperRod', isGlobal: true, instrIndex: 11 },
  { name: 'MossdeepCity_House3_EventScript_DeclineSuperRod', isGlobal: true, instrIndex: 14 },
  { name: 'MossdeepCity_House3_Text_YouWantSuperRod', isGlobal: false, instrIndex: 17 },
  { name: 'MossdeepCity_House3_Text_SuperRodIsSuper', isGlobal: false, instrIndex: 17 },
  { name: 'MossdeepCity_House3_Text_TryDroppingRodInWater', isGlobal: false, instrIndex: 17 },
  { name: 'MossdeepCity_House3_Text_DontYouLikeToFish', isGlobal: false, instrIndex: 17 },
  { name: 'MossdeepCity_House3_Text_GoAfterSeafloorPokemon', isGlobal: false, instrIndex: 17 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=14
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Hé, toi, DRESSEUR!\\n\""] },
  { kind: '.string', vals: ["\"Une MEGA CANNE, c'est vraiment super!\\p\""] },
  { kind: '.string', vals: ["\"Tu peux dire c'que tu veux, ce bébé peut\\n\""] },
  { kind: '.string', vals: ["\"attraper des POKéMON au fond de la mer!\\p\""] },
  { kind: '.string', vals: ["\"Qu'est-ce que t'en penses?\\n\""] },
  { kind: '.string', vals: ["\"Tu veux qu'on essaie, hein?$\""] },
  { kind: '.string', vals: ["\"Tu paries, tu paries! Après tout, une\\n\""] },
  { kind: '.string', vals: ["\"MEGA CANNE, c'est super!$\""] },
  { kind: '.string', vals: ["\"S'il y a de l'eau, essaie de lancer ta\\n\""] },
  { kind: '.string', vals: ["\"CANNE et attends de voir si ça mord!$\""] },
  { kind: '.string', vals: ["\"Hum?\\n\""] },
  { kind: '.string', vals: ["\"T'aimes pas pêcher?$\""] },
  { kind: '.string', vals: ["\"Essaie d'attraper les POKéMON au fond\\n\""] },
  { kind: '.string', vals: ["\"de la mer avec ta MEGA CANNE.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_SUPER_ROD","MossdeepCity_House3_EventScript_ReceivedSuperRod"]},
  {op:"msgbox",args:["MossdeepCity_House3_Text_YouWantSuperRod","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","MossdeepCity_House3_EventScript_DeclineSuperRod"]},
  {op:"msgbox",args:["MossdeepCity_House3_Text_SuperRodIsSuper","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_SUPER_ROD"]},
  {op:"setflag",args:["FLAG_RECEIVED_SUPER_ROD"]},
  {op:"msgbox",args:["MossdeepCity_House3_Text_TryDroppingRodInWater","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_House3_Text_GoAfterSeafloorPokemon","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_House3_Text_DontYouLikeToFish","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
