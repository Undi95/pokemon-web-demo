/**
 * battle/battle-sprite-callbacks.ts — Port 1:1 strict des sprite callbacks
 * battle_main.c.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:2667-3006`
 *
 * Callbacks portés 1:1 :
 *   - SpriteCB_WildMon (2667-2672) — entry wild mon spawn
 *   - SpriteCB_MoveWildMonToRight (2674-2684) — slide x2 +2 jusqu'à 0
 *   - SpriteCB_WildMonShowHealthbox (2686-2696) — anim ended → healthbox slide
 *   - SpriteCB_WildMonAnimate (2698-2704) — battle animate front sprite
 *   - SpriteCB_Flicker (2721-2736) — 6 flickers post-spawn
 *   - SpriteCB_ShowAsMoveTarget (2814-2819) — entry target highlight
 *   - SpriteCB_BlinkVisible (2821-2828) — toggle invisible
 *   - SpriteCB_HideAsMoveTarget (2830-2835) — restore invisible
 *   - SpriteCB_OpponentMonFromBall (2837-2848) — affine end → animate
 *   - SpriteCB_BattleSpriteStartSlideLeft (2851-2854) — set slide cb
 *   - SpriteCB_BattleSpriteSlideLeft (2856-2867) — slide x2 -2 jusqu'à 0
 *   - SpriteCB_Idle (2874-2876) — empty
 *   - DoBounceEffect (2899-2938) — start sin/cos bounce
 *   - EndBounceEffect (2940-2965) — stop bounce + reset
 *   - SpriteCB_BounceEffect (2967-2979) — tick sin index
 *   - SpriteCB_PlayerMonFromBall (2987-2991) — affine end → back sprite anim
 *   - SpriteCB_TrainerThrowObject (3002-3005) — start throw anim
 *   - SpriteCB_TrainerThrowObject_Main (2993-2998) — main loop throw
 *   - AnimSetCenterToCornerVecX (3008+) — sprite corner offset
 *   - SpriteCallbackDummy_2 (2706-2709) — empty
 *
 * Dépendances :
 *   - decomp-globals.ts : getRuntime, BeginNormalPaletteFade
 *   - state.ts : gBattleTypeFlags, gHitMarker
 *   - battle-faint-anim.ts : SpriteCB_FaintOpponent (port K13)
 *   - battle-vblank-helpers.ts : gIntroSlideFlags state
 *
 * Note : sprite types adapted pour notre runtime DecompSprite (= compat
 * struct C minimal). Les fields gSprites[id].data[0..7] sont les 8 task data
 * 16-bit du décomp.
 */

import { getRuntime } from '../system/decomp-globals';
import { gBattleTypeFlags, gHitMarker } from './state';
import { BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED_LINK, HITMARKER_NO_ANIMATIONS } from './constants';

// ─── Sprite type minimal compat décomp ─────────────────────────────────────

interface BattleSprite {
  x: number; y: number;
  x2: number; y2: number;
  data: number[];
  invisible: boolean;
  animEnded?: boolean;
  affineAnimEnded?: boolean;
  callback?: ((sprite: BattleSprite) => void) | null;
}

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `#define sBattler data[0]` (battle_main.c:2664). */
const SPRITE_DATA_BATTLER = 0;

/** 1:1 décomp `#define sSpeciesId data[2]` (battle_main.c:2665). */
const SPRITE_DATA_SPECIES = 2;

/** 1:1 décomp `sNumFlickers` = sprite->data[3], `sDelay` = sprite->data[4]. */
const SPRITE_DATA_NUM_FLICKERS = 3;
const SPRITE_DATA_DELAY = 4;

/** 1:1 décomp DoBounceEffect data fields. */
const SPRITE_DATA_SIN_INDEX = 0;
const SPRITE_DATA_DELTA = 1;
const SPRITE_DATA_AMPLITUDE = 2;
const SPRITE_DATA_BOUNCER_SPRITE_ID = 3;
const SPRITE_DATA_WHICH = 4;

/** 1:1 décomp BOUNCE_HEALTHBOX = 0, BOUNCE_MON = 1. */
export const BOUNCE_HEALTHBOX = 0;
export const BOUNCE_MON = 1;

/** 1:1 décomp `sFlickerArray[1]` (battle_main.c local static). */
const sFlickerArray: number[] = [0];

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `gIntroSlideFlags` shared state. */
function _getIntroSlideFlags(): number {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    getIntroSlideFlags?: () => number;
  } | undefined;
  return m?.getIntroSlideFlags?.() ?? 0;
}

