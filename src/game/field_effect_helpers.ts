/**
 * field_effect_helpers.ts — Port 1:1 STRICT MIROIR de `src/field_effect_helpers.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/field_effect_helpers.c
 *                    + src/data/field_effects/field_effect_objects.h (templates/anims/pics).
 *
 * ── OBJECTIF ───────────────────────────────────────────────────────────────
 * Fichier unique regroupant TOUTES les fonctions de field_effect_helpers.c, dans
 * l'ORDRE EXACT du .c, aux NOMS du décomp (FldEff_X / UpdateXFieldEffect / ...).
 * Remplace progressivement les ~18 modules `src/engine/field/field-effect-*.ts`
 * (= ancienne adaptation pool) + le code reflets logé dans object-events.ts.
 *
 * ── MODÈLE 1:1 (pas de shim) ─────────────────────────────────────────────────
 * Chaque effet est un SPRITE avec `sprite.callback = UpdateXFieldEffect`, tické
 * par la boucle globale `runSpriteCallbacks` (decomp-runtime.ts:2544) — exactement
 * comme le décomp tick `gSprites[i].callback`. L'état persistant vit dans
 * `sprite.data[0..7]` (mêmes index que les `#define sXxx data[N]` du décomp).
 * => AUCUN pool, AUCUN `UpdateXEffects(rt)` appelé depuis la scène. C'est le même
 * modèle que les reflets (déjà 1:1 : `refl.callback = UpdateObjectReflectionSprite`).
 *
 * ── ADAPTATIONS PLATEFORME (documentées, pas des approximations) ──────────────
 *  - Création : le décomp fait `CreateSpriteAtEnd(gFieldEffectObjectTemplatePointers[..])`
 *    qui charge sheet+palette via le template. Nous préchargeons sheet/palette une
 *    fois (LoadSpriteSheet/LoadSpritePalette) puis `rt.CreateSpriteAtOam` avec le
 *    tileId/paletteBank résolus. Le `template.callback` du décomp → on pose
 *    `sprite.callback = UpdateXFieldEffect` à la main dans FldEff_X.
 *  - Anim : nos sprites CreateSpriteAtOam n'ont pas de table d'anim tickée par
 *    `tickSpriteAnims` (anims === null → skip). On reproduit fidèlement la séquence
 *    de frames du décomp (mêmes durées) à la main dans le callback, via un compteur
 *    de ticks rangé dans un `data[]` libre (≠ index décomp, noté localement). C'est
 *    le même choix que les reflets (`animPaused` + tileId piloté à la main).
 *  - coordOffsetEnabled : le décomp pose TRUE (sprites monde + gSpriteCoordOffset).
 *    Nos parents (player/NPC) sont ÉCRAN-positionnés → on matche le parent pour
 *    suivre exactement (le callback recopie x/y du parent chaque frame).
 *
 * Migration en cours (1 effet = 1 commit, A/B avant chaque) :
 *   ✅ FldEff_ShortGrass + UpdateShortGrassFieldEffect.
 *   ✅ FldEff_Jump{TallGrass,LongGrass,SmallSplash,BigSplash} + UpdateJumpImpactEffect (config-driven).
 *   ✅ FldEff_Splash + FldEff_FeetInFlowingWater (+ leurs Update, gfx partagé).
 *   ✅ FldEff_Ripple (+ WaitFieldEffectSpriteAnim générique one-shot).
 *   ✅ FldEff_HotSpringsWater + UpdateHotSpringsWaterFieldEffect.
 *   ✅ FldEff_SandPile + UpdateSandPileFieldEffect.
 *   ✅ FldEff_Bubbles + UpdateBubblesFieldEffect (bug 1:1 répliqué).
 *   ⏳ reste : reflets, tall/long grass, footprints, splash, ash, surf blob,
 *      disguises, sparkle, shadow (stub non-1:1 à refaire), jump dust, warp arrow, + effets morts.
 */

import type { DecompRuntime, DecompSprite } from '../engine/system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../engine/system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../engine/gba/png-loader';
import {
  gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap,
  TryGetObjectEventIdByLocalIdAndMap, GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
  SetObjectSubpriorityByElevation,
} from '../engine/field/object-events';
import { ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, type AnimCmd } from '../engine/system/sprite-animation';
import { SetSpritePosToOffsetMapCoords } from '../engine/field/field-camera';
import {
  gFieldEffectArguments, FieldEffectStop,
} from '../engine/field/field-effect';

// 1:1 décomp FLDEFF_* (include/constants/field_effects.h). Const LOCALES (≠ import) pour
// éviter le cycle ESM field-effect ↔ field_effect_helpers au top-level (pitfall TDZ connu :
// un import de FLDEFF_* utilisé hors corps de fonction casse l'init du module).
const FLDEFF_SPLASH = 15;
const FLDEFF_FEET_IN_FLOWING_WATER = 34;
const FLDEFF_JUMP_TALL_GRASS = 12;
const FLDEFF_JUMP_BIG_SPLASH = 14;
const FLDEFF_JUMP_SMALL_SPLASH = 16;
const FLDEFF_JUMP_LONG_GRASS = 18;
const FLDEFF_SHORT_GRASS = 41;
const FLDEFF_RIPPLE = 5;
const FLDEFF_HOT_SPRINGS_WATER = 42;
const FLDEFF_SAND_PILE = 39;
const FLDEFF_BUBBLES = 53;

const OBJECT_EVENTS_COUNT = 16;
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;

// ════════════════════════════════════════════════════════════════════════════
//  Helper partagé : UpdateObjectEventSpriteInvisibility (event_object_movement.c:8562)
//  — appelé par de nombreux UpdateXFieldEffect. Vit ailleurs (event_object_movement.c)
//    dans le décomp ; logé ici en attendant sa propre consolidation (homeless helper).
// ════════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `UpdateObjectEventSpriteInvisibility(sprite, invisible)` : pose
 *  `sprite->invisible = invisible`, puis force invisible si le sprite est hors-écran
 *  (culling 16px de marge). */
export function UpdateObjectEventSpriteInvisibility(rt: DecompRuntime, sprite: DecompSprite, invisible: boolean): void {
  sprite.invisible = invisible;
  const offX = sprite.coordOffsetEnabled ? rt.gSpriteCoordOffsetX : 0;
  const offY = sprite.coordOffsetEnabled ? rt.gSpriteCoordOffsetY : 0;
  const x = (sprite.x + sprite.x2 + sprite.centerToCornerVecX + offX) & 0xFFFF;
  const y = (sprite.y + sprite.y2 + sprite.centerToCornerVecY + offY) & 0xFFFF;
  const x2 = (x << 16 >> 16) - (sprite.centerToCornerVecX >> 1);
  const y2 = (y << 16 >> 16) - (sprite.centerToCornerVecY >> 1);
  if ((x << 16 >> 16) >= DISPLAY_WIDTH + 16 || x2 < -16) sprite.invisible = true;
  if ((y << 16 >> 16) >= DISPLAY_HEIGHT + 16 || y2 < -16) sprite.invisible = true;
}

