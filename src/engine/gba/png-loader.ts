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
 * Charge un .4bpp.bin ou .8bpp.bin pré-extrait via scripts/extract-png-indexed-tiles.mjs.
 *
 * Ces fichiers parsent l'IDAT PNG directement (= raw indices) → préservent
 * les indices palette originaux même quand la PLTE a des couleurs duplicates
 * (= cas Rayquaza marking idx 15 vs body idx 11 qui ont même RGB(0,74,98)),
 * ou quand le canvas browser resample slightly off (= cas naming screen
 * sprite tile data corruption / "rainbow stripes").
 *
 * Fallback : si le .bin n'existe pas, retombe sur la conversion canvas-based
 * via loadIndexedPngStrict (= remap indices, may be wrong pour duplicates).
 *
 * Foundation : utilisée par intro-asset-loader, naming-screen-impl, et toute
 * scène qui charge des sprite sheets.
 */
export async function loadTileBin(url: string, bpp: 4 | 8): Promise<Uint8Array> {
  const binUrl = url.replace(/\.png$/, `.${bpp}bpp.bin`);
  try {
    const resp = await fetch(binUrl);
    if (resp.ok) {
      const buf = await resp.arrayBuffer();
      return new Uint8Array(buf);
    }
  } catch {/* fall through */}
  console.warn(`[png-loader] no ${binUrl}, fallback PNG canvas extraction (may corrupt indices)`);
  const png = await loadIndexedPngStrict(url, bpp);
  return png.charData;
}

/**
 * Variante 8bpp avec palette canonique (256 colors max).
 * Pour les BG affine GBA qui sont obligatoirement 8bpp.
 * Pack 1 byte par pixel (pas de nibbles), 64 bytes par tile 8×8.
 */
