/**
 * pokedex-flags.ts — port 1:1 décomp du cœur DATA seen/caught du Pokédex.
 *
 * Source de vérité (ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokedex.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/pokedex.h`
 *
 * ⚠️ CHANTIER POKÉDEX — ÉTAPE 1 (cf. POKEDEX-CHANTIER-1TO1-PLAN.md).
 * Module ISOLÉ (imports : save-system + constantes décomp-data uniquement
 * → 0 risque cyclique, pattern list-menu incrément 1). Déterministe,
 * 0 UI / 0 A/B. Le placeholder `pokedex-screen.ts` (100 l) compte des
 * flags string `*_SEEN/_CAUGHT` ad-hoc — CE module porte le VRAI
 * mécanisme 1:1 (bitfield `gSaveBlock2.pokedex.{seen,owned}` +
 * redondance anti-triche `gSaveBlock1.seen1/seen2`). Le câblage
 * gameplay (capture→FLAG_SET_CAUGHT, rencontre→FLAG_SET_SEEN) = ÉTAPE 2.
 *
 * ÉTAPE 3 part 1 (FAITE) : ordres Hoenn (Species/Hoenn/National
 * To-order + GetHoennPokedexCount) ajoutés, débloqués par les tables
 * extraites 1:1 (`pokedex-order-tables` ÉTAPE 2a). Reste ÉTAPE 3 part 2
 * (autre fichier) : `pokedex_entries.h` (PokedexEntry) +
 * `GetPokedexHeightWeight` (data table à extraire).
 */

import { GetSaveBlock1, GetSaveBlock2 } from '../../save';
import {
  ENUM_NATIONAL_0, ENUM_HOENN_1,
  NATIONAL_DEX_COUNT_EXPR, KANTO_DEX_COUNT_EXPR, HOENN_DEX_COUNT_EXPR,
} from '../../../include/constants/pokedex';
import {
  sSpeciesToNationalPokedexNum, sSpeciesToHoennPokedexNum, sHoennToNationalOrder,
} from '../decomp-data/pokedex-order-tables';
import { SPECIES_UNOWN, SPECIES_SPINDA } from '../../../include/constants/species';
import { gPokedexEntries } from '../decomp-data/pokedex-entries-table';
export type { PokedexEntryData } from '../decomp-data/pokedex-entries-table';
export { gPokedexEntries } from '../decomp-data/pokedex-entries-table';

// ─── Constantes 1:1 (résolues depuis décomp-data, AUCUN hardcode) ───────────
// décomp `include/constants/pokedex.h` :
//   #define NATIONAL_DEX_COUNT  NATIONAL_DEX_DEOXYS
//   #define HOENN_DEX_COUNT     HOENN_DEX_DEOXYS
//   #define KANTO_DEX_COUNT     NATIONAL_DEX_MEW
// On résout l'EXPR (= le membre #define) via l'enum auto-extrait → 1:1
// exact, robuste à un changement de valeur décomp (mémoire
// no-hardcoded-decomp-values).
const _NAT = ENUM_NATIONAL_0 as Record<string, number>;
const _HOE = ENUM_HOENN_1 as Record<string, number>;

/** 1:1 décomp `NATIONAL_DEX_COUNT` (= NATIONAL_DEX_DEOXYS = 386). */
export const NATIONAL_DEX_COUNT = _NAT[NATIONAL_DEX_COUNT_EXPR];
/** 1:1 décomp `KANTO_DEX_COUNT` (= NATIONAL_DEX_MEW = 151). */
export const KANTO_DEX_COUNT = _NAT[KANTO_DEX_COUNT_EXPR];
/** 1:1 décomp `HOENN_DEX_COUNT` (= HOENN_DEX_DEOXYS = 202). Exporté pour
 *  ÉTAPE 3 (GetHoennPokedexCount) ; non utilisé ici. */
export const HOENN_DEX_COUNT = _HOE[HOENN_DEX_COUNT_EXPR];

