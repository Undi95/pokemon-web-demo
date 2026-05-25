/**
 * gba-text-window.ts
 * -------------------
 * 1:1 décomp `src/text_window.c` — gestion des window frame tiles partagés
 * entre toutes les scènes (main menu, option menu, dialogues, battle, etc.).
 *
 * Pokemon Emerald a 20 styles de frames (= text_window/1..20.png), chacun
 * 24×24 px = 9 tiles × 32 bytes = 0x120 bytes + une palette 16 colors.
 * Le user peut sélectionner via option menu → `gSaveBlock2Ptr.optionsWindowFrameType`.
 *
 * Asset naming 1:1 décomp text_window.c:14-23 :
 *   - Frame 1 : `gTextWindowFrame1_Gfx` / `_Pal` (g-prefix, public)
 *   - Frames 2-20 : `sTextWindowFrameN_Gfx` / `_Pal` (s-prefix, static)
 *
 * Asset paths : `/decomp/em/ui/text_window/{N}.png` (= PNG indexed avec PLTE).
 */

import { assetCache, getAsset, getRuntime, LoadBgTiles } from './system/decomp-globals';
import { loadIndexedPngStrict } from './gba/png-loader';
import { gSaveBlock2Ptr } from './save/save-block-state';
import {
  FillBgTilemapBufferRect, GetWindowAttribute,
  WINDOW_BG, WINDOW_TILEMAP_LEFT, WINDOW_TILEMAP_TOP, WINDOW_WIDTH, WINDOW_HEIGHT,
} from './gba-window-system';

/** 1:1 décomp text_window.c WINDOW_FRAMES_COUNT. */
export const WINDOW_FRAMES_COUNT = 20;

/** Helper interne : retourne le naming pattern décomp pour le frame N (1-20). */
function frameAssetKeys(n: number): { gfxKey: string; palKey: string; url: string } {
  const gfxKey = n === 1 ? 'gTextWindowFrame1_Gfx' : `sTextWindowFrame${n}_Gfx`;
  const palKey = n === 1 ? 'gTextWindowFrame1_Pal' : `sTextWindowFrame${n}_Pal`;
  const url = `/decomp/em/ui/text_window/${n}.png`;
  return { gfxKey, palKey, url };
}

/** 1:1 décomp text_window.c:GetWindowFrameTilesPal — retourne `{tiles, pal}`
 *  pour le frame style donné (0-19, indexed by save block).
 *  Retourne des buffers vides si l'asset n'est pas chargé (= preload manqué). */
export function GetWindowFrameTilesPal(idx: number): { tiles: Uint8Array; pal: Uint16Array } {
  const n = (idx % WINDOW_FRAMES_COUNT) + 1;
  const { gfxKey, palKey } = frameAssetKeys(n);
  const tiles = (getAsset(gfxKey) as Uint8Array | undefined) ?? new Uint8Array(0x120);
  const pal = (getAsset(palKey) as Uint16Array | undefined) ?? new Uint16Array(16);
  return { tiles, pal };
}

/** 1:1 décomp `text_window.c:LoadWindowGfx(windowId, frameId, destOffset, palOffset)` :
 *    LoadBgTiles(bgLayer, sWindowFrames[frameId].tiles, 0x120, destOffset);
 *    LoadPalette(sWindowFrames[frameId].pal, palOffset, PLTT_SIZE_4BPP);
 *
 *  Charge les 9 tiles 4bpp (= 0x120 bytes) du frame N dans BG VRAM à destOffset
 *  + écrit les 16 colors du frame palette dans gPlttBufferFaded à palOffset. */
export function LoadWindowGfx(bg: number, frameId: number, destOffset: number, palOffset: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const { tiles, pal } = GetWindowFrameTilesPal(frameId);
  LoadBgTiles(bg, tiles, 0x120, destOffset);
  for (let i = 0; i < Math.min(16, pal.length); i++) {
    rt.gPlttBufferUnfaded.set(palOffset + i, pal[i]);
    rt.gPlttBufferFaded.set(palOffset + i, pal[i]);
  }
}

/** 1:1 décomp `text_window.c:LoadUserWindowBorderGfx(windowId, destOffset, palOffset)` :
 *    LoadWindowGfx(windowId, gSaveBlock2Ptr->optionsWindowFrameType, destOffset, palOffset);
 *
 *  Utilise le frame style sélectionné par le user dans le menu OPTIONS
 *  (= gSaveBlock2Ptr.optionsWindowFrameType, default 0). */
