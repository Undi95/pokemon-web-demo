/**
 * battle_anim_water.ts — miroir PARTIEL de `src/battle_anim_water.c`
 * (décomp pokeemeraude) : BUBBLE/Écume, goal T4 2026-06-11.
 * gWaterBubbleProjectileSpriteTemplate (:114, ANIM_TAG_BUBBLE 10146, OAM
 * 16x16) — callback net-effect : le projectile générique (la trajectoire
 * sinusoïdale AnimWaterBubbleProjectile = dette douce).
 * GFX : bubble.png 16x48 (3 frames) byte-exact.
 */
import { DestroySprite } from './sprite';
import { getRuntime } from '../engine/system/decomp-globals';
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
  gSprites?: Array<_WSprite | undefined>;
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
      DestroySprite(getRuntime(), sprite.spriteId);
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
    const sp = rt.gSprites?.[spriteId];
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
  const monSp = _wRt().gSprites?.[_getAnimBattlerSpriteId(0 /* ANIM_ATTACKER */)];
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

// ─── VAGUE F2 : AnimTask_StartSinAnimTimer (battle_anim_water.c.c:704, 5 hits) ────────────
// args[7] = timer sinusoïdal partagé (+3/frame) lu par les sprites (Surf...).
function _wItf2(): { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimTask_StartSinAnimTimer(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _wItf2();
  const args = itf.getArgs?.() ?? [];
  task.data[0] = args[0];
  args[7] = 0;
  task.func = AnimTask_RunSinAnimTimer;
}
function AnimTask_RunSinAnimTimer(task: { taskId: number; data: number[] }): void {
  const args = _wItf2().getArgs?.() ?? [];
  args[7] = (args[7] + 3) & 0xFF;
  if (--task.data[0] === 0) _wItf2().DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _wRegT } from '../engine/battle/battle-anim-registry';
/** 1:1 `AnimTask_CreateRaindrops` (battle_anim_water.c.c, 4 hits — Rain Dance) : spawn une
 *  goutte aléatoire toutes args[1] frames pendant args[2] frames. RNG : LCG
 *  déterministe seedé par le timer (pas Math.random — interdit harness). */
let _rainSeed = 0x1234;
function _rainRand(): number {
  _rainSeed = (_rainSeed * 1103515245 + 12345) & 0x7FFFFFFF;
  return _rainSeed >> 16;
}
function AnimTask_CreateRaindrops(task: { taskId: number; data: number[] }): void {
  const itf = _wItf2() as { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  if (task.data[0] === 0) {
    task.data[1] = a[0];
    task.data[2] = a[1] || 2;
    task.data[3] = a[2];
  }
  task.data[0]++;
  if (task.data[0] % task.data[2] === 1) {
    const x = _rainRand() % 240;
    const y = _rainRand() % 80;
    // créer la goutte via le bridge (template generated avec son AnimCmd splash)
    const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number; oam: { shape: number; size: number }; callback: unknown; anims?: unknown } | undefined } | undefined;
    const tpl = bridge?.lookupGeneratedTemplateTags?.('gRainDropSpriteTemplate');
    const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ data: number[]; callback: unknown; oamIndex: number; anims?: unknown; tileBase?: number; animNum?: number; animCmdIndex?: number; animDelayCounter?: number; animBeginning?: boolean; animEnded?: boolean } | undefined>; CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number; gba?: { oam: Array<{ tileId: number }> } } | undefined;
    const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
    const sid = rt?.CreateSpriteInline?.({ oam: { shape: 2, size: 1, priority: 2 }, images: [] } as never, x, y, 4) ?? -1;
    if (sid >= 0) {
      const sp = rt?.gSprites?.[sid];
      const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
      const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
      if (oam && tileStart !== 0xFFFF) oam.tileId = tileStart;
      if (sp) {
        sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
        if (tpl?.anims) {
          sp.anims = tpl.anims as never;
          sp.tileBase = tileStart !== 0xFFFF ? tileStart : 0;
          sp.animNum = 0; sp.animCmdIndex = 0; sp.animDelayCounter = 0;
          sp.animBeginning = true; sp.animEnded = false;
        }
        sp.callback = AnimRainDrop_Step;
      }
    }
  }
  if (task.data[0] === task.data[3]) itf.DestroyAnimVisualTask?.(task.taskId);
}
function AnimRainDrop_Step(sprite: { data: number[]; x2: number; y2: number; animEnded?: boolean }): void {
  if (++sprite.data[0] <= 13) {
    sprite.x2++;
    sprite.y2 += 4;
  }
  if (sprite.animEnded || sprite.data[0] > 40) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<unknown | undefined>; DestroySprite?: (i: number) => void } | undefined;
    for (let sid = 0; sid < MAX_SPRITES; sid++) {
      const sp = rt?.gSprites?.[sid];
      if (sp === undefined) continue;
      if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
    }
  }
}
_wRegT({
  AnimTask_StartSinAnimTimer: AnimTask_StartSinAnimTimer as never,
  AnimTask_CreateRaindrops: AnimTask_CreateRaindrops as never,
});

