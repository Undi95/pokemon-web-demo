// AUTO-GENERATED from include/naming_screen.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/naming_screen.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_NAMING_0 = {
  NAMING_SCREEN_PLAYER: 0,
  NAMING_SCREEN_BOX: 1,
  NAMING_SCREEN_CAUGHT_MON: 2,
  NAMING_SCREEN_NICKNAME: 3,
  NAMING_SCREEN_WALDA: 4,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DoNamingScreen', ret: "void", arity: 6, params: "u8 templateNum, u8 *destBuffer, u16 monSpecies, u16 monGender, u32 monPersonality, MainCallback returnCallback" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
] as const;
