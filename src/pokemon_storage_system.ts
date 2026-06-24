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
import { moveEnumToDexId } from './engine/pokemon/pokemon';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';

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

/** 1:1 décomp `u8 StorageGetCurrentBox(void)` (pokemon_storage_system.c:9404) :
 *  `return gPokemonStoragePtr->currentBox;` — la boîte PC actuellement pointée
 *  par le curseur. Utilisé par ShouldShowBoxWasFullMessage (field_specials.c). */
export function StorageGetCurrentBox(): number {
  return GetPokemonStorage().currentBox;
}

/** 1:1 décomp `bool8 AnyStorageMonWithMove(u16 move)` (pokemon_storage_system.c:9636) :
 *  ```c
 *  for (i < TOTAL_BOXES_COUNT) for (j < IN_BOX_COUNT)
 *      if (HAS_SPECIES && !IS_EGG && GetBoxMonData(KNOWN_MOVES, {move, MOVES_COUNT}))
 *          return TRUE;
 *  return FALSE;
 *  ```
 *  TRUE si AU MOINS un Pokémon (non-œuf) du PC connaît `move`. Utilisé par
 *  IsLastMonThatKnowsSurf (anti-softlock : on ne bloque l'oubli que si AUCUN mon
 *  party NI PC ne connaît le move). Adaptation modèle : `move` = id décomp →
 *  converti en dexId string (les box mons = PokemonInstance, moves[].id = dexId). */
export function AnyStorageMonWithMove(move: number): boolean {
  const moveEnum = reverseDecompConstant(move, 'MOVE_') ?? '';
  const moveDexId = moveEnumToDexId(moveEnum);
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && mon.speciesId && !mon.isEgg && mon.moves.some(m => m.id === moveDexId)) {
        return true;
      }
    }
  }
  return false;
}

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CheckFreePokemonStorageSpace = CheckFreePokemonStorageSpace;
(globalThis as Record<string, unknown>).__AnyStorageMonWithMove = AnyStorageMonWithMove;
(globalThis as Record<string, unknown>).__getPokemonStorage = GetPokemonStorage;
