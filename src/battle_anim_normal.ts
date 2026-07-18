/**
 * battle_anim_normal.ts — miroir PARTIEL de `src/battle_anim_normal.c`
 * (décomp pokeemeraude) : le HITSPLAT (l'impact blanc des coups physiques),
 * premier sprite d'anim de move VISIBLE (goal T4 2026-06-10).
 *
 * Porté 1:1 :
 *   - gBasicHitSplatSpriteTemplate (:169) — tileTag/palTag ANIM_TAG_IMPACT
 *     (10135), OAM 32x32 affine blend, callback AnimHitSplatBasic.
 *   - AnimHitSplatBasic (:~520) : StartSpriteAffineAnim(variante) +
 *     InitSpritePosToAnimTarget/Attacker + RunStoredCallbackWhenAffineAnimEnds
 *     → DestroyAnimSprite. Adaptation plateforme : la variante affine
 *     (sAffineAnims_HitSplat 0-3 = scales) → SetSpriteRotScale + timer 12
 *     frames (même net-effect : flash d'impact qui scale puis disparaît).
 *
 * GFX : impact.png extrait → impact.4bpp.bin (512B, 16 tiles 32x32) +
 * impact.gbapal — charge par TAG via le MÉCANISME DECOMP (assetCache +
 * LoadCompressedSpriteSheetUsingHeap), exactement comme les balls.
 *
 * Dettes : les autres templates du fichier (HandleInvert/Persistent/Random/
 * OnMonEdge/CrossImpact/Flashing...) + ConfusionDuck + BlendColorCycle — par
 * vagues avec les moves consommateurs.
 */
import { BeginNormalPaletteFade } from './palette';
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag, BlendPalettes,
} from '../harness/runtime/decomp-globals';
import { registerAnimTemplates } from './engine/battle/battle-anim-registry';
import { registerAnimCallbacks } from './battle_anim';

import { registerAffineAnim, registerAffineAnimTable } from './engine/decomp-impls/sprite-affine-extras';
import {
  SetSpriteRotScale, PrepareBattlerSpriteForRotScale,
  InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  SetSpriteCoordsToAnimAttackerCoords, StoreSpriteCallbackInData6,
  SetCallbackToStoredInData6, DestroySpriteAndMatrix,
} from './battle_anim_mons';
import { Random2 } from './random';
// Import DIRECT sprite.ts (élimination __sprite, 2026-06-30).
import { IndexOfSpritePaletteTag as _spr_IndexOfSpritePaletteTag } from './sprite';

export const ANIM_TAG_IMPACT = 10135; // ANIM_SPRITES_START(10000) + 135, battle_anim.h:145

// 1:1 gBattleAnimPicTable/PaletteTable entries pour ANIM_TAG_IMPACT
// (battle_anim_data : {gBattleAnimSpriteGfx_Impact, 0x0200, ANIM_TAG_IMPACT}).
const sAnimSpriteSheet_Impact = { data: 'gAnimGfx_Impact', size: 512, tag: ANIM_TAG_IMPACT };
const sAnimSpritePalette_Impact = { data: 'gAnimPal_Impact', tag: ANIM_TAG_IMPACT };

/** Charge la sheet+palette du tag IMPACT si pas déjà en VRAM (pattern LoadBallGfx). */
export function LoadAnimImpactGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_IMPACT) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sAnimSpriteSheet_Impact);
    LoadCompressedSpritePaletteUsingHeap(sAnimSpritePalette_Impact);
  }
}

type AnimSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean;
  callback: ((s: AnimSprite) => void) | null;
  spriteId?: number; oamIndex?: number;
};

function _rt(): { gSprites?: Array<AnimSprite | undefined>; DestroySprite?: (id: number) => void } | undefined {
  return (globalThis as Record<string, unknown>).__rt as never;
}
function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _battlerSprite(battler: number): AnimSprite | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? _rt()?.gSprites?.[id] : undefined;
}

