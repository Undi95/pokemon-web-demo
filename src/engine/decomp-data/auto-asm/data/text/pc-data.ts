// AUTO-GENERATED from data/text/pc.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/pc.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Text_BootUpPC', isGlobal: false, instrIndex: 0 },
  { name: 'gText_WhichPCShouldBeAccessed', isGlobal: true, instrIndex: 0 },
  { name: 'gText_AccessedSomeonesPC', isGlobal: true, instrIndex: 0 },
  { name: 'gText_StorageSystemOpened', isGlobal: true, instrIndex: 0 },
  { name: 'gText_AccessedPlayersPC', isGlobal: true, instrIndex: 0 },
  { name: 'gText_AccessedLanettesPC', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=6
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"{PLAYER} allume le PC.$\""] },
  { kind: '.string', vals: ["\"Accéder à quel PC?$\""] },
  { kind: '.string', vals: ["\"PC de ??? connecté.$\""] },
  { kind: '.string', vals: ["\"Gestion de Stocks de POKéMON en ligne.$\""] },
  { kind: '.string', vals: ["\"PC personnel connecté.$\""] },
  { kind: '.string', vals: ["\"PC d'ANNETTE connecté.$\""] },
] as const;
