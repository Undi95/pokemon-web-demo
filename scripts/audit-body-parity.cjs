#!/usr/bin/env node
'use strict';
/*
 * audit-body-parity.cjs — Oracle de PARITÉ DES CORPS (dette invisible 1:1).
 *
 * Complément de audit-callgraph-closure.cjs : celui-ci ne voit que les NOMS
 * (« Foo existe-t-il en TS ? »). Il rate la classe de bug la plus chère : la
 * fonction PORTÉE DE NOM mais au CORPS CREUX — soit vidée (« // Dette R3 »),
 * soit amputée d'une branche (double battle, cas par défaut d'un switch…).
 * 2 faux positifs payés qui ont motivé cet oracle :
 *   · HandleInputChooseTarget  — corps réduit à un commentaire « Dette R3 ».
 *   · InitBattlerHealthboxCoords — branche double-battle (switch 4 cas) absente ;
 *     AUCUN marqueur texte → seule la métrique de BRANCHES la trahit.
 *
 * Méthode : pour chaque fonction présente des DEUX côtés (même nom = contrat
 * miroir), on mesure 4 métriques bon marché par CORPS (lignes utiles, branches,
 * appels sortants, return) côté C et côté TS, et on flague les déficits.
 *
 * Usage :
 *   node scripts/audit-body-parity.cjs               # résumé + top 50 suspects
 *   node scripts/audit-body-parity.cjs --file X.c     # détail d'un fichier
 *   node scripts/audit-body-parity.cjs --top 30       # change la taille du top
 *   node scripts/audit-body-parity.cjs --json         # + audit-reports/body-parity.json
 *   node scripts/audit-body-parity.cjs --selftest     # rejoue les 2 cas payés (calibration)
 *
 * Exclusions : (a) fichiers hardware exempts (EXEMPT_FILES) ; (b) commentaire
 * explicite `@body-parity-ok <raison>` dans le corps ou son doc-header ;
 * (c) whitelist par motif (WHITELIST inline + audit-reports/body-parity-whitelist.json
 * optionnel, gitignoré). Seuils = constantes TH ajustables ci-dessous.
 *
 * IMPLÉMENTATION — parseur RÉUTILISÉ : les helpers texte (stripC/stripTs/
 * matchBrace/makeLineLookup/walk/lowerFirst), la regex FN_DEF (défs C),
 * EXEMPT_FILES et la logique de variantes de nom (Name/_Name/Name_Manual/
 * _lowerFirst) sont repris À L'IDENTIQUE de audit-callgraph-closure.cjs — même
 * parseur ⇒ résultats cohérents entre les deux oracles. (Le module callgraph
 * s'exécute au require, on ne peut pas l'importer : on copie ses briques.)
 *
 * Sortie JSON = artefact régénérable, gitignoré (audit-reports/**\/*.json). NE PAS committer.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DECOMP = process.env.DECOMP_ROOT || 'D:/Projet 1/decomps/pokeemeraude';
const REPO = path.resolve(__dirname, '..');
const OUT_JSON = path.join(REPO, 'audit-reports', 'body-parity.json');
const WL_JSON = path.join(REPO, 'audit-reports', 'body-parity-whitelist.json');

// ─── Seuils (constantes ajustables) ──────────────────────────────────────────
const TH = {
  R_LINES: 0.30,        // ratio lignes TS/C sous ce seuil → suspect (règle L)
  MIN_C_LINES: 6,       // n'applique la règle L que si le corps C est assez gros
  BRANCH_HALVED: 0.5,   // branches TS < branches C × ce facteur → suspect (règle B)
  MIN_C_BRANCHES: 3,    // n'applique B que si le C a ≥ ce nb de branches
  CALL_HALVED: 0.5,     // appels TS < appels C × ce facteur → suspect (règle C)
  MIN_C_CALLS: 4,       // n'applique C que si le C a ≥ ce nb d'appels
  SMALL_TS_BODY: 5,     // corps TS < ce nb de lignes + marqueur mou → suspect (règle M)
  TOP: 50,              // taille du top affiché par défaut
};

// ─── Constantes reprises de audit-callgraph-closure.cjs ───────────────────────
const EXEMPT_FILES = new Set([
  'src/agb_flash.c', 'src/agb_flash_1m.c', 'src/agb_flash_le.c',
  'src/agb_flash_mx.c', 'src/siirtc.c', 'src/libisagbprn.c',
  'src/malloc.c',
]);
const C_KEYWORDS = new Set([
  'if', 'for', 'while', 'switch', 'return', 'sizeof', 'do', 'else', 'case', 'goto', 'defined', 'typedef',
  'void', 'int', 'char', 'short', 'long', 'unsigned', 'signed', 'float', 'double', 'bool',
  'u8', 'u16', 'u32', 'u64', 's8', 's16', 's32', 's64', 'vu8', 'vu16', 'vu32', 'f32', 'size_t',
]);
const JS_KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'constructor', 'super', 'new', 'typeof', 'await', 'yield', 'else', 'do', 'try', 'finally', 'throw', 'delete', 'in', 'of', 'instanceof']);
// Mots-clés à NE PAS compter comme « appel sortant » (identifiant suivi de `(`).
const CALL_KW = new Set([...C_KEYWORDS, ...JS_KEYWORDS, 'sizeof', 'defined', 'return', 'catch', 'switch', 'typeof', 'await', 'throw', 'new', 'delete', 'do', 'case']);

// ─── Marqueurs texte (spec §3/§4) ─────────────────────────────────────────────
// Un marqueur CORROBORE un déficit métrique (jamais seul sur un corps plein — sinon
// la moindre annotation « // TODO » du transpileur sur une fonction ENTIÈREMENT
// transcrite lèverait un faux positif ; cf. le flot tv.ts observé au 1er run).
// FORTS : aveu d'impl manquante (« stub », « non porté »…) → boost fort, mais toujours
// conditionné à un déficit de taille (voir compare()).
const RE_STRONG = /\bstub\b|non[ -]?port\w*|corps\s+vide|not\s+(?:yet\s+)?(?:ported|implemented)|\bplaceholder\b|\bunimplemented\b/gi;
// MOUS : dette/annotation (TODO, TRANSPILER-TODO, Dette, Phase B…) → n'escalade que si
// une règle métrique a DÉJÀ flanché (ou corps TS minuscule).
const RE_SOFT = /\bdette\b|\bTODO\b|TRANSPILER-TODO|\bFIXME\b|Phase\s?B\b|à\s+(?:porter|transcrire|compl[ée]ter|c[âa]bler|finir)|\bsimplif\w*/gi;
// Exclusion explicite : `@body-parity-ok <raison>` (corps ou doc-header).
const RE_OK = /@body-parity-ok(?:[ \t]+([^\n*]+))?/i;
// no-op documenté « 1:1 no-op » = légitime plus court côté TS (spec §4).
const RE_NOOP_OK = /1:1\s+no[- ]?op|no-?op\s+1:1/i;

