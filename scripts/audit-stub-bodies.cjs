#!/usr/bin/env node
/**
 * audit-stub-bodies.cjs — ORACLE ANTI-STUB (2026-07-04, verdict A/B).
 *
 * Le callgraph (audit-callgraph-closure.cjs) vérifie l'EXISTENCE des fonctions
 * mais pas leur SUBSTANCE : HandleBattleWindow (no-op), PlaySE (vide),
 * LoadBattleMenuWindowGfx ('1.png' hardcodé au lieu du cadre user)… passaient
 * pour « portés ». Ce scan attrape les corps suspects :
 *   1. corps vide / quasi-vide (≤1 statement) — surtout avec params `_x`
 *   2. marqueurs d'aveu dans le corps/doc ('stub', 'no-op', 'Phase 1.4',
 *      'dette', 'deferred', 'non porté', 'partial port', 'raffinement')
 *   3. valeurs hardcodées suspectes (chemins d'asset figés '1.png', ids en dur
 *      avec 'hardcod' dans le commentaire)
 *
 * Usage :
 *   node scripts/audit-stub-bodies.cjs                 → rapport complet
 *   node scripts/audit-stub-bodies.cjs --file battle   → filtre par sous-chaîne
 *   node scripts/audit-stub-bodies.cjs --json          → JSON (audit-reports/)
 *
 * ⚠️ Heuristique : produit des FAUX POSITIFS (petites fns légitimes). Croiser
 * avec le C avant d'agir — c'est une LISTE DE SUSPECTS, pas un verdict.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const argFile = (() => {
  const i = process.argv.indexOf('--file');
  return i >= 0 ? process.argv[i + 1] : null;
})();
const asJson = process.argv.includes('--json');

// Marqueurs d'aveu (corps OU jsdoc au-dessus). Insensible à la casse/accents partiels.
const CONFESSION = /\b(stub|no-?op|phase 1\.\d|dette|deferred|defere|DEFERE|non port[eé]|pas port[eé]|partial port|raffinement|placeholder|TODO|FIXME|MVP|simplifi[eé]|approximation|fallback (simple|na[iï]f))\b/i;
// Hardcodes d'assets suspects : chemin figé avec un NUMÉRO de variante (1.png, _0.pal…)
const HARDCODED_VARIANT = /['"`][^'"`]*\/(1|0)\.(png|pal|bin)['"`]/;

/** Découpe grossière en fonctions top-level + méthodes (regex + comptage d'accolades). */
function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const found = [];
  const fnRe = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(fnRe);
    if (!m) continue;
    const name = m[1];
    const params = m[2];
    // Corps : accolades depuis la ligne de def.
    let depth = 0, started = false, body = [], j = i;
    for (; j < lines.length && j < i + 400; j++) {
      for (const ch of lines[j]) {
        if (ch === '{') { depth++; started = true; }
        else if (ch === '}') depth--;
      }
      if (started) body.push(lines[j]);
      if (started && depth <= 0) break;
    }
    const bodyText = body.join('\n');
    // Statements réels (hors commentaires/lignes vides/accolades seules).
    const stmts = body
      .map(l => l.replace(/\/\/.*$/, '').trim())
      .filter(l => l && l !== '{' && l !== '}' && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('*/'))
      .length - 1; // -1 pour la ligne de signature
    // Doc au-dessus (jusqu'à 12 lignes).
    const doc = lines.slice(Math.max(0, i - 12), i).join('\n');

    const reasons = [];
    const allUnderscoreParams = params.trim() !== '' && params.split(',').every(p => p.trim().startsWith('_'));
    if (stmts <= 1 && allUnderscoreParams) reasons.push('corps-vide+params-ignorés');
    else if (stmts === 0) reasons.push('corps-vide');
    const conf = bodyText.match(CONFESSION) || doc.match(CONFESSION);
    if (conf) reasons.push(`aveu:'${conf[0]}'`);
    if (HARDCODED_VARIANT.test(bodyText)) reasons.push('asset-variante-hardcodée');

    if (reasons.length) found.push({ name, line: i + 1, stmts, reasons });
  }
  return found;
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts')) yield p;
  }
}

const report = {};
let total = 0;
for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (argFile && !rel.includes(argFile)) continue;
  // Les data générées ne comptent pas.
  if (rel.includes('decomp-data/')) continue;
  const hits = scanFile(file);
  if (hits.length) { report[rel] = hits; total += hits.length; }
}

if (asJson) {
  const out = path.join(ROOT, 'audit-reports', 'stub-bodies.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), total, report }, null, 1));
  console.log(`écrit: ${out} (${total} suspects)`);
} else {
  const files = Object.keys(report).sort((a, b) => report[b].length - report[a].length);
  for (const f of files) {
    console.log(`\n${f} (${report[f].length})`);
    for (const h of report[f]) console.log(`  :${h.line} ${h.name} [${h.stmts} stmt] ${h.reasons.join(' ')}`);
  }
  console.log(`\nTOTAL: ${total} suspects dans ${files.length} fichiers`);
  console.log('(heuristique — croiser avec le C ; --json pour audit-reports/stub-bodies.json)');
}
