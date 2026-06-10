// AUTO-GENERATED from data/maps/SeafloorCavern_Room1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SeafloorCavern_Room1/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SeafloorCavern_Room1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SeafloorCavern_Room1_EventScript_Grunt1', isGlobal: true, instrIndex: 0 },
  { name: 'SeafloorCavern_Room1_EventScript_Grunt2', isGlobal: true, instrIndex: 3 },
  { name: 'SeafloorCavern_Room1_Text_Grunt1Intro', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room1_Text_Grunt1Defeat', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room1_Text_Grunt1PostBattle', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room1_Text_Grunt2Intro', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room1_Text_Grunt2Defeat', isGlobal: false, instrIndex: 6 },
  { name: 'SeafloorCavern_Room1_Text_Grunt2PostBattle', isGlobal: false, instrIndex: 6 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Pas besoin d'un môme dans nos pattes!\\n\""] },
  { kind: '.string', vals: ["\"Rentre chez toi!$\""] },
  { kind: '.string', vals: ["\"Je veux rentrer chez moi…$\""] },
  { kind: '.string', vals: ["\"Je veux avoir une promotion pour\\n\""] },
  { kind: '.string', vals: ["\"donner des ordres aux SBIRES…$\""] },
  { kind: '.string', vals: ["\"Ce sous-marin… C'est minuscule à\\n\""] },
  { kind: '.string', vals: ["\"l'intérieur. J'ai mal partout!$\""] },
  { kind: '.string', vals: ["\"Ça m'énerve de perdre!$\""] },
  { kind: '.string', vals: ["\"Ce sous-marin qu'on a piqué…\\n\""] },
  { kind: '.string', vals: ["\"Plutôt brutale la balade!\\p\""] },
  { kind: '.string', vals: ["\"C'est trop étroit là-dedans!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_SEAFLOOR_CAVERN_1","SeafloorCavern_Room1_Text_Grunt1Intro","SeafloorCavern_Room1_Text_Grunt1Defeat"]},
  {op:"msgbox",args:["SeafloorCavern_Room1_Text_Grunt1PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GRUNT_SEAFLOOR_CAVERN_2","SeafloorCavern_Room1_Text_Grunt2Intro","SeafloorCavern_Room1_Text_Grunt2Defeat"]},
  {op:"msgbox",args:["SeafloorCavern_Room1_Text_Grunt2PostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
