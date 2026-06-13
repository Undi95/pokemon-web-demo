// Lit la PLTE d'un PNG indexé + dump en RGB (0..255) ET RGB15 (0..31).
const fs = require('fs');

function readPngPalette(path) {
  const buf = fs.readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('pas un PNG: ' + path);
  let off = 8;
  const out = { plte: null, trns: null, ihdr: null };
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') out.ihdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), bitDepth: data[8], colorType: data[9] };
    if (type === 'PLTE') out.plte = Buffer.from(data);
    if (type === 'tRNS') out.trns = Buffer.from(data);
    if (type === 'IEND') break;
    off += 12 + len;
  }
  return out;
}

const to15 = (v) => Math.round(v / 255 * 31);

for (const [label, path] of [
  ['DECOMP src', 'D:/Projet 1/decomps/pokeemeraude/graphics/battle_anims/sprites/mist_cloud.png'],
  ['PUBLIC copy', 'D:/Projet 1/pokemon-web-demo/public/decomp/em/battle_anims/sprites-src/mist_cloud.png'],
]) {
  try {
    const p = readPngPalette(path);
    console.log(`\n### ${label} (${path.split('/').slice(-1)[0]})  ihdr=${JSON.stringify(p.ihdr)}`);
    if (!p.plte) { console.log('  PAS de PLTE (RGBA truecolor ?)'); continue; }
    const n = p.plte.length / 3;
    for (let i = 0; i < n; i++) {
      const r = p.plte[i*3], g = p.plte[i*3+1], b = p.plte[i*3+2];
      console.log(`  [${i}] rgb8=${r},${g},${b}  rgb15=${to15(r)},${to15(g)},${to15(b)}`);
    }
  } catch (e) { console.log(`\n### ${label}: ERREUR ${e.message}`); }
}
