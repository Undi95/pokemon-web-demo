#!/usr/bin/env node
/*
 * audit-transpiler-pitfalls.cjs — DÉTECTEUR PRÉVENTIF des 4 familles de bugs
 * transpileur c→ts payées le 2026-07-16 (freeze getString→scanner EOS, commit
 * a49d8f6e9 ; pointer-arith `sPokenavBgDotsPal + 1`, commit 87236a0e6 ; tables
 * d'anim transpilées en objets {type,frame,loop} ; boucles à invariant perdu).
 *
 * LECTURE SEULE : scanne src/ (.ts) et écrit un rapport markdown déterministe
 * dans audit-reports/engine/TRANSPILER-PITFALLS.md (écrasé à chaque run).
 * N'édite AUCUN fichier de code. Pas de git, pas de serveur.
 *
 * Régénération :  node scripts/audit-transpiler-pitfalls.cjs
 *
 * Familles détectées :
 *   (a) getString-nu    — `getString(...)` (JS string) passé DIRECTEMENT (confiance
 *                         haute) ou via variable intra-fonction (confiance moyenne)
 *                         à une fonction qui scanne un buffer GBA jusqu'à EOS 0xFF
 *                         ou écrit dedans, SANS encodeOwText/encodeChars entre les
 *                         deux. C'est LE freeze dur du 2026-07-16 (le scan
 *                         `while (src[s] !== 0xFF)` ne trouve jamais l'EOS d'une
 *                         string JS → boucle synchrone infinie).
 *   (b) pointer-arith   — `<table> + <n>` / `<table>++` où <table> ressemble à un
 *                         buffer/table de données (suffixe Pal/Tiles/Tilemap/Gfx/
 *                         Pointers/Table, ou déclaré TypedArray dans le fichier).
 *                         En C c'est un pointeur décalé ; en JS `array + 1` =
 *                         concaténation string = garbage (crash écran payé).
 *   (c) anim-table-objet— tables sAnim* / sAffineAnim* / sSpriteAnimTable* transpilées
 *                         en OBJETS à clés {type,frame,loop,jump,end} au lieu de
 *                         TABLEAUX de commandes ANIMCMD_* ou AFFINEANIMCMD_* (le C
 *                         `union AnimCmd sAnim_X[] = {...}` mal transpilé). Inerte
 *                         tant que CreateSprite les rejette, mais l'anim ne jouera
 *                         JAMAIS.
 *   (d) boucle-invariant— while/do-while dont AUCUNE variable de la condition
 *                         n'est modifiée dans le corps ET sans break/return/throw
 *                         (HEURISTIQUE textuelle par accolades équilibrées).
 *
 * Fonctions-puits famille (a) — liste établie en lisant src/string_util.ts,
 * src/text.ts, src/dynamic_placeholder_text_util.ts, src/international_string_util.ts
 * (celles SANS garde anti-string-JS ; les gardées sont listées dans GUARDED_SINKS).
 *
 * Priorités (atteignabilité, croisée par grep des call-sites src/+harness/) :
 *   P1 — fonction hôte référencée ET fichier d'écran câblé aujourd'hui
 *        (pokenav_*, region_map, credits, field_screen_effect) OU code top-level
 *        (exécuté au chargement du module).
 *   P2 — fonction hôte référencée ailleurs.
 *   P3 — fonction hôte jamais référencée (code mort/inerte aujourd'hui).
 * Pour approfondir : node scripts/decomp-index.cjs --sym <fn>.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIR = path.join(ROOT, 'src');
const REF_DIRS = ['src', 'harness']; // corpus pour compter les références (atteignabilité)
const REPORT_PATH = path.join(ROOT, 'audit-reports', 'engine', 'TRANSPILER-PITFALLS.md');
const DATE = '2026-07-16';

// ─── Famille (a) : fonctions-puits (scan EOS / écriture buffer GBA) ─────────
// argIdx = positions d'argument qui DOIVENT être des buffers GBA (Uint8Array).
// sev : FREEZE = scan EOS non borné (boucle infinie sur string JS) ·
//       crash = throw/TypeError à l'exécution · garbage = écrit/retourne n'importe quoi.
const SINKS = {
  // src/string_util.ts
  StringCopy:                { args: { 0: 'crash', 1: 'crash' } },       // garde throw sur src ; dest.subarray crash
  StringCopy_Nickname:       { args: { 0: 'garbage', 1: 'garbage' } },   // boucle bornée POKEMON_NAME_LENGTH
  StringGet_Nickname:        { args: { 0: 'garbage' } },
  StringCopy_PlayerName:     { args: { 0: 'garbage', 1: 'garbage' } },
  StringAppend:              { args: { 0: 'FREEZE', 1: 'crash' } },      // scan EOS de dest NON borné
  StringCopyN:               { args: { 0: 'garbage', 1: 'garbage' } },
  StringAppendN:             { args: { 0: 'FREEZE', 1: 'garbage' } },
  StringLength:              { args: { 0: 'FREEZE' } },                  // while (str[length] !== EOS)
  StringCompare:             { args: { 0: 'FREEZE', 1: 'FREEZE' } },     // 2 strings JS égales → undefined===undefined ∞
  StringCompareN:            { args: { 0: 'garbage', 1: 'garbage' } },   // borné par n
  IsStringLengthAtLeast:     { args: { 0: 'garbage' } },
  StringFill:                { args: { 0: 'crash' } },                   // écriture prop de primitive (strict) = TypeError
  StringCopyPadded:          { args: { 0: 'crash', 1: 'FREEZE' } },      // scan EOS de src NON borné
  StringFillWithTerminator:  { args: { 0: 'crash' } },
  ConvertIntToDecimalStringN:  { args: { 0: 'crash' } },
  ConvertUIntToDecimalStringN: { args: { 0: 'crash' } },
  ConvertIntToHexStringN:    { args: { 0: 'crash' } },
  StringBraille:             { args: { 0: 'crash', 1: 'FREEZE' } },      // for(;;) sur src, case EOS jamais atteint
  StringCopyN_Multibyte:     { args: { 0: 'garbage', 1: 'garbage' } },
  StringLength_Multibyte:    { args: { 0: 'FREEZE' } },
  WriteColorChangeControlCode: { args: { 0: 'crash' } },
  IsStringJapanese:          { args: { 0: 'FREEZE' } },
  IsStringNJapanese:         { args: { 0: 'garbage' } },
  StringCompareWithoutExtCtrlCodes: { args: { 0: 'crash', 1: 'crash' } }, // .subarray sur string JS = TypeError
  ConvertInternationalString: { args: { 0: 'FREEZE' } },                 // → StripExtCtrlCodes
  StripExtCtrlCodes:         { args: { 0: 'FREEZE' } },                  // while (str[i] !== EOS)
  StringExpandPlaceholders:  { args: { 0: 'crash' } },                   // src (arg 1) A un bridge string→encode ; dest NON
  // src/dynamic_placeholder_text_util.ts
  DynamicPlaceholderTextUtil_ExpandPlaceholders: { args: { 0: 'crash', 1: 'FREEZE' } }, // LE bug a49d8f6e9
  DynamicPlaceholderTextUtil_SetPlaceholderPtr:  { args: { 1: 'crash' } }, // crash DIFFÉRÉ (garde StringCopy à l'expand)
  // src/international_string_util.ts
  PadNameString:             { args: { 0: 'FREEZE' } },                  // StripExtCtrlCodes + StringLength
  ConvertInternationalPlayerName:          { args: { 0: 'FREEZE' } },
  ConvertInternationalPlayerNameStripChar: { args: { 0: 'FREEZE' } },
  ConvertInternationalContestantName:      { args: { 0: 'FREEZE' } },
  StringAppendWithPlaceholder: { args: { 0: 'FREEZE', 1: 'FREEZE', 2: 'FREEZE' } }, // while ((c=src[s++]) !== EOS
  CopyMonCategoryText:       { args: { 1: 'crash' } },
  GetStringClearToWidth:     { args: { 0: 'crash' } },
  // src/text.ts
  RenderTextHandleBold:      { args: { 2: 'FREEZE' } },                  // do {...} while (temp !== EOS)
};

// Puits GARDÉS (typeof/instanceof + encode à l'entrée) — documentés, PAS flaggés :
const GUARDED_SINKS = [
  'GetStringWidth (text.ts:498 — instanceof Uint8Array ? : encodeStringForFont)',
  'GetStringRightAlignXOffset / GetStringCenterAlignXOffset (text.ts — délèguent à GetStringWidth)',
  'GetStringCenterAlignXOffset / GetStringRightAlignXOffset / …WithLetterSpacing / GetStringWidthDifference (international_string_util.ts — acceptent string)',
  'TVShowConvertInternationalString (international_string_util.ts:43 — typeof src === string → encodeOwText)',
  'GetNicknameLanguage (international_string_util.ts:51 — typeof string → LANGUAGE_ENGLISH)',
  'StringExpandPlaceholders arg src (string_util.ts:624 — bridge encodeOwText différé ; ⚠ si le module text n\'est pas encore chargé, src devient [EOS] silencieusement)',
  'AddTextPrinter / AddTextPrinterParameterized (text.ts — instanceof Uint8Array ? : encodeStringForFont)',
  'StringCopy arg src (string_util.ts:121 — GARDE MOTEUR throw, transforme le freeze en crash HURLANT ; le call-site reste un bug)',
];

// Wrappers d'encodage qui SANITISENT une string JS → buffer GBA :
const ENCODERS_RE = /\b(encodeOwText|encodeOwTextSource|encodeChars|encodeStringForFont|EncodePlayerNameFR|encodeOwTextFR)\s*\(/;
// Producteurs de string JS (jamais un buffer GBA) :
const STRING_PRODUCERS_RE = /\b(getString|getStringVar|GetPlayerNameString|decodeOwBytes)\s*\(/;

// ─── Famille (b) : suffixes de noms de tables/buffers de données ────────────
const TABLE_NAME_RE = /^[sg][A-Z]\w*(?:Pals?|Tiles|Tilemap|Gfx|Pointers|Table)$/;
const TYPED_DECL_RE = /(?:const|let|var)\s+(\w+)\s*(?::\s*(?:Readonly<)?(?:Uint8|Uint16|Uint32|Int8|Int16|Int32)Array|\s*:\s*(?:readonly\s+)?number\[\])?\s*=\s*(?:new\s+(?:Uint8|Uint16|Uint32|Int8|Int16|Int32)Array|(?:Uint8|Uint16|Uint32)Array\.(?:from|of)\()/g;

// ─── Famille (c) : noms de tables d'anim ────────────────────────────────────
const ANIM_TABLE_DECL_RE = /(?:export\s+)?const\s+(s(?:Sprite)?(?:Affine)?Anims?(?:Table)?_\w+)\s*(?::[^=\n]{0,80})?=\s*\{/g;
const ANIMCMD_RE = /\b(?:AFFINE)?ANIMCMD_\w+/;

// ─── Fichiers d'écrans câblés AUJOURD'HUI (→ P1) ────────────────────────────
const HOT_FILE_RE = /(?:^|\/)(?:pokenav_\w+|region_map\w*|credits|field_screen_effect)\.ts$/;

// ─── Marche récursive ────────────────────────────────────────────────────────
function walk(dirAbs, out) {
  let entries;
  try { entries = fs.readdirSync(dirAbs, { withFileTypes: true }); }
  catch { return out; }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of entries) {
    const abs = path.join(dirAbs, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(abs, out);
    } else if (e.isFile() && e.name.endsWith('.ts') && !e.name.endsWith('.d.ts')) {
      out.push(abs);
    }
  }
  return out;
}
const toPosix = (p) => p.split(path.sep).join('/');

// ─── Vue "code" : commentaires + contenus de strings remplacés par espaces ──
// MÊME LONGUEUR que le source (mapping index→ligne conservé). Heuristique :
// ne gère pas les regex-literals contenant quotes (rare, risque accepté).
function stripCode(raw) {
  const n = raw.length;
  const out = Buffer.from(raw, 'utf8').length === n ? raw.split('') : Array.from(raw);
  let i = 0;
  let state = 'code'; // code | line | block | sq | dq | tpl
  while (i < n) {
    const c = raw[i], c2 = raw[i + 1];
    if (state === 'code') {
      if (c === '/' && c2 === '/') { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i += 2; continue; }
      if (c === '/' && c2 === '*') { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i += 2; continue; }
      if (c === "'") { state = 'sq'; i++; continue; }
      if (c === '"') { state = 'dq'; i++; continue; }
      if (c === '`') { state = 'tpl'; i++; continue; }
      i++; continue;
    }
    if (state === 'line') {
      if (c === '\n') { state = 'code'; i++; continue; }
      out[i] = ' '; i++; continue;
    }
    if (state === 'block') {
      if (c === '*' && c2 === '/') { state = 'code'; out[i] = ' '; out[i + 1] = ' '; i += 2; continue; }
      if (c !== '\n') out[i] = ' ';
      i++; continue;
    }
    // strings : on garde le quote fermant, on blanke le contenu
    if (state === 'sq' || state === 'dq') {
      const q = state === 'sq' ? "'" : '"';
      if (c === '\\') { out[i] = ' '; if (i + 1 < n && raw[i + 1] !== '\n') out[i + 1] = ' '; i += 2; continue; }
      if (c === q || c === '\n') { state = 'code'; i++; continue; }
      out[i] = ' '; i++; continue;
    }
    if (state === 'tpl') {
      if (c === '\\') { out[i] = ' '; if (i + 1 < n && raw[i + 1] !== '\n') out[i + 1] = ' '; i += 2; continue; }
      if (c === '`') { state = 'code'; i++; continue; }
      if (c !== '\n') out[i] = ' ';
      i++; continue;
    }
  }
  return out.join('');
}

// index absolu → n° de ligne (1-based)
function makeLineIndex(raw) {
  const starts = [0];
  for (let i = 0; i < raw.length; i++) if (raw[i] === '\n') starts.push(i + 1);
  return (idx) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}

// scan parenthèses équilibrées sur la vue code, à partir de l'index de '('
function balancedParen(code, openIdx) {
  let bal = 0;
  for (let i = openIdx; i < code.length; i++) {
    if (code[i] === '(') bal++;
    else if (code[i] === ')') { bal--; if (bal === 0) return i; }
  }
  return -1;
}
function balancedBrace(code, openIdx) {
  let bal = 0;
  for (let i = openIdx; i < code.length; i++) {
    if (code[i] === '{') bal++;
    else if (code[i] === '}') { bal--; if (bal === 0) return i; }
  }
  return -1;
}

// split top-level d'une liste d'arguments (sur la vue code) → spans [start,end)
function splitArgs(code, start, end) {
  const spans = [];
  let bal = 0, s = start;
  for (let i = start; i < end; i++) {
    const c = code[i];
    if (c === '(' || c === '[' || c === '{') bal++;
    else if (c === ')' || c === ']' || c === '}') bal--;
    else if (c === ',' && bal === 0) { spans.push([s, i]); s = i + 1; }
  }
  if (end > s || spans.length) spans.push([s, end]);
  return spans;
}

// ─── Carte ligne → fonction englobante (heuristique accolades, style stub-audit) ──
function buildFnMap(codeLines) {
  const fnOfLine = new Array(codeLines.length).fill('(top-level)');
  const stack = [];
  let depth = 0;
  let pending = null;
  const FN_RES = [
    /(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/,
    /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]{0,80})?=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*(?::[^=>{;]{0,60})?=>|[A-Za-z_$][\w$]*\s*=>)/,
  ];
  for (let li = 0; li < codeLines.length; li++) {
    const line = codeLines[li];
    let name = null;
    for (const re of FN_RES) { const m = line.match(re); if (m) { name = m[1]; break; } }
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    if (name && opens > 0) {
      // la { de ce fn ouvre sur cette ligne
      stack.push({ name, enter: depth + 1 });
    } else if (name) {
      pending = { name, depthAt: depth };
    } else if (pending && opens > 0) {
      stack.push({ name: pending.name, enter: depth + 1 });
      pending = null;
    } else if (pending && line.trim() !== '') {
      pending = null; // signature sans corps immédiat (arrow one-liner etc.)
    }
    fnOfLine[li] = stack.length ? stack[stack.length - 1].name : '(top-level)';
    depth += opens - closes;
    while (stack.length && depth < stack[stack.length - 1].enter) stack.pop();
  }
  return fnOfLine;
}

// ─── Collecte des fichiers ───────────────────────────────────────────────────
const files = walk(SCAN_DIR, []);
const findings = { a: [], b: [], c: [], d: [] };

// fichiers où les puits sont DÉFINIS (call-sites internes = implémentation, pas des bugs)
const SINK_DEF_FILES = new Set([
  'src/string_util.ts', 'src/text.ts', 'src/dynamic_placeholder_text_util.ts',
  'src/international_string_util.ts',
]);

const KEYWORDS = new Set(['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'return', 'break', 'continue', 'const', 'let', 'var', 'function', 'new', 'typeof',
  'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined', 'void', 'this',
  'Math', 'Number', 'String', 'Boolean', 'Array', 'Object']);

// Famille (b) — fichiers où les "pointeurs" sont des ADRESSES NUMÉRIQUES par design
// (moteur son m4a byte-exact : gSongTable etc. = offsets dans gSoundMemory, cf.
// mémoire chantier-son-m4a « pointeurs C ⇒ adresses numériques » ; l'arith y est 1:1 légitime).
const ADDRESS_SPACE_FILES_RE = /^src\/(?:m4a\w*|song_table|mplay\w*)\.ts$/;

for (const abs of files) {
  const rel = toPosix(path.relative(ROOT, abs));
  const raw = fs.readFileSync(abs, 'utf8');
  const code = stripCode(raw);
  const lineOf = makeLineIndex(raw);
  const rawLines = raw.split(/\r?\n/);
  const codeLines = code.split(/\r?\n/);
  const fnOfLine = buildFnMap(codeLines);
  const extract = (ln) => {
    let s = (rawLines[ln - 1] || '').trim();
    if (s.length > 110) s = s.slice(0, 109) + '…';
    return s;
  };

  // ══ (a) getString nu vers un puits ══════════════════════════════════════
  if (!SINK_DEF_FILES.has(rel)) {
    // 1. variables assignées depuis un producteur de string JS (par fonction englobante)
    //    key = fn + ':' + ident → { line, sanitizedAtLine }
    const strVars = new Map();
    const assignRe = /(?:^|[^.\w$])(?:(?:const|let|var)\s+)?([A-Za-z_$][\w$]*)\s*=\s*([^;\n]{0,160})/g;
    for (let li = 0; li < codeLines.length; li++) {
      assignRe.lastIndex = 0;
      let m;
      while ((m = assignRe.exec(codeLines[li])) !== null) {
        const ident = m[1], rhs = m[2];
        if (KEYWORDS.has(ident)) continue;
        const key = fnOfLine[li] + ':' + ident;
        if (ENCODERS_RE.test(rhs) || /new\s+Uint8Array|Uint8Array\.(from|of)|encodeOw/.test(rhs)) {
          const rec = strVars.get(key);
          if (rec) rec.sanitizedAt = li + 1; // ré-assignée depuis un encodeur → sanitisée
          continue;
        }
        if (STRING_PRODUCERS_RE.test(rhs)) {
          strVars.set(key, { line: li + 1, sanitizedAt: 0 });
        }
      }
    }

    // 2. call-sites des puits
    for (const [sink, spec] of Object.entries(SINKS)) {
      const re = new RegExp('(^|[^.\\w$])' + sink + '\\s*\\(', 'g');
      let m;
      while ((m = re.exec(code)) !== null) {
        const openIdx = code.indexOf('(', m.index + m[1].length + sink.length - 1);
        const closeIdx = balancedParen(code, openIdx);
        if (closeIdx < 0) continue;
        const callLine = lineOf(openIdx);
        // skip : c'est une déclaration de fonction homonyme locale, pas un appel
        const before = code.slice(Math.max(0, m.index - 20), m.index + 1);
        if (/function\s+$/.test(before)) continue;
        const spans = splitArgs(code, openIdx + 1, closeIdx);
        for (const [argIdxStr, sev] of Object.entries(spec.args)) {
          const ai = Number(argIdxStr);
          if (ai >= spans.length) continue;
          const [as, ae] = spans[ai];
          const argCode = code.slice(as, ae).trim();
          const argRaw = raw.slice(as, ae).trim();
          if (!argCode) continue;
          // — cas 1 : producteur de string direct dans l'argument, sans encodeur
          if (STRING_PRODUCERS_RE.test(argCode) && !ENCODERS_RE.test(argCode)) {
            findings.a.push({
              file: rel, line: callLine, fn: fnOfLine[callLine - 1], sink, argIdx: ai,
              sev, conf: 'HAUTE', via: 'direct', extract: extract(callLine),
              arg: argRaw.length > 80 ? argRaw.slice(0, 79) + '…' : argRaw,
            });
            continue;
          }
          // — cas 2 : identifiant nu tracé depuis un producteur (même fonction)
          const idm = argCode.match(/^([A-Za-z_$][\w$]*)$/);
          if (idm) {
            const key = fnOfLine[callLine - 1] + ':' + idm[1];
            const rec = strVars.get(key);
            if (rec && rec.line < callLine && !(rec.sanitizedAt && rec.sanitizedAt > rec.line && rec.sanitizedAt < callLine)) {
              findings.a.push({
                file: rel, line: callLine, fn: fnOfLine[callLine - 1], sink, argIdx: ai,
                sev, conf: 'MOYENNE', via: `var \`${idm[1]}\` ← getString l.${rec.line}`,
                extract: extract(callLine), arg: argRaw,
              });
            }
          }
        }
      }
    }
  }

  // ══ (b) pointer-arith sur tables/buffers ═══════════════════════════════
  if (!ADDRESS_SPACE_FILES_RE.test(rel)) {
    // idents déclarés TypedArray dans CE fichier
    const typedIdents = new Set();
    TYPED_DECL_RE.lastIndex = 0;
    let tm;
    while ((tm = TYPED_DECL_RE.exec(code)) !== null) typedIdents.add(tm[1]);

    const ptrRe = /(^|[^.\w$])([sg][A-Z][\w$]*)\s*(\+\+|\+(?!\+|=)\s*([\w$]+|\d+))/g;
    let pm;
    while ((pm = ptrRe.exec(code)) !== null) {
      const ident = pm[2];
      const isTableName = TABLE_NAME_RE.test(ident);
      const isTyped = typedIdents.has(ident);
      if (!isTableName && !isTyped) continue;
      const op = pm[3];
      const idx = pm.index + pm[1].length;
      const ln = lineOf(idx);
      const lineCode = codeLines[ln - 1] || '';
      // exclusions : concat de log (quote + ident sur la même expr), `.length`
      // (impossible ici : [^.\w$] avant ident), et droite non-numérique douteuse
      let rhs = op === '++' ? '++' : op.replace(/^\+\s*/, '');
      let conf = 'HAUTE';
      if (op !== '++' && !/^\d+$/.test(rhs)) {
        // `table + ident` : offset variable (pointer-arith C probable) — confiance moyenne
        if (KEYWORDS.has(rhs)) continue;
        conf = 'MOYENNE';
      }
      // heuristique anti-concat : un quote résiduel adjacent sur la vue code (strings blankées → quotes restent)
      const left = lineCode.slice(0, lineCode.indexOf(ident) >= 0 ? lineCode.indexOf(ident) : 0);
      if (/['"`]\s*\+\s*$/.test(left)) continue;
      findings.b.push({
        file: rel, line: ln, fn: fnOfLine[ln - 1], ident, op: op === '++' ? ident + '++' : `${ident} + ${rhs}`,
        conf, why: isTableName ? 'suffixe table' : 'déclaré TypedArray', extract: extract(ln),
      });
    }
  }

  // ══ (c) tables d'anim transpilées en objets ═════════════════════════════
  {
    ANIM_TABLE_DECL_RE.lastIndex = 0;
    let am;
    while ((am = ANIM_TABLE_DECL_RE.exec(code)) !== null) {
      const name = am[1];
      const braceIdx = code.indexOf('{', am.index + am[0].length - 1);
      if (braceIdx < 0) continue;
      const endIdx = balancedBrace(code, braceIdx);
      if (endIdx < 0) continue;
      const initCode = code.slice(braceIdx, endIdx + 1);
      const initRaw = raw.slice(braceIdx, endIdx + 1);
      const hasAnimCmd = ANIMCMD_RE.test(initRaw);
      const hasBogusKeys = /\b(?:type|frame|loop|jump|end)\s*:/.test(initCode);
      // OBJET (pas tableau) contenant des commandes d'anim OU les clés bidon → malformé
      if (hasAnimCmd || hasBogusKeys) {
        const ln = lineOf(am.index + (am[0].length - am[0].trimStart().length));
        findings.c.push({
          file: rel, line: lineOf(braceIdx), fn: '(top-level)', name,
          keys: (initCode.match(/\b(type|frame|loop|jump|end)\s*:/g) || []).map(s => s.replace(/\s*:$/, '')).join(','),
          hasAnimCmd, extract: extract(lineOf(braceIdx)),
        });
        void ln;
      }
    }
  }

  // ══ (d) boucles while à invariant perdu (HEURISTIQUE) ═══════════════════
  {
    const whileRe = /(^|[^\w$])while\s*\(/g;
    let wm;
    while ((wm = whileRe.exec(code)) !== null) {
      const openIdx = code.indexOf('(', wm.index + wm[1].length);
      const closeIdx = balancedParen(code, openIdx);
      if (closeIdx < 0) continue;
      const cond = code.slice(openIdx + 1, closeIdx);
      const condRaw = raw.slice(openIdx + 1, closeIdx);
      const ln = lineOf(openIdx);

      // do { ... } while (cond) — corps AVANT : matcher la '}' qui précède
      let bodyStart = -1, bodyEnd = -1, isDoWhile = false;
      let k = wm.index + (wm[1] ? wm[1].length : 0) - 1;
      while (k >= 0 && /\s/.test(code[k])) k--;
      if (k >= 0 && code[k] === '}') {
        isDoWhile = true;
        let bal = 0;
        for (let i = k; i >= 0; i--) {
          if (code[i] === '}') bal++;
          else if (code[i] === '{') { bal--; if (bal === 0) { bodyStart = i; bodyEnd = k; break; } }
        }
      } else {
        // while (cond) { body } — corps APRÈS
        let j = closeIdx + 1;
        while (j < code.length && /\s/.test(code[j])) j++;
        if (code[j] === '{') {
          bodyStart = j;
          bodyEnd = balancedBrace(code, j);
        } else if (code[j] === ';') {
          bodyStart = bodyEnd = j; // while(cond); → corps vide
        } else {
          // corps mono-instruction sans accolades
          bodyStart = j;
          bodyEnd = code.indexOf(';', j);
        }
      }
      if (bodyEnd < 0) continue;
      const body = code.slice(bodyStart, bodyEnd + 1);

      // une sortie explicite dans le corps → pas de freeze possible par invariant
      if (/\b(break|return|throw)\b/.test(body)) continue;
      // async/generator : la boucle peut progresser autrement
      if (/\b(await|yield)\b/.test(body)) continue;
      // condition qui SE modifie (idiome C `while (size--)`, `while ((c = src[s++]) !== EOS)`) → skip
      if (/(\+\+|--)/.test(cond) || /[^=!<>+\-*/%&|^]=(?!=)/.test(cond)) continue;
      // condition constante FALSY (`do {...} while (0)` = idiome macro C, exécute UNE fois) → skip
      const condTrim = cond.trim();
      if (condTrim === '0' || condTrim === 'false') continue;
      // condition constante TRUTHY sans break/return/throw → infinie, quels que soient
      // les appels du corps (sauf throw interne — à vérifier à la main)
      if (condTrim === 'true' || condTrim === '1' || /^\(?\s*;;\s*\)?$/.test(condTrim)) {
        findings.d.push({
          file: rel, line: ln, fn: fnOfLine[ln - 1], cond: condRaw.trim().slice(0, 60),
          kind: isDoWhile ? 'do-while' : 'while', why: 'condition constante truthy SANS break/return/throw',
          conf: 'HAUTE', extract: extract(ln),
        });
        continue;
      }
      // condition avec APPEL (ident(, ]( d'une table de fns, )( ) → side-effects possibles, skip
      if (/[\w$\])]\s*\(/.test(cond)) continue;
      // corps contenant un APPEL de fonction → mutation possible (setters cross-module,
      // state-machines `while (funcs[state](args))`) → skip (heuristique de précision)
      if (/[\w$\])]\s*\(/.test(body)) continue;

      // identifiants racine de la condition
      const condIds = new Set();
      const idRe = /[A-Za-z_$][\w$]*/g;
      let im;
      while ((im = idRe.exec(cond)) !== null) {
        const id = im[0];
        if (KEYWORDS.has(id)) continue;
        if (/^[A-Z][A-Z0-9_]*$/.test(id) && id.length > 1) continue; // CONSTANTES (EOS…)
        // ignorer les propriétés (précédées de '.')
        if (im.index > 0 && cond[im.index - 1] === '.') continue;
        condIds.add(id);
      }

      if (condIds.size === 0) {
        // condition faite uniquement de CONSTANTES (hors true/1, traités plus haut)
        findings.d.push({
          file: rel, line: ln, fn: fnOfLine[ln - 1], cond: condRaw.trim().slice(0, 60),
          kind: isDoWhile ? 'do-while' : 'while', why: 'condition constante SANS break/return/throw',
          conf: 'heuristique', extract: extract(ln),
        });
        continue;
      }

      let anyModified = false;
      for (const id of condIds) {
        const esc = id.replace(/\$/g, '\\$');
        const modRe = new RegExp(
          `(\\+\\+|--)\\s*${esc}\\b` +                                  // ++x / --x
          `|\\b${esc}\\s*(\\+\\+|--)` +                                 // x++ / x--
          `|\\b${esc}\\s*(=[^=]|[-+*/%&|^]=|<<=|>>>?=)` +               // x = / x +=
          `|\\b${esc}\\s*\\[[^\\]]{0,60}\\]\\s*=[^=]` +                 // x[i] =
          `|[(,]\\s*${esc}\\b` +                                        // passé à un appel (mutation possible)
          `|\\b${esc}\\s*\\.`                                           // méthode (mutation possible)
        );
        if (modRe.test(body)) { anyModified = true; break; }
      }
      if (!anyModified) {
        findings.d.push({
          file: rel, line: ln, fn: fnOfLine[ln - 1], cond: condRaw.trim().slice(0, 60),
          kind: isDoWhile ? 'do-while' : 'while',
          why: `aucune var de la condition (${[...condIds].join(', ')}) modifiée dans le corps`,
          conf: 'heuristique', extract: extract(ln),
        });
      }
    }
  }
}

