#!/usr/bin/env node
/**
 * Renders decomp layouts to full-color PNG images.
 *
 * Pipeline: tiles.png (indexed, palette baked for preview) + metatiles.bin
 * + map.bin + .pal files → apply real palette per metatile → composite PNG.
 *
 * Usage:
 *   node scripts/render-layouts.mjs                  # PoC: LAYOUT_LITTLEROOT_TOWN
 *   node scripts/render-layouts.mjs LAYOUT_ROUTE101  # specific layout
 *   node scripts/render-layouts.mjs --all            # all layouts
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'rendered');

if (!existsSync(decompPath)) {
  console.error(`decomp not found at ${decompPath}`);
  process.exit(1);
}

function tilesetIdToDir(gTilesetId) {
  const name = gTilesetId.replace(/^gTileset_/, '');
  return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function parsePal(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  // Format: JASC-PAL / 0100 / 16 / R G B x 16
  const colors = [];
  for (let i = 3; i < lines.length && colors.length < 16; i++) {
    const parts = lines[i].split(/\s+/).map(Number);
    if (parts.length >= 3) colors.push([parts[0], parts[1], parts[2]]);
  }
  while (colors.length < 16) colors.push([0, 0, 0]);
  return colors;
}

function loadTilesetFromDir(dir, dirName) {
  const tilesPath = join(dir, 'tiles.png');
  const metatilesPath = join(dir, 'metatiles.bin');
  if (!existsSync(tilesPath) || !existsSync(metatilesPath)) return null;

  const png = PNG.sync.read(readFileSync(tilesPath));
  // pngjs expands indexed PNG data to RGBA in .data. We reverse-lookup each
  // pixel's RGB against the PNG palette to recover the raw index (0..N-1).
  const indices = new Uint8Array(png.width * png.height);
  if (png.palette) {
    const revMap = new Map();
    for (let i = 0; i < png.palette.length; i++) {
      const [r, g, b] = png.palette[i];
      revMap.set((r << 16) | (g << 8) | b, i);
    }
    for (let i = 0; i < indices.length; i++) {
      const key = (png.data[i * 4] << 16) | (png.data[i * 4 + 1] << 8) | png.data[i * 4 + 2];
      indices[i] = revMap.get(key) ?? 0;
    }
  } else {
    for (let i = 0; i < indices.length; i++) indices[i] = png.data[i * 4] >> 4;
  }

  // 8bpp PNGs bake (palSlot * 16 + colorIdx) into each byte. 4bpp PNGs store
  // colorIdx 0-15 and the palette slot is picked by the metatile ref.
  const is8bpp = png.palette && png.palette.length > 16;

  return {
    dir,
    dirName,
    tilesWidth: png.width,
    tilesHeight: png.height,
    indices,
    is8bpp,
    metatiles: readFileSync(metatilesPath),
    numMetatiles: readFileSync(metatilesPath).length / 16,
    tilesPerRow: png.width / 8
  };
}

function loadTileset(kind, gTilesetId) {
  if (!gTilesetId) return null;
  const dirName = tilesetIdToDir(gTilesetId);
  const dir = join(decompPath, 'data', 'tilesets', kind, dirName);
  if (existsSync(dir)) return loadTilesetFromDir(dir, dirName);
  // fallback naming heuristics
  for (const alt of [dirName.replace(/_city$/, ''), dirName.replace(/_town$/, '')]) {
    const altDir = join(decompPath, 'data', 'tilesets', kind, alt);
    if (existsSync(altDir)) return loadTilesetFromDir(altDir, alt);
  }
  return null;
}

/**
 * Build the 13-entry palette table used by a layout.
 * pokeemeraude uses NUM_PALS_IN_PRIMARY = 6, so palettes 0..5 come from the
 * primary tileset and 6..12 from the secondary. 13..15 are sprite palettes.
 */
const NUM_PALS_IN_PRIMARY = 6;
function buildPalettes(primary, secondary) {
  const palettes = new Array(13);
  for (let i = 0; i < NUM_PALS_IN_PRIMARY; i++) {
    const p = join(primary.dir, 'palettes', `${String(i).padStart(2, '0')}.pal`);
    palettes[i] = existsSync(p) ? parsePal(p) : new Array(16).fill([0, 0, 0]);
  }
  for (let i = NUM_PALS_IN_PRIMARY; i < 13; i++) {
    const fallback = new Array(16).fill([0, 0, 0]);
    if (secondary) {
      const p = join(secondary.dir, 'palettes', `${String(i).padStart(2, '0')}.pal`);
      palettes[i] = existsSync(p) ? parsePal(p) : fallback;
    } else {
      palettes[i] = fallback;
    }
  }
  return palettes;
}

function drawTileRef(outRgba, outW, dx, dy, tileRef, primary, secondary, palettes, isUpperLayer) {
  const tileId = tileRef & 0x03FF;
  const flipX = (tileRef >> 10) & 1;
  const flipY = (tileRef >> 11) & 1;
  const metatilePalSlot = (tileRef >> 12) & 0x0F;

  let ts, tileIdx;
  if (tileId < 512) { ts = primary; tileIdx = tileId; }
  else { ts = secondary; if (!ts) return; tileIdx = tileId - 512; }

  const maxTiles = (ts.tilesWidth / 8) * (ts.tilesHeight / 8);
  if (tileIdx >= maxTiles) return;

  const tx = (tileIdx % ts.tilesPerRow) * 8;
  const ty = Math.floor(tileIdx / ts.tilesPerRow) * 8;

  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const srcX = flipX ? (7 - px) : px;
      const srcY = flipY ? (7 - py) : py;
      const rawIdx = ts.indices[(ty + srcY) * ts.tilesWidth + (tx + srcX)];
      const colorIdx = rawIdx % 16;
      if (isUpperLayer && colorIdx === 0) continue;
      // 8bpp: use the palette slot baked into the PNG byte (rawIdx / 16).
      // 4bpp: use the slot specified by the metatile tile ref.
      const palSlot = ts.is8bpp ? Math.floor(rawIdx / 16) : metatilePalSlot;
      const palette = palettes[palSlot];
      if (!palette) continue;
      const [r, g, b] = palette[colorIdx];
      const dstIdx = ((dy + py) * outW + (dx + px)) * 4;
      outRgba[dstIdx] = r;
      outRgba[dstIdx + 1] = g;
      outRgba[dstIdx + 2] = b;
      outRgba[dstIdx + 3] = 255;
    }
  }
}