// 1:1 sAffineAnims_HitSplat (battle_anim_normal.c:134-167) — LES VRAIES
// courbes : variante 0 = hold 8f a l'echelle d'arrivee ; 1/2/3 = scale
// initial 0xD8/0xB0/0x80 puis hold 8f. (Le moteur AFFINE tick les deltas.)
registerAffineAnim('sAffineAnim_HitSplat_0', { frames: [{ xScale: 0, yScale: 0, rotation: 0, duration: 8 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_HitSplat_1', { frames: [{ xScale: 0xD8, yScale: 0xD8, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 0, duration: 8 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_HitSplat_2', { frames: [{ xScale: 0xB0, yScale: 0xB0, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 0, duration: 8 }], terminator: 'END' });
registerAffineAnim('sAffineAnim_HitSplat_3', { frames: [{ xScale: 0x80, yScale: 0x80, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 0, duration: 8 }], terminator: 'END' });
registerAffineAnimTable('sAffineAnims_HitSplat', { affineAnims: ['sAffineAnim_HitSplat_0', 'sAffineAnim_HitSplat_1', 'sAffineAnim_HitSplat_2', 'sAffineAnim_HitSplat_3'] });

/** 1:1 `AnimHitSplatBasic` (battle_anim_normal.c) — net-effect plateforme :
 *  args = [x, y, relativeTo, animation]. Position sur la cible (ou attaquant)
 *  + offsets, scale-in affine ~12 frames, destroy. */
function AnimHitSplatBasic(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0];
  const relativeTo = args[2];
  const battler = relativeTo === 0 ? (_itf().getAttacker?.() ?? 0) : (_itf().getTarget?.() ?? 1);
  const mon = _battlerSprite(battler);
  if (mon) {
    sprite.x = mon.x + (mon.x2 ?? 0) + args[0];
    sprite.y = mon.y + (mon.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  // 1:1 : StartSpriteAffineAnim(variante) sur LA VRAIE table (posee par
  // Cmd_createsprite via tpl.affineAnims) -> RunStoredCallbackWhenAffineAnimEnds.
  const spF = sprite as unknown as { affineAnimsTableName?: string | null; affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  if (spF.affineAnimsTableName) {
    spF.affineAnimNum = args[3] & 3;
    spF.affineAnimBeginning = true;
    spF.affineAnimEnded = false;
    sprite.callback = _HitSplat_WaitAffineEnd;
    return;
  }
  // fallback legacy (pas de table) : scale-in approxime.
  sprite.data[7] = 0;
  sprite.data[6] = args[3] & 3;
  if (sprite.spriteId !== undefined) {
    PrepareBattlerSpriteForRotScale(sprite.spriteId, 1 /* ST_OAM_OBJ_BLEND */);
  }
  sprite.callback = _HitSplat_Step;
}
function _HitSplat_WaitAffineEnd(sprite: AnimSprite): void {
  if ((sprite as { affineAnimEnded?: boolean }).affineAnimEnded) _itf().DestroyAnimSprite?.(sprite);
}
function _HitSplat_Step(sprite: AnimSprite): void {
  sprite.data[7]++;
  // 1:1-net sAffineAnims_HitSplat : scale-in rapide (0x80→0x100 sur ~8 frames)
  // puis hold ; variantes 1-3 = scales finaux réduits (impacts plus petits).
  const t = Math.min(sprite.data[7], 8);
  const final = 256 - (sprite.data[6] * 32);
  const scale = 128 + Math.floor(((final - 128) * t) / 8);
  if (sprite.spriteId !== undefined) {
    // inverse : SetSpriteRotScale attend le "scale param" (256=1:1 ; >256=plus petit)
    const param = Math.max(64, Math.floor((256 * 256) / scale));
    SetSpriteRotScale(sprite.spriteId, param, param, 0);
  }
  if (sprite.data[7] >= 13) {
    _itf().DestroyAnimSprite?.(sprite);
  }
}

/** 1:1 `AnimHitSplatHandleInvert` (battle_anim_normal.c:1038) : hit splats appariés
 *  dont la position Y est inversée quand l'adversaire frappe le joueur
 *  (Twineedle, Spike Cannon). args = [x, y, relativeTo, animation]. */
function AnimHitSplatHandleInvert(sprite: AnimSprite): void {
  // 1:1 c:1043-1044 : cmd->y = -cmd->y si l'attaquant n'est pas côté joueur
  // (hors contest — IsContest()=false, doctrine repo). gBattleAnimArgs = live
  // Int16Array → la mutation est relue par AnimHitSplatBasic (comme cmd/gBattleAnimArgs en C).
  const args = _itf().getArgs?.();
  if (args && ((_itf().getAttacker?.() ?? 0) & 1) !== 0) args[1] = -args[1];
  AnimHitSplatBasic(sprite);
}

// ─── Enregistrement registry ────────────────────────────────────────────────
registerAnimTemplates([
  { name: 'gBasicHitSplatSpriteTemplate', tileTag: ANIM_TAG_IMPACT, paletteTag: ANIM_TAG_IMPACT, oam: { shape: 0, size: 2 }, load: LoadAnimImpactGfx, callback: AnimHitSplatBasic as never, affineAnims: 'sAffineAnims_HitSplat' },
  // 1:1 : gHandleInvertHitSplatSpriteTemplate partage gfx mais callback dédié
  // AnimHitSplatHandleInvert (inverse Y quand l'adversaire frappe — Twineedle).
  { name: 'gHandleInvertHitSplatSpriteTemplate', tileTag: ANIM_TAG_IMPACT, paletteTag: ANIM_TAG_IMPACT, oam: { shape: 0, size: 2 }, load: LoadAnimImpactGfx, callback: AnimHitSplatHandleInvert as never, affineAnims: 'sAffineAnims_HitSplat' },
]);

// PHASE 1a : les callbacks portes, par NOM C (consommes par les 387 templates generes).
/** 1:1 `UnpackSelectedBattlePalettes` (battle_anim_mons.c:317) — single battle. */
function _UnpackSelectedBattlePalettes(selector: number): number {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as {
    getAttacker?: () => number; getTarget?: () => number;
  };
  let sel = 0;
  const atk = itf?.getAttacker?.() ?? 0;
  const tgt = itf?.getTarget?.() ?? 1;
  if (selector & 1) sel = 0xE; // F_PAL_BG : palettes BG 1,2,3
  if ((selector >> 1) & 1) sel |= 1 << (atk + 16);
  if ((selector >> 2) & 1) sel |= 1 << (tgt + 16);
  // 1:1 — bits 3/4 = partenaire attaquant/cible (BATTLE_PARTNER = ^2) s'il est
  // visible (aucun bit en single) ; anim pals (bits 5-6) : dette douce (BG anim).
  if (((selector >> 3) & 1) && _IsBattlerSpriteVisible(atk ^ 2)) sel |= 1 << ((atk ^ 2) + 16);
  if (((selector >> 4) & 1) && _IsBattlerSpriteVisible(tgt ^ 2)) sel |= 1 << ((tgt ^ 2) + 16);
  return sel >>> 0;
}

/** 1:1 `AnimSimplePaletteBlend`(+Step) (battle_anim_normal.c:298) : LE blend
 *  des scripts (sprite-controleur invisible — macro simple_palette_blend) :
 *  BeginNormalPaletteFade(masque) puis attend gPaletteFade.active=false. */
function AnimSimplePaletteBlend(sprite: { data: number[]; invisible?: boolean; callback: unknown }): void {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { getArgs?: () => number[]; DestroyAnimSprite?: (s: unknown) => void };
  const args = itf?.getArgs?.() ?? [1, 1, 0, 7, 0];
  const selected = _UnpackSelectedBattlePalettes(args[0] | 0);
  BeginNormalPaletteFade(selected, args[1] << 16 >> 16, args[2] | 0, args[3] | 0, args[4] & 0xFFFF);
  sprite.invisible = true;
  sprite.callback = _SimplePaletteBlend_Step;
}
function _SimplePaletteBlend_Step(sprite: { callback: unknown }): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gPaletteFade?: { active?: boolean } } | undefined;
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { DestroyAnimSprite?: (s: unknown) => void };
  if (!rt?.gPaletteFade?.active) itf?.DestroyAnimSprite?.(sprite);
}

// ═══ Vague 2 (2026-06-11) : ComplexPaletteBlend + hit splats restants + cross
// impact + AnimSpinningSparkle + AnimShakeMonOrBattlePlatforms. Sources :
// battle_anim_normal.c (sauf mention). Note shake : les types SHAKE_BG_X/Y
// écrivent gBattle_BG3_X/Y qui SONT câblés 1:1 (battle_main.ts:322, accesseurs
// live sur battleVBlankState → VBlankCB_Battle) — 6/10 usages réels des
// scripts (1×BG_X + 5×BG_Y) pleinement fonctionnels. SHAKE_MON_X/Y posent
// gSpriteCoordOffsetX/Y + coordOffsetEnabled 1:1 nominal, mais le moteur ne
// lit pas encore coordOffset au BuildOamBuffer (même dette tracée que
// field-effect-arrow.ts:524) → 4 usages MON_Y sans effet visuel pour l'instant.

// ── Helpers décomp partagés (locaux, préfixés _) ────────────────────────────

/** 1:1 `DestroyAnimSprite` (battle_anim.c) — via l'interpréteur (FreeSpriteOamMatrix
 *  + DestroySprite + gAnimVisualTaskCount-- côté runtime). */
function _DestroyAnimSprite(sprite: AnimSprite): void {
  _itf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `StartSpriteAffineAnim(sprite, n)` (sprite.c) : pose num + beginning,
 *  le moteur affine (sprite-engine-impl) tick et posera affineAnimEnded. */
function _StartSpriteAffineAnim(sprite: AnimSprite, n: number): void {
  const spF = sprite as unknown as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n;
  spF.affineAnimBeginning = true;
  spF.affineAnimEnded = false;
}

/** 1:1 `RunStoredCallbackWhenAffineAnimEnds` (battle_anim_mons.c:729).
 *  Garde-fou plateforme : si le sprite n'a PAS de table affine résolue
 *  (template généré sans affineAnims), affineAnimEnded ne viendrait jamais →
 *  on déclenche immédiatement (sinon sprite leak/soft-lock). */
function _RunStoredCallbackWhenAffineAnimEnds(sprite: AnimSprite): void {
  const spF = sprite as unknown as { affineAnimEnded?: boolean; affineAnimsTableName?: string | null };
  if (spF.affineAnimEnded || !spF.affineAnimsTableName) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735) — même garde-fou
 *  si le sprite n'a pas d'anims (animEnded ne viendrait jamais). */
function _RunStoredCallbackWhenAnimEnds(sprite: AnimSprite): void {
  const spA = sprite as unknown as { animEnded?: boolean; anims?: unknown };
  if (spA.animEnded || !spA.anims) SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : décrémente data[0] puis
 *  passe au callback stocké en data[6]. */
function _WaitAnimForDuration(sprite: AnimSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}

/** 1:1 `DestroyAnimSpriteAfterTimer` (battle_anim_flying.c:539) : data[0]-- ;
 *  à ≤ 0 → destroy (le runtime libère la matrice affine avec le sprite —
 *  net-effect identique au FreeOamMatrix + DestroySprite + count-- du C). */
function _DestroyAnimSpriteAfterTimer(sprite: AnimSprite): void {
  if (sprite.data[0]-- <= 0) {
    _DestroyAnimSprite(sprite);
  }
}

/** 1:1 `GetAnimBattlerSpriteId` (battle_anim_mons.c:373) : ANIM_ATTACKER(0)/
 *  ANIM_TARGET(1) → spriteId du mon si présent, sinon -1 (≙ SPRITE_NONE).
 *  ANIM_ATK_PARTNER(2)/ANIM_DEF_PARTNER(3) → sprite du PARTENAIRE (BATTLE_PARTNER
 *  = ^2) s'il est visible, sinon -1 (:401-414). */
function _GetAnimBattlerSpriteId(animBattler: number): number {
  const itf = _itf();
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const resolve = (b: number): number => {
    const id = co?.getBattlerMonSpriteId?.(b);
    return id !== undefined && id >= 0 ? id : -1;
  };
  if (animBattler === 0) return resolve(itf.getAttacker?.() ?? 0);
  if (animBattler === 1) return resolve(itf.getTarget?.() ?? 1);
  const base = animBattler === 2 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  return _IsBattlerSpriteVisible(base ^ 2) ? resolve(base ^ 2) : -1;
}

/** 1:1-net `IsBattlerSpriteVisible(battler)` (battle_anim.c:649) : sprite du
 *  battler présent (enregistré) et pas invisible. Single : le partenaire (2/3)
 *  n'a pas de sprite → false ; double : présent et visible → true. */
function _IsBattlerSpriteVisible(battler: number): boolean {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  if (id === undefined || id < 0) return false;
  const sp = _rt()?.gSprites?.[id] as { invisible?: boolean; inUse?: boolean } | undefined;
  return !!sp && sp.inUse !== false && !sp.invisible;
}

/** Lecture `gPaletteFade.active` (même mécanisme que _SimplePaletteBlend_Step). */
function _paletteFadeActive(): boolean {
  const rt = (globalThis as Record<string, unknown>).__rt as { gPaletteFade?: { active?: boolean } } | undefined;
  return !!rt?.gPaletteFade?.active;
}

// ── Callbacks portés ────────────────────────────────────────────────────────

/** 1:1 `AnimComplexPaletteBlend` (battle_anim_normal.c:344) : blend de palettes
 *  alterné — args = [selector, delay, numBlends, color1, blendY1, color2,
 *  blendY2]. Blend immédiat (blendY1/color1), sprite contrôleur invisible,
 *  puis alternance dans Step1. Data layout 1:1 : data[0]=sTimer, [1]=sDelay,
 *  [2]=sNumBlends, [3]=sColor1, [4]=sBlendY1, [5]=sColor2, [6]=sBlendY2,
 *  [7]=sPaletteSelector. */
function AnimComplexPaletteBlend(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [1, 1, 1, 0, 0, 0, 0];
  sprite.data[0] = args[1];
  sprite.data[1] = args[1];
  sprite.data[2] = args[2];
  sprite.data[3] = args[3];
  sprite.data[4] = args[4];
  sprite.data[5] = args[5];
  sprite.data[6] = args[6];
  sprite.data[7] = args[0];
  const selectedPalettes = _UnpackSelectedBattlePalettes(sprite.data[7]);
  BlendPalettes(selectedPalettes, args[4], args[3]);
  sprite.invisible = true;
  sprite.callback = AnimComplexPaletteBlend_Step1;
}

/** 1:1 `AnimComplexPaletteBlend_Step1` (battle_anim_normal.c:365) : timer puis
 *  alternance blendY2/color2 ↔ blendY1/color1 via le bit 0x100 de sDelay ;
 *  sNumBlends epuisé → Step2. */
function AnimComplexPaletteBlend_Step1(sprite: AnimSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    return;
  }
  if (_paletteFadeActive()) return;
  if (sprite.data[2] === 0) {
    sprite.callback = AnimComplexPaletteBlend_Step2;
    return;
  }
  const selectedPalettes = _UnpackSelectedBattlePalettes(sprite.data[7]);
  if (sprite.data[1] & 0x100) BlendPalettes(selectedPalettes, sprite.data[4], sprite.data[3]);
  else BlendPalettes(selectedPalettes, sprite.data[6], sprite.data[5]);
  sprite.data[1] ^= 0x100;
  sprite.data[0] = sprite.data[1] & 0xFF;
  sprite.data[2]--;
}

/** 1:1 `AnimComplexPaletteBlend_Step2` (battle_anim_normal.c:395) : attend la
 *  fin du fade, restaure (coeff 0) et destroy. */
function AnimComplexPaletteBlend_Step2(sprite: AnimSprite): void {
  if (!_paletteFadeActive()) {
    const selectedPalettes = _UnpackSelectedBattlePalettes(sprite.data[7]);
    BlendPalettes(selectedPalettes, 0, 0);
    _DestroyAnimSprite(sprite);
  }
}

/** 1:1 `AnimHitSplatPersistent` (battle_anim_normal.c:1021) : hit splat qui
 *  persiste data[0]=args[4] frames après la fin de l'anim affine —
 *  args = [x, y, relativeTo, animation, duration]. */
function AnimHitSplatPersistent(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0, 0];
  _StartSpriteAffineAnim(sprite, args[3]);
  if (args[2] === 0) InitSpritePosToAnimAttacker(sprite as never, true);
  else InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[4];
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteAfterTimer as never);
}

/** 1:1 `AnimHitSplatRandom` (battle_anim_normal.c:1049) : hit splat à position
 *  aléatoire autour du mon (±24 X / ±12 Y) — args = [relativeTo, animation] ;
 *  animation == -1 → Random2() & 3 (le C écrit gBattleAnimArgs[1] ; local ici,
 *  jamais relu derrière). */
function AnimHitSplatRandom(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [1, -1];
  let animation = (args[1] << 16) >> 16;
  if (animation === -1) animation = Random2() & 3;
  _StartSpriteAffineAnim(sprite, animation);
  if (args[0] === 0) InitSpritePosToAnimAttacker(sprite as never, false);
  else InitSpritePosToAnimTarget(sprite as never, false);
  sprite.x2 += (Random2() % 48) - 24;
  sprite.y2 += (Random2() % 24) - 12;
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

/** 1:1 `AnimHitSplatOnMonEdge` (battle_anim_normal.c:1069) : hit splat collé au
 *  sprite du mon (pos = x/y+x2/y2 du mon, offsets en x2/y2) —
 *  args = [relativeTo, x, y, animation]. data[0] = spriteId du mon (1:1). */
function AnimHitSplatOnMonEdge(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [1, 0, 0, 0];
  sprite.data[0] = _GetAnimBattlerSpriteId(args[0]);
  const mon = sprite.data[0] >= 0 ? _rt()?.gSprites?.[sprite.data[0]] : undefined;
  if (mon) {
    sprite.x = mon.x + (mon.x2 ?? 0);
    sprite.y = mon.y + (mon.y2 ?? 0);
  }
  sprite.x2 = args[1];
  sprite.y2 = args[2];
  _StartSpriteAffineAnim(sprite, args[3]);
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, DestroySpriteAndMatrix as never);
  sprite.callback = _RunStoredCallbackWhenAffineAnimEnds;
}

/** 1:1 `AnimCrossImpact` (battle_anim_normal.c:1083) : croix d'impact statique,
 *  attend data[0]=args[3] frames puis destroy — args = [x, y, relativeTo,
 *  duration]. */
function AnimCrossImpact(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 1, 8];
  if (args[2] === 0) InitSpritePosToAnimAttacker(sprite as never, true);
  else InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.data[0] = args[3];
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
  sprite.callback = _WaitAnimForDuration;
}

/** 1:1 `AnimFlashingHitSplat` (battle_anim_normal.c:1097) : hit splat
 *  clignotant — args = [x, y, relativeTo, animation]. */
function AnimFlashingHitSplat(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0];
  _StartSpriteAffineAnim(sprite, args[3]);
  if (args[2] === 0) InitSpritePosToAnimAttacker(sprite as never, true);
  else InitSpritePosToAnimTarget(sprite as never, true);
  sprite.invisible = false;
  sprite.callback = AnimFlashingHitSplat_Step;
}

