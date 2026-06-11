/**
 * battle_anim_ground.ts — miroir PARTIEL de `src/battle_anim_ground.c`
 * (décomp pokeemeraude) : SAND-ATTACK, vague C1b 2026-06-11.
 * gSandAttackDirtSpriteTemplate (:74, ANIM_TAG_MUD_SAND 10074, OAM 8x8) +
 * AnimDirtScatter 1:1 : projectile attaquant→cible avec dispersion
 * pseudo-aléatoire ±16 (Random2 décomp → LCG local déterministe, dette douce),
 * via la chaîne linéaire de battle_anim_mons.
 * GFX : mud_sand_0.png (frame 0) + mud_sand.pal (JASC) byte-exact.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag, getRuntime,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  StartAnimLinearTranslation, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  GetBattlerSpriteCoord, GetBattlerElevation, InitSpritePosToAnimTarget,
  InitAnimArcTranslation, TranslateAnimHorizontalArc,
  BATTLER_COORD_X, BATTLER_COORD_X_2, BATTLER_COORD_Y, BATTLER_COORD_Y_PIC_OFFSET,
} from './battle_anim_mons';
import { gBattlerPartyIndexes } from '../engine/battle/state';
import { gEnemyParty, GetMonData, MON_DATA_SPECIES } from '../engine/battle/party-storage';
import type { DecompSprite } from '../engine/system/decomp-runtime';

export const ANIM_TAG_MUD_SAND = 10074; // ANIM_SPRITES_START + 74

const sSheet = { data: 'gAnimGfx_MudSand', size: 0, tag: ANIM_TAG_MUD_SAND };
const sPal = { data: 'gAnimPal_MudSand', tag: ANIM_TAG_MUD_SAND };
export function LoadAnimMudSandGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_MUD_SAND) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}

function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _monSprite(battler: number): DecompSprite | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, DecompSprite> } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? rt?.gSprites?.get(id) : undefined;
}
let _dirtSeed = 0x1234;
function _rand2(): number { _dirtSeed = (_dirtSeed * 1103515245 + 24691) & 0xFFFF; return _dirtSeed; }

/** 1:1 `AnimDirtScatter` (battle_anim_ground.c) : départ attaquant (+args[0..1]
 *  implicite InitSpritePosToAnimAttacker), arrivée cible ±16 dispersé,
 *  durée args[2], chaîne linéaire → destroy. */
function AnimDirtScatter(sprite: DecompSprite): void {
  const args = _itf().getArgs?.() ?? [15, 15, 20, 0, 0];
  const atk = _itf().getAttacker?.() ?? 0;
  const tgt = _itf().getTarget?.() ?? 1;
  const monA = _monSprite(atk);
  if (monA) {
    sprite.x = monA.x + (monA.x2 ?? 0) + (((atk & 1) ? -1 : 1) * args[0]);
    sprite.y = monA.y + (monA.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  const monT = _monSprite(tgt);
  let xOff = _rand2() & 0x1F;
  let yOff = _rand2() & 0x1F;
  if (xOff > 16) xOff = 16 - xOff;
  if (yOff > 16) yOff = 16 - yOff;
  sprite.data[0] = args[2] || 20;
  sprite.data[2] = ((monT ? monT.x + (monT.x2 ?? 0) : 120) + xOff) & 0xFFFF;
  sprite.data[4] = ((monT ? monT.y + (monT.y2 ?? 0) : 80) + yOff) & 0xFFFF;
  StoreSpriteCallbackInData6(sprite, ((s: DecompSprite) => { _itf().DestroyAnimSprite?.(s); }) as never);
  StartAnimLinearTranslation(sprite);
}

registerAnimTemplates([
  { name: 'gSandAttackDirtSpriteTemplate', tileTag: ANIM_TAG_MUD_SAND, paletteTag: ANIM_TAG_MUD_SAND, oam: { shape: 0, size: 0 }, load: LoadAnimMudSandGfx, callback: AnimDirtScatter as never },
]);

registerAnimCallbacks({ AnimDirtScatter: AnimDirtScatter as never });

// ════════════════════════════════════════════════════════════════════════════
// VAGUE 2026-06-11 (suite) — Bonemerang/Bone Club, Mud Sport, Dirt Plume
// (Fissure/Dig) et monticule de Dig. Miroir 1:1 de battle_anim_ground.c
// :142-286 et :504-558. Les templates (gBonemerangSpriteTemplate,
// gSpinningBoneSpriteTemplate, gMudsportMudSpriteTemplate,
// gDirtPlumeSpriteTemplate, gDirtMoundSpriteTemplate) viennent du généré
// (BATTLE_ANIM_TEMPLATES) : enregistrer les callbacks par nom C suffit.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `GetBattlerYCoordWithElevation` (battle_anim_mons.c:342), transcrit
 *  localement (non exporté par battle_anim_mons.ts) : Y de base
 *  (BATTLER_COORD_Y) moins l'élévation côté ADVERSE (mons volants/flottants).
 *  IsContest()=false (post-camion) ; transformSpecies non modélisé (branche
 *  !transformSpecies, 1:1 quand Transform inactif) ; la lecture species côté
 *  joueur du C est morte (élévation soustraite seulement si side != PLAYER). */
function _GetBattlerYCoordWithElevation(battler: number): number {
  let y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y);
  if ((battler & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) {
    const species = GetMonData(gEnemyParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_SPECIES) as number;
    y -= GetBattlerElevation(battler, species);
  }
  return y;
}

/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551), transcrit localement
 *  (non exporté par battle_anim_mons.ts) : décompte data[0] frames puis
 *  restaure le callback stocké en data6. */
function _WaitAnimForDuration(sprite: DecompSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite);
}

