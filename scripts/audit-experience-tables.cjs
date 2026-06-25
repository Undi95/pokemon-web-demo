#!/usr/bin/env node
/**
 * audit-experience-tables.cjs — ORACLE de fidélité de la COURBE D'EXPÉRIENCE.
 *
 * Confronte `public/decomp/em/experience-tables.json` (= gExperienceTables en jeu :
 * exp cumulée requise par niveau, par growth rate → timing de level-up) aux formules
 * décomp `EXP_*(n)` (experience_tables.h #defines). On RECODE les formules ici (avec
 * la sémantique de division ENTIÈRE C, troncatures imbriquées) = non-circulaire ;
 * niveaux 0 et 1 codés en dur à 0 et 1 (comme la table décomp). Tout écart = niveau
 * atteint trop tôt/tard en jeu.
 *
 *   node scripts/audit-experience-tables.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JSON_F = path.join(ROOT, 'public/decomp/em/experience-tables.json');
const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));

const MAX_LEVEL = 100;
const CUBE = (n) => n * n * n;
const SQUARE = (n) => n * n;
const fl = Math.floor;

// Transcription 1:1 des #defines (experience_tables.h:4-15). Division entière C.
const EXP = {
  GROWTH_MEDIUM_FAST: (n) => CUBE(n),
  GROWTH_FAST: (n) => fl(4 * CUBE(n) / 5),
  GROWTH_SLOW: (n) => fl(5 * CUBE(n) / 4),
  GROWTH_MEDIUM_SLOW: (n) => fl(6 * CUBE(n) / 5) - 15 * SQUARE(n) + 100 * n - 140,
  GROWTH_ERRATIC: (n) => {
    if (n <= 50) return fl((100 - n) * CUBE(n) / 50);
    if (n <= 68) return fl((150 - n) * CUBE(n) / 100);
    if (n <= 98) return fl(fl((1911 - 10 * n) / 3) * CUBE(n) / 500);
    return fl((160 - n) * CUBE(n) / 100);
  },
  GROWTH_FLUCTUATING: (n) => {
    if (n <= 15) return fl((fl((n + 1) / 3) + 24) * CUBE(n) / 50);
    if (n <= 36) return fl((n + 14) * CUBE(n) / 50);
    return fl((fl(n / 2) + 32) * CUBE(n) / 50);
  },
};
const expAt = (growth, n) => (n === 0 ? 0 : n === 1 ? 1 : EXP[growth](n));

const findings = [];
let checked = 0;
for (const growth of Object.keys(EXP)) {
  const arr = ours[growth];
  if (!arr) { findings.push(`${growth} : ABSENT de experience-tables.json`); continue; }
  if (arr.length !== MAX_LEVEL + 1) findings.push(`${growth} : longueur json=${arr.length} ≠ attendu=${MAX_LEVEL + 1}`);
  for (let n = 0; n <= MAX_LEVEL; n++) {
    const exp = expAt(growth, n);
    const got = arr[n];
    checked++;
    if (got !== exp && findings.length < 40) findings.push(`${growth}[L${n}] : json=${got} ≠ formule=${exp}`);
  }
}
// growth rates dans notre JSON non couverts par les formules ?
for (const k of Object.keys(ours)) if (!EXP[k]) findings.push(`${k} : présent dans le JSON mais inconnu des formules décomp`);

console.log(`Growth rates : ${Object.keys(EXP).length} · valeurs comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ experience-tables.json FIDÈLE aux formules EXP_* décomp (6 courbes × 101 niveaux).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de courbe d'exp (= level-up faux) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