export async function loadIndexedPng8bppWithPal(
  url: string,
  canonicalPalette: Uint16Array,
  transparentIndex: number = 0,
): Promise<LoadedPng> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error(`PNG load failed: ${url}: ${e}`));
    el.src = url;
  });

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
    throw new Error(`PNG ${url} dims must be multiples of 8 (got ${widthPx}×${heightPx})`);
  }
  const widthTiles = widthPx / 8;
  const heightTiles = heightPx / 8;

  // Reverse lookup palette ("first insert wins" pour duplicates, cf. loadIndexedPngWithPal)
  const palLookup = new Map<number, number>();
  for (let i = 0; i < canonicalPalette.length; i++) {
    const key = canonicalPalette[i];
    if (!palLookup.has(key)) palLookup.set(key, i);
  }

  // Map pixels (8bpp = 1 byte par pixel, idx 0-255)
  const idxMap = new Uint8Array(widthPx * heightPx);
  let unmappedCount = 0;
  for (let i = 0; i < widthPx * heightPx; i++) {
    const off = i * 4;
    const a = data[off + 3];
    if (a < 128) { idxMap[i] = transparentIndex; continue; }
    const r = data[off], g = data[off + 1], b = data[off + 2];
    const rgb15 = rgba8ToRgb15(r, g, b);
    const idx = palLookup.get(rgb15);
    if (idx === undefined) {
      unmappedCount++;
      idxMap[i] = transparentIndex;  // fallback transparent au lieu de throw
      continue;
    }
    idxMap[i] = idx;
  }
  if (unmappedCount > 0) {
    console.warn(`[png-loader] ${url}: ${unmappedCount} pixels unmapped (mapped to transparent)`);
  }

  // Pack 8bpp char data : 64 bytes par tile (8 rows × 8 cols × 1 byte)
  const charData = new Uint8Array(widthTiles * heightTiles * 64);
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileIdx = ty * widthTiles + tx;
      const tileBase = tileIdx * 64;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          charData[tileBase + row * 8 + col] =
            idxMap[(ty * 8 + row) * widthPx + (tx * 8 + col)];
        }
      }
    }
  }

  return {
    charData,
    palette: canonicalPalette,
    widthPx, heightPx, widthTiles, heightTiles,
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

/**
 * Extrait le chunk PLTE d'un PNG indexed (raw bytes parse).
 * Retourne null si pas de PLTE chunk (PNG non-indexed).
 *
 * Format PNG : 8 bytes signature + chunks (length 4 + type 4 + data + CRC 4).
 * PLTE chunk = liste de RGB triplets (3 bytes par couleur).
 */
export async function extractPngPlte(url: string): Promise<Uint16Array | null> {
  const buf = await fetch(url).then(r => r.arrayBuffer());
  const view = new Uint8Array(buf);
  // PNG signature : 137 80 78 71 13 10 26 10
  if (view[0] !== 137 || view[1] !== 80) return null;
  let off = 8;
  while (off < view.length) {
    const length = (view[off] << 24) | (view[off+1] << 16) | (view[off+2] << 8) | view[off+3];
    const type = String.fromCharCode(view[off+4], view[off+5], view[off+6], view[off+7]);
    if (type === 'PLTE') {
      const numColors = length / 3;
      const palette = new Uint16Array(numColors);
      for (let i = 0; i < numColors; i++) {
        const r = view[off + 8 + i*3];
        const g = view[off + 8 + i*3 + 1];
        const b = view[off + 8 + i*3 + 2];
        palette[i] = rgba8ToRgb15(r, g, b);
      }
      return palette;
    }
    off += 12 + length;  // length(4) + type(4) + data + CRC(4)
  }
  return null;
}

/**
 * Variante "strict" : utilise le PLTE PNG embedded comme palette canonique.
 * Garantit que les indices résultants matchent l'ordre PLTE original (= ce que
 * le décomp gbagfx produit dans les .4bpp.lz).
 *
 * Pour 4bpp : tronque à 16 premières entries du PLTE (= ce qu'un PNG 4-bit utilise).
 *
 * Use case : sprites multi-palette (drops_logo.png) où le sprite est rendu avec
 * une palette différente (drops.pal vs logo.pal) selon le tileId — il faut que
 * les indices du tile data correspondent aux positions canoniques.
 */
export async function loadIndexedPngStrict(url: string, bpp: 4 | 8 = 4): Promise<LoadedPng> {
  // 1. Extract PLTE pour avoir la palette canonique du PNG
  const fullPlte = await extractPngPlte(url);
  if (!fullPlte) throw new Error(`PNG ${url} : no PLTE chunk (not indexed)`);
  // Pour 4bpp on prend les 16 premières entries (= ce que le PNG 4-bit utilise réellement)
  const canonicalPalette = bpp === 4 ? fullPlte.subarray(0, 16) : fullPlte.subarray(0, 256);

  // 2. Load + map en utilisant la fonction with-pal (qui a déjà first-insert-wins)
  if (bpp === 4) {
    return loadIndexedPngWithPal(url, canonicalPalette);
  } else {
    return loadIndexedPng8bppWithPal(url, canonicalPalette);
  }
}

/**
 * Variante affine : .bin = 1 byte par entry (tileId 0-255 sans flip ni palette bank).
 * Utilisé pour BG2/BG3 en mode affine (Mode 1/2 GBA).
 *
 * Notre engine BG.tilemap est Uint16Array → on étend chaque u8 source en u16
 * avec high byte=0. Le BG affine renderer ignore les bits 8-15 de chaque entry.
 */
export async function loadAffineTilemapBin(url: string): Promise<Uint16Array> {
  const buf = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`affine tilemap fetch failed: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  const u8 = new Uint8Array(buf);
  const u16 = new Uint16Array(u8.length);
  for (let i = 0; i < u8.length; i++) u16[i] = u8[i];
  return u16;
}

/**
 * Charge un fichier .pal (format JASC-PAL texte ASCII OU .gbapal binaire).
 *
 * JASC-PAL header : "JASC-PAL\r\n0100\r\n<count>\r\n<R G B>\r\n×count"
 * Le décomp utilise ce format pour ses palettes — c'est ce qui sort de
 * `gbagfx` (l'outil canonical de pokeemerald).
 *
 * Variante .gbapal binaire : raw u16 RGB15 little-endian (utilisée moins
 * souvent dans les PNG/PAL pairs du décomp source — c'est plutôt pour les
 * assets compilés en ROM).
 */
export async function loadGbaPal(url: string): Promise<Uint16Array> {
  const buf = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`pal fetch failed: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  // Heuristique : si commence par "JASC-PAL" (texte ASCII), parse texte.
  // Sinon raw binaire u16 RGB15.
  const view = new Uint8Array(buf);
  const isText = view[0] === 0x4A && view[1] === 0x41 && view[2] === 0x53 && view[3] === 0x43;  // "JASC"
  if (isText) {
    const text = new TextDecoder('ascii').decode(view);
    const lines = text.split(/\r?\n/);
    // ligne 0 = "JASC-PAL", ligne 1 = "0100", ligne 2 = count, lignes 3+ = "R G B"
    const count = parseInt(lines[2], 10);
    if (!Number.isFinite(count) || count < 1 || count > 256) {
      throw new Error(`pal ${url}: invalid count "${lines[2]}"`);
    }
    const palette = new Uint16Array(count);
    for (let i = 0; i < count; i++) {
      const parts = lines[3 + i].trim().split(/\s+/);
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      palette[i] = rgba8ToRgb15(r, g, b);
    }
    return palette;
  }
  // Raw binary
  if (buf.byteLength % 2 !== 0) {
    throw new Error(`pal ${url}: binary byte length not even (${buf.byteLength})`);
  }
  return new Uint16Array(buf);
}

/**
 * Variante de loadIndexedPng qui matche les pixels à une palette canonique
 * fournie (depuis un .pal). Garantit l'ordre des indices = ordre du .pal,
 * donc le tilemap (qui référence des palette banks) reste valide.
 *
 * Si une couleur du PNG n'est pas dans la pal → throw.
 *
 * @param canonicalPalette palette RGB15 canonique (depuis loadGbaPal)
 * @param transparentIndex index dans la pal traité comme transparent (default 0)
 */
export async function loadIndexedPngWithPal(
  url: string,
  canonicalPalette: Uint16Array,
  transparentIndex: number = 0,
): Promise<LoadedPng> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error(`PNG load failed: ${url}: ${e}`));
    el.src = url;
  });

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
    throw new Error(`PNG ${url} dims must be multiples of 8 (got ${widthPx}×${heightPx})`);
  }
  const widthTiles = widthPx / 8;
  const heightTiles = heightPx / 8;

  // Build reverse lookup (RGB15 → palette index) depuis canonicalPalette.
  // ⚠️ CRITIQUE : "first insert wins" pour les duplicates de couleurs.
  // Les palettes décomp ont souvent (0,0,0) à plusieurs indices (slots libres
  // intentionnels). Si on faisait Map.set toujours, get() retournerait le
  // dernier idx — du coup pixel noir → idx 12 (par ex), et avec un tilemap
  // qui dit bank 3, on lookup bg.pal[3*16+12] (mauvaise couleur) au lieu de
  // bg.pal[48] (la vraie cible noir). Bug reproductible : bg.png Scene 1.
  const palLookup = new Map<number, number>();
  for (let i = 0; i < canonicalPalette.length; i++) {
    const key = canonicalPalette[i];
    if (!palLookup.has(key)) palLookup.set(key, i);
  }

  // Map chaque pixel à son palette index canonique
  // Permissif : si une couleur n'est pas dans la pal, fallback à transparent
  // + warn (au lieu de throw, car PNG peut avoir des couleurs hors pal après
  // re-encodage RGB888 du browser et il faut tolérer).
  const idxMap = new Uint8Array(widthPx * heightPx);
  let unmappedCount = 0;
  for (let i = 0; i < widthPx * heightPx; i++) {
    const off = i * 4;
    const a = data[off + 3];
    if (a < 128) { idxMap[i] = transparentIndex; continue; }
    const r = data[off], g = data[off + 1], b = data[off + 2];
    const rgb15 = rgba8ToRgb15(r, g, b);
    const idx = palLookup.get(rgb15);
    if (idx === undefined) {
      unmappedCount++;
      idxMap[i] = transparentIndex;
      continue;
    }
    idxMap[i] = idx;
  }
  if (unmappedCount > 0) {
    console.warn(`[png-loader] ${url}: ${unmappedCount} pixels unmapped → transparent`);
  }

  // Pack 4bpp char data (idem loadIndexedPng)
  const charData = new Uint8Array(widthTiles * heightTiles * 32);
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileIdx = ty * widthTiles + tx;
      const tileBase = tileIdx * 32;
      for (let row = 0; row < 8; row++) {
        for (let pairCol = 0; pairCol < 4; pairCol++) {
          const px1 = idxMap[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2)];
          const px2 = idxMap[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2 + 1)];
          charData[tileBase + row * 4 + pairCol] = (px1 & 0xF) | ((px2 & 0xF) << 4);
        }
      }
    }
  }

  return {
    charData,
    palette: canonicalPalette,
    widthPx, heightPx, widthTiles, heightTiles,
  };
}
