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
  GetMonData, SetMonData, MON_DATA_HELD_ITEM, MON_DATA_SPECIES_OR_EGG, MON_DATA_IS_EGG,
  GiveMonToPlayer, MON_GIVEN_TO_PARTY, MON_GIVEN_TO_PC,
  SetMonMoveSlot, gPlayerParty, CalculatePlayerPartyCount,
} from './engine/battle/party-storage';
import type { Pokemon } from './engine/battle/party-storage';
// CreateMon NUMÉRIQUE 1:1 (foyer pokemon.c) — remplace la convenience legacy
// engine/pokemon/pokemon:CreateMon(speciesEnum, opts). createEmptyPokemon = la struct cible.
import { CreateMon, createEmptyPokemon } from './pokemon';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { OT_ID_PLAYER_ID } from '../include/constants/pokemon';
import { CreateEgg } from './daycare';
import { GetSetPokedexFlag } from './pokedex';
import { SpeciesToNationalPokedexNum } from './pokemon';
import { FLAG_SET_SEEN, FLAG_SET_CAUGHT } from '../include/pokedex';
import { PARTY_SIZE, MAX_MON_MOVES } from '../include/constants/global';
import { SPECIES_NONE, SPECIES_EGG } from '../include/constants/species';
import {
  MON_DATA_MAX_HP, MON_DATA_HP, MON_DATA_PP_BONUSES, MON_DATA_MOVE1, MON_DATA_PP1, MON_DATA_STATUS,
} from '../include/pokemon';
import { CalculatePPWithBonus } from './pokemon';

/** 1:1 décomp `HealPlayerParty` (script_pokemon_util.c:30-45) : pour chaque mon
 *  (< partyCount) : HP→maxHP, PP recalculés avec ppBonuses, statut effacé.
 *  (Rapatrié de specials-registry `_healPlayerParty` — foyer 1:1, 2026-07-02.
 *  Dette systémique documentée : ppMax via CalculatePPWithBonus = fidèle.) */
export function HealPlayerParty(): void {
  const count = CalculatePlayerPartyCount();
  for (let i = 0; i < count; i++) {
    const mon = gPlayerParty[i];
    const maxHP = GetMonData(mon, MON_DATA_MAX_HP) as number;
    SetMonData(mon, MON_DATA_HP, maxHP);
    const ppBonuses = GetMonData(mon, MON_DATA_PP_BONUSES) as number;
    for (let j = 0; j < MAX_MON_MOVES; j++) {
      const pp = CalculatePPWithBonus(GetMonData(mon, MON_DATA_MOVE1 + j) as number, ppBonuses, j);
      SetMonData(mon, MON_DATA_PP1 + j, pp);
    }
    SetMonData(mon, MON_DATA_STATUS, 0);
  }
}

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
 *  Désormais 1:1 STRICT : `CreateMon` numérique (struct plat) + `SetMonData(HELD_ITEM)`
 *  séparé, exactement comme la décomp. species/item = string → u16 via resolveDecompConstant.
 *  Le n° Pokédex est dérivé de `mon.species` (numérique). Inclut l'enregistrement Pokédex
 *  SEEN+CAUGHT (que l'ancien opcode inline oubliait → Pokémon offert jamais inscrit). */
export function ScriptGiveMon(speciesEnum: string, level: number, heldItem?: string): number {
  // 1:1 décomp : CreateMon(&mon, species, level, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0).
  const mon = createEmptyPokemon();
  CreateMon(mon, (resolveDecompConstant(speciesEnum) as number | undefined) ?? 0, level,
    32 /* USE_RANDOM_IVS = MAX_PER_STAT_IVS + 1 */, false, 0, OT_ID_PLAYER_ID, 0);
  // 1:1 décomp : SetMonData(&mon, MON_DATA_HELD_ITEM, &item).
  if (heldItem)
    SetMonData(mon, MON_DATA_HELD_ITEM, (resolveDecompConstant(heldItem) as number | undefined) ?? 0);
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

/** 1:1 décomp `ScriptGiveEgg(species)` (script_pokemon_util.c:87-97) :
 *  ```c
 *  struct Pokemon mon; u8 isEgg;
 *  CreateEgg(&mon, species, TRUE);
 *  isEgg = TRUE;
 *  SetMonData(&mon, MON_DATA_IS_EGG, &isEgg);  // redondant : CreateEgg l'a déjà posé
 *  return GiveMonToPlayer(&mon);
 *  ```
 *  Donne un œuf (lvl 5, isEgg, compteur d'éclosion = eggCycles de l'espèce) à la
 *  party — utilisé par l'opcode `giveegg` (œuf de la pension, œuf Mystère, œuf
 *  Wynaut de Lavandia…). Renvoie sentToPc (0=PARTY, 1=PC, 2=CANT_GIVE). */
export function ScriptGiveEgg(speciesEnum: string): number {
  const mon = CreateEgg(speciesEnum, true);
  // 1:1 décomp : re-set IS_EGG (redondant — CreateEgg l'a déjà fait).
  SetMonData(mon, MON_DATA_IS_EGG, 1);
  return GiveMonToPlayer(mon);
}

/** 1:1 décomp `ScriptSetMonMoveSlot(u8 monIndex, u16 move, u8 slot)`
 *  (script_pokemon_util.c:151-162) :
 *  ```c
 *  if (monIndex > PARTY_SIZE)            // ROM expédiée (non-BUGFIX)
 *      monIndex = gPlayerPartyCount - 1;
 *  SetMonMoveSlot(&gPlayerParty[monIndex], move, slot);
 *  ```
 *  Le clamp out-of-bounds n'arrive jamais en vanilla (les scripts passent un
 *  monIndex 0-5). Utilisé par l'opcode `setmonmove`. */
export function ScriptSetMonMoveSlot(monIndex: number, move: number, slot: number): void {
  if (monIndex > PARTY_SIZE) {
    monIndex = CalculatePlayerPartyCount() - 1;
  }
  SetMonMoveSlot(gPlayerParty[monIndex], move, slot);
}
