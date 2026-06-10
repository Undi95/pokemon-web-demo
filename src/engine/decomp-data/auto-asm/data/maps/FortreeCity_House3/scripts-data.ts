// AUTO-GENERATED from data/maps/FortreeCity_House3/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_House3/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_House3_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House3_EventScript_Maniac', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House3_EventScript_SchoolKidM', isGlobal: true, instrIndex: 2 },
  { name: 'FortreeCity_House3_Text_MetStevenHadAmazingPokemon', isGlobal: false, instrIndex: 4 },
  { name: 'FortreeCity_House3_Text_OhYouHavePokedex', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=15
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"En parlant de POKéDEX, ça me\\n\""] },
  { kind: '.string', vals: ["\"rappelle quelque chose.\\p\""] },
  { kind: '.string', vals: ["\"J'ai rencontré ce DRESSEUR, PIERRE,\\n\""] },
  { kind: '.string', vals: ["\"quand je cherchais des pierres rares.\\p\""] },
  { kind: '.string', vals: ["\"Si t'avais vu comme ses POKéMON\\n\""] },
  { kind: '.string', vals: ["\"étaient surprenants!\\p\""] },
  { kind: '.string', vals: ["\"Non seulement ils étaient rares, mais\\n\""] },
  { kind: '.string', vals: ["\"ils étaient également soumis à un rude\\l\""] },
  { kind: '.string', vals: ["\"entraînement.\\p\""] },
  { kind: '.string', vals: ["\"Ce DRESSEUR est peut-être encore plus\\n\""] },
  { kind: '.string', vals: ["\"fort que le CHAMPION de cette ville…$\""] },
  { kind: '.string', vals: ["\"Quelle est cette chose que tu as là?\\p\""] },
  { kind: '.string', vals: ["\"… … … … … …\\p\""] },
  { kind: '.string', vals: ["\"Oh, ça s'appelle un POKéDEX?\\n\""] },
  { kind: '.string', vals: ["\"C'est très impressionnant!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["FortreeCity_House3_Text_MetStevenHadAmazingPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_House3_Text_OhYouHavePokedex","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
