// AUTO-GENERATED from data/text/surf.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/surf.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gText_WantToUseSurf', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PlayerUsedSurf', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=3
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"L'eau est teintée d'un bleu foncé…\\n\""] },
  { kind: '.string', vals: ["\"Voulez-vous utiliser SURF?$\""] },
  { kind: '.string', vals: ["\"{STR_VAR_1} utilise SURF!$\""] },
] as const;
