// AUTO-GENERATED from data/maps/RustboroCity_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_House2/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_House2_EventScript_PokefanF', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_House2_EventScript_LittleGirl', isGlobal: true, instrIndex: 2 },
  { name: 'RustboroCity_House2_Text_TrainerSchoolExcellent', isGlobal: false, instrIndex: 4 },
  { name: 'RustboroCity_House2_Text_RoxanneKnowsALot', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"L'ECOLE DE DRESSEURS est excellente.\\p\""] },
  { kind: '.string', vals: ["\"En y étudiant, tu pourrais même devenir\\n\""] },
  { kind: '.string', vals: ["\"CHAMPION D'ARENE.$\""] },
  { kind: '.string', vals: ["\"ROXANNE, notre CHAMPION, en sait\\n\""] },
  { kind: '.string', vals: ["\"vraiment beaucoup sur les POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Elle est également très forte!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["RustboroCity_House2_Text_TrainerSchoolExcellent","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_House2_Text_RoxanneKnowsALot","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
