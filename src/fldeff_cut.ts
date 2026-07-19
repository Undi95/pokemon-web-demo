/**
 * fldeff_cut.ts — Port 1:1 STRICT de `src/fldeff_cut.c`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/fldeff_cut.c
 *
 * Branche ARBRE (direct-A) : `FldEff_UseCutOnTree` + `StartCutTreeFieldEffect`, déclenchée par
 * l'interaction A face à un `OBJ_EVENT_GFX_CUTTABLE_TREE` dont le script est `EventScript_CutTree`.
 *
 * Branche PARTY-MENU (Coupe depuis le menu du mon) : `SetUpFieldMove_Cut` (scan herbe 3×3/5×5 +
 * check arbre devant) → `FieldCallback_CutTree`/`FieldCallback_CutGrass` → `FldEff_UseCutOn{Tree,Grass}`
 * → `StartCut{Tree,Grass}FieldEffect` → (herbe) `FldEff_CutGrass` remplace les métatuiles
 * TallGrass→Grass + spawn 8 sprites `CUT_GRASS` rotatifs (Sin/Cos).
 *
 * Les helpers long-grass `GetLongGrassCaseAt`/`FixLongGrassMetatiles*` (fldeff_cut.c:403/592/615)
 * vivent dans fieldmap.ts (partagés avec `LoadSavedMapView`) — on importe `GetLongGrassCaseAt`.
 */

