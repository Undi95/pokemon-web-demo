/**
 * src/game/sprite.ts — port 1:1 STRICT de decomp/src/sprite.c (1760l).
 *
 * ┌─ STATUT (chantier moteur E2 — supersede la note « reste en system » 2026-06-09) ──┐
 * │ DÉCISION USER 2026-06-21 : sprite.c rejoint son HOME MIROIR `src/game/sprite.ts`  │
 * │ (= chemin 1:1 de décomp `src/sprite.c`). Le port reste RÉPARTI le temps de la     │
 * │ consolidation (phases E2.x), on réunit tout ICI progressivement :                 │
 * │   • CE fichier (game/sprite.ts) : port MANUEL 1:1 — palette tag system, tile      │
 * │     alloc bitmap, OAM matrix alloc/ops, AllocSpriteTiles, LoadSpriteSheet(s),     │
 * │     CalcCenterToCornerVec, ResetOamRange, LoadOam.  + [E2.2b] SECTION ANIMATION   │
 * │     (BeginAnim, ContinueAnim, AnimCmd_frame|end|jump|loop, AnimateSprite,         │
 * │     Request+ProcessSpriteCopyRequests) foldée depuis sprite-animation.ts (cf. bas).│
 * │   • decomp-runtime.ts (HARNESS, cible E2.3) : struct Sprite (= DecompSprite,      │
 * │     MODÈLE PLAT), gSprites (= TABLEAU NU 64, ex-Map), CreateSpriteAtOam(=Create-  │
 * │     SpriteAt)/ResetSprite/ResetAllSprites/UpdateOamCoords/SortSprites/            │
 * │     BuildSpritePriorities/AddSpritesToOamBuffer(=syncSpritesToOam) — à extraire.  │
 * │   • decomp-data/auto-engine/src/sprite-engine.ts : EXTRACTION AUTO (bodyC = C     │
 * │     littéral + callsTo) des 102 fns sprite.c — regen scripts/extract-engine-      │
 * │     helpers.mjs (miroir de DONNÉES du C).                                         │
 * │   • sprite-engine-impl.ts : BeginAffineAnim/ContinueAffineAnim.                   │
 * │   • decomp-bridge.ts : CreateSprite/CreateSpriteAtEnd/DestroySprite/              │
 * │     StartSpriteAffineAnim/AllocOamMatrix/FreeOamMatrix.                           │
 * │   • decomp-globals.ts : AnimateSprites/BuildOamBuffer/SpriteCallbackDummy/        │
 * │     SetSubspriteTables/syncSubspriteOam(=AddSubspritesToOamBuffer)/               │
 * │     clearAllSubspriteTables/InitSpriteAffineAnim.                         │
 * │                                                                          │
 * │ MODÈLE PLAT (décision archi, NON négociable) : le sprite N'A PAS de       │
 * │ sous-objet `.oam` (vs décomp `sprite->oam.x/tileNum/...`). Les champs OAM │
 * │ sont PLATS sur le sprite + `oamIndex` → `gba.oam[oamIndex]` (= l'équiv.   │
 * │ web de struct Sprite + oamBuffer → OAM hardware). C'est le standard de    │
 * │ TOUT le port, Y COMPRIS le miroir certifié (pokeball.ts/battle_anim_mons. │
 * │ ts : `rt.gSprites[id]` + `rt.gba.oam[s.oamIndex]`). Introduire `.oam` │
 * │ casserait ~300 accès + le miroir déjà validé → EXCLU.                     │
 * │                                                                          │
 * │ DETTES (à résorber AU MOMENT des migrations combat, PAS maintenant — on   │
 * │ ne porte pas de code mort) :                                              │
 * │   • Le combat garde des DUPLICATAS LOCAUX de fns sprite.c/util.c :        │
 * │     _StartSpriteAnimIfDifferent, _CreateInvisibleSpriteWithCallback       │
 * │     (battle-sprite-callbacks.ts) → importer la version canonique lors de  │
 * │     la migration de battle_interface/controllers.                        │
 * │   • Les bodyC auto-engine réfèrent gOamLimit/gAffineAnimsDisabled/        │
 * │     gSpriteCoordOffsetX/Y/gDummyOamData/gDummySpriteTemplate : vérifier   │
 * │     le chemin d'exécution (auto vs manuel) si un cas combat les exige.    │
 * └──────────────────────────────────────────────────────────────────────────┘
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
import type { DecompRuntime, DecompSprite } from '../engine/system/decomp-runtime';
import { OBJ_PLTT_ID } from '../engine/system/palette';
import { resolveDecompConstant } from '../engine/system/decomp-constants';
import { SPRITE_ANIM_TABLES, SPRITE_ANIMS } from '../engine/decomp-data/src/sprite-system';

// ─── Constantes 1:1 décomp include/sprite.h + include/gba/defines.h ─────────

export const TAG_NONE = 0xFFFF;
export const MAX_SPRITES = 64;
export const OAM_MATRIX_COUNT = 32;
export const TOTAL_OBJ_TILE_COUNT = 1024;
export const TILE_SIZE_4BPP = 32;
export const PLTT_SIZE_4BPP = 32;
export const OBJ_VRAM_SIZE = 0x8000;  // 32 KB OBJ VRAM

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

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMARY STORAGE 1:1 décomp src/sprite.c:271-292 EWRAM static arrays
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/sprite.c:274 :
 *    static u16 sSpritePaletteTags[16];
 *  Tags des palettes OBJ allouées. TAG_NONE (= 0xFFFF) = slot libre.
 *  Index = OBJ palette bank (0-15). */
export const sSpritePaletteTags = new Uint16Array(16);
sSpritePaletteTags.fill(TAG_NONE);  // init all TAG_NONE

/** 1:1 décomp src/sprite.c:271 :
 *    static u16 sSpriteTileRangeTags[MAX_SPRITES];
 *  Tags des plages tiles OBJ allouées. MAX_SPRITES=64 slots. TAG_NONE = libre. */
export const sSpriteTileRangeTags = new Uint16Array(MAX_SPRITES);
sSpriteTileRangeTags.fill(TAG_NONE);

/** 1:1 décomp src/sprite.c:272 :
 *    static u16 sSpriteTileRanges[MAX_SPRITES * 2];
 *  Pairs (start, count) parallèle à sSpriteTileRangeTags. Index i :
 *    sSpriteTileRanges[i*2]   = start tile (0-1023)
 *    sSpriteTileRanges[i*2+1] = count tiles
 */
export const sSpriteTileRanges = new Uint16Array(MAX_SPRITES * 2);

/** 1:1 décomp src/sprite.c:288 :
 *    EWRAM_DATA static u8 sSpriteTileAllocBitmap[128] = {0};
 *  Bitmap d'allocation des 1024 tiles OBJ VRAM. 1 bit par tile :
 *    bit set = tile allocated, bit clear = tile free.
 *  Macros sprite.c:17-27 :
 *    ALLOC_SPRITE_TILE(n) = sSpriteTileAllocBitmap[n/8] |= (1 << (n%8))
 *    FREE_SPRITE_TILE(n)  = sSpriteTileAllocBitmap[n/8] &= ~(1 << (n%8))
 *    SPRITE_TILE_IS_ALLOCATED(n) = (sSpriteTileAllocBitmap[n/8] >> (n%8)) & 1
 */
export const sSpriteTileAllocBitmap = new Uint8Array(128);

/** Macros bitmap 1:1 décomp sprite.c:17-27. */
function _allocSpriteTile(n: number): void {
  sSpriteTileAllocBitmap[n >> 3] |= (1 << (n & 7));
}
function _freeSpriteTile(n: number): void {
  sSpriteTileAllocBitmap[n >> 3] &= ~(1 << (n & 7)) & 0xFF;
}
function _spriteTileIsAllocated(n: number): boolean {
  return ((sSpriteTileAllocBitmap[n >> 3] >> (n & 7)) & 1) === 1;
}

/** Helper exposé pour les sites qui font raw `objVram.set(data, byteOffset)`
 *  hardcoded (= party/summary/battle screens). Marker les tiles dans le bitmap
 *  pour que AllocSpriteTiles (= field-effect bitmap allocator) ne les considère
 *  pas libres → évite collisions visuelles 1:1 décomp. */
export function MarkObjTilesAllocated(byteOffset: number, byteSize: number): void {
  const tileStart = byteOffset >> 5;
  const tileCount = byteSize >> 5;
  for (let n = tileStart; n < tileStart + tileCount; n++) _allocSpriteTile(n);
}

/** 1:1 STRICT décomp sprite.c:622-628 `DestroySprite` branch `if (!usingSheet)` :
 *    for (i = sprite->oam.tileNum; i < tileEnd; i++) FREE_SPRITE_TILE(i);
 *  Libère N tiles consécutifs dans le bitmap pour qu'AllocSpriteTiles puisse
 *  les ré-utiliser au prochain spawn. Utilisé par object-events.ts au despawn
 *  NPC (= 1:1 décomp `DestroySprite` pour sprites avec images / TAG_NONE). */
export function MarkObjTilesFree(byteOffset: number, byteSize: number): void {
  const tileStart = byteOffset >> 5;
  const tileCount = byteSize >> 5;
  for (let n = tileStart; n < tileStart + tileCount; n++) _freeSpriteTile(n);
}

/** 1:1 STRICT décomp : helper exposé pour les sites qui écrivent une palette
 *  OBJ raw via `rt.gPlttBufferFaded.set(OBJ_PLTT_ID(slot)+i, color)` sans
 *  passer par LoadSpritePalette (= notre NPC system legacy `object-events.ts`,
 *  reflection palette). Marker `sSpritePaletteTags[slot] = tag` pour que le
 *  tag system ne ré-alloue PAS ce slot.
 *
 *  Sans ça : un caller LoadSpritePalette ultérieur trouve `sSpritePaletteTags
 *  [slot] === TAG_NONE` → l'attribue à un autre tag + écrase la palette →
 *  bug user "la mère affichée avec palette grass" (= MOM paletteBank=1 +
 *  grass loaded → IndexOfSpritePaletteTag(TAG_NONE) returns slot 1 → écrase).
 *
 *  Tag = string|number unique par caller. */
export function MarkObjPaletteAllocated(slot: number, tag: string | number): void {
  if (slot < 0 || slot >= 16) return;
  // 1:1 STRICT décomp sprite.c:1604 `sSpritePaletteTags[index] = palette->tag`.
  // Source UNIQUE : sSpritePaletteTags array primary. Pas de Map secondary.
  sSpritePaletteTags[slot] = _tagToU16(tag);
}

// ─── Internal string ↔ u16 tag mapping ────────────────────────────────────
// Le décomp utilise des u16 tags (= TAG_BAG_GFX = 100, TAG_ITEM_ICON = 5110
// = 0x13F6, TAG_NPC_PALETTE = 0x1100+ etc.). Pour éviter COLLISION avec les
// vrais tags décomp, synthetic u16 démarrent à 0xC000 (= zone non-utilisée).
//
// Sans ça : `sSpritePaletteTags[slot] === tagU16` matchait wrongly entre
// synthetic 0x1001 et décomp 0x1001 → tag lookup retournait slot d'un autre
// sprite → palette/tile collisions visuels (= bag corruption, sprite noir,
// emote points sur tile NPC etc., user-bugs 2026-05-23).

