#!/usr/bin/env node
/**
 * extract-latfont.mjs
 * --------------------
 * Extrait les glyphs des fonts latines en JSON `{ <fontName>: number[N][256] }`
 * où N = nombre de glyphs du PNG (512 pour latin_*.png = 16×32 cells, dont
 * 0x100-0x1FF = EXTRA_SYMBOL `{LV_2}` `{NO}` `{PP}` `{ID}` etc.).
 * Chaque glyph = 16 cols × 16 rows = 256 pixels, value = idx 0-3 du PNG indexed
 * (cell complète 1:1 décomp ; les glyphs ≤8px n'utilisent que les cols gauches).
 *
 * Pourquoi : le décomp consomme `latin_*.png` au format `.latfont` 2bpp, où :
 *   - 0 = BG (transparent au render via TextPrinter)
 *   - 1 = FG (couleur du texte = fgColor)
 *   - 2 = SHADOW (couleur de l'ombre = shadowColor)
 *   - 3 = BOX_FILL (couleur de remplissage = bgColor)
 *
 * Le glyph fait 8 px wide × 16 px tall (cf. tools/gbagfx/font.c). Dans le PNG,
 * chaque cell fait 16×16 mais seules les 8 cols gauches contiennent le glyph,
 * les 8 droites sont du padding inutilisé.
 *
 * Au render, on remappe 0/1/2/3 → palette runtime (gMessageBox_Pal idx
 * bgColor/fgColor/shadowColor) — c'est ce que `GenerateFontHalfRowLookupTable`
 * (text.c:363) fait côté décomp.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, '../../decomps/pokeemeraude/graphics/fonts');
const OUT = resolve(__dirname, '../public/decomp/em/ui/fonts/latin.latfont.json');

const FONTS = {
  normal: 'latin_normal.png',
  short: 'latin_short.png',
  narrow: 'latin_narrow.png',
  small: 'latin_small.png',
  smallnarrow: 'latin_small_narrow.png',
};

const CELL_W = 16;
const CELL_H = 16;
const COLS = 16;
// 1:1 décomp `DecompressGlyph_Normal` (text.c:1867-1881) : pour width > 8 le
// glyph occupe les 16 cols du cell (4 tiles 8×8 : topL/topR/botL/botR), pas
// seulement 8 (cas ≤8). Les EXTRA_SYMBOL `{LV_2}`(w10) `{NO}`(w10) `{PP}` …
// sont > 8 px → extraire 8 cols les coupait ("N°ID serré", "N.5 cassé").
// On extrait les 16 cols : les chars étroits (≤8) ont les cols 8-15 vides et
// le blit ne lit que `px < glyphW` → rendu identique pour eux (zéro régression).
const GLYPH_W = 16;  // largeur cell complète (1:1 font 16×16)
const GLYPH_H = 16;

function extractFont(pngPath) {
  const buf = readFileSync(pngPath);
  const png = PNG.sync.read(buf);
  // `png.data` est RGBA même si source PNG est indexed. PNGjs décode automatiquement.
  // On reconstruit l'idx en samplant la couleur et en mapping vers 0-3.
  // Pour ça on prend la palette du PNG (chunks PLTE+TRNS) si dispo.
  const palette = png.palette || []; // [[r,g,b], ...] si indexed
  const isIndexed = palette.length > 0 && png.colorType === 3;

  // Si indexed (cas attendu pour latin_*.png), `png.data` contient les idx
  // EN BYTES (pngjs décode). Mais pngjs en mode RGBA expand toujours en RGBA.
  // On doit re-parser le PNG en mode raw indexed.
  const pngRaw = PNG.sync.read(buf, { skipRescale: true });

  // Approche alternative : utiliser la palette pour mapper RGB → idx.
  // C'est ce qui marche universellement.
  const colorToIdx = new Map();
  if (isIndexed) {
    for (let i = 0; i < palette.length; i++) {
      const [r, g, b] = palette[i];
      colorToIdx.set((r << 16) | (g << 8) | b, i);
    }
  }

  const W = png.width;
  const H = png.height;
  const data = png.data;

  // 1:1 décomp text.c:1853-1881 `DecompressGlyph_Normal` : l'accès glyph est
  // LINÉAIRE (`gFontNormalLatinGlyphs + 0x20 * glyphId`), et le render des
  // EXTRA_SYMBOL (charmap.txt:1015-1086, `{LV_2}` `{NO}` `{PP}` `{ID}` etc.)
  // se fait via `currChar = *str | 0x100` (text.c:1110) → glyphId 0x100..0x1FF.
  // Les latin_*.png font 256×512 = 16 cols × 32 rows = 512 glyphs : les 256
  // premiers = ASCII/accents, 256-511 = extra-symbols. On extrait TOUTE la
  // hauteur du png (pas un cap à 256) sinon `{LV_2}`/`{NO}` sont absents.
  const GLYPH_COUNT = Math.floor(W / CELL_W) * Math.floor(H / CELL_H);

  const glyphs = [];
  for (let byte = 0; byte < GLYPH_COUNT; byte++) {
    const col = byte % COLS;
    const row = Math.floor(byte / COLS);
    const x0 = col * CELL_W;
    const y0 = row * CELL_H;
    const pixels = [];

    for (let py = 0; py < GLYPH_H; py++) {
      for (let px = 0; px < GLYPH_W; px++) {
        const x = x0 + px;
        const y = y0 + py;
        if (x >= W || y >= H) {
          pixels.push(0);
          continue;
        }
        const offset = (y * W + x) * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];
        let idx;
        if (a === 0) {
          idx = 0;
        } else if (isIndexed) {
          idx = colorToIdx.get((r << 16) | (g << 8) | b) ?? 0;
        } else {
          // Fallback : threshold sur luminance pour estimer idx
          // (pas attendu pour latin_*.png qui sont indexed)
          const lum = (r + g + b) / 3;
          if (lum > 200) idx = 0;
          else if (lum > 120) idx = 3;
          else if (lum > 60) idx = 2;
          else idx = 1;
        }
        pixels.push(idx);
      }
    }
    glyphs.push(pixels);
  }
  return glyphs;
}

const out = {};
for (const [name, file] of Object.entries(FONTS)) {
  const fp = resolve(SRC_DIR, file);
  if (!existsSync(fp)) {
    console.warn(`[extract-latfont] skip ${name}: ${fp} introuvable`);
    continue;
  }
  out[name] = extractFont(fp);
  console.log(`[extract-latfont] ${name}: ${out[name].length} glyphs × ${out[name][0]?.length ?? 0} pixels`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`[extract-latfont] écrit ${OUT}`);

// Sanity check : sample byte 171 ("!") doit avoir cols 0-3 non-zero rows y=2-9
const sample = out.normal?.[171] || [];
const row2 = sample.slice(2 * GLYPH_W, 3 * GLYPH_W);
console.log(`[extract-latfont] check normal[171=!] row y=2 : ${JSON.stringify(row2)}`);
// Sanity check extra-symbols : glyph 0x105 (LV_2) + 0x108 (NO) doivent être
// non-vides (= au moins 1 pixel idx>0) sinon le png n'a pas la 2e moitié.
for (const [gid, lbl] of [[0x105, 'LV_2'], [0x108, 'NO'], [0x106, 'PP']]) {
  const g = out.normal?.[gid] || [];
  const nz = g.filter((p) => p > 0).length;
  console.log(`[extract-latfont] check normal[0x${gid.toString(16)}=${lbl}] : ${nz} px non-vides / ${g.length}`);
}
