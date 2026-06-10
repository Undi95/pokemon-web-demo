// AUTO-GENERATED from data/text/mart_clerk.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/mart_clerk.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gText_HowMayIServeYou', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PleaseComeAgain', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PlayerWhatCanIDoForYou', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=5
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Bienvenue!\\p\""] },
  { kind: '.string', vals: ["\"En quoi puis-je vous aider?$\""] },
  { kind: '.string', vals: ["\"A la prochaine!$\""] },
  { kind: '.string', vals: ["\"Bienvenue {PLAYER}{KUN}!\\p\""] },
  { kind: '.string', vals: ["\"Que puis-je faire pour vous?$\""] },
] as const;