/** 1:1 décomp `enum { FLAG_GET_SEEN, FLAG_GET_CAUGHT, FLAG_SET_SEEN,
 *  FLAG_SET_CAUGHT }` (pokedex.h:13-19). */
export const FLAG_GET_SEEN = 0;
export const FLAG_GET_CAUGHT = 1;
export const FLAG_SET_SEEN = 2;
export const FLAG_SET_CAUGHT = 3;

/** 1:1 décomp `enum { DEX_MODE_HOENN, DEX_MODE_NATIONAL }` (pokedex.h:9-11). */
export const DEX_MODE_HOENN = 0;
export const DEX_MODE_NATIONAL = 1;

/**
 * 1:1 décomp `s8 GetSetPokedexFlag(u16 nationalDexNo, u8 caseID)`
 * (pokedex.c:4207-4263).
 *
 * `nationalDexNo--` AVANT index/bit (off-by-one 1:1). `index =
 * nationalDexNo/8 ; bit = nationalDexNo%8 ; mask = 1<<bit`.
 * GET : lit le bit + cross-check anti-triche (seen ↔ seen1 ↔ seen2 ;
 * owned ↔ seen ↔ seen1 ↔ seen2) — mismatch → clear TOUT + retourne 0
 * (le bug/anti-triche émerge de l'algo identique, NE PAS simplifier).
 * SET_SEEN : pokedex.seen |= mask ET seen1 |= mask ET seen2 |= mask
 * (triple écriture 1:1). SET_CAUGHT : pokedex.owned |= mask SEUL.
 *
 * Backed par les structs save-blocks réelles (save core étapes 1-6
 * DONE) : `GetSaveBlock2().pokedex.{seen,owned}` (number[] bitset
 * NUM_DEX_FLAG_BYTES=52) + `GetSaveBlock1().{seen1,seen2}`.
 */
export function GetSetPokedexFlag(nationalDexNo: number, caseID: number): number {
  let retVal = 0;

  nationalDexNo--;                       // 1:1 :4214
  const index = (nationalDexNo / 8) | 0; // 1:1 :4215 (division entière u16)
  const bit = nationalDexNo % 8;         // 1:1 :4216
  const mask = 1 << bit;                 // 1:1 :4217

  const sb2 = GetSaveBlock2();
  const sb1 = GetSaveBlock1();
  const seen = sb2.pokedex.seen;
  const owned = sb2.pokedex.owned;
  const seen1 = sb1.seen1;
  const seen2 = sb1.seen2;

  switch (caseID) {
    case FLAG_GET_SEEN: // 1:1 :4221-4235
      if (seen[index] & mask) {
        if ((seen[index] & mask) === (seen1[index] & mask)
          && (seen[index] & mask) === (seen2[index] & mask)) {
          retVal = 1;
        } else {
          seen[index] &= ~mask;
          seen1[index] &= ~mask;
          seen2[index] &= ~mask;
          retVal = 0;
        }
      }
      break;
    case FLAG_GET_CAUGHT: // 1:1 :4236-4252
      if (owned[index] & mask) {
        if ((owned[index] & mask) === (seen[index] & mask)
          && (owned[index] & mask) === (seen1[index] & mask)
          && (owned[index] & mask) === (seen2[index] & mask)) {
          retVal = 1;
        } else {
          owned[index] &= ~mask;
          seen[index] &= ~mask;
          seen1[index] &= ~mask;
          seen2[index] &= ~mask;
          retVal = 0;
        }
      }
      break;
    case FLAG_SET_SEEN: // 1:1 :4253-4257
      seen[index] |= mask;
      seen1[index] |= mask;
      seen2[index] |= mask;
      break;
    case FLAG_SET_CAUGHT: // 1:1 :4258-4260
      owned[index] |= mask;
      break;
  }
  return retVal;
}

