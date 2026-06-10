// AUTO-GENERATED from data/text/record_mix.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/record_mix.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Text_WouldYouLikeToMixRecords', isGlobal: false, instrIndex: 0 },
  { name: 'Text_WeHopeToSeeYouAgain', isGlobal: false, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=3
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Voulez-vous échanger vos données\\n\""] },
  { kind: '.string', vals: ["\"avec d'autres DRESSEURS?$\""] },
  { kind: '.string', vals: ["\"A une prochaine fois peut-être!$\""] },
] as const;
