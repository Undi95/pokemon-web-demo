// AUTO-GENERATED from data/maps/MagmaHideout_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MagmaHideout_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MagmaHideout_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_1F_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'MagmaHideout_1F_EventScript_Grunt1', isGlobal: true, instrIndex: 3 },
  { name: 'MagmaHideout_1F_EventScript_Grunt2', isGlobal: true, instrIndex: 6 },
  { name: 'MagmaHideout_1F_Text_Grunt1Intro', isGlobal: false, instrIndex: 9 },
  { name: 'MagmaHideout_1F_Text_Grunt1Defeat', isGlobal: false, instrIndex: 9 },
  { name: 'MagmaHideout_1F_Text_Grunt1PostBattle', isGlobal: false, instrIndex: 9 },
  { name: 'MagmaHideout_1F_Text_Grunt2Intro', isGlobal: false, instrIndex: 9 },
  { name: 'MagmaHideout_1F_Text_Grunt2Defeat', isGlobal: false, instrIndex: 9 },
  { name: 'MagmaHideout_1F_Text_Grunt2PostBattle', isGlobal: false, instrIndex: 9 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=25
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"A l'appel de la TEAM MAGMA, nous\\n\""] },
  { kind: '.string', vals: ["\"nous sommes présentés un par un pour\\l\""] },
  { kind: '.string', vals: ["\"recevoir nos assignements.\\p\""] },
  { kind: '.string', vals: ["\"C'est pour ça que je suis coincé dans\\n\""] },
  { kind: '.string', vals: ["\"ce coin, j'arrive toujours trop tard!$\""] },
  { kind: '.string', vals: ["\"J'arrive aussi toujours en retard aux\\n\""] },
  { kind: '.string', vals: ["\"entraînements!\\p\""] },
  { kind: '.string', vals: ["\"J'aime pas trop l'avouer, mais je suis\\n\""] },
  { kind: '.string', vals: ["\"loin d'être le meilleur…$\""] },
  { kind: '.string', vals: ["\"OK, je vais essayer de m'entraîner\\n\""] },
  { kind: '.string', vals: ["\"un peu plus sérieusement.$\""] },
  { kind: '.string', vals: ["\"Notre leader nous a dit de creuser dans\\n\""] },
  { kind: '.string', vals: ["\"le MONT CHIMNEE, alors on a creusé.\\p\""] },
  { kind: '.string', vals: ["\"Et pendant qu'on était en train de\\n\""] },
  { kind: '.string', vals: ["\"creuser, on est tombés sur quelque\\l\""] },
  { kind: '.string', vals: ["\"chose de vraiment incroyable.\\p\""] },
  { kind: '.string', vals: ["\"Tu veux savoir ce que c'est?\\p\""] },
  { kind: '.string', vals: ["\"Ouahahah!\\n\""] },
  { kind: '.string', vals: ["\"Je te le dirai si t'arrives à me battre!$\""] },
  { kind: '.string', vals: ["\"Ouille!\\n\""] },
  { kind: '.string', vals: ["\"Tu m'as eu!$\""] },
  { kind: '.string', vals: ["\"J'ai changé d'avis, j'vais rien te dire!\\n\""] },
  { kind: '.string', vals: ["\"Tu vas devoir découvrir par toi-même!\\p\""] },
  { kind: '.string', vals: ["\"Je te gâcherais la surprise si je te\\n\""] },
  { kind: '.string', vals: ["\"disais tout, tu crois pas?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 9 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","MagmaHideout_1F_OnTransition"]},
  {op:"setvar",args:["VAR_JAGGED_PASS_ASH_WEATHER",0]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_1","MagmaHideout_1F_Text_Grunt1Intro","MagmaHideout_1F_Text_Grunt1Defeat"]},
  {op:"msgbox",args:["MagmaHideout_1F_Text_Grunt1PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_2","MagmaHideout_1F_Text_Grunt2Intro","MagmaHideout_1F_Text_Grunt2Defeat"]},
  {op:"msgbox",args:["MagmaHideout_1F_Text_Grunt2PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
