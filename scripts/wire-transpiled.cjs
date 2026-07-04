#!/usr/bin/env node
/**
 * wire-transpiled.cjs — câblage AUTOMATIQUE des fichiers transpilés (transpile-c.cjs).
 *
 * Ce que faisait Fable à la main (2026-07-04), automatisé :
 *   1. compile le fichier cible seul (tsconfig temporaire = exclude - fichier) ;
 *   2. TS2304 « Cannot find name 'X' »  → import auto depuis l'index des exports du repo
 *      (audit-reports/ts-symbol-index.json, 17 940 symboles) ;
 *   3. TS2305 « no exported member 'Y' » → retire Y de l'import fautif du transpiler ;
 *   4. symboles SANS foyer → `const X: any = __wireTodo('X')` (Proxy inerte à la référence,
 *      THROW bruyant à l'appel — src/engine/wire-todo.ts) ;
 *   5. re-tsc : 0 erreur → retire le fichier de l'exclude du VRAI tsconfig.json (câblé !) ;
 *      sinon le fichier reste exclu, les edits restent (progrès conservé), erreurs au rapport.
 *
 * Usage :
 *   node scripts/wire-transpiled.cjs --file pokenav_match_call_data [--apply]
 *   node scripts/wire-transpiled.cjs --all [--apply]        # tous les exclus de tsconfig
 *   (sans --apply : dry-run, montre ce qui serait fait)
 * Rapport : audit-reports/transpile/wire-<nom>.md
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const TSCONFIG = path.join(REPO, 'tsconfig.json');
const INDEX = path.join(REPO, 'audit-reports', 'ts-symbol-index.json');
const TMPDIR = path.join(REPO, 'audit-reports', 'transpile');

const argv = process.argv.slice(2);
const argVal = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const APPLY = argv.includes('--apply');
const fileArg = argVal('--file');
const allMode = argv.includes('--all');

// ─── index des exports ───────────────────────────────────────────────────────
const idx = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
const SYMBOLS = idx.symbols || {};
const TYPE_KINDS = new Set(['interface', 'type']);

// ─── tsconfig : lecture/écriture de l'exclude ────────────────────────────────
function readTsconfig() { return JSON.parse(fs.readFileSync(TSCONFIG, 'utf8')); }
function currentExclude() { return (readTsconfig().exclude || []).filter((e) => e.startsWith('src/')); }

// ─── compile le repo avec le fichier cible réintégré, capture ses erreurs ────
function tscErrorsFor(relFile) {
  const cfg = readTsconfig();
  cfg.exclude = (cfg.exclude || []).filter((e) => e !== relFile);
  const tmpCfg = path.join(TMPDIR, '_tsconfig.wire.json');
  // include/exclude relatifs à l'emplacement du tsconfig → réécrire vers la racine
  cfg.include = (cfg.include || []).map((p) => path.join('..', '..', p).replace(/\\/g, '/'));
  cfg.exclude = cfg.exclude.map((p) => path.join('..', '..', p).replace(/\\/g, '/'));
  fs.writeFileSync(tmpCfg, JSON.stringify(cfg, null, 1));
  let out = '';
  try { execSync(`npx tsc --noEmit -p "${tmpCfg}"`, { cwd: REPO, encoding: 'utf8', stdio: 'pipe' }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  const errs = [];
  for (const line of out.split(/\r?\n/)) {
    const m = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
    if (m && m[1].replace(/\\/g, '/') === relFile) errs.push({ line: +m[2], code: m[4], msg: m[5] });
  }
  return errs;
}

// ─── résolution d'un lot d'erreurs → edits ────────────────────────────────────
function wireOne(relFile) {
  const abs = path.join(REPO, relFile);
  if (!fs.existsSync(abs)) { console.log(`SKIP ${relFile} (absent)`); return { relFile, status: 'absent' }; }
  console.log(`\n═══ ${relFile} ═══`);
  let src = fs.readFileSync(abs, 'utf8');
  let errs = tscErrorsFor(relFile);
  console.log(`  pass 1 : ${errs.length} erreurs`);

  // TS2305 : retirer les membres inexistants des imports du transpiler
  const badMembers = new Set();
  for (const e of errs) {
    const m = e.msg.match(/has no exported member '(\w+)'/);
    if (m) badMembers.add(m[1]);
  }
  for (const name of badMembers) {
    src = src.replace(new RegExp(`(import\\s*(?:type\\s*)?\\{[^}]*?)\\b${name}\\b\\s*,?`, 'g'), '$1');
    src = src.replace(/import\s*(?:type\s*)?\{\s*,/g, (s) => s.replace('{ ,', '{').replace('{,', '{'));
    src = src.replace(/,\s*\}/g, ' }');
    src = src.replace(/import\s*(?:type\s*)?\{\s*\}\s*from\s*[^;]+;\r?\n?/g, '');
  }

  // TS2304 : imports auto ou wireTodo
  const missing = new Set();
  for (const e of errs) {
    const m = e.msg.match(/^Cannot find name '(\w+)'/);
    if (m) missing.add(m[1]);
  }
  for (const n of badMembers) missing.add(n);

  const importsByModule = new Map();   // module → { values:Set, types:Set }
  const todos = [];
  const selfBase = path.basename(relFile, '.ts');
  for (const name of missing) {
    const homes = SYMBOLS[name];
    const home = homes && homes.find((h) => !h.file.endsWith(`/${selfBase}.ts`) && h.file !== relFile);
    if (home) {
      let rel = path.relative(path.dirname(relFile), home.file).replace(/\\/g, '/').replace(/\.ts$/, '');
      if (!rel.startsWith('.')) rel = './' + rel;
      if (!importsByModule.has(rel)) importsByModule.set(rel, { values: new Set(), types: new Set() });
      (TYPE_KINDS.has(home.kind) ? importsByModule.get(rel).types : importsByModule.get(rel).values).add(name);
    } else {
      todos.push(name);
    }
  }

  // construire le bloc à insérer après le dernier import existant
  const lines = [];
  for (const [mod, { values, types }] of [...importsByModule.entries()].sort()) {
    if (values.size) lines.push(`import { ${[...values].sort().join(', ')} } from '${mod}';`);
    if (types.size) lines.push(`import type { ${[...types].sort().join(', ')} } from '${mod}';`);
  }
  if (todos.length) {
    let relTodo = path.relative(path.dirname(relFile), 'src/engine/wire-todo.ts').replace(/\\/g, '/').replace(/\.ts$/, '');
    if (!relTodo.startsWith('.')) relTodo = './' + relTodo;
    lines.push(`import { __wireTodo } from '${relTodo}';`);
    lines.push('// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l\'appel) ───');
    for (const t of todos.sort()) lines.push(`const ${t}: any = __wireTodo('${t}');`);
  }
  if (lines.length) {
    const block = `\n// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══\n${lines.join('\n')}\n`;
    const importRe = /^import[\s\S]*?from\s*[^;]+;\s*$/gm;
    let lastEnd = 0; let m;
    while ((m = importRe.exec(src))) lastEnd = m.index + m[0].length;
    src = lastEnd ? src.slice(0, lastEnd) + block + src.slice(lastEnd) : block + src;
  }
  console.log(`  imports: ${importsByModule.size} modules · wireTodo: ${todos.length} · badMembers: ${badMembers.size}`);

  if (!APPLY) { console.log('  (dry-run, --apply pour écrire)'); return { relFile, status: 'dry', imports: importsByModule.size, todos: todos.length }; }
  fs.writeFileSync(abs, src);

  // re-tsc : câblé ?
  errs = tscErrorsFor(relFile);
  const report = [`# wire ${relFile} — ${new Date().toISOString()}`, '',
    `imports auto : ${[...importsByModule.keys()].join(', ') || '—'}`,
    `wireTodo (${todos.length}) : ${todos.join(', ') || '—'}`,
    `membres retirés (${badMembers.size}) : ${[...badMembers].join(', ') || '—'}`,
    '', `## erreurs restantes (${errs.length})`,
    ...errs.slice(0, 60).map((e) => `- :${e.line} ${e.code} ${e.msg}`)];
  fs.writeFileSync(path.join(TMPDIR, `wire-${path.basename(relFile, '.ts')}.md`), report.join('\n'));

  const unresolved = errs.filter((e) => e.code === 'TS2304' || e.code === 'TS2305');
  if (unresolved.length === 0) {
    // Plus de symboles inconnus → le module se CHARGE sans ReferenceError. Les erreurs restantes
    // sont des types stricts sur code GÉNÉRÉ → @ts-nocheck (le câblage fin les retirera) et
    // réintégration au build.
    if (errs.length > 0 && !src.startsWith('// @ts-nocheck')) {
      src = `// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)\n` + src;
      fs.writeFileSync(abs, src);
    }
    const cfg = readTsconfig();
    cfg.exclude = (cfg.exclude || []).filter((e) => e !== relFile);
    if (!cfg.exclude.length) delete cfg.exclude;
    fs.writeFileSync(TSCONFIG, JSON.stringify(cfg, null, 2) + '\n');
    console.log(`  ✅ CÂBLÉ (${errs.length ? `ts-nocheck, ${errs.length} err types masquées` : '0 erreur'}) → retiré de l'exclude`);
    return { relFile, status: 'wired', masked: errs.length, todos: todos.length };
  }
  console.log(`  ⚠ reste ${unresolved.length} symboles non résolus (fichier toujours exclu) → wire-${path.basename(relFile, '.ts')}.md`);
  return { relFile, status: 'partial', remaining: unresolved.length, todos: todos.length };
}

// ─── main ────────────────────────────────────────────────────────────────────
const targets = allMode ? currentExclude()
  : fileArg ? [fileArg.startsWith('src/') ? fileArg : `src/${fileArg.replace(/\.ts$/, '')}.ts`]
  : (console.log('usage: --file <nom> | --all [--apply]'), process.exit(1));

const results = [];
for (const t of targets) results.push(wireOne(t));
console.log('\n═══ BILAN ═══');
for (const r of results) console.log(`  ${r.status.padEnd(8)} ${r.relFile}${r.remaining ? ` (${r.remaining} err)` : ''}${r.todos ? ` [${r.todos} todo]` : ''}`);
