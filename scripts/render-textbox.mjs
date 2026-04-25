#!/usr/bin/env node
/**
 * Applique la vraie palette pokemerald (text_pal1.pal) sur text_window/1.png.
 * Le PNG est stocké indexé avec une palette "preview" grise ; les vraies
 * couleurs vivent dans les .pal et sont appliquées à l'exécution dans le jeu.
 *
 * Sortie : public/decomp/em/ui/textbox-1-colored.png (24×24 RGBA)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'ui');
mkdirSync(outDir, { recursive: true });

function parsePal(p) {
  const lines = readFileSync(p, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const colors = [];
  for (let i = 3; i < lines.length && colors.length < 16; i++) {
    const parts = lines[i].split(/\s+/).map(Number);
    if (parts.length >= 3) colors.push([parts[0], parts[1], parts[2]]);
  }
  while (colors.length < 16) colors.push([0, 0, 0]);
  return colors;
}

function renderWithPalette(pngPath, palPath, outPath) {
  const buf = readFileSync(pngPath);
  const src = PNG.sync.read(buf);
  const palette = parsePal(palPath);

  // Reverse-lookup RGB → PNG palette index via PLTE
  const revMap = new Map();
  for (let i = 0; i < (src.palette?.length ?? 0); i++) {
    const [r, g, b] = src.palette[i];
    revMap.set((r << 16) | (g << 8) | b, i);
  }

  const out = new PNG({ width: src.width, height: src.height });
  for (let i = 0; i < src.width * src.height; i++) {
    const r = src.data[i * 4], g = src.data[i * 4 + 1], b = src.data[i * 4 + 2];
    const idx = revMap.get((r << 16) | (g << 8) | b) ?? 0;
    const col = palette[idx] ?? [0, 0, 0];
    out.data[i * 4] = col[0];
    out.data[i * 4 + 1] = col[1];
    out.data[i * 4 + 2] = col[2];
    // Palette index 0 = transparent dans le jeu original
    out.data[i * 4 + 3] = idx === 0 ? 0 : 255;
  }
  writeFileSync(outPath, PNG.sync.write(out));
  console.log('[render-textbox] wrote', outPath);
}

// Frame 1 (rounded, par défaut Emerald) + text_pal1 (vert/blanc/rouge)
renderWithPalette(
  join(decompPath, 'graphics', 'text_window', '1.png'),
  join(decompPath, 'graphics', 'text_window', 'text_pal1.pal'),
  join(outDir, 'textbox-1-colored.png')
);
