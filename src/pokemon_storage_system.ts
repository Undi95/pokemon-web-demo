/**
 * pokemon_storage_system.ts — miroir 1:1 PARTIEL de `src/pokemon_storage_system.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/pokemon_storage_system.c`.
 *
 * Ne porte ici que `CheckFreePokemonStorageSpace` (le système PC complet — UI boîtes,
 * dépôt/retrait — est un gros sous-système déféré). La struct PokemonStorage (14×30
 * BoxPokemon) existe déjà dans le save block (sectors 5-13).
 */

import { GetPokemonStorage } from './save';
import { TOTAL_BOXES_COUNT, IN_BOX_COUNT } from './engine/save/save-blocks';

/** 1:1 décomp `CheckFreePokemonStorageSpace(void)` (pokemon_storage_system.c:9572) :
 *    for (i = 0; i < TOTAL_BOXES_COUNT; i++)
 *      for (j = 0; j < IN_BOX_COUNT; j++)
 *        if (!GetBoxMonData(&boxes[i][j], MON_DATA_SANITY_HAS_SPECIES))
 *          return TRUE;
 *    return FALSE;
 *  Renvoie TRUE dès qu'un slot de boîte PC est libre. Nos slots sont `PokemonInstance
 *  | null` → libre = `null` (ou speciesId 0, = SPECIES_NONE). */
export function CheckFreePokemonStorageSpace(): boolean {
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const slot = boxes[i]?.[j];
      if (!slot || !slot.speciesId) return true;
    }
  }
  return false;
}

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CheckFreePokemonStorageSpace = CheckFreePokemonStorageSpace;