// ─── Atteignabilité : refcount des fonctions hôtes sur src/ + harness/ ─────
const corpusFiles = [];
for (const d of REF_DIRS) walk(path.join(ROOT, d), corpusFiles);
let corpus = '';
for (const abs of corpusFiles) corpus += fs.readFileSync(abs, 'utf8') + '\n';

const refCache = new Map();
function refCount(fnName) {
  if (fnName === '(top-level)') return Infinity; // exécuté au chargement du module
  if (refCache.has(fnName)) return refCache.get(fnName);
  const re = new RegExp('\\b' + fnName.replace(/\$/g, '\\$') + '\\b', 'g');
  const m = corpus.match(re);
  // -1 : sa propre définition. Les fns anonymes de tasks (pattern CreateTask) ne
  // sont pas nommées → comptées via leur hôte.
  const c = m ? m.length - 1 : 0;
  refCache.set(fnName, c);
  return c;
}

function priorityOf(f) {
  const refs = refCount(f.fn);
  if (refs <= 0) return 'P3';
  if (HOT_FILE_RE.test(f.file) || f.fn === '(top-level)') return 'P1';
  return 'P2';
}
for (const fam of ['a', 'b', 'c', 'd']) {
  for (const f of findings[fam]) { f.prio = priorityOf(f); f.refs = refCount(f.fn); }
  findings[fam].sort((x, y) =>
    (x.prio < y.prio ? -1 : x.prio > y.prio ? 1 : 0) ||
    ((y.sev === 'FREEZE' ? 1 : 0) - (x.sev === 'FREEZE' ? 1 : 0)) ||
    (x.file < y.file ? -1 : x.file > y.file ? 1 : 0) || (x.line - y.line));
}

