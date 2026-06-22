/**
 * text_window.ts — miroir 1:1 de `decomp/src/text_window.c` (+ include/text_window.h).
 *
 * Gestion des window-frame tiles partagés entre toutes les scènes (main menu,
 * option menu, dialogues OW, battle, etc.) + le dialog box overworld + les
 * bordures de fenêtre (DrawTextBorderOuter/Inner) + les palettes textbox.
 *
 * SOURCE canonique du miroir : ce fichier remplace l'éparpillement antérieur
 * (engine/ui/gba-text-window.ts + engine/ui/gba-window-system.ts:LoadMessageBoxGfx
 * + engine/system/decomp-bridge.ts:GetTextWindowPalette/GetOverworldTextboxPalettePtr).
 * Ces sites deviennent des re-exports transitoires (→ à supprimer une fois tous
 * les importeurs basculés).
 *
 * COUCHE HW (reste dans engine, importée ici) :
 *   - `LoadBgTiles` (charge des tiles 4bpp en BG VRAM),
 *   - `FillBgTilemapBufferRect` / `GetWindowAttribute` (window framework),
 *   - le chargement d'assets PNG (`loadIndexedPngStrict` + `assetCache`).
 * La LOGIQUE de text_window.c (composition de bordures, sélection de frame,
 * choix de palette) vit ici, 1:1.
 *
 * Données 4bpp : Pokémon Emerald a 20 styles de frames (text_window/1..20.png),
 * chacun 24×24 px = 9 tiles × 32 bytes = 0x120 bytes + palette 16 couleurs ; le
 * user les sélectionne via le menu OPTIONS (`gSaveBlock2Ptr.optionsWindowFrameType`).
 * Naming asset 1:1 text_window.c:9-49 : frame 1 = `gTextWindowFrame1_*` (public),
 * frames 2-20 = `sTextWindowFrameN_*` (static).
 *
 * ⚠️ DETTE 1:1 héritée (NON régressée ici) :
 *   - `sTextWindowPalettes` n'est pas encore préchargé en assetCache →
 *     `GetTextWindowPalette` retourne `null` (= caller skip le load). Asset à
 *     câbler dans `preloadTextWindowFrames` plus tard.
 *   - `LoadPalette` 1:1 (palette.c) pas encore exposé par l'engine → on inline
 *     l'écriture dans gPlttBuffer (faded+unfaded), comme le faisait l'engine.
 */

import { assetCache, getAsset, getRuntime, LoadBgTiles } from '../engine/system/decomp-globals';
import { loadIndexedPngStrict } from '../../harness/gba/png-loader';
import { gSaveBlock2Ptr } from '../engine/save/save-block-state';
import {
  FillBgTilemapBufferRect, GetWindowAttribute,
  WINDOW_BG, WINDOW_TILEMAP_LEFT, WINDOW_TILEMAP_TOP, WINDOW_WIDTH, WINDOW_HEIGHT,
} from '../engine/ui/gba-window-system';

/** 1:1 décomp `text_window.h:4 WINDOW_FRAMES_COUNT`. */
export const WINDOW_FRAMES_COUNT = 20;

/** 1:1 décomp `text_window.h:6-10 struct TilesPal { const u8 *tiles; const u16 *pal; }`. */
export interface TilesPal {
  tiles: Uint8Array;
  pal: Uint16Array;
}

/** PLTT_SIZE_4BPP (palette.h) = 16 couleurs × 2 bytes = 32 bytes. */
const PLTT_SIZE_4BPP = 16;

/** Helper interne (pont asset, pas dans le décomp) : naming pattern décomp +
 *  URL du PNG pour le frame N (1-20). */
function frameAssetKeys(n: number): { gfxKey: string; palKey: string; url: string } {
  const gfxKey = n === 1 ? 'gTextWindowFrame1_Gfx' : `sTextWindowFrame${n}_Gfx`;
  const palKey = n === 1 ? 'gTextWindowFrame1_Pal' : `sTextWindowFrame${n}_Pal`;
  const url = `/decomp/em/ui/text_window/${n}.png`;
  return { gfxKey, palKey, url };
}

