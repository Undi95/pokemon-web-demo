#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function extractPlte(b) {
  let off = 8;
  while (off < b.length) {
    const len = b.readUInt32BE(off);
    const type = b.toString('ascii', off + 4, off + 8);
    if (type === 'PLTE') {
      const d = b.subarray(off + 8, off + 8 + len);
      const c = [];
      for (let i = 0; i < d.length; i += 3) c.push([d[i], d[i+1], d[i+2]]);
      return c;
    }
    off += 12 + len;
  }
  return null;
}
function loadPal(p) {
  const t = readFileSync(p, 'utf8').split(/\r?\n/);
  const cnt = parseInt(t[2], 10);
  return Array.from({length: cnt}, (_, i) => t[3+i].trim().split(/\s+/).map(Number));
}

const SC1 = resolve(root, 'public/decomp/em/intro/scene_1');
const pngPlte = extractPlte(readFileSync(`${SC1}/drops_logo.png`));
const drops = loadPal(`${SC1}/drops.pal`);
const logo = loadPal(`${SC1}/logo.pal`);

console.log('drops_logo.png PLTE size:', pngPlte.length);
console.log('drops.pal size:', drops.length);
console.log('logo.pal size:', logo.length);
console.log('\nFirst 32 PLTE entries vs drops.pal vs logo.pal :');
for (let i = 0; i < 32; i++) {
  const png = pngPlte[i] || [0, 0, 0];
  const d = drops[i] || [0, 0, 0];
  const l = logo[i] || [0, 0, 0];
  const md = png[0] === d[0] && png[1] === d[1] && png[2] === d[2];
  const ml = png[0] === l[0] && png[1] === l[1] && png[2] === l[2];
  console.log(`  ${String(i).padStart(2)} PNG=(${String(png[0]).padStart(3)},${String(png[1]).padStart(3)},${String(png[2]).padStart(3)})  drops=(${String(d[0]).padStart(3)},${String(d[1]).padStart(3)},${String(d[2]).padStart(3)})${md ? '✓' : ' '}  logo=(${String(l[0]).padStart(3)},${String(l[1]).padStart(3)},${String(l[2]).padStart(3)})${ml ? '✓' : ' '}`);
}