// ─── Rapport ─────────────────────────────────────────────────────────────────
const out = [];
const P = (s) => out.push(s);
const mdc = (s) => String(s).replace(/\|/g, '\\|');
const cnt = (fam, p) => findings[fam].filter(f => f.prio === p).length;

P('# Pièges transpileur c→ts — audit préventif des 4 familles (2026-07-16)');
P('');
P(`> Généré le **${DATE}** · régénération : \`node scripts/audit-transpiler-pitfalls.cjs\` · **LECTURE SEULE**.`);
P('> Scanne `src/` (.ts). Priorités par atteignabilité (grep call-sites `src/`+`harness/`) :');
P('> **P1** = fn hôte référencée + écran câblé aujourd\'hui (pokenav_*/region_map/credits/field_screen_effect) ou code top-level ·');
P('> **P2** = fn hôte référencée ailleurs · **P3** = fn hôte jamais référencée (inerte). Approfondir : `node scripts/decomp-index.cjs --sym <fn>`.');
P('');
P('| Famille | P1 | P2 | P3 | Total |');
P('|---|--:|--:|--:|--:|');
for (const [fam, label] of [['a', '(a) getString nu → scanner EOS'], ['b', '(b) pointer-arith sur tables'], ['c', '(c) tables d\'anim en objets'], ['d', '(d) boucles à invariant perdu']]) {
  P(`| ${label} | ${cnt(fam, 'P1')} | ${cnt(fam, 'P2')} | ${cnt(fam, 'P3')} | **${findings[fam].length}** |`);
}
P('');
P('**Contexte** — deux bugs réels payés le 2026-07-16, même famille transpileur :');
P('1. **FREEZE navigateur** : `getString(\'gText_RibbonsF700\')` (string JS) → `DynamicPlaceholderTextUtil_ExpandPlaceholders` ');
P('   dont le scan `while (src[s] !== 0xFF)` ne trouve jamais l\'EOS → boucle synchrone infinie (fix `a49d8f6e9`).');
P('2. **CRASH écran** : `SetWordTaskArg(taskId, 1, (sPokenavBgDotsPal + 1))` — pointer-arith C transpilée telle quelle (fix `87236a0e6`).');
P('Et un défaut latent : tables `sAffineAnim_*` transpilées en OBJETS `{type,frame,loop}` au lieu de tableaux de commandes.');
P('');

