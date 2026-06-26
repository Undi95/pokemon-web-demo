/**
 * probe-damage-badges-1to1.mjs — ORACLE RUNTIME du boost de BADGE dans CalculateBaseDamage.
 *
 * Dernier modulateur de dégâts non prouvé (les autres : probe-damage-{modifiers,weather,typeitem,
 * speciesitem}). 1:1 décomp pokemon.c:3163 `ShouldGetStatBadgeBoost` : si le joueur a le badge ET
 * que le battler est côté joueur (et pas en link), le stat correspondant ×110/100 :
 *   FLAG_BADGE01_GET → attack (attaquant) · FLAG_BADGE07_GET → spAttack (attaquant).
 *
 * Pilote les VRAIS flags badge (FlagSet/Clear) → save+restore obligatoire. battlerIdAtk=0 (joueur),
 * battlerIdDef=1 (adverse, pas de boost défenseur). Confronte la sortie LIVE au cœur recodé main.
 *
 * LANCER (live) :
 *   const pk = await import('/src/pokemon.ts');
 *   const sv = await import('/src/engine/script/script-vars.ts');
 *   const dc = await import('/harness/runtime/decomp-constants.ts');
 *   const o  = await import('/scripts/probe-damage-badges-1to1.mjs');
 *   return o.runBadgeOracle({ pk, sv, dc });
 * RÉSULTAT VÉRIFIÉ (2026-06-27, finale) : voir le verdict renvoyé.
 */
'use strict';

const T = Math.trunc;

/** Cœur neutre avec le stat offensif (attack si phys, spAttack si spé) ×mult/100. */
function refCore({ L, P, A, D, phys, mult }) {
  const stat = T((A * mult) / 100);   // attack (phys) ou spAttack (spé) boosté par le badge
  let x = stat * P;
  x = x * (T(2 * L / 5) + 2);
  x = T(x / D);
  x = T(x / 50);
  if (phys && x === 0) x = 1;
  return x + 2;
}
const mkMon = (A, D, L) => ({
  attack: A, defense: D, spAttack: A, spDefense: D, ability: 0, item: 0, species: 1,
  status1: 0, statStages: [6, 6, 6, 6, 6, 6, 6, 6], level: L, hp: 100, maxHP: 100,
});

/** deps = { pk, sv, dc }. */
export function runBadgeOracle({ pk, sv, dc }) {
  const MOVE_TACKLE = dc.resolveDecompConstant('MOVE_TACKLE', 'MOVE_');
  const TYPE_NORMAL = 0, TYPE_PSYCHIC = 14;  // physique vs spécial
  const fails = []; let checked = 0;
  // sauvegarde l'état réel des flags badge
  const B01 = 'FLAG_BADGE01_GET', B07 = 'FLAG_BADGE07_GET';
  const o01 = sv.FlagGet(B01), o07 = sv.FlagGet(B07);
  try {
    // — BADGE01 → attack (move physique) —
    for (const L of [50, 100]) for (const P of [60, 120]) for (const A of [120, 240]) for (const D of [90, 180]) {
      const att = mkMon(A, D, L), def = mkMon(A, D, L);
      sv.FlagClear(B01);
      const gotNo = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, TYPE_NORMAL, 0, 1).damage;
      const expNo = refCore({ L, P, A, D, phys: true, mult: 100 });
      sv.FlagSet(B01);
      const gotYes = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, TYPE_NORMAL, 0, 1).damage;
      const expYes = refCore({ L, P, A, D, phys: true, mult: 110 });
      checked += 2;
      if (gotNo !== expNo && fails.length < 12) fails.push(`BADGE01 off L${L} P${P} A${A} D${D}: got=${gotNo} exp=${expNo}`);
      if (gotYes !== expYes && fails.length < 12) fails.push(`BADGE01 on L${L} P${P} A${A} D${D}: got=${gotYes} exp=${expYes}`);
    }
    sv.FlagClear(B01);
    // — BADGE07 → spAttack (move spécial) —
    for (const L of [50, 100]) for (const P of [60, 120]) for (const A of [120, 240]) for (const D of [90, 180]) {
      const att = mkMon(A, D, L), def = mkMon(A, D, L);
      sv.FlagClear(B07);
      const gotNo = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, TYPE_PSYCHIC, 0, 1).damage;
      const expNo = refCore({ L, P, A, D, phys: false, mult: 100 });
      sv.FlagSet(B07);
      const gotYes = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, TYPE_PSYCHIC, 0, 1).damage;
      const expYes = refCore({ L, P, A, D, phys: false, mult: 110 });
      checked += 2;
      if (gotNo !== expNo && fails.length < 12) fails.push(`BADGE07 off L${L} P${P} A${A} D${D}: got=${gotNo} exp=${expNo}`);
      if (gotYes !== expYes && fails.length < 12) fails.push(`BADGE07 on L${L} P${P} A${A} D${D}: got=${gotYes} exp=${expYes}`);
    }
  } finally {
    // restaure l'état réel des badges
    if (o01) sv.FlagSet(B01); else sv.FlagClear(B01);
    if (o07) sv.FlagSet(B07); else sv.FlagClear(B07);
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ boost de badge (attack/spAttack ×110/100) 1:1' : '❌ écarts' };
}
