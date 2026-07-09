/**
 * trainer_see.ts — Port 1:1 STRICT du décomp `src/trainer_see.c` (section emote icons).
 *
 * Source : D:/Projet 1/decomps/pokeemeraude/src/trainer_see.c
 *   - sOamData_Icons / sSpriteAnimTable_Icons / sSpriteTemplate_* (62-188)
 *   - FldEff_ExclamationMarkIcon / QuestionMarkIcon / HeartIcon (696-728)
 *   - SetIconSpriteData (731-743)
 *   - SpriteCB_TrainerIcons (745-767)
 *
 * Icône (! ? ♥) 16×16 qui apparaît 60 frames au-dessus d'un object event puis disparaît,
 * en rebondissant (sYVelocity = -5 → monte puis retombe). VRAI modèle callback : le sprite
 * porte `sprite.callback = SpriteCB_TrainerIcons` (tické par runSpriteCallbacks) + son anim
 * (ANIMCMD_FRAME(_, 60) END) compte 60 frames → animEnded → FieldEffectStop. ≠ l'ancien shim
 * (pool _activeEmotes + tickEmoteSprites externe + frame-stepping manuel, field-effect-emotes.ts).
 *
 * Déclenché par le spine : MovementAction_Emote{Exclamation,Question,Heart}Mark_Step0
 * (event_object_movement.c, porté object-events.ts) pose gFieldEffectArguments[0..2] =
 * localId/mapNum/mapGroup de l'object event puis FieldEffectStart(FLDEFF_X_ICON) → dispatcher
 * field-effect.ts → FldEff_X_Icon(rt).
 *
 * Adaptations (≠ approximations) :
 *   - Modèle SHEET (LoadSpriteSheet préchargé, partagé) au lieu du modèle décomp images[] /
 *     AllocSpriteTiles par spawn (= adaptation standard de tous nos field effects). Donc pas
 *     de cycle de vie de tiles dynamiques à gérer.
 *   - exclamation/question partagent une sheet 2 frames (imageValue 0/4) = 1:1
 *     sSpriteTemplate_ExclamationQuestionMark.images[0/1] ; le cœur a sa propre sheet.
 *   - Palette : emotion_exclamation.gbapal (validée) sous un tag DÉDIÉ (≠ le tag GENERAL_0 de
 *     l'ancien shim, qui collisionnait avec la vraie palette general_0). Le décomp pose
 *     oam.paletteNum=2 pour le cœur (slot réservé) — chez nous slot dynamique unique partagé.
 *   - Joueur : son object event a spriteId=-1 (visuel sur gPlayerAvatar.spriteId) → on résout
 *     via gPlayerAvatar (comme les reflets).
 */

import type { DecompRuntime, DecompSprite, DecompTask } from '../harness/runtime/decomp-runtime';
import { LoadSpriteSheet, IndexOfSpriteTileTag } from './sprite';
import { loadIndexedPngStrict } from '../harness/gba/png-loader';
import { ANIMCMD_FRAME, ANIMCMD_END, type AnimCmd } from './sprite';
import {
  gObjectEvents, TryGetObjectEventIdByLocalIdAndMap, OBJECT_EVENTS_COUNT,
  type ObjectEvent,
  ObjectEventIsMovementOverridden, ObjectEventSetHeldMovement,
  ObjectEventClearHeldMovementIfFinished, ObjectEventClearHeldMovement,
  ObjectEventCheckHeldMovementStatus,
  GetFaceDirectionMovementAction, GetWalkNormalMovementAction, GetJumpInPlaceMovementAction,
  GetCollisionAtCoords, GetCollisionFlagsAtCoords,
  SetTrainerMovementType, GetTrainerFacingDirectionMovementType,
  TryOverrideTemplateCoordsForObjectEvent, OverrideTemplateCoordsForObjectEvent,
  COLLISION_OUTSIDE_RANGE, COLLISION_OBJECT_EVENT,
  UnfreezeObjectEvents, FreezeObjectEventsExceptOne,
} from './event_object_movement';
import { gPlayerAvatar, PlayerGetDestCoords, CancelPlayerForcedMovement } from './field_player_avatar';
import { ScriptMovement_StartObjectMovementScript } from './script_movement';
// SetMovingNpcId : appelée via le pont globalThis.__SetMovingNpcId (posé par scrcmd, module
// propriétaire) — un import statique trainer_see→scrcmd ferme un cycle ESM/TDZ (DIR_SOUTH).
function _setMovingNpcId(id: number): void {
  (globalThis as { __SetMovingNpcId?: (id: number) => void }).__SetMovingNpcId?.(id);
}
import { gFieldEffectArguments, FieldEffectStop, FieldEffectStart } from './field_effect';
import { setFieldEffectAnims } from './field_effect_helpers';
import { FieldEffectActiveListContains } from './field_effect';
import { MoveCoords, GetOppositeDirection } from './engine/field/direction-coords';
import { CreateTask, DestroyTask, SetTaskFuncWithFollowupFunc, SwitchTaskToFollowupFunc } from './task';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { getScriptImage, getScriptOffset, ScriptContext_Enable } from './script';
import { FlagGet } from './engine/script/script-vars';
import { gSpecialVar, gSelectedObjectEvent } from './engine/script/script-vars';
import {
  MOVEMENT_ACTION_FACE_PLAYER, MOVEMENT_ACTION_STEP_END, MOVEMENT_ACTION_REVEAL_TRAINER,
} from '../include/constants/event_object_movement';
import {
  FLDEFF_EXCLAMATION_MARK_ICON as FLDEFF_EXCL_ICON,
  FLDEFF_ASH_PUFF,
} from '../include/constants/field_effects';
import { TRAINER_FLAGS_START } from '../include/constants/flags';
import { GetMonsStateToDoubles_2 } from './pokemon';
// Setups d'aggro appelés via le pont globalThis.__battleSetupAggro (posé par battle_setup,
// module propriétaire) — un import statique trainer_see→battle_setup tire tout le sous-arbre
// combat/shop/mail dans l'init précoce de decomp-globals (field_effect→trainer_see) → TDZ.
interface BattleSetupAggroBridge {
  ResetTrainerOpponentIds(): void;
  ConfigureAndSetUpOneTrainerBattle(objEventId: number, scriptOff: number): void;
  ConfigureTwoTrainersBattle(objEventId: number, scriptOff: number): void;
  SetUpTwoTrainersBattle(): void;
}
function _battleSetupAggro(): BattleSetupAggroBridge | undefined {
  return (globalThis as { __battleSetupAggro?: BattleSetupAggroBridge }).__battleSetupAggro;
}
function ResetTrainerOpponentIds(): void { _battleSetupAggro()?.ResetTrainerOpponentIds(); }
function ConfigureAndSetUpOneTrainerBattle(o: number, s: number): void {
  _battleSetupAggro()?.ConfigureAndSetUpOneTrainerBattle(o, s);
}
function ConfigureTwoTrainersBattle(o: number, s: number): void {
  _battleSetupAggro()?.ConfigureTwoTrainersBattle(o, s);
}
function SetUpTwoTrainersBattle(): void { _battleSetupAggro()?.SetUpTwoTrainersBattle(); }

