// AUTO-GENERATED from include/bard_music.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/bard_music.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_BARD_SOUNDS_PER_WORD = 6;
export const NUM_BARD_PITCH_TABLES_PER_SIZE = 5;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CalcWordSounds', ret: "void", arity: 2, params: "struct BardSong *song, u16 pitchTableIndex" },
] as const;
