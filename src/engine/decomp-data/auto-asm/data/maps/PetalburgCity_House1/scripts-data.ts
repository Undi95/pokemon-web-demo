// AUTO-GENERATED from data/maps/PetalburgCity_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PetalburgCity_House1/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PetalburgCity_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PetalburgCity_House1_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'PetalburgCity_House1_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'PetalburgCity_House1_Text_TravelingIsWonderful', isGlobal: false, instrIndex: 4 },
  { name: 'PetalburgCity_House1_Text_GoOnAdventure', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"C'est formidable de voyager!\\p\""] },
  { kind: '.string', vals: ["\"Quand j'étais jeune, je sillonnais\\n\""] },
  { kind: '.string', vals: ["\"les mers et les montagnes!$\""] },
  { kind: '.string', vals: ["\"Oooh…\\p\""] },
  { kind: '.string', vals: ["\"J'aimerais tant partir à l'aventure\\n\""] },
  { kind: '.string', vals: ["\"avec des POKéMON…\\p\""] },
  { kind: '.string', vals: ["\"Ramper dans l'herbe humide…\\n\""] },
  { kind: '.string', vals: ["\"Gravir les montagnes escarpées…\\p\""] },
  { kind: '.string', vals: ["\"Traverser les eaux déchaînées…\\n\""] },
  { kind: '.string', vals: ["\"Errer dans l'obscurité des cavernes…\\p\""] },
  { kind: '.string', vals: ["\"Et même parfois, avoir le mal du pays…\\n\""] },
  { kind: '.string', vals: ["\"Ce doit être fabuleux de voyager!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["PetalburgCity_House1_Text_TravelingIsWonderful","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PetalburgCity_House1_Text_GoOnAdventure","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
