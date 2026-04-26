#!/usr/bin/env node
/**
 * extract-text-palettes.mjs
 * --------------------------
 * Extrait les palettes runtime des PNG indexed text_window/* + font_palette
 * vers `public/decomp/em/ui/text_window/palettes.json`.
 *
 * Format output : { "<paletteName>": { "colors": [[r,g,b], ...] } }
 *
 * Palettes extraites :
 *  - gMessageBox_Pal       : depuis text_window/message_box.png
 *  - gTextWindowFrame{N}_Pal : depuis text_window/{1..20}.png (20 frames)
 *  - gFontPalette          : 4 couleurs depuis latin_normal.png (les 4 idx
 *                             utilisés par .latfont, dans l'ordre 0/1/2/3)
 *
 * Pourquoi : remplace le hardcode RGB literal `rgb(248,248,248)` (window-renderer.ts:291)
 * et permet à `gba-text-printer.copyWindowToCanvas` de mapper les idx 0-15 du
 * pixel buffer vers les vraies couleurs de la palette runtime du décomp.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TW_DIR = resolve(__dirname, '../../decomps/pokeemeraude/graphics/text_window');
const FONTS_DIR = resolve(__dirname, '../../decomps/pokeemeraude/graphics/fonts');
const OUT = resolve(__dirname, '../public/decomp/em/ui/text_window/palettes.json');

function extractPalette(pngPath) {
  const buf = readFileSync(pngPath);
  const png = PNG.sync.read(buf);
  if (!png.palette || png.colorType !== 3) {
    console.warn(`[extract-text-palettes] ${pngPath} pas indexed (mode=${png.colorType})`);
    return null;
  }
  // png.palette est [[r,g,b(,a)], ...] (jusqu'à 256 entrées). Strip alpha,
  // pad à 16 pour 4bpp.
  const colors = [];
  for (let i = 0; i < 16; i++) {
    if (png.palette[i]) {
      const c = png.palette[i];
      colors.push([c[0], c[1], c[2]]);
    } else {
      colors.push([0, 0, 0]);
    }
  }
  return colors;
}

const out = {};

// gMessageBox_Pal — la palette du dialog box (cyan/turquoise pour BirchSpeech)
const mbPath = resolve(TW_DIR, 'message_box.png');
if (existsSync(mbPath)) {
  const colors = extractPalette(mbPath);
  if (colors) {
    out.gMessageBox_Pal = { colors };
    console.log(`[extract-text-palettes] gMessageBox_Pal[14] = ${JSON.stringify(colors[14])}`);
  }
}

// gTextWindowFrame{N}_Pal — frames 1-20 (palette des borders user-selectable)
for (let n = 1; n <= 20; n++) {
  const fp = resolve(TW_DIR, `${n}.png`);
  if (!existsSync(fp)) continue;
  const colors = extractPalette(fp);
  if (colors) {
    out[`gTextWindowFrame${n}_Pal`] = { colors };
  }
}

// gFontPalette — 4 couleurs pour le rendu de glyphs (idx 0/1/2/3 du .latfont)
// Source : latin_normal.png palette (premières 4 entrées)
const fontPath = resolve(FONTS_DIR, 'latin_normal.png');
if (existsSync(fontPath)) {
  const colors = extractPalette(fontPath);
  if (colors) {
    // Garde uniquement les 4 premières entries (BG/FG/SHADOW/BOX_FILL)
    out.gFontPalette = { colors: colors.slice(0, 4) };
    console.log(`[extract-text-palettes] gFontPalette[0..3] = ${JSON.stringify(out.gFontPalette.colors)}`);
  }
}

// ─── Constantes RGB() inline depuis option_menu.c ───────────────────────────
// Pour BG color & autres palettes 1-color déclarées en C (pas en .pal séparé).
// Format C : `static const u16 sFooBar_Pal[] = {RGB(R, G, B)};` où R/G/B sont
// 5-bit (0-31). Convert vers 8-bit RGB.
const OPTION_C = resolve(__dirname, '../../decomps/pokeemeraude/src/option_menu.c');
if (existsSync(OPTION_C)) {
  const src = readFileSync(OPTION_C, 'utf8');
  const re = /const\s+u16\s+(\w+_Pal)\s*\[\s*\]\s*=\s*\{\s*RGB\((\d+),\s*(\d+),\s*(\d+)\)\s*\}/g;
  let m;
  while ((m = re.exec(src))) {
    const [, name, r5, g5, b5] = m;
    const r = Math.round(Number(r5) * 255 / 31);
    const g = Math.round(Number(g5) * 255 / 31);
    const b = Math.round(Number(b5) * 255 / 31);
    out[name] = { colors: [[r, g, b]] };
    console.log(`[extract-text-palettes] inline ${name} = (${r},${g},${b})`);
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`[extract-text-palettes] écrit ${OUT} (${Object.keys(out).length} palettes)`);
