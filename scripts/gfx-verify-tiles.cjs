/**
 * gfx-verify-tiles.cjs — Vérificateur 1:1 des tiles du tileset (VRAM char base 0).
 *
 * ORACLE NON-CIRCULAIRE :
 *   référence = data/tilesets/.../tiles.png de la décomp (PNG indexé, source Nintendo)
 *   sujet     = VRAM char base 0 live (dump base64) = ce que le GPU a réellement uploadé
 *
 * - Primaire (building) : tiles.png 4bpp → index direct = valeur 4bpp VRAM.
 * - Secondaire (shop)   : tiles.png 8bpp → la banque est dans l'attribut métatile,
 *   donc la valeur 4bpp VRAM = (index PNG & 0x0F).  (vérifié empiriquement)
 *
 * Décodeur PNG indexé maison (inflate zlib + dé-filtrage + dépaquetage bits) — pas pngjs,
 * pour récupérer les INDEX bruts sans round-trip RGBA.
 *
 * Usage : node scripts/gfx-verify-tiles.cjs [dump.json]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const NUM_TILES_IN_PRIMARY = 512;
const NUM_TILES_TOTAL = 1024;

const dumpPath = process.argv[2] || path.join(__dirname, '..', 'audit-reports', 'gfx', 'vram-dump.json');

function paeth(a, b, c) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

// PNG indexé (colorType 3) → { width, height, bitDepth, indices: Uint8Array }
function decodeIndexedPng(file) {
  const buf = fs.readFileSync(file);
  let off = 8, width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); off += 4;
    const type = buf.toString('ascii', off, off + 4); off += 4;
    const data = buf.subarray(off, off + len); off += len + 4;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  if (colorType !== 3) throw new Error(file + ' : colorType ' + colorType + ' (pas indexé)');
  if (interlace !== 0) throw new Error(file + ' : interlacé non supporté');
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = Math.max(1, Math.ceil(bitDepth / 8)); // 1 channel
  const scan = Math.ceil(width * bitDepth / 8);
  const unfil = Buffer.alloc(scan * height);
  let prev = Buffer.alloc(scan), p = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    const row = Buffer.alloc(scan);
    for (let x = 0; x < scan; x++) {
      const rb = raw[p++];
      const a = x >= bpp ? row[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v;
      switch (filter) {
        case 0: v = rb; break;
        case 1: v = rb + a; break;
        case 2: v = rb + b; break;
        case 3: v = rb + ((a + b) >> 1); break;
        case 4: v = rb + paeth(a, b, c); break;
        default: throw new Error('filtre PNG inconnu ' + filter);
      }
      row[x] = v & 0xff;
    }
    row.copy(unfil, y * scan);
    prev = row;
  }
  const indices = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const base = y * scan;
    for (let x = 0; x < width; x++) {
      let idx;
      if (bitDepth === 8) idx = unfil[base + x];
      else if (bitDepth === 4) { const by = unfil[base + (x >> 1)]; idx = (x & 1) ? (by & 0x0f) : (by >> 4); }
      else if (bitDepth === 2) { const by = unfil[base + (x >> 2)]; idx = (by >> ((3 - (x & 3)) * 2)) & 3; }
      else { const by = unfil[base + (x >> 3)]; idx = (by >> (7 - (x & 7))) & 1; }
      indices[y * width + x] = idx;
    }
  }
  return { width, height, bitDepth, indices };
}

// pixel (r,c) d'une tile T dans un PNG décodé (16 tiles par ligne)
function pngTilePixel(png, T, r, c) {
  const tilesPerRow = png.width >> 3;
  const tr = (T / tilesPerRow) | 0, tc = T % tilesPerRow;
  return png.indices[(tr * 8 + r) * png.width + (tc * 8 + c)];
}
// pixel (r,c) d'une tile 4bpp T dans la VRAM
function vramTilePixel(vram, T, r, c) {
  const by = vram[T * 32 + r * 4 + (c >> 1)];
  return (c & 1) ? (by >> 4) & 0x0f : by & 0x0f;
}

function compareTiles(vram, png, vramBase, pngBase, count, mask, malformed) {
  // mask: index PNG → valeur 4bpp attendue. (x)=>x pour 4bpp ; (x)=>x&0xF pour 8bpp.
  const res = { total: count, ok: 0, diffTiles: [], pixelDiffs: 0, pixelsTotal: count * 64, skipped: 0 };
  for (let t = 0; t < count; t++) {
    if (malformed && malformed.has(vramBase + t)) { res.skipped++; res.total--; continue; }
    let tileOk = true, firstBad = null;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const exp = mask(pngTilePixel(png, pngBase + t, r, c));
      const got = vramTilePixel(vram, vramBase + t, r, c);
      if (exp !== got) {
        res.pixelDiffs++; tileOk = false;
        if (!firstBad) firstBad = { r, c, exp, got };
      }
    }
    if (tileOk) res.ok++;
    else res.diffTiles.push({ tile: vramBase + t, firstBad });
  }
  return res;
}

// Reconstruit la VRAM (32768 o) depuis le dump sparse hex { tileIndex: "64 hex" }.
// Tiles absentes = zéro (elles l'étaient en VRAM). Tiles mal-formées (≠64 hex) = signalées.
function rebuildVramSparse(tiles) {
  const vram = new Uint8Array(32768);
  const malformed = [];
  for (const k of Object.keys(tiles)) {
    const T = +k, s = tiles[k];
    if (s.length !== 64) { malformed.push(T); continue; }
    for (let i = 0; i < 32; i++) vram[T * 32 + i] = parseInt(s.substr(i * 2, 2), 16);
  }
  return { vram, malformed: new Set(malformed) };
}

// ── run ──
const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
let vram, malformedTiles;
if (dump.charBase0_b64) {
  vram = new Uint8Array(Buffer.from(dump.charBase0_b64, 'base64'));
  malformedTiles = new Set();
} else {
  const rb = rebuildVramSparse(dump.tiles);
  vram = rb.vram; malformedTiles = rb.malformed;
}

const primPng = decodeIndexedPng(path.join(DECOMP, 'data/tilesets/primary', dump.primaryName, 'tiles.png'));
const secPng = decodeIndexedPng(path.join(DECOMP, 'data/tilesets/secondary', dump.secondaryName, 'tiles.png'));

const maskPrim = primPng.bitDepth === 4 ? (x) => x : (x) => x & 0x0f;
const maskSec = secPng.bitDepth === 4 ? (x) => x : (x) => x & 0x0f;

const rPrim = compareTiles(vram, primPng, 0, 0, NUM_TILES_IN_PRIMARY, maskPrim, malformedTiles);
const rSec = compareTiles(vram, secPng, NUM_TILES_IN_PRIMARY, 0, NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY, maskSec, malformedTiles);

function report(title, name, png, r) {
  console.log('── ' + title + ' (' + name + ', PNG ' + png.bitDepth + 'bpp ' + png.width + '×' + png.height + ') ──');
  console.log('  tiles 1:1 : ' + r.ok + '/' + r.total + '   pixels divergents : ' + r.pixelDiffs + '/' + r.pixelsTotal + (r.skipped ? '   (skip transport : ' + r.skipped + ')' : ''));
  if (r.diffTiles.length) {
    const show = r.diffTiles.slice(0, 12);
    for (const d of show) console.log('    tile ' + String(d.tile).padStart(4) + ' : 1er px (r' + d.firstBad.r + ',c' + d.firstBad.c + ') attendu ' + d.firstBad.exp + ' / live ' + d.firstBad.got);
    if (r.diffTiles.length > 12) console.log('    … +' + (r.diffTiles.length - 12) + ' autres tiles');
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log(' VÉRIF TILES VRAM  —  ' + dump.mapId);
console.log('═══════════════════════════════════════════════════════════════');
report('PRIMAIRE', dump.primaryName, primPng, rPrim);
report('SECONDAIRE', dump.secondaryName, secPng, rSec);
const okTot = rPrim.ok + rSec.ok, tot = rPrim.total + rSec.total;
console.log('');
console.log('Récap : ' + okTot + '/' + tot + ' tiles 1:1 au pixel près (' + (100 * okTot / tot).toFixed(1) + '%).');
