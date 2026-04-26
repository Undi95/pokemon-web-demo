#!/usr/bin/env node
/**
 * extract-down-arrow.mjs
 * -----------------------
 * Extrait `graphics/fonts/down_arrow.png` en JSON `{ pixels: number[][] }`
 * (rows of cols, idx 0-3) pour consommation par `gba-text-printer.textPrinterDrawDownArrow`.
 *
 * Le PNG fait 8×48 (3 frames 8×16 stackées). Le décomp utilise SOURCE rect
 * (0, sDownArrowYCoords[idx], 8, 16) pour le bobbing — donc on garde la PNG
 * complète (48 rows) et l'engine sample selon idx au render.
 *
 * Cf. `text.c:75 sDownArrowYCoords = {0, 1, 2, 1}` et `text.c:822-829`
 * `BlitBitmapRectToWindow(arrowTiles, 0, sDownArrowYCoords[idx], 8, 16, ...)`.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../decomps/pokeemeraude/graphics/fonts/down_arrow.png');
const OUT = resolve(__dirname, '../public/decomp/em/ui/fonts/down_arrow.json');

if (!existsSync(SRC)) {
  console.error('[extract-down-arrow] PNG introuvable:', SRC);
  process.exit(1);
}

const png = PNG.sync.read(readFileSync(SRC));
const W = png.width;
const H = png.height;
const isIndexed = png.palette && png.colorType === 3;
const colorToIdx = new Map();
if (isIndexed) {
  for (let i = 0; i < png.palette.length; i++) {
    const [r, g, b] = png.palette[i];
    colorToIdx.set((r << 16) | (g << 8) | b, i);
  }
}

const pixels = [];
for (let y = 0; y < H; y++) {
  const row = [];
  for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4;
    const r = png.data[o], g = png.data[o + 1], b = png.data[o + 2], a = png.data[o + 3];
    let idx;
    if (a === 0) idx = 0;
    else if (isIndexed) idx = colorToIdx.get((r << 16) | (g << 8) | b) ?? 0;
    else idx = (r + g + b) > 600 ? 0 : 1;
    row.push(idx);
  }
  pixels.push(row);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ width: W, height: H, pixels }));
console.log(`[extract-down-arrow] écrit ${OUT} (${W}×${H})`);
