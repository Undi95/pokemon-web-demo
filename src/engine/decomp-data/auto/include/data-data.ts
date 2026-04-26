// AUTO-GENERATED from include/data.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/data.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const SPECIES_SHINY_TAG = 500;
export const MAX_TRAINER_ITEMS = 4;
export const TRAINER_PIC_WIDTH = 64;
export const TRAINER_PIC_HEIGHT = 64;
/** Raw expr: `(TRAINER_PIC_WIDTH * TRAINER_PIC_HEIGHT / 2)` */
export const TRAINER_PIC_SIZE_EXPR = "(TRAINER_PIC_WIDTH * TRAINER_PIC_HEIGHT / 2)";
export const MAX_TRAINER_PIC_FRAMES = 4;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BATTLER_0 = {
  BATTLER_AFFINE_NORMAL: 0,
  BATTLER_AFFINE_EMERGE: 1,
  BATTLER_AFFINE_RETURN: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'NO_ITEM_DEFAULT_MOVES', ret: "define", arity: 1, params: "party" },
  { name: 'NO_ITEM_CUSTOM_MOVES', ret: "define", arity: 1, params: "party" },
  { name: 'ITEM_DEFAULT_MOVES', ret: "define", arity: 1, params: "party" },
  { name: 'ITEM_CUSTOM_MOVES', ret: "define", arity: 1, params: "party" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/moves.h',
] as const;
