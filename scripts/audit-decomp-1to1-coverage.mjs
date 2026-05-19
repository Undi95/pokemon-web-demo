#!/usr/bin/env node
/**
 * audit-decomp-1to1-coverage.mjs  —  OUTIL A (vérif 1:1 statique)
 * ===============================================================
 * Scanner de PROVENANCE par citation. On cite systématiquement
 * `1:1 décomp <fichier>.(c|h|s):<ligne>` (ou `:l1-l2`, préfixes
 * `data/`/`constants/`) dans chaque port. Cet outil exploite cette
 * discipline pour produire 3 rapports DÉTERMINISTES (zéro token, zéro
 * emu) sur les fichiers décomp « audités » :
 *
 *   - GAPS   : fonctions décomp SANS aucune citation chevauchante
 *              → jamais portées / jamais vérifiées 1:1.
 *   - UNCITED: nos fonctions TS du module-port mappé SANS aucune
 *              citation décomp dans leur corps → adapté / à justifier.
 *   - STALE  : citation dont la ligne tombe hors-bornes du fichier ou
 *              hors de tout symbole → ref périmée / inventée.
 *
 * ⚠️ CAVEAT (à toujours redire) : le statique prouve la COUVERTURE et
 * la TRAÇABILITÉ + sert de filet anti-régression. Il ne PROUVE PAS le
 * comportement. Les bugs timing/fade/sprite (camion 1 frame, fade
 * entrecoupé, sprite enfant coupé, Vigoroth) sont runtime → exigent un
 * harnais ROM-diff séparé (mgba-wasm), HORS de cet outil.
 *
 * Usage :
 *   node scripts/audit-decomp-1to1-coverage.mjs
 *   node scripts/audit-decomp-1to1-coverage.mjs --debug-symbols=party_menu.c
 *   node scripts/audit-decomp-1to1-coverage.mjs --debug-ts=party-screen.ts
 *   node scripts/audit-decomp-1to1-coverage.mjs --decomp="D:/.../pokeemeraude"
 *
 * Exit ≠0 SEULEMENT si un fichier de MUST_BE_COMPLETE a des GAPS.
 * MUST_BE_COMPLETE est vide par défaut : on veut un rapport baseline
 * honnête (on n'a volontairement pas porté tout party_menu.c), PAS un
 * build rouge.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ─── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (k) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : null;
};
const decompPath = resolve(getArg('decomp') || resolve(projectRoot, '..', 'decomps', 'pokeemeraude'));
const debugSymbols = getArg('debug-symbols');
const debugTs = getArg('debug-ts');
const outputDir = resolve(getArg('output-dir') || join(projectRoot, 'audit-reports', '1to1'));

// ─── Fail-loud : décomp introuvable = on n'émet PAS de rapport vide ──────────
// (piège connu : script lancé d'un worktree → chemins faux → JSON vides.
//  WORKING-MODE §3 : ne JAMAIS conclure sur un fail silencieux.)
if (!existsSync(decompPath)) {
  console.error(`[FATAL] décomp introuvable : ${decompPath}`);
  console.error(`        passe --decomp="<chemin pokeemeraude>" si non-standard.`);
  process.exit(2);
}

// ─── Set audité (config extensible) ──────────────────────────────────────────
// citeNames = les noms tels qu'ils apparaissent dans nos commentaires.
// kind 'c' = on rapporte les GAPS de fonctions ; 'h' = data tables (signal
// plus faible, section séparée).
const AUDITED = [
  { citeNames: ['party_menu.c'], rel: 'src/party_menu.c', kind: 'c' },
  { citeNames: ['pokemon_summary_screen.c'], rel: 'src/pokemon_summary_screen.c', kind: 'c' },
  { citeNames: ['data/party_menu.h', 'party_menu.h'], rel: 'src/data/party_menu.h', kind: 'h' },
  { citeNames: ['constants/party_menu.h'], rel: 'include/constants/party_menu.h', kind: 'h' },
];

// TS port modules ↔ fichier décomp audité (pour UNCITED).
const PORT_MAPPING = {
  'src/engine/party-screen.ts': ['party_menu.c', 'data/party_menu.h', 'party_menu.h', 'constants/party_menu.h'],
  'src/engine/summary-screen.ts': ['pokemon_summary_screen.c'],
};

// Résout un citeName → chemin absolu décomp (ou null si non audité).
function resolveAuditedFile(citeName) {
  for (const a of AUDITED) {
    if (a.citeNames.includes(citeName)) return { ...a, abs: join(decompPath, a.rel) };
  }
  return null;
}

// ─── Parser symboles C/H (col-0 declarations) ────────────────────────────────
// kind 'func' = définition de fonction (corps à porter) ; 'data' = table/var.
// On exclut prototypes (`…);`) et `extern`. Span = [start, prochainSym-1].
const C_KEYWORDS = new Set([
  'if', 'else', 'while', 'for', 'switch', 'return', 'sizeof', 'do', 'goto',
  'typedef', 'case', 'default', 'break', 'continue',
]);
const ATTR_MACROS = new Set([
  'ALIGNED', 'UNUSED', 'NAKED', 'IWRAM_CODE', 'EWRAM_DATA', 'ASM_DIRECT',
  'NOINLINE', 'NORETURN', 'INLINE',
]);

function stripTrailingComment(line) {
  // retire `// …` et `/* … */` de fin de ligne (best-effort, hors string)
  const i = line.indexOf('//');
  if (i >= 0) line = line.slice(0, i);
  return line.replace(/\/\*.*?\*\/\s*$/, '').replace(/\s+$/, '');
}

function parseCSymbols(content) {
  const lines = content.split('\n');
  const symbols = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || /^\s/.test(raw)) continue;            // indenté = pas un top-level
    if (/^[#}{*\/]/.test(raw)) continue;              // préproc, accolade, commentaire
    if (/^\s*$/.test(raw)) continue;
    if (/^(extern|typedef)\b/.test(raw)) continue;    // déclarations, pas définitions
    const line = stripTrailingComment(raw);
    if (!line) continue;
    const endsSemi = /;\s*$/.test(line);

    // position relative de ( vs [ vs =
    const pParen = line.indexOf('(');
    const pBracket = line.indexOf('[');
    const pEq = line.indexOf('=');

    // ── branche FONCTION : a `(` avant `=`/`[`, ne finit pas par `;` ────────
    if (pParen >= 0 && (pEq < 0 || pParen < pEq) && (pBracket < 0 || pParen < pBracket) && !endsSemi) {
      const m = line.slice(0, pParen + 1).match(/([A-Za-z_]\w*)\s*\($/);
      if (m && !C_KEYWORDS.has(m[1]) && !ATTR_MACROS.has(m[1])) {
        symbols.push({ name: m[1], line: i + 1, kind: 'func' });
        continue;
      }
    }
    // ── branche DATA : table/var `sName[] =` / `gName =` / `struct X {` ─────
    if (pBracket >= 0 || pEq >= 0 || /\b(struct|union|enum)\b[^;]*\{/.test(line)) {
      const m = line.match(/([A-Za-z_]\w*)\s*(?:\[[^\]]*\])*\s*(?:\[|=|:)/);
      if (m && !C_KEYWORDS.has(m[1]) && !ATTR_MACROS.has(m[1])) {
        symbols.push({ name: m[1], line: i + 1, kind: 'data' });
        continue;
      }
    }
  }
  // span de chaque symbole = jusqu'au début du suivant - 1 (sinon EOF)
  for (let k = 0; k < symbols.length; k++) {
    symbols[k].start = symbols[k].line;
    symbols[k].end = k + 1 < symbols.length ? symbols[k + 1].line - 1 : lines.length;
  }
  return { symbols, totalLines: lines.length };
}

// ─── Extracteur citations (texte commentaires uniquement) ────────────────────
// Couvre : main.c | item.c:243 | foo.c:2636-2675 | foo.c:2636..2675 |
// (data/party_menu.h:72-77) | constants/party_menu.h:68 | h:1015+ | h:566/568
// `(?![A-Za-z0-9_])` après l'extension : sinon `ctx.spriteId`→`ctx.s`,
// `gMain.state`→`gMain.s` (accès propriété TS) polluent. Les vraies
// citations sont suivies de `:`, espace, `)`, `,`, backtick ou EOL.
const DECOMP_REF =
  /(?:\b(data|constants|src|include|gba)\/)?([A-Za-z_][\w]*\.(?:c|h|s|inc))(?![A-Za-z0-9_])(?::(\d+)(?:\s*(?:-|\.\.)\s*(\d+))?((?:\/\d+)+)?\+?)?/g;

function extractComments(content) {
  // renvoie [{line, text}] : pour chaque ligne source, la portion commentaire.
  const lines = content.split('\n');
  const out = [];
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    let commentText = '';
    if (inBlock) {
      const end = ln.indexOf('*/');
      if (end >= 0) { commentText += ln.slice(0, end); inBlock = false; }
      else commentText += ln;
    }
    if (!inBlock) {
      // commentaires ligne
      const li = ln.indexOf('//');
      if (li >= 0) commentText += ' ' + ln.slice(li + 2);
      // commentaires bloc ouverts sur cette ligne
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
      cites.push({
        tsLine: line,
        pathSeg: pathSeg || null,
        fileName,
        citeName: pathSeg ? `${pathSeg}/${fileName}` : fileName,
        startLine: n1 ? +n1 : null,
        endLine: n2 ? +n2 : (n1 ? +n1 : null),
        lineNums,
        raw: m[0],
      });
    }
  }
  return cites;
}

// ─── Parser fonctions TS (top-level + méthodes de classe) ────────────────────
function parseTsFunctions(content) {
  const lines = content.split('\n');
  const fns = [];
  const sigRe =
    /^(\s*)(?:export\s+)?(?:public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(?:async\s+)?(?:function\s+|get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\([^;]*$/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(sigRe);
    if (!m) continue;
    const name = m[2];
    if (['if', 'for', 'while', 'switch', 'return', 'catch', 'function'].includes(name)) continue;
    // trouve le `{` ouvrant (même ligne ou lignes suivantes, avant un `;`)
    let bi = i, openPos = -1;
    for (let j = i; j < Math.min(i + 8, lines.length); j++) {
      const semi = lines[j].indexOf(';');
      const brace = lines[j].indexOf('{');
      if (brace >= 0 && (semi < 0 || brace < semi)) { bi = j; openPos = brace; break; }
      if (semi >= 0) break; // signature de type / abstract → pas un corps
    }
    if (openPos < 0) continue;
    // brace-match (ignore strings/commentaires basiques)
    let depth = 0, endLine = bi, done = false;
    for (let j = bi; j < lines.length && !done; j++) {
      const s = lines[j];
      let inS = '', blk = false;
      for (let c = (j === bi ? openPos : 0); c < s.length; c++) {
        const ch = s[c], nx = s[c + 1];
        if (blk) { if (ch === '*' && nx === '/') { blk = false; c++; } continue; }
        if (inS) { if (ch === '\\') { c++; continue; } if (ch === inS) inS = ''; continue; }
        if (ch === '/' && nx === '/') break;
        if (ch === '/' && nx === '*') { blk = true; c++; continue; }
        if (ch === '"' || ch === "'" || ch === '`') { inS = ch; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { endLine = j; done = true; break; } }
      }
    }
    // citeStart : remonte le bloc commentaire/JSDoc collé au-dessus de la
    // signature (convention port = `/** 1:1 décomp … */` juste au-dessus →
    // sa ligne < start, sinon faux UNCITED massif).
    let cs = i; // index 0-based de la signature
    while (cs - 1 >= 0 && /^\s*(\/\*\*?|\*\/|\*|\/\/)/.test(lines[cs - 1])) cs--;
    fns.push({ name, start: i + 1, citeStart: cs + 1, end: endLine + 1, size: endLine - i + 1 });
    i = endLine; // ne pas re-scanner l'intérieur (évite faux imbriqués)
  }
  // markerStart : fenêtre de doc remontant au-dessus de la signature en
  // tolérant ≤2 lignes vides + un bloc commentaire/bandeau de section
  // (`/* === 1:1 décomp … :3028 === */`). Bornée par la fin de la fonction
  // précédente (ne pas s'attribuer son commentaire de queue).
  for (let k = 0; k < fns.length; k++) {
    const lower = k > 0 ? fns[k - 1].end : 0; // index 1-based exclusif
    let cs = fns[k].start - 1; // 0-based de la signature
    let blanks = 0;
    while (cs - 1 >= lower) {
      const L = lines[cs - 1];
      if (/^\s*$/.test(L)) { if (++blanks > 2) break; cs--; continue; }
      if (/^\s*(\/\*\*?|\*\/|\*|\/\/|={3,})/.test(L)) { cs--; blanks = 0; continue; }
      break;
    }
    fns[k].markerStart = cs + 1;
  }
  return fns;
}

