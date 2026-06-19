/**
 * field_effect.ts — Port 1:1 strict `field_effect.c` minimal (= dispatcher
 * FieldEffectStart + gFieldEffectArguments + helpers communs).
 *
 * NB anti-cycle : `sActiveList[32]` + FieldEffectActiveList* (field_effect.c:846-886)
 * restent dans le leaf `engine/field/field-effect-active-list.ts` (zéro import) car
 * field_effect_helpers les consomme — les fusionner ici créerait field_effect ↔
 * field_effect_helpers (même logique que direction-coords gardé en foundation).
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

import type { DecompRuntime, DecompSprite } from '../engine/system/decomp-runtime';
import { FieldEffectActiveListRemove } from '../engine/field/field-effect-active-list';
import { GetSpritePaletteTagByPaletteNum, FreeSpritePaletteByTag, TAG_NONE } from '../engine/system/sprite';
import { FldEff_ExclamationMarkIcon, FldEff_QuestionMarkIcon, FldEff_HeartIcon } from './trainer_see';
import {
  FldEff_SandPile, FldEff_HotSpringsWater, FldEff_Ripple, FldEff_ShortGrass, FldEff_Bubbles,
  FldEff_Splash, FldEff_FeetInFlowingWater,
  FldEff_JumpTallGrass, FldEff_JumpLongGrass, FldEff_JumpSmallSplash, FldEff_JumpBigSplash,
  FldEff_Ash, FldEff_BerryTreeGrowthSparkle, FldEff_Sparkle,
  ShowTreeDisguiseFieldEffect, ShowMountainDisguiseFieldEffect, ShowSandDisguiseFieldEffect,
  FldEff_TallGrass, FldEff_LongGrass, FldEff_Dust,
  FldEff_SandFootprints, FldEff_DeepSandFootprints, FldEff_BikeTireTracks,
  FldEff_SurfBlob, FldEff_UseSurf, FldEff_UseWaterfall, FldEff_UseDive,
  FldEff_UnusedGrass, FldEff_UnusedGrass2, FldEff_UnusedSand, FldEff_WaterSurfacing,
  FldEff_Shadow,
  LoadGeneralFieldEffectPalette,
} from './field_effect_helpers';
import { FldEff_UseCutOnTree } from './fldeff_cut';
import { FldEff_UseRockSmash } from './fldeff_rocksmash';
import { FldEff_SweetScent } from './fldeff_sweetscent';
import { FldEff_UseTeleport } from './fldeff_teleport';
import { FldEff_UseDig } from './fldeff_dig';
// Side-effect : charge game/fldeff_flash.ts → expose __FieldCallback_Flash sur
// globalThis (le move FLASH n'a PAS de FLDEFF dispatch — FldEff_UseFlash est un
// callback de field-move task, pas un FieldEffectStart, cf. fldeff_flash.c:87).
import './fldeff_flash';

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c:24). Params globals
 *  pour FieldEffectStart, set par caller avant FieldEffectStart(id). */
export const gFieldEffectArguments: number[] = new Array(8).fill(0);

/** 1:1 décomp `FLDEFF_*` constants (include/constants/field_effects.h). */
export const FLDEFF_EXCLAMATION_MARK_ICON      = 0;
export const FLDEFF_USE_CUT_ON_TREE            = 2;
export const FLDEFF_SHADOW                     = 3;
export const FLDEFF_TALL_GRASS                 = 4;
export const FLDEFF_RIPPLE                     = 5;
export const FLDEFF_ASH                        = 7;
export const FLDEFF_SURF_BLOB                  = 8;
export const FLDEFF_USE_SURF                   = 9;
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
export const FLDEFF_USE_ROCK_SMASH             = 37;
export const FLDEFF_SWEET_SCENT                = 51;
export const FLDEFF_USE_TELEPORT               = 63;
export const FLDEFF_USE_DIG                    = 38;
export const FLDEFF_HOT_SPRINGS_WATER          = 42;
export const FLDEFF_USE_WATERFALL              = 43;
export const FLDEFF_USE_DIVE                   = 44;
export const FLDEFF_HEART_ICON                 = 46;
export const FLDEFF_BUBBLES                    = 53;
export const FLDEFF_SPARKLE                    = 54;

/** Runtime captured pour passer aux handlers qui need rt. Set par scene au boot. */
let _activeRuntime: DecompRuntime | null = null;

export function SetFieldEffectRuntime(rt: DecompRuntime): void {
  _activeRuntime = rt;
}

