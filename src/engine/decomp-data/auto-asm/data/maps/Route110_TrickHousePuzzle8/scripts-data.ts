// AUTO-GENERATED from data/maps/Route110_TrickHousePuzzle8/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route110_TrickHousePuzzle8/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route110_TrickHousePuzzle8_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_TrickHousePuzzle8_EventScript_Scroll', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_TrickHousePuzzle8_EventScript_FoundScroll', isGlobal: true, instrIndex: 4 },
  { name: 'Route110_TrickHousePuzzle8_EventScript_Vincent', isGlobal: true, instrIndex: 7 },
  { name: 'Route110_TrickHousePuzzle8_EventScript_Keira', isGlobal: true, instrIndex: 10 },
  { name: 'Route110_TrickHousePuzzle8_EventScript_Leroy', isGlobal: true, instrIndex: 13 },
  { name: 'Route110_TrickHousePuzzle8_Text_WroteSecretCodeLockOpened', isGlobal: true, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_VincentIntro', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_VincentDefeat', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_VincentPostBattle', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_KeiraIntro', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_KeiraDefeat', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_KeiraPostBattle', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_LeroyIntro', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_LeroyDefeat', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle8_Text_LeroyPostBattle', isGlobal: false, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=21
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"{PLAYER} écrit le code secret\\n\""] },
  { kind: '.string', vals: ["\"sur la porte.\\p\""] },
  { kind: '.string', vals: ["\"“J'aime le MAITRE DES PIEGES.”\\n\""] },
  { kind: '.string', vals: ["\"… … … … … … … …\\p\""] },
  { kind: '.string', vals: ["\"La porte s'ouvre!$\""] },
  { kind: '.string', vals: ["\"Peu de DRESSEURS sont arrivés\\n\""] },
  { kind: '.string', vals: ["\"aussi loin.$\""] },
  { kind: '.string', vals: ["\"Ça doit vouloir dire que tu es balèze…$\""] },
  { kind: '.string', vals: ["\"Tu as battu le MAITRE de la LIGUE\\n\""] },
  { kind: '.string', vals: ["\"POKéMON? Les bras m'en tombent!$\""] },
  { kind: '.string', vals: ["\"C'est une sacrée chance de se battre\\n\""] },
  { kind: '.string', vals: ["\"contre moi!$\""] },
  { kind: '.string', vals: ["\"C'est impossible!\\n\""] },
  { kind: '.string', vals: ["\"Je ne peux pas perdre!$\""] },
  { kind: '.string', vals: ["\"Ta victoire tient du miracle.\\n\""] },
  { kind: '.string', vals: ["\"Tu vas pouvoir frimer.$\""] },
  { kind: '.string', vals: ["\"Toi aussi, tu luttes pour relever le défi\\n\""] },
  { kind: '.string', vals: ["\"de la MAISON DES PIEGES.$\""] },
  { kind: '.string', vals: ["\"Mmmh. Je vois…\\n\""] },
  { kind: '.string', vals: ["\"Ton style est très impressionnant.$\""] },
  { kind: '.string', vals: ["\"Tu devrais plaire au MAITRE DES PIEGES.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 16 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"goto_if_eq",args:["VAR_TRICK_HOUSE_PUZZLE_8_STATE",0,"Route110_TrickHousePuzzle8_EventScript_FoundScroll"]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_ReadScrollAgain"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TRICK_HOUSE_PUZZLE_8_STATE",1]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_FoundScroll"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_VINCENT","Route110_TrickHousePuzzle8_Text_VincentIntro","Route110_TrickHousePuzzle8_Text_VincentDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle8_Text_VincentPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KEIRA","Route110_TrickHousePuzzle8_Text_KeiraIntro","Route110_TrickHousePuzzle8_Text_KeiraDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle8_Text_KeiraPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_LEROY","Route110_TrickHousePuzzle8_Text_LeroyIntro","Route110_TrickHousePuzzle8_Text_LeroyDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle8_Text_LeroyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
