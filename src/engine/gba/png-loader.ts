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

/**
 * FIX RACINE SYSTÉMIQUE (2026-05-17) — fetch d'un asset binaire en rejetant le
 * fallback SPA du dev server.
 *
 * Quand un fichier n'existe pas, le serveur Vite (et la plupart des hôtes SPA)
 * renvoie `index.html` avec **status 200** + content-type `text/html`. Tous nos
 * loaders binaires faisaient `if (!resp.ok) throw` — donc `resp.ok` était TRUE
 * et ils interprétaient `<!DOCTYPE html>...` comme tile data / tilemap / palette
 * → garbage silencieux (textbox rouge/bleu, palettes fausses, tilemaps cassés).
 *
 * Ce helper centralise le garde-fou : rejette si !ok, si content-type HTML, ou
 * si le body commence par '<' (sniff, BOM-safe). Message d'erreur explicite =
 * le fichier manquant est visible (plus de garbage muet). Les loaders avec un
 * fallback légitime (loadTileBin → PNG) catchent cette exception.
 */
export async function fetchAssetArrayBuffer(url: string): Promise<ArrayBuffer> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`[asset] fetch failed ${url} → HTTP ${resp.status}`);
  }
  const ct = resp.headers.get('content-type') || '';
  const buf = await resp.arrayBuffer();
  const b = new Uint8Array(buf);
  // Signal FIABLE = content-type text/html (le fallback SPA Vite sert
  // index.html avec ce content-type ; un vrai .bin est octet-stream).
  // BUG FIX nuages titre (régression) : l'ancien sniff `b[0] === 0x3C` était
  // un FAUX POSITIF — un tilemap .bin valide peut commencer par l'octet 60
  // (= '<', entrée tilemap u16 légitime, ex. clouds.bin = 60,224,61,224…).
  // Le sniff body doit matcher SPÉCIFIQUEMENT le doctype/tag HTML, pas '<' nu.
  let bodyLooksHtml = false;
  if (b.length >= 5) {
    let off = (b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) ? 3 : 0; // skip BOM UTF-8
    // décode ~16 premiers octets en ASCII, trim, lowercase
    let head = '';
    for (let i = off; i < Math.min(b.length, off + 16); i++) head += String.fromCharCode(b[i]);
    head = head.replace(/^\s+/, '').toLowerCase();
    bodyLooksHtml = head.startsWith('<!doctype html') || head.startsWith('<html');
  }
  const looksHtml = ct.includes('text/html') || bodyLooksHtml;
  if (looksHtml || b.length === 0) {
    throw new Error(
      `[asset] MANQUANT (fallback HTML du dev server) : ${url} ` +
      `— fichier non extrait. Voir scripts/extract-all-tile-bins.mjs / extract-decomp.`,
    );
  }
  return buf;
}

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
    // fetchAssetArrayBuffer rejette le fallback HTML Vite (= bug racine garbage
    // tiles). Le .4bpp.bin est le chemin 1:1 (= gbagfx décomp).
    const buf = await fetchAssetArrayBuffer(binUrl);
    return new Uint8Array(buf);
  } catch {/* .bin absent → fallback PNG indexé (= même indices via parse IDAT) */}
  console.warn(`[png-loader] ${binUrl} absent, fallback loadIndexedPngStrict (PNG indexé)`);
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
  // fetchAssetArrayBuffer : rejette le fallback HTML Vite (sinon le tilemap
  // serait des octets `<!DOCTYPE html>` interprétés en u16 → BG cassé).
  const buf = await fetchAssetArrayBuffer(url);
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
  // fetchAssetArrayBuffer : si le PNG manque, throw clair "MANQUANT" au lieu
  // de renvoyer null → "no PLTE chunk (not indexed)" trompeur en aval.
  const buf = await fetchAssetArrayBuffer(url);
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
 * Parse un PNG indexed (color type 3) et retourne les indices palette RAW
 * (= IDAT zlib-décompressé + défiltré), SANS passer par le canvas browser.
 *
 * Pourquoi : la voie canvas (drawImage + getImageData → reverse-lookup RGB→PLTE)
 * échoue sur les PNG multi-sub-palettes quand 2 sous-palettes ont des couleurs
 * RGB identiques (collision → mauvais index) ou quand le canvas resample/round
 * légèrement (→ index fallback transparent ou faux). Pour `status.png` (80-color
 * PLTE = 5 sous-pal), chaque status icon utilise raw {2,3,12+16*row} ; la voie
 * raw préserve l'index réel (→ %16 = {2,3,12} = 1:1 `status.4bpp` décomp), alors
 * que le canvas produisait un spread d'indices faux → "BRU bleu / couleurs status fausses".
 *
 * Supporte bitDepth 8 (1 byte/pixel) et 4 (nibbles). colorType 3 (indexed) only.
 * Retourne `indices[y*widthPx + x]` = index PLTE brut 0..255.
 */
