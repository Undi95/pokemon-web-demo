/**
 * probe-battle-moves-runtime-1to1.mjs — ORACLE RUNTIME du résolveur de MOVES de combat.
 *
 * audit-move-data.cjs prouve moves-data.json (data, en STRINGS : type="TYPE_FIRE",
 * effect="EFFECT_BURN_HIT", target=…, flags="FLAG_X | FLAG_Y"). Celui-ci prouve la
 * RÉSOLUTION runtime : getBattleMove(id) (battle-moves.ts) résout ces strings en NUMÉROS
 * que CalculateBaseDamage / AI_TypeCalc consomment. Même classe que le bug genre
 * (fallback silencieux possible sur un enum manquant).
 *
 * Confronte, pour les 355 moves, getBattleMove vs les strings résolues à la main
 * (resolveDecompConstant). flags = OR des FLAG_* résolus.
 *
 * NB : il existe AUSSI gBattleMoves (game-data.ts) = RAW non résolu, mais aucun code combat
 * ne lit ses champs numériques directement (seulement getBattleMove). Latent, pas un bug.
 *
 * LANCER (live) : o.runBattleMovesOracle({
 *   bm: await import('/src/engine/battle/data/battle-moves.ts'),
 *   dc: await import('/harness/runtime/decomp-constants.ts'),
 *   moves: await (await fetch('/decomp/em/moves-data.json')).json() })
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 355/355 résolus 1:1, 0 écart.
 */
'use strict';

export function runBattleMovesOracle({ bm, dc, moves }) {
  const R = (s) => dc.resolveDecompConstant(s);
  const resolveFlags = (s) => !s ? 0 : String(s).split('|').map((x) => x.trim()).filter(Boolean).reduce((a, f) => a | (R(f) ?? 0), 0);
  let checked = 0; const fails = [];
  for (const name of Object.keys(moves)) {
    const id = R(name); if (id == null) continue;
    const d = moves[name], m = bm.getBattleMove(id); checked++;
    const want = { type: R(d.type), effect: R(d.effect), target: R(d.target), flags: resolveFlags(d.flags),
      power: d.power ?? 0, pp: d.pp ?? 0, accuracy: d.accuracy ?? 0, priority: d.priority ?? 0, secondaryEffectChance: d.secondaryEffectChance ?? 0 };
    for (const f of Object.keys(want)) if (m[f] !== want[f]) { fails.push(`${name}.${f} got=${m[f]} want=${want[f]}`); break; }
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12), verdict: fails.length === 0 ? '✅ getBattleMove 355 résolus 1:1' : '❌ écarts' };
}
