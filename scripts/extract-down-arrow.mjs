#!/usr/bin/env node
/**
 * extract-down-arrow.mjs
 * -----------------------
 * Extrait les flèches de fin de texte du décomp en JSON `{ pixels: number[][] }`
 * (rows of cols, valeurs = INDICES 4bpp BRUTS 0-15) pour consommation par
 * `gba-text-printer.textPrinterDrawDownArrow` / `blitArrowAt`.
 *
 * 1:1 décomp text.c:71-72 — DEUX graphismes :
 *   sDownArrowTiles     = down_arrow.png      (useAlternateDownArrow == FALSE → terrain/menus)
 *   sDarkDownArrowTiles = down_arrow_alt.png  (useAlternateDownArrow == TRUE  → COMBAT, evolution, Pokenav)
 * Les deux sont blittés RAW (BlitBitmapRectToWindow, colorKey=0 → idx 0 transparent)
 * et colorés par la palette de la fenêtre. Indices authored par graphisme :
 *   - down_arrow.png     : 0=transparent, 2=contour, 4=rouge   → gMessageBox_Pal
 *   - down_arrow_alt.png : 0=transparent, 1=contour, 2=rouge   → textbox_0.pal combat
 *
 * ⚠️ IMPORTANT : on lit les INDICES 4bpp BRUTS du PNG indexé (pas un reverse-map
 * couleur→index). La palette de down_arrow_alt.png a idx 0 ET idx 10 = (0,0,0)
 * noir (slots GBA dupliqués) ; un reverse-map couleur→index attribue le noir au
 * MAUVAIS index (idx 10 au lieu de 0), cassant la transparence du fond de la
 * flèche en combat. Le vrai fond est idx 0 (transparent).
 *
 * Le PNG fait 8×48 (3 frames 8×16 stackées). Le décomp utilise SOURCE rect
 * (0, sDownArrowYCoords[idx], 8, 16) pour le bobbing — on garde la PNG complète
 * (48 rows) et l'engine sample selon idx au render.
 * Cf. `text.c:75 sDownArrowYCoords = {0, 1, 2, 1}` et `text.c:819-829`.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FILES = [
  { src: '../../decomps/pokeemeraude/graphics/fonts/down_arrow.png',     out: '../public/decomp/em/ui/fonts/down_arrow.json' },
  { src: '../../decomps/pokeemeraude/graphics/fonts/down_arrow_alt.png', out: '../public/decomp/em/ui/fonts/down_arrow_alt.json' },
];

/** Parse un PNG indexé (colorType 3, bitDepth 1/2/4/8) et retourne les INDICES
 *  4bpp BRUTS par pixel (number[][]). Implémentation autonome (zlib built-in),
 *  pas de dépendance pngjs (qui expand en RGBA et perd les indices dupliqués). */
function parsePngRawIndices(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`pas un PNG: ${path}`);
  let off = 8, W = 0, H = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { W = data.readUInt32BE(0); H = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === 'IDAT') { idat.push(data); }
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (colorType !== 3) throw new Error(`PNG non-indexé (colorType ${colorType}): ${path}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = Math.ceil((W * bitDepth) / 8);
  const bpp = 1; // filtering bpp pour indexé ≤8bit
  const out = Buffer.alloc(stride * H);
  for (let y = 0; y < H; y++) {
    const ft = raw[y * (stride + 1)];
    const srcRow = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = (x >= bpp && y > 0) ? out[(y - 1) * stride + x - bpp] : 0;
      let v = srcRow[x];
      if (ft === 1) v = (v + a) & 0xff;
      else if (ft === 2) v = (v + b) & 0xff;
      else if (ft === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (ft === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        v = (v + pr) & 0xff;
      }
      out[y * stride + x] = v;
    }
  }
  const pixels = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      let idx;
      if (bitDepth === 8) idx = out[y * stride + x];
      else if (bitDepth === 4) { const byte = out[y * stride + (x >> 1)]; idx = (x & 1) ? (byte & 0x0f) : (byte >> 4); }
      else if (bitDepth === 2) { const byte = out[y * stride + (x >> 2)]; const sh = (3 - (x & 3)) * 2; idx = (byte >> sh) & 3; }
      else { const byte = out[y * stride + (x >> 3)]; const sh = 7 - (x & 7); idx = (byte >> sh) & 1; }
      row.push(idx);
    }
    pixels.push(row);
  }
  return { W, H, pixels };
}

for (const { src, out } of FILES) {
  const SRC = resolve(__dirname, src);
  const OUT = resolve(__dirname, out);
  if (!existsSync(SRC)) {
    console.error('[extract-down-arrow] PNG introuvable:', SRC);
    process.exit(1);
  }
  const { W, H, pixels } = parsePngRawIndices(SRC);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ width: W, height: H, pixels }));
  const uniq = [...new Set(pixels.flat())].sort((a, b) => a - b);
  console.log(`[extract-down-arrow] écrit ${OUT} (${W}×${H}) RAW idx uniques=${JSON.stringify(uniq)}`);
}