/** 1:1 `AnimFlashingHitSplat_Step` (battle_anim_normal.c:1110) :
 *  invisible ^= 1 chaque frame ; data[0]++ > 12 → destroy. */
function AnimFlashingHitSplat_Step(sprite: AnimSprite): void {
  sprite.invisible = !sprite.invisible;
  if (sprite.data[0]++ > 12) _DestroyAnimSprite(sprite);
}

/** 1:1 `AnimSpinningSparkle` (battle_anim_mons.c:2380 — Detect/Disable) :
 *  étincelle posée sur l'attaquant (offset X miroir de côté : opponent → -x),
 *  joue son anim de frames puis destroy. NOTE placement : la vraie maison est
 *  battle_anim_mons.ts (couche helpers, hors périmètre d'édition de ce lot) —
 *  dette douce de rangement, à migrer avec battle_anim_mons. */
function AnimSpinningSparkle(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0];
  SetSpriteCoordsToAnimAttackerCoords(sprite);
  if (((_itf().getAttacker?.() ?? 0) & 1) !== 0) sprite.x -= args[0];
  else sprite.x += args[0];
  sprite.y += args[1];
  sprite.invisible = false;
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

// ── AnimShakeMonOrBattlePlatforms (battle_anim_normal.c:853-939) ────────────
// Le C stocke un POINTEUR u16* brut (gBattle_BG3_X/Y ou gSpriteCoordOffsetX/Y)
// splitté lo/hi dans data[6]/data[7] (via StoreSpriteCallbackInData6) puis le
// déréférence. Pointeur GBA non transposable en JS : la cible est résolue par
// sType (data[5]) — même bijection que le switch C — et accédée par NOM de
// global décomp (gBattle_BG3_X/Y = accesseurs live battle_main.ts:322 câblés
// au VBlank ; gSpriteCoordOffsetX/Y = posés ici, rendu = dette BuildOamBuffer).

