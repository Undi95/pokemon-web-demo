// AUTO-GENERATED from include/pokemon_icon.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokemon_icon.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'TryLoadAllMonIconPalettesAtOffset', ret: "void", arity: 1, params: "u16 offset" },
  { name: 'GetValidMonIconPalIndex', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'GetIconSpecies', ret: "u16", arity: 2, params: "u16 species, u32 personality" },
  { name: 'GetUnownLetterByPersonality', ret: "u16", arity: 1, params: "u32 personality" },
  { name: 'GetIconSpeciesNoPersonality', ret: "u16", arity: 1, params: "u16 species" },
  { name: 'LoadMonIconPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMonIconPalette', ret: "void", arity: 1, params: "u16 species" },
  { name: 'FreeMonIconPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'FreeMonIconPalette', ret: "void", arity: 1, params: "u16 species" },
  { name: 'FreeAndDestroyMonIconSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateMonIconFrame', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_MonIcon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetPartyHPBarSprite', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'GetMonIconPaletteIndexFromSpecies', ret: "u8", arity: 1, params: "u16 species" },
] as const;
