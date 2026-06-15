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
 *   ✅ StartAshFieldEffect + FldEff_Ash + UpdateAshFieldEffect (machine 3 états + révèle tuile).
 *   ✅ FldEff_SandPile + UpdateSandPileFieldEffect.
 *   ✅ FldEff_Bubbles + UpdateBubblesFieldEffect (bug 1:1 répliqué).
 *   ✅ FldEff_BerryTreeGrowthSparkle + FldEff_Sparkle + UpdateSparkleFieldEffect.
 *   ✅ Show{Tree,Mountain,Sand}DisguiseFieldEffect + UpdateDisguiseFieldEffect + Start/UpdateRevealDisguise.
 *   ✅ CreateWarpArrowSprite + SetSpriteInvisible + ShowWarpArrowSprite (driver HideShowWarpArrow reste field-effect-arrow.ts).
 *   ✅ FldEff_TallGrass + UpdateTallGrassFieldEffect + FindTallGrassFieldEffectSpriteId (tuile-fixe + gCamera + despawn).
 *   ⏳ reste : reflets, shadow (stub à refaire, bloqué), long grass, footprints, surf blob,
 *      jump dust, + effets morts.
 */

import type { DecompRuntime, DecompSprite } from '../engine/system/decomp-runtime';
import { LoadSpriteSheet, LoadSpritePalette, IndexOfSpriteTileTag } from '../engine/system/sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../engine/gba/png-loader';
import {
  gObjectEvents, type ObjectEvent, GetObjectEventIdByLocalIdAndMap,
  TryGetObjectEventIdByLocalIdAndMap, GetObjectEventMainSpriteId, GetObjectEventGfxHeight,
  SetObjectSubpriorityByElevation, UpdateGrassFieldEffectSubpriority, ElevationToPriority,
  ELEVATION_DEFAULT,
} from '../engine/field/object-events';
import { MoveCoords } from '../engine/field/direction-coords';
import { ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, ANIMCMD_LOOP, type AnimCmd } from '../engine/system/sprite-animation';
import { SetSpritePosToOffsetMapCoords, SetSpritePosToMapCoords, GetCameraTopLeftCoords, CurrentMapDrawMetatileAt, gCamera } from '../engine/field/field-camera';
import { MapGridSetMetatileIdAt, MapGridGetMetatileBehaviorAt, MapGridGetElevationAt, MAP_OFFSET } from '../engine/field/map-loader';
import { MetatileBehavior_IsTallGrass, MetatileBehavior_IsLongGrass } from './metatile_behavior';
import { gSaveBlock1Ptr } from '../engine/save/save-block-state';
import { gPlayerAvatar } from '../engine/field/player-avatar';
import {
  gFieldEffectArguments, FieldEffectStop, FieldEffectStart,
} from '../engine/field/field-effect';
import { FieldEffectActiveListRemove } from '../engine/field/field-effect-active-list';

// 1:1 décomp FLDEFF_* (include/constants/field_effects.h). Const LOCALES (≠ import) pour
// éviter le cycle ESM field-effect ↔ field_effect_helpers au top-level (pitfall TDZ connu :
// un import de FLDEFF_* utilisé hors corps de fonction casse l'init du module).
const FLDEFF_ASH = 7;
const FLDEFF_SPLASH = 15;
const FLDEFF_FEET_IN_FLOWING_WATER = 34;
const FLDEFF_JUMP_TALL_GRASS = 12;
const FLDEFF_JUMP_BIG_SPLASH = 14;
const FLDEFF_JUMP_SMALL_SPLASH = 16;
const FLDEFF_JUMP_LONG_GRASS = 18;
const FLDEFF_DUST = 10;
const FLDEFF_SAND_FOOTPRINTS = 13;
const FLDEFF_DEEP_SAND_FOOTPRINTS = 24;
const FLDEFF_BIKE_TIRE_TRACKS = 35;
const FLDEFF_SHORT_GRASS = 41;
const FLDEFF_RIPPLE = 5;
const FLDEFF_HOT_SPRINGS_WATER = 42;
const FLDEFF_SAND_PILE = 39;
const FLDEFF_BUBBLES = 53;
const FLDEFF_BERRY_TREE_GROWTH_SPARKLE = 23;
const FLDEFF_SPARKLE = 54;
const FLDEFF_TREE_DISGUISE = 28;
const FLDEFF_MOUNTAIN_DISGUISE = 29;
const FLDEFF_SAND_DISGUISE = 36;
const FLDEFF_TALL_GRASS = 4;
const FLDEFF_LONG_GRASS = 17;
const FLDEFF_SURF_BLOB = 8;
// 1:1 enum field_effect_helpers.h : états de bobbing de la monture de surf.
const BOB_NONE = 0, BOB_JUST_MON = 2;
const LOCALID_PLAYER = 0xFF;
const MAX_SPRITES = 64;

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
//  Warp arrow (field_effect_helpers.c:175-208)
//  Flèche clignotante (16×16) affichée sur une tuile de warp directionnel (entrées de
//  grottes, escaliers). Sprite PERSISTANT (pas FieldEffectStart) : créé 1× au map load
//  (CreateWarpArrowSprite → objectEvent.warpArrowSpriteId), montré/caché chaque frame par
//  HideShowWarpArrow (field_player_avatar.c, reste hors miroir). Pas de callback (template
//  SpriteCallbackDummy) — le clignotement est joué par le MOTEUR via sAnimTable_Arrow
//  (StartSpriteAnim(direction-1), 2 frames @32 + JUMP(0) = boucle infinie). data[0/1]=sPrevX/Y.
//  Assets : arrow.png (128×16 = 8 frames 16×16). Palette : paletteTag=TAG_NONE → bank 0
//  (palette player, 1:1 — l'arrow fut authored sur ces indices).
// ════════════════════════════════════════════════════════════════════════════

const ARROW_PNG = '/decomp/em/field_effects/arrow.png';
const TAG_ARROW_GFX = 'FIELD_EFFECT_ARROW_GFX';
const ARROW_TILES_PER_FRAME = 4; // 16×16 = 2×2 tiles 4bpp
const ARROW_PALETTE_BANK = 0;    // 1:1 : paletteTag=TAG_NONE → bank 0 (palette player Brendan/May)

/** 1:1 décomp sAnimTable_Arrow (field_effect_objects.h:260) : [South, North, West, East].
 *  Chaque dir = 2 frames (off/on) @32 + JUMP(0) (clignotement infini). imageValue = frameIdx × 4. */
const sAnims_Arrow: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(12, 32), ANIMCMD_FRAME(28, 32), ANIMCMD_JUMP(0)], // South (frames 3,7)
  [ANIMCMD_FRAME(0, 32),  ANIMCMD_FRAME(16, 32), ANIMCMD_JUMP(0)], // North (frames 0,4)
  [ANIMCMD_FRAME(4, 32),  ANIMCMD_FRAME(20, 32), ANIMCMD_JUMP(0)], // West  (frames 1,5)
  [ANIMCMD_FRAME(8, 32),  ANIMCMD_FRAME(24, 32), ANIMCMD_JUMP(0)], // East  (frames 2,6)
];

let _arrowTileStart = -1;
let _arrowInit = false;
let _arrowInitPromise: Promise<void> | null = null;

/** PNG 128×16 = 16×2 tiles row-major → 1D OBJ frame-major (8 frames 16×16 = 2×2 tiles/frame :
 *  frame F = colonnes 2F,2F+1 sur 2 rows). */