const FE_BASE = '/decomp/em/field_effects';
const MAX_SPRITES = 64;

// 1:1 décomp FLDEFF_* (include/constants/field_effects.h). Const LOCALES (évite le cycle ESM
// trainer_see ↔ field-effect au top-level ; usage uniquement en corps de fonction).
const FLDEFF_EXCLAMATION_MARK_ICON = 0;
const FLDEFF_QUESTION_MARK_ICON = 33;
const FLDEFF_HEART_ICON = 46;

// ── Sprite data 1:1 (#define sX data[N], trainer_see.c:689-694) ──
//   sLocalId=data[0] sMapNum=data[1] sMapGroup=data[2] sYVelocity=data[3] sYOffset=data[4]
//   sFldEffId=data[7]
const ICON_TPF = 4;  // 16×16 = 2×2 tiles 4bpp

/** 1:1 décomp sSpriteAnimTable_Icons (trainer_see.c:150-166) : anim0=FRAME(0,60), anim1=
 *  FRAME(1,60), END. imageValue = slot × 4 (offset tile en mode sheet). */
const sAnims_ExclamationQuestion: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 60), ANIMCMD_END],          // anim 0 = exclamation (sheet frame 0)
  [ANIMCMD_FRAME(1 * ICON_TPF, 60), ANIMCMD_END], // anim 1 = question (sheet frame 1)
];
const sAnims_HeartIcon: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 60), ANIMCMD_END],
];

const TAG_ICONS_EXCLQ = 'TRSEE_ICONS_EXCLQ';
const TAG_ICONS_HEART = 'TRSEE_ICONS_HEART';

let _exclQTileStart = -1;
let _heartTileStart = -1;
let _iconsInit = false;
let _iconsInitPromise: Promise<void> | null = null;

/** Préchargement assets (2 sheets SEULEMENT — pas de palette). À call au boot field
 *  (= 1:1 décomp LoadFieldEffectGraphics). Idempotent.
 *
 *  1:1 décomp : les icônes !/? ont paletteTag=TAG_NONE → utilisent la palette JOUEUR
 *  (slot 0) ; le cœur force paletteNum=2 (PALSLOT_NPC_1). AUCUN n'alloue de slot palette
 *  dynamique [12,16) (qui est saturée : météo×2 + GENERAL_0 + GENERAL_1). Les glyphes
 *  !/? n'utilisent que les indices 0/14/15 (transparent/blanc/noir, identiques dans
 *  brendan.pal — vérifié). Cf. [[diag-glitches-2026-06-18]]. */
export function preloadEmoteIcons(_rt: DecompRuntime): Promise<void> {
  const stillAlloc = _iconsInit && IndexOfSpriteTileTag(TAG_ICONS_EXCLQ) !== 0xFF;
  if (stillAlloc) return Promise.resolve();
  if (_iconsInitPromise && !_iconsInit) return _iconsInitPromise;
  _iconsInit = false; _iconsInitPromise = null;
  _iconsInitPromise = (async () => {
    const excl = await loadIndexedPngStrict(`${FE_BASE}/emotion_exclamation.png`, 4);
    const qst = await loadIndexedPngStrict(`${FE_BASE}/emotion_question.png`, 4);
    const hrt = await loadIndexedPngStrict(`${FE_BASE}/emotion_heart.png`, 4);
    // sSpriteTemplate_ExclamationQuestionMark.images = [excl, question] → sheet 2 frames.
    const eq = new Uint8Array(excl.charData.length + qst.charData.length);
    eq.set(excl.charData, 0); eq.set(qst.charData, excl.charData.length);
    _exclQTileStart = LoadSpriteSheet({ data: eq, size: eq.length, tag: TAG_ICONS_EXCLQ });
    _heartTileStart = LoadSpriteSheet({ data: hrt.charData, size: hrt.charData.length, tag: TAG_ICONS_HEART });
    _iconsInit = true;
  })();
  return _iconsInitPromise;
}

/** Crée le sprite icône (= 1:1 décomp CreateSpriteAtEnd(template, 0, 0, subpriority)) sur
 *  la sheet préchargée + pose son anim. Renvoie le spriteId ou MAX_SPRITES si indispo. */
function _createIconSprite(rt: DecompRuntime, which: 'exclQ' | 'heart', subpriority: number): number {
  if (!_iconsInit) { void preloadEmoteIcons(rt); return MAX_SPRITES; }  // lazy fallback
  const tileStart = which === 'heart' ? _heartTileStart : _exclQTileStart;
  if (tileStart < 0) return MAX_SPRITES;
  // 1:1 décomp : !/? (TAG_NONE) → paletteNum 0 (PALSLOT_PLAYER, palette joueur) ; cœur →
  // paletteNum 2 (PALSLOT_NPC_1, posé dans FldEff_HeartIcon). Slots RÉSERVÉS [0,12), jamais
  // dynamiques (zone [12,16) saturée). Les glyphes !/? n'usent que 0/14/15 (transp/blanc/noir).
  const paletteBank = which === 'heart' ? 2 : 0;
  // 1:1 : CreateSpriteAtEnd alloue le slot gSprites depuis la fin (sinon l'icône 16×16
  // écrase un NPC slot bas → "moitié de maman", bug connu). x/y = 0 : SpriteCB_TrainerIcons
  // les pose à l'object event chaque frame.
  const result = rt.CreateSpriteAtOam({
    tileId: tileStart,
    paletteBank,
    x: 0, y: 0,
    shape: 0, size: 1,  // 16×16 (sOamData_Icons)
    priority: 1,        // 1:1 sOamData_Icons.priority = 1
    paletteMode: 0, affineMode: 0,
    subpriority: subpriority & 0xFF,
    fromEnd: true,      // 1:1 CreateSpriteAtEnd
  });
  const sprite = rt.gSprites[result.spriteId];
  if (!sprite) return MAX_SPRITES;
  setFieldEffectAnims(sprite, which === 'heart' ? sAnims_HeartIcon : sAnims_ExclamationQuestion, tileStart);
  sprite.subpriority = subpriority & 0xFF;
  return result.spriteId;
}