/** 1:1 décomp `FieldEffectFreePaletteIfUnused(u8 paletteNum)` (field_effect.c:832) :
 *  libère le slot de palette OBJ ssi PLUS AUCUN sprite in-use ne le porte.
 *
 *  ⚠️ Naturellement SÛR pour les slots RÉSERVÉS [0,12) : `FreeSpritePaletteByTag` →
 *  `IndexOfSpritePaletteTag` ne scanne QUE [gReservedSpritePaletteCount, 16) → un slot réservé
 *  (blob→0, emote→0, cœur→2, NPC palettes) est INVISIBLE → free = no-op (1:1 décomp). Ne libère
 *  donc EFFECTIVEMENT que les slots dynamiques [12,16) (GENERAL_0/1, small sparkle…) quand
 *  plus aucun sprite ne les utilise → la zone dynamique respire comme la décomp (future-proof). */
export function FieldEffectFreePaletteIfUnused(rt: DecompRuntime, paletteNum: number): void {
  const tag = GetSpritePaletteTagByPaletteNum(paletteNum);
  if (tag === TAG_NONE) return;
  // 1:1 décomp : si un autre sprite in-use porte ce paletteNum → ne pas libérer.
  for (const s of rt.gSprites.values()) {
    if (!s.inUse) continue;
    const oam = rt.gba.oam[s.oamIndex];
    if (oam && oam.paletteBank === paletteNum) return;
  }
  FreeSpritePaletteByTag(tag);
}

/** 1:1 décomp `FieldEffectFreeGraphicsResources(struct Sprite *sprite)` (field_effect.c:803) :
 *  lit le paletteNum AVANT DestroySprite, détruit, puis libère la palette si inutilisée.
 *
 *  ⚠️ DÉVIATION assumée : on ne libère PAS les tiles (`FieldEffectFreeTilesIfUnused`) — nos sheets
 *  sont préchargées RÉSIDENTES (LoadSpriteSheet une fois, PAS via FieldEffectScript_LoadTiles) ;
 *  les libérer orphelinerait les `_xTileStart`. Seules les PALETTES saturent [12,16). */
export function FieldEffectFreeGraphicsResources(rt: DecompRuntime, sprite: DecompSprite): void {
  const oam = rt.gba.oam[sprite.oamIndex];
  const paletteNum = oam ? oam.paletteBank : 0xFF;
  rt.DestroySprite(sprite.spriteId);
  FieldEffectFreePaletteIfUnused(rt, paletteNum);
}

/** 1:1 décomp `FieldEffectStop(sprite, fieldEffectId)` (field_effect.c:380) :
 *    FieldEffectFreeGraphicsResources(sprite);   // free palette si plus aucun user
 *    FieldEffectActiveListRemove(fieldEffectId);
 *  Appelé par les UpdateXFieldEffect de field_effect_helpers.ts quand l'effet se termine. */
export function FieldEffectStop(rt: DecompRuntime, sprite: DecompSprite, fieldEffectId: number): void {
  FieldEffectFreeGraphicsResources(rt, sprite);
  FieldEffectActiveListRemove(fieldEffectId);
}

/** 1:1 décomp `FieldEffectStart(id)` (field_effect.c:172) :
 *    return gFieldEffectScriptPointers[id](&gFieldEffectArguments[0]);
 *
 *  Notre TS : dispatcher Map<id, handler>. Returns sprite ID (= MAX_SPRITES
 *  si pas de sprite spawné, sinon spriteId numeric).
 *
 *  Used par MovementAction_Emote* / Disguise / BerryTreeGrowth sparkle / etc. */
// Expose `FieldEffectStart` au runtime de scripts : l'opcode `dofieldeffect` (1:1 décomp
// `ScrCmd_dofieldeffect`, scrcmd.c:1973 → `FieldEffectStart(id)`) le lit via `globalThis.FieldEffectStart`.
// Sans cette exposition, les field moves scriptés (Surf/Cut/Fly/Strength/Rock Smash…) étaient SKIPPÉS
// (l'opcode warn « FieldEffectStart not exposed »). Le dispatcher gère gracieusement les FLDEFF non portés.
(globalThis as Record<string, unknown>).FieldEffectStart = FieldEffectStart;

