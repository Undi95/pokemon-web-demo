// AUTO-GENERATED from include/mon_markings.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mon_markings.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_MON_MARKINGS = 4;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitMonMarkingsMenu', ret: "void", arity: 1, params: "struct MonMarkingsMenu *ptr" },
  { name: 'BufferMonMarkingsMenuTiles', ret: "void", arity: 0, params: "void" },
  { name: 'OpenMonMarkingsMenu', ret: "void", arity: 3, params: "u8 markings, s16 x, s16 y" },
  { name: 'FreeMonMarkingsMenu', ret: "void", arity: 0, params: "void" },
  { name: 'HandleMonMarkingsMenuInput', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateMonMarkingTiles', ret: "void", arity: 2, params: "u8 markings, void *dest" },
] as const;
