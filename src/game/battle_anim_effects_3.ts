/**
 * battle_anim_effects_3.ts — miroir PARTIEL de `src/battle_anim_effects_3.c`
 * (décomp pokeemeraude) : SCRATCH (les griffures), goal T4 2026-06-11.
 *
 * Porté 1:1 :
 *   - gScratchSpriteTemplate (:139) — ANIM_TAG_SCRATCH (10137), OAM 32x32
 *     ObjBlend, anims gScratchAnimCmds (5 frames de 4 ticks : tiles 0/16/32/
 *     48/64), callback AnimSpriteOnMonPos (battle_anim_mons.c — position sur
 *     attaquant/cible + offsets, joue l'anim, destroy à la fin).
 *
 * GFX : scratch.png (32x160 = 5 frames) extrait → scratch.4bpp.bin (2560B
 * byte-exact) + scratch.gbapal.
 *
 * Dettes : le reste du fichier .c (BlackSmoke/OdorSleuth/TeeterDance…) par
 * vagues avec les moves consommateurs.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';

export const ANIM_TAG_SCRATCH = 10137; // ANIM_SPRITES_START + 137

const sSheet = { data: 'gAnimGfx_Scratch', size: 2560, tag: ANIM_TAG_SCRATCH, targetTileBase: 720 };
const sPal = { data: 'gAnimPal_Scratch', tag: ANIM_TAG_SCRATCH };

export function LoadAnimScratchGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_SCRATCH) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}

type AnimSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; oamIndex?: number; spriteId?: number;
  callback: ((s: AnimSprite) => void) | null;
};

function _rt(): {
  gSprites?: Map<number, AnimSprite>;
  gba?: { oam?: Array<{ tileId?: number }> };
} | undefined {
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

// 1:1 gScratchAnimCmds : 5 frames (tiles 0/16/32/48/64), 4 ticks chacune.
const SCRATCH_FRAMES = [0, 16, 32, 48, 64];
const SCRATCH_TICKS = 4;

/** 1:1 `AnimSpriteOnMonPos` (battle_anim_mons.c) — net-effect : position sur
 *  attaquant/cible (+ offsets args[0..1], args[2]=target?, args[3]=ignorePicOffsets),
 *  joue l'anim de frames, destroy à la fin. */
function AnimSpriteOnMonPos_Scratch(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0, 0];
  const battler = !args[2] ? (_itf().getAttacker?.() ?? 0) : (_itf().getTarget?.() ?? 1);
  const mon = _battlerSprite(battler);
  if (mon) {
    sprite.x = mon.x + (mon.x2 ?? 0) + args[0];
    sprite.y = mon.y + (mon.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  sprite.data[7] = 0; // tick global
  sprite.callback = _Scratch_AnimStep;
  _applyFrame(sprite, 0);
}
function _applyFrame(sprite: AnimSprite, frame: number): void {
  const rt = _rt();
  const base = GetSpriteTileStartByTag(ANIM_TAG_SCRATCH);
  if (base === 0xFFFF || sprite.oamIndex === undefined) return;
  const oam = rt?.gba?.oam?.[sprite.oamIndex];
  if (oam) oam.tileId = base + SCRATCH_FRAMES[frame];
}
function _Scratch_AnimStep(sprite: AnimSprite): void {
  sprite.data[7]++;
  const frame = Math.floor(sprite.data[7] / SCRATCH_TICKS);
  if (frame >= SCRATCH_FRAMES.length) {
    _itf().DestroyAnimSprite?.(sprite);
    return;
  }
  _applyFrame(sprite, frame);
}

// --- GROWL : les lignes de bruit (gRoarNoiseLineSpriteTemplate, :949) -------
export const ANIM_TAG_NOISE_LINE = 10053; // ANIM_SPRITES_START + 53

const sSheetNoise = { data: 'gAnimGfx_NoiseLine', size: 2048, tag: ANIM_TAG_NOISE_LINE, targetTileBase: 800 };
const sPalNoise = { data: 'gAnimPal_NoiseLine', tag: ANIM_TAG_NOISE_LINE };
export function LoadAnimNoiseLineGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_NOISE_LINE) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheetNoise);
    LoadCompressedSpritePaletteUsingHeap(sPalNoise);
  }
}

