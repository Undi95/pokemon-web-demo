#!/usr/bin/env node
/**
 * pair-decomp-port.mjs  —  OUTIL B (pairing décomp ↔ port, 1:1 statique)
 * =====================================================================
 * EXTRACTION SEULE, 0 token. Pour chaque citation `…<decompFile>:<ligne>`
 * dans notre TS, imprime le corps C décomp (fonction contenant la ligne)
 * ‖ notre port TS (fonction citante), en PAIRES scopées.
 *
 * But : la vérif 1:1 = passe LLM **bornée** ou humaine sur des PAIRES,
 * JAMAIS relecture aveugle d'un fichier entier (= le gouffre token à
 * éviter). Cet outil produit la checklist + sort les paires sur demande.
 *
 * ⚠️ CAVEAT : statique = aligne pour relecture, NE PROUVE PAS le
 * comportement (timing/fade/sprite = runtime ROM-diff séparé).
 *
 * Usage :
 *   node scripts/pair-decomp-port.mjs party_menu.c            # index
 *   node scripts/pair-decomp-port.mjs party_menu.c Switch     # filtre nom
 *   node scripts/pair-decomp-port.mjs party_menu.c --print=DisplayPartyPokemonData
 *   node scripts/pair-decomp-port.mjs pokemon_summary_screen.c --all
 *   node scripts/pair-decomp-port.mjs --decomp="D:/.../pokeemeraude" party_menu.c
 */
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const argv = process.argv.slice(2);
const getOpt = (k) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
const decompPath = resolve(getOpt('decomp') || resolve(projectRoot, '..', 'decomps', 'pokeemeraude'));
const printFunc = getOpt('print');
const wantAll = argv.includes('--all');
const positional = argv.filter((x) => !x.startsWith('--'));
const decompArg = positional[0];
const nameFilter = positional[1] || null;
const outputDir = resolve(join(projectRoot, 'audit-reports', '1to1', 'pairs'));

if (!decompArg) {
  console.error('usage: node scripts/pair-decomp-port.mjs <decompFile> [nameFilter] [--print=Func] [--all]');
  console.error('  ex : node scripts/pair-decomp-port.mjs party_menu.c Switch');
  process.exit(2);
}
if (!existsSync(decompPath)) {
  console.error(`[FATAL] décomp introuvable : ${decompPath} (passe --decomp=...)`);
  process.exit(2);
}

