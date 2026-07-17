/**
 * gba-window-system.ts
 * --------------------
 * Couche d'adaptation window.c + bg.c pour le runtime décomp.
 * Maintient un tableau de fenêtres (pixel buffers) + métadonnées GBA,
 * et fournit CopyWindowToVram / PutWindowTilemap qui transfèrent vers
 * l'engine GBA hardware (VRAM + tilemap) pour rendu par le compositor.
 */
import { getRuntime, assetCache, LoadBgTiles } from '../harness/runtime/decomp-globals';
import { gSineTable } from './trig';
import {
  REG_OFFSET_BG2PA, REG_OFFSET_BG2PB, REG_OFFSET_BG2PC, REG_OFFSET_BG2PD,
  REG_OFFSET_BG2X_L, REG_OFFSET_BG2X_H, REG_OFFSET_BG2Y_L, REG_OFFSET_BG2Y_H,
} from '../include/gba/io_reg';

// 1:1 décomp `include/global.fieldmap.h:7-9` — masques métatile utilisés par
// WriteSequenceToBgTilemapBuffer (bg.c:1054). Définis localement (et non importés
// de ./fieldmap) pour éviter d'introduire une arête d'import lourde dans ce module
// fondation (risque cycle/TDZ au boot) ; valeurs = mêmes littéraux que fieldmap.ts:144-146.
const MAPGRID_METATILE_ID_MASK = 0x03FF; // bits 0-9
const MAPGRID_COLLISION_MASK = 0x0C00;   // bits 10-11
const MAPGRID_ELEVATION_MASK = 0xF000;   // bits 12-15
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

// PIXEL_FILL / DUMMY_WIN_TEMPLATE / WindowTemplate : foyer = include/window.ts
// (miroir window.h, leaf anti-TDZ). Re-export indirect (résolu au LINKING ESM,
// pas à l'éval du corps) → safe même pour les importeurs pris dans un cycle
// passant par ce module. Les sites qui LISENT ces valeurs au top-level d'un
// module en cycle (battle_bg, battle_message) importent '../include/window'
// directement (modèle .c → .h).
export { PIXEL_FILL, DUMMY_WIN_TEMPLATE } from '../include/window';
export type { WindowTemplate } from '../include/window';
import type { WindowTemplate } from '../include/window';

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
export function tileMapIndex(tileX: number, tileY: number, screenSize: number): number {
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
/** BG dont un ÉCRAN possède le tilemap buffer (SetBgTilemapBuffer) — 1:1 la
 *  première boucle d'InitWindows (window.c:36-43) : `GetBgTilemapBuffer(i) !=
 *  NULL → DummyWindowBgTilemap` (= « ne pas allouer/zéroer, l'écran gère »). */
const _bgScreenTilemapOwned = new Set<number>();

export function InitWindows(templates: readonly WindowTemplate[]): number[] {
  FreeAllWindowBuffers();
  // 1:1 window.c:45-…: pour chaque BG référencé par les templates SANS buffer
  // d'écran, le décomp `AllocZeroed` un gWindowBgTilemapBuffers[bg] posé comme
  // tilemap du BG — la PREMIÈRE copie écrase donc le bloc VRAM ENTIER avec des
  // zéros + les fenêtres. Notre adaptation « vue VRAM directe » sautait ce
  // blanchiment → les tilemaps de l'écran PRÉCÉDENT survivaient (boîtes du
  // party menu visibles par-dessus la fly map, bug user 2026-07-17 soir).
  // Net-effect 1:1 : zéroer ici le bloc tilemap des BG non-ownés.
  {
    const rt = getRuntime();
    if (rt) {
      const seen = new Set<number>();
      for (const t of templates) {
        if (t.bg === 0xFF) break;
        if (t.bg == null || seen.has(t.bg) || _bgScreenTilemapOwned.has(t.bg)) continue;
        seen.add(t.bg);
        const cfg = rt.gba.bg(t.bg as 0 | 1 | 2 | 3).config;
        const base = (cfg.mapBaseIndex ?? 0) * 0x800;
        // Taille du tilemap TEXT selon screenSize (0=0x800, 1/2=0x1000, 3=0x2000).
        const size = cfg.screenSize === 3 ? 0x2000 : cfg.screenSize ? 0x1000 : 0x800;
        rt.gba.vram.fill(0, base, Math.min(base + size, rt.gba.vram.length));
      }
    }
  }
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

/** Extrait les tiles 4bpp packed du window (tile-major : row 0 tiles puis row 1…), pour le
 *  rendu texte→sprite (DrawTextWindowAndBufferTiles : PC titre de boîte, popup choix de boîte).
 *  Notre pixelBuffer est linéaire 1 byte/pixel → repack en tiles 8×8, 2 pixels/byte. */
export function ExtractWindowTiles4bpp(windowId: number): Uint8Array {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return new Uint8Array(0);
  const w = gw.win;
  const out = new Uint8Array(w.widthTiles * w.heightTiles * 32);
  let o = 0;
  for (let ty = 0; ty < w.heightTiles; ty++) {
    for (let tx = 0; tx < w.widthTiles; tx++) {
      for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 8; px += 2) {
          const i0 = (ty * 8 + py) * w.widthPx + tx * 8 + px;
          out[o++] = (w.pixelBuffer[i0] & 0xF) | ((w.pixelBuffer[i0 + 1] & 0xF) << 4);
        }
      }
    }
  }
  return out;
}

