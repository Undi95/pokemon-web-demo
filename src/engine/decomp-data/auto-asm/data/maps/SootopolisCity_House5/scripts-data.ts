// AUTO-GENERATED from data/maps/SootopolisCity_House5/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_House5/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_House5_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House5_EventScript_Maniac', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House5_EventScript_Girl', isGlobal: true, instrIndex: 2 },
  { name: 'SootopolisCity_House5_Text_SootopolisMtPyreConnection', isGlobal: false, instrIndex: 4 },
  { name: 'SootopolisCity_House5_Text_BrotherUsedToStudySea', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=5
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Il semblerait qu'il existe un rapport\\n\""] },
  { kind: '.string', vals: ["\"entre ATALANOPOLIS et le MONT MEMORIA.\\p\""] },
  { kind: '.string', vals: ["\"Avec mes amis, on a fait des recherches\\n\""] },
  { kind: '.string', vals: ["\"à ce sujet au labo où je travaillais.$\""] },
  { kind: '.string', vals: ["\"Mon grand frère étudie la mer.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["SootopolisCity_House5_Text_SootopolisMtPyreConnection","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House5_Text_BrotherUsedToStudySea","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
