/**
 * PNG indexed loader pour assets décomp GBA.
 *
 * Charge un PNG (indexed 4bpp ou 8bpp en théorie, mais le browser le décode
 * toujours en RGBA), reconstruit la palette par ordre d'apparition des couleurs
 * uniques (idx 0 = première couleur trouvée = transparent par convention),
 * et pack les pixels en char data 4bpp (32 bytes par tile 8×8).
 *
 * Limitations :
 *   - Si le PNG a > 16 couleurs uniques, échoue (4bpp = 16 max).
 *   - L'ordre des indices peut différer du PNG original (qui peut spécifier
 *     un palette explicit). Pour 1:1 strict, fournir `expectedPalette` qui
 *     remap les couleurs vers un ordre canonique.
 *
 * Pour le futur : extracteur Python `extract-intro-decoded.py` qui produit
 * directement `.4bpp.bin` + `.gbapal.bin` pré-formatés. Pour l'instant on
 * décode runtime.
 */
import { rgba8ToRgb15, type Rgb15 } from './types';

export interface LoadedPng {
  /** Tile data 4bpp packed. 32 bytes par tile, en row-major par tile (TL → BR). */
  charData: Uint8Array;
  /** Palette RGB15 (1 à 16 entries). Idx 0 = transparent. */
  palette: Uint16Array;
  /** Largeur en pixels. */
  widthPx: number;
  /** Hauteur en pixels. */
  heightPx: number;
  /** Largeur en tiles. */
  widthTiles: number;
  /** Hauteur en tiles. */
  heightTiles: number;
}

/**
 * Charge un PNG depuis URL et le décode en char data 4bpp + palette.
 *
 * @param url URL du PNG (ex: '/decomp/em/intro/copyright.png')
 * @param transparentRgb si fourni, force cette couleur RGBA888 → idx 0 (alpha 0).
 *                       Sinon, la première couleur trouvée devient idx 0.
 */
export async function loadIndexedPng(
  url: string,
  transparentRgb?: readonly [number, number, number],
): Promise<LoadedPng> {
  // 1. Load Image element (browser PNG decoder)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error(`PNG load failed: ${url}: ${e}`));
    el.src = url;
  });

  // 2. Draw to canvas for ImageData access
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error(`PNG load: failed to create canvas context for ${url}`);
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const widthPx = canvas.width;
  const heightPx = canvas.height;
  if (widthPx % 8 !== 0 || heightPx % 8 !== 0) {
    throw new Error(`PNG load: ${url} dims must be multiples of 8 (got ${widthPx}×${heightPx})`);
  }

  const widthTiles = widthPx / 8;
  const heightTiles = heightPx / 8;

  // 3. Build palette (max 16 unique colors). Map RGB → palette index.
  const palette: Rgb15[] = [];
  const colorMap = new Map<string, number>();

  // Si transparentRgb fourni, lock idx 0 à cette couleur
  if (transparentRgb) {
    const key = `${transparentRgb[0]},${transparentRgb[1]},${transparentRgb[2]}`;
    palette.push(rgba8ToRgb15(transparentRgb[0], transparentRgb[1], transparentRgb[2]));
    colorMap.set(key, 0);
  }

  // Chaque pixel : récupère son idx palette, ou ajoute si nouveau
  const idxMap = new Uint8Array(widthPx * heightPx);
  for (let i = 0; i < widthPx * heightPx; i++) {
    const off = i * 4;
    const r = data[off], g = data[off + 1], b = data[off + 2], a = data[off + 3];
    // Pixel transparent (alpha < 128) → idx 0 forcé
    if (a < 128) {
      // Si transparentRgb pas fourni, idx 0 devra être ajouté à la première
      // couleur tombée (peut être une vraie couleur). Cas d'usage : forcer
      // une couleur transparente explicite via transparentRgb.
      if (palette.length === 0) {
        palette.push(0); // RGB15 noir comme fallback
        colorMap.set('transparent', 0);
      }
      idxMap[i] = 0;
      continue;
    }
    const key = `${r},${g},${b}`;
    let idx = colorMap.get(key);
    if (idx === undefined) {
      if (palette.length >= 16) {
        throw new Error(`PNG load: ${url} has > 16 unique colors at pixel ${i} (${r},${g},${b})`);
      }
      idx = palette.length;
      palette.push(rgba8ToRgb15(r, g, b));
      colorMap.set(key, idx);
    }
    idxMap[i] = idx;
  }

  // 4. Pack en char data 4bpp tile-by-tile.
  //    Layout : tile 0 = top-left, lecture row-major par TILE (pas par pixel).
  //    Une tile = 32 bytes (8 rows × 4 bytes/row, low nibble = left pixel).
  const charData = new Uint8Array(widthTiles * heightTiles * 32);
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileIdx = ty * widthTiles + tx;
      const tileBaseOffset = tileIdx * 32;
      for (let row = 0; row < 8; row++) {
        for (let pairCol = 0; pairCol < 4; pairCol++) {
          const px1 = idxMap[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2)];
          const px2 = idxMap[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2 + 1)];
          // low nibble = px1 (left), high nibble = px2 (right)
          charData[tileBaseOffset + row * 4 + pairCol] = (px1 & 0xF) | ((px2 & 0xF) << 4);
        }
      }
    }
  }

  return {
    charData,
    palette: new Uint16Array(palette),
    widthPx,
    heightPx,
    widthTiles,
    heightTiles,
  };
}

/**
 * Fetch un .bin (raw bytes) → Uint16Array (pour tilemaps GBA).
 * Le .bin doit être en little-endian u16 (format GBA natif).
 */
export async function loadTilemapBin(url: string): Promise<Uint16Array> {
  const buf = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`tilemap fetch failed: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  // ArrayBuffer length must be even
  if (buf.byteLength % 2 !== 0) {
    throw new Error(`tilemap ${url} byte length not even (${buf.byteLength})`);
  }
  return new Uint16Array(buf);
}