// ─── Chargement + parsing des fichiers décomp audités ────────────────────────
const decompFiles = {}; // citeName-canonique → {symbols,totalLines,rel}
for (const a of AUDITED) {
  const abs = join(decompPath, a.rel);
  if (!existsSync(abs)) {
    console.error(`[FATAL] fichier audité manquant : ${abs}`);
    process.exit(2);
  }
  const parsed = parseCSymbols(readFileSync(abs, 'utf8'));
  decompFiles[a.rel] = { ...parsed, rel: a.rel, kind: a.kind, citeNames: a.citeNames };
}

// ─── Mode debug : dump symboles parsés (auto-vérif déterministe) ─────────────
if (debugSymbols) {
  const a = AUDITED.find((x) => x.citeNames.includes(debugSymbols) || x.rel.endsWith(debugSymbols));
  if (!a) { console.error(`inconnu : ${debugSymbols}`); process.exit(2); }
  const df = decompFiles[a.rel];
  console.log(`# ${a.rel} — ${df.symbols.length} symboles (${df.totalLines} lignes)\n`);
  for (const s of df.symbols) {
    console.log(`${String(s.line).padStart(5)}  ${s.kind === 'func' ? 'ƒ' : '·'}  ${s.name}  [${s.start}-${s.end}]`);
  }
  process.exit(0);
}
if (debugTs) {
  const tsPath = join(projectRoot, debugTs.includes('/') ? debugTs : `src/engine/${debugTs}`);
  if (!existsSync(tsPath)) { console.error(`introuvable : ${tsPath}`); process.exit(2); }
  const content = readFileSync(tsPath, 'utf8');
  const fns = parseTsFunctions(content);
  const cites = extractCitations(content);
  console.log(`# ${debugTs} — ${fns.length} fonctions, ${cites.length} citations\n`);
  for (const f of fns) {
    const inside = cites.filter((c) => c.tsLine >= f.citeStart && c.tsLine <= f.end);
    console.log(`${String(f.citeStart).padStart(5)}-${String(f.end).padEnd(5)} ${f.name}  (${f.size}l, ${inside.length} cite)`);
  }
  process.exit(0);
}

