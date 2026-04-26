/**
 * Compositor 1:1 GBA — combine BG layers + OAM sprites par priority par scanline.
 *
 * Ordre de rendu pour un pixel (1:1 GBADEK) :
 *   1. Backdrop color (BG palette[0])
 *   2. BG layers visibles, par priority décroissante (3 → 0), puis BG3, BG2, BG1, BG0
 *   3. OAM sprites visibles, par priority puis sprite index croissant
 *   4. Blending (BLDCNT / BLDALPHA / BLDY) sur top 2 layers selon target1/target2
 *   5. Window masking (WIN0/WIN1/WINOBJ/WINOUT) — seuls les layers permis sont visibles
 *
 * Pour MVP minimal : juste BG layers, sans OAM/blend/window.
 * Ces étapes seront ajoutées dans des sessions suivantes.
 */
import { type BgConfig, type HBlankCallback, SCREEN_W, SCREEN_H } from './types';
import { PaletteBanks } from './palette';
import { renderBgScanline, createTileCache } from './bg-layer';

interface BgLayerData {
  config: BgConfig;
  vram: Uint8Array;        // char data (max 32KB)
  tilemap: Uint16Array;    // map entries
}

/**
 * Compositor minimal — render une frame complète dans `frameBuffer` (Uint8ClampedArray
 * de 240*160*4 = 153 600 bytes RGBA).
 *
 * Pour chaque scanline 0-159 :
 *   1. Run HBLANK callback si défini (avant rendu de cette scanline)
 *   2. Backdrop color
 *   3. Render chaque BG layer visible dans un scanline buffer temp
 *   4. Compose les BG layers par priority (priority 3 dessous, 0 dessus)
 *   5. Write scanline finale dans frameBuffer
 *
 * @param frameBuffer 240×160×4 bytes RGBA, OUT
 * @param bgs 4 BG layers (BG0-3)
 * @param palette palette banks
 * @param hblankCallback optional (frame avant scanline 0..159)
 */
export function composeFrame(
  frameBuffer: Uint8ClampedArray,
  bgs: ReadonlyArray<BgLayerData>,
  palette: PaletteBanks,
  hblankCallback?: HBlankCallback,
): void {
  const scanlineBufs: Uint8ClampedArray[] = bgs.map(() => new Uint8ClampedArray(SCREEN_W * 4));
  const tileCaches = bgs.map(() => createTileCache());
  const backdrop = palette.getBackdropRgba();

  for (let y = 0; y < SCREEN_H; y++) {
    if (hblankCallback) hblankCallback(y);

    // Render chaque BG layer dans son scanline buf
    for (let i = 0; i < bgs.length; i++) {
      renderBgScanline(y, bgs[i].config, bgs[i].vram, bgs[i].tilemap, palette, scanlineBufs[i], tileCaches[i]);
    }

    // Compose : pour chaque pixel, prend le premier non-transparent en suivant
    // l'ordre priority croissant (0 = devant) puis BG index croissant (BG0 > BG1).
    // Algorithme simple : on parcourt par BG index trié par priority (décroissant
    // puis croissant), et on garde le dernier pixel opaque.
    const sortedBgs = [...bgs.keys()].sort((a, b) => {
      // Priority croissante (3 dessous, 0 dessus). Égalité = BG index croissant inverse
      // (BG3 dessous, BG0 dessus en cas d'égalité).
      const pa = bgs[a].config.priority;
      const pb = bgs[b].config.priority;
      if (pa !== pb) return pb - pa;  // priority haute (3) avant
      return b - a;                    // BG index haut (3) avant
    });

    for (let x = 0; x < SCREEN_W; x++) {
      // Init avec backdrop
      let r = backdrop[0], g = backdrop[1], b = backdrop[2];
      const off = x * 4;
      for (const bgIdx of sortedBgs) {
        const sl = scanlineBufs[bgIdx];
        const a = sl[off + 3];
        if (a > 0) {
          r = sl[off];
          g = sl[off + 1];
          b = sl[off + 2];
        }
      }
      const fbOff = (y * SCREEN_W + x) * 4;
      frameBuffer[fbOff] = r;
      frameBuffer[fbOff + 1] = g;
      frameBuffer[fbOff + 2] = b;
      frameBuffer[fbOff + 3] = 255;
    }
  }
}