/** 1:1 `AnimBonemerangProjectile` (battle_anim_ground.c:142) : l'os part du
 *  centre de l'attaquant en arc (amplitude -40) vers la cible, puis revient
 *  (boomerang, cf. _Step). */
function AnimBonemerangProjectile(sprite: DecompSprite): void {
  const atk = _itf().getAttacker?.() ?? 0;
  const tgt = _itf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.invisible = false;
  sprite.data[0] = 20;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
  sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[5] = -40;
  InitAnimArcTranslation(sprite);
  sprite.callback = AnimBonemerangProjectile_Step;
}

/** 1:1 `AnimBonemerangProjectile_Step` (battle_anim_ground.c:154) : arrivé sur
 *  la cible, fige la position (x+=x2) et relance un arc inverse (amplitude
 *  +40) vers l'attaquant. */
function AnimBonemerangProjectile_Step(sprite: DecompSprite): void {
  if (TranslateAnimHorizontalArc(sprite)) {
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    const atk = _itf().getAttacker?.() ?? 0;
    sprite.data[0] = 20;
    sprite.data[2] = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
    sprite.data[4] = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
    sprite.data[5] = 40;
    InitAnimArcTranslation(sprite);
    sprite.callback = AnimBonemerangProjectile_End;
  }
}

/** 1:1 `AnimBonemerangProjectile_End` (battle_anim_ground.c:171) : fin de
 *  l'arc retour → destroy. */