export function AddWindow(template: WindowTemplate): number {
  const win = createWindow(template.width, template.height, template.paletteNum);
  const id = nextWindowId++;
  gWindows.push({ id, win, template, tilemapDirty: false });
  return id;
}

/** 1:1 décomp `u16 AddWindow8Bit(const struct WindowTemplate *)` (window.c) — alloue une
 *  fenêtre 8bpp. Le décomp alloue le tile-data en RAM et NE touche PAS la VRAM à la
 *  création (le gfx n'est copié qu'au `CopyWindowToVram` explicite). Adaptation moteur :
 *  notre `AddWindow` laisse `needsFlush=true` (le 1er `flushDirtyWindows` copie le buffer
 *  encore vide) ; on le remet à false ici pour NE PAS écraser un cadre déjà chargé qui
 *  chevauche le `baseBlock` tant que la fenêtre n'est pas explicitement dessinée
 *  (ex. cadre YesNo tuiles 0xB-0x13 vs MultiMove `baseBlock` 0xA sur BG0). */
export function AddWindow8Bit(template: WindowTemplate): number {
  const id = AddWindow(template);
  const gw = gWindows.find((w) => w.id === id);
  if (gw) gw.win.needsFlush = false;
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

// 8bpp (256 couleurs) — utilisé par le MultiMove du PC (icônes attrapées dessinées dans un BG0
// 256-couleurs puis défilées). Le renderer lit ces tuiles via decodeTile8bpp (bg-layer.ts:70,126 :
// tileSizeBytes=64, tuile à tileId*64) quand le BG est en BGCNT_256COLOR + paletteMode=1.

/** 1:1 décomp `copyPixelBufferToVram8Bit` (voie 8bpp) — écrit le pixelBuffer (déjà 1 byte/pixel =
 *  format 8bpp naturel) en VRAM : 64 o/tuile, 1 octet/pixel (index 0-255), layout row-major par tuile
 *  identique à decodeTile8bpp (baseOffset = tileId*64, out[row*8+col] = charData[base + row*8 + col]). */
function copyPixelBufferToVram8Bit(win: Window, bgIdx: number, baseBlock: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const bgLayer = rt.gba.bg(bgIdx as 0 | 1 | 2 | 3);
  const vram = bgLayer.vram;
  const baseTile = bgLayer.config.baseTile ?? 0;
  const widthTiles = win.widthTiles;
  const heightTiles = win.heightTiles;
  const buf = win.pixelBuffer;
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileId = baseTile + baseBlock + ty * widthTiles + tx;
      const tileOffset = tileId * 64; // TILE_BYTES_8BPP
      if (tileOffset + 64 > vram.length) continue;
      for (let row = 0; row < 8; row++) {
        const srcRowStart = (ty * 8 + row) * win.widthPx + tx * 8;
        const dstRowStart = tileOffset + row * 8;
        for (let col = 0; col < 8; col++) vram[dstRowStart + col] = buf[srcRowStart + col] & 0xFF;
      }
    }
  }
  win.needsFlush = false;
}

/** 1:1 décomp `FillWindowPixelBuffer8Bit(u8 windowId, u8 fillValue)` (window.c:647) — remplit tout
 *  le tileData 8bpp. Notre pixelBuffer = 1 byte/pixel → fill direct (masque 0xFF au lieu de 0x0F). */
export function FillWindowPixelBuffer8Bit(windowId: number, fillValue: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  gw.win.pixelBuffer.fill(fillValue & 0xFF);
  gw.win.needsFlush = true;
}

/** 1:1 décomp `CopyWindowToVram8Bit(u8 windowId, u8 mode)` (window.c:684). Comme CopyWindowToVram
 *  (4bpp), notre moteur écrit les tiles ici ; le tilemap est posé par PutWindowTilemap. */
