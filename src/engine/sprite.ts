/**
 * src/engine/sprite.ts — port 1:1 STRICT de decomp/src/sprite.c (1759l).
 *
 * Sections portées (palette+tile+OAM matrix tag system) :
 *   - FreeAllSpritePalettes  (sprite.c:1581-1587)
 *   - LoadSpritePalette      (sprite.c:1589-1608)
 *   - LoadSpritePalettes     (sprite.c:1610-1616)
 *   - DoLoadSpritePalette    (sprite.c:1618-1621)
 *   - AllocSpritePalette     (sprite.c:1623-1635)
 *   - IndexOfSpritePaletteTag(sprite.c:1637-1645)
 *   - GetSpritePaletteTagByPaletteNum (sprite.c:1647-1650)
 *   - FreeSpritePaletteByTag (sprite.c:1652-1657)
 *   - AllocOamMatrix         (sprite.c:1427-1446)
 *   - FreeOamMatrix          (sprite.c:1448-1461)
 *
 * Substrat : la source de vérité pour `sSpritePaletteTags[16]` est
 * `rt.paletteTagToSlot: Map<string, number>` (= sémantiquement équivalent au
 * décomp, juste indexé par string tag au lieu de u16 array slot — notre runtime
 * utilise des tags string comme 'PALTAG_LOGO' ainsi que numériques 0x1006).
 *
 * BUG RACINE RÉSOLU : avant ce module, plusieurs callers faisaient
 *   `rt.nextObjPalSlot++` direct (= counter monotone), bypassant le scan
 *   first-free. Le décomp utilise `IndexOfSpritePaletteTag(TAG_NONE)` qui
 *   trouve le PREMIER slot LIBRE dans `[gReservedSpritePaletteCount, 16)`.
 *   Saturation du counter → écrasement palette player+PNJ après plusieurs
 *   cycles PC/bag. Fix : tous les callers migrés vers AllocSpritePalette /
 *   LoadSpritePalette qui sont 1:1 décomp.
 *
 * Cycle ESM : sprite.ts utilise un setter injection (_setSpriteRuntimeGetter)
 *   au lieu d'importer getRuntime depuis decomp-globals.ts. decomp-globals.ts
 *   appelle le setter au boot via setGlobalRuntime. Évite TDZ cycle.
 */
import type { DecompRuntime } from './decomp-runtime';
import { OBJ_PLTT_ID } from './decomp-runtime';

// ─── Constantes 1:1 décomp include/sprite.h + include/gba/defines.h ─────────

export const TAG_NONE = 0xFFFF;
export const MAX_SPRITES = 64;
export const OAM_MATRIX_COUNT = 32;
export const TOTAL_OBJ_TILE_COUNT = 1024;
export const TILE_SIZE_4BPP = 32;
export const PLTT_SIZE_4BPP = 32;

// ─── Setter injection pour rompre le cycle ESM avec decomp-globals.ts ──────

let _runtimeGetter: (() => DecompRuntime) | null = null;
let _assetGetter: ((symbol: string) => Uint8Array | Uint16Array | null) | null = null;

/** Wire le runtime accessor. Appelé une fois au boot par decomp-globals.ts
 *  `setGlobalRuntime()`. */
export function _setSpriteRuntimeGetter(
  getRt: () => DecompRuntime,
  getAsset: (symbol: string) => Uint8Array | Uint16Array | null,
): void {
  _runtimeGetter = getRt;
  _assetGetter = getAsset;
}

function _rt(): DecompRuntime {
  if (!_runtimeGetter) throw new Error('sprite.ts: runtime not wired (call _setSpriteRuntimeGetter)');
  return _runtimeGetter();
}

function _asset(symbol: string): Uint8Array | Uint16Array | null {
  if (!_assetGetter) return null;
  return _assetGetter(symbol);
}

// ─── gReservedSpritePaletteCount accessor ──────────────────────────────────
// Exposé via globalThis (defineProperty getter/setter dans decomp-globals.ts).
// 1:1 décomp : `COMMON_DATA u8 gReservedSpritePaletteCount = 0;` (sprite.c:278)