function AnimBonemerangProjectile_End(sprite: DecompSprite): void {
  if (TranslateAnimHorizontalArc(sprite)) _itf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimBoneHitProjectile` (battle_anim_ground.c:184) : os tournoyant
 *  (Bone Club) qui part juste à côté de la cible et la traverse en linéaire.
 *  args [xOff, yOff, tgtXOff (miroir de côté), tgtYOff, durée]. */
function AnimBoneHitProjectile(sprite: DecompSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0, 15];
  const atk = _itf().getAttacker?.() ?? 0;
  const tgt = _itf().getTarget?.() ?? 1;
  InitSpritePosToAnimTarget(sprite, true);
  sprite.invisible = false;
  let a2 = args[2] | 0;
  if ((atk & 1) !== 0 /* GetBattlerSide != B_SIDE_PLAYER */) a2 = -a2;
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = (GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) + a2) & 0xFFFF;
  sprite.data[4] = (GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + (args[3] | 0)) & 0xFFFF;
  StoreSpriteCallbackInData6(sprite, ((s: DecompSprite) => { _itf().DestroyAnimSprite?.(s); }) as never);
  // 1:1 : sprite->callback = StartAnimLinearTranslation (chaîne WithFollowup).
  StartAnimLinearTranslation(sprite);
}

/** 1:1 `AnimMudSportDirt` (battle_anim_ground.c:232) : particule de boue de
 *  Mud Sport. args [0=monte/1=retombe, x, y]. oam.tileNum++ (modèle PLAT :
 *  OAM réel = rt.gba.oam[oamIndex], le dummy anim table n'y touche pas). */
function AnimMudSportDirt(sprite: DecompSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0];
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex];
  if (oam) oam.tileId += 1;   // sprite->oam.tileNum++;
  sprite.invisible = false;
  if ((args[0] | 0) === 0) {
    const atk = _itf().getAttacker?.() ?? 0;
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2) + (args[1] | 0);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET) + (args[2] | 0);
    sprite.data[0] = (args[1] | 0) > 0 ? 1 : -1;
    sprite.callback = AnimMudSportDirtRising;
  } else {
    sprite.x = args[1] | 0;
    sprite.y = args[2] | 0;
    sprite.y2 = -(args[2] | 0);
    sprite.callback = AnimMudSportDirtFalling;
  }
}

/** 1:1 `AnimMudSportDirtRising` (battle_anim_ground.c:251) : monte de 4px/frame
 *  en dérivant en X (±1 toutes les 2 frames) ; destroy au-dessus de l'écran. */
function AnimMudSportDirtRising(sprite: DecompSprite): void {
  if (++sprite.data[1] > 1) {
    sprite.data[1] = 0;
    sprite.x += sprite.data[0];
  }
  sprite.y -= 4;
  if (sprite.y < -4) _itf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimMudSportDirtFalling` (battle_anim_ground.c:264) : retombe (y2 +4
 *  jusqu'à 0) puis clignote 10 bascules → destroy. */
function AnimMudSportDirtFalling(sprite: DecompSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.y2 += 4;
      if (sprite.y2 >= 0) {
        sprite.y2 = 0;
        sprite.data[0]++;
      }
      break;
    case 1:
      if (++sprite.data[1] > 0) {
        sprite.data[1] = 0;
        sprite.invisible = !sprite.invisible;   // sprite->invisible ^= 1;
        if (++sprite.data[2] === 10) _itf().DestroyAnimSprite?.(sprite);
      }
      break;
  }
}

/** 1:1 `AnimDirtPlumeParticle` (battle_anim_ground.c:504) : particule du
 *  panache de terre (Fissure/Dig). args [0=attaquant/1=cible, 0=gauche/
 *  1=droite (inverse xOffset ET args[2]), tgtXOff, tgtYOff, amplitude, durée].
 *  Départ pied du mon (Y élévation +30), arc → destroy. */
function AnimDirtPlumeParticle(sprite: DecompSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  const battler = (args[0] | 0) === 0 ? (_itf().getAttacker?.() ?? 0) : (_itf().getTarget?.() ?? 1);
  let xOffset = 24;
  let a2 = args[2] | 0;
  if ((args[1] | 0) === 1) {
    xOffset = -xOffset;   // xOffset *= -1;
    a2 = -a2;             // gBattleAnimArgs[2] *= -1;
  }
  sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) + xOffset;
  sprite.y = _GetBattlerYCoordWithElevation(battler) + 30;
  sprite.invisible = false;
  sprite.data[0] = args[5] | 0;
  sprite.data[2] = (sprite.x + a2) & 0xFFFF;
  sprite.data[4] = (sprite.y + (args[3] | 0)) & 0xFFFF;
  sprite.data[5] = args[4] | 0;
  InitAnimArcTranslation(sprite);
  sprite.callback = AnimDirtPlumeParticle_Step;
}

/** 1:1 `AnimDirtPlumeParticle_Step` (battle_anim_ground.c:531) : fin d'arc →
 *  destroy. */
function AnimDirtPlumeParticle_Step(sprite: DecompSprite): void {
  if (TranslateAnimHorizontalArc(sprite)) _itf().DestroyAnimSprite?.(sprite);
}

/** 1:1 `AnimDigDirtMound` (battle_anim_ground.c:543) : monticule de Dig,
 *  affiché pour args[2] frames. L'image 64x16 = 2 sprites 32x16 côte à côte :
 *  args[1] = moitié (0 gauche / 1 droite) → x +32 et oam.tileNum +8 (modèle
 *  PLAT : OAM réel = rt.gba.oam[oamIndex]). args [0=attaquant/1=cible,
 *  moitié, durée]. */
function AnimDigDirtMound(sprite: DecompSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0];
  const battler = (args[0] | 0) === 0 ? (_itf().getAttacker?.() ?? 0) : (_itf().getTarget?.() ?? 1);
  sprite.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X) - 16 + (args[1] | 0) * 32;
  sprite.y = _GetBattlerYCoordWithElevation(battler) + 32;
  sprite.invisible = false;
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex];
  if (oam) oam.tileId += (args[1] | 0) * 8;   // sprite->oam.tileNum += gBattleAnimArgs[1] * 8;
  StoreSpriteCallbackInData6(sprite, ((s: DecompSprite) => { _itf().DestroyAnimSprite?.(s); }) as never);
  sprite.data[0] = args[2] | 0;
  sprite.callback = _WaitAnimForDuration;
}

registerAnimCallbacks({
  AnimBonemerangProjectile: AnimBonemerangProjectile as never,
  AnimBoneHitProjectile: AnimBoneHitProjectile as never,
  AnimMudSportDirt: AnimMudSportDirt as never,
  AnimDirtPlumeParticle: AnimDirtPlumeParticle as never,
  AnimDigDirtMound: AnimDigDirtMound as never,
});
