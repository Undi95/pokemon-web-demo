/**
 * battle_anim_electric.ts — miroir PARTIEL de src/battle_anim_electric.c
 * (décomp pokeemeraude), port massif 2026-06-11.
 *
 * Callbacks portés (avec leurs _Step) : AnimLightning, AnimSparkElectricity,
 * AnimZapCannonSpark, AnimThunderboltOrb, AnimSparkElectricityFlashing,
 * AnimElectricity, AnimThunderWave, AnimGrowingChargeOrb, AnimElectricPuff,
 * AnimVoltTackleOrbSlide. Les templates (gXxxSpriteTemplate) viennent du
 * généré (battle-anim-sprites.ts) via le bridge — seul le callback est manuel.
 */
import { CreateSprite } from '../harness/runtime/decomp-bridge';
import { registerAnimCallbacks } from './engine/battle/battle-anim-generated-bridge';
import { DestroySprite } from './sprite';
import { getRuntime } from '../harness/runtime/decomp-globals';
import {
  GetBattlerSpriteCoord, InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  InitAnimLinearTranslation, AnimTranslateLinear,
  StoreSpriteCallbackInData6, SetCallbackToStoredInData6, DestroySpriteAndMatrix,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { Sin, Cos, gSineTable } from './trig';
import { SetOamMatrix, AllocOamMatrix } from './sprite';

type _VSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; callback: unknown;
  spriteId?: number; oamIndex?: number;
  matrixNum?: number; affineMode?: number;
  hFlip?: boolean; vFlip?: boolean;
  subpriority?: number; shape?: number; size?: number;
  tileBase?: number; sheetTileStart?: number;
  animEnded?: boolean; affineAnimEnded?: boolean;
};
function _vItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void; DestroyAnimVisualTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
type _RtOam = { tileId?: number; priority?: number; paletteBank?: number };
type _Rt = {
  gSprites?: Array<_VSprite | undefined>;
  gba?: { oam?: _RtOam[] };
  AllocOamMatrix?: () => number;
  DestroySprite?: (id: number) => void;
  CreateSpriteAtOam?: (cfg: {
    tileId: number; paletteBank: number; x: number; y: number;
    shape: 0 | 1 | 2; size: 0 | 1 | 2 | 3; priority: number; subpriority?: number;
  }) => { spriteId: number; oamIndex: number };
};
function _rt(): _Rt | undefined {
  return (globalThis as Record<string, unknown>).__rt as _Rt | undefined;
}

// ─── helpers privés (transcriptions locales, pas dans battle_anim_mons.ts) ──

/** Stored-callback générique « DestroyAnimSprite » (= passer &DestroyAnimSprite en C). */
const _DestroyAnimSpriteCb = (s: unknown): void => { _vItf().DestroyAnimSprite?.(s); };

/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : décrémente data[0] puis
 *  bascule sur le callback stocké en data[6]. */
function _WaitAnimForDuration(sprite: _VSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735). */
function _RunStoredCallbackWhenAnimEnds(sprite: _VSprite): void {
  if (sprite.animEnded) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: _VSprite): void {
  if (sprite.affineAnimEnded) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `DestroyAnimSpriteAfterTimer` (battle_anim_flying.c:539) : data[0]-- <= 0
 *  → free matrice + DestroySprite + gAnimVisualTaskCount-- (= exactement ce que
 *  fait DestroyAnimSprite de l'interpréteur). */
function _DestroyAnimSpriteAfterTimer(sprite: _VSprite): void {
  if (sprite.data[0]-- <= 0) _vItf().DestroyAnimSprite?.(sprite);
}

/** Miroir `sprite->oam.tileNum += n` : bump la tile OAM live + les bases
 *  (tileBase/sheetTileStart) pour que d'éventuels ticks d'anim gardent l'offset.
 *  (Les templates concernés — SPARK_2/SPARK_H — sont en gDummySpriteAnimTable :
 *  en C aussi l'offset reste posé, aucune frame ne le réécrit.) */
function _oamTileNumAdd(sprite: _VSprite, n: number): void {
  if (!n) return;
  const oam = _rt()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam && typeof oam.tileId === 'number') oam.tileId += n;
  if (typeof sprite.tileBase === 'number') sprite.tileBase += n;
  if (typeof sprite.sheetTileStart === 'number') sprite.sheetTileStart += n;
}

/** Garantit une matrice OAM PROPRE au sprite (≠ slot 0 partagé identité).
 *  En C les templates gOamData_AffineNormal_* ont une matrice allouée à la
 *  création (InitSpriteAffineAnim) ; ici le bridge filtre les affine DUMMY
 *  (gDummySpriteAffineAnimTable) → pas d'alloc → matrixNum=0. Écrire la
 *  matrice 0 = déplacer/déformer TOUS les sprites non-affine (leçon Wailord
 *  2026-06-11) → on alloue le slot via rt.AllocOamMatrix (1..31). */
function _ensureOwnMatrix(sprite: _VSprite): number {
  let m = sprite.matrixNum ?? 0;
  if (m <= 0) {
    m = AllocOamMatrix() ?? 0;
    if (m > 0) {
      sprite.matrixNum = m;
      sprite.affineMode = 1; // ST_OAM_AFFINE_NORMAL (gOamData_AffineNormal_*)
    }
  }
  return m;
}

/** 1:1 `StartSpriteAffineAnim(sprite, n)` — pose les flags, BeginAffineAnim
 *  (sprite-engine) prend le relais à la frame suivante. */
function _StartSpriteAffineAnim(sprite: _VSprite, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
}

/** Approx documentée de `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063) :
 *  lit GetAnimBgAttribute(bg2|bg1, BG_ANIM_PRIORITY) selon la position ; ici
 *  constantes de sBattleBgTemplates (battle_bg.c : bg1 priority=0, bg2
 *  priority=1). Singles : battler pair = B_POSITION_PLAYER_LEFT → bg2 (1),
 *  battler impair = B_POSITION_OPPONENT_LEFT → bg1 (0). */
function _GetBattlerSpriteBGPriority(battler: number): number {
  const position = battler & 3; // singles : battler == position
  return (position === 0 /* PLAYER_LEFT */ || position === 3 /* OPPONENT_RIGHT */) ? 1 : 0;
}

/** `IsBattlerSpriteVisible(BATTLE_PARTNER(x))` — runtime SINGLES : le
 *  partenaire n'existe jamais → false (les branches partner retombent sur
 *  attacker/target, exactement le else du C). */
function _IsBattlerSpriteVisible(_battler: number): boolean {
  return false;
}

// ─── callbacks 1:1 (ordre du .c) ─────────────────────────────────────────────

/** 1:1 `AnimLightning` (battle_anim_electric.c:459) : éclair posé à
 *  (target ± args[0], +args[1]) ; joue son anim 5 frames puis destroy. */
function AnimLightning(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) sprite.x -= args[0] | 0;
  else sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.invisible = false;
  sprite.callback = AnimLightning_Step;
}

