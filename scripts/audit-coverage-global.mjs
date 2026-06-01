#!/usr/bin/env node
/**
 * audit-coverage-global.mjs  —  CARTE DE COUVERTURE 1:1 GLOBALE
 * =============================================================
 * Étend `audit-decomp-1to1-coverage.mjs` (qui n'audite QUE 6 fichiers
 * hardcodés) à TOUT le décomp : pour CHAQUE `src/*.c` du décomp, on compte
 * combien de ses fonctions sont citées (`1:1 décomp <fichier>.c:<ligne>`)
 * quelque part dans notre `src/`. Le résultat = une carte de couverture
 * rankée = le BACKLOG : quels sous-systèmes sont portés / partiels / jamais
 * touchés, sans auditer à la main (zéro token, zéro emu).
 *
 * Le signal "couvert" = une citation pointe dans [start,end] de la fonction.
 * C'est un PROXY de "porté + vérifié 1:1" (on cite quand on porte 1:1). Comme
 * l'outil A : ça prouve la COUVERTURE + la TRAÇABILITÉ, PAS le comportement
 * (les bugs timing/fade/sprite = runtime, ROM-diff séparé).
 *
 * Usage :
 *   node scripts/audit-coverage-global.mjs                 (rapport complet)
 *   node scripts/audit-coverage-global.mjs --top=40        (top N gaps stdout)
 *   node scripts/audit-coverage-global.mjs --file=battle_main.c   (détail 1 fichier)
 *   node scripts/audit-coverage-global.mjs --min-funcs=5   (ignore les .c < N fonctions)
 *   node scripts/audit-coverage-global.mjs --decomp="D:/.../pokeemeraude"
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);
const getArg = (k) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
const decompPath = resolve(getArg('decomp') || resolve(projectRoot, '..', 'decomps', 'pokeemeraude'));
const topN = parseInt(getArg('top') || '40', 10);
const minFuncs = parseInt(getArg('min-funcs') || '1', 10);
const onlyFile = getArg('file');
const outputDir = resolve(getArg('output-dir') || join(projectRoot, 'audit-reports', '1to1'));

if (!existsSync(decompPath)) {
  console.error(`[FATAL] décomp introuvable : ${decompPath}`);
  console.error(`        passe --decomp="<chemin pokeemeraude>" si non-standard.`);
  process.exit(2);
}
const decompSrc = join(decompPath, 'src');
if (!existsSync(decompSrc)) { console.error(`[FATAL] ${decompSrc} introuvable`); process.exit(2); }

// ─── Parsers (1:1 avec audit-decomp-1to1-coverage.mjs — mêmes heuristiques prouvées) ──
const C_KEYWORDS = new Set(['if', 'else', 'while', 'for', 'switch', 'return', 'sizeof', 'do', 'goto', 'typedef', 'case', 'default', 'break', 'continue']);
const ATTR_MACROS = new Set(['ALIGNED', 'UNUSED', 'NAKED', 'IWRAM_CODE', 'EWRAM_DATA', 'ASM_DIRECT', 'NOINLINE', 'NORETURN', 'INLINE']);

function stripTrailingComment(line) {
  const i = line.indexOf('//');
  if (i >= 0) line = line.slice(0, i);
  return line.replace(/\/\*.*?\*\/\s*$/, '').replace(/\s+$/, '');
}
function parseCSymbols(content) {
  const lines = content.split('\n');
  const symbols = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || /^\s/.test(raw)) continue;
    if (/^[#}{*\/]/.test(raw)) continue;
    if (/^\s*$/.test(raw)) continue;
    if (/^(extern|typedef)\b/.test(raw)) continue;
    const line = stripTrailingComment(raw);
    if (!line) continue;
    const endsSemi = /;\s*$/.test(line);
    const pParen = line.indexOf('(');
    const pBracket = line.indexOf('[');
    const pEq = line.indexOf('=');
    if (pParen >= 0 && (pEq < 0 || pParen < pEq) && (pBracket < 0 || pParen < pBracket) && !endsSemi) {
      const m = line.slice(0, pParen + 1).match(/([A-Za-z_]\w*)\s*\($/);
      if (m && !C_KEYWORDS.has(m[1]) && !ATTR_MACROS.has(m[1])) { symbols.push({ name: m[1], line: i + 1, kind: 'func' }); continue; }
    }
  }
  for (let k = 0; k < symbols.length; k++) {
    symbols[k].start = symbols[k].line;
    symbols[k].end = k + 1 < symbols.length ? symbols[k + 1].line - 1 : lines.length;
  }
  return { symbols, totalLines: lines.length };
}

const DECOMP_REF =
  /(?:\b(data|constants|src|include|gba)\/)?([A-Za-z_][\w]*\.(?:c|h|s|inc))(?![A-Za-z0-9_])(?::(\d+)(?:\s*(?:-|\.\.)\s*(\d+))?((?:\/\d+)+)?\+?)?/g;

function extractComments(content) {
  const lines = content.split('\n');
  const out = [];
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    let commentText = '';
    if (inBlock) { const end = ln.indexOf('*/'); if (end >= 0) { commentText += ln.slice(0, end); inBlock = false; } else commentText += ln; }
    if (!inBlock) {
      const li = ln.indexOf('//');
      if (li >= 0) commentText += ' ' + ln.slice(li + 2);
      let idx = 0;
      while (true) {
        const open = ln.indexOf('/*', idx);
        if (open < 0) break;
        const close = ln.indexOf('*/', open + 2);
        if (close >= 0) { commentText += ' ' + ln.slice(open + 2, close); idx = close + 2; }
        else { commentText += ' ' + ln.slice(open + 2); inBlock = true; break; }
      }
    }
    if (commentText) out.push({ line: i + 1, text: commentText });
  }
  return out;
}
function extractCitations(content) {
  const cites = [];
  for (const { line, text } of extractComments(content)) {
    DECOMP_REF.lastIndex = 0;
    let m;
    while ((m = DECOMP_REF.exec(text))) {
      const [, pathSeg, fileName, n1, n2, extra] = m;
      const lineNums = [];
      if (n1) {
        if (n2) for (let v = +n1; v <= +n2; v++) lineNums.push(v);
        else lineNums.push(+n1);
        if (extra) for (const e of extra.split('/').filter(Boolean)) lineNums.push(+e);
      }
      cites.push({ tsLine: line, fileName, lineNums });
    }
  }
  return cites;
}
function* walkTs(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (/node_modules|\.git/.test(full)) continue;
      // decomp-data/ = data générée/transpilée (pas du port manuel cité) → on
      // garde quand même (certaines citations y vivent), mais c'est surtout du data.
      yield* walkTs(full);
    } else if (ent.name.endsWith('.ts')) yield full;
  }
}

