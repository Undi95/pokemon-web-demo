// RÉGÉNÉRATEUR des données anims en écart (plan 100% anims, point 1 — 2026-06-13).
// Source de vérité : gBattleAnimPicTable + gBattleAnimPaletteTable (décomp
// src/data/battle_anim.h) + graphics-data.ts (symbole → fichier source) +
// graphics_file_rules.mk (concats multi-png, ex. spark = spark_0+spark_1).
// Répare : bins (re-extraits du png du gfxSym, tronqués/paddés à size table),
// palettes (PLTE BRUT du png du palSym — PAS du gfxSym ! — ou JASC .pal,
// multi-palettes gardées entières ex. music_notes_2 = 48 couleurs).
// Idempotent : ne réécrit que les entrées en écart. Relancer l'audit après :
//   node scripts/audit-anim-gfx-integrity.cjs
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const PUB = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/battle_anims/sprites';
const MANIFEST_PATH = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/battle_anims/anim-gfx-manifest.json';
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// ── tables décomp ────────────────────────────────────────────────────────────
const dataH = fs.readFileSync(path.join(DECOMP, 'src', 'data', 'battle_anim.h'), 'utf8');
const picTable = new Map(); const palTable = new Map();
for (const m of (/gBattleAnimPicTable\[\]\s*=\s*\{([\s\S]*?)\n\};/.exec(dataH))[1].matchAll(/\{(\w+),\s*(0x[0-9A-Fa-f]+|\d+),\s*(\w+)\}/g)) {
  picTable.set(m[3], { gfxSym: m[1], size: parseInt(m[2], m[2].startsWith('0x') ? 16 : 10) });
}
for (const m of (/gBattleAnimPaletteTable\[\]\s*=\s*\{([\s\S]*?)\n\};/.exec(dataH))[1].matchAll(/\{(\w+),\s*(\w+)\}/g)) {
  palTable.set(m[2], { palSym: m[1] });
}
const gd = fs.readFileSync('D:/Projet 1/pokemon-web-demo/src/engine/decomp-data/src/graphics-data.ts', 'utf8');
const symToPath = new Map();
for (const m of gd.matchAll(/'(\w+)':\s*\{\s*path:\s*'([^']+)'/g)) symToPath.set(m[1], m[2]);

// ── concats .mk : cible.4bpp ← png parts (graphics_file_rules.mk) ───────────
const mk = fs.readFileSync(path.join(DECOMP, 'graphics_file_rules.mk'), 'utf8');
const concats = new Map(); // 'graphics/battle_anims/sprites/spark.4bpp' → [part paths .4bpp]
for (const m of mk.matchAll(/\$\(BTLANMSPRGFXDIR\)\/(\w+)\.4bpp:\s*((?:\$\(BTLANMSPRGFXDIR\)\/\w+\.4bpp\s*\\?\s*)+)/g)) {
  const parts = [...m[2].matchAll(/\$\(BTLANMSPRGFXDIR\)\/(\w+)\.4bpp/g)].map((x) => x[1]);
  concats.set(m[1], parts);
}

// ── PNG indexé → 4bpp tiles (bitDepth 4 ou 8) ───────────────────────────────
function pngDecode(srcPath) {
  const d = fs.readFileSync(srcPath);
  let pos = 8, idat = Buffer.alloc(0), w = 0, h = 0, depth = 0, plte = null;
  while (pos < d.length) {
    const ln = d.readUInt32BE(pos);
    const typ = d.toString('ascii', pos + 4, pos + 8);
    const chunk = d.subarray(pos + 8, pos + 8 + ln);
    if (typ === 'IHDR') { w = chunk.readUInt32BE(0); h = chunk.readUInt32BE(4); depth = chunk[8]; }
    else if (typ === 'PLTE') plte = Buffer.from(chunk);
    else if (typ === 'IDAT') idat = Buffer.concat([idat, chunk]);
    pos += 12 + ln;
  }
  const raw = zlib.inflateSync(idat);
  const stride = Math.ceil((w * depth) / 8);
  const rows = [];
  let prev = Buffer.alloc(stride), p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p]; p += 1;
    const line = Buffer.from(raw.subarray(p, p + stride)); p += stride;
    const bpp = Math.max(1, depth >> 3);
    if (f === 1) { for (let i = bpp; i < stride; i++) line[i] = (line[i] + line[i - bpp]) & 0xFF; }
    else if (f === 2) { for (let i = 0; i < stride; i++) line[i] = (line[i] + prev[i]) & 0xFF; }
    else if (f === 3) { for (let i = 0; i < stride; i++) { const a = i >= bpp ? line[i - bpp] : 0; line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF; } }
    else if (f === 4) {
      for (let i = 0; i < stride; i++) {
        const a = i >= bpp ? line[i - bpp] : 0; const b = prev[i]; const c = i >= bpp ? prev[i - bpp] : 0;
        const pp = a + b - c; const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        line[i] = (line[i] + ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c))) & 0xFF;
      }
    }
    rows.push(line); prev = line;
  }
  const px = depth === 4
    ? (x, y) => { const b = rows[y][x >> 1]; return (x & 1) === 0 ? (b >> 4) & 0xF : b & 0xF; }
    : (x, y) => rows[y][x] & 0xF;
  return { w, h, px, plte };
}
function pngTo4bpp(srcPath) {
  const { w, h, px } = pngDecode(srcPath);
  const out = [];
  for (let ty = 0; ty < Math.floor(h / 8); ty++) {
    for (let tx = 0; tx < Math.floor(w / 8); tx++) {
      for (let yy = 0; yy < 8; yy++) {
        for (let xx = 0; xx < 8; xx += 2) {
          out.push(px(tx * 8 + xx, ty * 8 + yy) | (px(tx * 8 + xx + 1, ty * 8 + yy) << 4));
        }
      }
    }
  }
  return Buffer.from(out);
}
function plteToGbapal(srcPath) {
  const { plte } = pngDecode(srcPath);
  if (!plte) throw new Error('pas de PLTE: ' + srcPath);
  const n = Math.min(16, plte.length / 3);
  const out = Buffer.alloc(32);
  for (let i = 0; i < n; i++) {
    out.writeUInt16LE((plte[i * 3] >> 3) | ((plte[i * 3 + 1] >> 3) << 5) | ((plte[i * 3 + 2] >> 3) << 10), i * 2);
  }
  return out;
}
function jascToGbapal(srcPath) {
  const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);
  if (lines[0] !== 'JASC-PAL') throw new Error('pas JASC: ' + srcPath);
  const n = parseInt(lines[2], 10);
  // multi-palettes 1:1 : garder TOUTES les couleurs (music_notes_2 = 48 → 96o)
  const out = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const [r, g, b] = lines[3 + i].trim().split(/\s+/).map(Number);
    out.writeUInt16LE((r >> 3) | ((g >> 3) << 5) | ((b >> 3) << 10), i * 2);
  }
  return out;
}
function buildGfxBin(gfxSym, size) {
  const rel = symToPath.get(gfxSym);
  if (!rel) throw new Error('gfxSym sans source: ' + gfxSym);
  const base = path.basename(rel).replace(/\.(png|4bpp)$/, '');
  let bin;
  if (concats.has(base)) {
    // concat .mk : chaque part = png du même dossier
    const dir = path.dirname(rel);
    bin = Buffer.concat(concats.get(base).map((part) => pngTo4bpp(path.join(DECOMP, dir, part + '.png'))));
  } else if (rel.endsWith('.png')) {
    bin = pngTo4bpp(path.join(DECOMP, rel));
  } else {
    throw new Error('source gfx non-png sans règle concat: ' + rel);
  }
  // taille de chargement ROM = size de la table : tronque ou padde (zéros)
  if (bin.length > size) bin = bin.subarray(0, size);
  else if (bin.length < size) bin = Buffer.concat([bin, Buffer.alloc(size - bin.length)]);
  return bin;
}
function buildPal(palSym) {
  const rel = symToPath.get(palSym);
  if (!rel) throw new Error('palSym sans source: ' + palSym);
  const abs = path.join(DECOMP, rel);
  if (rel.endsWith('.pal')) return jascToGbapal(abs);
  return plteToGbapal(abs);
}

