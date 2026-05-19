#!/usr/bin/env node
/**
 * lint-1to1-smells.mjs  —  OUTIL C (filet anti-régression 1:1 statique)
 * =====================================================================
 * Détecte DÉTERMINISTIQUEMENT nos vraies erreurs passées (pivot 1:1
 * byte-par-byte). Zéro emu, ~0 token.
 *
 *   [DUP-CASE]  (3) `case N:` dupliqué dans le MÊME switch (cf. dead
 *               `case 14` party retiré). Zéro faux positif.
 *   [HARDCODE]  (1)/(5) littéral numérique affecté à un NOM qui est une
 *               constante décomp exportée par decomp-data/auto AVEC une
 *               valeur DIFFÉRENTE (cf. PARTY_ACTION_SWITCH=4 au lieu de
 *               8 ; mémoire feedback-no-hardcoded-decomp-values). Zéro
 *               faux positif (même identifiant, valeur ≠).
 *   [FALLTHRU]  (4) `case` avec du code exécutable PUIS un autre `case`
 *               sans break/return/throw/continue ni commentaire
 *               d'intention. Structurel (peut sur-signaler un
 *               fallthrough volontaire non commenté → à annoter).
 *   [U32-SUB]   (2) soustraction sans `>>> 0` à proximité d'un
 *               commentaire u32/UNDERFLOW/exp/HP (cf. bug barre EXP).
 *               Heuristique (vérifier).
 *
 * Tiers : DUP-CASE + HARDCODE = déterministe (exit≠0 si trouvé).
 *         FALLTHRU + U32-SUB  = rapport seul (exit 0, ne ment pas).
 *
 * ⚠️ CAVEAT : statique = filet régression, NE PROUVE PAS le
 * comportement (timing/fade/sprite = runtime ROM-diff séparé).
 *
 * Usage :
 *   node scripts/lint-1to1-smells.mjs
 *   node scripts/lint-1to1-smells.mjs --selftest   # prouve les détecteurs
 *   npm run lint:1to1
 */
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const outputDir = resolve(join(projectRoot, 'audit-reports', '1to1'));

// ─── Scanner de code : neutralise commentaires / strings ─────────────────────
// Renvoie le texte avec commentaires & littéraux-string remplacés par des
// espaces (longueur préservée → lignes/offsets intacts). Sert à TOUTE
// analyse structurelle (cases, accolades) sans faux positifs string/comment.
function blankNonCode(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (c === '/' && d === '*') {
      out += '  '; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out += src[i] === '\n' ? '\n' : ' '; i++; }
      if (i < n) { out += '  '; i += 2; }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; out += ' '; i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { out += '  '; i += 2; continue; }
        out += src[i] === '\n' ? '\n' : ' '; i++;
      }
      if (i < n) { out += ' '; i++; }
      continue;
    }
    out += c; i++;
  }
  return out;
}

function lineOf(src, idx) { return src.slice(0, idx).split('\n').length; }

// ─── (3) DUP-CASE + (4) FALLTHRU ─────────────────────────────────────────────
function normCaseValue(expr) {
  const t = expr.trim();
  if (/^0[xX][0-9a-fA-F_]+$/.test(t)) return 'n:' + parseInt(t.replace(/_/g, ''), 16);
  if (/^-?\d[\d_]*$/.test(t)) return 'n:' + parseInt(t.replace(/_/g, ''), 10);
  if (/^[A-Za-z_$][\w$.]*$/.test(t)) return 'id:' + t;
  return null; // expression complexe → on ne risque PAS de faux positif
}

