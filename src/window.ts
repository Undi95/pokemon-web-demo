/**
 * gba-window-system.ts
 * --------------------
 * Couche d'adaptation window.c + bg.c pour le runtime décomp.
 * Maintient un tableau de fenêtres (pixel buffers) + métadonnées GBA,
 * et fournit CopyWindowToVram / PutWindowTilemap qui transfèrent vers
 * l'engine GBA hardware (VRAM + tilemap) pour rendu par le compositor.
 */
import { getRuntime, assetCache, LoadBgTiles } from '../harness/runtime/decomp-globals';
// ─── Struct window.c (Window pixel-buffer + primitives) ──────────────────────
// Rapatrié depuis gba-text-printer (dissolution MIRROR text.c Stage 2). Le struct
// + createWindow/scrollWindow/fillWindowPixelBuffer/Rect/copyWindowToCanvas sont
// du window.c (le renderer texte qui les CONSOMME vit dans src/text.ts).

export interface Window {
  /** Largeur en tiles (1 tile = 8 px). */
  widthTiles: number;
  /** Hauteur en tiles. */
  heightTiles: number;
  /** Largeur en pixels (= widthTiles * 8). */
  widthPx: number;
  /** Hauteur en pixels (= heightTiles * 8). */
  heightPx: number;
  /** Pixel buffer linéaire : 1 byte par pixel = idx 0-15 dans la palette. */
  pixelBuffer: Uint8Array;
  /** Index palette (0-15) à appliquer au copy. */
  paletteNum: number;
  /** Dirty flag — true si pixelBuffer modifié depuis dernier copy. */
  needsFlush: boolean;
}

export function createWindow(widthTiles: number, heightTiles: number, paletteNum = 15): Window {
  const widthPx = widthTiles * 8;
  const heightPx = heightTiles * 8;
  return {
    widthTiles,
    heightTiles,
    widthPx,
    heightPx,
    pixelBuffer: new Uint8Array(widthPx * heightPx),
    paletteNum,
    needsFlush: true,
  };
}

/** 1:1 décomp `window.c ScrollWindow(windowId, direction=0, distance, fillValue)`.
 *  Direction 0 = shift content UP (bottom rows filled with fillValue). Notre
 *  pixelBuffer est 1 byte/pixel ; le décomp opère sur tileData 4bpp packed mais
 *  sémantiquement pareil : shift up + fill bottom. */
export function scrollWindow(w: Window, deltaY: number, fillValue: number): void {
  const stride = w.widthPx;
  const height = w.heightPx;
  if (deltaY <= 0 || deltaY >= height) return;
  // Shift up : copy lignes [deltaY..height) → [0..height-deltaY)
  w.pixelBuffer.copyWithin(0, deltaY * stride, height * stride);
  // Fill lignes [height-deltaY..height) avec fillValue & 0xF (= idx palette).
  w.pixelBuffer.fill(fillValue & 0xF, (height - deltaY) * stride, height * stride);
  w.needsFlush = true;
}

/** 1:1 décomp `window.c FillWindowPixelBuffer` (low-level). */
export function fillWindowPixelBuffer(w: Window, idx: number): void {
  w.pixelBuffer.fill(idx & 0x0F);
  w.needsFlush = true;
}

/** 1:1 décomp `window.c FillWindowPixelRect`. */
export function fillWindowPixelRect(w: Window, idx: number, x: number, y: number, width: number, height: number): void {
  const v = idx & 0x0F;
  for (let py = 0; py < height; py++) {
    const rowY = y + py;
    if (rowY < 0 || rowY >= w.heightPx) continue;
    const rowStart = rowY * w.widthPx;
    for (let px = 0; px < width; px++) {
      const colX = x + px;
      if (colX < 0 || colX >= w.widthPx) continue;
      w.pixelBuffer[rowStart + colX] = v;
    }
  }
  w.needsFlush = true;
}

/**
 * Convertit le pixelBuffer (idx 0-15) en canvas RGBA via la palette runtime.
 * Idx 0 = transparent (alpha 0), autres = RGB depuis palette[idx].
 * Cf. décomp `CopyWindowToVram` (window.c:514) qui transfère tile-by-tile vers VRAM.
 */
