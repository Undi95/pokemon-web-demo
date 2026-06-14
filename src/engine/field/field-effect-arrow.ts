/**
 * field-effect-arrow.ts — DRIVER du warp arrow.
 *
 * Les 3 fonctions `field_effect_helpers.c` (CreateWarpArrowSprite:175,
 * SetSpriteInvisible:188, ShowWarpArrowSprite:193) sont MIGRÉES dans
 * `game/field_effect_helpers.ts` (modèle 1:1 : sprite persistant + VRAI moteur
 * d'anim — plus de tick manuel ni de pool d'état d'anim).
 *
 * Ce module garde le DRIVER per-frame `HideShowWarpArrow` (1:1 décomp
 * `field_player_avatar.c:1428`) + les prédicats `MetatileBehavior_Is*ArrowWarp`
 * (metatile_behavior.c) : décide, selon la tuile sous le joueur et sa direction
 * de mouvement, s'il faut montrer la flèche sur la tuile adjacente ou la cacher.
 *
 * Clignotement : joué par le MOTEUR (tickSpriteAnims) une fois `StartSpriteAnim`
 * appelé par ShowWarpArrowSprite (sAnimTable_Arrow = 2 frames @32 + JUMP(0)).
 * `coordOffsetEnabled = TRUE` → la flèche suit la caméra via syncSpritesToOam.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './map-loader';
import { MoveCoords, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './direction-coords';
import { ENUM_MB_0 as MB } from '../decomp-data/include/constants/metatile_behaviors-data';
import {
  preloadWarpArrowEffect,
  CreateWarpArrowSprite as _CreateWarpArrowSprite,
  ShowWarpArrowSprite as _ShowWarpArrowSprite,
  SetSpriteInvisible as _SetSpriteInvisible,
} from '../../game/field_effect_helpers';

const MAX_SPRITES = 64;

/** spriteId de la flèche (1:1 décomp : stocké dans objectEvent->warpArrowSpriteId ;
 *  notre driver le garde en module-global, créé au map load). MAX_SPRITES = aucun. */
let _arrowSpriteId = MAX_SPRITES;

// ─── Reset hook : clear au ResetSpriteData ──────────────────────────────────
// 1:1 décomp : ResetSpriteData met tous sprite.inUse=FALSE. Notre _arrowSpriteId
// externe n'a pas cette propagation auto → sans ce hook, après un reset (bag/menu/
// warp) il reste STALE et un DestroyWarpArrowSprite écraserait un AUTRE sprite
// (slot réutilisé par un NPC respawné). Cf. bug "moitié de maman" historique.
(() => {
  const g = globalThis as Record<string, unknown>;
  const callbacks = (g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  callbacks.push(() => { _arrowSpriteId = MAX_SPRITES; });
  g.__spriteResetCallbacks = callbacks;
})();

/** Debug helper exposé sur globalThis (devtools console). */
export function getArrowState(): { spriteId: number } | null {
  return _arrowSpriteId === MAX_SPRITES ? null : { spriteId: _arrowSpriteId };
}
(globalThis as Record<string, unknown>).getArrowState = getArrowState;

/** 1:1 décomp `CreateWarpArrowSprite` (field_effect_helpers.c:175) — wrapper : précharge
 *  l'asset (concern plateforme) puis crée le sprite via le miroir. À appeler au map load. */
export async function CreateWarpArrowSprite(rt: DecompRuntime): Promise<number> {
  if (_arrowSpriteId !== MAX_SPRITES) DestroyWarpArrowSprite(rt);
  await preloadWarpArrowEffect(rt);
  _arrowSpriteId = _CreateWarpArrowSprite(rt);
  return _arrowSpriteId;
}

/** Cleanup au map switch (= 1:1 DestroyWarpArrowSprite). */
export function DestroyWarpArrowSprite(rt: DecompRuntime): void {
  if (_arrowSpriteId === MAX_SPRITES) return;
  const sprite = rt.gSprites.get(_arrowSpriteId);
  if (sprite) {
    rt.gba.oam[sprite.oamIndex].visible = false;
    sprite.inUse = false;
  }
  _arrowSpriteId = MAX_SPRITES;
}

// ─── MetatileBehavior_Is*ArrowWarp (metatile_behavior.c) ────────────────────

/** 1:1 décomp `MetatileBehavior_IsSouthArrowWarp` (metatile_behavior.c:313). */
function isSouthArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_SOUTH_ARROW_WARP
      || behavior === MB.MB_WATER_SOUTH_ARROW_WARP
      || behavior === MB.MB_SHOAL_CAVE_ENTRANCE;
}
/** 1:1 décomp `MetatileBehavior_IsNorthArrowWarp` (metatile_behavior.c:304). */
function isNorthArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_NORTH_ARROW_WARP
      || behavior === MB.MB_STAIRS_OUTSIDE_ABANDONED_SHIP;
}
/** 1:1 décomp `MetatileBehavior_IsWestArrowWarp` (metatile_behavior.c:296). */
function isWestArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_WEST_ARROW_WARP;
}
/** 1:1 décomp `MetatileBehavior_IsEastArrowWarp` (metatile_behavior.c:288). */
function isEastArrowWarp(behavior: number): boolean {
  return behavior === MB.MB_EAST_ARROW_WARP;
}

