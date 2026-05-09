#!/usr/bin/env node
/**
 * extract-all-tile-bins.mjs
 *
 * Re-extrait tous les PNG critiques en .4bpp.bin ou .8bpp.bin via parse IDAT
 * direct (= préserve les indices palette originaux, pas de fold via RGBA canvas).
 *
 * Usage : node scripts/extract-all-tile-bins.mjs
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const SCRIPT = path.resolve('scripts/extract-png-indexed-tiles.mjs');
const PALETTE_SCRIPT = path.resolve('scripts/extract-png-palette.mjs');
const PUBLIC = 'public/decomp/em';
const DECOMP_GRAPHICS = '../decomps/pokeemeraude/graphics';

// Chaque entrée : { src: png path, bpp: 4|8 }
const targets = [
  // Title screen
  { src: `${PUBLIC}/boot/title_screen/rayquaza.png`, bpp: 4 },
  { src: `${PUBLIC}/boot/title_screen/clouds.png`, bpp: 4 },
  { src: `${PUBLIC}/boot/title_screen/pokemon_logo.png`, bpp: 8 },
  { src: `${PUBLIC}/boot/title_screen/emerald_version.png`, bpp: 8 },
  { src: `${PUBLIC}/boot/title_screen/press_start.png`, bpp: 4 },
  { src: `${PUBLIC}/boot/title_screen/logo_shine.png`, bpp: 4 },
  // Intro Scene 1
  { src: `${PUBLIC}/intro/scene_1/bg.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_1/drops_logo.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_1/flygon.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_1/sparkle.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_1/lati.png`, bpp: 4 },
  // Intro Scene 2
  { src: `${PUBLIC}/intro/scene_2/bicycle.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/brendan.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/may.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/clouds.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/clouds_bg.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/flygon.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/grass.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/houses.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/house_silhouette.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/manectric.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/torchic.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/trees.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/trees_small.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/volbeat.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/latias.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_2/latios.png`, bpp: 4 },
  // Intro Scene 3
  { src: `${PUBLIC}/intro/scene_3/groudon.png`, bpp: 8 },
  { src: `${PUBLIC}/intro/scene_3/kyogre.png`, bpp: 8 },
  { src: `${PUBLIC}/intro/scene_3/rayquaza.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_3/rayquaza_clouds.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_3/lightning.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_3/clouds.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_3/bubbles.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_3/streaks.png`, bpp: 4 },
  { src: `${PUBLIC}/intro/scene_3/pokeball.png`, bpp: 8 },
  { src: `${PUBLIC}/intro/scene_3/misc.png`, bpp: 4 },
  // Birch speech (sBirchSpeechShadowGfx + sBirchSpeechBirchSpriteGfx)
  { src: `${PUBLIC}/birch_speech/shadow.png`, bpp: 4 },
  { src: `${PUBLIC}/birch_speech/birch.png`, bpp: 4 },
  // Trainer front pics (FacilityClassToPicIndex → CreateTrainerSprite)
  { src: `${PUBLIC}/trainer_pics/brendan.png`, bpp: 4 },
  { src: `${PUBLIC}/trainer_pics/may.png`, bpp: 4 },
  // Lotad front pic (NewGameBirchSpeech_CreateLotadSprite via CreateMonPicSprite_Affine)
  { src: `${PUBLIC}/pokemon/lotad/front.png`, bpp: 4 },
  // Dialog box frame tiles (gMessageBox_Gfx + gMessageBox_Pal — utilisé partout dans le jeu)
  { src: `${PUBLIC}/text_window/message_box.png`, bpp: 4 },
  // Pokeball release sprite (Birch Lotad release scene + battle pokemon release)
  { src: `${PUBLIC}/balls/poke.png`, bpp: 4 },
  { src: `${PUBLIC}/balls/open.png`, bpp: 4 },
  // Phase 5.1 — ChooseStarter Birch BG (= 32-color palette via 2 sub-palettes,
  // bloquait loadIndexedPng strict avant). bpp:4 + extractPalette:true génère
  // tiles.4bpp.bin + tiles.gbapal pour LoadPalette(BG_PLTT_ID(0), 64 bytes).
  { src: `${PUBLIC}/starter_choose/tiles.png`, bpp: 4, extractPalette: true },
];

// Phase 5.1 — Tilemaps copiés direct depuis le décomp source (= raw uncompressed
// .bin files). Le décomp ROM utilise `.bin.lz` LZ77-compressed, mais nos source
// files sont uncompressed → direct VRAM write OK.
const TILEMAP_COPIES = [
  { src: `${DECOMP_GRAPHICS}/starter_choose/birch_bag.bin`,   dst: `${PUBLIC}/starter_choose/birch_bag.bin` },
  { src: `${DECOMP_GRAPHICS}/starter_choose/birch_grass.bin`, dst: `${PUBLIC}/starter_choose/birch_grass.bin` },
];

let success = 0, fail = 0;
for (const target of targets) {
  const { src, bpp, extractPalette } = target;
  if (!fs.existsSync(src)) {
    console.warn(`[extract-all-tile-bins] skip (not found): ${src}`);
    continue;
  }
  const out = src.replace(/\.png$/, `.${bpp}bpp.bin`);
  try {
    execSync(`node "${SCRIPT}" "${src}" "${out}" ${bpp}`, { stdio: 'pipe', encoding: 'utf8' });
    success++;
  } catch (e) {
    console.warn(`[extract-all-tile-bins] FAIL ${src}: ${e.stderr || e.message}`);
    fail++;
  }
  // Phase 5.1 — pour les BG scenes avec sub-palettes (PLTE > 16 colors), aussi
  // extract la palette en .gbapal pour LoadPalette runtime.
  if (extractPalette) {
    const palOut = src.replace(/\.png$/, '.gbapal');
    try {
      execSync(`node "${PALETTE_SCRIPT}" "${src}" "${palOut}"`, { stdio: 'pipe', encoding: 'utf8' });
    } catch (e) {
      console.warn(`[extract-all-tile-bins] palette FAIL ${src}: ${e.stderr || e.message}`);
      fail++;
    }
  }
}

// Phase 5.1 — copy raw tilemaps from decomp source (= uncompressed .bin files).
for (const { src, dst } of TILEMAP_COPIES) {
  if (!fs.existsSync(src)) {
    console.warn(`[extract-all-tile-bins] tilemap copy skip (not found): ${src}`);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  success++;
}

console.log(`[extract-all-tile-bins] done: ${success} OK, ${fail} failed.`);
