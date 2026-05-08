/**
 * gba-window-system.ts
 * --------------------
 * Couche d'adaptation window.c + bg.c pour le runtime décomp.
 * Maintient un tableau de fenêtres (pixel buffers) + métadonnées GBA,
 * et fournit CopyWindowToVram / PutWindowTilemap qui transfèrent vers
 * l'engine GBA hardware (VRAM + tilemap) pour rendu par le compositor.
 */
import { getRuntime, assetCache, LoadBgTiles } from './decomp-globals';
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

/** 1:1 décomp `ShowBg(bg)` — décomp `bg.c:ShowBg` set le flag dans
 *  `sGpuBgConfigs.bgVisibilityAndMode` PUIS appelle `SyncBgVisibilityAndMode`
 *  IMMEDIATEMENT (= setGpuReg DISPCNT bit BG_ON immediate). Pas de queue. */
export function ShowBg(bg: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(bg as 0 | 1 | 2 | 3).config.visible = true;
}

/** 1:1 décomp `HideBg(bg)` — same as ShowBg, immediate. */
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

/** 1:1 décomp `menu.c:687 DrawStdFrameWithCustomTileAndPalette` :
 *    sTileNum = baseTileNum; sPaletteNum = paletteNum;
 *    CallWindowFunction(WindowFunc_DrawStdFrameWithCustomTileAndPalette);
 *    FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
 *    PutWindowTilemap(windowId);
 *    if (copyToVram) CopyWindowToVram(windowId, COPYWIN_FULL);
 *
 *  Le `WindowFunc_DrawStdFrameWithCustomTileAndPalette` dessine 9 frame tiles
 *  (top-left/top/top-right/left/right/bot-left/bot/bot-right) en utilisant
 *  baseTileNum + 0..8 comme indices de tile dans le tilemap du BG du window.
 *  Phase E Step 1 : 1:1 décomp menu.c:710. */
/** 1:1 décomp `DLG_WINDOW_BASE_TILE_NUM` (graphics.h) : tile 0xFC = base tile
 *  pour les frame border tiles du dialog box (= chargé via LoadMessageBoxGfx). */
export const DLG_WINDOW_BASE_TILE_NUM = 0xFC;

/** 1:1 décomp `DLG_WINDOW_PALETTE_NUM` : palette 15 = couleurs du dialog box
 *  (= cyan/teal frame + blanc bg + dark gray text + light gray shadow). */
export const DLG_WINDOW_PALETTE_NUM = 15;

/** 1:1 décomp `WindowFunc_DrawDialogueFrame` (menu.c:319-411).
 *
 *  Pose 14 frame tiles autour du window pour faire le frame border arrondi
 *  du dialog box overworld. Layout :
 *
 *    +-----------+--------+-----+--------+--+
 *    | tile +1   | tile+3 | +4… | tile+5 |+6|   ← top row (= top - 1)
 *    +-----------+--------+-----+--------+--+
 *    | tile+7    | tile +9 (= INTERIOR)  |+10|   (5 lignes : top..top+4)
 *    +-----------+--------+-----+--------+--+
 *    | V_FLIP +1 | V_FL+3 | +4 V| V_FL+5 |+6|   ← bottom row (= top + height)
 *    +-----------+--------+-----+--------+--+
 *
 *  Le window pixel buffer (= text content) recouvre l'intérieur via
 *  CopyWindowToVram et écrase tile +9 dans la zone window proprement dite. */
