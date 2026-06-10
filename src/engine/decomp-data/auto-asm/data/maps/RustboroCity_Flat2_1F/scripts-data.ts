// AUTO-GENERATED from data/maps/RustboroCity_Flat2_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_Flat2_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_Flat2_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat2_1F_EventScript_OldWoman', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat2_1F_EventScript_Skitty', isGlobal: true, instrIndex: 2 },
  { name: 'RustboroCity_Flat2_1F_Text_DevonWorkersLiveHere', isGlobal: false, instrIndex: 10 },
  { name: 'RustboroCity_Flat2_1F_Text_Skitty', isGlobal: false, instrIndex: 10 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=3
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les employés de DEVON vivent\\n\""] },
  { kind: '.string', vals: ["\"dans ce bâtiment.$\""] },
  { kind: '.string', vals: ["\"SKITTY: Skiiit!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 10 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["RustboroCity_Flat2_1F_Text_DevonWorkersLiveHere","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_SKITTY","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["RustboroCity_Flat2_1F_Text_Skitty","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
