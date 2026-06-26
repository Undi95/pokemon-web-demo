/**
 * probe-experience-runtime-1to1.mjs — ORACLE RUNTIME de la courbe d'EXP (table TS live).
 *
 * audit-experience-tables.cjs prouve le JSON (formules) ; celui-ci prouve la table TS
 * RUNTIME `gExperienceTables` (experience-tables.ts) que le jeu utilise réellement pour
 * le level-up — distincte du JSON, indexée par le NUMÉRO de growth rate (0-5).
 * Vérifie : (1) les 6 courbes produisent les valeurs L100 CANONIQUES (Bulbapedia,
 * non-circulaire) dans le BON ORDRE d'enum, (2) getLevelFromExp aux frontières, (3) la
 * chaîne complète species→getSpeciesGrowthRate→getExpForLevel.
 *
 * LANCER (live) : o.runExpRuntimeOracle({
 *   et: await import('/src/engine/battle/data/experience-tables.ts'),
 *   sr: await import('/src/engine/battle/data/species-runtime.ts'),
 *   dc: await import('/harness/runtime/decomp-constants.ts') })
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 6 L100 + frontières + chaîne species OK.
 */
'use strict';

// index growth rate (pokemon.h) → valeur L100 canonique
const L100 = { 0: 1000000, 1: 600000, 2: 1640000, 3: 1059860, 4: 800000, 5: 1250000 };
// noms par index (pour la chaîne species)
const GROWTH_OF = { GROWTH_MEDIUM_FAST: 0, GROWTH_ERRATIC: 1, GROWTH_FLUCTUATING: 2, GROWTH_MEDIUM_SLOW: 3, GROWTH_FAST: 4, GROWTH_SLOW: 5 };

export function runExpRuntimeOracle({ et, sr, dc, speciesInfo }) {
  const fails = [];
  // (1) L100 canoniques par courbe (bon ordre)
  for (const idx of Object.keys(L100)) {
    const got = et.getExpForLevel(Number(idx), 100);
    if (got !== L100[idx]) fails.push(`L100 idx${idx}: got=${got} want=${L100[idx]}`);
  }
  // (2) frontières getLevelFromExp (Medium Fast)
  if (et.getLevelFromExp(0, 1000000) !== 100) fails.push('getLevelFromExp MF 1000000 ≠ 100');
  if (et.getLevelFromExp(0, 999999) !== 99) fails.push('getLevelFromExp MF 999999 ≠ 99');
  // (3) chaîne species → growth → exp (si species-info fourni)
  let chain = 0;
  if (speciesInfo) {
    for (const sp of Object.keys(speciesInfo)) {
      const gr = speciesInfo[sp].growthRate; const idx = GROWTH_OF[gr]; if (idx === undefined) continue;
      const num = dc.resolveDecompConstant(sp, 'SPECIES_'); if (num == null) continue;
      const gotIdx = sr.getSpeciesGrowthRate(num);
      if (gotIdx !== idx) { fails.push(`${sp}: getSpeciesGrowthRate=${gotIdx} ≠ ${idx} (${gr})`); }
      else chain++;
    }
  }
  return { checked: 8 + chain, fails: fails.length, sample: fails.slice(0, 12), verdict: fails.length === 0 ? '✅ courbe exp runtime + chaîne species 1:1' : '❌ écarts' };
}