/** Câble une sheet préchargée (LoadSpriteSheet) + sa table d'anim sur un sprite créé via
 *  CreateSpriteAtOam, pour que le VRAI moteur d'anim (tickSpriteAnims → AnimateSprite) pilote
 *  les frames (`oam.tileId = sheetTileStart + imageValue`) et pose `sprite.animEnded` sur
 *  ANIMCMD_END. C'est l'équivalent de ce que fait CreateSprite(template) du décomp (le template
 *  porte .anims/.images). imageValue dans les tables = offset TILE (= frameIdx × tilesParFrame)
 *  car on est en mode `usingSheet` (toute la sheet est chargée d'un bloc, ≠ chemin images[]). */
function setFieldEffectAnims(
  sprite: DecompSprite, anims: ReadonlyArray<ReadonlyArray<AnimCmd>>, sheetTileStart: number,
): void {
  sprite.usingSheet = true;
  sprite.sheetTileStart = sheetTileStart;
  sprite.tileBase = sheetTileStart;
  sprite.anims = anims;
  sprite.images = null;
  sprite.animNum = 0;
  sprite.animCmdIndex = 0;
  sprite.animDelayCounter = 0;
  sprite.animLoopCounter = 0;
  sprite.animBeginning = true;
  sprite.animEnded = false;
  sprite.animPaused = false;
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_ShortGrass (field_effect_helpers.c:492)
//  Touffe d'herbe basse (16×16) qui SUIT le parent en continu (≠ tall/long grass
//  tuile-fixe). Petit sway 2 frames qui REJOUE quand le parent bouge. y2=(height>>1)-8
//  (mi-corps), subpriority=parent-1, oam.priority recopiée du parent chaque frame,
//  invisible = celui du parent. Despawn quand l'owner n'est plus inShortGrass.
//  Assets : short_grass.png (32×16 = 2 frames 16×16), palette general_1.pal.
//  Sprite data 1:1 : sLocalId=data[0] sMapNum=data[1] sMapGroup=data[2] sPrevX=data[3] sPrevY=data[4].
// ════════════════════════════════════════════════════════════════════════════

const SHORT_GRASS_PNG = '/decomp/em/field_effects/short_grass.png';
const TAG_SHORT_GRASS_GFX = 'FIELD_EFFECT_SHORT_GRASS_GFX';
const SHORT_GRASS_NUM_FRAMES = 2;
const SHORT_GRASS_TILES_PER_FRAME = 4;  // 16×16

/** 1:1 décomp `sAnim_ShortGrass` (field_effect_objects.h) : FRAME(0,4)(1,4) END → sway 2 frames.
 *  imageValue = offset tile (frameIdx × 4). */
const sAnims_ShortGrass: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(4, 4), ANIMCMD_END],
];

let _shortGrassTileStart = -1;
let _shortGrassPalSlot = -1;
let _shortGrassInit = false;
let _shortGrassInitPromise: Promise<void> | null = null;

/** PNG 32×16 = 4×2 tiles row-major → frame-major (frame F = cols 2F,2F+1 sur 2 rows = 4 tiles). */
function pngTo1dObjLayoutShortGrass(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32, PNG_WIDTH_TILES = 4;
  const out = new Uint8Array(SHORT_GRASS_NUM_FRAMES * SHORT_GRASS_TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < SHORT_GRASS_NUM_FRAMES; f++) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const pngTileIdx = row * PNG_WIDTH_TILES + (f * 2) + col;
        const objTileIdx = f * SHORT_GRASS_TILES_PER_FRAME + row * 2 + col;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

/** Préchargement asset (concern plateforme). */
export function preloadShortGrassEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _shortGrassInit && IndexOfSpriteTileTag(TAG_SHORT_GRASS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_shortGrassInitPromise && !_shortGrassInit) return _shortGrassInitPromise;
  _shortGrassInit = false; _shortGrassInitPromise = null;
  _shortGrassInitPromise = (async () => {
    const png = await loadIndexedPngStrict(SHORT_GRASS_PNG, 4);
    const reordered = pngTo1dObjLayoutShortGrass(png.charData);
    _shortGrassTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SHORT_GRASS_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _shortGrassPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    _shortGrassInit = true;
  })();
  return _shortGrassInitPromise;
}

