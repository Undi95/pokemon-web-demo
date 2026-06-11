/**
 * battle_anim_dark.ts — miroir PARTIEL de `src/battle_anim_dark.c`
 * (décomp pokeemeraude) : BITE (les crocs), micro-vague 2026-06-11.
 * gFangSpriteTemplate (ANIM_TAG_SHARP_TEETH 10139, OAM 64x64) + AnimBite 1:1
 * (:?) : position cible + offsets, vélocités fixed-point >>8, ALLER
 * (halfDuration) puis RETOUR, destroy. La variante affine (rotation mâchoire)
 * = net-effect vFlip pour la mâchoire basse (animation>=4).
 * GFX : sharp_teeth.png 64x64 byte-exact.
 */
import {
  LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
  GetSpriteTileStartByTag,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import { registerAffineAnim, registerAffineAnimTable } from '../engine/decomp-impls/sprite-affine-extras';

export const ANIM_TAG_SHARP_TEETH = 10139; // ANIM_SPRITES_START + 139

const sSheet = { data: 'gAnimGfx_SharpTeeth', size: 2048, tag: ANIM_TAG_SHARP_TEETH };
const sPal = { data: 'gAnimPal_SharpTeeth', tag: ANIM_TAG_SHARP_TEETH };
export function LoadAnimSharpTeethGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_SHARP_TEETH) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheet);
    LoadCompressedSpritePaletteUsingHeap(sPal);
  }
}

// 1:1 gAffineAnims_Bite (battle_anim_dark.c:41-100) — LES VRAIES 8 rotations
// de la machoire (0/32/64/96/-128/-96/-64/-32, duree 1 = pose immediate).
for (let i = 0; i < 8; i++) {
  const rot = [0, 32, 64, 96, -128, -96, -64, -32][i];
  registerAffineAnim('sAffineAnim_Bite_' + i, { frames: [{ xScale: 0, yScale: 0, rotation: rot, duration: 1 }], terminator: 'END' });
}
registerAffineAnimTable('gAffineAnims_Bite', { affineAnims: [0, 1, 2, 3, 4, 5, 6, 7].map(i => 'sAffineAnim_Bite_' + i) });

type AnimSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; oamIndex?: number; spriteId?: number;
  vFlip?: boolean;
  callback: ((s: AnimSprite) => void) | null;
};
function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _monSprite(battler: number): AnimSprite | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, AnimSprite> } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? rt?.gSprites?.get(id) : undefined;
}

/** 1:1 `AnimBite` (battle_anim_dark.c) : args [x, y, animation, xVel, yVel,
 *  halfDuration]. Mâchoire : position CIBLE + offsets, anim 0 = haut /
 *  4 = bas (net vFlip), aller halfDuration frames puis retour, destroy. */
function AnimBite(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, -32, 0, 0, 819, 10];
  const tgt = _itf().getTarget?.() ?? 1;
  const mon = _monSprite(tgt);
  if (mon) {
    sprite.x = mon.x + (mon.x2 ?? 0) + args[0];
    sprite.y = mon.y + (mon.y2 ?? 0) + args[1];
  }
  sprite.invisible = false;
  // 1:1 : StartSpriteAffineAnim(args[2]) sur gAffineAnims_Bite (la table est
  // posee par Cmd_createsprite) — les 8 rotations exactes de la machoire.
  const spF = sprite as unknown as { affineAnimsTableName?: string | null; affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  if (spF.affineAnimsTableName) {
    spF.affineAnimNum = (args[2] | 0) & 7;
    spF.affineAnimBeginning = true;
    spF.affineAnimEnded = false;
  } else if ((args[2] | 0) >= 4) {
    sprite.vFlip = true; // fallback legacy
  }
  sprite.data[0] = args[3];
  sprite.data[1] = args[4];
  sprite.data[2] = args[5];
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = 0;
  sprite.callback = _Bite_Step1;
}
function _Bite_Step1(sprite: AnimSprite): void {
  sprite.data[4] += sprite.data[0];
  sprite.data[5] += sprite.data[1];
  sprite.x2 = (sprite.data[4] << 16 >> 16) >> 8;
  sprite.y2 = (sprite.data[5] << 16 >> 16) >> 8;
  if (++sprite.data[3] === sprite.data[2]) sprite.callback = _Bite_Step2;
}
function _Bite_Step2(sprite: AnimSprite): void {
  sprite.data[4] -= sprite.data[0];
  sprite.data[5] -= sprite.data[1];
  sprite.x2 = (sprite.data[4] << 16 >> 16) >> 8;
  sprite.y2 = (sprite.data[5] << 16 >> 16) >> 8;
  if (--sprite.data[3] === 0) _itf().DestroyAnimSprite?.(sprite);
}

registerAnimTemplates([
  { name: 'gFangSpriteTemplate', tileTag: ANIM_TAG_SHARP_TEETH, paletteTag: ANIM_TAG_SHARP_TEETH, oam: { shape: 0, size: 3 }, load: LoadAnimSharpTeethGfx, callback: AnimBite as never, affineAnims: 'gAffineAnims_Bite' },
  { name: 'gSharpTeethSpriteTemplate', tileTag: ANIM_TAG_SHARP_TEETH, paletteTag: ANIM_TAG_SHARP_TEETH, oam: { shape: 0, size: 3 }, load: LoadAnimSharpTeethGfx, callback: AnimBite as never, affineAnims: 'gAffineAnims_Bite' },
]);
