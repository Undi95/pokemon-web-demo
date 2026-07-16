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
import { type AffineMatrix, type BgConfig, type TilePixels, SCREEN_W } from './types';
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
 *  Numeric key (= évite alloc string par pixel) :
 *    bits 0-9   : tileId (0-1023)
 *    bit  10    : flipH
 *    bit  11    : flipV
 *    bit  12    : paletteMode (0=4bpp, 1=8bpp)
 *  Map<number,...> car tileId max ~1023 mais avec flips/mode peut atteindre ~8K. */
type TileCache = Map<number, TilePixels>;

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
  // Positive modulo : JS `%` retourne negative pour operande negative.
  // Pour hofs/vofs négatifs (= scroll right/down), on doit wrap proprement.
  // Sans ça, vx/vy négatif → tileX/tileY négatif → mapIdx wrong row → ticks edge.
  const vy = ((scanline + config.vofs) % screenHPx + screenHPx) % screenHPx;
  const tileSizeBytes = config.paletteMode === 0 ? 32 : 64;

  for (let x = 0; x < SCREEN_W; x++) {
    const vx = ((x + config.hofs) % screenWPx + screenWPx) % screenWPx;
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

    const rawEntry = tilemap[mapIdx];
    // Inline decodeBgMapEntry (= évite alloc object par pixel = 38400/frame).
    const tileId = rawEntry & 0x3FF;
    const flipH = (rawEntry & 0x400) !== 0;
    const flipV = (rawEntry & 0x800) !== 0;
    const paletteBank = (rawEntry >> 12) & 0xF;

    // Décodage tile (avec cache numeric key = évite alloc string par pixel).
    // Key = tileId | flipH<<10 | flipV<<11 | paletteMode<<12.
    const cacheKey = tileId
      | ((flipH ? 1 : 0) << 10)
      | ((flipV ? 1 : 0) << 11)
      | (config.paletteMode << 12);
    let tilePixels = tileCache.get(cacheKey);
    if (!tilePixels) {
      tilePixels = config.paletteMode === 0
        ? decodeTile4bpp(vram256, tileId, flipH, flipV)
        : decodeTile8bpp(vram256, tileId, flipH, flipV);
      tileCache.set(cacheKey, tilePixels);
    }

    const colorIdx = tilePixels[subY * 8 + subX];
    // Hot path : write RGBA direct dans `out` (= évite alloc array intermédiaire).
    palette.writeBgRgbaTo(paletteBank, colorIdx, config.paletteMode, out, x * 4);

    // Évite warning unused (tileSizeBytes)
    void tileSizeBytes;
  }
}

/** Crée un cache de tiles vide. À reset si vram ou palette change drastiquement. */
export function createTileCache(): TileCache {
  return new Map();
}

// ─── Affine BG renderer (BG2/BG3 en mode 1/2 GBA) ───────────────────────────

/** Tailles affine BG en TILES (différent de text BG). */
const AFFINE_SCREEN_TILES: Record<0 | 1 | 2 | 3, number> = {
  0: 16,    // 16×16 tiles  (128×128 px)
  1: 32,    // 32×32 tiles  (256×256 px)
  2: 64,    // 64×64 tiles  (512×512 px)
  3: 128,   // 128×128 tiles (1024×1024 px)
};

/**
 * Render une scanline d'un BG affine (BG2/BG3).
 *
 * Affine BG specs (1:1 GBATEK "LCD VRAM BG Screen Data / Character Data" +
 * "BG Rotation/Scaling") :
 *   - Tilemap = 1 byte par tile (« one byte per tile » : tile number 0-255,
 *     PAS de flip flags ni palette bank — contrairement au texte u16)
 *   - Toujours 8bpp (« rotation/scaling BG : 256 colors ») — palette BG complète
 *   - Sizes (BGxCNT bits 14-15) : 0=128×128 px (16×16 tiles), 1=256×256,
 *     2=512×512, 3=1024×1024
 *   - Overflow (BGxCNT bit 13, « Display Area Overflow ») : wraparound si set,
 *     sinon transparent hors zone
 *
 * Modèle GBATEK « Internal Reference Point Registers » : refX/refY reçus ici
 * sont le POINT INTERNE de CETTE scanline (28.8), maintenu par composeFrame
 * (rechargé depuis BG2X/Y au début de frame + à chaque écriture, avancé de
 * (PB, PD) après chaque scanline). Le long de la ligne, le point avance de
 * (PA, PC) par pixel — d'où, pour le pixel écran sx :
 *   texX = (refX + pa × sx) >> 8       // 28.8 → texel (troncature hardware)
 *   texY = (refY + pc × sx) >> 8
 * (PB/PD ne participent PLUS ici : leur avance verticale est DANS refX/refY.)
 */