// ─── 1. Collecte TOUTES les citations de notre src/ → map basename → Set(lignes) + compteur ──
const citedLinesByFile = new Map();   // 'battle_main.c' → Set(lineNums cités)
const citeCountByFile = new Map();    // 'battle_main.c' → nb de citations (toutes, ligne ou pas)
const fileLevelCiteByFile = new Map();// 'battle_main.c' → nb de citations SANS ligne
let totalCites = 0;
for (const tsAbs of walkTs(join(projectRoot, 'src'))) {
  const content = readFileSync(tsAbs, 'utf8');
  for (const c of extractCitations(content)) {
    if (!/\.c$/.test(c.fileName)) continue;   // .c uniquement (le code ; .h/.s = data/bruit)
    totalCites++;
    citeCountByFile.set(c.fileName, (citeCountByFile.get(c.fileName) || 0) + 1);
    if (!c.lineNums.length) { fileLevelCiteByFile.set(c.fileName, (fileLevelCiteByFile.get(c.fileName) || 0) + 1); continue; }
    let set = citedLinesByFile.get(c.fileName);
    if (!set) { set = new Set(); citedLinesByFile.set(c.fileName, set); }
    for (const ln of c.lineNums) set.add(ln);
  }
}

// ─── 2. Parse TOUS les src/*.c du décomp + calcule la couverture ──────────────
function overlaps(citedSet, s) {
  for (const ln of citedSet) if (ln >= s.start && ln <= s.end) return true;
  return false;
}
const rows = [];
for (const ent of readdirSync(decompSrc, { withFileTypes: true })) {
  if (!ent.isFile() || !ent.name.endsWith('.c')) continue;
  const fname = ent.name;
  if (onlyFile && fname !== onlyFile && fname !== basename(onlyFile)) continue;
  const { symbols, totalLines } = parseCSymbols(readFileSync(join(decompSrc, fname), 'utf8'));
  const funcs = symbols.filter((s) => s.kind === 'func');
  const citedSet = citedLinesByFile.get(fname) || new Set();
  const covered = funcs.filter((s) => overlaps(citedSet, s));
  const uncovered = funcs.filter((s) => !overlaps(citedSet, s));
  rows.push({
    file: fname, totalLines, totalFuncs: funcs.length,
    covered: covered.length, uncovered,
    cites: citeCountByFile.get(fname) || 0,
    fileLevelCites: fileLevelCiteByFile.get(fname) || 0,
    pct: funcs.length ? Math.round((covered.length / funcs.length) * 100) : 0,
  });
}

