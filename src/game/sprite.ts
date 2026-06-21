/**
 * src/engine/sprite.ts — port 1:1 STRICT de decomp/src/sprite.c (1760l).
 *
 * ┌─ STATUT (certifié 2026-06-09, user) ────────────────────────────────────┐
 * │ sprite.c = COUCHE PLATEFORME → RESTE en src/engine/system (règle « couche │
 * │ matérielle/OAM reste en system », PAS de déplacement vers src/game/). Le  │
 * │ port est RÉPARTI (pas un seul fichier) et FONCTIONNEL :                   │
 * │   • CE fichier (system/sprite.ts) : port MANUEL 1:1 — palette tag system, │
 * │     tile alloc bitmap, OAM matrix alloc/ops, AllocSpriteTiles,            │
 * │     LoadSpriteSheet(s), CalcCenterToCornerVec, ResetOamRange, LoadOam.    │
 * │   • decomp-runtime.ts : struct Sprite (= DecompSprite, MODÈLE PLAT, voir  │
 * │     ci-dessous), gSprites (Map<id,Sprite>), CreateSpriteAt(=CreateSprite- │
 * │     AtOam)/ResetSprite/ResetAllSprites/UpdateOamCoords/SortSprites/       │
 * │     BuildSpritePriorities/AddSpritesToOamBuffer(=syncSpritesToOam).       │
 * │   • decomp-data/auto-engine/src/sprite-engine.ts : EXTRACTION AUTO (bodyC │
 * │     = C littéral + callsTo) des 102 fns sprite.c — regen via             │
 * │     scripts/extract-engine-helpers.mjs. (miroir de DONNÉES du C.)         │
 * │   • sprite-animation.ts : BeginAnim/ContinueAnim/AnimCmd_frame.end.jump.loop               │
 * │     SetSpriteOamFlipBits/Request+ProcessSpriteCopyRequests.               │
 * │   • sprite-engine-impl.ts : BeginAffineAnim/ContinueAffineAnim.           │
 * │   • decomp-bridge.ts : CreateSprite/CreateSpriteAtEnd/DestroySprite/      │
 * │     StartSpriteAnim/StartSpriteAffineAnim/AllocOamMatrix/FreeOamMatrix.   │
 * │   • decomp-globals.ts : AnimateSprites/BuildOamBuffer/SpriteCallbackDummy/│
 * │     SetSubspriteTables/syncSubspriteOam(=AddSubspritesToOamBuffer)/       │
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
import type { DecompRuntime } from '../engine/system/decomp-runtime';
import { OBJ_PLTT_ID } from '../engine/system/decomp-runtime';

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
