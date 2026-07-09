#!/usr/bin/env node
/* Trouve les exports de src/ jamais référencés ailleurs, et les CLASSE :
 *   (A) 1:1 port (commentaire "1:1 décomp" proche) → dette, GARDER
 *   (B) custom non-décomp → CANDIDAT mort
 *   (C) globalThis/window/registry → runtime-registered, GARDER
 * READ-ONLY. Heuristique — vérif manuelle obligatoire avant suppression. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function walk(dir, acc) {
  for (const n of fs.readdirSync(dir)) {
    const f = path.join(dir, n);
    if (fs.statSync(f).isDirectory()) walk(f, acc);
    else if (/\.tsx?$/.test(n) && !/\.d\.ts$/.test(n)) acc.push(f);
  }
  return acc;
}
// Univers de recherche = src + harness + include (tout le code vivant)
const files = [];
for (const d of ['src', 'harness', 'include']) walk(path.join(ROOT, d), files);
const text = {};
for (const f of files) text[f] = fs.readFileSync(f, 'utf-8');

// Concat global pour comptage de références (hors fichier défini)
// On garde par-fichier pour exclure le fichier de définition.

// Extraction des exports nommés par fichier
const EXPORT_RE = /^\s*export\s+(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm;
const EXPORT_LIST_RE = /^\s*export\s*\{([^}]+)\}/gm; // export { a, b as c }

const defs = []; // {name, file}
for (const f of files) {
  const code = text[f];
  let m;
  EXPORT_RE.lastIndex = 0;
  while ((m = EXPORT_RE.exec(code))) defs.push({ name: m[1], file: f });
  EXPORT_LIST_RE.lastIndex = 0;
  while ((m = EXPORT_LIST_RE.exec(code))) {
    // ignore les re-exports `export {..} from` (surface, pas une def morte)
    const tail = code.slice(m.index, m.index + m[0].length + 30);
    if (/\}\s*from/.test(tail)) continue;
    for (const part of m[1].split(',')) {
      const nm = part.trim().split(/\s+as\s+/).pop().trim();
      if (/^[A-Za-z_$][\w$]*$/.test(nm)) defs.push({ name: nm, file: f });
    }
  }
}

// Dédup (name+file)
const seen = new Set();
const uniqDefs = defs.filter((d) => { const k = d.name + '|' + d.file; if (seen.has(k)) return false; seen.add(k); return true; });

// Pour chaque export : compter références dans les AUTRES fichiers (word-boundary)
function externalRefCount(name, defFile) {
  const re = new RegExp('\\b' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
  let n = 0;
  for (const f of files) {
    if (f === defFile) continue;
    if (re.test(text[f])) { n++; if (n > 1) break; }
  }
  return n;
}
// Référencé via globalThis/window dans tout le code ?
function isRuntimeRegistered(name) {
  const re = new RegExp('(globalThis|window|self)\\s*(\\.|\\[[\'"])\\s*' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  for (const f of files) if (re.test(text[f])) return true;
  // patterns registry : registerSpecial('Name' / commandsTable[..] = Name / gScriptCmdTable
  return false;
}
// Le fichier de def a-t-il un marqueur 1:1 décomp ?
function is1to1(defFile) {
  return /1:1|décomp|decomp|miroir|mirror/i.test(text[defFile].slice(0, 1200));
}

const candidates = [];
for (const d of uniqDefs) {
  if (externalRefCount(d.name, d.file) > 0) continue; // utilisé ailleurs
  const runtime = isRuntimeRegistered(d.name);
  const oneToOne = is1to1(d.file);
  candidates.push({ name: d.name, file: path.relative(ROOT, d.file).replace(/\\/g, '/'), runtime, oneToOne });
}

// Classement
const C = candidates.filter((c) => c.runtime);            // garder (runtime)
const A = candidates.filter((c) => !c.runtime && c.oneToOne); // garder (1:1 debt)
const B = candidates.filter((c) => !c.runtime && !c.oneToOne); // CANDIDAT mort

console.log(`Exports nommés analysés : ${uniqDefs.length}`);
console.log(`Jamais référencés ailleurs : ${candidates.length}`);
console.log(`  (C) runtime-registered (globalThis/window) → GARDER : ${C.length}`);
console.log(`  (A) fichier 1:1 décomp → dette, GARDER : ${A.length}`);
console.log(`  (B) custom non-1:1 → CANDIDAT MORT : ${B.length}`);
console.log('');
console.log('=== (B) CANDIDATS MORTS (custom, non-runtime, non-1:1) — groupé par fichier ===');
const byFile = {};
for (const c of B) (byFile[c.file] ||= []).push(c.name);
for (const f of Object.keys(byFile).sort()) console.log(`  ${f}\n     ${byFile[f].join(', ')}`);

fs.writeFileSync(path.join(ROOT, 'audit-reports', 'dead-exports.json'), JSON.stringify({ analyzed: uniqDefs.length, candidates, A, B, C }, null, 2));
console.log('\n(JSON → audit-reports/dead-exports.json)');
