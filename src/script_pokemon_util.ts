/**
 * script-pokemon-util.ts — 1:1 port subset de `src/script_pokemon_util.c`.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/script_pokemon_util.c`
 *
 * Subset porté : helpers party-scan utilisés par les specials registry. Le
 * reste du fichier décomp (= ScriptGivePokemon, CreateScriptedWildMon, etc.)
 * vit déjà éparpillé dans d'autres modules (= script-opcodes-mon.ts /
 * battle/party-storage.ts) ; on ne re-porte que ce qui manque, sans dup.
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { GetMonData, MON_DATA_HELD_ITEM, MON_DATA_SPECIES_OR_EGG } from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import { PARTY_SIZE } from './engine/decomp-data/include/constants/global-data';
import { SPECIES_NONE, SPECIES_EGG } from './engine/decomp-data/include/constants/species-data';

/** 1:1 décomp `CheckPartyMonHasHeldItem(item)` (script_pokemon_util.c:115-126).
 *  ```c
 *  static bool8 CheckPartyMonHasHeldItem(u16 item) {
 *      int i;
 *      for (i = 0; i < PARTY_SIZE; i++) {
 *          u16 species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES_OR_EGG);
 *          if (species != SPECIES_NONE && species != SPECIES_EGG
 *              && GetMonData(&gPlayerParty[i], MON_DATA_HELD_ITEM) == item)
 *              return TRUE;
 *      }
 *      return FALSE;
 *  }
 *  ```
 *  Scan party pour mon vivant (= pas none / pas egg) tenant `item`. */
export function CheckPartyMonHasHeldItem(item: number): boolean {
  const party = gSaveBlock1Ptr.playerParty as unknown as Pokemon[];
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (!party[i]) continue;
    const species = GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) as number;
    if (species !== SPECIES_NONE && species !== SPECIES_EGG
        && GetMonData(party[i], MON_DATA_HELD_ITEM) === item)
      return true;
  }
  return false;
}
