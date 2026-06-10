// AUTO-GENERATED from data/maps/SeafloorCavern_Room4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SeafloorCavern_Room4/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SeafloorCavern_Room4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SeafloorCavern_Room4_EventScript_Grunt3', isGlobal: true, instrIndex: 0 },
  { name: 'SeafloorCavern_Room4_EventScript_Grunt4', isGlobal: true, instrIndex: 3 },
  { name: 'SeafloorCavern_Room4_Text_Grunt3Intro', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room4_Text_Grunt3Defeat', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room4_Text_Grunt3PostBattle', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room4_Text_Grunt4Intro', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room4_Text_Grunt4Defeat', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room4_Text_Grunt4PostBattle', isGlobal: false, instrIndex: 6 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Qui es-tu?\\n\""] },
  { kind: '.string', vals: ["\"Comment as-tu atterri ici?$\""] },
  { kind: '.string', vals: ["\"J'ai perdu…$\""] },
  { kind: '.string', vals: ["\"J'arrive pas à trouver d'issue!\\p\""] },
  { kind: '.string', vals: ["\"J'ai pas peur. Comprends-moi bien!$\""] },
  { kind: '.string', vals: ["\"Qui es-tu?\\n\""] },
  { kind: '.string', vals: ["\"Pour qui est-ce que tu te prends?$\""] },
  { kind: '.string', vals: ["\"Tu m'as eue!$\""] },
  { kind: '.string', vals: ["\"Mon partenaire a oublié la carte dans\\n\""] },
  { kind: '.string', vals: ["\"le sous-marin!\\p\""] },
  { kind: '.string', vals: ["\"C'est le roi des incapables!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_SEAFLOOR_CAVERN_3","SeafloorCavern_Room4_Text_Grunt3Intro","SeafloorCavern_Room4_Text_Grunt3Defeat"]},
  {op:"msgbox",args:["SeafloorCavern_Room4_Text_Grunt3PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_SEAFLOOR_CAVERN_4","SeafloorCavern_Room4_Text_Grunt4Intro","SeafloorCavern_Room4_Text_Grunt4Defeat"]},
  {op:"msgbox",args:["SeafloorCavern_Room4_Text_Grunt4PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