/** 1:1 décomp `FldEff_ShortGrass` (field_effect_helpers.c:492). Lit gFieldEffectArguments[0..2]. */
export function FldEff_ShortGrass(rt: DecompRuntime): number {
  if (!_shortGrassInit) return 64;
  const localId = gFieldEffectArguments[0], mapNum = gFieldEffectArguments[1], mapGroup = gFieldEffectArguments[2];
  // 1:1 : un seul short grass par owner (le callback despawn quand !inShortGrass).
  for (const s of rt.gSprites.values()) {
    if (s.inUse && s.callback === UpdateShortGrassFieldEffect &&
        s.data[0] === localId && s.data[1] === mapNum && s.data[2] === mapGroup) return 64;
  }
  const objectEventId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (objectEventId >= OBJECT_EVENTS_COUNT) return 64;
  const objectEvent = gObjectEvents[objectEventId];
  const parentSpriteId = GetObjectEventMainSpriteId(objectEvent);
  const parentSprite = parentSpriteId >= 0 ? rt.gSprites.get(parentSpriteId) : undefined;
  if (!parentSprite) return 64;
  const pOam = rt.gba.oam[parentSprite.oamIndex];
  const result = rt.CreateSpriteAtOam({
    tileId: _shortGrassTileStart,
    paletteBank: _shortGrassPalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 0, size: 1,  // 16×16
    // 1:1 : sprite->oam.priority = gSprites[objectEvent->spriteId].oam.priority.
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateShortGrassFieldEffect;
  setFieldEffectAnims(sprite, sAnims_ShortGrass, _shortGrassTileStart);
  sprite.x = parentSprite.x; sprite.y = parentSprite.y;
  // 1:1 : sprite->coordOffsetEnabled = TRUE → matcher le parent (écran-positionné).
  sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
  sprite.data[0] = localId; sprite.data[1] = mapNum; sprite.data[2] = mapGroup;
  // 1:1 : sprite->sPrevX/Y = gSprites[objectEvent->spriteId].x/y.
  sprite.data[3] = parentSprite.x; sprite.data[4] = parentSprite.y;
  return 0;
}

/** 1:1 décomp `UpdateShortGrassFieldEffect` (field_effect_helpers.c:511). Callback per-frame. */
export function UpdateShortGrassFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(sprite.data[0], sprite.data[1], sprite.data[2]);
  if (notFound || !gObjectEvents[objectEventId].inShortGrass) {
    // 1:1 décomp : FieldEffectStop(sprite, FLDEFF_SHORT_GRASS).
    FieldEffectStop(rt, sprite, FLDEFF_SHORT_GRASS);
    return;
  }
  const objEvent: ObjectEvent = gObjectEvents[objectEventId];
  const linkedSpriteId = GetObjectEventMainSpriteId(objEvent);
  const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
  if (!linked) return;
  const parentX = linked.x, parentY = linked.y;
  // 1:1 : si le parent a bougé, relance le sway depuis frame 0 (si fini). Moteur d'anim → animEnded.
  if (parentX !== sprite.data[3] || parentY !== sprite.data[4]) {
    sprite.data[3] = parentX; sprite.data[4] = parentY;
    if (sprite.animEnded) rt.StartSpriteAnim(sprite.spriteId, 0);
  }
  // 1:1 : suit le parent + offset mi-corps + z-order devant le parent.
  sprite.x = parentX; sprite.y = parentY;
  sprite.y2 = (GetObjectEventGfxHeight(objEvent.graphicsId) >> 1) - 8;
  sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
  sprite.subpriority = (linked.subpriority - 1) & 0xFF;
  // 1:1 : sprite->oam.priority = linkedSprite->oam.priority (recopié chaque frame).
  const lOam = rt.gba.oam[linked.oamIndex];
  if (lOam) rt.gba.oam[sprite.oamIndex].priority = lOam.priority;
  // 1:1 : UpdateObjectEventSpriteInvisibility(sprite, linkedSprite->invisible).
  UpdateObjectEventSpriteInvisibility(rt, sprite, linked.invisible);
}

// ════════════════════════════════════════════════════════════════════════════
//  Jump impact effects (field_effect_helpers.c) — partagent UpdateJumpImpactEffect (1641) :
//    FldEff_JumpTallGrass (359) / FldEff_JumpLongGrass (468) /
//    FldEff_JumpSmallSplash (684) / FldEff_JumpBigSplash (701).
//  Sprite tuile-fixe (SetSpritePosToOffsetMapCoords + coordOffsetEnabled) spawné au saut de
//  rebord/atterrissage sur herbe/eau. Anim joue UNE fois → despawn (animEnded) ; sinon
//  SetObjectSubpriorityByElevation. Config-driven (4 ≈ identiques : asset/anim/dims varient).
//  Sprite data 1:1 : sJumpElevation=data[0], sJumpFldEff=data[1].
// ════════════════════════════════════════════════════════════════════════════

const FE_BASE = '/decomp/em/field_effects';

interface JumpCfg {
  tag: string; png: string; pngWidthTiles: number;
  frameWtiles: number; frameHtiles: number;
  shape: 0 | 1 | 2; size: 0 | 1 | 2 | 3;
  /** Index de frame PNG pour chaque slot de sheet (long grass saute le PNG-frame 5). */
  sheetFrames: number[];
  /** sAnim : (slot de sheet, durée game frames). END après → despawn. */
  anim: ReadonlyArray<readonly [number, number]>;
  pal: 'g0' | 'g1';
  dx: number; dy: number;
}

/** 1:1 templates field_effect_objects.h (sPicTable/sAnim/Template Jump*). */
const JUMP_CFG: Record<number, JumpCfg> = {
  [FLDEFF_JUMP_TALL_GRASS]: {
    tag: 'FE_JUMP_TALL_GRASS', png: `${FE_BASE}/jump_tall_grass.png`, pngWidthTiles: 8,
    frameWtiles: 2, frameHtiles: 1, shape: 1, size: 0,
    sheetFrames: [0, 1, 2, 3], anim: [[0, 8], [1, 8], [2, 8], [3, 8]], pal: 'g1', dx: 8, dy: 12,
  },
  [FLDEFF_JUMP_LONG_GRASS]: {
    tag: 'FE_JUMP_LONG_GRASS', png: `${FE_BASE}/jump_long_grass.png`, pngWidthTiles: 14,
    frameWtiles: 2, frameHtiles: 2, shape: 0, size: 1,
    sheetFrames: [0, 1, 2, 3, 4, 6], anim: [[0, 4], [1, 4], [2, 8], [3, 8], [4, 8], [5, 8]], pal: 'g1', dx: 8, dy: 8,
  },
  [FLDEFF_JUMP_SMALL_SPLASH]: {
    tag: 'FE_JUMP_SMALL_SPLASH', png: `${FE_BASE}/jump_small_splash.png`, pngWidthTiles: 6,
    frameWtiles: 2, frameHtiles: 1, shape: 1, size: 0,
    sheetFrames: [0, 1, 2], anim: [[0, 4], [1, 4], [2, 4]], pal: 'g0', dx: 8, dy: 12,
  },
  [FLDEFF_JUMP_BIG_SPLASH]: {
    tag: 'FE_JUMP_BIG_SPLASH', png: `${FE_BASE}/jump_big_splash.png`, pngWidthTiles: 8,
    frameWtiles: 2, frameHtiles: 2, shape: 0, size: 1,
    sheetFrames: [0, 1, 2, 3], anim: [[0, 8], [1, 8], [2, 8], [3, 8]], pal: 'g0', dx: 8, dy: 8,
  },
};

/** Construit la table d'anim moteur depuis la config : imageValue = slot × (tiles/frame). */
function buildJumpAnims(cfg: JumpCfg): AnimCmd[][] {
  const tpf = cfg.frameWtiles * cfg.frameHtiles;
  return [[...cfg.anim.map(([slot, dur]) => ANIMCMD_FRAME(slot * tpf, dur)), ANIMCMD_END]];
}
const _jumpAnims: Record<number, AnimCmd[][]> = {};
const _jumpTileStart = new Map<number, number>();
let _jumpPalG0 = -1, _jumpPalG1 = -1;
let _jumpInit = false;
let _jumpInitPromise: Promise<void> | null = null;

/** Reorder PNG row-major → OBJ 1D frame-major, en suivant sheetFrames (PNG frame par slot). */
function reorderJumpSheet(charData: Uint8Array, cfg: JumpCfg): Uint8Array {
  const TILE_BYTES = 32;
  const tpf = cfg.frameWtiles * cfg.frameHtiles;
  const out = new Uint8Array(cfg.sheetFrames.length * tpf * TILE_BYTES);
  let dst = 0;
  for (const pngFrame of cfg.sheetFrames) {
    const colStart = pngFrame * cfg.frameWtiles;
    for (let r = 0; r < cfg.frameHtiles; r++) {
      for (let c = 0; c < cfg.frameWtiles; c++) {
        const srcOff = (r * cfg.pngWidthTiles + colStart + c) * TILE_BYTES;
        if (srcOff + TILE_BYTES <= charData.length) out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
        dst += TILE_BYTES;
      }
    }
  }
  return out;
}

/** Préchargement assets (les 4 sheets jump + palettes general_0/1). */
export function preloadJumpImpactEffects(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _jumpInit && IndexOfSpriteTileTag(JUMP_CFG[FLDEFF_JUMP_TALL_GRASS].tag) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_jumpInitPromise && !_jumpInit) return _jumpInitPromise;
  _jumpInit = false; _jumpInitPromise = null;
  _jumpInitPromise = (async () => {
    try { _jumpPalG0 = LoadSpritePalette({ data: await loadGbaPal(`${FE_BASE}/general_0.pal`), tag: TAG_GENERAL_0_PAL }); } catch { _jumpPalG0 = 0; }
    try { _jumpPalG1 = LoadSpritePalette({ data: await loadGbaPal(`${FE_BASE}/general_1.pal`), tag: TAG_GENERAL_1_PAL }); } catch { _jumpPalG1 = 0; }
    for (const key of Object.keys(JUMP_CFG)) {
      const fldeff = Number(key);
      const cfg = JUMP_CFG[fldeff];
      const png = await loadIndexedPngStrict(cfg.png, 4);
      const reordered = reorderJumpSheet(png.charData, cfg);
      _jumpTileStart.set(fldeff, LoadSpriteSheet({ data: reordered, size: reordered.length, tag: cfg.tag }));
      _jumpAnims[fldeff] = buildJumpAnims(cfg);
    }
    _jumpInit = true;
  })();
  return _jumpInitPromise;
}

/** Helper commun 1:1 `FldEff_Jump*` : spawn tuile-fixe + coordOffsetEnabled + callback partagé.
 *  Lit gFieldEffectArguments[0/1]=coords INTERNAL (currentCoords), [2]=elevation, [3]=priority. */
