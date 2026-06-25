/**
 * probe-damage-statstages-1to1.mjs — ORACLE RUNTIME des PALIERS DE STATS en dégâts.
 *
 * Complète probe-damage-1to1 (testait stage 6 neutre) : vérifie APPLY_STAT_MOD
 * (gStatStageRatios) appliqué à attack/defense (physique) et spAttack/spDefense
 * (spécial) dans CalculateBaseDamage. FORMULE → oracle runtime, réf décomp recodée main.
 *
 * Réf 1:1 : gStatStageRatios[13][2] (pokemon.c:1869) — -6 {10,40} … 0 {10,10} … +6 {40,10} ;
 * APPLY_STAT_MOD(var,mon,stat,idx) : var = stat * ratio[stage][0] / ratio[stage][1] (÷ entière).
 * statStages indexé STAT_ATK=1/STAT_DEF=2/STAT_SPATK=4/STAT_SPDEF=5 (constants.ts = décomp).
 *
 * NB gCritMultiplier : hors combat = 1 (non-crit) → APPLY_STAT_MOD appliqué inconditionnellement.
 * Le fait que TOUS les paliers (drops attaquant + boosts défenseur inclus) matchent la réf
 * « apply-always » PROUVE crit=1 (en crit=2 ces cas seraient ignorés et divergeraient).
 *
 * LANCER (live) : o.runStatStageOracle({ pk: await import('/src/pokemon.ts'),
 *                                        dc: await import('/harness/runtime/decomp-constants.ts') })
 * RÉSULTAT VÉRIFIÉ (2026-06-25, finale) : 120/120 (2 branches phys/spé × 2 réglages L/P
 * × (13 paliers off + 13 def + 4 croisés)). Contrôle négatif validé (ratio ×2 réel : 119 vs 148).
 */
'use strict';

const T = Math.trunc;
// gStatStageRatios[13][2] (pokemon.c:1869), index 0=-6 … 6=0 … 12=+6
export const RATIOS = [[10, 40], [10, 35], [10, 30], [10, 25], [10, 20], [10, 15], [10, 10], [15, 10], [20, 10], [25, 10], [30, 10], [35, 10], [40, 10]];
export const applyRatio = (stat, stage) => T(stat * RATIOS[stage][0] / RATIOS[stage][1]);

// Référence cœur neutre + paliers (offStage = atk/spa attaquant, defStage = def/spd défenseur)
export const refStage = (L, P, off, def, offStage, defStage, special) => {
  let d = applyRatio(off, offStage);
  d = d * P; d = d * (T(2 * L / 5) + 2);
  const dh = applyRatio(def, defStage);
  d = T(d / dh); d = T(d / 50);
  if (!special) { if (d === 0) d = 1; }
  return d + 2;
};

// statStages : [HP, ATK, DEF, SPEED, SPATK, SPDEF, ACC, EVA]
const mkMon = (off, def, L, offStage, defStage, special) => ({
  attack: special ? 1 : off, defense: special ? 1 : def, spAttack: special ? off : 1, spDefense: special ? def : 1,
  ability: 0, item: 0, species: 1, status1: 0,
  statStages: special ? [6, 6, 6, 6, offStage, defStage, 6, 6] : [6, offStage, defStage, 6, 6, 6, 6, 6],
  level: L, hp: 100, maxHP: 100,
});

export function runStatStageOracle({ pk, dc }) {
  const MOVE_TACKLE = dc.resolveDecompConstant('MOVE_TACKLE', 'MOVE_'), TYPE_PSYCHIC = 14;
  const settings = [{ L: 50, P: 80, A: 200, D: 120 }, { L: 100, P: 120, A: 300, D: 200 }];
  const branches = [{ special: false, type: 0 }, { special: true, type: TYPE_PSYCHIC }];
  let checked = 0; const mism = [];
  for (const br of branches) for (const s of settings) {
    const run = (offStage, defStage) => {
      // l'attaquant porte offStage à l'index off, le défenseur defStage à l'index def
      const att = mkMon(s.A, s.D, s.L, offStage, 6, br.special);
      const def = mkMon(s.A, s.D, s.L, 6, defStage, br.special);
      const got = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, s.P, br.type, 1, 3).damage;
      const exp = refStage(s.L, s.P, s.A, s.D, offStage, defStage, br.special);
      checked++;
      if (got !== exp && mism.length < 25) mism.push(`${br.special ? 'SPE' : 'PHY'} L${s.L} off${offStage - 6} def${defStage - 6}: got=${got} exp=${exp}`);
    };
    for (let st = 0; st <= 12; st++) run(st, 6);          // palier offensif (attaquant)
    for (let st = 0; st <= 12; st++) run(6, st);          // palier défensif (défenseur)
    run(8, 8); run(4, 4); run(12, 0); run(0, 12);         // croisés
  }
  return { checked, mismatches: mism.length, sample: mism.slice(0, 25), verdict: mism.length === 0 ? '✅ paliers de stats (dégâts) 1:1' : '❌ écarts' };
}