/** 1:1 `AnimLightning_Step` (battle_anim_electric.c:470). */
function AnimLightning_Step(sprite: _VSprite): void {
  if (sprite.animEnded) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSparkElectricity` (battle_anim_electric.c:515) : étincelle plaquée
 *  sur l'orbite Sin/Cos(args[0])·args[1] autour du battler args[4], matrice de
 *  ROTATION pure posée depuis gSineTable[args[2]], vit args[3] frames. */
function AnimSparkElectricity(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 16, 0, 20, 1, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  let battler: number;
  switch (args[4] | 0) {
    case 0: // ANIM_ATTACKER
      battler = atk;
      break;
    case 2: // ANIM_ATK_PARTNER
      battler = !_IsBattlerSpriteVisible(atk ^ 2) ? atk : (atk ^ 2);
      break;
    case 3: // ANIM_DEF_PARTNER
      battler = _IsBattlerSpriteVisible(atk ^ 2) ? (tgt ^ 2) : tgt;
      break;
    case 1: // ANIM_TARGET
    default:
      battler = tgt;
      break;
  }

  if ((args[5] | 0) === 0) {
    sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X);
    sprite.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y);
  } else {
    sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET);
  }

  sprite.x2 = Sin(args[0] & 0xFF, args[1] | 0);  // = (gSineTable[a0] * a1) >> 8
  sprite.y2 = Cos(args[0] & 0xFF, args[1] | 0);  // = (gSineTable[a0+64] * a1) >> 8

  if (((args[6] | 0) & 1) !== 0) {
    const oam = _rt()?.gba?.oam?.[sprite.oamIndex ?? -1];
    if (oam) oam.priority = _GetBattlerSpriteBGPriority(battler) + 1;
  }

  // gOamMatrices[matrixNum] : a=d=cos, b=sin, c=-sin (rotation pure 8.8).
  const matrixNum = _ensureOwnMatrix(sprite);
  if (matrixNum > 0) {
    const sineVal = gSineTable[args[2] & 0xFF] | 0;
    const cosVal = gSineTable[(args[2] & 0xFF) + 64] | 0;
    SetOamMatrix(matrixNum, cosVal, sineVal, -sineVal, cosVal);
  }

  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  sprite.callback = _DestroyAnimSpriteAfterTimer;
}

/** 1:1 `AnimZapCannonSpark` (battle_anim_electric.c:572) : étincelle qui suit
 *  la translation linéaire attacker→target en spiralant (Sin/Cos data[7],
 *  amplitude data[5]) et clignote 1 frame sur 3. tileNum += args[6]*4. */
function AnimZapCannonSpark(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 16, 30, 0, 10, 0];
  const tgt = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[3] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = args[2] | 0;
  sprite.data[6] = args[5] | 0;
  sprite.data[7] = args[4] | 0;
  _oamTileNumAdd(sprite, (args[6] | 0) * 4);
  sprite.callback = AnimZapCannonSpark_Step;
  AnimZapCannonSpark_Step(sprite); // 1:1 sprite->callback(sprite)
}

/** 1:1 `AnimZapCannonSpark_Step` (battle_anim_electric.c:589). */
function AnimZapCannonSpark_Step(sprite: _VSprite): void {
  if (!AnimTranslateLinear(sprite as never)) {
    sprite.x2 += Sin(sprite.data[7] & 0xFF, sprite.data[5]);
    sprite.y2 += Cos(sprite.data[7] & 0xFF, sprite.data[5]);
    sprite.data[7] = (sprite.data[7] + sprite.data[6]) & 0xFF;
    if (!(sprite.data[7] % 3)) sprite.invisible = !sprite.invisible;
  } else {
    _vItf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimThunderboltOrb_Step` (battle_anim_electric.c:605) : clignote tous
 *  les data[4] frames, vit data[3] frames. */
function AnimThunderboltOrb_Step(sprite: _VSprite): void {
  if (--sprite.data[5] === -1) {
    sprite.invisible = !sprite.invisible;
    sprite.data[5] = sprite.data[4];
  }
  if (sprite.data[3]-- <= 0) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimThunderboltOrb` (battle_anim_electric.c:616) : orbe à
 *  (target ± args[1], +args[2]), durée args[0], période flicker args[3]. */
function AnimThunderboltOrb(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [40, 0, 0, 2];
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((tgt & 1) === 0 /* IsContest() || side(target) == B_SIDE_PLAYER */)
    args[1] = -(args[1] | 0);
  sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) + (args[1] | 0);
  sprite.y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + (args[2] | 0);
  sprite.invisible = false;
  sprite.data[3] = args[0] | 0;
  sprite.data[4] = args[3] | 0;
  sprite.data[5] = args[3] | 0;
  sprite.callback = AnimThunderboltOrb_Step;
}

/** 1:1 `AnimSparkElectricityFlashing` (battle_anim_electric.c:629) : étincelle
 *  en orbite circulaire (rayon data[5], pas data[6]) autour du battler choisi
 *  par le bit 0x8000 d'args[7], flicker toutes les (args[7]&0x7FFF) frames,
 *  durée args[3]. tileNum += args[6]*4. */
function AnimSparkElectricityFlashing(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 16, 30, 0, 8, 0, 2];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;

  sprite.data[0] = args[3] | 0;
  const battler = ((args[7] | 0) & 0x8000) !== 0 ? tgt : atk;

  if ((battler & 1) === 0 /* IsContest() || side == B_SIDE_PLAYER */)
    args[0] = -(args[0] | 0);

  sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) + (args[0] | 0);
  sprite.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET) + (args[1] | 0);

  sprite.data[4] = (args[7] | 0) & 0x7FFF;
  sprite.data[5] = args[2] | 0;
  sprite.data[6] = args[5] | 0;
  sprite.data[7] = args[4] | 0;

  _oamTileNumAdd(sprite, (args[6] | 0) * 4);
  sprite.invisible = false;
  sprite.callback = AnimSparkElectricityFlashing_Step;
  AnimSparkElectricityFlashing_Step(sprite); // 1:1 sprite->callback(sprite)
}

/** 1:1 `AnimSparkElectricityFlashing_Step` (battle_anim_electric.c:655).
 *  (Garde data[4]!==0 : en C `% 0` serait UB ; les scripts passent toujours ≥1.) */
function AnimSparkElectricityFlashing_Step(sprite: _VSprite): void {
  sprite.x2 = Sin(sprite.data[7] & 0xFF, sprite.data[5]);
  sprite.y2 = Cos(sprite.data[7] & 0xFF, sprite.data[5]);
  sprite.data[7] = (sprite.data[7] + sprite.data[6]) & 0xFF;
  if (sprite.data[4] !== 0 && sprite.data[7] % sprite.data[4] === 0)
    sprite.invisible = !sprite.invisible;
  if (sprite.data[0]-- <= 0) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimElectricity` (battle_anim_electric.c:669) : arcs électriques sur la
 *  cible (paralysie / hits électriques). tileNum += args[3]*4 ; args[3]==1 →
 *  H-flip, ==2 → V-flip (ST_OAM_HFLIP/VFLIP → hFlip/vFlip plats du runtime) ;
 *  attend args[2] frames puis destroy. */
function AnimElectricity(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 30, 0];
  InitSpritePosToAnimTarget(sprite as never, false);
  _oamTileNumAdd(sprite, (args[3] | 0) * 4);

  if ((args[3] | 0) === 1) sprite.hFlip = true;       // ST_OAM_HFLIP
  else if ((args[3] | 0) === 2) sprite.vFlip = true;  // ST_OAM_VFLIP

  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.callback = _WaitAnimForDuration;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
}

/** Step du 2e segment de Thunder Wave (sprite créé MANUELLEMENT, hors compteur
 *  interpréteur) : même corps que AnimThunderWave_Step mais destroy DIRECT
 *  (rt.DestroySprite) — gAnimVisualTaskCount n'est pas exposé pour le ++ du C,
 *  donc ce sprite ne doit ni l'incrémenter ni le décrémenter (équilibre net
 *  identique : +1 create interpréteur / -1 DestroyAnimSprite du 1er segment). */
function _AnimThunderWave_Step_Second(sprite: _VSprite): void {
  if (++sprite.data[0] === 3) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;
  }
  if (++sprite.data[1] === 51) {
    const id = sprite.spriteId ?? -1;
    if (id >= 0) DestroySprite(getRuntime(), id);
  }
}

