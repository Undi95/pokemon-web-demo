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

import { assetCache, getAsset } from './decomp-globals';
import { loadIndexedPngStrict } from './gba/png-loader';

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
  await Promise.all(tasks);
  console.log(`[text_window] preload done (${WINDOW_FRAMES_COUNT} frames cached)`);
}

// Expose pour les auto files qui résolvent via globalThis scope.
(globalThis as Record<string, unknown>).GetWindowFrameTilesPal = GetWindowFrameTilesPal;
