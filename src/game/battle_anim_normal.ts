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
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag, BlendPalettes,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { BeginNormalPaletteFade } from '../engine/system/decomp-bridge';
import { registerAffineAnim, registerAffineAnimTable } from '../engine/decomp-impls/sprite-affine-extras';
import {
  SetSpriteRotScale, PrepareBattlerSpriteForRotScale,
  InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget,
  SetSpriteCoordsToAnimAttackerCoords, StoreSpriteCallbackInData6,
  SetCallbackToStoredInData6, DestroySpriteAndMatrix,
} from './battle_anim_mons';
import { Random2 } from './random';

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

function _rt(): { gSprites?: Map<number, AnimSprite>; DestroySprite?: (id: number) => void } | undefined {
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
  return id !== undefined && id >= 0 ? _rt()?.gSprites?.get(id) : undefined;
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

// ─── Enregistrement registry ────────────────────────────────────────────────
registerAnimTemplates([
  { name: 'gBasicHitSplatSpriteTemplate', tileTag: ANIM_TAG_IMPACT, paletteTag: ANIM_TAG_IMPACT, oam: { shape: 0, size: 2 }, load: LoadAnimImpactGfx, callback: AnimHitSplatBasic as never, affineAnims: 'sAffineAnims_HitSplat' },
  // 1:1 : gHandleInvertHitSplatSpriteTemplate partage gfx+callback (l'invert X
  // est ignoré par AnimHitSplatBasic de base — dette douce).
  { name: 'gHandleInvertHitSplatSpriteTemplate', tileTag: ANIM_TAG_IMPACT, paletteTag: ANIM_TAG_IMPACT, oam: { shape: 0, size: 2 }, load: LoadAnimImpactGfx, callback: AnimHitSplatBasic as never, affineAnims: 'sAffineAnims_HitSplat' },
]);

// PHASE 1a : les callbacks portes, par NOM C (consommes par les 387 templates generes).
/** 1:1 `UnpackSelectedBattlePalettes` (battle_anim_mons.c:317) — single battle. */
function _UnpackSelectedBattlePalettes(selector: number): number {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as {
    getAttacker?: () => number; getTarget?: () => number;
  };
  let sel = 0;
  if (selector & 1) sel = 0xE; // F_PAL_BG : palettes BG 1,2,3
  if ((selector >> 1) & 1) sel |= 1 << ((itf?.getAttacker?.() ?? 0) + 16);
  if ((selector >> 2) & 1) sel |= 1 << ((itf?.getTarget?.() ?? 1) + 16);
  // partners (bits 3-4) : non exerces en single ; anim pals (bits 5-6) : dette douce.
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
// impact + AnimSpinningSparkle. Sources : battle_anim_normal.c (sauf mention).
// SKIP PROPRE : AnimShakeMonOrBattlePlatforms(+Step/+UpdateCoordOffsetEnabled)
// — dépend de gBattle_BG3_X/Y (BG scrolling, non câblé : __battle_bg3 = dette
// R3) ET de gSpriteCoordOffsetX/Y + Sprite.coordOffsetEnabled (non implémentés
// dans le pipeline sprites combat) ; en plus le C stocke un u16* brut splitté
// dans data[6]/data[7]. Un port serait un stub invisible. ═══════════════════

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
 *  Partners (2/3) : non exercés en single → -1 (dette douce double). */
function _GetAnimBattlerSpriteId(animBattler: number): number {
  const itf = _itf();
  let battler: number;
  if (animBattler === 0) battler = itf.getAttacker?.() ?? 0;
  else if (animBattler === 1) battler = itf.getTarget?.() ?? 1;
  else return -1;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? id : -1;
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
  const mon = sprite.data[0] >= 0 ? _rt()?.gSprites?.get(sprite.data[0]) : undefined;
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

registerAnimCallbacks({
  AnimHitSplatBasic: AnimHitSplatBasic as never,
  AnimHitSplatHandleInvert: AnimHitSplatBasic as never, // 1:1 : meme base, invert X = dette douce
  AnimSimplePaletteBlend: AnimSimplePaletteBlend as never,
  // Vague 2 :
  AnimComplexPaletteBlend: AnimComplexPaletteBlend as never,
  AnimHitSplatPersistent: AnimHitSplatPersistent as never,
  AnimHitSplatRandom: AnimHitSplatRandom as never,
  AnimHitSplatOnMonEdge: AnimHitSplatOnMonEdge as never,
  AnimCrossImpact: AnimCrossImpact as never,
  AnimFlashingHitSplat: AnimFlashingHitSplat as never,
  AnimSpinningSparkle: AnimSpinningSparkle as never,
});