/** 1:1 `SHAKE_BG_X/BG_Y/MON_X/MON_Y` (constants/battle_anim.h:443). */
const SHAKE_BG_X = 0;
const SHAKE_BG_Y = 1;
const SHAKE_MON_X = 2;
const SHAKE_MON_Y = 3;

/** Nom du global décomp ciblé par le shake (≙ le pointeur u16* du switch C). */
function _shakeTargetName(type: number): string {
  if (type === SHAKE_BG_X) return 'gBattle_BG3_X';
  if (type === SHAKE_BG_Y) return 'gBattle_BG3_Y';
  if (type === SHAKE_MON_X) return 'gSpriteCoordOffsetX';
  return 'gSpriteCoordOffsetY'; // default du switch C (SHAKE_MON_Y)
}

/** Lit la cible u16 (≙ `*(u16 *)(sShakePtrLo | sShakePtrHi << 16)`). */
function _shakeTargetGet(type: number): number {
  const v = (globalThis as Record<string, unknown>)[_shakeTargetName(type)];
  return ((v as number | undefined) ?? 0) & 0xFFFF;
}

/** Écrit la cible u16 — wrap u16 1:1 (le `+= velocity` négatif wrappe pareil). */
function _shakeTargetSet(type: number, value: number): void {
  (globalThis as Record<string, unknown>)[_shakeTargetName(type)] = value & 0xFFFF;
}