export function LoadUserWindowBorderGfx(bg: number, destOffset: number, palOffset: number): void {
  const frameId = gSaveBlock2Ptr.optionsWindowFrameType ?? 0;
  LoadWindowGfx(bg, frameId, destOffset, palOffset);
}

/** Alias 1:1 décomp `LoadUserWindowBorderGfx_` (= same as without underscore). */
export const LoadUserWindowBorderGfx_ = LoadUserWindowBorderGfx;

/** 1:1 décomp `void DrawTextBorderOuter(u8 windowId, u16 tileNum, u8 palNum)`
 *  (text_window.c:115-131). Dessine le cadre EXTÉRIEUR (8 rects de tiles
 *  autour de la fenêtre : 4 coins + 4 bords ; tileNum+4 = centre NON dessiné
 *  par Outer, 1:1 décomp). Helper text_window.c PARTAGÉ (mystery gift, et
 *  futurs PC/shop). `bgLayer` dérivé de windowId via GetWindowAttribute,
 *  comme la chaîne d'appel décomp (LoadWindowGfx → GetWindowAttribute
 *  windowId WINDOW_BG). */
export function DrawTextBorderOuter(windowId: number, tileNum: number, palNum: number): void {
  const bgLayer = GetWindowAttribute(windowId, WINDOW_BG);
  const tilemapLeft = GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT);
  const tilemapTop = GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP);
  const width = GetWindowAttribute(windowId, WINDOW_WIDTH);
  const height = GetWindowAttribute(windowId, WINDOW_HEIGHT);

  FillBgTilemapBufferRect(bgLayer, tileNum + 0, tilemapLeft - 1,     tilemapTop - 1,      1,     1,      palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 1, tilemapLeft,         tilemapTop - 1,      width, 1,      palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 2, tilemapLeft + width, tilemapTop - 1,      1,     1,      palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 3, tilemapLeft - 1,     tilemapTop,          1,     height, palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 5, tilemapLeft + width, tilemapTop,          1,     height, palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 6, tilemapLeft - 1,     tilemapTop + height, 1,     1,      palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 7, tilemapLeft,         tilemapTop + height, width, 1,      palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 8, tilemapLeft + width, tilemapTop + height, 1,     1,      palNum);
}

/** Pré-charge les 20 frame styles + leurs palettes dans assetCache.
 *  À call au boot (= avant que la moindre scène appelle GetWindowFrameTilesPal).
 *  Idempotent : skip les assets déjà cached. */
export async function preloadTextWindowFrames(): Promise<void> {
  const tasks: Promise<void>[] = [];
  for (let n = 1; n <= WINDOW_FRAMES_COUNT; n++) {
    const { gfxKey, palKey, url } = frameAssetKeys(n);
    if (assetCache.has(gfxKey) && assetCache.has(palKey)) continue;
    tasks.push(
      (async () => {
        try {
          const png = await loadIndexedPngStrict(url, 4);
          assetCache.set(gfxKey, png.charData);
          assetCache.set(palKey, png.palette);
        } catch (e) {
          console.warn(`[text_window] frame ${n} load failed:`, e);
        }
      })(),
    );
  }

  // 1:1 décomp graphics.c:1472-1473 — gMessageBox_Gfx + gMessageBox_Pal
  // (= text_window/message_box.png 56x16 = 14 tiles 4bpp). C'est la frame
  // border verte/cyan du dialog box utilisée partout dans le jeu (Birch,
  // overworld dialogues, party menu, pokedex, etc.) via LoadMessageBoxGfx.
  if (!assetCache.has('gMessageBox_Gfx') || !assetCache.has('gMessageBox_Pal')) {
    tasks.push(
      (async () => {
        try {
          const png = await loadIndexedPngStrict('/decomp/em/text_window/message_box.png', 4);
          assetCache.set('gMessageBox_Gfx', png.charData);
          assetCache.set('gMessageBox_Pal', png.palette);
        } catch (e) {
          console.warn('[text_window] message_box load failed:', e);
        }
      })(),
    );
  }

  await Promise.all(tasks);
  console.log(`[text_window] preload done (${WINDOW_FRAMES_COUNT} frames + message_box cached)`);
}

// Expose pour les auto files qui résolvent via globalThis scope.
(globalThis as Record<string, unknown>).GetWindowFrameTilesPal = GetWindowFrameTilesPal;
