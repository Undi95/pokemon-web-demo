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

const sSheet = { data: 'gAnimGfx_Scratch', size: 2560, tag: ANIM_TAG_SCRATCH };
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

registerAnimTemplates([
  { name: 'gScratchSpriteTemplate', tileTag: ANIM_TAG_SCRATCH, paletteTag: ANIM_TAG_SCRATCH, oam: { shape: 0, size: 2 }, load: LoadAnimScratchGfx, callback: AnimSpriteOnMonPos_Scratch as never },
]);