function pngTo1dObjLayoutArrow(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32, PNG_W_TILES = 16, NUM_FRAMES = 8, FW = 2, FH = 2;
  const out = new Uint8Array(NUM_FRAMES * ARROW_TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < NUM_FRAMES; f++) {
    for (let r = 0; r < FH; r++) {
      for (let c = 0; c < FW; c++) {
        const pngTileIdx = r * PNG_W_TILES + (f * FW + c);
        const objTileIdx = f * ARROW_TILES_PER_FRAME + r * FW + c;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

/** Préchargement asset (concern plateforme) : sheet arrow (8 frames), pas de palette (bank 0). */
export function preloadWarpArrowEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _arrowInit && IndexOfSpriteTileTag(TAG_ARROW_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_arrowInitPromise && !_arrowInit) return _arrowInitPromise;
  _arrowInit = false; _arrowInitPromise = null;
  _arrowInitPromise = (async () => {
    const png = await loadIndexedPngStrict(ARROW_PNG, 4);
    const reordered = pngTo1dObjLayoutArrow(png.charData);
    _arrowTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_ARROW_GFX });
    _arrowInit = true;
  })();
  return _arrowInitPromise;
}

/** 1:1 décomp `CreateWarpArrowSprite` (field_effect_helpers.c:175). Crée 1 sprite 16×16 invisible
 *  (anims câblées → clignotement par le moteur). Retourne le spriteId (caller : warpArrowSpriteId),
 *  ou MAX_SPRITES si assets pas prêts. */
export function CreateWarpArrowSprite(rt: DecompRuntime): number {
  if (!_arrowInit) return MAX_SPRITES;
  // 1:1 : CreateSpriteAtEnd(template, 0, 0, 82).
  const result = rt.CreateSpriteAtOam({
    tileId: _arrowTileStart,
    paletteBank: ARROW_PALETTE_BANK,
    x: 0, y: 0,
    shape: 0, size: 1,  // 16×16
    priority: 1, paletteMode: 0, affineMode: 0,
    subpriority: 82 & 0xFF,
    fromEnd: true,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return MAX_SPRITES;
  // 1:1 : .anims = sAnimTable_Arrow, callback = SpriteCallbackDummy (pas de callback custom :
  // le moteur tique l'anim). oam.priority=1, coordOffsetEnabled=TRUE, invisible=TRUE.
  setFieldEffectAnims(sprite, sAnims_Arrow, _arrowTileStart);
  sprite.invisible = true;
  sprite.coordOffsetEnabled = true;
  sprite.subpriority = 82 & 0xFF;
  return result.spriteId;
}

/** 1:1 décomp `SetSpriteInvisible` (field_effect_helpers.c:188). */
export function SetSpriteInvisible(rt: DecompRuntime, spriteId: number): void {
  const sprite = rt.gSprites.get(spriteId);
  if (sprite) sprite.invisible = true;
}

/** 1:1 décomp `ShowWarpArrowSprite` (field_effect_helpers.c:193). mapX/mapY = INTERNAL.
 *  Re-positionne + montre + (re)lance l'anim de direction si la cible/visibilité a changé. */
export function ShowWarpArrowSprite(rt: DecompRuntime, spriteId: number, direction: number, x: number, y: number): void {
  const sprite = rt.gSprites.get(spriteId);
  if (!sprite) return;
  // 1:1 : if (invisible || sPrevX != x || sPrevY != y).
  if (sprite.invisible || sprite.data[0] !== x || sprite.data[1] !== y) {
    const pos = SetSpritePosToMapCoords(x, y);
    sprite.x = pos.x + 8;
    sprite.y = pos.y + 8;
    sprite.invisible = false;
    sprite.data[0] = x; // sPrevX
    sprite.data[1] = y; // sPrevY
    // 1:1 : StartSpriteAnim(sprite, direction - 1) → le moteur joue le clignotement de la dir.
    rt.StartSpriteAnim(spriteId, direction - 1);
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_TallGrass (field_effect_helpers.c:291)
//  Bruissement d'herbe haute (16×16) au passage d'un object event sur MB_TALL_GRASS.
//  Sprite TUILE-FIXE (≠ parent-follow) : reste sur la tuile (sX/sY), suit la caméra via
//  coordOffset. Anim 5 frames @10 jouée 1× (pas) ou figée à la fin (SeekSpriteAnim(4),
//  retour au field/spawn). Despawn quand : owner introuvable | tuile plus de l'herbe |
//  (owner a quitté la tuile && anim finie). Tracking de l'OWNER (player ou NPC) via
//  localId/map → un NPC laisse un rustle persistant 1:1.
//  Sprite data 1:1 : sElevation=data[0] sX=data[1] sY=data[2] data[3]=(sLocalId<<8)|sMapNum
//    sMapGroup=data[4] sCurrentMap=data[5] sObjectMoved=data[7].
//  Assets : tall_grass.png (80×16 = 5 frames 16×16), palette general_1.pal.
// ════════════════════════════════════════════════════════════════════════════

const TALL_GRASS_PNG = '/decomp/em/field_effects/tall_grass.png';
const TAG_TALL_GRASS_GFX = 'FIELD_EFFECT_TALL_GRASS_GFX';
const TALL_GRASS_TILES_PER_FRAME = 4; // 16×16

/** 1:1 décomp `sAnim_TallGrass` (field_effect_objects.h:79) : FRAME(1,10)(2,10)(3,10)(4,10)(0,10) END.
 *  imageValue = frameIdx × 4 → 4,8,12,16,0. SeekSpriteAnim(4) = dernière frame (0) figée. */
const sAnims_TallGrass: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(4, 10), ANIMCMD_FRAME(8, 10), ANIMCMD_FRAME(12, 10), ANIMCMD_FRAME(16, 10), ANIMCMD_FRAME(0, 10), ANIMCMD_END],
];

let _tallGrassTileStart = -1;
let _tallGrassPalSlot = -1;
let _tallGrassInit = false;
let _tallGrassInitPromise: Promise<void> | null = null;

/** Préchargement asset (concern plateforme). tall_grass.png = 80×16 = 10×2 tiles, 5 frames
 *  16×16 → même layout que ripple (10 de large) → réutilise pngTo1dObjLayoutRipple. */
export function preloadTallGrassEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _tallGrassInit && IndexOfSpriteTileTag(TAG_TALL_GRASS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_tallGrassInitPromise && !_tallGrassInit) return _tallGrassInitPromise;
  _tallGrassInit = false; _tallGrassInitPromise = null;
  _tallGrassInitPromise = (async () => {
    const png = await loadIndexedPngStrict(TALL_GRASS_PNG, 4);
    const reordered = pngTo1dObjLayoutRipple(png.charData); // 10-wide, 5 frames (identique à ripple)
    _tallGrassTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_TALL_GRASS_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _tallGrassPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    _tallGrassInit = true;
  })();
  return _tallGrassInitPromise;
}

/** 1:1 décomp `FldEff_TallGrass` (field_effect_helpers.c:291). args[0/1]=tuile INTERNAL,
 *  [2]=elevation, [3]=priority, [4]=(localId<<8)|mapNum, [5]=mapGroup, [6]=currentMap packé,
 *  [7]=skip-to-end (spawn statique vs rustle). */
export function FldEff_TallGrass(rt: DecompRuntime): number {
  if (!_tallGrassInit) return 64;
  // 1:1 : SetSpritePosToOffsetMapCoords(&x, &y, 8, 8) → coords MONDE (x/y = args[0/1] INTERNAL).
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _tallGrassTileStart,
    paletteBank: _tallGrassPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    priority: (gFieldEffectArguments[3] & 3) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
    subpriority: 0,     // 1:1 CreateSpriteAtEnd(..., 0)
    fromEnd: true,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateTallGrassFieldEffect;
  setFieldEffectAnims(sprite, sAnims_TallGrass, _tallGrassTileStart);
  sprite.x = world.x; sprite.y = world.y;
  sprite.coordOffsetEnabled = true; // 1:1 : sprite monde
  // 1:1 data : sElevation=args[2], sX=args[0], sY=args[1], data[3]=args[4] (localId<<8|mapNum),
  // sMapGroup=args[5], sCurrentMap=args[6].
  sprite.data[0] = gFieldEffectArguments[2];
  sprite.data[1] = gFieldEffectArguments[0];
  sprite.data[2] = gFieldEffectArguments[1];
  sprite.data[3] = gFieldEffectArguments[4];
  sprite.data[4] = gFieldEffectArguments[5];
  sprite.data[5] = gFieldEffectArguments[6];
  // 1:1 : if (args[7]) SeekSpriteAnim(sprite, 4) — saute à la dernière frame (overlay statique).
  if (gFieldEffectArguments[7]) rt.SeekSpriteAnim(result.spriteId, 4);
  return 0;
}

/** 1:1 décomp `UpdateTallGrassFieldEffect` (field_effect_helpers.c:316). Callback per-frame. */
export function UpdateTallGrassFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  let mapNum = (sprite.data[5] >> 8) & 0xFF;
  let mapGroup = sprite.data[5] & 0xFF;
  // 1:1 : transition de map connectée (gCamera.active) → décale la tuile + maj sCurrentMap.
  const loc = gSaveBlock1Ptr.location;
  if (gCamera.active && loc && (loc.mapNum !== mapNum || loc.mapGroup !== mapGroup)) {
    sprite.data[1] -= gCamera.x; // sX
    sprite.data[2] -= gCamera.y; // sY
    sprite.data[5] = ((loc.mapNum & 0xFF) << 8) | (loc.mapGroup & 0xFF);
  }
  const localId = (sprite.data[3] >> 8) & 0xFF; // sLocalId
  mapNum = sprite.data[3] & 0xFF;               // sMapNum
  mapGroup = sprite.data[4];                     // sMapGroup
  const metatileBehavior = MapGridGetMetatileBehaviorAt(sprite.data[1], sprite.data[2]);
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (notFound || !MetatileBehavior_IsTallGrass(metatileBehavior) || (sprite.data[7] && sprite.animEnded)) {
    FieldEffectStop(rt, sprite, FLDEFF_TALL_GRASS);
  } else {
    // 1:1 : l'objet a-t-il quitté la tuile ? (current ET previous coords != sX/sY).
    const objEvent: ObjectEvent = gObjectEvents[objectEventId];
    if ((objEvent.currentCoordsX !== sprite.data[1] || objEvent.currentCoordsY !== sprite.data[2])
     && (objEvent.previousCoordsX !== sprite.data[1] || objEvent.previousCoordsY !== sprite.data[2])) {
      sprite.data[7] = 1; // sObjectMoved
    }
    // 1:1 : subpriority bump pendant la 1re frame (animCmdIndex == 0 → offset 4).
    const subprioOffset = sprite.animCmdIndex === 0 ? 4 : 0;
    UpdateObjectEventSpriteInvisibility(rt, sprite, false);
    UpdateGrassFieldEffectSubpriority(rt, sprite, sprite.data[0], subprioOffset);
  }
}

/** 1:1 décomp `FindTallGrassFieldEffectSpriteId` (field_effect_helpers.c:376). Scanne gSprites
 *  pour le sprite tall grass à (x,y,localId,mapNum,mapGroup). Retourne le spriteId ou MAX_SPRITES. */
export function FindTallGrassFieldEffectSpriteId(rt: DecompRuntime, localId: number, mapNum: number, mapGroup: number, x: number, y: number): number {
  for (const s of rt.gSprites.values()) {
    if (!s.inUse) continue;
    if (s.callback === UpdateTallGrassFieldEffect
        && x === s.data[1] && y === s.data[2]
        && localId === ((s.data[3] >> 8) & 0xFF)
        && mapNum === (s.data[3] & 0xFF)
        && mapGroup === s.data[4]) {
      return s.spriteId;
    }
  }
  return MAX_SPRITES;
}

/** Adaptation (≠ décomp) : au RETOUR au field (sortie combat/menu), si le joueur (re)spawn sur
 *  une tuile d'herbe haute, déclenche l'overlay STATIQUE via le chemin 1:1 (GroundEffect_SpawnOn
 *  TallGrass = args + FieldEffectStart, args[7]=1). Notre spine OnSpawn ne fire pas sur le
 *  menu-return → ce hook évite le « joueur dans l'herbe sans overlay » post-combat. px/py LOGICAL. */
export function TrySpawnTallGrassOnReturnToField(rt: DecompRuntime, px: number, py: number): void {
  if (!_tallGrassInit) return;
  const internalX = px + MAP_OFFSET, internalY = py + MAP_OFFSET;
  if (!MetatileBehavior_IsTallGrass(MapGridGetMetatileBehaviorAt(internalX, internalY))) return;
  const npc = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!npc) return;
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = 2;
  gFieldEffectArguments[4] = (npc.localId << 8) | (npc.mapNum & 0xFF);
  gFieldEffectArguments[5] = npc.mapGroup;
  const loc = gSaveBlock1Ptr.location;
  gFieldEffectArguments[6] = loc ? (((loc.mapNum & 0xFF) << 8) | (loc.mapGroup & 0xFF)) : 0;
  gFieldEffectArguments[7] = 1;
  FieldEffectStart(FLDEFF_TALL_GRASS);
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_LongGrass (field_effect_helpers.c:395)
//  Herbe HAUTE 2× (long grass — Route 119/120). Jumeau de tall grass, fonction décomp
//  DISTINCTE : anim 7 cmds, priority = ElevationToPriority (≠ args[3] fixe), SeekSpriteAnim(6),
//  subprio offset TOUJOURS 0 (≠ tall grass : 4 si animCmdIndex==0), check MB_LONG_GRASS.
//  Sprite TUILE-FIXE + coordOffset (suit la caméra). Despawn quand : owner introuvable |
//  tuile plus long grass | (owner a quitté la tuile && anim finie).
//  Sprite data 1:1 : sElevation=data[0] sX=data[1] sY=data[2] data[3]=(sLocalId<<8)|sMapNum
//    sMapGroup=data[4] sCurrentMap=data[5] sObjectMoved=data[7].
//  Assets : long_grass.png (64×16 = 4 frames 16×16), palette general_1.pal.
// ════════════════════════════════════════════════════════════════════════════

const LONG_GRASS_PNG = '/decomp/em/field_effects/long_grass.png';
const TAG_LONG_GRASS_GFX = 'FIELD_EFFECT_LONG_GRASS_GFX';
const LONG_GRASS_NUM_FRAMES = 4;
const LONG_GRASS_TILES_PER_FRAME = 4; // 16×16

/** 1:1 décomp `sAnim_LongGrass` (field_effect_objects.h:620) : FRAME(1,3)(2,3)(0,4)(3,4)(0,4)(3,4)(0,4) END.
 *  imageValue = frameIdx × 4 → 4,8,0,12,0,12,0. SeekSpriteAnim(6) = cmd 6 (dernière frame 0) figée. */
const sAnims_LongGrass: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(4, 3), ANIMCMD_FRAME(8, 3), ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(12, 4),
   ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(12, 4), ANIMCMD_FRAME(0, 4), ANIMCMD_END],
];