// (a)
P('---');
P('');
P(`## Famille (a) — \`getString(...)\` nu vers un scanner EOS / écrivain buffer — ${findings.a.length} finding(s)`);
P('');
P('Fonctions-puits (établies en lisant `src/string_util.ts`, `src/text.ts`, `src/dynamic_placeholder_text_util.ts`,');
P('`src/international_string_util.ts`) : ' + Object.keys(SINKS).map(s => '`' + s + '`').join(', ') + '.');
P('');
P('Sévérités : **FREEZE** = scan EOS non borné (boucle infinie synchrone = freeze dur navigateur) · **crash** = TypeError/throw ·');
P('**garbage** = boucle bornée, écrit/retourne du garbage sans planter.');
P('');
if (findings.a.length) {
  P('| Prio | Fichier:ligne | Fn hôte (refs) | Puits (arg) | Sév. | Confiance | Via | Extrait |');
  P('|---|---|---|---|---|---|---|---|');
  for (const f of findings.a) {
    P(`| **${f.prio}** | \`${f.file}:${f.line}\` | \`${f.fn}\` (${f.refs === Infinity ? 'module-load' : f.refs}) | \`${f.sink}\` (arg ${f.argIdx}) | ${f.sev} | ${f.conf} | ${mdc(f.via)} | ${mdc(f.extract)} |`);
  }
} else {
  P('*(aucun — les occurrences certaines ont été fixées le 2026-07-16, cf. ci-dessous)*');
}
P('');
P('**Fixes (a) appliqués le 2026-07-16** (encodeOwText(getString(...)), buffer .c d\'origine cité en commentaire) :');
P('- `src/pokenav_conditions_search_results.ts` `PrintSearchResultListMenuItems` — `DynamicPlaceholderTextUtil_ExpandPlaceholders(gStringVar2, getString(\'gText_NumberIndex\'))` ');
P('  = FREEZE en puissance identique au bug `a49d8f6e9` (décomp strings.c:994 `_("Nº {DYNAMIC 0}")`, call-site pokenav_conditions_search_results.c:674).');
P('- `src/mystery_event_script.ts` `MEScrCmd_givepokemon` ×2 — `StringCopyN(gStringVar1, getString(...) as unknown as Uint8Array, …)` : le cast forcé');
P('  copiait du garbage sans EOS (décomp strings.c:21-22 `gText_EggNickname`/`gText_Pokemon`, call-sites mystery_event_script.c:325/327).');
P('');
P('**Puits GARDÉS** (anti-string-JS à l\'entrée — PAS flaggés) :');
for (const g of GUARDED_SINKS) P('- ' + g);
P('');