// ════════════════════════════════════════════════════════════════════════════
//  1:1 décomp `FieldEffectScript` bytecode (field_effect.c:166-805 + data/field_effect_scripts.s)
//  Décomp : `FieldEffectStart(id)` = `while (gFieldEffectScriptFuncs[*script](&script, &val))`,
//  où `gFieldEffectScriptPointers[id]` est un bytecode (opcodes loadtiles/loadfadedpal/loadpal/
//  callnative/end/loadgfx_callnative/loadtiles_callnative/loadfadedpal_callnative).
//  Notre port : les scripts sont des tableaux de commandes (les ptrs sheet/pal/native deviennent
//  des thunks JS). FieldEffectStart exécute le script s'il existe (effets MIGRÉS), sinon retombe
//  sur le dispatcher if-chain (effets pas encore migrés — migration incrémentale, dual-path).
//  `loadtiles` n'est PAS porté : nos sheets sont préchargées RÉSIDENTES (LoadSpriteSheet, ≠
//  FieldEffectScript_LoadTiles) — déviation documentée, les tiles ne saturent pas.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 commandes `gFieldEffectScriptFuncs[]` (field_effect.c:274). `loadfadedpal`/`loadpal`
 *  portent un thunk qui charge la palette (LoadSpritePalette[+weather], dédup) ; `callnative`
 *  porte la fonction native FldEff_X. Le FldEff lit ensuite le slot via IndexOfSpritePaletteTag
 *  (= 1:1 résolution du `template.paletteTag`). */
type FieldEffectScriptCmd =
  | { op: 'loadfadedpal'; loadPal: () => number }   // 1:1 FieldEffectScript_LoadFadedPalette (field_effect.c:781)
  | { op: 'loadpal'; loadPal: () => number }        // 1:1 FieldEffectScript_LoadPalette (field_effect.c:789, sans weather)
  | { op: 'callnative'; native: (rt: DecompRuntime) => number }  // 1:1 FieldEffectScript_CallNative (field_effect.c:795)
  | { op: 'end' };                                  // 1:1 FieldEffectCmd_end (field_effect.c:734)

/** 1:1 `gFieldEffectScriptPointers[]` (data/field_effect_scripts.s) — entrées MIGRÉES au bytecode.
 *  Famille GENERAL (`field_eff_loadfadedpal_callnative GENERAL_N, FldEff_X`). Les G0/G1 sont 1:1
 *  les scripts décomp. Les effets absents de cette table passent par le dispatcher if-chain. */
const gFieldEffectScriptPointers: Partial<Record<number, FieldEffectScriptCmd[]>> = {
  [FLDEFF_TALL_GRASS]:           [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_TallGrass }, { op: 'end' }],
  [FLDEFF_LONG_GRASS]:           [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_LongGrass }, { op: 'end' }],
  [FLDEFF_SHORT_GRASS]:          [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_ShortGrass }, { op: 'end' }],
  [FLDEFF_RIPPLE]:               [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_Ripple }, { op: 'end' }],
  [FLDEFF_ASH]:                  [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_Ash }, { op: 'end' }],
  [FLDEFF_HOT_SPRINGS_WATER]:    [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_HotSpringsWater }, { op: 'end' }],
  [FLDEFF_DUST]:                 [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_Dust }, { op: 'end' }],
  [FLDEFF_SAND_FOOTPRINTS]:      [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_SandFootprints }, { op: 'end' }],
  [FLDEFF_DEEP_SAND_FOOTPRINTS]: [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_DeepSandFootprints }, { op: 'end' }],
  [FLDEFF_BIKE_TIRE_TRACKS]:     [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_BikeTireTracks }, { op: 'end' }],
  [FLDEFF_JUMP_TALL_GRASS]:      [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_JumpTallGrass }, { op: 'end' }],
  [FLDEFF_JUMP_LONG_GRASS]:      [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_JumpLongGrass }, { op: 'end' }],
  [FLDEFF_JUMP_BIG_SPLASH]:      [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_JumpBigSplash }, { op: 'end' }],
  [FLDEFF_JUMP_SMALL_SPLASH]:    [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_JumpSmallSplash }, { op: 'end' }],
  [FLDEFF_SPLASH]:               [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_Splash }, { op: 'end' }],
  [FLDEFF_FEET_IN_FLOWING_WATER]:[{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_FeetInFlowingWater }, { op: 'end' }],
  [FLDEFF_SAND_PILE]:            [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_SandPile }, { op: 'end' }],
  [FLDEFF_BUBBLES]:              [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_Bubbles }, { op: 'end' }],
};

/** 1:1 décomp boucle d'interprétation `FieldEffectStart` (field_effect.c:166) :
 *  `while (gFieldEffectScriptFuncs[*script](&script, &val)); return val;`. */
function _runFieldEffectScript(rt: DecompRuntime, script: FieldEffectScriptCmd[]): number {
  let val = 0;
  for (const cmd of script) {
    if (cmd.op === 'end') break;                       // FieldEffectCmd_end → FALSE (sort de la boucle)
    else if (cmd.op === 'loadfadedpal') cmd.loadPal(); // FieldEffectScript_LoadFadedPalette
    else if (cmd.op === 'loadpal') cmd.loadPal();      // FieldEffectScript_LoadPalette
    else if (cmd.op === 'callnative') val = cmd.native(rt); // FieldEffectScript_CallNative
  }
  return val;
}

