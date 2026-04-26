// AUTO-GENERATED from include/decoration_inventory.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/decoration_inventory.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetDecorationInventoriesPointers', ret: "void", arity: 0, params: "void" },
  { name: 'ClearDecorationInventories', ret: "void", arity: 0, params: "void" },
  { name: 'GetFirstEmptyDecorSlot', ret: "s8", arity: 1, params: "u8 category" },
  { name: 'CheckHasDecoration', ret: "bool8", arity: 1, params: "u8 decor" },
  { name: 'DecorationAdd', ret: "bool8", arity: 1, params: "u8 decor" },
  { name: 'DecorationCheckSpace', ret: "bool8", arity: 1, params: "u8 decor" },
  { name: 'DecorationRemove', ret: "s8", arity: 1, params: "u8 decor" },
  { name: 'CondenseDecorationsInCategory', ret: "void", arity: 1, params: "u8 category" },
  { name: 'GetNumOwnedDecorationsInCategory', ret: "u8", arity: 1, params: "u8 category" },
  { name: 'GetNumOwnedDecorations', ret: "u8", arity: 0, params: "void" },
] as const;
