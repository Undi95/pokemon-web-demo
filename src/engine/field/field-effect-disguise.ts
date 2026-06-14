/**
 * field-effect-disguise.ts — 1:1 décomp disguises tree/mountain/sand.
 *
 * Sources de vérité (1:1 décomp) :
 *   - `src/data/field_effects/field_effect_objects.h` (sPicTable/sAnimTable/Template *Disguise)
 *   - `src/field_effect_helpers.c:1313` (Show{Tree,Mountain,Sand}DisguiseFieldEffect)
 *   - `src/field_effect_helpers.c:1327` (ShowDisguiseFieldEffect)
 *   - `src/field_effect_helpers.c:1350` (UpdateDisguiseFieldEffect)
 *   - `src/field_effect_helpers.c:1377` (StartRevealDisguise / UpdateRevealDisguise)
 *
 * Comportement 1:1 : quand le joueur se « déguise » (bases secrètes), un sprite arbre/rocher/
 * monticule (16×32) le RECOUVRE et suit son sprite (x=player.x, y=height/2+player.y-16,
 * subpriority=player-1). Machine d'état : anim 0 statique ; quand on bouge, StartRevealDisguise
 * lance l'anim 1 (révélation 7 frames) puis le sprite disparaît (sReadyToEnd → FieldEffectStop).
 * Les fonctions Start/UpdateRevealDisguise sont appelées par les MovementActions (port futur)
 * via objectEvent.fieldEffectSpriteId / directionSeqIdx.
 *
 * Assets : tree_disguise.png / mountain_disguise.png / sand_disguise_placeholder.png (sand =
 * placeholder, jamais finalisé par Game Freak mais référencé en code). 112×32 = 7 frames 16×32.
 * Palette : embarquée (oam.paletteNum décomp = 4/3/2 partagé → on charge la palette PNG par slot).
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../system/sprite';
import { loadIndexedPngStrict } from '../gba/png-loader';
import { FieldEffectActiveListRemove } from './field-effect-active-list';
import {
  gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap, TryGetObjectEventIdByLocalIdAndMap,
  GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
} from './object-events';

// 1:1 FLDEFF_* en const LOCALES (cycle ESM field-effect↔module = TDZ).
const FLDEFF_TREE_DISGUISE = 28, FLDEFF_MOUNTAIN_DISGUISE = 29, FLDEFF_SAND_DISGUISE = 36;
const MAX_SPRITES = 64;

interface DisguiseCfg { key: string; fldEff: number; png: string; gfxTag: string; palTag: string; }
const CONFIGS: DisguiseCfg[] = [
  { key: 'tree',     fldEff: FLDEFF_TREE_DISGUISE,     png: '/decomp/em/field_effects/tree_disguise.png',              gfxTag: 'FIELD_EFFECT_TREE_DISGUISE_GFX',     palTag: 'FIELD_EFFECT_TREE_DISGUISE_PAL' },
  { key: 'mountain', fldEff: FLDEFF_MOUNTAIN_DISGUISE, png: '/decomp/em/field_effects/mountain_disguise.png',          gfxTag: 'FIELD_EFFECT_MOUNTAIN_DISGUISE_GFX', palTag: 'FIELD_EFFECT_MOUNTAIN_DISGUISE_PAL' },
  { key: 'sand',     fldEff: FLDEFF_SAND_DISGUISE,     png: '/decomp/em/field_effects/sand_disguise_placeholder.png',  gfxTag: 'FIELD_EFFECT_SAND_DISGUISE_GFX',     palTag: 'FIELD_EFFECT_SAND_DISGUISE_PAL' },
];

const NUM_FRAMES = 7;
const FRAME_W_TILES = 2, FRAME_H_TILES = 4;
const TILES_PER_FRAME = FRAME_W_TILES * FRAME_H_TILES;  // 8 (16×32)
const PNG_W_TILES = 14;  // 112px
const OBJECT_EVENTS_COUNT = 16;

/** 1:1 sAnim_*DisguiseReveal : frames 0..6 @4, ANIMCMD_END → 28 ticks. */
const REVEAL_DURATION = 4;
const REVEAL_TOTAL = NUM_FRAMES * REVEAL_DURATION;  // 28

const _tileStart: number[] = [-1, -1, -1];
const _palSlot: number[] = [-1, -1, -1];

interface DisguiseState {
  spriteId: number; oamIndex: number; active: boolean; cfgIdx: number;
  sState: number; localId: number; mapNum: number; mapGroup: number;
  sFldEff: number; sReadyToEnd: boolean; revealTicks: number;
}
const POOL_SIZE = 2;
const _pool: DisguiseState[] = [];
let _initialized = false;

