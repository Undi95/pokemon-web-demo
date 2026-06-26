/**
 * probe-all-1to1.mjs — AGRÉGATEUR des sondes runtime 1:1 (parallèle headless audit-data-1to1).
 *
 * Lance les ~15 oracles de FORMULE runtime (qui calculent dans le vrai moteur via les modules
 * /src) en une seule passe et renvoie un récap pass/fail. Headless `audit-data-1to1` couvre la
 * DATA extraite ; celui-ci couvre le CODE qui la consomme (stats/dégâts/genre/type/exp/résolveurs).
 *
 * LANCER (moteur live, via preview_eval) :
 *   return (await import('/scripts/probe-all-1to1.mjs')).runAll();
 *
 * Renvoie { total, passed, failed, results:[{name, ok, detail}] }.
 */
'use strict';

export async function runAll() {
  const I = (p) => import(p);
  const [pk, dc, bc, ih, bm, et, sr, ps, tm, bsc] = await Promise.all([
    I('/src/pokemon.ts'),
    I('/harness/runtime/decomp-constants.ts'),
    I('/src/engine/battle/constants.ts'),
    I('/src/engine/battle/data/item-hold-effects.ts'),
    I('/src/engine/battle/data/battle-moves.ts'),
    I('/src/engine/battle/data/experience-tables.ts'),
    I('/src/engine/battle/data/species-runtime.ts'),
    I('/src/engine/battle/party-storage.ts'),
    I('/src/engine/pokemon/tmhm-moves.ts'),
    I('/src/battle_script_commands.ts'),
  ]);
  // Charger les data dont dépendent les sondes (le moteur en overworld ne les a pas forcément
  // déclenchées ; instances ESM partagées → charge une fois pour tous, y c. pour pk/CalculateBaseDamage).
  await Promise.all([
    bm.loadBattleMoves ? bm.loadBattleMoves() : null,
    ih.loadItemHoldEffects ? ih.loadItemHoldEffects() : null,
  ]);
  const gd = globalThis.__game_data;
  const [moves, items, info] = await Promise.all([
    fetch('/decomp/em/moves-data.json').then((r) => r.json()),
    fetch('/decomp/em/items.json').then((r) => r.json()),
    fetch('/decomp/em/species-info.json').then((r) => r.json()),
  ]);

  // [nom de fichier sonde, fonction runner, deps]
  const SPEC = [
    ['probe-stats-1to1', 'runStatsOracle', { ps, dc, gd }],
    ['probe-damage-1to1', 'runDamageOracle', { pk, dc }],
    ['probe-damage-modifiers-1to1', 'runModifierOracle', { pk, dc }],
    ['probe-damage-statstages-1to1', 'runStatStageOracle', { pk, dc }],
    ['probe-damage-screens-1to1', 'runScreenOracle', { pk, dc }],
    ['probe-damage-weather-1to1', 'runWeatherOracle', { pk, dc, bc }],
    ['probe-damage-typeitem-1to1', 'runTypeItemOracle', { pk, ih, dc }],
    ['probe-damage-speciesitem-1to1', 'runSpeciesItemOracle', { pk, dc }],
    ['probe-type-effectiveness-1to1', 'runTypeEffectivenessOracle', { bsc, dc }],
    ['probe-gender-shiny-1to1', 'runGenderShinyOracle', { pk, dc }],
    ['probe-species-runtime-1to1', 'runSpeciesRuntimeOracle', { sr, dc, info }],
    ['probe-experience-runtime-1to1', 'runExpRuntimeOracle', { et, sr, dc, speciesInfo: info }],
    ['probe-battle-moves-runtime-1to1', 'runBattleMovesOracle', { bm, dc, moves }],
    ['probe-item-hold-effects-1to1', 'runItemHoldEffectOracle', { ih, dc, items }],
    ['probe-tmhm-learn-1to1', 'runTmhmLearnOracle', { ps, tm, dc }],
  ];

  const results = [];
  for (const [file, fn, deps] of SPEC) {
    try {
      const mod = await I('/scripts/' + file + '.mjs');
      const res = mod[fn](deps);
      const r = (res && typeof res.then === 'function') ? await res : res;
      const fails = r.fails ?? r.mismatches ?? r.mism ?? 0;
      const ok = typeof r.verdict === 'string' ? r.verdict.startsWith('✅') : fails === 0;
      results.push({ name: file, ok, detail: r.verdict ?? `checked=${r.checked} fails=${fails}` });
    } catch (e) {
      results.push({ name: file, ok: false, detail: 'ERREUR: ' + String(e && e.message || e) });
    }
  }

  const passed = results.filter((x) => x.ok).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
    verdict: passed === results.length ? `✅ ${passed}/${results.length} sondes runtime 1:1 vertes` : `❌ ${results.length - passed} sonde(s) en échec`,
  };
}
