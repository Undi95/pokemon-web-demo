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
  GetSpriteTileStartByTag,
} from '../engine/system/decomp-globals';
import { registerAnimTemplates } from '../engine/battle/battle-anim-registry';
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import { StartAnimLinearTranslation, StoreSpriteCallbackInData6 } from './battle_anim_mons';
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