/** 1:1 décomp `SetIconSpriteData` (trainer_see.c:731-743). */
function SetIconSpriteData(rt: DecompRuntime, sprite: DecompSprite, fldEffId: number, animNum: number): void {
  const oam = rt.gba.oam[sprite.oamIndex];
  if (oam) oam.priority = 1;
  sprite.coordOffsetEnabled = true;
  sprite.data[0] = gFieldEffectArguments[0];  // sLocalId
  sprite.data[1] = gFieldEffectArguments[1];  // sMapNum
  sprite.data[2] = gFieldEffectArguments[2];  // sMapGroup
  sprite.data[3] = -5;                         // sYVelocity
  sprite.data[4] = 0;                          // sYOffset (sprite init le met à 0 ; explicite par sûreté slot réutilisé)
  sprite.data[7] = fldEffId;                   // sFldEffId
  rt.StartSpriteAnim(sprite.spriteId, animNum);
}

/** 1:1 décomp `FldEff_ExclamationMarkIcon` (trainer_see.c:696). */
export function FldEff_ExclamationMarkIcon(rt: DecompRuntime): number {
  const spriteId = _createIconSprite(rt, 'exclQ', 0x53);
  if (spriteId !== MAX_SPRITES) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) { sprite.callback = SpriteCB_TrainerIcons; SetIconSpriteData(rt, sprite, FLDEFF_EXCLAMATION_MARK_ICON, 0); }
  }
  return 0;
}

/** 1:1 décomp `FldEff_QuestionMarkIcon` (trainer_see.c:706). */
export function FldEff_QuestionMarkIcon(rt: DecompRuntime): number {
  const spriteId = _createIconSprite(rt, 'exclQ', 0x52);
  if (spriteId !== MAX_SPRITES) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) { sprite.callback = SpriteCB_TrainerIcons; SetIconSpriteData(rt, sprite, FLDEFF_QUESTION_MARK_ICON, 1); }
  }
  return 0;
}

/** 1:1 décomp `FldEff_HeartIcon` (trainer_see.c:716). Le décomp pose oam.paletteNum=2 (slot
 *  réservé du cœur) — chez nous slot dynamique unique partagé (la palette emote contient déjà
 *  les couleurs du cœur). */
export function FldEff_HeartIcon(rt: DecompRuntime): number {
  const spriteId = _createIconSprite(rt, 'heart', 0x52);
  if (spriteId !== MAX_SPRITES) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) { sprite.callback = SpriteCB_TrainerIcons; SetIconSpriteData(rt, sprite, FLDEFF_HEART_ICON, 0); }
  }
  return 0;
}

/** 1:1 décomp `SpriteCB_TrainerIcons` (trainer_see.c:745-767). Callback per-frame : suit
 *  l'object event (x/y/x2 recopiés) + rebond (sYOffset += sYVelocity) ; despawn quand l'object
 *  event a disparu OU l'anim 60 frames est finie (animEnded). */