/** 1:1 `AnimThunderWave` (battle_anim_electric.c:779) : onde horizontale 32x16
 *  + 2e segment cloné à x+32 (tileNum += 8 = 2e image de la sheet SPARK_H) ;
 *  les deux clignotent (3 frames) et meurent à 51 frames. */
function AnimThunderWave(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.invisible = false;

  // CreateSprite(&gThunderWaveSpriteTemplate, x+32, y, subpriority) : clone du
  // sprite courant (même sheet/palette/oam — même template en C).
  const rt = _rt();
  const oam = rt?.gba?.oam?.[sprite.oamIndex ?? -1];
  const created = rt?.CreateSpriteAtOam?.({
    tileId: (oam?.tileId ?? 0),
    paletteBank: (oam?.paletteBank ?? 0),
    x: sprite.x + 32, y: sprite.y,
    shape: (sprite.shape ?? 1) as 0 | 1 | 2,   // gOamData_AffineOff_ObjNormal_32x16
    size: (sprite.size ?? 2) as 0 | 1 | 2 | 3,
    priority: oam?.priority ?? 2,
    subpriority: sprite.subpriority ?? 0xFF,
  });
  const second = created && created.spriteId >= 0 && created.spriteId < 64
    ? rt?.gSprites?.[created.spriteId] : undefined;
  if (second) {
    _oamTileNumAdd(second, 8); // gSprites[spriteId].oam.tileNum += 8
    second.callback = _AnimThunderWave_Step_Second;
  }

  sprite.callback = AnimThunderWave_Step;
}

