/**
 * field-effect.ts — Port 1:1 strict `field_effect.c` minimal (= dispatcher
 * FieldEffectStart + gFieldEffectArguments + helpers communs).
 *
 * Source : D:/Projet 1/decomps/pokeemeraude/src/field_effect.c.
 *
 * Le décomp a un système complet de ~50 field effects avec scripts bytecode
 * dispatch (= `gFieldEffectScriptPointers[FLDEFF_X]`). Notre port :
 *
 *   - `gFieldEffectArguments[8]` : array de params globals (= u32 each).
 *     Les actions movement/script set ces args avant `FieldEffectStart(id)`.
 *   - `FieldEffectStart(id)` : dispatcher qui invoque le handler enregistré
 *     pour `FLDEFF_X` (= notre TS : Map<id, handler>).
 *
 * Effects portés 1:1 strict (= H3.4) :
 *   - FLDEFF_EXCLAMATION_MARK_ICON (0)  → SpawnEmoteSprite('exclamation')
 *   - FLDEFF_QUESTION_MARK_ICON (33)    → SpawnEmoteSprite('question')
 *   - FLDEFF_HEART_ICON (46)            → SpawnEmoteSprite('heart')
 *
 * Effects stub explicit (= cascade non-portée, marqué dette H3) :
 *   - FLDEFF_TREE_DISGUISE (28)         : sprite tree par-dessus NPC.
 *   - FLDEFF_MOUNTAIN_DISGUISE (29)     : sprite mountain par-dessus NPC.
 *   - FLDEFF_BERRY_TREE_GROWTH_SPARKLE (23) : sparkle anim au berry grow.
 *   - ~44 autres effects (= shadow, reflection, fishing, sparkle dust, etc.).
 *
 * Les emote/disguise actions movement appellent FieldEffectStart(FLDEFF_X)
 * directement après set gFieldEffectArguments[0..3]. Le port traduit ça :
 * args[0..2] = localId/mapNum/mapGroup typiquement.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { SpawnEmoteSprite, type EmoteType } from './field-effect-emotes';
import { FldEff_BerryTreeGrowthSparkle } from './field-effect-sparkle';
import { SpawnTallGrassEffect } from './field-effect-grass';
import { SpawnLongGrassEffect } from './field-effect-long-grass';
import { SpawnShortGrassEffect } from './field-effect-short-grass';
import { SpawnSplashEffect } from './field-effect-splash';
import { SpawnFootprintsEffect } from './field-effect-footprints';
import { SpawnJumpImpactEffect } from './field-effect-jump-impact';
import { SpawnJumpLandingDust } from './field-effect-jump-dust';
import { SpawnRippleEffect } from './field-effect-ripple';
import { MAP_OFFSET } from './map-loader';

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c:24). Params globals
 *  pour FieldEffectStart, set par caller avant FieldEffectStart(id). */
export const gFieldEffectArguments: number[] = new Array(8).fill(0);

/** 1:1 décomp `FLDEFF_*` constants (include/constants/field_effects.h). */
export const FLDEFF_EXCLAMATION_MARK_ICON      = 0;
export const FLDEFF_TALL_GRASS                 = 4;
export const FLDEFF_RIPPLE                     = 5;
export const FLDEFF_DUST                       = 10;
export const FLDEFF_JUMP_TALL_GRASS            = 12;
export const FLDEFF_SAND_FOOTPRINTS            = 13;
export const FLDEFF_JUMP_BIG_SPLASH            = 14;
export const FLDEFF_SPLASH                     = 15;
export const FLDEFF_JUMP_SMALL_SPLASH          = 16;
export const FLDEFF_LONG_GRASS                 = 17;
export const FLDEFF_JUMP_LONG_GRASS            = 18;
export const FLDEFF_BERRY_TREE_GROWTH_SPARKLE  = 23;
export const FLDEFF_DEEP_SAND_FOOTPRINTS       = 24;
export const FLDEFF_TREE_DISGUISE              = 28;
export const FLDEFF_MOUNTAIN_DISGUISE          = 29;
export const FLDEFF_QUESTION_MARK_ICON         = 33;
export const FLDEFF_FEET_IN_FLOWING_WATER      = 34;
export const FLDEFF_BIKE_TIRE_TRACKS           = 35;
export const FLDEFF_SAND_PILE                  = 39;
export const FLDEFF_SHORT_GRASS                = 41;
export const FLDEFF_HOT_SPRINGS_WATER          = 42;
export const FLDEFF_HEART_ICON                 = 46;
export const FLDEFF_BUBBLES                    = 53;

/** Runtime captured pour passer aux handlers qui need rt. Set par scene au boot. */
let _activeRuntime: DecompRuntime | null = null;

export function SetFieldEffectRuntime(rt: DecompRuntime): void {
  _activeRuntime = rt;
}

/** 1:1 décomp `FieldEffectStart(id)` (field_effect.c:172) :
 *    return gFieldEffectScriptPointers[id](&gFieldEffectArguments[0]);
 *
 *  Notre TS : dispatcher Map<id, handler>. Returns sprite ID (= MAX_SPRITES
 *  si pas de sprite spawné, sinon spriteId numeric).
 *
 *  Used par MovementAction_Emote* / Disguise / BerryTreeGrowth sparkle / etc. */