export function SpriteCB_TrainerIcons(sprite: DecompSprite, rt: DecompRuntime): void {
  const { notFound, objectEventId } = TryGetObjectEventIdByLocalIdAndMap(sprite.data[0], sprite.data[1], sprite.data[2]);
  if (notFound || sprite.animEnded) {
    FieldEffectStop(rt, sprite, sprite.data[7]);  // sFldEffId
    return;
  }
  const objEvent = gObjectEvents[objectEventId];
  // 1:1 décomp : objEventSprite = &gSprites[gObjectEvents[objEventId].spriteId]. Le joueur
  // porte son visuel sur gPlayerAvatar.spriteId (slot OE = -1).
  const mainSpriteId = objEvent.isPlayer ? gPlayerAvatar.spriteId : objEvent.spriteId;
  const objSprite = mainSpriteId >= 0 ? rt.gSprites[mainSpriteId] : undefined;
  if (!objSprite) return;
  sprite.data[4] += sprite.data[3];      // sYOffset += sYVelocity
  sprite.x = objSprite.x;
  sprite.y = objSprite.y - 16;
  sprite.x2 = objSprite.x2;
  sprite.y2 = objSprite.y2 + sprite.data[4];
  if (sprite.data[4] !== 0) sprite.data[3]++;  // sYVelocity++
  else sprite.data[3] = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGGRO DRESSEURS — port 1:1 de trainer_see.c (vision + approche + combat).
// Source : D:/Projet 1/decomps/pokeemeraude/src/trainer_see.c (:66-812).
// ═══════════════════════════════════════════════════════════════════════════════

// ─── constants/trainer_types.h ────────────────────────────────────────────────
const TRAINER_TYPE_NONE = 0;             // eslint-disable-line @typescript-eslint/no-unused-vars
const TRAINER_TYPE_NORMAL = 1;
const TRAINER_TYPE_SEE_ALL_DIRECTIONS = 2; // eslint-disable-line @typescript-eslint/no-unused-vars
const TRAINER_TYPE_BURIED = 3;

// ─── constants/battle_setup.h (modes double) ─────────────────────────────────
const TRAINER_BATTLE_DOUBLE = 4;
const TRAINER_BATTLE_REMATCH_DOUBLE = 7;
const TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE = 8;

// ─── constants/pokemon.h (GetMonsStateToDoubles_2) ───────────────────────────
const PLAYER_HAS_TWO_USABLE_MONS = 2;

// ═══ EWRAM / IWRAM 1:1 trainer_see.c (:56-61) ═══════════════════════════════════
//
/** 1:1 décomp `struct ApproachingTrainer` (trainer_see.h). `trainerScriptPtr` = le
 *  pointeur ROM sur le script du dresseur ; en byte-VM = un curseur {off} dans
 *  l'image de scripts (getScriptImage()) sur l'opcode `trainerbattle`. */
interface ApproachingTrainer {
  objectEventId: number;
  /** offset (dans l'image byte-VM) de l'opcode `trainerbattle` du script du dresseur.
   *  -1 = non défini. (= `const u8 *trainerScriptPtr` décomp.) */
  trainerScriptOff: number;
  radius: number;
  taskId: number;
}

/** 1:1 décomp `gApproachingTrainers[2]` (trainer_see.c:58). */
const gApproachingTrainers: ApproachingTrainer[] = [
  { objectEventId: 0, trainerScriptOff: -1, radius: 0, taskId: 0 },
  { objectEventId: 0, trainerScriptOff: -1, radius: 0, taskId: 0 },
];
/** 1:1 décomp `gNoOfApproachingTrainers` (trainer_see.c:59). */
let gNoOfApproachingTrainers = 0;
/** 1:1 décomp `gApproachingTrainerId` (trainer_see.c:63, EWRAM). */
let gApproachingTrainerId = 0;
/** 1:1 décomp `gTrainerApproachedPlayer` (trainer_see.c:60). */
let gTrainerApproachedPlayer = false;
/** 1:1 décomp `gWhichTrainerToFaceAfterBattle` (trainer_see.c:56). */
let gWhichTrainerToFaceAfterBattle = 0;
/** 1:1 décomp `gPostBattleMovementScript[4]` (trainer_see.c:57). */
const gPostBattleMovementScript: number[] = [0, 0, 0, 0];

// ─── Accesseurs exposés (lus par battle_setup.ts + specials) ─────────────────
export function GetNoOfApproachingTrainers(): number { return gNoOfApproachingTrainers; }
export function GetApproachingTrainerId(): number { return gApproachingTrainerId; }
export function GetApproachingTrainerObjectEventId(i: number): number {
  return gApproachingTrainers[i]?.objectEventId ?? 0;
}
export function GetApproachingTrainerScriptOff(i: number): number {
  return gApproachingTrainers[i]?.trainerScriptOff ?? -1;
}
export function DidTrainerApproachPlayer(): boolean { return gTrainerApproachedPlayer; }
export function SetWhichTrainerToFaceAfterBattle(v: number): void { gWhichTrainerToFaceAfterBattle = v & 0xFF; }

// Pont globalThis pour battle_setup ↔ trainer_see (évite le cycle ESM : trainer_see
// importe battle_setup, donc battle_setup lit gApproachingTrainers via ce pont).
(globalThis as Record<string, unknown>).__trainerSee = {
  GetNoOfApproachingTrainers, GetApproachingTrainerId,
  GetApproachingTrainerObjectEventId, GetApproachingTrainerScriptOff,
  DidTrainerApproachPlayer,
  SetBuriedTrainerMovement: (o: ObjectEvent) => SetBuriedTrainerMovement(o),
  DoTrainerApproach: () => DoTrainerApproach(),
  IsTrainerApproachFinished: () => IsTrainerApproachFinished(),
  SetTrainerFacingDirection: () => SetTrainerFacingDirection(),
  SetWhichTrainerToFaceAfterBattle: (v: number) => SetWhichTrainerToFaceAfterBattle(v),
  TryPrepareSecondApproachingTrainer: () => TryPrepareSecondApproachingTrainer(),
  GetCurrentApproachingTrainerObjectEventId: () => GetCurrentApproachingTrainerObjectEventId(),
  GetChosenApproachingTrainerObjectEventId: (a: number) => GetChosenApproachingTrainerObjectEventId(a),
  PlayerFaceTrainerAfterBattle: () => PlayerFaceTrainerAfterBattle(),
  CheckForTrainersWantingBattle: () => CheckForTrainersWantingBattle(),
};

// ═══ Vision 1:1 (trainer_see.c:66-405) ═══════════════════════════════════════════

/** 1:1 décomp `sDirectionalApproachDistanceFuncs[]` (trainer_see.c:66-71). Indexé
 *  par (direction - 1) : south, north, west, east. */
const sDirectionalApproachDistanceFuncs: Array<(t: ObjectEvent, range: number, x: number, y: number) => number> = [];

/** 1:1 wrap s16 (les coords ObjectEvent sont des s16). */
function s16(v: number): number { return (v << 16) >> 16; }

/** 1:1 décomp `GetTrainerApproachDistanceSouth` (trainer_see.c:319). */
function GetTrainerApproachDistanceSouth(t: ObjectEvent, range: number, x: number, y: number): number {
  if (t.currentCoordsX === x && y > t.currentCoordsY && y <= t.currentCoordsY + range) {
    return s16(y - t.currentCoordsY);
  }
  return 0;
}
/** 1:1 décomp `GetTrainerApproachDistanceNorth` (trainer_see.c:330). */
function GetTrainerApproachDistanceNorth(t: ObjectEvent, range: number, x: number, y: number): number {
  if (t.currentCoordsX === x && y < t.currentCoordsY && y >= t.currentCoordsY - range) {
    return s16(t.currentCoordsY - y);
  }
  return 0;
}
/** 1:1 décomp `GetTrainerApproachDistanceWest` (trainer_see.c:341). */
function GetTrainerApproachDistanceWest(t: ObjectEvent, range: number, x: number, y: number): number {
  if (t.currentCoordsY === y && x < t.currentCoordsX && x >= t.currentCoordsX - range) {
    return s16(t.currentCoordsX - x);
  }
  return 0;
}
/** 1:1 décomp `GetTrainerApproachDistanceEast` (trainer_see.c:352). */
function GetTrainerApproachDistanceEast(t: ObjectEvent, range: number, x: number, y: number): number {
  if (t.currentCoordsY === y && x > t.currentCoordsX && x <= t.currentCoordsX + range) {
    return s16(x - t.currentCoordsX);
  }
  return 0;
}
sDirectionalApproachDistanceFuncs[0] = GetTrainerApproachDistanceSouth;
sDirectionalApproachDistanceFuncs[1] = GetTrainerApproachDistanceNorth;
sDirectionalApproachDistanceFuncs[2] = GetTrainerApproachDistanceWest;
sDirectionalApproachDistanceFuncs[3] = GetTrainerApproachDistanceEast;

/** 1:1 décomp `GetTrainerApproachDistance` (trainer_see.c:301). */
function GetTrainerApproachDistance(trainerObj: ObjectEvent): number {
  const { x, y } = PlayerGetDestCoords();
  if (trainerObj.trainerType === TRAINER_TYPE_NORMAL) {
    // can only see in one direction
    const approachDistance = sDirectionalApproachDistanceFuncs[trainerObj.facingDirection - 1](
      trainerObj, trainerObj.trainerRange_berryTreeId, x, y);
    return CheckPathBetweenTrainerAndPlayer(trainerObj, approachDistance, trainerObj.facingDirection);
  } else {
    // TRAINER_TYPE_SEE_ALL_DIRECTIONS, TRAINER_TYPE_BURIED
    for (let i = 0; i < sDirectionalApproachDistanceFuncs.length; i++) {
      const approachDistance = sDirectionalApproachDistanceFuncs[i](
        trainerObj, trainerObj.trainerRange_berryTreeId, x, y);
      // directions are 1-4 instead of 0-3. south north west east
      if (CheckPathBetweenTrainerAndPlayer(trainerObj, approachDistance, i + 1)) return approachDistance;
    }
  }
  return 0;
}

/** 1:1 décomp `CheckPathBetweenTrainerAndPlayer` (trainer_see.c:370). Masque la
 *  collision COLLISION_OUTSIDE_RANGE sur le trajet, sauvegarde/restaure range.rangeX/Y
 *  autour du test final (= movementRangeX/Y chez nous). */
function CheckPathBetweenTrainerAndPlayer(trainerObj: ObjectEvent, approachDistance: number, direction: number): number {
  if (approachDistance === 0) return 0;

  let x = trainerObj.currentCoordsX;
  let y = trainerObj.currentCoordsY;

  ({ x, y } = MoveCoords(direction, x, y));
  for (let i = 0; i < approachDistance - 1; i++) {
    // Check for collisions on approach, ignoring the "out of range" collision.
    const collision = GetCollisionFlagsAtCoords(trainerObj, x, y, direction);
    if (collision !== 0 && (collision & ~(1 << (COLLISION_OUTSIDE_RANGE - 1)))) return 0;
    ({ x, y } = MoveCoords(direction, x, y)); // 1:1 for-update MoveCoords(direction, &x, &y)
  }

  const rangeX = trainerObj.movementRangeX;
  const rangeY = trainerObj.movementRangeY;
  trainerObj.movementRangeX = 0;
  trainerObj.movementRangeY = 0;

  const collision = GetCollisionAtCoords(trainerObj, x, y, direction);

  trainerObj.movementRangeX = rangeX;
  trainerObj.movementRangeY = rangeY;
  if (collision === COLLISION_OBJECT_EVENT) return approachDistance;

  return 0;
}

// ═══ Machine TRSEE (trainer_see.c:74-664) ════════════════════════════════════════

// enum TRSEE_* (trainer_see.c:74-88)
const TRSEE_NONE = 0;
const TRSEE_EXCLAMATION = 1;
const TRSEE_EXCLAMATION_WAIT = 2;
const TRSEE_MOVE_TO_PLAYER = 3;
const TRSEE_PLAYER_FACE = 4;
const TRSEE_PLAYER_FACE_WAIT = 5;
const TRSEE_REVEAL_DISGUISE = 6;
const TRSEE_REVEAL_DISGUISE_WAIT = 7;
const TRSEE_REVEAL_BURIED = 8;
const TRSEE_BURIED_POP_OUT = 9;
const TRSEE_BURIED_JUMP = 10;
const TRSEE_REVEAL_BURIED_WAIT = 11;

// task->data[] (trainer_see.c:406-409)
// tFuncId=data[0] tTrainerRange=data[3] tOutOfAshSpriteId=data[4] tTrainerObjectEventId=data[7]

type TrseeFunc = (taskId: number, task: DecompTask, trainerObj: ObjectEvent) => boolean;

/** 1:1 décomp `TrainerSeeIdle` (TRSEE_NONE). */
function TrainerSeeIdle(_taskId: number, _task: DecompTask, _trainerObj: ObjectEvent): boolean {
  return false;
}

/** 1:1 décomp `TrainerExclamationMark` (trainer_see.c:459, TRSEE_EXCLAMATION). */
function TrainerExclamationMark(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  // ObjectEventGetLocalIdAndMap(trainerObj, &gFieldEffectArguments[0..2])
  gFieldEffectArguments[0] = trainerObj.localId;
  gFieldEffectArguments[1] = trainerObj.mapNum;
  gFieldEffectArguments[2] = trainerObj.mapGroup;
  FieldEffectStart(FLDEFF_EXCL_ICON);
  const direction = GetFaceDirectionMovementAction(trainerObj.facingDirection);
  ObjectEventSetHeldMovement(trainerObj, direction);
  task.data[0]++; // TRSEE_EXCLAMATION_WAIT
  return true;
}

/** 1:1 décomp `WaitTrainerExclamationMark` (trainer_see.c:474, TRSEE_EXCLAMATION_WAIT). */
function WaitTrainerExclamationMark(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  if (FieldEffectActiveListContains(FLDEFF_EXCL_ICON)) {
    return false;
  } else {
    task.data[0]++; // TRSEE_MOVE_TO_PLAYER
    if (trainerObj.movementType === 'MOVEMENT_TYPE_TREE_DISGUISE' || trainerObj.movementType === 'MOVEMENT_TYPE_MOUNTAIN_DISGUISE') {
      task.data[0] = TRSEE_REVEAL_DISGUISE;
    }
    if (trainerObj.movementType === 'MOVEMENT_TYPE_BURIED') {
      task.data[0] = TRSEE_REVEAL_BURIED;
    }
    return true;
  }
}

/** 1:1 décomp `TrainerMoveToPlayer` (trainer_see.c:490, TRSEE_MOVE_TO_PLAYER). */
function TrainerMoveToPlayer(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  if (!ObjectEventIsMovementOverridden(trainerObj) || ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    if (task.data[3]) { // tTrainerRange
      ObjectEventSetHeldMovement(trainerObj, GetWalkNormalMovementAction(trainerObj.facingDirection));
      task.data[3]--;
    } else {
      ObjectEventSetHeldMovement(trainerObj, MOVEMENT_ACTION_FACE_PLAYER);
      task.data[0]++; // TRSEE_PLAYER_FACE
    }
  }
  return false;
}

/** 1:1 décomp `PlayerFaceApproachingTrainer` (trainer_see.c:509, TRSEE_PLAYER_FACE). */
function PlayerFaceApproachingTrainer(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  if (ObjectEventIsMovementOverridden(trainerObj) && !ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    return false;
  }

  // Set trainer's movement type so they stop and remain facing that direction
  SetTrainerMovementType(trainerObj, GetTrainerFacingDirectionMovementType(trainerObj.facingDirection));
  TryOverrideTemplateCoordsForObjectEvent(trainerObj, GetTrainerFacingDirectionMovementType(trainerObj.facingDirection));
  OverrideTemplateCoordsForObjectEvent(trainerObj);

  const playerObj = gObjectEvents[gPlayerAvatar.objectEventId];
  if (ObjectEventIsMovementOverridden(playerObj) && !ObjectEventClearHeldMovementIfFinished(playerObj)) {
    return false;
  }

  CancelPlayerForcedMovement();
  ObjectEventSetHeldMovement(gObjectEvents[gPlayerAvatar.objectEventId],
    GetFaceDirectionMovementAction(GetOppositeDirection(trainerObj.facingDirection)));
  task.data[0]++; // TRSEE_PLAYER_FACE_WAIT
  return false;
}

/** 1:1 décomp `WaitPlayerFaceApproachingTrainer` (trainer_see.c:532, TRSEE_PLAYER_FACE_WAIT). */
function WaitPlayerFaceApproachingTrainer(taskId: number, _task: DecompTask, _trainerObj: ObjectEvent): boolean {
  const playerObj = gObjectEvents[gPlayerAvatar.objectEventId];
  if (!ObjectEventIsMovementOverridden(playerObj) || ObjectEventClearHeldMovementIfFinished(playerObj)) {
    SwitchTaskToFollowupFunc(taskId);
  }
  return false;
}

/** 1:1 décomp `RevealDisguisedTrainer` (trainer_see.c:543, TRSEE_REVEAL_DISGUISE). */
function RevealDisguisedTrainer(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  if (!ObjectEventIsMovementOverridden(trainerObj) || ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    ObjectEventSetHeldMovement(trainerObj, MOVEMENT_ACTION_REVEAL_TRAINER);
    task.data[0]++; // TRSEE_REVEAL_DISGUISE_WAIT
  }
  return false;
}

/** 1:1 décomp `WaitRevealDisguisedTrainer` (trainer_see.c:554, TRSEE_REVEAL_DISGUISE_WAIT). */
function WaitRevealDisguisedTrainer(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  if (ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    task.data[0] = TRSEE_MOVE_TO_PLAYER;
  }
  return false;
}

/** 1:1 décomp `RevealBuriedTrainer` (trainer_see.c:562, TRSEE_REVEAL_BURIED). */
function RevealBuriedTrainer(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  if (!ObjectEventIsMovementOverridden(trainerObj) || ObjectEventClearHeldMovementIfFinished(trainerObj)) {
    ObjectEventSetHeldMovement(trainerObj, MOVEMENT_ACTION_FACE_PLAYER);
    task.data[0]++;
  }
  return false;
}

/** 1:1 décomp `PopOutOfAshBuriedTrainer` (trainer_see.c:573, TRSEE_BURIED_POP_OUT). */
function PopOutOfAshBuriedTrainer(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  if (ObjectEventCheckHeldMovementStatus(trainerObj)) {
    const rt = getRuntime();
    const objSprite = rt.gSprites[trainerObj.spriteId];
    gFieldEffectArguments[0] = trainerObj.currentCoordsX;
    gFieldEffectArguments[1] = trainerObj.currentCoordsY;
    gFieldEffectArguments[2] = (objSprite ? objSprite.subpriority : 0) - 1;
    gFieldEffectArguments[3] = 2;
    task.data[4] = FieldEffectStart(FLDEFF_ASH_PUFF); // tOutOfAshSpriteId
    task.data[0]++;
  }
  return false;
}

/** 1:1 décomp `JumpInPlaceBuriedTrainer` (trainer_see.c:589, TRSEE_BURIED_JUMP). */
function JumpInPlaceBuriedTrainer(_taskId: number, task: DecompTask, trainerObj: ObjectEvent): boolean {
  const rt = getRuntime();
  const ashSprite = rt.gSprites[task.data[4]]; // tOutOfAshSpriteId
  if (ashSprite && ashSprite.animCmdIndex === 2) {
    trainerObj.fixedPriority = false;
    trainerObj.triggerGroundEffectsOnMove = true;

    const sprite = rt.gSprites[trainerObj.spriteId];
    if (sprite) {
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam) oam.priority = 2;
    }
    ObjectEventClearHeldMovementIfFinished(trainerObj);
    ObjectEventSetHeldMovement(trainerObj, GetJumpInPlaceMovementAction(trainerObj.facingDirection));
    task.data[0]++;
  }
  return false;
}

