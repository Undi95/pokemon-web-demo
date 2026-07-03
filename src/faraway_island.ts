/**
 * faraway_island.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/faraway_island.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/faraway_island.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { SpriteCallbackDummy, getRuntime } from '../harness/runtime/decomp-globals';
import { FLAG_CAUGHT_MEW, FLAG_HIDE_MEW } from '../include/constants/flags';
import { DIR_EAST, DIR_NONE, DIR_NORTH, DIR_SOUTH, DIR_WEST } from '../include/constants/global';
import { MAP_CONSTANTS, MAP_GROUP, MAP_NUM } from '../include/constants/map_groups';
import { VAR_FARAWAY_ISLAND_STEP_COUNTER } from '../include/constants/vars';
import { MAP_OFFSET } from '../include/fieldmap';
import { MAX_SPRITES } from '../include/sprite';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { FlagGet, VarGet, VarSet } from './event_data';
import { TryGetObjectEventIdByLocalIdAndMap, gObjectEvents } from './event_object_movement';
import { SetSpritePosToOffsetMapCoords } from './field_camera';
import {
  LoadGeneralFieldEffectPalette, getFldEffLongGrassParts, preloadLongGrassEffect, setFieldEffectAnims,
} from './field_effect_helpers';
import { gPlayerAvatar } from './field_player_avatar';
import { MapGridGetMetatileBehaviorAt } from './fieldmap';
import { MetatileBehavior_IsPokeGrass } from './metatile_behavior';
import { DestroySprite, gSprites } from './sprite';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type { ObjectEvent } from './event_object_movement';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const LOCALID_FARAWAY_ISLAND_MEW = 1; // 1:1 generated:maps/FarawayIsland_Interior (mapjson index+1)

/** 1:1 (faraway_island.c:20) */
let sGrassSpriteId = 0;

/** 1:1 (faraway_island.c:22) */
let sPlayerToMewDeltaX = 0;

/** 1:1 (faraway_island.c:23) */
let sPlayerToMewDeltaY = 0;

/** 1:1 (faraway_island.c:24) */
const sMewDirectionCandidates = new Uint8Array(4);

/** 1:1 (faraway_island.c:29) */
const sFarawayIslandRockCoords: number[][] = [
  [
    14 + MAP_OFFSET,
    9 + MAP_OFFSET,
  ],
  [
    18 + MAP_OFFSET,
    9 + MAP_OFFSET,
  ],
  [
    9 + MAP_OFFSET,
    10 + MAP_OFFSET,
  ],
  [
    13 + MAP_OFFSET,
    13 + MAP_OFFSET,
  ],
];

/** 1:1 `static u8 GetMewObjectEventId(void)` (faraway_island.c:37-42).
 *  Revue transpiler : out-param &objectEventId → retour {objectEventId} (convention repo). */
function GetMewObjectEventId(): number {
  return TryGetObjectEventIdByLocalIdAndMap(LOCALID_FARAWAY_ISLAND_MEW,
    gSaveBlock1Ptr.location.mapNum, gSaveBlock1Ptr.location.mapGroup).objectEventId;
}

// When the player enters Faraway Island interior it begins a "hide and seek" minigame where Mew disappears into the grass

// This function returns the direction Mew will take a step, and is run every time the player takes a step