/** 1:1 décomp `gBattleSpritesDataPtr->healthBoxesData[battler]`. */
interface HealthBoxData {
  healthboxIsBouncing: number;
  battlerIsBouncing: number;
  healthboxBounceSpriteId: number;
  battlerBounceSpriteId: number;
}
function _getHealthBoxData(_battler: number): HealthBoxData | null {
  // Dette R3 : full gBattleSpritesDataPtr structure.
  return null;
}

/** 1:1 décomp `gHealthboxSpriteIds[battler]`. Branché au registre healthbox voie-L
 *  (battle-healthbox-l.ts) via globalThis (cycle-safe, = pattern _getIntroSlideFlags). */
function _getHealthboxSpriteId(battler: number): number {
  const hb = (globalThis as Record<string, unknown>).__battleHealthbox as {
    gHealthboxSpriteIds?: number[];
  } | undefined;
  return hb?.gHealthboxSpriteIds?.[battler] ?? -1;
}

/** 1:1 décomp `gBattlerSpriteIds[battler]`. */
function _getBattlerSpriteId(_battler: number): number {
  // Dette R3 : cascade vers state sprite ids.
  return -1;
}

/** 1:1 décomp `StartHealthboxSlideIn(battler)` (pokeball.c:1241). Branché à l'impl
 *  voie-L (battle-healthbox-l.ts) via globalThis (cycle-safe). */
function _StartHealthboxSlideIn(battler: number): void {
  const hb = (globalThis as Record<string, unknown>).__battleHealthbox as {
    StartHealthboxSlideIn?: (b: number) => void;
  } | undefined;
  hb?.StartHealthboxSlideIn?.(battler);
}

/** 1:1 décomp `SetHealthboxSpriteVisible(spriteId)` (battle_interface.c:1031). */
function _SetHealthboxSpriteVisible(spriteId: number): void {
  const hb = (globalThis as Record<string, unknown>).__battleHealthbox as {
    SetHealthboxSpriteVisible?: (id: number) => void;
  } | undefined;
  hb?.SetHealthboxSpriteVisible?.(spriteId);
}

/** 1:1 décomp `StartSpriteAnim(sprite, animNum)` / `StartSpriteAnimIfDifferent`. */
function _StartSpriteAnim(_sprite: BattleSprite, _animNum: number): void {
  // Dette R3 : sprite-animation.ts wire.
}

function _StartSpriteAnimIfDifferent(sprite: BattleSprite, animNum: number): void {
  // 1:1 décomp : only restart if animNum != current. Pour now : noop.
  void sprite; void animNum;
}

/** 1:1 décomp `BattleAnimateFrontSprite(sprite, species, isOpponent, doCry)`. */
function _BattleAnimateFrontSprite(_sprite: BattleSprite, _species: number, _isOpponent: boolean, _doCry: number): void {
  // Dette R3 : battle anim front sprite (= cry + scale).
}

/** 1:1 décomp `BattleAnimateBackSprite(sprite, species)`. */
function _BattleAnimateBackSprite(_sprite: BattleSprite, _species: number): void {
  // Dette R3.
}

/** 1:1 décomp `HasTwoFramesAnimation(species)`. */
function _HasTwoFramesAnimation(_species: number): boolean {
  // Dette R3 : species data lookup.
  return false;
}

/** 1:1 décomp `BeginNormalPaletteFade(palettes, delay, startY, endY, color)`. */
function _BeginNormalPaletteFade(palettes: number, delay: number, startY: number, endY: number, color: number): void {
  const rt = getRuntime();
  rt?.BeginNormalPaletteFade?.(
    palettes as unknown as string, delay, startY, endY, color as unknown as string,
  );
}

/** 1:1 décomp `gPaletteFade.active`. */
function _isPaletteFadeActive(): boolean {
  return getRuntime()?.gPaletteFade?.active ?? false;
}

/** 1:1 décomp `Sin(index, amplitude)` (math_util.c) — table lookup. */
function _Sin(index: number, amplitude: number): number {
  // Décomp utilise gSineTable. Notre port : Math.sin standard.
  return Math.floor(Math.sin((index / 128) * Math.PI) * amplitude);
}

/** 1:1 décomp `CreateInvisibleSpriteWithCallback(cb)`. */
function _CreateInvisibleSpriteWithCallback(_cb: (sprite: BattleSprite) => void): number {
  // Dette R3 : spawn invisible sprite via runtime.
  return -1;
}