// --- VAGUE F46 : AnimTask_WaterSport (battle_anim_water.c.c:1357-1495) --------------------
// Jet de gouttelettes balayé G<->D depuis l'attaquant ; chaque goutte fait un
// arc puis REBONDIT vers un point aleatoire avant de signaler la task.
import { InitAnimArcTranslation as _wsArcInit, TranslateAnimHorizontalArc as _wsArcRun } from './battle_anim_mons';

let _wsSeed = 0x5EED;
function _wsRand(): number {
  // LCG deterministe (pattern _rainSeed F2 — Random2 ROM non seedee ici).
  _wsSeed = (_wsSeed * 1103515245 + 12345) & 0x7FFFFFFF;
  return (_wsSeed >> 16) & 0xFFFF;
}
type _WsTask = { taskId: number; data: number[]; func?: unknown };
function _wsSpawnOrb(x: number, y: number, subprio: number): number {
  const rt = (globalThis as Record<string, unknown>).__rt as {
    gSprites?: Array<{ data: number[]; callback: unknown; oamIndex: number } | undefined>;
    CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
    gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
  } | undefined;
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
  const tpl = bridge?.lookupGeneratedTemplateTags?.('gSmallWaterOrbSpriteTemplate');
  const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
  const sid = rt?.CreateSpriteInline?.({ oam: { shape: 0, size: 0, priority: 2 }, images: [] } as never, x, y, subprio) ?? -1;
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

/** 1:1 AnimTask_WaterSport (battle_anim_water.c.c:1357). */
function AnimTask_WaterSport(task: _WsTask): void {
  const itf = _wItf();
  const atk = itf.getAttacker?.() ?? 0;
  task.data[3] = GetBattlerSpriteCoord(atk, 2 /* X_2 */);
  task.data[4] = GetBattlerSpriteCoord(atk, 3 /* Y_PIC_OFFSET */);
  task.data[7] = (atk & 1) === 0 ? 1 : -1; // GetBattlerSide == B_SIDE_PLAYER
  task.data[5] = task.data[3] + task.data[7] * 8;
  task.data[6] = task.data[4] - task.data[7] * 8;
  task.data[9] = -32;
  task.data[1] = 0;
  task.data[0] = 0;
  task.func = AnimTask_WaterSport_Step;
}
function AnimTask_WaterSport_Step(task: _WsTask): void {
  switch (task.data[0]) {
    case 0:
      _CreateWaterSportDroplet(task);
      if (task.data[10] !== 0) task.data[0]++;
      break;
    case 1:
      _CreateWaterSportDroplet(task);
      if (++task.data[1] > 16) {
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      _CreateWaterSportDroplet(task);
      task.data[5] += task.data[7] * 6;
      if (!(task.data[5] >= -16 && task.data[5] <= 256)) {
        if (++task.data[12] > 2) {
          task.data[13] = 1;
          task.data[0] = 6;
          task.data[1] = 0;
        } else {
          task.data[1] = 0;
          task.data[0]++;
        }
      }
      break;
    case 3:
      _CreateWaterSportDroplet(task);
      task.data[6] -= task.data[7] * 2;
      if (++task.data[1] > 7) task.data[0]++;
      break;
    case 4:
      _CreateWaterSportDroplet(task);
      task.data[5] -= task.data[7] * 6;
      if (!(task.data[5] >= -16 && task.data[5] <= 256)) {
        task.data[12]++;
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 5:
      _CreateWaterSportDroplet(task);
      task.data[6] -= task.data[7] * 2;
      if (++task.data[1] > 7) task.data[0] = 2;
      break;
    case 6:
      if (task.data[8] === 0) task.data[0]++;
      break;
    default:
      _wItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 CreateWaterSportDroplet (battle_anim_water.c.c:1443). */
function _CreateWaterSportDroplet(task: _WsTask): void {
  if (++task.data[2] > 1) {
    task.data[2] = 0;
    const sid = _wsSpawnOrb(task.data[3], task.data[4], 10);
    if (sid >= 0) {
      const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ data: number[]; callback: unknown } | undefined> } | undefined;
      const sp = rt?.gSprites?.[sid];
      if (sp) {
        sp.data[0] = 16;
        sp.data[2] = task.data[5];
        sp.data[4] = task.data[6];
        sp.data[5] = task.data[9];
        _wsArcInit(sp as never); // ecrase data[6] (phase d'arc) — d'ou le scan par func du C

        sp.callback = _AnimWaterSportDroplet as never;
        task.data[8]++;
      }
    }
  }
}
/** 1:1 AnimWaterSportDroplet : arc -> rebond aleatoire. */
function _AnimWaterSportDroplet(sprite: { x: number; y: number; x2: number; y2: number; data: number[]; callback: unknown }): void {
  if (_wsArcRun(sprite as never)) {
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.x2 = 0;
    sprite.y2 = 0;
    sprite.data[0] = 6;
    sprite.data[2] = (_wsRand() & 0x1F) - 16 + sprite.x;
    sprite.data[4] = (_wsRand() & 0x1F) - 16 + sprite.y;
    sprite.data[5] = ~(_wsRand() & 7);
    _wsArcInit(sprite as never);
    sprite.callback = _AnimWaterSportDroplet_Step as never;
  }
}
/** 1:1 AnimWaterSportDroplet_Step : 2e arc -> signale LA task WaterSport
 *  (scan par func, 1:1 — data[6] est la phase d'arc, pas un id). */
function _AnimWaterSportDroplet_Step(sprite: { data: number[] }): void {
  if (_wsArcRun(sprite as never)) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[]; func?: unknown }>; gSprites?: Array<unknown | undefined>; DestroySprite?: (i: number) => void } | undefined;
    for (const t of rt?.gTasks?.values() ?? []) {
      if (t.func === AnimTask_WaterSport_Step) {
        t.data[10] = 1;
        t.data[8]--;
      }
    }
    for (let sid = 0; sid < MAX_SPRITES; sid++) {
      const sp = rt?.gSprites?.[sid];
      if (sp === undefined) continue;
      if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
    }
  }
}
_wRegT({ AnimTask_WaterSport: AnimTask_WaterSport as never });