/** 1:1 `u32 GetMewMoveDirection(void)` (faraway_island.c:46-267). */
export function GetMewMoveDirection(): number {
  let i = 0;
  let mewSafeFromTrap = false; // revue : bool32 C
  let mew = gObjectEvents[GetMewObjectEventId()];
  sPlayerToMewDeltaX = gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsX - mew.currentCoordsX;
  sPlayerToMewDeltaY = gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsY - mew.currentCoordsY;
  for (i = 0; i < sMewDirectionCandidates.length; i++)
    sMewDirectionCandidates[i] = DIR_NONE;
  // Player hasn't moved (just facing new direction), don't move
  if (gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsX == gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsX && gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsY == gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsY)
  {
    return DIR_NONE;
  }
  // Mew is invisible except for every 8th step
  if (VarGet(VAR_FARAWAY_ISLAND_STEP_COUNTER) % 8 == 0)
    mew.invisible = false;
  else
    mew.invisible = true;
  // Mew will stay in place for 1 step after its visible
  if (VarGet(VAR_FARAWAY_ISLAND_STEP_COUNTER) % 9 == 0)
    return DIR_NONE;
  // Below loop is for Mew to try to avoid getting trapped between the player and a rock
  for (i = 0; i < sFarawayIslandRockCoords.length; i++)
  {
    if (gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsX == sFarawayIslandRockCoords[i][0])
    {
      mewSafeFromTrap = false;
      if (gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsY < sFarawayIslandRockCoords[i][1])
      {
        if (mew.currentCoordsY <= sFarawayIslandRockCoords[i][1])
          mewSafeFromTrap = true;
      }
      else
      {
        if (mew.currentCoordsY >= sFarawayIslandRockCoords[i][1])
          mewSafeFromTrap = true;
      }
      if (!mewSafeFromTrap)
      {
        if (sPlayerToMewDeltaX > 0)
        {
          if (mew.currentCoordsX + 1 == gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsX)
          {
            if (CanMewMoveToCoords(mew.currentCoordsX + 1, mew.currentCoordsY))
              return DIR_EAST;
          }
        }
        else if (sPlayerToMewDeltaX < 0)
        {
          if (mew.currentCoordsX - 1 == gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsX)
          {
            if (CanMewMoveToCoords(mew.currentCoordsX - 1, mew.currentCoordsY))
              return DIR_WEST;
          }
        }
        if (mew.currentCoordsX == gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsX)
        {
          if (sPlayerToMewDeltaY > 0)
          {
            if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY - 1))
              return DIR_NORTH;
          }
          else
          {
            if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY + 1))
              return DIR_SOUTH;
          }
        }
      }
    }
    if (gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsY == sFarawayIslandRockCoords[i][1])
    {
      mewSafeFromTrap = false;
      if (gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsX < sFarawayIslandRockCoords[i][0])
      {
        if (mew.currentCoordsX <= sFarawayIslandRockCoords[i][0])
          mewSafeFromTrap = true;
      }
      else
      {
        if (mew.currentCoordsX >= sFarawayIslandRockCoords[i][0])
          mewSafeFromTrap = true;
      }
      if (!mewSafeFromTrap)
      {
        if (sPlayerToMewDeltaY > 0)
        {
          if (mew.currentCoordsY + 1 == gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsY)
          {
            if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY + 1))
              return DIR_SOUTH;
          }
        }
        else if (sPlayerToMewDeltaY < 0)
        {
          if (mew.currentCoordsY - 1 == gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsY)
          {
            if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY - 1))
              return DIR_NORTH;
          }
        }
        if (mew.currentCoordsY == gObjectEvents[gPlayerAvatar.objectEventId].previousCoordsY)
        {
          if (sPlayerToMewDeltaX > 0)
          {
            if (CanMewMoveToCoords(mew.currentCoordsX - 1, mew.currentCoordsY))
              return DIR_WEST;
          }
          else
          {
            if (CanMewMoveToCoords(mew.currentCoordsX + 1, mew.currentCoordsY))
              return DIR_EAST;
          }
        }
      }
    }
  }
  // Check if Mew can move in any direction without getting closer to the player
  // If so load into sMewDirectionCandidates
  // If Mew can move in two of the checked directions, choose one randomly
  if (ShouldMewMoveNorth(mew, 0))
  {
    if (ShouldMewMoveEast(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else if (ShouldMewMoveWest(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else
      return DIR_NORTH;
  }
  if (ShouldMewMoveSouth(mew, 0))
  {
    if (ShouldMewMoveEast(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else if (ShouldMewMoveWest(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else
      return DIR_SOUTH;
  }
  if (ShouldMewMoveEast(mew, 0))
  {
    if (ShouldMewMoveNorth(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else if (ShouldMewMoveSouth(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else
      return DIR_EAST;
  }
  if (ShouldMewMoveWest(mew, 0))
  {
    if (ShouldMewMoveNorth(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else if (ShouldMewMoveSouth(mew, 1))
      return GetRandomMewDirectionCandidate(2);
    else
      return DIR_WEST;
  }
  // If this point is reached, Mew cannot move without getting closer to the player
  // Avoid player on same Y, try move North/South
  if (sPlayerToMewDeltaY == 0)
  {
    if (gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsY > mew.currentCoordsY)
    {
      if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY - 1))
        return DIR_NORTH;
    }
    if (gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsY < mew.currentCoordsY)
    {
      if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY + 1))
        return DIR_SOUTH;
    }
    if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY - 1))
      return DIR_NORTH;
    if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY + 1))
      return DIR_SOUTH;
  }
  // Avoid player on same X, try move West/East
  if (sPlayerToMewDeltaX == 0)
  {
    if (gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsX > mew.currentCoordsX)
    {
      if (CanMewMoveToCoords(mew.currentCoordsX - 1, mew.currentCoordsY))
        return DIR_WEST;
    }
    if (gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsX < mew.currentCoordsX)
    {
      if (CanMewMoveToCoords(mew.currentCoordsX + 1, mew.currentCoordsY))
        return DIR_EAST;
    }
    if (CanMewMoveToCoords(mew.currentCoordsX + 1, mew.currentCoordsY))
      return DIR_EAST;
    if (CanMewMoveToCoords(mew.currentCoordsX - 1, mew.currentCoordsY))
      return DIR_WEST;
  }
  // Can't avoid player on axis, move any valid direction
  return GetValidMewMoveDirection(DIR_NONE);
}

// Mew can move to any Tall/Long Grass metatile the player isn't currently on

/** 1:1 `static bool8 CanMewMoveToCoords(s16 x, s16 y)` (faraway_island.c:270-279). */
function CanMewMoveToCoords(x: number, y: number): boolean {
  if (gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsX == x && gObjectEvents[gPlayerAvatar.objectEventId].currentCoordsY == y)
  {
    return false;
  }
  return MetatileBehavior_IsPokeGrass(MapGridGetMetatileBehaviorAt(x, y));
}

// Last ditch effort to move, clear move candidates and try all directions again

/** 1:1 `static u8 GetValidMewMoveDirection(u8 ignoredDir)` (faraway_island.c:282-319). */
function GetValidMewMoveDirection(ignoredDir: number): number {
  let i = 0;
  let count = 0;
  let mew = gObjectEvents[GetMewObjectEventId()];
  for (i = 0; i < sMewDirectionCandidates.length; i++)
    sMewDirectionCandidates[i] = DIR_NONE;
  if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY - 1) && ignoredDir != DIR_NORTH)
  {
    sMewDirectionCandidates[count] = DIR_NORTH;
    count++;
  }
  if (CanMewMoveToCoords(mew.currentCoordsX + 1, mew.currentCoordsY) && ignoredDir != DIR_EAST)
  {
    sMewDirectionCandidates[count] = DIR_EAST;
    count++;
  }
  if (CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY + 1) && ignoredDir != DIR_SOUTH)
  {
    sMewDirectionCandidates[count] = DIR_SOUTH;
    count++;
  }
  if (CanMewMoveToCoords(mew.currentCoordsX - 1, mew.currentCoordsY) && ignoredDir != DIR_WEST)
  {
    sMewDirectionCandidates[count] = DIR_WEST;
    count++;
  }
  if (count > 1)
    return sMewDirectionCandidates[VarGet(VAR_FARAWAY_ISLAND_STEP_COUNTER) % count];
  else
    return sMewDirectionCandidates[0];
}

/** 1:1 `void UpdateFarawayIslandStepCounter(void)` (faraway_island.c:321-333). */
export function UpdateFarawayIslandStepCounter(): void {
  let steps = VarGet(VAR_FARAWAY_ISLAND_STEP_COUNTER);
  if (gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_FARAWAY_ISLAND_INTERIOR) && gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_FARAWAY_ISLAND_INTERIOR))
  {
    steps++;
    if (steps >= 9999)
      VarSet(VAR_FARAWAY_ISLAND_STEP_COUNTER, 0);
    else
      VarSet(VAR_FARAWAY_ISLAND_STEP_COUNTER, steps);
  }
}

