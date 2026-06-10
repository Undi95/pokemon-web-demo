// AUTO-GENERATED from data/maps/MagmaHideout_3F_2R/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MagmaHideout_3F_2R/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MagmaHideout_3F_2R_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_3F_2R_EventScript_Grunt10', isGlobal: true, instrIndex: 0 },
  { name: 'MagmaHideout_3F_2R_Text_Grunt10Intro', isGlobal: false, instrIndex: 3 },
  { name: 'MagmaHideout_3F_2R_Text_Grunt10Defeat', isGlobal: false, instrIndex: 3 },
  { name: 'MagmaHideout_3F_2R_Text_Grunt10PostBattle', isGlobal: false, instrIndex: 3 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=14
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je suis d'accord avec tout ce que dit\\n\""] },
  { kind: '.string', vals: ["\"notre leader. Mais tu sais quoi?\\p\""] },
  { kind: '.string', vals: ["\"Faire des trucs comme exhumer\\n\""] },
  { kind: '.string', vals: ["\"un POKéMON super vieux et voler\\l\""] },
  { kind: '.string', vals: ["\"le METEORITE de quelqu'un…\\p\""] },
  { kind: '.string', vals: ["\"Je crois qu'on va peut-être un peu\\n\""] },
  { kind: '.string', vals: ["\"trop loin. T'es pas d'accord?$\""] },
  { kind: '.string', vals: ["\"Ouaip, je pense vraiment qu'on fait\\n\""] },
  { kind: '.string', vals: ["\"quelque chose de mal.$\""] },
  { kind: '.string', vals: ["\"Tu sais, perdre permet de prendre\\n\""] },
  { kind: '.string', vals: ["\"conscience de certaines choses.\\p\""] },
  { kind: '.string', vals: ["\"La prochaine fois que je verrai notre\\n\""] },
  { kind: '.string', vals: ["\"leader, je lui parlerai de ce que nous\\l\""] },
  { kind: '.string', vals: ["\"sommes en train de faire.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 3 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_MAGMA_HIDEOUT_10","MagmaHideout_3F_2R_Text_Grunt10Intro","MagmaHideout_3F_2R_Text_Grunt10Defeat"]},
  {op:"msgbox",args:["MagmaHideout_3F_2R_Text_Grunt10PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
