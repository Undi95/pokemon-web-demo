/**
 * probe-species-runtime-1to1.mjs — ORACLE RUNTIME de la couche de résolution species.
 *
 * Les helpers `species-runtime.ts` résolvent les champs de gSpeciesInfo depuis la string
 * JSON vers les valeurs numériques que le combat consomme. Le bug du genre (commit
 * 57402d75) y était (parse improvisé de PERCENT_FEMALE). Cet oracle audite les AUTRES
 * résolveurs sur les 386 espèces (vs species-info.json) :
 *   - getSpeciesTypes  : noms TYPE_* → numéros (lookup `_typeNameToNumber ?? 0` = même
 *                        risque de fallback silencieux que le genre)
 *   - getSpeciesExpYield / getSpeciesEvYield : lectures directes (risque faible, confirmées)
 * (genderRatio = probe-gender-shiny ; growthRate = probe-experience-runtime.)
 *
 * LANCER (live) : o.runSpeciesRuntimeOracle({
 *   sr: await import('/src/engine/battle/data/species-runtime.ts'),
 *   dc: await import('/harness/runtime/decomp-constants.ts'),
 *   info: await (await fetch('/decomp/em/species-info.json')).json() })
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 386 types + expYield + evYield 1:1, 0 écart.
 */
'use strict';

export function runSpeciesRuntimeOracle({ sr, dc, info }) {
  let checked = 0; const fails = [];
  for (const sp of Object.keys(info)) {
    const it = info[sp]; if (!it || !it.types) continue;
    const num = dc.resolveDecompConstant(sp, 'SPECIES_'); if (num == null) continue;
    checked++;
    // types
    const wt0 = dc.resolveDecompConstant(it.types[0], 'TYPE_');
    const wt1 = dc.resolveDecompConstant(it.types[1], 'TYPE_');
    const [g0, g1] = sr.getSpeciesTypes(num);
    if (g0 !== wt0 || g1 !== wt1) fails.push(`${sp}.types got=[${g0},${g1}] want=[${wt0},${wt1}]`);
    // expYield
    if (sr.getSpeciesExpYield(num) !== it.expYield) fails.push(`${sp}.expYield got=${sr.getSpeciesExpYield(num)} want=${it.expYield}`);
    // evYield (hp/atk/def/spe/spa/spd)
    const ev = sr.getSpeciesEvYield(num);
    const wev = [it.evYield.hp, it.evYield.atk, it.evYield.def, it.evYield.spe, it.evYield.spa, it.evYield.spd];
    for (let i = 0; i < 6; i++) if (ev[i] !== wev[i]) { fails.push(`${sp}.evYield[${i}] got=${ev[i]} want=${wev[i]}`); break; }
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12), verdict: fails.length === 0 ? '✅ résolveurs species (types/expYield/evYield) 386 1:1' : '❌ écarts' };
}
