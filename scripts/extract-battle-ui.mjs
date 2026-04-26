#!/usr/bin/env node
/**
 * Copie les assets UI battle décomp vers `public/decomp/em/battle_interface/`.
 *
 * Source : `D:/Projet 1/decomps/pokeemeraude/graphics/battle_interface/`.
 * Format : PNG 4bpp indexed (colorType=3), palette intégrée → Phaser charge direct.
 *
 * Sprites copiés (singles seulement pour MVP — doubles plus tard) :
 *   - healthbox_singles_opponent.png  (128×32, atlas 2 frames)
 *   - healthbox_singles_player.png    (64×128, atlas 4 frames vertical)
 *   - hpbar.png                       (96×8, atlas barre)
 *   - textbox.png                     (128×128, atlas tiles 8×8 pour 9-slice)
 *   - numbers1.png / numbers2.png     (88×8 / 96×8, chiffres HP/level)
 *   - status.png                      (24×40, icônes PSN/PAR/BRN/FRZ/SLP)
 *   - ball_display.png + ball_status_bar.png  (party balls)
 *   - level_up_banner.png             (montée niveau)
 *
 * Cf. AUDIT du 2026-04-26 (BattleScene 1:1 GBA, gen3 Showdown engine).
 */
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDir = join(decompPath, 'graphics', 'battle_interface');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'battle_interface');

mkdirSync(outDir, { recursive: true });

const KEEP = [
  'healthbox_singles_opponent.png',
  'healthbox_singles_player.png',
  'hpbar.png',
  'hpbar_anim.png',
  'textbox.png',
  'textbox_map.bin',
  'numbers1.png',
  'numbers2.png',
  'status.png',
  'status2.png',
  'status3.png',
  'status4.png',
  'ball_display.png',
  'ball_status_bar.png',
  'ball_caught_indicator.png',
  'level_up_banner.png',
  'expbar.png',
  'enemy_mon_shadow.png',
  'misc.png',
  'misc_frameend.png',
];

let copied = 0, skipped = 0;
for (const f of KEEP) {
  try {
    copyFileSync(join(srcDir, f), join(outDir, f));
    copied++;
  } catch (e) {
    console.warn(`[skip] ${f}: ${e.code || e.message}`);
    skipped++;
  }
}

// Aussi : les palettes (peuvent servir si on doit repigmenter au runtime)
for (const f of readdirSync(srcDir)) {
  if (f.endsWith('.pal')) {
    copyFileSync(join(srcDir, f), join(outDir, f));
    copied++;
  }
}

console.log(`[extract-battle-ui] ${copied} fichiers copiés (${skipped} skippés)`);
console.log(`  → ${outDir}`);
