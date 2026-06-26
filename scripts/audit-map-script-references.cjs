#!/usr/bin/env node
/**
 * audit-map-script-references.cjs — ORACLE des points d'entrée map → script.
 *
 * Chaque map (public/decomp/em/maps/*.json) déclenche des scripts via ses events :
 *   - object_events[].script  (PNJ : script d'interaction)
 *   - coord_events[].script    (trigger : marche sur la case)
 *   - bg_events[].script       (panneau : examiner)
 * Si le script référencé n'est PAS défini (_all.json), interagir avec ce PNJ/panneau/trigger
 * no-op silencieusement → événement cassé. Cet oracle vérifie que TOUTE référence de script
 * d'ENTRÉE depuis les maps résout vers un script défini → graphe d'entrée FERMÉ. (Complète
 * audit-script-references qui couvre le graphe INTERNE goto/call/msgbox.)
 *
 *   node scripts/audit-map-script-references.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/scripts/_all.json'), 'utf8'));
const definedScripts = new Set(Object.keys(all.scripts));
const mapsDir = path.join(ROOT, 'public/decomp/em/maps');
const NOSCRIPT = new Set(['0', '0x0', 'NULL', '', 'null']); // « pas de script »

const ref = new Map(); // script -> {count, map, kind}
function note(s, map, kind) {
  if (typeof s !== 'string' || NOSCRIPT.has(s)) return;
  if (!ref.has(s)) ref.set(s, { c: 0, m: map, k: kind });
  ref.get(s).c++;
}
const files = fs.readdirSync(mapsDir).filter((f) => f.endsWith('.json'));
for (const f of files) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8')); } catch { continue; }
  const m = f.replace('.json', '');
  for (const oe of j.object_events || []) note(oe.script, m, 'PNJ');
  for (const ce of j.coord_events || []) note(ce.script, m, 'trigger');
  for (const be of j.bg_events || []) note(be.script, m, 'panneau');
}

const findings = [];
let checked = 0;
for (const [label, info] of [...ref.entries()].sort()) {
  checked++;
  if (!definedScripts.has(label))
    findings.push(`${label} : script ${info.k} (×${info.c}, map ${info.m}) NON défini → ${info.k} cassé`);
}

console.log(`Points d'entrée map → script confrontés : ${checked} scripts distincts (${files.length} maps) vs scripts définis.`);
if (findings.length === 0) { console.log('✅ Graphe d\'entrée map → script FERMÉ (tout PNJ/panneau/trigger référence un script défini).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
