// AUTO-GENERATED from data/multiboot_pokemon_colosseum.s by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/multiboot_pokemon_colosseum.s
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gMultiBootProgram_PokemonColosseum_Start', isGlobal: true, instrIndex: 0 },
  { name: 'gMultiBootProgram_PokemonColosseum_End', isGlobal: true, instrIndex: 0 },
] as const;

// ─── .include / .incbin / #include (dependency graph) ──────────────────────
export const INCLUDES = [
  { kind: 'incbin', path: "data/mb_colosseum.gba" },
] as const;