/** 1:1 `gBattlersCount` — lazy via __battleState (2 en single). */
function _battlersCount(): number {
  const bs = (globalThis as Record<string, unknown>).__battleState as { gBattlersCount?: number } | undefined;
  return bs?.gBattlersCount ?? 2;
}

/** Pose `Sprite.coordOffsetEnabled` (champ décomp 1:1 nominal ; inerte côté
 *  rendu tant que BuildOamBuffer n'ajoute pas gSpriteCoordOffsetX/Y — même
 *  dette tracée que field-effect-arrow.ts:524) sur le sprite du battler. */
function _setBattlerCoordOffsetEnabled(battler: number, enabled: boolean): void {
  const mon = _battlerSprite(battler);
  if (mon) (mon as unknown as { coordOffsetEnabled?: boolean }).coordOffsetEnabled = enabled;
}

/** 1:1 `AnimShakeMonOrBattlePlatforms_UpdateCoordOffsetEnabled`
 *  (battle_anim_normal.c:918) : relit les args (« Matches
 *  AnimShakeMonOrBattlePlatforms ») — args[4]=battlerSelector : 0=attaquant,
 *  1=cible, 2=les deux. Clear les deux puis set selon le sélecteur. */
function AnimShakeMonOrBattlePlatforms_UpdateCoordOffsetEnabled(): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0, 0];
  const attacker = _itf().getAttacker?.() ?? 0;
  const target = _itf().getTarget?.() ?? 1;
  _setBattlerCoordOffsetEnabled(attacker, false);
  _setBattlerCoordOffsetEnabled(target, false);
  if (args[4] === 2) {
    _setBattlerCoordOffsetEnabled(attacker, true);
    _setBattlerCoordOffsetEnabled(target, true);
  } else if (args[4] === 0) {
    _setBattlerCoordOffsetEnabled(attacker, true);
  } else {
    _setBattlerCoordOffsetEnabled(target, true);
  }
}

