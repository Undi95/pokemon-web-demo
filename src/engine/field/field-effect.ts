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
 *   - FLDEFF_EXCLAMATION_MARK_ICON (0)  → FldEff_ExclamationMarkIcon (game/trainer_see.ts)
 *   - FLDEFF_QUESTION_MARK_ICON (33)    → FldEff_QuestionMarkIcon (game/trainer_see.ts)
 *   - FLDEFF_HEART_ICON (46)            → FldEff_HeartIcon (game/trainer_see.ts)
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

import type { DecompRuntime, DecompSprite } from '../system/decomp-runtime';
import { FieldEffectActiveListRemove } from './field-effect-active-list';
import { FldEff_ExclamationMarkIcon, FldEff_QuestionMarkIcon, FldEff_HeartIcon } from '../../game/trainer_see';
import {
  FldEff_SandPile, FldEff_HotSpringsWater, FldEff_Ripple, FldEff_ShortGrass, FldEff_Bubbles,
  FldEff_Splash, FldEff_FeetInFlowingWater,
  FldEff_JumpTallGrass, FldEff_JumpLongGrass, FldEff_JumpSmallSplash, FldEff_JumpBigSplash,
  FldEff_Ash, FldEff_BerryTreeGrowthSparkle, FldEff_Sparkle,
  ShowTreeDisguiseFieldEffect, ShowMountainDisguiseFieldEffect, ShowSandDisguiseFieldEffect,
  FldEff_TallGrass, FldEff_LongGrass, FldEff_Dust,
  FldEff_SandFootprints, FldEff_DeepSandFootprints, FldEff_BikeTireTracks,
  FldEff_SurfBlob,
  FldEff_UnusedGrass, FldEff_UnusedGrass2, FldEff_UnusedSand, FldEff_WaterSurfacing,
} from '../../game/field_effect_helpers';

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c:24). Params globals
 *  pour FieldEffectStart, set par caller avant FieldEffectStart(id). */
export const gFieldEffectArguments: number[] = new Array(8).fill(0);

/** 1:1 décomp `FLDEFF_*` constants (include/constants/field_effects.h). */
export const FLDEFF_EXCLAMATION_MARK_ICON      = 0;
export const FLDEFF_TALL_GRASS                 = 4;
export const FLDEFF_RIPPLE                     = 5;
export const FLDEFF_ASH                        = 7;
export const FLDEFF_SURF_BLOB                  = 8;
export const FLDEFF_DUST                       = 10;
export const FLDEFF_JUMP_TALL_GRASS            = 12;
export const FLDEFF_SAND_FOOTPRINTS            = 13;
export const FLDEFF_JUMP_BIG_SPLASH            = 14;
export const FLDEFF_SPLASH                     = 15;
export const FLDEFF_JUMP_SMALL_SPLASH          = 16;
export const FLDEFF_LONG_GRASS                 = 17;
export const FLDEFF_JUMP_LONG_GRASS            = 18;
export const FLDEFF_UNUSED_GRASS               = 19;
export const FLDEFF_UNUSED_GRASS_2             = 20;
export const FLDEFF_UNUSED_SAND                = 21;
export const FLDEFF_WATER_SURFACING            = 22;
export const FLDEFF_BERRY_TREE_GROWTH_SPARKLE  = 23;
export const FLDEFF_DEEP_SAND_FOOTPRINTS       = 24;
export const FLDEFF_TREE_DISGUISE              = 28;
export const FLDEFF_MOUNTAIN_DISGUISE          = 29;
export const FLDEFF_SAND_DISGUISE              = 36;
export const FLDEFF_QUESTION_MARK_ICON         = 33;
export const FLDEFF_FEET_IN_FLOWING_WATER      = 34;
export const FLDEFF_BIKE_TIRE_TRACKS           = 35;
export const FLDEFF_SAND_PILE                  = 39;
export const FLDEFF_SHORT_GRASS                = 41;
export const FLDEFF_HOT_SPRINGS_WATER          = 42;
export const FLDEFF_HEART_ICON                 = 46;
export const FLDEFF_BUBBLES                    = 53;
export const FLDEFF_SPARKLE                    = 54;

/** Runtime captured pour passer aux handlers qui need rt. Set par scene au boot. */
let _activeRuntime: DecompRuntime | null = null;

export function SetFieldEffectRuntime(rt: DecompRuntime): void {
  _activeRuntime = rt;
}

/** 1:1 décomp `FieldEffectStop(sprite, fieldEffectId)` (field_effect.c:380) :
 *    FieldEffectFreeGraphicsResources(sprite);   // free sheet/palette si plus aucun user
 *    FieldEffectActiveListRemove(fieldEffectId);
 *
 *  Adaptation : on ne libère PAS le sheet/palette (préchargé une fois, partagé par tous
 *  les sprites du même effet — réutilisé). On fait juste DestroySprite (= invisible OAM +
 *  inUse=false + callback=null, 1:1 décomp DestroySprite) + retrait de l'active-list.
 *  Appelé par les UpdateXFieldEffect de field_effect_helpers.ts quand l'effet se termine. */
