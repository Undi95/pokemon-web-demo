/**
 * pokemon.ts — miroir 1:1 de `decomp/src/pokemon.c` (+ include/pokemon.h).
 *
 * ⚠️ PORT INCRÉMENTAL : pokemon.c est ÉNORME (~6600 lignes). On le construit par
 * couches. CETTE PASSE (2026-06-05) = les helpers PURS (valeur→valeur, sans état
 * `struct Pokemon` mutable), portés AVANT la migration du stockage
 * (PokemonInstance→BoxMon, qui se fera AVEC l'A/B user). Les fns qui touchent
 * `struct Pokemon`/`gPlayerParty` (GetMonData/SetMonData/CalculateMonStats/GetNature/
 * GetGenderFromSpeciesAndPersonality…) restent dans `engine/battle/party-storage` /
 * `engine/battle/data/species-runtime` en attendant (elles délèguent ici pour la
 * logique pure ; cf. ledger).
 *
 * Constantes data (NUM_NATURES, STAT_*) = réutilisées depuis `decomp-data` (extraction
 * vérifiée) tant que `data.c` / `constants/pokemon.h` ne sont pas portés en miroir.
 */
import { NUM_NATURES, STAT_HP, MON_MALE, MON_FEMALE, MON_GENDERLESS, SHINY_ODDS } from '../engine/decomp-data/include/constants/pokemon-data';
// `gSpeciesInfo[species].genderRatio` via le pont data number→info (en attendant le
// port de `data.c`/species_info.h ; dans le décomp gSpeciesInfo est inclus DANS pokemon.c).
import { getSpeciesGenderRatio } from '../engine/battle/data/species-runtime';
// Macro `GET_SHINY_VALUE` du header miroir (cycle impl↔header fonction-seulement = bénin).
import { GET_SHINY_VALUE } from './include/pokemon';

/** 1:1 décomp `#define NUM_NATURE_STATS (NUM_STATS - 1)` (constants/pokemon.h) = 5
 *  (ATK, DEF, SPEED, SPATK, SPDEF ; HP exclu). decomp-data ne le résout pas
 *  (garde `NUM_NATURE_STATS_EXPR`) → transcrit ici. */
export const NUM_NATURE_STATS = 5;

/** 1:1 décomp `const s8 gNatureStatTable[NUM_NATURES][NUM_NATURE_STATS]`
 *  (pokemon.c:1366-1393). Colonnes = Attack, Defense, Speed, Sp.Atk, Sp.Def.
 *  +1 = +10 %, -1 = -10 %, 0 = neutre. TRANSCRIT du décomp (jamais recalculé). */
export const gNatureStatTable: ReadonlyArray<ReadonlyArray<number>> = [
  //  Atk  Def  Spe  SpA  SpD
  [    0,   0,   0,   0,   0 ],  // NATURE_HARDY
  [   +1,  -1,   0,   0,   0 ],  // NATURE_LONELY
  [   +1,   0,  -1,   0,   0 ],  // NATURE_BRAVE
  [   +1,   0,   0,  -1,   0 ],  // NATURE_ADAMANT
  [   +1,   0,   0,   0,  -1 ],  // NATURE_NAUGHTY
  [   -1,  +1,   0,   0,   0 ],  // NATURE_BOLD
  [    0,   0,   0,   0,   0 ],  // NATURE_DOCILE
  [    0,  +1,  -1,   0,   0 ],  // NATURE_RELAXED
  [    0,  +1,   0,  -1,   0 ],  // NATURE_IMPISH
  [    0,  +1,   0,   0,  -1 ],  // NATURE_LAX
  [   -1,   0,  +1,   0,   0 ],  // NATURE_TIMID
  [    0,  -1,  +1,   0,   0 ],  // NATURE_HASTY
  [    0,   0,   0,   0,   0 ],  // NATURE_SERIOUS
  [    0,   0,  +1,  -1,   0 ],  // NATURE_JOLLY
  [    0,   0,  +1,   0,  -1 ],  // NATURE_NAIVE
  [   -1,   0,   0,  +1,   0 ],  // NATURE_MODEST
  [    0,  -1,   0,  +1,   0 ],  // NATURE_MILD
  [    0,   0,  -1,  +1,   0 ],  // NATURE_QUIET
  [    0,   0,   0,   0,   0 ],  // NATURE_BASHFUL
  [    0,   0,   0,  +1,  -1 ],  // NATURE_RASH
  [   -1,   0,   0,   0,  +1 ],  // NATURE_CALM
  [    0,  -1,   0,   0,  +1 ],  // NATURE_GENTLE
  [    0,   0,  -1,   0,  +1 ],  // NATURE_SASSY
  [    0,   0,   0,  -1,  +1 ],  // NATURE_CAREFUL
  [    0,   0,   0,   0,   0 ],  // NATURE_QUIRKY
];

