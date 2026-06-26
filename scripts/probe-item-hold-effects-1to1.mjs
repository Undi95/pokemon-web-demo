/**
 * probe-item-hold-effects-1to1.mjs — ORACLE RUNTIME du résolveur d'EFFETS TENUS d'objets.
 *
 * audit-item-data.cjs prouve items.json ; celui-ci prouve la RÉSOLUTION runtime
 * GetItemHoldEffect/GetItemHoldEffectParam (item-hold-effects.ts) : `holdEffect`
 * (string "HOLD_EFFECT_CHOICE_BAND") → numéro consommé par CalculateBaseDamage (Choice
 * Band, Light Ball…) + le param. Même classe que le bug genre (fallback 0 silencieux si
 * l'enum ne résout pas).
 *
 * Confronte, pour chaque item, GetItemHoldEffect(id) vs resolve(items.json.holdEffect),
 * et GetItemHoldEffectParam(id) vs items.json.holdEffectParam.
 *
 * LANCER (live) : o.runItemHoldEffectOracle({
 *   ih: await import('/src/engine/battle/data/item-hold-effects.ts'),
 *   dc: await import('/harness/runtime/decomp-constants.ts'),
 *   items: await (await fetch('/decomp/em/items.json')).json() })
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 319 items (dont les 70 à hold effect) 1:1, 0 écart.
 */
'use strict';

export function runItemHoldEffectOracle({ ih, dc, items }) {
  let checked = 0, withEff = 0; const fails = [];
  for (const name of Object.keys(items)) {
    const id = dc.resolveDecompConstant(name); if (typeof id !== 'number') continue;
    const d = items[name];
    const wantEff = d.holdEffect ? (dc.resolveDecompConstant(d.holdEffect) ?? 0) : 0;
    const wantParam = d.holdEffectParam ?? 0;
    checked++; if (d.holdEffect) withEff++;
    if (ih.GetItemHoldEffect(id) !== wantEff) fails.push(`${name}.holdEffect got=${ih.GetItemHoldEffect(id)} want=${wantEff} (${d.holdEffect})`);
    else if (ih.GetItemHoldEffectParam(id) !== wantParam) fails.push(`${name}.holdEffectParam got=${ih.GetItemHoldEffectParam(id)} want=${wantParam}`);
  }
  return { checked, withHoldEffect: withEff, fails: fails.length, sample: fails.slice(0, 12), verdict: fails.length === 0 ? '✅ GetItemHoldEffect/Param résolus 1:1' : '❌ écarts' };
}