export function copyWindowToCanvas(w: Window, palette: ReadonlyArray<readonly [number, number, number]>): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w.widthPx;
  canvas.height = w.heightPx;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(w.widthPx, w.heightPx);
  const data = imageData.data;
  for (let i = 0; i < w.pixelBuffer.length; i++) {
    const idx = w.pixelBuffer[i];
    const o = i * 4;
    if (idx === 0) {
      data[o + 3] = 0; // transparent
    } else {
      const c = palette[idx] ?? [255, 0, 255]; // magenta = palette miss visible
      data[o] = c[0];
      data[o + 1] = c[1];
      data[o + 2] = c[2];
      data[o + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  w.needsFlush = false;
  return canvas;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface BgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

interface GbaWindow {
  id: number;
  win: Window;
  template: WindowTemplate;
  tilemapDirty: boolean;
}

// ─── État global ─────────────────────────────────────────────────────────────

let gWindows: GbaWindow[] = [];
let nextWindowId = 0;

// ─── Utils VRAM / tilemap ────────────────────────────────────────────────────

/** Convertit un pixel buffer (1 byte/pixel, idx 0-15) en tiles 4bpp et écrit
 *  dans la VRAM du BG au offset baseBlock * 32. */
function copyPixelBufferToVram(
  win: Window,
  bgIdx: number,
  baseBlock: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const gba = rt.gba;
  const bgLayer = gba.bg(bgIdx as 0 | 1 | 2 | 3);
  const vram = bgLayer.vram;
  // 1:1 décomp : `LoadBgTiles` place à `(baseTile + destOffset) * 0x20` (bg.c:382). baseTile
  // sépare 2 BG partageant un charBase (easy_chat BG0/BG2 charBase 0, BG2 baseTile 0x80 →
  // le clavier n'écrase plus la boîte d'instructions WIN_MSG en VRAM). 0 partout ailleurs.
  const baseTile = bgLayer.config.baseTile ?? 0;
  const byteOffset = (baseTile + baseBlock) * 32;
  const widthTiles = win.widthTiles;
  const heightTiles = win.heightTiles;
  const buf = win.pixelBuffer;

  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileOffset = byteOffset + (ty * widthTiles + tx) * 32;
      if (tileOffset + 32 > vram.length) continue;

      for (let row = 0; row < 8; row++) {
        const srcY = ty * 8 + row;
        const srcRowStart = srcY * win.widthPx + tx * 8;
        const dstRowStart = tileOffset + row * 4;
        for (let col = 0; col < 4; col++) {
          const p0 = buf[srcRowStart + col * 2] & 0x0F;
          const p1 = buf[srcRowStart + col * 2 + 1] & 0x0F;
          vram[dstRowStart + col] = (p1 << 4) | p0;
        }
      }
    }
  }

  // Note : tile cache invalidation handled par compositor's per-frame clear
  // (= cf. composeFrame _tileCachesCache.clear()). Couvre tous les VRAM writes.

  win.needsFlush = false;
}

/** Écrit les entries tilemap pour une fenêtre. */
function writeWindowTilemap(win: GbaWindow, clear = false): void {
  const rt = getRuntime();
  if (!rt) return;
  const gba = rt.gba;
  const t = win.template;
  const bg = gba.bg(t.bg as 0 | 1 | 2 | 3);
  const tilemap = bg.tilemap;
  const screenSize = bg.config.screenSize;
  const paletteNum = t.paletteNum;
  // 1:1 décomp window.c:325 : le tilemap référence les tuiles à `baseTile + baseBlock + i`
  // (aligné avec le placement VRAM de copyPixelBufferToVram qui ajoute aussi baseTile).
  const baseBlock = (bg.config.baseTile ?? 0) + t.baseBlock;

  for (let ty = 0; ty < t.height; ty++) {
    for (let tx = 0; tx < t.width; tx++) {
      const tileX = t.tilemapLeft + tx;
      const tileY = t.tilemapTop + ty;
      const mapIdx = tileMapIndex(tileX, tileY, screenSize);
      if (mapIdx < 0 || mapIdx >= tilemap.length) continue;

      if (clear) {
        tilemap[mapIdx] = 0;
      } else {
        const tileId = baseBlock + ty * t.width + tx;
        tilemap[mapIdx] = tileId | (paletteNum << 12);
      }
    }
  }
}

/** Calcule l'index linéaire dans la tilemap selon screenSize (1:1 GBA). */
function tileMapIndex(tileX: number, tileY: number, screenSize: number): number {
  // Screen sizes: 0=32x32, 1=64x32, 2=32x64, 3=64x64
  // Layout: blocks de 32x32 entries en ordre TL, TR, BL, BR
  if (screenSize === 0) {
    return tileY * 32 + tileX;
  }
  if (screenSize === 1) {
    const block = tileX >= 32 ? 1 : 0;
    return block * 1024 + tileY * 32 + (tileX % 32);
  }
  if (screenSize === 2) {
    const block = tileY >= 32 ? 1 : 0;
    return block * 1024 + (tileY % 32) * 32 + tileX;
  }
  // 64x64
  const blockX = tileX >= 32 ? 1 : 0;
  const blockY = tileY >= 32 ? 1 : 0;
  const block = blockY * 2 + blockX;
  return block * 1024 + (tileY % 32) * 32 + (tileX % 32);
}

// ─── Window API ──────────────────────────────────────────────────────────────

/** 1:1 décomp `bool32 InitWindows(const struct WindowTemplate *templates)` :
 *  Clear all existing windows + alloc one window per template, returns array
 *  of allocated window IDs. Window IDs sont indexés sur l'ordre des templates.
 *
 *  Note décomp : la signature C retourne `bool32` (success/fail), notre TS
 *  retourne directement `number[]` (= IDs) — plus utile au caller. Si on a
 *  besoin du bool, vérifier `result.length === templates.length`. */
export function InitWindows(templates: readonly WindowTemplate[]): number[] {
  FreeAllWindowBuffers();
  const ids: number[] = [];
  for (const t of templates) {
    // 1:1 décomp window.c:51 — la boucle d'allocation s'arrête au premier
    // template avec `bg == 0xFF` (= DUMMY_WIN_TEMPLATE sentinelle de fin).
    if (t.bg === 0xFF) break;
    ids.push(AddWindow(t));
  }
  return ids;
}

/** 1:1 décomp `u16 GetWindowAttribute(u8 windowId, u8 attributeId)` (window.c).
 *  attributeId = enum window.h:8-17 (WINDOW_BG=0, WINDOW_TILEMAP_LEFT=1,
 *  WINDOW_TILEMAP_TOP=2, WINDOW_WIDTH=3, WINDOW_HEIGHT=4, WINDOW_PALETTE_NUM=5,
 *  WINDOW_BASE_BLOCK=6). */
export const WINDOW_BG = 0;
export const WINDOW_TILEMAP_LEFT = 1;
export const WINDOW_TILEMAP_TOP = 2;
export const WINDOW_WIDTH = 3;
export const WINDOW_HEIGHT = 4;
export const WINDOW_PALETTE_NUM = 5;
export const WINDOW_BASE_BLOCK = 6;

export function GetWindowAttribute(windowId: number, attributeId: number): number {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return 0;
  const t = gw.template;
  switch (attributeId) {
    case WINDOW_BG: return t.bg;
    case WINDOW_TILEMAP_LEFT: return t.tilemapLeft;
    case WINDOW_TILEMAP_TOP: return t.tilemapTop;
    case WINDOW_WIDTH: return t.width;
    case WINDOW_HEIGHT: return t.height;
    case WINDOW_PALETTE_NUM: return t.paletteNum;
    case WINDOW_BASE_BLOCK: return t.baseBlock;
    default: return 0;
  }
}

export function AddWindow(template: WindowTemplate): number {
  const win = createWindow(template.width, template.height, template.paletteNum);
  const id = nextWindowId++;
  gWindows.push({ id, win, template, tilemapDirty: false });
  return id;
}

export function RemoveWindow(windowId: number): void {
  const idx = gWindows.findIndex((w) => w.id === windowId);
  if (idx >= 0) gWindows.splice(idx, 1);
}

export function FreeAllWindowBuffers(): void {
  gWindows = [];
  nextWindowId = 0;
}

export function FillWindowPixelBuffer(windowId: number, fillValue: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  fillWindowPixelBuffer(gw.win, fillValue);
}

/** Équivalent fonctionnel décomp `GetWindowAttribute(windowId, WINDOW_TILE_DATA)`
 *  qui retourne `(u8*)` vers le tile-data 4bpp packed de la fenêtre.
 *
 *  Notre layout diffère : pixelBuffer linéaire row-major 1 byte/pixel (idx
 *  0-15) — équivalent sémantique 1:1 (= contenu image), pas le format byte
 *  (= 4bpp tile-arranged en décomp). Les opérations bulk-copy (CpuCopy32 du
 *  décomp) deviennent ici des bulk-copy sur le pixelBuffer (Uint8Array).
 *
 *  Usage typique (= item_menu.c:2438/:2442 PrintPocketNames + slide) :
 *  snapshot le pixelBuffer d'une fenêtre temp, puis copier des slices vers
 *  une autre fenêtre.
 *
 *  Retourne la référence Uint8Array vivante (mutation = écrit le buffer). */
export function GetWindowPixelBuffer(windowId: number): Uint8Array | null {
  const gw = gWindows.find((w) => w.id === windowId);
  return gw ? gw.win.pixelBuffer : null;
}

/** Marque le pixelBuffer d'une fenêtre comme modifié (force flush au prochain
 *  CopyWindowToVram / flushDirtyWindows). À appeler quand on écrit directement
 *  le pixelBuffer en bypass des AddTextPrinter (= bulk-copy du slide). */
export function MarkWindowDirty(windowId: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (gw) gw.win.needsFlush = true;
}

/** 1:1 décomp `CopyToWindowPixelBuffer(u8 windowId, const void *src, u16 size,
 *  u16 tileOffset)` (window.c) — copie un gfx 4bpp TILE-ARRANGED dans le buffer
 *  de la fenêtre. Notre pixelBuffer étant linéaire row-major 1 byte/pixel, on
 *  dépaquette tile par tile. `size` en BYTES (0 = toute la fenêtre, 1:1 décomp
 *  qui lit alors windowWidth*windowHeight*TILE_SIZE_4BPP), `tileOffset` en tiles. */
export function CopyToWindowPixelBuffer(windowId: number, src: Uint8Array, size: number, tileOffset: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const widthTiles = gw.template.width;
  const heightTiles = gw.template.height;
  const totalTiles = widthTiles * heightTiles;
  const nTiles = Math.min(
    size > 0 ? Math.floor(size / 32) : totalTiles,
    totalTiles - tileOffset,
    Math.floor(src.length / 32),
  );
  const buf = gw.win.pixelBuffer;
  const rowW = widthTiles * 8;
  for (let t = 0; t < nTiles; t++) {
    const tileIdx = tileOffset + t;
    const tx = (tileIdx % widthTiles) * 8;
    const ty = Math.floor(tileIdx / widthTiles) * 8;
    for (let py = 0; py < 8; py++) {
      for (let pxPair = 0; pxPair < 4; pxPair++) {
        const byte = src[t * 32 + py * 4 + pxPair];
        const off = (ty + py) * rowW + tx + pxPair * 2;
        buf[off] = byte & 0xF;
        buf[off + 1] = (byte >> 4) & 0xF;
      }
    }
  }
  gw.win.needsFlush = true;
}

export function CopyWindowToVram(windowId: number, mode: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  // mode: COPYWIN_FULL=3, COPYWIN_GFX=2 — on fait la même chose pour l'instant
  copyPixelBufferToVram(gw.win, gw.template.bg, gw.template.baseBlock);
}

export function PutWindowTilemap(windowId: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  writeWindowTilemap(gw, false);
}

export function ClearWindowTilemap(windowId: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  writeWindowTilemap(gw, true);
}

/** 1:1 décomp `window.h` — modes de `CopyWindowToVram` (= COPYWIN_MAP | COPYWIN_GFX).
 *  Notre engine traite GFX/MAP/FULL de façon identique (cf. CopyWindowToVram). */
export const COPYWIN_NONE = 0;
export const COPYWIN_MAP = 1;
export const COPYWIN_GFX = 2;
export const COPYWIN_FULL = 3;

/** 1:1 décomp `window.c:525 CallWindowFunction(u8 windowId, void (*func)(u8,u8,u8,u8,u8,u8))` :
 *    struct WindowTemplate window = gWindows[windowId].window;
 *    func(window.bg, window.tilemapLeft, window.tilemapTop, window.width, window.height, window.paletteNum);
 *
 *  Appelle `func` avec les 6 champs du template de la fenêtre. Utilisé par toute
 *  la famille Draw*Frame/Clear*Frame (menu.c) pour passer la géométrie du window
 *  aux WindowFunc_* (qui posent les tiles de bordure dans le BG tilemap).
 *
 *  Note engine : `gWindows[windowId]` (index direct décomp) → `.find(id===windowId)`
 *  (windowId monotone côté engine, cf. frontière documentée). */
export function CallWindowFunction(
  windowId: number,
  func: (bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, paletteNum: number) => void,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const t = gw.template;
  func(t.bg, t.tilemapLeft, t.tilemapTop, t.width, t.height, t.paletteNum);
}

/** Copie toutes les fenêtres dont le pixelBuffer a été modifié vers la VRAM.
 *  À appeler après RunTextPrinters() dans le main loop. */
export function flushDirtyWindows(): void {
  for (const gw of gWindows) {
    if (gw.win.needsFlush) {
      copyPixelBufferToVram(gw.win, gw.template.bg, gw.template.baseBlock);
    }
  }
}

/** 1:1 décomp `BlitBitmapToWindow(windowId, src, x, y, w, h)` (window.c).
 *
 *  Décomp : copy un bitmap 4bpp tile-arranged (= GBA charData format) dans
 *  le window pixel buffer à position (x, y) sur dimensions (w, h).
 *
 *  Notre pixelBuffer = 1 byte/pixel (= idx 0-15 dans la palette) au lieu de
 *  packed 4bpp. Conversion : pour chaque pixel source, unpack le nibble depuis
 *  charData (= 32 bytes/tile, row-major dans la grille de tiles).
 *
 *  @param src  4bpp tile-arranged char data (= sortie de loadIndexedPngStrict).
 *              Layout : tiles 8×8 row-major, dans chaque tile 32 bytes layout
 *              row-major 4×8 bytes, low nibble = pixel gauche.
 *  @param srcWidthPx  Width du bitmap source en pixels (= pour calculer tileX). */
export function BlitBitmapToWindow(
  windowId: number,
  src: Uint8Array,
  x: number,
  y: number,
  w: number,
  h: number,
  srcWidthPx?: number,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const win = gw.win;
  // Default srcWidthPx = blit width (= source = exactly w×h, source-relative coords).
  const srcW = srcWidthPx ?? w;
  const srcWidthTiles = srcW / 8;
  for (let py = 0; py < h; py++) {
    const dstY = y + py;
    if (dstY < 0 || dstY >= win.heightPx) continue;
    const tileY = (py / 8) | 0;
    const yInTile = py & 7;
    for (let px = 0; px < w; px++) {
      const dstX = x + px;
      if (dstX < 0 || dstX >= win.widthPx) continue;
      const tileX = (px / 8) | 0;
      const xInTile = px & 7;
      const tileIdx = tileY * srcWidthTiles + tileX;
      const byteIdx = tileIdx * 32 + yInTile * 4 + (xInTile >> 1);
      const nibbleShift = (xInTile & 1) * 4;
      const pixel = (src[byteIdx] >> nibbleShift) & 0xF;
      win.pixelBuffer[dstY * win.widthPx + dstX] = pixel;
    }
  }
  win.needsFlush = true;
}

/** 1:1 décomp `BlitBitmapRectToWindow(windowId, pixels, srcX, srcY, srcWidth,
 *  srcHeight, destX, destY, rectWidth, rectHeight)` (window.c:398). Blit un
 *  RECT du bitmap source (tile-arranged 4bpp) vers le pixelBuffer du window.
 *  Le sub-rect commence à (srcX, srcY) dans le src, taille (rectW, rectH),
 *  destination (destX, destY). srcWidth/Height = dimensions complètes du src
 *  bitmap (= 128×128 px pour gMenuInfoElements_Gfx). */
export function BlitBitmapRectToWindow(
  windowId: number,
  src: Uint8Array,
  srcX: number, srcY: number,
  srcWidth: number, _srcHeight: number,
  destX: number, destY: number,
  rectW: number, rectH: number,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const win = gw.win;
  const srcWidthTiles = srcWidth / 8;
  for (let py = 0; py < rectH; py++) {
    const dstY = destY + py;
    if (dstY < 0 || dstY >= win.heightPx) continue;
    const sy = srcY + py;
    const tileY = (sy / 8) | 0;
    const yInTile = sy & 7;
    for (let px = 0; px < rectW; px++) {
      const dstX = destX + px;
      if (dstX < 0 || dstX >= win.widthPx) continue;
      const sx = srcX + px;
      const tileX = (sx / 8) | 0;
      const xInTile = sx & 7;
      const tileIdx = tileY * srcWidthTiles + tileX;
      const byteIdx = tileIdx * 32 + yInTile * 4 + (xInTile >> 1);
      const nibbleShift = (xInTile & 1) * 4;
      const pixel = (src[byteIdx] >> nibbleShift) & 0xF;
      win.pixelBuffer[dstY * win.widthPx + dstX] = pixel;
    }
  }
  win.needsFlush = true;
}

export function FillWindowPixelRect(
  windowId: number,
  fill: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  fillWindowPixelRect(gw.win, fill, x, y, w, h);
}

/** 1:1 décomp `src/window.c:478 ScrollWindow(u8 windowId, u8 direction,
 *  u8 distance, u8 fillValue)`.
 *
 *  Décomp : opère sur `gWindows[windowId].tileData` (4bpp tile-packed,
 *  32 bytes/tile, layout GBA) via les macros MOVE_TILES_DOWN/UP. `distance`
 *  = pixels (rows). Le NET EFFECT :
 *   - direction 0 : `data[k] = data[k+dist]` (k croissant) → le contenu
 *     se déplace vers les adresses BASSES = scroll UP visuellement ; ce qui
 *     déborde (`srcOffset >= size`) est rempli avec fillValue → fill BAS.
 *   - direction 1 : `tileData += size-4` puis `data[end-k] = data[end-k-dist]`
 *     → contenu vers les adresses HAUTES = scroll DOWN ; fill HAUT.
 *   - direction 2 : `break` (no-op).
 *
 *  NUANCE ARCHI (= même justification que `scrollWindow`
 *  gba-text-printer.ts:241-258 + `blitGlyphToWindow`:331) : notre
 *  pixelBuffer est LINÉAIRE row-major 1 byte/pixel (pas tile-packed 4bpp),
 *  donc la transcription littérale des offsets MOVE_TILES ne s'applique
 *  pas — on porte le NET EFFECT EXACT (shift de `distance` rows + fill du
 *  vide), strictement équivalent au comportement observable du décomp.
 *
 *  list_menu.c:794 `ScrollWindow(win, 1, count*yMul, PIXEL_FILL(fill))`
 *  (sélection ↑ = nouveau contenu en haut, contenu existant descend) ;
 *  :808 `ScrollWindow(win, 0, count*yMul, …)` (sélection ↓ = contenu monte,
 *  neuf en bas). PrintEntries + FillWindowPixelRect (1:1 list_menu) posent
 *  ensuite le neuf — ScrollWindow ne fait QUE le décalage + fill du vide. */
export function ScrollWindow(
  windowId: number,
  direction: number,
  distance: number,
  fillValue: number,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const buf = gw.win.pixelBuffer;
  const stride = gw.win.widthPx;
  const heightPx = gw.win.heightPx;
  const fill = fillValue & 0x0F; // notre buffer = 1 byte/pixel (low nibble)
  // 1:1 décomp : distance >= window height → tout le buffer déborde
  // (srcOffset >= size pour tous) → entièrement rempli de fillValue.
  if (distance <= 0) return;
  if (distance >= heightPx) {
    buf.fill(fill);
    gw.win.needsFlush = true;
    return;
  }
  if (direction === 0) {
    // content UP, fill BOTTOM (= scrollWindow gba-text-printer:248).
    buf.copyWithin(0, distance * stride, heightPx * stride);
    buf.fill(fill, (heightPx - distance) * stride, heightPx * stride);
    gw.win.needsFlush = true;
  } else if (direction === 1) {
    // content DOWN, fill TOP.
    buf.copyWithin(distance * stride, 0, (heightPx - distance) * stride);
    buf.fill(fill, 0, distance * stride);
    gw.win.needsFlush = true;
  }
  // direction === 2 (ou autre) : 1:1 décomp `case 2: break;` → no-op.
}

// ─── BG Template API ─────────────────────────────────────────────────────────

export function InitBgsFromTemplates(bg: number, templates: readonly BgTemplate[], _count: number): void {
  for (const t of templates) {
    InitBgFromTemplate(t);
  }
}

export function InitBgFromTemplate(template: BgTemplate): void {
  const rt = getRuntime();
  if (!rt) return;
  const cfg = rt.gba.bg(template.bg as 0 | 1 | 2 | 3).config;
  cfg.charBaseIndex = template.charBaseIndex as 0 | 1 | 2 | 3;
  cfg.mapBaseIndex = template.mapBaseIndex;
  cfg.screenSize = template.screenSize as 0 | 1 | 2 | 3;
  cfg.paletteMode = template.paletteMode as 0 | 1;
  cfg.priority = template.priority;
  // 1:1 décomp bg.c:334/360 `sGpuBgConfigs2[bg].baseTile = template->baseTile`.
  cfg.baseTile = template.baseTile ?? 0;
}

/** = décomp `ShowBg(bg)` (bg.c:464 : flag `sGpuBgConfigs.bgVisibilityAndMode`
 *  + `SyncBgVisibilityAndMode()` = écrit DISPCNT bit BG_ON immédiat).
 *  ADAPTATION substrat : on ne pose QUE `config.visible` — le compositor lit
 *  la config à chaque frame, donc l'effet est immédiat SANS passer par le
 *  chemin registre DISPCNT (Sync* non porté). Écart doctrinal connu (audit
 *  gfx-substrat 2026-07-02) : le chemin register-encode est perdu. */
export function ShowBg(bg: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(bg as 0 | 1 | 2 | 3).config.visible = true;
}

/** = décomp `HideBg(bg)` (bg.c:470) — même adaptation que ShowBg. */
export function HideBg(bg: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(bg as 0 | 1 | 2 | 3).config.visible = false;
}

export function ChangeBgY(bg: number, value: number, mode: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config;
  if (mode === 0) {
    // BG_COORD_SET
    cfg.vofs = value & 0x1FF;
  } else {
    // BG_COORD_ADD
    cfg.vofs = (cfg.vofs + (value >> 8)) & 0x1FF; // value est souvent Q_8_8
  }
}

export function ChangeBgX(bg: number, value: number, mode: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config;
  if (mode === 0) {
    cfg.hofs = value & 0x1FF;
  } else {
    cfg.hofs = (cfg.hofs + (value >> 8)) & 0x1FF;
  }
}

export function ResetBgsAndClearDma3BusyFlags(_mode: number): void {
  const rt = getRuntime();
  if (!rt) return;
  for (let i = 0; i < 4; i++) {
    const cfg = rt.gba.bg(i as 0 | 1 | 2 | 3).config;
    cfg.visible = false;
    cfg.hofs = 0;
    cfg.vofs = 0;
    cfg.charBaseIndex = 0;
    cfg.mapBaseIndex = 0;
    cfg.screenSize = 0;
    cfg.paletteMode = 0;
    cfg.priority = 0;
  }
}

/** 1:1 décomp `ResetVramOamAndBgCntRegs(void)` (menu_helpers.c:94) :
 *    SetGpuReg(DISPCNT, 0); SetGpuReg(BG3/2/1/0CNT, 0);
 *    CpuFill16(0, VRAM, VRAM_SIZE); CpuFill32(0, OAM, OAM_SIZE);
 *    CpuFill16(0, PLTT, PLTT_SIZE);
 *
 *  Bloc d'init d'écran PARTAGÉ (décomp : ~10 écrans l'appellent). Avant cette
 *  fonction, chaque écran le ré-implémentait INLINE — dont `bag-menu` de façon
 *  INCOMPLÈTE (il manquait le clear PLTT RAM réel → résidu couleurs overworld,
 *  bug session 129). Ici 1:1 net-effect : le clear PLTT = buffers staging
 *  (gPlttBufferUnfaded/Faded) ET la PLTT RAM hardware (gba.palette.loadBg/Obj
 *  Range, = bypass `bufferTransferDisabled`), soit l'équivalent de
 *  `CpuFill16(0, PLTT, PLTT_SIZE)`. */
export function ResetVramOamAndBgCntRegs(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(0x00, 0); // DISPCNT
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0); // BG0-3CNT
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0;
    oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) { rt.gPlttBufferUnfaded.set(i, 0); rt.gPlttBufferFaded.set(i, 0); }
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
}

