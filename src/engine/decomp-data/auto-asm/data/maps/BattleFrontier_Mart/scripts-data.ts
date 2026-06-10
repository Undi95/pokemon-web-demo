// AUTO-GENERATED from data/maps/BattleFrontier_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_Mart/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'BattleFrontier_Mart_EventScript_OldMan', isGlobal: true, instrIndex: 9 },
  { name: 'BattleFrontier_Mart_EventScript_OldWoman', isGlobal: true, instrIndex: 11 },
  { name: 'BattleFrontier_Mart_EventScript_Boy', isGlobal: true, instrIndex: 17 },
  { name: 'BattleFrontier_Mart_Text_ChaperonGrandson', isGlobal: false, instrIndex: 19 },
  { name: 'BattleFrontier_Mart_Text_ProteinMakeNiceGift', isGlobal: false, instrIndex: 19 },
  { name: 'BattleFrontier_Mart_Text_FacilitiesDontAllowItems', isGlobal: false, instrIndex: 19 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=13, .string=13
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_ULTRA_BALL"] },
  { kind: '.2byte', vals: ["ITEM_HYPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_MAX_POTION"] },
  { kind: '.2byte', vals: ["ITEM_FULL_RESTORE"] },
  { kind: '.2byte', vals: ["ITEM_FULL_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_REVIVE"] },
  { kind: '.2byte', vals: ["ITEM_MAX_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_PROTEIN"] },
  { kind: '.2byte', vals: ["ITEM_CALCIUM"] },
  { kind: '.2byte', vals: ["ITEM_IRON"] },
  { kind: '.2byte', vals: ["ITEM_ZINC"] },
  { kind: '.2byte', vals: ["ITEM_CARBOS"] },
  { kind: '.2byte', vals: ["ITEM_HP_UP"] },
  { kind: '.string', vals: ["\"Nous sommes venus accompagner\\n\""] },
  { kind: '.string', vals: ["\"notre petit-fils.\\p\""] },
  { kind: '.string', vals: ["\"On en profite pour acheter quelques\\n\""] },
  { kind: '.string', vals: ["\"souvenirs.$\""] },
  { kind: '.string', vals: ["\"Que penses-tu de ça, chéri?\\n\""] },
  { kind: '.string', vals: ["\"Ça ferait un joli cadeau, non?\\p\""] },
  { kind: '.string', vals: ["\"PRO… TE… INE?\\n\""] },
  { kind: '.string', vals: ["\"Ça m'a l'air d'être délicieux!$\""] },
  { kind: '.string', vals: ["\"Dans la ZONE DE COMBAT, on n'a pas\\n\""] },
  { kind: '.string', vals: ["\"toujours le droit d'utiliser des objets\\l\""] },
  { kind: '.string', vals: ["\"en combat.\\p\""] },
  { kind: '.string', vals: ["\"Ça rend les choses encore plus\\n\""] },
  { kind: '.string', vals: ["\"difficiles!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 19 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["BattleFrontier_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["BattleFrontier_Mart_Text_ChaperonGrandson","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"applymovement",args:["LOCALID_FRONTIER_MART_OLD_WOMAN","Common_Movement_FaceDown"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["BattleFrontier_Mart_Text_ProteinMakeNiceGift","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_Mart_Text_FacilitiesDontAllowItems","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