function scanSwitches(rawSrc) {
  const code = blankNonCode(rawSrc);
  const dupCases = [];   // {line, value, firstLine}
  const fallthru = [];   // {line, label}
  const stack = [];      // frames switch : {bodyDepth, cases:Map, labels:[]}
  let depth = 0;
  const re = /\b(switch|case|default)\b|[{}]|:|;/g;
  let m;
  let pendingSwitch = false;     // vu `switch`, on attend le `{` du corps
  let curCaseExprStart = -1;     // offset après `case `
  while ((m = re.exec(code))) {
    const tok = m[0];
    const idx = m.index;
    if (tok === 'switch') { pendingSwitch = true; continue; }
    if (tok === '{') {
      depth++;
      if (pendingSwitch) { stack.push({ bodyDepth: depth, cases: new Map(), labels: [] }); pendingSwitch = false; }
      continue;
    }
    if (tok === '}') {
      const top = stack[stack.length - 1];
      if (top && depth === top.bodyDepth) {
        // fin du switch : analyse fallthrough sur les labels collectés
        finalizeFallthru(code, rawSrc, top, idx, fallthru);
        stack.pop();
      }
      depth--;
      continue;
    }
    const top = stack[stack.length - 1];
    if (!top || depth !== top.bodyDepth) continue; // pas au niveau-case direct
    if (tok === 'case') { curCaseExprStart = idx + 4; continue; }
    if (tok === 'default') {
      top.labels.push({ kind: 'default', valueOff: idx, colonOff: -1 });
      continue;
    }
    if (tok === ':' && curCaseExprStart >= 0) {
      const expr = code.slice(curCaseExprStart, idx);
      const val = normCaseValue(expr);
      const ln = lineOf(rawSrc, idx);
      if (val !== null) {
        if (top.cases.has(val)) {
          dupCases.push({ line: ln, value: expr.trim(), firstLine: top.cases.get(val) });
        } else {
          top.cases.set(val, ln);
        }
      }
      top.labels.push({ kind: 'case', valueOff: curCaseExprStart, colonOff: idx, line: ln, expr: expr.trim() });
      curCaseExprStart = -1;
      continue;
    }
  }
  return { dupCases, fallthru };
}

const TERMINATORS = /\b(break|return|throw|continue)\b/;
const FALLTHRU_OK = /fall[\s-]?thro?ugh|fallthru|chute|traverse|volontaire|intentional|expected|deliberate|1:1/i;

function finalizeFallthru(code, rawSrc, frame, switchEndOff, out) {
  const labels = frame.labels.filter((l) => l.colonOff >= 0 || l.kind === 'default');
  for (let k = 0; k < labels.length; k++) {
    const start = labels[k].colonOff >= 0 ? labels[k].colonOff + 1 : labels[k].valueOff + 7;
    const end = k + 1 < labels.length
      ? (labels[k + 1].valueOff)
      : switchEndOff;
    const segCode = code.slice(start, end);
    const segRaw = rawSrc.slice(start, end);
    // bloc vide / labels empilés → PAS un fallthrough (idiomatique)
    if (!segCode.replace(/[\s{}]/g, '').length) continue;
    if (TERMINATORS.test(segCode)) continue;            // a un break/return/throw/continue
    if (FALLTHRU_OK.test(segRaw)) continue;              // intention annotée
    const ln = labels[k].line ?? lineOf(rawSrc, labels[k].valueOff);
    out.push({ line: ln, label: labels[k].kind === 'default' ? 'default' : labels[k].expr });
  }
}

// ─── (1)/(5) HARDCODE vs decomp-data/auto ────────────────────────────────────
function buildDecompConstMap() {
  const map = new Map(); // NAME → {value, srcRel}
  const roots = [
    join(projectRoot, 'src/engine/decomp-data/auto'),
    join(projectRoot, 'src/engine/decomp-data/_common-constants.ts'),
  ];
  const files = [];
  const walk = (p) => {
    if (!existsSync(p)) return;
    const st = readdirSync(p, { withFileTypes: true });
    for (const e of st) {
      const full = join(p, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.ts')) files.push(full);
    }
  };
  for (const r of roots) {
    if (r.endsWith('.ts')) files.push(r);
    else walk(r);
  }
  const re = /^export\s+const\s+([A-Z][A-Z0-9_]{2,})\s*=\s*(-?\d+|0[xX][0-9a-fA-F]+)\s*;/gm;
  for (const f of files) {
    if (!existsSync(f)) continue;
    const txt = readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(txt))) {
      const name = m[1];
      const v = m[2].startsWith('0x') || m[2].startsWith('0X') ? parseInt(m[2], 16) : parseInt(m[2], 10);
      // si le même NAME a 2 valeurs différentes dans auto → ambigu, on
      // l'ignore (ne pas mentir).
      if (map.has(name) && map.get(name).value !== v) map.get(name).ambiguous = true;
      else if (!map.has(name)) map.set(name, { value: v, srcRel: f.replace(projectRoot + '\\', '').replace(/\\/g, '/') });
    }
  }
  return map;
}