/** 1:1 `AnimThunderWave_Step` (battle_anim_electric.c:792). */
function AnimThunderWave_Step(sprite: _VSprite): void {
  if (++sprite.data[0] === 3) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;
  }
  if (++sprite.data[1] === 51) _vItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimGrowingChargeOrb` (battle_anim_electric.c:895) : orbe 64x64 sur le
 *  battler args[0] ; l'affine (sAffineAnims_GrowingElectricOrb) grossit puis
 *  flicker ; à la fin de l'affine → DestroySpriteAndMatrix. */
function AnimGrowingChargeOrb(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  } else {
    sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
  }
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

/** 1:1 `AnimElectricPuff` (battle_anim_electric.c:913) : burst électrique
 *  (fin de Charge / hit Volt Tackle) sur le battler args[0], offset
 *  (args[1], args[2]) ; joue son anim 4 frames puis destroy. */
function AnimElectricPuff(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  } else {
    sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
  }
  sprite.x2 = args[1] | 0;
  sprite.y2 = args[2] | 0;
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
}

/** `GetAnimBattlerSpriteId(ANIM_ATTACKER)` → spriteId du mon (surface
 *  __battleControllerOpponent, pattern _projBattlerSprite de battle_anim_mons). */
function _getBattlerMonSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  return co?.getBattlerMonSpriteId?.(battler) ?? -1;
}

/** 1:1 `AnimVoltTackleOrbSlide` (battle_anim_electric.c:933) : orbe qui grossit
 *  (affine anim 1) sur l'attaquant puis glisse hors écran (±16/frame) en
 *  EMPORTANT le sprite de l'attaquant (gSprites[data[6]].x2). */
function AnimVoltTackleOrbSlide(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  _StartSpriteAffineAnim(sprite, 1);
  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.invisible = false;
  sprite.data[6] = _getBattlerMonSpriteId(atk); // GetAnimBattlerSpriteId(ANIM_ATTACKER)
  sprite.data[7] = 16;

  if ((atk & 1) === 1 /* B_SIDE_OPPONENT */) sprite.data[7] *= -1;

  sprite.callback = AnimVoltTackleOrbSlide_Step;
}

/** 1:1 `AnimVoltTackleOrbSlide_Step` (battle_anim_electric.c:947) :
 *  40 frames d'attente puis slide ; destroy quand (u16)(x+80) > 400. */
function AnimVoltTackleOrbSlide_Step(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (++sprite.data[1] > 40) sprite.data[0]++;
      break;
    case 1: {
      sprite.x += sprite.data[7];
      const mon = sprite.data[6] >= 0 ? _rt()?.gSprites?.[sprite.data[6]] : undefined;
      if (mon) mon.x2 += sprite.data[7];
      if (((sprite.x + 80) & 0xFFFF) > 400) DestroySpriteAndMatrix(sprite);
      break;
    }
  }
}

// ─── enregistrement par NOM C exact (résolution bridge → templates générés) ──
registerAnimCallbacks({
  AnimLightning: AnimLightning as never,
  AnimSparkElectricity: AnimSparkElectricity as never,
  AnimZapCannonSpark: AnimZapCannonSpark as never,
  AnimThunderboltOrb: AnimThunderboltOrb as never,
  AnimSparkElectricityFlashing: AnimSparkElectricityFlashing as never,
  AnimElectricity: AnimElectricity as never,
  AnimThunderWave: AnimThunderWave as never,
  AnimGrowingChargeOrb: AnimGrowingChargeOrb as never,
  AnimElectricPuff: AnimElectricPuff as never,
  AnimVoltTackleOrbSlide: AnimVoltTackleOrbSlide as never,
});

// ════════════════════════════════════════════════════════════════════════════
// VAGUE « orbes » (goal 2026-06-11) — AnimGrowingShockWaveOrb
// (battle_anim_electric.c:1135).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimGrowingShockWaveOrb` (battle_anim_electric.c:1135) : l'orbe d'Onde
 *  de Choc se pose sur l'attaquant, joue l'affine 2 du template
 *  (sAffineAnims_GrowingElectricOrb — grossissement) ; fin d'affine →
 *  DestroySpriteAndMatrix. Self-stepper (switch data[0]). */
function AnimGrowingShockWaveOrb(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  switch (sprite.data[0]) {
    case 0:
      sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
      sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
      _StartSpriteAffineAnim(sprite, 2);
      sprite.invisible = false;
      sprite.data[0]++;
      break;
    case 1:
      if (sprite.affineAnimEnded) DestroySpriteAndMatrix(sprite as never);
      break;
  }
}

registerAnimCallbacks({ AnimGrowingShockWaveOrb: AnimGrowingShockWaveOrb as never });

