/**
 * battle_anim_water.ts — miroir PARTIEL de `src/battle_anim_water.c`
 * (décomp pokeemeraude) : BUBBLE/Écume, goal T4 2026-06-11.
 * gWaterBubbleProjectileSpriteTemplate (:114, ANIM_TAG_BUBBLE 10146, OAM
 * 16x16) — callback net-effect : le projectile générique (la trajectoire
 * sinusoïdale AnimWaterBubbleProjectile = dette douce).
 * GFX : bubble.png 16x48 (3 frames) byte-exact.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates, lookupAnimTemplate } from '../engine/battle/battle-anim-registry';
import {
  TranslateAnimSpriteToTargetMonLocation, InitSpritePosToAnimAttacker,
  InitAnimLinearTranslation, AnimTranslateLinear, GetBattlerSpriteCoord,
  InitSpritePosToAnimTarget, StartAnimLinearTranslation, StoreSpriteCallbackInData6,
  TrySetSpriteRotScale, ResetSpriteRotScale_PreserveAffine, PrepareBattlerSpriteForRotScale,
} from './battle_anim_mons';
import { CreateSprite as _CreateSpriteFromTemplate } from '../engine/system/decomp-bridge';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { Sin } from './trig';

export const ANIM_TAG_BUBBLE = 10146;
const sSheet = { data: 'gAnimGfx_Bubble', size: 384, tag: ANIM_TAG_BUBBLE };
const sPal = { data: 'gAnimPal_Bubble', tag: ANIM_TAG_BUBBLE };
export function LoadAnimBubbleGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_BUBBLE) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}
registerAnimTemplates([
  { name: 'gWaterBubbleProjectileSpriteTemplate', tileTag: ANIM_TAG_BUBBLE, paletteTag: ANIM_TAG_BUBBLE, oam: { shape: 0, size: 1 }, load: LoadAnimBubbleGfx, callback: TranslateAnimSpriteToTargetMonLocation as never },
]);

// ─── VAGUE 2a : AnimToTargetInSinWave 1:1 (battle_anim_water.c) — 6 templates
// générés (bulles/projectiles eau...) : trajectoire linéaire + onde Sin.
type _SwSprite = { data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean; callback: unknown };
function _swItf(): { getArgs?: () => number[]; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimToTargetInSinWave(sprite: _SwSprite): void {
  const args = _swItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0, 0, 0];
  const tgt = _swItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = 30;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2 /* X_2 */);
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3 /* Y_PIC_OFFSET */);
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = Math.trunc(0xD200 / sprite.data[0]);
  sprite.data[7] = args[3] | 0;
  const retArg = (args[7] | 0) & 0xFFFF;
  if (retArg > 127) {
    sprite.data[6] = (retArg - 127) * 256;
    sprite.data[7] = -sprite.data[7];
  } else {
    sprite.data[6] = retArg * 256;
  }
  sprite.callback = AnimToTargetInSinWave_Step;
  AnimToTargetInSinWave_Step(sprite);
}
function AnimToTargetInSinWave_Step(sprite: _SwSprite): void {
  if (AnimTranslateLinear(sprite as never)) {
    _swItf().DestroyAnimSprite?.(sprite);
    return;
  }
  sprite.y2 += Sin((sprite.data[6] >> 8) & 0xFF, sprite.data[7]);
  if ((sprite.data[6] + sprite.data[5]) >> 8 > 127) {
    sprite.data[6] = 0;
    sprite.data[7] = -sprite.data[7];
  } else {
    sprite.data[6] += sprite.data[5];
  }
}
registerAnimCallbacks({ AnimToTargetInSinWave: AnimToTargetInSinWave as never });