/** 1:1 décomp `WaitRevealBuriedTrainer` (trainer_see.c:610, TRSEE_REVEAL_BURIED_WAIT). */
function WaitRevealBuriedTrainer(_taskId: number, task: DecompTask, _trainerObj: ObjectEvent): boolean {
  if (!FieldEffectActiveListContains(FLDEFF_ASH_PUFF)) {
    task.data[0] = TRSEE_MOVE_TO_PLAYER;
  }
  return false;
}

/** 1:1 décomp `sTrainerSeeFuncList[]` (trainer_see.c:90-104). */
const sTrainerSeeFuncList: TrseeFunc[] = [];
sTrainerSeeFuncList[TRSEE_NONE] = TrainerSeeIdle;
sTrainerSeeFuncList[TRSEE_EXCLAMATION] = TrainerExclamationMark;
sTrainerSeeFuncList[TRSEE_EXCLAMATION_WAIT] = WaitTrainerExclamationMark;
sTrainerSeeFuncList[TRSEE_MOVE_TO_PLAYER] = TrainerMoveToPlayer;
sTrainerSeeFuncList[TRSEE_PLAYER_FACE] = PlayerFaceApproachingTrainer;
sTrainerSeeFuncList[TRSEE_PLAYER_FACE_WAIT] = WaitPlayerFaceApproachingTrainer;
sTrainerSeeFuncList[TRSEE_REVEAL_DISGUISE] = RevealDisguisedTrainer;
sTrainerSeeFuncList[TRSEE_REVEAL_DISGUISE_WAIT] = WaitRevealDisguisedTrainer;
sTrainerSeeFuncList[TRSEE_REVEAL_BURIED] = RevealBuriedTrainer;
sTrainerSeeFuncList[TRSEE_BURIED_POP_OUT] = PopOutOfAshBuriedTrainer;
sTrainerSeeFuncList[TRSEE_BURIED_JUMP] = JumpInPlaceBuriedTrainer;
sTrainerSeeFuncList[TRSEE_REVEAL_BURIED_WAIT] = WaitRevealBuriedTrainer;

