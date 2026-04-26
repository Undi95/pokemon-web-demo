// AUTO-GENERATED from data/multiboot_ereader.s by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/multiboot_ereader.s
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gMultiBootProgram_EReader_Start', isGlobal: true, instrIndex: 0 },
  { name: 'gMultiBootProgram_EReader_End', isGlobal: true, instrIndex: 0 },
] as const;

// ─── .include / .incbin / #include (dependency graph) ──────────────────────
export const INCLUDES = [
  { kind: 'incbin', path: "data/mb_ereader.gba" },
] as const;