// (b)
P('---');
P('');
P(`## Famille (b) — pointer-arith C sur tables/buffers — ${findings.b.length} finding(s)`);
P('');
P('`<table> + <n>` / `<table>++` où `<table>` est un tableau (suffixe Pal/Tiles/Tilemap/Gfx/Pointers/Table ou déclaré TypedArray');
P('dans le fichier). En JS `array + 1` = concat string = garbage. `arr[i + 1]` (index) N\'est PAS matché. **NE PAS fixer en');
P('aveugle** : chaque cas exige le `.c` en regard (l\'intention est un OFFSET dans la table → Map d\'offsets ou `.subarray`, cf. fix `87236a0e6`).');
P('');
if (findings.b.length) {
  P('| Prio | Fichier:ligne | Fn hôte (refs) | Expression | Confiance | Signal | Extrait |');
  P('|---|---|---|---|---|---|---|');
  for (const f of findings.b) {
    P(`| **${f.prio}** | \`${f.file}:${f.line}\` | \`${f.fn}\` (${f.refs === Infinity ? 'module-load' : f.refs}) | \`${mdc(f.op)}\` | ${f.conf} | ${f.why} | ${mdc(f.extract)} |`);
  }
} else {
  P('*(aucun)*');
}
P('');

// (c)
P('---');
P('');
P(`## Famille (c) — tables d'anim transpilées en OBJETS — ${findings.c.length} finding(s)`);
P('');
P('Forme MALFORMÉE (transpileur, `union AnimCmd sAnim_X[]` → objet) : `const sAnim_X = { type: ANIMCMD_FRAME(...), frame: …, loop: … }`.');
P('Forme SAINE attendue (cf. `registerAffineAnim(\'sAffineAnim_StarterPokemon\', { frames: [...] })` dans `src/starter_choose.ts:94`,');
P('ou tableaux de refs comme `sAffineAnims_RibbonIconBig = [ ... ]`) : un TABLEAU de commandes, pas un objet à clés `{type,frame,loop,jump,end}`.');
P('Inerte tant que le chemin sprite rejette l\'objet, mais **l\'anim ne jouera jamais** → à re-transcrire avec le `.c` en regard.');
P('');
if (findings.c.length) {
  P('| Prio | Fichier:ligne | Table | Clés bidon | Contient ANIMCMD | Extrait |');
  P('|---|---|---|---|---|---|');
  for (const f of findings.c) {
    P(`| **${f.prio}** | \`${f.file}:${f.line}\` | \`${f.name}\` | ${f.keys || '—'} | ${f.hasAnimCmd ? 'oui' : 'non'} | ${mdc(f.extract)} |`);
  }
} else {
  P('*(aucun)*');
}
P('');

