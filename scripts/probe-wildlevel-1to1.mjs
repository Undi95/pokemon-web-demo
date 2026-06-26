/**
 * probe-wildlevel-1to1.mjs — ORACLE RUNTIME de ChooseWildMonLevel (niveau d'un mon sauvage).
 *
 * 1:1 décomp `ChooseWildMonLevel` (wild_encounter.c:268-303) : appelé à CHAQUE rencontre sauvage.
 * Swap min/max si inversés ; `range = max-min+1` ; `rand = Random() % range` ; PUIS si le lead
 * (gPlayerParty[0], non-œuf) a HUSTLE/VITAL_SPIRIT/PRESSURE → `if (Random()%2==0) return max ;
 * sinon if (rand!=0) rand--` ; retourne `min + rand`. RNG-peek : on PEEK le(s) Random() consommé(s)
 * (1, +1 si biais d'ability), on PRÉDIT le niveau recodé depuis la décomp (non-circulaire), on
 * confronte la sortie LIVE. La fn lit gPlayerParty[0] → la sonde lit le MÊME lead (mêmes imports
 * party-storage = instance partagée) pour répliquer la branche exactement. wildPokemon = littéral
 * {minLevel,maxLevel}. Couvre min<max, max<min (swap), range=1, et les 2 chemins de la branche
 * d'ability SELON l'ability réelle du lead.
 */
'use strict';

export async function runWildLevelOracle(deps) {
  const we = await import('/src/wild_encounter.ts');
  const ps = await import('/src/engine/battle/party-storage.ts');
  const bc = await import('/src/engine/battle/constants.ts');
  const rng = await import('/src/random.ts');

  if (typeof we.ChooseWildMonLevel !== 'function') {
    return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : ChooseWildMonLevel non exportée' };
  }
  const lead = ps.gPlayerParty && ps.gPlayerParty[0];
  if (!lead) {
    return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : pas de lead (gPlayerParty[0])' };
  }
  // mêmes lectures que la fn (sur le MÊME lead) → réplique exacte de la branche d'ability.
  let isEgg, ability;
  try {
    isEgg = ps.GetMonData(lead, ps.MON_DATA_SANITY_IS_EGG);
    ability = ps.GetMonAbility(lead);
  } catch (e) {
    return { checked: 0, fails: 0, skipped: true, sample: [], verdict: '⚠️ ignorée : lecture lead a échoué (' + (e && e.message) + ')' };
  }
  const hasBias = !isEgg && (ability === bc.ABILITY_HUSTLE || ability === bc.ABILITY_VITAL_SPIRIT || ability === bc.ABILITY_PRESSURE);

  const sv = { rng: rng._rngDebug ? rng._rngDebug().gRngValue : 0 };
  const fails = []; let checked = 0;
  // [minLevel, maxLevel] : ordre normal, inversé (swap), et range=1
  const CASES = [[5, 5], [5, 10], [10, 5], [2, 40], [40, 2], [1, 100], [17, 23]];
  const SEEDS = [0, 1, 2, 3, 5, 7, 11, 13, 17, 23, 42, 64, 100, 128, 200, 255, 777, 1000];
  try {
    for (const [a, b] of CASES) {
      const min = b >= a ? a : b;
      const max = b >= a ? b : a;
      const range = max - min + 1;
      for (const seed of SEEDS) {
        // peek : r0 toujours ; r1 si biais
        rng.SeedRng(seed);
        const r0 = rng.Random();
        let r1 = 0;
        if (hasBias) r1 = rng.Random();
        rng.SeedRng(seed); // re-seed : la fn re-consomme r0 (et r1 si biais)
        // recodage 1:1 décomp
        let rand = r0 % range;
        let want;
        if (hasBias) {
          if (r1 % 2 === 0) { want = max; }
          else { if (rand !== 0) rand--; want = min + rand; }
        } else {
          want = min + rand;
        }
        const got = we.ChooseWildMonLevel({ minLevel: a, maxLevel: b, species: 1 });
        checked++;
        if (got !== want && fails.length < 12)
          fails.push(`[${a},${b}] seed=${seed} bias=${hasBias} r0%${range}=${r0 % range}: got=${got} want=${want}`);
      }
    }
  } finally {
    rng.SeedRng(sv.rng);
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? `✅ ChooseWildMonLevel (swap+range+ability bias=${hasBias}) 1:1` : '❌ écarts' };
}
