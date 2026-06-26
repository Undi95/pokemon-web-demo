/**
 * probe-damage-weather-1to1.mjs — ORACLE RUNTIME des modulateurs MÉTÉO de CalculateBaseDamage.
 *
 * Complète probe-damage-modifiers-1to1.mjs (talents/objets) en couvrant la section MÉTÉO
 * (pokemon.c:3330-3360) listée "→ suivi" : pluie affaiblit Feu (÷2) / renforce Eau (×15/10) ;
 * soleil renforce Feu / affaiblit Eau. Appliqué au `damage` core AVANT le `+2` final.
 * FORMULE → oracle : sortie LIVE confrontée à la formule décomp recodée à la main (non-circulaire).
 *
 * Météo = GLOBAL `gBattleWeather` (lu par notre impl via `__battleStateMutators.getBattleWeather`).
 * On le pilote temporairement (save/restore) + on force `weatherHasEffect()` à true en neutralisant
 * `__abilityBattleEffectsCheck` (sinon Air Lock/Cloud Nine pourrait bloquer). Types Feu(10)/Eau(11)
 * = SPÉCIAUX (split Gen 3 par type) → core spécial. SolarBeam non testé (demande gCurrentMove global).
 *
 * LANCER (moteur live) :
 *   const pk = await import('/src/pokemon.ts');
 *   const dc = await import('/harness/runtime/decomp-constants.ts');
 *   const bc = await import('/src/engine/battle/constants.ts');
 *   const o  = await import('/scripts/probe-damage-weather-1to1.mjs');
 *   return o.runWeatherOracle({ pk, dc, bc });
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : voir le verdict renvoyé.
 */
'use strict';

const T = Math.trunc, TYPE_FIRE = 10, TYPE_WATER = 11;

/** Core SPÉCIAL neutre (= refDamage branche special, sans +2) puis météo, puis +2. */
function refWeather({ L, P, A, D, type, kind }) {
  let x = A * P;                 // sa = A
  x = x * (T(2 * L / 5) + 2);
  x = T(x / D);                  // sd = D
  x = T(x / 50);                 // core (pas de guard x==0→1 sur la voie spéciale)
  if (kind === 'rain') {
    if (type === TYPE_FIRE) x = T(x / 2);
    else if (type === TYPE_WATER) x = T((15 * x) / 10);
  } else if (kind === 'sun') {
    if (type === TYPE_FIRE) x = T((15 * x) / 10);
    else if (type === TYPE_WATER) x = T(x / 2);
  }
  return x + 2;
}

const mkMon = (A, D, L) => ({
  attack: A, defense: D, spAttack: A, spDefense: D, ability: 0, item: 0, species: 1,
  status1: 0, statStages: [6, 6, 6, 6, 6, 6, 6, 6], level: L, hp: 100, maxHP: 100,
});

/** deps = { pk, dc, bc }. */
export function runWeatherOracle({ pk, dc, bc }) {
  const MOVE_TACKLE = dc.resolveDecompConstant('MOVE_TACKLE', 'MOVE_');
  const RAIN = bc.B_WEATHER_RAIN_TEMPORARY, SUN = bc.B_WEATHER_SUN;
  const g = globalThis;
  const savedMut = g.__battleStateMutators, savedAbi = g.__abilityBattleEffectsCheck;
  let checked = 0; const mism = [];
  try {
    g.__abilityBattleEffectsCheck = undefined;       // → weatherHasEffect() = true
    const run = (kind, W) => {
      g.__battleStateMutators = { ...(savedMut || {}), getBattleWeather: () => W };
      for (const type of [TYPE_FIRE, TYPE_WATER]) {
        for (const L of [50, 100]) for (const P of [60, 120]) for (const A of [120, 280]) for (const D of [90, 200]) {
          const att = mkMon(A, D, L), def = mkMon(A, D, L);
          const got = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, type, 1, 3).damage;
          const exp = refWeather({ L, P, A, D, type, kind });
          checked++;
          if (got !== exp && mism.length < 20) mism.push(`${kind} type${type} L${L} P${P} A${A} D${D}: got=${got} exp=${exp}`);
        }
      }
    };
    run('none', 0);    // contrôle : pas de météo → core+2
    run('rain', RAIN); // Feu ÷2, Eau ×15/10
    run('sun', SUN);   // Feu ×15/10, Eau ÷2
  } finally {
    g.__battleStateMutators = savedMut;
    g.__abilityBattleEffectsCheck = savedAbi;
  }
  return { checked, mismatches: mism.length, sample: mism.slice(0, 20),
    verdict: mism.length === 0 ? '✅ modulateurs météo CalculateBaseDamage 1:1' : '❌ écarts' };
}
