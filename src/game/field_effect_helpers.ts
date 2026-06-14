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
 *   ✅ FldEff_Ripple (+ WaitFieldEffectSpriteAnim générique one-shot).
 *   ✅ FldEff_HotSpringsWater + UpdateHotSpringsWaterFieldEffect.
 *   ✅ FldEff_SandPile + UpdateSandPileFieldEffect.
 *   ⏳ reste : reflets, grass, footprints, splash, bubbles, ash, surf blob,
 *      disguises, sparkle, shadow, jump dust, warp arrow, + effets morts.
 */

import type { DecompRuntime, DecompSprite } from '../engine/system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../engine/system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../engine/gba/png-loader';
import {
  gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap,
  TryGetObjectEventIdByLocalIdAndMap, GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
} from '../engine/field/object-events';
import { ANIMCMD_FRAME, ANIMCMD_END, type AnimCmd } from '../engine/system/sprite-animation';
import {
  gFieldEffectArguments, FieldEffectStop,
} from '../engine/field/field-effect';

// 1:1 décomp FLDEFF_* (include/constants/field_effects.h). Const LOCALES (≠ import) pour
// éviter le cycle ESM field-effect ↔ field_effect_helpers au top-level (pitfall TDZ connu :
// un import de FLDEFF_* utilisé hors corps de fonction casse l'init du module).
const FLDEFF_RIPPLE = 5;
const FLDEFF_HOT_SPRINGS_WATER = 42;
const FLDEFF_SAND_PILE = 39;

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
