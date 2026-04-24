#!/usr/bin/env node
/**
 * Renders metatile atlases per tileset pair (primary + secondary).
 *
 * For each pair, produces:
 *   - metatiles-lower.png : all metatiles' lower layer composed (16×16 each, in a grid)
 *   - metatiles-upper.png : all metatiles' upper layer composed (transparent where
 *                           color 0)
 *   - info.json            : grid dimensions, metatile count, tileset names
 *
 * Runtime Phaser loads these atlases and two tilemap layers reference them, with
 * the player depth placed between them so trees/roofs occlude the sprite.
 *
 * Usage:
 *   node scripts/render-metatile-atlas.mjs                      # Default: LittlerootTown pair
 *   node scripts/render-metatile-atlas.mjs --all                # All unique pairs
 *   node scripts/render-metatile-atlas.mjs LAYOUT_NAME          # Pair used by a specific layout
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outRoot = join(projectRoot, 'public', 'decomp', 'em', 'tileset-pairs');

const NUM_PALS_IN_PRIMARY = 6;
const ATLAS_COLS = 32; // metatiles per row in the atlas image

function tilesetIdToDir(gTilesetId) {
  const name = gTilesetId.replace(/^gTileset_/, '');
  return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function parsePal(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
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
  const is8bpp = png.palette && png.palette.length > 16;
  const metatiles = readFileSync(metatilesPath);

  // metatile_attributes.bin : 2 octets par metatile, layer type = bits 12-15
  const attrsPath = join(dir, 'metatile_attributes.bin');
  const attrs = existsSync(attrsPath) ? readFileSync(attrsPath) : null;

  return {
    dir,
    dirName,
    tilesWidth: png.width,
    tilesHeight: png.height,
    indices,
    is8bpp,
    metatiles,
    attrs,
    numMetatiles: metatiles.length / 16,
    tilesPerRow: png.width / 8
  };
}

const LAYER_TYPE_NORMAL = 0;
const LAYER_TYPE_COVERED = 1;
const LAYER_TYPE_SPLIT = 2;

function getMetatileLayerType(ts, localMetatileId) {
  if (!ts || !ts.attrs) return LAYER_TYPE_NORMAL;
  const offset = localMetatileId * 2;
  if (offset + 1 >= ts.attrs.length) return LAYER_TYPE_NORMAL;
  const attr = ts.attrs[offset] | (ts.attrs[offset + 1] << 8);
  return (attr >> 12) & 0xF;
}

function loadTileset(kind, gTilesetId) {
  if (!gTilesetId) return null;
  const dirName = tilesetIdToDir(gTilesetId);
  const dir = join(decompPath, 'data', 'tilesets', kind, dirName);
  if (existsSync(dir)) return loadTilesetFromDir(dir, dirName);
  for (const alt of [dirName.replace(/_city$/, ''), dirName.replace(/_town$/, '')]) {
    const altDir = join(decompPath, 'data', 'tilesets', kind, alt);
    if (existsSync(altDir)) return loadTilesetFromDir(altDir, alt);
  }
  return null;
}

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

/** Draw one 8×8 tile from a tileset into `out` RGBA buffer at (dx, dy). */
function drawTileRef(out, outW, dx, dy, tileRef, primary, secondary, palettes, upperLayer) {
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
      const sx = flipX ? (7 - px) : px;
      const sy = flipY ? (7 - py) : py;
      const rawIdx = ts.indices[(ty + sy) * ts.tilesWidth + (tx + sx)];
      const colorIdx = rawIdx % 16;
      if (upperLayer && colorIdx === 0) continue;
      const palSlot = ts.is8bpp ? Math.floor(rawIdx / 16) : metatilePalSlot;
      const palette = palettes[palSlot];
      if (!palette) continue;
      const [r, g, b] = palette[colorIdx];
      const di = ((dy + py) * outW + (dx + px)) * 4;
      out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = 255;
    }
  }
}

/** Draw one full metatile (4 sub-tiles) at (dx, dy) — only the requested layer. */
function drawMetatileLayer(out, outW, dx, dy, bytes, primary, secondary, palettes, layer) {
  const base = layer === 'upper' ? 4 : 0;
  const isUpper = layer === 'upper';
  for (let i = 0; i < 4; i++) {
    const o = (base + i) * 2;
    const ref = bytes[o] | (bytes[o + 1] << 8);
    const sx = (i % 2) * 8;
    const sy = Math.floor(i / 2) * 8;
    drawTileRef(out, outW, dx + sx, dy + sy, ref, primary, secondary, palettes, isUpper);
  }
}

function getMetatile(id, primary, secondary) {
  if (id < 512) {
    if (id >= primary.numMetatiles) return null;
    return primary.metatiles.slice(id * 16, id * 16 + 16);
  }
  if (!secondary) return null;
  const idx = id - 512;
  if (idx >= secondary.numMetatiles) return null;
  return secondary.metatiles.slice(idx * 16, idx * 16 + 16);
}