let _longGrassTileStart = -1;
let _longGrassPalSlot = -1;
let _longGrassInit = false;
let _longGrassInitPromise: Promise<void> | null = null;

/** PNG 64×16 = 8×2 tiles row-major → frame-major (frame F = cols 2F,2F+1 sur 2 rows = 4 tiles). */
function pngTo1dObjLayoutLongGrass(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32, PNG_WIDTH_TILES = 8;
  const out = new Uint8Array(LONG_GRASS_NUM_FRAMES * LONG_GRASS_TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < LONG_GRASS_NUM_FRAMES; f++) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const pngTileIdx = row * PNG_WIDTH_TILES + (f * 2) + col;
        const objTileIdx = f * LONG_GRASS_TILES_PER_FRAME + row * 2 + col;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

/** Préchargement asset (concern plateforme). */
export function preloadLongGrassEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _longGrassInit && IndexOfSpriteTileTag(TAG_LONG_GRASS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_longGrassInitPromise && !_longGrassInit) return _longGrassInitPromise;
  _longGrassInit = false; _longGrassInitPromise = null;
  _longGrassInitPromise = (async () => {
    const png = await loadIndexedPngStrict(LONG_GRASS_PNG, 4);
    const reordered = pngTo1dObjLayoutLongGrass(png.charData);
    _longGrassTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_LONG_GRASS_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _longGrassPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    _longGrassInit = true;
  })();
  return _longGrassInitPromise;
}

/** 1:1 décomp `FldEff_LongGrass` (field_effect_helpers.c:395). args[0/1]=tuile INTERNAL, [2]=elevation,
 *  [4]=(localId<<8)|mapNum, [5]=mapGroup, [6]=currentMap, [7]=skip-to-end. */
export function FldEff_LongGrass(rt: DecompRuntime): number {
  if (!_longGrassInit) return 64;
  // 1:1 : SetSpritePosToOffsetMapCoords(&x, &y, 8, 8) → coords MONDE (x/y = args[0/1] INTERNAL).
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _longGrassTileStart,
    paletteBank: _longGrassPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    // 1:1 : sprite->oam.priority = ElevationToPriority(gFieldEffectArguments[2]) (≠ tall grass = args[3]).
    priority: Math.max(0, Math.min(3, ElevationToPriority(gFieldEffectArguments[2]))) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
    subpriority: 0,     // 1:1 CreateSpriteAtEnd(..., 0)
    fromEnd: true,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateLongGrassFieldEffect;
  setFieldEffectAnims(sprite, sAnims_LongGrass, _longGrassTileStart);
  sprite.x = world.x; sprite.y = world.y;
  sprite.coordOffsetEnabled = true; // 1:1 : sprite monde
  sprite.data[0] = gFieldEffectArguments[2]; // sElevation
  sprite.data[1] = gFieldEffectArguments[0]; // sX
  sprite.data[2] = gFieldEffectArguments[1]; // sY
  sprite.data[3] = gFieldEffectArguments[4]; // (sLocalId<<8)|sMapNum
  sprite.data[4] = gFieldEffectArguments[5]; // sMapGroup
  sprite.data[5] = gFieldEffectArguments[6]; // sCurrentMap
  // 1:1 : if (args[7]) SeekSpriteAnim(sprite, 6) — saute à la dernière frame (overlay statique).
  if (gFieldEffectArguments[7]) rt.SeekSpriteAnim(result.spriteId, 6);
  return 0;
}

/** 1:1 décomp `UpdateLongGrassFieldEffect` (field_effect_helpers.c:420). Callback per-frame. */
export function UpdateLongGrassFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  let mapNum = (sprite.data[5] >> 8) & 0xFF;
  let mapGroup = sprite.data[5] & 0xFF;
  // 1:1 : transition de map connectée (gCamera.active) → décale la tuile + maj sCurrentMap.
  const loc = gSaveBlock1Ptr.location;
  if (gCamera.active && loc && (loc.mapNum !== mapNum || loc.mapGroup !== mapGroup)) {
    sprite.data[1] -= gCamera.x; // sX
    sprite.data[2] -= gCamera.y; // sY
    sprite.data[5] = ((loc.mapNum & 0xFF) << 8) | (loc.mapGroup & 0xFF);
  }
  const localId = (sprite.data[3] >> 8) & 0xFF; // sLocalId
  mapNum = sprite.data[3] & 0xFF;               // sMapNum
  mapGroup = sprite.data[4];                     // sMapGroup
  const metatileBehavior = MapGridGetMetatileBehaviorAt(sprite.data[1], sprite.data[2]);
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (notFound || !MetatileBehavior_IsLongGrass(metatileBehavior) || (sprite.data[7] && sprite.animEnded)) {
    FieldEffectStop(rt, sprite, FLDEFF_LONG_GRASS);
  } else {
    // 1:1 : l'objet a-t-il quitté la tuile ? (current ET previous coords != sX/sY).
    const objEvent: ObjectEvent = gObjectEvents[objectEventId];
    if ((objEvent.currentCoordsX !== sprite.data[1] || objEvent.currentCoordsY !== sprite.data[2])
     && (objEvent.previousCoordsX !== sprite.data[1] || objEvent.previousCoordsY !== sprite.data[2])) {
      sprite.data[7] = 1; // sObjectMoved
    }
    // 1:1 : UpdateGrassFieldEffectSubpriority(sprite, sElevation, 0) — offset TOUJOURS 0 (≠ tall grass).
    UpdateObjectEventSpriteInvisibility(rt, sprite, false);
    UpdateGrassFieldEffectSubpriority(rt, sprite, sprite.data[0], 0);
  }
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
  // 1:1 décomp gFieldEffectObjectTemplate_GroundImpactDust (field_effect_objects.h) :
  // OAM 16×8 (shape 1/size 0), paletteTag GENERAL_0, sAnim_GroundImpactDust FRAME(0,8)(1,8)(2,8) END,
  // callback UpdateJumpImpactEffect. SetSpritePosToOffsetMapCoords(8,12). ground_impact_dust.png = 48×8.
  [FLDEFF_DUST]: {
    tag: 'FE_GROUND_IMPACT_DUST', png: `${FE_BASE}/ground_impact_dust.png`, pngWidthTiles: 6,
    frameWtiles: 2, frameHtiles: 1, shape: 1, size: 0,
    sheetFrames: [0, 1, 2], anim: [[0, 8], [1, 8], [2, 8]], pal: 'g0', dx: 8, dy: 12,
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
/** 1:1 décomp `FldEff_Dust` (field_effect_helpers.c:1180) — nuage de poussière d'atterrissage de
 *  saut (LAND_ON_NORMAL_GROUND). Même structure que les FldEff_Jump* (template GroundImpactDust,
 *  callback UpdateJumpImpactEffect) → config-driven via JUMP_CFG[FLDEFF_DUST]. */
export function FldEff_Dust(rt: DecompRuntime): number { return spawnJumpImpactEffect(rt, FLDEFF_DUST); }

// ════════════════════════════════════════════════════════════════════════════
//  Footprints / Tire tracks (field_effect_helpers.c:554-631) — empreintes laissées au
//  sol sur sable (FLDEFF_SAND_FOOTPRINTS/DEEP_SAND_FOOTPRINTS) ou en vélo (BIKE_TIRE_TRACKS),
//  via le spine DoTracksGroundEffect_*. Les 3 partagent UpdateFootprintsTireTracksFieldEffect
//  (machine fade 2 états : Step0 attend 40f, Step1 clignote invisible^=1 puis FieldEffectStop à 56f).
//  Sprite STATIQUE tuile-fixe : une seule frame, choisie + flippée par la DIRECTION (args[4] →
//  StartSpriteAnim) via le VRAI moteur d'anim (ANIMCMD_FRAME supporte hFlip/vFlip). coordOffset.
//  Sprite data 1:1 : sState=data[0], sTimer=data[1], sFldEff=data[7].
//  Assets : sand_footprints.png (2 frames 16×16) / deep_sand_footprints.png (2) / bike_tire_tracks.png (4).
//  Palette general_0.
// ════════════════════════════════════════════════════════════════════════════

interface FootprintsCfg {
  tag: string; png: string; pngWidthTiles: number;
  /** Anims indexées par direction/virage (= args[4]) : [frameIdx, hFlip, vFlip]. 1:1 sAnimTable_*. */
  anims: ReadonlyArray<readonly [number, boolean, boolean]>;
}
const T = true, F = false;
/** 1:1 sAnimTable_{Sand,DeepSand}Footprints / sAnimTable_BikeTireTracks (field_effect_objects.h:338-508).
 *  Ordre sand/deep = [S, S, N, W, E] ; bike = [S, S, N, W, E, SE, SW, NW, NE]. */
const FOOTPRINTS_CFG: Record<number, FootprintsCfg> = {
  [FLDEFF_SAND_FOOTPRINTS]: {
    tag: 'FE_SAND_FOOTPRINTS', png: `${FE_BASE}/sand_footprints.png`, pngWidthTiles: 4,
    anims: [[0, F, T], [0, F, T], [0, F, F], [1, F, F], [1, T, F]],
  },
  [FLDEFF_DEEP_SAND_FOOTPRINTS]: {
    tag: 'FE_DEEP_SAND_FOOTPRINTS', png: `${FE_BASE}/deep_sand_footprints.png`, pngWidthTiles: 4,
    anims: [[0, F, T], [0, F, T], [0, F, F], [1, F, F], [1, T, F]],
  },
  [FLDEFF_BIKE_TIRE_TRACKS]: {
    tag: 'FE_BIKE_TIRE_TRACKS', png: `${FE_BASE}/bike_tire_tracks.png`, pngWidthTiles: 8,
    anims: [[2, F, F], [2, F, F], [2, F, F], [1, F, F], [1, F, F], [0, F, F], [0, T, F], [3, T, F], [3, F, F]],
  },
};
const FOOTPRINTS_TILES_PER_FRAME = 4; // 16×16

/** Construit la table d'anim moteur : chaque direction = 1 frame statique (FRAME + END) avec flip.
 *  usingSheet → imageValue = frameIdx × tiles/frame. */
function buildFootprintAnims(cfg: FootprintsCfg): AnimCmd[][] {
  return cfg.anims.map(([frameIdx, hFlip, vFlip]) => [
    ANIMCMD_FRAME(frameIdx * FOOTPRINTS_TILES_PER_FRAME, 1, { hFlip, vFlip }),
    ANIMCMD_END,
  ]);
}
const _footprintAnims: Record<number, AnimCmd[][]> = {};
const _footprintTileStart = new Map<number, number>();
let _footprintPalSlot = -1;
let _footprintInit = false;
let _footprintInitPromise: Promise<void> | null = null;

/** Reorder PNG row-major → OBJ 1D frame-major (frame F 16×16 = cols 2F,2F+1 sur 2 rows). */
function reorderFootprintSheet(charData: Uint8Array, pngWidthTiles: number, frames: number): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(frames * FOOTPRINTS_TILES_PER_FRAME * TILE_BYTES);
  let dst = 0;
  for (let f = 0; f < frames; f++) {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const srcOff = (r * pngWidthTiles + (f * 2) + c) * TILE_BYTES;
        if (srcOff + TILE_BYTES <= charData.length) out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
        dst += TILE_BYTES;
      }
    }
  }
  return out;
}

