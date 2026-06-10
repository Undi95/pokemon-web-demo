// AUTO-GENERATED from data/maps/SootopolisCity_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_Mart/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'SootopolisCity_Mart_EventScript_FatMan', isGlobal: true, instrIndex: 9 },
  { name: 'SootopolisCity_Mart_EventScript_FatManNoLegendaries', isGlobal: true, instrIndex: 16 },
  { name: 'SootopolisCity_Mart_EventScript_Gentleman', isGlobal: true, instrIndex: 19 },
  { name: 'SootopolisCity_Mart_EventScript_GentlemanNoLegendaries', isGlobal: true, instrIndex: 26 },
  { name: 'SootopolisCity_Mart_Text_PPUpIsGreat', isGlobal: false, instrIndex: 29 },
  { name: 'SootopolisCity_Mart_Text_TooScaryOutside', isGlobal: false, instrIndex: 29 },
  { name: 'SootopolisCity_Mart_Text_FullRestoreItemOfDreams', isGlobal: false, instrIndex: 29 },
  { name: 'SootopolisCity_Mart_Text_DidSomethingAwaken', isGlobal: false, instrIndex: 29 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=9, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_ULTRA_BALL"] },
  { kind: '.2byte', vals: ["ITEM_HYPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_MAX_POTION"] },
  { kind: '.2byte', vals: ["ITEM_FULL_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_REVIVE"] },
  { kind: '.2byte', vals: ["ITEM_MAX_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.2byte', vals: ["ITEM_SHADOW_MAIL"] },
  { kind: '.string', vals: ["\"Le PP PLUS est génial!\\p\""] },
  { kind: '.string', vals: ["\"Il augmente les POINTS DE POUVOIR,\\n\""] },
  { kind: '.string', vals: ["\"ou PP, d'une capacité d'un POKéMON.$\""] },
  { kind: '.string', vals: ["\"Que… Que se passe-t-il?\\p\""] },
  { kind: '.string', vals: ["\"Je voudrais vraiment savoir, mais j'ai\\n\""] },
  { kind: '.string', vals: ["\"trop peur d'aller dehors!$\""] },
  { kind: '.string', vals: ["\"Tu connais GUERISON?\\p\""] },
  { kind: '.string', vals: ["\"Restitution de tous les PV!\\n\""] },
  { kind: '.string', vals: ["\"Plus de problème de statut!\\p\""] },
  { kind: '.string', vals: ["\"C'est vraiment l'objet idéal!$\""] },
  { kind: '.string', vals: ["\"Ce temps…\\n\""] },
  { kind: '.string', vals: ["\"Quelque chose s'est éveillé?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 29 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["SootopolisCity_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_ge",args:["VAR_SKY_PILLAR_STATE",2,"SootopolisCity_Mart_EventScript_FatManNoLegendaries"]},
  {op:"goto_if_unset",args:["FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN","SootopolisCity_Mart_EventScript_FatManNoLegendaries"]},
  {op:"msgbox",args:["SootopolisCity_Mart_Text_TooScaryOutside","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_Mart_Text_PPUpIsGreat","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_ge",args:["VAR_SKY_PILLAR_STATE",2,"SootopolisCity_Mart_EventScript_GentlemanNoLegendaries"]},
  {op:"goto_if_unset",args:["FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN","SootopolisCity_Mart_EventScript_GentlemanNoLegendaries"]},
  {op:"msgbox",args:["SootopolisCity_Mart_Text_DidSomethingAwaken","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_Mart_Text_FullRestoreItemOfDreams","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