export function FieldEffectStart(id: number): number {
  const rt = _activeRuntime;
  if (!rt) {
    console.warn(`[FieldEffectStart] no active runtime — effect id=${id} skipped`);
    return 64;  // MAX_SPRITES sentinel
  }

  // 1:1 décomp : exécute le bytecode `gFieldEffectScriptPointers[id]` s'il existe (effets migrés).
  // Sinon, dispatcher if-chain ci-dessous (effets pas encore migrés — dual-path incrémental).
  const script = gFieldEffectScriptPointers[id];
  if (script) return _runFieldEffectScript(rt, script);

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
  if (id === FLDEFF_USE_SURF) {
    // 1:1 décomp FldEff_UseSurf (field_effect.c:2985) — migré dans game/field_effect_helpers.ts.
    // Crée Task_SurfFieldEffect (montée de surf : pose → saut sur blob → assis+bobbing).
    return FldEff_UseSurf(rt);
  }
  if (id === FLDEFF_USE_WATERFALL) {
    // 1:1 décomp FldEff_UseWaterfall (field_effect.c:1828) — logé dans game/field_effect_helpers.ts.
    // Crée Task_UseWaterfall (grimpe lente vers le nord en boucle tant que la tuile est MB_WATERFALL).
    return FldEff_UseWaterfall(rt);
  }
  if (id === FLDEFF_USE_DIVE) {
    // 1:1 décomp FldEff_UseDive (field_effect.c:1902) — logé dans game/field_effect_helpers.ts.
    // Crée Task_UseDive (preventStep → show-mon no-op → TryDoDiveWarp vers la map underwater/surface).
    return FldEff_UseDive(rt);
  }
  if (id === FLDEFF_USE_CUT_ON_TREE) {
    // 1:1 décomp FldEff_UseCutOnTree (fldeff_cut.c:300) — migré dans game/fldeff_cut.ts.
    // CreateFieldMoveTask(StartCutTreeFieldEffect) : pose → ScriptContext_Enable → EventScript_CutTreeDown.
    return FldEff_UseCutOnTree(rt);
  }
  if (id === FLDEFF_USE_ROCK_SMASH) {
    // 1:1 décomp FldEff_UseRockSmash (fldeff_rocksmash.c:150) — migré dans game/fldeff_rocksmash.ts.
    // CreateFieldMoveTask(FieldMove_RockSmash) : pose → SE + Enable → EventScript_SmashRock (break + combat).
    return FldEff_UseRockSmash(rt);
  }
  if (id === FLDEFF_SWEET_SCENT) {
    // 1:1 décomp FldEff_SweetScent (fldeff_sweetscent.c:43) — migré dans game/fldeff_sweetscent.ts.
    // CreateFieldMoveTask(StartSweetScentFieldEffect) : pose → flash ROUGE → encounter forcé / fail.
    return FldEff_SweetScent(rt);
  }
  if (id === FLDEFF_USE_TELEPORT) {
    // FldEff_UseTeleport (fldeff_teleport.c:34) — game/fldeff_teleport.ts. CŒUR WARP
    // (simplifié) : warp vers lastHealLocation + fade. Spin-out/in 1:1 = follow-up.
    return FldEff_UseTeleport(rt);
  }
  if (id === FLDEFF_USE_DIG) {
    // FldEff_UseDig (fldeff_dig.c:38) — game/fldeff_dig.ts. CŒUR WARP (simplifié) :
    // warp vers escapeWarp + fade. Anim de creusage 1:1 = follow-up.
    return FldEff_UseDig(rt);
  }
  if (id === FLDEFF_RIPPLE) {
    // 1:1 décomp FldEff_Ripple (field_effect_helpers.c:780) : ondulation d'eau 16×16.
    // Lit gFieldEffectArguments[0/1]=monde, [2]=subprio, [3]=priority → one-shot
    // (WaitFieldEffectSpriteAnim auto-despawn). coordOffsetEnabled=TRUE → suit la caméra.
    return FldEff_Ripple(rt);
  }
  // ─── Effets MORTS (0 caller en Émeraude, anims en boucle infinie = jamais despawn).
  //   Portés 1:1 pour la complétude (field_effect_helpers.c:844-908). ──
  if (id === FLDEFF_SHADOW) {
    // 1:1 décomp FldEff_Shadow (field_effect_helpers.c:233) — ombre de saut (ledge hop),
    // migrée dans game/field_effect_helpers.ts. Lit gFieldEffectArguments[0..2] = localId/
    // mapNum/mapGroup de l'object event (posés par DoShadowFieldEffect).
    return FldEff_Shadow(rt);
  }
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