export function WindowFunc_DrawDialogueFrame(
  bg: number, tilemapLeft: number, tilemapTop: number,
  width: number, height: number, paletteNum: number,
): void {
  const baseTile = DLG_WINDOW_BASE_TILE_NUM;
  const V_FLIP = 0x800;
  // Top row (1 row above content)
  FillBgTilemapBufferRect(bg, baseTile + 1,  tilemapLeft - 2,         tilemapTop - 1, 1,         1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTile + 3,  tilemapLeft - 1,         tilemapTop - 1, 1,         1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTile + 4,  tilemapLeft,             tilemapTop - 1, width - 1, 1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTile + 5,  tilemapLeft + width - 1, tilemapTop - 1, 1,         1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTile + 6,  tilemapLeft + width,     tilemapTop - 1, 1,         1, paletteNum);
  // Middle rows (= 5 rows from top to top+4 inclus = window content + bottom)
  FillBgTilemapBufferRect(bg, baseTile + 7,  tilemapLeft - 2,         tilemapTop,     1,         5, paletteNum);
  FillBgTilemapBufferRect(bg, baseTile + 9,  tilemapLeft - 1,         tilemapTop,     width + 1, 5, paletteNum);
  FillBgTilemapBufferRect(bg, baseTile + 10, tilemapLeft + width,     tilemapTop,     1,         5, paletteNum);
  // Bottom row (= V_FLIP des top tiles)
  FillBgTilemapBufferRect(bg, (baseTile + 1) | V_FLIP, tilemapLeft - 2,         tilemapTop + height, 1,         1, paletteNum);
  FillBgTilemapBufferRect(bg, (baseTile + 3) | V_FLIP, tilemapLeft - 1,         tilemapTop + height, 1,         1, paletteNum);
  FillBgTilemapBufferRect(bg, (baseTile + 4) | V_FLIP, tilemapLeft,             tilemapTop + height, width - 1, 1, paletteNum);
  FillBgTilemapBufferRect(bg, (baseTile + 5) | V_FLIP, tilemapLeft + width - 1, tilemapTop + height, 1,         1, paletteNum);
  FillBgTilemapBufferRect(bg, (baseTile + 6) | V_FLIP, tilemapLeft + width,     tilemapTop + height, 1,         1, paletteNum);
}

/** 1:1 décomp `DrawDialogueFrame(windowId, copyToVram)` (menu.c:216) :
 *    CallWindowFunction(WindowFunc_DrawDialogueFrame)
 *    FillWindowPixelBuffer(windowId, PIXEL_FILL(1))
 *    PutWindowTilemap(windowId)
 *    if (copyToVram) CopyWindowToVram(windowId, COPYWIN_FULL)
 *
 *  Foundation partagée — utilisée par field-message-box (= overworld dialog),
 *  Birch speech (= main-menu-impl), et toute autre scene qui veut un dialog box
 *  standard. baseTile 0xFC + palette 15 doivent avoir été loaded via
 *  LoadMessageBoxGfx avant l'appel. */
export function DrawDialogueFrame(windowId: number, copyToVram: boolean): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const t = gw.template;
  WindowFunc_DrawDialogueFrame(t.bg, t.tilemapLeft, t.tilemapTop, t.width, t.height, t.paletteNum);
  // 1:1 décomp : FillWindowPixelBuffer(PIXEL_FILL(1)) = idx 1 (= bg = white).
  fillWindowPixelBuffer(gw.win, 0x11);
  writeWindowTilemap(gw, false);
  if (copyToVram) {
    copyPixelBufferToVram(gw.win, gw.template.bg, gw.template.baseBlock);
  }
}

export function DrawStdFrameWithCustomTileAndPalette(
  windowId: number,
  copyToVram: boolean,
  baseTileNum: number,
  paletteNum: number,
): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const { bg, tilemapLeft, tilemapTop, width, height } = gw.template;

  // 1:1 décomp WindowFunc_DrawStdFrameWithCustomTileAndPalette : 8 FillBgTilemapBufferRect
  // (= corners + 4 edges, le centre du window est laissé vide pour le contenu).
  // tile 0=TL, 1=top, 2=TR, 3=left, 5=right, 6=BL, 7=bot, 8=BR.
  FillBgTilemapBufferRect(bg, baseTileNum + 0, tilemapLeft - 1, tilemapTop - 1, 1, 1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTileNum + 1, tilemapLeft,     tilemapTop - 1, width, 1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTileNum + 2, tilemapLeft + width, tilemapTop - 1, 1, 1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTileNum + 3, tilemapLeft - 1, tilemapTop,     1, height, paletteNum);
  FillBgTilemapBufferRect(bg, baseTileNum + 5, tilemapLeft + width, tilemapTop, 1, height, paletteNum);
  FillBgTilemapBufferRect(bg, baseTileNum + 6, tilemapLeft - 1, tilemapTop + height, 1, 1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTileNum + 7, tilemapLeft,     tilemapTop + height, width, 1, paletteNum);
  FillBgTilemapBufferRect(bg, baseTileNum + 8, tilemapLeft + width, tilemapTop + height, 1, 1, paletteNum);

  // FillWindowPixelBuffer(windowId, PIXEL_FILL(1)) — fill avec idx 1 (= bgColor du window).
  // PIXEL_FILL(1) = 0x11 (= les 2 nibbles à 1).
  fillWindowPixelBuffer(gw.win, 0x11);
  writeWindowTilemap(gw, false);
  if (copyToVram) {
    copyPixelBufferToVram(gw.win, gw.template.bg, gw.template.baseBlock);
  }
}

