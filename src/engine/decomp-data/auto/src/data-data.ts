// AUTO-GENERATED from src/data.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/data.c
// Generated: 2026-04-26

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'gMinigameDigits_Pal': { path: 'graphics/link/minigame_digits.png', ext: '.gbapal', type: 'u16' },
  'gMinigameDigits_Gfx': { path: 'graphics/link/minigame_digits.png', ext: '.4bpp.lz', type: 'u32' },
  'sMinigameDigitsThin_Gfx': { path: 'graphics/link/minigame_digits2.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'data.h',
  'graphics.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/trainers.h',
  'constants/battle_ai.h',
  'data/pokemon_graphics/unused_anims.h',
  'data/pokemon_graphics/front_pic_coordinates.h',
  'data/pokemon_graphics/still_front_pic_table.h',
  'data/pokemon_graphics/back_pic_coordinates.h',
  'data/pokemon_graphics/back_pic_table.h',
  'data/pokemon_graphics/palette_table.h',
  'data/pokemon_graphics/shiny_palette_table.h',
  'data/trainer_graphics/front_pic_anims.h',
  'data/trainer_graphics/front_pic_tables.h',
  'data/trainer_graphics/back_pic_anims.h',
  'data/trainer_graphics/back_pic_tables.h',
  'data/pokemon_graphics/enemy_mon_elevation.h',
  'data/pokemon_graphics/front_pic_anims.h',
  'data/pokemon_graphics/front_pic_table.h',
  'data/pokemon_graphics/unknown_table.h',
  'data/trainer_parties.h',
  'data/text/trainer_class_names.h',
  'data/trainers.h',
  'data/text/species_names.h',
  'data/text/move_names.h',
] as const;