import type { DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';
import { CreateFieldMoveTask, FieldEffectScript_LoadFadedPalette, setFieldEffectAnims } from './field_effect_helpers';
import { FieldEffectActiveListRemove, FieldEffectStart, FieldEffectStop, gFieldEffectArguments } from './field_effect';
import { ScriptContext_Enable, ScriptContext_SetupScript, UnlockPlayerFieldControls } from './script';
import { PlaySE, getRuntime } from '../harness/runtime/decomp-globals';
import { SE_M_CUT } from '../include/constants/songs';
import { LoadSpriteSheet, IndexOfSpriteTileTag, IndexOfSpritePaletteTag, DestroySprite,
  ANIMCMD_FRAME, ANIMCMD_JUMP, type AnimCmd } from './sprite';
import { loadIndexedPngStrict, loadGbaPal } from '../harness/gba/png-loader';
import { PlayerGetDestCoords, PlayerGetElevation, gPlayerAvatar } from './field_player_avatar';
import { gPlayerFacingPosition } from './fldeff_misc';
import { AllowObjectAtPosTriggerGroundEffects } from './event_object_movement';
import { gPlayerParty } from './engine/battle/party-storage';
import { GetMonAbility } from './pokemon';
import { ABILITY_HYPER_CUTTER } from '../include/constants/abilities';
import { MapGridGetElevationAt, MapGridGetCollisionAt, MapGridGetMetatileBehaviorAt,
  MapGridGetMetatileIdAt, MapGridSetMetatileIdAt, GetLongGrassCaseAt } from './fieldmap';
import { MetatileBehavior_IsPokeGrass, MetatileBehavior_IsAshGrass, MetatileBehavior_IsCuttableGrass } from './metatile_behavior';
import { DrawWholeMapView } from './field_camera';
import { ScriptUnfreezeObjectEvents } from './event_object_lock';
import { IsMewPlayingHideAndSeek } from './faraway_island';
import { Sin, Cos } from './trig';
import {
  METATILE_Fortree_LongGrass_Root, METATILE_General_LongGrass, METATILE_General_TallGrass,
  METATILE_General_Grass,
  METATILE_General_TallGrass_TreeLeft, METATILE_General_Grass_TreeLeft,
  METATILE_General_TallGrass_TreeRight, METATILE_General_Grass_TreeRight,
  METATILE_General_TallGrass_TreeUp, METATILE_General_Grass_TreeUp,
  METATILE_Fortree_SecretBase_LongGrass_BottomLeft, METATILE_Fortree_SecretBase_LongGrass_TopLeft,
  METATILE_Fortree_SecretBase_LongGrass_BottomMid, METATILE_Fortree_SecretBase_LongGrass_TopMid,
  METATILE_Fortree_SecretBase_LongGrass_BottomRight, METATILE_Fortree_SecretBase_LongGrass_TopRight,
  METATILE_Lavaridge_NormalGrass, METATILE_Lavaridge_AshGrass, METATILE_Lavaridge_LavaField,
  METATILE_Fallarbor_NormalGrass, METATILE_Fallarbor_AshGrass, METATILE_Fallarbor_AshField,
} from '../include/constants/metatile_labels';

/** 1:1 décomp `FLDEFF_USE_CUT_ON_GRASS = 1`, `FLDEFF_USE_CUT_ON_TREE = 2`, `FLDEFF_CUT_GRASS = 58`
 *  (include/constants/field_effects.h). */
const FLDEFF_USE_CUT_ON_GRASS = 1;
const FLDEFF_USE_CUT_ON_TREE = 2;
const FLDEFF_CUT_GRASS = 58;

// 1:1 décomp `cut 'square' defines` (fldeff_cut.c:33-40).
const CUT_NORMAL_SIDE = 3;
const CUT_NORMAL_AREA = CUT_NORMAL_SIDE * CUT_NORMAL_SIDE; // 9
const CUT_HYPER_SIDE = 5;
const CUT_HYPER_AREA = CUT_HYPER_SIDE * CUT_HYPER_SIDE;    // 25
const CUT_SPRITE_ARRAY_COUNT = 8;

// 1:1 décomp `enum { LONG_GRASS_NONE, FIELD, BASE_LEFT, BASE_CENTER, BASE_RIGHT }` (fldeff_cut.c:394).
// (GetLongGrassCaseAt renvoie ces valeurs ; définies localement pour les switch ci-dessous.)
const LONG_GRASS_FIELD = 1;
const LONG_GRASS_BASE_LEFT = 2;
const LONG_GRASS_BASE_CENTER = 3;
const LONG_GRASS_BASE_RIGHT = 4;

/** 1:1 décomp `sHyperCutStruct[]` (fldeff_cut.c:71-89). `struct HyperCutterUnk { s8 x; s8 y; u8 unk2[2]; }`
 *  — l'init C `{v}` d'un u8[2] = `{v, 0}`. unk2[j] = index (1-based) dans cutTiles à valider. */
const sHyperCutStruct: ReadonlyArray<{ x: number; y: number; unk2: readonly [number, number] }> = [
  { x: -2, y: -2, unk2: [1, 0] }, { x: -1, y: -2, unk2: [1, 0] }, { x: 0, y: -2, unk2: [2, 0] },
  { x: 1, y: -2, unk2: [3, 0] }, { x: 2, y: -2, unk2: [3, 0] }, { x: -2, y: -1, unk2: [1, 0] },
  { x: 2, y: -1, unk2: [3, 0] }, { x: -2, y: 0, unk2: [4, 0] }, { x: 2, y: 0, unk2: [6, 0] },
  { x: -2, y: 1, unk2: [7, 0] }, { x: 2, y: 1, unk2: [9, 0] }, { x: -2, y: 2, unk2: [7, 0] },
  { x: -1, y: 2, unk2: [7, 0] }, { x: 0, y: 2, unk2: [8, 0] }, { x: 1, y: 2, unk2: [9, 0] },
  { x: 2, y: 2, unk2: [9, 0] },
];

// 1:1 décomp IWRAM variables (fldeff_cut.c:62-68) + EWRAM sCutGrassSpriteArrayPtr.
let sCutSquareSide = 0;
let sTileCountFromPlayer_X = 0;
let sTileCountFromPlayer_Y = 0;
const sHyperCutTiles: boolean[] = new Array(CUT_HYPER_AREA).fill(false);
let sCutGrassSpriteArrayPtr: number[] | null = null;

/** 1:1 décomp `sSpriteAnim_CutGrass` (fldeff_cut.c:108) : ANIMCMD_FRAME(0, 30), ANIMCMD_JUMP(0)
 *  (une tuile 8×8 statique — la rotation est faite par le callback via Sin/Cos sur x2/y2). */
const sAnims_CutGrass: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 30), ANIMCMD_JUMP(0)],
];

// ─── Préchargement asset (concern plateforme — gFieldEffectPic_CutGrass + gFieldEffectPal_CutGrass). ──
const CUT_GRASS_PNG = '/decomp/em/field_effects/cut_grass.png';
const CUT_GRASS_PAL = '/decomp/em/field_effects/cut_grass.pal';
const TAG_CUT_GRASS_GFX = 'FIELD_EFFECT_CUT_GRASS_GFX';
const TAG_CUT_GRASS_PAL = 'FLDEFF_PAL_TAG_CUT_GRASS';
let _cutGrassTileStart = -1;
let _cutGrassInit = false;
let _cutGrassInitPromise: Promise<void> | null = null;
let _cutGrassPalData: Uint16Array | null = null;