// ─── Scan TS : collecter toutes les citations vers fichiers audités ──────────
function* walkTs(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (/node_modules|decomp-data|\.git/.test(full)) continue;
      yield* walkTs(full);
    } else if (ent.name.endsWith('.ts')) yield full;
  }
}

const allCitations = []; // {tsRel, ...cite}
for (const tsAbs of walkTs(join(projectRoot, 'src'))) {
  const tsRel = tsAbs.replace(projectRoot + '\\', '').replace(/\\/g, '/');
  const content = readFileSync(tsAbs, 'utf8');
  for (const c of extractCitations(content)) {
    allCitations.push({ tsRel, ...c });
  }
}

// citations qui ciblent un fichier audité
const auditedCites = [];
for (const c of allCitations) {
  const af = resolveAuditedFile(c.citeName) || resolveAuditedFile(c.fileName);
  if (af) auditedCites.push({ ...c, auditedRel: af.rel });
}

// ─── Rapport GAPS ────────────────────────────────────────────────────────────
function overlaps(citeNums, s) {
  // une citation couvre un symbole si une de ses lignes ∈ [start,end]
  // OU si son range chevauche [start,end].
  for (const ln of citeNums) if (ln >= s.start && ln <= s.end) return true;
  return false;
}
const gapsReport = [];
for (const a of AUDITED.filter((x) => x.kind === 'c')) {
  const df = decompFiles[a.rel];
  const cites = auditedCites.filter((c) => c.auditedRel === a.rel && c.lineNums.length);
  const fileLevelCites = auditedCites.filter((c) => c.auditedRel === a.rel && !c.lineNums.length).length;
  const funcs = df.symbols.filter((s) => s.kind === 'func');
  const uncovered = funcs.filter((s) => !cites.some((c) => overlaps(c.lineNums, s)));
  gapsReport.push({
    rel: a.rel,
    totalFuncs: funcs.length,
    covered: funcs.length - uncovered.length,
    uncovered,
    fileLevelCites,
  });
}

