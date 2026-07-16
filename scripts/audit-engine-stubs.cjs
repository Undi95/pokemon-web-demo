#!/usr/bin/env node
/*
 * audit-engine-stubs.cjs — INVENTAIRE MÉCANIQUE des stubs / no-op / TODO du port.
 * Tâche B.1 de docs/CHANTIER-MOTEUR-100.md (PHASE B).
 *
 * LECTURE SEULE : scanne src/ + harness/ (.ts uniquement) et écrit un rapport
 * markdown déterministe dans audit-reports/engine/STUBS-INVENTORY.md (écrasé à
 * chaque run). N'édite AUCUN fichier de code. Pas de git, pas de serveur.
 *
 * Régénération :  node scripts/audit-engine-stubs.cjs
 *
 * Catégories détectées (par ligne) :
 *   wireTodo        — appels __wireTodo(...) (câblage manquant assumé, pattern maison)
 *   transpiler-todo — annotations TRANSPILER-TODO (dette du transpileur c→ts, systémique)
 *   marker          — commentaires/identifiants : TODO/FIXME/XXX/STUB/stub/no-op/noop/
 *                     not implemented/non porté/non implémenté/unsupported/placeholder
 *   warnOnce        — call-sites _warnOnce / warnOnce (chaque message = primitive douteuse)
 *   ts-suppress     — @ts-nocheck / @ts-ignore / @ts-expect-error
 *   throw-stub      — throw new Error(...) dont le message contient not implemented/
 *                     unimplemented/stub/todo
 *   empty-body      — fonctions/méthodes/arrows exportées au corps {} ou return trivial
 *                     (HEURISTIQUE ligne-par-ligne — faux positifs possibles)
 *   silent-default  — default: silencieux (break;/rien) ou return trivial dans les switch
 *                     de registres/dispatch (fichiers gpu/io_reg/decomp-runtime/scanline/
 *                     compositor OU switch dont l'en-tête mentionne reg/offset/REG_)
 *   console-miss    — console.warn/error dont le message contient miss/manqu/absent/
 *                     unsupported/unknown/ignoré/ignored/skip/fallback
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['src', 'harness'];
const REPORT_PATH = path.join(ROOT, 'audit-reports', 'engine', 'STUBS-INVENTORY.md');
const DATE = '2026-07-16';

// ─── Classification MOTEUR / HORS-MOTEUR (docs/CHANTIER-MOTEUR-100.md §Séparation) ──
// MOTEUR = tout harness/** + une liste fermée de fichiers src/ (top-level).
const MOTEUR_SRC_TOPLEVEL = new Set([
  'sprite.ts', 'window.ts', 'text.ts', 'palette.ts', 'text_window.ts', 'main.ts',
  'task.ts', 'dma3_manager.ts', 'gpu_regs.ts', 'io_reg.ts', 'malloc.ts',
  'decompress.ts', 'string_util.ts', 'international_string_util.ts',
  'dynamic_placeholder_text_util.ts', 'menu.ts', 'menu_helpers.ts', 'list_menu.ts',
  'scanline_effect.ts', 'trig.ts', 'util.ts', 'random.ts', 'sound.ts',
  // extensions au-delà de la liste littérale du plan, unambigument moteur :
  'blit.ts', // blit.c = primitive gfx (BlitBitmapRect) utilisée par window/text/menu
]);

function toPosix(p) { return p.split(path.sep).join('/'); }

function isMoteur(relPosix) {
  if (relPosix.startsWith('harness/')) return true;              // tout le harness = moteur
  const base = relPosix.split('/').pop();
  if (relPosix === 'src/' + base && MOTEUR_SRC_TOPLEVEL.has(base)) return true;
  if (relPosix.startsWith('src/engine/decomp-impls/')) return true; // impls sprite.c
  if (relPosix === 'src/engine/wire-todo.ts') return true;          // sentinelle moteur
  return false;
}

// ─── Marche récursive (fs pur, cross-platform) ──────────────────────────────
function walk(dirAbs, out) {
  let entries;
  try { entries = fs.readdirSync(dirAbs, { withFileTypes: true }); }
  catch { return; }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)); // déterminisme
  for (const e of entries) {
    const abs = path.join(dirAbs, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(abs, out);
    } else if (e.isFile() && e.name.endsWith('.ts')) {
      out.push(abs);
    }
  }
  return out;
}

// ─── Utilitaires ────────────────────────────────────────────────────────────
function trimExtract(line) {
  let s = line.trim();
  if (s.length > 120) s = s.slice(0, 119) + '…';
  return s;
}
function mdCell(s) { return s.replace(/\|/g, '\\|'); }

function isCommentLine(line) {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('*/');
}