/** Préchargement assets CutGrass. À call au boot field (= LoadFieldEffectGraphics). Idempotent. */
export function preloadCutGrassEffect(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _cutGrassInit && IndexOfSpriteTileTag(TAG_CUT_GRASS_GFX) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_cutGrassInitPromise && !_cutGrassInit) return _cutGrassInitPromise;
  _cutGrassInit = false; _cutGrassInitPromise = null;
  _cutGrassInitPromise = (async () => {
    const png = await loadIndexedPngStrict(CUT_GRASS_PNG, 4);
    // cut_grass.png = 8×8 = 1 tuile 4bpp (1:1 SpriteFrameImage `gFieldEffectPic_CutGrass, 0x20`).
    const sheet = png.charData.slice(0, 32);
    _cutGrassTileStart = LoadSpriteSheet({ data: sheet, size: sheet.length, tag: TAG_CUT_GRASS_GFX });
    let pal: Uint16Array;
    try { pal = await loadGbaPal(CUT_GRASS_PAL); }
    catch { pal = png.palette as Uint16Array; }
    _cutGrassPalData = pal;
    _cutGrassInit = true;
  })();
  return _cutGrassInitPromise;
}

/** loadfadedpal de la palette CutGrass (1:1 `field_eff_loadfadedpal_callnative gSpritePalette_CutGrass`). */
export function LoadCutGrassFieldEffectPalette(): number {
  return FieldEffectScript_LoadFadedPalette(_cutGrassPalData, TAG_CUT_GRASS_PAL);
}

/** 1:1 STRICT décomp `SetUpFieldMove_Cut` (fldeff_cut.c:138). Scanne le carré 3×3 (Hyper Cutter : 5×5)
 *  autour du joueur pour de l'herbe coupable et/ou un arbre devant → pose `gPostMenuFieldCallback`
 *  (FieldCallback_CutTree|CutGrass) + remplit `sHyperCutTiles`. Renvoie TRUE si une CS-Coupe part.
 *  `gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu` est posé par le wrapper party_menu (sur TRUE).
 *  Exposé `__SetUpFieldMove_Cut` (anti-cycle ESM, pattern Strength/Flash). */
function SetUpFieldMove_Cut(): boolean {
  const g = globalThis as Record<string, unknown>;
  const checkObj = g.__CheckObjectGraphicsInFrontOfPlayer as ((gfx: string) => boolean) | undefined;
  const getCursor = g.__getCursorSelectionMonId as (() => number) | undefined;

  if (checkObj?.('OBJ_EVENT_GFX_CUTTABLE_TREE') === true) {
    // Devant un arbre coupable → branche arbre (FieldCallback_CutTree → EventScript_UseCut).
    g.gPostMenuFieldCallback = FieldCallback_CutTree;
    return true;
  }

  const dest = PlayerGetDestCoords();       // INTERNAL (comme MapGrid*)
  gPlayerFacingPosition.x = dest.x;
  gPlayerFacingPosition.y = dest.y;
  // Le décomp s'appuie sur gPlayerFacingPosition.elevation posé ailleurs (PlayerGetElevation,
  // cf. fldeff_rocksmash.c:35). Notre port ne le maintient pas via le flux d'input → reconstruit ici.
  gPlayerFacingPosition.elevation = PlayerGetElevation();

  const userAbility = GetMonAbility(gPlayerParty[getCursor?.() ?? 0]);
  if (userAbility === ABILITY_HYPER_CUTTER) {
    sCutSquareSide = CUT_HYPER_SIDE;
    sTileCountFromPlayer_X = 2;
    sTileCountFromPlayer_Y = 2;
  } else {
    sCutSquareSide = CUT_NORMAL_SIDE;
    sTileCountFromPlayer_X = 1;
    sTileCountFromPlayer_Y = 1;
  }

  const cutTiles: boolean[] = new Array(CUT_NORMAL_AREA).fill(false);
  for (let i = 0; i < CUT_HYPER_AREA; i++) sHyperCutTiles[i] = false;

  let ret = false;

  for (let i = 0; i < CUT_NORMAL_SIDE; i++) {
    const y = i - 1 + gPlayerFacingPosition.y;
    for (let j = 0; j < CUT_NORMAL_SIDE; j++) {
      const x = j - 1 + gPlayerFacingPosition.x;
      if (MapGridGetElevationAt(x, y) === gPlayerFacingPosition.elevation) {
        const tileBehavior = MapGridGetMetatileBehaviorAt(x, y);
        if (MetatileBehavior_IsPokeGrass(tileBehavior) === true
          || MetatileBehavior_IsAshGrass(tileBehavior) === true) {
          // Devant de l'herbe.
          sHyperCutTiles[6 + (i * 5) + j] = true;
          ret = true;
        }
        // BUGFIX (fldeff_cut.c:194) : collision 0-3, tout != 0 = infranchissable.
        if (MapGridGetCollisionAt(x, y)) {
          cutTiles[i * 3 + j] = false;
        } else {
          cutTiles[i * 3 + j] = true;
          if (MetatileBehavior_IsCuttableGrass(tileBehavior) === true)
            sHyperCutTiles[6 + (i * 5) + j] = true;
        }
      } else {
        cutTiles[i * 3 + j] = false;
      }
    }
  }

  if (userAbility !== ABILITY_HYPER_CUTTER) {
    if (ret === true) {
      g.gPostMenuFieldCallback = FieldCallback_CutGrass;
    }
  } else {
    for (let i = 0; i < 16; i++) {
      const x = gPlayerFacingPosition.x + sHyperCutStruct[i].x;
      const y = gPlayerFacingPosition.y + sHyperCutStruct[i].y;
      let tileCuttable = true;

      for (let j = 0; j < 2; ++j) {
        if (sHyperCutStruct[i].unk2[j] === 0) break; // 1:1 : one line required to match -g
        if (cutTiles[(sHyperCutStruct[i].unk2[j] - 1) & 0xFF] === false) {
          tileCuttable = false;
          break;
        }
      }

      if (tileCuttable === true) {
        if (MapGridGetElevationAt(x, y) === gPlayerFacingPosition.elevation) {
          const tileArrayId = ((sHyperCutStruct[i].y * 5) + 12) + sHyperCutStruct[i].x;
          const tileBehavior = MapGridGetMetatileBehaviorAt(x, y);
          if (MetatileBehavior_IsPokeGrass(tileBehavior) === true
            || MetatileBehavior_IsAshGrass(tileBehavior) === true) {
            g.gPostMenuFieldCallback = FieldCallback_CutGrass;
            sHyperCutTiles[tileArrayId] = true;
            ret = true;
          } else {
            if (MetatileBehavior_IsCuttableGrass(tileBehavior) === true)
              sHyperCutTiles[tileArrayId] = true;
          }
        }
      }
    }

    if (ret === true) {
      g.gPostMenuFieldCallback = FieldCallback_CutGrass;
    }
  }

  return ret;
}
(globalThis as Record<string, unknown>).__SetUpFieldMove_Cut = SetUpFieldMove_Cut;

