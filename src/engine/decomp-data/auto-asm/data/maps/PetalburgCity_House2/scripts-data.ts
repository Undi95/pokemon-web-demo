// AUTO-GENERATED from data/maps/PetalburgCity_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PetalburgCity_House2/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PetalburgCity_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PetalburgCity_House2_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'PetalburgCity_House2_EventScript_SchoolKid', isGlobal: true, instrIndex: 2 },
  { name: 'PetalburgCity_House2_Text_NormanBecameGymLeader', isGlobal: false, instrIndex: 4 },
  { name: 'PetalburgCity_House2_Text_BattledNormanOnce', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"NORMAN est le nouveau CHAMPION\\n\""] },
  { kind: '.string', vals: ["\"D'ARENE de notre ville.\\p\""] },
  { kind: '.string', vals: ["\"Je crois qu'il a fait venir sa famille\\n\""] },
  { kind: '.string', vals: ["\"d'une région lointaine.$\""] },
  { kind: '.string', vals: ["\"J'ai affronté NORMAN une fois.\\n\""] },
  { kind: '.string', vals: ["\"Mais il était bien trop fort.\\p\""] },
  { kind: '.string', vals: ["\"Comment dire…\\p\""] },
  { kind: '.string', vals: ["\"J'ai le sentiment qu'il ne vit\\n\""] },
  { kind: '.string', vals: ["\"que pour les POKéMON.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["PetalburgCity_House2_Text_NormanBecameGymLeader","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PetalburgCity_House2_Text_BattledNormanOnce","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