/** 1:1 `AnimShakeMonOrBattlePlatforms` (battle_anim_normal.c:853) : secoue les
 *  plateformes BG3 (SHAKE_BG_X/Y) ou les mons via coordOffset (SHAKE_MON_X/Y)
 *  — args = [velocity, shakeTimer, shakeDuration, type, battlerSelector].
 *  Data layout 1:1 : data[0]=sShakeVelocity(=-velocity), [1]=sShakeTimer,
 *  [2]=sShakeDuration(=shakeTimer), [3]=sTimer(=shakeDuration),
 *  [4]=sOriginalValue(=*ptr), [5]=sType. */
function AnimShakeMonOrBattlePlatforms(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0, 0];
  sprite.invisible = true;
  sprite.data[0] = -args[0];
  sprite.data[1] = args[1];
  sprite.data[2] = args[1];
  sprite.data[3] = args[2];
  sprite.data[4] = _shakeTargetGet(args[3]);
  sprite.data[5] = args[3];
  if (sprite.data[5] === SHAKE_MON_X || sprite.data[5] === SHAKE_MON_Y)
    AnimShakeMonOrBattlePlatforms_UpdateCoordOffsetEnabled();
  sprite.callback = AnimShakeMonOrBattlePlatforms_Step;
}

/** 1:1 `AnimShakeMonOrBattlePlatforms_Step` (battle_anim_normal.c:887) :
 *  pendant sTimer frames, toutes les sShakeDuration frames : cible +=
 *  sShakeVelocity puis inversion de la vélocité ; sTimer épuisé → restaure
 *  sOriginalValue, clear coordOffsetEnabled de tous les battlers (types MON)
 *  et destroy. */
function AnimShakeMonOrBattlePlatforms_Step(sprite: AnimSprite): void {
  if (sprite.data[3] > 0) {
    sprite.data[3]--;
    if (sprite.data[1] > 0) {
      sprite.data[1]--;
    } else {
      sprite.data[1] = sprite.data[2];
      _shakeTargetSet(sprite.data[5], _shakeTargetGet(sprite.data[5]) + sprite.data[0]);
      sprite.data[0] = -sprite.data[0];
    }
  } else {
    _shakeTargetSet(sprite.data[5], sprite.data[4]);
    if (sprite.data[5] === SHAKE_MON_X || sprite.data[5] === SHAKE_MON_Y) {
      for (let i = 0; i < _battlersCount(); i++)
        _setBattlerCoordOffsetEnabled(i, false);
    }
    _DestroyAnimSprite(sprite);
  }
}

// ─── AnimConfusionDuck (battle_anim_normal.c:258-297) — le canard de la
// confusion (status anim B_ANIM_STATUS_CONFUSION) : orbite Cos/Sin autour de
// la tête du mon, priorité OAM alternée (devant/derrière selon la phase).
function AnimConfusionDuck(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0, 0];
  sprite.x += args[0];
  sprite.y += args[1];
  sprite.data[0] = args[2];                 // waveOffset
  const attacker = _itf().getAttacker?.() ?? 0;
  if ((attacker & 1) !== 0) {               // GetBattlerSide != B_SIDE_PLAYER
    sprite.data[1] = -args[3];              // -wavePeriod
    sprite.data[4] = 1;
  } else {
    sprite.data[1] = args[3];
    sprite.data[4] = 0;
    _nStartSpriteAnim(sprite, 1);
  }
  sprite.data[3] = args[4];                 // duration
  sprite.callback = AnimConfusionDuck_Step as never;
  (sprite.callback as (s: AnimSprite) => void)(sprite);
}

/** 1:1 `AnimConfusionDuck_Step` (:282-297). */
function AnimConfusionDuck_Step(sprite: AnimSprite): void {
  sprite.x2 = _nCos(sprite.data[0], 30);
  sprite.y2 = _nSin(sprite.data[0], 10);
  // priority 1 (devant) sur la demi-orbite avant, 3 (derrière) sur l'arrière.
  const rt = (globalThis as Record<string, unknown>).__rt as { gba?: { oam?: Array<{ priority?: number }> } } | undefined;
  const oam = rt?.gba?.oam?.[(sprite as { oamIndex?: number }).oamIndex ?? -1];
  if (oam) oam.priority = ((sprite.data[0] & 0xFFFF) < 128) ? 1 : 3;
  sprite.data[0] = (sprite.data[0] + sprite.data[1]) & 0xFF;
  if (++sprite.data[2] === sprite.data[3]) _DestroyAnimSprite(sprite as never);
}