// ═══════════════════════════════════════════════════════════════════════════
// VAGUE EAU (goal 2026-06-11) — 11 callbacks 1:1 transcrits depuis :
//   - battle_anim_water.c  (SmallBubblePair, SmallDriftingBubbles, WaterGun-
//     Droplet, HydroCannonCharge/Beam, WaterPulseBubble/Ring/RingBubble)
//   - battle_anim_poison.c (AnimBubbleEffect — after-effect Bubble/BubbleBeam)
//   - battle_anim_flying.c (AnimDiveBall, AnimDiveWaterSplash,
//     AnimSprayWaterDroplet — le lot « eau » du script Move_DIVE/ASTONISH)
// Pattern repo : accès LAZY à l'interpréteur via __battleAnimInterpreter
// (AUCUN import statique = anti-cycle ESM).
// ═══════════════════════════════════════════════════════════════════════════

type _WSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; subpriority?: number; spriteId?: number;
  oamIndex?: number; matrixNum?: number; affineAnimEnded?: boolean;
  hFlip?: boolean; callback: unknown;
};
function _wItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void; DestroyAnimVisualTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _wRt(): {
  gSprites?: Map<number, _WSprite>;
  gba?: {
    oam?: Array<{ tileId?: number }>;
    affineParams?: Array<{ pa?: number; pb?: number; pc?: number; pd?: number }>;
  };
  FreeOamMatrix?: (n: number) => void;
  DestroySprite?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
/** `DestroyAnimSprite` stockable en callback (C : StoreSpriteCallbackInData6(sprite, DestroyAnimSprite)). */
function _DestroyAnimSprite(sprite: unknown): void { _wItf().DestroyAnimSprite?.(sprite); }
// Random2 décomp → LCG local déterministe (pattern battle_anim_fight/ground — dette douce).
let _wLcg = 0x3243;
function _rand2(): number { _wLcg = (_wLcg * 1103515245 + 24691) & 0xFFFFFFFF; return (_wLcg >>> 16) & 0xFFFF; }
/** 1:1 `GetBattlerSpriteSubpriority` (battle_anim_mons.c:2035) — IsContest()=false ;
 *  position = battler (singles 1:1 ; doubles = dette douce). */
function _getBattlerSpriteSubpriority(battler: number): number {
  const position = battler; // GetBattlerPosition(battler) — singles : position == battler
  if (position === 0) return 30;       // B_POSITION_PLAYER_LEFT
  else if (position === 2) return 20;  // B_POSITION_PLAYER_RIGHT
  else if (position === 1) return 40;  // B_POSITION_OPPONENT_LEFT
  else return 50;                      // B_POSITION_OPPONENT_RIGHT
}
/** 1:1 `GetBattlerPosition` — singles : position == battler (doubles = dette douce). */
function _getBattlerPosition(battler: number): number { return battler; }
/** 1:1 `SetAverageBattlerPositions` (battle_anim_mons.c:2289) — singles :
 *  IsDoubleBattle()=false → partner = battler lui-même (moyenne = lui). */
function _setAverageBattlerPositions(battler: number, respectMonPicOffsets: boolean): { x: number; y: number } {
  const xCoordType = !respectMonPicOffsets ? 0 /* X */ : 2 /* X_2 */;
  const yCoordType = !respectMonPicOffsets ? 1 /* Y */ : 3 /* Y_PIC_OFFSET */;
  const battlerX = GetBattlerSpriteCoord(battler, xCoordType);
  const battlerY = GetBattlerSpriteCoord(battler, yCoordType);
  const partnerX = battlerX, partnerY = battlerY; // singles
  return { x: Math.trunc((battlerX + partnerX) / 2), y: Math.trunc((battlerY + partnerY) / 2) };
}
/** Sprite id d'un battler (résolution validée capture — battle_anim_mon_movement). */
function _battlerSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return (id === undefined || id === null || id < 0) ? 0xFF : id;
}
/** 1:1 `GetAnimBattlerSpriteId(animBattler)` (battle_anim_mons.c:373) —
 *  ANIM_ATTACKER=0 / ANIM_TARGET=1 (partners doubles = dette douce). */
function _getAnimBattlerSpriteId(animBattler: number): number {
  if (animBattler === 0) return _battlerSpriteId(_wItf().getAttacker?.() ?? 0);
  if (animBattler === 1) return _battlerSpriteId(_wItf().getTarget?.() ?? 1);
  return 0xFF;
}

// ─── Bulles simples (Bubble/BubbleBeam/Clamp/Whirlpool…) ────────────────────

