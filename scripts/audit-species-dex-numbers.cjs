#!/usr/bin/env node
/**
 * audit-species-dex-numbers.cjs — ORACLE de fidélité des NUMÉROS de Pokédex par espèce.
 *
 * Confronte `public/decomp/em/species-dex-numbers.json` (numéro National + Hoenn de chaque
 * espèce → affichage Pokédex, Repeat Ball, complétion Hoenn) au décomp : tables
 * `sSpeciesTo{National,Hoenn}PokedexNum` (pokemon.c, `SPECIES_TO_NATIONAL(X)` →
 * `[SPECIES_X-1] = NATIONAL_DEX_X`) + enums NATIONAL_DEX/HOENN_DEX (pokedex.h,
 * séquentiels). Tout écart = mauvais numéro de Pokédex.
 *
 *   node scripts/audit-species-dex-numbers.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PK = 'D:/Projet 1/decomps/pokeemeraude/src/pokemon.c';
const DEX_H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/pokedex.h';

const ours = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/species-dex-numbers.json'), 'utf8'));
const pkSrc = fs.readFileSync(PK, 'utf8');
const dexSrc = fs.readFileSync(DEX_H, 'utf8');

// Résout un enum séquentiel à partir de son 1er membre (PREFIX_NONE)
const parseEnum = (prefix) => {
  const start = dexSrc.indexOf(prefix + '_NONE');
  const body = dexSrc.slice(dexSrc.lastIndexOf('{', start) + 1, dexSrc.indexOf('};', start));
  const out = {}; let v = 0;
  for (let line of body.split(',')) {
    line = line.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const m = line.match(new RegExp('^(' + prefix + '_[A-Z0-9_]+)\\s*(?:=\\s*(\\d+))?$'));
    if (!m) continue;
    if (m[2] !== undefined) v = Number(m[2]);
    out[m[1]] = v; v++;
  }
  return out;
};
const NAT = parseEnum('NATIONAL_DEX');
const HOENN = parseEnum('HOENN_DEX');

// Ordre des espèces dans les tables (SPECIES_TO_NATIONAL(X))
const tableSpecies = (macro) => {
  const a = pkSrc.indexOf(`s${macro === 'NATIONAL' ? 'SpeciesToNationalPokedexNum' : 'SpeciesToHoennPokedexNum'}[`);
  const body = pkSrc.slice(pkSrc.indexOf('{', a), pkSrc.indexOf('};', a));
  return [...body.matchAll(new RegExp('SPECIES_TO_' + macro + '\\((\\w+)\\)', 'g'))].map((m) => m[1]);
};
const natOrder = tableSpecies('NATIONAL');
const hoennOrder = tableSpecies('HOENN');

const findings = [];
let checked = 0;
let skipped = 0;
const checkTable = (order, enumMap, dexPrefix, field) => {
  for (const name of order) {
    if (/^OLD_UNOWN_/.test(name) || name === 'NONE') { skipped++; continue; } // placeholders non modélisés
    const sp = 'SPECIES_' + name;
    const expect = enumMap[dexPrefix + '_' + name];
    if (expect === undefined) { findings.push(`${dexPrefix}_${name} : absent de l'enum`); continue; }
    const o = ours[sp];
    if (!o) { findings.push(`${sp} : absent de species-dex-numbers.json`); continue; }
    checked++;
    if (o[field] !== expect) findings.push(`${sp}.${field} : json=${o[field]} ≠ décomp=${expect}`);
  }
};
checkTable(natOrder, NAT, 'NATIONAL_DEX', 'national');
checkTable(hoennOrder, HOENN, 'HOENN_DEX', 'hoenn');

console.log(`Espèces : national ${natOrder.length} · hoenn ${hoennOrder.length} · valeurs comparées : ${checked}`);
if (findings.length === 0) { console.log('✅ species-dex-numbers.json FIDÈLE au décomp (numéros National + Hoenn 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de numéro Pokédex :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