export function renderBgAffineScanline(
  config: BgConfig,
  matrix: AffineMatrix,
  refX: number,            // point interne X de la scanline (28.8 signé)
  refY: number,            // point interne Y de la scanline (28.8 signé)
  vram256: Uint8Array,
  tilemap: Uint16Array,    // utilisé en u8 implicite (lit tilemap[i] & 0xFF)
  palette: PaletteBanks,
  out: Uint8ClampedArray,
  tileCache: TileCache,
): void {
  if (!config.visible) {
    out.fill(0);
    return;
  }

  const screenTiles = AFFINE_SCREEN_TILES[config.screenSize];
  const screenSizePx = screenTiles * 8;

  // Sign-extend matrix elements (= s16 GBA hardware mais stockés u16 chez nous).
  // Without : matrix.pa = 65470 lu comme +65470 au lieu de -66 → texX explose.
  const pa = matrix.pa > 0x7FFF ? matrix.pa - 0x10000 : matrix.pa;
  const pc = matrix.pc > 0x7FFF ? matrix.pc - 0x10000 : matrix.pc;

  for (let sx = 0; sx < SCREEN_W; sx++) {
    // Apply matrix : (texX, texY) en 28.8 fixed → integer texel via >> 8
    // (shift arithmétique = troncature vers −∞, identique au hardware qui prend
    // les bits entiers du compteur 28.8 — GBATEK « fractional portion ignored »).
    let texX = (refX + pa * sx) >> 8;
    let texY = (refY + pc * sx) >> 8;

    // Wrap or clip
    if (config.wraparound) {
      texX = ((texX % screenSizePx) + screenSizePx) % screenSizePx;
      texY = ((texY % screenSizePx) + screenSizePx) % screenSizePx;
    } else {
      if (texX < 0 || texX >= screenSizePx || texY < 0 || texY >= screenSizePx) {
        out[sx * 4 + 3] = 0;  // transparent (BG transparent comme tile vide)
        continue;
      }
    }

    const tileX = (texX / 8) | 0;
    const tileY = (texY / 8) | 0;
    const subX = texX % 8;
    const subY = texY % 8;
    const mapIdx = tileY * screenTiles + tileX;

    if (mapIdx >= tilemap.length) {
      out[sx * 4 + 3] = 0;
      continue;
    }

    // Affine tilemap = u8 par entry. Notre Uint16Array view stocke 1 u8 par u16
    // (loadAffineTilemapBin a expandé). Lit le low byte (high = 0 garanti).
    const tileId = tilemap[mapIdx] & 0xFF;

    // Décode tile 8bpp (cache).
    // Affine tiles are u8 ; encode "affine" namespace via high bit (= 1<<16)
    // pour ne pas collide avec le cache des tiles régulières du même cache
    // numeric. TileCache.key type = number.
    const cacheKey = tileId | (1 << 16);
    let tilePixels = tileCache.get(cacheKey);
    if (!tilePixels) {
      tilePixels = decodeTile8bpp(vram256, tileId, false, false);
      tileCache.set(cacheKey, tilePixels);
    }

    const colorIdx = tilePixels[subY * 8 + subX];
    // Palette BG bank ignorée en 8bpp (paletteMode=1 implicit). Hot path :
    // writeBgRgbaTo (même plomberie que renderBgScanline:132 — pas d'alloc/px ;
    // idx 0 → alpha 0 = transparent, identique à l'ancien getBgRgba).
    palette.writeBgRgbaTo(0, colorIdx, 1, out, sx * 4);
  }
}