/** Helper interne : écrit `count` couleurs depuis `pal` dans gPlttBuffer
 *  (faded + unfaded) à `palOffset`. Substitut transitoire de `LoadPalette`
 *  (palette.c) tant que l'engine ne l'expose pas en 1:1. */
function writePalette(pal: Uint16Array | null | undefined, palOffset: number, count = PLTT_SIZE_4BPP): void {
  const rt = getRuntime();
  if (!rt || !pal) return;
  for (let i = 0; i < Math.min(count, pal.length); i++) {
    rt.gPlttBufferUnfaded.set(palOffset + i, pal[i]);
    rt.gPlttBufferFaded.set(palOffset + i, pal[i]);
  }
}

/** 1:1 décomp `text_window.c:85 GetWindowFrameTilesPal(u8 id)` :
 *    if (id >= WINDOW_FRAMES_COUNT) return &sWindowFrames[0]; else return &sWindowFrames[id];
 *  → retourne `{tiles, pal}` du frame style `id` (0-19). sWindowFrames[i] correspond
 *  à l'asset `(i+1).png` (frame 0 = 1.png). Retourne des buffers vides si l'asset
 *  n'est pas chargé (= preload manqué). */
export function GetWindowFrameTilesPal(id: number): TilesPal {
  const idx = id >= WINDOW_FRAMES_COUNT ? 0 : id;
  const { gfxKey, palKey } = frameAssetKeys(idx + 1);
  const tiles = (getAsset(gfxKey) as Uint8Array | undefined) ?? new Uint8Array(0x120);
  const pal = (getAsset(palKey) as Uint16Array | undefined) ?? new Uint16Array(16);
  return { tiles, pal };
}

/** 1:1 décomp `text_window.c:93 LoadMessageBoxGfx(u8 windowId, u16 destOffset, u8 palOffset)` :
 *    LoadBgTiles(GetWindowAttribute(windowId, WINDOW_BG), gMessageBox_Gfx, 0x1C0, destOffset);
 *    LoadPalette(GetOverworldTextboxPalettePtr(), palOffset, PLTT_SIZE_4BPP);
 *
 *  Charge la frame border du dialog box overworld standard (vert/cyan) + sa palette. */
export function LoadMessageBoxGfx(windowId: number, destOffset: number, palOffset: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const bg = GetWindowAttribute(windowId, WINDOW_BG);

  const gfx = getAsset('gMessageBox_Gfx') as Uint8Array | undefined;
  if (gfx instanceof Uint8Array) {
    LoadBgTiles(bg, gfx, 0x1C0, destOffset);
  } else {
    console.warn('[LoadMessageBoxGfx] gMessageBox_Gfx not preloaded (= preloadTextWindowFrames non appelé) — dialog frame border invisible');
  }

  const pal = GetOverworldTextboxPalettePtr();
  if (pal instanceof Uint16Array) {
    writePalette(pal, palOffset);
  } else {
    console.warn('[LoadMessageBoxGfx] gMessageBox_Pal not preloaded — fallback hardcoded grey palette');
    // Fallback : 4 couleurs basiques (préserve l'ancien comportement) si l'asset
    // n'est pas chargé. Ne devrait pas arriver en flow normal.
    const white = (31) | (31 << 5) | (31 << 10);
    const darkGrey = (7) | (7 << 5) | (7 << 10);
    const lightGrey = (15) | (15 << 5) | (15 << 10);
    rt.gPlttBufferUnfaded.set(palOffset + 0, 0);
    rt.gPlttBufferFaded.set(palOffset + 0, 0);
    rt.gPlttBufferUnfaded.set(palOffset + 1, white);
    rt.gPlttBufferFaded.set(palOffset + 1, white);
    rt.gPlttBufferUnfaded.set(palOffset + 2, darkGrey);
    rt.gPlttBufferFaded.set(palOffset + 2, darkGrey);
    rt.gPlttBufferUnfaded.set(palOffset + 3, lightGrey);
    rt.gPlttBufferFaded.set(palOffset + 3, lightGrey);
  }
}