/** 1:1 `bool8 ObjectEventIsFarawayIslandMew(struct ObjectEvent *objectEvent)` (faraway_island.c:335-345). */
export function ObjectEventIsFarawayIslandMew(objectEvent: ObjectEvent): boolean {
  if (gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_FARAWAY_ISLAND_INTERIOR) && gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_FARAWAY_ISLAND_INTERIOR))
  {
    if (objectEvent.graphicsId === 'OBJ_EVENT_GFX_MEW' /* revue : graphicsId string chez nous */)
      return true;
  }
  return false;
}

/** 1:1 `bool8 IsMewPlayingHideAndSeek(void)` (faraway_island.c:347-357). */
export function IsMewPlayingHideAndSeek(): boolean {
  if (gSaveBlock1Ptr.location.mapNum == MAP_NUM(MAP_CONSTANTS.MAP_FARAWAY_ISLAND_INTERIOR) && gSaveBlock1Ptr.location.mapGroup == MAP_GROUP(MAP_CONSTANTS.MAP_FARAWAY_ISLAND_INTERIOR))
  {
    if (!FlagGet(FLAG_CAUGHT_MEW) && !FlagGet(FLAG_HIDE_MEW))
      return true;
  }
  return false;
}

// Every 4th step Mew will shake the grass it steps into

