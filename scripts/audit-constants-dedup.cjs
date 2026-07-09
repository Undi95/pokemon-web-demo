#!/usr/bin/env node
// audit-constants-dedup.cjs — réconciliation du fourre-tout engine/battle/constants.ts
// avec les headers-miroirs auto-générés include/**/*.ts.
// Pour chaque `export const NAME = <expr>` du fourre-tout : cherche NAME dans include/ ;
// verdict = DUP-SAME (ré-export possible) / DUP-DIFF (conflit à examiner) / ABSENT
// (à déplacer vers le header-miroir de sa section). Usage : node scripts/audit-constants-dedup.cjs
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const SRC = path.join(root, 'src/engine/battle/constants.ts');
const src = fs.readFileSync(SRC, 'utf8');

// Collecte include/**/*.ts → { name: { file, raw } }
const incIndex = new Map();
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.ts')) {
      const txt = fs.readFileSync(p, 'utf8');
      const re = /export const ([A-Za-z0-9_]+)\s*=\s*([^;]+);/g;
      let m;
      while ((m = re.exec(txt))) {
        if (!incIndex.has(m[1])) incIndex.set(m[1], { file: path.relative(root, p), raw: m[2].trim() });
      }
    }
  }
}
walk(path.join(root, 'include'));

// Évalue une expr numérique simple (1 << 3, 0xF00, 42, sommes) — sinon null.
function evalNum(raw) {
  if (!/^[\d\sx()<>|&+\-*/A-Fa-f]+$/.test(raw)) return null;
  try { return Function('"use strict"; return (' + raw + ');')(); } catch { return null; }
}

const re = /export const ([A-Za-z0-9_]+)\s*=\s*([^;]+);/g;
let m; const rows = [];
while ((m = re.exec(src))) {
  const [, name, raw] = m;
  const inc = incIndex.get(name);
  if (!inc) { rows.push([name, 'ABSENT', raw.trim(), '']); continue; }
  const a = evalNum(raw.trim()), b = evalNum(inc.raw);
  if (a !== null && b !== null && a === b) rows.push([name, 'DUP-SAME', String(a), inc.file]);
  else if (raw.trim() === inc.raw) rows.push([name, 'DUP-SAME', raw.trim(), inc.file]);
  else rows.push([name, 'DUP-DIFF', `${raw.trim()} ≠ ${inc.raw}`, inc.file]);
}

const counts = { 'DUP-SAME': 0, 'DUP-DIFF': 0, ABSENT: 0 };
for (const r of rows) counts[r[1]]++;
console.log(`constants.ts : ${rows.length} exports const — DUP-SAME ${counts['DUP-SAME']} · DUP-DIFF ${counts['DUP-DIFF']} · ABSENT ${counts.ABSENT}\n`);
for (const [name, verdict, val, file] of rows) {
  if (verdict !== 'DUP-SAME') console.log(`${verdict.padEnd(8)} ${name.padEnd(36)} ${val} ${file}`);
}
const out = rows.map((r) => r.join('\t')).join('\n');
fs.writeFileSync(path.join(root, 'audit-reports/constants-dedup.tsv'), out);
console.log('\n→ audit-reports/constants-dedup.tsv (complet)');
