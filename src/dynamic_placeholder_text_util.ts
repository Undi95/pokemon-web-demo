/**
 * dynamic_placeholder_text_util.ts — port 1:1 STRICT de
 * `decomps/pokeemeraude/src/dynamic_placeholder_text_util.c`.
 *
 * Le décomp opère sur des bytes : `CHAR_DYNAMIC (0xF7)` suivi d'un byte index
 * → remplacé par `sStringPointers[idx]`. Notre pipeline texte travaille en
 * tokens `{...}` (= `{COLOR}`, `{LV_2}`, `{DYNAMIC n}` …) : on porte donc
 * `ExpandPlaceholders` au niveau token `{DYNAMIC n}` — comportement IDENTIQUE
 * au byte-level (même string finale), juste la représentation diffère.
 *
 * ⚠️ Le helper homonyme de `decomp-bridge.ts` est un STUB (`return src`). On
 * NE s'en sert PAS : ce module est la vraie implémentation 1:1 (zéro fake).
 *
 * Source décomp (intégrale) :
 *   static EWRAM_DATA const u8 *sStringPointers[8] = {};
 *   Reset()                    → for i<8: sStringPointers[i]=NULL
 *   SetPlaceholderPtr(idx,ptr) → if (idx<8) sStringPointers[idx]=ptr
 *   GetPlaceholderPtr(idx)     → return sStringPointers[idx]
 *   ExpandPlaceholders(d,s)    → while(*s!=EOS){ if(*s!=CHAR_DYNAMIC)*d++=*s++;
 *                                else{ s++; if(sStringPointers[*s]) d=StringCopy
 *                                (d,sStringPointers[*s]); s++; } } *d=EOS;
 */

/** 1:1 décomp `static EWRAM_DATA const u8 *sStringPointers[8] = {}`. */
const sStringPointers: (string | null)[] = [null, null, null, null, null, null, null, null];

/** 1:1 décomp `DynamicPlaceholderTextUtil_Reset` (dynamic_placeholder_text_util.c). */
export function DynamicPlaceholderTextUtil_Reset(): void {
  for (let i = 0; i < sStringPointers.length; i++) {
    sStringPointers[i] = null;
  }
}

/** 1:1 décomp `DynamicPlaceholderTextUtil_SetPlaceholderPtr(idx, ptr)`. */
export function DynamicPlaceholderTextUtil_SetPlaceholderPtr(idx: number, ptr: string): void {
  if (idx >= 0 && idx < sStringPointers.length) {
    sStringPointers[idx] = ptr;
  }
}

/** 1:1 décomp `DynamicPlaceholderTextUtil_GetPlaceholderPtr(idx)`. */
export function DynamicPlaceholderTextUtil_GetPlaceholderPtr(idx: number): string | null {
  return sStringPointers[idx] ?? null;
}

/** 1:1 décomp `DynamicPlaceholderTextUtil_ExpandPlaceholders(dest, src)`.
 *  Token `{DYNAMIC n}` = analogue exact de `CHAR_DYNAMIC + n` byte décomp.
 *  Tout le reste (texte littéral, `{COLOR ...}`, `{LV_2}`, `\n`…) est recopié
 *  verbatim (= `*dest++ = *src++`) et traité plus tard par encodeStringForFont.
 *  Placeholder NULL → skip (1:1 `if (sStringPointers[*src] != NULL)`). */
export function DynamicPlaceholderTextUtil_ExpandPlaceholders(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src[i] === '{') {
      const m = /^\{DYNAMIC (\d+)\}/.exec(src.slice(i));
      if (m) {
        const idx = parseInt(m[1], 10);
        const ptr = (idx >= 0 && idx < sStringPointers.length) ? sStringPointers[idx] : null;
        if (ptr != null) out += ptr;
        i += m[0].length;
        continue;
      }
    }
    out += src[i];
    i++;
  }
  return out;
}