// Otherwise its movement leaves grass undisturbed

/** 1:1 `bool8 ShouldMewShakeGrass(struct ObjectEvent *objectEvent)` (faraway_island.c:361-368). */
export function ShouldMewShakeGrass(objectEvent: ObjectEvent): boolean {
  if (VarGet(VAR_FARAWAY_ISLAND_STEP_COUNTER) != 0xFFFF && VarGet(VAR_FARAWAY_ISLAND_STEP_COUNTER) % 4 == 0)
    return true;
  return false;
}

/** 1:1 `void SetMewAboveGrass(void)` (faraway_island.c:370-409).
 *  Revues transpiler (pièces repo réutilisées — puzzle) :
 *  - `LoadSpritePalette(&gSpritePalette_GeneralFieldEffect1)` + UpdateSpritePalette
 *    WithWeather → `LoadGeneralFieldEffectPalette(1)` (= exactement ces 2 lignes,
 *    field_effect_helpers.ts, mécanisme loadfadedpal 1:1).
 *  - `CreateSpriteAtEnd(gFieldEffectObjectTemplatePointers[FLDEFFOBJ_LONG_GRASS])`
 *    → pattern FldEff_LongGrass : rt.CreateSpriteAtOam(fromEnd) + parts du template
 *    (getFldEffLongGrassParts) + setFieldEffectAnims. Si l'asset n'est pas encore
 *    préchargé (modèle async plateforme), préchargement puis création différée
 *    de quelques frames (scène d'émergence longue — écart invisible).
 *  - subspriteMode SUBSPRITES_IGNORE_PRIORITY → 'on' (modèle binaire repo).
 *  - fixedPriority bool. */