/** 1:1 STRICT décomp `FieldCallback_CutGrass` (fldeff_cut.c:278) :
 *    FieldEffectStart(FLDEFF_USE_CUT_ON_GRASS); gFieldEffectArguments[0] = GetCursorSelectionMonId(); */
function FieldCallback_CutGrass(): void {
  FieldEffectStart(FLDEFF_USE_CUT_ON_GRASS);
  const getCursor = (globalThis as Record<string, unknown>).__getCursorSelectionMonId as (() => number) | undefined;
  gFieldEffectArguments[0] = getCursor?.() ?? 0;
}

/** 1:1 STRICT décomp `FieldCallback_CutTree` (fldeff_cut.c:294) :
 *    gFieldEffectArguments[0] = GetCursorSelectionMonId(); ScriptContext_SetupScript(EventScript_UseCut); */
function FieldCallback_CutTree(): void {
  const getCursor = (globalThis as Record<string, unknown>).__getCursorSelectionMonId as (() => number) | undefined;
  gFieldEffectArguments[0] = getCursor?.() ?? 0;
  ScriptContext_SetupScript('EventScript_UseCut');
}

/** 1:1 STRICT décomp `FldEff_UseCutOnGrass` (fldeff_cut.c:284) :
 *    u8 taskId = CreateFieldMoveTask();
 *    gTasks[taskId].data[8/9] = (u32)StartCutGrassFieldEffect;   // fn en moitiés
 *    IncrementGameStat(GAME_STAT_USED_CUT);
 *    return FALSE;
 *  Port : CreateFieldMoveTask(StartCutGrassFieldEffect). Préchargement CutGrass amorcé ici (le show-mon
 *  banner laisse le temps du chargement avant FldEff_CutGrass). DETTE : IncrementGameStat non porté. */
export function FldEff_UseCutOnGrass(rt: DecompRuntime): number {
  preloadCutGrassEffect(rt).catch((e) => console.error('[preloadCutGrassEffect]', e));
  CreateFieldMoveTask(StartCutGrassFieldEffect);
  return 0; // FALSE
}

/** 1:1 STRICT décomp `StartCutGrassFieldEffect` (fldeff_cut.c:310) :
 *    FieldEffectActiveListRemove(FLDEFF_USE_CUT_ON_GRASS); FieldEffectStart(FLDEFF_CUT_GRASS); */
function StartCutGrassFieldEffect(): void {
  FieldEffectActiveListRemove(FLDEFF_USE_CUT_ON_GRASS);
  FieldEffectStart(FLDEFF_CUT_GRASS);
}

/** 1:1 STRICT décomp `FldEff_CutGrass` (fldeff_cut.c:316) : coupe les métatuiles marquées dans
 *  sHyperCutTiles (TallGrass→Grass etc.), redessine la vue, puis spawn 8 sprites CUT_GRASS rotatifs
 *  (autour du joueur, phase décalée data[2]=32*i). `SE_M_CUT` = bruitage de coupe (préchargé). */
