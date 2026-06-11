/**
 * battle_anim_psychic.ts — miroir PARTIEL de `src/battle_anim_psychic.c`
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Portés 1:1 :
 *  - AnimWallSparkle   (psychic.c:582) — étincelle Reflect / Light Screen / Mirror Coat
 *  - AnimBentSpoon     (psychic.c:621) — cuillère tordue de Kinesis
 *  - AnimPsychoBoost   (psychic.c:1119) — orbe Psycho Boost (blend + montée fixed-point)
 *  - AnimKinesisZapEnergy (battle_anim_effects_2.c:1442) — « zap » de Kinesis.
 *    ⚠ PLACEMENT : vit dans effects_2.c côté décomp ; placé ICI par le lot du
 *    port massif (dette douce : déménager si src/game/battle_anim_effects_2.ts naît).
 *  + tables affine `sAffineAnims_PsychoBoostOrb` (psychic.c:384-409) enregistrées
 *    dans le registre sprite-affine-extras (boucles AFFINEANIMCMD_LOOP déroulées).
 *
 * Pattern repo (battle_anim_rock.ts) : AUCUN import statique de l'interpréteur
 * (anti-cycle ESM) — accès lazy par `globalThis.__battleAnimInterpreter` ;
 * helpers décomp importés de ./battle_anim_mons.
 */
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { registerAffineAnim, registerAffineAnimTable } from '../engine/decomp-impls/sprite-affine-extras';
import {
  GetBattlerSpriteCoord,
  InitSpritePosToAnimAttacker,
  InitSpritePosToAnimTarget,
  SetSpriteCoordsToAnimAttackerCoords,
  StoreSpriteCallbackInData6,
  SetCallbackToStoredInData6,
  DestroySpriteAndMatrix,
  BATTLER_COORD_X,
  BATTLER_COORD_Y,
  BATTLER_COORD_X_2,
  BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { gBattleTypeFlags } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE } from '../engine/battle/constants';
import { REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, BLDCNT_EFFECT_BLEND } from '../engine/system/decomp-runtime';

type _VSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };

function _vItf(): {
  getArgs?: () => number[];
  getAttacker?: () => number;
  getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void;
  DestroyAnimVisualTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
/** Runtime central (SetGpuReg) — surface globale `__rt` (pattern battle_anim_throw.ts). */
function _rt(): { SetGpuReg?: (offset: number, value: number) => void } | undefined {
  return (globalThis as Record<string, unknown>).__rt as never;
}
/** 1:1 net `PlaySE12WithPanning(songNum, panning)` (battle_anim.c) : SE one-shot
 *  via `__PlaySE` (= PlaySE décomp, decomp-globals.ts:726). Panning = dette douce
 *  (SE mono), même statut que battle_anim_sound_tasks.ts. */
function _PlaySE(seId: number): void {
  (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(seId);
}

// ── Constantes décomp ────────────────────────────────────────────────────────
/** io_reg.h:610 `BLDCNT_TGT2_ALL` = TGT2_BG0|BG1|BG2|BG3|OBJ|BD (bits 8-13). */
const BLDCNT_TGT2_ALL = 0x3F00;
/** io_reg.h:613 `BLDALPHA_BLEND(target1, target2)` = ((target2) << 8) | (target1). */
function _BLDALPHA_BLEND(target1: number, target2: number): number {
  return (((target2 & 0xFF) << 8) | (target1 & 0xFF)) & 0xFFFF;
}
/** songs.h:210 `SE_M_TELEPORT` = 203 (SE joué par Psycho Boost case 1). */
const SE_M_TELEPORT = 203;
/** battle_anim.h `ANIM_ATTACKER` = 0. */
const ANIM_ATTACKER = 0;
/** battle.h `B_SIDE_PLAYER` = 0. */
const B_SIDE_PLAYER = 0;

// ── Helpers locaux (1:1, non exportés par battle_anim_mons.ts) ──────────────
/** 1:1 `IsDoubleBattle()` (battle_util.c) = gBattleTypeFlags & BATTLE_TYPE_DOUBLE. */
function _IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}
/** 1:1 `IsContest()` (battle_anim.c:1102) = !gMain.inBattle — pas de mode contest
 *  dans ce jeu (doctrine battle_anim_mons.ts:243) → toujours false. */
function _IsContest(): boolean {
  return false;
}
/** 1:1 `GetBattlerSide(battler)` = GetBattlerPosition(battler) & BIT_SIDE (BIT_SIDE=1). */
function _GetBattlerSide(battler: number): number {
  return battler & 1;
}
/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735) : attend
 *  `animEnded` puis bascule sur le callback stocké en data[6]. */
