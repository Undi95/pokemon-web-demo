/**
 * field_effect.ts — Port 1:1 strict `field_effect.c` minimal (= dispatcher
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

import type { DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';
import { MAX_SPRITES } from '../harness/runtime/decomp-runtime';
import { GetSpritePaletteTagByPaletteNum, FreeSpritePaletteByTag, TAG_NONE, DestroySprite } from './sprite';
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
  FldEff_Shadow, FldEff_PokecenterHeal,
  FldEff_FieldMoveShowMon, FldEff_FieldMoveShowMonInit,
  FldEff_UseFly, FldEff_FlyIn, FldEff_NPCFlyOut,
  LoadGeneralFieldEffectPalette, LoadSmallSparkleFieldEffectPalette, LoadPokeballGlowFieldEffectPalette,
} from './field_effect_helpers';
import { FldEff_UseCutOnTree } from './fldeff_cut';
import { FldEff_UseRockSmash } from './fldeff_rocksmash';
import { FldEff_UseStrength } from './fldeff_strength';
import { FldEff_SweetScent } from './fldeff_sweetscent';
import { FldEff_UseTeleport } from './fldeff_teleport';
import { FldEff_UseDig } from './fldeff_dig';
// Side-effect : charge game/fldeff_flash.ts → expose __FieldCallback_Flash sur
// globalThis (le move FLASH n'a PAS de FLDEFF dispatch — FldEff_UseFlash est un
// callback de field-move task, pas un FieldEffectStart, cf. fldeff_flash.c:87).
import './fldeff_flash';
// (Ex-import side-effect './engine/field/fly-field-move' : voie VOL historique
// SUPPRIMÉE — le VOL passe par party_menu case FIELD_MOVE_FLY → CB2_OpenFlyMap
// → ReturnToFieldFromFlyMapSelect → FieldCallback_UseFly/Task_UseFly 1:1,
// field_effect_helpers.)

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c:24). Params globals
 *  pour FieldEffectStart, set par caller avant FieldEffectStart(id). */
// ⚠️ UN SEUL global partagé. Ce buffer est AUSSI écrit par l'opcode script
// `setfieldeffectargument` (engine/script/script-opcodes-fieldeffect.ts) AVANT `dofieldeffect` :
// les deux modules DOIVENT référencer le MÊME array, sinon le slot du mon CS posé par le script
// (ex. `setfieldeffectargument 0, VAR_RESULT` dans EventScript_UseSurf) n'atteint PAS FldEff_UseSurf
// → tMonId reste invalide (255) → FldEff_FieldMoveShowMonInit lit gPlayerParty[255]=undefined = freeze.
// Adopt-or-create via globalThis (pas d'import statique entre game/ et le moteur script → pas de
// cycle ESM ; le 1er des deux modules chargé crée l'array, l'autre l'adopte).
const _sharedFieldEffectArgs: number[] =
  ((globalThis as Record<string, unknown>).gFieldEffectArguments as number[] | undefined) ?? new Array(8).fill(0);
