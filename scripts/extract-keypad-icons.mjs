#!/usr/bin/env node
/**
 * extract-keypad-icons.mjs
 * ------------------------
 * Extrait les icônes de touches (A/B/L/R/START/SELECT/DPAD) du décomp en JSON
 * `{ icons: [{ width, height, pixels }] }` (indices 4bpp BRUTS 0-15), consommé
 * au runtime par `text.ts DrawKeypadIcon` (même voie que `extract-down-arrow.mjs`
 * → `down_arrow.json` → `blitArrowAt`).
 *
 * 1:1 décomp `src/text.c:100-115 sKeypadIcons[]` (tileOffset/width/height) +
 * `src/text.c:1609 DrawKeypadIcon` : blit `sKeypadIconTiles + tileOffset*0x20`
 * (source .4bpp TUILÉE) via `BlitBitmapRectToWindow` → `BlitBitmapRect4Bit(...,
 * colorKey=0)`. srcWidth=0x80 → `multiplierSrcY = 0x80>>3 = 16` tuiles/rangée.
 * On applique OFFLINE l'adressage tuilé du blit pour cropper chaque icône (le PNG
 * est row-major : gbagfx tuile T = bloc PNG à (T%16*8, T/16*8), donc le crop est
 * ici équivalent à une lecture linéaire, mais on garde la formule tuilée 1:1).
 *
 * keypad_icons.png = 128×32, 4bpp, colorType 3 (INDEXÉ) — PAS grayscale colorType
 * 0, donc l'inversion gbagfx (index=15-gray) ne s'applique PAS. On lit les indices
 * de palette BRUTS (cf. note extract-down-arrow.mjs : pngjs expand en RGBA et perd
 * les slots dupliqués). Le rendu applique colorKey 0 = idx 0 transparent.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC = resolve(__dirname, '../../decomps/pokeemeraude/graphics/fonts/keypad_icons.png');
const OUT = resolve(__dirname, '../public/decomp/em/ui/fonts/keypad_icons.json');

// 1:1 décomp src/text.c:100-115 sKeypadIcons[] — indexé par CHAR_* (id = 2ᵉ octet
// après CHAR_KEYPAD_ICON, cf. charmap.txt:1001-1013 : A_BUTTON=F8 00 … DPAD_NONE=F8 0C).
const KEYPAD_ICONS = [
  { tileOffset: 0x00, width: 8,  height: 12 }, // 0  CHAR_A_BUTTON
  { tileOffset: 0x01, width: 8,  height: 12 }, // 1  CHAR_B_BUTTON
  { tileOffset: 0x02, width: 16, height: 12 }, // 2  CHAR_L_BUTTON
  { tileOffset: 0x04, width: 16, height: 12 }, // 3  CHAR_R_BUTTON
  { tileOffset: 0x06, width: 24, height: 12 }, // 4  CHAR_START_BUTTON
  { tileOffset: 0x09, width: 24, height: 12 }, // 5  CHAR_SELECT_BUTTON
  { tileOffset: 0x0C, width: 8,  height: 12 }, // 6  CHAR_DPAD_UP
  { tileOffset: 0x0D, width: 8,  height: 12 }, // 7  CHAR_DPAD_DOWN
  { tileOffset: 0x0E, width: 8,  height: 12 }, // 8  CHAR_DPAD_LEFT
  { tileOffset: 0x0F, width: 8,  height: 12 }, // 9  CHAR_DPAD_RIGHT
  { tileOffset: 0x20, width: 8,  height: 12 }, // 10 CHAR_DPAD_UPDOWN
  { tileOffset: 0x21, width: 8,  height: 12 }, // 11 CHAR_DPAD_LEFTRIGHT
  { tileOffset: 0x22, width: 8,  height: 12 }, // 12 CHAR_DPAD_NONE
];

// srcWidth du blit = 0x80 (text.c:1616) → 16 tuiles / rangée (multiplierSrcY).
const TILES_PER_ROW = 0x80 >> 3;

/** Parse un PNG indexé (colorType 3, bitDepth 1/2/4/8) → indices 4bpp BRUTS
 *  (number[][]). Autonome (zlib built-in). 1:1 copie de extract-down-arrow.mjs. */
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

if (!existsSync(SRC)) {
  console.error('[extract-keypad-icons] PNG introuvable:', SRC);
  process.exit(1);
}

const { W, H, pixels: sheet } = parsePngRawIndices(SRC);
if (W !== TILES_PER_ROW * 8) {
  console.error(`[extract-keypad-icons] largeur PNG ${W} != ${TILES_PER_ROW * 8} (TILES_PER_ROW*8) — layout tuilé inattendu`);
  process.exit(1);
}

// Crop chaque icône via l'adressage tuilé 1:1 de BlitBitmapRect4Bit (blit.c) :
//   gt (tuile globale) = tileOffset + (py>>3)*TILES_PER_ROW + (px>>3)
//   srcX = (gt % TILES_PER_ROW)*8 + (px&7) ; srcY = (gt / TILES_PER_ROW)*8 + (py&7)
const icons = KEYPAD_ICONS.map(({ tileOffset, width, height }) => {
  const pix = [];
  for (let py = 0; py < height; py++) {
    const row = [];
    for (let px = 0; px < width; px++) {
      const gt = tileOffset + (py >> 3) * TILES_PER_ROW + (px >> 3);
      const srcX = (gt % TILES_PER_ROW) * 8 + (px & 7);
      const srcY = ((gt / TILES_PER_ROW) | 0) * 8 + (py & 7);
      row.push(sheet[srcY]?.[srcX] ?? 0);
    }
    pix.push(row);
  }
  return { width, height, pixels: pix };
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ icons }));
const uniq = [...new Set(icons.flatMap((ic) => ic.pixels.flat()))].sort((a, b) => a - b);
console.log(`[extract-keypad-icons] écrit ${OUT} (source ${W}×${H}, ${icons.length} icônes) idx uniques=${JSON.stringify(uniq)}`);