/** 1:1 décomp `DestroySprite(sprite)`. */
function _DestroySprite(sprite: BattleSprite): void {
  sprite.callback = null;
}

/** 1:1 décomp `AnimSetCenterToCornerVecX(sprite)` (battle_anim_mons.c:3008+).
 *  Calcule sprite corner offset depuis size pour OAM. */
export function AnimSetCenterToCornerVecX(_sprite: BattleSprite): void {
  // Dette R3 : full size lookup via sprite.oam shape/size.
}

// ─── Sprite callbacks 1:1 strict ───────────────────────────────────────────

/** 1:1 décomp `SpriteCallbackDummy_2(sprite)` (battle_main.c:2706-2709). */
export function SpriteCallbackDummy_2(_sprite: BattleSprite): void {
  // Empty function 1:1.
}

/** 1:1 décomp `SpriteCB_WildMon(sprite)` (battle_main.c:2667-2672).
 *  Entry callback wild mon spawn : start slide-to-right + dim palette fade. */
export function SpriteCB_WildMon(sprite: BattleSprite): void {
  sprite.callback = SpriteCB_MoveWildMonToRight;
  _StartSpriteAnimIfDifferent(sprite, 0);
  // 1:1 décomp : 0x20000 = palettes bit pour mon OBJ palette (= bit 17).
  // RGB(8,8,8) = couleur de dim grise.
  _BeginNormalPaletteFade(0x20000, 0, 10, 10, (8 | (8 << 5) | (8 << 10)));
}

/** 1:1 décomp `SpriteCB_MoveWildMonToRight(sprite)` (battle_main.c:2674-2684). */
export function SpriteCB_MoveWildMonToRight(sprite: BattleSprite): void {
  if ((_getIntroSlideFlags() & 1) === 0) {
    sprite.x2 += 2;
    if (sprite.x2 === 0) {
      sprite.callback = SpriteCB_WildMonShowHealthbox;
    }
  }
}

/** 1:1 décomp `SpriteCB_WildMonShowHealthbox(sprite)` (battle_main.c:2686-2696). */
export function SpriteCB_WildMonShowHealthbox(sprite: BattleSprite): void {
  if (sprite.animEnded) {
    const battler = sprite.data[SPRITE_DATA_BATTLER] ?? 0;
    _StartHealthboxSlideIn(battler);
    _SetHealthboxSpriteVisible(_getHealthboxSpriteId(battler));
    sprite.callback = SpriteCB_WildMonAnimate;
    _StartSpriteAnimIfDifferent(sprite, 0);
    // Fade out dim palette (= return to normal).
    _BeginNormalPaletteFade(0x20000, 0, 10, 0, (8 | (8 << 5) | (8 << 10)));
  }
}

/** 1:1 décomp `SpriteCB_WildMonAnimate(sprite)` (battle_main.c:2698-2704). */
export function SpriteCB_WildMonAnimate(sprite: BattleSprite): void {
  if (!_isPaletteFadeActive()) {
    const species = sprite.data[SPRITE_DATA_SPECIES] ?? 0;
    _BattleAnimateFrontSprite(sprite, species, false, 1);
  }
}

/** 1:1 décomp `SpriteCB_Flicker(sprite)` (battle_main.c:2721-2736). */
export function SpriteCB_Flicker(sprite: BattleSprite): void {
  sprite.data[SPRITE_DATA_DELAY]--;
  if (sprite.data[SPRITE_DATA_DELAY] === 0) {
    sprite.data[SPRITE_DATA_DELAY] = 8;
    sprite.invisible = !sprite.invisible;
    sprite.data[SPRITE_DATA_NUM_FLICKERS]--;
    if (sprite.data[SPRITE_DATA_NUM_FLICKERS] === 0) {
      sprite.invisible = false;
      sprite.callback = SpriteCallbackDummy_2;
      sFlickerArray[0] = 0;
    }
  }
}

/** 1:1 décomp `SpriteCB_ShowAsMoveTarget(sprite)` (battle_main.c:2814-2819). */
export function SpriteCB_ShowAsMoveTarget(sprite: BattleSprite): void {
  sprite.data[3] = 8;
  sprite.data[4] = sprite.invisible ? 1 : 0;
  sprite.callback = SpriteCB_BlinkVisible;
}

/** 1:1 décomp `SpriteCB_BlinkVisible(sprite)` (battle_main.c:2821-2828). */
export function SpriteCB_BlinkVisible(sprite: BattleSprite): void {
  sprite.data[3]--;
  if (sprite.data[3] === 0) {
    sprite.invisible = !sprite.invisible;
    sprite.data[3] = 8;
  }
}

