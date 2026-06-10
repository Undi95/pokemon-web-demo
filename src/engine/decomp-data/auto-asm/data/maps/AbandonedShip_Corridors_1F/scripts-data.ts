// AUTO-GENERATED from data/maps/AbandonedShip_Corridors_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AbandonedShip_Corridors_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AbandonedShip_Corridors_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Corridors_1F_EventScript_Youngster', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Corridors_1F_EventScript_Charlie', isGlobal: true, instrIndex: 2 },
  { name: 'AbandonedShip_Corridors_1F_Text_CharlieIntro', isGlobal: false, instrIndex: 5 },
  { name: 'AbandonedShip_Corridors_1F_Text_CharlieDefeat', isGlobal: false, instrIndex: 5 },
  { name: 'AbandonedShip_Corridors_1F_Text_CharliePostBattle', isGlobal: false, instrIndex: 5 },
  { name: 'AbandonedShip_Corridors_1F_Text_IsntItFunHere', isGlobal: false, instrIndex: 5 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=7
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Qu'est-ce qu'il y a de si drôle à me voir\\n\""] },
  { kind: '.string', vals: ["\"à bord du bateau avec ma bouée?$\""] },
  { kind: '.string', vals: ["\"Waouh, tu m'as écrasé!$\""] },
  { kind: '.string', vals: ["\"C'est dur de lancer des POKé BALLS tout\\n\""] },
  { kind: '.string', vals: ["\"en se cramponnant à une bouée!$\""] },
  { kind: '.string', vals: ["\"C'est cool ici, hein?\\n\""] },
  { kind: '.string', vals: ["\"Je suis tout excité rien que d'être là!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 5 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["AbandonedShip_Corridors_1F_Text_IsntItFunHere","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CHARLIE","AbandonedShip_Corridors_1F_Text_CharlieIntro","AbandonedShip_Corridors_1F_Text_CharlieDefeat"]},
  {op:"msgbox",args:["AbandonedShip_Corridors_1F_Text_CharliePostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