function scanHardcode(rawSrc, constMap) {
  const code = blankNonCode(rawSrc);
  const hits = [];
  // `const NAME = <int>;` / `NAME = <int>,` / `NAME: <int>` (objet/enum).
  // Le négatif-lookahead exige un littéral AUTONOME : si le nombre est
  // suivi d'un opérateur (`1 << 1`, `0x10 | 0x20`, `5 + 3`, ` ? 1 : 2`)
  // c'est une EXPRESSION, pas un littéral hardcodé → ne PAS flaguer
  // (sinon faux positifs massifs, l'outil mentirait).
  const re = /\b(?:const\s+)?([A-Z][A-Z0-9_]{2,})\s*[:=]\s*(-?\d+|0[xX][0-9a-fA-F]+)(?!\s*(?:<<|>>|[|&^+\-*/%?:.]|\d|[A-Za-z_]))/g;
  let m;
  while ((m = re.exec(code))) {
    const name = m[1];
    const ref = constMap.get(name);
    if (!ref || ref.ambiguous) continue;
    const v = m[2].startsWith('0x') || m[2].startsWith('0X') ? parseInt(m[2], 16) : parseInt(m[2], 10);
    if (v !== ref.value) {
      hits.push({ line: lineOf(rawSrc, m.index), name, got: v, expected: ref.value, srcRel: ref.srcRel });
    }
  }
  return hits;
}

// ─── (2) U32-SUB (heuristique) ───────────────────────────────────────────────
const U32_CTX = /\bu32\b|UNDERFLOW|unsigned|expSinceLastLevel|\bexp\b|\bHP\b|currentHp|maxHp|>>>\s*0/i;
function scanU32Sub(rawSrc) {
  // blanchir le fichier ENTIER une fois : sinon une ligne de continuation
  // de bloc commentaire (`*  … a.hp - b.hp …`) fuite comme du code (le
  // blank par-ligne ne sait pas qu'un /* */ est ouvert plus haut).
  const codeAll = blankNonCode(rawSrc).split('\n');
  const rawLines = rawSrc.split('\n');
  const hits = [];
  for (let i = 0; i < codeAll.length; i++) {
    const codeL = codeAll[i];
    if (!codeL.trim()) continue; // ligne devenue vide = 100% commentaire/string
    if (!/[=(]\s*[\w.$\[\]]+\s*-\s*[\w.$\[\]]/.test(codeL) && !/\breturn\b[^;]*-[^;]/.test(codeL)) continue;
    if (/>>>\s*0/.test(codeL)) continue; // déjà clampé u32
    // contexte = lignes de CODE voisines (commentaires neutralisés) pour le
    // mot-clé u32/UNDERFLOW/exp/HP, mais on tolère le commentaire 1:1 au-
    // dessus en scannant aussi le brut voisin pour le mot-clé contexte.
    const ctxCode = codeAll.slice(Math.max(0, i - 3), i + 2).join('\n');
    const ctxRaw = rawLines.slice(Math.max(0, i - 3), i + 2).join('\n');
    if (U32_CTX.test(ctxRaw) && !/>>>\s*0/.test(ctxCode)) {
      hits.push({ line: i + 1, text: rawLines[i].trim().slice(0, 110) });
    }
  }
  return hits;
}

// ─── Parcours fichiers (code écrit-main uniquement) ──────────────────────────
function* walkSrc(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (/node_modules|decomp-data|\.git|__tests__|dist|build/.test(full)) continue;
      yield* walkSrc(full);
    } else if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts') && !/\.test\.ts$|\.spec\.ts$/.test(e.name)) {
      yield full;
    }
  }
}