export function CopyWindowToVram8Bit(windowId: number, mode: number): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  void mode; // COPYWIN_GFX=2 / FULL=3 : les deux copient les tiles (MAP seul = jamais utilisé par MultiMove)
  copyPixelBufferToVram8Bit(gw.win, gw.template.bg, gw.template.baseBlock);
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

/** 1:1 décomp `void PutWindowRectTilemap(u8 windowId, u8 x, u8 y, u8 width, u8 height)`
 *  (window.c:371-391) : pose le RECTANGLE (x,y,w,h) de la fenêtre dans le tilemap BG
 *  (tiles séquentielles depuis baseBlock, ligne à ligne). Impl migrée depuis
 *  pokenav_region_map.ts (consolidation item 1 — window.ts était gelé au moment du
 *  chantier region map). */
export function PutWindowRectTilemap(windowId: number, x: number, y: number, width: number, height: number): void {
  const bg = GetWindowAttribute(windowId, WINDOW_BG);
  const winWidth = GetWindowAttribute(windowId, WINDOW_WIDTH);
  // 1:1 :374 currentRow = baseBlock + (y * width) + x + GetBgAttribute(bg, BG_ATTR_BASETILE)
  let currentRow = GetWindowAttribute(windowId, WINDOW_BASE_BLOCK) + (y * winWidth) + x + GetBgAttribute(bg, BG_ATTR_BASETILE);
  for (let i = 0; i < height; ++i) {
    WriteSequenceToBgTilemapBuffer(
      bg,
      currentRow,
      GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT) + x,
      GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP) + y + i,
      width,
      1,
      GetWindowAttribute(windowId, WINDOW_PALETTE_NUM),
      1);
    currentRow += winWidth;   // 1:1 :389
  }
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

/** 1:1 décomp `BlitBitmapRectToWindow4BitTo8Bit(u8 windowId, const u8 *pixels,
 *  u16 srcX, srcY, srcWidth, srcHeight, destX, destY, rectWidth, rectHeight,
 *  u8 paletteNum)` (window.c:451) → `BlitBitmapRect4BitTo8Bit(src, dst, destX,
 *  destY, srcX, srcY, rectW, rectH, 0xFF, paletteNum)` (blit.c:106). Blit un
 *  rect 4bpp source (tile-arranged, local palette) dans le pixelBuffer 8bpp du
 *  window : chaque nibble 4bpp devient l'index 8bpp `paletteNum*16 + nibble`
 *  (colorKey 0xFF = pas de transparence, TOUS les pixels copiés dont le 0).
 *  Notre pixelBuffer est LINÉAIRE 1 byte/pixel (cf. BlitBitmapRectToWindow) →
 *  même adressage src tile-packed, dst = `y*widthPx + x`. */
export function BlitBitmapRectToWindow4BitTo8Bit(
  windowId: number,
  src: Uint8Array,
  srcX: number, srcY: number,
  srcWidth: number, _srcHeight: number,
  destX: number, destY: number,
  rectW: number, rectH: number,
  paletteNum: number,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const win = gw.win;
  const palOffsetBits = paletteNum * 16;
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
      // ADAPTATION RENDERER (≠ décomp) : le décomp (colorKey 0xFF) copie AUSSI le nibble 0 du
      // fond de l'icône → index paletteNum*16 OPAQUE = la couleur 0 de la palette d'icône
      // (« box-green » 98,156,131). Dans le vrai jeu ce vert = le fond de boîte donc INVISIBLE.
      // Chez nous le fond de boîte (wallpaper) a d'autres teintes → ce fond opaque fait un CARRÉ
      // visible qui masque même la main-curseur. On SKIP le nibble 0 (reste index 0 = transparent,
      // posé par FillWindowPixelBuffer8Bit) : l'icône sélectionnée apparaît proprement sur le vrai
      // fond de boîte, sans carré — rendu identique au jeu original.
      if (pixel === 0) continue;
      win.pixelBuffer[dstY * win.widthPx + dstX] = palOffsetBits + pixel;
    }
  }
  win.needsFlush = true;
}

/** 1:1 décomp `FillWindowPixelRect8Bit(u8 windowId, u8 fillValue, u16 x, u16 y,
 *  u16 width, u16 height)` (window.c:673) → `FillBitmapRect8Bit` (blit.c:184).
 *  Remplit un rect du pixelBuffer 8bpp avec fillValue (byte plein, masque 0xFF
 *  au lieu de 0x0F). pixelBuffer LINÉAIRE → `y*widthPx + x`. */