/** 1:1 décomp `ResetAllBgsCoordinates(void)` (menu_helpers.c:106) :
 *  ChangeBgX/Y(0..3, 0, BG_COORD_SET) — remet hofs/vofs des 4 BG à 0.
 *  (Sûr : `SetGpuReg(BGxHOFS/VOFS, 0)` écrit le MÊME `cfg.hofs/vofs` que
 *  ChangeBgX/Y, cf. decomp-runtime.SetGpuReg.) Appelée dans leur InitBGs par
 *  bag (item_menu.c), party (party_menu.c), summary (pokemon_summary_screen.c). */
export function ResetAllBgsCoordinates(): void {
  ChangeBgX(0, 0, 0); ChangeBgY(0, 0, 0);  // BG_COORD_SET = mode 0
  ChangeBgX(1, 0, 0); ChangeBgY(1, 0, 0);
  ChangeBgX(2, 0, 0); ChangeBgY(2, 0, 0);
  ChangeBgX(3, 0, 0); ChangeBgY(3, 0, 0);
}

// ─── Window helpers ──────────────────────────────────────────────────────────

/** 1:1 décomp `bg.c CreateWindowTemplate(bg, left, top, width, height, paletteNum, baseBlock)`.
 *  Phase E Step 1 : utilisé par `CreateYesNoMenuParameterized` pour wrapper Window struct. */