/** Préchargement assets (3 sheets footprints + palette general_0). */
export function preloadFootprintsEffects(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _footprintInit && IndexOfSpriteTileTag(FOOTPRINTS_CFG[FLDEFF_SAND_FOOTPRINTS].tag) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_footprintInitPromise && !_footprintInit) return _footprintInitPromise;
  _footprintInit = false; _footprintInitPromise = null;
  _footprintInitPromise = (async () => {
    try { _footprintPalSlot = LoadSpritePalette({ data: await loadGbaPal(`${FE_BASE}/general_0.pal`), tag: TAG_GENERAL_0_PAL }); } catch { _footprintPalSlot = 0; }
    for (const key of Object.keys(FOOTPRINTS_CFG)) {
      const fldeff = Number(key);
      const cfg = FOOTPRINTS_CFG[fldeff];
      const png = await loadIndexedPngStrict(cfg.png, 4);
      const frames = (png.charData.length / 32 / FOOTPRINTS_TILES_PER_FRAME) | 0;
      const reordered = reorderFootprintSheet(png.charData, cfg.pngWidthTiles, frames);
      _footprintTileStart.set(fldeff, LoadSpriteSheet({ data: reordered, size: reordered.length, tag: cfg.tag }));
      _footprintAnims[fldeff] = buildFootprintAnims(cfg);
    }
    _footprintInit = true;
  })();
  return _footprintInitPromise;
}

/** Helper commun 1:1 `FldEff_{Sand,DeepSand}Footprints` / `FldEff_BikeTireTracks` (554/571/588).
 *  args[0/1]=previousCoords INTERNAL, [2]=subpriority, [3]=priority, [4]=anim (direction/virage). */
function spawnFootprintsEffect(rt: DecompRuntime, fldeff: number): number {
  if (!_footprintInit) return 64;
  const tileStart = _footprintTileStart.get(fldeff);
  if (tileStart === undefined) return 64;
  // 1:1 : SetSpritePosToOffsetMapCoords(&x, &y, 8, 8).
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: tileStart,
    paletteBank: _footprintPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    priority: (gFieldEffectArguments[3] & 3) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
    subpriority: gFieldEffectArguments[2] & 0xFF, // 1:1 CreateSpriteAtEnd(..., args[2])
    fromEnd: true,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateFootprintsTireTracksFieldEffect;
  setFieldEffectAnims(sprite, _footprintAnims[fldeff], tileStart);
  sprite.x = world.x; sprite.y = world.y;
  sprite.coordOffsetEnabled = true; // 1:1 : sprite monde
  sprite.subpriority = gFieldEffectArguments[2] & 0xFF;
  sprite.data[7] = fldeff; // sFldEff
  // 1:1 : StartSpriteAnim(sprite, gFieldEffectArguments[4]) → frame + flip de la direction.
  rt.StartSpriteAnim(result.spriteId, gFieldEffectArguments[4]);
  return 0;
}

/** 1:1 décomp `FldEff_SandFootprints` (field_effect_helpers.c:554). */
export function FldEff_SandFootprints(rt: DecompRuntime): number { return spawnFootprintsEffect(rt, FLDEFF_SAND_FOOTPRINTS); }
/** 1:1 décomp `FldEff_DeepSandFootprints` (field_effect_helpers.c:571). */
export function FldEff_DeepSandFootprints(rt: DecompRuntime): number { return spawnFootprintsEffect(rt, FLDEFF_DEEP_SAND_FOOTPRINTS); }
/** 1:1 décomp `FldEff_BikeTireTracks` (field_effect_helpers.c:588). */
export function FldEff_BikeTireTracks(rt: DecompRuntime): number { return spawnFootprintsEffect(rt, FLDEFF_BIKE_TIRE_TRACKS); }

/** 1:1 décomp `UpdateFootprintsTireTracksFieldEffect` (610) + `FadeFootprintsTireTracks_Step0/1`.
 *  sState=data[0], sTimer=data[1], sFldEff=data[7]. */
export function UpdateFootprintsTireTracksFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  if (sprite.data[0] === 0) {
    // FadeFootprintsTireTracks_Step0 : attend 40 frames avant le clignotement.
    if (++sprite.data[1] > 40) sprite.data[0] = 1;
    UpdateObjectEventSpriteInvisibility(rt, sprite, false);
  } else {
    // FadeFootprintsTireTracks_Step1 : clignote (invisible ^= 1) puis FieldEffectStop à 56.
    sprite.invisible = !sprite.invisible;
    sprite.data[1]++;
    UpdateObjectEventSpriteInvisibility(rt, sprite, sprite.invisible);
    if (sprite.data[1] > 56) FieldEffectStop(rt, sprite, sprite.data[7]);
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  FldEff_SurfBlob (field_effect_helpers.c:999) — la « monture » d'eau (32×32) sur laquelle
//  le joueur surfe. Suit le sprite joueur (x=player.x, y=player.y+8) + bobbing vertical (y2)
//  partagé joueur+monture, anim = direction du joueur (S/N/W/E hFlip). Les setters SetSurfBlob_*
//  (code de surf field_player_avatar.c, port futur) manipulent le bitfield data[0]. subpriority 150.
//  Sprite data 1:1 : sBitfield=data[0] sPlayerOffset=data[1] sPlayerObjId=data[2] sVelocity=data[3]
//    sTimer=data[4] sIntervalIdx=data[5] sPrevX=data[6] sPrevY=data[7].
//  ⚠️ Archi : joueur ÉCRAN-positionné → on copie sa position écran + matche son coordOffsetEnabled
//  (≠ décomp monde). Slot object-event joueur spriteId=-1 → GetObjectEventMainSpriteId.
//  Asset : surf_blob.png (96×32 = 3 frames 32×32). Palette embarquée (décomp oam.paletteNum=0).
// ════════════════════════════════════════════════════════════════════════════

const SURF_BLOB_PNG = '/decomp/em/field_effects/surf_blob.png';
const TAG_SURF_BLOB_GFX = 'FIELD_EFFECT_SURF_BLOB_GFX';
const TAG_SURF_BLOB_PAL = 'FIELD_EFFECT_SURF_BLOB_PAL';
const SURF_BLOB_NUM_FRAMES = 3;
const SURF_BLOB_TILES_PER_FRAME = 16; // 32×32 = 4×4 tiles
const SURF_BLOB_PNG_W_TILES = 12;     // 96px
const DIR_SOUTH_ = 1, DIR_EAST_ = 4;  // 1:1 DIR_* (direction-coords)

/** 1:1 `surfBlobDirectionAnims[]` (SynchronizeSurfAnim) : movementDirection → index sAnimTable_SurfBlob. */
const SURF_BLOB_DIRECTION_ANIMS = [0, 0, 1, 2, 3, 0, 0, 1, 1];
/** 1:1 sAnimTable_SurfBlob : 4 anims (S/N/W/E), chacune FRAME(frameIdx×16) + JUMP(0). E = frame 2 hFlip. */
const sAnims_SurfBlob: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0 * SURF_BLOB_TILES_PER_FRAME, 1), ANIMCMD_JUMP(0)],
  [ANIMCMD_FRAME(1 * SURF_BLOB_TILES_PER_FRAME, 1), ANIMCMD_JUMP(0)],
  [ANIMCMD_FRAME(2 * SURF_BLOB_TILES_PER_FRAME, 1), ANIMCMD_JUMP(0)],
  [ANIMCMD_FRAME(2 * SURF_BLOB_TILES_PER_FRAME, 1, { hFlip: true }), ANIMCMD_JUMP(0)],
];