// ─── Rapport UNCITED (2 niveaux, honnête vs le style RÉEL) ───────────────────
// PRECISE : citation `<fichier audité>.c|h:N` dans [citeStart, end] → provenance
//           ligne-précise (idéal).
// MARKER  : marqueur de discipline `1:1`/`décomp` dans [markerStart, end] —
//           couvre les BANDEAUX de section (`/* === 1:1 décomp … :3028 === */`
//           au-dessus d'un groupe) et les notes `// 1:1 : ConvertInt…`. C'est
//           le style réel de summary-screen.ts ; le rater = outil qui ment.
// UNCITED-HARD = NI precise NI marker → vraiment adapté / non documenté
//                (= la liste ACTIONNABLE « à justifier »).
const MARKER_RE = /1:1|d[ée]comp/i;
const uncitedReport = [];
for (const [tsRel, citeNames] of Object.entries(PORT_MAPPING)) {
  const tsAbs = join(projectRoot, tsRel);
  if (!existsSync(tsAbs)) { uncitedReport.push({ tsRel, error: 'TS file missing' }); continue; }
  const content = readFileSync(tsAbs, 'utf8');
  const fns = parseTsFunctions(content);
  const comments = extractComments(content); // [{line,text}]
  const cites = extractCitations(content).filter(
    (c) => c.lineNums.length && (citeNames.includes(c.citeName) || citeNames.includes(c.fileName)));
  let precise = 0, markerOnly = 0;
  const hard = [];
  for (const f of fns) {
    const isPrecise = cites.some((c) => c.tsLine >= f.citeStart && c.tsLine <= f.end);
    const hasMarker = comments.some((cm) => cm.line >= f.markerStart && cm.line <= f.end && MARKER_RE.test(cm.text));
    if (isPrecise) precise++;
    else if (hasMarker) markerOnly++;
    else hard.push(f);
  }
  uncitedReport.push({
    tsRel, totalFns: fns.length, precise, markerOnly,
    uncited: hard.sort((a, b) => b.size - a.size),
  });
}