export function FillWindowPixelRect8Bit(
  windowId: number,
  fill: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const win = gw.win;
  const value = fill & 0xFF;
  for (let py = 0; py < h; py++) {
    const dstY = y + py;
    if (dstY < 0 || dstY >= win.heightPx) continue;
    const rowBase = dstY * win.widthPx;
    for (let px = 0; px < w; px++) {
      const dstX = x + px;
      if (dstX < 0 || dstX >= win.widthPx) continue;
      win.pixelBuffer[rowBase + dstX] = value;
    }
  }
  win.needsFlush = true;
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

export function InitBgsFromTemplates(bgMode: number, templates: readonly BgTemplate[], _count: number): void {
  // 1:1 bg.c:326 `SetBgModeInternal(bgMode)` : le PREMIER paramètre est le mode
  // vidéo (DISPCNT bits 0-2 — mode 1 = BG2 affine, mode 2 = BG2+BG3 affines).
  // L'ancien port l'IGNORAIT → tout écran affine initialisé par templates restait
  // rendu en mode texte (fly map : carte 64×64 8bpp entrelacée en bandes,
  // consolidation item 5). SetBgMode = RMW DISPCNT, idempotent pour les écrans
  // qui le posaient déjà explicitement (pokenav_region_map).
  SetBgMode(bgMode);
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

// 1:1 décomp `enum { BG_ATTR_* }` (include/bg.h:6-15).
export const BG_ATTR_CHARBASEINDEX = 1;
export const BG_ATTR_MAPBASEINDEX = 2;
export const BG_ATTR_SCREENSIZE = 3;
export const BG_ATTR_PALETTEMODE = 4;
export const BG_ATTR_MOSAIC = 5;
export const BG_ATTR_WRAPAROUND = 6;
export const BG_ATTR_PRIORITY = 7;
export const BG_ATTR_METRIC = 8;
export const BG_ATTR_TYPE = 9;
export const BG_ATTR_BASETILE = 10;

/** 1:1 décomp `u16 GetBgAttribute(u8 bg, u8 attributeId)` (bg.c:504-545) — lit la
 *  config du BG (les cases METRIC/TYPE du décomp, non consommés par le port, rendent -1). */
export function GetBgAttribute(bg: number, attributeId: number): number {
  const rt = getRuntime();
  if (!rt) return 0xFFFF;
  const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config as unknown as Record<string, unknown>;
  switch (attributeId) {
    case BG_ATTR_CHARBASEINDEX: return (cfg.charBaseIndex as number) ?? 0;
    case BG_ATTR_MAPBASEINDEX: return (cfg.mapBaseIndex as number) ?? 0;
    case BG_ATTR_SCREENSIZE: return (cfg.screenSize as number) ?? 0;
    case BG_ATTR_PALETTEMODE: return (cfg.paletteMode as number) ?? 0;
    case BG_ATTR_PRIORITY: return (cfg.priority as number) ?? 0;
    case BG_ATTR_MOSAIC: return cfg.mosaic ? 1 : 0;
    case BG_ATTR_WRAPAROUND: return cfg.wraparound ? 1 : 0;
    case BG_ATTR_BASETILE: return (cfg.baseTile as number) ?? 0;
    default: return 0xFFFF;
  }
}

/** 1:1 décomp `SetBgControlAttributes` (bg.c:99-143) : écrit champ-par-champ la
 *  config du BG, sentinelle 0xFF = « ne pas toucher ». Le .c termine par
 *  `sGpuBgConfigs.configs[bg].visible = 1` — fidèle ici ; comme sur GBA, la
 *  visibilité effective reste pilotée par DISPCNT (applyDispCnt réécrit
 *  config.visible), donc un caller qui re-pose DISPCNT ensuite re-cache le BG. */
function SetBgControlAttributes(bg: number, charBaseIndex: number, mapBaseIndex: number,
  screenSize: number, paletteMode: number, priority: number, mosaic: number, wraparound: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (bg > 3 || bg < 0) return;  // 1:1 `if (!IsInvalidBg(bg))` (bg.c:101)
  const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config;
  if (charBaseIndex !== 0xFF) cfg.charBaseIndex = charBaseIndex as 0 | 1 | 2 | 3;
  if (mapBaseIndex !== 0xFF) cfg.mapBaseIndex = mapBaseIndex;
  if (screenSize !== 0xFF) cfg.screenSize = screenSize as 0 | 1 | 2 | 3;
  if (paletteMode !== 0xFF) cfg.paletteMode = paletteMode as 0 | 1;
  if (priority !== 0xFF) cfg.priority = priority;
  if (mosaic !== 0xFF) cfg.mosaic = !!mosaic;
  if (wraparound !== 0xFF) cfg.wraparound = !!wraparound;
  cfg.visible = true;  // 1:1 bg.c:141
}

/** 1:1 décomp `SetBgAttribute(u8 bg, u8 attributeId, u8 value)` (bg.c:476-502).
 *  Consommé par evolution_scene (StartBgAnimation/RestoreBgAfterAnim : démotion
 *  BG1/BG2 prio 2 pour que mons OBJ prio 2 et sparkles prio 1 passent DEVANT le
 *  fond) et battle_intro (charbase). 🐛 fix 2026-07-02 : n'existait NULLE PART
 *  (call-sites en `rt.SetBgAttribute?.()` = no-op silencieux) → fond de la scène
 *  d'évolution rendu PAR-DESSUS les silhouettes du cycle et les étincelles. */
export function SetBgAttribute(bg: number, attributeId: number, value: number): void {
  switch (attributeId) {
    case BG_ATTR_CHARBASEINDEX:
      SetBgControlAttributes(bg, value, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF);
      break;
    case BG_ATTR_MAPBASEINDEX:
      SetBgControlAttributes(bg, 0xFF, value, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF);
      break;
    case BG_ATTR_SCREENSIZE:
      SetBgControlAttributes(bg, 0xFF, 0xFF, value, 0xFF, 0xFF, 0xFF, 0xFF);
      break;
    case BG_ATTR_PALETTEMODE:
      SetBgControlAttributes(bg, 0xFF, 0xFF, 0xFF, value, 0xFF, 0xFF, 0xFF);
      break;
    case BG_ATTR_PRIORITY:
      SetBgControlAttributes(bg, 0xFF, 0xFF, 0xFF, 0xFF, value, 0xFF, 0xFF);
      break;
    case BG_ATTR_MOSAIC:
      SetBgControlAttributes(bg, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, value, 0xFF);
      break;
    case BG_ATTR_WRAPAROUND:
      SetBgControlAttributes(bg, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, value);
      break;
  }
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

// 1:1 bg.c `sGpuBgConfigs2[bg].bg_x/bg_y` : coordonnées BG persistantes en Q8.8 (s32).
// Nécessaire car ChangeBgX/Y RETOURNENT la coord (les LoopedTask Pokénav comparent
// `ChangeBgY(0,384,ADD) >= 0x2000` — avec void, le slide bouclait à l'infini) et
// GetBgX/GetBgY la relisent (pokenav_list MoveListWindow). Les registres HOFS/VOFS
// n'en gardent que `>>8 & 0x1FF` (9 bits hardware).
const sBgCoords: { x: number; y: number }[] = [
  { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
];

/** 1:1 `u32 ChangeBgY(u8 bg, s32 value, u8 op)` (bg.c:698) — mode texte (VOFS) ;
 *  BG_COORD_SET=0 / ADD=1 / SUB=2 ; retourne bg_y (Q8.8). Checks IsInvalidBg32/
 *  VISIBLE du décomp non portés (harness sans ces attributs ; appelants passent des bg valides). */
export function ChangeBgY(bg: number, value: number, mode: number): number {
  switch (mode) {
    case 0: sBgCoords[bg].y = value; break;        // BG_COORD_SET
    case 1: sBgCoords[bg].y += value; break;       // BG_COORD_ADD
    case 2: sBgCoords[bg].y -= value; break;       // BG_COORD_SUB
  }
  const rt = getRuntime();
  if (rt) rt.gba.bg(bg as 0 | 1 | 2 | 3).config.vofs = (sBgCoords[bg].y >> 8) & 0x1FF;
  return sBgCoords[bg].y;
}

/** 1:1 `s32 GetBgY(u8 bg)` (bg.c:762) : retourne sGpuBgConfigs2[bg].bg_y (Q8.8). */
export function GetBgY(bg: number): number {
  return sBgCoords[bg].y;
}

/** 1:1 `s32 GetBgX(u8 bg)` (bg.c:750) : retourne sGpuBgConfigs2[bg].bg_x (Q8.8). */
export function GetBgX(bg: number): number {
  return sBgCoords[bg].x;
}

/** 1:1 `u32 ChangeBgX(u8 bg, s32 value, u8 op)` (bg.c:646) — mode texte (HOFS) ;
 *  SET=0 / ADD=1 / SUB=2 ; retourne bg_x (Q8.8). Cf. ChangeBgY pour sBgCoords. */
export function ChangeBgX(bg: number, value: number, mode: number): number {
  switch (mode) {
    case 0: sBgCoords[bg].x = value; break;        // BG_COORD_SET
    case 1: sBgCoords[bg].x += value; break;       // BG_COORD_ADD
    case 2: sBgCoords[bg].x -= value; break;       // BG_COORD_SUB
  }
  const rt = getRuntime();
  if (rt) rt.gba.bg(bg as 0 | 1 | 2 | 3).config.hofs = (sBgCoords[bg].x >> 8) & 0x1FF;
  return sBgCoords[bg].x;
}

export function ResetBgsAndClearDma3BusyFlags(_mode: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 ResetBgs : les pointeurs tilemap des BG sont réinitialisés → plus
  // aucun BG « owné » par un écran (InitWindows re-blanchira librement).
  _bgScreenTilemapOwned.clear();
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

// ─── BG affine (bg.c:244-283 SetBgAffineInternal / bg.c:772 SetBgAffine) ──────
// Transcrites 1:1 (double write BG2PA bg.c:274+278 inclus). Le seul appelant SOLO
// du décomp est rayquaza_scene.c (climax légendaire), pas encore porté — mais la
// chaîne complète est CÂBLÉE et exercée par l'outil harness `dev.gfx.affineTest`
// (dev-gfx-tools.ts) : SetBgAffine → gate mode vidéo (GetGpuReg DISPCNT & 7 ≡
// GetBgMode bg.c:64, le port n'a pas le staging bgVisibilityAndMode) → BgAffineSet
// → 8 écritures SetGpuReg BG2PA..BG2Y_H → compositor branche affine (fix-affine-bg.md).

interface BgAffineSrcData { texX: number; texY: number; scrX: number; scrY: number; sx: number; sy: number; alpha: number; }
interface BgAffineDstData { pa: number; pb: number; pc: number; pd: number; dx: number; dy: number; }

/** 1:1 BIOS `BgAffineSet(src, dst, count)` (SWI 0x0E, libagbsyscall) — calcule la
 *  matrice affine BG (pa/pb/pc/pd, s16 Q8.8) + point de référence (dx/dy, s32 28.8)
 *  depuis centre texture (texX/texY, 28.8), centre écran (scrX/scrY, s16), échelles
 *  (sx/sy, Q8.8 : 256 = 1 texel/pixel) et angle (alpha, u16 : 0x10000 = tour complet,
 *  seuls les bits 8-15 comptent — GBATEK « BgAffineSet ... theta 8bit fractional »).
 *  Semantics BIOS (GBATEK SWI 0Eh) : pa=sx·cos, pb=−sx·sin, pc=sy·sin, pd=sy·cos ;
 *  dx = texX − (pa·scrX + pb·scrY), dy = texY − (pc·scrX + pd·scrY) — dx/dy calculés
 *  depuis les coefficients DÉJÀ tronqués s16 (= BIOS réel, cf. HLE NanoBoyAdvance).
 *  Arrondi/précision = PRÉCÉDENT DU PORT (trig.c Q8.8) : PanFadeAndZoomScreen
 *  (decomp-globals.ts:1117) + ObjAffineSet (pokemon_animation.ts:142) — gSineTable
 *  Q8.8 index alpha>>8, négation AVANT le shift arithmétique `(-sin*sx)>>8` (= vrai
 *  BIOS, troncature vers −∞), au lieu de la table BIOS Q1.14 (>>14) : écart ≤ 1/256
 *  par coefficient, assumé (même choix que les 2 précédents cités). */
function BgAffineSet(src: BgAffineSrcData, dest: BgAffineDstData, count: number): void {
  for (let i = 0; i < count; i++) {
    const sinIdx = (src.alpha >> 8) & 0xFF;
    const cosIdx = (sinIdx + 64) & 0xFF;
    const sin = gSineTable[sinIdx];
    const cos = gSineTable[cosIdx];
    dest.pa = (cos * src.sx) >> 8;
    dest.pb = (-sin * src.sx) >> 8;
    dest.pc = (sin * src.sy) >> 8;
    dest.pd = (cos * src.sy) >> 8;
    dest.dx = src.texX - (src.scrX * dest.pa + src.scrY * dest.pb);
    dest.dy = src.texY - (src.scrX * dest.pc + src.scrY * dest.pd);
  }
}

/** 1:1 décomp `static void SetBgAffineInternal(u8 bg, s32 srcCenterX, s32 srcCenterY,
 *  s16 dispCenterX, s16 dispCenterY, s16 scaleX, s16 scaleY, u16 rotationAngle)`
 *  (bg.c:244-283). Garde mode/bg (`bgVisibilityAndMode & 7` → notre DISPCNT mode via
 *  GetGpuReg), BgAffineSet, puis pousse BG2PA-PD + BG2X/Y via SetGpuReg. Le double
 *  write BG2PA (bg.c:274 puis :278) est transcrit fidèlement. */
function SetBgAffineInternal(
  bg: number, srcCenterX: number, srcCenterY: number,
  dispCenterX: number, dispCenterY: number,
  scaleX: number, scaleY: number, rotationAngle: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.GetGpuReg(0x00 /* DISPCNT */) & 0x7) {
    default:
    case 0:
      return;
    case 1:
      if (bg !== 2) return;
      break;
    case 2:
      if (bg !== 2 && bg !== 3) return;
      break;
  }

  const src: BgAffineSrcData = {
    texX: srcCenterX, texY: srcCenterY,
    scrX: dispCenterX, scrY: dispCenterY,
    sx: scaleX, sy: scaleY, alpha: rotationAngle,
  };
  const dest: BgAffineDstData = { pa: 0, pb: 0, pc: 0, pd: 0, dx: 0, dy: 0 };
  BgAffineSet(src, dest, 1);

  rt.SetGpuReg(REG_OFFSET_BG2PA, dest.pa);
  rt.SetGpuReg(REG_OFFSET_BG2PB, dest.pb);
  rt.SetGpuReg(REG_OFFSET_BG2PC, dest.pc);
  rt.SetGpuReg(REG_OFFSET_BG2PD, dest.pd);
  rt.SetGpuReg(REG_OFFSET_BG2PA, dest.pa);
  rt.SetGpuReg(REG_OFFSET_BG2X_L, dest.dx & 0xFFFF);
  rt.SetGpuReg(REG_OFFSET_BG2X_H, (dest.dx >> 16) & 0xFFFF);
  rt.SetGpuReg(REG_OFFSET_BG2Y_L, dest.dy & 0xFFFF);
  rt.SetGpuReg(REG_OFFSET_BG2Y_H, (dest.dy >> 16) & 0xFFFF);
}

/** 1:1 décomp `void SetBgAffine(u8 bg, s32 srcCenterX, s32 srcCenterY, s16 dispCenterX,
 *  s16 dispCenterY, s16 scaleX, s16 scaleY, u16 rotationAngle)` (bg.c:772-775) —
 *  wrapper de SetBgAffineInternal. Appelant décomp solo = rayquaza_scene.c (à porter) ;
 *  exercé en attendant par `dev.gfx.affineTest` (chaîne complète, cf. bloc ci-dessus). */
export function SetBgAffine(
  bg: number, srcCenterX: number, srcCenterY: number,
  dispCenterX: number, dispCenterY: number,
  scaleX: number, scaleY: number, rotationAngle: number,
): void {
  SetBgAffineInternal(bg, srcCenterX, srcCenterY, dispCenterX, dispCenterY, scaleX, scaleY, rotationAngle);
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

/** 1:1 décomp `void WriteSequenceToBgTilemapBuffer(u8 bg, u16 firstTileNum, u8 x,
 *  u8 y, u8 width, u8 height, u8 paletteSlot, s16 tileNumDelta)` (bg.c:1033-1071),
 *  branche BG_TYPE_NORMAL. Écrit un rect width×height de tuiles à partir de
 *  `firstTileNum`, incrémenté de `tileNumDelta` par case — MAIS avec la sémantique
 *  métatile-mask du décomp (bg.c:1054) : on préserve les bits collision+élévation et
 *  on n'incrémente que l'ID sur 10 bits. Chaque entrée passe par CopyTileMapEntry
 *  (paletteSlot 17 = copie verbatim, garde les bits palette embarqués dans firstTileNum ;
 *  cf. les 2 call-sites match_call.c:1285/1452 qui passent `... | (pal<<12)` / `| ~0xFFF`).
 *  `tileMapIndex(x,y,screenSize)` = notre GetTileMapIndexFromCoords (même précédent que
 *  CopyRectToBgTilemapBufferRect). La branche AFFINE (tilemap u8) n'est pas représentée
 *  dans le port (comme FillBgTilemapBufferRect/CopyRectToBgTilemapBufferRect : NORMAL only). */
export function WriteSequenceToBgTilemapBuffer(
  bg: number, firstTileNum: number, x: number, y: number,
  width: number, height: number, paletteSlot: number, tileNumDelta: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const gbaBg = rt.gba.bg(bg as 0 | 1 | 2 | 3);
  const tilemap = gbaBg.tilemap;
  const screenSize = gbaBg.config.screenSize;
  let tileNum = firstTileNum;
  for (let y16 = y; y16 < y + height; y16++) {
    for (let x16 = x; x16 < x + width; x16++) {
      const index = tileMapIndex(x16, y16, screenSize);
      if (index >= 0 && index < tilemap.length) {
        CopyTileMapEntry(tileNum, tilemap, index, paletteSlot, 0, 0);
      }
      tileNum = (tileNum & (MAPGRID_COLLISION_MASK | MAPGRID_ELEVATION_MASK))
              + ((tileNum + tileNumDelta) & MAPGRID_METATILE_ID_MASK);
    }
  }
}

/** 1:1 décomp `void CopyToBgTilemapBufferRect(u8 bg, const void *src, u8 destX,
 *  u8 destY, u8 width, u8 height)` (bg.c:907-944), branche BG_TYPE_NORMAL : copie un
 *  rect width×height d'entrées u16 CONTIGUËS depuis `src` dans la tilemap du BG à
 *  (destX,destY), stride 0x20 (hardcodé décomp — les BG concernés sont screenSize 0).
 *  ≠ CopyRectToBgTilemapBufferRect (pas de remap palette, src strictement linéaire).
 *  Précédent 1:1 = easy_chat.ts:816 (impl locale identique). La branche AFFINE
 *  (tilemap u8) n'est pas représentée dans le port. */
export function CopyToBgTilemapBufferRect(
  bg: number, src: Uint16Array,
  destX: number, destY: number, width: number, height: number,
): void {
  const rt = getRuntime();
  if (!rt) return;
  const tilemap = rt.gba.bg(bg as 0 | 1 | 2 | 3).tilemap;
  let srcIdx = 0;
  for (let destY16 = destY; destY16 < destY + height; destY16++) {
    for (let destX16 = destX; destX16 < destX + width; destX16++) {
      const di = destY16 * 0x20 + destX16;
      if (di >= 0 && di < tilemap.length && srcIdx < src.length) {
        tilemap[di] = src[srcIdx];
      }
      srcIdx++;
    }
  }
}

/** 1:1 décomp `void SetBgMode(u8 bgMode)` → `SetBgModeInternal` (bg.c:370/58) : pose
 *  les bits 0-2 (mode vidéo) de l'état BG. Le décomp les stocke dans
 *  `sGpuBgConfigs.bgVisibilityAndMode` (poussé vers DISPCNT par ShowBg/HideBg via
 *  SyncBgVisibilityAndMode) ; le port n'a pas ce staging (ShowBg ne passe pas par le
 *  registre, cf. window.ts ShowBg) → on écrit DIRECTEMENT DISPCNT bits 0-2 en RMW,
 *  autres bits préservés (GetGpuReg reconstruit BG-on/OBJ/win depuis les configs). Le
 *  MÊME RMW-sur-DISPCNT est utilisé par le décomp lui-même : bg.c:239
 *  SetTextModeAndHideBgs `SetGpuReg(DISPCNT, GetGpuReg(DISPCNT) & ~...)`. applyDispCnt
 *  en re-dérive isAffine (mode 1/2 → BG2/BG3 affine). */
export function SetBgMode(bgMode: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(0x00 /* REG_OFFSET_DISPCNT */, (rt.GetGpuReg(0x00) & ~0x7) | (bgMode & 0x7));
}

/** 1:1 décomp `void SetBgTilemapBuffer(u8 bg, void *tilemap)` (bg.c:848) : le décomp
 *  stocke le pointeur `sGpuBgConfigs2[bg].tilemap`. ADAPTATION MOTEUR CENTRALISÉE
 *  (précédent mail.ts:1018, pokenav_main_menu.ts:91) : le tilemap du BG est une VUE
 *  VRAM persistante lue chaque frame par le compositor (pas de pointeur WRAM
 *  réassignable), et la copie se fait via CopyBgTilemapBufferToVram → no-op net.
 *  (⚠️ un écran qui décompresse dans un buffer PUIS SetBgTilemapBuffer sans écrire la
 *  vue VRAM directement — conditions/credits — n'affichera pas ce buffer tant qu'il
 *  n'est pas re-câblé façon easy_chat.ts:799 [alias buffer↔vue] ; hors périmètre A2). */
export function SetBgTilemapBuffer(_bg: number, _tilemap: unknown): void {
  /* no-op copie (le tilemap est la vue VRAM persistante du compositor, cf.
   * mail.ts:1018) — mais on TRACE l'ownership 1:1 : InitWindows ne blanchit
   * pas le bloc d'un BG dont l'écran possède le buffer (window.c:36-43). */
  _bgScreenTilemapOwned.add(_bg);
}

/** 1:1 décomp `void UnsetBgTilemapBuffer(u8 bg)` (bg.c:856) : met le pointeur à NULL.
 *  Pendant du SetBgTilemapBuffer ci-dessus → no-op. */
export function UnsetBgTilemapBuffer(_bg: number): void {
  /* no-op copie — démarque l'ownership (pendant de SetBgTilemapBuffer). */
  _bgScreenTilemapOwned.delete(_bg);
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