/** 1:1 `AnimRoarNoiseLine` : args [xOff, yOff, variante 0/1/2].
 *  0 = diagonale haut, 1 = diagonale bas (vFlip), 2 = droite (frames 32/48).
 *  Vitesse 0x280 fixed-point, miroir cote adverse, destroy a 14 frames. */
function AnimRoarNoiseLine(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0];
  const atk = _itf().getAttacker?.() ?? 0;
  if ((atk & 1) === 1 /* B_SIDE_OPPONENT */) args[0] = -args[0];
  const mon = _battlerSprite(atk);
  if (mon) {
    sprite.x = mon.x + args[0];
    sprite.y = mon.y + args[1];
  }
  sprite.invisible = false;
  let frameBase = 0;
  if (args[2] === 0) {
    sprite.data[0] = 0x280;
    sprite.data[1] = -0x280;
  } else if (args[2] === 1) {
    _setFlip(sprite, undefined, true);
    sprite.data[0] = 0x280;
    sprite.data[1] = 0x280;
  } else {
    frameBase = 32; // StartSpriteAnim(sprite, 1) = frames 32/48
    sprite.data[0] = 0x280;
    sprite.data[1] = 0;
  }
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) {
    sprite.data[0] = -sprite.data[0];
    _setFlip(sprite, true, undefined);
  }
  sprite.data[4] = frameBase;
  _applyNoiseFrame(sprite, frameBase);
  sprite.data[5] = 0;
  sprite.data[6] = 0;
  sprite.data[7] = 0;
  sprite.callback = AnimRoarNoiseLine_Step;
}
function _applyNoiseFrame(sprite: AnimSprite, frameTile: number): void {
  const base = GetSpriteTileStartByTag(ANIM_TAG_NOISE_LINE);
  if (base === 0xFFFF || sprite.oamIndex === undefined) return;
  const oam = _rt()?.gba?.oam?.[sprite.oamIndex] as { tileId?: number } | undefined;
  if (oam) oam.tileId = base + frameTile;
}
function _setFlip(sprite: AnimSprite, h: boolean | undefined, v: boolean | undefined): void {
  const sp = sprite as { hFlip?: boolean; vFlip?: boolean };
  if (h !== undefined) sp.hFlip = h;
  if (v !== undefined) sp.vFlip = v;
}
function AnimRoarNoiseLine_Step(sprite: AnimSprite): void {
  sprite.data[6] += sprite.data[0];
  sprite.data[7] += sprite.data[1];
  sprite.x2 = (sprite.data[6] << 16 >> 16) >> 8;
  sprite.y2 = (sprite.data[7] << 16 >> 16) >> 8;
  // anim 2 frames (0/16 ou 32/48, 3 ticks) 1:1 gRoarNoiseLineAnimTable.
  const t = Math.floor((++sprite.data[5]) / 3) & 1;
  _applyNoiseFrame(sprite, sprite.data[4] + t * 16);
  if (sprite.data[5] === 14) {
    _itf().DestroyAnimSprite?.(sprite);
  }
}

registerAnimTemplates([
  { name: 'gScratchSpriteTemplate', tileTag: ANIM_TAG_SCRATCH, paletteTag: ANIM_TAG_SCRATCH, oam: { shape: 0, size: 2 }, load: LoadAnimScratchGfx, callback: AnimSpriteOnMonPos_Scratch as never },
  { name: 'gRoarNoiseLineSpriteTemplate', tileTag: ANIM_TAG_NOISE_LINE, paletteTag: ANIM_TAG_NOISE_LINE, oam: { shape: 0, size: 2 }, load: LoadAnimNoiseLineGfx, callback: AnimRoarNoiseLine as never },
]);