// ─── VAGUE F5 : AnimTask_ElectricBolt (battle_anim_electric.c.c:685, 5 hits — Thunderbolt) ─
// Crée 5 segments de foudre échelonnés (un toutes les 2 frames, y+16*k),
// chaque segment vit 15f. Le C ajuste oam.tileNum (+r8) et shape 8x16/16x16.
function _ebItf(): { getArgs?: () => number[]; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimTask_ElectricBolt(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _ebItf();
  const a = itf.getArgs?.() ?? [];
  const tgt = itf.getTarget?.() ?? 1;
  task.data[0] = (GetBattlerSpriteCoord?.(tgt, 0) ?? 176) + a[0];
  task.data[1] = (GetBattlerSpriteCoord?.(tgt, 1) ?? 40) + a[1];
  task.data[2] = a[2];
  task.data[10] = 0;
  task.func = AnimTask_ElectricBolt_Step;
}
function AnimTask_ElectricBolt_Step(task: { taskId: number; data: number[] }): void {
  const itf = _ebItf();
  const sp = task.data[2];
  const x = task.data[0];
  const y = task.data[1];
  const step = task.data[10];
  const r2 = !sp ? 1 : 4;
  let r8 = !sp ? 0 : 8;
  let create = false;
  let r12 = 16;
  switch (step) {
    case 0: r12 *= 1; create = true; break;
    case 2: r12 *= 2; r8 += r2; create = true; break;
    case 4: r12 *= 3; r8 += r2 * 2; create = true; break;
    case 6: r12 *= 4; r8 += r2 * 3; create = true; break;
    case 8: r12 *= 5; create = true; break;
    case 10:
      itf.DestroyAnimVisualTask?.(task.taskId);
      return;
  }
  if (create) {
    // via le bridge : le template generated (tag + oam) + notre callback
    const reg = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => unknown } | undefined;
    void reg; // le createsprite runtime passe par CreateSprite système :
    const cs = (globalThis as Record<string, unknown>).__decompGlobals as { CreateSpriteFromGeneratedTemplate?: never } | undefined;
    void cs;
    // pattern minimal robuste : créer par le même chemin que les callbacks
    // (CreateSprite système avec le tag du bolt 10011=ANIM_TAG_LIGHTNING ?)
    const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ data: number[]; oamIndex: number; callback: unknown } | undefined>; CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number; gba?: { oam: Array<{ tileId: number; shape: number; size: number }> } } | undefined;
    const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
    const tileStart = dg?.GetSpriteTileStartByTag?.(10038) ?? 0xFFFF; // ANIM_TAG_ELECTRIC_BOLT? — si absent, segment invisible (net doux)
    const sid = CreateSprite({ oam: { shape: 2, size: 0, priority: 2 }, images: [] } as never, x, y + r12, 2) ?? -1;
    if (sid >= 0) {
      const spr = rt?.gSprites?.[sid];
      const oam = spr ? rt?.gba?.oam[spr.oamIndex] : undefined;
      if (oam && tileStart !== 0xFFFF) oam.tileId = tileStart + r8;
      if (spr) {
        spr.data = spr.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
        spr.data[0] = sp;
        spr.data[1] = 0;
        spr.callback = AnimElectricBoltSegment;
        AnimElectricBoltSegment(spr as never);
      }
    }
  }
  task.data[10]++;
}
function AnimElectricBoltSegment(sprite: { data: number[]; oamIndex: number }): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { oam: Array<{ shape: number; size: number }> }; DestroySprite?: (id: number) => void; gSprites?: Array<unknown | undefined> } | undefined;
  const oam = rt?.gba?.oam[sprite.oamIndex];
  if (oam) {
    if (!sprite.data[0]) { oam.shape = 2; oam.size = 0; } // 8x16
    else { oam.shape = 0; oam.size = 1; }                 // 16x16
  }
  if (++sprite.data[1] === 15) {
    // DestroySprite(sprite) : retrouver l'id
    for (let sid = 0; sid < MAX_SPRITES; sid++) {
      const sp = rt?.gSprites?.[sid];
      if (sp === undefined) continue;
      if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
    }
  }
}
import { registerAnimTasks as _ebRegT } from './engine/battle/battle-anim-registry';
/** 1:1 `AnimTask_VoltTackleBolt` (battle_anim_electric.c.c, 5 hits) : éclairs en chaîne
 *  entre l attaquant et la cible (sprites gVoltTackleBolt via bridge tag). */