export function FldEff_CutGrass(rt: DecompRuntime): number {
  PlaySE(SE_M_CUT);
  const dest = PlayerGetDestCoords();
  gPlayerFacingPosition.x = dest.x;
  gPlayerFacingPosition.y = dest.y;

  for (let i = 0; i < CUT_HYPER_AREA; i++) {
    if (sHyperCutTiles[i] === true) {
      const xAdd = (i % 5) - 2;
      const yAdd = ((i / 5) | 0) - 2;
      const x = xAdd + gPlayerFacingPosition.x;
      const y = yAdd + gPlayerFacingPosition.y;
      SetCutGrassMetatile(x, y);
      AllowObjectAtPosTriggerGroundEffects(x, y);
    }
  }

  SetCutGrassMetatiles(gPlayerFacingPosition.x - sTileCountFromPlayer_X,
    gPlayerFacingPosition.y - (1 + sTileCountFromPlayer_Y));
  DrawWholeMapView();

  // Sprites CUT_GRASS : nécessitent le préchargement (cut_grass.png/.pal, fait au boot via
  // LoadFieldEffectGraphics). Défensif (SYS-3 fail-open) : si pas encore prêt, l'herbe EST déjà
  // coupée (métatuiles ci-dessus) — on nettoie directement (unlock) pour ne JAMAIS geler.
  if (!_cutGrassInit) {
    preloadCutGrassEffect(rt).catch((e) => console.error('[preloadCutGrassEffect]', e));
    FieldEffectActiveListRemove(FLDEFF_CUT_GRASS);
    ScriptUnfreezeObjectEvents();
    UnlockPlayerFieldControls();
    return 0;
  }

  // 1:1 : sCutGrassSpriteArrayPtr = AllocZeroed(CUT_SPRITE_ARRAY_COUNT) → tableau JS.
  sCutGrassSpriteArrayPtr = [];
  const playerSprite = gPlayerAvatar.spriteId >= 0 ? rt.gSprites[gPlayerAvatar.spriteId] : undefined;
  const baseX = (playerSprite ? playerSprite.x : 0) + 8;   // 1:1 gSprites[player].oam.x + 8
  const baseY = (playerSprite ? playerSprite.y : 0) + 20;  // 1:1 gSprites[player].oam.y + 20
  const palBank = IndexOfSpritePaletteTag(TAG_CUT_GRASS_PAL);
  for (let i = 0; i < CUT_SPRITE_ARRAY_COUNT; i++) {
    const result = rt.CreateSpriteAtOam({
      tileId: _cutGrassTileStart,
      paletteBank: palBank,
      x: baseX, y: baseY,
      shape: 0, size: 0,   // 8×8 (sOamData_CutGrass)
      priority: 1,         // 1:1 sOamData_CutGrass.priority
      paletteMode: 0, affineMode: 0,
      subpriority: 0,      // 1:1 CreateSprite(..., 0) (from-start, PAS CreateSpriteAtEnd → pas de fromEnd)
    });
    const sprite = rt.gSprites[result.spriteId];
    if (!sprite) continue;
    setFieldEffectAnims(sprite, sAnims_CutGrass, _cutGrassTileStart);
    sprite.x = baseX; sprite.y = baseY;
    sprite.callback = CutGrassSpriteCallback1;
    sprite.data[2] = 32 * i;   // 1:1 : phase de rotation décalée par sprite
    sCutGrassSpriteArrayPtr[i] = result.spriteId;
  }

  return 0; // FALSE
}

/** 1:1 STRICT décomp `SetCutGrassMetatile` (fldeff_cut.c:354) : remplace la métatuile d'herbe
 *  haute par sa variante coupée (courte / champ de cendre / champ de lave). */
