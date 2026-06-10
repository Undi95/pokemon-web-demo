// AUTO-GENERATED from data/maps/OldaleTown_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/OldaleTown_House2/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'OldaleTown_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'OldaleTown_House2_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'OldaleTown_House2_EventScript_Man', isGlobal: true, instrIndex: 2 },
  { name: 'OldaleTown_House2_Text_PokemonLevelUp', isGlobal: false, instrIndex: 4 },
  { name: 'OldaleTown_House2_Text_YoullGoFurtherWithStrongPokemon', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Lorsque les POKéMON se battent, ils\\n\""] },
  { kind: '.string', vals: ["\"gagnent de l'expérience et deviennent\\l\""] },
  { kind: '.string', vals: ["\"plus forts.$\""] },
  { kind: '.string', vals: ["\"Si les POKéMON de ton équipe deviennent\\n\""] },
  { kind: '.string', vals: ["\"plus forts, tu pourras voyager plus\\l\""] },
  { kind: '.string', vals: ["\"loin.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["OldaleTown_House2_Text_PokemonLevelUp","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["OldaleTown_House2_Text_YoullGoFurtherWithStrongPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