(globalThis as Record<string, unknown>).gFieldEffectArguments = _sharedFieldEffectArgs;
export const gFieldEffectArguments: number[] = _sharedFieldEffectArgs;

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
export const FLDEFF_USE_STRENGTH               = 40;
export const FLDEFF_USE_DIVE                   = 44;
export const FLDEFF_HEART_ICON                 = 46;
export const FLDEFF_BUBBLES                    = 53;
export const FLDEFF_SPARKLE                    = 54;
export const FLDEFF_POKECENTER_HEAL            = 25;
export const FLDEFF_FIELD_MOVE_SHOW_MON        = 6;
export const FLDEFF_FIELD_MOVE_SHOW_MON_INIT   = 59;
export const FLDEFF_NPCFLY_OUT                 = 30;
export const FLDEFF_USE_FLY                    = 31;
export const FLDEFF_FLY_IN                     = 32;

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
  // 1:1 décomp : boucle indexée sur les MAX_SPRITES slots fixes (gSprites[i]).
  for (let i = 0; i < MAX_SPRITES; i++) {
    const s = rt.gSprites[i];
    if (s === undefined || !s.inUse) continue;
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
  DestroySprite(sprite.spriteId);
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

  // ── Emotes (trainer_see.c) : !/? = `callnative` (TAG_NONE→slot 0) ; cœur = `loadfadedpal_callnative
  //    GENERAL_0` puis FldEff_HeartIcon force paletteNum=2 (1:1 — la palette GENERAL_0 est chargée
  //    comme effet de bord, le cœur utilise slot 2). ──
  [FLDEFF_EXCLAMATION_MARK_ICON]: [{ op: 'callnative', native: FldEff_ExclamationMarkIcon }, { op: 'end' }],
  [FLDEFF_QUESTION_MARK_ICON]:    [{ op: 'callnative', native: FldEff_QuestionMarkIcon }, { op: 'end' }],
  [FLDEFF_HEART_ICON]:            [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_HeartIcon }, { op: 'end' }],

  // ── Effets à palette PROPRE/slot fixe (`callnative` seul en décomp) : le FldEff gère sa palette
  //    (blob→slot 0 ; berry sparkle/disguise→on-demand palette propre, déviation assumée). ──
  [FLDEFF_TREE_DISGUISE]:         [{ op: 'callnative', native: ShowTreeDisguiseFieldEffect }, { op: 'end' }],
  [FLDEFF_MOUNTAIN_DISGUISE]:     [{ op: 'callnative', native: ShowMountainDisguiseFieldEffect }, { op: 'end' }],
  [FLDEFF_SAND_DISGUISE]:         [{ op: 'callnative', native: ShowSandDisguiseFieldEffect }, { op: 'end' }],
  [FLDEFF_BERRY_TREE_GROWTH_SPARKLE]: [{ op: 'callnative', native: FldEff_BerryTreeGrowthSparkle }, { op: 'end' }],
  // Generic sparkle : 1:1 `loadfadedpal_callnative gSpritePalette_SmallSparkle, FldEff_Sparkle`.
  [FLDEFF_SPARKLE]:               [{ op: 'loadfadedpal', loadPal: LoadSmallSparkleFieldEffectPalette }, { op: 'callnative', native: FldEff_Sparkle }, { op: 'end' }],
  [FLDEFF_SURF_BLOB]:             [{ op: 'callnative', native: FldEff_SurfBlob }, { op: 'end' }],

  // ── Field moves (`callnative` seul) : créent une task (montée surf / cut / etc.). ──
  [FLDEFF_USE_SURF]:              [{ op: 'callnative', native: FldEff_UseSurf }, { op: 'end' }],
  [FLDEFF_USE_WATERFALL]:         [{ op: 'callnative', native: FldEff_UseWaterfall }, { op: 'end' }],
  [FLDEFF_USE_DIVE]:              [{ op: 'callnative', native: FldEff_UseDive }, { op: 'end' }],
  [FLDEFF_USE_CUT_ON_TREE]:       [{ op: 'callnative', native: FldEff_UseCutOnTree }, { op: 'end' }],
  [FLDEFF_USE_ROCK_SMASH]:        [{ op: 'callnative', native: FldEff_UseRockSmash }, { op: 'end' }],
  [FLDEFF_USE_STRENGTH]:          [{ op: 'callnative', native: FldEff_UseStrength }, { op: 'end' }],
  [FLDEFF_SWEET_SCENT]:           [{ op: 'callnative', native: FldEff_SweetScent }, { op: 'end' }],
  [FLDEFF_USE_TELEPORT]:          [{ op: 'callnative', native: FldEff_UseTeleport }, { op: 'end' }],
  [FLDEFF_USE_DIG]:               [{ op: 'callnative', native: FldEff_UseDig }, { op: 'end' }],
  [FLDEFF_SHADOW]:                [{ op: 'callnative', native: FldEff_Shadow }, { op: 'end' }],

  // ── Field Move Show Mon (field_effect.c:2570/2584) : anim PARTAGÉE des CS (le mon apparaît +
  //    cri). 1:1 `gFieldEffectScript_FieldMoveShowMon` / `…Init` (field_effect_scripts.s:100/314)
  //    = `field_eff_callnative` seul. INIT lit l'équipe puis lance SHOW_MON. Débloque le mon-show
  //    de Surf/Cut/Fly/Strength/Waterfall/Dive (qui attendaient cet effet dans la liste active). ──
  [FLDEFF_FIELD_MOVE_SHOW_MON]:      [{ op: 'callnative', native: FldEff_FieldMoveShowMon }, { op: 'end' }],
  [FLDEFF_FIELD_MOVE_SHOW_MON_INIT]: [{ op: 'callnative', native: FldEff_FieldMoveShowMonInit }, { op: 'end' }],

  // ── Vol (field_effect.c:3118/3163/3454) : l'oiseau emporte (USE_FLY) / dépose (FLY_IN) le joueur,
  //    ou emporte un NPC (NPCFLY_OUT). `callnative` seul → crée la task d'animation. ──
  [FLDEFF_USE_FLY]:    [{ op: 'callnative', native: FldEff_UseFly }, { op: 'end' }],
  [FLDEFF_FLY_IN]:     [{ op: 'callnative', native: FldEff_FlyIn }, { op: 'end' }],
  [FLDEFF_NPCFLY_OUT]: [{ op: 'callnative', native: FldEff_NPCFlyOut }, { op: 'end' }],

  // ── Effets « morts » (0 caller en Émeraude) + WaterSurfacing (plongée) : `loadfadedpal_callnative GENERAL_N`. ──
  [FLDEFF_UNUSED_GRASS]:          [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_UnusedGrass }, { op: 'end' }],
  [FLDEFF_UNUSED_GRASS_2]:        [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(1) }, { op: 'callnative', native: FldEff_UnusedGrass2 }, { op: 'end' }],
  [FLDEFF_UNUSED_SAND]:           [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_UnusedSand }, { op: 'end' }],
  [FLDEFF_WATER_SURFACING]:       [{ op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_WaterSurfacing }, { op: 'end' }],

  // ── PokéCenter heal (field_effect.c:1010) : 1:1 `gFieldEffectScript_PokeCenterHeal`
  //    (field_effect_scripts.s:176) = loadfadedpal pokeball_glow + loadfadedpal general_0 + callnative.
  //    Le 1er loadfadedpal charge la palette pulsée (FLDEFF_PAL_TAG_POKEBALL_GLOW), le 2e charge
  //    GENERAL_0 (palette du moniteur). Débloque le soin nurse (waitfieldeffect ne gèle plus). ──
  [FLDEFF_POKECENTER_HEAL]:       [{ op: 'loadfadedpal', loadPal: LoadPokeballGlowFieldEffectPalette }, { op: 'loadfadedpal', loadPal: () => LoadGeneralFieldEffectPalette(0) }, { op: 'callnative', native: FldEff_PokecenterHeal }, { op: 'end' }],
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

  // 1:1 STRICT décomp `FieldEffectStart` (field_effect.c:697) : la PREMIÈRE chose est
  // `FieldEffectActiveListAdd(id)` — l'effet entre dans la liste active. C'est ce qui fait que
  // `FieldEffectActiveListContains(id)` tient le temps de l'anim, et que les séquences CS attendent
  // (ex. SurfFieldEffect_JumpOnSurfBlob attend `!Contains(SHOW_MON)` AVANT de monter sur le blob).
  // Chaque effet se RETIRE lui-même (FieldEffectStop/…Remove dans son sprite callback / sa task End).
  // ⚠️ AVANT : seul l'opcode `dofieldeffect` ajoutait → un FieldEffectStart DIRECT (show-mon depuis
  // surf/cut/…) n'ajoutait jamais → le gate ne tenait pas → le perso enchaînait la CS pendant l'anim.
  FieldEffectActiveListAdd(id);

  // 1:1 décomp `FieldEffectStart` : exécute le bytecode `gFieldEffectScriptPointers[id]`.
  // TOUS les FLDEFF portés sont dans la table (l'ancien dispatcher if-chain a été retiré).
  const script = gFieldEffectScriptPointers[id];
  if (script) return _runFieldEffectScript(rt, script);

  // FLDEFF absent de la table = effet pas encore porté (dette : RayquazaSpotlight, etc.).
  // Le warn aide à repérer un trigger atteint (fire rarement, maps spécifiques).
  console.warn(`[FieldEffectStart] FLDEFF id=${id} not yet ported — dette R3`);
  return 64;
}