function _RunStoredCallbackWhenAnimEnds(sprite: _VSprite): void {
  if ((sprite as { animEnded?: boolean }).animEnded) SetCallbackToStoredInData6(sprite as never);
}
/** 1:1 `StartSpriteAnim(sprite, animNum)` (sprite.c) — modèle runtime : pose
 *  animNum + animBeginning (AnimateSprite redémarre la table de frames). */
function _StartSpriteAnim(sprite: unknown, animNum: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && animNum >= 0) {
    spA.animNum = animNum;
    spA.animBeginning = true;
    spA.animEnded = false;
  }
}
/** 1:1 `ChangeSpriteAffineAnim(sprite, animNum)` (sprite.c:1388) : bascule sur
 *  une autre anim de la table affine (modèle runtime : animNum + beginning,
 *  le ticker affine fait le restart — pas de reset de matrice). */
function _ChangeSpriteAffineAnim(sprite: unknown, animNum: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = animNum;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
}
/** Stocke « DestroyAnimSprite » dans data[6] (wrapper lazy anti-cycle —
 *  pattern battle_anim_effects_1.ts / battle_anim_ground.ts). */
function _StoreDestroyAnimSpriteInData6(sprite: _VSprite): void {
  StoreSpriteCallbackInData6(sprite as never, ((s: unknown) => { _vItf().DestroyAnimSprite?.(s); }) as never);
}

// ── Tables affine de l'orbe Psycho Boost — 1:1 psychic.c:384-409 ────────────
// 1:1 `sAffineAnim_PsychoBoostOrb_0` (battle_anim_psychic.c:384-397).
// Boucles AFFINEANIMCMD_LOOP déroulées (le registre extras ne modélise que le
// terminator) — sémantique sprite.c:1124-1161 : LOOP(n) rejoue le bloc depuis
// la borne LOOP précédente n fois (n+1 passages au total), LOOP(0) = borne.
//   FRAME(0x20,0x20,0,0) ; FRAME(0x10,0x10,0,17) ; LOOP(0)
//   [FRAME(-0x8,-0x8,0,10) ; FRAME(0x8,0x8,0,10)] × (4+1)   ← LOOP(4) ; LOOP(0)
//   [FRAME(-0x10,-0x10,0,5) ; FRAME(0x10,0x10,0,5)] × (7+1) ← LOOP(7) ; END
// NB : le C a un 2e LOOP(0) entre LOOP(4) et le bloc -0x10 (psychic.c:392) —
// il ne sert que de borne au LOOP(7) ; vérifié sprite.c:1147-1161 : la borne
// serait LOOP(4) sans lui → même bloc rejoué → déroulé strictement identique.
const _orb0Frames: { xScale: number; yScale: number; rotation: number; duration: number }[] = [
  { xScale: 0x20, yScale: 0x20, rotation: 0, duration: 0 },
  { xScale: 0x10, yScale: 0x10, rotation: 0, duration: 17 },
];
for (let i = 0; i < 5; i++) {
  _orb0Frames.push({ xScale: -0x8, yScale: -0x8, rotation: 0, duration: 10 });
  _orb0Frames.push({ xScale: 0x8, yScale: 0x8, rotation: 0, duration: 10 });
}
for (let i = 0; i < 8; i++) {
  _orb0Frames.push({ xScale: -0x10, yScale: -0x10, rotation: 0, duration: 5 });
  _orb0Frames.push({ xScale: 0x10, yScale: 0x10, rotation: 0, duration: 5 });
}
registerAffineAnim('sAffineAnim_PsychoBoostOrb_0', { frames: _orb0Frames, terminator: 'END' });
// 1:1 `sAffineAnim_PsychoBoostOrb_1` (psychic.c:399-403) : 0xFFEC = -0x14 (s16),
// l'orbe s'aplatit en X et s'étire en Y pendant 15 frames.
registerAffineAnim('sAffineAnim_PsychoBoostOrb_1', {
  frames: [{ xScale: -0x14, yScale: 0x18, rotation: 0, duration: 15 }],
  terminator: 'END',
});
// 1:1 `sAffineAnims_PsychoBoostOrb` (psychic.c:405-409).
registerAffineAnimTable('sAffineAnims_PsychoBoostOrb', {
  affineAnims: ['sAffineAnim_PsychoBoostOrb_0', 'sAffineAnim_PsychoBoostOrb_1'],
});