function AnimTask_VoltTackleBolt(task: { taskId: number; data: number[]; func?: unknown }): void {
  task.data[0] = 0;
  task.func = _VoltTackleBolt_Step;
  _VoltTackleBolt_Step(task);
}
function _VoltTackleBolt_Step(task: { taskId: number; data: number[] }): void {
  const itf = _ebItf() as { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  switch (task.data[0]) {
    case 0: {
      const atk = itf.getAttacker?.() ?? 0;
      task.data[1] = (atk & 1) === 0 ? 1 : -1;
      switch (a[0]) {
        case 0:
          task.data[3] = GetBattlerSpriteCoord(atk, 2);
          task.data[5] = GetBattlerSpriteCoord(atk, 3);
          task.data[4] = task.data[1] * 128 + 120;
          break;
        case 4: {
          const tgt = itf.getTarget?.() ?? 1;
          task.data[3] = 120 - task.data[1] * 128;
          task.data[5] = GetBattlerSpriteCoord(tgt, 3);
          task.data[4] = GetBattlerSpriteCoord(tgt, 2) - task.data[1] * 32;
          break;
        }
        default:
          if ((a[0] & 1) !== 0) { task.data[3] = 256; task.data[4] = -16; }
          else { task.data[3] = -16; task.data[4] = 256; }
          if (task.data[1] === 1) {
            task.data[5] = 80 - a[0] * 10;
          } else {
            task.data[5] = a[0] * 10 + 40;
            const t = task.data[3];
            task.data[3] = task.data[4];
            task.data[4] = t;
          }
      }
      if (task.data[3] < task.data[4]) { task.data[1] = 1; task.data[6] = 0; }
      else { task.data[1] = -1; task.data[6] = 3; }
      task.data[0]++;
      break;
    }
    case 1:
      if (++task.data[2] > 0) {
        task.data[2] = 0;
        if (CreateVoltTackleBolt(task) || CreateVoltTackleBolt(task)) task.data[0]++;
      }
      break;
    case 2:
      if (task.data[7] === 0) itf.DestroyAnimVisualTask?.(task.taskId);
  }
}
function CreateVoltTackleBolt(task: { taskId: number; data: number[] }): boolean {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ data: number[]; callback: unknown; oamIndex: number } | undefined>; CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number; gba?: { oam: Array<{ tileId: number }> } } | undefined;
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
  const tileStart = dg?.GetSpriteTileStartByTag?.(10011) ?? 0xFFFF; // ANIM_TAG_LIGHTNING? net : si absent, bolt invisible doux
  const sid = CreateSprite({ oam: { shape: 0, size: 2, priority: 2 }, images: [] } as never, task.data[3], task.data[5], 35) ?? -1;
  if (sid >= 0) {
    const sp = rt?.gSprites?.[sid];
    const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
    if (oam && tileStart !== 0xFFFF) oam.tileId = tileStart;
    if (sp) {
      sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
      sp.data[6] = task.taskId;
      sp.data[7] = 7;
      sp.callback = AnimVoltTackleBolt;
      task.data[7]++;
    }
  }
  task.data[6] += task.data[1];
  if (task.data[6] < 0) task.data[6] = 3;
  if (task.data[6] > 3) task.data[6] = 0;
  task.data[3] += task.data[1] * 16;
  return (task.data[1] === 1 && task.data[3] >= task.data[4])
    || (task.data[1] === -1 && task.data[3] <= task.data[4]);
}
function AnimVoltTackleBolt(sprite: { data: number[] }): void {
  if (++sprite.data[0] > 12) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }>; gSprites?: Array<unknown | undefined>; DestroySprite?: (i: number) => void } | undefined;
    const t = rt?.gTasks?.get(sprite.data[6]);
    if (t) t.data[sprite.data[7]]--;
    for (let sid = 0; sid < MAX_SPRITES; sid++) {
      const sp = rt?.gSprites?.[sid];
      if (sp === undefined) continue;
      if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
    }
  }
}
_ebRegT({
  AnimTask_ElectricBolt: AnimTask_ElectricBolt as never,
  AnimTask_VoltTackleBolt: AnimTask_VoltTackleBolt as never,
});

// --- VAGUE F45 : ShockWave x2 (battle_anim_electric.c.c:1153-1336) ------------------------
// ProgressingBolt : 6 colonnes de zigzag attaquant->cible (8 segments par
// colonne, tileNum 7..0/0..7). Lightning : la colonne verticale sur la cible.
import { GetBattlerSpriteSubpriority as _swSubprio } from './battle_anim_mons';

type _SwTask = { taskId: number; data: number[]; func?: unknown };
function _swItf(): { getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _swSpawn(tplName: string, x: number, y: number, subprio: number, oamShape: number, oamSize: number): number {
  const rt = (globalThis as Record<string, unknown>).__rt as {
    gSprites?: Array<{ data: number[]; callback: unknown; oamIndex: number } | undefined>;
    CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
    gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
  } | undefined;
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
  const tpl = bridge?.lookupGeneratedTemplateTags?.(tplName);
  const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
  const sid = CreateSprite({ oam: { shape: oamShape, size: oamSize, priority: 2 }, images: [] } as never, x, y, subprio) ?? -1;
  if (sid >= 0) {
    const sp = rt?.gSprites?.[sid];
    const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
    if (oam && tileStart !== 0xFFFF) {
      oam.tileId = tileStart;
      const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
      if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
    }
  }
  return sid;
}
function _swDestroySelf(sprite: unknown): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<unknown | undefined>; DestroySprite?: (i: number) => void } | undefined;
  for (let sid = 0; sid < MAX_SPRITES; sid++) {
    const sp = rt?.gSprites?.[sid];
    if (sp === undefined) continue;
    if (sp === sprite) { DestroySprite(getRuntime(), sid); break; }
  }
}