// ─── Mode --file : détail d'un fichier (les fonctions non couvertes) ──────────
if (onlyFile) {
  for (const r of rows) {
    console.log(`\n# ${r.file} — ${r.covered}/${r.totalFuncs} fonctions couvertes (${r.pct}%) · ${r.cites} citations\n`);
    if (r.uncovered.length) {
      console.log('Fonctions NON couvertes (pas de citation 1:1) :');
      for (const s of r.uncovered) console.log(`  ✗ ${s.name}  @ L${s.start}-${s.end}`);
    } else console.log('✓ Toutes les fonctions sont citées.');
  }
  process.exit(0);
}

// ─── Sous-systèmes DÉFÉRÉS (hors-scope demo : minigames, link/multi, contest,
// frontier, trade…) — leur faible couverture est ATTENDUE, pas un vrai trou.
// (config éditable : ajuste si on décide d'en porter un.)
const DEFERRED_RE = [
  /^link/, /^librfu/, /^rfu/, /^union_room/, /^cable_club/, /^trade/, /^mevent/,
  /^mystery_gift/, /^mystery_event/, /battle_controller_(link|recorded)/,
  /^contest/, /^frontier/, /^battle_(factory|pike|pyramid|dome|arena|palace|tower)/,
  /^apprentice/, /^record_mixing/, /^slot_machine/, /^roulette/, /^pokemon_jump/,
  /^dodrio_berry_picking/, /^berry_crush/, /^berry_blender/, /^pokenav/, /^pokeblock/,
  /^faraway_island/, /^mauville_old_man/, /^digit_obj_util/, /^berry_fix/, /^mossdeep_gym/,
  /^secret_base/, /^mirage_tower/, /^trainer_hill/, /^battle_tv/, /^battle_dome_cards/,
];
const isDeferred = (f) => DEFERRED_RE.some((re) => re.test(f));

// ─── 3. Catégorisation + tri ──────────────────────────────────────────────────
const allEligible = rows.filter((r) => r.totalFuncs >= minFuncs);
allEligible.forEach((r) => { r.deferred = isDeferred(r.file); });
const deferredRows = allEligible.filter((r) => r.deferred);
const eligible = allEligible.filter((r) => !r.deferred);   // = CORE (le vrai scope)
const totalFuncsAll = eligible.reduce((a, r) => a + r.totalFuncs, 0);
const totalCoveredAll = eligible.reduce((a, r) => a + r.covered, 0);
const fullyCovered = eligible.filter((r) => r.pct === 100);
const untouched = eligible.filter((r) => r.cites === 0);
const partial = eligible.filter((r) => r.cites > 0 && r.pct < 100);

// tri principal = par nb de fonctions NON couvertes décroissant (= plus gros trous d'abord)
const byGap = [...eligible].sort((a, b) => b.uncovered.length - a.uncovered.length);
// "presque finis" = partiels avec peu de gaps (candidats faciles à clôturer)
const almostDone = partial.filter((r) => r.uncovered.length > 0 && r.uncovered.length <= 5)
  .sort((a, b) => a.uncovered.length - b.uncovered.length);