function SetCutGrassMetatile(x: number, y: number): void {
  const metatileId = MapGridGetMetatileIdAt(x, y);
  switch (metatileId) {
    case METATILE_Fortree_LongGrass_Root:
    case METATILE_General_LongGrass:
    case METATILE_General_TallGrass:
      MapGridSetMetatileIdAt(x, y, METATILE_General_Grass);
      break;
    case METATILE_General_TallGrass_TreeLeft:
      MapGridSetMetatileIdAt(x, y, METATILE_General_Grass_TreeLeft);
      break;
    case METATILE_General_TallGrass_TreeRight:
      MapGridSetMetatileIdAt(x, y, METATILE_General_Grass_TreeRight);
      break;
    case METATILE_Fortree_SecretBase_LongGrass_BottomLeft:
      MapGridSetMetatileIdAt(x, y, METATILE_Fortree_SecretBase_LongGrass_TopLeft);
      break;
    case METATILE_Fortree_SecretBase_LongGrass_BottomMid:
      MapGridSetMetatileIdAt(x, y, METATILE_Fortree_SecretBase_LongGrass_TopMid);
      break;
    case METATILE_Fortree_SecretBase_LongGrass_BottomRight:
      MapGridSetMetatileIdAt(x, y, METATILE_Fortree_SecretBase_LongGrass_TopRight);
      break;
    case METATILE_Lavaridge_NormalGrass:
    case METATILE_Lavaridge_AshGrass:
      MapGridSetMetatileIdAt(x, y, METATILE_Lavaridge_LavaField);
      break;
    case METATILE_Fallarbor_NormalGrass:
    case METATILE_Fallarbor_AshGrass:
      MapGridSetMetatileIdAt(x, y, METATILE_Fallarbor_AshField);
      break;
    case METATILE_General_TallGrass_TreeUp:
      MapGridSetMetatileIdAt(x, y, METATILE_General_Grass_TreeUp);
      break;
  }
}

/** 1:1 STRICT décomp `SetCutGrassMetatiles` (fldeff_cut.c:419) : fixe les tuiles racine/base de
 *  l'herbe LONGUE (Route Algatia) aux bords de la zone coupée (haut = pousse la racine, bas = coupe). */
function SetCutGrassMetatiles(x: number, y: number): void {
  const lowerY = y + sCutSquareSide;

  for (let i = 0; i < sCutSquareSide; i++) {
    const currentX = x + i;
    if (MapGridGetMetatileIdAt(currentX, y) === METATILE_General_LongGrass) {
      switch (GetLongGrassCaseAt(currentX, y + 1)) {
        case LONG_GRASS_FIELD:
          MapGridSetMetatileIdAt(currentX, y + 1, METATILE_Fortree_LongGrass_Root);
          break;
        case LONG_GRASS_BASE_LEFT:
          MapGridSetMetatileIdAt(currentX, y + 1, METATILE_Fortree_SecretBase_LongGrass_BottomLeft);
          break;
        case LONG_GRASS_BASE_CENTER:
          MapGridSetMetatileIdAt(currentX, y + 1, METATILE_Fortree_SecretBase_LongGrass_BottomMid);
          break;
        case LONG_GRASS_BASE_RIGHT:
          MapGridSetMetatileIdAt(currentX, y + 1, METATILE_Fortree_SecretBase_LongGrass_BottomRight);
          break;
      }
    }
    if (MapGridGetMetatileIdAt(currentX, lowerY) === METATILE_General_Grass) {
      if (MapGridGetMetatileIdAt(currentX, lowerY + 1) === METATILE_Fortree_LongGrass_Root)
        MapGridSetMetatileIdAt(currentX, lowerY + 1, METATILE_General_Grass);
      if (MapGridGetMetatileIdAt(currentX, lowerY + 1) === METATILE_Fortree_SecretBase_LongGrass_BottomLeft)
        MapGridSetMetatileIdAt(currentX, lowerY + 1, METATILE_Fortree_SecretBase_LongGrass_TopLeft);
      if (MapGridGetMetatileIdAt(currentX, lowerY + 1) === METATILE_Fortree_SecretBase_LongGrass_BottomMid)
        MapGridSetMetatileIdAt(currentX, lowerY + 1, METATILE_Fortree_SecretBase_LongGrass_TopMid);
      if (MapGridGetMetatileIdAt(currentX, lowerY + 1) === METATILE_Fortree_SecretBase_LongGrass_BottomRight)
        MapGridSetMetatileIdAt(currentX, lowerY + 1, METATILE_Fortree_SecretBase_LongGrass_TopRight);
    }
  }

  if (sCutSquareSide === CUT_HYPER_SIDE) {
    HandleLongGrassOnHyper(0, x, y);
    HandleLongGrassOnHyper(1, x, y);
  }
}

/** 1:1 STRICT décomp `HandleLongGrassOnHyper` (fldeff_cut.c:465) : gère les colonnes gauche/droite
 *  de l'herbe longue pour le carré 5×5 (Hyper Cutter). */