export function CreateWindowTemplate(
  bg: number,
  tilemapLeft: number,
  tilemapTop: number,
  width: number,
  height: number,
  paletteNum: number,
  baseBlock: number,
): WindowTemplate {
  return { bg, tilemapLeft, tilemapTop, width, height, paletteNum, baseBlock };
}

// ─── Hub de re-export : window frames (menu.c) → miroir `src/game/menu.ts` ───
// Toute la famille bordure-de-fenêtre (Draw*Frame / Clear*Frame / WindowFunc_* /
// SetStandardWindowBorderStyle / LoadMessageBoxAndBorderGfx / Menu_LoadStdPal /
// Init*) + les constantes DLG_WINDOW_* ont été RELOCALISÉES dans leur foyer 1:1
// décomp `src/game/menu.ts` (= menu.c). On les ré-exporte ici pour que les ~15
// importeurs existants (bag, party, start-menu, bedroom-pc, wallclock, region-map,
// money-box, pokedex, starter-choose, script-opcodes…) qui font
// `import { DrawStdFrameWithCustomTileAndPalette, ClearStdWindowAndFrame, … } from
// './gba-window-system'` restent INTACTS. `CallWindowFunction` + `COPYWIN_*` (HW
// pur window.c, lisent gWindows privé) restent définis ci-dessus.
//
// ⚠️ V3 : DLG_WINDOW_BASE_TILE_NUM = 0x200 (valeur décomp EXACTE) — était 0xFC.
// Le load (LoadMessageBoxGfx) ET le draw (WindowFunc_DrawDialogueFrame) partagent
// désormais 0x200 → auto-cohérent ; layout VRAM 1:1 (textbox window finit à 0x200).
export {
  DrawDialogueFrame,
  DrawStdWindowFrame,
  DrawStdFrameWithCustomTileAndPalette,
  DrawDialogFrameWithCustomTileAndPalette,
  ClearDialogWindowAndFrame,
  ClearStdWindowAndFrame,
  ClearStdWindowAndFrameToTransparent,
  ClearDialogWindowAndFrameToTransparent,
  SetStandardWindowBorderStyle,
  LoadMessageBoxAndBorderGfx,
  LoadMessageBoxAndFrameGfx,
  InitStandardTextBoxWindows,
  InitTextBoxGfxAndPrinters,
  FreeAllOverworldWindowBuffers,
  Menu_LoadStdPal,
  Menu_LoadStdPalAt,
  DLG_WINDOW_BASE_TILE_NUM,
  DLG_WINDOW_PALETTE_NUM,
} from './menu';

