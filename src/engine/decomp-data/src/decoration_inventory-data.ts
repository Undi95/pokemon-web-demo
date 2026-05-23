// AUTO-GENERATED from src/decoration_inventory.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/decoration_inventory.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct DecorationInventory", name: 'gDecorationInventories', isArray: true, init: "{}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SET_DECOR_INV', ret: "define", arity: 2, params: "i, ptr" },
  { name: 'SetDecorationInventoriesPointers', ret: "void", arity: 0, params: "void" },
  { name: 'ClearDecorationInventory', ret: "void", arity: 1, params: "u8 category" },
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

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'constants/decorations.h',
  'decoration.h',
  'decoration_inventory.h',
] as const;