/** 1:1 décomp `sTrainerSeeFuncList2[]` (trainer_see.c:106-118). */
const sTrainerSeeFuncList2: TrseeFunc[] = [
  RevealBuriedTrainer,
  PopOutOfAshBuriedTrainer,
  JumpInPlaceBuriedTrainer,
  WaitRevealBuriedTrainer,
];

/** 1:1 décomp `InitTrainerApproachTask` (trainer_see.c:412). */
function InitTrainerApproachTask(trainerObj: ObjectEvent, range: number): void {
  gApproachingTrainers[gNoOfApproachingTrainers].taskId = CreateTask((t: DecompTask) => Task_RunTrainerSeeFuncList(t.taskId), 0x50);
  const task = getRuntime().gTasks[gApproachingTrainers[gNoOfApproachingTrainers].taskId];
  task.data[3] = range; // tTrainerRange
  task.data[7] = gApproachingTrainers[gNoOfApproachingTrainers].objectEventId; // tTrainerObjectEventId
}

/** 1:1 décomp `StartTrainerApproach(followupFunc)` (trainer_see.c:422). */
function StartTrainerApproach(followupFunc: (taskId: number) => void): void {
  let taskId: number;
  if (gApproachingTrainerId === 0) taskId = gApproachingTrainers[0].taskId;
  else taskId = gApproachingTrainers[1].taskId;

  const taskFunc = (t: DecompTask): void => Task_RunTrainerSeeFuncList(t.taskId);
  SetTaskFuncWithFollowupFunc(taskId, taskFunc, (t: DecompTask) => followupFunc(t.taskId));
  getRuntime().gTasks[taskId].data[0] = TRSEE_EXCLAMATION;
  Task_RunTrainerSeeFuncList(taskId);
}

