// AUTO-GENERATED from data/maps/Route110_TrickHousePuzzle4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route110_TrickHousePuzzle4/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route110_TrickHousePuzzle4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_TrickHousePuzzle4_EventScript_Scroll', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_TrickHousePuzzle4_EventScript_FoundScroll', isGlobal: true, instrIndex: 4 },
  { name: 'Route110_TrickHousePuzzle4_EventScript_Cora', isGlobal: true, instrIndex: 7 },
  { name: 'Route110_TrickHousePuzzle4_EventScript_Yuji', isGlobal: true, instrIndex: 10 },
  { name: 'Route110_TrickHousePuzzle4_EventScript_Paula', isGlobal: true, instrIndex: 13 },
  { name: 'Route110_TrickHousePuzzle4_Text_WroteSecretCodeLockOpened', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_CoraIntro', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_CoraDefeat', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_CoraPostBattle', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_YujiIntro', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_YujiDefeat', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_YujiPostBattle', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_PaulaIntro', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_PaulaDefeat', isGlobal: false, instrIndex: 16 },
  { name: 'Route110_TrickHousePuzzle4_Text_PaulaPostBattle', isGlobal: false, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=20
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"{PLAYER} écrit le code secret\\n\""] },
  { kind: '.string', vals: ["\"sur la porte.\\p\""] },
  { kind: '.string', vals: ["\"“Le MAITRE DES PIEGES est cool.”\\n\""] },
  { kind: '.string', vals: ["\"… … … … … … … …\\p\""] },
  { kind: '.string', vals: ["\"La porte s'ouvre!$\""] },
  { kind: '.string', vals: ["\"Tous ces trucs à résoudre, c'est trop\\n\""] },
  { kind: '.string', vals: ["\"compliqué. Je voulais juste me battre!$\""] },
  { kind: '.string', vals: ["\"Même si j'ai perdu, je préfère me battre!$\""] },
  { kind: '.string', vals: ["\"Tu n'es pas d'accord? Ce que tu\\n\""] },
  { kind: '.string', vals: ["\"cherches, c'est surtout des DRESSEURS.$\""] },
  { kind: '.string', vals: ["\"Hé, hé! Des rochers comme ça, je peux\\n\""] },
  { kind: '.string', vals: ["\"les pousser avec un seul doigt!$\""] },
  { kind: '.string', vals: ["\"Je peux pousser des rochers, mais je\\n\""] },
  { kind: '.string', vals: ["\"n'arrive pas à résoudre les énigmes…$\""] },
  { kind: '.string', vals: ["\"Il ne suffit pas d'être musclé…\\n\""] },
  { kind: '.string', vals: ["\"Il faut utiliser sa tête et être malin!$\""] },
  { kind: '.string', vals: ["\"La MAISON DES PIEGES est de plus en\\n\""] },
  { kind: '.string', vals: ["\"plus compliquée, n'est-ce pas?$\""] },
  { kind: '.string', vals: ["\"Aaargh!$\""] },
  { kind: '.string', vals: ["\"Quelqu'un est-il déjà arrivé à la fin?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 16 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"goto_if_eq",args:["VAR_TRICK_HOUSE_PUZZLE_4_STATE",0,"Route110_TrickHousePuzzle4_EventScript_FoundScroll"]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_ReadScrollAgain"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TRICK_HOUSE_PUZZLE_4_STATE",1]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_FoundScroll"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CORA","Route110_TrickHousePuzzle4_Text_CoraIntro","Route110_TrickHousePuzzle4_Text_CoraDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle4_Text_CoraPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_YUJI","Route110_TrickHousePuzzle4_Text_YujiIntro","Route110_TrickHousePuzzle4_Text_YujiDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle4_Text_YujiPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_PAULA","Route110_TrickHousePuzzle4_Text_PaulaIntro","Route110_TrickHousePuzzle4_Text_PaulaDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle4_Text_PaulaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