/** 1:1 `AnimCirclingSparkle` (battle_anim_normal.c:416-446) : étincelle en
 *  cercle croissant (TranslateSpriteInGrowingCircle, battle_anim_mons). */
function AnimCirclingSparkle(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0];
  sprite.x += args[0];
  sprite.y += args[1];
  sprite.data[0] = 0;
  sprite.data[1] = 10;
  sprite.data[2] = 8;
  sprite.data[3] = 40;
  sprite.data[4] = 112;
  sprite.data[5] = 0;
  StoreSpriteCallbackInData6(sprite as never, _nDestroySpriteAndMatrix as never);
  sprite.callback = _nTranslateGrowingCircle as never;
  (sprite.callback as (s: AnimSprite) => void)(sprite);
}
function _nTranslateGrowingCircle(sprite: AnimSprite): void {
  const m = (globalThis as Record<string, unknown>).__battleAnimMons as {
    TranslateSpriteInGrowingCircle?: (s: unknown) => void;
  } | undefined;
  m?.TranslateSpriteInGrowingCircle?.(sprite);
}
function _nDestroySpriteAndMatrix(sprite: AnimSprite): void {
  const m = (globalThis as Record<string, unknown>).__battleAnimMons as {
    DestroySpriteAndMatrix?: (s: unknown) => void;
  } | undefined;
  if (m?.DestroySpriteAndMatrix) m.DestroySpriteAndMatrix(sprite);
  else _DestroyAnimSprite(sprite as never);
}
function _nStartSpriteAnim(sprite: AnimSprite, animNum: number): void {
  const sa = (globalThis as Record<string, unknown>).__spriteAnimation as {
    StartSpriteAnim?: (s: unknown, n: number) => void;
  } | undefined;
  sa?.StartSpriteAnim?.(sprite, animNum);
}
function _nCos(idx: number, amp: number): number {
  const tr = (globalThis as Record<string, unknown>).__trig as { Cos?: (i: number, a: number) => number } | undefined;
  return tr?.Cos?.(idx, amp) ?? Math.floor(Math.cos((idx / 256) * 2 * Math.PI) * amp);
}
function _nSin(idx: number, amp: number): number {
  const tr = (globalThis as Record<string, unknown>).__trig as { Sin?: (i: number, a: number) => number } | undefined;
  return tr?.Sin?.(idx, amp) ?? Math.floor(Math.sin((idx / 256) * 2 * Math.PI) * amp);
}

registerAnimCallbacks({
  AnimConfusionDuck: AnimConfusionDuck as never,
  AnimCirclingSparkle: AnimCirclingSparkle as never,
  AnimHitSplatBasic: AnimHitSplatBasic as never,
  AnimHitSplatHandleInvert: AnimHitSplatHandleInvert as never,
  AnimSimplePaletteBlend: AnimSimplePaletteBlend as never,
  // Vague 2 :
  AnimComplexPaletteBlend: AnimComplexPaletteBlend as never,
  AnimHitSplatPersistent: AnimHitSplatPersistent as never,
  AnimHitSplatRandom: AnimHitSplatRandom as never,
  AnimHitSplatOnMonEdge: AnimHitSplatOnMonEdge as never,
  AnimCrossImpact: AnimCrossImpact as never,
  AnimFlashingHitSplat: AnimFlashingHitSplat as never,
  AnimSpinningSparkle: AnimSpinningSparkle as never,
  AnimShakeMonOrBattlePlatforms: AnimShakeMonOrBattlePlatforms as never,
});