/**
 * 1:1 décomp `u16 GetNationalPokedexCount(u8 caseID)` (pokedex.c:4265-4285).
 * Boucle 0..NATIONAL_DEX_COUNT-1 ; compte les natDex i+1 dont le flag
 * SEEN/CAUGHT est set (via GetSetPokedexFlag).
 */
export function GetNationalPokedexCount(caseID: number): number {
  let count = 0;
  for (let i = 0; i < NATIONAL_DEX_COUNT; i++) {
    switch (caseID) {
      case FLAG_GET_SEEN:
        if (GetSetPokedexFlag(i + 1, FLAG_GET_SEEN)) count++;
        break;
      case FLAG_GET_CAUGHT:
        if (GetSetPokedexFlag(i + 1, FLAG_GET_CAUGHT)) count++;
        break;
    }
  }
  return count;
}

/**
 * 1:1 décomp `u16 GetKantoPokedexCount(u8 caseID)` (pokedex.c:4309-4329).
 * Identique à National mais borné KANTO_DEX_COUNT (les natDex 1..151
 * = Kanto, ordre national direct).
 */
export function GetKantoPokedexCount(caseID: number): number {
  let count = 0;
  for (let i = 0; i < KANTO_DEX_COUNT; i++) {
    switch (caseID) {
      case FLAG_GET_SEEN:
        if (GetSetPokedexFlag(i + 1, FLAG_GET_SEEN)) count++;
        break;
      case FLAG_GET_CAUGHT:
        if (GetSetPokedexFlag(i + 1, FLAG_GET_CAUGHT)) count++;
        break;
    }
  }
  return count;
}

// ─── ÉTAPE 2b : mapping species↔natDex + HandleSetPokedexFlag 1:1 ───────────
// Consomment `sSpeciesToNationalPokedexNum` (décomp-data/auto, extrait 1:1
// ÉTAPE 2a). `NUM_SPECIES - 1` décomp = `.length` (= LEN 412, taille décomp
// `[NUM_SPECIES-1]`). Câblage des callers gameplay = ÉTAPE 2c.

/**
 * 1:1 décomp `u16 SpeciesToNationalPokedexNum(u16 species)` (pokemon.c:5664).
 */
export function SpeciesToNationalPokedexNum(species: number): number {
  if (!species)
    return 0;
  return sSpeciesToNationalPokedexNum[species - 1];
}

/**
 * 1:1 décomp `u16 NationalPokedexNumToSpecies(u16 nationalNum)`
 * (pokemon.c:5628-5644). Boucle linéaire inverse ; `NUM_SPECIES - 1` =
 * `sSpeciesToNationalPokedexNum.length` (taille décomp `[NUM_SPECIES-1]`).
 */
export function NationalPokedexNumToSpecies(nationalNum: number): number {
  if (!nationalNum)
    return 0;

  let species = 0;
  const len = sSpeciesToNationalPokedexNum.length; // = NUM_SPECIES - 1

  while (species < len && sSpeciesToNationalPokedexNum[species] !== nationalNum)
    species++;

  if (species === len)
    return 0;

  return species + 1;
}

/**
 * 1:1 décomp `void HandleSetPokedexFlag(u16 nationalNum, u8 caseId,
 * u32 personality)` (pokemon.c:6929-6940). Wrapper "set seulement si pas
 * déjà set" + stocke la personality Unown/Spinda (= variation sprite dex).
 * Backed par `GetSaveBlock2().pokedex.{unownPersonality,spindaPersonality}`
 * (save-blocks.ts:128/130). SPECIES_UNOWN/SPINDA via décomp-data 1:1.
 * Appelé par le gameplay (capture→FLAG_SET_CAUGHT, mon vu→FLAG_SET_SEEN,
 * give-mon/trade/evo/egg) — câblage = ÉTAPE 2c.
 */
