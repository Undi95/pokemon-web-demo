/**
 * dynamic_placeholder_text_util.ts — port 1:1 STRICT de
 * `decomps/pokeemeraude/src/dynamic_placeholder_text_util.c`.
 *
 * Byte-level (Stage 3, 2026-06-24) : opère sur des `Uint8Array` charmap, comme la
 * décomp. `CHAR_DYNAMIC (0xF7)` suivi d'un byte index → remplacé par les bytes de
 * `sStringPointers[idx]`. (Avant : voie JS-string transitoire avec tokens `{DYNAMIC n}` ;
 * la voie byte est désormais directe, le layout est encodé via `encodeOwText` qui
 * émet `[CHAR_DYNAMIC, n]`.)
 *
 * Source décomp (intégrale) :
 *   static EWRAM_DATA const u8 *sStringPointers[8] = {};
 *   Reset()                    → for i<8: sStringPointers[i]=NULL
 *   SetPlaceholderPtr(idx,ptr) → if (idx<8) sStringPointers[idx]=ptr
 *   GetPlaceholderPtr(idx)     → return sStringPointers[idx]
 *   ExpandPlaceholders(d,s)    → while(*s!=EOS){ if(*s!=CHAR_DYNAMIC)*d++=*s++;
 *                                else{ s++; if(sStringPointers[*s]) d=StringCopy
 *                                (d,sStringPointers[*s]); s++; } } *d=EOS; return d;
 */

import { EOS, CHAR_DYNAMIC } from '../include/constants/characters';
import { StringCopy } from './string_util';

/** 1:1 décomp `static EWRAM_DATA const u8 *sStringPointers[8] = {}`. */
const sStringPointers: (Uint8Array | null)[] = [null, null, null, null, null, null, null, null];

/** 1:1 décomp `DynamicPlaceholderTextUtil_Reset`. */
export function DynamicPlaceholderTextUtil_Reset(): void {
  for (let i = 0; i < sStringPointers.length; i++) {
    sStringPointers[i] = null;
  }
}

/** 1:1 décomp `DynamicPlaceholderTextUtil_SetPlaceholderPtr(idx, ptr)`. */
export function DynamicPlaceholderTextUtil_SetPlaceholderPtr(idx: number, ptr: Uint8Array): void {
  if (idx >= 0 && idx < sStringPointers.length) {
    sStringPointers[idx] = ptr;
  }
}

/** 1:1 décomp `DynamicPlaceholderTextUtil_GetPlaceholderPtr(idx)`. */
export function DynamicPlaceholderTextUtil_GetPlaceholderPtr(idx: number): Uint8Array | null {
  return sStringPointers[idx] ?? null;
}

/** 1:1 décomp `u8 *DynamicPlaceholderTextUtil_ExpandPlaceholders(u8 *dest, const u8 *src)` :
 *  scanne `src` ; sur `CHAR_DYNAMIC` (0xF7) lit l'index suivant et `StringCopy` le
 *  buffer `sStringPointers[idx]` dans `dest` (skip si NULL), sinon recopie le byte.
 *  Termine `dest` par EOS, retourne le `dest` avancé (subarray à l'EOS). */
export function DynamicPlaceholderTextUtil_ExpandPlaceholders(dest: Uint8Array, src: Uint8Array): Uint8Array {
  let d = 0;
  let s = 0;
  while (src[s] !== EOS) {
    if (src[s] !== CHAR_DYNAMIC) {
      dest[d++] = src[s++];
    } else {
      s++;
      const ptr = sStringPointers[src[s]];
      if (ptr != null) {
        // 1:1 décomp `dest = StringCopy(dest, sStringPointers[*src])`.
        const before = dest.subarray(d);
        const after = StringCopy(before, ptr);
        d += before.length - after.length;
      }
      s++;
    }
  }
  dest[d] = EOS;
  return dest.subarray(d);
}
