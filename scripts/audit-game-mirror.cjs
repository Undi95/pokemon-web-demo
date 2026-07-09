#!/usr/bin/env node
/**
 * audit-game-mirror.cjs — VÉRIF STRUCTURELLE 1:1 fichier-par-fichier (nous ↔ décomp)
 * ================================================================================
 * Pour CHAQUE .ts de src/game + src/engine, on extrait ses fonctions DÉFINIES et on
 * les compare aux noms de fonctions du .c décomp homonyme (game/X.ts ↔ X.c) ou, à
 * défaut de nom, au .c qui recoupe le plus nos fonctions. On sort :
 *   - pureté     = nos fn portant un nom décomp (du counterpart) / total nos fn
 *   - complétude = fn décomp présentes chez nous / total fn décomp du counterpart
 *   - divergence = nos fn dont le NOM n'existe NULLE PART dans le décomp (= maison)
 * Verdict : ✅ miroir sain · ⚠️ maison-creep (dans game/ mais impur) · 🟢 candidat
 * migration (dans engine/, pur, .c existe) · 🔴 harness (reste engine/).
 *
 * Helper NON-TRACKÉ (zéro token, zéro emu). Usage : node scripts/audit-game-mirror.cjs
 */
const { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve, join, relative, basename } = require('node:path');

const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');
const DECOMP_SRC = join(resolve(ROOT, '..', 'decomps', 'pokeemeraude'), 'src');
const OUT = join(ROOT, 'audit-reports', '1to1');

// ─── Parser C (1:1 audit-coverage-global.mjs) ────────────────────────────────
const C_KW = new Set(['if','else','while','for','switch','return','sizeof','do','goto','typedef','case','default','break','continue']);
const ATTR = new Set(['ALIGNED','UNUSED','NAKED','IWRAM_CODE','EWRAM_DATA','ASM_DIRECT','NOINLINE','NORETURN','INLINE']);
const strip = (l) => { const i = l.indexOf('//'); if (i >= 0) l = l.slice(0, i); return l.replace(/\/\*.*?\*\/\s*$/, '').replace(/\s+$/, ''); };
function cFuncNames(content) {
  const lines = content.split('\n'); const names = new Set();
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || /^\s/.test(raw)) continue;
    if (/^[#}{*\/]/.test(raw)) continue; if (/^\s*$/.test(raw)) continue;
    if (/^(extern|typedef)\b/.test(raw)) continue;
    const line = strip(raw); if (!line) continue;
    const endsSemi = /;\s*$/.test(line);
    const pParen = line.indexOf('('), pBracket = line.indexOf('['), pEq = line.indexOf('=');
    if (pParen >= 0 && (pEq < 0 || pParen < pEq) && (pBracket < 0 || pParen < pBracket) && !endsSemi) {
      const m = line.slice(0, pParen + 1).match(/([A-Za-z_]\w*)\s*\($/);
      if (m && !C_KW.has(m[1]) && !ATTR.has(m[1])) names.add(m[1]);
    }
  }
  return names;
}

// ─── Index décomp : fichier.c → Set(noms fn) + global nom → Set(fichiers) ─────
const cFuncsByFile = new Map();       // 'overworld.c' → Set(noms)
const cFileByFunc = new Map();        // 'DoWhiteOut' → Set('overworld.c', ...)
for (const e of readdirSync(DECOMP_SRC, { withFileTypes: true })) {
  if (!e.isFile() || !e.name.endsWith('.c')) continue;
  const names = cFuncNames(readFileSync(join(DECOMP_SRC, e.name), 'utf8'));
  cFuncsByFile.set(e.name, names);
  for (const n of names) { let s = cFileByFunc.get(n); if (!s) { s = new Set(); cFileByFunc.set(n, s); } s.add(e.name); }
}
// ─── Index MACROS/inline des .h (include/ + src/) → comptent comme noms décomp ──
const DECOMP_ROOT = resolve(ROOT, '..', 'decomps', 'pokeemeraude');
const macroNames = new Set();
function* walkH(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walkH(full);
    else if (e.name.endsWith('.h')) yield full;
  }
}
for (const dir of [join(DECOMP_ROOT, 'include'), DECOMP_SRC]) {
  for (const hf of walkH(dir)) {
    const content = readFileSync(hf, 'utf8');
    for (const m of content.matchAll(/^\s*#define\s+([A-Za-z_]\w*)/gm)) macroNames.add(m[1]);
    for (const n of cFuncNames(content)) macroNames.add(n);  // inline/declared fn dans .h
  }
}
const ALL_DECOMP_NAMES = new Set([...cFileByFunc.keys(), ...macroNames]);
// normalise le shim local : `_Foo`/`Foo_` comptent comme `Foo` (alias d'une fn décomp).
const norm = (n) => n.replace(/^_+/, '').replace(/_+$/, '');
const isDecompNamed = (n) => ALL_DECOMP_NAMES.has(n) || ALL_DECOMP_NAMES.has(norm(n));
const inC = (cNames, n) => cNames.has(n) || cNames.has(norm(n));

// ─── Extraction des fn TS définies ───────────────────────────────────────────
const FN_RE = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w*)/g;
const ARROW_RE = /(?:export\s+)?const\s+([A-Za-z_]\w*)\s*(?::[^=\n]+)?=\s*(?:async\s+)?(?:function\b|\([^\n)]*\)\s*(?::[^=>\n]+)?=>)/g;
function tsDefs(content) {
  const defs = new Set(); let m;
  FN_RE.lastIndex = 0; while ((m = FN_RE.exec(content))) defs.add(m[1]);
  ARROW_RE.lastIndex = 0; while ((m = ARROW_RE.exec(content))) defs.add(m[1]);
  return defs;
}