/** 1:1 décomp `Task_RunTrainerSeeFuncList` (trainer_see.c:437). */
function Task_RunTrainerSeeFuncList(taskId: number): void {
  const task = getRuntime().gTasks[taskId];
  const trainerObj = gObjectEvents[task.data[7]]; // tTrainerObjectEventId

  if (!trainerObj.active) {
    SwitchTaskToFollowupFunc(taskId);
  } else {
    while (sTrainerSeeFuncList[task.data[0]](taskId, task, trainerObj));
  }
}

// tObjEvent = data[1] (Task_SetBuriedTrainerMovement)

/** 1:1 décomp `Task_SetBuriedTrainerMovement` (trainer_see.c:623). Le décomp stocke
 *  le pointeur objEvent en 2 halfwords dans data[1..2] (LoadWordFromTwoHalfwords) ;
 *  chez nous on stocke directement l'objectEventId (index) dans data[1]. */
function Task_SetBuriedTrainerMovement(taskId: number): void {
  const task = getRuntime().gTasks[taskId];
  const objEvent = gObjectEvents[task.data[1]]; // tObjEvent (= index chez nous)

  if (!task.data[7]) {
    ObjectEventClearHeldMovement(objEvent);
    task.data[7]++;
  }
  sTrainerSeeFuncList2[task.data[0]](taskId, task, objEvent);
  if (task.data[0] === (sTrainerSeeFuncList2.length - 1) && !FieldEffectActiveListContains(FLDEFF_ASH_PUFF)) {
    SetTrainerMovementType(objEvent, GetTrainerFacingDirectionMovementType(objEvent.facingDirection));
    TryOverrideTemplateCoordsForObjectEvent(objEvent, GetTrainerFacingDirectionMovementType(objEvent.facingDirection));
    DestroyTask(taskId);
  } else {
    objEvent.heldMovementFinished = false;
  }
}

/** 1:1 décomp `SetBuriedTrainerMovement(objEvent)` (trainer_see.c:643). Appelé quand
 *  un dresseur enterré reçoit le movement reveal_trainer par interaction directe. */
export function SetBuriedTrainerMovement(objEvent: ObjectEvent): void {
  const taskId = CreateTask((t: DecompTask) => Task_SetBuriedTrainerMovement(t.taskId), 0);
  // StoreWordInTwoHalfwords(&task->tObjEvent, (u32)objEvent) → on range l'index.
  const idx = gObjectEvents.indexOf(objEvent);
  getRuntime().gTasks[taskId].data[1] = idx >= 0 ? idx : 0;
}

/** 1:1 décomp `DoTrainerApproach(void)` (trainer_see.c:648). */
export function DoTrainerApproach(): void {
  StartTrainerApproach((taskId) => Task_EndTrainerApproach(taskId));
}

/** 1:1 décomp `Task_EndTrainerApproach` (trainer_see.c:653). DestroyTask +
 *  ScriptContext_Enable → relâche le `waitstate` opcode qui suit `special DoTrainerApproach`
 *  (def_special waitstate=1). Chez nous ce waitstate attend SignalWaitState : on émet donc
 *  le signal (équivalent du ScriptContext_Enable décomp qui reprend un contexte waitstate). */
function Task_EndTrainerApproach(taskId: number): void {
  DestroyTask(taskId);
  ScriptContext_Enable();
  (globalThis as { __SignalWaitState?: () => void }).__SignalWaitState?.();
}

/** True tant que la task d'approche du dresseur courant tourne encore (poll utilisé
 *  par le special-flow DoTrainerApproach, à la place du blocage ScriptContext_Stop
 *  → ScriptContext_Enable du décomp : ici Task_EndTrainerApproach détruit la task). */
export function IsTrainerApproachFinished(): boolean {
  const taskId = gApproachingTrainerId === 0 ? gApproachingTrainers[0].taskId : gApproachingTrainers[1].taskId;
  const task = getRuntime().gTasks[taskId];
  return !task || !task.isActive;
}

/** 1:1 décomp `TryPrepareSecondApproachingTrainer(void)` (trainer_see.c:666). */
export function TryPrepareSecondApproachingTrainer(): void {
  if (gNoOfApproachingTrainers === 2) {
    if (gApproachingTrainerId === 0) {
      gApproachingTrainerId++;
      gSpecialVar.Result = 1; // TRUE
      UnfreezeObjectEvents();
      FreezeObjectEventsExceptOne(gApproachingTrainers[1].objectEventId);
    } else {
      gApproachingTrainerId = 0;
      gSpecialVar.Result = 0; // FALSE
    }
  } else {
    gSpecialVar.Result = 0; // FALSE
  }
}

// ═══ CheckForTrainersWantingBattle / CheckTrainer (trainer_see.c:189-299) ══════════

/** 1:1 byte-VM de `GetTrainerFlagFromScriptPointer(data)` (battle_setup.c:1215) :
 *  lit le trainer u16 à l'offset (opcode+2) dans l'image → flag battu. */
function GetTrainerFlagFromScriptOffset(off: number): boolean {
  const img = getScriptImage();
  // TrainerBattleLoadArg16(data + 2) : u16 LE à off+2 (off = opcode trainerbattle).
  const flag = (img[off + 2] | (img[off + 3] << 8)) & 0xFFFF;
  return FlagGet(TRAINER_FLAGS_START + flag);
}

/** Résout l'offset de l'opcode `trainerbattle` du script d'un NPC (= le pointeur
 *  ROM `GetObjectEventScriptPointerByObjectEventId` décomp). -1 si absent. */
function GetTrainerScriptOffset(objectEventId: number): number {
  const label = gObjectEvents[objectEventId]?.scriptLabel;
  if (!label) return -1;
  const off = getScriptOffset(label);
  return off === undefined ? -1 : off;
}

/** 1:1 décomp `CheckTrainer(objectEventId)` (trainer_see.c:248). Version byte-VM :
 *  le « scriptPtr » = un offset dans l'image ; `scriptPtr[1]` (mode) = img[off+1].
 *  Pyramid/Hill exemptés (mêmes conventions que GetTrainerFlag battle_setup.ts). */
