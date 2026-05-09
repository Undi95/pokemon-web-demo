#!/usr/bin/env node
/**
 * extract-png-palette.mjs
 *
 * Extract PLTE chunk d'un PNG indexed → .gbapal binaire (= u16 BGR555 LE).
 *
 * Format .gbapal :
 *   raw u16 little-endian, 1 entry par color.
 *   color = (R >> 3) | ((G >> 3) << 5) | ((B >> 3) << 10)
 *
 * C'est ce que produit `gbagfx` (= tool canonical du décomp pokeemerald) avec
 * `gbagfx tiles.png tiles.gbapal`. On reproduit le même output ici pour pas
 * dépendre de l'install gbagfx.
 *
 * Pour les BG scenes avec sub-palettes (= PLTE > 16 colors), on output toutes
 * les entries en une seule .gbapal (e.g. 32 entries pour 2 sub-palettes). Le
 * caller LoadPalette() à BG_PLTT_ID(0) et le hardware split en sub-palettes
 * via les bits 12-15 du tilemap entry.
 *
 * Usage :
 *   node scripts/extract-png-palette.mjs <png_path> <out_gbapal_path>
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node extract-png-palette.mjs <png> <out.gbapal>');
  process.exit(1);
}
const [pngPath, outPath] = args;

const buf = fs.readFileSync(pngPath);
if (buf[0] !== 0x89 || buf[1] !== 0x50) {
  console.error(`not a PNG: ${pngPath}`);
  process.exit(1);
}

let pos = 8;
let plte = null;
let colorType = -1;
while (pos < buf.length) {
  const length = buf.readUInt32BE(pos);
  const type = buf.subarray(pos + 4, pos + 8).toString('ascii');
  const data = buf.subarray(pos + 8, pos + 8 + length);
  if (type === 'IHDR') {
    colorType = data[9];
  } else if (type === 'PLTE') {
    plte = Buffer.from(data);
  } else if (type === 'IEND') {
    break;
  }
  pos += 8 + length + 4;
}

if (!plte) {
  console.error(`PNG ${pngPath} has no PLTE chunk (colorType=${colorType}, expected 3=indexed)`);
  process.exit(1);
}

const numColors = plte.length / 3;
if (numColors * 3 !== plte.length) {
  console.error(`PLTE size ${plte.length} not multiple of 3`);
  process.exit(1);
}

const out = Buffer.alloc(numColors * 2);
for (let i = 0; i < numColors; i++) {
  const r = plte[i * 3];
  const g = plte[i * 3 + 1];
  const b = plte[i * 3 + 2];
  // 1:1 gbagfx : RGB8 → BGR555 (R5 in low bits, B5 in high bits, G5 middle).
  const bgr15 = (r >> 3) | ((g >> 3) << 5) | ((b >> 3) << 10);
  out.writeUInt16LE(bgr15, i * 2);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
console.log(`[extract-png-palette] ${pngPath}: ${numColors} colors → ${outPath} (${out.length} bytes)`);