// LoadMessageBoxGfx — RELOCALISÉ dans le miroir `src/game/text_window.ts`
// (1:1 décomp text_window.c:93). Importer depuis `gba-text-window` (hub
// transitoire) ou `../../game/text_window`. Exposé au global-scope via le
// `export * from '../../text_window'` de decomp-globals.

// ClearDialogWindowAndFrame / ClearStdWindowAndFrame — RELOCALISÉS dans
// `src/game/menu.ts` (menu.c:234/243), ré-exportés par le hub ci-dessus.
// (Les anciennes versions engine fill=0/copyToVram-ignoré sont remplacées par
//  le 1:1 décomp : CallWindowFunction + FillWindowPixelBuffer(PIXEL_FILL(1)) +
//  ClearWindowTilemap + CopyWindowToVram si copyToVram.)

export function FillBgTilemapBufferRect_Palette0(
  bg: number,
  tile: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  FillBgTilemapBufferRect(bg, tile, x, y, w, h, 0);
}

export function FillBgTilemapBufferRect(
  bg: number,
  tile: number,
  x: number,
  y: number,
  w: number,
  h: number,
  palNum: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const gbaBg = rt.gba.bg(bg as 0 | 1 | 2 | 3);
  const tilemap = gbaBg.tilemap;
  const screenSize = gbaBg.config.screenSize;
  const entry = tile | ((palNum & 0xF) << 12);
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const idx = tileMapIndex(x + tx, y + ty, screenSize);
      if (idx >= 0 && idx < tilemap.length) {
        tilemap[idx] = entry;
      }
    }
  }
}