function CheckTrainer(objectEventId: number): number {
  let numTrainers = 1;

  // InTrainerHill()==TRUE → GetTrainerHillTrainerScript (non porté : hill exempt) ;
  // sinon GetObjectEventScriptPointerByObjectEventId(objectEventId).
  const scriptOff = GetTrainerScriptOffset(objectEventId);

  // CurrentBattlePyramidLocation() != PYRAMID_LOCATION_NONE → GetBattlePyramidTrainerFlag ;
  // InTrainerHill()==TRUE → GetHillTrainerFlag ; sinon GetTrainerFlagFromScriptPointer.
  // (Pyramid/Hill = jamais actifs hors ces donjons → chemin `else`, 1:1 GetTrainerFlag.)
  if (scriptOff < 0) return 0;
  if (GetTrainerFlagFromScriptOffset(scriptOff)) return 0;

  const approachDistance = GetTrainerApproachDistance(gObjectEvents[objectEventId]);

  if (approachDistance !== 0) {
    const img = getScriptImage();
    const mode = img[scriptOff + 1]; // scriptPtr[1] = battle mode
    if (mode === TRAINER_BATTLE_DOUBLE
     || mode === TRAINER_BATTLE_REMATCH_DOUBLE
     || mode === TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE) {
      if (GetMonsStateToDoubles_2() !== PLAYER_HAS_TWO_USABLE_MONS) return 0;
      numTrainers = 2;
    }

    gApproachingTrainers[gNoOfApproachingTrainers].objectEventId = objectEventId;
    gApproachingTrainers[gNoOfApproachingTrainers].trainerScriptOff = scriptOff;
    gApproachingTrainers[gNoOfApproachingTrainers].radius = approachDistance;
    InitTrainerApproachTask(gObjectEvents[objectEventId], approachDistance - 1);
    gNoOfApproachingTrainers++;

    return numTrainers;
  }

  return 0;
}

/** 1:1 décomp `CheckForTrainersWantingBattle(void)` (trainer_see.c:191). */
export function CheckForTrainersWantingBattle(): boolean {
  gNoOfApproachingTrainers = 0;
  gApproachingTrainerId = 0;

  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if (!gObjectEvents[i].active) continue;
    if (gObjectEvents[i].trainerType !== TRAINER_TYPE_NORMAL && gObjectEvents[i].trainerType !== TRAINER_TYPE_BURIED) continue;

    const numTrainers = CheckTrainer(i);
    if (numTrainers === 2) break;
    if (numTrainers === 0) continue;

    if (gNoOfApproachingTrainers > 1) break;
    if (GetMonsStateToDoubles_2() !== PLAYER_HAS_TWO_USABLE_MONS) break; // one trainer found and cant have a double battle
  }

  if (gNoOfApproachingTrainers === 1) {
    ResetTrainerOpponentIds();
    ConfigureAndSetUpOneTrainerBattle(
      gApproachingTrainers[gNoOfApproachingTrainers - 1].objectEventId,
      gApproachingTrainers[gNoOfApproachingTrainers - 1].trainerScriptOff);
    gTrainerApproachedPlayer = true;
    return true;
  } else if (gNoOfApproachingTrainers === 2) {
    ResetTrainerOpponentIds();
    for (let i = 0; i < gNoOfApproachingTrainers; i++, gApproachingTrainerId++) {
      ConfigureTwoTrainersBattle(gApproachingTrainers[i].objectEventId, gApproachingTrainers[i].trainerScriptOff);
    }
    SetUpTwoTrainersBattle();
    gApproachingTrainerId = 0;
    gTrainerApproachedPlayer = true;
    return true;
  } else {
    gTrainerApproachedPlayer = false;
    return false;
  }
}

/** 1:1 décomp `SetTrainerFacingDirection(void)` (battle_setup.c:1224). Pose le
 *  movement-type du dresseur en interaction (gSelectedObjectEvent) pour qu'il reste
 *  face à cette direction. Vit dans trainer_see (deps eom déjà importées) plutôt que
 *  battle_setup (évite d'y ajouter une arête statique eom). */
export function SetTrainerFacingDirection(): void {
  const objectEvent = gObjectEvents[gSelectedObjectEvent.index];
  if (!objectEvent) return;
  SetTrainerMovementType(objectEvent, GetTrainerFacingDirectionMovementType(objectEvent.facingDirection));
}

/** 1:1 décomp `GetCurrentApproachingTrainerObjectEventId` (trainer_see.c:770). */
export function GetCurrentApproachingTrainerObjectEventId(): number {
  if (gApproachingTrainerId === 0) return gApproachingTrainers[0].objectEventId;
  else return gApproachingTrainers[1].objectEventId;
}

/** 1:1 décomp `GetChosenApproachingTrainerObjectEventId(arrayId)` (trainer_see.c:778). */
export function GetChosenApproachingTrainerObjectEventId(arrayId: number): number {
  if (arrayId >= gApproachingTrainers.length) return 0;
  else if (arrayId === 0) return gApproachingTrainers[0].objectEventId;
  else return gApproachingTrainers[1].objectEventId;
}

/** 1:1 décomp `PlayerFaceTrainerAfterBattle(void)` (trainer_see.c:794). La décomp
 *  appelle `ScriptMovement_StartObjectMovementScript(LOCALID_PLAYER, mapNum, mapGroup,
 *  script)` (résolution localId→objEventId interne, signature 1:1 restaurée) ; on
 *  passe par l'identité de l'object event joueur (équivalent, robuste au localId
 *  effectif du player spawn). SetMovingNpcId(LOCALID_PLAYER) pose l'id attendu
 *  par waitmovement. */
const LOCALID_PLAYER = 255;
export function PlayerFaceTrainerAfterBattle(): void {
  let objEvent: ObjectEvent;
  if (gTrainerApproachedPlayer === true) {
    objEvent = gObjectEvents[gApproachingTrainers[gWhichTrainerToFaceAfterBattle].objectEventId];
    gPostBattleMovementScript[0] = GetFaceDirectionMovementAction(GetOppositeDirection(objEvent.facingDirection));
    gPostBattleMovementScript[1] = MOVEMENT_ACTION_STEP_END;
  } else {
    objEvent = gObjectEvents[gPlayerAvatar.objectEventId];
    gPostBattleMovementScript[0] = GetFaceDirectionMovementAction(objEvent.facingDirection);
    gPostBattleMovementScript[1] = MOVEMENT_ACTION_STEP_END;
  }
  const playerObj = gObjectEvents[gPlayerAvatar.objectEventId];
  ScriptMovement_StartObjectMovementScript(
    playerObj.localId, playerObj.mapNum, playerObj.mapGroup,
    Uint8Array.from([gPostBattleMovementScript[0], gPostBattleMovementScript[1]]));
  _setMovingNpcId(LOCALID_PLAYER);
}
