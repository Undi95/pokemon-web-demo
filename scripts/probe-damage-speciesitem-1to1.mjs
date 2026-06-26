/**
 * probe-damage-speciesitem-1to1.mjs — ORACLE RUNTIME des objets ESPÈCE-SPÉCIFIQUES (CalculateBaseDamage).
 *
 * Couvre les boosts d'objet liés à une espèce (pokemon.c:3186-3201) listés "→ suivi" :
 *   - Soul Dew + LATIAS/LATIOS (!Frontier) : spAttack/spDefense ×150/100
 *   - Deep Sea Tooth + CLAMPERL : spAttack ×2   · Deep Sea Scale + CLAMPERL : spDefense ×2
 *   - Light Ball + PIKACHU : spAttack ×2        · Metal Powder + DITTO : defense ×2
 *   - Thick Club + CUBONE/MAROWAK : attack ×2
 * Appliqués au stat AVANT le cœur. Un boost spAttack ne s'observe que sur un move SPÉCIAL
 * (type ≥ 9), attack/defense que sur un move PHYSIQUE (type < 9) → on choisit le type en
 * conséquence. FORMULE → oracle : sortie LIVE confrontée à la formule décomp recodée main.
 *
 * Contrôlable via mon.item + mon.species (pas de global). battlerIdAtk=1 (adverse) → pas de
 * badge. CONTRÔLE NÉGATIF : objet correct mais MAUVAISE espèce → aucun boost (= cœur nu).
 *
 * LANCER (moteur live) :
 *   const pk = await import('/src/pokemon.ts');
 *   const dc = await import('/harness/runtime/decomp-constants.ts');
 *   const o  = await import('/scripts/probe-damage-speciesitem-1to1.mjs');
 *   return o.runSpeciesItemOracle({ pk, dc });
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : voir le verdict renvoyé.
 */
'use strict';

const T = Math.trunc;

/** Cœur neutre avec boost ×mult/100 sur le stat offensif (atk/spa) ou défensif (def/spd). */
function refCore({ L, P, A, D, type, stat, mult }) {
  const phys = type < 9;            // IS_TYPE_PHYSICAL (TYPE_MYSTERY = 9)
  let usedAtk = A, usedDef = D;
  if (phys) {
    if (stat === 'attack') usedAtk = T((A * mult) / 100);
    if (stat === 'defense') usedDef = T((D * mult) / 100);
  } else {
    if (stat === 'spAttack') usedAtk = T((A * mult) / 100);
    if (stat === 'spDefense') usedDef = T((D * mult) / 100);
  }
  let x = usedAtk * P;
  x = x * (T(2 * L / 5) + 2);
  x = T(x / usedDef);
  x = T(x / 50);
  if (phys && x === 0) x = 1;
  return x + 2;
}

const mkMon = (A, D, L, species, item) => ({
  attack: A, defense: D, spAttack: A, spDefense: D, ability: 0, item: item || 0,
  species: species || 1, status1: 0, statStages: [6, 6, 6, 6, 6, 6, 6, 6], level: L, hp: 100, maxHP: 100,
});

/** deps = { pk, dc }. */
export function runSpeciesItemOracle({ pk, dc }) {
  const S = (n) => dc.resolveDecompConstant(n, 'SPECIES_');
  const I = (n) => dc.resolveDecompConstant(n, 'ITEM_');
  const MOVE_TACKLE = dc.resolveDecompConstant('MOVE_TACKLE', 'MOVE_');
  const WRONG = S('SPECIES_BULBASAUR');  // espèce ne déclenchant aucun de ces objets
  // (name, side, species, item, type pour révéler le stat, stat boosté, mult%)
  const cases = [
    ['ThickClub/Cubone',  'atk', 'SPECIES_CUBONE',  'ITEM_THICK_CLUB',     0  /* NORMAL phys */,    'attack',    200],
    ['ThickClub/Marowak', 'atk', 'SPECIES_MAROWAK', 'ITEM_THICK_CLUB',     0,                       'attack',    200],
    ['LightBall/Pikachu', 'atk', 'SPECIES_PIKACHU', 'ITEM_LIGHT_BALL',     13 /* ELECTRIC spé */,    'spAttack',  200],
    ['DeepTooth/Clamperl','atk', 'SPECIES_CLAMPERL','ITEM_DEEP_SEA_TOOTH', 11 /* WATER spé */,       'spAttack',  200],
    ['SoulDew/Latias',    'atk', 'SPECIES_LATIAS',  'ITEM_SOUL_DEW',       14 /* PSYCHIC spé */,     'spAttack',  150],
    ['SoulDew/Latios',    'atk', 'SPECIES_LATIOS',  'ITEM_SOUL_DEW',       14,                      'spAttack',  150],
    ['MetalPowder/Ditto', 'def', 'SPECIES_DITTO',   'ITEM_METAL_POWDER',   0  /* phys → defense */,  'defense',   200],
    ['DeepScale/Clamperl','def', 'SPECIES_CLAMPERL','ITEM_DEEP_SEA_SCALE', 11 /* spé → spDefense */, 'spDefense', 200],
    ['SoulDewDef/Latias', 'def', 'SPECIES_LATIAS',  'ITEM_SOUL_DEW',       14,                      'spDefense', 150],
  ];
  let checked = 0; const mism = []; const skipped = [];
  for (const [name, side, spName, itName, type, stat, mult] of cases) {
    const sp = S(spName), it = I(itName);
    if (typeof sp !== 'number' || typeof it !== 'number') { skipped.push(name); continue; }
    for (const L of [50, 100]) for (const P of [60, 120]) for (const A of [120, 260]) for (const D of [90, 180]) {
      const mkPair = (useSp) => side === 'atk'
        ? [mkMon(A, D, L, useSp, it), mkMon(A, D, L, 0, 0)]
        : [mkMon(A, D, L, 0, 0), mkMon(A, D, L, useSp, it)];
      // (1) bonne espèce → boost
      const [a1, d1] = mkPair(sp);
      const got1 = pk.CalculateBaseDamage(a1, d1, MOVE_TACKLE, 0, P, type, 1, 3).damage;
      const exp1 = refCore({ L, P, A, D, type, stat, mult });
      checked++;
      if (got1 !== exp1 && mism.length < 20) mism.push(`${name} L${L} P${P} A${A} D${D}: got=${got1} exp=${exp1}`);
      // (2) CONTRÔLE NÉGATIF : mauvaise espèce → aucun boost (mult 100)
      const [a2, d2] = mkPair(WRONG);
      const got2 = pk.CalculateBaseDamage(a2, d2, MOVE_TACKLE, 0, P, type, 1, 3).damage;
      const exp2 = refCore({ L, P, A, D, type, stat, mult: 100 });
      checked++;
      if (got2 !== exp2 && mism.length < 20) mism.push(`${name} NEG(wrongSp) L${L} P${P} A${A} D${D}: got=${got2} exp=${exp2}`);
    }
  }
  return { checked, skipped, mismatches: mism.length, sample: mism.slice(0, 20),
    verdict: mism.length === 0 ? '✅ objets espèce-spécifiques CalculateBaseDamage 1:1' : '❌ écarts' };
}
