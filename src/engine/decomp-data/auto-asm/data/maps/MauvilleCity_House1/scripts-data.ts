// AUTO-GENERATED from data/maps/MauvilleCity_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MauvilleCity_House1/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MauvilleCity_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MauvilleCity_House1_EventScript_RockSmashDude', isGlobal: true, instrIndex: 0 },
  { name: 'MauvilleCity_House1_EventScript_ReceivedRockSmash', isGlobal: true, instrIndex: 10 },
  { name: 'MauvilleCity_House1_Text_ImRockSmashDudeTakeThis', isGlobal: false, instrIndex: 13 },
  { name: 'MauvilleCity_House1_Text_ExplainRockSmash', isGlobal: false, instrIndex: 13 },
  { name: 'MauvilleCity_House1_Text_MonCanFlyOutOfSmashedRock', isGlobal: false, instrIndex: 13 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=21
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Woahou!\\p\""] },
  { kind: '.string', vals: ["\"Les gens m'appellent le TYPE\\n\""] },
  { kind: '.string', vals: ["\"ECLATE-ROC, mais je n'aime pas trop ça.\\p\""] },
  { kind: '.string', vals: ["\"Je crois que je mérite un surnom\\n\""] },
  { kind: '.string', vals: ["\"plus flatteur, comme le MEC\\l\""] },
  { kind: '.string', vals: ["\"ECLATE-ROC par exemple.\\p\""] },
  { kind: '.string', vals: ["\"Woahou!\\p\""] },
  { kind: '.string', vals: ["\"Quoi qu'il en soit, ton POKéMON semble\\n\""] },
  { kind: '.string', vals: ["\"plutôt fort.\\p\""] },
  { kind: '.string', vals: ["\"J'aime ça!\\n\""] },
  { kind: '.string', vals: ["\"Tiens, prends cette CS!$\""] },
  { kind: '.string', vals: ["\"Cette CS contient ECLATE-ROC.\\p\""] },
  { kind: '.string', vals: ["\"Si tu te trouves face à de gros blocs\\n\""] },
  { kind: '.string', vals: ["\"de pierre bloquant le passage…\\p\""] },
  { kind: '.string', vals: ["\"Eh bien, utilise l'attaque de cette CS\\n\""] },
  { kind: '.string', vals: ["\"et pulvérise-les!\\p\""] },
  { kind: '.string', vals: ["\"Ouaip! Eclate-les carrément!\\n\""] },
  { kind: '.string', vals: ["\"Woahou!$\""] },
  { kind: '.string', vals: ["\"Ah, oui! Si tu détruis une pierre,\\n\""] },
  { kind: '.string', vals: ["\"un POKéMON peut en surgir.\\p\""] },
  { kind: '.string', vals: ["\"Woahou!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 13 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_HM_ROCK_SMASH","MauvilleCity_House1_EventScript_ReceivedRockSmash"]},
  {op:"msgbox",args:["MauvilleCity_House1_Text_ImRockSmashDudeTakeThis","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_HM_ROCK_SMASH"]},
  {op:"setflag",args:["FLAG_RECEIVED_HM_ROCK_SMASH"]},
  {op:"setflag",args:["FLAG_HIDE_ROUTE_111_ROCK_SMASH_TIP_GUY"]},
  {op:"msgbox",args:["MauvilleCity_House1_Text_ExplainRockSmash","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_House1_Text_MonCanFlyOutOfSmashedRock","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