function spawnJumpImpactEffect(rt: DecompRuntime, fldeff: number): number {
  if (!_jumpInit) return 64;
  const cfg = JUMP_CFG[fldeff];
  const tileStart = _jumpTileStart.get(fldeff);
  if (!cfg || tileStart === undefined) return 64;
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], cfg.dx, cfg.dy);
  const result = rt.CreateSpriteAtOam({
    tileId: tileStart,
    paletteBank: cfg.pal === 'g0' ? _jumpPalG0 : _jumpPalG1,
    x: world.x, y: world.y,
    shape: cfg.shape, size: cfg.size,
    priority: (gFieldEffectArguments[3] & 3) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateJumpImpactEffect;
  setFieldEffectAnims(sprite, _jumpAnims[fldeff], tileStart);
  sprite.x = world.x; sprite.y = world.y;
  // 1:1 : sprite->coordOffsetEnabled = TRUE.
  sprite.coordOffsetEnabled = true;
  // 1:1 : sprite->sJumpElevation = args[2] ; sJumpFldEff = FLDEFF_X.
  sprite.data[0] = gFieldEffectArguments[2];
  sprite.data[1] = fldeff;
  return 0;
}

/** 1:1 décomp `FldEff_JumpTallGrass` (field_effect_helpers.c:359). */
export function FldEff_JumpTallGrass(rt: DecompRuntime): number { return spawnJumpImpactEffect(rt, FLDEFF_JUMP_TALL_GRASS); }
/** 1:1 décomp `FldEff_JumpLongGrass` (field_effect_helpers.c:468). */
export function FldEff_JumpLongGrass(rt: DecompRuntime): number { return spawnJumpImpactEffect(rt, FLDEFF_JUMP_LONG_GRASS); }
/** 1:1 décomp `FldEff_JumpSmallSplash` (field_effect_helpers.c:684). */
export function FldEff_JumpSmallSplash(rt: DecompRuntime): number { return spawnJumpImpactEffect(rt, FLDEFF_JUMP_SMALL_SPLASH); }
/** 1:1 décomp `FldEff_JumpBigSplash` (field_effect_helpers.c:701). */
export function FldEff_JumpBigSplash(rt: DecompRuntime): number { return spawnJumpImpactEffect(rt, FLDEFF_JUMP_BIG_SPLASH); }

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_Splash (642) + FldEff_FeetInFlowingWater (725)
//  Partagent le template FLDEFFOBJ_SPLASH (splash.png 16×8, 2 anims) :
//   - anim 0 = éclaboussure one-shot (UpdateSplashFieldEffect, despawn sur animEnded).
//   - anim 1 = pieds dans l'eau qui coule, boucle JUMP(0) (UpdateFeetInFlowingWaterFieldEffect,
//     despawn quand l'owner n'est plus inShallowFlowingWater).
//  Les deux SUIVENT le sprite du parent (x/y), y2 = (height>>1)-4. Palette general_0.
//  PlaySE(SE_PUDDLE) du décomp SKIPPÉ (contrat « jamais l'audio »).
//  Sprite data 1:1 : sLocalId=data[0] sMapNum=data[1] sMapGroup=data[2] (+ Feet : sPrevX=data[3] sPrevY=data[4]).
// ════════════════════════════════════════════════════════════════════════════

const SPLASH_PNG = '/decomp/em/field_effects/splash.png';
const TAG_SPLASH_GFX = 'FIELD_EFFECT_SPLASH_GFX';
const SPLASH_NUM_FRAMES = 2;
const SPLASH_TILES_PER_FRAME = 2;  // 16×8

/** 1:1 décomp `sAnim_Splash_0` (field_effect_objects.h) : FRAME(0,4)(1,4) END → éclaboussure one-shot.
 *  `sAnim_Splash_1` : (0,4)(1,4)(0,6)(1,6)(0,8)(1,8)(0,6)(1,6) JUMP(0) → boucle pieds-dans-l'eau.
 *  imageValue = offset tile (frameIdx × 2). */
const sAnims_Splash: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(2, 4), ANIMCMD_END],
  [
    ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(2, 4), ANIMCMD_FRAME(0, 6), ANIMCMD_FRAME(2, 6),
    ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(2, 8), ANIMCMD_FRAME(0, 6), ANIMCMD_FRAME(2, 6),
    ANIMCMD_JUMP(0),
  ],
];

let _splashTileStart = -1;
let _splashPalSlot = -1;
let _splashInit = false;
let _splashInitPromise: Promise<void> | null = null;

/** PNG 32×8 = 4×1 tiles row-major → frame F (16×8) = 2 tiles consécutifs (pas de reorder réel). */
function pngTo1dObjLayoutSplash(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(SPLASH_NUM_FRAMES * SPLASH_TILES_PER_FRAME * TILE_BYTES);
  out.set(charData.subarray(0, out.length));
  return out;
}

/** Préchargement asset (concern plateforme). */
export function preloadSplashEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _splashInit && IndexOfSpriteTileTag(TAG_SPLASH_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_splashInitPromise && !_splashInit) return _splashInitPromise;
  _splashInit = false; _splashInitPromise = null;
  _splashInitPromise = (async () => {
    const png = await loadIndexedPngStrict(SPLASH_PNG, 4);
    const reordered = pngTo1dObjLayoutSplash(png.charData);
    _splashTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SPLASH_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_0_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _splashPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_0_PAL });
    _splashInit = true;
  })();
  return _splashInitPromise;
}