/** 1:1 décomp `text_window.c:99 LoadUserWindowBorderGfx_(u8 windowId, u16 destOffset, u8 palOffset)` :
 *    LoadUserWindowBorderGfx(windowId, destOffset, palOffset);   // simple wrapper */
export function LoadUserWindowBorderGfx_(windowId: number, destOffset: number, palOffset: number): void {
  LoadUserWindowBorderGfx(windowId, destOffset, palOffset);
}

/** 1:1 décomp `text_window.c:104 LoadWindowGfx(u8 windowId, u8 frameId, u16 destOffset, u8 palOffset)` :
 *    LoadBgTiles(GetWindowAttribute(windowId, WINDOW_BG), sWindowFrames[frameId].tiles, 0x120, destOffset);
 *    LoadPalette(sWindowFrames[frameId].pal, palOffset, PLTT_SIZE_4BPP);
 *
 *  Charge les 9 tiles 4bpp (0x120 bytes) du frame N dans le BG de `windowId` à
 *  `destOffset` + écrit ses 16 couleurs à `palOffset`. */
export function LoadWindowGfx(windowId: number, frameId: number, destOffset: number, palOffset: number): void {
  const bg = GetWindowAttribute(windowId, WINDOW_BG);
  const { tiles, pal } = GetWindowFrameTilesPal(frameId);
  LoadBgTiles(bg, tiles, 0x120, destOffset);
  writePalette(pal, palOffset);
}

/** 1:1 décomp `text_window.c:110 LoadUserWindowBorderGfx(u8 windowId, u16 destOffset, u8 palOffset)` :
 *    LoadWindowGfx(windowId, gSaveBlock2Ptr->optionsWindowFrameType, destOffset, palOffset);
 *
 *  Utilise le frame style sélectionné dans le menu OPTIONS (default 0). */
export function LoadUserWindowBorderGfx(windowId: number, destOffset: number, palOffset: number): void {
  LoadWindowGfx(windowId, gSaveBlock2Ptr.optionsWindowFrameType ?? 0, destOffset, palOffset);
}

/** 1:1 décomp `text_window.c:115 DrawTextBorderOuter(u8 windowId, u16 tileNum, u8 palNum)`.
 *  Dessine le cadre EXTÉRIEUR (4 coins + 4 bords ; tileNum+4 = centre, NON dessiné). */
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

/** 1:1 décomp `text_window.c:133 DrawTextBorderInner(u8 windowId, u16 tileNum, u8 palNum)`.
 *  Variante du cadre où les bords sont posés 1 tile vers l'INTÉRIEUR (utilise
 *  width-2 / height-2). Helper partagé text_window.c (pas encore appelé ici ;
 *  ajouté pour la complétude du miroir). */
export function DrawTextBorderInner(windowId: number, tileNum: number, palNum: number): void {
  const bgLayer = GetWindowAttribute(windowId, WINDOW_BG);
  const tilemapLeft = GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT);
  const tilemapTop = GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP);
  const width = GetWindowAttribute(windowId, WINDOW_WIDTH);
  const height = GetWindowAttribute(windowId, WINDOW_HEIGHT);

  FillBgTilemapBufferRect(bgLayer, tileNum + 0, tilemapLeft,             tilemapTop,              1,         1,          palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 1, tilemapLeft + 1,         tilemapTop,              width - 2, 1,          palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 2, tilemapLeft + width - 1, tilemapTop,              1,         1,          palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 3, tilemapLeft,             tilemapTop + 1,          1,         height - 2, palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 5, tilemapLeft + width - 1, tilemapTop + 1,          1,         height - 2, palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 6, tilemapLeft,             tilemapTop + height - 1, 1,         1,          palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 7, tilemapLeft + 1,         tilemapTop + height - 1, width - 2, 1,          palNum);
  FillBgTilemapBufferRect(bgLayer, tileNum + 8, tilemapLeft + width - 1, tilemapTop + height - 1, 1,         1,          palNum);
}