export function HandleSetPokedexFlag(nationalNum: number, caseId: number, personality: number): void {
  const getFlagCaseId = (caseId === FLAG_SET_SEEN) ? FLAG_GET_SEEN : FLAG_GET_CAUGHT;
  if (!GetSetPokedexFlag(nationalNum, getFlagCaseId)) { // don't set if it's already set
    GetSetPokedexFlag(nationalNum, caseId);
    if (NationalPokedexNumToSpecies(nationalNum) === SPECIES_UNOWN)
      GetSaveBlock2().pokedex.unownPersonality = personality;
    if (NationalPokedexNumToSpecies(nationalNum) === SPECIES_SPINDA)
      GetSaveBlock2().pokedex.spindaPersonality = personality;
  }
}

// ─── ÉTAPE 3 part 1 : ordres Hoenn 1:1 (débloqué par pokedex-order-tables) ──
// `NUM_SPECIES - 1` décomp = `.length` (= LEN 412, taille décomp
// `[NUM_SPECIES-1]`), comme NationalPokedexNumToSpecies (ÉTAPE 2b).

/** 1:1 décomp `u16 SpeciesToHoennPokedexNum(u16 species)` (pokemon.c:5672). */
export function SpeciesToHoennPokedexNum(species: number): number {
  if (!species)
    return 0;
  return sSpeciesToHoennPokedexNum[species - 1];
}

/** 1:1 décomp `u16 HoennToNationalOrder(u16 hoennNum)` (pokemon.c:5680). */
export function HoennToNationalOrder(hoennNum: number): number {
  if (!hoennNum)
    return 0;
  return sHoennToNationalOrder[hoennNum - 1];
}

/**
 * 1:1 décomp `u16 NationalToHoennOrder(u16 nationalNum)` (pokemon.c:5646-5662).
 * Boucle linéaire inverse sur `sHoennToNationalOrder` ; `NUM_SPECIES - 1` =
 * `.length`.
 */
export function NationalToHoennOrder(nationalNum: number): number {
  if (!nationalNum)
    return 0;

  let hoennNum = 0;
  const len = sHoennToNationalOrder.length; // = NUM_SPECIES - 1

  while (hoennNum < len && sHoennToNationalOrder[hoennNum] !== nationalNum)
    hoennNum++;

  if (hoennNum === len)
    return 0;

  return hoennNum + 1;
}

/**
 * 1:1 décomp `u16 GetHoennPokedexCount(u8 caseID)` (pokedex.c:4287-4307).
 * Boucle 0..HOENN_DEX_COUNT-1 ; compte les HoennToNationalOrder(i+1) dont
 * le flag SEEN/CAUGHT est set (via GetSetPokedexFlag).
 */
export function GetHoennPokedexCount(caseID: number): number {
  let count = 0;
  for (let i = 0; i < HOENN_DEX_COUNT; i++) {
    switch (caseID) {
      case FLAG_GET_SEEN:
        if (GetSetPokedexFlag(HoennToNationalOrder(i + 1), FLAG_GET_SEEN)) count++;
        break;
      case FLAG_GET_CAUGHT:
        if (GetSetPokedexFlag(HoennToNationalOrder(i + 1), FLAG_GET_CAUGHT)) count++;
        break;
    }
  }
  return count;
}

// ─── ÉTAPE 3 part 2 : GetPokedexHeightWeight 1:1 ────────────────────────────
// Consomme `gPokedexEntries` (natDex-indexé, extrait 1:1 par
// scripts/extract-pokedex-entries-table.mjs). `data` 0=height (décimètres)
// 1=weight (hectogrammes) ; default → 1 (1:1 décomp).

/** 1:1 décomp `u16 GetPokedexHeightWeight(u16 dexNum, u8 data)`
 *  (pokedex.c:4194-4205). */
export function GetPokedexHeightWeight(dexNum: number, data: number): number {
  switch (data) {
    case 0: // height
      return gPokedexEntries[dexNum].height;
    case 1: // weight
      return gPokedexEntries[dexNum].weight;
    default:
      return 1;
  }
}
