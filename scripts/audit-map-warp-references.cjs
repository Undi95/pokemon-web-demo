#!/usr/bin/env node
/**
 * audit-map-warp-references.cjs — ORACLE de connectivité des maps (warps + connexions).
 *
 * Chaque map (public/decomp/em/maps/*.json) se relie à d'autres maps par :
 *   - warp_events[].dest_map  (porte/escalier/sortie → map de destination)
 *   - connections[].map        (bord de carte → map adjacente)
 * Si la map référencée n'est PAS définie (absente de map-ids.json), le warp/la connexion mène
 * nulle part = joueur bloqué / transition cassée. Cet oracle vérifie que TOUTE destination de warp
 * et toute map de connexion résout vers une map définie → graphe de connectivité FERMÉ. (Complète
 * audit-maps qui deep-equal les données de warp/connexion vs décomp, et audit-map-script-references
 * pour les scripts d'entrée.)
 *
 *   node scripts/audit-map-warp-references.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const mapIds = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/map-ids.json'), 'utf8'))));
const mapsDir = path.join(ROOT, 'public/decomp/em/maps');
// destinations spéciales (résolues au runtime, pas une map statique) → exclues
const SPECIAL = new Set(['MAP_DYNAMIC', 'MAP_UNDEFINED', 'MAP_NONE', '0', 'NULL', '']);

const ref = new Map(); // map dest -> {count, src, kind}
function note(dest, src, kind) {
  if (typeof dest !== 'string' || SPECIAL.has(dest)) return;
  if (!ref.has(dest)) ref.set(dest, { c: 0, s: src, k: kind });
  ref.get(dest).c++;
}
const files = fs.readdirSync(mapsDir).filter((f) => f.endsWith('.json'));
for (const f of files) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8')); } catch { continue; }
  const m = f.replace('.json', '');
  for (const w of j.warp_events || []) note(w.dest_map, m, 'warp');
  for (const c of j.connections || []) note(c.map, m, 'connexion');
}

const findings = [];
let checked = 0;
for (const [dest, info] of [...ref.entries()].sort()) {
  checked++;
  if (!mapIds.has(dest))
    findings.push(`${dest} : ${info.k} depuis ${info.s} (×${info.c}) → map NON définie (warp/connexion cassé)`);
}

console.log(`Connectivité map confrontée : ${checked} maps de destination distinctes (warp+connexion) sur ${files.length} maps vs ${mapIds.size} maps définies.`);
if (findings.length === 0) { console.log('✅ Graphe de connectivité map FERMÉ (tout warp/connexion mène à une map définie).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
