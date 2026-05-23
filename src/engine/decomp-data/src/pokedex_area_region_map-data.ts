// AUTO-GENERATED from src/pokedex_area_region_map.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokedex_area_region_map.c
// Generated: 2026-04-26

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sPokedexAreaMap_Tilemap': { path: 'graphics/pokedex/region_map.bin', ext: '.lz', type: 'u32' },
  'sPokedexAreaMapAffine_Tilemap': { path: 'graphics/pokedex/region_map_affine.bin', ext: '.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadPokedexAreaMapGfx', ret: "void", arity: 1, params: "const struct PokedexAreaMapTemplate *template" },
  { name: 'TryShowPokedexAreaMap', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreePokedexAreaMapBgNum', ret: "void", arity: 0, params: "void" },
  { name: 'PokedexAreaMapChangeBgY', ret: "void", arity: 1, params: "u32 move" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'menu.h',
  'bg.h',
  'malloc.h',
  'palette.h',
  'pokedex_area_region_map.h',
] as const;
