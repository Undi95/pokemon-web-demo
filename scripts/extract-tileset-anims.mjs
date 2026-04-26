#!/usr/bin/env node
/**
 * Extrait les métadonnées d'animations de tilesets depuis le décomp +
 * scanne `metatiles.bin` pour trouver quels metatiles utilisent les tile slots
 * animés (water, flower, etc.).
 *
 * Sortie : `public/decomp/em/tileset-anims.json`
 *   {
 *     general: {
 *       water: { vramStart: 432, numTiles: 30, frames: 8, periodFrames: 16, framesPath: "tilesets/primary/general/anim/water" },
 *       flower: { vramStart: 508, numTiles: 4, frames: 4, frameSeq: [0,1,0,2], periodFrames: 16, framesPath: "..." }
 *     },
 *     // Mapping metatileId → quelle anim affecte quels sub-tiles
 *     general_animated_metatiles: {
 *       "32": [{ animName: "water", subTileIdx: 0, vramTile: 432 }, ...],
 *       ...
 *     }
 *   }
 *
 * Cf. DECOMP_ORIGIN_FILES.md F. World/Map.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'tileset-anims.json');
mkdirSync(dirname(outPath), { recursive: true });

// ─── 1. Animations metadata pour le tileset 'general' (le plus utilisé) ──────
// Cf. src/tileset_anims.c TilesetAnim_General lines 632-644
//
// NOTE : on n'inclut QUE water + flower. sand_water_edge et waterfall sont
// désactivés car leurs tile slots (464-473, 496-501) sont utilisés dans des
// metatiles "edge" qui apparaissent loin de l'eau (bordures de chemin, etc.).
// Sans ces metatiles being naturellement adjacent à l'eau, l'animation se voit
// comme des "blobs jaunes/bleus" sur des chemins normaux.
// TODO : pour les ré-activer, croiser avec metatile_attributes pour ne garder
// que les metatiles avec MB_WATER ou similaire.
const generalAnims = {
  water: {
    vramStart: 432,
    numTiles: 30,
    frames: 8,
    framesPath: 'tilesets/primary/general/anim/water',
    periodMs: Math.round(16 / 60 * 1000), // 16 frames @ 60fps = 267ms
  },
  flower: {
    vramStart: 508,
    numTiles: 4,
    frames: 3,
    frameSeq: [0, 1, 0, 2], // cycle non-séquentiel cf. gTilesetAnims_General_Flower line 82
    framesPath: 'tilesets/primary/general/anim/flower',
    periodMs: Math.round(16 / 60 * 1000),
  },
};

// ─── 2. Parse metatiles.bin pour trouver les metatiles utilisant ces VRAM slots ────────
// Format metatiles.bin : 16 bytes par metatile = 4 sub-tiles × 4 bytes
//   chaque sub-tile = u16 tile attributes (10 bits tileId + flips + palette) + u16 ?
// En réalité c'est 8 bytes par metatile = 4 sub-tiles × u16 :
//   bits 0-9 = tile_id (0-1023)
//   bit 10 = flip_horiz
//   bit 11 = flip_vert
//   bits 12-15 = palette index
// + 8 bytes pour la layer du haut → 16 bytes total

function parseMetatilesBin(path) {
  const buf = readFileSync(path);
  const numMetatiles = buf.length / 16;
  const result = []; // result[metatileId] = { lower: [tileId,...×4], upper: [tileId,...×4] }
  for (let mt = 0; mt < numMetatiles; mt++) {
    const lower = [], upper = [];
    for (let i = 0; i < 4; i++) {
      const offsetLow = mt * 16 + i * 2;
      const offsetUp = mt * 16 + 8 + i * 2;
      const valLow = buf[offsetLow] | (buf[offsetLow + 1] << 8);
      const valUp = buf[offsetUp] | (buf[offsetUp + 1] << 8);
      lower.push(valLow & 0x3FF);
      upper.push(valUp & 0x3FF);
    }
    result.push({ lower, upper });
  }
  return result;
}

const metatilesBinPath = join(decompPath, 'data/tilesets/primary/general/metatiles.bin');
const generalMetatiles = parseMetatilesBin(metatilesBinPath);

// ─── 3. Scan : pour chaque metatile, trouve les sub-tiles dans les VRAM ranges animés ──
const animatedMetatiles = {};
for (let mtId = 0; mtId < generalMetatiles.length; mtId++) {
  const mt = generalMetatiles[mtId];
  const hits = [];
  for (let layer = 0; layer < 2; layer++) {
    const tiles = layer === 0 ? mt.lower : mt.upper;
    for (let subIdx = 0; subIdx < 4; subIdx++) {
      const tileId = tiles[subIdx];
      for (const [animName, anim] of Object.entries(generalAnims)) {
        if (tileId >= anim.vramStart && tileId < anim.vramStart + anim.numTiles) {
          hits.push({
            animName,
            layer: layer === 0 ? 'lower' : 'upper',
            subTileIdx: subIdx,         // 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
            vramTile: tileId,
            tileOffsetInAnim: tileId - anim.vramStart, // position in the animation's tile range
          });
        }
      }
    }
  }
  if (hits.length > 0) animatedMetatiles[mtId] = hits;
}

const out = {
  tilesets: { general: generalAnims },
  general_animated_metatiles: animatedMetatiles,
};

writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('[tileset-anims]', {
  general_metatile_count: generalMetatiles.length,
  animated_metatiles_count: Object.keys(animatedMetatiles).length,
  sample: Object.entries(animatedMetatiles).slice(0, 5).map(([id, hits]) => ({ id, hits: hits.length, anims: [...new Set(hits.map(h => h.animName))] })),
  output: outPath,
});