/** 1:1 décomp `SpriteCB_HideAsMoveTarget(sprite)` (battle_main.c:2830-2835). */
export function SpriteCB_HideAsMoveTarget(sprite: BattleSprite): void {
  sprite.invisible = sprite.data[4] !== 0;
  sprite.data[4] = 0;  // FALSE
  sprite.callback = SpriteCallbackDummy_2;
}

/** 1:1 décomp `SpriteCB_OpponentMonFromBall(sprite)` (battle_main.c:2837-2848). */
export function SpriteCB_OpponentMonFromBall(sprite: BattleSprite): void {
  if (sprite.affineAnimEnded) {
    if (!(gHitMarker & HITMARKER_NO_ANIMATIONS)
        || (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))) {
      const species = sprite.data[SPRITE_DATA_SPECIES] ?? 0;
      if (_HasTwoFramesAnimation(species)) {
        _StartSpriteAnim(sprite, 1);
      }
    }
    const species = sprite.data[SPRITE_DATA_SPECIES] ?? 0;
    _BattleAnimateFrontSprite(sprite, species, true, 1);
  }
}

/** 1:1 décomp `SpriteCB_BattleSpriteStartSlideLeft(sprite)` (battle_main.c:2851-2854). */
export function SpriteCB_BattleSpriteStartSlideLeft(sprite: BattleSprite): void {
  sprite.callback = SpriteCB_BattleSpriteSlideLeft;
}

/** 1:1 décomp `SpriteCB_BattleSpriteSlideLeft(sprite)` (battle_main.c:2856-2867). */
export function SpriteCB_BattleSpriteSlideLeft(sprite: BattleSprite): void {
  if (!(_getIntroSlideFlags() & 1)) {
    sprite.x2 -= 2;
    if (sprite.x2 === 0) {
      sprite.callback = SpriteCB_Idle;
      sprite.data[1] = 0;
    }
  }
}

/** 1:1 décomp `SpriteCB_Idle(sprite)` (battle_main.c:2874-2876). */
export function SpriteCB_Idle(_sprite: BattleSprite): void {
  // Empty function 1:1.
}

/** 1:1 décomp `SpriteCB_PlayerMonFromBall(sprite)` (battle_main.c:2987-2991). */
export function SpriteCB_PlayerMonFromBall(sprite: BattleSprite): void {
  if (sprite.affineAnimEnded) {
    const species = sprite.data[SPRITE_DATA_SPECIES] ?? 0;
    _BattleAnimateBackSprite(sprite, species);
  }
}

/** 1:1 décomp `SpriteCB_TrainerThrowObject_Main(sprite)` (battle_main.c:2993-2998). */
export function SpriteCB_TrainerThrowObject_Main(sprite: BattleSprite): void {
  AnimSetCenterToCornerVecX(sprite);
  if (sprite.animEnded) {
    sprite.callback = SpriteCB_Idle;
  }
}

/** 1:1 décomp `SpriteCB_TrainerThrowObject(sprite)` (battle_main.c:3002-3005). */
export function SpriteCB_TrainerThrowObject(sprite: BattleSprite): void {
  _StartSpriteAnim(sprite, 1);
  sprite.callback = SpriteCB_TrainerThrowObject_Main;
}

// ─── DoBounceEffect / EndBounceEffect (battle_main.c:2899-2965) ────────────

/** 1:1 décomp `DoBounceEffect(battler, which, delta, amplitude)`
 *  (battle_main.c:2899-2938). Start bouncing effect sur healthbox ou mon. */