// ── Callbacks ────────────────────────────────────────────────────────────────

/** 1:1 `AnimWallSparkle` (battle_anim_psychic.c:582) : étincelle de Reflect /
 *  Light Screen / Mirror Coat. args [x, y, anchor (0=attacker), ignoreOffsets].
 *  Setup au 1er tick (data[0]==0 ; positions fixes par côté en double) puis
 *  destroy quand animEnded || affineAnimEnded. */
function AnimWallSparkle(sprite: _VSprite): void {
  if (sprite.data[0] === 0) {
    const args = _vItf().getArgs?.() ?? [0, 0, 0, 0];
    const ignoreOffsets = args[3] !== 0;
    const respectMonPicOffsets = !ignoreOffsets;
    if (!_IsContest() && _IsDoubleBattle()) {
      if (_GetBattlerSide(_vItf().getAttacker?.() ?? 0) === B_SIDE_PLAYER) {
        sprite.x = 72 - args[0];
        sprite.y = args[1] + 80;
      } else {
        sprite.x = args[0] + 176;
        sprite.y = args[1] + 40;
      }
    } else {
      if (args[2] === ANIM_ATTACKER) InitSpritePosToAnimAttacker(sprite as never, respectMonPicOffsets);
      else InitSpritePosToAnimTarget(sprite as never, respectMonPicOffsets);
    }
    sprite.invisible = false;
    sprite.data[0]++;
  } else {
    const sp = sprite as { animEnded?: boolean; affineAnimEnded?: boolean };
    if (sp.animEnded || sp.affineAnimEnded) DestroySpriteAndMatrix(sprite);
  }
}

/** 1:1 `AnimBentSpoon` (battle_anim_psychic.c:621) : cuillère tordue de Kinesis,
 *  sur l'attaquant (X_2 / Y_PIC_OFFSET). Côté ennemi → anim 1 (frames non
 *  flippées) décalée (-40, +10), data[1]=-1 ; côté joueur → (+40, -10),
 *  data[1]=1. Destroy à la fin de l'anim de frames. */
function AnimBentSpoon(sprite: _VSprite): void {
  const attacker = _vItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y_PIC_OFFSET);
  if (_GetBattlerSide(attacker) !== B_SIDE_PLAYER) {
    _StartSpriteAnim(sprite, 1);
    sprite.x -= 40;
    sprite.y += 10;
    sprite.data[1] = -1;
  } else {
    sprite.x += 40;
    sprite.y -= 10;
    sprite.data[1] = 1;
  }
  sprite.invisible = false;
  _StoreDestroyAnimSpriteInData6(sprite);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
}

/** 1:1 `AnimKinesisZapEnergy` (battle_anim_effects_2.c:1442) : « zap » d'énergie
 *  de Kinesis. args [x offset, y offset, vFlip]. Position attaquant ; miroir X
 *  + hFlip côté ennemi ; destroy à la fin de l'anim de frames.
 *  ⚠ PLACEMENT : décomp = effects_2.c (placé ici par le lot — dette douce). */
function AnimKinesisZapEnergy(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const attacker = _vItf().getAttacker?.() ?? 0;
  SetSpriteCoordsToAnimAttackerCoords(sprite);
  if (_GetBattlerSide(attacker) !== B_SIDE_PLAYER) sprite.x -= args[0];
  else sprite.x += args[0];
  sprite.y += args[1];
  const spFlip = sprite as { hFlip?: boolean; vFlip?: boolean };
  if (_GetBattlerSide(attacker) !== B_SIDE_PLAYER) {
    spFlip.hFlip = true;
    if (args[2]) spFlip.vFlip = true;
  } else {
    if (args[2]) spFlip.vFlip = true;
  }
  sprite.invisible = false;
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
  _StoreDestroyAnimSpriteInData6(sprite);
}