// ─── 4. Écriture rapport ───────────────────────────────────────────────────────
mkdirSync(outputDir, { recursive: true });
const now = new Date().toISOString();
let md = `# CARTE DE COUVERTURE 1:1 GLOBALE — décomp \`src/*.c\` ↔ notre port\n\nGénéré : ${now}\n\n`;
md += `> Signal "couvert" = une citation \`1:1 décomp file.c:N\` pointe dans la fonction.\n`;
md += `> ⚠️ Prouve la COUVERTURE/traçabilité, **PAS le comportement** (bugs runtime = ROM-diff séparé).\n`;
md += `> Couverture globale (≥${minFuncs} fonctions/fichier) : **${totalCoveredAll}/${totalFuncsAll} fonctions** `;
md += `(${totalFuncsAll ? Math.round((totalCoveredAll / totalFuncsAll) * 100) : 0}%) sur **${eligible.length} fichiers .c**.\n`;
md += `> ${fullyCovered.length} fichiers 100% · ${partial.length} partiels · ${untouched.length} jamais touchés.\n\n`;

md += `## 🟢 Fichiers 100% couverts (${fullyCovered.length})\n\n`;
md += fullyCovered.sort((a, b) => b.totalFuncs - a.totalFuncs).map((r) => `- \`${r.file}\` (${r.totalFuncs} fn)`).join('\n') + '\n\n';

md += `## 🟡 Partiels — triés par # fonctions manquantes (les "presque finis" en bas)\n\n`;
md += `| Fichier | couvert/total | % | manquantes | citations |\n|---|---|---|---|---|\n`;
for (const r of partial.sort((a, b) => b.uncovered.length - a.uncovered.length)) {
  md += `| \`${r.file}\` | ${r.covered}/${r.totalFuncs} | ${r.pct}% | **${r.uncovered.length}** | ${r.cites} |\n`;
}
md += '\n';

md += `## 🔴 Jamais touchés (0 citation) — triés par taille (${untouched.length})\n\n`;
md += `| Fichier | fonctions | lignes |\n|---|---|---|\n`;
for (const r of untouched.sort((a, b) => b.totalFuncs - a.totalFuncs)) {
  md += `| \`${r.file}\` | ${r.totalFuncs} | ${r.totalLines} |\n`;
}
md += '\n';

md += `## ⭐ "Presque finis" (partiels avec ≤5 fonctions manquantes — candidats clôture rapide)\n\n`;
if (almostDone.length) {
  for (const r of almostDone) {
    md += `### \`${r.file}\` — ${r.uncovered.length} manquante(s) (${r.pct}%)\n`;
    for (const s of r.uncovered) md += `- \`${s.name}\` @ L${s.start}-${s.end}\n`;
    md += '\n';
  }
} else md += '_(aucun)_\n\n';

writeFileSync(join(outputDir, 'COVERAGE-GLOBAL.md'), md);

// ─── 5. Résumé stdout ───────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════════════════════════');
console.log('  CARTE DE COUVERTURE 1:1 GLOBALE (décomp src/*.c)');
console.log('══════════════════════════════════════════════════════════════════');
console.log(`Décomp : ${decompPath}`);
console.log(`Citations .c totales dans notre src/ : ${totalCites}`);
console.log(`Fichiers .c (≥${minFuncs} fn) : ${eligible.length} · fonctions : ${totalCoveredAll}/${totalFuncsAll} couvertes (${totalFuncsAll ? Math.round((totalCoveredAll / totalFuncsAll) * 100) : 0}%)`);
console.log(`  🟢 100% : ${fullyCovered.length}   🟡 partiels : ${partial.length}   🔴 jamais touchés : ${untouched.length}`);
console.log(`\nTOP ${topN} plus gros trous (fonctions non couvertes) :`);
console.log('  ' + 'fichier'.padEnd(34) + 'couv/tot   %    gaps  cites');
for (const r of byGap.slice(0, topN)) {
  console.log(`  ${r.file.padEnd(34)}${String(r.covered + '/' + r.totalFuncs).padEnd(10)} ${String(r.pct + '%').padEnd(5)}${String(r.uncovered.length).padEnd(6)}${r.cites}`);
}
console.log(`\nRapport complet : audit-reports/1to1/COVERAGE-GLOBAL.md`);
console.log(`Détail d'un fichier : node scripts/audit-coverage-global.mjs --file=<nom>.c`);
console.log('══════════════════════════════════════════════════════════════════');
