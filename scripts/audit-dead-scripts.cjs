#!/usr/bin/env node
/* Classe les fichiers de scripts/ : protégés (package.json / mémoire / référencés
 * par un autre script) vs candidats morts (one-off appliqués, réf. code supprimé).
 * READ-ONLY : ne supprime rien, produit juste un rapport. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCRIPTS = path.join(ROOT, 'scripts');

function listScripts(dir, acc, rel = '') {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const r = rel ? rel + '/' + name : name;
    if (fs.statSync(full).isDirectory()) listScripts(full, acc, r);
    else if (/\.(mjs|cjs|js|py)$/.test(name)) acc.push(r);
  }
  return acc;
}
const all = listScripts(SCRIPTS, []).sort();

// 1) Référencés par package.json
const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8');
// 2) Référencés par MEMORY.md (mémoire user) — chemin connu
const MEM = 'C:/Users/Undi/.claude/projects/D--Projet-1-pokemon-web-demo/memory';
let memText = '';
try { for (const f of fs.readdirSync(MEM)) if (f.endsWith('.md')) memText += fs.readFileSync(path.join(MEM, f), 'utf-8'); } catch {}
// 3) Référencés par docs/ + README
let docsText = '';
try {
  const walkDocs = (d) => { for (const f of fs.readdirSync(d)) { const fp = path.join(d, f); if (fs.statSync(fp).isDirectory()) walkDocs(fp); else if (f.endsWith('.md')) docsText += fs.readFileSync(fp, 'utf-8'); } };
  walkDocs(path.join(ROOT, 'docs'));
  if (fs.existsSync(path.join(ROOT, 'README.md'))) docsText += fs.readFileSync(path.join(ROOT, 'README.md'), 'utf-8');
} catch {}
// 4) Référencés par un AUTRE script (require/import/spawn d'un basename)
const scriptTexts = {};
for (const s of all) scriptTexts[s] = fs.readFileSync(path.join(SCRIPTS, s), 'utf-8');

function basename(s) { return s.replace(/^.*\//, ''); }
function refByOtherScript(s) {
  const b = basename(s);
  for (const [other, txt] of Object.entries(scriptTexts)) {
    if (other === s) continue;
    if (txt.includes(b)) return other;
  }
  return null;
}

const PROTECT_PREFIX = /^(extract-|audit-|compile-|transpile-|cartograph-|gfx-verify-|render-|post-transpile)/;
const ONEOFF_PREFIX = /^(migrate-|fix-|merge-|move-|reroute-|sweep-|strip-|fold-|union-|diff-|list-|inspect-|cmp-|tally-|replace-|file-gap|gap-sweep|classify-)/;

const rows = [];
for (const s of all) {
  const b = basename(s);
  const inPkg = pkg.includes(b);
  const inMem = memText.includes(b);
  const inDocs = docsText.includes(b);
  const byScript = refByOtherScript(s);
  const protectedReason = inPkg ? 'package.json' : inMem ? 'memory' : inDocs ? 'docs' : byScript ? ('script:' + byScript) : null;
  rows.push({ s, b, protectedReason, oneoff: ONEOFF_PREFIX.test(b), pipeline: PROTECT_PREFIX.test(b) });
}

const protectedRows = rows.filter((r) => r.protectedReason);
const deadCandidates = rows.filter((r) => !r.protectedReason);

console.log(`Total scripts : ${all.length}`);
console.log(`Protégés (réf package.json/memory/docs/autre-script) : ${protectedRows.length}`);
console.log(`Candidats NON référencés : ${deadCandidates.length}`);
console.log('');
console.log('=== CANDIDATS NON RÉFÉRENCÉS (one-off d\'abord) ===');
const oneoff = deadCandidates.filter((r) => r.oneoff);
const other = deadCandidates.filter((r) => !r.oneoff);
console.log(`-- one-off (migrate/fix/merge/move/...) : ${oneoff.length} --`);
for (const r of oneoff) console.log('  ' + r.s);
console.log(`-- autres non référencés : ${other.length} --`);
for (const r of other) console.log('  ' + r.s + (r.pipeline ? '   [prefix pipeline mais NON réf package.json]' : ''));

fs.writeFileSync(path.join(ROOT, 'audit-reports', 'dead-scripts.json'), JSON.stringify({ total: all.length, protected: protectedRows, deadCandidates }, null, 2));
console.log('');
console.log('(JSON → audit-reports/dead-scripts.json)');
