// AUTO-GENERATED from data/maps/LavaridgeTown_HerbShop/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LavaridgeTown_HerbShop/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LavaridgeTown_HerbShop_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_HerbShop_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_HerbShop_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'LavaridgeTown_HerbShop_EventScript_ExpertM', isGlobal: true, instrIndex: 9 },
  { name: 'LavaridgeTown_HerbShop_EventScript_OldMan', isGlobal: true, instrIndex: 11 },
  { name: 'LavaridgeTown_HerbShop_EventScript_ExplainCharcoal', isGlobal: true, instrIndex: 20 },
  { name: 'LavaridgeTown_HerbShop_Text_WelcomeToHerbShop', isGlobal: false, instrIndex: 23 },
  { name: 'LavaridgeTown_HerbShop_Text_YouveComeToLookAtHerbalMedicine', isGlobal: false, instrIndex: 23 },
  { name: 'LavaridgeTown_HerbShop_Text_ExplainCharcoal', isGlobal: false, instrIndex: 23 },
  { name: 'LavaridgeTown_HerbShop_Text_HerbalMedicineWorksButMonWillDislike', isGlobal: false, instrIndex: 23 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=4, .string=16
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_ENERGY_POWDER"] },
  { kind: '.2byte', vals: ["ITEM_ENERGY_ROOT"] },
  { kind: '.2byte', vals: ["ITEM_HEAL_POWDER"] },
  { kind: '.2byte', vals: ["ITEM_REVIVAL_HERB"] },
  { kind: '.string', vals: ["\"Bienvenue à l'HERBORISTERIE, la maison\\n\""] },
  { kind: '.string', vals: ["\"des médicaments efficaces à bas prix!$\""] },
  { kind: '.string', vals: ["\"Tu viens chercher des médicaments\\n\""] },
  { kind: '.string', vals: ["\"à base de plantes à VERMILAVA?\\p\""] },
  { kind: '.string', vals: ["\"C'est très honorable.\\p\""] },
  { kind: '.string', vals: ["\"Je t'aime bien! Prends ça!$\""] },
  { kind: '.string', vals: ["\"Le CHARBON que je t'ai donné est utilisé\\n\""] },
  { kind: '.string', vals: ["\"pour faire des médicaments naturels.\\p\""] },
  { kind: '.string', vals: ["\"Il fait aussi des merveilles lorsqu'il\\n\""] },
  { kind: '.string', vals: ["\"est tenu par un POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Il augmente la puissance des attaques\\n\""] },
  { kind: '.string', vals: ["\"de type FEU.$\""] },
  { kind: '.string', vals: ["\"La médecine à base de plantes est\\n\""] },
  { kind: '.string', vals: ["\"extrêmement efficace. Mais tes POKéMON\\p\""] },
  { kind: '.string', vals: ["\"risquent de ne pas apprécier.\\n\""] },
  { kind: '.string', vals: ["\"Les médicaments sont très amers!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 23 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["LavaridgeTown_HerbShop_Text_WelcomeToHerbShop"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["LavaridgeTown_HerbShop_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["LavaridgeTown_HerbShop_Text_HerbalMedicineWorksButMonWillDislike","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_CHARCOAL","LavaridgeTown_HerbShop_EventScript_ExplainCharcoal"]},
  {op:"msgbox",args:["LavaridgeTown_HerbShop_Text_YouveComeToLookAtHerbalMedicine","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_CHARCOAL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_CHARCOAL"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LavaridgeTown_HerbShop_Text_ExplainCharcoal","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
