/**
 * probe-encounter-check-1to1.mjs — ORACLE RUNTIME des checks de déclenchement de rencontre.
 *
 * 1:1 décomp (wild_encounter.c) :
 *   - `EncounterOddsCheck(rate)` (l.493) : `Random() % MAX_ENCOUNTER_RATE(2880) < rate` → bool.
 *     C'est le tirage final « une rencontre se déclenche-t-elle » (rate = encounter_rate*16+mods).
 *   - `AllowWildCheckOnNewMetatile()` (l.533) : `Random() % 100 < 60` (40% de skip au changement de
 *     case). Pas de skip = on tente la rencontre.
 * RNG-peek : on PEEK le Random() consommé, on PRÉDIT le booléen recodé depuis la décomp (seuils
 * 2880/60 cités), on confronte la sortie LIVE. Fonctions exportées (pas de ctx/party/emit, un seul
 * Random()). Self-import we+rng.
 *
 * Couverture des BORNES :
 *   - EncounterOddsCheck : pour chaque seed, peek r=Random()%2880, on teste rate ∈ {0, r, r+1, 2880}
 *     → couvre EXACTEMENT la frontière `<` (r<r faux, r<r+1 vrai, r<0 faux, r<2880 vrai).
 *   - AllowWildCheckOnNewMetatile : un seed par valeur de rand 0..99 (toutes les bornes, dont 59/60).
 */
'use strict';

const MAX_ENCOUNTER_RATE = 2880;   // décomp wild_encounter.c:27
const NEW_METATILE_THRESHOLD = 60; // décomp wild_encounter.c:535 (Random%100 >= 60 → skip)

export async function runEncounterCheckOracle(deps) {
  const we = await import('/src/wild_encounter.ts');
  const rng = await import('/src/random.ts');
  if (typeof we.EncounterOddsCheck !== 'function' || typeof we.AllowWildCheckOnNewMetatile !== 'function') {
    return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : checks non exportés' };
  }

  const sv = { rng: rng._rngDebug ? rng._rngDebug().gRngValue : 0 };
  const fails = []; let checked = 0;
  let sawTrue = false, sawFalse = false;

  try {
    // ── EncounterOddsCheck : frontière `<` exacte par seed ──
    for (let seed = 0; seed < 60; seed++) {
      rng.SeedRng(seed);
      const r = rng.Random() % MAX_ENCOUNTER_RATE;
      for (const rate of [0, r, r + 1, MAX_ENCOUNTER_RATE]) {
        rng.SeedRng(seed);                 // re-seed : la fn re-consomme le même Random()
        const got = we.EncounterOddsCheck(rate);
        const want = r < rate;
        checked++; if (want) sawTrue = true; else sawFalse = true;
        if (got !== want && fails.length < 16)
          fails.push(`odds seed=${seed} r=${r} rate=${rate}: got=${got} want=${want}`);
      }
    }

    // ── AllowWildCheckOnNewMetatile : un seed par rand 0..99 (bornes 59/60) ──
    const seedForRand = new Map();
    for (let seed = 0; seed < 20000 && seedForRand.size < 100; seed++) {
      rng.SeedRng(seed);
      const rand = rng.Random() % 100;
      if (!seedForRand.has(rand)) seedForRand.set(rand, seed);
    }
    let coveredRand = 0;
    for (let rand = 0; rand < 100; rand++) {
      if (!seedForRand.has(rand)) continue;
      coveredRand++;
      rng.SeedRng(seedForRand.get(rand));
      const got = we.AllowWildCheckOnNewMetatile();
      const want = rand < NEW_METATILE_THRESHOLD;
      checked++;
      if (got !== want && fails.length < 16)
        fails.push(`newtile rand=${rand}: got=${got} want=${want}`);
    }
    if (coveredRand < 100) {
      return { checked, fails: fails.length, sample: fails.slice(0, 16),
        verdict: `⚠️ couverture rand incomplète (${coveredRand}/100) — RNG ?`, skipped: fails.length === 0 };
    }
  } finally {
    rng.SeedRng(sv.rng);
  }
  // anti-vacuité : EncounterOddsCheck doit avoir produit true ET false.
  if (!sawTrue || !sawFalse) {
    return { checked, fails: fails.length, sample: fails.slice(0, 16),
      verdict: `⚠️ EncounterOddsCheck n'a pas couvert true ET false`, skipped: fails.length === 0 };
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 16),
    verdict: fails.length === 0 ? `✅ EncounterOddsCheck (<2880) + AllowWildCheckOnNewMetatile (<60) 1:1 [${checked} cas]` : '❌ écarts' };
}
