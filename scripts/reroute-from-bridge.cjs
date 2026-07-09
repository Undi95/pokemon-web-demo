#!/usr/bin/env node
/* Re-route des imports d'un set de symboles : DEPUIS decomp-bridge → VERS un foyer.
 * Pour chaque .ts qui importe un des symboles depuis decomp-bridge (multi-ligne aware),
 * retire ces symboles du bloc bridge (supprime le bloc si vide) et ajoute
 * `import { ... } from '<chemin relatif vers target>';` juste après.
 * Usage : node scripts/reroute-from-bridge.cjs --symbols A,B,C --target src/task.ts [--dry]
 * NB : gère `X as Y` (matche par nom SOURCE X). tsc reste le filet de sécurité. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BRIDGE = path.join(ROOT, 'harness/runtime/decomp-bridge.ts');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const symbols = new Set(args[args.indexOf('--symbols') + 1].split(',').map((s) => s.trim()).filter(Boolean));
const targetRel = args[args.indexOf('--target') + 1];
const targetAbs = path.join(ROOT, targetRel);
const ID = /^[A-Za-z_$][\w$]*$/;

function relImport(fromFile) {
  let r = path.relative(path.dirname(fromFile), targetAbs).replace(/\\/g, '/').replace(/\.ts$/, '');
  if (!r.startsWith('.')) r = './' + r;
  return r;
}

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (['node_modules', '.git', 'dist'].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.ts') && p !== BRIDGE && p !== targetAbs) files.push(p); } })(ROOT);

const importRe = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]*decomp-bridge)['"];?/g;
let touched = 0;
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  const moved = [];           // pièces "X" ou "X as Y" déplacées (texte verbatim)
  let changed = false;
  src = src.replace(importRe, (full, body, source) => {
    const kept = [];
    for (const raw of body.split(',')) {
      const piece = raw.trim();
      if (!piece) continue;
      const m = piece.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+[A-Za-z_$][\w$]*)?$/);
      const srcName = m ? m[1] : null;
      if (srcName && symbols.has(srcName)) { moved.push(piece); changed = true; }
      else kept.push(piece);
    }
    if (!changed && moved.length === 0) return full;
    if (kept.length === 0) return '';                       // bloc entièrement déplacé → supprimer
    return `import {${kept.join(', ')}} from ${JSON.stringify(source)};`;
  });
  if (!changed || moved.length === 0) continue;
  const newImport = `import { ${moved.join(', ')} } from '${relImport(f)}';`;
  // insérer après le 1er import depuis decomp-bridge restant, sinon en tête des imports.
  if (/from\s*['"][^'"]*decomp-bridge['"];?/.test(src)) {
    src = src.replace(/(from\s*['"][^'"]*decomp-bridge['"];?\n)/, `$1${newImport}\n`);
  } else {
    // plus de bloc bridge : insérer à la place du premier import du fichier.
    src = src.replace(/(^import\b[^\n]*\n)/m, `${newImport}\n$1`);
  }
  if (!DRY) fs.writeFileSync(f, src);
  touched++;
  console.log(`${path.relative(ROOT, f)} ← ${moved.join(', ')}`);
}
console.log(`\n${touched} fichier(s) re-routé(s) vers '${targetRel}'${DRY ? ' (--dry)' : ''}`);