/** 1:1 `AnimPsychoBoost` (battle_anim_psychic.c:1119) : orbe de Psycho Boost.
 *  case 0 : position attaquant (X/Y) + BLDCNT blend EVA 8 / EVB 8 ;
 *  case 1 : attend la fin de l'affine 0 (grossit + pulse) → SE téléport +
 *  ChangeSpriteAffineAnim(1) (aplatissement) ; case 2 : EVA-- tous les 3 frames
 *  (fade) + montée fixed-point data[3]+=0x380 (y2 -= data[3]>>8, frac &0xFF),
 *  invisible quand EVA==0 ; case 3 : reset BLDCNT/BLDALPHA + destroy. */
function AnimPsychoBoost(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0: {
      const attacker = _vItf().getAttacker?.() ?? 0;
      sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X);
      sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y);
      if (_IsContest()) sprite.y += 12;
      sprite.data[1] = 8;
      _rt()?.SetGpuReg?.(REG_OFFSET_BLDCNT, BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND);
      _rt()?.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[1], 16 - sprite.data[1]));
      sprite.invisible = false;
      sprite.data[0]++;
      break;
    }
    case 1:
      if ((sprite as { affineAnimEnded?: boolean }).affineAnimEnded) {
        // 1:1 PlaySE12WithPanning(SE_M_TELEPORT, BattleAnimAdjustPanning(SOUND_PAN_ATTACKER))
        // — panning = dette douce (SE mono).
        _PlaySE(SE_M_TELEPORT);
        _ChangeSpriteAffineAnim(sprite, 1);
        sprite.data[0]++;
      }
      break;
    case 2:
      if (sprite.data[2]++ > 1) {
        sprite.data[2] = 0;
        sprite.data[1]--;
        _rt()?.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[1], 16 - sprite.data[1]));
        if (sprite.data[1] === 0) {
          sprite.data[0]++;
          sprite.invisible = true;
        }
      }
      sprite.data[3] += 0x380;
      sprite.y2 -= sprite.data[3] >> 8;
      sprite.data[3] &= 0xFF;
      break;
    case 3:
      _rt()?.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
      _rt()?.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
      _vItf().DestroyAnimSprite?.(sprite);
      break;
  }
}

registerAnimCallbacks({
  AnimWallSparkle: AnimWallSparkle as never,
  AnimBentSpoon: AnimBentSpoon as never,
  AnimKinesisZapEnergy: AnimKinesisZapEnergy as never,
  AnimPsychoBoost: AnimPsychoBoost as never,
});

// ════════════════════════════════════════════════════════════════════════════
// AnimQuestionMark (battle_anim_psychic.c:645) — le « ? » d'Amnesia
// (gQuestionMarkSpriteTemplate, ANIM_TAG_AMNESIA). Append-only 2026-06-11.
// ════════════════════════════════════════════════════════════════════════════
// Imports additionnels du bloc (hoistés ESM — légal en fin de fichier) :
import { gBattlerPartyIndexes as _qmPartyIdx } from '../engine/battle/state';
import {
  gPlayerParty as _qmPlayerParty, gEnemyParty as _qmEnemyParty,
  GetMonData as _qmGetMonData, MON_DATA_SPECIES as _QM_MON_DATA_SPECIES,
} from '../engine/battle/party-storage';
import { reverseDecompConstant as _qmRevConst } from '../engine/system/decomp-constants';
import { getMonFrontPicCoords as _qmFrontCoords, getMonBackPicCoords as _qmBackCoords } from './data/mon_pic_coords';

/** Runtime étendu du bloc (OAM brute + matrices affine) — pattern interpreter
 *  Cmd_createsprite (battle-anim-interpreter.ts:1045) / battle_anim_flying. */