export function SetMewAboveGrass(): void {
  const rt = getRuntime();
  let mew = gObjectEvents[GetMewObjectEventId()];
  mew.invisible = false;
  if (VarGet(0x8004) /* gSpecialVar_0x8004 */ == 1)
  {
    // For after battle where Mew should still be present (e.g. if ran from battle)
    mew.fixedPriority = true;
    const mewSprite = gSprites[mew.spriteId];
    if (mewSprite) {
      mewSprite.subspriteMode = 'on'; // SUBSPRITES_IGNORE_PRIORITY (modèle binaire)
      mewSprite.subpriority = 1;
    }
  }
  else
  {
    // Mew emerging from grass when found
    // Also do field effect for grass shaking as it emerges
    VarSet(VAR_FARAWAY_ISLAND_STEP_COUNTER, 0xFFFF);
    mew.fixedPriority = true;
    const mewSprite = gSprites[mew.spriteId];
    if (mewSprite) {
      mewSprite.subspriteMode = 'on'; // SUBSPRITES_IGNORE_PRIORITY (modèle binaire)
      if (VarGet(0x800C) /* gSpecialVar_Facing */ != DIR_NORTH)
        mewSprite.subpriority = 1;
    }
    const palSlot = LoadGeneralFieldEffectPalette(1); // GENERAL_1 = gSpritePalette_GeneralFieldEffect1
    const world = SetSpritePosToOffsetMapCoords(mew.currentCoordsX, mew.currentCoordsY, 8, 8);
    const createGrass = (): void => {
      const parts = getFldEffLongGrassParts();
      if (!parts.ready) return;
      const result = rt.CreateSpriteAtOam({
        tileId: parts.tileStart,
        paletteBank: palSlot !== 0xFF ? palSlot : 0,
        x: world.x, y: world.y,
        shape: 0, size: 1, // 16×16
        priority: 2,       // 1:1 :405 sprite->oam.priority = 2
        paletteMode: 0, affineMode: 0,
        subpriority: Math.max(0, (mewSprite ? mewSprite.subpriority : 1) - 1),
        fromEnd: true,     // 1:1 CreateSpriteAtEnd
      });
      sGrassSpriteId = result.spriteId;
      const sprite = gSprites[sGrassSpriteId];
      if (sGrassSpriteId != MAX_SPRITES && sprite)
      {
        sprite.coordOffsetEnabled = true;
        sprite.callback = SpriteCallbackDummy as unknown as DecompSprite['callback'];
        setFieldEffectAnims(sprite, parts.anims, parts.tileStart);
      }
    };
    if (getFldEffLongGrassParts().ready) createGrass();
    else void preloadLongGrassEffect(rt).then(createGrass); // asset async (adaptation plateforme)
  }
}

/** 1:1 `void DestroyMewEmergingGrassSprite(void)` (faraway_island.c:411-415).
 *  Revue : DestroySprite(&gSprites[id]) → DestroySprite(id) (convention repo). */
export function DestroyMewEmergingGrassSprite(): void {
  if (sGrassSpriteId != MAX_SPRITES)
    DestroySprite(sGrassSpriteId);
}

/** 1:1 `static bool8 ShouldMewMoveNorth(struct ObjectEvent *mew, u8 index)` (faraway_island.c:417-426). */
function ShouldMewMoveNorth(mew: ObjectEvent, index: number): boolean {
  if (sPlayerToMewDeltaY > 0 && CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY - 1))
  {
    sMewDirectionCandidates[index] = DIR_NORTH;
    return true;
  }
  return false;
}

/** 1:1 `static bool8 ShouldMewMoveEast(struct ObjectEvent *mew, u8 index)` (faraway_island.c:428-437). */
function ShouldMewMoveEast(mew: ObjectEvent, index: number): boolean {
  if (sPlayerToMewDeltaX < 0 && CanMewMoveToCoords(mew.currentCoordsX + 1, mew.currentCoordsY))
  {
    sMewDirectionCandidates[index] = DIR_EAST;
    return true;
  }
  return false;
}

/** 1:1 `static bool8 ShouldMewMoveSouth(struct ObjectEvent *mew, u8 index)` (faraway_island.c:439-448). */
function ShouldMewMoveSouth(mew: ObjectEvent, index: number): boolean {
  if (sPlayerToMewDeltaY < 0 && CanMewMoveToCoords(mew.currentCoordsX, mew.currentCoordsY + 1))
  {
    sMewDirectionCandidates[index] = DIR_SOUTH;
    return true;
  }
  return false;
}

/** 1:1 `static bool8 ShouldMewMoveWest(struct ObjectEvent *mew, u8 index)` (faraway_island.c:450-459). */
function ShouldMewMoveWest(mew: ObjectEvent, index: number): boolean {
  if (sPlayerToMewDeltaX > 0 && CanMewMoveToCoords(mew.currentCoordsX - 1, mew.currentCoordsY))
  {
    sMewDirectionCandidates[index] = DIR_WEST;
    return true;
  }
  return false;
}

/** 1:1 `static u8 GetRandomMewDirectionCandidate(u8 numDirections)` (faraway_island.c:461-464). */
function GetRandomMewDirectionCandidate(numDirections: number): number {
  return sMewDirectionCandidates[VarGet(VAR_FARAWAY_ISLAND_STEP_COUNTER) % numDirections];
}
