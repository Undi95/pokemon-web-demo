// Audit pokemon.c -> quelle fn existe (et ou) dans notre src/. In-memory (Windows-safe).
const fs = require('fs');
const path = require('path');
const ROOT = 'D:/Projet 1/pokemon-web-demo';
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/pokemon.c';

const c = fs.readFileSync(DECOMP, 'utf8');
const lines = c.split('\n');
const fns = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^(static\s+)?(const\s+)?[A-Za-z_][A-Za-z0-9_]*[ *]+[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(l) && !l.trim().endsWith(';')) {
    const m = l.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (m) {
      const name = m[1];
      if (['if', 'for', 'while', 'switch', 'sizeof', 'return', 'do', 'else'].includes(name)) continue;
      fns.push(name);
    }
  }
}
const uniq = [...new Set(fns)];

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.ts')) acc.push(p);
  }
  return acc;
}
const tsFiles = walk(path.join(ROOT, 'src'), []);
const contents = tsFiles.map(f => ({
  f: path.relative(ROOT, f).split(path.sep).join('/'),
  t: fs.readFileSync(f, 'utf8'),
}));

function findFn(name) {
  const re = new RegExp(
    '(function\\s+' + name + '\\b' +
    '|\\b' + name + '\\s*[=:]\\s*(\\(|function|async)' +
    '|registerSpecial\\([\'"]' + name + '[\'"])'
  );
  const hits = [];
  for (const { f, t } of contents) if (re.test(t)) hits.push(f);
  return hits;
}

let mirror = 0, elsewhere = 0, missing = 0;
const rows = [];
for (const name of uniq) {
  const hits = findFn(name);
  let status;
  if (hits.some(f => f === 'src/pokemon.ts')) { status = 'MIRROR'; mirror++; }
  else if (hits.length) { status = 'AILLEURS'; elsewhere++; }
  else { status = 'MANQUANT'; missing++; }
  rows.push({ name, status, where: hits.join(', ') });
}

console.log('=== pokemon.c : ' + uniq.length + ' fns detectees ===');
console.log('MIRROR(pokemon.ts)=' + mirror + '  AILLEURS=' + elsewhere + '  MANQUANT=' + missing);
console.log('\n--- AILLEURS (groupe par fichier, a consolider vers src/pokemon.ts) ---');
const byFile = {};
for (const r of rows.filter(r => r.status === 'AILLEURS')) (byFile[r.where] ||= []).push(r.name);
for (const [file, names] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
  console.log('[' + names.length + '] ' + file + '\n      ' + names.join(', '));
}
console.log('\n--- MANQUANT (' + missing + ') ---');
console.log(rows.filter(r => r.status === 'MANQUANT').map(r => r.name).join(', '));
fs.writeFileSync(path.join(ROOT, 'audit-reports/pokemon-c-audit.json'), JSON.stringify(rows, null, 2));