/** 1:1 décomp `menu.c LoadMessageBoxGfx(bg, baseTile, paletteFlatIdx)`.
 *  Charge les message-box frame tiles + palette standard pour le dialogue.
 *  Phase E Step 4 MVP : charge une palette text inline (= 4 colors :
 *    idx 0 = transparent (RGB(0,0,0))
/** 1:1 décomp src/text_window.c:93 LoadMessageBoxGfx(windowId, destOffset, palOffset).
 *
 *  ```c
 *  void LoadMessageBoxGfx(u8 windowId, u16 destOffset, u8 palOffset) {
 *      LoadBgTiles(GetWindowAttribute(windowId, WINDOW_BG), gMessageBox_Gfx, 0x1C0, destOffset);
 *      LoadPalette(GetOverworldTextboxPalettePtr(), palOffset, PLTT_SIZE_4BPP);
 *  }
 *  ```
 *
 *  - `gMessageBox_Gfx` = 14 tiles 4bpp (= 0x1C0 = 448 bytes) du frame dialog vert/cyan
 *    (= corners arrondis + edges). PNG src : graphics/text_window/message_box.png 56x16.
 *  - `gMessageBox_Pal` = 16 colors GBA palette (= cyan/vert/blanc/grey).
 *  - destOffset = baseTile (= e.g. 0xFC pour Birch dialog) → tiles loaded à
 *    BG charBase + destOffset * 32 dans VRAM.
 *  - palOffset = BG palette index (= e.g. BG_PLTT_ID(15) = 240) → 16 colors
 *    loaded à gPlttBufferFaded[palOffset..palOffset+15].
 *
 *  Préchargé via preloadTextWindowFrames() (gba-text-window.ts) au boot. */
export function LoadMessageBoxGfx(bg: number, baseTile: number, paletteFlatIdx: number): void {
  const rt = getRuntime();
  if (!rt) return;

  // Charge tile data → BG VRAM at (baseTile * 32) bytes offset.
  const gfxData = assetCache.get('gMessageBox_Gfx');
  if (gfxData instanceof Uint8Array) {
    // 1:1 décomp LoadBgTiles(bg, gMessageBox_Gfx, 0x1C0, destOffset).
    LoadBgTiles(bg, gfxData, 0x1C0, baseTile);
  } else {
    console.warn('[LoadMessageBoxGfx] gMessageBox_Gfx not preloaded (= preloadTextWindowFrames non appelé) — dialog frame border invisible');
  }

  // Charge palette → BG palette banks.
  const palData = assetCache.get('gMessageBox_Pal');
  if (palData instanceof Uint16Array) {
    // 1:1 décomp LoadPalette(GetOverworldTextboxPalettePtr() = gMessageBox_Pal, palOffset, 32 bytes = 16 colors).
    for (let i = 0; i < Math.min(16, palData.length); i++) {
      rt.gPlttBufferUnfaded.set(paletteFlatIdx + i, palData[i]);
      rt.gPlttBufferFaded.set(paletteFlatIdx + i, palData[i]);
    }
  } else {
    console.warn('[LoadMessageBoxGfx] gMessageBox_Pal not preloaded — fallback hardcoded grey palette');
    // Fallback : 4 couleurs basiques (préserve l'ancien comportement) si l'asset
    // n'est pas chargé. Ne devrait pas arriver en flow normal.
    const transparent = 0;
    const white = (31) | (31 << 5) | (31 << 10);
    const darkGrey = (7) | (7 << 5) | (7 << 10);
    const lightGrey = (15) | (15 << 5) | (15 << 10);
    rt.gPlttBufferUnfaded.set(paletteFlatIdx + 0, transparent);
    rt.gPlttBufferFaded.set(paletteFlatIdx + 0, transparent);
    rt.gPlttBufferUnfaded.set(paletteFlatIdx + 1, white);
    rt.gPlttBufferFaded.set(paletteFlatIdx + 1, white);
    rt.gPlttBufferUnfaded.set(paletteFlatIdx + 2, darkGrey);
    rt.gPlttBufferFaded.set(paletteFlatIdx + 2, darkGrey);
    rt.gPlttBufferUnfaded.set(paletteFlatIdx + 3, lightGrey);
    rt.gPlttBufferFaded.set(paletteFlatIdx + 3, lightGrey);
  }
}

