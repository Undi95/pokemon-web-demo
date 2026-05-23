// AUTO-GENERATED from include/pokedex.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokedex.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_DEX_0 = {
  DEX_MODE_HOENN: 0,
  DEX_MODE_NATIONAL: 1,
} as const;
export const ENUM_FLAG_1 = {
  FLAG_GET_SEEN: 0,
  FLAG_GET_CAUGHT: 1,
  FLAG_SET_SEEN: 2,
  FLAG_SET_CAUGHT: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ResetPokedex', ret: "void", arity: 0, params: "void" },
  { name: 'GetPokedexHeightWeight', ret: "u16", arity: 2, params: "u16 dexNum, u8 data" },
  { name: 'GetNationalPokedexCount', ret: "u16", arity: 1, params: "u8 caseID" },
  { name: 'GetHoennPokedexCount', ret: "u16", arity: 1, params: "u8 caseID" },
  { name: 'DisplayCaughtMonDexPage', ret: "u8", arity: 3, params: "u16 dexNum, u32 otId, u32 personality" },
  { name: 'GetSetPokedexFlag', ret: "s8", arity: 2, params: "u16 nationalDexNo, u8 caseID" },
  { name: 'CreateMonSpriteFromNationalDexNumber', ret: "u16", arity: 4, params: "u16 nationalNum, s16 x, s16 y, u16 paletteSlot" },
  { name: 'HasAllHoennMons', ret: "bool16", arity: 0, params: "void" },
  { name: 'ResetPokedexScrollPositions', ret: "void", arity: 0, params: "void" },
  { name: 'HasAllMons', ret: "bool16", arity: 0, params: "void" },
  { name: 'CB2_OpenPokedex', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_OpenPokedex',
] as const;