// Marqueurs (chaque spec : regex + libellé de "kind"). TODO/FIXME/XXX = MAJ strictes.
const MARKER_SPECS = [
  { kind: 'TODO', re: /\bTODO\b/g },
  { kind: 'FIXME', re: /\bFIXME\b/g },
  { kind: 'XXX', re: /\bXXX\b/g },
  { kind: 'stub', re: /\bstub\b/gi },
  { kind: 'no-op', re: /\bno-?op\b/gi },
  { kind: 'not-implemented', re: /not\s+implemented/gi },
  { kind: 'unimplemented', re: /\bunimplemented\b/gi },
  { kind: 'non-porté', re: /non\s+port[eé]/gi },
  { kind: 'non-implémenté', re: /non\s+impl[ée]ment/gi },
  { kind: 'unsupported', re: /\bunsupported\b/gi },
  { kind: 'placeholder', re: /\bplaceholders?\b/gi },
];

const CONSOLE_MISS_RE = /(miss|manqu|absent|unsupported|unknown|ignor(?:e|é|ed)|\bskip\b|fallback)/i;
const REGISTER_PATH_RE = /(gpu|io[_-]?reg|decomp-runtime|scanline|compositor)/i;
const REGISTER_SWITCH_RE = /(\breg\b|offset|REG_)/i;
const LEGIT_CTX_RE = /\b(link|serial|rtc|cable|multijoueur|multiplayer|hardware|savefile|save\s*hardware|flash\s*chip|sram|eeprom)\b/i;

