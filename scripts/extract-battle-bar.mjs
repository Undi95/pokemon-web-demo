#!/usr/bin/env node
/**
 * extract-battle-bar.mjs
 * ----------------------
 * Extrait `gBattleInterfaceGfx_BattleBar` (= le buffer `barFontGfx`, police BOLD des
 * chiffres HP adverses en combat DOUBLE) du décomp en JSON `{ width, height, pixels }`
 * (indices 4bpp BRUTS 0-15), consommé au runtime par `battle_gfx_sfx_util.ts
 * LoadBattleBarGfx` (même voie que `extract-keypad-icons.mjs` → keypad_icons.json).
 *
 * 1:1 décomp : `battle_bar.4bpp` N'EST PAS un PNG source. `graphics_file_rules.mk:89`
 * le GÉNÈRE par concaténation de 3 .4bpp :
 *     battle_bar.4bpp = cat hpbar_anim_unused.4bpp numbers1.4bpp numbers2.4bpp
 * (= 18 + 11 + 12 = 41 tuiles = 0x520 octets). `graphics.c:169` :
 *     gBattleInterfaceGfx_BattleBar = INCGFX_U32("…/battle_bar.4bpp", ".lz")
 * puis `battle_gfx_sfx_util.c:826 LoadBattleBarGfx` : LZDecompressWram(…, barFontGfx)
 * où barFontGfx = AllocZeroed(0x1000) → les 41 tuiles occupent [0..0x520[, le reste = 0.
 *
 * Comme les 3 composants sont hauts de 8 px (= 1 rangée de tuiles), `cat` des flux
 * tuilés == concaténation horizontale des images : on produit UNE image 328×8
 * (144 + 88 + 96) dont le tuilage row-major reproduit exactement le buffer barFontGfx.
 *
 * ⚠️ PIÈGE gbagfx (mémoire pitfall-gbagfx-grayscale-invert, payé `ee81459b`) :
 *   - numbers1.png / numbers2.png = colorType 0 (GRAYSCALE) → gbagfx INVERSE :
 *     index = 15 - sample. (Vérifié : samples {8,13,15}→{7,2,0} → fond=0 transparent,
 *     traits du chiffre = indices visibles → glyphe de police correct.)
 *   - hpbar_anim_unused.png = colorType 3 (INDEXÉ) → indices BRUTS, PAS d'inversion.
 * On applique donc l'inversion PAR COMPOSANT selon son colorType (comme wallclock.ts
 * :351 et pokemon_storage_system.ts:634).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1:1 graphics_file_rules.mk:89 — ordre de concaténation (hpbar → numbers1 → numbers2).
const GFXDIR = resolve(__dirname, '../../decomps/pokeemeraude/graphics/battle_interface');
const COMPONENTS = ['hpbar_anim_unused.png', 'numbers1.png', 'numbers2.png'];
const OUT = resolve(__dirname, '../public/decomp/em/battle_interface/battle_bar.json');

/** Parse un PNG 4bpp colorType 0 (grayscale) OU 3 (indexé) → indices 4bpp FINAUX
 *  (number[][]). Pour colorType 0, applique l'inversion gbagfx `index = 15 - sample`.
 *  Autonome (zlib built-in). Dérivé de extract-keypad-icons.mjs (parsePngRawIndices)
 *  + extension colorType 0 grayscale. */
function parsePng4bppFinalIndices(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`pas un PNG: ${path}`);
  let off = 8, W = 0, H = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { W = data.readUInt32BE(0); H = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === 'IDAT') { idat.push(data); }
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 4) throw new Error(`bitDepth ${bitDepth} != 4 attendu: ${path}`);
  if (colorType !== 0 && colorType !== 3) throw new Error(`colorType ${colorType} non géré (attendu 0 ou 3): ${path}`);
  const invert = colorType === 0; // grayscale → gbagfx index = 15 - sample
  const raw = inflateSync(Buffer.concat(idat));
  const stride = Math.ceil((W * bitDepth) / 8);
  const bpp = 1; // filtering bpp pour ≤8bit
  const out = Buffer.alloc(stride * H);
  for (let y = 0; y < H; y++) {
    const ft = raw[y * (stride + 1)];
    const srcRow = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = (x >= bpp && y > 0) ? out[(y - 1) * stride + x - bpp] : 0;
      let v = srcRow[x];
      if (ft === 1) v = (v + a) & 0xff;
      else if (ft === 2) v = (v + b) & 0xff;
      else if (ft === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (ft === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        v = (v + pr) & 0xff;
      }
      out[y * stride + x] = v;
    }
  }
  const pixels = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const byte = out[y * stride + (x >> 1)];
      let idx = (x & 1) ? (byte & 0x0f) : (byte >> 4);
      if (invert) idx = 15 - idx;
      row.push(idx);
    }
    pixels.push(row);
  }
  return { W, H, colorType, pixels };
}

// ── Charge + concatène horizontalement les 3 composants (tous H=8 = 1 rangée tuiles). ──
const parts = COMPONENTS.map((name) => {
  const p = resolve(GFXDIR, name);
  if (!existsSync(p)) { console.error('[extract-battle-bar] PNG introuvable:', p); process.exit(1); }
  return { name, ...parsePng4bppFinalIndices(p) };
});

const H = parts[0].H;
if (parts.some((p) => p.H !== H)) {
  console.error('[extract-battle-bar] hauteurs incohérentes:', parts.map((p) => `${p.name}=${p.H}`).join(' '));
  process.exit(1);
}
if (H !== 8) {
  console.error(`[extract-battle-bar] hauteur ${H} != 8 (chaque composant doit être 1 rangée de tuiles)`);
  process.exit(1);
}

const width = parts.reduce((s, p) => s + p.W, 0);
const pixels = [];
for (let y = 0; y < H; y++) {
  const row = [];
  for (const p of parts) row.push(...p.pixels[y]);
  pixels.push(row);
}

const tiles = (width / 8) * (H / 8);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ width, height: H, pixels }));

const uniq = [...new Set(pixels.flat())].sort((a, b) => a - b);
console.log(`[extract-battle-bar] écrit ${OUT}`);
console.log(`  composants: ${parts.map((p) => `${p.name}(ct${p.colorType},${p.W / 8}t)`).join(' + ')}`);
console.log(`  → image ${width}×${H} = ${tiles} tuiles (0x${(tiles * 32).toString(16)} octets) — idx uniques=${JSON.stringify(uniq)}`);