function _getReserved(): number {
  return ((globalThis as Record<string, unknown>).gReservedSpritePaletteCount as number) ?? 0;
}

function _setReserved(v: number): void {
  (globalThis as Record<string, unknown>).gReservedSpritePaletteCount = v;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PALETTE TAG SYSTEM (sprite.c:1581-1657)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/sprite.c:1581-1587 :
 *  ```c
 *  void FreeAllSpritePalettes(void) {
 *      u8 i;
 *      gReservedSpritePaletteCount = 0;
 *      for (i = 0; i < 16; i++)
 *          sSpritePaletteTags[i] = TAG_NONE;
 *  }
 *  ```
 */
export function FreeAllSpritePalettes(): void {
  const r = _rt();
  _setReserved(0);
  r.paletteTagToSlot.clear();
  // Reset nextObjPalSlot pour compat lecteurs legacy (= devtools, etc.).
  r.nextObjPalSlot = 0;
}

/** 1:1 décomp src/sprite.c:1637-1645 :
 *  ```c
 *  u8 IndexOfSpritePaletteTag(u16 tag) {
 *      u8 i;
 *      for (i = gReservedSpritePaletteCount; i < 16; i++)
 *          if (sSpritePaletteTags[i] == tag)
 *              return i;
 *      return 0xFF;
 *  }
 *  ```
 *
 *  ⚠️ Le décomp itère DEPUIS gReservedSpritePaletteCount → un slot ALLOUÉ
 *     dans la zone réservée (< gReservedSpritePaletteCount) est INVISIBLE.
 *     C'est intentionnel : la zone réservée est gérée par d'autres systèmes
 *     (battle sprite palettes) qui ne passent pas par ce tag lookup.
 */
export function IndexOfSpritePaletteTag(tag: string | number): number {
  const r = _rt();
  const slot = r.paletteTagToSlot.get(String(tag));
  if (slot === undefined) return 0xFF;
  if (slot < _getReserved()) return 0xFF;
  return slot;
}

/** Helper interne : scan PREMIER slot OBJ palette LIBRE dans
 *  `[gReservedSpritePaletteCount, 16)`. Équivalent à
 *  `IndexOfSpritePaletteTag(TAG_NONE)` du décomp puisque les slots vides
 *  ont sSpritePaletteTags[i] == TAG_NONE.
 *  Retourne 0xFF si tous les slots [reserved, 16) sont occupés. */
function _findFirstFreeSlot(): number {
  const r = _rt();
  const used = new Set<number>();
  for (const s of r.paletteTagToSlot.values()) used.add(s);
  const reserved = _getReserved();
  for (let slot = reserved; slot < 16; slot++) {
    if (!used.has(slot)) return slot;
  }
  return 0xFF;
}

/** 1:1 décomp src/sprite.c:1623-1635 :
 *  ```c
 *  u8 AllocSpritePalette(u16 tag) {
 *      u8 index = IndexOfSpritePaletteTag(TAG_NONE);
 *      if (index == 0xFF) return 0xFF;
 *      sSpritePaletteTags[index] = tag;
 *      return index;
 *  }
 *  ```
 *
 *  ⚠️ Le décomp ne CHECK PAS si tag est déjà alloué — il alloue UN NOUVEAU
 *     slot et associe ce tag. Si tag déjà présent ailleurs, on a DEUX slots
 *     avec le même tag (= comportement décomp authentique, mais l'appelant
 *     évite généralement via IndexOfSpritePaletteTag check en amont).
 *     Notre LoadSpritePalette fait le check (= 1:1 décomp ligne 1591).
 */
export function AllocSpritePalette(tag: string | number): number {
  const slot = _findFirstFreeSlot();
  if (slot === 0xFF) return 0xFF;
  const r = _rt();
  r.paletteTagToSlot.set(String(tag), slot);
  // Maintain nextObjPalSlot pour compat lecteurs legacy (sans bypass alloc).
  if (slot + 1 > r.nextObjPalSlot) r.nextObjPalSlot = slot + 1;
  return slot;
}

/** 1:1 décomp src/sprite.c:1647-1650 :
 *  ```c
 *  u16 GetSpritePaletteTagByPaletteNum(u8 paletteNum) {
 *      return sSpritePaletteTags[paletteNum];
 *  }
 *  ```
 *  Retourne le tag à ce slot, ou TAG_NONE si vide. Notre runtime utilise
 *  string tags → si le tag d'origine était numérique on retourne le u16,
 *  sinon on hash le string en u16 (= compat tools qui attendent u16). */
export function GetSpritePaletteTagByPaletteNum(paletteNum: number): number {
  const r = _rt();
  for (const [tag, slot] of r.paletteTagToSlot.entries()) {
    if (slot === paletteNum) {
      const asNum = Number(tag);
      if (!isNaN(asNum)) return asNum & 0xFFFF;
      return _hashTagToU16(tag);
    }
  }
  return TAG_NONE;
}

function _hashTagToU16(tag: string): number {
  let h = 0;
  for (let i = 0; i < tag.length; i++) {
    h = (h * 31 + tag.charCodeAt(i)) | 0;
  }
  return h & 0xFFFF;
}

/** 1:1 décomp src/sprite.c:1652-1657 :
 *  ```c
 *  void FreeSpritePaletteByTag(u16 tag) {
 *      u8 index = IndexOfSpritePaletteTag(tag);
 *      if (index != 0xFF)
 *          sSpritePaletteTags[index] = TAG_NONE;
 *  }
 *  ```
 */
export function FreeSpritePaletteByTag(tag: string | number): void {
  const r = _rt();
  const tagStr = String(tag);
  const slot = r.paletteTagToSlot.get(tagStr);
  if (slot === undefined) return;
  if (slot < _getReserved()) return;  // 1:1 décomp : IndexOfSpritePaletteTag skip
  r.paletteTagToSlot.delete(tagStr);
}

/** 1:1 décomp src/sprite.c:1618-1621 :
 *  ```c
 *  void DoLoadSpritePalette(const u16 *src, u16 paletteOffset) {
 *      LoadPalette(src, OBJ_PLTT_OFFSET + paletteOffset, PLTT_SIZE_4BPP);
 *  }
 *  ```
 *  Écrit `src` (16 u16 colors) dans gPlttBufferUnfaded+Faded à
 *  OBJ_PLTT_OFFSET + paletteOffset. paletteOffset = slot × 16 (= PLTT_ID(slot)). */
export function DoLoadSpritePalette(src: Uint16Array, paletteOffset: number): void {
  const r = _rt();
  // OBJ_PLTT_ID(0) = OBJ_PLTT_OFFSET = 256. paletteOffset = slot × 16.
  const dst = OBJ_PLTT_ID(0) + paletteOffset;
  const n = Math.min(16, src.length);
  for (let i = 0; i < n; i++) {
    r.gPlttBufferUnfaded.set(dst + i, src[i]);
    r.gPlttBufferFaded.set(dst + i, src[i]);
  }
}

/** 1:1 décomp src/sprite.c:1589-1608 :
 *  ```c
 *  u8 LoadSpritePalette(const struct SpritePalette *palette) {
 *      u8 index = IndexOfSpritePaletteTag(palette->tag);
 *      if (index != 0xFF)
 *          return index;
 *      index = IndexOfSpritePaletteTag(TAG_NONE);
 *      if (index == 0xFF)
 *          return 0xFF;
 *      sSpritePaletteTags[index] = palette->tag;
 *      DoLoadSpritePalette(palette->data, PLTT_ID(index));
 *      return index;
 *  }
 *  ```
 *
 *  Notre interface :
 *    - palette.data : Uint16Array (direct) | string (asset symbol)
 *    - palette.tag : string | number
 *  Retourne le slot (0-15), ou 0xFF si palette OBJ saturée. */
export function LoadSpritePalette(palette: { data: Uint16Array | string | null | undefined, tag: string | number }): number {
  // 1:1 décomp ligne 1591 : si déjà chargé, return le slot existant.
  const r = _rt();
  const existing = r.paletteTagToSlot.get(String(palette.tag));
  if (existing !== undefined && existing >= _getReserved()) return existing;
  // 1:1 décomp ligne 1596 : trouver premier slot libre.
  const slot = _findFirstFreeSlot();
  if (slot === 0xFF) return 0xFF;
  // 1:1 décomp ligne 1604 : marquer le tag.
  r.paletteTagToSlot.set(String(palette.tag), slot);
  if (slot + 1 > r.nextObjPalSlot) r.nextObjPalSlot = slot + 1;
  // 1:1 décomp ligne 1605 : write palette data.
  let palData: Uint16Array | null = null;
  if (palette.data instanceof Uint16Array) {
    palData = palette.data;
  } else if (typeof palette.data === 'string' && palette.data !== '') {
    const got = _asset(palette.data);
    if (got) {
      palData = got instanceof Uint16Array
        ? got
        : new Uint16Array(got.buffer, got.byteOffset, Math.floor(got.byteLength / 2));
    }
  }
  if (palData) {
    DoLoadSpritePalette(palData, slot * 16);  // PLTT_ID(slot) = slot × 16
  }
  // Décomp returns le slot même si data null (= asset cache miss côté nous) :
  // le tag reste alloué pour que le sprite caller puisse résoudre paletteBank.
  return slot;
}

/** 1:1 décomp src/sprite.c:1610-1616 :
 *  ```c
 *  void LoadSpritePalettes(const struct SpritePalette *palettes) {
 *      u8 i;
 *      for (i = 0; palettes[i].data != NULL; i++)
 *          if (LoadSpritePalette(&palettes[i]) == 0xFF)
 *              break;
 *  }
 *  ```
 */
export function LoadSpritePalettes(palettes: Array<{ data: Uint16Array | string | null | undefined, tag: string | number }>): void {
  for (let i = 0; i < palettes.length; i++) {
    const entry = palettes[i];
    // 1:1 décomp sentinel `palettes[i].data != NULL` end-of-array.
    if (!entry || entry.data === null || entry.data === '' || entry.data === undefined) break;
    if (LoadSpritePalette(entry) === 0xFF) break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OAM MATRIX ALLOC (sprite.c:1427-1461)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/sprite.c:1427-1446 :
 *  ```c
 *  u8 AllocOamMatrix(void) {
 *      u8 i = 0;
 *      u32 bit = 1;
 *      while (i < OAM_MATRIX_COUNT) {
 *          if (!(gOamMatrixAllocBitmap & bit)) {
 *              gOamMatrixAllocBitmap |= bit;
 *              return i;
 *          }
 *          i++; bit <<= 1;
 *      }
 *      return 0xFF;
 *  }
 *  ```
 *  Source unique du bitmap : `(globalThis as any).gOamMatrixAllocBitmap`
 *  (= 1:1 décomp `COMMON_DATA u32 gOamMatrixAllocBitmap = 0;` sprite.c:277). */
export function AllocOamMatrix(): number {
  const g = globalThis as Record<string, unknown>;
  let bitmap = (g.gOamMatrixAllocBitmap as number) ?? 0;
  let bit = 1;
  for (let i = 0; i < OAM_MATRIX_COUNT; i++) {
    if (!(bitmap & bit)) {
      bitmap |= bit;
      g.gOamMatrixAllocBitmap = bitmap >>> 0;  // ensure u32
      return i;
    }
    bit = (bit << 1) >>> 0;
  }
  return 0xFF;
}

/** 1:1 décomp src/sprite.c:1448-1461 :
 *  ```c
 *  void FreeOamMatrix(u8 matrixNum) {
 *      u8 i = 0;
 *      u32 bit = 1;
 *      while (i < matrixNum) {
 *          i++; bit <<= 1;
 *      }
 *      if (matrixNum < OAM_MATRIX_COUNT)
 *          gOamMatrixAllocBitmap &= ~bit;
 *  }
 *  ```
 */
export function FreeOamMatrix(matrixNum: number): void {
  if (matrixNum >= OAM_MATRIX_COUNT) return;
  const g = globalThis as Record<string, unknown>;
  const bitmap = (g.gOamMatrixAllocBitmap as number) ?? 0;
  const bit = (1 << matrixNum) >>> 0;
  g.gOamMatrixAllocBitmap = (bitmap & ~bit) >>> 0;
}