/** 1:1 AnimTask_ShockWaveProgressingBolt (battle_anim_electric.c.c:1153). */
function AnimTask_ShockWaveProgressingBolt(task: _SwTask): void {
  const itf = _swItf();
  switch (task.data[0]) {
    case 0:
      task.data[6] = GetBattlerSpriteCoord(itf.getAttacker?.() ?? 0, BATTLER_COORD_X_2);
      task.data[7] = GetBattlerSpriteCoord(itf.getAttacker?.() ?? 0, BATTLER_COORD_Y_PIC_OFFSET);
      task.data[8] = 4;
      task.data[10] = GetBattlerSpriteCoord(itf.getTarget?.() ?? 1, BATTLER_COORD_X_2);
      task.data[9] = Math.trunc((task.data[10] - task.data[6]) / 5);
      task.data[4] = 7;
      task.data[5] = -1;
      task.data[11] = 12;
      task.data[0]++;
      break;
    case 1:
      if (++task.data[1] > 0) {
        task.data[1] = 0;
        if (_CreateShockWaveBoltSprite(task, task.taskId)) {
          if (task.data[2] === 5) task.data[0] = 3;
          else task.data[0]++;
        }
      }
      if (task.data[11]) task.data[11]--;
      break;
    case 2:
      if (task.data[11]) task.data[11]--;
      if (++task.data[1] > 4) {
        task.data[1] = 0;
        if (task.data[2] & 1) {
          task.data[7] = 4;
          task.data[8] = 68;
          task.data[4] = 0;
          task.data[5] = 1;
        } else {
          task.data[7] = 68;
          task.data[8] = 4;
          task.data[4] = 7;
          task.data[5] = -1;
        }
        if (task.data[11]) task.data[0] = 4;
        else task.data[0] = 1;
      }
      break;
    case 3:
      if (task.data[3] === 0) itf.DestroyAnimVisualTask?.(task.taskId);
      break;
    case 4:
      if (task.data[11]) task.data[11]--;
      else task.data[0] = 1;
      break;
  }
}
/** 1:1 CreateShockWaveBoltSprite (battle_anim_electric.c.c:1232). */
function _CreateShockWaveBoltSprite(task: _SwTask, taskId: number): boolean {
  const sid = _swSpawn('gShockWaveProgressingBoltSpriteTemplate', task.data[6], task.data[7], 35, 0, 1);
  if (sid >= 0) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ data: number[]; callback: unknown; oamIndex: number } | undefined>; gba?: { oam: Array<{ tileId: number }> } } | undefined;
    const sp = rt?.gSprites?.[sid];
    const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
    if (oam) oam.tileId += task.data[4];
    task.data[4] += task.data[5];
    if (task.data[4] < 0) task.data[4] = 7;
    if (task.data[4] > 7) task.data[4] = 0;
    if (sp) {
      sp.data[6] = taskId;
      sp.data[7] = 3;
      sp.data[0] = 0;
      sp.callback = _AnimShockWaveProgressingBolt as never;
    }
    task.data[3]++;
  }
  if (task.data[4] === 0 && task.data[5] > 0) {
    (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(106 /* SE_M_THUNDERBOLT */);
  }
  if ((task.data[5] < 0 && task.data[7] <= task.data[8]) || (task.data[5] > 0 && task.data[7] >= task.data[8])) {
    task.data[2]++;
    task.data[6] += task.data[9];
    return true;
  }
  task.data[7] += task.data[5] * 8;
  return false;
}
/** 1:1 AnimShockWaveProgressingBolt : vie 12f. */
function _AnimShockWaveProgressingBolt(sprite: { data: number[] }): void {
  if (++sprite.data[0] > 12) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }> } | undefined;
    const t = rt?.gTasks?.get(sprite.data[6]);
    if (t) t.data[sprite.data[7]]--;
    _swDestroySelf(sprite);
  }
}

/** 1:1 AnimTask_ShockWaveLightning (battle_anim_electric.c.c:1279). */
function AnimTask_ShockWaveLightning(task: _SwTask): void {
  const itf = _swItf();
  switch (task.data[0]) {
    case 0: {
      const tgt = itf.getTarget?.() ?? 1;
      task.data[15] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y) + 32;
      task.data[14] = task.data[15];
      while (task.data[14] > 16) task.data[14] -= 32;
      task.data[13] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
      task.data[12] = _swSubprio(tgt) - 2;
      task.data[0]++;
      break;
    }
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        if (_CreateShockWaveLightningSprite(task, task.taskId)) task.data[0]++;
      }
      break;
    case 2:
      if (task.data[10] === 0) itf.DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 CreateShockWaveLightningSprite (battle_anim_electric.c.c:1310). */
function _CreateShockWaveLightningSprite(task: _SwTask, taskId: number): boolean {
  const sid = _swSpawn('gLightningSpriteTemplate', task.data[13], task.data[14], task.data[12], 0, 2);
  if (sid >= 0) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ data: number[]; callback: unknown } | undefined> } | undefined;
    const sp = rt?.gSprites?.[sid];
    if (sp) {
      sp.data[6] = taskId;
      sp.data[7] = 10;
      sp.data[0] = 0;
      sp.callback = _AnimShockWaveLightning as never;
    }
    task.data[10]++;
  }
  if (task.data[14] >= task.data[15]) return true;
  task.data[14] += 32;
  return false;
}
/** 1:1 AnimShockWaveLightning : animEnded / vie 15f en inline. */
function _AnimShockWaveLightning(sprite: { data: number[]; animEnded?: boolean }): void {
  if (sprite.animEnded || ++sprite.data[0] > 15) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }> } | undefined;
    const t = rt?.gTasks?.get(sprite.data[6]);
    if (t) t.data[sprite.data[7]]--;
    _swDestroySelf(sprite);
  }
}
_ebRegT({
  AnimTask_ShockWaveProgressingBolt: AnimTask_ShockWaveProgressingBolt as never,
  AnimTask_ShockWaveLightning: AnimTask_ShockWaveLightning as never,
});

// --- VAGUE F45b : ElectricChargingParticles (battle_anim_electric.c.c:805-893) ------------
// Particules aspirées vers le mon (16 offsets cycliques, vitesse croissante).
import { InitAnimLinearTranslation as _ecInitLin, AnimTranslateLinear as _ecRunLin } from './battle_anim_mons';
import { MAX_SPRITES } from '../harness/runtime/decomp-runtime';

