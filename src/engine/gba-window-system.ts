/**
 * gba-window-system.ts
 * --------------------
 * Couche d'adaptation window.c + bg.c pour le runtime décomp.
 * Maintient un tableau de fenêtres (pixel buffers) + métadonnées GBA,
 * et fournit CopyWindowToVram / PutWindowTilemap qui transfèrent vers
 * l'engine GBA hardware (VRAM + tilemap) pour rendu par le compositor.
 */
import { getRuntime } from './decomp-globals';
import {
  type Window,
  createWindow,
  fillWindowPixelBuffer,
  fillWindowPixelRect,
} from './gba-text-printer';

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
  const vram = gba.bg(bgIdx as 0 | 1 | 2 | 3).vram;
  const byteOffset = baseBlock * 32;
  const widthTiles = win.widthTiles;
  const heightTiles = win.heightTiles;
  const buf = win.pixelBuffer;

  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileId = baseBlock + ty * widthTiles + tx;
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
  // DEBUG: verify first tile written
  
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
  const baseBlock = t.baseBlock;

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
      // DEBUG removed
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

export function InitWindows(templates: readonly WindowTemplate[]): void {
  FreeAllWindowBuffers();
  for (const t of templates) {
    AddWindow(t);
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

/** Copie toutes les fenêtres dont le pixelBuffer a été modifié vers la VRAM.
 *  À appeler après RunTextPrinters() dans le main loop. */
export function flushDirtyWindows(): void {
  for (const gw of gWindows) {
    if (gw.win.needsFlush) {
      copyPixelBufferToVram(gw.win, gw.template.bg, gw.template.baseBlock);
    }
  }
}

export function BlitBitmapToWindow(
  windowId: number,
  _src: unknown,
  _x: number,
  _y: number,
  _w: number,
  _h: number,
): void {
  // TODO: implémenter si nécessaire pour d'autres scènes
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  gw.win.needsFlush = true;
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
  // baseTile n'est pas utilisé dans notre engine pour l'instant
}

export function ShowBg(bg: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(bg as 0 | 1 | 2 | 3).config.visible = true;
}

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

// ─── Window helpers ──────────────────────────────────────────────────────────

export function LoadMessageBoxGfx(_bg: number, _baseTile: number, _palette: number): void {
  // TODO: charger les gfx de la message box
}

export function ClearStdWindowAndFrame(windowId: number, _copyToVram: boolean): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  fillWindowPixelBuffer(gw.win, 0);
  writeWindowTilemap(gw, true);
}

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

// ─── Accesseur interne ───────────────────────────────────────────────────────

export function getWindowById(windowId: number): Window | null {
  const gw = gWindows.find((w) => w.id === windowId);
  return gw?.win ?? null;
}

export function getGbaWindowById(windowId: number): GbaWindow | null {
  return gWindows.find((w) => w.id === windowId) ?? null;
}