function drawMetatile(outRgba, outW, dx, dy, metatileBytes, primary, secondary, palettes) {
  for (let i = 0; i < 4; i++) {
    const o = i * 2;
    const ref = metatileBytes[o] | (metatileBytes[o + 1] << 8);
    const sx = (i % 2) * 8;
    const sy = Math.floor(i / 2) * 8;
    drawTileRef(outRgba, outW, dx + sx, dy + sy, ref, primary, secondary, palettes, false);
  }
  for (let i = 0; i < 4; i++) {
    const o = (4 + i) * 2;
    const ref = metatileBytes[o] | (metatileBytes[o + 1] << 8);
    const sx = (i % 2) * 8;
    const sy = Math.floor(i / 2) * 8;
    drawTileRef(outRgba, outW, dx + sx, dy + sy, ref, primary, secondary, palettes, true);
  }
}

function getMetatile(metatileId, primary, secondary) {
  if (metatileId < 512) {
    if (metatileId >= primary.numMetatiles) return null;
    return primary.metatiles.slice(metatileId * 16, metatileId * 16 + 16);
  }
  if (!secondary) return null;
  const idx = metatileId - 512;
  if (idx >= secondary.numMetatiles) return null;
  return secondary.metatiles.slice(idx * 16, idx * 16 + 16);
}

function renderLayout(layoutDef) {
  const primary = loadTileset('primary', layoutDef.primary_tileset);
  const secondary = loadTileset('secondary', layoutDef.secondary_tileset);
  if (!primary) throw new Error(`primary tileset not found: ${layoutDef.primary_tileset}`);

  const palettes = buildPalettes(primary, secondary);

  const mapBinPath = join(decompPath, layoutDef.blockdata_filepath);
  if (!existsSync(mapBinPath)) throw new Error(`map.bin not found: ${layoutDef.blockdata_filepath}`);
  const mapBin = readFileSync(mapBinPath);

  const width = layoutDef.width;
  const height = layoutDef.height;
  const outW = width * 16;
  const outH = height * 16;
  const outRgba = Buffer.alloc(outW * outH * 4, 0);

  const collisions = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const byteIdx = (y * width + x) * 2;
      if (byteIdx + 1 >= mapBin.length) { row.push(0); continue; }
      const entry = mapBin.readUInt16LE(byteIdx);
      const metatileId = entry & 0x03FF;
      const collision = (entry >> 10) & 0x03;
      row.push(collision > 0 ? 1 : 0);
      const mt = getMetatile(metatileId, primary, secondary);
      if (mt) drawMetatile(outRgba, outW, x * 16, y * 16, mt, primary, secondary, palettes);
    }
    collisions.push(row);
  }

  const png = new PNG({ width: outW, height: outH });
  outRgba.copy(png.data);
  const pngBuf = PNG.sync.write(png);

  return {
    png: pngBuf,
    width: outW,
    height: outH,
    collisions,
    tileWidth: width,
    tileHeight: height,
    primaryTilesetDir: primary.dirName,
    secondaryTilesetDir: secondary?.dirName ?? null
  };
}

// --- main ---
const layoutsIndexPath = join(projectRoot, 'public', 'decomp', 'em', 'layouts-index.json');
const layoutsIndex = JSON.parse(readFileSync(layoutsIndexPath, 'utf8'));

const argTarget = process.argv[2];
const renderAll = argTarget === '--all';
const target = renderAll ? null : (argTarget || 'LAYOUT_LITTLEROOT_TOWN');

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, 'meta'), { recursive: true });

const toRender = renderAll
  ? layoutsIndex.layouts
  : [layoutsIndex.layouts.find(l => l.id === target)].filter(Boolean);

let ok = 0, ko = 0;
const errors = [];
for (const layout of toRender) {
  try {
    const result = renderLayout(layout);
    const baseName = layout.name.replace(/_Layout$/, '');
    writeFileSync(join(outDir, `${baseName}.png`), result.png);
    writeFileSync(join(outDir, 'meta', `${baseName}.json`), JSON.stringify({
      id: layout.id,
      name: baseName,
      width: result.width,
      height: result.height,
      tileWidth: result.tileWidth,
      tileHeight: result.tileHeight,
      primaryTileset: layout.primary_tileset,
      secondaryTileset: layout.secondary_tileset,
      collisions: result.collisions
    }));
    ok++;
    if (!renderAll) console.log(`[ok] ${baseName} → ${result.width}x${result.height}px`);
  } catch (e) {
    ko++;
    errors.push({ layout: layout.name, err: String(e) });
    if (!renderAll) console.warn(`[ko] ${layout.name}: ${String(e)}`);
  }
}
console.log(`\n${ok} layouts rendered, ${ko} failed.`);
if (renderAll && errors.length) {
  console.log(`First 10 errors:`);
  errors.slice(0, 10).forEach(e => console.log(`  - ${e.layout}: ${e.err}`));
}