/** Helper commun de création du sprite splash (partagé Splash + FeetInFlowingWater). */
function createSplashSprite(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number) {
  const objectEventId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (objectEventId >= OBJECT_EVENTS_COUNT) return null;
  const objectEvent = gObjectEvents[objectEventId];
  const parentSpriteId = GetObjectEventMainSpriteId(objectEvent);
  const parentSprite = parentSpriteId >= 0 ? rt.gSprites.get(parentSpriteId) : undefined;
  if (!parentSprite) return null;
  const pOam = rt.gba.oam[parentSprite.oamIndex];
  const result = rt.CreateSpriteAtOam({
    tileId: _splashTileStart, paletteBank: _splashPalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 1, size: 0,  // 16×8
    // 1:1 : sprite->oam.priority = gSprites[objectEvent->spriteId].oam.priority.
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return null;
  setFieldEffectAnims(sprite, sAnims_Splash, _splashTileStart);
  sprite.x = parentSprite.x; sprite.y = parentSprite.y;
  sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
  // 1:1 : sprite->y2 = (graphicsInfo->height >> 1) - 4.
  sprite.y2 = (GetObjectEventGfxHeight(objectEvent.graphicsId) >> 1) - 4;
  sprite.data[0] = localId; sprite.data[1] = mapNum; sprite.data[2] = mapGroup;
  return sprite;
}

/** 1:1 décomp `FldEff_Splash` (field_effect_helpers.c:642). Lit gFieldEffectArguments[0..2]. */
export function FldEff_Splash(rt: DecompRuntime): number {
  if (!_splashInit) return 64;
  const sprite = createSplashSprite(rt, gFieldEffectArguments[0], gFieldEffectArguments[1], gFieldEffectArguments[2]);
  if (!sprite) return 64;
  // 1:1 : template.callback = UpdateSplashFieldEffect, anim 0 (one-shot, par défaut).
  sprite.callback = UpdateSplashFieldEffect;
  // 1:1 : PlaySE(SE_PUDDLE) — SKIP (audio).
  return 0;
}

/** 1:1 décomp `UpdateSplashFieldEffect` (field_effect_helpers.c:664). Callback per-frame. */
export function UpdateSplashFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(sprite.data[0], sprite.data[1], sprite.data[2]);
  // 1:1 : despawn sur animEnded (one-shot) OU owner disparu.
  if (sprite.animEnded || notFound) {
    FieldEffectStop(rt, sprite, FLDEFF_SPLASH);
    return;
  }
  const linkedSpriteId = GetObjectEventMainSpriteId(gObjectEvents[objectEventId]);
  const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
  if (!linked) return;
  sprite.x = linked.x; sprite.y = linked.y;
  sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
  UpdateObjectEventSpriteInvisibility(rt, sprite, false);
}

/** 1:1 décomp `FldEff_FeetInFlowingWater` (field_effect_helpers.c:725). Lit gFieldEffectArguments[0..2]. */
export function FldEff_FeetInFlowingWater(rt: DecompRuntime): number {
  if (!_splashInit) return 64;
  const sprite = createSplashSprite(rt, gFieldEffectArguments[0], gFieldEffectArguments[1], gFieldEffectArguments[2]);
  if (!sprite) return 64;
  // 1:1 : sprite->callback = UpdateFeetInFlowingWaterFieldEffect ; sPrevX/Y = -1 ; StartSpriteAnim(1).
  sprite.callback = UpdateFeetInFlowingWaterFieldEffect;
  sprite.data[3] = -1; sprite.data[4] = -1;
  rt.StartSpriteAnim(sprite.spriteId, 1);
  return 0;
}

/** 1:1 décomp `UpdateFeetInFlowingWaterFieldEffect` (field_effect_helpers.c:748). Callback per-frame. */
export function UpdateFeetInFlowingWaterFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(sprite.data[0], sprite.data[1], sprite.data[2]);
  if (notFound || !gObjectEvents[objectEventId].inShallowFlowingWater) {
    FieldEffectStop(rt, sprite, FLDEFF_FEET_IN_FLOWING_WATER);
    return;
  }
  const objectEvent: ObjectEvent = gObjectEvents[objectEventId];
  const linkedSpriteId = GetObjectEventMainSpriteId(objectEvent);
  const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
  if (!linked) return;
  sprite.x = linked.x; sprite.y = linked.y;
  sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
  sprite.subpriority = linked.subpriority & 0xFF;
  UpdateObjectEventSpriteInvisibility(rt, sprite, false);
  // 1:1 : au changement de tuile (currentCoords), re-PlaySE(SE_PUDDLE) si visible — SKIP (audio).
  if (objectEvent.currentCoordsX !== sprite.data[3] || objectEvent.currentCoordsY !== sprite.data[4]) {
    sprite.data[3] = objectEvent.currentCoordsX;
    sprite.data[4] = objectEvent.currentCoordsY;
    // if (!sprite.invisible) PlaySE(SE_PUDDLE) — SKIP (audio).
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_Ripple (field_effect_helpers.c:780)
//  Ondulation d'eau (16×16) spawnée sous un objet sur une tuile à ondulations
//  (DoRippleFieldEffect). One-shot : anim 8 cmds puis ANIMCMD_END → auto-despawn via
//  le callback générique WaitFieldEffectSpriteAnim (animEnded → FieldEffectStop).
//  coordOffsetEnabled=TRUE (sprite MONDE : DoRippleFieldEffect convertit écran→monde
//  avant le spawn). Assets : ripple.png (80×16 = 5 frames 16×16), palette general_1.pal.
//  Sprite data 1:1 décomp : sWaitFldEff = data[0] (= l'id à FieldEffectStop).
// ════════════════════════════════════════════════════════════════════════════

const RIPPLE_PNG = '/decomp/em/field_effects/ripple.png';
const TAG_RIPPLE_GFX = 'FIELD_EFFECT_RIPPLE_GFX';
const RIPPLE_NUM_FRAMES = 5;
const RIPPLE_TILES_PER_FRAME = 4;  // 16×16 = 2×2 tiles

/** 1:1 décomp `sAnim_Ripple` (field_effect_objects.h:112) : frames 0,1,2,3,0,1,2,4 (durées
 *  12,9,9,9,9,9,11,11) END. imageValue = offset tile (frameIdx × 4). */
const sAnims_Ripple: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [
    ANIMCMD_FRAME(0, 12), ANIMCMD_FRAME(4, 9), ANIMCMD_FRAME(8, 9), ANIMCMD_FRAME(12, 9),
    ANIMCMD_FRAME(0, 9), ANIMCMD_FRAME(4, 9), ANIMCMD_FRAME(8, 11), ANIMCMD_FRAME(16, 11),
    ANIMCMD_END,
  ],
];

let _rippleTileStart = -1;
let _ripplePalSlot = -1;
let _rippleInit = false;
let _rippleInitPromise: Promise<void> | null = null;

/** PNG 80×16 = 10×2 tiles row-major → 1D OBJ frame-major (frame F = 4 tiles consécutifs :
 *  row0 2F,2F+1 ; row1 10+2F,10+2F+1). 1:1 disposition obj_frame_tiles. */
function pngTo1dObjLayoutRipple(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32, SHEET_TILE_W = 10;
  const out = new Uint8Array(RIPPLE_NUM_FRAMES * RIPPLE_TILES_PER_FRAME * TILE_BYTES);
  let dst = 0;
  for (let f = 0; f < RIPPLE_NUM_FRAMES; f++) {
    const colStart = f * 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const srcOff = (r * SHEET_TILE_W + colStart + c) * TILE_BYTES;
        if (srcOff + TILE_BYTES <= charData.length) out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
        dst += TILE_BYTES;
      }
    }
  }
  return out;
}

/** Préchargement asset (concern plateforme). */
export function preloadRippleEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _rippleInit && IndexOfSpriteTileTag(TAG_RIPPLE_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_rippleInitPromise && !_rippleInit) return _rippleInitPromise;
  _rippleInit = false; _rippleInitPromise = null;
  _rippleInitPromise = (async () => {
    const png = await loadIndexedPngStrict(RIPPLE_PNG, 4);
    const reordered = pngTo1dObjLayoutRipple(png.charData);
    _rippleTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_RIPPLE_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _ripplePalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    _rippleInit = true;
  })();
  return _rippleInitPromise;
}

/** 1:1 décomp `FldEff_Ripple` (field_effect_helpers.c:780). Lit gFieldEffectArguments :
 *  [0/1] = x/y MONDE (DoRippleFieldEffect a converti écran→monde), [2] = subpriority,
 *  [3] = priority. */
