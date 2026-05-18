#!/usr/bin/env node
/**
 * extract-move-types.mjs
 * ----------------------
 * Assemble le sprite-sheet des icônes de TYPES + sa palette 1:1 décomp.
 *
 * Source décomp `graphics_file_rules.mk:16-17,132,135` :
 *   types        := normal fight flying poison ground rock bug ghost steel
 *                   mystery fire water grass electric psychic ice dragon dark
 *   contest_types := cool beauty cute smart tough
 *   move_types.4bpp   := cat( {type}.4bpp …  contest_{c}.4bpp )   (ORDRE = enum TYPE_*)
 *   move_types.gbapal := cat( move_types_1/2/3.gbapal )           (3 palettes OBJ 13/14/15)
 *
 * Chaque icône PNG = 32×16 (4bpp) = 8 tiles 8×8 (256 o). 23 icônes → 5888 o.
 * L'anim décomp `ANIMCMD_FRAME(TYPE_X * 8)` indexe ce sheet → l'ordre DOIT
 * être exactement celui ci-dessous (= include/constants/pokemon.h TYPE_*).
 *
 * Réutilise le converter validé `extract-png-indexed-tiles.mjs` (parse IDAT,
 * préserve les indices PLTE, tile row-major) — zéro réimplémentation.
 *
 * Sortie :
 *   public/decomp/em/types/move_types.4bpp.bin   (5888 o)
 *   public/decomp/em/types/move_types.gbapal     (48 couleurs RGB15 = 96 o)
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECOMP = resolve(__dirname, '../../decomps/pokeemeraude/graphics/types');
const OUTDIR = resolve(__dirname, '../public/decomp/em/types');
const CONV = resolve(__dirname, 'extract-png-indexed-tiles.mjs');
const TMP = resolve(OUTDIR, '_tmp_type.4bpp.bin');

// 1:1 ORDRE enum TYPE_* (graphics_file_rules.mk:16-17). NE PAS réordonner.
const ORDER = [
  'normal', 'fight', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost',
  'steel', 'mystery', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice',
  'dragon', 'dark',
  'contest_cool', 'contest_beauty', 'contest_cute', 'contest_smart', 'contest_tough',
];

mkdirSync(OUTDIR, { recursive: true });

// ── gfx : concat des 23 icônes 4bpp dans l'ordre ─────────────────────────────
const parts = [];
for (const name of ORDER) {
  const png = resolve(DECOMP, `${name}.png`);
  if (!existsSync(png)) { console.error(`[extract-move-types] MANQUANT: ${png}`); process.exit(1); }
  execSync(`node "${CONV}" "${png}" "${TMP}" 4`, { stdio: 'pipe' });
  const bin = readFileSync(TMP);
  if (bin.length !== 256) {
    console.warn(`[extract-move-types] ${name}: ${bin.length} o (attendu 256 = 32×16 4bpp)`);
  }
  parts.push(bin);
}
const gfx = Buffer.concat(parts);
const GFX_OUT = resolve(OUTDIR, 'move_types.4bpp.bin');
writeFileSync(GFX_OUT, gfx);
rmSync(TMP, { force: true });
console.log(`[extract-move-types] gfx → ${GFX_OUT} (${gfx.length} o, ${ORDER.length} icônes)`);

// ── palette : 3 JASC .pal décomp → RGB15 binaire concat (48 couleurs) ────────
function jascToRgb15(file) {
  const txt = readFileSync(file, 'utf8').split(/\r?\n/).filter(s => s.trim());
  // ligne0 JASC-PAL, ligne1 0100, ligne2 count, lignes 3+ "R G B"
  const count = parseInt(txt[2], 10);
  const out = Buffer.alloc(count * 2);
  for (let i = 0; i < count; i++) {
    const [r, g, b] = txt[3 + i].trim().split(/\s+/).map(Number);
    const v = ((r >> 3) & 31) | (((g >> 3) & 31) << 5) | (((b >> 3) & 31) << 10);
    out.writeUInt16LE(v, i * 2);
  }
  return out;
}
const palParts = [];
for (const n of [1, 2, 3]) {
  const f = resolve(DECOMP, `move_types_${n}.pal`);
  if (!existsSync(f)) { console.error(`[extract-move-types] MANQUANT: ${f}`); process.exit(1); }
  palParts.push(jascToRgb15(f));
}
const pal = Buffer.concat(palParts);
const PAL_OUT = resolve(OUTDIR, 'move_types.gbapal');
writeFileSync(PAL_OUT, pal);
console.log(`[extract-move-types] pal → ${PAL_OUT} (${pal.length} o = ${pal.length / 2} couleurs)`);