let _surfBlobTileStart = -1;
let _surfBlobPalSlot = -1;
let _surfBlobInit = false;
let _surfBlobInitPromise: Promise<void> | null = null;

/** PNG 96×32 = 12×4 tiles row-major → frame-major (frame F 32×32 = cols 4F..4F+3, rows 0..3). */
function pngTo1dObjLayoutSurfBlob(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32;
  const out = new Uint8Array(SURF_BLOB_NUM_FRAMES * SURF_BLOB_TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < SURF_BLOB_NUM_FRAMES; f++) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const pngTileIdx = r * SURF_BLOB_PNG_W_TILES + (f * 4 + c);
        const objTileIdx = f * SURF_BLOB_TILES_PER_FRAME + r * 4 + c;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

export function preloadSurfBlobEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _surfBlobInit && IndexOfSpriteTileTag(TAG_SURF_BLOB_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_surfBlobInitPromise && !_surfBlobInit) return _surfBlobInitPromise;
  _surfBlobInit = false; _surfBlobInitPromise = null;
  _surfBlobInitPromise = (async () => {
    const png = await loadIndexedPngStrict(SURF_BLOB_PNG, 4);
    const reordered = pngTo1dObjLayoutSurfBlob(png.charData);
    _surfBlobTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SURF_BLOB_GFX });
    // Adaptation : palette embarquée du PNG dans un slot dédié (décomp oam.paletteNum=0 partagé).
    _surfBlobPalSlot = LoadSpritePalette({ data: png.palette as Uint16Array, tag: TAG_SURF_BLOB_PAL });
    _surfBlobInit = true;
  })();
  return _surfBlobInitPromise;
}

/** 1:1 décomp `FldEff_SurfBlob` (field_effect_helpers.c:999). args[0/1]=x/y INTERNAL, [2]=playerObjId.
 *  Retourne le spriteId du blob (le code de surf l'utilise pour SetSurfBlob_*). */
export function FldEff_SurfBlob(rt: DecompRuntime): number {
  if (!_surfBlobInit) return 64; // MAX_SPRITES
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _surfBlobTileStart,
    paletteBank: _surfBlobPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 2,  // 32×32
    priority: 2, paletteMode: 0, affineMode: 0,
    subpriority: 150 & 0xFF, // 1:1 CreateSpriteAtEnd(..., 150)
    fromEnd: true,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateSurfBlobFieldEffect;
  setFieldEffectAnims(sprite, sAnims_SurfBlob, _surfBlobTileStart);
  sprite.x = world.x; sprite.y = world.y;
  sprite.coordOffsetEnabled = true; // 1:1 (snappé sur le joueur dès le 1er bobbing)
  sprite.subpriority = 150 & 0xFF;
  // 1:1 data : sPlayerObjId=args[2], sVelocity=-1, sPrevX=-1, sPrevY=-1 (bitfield/timer/intervalIdx=0).
  sprite.data[2] = gFieldEffectArguments[2];
  sprite.data[3] = -1; // sVelocity
  sprite.data[6] = -1; // sPrevX
  sprite.data[7] = -1; // sPrevY
  // 1:1 décomp : FieldEffectActiveListRemove(FLDEFF_SURF_BLOB).
  FieldEffectActiveListRemove(FLDEFF_SURF_BLOB);
  return result.spriteId;
}

// ── Setters 1:1 décomp : manipulent le bitfield data[0] / sPlayerOffset data[1] sur gSprites[spriteId]. ──
export function SetSurfBlob_BobState(rt: DecompRuntime, spriteId: number, state: number): void {
  const s = rt.gSprites.get(spriteId); if (s) s.data[0] = (s.data[0] & ~0xF) | (state & 0xF);
}
export function SetSurfBlob_DontSyncAnim(rt: DecompRuntime, spriteId: number, dontSync: boolean): void {
  const s = rt.gSprites.get(spriteId); if (s) s.data[0] = (s.data[0] & ~0xF0) | (((dontSync ? 1 : 0) & 0xF) << 4);
}
export function SetSurfBlob_PlayerOffset(rt: DecompRuntime, spriteId: number, hasOffset: boolean, offset: number): void {
  const s = rt.gSprites.get(spriteId); if (!s) return;
  s.data[0] = (s.data[0] & ~0xF00) | (((hasOffset ? 1 : 0) & 0xF) << 8);
  s.data[1] = offset; // sPlayerOffset
}

/** 1:1 décomp `UpdateSurfBlobFieldEffect` (1052) = SynchronizeSurfAnim + SynchronizeSurfPosition
 *  + UpdateBobbingEffect + oam.priority = playerSprite priority. Callback per-frame. */
export function UpdateSurfBlobFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  const playerObj = gObjectEvents[sprite.data[2]]; // sPlayerObjId
  if (!playerObj) return;
  const playerSpriteId = GetObjectEventMainSpriteId(playerObj);
  const playerSprite = playerSpriteId >= 0 ? rt.gSprites.get(playerSpriteId) : undefined;
  if (!playerSprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];
  const pOam = rt.gba.oam[playerSprite.oamIndex];

  // ── SynchronizeSurfAnim : StartSpriteAnimIfDifferent(sprite, dirAnim[movementDirection]). ──
  // (GetSurfBlob_DontSyncAnim = bitfield 0xF0 ; « Never TRUE » en pratique.)
  if (((sprite.data[0] & 0xF0) >> 4) === 0) {
    const animIdx = SURF_BLOB_DIRECTION_ANIMS[playerObj.movementDirection] ?? 0;
    if (sprite.animNum !== animIdx) rt.StartSpriteAnim(sprite.spriteId, animIdx);
  }

  // ── SynchronizeSurfPosition : détecte le déplacement + le démontage (élévation). ──
  const x = playerObj.currentCoordsX, y = playerObj.currentCoordsY;
  if (sprite.y2 === 0 && (x !== sprite.data[6] || y !== sprite.data[7])) {
    sprite.data[5] = 0; // sIntervalIdx
    sprite.data[6] = x; sprite.data[7] = y;
    for (let i = DIR_SOUTH_; i <= DIR_EAST_; i++) {
      const m = MoveCoords(i, sprite.data[6], sprite.data[7]);
      if (MapGridGetElevationAt(m.x, m.y) === ELEVATION_DEFAULT) {
        // En train de descendre de la monture → bobbing plus lent (intervalIdx=1).
        sprite.data[5]++;
        break;
      }
    }
  }

  // ── UpdateBobbingEffect : bobbing vertical (y2) + sync joueur. ──
  const intervals = [0x3, 0x7];
  const bobState = sprite.data[0] & 0xF; // GetSurfBlob_BobState
  if (bobState !== BOB_NONE) {
    sprite.data[4] = (sprite.data[4] + 1) & 0xFFFF; // ++sTimer
    if ((sprite.data[4] & intervals[sprite.data[5]]) === 0) sprite.y2 += sprite.data[3]; // += sVelocity
    if ((sprite.data[4] & 15) === 0) sprite.data[3] = -sprite.data[3]; // reverse velocity
    if (bobState !== BOB_JUST_MON) {
      const hasOffset = (sprite.data[0] & 0xF00) >> 8;
      playerSprite.y2 = hasOffset ? (sprite.data[1] + sprite.y2) : sprite.y2;
      sprite.x = playerSprite.x; sprite.y = playerSprite.y + 8;
      sprite.coordOffsetEnabled = playerSprite.coordOffsetEnabled; // archi : matcher le joueur écran.
    }
  }
  // 1:1 : sprite->oam.priority = playerSprite->oam.priority.
  if (oam && pOam) oam.priority = pOam.priority;
}

/** 1:1 décomp `StartUnderwaterSurfBlobBobbing` (1157) : un sprite dummy invisible qui fait bober
 *  le blob underwater (Dive). data : sSpriteId=data[0], sBobY=data[1], sTimer=data[2]. */
export function StartUnderwaterSurfBlobBobbing(rt: DecompRuntime, blobSpriteId: number): number {
  const result = rt.CreateSpriteAtOam({
    tileId: 0, paletteBank: 0, x: 0, y: 0, shape: 0, size: 0,
    priority: 1, paletteMode: 0, affineMode: 0, fromEnd: true,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return result.spriteId;
  sprite.callback = SpriteCB_UnderwaterSurfBlob;
  sprite.invisible = true;
  sprite.data[0] = blobSpriteId; // sSpriteId
  sprite.data[1] = 1;            // sBobY
  return result.spriteId;
}

/** 1:1 décomp `SpriteCB_UnderwaterSurfBlob` (1170). Callback per-frame du sprite dummy. */
export function SpriteCB_UnderwaterSurfBlob(sprite: DecompSprite, rt: DecompRuntime): void {
  const blob = rt.gSprites.get(sprite.data[0]); // sSpriteId
  if (!blob) return;
  if (((sprite.data[2]++) & 3) === 0) blob.y2 += sprite.data[1]; // ++sTimer & 3, += sBobY
  if ((sprite.data[2] & 15) === 0) sprite.data[1] = -sprite.data[1]; // reverse sBobY
}

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
//  StartAshFieldEffect (915) + FldEff_Ash (926) + UpdateAshFieldEffect (953)
//  Nuage de cendre (16×16) sur l'herbe à cendre (Route 113/Fallarbor) : RÉVÈLE la tuile
//  (remplace ashgrass par l'herbe normale). Machine à 3 états (gAshFieldEffectFuncs) :
//   - Wait : invisible + anim en pause, décrémente sDelay → Show quand 0.
//   - Show : visible, anim repart ; MapGridSetMetatileIdAt + CurrentMapDrawMetatileAt + pose
//     triggerGroundEffectsOnMove sur le joueur ; → End.
//   - End  : UpdateObjectEventSpriteInvisibility ; despawn sur animEnded.
//  Assets : ash.png (80×16 = 5 frames 16×16, layout ripple), palette general_1.pal.
//  Sprite data 1:1 : sState=data[0] sX=data[1] sY=data[2] sMetatileId=data[3] sDelay=data[4].
// ════════════════════════════════════════════════════════════════════════════

const ASH_PNG = '/decomp/em/field_effects/ash.png';
const TAG_ASH_GFX = 'FIELD_EFFECT_ASH_GFX';
const ASH_TILES_PER_FRAME = 4;  // 16×16
const ASH_STATE_WAIT = 0, ASH_STATE_SHOW = 1;

/** 1:1 décomp `sAnim_Ash` : 5 frames durées 12,12,8,12,12, END. imageValue = frameIdx×4. */
const sAnims_Ash: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 12), ANIMCMD_FRAME(4, 12), ANIMCMD_FRAME(8, 8), ANIMCMD_FRAME(12, 12), ANIMCMD_FRAME(16, 12), ANIMCMD_END],
];

