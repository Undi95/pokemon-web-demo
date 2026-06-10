// AUTO-GENERATED from data/maps/LilycoveCity_House4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LilycoveCity_House4/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_House4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_House4_EventScript_Man1', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_House4_EventScript_Man2', isGlobal: true, instrIndex: 2 },
  { name: 'LilycoveCity_House4_Text_MysteriesAtBottomOfSea', isGlobal: false, instrIndex: 4 },
  { name: 'LilycoveCity_House4_Text_UnderwaterTrenchMossdeepSootopolis', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les plus grands mystères de cette\\n\""] },
  { kind: '.string', vals: ["\"planète se trouvent au fond de l'océan.\\p\""] },
  { kind: '.string', vals: ["\"Quelqu'un a dit ça, mais j'sais plus qui…$\""] },
  { kind: '.string', vals: ["\"Il y a un abîme tout au fond de l'eau,\\n\""] },
  { kind: '.string', vals: ["\"entre ALGATIA et ATALANOPOLIS.\\p\""] },
  { kind: '.string', vals: ["\"En tout cas, c'est ce qu'on m'a dit.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["LilycoveCity_House4_Text_MysteriesAtBottomOfSea","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_House4_Text_UnderwaterTrenchMossdeepSootopolis","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
