/**
 * probe-wildindex-1to1.mjs — ORACLE RUNTIME de ChooseWildMonIndex_Land/_WaterRock (slot d'espèce).
 *
 * 1:1 décomp `ChooseWildMonIndex_Land` (wild_encounter.c:182) / `_WaterRock` (l.213) : à CHAQUE
 * rencontre, choisit le SLOT d'espèce via `rand = Random() % TOTAL` puis une cascade if/else sur les
 * seuils cumulatifs ENCOUNTER_CHANCE_*. Ces seuils sont GÉNÉRÉS au build depuis les `encounter_rates`
 * du décomp `src/data/wild_encounters.json` (= SOURCE, non-circulaire) :
 *   - land  : [20,20,10,10,10,10,5,5,4,4,1,1] → 12 slots, total 100
 *   - water/rock : [60,30,5,4,1]              → 5 slots,  total 100
 * On PRÉDIT le slot par cumul des rates décomp (structure DIFFÉRENTE de la cascade du port = non
 * circulaire), et on confronte la sortie LIVE. Couverture EXHAUSTIVE : on cherche un seed pour
 * CHAQUE valeur de rand 0..total-1 (toutes les bornes + tous les slots), puis on teste chacune.
 * Fonctions exportées (pas de ctx/party/emit ; un seul Random()). Self-import we+rng.
 */
'use strict';

// rates décomp (src/data/wild_encounters.json) — SOURCE de vérité, citée.
const LAND_RATES = [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1];
const WATER_RATES = [60, 30, 5, 4, 1];

function predictSlot(rand, rates) {
  let cum = 0;
  for (let i = 0; i < rates.length; i++) { cum += rates[i]; if (rand < cum) return i; }
  return rates.length - 1; // rand >= total : inatteignable (rand < total)
}
const totalOf = (rates) => rates.reduce((a, b) => a + b, 0);

export async function runWildIndexOracle(deps) {
  const we = await import('/src/wild_encounter.ts');
  const rng = await import('/src/random.ts');
  if (typeof we.ChooseWildMonIndex_Land !== 'function' || typeof we.ChooseWildMonIndex_WaterRock !== 'function') {
    return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : ChooseWildMonIndex_* non exportées' };
  }

  const sv = { rng: rng._rngDebug ? rng._rngDebug().gRngValue : 0 };
  const fails = []; let checked = 0;
  const slotsHit = new Set();

  function testTable(name, fn, rates) {
    const total = totalOf(rates);
    // pré-passe : un seed par valeur de rand 0..total-1 (couverture exhaustive des bornes).
    const seedForRand = new Map();
    for (let seed = 0; seed < 20000 && seedForRand.size < total; seed++) {
      rng.SeedRng(seed);
      const rand = rng.Random() % total;
      if (!seedForRand.has(rand)) seedForRand.set(rand, seed);
    }
    let uncovered = 0;
    for (let rand = 0; rand < total; rand++) {
      if (!seedForRand.has(rand)) { uncovered++; continue; }
      rng.SeedRng(seedForRand.get(rand));
      const got = fn();                       // consomme Random() → rand
      const want = predictSlot(rand, rates);
      checked++; slotsHit.add(`${name}:${got}`);
      if (got !== want && fails.length < 16)
        fails.push(`${name} rand=${rand}: got=${got} want=${want}`);
    }
    return uncovered;
  }

  let uncov = 0;
  try {
    uncov += testTable('land', we.ChooseWildMonIndex_Land, LAND_RATES);
    uncov += testTable('water', we.ChooseWildMonIndex_WaterRock, WATER_RATES);
  } finally {
    rng.SeedRng(sv.rng);
  }
  // anti-vacuité : on doit avoir couvert les 12 slots land (0..11) + 5 water (0..4).
  const distinctSlots = slotsHit.size;
  if (distinctSlots < 12 + 5) {
    return { checked, fails: fails.length, sample: fails.slice(0, 16),
      verdict: `⚠️ couverture incomplète (${distinctSlots}/17 slots, ${uncov} rand non couverts) — RNG ?`, skipped: fails.length === 0 };
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 16),
    verdict: fails.length === 0 ? `✅ ChooseWildMonIndex_Land/WaterRock (slots + bornes) 1:1 [${checked} rand, 17 slots]` : '❌ écarts' };
}