export function FldEff_Ripple(rt: DecompRuntime): number {
  if (!_rippleInit) return 64;
  const worldX = gFieldEffectArguments[0], worldY = gFieldEffectArguments[1];
  const subpriority = gFieldEffectArguments[2], priority = gFieldEffectArguments[3];
  const result = rt.CreateSpriteAtOam({
    tileId: _rippleTileStart,
    paletteBank: _ripplePalSlot,
    x: worldX, y: worldY,
    shape: 0, size: 1,  // 16×16
    priority: (priority & 3) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
    subpriority: subpriority & 0xFF,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  // 1:1 : template.callback = WaitFieldEffectSpriteAnim ; .anims = sAnims_Ripple.
  sprite.callback = WaitFieldEffectSpriteAnim;
  setFieldEffectAnims(sprite, sAnims_Ripple, _rippleTileStart);
  sprite.x = worldX; sprite.y = worldY;
  // 1:1 : sprite->coordOffsetEnabled = TRUE (sprite MONDE → suit la caméra via gSpriteCoordOffset).
  sprite.coordOffsetEnabled = true;
  sprite.subpriority = subpriority & 0xFF;
  // 1:1 : sprite->sWaitFldEff = FLDEFF_RIPPLE (data[0]) — l'id passé à FieldEffectStop.
  sprite.data[0] = FLDEFF_RIPPLE;
  return 0;
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_HotSpringsWater (field_effect_helpers.c:800)
//  Nappe d'eau chaude (16×16, frame statique) qui SUIT le parent assis dans les sources
//  de Lavaridge. Lape DEVANT le joueur (subpriority = parent-1), couvre le bas du corps
//  (y = height/2 + parentY - 8). Despawn quand l'owner n'est plus inHotSprings.
//  Assets : hot_springs_water.png (16×16, 1 frame), palette general_1.pal.
//  Sprite data 1:1 décomp : sLocalId=data[0] sMapNum=data[1] sMapGroup=data[2]
//  (sPrevX=data[3]/sPrevY=data[4] posés mais "// Unused" dans le décomp).
// ════════════════════════════════════════════════════════════════════════════

const HOT_SPRINGS_PNG = '/decomp/em/field_effects/hot_springs_water.png';
const GENERAL_1_PAL = '/decomp/em/field_effects/general_1.pal';
const TAG_HOT_SPRINGS_GFX = 'FIELD_EFFECT_HOT_SPRINGS_WATER_GFX';
const TAG_GENERAL_1_PAL = 'FLDEFF_PAL_TAG_GENERAL_1';

/** 1:1 décomp `sAnim_HotSpringsWater` (field_effect_objects.h:1106) : FRAME(0,4) END →
 *  frame 0 statique tenue (animEnded immédiat). imageValue = offset tile (frame 0 = 0). */
const sAnims_HotSpringsWater: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 4), ANIMCMD_END],
];

let _hotSpringsTileStart = -1;
let _hotSpringsPalSlot = -1;
let _hotSpringsInit = false;
let _hotSpringsInitPromise: Promise<void> | null = null;

/** Préchargement asset (concern plateforme). */
export function preloadHotSpringsEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _hotSpringsInit && IndexOfSpriteTileTag(TAG_HOT_SPRINGS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_hotSpringsInitPromise && !_hotSpringsInit) return _hotSpringsInitPromise;
  _hotSpringsInit = false; _hotSpringsInitPromise = null;
  _hotSpringsInitPromise = (async () => {
    // PNG 16×16 = 4 tiles 2×2, ordre PNG brut (row-major) = ordre obj. Frame unique.
    const png = await loadIndexedPngStrict(HOT_SPRINGS_PNG, 4);
    _hotSpringsTileStart = LoadSpriteSheet({ data: png.charData, size: png.charData.length, tag: TAG_HOT_SPRINGS_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _hotSpringsPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    _hotSpringsInit = true;
  })();
  return _hotSpringsInitPromise;
}

/** 1:1 décomp `FldEff_HotSpringsWater` (field_effect_helpers.c:800). Lit gFieldEffectArguments[0..2]
 *  = localId/mapNum/mapGroup de l'owner. */
export function FldEff_HotSpringsWater(rt: DecompRuntime): number {
  if (!_hotSpringsInit) return 64;
  const localId = gFieldEffectArguments[0], mapNum = gFieldEffectArguments[1], mapGroup = gFieldEffectArguments[2];
  // 1:1 : un seul hot springs par owner (le callback despawn quand !inHotSprings).
  for (const s of rt.gSprites.values()) {
    if (s.inUse && s.callback === UpdateHotSpringsWaterFieldEffect &&
        s.data[0] === localId && s.data[1] === mapNum && s.data[2] === mapGroup) return 64;
  }
  const objectEventId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (objectEventId >= OBJECT_EVENTS_COUNT) return 64;
  const objectEvent = gObjectEvents[objectEventId];
  const parentSpriteId = GetObjectEventMainSpriteId(objectEvent);
  const parentSprite = parentSpriteId >= 0 ? rt.gSprites.get(parentSpriteId) : undefined;
  if (!parentSprite) return 64;
  const pOam = rt.gba.oam[parentSprite.oamIndex];
  const result = rt.CreateSpriteAtOam({
    tileId: _hotSpringsTileStart,
    paletteBank: _hotSpringsPalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 0, size: 1,  // 16×16
    // 1:1 : sprite->oam.priority = gSprites[objectEvent->spriteId].oam.priority.
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateHotSpringsWaterFieldEffect;
  // 1:1 : template.anims = sAnims_HotSpringsWater → moteur d'anim (frame 0 statique).
  setFieldEffectAnims(sprite, sAnims_HotSpringsWater, _hotSpringsTileStart);
  sprite.x = parentSprite.x; sprite.y = parentSprite.y;
  // 1:1 : sprite->coordOffsetEnabled = TRUE → matcher le parent (écran-positionné).
  sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
  sprite.data[0] = localId; sprite.data[1] = mapNum; sprite.data[2] = mapGroup;
  sprite.data[3] = parentSprite.x; sprite.data[4] = parentSprite.y; // sPrevX/Y (Unused décomp)
  return 0;
}

/** 1:1 décomp `UpdateHotSpringsWaterFieldEffect` (field_effect_helpers.c:819). Callback per-frame. */
export function UpdateHotSpringsWaterFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(sprite.data[0], sprite.data[1], sprite.data[2]);
  if (notFound || !gObjectEvents[objectEventId].inHotSprings) {
    // 1:1 décomp : FieldEffectStop(sprite, FLDEFF_HOT_SPRINGS_WATER).
    FieldEffectStop(rt, sprite, FLDEFF_HOT_SPRINGS_WATER);
    return;
  }
  const objEvent: ObjectEvent = gObjectEvents[objectEventId];
  const linkedSpriteId = GetObjectEventMainSpriteId(objEvent);
  const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
  if (!linked) return;
  // 1:1 : x = linkedSprite->x ; y = (height>>1) + linkedSprite->y - 8 (couvre le bas du corps) ;
  // subpriority = linkedSprite->subpriority - 1 (DEVANT le joueur).
  sprite.x = linked.x;
  sprite.y = (GetObjectEventGfxHeight(objEvent.graphicsId) >> 1) + linked.y - 8;
  sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
  sprite.subpriority = (linked.subpriority - 1) & 0xFF;
  // 1:1 : UpdateObjectEventSpriteInvisibility(sprite, FALSE). (Anim statique frame 0 tenue par le moteur.)
  UpdateObjectEventSpriteInvisibility(rt, sprite, false);
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_SandPile (field_effect_helpers.c:1204)
//  Petit monticule de sable remué (16×8) qui SUIT le sprite du parent marchant sur
//  du sable profond (MB_DEEP_SAND). Anim 3 frames @4 ; au spawn SeekSpriteAnim(2)
//  (démarre sur la frame finale = sable retombé), REJOUE depuis frame 0 au mouvement.
//
//  Assets : sand_pile.png (48×8 = 3 frames 16×8), palette general_0.pal.
//  Sprite data 1:1 décomp :
//    sLocalId  = data[0]   sMapNum = data[1]   sMapGroup = data[2]
//    sPrevX    = data[3]   sPrevY  = data[4]
//  (anim pilotée par le VRAI moteur via sAnims_SandPile + SeekSpriteAnim, PAS de compteur manuel)
// ════════════════════════════════════════════════════════════════════════════

const SAND_PILE_PNG = '/decomp/em/field_effects/sand_pile.png';
const GENERAL_0_PAL = '/decomp/em/field_effects/general_0.pal';
const TAG_SAND_PILE_GFX = 'FIELD_EFFECT_SAND_PILE_GFX';
const TAG_GENERAL_0_PAL = 'FLDEFF_PAL_TAG_GENERAL_0';

/** 1:1 décomp `sAnim_SandPile` (field_effect_objects.h:793) : FRAME(0,4)(1,4)(2,4) END.
 *  imageValue = offset tile (16×8 = 2 tiles/frame → frames 0,2,4). */
const sAnims_SandPile: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(2, 4), ANIMCMD_FRAME(4, 4), ANIMCMD_END],
];

let _sandPileTileStart = -1;
let _sandPilePalSlot = -1;
let _sandPileInit = false;
let _sandPileInitPromise: Promise<void> | null = null;

/** Préchargement asset (concern plateforme — le décomp charge via le template à la création). */
export function preloadSandPileEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _sandPileInit && IndexOfSpriteTileTag(TAG_SAND_PILE_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_sandPileInitPromise && !_sandPileInit) return _sandPileInitPromise;
  _sandPileInit = false; _sandPileInitPromise = null;
  _sandPileInitPromise = (async () => {
    // PNG 48×8 = 6 tiles en UNE rangée → ordre PNG brut = ordre frame (pas de reorder).
    const png = await loadIndexedPngStrict(SAND_PILE_PNG, 4);
    _sandPileTileStart = LoadSpriteSheet({ data: png.charData, size: png.charData.length, tag: TAG_SAND_PILE_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_0_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _sandPilePalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_0_PAL });
    _sandPileInit = true;
  })();
  return _sandPileInitPromise;
}