function _qmRt(): {
  gba?: { oam?: Array<{ affineMode?: number }> };
  AllocOamMatrix?: () => number;
  FreeOamMatrix?: (m: number) => void;
} | undefined {
  return (globalThis as Record<string, unknown>).__rt as never;
}
// species du battler → nom (même dette douce que battle_anim_effects_3 :
// transformSpecies/illusion non modélisés).
function _qmBattlerSpeciesName(battler: number): string {
  const party = _GetBattlerSide(battler) !== B_SIDE_PLAYER ? _qmEnemyParty : _qmPlayerParty;
  const species = _qmGetMonData(party[_qmPartyIdx[battler]] as never, _QM_MON_DATA_SPECIES) as number;
  return _qmRevConst(species, 'SPECIES_') ?? 'SPECIES_NONE';
}
// 1:1 battle_anim_mons.c:2151 `GetBattlerSpriteCoordAttr` — cases WIDTH/HEIGHT
// (les seules consommées ici) ; back pic (joueur) / front pic (adverse).
// Transcription = battle_anim_effects_3.ts (même modèle).
const _QM_COORD_ATTR_HEIGHT = 0;
const _QM_COORD_ATTR_WIDTH = 1;
function _qmGetBattlerSpriteCoordAttr(battler: number, attr: number): number {
  const name = _qmBattlerSpeciesName(battler);
  const coords = _GetBattlerSide(battler) === B_SIDE_PLAYER ? _qmBackCoords(name) : _qmFrontCoords(name);
  return attr === _QM_COORD_ATTR_WIDTH ? coords.w : coords.h;
}

/** 1:1 `AnimQuestionMark` (battle_anim_psychic.c:645) : le « ? » apparaît au
 *  coin haut (gauche/droite selon le côté) de l'attaquant — x = ±largeur/2,
 *  y = -hauteur/2 (clamp y ≥ 16), joue son anim de frames (sAnims_QuestionMark)
 *  puis enchaîne sur le wobble affine (Step1). */
function AnimQuestionMark(sprite: _VSprite): void {
  const attacker = _vItf().getAttacker?.() ?? 0;
  let x = Math.trunc(_qmGetBattlerSpriteCoordAttr(attacker, _QM_COORD_ATTR_WIDTH) / 2);
  const y = Math.trunc(_qmGetBattlerSpriteCoordAttr(attacker, _QM_COORD_ATTR_HEIGHT) / -2);

  if (_GetBattlerSide(attacker) !== B_SIDE_PLAYER) // == B_SIDE_OPPONENT
    x = -x;

  sprite.x = GetBattlerSpriteCoord(attacker, BATTLER_COORD_X_2) + x;
  sprite.y = GetBattlerSpriteCoord(attacker, BATTLER_COORD_Y_PIC_OFFSET) + y;

  if (sprite.y < 16)
    sprite.y = 16;

  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, AnimQuestionMark_Step1 as never);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
}

/** 1:1 `AnimQuestionMark_Step1` (battle_anim_psychic.c:663) : bascule le sprite
 *  en affine NORMAL sur la table sAffineAnims_QuestionMark (wobble ±4°) —
 *  C : oam.affineMode = ST_OAM_AFFINE_NORMAL ; affineAnims = table ;
 *  InitSpriteAffineAnim. Modèle runtime = celui de Cmd_createsprite :
 *  affineAnimsTableName (registre extras, peuplé du généré) + affineMode 1
 *  (champ plat ET OAM, sinon le sync rétrograde l'écrase) + AllocOamMatrix
 *  (sa PROPRE matrice — slot 0 = matrice partagée). */
function AnimQuestionMark_Step1(sprite: _VSprite): void {
  const spF = sprite as {
    oamIndex?: number; matrixNum?: number; affineMode?: number;
    affineAnimsTableName?: string | null;
    affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean;
  };
  spF.affineMode = 1; // ST_OAM_AFFINE_NORMAL
  const oam = _qmRt()?.gba?.oam?.[spF.oamIndex ?? -1];
  if (oam) oam.affineMode = 1;
  spF.affineAnimsTableName = 'sAffineAnims_QuestionMark';
  sprite.data[0] = 0;
  // InitSpriteAffineAnim (sprite.c) : alloue la matrice + démarre l'anim 0.
  const m = _qmRt()?.AllocOamMatrix?.();
  if (m !== undefined && m >= 0) spF.matrixNum = m;
  spF.affineAnimNum = 0;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
  sprite.callback = AnimQuestionMark_Step2;
}

/** 1:1 `AnimQuestionMark_Step2` (battle_anim_psychic.c:672) : attend la fin du
 *  wobble (affineAnimEnded) → FreeOamMatrix + AFFINE_OFF, puis 18 frames
 *  d'attente → destroy. */
