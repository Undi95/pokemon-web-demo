// AUTO-GENERATED from data/maps/MagmaHideout_2F_1R/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MagmaHideout_2F_1R/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MagmaHideout_2F_1R_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_2F_1R_EventScript_Grunt14', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_2F_1R_EventScript_Grunt3', isGlobal: true, instrIndex: 3 },
  { name: 'MagmaHideout_2F_1R_EventScript_Grunt4', isGlobal: true, instrIndex: 6 },
  { name: 'MagmaHideout_2F_1R_EventScript_Grunt5', isGlobal: true, instrIndex: 9 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt14Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt14Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt14PostBattle', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt3Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt3Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt3PostBattle', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt4Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt4Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt4PostBattle', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt5Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt5Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_1R_Text_Grunt5PostBattle', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=27
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Pas si vite!\\p\""] },
  { kind: '.string', vals: ["\"Seuls les membres de la TEAM MAGMA\\n\""] },
  { kind: '.string', vals: ["\"sont autorisés à être ici!\\p\""] },
  { kind: '.string', vals: ["\"Mais tu ne portes pas notre uniforme…\\p\""] },
  { kind: '.string', vals: ["\"Il vaut mieux que je sois sûre!\\n\""] },
  { kind: '.string', vals: ["\"Allez, viens te battre!$\""] },
  { kind: '.string', vals: ["\"Aïe…\\n\""] },
  { kind: '.string', vals: ["\"Mon honneur vient d'en prendre un coup.$\""] },
  { kind: '.string', vals: ["\"Si tu n'aimes pas avoir froid,\\n\""] },
  { kind: '.string', vals: ["\"rejoins la TEAM MAGMA!$\""] },
  { kind: '.string', vals: ["\"Attends un peu toi!\\p\""] },
  { kind: '.string', vals: ["\"Tu pensais vraiment pouvoir passer\\n\""] },
  { kind: '.string', vals: ["\"devant moi comme ça?$\""] },
  { kind: '.string', vals: ["\"Bon d'accord, j'ai rien dit.$\""] },
  { kind: '.string', vals: ["\"J'aurais sûrement mieux fait de\\n\""] },
  { kind: '.string', vals: ["\"te laisser passer directement…$\""] },
  { kind: '.string', vals: ["\"Ah ah!\\n\""] },
  { kind: '.string', vals: ["\"Un intrus!$\""] },
  { kind: '.string', vals: ["\"Graaah!$\""] },
  { kind: '.string', vals: ["\"J'ai perdu…\\p\""] },
  { kind: '.string', vals: ["\"Est-ce que je dois continuer à\\n\""] },
  { kind: '.string', vals: ["\"tourner en rond bêtement?$\""] },
  { kind: '.string', vals: ["\"Oh oh!\\n\""] },
  { kind: '.string', vals: ["\"Un intrus!$\""] },
  { kind: '.string', vals: ["\"Humpff…$\""] },
  { kind: '.string', vals: ["\"En fait, les combats n'ont jamais été\\n\""] },
  { kind: '.string', vals: ["\"ma spécialité…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_14","MagmaHideout_2F_1R_Text_Grunt14Intro","MagmaHideout_2F_1R_Text_Grunt14Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_1R_Text_Grunt14PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_3","MagmaHideout_2F_1R_Text_Grunt3Intro","MagmaHideout_2F_1R_Text_Grunt3Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_1R_Text_Grunt3PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_4","MagmaHideout_2F_1R_Text_Grunt4Intro","MagmaHideout_2F_1R_Text_Grunt4Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_1R_Text_Grunt4PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_5","MagmaHideout_2F_1R_Text_Grunt5Intro","MagmaHideout_2F_1R_Text_Grunt5Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_1R_Text_Grunt5PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