/** 1:1 `AnimSmallBubblePair` (battle_anim_water.c:794) : paire de petites
 *  bulles posée sur la cible (arg3!=ANIM_ATTACKER) ou l'attaquant, monte en
 *  oscillant pendant arg2 frames. */
function AnimSmallBubblePair(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0, 0, 0];
  if ((args[3] | 0) !== 0 /* != ANIM_ATTACKER */)
    InitSpritePosToAnimTarget(sprite as never, true);
  else
    InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[7] = args[2] | 0;
  sprite.callback = AnimSmallBubblePair_Step;
}
/** 1:1 `AnimSmallBubblePair_Step` (battle_anim_water.c:804). */
function AnimSmallBubblePair_Step(sprite: _WSprite): void {
  sprite.data[0] = (sprite.data[0] + 11) & 0xFF;
  sprite.x2 = Sin(sprite.data[0], 4);
  sprite.data[1] += 48;
  sprite.y2 = -(sprite.data[1] >> 8);
  if (--sprite.data[7] === -1)
    _wItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimSmallDriftingBubbles` (battle_anim_water.c:1025) : bulle qui dérive
 *  aléatoirement depuis la cible (Water Spout & co). oam.tileNum += 8 = la
 *  frame « bulles » de la sheet small_bubbles. */
function AnimSmallDriftingBubbles(sprite: _WSprite): void {
  // sprite->oam.tileNum += 8 — template anims = gDummySpriteAnimTable (pas
  // d'AnimateSprite) → bump direct de l'OAM hardware (pattern gold stars).
  const oam = _wRt().gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam && typeof oam.tileId === 'number') oam.tileId += 8;
  InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  const randData = (_rand2() & 0xFF) | 256;
  let randData2 = _rand2() & 0x1FF;
  if (randData2 > 255)
    randData2 = 256 - randData2;
  sprite.data[1] = randData;
  sprite.data[2] = randData2;
  sprite.callback = AnimSmallDriftingBubbles_Step;
}
/** 1:1 `AnimSmallDriftingBubbles_Step` (battle_anim_water.c:1041). */
function AnimSmallDriftingBubbles_Step(sprite: _WSprite): void {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  if (sprite.data[1] & 1)
    sprite.x2 = -(sprite.data[3] >> 8);
  else
    sprite.x2 = sprite.data[3] >> 8;
  sprite.y2 = sprite.data[4] >> 8;
  if (++sprite.data[0] === 21)
    _wItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimWaterGunDroplet` (battle_anim_water.c:784) : gouttelette d'impact
 *  Water Gun — translation linéaire (durée arg4, dérive x arg2 / y arg4 — le
 *  double-usage d'arg4 est le quirk décomp, conservé). */
function AnimWaterGunDroplet(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = sprite.x + (args[2] | 0);
  sprite.data[4] = sprite.y + (args[4] | 0);
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimBubbleEffect` (battle_anim_poison.c:282) : bulle after-effect
 *  (poison/MOVE_BUBBLE/BUBBLEBEAM) — monte en oscillant + grossit (table
 *  affine du template) ; args [xOff, yOff, multiTarget]. */
function AnimBubbleEffect(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0, 0];
  if (!(args[2] | 0)) {
    InitSpritePosToAnimTarget(sprite as never, true);
  } else {
    const tgt = _wItf().getTarget?.() ?? 1;
    const p = _setAverageBattlerPositions(tgt, true);
    sprite.x = p.x;
    sprite.y = p.y;
    const atk = _wItf().getAttacker?.() ?? 0;
    if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */)
      args[0] = -(args[0] | 0);  // gBattleAnimArgs live (getArgs = référence)
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
  }
  sprite.invisible = false;
  sprite.callback = AnimBubbleEffect_Step;
}
/** 1:1 `AnimBubbleEffect_Step` (battle_anim_poison.c:302). */
function AnimBubbleEffect_Step(sprite: _WSprite): void {
  sprite.data[0] = (sprite.data[0] + 0xB) & 0xFF;
  sprite.x2 = Sin(sprite.data[0], 4);
  sprite.data[1] += 0x30;
  sprite.y2 = -(sprite.data[1] >> 8);
  if (sprite.affineAnimEnded)
    _wItf().DestroyAnimSprite?.(sprite);
}

// ─── Hydro Cannon ────────────────────────────────────────────────────────────

/** 1:1 `AnimHydroCannonCharge` (battle_anim_water.c:719) : orbe bleue qui
 *  grossit près de l'attaquant (stage 1 Hydro Cannon). IsContest()=false. */
function AnimHydroCannonCharge(sprite: _WSprite): void {
  const atk = _wItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, 0 /* X */);
  sprite.y = GetBattlerSpriteCoord(atk, 1 /* Y */);
  sprite.y2 = -10;
  const priority = _getBattlerSpriteSubpriority(atk);
  if ((atk & 1) === 0 /* B_SIDE_PLAYER */) {
    sprite.x2 = 10;
    sprite.subpriority = priority + 2;
  } else {
    sprite.x2 = -10;
    sprite.subpriority = priority - 2;
  }
  sprite.invisible = false;
  sprite.callback = AnimHydroCannonCharge_Step;
}
/** 1:1 `AnimHydroCannonCharge_Step` (battle_anim_water.c:748). */
function AnimHydroCannonCharge_Step(sprite: _WSprite): void {
  if (sprite.affineAnimEnded)
    _wItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimHydroCannonBeam` (battle_anim_water.c:755) : orbes du faisceau
 *  attaquant→cible (stage 2). args [xOff, yOff, xTgtOff, yTgtOff, durée,
 *  coordFlags] ; mute gBattleAnimArgs AVANT InitSpritePosToAnimAttacker
 *  (référence live 1:1). */
function AnimHydroCannonBeam(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  const atk = _wItf().getAttacker?.() ?? 0;
  const tgt = _wItf().getTarget?.() ?? 1;
  if ((atk & 1) === (tgt & 1) /* GetBattlerSide(atk) == GetBattlerSide(tgt) */) {
    args[0] = (args[0] | 0) * -1;
    if (_getBattlerPosition(atk) === 0 /* B_POSITION_PLAYER_LEFT */
      || _getBattlerPosition(atk) === 1 /* B_POSITION_OPPONENT_LEFT */)
      args[0] = (args[0] | 0) * -1;
  }
  const respectMonPicOffsets = ((args[5] | 0) & 0xFF00) === 0;
  const coordType = ((args[5] | 0) & 0xFF) === 0 ? 3 /* Y_PIC_OFFSET */ : 1 /* Y */;
  InitSpritePosToAnimAttacker(sprite as never, respectMonPicOffsets);
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */)
    args[2] = -(args[2] | 0);
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2 /* X_2 */) + (args[2] | 0);
  sprite.data[4] = GetBattlerSpriteCoord(tgt, coordType) + (args[3] | 0);
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

// ─── Water Pulse ─────────────────────────────────────────────────────────────

/** 1:1 `AnimWaterPulseBubble` (battle_anim_water.c:1497) : bulle à position
 *  écran ABSOLUE (args x, y, vitesseY, deltaSin, amplitude, durée). */
function AnimWaterPulseBubble(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  sprite.x = args[0] | 0;
  sprite.y = args[1] | 0;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.data[2] = args[4] | 0;
  sprite.data[3] = args[5] | 0;
  sprite.invisible = false;
  sprite.callback = AnimWaterPulseBubble_Step;
}
/** 1:1 `AnimWaterPulseBubble_Step` (battle_anim_water.c:1508). */
function AnimWaterPulseBubble_Step(sprite: _WSprite): void {
  sprite.data[4] -= sprite.data[0];
  sprite.y2 = Math.trunc(sprite.data[4] / 10);
  sprite.data[5] = (sprite.data[5] + sprite.data[1]) & 0xFF;
  sprite.x2 = Sin(sprite.data[5], sprite.data[2]);
  if (--sprite.data[3] === 0)
    _wItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimWaterPulseRingBubble` (battle_anim_water.c:1518) : bulle éjectée
 *  par l'anneau — dérive (data[1], data[2])>>7 pendant data[0] frames puis
 *  FreeSpriteOamMatrix + DestroySprite (PAS DestroyAnimSprite : créée hors
 *  createsprite, elle ne compte pas dans gAnimVisualTaskCount — 1:1). */
function AnimWaterPulseRingBubble(sprite: _WSprite): void {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 = sprite.data[3] >> 7;
  sprite.y2 = sprite.data[4] >> 7;
  if (--sprite.data[0] === 0) {
    const rt = _wRt();
    if (sprite.matrixNum !== undefined && sprite.matrixNum >= 0)
      rt.FreeOamMatrix?.(sprite.matrixNum);
    if (sprite.spriteId !== undefined)
      rt.DestroySprite?.(sprite.spriteId);
  }
}

/** 1:1 `AnimWaterPulseRing` (battle_anim_water.c:1531) : l'anneau Water Pulse —
 *  glisse de l'attaquant vers la cible en data[3] frames, éjecte 2 bulles
 *  toutes les data[4] frames. */
function AnimWaterPulseRing(sprite: _WSprite): void {
  const tgt = _wItf().getTarget?.() ?? 1;
  const args = _wItf().getArgs?.() ?? [0, 0, 0, 0];
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.data[1] = GetBattlerSpriteCoord(tgt, 2 /* X_2 */);
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 3 /* Y_PIC_OFFSET */);
  sprite.data[3] = args[2] | 0;
  sprite.data[4] = args[3] | 0;
  sprite.invisible = false;
  sprite.callback = AnimWaterPulseRing_Step;
}
/** 1:1 `AnimWaterPulseRing_Step` (battle_anim_water.c:1541). */
function AnimWaterPulseRing_Step(sprite: _WSprite): void {
  const xDiff = sprite.data[1] - sprite.x;
  const yDiff = sprite.data[2] - sprite.y;
  sprite.x2 = Math.trunc((sprite.data[0] * xDiff) / sprite.data[3]);
  sprite.y2 = Math.trunc((sprite.data[0] * yDiff) / sprite.data[3]);
  if (++sprite.data[5] === sprite.data[4]) {
    sprite.data[5] = 0;
    CreateWaterPulseRingBubbles(sprite, xDiff, yDiff);
  }
  if (sprite.data[3] === sprite.data[0])
    _wItf().DestroyAnimSprite?.(sprite);
  sprite.data[0]++;
}
/** 1:1 `CreateWaterPulseRingBubbles` (battle_anim_water.c:1558) : crée 2 bulles
 *  gWaterPulseRingBubbleSpriteTemplate (template résolu par le registre généré ;
 *  l'oam C = AffineNormal 8x8 → affineMode 1 réinjecté, le bridge généré perd
 *  l'affineMode du gOamData). Sheet ANIM_TAG_SMALL_BUBBLES déjà chargée par le
 *  loadspritegfx du script parent. */
function CreateWaterPulseRingBubbles(sprite: _WSprite, xDiff: number, yDiff: number): void {
  const atk = _wItf().getAttacker?.() ?? 0;
  const something = Math.trunc(sprite.data[0] / 2);
  const combinedX = (sprite.x + sprite.x2) << 16 >> 16;
  const combinedY = (sprite.y + sprite.y2) << 16 >> 16;
  const randomSomethingY = yDiff + (_rand2() % 10) - 5;
  const randomSomethingX = -xDiff + (_rand2() % 10) - 5;
  const tpl = lookupAnimTemplate('gWaterPulseRingBubbleSpriteTemplate');
  if (!tpl) return; // manifest/registre pas prêt — dette douce (le C crée toujours)
  const rt = _wRt();
  const mkBubble = (y: number, xVel: number): void => {
    const spriteId = _CreateSpriteFromTemplate(
      { ...tpl, oam: { ...(tpl.oam ?? { shape: 0, size: 0 }), affineMode: 1 } } as never,
      combinedX, combinedY + y, 130);
    if (spriteId < 0) return;
    const sp = rt.gSprites?.get(spriteId);
    if (!sp) return;
    sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
    sp.spriteId = spriteId;
    sp.data[0] = 20;
    sp.data[1] = randomSomethingY;
    sp.subpriority = _getBattlerSpriteSubpriority(atk) - 1;
    sp.data[2] = xVel;
  };
  for (let i = 0; i <= 0; i++) {
    // 1:1 boucle 1 (:1577) : bulle basse, vitesse x = |randomSomethingX|
    mkBubble(something, randomSomethingX < 0 ? -randomSomethingX : randomSomethingX);
  }
  for (let i = 0; i <= 0; i++) {
    // 1:1 boucle 2 (:1588) : bulle haute, vitesse x = -|randomSomethingX|
    mkBubble(-something, randomSomethingX > 0 ? -randomSomethingX : randomSomethingX);
  }
}

// ─── Dive / Astonish (battle_anim_flying.c — le lot « eau ») ────────────────

/** 1:1 `AnimSprayWaterDroplet` (battle_anim_flying.c:1104) : gouttelette
 *  éjectée du battler (Astonish/Dive) — vitesses randomisées, arg0 = côté
 *  (hFlip + direction), arg1 = battler (0 attaquant / 1 cible). */
function AnimSprayWaterDroplet(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0];
  const v1 = _rand2() & 0x1FF;
  const v2 = _rand2() & 0x7F;
  if (v1 % 2)
    sprite.data[0] = 736 + v1;
  else
    sprite.data[0] = 736 - v1;
  if (v2 % 2)
    sprite.data[1] = 896 + v2;
  else
    sprite.data[1] = 896 - v2;
  sprite.data[2] = args[0] | 0;
  if (sprite.data[2])
    sprite.hFlip = true; // sprite->oam.matrixNum = ST_OAM_HFLIP (sprite non-affine)
  if ((args[1] | 0) === 0) {
    const atk = _wItf().getAttacker?.() ?? 0;
    sprite.x = GetBattlerSpriteCoord(atk, 0 /* X */);
    sprite.y = GetBattlerSpriteCoord(atk, 1 /* Y */) + 32;
  } else {
    const tgt = _wItf().getTarget?.() ?? 1;
    sprite.x = GetBattlerSpriteCoord(tgt, 0 /* X */);
    sprite.y = GetBattlerSpriteCoord(tgt, 1 /* Y */) + 32;
  }
  sprite.invisible = false;
  sprite.callback = AnimSprayWaterDroplet_Step;
}
/** 1:1 `AnimSprayWaterDroplet_Step` (battle_anim_flying.c:1138). */
function AnimSprayWaterDroplet_Step(sprite: _WSprite): void {
  if (sprite.data[2] === 0) {
    sprite.x2 += sprite.data[0] >> 8;
    sprite.y2 -= sprite.data[1] >> 8;
  } else {
    sprite.x2 -= sprite.data[0] >> 8;
    sprite.y2 -= sprite.data[1] >> 8;
  }
  // sprite->data[0] = sprite->data[0]; (nop décomp conservé en commentaire)
  sprite.data[1] -= 32;
  if (sprite.data[0] < 0)
    sprite.data[0] = 0;
  if (++sprite.data[3] === 31)
    _wItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimDiveBall` (battle_anim_flying.c:1010) : la « boule » Dive (ombre
 *  ronde affine) — attend arg2 frames, monte en accélérant (arg3), disparaît
 *  hors écran puis retombe. CACHE le sprite de l'attaquant (1:1) ; le script
 *  DiveAttack le ré-affiche via l'op `visible ANIM_ATTACKER` (Cmd_visible 0x2C
 *  implémenté dans l'interpréteur). */
function AnimDiveBall(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0, 0, 0];
  InitSpritePosToAnimAttacker(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[1] = args[3] | 0;
  sprite.callback = AnimDiveBall_Step1;
  const monSp = _wRt().gSprites?.get(_getAnimBattlerSpriteId(0 /* ANIM_ATTACKER */));
  if (monSp) monSp.invisible = true; // gSprites[GetAnimBattlerSpriteId(ANIM_ATTACKER)].invisible = TRUE
}
/** 1:1 `AnimDiveBall_Step1` (battle_anim_flying.c:1019). */
function AnimDiveBall_Step1(sprite: _WSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
  } else if (sprite.y + sprite.y2 > -32) {
    sprite.data[2] += sprite.data[1];
    sprite.y2 -= sprite.data[2] >> 8;
  } else {
    sprite.invisible = true;
    if (sprite.data[3]++ > 20)
      sprite.callback = AnimDiveBall_Step2;
  }
}
/** 1:1 `AnimDiveBall_Step2` (battle_anim_flying.c:1038). */
function AnimDiveBall_Step2(sprite: _WSprite): void {
  sprite.y2 += sprite.data[2] >> 8;
  if (sprite.y + sprite.y2 > -32)
    sprite.invisible = false;
  if (sprite.y2 > 0)
    _wItf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimDiveWaterSplash` (battle_anim_flying.c:1049) : la gerbe d'eau du
 *  plongeon — étire le sprite en yScale (TrySetSpriteRotScale 0x200→32→...)
 *  et recale y2 depuis la matrice (t2 = 0x3D00/d + 1). Le gOamData C =
 *  AffineDouble_ObjNormal_64x64 ; le bridge généré perd l'affineMode →
 *  bootstrap 1:1 PrepareBattlerSpriteForRotScale (battle_anim_mons.c:1295 :
 *  alloc matrice + AFFINE_DOUBLE + centre 64x64). arg0 = 0 attaquant / 1 cible. */
function AnimDiveWaterSplash(sprite: _WSprite): void {
  const spriteId = sprite.spriteId ?? -1;
  switch (sprite.data[0]) {
    case 0: {
      const args = _wItf().getArgs?.() ?? [0];
      if (!(args[0] | 0)) {
        const atk = _wItf().getAttacker?.() ?? 0;
        sprite.x = GetBattlerSpriteCoord(atk, 0 /* X */);
        sprite.y = GetBattlerSpriteCoord(atk, 1 /* Y */);
      } else {
        const tgt = _wItf().getTarget?.() ?? 1;
        sprite.x = GetBattlerSpriteCoord(tgt, 0 /* X */);
        sprite.y = GetBattlerSpriteCoord(tgt, 1 /* Y */);
      }
      if (spriteId >= 0) PrepareBattlerSpriteForRotScale(spriteId, 0 /* ST_OAM_OBJ_NORMAL */);
      sprite.invisible = false;
      sprite.data[1] = 0x200;
      if (spriteId >= 0) TrySetSpriteRotScale(spriteId, false, 0x100, sprite.data[1], 0);
      sprite.data[0]++;
      break;
    }
    case 1: {
      if (sprite.data[2] <= 11)
        sprite.data[1] -= 40;
      else
        sprite.data[1] += 40;
      sprite.data[2]++;
      if (spriteId >= 0) TrySetSpriteRotScale(spriteId, false, 0x100, sprite.data[1], 0);
      // matrixNum = sprite->oam.matrixNum ; t2 = 0x3D00 / gOamMatrices[m].d + 1
      const d = _wRt().gba?.affineParams?.[sprite.matrixNum ?? 0]?.pd ?? 0x100;
      const t1 = 0x3D00;
      let t2 = d !== 0 ? Math.trunc(t1 / d) + 1 : 129; // d=0 impossible décomp (garde)
      if (t2 > 128)
        t2 = 128;
      t2 = Math.trunc((64 - t2) / 2);
      sprite.y2 = t2;
      if (sprite.data[2] === 24) {
        if (spriteId >= 0) ResetSpriteRotScale_PreserveAffine(spriteId);
        _wItf().DestroyAnimSprite?.(sprite);
      }
      break;
    }
  }
}

registerAnimCallbacks({
  AnimSmallBubblePair: AnimSmallBubblePair as never,
  AnimSmallDriftingBubbles: AnimSmallDriftingBubbles as never,
  AnimWaterGunDroplet: AnimWaterGunDroplet as never,
  AnimBubbleEffect: AnimBubbleEffect as never,
  AnimHydroCannonCharge: AnimHydroCannonCharge as never,
  AnimHydroCannonBeam: AnimHydroCannonBeam as never,
  AnimWaterPulseBubble: AnimWaterPulseBubble as never,
  AnimWaterPulseRing: AnimWaterPulseRing as never,
  AnimWaterPulseRingBubble: AnimWaterPulseRingBubble as never,
  AnimSprayWaterDroplet: AnimSprayWaterDroplet as never,
  AnimDiveBall: AnimDiveBall as never,
  AnimDiveWaterSplash: AnimDiveWaterSplash as never,
});

// ════════════════════════════════════════════════════════════════════════════
// AURORA BEAM (goal 2026-06-11) — AnimAuroraBeamRings (+_Step)
// (battle_anim_water.c:602/:622) 1:1.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 sprite.c `StartSpriteAnim(sprite, n)` : champs PLATS du runtime (pattern repo). */
function _abStartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}

/** 1:1 `AnimAuroraBeamRings` (battle_anim_water.c:602) : anneau arc-en-ciel
 *  d'Onde Boréale — translation linéaire attaquant → cible. args [x, y,
 *  xOffCible (miroir côté attaquant), yOffCible, durée] ; l'affine du template
 *  (sAffineAnims_AuroraBeamRing) reste en PAUSE jusqu'au signal du script. */
function AnimAuroraBeamRings(sprite: _WSprite): void {
  const args = _wItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0, 0, 0];
  const atk = _wItf().getAttacker?.() ?? 0;
  const tgt = _wItf().getTarget?.() ?? 1;
  let unkArg: number; // s16 unkArg;

  InitSpritePosToAnimAttacker(sprite as never, true);
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */)
    unkArg = -(args[2] | 0);
  else
    unkArg = args[2] | 0;
  sprite.invisible = false;
  sprite.data[0] = args[4] | 0;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, 2 /* BATTLER_COORD_X_2 */) + unkArg;
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, 3 /* BATTLER_COORD_Y_PIC_OFFSET */) + (args[3] | 0);
  InitAnimLinearTranslation(sprite as never);
  sprite.callback = AnimAuroraBeamRings_Step;
  (sprite as { affineAnimPaused?: boolean }).affineAnimPaused = true;
  AnimAuroraBeamRings_Step(sprite); // sprite->callback(sprite);
}

/** 1:1 `AnimAuroraBeamRings_Step` (:622) : gBattleAnimArgs[7] relu LIVE chaque
 *  frame — le script pose 0xFFFF (setarg 7) → anim 1 + dé-pause de l'affine ;
 *  destroy en fin de translation. */
function AnimAuroraBeamRings_Step(sprite: _WSprite): void {
  const arg7 = ((_wItf().getArgs?.() ?? [])[7] ?? 0) & 0xFFFF; // (u16)gBattleAnimArgs[7]
  if (arg7 === 0xFFFF) {
    _abStartSpriteAnim(sprite, 1);
    (sprite as { affineAnimPaused?: boolean }).affineAnimPaused = false;
  }
  if (AnimTranslateLinear(sprite as never))
    _wItf().DestroyAnimSprite?.(sprite);
}

registerAnimCallbacks({ AnimAuroraBeamRings: AnimAuroraBeamRings as never });

// ─── VAGUE F2 : AnimTask_StartSinAnimTimer (water.c:704, 5 hits) ────────────
// args[7] = timer sinusoïdal partagé (+3/frame) lu par les sprites (Surf...).
function _wItf2(): { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimTask_StartSinAnimTimer(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _wItf2();
  const args = itf.getArgs?.() ?? [];
  task.data[0] = args[0];
  args[7] = 0;
  task.func = _RunSinAnimTimer;
}
function _RunSinAnimTimer(task: { taskId: number; data: number[] }): void {
  const args = _wItf2().getArgs?.() ?? [];
  args[7] = (args[7] + 3) & 0xFF;
  if (--task.data[0] === 0) _wItf2().DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _wRegT } from '../engine/battle/battle-anim-registry';
_wRegT({ AnimTask_StartSinAnimTimer: AnimTask_StartSinAnimTimer as never });