function HandleLongGrassOnHyper(caseId: number, x: number, y: number): void {
  const arr: boolean[] = [false, false, false];
  let newX: number;

  if (caseId === 0) {
    arr[0] = sHyperCutTiles[5];
    arr[1] = sHyperCutTiles[10];
    arr[2] = sHyperCutTiles[15];
    newX = x;
  } else if (caseId === 1) {
    arr[0] = sHyperCutTiles[9];
    arr[1] = sHyperCutTiles[14];
    arr[2] = sHyperCutTiles[19];
    newX = x + 4;
  } else {
    return;
  }

  if (arr[0] === true) {
    if (MapGridGetMetatileIdAt(newX, y + 3) === METATILE_Fortree_LongGrass_Root)
      MapGridSetMetatileIdAt(newX, y + 3, METATILE_General_Grass);
    if (MapGridGetMetatileIdAt(newX, y + 3) === METATILE_Fortree_SecretBase_LongGrass_BottomLeft)
      MapGridSetMetatileIdAt(newX, y + 3, METATILE_Fortree_SecretBase_LongGrass_TopLeft);
    if (MapGridGetMetatileIdAt(newX, y + 3) === METATILE_Fortree_SecretBase_LongGrass_BottomMid)
      MapGridSetMetatileIdAt(newX, y + 3, METATILE_Fortree_SecretBase_LongGrass_TopMid);
    if (MapGridGetMetatileIdAt(newX, y + 3) === METATILE_Fortree_SecretBase_LongGrass_BottomRight)
      MapGridSetMetatileIdAt(newX, y + 3, METATILE_Fortree_SecretBase_LongGrass_TopRight);
  }
  if (arr[1] === true) {
    if (MapGridGetMetatileIdAt(newX, y + 2) === METATILE_General_LongGrass) {
      switch (GetLongGrassCaseAt(newX, y + 3)) {
        case LONG_GRASS_FIELD:
          MapGridSetMetatileIdAt(newX, y + 3, METATILE_Fortree_LongGrass_Root);
          break;
        case LONG_GRASS_BASE_LEFT:
          MapGridSetMetatileIdAt(newX, y + 3, METATILE_Fortree_SecretBase_LongGrass_BottomLeft);
          break;
        case LONG_GRASS_BASE_CENTER:
          MapGridSetMetatileIdAt(newX, y + 3, METATILE_Fortree_SecretBase_LongGrass_BottomMid);
          break;
        case LONG_GRASS_BASE_RIGHT:
          MapGridSetMetatileIdAt(newX, y + 3, METATILE_Fortree_SecretBase_LongGrass_BottomRight);
          break;
      }
    }

    if (MapGridGetMetatileIdAt(newX, y + 4) === METATILE_Fortree_LongGrass_Root)
      MapGridSetMetatileIdAt(newX, y + 4, METATILE_General_Grass);
    if (MapGridGetMetatileIdAt(newX, y + 4) === METATILE_Fortree_SecretBase_LongGrass_BottomLeft)
      MapGridSetMetatileIdAt(newX, y + 4, METATILE_Fortree_SecretBase_LongGrass_TopLeft);
    if (MapGridGetMetatileIdAt(newX, y + 4) === METATILE_Fortree_SecretBase_LongGrass_BottomMid)
      MapGridSetMetatileIdAt(newX, y + 4, METATILE_Fortree_SecretBase_LongGrass_TopMid);
    if (MapGridGetMetatileIdAt(newX, y + 4) === METATILE_Fortree_SecretBase_LongGrass_BottomRight)
      MapGridSetMetatileIdAt(newX, y + 4, METATILE_Fortree_SecretBase_LongGrass_TopRight);
  }
  if (arr[2] === true) {
    if (MapGridGetMetatileIdAt(newX, y + 3) === METATILE_General_LongGrass) {
      switch (GetLongGrassCaseAt(newX, y + 4)) {
        case LONG_GRASS_FIELD:
          MapGridSetMetatileIdAt(newX, y + 4, METATILE_Fortree_LongGrass_Root);
          break;
        case LONG_GRASS_BASE_LEFT:
          MapGridSetMetatileIdAt(newX, y + 4, METATILE_Fortree_SecretBase_LongGrass_BottomLeft);
          break;
        case LONG_GRASS_BASE_CENTER:
          MapGridSetMetatileIdAt(newX, y + 4, METATILE_Fortree_SecretBase_LongGrass_BottomMid);
          break;
        case LONG_GRASS_BASE_RIGHT:
          MapGridSetMetatileIdAt(newX, y + 4, METATILE_Fortree_SecretBase_LongGrass_BottomRight);
          break;
      }
    }
  }
}

/** 1:1 STRICT décomp `CutGrassSpriteCallback1` (fldeff_cut.c:553) : init des data + bascule Callback2. */
function CutGrassSpriteCallback1(sprite: DecompSprite, _rt: DecompRuntime): void {
  sprite.data[0] = 8;
  sprite.data[1] = 0;
  sprite.data[3] = 0;
  sprite.callback = CutGrassSpriteCallback2;
}

/** 1:1 STRICT décomp `CutGrassSpriteCallback2` (fldeff_cut.c:561) : rotation Sin/Cos autour du joueur
 *  (rayon croissant), 28 frames, puis bascule CallbackEnd. */