// ─── Analyse d'un fichier → liste de findings ───────────────────────────────
function analyzeFile(absPath, relPosix) {
  const raw = fs.readFileSync(absPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const findings = [];
  const N = lines.length;

  const ctxHasLegit = (idx) => {
    const lo = Math.max(0, idx - 3), hi = Math.min(N - 1, idx + 3);
    for (let k = lo; k <= hi; k++) if (LEGIT_CTX_RE.test(lines[k])) return true;
    return false;
  };
  // Texte de l'ARGUMENT d'un appel `name(...)` : de la '(' jusqu'à équilibrage
  // des parenthèses (max 3 lignes). Sert à tester le MESSAGE d'un throw/console,
  // pas le code voisin (évite les faux positifs de fenêtre fixe).
  const collectCallArg = (idx, openCol) => {
    let bal = 0, done = false, buf = '';
    const scan = (s) => {
      for (const ch of s) {
        if (ch === '(') bal++;
        else if (ch === ')') { bal--; if (bal <= 0) { done = true; break; } }
      }
    };
    buf = lines[idx].slice(openCol);
    scan(buf);
    let k = idx;
    while (!done && k - idx < 3 && k + 1 < N) { k++; buf += '\n' + lines[k]; scan(lines[k]); }
    return buf;
  };
  const push = (cat, idx, kind) => {
    findings.push({
      file: relPosix,
      line: idx + 1,
      category: cat,
      kind: kind || '',
      extract: trimExtract(lines[idx]),
      comment: isCommentLine(lines[idx]),
      legit: ctxHasLegit(idx),
    });
  };

  // ── Switch tracking pour silent-default (profondeur d'accolades, tolérant) ──
  let depth = 0;
  const swStack = [];

  for (let i = 0; i < N; i++) {
    const line = lines[i];
    const depthBefore = depth;

    // --- silent-default (avant maj de profondeur : on est au niveau du corps) ---
    if (/^\s*default\s*:/.test(line)) {
      const encl = swStack.length ? swStack[swStack.length - 1] : null;
      const inRegisterFile = REGISTER_PATH_RE.test(relPosix);
      const inRegisterSwitch = encl ? REGISTER_SWITCH_RE.test(encl.header) : false;
      if (inRegisterFile || inRegisterSwitch) {
        const after = line.replace(/^\s*default\s*:/, '').trim();
        let sub = null;
        const classifyBody = (txt) => {
          if (txt === '' ) return 'EMPTY';
          if (/^break\s*;?$/.test(txt)) return 'break-only';
          if (/^return\s*;?$/.test(txt)) return 'return;';
          if (/^return\s+(0|undefined|null)\s*;?$/.test(txt)) return 'return ' + RegExp.$1;
          if (/^\}/.test(txt)) return 'EMPTY';
          if (/^(case\b|default\b)/.test(txt)) return 'EMPTY';
          return null; // du vrai code
        };
        if (after !== '') {
          sub = classifyBody(after);
        } else {
          // regarder la 1re ligne signifiante suivante
          for (let j = i + 1; j < N; j++) {
            const t = lines[j].trim();
            if (t === '' || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) continue;
            sub = classifyBody(t);
            break;
          }
        }
        if (sub) {
          const swRef = encl ? `switch@${encl.lineNo}: ${trimExtract(encl.header)}` : '(switch enclosant introuvable)';
          findings.push({
            file: relPosix, line: i + 1, category: 'silent-default',
            kind: sub, extract: trimExtract(line),
            comment: false, legit: ctxHasLegit(i),
            note: swRef,
          });
        }
      }
    }

    // --- wireTodo (appels seulement, hors fichier de définition) ---
    if (relPosix !== 'src/engine/wire-todo.ts' && /__wireTodo\s*\(/.test(line)) {
      push('wireTodo', i, '');
    }

    // --- transpiler-todo (prioritaire : consomme la ligne pour la cat marker) ---
    const isTranspilerTodo = /TRANSPILER-TODO/.test(line);
    if (isTranspilerTodo) {
      push('transpiler-todo', i, '');
    } else {
      // --- marker (union des tokens ; 1 finding / ligne, kinds concaténés) ---
      const kinds = [];
      for (const spec of MARKER_SPECS) {
        spec.re.lastIndex = 0;
        if (spec.re.test(line)) kinds.push(spec.kind);
      }
      if (kinds.length) push('marker', i, kinds.join(','));
    }

    // --- warnOnce ---
    if (/warnOnce/i.test(line)) {
      // extraire un éventuel préfixe de message pour le "kind"
      const m = line.match(/warnOnce\w*\s*\(\s*(['"`])([^'"`]{0,40})/i);
      push('warnOnce', i, m ? m[2] : '');
    }

    // --- ts-suppress ---
    const tsm = line.match(/@ts-(nocheck|ignore|expect-error)/);
    if (tsm) push('ts-suppress', i, '@ts-' + tsm[1]);

    // --- throw-stub (mot-clé dans le MESSAGE de l'Error, pas les lignes voisines) ---
    const tm = line.match(/throw\s+new\s+Error\s*\(/);
    if (tm) {
      const openCol = line.indexOf('(', tm.index);
      const arg = collectCallArg(i, openCol);
      if (/(not\s+implemented|unimplemented|\bstub\b|\btodo\b)/i.test(arg)) push('throw-stub', i, '');
    }

    // --- console-miss (mot-clé dans l'ARGUMENT du console.warn/error) ---
    const cm = line.match(/console\.(warn|error)\s*\(/);
    if (cm) {
      const openCol = line.indexOf('(', cm.index);
      const arg = collectCallArg(i, openCol);
      if (CONSOLE_MISS_RE.test(arg)) push('console-miss', i, 'console.' + cm[1]);
    }

    // --- empty-body (HEURISTIQUE) ---
    (function emptyBody() {
      const t = line.trim();
      // fonctions exportées / nommées, corps {} ou return trivial même-ligne
      const fnEmpty = /^(export\s+)?(default\s+)?(async\s+)?function\s+\w+\s*(<[^>]*>)?\s*\([^)]*\)\s*(:\s*[^={;]+)?\{\s*\}\s*$/;
      const fnTrivial = /^(export\s+)?(default\s+)?(async\s+)?function\s+\w+\s*(<[^>]*>)?\s*\([^)]*\)\s*(:\s*[^={;]+)?\{\s*return(\s+(0|undefined|null))?\s*;\s*\}\s*$/;
      const arrowEmpty = /^(export\s+)?const\s+\w+\s*(:[^=]+)?=\s*(async\s+)?\([^)]*\)\s*(:\s*[^=>]+)?=>\s*\{\s*\}\s*;?\s*$/;
      const arrowTrivial = /^(export\s+)?const\s+\w+\s*(:[^=]+)?=\s*(async\s+)?\([^)]*\)\s*(:\s*[^=>]+)?=>\s*\{\s*return(\s+(0|undefined|null))?\s*;\s*\}\s*;?\s*$/;
      // méthode de classe : NOM(args): T {}   (exclure mots-clés de contrôle)
      const methodEmpty = /^(public\s+|private\s+|protected\s+|static\s+|readonly\s+|async\s+|override\s+)*(\w+)\s*(<[^>]*>)?\s*\([^)]*\)\s*(:\s*[^={;]+)?\{\s*\}\s*$/;
      const KW = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'do', 'else', 'constructor', 'get', 'set']);
      if (fnEmpty.test(t) || fnTrivial.test(t) || arrowEmpty.test(t) || arrowTrivial.test(t)) {
        push('empty-body', i, 'fn/arrow (heuristique)');
        return;
      }
      const mm = t.match(methodEmpty);
      if (mm && !KW.has(mm[2])) {
        push('empty-body', i, 'méthode (heuristique)');
      }
    })();

    // ── maj profondeur d'accolades (naïf : ignore strings/commentaires — risque accepté) ──
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    const hasSwitch = /\bswitch\s*\(/.test(line);
    const hadBraceThisLine = /\{/.test(line);
    depth += opens - closes;
    if (hasSwitch) {
      // même-ligne "switch (x) {" → enterDepth = depth courant ; sinon la '{' ouvre plus loin
      const enterDepth = hadBraceThisLine ? depth : depth + 1;
      swStack.push({ header: line.trim(), lineNo: i + 1, enterDepth });
    }
    while (swStack.length && depth < swStack[swStack.length - 1].enterDepth) swStack.pop();
    void depthBefore;
  }

  return findings;
}

// ─── Collecte ───────────────────────────────────────────────────────────────
const files = [];
for (const d of SCAN_DIRS) walk(path.join(ROOT, d), files);
files.sort();

const allFindings = [];
for (const abs of files) {
  const rel = toPosix(path.relative(ROOT, abs));
  const fs_ = analyzeFile(abs, rel);
  for (const f of fs_) allFindings.push(f);
}

// ─── Agrégations ────────────────────────────────────────────────────────────
const CATS = ['wireTodo', 'silent-default', 'transpiler-todo', 'marker', 'warnOnce',
  'ts-suppress', 'throw-stub', 'empty-body', 'console-miss'];

const byFile = new Map(); // rel -> {moteur, findings[], counts{}}
for (const f of allFindings) {
  if (!byFile.has(f.file)) byFile.set(f.file, { moteur: isMoteur(f.file), findings: [], counts: {} });
  const rec = byFile.get(f.file);
  rec.findings.push(f);
  rec.counts[f.category] = (rec.counts[f.category] || 0) + 1;
}

const catTotals = {};
for (const c of CATS) catTotals[c] = 0;
let totMoteur = 0, totHors = 0;
for (const f of allFindings) {
  catTotals[f.category] = (catTotals[f.category] || 0) + 1;
  if (isMoteur(f.file)) totMoteur++; else totHors++;
}

// ─── Génération du rapport ──────────────────────────────────────────────────
const out = [];
const P = (s) => out.push(s);

P('# Inventaire mécanique des stubs / no-op / TODO — moteur & hors-moteur');
P('');
P(`> Généré le **${DATE}** · régénération : \`node scripts/audit-engine-stubs.cjs\` · **LECTURE SEULE** (aucun code édité).`);
P('> Scanne `src/` + `harness/` (.ts). Déterministe, écrase ce rapport à chaque run.');
P('');
P(`**Total findings : ${allFindings.length}** — MOTEUR : **${totMoteur}** · HORS-MOTEUR : **${totHors}** · fichiers touchés : ${byFile.size} / ${files.length} scannés.`);
P('');
P('| Catégorie | Total | MOTEUR | HORS-MOTEUR |');
P('|---|--:|--:|--:|');
for (const c of CATS) {
  let m = 0, h = 0;
  for (const f of allFindings) if (f.category === c) { if (isMoteur(f.file)) m++; else h++; }
  P(`| \`${c}\` | ${catTotals[c] || 0} | ${m} | ${h} |`);
}
P('');
P('**Lecture des catégories** — `wireTodo` = symbole transpilé non câblé (throw à l\'appel). ' +
  '`silent-default` = branche `default:` d\'un switch de registres qui avale une valeur (break/return trivial). ' +
  '`transpiler-todo` = annotation `TRANSPILER-TODO` du transpileur c→ts (dette systémique, cf. §faux positifs). ' +
  '`marker` = mot-clé TODO/FIXME/XXX/STUB/stub/no-op/not implemented/non porté/non implémenté/unsupported/placeholder. ' +
  '`empty-body` = HEURISTIQUE (faux positifs possibles).');
P('');
P('## Règle de classification appliquée');
P('');
P('- **MOTEUR** = tout `harness/**` + fichiers `src/` (top-level) de la liste du plan : ' +
  '`sprite.ts, window.ts, text.ts, palette.ts, text_window.ts, main.ts, task.ts, gpu_regs.ts, ' +
  'string_util.ts, international_string_util.ts, dynamic_placeholder_text_util.ts, menu.ts, menu_helpers.ts, ' +
  'list_menu.ts, scanline_effect.ts, trig.ts, util.ts, random.ts, sound.ts`. ' +
  '(`dma3_manager.ts`, `io_reg.ts`, `malloc.ts`, `decompress.ts` n\'existent pas comme fichiers `src/` dédiés — ' +
  'leurs symboles vivent dans `harness/runtime/*` et `harness/gba/*`, déjà MOTEUR.)');
P('- **Extensions** (au-delà de la liste littérale, unambigument moteur) : `src/blit.ts` (primitive gfx), ' +
  '`src/engine/decomp-impls/**` (impl de sprite.c), `src/engine/wire-todo.ts` (sentinelle).');
P('- **HORS-MOTEUR** = tout le reste de `src/`.');
P('- **Nuance de priorité** : au sein de `harness/**`, `runtime/`, `gba/`, `m4a/`, `boot/` = moteur/runtime livré ' +
  '(prio haute) ; `devtools/` et `scenes/` = OUTILLAGE debug (harness, non 1:1, non livré) — findings réels mais prio basse.');
P('');

// helper : table récap d'une section
function recapTable(records) {
  const rows = records.slice().sort((a, b) => b[1].findings.length - a[1].findings.length || (a[0] < b[0] ? -1 : 1));
  const L = [];
  L.push('| Fichier | Total | wireTodo | silent-def | transp-todo | marker | warnOnce | ts | throw | empty | cons-miss |');
  L.push('|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|');
  for (const [rel, rec] of rows) {
    const c = rec.counts;
    L.push(`| \`${rel}\` | **${rec.findings.length}** | ${c['wireTodo'] || ''} | ${c['silent-default'] || ''} | ${c['transpiler-todo'] || ''} | ${c['marker'] || ''} | ${c['warnOnce'] || ''} | ${c['ts-suppress'] || ''} | ${c['throw-stub'] || ''} | ${c['empty-body'] || ''} | ${c['console-miss'] || ''} |`);
  }
  return L.join('\n');
}

// helper : détail par fichier (cap transpiler-todo)
function detailBlocks(records) {
  const rows = records.slice().sort((a, b) => b[1].findings.length - a[1].findings.length || (a[0] < b[0] ? -1 : 1));
  const L = [];
  const CAP_TRANSP = 4;
  for (const [rel, rec] of rows) {
    L.push('');
    L.push(`#### \`${rel}\` — ${rec.findings.length} finding(s)${rec.moteur ? ' · MOTEUR' : ''}`);
    L.push('');
    L.push('| Catégorie | Ligne | Détail / extrait |');
    L.push('|---|--:|---|');
    // ordre : d'abord les catégories fortes, puis par ligne
    const order = { 'wireTodo': 0, 'silent-default': 1, 'throw-stub': 2, 'ts-suppress': 3, 'warnOnce': 4, 'console-miss': 5, 'empty-body': 6, 'marker': 7, 'transpiler-todo': 8 };
    const sorted = rec.findings.slice().sort((a, b) => (order[a.category] - order[b.category]) || (a.line - b.line));
    let transpShown = 0, transpTotal = rec.counts['transpiler-todo'] || 0;
    for (const f of sorted) {
      if (f.category === 'transpiler-todo') {
        if (transpShown >= CAP_TRANSP) continue;
        transpShown++;
      }
      const tags = [];
      if (f.kind) tags.push('*' + f.kind + '*');
      if (f.note) tags.push(mdCell(f.note));
      if (f.legit) tags.push('⚑legit-ctx');
      if (f.comment) tags.push('¤comment');
      const meta = tags.length ? ' `' + tags.join(' · ').replace(/`/g, '') + '` — ' : ' ';
      L.push(`| \`${f.category}\` | ${f.line} |${meta}${mdCell(f.extract)} |`);
    }
    if (transpTotal > CAP_TRANSP) {
      L.push(`| \`transpiler-todo\` | … | *(+${transpTotal - CAP_TRANSP} autres \`TRANSPILER-TODO\` dans ce fichier — dette transpileur, cf. §faux positifs)* |`);
    }
  }
  return L.join('\n');
}

const moteurRecords = [...byFile.entries()].filter(([, r]) => r.moteur);
const horsRecords = [...byFile.entries()].filter(([, r]) => !r.moteur);

P('---');
P('');
P(`## SECTION MOTEUR — ${totMoteur} findings sur ${moteurRecords.length} fichiers`);
P('');
P('### Récap par fichier');
P('');
P(recapTable(moteurRecords));
P('');
P('### Détail par fichier');
P(detailBlocks(moteurRecords));
P('');
P('---');
P('');
P(`## SECTION HORS-MOTEUR — ${totHors} findings sur ${horsRecords.length} fichiers`);
P('');
P('### Récap par fichier');
P('');
P(recapTable(horsRecords));
P('');
P('### Détail par fichier');
P(detailBlocks(horsRecords));
P('');

// ─── Top 20 prioritaires ────────────────────────────────────────────────────
// Priorité : MOTEUR d'abord ; au sein, wireTodo + silent-default en tête.
const PRIO_CAT = { 'silent-default': 0, 'wireTodo': 1, 'throw-stub': 2, 'ts-suppress': 3, 'console-miss': 4, 'warnOnce': 5, 'empty-body': 6, 'marker': 7, 'transpiler-todo': 8 };
const prioritized = allFindings.slice().sort((a, b) => {
  const am = isMoteur(a.file) ? 0 : 1, bm = isMoteur(b.file) ? 0 : 1;
  if (am !== bm) return am - bm;
  const ac = PRIO_CAT[a.category], bc = PRIO_CAT[b.category];
  if (ac !== bc) return ac - bc;
  if (a.file !== b.file) return a.file < b.file ? -1 : 1;
  return a.line - b.line;
});
P('---');
P('');
P('## Top 20 prioritaires (MOTEUR d\'abord ; `__wireTodo` + `silent-default` en tête)');
P('');
P('| # | Fichier:ligne | Catégorie | Extrait |');
P('|--:|---|---|---|');
for (let i = 0; i < Math.min(20, prioritized.length); i++) {
  const f = prioritized[i];
  const tag = f.kind ? ` *(${mdCell(f.kind)})*` : '';
  P(`| ${i + 1} | \`${f.file}:${f.line}\`${isMoteur(f.file) ? ' ⚙️' : ''} | \`${f.category}\`${tag} | ${mdCell(f.extract)} |`);
}
P('');

// ─── Faux positifs probables / whitelist candidate ──────────────────────────
const legitFindings = allFindings.filter(f => f.legit && (f.category === 'marker' || f.category === 'empty-body' || f.category === 'warnOnce' || f.category === 'silent-default' || f.category === 'console-miss'));
const commentMarkers = allFindings.filter(f => f.category === 'marker' && f.comment);
const transpTotal = catTotals['transpiler-todo'] || 0;
const placeholderMarkers = allFindings.filter(f => f.category === 'marker' && /placeholder/.test(f.kind));

P('---');
P('');
P('## Faux positifs probables / whitelist candidate');
P('');
P('Cette section signale les findings statistiquement les plus susceptibles d\'être **légitimes** ' +
  '(à ne PAS transformer en throw), pour guider le lot « Gardes moteur » (PHASE B.2).');
P('');
P(`### 1. No-op / stub à contexte hardware-link (±3 lignes : link/serial/RTC/cable/save-hw) — ${legitFindings.length}`);
P('');
P('Ce sont des candidats **whitelist** (no-op LÉGITIMES : multijoueur / câble / RTC / save hardware, cf. exemptions du contrat).');
P('');
if (legitFindings.length) {
  P('| Fichier:ligne | Catégorie | Extrait |');
  P('|---|---|---|');
  for (const f of legitFindings.slice(0, 60)) {
    P(`| \`${f.file}:${f.line}\`${isMoteur(f.file) ? ' ⚙️' : ''} | \`${f.category}\` | ${mdCell(f.extract)} |`);
  }
  if (legitFindings.length > 60) P(`\n*(+${legitFindings.length - 60} autres — voir le détail par fichier.)*`);
} else {
  P('*(aucun)*');
}
P('');
P(`### 2. Dette du transpileur c→ts : \`TRANSPILER-TODO\` — ${transpTotal}`);
P('');
P('Annotations **générées automatiquement** par `scripts/transpile-c.cjs` (majorité : ' +
  '`&élément scalaire (out-param ?)` = adresse-de-scalaire non résolue lors de la transpilation ' +
  'de tableaux `SaveBlock`). Ce ne sont **pas** des stubs manuels : elles marquent des points de ' +
  'transpilation à re-vérifier, pas des primitives absentes. À traiter par le chantier transpileur ' +
  '(cf. `audit-reports/transpile/`), séparément des gardes moteur. Répartition par fichier :');
P('');
{
  const cnt = new Map();
  for (const f of allFindings) if (f.category === 'transpiler-todo') cnt.set(f.file, (cnt.get(f.file) || 0) + 1);
  const rows = [...cnt.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  P('| Fichier | TRANSPILER-TODO |');
  P('|---|--:|');
  for (const [rel, n] of rows.slice(0, 25)) P(`| \`${rel}\` | ${n} |`);
  if (rows.length > 25) P(`| *(+${rows.length - 25} fichiers)* | |`);
}
P('');
P(`### 3. Marqueurs en commentaire de documentation — ${commentMarkers.length}`);
P('');
P('Findings `marker` dont la ligne est un **commentaire** (`//`, `*`, `/*`). Une large part documente ' +
  'un comportement 1:1 (« no-op chez nous car … », « STUB décomp d\'origine », descriptions de ' +
  '`placeholder`/`{STR_VAR}`) plutôt qu\'une dette réelle. À trier manuellement — beaucoup sont légitimes.');
P('');
P(`### 4. \`placeholder\` = concept décomp — ${placeholderMarkers.length} findings \`marker\` contiennent « placeholder »`);
P('');
P('Le décomp emploie `placeholder` comme terme métier (`DYNAMIC_PLACEHOLDER`, `PLACEHOLDER_BEGIN`, ' +
  '`ExpandPlaceholders`, `{STR_VAR_n}`). Le filtre par limite de mot écarte déjà les identifiants ' +
  'camelCase (`ExpandPlaceholders`), mais les commentaires « placeholder {STR_VAR_1} » restent — ' +
  'majoritairement légitimes.');
P('');
P('### 5. `empty-body` = HEURISTIQUE');
P('');
P('La détection de corps vide/return trivial est **ligne-par-ligne** (ne voit PAS les corps ' +
  'multi-lignes) et peut confondre une signature avec un vrai no-op voulu. Chaque finding ' +
  '`empty-body` est à vérifier à la main (marqué *heuristique*).');
P('');
P('---');
P('');
P(`_Fin du rapport — ${allFindings.length} findings, généré par \`scripts/audit-engine-stubs.cjs\` le ${DATE}._`);

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, out.join('\n'), 'utf8');

// ─── Résumé console ─────────────────────────────────────────────────────────
console.log('audit-engine-stubs : ' + allFindings.length + ' findings (' + totMoteur + ' MOTEUR, ' + totHors + ' HORS-MOTEUR)');
console.log('  fichiers scannés : ' + files.length + ' · fichiers touchés : ' + byFile.size);
for (const c of CATS) console.log('  ' + c.padEnd(16) + ' ' + (catTotals[c] || 0));
console.log('rapport → ' + toPosix(path.relative(ROOT, REPORT_PATH)));