/** Reset les arguments à 0 — call par certains handlers post-exec. */
export function ClearFieldEffectArguments(): void {
  for (let i = 0; i < 8; i++) gFieldEffectArguments[i] = 0;
}

// ─── Active list 1:1 décomp (field_effect.c:236 + 846-886) ──────────────────
// Rapatrié de `engine/field/field-effect-active-list.ts` (unification miroir) :
// dans le décomp, sActiveList vit DANS field_effect.c. Le cycle ESM
// field_effect ↔ field_effect_helpers est inoffensif ici : les `function`
// declarations sont hoistées et sActiveList n'est lu qu'à runtime.

/** 1:1 décomp `static u8 sActiveList[32]` (field_effect.c:236). 0xFF = slot vide. */
const FIELD_EFFECT_COUNT = 32;
const sActiveList = new Uint8Array(FIELD_EFFECT_COUNT).fill(0xFF);

/** 1:1 décomp `FieldEffectActiveListClear` (field_effect.c:846-851). */
export function FieldEffectActiveListClear(): void {
  for (let i = 0; i < sActiveList.length; i++) {
    sActiveList[i] = 0xFF;
  }
}

/** 1:1 décomp `FieldEffectActiveListAdd` (field_effect.c:853-864) : insert dans
 *  le premier slot 0xFF trouvé. Si list pleine (32 effects actifs), silently
 *  dropped (= décomp behavior). */
export function FieldEffectActiveListAdd(id: number): void {
  for (let i = 0; i < sActiveList.length; i++) {
    if (sActiveList[i] === 0xFF) {
      sActiveList[i] = id;
      return;
    }
  }
}

/** 1:1 décomp `FieldEffectActiveListRemove` (field_effect.c:866-877) : retire la
 *  PREMIÈRE occurrence de id (= décomp behavior, pas de compact array). */
export function FieldEffectActiveListRemove(id: number): void {
  for (let i = 0; i < sActiveList.length; i++) {
    if (sActiveList[i] === id) {
      sActiveList[i] = 0xFF;
      return;
    }
  }
}

/** 1:1 décomp `FieldEffectActiveListContains` (field_effect.c:879-886). */
export function FieldEffectActiveListContains(id: number): boolean {
  for (let i = 0; i < sActiveList.length; i++) {
    if (sActiveList[i] === id) return true;
  }
  return false;
}
