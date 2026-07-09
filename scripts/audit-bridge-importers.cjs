#!/usr/bin/env node
/* Audit READ-ONLY DURCI : pour chaque symbole exporté par decomp-bridge.ts, compte
 * les importeurs DEPUIS le bridge (multi-ligne aware). Strip des commentaires dans
 * les blocs + validation stricte d'identifiants (sinon les commentaires des blocs
 * `export {…} from` sont capturés comme faux symboles → décompte pourri → un sweep
 * à l'aveugle casserait des symboles VIVANTS, ex. FreeAllSpritePalettes). */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BRIDGE = path.join(ROOT, 'harness/runtime/decomp-bridge.ts');
const ID = /^[A-Za-z_$][\w$]*$/;

/** Extrait les identifiants d'un contenu `{…}`. side='export' → nom APRÈS `as`
 *  (nom exposé) ; side='import' → nom AVANT `as` (nom côté source = bridge). */
function names(block, side) {
  return block
    .replace(/\/\*[\s\S]*?\*\//g, '')   // commentaires /* */
    .replace(/\/\/[^\n]*/g, '')          // commentaires //
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (m) return side === 'export' ? m[2] : m[1];
      return p.replace(/^type\s+/, '').replace(/\s+as\s+.*/, '').trim();
    })
    .filter((n) => ID.test(n));
}

// ── 1. Exports du bridge (own-defs + ré-exports) ────────────────────────────
const bsrc = fs.readFileSync(BRIDGE, 'utf8');
const bridgeExports = new Set();
const reexportNames = new Set();
for (const m of bsrc.matchAll(/^\s*export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) bridgeExports.add(m[1]);
for (const m of bsrc.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
  for (const n of names(m[1], 'export')) { bridgeExports.add(n); reexportNames.add(n); }
}

// ── 2. Walk + tally des imports DEPUIS le bridge ────────────────────────────
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.ts') && p !== BRIDGE) files.push(p);
  }
})(ROOT);

const tally = new Map();
let nsImporters = [];
const importBlock = /import\s+(?:type\s+)?(?:\{([^}]*)\}|\*\s+as\s+[A-Za-z_$][\w$]*)\s*from\s*['"]([^'"]*decomp-bridge)['"]/g;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(importBlock)) {
    if (!m[1]) { nsImporters.push(path.relative(ROOT, f)); continue; }
    for (const n of names(m[1], 'import')) {
      if (!tally.has(n)) tally.set(n, new Set());
      tally.get(n).add(path.relative(ROOT, f));
    }
  }
}

// ── 3. Rapport ──────────────────────────────────────────────────────────────
const rows = [...bridgeExports].map((s) => ({ s, n: tally.get(s)?.size || 0, re: reexportNames.has(s) })).sort((a, b) => b.n - a.n);
const dead = rows.filter((r) => r.n === 0);
const alive = rows.filter((r) => r.n > 0);
const deadReexports = dead.filter((r) => r.re);
const deadOwnDefs = dead.filter((r) => !r.re);
console.log(`Exports du bridge : ${bridgeExports.size} (${reexportNames.size} ré-exports, ${bridgeExports.size - reexportNames.size} own-defs)`);
console.log(`  VIVANTS (≥1 importeur bridge) : ${alive.length}`);
console.log(`  MORTS ré-exports (sweep SÛR, original conservé) : ${deadReexports.length}`);
console.log(`  MORTS own-defs (⚠ vérifier usage interne/substrat avant retrait) : ${deadOwnDefs.length}`);
console.log(`  Namespace imports : ${[...new Set(nsImporters)].join(', ') || 'aucun'}`);

const unknown = [...tally.keys()].filter((k) => !bridgeExports.has(k));
console.log(`\n⚠ importés du bridge mais NON détectés comme export (${unknown.length}) : ${unknown.join(', ') || 'aucun'}`);

console.log(`\n── VIVANTS (${alive.length}) : importeurs · symbole ──`);
for (const r of alive) console.log(`  ${String(r.n).padStart(3)}  ${r.s}${r.re ? ' (re-export)' : ''}`);

// Écrit les listes pour piloter un sweep sûr.
const OUT = path.join(ROOT, 'audit-reports/bridge-dead-reexports.txt');
fs.writeFileSync(OUT, deadReexports.map((r) => r.s).join('\n') + '\n');
console.log(`\n${deadReexports.length} dead re-exports écrits dans audit-reports/bridge-dead-reexports.txt`);