function CutGrassSpriteCallback2(sprite: DecompSprite, _rt: DecompRuntime): void {
  sprite.x2 = Sin(sprite.data[2], sprite.data[0]);
  sprite.y2 = Cos(sprite.data[2], sprite.data[0]);

  sprite.data[2] = (sprite.data[2] + 8) & 0xFF;
  sprite.data[0] += 1 + (sprite.data[3] >> 2); // >> 2 = /4
  sprite.data[3]++;

  if (sprite.data[1] !== 28)
    sprite.data[1]++;
  else
    sprite.callback = CutGrassSpriteCallbackEnd; // fin de rotation → nettoyage
}

/** 1:1 STRICT décomp `CutGrassSpriteCallbackEnd` (fldeff_cut.c:576) : détruit les 8 sprites, stoppe
 *  l'effet, dégèle les object events + déverrouille les contrôles (fin de la CS-Coupe). */
function CutGrassSpriteCallbackEnd(_sprite: DecompSprite, rt: DecompRuntime): void {
  if (!sCutGrassSpriteArrayPtr) return; // défensif : nettoyage déjà fait par le 1er sprite (array nullé)

  for (let i = 1; i < CUT_SPRITE_ARRAY_COUNT; i++)
    DestroySprite(rt.gSprites[sCutGrassSpriteArrayPtr[i]]);

  // 1:1 : FieldEffectStop(&gSprites[sCutGrassSpriteArrayPtr[0]], FLDEFF_CUT_GRASS). Garde de type
  // (le sprite existe toujours ici) ; fallback = retirer l'id de la liste active pour ne pas la coincer.
  const sprite0 = rt.gSprites[sCutGrassSpriteArrayPtr[0]];
  if (sprite0) FieldEffectStop(rt, sprite0, FLDEFF_CUT_GRASS);
  else FieldEffectActiveListRemove(FLDEFF_CUT_GRASS);
  sCutGrassSpriteArrayPtr = null; // 1:1 FREE_AND_SET_NULL
  ScriptUnfreezeObjectEvents();
  UnlockPlayerFieldControls();

  if (IsMewPlayingHideAndSeek() === true)
    ScriptContext_SetupScript('FarawayIsland_Interior_EventScript_HideMewWhenGrassCut');
}

/** 1:1 STRICT décomp `StartCutTreeFieldEffect` (fldeff_cut.c:642) :
 *    PlaySE(SE_M_CUT);
 *    FieldEffectActiveListRemove(FLDEFF_USE_CUT_ON_TREE);
 *    ScriptContext_Enable();
 *  `PlaySE(SE_M_CUT)` = le bruitage de coupe (se_m_cut.wav préchargé) — demandé par le user, wiré 1:1.
 *  `ScriptContext_Enable` reprend `EventScript_CutTree` après le
 *  `waitstate` → `goto EventScript_CutTreeDown` (l'arbre tombe via Movement_CutTreeDown + removeobject).
 *
 *  ⚠️ Le `waitstate` du port (script-opcodes-special.ts) attend un latch `SignalWaitState()` (= le
 *  pattern port pour « ScriptContext_Enable débloque le waitstate » ; les UI flows wallclock/starter
 *  l'appellent déjà). `ScriptContext_Enable` seul ne suffit pas (le waitstate est un native-poll, pas
 *  un check de status) → on appelle AUSSI `SignalWaitState()` (sinon script bloqué à `waitstate`).
 *  Import LAZY de SignalWaitState : `script-opcodes-special` est lourd (dispatcher special tire tout
 *  le graphe) → import statique = cycle ESM/TDZ `BG_SCREEN_SIZE` au boot. Appelé au runtime → lazy OK. */
function StartCutTreeFieldEffect(): void {
  PlaySE(SE_M_CUT);
  FieldEffectActiveListRemove(FLDEFF_USE_CUT_ON_TREE);
  ScriptContext_Enable();
  void import('./scrcmd').then(m => m.SignalWaitState());
}

/** 1:1 STRICT décomp `FldEff_UseCutOnTree` (fldeff_cut.c:300) :
 *    u8 taskId = CreateFieldMoveTask();
 *    gTasks[taskId].data[8/9] = (u32)StartCutTreeFieldEffect;  // fn stockée en moitiés
 *    IncrementGameStat(GAME_STAT_USED_CUT);
 *    return FALSE;
 *  Port : `CreateFieldMoveTask(StartCutTreeFieldEffect)` (la fn est passée directement, pas data[8/9]).
 *  ⚠️ DETTE mineure : `IncrementGameStat(GAME_STAT_USED_CUT)` non porté (stat cosmétique, comme PlaySE). */
export function FldEff_UseCutOnTree(_rt: DecompRuntime): number {
  CreateFieldMoveTask(StartCutTreeFieldEffect);
  return 0;  // FALSE
}