function renderAtlas(primary, secondary, layer) {
  const totalMetatiles = primary.numMetatiles + (secondary?.numMetatiles ?? 0);
  const cols = ATLAS_COLS;
  const rows = Math.ceil(totalMetatiles / cols);
  const W = cols * 16;
  const H = rows * 16;
  const buf = Buffer.alloc(W * H * 4, 0);
  const palettes = buildPalettes(primary, secondary);

  for (let id = 0; id < totalMetatiles; id++) {
    const effectiveId = id < primary.numMetatiles ? id : (512 + (id - primary.numMetatiles));
    const bytes = getMetatile(effectiveId, primary, secondary);
    if (!bytes) continue;

    // Layer type détermine quelles parties du metatile vont dans quel atlas.
    const isSecondary = effectiveId >= 512;
    const localId = isSecondary ? effectiveId - 512 : effectiveId;
    const layerType = getMetatileLayerType(isSecondary ? secondary : primary, localId);

    const dx = (id % cols) * 16;
    const dy = Math.floor(id / cols) * 16;

    if (layerType === LAYER_TYPE_COVERED) {
      // Les deux moitiés passent SOUS le joueur : on compose tout dans l'atlas "lower".
      if (layer === 'lower') {
        drawMetatileLayer(buf, W, dx, dy, bytes, primary, secondary, palettes, 'lower');
        drawMetatileLayer(buf, W, dx, dy, bytes, primary, secondary, palettes, 'upper');
      }
      // Rien dans l'atlas "upper" : le joueur ne sera pas occulté.
    } else {
      // NORMAL et SPLIT : comportement standard, lower sous le joueur, upper au-dessus.
      drawMetatileLayer(buf, W, dx, dy, bytes, primary, secondary, palettes, layer);
    }
  }

  const png = new PNG({ width: W, height: H });
  buf.copy(png.data);
  return { png: PNG.sync.write(png), width: W, height: H, cols, rows, totalMetatiles };
}

function pairKey(primaryId, secondaryId) {
  const p = tilesetIdToDir(primaryId);
  const s = secondaryId ? tilesetIdToDir(secondaryId) : 'none';
  return `${p}__${s}`;
}

function renderPair(primaryId, secondaryId) {
  const primary = loadTileset('primary', primaryId);
  const secondary = loadTileset('secondary', secondaryId);
  if (!primary) throw new Error(`primary not found: ${primaryId}`);

  const key = pairKey(primaryId, secondaryId);
  const dst = join(outRoot, key);
  mkdirSync(dst, { recursive: true });

  const lower = renderAtlas(primary, secondary, 'lower');
  const upper = renderAtlas(primary, secondary, 'upper');

  writeFileSync(join(dst, 'metatiles-lower.png'), lower.png);
  writeFileSync(join(dst, 'metatiles-upper.png'), upper.png);
  writeFileSync(join(dst, 'info.json'), JSON.stringify({
    primaryTileset: primaryId,
    secondaryTileset: secondaryId ?? null,
    atlasCols: lower.cols,
    atlasRows: lower.rows,
    atlasWidth: lower.width,
    atlasHeight: lower.height,
    totalMetatiles: lower.totalMetatiles,
    numPrimaryMetatiles: primary.numMetatiles,
    numSecondaryMetatiles: secondary?.numMetatiles ?? 0,
    primaryMetatileIdStart: 0,
    secondaryMetatileIdStart: 512
  }, null, 2));
  return key;
}

// --- main ---
const layoutsIndexPath = join(projectRoot, 'public', 'decomp', 'em', 'layouts-index.json');
const layoutsIndex = JSON.parse(readFileSync(layoutsIndexPath, 'utf8'));
const arg = process.argv[2];
const renderAll = arg === '--all';

mkdirSync(outRoot, { recursive: true });

let pairs = [];
if (renderAll) {
  const seen = new Set();
  for (const layout of layoutsIndex.layouts) {
    const k = pairKey(layout.primary_tileset, layout.secondary_tileset);
    if (seen.has(k)) continue;
    seen.add(k);
    pairs.push({ primary: layout.primary_tileset, secondary: layout.secondary_tileset });
  }
} else {
  const target = arg || 'LAYOUT_LITTLEROOT_TOWN';
  const layout = layoutsIndex.layouts.find(l => l.id === target);
  if (!layout) { console.error(`layout not found: ${target}`); process.exit(1); }
  pairs = [{ primary: layout.primary_tileset, secondary: layout.secondary_tileset }];
}

let ok = 0, ko = 0;
for (const p of pairs) {
  try {
    const key = renderPair(p.primary, p.secondary);
    console.log(`[ok] ${key}`);
    ok++;
  } catch (e) {
    console.warn(`[ko] ${p.primary} + ${p.secondary}: ${String(e)}`);
    ko++;
  }
}
console.log(`\n${ok} pairs rendered, ${ko} failed.`);

// Also write a layout-to-pair index so the runtime knows which atlas to load per map.
if (renderAll) {
  const index = {};
  for (const layout of layoutsIndex.layouts) {
    index[layout.id] = pairKey(layout.primary_tileset, layout.secondary_tileset);
  }
  writeFileSync(join(outRoot, 'layout-to-pair.json'), JSON.stringify(index, null, 2));
  console.log(`layout-to-pair index written.`);
}