let _nextSyntheticU16 = 0xC000;  // start at 0xC000 (= safe vs all décomp tags < ~0x6000)
const _stringToU16Tag = new Map<string, number>();
const _u16TagToString = new Map<number, string>();

/** Convertit un tag string|number en u16 stable (= même string → même u16
 *  toujours). Numbers passent tel quel (= mask 0xFFFF). Strings reçoivent un
 *  u16 unique persistant. */
function _tagToU16(tag: string | number): number {
  if (typeof tag === 'number') return tag & 0xFFFF;
  const cached = _stringToU16Tag.get(tag);
  if (cached !== undefined) return cached;
  let u16 = _nextSyntheticU16++;
  if (u16 === TAG_NONE) u16 = _nextSyntheticU16++;  // skip 0xFFFF
  _stringToU16Tag.set(tag, u16);
  _u16TagToString.set(u16, tag);
  return u16;
}

/** Reverse lookup u16 → string (pour Map sync). */
function _u16ToTagString(u16: number): string {
  return _u16TagToString.get(u16) ?? String(u16);
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

/** 1:1 décomp `EWRAM_DATA u16 gReservedSpriteTileCount = 0;` (sprite.c:287)
 *  Nombre de TILES OBJ VRAM réservées au début (= [0, N×32 bytes)). AllocSpriteTiles
 *  scan first-free APRÈS cette zone. Utilisé par InitObjectEventPalettes + le
 *  field setup pour réserver les tiles player + NPC (= persistents) contre les
 *  UI menus qui font ResetSpriteData (qui reset cette valeur à 0). */
export function getReservedSpriteTileCount(): number {
  return ((globalThis as Record<string, unknown>).gReservedSpriteTileCount as number) ?? 0;
}
export function setReservedSpriteTileCount(v: number): void {
  (globalThis as Record<string, unknown>).gReservedSpriteTileCount = v;
}

/** 1:1 décomp `COMMON_DATA u8 gReservedSpritePaletteCount = 0;` (sprite.c:278)
 *  Setter exposé pour le boot OW + InitObjectEventPalettes. */
export function getReservedSpritePaletteCount(): number {
  return _getReserved();
}
export function setReservedSpritePaletteCount(v: number): void {
  _setReserved(v);
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
  // 1:1 STRICT décomp sprite.c:1581-1587 :
  //   gReservedSpritePaletteCount = 0;
  //   for (i = 0; i < 16; i++) sSpritePaletteTags[i] = TAG_NONE;
  _setReserved(0);
  sSpritePaletteTags.fill(TAG_NONE);
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
  // 1:1 STRICT décomp : scan sSpritePaletteTags[] depuis gReservedSpritePaletteCount.
  const tagU16 = _tagToU16(tag);
  const reserved = _getReserved();
  for (let i = reserved; i < 16; i++) {
    if (sSpritePaletteTags[i] === tagU16) return i;
  }
  return 0xFF;
}

/** Helper interne : scan PREMIER slot OBJ palette LIBRE dans
 *  `[gReservedSpritePaletteCount, 16)`. 1:1 décomp :
 *    `IndexOfSpritePaletteTag(TAG_NONE)` puisque slots vides = TAG_NONE.
 *  Retourne 0xFF si tous les slots [reserved, 16) sont occupés. */
function _findFirstFreeSlot(): number {
  const reserved = _getReserved();
  for (let slot = reserved; slot < 16; slot++) {
    if (sSpritePaletteTags[slot] === TAG_NONE) return slot;
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
  // 1:1 STRICT décomp sprite.c:1632 `sSpritePaletteTags[index] = tag`.
  // Source UNIQUE : sSpritePaletteTags array primary.
  sSpritePaletteTags[slot] = _tagToU16(tag);
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
  // 1:1 STRICT décomp : direct array lookup.
  if (paletteNum < 0 || paletteNum >= 16) return TAG_NONE;
  return sSpritePaletteTags[paletteNum];
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
  // 1:1 STRICT décomp sprite.c:1652-1657 : IndexOfSpritePaletteTag + clear slot.
  const slot = IndexOfSpritePaletteTag(tag);
  if (slot === 0xFF) return;
  sSpritePaletteTags[slot] = TAG_NONE;
}

/** Réserve un slot de palette OBJ SPÉCIFIQUE (= associe son tag sans charger de
 *  data). Pas dans le décomp tel quel, mais nécessaire pour les écrans qui chargent
 *  certaines palettes EN DIRECT (`LoadPaletteObj` vers un bank fixe, ex les icônes
 *  Pokémon du party screen) et veulent empêcher l'allocateur `LoadSpritePalette`
 *  de réutiliser ce bank → sinon collision palette. À libérer via
 *  `FreeSpritePaletteByTag(tag)` au teardown de l'écran. */
export function ReserveSpritePaletteSlot(slot: number, tag: string | number): void {
  if (slot < 0 || slot >= 16) return;
  sSpritePaletteTags[slot] = _tagToU16(tag);
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
export function LoadSpritePalette(palette: { data: Uint16Array | Uint8Array | string | null | undefined, tag: string | number }): number {
  // 1:1 décomp ligne 1591 : if (IndexOfSpritePaletteTag(palette->tag) != 0xFF) return index.
  const existing = IndexOfSpritePaletteTag(palette.tag);
  if (existing !== 0xFF) return existing;
  // 1:1 décomp ligne 1596 : index = IndexOfSpritePaletteTag(TAG_NONE) ; find free slot.
  const slot = _findFirstFreeSlot();
  if (slot === 0xFF) return 0xFF;
  // 1:1 décomp ligne 1604 : sSpritePaletteTags[index] = palette->tag.
  // 1:1 STRICT décomp sprite.c:1604 `sSpritePaletteTags[index] = palette->tag`.
  sSpritePaletteTags[slot] = _tagToU16(palette.tag);
  // 1:1 décomp ligne 1605 : write palette data. Accepts Uint16Array (= déjà
  // u16 colors), Uint8Array (= raw bytes, 32 = 16 colors × 2), ou string asset.
  let palData: Uint16Array | null = null;
  if (palette.data instanceof Uint16Array) {
    palData = palette.data;
  } else if (palette.data instanceof Uint8Array) {
    // Raw bytes → Uint16Array view (= 16 colors × 2 bytes = 32 bytes typical).
    palData = new Uint16Array(palette.data.buffer, palette.data.byteOffset, Math.floor(palette.data.byteLength / 2));
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
  // ALLOCATEUR UNIQUE (E2.3c) : état = `gOamMatrixAllocBitmap` (1:1 décomp). La
  // méthode `DecompRuntime.AllocOamMatrix` y délègue (avant : 2e allocateur à état
  // SÉPARÉ `_matrixUsed` → collision possible sur affineParams). Slot 0 RÉSERVÉ
  // (M3 : matrice identité partagée des sprites affineMode=OFF) → scan dès i=1
  // (déviation assumée vs décomp qui scanne dès 0 ; protège le slot identité +
  // préserve le comportement des call-sites `rt.AllocOamMatrix`, slots 1..31).
  const g = globalThis as Record<string, unknown>;
  let bitmap = (g.gOamMatrixAllocBitmap as number) ?? 0;
  for (let i = 1; i < OAM_MATRIX_COUNT; i++) {
    const bit = (1 << i) >>> 0;
    if (!(bitmap & bit)) {
      bitmap |= bit;
      g.gOamMatrixAllocBitmap = bitmap >>> 0;  // ensure u32
      // Defense-in-depth (M3) : reset le slot à l'identité à l'alloc. Le décomp ne
      // le fait pas (alloc toujours suivi d'un BeginAffineAnim qui écrit la matrice),
      // mais ça garantit un slot propre si le caller oublie. = ce que FreeOamMatrix
      // fait au release (sprite.c:1460).
      const m = _rt().gba.affineParams[i];
      if (m) { m.pa = 0x100; m.pb = 0; m.pc = 0; m.pd = 0x100; }
      return i;
    }
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
  // 1:1 décomp sprite.c:1460 `SetOamMatrix(matrixNum, 0x100, 0, 0, 0x100)` — reset
  // le slot à l'identité au release (était MANQUANT dans cette free fn ; l'ex-méthode
  // runtime le faisait). Évite des valeurs de matrice périmées au prochain rendu.
  const m = _rt().gba.affineParams[matrixNum];
  if (m) { m.pa = 0x100; m.pb = 0; m.pc = 0; m.pd = 0x100; }
}

/** Slot matrix OAM alloué ? (lit `gOamMatrixAllocBitmap`, 1:1 décomp). Utilisé par
 *  `DestroySprite` pour ne libérer que les matrices réellement allouées. */
function _isOamMatrixAllocated(matrixNum: number): boolean {
  const bitmap = ((globalThis as Record<string, unknown>).gOamMatrixAllocBitmap as number) ?? 0;
  return (bitmap & ((1 << matrixNum) >>> 0)) !== 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OAM MATRIX OPS (sprite.c:661-680, 1188-1194, 1475-1484)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/sprite.c:661-672 :
 *  ```c
 *  void ResetOamMatrices(void) {
 *      u8 i;
 *      for (i = 0; i < OAM_MATRIX_COUNT; i++) {
 *          gOamMatrices[i].a = 0x0100;  // identity
 *          gOamMatrices[i].b = 0x0000;
 *          gOamMatrices[i].c = 0x0000;
 *          gOamMatrices[i].d = 0x0100;
 *      }
 *  }
 *  ```
 *  Notre runtime : gOamMatrices = rt.gba.affineParams[]. */
export function ResetOamMatrices(): void {
  const r = _rt();
  for (let i = 0; i < OAM_MATRIX_COUNT; i++) {
    const m = r.gba.affineParams[i];
    if (m) { m.pa = 0x0100; m.pb = 0x0000; m.pc = 0x0000; m.pd = 0x0100; }
  }
}

/** 1:1 décomp src/sprite.c:674-680 :
 *  ```c
 *  void SetOamMatrix(u8 matrixNum, u16 a, u16 b, u16 c, u16 d) {
 *      gOamMatrices[matrixNum].a = a;
 *      gOamMatrices[matrixNum].b = b;
 *      gOamMatrices[matrixNum].c = c;
 *      gOamMatrices[matrixNum].d = d;
 *  }
 *  ```
 */
export function SetOamMatrix(matrixNum: number, a: number, b: number, c: number, d: number): void {
  if (matrixNum < 0 || matrixNum >= OAM_MATRIX_COUNT) return;
  const r = _rt();
  const m = r.gba.affineParams[matrixNum];
  if (!m) return;
  m.pa = a; m.pb = b; m.pc = c; m.pd = d;
}

/** 1:1 décomp src/sprite.c:1188-1194 :
 *  ```c
 *  void CopyOamMatrix(u8 destMatrixIndex, struct OamMatrix *srcMatrix) {
 *      gOamMatrices[destMatrixIndex].a = srcMatrix->a;
 *      gOamMatrices[destMatrixIndex].b = srcMatrix->b;
 *      gOamMatrices[destMatrixIndex].c = srcMatrix->c;
 *      gOamMatrices[destMatrixIndex].d = srcMatrix->d;
 *  }
 *  ```
 */
export function CopyOamMatrix(destMatrixIndex: number, srcMatrix: { a: number, b: number, c: number, d: number }): void {
  SetOamMatrix(destMatrixIndex, srcMatrix.a, srcMatrix.b, srcMatrix.c, srcMatrix.d);
}

/** 1:1 décomp src/sprite.c:1316-1320 :
 *  ```c
 *  s16 ConvertScaleParam(s16 scale) { return SAFE_DIV(0x10000, scale); }
 *  ```
 *  Inverse le scale pour le passer à ObjAffineSet. */
function _convertScaleParam(scale: number): number {
  if (scale === 0) return 0x7FFF;
  const result = (0x10000 / scale) | 0;
  if (result > 0x7FFF) return 0x7FFF;
  if (result < -0x8000) return -0x8000;
  return result;
}

/** 1:1 décomp src/sprite.c:1475-1484 :
 *  ```c
 *  void SetOamMatrixRotationScaling(u8 matrixNum, s16 xScale, s16 yScale, u16 rotation) {
 *      struct ObjAffineSrcData srcData;
 *      struct OamMatrix matrix;
 *      srcData.xScale = ConvertScaleParam(xScale);
 *      srcData.yScale = ConvertScaleParam(yScale);
 *      srcData.rotation = rotation;
 *      ObjAffineSet(&srcData, &matrix, 1, 2);
 *      CopyOamMatrix(matrixNum, &matrix);
 *  }
 *  ```
 *
 *  ObjAffineSet (= BIOS SWI 0x0F) calcule la matrix affine OAM depuis
 *  xScale/yScale/rotation. Formule (cf. GBATEK, libagbsyscall) :
 *    sin = SineTable[rot>>8 & 0xFF]
 *    cos = SineTable[(rot>>8 + 64) & 0xFF]
 *    pa =  (xScale * cos) >> 8
 *    pb = -(xScale * sin) >> 8
 *    pc =  (yScale * sin) >> 8
 *    pd =  (yScale * cos) >> 8
 */
export function SetOamMatrixRotationScaling(
  matrixNum: number, xScale: number, yScale: number, rotation: number,
): void {
  // 1:1 décomp gSineTable lookup (= 256 entries Q.8 sin sur [0,2π]).
  // Notre runtime expose G_SINE_TABLE indexable.
  const rotIdx = (rotation >> 8) & 0xFF;
  // Use globalThis sine table if available (= decomp-runtime gSineTable export).
  const sineTable = (globalThis as Record<string, unknown>).__sineTable as ((i: number) => number) | undefined;
  let sin = 0, cos = 0x100;
  if (sineTable) {
    sin = sineTable(rotIdx);
    cos = sineTable((rotIdx + 64) & 0xFF);
  }
  const xs = _convertScaleParam(xScale);
  const ys = _convertScaleParam(yScale);
  const pa =  (xs * cos) >> 8;
  const pb = -(xs * sin) >> 8;
  const pc =  (ys * sin) >> 8;
  const pd =  (ys * cos) >> 8;
  SetOamMatrix(matrixNum, pa, pb, pc, pd);
}

/** 1:1 décomp src/sprite.c:633-638 :
 *  ```c
 *  void ResetOamRange(u8 start, u8 end) {
 *      u8 i;
 *      for (i = start; i < end; i++)
 *          gMain.oamBuffer[i] = gDummyOamData;
 *  }
 *  ```
 *  Reset les entries OAM dans la plage [start, end) à la DUMMY OAM data
 *  (= sprite invisible hors-écran). Notre runtime utilise rt.gba.oam[]. */
export function ResetOamRange(start: number, end: number): void {
  const r = _rt();
  for (let i = start; i < end; i++) {
    const o = r.gba.oam[i];
    if (!o) continue;
    // DUMMY_OAM_DATA (sprite.c:101-116) : y=DISPLAY_HEIGHT=160, x=DISPLAY_WIDTH+64=304,
    // affineMode=OFF, shape=SQUARE(8x8), size=SPRITE_SIZE(8x8), priority=3.
    o.x = 304; o.y = 160;
    o.affineMode = 0; o.objMode = 0; o.mosaic = false; o.paletteMode = 0;
    o.shape = 0; o.size = 0; o.tileId = 0; o.affineParamIndex = 0;
    o.priority = 3; o.paletteBank = 0;
    o.visible = false;
  }
}

/** 1:1 décomp src/sprite.c:640-644 :
 *  ```c
 *  void LoadOam(void) {
 *      if (!gMain.oamLoadDisabled) CpuCopy32(gMain.oamBuffer, (void *)OAM, sizeof(gMain.oamBuffer));
 *  }
 *  ```
 *  No-op chez nous : compositor lit rt.gba.oam[] direct chaque frame. */
export function LoadOam(): void {
  // No-op : pas de double-buffer (oamBuffer → OAM) chez nous.
}

// ═══════════════════════════════════════════════════════════════════════════════
// TILE TAG SYSTEM HELPERS (sprite.c:1509-1579)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/sprite.c:1550-1559 :
 *  ```c
 *  u8 IndexOfSpriteTileTag(u16 tag) {
 *      for (i = 0; i < MAX_SPRITES; i++)
 *          if (sSpriteTileRangeTags[i] == tag)
 *              return i;
 *      return 0xFF;
 *  }
 *  ```
 *  Substrat : rt.spriteSheetTagToTileStart Map. L'index conceptuel = position
 *  dans l'iter order. */
export function IndexOfSpriteTileTag(tag: string | number): number {
  // 1:1 STRICT décomp : scan sSpriteTileRangeTags[] for matching tag.
  const tagU16 = _tagToU16(tag);
  for (let i = 0; i < MAX_SPRITES; i++) {
    if (sSpriteTileRangeTags[i] === tagU16) return i;
  }
  return 0xFF;
}

/** 1:1 décomp src/sprite.c:1542-1548 :
 *  ```c
 *  u16 GetSpriteTileStartByTag(u16 tag) {
 *      u8 index = IndexOfSpriteTileTag(tag);
 *      if (index == 0xFF) return 0xFFFF;
 *      return sSpriteTileRanges[index * 2];
 *  }
 *  ```
 *  Substrat : direct lookup tag→tileStart via Map. */
export function GetSpriteTileStartByTag(tag: string | number): number {
  // 1:1 STRICT décomp : IndexOfSpriteTileTag + sSpriteTileRanges[index*2].
  const index = IndexOfSpriteTileTag(tag);
  if (index === 0xFF) return 0xFFFF;
  return sSpriteTileRanges[index * 2];
}

/** 1:1 décomp src/sprite.c:1561-1572 :
 *  ```c
 *  u16 GetSpriteTileTagByTileStart(u16 start) {
 *      for (i = 0; i < MAX_SPRITES; i++) {
 *          if (sSpriteTileRangeTags[i] != TAG_NONE && sSpriteTileRanges[i*2] == start)
 *              return sSpriteTileRangeTags[i];
 *      }
 *      return TAG_NONE;
 *  }
 *  ```
 *  Reverse lookup : tile start → tag. */
export function GetSpriteTileTagByTileStart(start: number): number {
  // 1:1 STRICT décomp : scan sSpriteTileRangeTags + sSpriteTileRanges[i*2].
  for (let i = 0; i < MAX_SPRITES; i++) {
    if (sSpriteTileRangeTags[i] !== TAG_NONE && sSpriteTileRanges[i * 2] === start) {
      return sSpriteTileRangeTags[i];
    }
  }
  return TAG_NONE;
}

/** 1:1 décomp src/sprite.c:1574-1579 :
 *  ```c
 *  void AllocSpriteTileRange(u16 tag, u16 start, u16 count) {
 *      u8 freeIndex = IndexOfSpriteTileTag(TAG_NONE);
 *      sSpriteTileRangeTags[freeIndex] = tag;
 *      SET_SPRITE_TILE_RANGE(freeIndex, start, count);
 *  }
 *  ```
 *  Substrat : set tag→tileStart + size dans Maps runtime. */
export function AllocSpriteTileRange(tag: string | number, start: number, count: number): void {
  // 1:1 STRICT décomp : freeIndex = IndexOfSpriteTileTag(TAG_NONE) ; write arrays.
  const tagU16 = _tagToU16(tag);
  // Find first TAG_NONE slot in sSpriteTileRangeTags.
  let freeIndex = -1;
  for (let i = 0; i < MAX_SPRITES; i++) {
    if (sSpriteTileRangeTags[i] === TAG_NONE) { freeIndex = i; break; }
  }
  if (freeIndex < 0) {
    console.warn('[AllocSpriteTileRange] all 64 tile range slots in use');
    return;
  }
  // 1:1 STRICT décomp sprite.c:1577-1578 :
  //   sSpriteTileRangeTags[freeIndex] = tag;
  //   SET_SPRITE_TILE_RANGE(freeIndex, start, count);
  // Source UNIQUE : arrays primary.
  sSpriteTileRangeTags[freeIndex] = tagU16;
  sSpriteTileRanges[freeIndex * 2] = start;
  sSpriteTileRanges[freeIndex * 2 + 1] = count;
}

/** 1:1 décomp src/sprite.c:1531-1540 :
 *  ```c
 *  void FreeSpriteTileRanges(void) {
 *      for (i = 0; i < MAX_SPRITES; i++) {
 *          sSpriteTileRangeTags[i] = TAG_NONE;
 *          SET_SPRITE_TILE_RANGE(i, 0, 0);
 *      }
 *  }
 *  ```
 *  Substrat : clear all tile maps + reclaim queue + linear cursor reset. */
export function FreeSpriteTileRanges(): void {
  // 1:1 STRICT décomp sprite.c:1531-1540 : reset arrays primary.
  sSpriteTileRangeTags.fill(TAG_NONE);
  sSpriteTileRanges.fill(0);
}

/** Helper interne : free le SLOT sSpriteTileRangeTags pour un tag donné +
 *  clear les bits correspondants dans sSpriteTileAllocBitmap.
 *  Used by FreeSpriteTilesByTag (decomp-globals.ts) en complément du
 *  Map.delete pour préserver l'invariant 1:1 décomp arrays + bitmap.
 *  1:1 STRICT décomp src/sprite.c:1509-1529 :
 *    `FreeSpriteTilesByTag(tag)` → IndexOfSpriteTileTag + free bits via macro */
export function _freeSpriteTileRangeByTag(tag: string | number): void {
  const index = IndexOfSpriteTileTag(tag);
  if (index === 0xFF) return;
  // 1:1 décomp : clear N tiles bits from start.
  const start = sSpriteTileRanges[index * 2];
  const count = sSpriteTileRanges[index * 2 + 1];
  for (let i = start; i < start + count; i++) _freeSpriteTile(i);
  // Clear tag + range slot.
  sSpriteTileRangeTags[index] = TAG_NONE;
  sSpriteTileRanges[index * 2] = 0;
  sSpriteTileRanges[index * 2 + 1] = 0;
}

/** 1:1 STRICT décomp src/sprite.c:702-753 — bitmap-based allocator :
 *  ```c
 *  s16 AllocSpriteTiles(u16 tileCount) {
 *      u16 i;
 *      s16 start;
 *      u16 numTilesFound;
 *      if (tileCount == 0) {
 *          for (i = gReservedSpriteTileCount; i < TOTAL_OBJ_TILE_COUNT; i++)
 *              FREE_SPRITE_TILE(i);
 *          return 0;
 *      }
 *      i = gReservedSpriteTileCount;
 *      for (;;) {
 *          while (SPRITE_TILE_IS_ALLOCATED(i)) {
 *              i++;
 *              if (i == TOTAL_OBJ_TILE_COUNT) return -1;
 *          }
 *          start = i;
 *          numTilesFound = 1;
 *          while (numTilesFound != tileCount) {
 *              i++;
 *              if (i == TOTAL_OBJ_TILE_COUNT) return -1;
 *              if (!SPRITE_TILE_IS_ALLOCATED(i)) numTilesFound++;
 *              else break;
 *          }
 *          if (numTilesFound == tileCount) break;
 *      }
 *      for (i = start; i < tileCount + start; i++)
 *          ALLOC_SPRITE_TILE(i);
 *      return start;
 *  }
 *  ```
 *
 *  Retourne tile start (0-1023), ou -1 si VRAM saturée. */
export function AllocSpriteTiles(tileCount: number): number {
  const reservedTiles = getReservedSpriteTileCount();

  if (tileCount === 0) {
    // 1:1 décomp : tileCount==0 → free all unreserved tiles in bitmap.
    for (let i = reservedTiles; i < TOTAL_OBJ_TILE_COUNT; i++) _freeSpriteTile(i);
    return 0;
  }

  // 1:1 décomp scan algorithm — find first range of `tileCount` contiguous
  // free tiles in [reservedTiles, TOTAL_OBJ_TILE_COUNT).
  let i = reservedTiles;
  let start = -1;
  outer: for (;;) {
    while (_spriteTileIsAllocated(i)) {
      i++;
      if (i >= TOTAL_OBJ_TILE_COUNT) return -1;
    }
    start = i;
    let numTilesFound = 1;
    while (numTilesFound !== tileCount) {
      i++;
      if (i >= TOTAL_OBJ_TILE_COUNT) return -1;
      if (!_spriteTileIsAllocated(i)) {
        numTilesFound++;
      } else {
        continue outer;
      }
    }
    if (numTilesFound === tileCount) break;
  }
  // Mark all `tileCount` tiles as allocated in bitmap.
  for (let j = start; j < tileCount + start; j++) _allocSpriteTile(j);
  return start;
}

/** 1:1 décomp src/sprite.c:1486-1500 :
 *  ```c
 *  u16 LoadSpriteSheet(const struct SpriteSheet *sheet) {
 *      s16 tileStart = AllocSpriteTiles(sheet->size / TILE_SIZE_4BPP);
 *      if (tileStart < 0) return 0;
 *      AllocSpriteTileRange(sheet->tag, (u16)tileStart, sheet->size / TILE_SIZE_4BPP);
 *      CpuCopy16(sheet->data, (u8 *)OBJ_VRAM0 + TILE_SIZE_4BPP * tileStart, sheet->size);
 *      return (u16)tileStart;
 *  }
 *  ```
 *  Notre interface : `data` peut être Uint8Array direct (= déjà décompressé).
 *  Retourne tile start (= tileNum), ou 0 si VRAM saturée. */
export function LoadSpriteSheet(sheet: { data: Uint8Array, size: number, tag: string | number }): number {
  const tileCount = sheet.size / TILE_SIZE_4BPP;
  const tileStart = AllocSpriteTiles(tileCount);
  if (tileStart < 0) return 0;
  AllocSpriteTileRange(sheet.tag, tileStart, tileCount);
  const r = _rt();
  const byteOffset = tileStart * TILE_SIZE_4BPP;
  const copySize = Math.min(sheet.size, r.gba.objVram.length - byteOffset);
  if (copySize > 0) r.gba.objVram.set(sheet.data.subarray(0, copySize), byteOffset);
  return tileStart;
}

/** 1:1 décomp src/sprite.c:1502-1507 :
 *  ```c
 *  void LoadSpriteSheets(const struct SpriteSheet *sheets) {
 *      for (i = 0; sheets[i].data != NULL; i++) LoadSpriteSheet(&sheets[i]);
 *  }
 *  ```
 */
export function LoadSpriteSheets(sheets: Array<{ data: Uint8Array | null, size: number, tag: string | number }>): void {
  for (const sheet of sheets) {
    if (!sheet.data) break;
    LoadSpriteSheet(sheet as { data: Uint8Array, size: number, tag: string | number });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALC CENTER-TO-CORNER VEC (sprite.c:687-700)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/sprite.c:137 sCenterToCornerVecTable[3][4][2].
 *  Le décomp stocke en u8 mais valeurs signées (= -w/2, -h/2). */
const _sCenterToCornerVecTable: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  // shape 0 = square
  [[-4, -4], [-8, -8], [-16, -16], [-32, -32]],
  // shape 1 = horizontal rectangle
  [[-8, -4], [-16, -4], [-16, -8], [-32, -16]],
  // shape 2 = vertical rectangle
  [[-4, -8], [-4, -16], [-8, -16], [-16, -32]],
];

const ST_OAM_AFFINE_DOUBLE_MASK = 2;

/** 1:1 décomp src/sprite.c:687-700 :
 *  ```c
 *  void CalcCenterToCornerVec(struct Sprite *sprite, u8 shape, u8 size, u8 affineMode) {
 *      u8 x = sCenterToCornerVecTable[shape][size][0];
 *      u8 y = sCenterToCornerVecTable[shape][size][1];
 *      if (affineMode & ST_OAM_AFFINE_DOUBLE_MASK) { x *= 2; y *= 2; }
 *      sprite->centerToCornerVecX = x;
 *      sprite->centerToCornerVecY = y;
 *  }
 *  ```
 *
 *  Notre interface : retourne {centerToCornerVecX, centerToCornerVecY} au lieu
 *  d'écrire dans le sprite (= caller doit assigner). Sémantique 1:1. */
export function CalcCenterToCornerVec(
  shape: number, size: number, affineMode: number,
): { centerToCornerVecX: number, centerToCornerVecY: number } {
  let [x, y] = _sCenterToCornerVecTable[shape & 3]?.[size & 3] ?? [0, 0];
  if (affineMode & ST_OAM_AFFINE_DOUBLE_MASK) { x *= 2; y *= 2; }
  return { centerToCornerVecX: x, centerToCornerVecY: y };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION ANIMATION SPRITE (1:1 décomp sprite.c) — fold de sprite-animation.ts (E2.2b)
//   AnimateSprite / BeginAnim / ContinueAnim / AnimCmd_frame|end|jump|loop /
//   BeginAnimLoop / ContinueAnimLoop / JumpToTopOfAnimLoop / StartSpriteAnim /
//   SeekSpriteAnim / RequestSpriteFrameImageCopy / ProcessSpriteCopyRequests.
//   = partie animation de sprite.c, réunie dans son home miroir unique.
// ═══════════════════════════════════════════════════════════════════════════

// ─── struct AnimCmd union 1:1 décomp sprite.h:74-80 ─────────────────────────
/**
 * union AnimCmd {
 *     s16 type;
 *     struct AnimFrameCmd frame;
 *     struct AnimLoopCmd loop;
 *     struct AnimJumpCmd jump;
 * };
 *
 * Discriminé par type :
 *   type = -1 (0xFFFF, ANIMCMD_END) → end
 *   type = -2 (0xFFFE, ANIMCMD_JUMP) → jump to target
 *   type = -3 (0xFFFD, ANIMCMD_LOOP) → loop counter dec
 *   type >= 0 → frame (= imageValue)
 *
 * TS port : discriminated union avec kind explicite + données du cmd.
 */
export type AnimCmd =
  | { readonly kind: 'frame'; readonly imageValue: number; readonly duration: number; readonly hFlip: boolean; readonly vFlip: boolean }
  | { readonly kind: 'end' }
  | { readonly kind: 'jump'; readonly target: number }
  | { readonly kind: 'loop'; readonly count: number };

// ─── Macros décomp (port helpers) ───────────────────────────────────────────

/** 1:1 décomp `ANIMCMD_FRAME(imageValue, duration[, .hFlip=TRUE][, .vFlip=TRUE])`.
 *  Crée un AnimCmd frame avec duration et flips. */
export function ANIMCMD_FRAME(
  imageValue: number,
  duration: number,
  opts?: { hFlip?: boolean; vFlip?: boolean },
): AnimCmd {
  return {
    kind: 'frame',
    imageValue,
    duration,
    hFlip: opts?.hFlip ?? false,
    vFlip: opts?.vFlip ?? false,
  };
}

/** 1:1 décomp `ANIMCMD_END`. Terminator (type = -1). */
export const ANIMCMD_END: AnimCmd = { kind: 'end' };

/** 1:1 décomp `ANIMCMD_JUMP(target)`. Saut au cmd index `target` (type = -2). */
export function ANIMCMD_JUMP(target: number): AnimCmd {
  return { kind: 'jump', target };
}

/** 1:1 décomp `ANIMCMD_LOOP(count)`. Boucle count fois (type = -3). */
export function ANIMCMD_LOOP(count: number): AnimCmd {
  return { kind: 'loop', count };
}

// ─── struct SpriteFrameImage 1:1 décomp sprite.h:26-30 ──────────────────────
/**
 * struct SpriteFrameImage {
 *     const void *data;
 *     u16 size;
 * };
 *
 * `data` = bytes raw 4bpp pour 1 frame.
 * `size` = taille en bytes (= width_tiles * height_tiles * 32).
 */
export interface SpriteFrameImage {
  readonly data: Uint8Array;
  readonly size: number;
}

// ─── Queue sSpriteCopyRequests 1:1 décomp sprite.c:55-58 ─────────────────────
/**
 *  #define MAX_SPRITE_COPY_REQUESTS 64
 *  static u8 sSpriteCopyRequestCount;
 *  static struct SpriteCopyRequest sSpriteCopyRequests[MAX_SPRITE_COPY_REQUESTS];
 *
 * Queue de jobs VRAM copy à exécuter dans BuildOamBuffer (= ProcessSpriteCopy
 * Requests). Le port TS pose les bytes directement dans rt.gba.objVram au
 * lieu de scheduler async.
 */
const MAX_SPRITE_COPY_REQUESTS = 64;

interface SpriteCopyRequest {
  src: Uint8Array;
  destTileNum: number;
  size: number;
}

const sSpriteCopyRequests: SpriteCopyRequest[] = [];
let sSpriteCopyRequestCount = 0;

/** 1:1 décomp `RequestSpriteFrameImageCopy(u16 index, u16 tileNum,
 *  const struct SpriteFrameImage *images)` (sprite.c:802-811) :
 *      if (sSpriteCopyRequestCount < MAX_SPRITE_COPY_REQUESTS) {
 *          sSpriteCopyRequests[count].src  = images[index].data;
 *          sSpriteCopyRequests[count].dest = OBJ_VRAM0 + TILE_SIZE_4BPP * tileNum;
 *          sSpriteCopyRequests[count].size = images[index].size;
 *          sSpriteCopyRequestCount++;
 *      }
 *
 * En port TS : queue les requests, drain au prochain ProcessSpriteCopyRequests. */
export function RequestSpriteFrameImageCopy(
  index: number, tileNum: number, images: ReadonlyArray<SpriteFrameImage>,
): void {
  if (sSpriteCopyRequestCount >= MAX_SPRITE_COPY_REQUESTS) return;
  const img = images[index];
  if (!img) return;
  sSpriteCopyRequests[sSpriteCopyRequestCount] = {
    src: img.data,
    destTileNum: tileNum,
    size: img.size,
  };
  sSpriteCopyRequestCount++;
}

/** 1:1 décomp `ProcessSpriteCopyRequests` (sprite.c:785-800) :
 *      while (sSpriteCopyRequestCount > 0)
 *          CpuCopy16(src, dest, size); sSpriteCopyRequestCount--;
 *
 * Drain la queue dans rt.gba.objVram. À call depuis BuildOamBuffer (= main
 * frame end), avant la composition. */
export function ProcessSpriteCopyRequests(rt: DecompRuntime): void {
  for (let i = 0; i < sSpriteCopyRequestCount; i++) {
    const req = sSpriteCopyRequests[i];
    const TILE_SIZE_4BPP = 32;
    const destByte = req.destTileNum * TILE_SIZE_4BPP;
    rt.gba.objVram.set(req.src.subarray(0, req.size), destByte);
  }
  sSpriteCopyRequestCount = 0;
}

/** Reset queue (= au reset sprite system). */
export function ResetSpriteCopyRequests(): void {
  sSpriteCopyRequestCount = 0;
  sSpriteCopyRequests.length = 0;
}

// ─── Sprite Anim Helpers ────────────────────────────────────────────────────

interface AnimDispatchSprite {
  oamIndex: number;
  animNum: number;
  animCmdIndex: number;
  animDelayCounter: number;
  animLoopCounter: number;
  animBeginning: boolean;
  animPaused: boolean;
  animEnded: boolean;
  hFlip: boolean;
  vFlip: boolean;
  usingSheet: boolean;
  sheetTileStart: number;
  images: ReadonlyArray<SpriteFrameImage> | null;
  anims: ReadonlyArray<ReadonlyArray<AnimCmd>> | null;
}

/** 1:1 décomp `void SetSpriteOamFlipBits(struct Sprite *sprite, u8 hFlip,
 *  u8 vFlip)` : sync flip bits sur l'OAM si pas en affine. */
function SetSpriteOamFlipBits(rt: DecompRuntime, sprite: AnimDispatchSprite, hFlip: boolean, vFlip: boolean): void {
  sprite.hFlip = hFlip;
  sprite.vFlip = vFlip;
  const oam = rt.gba.oam[sprite.oamIndex];
  if (!oam) return;
  oam.flipH = hFlip;
  oam.flipV = vFlip;
}

/** Décrément le delay counter (= sprite.animDelayCounter--). */
function DecrementAnimDelayCounter(sprite: AnimDispatchSprite): void {
  sprite.animDelayCounter--;
}

/** Apply un frame cmd : load son imageValue → request VRAM copy (or set
 *  sheet tileNum), apply hFlip/vFlip, set animDelayCounter. */
function ApplyAnimFrame(rt: DecompRuntime, sprite: AnimDispatchSprite, cmd: AnimCmd): void {
  if (cmd.kind !== 'frame') return;
  let duration = cmd.duration;
  if (duration > 0) duration--;
  sprite.animDelayCounter = duration;
  const oam = rt.gba.oam[sprite.oamIndex];
  // 1:1 décomp (sprite.c:933 / 985 / 1019) : `if (!(oam.affineMode & ST_OAM_AFFINE_ON_MASK))
  // SetSpriteOamFlipBits(...)`. En mode affine (affineMode 1 ou 3), les bits hFlip/vFlip
  // de l'OAM servent au numéro de matrice → ne JAMAIS les écraser. (Bit 0 = AFFINE_ON.)
  if (oam && !(oam.affineMode & 1)) {
    SetSpriteOamFlipBits(rt, sprite, cmd.hFlip, cmd.vFlip);
  }
  // Sheet vs frame-image VRAM dispatch :
  if (sprite.usingSheet) {
    if (oam) oam.tileId = sprite.sheetTileStart + cmd.imageValue;
  } else if (sprite.images) {
    if (oam) RequestSpriteFrameImageCopy(cmd.imageValue, oam.tileId, sprite.images);
  }
}

/** 1:1 décomp `void BeginAnim(struct Sprite *sprite)` (sprite.c:909-941) :
 *      sprite->animCmdIndex = 0;
 *      sprite->animEnded = FALSE;
 *      sprite->animLoopCounter = 0;
 *      imageValue = sprite->anims[sprite->animNum][0].frame.imageValue;
 *      if (imageValue != -1) {
 *          sprite->animBeginning = FALSE;
 *          ApplyFrame(0);
 *      } */
export function BeginAnim(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  sprite.animCmdIndex = 0;
  sprite.animEnded = false;
  sprite.animLoopCounter = 0;
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  const firstCmd = animTable[0];
  if (!firstCmd || firstCmd.kind !== 'frame') return;
  // imageValue != -1 (= type != end). Si type=end, on n'avance pas (= 1:1
  // décomp test `imageValue != -1` sur l'union, équivalent à kind!='end').
  sprite.animBeginning = false;
  ApplyAnimFrame(rt, sprite, firstCmd);
}

/** 1:1 décomp `void ContinueAnim(struct Sprite *sprite)` (sprite.c:943-966) :
 *      if (animDelayCounter)  → just dec + sync flips
 *      else if (!animPaused)  → animCmdIndex++ + dispatch sur cmd.type. */
export function ContinueAnim(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  if (sprite.animDelayCounter > 0) {
    DecrementAnimDelayCounter(sprite);
    // Re-sync flips au cas où l'OAM a été reset entre-temps.
    if (!sprite.anims) return;
    const animTable = sprite.anims[sprite.animNum];
    if (!animTable) return;
    const cmd = animTable[sprite.animCmdIndex];
    if (cmd && cmd.kind === 'frame') {
      // 1:1 décomp sprite.c:952 : flip bits SEULEMENT si non-affine (cf. ApplyAnimFrame).
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam && !(oam.affineMode & 1)) SetSpriteOamFlipBits(rt, sprite, cmd.hFlip, cmd.vFlip);
    }
    return;
  }
  if (sprite.animPaused) return;
  sprite.animCmdIndex++;
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  const cmd = animTable[sprite.animCmdIndex];
  if (!cmd) return;
  switch (cmd.kind) {
    case 'frame': AnimCmd_frame(rt, sprite, cmd); break;
    case 'end':   AnimCmd_end(sprite); break;
    case 'jump':  AnimCmd_jump(rt, sprite, cmd.target); break;
    case 'loop':  AnimCmd_loop(rt, sprite, cmd.count); break;
  }
}

/** 1:1 décomp `void AnimCmd_frame(struct Sprite *sprite)` (sprite.c:968-992) :
 *      load anims[animNum][animCmdIndex].frame fields + apply. */
function AnimCmd_frame(rt: DecompRuntime, sprite: AnimDispatchSprite, cmd: Extract<AnimCmd, { kind: 'frame' }>): void {
  ApplyAnimFrame(rt, sprite, cmd);
}

/** 1:1 décomp `void AnimCmd_end(struct Sprite *sprite)` (sprite.c:994-998) :
 *      sprite->animCmdIndex--; sprite->animEnded = TRUE; */
function AnimCmd_end(sprite: AnimDispatchSprite): void {
  sprite.animCmdIndex--;
  sprite.animEnded = true;
}

/** 1:1 décomp `void AnimCmd_jump(struct Sprite *sprite)` (sprite.c:1000-1026) :
 *      sprite->animCmdIndex = anims[animNum][animCmdIndex].jump.target;
 *      apply frame at new index. */
function AnimCmd_jump(rt: DecompRuntime, sprite: AnimDispatchSprite, target: number): void {
  sprite.animCmdIndex = target;
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  const cmd = animTable[sprite.animCmdIndex];
  if (cmd && cmd.kind === 'frame') ApplyAnimFrame(rt, sprite, cmd);
}

/** 1:1 décomp `void AnimCmd_loop(struct Sprite *sprite)` (sprite.c:1028-1034) :
 *      if (animLoopCounter) ContinueAnimLoop(sprite);
 *      else                 BeginAnimLoop(sprite); */
function AnimCmd_loop(rt: DecompRuntime, sprite: AnimDispatchSprite, count: number): void {
  if (sprite.animLoopCounter > 0) {
    ContinueAnimLoop(rt, sprite);
  } else {
    BeginAnimLoop(rt, sprite, count);
  }
}

/** 1:1 décomp `void BeginAnimLoop(struct Sprite *sprite)` (sprite.c:1036-1040) :
 *      animLoopCounter = anims[animNum][animCmdIndex].loop.count;
 *      JumpToTopOfAnimLoop + ContinueAnim(sprite). */
function BeginAnimLoop(rt: DecompRuntime, sprite: AnimDispatchSprite, count: number): void {
  sprite.animLoopCounter = count;
  JumpToTopOfAnimLoop(sprite);
  ContinueAnim(rt, sprite);
}

/** 1:1 décomp `void ContinueAnimLoop(struct Sprite *sprite)` (sprite.c:1043-1048) :
 *      animLoopCounter--;
 *      JumpToTopOfAnimLoop + ContinueAnim(sprite). */
function ContinueAnimLoop(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  sprite.animLoopCounter--;
  JumpToTopOfAnimLoop(sprite);
  ContinueAnim(rt, sprite);
}

/** 1:1 décomp `void JumpToTopOfAnimLoop(struct Sprite *sprite)` (sprite.c:1050-1065) :
 *      if (sprite->animLoopCounter)
 *      {
 *          sprite->animCmdIndex--;
 *          while (anims[animNum][animCmdIndex - 1].type != -3) // -3 = ANIMCMD_LOOP
 *          {
 *              if (animCmdIndex == 0) break;
 *              animCmdIndex--;
 *          }
 *          animCmdIndex--;
 *      }
 *
 * Ne fait rien si animLoopCounter == 0 (= dernier passage → on tombe sur le cmd
 * suivant la boucle). Sinon : recule d'abord HORS du cmd LOOP courant, puis remonte
 * tant que le cmd PRÉCÉDENT (`[animCmdIndex-1]`) n'est pas un LOOP (= borne ouvrant
 * le bloc), enfin recule d'un cran de plus pour que le `animCmdIndex++` de ContinueAnim
 * retombe sur la 1re frame du bloc. La décomp lit `[idx-1]` (OOB lecture en idx=0, garde
 * par le break) ; en TS `animTable[-1]` = undefined (kind != 'loop'). */
function JumpToTopOfAnimLoop(sprite: AnimDispatchSprite): void {
  if (!sprite.anims) return;
  const animTable = sprite.anims[sprite.animNum];
  if (!animTable) return;
  if (sprite.animLoopCounter) {
    sprite.animCmdIndex--;
    while (animTable[sprite.animCmdIndex - 1]?.kind !== 'loop') {
      if (sprite.animCmdIndex === 0) break;
      sprite.animCmdIndex--;
    }
    sprite.animCmdIndex--;
  }
}

/** 1:1 décomp `void AnimateSprite(struct Sprite *sprite)` (sprite.c:901-907) :
 *      sAnimFuncs[sprite->animBeginning](sprite);
 *      // sAnimFuncs = [ContinueAnim, BeginAnim]
 *      // Donc : animBeginning=true → BeginAnim ; sinon ContinueAnim.
 *
 * Affine anim handler not yet ported here (= séparé). */
export function AnimateSprite(rt: DecompRuntime, sprite: AnimDispatchSprite): void {
  if (sprite.animBeginning) {
    BeginAnim(rt, sprite);
  } else {
    ContinueAnim(rt, sprite);
  }
}

// ─── StartSpriteAnim helpers 1:1 décomp sprite.c:1346-1371 ────────────────────

/** 1:1 décomp `void StartSpriteAnim(struct Sprite *sprite, u8 animNum)`
 *  (sprite.c:1346-1351) :
 *      sprite->animNum = animNum;
 *      sprite->animBeginning = TRUE;
 *      sprite->animEnded = FALSE; */
export function StartSpriteAnim(sprite: AnimDispatchSprite, animNum: number): void {
  sprite.animNum = animNum;
  sprite.animBeginning = true;
  sprite.animEnded = false;
}

/** 1:1 décomp `void StartSpriteAnimIfDifferent(struct Sprite *sprite, u8 animNum)`
 *  (sprite.c:1353-1357) : skip if déjà sur animNum. */
export function StartSpriteAnimIfDifferent(sprite: AnimDispatchSprite, animNum: number): void {
  if (sprite.animNum !== animNum) StartSpriteAnim(sprite, animNum);
}

/** 1:1 décomp `void SeekSpriteAnim(struct Sprite *sprite, u8 animCmdIndex)`
 *  (sprite.c:1359-1371) : set animCmdIndex + force ContinueAnim once. */
export function SeekSpriteAnim(rt: DecompRuntime, sprite: AnimDispatchSprite, animCmdIndex: number): void {
  const tempBeginning = sprite.animBeginning;
  const tempDelayCounter = sprite.animDelayCounter;
  sprite.animBeginning = false;
  sprite.animDelayCounter = 0;
  sprite.animCmdIndex = animCmdIndex - 1;
  ContinueAnim(rt, sprite);
  if (sprite.animEnded) {
    sprite.animBeginning = tempBeginning;
    sprite.animDelayCounter = tempDelayCounter;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE LIFECYCLE (1:1 décomp sprite.c) — extraction du harness (E2.3)
// ═══════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `void DestroySprite(struct Sprite *sprite)` (sprite.c:618-631).
 *  Forme transitionnelle (rt explicite + id au lieu du pointeur sprite, comme
 *  AnimateSprite) : le harness `DecompRuntime.DestroySprite` y délègue. Cache
 *  l'OAM, marque le slot libre (inUse=false), retire le callback. NE remet PAS
 *  `gSprites[id] = undefined` — 1:1 décomp, le slot reste jusqu'à réallocation
 *  (les sprites enfants lisent encore `gSprites[parentId].data`). */
export function DestroySprite(rt: DecompRuntime, spriteId: number): void {
  const sprite = rt.gSprites[spriteId];
  if (!sprite) return;
  rt.gba.oam[sprite.oamIndex].visible = false;
  sprite.invisible = true;
  sprite.inUse = false;
  sprite.callback = null;
  // Si la matrice affine du sprite a été ALLOUÉE via AllocOamMatrix (_matrixUsed),
  // la libérer (≈ FreeSpriteOamMatrix décomp). Sans ça, les matrices des mons de
  // combat (1 alloc/sprite) fuieraient.
  if (sprite.matrixNum > 0 && _isOamMatrixAllocated(sprite.matrixNum)) {
    FreeOamMatrix(sprite.matrixNum);
  }
}

/** 1:1 décomp `void ResetSpriteData(void)` (sprite.c:294-306) : ResetOamRange +
 *  ResetAllSprites + ClearSpriteCopyRequests + ResetAffineAnimData + FreeSpriteTile
 *  Ranges. CRITIQUE entre 2 scènes (libère les tiles OBJ VRAM avant le load suivant,
 *  sinon overflow 1024 tiles → frames transparentes). Forme transitionnelle `(rt)` ;
 *  le harness `DecompRuntime.ResetSpriteData` y délègue (13 call-sites).
 *  E2.3b : accède aux arrays `sSpriteTile*` EN DIRECT (statics du MÊME module = 1:1
 *  décomp) au lieu du hack `globalThis.__sprite`, et `setReservedSpriteTileCount(0)`. */
export function ResetSpriteData(rt: DecompRuntime): void {
  // ⚠️ Fix 2026-05-24 : avant de clear gSprites + OAMs, notifier les modules qui
  // maintiennent leur propre pool de spriteIds (= field-effect-emotes `_activeEmotes`)
  // — sinon leur state pointe vers des slots ré-attribués → tickXxxSprites overwrite
  // les NPC respawnés (bug user "moitié de maman"). La décomp s'appuie sur le check
  // `sprite->inUse` du game loop ; nos pools module-level n'ont pas cette propagation.
  const resetCallbacks = (globalThis as Record<string, unknown>).__spriteResetCallbacks as Array<() => void> | undefined;
  if (resetCallbacks) {
    for (const cb of resetCallbacks) {
      try { cb(); } catch (e) { console.warn('[ResetSpriteData] cleanup hook failed', e); }
    }
  }
  for (let i = 0; i < 128; i++) rt.gba.oam[i].visible = false;
  rt.gSprites.fill(undefined);
  rt.nextOamSlot = 0;
  rt.nextSpriteId = 0;
  // FreeSpriteTileRanges : reset tile allocator (1024 tiles OBJ VRAM).
  rt.freedSpriteTileRanges.length = 0;
  // 1:1 STRICT décomp sprite.c:294-306 : reset sSpriteTileRangeTags + sSpriteTileRanges
  // + sSpriteTileAllocBitmap + gReservedSpriteTileCount = 0. Arrays = statics de CE module.
  sSpriteTileRangeTags.fill(0xFFFF);
  sSpriteTileRanges.fill(0);
  sSpriteTileAllocBitmap.fill(0);
  setReservedSpriteTileCount(0);
  // 1:1 décomp ResetAffineAnimData (sprite.c:299) — release toutes les matrix OAM
  // (reset du bitmap d'alloc ; ex-`_matrixUsed.clear()`, consolidé sur l'état unique E2.3c).
  (globalThis as Record<string, unknown>).gOamMatrixAllocBitmap = 0;
}

/** 1:1-net : crée un sprite à partir de champs OAM résolus (cfg). Primitive M3
 *  bas-niveau (le décomp passe un `struct SpriteTemplate` ; ici les tileId/paletteBank/
 *  shape/size sont déjà résolus par l'appelant ou le dispatcher CreateSprite). Extraite
 *  du harness vers son home sprite (E2.3d) ; `DecompRuntime.CreateSpriteAtOam` y délègue
 *  (112 call-sites). Scanne le 1er slot OAM + gSprites libre (CreateSpriteAtEnd si fromEnd),
 *  applique CalcCenterToCornerVec, écrit dans rt.gba.oam[] + rt.gSprites[]. */
export function CreateSpriteAtOam(rt: DecompRuntime, cfg: {
  tileId: number, paletteBank: number, x: number, y: number,
  shape: 0 | 1 | 2, size: 0 | 1 | 2 | 3, priority: number,
  paletteMode?: 0 | 1, affineMode?: 0 | 1 | 2 | 3, affineParamIndex?: number,
  /** 1:1 décomp `CreateSprite` 4th arg. Default 0xFF (= sentinel "behind"). */
  subpriority?: number,
  /** 1:1 décomp `CreateSpriteAtEnd` (sprite.c:513-522) : itère gSprites
   *  + OAM de MAX_SPRITES-1 vers 0 au lieu de 0 vers MAX_SPRITES-1.
   *  Utilisé par les sprites field-effect (emote !/?/♥, etc.) qui doivent
   *  occuper les HAUTS slots → évite la collision avec les NPCs qui prennent
   *  les BAS slots via `CreateSprite` (= CreateSpriteAtOam par défaut).
   *  Sans ce flag, l'emote pouvait écraser le slot 1 (= NPC MOM) → sprite
   *  MOM rendu avec shape/size de l'emote (16x16) = "moitié de maman" bug. */
  fromEnd?: boolean,
}): { spriteId: number, oamIndex: number } {
  // Recherche un slot OAM libre.
  // Bug session 89 fix : avant on testait `!oam.visible` pour décider si un
  // slot était libre. MAIS un sprite alive avec sprite.invisible=true a son
  // oam.visible=false (synced) — le slot est OWNED par ce sprite, PAS libre.
  // Si on réalloue le slot, on a 2 sprites pointant le même oamIndex →
  // syncSpritesToOam écrase les data du sprite plus ancien à chaque frame
  // (last write wins).
  //
  // 1:1 décomp src/sprite.c CreateSprite : alloue le premier slot dont
  // sprite.inUse == false (= slot vraiment libre, sprite owner détruit).
  // On track les slots taken par les sprites alive et on alloue un slot
  // qui n'apparaît pas dans cet ensemble.
  const takenSlots = new Set<number>();
  for (let i = 0; i < MAX_SPRITES; i++) {
    const s = rt.gSprites[i];
    if (s !== undefined && s.inUse) takenSlots.add(s.oamIndex);
  }
  // Session 94 fix : subsprite child OAM slots are ALSO taken — a sprite
  // with a SetSubspriteTables installed allocates N child OAM indices that
  // primary `gSprites.inUse` tracking does NOT cover. Without this, the next
  // CreateSpriteAtOam picks a slot that's shared with a button/frame child
  // OAM → the button child gets stomped (= "RKBO" garbled BACK button,
  // fragmented MAJ button, underscores rendering at wrong y with wrong
  // tile data — naming screen Session 94 root cause).
  //
  // Foundation : reusable by every scene that mixes SetSubspriteTables +
  // plain CreateSpriteAtOam (= party menu cursor, summary screen markings,
  // status condition icons, future PC system, etc.).
  const getChildOams = (globalThis as Record<string, unknown>)._getSubspriteChildOamIndices as (() => Set<number>) | undefined;
  if (getChildOams) {
    for (const idx of getChildOams()) takenSlots.add(idx);
  }
  let oamIndex = -1;
  // 1:1 STRICT décomp sprite.c:502-522 :
  //   - CreateSprite       : itère 0 → MAX_SPRITES-1 (= 1er slot libre du bas)
  //   - CreateSpriteAtEnd  : itère MAX_SPRITES-1 → 0 (= 1er slot libre du haut)
  // Ces deux fns wrap CreateSpriteAt(index, ...). Notre `fromEnd` flag bascule
  // l'ordre de scan pour le seul cas où le décomp utilise CreateSpriteAtEnd
  // (= sprites field-effect emote/etc. qui doivent prendre slots hauts).
  if (cfg.fromEnd) {
    for (let i = 127; i >= 0; i--) {
      if (!takenSlots.has(i)) {
        oamIndex = i;
        break;
      }
    }
  } else {
    for (let i = 0; i < 128; i++) {
      if (!takenSlots.has(i)) {
        oamIndex = i;
        break;
      }
    }
  }
  if (oamIndex === -1) {
    if (!rt._oamExhaustedWarned) {
      console.warn('[DecompRuntime] OAM slots exhausted (further warnings suppressed)');
      rt._oamExhaustedWarned = true;
    }
    return { spriteId: -1, oamIndex: -1 };
  }
  const oam = rt.gba.oam[oamIndex];
  oam.visible = true;
  oam.tileId = cfg.tileId;
  oam.paletteBank = cfg.paletteBank;
  oam.x = cfg.x;
  oam.y = cfg.y;
  oam.shape = cfg.shape;
  oam.size = cfg.size;
  oam.priority = cfg.priority;
  oam.paletteMode = cfg.paletteMode ?? 0;
  oam.affineMode = (cfg.affineMode ?? 0) as 0 | 1 | 2 | 3;
  oam.affineParamIndex = cfg.affineParamIndex ?? 0;
  oam.flipH = false;
  oam.flipV = false;

  // 1:1 décomp src/sprite.c:CreateSpriteAt — CalcCenterToCornerVec
  // appliqué SYSTÉMATIQUEMENT à la création (pas seulement pour affine
  // sprites). oam.x = sprite.x + sprite.x2 + centerToCornerVecX (ligne 354).
  // Sans ça, les sprites non-affines sont rendus avec leur top-left à
  // (sprite.x, sprite.y) au lieu de leur CENTRE.
  // Cf. ground truth VBA-M Birch dump : sprite.x=136 (= 0x88) → oam.x=104,
  // diff = -32 = centerToCornerVecX pour shape=square size=64x64.
  const ctcv = CalcCenterToCornerVec(cfg.shape, cfg.size, (cfg.affineMode ?? 0));

  // 1:1 décomp src/sprite.c CreateSprite : gSprites = tableau fixe
  // MAX_SPRITES(64) ; alloue le 1er slot inUse==FALSE (réutilise les
  // sprites détruits), retourne MAX_SPRITES si les 64 sont pris.
  // AVANT : nextSpriteId++ MONOTONE → id≥64 (1) collisionne le sentinel
  // d'échec MAX_SPRITES=64 chez les appelants `!= MAX_SPRITES` (icône
  // sac orpheline à oam(-16,-16), x2/y2 jamais posés, jamais détruite)
  // (2) fuite gSprites non bornée. = 4e instance du pattern allocateur-
  // monotone-sans-reuse (cf. palette/tuiles/OAM déjà corrigés).
  let spriteId = -1;
  // 1:1 STRICT décomp sprite.c:502-522 : CreateSprite scan 0→63,
  // CreateSpriteAtEnd scan 63→0. Same `fromEnd` flag basule.
  if (cfg.fromEnd) {
    for (let i = 63; i >= 0; i--) {
      const ex = rt.gSprites[i];
      if (ex === undefined || ex.inUse === false) { spriteId = i; break; }
    }
  } else {
    for (let i = 0; i < 64; i++) {
      const ex = rt.gSprites[i];
      if (ex === undefined || ex.inUse === false) { spriteId = i; break; }
    }
  }
  if (spriteId === -1) {
    // 64 slots inUse → échec 1:1 (return MAX_SPRITES). Libère l'OAM réservé.
    rt.gba.oam[oamIndex].visible = false;
    if (!rt._oamExhaustedWarned) {
      console.warn('[DecompRuntime] gSprites (64) saturé — CreateSprite=MAX_SPRITES');
      rt._oamExhaustedWarned = true;
    }
    return { spriteId: 64 /* MAX_SPRITES */, oamIndex: -1 };
  }
  if (spriteId >= rt.nextSpriteId) rt.nextSpriteId = spriteId + 1;
  const sprite: DecompSprite = {
    oamIndex, data: new Int16Array(16) as unknown as number[], invisible: false,
    inUse: true,
    x: cfg.x, y: cfg.y, x2: 0, y2: 0,
    hFlip: false, vFlip: false,
    matrixNum: cfg.affineParamIndex ?? 0,
    centerToCornerVecX: ctcv.centerToCornerVecX,
    centerToCornerVecY: ctcv.centerToCornerVecY,
    animEnded: false, affineAnimEnded: false,
    callback: null,
    spriteId, tileBase: 0,
    objMode: 0,
    affineAnimsTableName: null,
    affineAnimNum: 0, affineAnimCmdIndex: 0, affineAnimDelayCounter: 0,
    xScale: 0x100, yScale: 0x100, rotation: 0,
    affineAnimBeginning: false, affineAnimPaused: false,
    shape: cfg.shape, size: cfg.size,
    affineMode: (cfg.affineMode ?? 0) as 0 | 1 | 2 | 3,
    subpriority: cfg.subpriority ?? 0xFF,
    // C1.1 — 1:1 STRICT défauts sprite anim fields (sprite.h:209-236).
    animNum: 0, animCmdIndex: 0, animDelayCounter: 0, animLoopCounter: 0,
    animBeginning: true,    // 1:1 décomp : nouveau sprite démarre par BeginAnim
    animPaused: false,
    images: null, anims: null,
    usingSheet: false, sheetTileStart: 0,
    subspriteMode: 'off',
  };
  rt.gSprites[spriteId] = sprite;
  return { spriteId, oamIndex };
}

/** 1:1 décomp `struct SpriteTemplate` (include/sprite.h:96) — modèle UNIFIÉ consommé
 *  par `CreateSprite`. Champs déjà décodés M3 : `oam` = OamData (shape/size numériques),
 *  `images` présent ⟺ voie décomp `tileTag == TAG_NONE` (tiles inline → AllocSpriteTiles),
 *  sinon sheet chargée par `tileTag` (résolu via GetSpriteTileStartByTag). `affineAnims` =
 *  NOM de table M3 (sprite-affine-extras.ts), `paletteTag` résolu via IndexOfSpritePaletteTag. */
export interface SpriteTemplate {
  tileTag?: number;
  paletteTag?: number;
  oam: {
    shape: 0 | 1 | 2; size: 0 | 1 | 2 | 3;
    priority?: number; paletteNum?: number;
    affineMode?: 0 | 1 | 2 | 3; paletteMode?: 0 | 1; objMode?: 0 | 1 | 2;
  };
  images?: ReadonlyArray<{ data: Uint8Array; size: number }> | null;
  anims?: ReadonlyArray<ReadonlyArray<unknown>> | null;
  affineAnims?: string | null;
  callback?: ((sprite: DecompSprite, rt: DecompRuntime) => void) | null;
}

/** 1:1 décomp `u8 CreateSprite(const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority)`
 *  (sprite.c:502) FUSIONNÉ avec le corps de `CreateSpriteAt` (sprite.c:540) — la séparation
 *  décomp `CreateSprite → CreateSpriteAt(index)` (scan du 1er slot `!inUse`) est absorbée par
 *  la primitive `CreateSpriteAtOam` (frontière harness documentée, comme composeFrame). Branche
 *  sur `tileTag` (sprite.c:562) :
 *    • `tileTag == TAG_NONE` (template avec `images`) → tiles inline (AllocSpriteTiles + write OBJ VRAM).
 *    • sinon → sheet déjà chargée par tag (GetSpriteTileStartByTag + sheetTileStart).
 *  HOME consolidé du dispatcher 3-voies du bridge (chantier B1) : les voies inline + tileTag y
 *  délèguent (`decomp-bridge.CreateSprite` + `DecompRuntime.CreateSpriteInline`) ; la voie par-nom
 *  overworld reste `CreateSpriteFromTemplate` jusqu'à B2. Retourne le spriteId (MAX_SPRITES=échec). */
export function CreateSprite(rt: DecompRuntime, template: SpriteTemplate, x: number, y: number, subpriority: number = 0xFF): number {
  // ── voie décomp `tileTag == TAG_NONE` : un sprite sans sheet alloue ses propres tiles
  //    OBJ VRAM via AllocSpriteTiles (sprite.c:562-575). = ex-`DecompRuntime.CreateSpriteInline`. ──
  if (Array.isArray(template.images)) {
    const img0 = template.images[0];
    const byteSize = img0?.size ?? img0?.data.length ?? 0;
    const tileCount = byteSize >> 5;  // 32 bytes / tile (4bpp)
    // F77 C0-racine : marquer d'abord les occupants RÉELS (mons/healthbox créés par OAM direct
    // ne marquent pas le bitmap) — sinon une alloc inline ≥64 tiles (pic Role Play/Transform)
    // part en first-fit 0 = écrase la zone healthbox. Hook posé par battle-anim-interpreter.
    ((globalThis as Record<string, unknown>).__markLiveSpriteTiles as (() => void) | undefined)?.();
    const tileStart = AllocSpriteTiles(tileCount);
    if (tileStart < 0) {
      console.warn('[CreateSprite] inline (tileTag==TAG_NONE) : AllocSpriteTiles échoué (OBJ VRAM saturé)');
      return MAX_SPRITES;  // = échec 1:1 décomp (return MAX_SPRITES)
    }
    if (img0) rt._writeToObjVram(img0.data, tileStart * TILE_SIZE_4BPP);
    const { spriteId } = CreateSpriteAtOam(rt, {
      tileId: tileStart,
      paletteBank: template.oam.paletteNum ?? 0,
      x, y,
      shape: template.oam.shape, size: template.oam.size,
      priority: template.oam.priority ?? 1,
      paletteMode: template.oam.paletteMode ?? 0,
      affineMode: template.oam.affineMode ?? 0,
      subpriority,
    });
    if (spriteId >= 0 && spriteId < MAX_SPRITES) {
      const s = rt.gSprites[spriteId];
      if (s) {
        s.callback = template.callback ?? null;
        s.images = template.images;
        s.anims = template.anims ?? null;
        s.usingSheet = false;
        s.tileBase = tileStart;
      }
    }
    return spriteId;
  }
  // ── voie décomp `tileTag != TAG_NONE` : sheet + palette déjà chargées par TAG (ex `LoadBallGfx`
  //    → gBallSpriteSheets/Palettes). Résout tileNum via GetSpriteTileStartByTag + paletteNum via
  //    IndexOfSpritePaletteTag (sprite.c:577-586). = ex-bloc manuel voie tileTag du bridge. ──
  const oam = template.oam;
  const tileTag = template.tileTag;
  if (typeof tileTag !== 'number') {
    console.warn('[CreateSprite] template sans `images` ni `tileTag` numérique — voie par-nom (= CreateSpriteFromTemplate, non gérée ici)');
    return -1;
  }
  const affineMode = oam.affineMode ?? 0;
  const tileStart = GetSpriteTileStartByTag(tileTag);
  if (tileStart === 0xFFFF) {
    console.warn(`[CreateSprite] sheet tag ${tileTag} non chargée (GetSpriteTileStartByTag=0xFFFF) — LoadXxxGfx requis avant CreateSprite`);
  }
  const palSlot = (typeof template.paletteTag === 'number') ? IndexOfSpritePaletteTag(template.paletteTag) : 0xFF;
  // Affine : alloue la matrice OAM AVANT la création pour que CalcCenterToCornerVec
  // (dans CreateSpriteAtOam) centre correctement le sprite en AFFINE_DOUBLE/NORMAL.
  let matrixNum = 0;
  if (affineMode !== 0) {
    const m = AllocOamMatrix();
    if (m > 0) matrixNum = m;
  }
  const created = CreateSpriteAtOam(rt, {
    tileId: tileStart === 0xFFFF ? 0 : tileStart,
    paletteBank: palSlot === 0xFF ? 0 : palSlot,
    x, y,
    shape: oam.shape, size: oam.size,
    priority: oam.priority ?? 1,
    paletteMode: oam.paletteMode ?? 0,
    affineMode,
    affineParamIndex: matrixNum,
    subpriority,
  });
  const spriteId = created.spriteId;
  if (spriteId >= 0 && spriteId < MAX_SPRITES) {
    const s = rt.gSprites[spriteId];
    if (s) {
      s.callback = template.callback ?? null;
      s.anims = template.anims ?? null;
      // 1:1 oam.objMode du template (gOamData_*_ObjBlend/ObjWindow) posé côté SPRITE :
      // syncSpritesToOam ré-écrit oam.objMode depuis ce champ CHAQUE frame (AUDIT OBJMODE
      // 2026-06-12 — sinon toutes les anims à templates Blend rendaient opaques).
      s.objMode = oam.objMode ?? 0;
      // En miroir, `template.affineAnims` = le NOM de la table enregistrée (sprite-affine-extras.ts).
      s.affineAnimsTableName = (typeof template.affineAnims === 'string') ? template.affineAnims : null;
      s.usingSheet = true;
      s.tileBase = tileStart === 0xFFFF ? 0 : tileStart;
      // 1:1 décomp `sprite->sheetTileStart = GetSpriteTileStartByTag(tileTag)` : le système d'anim
      // recalcule chaque frame `oam.tileNum = sheetTileStart + frame.imageValue` (sinon ball cubique).
      s.sheetTileStart = tileStart === 0xFFFF ? 0 : tileStart;
      if (affineMode !== 0 && matrixNum > 0) {
        s.matrixNum = matrixNum;
        // Démarre l'affine anim à l'index 0 (statique) ; l'appelant bascule plus tard
        // (StartSpriteAffineAnim(ball, 4) = le SPIN du send-out). AllocOamMatrix a posé l'identité.
        if (s.affineAnimsTableName) rt.StartSpriteAffineAnim(spriteId, 0);
      }
    }
  }
  return spriteId;
}

/** 1:1 décomp `static void RunSpriteCallbacks(void)` (sprite.c) — pour chaque slot
 *  inUse, exécute son `callback(sprite)`. Snapshot des sprites présents au début (un
 *  callback peut en créer/détruire pendant la boucle) → comportement identique via
 *  accès indexé. Relocalisée du harness (chantier A1) ; la méthode runtime délègue. */
export function runSpriteCallbacks(rt: DecompRuntime): void {
  const snapshot: DecompSprite[] = [];
  for (let i = 0; i < MAX_SPRITES; i++) {
    const s = rt.gSprites[i];
    if (s !== undefined) snapshot.push(s);
  }
  for (const sprite of snapshot) {
    if (rt.gSprites[sprite.spriteId] !== undefined && sprite.inUse && sprite.callback) {
      sprite.callback(sprite, rt);
    }
  }
}

/** Sync les fields sprite → gba.oam. 1:1 décomp `BuildOamBuffer` + `UpdateOamCoords`
 *  (sprite.c:339-359) :
 *    oam.x = sprite.x + sprite.x2 + sprite.centerToCornerVecX (+ gSpriteCoordOffsetX
 *            si coordOffsetEnabled → suit la caméra)
 *  centerToCornerVec = -w/2,-h/2 (×2 si AFFINE_DOUBLE) → (sprite.x,y) = centre affiché.
 *  subspriteMode==on → skip primary OAM (les child OAMs rendent à sa place).
 *  affineMode : merge sprite.affineMode | oam.affineMode (les auto-callbacks écrivent
 *  sur oam.affineMode, les autres sur sprite.affineMode) ; OFF explicite (affineMode==0
 *  + matrixNum==0 = teardown via FreeOamMatrix) → propage OFF. Relocalisée (chantier A1). */
export function syncSpritesToOam(rt: DecompRuntime): void {
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = rt.gSprites[i];
    if (sprite === undefined || !sprite.inUse) continue;
    const oam = rt.gba.oam[sprite.oamIndex];
    if (sprite.coordOffsetEnabled) {
      oam.x = sprite.x + sprite.x2 + sprite.centerToCornerVecX + rt.gSpriteCoordOffsetX;
      oam.y = sprite.y + sprite.y2 + sprite.centerToCornerVecY + rt.gSpriteCoordOffsetY;
    } else {
      oam.x = sprite.x + sprite.x2 + sprite.centerToCornerVecX;
      oam.y = sprite.y + sprite.y2 + sprite.centerToCornerVecY;
    }
    oam.visible = !sprite.invisible && sprite.subspriteMode !== 'on';
    oam.flipH = sprite.hFlip;
    oam.flipV = sprite.vFlip;
    oam.affineParamIndex = sprite.matrixNum;
    oam.objMode = sprite.objMode as 0 | 1 | 2;
    oam.subpriority = sprite.subpriority;
    const merged = (sprite.affineMode | (oam.affineMode ?? 0)) as 0 | 1 | 2 | 3;
    if (sprite.affineMode === 0 && sprite.matrixNum === 0) {
      oam.affineMode = 0;
    } else {
      oam.affineMode = merged;
    }
  }
}

/** HOTFIX 2026-05-09 : les data SPRITE_ANIMS auto-extraites stockent tileNum en
 *  STRING pour les constantes non résolues (= "VERSION_BANNER_RIGHT_TILEOFFSET").
 *  Résolution via decomp-constants au runtime (sans ça : tous les sprites à tile
 *  offset nommé partagent tileNum=0 → bug title screen "VERSI EMERA" dupliqué).
 *  Relocalisé du harness (chantier A2) ; le harness l'importe pour ses 3 autres sites. */
export function _resolveTileNum(raw: number | string | undefined): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return 0;
  const resolved = resolveDecompConstant(raw);
  return typeof resolved === 'number' ? resolved : 0;
}

/** Convertit une table d'anim du catalogue M3 (`SPRITE_ANIM_TABLES`/`SPRITE_ANIMS` +
 *  registres runtime `_extraAnimTables`/`_extraAnims`) en `AnimCmd[][]` (= le format inline
 *  décomp `const union AnimCmd *const *anims`). MÊME donnée que la décomp (frames =
 *  ANIMCMD_FRAME(imageValue, duration[, flips]), terminateur END/JUMP), re-matérialisée dans
 *  la structure que consomment AnimateSprite/BeginAnim/ContinueAnim. Outil de CONVERGENCE :
 *  migre les consommateurs `spriteAnimStates` (legacy state-machine) vers `sprite.anims` (1:1).
 *  Le `imageValue` = offset tile (modèle sheet `oam.tileId = sheetTileStart + imageValue`,
 *  identique au legacy `tileBase + tileNum`). Retourne null si la table est introuvable. */
export function resolveAnimTableToAnimCmds(rt: DecompRuntime, animTableName: string): ReadonlyArray<ReadonlyArray<AnimCmd>> | null {
  const animTable = rt._extraAnimTables.get(animTableName)
    ?? (SPRITE_ANIM_TABLES as Record<string, { anims: ReadonlyArray<string> }>)[animTableName];
  if (!animTable) return null;
  const out: AnimCmd[][] = [];
  for (const animName of animTable.anims) {
    const anim = rt._extraAnims.get(animName)
      ?? (SPRITE_ANIMS as Record<string, { frames: ReadonlyArray<{ tileNum: number | string, duration: number, hFlip?: boolean, vFlip?: boolean }>, terminator: string, jumpTo?: number }>)[animName];
    const cmds: AnimCmd[] = [];
    if (anim) {
      for (const f of anim.frames) {
        cmds.push(ANIMCMD_FRAME(_resolveTileNum(f.tileNum), f.duration, { hFlip: f.hFlip, vFlip: f.vFlip }));
      }
      // Terminateur 1:1 : JUMP(jumpTo) reboucle (loop de marche), END tient la dernière frame.
      if (anim.terminator === 'JUMP') cmds.push(ANIMCMD_JUMP(anim.jumpTo ?? 0));
      else cmds.push(ANIMCMD_END);
    } else {
      cmds.push(ANIMCMD_END);  // anim absente → séquence vide terminée (skip safe, = legacy delete).
    }
    out.push(cmds);
  }
  return out;
}

/** 1:1 décomp `sprite->anims = template->anims` + `StartSpriteAnim` (sprite.c:544 + :1346).
 *  CONVERGENCE : attache la table AnimCmd résolue sur le sprite + usingSheet/sheetTileStart
 *  (modèle sheet) et démarre l'anim `animIdx`. Remplace `spriteAnimStatesRegister` (legacy) →
 *  le sprite est désormais tické par `AnimateSprite` (chemin inline décomp = ce que fait déjà le
 *  live overworld), plus par la state-machine `spriteAnimStates`. Retourne false si la table est
 *  introuvable (le caller garde alors son chemin legacy). */
export function setSpriteAnims(rt: DecompRuntime, spriteId: number, animTableName: string, animIdx: number, tileBase: number): boolean {
  const anims = resolveAnimTableToAnimCmds(rt, animTableName);
  if (!anims) return false;
  const s = rt.gSprites[spriteId];
  if (!s) return false;
  s.anims = anims;
  s.usingSheet = true;
  s.sheetTileStart = tileBase;
  // 1:1 StartSpriteAnim : animNum + animBeginning=true + animEnded=false (BeginAnim applique
  // la frame 0 au prochain AnimateSprite). animCmdIndex/animDelayCounter remis à 0 (création).
  s.animNum = animIdx;
  s.animBeginning = true;
  s.animEnded = false;
  s.animCmdIndex = 0;
  s.animDelayCounter = 0;
  return true;
}

/** 1:1 décomp tick anims de `AnimateSprites` (sprite.c) : pour chaque sprite inUse avec une
 *  table `.anims`, AnimateSprite (BeginAnim/ContinueAnim + drain ProcessSpriteCopyRequests).
 *  Relocalisé du harness (chantier A2). La state-machine legacy `spriteAnimStates` (Map ≠
 *  décomp) a été SUPPRIMÉE (convergence 2026-06-22 : sac/intro/title/OW-graphics/swap-line/
 *  mon-front utilisent tous `sprite.anims` 1:1 via setSpriteAnims → plus aucun consommateur). */
export function tickSpriteAnims(rt: DecompRuntime): void {
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = rt.gSprites[i];
    if (sprite === undefined || !sprite.inUse) continue;
    if (sprite.anims === null) continue;
    AnimateSprite(rt, sprite as never);
  }
  ProcessSpriteCopyRequests(rt);
}

/** 1:1 décomp `void AnimateSprites(void)` (sprite.c:308) — pour chaque slot inUse :
 *  exécute son callback puis (si toujours inUse) AnimateSprite. Appelée par les CB2
 *  non-MainCB2 (CB2_MainMenu, NewGame…) qui ne passent pas par la boucle tick (où
 *  runOneFrame gate les anims via `isMainCB2`). Sans ça : player-shrink stuck.
 *  Relocalisée du harness vers son home sprite (E2.3e) ; la boucle hot-path reste dans
 *  DecompRuntime (méthodes per-frame), ce wrapper la déclenche pour ces callbacks. */
export function AnimateSprites(): void {
  const r = _rt();
  r.runSpriteCallbacksPublic();   // sprite.callback(sprite) chaque frame
  r.tickSpriteAnimsPublic();      // anims de frame (StartSpriteAnim + duration)
  r.tickAllAffineAnimsPublic();   // affine anims (scale/rotation deltas)
}

/** 1:1 décomp `void BuildOamBuffer(void)` (sprite.c:325) — sync sprite state → OAM
 *  buffer (position/visibilité/matrice affine) = AddSpritesToOamBuffer + co. */
export function BuildOamBuffer(): void {
  _rt().syncSpritesToOamPublic();
}
