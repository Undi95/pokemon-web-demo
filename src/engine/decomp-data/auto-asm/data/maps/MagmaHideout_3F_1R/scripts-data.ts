// AUTO-GENERATED from data/maps/MagmaHideout_3F_1R/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MagmaHideout_3F_1R/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MagmaHideout_3F_1R_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_3F_1R_EventScript_Grunt9', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_3F_1R_EventScript_Grunt16', isGlobal: true, instrIndex: 3 },
  { name: 'MagmaHideout_3F_1R_Text_Grunt9Intro', isGlobal: false, instrIndex: 6 },
  { name: 'MagmaHideout_3F_1R_Text_Grunt9Defeat', isGlobal: false, instrIndex: 6 },
  { name: 'MagmaHideout_3F_1R_Text_Grunt9PostBattle', isGlobal: false, instrIndex: 6 },
  { name: 'MagmaHideout_3F_1R_Text_Grunt16Intro', isGlobal: false, instrIndex: 6 },
  { name: 'MagmaHideout_3F_1R_Text_Grunt16Defeat', isGlobal: false, instrIndex: 6 },
  { name: 'MagmaHideout_3F_1R_Text_Grunt16PostBattle', isGlobal: false, instrIndex: 6 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=19
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Qu'est-ce que j'ai fait de mal pour\\n\""] },
  { kind: '.string', vals: ["\"être obligé de monter la garde ici?\\p\""] },
  { kind: '.string', vals: ["\"Mon oreille gauche est presque\\n\""] },
  { kind: '.string', vals: ["\"en train de brûler!$\""] },
  { kind: '.string', vals: ["\"Je dois avoir des bouffées de chaleur…$\""] },
  { kind: '.string', vals: ["\"Tu trouves pas ça bizarre qu'on porte\\n\""] },
  { kind: '.string', vals: ["\"des bonnets dans cette fournaise?$\""] },
  { kind: '.string', vals: ["\"Nous avons rejoint la TEAM pour aider\\n\""] },
  { kind: '.string', vals: ["\"notre leader à concrétiser sa vision.\\p\""] },
  { kind: '.string', vals: ["\"Je me moque que tu appartiennes\\n\""] },
  { kind: '.string', vals: ["\"ou non à la TEAM AQUA.\\p\""] },
  { kind: '.string', vals: ["\"Je ne laisserai personne interférer\\n\""] },
  { kind: '.string', vals: ["\"dans nos plans!$\""] },
  { kind: '.string', vals: ["\"Oh non…\\n\""] },
  { kind: '.string', vals: ["\"Je n'ai rien pu faire.$\""] },
  { kind: '.string', vals: ["\"Ecoute-moi bien.\\n\""] },
  { kind: '.string', vals: ["\"Ne te trompe pas d'ennemi.\\p\""] },
  { kind: '.string', vals: ["\"N'écoute pas la TEAM AQUA.\\n\""] },
  { kind: '.string', vals: ["\"Ne crois pas leurs mensonges!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_9","MagmaHideout_3F_1R_Text_Grunt9Intro","MagmaHideout_3F_1R_Text_Grunt9Defeat"]},
  {op:"msgbox",args:["MagmaHideout_3F_1R_Text_Grunt9PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_16","MagmaHideout_3F_1R_Text_Grunt16Intro","MagmaHideout_3F_1R_Text_Grunt16Defeat"]},
  {op:"msgbox",args:["MagmaHideout_3F_1R_Text_Grunt16PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
