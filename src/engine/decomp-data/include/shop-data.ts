// AUTO-GENERATED from include/shop.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/shop.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreatePokemartMenu', ret: "void", arity: 1, params: "const u16 *itemsForSale" },
  { name: 'CreateDecorationShop1Menu', ret: "void", arity: 1, params: "const u16 *itemsForSale" },
  { name: 'CreateDecorationShop2Menu', ret: "void", arity: 1, params: "const u16 *itemsForSale" },
  { name: 'CB2_ExitSellMenu', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ExitSellMenu',
] as const;
