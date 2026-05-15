/**
 * battle/data/species-runtime.ts — Helpers pour résoudre runtime species
 * number → expYield / growthRate (= 1:1 décomp `gSpeciesInfo[speciesId]`).
 *
 * Pont entre :
 *  - Notre engine utilise species comme number (= 0..NUM_SPECIES).
 *  - Notre data layer game-data.ts utilise species comme string ('SPECIES_X').
 *
 * On build un mapping reverse number → enum string au boot via les constants
 * auto-extracted, puis on look up gSpeciesInfo via game-data.
 */

import { getSpeciesInfo } from '../../data/game-data';
import * as SpeciesConsts from '../../decomp-data/auto/include/constants/species-data';
import { GROWTH_MEDIUM_FAST } from './experience-tables';

// MON_* gender sentinels (constants/pokemon.h:171-173)
const MON_MALE_LOCAL       = 0x00;
const MON_FEMALE_LOCAL     = 0xFE;
const MON_GENDERLESS_LOCAL = 0xFF;

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
  // String sentinel cases.
  if (raw === 'MON_MALE') return 0x00;
  if (raw === 'MON_FEMALE') return 0xFE;
  if (raw === 'MON_GENDERLESS') return 0xFF;
  // PERCENT_FEMALE(N) → calculer.
  const pctMatch = raw.match(/^PERCENT_FEMALE\((\d+)\)$/);
  if (pctMatch) {
    const n = parseInt(pctMatch[1], 10);
    return Math.floor((n * 255) / 100);
  }
  return 0x00;  // fallback safe
}

/** 1:1 décomp `GetGenderFromSpeciesAndPersonality(species, personality)`
 *  (pokemon.c:3472-3486).
 *
 *  - genderRatio == MON_MALE/FEMALE/GENDERLESS → return that sentinel direct
 *  - sinon : ratio > (personality & 0xFF) ? MON_FEMALE : MON_MALE
 */
export function GetGenderFromSpeciesAndPersonality(species: number, personality: number): number {
  const ratio = getSpeciesGenderRatio(species);
  if (ratio === MON_MALE_LOCAL || ratio === MON_FEMALE_LOCAL || ratio === MON_GENDERLESS_LOCAL) {
    return ratio;
  }
  // PERCENT_FEMALE numerical : compare avec personality lo byte.
  if (ratio > (personality & 0xFF)) return MON_FEMALE_LOCAL;
  return MON_MALE_LOCAL;
}