// ─── Rapport STALE ───────────────────────────────────────────────────────────
// STALE = UNIQUEMENT hors-bornes (ligne > total fichier). C'est le signal
// DÉTERMINISTE zéro-faux-positif (ref périmée/inventée past-EOF, ex.
// party_menu.c:7144 pour un fichier de 6431 lignes). On NE flague PAS
// « hors de tout symbole » : les #define/enum/régions macro/licence sont
// des cibles de citation LÉGITIMES et notre parser ne les modélise pas →
// ce serait un outil qui ment (WORKING-MODE §3).
const staleReport = [];
for (const c of auditedCites) {
  if (!c.lineNums.length) continue;
  const df = decompFiles[c.auditedRel];
  const distinct = [...new Set([c.startLine, c.endLine].filter((v) => v != null))];
  for (const ln of distinct) {
    if (ln > df.totalLines) {
      staleReport.push({ ...c, badLine: ln, why: `HORS-BORNES (fichier ${df.totalLines} lignes)` });
    }
  }
}
// refs vers un .c décomp réel mais HORS du set audité (informationnel :
// pas stale, juste « pas encore audité » → étendre AUDITED au fur).
const unauditedFiles = new Map();
for (const c of allCitations) {
  if (!/\.c$/.test(c.fileName)) continue; // .c only (.s = bruit propriété/BIOS)
  if (resolveAuditedFile(c.citeName) || resolveAuditedFile(c.fileName)) continue;
  if (!existsSync(join(decompPath, 'src', c.fileName))) continue; // pas un vrai .c décomp
  if (!unauditedFiles.has(c.fileName)) unauditedFiles.set(c.fileName, []);
  unauditedFiles.get(c.fileName).push(`${c.tsRel}:${c.tsLine}`);
}

