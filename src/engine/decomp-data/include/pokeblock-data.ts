// AUTO-GENERATED from include/pokeblock.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokeblock.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_POKEBLOCK = 14818;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PBLOCK_0 = {
  PBLOCK_CLR_NONE: 0,
  PBLOCK_CLR_RED: 1,
  PBLOCK_CLR_BLUE: 2,
  PBLOCK_CLR_PINK: 3,
  PBLOCK_CLR_GREEN: 4,
  PBLOCK_CLR_YELLOW: 5,
  PBLOCK_CLR_PURPLE: 6,
  PBLOCK_CLR_INDIGO: 7,
  PBLOCK_CLR_BROWN: 8,
  PBLOCK_CLR_LITE_BLUE: 9,
  PBLOCK_CLR_OLIVE: 10,
  PBLOCK_CLR_GRAY: 11,
  PBLOCK_CLR_BLACK: 12,
  PBLOCK_CLR_WHITE: 13,
  PBLOCK_CLR_GOLD: 14,
} as const;
export const ENUM_PBLOCK_1 = {
  PBLOCK_COLOR: 0,
  PBLOCK_SPICY: 1,
  PBLOCK_DRY: 2,
  PBLOCK_SWEET: 3,
  PBLOCK_BITTER: 4,
  PBLOCK_SOUR: 5,
  PBLOCK_FEEL: 6,
} as const;
export const ENUM_PBLOCK_2 = {
  PBLOCK_CASE_FIELD: 0,
  PBLOCK_CASE_BATTLE: 1,
  PBLOCK_CASE_FEEDER: 2,
  PBLOCK_CASE_GIVE: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PreparePokeblockFeedScene', ret: "void", arity: 0, params: "void" },
  { name: 'OpenPokeblockCaseInBattle', ret: "void", arity: 0, params: "void" },
  { name: 'OpenPokeblockCaseOnFeeder', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPokeblockScrollPositions', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePokeblockCaseSprite', ret: "u8", arity: 3, params: "s16 x, s16 y, u8 subpriority" },
  { name: 'ClearPokeblocks', ret: "void", arity: 0, params: "void" },
  { name: 'GetHighestPokeblocksFlavorLevel', ret: "u8", arity: 1, params: "const struct Pokeblock *pokeblock" },
  { name: 'GetPokeblocksFeel', ret: "u8", arity: 1, params: "const struct Pokeblock *pokeblock" },
  { name: 'GetFirstFreePokeblockSlot', ret: "s8", arity: 0, params: "void" },
  { name: 'AddPokeblock', ret: "bool32", arity: 1, params: "const struct Pokeblock *pokeblock" },
  { name: 'TryClearPokeblock', ret: "bool32", arity: 1, params: "u8 pkblId" },
  { name: 'GetPokeblockData', ret: "s16", arity: 2, params: "const struct Pokeblock *pokeblock, u8 field" },
  { name: 'PokeblockGetGain', ret: "s16", arity: 2, params: "u8 nature, const struct Pokeblock *pokeblock" },
  { name: 'PokeblockCopyName', ret: "void", arity: 2, params: "const struct Pokeblock *pokeblock, u8 *dest" },
  { name: 'CopyMonFavoritePokeblockName', ret: "bool8", arity: 2, params: "u8 nature, u8 *dest" },
  { name: 'GetPokeblocksFlavor', ret: "u8", arity: 1, params: "const struct Pokeblock *pokeblock" },
] as const;
