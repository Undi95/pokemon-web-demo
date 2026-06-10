// AUTO-GENERATED from data/maps/Route110_TrickHousePuzzle1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route110_TrickHousePuzzle1/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route110_TrickHousePuzzle1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_TrickHousePuzzle1_OnLoad', isGlobal: false, instrIndex: 1 },
  { name: 'Route110_TrickHousePuzzle1_EventScript_OpenDoor', isGlobal: true, instrIndex: 3 },
  { name: 'Route110_TrickHousePuzzle1_EventScript_Scroll', isGlobal: true, instrIndex: 5 },
  { name: 'Route110_TrickHousePuzzle1_EventScript_FoundScroll', isGlobal: true, instrIndex: 9 },
  { name: 'Route110_TrickHousePuzzle1_EventScript_Sally', isGlobal: true, instrIndex: 12 },
  { name: 'Route110_TrickHousePuzzle1_EventScript_Eddie', isGlobal: true, instrIndex: 15 },
  { name: 'Route110_TrickHousePuzzle1_EventScript_Robin', isGlobal: true, instrIndex: 18 },
  { name: 'Route110_TrickHousePuzzle1_Text_WroteSecretCodeLockOpened', isGlobal: true, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_SallyIntro', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_SallyDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_SallyPostBattle', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_EddieIntro', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_EddieDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_EddiePostBattle', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_RobinIntro', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_RobinDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'Route110_TrickHousePuzzle1_Text_RobinPostBattle', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=20
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"{PLAYER} écrit le code secret\\n\""] },
  { kind: '.string', vals: ["\"sur la porte.\\p\""] },
  { kind: '.string', vals: ["\"“Le MAITRE DES PIEGES est formidable.”\\n\""] },
  { kind: '.string', vals: ["\"… … … … … … … …\\p\""] },
  { kind: '.string', vals: ["\"La porte s'ouvre!$\""] },
  { kind: '.string', vals: ["\"Grâce à COUPE, que je viens d'apprendre,\\n\""] },
  { kind: '.string', vals: ["\"je vais vaincre à la force de ma lame!$\""] },
  { kind: '.string', vals: ["\"Pourquoi as-tu l'air si sérieux?$\""] },
  { kind: '.string', vals: ["\"Je ne me lasse pas de trancher,\\n\""] },
  { kind: '.string', vals: ["\"découper et taillader!$\""] },
  { kind: '.string', vals: ["\"Je me suis retrouvé dans cette étrange\\n\""] },
  { kind: '.string', vals: ["\"maison par hasard…$\""] },
  { kind: '.string', vals: ["\"Et maintenant, j'ai perdu…$\""] },
  { kind: '.string', vals: ["\"J'ai perdu mon chemin, un combat et\\n\""] },
  { kind: '.string', vals: ["\"la tête… Je n'arrive pas à sortir…$\""] },
  { kind: '.string', vals: ["\"Mais qui est le MAITRE DES PIEGES?$\""] },
  { kind: '.string', vals: ["\"Tu as gagné parce que j'étais perdue\\n\""] },
  { kind: '.string', vals: ["\"dans mes pensées!$\""] },
  { kind: '.string', vals: ["\"Tu es balèze!\\n\""] },
  { kind: '.string', vals: ["\"Mais qui es-tu, au juste?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","Route110_TrickHousePuzzle1_OnLoad"]},
  {op:"goto_if_eq",args:["VAR_TRICK_HOUSE_PUZZLE_1_STATE",2,"Route110_TrickHousePuzzle1_EventScript_OpenDoor"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[13,1,"METATILE_TrickHousePuzzle_Stairs_Down",0]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_eq",args:["VAR_TRICK_HOUSE_PUZZLE_1_STATE",0,"Route110_TrickHousePuzzle1_EventScript_FoundScroll"]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_ReadScrollAgain"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TRICK_HOUSE_PUZZLE_1_STATE",1]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_FoundScroll"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SALLY","Route110_TrickHousePuzzle1_Text_SallyIntro","Route110_TrickHousePuzzle1_Text_SallyDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle1_Text_SallyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_EDDIE","Route110_TrickHousePuzzle1_Text_EddieIntro","Route110_TrickHousePuzzle1_Text_EddieDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle1_Text_EddiePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ROBIN","Route110_TrickHousePuzzle1_Text_RobinIntro","Route110_TrickHousePuzzle1_Text_RobinDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle1_Text_RobinPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