// ─── Écriture des rapports ───────────────────────────────────────────────────
mkdirSync(outputDir, { recursive: true });
const now = new Date().toISOString();
const CAVEAT =
  '> ⚠️ Statique = couverture + traçabilité + filet régression. **NE PROUVE PAS le comportement.**\n' +
  '> Bugs timing/fade/sprite = runtime ROM-diff séparé (mgba-wasm), hors de cet outil.\n';

let gapsMd = `# GAPS — fonctions décomp sans citation 1:1\n\nGénéré : ${now}\n\n${CAVEAT}\n`;
for (const g of gapsReport) {
  const pct = g.totalFuncs ? Math.round((g.covered / g.totalFuncs) * 100) : 0;
  gapsMd += `## \`${g.rel}\`\n\n`;
  gapsMd += `Couverture fonctions : **${g.covered}/${g.totalFuncs} (${pct}%)** — ${g.uncovered.length} GAPS`;
  gapsMd += g.fileLevelCites ? ` · ${g.fileLevelCites} citation(s) fichier-niveau (sans \`:ligne\`)\n\n` : `\n\n`;
  for (const s of g.uncovered) gapsMd += `- \`${s.name}\` @ L${s.start}-${s.end}\n`;
  gapsMd += '\n';
}

let uncitedMd = `# UNCITED — fonctions TS du port sans provenance décomp\n\nGénéré : ${now}\n\n${CAVEAT}\n`;
uncitedMd += '> **PRECISE** = citation `fichier.c:N` (idéal) · **MARKER** = marqueur `1:1`/`décomp`\n';
uncitedMd += '> dans le corps ou un bandeau de section (provenance OK, ligne imprécise) ·\n';
uncitedMd += '> **HARD** = ni l\'un ni l\'autre → vraiment adapté / à justifier (liste actionnable).\n\n';
for (const u of uncitedReport) {
  if (u.error) { uncitedMd += `## \`${u.tsRel}\`\n\n❌ ${u.error}\n\n`; continue; }
  const pp = u.totalFns ? Math.round((u.precise / u.totalFns) * 100) : 0;
  const tp = u.totalFns ? Math.round(((u.precise + u.markerOnly) / u.totalFns) * 100) : 0;
  uncitedMd += `## \`${u.tsRel}\`\n\n`;
  uncitedMd += `PRECISE **${u.precise}/${u.totalFns} (${pp}%)** · +MARKER **${u.precise + u.markerOnly}/${u.totalFns} (${tp}%)** · HARD **${u.uncited.length}** (triées par taille)\n\n`;
  for (const f of u.uncited) uncitedMd += `- \`${f.name}\` (L${f.start}-${f.end}, ${f.size}l)\n`;
  uncitedMd += '\n';
}

