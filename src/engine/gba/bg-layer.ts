/**
 * BG layer renderer 1:1 GBA hardware (Mode 0 text BG).
 *
 * Pour chaque scanline (0-159 visible) :
 *   1. Calcule la position virtuelle (vx, vy) = (x + hofs, scanline + vofs)
 *   2. Wrap selon screenSize (32×32 / 64×32 / 32×64 / 64×64 tiles)
 *   3. Lookup tilemap entry (u16) à la position virtuelle / 8
 *   4. Décode le tileId + flipH/V + paletteBank
 *   5. Lookup pixel dans la tile décodée
 *   6. Lookup palette → RGBA888
 *
 * Notre implémentation : on render la scanline complète (240 px) en RGBA8
 * dans un buffer scanline réutilisable. Le compositor combine ensuite les
 * 4 BG layers + OAM + blend par scanline.
 */
import { type BgConfig, type TilePixels, decodeBgMapEntry, SCREEN_W } from './types';
import { PaletteBanks } from './palette';
import { decodeTile4bpp, decodeTile8bpp } from './tile';

// Screen size dimensions en tiles
const SCREEN_TILES: Record<0 | 1 | 2 | 3, readonly [number, number]> = {
  0: [32, 32],
  1: [64, 32],
  2: [32, 64],
  3: [64, 64],
};

/** Cache de tiles décodées pour éviter de re-décoder à chaque pixel.
 *  Key = `${tileId}_${flipH ? 1 : 0}${flipV ? 1 : 0}_${paletteMode}`. */
type TileCache = Map<string, TilePixels>;

/**
 * Render une scanline d'un BG layer dans `out` (Uint8ClampedArray RGBA, 240×4 = 960 bytes).
 * `out` est SUR-écrit (pas de blend).
 *
 * @param scanline 0-159 (y absolu écran)
 * @param config layer config
 * @param vram256 char data (32 KB max, byte-addressable from char base)
 * @param tilemap u16 tilemap entries (32×32 / 64×32 / 32×64 / 64×64)
 * @param palette palette banks
 * @param out output buffer scanline RGBA (240 × 4 bytes)
 * @param tileCache cache des tiles décodées (réutilisé entre scanlines)
 */
export function renderBgScanline(
  scanline: number,
  config: BgConfig,
  vram256: Uint8Array,
  tilemap: Uint16Array,
  palette: PaletteBanks,
  out: Uint8ClampedArray,
  tileCache: TileCache,
): void {
  if (!config.visible) {
    out.fill(0); // tout transparent (alpha 0)
    return;
  }

  const [screenTilesW, screenTilesH] = SCREEN_TILES[config.screenSize];
  const screenWPx = screenTilesW * 8;
  const screenHPx = screenTilesH * 8;
  const vy = (scanline + config.vofs) % screenHPx;
  const tileSizeBytes = config.paletteMode === 0 ? 32 : 64;

  for (let x = 0; x < SCREEN_W; x++) {
    const vx = (x + config.hofs) % screenWPx;
    const tileX = Math.floor(vx / 8);
    const tileY = Math.floor(vy / 8);
    const subX = vx % 8;
    const subY = vy % 8;

    // Index dans le tilemap (screen-block layout 32×32 entries, multi-block pour 64×*)
    // GBA layout : 4 quadrants 32×32 entries, ordre TL → TR → BL → BR
    let mapIdx = 0;
    if (config.screenSize === 0) {
      mapIdx = tileY * 32 + tileX;
    } else if (config.screenSize === 1) {
      // 64×32 : 2 blocks horizontal (TL, TR)
      const block = (tileX >= 32) ? 1 : 0;
      const localX = tileX % 32;
      mapIdx = block * 1024 + tileY * 32 + localX;
    } else if (config.screenSize === 2) {
      // 32×64 : 2 blocks vertical (TL, BL)
      const block = (tileY >= 32) ? 1 : 0;
      const localY = tileY % 32;
      mapIdx = block * 1024 + localY * 32 + tileX;
    } else {
      // 64×64 : 4 quadrants
      const blockX = (tileX >= 32) ? 1 : 0;
      const blockY = (tileY >= 32) ? 1 : 0;
      const localX = tileX % 32;
      const localY = tileY % 32;
      const block = blockY * 2 + blockX;
      mapIdx = block * 1024 + localY * 32 + localX;
    }

    if (mapIdx >= tilemap.length) {
      out[x * 4 + 3] = 0;
      continue;
    }

    const entry = decodeBgMapEntry(tilemap[mapIdx]);

    // Décodage tile (avec cache)
    const cacheKey = `${entry.tileId}_${entry.flipH ? 1 : 0}${entry.flipV ? 1 : 0}_${config.paletteMode}`;
    let tilePixels = tileCache.get(cacheKey);
    if (!tilePixels) {
      tilePixels = config.paletteMode === 0
        ? decodeTile4bpp(vram256, entry.tileId, entry.flipH, entry.flipV)
        : decodeTile8bpp(vram256, entry.tileId, entry.flipH, entry.flipV);
      // Garde-fou : si tileId hors range, decodeTile retourne un buffer 0
      tileCache.set(cacheKey, tilePixels);
    }

    const colorIdx = tilePixels[subY * 8 + subX];
    const [r, g, b, a] = palette.getBgRgba(entry.paletteBank, colorIdx, config.paletteMode);
    const off = x * 4;
    out[off] = r;
    out[off + 1] = g;
    out[off + 2] = b;
    out[off + 3] = a;

    // Évite warning unused (cacheKey, tileSizeBytes)
    void tileSizeBytes;
  }
}

/** Crée un cache de tiles vide. À reset si vram ou palette change drastiquement. */
export function createTileCache(): TileCache {
  return new Map();
}