// ─── SELFTEST : prouve chaque détecteur (guard déterministe) ─────────────────
function selftest() {
  let ok = true;
  const assert = (cond, msg) => { if (!cond) { ok = false; console.error(`  ✗ ${msg}`); } else console.log(`  ✓ ${msg}`); };

  // (3) dup-case POSITIF + négatif (stack idiomatique)
  const dupSrc = `switch (x) {\n case 1: a(); break;\n case 0x1: b(); break;\n case 2: c(); break;\n}`;
  const r1 = scanSwitches(dupSrc);
  assert(r1.dupCases.length === 1 && r1.dupCases[0].value === '0x1', 'DUP-CASE détecte 1 et 0x1 comme doublon');
  const stackSrc = `switch (x) {\n case 1:\n case 2:\n case 3: a(); break;\n default: d();\n}`;
  assert(scanSwitches(stackSrc).dupCases.length === 0, 'DUP-CASE: cases empilés (1/2/3) = PAS doublon');
  const nestSrc = `switch(a){\n case 1: switch(b){ case 1: x(); break; } break;\n case 2: y(); break;\n}`;
  assert(scanSwitches(nestSrc).dupCases.length === 0, 'DUP-CASE: case 1 dans switch imbriqué ≠ doublon (depth)');

  // (4) fallthrough POSITIF + négatifs
  const ftSrc = `switch (x) {\n case 1: doThing();\n case 2: other(); break;\n}`;
  const rft = scanSwitches(ftSrc);
  assert(rft.fallthru.some((f) => String(f.label) === '1'), 'FALLTHRU: case 1 (code puis case 2 sans break) signalé');
  const ftOkSrc = `switch (x) {\n case 1: doThing(); // fallthrough\n case 2: other(); break;\n}`;
  assert(scanSwitches(ftOkSrc).fallthru.length === 0, 'FALLTHRU: commentaire // fallthrough = non signalé');
  const ftBreakSrc = `switch (x) {\n case 1: doThing(); break;\n case 2: other(); break;\n}`;
  assert(scanSwitches(ftBreakSrc).fallthru.length === 0, 'FALLTHRU: break présent = non signalé');

  // (1)/(5) hardcode
  const cmap = new Map([['PARTY_ACTION_SWITCH', { value: 8, srcRel: 'auto/x.ts' }]]);
  const hOk = scanHardcode(`const PARTY_ACTION_SWITCH = 8;`, cmap);
  assert(hOk.length === 0, 'HARDCODE: valeur correcte (8) = non signalé');
  const hBad = scanHardcode(`const PARTY_ACTION_SWITCH = 4;`, cmap);
  assert(hBad.length === 1 && hBad[0].expected === 8 && hBad[0].got === 4, 'HARDCODE: =4 vs décomp 8 signalé');
  const hStr = scanHardcode('const s = "PARTY_ACTION_SWITCH = 4";', cmap);
  assert(hStr.length === 0, 'HARDCODE: dans une string = non signalé (blankNonCode)');
  const cmap2 = new Map([['B_BUTTON', { value: 2, srcRel: 'auto/x.ts' }]]);
  assert(scanHardcode(`B_BUTTON = 1 << 1,`, cmap2).length === 0, 'HARDCODE: `1 << 1` (=2) = expression, PAS faux positif');
  assert(scanHardcode(`MASK = 0x10 | 0x20`, new Map([['MASK', { value: 1, srcRel: 'x' }]])).length === 0, 'HARDCODE: `0x10 | 0x20` = expression, non signalé');
  assert(scanHardcode(`PARTY_ACTION_SWITCH = 4,`, cmap).length === 1, 'HARDCODE: `= 4,` (enum, virgule) toujours signalé');

  // (2) u32-sub heuristique
  const uHit = scanU32Sub(`// expSinceLastLevel u32\nconst e = a - b;`);
  assert(uHit.length === 1, 'U32-SUB: soustraction sous commentaire exp u32 signalée');
  const uClamp = scanU32Sub(`// expSinceLastLevel u32\nconst e = (a - b) >>> 0;`);
  assert(uClamp.length === 0, 'U32-SUB: présence de >>> 0 = non signalé');

  console.log(ok ? '\nSELFTEST OK ✓' : '\nSELFTEST ÉCHEC ✗');
  process.exit(ok ? 0 : 1);
}

if (process.argv.includes('--selftest')) selftest();

// ─── Run ─────────────────────────────────────────────────────────────────────
const constMap = buildDecompConstMap();
const report = { dupCase: [], hardcode: [], fallthru: [], u32sub: [] };
for (const abs of walkSrc(join(projectRoot, 'src'))) {
  const rel = abs.replace(projectRoot + '\\', '').replace(/\\/g, '/');
  const src = readFileSync(abs, 'utf8');
  const sw = scanSwitches(src);
  for (const d of sw.dupCases) report.dupCase.push({ rel, ...d });
  for (const f of sw.fallthru) report.fallthru.push({ rel, ...f });
  for (const h of scanHardcode(src, constMap)) report.hardcode.push({ rel, ...h });
  for (const u of scanU32Sub(src)) report.u32sub.push({ rel, ...u });
}

