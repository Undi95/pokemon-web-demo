#!/usr/bin/env node
/**
 * audit-wild-encounters.cjs — ORACLE de fidélité des RENCONTRES SAUVAGES.
 *
 * Confronte `public/decomp/em/wild-encounters.json` (= quels Pokémon sauvages
 * apparaissent où, à quels niveaux, à quel taux → catchables par zone, lu par
 * wild_encounter.ts) au décomp `src/data/wild_encounters.json` (gWildMonHeaders).
 * Compare par map × catégorie (herbe/eau/éclate-roc/pêche) : encounter_rate + la
 * liste ordonnée des mons {min_level, max_level, species}. Tout écart = mauvais
 * Pokémon/niveau capturable.
 *
 *   node scripts/audit-wild-encounters.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_JSON = 'D:/Projet 1/decomps/pokeemeraude/src/data/wild_encounters.json';
const OURS_JSON = path.join(ROOT, 'public/decomp/em/wild-encounters.json');

const decompAll = JSON.parse(fs.readFileSync(DECOMP_JSON, 'utf8'));
const ours = JSON.parse(fs.readFileSync(OURS_JSON, 'utf8')).byMap;

// Groupe map-based gWildMonHeaders (for_maps: true)
const group = decompAll.wild_encounter_groups.find((g) => g.for_maps && g.label === 'gWildMonHeaders');
const CATS = [['land', 'land_mons'], ['water', 'water_mons'], ['rock_smash', 'rock_smash_mons'], ['fishing', 'fishing_mons']];

// 1:1 décomp GetCurrentMapWildMonHeaderId : PREMIER header matchant la map (défaut
// VAR_ALTERING_CAVE_WILD_SET=0). On dédoublonne par map (1re entrée) — seule
// MAP_ALTERING_CAVE a 9 tables, le défaut = gAlteringCave1.
const firstByMap = [];
const seen = new Set();
for (const enc of group.encounters) { if (seen.has(enc.map)) continue; seen.add(enc.map); firstByMap.push(enc); }

const cmpField = (a, b) => String(a) === String(b);
const findings = [];
let checked = 0, monsChecked = 0;
for (const enc of firstByMap) {
  const map = enc.map;
  const o = ours[map];
  if (!o) { findings.push(`${map} : ABSENT de wild-encounters.json`); continue; }
  checked++;
  for (const [ourKey, decompKey] of CATS) {
    const d = enc[decompKey], oc = o[ourKey];
    if (!d && !oc) continue;
    if (!!d !== !!oc) { findings.push(`${map}.${ourKey} : présence json=${!!oc} ≠ décomp=${!!d}`); continue; }
    if (!cmpField(d.encounter_rate, oc.encounter_rate)) findings.push(`${map}.${ourKey}.encounter_rate json=${oc.encounter_rate} ≠ décomp=${d.encounter_rate}`);
    const dm = d.mons || [], om = oc.mons || [];
    if (dm.length !== om.length) { findings.push(`${map}.${ourKey} : nb mons json=${om.length} ≠ décomp=${dm.length}`); continue; }
    for (let i = 0; i < dm.length; i++) {
      monsChecked++;
      if (!cmpField(dm[i].species, om[i].species) || !cmpField(dm[i].min_level, om[i].min_level) || !cmpField(dm[i].max_level, om[i].max_level)) {
        findings.push(`${map}.${ourKey}[${i}] json={${om[i].species},${om[i].min_level}-${om[i].max_level}} ≠ décomp={${dm[i].species},${dm[i].min_level}-${dm[i].max_level}}`);
      }
    }
  }
}

console.log(`Maps à rencontres (décomp, 1re/​map) : ${firstByMap.length} · comparées : ${checked} · mons vérifiés : ${monsChecked}`);
if (findings.length === 0) { console.log('✅ wild-encounters.json FIDÈLE au décomp (espèce/niveau/taux par zone, ordre inclus).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de rencontre sauvage (= catchables faux) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
