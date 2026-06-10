// AUTO-GENERATED from data/maps/SootopolisCity_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_House1/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House1_EventScript_BrickBreakBlackBelt', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House1_EventScript_ReceivedBrickBreak', isGlobal: true, instrIndex: 10 },
  { name: 'SootopolisCity_House1_EventScript_Kecleon', isGlobal: true, instrIndex: 13 },
  { name: 'SootopolisCity_House1_Text_DevelopedThisTM', isGlobal: false, instrIndex: 21 },
  { name: 'SootopolisCity_House1_Text_ExplainBrickBreak', isGlobal: false, instrIndex: 21 },
  { name: 'SootopolisCity_House1_Text_Kecleon', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je suis resté trente ans à\\n\""] },
  { kind: '.string', vals: ["\"ATALANOPOLIS pour améliorer\\l\""] },
  { kind: '.string', vals: ["\"mes connaissances.\\p\""] },
  { kind: '.string', vals: ["\"J'ai conçu une CT renversante.\\n\""] },
  { kind: '.string', vals: ["\"Je te la lègue!$\""] },
  { kind: '.string', vals: ["\"La CT31 contient CASSE-BRIQUE!\\n\""] },
  { kind: '.string', vals: ["\"Un coup si terrible que je n'peux\\l\""] },
  { kind: '.string', vals: ["\"le décrire.$\""] },
  { kind: '.string', vals: ["\"KECLEON: Eooon.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_TM_BRICK_BREAK","SootopolisCity_House1_EventScript_ReceivedBrickBreak"]},
  {op:"msgbox",args:["SootopolisCity_House1_Text_DevelopedThisTM","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_TM_BRICK_BREAK"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_TM_BRICK_BREAK"]},
  {op:"msgbox",args:["SootopolisCity_House1_Text_ExplainBrickBreak","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House1_Text_ExplainBrickBreak","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_KECLEON","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["SootopolisCity_House1_Text_Kecleon","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
