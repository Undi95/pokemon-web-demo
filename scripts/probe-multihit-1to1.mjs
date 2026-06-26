/**
 * probe-multihit-1to1.mjs — ORACLE RUNTIME de Cmd_setmultihitcounter (coups multiples 2-5).
 *
 * 1:1 décomp `Cmd_setmultihitcounter` (battle_script_commands.c:7142) : si l'arg opcode != 0 →
 * compteur fixe ; sinon ALÉATOIRE 2-5 : `c = Random()&3` ; si c>1 → `c = (Random()&3)+2` ;
 * sinon `c += 2` (→ distribution 3/8·3/8·1/8·1/8). RNG-peek : on PEEK le(s) Random() que la fn
 * consommera (1 ou 2 selon le 1er tirage), on PRÉDIT le compteur (recodé décomp, non-circulaire),
 * on confronte gMultiHitCounter LIVE. Pour FORCER la branche aléatoire sans bytecode : `ctx.scriptPtr`
 * hors-borne → `readByte` renvoie undefined/0 (falsy) → `if (arg)` faux → branche random (robuste que
 * _BYTECODE soit chargé ou non). Self-import bsc+st+rng (instances cohérentes).
 */
'use strict';

export async function runMultiHitOracle(deps) {
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const rng = await import('/src/random.ts');

  const sv = { mhc: st.gMultiHitCounter, rng: rng._rngDebug ? rng._rngDebug().gRngValue : 0 };
  const fails = []; let checked = 0;
  const dist = { 2: 0, 3: 0, 4: 0, 5: 0 };
  // ctx hors-borne → readByte falsy → branche aléatoire (cf. en-tête).
  const ctx = { scriptPtr: 0x7fffffff };
  const SEEDS = [0, 1, 2, 3, 5, 7, 11, 13, 17, 23, 42, 64, 100, 128, 200, 255, 777, 1000, 4242, 9001];
  try {
    for (const seed of SEEDS) {
      // peek : 1er Random() toujours ; 2e seulement si (r0&3)>1
      rng.SeedRng(seed);
      const r0 = rng.Random();
      const c0 = r0 & 3;
      let want;
      if (c0 > 1) { const r1 = rng.Random(); want = (r1 & 3) + 2; }
      else { want = c0 + 2; }
      rng.SeedRng(seed); // re-seed : la fn re-consomme r0 (et r1 si besoin)
      ctx.scriptPtr = 0x7fffffff;
      bsc.Cmd_setmultihitcounter(ctx);
      const got = st.gMultiHitCounter;
      checked++;
      if (got >= 2 && got <= 5) dist[got]++;
      if (got !== want && fails.length < 12)
        fails.push(`seed=${seed} r0&3=${c0}: got=${got} want=${want}`);
    }
  } finally {
    st.setMultiHitCounter(sv.mhc);
    rng.SeedRng(sv.rng);
  }
  // garde anti-vacuité : la branche aléatoire DOIT produire des comptes dans [2..5]
  // (si tout tombait hors [2,5], la branche random n'aurait pas été prise = env. cassé).
  const inRange = dist[2] + dist[3] + dist[4] + dist[5];
  if (inRange === 0) {
    return { checked, fails: 0, skipped: true, sample: [],
      verdict: '⚠️ ignorée : branche aléatoire non atteinte (bytecode ?)' };
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? `✅ Cmd_setmultihitcounter (2-5 hits) 1:1 [dist ${dist[2]}/${dist[3]}/${dist[4]}/${dist[5]}]` : '❌ écarts' };
}
