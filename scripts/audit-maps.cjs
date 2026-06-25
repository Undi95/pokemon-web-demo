#!/usr/bin/env node
/**
 * audit-maps.cjs — ORACLE de fidélité de la STRUCTURE DES CARTES.
 *
 * Confronte nos `public/decomp/em/maps/<Map>.json` (= structure du monde lue par le
 * moteur : warps/portes, connexions, object_events/PNJ, coord_events, bg_events,
 * layout/musique/météo…) aux `data/maps/<Map>/map.json` du décomp. Deep-equal canonique
 * (clés triées). Tout écart = monde faux (mauvaise destination de porte, PNJ manquant…).
 *
 *   node scripts/audit-maps.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUR_DIR = path.join(ROOT, 'public/decomp/em/maps');
const DEC_DIR = 'D:/Projet 1/decomps/pokeemeraude/data/maps';

// JSON canonique : clés d'objet triées (ordre indifférent), ordre de tableau préservé.
const canon = (v) => {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
};

const findings = [];
let checked = 0;
const ourFiles = fs.readdirSync(OUR_DIR).filter((f) => f.endsWith('.json'));
for (const f of ourFiles) {
  const name = f.replace(/\.json$/, '');
  const decP = path.join(DEC_DIR, name, 'map.json');
  if (!fs.existsSync(decP)) { findings.push(`${name} : pas de map.json au décomp`); continue; }
  const a = JSON.parse(fs.readFileSync(path.join(OUR_DIR, f), 'utf8'));
  const b = JSON.parse(fs.readFileSync(decP, 'utf8'));
  checked++;
  if (canon(a) === canon(b)) continue;
  // localise les clés divergentes
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const diffKeys = keys.filter((k) => canon(a[k]) !== canon(b[k]));
  findings.push(`${name} : champs divergents = ${diffKeys.join(', ')}`);
}

console.log(`Cartes comparées : ${checked} / ${ourFiles.length}`);
if (findings.length === 0) { console.log('✅ maps FIDÈLES au décomp (warps/connexions/object-events/coord/bg, deep-equal sur toutes les cartes).'); process.exit(0); }
console.log(`❌ ${findings.length} carte(s) divergente(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
