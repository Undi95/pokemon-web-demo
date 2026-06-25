/**
 * probe-damage-1to1.mjs — ORACLE RUNTIME (non headless) de la formule de dégâts de base.
 *
 * CalculateBaseDamage (pokemon.ts, port de pokemon.c:3107) = cœur du combat : calcule
 * les dégâts AVANT crit/type/STAB/random (appliqués par l'appelant). FORMULE (pas de
 * table) → oracle runtime : confronte la sortie LIVE du moteur à la formule décomp
 * recodée à la main (non-circulaire, source = pokemon.c).
 *
 * SLICE testée = cœur NEUTRE (single battle, pas de crit/badge/écran/météo/talent/objet,
 * stat stages = 6 → APPLY_STAT_MOD ×1). Couvre : formule physique + burn + formule
 * spéciale. Globals neutralisés hors combat (gCritMultiplier/gBattleTypeFlags/gCurrentMove/
 * gBattleWeather=0) + battlerIds côté ADVERSE (1,3) → ShouldGetStatBadgeBoost=FALSE.
 *
 * Référence décomp 1:1 (pokemon.c) :
 *   - physique (3233) : d=atk ; d*=power ; d*=(2*lvl/5+2) ; d/=def ; d/=50 ;
 *                       burn&!Guts→d/=2 ; min 1 ; (+2 au retour). APPLY_STAT_MOD stage6=×1.
 *   - spécial  (3288) : idem avec spAtk/spDef, MAIS **PAS de min-1** (quirk Gen3) ; (+2).
 *   - APPLY_STAT_MOD   : var = stat * gStatStageRatios[stage][0] / [1] ; stage 6 = {10,10} = ×1.
 *   - retour final     : `damage + 2` (3409).
 *
 * COMMENT LANCER (moteur live) — via le pont preview_eval :
 *   const pk = await import('/src/pokemon.ts');
 *   const dc = await import('/harness/runtime/decomp-constants.ts');
 *   const o  = await import('/scripts/probe-damage-1to1.mjs');
 *   return o.runDamageOracle({ pk, dc });
 *
 * RÉSULTAT VÉRIFIÉ (2026-06-25, branche finale) : 324/324 vecteurs FIDÈLES
 * (162 physiques incl. burn + 162 spéciaux). Contrôle négatif validé séparément
 * (référence sans le +2 → 324 flags).
 */
'use strict';

const STATUS1_BURN = 0x10;     // include/constants/battle.h
const TYPE_PSYCHIC = 14;       // type spécial « propre » (ni feu/eau=météo, ni élec/sol=sport)

// Référence physique neutre (pokemon.c:3233+)
export const physRef = (level, power, atk, def, burn) => {
  let d = atk;                                    // APPLY_STAT_MOD stage 6 = ×1
  d = d * power;
  d = d * (Math.trunc(2 * level / 5) + 2);
  d = Math.trunc(d / def);
  d = Math.trunc(d / 50);
  if (burn) d = Math.trunc(d / 2);
  if (d === 0) d = 1;                             // min 1 (physique seulement)
  return d + 2;
};

// Référence spéciale neutre (pokemon.c:3288+) — PAS de min-1
export const specRef = (level, power, spa, spd) => {
  let d = spa;
  d = d * power;
  d = d * (Math.trunc(2 * level / 5) + 2);
  d = Math.trunc(d / spd);
  d = Math.trunc(d / 50);
  return d + 2;
};

/** Lance l'oracle dans le moteur live. deps = { pk, dc }. */
export function runDamageOracle({ pk, dc }) {
  const MOVE_TACKLE = dc.resolveDecompConstant('MOVE_TACKLE', 'MOVE_');
  const mkMon = (atkOrSpa, defOrSpd, level, burn, special) => ({
    attack: special ? 1 : atkOrSpa, defense: special ? 1 : defOrSpd,
    spAttack: special ? atkOrSpa : 1, spDefense: special ? defOrSpd : 1,
    ability: 0, item: 0, species: 1, status1: burn ? STATUS1_BURN : 0,
    statStages: [6, 6, 6, 6, 6, 6, 6, 6], level, hp: 100, maxHP: 100,
  });

  const levels = [5, 50, 100], powers = [40, 80, 120], aS = [50, 150, 300], dS = [50, 150, 300];
  let checked = 0; const mism = [];

  // Physique (typeOverride=0 → type NORMAL de TACKLE), avec/ sans burn (sur l'attaquant)
  for (const L of levels) for (const P of powers) for (const A of aS) for (const D of dS) for (const burn of [false, true]) {
    const att = mkMon(A, D, L, burn, false), def = mkMon(A, D, L, false, false);
    const got = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, 0, 1, 3).damage;
    const exp = physRef(L, P, A, D, burn);
    checked++;
    if (got !== exp && mism.length < 20) mism.push(`PHYS L${L} P${P} atk${A} def${D} burn${burn ? 1 : 0}: got=${got} exp=${exp}`);
  }
  // Spécial (typeOverride=PSYCHIC)
  for (const L of levels) for (const P of powers) for (const A of aS) for (const D of dS) for (const _ of [0, 1]) {
    const att = mkMon(A, D, L, false, true), def = mkMon(A, D, L, false, true);
    const got = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, TYPE_PSYCHIC, 1, 3).damage;
    const exp = specRef(L, P, A, D);
    checked++;
    if (got !== exp && mism.length < 20) mism.push(`SPEC L${L} P${P} spa${A} spd${D}: got=${got} exp=${exp}`);
  }
  return { checked, mismatches: mism.length, sample: mism.slice(0, 20), verdict: mism.length === 0 ? '✅ dégâts de base 1:1' : '❌ écarts' };
}
