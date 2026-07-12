/**
 * src/data/pokemon/species_info.ts — accesseurs 1:1 de `gSpeciesInfo[speciesId]`
 * (miroir-adaptateur de `src/data/pokemon/species_info.h`, inclus par pokemon.c).
 *
 * ADAPTATION ASSUMÉE du data layer : gSpeciesInfo vit dans game-data.ts keyed par
 * string ('SPECIES_X') alors que l'engine manipule des numbers (0..NUM_SPECIES) —
 * ce module fait le pont (speciesNumberToEnum, mapping reverse bâti lazy depuis
 * include/constants/species) puis résout les champs du struct
 * (growthRate/expYield/types/evYield/genderRatio) en numérique décomp.
 */

import { getSpeciesInfo } from '../../engine/data/game-data';
import * as SpeciesConsts from '../../../include/constants/species';
import { GROWTH_MEDIUM_FAST } from './experience_tables';

/** 1:1 décomp constants/pokemon_types.h — TYPE_* enum. */
const _typeNameToNumber: Record<string, number> = {
  TYPE_NORMAL: 0, TYPE_FIGHTING: 1, TYPE_FLYING: 2, TYPE_POISON: 3,
  TYPE_GROUND: 4, TYPE_ROCK: 5, TYPE_BUG: 6, TYPE_GHOST: 7, TYPE_STEEL: 8,
  TYPE_MYSTERY: 9, TYPE_FIRE: 10, TYPE_WATER: 11, TYPE_GRASS: 12,
  TYPE_ELECTRIC: 13, TYPE_PSYCHIC: 14, TYPE_ICE: 15, TYPE_DRAGON: 16,
  TYPE_DARK: 17,
};

let _numberToEnum: Record<number, string> = {};
let _built = false;

function _buildMapping(): void {
  if (_built) return;
  for (const [key, value] of Object.entries(SpeciesConsts)) {
    if (typeof value === 'number' && key.startsWith('SPECIES_')) {
      _numberToEnum[value] = key;
    }
  }
  _built = true;
}

/** Resolve species number → enum string ('SPECIES_TREECKO'). */
export function speciesNumberToEnum(species: number): string {
  _buildMapping();
  return _numberToEnum[species] ?? 'SPECIES_NONE';
}

/** 1:1 décomp `gSpeciesInfo[species].growthRate`. Mapping string → number. */
export function getSpeciesGrowthRate(species: number): number {
  const enumName = speciesNumberToEnum(species);
  const info = getSpeciesInfo(enumName);
  if (!info) return GROWTH_MEDIUM_FAST;
  switch (info.growthRate) {
    case 'GROWTH_MEDIUM_FAST': return 0;
    case 'GROWTH_ERRATIC':     return 1;
    case 'GROWTH_FLUCTUATING': return 2;
    case 'GROWTH_MEDIUM_SLOW': return 3;
    case 'GROWTH_FAST':        return 4;
    case 'GROWTH_SLOW':        return 5;
    default: return GROWTH_MEDIUM_FAST;
  }
}

/** 1:1 décomp `gSpeciesInfo[species].expYield`. */
export function getSpeciesExpYield(species: number): number {
  const enumName = speciesNumberToEnum(species);
  const info = getSpeciesInfo(enumName);
  return info?.expYield ?? 0;
}

/** 1:1 décomp `gSpeciesInfo[species].types[0/1]`. Lookup type names → numbers. */
export function getSpeciesTypes(species: number): [number, number] {
  const enumName = speciesNumberToEnum(species);
  const info = getSpeciesInfo(enumName);
  if (!info) return [0, 0];
  return [
    _typeNameToNumber[info.types[0]] ?? 0,
    _typeNameToNumber[info.types[1]] ?? 0,
  ];
}

/** 1:1 décomp `gSpeciesInfo[species].evYield`. Returns 6 EVs (HP/ATK/DEF/SPE/SPATK/SPDEF). */
export function getSpeciesEvYield(species: number): readonly [number, number, number, number, number, number] {
  const enumName = speciesNumberToEnum(species);
  const info = getSpeciesInfo(enumName);
  if (!info) return [0, 0, 0, 0, 0, 0];
  // SpeciesStats : hp/atk/def/spe/spa/spd
  return [
    info.evYield.hp ?? 0,
    info.evYield.atk ?? 0,
    info.evYield.def ?? 0,
    info.evYield.spe ?? 0,
    info.evYield.spa ?? 0,
    info.evYield.spd ?? 0,
  ];
}

/** 1:1 décomp `gSpeciesInfo[species].genderRatio` (constants/pokemon.h).
 *  Resolve la string ratio depuis game-data en numerical (0..254, ou 0xFF/0xFE/0x00 sentinel).
 *  - MON_MALE = 0x00, MON_FEMALE = 0xFE, MON_GENDERLESS = 0xFF
 *  - PERCENT_FEMALE(N) = (N * 255) / 100. */
export function getSpeciesGenderRatio(species: number): number {
  const enumName = speciesNumberToEnum(species);
  const info = getSpeciesInfo(enumName);
  if (!info) return 0x00 /* MON_MALE */;
  const raw = info.genderRatio;
  // SPECIES_NONE (index 0) : le décomp `gSpeciesInfo[SPECIES_NONE]` est un struct zéro
  // COMPLET → `.genderRatio = 0 = MON_MALE`. Notre record SPECIES_NONE est un stub partiel
  // (pas de champ `genderRatio`) : un slot battler VIDE (espèce 0) atteignait ce getter
  // avec raw=undefined et crashait sur `.match` (UpdateHealthboxAttribute → BattleInit).
  // On rend MON_MALE comme le zéro-struct décomp plutôt que de planter. 1:1 comportement.
  if (typeof raw !== 'string') return 0x00 /* MON_MALE (gSpeciesInfo[SPECIES_NONE].genderRatio = 0) */;
  // String sentinel cases.
  if (raw === 'MON_MALE') return 0x00;
  if (raw === 'MON_FEMALE') return 0xFE;
  if (raw === 'MON_GENDERLESS') return 0xFF;
  // PERCENT_FEMALE(N) → 1:1 décomp `min(254, (percent * 255) / 100)`. percent peut être
  // DÉCIMAL (PERCENT_FEMALE(12.5) = ratio 7♂:1♀ des starters & co) → accepter `\d+(\.\d+)?`
  // + parseFloat (l'ancien `\d+`/parseInt échouait sur 12.5 → fallback MÂLE = 46 espèces
  // 100% mâles à tort).
  const pctMatch = raw.match(/^PERCENT_FEMALE\((\d+(?:\.\d+)?)\)$/);
  if (pctMatch) {
    const n = parseFloat(pctMatch[1]);
    return Math.min(254, Math.floor((n * 255) / 100));
  }
  return 0x00;  // fallback safe
}

// GetGenderFromSpeciesAndPersonality : vit au foyer pokemon.ts (surface header
// include/pokemon) — l'ex re-export d'ici est DISSOUS (lot 30), les consommateurs
// importent '../include/pokemon' directement.