// --- VAGUE F47 : WaterSpout complet (battle_anim_water.c.c:1054-1356) ---------------------
// Launch : le mon ecrase/etire (erupt) + 20 gouttes en eventail ; Rain : pluie
// de gouttes (ISO_RANDOMIZE2 1:1) + splats clignotants + HorizontalShake x2.
import {
  PrepareEruptAnimTaskData as _spPrepErupt,
  UpdateEruptAnimTask as _spUpdErupt,
  GetBattlerSpriteSubpriority as _spSubprio2,
  SetBattlerSpriteYOffsetFromYScale as _spYFromScale,
} from './battle_anim_mons';
import { gSineTable as _spSine, Cos as _spCos, Sin as _spSin } from './trig';
import { gBattlerPartyIndexes as _spPartyIdx } from '../engine/battle/state';
import { gEnemyParty as _spEnemyParty, gPlayerParty as _spPlayerParty, GetMonData as _spGetMon, MON_DATA_HP as _SP_HP, MON_DATA_MAX_HP as _SP_MAXHP } from '../engine/battle/party-storage';

type _SpTask = { taskId: number; data: number[]; func?: unknown };
function _spRt2(): {
  gSprites?: Array<{ x: number; y: number; x2: number; y2: number; data: number[]; callback: unknown; oamIndex: number; invisible?: boolean } | undefined>;
  gTasks?: Map<number, { data: number[]; func?: unknown }>;
  CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
  CreateTask?: (f: unknown, prio: number) => number;
  DestroySprite?: (i: number) => void;
  gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _spMons2(): { PrepareBattlerSpriteForRotScale?: (id: number, m: number) => void; ResetSpriteRotScale?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimMons as never) ?? {};
}
function _spAtkSpriteId2(): number {
  const b = _wItf().getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
function _spSpawnOrb2(x: number, y: number, subprio: number): number {
  return _wsSpawnOrb(x, y, subprio);
}
/** 1:1 GetWaterSpoutPowerForAnim : quart de HP de l'attaquant (0-3). */
function _GetWaterSpoutPowerForAnim(): number {
  const atk = _wItf().getAttacker?.() ?? 0;
  const party = (atk & 1) === 0 ? _spPlayerParty : _spEnemyParty;
  const slot = party[_spPartyIdx[atk]];
  const maxhpQ = Math.trunc(((_spGetMon(slot as never, _SP_MAXHP) as number) || 1) / 4);
  const hp = (_spGetMon(slot as never, _SP_HP) as number) || 0;
  for (let i = 0; i < 3; i++) {
    if (hp < maxhpQ * (i + 1)) return i;
  }
  return 3;
}

/** 1:1 AnimTask_WaterSpoutLaunch (battle_anim_water.c.c:1054). */
function AnimTask_WaterSpoutLaunch(task: _SpTask): void {
  task.data[15] = _spAtkSpriteId2();
  if (task.data[15] === 0xFF) { _wItf().DestroyAnimVisualTask?.(task.taskId); return; }
  const sp = _spRt2().gSprites?.[task.data[15]];
  task.data[5] = sp ? sp.y : 0;
  task.data[1] = _GetWaterSpoutPowerForAnim();
  _spMons2().PrepareBattlerSpriteForRotScale?.(task.data[15], 0);
  task.func = AnimTask_WaterSpoutLaunch_Step;
}
type _SpOrbSprite = { x: number; y: number; x2: number; y2: number; data: number[]; callback: unknown; oamIndex: number; invisible?: boolean } | undefined;
function _WaterSpoutLaunch_Case1(task: _SpTask, sp: _SpOrbSprite): void {
  if (++task.data[3] > 1) {
    task.data[3] = 0;
    if (++task.data[4] & 1) {
      if (sp) { sp.x2 = 3; sp.y++; }
    } else {
      if (sp) sp.x2 = -3;
    }
  }
  if (_spUpdErupt(task as never) === 0) {
    _spYFromScale(task.data[15]);
    if (sp) sp.x2 = 0;
    task.data[3] = 0;
    task.data[4] = 0;
    task.data[0]++;
  }
}
function _WaterSpoutLaunch_Case5(task: _SpTask, sp: _SpOrbSprite): void {
  if (++task.data[3] > 1) {
    task.data[3] = 0;
    if (++task.data[4] & 1) {
      if (sp) sp.y2 += 2;
    } else {
      if (sp) sp.y2 -= 2;
    }
    if (task.data[4] === 10) {
      _spPrepErupt(task as never, task.data[15], 0x180, 0xE0, 0x100, 0x100, 8);
      task.data[3] = 0;
      task.data[4] = 0;
      task.data[0]++;
    }
  }
}
function AnimTask_WaterSpoutLaunch_Step(task: _SpTask): void {
  const rt = _spRt2();
  const sp = rt.gSprites?.[task.data[15]];
  switch (task.data[0]) {
    case 0:
      _spPrepErupt(task as never, task.data[15], 0x100, 0x100, 0xE0, 0x200, 32);
      task.data[0]++;
      _WaterSpoutLaunch_Case1(task, sp); // 1:1 fallthrough C (meme frame)
      break;
    case 1:
      _WaterSpoutLaunch_Case1(task, sp);
      break;
    case 99: // (cases suivants ci-dessous)
      break; // (case 99 inutilise)
    case 2:
      if (++task.data[3] > 4) {
        _spPrepErupt(task as never, task.data[15], 0xE0, 0x200, 0x180, 0xE0, 8);
        task.data[3] = 0;
        task.data[0]++;
      }
      break;
    case 3:
      if (_spUpdErupt(task as never) === 0) {
        task.data[3] = 0;
        task.data[4] = 0;
        task.data[0]++;
      }
      break;
    case 4:
      _CreateWaterSpoutLaunchDroplets(task, task.taskId);
      task.data[0]++;
      _WaterSpoutLaunch_Case5(task, sp); // 1:1 fallthrough C
      break;
    case 5:
      _WaterSpoutLaunch_Case5(task, sp);
      break;
    case 98: // (corps deplace)
      break; // (case 98 inutilise)
    case 6:
      if (sp) sp.y--;
      if (_spUpdErupt(task as never) === 0) {
        _spMons2().ResetSpriteRotScale?.(task.data[15]);
        if (sp) sp.y = task.data[5];
        task.data[4] = 0;
        task.data[0]++;
      }
      break;
    case 7:
      if (task.data[2] === 0) _wItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 CreateWaterSpoutLaunchDroplets (battle_anim_water.c.c:1184). */
function _CreateWaterSpoutLaunchDroplets(task: _SpTask, taskId: number): void {
  const atk = _wItf().getAttacker?.() ?? 0;
  const ax = GetBattlerSpriteCoord(atk, 2);
  const ay = GetBattlerSpriteCoord(atk, 3);
  let trigIndex = 172;
  const subprio = _spSubprio2(atk) - 1;
  let increment = 4 - task.data[1];
  if (increment <= 0) increment = 1;
  for (let i = 0; i < 20; i += increment) {
    const sid = _spSpawnOrb2(ax, ay, subprio);
    if (sid >= 0) {
      const sp = _spRt2().gSprites?.[sid];
      if (sp) {
        sp.data[1] = i;
        sp.data[2] = ax * 16;
        sp.data[3] = ay * 16;
        sp.data[4] = _spCos(trigIndex & 0xFF, 64);
        sp.data[5] = _spSin(trigIndex & 0xFF, 64);
        sp.data[6] = taskId;
        sp.data[7] = 2;
        sp.callback = _AnimSmallWaterOrb as never;
        if (task.data[2] & 1) _AnimSmallWaterOrb(sp as never);
        task.data[2]++;
      }
    }
    trigIndex = (trigIndex + increment * 2) & 0xFF;
  }
}
/** 1:1 AnimSmallWaterOrb : projection 16.4 jusqu'a la sortie d'ecran. */
function _AnimSmallWaterOrb(sprite: { x: number; y: number; data: number[] }): void {
  if (sprite.data[0] === 0) {
    sprite.data[4] += (sprite.data[1] % 6) * 3;
    sprite.data[5] += (sprite.data[1] % 3) * 3;
    sprite.data[0]++;
  }
  { // 1:1 case 1 (fallthrough C : execute aussi la frame du case 0)
    {
      sprite.data[2] += sprite.data[4];
      sprite.data[3] += sprite.data[5];
      sprite.x = sprite.data[2] >> 4;
      sprite.y = sprite.data[3] >> 4;
      if (sprite.x < -8 || sprite.x > 248 || sprite.y < -8 || sprite.y > 120) {
        const rt = _spRt2();
        const t = rt.gTasks?.get(sprite.data[6]);
        if (t) t.data[sprite.data[7]]--;
        for (let sid = 0; sid < MAX_SPRITES; sid++) {
          const sp = rt.gSprites?.[sid];
          if (sp === undefined) continue;
          if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
        }
      }
    }
  }
}

/** 1:1 AnimTask_WaterSpoutRain (battle_anim_water.c.c:1239). */
function AnimTask_WaterSpoutRain(task: _SpTask): void {
  const atk = _wItf().getAttacker?.() ?? 0;
  task.data[1] = _GetWaterSpoutPowerForAnim();
  if ((atk & 1) === 0) {
    task.data[4] = 136;
    task.data[6] = 40;
  } else {
    task.data[4] = 16;
    task.data[6] = 80;
  }
  task.data[5] = 98;
  task.data[7] = task.data[4] + 49;
  task.data[12] = task.data[1] * 5 + 5;
  task.func = AnimTask_WaterSpoutRain_Step;
}
function AnimTask_WaterSpoutRain_Step(task: _SpTask): void {
  switch (task.data[0]) {
    case 0:
      if (++task.data[2] > 2) {
        task.data[2] = 0;
        _CreateWaterSpoutRainDroplet(task, task.taskId);
      }
      if (task.data[10] !== 0 && task.data[13] === 0) {
        // 1:1 : deux HorizontalShake (TARGET + DEF_PARTNER) crees + appel
        // immediat + gAnimVisualTaskCount++ — via le registre des tasks.
        const reg = (globalThis as Record<string, unknown>).__battleAnimRegistryStore as { tasks?: Map<string, (t: unknown) => void> } | undefined;
        const shakeFn = reg?.tasks?.get('AnimTask_HorizontalShake');
        const itf = ((globalThis as Record<string, unknown>).__battleAnimInterpreter as { getArgs?: () => number[] } | undefined);
        const args = itf?.getArgs?.();
        const rt = _spRt2();
        if (shakeFn && args && rt.CreateTask && rt.gTasks) {
          args[0] = 1; // ANIM_TARGET
          args[1] = 0;
          args[2] = 12;
          const t2 = rt.CreateTask((tk: unknown) => { /* func reposee par shakeFn */ void tk; }, 80);
          const tobj = rt.gTasks.get(t2);
          if (tobj) {
            shakeFn(tobj); // pose tobj.func et lit args (appel immediat 1:1)
            ((globalThis as Record<string, unknown>).__battleAnimInterpreter as { incVisualTaskCount?: () => void } | undefined)?.incVisualTaskCount?.();
          }
        }
        task.data[13] = 1;
      }
      if (task.data[11] >= task.data[12]) task.data[0]++;
      break;
    case 1:
      if (task.data[9] === 0) _wItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 CreateWaterSpoutRainDroplet (battle_anim_water.c.c:1304) — ISO_RANDOMIZE2 exact. */
function _CreateWaterSpoutRainDroplet(task: _SpTask, taskId: number): void {
  const yPosArg = (((_spSine[task.data[8]] ?? 0) + 3) >> 4) + task.data[6];
  const sid = _spSpawnOrb2(task.data[7], 0, 0);
  if (sid >= 0) {
    const sp = _spRt2().gSprites?.[sid];
    if (sp) {
      sp.callback = _AnimWaterSpoutRain as never;
      sp.data[0] = 0;
      sp.data[5] = yPosArg;
      sp.data[6] = taskId;
      sp.data[7] = 9;
      task.data[9]++;
    }
  }
  task.data[11]++;
  task.data[8] = (task.data[8] + 39) & 0xFF;
  // ISO_RANDOMIZE2(x) = x*1103515245+24691 (u32) — 1:1 ROM
  const r = (Math.imul(task.data[7], 1103515245) + 24691) >>> 0;
  task.data[7] = (r % task.data[5]) + task.data[4];
}
/** 1:1 AnimWaterSpoutRain : chute 8px/f -> splat clignotant. */
function _AnimWaterSpoutRain(sprite: { x: number; y: number; data: number[]; callback: unknown }): void {
  if (sprite.data[0] === 0) {
    sprite.y += 8;
    if (sprite.y >= sprite.data[5]) {
      const rt = _spRt2();
      const t = rt.gTasks?.get(sprite.data[6]);
      if (t) t.data[10] = 1;
      const hitId = _wsSpawnOrb(sprite.x, sprite.y, 1); // gWaterHitSplatSpriteTemplate (meme tag eau)
      if (hitId >= 0) {
        const hit = rt.gSprites?.[hitId];
        if (hit) {
          hit.data[1] = 0;
          hit.data[2] = 0;
          hit.data[6] = sprite.data[6];
          hit.data[7] = sprite.data[7];
          hit.callback = _AnimWaterSpoutRainHit as never;
        }
      }
      for (let sid = 0; sid < MAX_SPRITES; sid++) {
        const sp = rt.gSprites?.[sid];
        if (sp === undefined) continue;
        if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
      }
    }
  }
}
/** 1:1 AnimWaterSpoutRainHit : clignote 12 cycles puis meurt. */
function _AnimWaterSpoutRainHit(sprite: { data: number[]; invisible?: boolean }): void {
  if (++sprite.data[1] > 1) {
    sprite.data[1] = 0;
    sprite.invisible = !sprite.invisible;
    if (++sprite.data[2] === 12) {
      const rt = _spRt2();
      const t = rt.gTasks?.get(sprite.data[6]);
      if (t) t.data[sprite.data[7]]--;
      for (let sid = 0; sid < MAX_SPRITES; sid++) {
        const sp = rt.gSprites?.[sid];
        if (sp === undefined) continue;
        if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
      }
    }
  }
}
_wRegT({
  AnimTask_WaterSpoutLaunch: AnimTask_WaterSpoutLaunch as never,
  AnimTask_WaterSpoutRain: AnimTask_WaterSpoutRain as never,
});

// --- VAGUE F80 : AnimTask_RotateAuroraRingColors(+Step) (battle_anim_water.c.c:634) -------
// Aurora Beam : rotation circulaire des couleurs 1..7 du slot OBJ du tag
// RAINBOW_RINGS (10140) toutes les 3 frames, pendant args[0] frames.
function AnimTask_RotateAuroraRingColors(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { getArgs?: () => number[]; DestroyAnimVisualTask?: (id: number) => void };
  const spApi = (globalThis as Record<string, unknown>).__sprite as { IndexOfSpritePaletteTag?: (t: number) => number } | undefined;
  task.data[0] = (itf.getArgs?.() ?? [40])[0] | 0;
  const slot = spApi?.IndexOfSpritePaletteTag?.(10140) ?? 0xFF; // ANIM_TAG_RAINBOW_RINGS
  if (slot === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[2] = 256 + slot * 16; // OBJ_PLTT_ID
  task.func = AnimTask_RotateAuroraRingColors_Step;
}
function AnimTask_RotateAuroraRingColors_Step(task: { taskId: number; data: number[] }): void {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { DestroyAnimVisualTask?: (id: number) => void };
  const rt = (globalThis as Record<string, unknown>).__rt as { gPlttBufferFaded?: { get: (i: number) => number; set: (i: number, v: number) => void } } | undefined;
  const pf = rt?.gPlttBufferFaded;
  if (++task.data[10] === 3 && pf) {
    task.data[10] = 0;
    const palIndex = task.data[2] + 1;
    const rgbBuffer = pf.get(palIndex);
    for (let i = 1; i < 8; i++) pf.set(palIndex + i - 1, pf.get(palIndex + i));
    pf.set(palIndex + 7, rgbBuffer);
  }
  if (++task.data[11] === task.data[0]) itf.DestroyAnimVisualTask?.(task.taskId);
}
_wRegT({ AnimTask_RotateAuroraRingColors: AnimTask_RotateAuroraRingColors as never });

// --- VAGUE F83 : SURF — AnimTask_CreateSurfWave(+Step1/Step2) + la task
// scanline BLDALPHA (battle_anim_water.c.c:814-1023). La vague plein écran : fond surf en
// BG1 (tilemap player/opponent, palette surf ou muddy selon args[0]), scroll
// diagonal, rotation des couleurs 2..7 toutes les 4 frames, montée/descente
// du blend via la 2e TASK qui remplit gScanlineEffectRegBuffers de valeurs
// BLDALPHA par BANDE de scanlines (dmaDest=REG_BLDALPHA routé scanline_effect).
import {
  gScanlineEffect as _swScanFx,
  gScanlineEffectRegBuffers as _swScanBufs,
  ScanlineEffect_SetParams as _swScanSetParams,
  ScanlineEffect_Stop as _swScanStop,
} from './scanline_effect';
import {
  GetBattleAnimBg1Data as _swBgData,
  AnimLoadCompressedBgGfx as _swLoadGfx,
  AnimLoadCompressedBgTilemap as _swLoadMap,
  LoadAnimBgPalette as _swLoadPal,
  ClearBattleAnimBg as _swClearBg,
} from '../engine/battle/battle-anim-interpreter';
import { MAX_SPRITES } from '../engine/system/decomp-runtime';

type _SfwTask = { taskId: number; data: number[]; func?: unknown; priority?: number };
function _sfwRt(): {
  SetGpuReg?: (o: number, v: number) => void;
  CreateTask?: (fn: (t: _SfwTask) => void, prio: number) => number;
  DestroyTask?: (id: number) => void;
  gTasks?: Map<number, _SfwTask>;
  gba?: { bg: (i: number) => { config: { priority: number; screenSize: number; charBaseIndex: number; visible: boolean } } };
  gPlttBufferFaded?: { get: (i: number) => number; set: (i: number, v: number) => void };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _sfwItf(): { getArgs?: () => number[]; getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _sfwSetG(name: string, v: number): void {
  (globalThis as Record<string, unknown>)[name] = v & 0xFFFF;
}
function _sfwG(name: string): number {
  return ((globalThis as Record<string, unknown>)[name] as number) ?? 0;
}

/** 1:1 AnimTask_CreateSurfWave (battle_anim_water.c.c:814). args[0] = palette (0 surf, 1 muddy). */
function AnimTask_CreateSurfWave(task: _SfwTask): void {
  const itf = _sfwItf();
  const rt = _sfwRt();
  const args = itf.getArgs?.() ?? [0];
  const atk = itf.getAttacker?.() ?? 0;
  rt.SetGpuReg?.(0x50, 0x3F42); // BLDCNT_TGT1_BG1 | EFFECT_BLEND | TGT2_ALL
  rt.SetGpuReg?.(0x52, 0 | (16 << 8));
  const bg1 = rt.gba?.bg(1)?.config;
  if (bg1) {
    bg1.priority = 1;
    bg1.screenSize = 1;
    bg1.charBaseIndex = 1;
    bg1.visible = true;
  }
  const animBg = _swBgData();
  if ((atk & 1) !== 0) _swLoadMap(animBg.bgId, 'gBattleAnimBgTilemap_SurfOpponent');
  else _swLoadMap(animBg.bgId, 'gBattleAnimBgTilemap_SurfPlayer');
  _swLoadGfx(animBg.bgId, 'gBattleAnimBgImage_Surf', animBg.tilesOffset);
  if ((args[0] | 0) === 0) _swLoadPal('gBattleAnimBgPalette_Surf', animBg.paletteId);
  else _swLoadPal('gBattleAnimBackgroundImageMuddyWater_Pal', animBg.paletteId);
  const taskId2 = rt.CreateTask?.((t) => _SurfWaveScanlineEffect(t), 2) ?? -1;
  task.data[15] = taskId2;
  const t2 = taskId2 >= 0 ? rt.gTasks?.get(taskId2) : undefined;
  if (t2) {
    t2.data[0] = 0;
    t2.data[1] = 0x1000;
    t2.data[2] = 0x1000;
  }
  // branche combat (pas contest)
  if ((atk & 1) !== 0) { // B_SIDE_OPPONENT
    _sfwSetG('gBattle_BG1_X', -224);
    _sfwSetG('gBattle_BG1_Y', 256);
    task.data[0] = 2;
    task.data[1] = -1;
    if (t2) t2.data[3] = 1;
  } else {
    _sfwSetG('gBattle_BG1_X', 0);
    _sfwSetG('gBattle_BG1_Y', -48);
    task.data[0] = -2;
    task.data[1] = 1;
    if (t2) t2.data[3] = 0;
  }
  rt.SetGpuReg?.(0x14, _sfwG('gBattle_BG1_X')); // REG_BG1HOFS
  rt.SetGpuReg?.(0x16, _sfwG('gBattle_BG1_Y')); // REG_BG1VOFS
  if (t2) {
    if (t2.data[3] === 0) { t2.data[4] = 48; t2.data[5] = 112; }
    else { t2.data[4] = 0; t2.data[5] = 0; }
  }
  task.data[6] = 1;
  task.func = _CreateSurfWave_Step1;
}
/** 1:1 AnimTask_CreateSurfWave_Step1 (battle_anim_water.c.c:893). */
function _CreateSurfWave_Step1(task: _SfwTask): void {
  const rt = _sfwRt();
  _sfwSetG('gBattle_BG1_X', _sfwG('gBattle_BG1_X') + task.data[0]);
  _sfwSetG('gBattle_BG1_Y', _sfwG('gBattle_BG1_Y') + task.data[1]);
  const animBg = _swBgData();
  task.data[2] += task.data[1];
  const pf = rt.gPlttBufferFaded;
  if (++task.data[5] === 4 && pf) {
    const base = animBg.paletteId * 16;
    const rgbBuffer = pf.get(base + 7);
    for (let i = 6; i !== 0; i--) pf.set(base + 1 + i, pf.get(base + i));
    pf.set(base + 1, rgbBuffer);
    task.data[5] = 0;
  }
  const t2 = rt.gTasks?.get(task.data[15]);
  if (++task.data[6] > 1) {
    task.data[6] = 0;
    if (++task.data[3] <= 13) {
      if (t2) t2.data[1] = (task.data[3] | ((16 - task.data[3]) << 8)) << 16 >> 16;
      task.data[4]++;
    }
    if (task.data[3] > 54) {
      task.data[4]--;
      if (t2) t2.data[1] = (task.data[4] | ((16 - task.data[4]) << 8)) << 16 >> 16;
    }
  }
  if (t2 && !(t2.data[1] & 0x1F)) {
    task.data[0] = t2.data[1] & 0x1F;
    task.func = _CreateSurfWave_Step2;
  }
}
/** 1:1 AnimTask_CreateSurfWave_Step2 (battle_anim_water.c.c:939). */
function _CreateSurfWave_Step2(task: _SfwTask): void {
  const rt = _sfwRt();
  if (task.data[0] === 0) {
    _swClearBg(1);
    _swClearBg(2);
    task.data[0]++;
  } else {
    const bg1 = rt.gba?.bg(1)?.config;
    if (bg1) bg1.charBaseIndex = 0;
    _sfwSetG('gBattle_BG1_X', 0);
    _sfwSetG('gBattle_BG1_Y', 0);
    rt.SetGpuReg?.(0x50, 0);
    rt.SetGpuReg?.(0x52, 0);
    const t2 = rt.gTasks?.get(task.data[15]);
    if (t2) t2.data[15] = -1;
    _sfwItf().DestroyAnimVisualTask?.(task.taskId);
  }
}
/** 1:1 AnimTask_SurfWaveScanlineEffect (battle_anim_water.c.c:961) : BLDALPHA par bande. */
function _SurfWaveScanlineEffect(task: _SfwTask): void {
  const rt = _sfwRt();
  const buf0 = _swScanBufs[0], buf1 = _swScanBufs[1];
  switch (task.data[0]) {
    case 0: {
      let i = 0;
      for (i = 0; i < task.data[4]; i++) { buf0[i] = task.data[2] & 0xFFFF; buf1[i] = task.data[2] & 0xFFFF; }
      for (i = task.data[4]; i < task.data[5]; i++) { buf0[i] = task.data[1] & 0xFFFF; buf1[i] = task.data[1] & 0xFFFF; }
      for (i = task.data[5]; i < 160; i++) { buf0[i] = task.data[2] & 0xFFFF; buf1[i] = task.data[2] & 0xFFFF; }
      const v = (task.data[4] === 0 ? task.data[1] : task.data[2]) & 0xFFFF;
      buf0[i] = v; buf1[i] = v;
      _swScanSetParams({ dmaDest: 0x52, dmaControl: 0, initState: 1, unused9: 0 } as never);
      task.data[0]++;
      break;
    }
    case 1: {
      if (task.data[3] === 0) {
        if (--task.data[4] <= 0) {
          task.data[4] = 0;
          task.data[0]++;
        }
      } else if (++task.data[5] > 111) {
        task.data[0]++;
      }
      const buf = _swScanBufs[_swScanFx.srcBuffer];
      for (let i = 0; i < task.data[4]; i++) buf[i] = task.data[2] & 0xFFFF;
      for (let i = task.data[4]; i < task.data[5]; i++) buf[i] = task.data[1] & 0xFFFF;
      for (let i = task.data[5]; i < 160; i++) buf[i] = task.data[2] & 0xFFFF;
      break;
    }
    case 2: {
      const buf = _swScanBufs[_swScanFx.srcBuffer];
      for (let i = 0; i < task.data[4]; i++) buf[i] = task.data[2] & 0xFFFF;
      for (let i = task.data[4]; i < task.data[5]; i++) buf[i] = task.data[1] & 0xFFFF;
      for (let i = task.data[5]; i < 160; i++) buf[i] = task.data[2] & 0xFFFF;
      if (task.data[15] === -1) {
        _swScanStop();
        rt.DestroyTask?.(task.taskId);
      }
      break;
    }
  }
}
_wRegT({ AnimTask_CreateSurfWave: AnimTask_CreateSurfWave as never });