// ─── Walk nos .ts (game + engine, hors data générée/harness pur) ─────────────
function* walkTs(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (/node_modules|\.git/.test(full)) continue; yield* walkTs(full); }
    else if (e.name.endsWith('.ts')) yield full;
  }
}
// data transpilée = tous les noms (faux positifs) ; include/ = miroir de .h (axe séparé) ; game/data = data.
const SKIP_DIR = /[\\/](decomp-data|decomp-impls|include)[\\/]|game[\\/]data[\\/]/;

const rows = [];
for (const root of ['game', 'engine']) {
  const base = join(SRC, root);
  if (!existsSync(base)) continue;
  for (const abs of walkTs(base)) {
    if (SKIP_DIR.test(abs)) continue;
    const rel = relative(SRC, abs).replace(/\\/g, '/');
    const content = readFileSync(abs, 'utf8');
    const defs = tsDefs(content);
    if (defs.size === 0) continue;  // fichiers data/type-only
    const baseName = basename(abs, '.ts');
    // counterpart : .c homonyme si existe, sinon meilleur recouvrement
    let counterpart = cFuncsByFile.has(baseName + '.c') ? baseName + '.c' : null;
    let bestC = null, bestOverlap = 0;
    for (const [cf, names] of cFuncsByFile) {
      let ov = 0; for (const d of defs) if (names.has(d)) ov++;
      if (ov > bestOverlap) { bestOverlap = ov; bestC = cf; }
    }
    const useC = counterpart || bestC;
    const cNames = useC ? cFuncsByFile.get(useC) : new Set();
    let matched = 0, matchedAnywhere = 0, divergent = 0;
    const divergentNames = [];
    for (const d of defs) {
      if (inC(cNames, d)) matched++;
      if (isDecompNamed(d)) matchedAnywhere++; else { divergent++; divergentNames.push(d); }
    }
    rows.push({
      rel, inGame: root === 'game', baseName,
      defs: defs.size,
      counterpartByName: !!counterpart,
      useC: useC || '—',
      cTotal: cNames.size,
      matched,                                   // nos fn ∈ counterpart.c
      matchedAnywhere,                            // nos fn ∈ n'importe quel .c
      divergent, divergentNames,
      purity: defs.size ? Math.round(matched / defs.size * 100) : 0,
      purityAnywhere: defs.size ? Math.round(matchedAnywhere / defs.size * 100) : 0,
      completeness: cNames.size ? Math.round(matched / cNames.size * 100) : 0,
      bestC, bestOverlap,
    });
  }
}

// ─── Verdicts ────────────────────────────────────────────────────────────────
function verdict(r) {
  if (r.inGame) {
    if (!r.counterpartByName) return '🟥 game/ SANS .c homonyme (faux nom ?)';
    if (r.purityAnywhere >= 85) return '✅ miroir sain';
    return '⚠️ maison-creep (revoir)';
  }
  // engine/
  if (r.matched >= 3 && r.purity >= 70 && !existsSync(join(SRC, 'game', r.useC.replace(/\.c$/, '.ts'))))
    return '🟢 CANDIDAT migration → game/' + r.useC.replace(/\.c$/, '.ts');
  if (r.matchedAnywhere >= 3 && r.purityAnywhere >= 60) return '🟡 partiel (décomp-nommé mais dispersé/incomplet)';
  return '🔴 harness/maison (reste engine/)';
}
rows.forEach((r) => { r.verdict = verdict(r); });

// ─── Rapport ─────────────────────────────────────────────────────────────────
const gameRows = rows.filter((r) => r.inGame).sort((a, b) => a.purityAnywhere - b.purityAnywhere);
const candidates = rows.filter((r) => !r.inGame && r.verdict.startsWith('🟢')).sort((a, b) => b.matched - a.matched);
const partials = rows.filter((r) => !r.inGame && r.verdict.startsWith('🟡')).sort((a, b) => b.matchedAnywhere - a.matchedAnywhere);
const harness = rows.filter((r) => !r.inGame && r.verdict.startsWith('🔴'));