export function FieldEffectStart(id: number): number {
  const rt = _activeRuntime;
  if (!rt) {
    console.warn(`[FieldEffectStart] no active runtime — effect id=${id} skipped`);
    return 64;  // MAX_SPRITES sentinel
  }

  // ─── Emote icons (= EXCLAMATION_MARK / QUESTION_MARK / HEART) ──────────────
  // 1:1 décomp args setup par MovementAction_Emote* :
  //   ObjectEventGetLocalIdAndMap(obj, &args[0], &args[1], &args[2]);
  //   args[0] = localId, args[1] = mapNum, args[2] = mapGroup.
  if (id === FLDEFF_EXCLAMATION_MARK_ICON || id === FLDEFF_QUESTION_MARK_ICON || id === FLDEFF_HEART_ICON) {
    const localId = gFieldEffectArguments[0];
    let emoteType: EmoteType = 'exclamation';
    if (id === FLDEFF_QUESTION_MARK_ICON) emoteType = 'question';
    else if (id === FLDEFF_HEART_ICON) emoteType = 'heart';
    // 1:1 décomp `TryGetObjectEventIdByLocalIdAndMap(gFieldEffectArguments[0], ...)` :
    // match par numeric localId. Notre SpawnEmoteSprite accepte string | number ;
    // passer le numeric pour matcher les NPCs avec localIdRaw spécifique (=
    // `LOCALID_PLAYERS_HOUSE_1F_MOM` etc., dont notre construct `LOCALID_<n>`
    // jamais ne matchait avant). 0xFF reste LOCALID_PLAYER (sentinel).
    if (localId === 0xFF) {
      SpawnEmoteSprite(rt, 'LOCALID_PLAYER', emoteType);
    } else {
      SpawnEmoteSprite(rt, localId, emoteType);
    }
    return 64;  // emote sprite has its own management
  }

  // ─── Disguise / Sparkle (= dette H3 cascade R3 future port) ────────────────
  if (id === FLDEFF_TREE_DISGUISE) {
    // DETTE R3 : spawn tree sprite par-dessus NPC. Tree disguise visual.
    return 64;
  }
  if (id === FLDEFF_MOUNTAIN_DISGUISE) {
    // DETTE R3 : spawn mountain sprite par-dessus NPC. Mountain disguise visual.
    return 64;
  }
  if (id === FLDEFF_BERRY_TREE_GROWTH_SPARKLE) {
    // 1:1 décomp FldEff_BerryTreeGrowthSparkle (field_effect_helpers.c:1288) :
    // étoile scintillante au-dessus du berry tree qui pousse (args = coords + prio).
    return FldEff_BerryTreeGrowthSparkle(rt, gFieldEffectArguments);
  }

  // ─── Ground effects (spine DoGroundEffects, event_object_movement.c) ─────────
  // 1:1 décomp : les `GroundEffect_*` settent gFieldEffectArguments puis
  // FieldEffectStart(FLDEFF_X) → gFieldEffectScriptPointers[X] → FldEff_X. Notre
  // dispatcher route vers les FldEff portés. Les args[0]/[1] sont en coords
  // INTERNAL (= currentCoords.x/y, +MAP_OFFSET) côté décomp ; nos spawners
  // (SpawnTallGrassEffect/SpawnJumpLandingDust) prennent du LOGICAL et re-ajoutent
  // MAP_OFFSET → on retire MAP_OFFSET ici (1:1 net).
  if (id === FLDEFF_TALL_GRASS) {
    // 1:1 décomp FldEff_TallGrass (field_effect_helpers.c:291). args[7] = skip-to-end
    // (SPAWN = overlay statique) vs 0 (STEP = rustle anim). args[4]=(localId<<8)|mapNum,
    // args[5]=mapGroup = l'OWNER de l'effet (player ou NPC) → tracking 1:1 par object event.
    const ownerLocalId = (gFieldEffectArguments[4] >> 8) & 0xFF;
    const ownerMapNum = gFieldEffectArguments[4] & 0xFF;
    const ownerMapGroup = gFieldEffectArguments[5] & 0xFF;
    const elevation = gFieldEffectArguments[2];
    SpawnTallGrassEffect(rt, gFieldEffectArguments[0] - MAP_OFFSET, gFieldEffectArguments[1] - MAP_OFFSET, gFieldEffectArguments[7] !== 0, ownerLocalId, ownerMapNum, ownerMapGroup, elevation);
    return 64;
  }
  if (id === FLDEFF_DUST) {
    // 1:1 décomp FldEff_Dust (field_effect_helpers.c:1180) — nuage d'atterrissage de saut.
    SpawnJumpLandingDust(rt, gFieldEffectArguments[0] - MAP_OFFSET, gFieldEffectArguments[1] - MAP_OFFSET);
    return 64;
  }
  if (id === FLDEFF_LONG_GRASS) {
    // 1:1 décomp FldEff_LongGrass (field_effect_helpers.c:395). args identiques à TALL_GRASS
    // (owner = (localId<<8)|mapNum en [4], mapGroup [5], elevation [2], [7]=skip-to-end).
    const ownerLocalId = (gFieldEffectArguments[4] >> 8) & 0xFF;
    const ownerMapNum = gFieldEffectArguments[4] & 0xFF;
    const ownerMapGroup = gFieldEffectArguments[5] & 0xFF;
    const elevation = gFieldEffectArguments[2];
    SpawnLongGrassEffect(rt, gFieldEffectArguments[0] - MAP_OFFSET, gFieldEffectArguments[1] - MAP_OFFSET, gFieldEffectArguments[7] !== 0, ownerLocalId, ownerMapNum, ownerMapGroup, elevation);
    return 64;
  }
  if (id === FLDEFF_JUMP_TALL_GRASS || id === FLDEFF_JUMP_LONG_GRASS
      || id === FLDEFF_JUMP_SMALL_SPLASH || id === FLDEFF_JUMP_BIG_SPLASH) {
    // 1:1 décomp FldEff_Jump* (UpdateJumpImpactEffect). args[0/1] = coords INTERNAL
    // (currentCoords, SetSpritePosToOffsetMapCoords les prend telles quelles), [2]=elevation,
    // [3]=priority. Module générique config-driven (jump tall/long grass + small/big splash).
    SpawnJumpImpactEffect(rt, id, gFieldEffectArguments[0], gFieldEffectArguments[1], gFieldEffectArguments[2], gFieldEffectArguments[3]);
    return 64;
  }
  if (id === FLDEFF_SAND_FOOTPRINTS || id === FLDEFF_DEEP_SAND_FOOTPRINTS || id === FLDEFF_BIKE_TIRE_TRACKS) {
    // 1:1 décomp FldEff_{Sand,DeepSand}Footprints / BikeTireTracks (UpdateFootprintsTireTracks).
    // args[0/1] = previousCoords INTERNAL, [2]=subprio(149), [3]=priority(2), [4]=animIdx (direction).
    SpawnFootprintsEffect(rt, id, gFieldEffectArguments[0], gFieldEffectArguments[1], gFieldEffectArguments[2], gFieldEffectArguments[3], gFieldEffectArguments[4]);
    return 64;
  }
  if (id === FLDEFF_SPLASH || id === FLDEFF_FEET_IN_FLOWING_WATER) {
    // 1:1 décomp FldEff_Splash (642) / FldEff_FeetInFlowingWater (725) : partagent l'asset
    // splash (anim 0 one-shot vs anim 1 loop). args[0..2] = localId/mapNum/mapGroup (Start
    // FieldEffectForObjectEvent). Suivent le sprite du parent.
    SpawnSplashEffect(rt, id, gFieldEffectArguments[0], gFieldEffectArguments[1], gFieldEffectArguments[2]);
    return 64;
  }
  if (id === FLDEFF_SHORT_GRASS) {
    // 1:1 décomp FldEff_ShortGrass (field_effect_helpers.c:492). args[0..2] = localId/mapNum/
    // mapGroup de l'owner (StartFieldEffectForObjectEvent), PAS des coords → pas de MAP_OFFSET.
    SpawnShortGrassEffect(rt, gFieldEffectArguments[0], gFieldEffectArguments[1], gFieldEffectArguments[2]);
    return 64;
  }
  if (id === FLDEFF_RIPPLE) {
    // 1:1 décomp FldEff_Ripple (field_effect_helpers.c:780) : ondulation d'eau 16×16.
    // args[0/1] = coords MONDE (DoRippleFieldEffect a converti écran→monde), [2]=subprio,
    // [3]=priority. coordOffsetEnabled posé par SpawnRippleEffect → suit la caméra.
    SpawnRippleEffect(rt, gFieldEffectArguments[0], gFieldEffectArguments[1], gFieldEffectArguments[2], gFieldEffectArguments[3]);
    return 64;
  }

  // ─── Ground effects pas encore portés (= dette field_effect_helpers.c) ──────
  // La STRUCTURE 1:1 du spine les déclenche déjà (GroundEffect_* → FieldEffectStart) ;
  // seul le FldEff visuel manque (ports tier A/B à venir : reflets, ripple, long/short
  // grass, footprints, splash, sand pile, hot springs, bubbles, flowing water…).
  // Pas de warn (ces effets peuvent fire à chaque pas sur eau/sable → spam) — on
  // retourne le sentinel MAX_SPRITES silencieusement.
  switch (id) {
    case FLDEFF_SAND_PILE:
    case FLDEFF_HOT_SPRINGS_WATER:
    case FLDEFF_BUBBLES:
      return 64;
  }

  // ─── Effects non encore portés (= dette R3) ────────────────────────────────
  console.warn(`[FieldEffectStart] FLDEFF id=${id} not yet ported — dette R3`);
  return 64;
}

/** Reset les arguments à 0 — call par certains handlers post-exec. */
export function ClearFieldEffectArguments(): void {
  for (let i = 0; i < 8; i++) gFieldEffectArguments[i] = 0;
}