/** 1:1 décomp `ClearDialogWindowAndFrame` (menu.c:234) + `WindowFunc_ClearDialogWindowAndFrame`
 *  (menu.c:419). Clear large rect autour du window — couvre les 2 colonnes de
 *  frame border de chaque côté (= TL outer/inner + TR outer/inner) que
 *  ClearStdWindowAndFrame ne clear PAS.
 *
 *    FillBgTilemapBufferRect(bg, 0, tilemapLeft-3, tilemapTop-1, width+6, height+2, STD_WIN_PALETTE_NUM);
 *
 *  À utiliser pour fermer un dialog box overworld (= field-message-box). */
export function ClearDialogWindowAndFrame(windowId: number, copyToVram: boolean): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  const t = gw.template;
  // 1:1 décomp WindowFunc_ClearDialogWindowAndFrame : tile=0 + palette=0
  // dans toute la zone (= width+6, height+2) débordant largement du frame.
  FillBgTilemapBufferRect(
    t.bg, 0,
    t.tilemapLeft - 3,
    t.tilemapTop - 1,
    t.width + 6,
    t.height + 2,
    0,
  );
  fillWindowPixelBuffer(gw.win, 0x11);
  writeWindowTilemap(gw, true);
  if (copyToVram) {
    copyPixelBufferToVram(gw.win, gw.template.bg, gw.template.baseBlock);
  }
}

/** 1:1 décomp src/menu.c:ClearStdWindowAndFrame.
 *  Clear le window pixel buffer + clear les BG tilemap entries du frame border.
 *
 *  Bug session 87 fix : avant on clearait juste le pixel buffer. Le frame
 *  border (= tiles placés par DrawStdFrameWithCustomTileAndPalette autour du
 *  window) restait visible après remove window → "cadre vide" leftover après
 *  OUI/NON confirm dans Birch flow + autres scenes.
 *
 *  Décomp clear toute la zone (= width+2, height+2 autour pour le frame). */
export function ClearStdWindowAndFrame(windowId: number, _copyToVram: boolean): void {
  const gw = gWindows.find((w) => w.id === windowId);
  if (!gw) return;
  fillWindowPixelBuffer(gw.win, 0);
  writeWindowTilemap(gw, true);
  // 1:1 décomp : clear BG tilemap rect autour du window (= frame border zone).
  // FillBgTilemapBufferRect_Palette0(bg, tile=0, left-1, top-1, width+2, height+2).
  const tpl = gw.template;
  FillBgTilemapBufferRect(
    tpl.bg,
    0,  // tile=0 = transparent
    tpl.tilemapLeft - 1,
    tpl.tilemapTop - 1,
    tpl.width + 2,
    tpl.height + 2,
    0,
  );
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

// ─── Accesseur interne ───────────────────────────────────────────────────────

export function getWindowById(windowId: number): Window | null {
  const gw = gWindows.find((w) => w.id === windowId);
  return gw?.win ?? null;
}

export function getGbaWindowById(windowId: number): GbaWindow | null {
  return gWindows.find((w) => w.id === windowId) ?? null;
}