// (d)
P('---');
P('');
P(`## Famille (d) — boucles while/do-while à invariant perdu (HEURISTIQUE) — ${findings.d.length} finding(s)`);
P('');
P('Aucune variable de la condition modifiée dans le corps, ET pas de `break`/`return`/`throw`/`await`/`yield`, ET pas d\'appel');
P('de fonction dans la condition. Analyse TEXTUELLE par accolades équilibrées — chaque finding est à vérifier à la main');
P('(une mutation via aliasing/propriété peut échapper au détecteur, dans les deux sens).');
P('');
if (findings.d.length) {
  P('| Prio | Fichier:ligne | Fn hôte (refs) | Boucle | Condition | Pourquoi | Extrait |');
  P('|---|---|---|---|---|---|---|');
  for (const f of findings.d) {
    P(`| **${f.prio}** | \`${f.file}:${f.line}\` | \`${f.fn}\` (${f.refs === Infinity ? 'module-load' : f.refs}) | ${f.kind} | \`${mdc(f.cond)}\` | ${mdc(f.why)} | ${mdc(f.extract)} |`);
  }
} else {
  P('*(aucun)*');
}
P('');
P('---');
P('');
P(`_Fin du rapport — ${findings.a.length + findings.b.length + findings.c.length + findings.d.length} findings, généré par \`scripts/audit-transpiler-pitfalls.cjs\` le ${DATE}._`);

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, out.join('\n'), 'utf8');

// ─── Résumé console ──────────────────────────────────────────────────────────
console.log('audit-transpiler-pitfalls :');
for (const [fam, label] of [['a', '(a) getString→EOS'], ['b', '(b) pointer-arith'], ['c', '(c) anim-objets'], ['d', '(d) invariant perdu']]) {
  console.log(`  ${label.padEnd(22)} P1=${cnt(fam, 'P1')} P2=${cnt(fam, 'P2')} P3=${cnt(fam, 'P3')} total=${findings[fam].length}`);
}
console.log('rapport → ' + toPosix(path.relative(ROOT, REPORT_PATH)));
// détail console (fichier:ligne) pour la famille (a) — c'est elle qu'on fixe
for (const f of findings.a) {
  console.log(`  [a][${f.prio}][${f.conf}] ${f.file}:${f.line} ${f.sink}(arg${f.argIdx}) sev=${f.sev} via=${f.via}`);
}