/** 1:1 décomp `text_window.c:151 rbox_fill_rectangle(u8 windowId)` :
 *    FillBgTilemapBufferRect(bgLayer, 0, tilemapLeft-1, tilemapTop-1, width+2, height+2, 0x11);
 *  Efface (tile 0, palette 0x11) le rectangle window + bordure. Pas encore
 *  appelé ici ; ajouté pour la complétude du miroir. */
export function rbox_fill_rectangle(windowId: number): void {
  const bgLayer = GetWindowAttribute(windowId, WINDOW_BG);
  const tilemapLeft = GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT);
  const tilemapTop = GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP);
  const width = GetWindowAttribute(windowId, WINDOW_WIDTH);
  const height = GetWindowAttribute(windowId, WINDOW_HEIGHT);

  FillBgTilemapBufferRect(bgLayer, 0, tilemapLeft - 1, tilemapTop - 1, width + 2, height + 2, 0x11);
}

/** 1:1 décomp `text_window.c:162 GetTextWindowPalette(u8 id)` : sélectionne 1 des
 *  5 banques palette (offsets 0x00/0x10/0x20/0x30/0x40 dans sTextWindowPalettes).
 *  ⚠️ DETTE : `sTextWindowPalettes` pas encore préchargé → retourne `null`
 *  (= caller skip le load), comportement inchangé. */
export function GetTextWindowPalette(id: number): Uint16Array | null {
  const pal = getAsset('sTextWindowPalettes') as Uint16Array | undefined;
  if (pal instanceof Uint16Array) {
    const offset = Math.min(id, 4) * 16;
    return pal.subarray(offset, offset + 16);
  }
  return null;
}

/** 1:1 décomp `text_window.c:187 GetOverworldTextboxPalettePtr(void)` :
 *    return gMessageBox_Pal;  // palette 16 couleurs du message box OW standard. */
export function GetOverworldTextboxPalettePtr(): Uint16Array | null {
  const pal = getAsset('gMessageBox_Pal') as Uint16Array | undefined;
  if (pal instanceof Uint16Array) return pal;
  return null;
}

/** 1:1 décomp `text_window.c:193 LoadUserWindowBorderGfxOnBg(u8 bg, u16 destOffset, u8 palOffset)` :
 *    LoadBgTiles(bg, sWindowFrames[optionsWindowFrameType].tiles, 0x120, destOffset);
 *    LoadPalette(GetWindowFrameTilesPal(optionsWindowFrameType)->pal, palOffset, PLTT_SIZE_4BPP);
 *
 *  Comme LoadUserWindowBorderGfx mais en spécifiant le BG directement (pas via
 *  windowId). Pas encore appelé ici ; ajouté pour la complétude du miroir. */
export function LoadUserWindowBorderGfxOnBg(bg: number, destOffset: number, palOffset: number): void {
  const frameId = gSaveBlock2Ptr.optionsWindowFrameType ?? 0;
  const { tiles, pal } = GetWindowFrameTilesPal(frameId);
  LoadBgTiles(bg, tiles, 0x120, destOffset);
  writePalette(pal, palOffset);
}

// ════════════════════════════════════════════════════════════════════════════
//  Pont asset (hors décomp) — préchargement des 20 frames + message_box.
// ════════════════════════════════════════════════════════════════════════════

/** Pré-charge les 20 frame styles + leurs palettes + le message_box dans
 *  assetCache. À call au boot (avant tout GetWindowFrameTilesPal/LoadMessageBoxGfx).
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

  // 1:1 décomp graphics.c — gMessageBox_Gfx + gMessageBox_Pal (= text_window/
  // message_box.png 56x16 = 14 tiles 4bpp). Border verte/cyan du dialog box
  // utilisée partout (Birch, dialogues OW, party menu, pokedex…) via LoadMessageBoxGfx.
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

// Expose pour les auto-files qui résolvent via globalThis scope.
(globalThis as Record<string, unknown>).GetWindowFrameTilesPal = GetWindowFrameTilesPal;