let _ashTileStart = -1;
let _ashPalSlot = -1;
let _ashInit = false;
let _ashInitPromise: Promise<void> | null = null;

/** Préchargement asset (concern plateforme). */
export function preloadAshEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _ashInit && IndexOfSpriteTileTag(TAG_ASH_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_ashInitPromise && !_ashInit) return _ashInitPromise;
  _ashInit = false; _ashInitPromise = null;
  _ashInitPromise = (async () => {
    // ash.png = 80×16 = 5 frames 16×16, même layout que ripple → réutilise le reorder.
    const png = await loadIndexedPngStrict(ASH_PNG, 4);
    const reordered = pngTo1dObjLayoutRipple(png.charData);
    _ashTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_ASH_GFX });
    let palette: Uint16Array;
    try { palette = await loadGbaPal(GENERAL_1_PAL); }
    catch { palette = png.palette as Uint16Array; }
    _ashPalSlot = LoadSpritePalette({ data: palette, tag: TAG_GENERAL_1_PAL });
    _ashInit = true;
  })();
  return _ashInitPromise;
}

/** 1:1 décomp `StartAshFieldEffect(x, y, metatileId, delay)` (field_effect_helpers.c:915). Entrée
 *  appelée par field_tasks.c (pas sur ashgrass) — pose les args + FieldEffectStart(FLDEFF_ASH). */
export function StartAshFieldEffect(x: number, y: number, metatileId: number, delay: number): void {
  gFieldEffectArguments[0] = x;
  gFieldEffectArguments[1] = y;
  gFieldEffectArguments[2] = 82; // subpriority
  gFieldEffectArguments[3] = 1;  // priority
  gFieldEffectArguments[4] = metatileId;
  gFieldEffectArguments[5] = delay;
  FieldEffectStart(FLDEFF_ASH);
}

/** 1:1 décomp `FldEff_Ash` (field_effect_helpers.c:926). args[0/1]=x/y map, [2]=subprio,
 *  [3]=priority, [4]=metatileId, [5]=delay. */
export function FldEff_Ash(rt: DecompRuntime): number {
  if (!_ashInit) return 64;
  const x = gFieldEffectArguments[0], y = gFieldEffectArguments[1];
  // 1:1 : SetSpritePosToOffsetMapCoords(&x, &y, 8, 8) → coords MONDE.
  const world = SetSpritePosToOffsetMapCoords(x, y, 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _ashTileStart,
    paletteBank: _ashPalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    priority: (gFieldEffectArguments[3] & 3) as 0 | 1 | 2 | 3,
    paletteMode: 0, affineMode: 0,
    subpriority: gFieldEffectArguments[2] & 0xFF,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 64;
  sprite.callback = UpdateAshFieldEffect;
  setFieldEffectAnims(sprite, sAnims_Ash, _ashTileStart);
  sprite.x = world.x; sprite.y = world.y;
  sprite.coordOffsetEnabled = true;
  sprite.subpriority = gFieldEffectArguments[2] & 0xFF;
  // État Wait : commence invisible + anim en pause (le moteur ne tique pas tant qu'animPaused).
  sprite.invisible = true;
  sprite.animPaused = true;
  sprite.data[0] = ASH_STATE_WAIT;
  sprite.data[1] = gFieldEffectArguments[0]; // sX (coords map)
  sprite.data[2] = gFieldEffectArguments[1]; // sY
  sprite.data[3] = gFieldEffectArguments[4]; // sMetatileId
  sprite.data[4] = gFieldEffectArguments[5]; // sDelay
  return 0;
}

/** 1:1 décomp `UpdateAshFieldEffect` (field_effect_helpers.c:953) = gAshFieldEffectFuncs[sState].
 *  L'anim est pilotée par le moteur (respecte animPaused) ; le callback ne fait que la machine. */
export function UpdateAshFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  if (sprite.data[0] === ASH_STATE_WAIT) {
    // 1:1 UpdateAshFieldEffect_Wait : invisible + animPaused, décrémente sDelay.
    sprite.invisible = true;
    sprite.animPaused = true;
    sprite.data[4] -= 1;
    if (sprite.data[4] === 0) sprite.data[0] = ASH_STATE_SHOW;
  } else if (sprite.data[0] === ASH_STATE_SHOW) {
    // 1:1 UpdateAshFieldEffect_Show : visible, anim repart, révèle la tuile, trigger joueur.
    sprite.invisible = false;
    sprite.animPaused = false;
    MapGridSetMetatileIdAt(sprite.data[1], sprite.data[2], sprite.data[3]);
    const cam = GetCameraTopLeftCoords();
    CurrentMapDrawMetatileAt(cam.x, cam.y, sprite.data[1], sprite.data[2]);
    const player = gObjectEvents[gPlayerAvatar.objectEventId];
    if (player) player.triggerGroundEffectsOnMove = true;
    sprite.data[0] = 2; // ASH_STATE_END
  } else {
    // 1:1 UpdateAshFieldEffect_End : invis offscreen ; despawn quand l'anim finit.
    UpdateObjectEventSpriteInvisibility(rt, sprite, false);
    if (sprite.animEnded) FieldEffectStop(rt, sprite, FLDEFF_ASH);
  }
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
//  FldEff_BerryTreeGrowthSparkle (field_effect_helpers.c:1288)
//  Étoile scintillante (16×16) spawnée au-dessus d'un arbre à baies qui change de stade
//  de croissance. One-shot : despawn quand l'anim se termine (template.callback =
//  WaitFieldEffectSpriteAnim). args[0/1]=coords map INTERNAL, [2]=subpriority, [3]=oam.priority.
//
//  FldEff_Sparkle (1417) + UpdateSparkleFieldEffect (1433)
//  Étincelle générique (16×16, FLDEFFOBJ_SMALL_SPARKLE) d'objet/script. args[0/1]=coords map
//  LOGICAL (+MAP_OFFSET ajouté ici, 1:1), [2]=oam.priority ; subpriority fixe 82. Update :
//  anim jouée par le moteur → à animEnded, invisible + sFinished++ ; puis sEndTimer>34 →
//  FieldEffectStop. sFinished=data[0], sEndTimer=data[1].
//
//  Assets : sparkle.png (96×16 = 6 frames 16×16), small_sparkle.png (32×16 = 2 frames 16×16).
//  Palette : décomp Sparkle pose oam.paletteNum=5 (slot OW préchargé, template paletteTag=TAG_NONE)
//  → adaptation plateforme : on charge la palette EMBARQUÉE du PNG (vérifiée 1:1, == dirt/berry),
//  même choix que splash/ripple qui chargent general_*.pal explicitement. SmallSparkle =
//  small_sparkle.pal (FLDEFF_PAL_TAG_SMALL_SPARKLE, 1:1 template).
// ════════════════════════════════════════════════════════════════════════════

const SPARKLE_PNG = '/decomp/em/field_effects/sparkle.png';
const TAG_SPARKLE_GFX = 'FIELD_EFFECT_SPARKLE_GFX';
const TAG_SPARKLE_PAL = 'FLDEFF_PAL_TAG_SPARKLE';
const SPARKLE_TILES_PER_FRAME = 4; // 16×16 = 2×2 tiles 4bpp

/** 1:1 décomp `sAnim_Sparkle` (field_effect_objects.h:902) : bloc A (6 frames @8) + LOOP(0)
 *  (bloc joué 1×) + bloc B (6 frames @4) + LOOP(3) (bloc joué 4×) + bloc C (6 frames @8) + END.
 *  imageValue = frameIdx × 4 (tilesParFrame, mode usingSheet). 192 ticks au total. */
const sAnims_Sparkle: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [
    ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(4, 8), ANIMCMD_FRAME(8, 8), ANIMCMD_FRAME(12, 8), ANIMCMD_FRAME(16, 8), ANIMCMD_FRAME(20, 8),
    ANIMCMD_LOOP(0),
    ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(4, 4), ANIMCMD_FRAME(8, 4), ANIMCMD_FRAME(12, 4), ANIMCMD_FRAME(16, 4), ANIMCMD_FRAME(20, 4),
    ANIMCMD_LOOP(3),
    ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(4, 8), ANIMCMD_FRAME(8, 8), ANIMCMD_FRAME(12, 8), ANIMCMD_FRAME(16, 8), ANIMCMD_FRAME(20, 8),
    ANIMCMD_END,
  ],
];

const SMALL_SPARKLE_PNG = '/decomp/em/field_effects/small_sparkle.png';
const SMALL_SPARKLE_PAL = '/decomp/em/field_effects/small_sparkle.pal';
const TAG_SMALL_SPARKLE_GFX = 'FIELD_EFFECT_SMALL_SPARKLE_GFX';
const TAG_SMALL_SPARKLE_PAL = 'FLDEFF_PAL_TAG_SMALL_SPARKLE';

