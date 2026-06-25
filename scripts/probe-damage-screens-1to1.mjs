/**
 * probe-damage-screens-1to1.mjs — ORACLE RUNTIME des ÉCRANS (Reflet / Mur Lumière) en dégâts.
 *
 * Complète la suite dégâts : Reflet (SIDE_STATUS_REFLECT, physique ÷2) et Mur Lumière
 * (SIDE_STATUS_LIGHTSCREEN, spécial ÷2) dans CalculateBaseDamage (pokemon.c:3260/3318).
 * Contrôlés par le PARAMÈTRE `sideStatus` (pas un global) → testables proprement.
 * En simple combat + gCritMultiplier=1 (confirmé) → ÷2 simple.
 *
 * Vérifie aussi la SPÉCIFICITÉ DE BIT : Reflet (bit 0) n'affecte que le physique,
 * Mur Lumière (bit 1) que le spécial (sideStatus ∈ {0,1,2,3}).
 *
 * Réf décomp : après ⌊/50⌋ (+ burn physique), si (sideStatus & bit) && crit==1 → ⌊d/2⌋
 * (en simple ; en double le sous-cas 2/3 n'est pas testé ici). Min-1 physique, puis +2.
 *
 * LANCER (live) : o.runScreenOracle({ pk: await import('/src/pokemon.ts'),
 *                                     dc: await import('/harness/runtime/decomp-constants.ts') })
 * RÉSULTAT VÉRIFIÉ (2026-06-25, finale) : 64/64. Contrôle négatif validé.
 */
'use strict';

const T = Math.trunc;
const SIDE_REFLECT = 1, SIDE_LIGHTSCREEN = 2;

export const refScreen = (L, P, off, def, special, sideStatus) => {
  let d = off; d = d * P; d = d * (T(2 * L / 5) + 2); d = T(d / def); d = T(d / 50);
  if (!special) {
    if (sideStatus & SIDE_REFLECT) d = T(d / 2);
    if (d === 0) d = 1;
  } else {
    if (sideStatus & SIDE_LIGHTSCREEN) d = T(d / 2);
  }
  return d + 2;
};

const mkMon = (off, def, L, special) => ({
  attack: special ? 1 : off, defense: special ? 1 : def, spAttack: special ? off : 1, spDefense: special ? def : 1,
  ability: 0, item: 0, species: 1, status1: 0, statStages: [6, 6, 6, 6, 6, 6, 6, 6], level: L, hp: 100, maxHP: 100,
});

export function runScreenOracle({ pk, dc }) {
  const MOVE_TACKLE = dc.resolveDecompConstant('MOVE_TACKLE', 'MOVE_'), TYPE_PSYCHIC = 14;
  const branches = [{ special: false, type: 0 }, { special: true, type: TYPE_PSYCHIC }];
  let checked = 0; const mism = [];
  for (const br of branches) for (const sideStatus of [0, 1, 2, 3]) for (const L of [50, 100]) for (const P of [80, 120]) for (const A of [200, 300]) {
    const D = 120;
    const att = mkMon(A, D, L, br.special), def = mkMon(A, D, L, br.special);
    const got = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, sideStatus, P, br.type, 1, 3).damage;
    const exp = refScreen(L, P, A, D, br.special, sideStatus);
    checked++;
    if (got !== exp && mism.length < 25) mism.push(`${br.special ? 'SPE' : 'PHY'} side${sideStatus} L${L} P${P} A${A}: got=${got} exp=${exp}`);
  }
  return { checked, mismatches: mism.length, sample: mism.slice(0, 25), verdict: mism.length === 0 ? '✅ écrans (Reflet/Mur Lumière) 1:1' : '❌ écarts' };
}
