#!/usr/bin/env node
/**
 * Diagnostic Scene 1 tilemaps + bg.png + bg.pal pour comprendre ce qui s'affiche.
 *
 * Pour chaque tilemap (bg0/1/2/3_map.bin) :
 *   - taille en bytes
 *   - nombre d'entries u16
 *   - unique tileIds (low 10 bits)
 *   - unique paletteBanks (high 4 bits)
 *   - flip H/V flags
 *   - first 32 entries decoded
 *
 * Pour bg.pal :
 *   - first 16 colors (= bank 0 du PNG 4bpp)
 *   - signaler si banks 1+ sont identiques à bank 0 (= duplicate variants)
 *
 * Pour bg.png :
 *   - dimensions, total tiles
 *   - palette PNG embedded (compare avec bg.pal[0..15])
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const SCENE1 = resolve(root, 'public/decomp/em/intro/scene_1');

console.log('=== Scene 1 tilemaps diagnostic ===\n');

for (let i = 0; i < 4; i++) {
  const path = `${SCENE1}/bg${i}_map.bin`;
  const buf = readFileSync(path);
  const u16 = new Uint16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
  const tileIds = new Set();
  const paletteBanks = new Set();
  let flippedCount = 0;
  for (const entry of u16) {
    tileIds.add(entry & 0x3FF);
    paletteBanks.add((entry >> 12) & 0xF);
    if (entry & 0xC00) flippedCount++;
  }
  console.log(`bg${i}_map.bin (${buf.byteLength} bytes, ${u16.length} entries u16):`);
  console.log(`  Unique tileIds : ${tileIds.size} (range ${Math.min(...tileIds)}-${Math.max(...tileIds)})`);
  console.log(`  Unique paletteBanks : ${[...paletteBanks].sort((a,b)=>a-b).join(',')}`);
  console.log(`  Entries with flip : ${flippedCount}`);
  console.log(`  First 16 entries u16: ${[...u16.slice(0, 16)].map(e => '0x'+e.toString(16).padStart(4, '0')).join(' ')}`);
  console.log(`  First 16 decoded (tileId, bank, flipH, flipV): ${[...u16.slice(0, 16)].map(e => `(${e&0x3FF},${(e>>12)&0xF},${!!(e&0x400)?1:0},${!!(e&0x800)?1:0})`).join(' ')}`);
  console.log();
}

console.log('=== bg.pal first 32 colors (banks 0-1) ===');
const palText = readFileSync(`${SCENE1}/bg.pal`, 'utf8');
const palLines = palText.split(/\r?\n/);
const palCount = parseInt(palLines[2], 10);
console.log(`Total colors in bg.pal: ${palCount}`);
const colors = [];
for (let i = 0; i < palCount; i++) {
  const parts = palLines[3 + i].trim().split(/\s+/).map(Number);
  colors.push(parts);
}
console.log('Bank 0 (idx 0-15) :');
for (let i = 0; i < 16 && i < colors.length; i++) {
  console.log(`  [${i.toString().padStart(2)}] = (${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]})`);
}
console.log('\nDuplicate banks (banks 1-15 vs bank 0) :');
for (let bank = 1; bank < 16 && bank * 16 < colors.length; bank++) {
  let identical = true;
  for (let i = 0; i < 16 && bank * 16 + i < colors.length; i++) {
    if (colors[bank * 16 + i][0] !== colors[i][0] ||
        colors[bank * 16 + i][1] !== colors[i][1] ||
        colors[bank * 16 + i][2] !== colors[i][2]) {
      identical = false;
      break;
    }
  }
  console.log(`  Bank ${bank}: ${identical ? 'IDENTICAL to bank 0' : 'DIFFERENT'} — first color (${colors[bank*16]?.[0]}, ${colors[bank*16]?.[1]}, ${colors[bank*16]?.[2]})`);
}
