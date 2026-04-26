// AUTO-GENERATED from data/maps/RustboroCity_Flat2_3F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_Flat2_3F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_Flat2_3F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat2_3F_EventScript_DevonEmployee', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat2_3F_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'RustboroCity_Flat2_3F_Text_PresidentCollectsRareStones', isGlobal: false, instrIndex: 4 },
  { name: 'RustboroCity_Flat2_3F_Text_PresidentsSonAlsoCollectsRareStones', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Le DIRECTEUR de DEVON collectionne\\n\""] },
  { kind: '.string', vals: ["\"les pierres rares.$\""] },
  { kind: '.string', vals: ["\"Je crois que le fils du DIRECTEUR\\n\""] },
  { kind: '.string', vals: ["\"collectionne aussi les pierres rares.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["RustboroCity_Flat2_3F_Text_PresidentCollectsRareStones","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_Flat2_3F_Text_PresidentsSonAlsoCollectsRareStones","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
