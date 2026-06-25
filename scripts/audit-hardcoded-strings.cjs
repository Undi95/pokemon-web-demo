#!/usr/bin/env node
/**
 * audit-hardcoded-strings.cjs — SONDE DÉTERMINISTE de fidélité des textes.
 *
 * Raison d'être : les textes affichés au joueur DOIVENT venir des strings extraits
 * (strings.json via `getString('gText_…')`), JAMAIS d'une chaîne FR écrite à la main.
 * Une string inline = (1) un texte potentiellement FAUX (pas celui du jeu), (2) une
 * dette de fidélité invisible jusqu'à ce qu'un humain la repère à l'œil. Cette sonde
 * REMPLACE l'œil humain.
 *
 *   node scripts/audit-hardcoded-strings.cjs [dossier|fichier]
 *   exit 0 = propre · exit 1 = strings FR hardcodées détectées (listées)
 *
 * Fiabilité : LEXER caractère-par-caractère (états string/template/ligne-commentaire/
 * bloc-commentaire). Pas de regex ligne-à-ligne (qui ratait du code après un `/*`
 * parasite). Règle : tout littéral contenant un accent FR, hors commentaire, qui n'est
 * PAS l'argument-clé d'un `getString(…)`, est signalé.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const target = process.argv[2] ? path.resolve(ROOT, process.argv[2]) : path.join(ROOT, 'src');

const FR_ACCENT = /[éèêëàâäîïôöûüùçœ…«»]/;

/** Lexe un fichier TS et retourne les littéraux string/template : {line, text, isGetStringKey}. */
function lexLiterals(src) {
  const lits = [];
  let i = 0, line = 1;
  const n = src.length;
  // pile de contextes template pour gérer `${ ... }` imbriqué
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    // commentaire ligne
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    // commentaire bloc
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      i += 2; continue;
    }
    // string '...' ou "..."
    if (c === '"' || c === "'") {
      const startLine = line; const q = c; i++; let buf = '';
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { buf += src[i] + (src[i + 1] || ''); i += 2; continue; }
        if (src[i] === '\n') line++;
        buf += src[i]; i++;
      }
      i++; // ferme
      lits.push({ line: startLine, text: buf });
      continue;
    }
    // template `...` (avec ${...})
    if (c === '`') {
      const startLine = line; i++; let buf = '';
      while (i < n && src[i] !== '`') {
        if (src[i] === '\\') { buf += src[i] + (src[i + 1] || ''); i += 2; continue; }
        if (src[i] === '$' && src[i + 1] === '{') {
          // saute l'expression ${...} en comptant les accolades
          buf += '${'; i += 2; let depth = 1;
          while (i < n && depth > 0) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') depth--;
            else if (src[i] === '\n') line++;
            if (depth > 0) buf += src[i];
            i++;
          }
          buf += '}'; continue;
        }
        if (src[i] === '\n') line++;
        buf += src[i]; i++;
      }
      i++;
      lits.push({ line: startLine, text: buf });
      continue;
    }
    i++;
  }
  return lits;
}

/** L'argument est-il la clé d'un getString( ? On vérifie le texte source autour. */
function buildGetStringKeySet(src) {
  const keys = new Set();
  const re = /getString\s*\(\s*(['"`])([^'"`]+)\1/g;
  let m; while ((m = re.exec(src)) !== null) keys.add(m[2]);
  return keys;
}

const findings = [];
function scanFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const srcLines = src.split(/\r?\n/);
  const getStringKeys = buildGetStringKeySet(src);
  for (const lit of lexLiterals(src)) {
    if (!FR_ACCENT.test(lit.text)) continue;       // pas de FR → ignore
    if (lit.text.startsWith('gText_') || lit.text.startsWith('gMenuText_')) continue;
    if (getStringKeys.has(lit.text)) continue;      // c'est une clé passée à getString → OK
    // exclut les strings de dev (console.*, throw new Error) : pas joués au joueur
    const srcLine = srcLines[lit.line - 1] || '';
    if (/console\s*\.\s*(log|warn|error|info|debug)/.test(srcLine)) continue;
    if (/\bthrow\b|new\s+Error\s*\(/.test(srcLine)) continue;
    findings.push({ file: path.relative(ROOT, file), line: lit.line, text: lit.text.replace(/\n/g, '\\n') });
  }
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (!/node_modules|decomp-data|\.git/.test(p)) walk(p); }
    else if (/\.ts$/.test(ent.name)) scanFile(p);
  }
}
if (fs.statSync(target).isDirectory()) walk(target); else scanFile(target);

if (findings.length === 0) {
  console.log(`✅ Aucune string FR accentuée hardcodée dans ${path.relative(ROOT, target)}.`);
  process.exit(0);
}
console.log(`❌ ${findings.length} string(s) FR hardcodée(s) (devraient venir de getString('gText_…')) :\n`);
const byFile = {};
for (const f of findings) (byFile[f.file] = byFile[f.file] || []).push(f);
for (const [file, fs2] of Object.entries(byFile)) {
  console.log(`  ${file}`);
  for (const f of fs2) console.log(`    :${f.line}  "${f.text}"`);
  console.log('');
}
process.exit(1);