mkdirSync(OUT, { recursive: true });
let md = `# AUDIT MIROIR 1:1 — nos .ts ↔ décomp .c (structurel : noms de fonctions)\n\n`;
md += `> pureté = nos fn au nom décomp (du counterpart) / total · complétude = fn décomp présentes / total décomp · divergence = nos fn au nom introuvable dans TOUT le décomp (maison).\n`;
md += `> ⚠️ STRUCTUREL (noms), pas comportemental. Ne lit pas la logique ligne-à-ligne.\n\n`;

md += `## 🗂️ game/ (déjà migré) — ${gameRows.length} fichiers, vérif que c'est en ordre\n\n`;
md += `| fichier | counterpart | nos fn | match(c.p./partout) | pureté | complét. | divergence | verdict |\n|---|---|---|---|---|---|---|---|\n`;
for (const r of gameRows) {
  md += `| \`${r.rel}\` | \`${r.useC}\` | ${r.defs} | ${r.matched}/${r.matchedAnywhere} | ${r.purity}%/${r.purityAnywhere}% | ${r.completeness}% | ${r.divergent} | ${r.verdict} |\n`;
}
md += `\n### Divergences dans game/ (fn au nom non-décomp — à justifier : glu M3 ? mal nommé ?)\n\n`;
for (const r of gameRows.filter((x) => x.divergent > 0)) {
  md += `- \`${r.rel}\` (${r.divergent}) : ${r.divergentNames.slice(0, 20).join(', ')}${r.divergentNames.length > 20 ? '…' : ''}\n`;
}

md += `\n## 🟢 CANDIDATS migration → game/ (${candidates.length}) — engine/, purs, .c existe\n\n`;
md += `| fichier engine | → game/ | nos fn | match | pureté | complét. | divergence |\n|---|---|---|---|---|---|---|\n`;
for (const r of candidates) {
  md += `| \`${r.rel}\` | \`game/${r.useC.replace(/\.c$/, '.ts')}\` | ${r.defs} | ${r.matched}/${r.cTotal} | ${r.purity}% | ${r.completeness}% | ${r.divergent} |\n`;
}

md += `\n## 🟡 Partiels (${partials.length}) — décomp-nommés mais dispersés/hybrides (évaluer au cas par cas)\n\n`;
md += `| fichier engine | best .c | nos fn | match partout | pureté(p) | divergence |\n|---|---|---|---|---|---|\n`;
for (const r of partials) {
  md += `| \`${r.rel}\` | \`${r.bestC || '—'}\` | ${r.defs} | ${r.matchedAnywhere} | ${r.purityAnywhere}% | ${r.divergent} |\n`;
}

md += `\n## 🔴 Harness/maison (${harness.length}) — reste en engine/ (peu/pas de noms décomp)\n\n`;
for (const r of harness.sort((a, b) => a.rel.localeCompare(b.rel))) md += `- \`${r.rel}\` (${r.defs} fn, ${r.matchedAnywhere} décomp-nommées)\n`;

writeFileSync(join(OUT, 'GAME-MIRROR-AUDIT.md'), md);

// ─── stdout ──────────────────────────────────────────────────────────────────
const log = console.log;
log('═══════════════════════════════════════════════════════════════════');
log('  AUDIT MIROIR 1:1 — nos .ts ↔ décomp .c (structurel)');
log('═══════════════════════════════════════════════════════════════════');
log(`game/ (migré) : ${gameRows.length}  ·  candidats migration : ${candidates.length}  ·  partiels : ${partials.length}  ·  harness : ${harness.length}`);
const sain = gameRows.filter((r) => r.verdict.startsWith('✅')).length;
const creep = gameRows.filter((r) => r.verdict.startsWith('⚠️')).length;
const faux = gameRows.filter((r) => r.verdict.startsWith('🟥')).length;
log(`\nÉTAT de game/ : ✅ sains ${sain}  ·  ⚠️ maison-creep ${creep}  ·  🟥 faux-nom ${faux}`);
if (creep || faux) {
  log('\n  game/ à revoir :');
  for (const r of gameRows.filter((r) => !r.verdict.startsWith('✅')))
    log(`    ${r.verdict.padEnd(34)} ${r.rel.padEnd(40)} pureté ${r.purityAnywhere}%  divergence ${r.divergent}`);
}
log(`\n🟢 CANDIDATS migration → game/ (${candidates.length}) :`);
log('  ' + 'fichier engine'.padEnd(42) + '→ game/                       fn   match  pur  compl');
for (const r of candidates) {
  log(`  ${r.rel.padEnd(42)}${('game/' + r.useC.replace(/\.c$/, '.ts')).padEnd(30)}${String(r.defs).padEnd(5)}${String(r.matched + '/' + r.cTotal).padEnd(7)}${(r.purity + '%').padEnd(5)}${r.completeness}%`);
}
log(`\n🟡 partiels (${partials.length}) : ` + partials.map((r) => basename(r.rel)).join(', '));
log(`\nRapport complet : audit-reports/1to1/GAME-MIRROR-AUDIT.md`);
log('═══════════════════════════════════════════════════════════════════');
