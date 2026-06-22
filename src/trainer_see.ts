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

import type { DecompRuntime, DecompSprite } from './engine/system/decomp-runtime';
import { LoadSpriteSheet, IndexOfSpriteTileTag } from './sprite';
import { loadIndexedPngStrict } from '../harness/gba/png-loader';
import { ANIMCMD_FRAME, ANIMCMD_END, type AnimCmd } from './sprite';
import { gObjectEvents, TryGetObjectEventIdByLocalIdAndMap } from './event_object_movement';
import { gPlayerAvatar } from './field_player_avatar';
import { gFieldEffectArguments, FieldEffectStop } from './field_effect';
import { setFieldEffectAnims } from './field_effect_helpers';

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
