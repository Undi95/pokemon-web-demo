/**
 * LZ77 décodeur GBA (= LZSS variant utilisé par le BIOS GBA SWI 0x11/0x12).
 *
 * 1:1 spec : https://problemkaputt.de/gbatek.htm#biosdecompressionfunctions
 * + cf. décomp `tools/agbcc/lib/libgcc/lz77.c`.
 *
 * Format :
 *   - Header 4 bytes : 0x10 + decompressedSize (3 bytes little-endian)
 *   - Suite : blocs de [1 byte flag + N data]
 *     - Flag : 8 bits, MSB first. Pour chaque bit i (7→0) :
 *       - 0 : 1 literal byte (copy direct)
 *       - 1 : back-reference 2 bytes
 *         - byte0 : (length-3) << 4 | (disp >> 8) & 0x0F  (length 3-18, disp 1-4096)
 *         - byte1 : disp & 0xFF
 *         - copy `length` bytes from `currentDstPos - disp - 1`
 *
 * Notre engine n'utilise généralement PAS ça car le pipeline gbagfx du décomp
 * pré-décompresse les .lz en .png/.bin (que nos loaders fetch direct). Mais cet
 * helper est dispo pour les cas où on chargerait directement les .lz raw.
 *
 * Usage :
 *   const lz77Buf = await fetch('/path/to/file.lz').then(r => r.arrayBuffer());
 *   const decompressed = LZ77UnComp(lz77Buf);
 */

/**
 * Décompresse un buffer LZ77 GBA (header 4 bytes + body LZSS).
 * @returns Uint8Array contenant les bytes décompressés.
 */
export function LZ77UnComp(src: ArrayBuffer | Uint8Array): Uint8Array {
  const data = src instanceof Uint8Array ? src : new Uint8Array(src);
  if (data.length < 4) throw new Error('LZ77UnComp: source too short (need 4 bytes header)');

  // Header : byte 0 = 0x10 (LZSS magic), bytes 1-3 = decompressed size little-endian
  const magic = data[0];
  if (magic !== 0x10) {
    throw new Error(`LZ77UnComp: invalid magic 0x${magic.toString(16)} (expected 0x10)`);
  }
  const decompressedSize = data[1] | (data[2] << 8) | (data[3] << 16);
  const dst = new Uint8Array(decompressedSize);

  let srcPos = 4;
  let dstPos = 0;

  while (dstPos < decompressedSize && srcPos < data.length) {
    const flagByte = data[srcPos++];
    // Process 8 bits MSB first
    for (let bit = 7; bit >= 0; bit--) {
      if (dstPos >= decompressedSize) break;
      if (srcPos >= data.length) break;

      if ((flagByte >> bit) & 1) {
        // Back-reference : 2 bytes
        if (srcPos + 1 >= data.length) {
          throw new Error(`LZ77UnComp: unexpected EOF in back-ref at srcPos ${srcPos}`);
        }
        const b0 = data[srcPos++];
        const b1 = data[srcPos++];
        const length = ((b0 >> 4) & 0x0F) + 3;            // 3-18 bytes
        const disp   = (((b0 & 0x0F) << 8) | b1) + 1;     // 1-4096 bytes
        const refStart = dstPos - disp;
        if (refStart < 0) {
          throw new Error(`LZ77UnComp: invalid back-ref disp ${disp} at dstPos ${dstPos}`);
        }
        for (let i = 0; i < length && dstPos < decompressedSize; i++) {
          dst[dstPos] = dst[refStart + i];
          dstPos++;
        }
      } else {
        // Literal byte
        dst[dstPos++] = data[srcPos++];
      }
    }
  }

  return dst;
}

/**
 * 1:1 décomp `LZ77UnCompVram(src, dst)`. Sur GBA réel = SWI 0x12. Notre version :
 * décompresse `src` (buffer LZ77) et copie dans `dst` (Uint8Array d'output).
 * Pour notre usage TS : on retourne juste le décompressé.
 */
export function LZ77UnCompVram(src: ArrayBuffer | Uint8Array): Uint8Array {
  return LZ77UnComp(src);
}

/** Alias 1:1 décomp `LZDecompressVram`. */
export const LZDecompressVram = LZ77UnCompVram;

/**
 * Helper async : fetch un fichier .lz + décompresse.
 * @returns Uint8Array décompressé.
 */
export async function fetchAndDecompressLz(url: string): Promise<Uint8Array> {
  const buf = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`fetchAndDecompressLz: ${url} → ${r.status}`);
    return r.arrayBuffer();
  });
  return LZ77UnComp(buf);
}