/** 1:1 décomp `sAnim_SmallSparkle` (field_effect_objects.h:1241) : FRAME(0,3)(1,5)(0,5) END.
 *  imageValue = frameIdx × 4 → 0, 4, 0. */
const sAnims_SmallSparkle: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 3), ANIMCMD_FRAME(4, 5), ANIMCMD_FRAME(0, 5), ANIMCMD_END],
];

let _sparkleTileStart = -1;
let _sparklePalSlot = -1;
let _sparkleInit = false;
let _sparkleInitPromise: Promise<void> | null = null;
let _smallSparkleTileStart = -1;
let _smallSparklePalSlot = -1;

/** sparkle.png = 96×16 = 12×2 tiles row-major → 1D OBJ frame-major (6 frames 16×16, 4 tiles/frame :
 *  row0 2F,2F+1 ; row1 12+2F,12+2F+1). Même schéma que pngTo1dObjLayoutRipple, sheet 12 de large. */
function pngTo1dObjLayoutSparkle(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32, SHEET_TILE_W = 12, NUM_FRAMES = 6;
  const out = new Uint8Array(NUM_FRAMES * SPARKLE_TILES_PER_FRAME * TILE_BYTES);
  let dst = 0;
  for (let f = 0; f < NUM_FRAMES; f++) {
    const colStart = f * 2;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const srcOff = (r * SHEET_TILE_W + colStart + c) * TILE_BYTES;
      if (srcOff + TILE_BYTES <= charData.length) out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
      dst += TILE_BYTES;
    }
  }
  return out;
}

/** small_sparkle.png = 32×16 = 4×2 tiles row-major → 1D OBJ frame-major (2 frames 16×16). */
function pngTo1dObjLayoutSmallSparkle(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32, SHEET_TILE_W = 4, NUM_FRAMES = 2;
  const out = new Uint8Array(NUM_FRAMES * SPARKLE_TILES_PER_FRAME * TILE_BYTES);
  let dst = 0;
  for (let f = 0; f < NUM_FRAMES; f++) {
    const colStart = f * 2;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const srcOff = (r * SHEET_TILE_W + colStart + c) * TILE_BYTES;
      if (srcOff + TILE_BYTES <= charData.length) out.set(charData.subarray(srcOff, srcOff + TILE_BYTES), dst);
      dst += TILE_BYTES;
    }
  }
  return out;
}

/** Préchargement assets (concern plateforme) : sparkle + small sparkle (gfx + palettes). */
export function preloadSparkleEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _sparkleInit && IndexOfSpriteTileTag(TAG_SPARKLE_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_sparkleInitPromise && !_sparkleInit) return _sparkleInitPromise;
  _sparkleInit = false; _sparkleInitPromise = null;
  _sparkleInitPromise = (async () => {
    const png = await loadIndexedPngStrict(SPARKLE_PNG, 4);
    const reordered = pngTo1dObjLayoutSparkle(png.charData);
    _sparkleTileStart = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: TAG_SPARKLE_GFX });
    _sparklePalSlot = LoadSpritePalette({ data: png.palette, tag: TAG_SPARKLE_PAL });
    const smallPng = await loadIndexedPngStrict(SMALL_SPARKLE_PNG, 4);
    const smallReordered = pngTo1dObjLayoutSmallSparkle(smallPng.charData);
    _smallSparkleTileStart = LoadSpriteSheet({ data: smallReordered, size: smallReordered.length, tag: TAG_SMALL_SPARKLE_GFX });
    let smallPal: Uint16Array;
    try { smallPal = await loadGbaPal(SMALL_SPARKLE_PAL); }
    catch { smallPal = smallPng.palette as Uint16Array; }
    _smallSparklePalSlot = LoadSpritePalette({ data: smallPal, tag: TAG_SMALL_SPARKLE_PAL });
    _sparkleInit = true;
  })();
  return _sparkleInitPromise;
}

/** 1:1 décomp `FldEff_BerryTreeGrowthSparkle` (field_effect_helpers.c:1288). */
export function FldEff_BerryTreeGrowthSparkle(rt: DecompRuntime): number {
  if (!_sparkleInit) return 0;
  // 1:1 : SetSpritePosToOffsetMapCoords(&args[0], &args[1], 8, 4) → coords MONDE.
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], 8, 4);
  const result = rt.CreateSpriteAtOam({
    tileId: _sparkleTileStart,
    paletteBank: _sparklePalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    priority: (gFieldEffectArguments[3] & 3) as 0 | 1 | 2 | 3, // 1:1 sprite->oam.priority = args[3]
    paletteMode: 0, affineMode: 0,
    subpriority: gFieldEffectArguments[2] & 0xFF,
    fromEnd: true,      // 1:1 CreateSpriteAtEnd
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 0;
  // 1:1 : template.callback = WaitFieldEffectSpriteAnim ; .anims = sAnimTable_Sparkle.
  sprite.callback = WaitFieldEffectSpriteAnim;
  setFieldEffectAnims(sprite, sAnims_Sparkle, _sparkleTileStart);
  sprite.x = world.x; sprite.y = world.y;
  // 1:1 : sprite->coordOffsetEnabled = TRUE (sprite MONDE → suit la caméra via gSpriteCoordOffset).
  sprite.coordOffsetEnabled = true;
  sprite.subpriority = gFieldEffectArguments[2] & 0xFF;
  // 1:1 : sprite->sWaitFldEff = FLDEFF_BERRY_TREE_GROWTH_SPARKLE (data[0], l'id passé à FieldEffectStop).
  sprite.data[0] = FLDEFF_BERRY_TREE_GROWTH_SPARKLE;
  return 0;
}

/** 1:1 décomp `FldEff_Sparkle` (field_effect_helpers.c:1417). args[0/1] = coords map LOGICAL. */
export function FldEff_Sparkle(rt: DecompRuntime): number {
  if (!_sparkleInit) return 0;
  // 1:1 : args[0] += MAP_OFFSET ; args[1] += MAP_OFFSET ; SetSpritePosToOffsetMapCoords(&,&,8,8).
  gFieldEffectArguments[0] += MAP_OFFSET;
  gFieldEffectArguments[1] += MAP_OFFSET;
  const world = SetSpritePosToOffsetMapCoords(gFieldEffectArguments[0], gFieldEffectArguments[1], 8, 8);
  const result = rt.CreateSpriteAtOam({
    tileId: _smallSparkleTileStart,
    paletteBank: _smallSparklePalSlot,
    x: world.x, y: world.y,
    shape: 0, size: 1,  // 16×16
    priority: (gFieldEffectArguments[2] & 3) as 0 | 1 | 2 | 3, // 1:1 oam.priority = args[2]
    paletteMode: 0, affineMode: 0,
    subpriority: 82 & 0xFF,  // 1:1 CreateSpriteAtEnd(..., 82)
    fromEnd: true,
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return 0;
  // 1:1 : template.callback = UpdateSparkleFieldEffect ; .anims = sAnimTable_SmallSparkle.
  sprite.callback = UpdateSparkleFieldEffect;
  setFieldEffectAnims(sprite, sAnims_SmallSparkle, _smallSparkleTileStart);
  sprite.x = world.x; sprite.y = world.y;
  // 1:1 : sprite->coordOffsetEnabled = TRUE.
  sprite.coordOffsetEnabled = true;
  sprite.subpriority = 82 & 0xFF;
  return 0;
}

/** 1:1 décomp `UpdateSparkleFieldEffect` (field_effect_helpers.c:1433). sFinished=data[0],
 *  sEndTimer=data[1]. L'anim est jouée par le moteur : à animEnded → invisible + sFinished++ ;
 *  puis sFinished && ++sEndTimer > 34 → FieldEffectStop. */
export function UpdateSparkleFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  if (!sprite.data[0]) {
    if (sprite.animEnded) {
      sprite.invisible = true;
      sprite.data[0] += 1;
    }
  }
  if (sprite.data[0] && ++sprite.data[1] > 34) {
    FieldEffectStop(rt, sprite, FLDEFF_SPARKLE);
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  Disguises tree/mountain/sand (field_effect_helpers.c:1313-1404)
//  (ordre décomp : entre FldEff_BerryTreeGrowthSparkle (1288) et FldEff_Sparkle (1417) ;
//   placé ici après la section sparkle car berry+générique sont regroupés.)
//
//  Sprite arbre/rocher/monticule (16×32) qui RECOUVRE un object event (bases secrètes) et
//  le suit (x=parent.x, y=(height>>1)+parent.y-16, subpriority=parent-1, invisible=parent).
//  Machine d'état (sState=data[0]) : 0 = statique (anim 0) ; StartRevealDisguise pose sState=1 ;
//  UpdateDisguiseFieldEffect : 1→2 + StartSpriteAnim(1) (révélation 7 frames) ; 2 + animEnded →
//  sReadyToEnd ; UpdateRevealDisguise voit sReadyToEnd → sState=3 → FieldEffectStop.
//  Sprite data 1:1 : sState=data[0] sFldEff=data[1] sLocalId=data[2] sMapNum=data[3]
//    sMapGroup=data[4] sReadyToEnd=data[7].
//
//  Assets : tree/mountain/sand_disguise_placeholder.png (112×32 = 7 frames 16×32). Sand réutilise
//  sAnimTable_TreeDisguise (1:1). Palette : décomp oam.paletteNum = 4/3/2 (slot OW) → adaptation
//  plateforme : palette embarquée du PNG par tag (même choix que sparkle).
// ════════════════════════════════════════════════════════════════════════════

const DISGUISE_TILES_PER_FRAME = 8; // 16×32 = 2×4 tiles 4bpp
const DISGUISE_NUM_FRAMES = 7;

interface DisguiseCfg { fldEff: number; png: string; gfxTag: string; palTag: string; paletteNum: number; }
const DISGUISE_CFGS: ReadonlyArray<DisguiseCfg> = [
  { fldEff: FLDEFF_TREE_DISGUISE,     png: '/decomp/em/field_effects/tree_disguise.png',             gfxTag: 'FIELD_EFFECT_TREE_DISGUISE_GFX',     palTag: 'FIELD_EFFECT_TREE_DISGUISE_PAL',     paletteNum: 4 },
  { fldEff: FLDEFF_MOUNTAIN_DISGUISE, png: '/decomp/em/field_effects/mountain_disguise.png',         gfxTag: 'FIELD_EFFECT_MOUNTAIN_DISGUISE_GFX', palTag: 'FIELD_EFFECT_MOUNTAIN_DISGUISE_PAL', paletteNum: 3 },
  { fldEff: FLDEFF_SAND_DISGUISE,     png: '/decomp/em/field_effects/sand_disguise_placeholder.png', gfxTag: 'FIELD_EFFECT_SAND_DISGUISE_GFX',     palTag: 'FIELD_EFFECT_SAND_DISGUISE_PAL',     paletteNum: 2 },
];

/** 1:1 décomp sAnimTable_TreeDisguise (field_effect_objects.h:970) : anim 0 = statique
 *  (FRAME(0,16) END), anim 1 = révélation (FRAME 0..6 @4, END). imageValue = frameIdx × 8. */
const sAnims_Disguise: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 16), ANIMCMD_END],
  [
    ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(8, 4), ANIMCMD_FRAME(16, 4), ANIMCMD_FRAME(24, 4),
    ANIMCMD_FRAME(32, 4), ANIMCMD_FRAME(40, 4), ANIMCMD_FRAME(48, 4), ANIMCMD_END,
  ],
];

const _disguiseTileStart: number[] = [-1, -1, -1];
const _disguisePalSlot: number[] = [-1, -1, -1];
let _disguiseInit = false;
let _disguiseInitPromise: Promise<void> | null = null;

/** PNG 112×32 = 14×4 tiles row-major → 1D OBJ frame-major (7 frames 16×32 = 2×4 tiles/frame :
 *  frame F = colonnes 2F,2F+1 sur les 4 rows). */
function pngTo1dObjLayoutDisguise(charData: Uint8Array): Uint8Array {
  const TILE_BYTES = 32, PNG_W_TILES = 14, FW = 2, FH = 4;
  const out = new Uint8Array(DISGUISE_NUM_FRAMES * DISGUISE_TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < DISGUISE_NUM_FRAMES; f++) {
    for (let r = 0; r < FH; r++) {
      for (let c = 0; c < FW; c++) {
        const pngTileIdx = r * PNG_W_TILES + (f * FW + c);
        const objTileIdx = f * DISGUISE_TILES_PER_FRAME + r * FW + c;
        out.set(charData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES), objTileIdx * TILE_BYTES);
      }
    }
  }
  return out;
}