export async function loadIndexedPngRawIndices(
  url: string,
): Promise<{ widthPx: number; heightPx: number; bitDepth: number; indices: Uint8Array }> {
  const buf = await fetchAssetArrayBuffer(url);
  const view = new Uint8Array(buf);
  if (view[0] !== 137 || view[1] !== 80) throw new Error(`not a PNG: ${url}`);
  let off = 8;
  let widthPx = 0, heightPx = 0, bitDepth = 0, colorType = -1;
  const idatParts: Uint8Array[] = [];
  while (off + 8 <= view.length) {
    const length = (view[off] * 0x1000000) + (view[off+1] << 16) + (view[off+2] << 8) + view[off+3];
    const type = String.fromCharCode(view[off+4], view[off+5], view[off+6], view[off+7]);
    const dataStart = off + 8;
    if (type === 'IHDR') {
      widthPx = (view[dataStart] * 0x1000000) + (view[dataStart+1] << 16) + (view[dataStart+2] << 8) + view[dataStart+3];
      heightPx = (view[dataStart+4] * 0x1000000) + (view[dataStart+5] << 16) + (view[dataStart+6] << 8) + view[dataStart+7];
      bitDepth = view[dataStart+8];
      colorType = view[dataStart+9];
    } else if (type === 'IDAT') {
      idatParts.push(view.subarray(dataStart, dataStart + length));
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + length;
  }
  if (colorType !== 3) throw new Error(`PNG ${url}: colorType ${colorType} not indexed (expected 3)`);
  if (bitDepth !== 8 && bitDepth !== 4) throw new Error(`PNG ${url}: bitDepth ${bitDepth} unsupported (expected 4/8)`);

  // Concat IDAT
  let totalLen = 0; for (const p of idatParts) totalLen += p.length;
  const idat = new Uint8Array(totalLen);
  { let w = 0; for (const part of idatParts) { idat.set(part, w); w += part.length; } }

  // Inflate (IDAT = zlib RFC 1950 = DecompressionStream 'deflate').
  const inflatedBuf = await new Response(
    new Response(idat).body!.pipeThrough(new DecompressionStream('deflate')),
  ).arrayBuffer();
  const raw = new Uint8Array(inflatedBuf);

  // Défiltrage scanlines (PNG filter types 0..4 ; unité = 1 byte pour bitDepth ≤ 8).
  const rowBytes = Math.ceil(widthPx * bitDepth / 8);
  const out = new Uint8Array(heightPx * rowBytes);
  const bpp = 1;
  let p = 0;
  for (let y = 0; y < heightPx; y++) {
    const filter = raw[p++];
    for (let x = 0; x < rowBytes; x++) {
      const rb = raw[p++];
      const a = x >= bpp ? out[y*rowBytes + x - bpp] : 0;
      const b = y > 0 ? out[(y-1)*rowBytes + x] : 0;
      const c = (x >= bpp && y > 0) ? out[(y-1)*rowBytes + x - bpp] : 0;
      let v: number;
      if (filter === 0) v = rb;
      else if (filter === 1) v = rb + a;
      else if (filter === 2) v = rb + b;
      else if (filter === 3) v = rb + ((a + b) >> 1);
      else { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2*c); v = rb + ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)); }
      out[y*rowBytes + x] = v & 0xFF;
    }
  }

  // Extraction index par pixel.
  const indices = new Uint8Array(widthPx * heightPx);
  for (let y = 0; y < heightPx; y++) {
    for (let x = 0; x < widthPx; x++) {
      let v: number;
      if (bitDepth === 8) v = out[y*rowBytes + x];
      else { const byteVal = out[y*rowBytes + (x >> 1)]; v = (x & 1) ? (byteVal & 0xF) : (byteVal >> 4); }
      indices[y*widthPx + x] = v;
    }
  }
  return { widthPx, heightPx, bitDepth, indices };
}

/**
 * Variante "strict" : utilise le PLTE PNG embedded comme palette canonique.
 * Garantit que les indices résultants matchent l'ordre PLTE original (= ce que
 * le décomp gbagfx produit dans les .4bpp.lz).
 *
 * Pour 4bpp : tronque à 16 premières entries du PLTE (= 1 sub-palette).
 *   ⚠️ Si le PNG a une PLTE > 16 entries (= multi-sub-palettes serialized comme
 *   `gPartyMenuBg_Pal` 176 entries = 11 sub-pals), seules les 16 premières
 *   sont retournées. Les pixels avec indices > 15 (= sub-pal 1+) tombent à
 *   transparent. Pour ces assets multi-sub-pal :
 *     - Charge le `.4bpp.bin` via `loadTileBin` (= raw IDAT indices 0-15
 *       préservés, paletteNum dans le tilemap entry).
 *     - Charge la palette full via `loadGbaPal` sur le `.gbapal` sibling.
 *   Cf. party-screen.ts ou starter-choose-flow.ts pour le pattern validé.
 *
 * Pour 8bpp : tronque à 256 premières entries (= max d'un PNG indexed).
 *
 * Use case : sprites multi-palette (drops_logo.png) où le sprite est rendu avec
 * une palette différente (drops.pal vs logo.pal) selon le tileId — il faut que
 * les indices du tile data correspondent aux positions canoniques.
 */
export async function loadIndexedPngStrict(url: string, bpp: 4 | 8 = 4): Promise<LoadedPng> {
  // 1. Extract PLTE pour avoir la palette canonique du PNG
  const fullPlte = await extractPngPlte(url);
  if (!fullPlte) throw new Error(`PNG ${url} : no PLTE chunk (not indexed)`);
  // Pour 4bpp on prend les 16 premières entries (= ce qu'un PNG 4-bit utilise réellement
  // = sub-pal 0 only; pour multi-sub-pal, voir doc ci-dessus + loadGbaPal).
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
  const buf = await fetchAssetArrayBuffer(url);
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
  // fetchAssetArrayBuffer : rejette le fallback HTML Vite (sinon une palette
  // serait des octets HTML lus en RGB15 → couleurs fausses partout).
  const buf = await fetchAssetArrayBuffer(url);
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