// ── répare toute entrée en écart (mêmes checks que l'audit) ──────────────────
let fixedBins = 0, fixedPals = 0, skipped = 0;
const notes = [];
for (const [tagName, entry] of Object.entries(manifest)) {
  const pic = picTable.get(tagName);
  const pal = palTable.get(tagName);
  if (!pic) { notes.push(`${tagName}: absent de picTable — ignoré`); skipped++; continue; }
  const binP = path.join(PUB, entry.bin);
  const palP = path.join(PUB, entry.pal);
  // bin : régénère si taille ≠ table
  const binLen = fs.existsSync(binP) ? fs.statSync(binP).size : -1;
  if (binLen !== pic.size) {
    fs.writeFileSync(binP, buildGfxBin(pic.gfxSym, pic.size));
    entry.size = pic.size; entry.realBytes = pic.size;
    fixedBins++;
    notes.push(`${tagName}: bin régénéré ${binLen}o → ${pic.size}o (${pic.gfxSym})`);
  } else if (entry.size !== pic.size || entry.realBytes !== pic.size) {
    entry.size = pic.size; entry.realBytes = pic.size;
  }
  // pal : régénère depuis le palSym (la VRAIE palette — recolors croisés inclus)
  if (pal) {
    const fresh = buildPal(pal.palSym);
    const cur = fs.existsSync(palP) ? fs.readFileSync(palP) : Buffer.alloc(0);
    if (!cur.equals(fresh)) {
      fs.writeFileSync(palP, fresh);
      fixedPals++;
      notes.push(`${tagName}: pal régénérée ${cur.length}o → ${fresh.length}o (${pal.palSym}${fresh.length > 32 ? ' MULTI' : ''})`);
    }
  } else {
    notes.push(`${tagName}: QUIRK vanilla — pas d'entrée gBattleAnimPaletteTable (pal existante conservée)`);
  }
}
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 1));
console.log(`bins régénérés: ${fixedBins} · palettes régénérées: ${fixedPals} · ignorés: ${skipped}`);
for (const n of notes) console.log('  ' + n);