const _sElecChargeOffsets: ReadonlyArray<readonly [number, number]> = [
  [58, -60], [-56, -36], [8, -56], [-16, 56], [58, -10], [-58, 10], [48, -18], [-8, 56],
  [16, -56], [-58, -42], [58, 30], [-48, 40], [12, -48], [48, -12], [-56, 18], [48, 48],
];

function AnimTask_ElectricChargingParticles(task: _SwTask): void {
  const itf = _swItf();
  const args = ((globalThis as Record<string, unknown>).__battleAnimInterpreter as { getArgs?: () => number[] } | undefined)?.getArgs?.() ?? [0, 20, 2, 5];
  const battler = args[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  task.data[14] = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2);
  task.data[15] = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET);
  task.data[6] = args[1] | 0;
  task.data[7] = 0;
  task.data[8] = 0;
  task.data[9] = 0;
  task.data[10] = 0;
  task.data[11] = args[3] | 0;
  task.data[12] = 0;
  task.data[13] = args[2] | 0;
  task.func = AnimTask_ElectricChargingParticles_Step;
}
function AnimTask_ElectricChargingParticles_Step(task: _SwTask): void {
  if (task.data[6]) {
    if (++task.data[12] > task.data[13]) {
      task.data[12] = 0;
      const sid = _swSpawn('gElectricChargingParticlesSpriteTemplate', task.data[14], task.data[15], 2, 0, 1);
      if (sid >= 0) {
        const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ x: number; y: number; data: number[]; callback: unknown } | undefined> } | undefined;
        const sp = rt?.gSprites?.[sid];
        if (sp) {
          sp.x += _sElecChargeOffsets[task.data[9]][0];
          sp.y += _sElecChargeOffsets[task.data[9]][1];
          sp.data[0] = 40 - task.data[8] * 5;
          sp.data[1] = sp.x;
          sp.data[2] = task.data[14];
          sp.data[3] = sp.y;
          sp.data[4] = task.data[15];
          sp.data[5] = task.taskId;
          _ecInitLin(sp as never);
          sp.callback = AnimElectricChargingParticles as never;
          if (++task.data[9] > 15) task.data[9] = 0;
          if (++task.data[10] >= task.data[11]) {
            task.data[10] = 0;
            if (task.data[8] <= 5) task.data[8]++;
          }
          task.data[7]++;
          task.data[6]--;
        }
      }
    }
  } else if (task.data[7] === 0) {
    _swItf().DestroyAnimVisualTask?.(task.taskId);
  }
}
/** 1:1 `AnimElectricChargingParticles` (battle_anim_electric.c:889) :
 *  StartSpriteAnim(1) (no-op silencieux ici : sprite inline sans table anims)
 *  puis chaîne la translation — graphe d'appels 1:1. */
function AnimElectricChargingParticles(sprite: { data: number[]; callback: unknown }): void {
  const spA = sprite as unknown as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims) { spA.animNum = 1; spA.animBeginning = true; spA.animEnded = false; }
  sprite.callback = AnimElectricChargingParticles_Step;
}
/** 1:1 `AnimElectricChargingParticles_Step` (battle_anim_electric.c:880) :
 *  translation puis decrement task.data[7] + destroy. */
function AnimElectricChargingParticles_Step(sprite: { data: number[] }): void {
  if (_ecRunLin(sprite as never)) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }> } | undefined;
    const t = rt?.gTasks?.get(sprite.data[5]);
    if (t) t.data[7]--;
    _swDestroySelf(sprite);
  }
}
_ebRegT({ AnimTask_ElectricChargingParticles: AnimTask_ElectricChargingParticles as never });

// --- VAGUE F80b : AnimTask_VoltTackleAttackerReappear (battle_anim_electric.c.c:963) ------
// Volt Tackle : l'attaquant REVIENT en glissant depuis le bord (x2 ∓32 → 0,
// pas de 2) en CLIGNOTANT (invisible ^= 1 tous les 2 ticks), puis 8 clignote-
// ments sur place et reapparition franche.
function AnimTask_VoltTackleAttackerReappear(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ x2: number; invisible?: boolean } | undefined> } | undefined;
  switch (task.data[0]) {
    case 0: {
      const atk = itf.getAttacker?.() ?? 0;
      task.data[15] = co?.getBattlerMonSpriteId?.(atk) ?? 0xFF;
      if (task.data[15] === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
      if ((atk & 1) === 0) { task.data[14] = -32; task.data[13] = 2; }
      else { task.data[14] = 32; task.data[13] = -2; }
      const sp = rt?.gSprites?.[task.data[15]];
      if (sp) sp.x2 = task.data[14];
      task.data[0]++;
      break;
    }
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        const sp = rt?.gSprites?.[task.data[15]];
        if (sp) sp.invisible = !sp.invisible;
        if (task.data[14]) {
          task.data[14] += task.data[13];
          if (sp) sp.x2 = task.data[14];
        } else {
          task.data[0]++;
        }
      }
      break;
    case 2:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        const sp = rt?.gSprites?.[task.data[15]];
        if (sp) sp.invisible = !sp.invisible;
        if (++task.data[2] === 8) task.data[0]++;
      }
      break;
    case 3: {
      const sp = rt?.gSprites?.[task.data[15]];
      if (sp) sp.invisible = false;
      itf.DestroyAnimVisualTask?.(task.taskId);
      break;
    }
  }
}
_ebRegT({ AnimTask_VoltTackleAttackerReappear: AnimTask_VoltTackleAttackerReappear as never });
