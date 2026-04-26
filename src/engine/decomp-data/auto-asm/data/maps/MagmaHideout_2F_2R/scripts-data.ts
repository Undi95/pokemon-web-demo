// AUTO-GENERATED from data/maps/MagmaHideout_2F_2R/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MagmaHideout_2F_2R/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MagmaHideout_2F_2R_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_2F_2R_EventScript_Grunt15', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_2F_2R_EventScript_Grunt6', isGlobal: true, instrIndex: 3 },
  { name: 'MagmaHideout_2F_2R_EventScript_Grunt7', isGlobal: true, instrIndex: 6 },
  { name: 'MagmaHideout_2F_2R_EventScript_Grunt8', isGlobal: true, instrIndex: 9 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt15Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt15Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt15PostBattle', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt6Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt6Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt6PostBattle', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt7Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt7Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt7PostBattle', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt8Intro', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt8Defeat', isGlobal: false, instrIndex: 12 },
  { name: 'MagmaHideout_2F_2R_Text_Grunt8PostBattle', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=33
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je n'ai rien contre toi…\\n\""] },
  { kind: '.string', vals: ["\"Mais je dois suivre les ordres!$\""] },
  { kind: '.string', vals: ["\"C'est une défaite, mais…$\""] },
  { kind: '.string', vals: ["\"On a déterré quelque chose\\n\""] },
  { kind: '.string', vals: ["\"d'incroyable! Et on a l'ORBE BLEU!\\p\""] },
  { kind: '.string', vals: ["\"Notre leader n'a plus qu'à…\\n\""] },
  { kind: '.string', vals: ["\"Wahahah…$\""] },
  { kind: '.string', vals: ["\"Je ne supporte pas la chaleur…\\n\""] },
  { kind: '.string', vals: ["\"Je ferais peut-être mieux de rejoindre\\l\""] },
  { kind: '.string', vals: ["\"la TEAM AQUA…$\""] },
  { kind: '.string', vals: ["\"Oui, je ne suis vraiment pas fait pour\\n\""] },
  { kind: '.string', vals: ["\"être dans la TEAM MAGMA!$\""] },
  { kind: '.string', vals: ["\"La mer ne te manque pas dans un\\n\""] },
  { kind: '.string', vals: ["\"endroit comme ça?$\""] },
  { kind: '.string', vals: ["\"On entend quelquefois des grondements\\n\""] },
  { kind: '.string', vals: ["\"sourds par ici.\\p\""] },
  { kind: '.string', vals: ["\"Serait-ce le volcan? Ou bien serait-ce\\n\""] },
  { kind: '.string', vals: ["\"GROU…\\p\""] },
  { kind: '.string', vals: ["\"Oups!\\n\""] },
  { kind: '.string', vals: ["\"Oublie ce que je viens de dire!$\""] },
  { kind: '.string', vals: ["\"Ça a été chaud!\\n\""] },
  { kind: '.string', vals: ["\"Presque aussi chaud qu'un volcan!$\""] },
  { kind: '.string', vals: ["\"Tu as gagné contre moi, mais\\n\""] },
  { kind: '.string', vals: ["\"ça n'a pas vraiment d'importance.\\p\""] },
  { kind: '.string', vals: ["\"La TEAM MAGMA est sur le point de\\n\""] },
  { kind: '.string', vals: ["\"toucher son but!$\""] },
  { kind: '.string', vals: ["\"Un de nos sbires est très inquiet\\n\""] },
  { kind: '.string', vals: ["\"d'avoir perdu le SCEAU MAGMA…\\p\""] },
  { kind: '.string', vals: ["\"Attends un peu!\\n\""] },
  { kind: '.string', vals: ["\"Ça ne serait pas toi qui…?$\""] },
  { kind: '.string', vals: ["\"J'peux pas le croire…$\""] },
  { kind: '.string', vals: ["\"J'ai cette étrange impression que\\n\""] },
  { kind: '.string', vals: ["\"notre plan va échouer…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_15","MagmaHideout_2F_2R_Text_Grunt15Intro","MagmaHideout_2F_2R_Text_Grunt15Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_2R_Text_Grunt15PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_6","MagmaHideout_2F_2R_Text_Grunt6Intro","MagmaHideout_2F_2R_Text_Grunt6Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_2R_Text_Grunt6PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_7","MagmaHideout_2F_2R_Text_Grunt7Intro","MagmaHideout_2F_2R_Text_Grunt7Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_2R_Text_Grunt7PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_8","MagmaHideout_2F_2R_Text_Grunt8Intro","MagmaHideout_2F_2R_Text_Grunt8Defeat"]},
  {op:"msgbox",args:["MagmaHideout_2F_2R_Text_Grunt8PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
