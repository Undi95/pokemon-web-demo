#!/usr/bin/env node
/**
 * audit-friendship-modifiers.cjs — ORACLE de la table de modificateurs d'AMITIÉ.
 *
 * Confronte `_SFRIENDSHIP_EVENT_MODIFIERS` (src/engine/battle/party-storage.ts) au décomp
 * `sFriendshipEventModifiers[][3]` (pokemon.c:2094). 9 événements × 3 brackets de friendship
 * (bas <100 / moyen <200 / haut) → delta signé appliqué à `mon.friendship`. Pilote :
 *   - les ÉVOLUTIONS par amitié (Évoli→Lumi/Noctali, etc.),
 *   - la puissance de RETOUR / FRUSTRATION (∝ friendship),
 *   - la perte d'amitié au KO.
 * Une valeur fausse = gain/perte d'amitié faux → évolution + dégâts faux.
 *
 *   node scripts/audit-friendship-modifiers.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/pokemon.c';
const OURS = path.join(ROOT, 'src/engine/battle/party-storage.ts');

/** Décomp : `[FRIENDSHIP_EVENT_X] = { a, b, c },` dans l'ordre enum. */
function parseDecomp(src) {
  const start = src.indexOf('sFriendshipEventModifiers[][3]');
  const body = src.slice(start, src.indexOf('};', start));
  const out = [];
  for (const m of body.matchAll(/\[FRIENDSHIP_EVENT_([A-Z0-9_]+)\]\s*=\s*\{\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\}/g)) {
    out.push({ ev: m[1], v: [Number(m[2]), Number(m[3]), Number(m[4])] });
  }
  return out;
}

/** Notre table : `[ a, b, c],  // FRIENDSHIP_EVENT_X = i`. */
function parseOurs(src) {
  const start = src.indexOf('_SFRIENDSHIP_EVENT_MODIFIERS');
  const body = src.slice(start, src.indexOf('];', start));
  const out = [];
  for (const m of body.matchAll(/\[\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\][^\n]*FRIENDSHIP_EVENT_([A-Z0-9_]+)/g)) {
    out.push({ ev: m[4], v: [Number(m[1]), Number(m[2]), Number(m[3])] });
  }
  return out;
}

const decomp = parseDecomp(fs.readFileSync(DECOMP, 'utf8'));
const ours = parseOurs(fs.readFileSync(OURS, 'utf8'));

const findings = [];
if (decomp.length !== ours.length) findings.push(`longueur : décomp=${decomp.length} ours=${ours.length}`);
const n = Math.min(decomp.length, ours.length);
for (let i = 0; i < n; i++) {
  const d = decomp[i], o = ours[i];
  if (d.ev !== o.ev) { findings.push(`[${i}] événement : décomp=${d.ev} ours=${o.ev}`); continue; }
  for (let k = 0; k < 3; k++) if (d.v[k] !== o.v[k]) findings.push(`[${i}] ${d.ev} bracket ${k} : décomp=${d.v[k]} ours=${o.v[k]}`);
}

console.log(`Table amitié : décomp=${decomp.length} · ours=${ours.length} événements × 3 brackets`);
if (findings.length === 0) { console.log('✅ sFriendshipEventModifiers FIDÈLE au décomp (9 événements × 3 brackets 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
