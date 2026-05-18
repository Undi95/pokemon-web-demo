#!/usr/bin/env node
/**
 * extract-png-indexed-tiles.mjs
 *
 * Convert PNG indexed (PLTE-based) → raw tile data (.4bpp.bin or .8bpp.bin)
 * en PRÉSERVANT l'ordre original des palette indices.
 *
 * Pourquoi : nos extractions runtime via canvas.drawImage convertissent en
 * RGBA → on perd l'info d'index quand 2 entries PLTE ont la même couleur
 * (= duplicate fold). C'est le cas pour rayquaza.png où entry 11 et 15
 * ont la même RGB(0,74,98) ; le décomp distingue les pixels marking (idx 15)
 * du body (idx 11) pour faire le palette cycling sur 15 seul.
 *
 * Cette extraction parse l'IDAT PNG directement (= raw index bytes) et
 * préserve l'ordre.
 *
 * Usage:
 *   node scripts/extract-png-indexed-tiles.mjs <png_path> <out_bin_path> <bpp> [tileLayout=row]
 *
 *   bpp = 4 ou 8
 *   tileLayout : 'row' = standard tile row-major (default)
 *
 * Output:
 *   .4bpp.bin : 32 bytes per tile (4bpp packed: 2 px per byte, low=left high=right)
 *   .8bpp.bin : 64 bytes per tile (8bpp: 1 px per byte)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node extract-png-indexed-tiles.mjs <png> <out.bin> <bpp>');
  process.exit(1);
}
const [pngPath, outPath, bppStr] = args;
const bpp = Number(bppStr);
if (bpp !== 4 && bpp !== 8) {
  console.error('bpp must be 4 or 8');
  process.exit(1);
}

const pngBuf = fs.readFileSync(pngPath);

// pngjs ne donne pas directement les indices indexed. On parse l'IDAT directement.
// Heureusement le module a un mode `indexed` mais c'est pas exposé clean.
// On va parser l'IDAT manuellement.

function parseIndexedPng(buf) {
  // PNG signature
  if (buf[0] !== 0x89 || buf[1] !== 0x50) throw new Error('not a PNG');
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  let plte = null;
  const idatChunks = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.subarray(pos + 4, pos + 8).toString('ascii');
    const data = buf.subarray(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'PLTE') {
      plte = Buffer.from(data);
    } else if (type === 'IDAT') {
      idatChunks.push(Buffer.from(data));
    } else if (type === 'IEND') {
      break;
    }
    pos += 8 + length + 4;
  }

  // colorType : 3 = indexed (PLTE), 0 = grayscale (no palette).
  // 1:1 décomp gbagfx : pour grayscale (pas de PLTE), gbagfx INVERTIT les valeurs
  // pixel via `15 - pixelValue` (cf. tools/gbagfx/gfx.c ConvertToTiles4Bpp avec
  // invertColors=!hasPalette). Sans cette inversion, les BGs grayscale comme
  // legend_bg.png mappent à des palette indices low (= white) au lieu de high
  // (= dirt red colors). On applique la même inversion ici pour correspondre
  // au résultat de gbagfx.
  if (colorType !== 3 && colorType !== 0) throw new Error(`PNG colorType=${colorType}, expected 3 (indexed) or 0 (grayscale)`);
  const invertColors = colorType === 0;
  const idat = Buffer.concat(idatChunks);
  // IDAT is zlib-compressed. Use Node zlib.
  const raw = zlib.inflateSync(idat);

  // PNG scanlines : each row prefixed with filter byte. After filter unfiltered,
  // row contains packed pixels (bitDepth bits per pixel).
  const bytesPerScanline = Math.ceil((width * bitDepth) / 8);
  const totalRows = height;
  const expectedSize = (bytesPerScanline + 1) * totalRows;
  if (raw.length !== expectedSize) {
    throw new Error(`raw inflated size ${raw.length} != expected ${expectedSize}`);
  }

  // Apply PNG filters per scanline. For most decomp PNGs filter is None (0)
  // but we should handle Sub/Up/Average/Paeth for safety.
  const indices = new Uint8Array(width * height);
  let prevRow = new Uint8Array(bytesPerScanline);
  for (let y = 0; y < totalRows; y++) {
    const filterType = raw[y * (bytesPerScanline + 1)];
    const rowStart = y * (bytesPerScanline + 1) + 1;
    const row = Buffer.from(raw.subarray(rowStart, rowStart + bytesPerScanline));
    const unfiltered = applyFilter(filterType, row, prevRow, bitDepth);

    // Unpack pixels from packed row
    for (let x = 0; x < width; x++) {
      let idx;
      if (bitDepth === 4) {
        const byte = unfiltered[Math.floor(x / 2)];
        idx = (x % 2 === 0) ? (byte >> 4) & 0x0F : byte & 0x0F;
        if (invertColors) idx = 15 - idx;
      } else if (bitDepth === 8) {
        idx = unfiltered[x];
        if (invertColors) idx = 255 - idx;
      } else {
        throw new Error(`bitDepth ${bitDepth} unsupported`);
      }
      indices[y * width + x] = idx;
    }
    prevRow = unfiltered;
  }

  return { width, height, indices, plte };
}

function applyFilter(filterType, row, prevRow, bitDepth) {
  // Bytes per pixel for filter (PNG spec: ceil(bpp/8), min 1)
  const bpp = Math.max(1, Math.floor(bitDepth / 8));
  const out = Buffer.alloc(row.length);
  for (let i = 0; i < row.length; i++) {
    const left = i >= bpp ? out[i - bpp] : 0;
    const above = prevRow[i] ?? 0;
    const upleft = i >= bpp ? (prevRow[i - bpp] ?? 0) : 0;
    let val;
    switch (filterType) {
      case 0: val = row[i]; break;  // None
      case 1: val = (row[i] + left) & 0xFF; break;  // Sub
      case 2: val = (row[i] + above) & 0xFF; break;  // Up
      case 3: val = (row[i] + ((left + above) >> 1)) & 0xFF; break;  // Average
      case 4: {  // Paeth
        const p = left + above - upleft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - above);
        const pc = Math.abs(p - upleft);
        const pred = (pa <= pb && pa <= pc) ? left : (pb <= pc) ? above : upleft;
        val = (row[i] + pred) & 0xFF;
        break;
      }
      default: throw new Error(`unknown PNG filter ${filterType}`);
    }
    out[i] = val;
  }
  return out;
}

const { width, height, indices, plte } = parseIndexedPng(pngBuf);
console.log(`[extract-png-indexed-tiles] ${pngPath}: ${width}x${height} indexed, PLTE=${plte ? plte.length / 3 : 0} colors`);

// Convert pixel index map → tile data (8x8 row-major tiles)
if (width % 8 !== 0 || height % 8 !== 0) {
  console.error(`PNG dims must be multiple of 8 (got ${width}x${height})`);
  process.exit(1);
}
const widthTiles = width / 8;
const heightTiles = height / 8;
const numTiles = widthTiles * heightTiles;
const bytesPerTile = bpp === 4 ? 32 : 64;
const tileData = new Uint8Array(numTiles * bytesPerTile);

for (let ty = 0; ty < heightTiles; ty++) {
  for (let tx = 0; tx < widthTiles; tx++) {
    const tileIdx = ty * widthTiles + tx;
    const tileBase = tileIdx * bytesPerTile;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const px = indices[(ty * 8 + row) * width + (tx * 8 + col)];
        if (bpp === 4) {
          // Pack 2 pixels per byte (low nibble = left, high nibble = right)
          const byteOff = tileBase + row * 4 + Math.floor(col / 2);
          if (col % 2 === 0) tileData[byteOff] = (tileData[byteOff] & 0xF0) | (px & 0x0F);
          else tileData[byteOff] = (tileData[byteOff] & 0x0F) | ((px & 0x0F) << 4);
        } else {
          tileData[tileBase + row * 8 + col] = px;
        }
      }
    }
  }
}

// Stats : count unique indices used
const usage = new Array(bpp === 4 ? 16 : 256).fill(0);
for (let i = 0; i < indices.length; i++) usage[indices[i]]++;
const usedIndices = usage.map((cnt, idx) => ({ idx, cnt })).filter(e => e.cnt > 0);
console.log(`[extract-png-indexed-tiles] indices used: ${usedIndices.map(e => `${e.idx}=${e.cnt}`).join(', ')}`);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, tileData);
console.log(`[extract-png-indexed-tiles] wrote ${outPath} (${tileData.length} bytes, ${numTiles} tiles)`);

// 1:1 décomp : émet AUSSI le .gbapal (PLTE → RGB15 LE, dans l'ORDRE
// d'index PLTE original). = équivalent INCGFX(png, ".gbapal") du décomp
// (ex. gBallPal_Poke = poke.png .gbapal). Sans ça, le loader navigateur
// reconstruit la palette par ordre d'apparition (PLTE perdu via décodage
// RGBA) → couleurs mélangées (bug ball : blanc rendu gris). Modder-proof :
// éditer le PNG → re-extract régénère .4bpp.bin ET .gbapal cohérents.
if (plte && plte.length >= 3) {
  const nCol = Math.min(plte.length / 3, bpp === 4 ? 16 : 256);
  const pal = Buffer.alloc(nCol * 2);
  for (let i = 0; i < nCol; i++) {
    const r = plte[i * 3] >> 3, g = plte[i * 3 + 1] >> 3, b = plte[i * 3 + 2] >> 3;
    pal.writeUInt16LE((r | (g << 5) | (b << 10)) & 0x7FFF, i * 2);
  }
  const palPath = outPath.replace(/\.(4|8)bpp\.bin$/, '.gbapal');
  fs.writeFileSync(palPath, pal);
  console.log(`[extract-png-indexed-tiles] wrote ${palPath} (${nCol} colors RGB15, PLTE order)`);
}