/** Direction → check fn 1:1 décomp `sArrowWarpMetatileBehaviorChecks2`
 *  (field_player_avatar.c:294-300). */
const ARROW_CHECKS: Record<number, (b: number) => boolean> = {
  [DIR_SOUTH]: isSouthArrowWarp,
  [DIR_NORTH]: isNorthArrowWarp,
  [DIR_WEST]:  isWestArrowWarp,
  [DIR_EAST]:  isEastArrowWarp,
};

/** 1:1 décomp `HideShowWarpArrow` (field_player_avatar.c:1428). Wrapper coords/dir
 *  séparées (= notre TestOverworldScene actuel ; playerX/Y LOGICAL → INTERNAL). */
export function HideShowWarpArrow(
  rt: DecompRuntime, playerX: number, playerY: number, movementDir: number,
): void {
  if (_arrowSpriteId === MAX_SPRITES) return;
  const internalX = playerX + MAP_OFFSET;
  const internalY = playerY + MAP_OFFSET;
  const metatileBehavior = MapGridGetMetatileBehaviorAt(internalX, internalY);
  // 1:1 décomp loop : test chaque dir ; si la tuile a le ARROW_WARP behavior matchant
  // cette dir ET movementDirection == cette dir → show arrow sur la tuile adjacente.
  for (const dir of [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]) {
    if (ARROW_CHECKS[dir]!(metatileBehavior) && dir === movementDir) {
      const target = MoveCoords(dir, internalX, internalY);
      _ShowWarpArrowSprite(rt, _arrowSpriteId, dir, target.x, target.y);
      return;
    }
  }
  _SetSpriteInvisible(rt, _arrowSpriteId);
}

/** 1:1 STRICT décomp signature `HideShowWarpArrow(struct ObjectEvent *objectEvent)`
 *  (field_player_avatar.c:1428). Lit currentMetatileBehavior + movementDirection +
 *  currentCoords directement (INTERNAL). */
export function HideShowWarpArrowFromObjectEvent(
  rt: DecompRuntime,
  objectEvent: {
    currentCoordsX: number;
    currentCoordsY: number;
    currentMetatileBehavior: number;
    movementDirection: number;
    active: boolean;
    isPlayer: boolean;
  },
): void {
  if (_arrowSpriteId === MAX_SPRITES) return;
  if (!objectEvent.active || !objectEvent.isPlayer) {
    _SetSpriteInvisible(rt, _arrowSpriteId);
    return;
  }
  const metatileBehavior = objectEvent.currentMetatileBehavior;
  const internalX = objectEvent.currentCoordsX;
  const internalY = objectEvent.currentCoordsY;
  for (const dir of [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST]) {
    if (ARROW_CHECKS[dir]!(metatileBehavior) && dir === objectEvent.movementDirection) {
      const target = MoveCoords(dir, internalX, internalY);
      _ShowWarpArrowSprite(rt, _arrowSpriteId, dir, target.x, target.y);
      return;
    }
  }
  _SetSpriteInvisible(rt, _arrowSpriteId);
}