export function CopyBgTilemapBufferToVram(_bg: number): void {
  // In our engine the tilemap is read directly by the compositor,
  // so no explicit copy to VRAM is needed.
}

/** 1:1 décomp `bg.c CopyToBgTilemapBuffer(u8 bg, const void *src, u16 mode, u16 destOffset)`
 *  — copy raw u16 tilemap entries from `src` into BG tilemap @ destOffset.
 *
 *  Décomp behavior :
 *    - mode != 0 → CpuCopy16(src, tilemap + destOffset*2, mode)  // mode = bytes
 *    - mode == 0 → LZ77UnCompWram(src, tilemap + destOffset*2)   // src is LZ77
 *
 *  Notre engine : on assume `src` est déjà décompressé (= les .bin extraits par
 *  scripts/extract-png-tiles.mjs sont post-LZ77). Pour mode=0, on copie tout
 *  src.length entries. Pour mode!=0, on copie mode/2 entries.
 *
 *  Foundational : utilisé par tout scene qui charge un tilemap depuis ROM
 *  (= naming screen, intro, title, battles, overworld maps, …). */
export function CopyToBgTilemapBuffer(
  bg: number,
  src: Uint16Array,
  mode: number,
  destOffset: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const tilemap = rt.gba.bg(bg as 0 | 1 | 2 | 3).tilemap;
  const numEntries = mode !== 0 ? Math.min(mode >> 1, src.length) : src.length;
  for (let i = 0; i < numEntries && (destOffset + i) < tilemap.length; i++) {
    tilemap[destOffset + i] = src[i];
  }
}

