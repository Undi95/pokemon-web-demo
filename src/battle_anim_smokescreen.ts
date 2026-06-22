/**
 * battle_anim_smokescreen.ts — miroir de `src/battle_anim_smokescreen.c`
 * (décomp pokeemeraude), vague F50 (2026-06-12).
 *
 * SmokescreenImpact : le nuage d'impact 2x2 (4 sprites 16x16, anims flip
 * H/V, 3 frames de 4f chacune) + le sprite principal invisible qui compte
 * les nuages actifs et libère la sheet à la fin. Consommé par
 * AnimTask_SmokescreenImpact (Smokescreen) et le send-out ROM.
 *
 * Asset : smokescreen_impact.4bpp.bin / .gbapal (extraits byte-exact,
 * 16x48 = 12 tiles = 3 frames 16x16). Tag dédié TAG_SMOKESCREEN (55019).
 */
const TAG_SMOKESCREEN = 55019;

type _SmSprite = {
  x: number; y: number; data: number[]; callback: unknown; oamIndex: number;
  invisible?: boolean; animEnded?: boolean; hFlip?: boolean; vFlip?: boolean;
};
function _smRt(): {
  gSprites?: Array<_SmSprite | undefined>;
  CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
  DestroySprite?: (i: number) => void;
  gba?: { oam: Array<{ tileId: number; paletteBank?: number; hFlip?: boolean; vFlip?: boolean }> };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _smSpriteApi(): {
  GetSpriteTileStartByTag?: (t: number) => number;
  IndexOfSpritePaletteTag?: (t: number | string) => number;
  FreeSpriteTilesByTag?: (t: number) => void;
  FreeSpritePaletteByTag?: (t: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__sprite as never) ?? {};
}

let _smAssets: { tiles: Uint8Array; pal: Uint16Array } | null = null;
let _smFetching = false;
function _smEnsureAssets(): void {
  if (_smAssets || _smFetching) return;
  _smFetching = true;
  void Promise.all([
    fetch('/decomp/em/battle_anims/sprites/smokescreen_impact.4bpp.bin').then((r) => r.arrayBuffer()),
    fetch('/decomp/em/battle_anims/sprites/smokescreen_impact.gbapal').then((r) => r.arrayBuffer()),
  ]).then(([t, p]) => {
    _smAssets = { tiles: new Uint8Array(t), pal: new Uint16Array(p) };
    _smFetching = false;
  }).catch(() => { _smFetching = false; });
}
// préchargement au boot (module évalué avec le reste des anims)
_smEnsureAssets();

/** Charge la sheet+palette du tag (1:1 LoadCompressedSpriteSheetUsingHeap si absente). */
function _smLoadSheet(): number {
  const api = _smSpriteApi();
  let tileStart = api.GetSpriteTileStartByTag?.(TAG_SMOKESCREEN) ?? 0xFFFF;
  if (tileStart !== 0xFFFF) return tileStart;
  if (!_smAssets) { _smEnsureAssets(); return 0xFFFF; }
  const dg = (globalThis as Record<string, unknown>).__decompGlobals as {
    LoadCompressedSpriteSheetUsingHeap?: (s: unknown) => void;
    LoadCompressedSpritePaletteUsingHeap?: (s: unknown) => void;
  } | undefined;
  const cache = (globalThis as Record<string, unknown>).__assetCache as Map<string, unknown> | undefined;
  cache?.set('gAnimGfxTag_' + TAG_SMOKESCREEN, _smAssets.tiles);
  cache?.set('gAnimPalTag_' + TAG_SMOKESCREEN, _smAssets.pal);
  dg?.LoadCompressedSpriteSheetUsingHeap?.({ data: 'gAnimGfxTag_' + TAG_SMOKESCREEN, size: _smAssets.tiles.length, tag: TAG_SMOKESCREEN });
  dg?.LoadCompressedSpritePaletteUsingHeap?.({ data: 'gAnimPalTag_' + TAG_SMOKESCREEN, tag: TAG_SMOKESCREEN });
  tileStart = api.GetSpriteTileStartByTag?.(TAG_SMOKESCREEN) ?? 0xFFFF;
  return tileStart;
}

// 1:1 sAnims_SmokescreenImpact : 3 frames (tiles 0/4/8) de 4f, flips par anim.
const _SM_FRAMES: ReadonlyArray<number> = [0, 4, 8];
const _SM_FLIPS: ReadonlyArray<readonly [boolean, boolean]> = [
  [false, false], [true, false], [false, true], [true, true],
];

/** 1:1 `SmokescreenImpact(x, y, persist)` (battle_anim_smokescreen.c:165). */
export function SmokescreenImpact(x: number, y: number, persist: boolean): number {
  const rt = _smRt();
  const tileStart = _smLoadSheet();
  const palSlot = _smSpriteApi().IndexOfSpritePaletteTag?.(TAG_SMOKESCREEN) ?? 0xFF;

  // sprite principal invisible (compteur data[0], persist data[1])
  const mainId = CreateSprite({ oam: { shape: 0, size: 0, priority: 2 }, images: [] } as never, 0, 0, 0) ?? -1;
  const main = mainId >= 0 ? rt.gSprites?.[mainId] : undefined;
  if (main) {
    main.invisible = true;
    main.data[0] = 0;                    // sActiveSprites
    main.data[1] = persist ? 1 : 0;      // sPersist
    main.callback = _SmokescreenImpactMain as never;
  }
  const spawn = (sx: number, sy: number, animNum: number): void => {
    const sid = CreateSprite({ oam: { shape: 0, size: 1, priority: 2 }, images: [] } as never, sx, sy, 2) ?? -1;
    if (sid < 0) return;
    const sp = rt.gSprites?.[sid];
    const oam = sp ? rt.gba?.oam[sp.oamIndex] : undefined;
    if (oam && tileStart !== 0xFFFF) {
      oam.tileId = tileStart + _SM_FRAMES[0];
      if (palSlot !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = palSlot;
      const [hf, vf] = _SM_FLIPS[animNum];
      if (oam.hFlip !== undefined) oam.hFlip = hf;
      if (oam.vFlip !== undefined) oam.vFlip = vf;
    }
    if (sp) {
      sp.data[0] = mainId;       // sMainSpriteId
      sp.data[1] = 0;            // frame idx
      sp.data[2] = 0;            // frame timer
      sp.data[3] = tileStart;
      sp.callback = _SmokescreenImpactCloud as never;
      if (main) main.data[0]++;
    }
  };
  // 1:1 : TL anim0, TR anim1, BL anim2, BR anim3
  spawn(x - 16, y - 16, 0);
  spawn(x, y - 16, 1);
  spawn(x - 16, y, 2);
  spawn(x, y, 3);
  return mainId;
}
/** 1:1 SpriteCB_SmokescreenImpact : avance les 3 frames (4f) puis signale+meurt. */
function _SmokescreenImpactCloud(sprite: _SmSprite): void {
  if (++sprite.data[2] >= 4) {
    sprite.data[2] = 0;
    sprite.data[1]++;
    const rt = _smRt();
    if (sprite.data[1] >= _SM_FRAMES.length) {
      // animEnded 1:1
      const main = rt.gSprites?.[sprite.data[0]];
      if (main) main.data[0]--;
      for (let sid = 0; sid < MAX_SPRITES; sid++) {
        const sp = rt.gSprites?.[sid];
        if (sp === undefined) continue;
        if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
      }
      return;
    }
    const oam = rt.gba?.oam[sprite.oamIndex];
    if (oam && sprite.data[3] !== 0xFFFF) oam.tileId = sprite.data[3] + _SM_FRAMES[sprite.data[1]];
  }
}
/** 1:1 SpriteCB_SmokescreenImpactMain : à 0 actifs, libère la sheet + meurt. */
function _SmokescreenImpactMain(sprite: _SmSprite): void {
  if (sprite.data[0] === 0) {
    const api = _smSpriteApi();
    api.FreeSpriteTilesByTag?.(TAG_SMOKESCREEN);
    api.FreeSpritePaletteByTag?.(TAG_SMOKESCREEN);
    if (!sprite.data[1]) {
      const rt = _smRt();
      for (let sid = 0; sid < MAX_SPRITES; sid++) {
        const sp = rt.gSprites?.[sid];
        if (sp === undefined) continue;
        if (sp === (sprite as unknown)) { DestroySprite(getRuntime(), sid); break; }
      }
    } else {
      sprite.callback = (() => { /* SpriteCallbackDummy */ }) as never;
    }
  }
}

// ─── AnimTask_SmokescreenImpact (battle_anim_effects_3.c.c — placé ICI avec son moteur) ───
import { CreateSprite } from '../harness/runtime/decomp-bridge';
import { GetBattlerSpriteCoord, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET } from './battle_anim_mons';
import { DestroySprite } from './sprite';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { registerAnimTasks } from './engine/battle/battle-anim-registry';
import { MAX_SPRITES } from '../harness/runtime/decomp-runtime';

/** 1:1 `AnimTask_SmokescreenImpact` (battle_anim_effects_3.c.c) : impact +8/+8 sur la cible. */
function AnimTask_SmokescreenImpact(task: { taskId: number }): void {
  const itf = (globalThis as Record<string, unknown>).__battleAnimInterpreter as { getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } | undefined;
  const tgt = itf?.getTarget?.() ?? 1;
  SmokescreenImpact(
    GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) + 8,
    GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + 8,
    false,
  );
  itf?.DestroyAnimVisualTask?.(task.taskId);
}
registerAnimTasks({ AnimTask_SmokescreenImpact: AnimTask_SmokescreenImpact as never });
