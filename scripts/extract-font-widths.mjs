#!/usr/bin/env node
/**
 * extract-font-widths.mjs
 * ------------------------
 * Parse `gFont*LatinGlyphWidths[]` from `decomps/pokeemeraude/src/fonts.c`
 * → `public/decomp/em/ui/font-widths.json` = { fontName: number[256], ... }.
 *
 * Pourquoi : `bitmap-font.ts` calculait la largeur de glyphe en scannant les
 * pixels opaques du PNG (max-x du dernier pixel non-transparent). C'est CORRECT
 * pour la largeur visuelle, mais **différent** de l'avancement de cursor du
 * décomp. Pokemon utilise une table FIXE par glyph : ex. `!` (byte 171) =
 * width 4 dans la table mais ne fait que 2 px visuellement → 2 px de "padding
 * intégré" qui crée le gap naturel avant la flèche next-page.
 *
 * Sans cette table, mes textes sont trop "serrés" : flèche collée au dernier
 * char au lieu d'avoir le gap natif GBA.
 *
 * Source décomp : `src/fonts.c` lignes ~148-180 :
 *   ALIGNED(4) const u8 gFontNormalLatinGlyphWidths[] = {
 *       3,  6,  6,  6,  ...
 *   };
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_C = resolve(__dirname, '../../decomps/pokeemeraude/src/fonts.c');
const OUT = resolve(__dirname, '../public/decomp/em/ui/font-widths.json');

if (!existsSync(FONTS_C)) {
  console.error('[extract-font-widths] fonts.c introuvable:', FONTS_C);
  process.exit(1);
}

const src = readFileSync(FONTS_C, 'utf8');

// Cherche tous les `const u8 g<Font>LatinGlyphWidths[] = { ...256 valeurs... };`
const reTable = /const\s+u8\s+(g\w*LatinGlyphWidths)\s*\[\s*\]\s*=\s*\{([^}]+)\}\s*;/g;
const tables = {};
let m;
while ((m = reTable.exec(src))) {
  const fullName = m[1];               // ex. gFontNormalLatinGlyphWidths
  const body = m[2];
  // Strip C comments + commas, parse decimals.
  const nums = body
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(s => parseInt(s, 10))
    .filter(n => Number.isFinite(n));
  if (nums.length !== 256) {
    console.warn(`[extract-font-widths] ${fullName}: attendu 256, eu ${nums.length}`);
  }
  // Nom court : gFontNormalLatinGlyphWidths → normal
  const short = fullName
    .replace(/^gFont/, '')
    .replace(/LatinGlyphWidths$/, '')
    .toLowerCase() || 'normal';
  tables[short] = nums;
  console.log(`[extract-font-widths] ${short}: ${nums.length} widths`);
}

if (Object.keys(tables).length === 0) {
  console.error('[extract-font-widths] aucune table trouvée');
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(tables) + '\n');
console.log(`[extract-font-widths] écrit ${OUT} (${Object.keys(tables).join(', ')})`);
