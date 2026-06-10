// AUTO-GENERATED from data/multiboot_berry_glitch_fix.s by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/multiboot_berry_glitch_fix.s
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gMultiBootProgram_BerryGlitchFix_Start', isGlobal: true, instrIndex: 0 },
  { name: 'gMultiBootProgram_BerryGlitchFix_End', isGlobal: true, instrIndex: 0 },
] as const;

// ─── .include / .incbin / #include (dependency graph) ──────────────────────
export const INCLUDES = [
  { kind: 'incbin', path: "data/mb_berry_fix.gba" },
] as const;
