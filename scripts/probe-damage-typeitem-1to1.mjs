/**
 * probe-damage-typeitem-1to1.mjs — ORACLE RUNTIME des objets BOOST-DE-TYPE (CalculateBaseDamage).
 *
 * Couvre la boucle `sHoldEffectToType` (pokemon.c:3171-3183) listée "→ suivi" : si l'attaquant
 * tient un objet boost-de-type (Charbon→Feu, Poudre Argent→Insecte…) ET que le type du move
 * matche, attack (physique) ou spAttack (spécial) ×(holdEffectParam + 100)/100, AVANT le cœur.
 * FORMULE → oracle : sortie LIVE confrontée à la formule décomp recodée main (non-circulaire ;
 * le `param` vient de GetItemHoldEffectParam, déjà prouvé 1:1 par probe-item-hold-effects).
 *
 * Contrôlable via `mon.item` (pas de global). battlerIdAtk=1 (adverse) → pas de boost badge.
 * Contrôle négatif : même objet + type NON-matchant → AUCUN boost (= cœur nu).
 *
 * LANCER (moteur live) :
 *   const pk = await import('/src/pokemon.ts');
 *   const ih = await import('/src/engine/battle/data/item-hold-effects.ts');
 *   const dc = await import('/harness/runtime/decomp-constants.ts');
 *   const o  = await import('/scripts/probe-damage-typeitem-1to1.mjs');
 *   return o.runTypeItemOracle({ pk, ih, dc });
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : voir le verdict renvoyé.
 */
'use strict';

const T = Math.trunc;

/** Cœur neutre (physique guard x==0→1 ; spécial sans guard) avec att/spa boosté ×mult/100. */
function refCore({ L, P, A, D, type, mult }) {
  const phys = type < 9;             // IS_TYPE_PHYSICAL (TYPE_MYSTERY = 9)
  const stat = T((A * mult) / 100);  // attack (phys) ou spAttack (spé) boosté
  let x = stat * P;
  x = x * (T(2 * L / 5) + 2);
  x = T(x / D);
  x = T(x / 50);
  if (phys && x === 0) x = 1;
  return x + 2;
}

const mkMon = (A, D, L, item) => ({
  attack: A, defense: D, spAttack: A, spDefense: D, ability: 0, item: item || 0, species: 1,
  status1: 0, statStages: [6, 6, 6, 6, 6, 6, 6, 6], level: L, hp: 100, maxHP: 100,
});

/** deps = { pk, ih, dc }. */
export function runTypeItemOracle({ pk, ih, dc }) {
  const r = (n) => dc.resolveDecompConstant(n, 'ITEM_');
  const MOVE_TACKLE = dc.resolveDecompConstant('MOVE_TACKLE', 'MOVE_');
  // (itemName, type qui matche, type qui NE matche PAS) — type values include/constants/pokemon.
  const ITEMS = [
    ['ITEM_CHARCOAL', 10 /* FIRE spé */, 11 /* WATER */],
    ['ITEM_MIRACLE_SEED', 12 /* GRASS spé */, 10],
    ['ITEM_MAGNET', 13 /* ELECTRIC spé */, 6],
    ['ITEM_MYSTIC_WATER', 11 /* WATER spé */, 10],
    ['ITEM_SILVER_POWDER', 6 /* BUG phys */, 4],
    ['ITEM_SOFT_SAND', 4 /* GROUND phys */, 6],
    ['ITEM_BLACK_BELT', 1 /* FIGHTING phys */, 5],
    ['ITEM_HARD_STONE', 5 /* ROCK phys */, 1],
  ];
  let checked = 0; const mism = []; const skipped = [];
  for (const [name, okType, noType] of ITEMS) {
    const itemId = r(name);
    if (typeof itemId !== 'number') { skipped.push(name); continue; }
    const param = ih.GetItemHoldEffectParam(itemId);
    const mult = param + 100;
    for (const L of [50, 100]) for (const P of [60, 120]) for (const A of [130, 260]) for (const D of [90, 180]) {
      const att = mkMon(A, D, L, itemId), def = mkMon(A, D, L, 0);
      // (1) type matchant → boost ×(param+100)/100
      const gotOk = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, okType, 1, 3).damage;
      const expOk = refCore({ L, P, A, D, type: okType, mult });
      checked++;
      if (gotOk !== expOk && mism.length < 20) mism.push(`${name} matchT${okType} L${L} P${P} A${A} D${D}: got=${gotOk} exp=${expOk} (param=${param})`);
      // (2) CONTRÔLE NÉGATIF : type non-matchant → mult 100 (pas de boost)
      const gotNo = pk.CalculateBaseDamage(att, def, MOVE_TACKLE, 0, P, noType, 1, 3).damage;
      const expNo = refCore({ L, P, A, D, type: noType, mult: 100 });
      checked++;
      if (gotNo !== expNo && mism.length < 20) mism.push(`${name} noT${noType} (neg) L${L} P${P} A${A} D${D}: got=${gotNo} exp=${expNo}`);
    }
  }
  return { checked, skipped, mismatches: mism.length, sample: mism.slice(0, 20),
    verdict: mism.length === 0 ? '✅ objets boost-de-type CalculateBaseDamage 1:1' : '❌ écarts' };
}