(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _pool.length = 0; });
  g.__spriteResetCallbacks = callbacks;
})();

/** PNG 112×32 = 14×4 tiles row-major. Frame F (16×32 = 2×4 tiles) = colonnes 2F,2F+1 rows 0..3
 *  → 1D OBJ frame-major (8 tiles/frame). */
function pngTo1dObjLayout(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(NUM_FRAMES * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let r = 0; r < FRAME_H_TILES; r++) {
      for (let c = 0; c < FRAME_W_TILES; c++) {
        const pngTileIdx = r * PNG_W_TILES + (f * FRAME_W_TILES + c);
        const objTileIdx = f * TILES_PER_FRAME + r * FRAME_W_TILES + c;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

let _initPromise: Promise<void> | null = null;
export function preloadDisguiseEffects(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _initialized && CONFIGS.every(c => IndexOfSpriteTileTag(c.gfxTag) !== 0xFF);
  if (stillAlloc) return Promise.resolve();
  if (_initPromise && !_initialized) return _initPromise;
  _initialized = false; _initPromise = null;
  _initPromise = (async () => {
    for (let i = 0; i < CONFIGS.length; i++) {
      const c = CONFIGS[i];
      const png = await loadIndexedPngStrict(c.png, 4);
      const reordered = pngTo1dObjLayout(png.charData);
      _tileStart[i] = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: c.gfxTag });
      _palSlot[i] = LoadSpritePalette({ data: png.palette as Uint16Array, tag: c.palTag });
    }
    _pool.length = 0;
    for (let i = 0; i < POOL_SIZE; i++) {
      _pool[i] = { spriteId: -1, oamIndex: -1, active: false, cfgIdx: 0, sState: 0, localId: 0xFF, mapNum: 0, mapGroup: 0, sFldEff: 0, sReadyToEnd: false, revealTicks: 0 };
    }
    _initialized = true;
  })();
  return _initPromise;
}

function findFreeSlot(): number {
  for (let i = 0; i < POOL_SIZE; i++) if (!_pool[i].active) return i;
  return -1;
}
function findBySpriteId(spriteId: number): DisguiseState | undefined {
  for (const e of _pool) if (e.active && e.spriteId === spriteId) return e;
  return undefined;
}
function cfgIdxOfFldEff(fldEff: number): number {
  return CONFIGS.findIndex(c => c.fldEff === fldEff);
}

/** 1:1 décomp `ShowDisguiseFieldEffect` (field_effect_helpers.c:1327). args[0..2]=localId/mapNum/
 *  mapGroup. Retourne le spriteId (stocké dans objectEvent.fieldEffectSpriteId par le caller). */
export function SpawnDisguiseEffect(rt: DecompRuntime, fldEff: number, localId: number, mapNum: number, mapGroup: number): number {
  if (!_initialized) return MAX_SPRITES;
  const cfgIdx = cfgIdxOfFldEff(fldEff);
  if (cfgIdx < 0) return MAX_SPRITES;
  // 1:1 : si l'object event n'existe pas → FieldEffectActiveListRemove + abort.
  const { notFound } = TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (notFound) { FieldEffectActiveListRemove(fldEff); return MAX_SPRITES; }
  const objectEventId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (objectEventId >= OBJECT_EVENTS_COUNT) return MAX_SPRITES;
  const slot = findFreeSlot();
  if (slot < 0) return MAX_SPRITES;
  const result = rt.CreateSpriteAtOam({
    tileId: _tileStart[cfgIdx],
    paletteBank: _palSlot[cfgIdx],
    x: 0, y: 0,
    shape: 2, size: 2,  // 16×32
    priority: 2, paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (sprite) sprite.coordOffsetEnabled = true;  // 1:1 : sprite->coordOffsetEnabled++.
  const s = _pool[slot];
  s.spriteId = result.spriteId; s.oamIndex = result.oamIndex; s.active = true; s.cfgIdx = cfgIdx;
  // 1:1 : sState=0 (statique), sFldEff, sLocalId/sMapNum/sMapGroup.
  s.sState = 0; s.sFldEff = fldEff; s.localId = localId; s.mapNum = mapNum; s.mapGroup = mapGroup;
  s.sReadyToEnd = false; s.revealTicks = 0;
  return result.spriteId;
}

// Entrées publiques (1:1 Show{Tree,Mountain,Sand}DisguiseFieldEffect).
export function ShowTreeDisguiseFieldEffect(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number): number {
  return SpawnDisguiseEffect(rt, FLDEFF_TREE_DISGUISE, localId, mapNum, mapGroup);
}
export function ShowMountainDisguiseFieldEffect(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number): number {
  return SpawnDisguiseEffect(rt, FLDEFF_MOUNTAIN_DISGUISE, localId, mapNum, mapGroup);
}
export function ShowSandDisguiseFieldEffect(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number): number {
  return SpawnDisguiseEffect(rt, FLDEFF_SAND_DISGUISE, localId, mapNum, mapGroup);
}

function destroy(rt: DecompRuntime, s: DisguiseState): void {
  const sprite = rt.gSprites.get(s.spriteId);
  const oam = rt.gba.oam[s.oamIndex];
  if (sprite) { sprite.inUse = false; rt.gSprites.delete(s.spriteId); }
  if (oam) { oam.visible = false; oam.tileId = 0; oam.flipH = false; }
  s.active = false; s.spriteId = -1; s.oamIndex = -1;
}

/** 1:1 décomp `UpdateDisguiseFieldEffect` (field_effect_helpers.c:1350). À call/frame. */
export function UpdateDisguiseEffects(rt: DecompRuntime): void {
  if (!_initialized) return;
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (!sprite) { s.active = false; s.spriteId = -1; continue; }
    const oam = rt.gba.oam[s.oamIndex];
    const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(s.localId, s.mapNum, s.mapGroup);
    if (notFound) { destroy(rt, s); continue; }
    const objEvent: ObjectEvent = gObjectEvents[objectEventId];
    const linkedSpriteId = GetObjectEventMainSpriteId(objEvent);
    const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
    if (!linked) continue;
    // 1:1 : suit le sprite parent + offset corps + z-order devant le parent.
    sprite.invisible = linked.invisible;
    sprite.x = linked.x;
    sprite.y = (GetObjectEventGfxHeight(objEvent.graphicsId) >> 1) + linked.y - 16;
    sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
    sprite.subpriority = (linked.subpriority - 1) & 0xFF;

    // 1:1 : machine d'état de révélation.
    if (s.sState === 1) { s.sState = 2; s.revealTicks = 0; }  // StartSpriteAnim(1) (reveal).

    // Frame courante : statique (anim 0 frame 0) si sState < 2, sinon reveal (anim 1).
    let frameIdx = 0;
    if (s.sState >= 2) {
      frameIdx = Math.min(NUM_FRAMES - 1, Math.floor(s.revealTicks / REVEAL_DURATION));
      const animEnded = s.revealTicks >= REVEAL_TOTAL;
      if (s.revealTicks < REVEAL_TOTAL) s.revealTicks++;
      if (s.sState === 2 && animEnded) s.sReadyToEnd = true;
    }
    oam.tileId = _tileStart[s.cfgIdx] + frameIdx * TILES_PER_FRAME;

    if (s.sState === 3) { destroy(rt, s); continue; }
    oam.visible = !sprite.invisible;
  }
}

/** 1:1 décomp `StartRevealDisguise` (field_effect_helpers.c:1377). Appelé par les MovementActions
 *  (port futur) quand le joueur quitte le déguisement. */
export function StartRevealDisguise(objectEvent: ObjectEvent): void {
  if (objectEvent.directionSeqIdx === 1) {
    const e = findBySpriteId(objectEvent.fieldEffectSpriteId);
    if (e) e.sState++;
  }
}

/** 1:1 décomp `UpdateRevealDisguise` (field_effect_helpers.c:1383). Retourne TRUE quand la
 *  révélation est finie (le sprite a atteint sReadyToEnd) ou hors séquence. */
export function UpdateRevealDisguise(objectEvent: ObjectEvent): boolean {
  if (objectEvent.directionSeqIdx === 2) return true;
  if (objectEvent.directionSeqIdx === 0) return true;
  const e = findBySpriteId(objectEvent.fieldEffectSpriteId);
  if (e && e.sReadyToEnd) {
    objectEvent.directionSeqIdx = 2;
    e.sState++;
    return true;
  }
  return false;
}

export function DestroyAllDisguiseEffects(rt: DecompRuntime): void {
  for (const s of _pool) {
    if (!s.active) continue;
    const sprite = rt.gSprites.get(s.spriteId);
    if (sprite) { sprite.inUse = false; rt.gba.oam[s.oamIndex].visible = false; }
    s.active = false; s.spriteId = -1;
  }
}
