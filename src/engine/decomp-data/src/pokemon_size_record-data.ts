// AUTO-GENERATED from src/pokemon_size_record.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokemon_size_record.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const DEFAULT_MAX_SIZE = 32768;
/** Raw expr: `2.54` */
export const CM_PER_INCH_EXPR = "2.54";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetMonSizeHash', ret: "u32", arity: 1, params: "struct Pokemon *pkmn" },
  { name: 'TranslateBigMonSizeTableIndex', ret: "u8", arity: 1, params: "u16 a" },
  { name: 'GetMonSize', ret: "u32", arity: 2, params: "u16 species, u16 b" },
  { name: 'FormatMonSizeRecord', ret: "void", arity: 2, params: "u8 *string, u32 size" },
  { name: 'CompareMonSize', ret: "u8", arity: 2, params: "u16 species, u16 *sizeRecord" },
  { name: 'GetMonSizeRecordInfo', ret: "void", arity: 2, params: "u16 species, u16 *sizeRecord" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "gStringVar2, gSaveBlock2Ptr->playerName" },
  { name: 'InitSeedotSizeRecord', ret: "void", arity: 0, params: "void" },
  { name: 'GetSeedotSizeRecordInfo', ret: "void", arity: 0, params: "void" },
  { name: 'CompareSeedotSize', ret: "void", arity: 0, params: "void" },
  { name: 'InitLotadSizeRecord', ret: "void", arity: 0, params: "void" },
  { name: 'GetLotadSizeRecordInfo', ret: "void", arity: 0, params: "void" },
  { name: 'CompareLotadSize', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'data.h',
  'event_data.h',
  'pokedex.h',
  'pokemon.h',
  'pokemon_size_record.h',
  'string_util.h',
  'text.h',
  'constants/party_menu.h',
  'constants/pokemon_size_record.h',
] as const;
