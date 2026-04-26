#!/usr/bin/env node
/**
 * Copie les assets de la cinématique d'intro Pokémon Émeraude.
 *
 * Source : `decomps/pokeemeraude/graphics/intro/`
 *   - copyright.png + copyright.bin
 *   - scene_1/  → GF logo + Flygon silhouette + pan-up
 *   - scene_2/  → vélo + Pokémon + parallax landscape
 *   - scene_3/  → combat Groudon/Kyogre → Rayquaza
 *
 * Sortie : `public/decomp/em/intro/<scene>/<file>`
 *
 * Pas de transformation : on copie les PNG/pal/bin tels quels (le rendu Phaser
 * compose à l'exécution, cf. règle "aucun pré-rendu").
 *
 * Cf. DEV_LOG session 34 (IntroScene), DECOMP_MAP.md section "Séquence boot".
 */
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const srcDir = resolve(projectRoot, '..', 'decomps', 'pokeemeraude', 'graphics', 'intro');
const dstDir = join(projectRoot, 'public', 'decomp', 'em', 'intro');

mkdirSync(dstDir, { recursive: true });

const ALLOWED_EXT = new Set(['.png', '.pal', '.bin']);
let copied = 0;

function copyDir(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const sp = join(src, entry.name);
    const dp = join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(sp, dp);
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) continue;
      copyFileSync(sp, dp);
      copied++;
    }
  }
}

if (!existsSync(srcDir)) {
  console.error('[intro] décomp introuvable :', srcDir);
  process.exit(1);
}
copyDir(srcDir, dstDir);
console.log(`[intro] ${copied} fichiers copiés vers ${dstDir.replace(projectRoot + '\\', '')}`);
