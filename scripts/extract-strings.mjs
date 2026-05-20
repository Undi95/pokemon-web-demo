#!/usr/bin/env node
/**
 * Parse src/strings.c (et autres fichiers avec des `const u8 gText_X[] = _(...)`)
 * → public/decomp/em/strings.json
 *
 * Format : { "gText_XXX": "TEXTE FR" }
 *
 * Usage runtime :
 *   const s = await (await fetch('/decomp/em/strings.json')).json();
 *   s.gText_MainMenuNewGame // → "NOUVELLE PARTIE"
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'strings.json');
mkdirSync(dirname(outPath), { recursive: true });

const strings = {};

// Regex principale : `const u8 NAME[] = _("TEXTE");` ou sur plusieurs lignes
// avec concaténation `_("a\n" "b")` etc.
function parseFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  // Match complet : const u8|u16 gText_X[] = _("...") possiblement sur plusieurs lignes
  const re = /const\s+u8\s+(\w+)\s*\[\]\s*=\s*_\(\s*((?:"(?:\\.|[^"\\])*"\s*)+)\s*\)\s*;/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    // Concat les strings multi-part : "a" "b" → "ab"
    const parts = [...m[2].matchAll(/"((?:\\.|[^"\\])*)"/g)].map(p => p[1]);
    strings[name] = parts.join('');
  }
}

function walk(dir, handler) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, handler);
    else handler(p, entry);
  }
}

// Principal : src/strings.c et tous les .c/.h de src/
walk(join(decompPath, 'src'), (p, name) => {
  if (name.endsWith('.c') || name.endsWith('.h')) parseFile(p);
});

// data/text/*.inc : format asm
//   gText_XXX::
//       .string "ligne 1\n"
//       .string "ligne 2\p"
//       .string "$"
function parseIncFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  let currentLabel = null;
  let buf = [];
  const flush = () => {
    if (currentLabel && buf.length) {
      // Concat les .string successifs, retirer le $ terminal
      strings[currentLabel] = buf.join('').replace(/\$$/, '');
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('@') || line.startsWith(';')) continue;
    // Labels : `gText_X::` (global) ou `LocalText_X:` (single colon, local).
    // Both contain valid .string définitions, donc on les capture tous.
    const label = line.match(/^(\w+):{1,2}\s*$/);
    if (label) { flush(); currentLabel = label[1]; buf = []; continue; }
    const sm = line.match(/^\.string\s+"(.*)"\s*$/);
    if (sm && currentLabel) { buf.push(sm[1]); }
  }
  flush();
}

const dataTextDir = join(decompPath, 'data', 'text');
if (existsSync(dataTextDir)) {
  walk(dataTextDir, (p, name) => { if (name.endsWith('.inc')) parseIncFile(p); });
}

// data/event_scripts.s et autres .s à la racine de data/ — contiennent
// gText_PlayerHouseBootPC, gText_PokemonTrainerSchoolEmail,
// gText_MomOrDadMightLikeThisProgram, etc.
const dataDir = join(decompPath, 'data');
for (const entry of readdirSync(dataDir)) {
  const p = join(dataDir, entry);
  if (statSync(p).isFile() && entry.endsWith('.s')) parseIncFile(p);
}

// data/scripts/*.inc — contient tv.inc, pc.inc, mauville_old_man.inc etc.
const dataScriptsDir = join(dataDir, 'scripts');
if (existsSync(dataScriptsDir)) {
  walk(dataScriptsDir, (p, name) => { if (name.endsWith('.inc') || name.endsWith('.s')) parseIncFile(p); });
}

// data/maps/*/scripts.inc — texts définis localement par map (Notebook,
// GameCube, MomBlabla, etc.). Permet de récupérer TOUS les textes officiels FR.
const dataMapsDir = join(dataDir, 'maps');
if (existsSync(dataMapsDir)) {
  walk(dataMapsDir, (p, name) => { if (name.endsWith('.inc')) parseIncFile(p); });
}

writeFileSync(outPath, JSON.stringify(strings));
console.log('[strings]', Object.keys(strings).length, 'entries →', outPath);