function AnimQuestionMark_Step2(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0: {
      const spF = sprite as { oamIndex?: number; matrixNum?: number; affineMode?: number };
      if ((sprite as { affineAnimEnded?: boolean }).affineAnimEnded) {
        if (spF.matrixNum !== undefined && spF.matrixNum > 0) // slot 0 = identité partagée, jamais libéré
          _qmRt()?.FreeOamMatrix?.(spF.matrixNum);
        spF.affineMode = 0; // ST_OAM_AFFINE_OFF
        const oam = _qmRt()?.gba?.oam?.[spF.oamIndex ?? -1];
        if (oam) oam.affineMode = 0;
        sprite.data[1] = 18;
        sprite.data[0]++;
      }
      break;
    }
    case 1:
      if (--sprite.data[1] === -1)
        _vItf().DestroyAnimSprite?.(sprite);
      break;
  }
}

registerAnimCallbacks({ AnimQuestionMark: AnimQuestionMark as never });

// ─── AnimDefensiveWall 1:1 (psychic.c:423-578) — LE DERNIER CALLBACK ────────
// Reflect/Light Screen/Safeguard : le mur translucide. Single non-contest :
// monbg(OPPONENT_LEFT) -> mon invisible (le rendu = la copie BG) -> fade
// BLDALPHA in -> rotation de palette (8 slots) -> fade out -> restore.
import { MoveBattlerSpriteToBG, ResetBattleAnimBg } from '../engine/battle/battle-anim-interpreter';
import { GetBattlerSpriteCoord as _dwCoord } from './battle_anim_mons';

type _DwSprite = { data: number[]; x: number; y: number; invisible?: boolean; subpriority?: number; oamIndex?: number; callback: unknown };
function _dwItf(): { getArgs?: () => number[]; getAttacker?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _dwRt(): { gSprites?: Map<number, { invisible?: boolean }>; gba?: { oam?: Array<{ priority?: number }> }; SetGpuReg?: (r: number, v: number) => void; gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void } } {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _dwOppSprite(): { invisible?: boolean } | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(1); // OPPONENT_LEFT = battler 1 (single)
  return sid !== undefined && sid !== 0xFF ? _dwRt().gSprites?.get(sid) : undefined;
}

/** 1:1 `AnimDefensiveWall` (psychic.c:423) — args [x, y, paletteTag]. */
function AnimDefensiveWall(sprite: _DwSprite): void {
  const itf = _dwItf();
  const args = itf.getArgs?.() ?? [0, 0, 0];
  const atk = itf.getAttacker?.() ?? 0;
  if ((atk & 1) === 0 /* B_SIDE_PLAYER */) {
    const oam = _dwRt().gba?.oam?.[sprite.oamIndex ?? -1];
    if (oam) oam.priority = 2;
    sprite.subpriority = 200;
  }
  // monbg du mon adverse (single : OPPONENT_LEFT=1, rank net -> BG1)
  MoveBattlerSpriteToBG(1, false, false);
  // position (single) : attaquant +/- args
  let a0 = args[0] | 0;
  if ((atk & 1) !== 0) a0 = -a0;
  sprite.x = _dwCoord(atk, 0) + a0;
  sprite.y = _dwCoord(atk, 1) + (args[1] | 0);
  sprite.invisible = false;
  // data[0] = offset palette OBJ du tag du mur (rotation Step3)
  const spSurf = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number) => number } | undefined;
  const palIdx = spSurf?.IndexOfSpritePaletteTag?.(args[2] | 0) ?? 0xFF;
  sprite.data[0] = palIdx !== 0xFF ? 256 + palIdx * 16 : 256;
  sprite.data[1] = 0; sprite.data[2] = 0; sprite.data[3] = 0; sprite.data[7] = 0;
  sprite.callback = _DefensiveWall_Step1;
}
function _DefensiveWall_Step1(sprite: _DwSprite): void {
  if (!sprite.data[7]) { sprite.data[7] = 1; return; } // 1 frame (la copie BG s'affiche)
  const mon = _dwOppSprite();
  if (mon) mon.invisible = true; // le rendu bascule sur la copie BG
  sprite.callback = _DefensiveWall_Step2;
  _DefensiveWall_Step2(sprite);
}
function _DefensiveWall_Step2(sprite: _DwSprite): void {
  _dwRt().SetGpuReg?.(0x52, ((16 - sprite.data[3]) << 8) | sprite.data[3]); // BLDALPHA
  if (sprite.data[3] === 13) sprite.callback = _DefensiveWall_Step3;
  else sprite.data[3]++;
}
function _DefensiveWall_Step3(sprite: _DwSprite): void {
  if (++sprite.data[1] === 2) {
    sprite.data[1] = 0;
    const pf = _dwRt().gPlttBufferFaded;
    const base = sprite.data[0];
    if (pf?.get && pf.set) {
      const color = pf.get(base + 8);
      for (let i = 8; i > 0; i--) pf.set(base + i, pf.get(base + i - 1));
      pf.set(base + 1, color);
    }
    if (++sprite.data[2] === 16) sprite.callback = _DefensiveWall_Step4;
  }
}
function _DefensiveWall_Step4(sprite: _DwSprite): void {
  _dwRt().SetGpuReg?.(0x52, ((16 - sprite.data[3]) << 8) | sprite.data[3]);
  if (--sprite.data[3] === -1) {
    const mon = _dwOppSprite();
    if (mon) mon.invisible = false;
    sprite.invisible = true;
    sprite.callback = _DefensiveWall_Step5;
  }
}
function _DefensiveWall_Step5(sprite: _DwSprite): void {
  ResetBattleAnimBg(false);
  _dwItf().DestroyAnimSprite?.(sprite);
}
registerAnimCallbacks({ AnimDefensiveWall: AnimDefensiveWall as never });

