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
import {
  GetMonData, MON_DATA_HELD_ITEM, MON_DATA_SPECIES_OR_EGG,
  GiveMonToPlayer, MON_GIVEN_TO_PARTY, MON_GIVEN_TO_PC,
} from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
import { CreateMon } from './engine/pokemon/pokemon';
import {
  SpeciesToNationalPokedexNum, GetSetPokedexFlag, FLAG_SET_SEEN, FLAG_SET_CAUGHT,
} from './engine/ui/pokedex-flags';
import { PARTY_SIZE } from '../include/constants/global';
import { SPECIES_NONE, SPECIES_EGG } from '../include/constants/species';

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

/** 1:1 décomp `ScriptGiveMon` (script_pokemon_util.c:61-85) :
 *  ```c
 *  CreateMon(&mon, species, level, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
 *  SetMonData(&mon, MON_DATA_HELD_ITEM, &item);
 *  sentToPc = GiveMonToPlayer(&mon);
 *  nationalDexNum = SpeciesToNationalPokedexNum(species);
 *  switch (sentToPc) {
 *    case MON_GIVEN_TO_PARTY: case MON_GIVEN_TO_PC:
 *      GetSetPokedexFlag(nationalDexNum, FLAG_SET_SEEN);
 *      GetSetPokedexFlag(nationalDexNum, FLAG_SET_CAUGHT);
 *  }
 *  return sentToPc;  // 0=PARTY, 1=PC, 2=CANT_GIVE
 *  ```
 *  Adaptation modèle : notre `CreateMon(speciesEnum, level, {heldItem})` prend le
 *  nom d'espèce/item (au lieu d'un u16 + SetMonData séparé) ; le n° Pokédex est
 *  dérivé de `mon.species` (numérique) après création. Le reste est 1:1 — y
 *  compris l'enregistrement Pokédex SEEN+CAUGHT (que l'ancien opcode inline
 *  oubliait → Pokémon offert jamais inscrit au Pokédex). */
export function ScriptGiveMon(speciesEnum: string, level: number, heldItem?: string): number {
  const mon = CreateMon(speciesEnum, level, heldItem ? { heldItem } : undefined);
  const sentToPc = GiveMonToPlayer(mon);
  const nationalDexNum = SpeciesToNationalPokedexNum(mon.species);
  // 1:1 décomp : ne PAS poser les flags pour MON_CANT_GIVE.
  switch (sentToPc) {
    case MON_GIVEN_TO_PARTY:
    case MON_GIVEN_TO_PC:
      GetSetPokedexFlag(nationalDexNum, FLAG_SET_SEEN);
      GetSetPokedexFlag(nationalDexNum, FLAG_SET_CAUGHT);
      break;
  }
  return sentToPc;
}