// ─── VAGUE F3 : AnimTask_InvertScreenColor (battle_anim_normal.c.c:759, 18 hits sweep) ────
// Inverse les palettes sélectionnées (Thunder/Explosion flash négatif).
// args (flagsScenery, flagsAttacker, flagsTarget) — bit 8 = actif.
function _nItf3(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _nPf(): { get?: (i: number) => number; set?: (i: number, v: number) => void } | undefined {
  return ((globalThis as Record<string, unknown>).__rt as { gPlttBufferFaded?: never } | undefined)?.gPlttBufferFaded;
}
function _nBattlerPalSlot(b: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ oamIndex: number } | undefined>; gba?: { oam: Array<{ paletteBank: number }> } } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(b);
  const sp = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.[sid] : undefined;
  return sp ? (rt?.gba?.oam[sp.oamIndex]?.paletteBank ?? 0) : 0;
}
function AnimTask_InvertScreenColor(task: { taskId: number }): void {
  const itf = _nItf3();
  const a = itf.getArgs?.() ?? [];
  let selected = 0;
  // flagsScenery bit8 → GetBattlePalettesMask(TRUE,...) non-contest = 0xE (pals BG 1,2,3 ;
  // la palette BG 0 ne doit PAS être inversée — 1:1 battle_anim_mons.c:1410).
  if (a[0] & 0x100) selected |= 0x0E;
  if (a[1] & 0x100) selected |= (0x10000 << _nBattlerPalSlot(itf.getAttacker?.() ?? 0));
  if (a[2] & 0x100) selected |= (0x10000 << _nBattlerPalSlot(itf.getTarget?.() ?? 1));
  // InvertPlttBuffer (palette.c) : ~couleur sur chaque entrée
  const pf = _nPf();
  if (pf?.get && pf.set) {
    let palOffset = 0;
    let sel = selected >>> 0;
    while (sel !== 0) {
      if (sel & 1) {
        for (let i = 0; i < 16; i++) pf.set(palOffset + i, (~pf.get(palOffset + i)) & 0x7FFF);
      }
      sel >>>= 1;
      palOffset += 16;
    }
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _nRegT } from './engine/battle/battle-anim-registry';
/** 1:1 `AnimTask_ShakeBattlePlatforms` (battle_anim_normal.c.c:957, 9 hits) — secoue BG3
 *  (le terrain entier) en X/Y alterné. args (xOff, yOff, shakes, delay). */
function AnimTask_ShakeBattlePlatforms(task: { taskId: number; data: number[]; func?: unknown }): void {
  const a = _nItf3().getArgs?.() ?? [];
  const g = globalThis as Record<string, unknown>;
  task.data[0] = a[0]; // xOffset
  task.data[1] = a[1]; // yOffset
  task.data[2] = a[2]; // numShakes
  task.data[3] = a[3]; // timer
  task.data[4] = a[3]; // shakeDelay
  g.gBattle_BG3_X = a[0] & 0xFFFF;
  g.gBattle_BG3_Y = a[1] & 0xFFFF;
  task.func = _ShakePlatforms_Step;
  _ShakePlatforms_Step(task);
}
function _ShakePlatforms_Step(task: { taskId: number; data: number[] }): void {
  const g = globalThis as Record<string, unknown>;
  const s16 = (v: number): number => (v << 16) >> 16;
  if (task.data[3] === 0) {
    if (s16((g.gBattle_BG3_X as number) ?? 0) === task.data[0]) g.gBattle_BG3_X = (-task.data[0]) & 0xFFFF;
    else g.gBattle_BG3_X = task.data[0] & 0xFFFF;
    if (s16((g.gBattle_BG3_Y as number) ?? 0) === -task.data[1]) g.gBattle_BG3_Y = 0;
    else g.gBattle_BG3_Y = (-task.data[1]) & 0xFFFF;
    task.data[3] = task.data[4];
    if (--task.data[2] === 0) {
      g.gBattle_BG3_X = 0;
      g.gBattle_BG3_Y = 0;
      _nItf3().DestroyAnimVisualTask?.(task.taskId);
    }
  } else {
    task.data[3]--;
  }
}
/** 1:1 `AnimTask_FlashAnimTagWithColor` (battle_anim_normal.c.c, 3 hits) : alterne 2 blends
 *  (color1/Y1 ↔ color2/Y2) toutes les delay frames, numBlends fois.
 *  args (tag, delay, numBlends, color1, blendY1, color2, blendY2). */
function AnimTask_FlashAnimTagWithColor(task: { taskId: number; data: number[]; func?: unknown }): void {
  const a = _nItf3().getArgs?.() ?? [];
  task.data[0] = a[1];        // tTimer
  task.data[1] = a[1];        // tDelay (+ flag 0x100 alternance)
  task.data[2] = a[2];        // tNumBlends
  task.data[3] = a[3];        // tColor1
  task.data[4] = a[4];        // tBlendY1
  task.data[5] = a[5];        // tColor2
  task.data[6] = a[6];        // tBlendY2
  task.data[7] = a[0];        // tAnimTag
  _FlashTag_Apply(task.data[7], task.data[4], task.data[3]);
  task.func = _FlashTag_Step1;
}
function _FlashTag_Apply(tag: number, y: number, color: number): void {
  const sp = { IndexOfSpritePaletteTag: _spr_IndexOfSpritePaletteTag };
  const palIdx = sp?.IndexOfSpritePaletteTag?.(tag) ?? 0xFF;
  if (palIdx === 0xFF) return;
  const rt = (globalThis as Record<string, unknown>).__rt as { gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void } } | undefined;
  const pf = rt?.gPlttBufferFaded;
  if (!pf?.get || !pf.set) return;
  // BlendPalette(palOffset OBJ, 16, y, color) — via decomp-globals
  const dgb = (globalThis as Record<string, unknown>).__decompGlobals as { BlendPalette?: (o: number, n: number, c: number, col: number) => void } | undefined;
  dgb?.BlendPalette?.(256 + palIdx * 16, 16, y & 0xFF, color);
}
function _FlashTag_Step1(task: { taskId: number; data: number[]; func?: unknown }): void {
  if (task.data[0] > 0) { task.data[0]--; return; }
  if (task.data[2] === 0) {
    // restore : blend 0 (couleurs nettes) puis destroy
    _FlashTag_Apply(task.data[7], 0, 0);
    _nItf3().DestroyAnimVisualTask?.(task.taskId);
    return;
  }
  if (task.data[1] & 0x100) _FlashTag_Apply(task.data[7], task.data[4], task.data[3]);
  else _FlashTag_Apply(task.data[7], task.data[6], task.data[5]);
  task.data[1] ^= 0x100;
  task.data[0] = task.data[1] & 0xFF;
  task.data[2]--;
}
_nRegT({
  AnimTask_FlashAnimTagWithColor: AnimTask_FlashAnimTagWithColor as never,
  AnimTask_InvertScreenColor: AnimTask_InvertScreenColor as never,
  AnimTask_ShakeBattlePlatforms: AnimTask_ShakeBattlePlatforms as never,
});
