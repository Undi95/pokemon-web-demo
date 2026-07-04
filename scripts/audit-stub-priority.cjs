#!/usr/bin/env node
/**
 * audit-stub-priority.cjs — KILL-LIST priorisée (2026-07-04).
 *
 * Croise `audit-reports/stub-bodies.json` (l'anti-stub : fonctions au corps
 * suspect) avec la DÉCOMP : pour chaque suspect au nom C-like, compte ses
 * occurrences dans decomps/pokeemeraude/src/*.c = proxy d'impact (une fn
 * appelée 40× dans le C et stub chez nous = trou majeur ; 0× = faux positif
 * ou helper local). Sortie triée par impact décroissant.
 *
 * Usage :
 *   node scripts/audit-stub-bodies.cjs --json       (d'abord, régénère les suspects)
 *   node scripts/audit-stub-priority.cjs            → top 80
 *   node scripts/audit-stub-priority.cjs --min 10   → seuls les ≥10 refs C
 *   node scripts/audit-stub-priority.cjs --json     → audit-reports/stub-priority.json
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_SRC = path.resolve(ROOT, '..', 'decomps', 'pokeemeraude', 'src');
const STUBS = path.join(ROOT, 'audit-reports', 'stub-bodies.json');

const minArg = (() => { const i = process.argv.indexOf('--min'); return i >= 0 ? Number(process.argv[i + 1]) : 1; })();
const asJson = process.argv.includes('--json');

if (!fs.existsSync(STUBS)) {
  console.error('audit-reports/stub-bodies.json absent — lancer d\'abord : node scripts/audit-stub-bodies.cjs --json');
  process.exit(1);
}
const { report } = JSON.parse(fs.readFileSync(STUBS, 'utf8'));

// Corpus C : concat de tous les .c (+ .h pour les macros appelées).
let corpus = '';
for (const f of fs.readdirSync(DECOMP_SRC)) {
  if (f.endsWith('.c')) corpus += fs.readFileSync(path.join(DECOMP_SRC, f), 'utf8');
}

// Suspects au nom C-like (PascalCase / snake exporté) — les _helpers locaux TS sont ignorés.
const rows = [];
const seen = new Set();
for (const [file, hits] of Object.entries(report)) {
  for (const h of hits) {
    if (h.name.startsWith('_') || !/^[A-Z]/.test(h.name)) continue;
    if (seen.has(h.name)) continue; // 1 ligne par nom (fichier principal = 1er rencontré)
    seen.add(h.name);
    const refs = (corpus.match(new RegExp(`\\b${h.name}\\b`, 'g')) || []).length;
    if (refs >= minArg) rows.push({ name: h.name, refsC: refs, file, line: h.line, reasons: h.reasons });
  }
}
rows.sort((a, b) => b.refsC - a.refsC);

if (asJson) {
  const out = path.join(ROOT, 'audit-reports', 'stub-priority.json');
  fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), total: rows.length, rows }, null, 1));
  console.log(`écrit: ${out} (${rows.length} entrées ≥${minArg} refs C)`);
} else {
  for (const r of rows.slice(0, 80)) {
    console.log(`${String(r.refsC).padStart(4)} refs C  ${r.name}  (${r.file}:${r.line})  [${r.reasons.join(' ')}]`);
  }
  console.log(`\nTOTAL ≥${minArg} refs : ${rows.length} (top 80 affichés ; --json pour le rapport complet)`);
}