/** 1:1 décomp `bg.c GetBgTilemapBuffer(bg)` :
 *    return sGpuBgConfigs2[bg].tilemap;
 *  Route vers le buffer tilemap par-BG du gestionnaire BG du port (= même accès
 *  que CopyToBgTilemapBuffer ci-dessus). */
export function GetBgTilemapBuffer(bg: number): Uint16Array {
  return getRuntime().gba.bg(bg as 0 | 1 | 2 | 3).tilemap;
}

/** 1:1 décomp `bg.c CopyRectToBgTilemapBuffer(bg, src, srcW, srcH, srcX, srcY, destX, destY, rectW, rectH, palette, baseTile, mode)`.
 *  Simplifié : on copie un rect rectW×rectH depuis src (srcW×srcH) à destX/destY dans la BG tilemap. */
export function CopyRectToBgTilemapBuffer(
  bg: number,
  src: Uint16Array,
  srcW: number,
  srcX: number,
  srcY: number,
  destX: number,
  destY: number,
  rectW: number,
  rectH: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const gbaBg = rt.gba.bg(bg as 0 | 1 | 2 | 3);
  const tilemap = gbaBg.tilemap;
  const screenSize = gbaBg.config.screenSize;
  for (let ty = 0; ty < rectH; ty++) {
    for (let tx = 0; tx < rectW; tx++) {
      const srcIdx = (srcY + ty) * srcW + (srcX + tx);
      if (srcIdx < 0 || srcIdx >= src.length) continue;
      const dstIdx = tileMapIndex(destX + tx, destY + ty, screenSize);
      if (dstIdx >= 0 && dstIdx < tilemap.length) {
        tilemap[dstIdx] = src[srcIdx];
      }
    }
  }
}

/** 1:1 décomp `void CopyTileMapEntry(const u16 *src, u16 *dest, s32 palette1,
 *  s32 tileOffset, s32 palette2)` (bg.c:1169-1190). Combine une entry tilemap
 *  source (tile|pal) avec un tileOffset + remap palette selon `palette1` :
 *    0..15 → (src+off)&0xFFF | ((palette1+palette2)<<12)
 *    16    → garde bits 10-15 de dest, src&0x3FF, +palette2<<12
 *    17(def)→ src+off+(palette2<<12)  (= copie verbatim si off=0,pal2=0). */
