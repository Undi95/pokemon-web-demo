// AUTO-GENERATED from data/maps/Route110_TrickHousePuzzle6/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route110_TrickHousePuzzle6/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route110_TrickHousePuzzle6_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route110_TrickHousePuzzle6_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'Route110_TrickHousePuzzle6_OnWarp', isGlobal: false, instrIndex: 4 },
  { name: 'Route110_TrickHousePuzzle6_EventScript_InitPuzzle', isGlobal: true, instrIndex: 5 },
  { name: 'Route110_TrickHousePuzzle6_EventScript_Scroll', isGlobal: true, instrIndex: 7 },
  { name: 'Route110_TrickHousePuzzle6_EventScript_FoundScroll', isGlobal: true, instrIndex: 11 },
  { name: 'Route110_TrickHousePuzzle6_EventScript_Sophia', isGlobal: true, instrIndex: 14 },
  { name: 'Route110_TrickHousePuzzle6_EventScript_Benny', isGlobal: true, instrIndex: 17 },
  { name: 'Route110_TrickHousePuzzle6_EventScript_Sebastian', isGlobal: true, instrIndex: 20 },
  { name: 'Route110_TrickHousePuzzle6_Text_WroteSecretCodeLockOpened', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_SophiaIntro', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_SophiaDefeat', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_SophiaPostBattle', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_BennyIntro', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_BennyDefeat', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_BennyPostBattle', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_SebastianIntro', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_SebastianDefeat', isGlobal: false, instrIndex: 23 },
  { name: 'Route110_TrickHousePuzzle6_Text_SebastianPostBattle', isGlobal: false, instrIndex: 23 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=1, .string=24
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"{PLAYER} écrit le code secret\\n\""] },
  { kind: '.string', vals: ["\"sur la porte.\\p\""] },
  { kind: '.string', vals: ["\"“Le MAITRE DES PIEGES est\\n\""] },
  { kind: '.string', vals: ["\"tout pour moi.”\\l\""] },
  { kind: '.string', vals: ["\"… … … … … … … …\\p\""] },
  { kind: '.string', vals: ["\"La porte s'ouvre!$\""] },
  { kind: '.string', vals: ["\"Quand on m'a parlé d'une maison bizarre,\\n\""] },
  { kind: '.string', vals: ["\"je me suis sentie obligée d'y aller.$\""] },
  { kind: '.string', vals: ["\"J'ai découvert un DRESSEUR balèze!$\""] },
  { kind: '.string', vals: ["\"Je suis sûre de m'amuser quand\\n\""] },
  { kind: '.string', vals: ["\"je viens ici.\\p\""] },
  { kind: '.string', vals: ["\"Je ne me lasse pas de ce défi.\\n\""] },
  { kind: '.string', vals: ["\"C'est toujours aussi bien!$\""] },
  { kind: '.string', vals: ["\"Je pourrais demander à mes POKéMON\\n\""] },
  { kind: '.string', vals: ["\"OISEAU de voler au-dessus du mur…$\""] },
  { kind: '.string', vals: ["\"Gniiiii! J'ai tout raté!$\""] },
  { kind: '.string', vals: ["\"Hé, hé, hé… Je suppose que j'ai perdu\\n\""] },
  { kind: '.string', vals: ["\"parce que j'ai essayé de tricher.$\""] },
  { kind: '.string', vals: ["\"Toutes ces portes pivotantes me\\n\""] },
  { kind: '.string', vals: ["\"donnent le tournis…$\""] },
  { kind: '.string', vals: ["\"Tout tourne autour de moi! Je ne vais\\n\""] },
  { kind: '.string', vals: ["\"pas le supporter plus longtemps…$\""] },
  { kind: '.string', vals: ["\"Ça n'a pas l'air de te déranger.\\n\""] },
  { kind: '.string', vals: ["\"Ou bien est-ce juste du bluff?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 23 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route110_TrickHousePuzzle6_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","Route110_TrickHousePuzzle6_OnWarp"]},
  {op:"special",args:["RotatingGate_InitPuzzle"]},
  {op:"end",args:[]},
  {op:"map_script_2",args:["VAR_TEMP_0","VAR_TEMP_0","Route110_TrickHousePuzzle6_EventScript_InitPuzzle"]},
  {op:"special",args:["RotatingGate_InitPuzzleAndGraphics"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_eq",args:["VAR_TRICK_HOUSE_PUZZLE_6_STATE",0,"Route110_TrickHousePuzzle6_EventScript_FoundScroll"]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_ReadScrollAgain"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_TRICK_HOUSE_PUZZLE_6_STATE",1]},
  {op:"goto",args:["Route110_TrickHousePuzzle_EventScript_FoundScroll"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SOPHIA","Route110_TrickHousePuzzle6_Text_SophiaIntro","Route110_TrickHousePuzzle6_Text_SophiaDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle6_Text_SophiaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_BENNY","Route110_TrickHousePuzzle6_Text_BennyIntro","Route110_TrickHousePuzzle6_Text_BennyDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle6_Text_BennyPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_SEBASTIAN","Route110_TrickHousePuzzle6_Text_SebastianIntro","Route110_TrickHousePuzzle6_Text_SebastianDefeat"]},
  {op:"msgbox",args:["Route110_TrickHousePuzzle6_Text_SebastianPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