// ─── VAGUE F15 : Teleport + MeditateStretchAttacker (psychic.c) ─────────────
import {
  PrepareAffineAnimInTaskData as _tpPrep, RunAffineAnimFromTaskData as _tpRun,
  ResetSpriteRotScale as _tpReset,
} from './battle_anim_mons';
import { BATTLE_ANIM_AFFINE_ANIMS as _tpTables } from '../engine/decomp-data/auto/src/battle-anim-sprites';
import { registerAnimTasks as _tpRegT } from '../engine/battle/battle-anim-registry';
type _TpTask = { taskId: number; data: number[]; func?: unknown };
function _tpItf(): { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _tpSpriteId(b: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
/** 1:1 `AnimTask_Teleport` (1 hit) : spin affine 20f → monte 8px/f → invisible. */
function AnimTask_Teleport(task: _TpTask): void {
  const atk = _tpItf().getAttacker?.() ?? 0;
  const spriteId = _tpSpriteId(atk);
  if (spriteId === 0xFF) { _tpItf().DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = spriteId;
  task.data[1] = 0;
  task.data[2] = 0;
  task.data[3] = (atk & 1) !== 0 ? 4 : 8;
  _tpPrep(task, spriteId, (_tpTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['sAffineAnim_Teleport']);
  task.func = _Teleport_Step;
}
function _Teleport_Step(task: _TpTask): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x: number; y2: number; invisible?: boolean }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[0]);
  if (!sp) { _tpItf().DestroyAnimVisualTask?.(task.taskId); return; }
  switch (task.data[1]) {
    case 0:
      _tpRun(task);
      if (++task.data[2] > 19) task.data[1]++;
      break;
    case 1:
      if (task.data[3] !== 0) {
        sp.y2 -= 8;
        task.data[3]--;
      } else {
        sp.invisible = true;
        sp.x = 272;
        _tpReset(task.data[0]);
        _tpItf().DestroyAnimVisualTask?.(task.taskId);
      }
      break;
  }
}
/** 1:1 `AnimTask_MeditateStretchAttacker` (1 hit) : table affine simple. */
function AnimTask_MeditateStretchAttacker(task: _TpTask): void {
  const spriteId = _tpSpriteId(_tpItf().getAttacker?.() ?? 0);
  if (spriteId === 0xFF) { _tpItf().DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = spriteId;
  _tpPrep(task, spriteId, (_tpTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['sAffineAnim_MeditateStretchAttacker']);
  task.func = _Meditate_Step;
}
function _Meditate_Step(task: _TpTask): void {
  if (!_tpRun(task)) _tpItf().DestroyAnimVisualTask?.(task.taskId);
}
_tpRegT({
  AnimTask_Teleport: AnimTask_Teleport as never,
  AnimTask_MeditateStretchAttacker: AnimTask_MeditateStretchAttacker as never,
});