// ─── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function argVal(flag) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; }
const fileFilter = argVal('--file');
const wantJson = argv.includes('--json');
const selftest = argv.includes('--selftest');
const topN = parseInt(argVal('--top') || '', 10) || TH.TOP;

// ─── Helpers texte ────────────────────────────────────────────────────────────
// NOTE : le stripC/stripTs de audit-callgraph-closure.cjs est une chaîne de regex
// qui applique le retrait des blocs `/* */` AVANT les lignes `//`. Or le décomp
// contient des commentaires `//*dest = *ptr;` : le `/*` interne (dans `//*`) est
// alors lu comme un DÉBUT de bloc et engloutit tout jusqu'au prochain `*/` — ce
// qui avale l'accolade fermante de la fonction (matchBrace overrun → corps
// fantôme de 370 lignes sur BackupPokemonStorage). On utilise donc un scanner
// UN-PASSE correct (ligne reconnue avant bloc), qui préserve longueur et sauts de
// ligne (indices alignés avec le brut, comme les regex d'origine).
function stripCode(src, allowTemplate) {
  const out = src.split('');
  const n = src.length;
  let i = 0;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { let j = i; while (j < n && src[j] !== '\n') out[j++] = ' '; i = j; continue; }
    if (c === '/' && d === '*') {
      out[i] = out[i + 1] = ' '; let j = i + 2;
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) { if (src[j] !== '\n') out[j] = ' '; j++; }
      if (j < n) { out[j] = out[j + 1] = ' '; j += 2; }
      i = j; continue;
    }
    if (c === '"' || c === "'" || (allowTemplate && c === '`')) {
      out[i] = ' '; let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') { if (src[j] !== '\n') out[j] = ' '; if (src[j + 1] !== '\n') out[j + 1] = ' '; j += 2; continue; }
        if (src[j] === c) { out[j] = ' '; j++; break; }
        if (c !== '`' && src[j] === '\n') break; // chaîne "/' non terminée en fin de ligne
        if (src[j] !== '\n') out[j] = ' ';
        j++;
      }
      i = j; continue;
    }
    i++;
  }
  return out.join('');
}
function stripC(src) { return stripCode(src, false); }
function stripTs(src) { return stripCode(src, true); }
function makeLineLookup(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (idx) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}
function matchBrace(text, open) {
  let d = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return i; }
  }
  return text.length - 1;
}
function matchParen(text, open) {
  let d = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '(') d++;
    else if (c === ')') { d--; if (d === 0) return i; }
  }
  return -1;
}
function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}
function lowerFirst(s) { return s[0].toLowerCase() + s.slice(1); }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function fileBase(rel) { return rel.replace(/^.*\//, '').replace(/\.(c|ts)$/, ''); }

// ─── Métriques bon marché sur un corps (texte STRIPPÉ, sans commentaires) ─────
// Une ligne « utile » = contient un caractère hors espace/ponctuation structurelle.
function bodyMetrics(sBody) {
  const lines = sBody.split('\n').filter((l) => /[^\s{}();,]/.test(l)).length;
  const branches = (sBody.match(/\b(?:if|else|switch|case|while|for|do)\b/g) || []).length;
  const returns = (sBody.match(/\breturn\b/g) || []).length;
  let calls = 0, m;
  const CALL_RE = /\b([A-Za-z_$][\w$]*)[ \t]*\(/g;
  while ((m = CALL_RE.exec(sBody))) { if (!CALL_KW.has(m[1])) calls++; }
  return { lines, branches, calls, returns };
}
// Marqueurs dans le CORPS BRUT (commentaires inclus) ; @body-parity-ok dans corps+doc.
function scanMarkers(rawBody, docAndBody) {
  const strong = rawBody.match(RE_STRONG) || [];
  const soft = rawBody.match(RE_SOFT) || [];
  const okM = RE_OK.exec(docAndBody);
  const noop = RE_NOOP_OK.test(docAndBody);
  return {
    strong: [...new Set(strong.map((s) => s.trim()))],
    soft: [...new Set(soft.map((s) => s.trim()))],
    ok: !!okM || noop,
    okReason: okM ? (okM[1] || '').trim() : (noop ? '1:1 no-op' : ''),
  };
}

// ─── Comparateur : renvoie {suspect, score, reasons[]} ────────────────────────
// Signal PRIMAIRE = déficit métrique (c'est lui qui a rattrapé InitBattlerHealthbox
// Coords, sans le moindre marqueur). Les marqueurs ne font qu'ESCALADER un corps déjà
// déficient — jamais flaguer seuls un corps de taille équivalente au C.
function compare(cM, tsM, markers) {
  const reasons = [];
  const lineRatio = tsM.lines / Math.max(1, cM.lines);
  if (cM.lines >= TH.MIN_C_LINES && lineRatio < TH.R_LINES) reasons.push('L');
  if (cM.branches >= TH.MIN_C_BRANCHES && tsM.branches < cM.branches * TH.BRANCH_HALVED) reasons.push('B');
  if (cM.calls >= TH.MIN_C_CALLS && tsM.calls < cM.calls * TH.CALL_HALVED) reasons.push('C');
  const metricSuspect = reasons.length > 0;
  // « Corps clairement raboté » : nettement plus court en lignes que le C.
  const shortBody = tsM.lines < cM.lines * 0.7;
  const strong = markers.strong.length > 0;
  const soft = markers.soft.length > 0;
  if (strong && (metricSuspect || shortBody)) reasons.push('M!');
  else if (soft && (metricSuspect || tsM.lines < TH.SMALL_TS_BODY)) reasons.push('M');
  const suspect = reasons.length > 0;
  // Score métrique d'abord (0 sain → 1 creux), pondéré par la taille du C ; marqueur = bonus.
  const lineDef = clamp(1 - lineRatio, 0, 1);
  const brDef = cM.branches > 0 ? clamp(1 - tsM.branches / cM.branches, 0, 1) : 0;
  const clDef = cM.calls > 0 ? clamp(1 - tsM.calls / cM.calls, 0, 1) : 0;
  const sizeW = Math.min(1, cM.lines / 40); // pondère par la taille du C (gros = plus grave)
  let score = (0.5 * lineDef + 0.3 * brDef + 0.2 * clDef) * (0.5 + 0.5 * sizeW);
  if (suspect && reasons.includes('M!')) score += 0.25;
  else if (suspect && reasons.includes('M')) score += 0.10;
  return { suspect, score, reasons };
}

// ─── Extraction des fonctions TS avec leurs corps ─────────────────────────────
// Familles couvertes : (A) déclarations `function`, (B) méthodes de classe,
// (C) const flèche à bloc `const Name = (...) => { … }`. Indices calculés sur le
// texte STRIPPÉ (stripTs préserve la longueur ⇒ mêmes offsets que le brut).
const TS_METHOD_RE = /^[ \t]+(?:public[ \t]+|private[ \t]+|protected[ \t]+|static[ \t]+|async[ \t]+|readonly[ \t]+)*([A-Za-z_$][\w$]*)[ \t]*\(([^;{}]*?)\)[ \t]*(?::[^;{}]*)?\{/gm;
const TS_FN_HEAD = /(?:^|[^\w$.])(?:export[ \t]+)?(?:async[ \t]+)?function[ \t]+([A-Za-z_$][\w$]*)[ \t]*\(/g;
const TS_ARROW_HEAD = /(?:^|[^\w$.])(?:export[ \t]+)?const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*(?:async[ \t]+)?\(/g;

function extractTsFns(raw) {
  const s = stripTs(raw);
  const out = [];
  const seen = new Set();
  const add = (name, headStart, bodyStart) => {
    if (JS_KEYWORDS.has(name)) return;
    if (bodyStart < 0 || s[bodyStart] !== '{') return;
    if (seen.has(bodyStart)) return;
    seen.add(bodyStart);
    const bodyEnd = matchBrace(s, bodyStart);
    out.push({ name, headStart, bodyStart, bodyEnd });
  };
  let m;
  // (A) function declarations
  TS_FN_HEAD.lastIndex = 0;
  while ((m = TS_FN_HEAD.exec(s))) {
    const paren = TS_FN_HEAD.lastIndex - 1;
    const close = matchParen(s, paren);
    if (close < 0) continue;
    const brace = findBodyBrace(s, close + 1);
    add(m[1], m.index, brace);
  }
  // (B) class methods
  TS_METHOD_RE.lastIndex = 0;
  while ((m = TS_METHOD_RE.exec(s))) {
    add(m[1], m.index, m.index + m[0].length - 1);
  }
  // (C) block-arrow consts
  TS_ARROW_HEAD.lastIndex = 0;
  while ((m = TS_ARROW_HEAD.exec(s))) {
    const paren = TS_ARROW_HEAD.lastIndex - 1;
    const close = matchParen(s, paren);
    if (close < 0) continue;
    // après `)` : optionnel `: type`, puis `=>`, puis `{`
    const rest = s.slice(close + 1, close + 200);
    const arrow = rest.indexOf('=>');
    if (arrow < 0) continue;
    const brace = s.indexOf('{', close + 1 + arrow);
    if (brace < 0 || brace > close + 1 + arrow + 120) continue;
    add(m[1], m.index, brace);
  }
  return { fns: out, stripped: s };
}
// Trouve l'accolade de corps après le `)` des params. Sait SAUTER une annotation
// de type de retour, y compris un type-OBJET `: { damage: number; … } {` (le `{` du
// type n'est PAS le corps — bug payé sur CalculateBaseDamage), les génériques
// `Record<string, {…}>`, tuples `[…]` et types-fonction `() => {…}`.
function skipWs(s, i) { while (i < s.length && /\s/.test(s[i])) i++; return i; }
function matchAngle(s, open) { // saute <...> équilibré (position de type)
  let d = 0;
  for (let i = open; i < s.length; i++) { const c = s[i]; if (c === '<') d++; else if (c === '>') { d--; if (d === 0) return i; } else if (c === '{' || c === ';') return -1; }
  return -1;
}
function matchBracket(s, open) { let d = 0; for (let i = open; i < s.length; i++) { const c = s[i]; if (c === '[') d++; else if (c === ']') { d--; if (d === 0) return i; } } return -1; }
function findBodyBrace(s, from) {
  let i = skipWs(s, from);
  if (s[i] !== ':') {
    // pas de type de retour : le corps est la prochaine `{` (guard proto `;`).
    for (let j = i; j < s.length && j < i + 300; j++) { if (s[j] === '{') return j; if (s[j] === ';') return -1; }
    return -1;
  }
  i++; // passe le `:`
  let guard = 0;
  while (i < s.length && guard++ < 8000) {
    i = skipWs(s, i);
    const c = s[i];
    if (c === undefined) return -1;
    if (c === '{') {
      const close = matchBrace(s, i);
      const after = skipWs(s, close + 1);
      const nc = s[after];
      // Après un type-objet vient soit le corps `{`, soit une continuation `|`/`&`.
      if (nc === '{') { i = close + 1; continue; }        // c'était le type ; le suivant est le corps
      if (nc === '|' || nc === '&') { i = after + 1; continue; } // union/intersection → encore du type
      return i; // pas de suite de type → CE `{` est le corps
    }
    if (c === '<') { const e = matchAngle(s, i); if (e < 0) return -1; i = e + 1; continue; } // générique
    if (c === '[') { const e = matchBracket(s, i); if (e < 0) return -1; i = e + 1; continue; } // tuple
    if (c === '(') { const e = matchParen(s, i); if (e < 0) return -1; i = e + 1; continue; }  // type-fonction params
    if (c === ';') return -1;
    i++; // token de type ordinaire
  }
  return -1;
}

// ─── Phase 1 : parse décomp (fonctions C + métriques de corps) ────────────────
if (!fs.existsSync(DECOMP)) { console.error(`Décomp introuvable : ${DECOMP}`); process.exit(1); }
const FN_DEF = /^[A-Za-z_][A-Za-z0-9_ \t*]*[ \t*]([A-Za-z_]\w*)[ \t]*\(([^;{}]*?)\)[ \t]*\r?\n\{/gm;
const cFns = new Map(); // name → {file, line, metrics}  (canonique = plus gros corps)
function parseCFile(p, rel) {
  const text = stripC(fs.readFileSync(p, 'utf8'));
  const lineAt = makeLineLookup(text);
  let m;
  FN_DEF.lastIndex = 0;
  while ((m = FN_DEF.exec(text))) {
    const name = m[1];
    if (C_KEYWORDS.has(name)) continue;
    const bodyStart = m.index + m[0].length - 1;
    const bodyEnd = matchBrace(text, bodyStart);
    const metrics = bodyMetrics(text.slice(bodyStart, bodyEnd + 1));
    const prev = cFns.get(name);
    if (!prev || metrics.lines > prev.metrics.lines) {
      cFns.set(name, { file: rel, line: lineAt(m.index), metrics });
    }
  }
}
for (const p of walk(path.join(DECOMP, 'src'), ['.c'])) {
  parseCFile(p, path.relative(DECOMP, p).replace(/\\/g, '/'));
}

// ─── Phase 2 : parse notre TS (fonctions + corps + métriques + marqueurs) ─────
const tsIndex = new Map(); // name → [{file, line, metrics, markers}]
const tsFiles = [...walk(path.join(REPO, 'src'), ['.ts']), ...walk(path.join(REPO, 'harness'), ['.ts'])];
for (const p of tsFiles) {
  const rel = path.relative(REPO, p).replace(/\\/g, '/');
  const raw = fs.readFileSync(p, 'utf8');
  const { fns, stripped } = extractTsFns(raw);
  const lineAt = makeLineLookup(stripped);
  for (const f of fns) {
    const sBody = stripped.slice(f.bodyStart, f.bodyEnd + 1);
    const rawBody = raw.slice(f.bodyStart, f.bodyEnd + 1);
    const docAndBody = raw.slice(Math.max(0, f.headStart - 1200), f.bodyEnd + 1);
    const entry = {
      file: rel, line: lineAt(f.headStart),
      metrics: bodyMetrics(sBody),
      markers: scanMarkers(rawBody, docAndBody),
    };
    if (!tsIndex.has(f.name)) tsIndex.set(f.name, []);
    tsIndex.get(f.name).push(entry);
  }
}

// ─── Résolution nom C → entrée TS (variantes + choix du meilleur candidat) ─────
function resolveTs(name, cfile) {
  const variants = [name, name + '_Manual', '_' + name, '_' + lowerFirst(name)];
  let cands = [];
  for (const v of variants) {
    if (tsIndex.has(v)) cands = cands.concat(tsIndex.get(v).map((e) => ({ ...e, variant: v })));
  }
  if (!cands.length) return null;
  const base = fileBase(cfile);
  // On prend le corps le PLUS COMPLET parmi les variantes (Name/_Name/Name_Manual…) :
  // un wrapper mince `Name(){ return _Name(); }` ne doit PAS masquer le vrai port 1:1
  // vivant sous `_Name` dans un autre fichier (cas GetWhoStrikesFirst). La préférence
  // « même fichier que le .c » ne sert que de départage à taille comparable.
  cands.sort((a, b) =>
    b.metrics.lines - a.metrics.lines ||
    (fileBase(b.file) === base ? 1 : 0) - (fileBase(a.file) === base ? 1 : 0));
  return cands[0];
}

// ─── Whitelist (motifs inline + JSON local optionnel) ─────────────────────────
const WHITELIST = [
  // Seed structurel. Un motif = {name?:RegExp, cfile?:RegExp, reason}.
  // Ajouts locaux via audit-reports/body-parity-whitelist.json (gitignoré) :
  //   [{ "name": "^Dma", "reason": "macro DMA dépliée C-side" }, …]
];
if (fs.existsSync(WL_JSON)) {
  try {
    for (const w of JSON.parse(fs.readFileSync(WL_JSON, 'utf8'))) {
      WHITELIST.push({ name: w.name ? new RegExp(w.name) : null, cfile: w.cfile ? new RegExp(w.cfile) : null, reason: w.reason || 'whitelist JSON' });
    }
  } catch (e) { console.error('[body-parity] whitelist JSON illisible :', e.message); }
}
function whitelisted(name, cfile) {
  for (const w of WHITELIST) {
    if (w.name && !w.name.test(name)) continue;
    if (w.cfile && !w.cfile.test(cfile)) continue;
    if (w.name || w.cfile) return w.reason;
  }
  return null;
}

// ─── Boucle de comparaison ────────────────────────────────────────────────────
function runCompare() {
  const results = [];
  let compared = 0, okSkipped = 0, wlSkipped = 0, exemptSkipped = 0;
  for (const [name, cdef] of cFns) {
    if (EXEMPT_FILES.has(cdef.file)) { exemptSkipped++; continue; }
    const ts = resolveTs(name, cdef.file);
    if (!ts) continue; // nom absent en TS = ressort de l'oracle callgraph, pas d'ici
    compared++;
    if (ts.markers.ok) { okSkipped++; continue; }
    const wl = whitelisted(name, cdef.file);
    if (wl) { wlSkipped++; continue; }
    const cmp = compare(cdef.metrics, ts.metrics, ts.markers);
    if (!cmp.suspect) continue;
    results.push({
      name, variant: ts.variant,
      cfile: cdef.file, cline: cdef.line, tsfile: ts.file, tsline: ts.line,
      c: cdef.metrics, ts: ts.metrics,
      reasons: cmp.reasons, score: +cmp.score.toFixed(3),
      markers: [...ts.markers.strong, ...ts.markers.soft],
    });
  }
  results.sort((a, b) => b.score - a.score || b.c.lines - a.c.lines);
  return { results, compared, okSkipped, wlSkipped, exemptSkipped };
}

// ─── Rendu ────────────────────────────────────────────────────────────────────
function fmtM(m) { return `l${m.lines} b${m.branches} c${m.calls} r${m.returns}`; }
function fmtRow(r, i) {
  const mk = r.markers.length ? `  {${r.markers.join(',')}}` : '';
  return `${String(i).padStart(3)}. ${r.score.toFixed(2)}  ${r.tsfile}:${r.tsline}  ${r.name}` +
    `\n        C[${fmtM(r.c)}] vs TS[${fmtM(r.ts)}]  règles:${r.reasons.join('')}${mk}` +
    `\n        décomp ${r.cfile}:${r.cline}`;
}

// ─── Mode --selftest : rejoue les 2 cas payés (calibration §6a) ───────────────
function gitShow(ref) {
  // execFileSync (pas execSync) : sur Windows execSync passe par cmd.exe où `^`
  // est le caractère d'échappement → `sha^:file` deviendrait `sha:file` (le commit
  // LUI-MÊME, pas son parent). Le tableau d'args évite tout shell.
  try { return execFileSync('git', ['show', ref], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return null; }
}
function tsFnMetricsFromText(raw, wantName) {
  const { fns, stripped } = extractTsFns(raw);
  const f = fns.find((x) => x.name === wantName);
  if (!f) return null;
  const sBody = stripped.slice(f.bodyStart, f.bodyEnd + 1);
  const rawBody = raw.slice(f.bodyStart, f.bodyEnd + 1);
  const docAndBody = raw.slice(Math.max(0, f.headStart - 1200), f.bodyEnd + 1);
  return { metrics: bodyMetrics(sBody), markers: scanMarkers(rawBody, docAndBody) };
}
if (selftest) {
  console.log('=== CALIBRATION — rejeu des 2 faux positifs payés ===\n');
  const cases = [
    { ref: '0a5d351f^:src/battle_controller_player.ts', name: 'HandleInputChooseTarget' },
    { ref: '1a6bcd29^:src/battle_interface.ts', name: 'InitBattlerHealthboxCoords' },
  ];
  let allPass = true;
  for (const cse of cases) {
    const cdef = cFns.get(cse.name);
    const raw = gitShow(cse.ref);
    const tsm = raw ? tsFnMetricsFromText(raw, cse.name) : null;
    if (!cdef || !tsm) {
      console.log(`  [SKIP] ${cse.name} — ${!cdef ? 'C introuvable' : 'TS historique introuvable (' + cse.ref + ')'}`);
      allPass = false; continue;
    }
    const cmp = compare(cdef.metrics, tsm.metrics, tsm.markers);
    const verdict = cmp.suspect ? 'FLAGUÉ ✓' : 'RATÉ ✗';
    if (!cmp.suspect) allPass = false;
    console.log(`  [${verdict}] ${cse.name}`);
    console.log(`         C(décomp) [${fmtM(cdef.metrics)}]  vs  TS(historique) [${fmtM(tsm.metrics)}]`);
    console.log(`         règles déclenchées : ${cmp.reasons.join('') || '(aucune)'}   score ${cmp.score.toFixed(2)}`);
    if (tsm.markers.strong.length || tsm.markers.soft.length)
      console.log(`         marqueurs corps : ${[...tsm.markers.strong, ...tsm.markers.soft].join(', ')}`);
    console.log('');
  }
  console.log(allPass ? 'CALIBRATION OK — les 2 cas sont flagués.' : 'CALIBRATION INCOMPLÈTE — voir ci-dessus.');
  process.exit(allPass ? 0 : 1);
}

// ─── Mode --file : détail d'un fichier ────────────────────────────────────────
if (fileFilter) {
  const rel = (fileFilter.startsWith('src/') ? fileFilter : 'src/' + fileFilter).replace(/\.ts$/, '.c');
  const base = fileBase(rel);
  console.log(`=== PARITÉ DES CORPS : ${rel} ===\n`);
  const rows = [];
  for (const [name, cdef] of cFns) {
    if (fileBase(cdef.file) !== base) continue;
    const ts = resolveTs(name, cdef.file);
    if (!ts) { rows.push({ name, state: 'TS-absent', cdef }); continue; }
    if (ts.markers.ok) { rows.push({ name, state: 'ok-tag', cdef, ts }); continue; }
    const cmp = compare(cdef.metrics, ts.markers ? ts.metrics : ts.metrics, ts.markers);
    rows.push({ name, state: cmp.suspect ? 'SUSPECT' : 'ok', cdef, ts, cmp });
  }
  rows.sort((a, b) => (b.cmp ? b.cmp.score : -1) - (a.cmp ? a.cmp.score : -1));
  for (const r of rows) {
    if (r.state === 'TS-absent') { console.log(`  [TS-absent] ${r.name}  (décomp ${r.cdef.file}:${r.cdef.line}, ${fmtM(r.cdef.metrics)})`); continue; }
    if (r.state === 'ok-tag') { console.log(`  [@ok]       ${r.name}  → ${r.ts.markers.okReason || 'exclu'}`); continue; }
    const tag = r.state === 'SUSPECT' ? 'SUSPECT ' : 'ok      ';
    const rule = r.cmp.suspect ? `  règles:${r.cmp.reasons.join('')}` : '';
    const mk = r.ts.markers.strong.length || r.ts.markers.soft.length ? `  {${[...r.ts.markers.strong, ...r.ts.markers.soft].join(',')}}` : '';
    console.log(`  [${tag}] ${r.name}  C[${fmtM(r.cdef.metrics)}] vs TS[${fmtM(r.ts.metrics)}]${rule}${mk}`);
    console.log(`              ${r.ts.file}:${r.ts.line}  ·  décomp ${r.cdef.file}:${r.cdef.line}`);
  }
  const nSusp = rows.filter((r) => r.state === 'SUSPECT').length;
  console.log(`\n  ${rows.length} fonctions du fichier · ${nSusp} suspectes.`);
  process.exit(0);
}

// ─── Mode par défaut : résumé + top N ─────────────────────────────────────────
const { results, compared, okSkipped, wlSkipped, exemptSkipped } = runCompare();
console.log(`Décomp : ${cFns.size} fonctions C (src/*.c) · Mirror : ${tsIndex.size} noms de fonctions TS indexés`);
console.log(`Comparées (présentes des 2 côtés) : ${compared}`);
console.log(`Exclusions : ${okSkipped} annotées (@body-parity-ok / « 1:1 no-op ») · ${wlSkipped} whitelist · ${exemptSkipped} fichiers hardware exempts`);
console.log(`\n=== SUSPECTS : ${results.length} fonctions au corps potentiellement creux ===`);
console.log(`(règles : L=lignes<${TH.R_LINES} · B=branches<½ · C=appels<½ · M/M!=marqueur dette/stub)\n`);
for (let i = 0; i < Math.min(topN, results.length); i++) console.log(fmtRow(results[i], i + 1));
if (results.length > topN) console.log(`\n  … +${results.length - topN} autres suspects (--json pour le dump complet).`);

if (wantJson) {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({
    thresholds: TH,
    stats: { cFns: cFns.size, compared, suspects: results.length, okSkipped, wlSkipped, exemptSkipped },
    suspects: results,
  }, null, 1));
  console.log(`\nJSON complet : ${OUT_JSON}`);
}
