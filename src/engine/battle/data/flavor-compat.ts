/**
 * battle/data/flavor-compat.ts — 1:1 décomp `gPokeblockFlavorCompatibilityTable`
 * (pokeblock.c:136-164) + helpers.
 *
 * Used par CONFUSE_FOOD_BERRIES (Figy/Wiki/Mago/Aguav/Iapapa Berries) :
 * la berry heal toujours mais cause confusion si nature dislike le flavor.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokeblock.c:136-164`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokemon.c:6555` GetFlavorRelationByPersonality
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokemon.c:GetNatureFromPersonality`
 */

// 1:1 décomp `GetNatureFromPersonality` → miroir `src/game/pokemon.ts` (source unique).
import { GetNatureFromPersonality } from '../../../../include/pokemon';

const FLAVOR_COUNT = 5;

/** 1:1 décomp `gPokeblockFlavorCompatibilityTable[NUM_NATURES * FLAVOR_COUNT]`.
 *  Indexé par nature × 5 + flavor. Valeur s8 : -1 (dislike), 0 (neutral), +1 (like). */
const gPokeblockFlavorCompatibilityTable: number[] = [
  // Spicy, Dry, Sweet, Bitter, Sour
   0,  0,  0,  0,  0, // 0 Hardy
   1,  0,  0,  0, -1, // 1 Lonely
   1,  0, -1,  0,  0, // 2 Brave
   1, -1,  0,  0,  0, // 3 Adamant
   1,  0,  0, -1,  0, // 4 Naughty
  -1,  0,  0,  0,  1, // 5 Bold
   0,  0,  0,  0,  0, // 6 Docile
   0,  0, -1,  0,  1, // 7 Relaxed
   0, -1,  0,  0,  1, // 8 Impish
   0,  0,  0, -1,  1, // 9 Lax
  -1,  0,  1,  0,  0, // 10 Timid
   0,  0,  1,  0, -1, // 11 Hasty
   0,  0,  0,  0,  0, // 12 Serious
   0, -1,  1,  0,  0, // 13 Jolly
   0,  0,  1, -1,  0, // 14 Naive
  -1,  1,  0,  0,  0, // 15 Modest
   0,  1,  0,  0, -1, // 16 Mild
   0,  1, -1,  0,  0, // 17 Quiet
   0,  0,  0,  0,  0, // 18 Bashful
   0,  1,  0, -1,  0, // 19 Rash
  -1,  0,  0,  1,  0, // 20 Calm
   0,  0,  0,  1, -1, // 21 Gentle
   0,  0, -1,  1,  0, // 22 Sassy
   0, -1,  0,  1,  0, // 23 Careful
   0,  0,  0,  0,  0, // 24 Quirky
];

// `GetNatureFromPersonality` re-exporté du miroir (cf. import en tête ; usage interne
// par GetFlavorRelationByPersonality ci-dessous).
export { GetNatureFromPersonality };

/** 1:1 décomp `GetFlavorRelationByPersonality(personality, flavor)`
 *  (pokemon.c:6555). Returns -1 (dislike) / 0 (neutral) / +1 (like).
 *  Used par CONFUSE_FOOD_BERRIES decision tree. */
export function GetFlavorRelationByPersonality(personality: number, flavor: number): number {
  const nature = GetNatureFromPersonality(personality);
  if (flavor < 0 || flavor >= FLAVOR_COUNT) return 0;
  return gPokeblockFlavorCompatibilityTable[nature * FLAVOR_COUNT + flavor] ?? 0;
}
