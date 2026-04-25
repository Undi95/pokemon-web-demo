#!/usr/bin/env node
/**
 * Compose les PNG finaux du title screen à partir de leurs tilesets + tilemaps.
 *
 * Chaque asset est en 3 parties dans le décomp :
 *   - NAME.png = atlas de tuiles 8×8 (indexé)
 *   - NAME.bin = tilemap (2 octets/tile : id[0-9], flipX[10], flipY[11], pal[12-15])
 *   - NAME.pal = palette JASC-PAL (16 ou 256 couleurs)
 *
 * Sortie : public/decomp/em/boot/title_screen/NAME-rendered.png (RGBA composé)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'graphics', 'title_screen');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'boot', 'title_screen');
mkdirSync(outDir, { recursive: true });

function parsePal(p) {
  const lines = readFileSync(p, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const count = Number(lines[2]) || 16;
  const colors = [];
  for (let i = 3; i < lines.length && colors.length < count; i++) {
    const parts = lines[i].split(/\s+/).map(Number);
    if (parts.length >= 3) colors.push([parts[0], parts[1], parts[2]]);
  }
  while (colors.length < count) colors.push([0, 0, 0]);
  return colors;
}

function loadIndexed(pngPath) {
  const png = PNG.sync.read(readFileSync(pngPath));
  const indices = new Uint8Array(png.width * png.height);
  if (png.palette) {
    const map = new Map();
    for (let i = 0; i < png.palette.length; i++) {
      const [r, g, b] = png.palette[i];
      map.set((r << 16) | (g << 8) | b, i);
    }
    for (let i = 0; i < indices.length; i++) {
      const k = (png.data[i * 4] << 16) | (png.data[i * 4 + 1] << 8) | png.data[i * 4 + 2];
      indices[i] = map.get(k) ?? 0;
    }
  }
  return { width: png.width, height: png.height, indices, is8bpp: (png.palette?.length ?? 0) > 16 };
}

function composeTilemap({ tilesetPath, tilemapPath, palPath, outPath, gridW, gridH }) {
  const ts = loadIndexed(tilesetPath);
  const tilemap = readFileSync(tilemapPath);
  const palette = parsePal(palPath);
  const tilesPerRow = ts.width / 8;
  const W = gridW * 8, H = gridH * 8;
  const out = new PNG({ width: W, height: H });
  // Fill transparent
  for (let i = 0; i < out.data.length; i += 4) { out.data[i + 3] = 0; }

  for (let ty = 0; ty < gridH; ty++) {
    for (let tx = 0; tx < gridW; tx++) {
      const ofs = (ty * gridW + tx) * 2;
      if (ofs + 1 >= tilemap.length) continue;
      const ref = tilemap.readUInt16LE(ofs);
      const tileId = ref & 0x03FF;
      const flipX = (ref >> 10) & 1;
      const flipY = (ref >> 11) & 1;
      const palSlot = (ref >> 12) & 0x0F;
      if (tileId === 0 && !ts.is8bpp) continue;

      // En 8bpp mode, chaque tile fait 64 octets. La GBA wrap les IDs > max_tiles
      // vers le char block suivant. Pokemerald charge le logo UNIQUEMENT en block 0,
      // les IDs > atlas count loop modulo le nombre de tiles atlas.
      const maxAtlasTiles = (ts.width / 8) * (ts.height / 8);
      const effTileId = ts.is8bpp ? (tileId % maxAtlasTiles) : tileId;
      const sx = (effTileId % tilesPerRow) * 8;
      const sy = Math.floor(effTileId / tilesPerRow) * 8;
      if (sy >= ts.height) continue;

      for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 8; px++) {
          const srcX = flipX ? 7 - px : px;
          const srcY = flipY ? 7 - py : py;
          const raw = ts.indices[(sy + srcY) * ts.width + (sx + srcX)];
          // 8bpp : l'index encode déjà palSlot*16+color. 4bpp : palSlot du tile ref.
          const color = ts.is8bpp ? palette[raw] : palette[palSlot * 16 + (raw % 16)] ?? palette[raw % 16];
          const colorIdx = ts.is8bpp ? raw : raw % 16;
          if (colorIdx === 0) continue; // transparent
          if (!color) continue;
          const dstIdx = ((ty * 8 + py) * W + (tx * 8 + px)) * 4;
          out.data[dstIdx] = color[0];
          out.data[dstIdx + 1] = color[1];
          out.data[dstIdx + 2] = color[2];
          out.data[dstIdx + 3] = 255;
        }
      }
    }
  }
  writeFileSync(outPath, PNG.sync.write(out));
  console.log('[title]', outPath, `${W}×${H}`);
}

// Pokémon logo : 256×128 composé (32×16 tiles), palette 256 couleurs
composeTilemap({
  tilesetPath: join(srcDir, 'pokemon_logo.png'),
  tilemapPath: join(srcDir, 'pokemon_logo.bin'),
  palPath: join(srcDir, 'pokemon_logo.pal'),
  outPath: join(outDir, 'pokemon_logo-rendered.png'),
  gridW: 32, gridH: 16
});

// Rayquaza : 256×256 composé (32×32 tiles), palette 16 couleurs
composeTilemap({
  tilesetPath: join(srcDir, 'rayquaza.png'),
  tilemapPath: join(srcDir, 'rayquaza.bin'),
  palPath: join(srcDir, 'rayquaza_and_clouds.pal'),
  outPath: join(outDir, 'rayquaza-rendered.png'),
  gridW: 32, gridH: 32
});

// Clouds : 256×256 composé (32×32), même palette que Rayquaza
composeTilemap({
  tilesetPath: join(srcDir, 'clouds.png'),
  tilemapPath: join(srcDir, 'clouds.bin'),
  palPath: join(srcDir, 'rayquaza_and_clouds.pal'),
  outPath: join(outDir, 'clouds-rendered.png'),
  gridW: 32, gridH: 32
});