export function DoBounceEffect(battler: number, which: number, delta: number, amplitude: number): void {
  const hbData = _getHealthBoxData(battler);
  if (hbData) {
    if (which === BOUNCE_HEALTHBOX) {
      if (hbData.healthboxIsBouncing) return;
    } else if (which === BOUNCE_MON) {
      if (hbData.battlerIsBouncing) return;
    }
  }

  const invisibleSpriteId = _CreateInvisibleSpriteWithCallback(SpriteCB_BounceEffect);
  let bouncerSpriteId: number;

  if (which === BOUNCE_HEALTHBOX) {
    bouncerSpriteId = _getHealthboxSpriteId(battler);
    if (hbData) {
      hbData.healthboxBounceSpriteId = invisibleSpriteId;
      hbData.healthboxIsBouncing = 1;
    }
    // sSinIndex = 128 (= half period).
    _setBounceData(invisibleSpriteId, SPRITE_DATA_SIN_INDEX, 128);
  } else {
    bouncerSpriteId = _getBattlerSpriteId(battler);
    if (hbData) {
      hbData.battlerBounceSpriteId = invisibleSpriteId;
      hbData.battlerIsBouncing = 1;
    }
    // sSinIndex = 192 (= -1 effective).
    _setBounceData(invisibleSpriteId, SPRITE_DATA_SIN_INDEX, 192);
  }

  _setBounceData(invisibleSpriteId, SPRITE_DATA_DELTA, delta);
  _setBounceData(invisibleSpriteId, SPRITE_DATA_AMPLITUDE, amplitude);
  _setBounceData(invisibleSpriteId, SPRITE_DATA_BOUNCER_SPRITE_ID, bouncerSpriteId);
  _setBounceData(invisibleSpriteId, SPRITE_DATA_WHICH, which);

  // Reset bouncer sprite offset.
  const rt = getRuntime();
  const bouncer = rt?.gSprites?.get(bouncerSpriteId);
  if (bouncer) {
    bouncer.x2 = 0;
    bouncer.y2 = 0;
  }
}

function _setBounceData(spriteId: number, field: number, value: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.get(spriteId);
  if (sprite) sprite.data[field] = value;
}

/** 1:1 décomp `EndBounceEffect(battler, which)` (battle_main.c:2940-2965). */
export function EndBounceEffect(battler: number, which: number): void {
  const hbData = _getHealthBoxData(battler);
  if (!hbData) return;

  let bouncerSpriteId: number;
  const rt = getRuntime();

  if (which === BOUNCE_HEALTHBOX) {
    if (!hbData.healthboxIsBouncing) return;
    const invisibleSprite = rt?.gSprites?.get(hbData.healthboxBounceSpriteId);
    bouncerSpriteId = (invisibleSprite?.data[SPRITE_DATA_BOUNCER_SPRITE_ID] ?? 0);
    if (invisibleSprite) _DestroySprite(invisibleSprite as never);
    hbData.healthboxIsBouncing = 0;
  } else {
    if (!hbData.battlerIsBouncing) return;
    const invisibleSprite = rt?.gSprites?.get(hbData.battlerBounceSpriteId);
    bouncerSpriteId = (invisibleSprite?.data[SPRITE_DATA_BOUNCER_SPRITE_ID] ?? 0);
    if (invisibleSprite) _DestroySprite(invisibleSprite as never);
    hbData.battlerIsBouncing = 0;
  }

  const bouncer = rt?.gSprites?.get(bouncerSpriteId);
  if (bouncer) {
    bouncer.x2 = 0;
    bouncer.y2 = 0;
  }
}

/** 1:1 décomp `SpriteCB_BounceEffect(sprite)` (battle_main.c:2967-2979). */
export function SpriteCB_BounceEffect(sprite: BattleSprite): void {
  const bouncerSpriteId = sprite.data[SPRITE_DATA_BOUNCER_SPRITE_ID];
  const index = sprite.data[SPRITE_DATA_SIN_INDEX];
  const amplitude = sprite.data[SPRITE_DATA_AMPLITUDE];

  const rt = getRuntime();
  const bouncer = rt?.gSprites?.get(bouncerSpriteId);
  if (bouncer) {
    bouncer.y2 = _Sin(index, amplitude) + amplitude;
  }
  sprite.data[SPRITE_DATA_SIN_INDEX] = (sprite.data[SPRITE_DATA_SIN_INDEX] + sprite.data[SPRITE_DATA_DELTA]) & 0xFF;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleSpriteCallbacks = {
  SpriteCB_WildMon, SpriteCB_MoveWildMonToRight, SpriteCB_WildMonShowHealthbox,
  SpriteCB_WildMonAnimate, SpriteCB_Flicker,
  SpriteCB_ShowAsMoveTarget, SpriteCB_BlinkVisible, SpriteCB_HideAsMoveTarget,
  SpriteCB_OpponentMonFromBall, SpriteCB_BattleSpriteStartSlideLeft,
  SpriteCB_BattleSpriteSlideLeft, SpriteCB_Idle,
  SpriteCB_PlayerMonFromBall, SpriteCB_TrainerThrowObject,
  SpriteCB_TrainerThrowObject_Main, SpriteCallbackDummy_2,
  AnimSetCenterToCornerVecX,
  DoBounceEffect, EndBounceEffect, SpriteCB_BounceEffect,
  BOUNCE_HEALTHBOX, BOUNCE_MON,
};
