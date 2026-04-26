/**
 * Palette banks 1:1 GBA hardware.
 *
 * Layout VRAM PLTT (5_0000_0000 - 5_0000_03FF, 1 KB) :
 *   - 256 entries u16 BG palette  (16 banks × 16 colors)
 *   - 256 entries u16 OBJ palette (16 banks × 16 colors)
 * Total : 512 colors RGB15.
 *
 * En 4bpp mode : chaque tile a un index palette bank (0-15) dans son tilemap entry.
 * En 8bpp mode : palette bank ignorée, on utilise les 256 colors directement.
 *
 * Color index 0 dans une bank 4bpp = TRANSPARENT (le BG color show through).
 * Color index 0 de la bank 0 BG = backdrop color (visible si tous les pixels
 * sont transparents).
 */
import { type Rgb15, rgb15ToRgba8 } from './types';

const BANK_SIZE = 16;     // colors per bank en 4bpp
const NUM_BG_BANKS = 16;
const NUM_OBJ_BANKS = 16;
const TOTAL_COLORS = 256; // par BG ou OBJ (16 × 16)

export class PaletteBanks {
  // Storage : Uint16Array(256) = RGB15 entries (× 2 pour BG + OBJ)
  private bgRgb15 = new Uint16Array(TOTAL_COLORS);
  private objRgb15 = new Uint16Array(TOTAL_COLORS);
  // Cache RGBA888 décodé (recalculé à load) : Uint8Array(256 × 4)
  private bgRgba = new Uint8Array(TOTAL_COLORS * 4);
  private objRgba = new Uint8Array(TOTAL_COLORS * 4);

  /** Charge une couleur dans la palette BG.
   *  @param bank 0-15 (4bpp) ou 0 (8bpp = full 256 cols)
   *  @param idx 0-15 (4bpp) ou 0-255 (8bpp)
   *  @param rgb15 couleur RGB15 (0-0x7FFF) */
  loadBg(bank: number, idx: number, rgb15: Rgb15): void {
    const flatIdx = bank * BANK_SIZE + idx;
    if (flatIdx < 0 || flatIdx >= TOTAL_COLORS) return;
    this.bgRgb15[flatIdx] = rgb15 & 0x7FFF;
    this.refreshBgCache(flatIdx);
  }

  /** Charge une plage de couleurs BG depuis un Uint16Array source.
   *  @param destFlatIdx index destination (0-255)
   *  @param colors Rgb15 array */
  loadBgRange(destFlatIdx: number, colors: ArrayLike<number>): void {
    for (let i = 0; i < colors.length; i++) {
      const flatIdx = destFlatIdx + i;
      if (flatIdx >= TOTAL_COLORS) break;
      this.bgRgb15[flatIdx] = colors[i] & 0x7FFF;
      this.refreshBgCache(flatIdx);
    }
  }

  /** Charge une couleur dans la palette OBJ. */
  loadObj(bank: number, idx: number, rgb15: Rgb15): void {
    const flatIdx = bank * BANK_SIZE + idx;
    if (flatIdx < 0 || flatIdx >= TOTAL_COLORS) return;
    this.objRgb15[flatIdx] = rgb15 & 0x7FFF;
    this.refreshObjCache(flatIdx);
  }

  loadObjRange(destFlatIdx: number, colors: ArrayLike<number>): void {
    for (let i = 0; i < colors.length; i++) {
      const flatIdx = destFlatIdx + i;
      if (flatIdx >= TOTAL_COLORS) break;
      this.objRgb15[flatIdx] = colors[i] & 0x7FFF;
      this.refreshObjCache(flatIdx);
    }
  }

  /** Backdrop color = BG palette[0]. Affiché quand tous les layers sont transparents. */
  getBackdropRgba(): readonly [number, number, number, number] {
    return [this.bgRgba[0], this.bgRgba[1], this.bgRgba[2], 255];
  }

  /** Lookup direct RGBA888 pour BG, palette bank × index.
   *  Retourne [r, g, b, a]. a = 0 si idx = 0 dans bank 4bpp (transparent). */
  getBgRgba(bank: number, idx: number, paletteMode: 0 | 1): readonly [number, number, number, number] {
    const flatIdx = paletteMode === 0
      ? bank * BANK_SIZE + idx        // 4bpp : bank × 16 + idx
      : idx;                          // 8bpp : idx direct (0-255)
    const baseOffset = flatIdx * 4;
    // Idx 0 dans une bank 4bpp = transparent (alpha 0).
    // En 8bpp, idx 0 est aussi transparent (cf. GBATEK).
    const isTransparent = (paletteMode === 0 && idx === 0) || (paletteMode === 1 && idx === 0);
    return [
      this.bgRgba[baseOffset],
      this.bgRgba[baseOffset + 1],
      this.bgRgba[baseOffset + 2],
      isTransparent ? 0 : 255,
    ];
  }

  /** Idem pour OBJ. */
  getObjRgba(bank: number, idx: number, paletteMode: 0 | 1): readonly [number, number, number, number] {
    const flatIdx = paletteMode === 0
      ? bank * BANK_SIZE + idx
      : idx;
    const baseOffset = flatIdx * 4;
    const isTransparent = idx === 0;
    return [
      this.objRgba[baseOffset],
      this.objRgba[baseOffset + 1],
      this.objRgba[baseOffset + 2],
      isTransparent ? 0 : 255,
    ];
  }

  /** Reset toutes les palettes à 0 (noir). */
  reset(): void {
    this.bgRgb15.fill(0);
    this.objRgb15.fill(0);
    this.bgRgba.fill(0);
    this.objRgba.fill(0);
  }

  // ─── Internals ──────────────────────────────────────────────────────────────

  private refreshBgCache(flatIdx: number): void {
    const [r, g, b] = rgb15ToRgba8(this.bgRgb15[flatIdx]);
    const off = flatIdx * 4;
    this.bgRgba[off] = r;
    this.bgRgba[off + 1] = g;
    this.bgRgba[off + 2] = b;
    this.bgRgba[off + 3] = 255;
  }

  private refreshObjCache(flatIdx: number): void {
    const [r, g, b] = rgb15ToRgba8(this.objRgb15[flatIdx]);
    const off = flatIdx * 4;
    this.objRgba[off] = r;
    this.objRgba[off + 1] = g;
    this.objRgba[off + 2] = b;
    this.objRgba[off + 3] = 255;
  }
}
