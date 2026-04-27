#!/usr/bin/env node
/**
 * Extract le chunk PLTE d'un PNG indexed et compare avec une .pal JASC.
 * Si les colors PNG != colors .pal[0..15], notre loadIndexedPngWithPal foire.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function extractPlte(pngBuf) {
  // PNG header 8 bytes, puis chunks (length 4 + type 4 + data N + CRC 4)
  let offset = 8;
  while (offset < pngBuf.length) {
    const length = pngBuf.readUInt32BE(offset);
    const type = pngBuf.toString('ascii', offset + 4, offset + 8);
    if (type === 'PLTE') {
      const data = pngBuf.subarray(offset + 8, offset + 8 + length);
      const colors = [];
      for (let i = 0; i < data.length; i += 3) {
        colors.push([data[i], data[i+1], data[i+2]]);
      }
      return colors;
    }
    offset += 12 + length;
  }
  return null;
}

function loadJascPal(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split(/\r?\n/);
  const count = parseInt(lines[2], 10);
  const colors = [];
  for (let i = 0; i < count; i++) {
    const parts = lines[3 + i].trim().split(/\s+/).map(Number);
    colors.push(parts);
  }
  return colors;
}

const png = readFileSync(resolve(root, 'public/decomp/em/intro/scene_1/bg.png'));
const pngColors = extractPlte(png);
const palColors = loadJascPal(resolve(root, 'public/decomp/em/intro/scene_1/bg.pal'));

console.log(`bg.png embedded PLTE colors (${pngColors?.length ?? 0}) :`);
if (pngColors) {
  for (let i = 0; i < pngColors.length; i++) {
    console.log(`  [${i.toString().padStart(2)}] = (${pngColors[i].join(', ')})`);
  }
} else {
  console.log('  NO PLTE chunk found');
}

console.log(`\nbg.pal first 16 colors :`);
for (let i = 0; i < 16; i++) {
  console.log(`  [${i.toString().padStart(2)}] = (${palColors[i].join(', ')})`);
}

console.log('\nMatch comparison :');
let allMatch = true;
const minLen = Math.min(pngColors?.length ?? 0, 16);
for (let i = 0; i < minLen; i++) {
  const png = pngColors[i];
  const pal = palColors[i];
  const match = png[0] === pal[0] && png[1] === pal[1] && png[2] === pal[2];
  if (!match) allMatch = false;
  console.log(`  idx ${i.toString().padStart(2)}: PNG (${png.join(',')}) vs PAL (${pal.join(',')}) → ${match ? 'OK' : 'MISMATCH'}`);
}
console.log(`\n→ ${allMatch ? '✅ All 16 PNG colors MATCH bg.pal[0..15]' : '❌ MISMATCH detected — loadIndexedPngWithPal va fallback transparent'}`);
