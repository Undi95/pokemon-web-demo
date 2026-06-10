// AUTO-GENERATED from data/maps/VerdanturfTown_House/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/VerdanturfTown_House/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'VerdanturfTown_House_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'VerdanturfTown_House_EventScript_Woman1', isGlobal: true, instrIndex: 0 },
  { name: 'VerdanturfTown_House_EventScript_Woman2', isGlobal: true, instrIndex: 2 },
  { name: 'VerdanturfTown_House_Text_TrainersGatherAtPokemonLeague', isGlobal: false, instrIndex: 4 },
  { name: 'VerdanturfTown_House_Text_DefeatEliteFourInARow', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Au loin, au fin fond d'ETERNARA,\\n\""] },
  { kind: '.string', vals: ["\"se trouve la LIGUE POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Les DRESSEURS qui s'y retrouvent sont\\n\""] },
  { kind: '.string', vals: ["\"terriblement doués.$\""] },
  { kind: '.string', vals: ["\"Dans la LIGUE POKéMON, la règle stipule\\n\""] },
  { kind: '.string', vals: ["\"que tu dois battre tous les membres\\l\""] },
  { kind: '.string', vals: ["\"du CONSEIL 4 consécutivement.\\p\""] },
  { kind: '.string', vals: ["\"Si tu perds contre l'un d'entre eux, tu\\n\""] },
  { kind: '.string', vals: ["\"dois reprendre le défi depuis le début.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["VerdanturfTown_House_Text_TrainersGatherAtPokemonLeague","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["VerdanturfTown_House_Text_DefeatEliteFourInARow","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