// ─── Résolution du fichier décomp (n'importe lequel, pas que les audités) ────
function resolveDecomp(arg) {
  const cands = [
    join(decompPath, arg),
    join(decompPath, 'src', arg),
    join(decompPath, 'src', 'data', arg.replace(/^data\//, '')),
    join(decompPath, 'include', arg),
    join(decompPath, 'include', 'constants', arg.replace(/^constants\//, '')),
    join(decompPath, arg.replace(/^(data|constants|src|include)\//, (m, p) =>
      p === 'data' ? 'src/data/' : p === 'constants' ? 'include/constants/' : p + '/')),
  ];
  for (const c of cands) if (existsSync(c)) return c;
  return null;
}
const decompAbs = resolveDecomp(decompArg);
if (!decompAbs) { console.error(`[FATAL] fichier décomp introuvable pour "${decompArg}"`); process.exit(2); }
const baseName = decompArg.replace(/^(data|constants|src|include)\//, ''); // pour matcher citeName

// ─── Parsers PROUVÉS (copiés verbatim d'Outil A, déjà auto-vérifiés) ─────────
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
    const pParen = line.indexOf('('), pBracket = line.indexOf('['), pEq = line.indexOf('=');
    if (pParen >= 0 && (pEq < 0 || pParen < pEq) && (pBracket < 0 || pParen < pBracket) && !endsSemi) {
      const m = line.slice(0, pParen + 1).match(/([A-Za-z_]\w*)\s*\($/);
      if (m && !C_KEYWORDS.has(m[1]) && !ATTR_MACROS.has(m[1])) { symbols.push({ name: m[1], line: i + 1, kind: 'func' }); continue; }
    }
    if (pBracket >= 0 || pEq >= 0 || /\b(struct|union|enum)\b[^;]*\{/.test(line)) {
      const m = line.match(/([A-Za-z_]\w*)\s*(?:\[[^\]]*\])*\s*(?:\[|=|:)/);
      if (m && !C_KEYWORDS.has(m[1]) && !ATTR_MACROS.has(m[1])) { symbols.push({ name: m[1], line: i + 1, kind: 'data' }); continue; }
    }
  }
  for (let k = 0; k < symbols.length; k++) {
    symbols[k].start = symbols[k].line;
    symbols[k].end = k + 1 < symbols.length ? symbols[k + 1].line - 1 : lines.length;
  }
  return { symbols, lines };
}
const DECOMP_REF = /(?:\b(data|constants|src|include|gba)\/)?([A-Za-z_][\w]*\.(?:c|h|s|inc))(?![A-Za-z0-9_])(?::(\d+)(?:\s*(?:-|\.\.)\s*(\d+))?((?:\/\d+)+)?\+?)?/g;
function extractComments(content) {
  const lines = content.split('\n');
  const out = [];
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    let t = '';
    if (inBlock) { const e = ln.indexOf('*/'); if (e >= 0) { t += ln.slice(0, e); inBlock = false; } else t += ln; }
    if (!inBlock) {
      const li = ln.indexOf('//'); if (li >= 0) t += ' ' + ln.slice(li + 2);
      let idx = 0;
      while (true) {
        const o = ln.indexOf('/*', idx); if (o < 0) break;
        const c = ln.indexOf('*/', o + 2);
        if (c >= 0) { t += ' ' + ln.slice(o + 2, c); idx = c + 2; } else { t += ' ' + ln.slice(o + 2); inBlock = true; break; }
      }
    }
    if (t) out.push({ line: i + 1, text: t });
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
      if (n1) { if (n2) for (let v = +n1; v <= +n2; v++) lineNums.push(v); else lineNums.push(+n1); if (extra) for (const e of extra.split('/').filter(Boolean)) lineNums.push(+e); }
      cites.push({ tsLine: line, fileName, citeName: pathSeg ? `${pathSeg}/${fileName}` : fileName, lineNums, raw: m[0] });
    }
  }
  return cites;
}
function parseTsFunctions(content) {
  const lines = content.split('\n');
  const fns = [];
  const sigRe = /^(\s*)(?:export\s+)?(?:public\s+|private\s+|protected\s+|static\s+|readonly\s+)*(?:async\s+)?(?:function\s+|get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\([^;]*$/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(sigRe);
    if (!m) continue;
    const name = m[2];
    if (['if', 'for', 'while', 'switch', 'return', 'catch', 'function'].includes(name)) continue;
    let bi = i, openPos = -1;
    for (let j = i; j < Math.min(i + 8, lines.length); j++) {
      const semi = lines[j].indexOf(';'), brace = lines[j].indexOf('{');
      if (brace >= 0 && (semi < 0 || brace < semi)) { bi = j; openPos = brace; break; }
      if (semi >= 0) break;
    }
    if (openPos < 0) continue;
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
    fns.push({ name, start: i + 1, end: endLine + 1 });
    i = endLine;
  }
  for (let k = 0; k < fns.length; k++) {
    let cs = fns[k].start - 1;
    while (cs - 1 >= 0 && /^\s*(\/\*\*?|\*\/|\*|\/\/)/.test(lines[cs - 1])) cs--;
    fns[k].citeStart = cs + 1;
  }
  return fns;
}

// ─── Collecte des paires ─────────────────────────────────────────────────────
const { symbols, lines: cLines } = parseCSymbols(readFileSync(decompAbs, 'utf8'));
const symAt = (ln) => symbols.find((s) => ln >= s.start && ln <= s.end);

function* walkTs(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (/node_modules|decomp-data|\.git/.test(full)) continue; yield* walkTs(full); }
    else if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts')) yield full;
  }
}

// pair = decompSym → [{tsRel, tsFn, tsLine, raw}]
const pairs = new Map();
for (const tsAbs of walkTs(join(projectRoot, 'src'))) {
  const tsRel = tsAbs.replace(projectRoot + '\\', '').replace(/\\/g, '/');
  const content = readFileSync(tsAbs, 'utf8');
  const cites = extractCitations(content).filter(
    (c) => c.fileName === baseName || c.citeName === decompArg || c.citeName.endsWith('/' + baseName));
  if (!cites.length) continue;
  const tsFns = parseTsFunctions(content);
  for (const c of cites) {
    if (!c.lineNums.length) continue;
    const sym = symAt(c.lineNums[0]);
    if (!sym) continue; // ligne hors symbole (#define/macro) → pas une paire fonction
    const tsFn = tsFns.find((f) => c.tsLine >= f.citeStart && c.tsLine <= f.end);
    if (!pairs.has(sym.name)) pairs.set(sym.name, { sym, ports: [] });
    pairs.get(sym.name).ports.push({ tsRel, tsFn, tsLine: c.tsLine, raw: c.raw, citeLines: c.lineNums });
  }
}

let entries = [...pairs.values()].sort((a, b) => a.sym.start - b.sym.start);
if (nameFilter) {
  const f = nameFilter.toLowerCase();
  entries = entries.filter((e) => e.sym.name.toLowerCase().includes(f) ||
    e.ports.some((p) => (p.tsFn?.name || '').toLowerCase().includes(f)));
}

// ─── Rendu d'une paire (C body ‖ port TS) ────────────────────────────────────
function renderPair(e) {
  const s = e.sym;
  let out = `\n${'═'.repeat(78)}\n`;
  out += `▌ ${s.kind === 'func' ? 'ƒ' : '·'} ${s.name}  —  ${baseName}:${s.start}-${s.end} (${s.end - s.start + 1} l)\n`;
  for (const p of e.ports) {
    const r = p.tsFn ? `${p.tsFn.name} (${p.tsRel}:${p.tsFn.citeStart}-${p.tsFn.end})` : `${p.tsRel}:${p.tsLine} (hors fonction)`;
    out += `▌ ‖ port: ${r}  ← cite "${p.raw}" @${p.tsRel}:${p.tsLine}\n`;
  }
  out += `${'═'.repeat(78)}\n`;
  out += `┌─ DÉCOMP ${baseName}:${s.start}-${s.end} ${'─'.repeat(40)}\n`;
  for (let l = s.start; l <= s.end; l++) out += `${String(l).padStart(5)}│ ${cLines[l - 1] ?? ''}\n`;
  // port unique (le 1er) rendu en regard ; les autres listés
  const p0 = e.ports.find((p) => p.tsFn);
  if (p0) {
    const tsContent = readFileSync(join(projectRoot, p0.tsRel.replace(/\//g, '\\')), 'utf8').split('\n');
    out += `├─ PORT ${p0.tsRel}:${p0.tsFn.citeStart}-${p0.tsFn.end} ${'─'.repeat(40)}\n`;
    for (let l = p0.tsFn.citeStart; l <= p0.tsFn.end; l++) out += `${String(l).padStart(5)}│ ${tsContent[l - 1] ?? ''}\n`;
  } else {
    out += `├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)\n`;
  }
  out += `└${'─'.repeat(60)}\n`;
  return out;
}

// ─── Sortie ──────────────────────────────────────────────────────────────────
const CAVEAT = '⚠️ Pairing statique pour relecture BORNÉE. NE PROUVE PAS le comportement.\n';

if (printFunc) {
  const e = entries.find((x) => x.sym.name.toLowerCase() === printFunc.toLowerCase()) ||
            entries.find((x) => x.sym.name.toLowerCase().includes(printFunc.toLowerCase()));
  if (!e) { console.error(`pas de paire pour "${printFunc}" dans ${baseName}`); process.exit(2); }
  console.log(CAVEAT + renderPair(e));
  process.exit(0);
}

// index + écriture fichier complet
mkdirSync(outputDir, { recursive: true });
const outFile = join(outputDir, baseName.replace(/[\/\\]/g, '_') + '.md');
let md = `# Paires décomp↔port — \`${baseName}\`\n\nGénéré : ${new Date().toISOString()}\n\n> ${CAVEAT}\n`;
md += `${entries.length} fonction(s) décomp citée(s) (sur ${symbols.filter((s) => s.kind === 'func').length} fonctions du fichier).\n\n`;
md += '## Index des paires\n\n';
for (const e of entries) {
  const ports = e.ports.map((p) => p.tsFn ? `${p.tsRel}:${p.tsFn.name}` : `${p.tsRel}:${p.tsLine}`);
  md += `- \`${e.sym.name}\` (${baseName}:${e.sym.start}-${e.sym.end}) ‖ ${[...new Set(ports)].join(', ')}\n`;
}
md += '\n## Paires détaillées\n';
for (const e of entries) md += '\n```\n' + renderPair(e).replace(/```/g, "'''") + '\n```\n';
writeFileSync(outFile, md);

console.log('══════════════════════════════════════════════════════════════════');
console.log(`  PAIRING ${baseName}  (Outil B — extraction seule, 0 token)`);
console.log('══════════════════════════════════════════════════════════════════');
console.log(CAVEAT);
console.log(`Fonctions décomp citées : ${entries.length}/${symbols.filter((s) => s.kind === 'func').length}` +
  (nameFilter ? ` (filtre "${nameFilter}")` : ''));
console.log('');
for (const e of entries) {
  const ports = [...new Set(e.ports.map((p) => p.tsFn ? `${p.tsRel.split('/').pop()}:${p.tsFn.name}` : `${p.tsRel.split('/').pop()}:${p.tsLine}`))];
  console.log(`  ${e.sym.name.padEnd(42)} ${baseName}:${e.sym.start}-${e.sym.end}  ‖  ${ports.join(', ')}`);
}
console.log(`\nDétail complet : audit-reports\\1to1\\pairs\\${baseName.replace(/[\/\\]/g, '_')}.md`);
console.log(`Une paire à l'écran : --print=<NomFonction>`);
console.log('══════════════════════════════════════════════════════════════════');
