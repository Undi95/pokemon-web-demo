#!/usr/bin/env node
/**
 * Parse src/naming_screen.c pour extraire le layout authentique du clavier
 * (3 pages × 4 lignes × 9 colonnes) + les positions X par colonne.
 *
 * Sortie : public/decomp/em/keyboard.json
 *   {
 *     pages: { UPPER: string[4], LOWER: string[4], SYMBOLS: string[4] },
 *     colXPos: { UPPER: number[9], LOWER: number[9], SYMBOLS: number[6] },
 *     colCounts: { UPPER: 9, LOWER: 9, SYMBOLS: 6 }
 *   }
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'keyboard.json');
mkdirSync(dirname(outPath), { recursive: true });

const text = readFileSync(join(decompPath, 'src', 'naming_screen.c'), 'utf8');

// Extrait le bloc `sKeyboardChars[...] = { ... };`
const kbMatch = text.match(/sKeyboardChars\[[^\]]+\]\[[^\]]+\]\[[^\]]+\]\s*=\s*\{([\s\S]*?)\n\};/);
if (!kbMatch) { console.error('sKeyboardChars not found'); process.exit(1); }
const kbBody = kbMatch[1];

// Match chaque page : [KEYBOARD_XXX] = { "row1", "row2", "row3", "row4", }
const pageRe = /\[KEYBOARD_(\w+)\]\s*=\s*\{([\s\S]*?)\},?\s*\n/g;
const pages = {};
let m;
while ((m = pageRe.exec(kbBody)) !== null) {
  const name = m[1];
  const rowsBody = m[2];
  // Match __("...") ou _("...") dans chaque ligne
  const rows = [...rowsBody.matchAll(/_{1,2}\("((?:\\.|[^"\\])*)"\)/g)].map(r => r[1]);
  if (rows.length) pages[name] = rows;
}

// Extract sPageColumnCounts
const countsMatch = text.match(/sPageColumnCounts\[[^\]]+\]\s*=\s*\{([\s\S]*?)\};/);
const colCounts = {};
if (countsMatch) {
  const re = /\[KEYBOARD_(\w+)\]\s*=\s*(?:KBCOL_COUNT|(\d+))/g;
  let cm;
  while ((cm = re.exec(countsMatch[1])) !== null) {
    colCounts[cm[1]] = cm[2] ? Number(cm[2]) : 9; // KBCOL_COUNT = 9
  }
}

// Extract sPageColumnXPos
const xposMatch = text.match(/sPageColumnXPos\[[^\]]+\]\[[^\]]+\]\s*=\s*\{([\s\S]*?)\};/);
const colXPos = {};
if (xposMatch) {
  const re = /\[KEYBOARD_(\w+)\]\s*=\s*\{([^}]+)\}/g;
  let xm;
  while ((xm = re.exec(xposMatch[1])) !== null) {
    colXPos[xm[1]] = xm[2].split(',').map(s => s.trim()).filter(Boolean).map(Number);
  }
}

writeFileSync(outPath, JSON.stringify({ pages, colCounts, colXPos }));
console.log('[keyboard]', {
  pages: Object.keys(pages),
  sample_upper: pages.LETTERS_UPPER,
  colCounts
});
