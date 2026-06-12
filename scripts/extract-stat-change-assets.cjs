// Extraction des assets STAT CHANGE (graphics/battle_anims/stat_change/) vers
// public/decomp/em/battle_anims/backgrounds/ + entrées anim-bg-symbols.json.
// Conversion 1:1 du pipeline extract-battle-anim-bgs.py (png 4bpp -> tiles
// planaires GBA ; tilemap .bin copié brut ; .pal JASC -> .gbapal u16).
// Consommé par AnimLoadCompressedBgGfx/Tilemap + LoadAnimBgPalette (chaîne
// StatsChangeAnimation, battle_anim_utility_funcs.c:415-648).
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const SRC = path.join(DECOMP, 'graphics/battle_anims/stat_change');
const OUT = 'public/decomp/em/battle_anims/backgrounds';
const SYMBOLS_JSON = 'public/decomp/em/battle_anims/anim-bg-symbols.json';

function pngTo4bpp(srcPath) {
  const d = fs.readFileSync(srcPath);
  let pos = 8, idat = Buffer.alloc(0), w = 0, h = 0;
  while (pos < d.length) {
    const ln = d.readUInt32BE(pos);
    const typ = d.toString('ascii', pos + 4, pos + 8);
    const chunk = d.subarray(pos + 8, pos + 8 + ln);
    if (typ === 'IHDR') {
      w = chunk.readUInt32BE(0); h = chunk.readUInt32BE(4);
      if (chunk[8] !== 4) throw new Error('bitDepth ' + chunk[8] + ' != 4');
    } else if (typ === 'IDAT') {
      idat = Buffer.concat([idat, chunk]);
    }
    pos += 12 + ln;
  }
  const raw = zlib.inflateSync(idat);
  const stride = Math.floor((w * 4 + 7) / 8);
  const rows = [];
  let prev = Buffer.alloc(stride), p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p]; p += 1;
    const line = Buffer.from(raw.subarray(p, p + stride)); p += stride;
    if (f === 1) {
      for (let i = 1; i < stride; i++) line[i] = (line[i] + line[i - 1]) & 0xFF;
    } else if (f === 2) {
      for (let i = 0; i < stride; i++) line[i] = (line[i] + prev[i]) & 0xFF;
    } else if (f === 3) {
      for (let i = 0; i < stride; i++) {
        const a = i > 0 ? line[i - 1] : 0;
        line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF;
      }
    } else if (f === 4) {
      for (let i = 0; i < stride; i++) {
        const a = i > 0 ? line[i - 1] : 0;
        const b = prev[i];
        const c = i > 0 ? prev[i - 1] : 0;
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        const pred = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        line[i] = (line[i] + pred) & 0xFF;
      }
    }
    rows.push(line); prev = line;
  }
  // pixels index 4bpp (hi nibble = pixel pair gauche)
  const px = (x, y) => {
    const b = rows[y][x >> 1];
    return (x & 1) === 0 ? (b >> 4) & 0xF : b & 0xF;
  };
  const out = [];
  for (let ty = 0; ty < h / 8; ty++) {
    for (let tx = 0; tx < w / 8; tx++) {
      for (let yy = 0; yy < 8; yy++) {
        for (let xx = 0; xx < 8; xx += 2) {
          out.push(px(tx * 8 + xx, ty * 8 + yy) | (px(tx * 8 + xx + 1, ty * 8 + yy) << 4));
        }
      }
    }
  }
  return Buffer.from(out);
}

function jascToGbapal(srcPath) {
  const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);
  if (lines[0] !== 'JASC-PAL') throw new Error('pas JASC: ' + srcPath);
  const n = parseInt(lines[2], 10);
  const out = Buffer.alloc(32);
  for (let i = 0; i < Math.min(n, 16); i++) {
    const [r, g, b] = lines[3 + i].trim().split(/\s+/).map(Number);
    out.writeUInt16LE((r >> 3) | ((g >> 3) << 5) | ((b >> 3) << 10), i * 2);
  }
  return out;
}

// 1) tiles
fs.writeFileSync(path.join(OUT, 'stat_change.4bpp.bin'), pngTo4bpp(path.join(SRC, 'tiles.png')));
// 2) tilemaps (copie brute)
fs.copyFileSync(path.join(SRC, 'increase.bin'), path.join(OUT, 'stat_change_increase.map.bin'));
fs.copyFileSync(path.join(SRC, 'decrease.bin'), path.join(OUT, 'stat_change_decrease.map.bin'));
// 3) palettes
const pals = {
  attack: 'gStatAnim_Attack_Pal', defense: 'gStatAnim_Defense_Pal',
  accuracy: 'gStatAnim_Accuracy_Pal', speed: 'gStatAnim_Speed_Pal',
  evasion: 'gStatAnim_Evasion_Pal', sp_attack: 'gStatAnim_SpAttack_Pal',
  sp_defense: 'gStatAnim_SpDefense_Pal', multiple: 'gStatAnim_Multiple_Pal',
};
const symbols = JSON.parse(fs.readFileSync(SYMBOLS_JSON, 'utf8'));
for (const [file, sym] of Object.entries(pals)) {
  const out = 'stat_change_' + file + '.gbapal';
  fs.writeFileSync(path.join(OUT, out), jascToGbapal(path.join(SRC, file + '.pal')));
  symbols[sym] = out;
}
symbols['gStatAnim_Gfx'] = 'stat_change.4bpp.bin';
symbols['gStatAnim_Increase_Tilemap'] = 'stat_change_increase.map.bin';
symbols['gStatAnim_Decrease_Tilemap'] = 'stat_change_decrease.map.bin';
fs.writeFileSync(SYMBOLS_JSON, JSON.stringify(symbols, null, 2) + '\n');
console.log('OK : 1 gfx + 2 tilemaps + 8 palettes + 11 symboles.');
