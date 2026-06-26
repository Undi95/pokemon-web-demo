/**
 * probe-damage-modifiers-1to1.mjs — ORACLE RUNTIME des MODULATEURS de CalculateBaseDamage.
 *
 * Complète probe-damage-1to1.mjs (cœur neutre) en couvrant la section talents/objets
 * de CalculateBaseDamage (pokemon.c:3140-3231) — les nombreux `×150/100` / `×2` / `÷2`
 * appliqués à attack/spAttack/defense/spDefense/power AVANT le cœur. FORMULE → oracle
 * runtime : sortie LIVE confrontée à la formule décomp recodée à la main (non-circulaire).
 *
 * Couverts (contrôlables via le struct mon, sans toucher aux globals) :
 *   - Huge/Pure Power  : attack ×2                       (pokemon.c:3140)
 *   - Choice Band      : attack ×150/100                 (3185)
 *   - Thick Fat (déf)  : spAttack ÷2 sur Feu/Glace       (3205)
 *   - Hustle           : attack ×150/100                 (3208)
 *   - Guts (+statut)   : attack ×150/100 ; ET annule le ÷2 burn (3214 + 3263)
 *   - Marvel Scale(déf): defense ×150/100 si statut      (3216)
 *   - Pinch Overgrow   : power ×150/100 sur Plante ≤maxHP/3 (3225)
 * NON couverts (globals/espèces _LOCAL) : badges, type-items, Soul Dew/Deep Sea/Light
 * Ball/Metal Powder/Thick Club (check espèce), field sports, crit-stages, écrans,
 * double, explosion. → suivi. (MÉTÉO désormais couverte : probe-damage-weather-1to1.mjs.)
 *
 * Ordre des modificateurs = EXACT décomp (Huge → ChoiceBand → ThickFat → Hustle → Guts
 * → Marvel → Pinch → cœur). Globals neutralisés hors combat + battlerIds adverses (1,3).
 *
 * LANCER (moteur live) :
 *   const pk = await import('/src/pokemon.ts');
 *   const dc = await import('/harness/runtime/decomp-constants.ts');
 *   const o  = await import('/scripts/probe-damage-modifiers-1to1.mjs');
 *   return o.runModifierOracle({ pk, dc });
 *
 * RÉSULTAT VÉRIFIÉ (2026-06-25, finale) : 112/112 vecteurs FIDÈLES (7 modulateurs ×
 * 16 combos L/P/A/D). Contrôle négatif validé (réf sans le ×1.5 Choice Band → flags).
 */
'use strict';

const BURN = 0x10, TYPE_FIRE = 10, TYPE_GRASS = 12, T = Math.trunc;

/** Référence décomp neutre + modulateurs (ordre 1:1). c = {L,P,A,D,special,att,def,burn}. */
export const refDamage = (c) => {
  let a = c.A, d = c.D, sa = c.A, sd = c.D, p = c.P;
  const A = c.att || {}, D = c.def || {};
  if (A.huge) a *= 2;
  if (A.choiceBand) a = T(150 * a / 100);
  if (D.thickFat) sa = T(sa / 2);
  if (A.hustle) a = T(150 * a / 100);
  if (A.guts) a = T(150 * a / 100);
  if (D.marvel) d = T(150 * d / 100);
  if (A.pinch) p = T(150 * p / 100);
  if (!c.special) {
    let x = a * p; x = x * (T(2 * c.L / 5) + 2); x = T(x / d); x = T(x / 50);
    if (c.burn && !A.guts) x = T(x / 2);
    if (x === 0) x = 1;
    return x + 2;
  }
  let x = sa * p; x = x * (T(2 * c.L / 5) + 2); x = T(x / sd); x = T(x / 50);
  return x + 2;
};

const mkMon = (A, D, L, st1, ab, it, hp, mhp) => ({
  attack: A, defense: D, spAttack: A, spDefense: D,
  ability: ab || 0, item: it || 0, species: 1, status1: st1 || 0,
  statStages: [6, 6, 6, 6, 6, 6, 6, 6], level: L, hp: hp ?? 100, maxHP: mhp ?? 100,
});

/** deps = { pk, dc }. */
export function runModifierOracle({ pk, dc }) {
  const r = (n, pre) => dc.resolveDecompConstant(n, pre);
  const AB = { HUGE: r('ABILITY_HUGE_POWER', 'ABILITY_'), HUSTLE: r('ABILITY_HUSTLE', 'ABILITY_'), GUTS: r('ABILITY_GUTS', 'ABILITY_'), MARVEL: r('ABILITY_MARVEL_SCALE', 'ABILITY_'), THICKFAT: r('ABILITY_THICK_FAT', 'ABILITY_'), OVERGROW: r('ABILITY_OVERGROW', 'ABILITY_') };
  const CHOICE_BAND = r('ITEM_CHOICE_BAND', 'ITEM_'), MOVE_TACKLE = r('MOVE_TACKLE', 'MOVE_');

  const cases = [
    { name: 'HugePower',     special: false, type: 0,          att: { huge: 1 },       ab: AB.HUGE },
    { name: 'Hustle',        special: false, type: 0,          att: { hustle: 1 },     ab: AB.HUSTLE },
    { name: 'Guts+burn',     special: false, type: 0,          att: { guts: 1 },       ab: AB.GUTS, st1: BURN, burn: true },
    { name: 'ChoiceBand',    special: false, type: 0,          att: { choiceBand: 1 }, it: CHOICE_BAND },
    { name: 'MarvelDef',     special: false, type: 0,          def: { marvel: 1 },     defAb: AB.MARVEL, defSt1: BURN },
    { name: 'ThickFatDef',   special: true,  type: TYPE_FIRE,  def: { thickFat: 1 },   defAb: AB.THICKFAT },
    { name: 'PinchOvergrow', special: true,  type: TYPE_GRASS, att: { pinch: 1 },      ab: AB.OVERGROW, hp: 33 },
  ];
  let checked = 0; const mism = [];
  for (const c of cases) for (const L of [50, 100]) for (const P of [80, 120]) for (const A of [150, 300]) for (const D of [100, 200]) {
    const att = mkMon(A, D, L, c.st1, c.ab, c.it, c.hp, 100);
    const def = mkMon(A, D, L, c.defSt1, c.defAb, 0, 100, 100);
    const got = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, c.type, 1, 3).damage;
    const exp = refDamage({ L, P, A, D, special: c.special, att: c.att, def: c.def, burn: c.burn });
    checked++;
    if (got !== exp && mism.length < 20) mism.push(`${c.name} L${L} P${P} A${A} D${D}: got=${got} exp=${exp}`);
  }
  return { checked, mismatches: mism.length, sample: mism.slice(0, 20), verdict: mism.length === 0 ? '✅ modulateurs dégâts 1:1' : '❌ écarts' };
}