/** Préchargement assets (concern plateforme) : 3 déguisements (gfx + palettes). */
export function preloadDisguiseEffects(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _disguiseInit && DISGUISE_CFGS.every(c => IndexOfSpriteTileTag(c.gfxTag) !== 0xFF);
  if (stillAlloc) return Promise.resolve();
  if (_disguiseInitPromise && !_disguiseInit) return _disguiseInitPromise;
  _disguiseInit = false; _disguiseInitPromise = null;
  _disguiseInitPromise = (async () => {
    for (let i = 0; i < DISGUISE_CFGS.length; i++) {
      const c = DISGUISE_CFGS[i];
      const png = await loadIndexedPngStrict(c.png, 4);
      const reordered = pngTo1dObjLayoutDisguise(png.charData);
      _disguiseTileStart[i] = LoadSpriteSheet({ data: reordered, size: reordered.length, tag: c.gfxTag });
      _disguisePalSlot[i] = LoadSpritePalette({ data: png.palette as Uint16Array, tag: c.palTag });
    }
    _disguiseInit = true;
  })();
  return _disguiseInitPromise;
}

/** 1:1 décomp `ShowDisguiseFieldEffect(fldEff, fldEffObj, paletteNum)` (field_effect_helpers.c:1328).
 *  args[0..2] = localId/mapNum/mapGroup. Retourne le spriteId (stocké dans
 *  objectEvent.fieldEffectSpriteId par le caller MovementAction), ou MAX_SPRITES si échec. */
function ShowDisguiseFieldEffect(rt: DecompRuntime, fldEff: number): number {
  if (!_disguiseInit) return MAX_SPRITES;
  const cfgIdx = DISGUISE_CFGS.findIndex(c => c.fldEff === fldEff);
  if (cfgIdx < 0) return MAX_SPRITES;
  const localId = gFieldEffectArguments[0], mapNum = gFieldEffectArguments[1], mapGroup = gFieldEffectArguments[2];
  // 1:1 : if (TryGet(...)) { FieldEffectActiveListRemove; return MAX_SPRITES; } — TryGet TRUE = NOT trouvé.
  const { notFound } = TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (notFound) { FieldEffectActiveListRemove(fldEff); return MAX_SPRITES; }
  const result = rt.CreateSpriteAtOam({
    tileId: _disguiseTileStart[cfgIdx],
    paletteBank: _disguisePalSlot[cfgIdx],
    x: 0, y: 0,
    shape: 2, size: 2,  // 16×32 (gObjectEventBaseOam_16x32)
    priority: 2, paletteMode: 0, affineMode: 0,
    fromEnd: true,      // 1:1 CreateSpriteAtEnd
  });
  const sprite = rt.gSprites.get(result.spriteId);
  if (!sprite) return MAX_SPRITES;
  // 1:1 : template.callback = UpdateDisguiseFieldEffect ; .anims = sAnimTable_*Disguise.
  sprite.callback = UpdateDisguiseFieldEffect;
  setFieldEffectAnims(sprite, sAnims_Disguise, _disguiseTileStart[cfgIdx]);
  // 1:1 : sprite->coordOffsetEnabled++ (décomp = sprite monde). Adapté : matché au parent dans Update.
  sprite.coordOffsetEnabled = true;
  // 1:1 : oam.paletteNum = paletteNum (slot OW) — on a chargé la palette du PNG, paletteBank pointe dessus.
  sprite.data[0] = 0;        // sState (statique)
  sprite.data[1] = fldEff;   // sFldEff
  sprite.data[2] = localId;  // sLocalId
  sprite.data[3] = mapNum;   // sMapNum
  sprite.data[4] = mapGroup; // sMapGroup
  sprite.data[7] = 0;        // sReadyToEnd
  return result.spriteId;
}

/** 1:1 décomp `ShowTreeDisguiseFieldEffect` (field_effect_helpers.c:1313). */
export function ShowTreeDisguiseFieldEffect(rt: DecompRuntime): number {
  return ShowDisguiseFieldEffect(rt, FLDEFF_TREE_DISGUISE);
}
/** 1:1 décomp `ShowMountainDisguiseFieldEffect` (field_effect_helpers.c:1318). */
export function ShowMountainDisguiseFieldEffect(rt: DecompRuntime): number {
  return ShowDisguiseFieldEffect(rt, FLDEFF_MOUNTAIN_DISGUISE);
}
/** 1:1 décomp `ShowSandDisguiseFieldEffect` (field_effect_helpers.c:1323). */
export function ShowSandDisguiseFieldEffect(rt: DecompRuntime): number {
  return ShowDisguiseFieldEffect(rt, FLDEFF_SAND_DISGUISE);
}

/** 1:1 décomp `UpdateDisguiseFieldEffect` (field_effect_helpers.c:1351). Callback per-frame :
 *  suit le parent + machine de révélation. */
export function UpdateDisguiseFieldEffect(sprite: DecompSprite, rt: DecompRuntime): void {
  // 1:1 : if (TryGet(...)) FieldEffectStop. Le décomp continue ensuite et lit gObjectEvents[16]
  // (OOB, sprite déjà détruit) ; on return pour éviter le crash (lecture undefined côté TS).
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(sprite.data[2], sprite.data[3], sprite.data[4]);
  if (notFound) { FieldEffectStop(rt, sprite, sprite.data[1]); return; }
  const objEvent: ObjectEvent = gObjectEvents[objectEventId];
  const linkedSpriteId = GetObjectEventMainSpriteId(objEvent);
  const linked = linkedSpriteId >= 0 ? rt.gSprites.get(linkedSpriteId) : undefined;
  if (!linked) return;
  // 1:1 : suit le sprite parent.
  sprite.invisible = linked.invisible;
  sprite.x = linked.x;
  sprite.y = ((GetObjectEventGfxHeight(objEvent.graphicsId) >> 1) + linked.y - 16) & 0xFFFF;
  sprite.coordOffsetEnabled = linked.coordOffsetEnabled; // matcher le parent (écran-positionné)
  sprite.subpriority = (linked.subpriority - 1) & 0xFF;
  // 1:1 : machine d'état de révélation (sState=data[0], sReadyToEnd=data[7]).
  if (sprite.data[0] === 1) {
    sprite.data[0] = 2;
    rt.StartSpriteAnim(sprite.spriteId, 1); // révélation
  }
  if (sprite.data[0] === 2 && sprite.animEnded) sprite.data[7] = 1;
  if (sprite.data[0] === 3) FieldEffectStop(rt, sprite, sprite.data[1]);
}

/** 1:1 décomp `StartRevealDisguise` (field_effect_helpers.c:1380). Appelé par les MovementActions
 *  (dette H3 — port futur) : lance la révélation quand le joueur quitte le déguisement. */
export function StartRevealDisguise(rt: DecompRuntime, objectEvent: ObjectEvent): void {
  if (objectEvent.directionSeqIdx === 1) {
    const sprite = rt.gSprites.get(objectEvent.fieldEffectSpriteId);
    if (sprite) sprite.data[0] += 1; // sState++
  }
}

/** 1:1 décomp `UpdateRevealDisguise` (field_effect_helpers.c:1386). Retourne TRUE quand la
 *  révélation est finie (sReadyToEnd) ou hors séquence. */
export function UpdateRevealDisguise(rt: DecompRuntime, objectEvent: ObjectEvent): boolean {
  if (objectEvent.directionSeqIdx === 2) return true;
  if (objectEvent.directionSeqIdx === 0) return true;
  const sprite = rt.gSprites.get(objectEvent.fieldEffectSpriteId);
  if (sprite && sprite.data[7]) {
    objectEvent.directionSeqIdx = 2;
    sprite.data[0] += 1; // sState++
    return true;
  }
  return false;
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
