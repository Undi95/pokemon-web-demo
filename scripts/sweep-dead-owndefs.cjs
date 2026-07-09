#!/usr/bin/env node
/* Sweep des OWN-DEFS MORTS de decomp-bridge.ts (liste fiable produite par
 * audit-bridge-dead-owndefs.cjs → audit-reports/bridge-dead-owndefs.txt).
 * Utilise le PARSEUR TypeScript (spans AST exacts → robuste face aux annotations
 * de type `{}`, templates, arrow bodies). Retire aussi les noms des manifestes
 * __bridgedHelpers__ / __notImplementedHelpers__. tsc + boot = filets de sécurité.
 *
 * Usage : node scripts/sweep-dead-owndefs.cjs [--limit N] [--only A,B,C] [--dry]
 *   --limit N  : ne retire que les N premiers (vagues)
 *   --only ... : ne retire que ces noms précis (sous-ensemble de la liste morte)
 *   --dry      : rapport sans écrire */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const BRIDGE = path.join(ROOT, 'harness/runtime/decomp-bridge.ts');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const limIdx = args.indexOf('--limit');
const LIMIT = limIdx >= 0 ? parseInt(args[limIdx + 1], 10) : Infinity;
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(',').map((s) => s.trim())) : null;

let dead = new Set(
  fs.readFileSync(path.join(ROOT, 'audit-reports/bridge-dead-owndefs.txt'), 'utf8')
    .split('\n').map((s) => s.trim()).filter(Boolean),
);
if (ONLY) dead = new Set([...dead].filter((n) => ONLY.has(n)));

const src = fs.readFileSync(BRIDGE, 'utf8');
const sf = ts.createSourceFile(BRIDGE, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

function hasExport(node) {
  return node.modifiers && node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

const spans = [];   // {name, start, end}
const skipped = [];
for (const st of sf.statements) {
  if (!hasExport(st)) continue;
  if (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) {
    const name = st.name && st.name.text;
    if (name && dead.has(name)) spans.push({ name, start: st.getFullStart(), end: st.getEnd() });
  } else if (ts.isVariableStatement(st)) {
    const decls = st.declarationList.declarations;
    const names = decls.map((d) => (ts.isIdentifier(d.name) ? d.name.text : null));
    const deadHere = names.filter((n) => n && dead.has(n));
    if (deadHere.length === 0) continue;
    if (deadHere.length === decls.length) {
      spans.push({ name: names.join(','), start: st.getFullStart(), end: st.getEnd() });
    } else {
      skipped.push(`${names.join(',')} (statement mixte mort/vivant — non retiré)`);
    }
  }
}

// Appliquer le LIMIT sur l'ORDRE SOURCE (déterministe), garder les spans choisis.
spans.sort((a, b) => a.start - b.start);
const chosen = spans.slice(0, LIMIT);
const removedNames = new Set(chosen.flatMap((s) => s.name.split(',')));

// Splice descendant (pour ne pas décaler les offsets).
let out = src;
for (const sp of [...chosen].sort((a, b) => b.start - a.start)) {
  out = out.slice(0, sp.start) + out.slice(sp.end);
}

// Nettoyage des manifestes : retirer 'NAME' des Set([...]) __bridgedHelpers__ / __notImplementedHelpers__.
const manifestRe = /(__bridgedHelpers__|__notImplementedHelpers__)\b[\s\S]*?new Set\(\[([\s\S]*?)\]\)/g;
out = out.replace(manifestRe, (full, mname, body) => {
  const cleaned = body.replace(/(['"])([A-Za-z_$][\w$]*)\1\s*,?/g, (tok, q, name) =>
    removedNames.has(name) ? '' : tok);
  // compacter les lignes devenues vides
  const compact = cleaned.split('\n').filter((l) => l.trim() !== '').join('\n');
  return full.replace(body, '\n' + compact + '\n');
});

console.log(`Spans morts détectés : ${spans.length}${ONLY ? ' (filtrés --only)' : ''} ; retirés cette passe : ${chosen.length}`);
if (skipped.length) console.log(`Sautés (mixtes) :\n  ${skipped.join('\n  ')}`);
console.log(`Octets bridge : ${src.length} → ${out.length} (−${src.length - out.length})`);
console.log(`Premiers retirés : ${chosen.slice(0, 12).map((s) => s.name).join(', ')}${chosen.length > 12 ? ' …' : ''}`);

if (!DRY) {
  fs.writeFileSync(BRIDGE, out);
  console.log('Écrit.');
} else {
  console.log('(--dry : non écrit)');
}