/** 1:1 décomp `const u8 gStatStageRatios[MAX_STAT_STAGE + 1][2]` (pokemon.c:1869-1884).
 *  Indexé par statStage (0 = -6 … 12 = +6) ; `[numérateur, dénominateur]` → `stat × N / D`.
 *  TRANSCRIT du décomp. */
export const gStatStageRatios: ReadonlyArray<readonly [number, number]> = [
  [10, 40], // -6 (MIN_STAT_STAGE)
  [10, 35], // -5
  [10, 30], // -4
  [10, 25], // -3
  [10, 20], // -2
  [10, 15], // -1
  [10, 10], //  0 (DEFAULT_STAT_STAGE)
  [15, 10], // +1
  [20, 10], // +2
  [25, 10], // +3
  [30, 10], // +4
  [35, 10], // +5
  [40, 10], // +6 (MAX_STAT_STAGE)
];

/** 1:1 décomp `u8 GetNatureFromPersonality(u32 personality)` (pokemon.c:5485). */
export function GetNatureFromPersonality(personality: number): number {
  return (personality >>> 0) % NUM_NATURES;
}

/** 1:1 décomp `u16 ModifyStatByNature(u8 nature, u16 stat, u8 statIndex)`
 *  (pokemon.c:5865-5899). statIndex est 1-based (STAT_ATK=1 … STAT_SPDEF=5) ; HP
 *  (0), Accuracy, Evasion ne sont pas modifiés. */
export function ModifyStatByNature(nature: number, stat: number, statIndex: number): number {
  if (statIndex <= STAT_HP || statIndex > NUM_NATURE_STATS)
    return stat;

  let retVal: number;
  // 1:1 décomp VANILLA (sans BUGFIX) : `retVal` est u16 → `stat * N` est tronqué à
  // 16 bits AVANT la division /100. (BUGFIX utiliserait u32 ; sans effet pour
  // stat ≤ 595, jamais atteint en jeu de base — cf. commentaire pokemon.c:5867-5872.)
  switch (gNatureStatTable[nature][statIndex - 1]) {
    case 1:
      retVal = (stat * 110) & 0xFFFF;
      retVal = Math.trunc(retVal / 100);
      break;
    case -1:
      retVal = (stat * 90) & 0xFFFF;
      retVal = Math.trunc(retVal / 100);
      break;
    default:
      retVal = stat;
      break;
  }
  return retVal & 0xFFFF;
}

/** 1:1 décomp `u8 GetGenderFromSpeciesAndPersonality(u16 species, u32 personality)`
 *  (pokemon.c:3472-3486). `gSpeciesInfo[species].genderRatio` :
 *   - sentinelle MON_MALE/FEMALE/GENDERLESS → retournée telle quelle ;
 *   - sinon (= PERCENT_FEMALE) : ratio > (personality & 0xFF) ? FEMALE : MALE. */
export function GetGenderFromSpeciesAndPersonality(species: number, personality: number): number {
  const genderRatio = getSpeciesGenderRatio(species);
  switch (genderRatio) {
    case MON_MALE:
    case MON_FEMALE:
    case MON_GENDERLESS:
      return genderRatio;
  }

  if (genderRatio > (personality & 0xFF))
    return MON_FEMALE;
  else
    return MON_MALE;
}

/** 1:1 décomp `bool8 IsShinyOtIdPersonality(u32 otId, u32 personality)` (pokemon.c:6708) :
 *  shiny si `GET_SHINY_VALUE(otId, personality) < SHINY_ODDS` (= 8). */
export function IsShinyOtIdPersonality(otId: number, personality: number): boolean {
  const shinyValue = GET_SHINY_VALUE(otId, personality);
  return shinyValue < SHINY_ODDS;
}
