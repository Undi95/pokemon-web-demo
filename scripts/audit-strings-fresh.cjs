#!/usr/bin/env node
/**
 * audit-strings-fresh.cjs — GARDE ANTI-DÉRIVE de strings.json (texte FR central).
 *
 * `strings.json` (13 611 clés, le texte battle/menu lu par getString) est extrait par
 * extract-strings.mjs de TOUTES les définitions de texte FR du décomp (5 passes :
 * `const u8 NAME[] = _("…")` dans src, + format asm `LABEL:: .string "…"` dans
 * data/text, data/*.s, data/scripts, data/maps/<map>/scripts.inc). Cet oracle
 * RE-SCANNE le décomp avec la MÊME logique et confronte au JSON commité → détecte une
 * DÉRIVE/STALENESS (décomp modifié, JSON pas régénéré ; comme friendship/Altering Cave).
 *
 *   node scripts/audit-strings-fresh.cjs   ·   exit 0 en phase / exit 1 dérive
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const JSON_F = path.join(ROOT, 'public/decomp/em/strings.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const fresh = {};

// Passe 1 : const u8 NAME[] = _("…" "…"); dans src/**/*.{c,h}
const reC = /const\s+u8\s+(\w+)\s*\[\]\s*=\s*_\(\s*((?:"(?:\\.|[^"\\])*"\s*)+)\s*\)\s*;/g;
const parseC = (text) => {
  let m;
  while ((m = reC.exec(text)) !== null) {
    fresh[m[1]] = [...m[2].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) => x[1]).join('');
  }
};

// Passe 2 : asm `LABEL:: .string "…"` (data/text, data/*.s, data/scripts, data/maps)
const parseInc = (text) => {
  let label = null, buf = [];
  const flush = () => { if (label && buf.length) fresh[label] = buf.join('').replace(/\$$/, ''); };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('@') || line.startsWith(';')) continue;
    const lm = line.match(/^(\w+):{1,2}\s*$/);
    if (lm) { flush(); label = lm[1]; buf = []; continue; }
    const sm = line.match(/^\.string\s+"(.*)"\s*$/);
    if (sm && label) buf.push(sm[1]);
  }
  flush();
};

const walk = (dir, fn) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    if (fs.statSync(p).isDirectory()) walk(p, fn); else fn(p, e);
  }
};

walk(path.join(DECOMP, 'src'), (p, n) => { if (n.endsWith('.c') || n.endsWith('.h')) parseC(fs.readFileSync(p, 'utf8')); });
walk(path.join(DECOMP, 'data/text'), (p, n) => { if (n.endsWith('.inc')) parseInc(fs.readFileSync(p, 'utf8')); });
for (const e of fs.readdirSync(path.join(DECOMP, 'data'))) { const p = path.join(DECOMP, 'data', e); if (fs.statSync(p).isFile() && e.endsWith('.s')) parseInc(fs.readFileSync(p, 'utf8')); }
walk(path.join(DECOMP, 'data/scripts'), (p, n) => { if (n.endsWith('.inc') || n.endsWith('.s')) parseInc(fs.readFileSync(p, 'utf8')); });
walk(path.join(DECOMP, 'data/maps'), (p, n) => { if (n.endsWith('.inc')) parseInc(fs.readFileSync(p, 'utf8')); });

const fk = Object.keys(fresh), ok = Object.keys(ours);
const added = fk.filter((k) => !(k in ours));
const removed = ok.filter((k) => !(k in fresh));
const changed = fk.filter((k) => k in ours && fresh[k] !== ours[k]);

console.log(`strings.json : ${ok.length} clés · re-scan décomp : ${fk.length} · changées : ${changed.length} · ajoutées : ${added.length} · retirées : ${removed.length}`);
const findings = [...changed.map((k) => `CHANGÉ ${k}`), ...added.map((k) => `MANQUE (décomp a) ${k}`), ...removed.map((k) => `EN TROP (décomp n'a plus) ${k}`)];
if (findings.length === 0) { console.log('✅ strings.json EN PHASE avec le décomp (re-scan identique, aucune dérive).'); process.exit(0); }
console.log(`❌ ${findings.length} dérive(s) de strings.json :\n`);
for (const f of findings.slice(0, 30)) {
  console.log('  ' + f);
  if (f.startsWith('CHANGÉ')) { const k = f.slice(7); console.log(`      json   = ${JSON.stringify(ours[k]).slice(0, 80)}\n      décomp = ${JSON.stringify(fresh[k]).slice(0, 80)}`); }
}
process.exit(1);