/** 1:1 décomp `FldEff_SandPile` (field_effect_helpers.c:1204). Lit gFieldEffectArguments[0..2]
 *  = localId/mapNum/mapGroup de l'owner (posés par StartFieldEffectForObjectEvent). */
export function FldEff_SandPile(rt: DecompRuntime): number {
  if (!_sandPileInit) return 64; // MAX_SPRITES — assets pas prêts
  const localId = gFieldEffectArguments[0], mapNum = gFieldEffectArguments[1], mapGroup = gFieldEffectArguments[2];
  // 1:1 : un seul sand pile par owner (le callback despawn quand !inSandPile → pas de doublon).
  for (const s of rt.gSprites.values()) {
    if (s.inUse && s.callback === UpdateSandPileFieldEffect &&
        s.data[0] === localId && s.data[1] === mapNum && s.data[2] === mapGroup) return 64;
  }
  const objectEventId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (objectEventId >= OBJECT_EVENTS_COUNT) return 64;
  const objectEvent = gObjectEvents[objectEventId];
  const parentSpriteId = GetObjectEventMainSpriteId(objectEvent);
  const parentSprite = parentSpriteId >= 0 ? rt.gSprites.get(parentSpriteId) : undefined;
  if (!parentSprite) return 64;
  const pOam = rt.gba.oam[parentSprite.oamIndex];
  // 1:1 décomp `CreateSpriteAtEnd(gFieldEffectObjectTemplatePointers[FLDEFFOBJ_SAND_PILE], 0,0,0)`.
  const result = rt.CreateSpriteAtOam({
    tileId: _sandPileTileStart,
    paletteBank: _sandPilePalSlot,
    x: parentSprite.x, y: parentSprite.y,
    shape: 1, size: 0,  // 16×8 (horizontal)
    // 1:1 : sprite->oam.priority = gSprites[objectEvent->spriteId].oam.priority.
    priority: (pOam ? pOam.priority : 2) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateSandPileFieldEffect;
  // 1:1 : template.anims = sAnims_SandPile → moteur d'anim pilote les frames.
  setFieldEffectAnims(sprite, sAnims_SandPile, _sandPileTileStart);
  sprite.x = parentSprite.x; sprite.y = parentSprite.y;
  // 1:1 : sprite->coordOffsetEnabled = TRUE → matcher le parent (écran-positionné).
  sprite.coordOffsetEnabled = parentSprite.coordOffsetEnabled;
  // 1:1 : sprite->y2 = (graphicsInfo->height >> 1) - 2 (aux pieds du parent).
  sprite.y2 = (GetObjectEventGfxHeight(objectEvent.graphicsId) >> 1) - 2;
  sprite.data[0] = localId; sprite.data[1] = mapNum; sprite.data[2] = mapGroup;
  // 1:1 : sprite->sPrevX/Y = gSprites[objectEvent->spriteId].x/y.
  sprite.data[3] = parentSprite.x; sprite.data[4] = parentSprite.y;
  // 1:1 : SeekSpriteAnim(sprite, 2) → démarre sur la frame 2 (sable retombé).
  rt.SeekSpriteAnim(sprite.spriteId, 2);
  return 0;
}

/** 1:1 décomp `UpdateSandPileFieldEffect` (field_effect_helpers.c:1226). Callback per-frame. */
export function UpdateSandPileFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(sprite.data[0], sprite.data[1], sprite.data[2]);
  if (notFound || !gObjectEvents[objectEventId].inSandPile) {
    // 1:1 décomp : FieldEffectStop(sprite, FLDEFF_SAND_PILE).
    FieldEffectStop(rt, sprite, FLDEFF_SAND_PILE);
    return;
  }
  const objEvent: ObjectEvent = gObjectEvents[objectEventId];
  const linkedSpriteId = GetObjectEventMainSpriteId(objEvent);
  const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
  if (!linked) return;
  const parentX = linked.x, parentY = linked.y;
  // 1:1 décomp : si le parent a bougé, relance l'anim depuis la frame 0 (si elle est finie).
  // animEnded est posé par le moteur d'anim (tickSpriteAnims) sur ANIMCMD_END ; StartSpriteAnim(0)
  // la rejoue → le sable se re-remue à chaque pas (le moteur pilote les frames, pas nous).
  if (parentX !== sprite.data[3] || parentY !== sprite.data[4]) {
    sprite.data[3] = parentX; sprite.data[4] = parentY;
    if (sprite.animEnded) rt.StartSpriteAnim(sprite.spriteId, 0);
  }
  // 1:1 : sprite->x/y = parent x/y ; subpriority = parent subpriority (même plan).
  sprite.x = parentX; sprite.y = parentY;
  sprite.coordOffsetEnabled = linked.coordOffsetEnabled;
  sprite.subpriority = linked.subpriority & 0xFF;
  // 1:1 : UpdateObjectEventSpriteInvisibility(sprite, FALSE).
  UpdateObjectEventSpriteInvisibility(rt, sprite, false);
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_Bubbles (field_effect_helpers.c:1258)
//  Colonne de bulles (16×32) quand un objet marche sur des algues (seaweed) en plongée.
//  Spawn aux coords MAP de l'objet (offset 8,0), priority 1, subpriority 82. One-shot :
//  anim 8 frames puis END → despawn sur animEnded OU offscreen.
//  ⚠️ BUG 1:1 RÉPLIQUÉ (Game Freak) : « Move up » mais le masque `sY &= (1<<8)` (256, pas 0xFF)
//  efface l'accumulateur chaque frame → sY>>8 = TOUJOURS 0 → les bulles NE MONTENT JAMAIS.
//  On réplique l'arithmétique exacte (cf. feedback-suis-la-decomp-pas-approximer).
//  Assets : bubbles.png (128×32 = 8 frames 16×32), palette general_0.pal.
//  Sprite data 1:1 : sY = data[0].
// ════════════════════════════════════════════════════════════════════════════

const BUBBLES_PNG = '/decomp/em/field_effects/bubbles.png';
const TAG_BUBBLES_GFX = 'FIELD_EFFECT_BUBBLES_GFX';
const BUBBLES_NUM_FRAMES = 8;
const BUBBLES_FRAME_W_TILES = 2;   // 16px
const BUBBLES_FRAME_H_TILES = 4;   // 32px
const BUBBLES_TILES_PER_FRAME = BUBBLES_FRAME_W_TILES * BUBBLES_FRAME_H_TILES;  // 8
const BUBBLES_PNG_W_TILES = 16;    // 128px

/** 1:1 décomp `sAnim_Bubbles` : 8 frames, durées 4,4,4,6,6,4,4,4, END. imageValue = frameIdx×8. */
const sAnims_Bubbles: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [
    ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(8, 4), ANIMCMD_FRAME(16, 4), ANIMCMD_FRAME(24, 6),
    ANIMCMD_FRAME(32, 6), ANIMCMD_FRAME(40, 4), ANIMCMD_FRAME(48, 4), ANIMCMD_FRAME(56, 4),
    ANIMCMD_END,
  ],
];

let _bubblesTileStart = -1;
let _bubblesPalSlot = -1;
let _bubblesInit = false;
let _bubblesInitPromise: Promise<void> | null = null;

/** PNG 128×32 = 16×4 tiles row-major → frame-major (frame F = cols 2F,2F+1 sur 4 rows = 8 tiles). */
function pngTo1dObjLayoutBubbles(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(BUBBLES_NUM_FRAMES * BUBBLES_TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < BUBBLES_NUM_FRAMES; f++) {
    for (let r = 0; r < BUBBLES_FRAME_H_TILES; r++) {
      for (let c = 0; c < BUBBLES_FRAME_W_TILES; c++) {
        const pngTileIdx = r * BUBBLES_PNG_W_TILES + (f * BUBBLES_FRAME_W_TILES + c);
        const objTileIdx = f * BUBBLES_TILES_PER_FRAME + r * BUBBLES_FRAME_W_TILES + c;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

/** Préchargement asset (concern plateforme). */
export function preloadBubblesEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _bubblesInit && IndexOfSpriteTileTag(TAG_BUBBLES_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_bubblesInitPromise && !_bubblesInit) return _bubblesInitPromise;
  _bubblesInit = false; _bubblesInitPromise = null;
  _bubblesInitPromise = (async () => {
    const png = await loadIndexedPngStrict(BUBBLES_PNG, 4);
    const reordered = pngTo1dObjLayoutBubbles(png.charData);
    _bubblesTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_BUBBLES_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_0_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _bubblesPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_0_PAL });
    _bubblesInit = true;
  })();
  return _bubblesInitPromise;
}

/** 1:1 décomp `FldEff_Bubbles` (field_effect_helpers.c:1258). Lit gFieldEffectArguments[0/1]
 *  = coords MAP de l'objet (GroundEffect_Seaweed → currentCoords). */
export function FldEff_Bubbles(rt: DecompRuntime): number {
  if (!_bubblesInit) return 64;
  // 1:1 : SetSpritePosToOffsetMapCoords(&args[0], &args[1], 8, 0) → coords MONDE.
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], 8, 0);
  const result = rt.CreateSpriteAtOam({
    tileId: _bubblesTileStart,
    paletteBank: _bubblesPalSlot,
    x: world.x, y: world.y,
    shape: 2, size: 2,  // 16×32 (tall)
    priority: 1,        // 1:1 : sprite->oam.priority = 1.
    paletteMode: 0, affineMode: 0,
    subpriority: 82,    // 1:1 : CreateSpriteAtEnd(..., 82).
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateBubblesFieldEffect;
  setFieldEffectAnims(sprite, sAnims_Bubbles, _bubblesTileStart);
  sprite.x = world.x; sprite.y = world.y;
  // 1:1 : sprite->coordOffsetEnabled = TRUE.
  sprite.coordOffsetEnabled = true;
  sprite.subpriority = 82 & 0xFF;
  sprite.data[0] = 0; // sY
  return 0;
}

/** 1:1 décomp `UpdateBubblesFieldEffect` (field_effect_helpers.c:1273). Callback per-frame. */
export function UpdateBubblesFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  // 1:1 BUG : sY += 128 ; sY &= 256 (→ toujours 0) ; y -= sY>>8 (→ toujours 0). Pas de montée.
  sprite.data[0] = (sprite.data[0] + ((1 << 8) / 2)) & (1 << 8);
  sprite.y -= sprite.data[0] >> 8;
  // 1:1 : UpdateObjectEventSpriteInvisibility(sprite, FALSE) (l'anim est tickée par le moteur).
  UpdateObjectEventSpriteInvisibility(rt, sprite, false);
  // 1:1 : if (sprite->invisible || sprite->animEnded) FieldEffectStop(sprite, FLDEFF_BUBBLES).
  if (sprite.invisible || sprite.animEnded) {
    FieldEffectStop(rt, sprite, FLDEFF_BUBBLES);
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  WaitFieldEffectSpriteAnim (field_effect_helpers.c:1654)
//  Callback GÉNÉRIQUE des field effects one-shot (ripple, unused grass/sand, etc.) :
//  laisse le moteur d'anim jouer la séquence ; despawn quand l'anim atteint ANIMCMD_END.
//  sWaitFldEff = data[0] (l'id passé à FieldEffectStop).
// ════════════════════════════════════════════════════════════════════════════
/** 1:1 décomp `WaitFieldEffectSpriteAnim` (field_effect_helpers.c:1654). */
export function WaitFieldEffectSpriteAnim(sprite: DecompSprite, rt: DecompRuntime): void {
  if (sprite.animEnded) {
    FieldEffectStop(rt, sprite, sprite.data[0]);
  } else {
    UpdateObjectEventSpriteInvisibility(rt, sprite, false);
  }
}

/** 1:1 décomp `UpdateJumpImpactEffect` (field_effect_helpers.c:1641). Callback partagé des
 *  effets d'impact de saut : anim une fois → despawn (animEnded) ; sinon visibilité + z-order
 *  par élévation. sJumpElevation=data[0], sJumpFldEff=data[1]. */
export function UpdateJumpImpactEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  if (sprite.animEnded) {
    FieldEffectStop(rt, sprite, sprite.data[1]);
  } else {
    UpdateObjectEventSpriteInvisibility(rt, sprite, false);
    SetObjectSubpriorityByElevation(rt, sprite.data[0], sprite, 0);
  }
}
