/**
 * pokemon_storage_system.ts — miroir 1:1 PARTIEL de `src/pokemon_storage_system.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/pokemon_storage_system.c`.
 *
 * Porte les helpers de comptage/espace (CheckFreePokemonStorageSpace, StorageGetCurrentBox,
 * AnyStorageMonWithMove, CountStorageNonEggMons, CountPartyAliveNonEggMonsExcept…) —
 * le système PC complet (UI boîtes, dépôt/retrait) est un gros sous-système déféré.
 * La struct PokemonStorage (14×30 BoxPokemon) existe déjà dans le save block (sectors 5-13).
 */

import { GetPokemonStorage } from './save';
import { TOTAL_BOXES_COUNT, IN_BOX_COUNT } from './engine/save/save-blocks';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import {
  gPlayerParty, GetMonData, MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_HP,
} from './engine/battle/party-storage';
// CopyMon/ZeroMonData : foyer pokemon.c (pokemon.ts n'importe PAS ce module —
// il passe par le hook __getPokemonStorage — donc pas de cycle).
import { CopyMon, ZeroMonData } from './pokemon';
import { VarGet } from './event_data';
import { PARTY_SIZE } from '../include/constants/global';

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
      if (!slot || !slot.species) return true;
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
 *  party NI PC ne connaît le move). Box mons = Pokemon NUMÉRIQUES : `move` (id décomp)
 *  comparé direct à `mon.moves[]` (number[]). */
export function AnyStorageMonWithMove(move: number): boolean {
  const boxes = GetPokemonStorage().boxes;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && mon.species && !mon.isEgg && mon.moves.includes(move)) {
        return true;
      }
    }
  }
  return false;
}

/** 1:1 décomp `u32 CountStorageNonEggMons(void)` (pokemon_storage_system.c:9600) :
 *  ```c
 *  for (i < TOTAL_BOXES_COUNT) for (j < IN_BOX_COUNT)
 *      if (HAS_SPECIES && !IS_EGG) count++;
 *  ```
 *  Compte les Pokémon (non-œuf) rangés dans les boîtes PC. Utilisé par
 *  CountPartyAliveNonEggMons (= PC + party), consommé par les scripts de pension. */
export function CountStorageNonEggMons(): number {
  const boxes = GetPokemonStorage().boxes;
  let count = 0;
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const mon = boxes[i]?.[j];
      if (mon && mon.species && !mon.isEgg) count++;
    }
  }
  return count;
}

/** 1:1 décomp `s16 CompactPartySlots(void)` (pokemon_storage_system.c:6734-6757) :
 *  ```c
 *  for (i = 0, last = 0; i < PARTY_SIZE; i++) {
 *      u16 species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES);
 *      if (species != SPECIES_NONE) {
 *          if (i != last) gPlayerParty[last] = gPlayerParty[i];
 *          last++;
 *      } else if (retVal == -1) retVal = i;
 *  }
 *  for (; last < PARTY_SIZE; last++) ZeroMonData(&gPlayerParty[last]);
 *  ```
 *  Compacte les slots party (mons valides remontés en tête, queue zérotée) ;
 *  retourne l'index du 1er slot qui était vide (-1 si aucun). La copie de struct
 *  `gPlayerParty[last] = gPlayerParty[i]` = CopyMon (copie par VALEUR — les slots
 *  gPlayerParty sont des objets fixes, jamais réassignés par référence). */
export function CompactPartySlots(): number {
  let retVal = -1;
  let last = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
    if (species !== 0 /* SPECIES_NONE */) {
      if (i !== last) CopyMon(gPlayerParty[last], gPlayerParty[i]);
      last++;
    } else if (retVal === -1) {
      retVal = i;
    }
  }
  for (; last < PARTY_SIZE; last++) ZeroMonData(gPlayerParty[last]);
  return retVal;
}

/** 1:1 décomp `u8 CountPartyAliveNonEggMonsExcept(u8 slotToIgnore)`
 *  (pokemon_storage_system.c:1440) : compte les mons party vivants (HP>0), non-œufs,
 *  hors slot `slotToIgnore` (PARTY_SIZE = aucun slot ignoré). */
export function CountPartyAliveNonEggMonsExcept(slotToIgnore: number): number {
  let count = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const mon = gPlayerParty[i];
    if (i !== slotToIgnore
      && (GetMonData(mon, MON_DATA_SPECIES) as number) !== 0 /* SPECIES_NONE */
      && !(GetMonData(mon, MON_DATA_IS_EGG) as number)
      && (GetMonData(mon, MON_DATA_HP) as number) !== 0) {
      count++;
    }
  }
  return count;
}

/** 1:1 décomp `u16 CountPartyAliveNonEggMons_IgnoreVar0x8004Slot(void)`
 *  (pokemon_storage_system.c:1458) — special (pension : « dernier mon valide ? »). */
export function CountPartyAliveNonEggMons_IgnoreVar0x8004Slot(): number {
  return CountPartyAliveNonEggMonsExcept(VarGet(0x8004) /* gSpecialVar_0x8004 */);
}

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CheckFreePokemonStorageSpace = CheckFreePokemonStorageSpace;
(globalThis as Record<string, unknown>).__AnyStorageMonWithMove = AnyStorageMonWithMove;
(globalThis as Record<string, unknown>).__CountStorageNonEggMons = CountStorageNonEggMons;
// __getPokemonStorage : accès au storage PC sans importer save.ts (cycle-break).
// Utilisé par la sonde déterministe ET par CopyMonToPC (party-storage.ts).
(globalThis as Record<string, unknown>).__getPokemonStorage = GetPokemonStorage;
