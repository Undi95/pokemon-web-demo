#!/usr/bin/env node
/* Sweep des ré-exports MORTS de decomp-bridge.ts (liste fiable produite par
 * audit-bridge-importers.cjs → audit-reports/bridge-dead-reexports.txt).
 * Réécrit chaque bloc `export {…} from '…'` en ne gardant QUE les symboles vivants ;
 * supprime les blocs entièrement morts. SÛR : ce sont des ré-exports (l'original vit
 * dans le fichier source, jamais utilisé en interne par le bridge). Vérif après :
 * git diff + tsc + boot. Revert : git checkout si besoin. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BRIDGE = path.join(ROOT, 'harness/runtime/decomp-bridge.ts');
const dead = new Set(
  fs.readFileSync(path.join(ROOT, 'audit-reports/bridge-dead-reexports.txt'), 'utf8')
    .split('\n').map((s) => s.trim()).filter(Boolean),
);

let src = fs.readFileSync(BRIDGE, 'utf8');
let removed = 0, blocksDeleted = 0, blocksTrimmed = 0;

src = src.replace(/export\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"]);?/g, (full, content, source) => {
  const parts = content.split(',');
  const kept = [];
  let removedHere = 0;
  for (const raw of parts) {
    const clean = raw.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!clean) continue;
    const m = clean.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
    if (!m) { kept.push(clean); continue; }            // forme inattendue → garder (sûr)
    const exportedName = m[2] || m[1];                  // nom exposé (après `as`)
    if (dead.has(exportedName)) { removed++; removedHere++; continue; }
    kept.push(clean);
  }
  if (removedHere === 0) return full;                   // bloc inchangé
  if (kept.length === 0) { blocksDeleted++; return `// (ré-exports morts retirés depuis ${source} — sweep)`; }
  blocksTrimmed++;
  return `export {\n  ${kept.join(',\n  ')},\n} from ${source};`;
});

fs.writeFileSync(BRIDGE, src);
console.log(`Sweep : ${removed} ré-exports morts retirés ; blocs supprimés ${blocksDeleted}, trimés ${blocksTrimmed}`);