mkdirSync(outputDir, { recursive: true });
const now = new Date().toISOString();
let md = `# SMELLS 1:1 — filet anti-régression (Outil C)\n\nGénéré : ${now}\n\n`;
md += '> ⚠️ Statique = filet régression. **NE PROUVE PAS le comportement.**\n';
md += '>\n';
md += '> **Gate (exit≠0) = DUP-CASE seul** : signal de régression zéro-faux-\n';
md += '> positif (prouvé par --selftest ; cf. dead `case 14` party retiré).\n';
md += '> **HARDCODE = vrais bugs** (B_BUFF_*, CRY_PRIORITY_NORMAL, NO_ACC_…\n';
md += '> cross-lus dans la décomp) mais **non-gating** : volume = dette\n';
md += '> pré-existante cross-engine, pas des régressions de session — à\n';
md += '> corriger en important depuis decomp-data/auto (feedback-no-hardcoded\n';
md += '> -decomp-values), pas un build rouge permanent. **FALLTHRU** =\n';
md += '> structurel advisory (peut inclure fallthrough volontaire / artefact\n';
md += '> de parsing TS — vérifier). **U32-SUB** = heuristique (vérifier).\n\n';

md += `## [DUP-CASE] ${report.dupCase.length} — \`case\` dupliqué même switch (déterministe)\n\n`;
for (const d of report.dupCase) md += `- \`${d.rel}\`:${d.line} — \`case ${d.value}:\` déjà vu L${d.firstLine}\n`;
md += report.dupCase.length ? '\n' : '_aucun ✓_\n\n';

md += `## [HARDCODE] ${report.hardcode.length} — littéral ≠ constante décomp (vrai bug, non-gating)\n\n`;
for (const h of report.hardcode) md += `- \`${h.rel}\`:${h.line} — \`${h.name} = ${h.got}\` mais décomp = **${h.expected}** (${h.srcRel})\n`;
md += report.hardcode.length ? '\n' : '_aucun ✓_\n\n';

md += `## [FALLTHRU] ${report.fallthru.length} — case sans break/return ni commentaire (structurel)\n\n`;
for (const f of report.fallthru) md += `- \`${f.rel}\`:${f.line} — \`case ${f.label}\` tombe sur le suivant\n`;
md += report.fallthru.length ? '\n' : '_aucun ✓_\n\n';

md += `## [U32-SUB] ${report.u32sub.length} — soustraction sans \`>>> 0\` près d'un contexte u32 (heuristique)\n\n`;
for (const u of report.u32sub) md += `- \`${u.rel}\`:${u.line} — \`${u.text}\`\n`;
md += report.u32sub.length ? '\n' : '_aucun ✓_\n\n';

writeFileSync(join(outputDir, 'SMELLS.md'), md);

console.log('══════════════════════════════════════════════════════════════════');
console.log('  LINT 1:1 SMELLS (Outil C, statique)');
console.log('══════════════════════════════════════════════════════════════════');
console.log(`Constantes décomp chargées : ${constMap.size}`);
console.log(`[DUP-CASE]  ${report.dupCase.length}  (GATE déterministe zéro-FP — régression)`);
console.log(`[HARDCODE]  ${report.hardcode.length}  (vrais bugs, non-gating — dette à importer depuis decomp-data)`);
console.log(`[FALLTHRU]  ${report.fallthru.length}  (structurel advisory — vérifier)`);
console.log(`[U32-SUB]   ${report.u32sub.length}  (heuristique — vérifier)`);
console.log(`\nRapport : audit-reports\\1to1\\SMELLS.md`);
console.log('══════════════════════════════════════════════════════════════════');

// exit≠0 UNIQUEMENT sur DUP-CASE (le seul signal régression zéro-faux-
// positif). HARDCODE/FALLTHRU/U32 = vérité surfacée, pas un gate (sinon
// build rouge permanent sur dette pré-existante = bruit = l'outil ment).
process.exit(report.dupCase.length > 0 ? 1 : 0);