let staleMd = `# STALE — citations décomp périmées / hors-symbole\n\nGénéré : ${now}\n\n${CAVEAT}\n`;
if (!staleReport.length) staleMd += '_Aucune citation hors-bornes. ✓ (STALE = ligne > total fichier uniquement — zéro faux positif)_\n\n';
const byFile = {};
for (const s of staleReport) (byFile[s.tsRel] ??= []).push(s);
for (const [tsRel, list] of Object.entries(byFile)) {
  staleMd += `## \`${tsRel}\`\n\n`;
  for (const s of list) staleMd += `- L${s.tsLine} → \`${s.raw}\` : ligne ${s.badLine} ${s.why}\n`;
  staleMd += '\n';
}
if (unauditedFiles.size) {
  staleMd += `## Fichiers .c décomp RÉELS cités mais hors set audité (informationnel — étendre AUDITED au fur)\n\n`;
  const sorted = [...unauditedFiles.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [f, where] of sorted) {
    staleMd += `- \`${f}\` cité ${where.length}× (ex. ${where.slice(0, 3).join(', ')})\n`;
  }
  staleMd += '\n';
}

writeFileSync(join(outputDir, 'GAPS.md'), gapsMd);
writeFileSync(join(outputDir, 'UNCITED.md'), uncitedMd);
writeFileSync(join(outputDir, 'STALE.md'), staleMd);

// ─── Résumé stdout ───────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════════════════════════');
console.log('  AUDIT 1:1 — provenance par citation (Outil A, statique)');
console.log('══════════════════════════════════════════════════════════════════');
console.log(`Décomp : ${decompPath}`);
console.log(`Citations TS totales : ${allCitations.length} · vers fichiers audités : ${auditedCites.length}\n`);
console.log('GAPS (fonctions décomp non citées) :');
for (const g of gapsReport) {
  const pct = g.totalFuncs ? Math.round((g.covered / g.totalFuncs) * 100) : 0;
  console.log(`  ${g.rel.padEnd(34)} ${g.covered}/${g.totalFuncs} (${pct}%)  → ${g.uncovered.length} gaps`);
}
console.log('\nUNCITED (PRECISE = file:line · +MARKER = 1:1/bandeau · HARD = à justifier) :');
for (const u of uncitedReport) {
  if (u.error) { console.log(`  ${u.tsRel} : ${u.error}`); continue; }
  const tp = u.totalFns ? Math.round(((u.precise + u.markerOnly) / u.totalFns) * 100) : 0;
  console.log(`  ${u.tsRel.padEnd(30)} precise=${u.precise} +marker=${u.precise + u.markerOnly}/${u.totalFns} (${tp}%) → HARD ${u.uncited.length}`);
}
console.log(`\nSTALE : ${staleReport.length} citation(s) HORS-BORNES (ref périmée/inventée) · ${unauditedFiles.size} fichier(s) .c décomp réel hors set audité (info)`);
console.log(`\nRapports : ${outputDir.replace(projectRoot + '\\', '')}\\{GAPS,UNCITED,STALE}.md`);
console.log('══════════════════════════════════════════════════════════════════');

// ─── Exit code : gate UNIQUEMENT sur allowlist « doit être complet » ─────────
const MUST_BE_COMPLETE = []; // ex. 'src/party_menu.c' quand on décide qu'il DOIT être 100% cité
let fail = false;
for (const g of gapsReport) {
  if (MUST_BE_COMPLETE.includes(g.rel) && g.uncovered.length) {
    console.error(`[GATE] ${g.rel} dans MUST_BE_COMPLETE mais ${g.uncovered.length} GAPS.`);
    fail = true;
  }
}
process.exit(fail ? 1 : 0);
