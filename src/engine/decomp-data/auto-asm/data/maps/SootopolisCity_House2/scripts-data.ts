// AUTO-GENERATED from data/maps/SootopolisCity_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_House2/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House2_EventScript_ExpertF', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House2_EventScript_KnowAboutOrbs', isGlobal: true, instrIndex: 7 },
  { name: 'SootopolisCity_House2_EventScript_DontKnowAboutOrbs', isGlobal: true, instrIndex: 9 },
  { name: 'SootopolisCity_House2_Text_DidYouKnowAboutMtPyreOrbs', isGlobal: false, instrIndex: 11 },
  { name: 'SootopolisCity_House2_Text_YesTwoOrbsSideBySide', isGlobal: false, instrIndex: 11 },
  { name: 'SootopolisCity_House2_Text_OughtToVisitAndSee', isGlobal: false, instrIndex: 11 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=8
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"MONT MEMORIA…\\p\""] },
  { kind: '.string', vals: ["\"Au sommet reposent deux orbes\\n\""] },
  { kind: '.string', vals: ["\"l'un à côté de l'autre. Tu le savais?$\""] },
  { kind: '.string', vals: ["\"C'est ça, deux orbes côte à côte…\\p\""] },
  { kind: '.string', vals: ["\"Les voir ensemble…\\n\""] },
  { kind: '.string', vals: ["\"C'est apaisant…$\""] },
  { kind: '.string', vals: ["\"Non. C'est vrai?\\n\""] },
  { kind: '.string', vals: ["\"Tu devrais peut-être y aller pour voir…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 11 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["SootopolisCity_House2_Text_DidYouKnowAboutMtPyreOrbs","MSGBOX_YESNO"]},
  {op:"call_if_eq",args:["VAR_RESULT","YES","SootopolisCity_House2_EventScript_KnowAboutOrbs"]},
  {op:"call_if_eq",args:["VAR_RESULT","NO","SootopolisCity_House2_EventScript_DontKnowAboutOrbs"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House2_Text_YesTwoOrbsSideBySide","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"msgbox",args:["SootopolisCity_House2_Text_OughtToVisitAndSee","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
] as const;
