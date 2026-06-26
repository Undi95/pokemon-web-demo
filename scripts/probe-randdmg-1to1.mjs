/**
 * probe-randdmg-1to1.mjs — ORACLE RUNTIME de ApplyRandomDmgMultiplier (aléa 85-100 %).
 *
 * 1:1 décomp `ApplyRandomDmgMultiplier` (battle_script_commands.c:1639) : appliqué à CHAQUE coup
 * offensif (via Cmd_adjustnormaldamage). `randPercent = 100 - Random()%16` (= 85..100),
 * `gBattleMoveDamage = gBattleMoveDamage * randPercent / 100` (division entière), min 1 si >0 ;
 * no-op si dmg==0. Le RNG est seedable → on PEEK la valeur que la fn consommera (`SeedRng(S);
 * V=Random(); SeedRng(S)`), on PRÉDIT randPercent + le dégât final (recodé depuis la décomp,
 * source citée = non-circulaire), puis on confronte gBattleMoveDamage LIVE. Pas de ctx, pas
 * d'emit contrôleur → la fn lit/écrit seulement gBattleMoveDamage. Self-import bsc+st (instances
 * cohérentes) ; couvre les 16 valeurs de randPercent (seeds) × dégâts dont l'arête min-1 (D=1) et
 * le no-op (D=0).
 */
'use strict';

export async function runRandDmgOracle(deps) {
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const rng = await import('/src/random.ts');

  const sv = { dmg: st.gBattleMoveDamage, rng: rng._rngDebug ? rng._rngDebug().gRngValue : 0 };
  const fails = []; let checked = 0;
  // D : dégâts d'entrée — gros (cas normal), petits (arête min-1, ex. 1*85/100=0→1), et 0 (no-op).
  const Ds = [248, 100, 41, 17, 7, 3, 1, 0];
  const SEEDS = [0, 1, 3, 7, 13, 16, 31, 64, 100, 200, 255, 1000];
  try {
    for (const D of Ds) {
      for (const seed of SEEDS) {
        rng.SeedRng(seed); const rand = rng.Random(); rng.SeedRng(seed); // peek + re-seed
        const randPercent = 100 - (rand % 16);
        let want;
        if (D === 0) {
          want = 0;                                   // fn skip (gBattleMoveDamage !== 0)
        } else {
          want = Math.floor((D * randPercent) / 100);
          if (want === 0) want = 1;                   // min-1 1:1
        }
        st.setBattleMoveDamage(D);
        bsc.ApplyRandomDmgMultiplier();
        const got = st.gBattleMoveDamage;
        checked++;
        if (got !== want && fails.length < 12)
          fails.push(`D=${D} seed=${seed} rand%16=${rand % 16} pct=${randPercent}: got=${got} want=${want}`);
      }
    }
  } finally {
    st.setBattleMoveDamage(sv.dmg);
    rng.SeedRng(sv.rng);
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ ApplyRandomDmgMultiplier (85-100% + min-1) 1:1' : '❌ écarts' };
}
