/**
 * Tile decoder 4bpp/8bpp 1:1 GBA.
 *
 * Format VRAM tiles :
 *   - 4bpp : 32 bytes par tile 8×8. Chaque byte = 2 pixels (low nibble = left).
 *   - 8bpp : 64 bytes par tile 8×8. 1 byte = 1 pixel.
 *
 * Char data layout :
 *   - 4bpp : 1 tile = 32 bytes → 1024 tiles par 32KB char base
 *   - 8bpp : 1 tile = 64 bytes → 512 tiles par 32KB char base
 *
 * On stocke les char data en `Uint8Array` brute. Le décodage produit un
 * `Uint8Array(64)` d'indices palette (0-15 ou 0-255) à utiliser avec
 * `PaletteBanks.getBgRgba(bank, idx, paletteMode)`.
 */

const TILE_SIZE_PX = 8;
const PIXELS_PER_TILE = TILE_SIZE_PX * TILE_SIZE_PX; // 64

export const TILE_BYTES_4BPP = 32;
export const TILE_BYTES_8BPP = 64;

/**
 * Décode une tile 4bpp depuis charData → indices palette 0-15.
 * @param charData buffer source (32KB max par char base)
 * @param tileId index de la tile dans charData
 * @param flipH si true, inverse horizontalement
 * @param flipV si true, inverse verticalement
 * @returns Uint8Array(64) d'indices palette
 */
export function decodeTile4bpp(
  charData: Uint8Array,
  tileId: number,
  flipH: boolean,
  flipV: boolean,
): Uint8Array {
  const out = new Uint8Array(PIXELS_PER_TILE);
  const baseOffset = tileId * TILE_BYTES_4BPP;
  if (baseOffset + TILE_BYTES_4BPP > charData.length) return out;

  for (let row = 0; row < 8; row++) {
    const srcRow = flipV ? (7 - row) : row;
    for (let pairCol = 0; pairCol < 4; pairCol++) {
      const byte = charData[baseOffset + srcRow * 4 + pairCol];
      // Low nibble = left pixel, high nibble = right pixel
      const leftIdx = byte & 0xF;
      const rightIdx = (byte >> 4) & 0xF;
      const dstColLeft = flipH ? (7 - pairCol * 2) : (pairCol * 2);
      const dstColRight = flipH ? (7 - pairCol * 2 - 1) : (pairCol * 2 + 1);
      out[row * 8 + dstColLeft] = leftIdx;
      out[row * 8 + dstColRight] = rightIdx;
    }
  }
  return out;
}

/**
 * Décode une tile 8bpp depuis charData → indices palette 0-255.
 */
export function decodeTile8bpp(
  charData: Uint8Array,
  tileId: number,
  flipH: boolean,
  flipV: boolean,
): Uint8Array {
  const out = new Uint8Array(PIXELS_PER_TILE);
  const baseOffset = tileId * TILE_BYTES_8BPP;
  if (baseOffset + TILE_BYTES_8BPP > charData.length) return out;

  for (let row = 0; row < 8; row++) {
    const srcRow = flipV ? (7 - row) : row;
    for (let col = 0; col < 8; col++) {
      const srcCol = flipH ? (7 - col) : col;
      out[row * 8 + col] = charData[baseOffset + srcRow * 8 + srcCol];
    }
  }
  return out;
}
