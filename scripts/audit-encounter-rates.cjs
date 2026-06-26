#!/usr/bin/env node
/**
 * audit-encounter-rates.cjs — ORACLE des TAUX DE SLOT de rencontre sauvage.
 *
 * Confronte les constantes cumulatives `ENCOUNTER_CHANCE_{LAND,WATER}_MONS_SLOT_*`
 * (src/wild_encounter.ts) aux taux canoniques du décomp (src/data/wild_encounters.json,
 * champ `encounter_rates`). Ces taux pilotent la PROBABILITÉ d'apparition par slot
 * (= quelle espèce de la table de rencontre apparaît). Un taux faux = distribution
 * d'espèces sauvages fausse.
 *
 * Reconstruit les taux par slot depuis nos constantes (SLOT_0 = base ; SLOT_n / TOTAL =
 * `… + increment` → on prend le DERNIER entier de chaque RHS) puis confronte au JSON décomp.
 * land = 12 slots, water = rock_smash = 5 slots (notre ChooseWildMonIndex_WaterRock partagé).
 *
 *   node scripts/audit-encounter-rates.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_JSON = 'D:/Projet 1/decomps/pokeemeraude/src/data/wild_encounters.json';
const OURS = path.join(ROOT, 'src/wild_encounter.ts');

/** Reconstruit le tableau de taux depuis nos constantes cumulatives `prefix`. */
function ratesFromOurs(src, prefix) {
  // lignes `const ENCOUNTER_CHANCE_<prefix>_MONS_(SLOT_n|TOTAL) = <rhs>;` dans l'ordre source
  const re = new RegExp(`ENCOUNTER_CHANCE_${prefix}_MONS_(SLOT_\\d+|TOTAL)\\s*=\\s*([^;]+);`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const ints = [...m[2].matchAll(/\d+/g)].map((x) => Number(x[0]));
    out.push(ints[ints.length - 1]);  // SLOT_0 = base ; sinon le dernier = l'incrément
  }
  return out;
}

const json = JSON.parse(fs.readFileSync(DECOMP_JSON, 'utf8'));
const fields = json.wild_encounter_groups[0].fields;
const byType = {};
for (const f of fields) byType[f.type] = f.encounter_rates;

const oursSrc = fs.readFileSync(OURS, 'utf8');
const findings = [];

function cmp(label, expected, got) {
  if (got.length !== expected.length) { findings.push(`${label} : longueur ours=${got.length} décomp=${expected.length}`); return; }
  for (let i = 0; i < expected.length; i++) if (expected[i] !== got[i]) findings.push(`${label} slot ${i} : décomp=${expected[i]} ours=${got[i]}`);
}

cmp('land', byType.land_mons, ratesFromOurs(oursSrc, 'LAND'));
// water ET rock_smash partagent ChooseWildMonIndex_WaterRock (mêmes taux décomp) → on confronte
// nos constantes WATER aux DEUX champs décomp.
cmp('water', byType.water_mons, ratesFromOurs(oursSrc, 'WATER'));
cmp('rock_smash(=water)', byType.rock_smash_mons, ratesFromOurs(oursSrc, 'WATER'));

console.log(`Taux de slot : land décomp=[${byType.land_mons}] · water décomp=[${byType.water_mons}]`);
if (findings.length === 0) { console.log('✅ Taux de slot de rencontre FIDÈLES au décomp (land 12 + water/rock 5).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