export function CopyTileMapEntry(
  srcVal: number, dest: Uint16Array, destIdx: number,
  palette1: number, tileOffset: number, palette2: number,
): void {
  let v: number;
  if (palette1 >= 0 && palette1 <= 15) {
    v = ((srcVal + tileOffset) & 0xFFF) + ((palette1 + palette2) << 12);
  } else if (palette1 === 16) {
    v = dest[destIdx];
    v &= 0xFC00;
    v += palette2 << 12;
    v |= (srcVal + tileOffset) & 0x3FF;
  } else { // default / 17
    v = srcVal + tileOffset + (palette2 << 12);
  }
  dest[destIdx] = v & 0xFFFF;
}

/** 1:1 décomp `void CopyToBufferFromBgTilemap(u8 bgId, u16 *dest, u8 left,
 *  u8 top, u8 width, u8 height)` (menu.c:1866-1877) : copie un rect width×height
 *  de la BG tilemap (entries tile|pal) vers `dest` (row-major width×height).
 *  Décomp indexe `src[(i+top)*32 + j+left]` (stride 32 hardcodé) — les BG party
 *  sont screenSize=0 (32 large) donc identique à notre tileMapIndex(.,.,0). */
export function CopyToBufferFromBgTilemap(
  bgId: number, dest: Uint16Array,
  left: number, top: number, width: number, height: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const src = rt.gba.bg(bgId as 0 | 1 | 2 | 3).tilemap;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      dest[i * width + j] = src[(i + top) * 32 + (j + left)];
    }
  }
}

/** 1:1 décomp `void CopyRectToBgTilemapBufferRect(u8 bg, const void *src,
 *  u8 srcX, u8 srcY, u8 srcWidth, u8 srcHeight, u8 destX, u8 destY,
 *  u8 rectWidth, u8 rectHeight, u8 palette1, s16 tileOffset, s16 palette2)`
 *  (bg.c:951-993), branche BG_TYPE_NORMAL (les BG party sont NORMAL). Copie
 *  un sous-rect du buffer `src` (srcWidth-strided) vers la BG tilemap à
 *  (destX,destY), via CopyTileMapEntry. srcPtr avance d'1 u16/entry +
 *  (srcWidth-rectWidth) en fin de ligne (1:1 décomp ; le `*2` C = bytes→u16). */
export function CopyRectToBgTilemapBufferRect(
  bg: number, src: Uint16Array,
  srcX: number, srcY: number, srcWidth: number, _srcHeight: number,
  destX: number, destY: number, rectWidth: number, rectHeight: number,
  palette1: number, tileOffset: number, palette2: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const gbaBg = rt.gba.bg(bg as 0 | 1 | 2 | 3);
  const tilemap = gbaBg.tilemap;
  const screenSize = gbaBg.config.screenSize;
  let srcPtr = srcY * srcWidth + srcX;
  for (let i = destY; i < destY + rectHeight; i++) {
    for (let j = destX; j < destX + rectWidth; j++) {
      const index = tileMapIndex(j, i, screenSize);
      if (index >= 0 && index < tilemap.length) {
        CopyTileMapEntry(src[srcPtr], tilemap, index, palette1, tileOffset, palette2);
      }
      srcPtr++;
    }
    srcPtr += srcWidth - rectWidth;
  }
}

/** 1:1 décomp `ScheduleBgCopyTilemapToVram(u8 bg)` (bg.c) : planifie une copie
 *  async tilemap→VRAM. Notre compositor lit `bg.tilemap` directement chaque
 *  frame (cf. CopyBgTilemapBufferToVram no-op) → modifs auto-prises = no-op
 *  (comportement net 1:1). */
export function ScheduleBgCopyTilemapToVram(_bg: number): void {
  /* no-op : compositor reads tilemap each frame */
}

/** 1:1 décomp `ClearScheduledBgCopiesToVram(void)` (menu.c:1718) :
 *    memset(sScheduledBgCopiesToVram, 0, sizeof(sScheduledBgCopiesToVram));
 *  Vide le registre des copies tilemap→VRAM planifiées. Notre compositor lit le
 *  tilemap chaque frame (cf. ScheduleBgCopyTilemapToVram = no-op) → aucun registre
 *  à vider = no-op net 1:1. */
export function ClearScheduledBgCopiesToVram(): void {
  /* no-op : pas de registre de copies planifiées (compositor lit tilemap chaque frame) */
}

/** 1:1 décomp `ResetTempTileDataBuffers(void)` (menu.c:1752) :
 *    for (i...) sTempTileDataBuffer[i] = NULL;
 *  Réinitialise les pointeurs des buffers de tiles temporaires (DecompressAndCopy
 *  TileDataToVram / FreeTempTileDataBuffersIfPossible). Notre port charge les
 *  tilesets en async direct (CopyMapTilesetsToVram) sans pool de buffers temp →
 *  no-op net 1:1. */
export function ResetTempTileDataBuffers(): void {
  /* no-op : chargement tileset async direct, pas de pool de buffers temp */
}

// ─── Accesseur interne ───────────────────────────────────────────────────────

export function getWindowById(windowId: number): Window | null {
  const gw = gWindows.find((w) => w.id === windowId);
  return gw?.win ?? null;
}

export function getGbaWindowById(windowId: number): GbaWindow | null {
  return gWindows.find((w) => w.id === windowId) ?? null;
}