export function FieldEffectStop(rt: DecompRuntime, sprite: DecompSprite, fieldEffectId: number): void {
  rt.DestroySprite(sprite.spriteId);
  FieldEffectActiveListRemove(fieldEffectId);
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
  // 1:1 décomp trainer_see.c : FldEff_*Icon (migré dans game/trainer_see.ts, vrai callback
  // SpriteCB_TrainerIcons). Les MovementAction_Emote* ont posé gFieldEffectArguments[0..2] =
  // localId/mapNum/mapGroup de l'object event (le callback retrouve l'OE via
  // TryGetObjectEventIdByLocalIdAndMap).
  if (id === FLDEFF_EXCLAMATION_MARK_ICON) return FldEff_ExclamationMarkIcon(rt);
  if (id === FLDEFF_QUESTION_MARK_ICON) return FldEff_QuestionMarkIcon(rt);
  if (id === FLDEFF_HEART_ICON) return FldEff_HeartIcon(rt);

  // ─── Disguises tree/mountain/sand (1:1 ShowDisguiseFieldEffect) ─────────────
  // args[0..2] = localId/mapNum/mapGroup ; le sprite recouvre le NPC + suit. Retourne le
  // spriteId (le caller MovementAction le stocke dans objectEvent.fieldEffectSpriteId).
  if (id === FLDEFF_TREE_DISGUISE) {
    return ShowTreeDisguiseFieldEffect(rt);
  }
  if (id === FLDEFF_MOUNTAIN_DISGUISE) {
    return ShowMountainDisguiseFieldEffect(rt);
  }
  if (id === FLDEFF_SAND_DISGUISE) {
    return ShowSandDisguiseFieldEffect(rt);
  }
  if (id === FLDEFF_BERRY_TREE_GROWTH_SPARKLE) {
    // 1:1 décomp FldEff_BerryTreeGrowthSparkle (field_effect_helpers.c:1288) — migré dans
    // game/field_effect_helpers.ts (lit gFieldEffectArguments).
    return FldEff_BerryTreeGrowthSparkle(rt);
  }
  if (id === FLDEFF_SPARKLE) {
    // 1:1 décomp FldEff_Sparkle (field_effect_helpers.c:1417) — migré dans
    // game/field_effect_helpers.ts (lit gFieldEffectArguments, +MAP_OFFSET interne).
    return FldEff_Sparkle(rt);
  }

  // ─── Ground effects (spine DoGroundEffects, event_object_movement.c) ─────────
  // 1:1 décomp : les `GroundEffect_*` settent gFieldEffectArguments puis
  // FieldEffectStart(FLDEFF_X) → gFieldEffectScriptPointers[X] → FldEff_X. Notre
  // dispatcher route vers les FldEff portés. Les args[0]/[1] sont en coords
  // INTERNAL (= currentCoords.x/y, +MAP_OFFSET) côté décomp ; nos spawners
  // (SpawnTallGrassEffect/SpawnJumpLandingDust) prennent du LOGICAL et re-ajoutent
  // MAP_OFFSET → on retire MAP_OFFSET ici (1:1 net).
  if (id === FLDEFF_TALL_GRASS) {
    // 1:1 décomp FldEff_TallGrass (field_effect_helpers.c:291) — migré dans
    // game/field_effect_helpers.ts (lit gFieldEffectArguments, args INTERNAL).
    return FldEff_TallGrass(rt);
  }
  if (id === FLDEFF_DUST) {
    // 1:1 décomp FldEff_Dust (field_effect_helpers.c:1180) — migré dans
    // game/field_effect_helpers.ts (jump-impact config-driven, args INTERNAL).
    return FldEff_Dust(rt);
  }
  if (id === FLDEFF_LONG_GRASS) {
    // 1:1 décomp FldEff_LongGrass (field_effect_helpers.c:395) — migré dans
    // game/field_effect_helpers.ts (lit gFieldEffectArguments, args INTERNAL).
    return FldEff_LongGrass(rt);
  }
  if (id === FLDEFF_JUMP_TALL_GRASS) return FldEff_JumpTallGrass(rt);
  if (id === FLDEFF_JUMP_LONG_GRASS) return FldEff_JumpLongGrass(rt);
  if (id === FLDEFF_JUMP_SMALL_SPLASH) return FldEff_JumpSmallSplash(rt);
  if (id === FLDEFF_JUMP_BIG_SPLASH) {
    // 1:1 décomp FldEff_Jump* (field_effect_helpers.c:359/468/684/701) : impact de saut sur
    // herbe/eau, partagent UpdateJumpImpactEffect. Lisent gFieldEffectArguments[0/1]=coords
    // INTERNAL, [2]=elevation, [3]=priority (config-driven dans le miroir).
    return FldEff_JumpBigSplash(rt);
  }
  if (id === FLDEFF_SAND_FOOTPRINTS) return FldEff_SandFootprints(rt);
  if (id === FLDEFF_DEEP_SAND_FOOTPRINTS) return FldEff_DeepSandFootprints(rt);
  if (id === FLDEFF_BIKE_TIRE_TRACKS) {
    // 1:1 décomp FldEff_{Sand,DeepSand}Footprints / BikeTireTracks (field_effect_helpers.c:554/571/588)
    // — migrés dans game/field_effect_helpers.ts (args[0/1] INTERNAL, [2]=subprio, [3]=priority, [4]=anim).
    return FldEff_BikeTireTracks(rt);
  }
  if (id === FLDEFF_SPLASH) {
    // 1:1 décomp FldEff_Splash (field_effect_helpers.c:642) : éclaboussure one-shot qui suit le
    // parent (anim 0). Lit gFieldEffectArguments[0..2] = localId/mapNum/mapGroup.
    return FldEff_Splash(rt);
  }
  if (id === FLDEFF_FEET_IN_FLOWING_WATER) {
    // 1:1 décomp FldEff_FeetInFlowingWater (field_effect_helpers.c:725) : éclaboussure aux pieds
    // (anim 1 loop) sur eau peu profonde qui coule. Lit gFieldEffectArguments[0..2].
    return FldEff_FeetInFlowingWater(rt);
  }
  if (id === FLDEFF_SHORT_GRASS) {
    // 1:1 décomp FldEff_ShortGrass (field_effect_helpers.c:492). Lit gFieldEffectArguments[0..2]
    // = localId/mapNum/mapGroup → touffe d'herbe basse qui suit le parent (Route 110…).
    return FldEff_ShortGrass(rt);
  }
  if (id === FLDEFF_SAND_PILE) {
    // 1:1 décomp FldEff_SandPile (field_effect_helpers.c:1204). Lit gFieldEffectArguments[0..2]
    // = localId/mapNum/mapGroup de l'owner → suit le sprite parent sur sable profond.
    return FldEff_SandPile(rt);
  }
  if (id === FLDEFF_HOT_SPRINGS_WATER) {
    // 1:1 décomp FldEff_HotSpringsWater (field_effect_helpers.c:800). Lit gFieldEffectArguments[0..2]
    // = localId/mapNum/mapGroup → nappe d'eau chaude qui suit le joueur assis (Lavaridge).
    return FldEff_HotSpringsWater(rt);
  }
  if (id === FLDEFF_BUBBLES) {
    // 1:1 décomp FldEff_Bubbles (field_effect_helpers.c:1258). Lit gFieldEffectArguments[0/1]
    // = coords MAP de l'objet (GroundEffect_Seaweed) → colonne de bulles 16×32 (plongée).
    return FldEff_Bubbles(rt);
  }
  if (id === FLDEFF_ASH) {
    // 1:1 décomp FldEff_Ash (field_effect_helpers.c:926). Lit gFieldEffectArguments[0/1]=x/y map,
    // [2]=subprio, [3]=priority, [4]=metatileId, [5]=delay → nuage de cendre + révèle la tuile
    // ashgrass (Route 113/Fallarbor/Lavaridge).
    return FldEff_Ash(rt);
  }
  if (id === FLDEFF_SURF_BLOB) {
    // 1:1 décomp FldEff_SurfBlob (field_effect_helpers.c:999) — migré dans game/field_effect_helpers.ts.
    // Retourne le spriteId du blob (le code de surf l'utilise pour SetSurfBlob_*).
    return FldEff_SurfBlob(rt);
  }
  if (id === FLDEFF_RIPPLE) {
    // 1:1 décomp FldEff_Ripple (field_effect_helpers.c:780) : ondulation d'eau 16×16.
    // Lit gFieldEffectArguments[0/1]=monde, [2]=subprio, [3]=priority → one-shot
    // (WaitFieldEffectSpriteAnim auto-despawn). coordOffsetEnabled=TRUE → suit la caméra.
    return FldEff_Ripple(rt);
  }
  // ─── Effets MORTS (0 caller en Émeraude, anims en boucle infinie = jamais despawn).
  //   Portés 1:1 pour la complétude (field_effect_helpers.c:844-908). ──
  if (id === FLDEFF_UNUSED_GRASS) return FldEff_UnusedGrass(rt);
  if (id === FLDEFF_UNUSED_GRASS_2) return FldEff_UnusedGrass2(rt);
  if (id === FLDEFF_UNUSED_SAND) return FldEff_UnusedSand(rt);
  if (id === FLDEFF_WATER_SURFACING) return FldEff_WaterSurfacing(rt);

  // ─── FldEff field_effect_helpers.c pas encore portés (= dette restante) ─────
  // La STRUCTURE 1:1 du spine les déclenche déjà (GroundEffect_* → FieldEffectStart /
  // scripts) ; seul le FldEff visuel manque. RESTE : shadow (stub à refaire),
  // + RayquazaSpotlight (field_effect.c). Le warn signale la dette (utile pour repérer
  // un trigger atteint) — fire rarement (maps spécifiques).
  console.warn(`[FieldEffectStart] FLDEFF id=${id} not yet ported — dette R3`);
  return 64;
}

/** Reset les arguments à 0 — call par certains handlers post-exec. */
export function ClearFieldEffectArguments(): void {
  for (let i = 0; i < 8; i++) gFieldEffectArguments[i] = 0;
}
