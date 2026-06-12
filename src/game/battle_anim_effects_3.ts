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
import { registerAnimTemplates, registerAnimTasks, lookupAnimTemplate } from '../engine/battle/battle-anim-registry';
import { ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, SeekSpriteAnim } from '../engine/system/sprite-animation';
// ─── Imports vague « callbacks 1:1 » (section en fin de fichier) ────────────
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';
import {
  GetBattlerSpriteCoord,
  BATTLER_COORD_X, BATTLER_COORD_Y, BATTLER_COORD_X_2, BATTLER_COORD_Y_PIC_OFFSET,
  InitSpritePosToAnimAttacker, InitSpritePosToAnimTarget, SetSpriteCoordsToAnimAttackerCoords,
  InitAnimLinearTranslation, AnimTranslateLinear, InitAnimArcTranslation, TranslateAnimHorizontalArc,
  StartAnimLinearTranslation, StoreSpriteCallbackInData6, SetCallbackToStoredInData6,
  DestroySpriteAndMatrix, TrySetSpriteRotScale, PrepareBattlerSpriteForRotScale,
  SetSpriteRotScale, ResetSpriteRotScale, GetBattlerElevation,
} from './battle_anim_mons';
import { Sin, Cos, gSineTable } from './trig';
import { CreateSprite as _CreateSpriteFromTemplate } from '../engine/system/decomp-bridge';
import { gBattlerPartyIndexes, gBattleTypeFlags } from '../engine/battle/state';
import { BATTLE_TYPE_DOUBLE } from '../engine/battle/constants';
import { gPlayerParty, gEnemyParty, GetMonData, MON_DATA_SPECIES } from '../engine/battle/party-storage';
import { reverseDecompConstant } from '../engine/system/decomp-constants';
import { getMonFrontPicCoords, getMonBackPicCoords } from './data/mon_pic_coords';

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
function _itf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimSprite?: (s: unknown) => void; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _battlerSprite(battler: number): AnimSprite | undefined {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return id !== undefined && id >= 0 ? _rt()?.gSprites?.get(id) : undefined;
}

// 1:1 gScratchAnimCmds (battle_anim_effects_3.c) — LA VRAIE TABLE, tickée par
// AnimateSprite (sprite.c:901) via le moteur de tables (recadrage user).
export const gScratchAnimCmds = [
  ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(16, 4), ANIMCMD_FRAME(32, 4),
  ANIMCMD_FRAME(48, 4), ANIMCMD_FRAME(64, 4), ANIMCMD_END,
];
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
  // 1:1 : la table gScratchAnimCmds (posee par Cmd_createsprite) anime les
  // frames -> on attend animEnded -> destroy (= RunStoredCallbackWhenAnimEnds).
  if ((sprite as { anims?: unknown }).anims) {
    sprite.callback = _Scratch_WaitAnimEnd;
    return;
  }
  sprite.data[7] = 0; // fallback legacy : stepper local
  sprite.callback = _Scratch_AnimStep;
  _applyFrame(sprite, 0);
}
function _Scratch_WaitAnimEnd(sprite: AnimSprite): void {
  if ((sprite as { animEnded?: boolean }).animEnded) _itf().DestroyAnimSprite?.(sprite);
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

const sSheetNoise = { data: 'gAnimGfx_NoiseLine', size: 2048, tag: ANIM_TAG_NOISE_LINE };
const sPalNoise = { data: 'gAnimPal_NoiseLine', tag: ANIM_TAG_NOISE_LINE };
export function LoadAnimNoiseLineGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_NOISE_LINE) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheetNoise);
    LoadCompressedSpritePaletteUsingHeap(sPalNoise);
  }
}

// 1:1 gRoarNoiseLineAnimTable (battle_anim_effects_3.c:929-947) : 2 anims
// (frames 0/16 et 32/48, 3 ticks, JUMP 0 = loop infini — la duree de vie du
// sprite (14 frames) borne le loop, 1:1).
export const gRoarNoiseLineAnimCmds1 = [ANIMCMD_FRAME(0, 3), ANIMCMD_FRAME(16, 3), ANIMCMD_JUMP(0)];
export const gRoarNoiseLineAnimCmds2 = [ANIMCMD_FRAME(32, 3), ANIMCMD_FRAME(48, 3), ANIMCMD_JUMP(0)];

/** 1:1 `AnimRoarNoiseLine` : args [xOff, yOff, variante 0/1/2].
 *  0 = diagonale haut, 1 = diagonale bas (vFlip), 2 = droite (anim 1).
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
  const spA = sprite as unknown as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (args[2] === 0) {
    sprite.data[0] = 0x280;
    sprite.data[1] = -0x280;
  } else if (args[2] === 1) {
    _setFlip(sprite, undefined, true);
    sprite.data[0] = 0x280;
    sprite.data[1] = 0x280;
  } else {
    // 1:1 StartSpriteAnim(sprite, 1) : la 2e anim de la table (frames 32/48).
    if (spA.anims) { spA.animNum = 1; spA.animBeginning = true; spA.animEnded = false; }
    else frameBase = 32; // fallback legacy
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
  // 1:1 : la table gRoarNoiseLineAnimTable anime les frames (AnimateSprite) ;
  // fallback legacy si table absente.
  sprite.data[5]++;
  if (!(sprite as unknown as { anims?: unknown }).anims) {
    const t = Math.floor(sprite.data[5] / 3) & 1;
    _applyNoiseFrame(sprite, sprite.data[4] + t * 16);
  }
  if (sprite.data[5] === 14) {
    _itf().DestroyAnimSprite?.(sprite);
  }
}

// ─── HOWL : AnimTask_DeepInhale (net-effect squish 1:1 gDeepInhaleAffineAnimCmds)
// + le mon "inspire" : scale Y léger (squish vertical) ~20 frames puis restore.
type _IhTask = { taskId: number; data: number[]; func?: (t: _IhTask) => void };
function AnimTask_DeepInhale(task: _IhTask): void {
  const args = _itf().getArgs?.() ?? [0];
  const battler = args[0] === 0 ? (_itf().getAttacker?.() ?? 0) : (_itf().getTarget?.() ?? 1);
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  task.data[15] = co?.getBattlerMonSpriteId?.(battler) ?? -1;
  task.data[0] = 0;
  task.func = _DeepInhale_Step;
}
function _DeepInhale_Step(task: _IhTask): void {
  task.data[0]++;
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
    SetSpriteRotScale?: (id: number, x: number, y: number, r: number) => void;
    ResetSpriteRotScale?: (id: number) => void;
    PrepareBattlerSpriteForRotScale?: (id: number, mode: number) => void;
  } | undefined;
  const id = task.data[15];
  if (id < 0 || !mons?.SetSpriteRotScale) { _itf().DestroyAnimVisualTask?.(task.taskId); return; }
  if (task.data[0] === 1) mons.PrepareBattlerSpriteForRotScale?.(id, 0);
  const t = task.data[0];
  if (t <= 16) {
    // inspire : Y comprime (scale param >256 = plus petit), X gonfle léger.
    const squish = 256 + t * 4;
    mons.SetSpriteRotScale(id, 256 - t * 2, squish, 0);
  } else if (t <= 28) {
    const back = 28 - t;
    mons.SetSpriteRotScale(id, 256 - back * 2, 256 + back * 4 + (t === 28 ? 0 : 8), 0);
  } else {
    mons.ResetSpriteRotScale?.(id);
    _itf().DestroyAnimVisualTask?.(task.taskId);
  }
}
registerAnimTasks({ AnimTask_DeepInhale: AnimTask_DeepInhale as never });

// ─── LEER (gLeerSpriteTemplate — vit dans battle_anim_effects_2.c décomp ;
// posé ICI provisoirement, note placement) : le "regard" s'affiche au-dessus
// de l'attaquant ~50 frames puis destroy (net-effect AnimLeerSprite).
export const ANIM_TAG_LEER = 10027; // ANIM_SPRITES_START + 27
const sSheetLeer = { data: 'gAnimGfx_Leer', size: 0, tag: ANIM_TAG_LEER };
const sPalLeer = { data: 'gAnimPal_Leer', tag: ANIM_TAG_LEER };
export function LoadAnimLeerGfx(): void {
  if (GetSpriteTileStartByTag(ANIM_TAG_LEER) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(sSheetLeer);
    LoadCompressedSpritePaletteUsingHeap(sPalLeer);
  }
}
function AnimLeerSprite(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [24, -12];
  const atk = _itf().getAttacker?.() ?? 0;
  if ((atk & 1) === 1) args[0] = -args[0];
  const mon = _battlerSprite(atk);
  if (mon) {
    sprite.x = mon.x + args[0];
    sprite.y = mon.y + args[1];
  }
  sprite.invisible = false;
  sprite.data[7] = 0;
  sprite.callback = _Leer_Step;
}
function _Leer_Step(sprite: AnimSprite): void {
  if (++sprite.data[7] >= 50) _itf().DestroyAnimSprite?.(sprite);
}

registerAnimTemplates([
  { name: 'gScratchSpriteTemplate', tileTag: ANIM_TAG_SCRATCH, paletteTag: ANIM_TAG_SCRATCH, oam: { shape: 0, size: 2 }, load: LoadAnimScratchGfx, callback: AnimSpriteOnMonPos_Scratch as never, anims: [gScratchAnimCmds] },
  { name: 'gRoarNoiseLineSpriteTemplate', tileTag: ANIM_TAG_NOISE_LINE, paletteTag: ANIM_TAG_NOISE_LINE, oam: { shape: 0, size: 2 }, load: LoadAnimNoiseLineGfx, callback: AnimRoarNoiseLine as never, anims: [gRoarNoiseLineAnimCmds1, gRoarNoiseLineAnimCmds2] },
  { name: 'gLeerSpriteTemplate', tileTag: ANIM_TAG_LEER, paletteTag: ANIM_TAG_LEER, oam: { shape: 0, size: 2 }, load: LoadAnimLeerGfx, callback: AnimLeerSprite as never },
]);

// ════════════════════════════════════════════════════════════════════════════
// VAGUE « callbacks 1:1 » (goal 2026-06-11) — 31 callbacks transcrits depuis :
//   - battle_anim_effects_3.c (le gros du lot : BlackSmoke, WhiteHalo, TealAlert,
//     MeanLookEye, Spikes, ClappingHand(+2), RapidSpin, TriAttackTriangle,
//     BatonPassPokeball, WishStar(+MiniTwinklingStar), SweetScentPetal,
//     PainSplitProjectile, FlatterConfetti, FlatterSpotlight, YawnCloud,
//     AssistPawprint, SmellingSaltsHand, SmellingSaltExclamation,
//     HelpingHandClap, ForesightMagnifyingGlass, MeteorMashStar, BlockX,
//     KnockOffStrike, Recycle)
//   - battle_anim_effects_2.c (AnimViceGripPincer, AnimGuillotinePincer,
//     AnimPencil) — DETTE placement : à déplacer dans battle_anim_effects_2.ts
//     quand ce miroir-là sera créé (ordre de lot, pattern battle_anim_ghost).
//   - battle_anim_dark.c (AnimTearDrop) / battle_anim_rock.c (AnimRaiseSprite) /
//     battle_anim_psychic.c (AnimRedX) — même dette placement.
// Pattern repo : accès LAZY interpréteur/runtime via __battleAnimInterpreter/__rt
// (AUCUN import statique de l'interpréteur = anti-cycle ESM).
// ════════════════════════════════════════════════════════════════════════════

type _VSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number;
  invisible?: boolean; subpriority?: number; spriteId?: number; oamIndex?: number;
  hFlip?: boolean; vFlip?: boolean;
  animEnded?: boolean; affineAnimEnded?: boolean;
  callback: unknown;
};
function _vItf(): {
  getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number;
  DestroyAnimSprite?: (s: unknown) => void; DestroyAnimVisualTask?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _grt(): {
  gSprites?: Map<number, _VSprite & { objMode?: number }>;
  gba?: { oam?: Array<{ tileId?: number; priority?: number }> };
  SetGpuReg?: (off: number, v: number) => void;
  GetGpuReg?: (off: number) => number;
  DestroySprite?: (id: number) => void;
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
/** `DestroyAnimSprite` stockable en callback (C : StoreSpriteCallbackInData6(sprite, DestroyAnimSprite)). */
function _DestroyAnimSprite(sprite: unknown): void { _vItf().DestroyAnimSprite?.(sprite); }
/** Réinterprète les 16 bits bas en s16 signé (= cast (s16) décomp). */
function _toS16(v: number): number { return (v << 16) >> 16; }
/** 1:1 GetBattlerSide(b) — 0 = B_SIDE_PLAYER, 1 = B_SIDE_OPPONENT. */
function _side(b: number): number { return b & 1; }
/** 1:1 `StartSpriteAnim` (sprite.c:1351) — pattern repo (tables posées par le template). */
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}
/** 1:1 `StartSpriteAffineAnim` (sprite.c:1373) — pattern repo.
 *  Sert aussi pour `ChangeSpriteAffineAnim` (sprite.c:1388, même surface plate :
 *  animNum + beginning + ended ; la nuance reset-loop-counter C est interne au
 *  moteur affine). */
function _StartSpriteAffineAnim(sprite: unknown, n: number): void {
  const spF = sprite as { affineAnimNum?: number; affineAnimBeginning?: boolean; affineAnimEnded?: boolean };
  spF.affineAnimNum = n; spF.affineAnimBeginning = true; spF.affineAnimEnded = false;
}
/** 1:1 `WaitAnimForDuration` (battle_anim_mons.c:551) : data[0] frames puis cb stocké. */
function _WaitAnimForDuration(sprite: _VSprite): void {
  if (sprite.data[0] > 0) sprite.data[0]--;
  else SetCallbackToStoredInData6(sprite as never);
}
/** 1:1 BIOS `ArcTan2` + `ArcTan2Neg` (battle_anim_mons.c:1368) — même formule que
 *  battle_anim_effects_1b.ts. */
function _ArcTan2Neg(x: number, y: number): number {
  const a = ((Math.atan2(y, x) / (2 * Math.PI)) * 65536) | 0;
  return (-a) & 0xFFFF;
}
// Random2 décomp → LCG local déterministe (pattern battle_anim_water/fight — dette douce).
let _e3Lcg = 0x51f3;
function _rand2(): number { _e3Lcg = (_e3Lcg * 1103515245 + 24691) & 0xFFFFFFFF; return (_e3Lcg >>> 16) & 0xFFFF; }
/** 1:1 `PlaySE12WithPanning`/`PlaySE1WithPanning` — route vers le SE runtime
 *  (pattern battle_anim_effects_1b) ; le pan est ignoré par le wrapper runtime. */
function _PlaySE12WithPanning(songId: number, _pan: number): void {
  (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(songId);
}
const SE_M_LEER = 192;     // include/constants/songs.h:199
const SE_M_SKETCH = 205;   // include/constants/songs.h:212
const SE_M_ENCORE = 222;   // include/constants/songs.h:229
const SOUND_PAN_ATTACKER = -64;  // include/battle_anim.h
const SOUND_PAN_TARGET = 63;
const DISPLAY_WIDTH = 240;
// ─── GPU regs (io_reg.h) — pattern battle_anim_ghost (rt.SetGpuReg lazy) ────
const REG_OFFSET_DISPCNT = 0x00;
const REG_OFFSET_WIN0H = 0x40;
const REG_OFFSET_WIN0V = 0x44;
const REG_OFFSET_WINOUT = 0x4A;
const REG_OFFSET_BLDCNT = 0x50;
const REG_OFFSET_BLDALPHA = 0x52;
const BLDCNT_BLEND_TGT2ALL = 0x3F40; // BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND
const DISPCNT_OBJWIN_ON = 0x8000;
// WINOUT_WIN01_BG_ALL|WIN01_OBJ|WIN01_CLR|WINOBJ_BG_ALL|WINOBJ_OBJ [|WINOBJ_CLR]
const WINOUT_FLATTER_ON = 0x1F3F;
const WINOUT_FLATTER_OFF = 0x3F3F;
function _BLDALPHA_BLEND(eva: number, evb: number): number { return (eva & 0xFFFF) | ((evb & 0xFFFF) << 8); }
/** gBattle_WIN0H/V décomp = accesseurs globalThis → battleVBlankState (battle_main.ts:323) ;
 *  VBlankCB_Battle ré-applique chaque frame → écrire le MIROIR, pas que le reg. */
function _setBattleWinReg(name: 'gBattle_WIN0H' | 'gBattle_WIN0V', v: number): void {
  (globalThis as Record<string, unknown>)[name] = v;
}
/** Entrée OAM réelle du sprite (rt.gba.oam[oamIndex]) — pour tileNum/priority
 *  (champs NON synchronisés depuis le sprite plat). */
function _oamOf(sprite: _VSprite): { tileId?: number; priority?: number } | undefined {
  return sprite.oamIndex !== undefined ? _grt().gba?.oam?.[sprite.oamIndex] : undefined;
}
/** 1:1 `sprite->oam.tileNum += n` (sheet déjà résolue → bump le tileId OAM). */
function _oamTileBump(sprite: _VSprite, delta: number): void {
  const oam = _oamOf(sprite);
  if (oam && typeof oam.tileId === 'number') oam.tileId += delta;
}
/** Sprite id d'un battler (surface __battleControllerOpponent — pattern repo). */
function _battlerSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return (id === undefined || id === null || id < 0) ? 0xFF : id;
}
/** 1:1 `GetAnimBattlerSpriteId(animBattler)` (battle_anim_mons.c:373) —
 *  ANIM_ATTACKER=0 / ANIM_TARGET=1 (partners doubles = dette douce). */
function _GetAnimBattlerSpriteId(animBattler: number): number {
  if (animBattler === 0) return _battlerSpriteId(_vItf().getAttacker?.() ?? 0);
  if (animBattler === 1) return _battlerSpriteId(_vItf().getTarget?.() ?? 1);
  return 0xFF;
}
// 1:1 battle_util.c — IsDoubleBattle() = gBattleTypeFlags & BATTLE_TYPE_DOUBLE.
function _IsDoubleBattle(): boolean { return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0; }
/** 1:1 `SetAverageBattlerPositions` (battle_anim_mons.c:2289) : moyenne battler+
 *  partenaire (doubles), sinon battler seul. Out-params C (&x,&y) → retour {x,y}. */
function _SetAverageBattlerPositions(battler: number, respectMonPicOffsets: boolean): { x: number; y: number } {
  const xCoordType = !respectMonPicOffsets ? BATTLER_COORD_X : BATTLER_COORD_X_2;
  const yCoordType = !respectMonPicOffsets ? BATTLER_COORD_Y : BATTLER_COORD_Y_PIC_OFFSET;
  const battlerX = GetBattlerSpriteCoord(battler, xCoordType);
  const battlerY = GetBattlerSpriteCoord(battler, yCoordType);
  let partnerX: number, partnerY: number;
  if (_IsDoubleBattle()) {
    partnerX = GetBattlerSpriteCoord(battler ^ 2 /* BATTLE_PARTNER */, xCoordType);
    partnerY = GetBattlerSpriteCoord(battler ^ 2, yCoordType);
  } else {
    partnerX = battlerX;
    partnerY = battlerY;
  }
  return { x: ((battlerX + partnerX) / 2) | 0, y: ((battlerY + partnerY) / 2) | 0 };
}
/** 1:1 `GetBattlerSpriteSubpriority` (battle_anim_mons.c:2035) — IsContest()=false ;
 *  position = battler (singles 1:1 ; doubles = dette douce). */
function _GetBattlerSpriteSubpriority(battler: number): number {
  const position = battler; // GetBattlerPosition — singles : position == battler
  if (position === 0) return 30;       // B_POSITION_PLAYER_LEFT
  else if (position === 2) return 20;  // B_POSITION_PLAYER_RIGHT
  else if (position === 1) return 40;  // B_POSITION_OPPONENT_LEFT
  else return 50;                      // B_POSITION_OPPONENT_RIGHT
}
/** 1:1 `GetBattlerSpriteBGPriority` (battle_anim_mons.c:2063) — IsContest()=false ;
 *  GetAnimBgAttribute(2/1, BG_ANIM_PRIORITY) → 2/1 (valeurs vanilla combat,
 *  pattern battle_anim_ice). position = battler (singles). */
function _GetBattlerSpriteBGPriority(battler: number): number {
  const position = battler;
  if (position === 0 || position === 3) return 2; // PLAYER_LEFT / OPPONENT_RIGHT
  else return 1;
}
// species du battler (même dette douce que battle_anim_effects_1b :
// transformSpecies/illusion non modélisés).
function _battlerSpeciesName(battler: number): string {
  const party = _side(battler) !== 0 ? gEnemyParty : gPlayerParty;
  const species = GetMonData(party[gBattlerPartyIndexes[battler]] as never, MON_DATA_SPECIES) as number;
  return reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
}
// 1:1 battle_anim_mons.c:2151 `GetBattlerSpriteCoordAttr` — cases utilisées ici
// (HEIGHT/WIDTH/TOP/BOTTOM/LEFT/RIGHT). coords = back pic (joueur) / front pic
// (adverse). Dette douce : transformSpecies/Unown/Castform non modélisés.
const BATTLER_COORD_ATTR_HEIGHT = 0;
const BATTLER_COORD_ATTR_TOP = 2;
const BATTLER_COORD_ATTR_BOTTOM = 3;
const BATTLER_COORD_ATTR_RIGHT = 4;
const BATTLER_COORD_ATTR_LEFT = 5;
function _GetBattlerSpriteCoordAttr(battler: number, attr: number): number {
  const name = _battlerSpeciesName(battler);
  const coords = _side(battler) === 0 ? getMonBackPicCoords(name) : getMonFrontPicCoords(name);
  const w = coords.w, h = coords.h;
  switch (attr) {
    case BATTLER_COORD_ATTR_HEIGHT: return h;
    case 1 /* BATTLER_COORD_ATTR_WIDTH */: return w;
    case BATTLER_COORD_ATTR_TOP:
      return GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET) - ((h / 2) | 0);
    case BATTLER_COORD_ATTR_BOTTOM:
      return GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET) + ((h / 2) | 0);
    case BATTLER_COORD_ATTR_LEFT:
      return GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) - ((w / 2) | 0);
    case BATTLER_COORD_ATTR_RIGHT:
      return GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2) + ((w / 2) | 0);
    default: return 0;
  }
}
/** 1:1 `GetBattlerYCoordWithElevation` (battle_anim_mons.c:342) — pattern
 *  battle_anim_ground : élévation soustraite côté adverse uniquement. */
function _GetBattlerYCoordWithElevation(battler: number): number {
  let y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y);
  if (_side(battler) !== 0) {
    const species = GetMonData(gEnemyParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_SPECIES) as number;
    y -= GetBattlerElevation(battler, species);
  }
  return y;
}
/** 1:1 `InitAnimFastLinearTranslation` (battle_anim_mons.c:1171) : deltas
 *  fixed-point x16 (u16, bit 0 = signe) — transcription battle_anim_ice. */
function _InitAnimFastLinearTranslation(sprite: _VSprite): void {
  const xDiff = _toS16(sprite.data[2]) - _toS16(sprite.data[1]);
  const yDiff = _toS16(sprite.data[4]) - _toS16(sprite.data[3]);
  const xSign = xDiff < 0;
  const ySign = yDiff < 0;
  let x2 = (Math.abs(xDiff) << 4) & 0xFFFF;
  let y2 = (Math.abs(yDiff) << 4) & 0xFFFF;
  x2 = (x2 / _toS16(sprite.data[0])) | 0;
  y2 = (y2 / _toS16(sprite.data[0])) | 0;
  if (xSign) x2 |= 1; else x2 &= ~1;
  if (ySign) y2 |= 1; else y2 &= ~1;
  sprite.data[1] = x2 & 0xFFFF;
  sprite.data[2] = y2 & 0xFFFF;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
}
/** 1:1 `AnimFastTranslateLinear` (battle_anim_mons.c:1208). */
function _AnimFastTranslateLinear(sprite: _VSprite): boolean {
  if (!sprite.data[0]) return true;
  const v1 = sprite.data[1] & 0xFFFF;
  const v2 = sprite.data[2] & 0xFFFF;
  let x = sprite.data[3] & 0xFFFF;
  let y = sprite.data[4] & 0xFFFF;
  x = (x + v1) & 0xFFFF;
  y = (y + v2) & 0xFFFF;
  if (v1 & 1) sprite.x2 = -(x >> 4); else sprite.x2 = x >> 4;
  if (v2 & 1) sprite.y2 = -(y >> 4); else sprite.y2 = y >> 4;
  sprite.data[3] = x;
  sprite.data[4] = y;
  sprite.data[0]--;
  return false;
}
/** 1:1 `AnimFastTranslateLinearWaitEnd` (battle_anim_mons.c:1238). */
function _AnimFastTranslateLinearWaitEnd(sprite: _VSprite): void {
  if (_AnimFastTranslateLinear(sprite)) SetCallbackToStoredInData6(sprite as never);
}
/** 1:1 `InitAndRunAnimFastLinearTranslation` (battle_anim_mons.c:1199). */
function _InitAndRunAnimFastLinearTranslation(sprite: _VSprite): void {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  _InitAnimFastLinearTranslation(sprite);
  sprite.callback = _AnimFastTranslateLinearWaitEnd;
  _AnimFastTranslateLinearWaitEnd(sprite);
}

// ─── SMOKESCREEN : AnimBlackSmoke ────────────────────────────────────────────

/** 1:1 `AnimBlackSmoke` (battle_anim_effects_3.c:1182) : nuage qui dérive en X
 *  fixed-point (args [x, y, vitesse, miroir?, durée]) en clignotant 1 frame/2. */
function AnimBlackSmoke(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  if (!(args[3] | 0)) sprite.data[0] = args[2] | 0;
  else sprite.data[0] = -(args[2] | 0);
  sprite.data[1] = args[4] | 0;
  sprite.invisible = false; // runtime crée invisible (le C crée visible)
  sprite.callback = AnimBlackSmoke_Step;
}
/** 1:1 `AnimBlackSmoke_Step` (:1196) : x2 = data[2]>>8 cumulé + flicker invisible^=1. */
function AnimBlackSmoke_Step(sprite: _VSprite): void {
  if (sprite.data[1] > 0) {
    sprite.x2 = sprite.data[2] >> 8;
    sprite.data[2] += sprite.data[0];
    sprite.invisible = !sprite.invisible; // sprite->invisible ^= 1
    sprite.data[1]--;
  } else {
    _DestroyAnimSprite(sprite);
  }
}

// ─── FLASH/halo blanc : AnimWhiteHalo ────────────────────────────────────────

/** 1:1 `AnimWhiteHalo` (battle_anim_effects_3.c:1220) : halo blend (eva 7) tenu
 *  90 frames (WaitAnimForDuration) puis fade-out par _Step1. */
function AnimWhiteHalo(sprite: _VSprite): void {
  sprite.data[0] = 90;
  sprite.callback = _WaitAnimForDuration;
  sprite.data[1] = 7;
  StoreSpriteCallbackInData6(sprite as never, AnimWhiteHalo_Step1 as never);
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_BLDCNT, BLDCNT_BLEND_TGT2ALL);
  rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[1], 16 - sprite.data[1]));
  sprite.invisible = false;
}
/** 1:1 `AnimWhiteHalo_Step1` (:1230) : eva data[1] 7→-1 (fade out). */
function AnimWhiteHalo_Step1(sprite: _VSprite): void {
  _grt().SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[1], 16 - sprite.data[1]));
  if (--sprite.data[1] < 0) {
    sprite.invisible = true;
    sprite.callback = AnimWhiteHalo_Step2;
  }
}
/** 1:1 `AnimWhiteHalo_Step2` (:1240) : reset blend + destroy. */
function AnimWhiteHalo_Step2(sprite: _VSprite): void {
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
  rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
  _DestroyAnimSprite(sprite);
}

// ─── MEAN LOOK satellites : AnimTealAlert / AnimMeanLookEye ──────────────────

/** 1:1 `AnimTealAlert` (battle_anim_effects_3.c:1247) : trait « alerte » orienté
 *  vers la cible (ArcTan2Neg + 0x6000) qui converge en data[2] frames. */
function AnimTealAlert(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const tgt = _vItf().getTarget?.() ?? 1;
  const x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) & 0xFF;      // u8 1:1
  const y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) & 0xFF;
  InitSpritePosToAnimTarget(sprite as never, true);
  let rotation = _ArcTan2Neg(sprite.x - x, sprite.y - y);
  rotation = (rotation + 0x6000) & 0xFFFF;
  // IsContest() == false → pas de += 0x4000.
  if (sprite.spriteId !== undefined)
    TrySetSpriteRotScale(sprite.spriteId, false, 0x100, 0x100, rotation);
  sprite.invisible = false;
  sprite.data[0] = args[2] | 0;
  sprite.data[2] = x;
  sprite.data[4] = y;
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimMeanLookEye` (battle_anim_effects_3.c:1269) : l'œil en blend
 *  (eva 0→15 ping-pong), puis affine 1 (zoom), tremblement, fade out. */
function AnimMeanLookEye(sprite: _VSprite): void {
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_BLDCNT, BLDCNT_BLEND_TGT2ALL);
  rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(0, 16));
  sprite.data[0] = 4;
  sprite.invisible = false;
  sprite.callback = AnimMeanLookEye_Step1;
}
/** 1:1 `AnimMeanLookEye_Step1` (:1277) : eva 4↔15 ping-pong ~70 frames →
 *  affine anim 1 (paused) + invisible → _Step2. */
function AnimMeanLookEye_Step1(sprite: _VSprite): void {
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[0], 16 - sprite.data[0]));
  if (sprite.data[1]) sprite.data[0]--;
  else sprite.data[0]++;
  if (sprite.data[0] === 15 || sprite.data[0] === 4) sprite.data[1] ^= 1;
  if (sprite.data[2]++ > 70) {
    rt.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
    rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
    _StartSpriteAffineAnim(sprite, 1);
    sprite.data[2] = 0;
    sprite.invisible = true;
    (sprite as { affineAnimPaused?: boolean }).affineAnimPaused = true;
    sprite.callback = AnimMeanLookEye_Step2;
  }
}
/** 1:1 `AnimMeanLookEye_Step2` (:1301) : 10 frames puis dé-pause l'affine ;
 *  passe à _Step3 quand l'affine est finie. */
function AnimMeanLookEye_Step2(sprite: _VSprite): void {
  if (sprite.data[2]++ > 9) {
    sprite.invisible = false;
    (sprite as { affineAnimPaused?: boolean }).affineAnimPaused = false;
    if (sprite.affineAnimEnded) sprite.callback = AnimMeanLookEye_Step3;
  }
}
/** 1:1 `AnimMeanLookEye_Step3` (:1312) : tremblement x2/y2 ±1 (cycle 8) pendant
 *  16 frames → réinstalle le blend (eva 16) → _Step4. */
function AnimMeanLookEye_Step3(sprite: _VSprite): void {
  switch (sprite.data[3]) {
    case 0: case 1:
      sprite.x2 = 1;
      sprite.y2 = 0;
      break;
    case 2: case 3:
      sprite.x2 = -1;
      sprite.y2 = 0;
      break;
    case 4: case 5:
      sprite.x2 = 0;
      sprite.y2 = 1;
      break;
    case 6: default:
      sprite.x2 = 0;
      sprite.y2 = -1;
      break;
  }
  if (++sprite.data[3] > 7) sprite.data[3] = 0;
  if (sprite.data[4]++ > 15) {
    sprite.data[0] = 16;
    sprite.data[1] = 0;
    const rt = _grt();
    rt.SetGpuReg?.(REG_OFFSET_BLDCNT, BLDCNT_BLEND_TGT2ALL);
    rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[0], 0));
    sprite.callback = AnimMeanLookEye_Step4;
  }
}
/** 1:1 `AnimMeanLookEye_Step4` (:1351) : fade eva 16→0 (1 pas / 2 frames) →
 *  reset blend + destroy. */
function AnimMeanLookEye_Step4(sprite: _VSprite): void {
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[0], 16 - sprite.data[0]));
  if (sprite.data[1]++ > 1) {
    sprite.data[0]--;
    sprite.data[1] = 0;
  }
  if (sprite.data[0] === 0) sprite.invisible = true;
  if (sprite.data[0] < 0) {
    rt.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
    rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
    _DestroyAnimSprite(sprite);
  }
}

// ─── SPIKES ──────────────────────────────────────────────────────────────────

/** 1:1 `AnimSpikes` (battle_anim_effects_3.c:1429) : pic lancé en arc (-50) de
 *  l'attaquant vers la position moyenne cible + offsets (args [x, y, xT, yT, durée]). */
function AnimSpikes(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  InitSpritePosToAnimAttacker(sprite as never, true);
  const avg = _SetAverageBattlerPositions(tgt, false);
  if (_side(atk) !== 0 /* != B_SIDE_PLAYER */) args[2] = -(args[2] | 0);
  sprite.data[0] = args[4] | 0;
  sprite.data[2] = avg.x + (args[2] | 0);
  sprite.data[4] = avg.y + (args[3] | 0);
  sprite.data[5] = -50;
  InitAnimArcTranslation(sprite as never);
  sprite.invisible = false;
  sprite.callback = AnimSpikes_Step1;
}
/** 1:1 `AnimSpikes_Step1` (:1448) : fin d'arc → 30 frames d'attente → _Step2. */
function AnimSpikes_Step1(sprite: _VSprite): void {
  if (TranslateAnimHorizontalArc(sprite as never)) {
    sprite.data[0] = 30;
    sprite.data[1] = 0;
    sprite.callback = _WaitAnimForDuration;
    StoreSpriteCallbackInData6(sprite as never, AnimSpikes_Step2 as never);
  }
}
/** 1:1 `AnimSpikes_Step2` (:1459) : flicker 1 frame/2 pendant 16 frames → destroy. */
function AnimSpikes_Step2(sprite: _VSprite): void {
  if (sprite.data[1] & 1) sprite.invisible = !sprite.invisible;
  if (++sprite.data[1] === 16) _DestroyAnimSprite(sprite);
}

// ─── ENCORE : AnimClappingHand (+2) ──────────────────────────────────────────

/** 1:1 `AnimClappingHand` (battle_anim_effects_3.c:1606) : une main qui clappe
 *  (x2 ±12 → 0 → ±12, data[0] claps). args [x, y, gauche/droite, pos abs?, claps].
 *  tileNum += 16 = la frame « main » de la sheet. */
function AnimClappingHand(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  if ((args[3] | 0) === 0) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y);
  }
  sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  _oamTileBump(sprite, 16);
  if ((args[2] | 0) === 0) {
    sprite.hFlip = true; // sprite->oam.matrixNum = ST_OAM_HFLIP (non-affine)
    sprite.x2 = -12;
    sprite.data[1] = 2;
  } else {
    sprite.x2 = 12;
    sprite.data[1] = -2;
  }
  sprite.data[0] = args[4] | 0;
  if (sprite.data[3] !== 255) sprite.data[3] = args[2] | 0;
  sprite.invisible = false;
  sprite.callback = AnimClappingHand_Step;
}
/** 1:1 `AnimClappingHand_Step` (:1638) : aller (x2→0, SE au contact si main 0)
 *  puis retour (|x2|==12 → un clap décompté). */
function AnimClappingHand_Step(sprite: _VSprite): void {
  if (sprite.data[2] === 0) {
    sprite.x2 += sprite.data[1];
    if (sprite.x2 === 0) {
      sprite.data[2]++;
      if (sprite.data[3] === 0) {
        _PlaySE12WithPanning(SE_M_ENCORE, SOUND_PAN_ATTACKER); // PlaySE1WithPanning
      }
    }
  } else {
    sprite.x2 -= sprite.data[1];
    if (Math.abs(sprite.x2) === 12) {
      sprite.data[0]--;
      sprite.data[2]--;
    }
  }
  if (sprite.data[0] === 0) _DestroyAnimSprite(sprite);
}
/** 1:1 `AnimClappingHand2` (:1667) : variante OBJ_WINDOW (masque spotlight) ;
 *  data[3]=255 = pas de SE, puis délègue à AnimClappingHand. */
function AnimClappingHand2(sprite: _VSprite): void {
  (sprite as { objMode?: number }).objMode = 2; // ST_OAM_OBJ_WINDOW
  sprite.data[3] = 255;
  AnimClappingHand(sprite);
}

// ─── RAPID SPIN ──────────────────────────────────────────────────────────────

/** 1:1 `AnimRapidSpin` (battle_anim_effects_3.c:1708) : la toupie oscille en X
 *  (gSineTable>>4) en montant/descendant jusqu'à y2 cible.
 *  args [ancre, x, y2départ, y2fin, vitesseOnde, vitesseY]. */
function AnimRapidSpin(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((args[0] | 0) === 0) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X) + (args[1] | 0);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y);
  } else {
    sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X) + (args[1] | 0);
    sprite.y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y);
  }
  sprite.y2 = args[2] | 0;
  sprite.data[0] = sprite.y2 > (args[3] | 0) ? 1 : 0;
  sprite.data[1] = 0;
  sprite.data[2] = args[4] | 0;
  sprite.data[3] = args[5] | 0;
  sprite.data[4] = args[3] | 0;
  sprite.invisible = false;
  sprite.callback = AnimRapidSpin_Step;
}
/** 1:1 `AnimRapidSpin_Step` (:1731). */
function AnimRapidSpin_Step(sprite: _VSprite): void {
  sprite.data[1] = (sprite.data[1] + sprite.data[2]) & 0xFF;
  sprite.x2 = gSineTable[sprite.data[1]] >> 4;
  sprite.y2 += sprite.data[3];
  if (sprite.data[0]) {
    if (sprite.y2 < sprite.data[4]) _DestroyAnimSprite(sprite);
  } else {
    if (sprite.y2 > sprite.data[4]) _DestroyAnimSprite(sprite);
  }
}

// ─── TRI ATTACK ──────────────────────────────────────────────────────────────

/** 1:1 `AnimTriAttackTriangle` (battle_anim_effects_3.c:2015) : le triangle
 *  clignote 40 frames sur l'attaquant (l'affine du template le fait tourner),
 *  puis (frame 61) translate vers la cible et se détruit. Self-stepper : le
 *  callback du template RESTE actif jusqu'à la frame 61 (1:1). */
function AnimTriAttackTriangle(sprite: _VSprite): void {
  const tgt = _vItf().getTarget?.() ?? 1;
  if (sprite.data[0] === 0) InitSpritePosToAnimAttacker(sprite as never, false);
  if (++sprite.data[0] < 40) {
    const v = sprite.data[0] & 0xFFFF;
    if ((v & 1) === 0) sprite.invisible = true;
    else sprite.invisible = false;
  }
  if (sprite.data[0] > 30) sprite.invisible = false;
  if (sprite.data[0] === 61) {
    StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.x2 = 0;
    sprite.y2 = 0;
    sprite.data[0] = 20;
    sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
    sprite.callback = StartAnimLinearTranslation as never;
  }
}

// ─── BATON PASS ──────────────────────────────────────────────────────────────

/** 1:1 corps du `case 2` d'AnimBatonPassPokeball (:2083) — extrait pour
 *  répliquer le fall-through C `case 1 → case 2` (tsconfig noFallthrough). */
function _BatonPassPokeball_Case2(sprite: _VSprite, spriteId: number): void {
  sprite.data[1] += 96;
  sprite.data[2] += 48;
  if (spriteId !== 0xFF) SetSpriteRotScale(spriteId, sprite.data[1], sprite.data[2], 0);
  if (++sprite.data[3] === 9) {
    sprite.data[3] = 0;
    const mon = spriteId !== 0xFF ? _grt().gSprites?.get(spriteId) : undefined;
    if (mon) mon.invisible = true; // gSprites[spriteId].invisible = TRUE
    if (spriteId !== 0xFF) ResetSpriteRotScale(spriteId);
    sprite.data[0]++;
  }
}
/** 1:1 `AnimBatonPassPokeball` (battle_anim_effects_3.c:2061) : la ball apparaît
 *  sur l'attaquant pendant que le mon est étiré (rot-scale) puis caché ; la ball
 *  monte hors écran. Self-stepper (switch data[0]). */
function AnimBatonPassPokeball(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  const spriteId = _GetAnimBattlerSpriteId(0 /* ANIM_ATTACKER */);
  switch (sprite.data[0]) {
    case 0:
      sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
      sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
      if (spriteId !== 0xFF) PrepareBattlerSpriteForRotScale(spriteId, 0 /* ST_OAM_OBJ_NORMAL */);
      sprite.data[1] = 256;
      sprite.data[2] = 256;
      sprite.invisible = false;
      sprite.data[0]++;
      break;
    case 1:
      sprite.data[1] += 96;
      sprite.data[2] -= 26;
      if (spriteId !== 0xFF) SetSpriteRotScale(spriteId, sprite.data[1], sprite.data[2], 0);
      if (++sprite.data[3] === 5) sprite.data[0]++;
      _BatonPassPokeball_Case2(sprite, spriteId); // 1:1 fall through C
      break;
    case 2:
      _BatonPassPokeball_Case2(sprite, spriteId);
      break;
    case 3:
      sprite.y2 -= 6;
      if (sprite.y + sprite.y2 < -32) _DestroyAnimSprite(sprite);
      break;
  }
}

// ─── WISH : AnimWishStar + AnimMiniTwinklingStar ─────────────────────────────

/** 1:1 `AnimWishStar` (battle_anim_effects_3.c:2104) : l'étoile filante entre
 *  par le bord (côté attaquant) en haut de l'écran. */
function AnimWishStar(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  if (_side(atk) !== 0 /* != B_SIDE_PLAYER */) sprite.x = -16;
  else sprite.x = DISPLAY_WIDTH + 16;
  sprite.y = 0;
  sprite.invisible = false;
  sprite.callback = AnimWishStar_Step;
}
/** 1:1 `AnimWishStar_Step` (:2115) : traverse l'écran (72/16 px/frame) en
 *  tombant doucement, sème une mini-étoile toutes les 3 frames
 *  (CreateSpriteAndAnimate(gMiniTwinklingStarSpriteTemplate) — ici CreateSprite
 *  du bridge ; anims du template = gDummySpriteAnimTable → net identique).
 *  Destroy en cast u32 1:1 (sortie d'écran des DEUX côtés). */
function AnimWishStar_Step(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  sprite.data[0] += 72;
  if (_side(atk) !== 0) sprite.x2 = sprite.data[0] >> 4;
  else sprite.x2 = -(sprite.data[0] >> 4);
  sprite.data[1] += 16;
  sprite.y2 += sprite.data[1] >> 8;
  if (++sprite.data[2] % 3 === 0) {
    _CreateMiniTwinklingStar(sprite.x + sprite.x2, sprite.y + sprite.y2, (sprite.subpriority ?? 0) + 1);
  }
  const newX = (sprite.x + sprite.x2 + 32) >>> 0; // u32 newX 1:1 (négatif → énorme)
  if (newX > DISPLAY_WIDTH + 64) _DestroyAnimSprite(sprite);
}
/** Crée une mini-étoile gMiniTwinklingStarSpriteTemplate (template résolu par le
 *  registre généré ; sheet ANIM_TAG_GOLD_STARS chargée par le loadspritegfx du
 *  script parent) — pattern CreateWaterPulseRingBubbles (battle_anim_water). */
function _CreateMiniTwinklingStar(x: number, y: number, subpriority: number): void {
  const tpl = lookupAnimTemplate('gMiniTwinklingStarSpriteTemplate');
  if (!tpl) return; // registre pas prêt — dette douce (le C crée toujours)
  const spriteId = _CreateSpriteFromTemplate(tpl as never, x, y, subpriority);
  if (spriteId < 0) return;
  const sp = _grt().gSprites?.get(spriteId);
  if (!sp) return;
  sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
  sp.spriteId = spriteId;
}
/** 1:1 `AnimMiniTwinklingStar` (battle_anim_effects_3.c:2142) : choisit une des
 *  2 frames étoile (tileNum += 4/5, Random2) + offset y aléatoire. */
function AnimMiniTwinklingStar(sprite: _VSprite): void {
  const rand = _rand2() & 3;
  if (rand === 0) _oamTileBump(sprite, 4);
  else _oamTileBump(sprite, 5);
  let y = _rand2() & 7; // s8 y
  if (y > 3) y = -y;
  sprite.y2 = y;
  sprite.callback = AnimMiniTwinklingStar_Step;
}
/** 1:1 `AnimMiniTwinklingStar_Step` (:2161) : scintille (toggle /2 frames) 30
 *  frames puis pattern 3-on/1-off ; DestroySprite (raw, PAS DestroyAnimSprite —
 *  l'étoile ne compte pas dans gAnimVisualTaskCount). */
function AnimMiniTwinklingStar_Step(sprite: _VSprite): void {
  if (++sprite.data[0] < 30) {
    if (++sprite.data[1] === 2) {
      sprite.invisible = !sprite.invisible;
      sprite.data[1] = 0;
    }
  } else {
    if (sprite.data[1] === 2) sprite.invisible = false;
    if (sprite.data[1] === 3) {
      sprite.invisible = true;
      sprite.data[1] = -1;
    }
    sprite.data[1]++;
  }
  if (sprite.data[0] > 60) {
    if (sprite.spriteId !== undefined) _grt().DestroySprite?.(sprite.spriteId);
    else { sprite.invisible = true; sprite.callback = null; } // fail-safe sans id
  }
}

// ─── SWEET SCENT ─────────────────────────────────────────────────────────────

/** 1:1 `AnimSweetScentPetal` (battle_anim_effects_3.c:2800) : pétale qui
 *  traverse l'écran depuis le bord de l'attaquant. args [y, animNum, ?]. */
function AnimSweetScentPetal(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  if (_side(atk) === 0 /* B_SIDE_PLAYER */) {
    sprite.x = 0;
    sprite.y = args[0] | 0;
  } else {
    sprite.x = DISPLAY_WIDTH;
    sprite.y = (args[0] | 0) - 30;
  }
  sprite.data[2] = args[2] | 0;
  _StartSpriteAnim(sprite, args[1] | 0);
  sprite.invisible = false;
  sprite.callback = AnimSweetScentPetal_Step;
}
/** 1:1 `AnimSweetScentPetal_Step` (:2818) : +5px/frame + onde Sin (joueur) ou
 *  -5px + Cos (adverse) ; destroy au bord opposé. */
function AnimSweetScentPetal_Step(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  sprite.data[0] += 3;
  if (_side(atk) === 0) {
    sprite.x += 5;
    sprite.y -= 1;
    if (sprite.x > DISPLAY_WIDTH) _DestroyAnimSprite(sprite);
    sprite.y2 = Sin(sprite.data[0] & 0xFF, 16);
  } else {
    sprite.x -= 5;
    sprite.y += 1;
    if (sprite.x < 0) _DestroyAnimSprite(sprite);
    sprite.y2 = Cos(sprite.data[0] & 0xFF, 16);
  }
}

// ─── PAIN SPLIT ──────────────────────────────────────────────────────────────

/** 1:1 `AnimPainSplitProjectile` (battle_anim_effects_3.c:2937) : le projectile
 *  rebondit (gravité fixed-point, rebond aux 2/3) — self-stepper (data[0]=phase
 *  init). args [x, y, ancre atk/tgt]. Destroy à la fin de l'anim de frames. */
function AnimPainSplitProjectile(sprite: _VSprite): void {
  if (!sprite.data[0]) {
    const args = _vItf().getArgs?.() ?? [0, 0, 0];
    const atk = _vItf().getAttacker?.() ?? 0;
    if ((args[2] | 0) === 0 /* ANIM_ATTACKER */) {
      sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
      sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
    }
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[1] = 0x80;
    sprite.data[2] = 0x300;
    sprite.data[3] = args[1] | 0;
    sprite.invisible = false;
    sprite.data[0]++;
  } else {
    sprite.x2 = sprite.data[1] >> 8;
    sprite.y2 += sprite.data[2] >> 8;
    if (sprite.data[4] === 0 && sprite.y2 > -sprite.data[3]) {
      sprite.data[4] = 1;
      sprite.data[2] = Math.trunc(-sprite.data[2] / 3) * 2;
    }
    sprite.data[1] += 192;
    sprite.data[2] += 128;
    if (sprite.animEnded) _DestroyAnimSprite(sprite);
  }
}

// ─── FLATTER ─────────────────────────────────────────────────────────────────

/** 1:1 `AnimFlatterConfetti` (battle_anim_effects_3.c:3033) : confetti éjecté
 *  du bord (vitesses randomisées Random2). arg0 = côté (0 = gauche). */
function AnimFlatterConfetti(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const tileOffset = _rand2() % 12;
  _oamTileBump(sprite, tileOffset);
  const rand1 = _rand2() & 0x1FF;
  const rand2 = _rand2() & 0xFF;
  if (rand1 & 1) sprite.data[0] = 0x5E0 + rand1;
  else sprite.data[0] = 0x5E0 - rand1;
  if (rand2 & 1) sprite.data[1] = 0x480 + rand2;
  else sprite.data[1] = 0x480 - rand2;
  sprite.data[2] = args[0] | 0;
  if (sprite.data[2] === 0 /* ANIM_ATTACKER */) sprite.x = -8;
  else sprite.x = DISPLAY_WIDTH + 8;
  sprite.y = 104;
  sprite.invisible = false;
  sprite.callback = AnimFlatterConfetti_Step;
}
/** 1:1 `AnimFlatterConfetti_Step` (:3064) : parabole fixed-point décélérée,
 *  destroy à 31 frames. */
function AnimFlatterConfetti_Step(sprite: _VSprite): void {
  if (sprite.data[2] === 0) {
    sprite.x2 += sprite.data[0] >> 8;
    sprite.y2 -= sprite.data[1] >> 8;
  } else {
    sprite.x2 -= sprite.data[0] >> 8;
    sprite.y2 -= sprite.data[1] >> 8;
  }
  sprite.data[0] -= 22;
  sprite.data[1] -= 48;
  if (sprite.data[0] < 0) sprite.data[0] = 0;
  if (++sprite.data[3] === 31) _DestroyAnimSprite(sprite);
}

/** 1:1 `AnimFlatterSpotlight` (battle_anim_effects_3.c:3090) : le cône spotlight
 *  en OBJ_WINDOW illumine la cible (WINOUT sans WINOBJ_CLR = le blend ne
 *  s'applique pas dans le cône). args [x, y, durée plein ouvert]. */
function AnimFlatterSpotlight(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_WINOUT, WINOUT_FLATTER_ON);
  rt.SetGpuReg?.(REG_OFFSET_DISPCNT, (rt.GetGpuReg?.(REG_OFFSET_DISPCNT) ?? 0) | DISPCNT_OBJWIN_ON); // SetGpuRegBits
  _setBattleWinReg('gBattle_WIN0H', 0);
  _setBattleWinReg('gBattle_WIN0V', 0);
  rt.SetGpuReg?.(REG_OFFSET_WIN0H, 0);
  rt.SetGpuReg?.(REG_OFFSET_WIN0V, 0);
  sprite.data[0] = args[2] | 0;
  InitSpritePosToAnimTarget(sprite as never, false);
  (sprite as { objMode?: number }).objMode = 2; // ST_OAM_OBJ_WINDOW
  sprite.invisible = true; // 1:1 décomp (révélé par _Step case 0)
  sprite.callback = AnimFlatterSpotlight_Step;
}
/** 1:1 `AnimFlatterSpotlight_Step` (:3106) : ouvre (affine 0) → tient data[0]
 *  frames → ferme (affine 1) → restore WINOUT/DISPCNT + destroy. */
function AnimFlatterSpotlight_Step(sprite: _VSprite): void {
  const rt = _grt();
  switch (sprite.data[1]) {
    case 0:
      sprite.invisible = false;
      if (sprite.affineAnimEnded) sprite.data[1]++;
      break;
    case 1:
      if (--sprite.data[0] === 0) {
        _StartSpriteAffineAnim(sprite, 1); // ChangeSpriteAffineAnim(sprite, 1)
        sprite.data[1]++;
      }
      break;
    case 2:
      if (sprite.affineAnimEnded) {
        sprite.invisible = true;
        sprite.data[1]++;
      }
      break;
    case 3:
      rt.SetGpuReg?.(REG_OFFSET_WINOUT, WINOUT_FLATTER_OFF);
      rt.SetGpuReg?.(REG_OFFSET_DISPCNT, (rt.GetGpuReg?.(REG_OFFSET_DISPCNT) ?? 0) ^ DISPCNT_OBJWIN_ON);
      _DestroyAnimSprite(sprite);
      break;
  }
}

// ─── YAWN ────────────────────────────────────────────────────────────────────

/** 1:1 `InitYawnCloudPosition` (battle_anim_effects_3.c:3512) : interpolation
 *  fixed-point x16 start→dest en `duration` frames. */
function _InitYawnCloudPosition(sprite: _VSprite, startX: number, startY: number, destX: number, destY: number, duration: number): void {
  sprite.x = startX;
  sprite.y = startY;
  sprite.data[4] = startX << 4;
  sprite.data[5] = startY << 4;
  sprite.data[6] = Math.trunc(((destX - startX) << 4) / duration);
  sprite.data[7] = Math.trunc(((destY - startY) << 4) / duration);
}
/** 1:1 `UpdateYawnCloudPosition` (:3522). */
function _UpdateYawnCloudPosition(sprite: _VSprite): void {
  sprite.data[4] += sprite.data[6];
  sprite.data[5] += sprite.data[7];
  sprite.x = sprite.data[4] >> 4;
  sprite.y = sprite.data[5] >> 4;
}
/** 1:1 `AnimYawnCloud` (battle_anim_effects_3.c:3532) : le nuage part de
 *  l'attaquant vers sa position de création (= la cible posée par createsprite),
 *  affine arg0, en ondulant. */
function AnimYawnCloud(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const destX = sprite.x; // s16 destX = sprite->x (position posée par createsprite)
  const destY = sprite.y;
  SetSpriteCoordsToAnimAttackerCoords(sprite as never);
  _StartSpriteAffineAnim(sprite, args[0] | 0);
  _InitYawnCloudPosition(sprite, sprite.x, sprite.y, destX, destY, 64);
  sprite.data[0] = 0;
  sprite.invisible = false;
  sprite.callback = AnimYawnCloud_Step;
}
/** 1:1 `AnimYawnCloud_Step` (:3544) : translation + Sin(index*8, 8) ; après 58
 *  frames, flicker /2 puis DestroySpriteAndMatrix. */
function AnimYawnCloud_Step(sprite: _VSprite): void {
  sprite.data[0]++;
  const index = (sprite.data[0] * 8) & 0xFF;
  _UpdateYawnCloudPosition(sprite);
  sprite.y2 = Sin(index, 8);
  if (sprite.data[0] > 58) {
    if (++sprite.data[1] > 1) {
      sprite.data[1] = 0;
      sprite.data[2]++;
      sprite.invisible = (sprite.data[2] & 1) !== 0;
      if (sprite.data[2] > 3) DestroySpriteAndMatrix(sprite as never);
    }
  }
}

// ─── ASSIST ──────────────────────────────────────────────────────────────────

/** 1:1 `AnimAssistPawprint` (battle_anim_effects_3.c:4145) : empreinte en
 *  translation rapide x16 (InitAndRunAnimFastLinearTranslation) → destroy.
 *  args [xDépart, yDépart, xFin, yFin, durée] (positions ABSOLUES écran). */
function AnimAssistPawprint(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 1];
  sprite.x = args[0] | 0;
  sprite.y = args[1] | 0;
  sprite.data[2] = args[2] | 0;
  sprite.data[4] = args[3] | 0;
  sprite.data[0] = args[4] | 0;
  sprite.invisible = false;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
  sprite.callback = _InitAndRunAnimFastLinearTranslation;
}

// ─── SMELLING SALTS ──────────────────────────────────────────────────────────

/** 1:1 `AnimSmellingSaltsHand` (battle_anim_effects_3.c:4232) : la main qui
 *  « claque » contre le flanc du mon (tileNum += 16 = frame main).
 *  args [ancre, côté gauche/droite, répétitions]. */
function AnimSmellingSaltsHand(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const battler = (args[0] | 0) === 0 /* ANIM_ATTACKER */
    ? (_vItf().getAttacker?.() ?? 0)
    : (_vItf().getTarget?.() ?? 1);
  _oamTileBump(sprite, 16);
  sprite.data[6] = args[2] | 0;
  sprite.data[7] = (args[1] | 0) === 0 ? -1 : 1;
  sprite.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y_PIC_OFFSET);
  if ((args[1] | 0) === 0) {
    sprite.hFlip = true; // sprite->oam.matrixNum |= ST_OAM_HFLIP
    sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_LEFT) - 8;
  } else {
    sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_RIGHT) + 8;
  }
  sprite.invisible = false;
  sprite.callback = AnimSmellingSaltsHand_Step;
}
/** 1:1 `AnimSmellingSaltsHand_Step` (:4258) : approche lente 12px → pause 8 →
 *  frappe -4px/f ×6 → recul +3px/f ×8, répété data[6] fois. */
function AnimSmellingSaltsHand_Step(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (++sprite.data[1] > 1) {
        sprite.data[1] = 0;
        sprite.x2 += sprite.data[7];
        if (++sprite.data[2] === 12) sprite.data[0]++;
      }
      break;
    case 1:
      if (++sprite.data[1] === 8) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 2:
      sprite.x2 -= sprite.data[7] * 4;
      if (++sprite.data[1] === 6) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 3:
      sprite.x2 += sprite.data[7] * 3;
      if (++sprite.data[1] === 8) {
        if (--sprite.data[6]) {
          sprite.data[1] = 0;
          sprite.data[0]--;
        } else {
          _DestroyAnimSprite(sprite);
        }
      }
      break;
  }
}

/** 1:1 `AnimSmellingSaltExclamation` (battle_anim_effects_3.c:4355) : le « ! »
 *  clignote au-dessus du mon (args [ancre, période, répétitions]). */
function AnimSmellingSaltExclamation(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  const tgt = _vItf().getTarget?.() ?? 1;
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
    sprite.y = _GetBattlerSpriteCoordAttr(atk, BATTLER_COORD_ATTR_TOP);
  } else {
    sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
    sprite.y = _GetBattlerSpriteCoordAttr(tgt, BATTLER_COORD_ATTR_TOP);
  }
  if (sprite.y < 8) sprite.y = 8;
  sprite.data[0] = 0;
  sprite.data[1] = args[1] | 0;
  sprite.data[2] = 0;
  sprite.data[3] = args[2] | 0;
  sprite.invisible = false;
  sprite.callback = AnimSmellingSaltExclamation_Step;
}
/** 1:1 `AnimSmellingSaltExclamation_Step` (:4378). */
function AnimSmellingSaltExclamation_Step(sprite: _VSprite): void {
  if (++sprite.data[0] >= sprite.data[1]) {
    sprite.data[0] = 0;
    sprite.data[2] = (sprite.data[2] + 1) & 1;
    sprite.invisible = sprite.data[2] !== 0;
    if (sprite.data[2] && --sprite.data[3] === 0) _DestroyAnimSprite(sprite);
  }
}

// ─── HELPING HAND ────────────────────────────────────────────────────────────

/** 1:1 `AnimHelpingHandClap` (battle_anim_effects_3.c:4393) : les deux mains
 *  (positions écran FIXES 100/140, y 56) qui applaudissent 3 fois.
 *  arg0 = quelle main (0 = gauche, hFlip). */
function AnimHelpingHandClap(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  if ((args[0] | 0) === 0) {
    sprite.hFlip = true; // sprite->oam.matrixNum |= ST_OAM_HFLIP
    sprite.x = 100;
    sprite.data[7] = 1;
  } else {
    sprite.x = 140;
    sprite.data[7] = -1;
  }
  sprite.y = 56;
  sprite.invisible = false;
  sprite.callback = AnimHelpingHandClap_Step;
}
/** 1:1 `AnimHelpingHandClap_Step` (:4411) : chorégraphie 9 phases (montée,
 *  claps Sin gSineTable[d1*10]>>3, frame de main tileNum+16, sortie). */
function AnimHelpingHandClap_Step(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.y -= sprite.data[7] * 2;
      if (sprite.data[1] & 1) sprite.x -= sprite.data[7] * 2;
      if (++sprite.data[1] === 9) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 1:
      if (++sprite.data[1] === 4) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 2:
      sprite.data[1]++;
      sprite.y += sprite.data[7] * 3;
      sprite.x2 = sprite.data[7] * (gSineTable[sprite.data[1] * 10] >> 3);
      if (sprite.data[1] === 12) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 3:
      if (++sprite.data[1] === 2) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 4:
      sprite.data[1]++;
      sprite.y -= sprite.data[7] * 3;
      sprite.x2 = sprite.data[7] * (gSineTable[sprite.data[1] * 10] >> 3);
      if (sprite.data[1] === 12) sprite.data[0]++;
      break;
    case 5:
      sprite.data[1]++;
      sprite.y += sprite.data[7] * 3;
      sprite.x2 = sprite.data[7] * (gSineTable[sprite.data[1] * 10] >> 3);
      if (sprite.data[1] === 15) _oamTileBump(sprite, 16);
      if (sprite.data[1] === 18) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 6:
      sprite.x += sprite.data[7] * 6;
      if (++sprite.data[1] === 9) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 7:
      sprite.x += sprite.data[7] * 2;
      if (++sprite.data[1] === 1) {
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 8:
      sprite.x -= sprite.data[7] * 3;
      if (++sprite.data[1] === 5) _DestroyAnimSprite(sprite);
      break;
  }
}

// ─── FORESIGHT ───────────────────────────────────────────────────────────────

/** 1:1 `AnimForesightMagnifyingGlass` (battle_anim_effects_3.c:4612) : la loupe
 *  parcourt les coins du mon (attrs LEFT/RIGHT/TOP/BOTTOM) puis le centre,
 *  flash blend, destroy. arg0 = mon ciblé. data[7] = battler. */
function AnimForesightMagnifyingGlass(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    InitSpritePosToAnimAttacker(sprite as never, true);
    sprite.data[7] = _vItf().getAttacker?.() ?? 0;
  } else {
    sprite.data[7] = _vItf().getTarget?.() ?? 1;
  }
  if (_side(sprite.data[7]) === 1 /* B_SIDE_OPPONENT */)
    sprite.hFlip = true; // sprite->oam.matrixNum = ST_OAM_HFLIP
  const oam = _oamOf(sprite);
  if (oam) oam.priority = _GetBattlerSpriteBGPriority(sprite.data[7]);
  (sprite as { objMode?: number }).objMode = 1; // ST_OAM_OBJ_BLEND
  sprite.invisible = false;
  sprite.callback = AnimForesightMagnifyingGlass_Step;
}
/** 1:1 `AnimForesightMagnifyingGlass_Step` (:4632) : machine d'états — data[5]
 *  = phase (0 choisir cible, 1 translater, 2 pause, 3 fade blend, 4 destroy),
 *  data[6] = étape du parcours (0..5). */
function AnimForesightMagnifyingGlass_Step(sprite: _VSprite): void {
  let x = 0, y = 0;
  switch (sprite.data[5]) {
    case 0: {
      // 1:1 switch C avec `default: data[6] = 0;` qui TOMBE dans case 0/4.
      if (sprite.data[6] < 0 || sprite.data[6] > 5) sprite.data[6] = 0;
      switch (sprite.data[6]) {
        case 0: case 4:
          x = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_RIGHT) - 4;
          y = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_BOTTOM) - 4;
          break;
        case 1:
          x = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_RIGHT) - 4;
          y = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_TOP) + 4;
          break;
        case 2:
          x = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_LEFT) + 4;
          y = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_BOTTOM) - 4;
          break;
        case 3:
          x = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_LEFT) + 4;
          y = _GetBattlerSpriteCoordAttr(sprite.data[7], BATTLER_COORD_ATTR_TOP) - 4;
          break;
        case 5: default:
          x = GetBattlerSpriteCoord(sprite.data[7], BATTLER_COORD_X_2);
          y = GetBattlerSpriteCoord(sprite.data[7], BATTLER_COORD_Y_PIC_OFFSET);
          break;
      }
      if (sprite.data[6] === 4) sprite.data[0] = 24;
      else if (sprite.data[6] === 5) sprite.data[0] = 6;
      else sprite.data[0] = 12;
      sprite.data[1] = sprite.x;
      sprite.data[2] = x;
      sprite.data[3] = sprite.y;
      sprite.data[4] = y;
      InitAnimLinearTranslation(sprite as never);
      sprite.data[5]++;
      break;
    }
    case 1:
      if (AnimTranslateLinear(sprite as never)) {
        switch (sprite.data[6]) {
          case 4:
            sprite.x += sprite.x2;
            sprite.y += sprite.y2;
            sprite.y2 = 0;
            sprite.x2 = 0;
            sprite.data[5] = 0;
            sprite.data[6]++;
            break;
          case 5:
            sprite.data[0] = 0;
            sprite.data[1] = 16;
            sprite.data[2] = 0;
            sprite.data[5] = 3;
            break;
          default:
            sprite.x += sprite.x2;
            sprite.y += sprite.y2;
            sprite.y2 = 0;
            sprite.x2 = 0;
            sprite.data[0] = 0;
            sprite.data[5]++;
            sprite.data[6]++;
            break;
        }
      }
      break;
    case 2:
      if (++sprite.data[0] === 4) sprite.data[5] = 0;
      break;
    case 3:
      if (!(sprite.data[0] & 1)) sprite.data[1]--;
      else sprite.data[2]++;
      _grt().SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[1], sprite.data[2]));
      if (++sprite.data[0] === 32) {
        sprite.invisible = true;
        sprite.data[5]++;
      }
      break;
    case 4:
      _DestroyAnimSprite(sprite);
      break;
  }
}

// ─── METEOR MASH ─────────────────────────────────────────────────────────────

/** 1:1 `AnimMeteorMashStar_Step` (battle_anim_effects_3.c:4734) : interpolation
 *  linéaire data[0..3] → sème une mini-étoile 1 frame/2 (CreateSprite, subprio 5). */
function AnimMeteorMashStar_Step(sprite: _VSprite): void {
  sprite.x2 = Math.trunc(((sprite.data[2] - sprite.data[0]) * sprite.data[5]) / sprite.data[4]);
  sprite.y2 = Math.trunc(((sprite.data[3] - sprite.data[1]) * sprite.data[5]) / sprite.data[4]);
  if (!(sprite.data[5] & 1)) {
    _CreateMiniTwinklingStar(sprite.x + sprite.x2, sprite.y + sprite.y2, 5);
  }
  if (sprite.data[5] === sprite.data[4]) _DestroyAnimSprite(sprite);
  sprite.data[5]++;
}
/** 1:1 `AnimMeteorMashStar` (battle_anim_effects_3.c:4758) : étoile filante
 *  miroir côté cible. args [x0, y0, x1, y1, durée]. */
function AnimMeteorMashStar(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 1];
  const tgt = _vItf().getTarget?.() ?? 1;
  if (_side(tgt) === 0 /* B_SIDE_PLAYER (|| IsContest()) */) {
    sprite.data[0] = sprite.x - (args[0] | 0);
    sprite.data[2] = sprite.x - (args[2] | 0);
  } else {
    sprite.data[0] = sprite.x + (args[0] | 0);
    sprite.data[2] = sprite.x + (args[2] | 0);
  }
  sprite.data[1] = sprite.y + (args[1] | 0);
  sprite.data[3] = sprite.y + (args[3] | 0);
  sprite.data[4] = args[4] | 0;
  sprite.x = sprite.data[0];
  sprite.y = sprite.data[1];
  sprite.invisible = false;
  sprite.callback = AnimMeteorMashStar_Step;
}

// ─── BLOCK ───────────────────────────────────────────────────────────────────

/** 1:1 `AnimBlockX` (battle_anim_effects_3.c:4878) : le X tombe du haut de
 *  l'écran sur la cible, rebondit 2 fois (gSineTable), clignote, destroy. */
function AnimBlockX(sprite: _VSprite): void {
  const tgt = _vItf().getTarget?.() ?? 1;
  let y: number;
  if (_side(tgt) === 0 /* B_SIDE_PLAYER */) {
    sprite.subpriority = _GetBattlerSpriteSubpriority(tgt) - 2;
    y = -144;
  } else {
    sprite.subpriority = _GetBattlerSpriteSubpriority(tgt) + 2;
    y = -96;
  }
  sprite.y = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.y2 = y;
  sprite.invisible = false;
  sprite.callback = AnimBlockX_Step;
}
/** 1:1 `AnimBlockX_Step` (:4898) : chute +10px/f (SE au contact) → rebond
 *  Sin>>3 → rebond Sin>>4 → pause → flicker + SE_M_LEER → destroy. */
function AnimBlockX_Step(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.y2 += 10;
      if (sprite.y2 >= 0) {
        _PlaySE12WithPanning(SE_M_SKETCH, SOUND_PAN_TARGET);
        sprite.y2 = 0;
        sprite.data[0]++;
      }
      break;
    case 1:
      sprite.data[1] += 4;
      sprite.y2 = -(gSineTable[sprite.data[1]] >> 3);
      if (sprite.data[1] > 0x7F) {
        _PlaySE12WithPanning(SE_M_SKETCH, SOUND_PAN_TARGET);
        sprite.data[1] = 0;
        sprite.y2 = 0;
        sprite.data[0]++;
      }
      break;
    case 2:
      sprite.data[1] += 6;
      sprite.y2 = -(gSineTable[sprite.data[1]] >> 4);
      if (sprite.data[1] > 0x7F) {
        sprite.data[1] = 0;
        sprite.y2 = 0;
        sprite.data[0]++;
      }
      break;
    case 3:
      if (++sprite.data[1] > 8) {
        _PlaySE12WithPanning(SE_M_LEER, SOUND_PAN_TARGET);
        sprite.data[1] = 0;
        sprite.data[0]++;
      }
      break;
    case 4:
      if (++sprite.data[1] > 8) {
        sprite.data[1] = 0;
        sprite.data[2]++;
        sprite.invisible = (sprite.data[2] & 1) !== 0;
        if (sprite.data[2] === 7) _DestroyAnimSprite(sprite);
      }
      break;
  }
}

// ─── KNOCK OFF ───────────────────────────────────────────────────────────────

/** 1:1 `AnimKnockOffStrike_Step` (battle_anim_effects_3.c:5376) : balaye en
 *  cercle Cos/Sin(data[1], 20) ; destroy à la fin de l'anim de frames.
 *  (Les deux branches side du C sont identiques — transcrit tel quel.) */
function AnimKnockOffStrike_Step(sprite: _VSprite): void {
  sprite.data[1] += sprite.data[0];
  sprite.data[1] &= 0xFF;
  sprite.x2 = Cos(sprite.data[1], 20);
  sprite.y2 = Sin(sprite.data[1], 20);
  if (sprite.animEnded) _DestroyAnimSprite(sprite);
  sprite.data[2]++;
}
/** 1:1 `AnimKnockOffStrike` (battle_anim_effects_3.c:5401) : la frappe qui
 *  balaie vers le bas — miroir côté cible (affine 1 = flip côté joueur).
 *  args [x, y]. */
function AnimKnockOffStrike(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  const tgt = _vItf().getTarget?.() ?? 1;
  if (_side(tgt) === 0 /* B_SIDE_PLAYER */) {
    sprite.x -= args[0] | 0;
    sprite.y += args[1] | 0;
    sprite.data[0] = -11;
    sprite.data[1] = 192;
    _StartSpriteAffineAnim(sprite, 1);
  } else {
    sprite.data[0] = 11;
    sprite.data[1] = 192;
    sprite.x += args[0] | 0;
    sprite.y += args[1] | 0;
  }
  sprite.invisible = false;
  sprite.callback = AnimKnockOffStrike_Step;
}

// ─── RECYCLE ─────────────────────────────────────────────────────────────────

/** 1:1 `AnimRecycle` (battle_anim_effects_3.c:5424) : les flèches recycle
 *  au-dessus de l'attaquant, fade-in eva 0→16 / evb 16→0 puis fade-out (le
 *  BLDCNT est posé par le script — seul BLDALPHA est écrit ici, 1:1). */
function AnimRecycle(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = _GetBattlerSpriteCoordAttr(atk, BATTLER_COORD_ATTR_TOP);
  if (sprite.y < 16) sprite.y = 16;
  sprite.data[6] = 0;
  sprite.data[7] = 16;
  sprite.invisible = false;
  sprite.callback = AnimRecycle_Step;
  _grt().SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[6], sprite.data[7]));
}
/** 1:1 `AnimRecycle_Step` (:5437) : fade-in alterné (1 pas / 2 frames, eva puis
 *  evb) → pause 10 → fade-out symétrique → DestroySpriteAndMatrix. */
function AnimRecycle_Step(sprite: _VSprite): void {
  const rt = _grt();
  switch (sprite.data[2]) {
    case 0:
      if (++sprite.data[0] > 1) {
        sprite.data[0] = 0;
        if (!(sprite.data[1] & 1)) {
          if (sprite.data[6] < 16) sprite.data[6]++;
        } else {
          if (sprite.data[7] !== 0) sprite.data[7]--;
        }
        sprite.data[1]++;
        rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[6], sprite.data[7]));
        if (sprite.data[7] === 0) sprite.data[2]++;
      }
      break;
    case 1:
      if (++sprite.data[0] === 10) {
        sprite.data[0] = 0;
        sprite.data[1] = 0;
        sprite.data[2]++;
      }
      break;
    case 2:
      if (++sprite.data[0] > 1) {
        sprite.data[0] = 0;
        if (!(sprite.data[1] & 1)) {
          if (sprite.data[6] !== 0) sprite.data[6]--;
        } else {
          if (sprite.data[7] < 16) sprite.data[7]++;
        }
        sprite.data[1]++;
        rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(sprite.data[6], sprite.data[7]));
        if (sprite.data[7] === 16) sprite.data[2]++;
      }
      break;
    case 3:
      DestroySpriteAndMatrix(sprite as never);
      break;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// LOT CROSS-FILE (ordre de lot — DETTE placement, cf. bannière de section) :
// battle_anim_rock.c / battle_anim_effects_2.c / battle_anim_psychic.c /
// battle_anim_dark.c.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimRaiseSprite` (battle_anim_rock.c:571) : rocher d'Ancient Power qui
 *  s'élève depuis l'attaquant. args [x, y, dyFin, durée, animNum]. */
function AnimRaiseSprite(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0, 0, 0, 0];
  _StartSpriteAnim(sprite, args[4] | 0);
  InitSpritePosToAnimAttacker(sprite as never, false);
  sprite.data[0] = args[3] | 0;
  sprite.data[2] = sprite.x;
  sprite.data[4] = sprite.y + (args[2] | 0);
  sprite.invisible = false;
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSprite as never);
}

/** 1:1 `AnimViceGripPincer` (battle_anim_effects_2.c:1903) : une pince qui
 *  converge en diagonale vers le centre de la cible (anim 1 = pince basse).
 *  arg0 = quelle pince. */
function AnimViceGripPincer(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const tgt = _vItf().getTarget?.() ?? 1;
  let startXOffset = 32;
  let startYOffset = -32;
  let endXOffset = 16;
  let endYOffset = -16;
  if (args[0] | 0) {
    startXOffset = -32;
    startYOffset = 32;
    endXOffset = -16;
    endYOffset = 16;
    _StartSpriteAnim(sprite, 1);
  }
  sprite.x += startXOffset;
  sprite.y += startYOffset;
  sprite.data[0] = 6;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) + endXOffset;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + endYOffset;
  sprite.invisible = false;
  sprite.callback = StartAnimLinearTranslation as never;
  StoreSpriteCallbackInData6(sprite as never, AnimViceGripPincer_Step as never);
}
/** 1:1 `AnimViceGripPincer_Step` (:1927) : destroy à la fin de l'anim de frames. */
function AnimViceGripPincer_Step(sprite: _VSprite): void {
  if (sprite.animEnded) _DestroyAnimSprite(sprite);
}

/** 1:1 `AnimGuillotinePincer` (battle_anim_effects_2.c:1935) : pince qui entre
 *  vers le centre de la cible, vibre 51 frames (pince fermée, anim figée
 *  SeekSpriteAnim+animPaused), puis ressort en sens inverse. arg0 = animId. */
function AnimGuillotinePincer(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0];
  const tgt = _vItf().getTarget?.() ?? 1;
  let startXOffset = 32;
  let startYOffset = -32;
  let endXOffset = 16;
  let endYOffset = -16;
  if (args[0] | 0) {
    startXOffset = -32;
    startYOffset = 32;
    endXOffset = -16;
    endYOffset = 16;
    _StartSpriteAnim(sprite, args[0] | 0);
  }
  sprite.x += startXOffset;
  sprite.y += startYOffset;
  sprite.data[0] = 6;
  sprite.data[1] = sprite.x;
  sprite.data[2] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2) + endXOffset;
  sprite.data[3] = sprite.y;
  sprite.data[4] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + endYOffset;
  InitAnimLinearTranslation(sprite as never);
  sprite.data[5] = args[0] | 0;
  sprite.data[6] = sprite.data[0];
  sprite.invisible = false;
  sprite.callback = AnimGuillotinePincer_Step1;
}
/** 1:1 `AnimGuillotinePincer_Step1` (:1963) : fin de translation + fin d'anim →
 *  fige l'anim (SeekSpriteAnim(0) + animPaused), inverse les deltas (XOR du bit
 *  de signe data[1]/data[2]) → _Step2. */
function AnimGuillotinePincer_Step1(sprite: _VSprite): void {
  if (AnimTranslateLinear(sprite as never) && sprite.animEnded) {
    const rt = (globalThis as Record<string, unknown>).__rt;
    if (rt) SeekSpriteAnim(rt as never, sprite as never, 0);
    (sprite as { animPaused?: boolean }).animPaused = true;
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.x2 = 2;
    sprite.y2 = -2;
    sprite.data[0] = sprite.data[6];
    sprite.data[1] ^= 1;
    sprite.data[2] ^= 1;
    sprite.data[4] = 0;
    sprite.data[3] = 0;
    sprite.callback = AnimGuillotinePincer_Step2;
  }
}
/** 1:1 `AnimGuillotinePincer_Step2` (:1982) : vibration ±(2,-2) pendant 51
 *  frames puis relance l'anim (animNum^1) et ressort (_Step3). */
function AnimGuillotinePincer_Step2(sprite: _VSprite): void {
  if (sprite.data[3]) {
    sprite.x2 = -sprite.x2;
    sprite.y2 = -sprite.y2;
  }
  sprite.data[3] ^= 1;
  if (++sprite.data[4] === 51) {
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.data[4] = 0;
    sprite.data[3] = 0;
    (sprite as { animPaused?: boolean }).animPaused = false;
    _StartSpriteAnim(sprite, sprite.data[5] ^ 1);
    sprite.callback = AnimGuillotinePincer_Step3;
  }
}
/** 1:1 `AnimGuillotinePincer_Step3` (:2003) : translation retour → destroy. */
function AnimGuillotinePincer_Step3(sprite: _VSprite): void {
  if (AnimTranslateLinear(sprite as never)) _DestroyAnimSprite(sprite);
}

/** 1:1 `AnimPencil` (battle_anim_effects_2.c:2480) : le crayon de Sketch —
 *  flicker-in, monte le long du mon (hauteur pic) en zigzag x2 ±31, SE
 *  périodique, flicker-out. (d6 = pan C BattleAnimAdjustPanning(SOUND_PAN_TARGET),
 *  ignoré par le wrapper SE runtime.) */
function AnimPencil(sprite: _VSprite): void {
  const tgt = _vItf().getTarget?.() ?? 1;
  sprite.x = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X) - 16;
  sprite.y = _GetBattlerYCoordWithElevation(tgt) + 16;
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = 0;
  sprite.data[3] = 16;
  sprite.data[4] = 0;
  sprite.data[5] = _GetBattlerSpriteCoordAttr(tgt, BATTLER_COORD_ATTR_HEIGHT) + 2;
  sprite.data[6] = SOUND_PAN_TARGET; // BattleAnimAdjustPanning(SOUND_PAN_TARGET)
  sprite.invisible = false;
  sprite.callback = AnimPencil_Step;
}
/** 1:1 `AnimPencil_Step` (:2494). */
function AnimPencil_Step(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (++sprite.data[2] > 1) {
        sprite.data[2] = 0;
        sprite.invisible = !sprite.invisible;
      }
      if (++sprite.data[1] > 16) {
        sprite.invisible = false;
        sprite.data[0]++;
      }
      break;
    case 1:
      if (++sprite.data[1] > 3 && sprite.data[2] < sprite.data[5]) {
        sprite.data[1] = 0;
        sprite.y -= 1;
        sprite.data[2]++;
        if (sprite.data[2] % 10 === 0) _PlaySE12WithPanning(SE_M_SKETCH, sprite.data[6]);
      }
      sprite.data[4] += sprite.data[3];
      if (sprite.data[4] > 31) {
        sprite.data[4] = 0x40 - sprite.data[4];
        sprite.data[3] *= -1;
      } else if (sprite.data[4] <= -32) {
        sprite.data[4] = -0x40 - sprite.data[4];
        sprite.data[3] *= -1;
      }
      sprite.x2 = sprite.data[4];
      if (sprite.data[5] === sprite.data[2]) {
        sprite.data[1] = 0;
        sprite.data[2] = 0;
        sprite.data[0]++;
      }
      break;
    case 2:
      if (++sprite.data[2] > 1) {
        sprite.data[2] = 0;
        sprite.invisible = !sprite.invisible;
      }
      if (++sprite.data[1] > 16) {
        sprite.invisible = false;
        _DestroyAnimSprite(sprite);
      }
      break;
  }
}

/** 1:1 `AnimRedX_Step` (battle_anim_psychic.c:839) : visible data[0]-10 frames
 *  puis flicker, destroy à data[0]. */
function AnimRedX_Step(sprite: _VSprite): void {
  if (sprite.data[1] > sprite.data[0] - 10)
    sprite.invisible = (sprite.data[1] & 1) !== 0;
  if (sprite.data[1] === sprite.data[0]) _DestroyAnimSprite(sprite);
  sprite.data[1]++;
}
/** 1:1 `AnimRedX` (battle_anim_psychic.c:850) : le X rouge sur l'attaquant
 *  (arg0=ANIM_ATTACKER) ou à la position posée par createsprite. arg1 = durée. */
function AnimRedX(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  if ((args[0] | 0) === 0 /* ANIM_ATTACKER */) {
    sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
    sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  }
  sprite.data[0] = args[1] | 0;
  sprite.invisible = false;
  sprite.callback = AnimRedX_Step;
}

/** 1:1 `AnimTearDrop` (battle_anim_dark.c:354) : la larme de Fake Tears — part
 *  d'un coin du mon (args [ancre, type 0-3]) et tombe en petit arc (-12).
 *  tileNum += 4 = frame larme ; types 2/3 = côté gauche (affine 1 = flip). */
function AnimTearDrop(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  const battler = (args[0] | 0) === 0 /* ANIM_ATTACKER */
    ? (_vItf().getAttacker?.() ?? 0)
    : (_vItf().getTarget?.() ?? 1);
  let xOffset = 20; // s8
  _oamTileBump(sprite, 4);
  switch (args[1] | 0) {
    case 0:
      sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_RIGHT) - 8;
      sprite.y = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_TOP) + 8;
      break;
    case 1:
      sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_RIGHT) - 14;
      sprite.y = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_TOP) + 16;
      break;
    case 2:
      sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_LEFT) + 8;
      sprite.y = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_TOP) + 8;
      _StartSpriteAffineAnim(sprite, 1);
      xOffset = -20;
      break;
    case 3:
      sprite.x = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_LEFT) + 14;
      sprite.y = _GetBattlerSpriteCoordAttr(battler, BATTLER_COORD_ATTR_TOP) + 16;
      _StartSpriteAffineAnim(sprite, 1);
      xOffset = -20;
      break;
  }
  sprite.data[0] = 32;
  sprite.data[2] = sprite.x + xOffset;
  sprite.data[4] = sprite.y + 12;
  sprite.data[5] = -12;
  InitAnimArcTranslation(sprite as never);
  sprite.invisible = false;
  sprite.callback = AnimTearDrop_Step;
}
/** 1:1 `AnimTearDrop_Step` (battle_anim_dark.c:402). */
function AnimTearDrop_Step(sprite: _VSprite): void {
  if (TranslateAnimHorizontalArc(sprite as never)) DestroySpriteAndMatrix(sprite as never);
}

// ─── Enregistrement par NOM C EXACT (résolution createsprite via le bridge) ──
registerAnimCallbacks({
  AnimBlackSmoke: AnimBlackSmoke as never,
  AnimWhiteHalo: AnimWhiteHalo as never,
  AnimTealAlert: AnimTealAlert as never,
  AnimMeanLookEye: AnimMeanLookEye as never,
  AnimSpikes: AnimSpikes as never,
  AnimClappingHand: AnimClappingHand as never,
  AnimClappingHand2: AnimClappingHand2 as never,
  AnimRapidSpin: AnimRapidSpin as never,
  AnimTriAttackTriangle: AnimTriAttackTriangle as never,
  AnimBatonPassPokeball: AnimBatonPassPokeball as never,
  AnimWishStar: AnimWishStar as never,
  AnimMiniTwinklingStar: AnimMiniTwinklingStar as never,
  AnimSweetScentPetal: AnimSweetScentPetal as never,
  AnimPainSplitProjectile: AnimPainSplitProjectile as never,
  AnimFlatterConfetti: AnimFlatterConfetti as never,
  AnimFlatterSpotlight: AnimFlatterSpotlight as never,
  AnimYawnCloud: AnimYawnCloud as never,
  AnimAssistPawprint: AnimAssistPawprint as never,
  AnimSmellingSaltsHand: AnimSmellingSaltsHand as never,
  AnimSmellingSaltExclamation: AnimSmellingSaltExclamation as never,
  AnimHelpingHandClap: AnimHelpingHandClap as never,
  AnimForesightMagnifyingGlass: AnimForesightMagnifyingGlass as never,
  AnimMeteorMashStar: AnimMeteorMashStar as never,
  AnimBlockX: AnimBlockX as never,
  AnimKnockOffStrike: AnimKnockOffStrike as never,
  AnimRecycle: AnimRecycle as never,
  AnimRaiseSprite: AnimRaiseSprite as never,
  AnimViceGripPincer: AnimViceGripPincer as never,
  AnimGuillotinePincer: AnimGuillotinePincer as never,
  AnimPencil: AnimPencil as never,
  AnimRedX: AnimRedX as never,
  AnimTearDrop: AnimTearDrop as never,
});

// ════════════════════════════════════════════════════════════════════════════
// VAGUE « orbes & étoiles » (goal 2026-06-11) — AnimSwallowBlueOrb (:2217),
// AnimGreenStar (+Step1/Step2/Callback, :2467-:2554), AnimReversalOrb (+_Step,
// :3140/:3150) — transcrits 1:1 depuis battle_anim_effects_3.c.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `SpriteCallbackDummy` (sprite.c) — no-op IDENTITAIRE : AnimGreenStar_Step2
 *  compare le pointeur de callback (`== SpriteCallbackDummy`). */
function _SpriteCallbackDummy(_sprite: _VSprite): void {}

/** 1:1 `AnimSwallowBlueOrb` (battle_anim_effects_3.c:2217) : l'orbe bleu
 *  d'Avale-Tout monte (vitesse 0x900 fixed-point, −96/frame) puis retombe ;
 *  destroy quand il repasse SOUS le Y_PIC_OFFSET de l'attaquant. */
function AnimSwallowBlueOrb(sprite: _VSprite): void {
  const atk = _vItf().getAttacker?.() ?? 0;
  switch (sprite.data[0]) {
    case 0:
      InitSpritePosToAnimAttacker(sprite as never, false);
      sprite.invisible = false;
      sprite.data[1] = 0x900;
      sprite.data[2] = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
      sprite.data[0]++;
      break;
    case 1:
      sprite.y2 -= sprite.data[1] >> 8;
      sprite.data[1] = _toS16(sprite.data[1] - 96);
      if (sprite.y + sprite.y2 > sprite.data[2]) _DestroyAnimSprite(sprite);
      break;
  }
}

/** 1:1 `AnimGreenStar` (battle_anim_effects_3.c:2467) : Croissance — 3 étoiles
 *  vertes (anims 0/1/2 de gGreenStarAnimTable) montent depuis le bas de
 *  l'attaquant (xOffset aléatoire −31..+31) ; les 2 spawnées
 *  (CreateSprite(gGreenStarSpriteTemplate)) démarrent INVISIBLES et sont
 *  révélées en différé par _Step1. args [durée, vitesse]. */
function AnimGreenStar(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  let xOffset = _rand2() & 0x3F; // xOffset = Random2(); xOffset &= 0x3F;
  if (xOffset > 31) xOffset = 32 - xOffset;

  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X) + xOffset;
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y) + 32;
  sprite.invisible = false;
  sprite.data[1] = args[0] | 0;
  sprite.data[2] = args[1] | 0;

  // spriteId1/2 = CreateSprite(&gGreenStarSpriteTemplate, x, y, subpriority + 1);
  const tpl = lookupAnimTemplate('gGreenStarSpriteTemplate');
  const sub = (sprite.subpriority ?? 0) + 1;
  const spriteId1 = tpl ? _CreateSpriteFromTemplate(tpl as never, sprite.x, sprite.y, sub) : -1;
  const spriteId2 = tpl ? _CreateSpriteFromTemplate(tpl as never, sprite.x, sprite.y, sub) : -1;
  const s1 = spriteId1 >= 0 ? _grt().gSprites?.get(spriteId1) : undefined;
  const s2 = spriteId2 >= 0 ? _grt().gSprites?.get(spriteId2) : undefined;
  if (s1) {
    s1.data = s1.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
    _StartSpriteAnim(s1, 1);
    s1.data[1] = args[0] | 0;
    s1.data[2] = args[1] | 0;
    s1.data[7] = -1;
    s1.invisible = true;
    s1.callback = _AnimGreenStar_Callback;
  }
  if (s2) {
    s2.data = s2.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
    _StartSpriteAnim(s2, 2);
    s2.data[1] = args[0] | 0;
    s2.data[2] = args[1] | 0;
    s2.data[7] = -1;
    s2.invisible = true;
    s2.callback = _AnimGreenStar_Callback;
  }

  sprite.data[6] = spriteId1;
  sprite.data[7] = spriteId2;
  sprite.callback = _AnimGreenStar_Step1;
}

/** 1:1 `AnimGreenStar_Step1` (:2504) : montée fixed-point (delta s16 >> 8) ;
 *  révèle l'étoile 2 à y2<−8 et la 3 à y2<−16 ; après data[1] frames →
 *  invisible + _Step2 (attente des spawnées). */
function _AnimGreenStar_Step1(sprite: _VSprite): void {
  const delta = _toS16(sprite.data[3] + sprite.data[2]); // s16 delta = data[3] + data[2];
  sprite.y2 -= delta >> 8;
  sprite.data[3] = (sprite.data[3] + sprite.data[2]) & 0xFF;
  if (sprite.data[4] === 0 && sprite.y2 < -8) {
    const s1 = sprite.data[6] >= 0 ? _grt().gSprites?.get(sprite.data[6]) : undefined;
    if (s1) s1.invisible = false; // gSprites[data[6]].invisible = FALSE
    sprite.data[4]++;
  }

  if (sprite.data[4] === 1 && sprite.y2 < -16) {
    const s2 = sprite.data[7] >= 0 ? _grt().gSprites?.get(sprite.data[7]) : undefined;
    if (s2) s2.invisible = false; // gSprites[data[7]].invisible = FALSE
    sprite.data[4]++;
  }

  if (--sprite.data[1] === -1) {
    sprite.invisible = true;
    sprite.callback = _AnimGreenStar_Step2;
  }
}

/** 1:1 `AnimGreenStar_Step2` (:2529) : quand les 2 spawnées ont fini (callback
 *  == SpriteCallbackDummy) → DestroySprite (raw ×2, elles ne comptent pas dans
 *  gAnimVisualTaskCount) + DestroyAnimSprite. Garde anti soft-lock : sprite
 *  absent de la map (création manquée) = considéré fini. */
function _AnimGreenStar_Step2(sprite: _VSprite): void {
  const s1 = sprite.data[6] >= 0 ? _grt().gSprites?.get(sprite.data[6]) : undefined;
  const s2 = sprite.data[7] >= 0 ? _grt().gSprites?.get(sprite.data[7]) : undefined;
  const done1 = !s1 || s1.callback === _SpriteCallbackDummy;
  const done2 = !s2 || s2.callback === _SpriteCallbackDummy;
  if (done1 && done2) {
    if (s1) _grt().DestroySprite?.(sprite.data[6]);
    if (s2) _grt().DestroySprite?.(sprite.data[7]);
    _DestroyAnimSprite(sprite);
  }
}

/** 1:1 `AnimGreenStar_Callback` (:2540) : même montée que _Step1 pour les
 *  étoiles spawnées (gelées tant qu'invisibles) ; après data[1] frames →
 *  invisible + SpriteCallbackDummy (signal de fin pour _Step2). */
function _AnimGreenStar_Callback(sprite: _VSprite): void {
  if (!sprite.invisible) {
    const delta = _toS16(sprite.data[3] + sprite.data[2]); // s16 delta
    sprite.y2 -= delta >> 8;
    sprite.data[3] = (sprite.data[3] + sprite.data[2]) & 0xFF;
    if (--sprite.data[1] === -1) {
      sprite.invisible = true;
      sprite.callback = _SpriteCallbackDummy;
    }
  }
}

/** 1:1 `AnimReversalOrb` (battle_anim_effects_3.c:3140) : l'orbe de Renversement
 *  tournoie autour de l'attaquant, rayon X/Y qui grandit puis rétrécit.
 *  args [durée (par phase), offset d'onde initial]. */
function AnimReversalOrb(sprite: _VSprite): void {
  const args = _vItf().getArgs?.() ?? [0, 0];
  const atk = _vItf().getAttacker?.() ?? 0;
  sprite.x = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  sprite.y = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.invisible = false;
  sprite.data[0] = args[0] | 0;
  sprite.data[1] = args[1] | 0;
  sprite.callback = _AnimReversalOrb_Step;
  _AnimReversalOrb_Step(sprite); // sprite->callback(sprite);
}

/** 1:1 `AnimReversalOrb_Step` (:3150) : orbite Sin/Cos (rayons data[2..3] >> 8),
 *  sous-priorité ±1 selon la phase (orbe devant/derrière le mon) ; rayons
 *  +0x400/+0x100 par frame pendant data[0] frames puis décroissent → destroy. */
function _AnimReversalOrb_Step(sprite: _VSprite): void {
  sprite.x2 = Sin(sprite.data[1] & 0xFF, sprite.data[2] >> 8);
  sprite.y2 = Cos(sprite.data[1] & 0xFF, sprite.data[3] >> 8);
  sprite.data[1] = (sprite.data[1] + 9) & 0xFF;
  const atk = _vItf().getAttacker?.() ?? 0;

  if ((sprite.data[1] & 0xFFFF) < 64 || sprite.data[1] > 195) // (u16)data[1] < 64 || data[1] > 195
    sprite.subpriority = _GetBattlerSpriteSubpriority(atk) - 1;
  else
    sprite.subpriority = _GetBattlerSpriteSubpriority(atk) + 1;

  if (!sprite.data[5]) {
    sprite.data[2] = _toS16(sprite.data[2] + 0x400);
    sprite.data[3] = _toS16(sprite.data[3] + 0x100);
    sprite.data[4]++;
    if (sprite.data[4] === sprite.data[0]) {
      sprite.data[4] = 0;
      sprite.data[5] = 1;
    }
  } else if (sprite.data[5] === 1) {
    sprite.data[2] = _toS16(sprite.data[2] - 0x400);
    sprite.data[3] = _toS16(sprite.data[3] - 0x100);
    sprite.data[4]++;
    if (sprite.data[4] === sprite.data[0]) _DestroyAnimSprite(sprite);
  }
}

registerAnimCallbacks({
  AnimSwallowBlueOrb: AnimSwallowBlueOrb as never,
  AnimGreenStar: AnimGreenStar as never,
  AnimReversalOrb: AnimReversalOrb as never,
});

// ════════════════════════════════════════════════════════════════════════════
// SPOTLIGHT (2026-06-11, append-only) — AnimSpotlight (+_Step1/_Step2,
// battle_anim_effects_3.c:1541/:1557/:1599) : même mécanique fenêtre OBJ que
// AnimFlatterSpotlight plus haut (les valeurs WINOUT 0x1F3F / 0x3F3F des deux
// fonctions C sont identiques → réutilise WINOUT_FLATTER_ON/OFF).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `AnimSpotlight` (battle_anim_effects_3.c:1541) : cône de Spotlight en
 *  OBJ_WINDOW posé sur la cible — ouvre (affine 0), balaye droite 21f / gauche
 *  41f / droite 21f, ferme (affine 1), restore WINOUT/DISPCNT. */
function AnimSpotlight(sprite: _VSprite): void {
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_WINOUT, WINOUT_FLATTER_ON); // WINOUT_WIN01_BG_ALL|WIN01_OBJ|WIN01_CLR|WINOBJ_BG_ALL|WINOBJ_OBJ
  rt.SetGpuReg?.(REG_OFFSET_DISPCNT, (rt.GetGpuReg?.(REG_OFFSET_DISPCNT) ?? 0) | DISPCNT_OBJWIN_ON); // SetGpuRegBits
  _setBattleWinReg('gBattle_WIN0H', 0);
  _setBattleWinReg('gBattle_WIN0V', 0);
  rt.SetGpuReg?.(REG_OFFSET_WIN0H, 0);
  rt.SetGpuReg?.(REG_OFFSET_WIN0V, 0);
  InitSpritePosToAnimTarget(sprite as never, false);
  (sprite as { objMode?: number }).objMode = 2; // sprite->oam.objMode = ST_OAM_OBJ_WINDOW
  sprite.invisible = true; // 1:1 décomp (révélé par _Step1 case 0)
  sprite.callback = AnimSpotlight_Step1;
}

/** 1:1 `AnimSpotlight_Step1` (:1557) : machine à états data[0] — 0 ouverture
 *  (attend l'affine), 1/3 balayage droite (data[1] += 117, 8.8) 21 frames,
 *  2 balayage gauche 41 frames, 4 fermeture (affine 1), 5 attente → _Step2. */
function AnimSpotlight_Step1(sprite: _VSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.invisible = false;
      if (sprite.affineAnimEnded) sprite.data[0]++;
      break;
    case 1:
    case 3:
      sprite.data[1] += 117;
      sprite.x2 = sprite.data[1] >> 8;
      if (++sprite.data[2] === 21) {
        sprite.data[2] = 0;
        sprite.data[0]++;
      }
      break;
    case 2:
      sprite.data[1] -= 117;
      sprite.x2 = sprite.data[1] >> 8;
      if (++sprite.data[2] === 41) {
        sprite.data[2] = 0;
        sprite.data[0]++;
      }
      break;
    case 4:
      _StartSpriteAffineAnim(sprite, 1); // ChangeSpriteAffineAnim(sprite, 1)
      sprite.data[0]++;
      break;
    case 5:
      if (sprite.affineAnimEnded) {
        sprite.invisible = true;
        sprite.callback = AnimSpotlight_Step2;
      }
      break;
  }
}

/** 1:1 `AnimSpotlight_Step2` (:1599) : restore WINOUT (+ WINOBJ_CLR) et
 *  DISPCNT ^= OBJWIN_ON, puis destroy. */
function AnimSpotlight_Step2(sprite: _VSprite): void {
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_WINOUT, WINOUT_FLATTER_OFF);
  rt.SetGpuReg?.(REG_OFFSET_DISPCNT, (rt.GetGpuReg?.(REG_OFFSET_DISPCNT) ?? 0) ^ DISPCNT_OBJWIN_ON);
  _DestroyAnimSprite(sprite);
}

registerAnimCallbacks({ AnimSpotlight: AnimSpotlight as never });

// ════════════════════════════════════════════════════════════════════════════
// AnimLetterZ (battle_anim_effects_3.c:1477) — le « Z » de Snore/repos
// (gLetterZSpriteTemplate, ANIM_TAG_LETTER_Z, tables anims+affine du généré).
// Append-only 2026-06-11.
// ════════════════════════════════════════════════════════════════════════════
// Import additionnel du bloc (hoisté ESM — légal en fin de fichier) :
import { SetAnimSpriteInitialXOffset as _zSetAnimSpriteInitialXOffset } from './battle_anim_mons';

/** 1:1 `AnimLetterZ` (battle_anim_effects_3.c:1477) : le Z part de l'attaquant
 *  (offset X args[0]) et dérive (args[2]/2, args[3]/2 par frame — miroir X/Y
 *  côté adverse) avec flottement Sin(data[0]*20, 5) ; destroy à la sortie
 *  droite d'écran ((u16)(x+x2) > 240). data[0] = latch d'init ET compteur. */
function AnimLetterZ(sprite: _VSprite): void {
  if (sprite.data[0] === 0) {
    const args = _vItf().getArgs?.() ?? [0, 0, 0, 0];
    SetSpriteCoordsToAnimAttackerCoords(sprite as never);
    _zSetAnimSpriteInitialXOffset(sprite as never, args[0] | 0);
    // !IsContest() → vrai (doctrine repo : pas de concours web).
    if (_side(_vItf().getAttacker?.() ?? 0) === 0 /* B_SIDE_PLAYER */) {
      sprite.data[1] = args[2] | 0;
      sprite.data[2] = args[3] | 0;
    } else {
      sprite.data[1] = -1 * (args[2] | 0);
      sprite.data[2] = -1 * (args[3] | 0);
    }
    sprite.invisible = false;
  }

  sprite.data[0]++;
  const var0 = (sprite.data[0] * 20) & 0xFF;
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 = Math.trunc(sprite.data[3] / 2); // division C tronquée (s16)
  sprite.y2 = Sin(var0 & 0xFF, 5) + Math.trunc(sprite.data[4] / 2);

  if (((sprite.x + sprite.x2) & 0xFFFF) > DISPLAY_WIDTH) // cast (u16) 1:1
    _DestroyAnimSprite(sprite);
}

registerAnimCallbacks({ AnimLetterZ: AnimLetterZ as never });

// ─── VAGUE F1 : AnimTask_IsTargetPlayerSide (effects_3.c:1521) ──────────────
function _e3ItfB(): { getArgs?: () => number[]; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimTask_IsTargetPlayerSide(task: { taskId: number }): void {
  const itf = _e3ItfB();
  const args = itf.getArgs?.();
  if (args) args[7] = ((itf.getTarget?.() ?? 1) & 1) === 0 ? 1 : 0; // player side = TRUE
  itf.DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _e3RegTasks } from '../engine/battle/battle-anim-registry';
_e3RegTasks({ AnimTask_IsTargetPlayerSide: AnimTask_IsTargetPlayerSide as never });

// ─── VAGUE F4 : AnimTask_PainSplitMovement (effects_3.c, 6 hits) ────────────
// Le mon se déforme (rot-scale écrasé) + tremble x2 ±2 pendant 13 frames.
import {
  PrepareBattlerSpriteForRotScale as _psPrep, SetSpriteRotScale as _psSet,
  ResetSpriteRotScale as _psReset, SetBattlerSpriteYOffsetFromYScale as _psYOff,
} from './battle_anim_mons';
function AnimTask_PainSplitMovement(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number; y2: number }> } | undefined;
  if (task.data[0] === 0) {
    const b = a[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
    task.data[11] = b;
    const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
    const spriteId = co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
    if (spriteId === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
    task.data[10] = spriteId;
    _psPrep(spriteId, 0);
    const sp = rt?.gSprites?.get(spriteId);
    switch (a[1]) {
      case 0:
        _psSet(spriteId, 0xE0, 0x140, 0);
        _psYOff(spriteId);
        break;
      case 1:
        _psSet(spriteId, 0xD0, 0x130, 0xF00);
        _psYOff(spriteId);
        if ((b & 1) === 0 && sp) sp.y2 += 16;
        break;
      case 2:
        _psSet(spriteId, 0xD0, 0x130, 0xF100);
        _psYOff(spriteId);
        if ((b & 1) === 0 && sp) sp.y2 += 16;
        break;
    }
    if (sp) sp.x2 = 2;
    task.data[0]++;
  } else {
    const sp = rt?.gSprites?.get(task.data[10]);
    if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
    if (++task.data[2] === 3) {
      task.data[2] = 0;
      sp.x2 = -sp.x2;
    }
    if (++task.data[1] === 13) {
      _psReset(task.data[10]);
      sp.x2 = 0;
      sp.y2 = 0;
      itf.DestroyAnimVisualTask?.(task.taskId);
    }
  }
}
/** 1:1 `AnimTask_RockMonBackAndForth` (effects_3.c, 4 hits) : balancement
 *  rot-scale (x2 ± data[5], rotation ± data[4]) x N répétitions. */
function AnimTask_RockMonBackAndForth(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  if (!a[1]) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  if (a[2] < 0) a[2] = 0;
  if (a[2] > 2) a[2] = 2;
  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = 0;
  task.data[3] = 8 - 2 * a[2];
  task.data[4] = 0x100 + a[2] * 128;
  task.data[5] = a[2] + 2;
  task.data[6] = a[1] - 1;
  const b = a[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  task.data[15] = co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
  if (task.data[15] === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  if ((b & 1) === 1) { task.data[4] *= -1; task.data[5] *= -1; }
  _psPrep(task.data[15], 0);
  task.func = _RockMonBF_Step;
}
function _RockMonBF_Step(task: { taskId: number; data: number[] }): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[15]);
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const rot = (): void => {
    _psSet(task.data[15], 0x100, 0x100, task.data[2] & 0xFFFF);
    _psYOff(task.data[15]);
  };
  switch (task.data[0]) {
    case 0:
      sp.x2 += task.data[5];
      task.data[2] -= task.data[4];
      rot();
      if (++task.data[1] >= task.data[3]) { task.data[1] = 0; task.data[0]++; }
      break;
    case 1:
      sp.x2 -= task.data[5];
      task.data[2] += task.data[4];
      rot();
      if (++task.data[1] >= task.data[3] * 2) { task.data[1] = 0; task.data[0]++; }
      break;
    case 2:
      sp.x2 += task.data[5];
      task.data[2] -= task.data[4];
      rot();
      if (++task.data[1] >= task.data[3]) {
        if (task.data[6]) { task.data[6]--; task.data[1] = 0; task.data[0] = 0; }
        else task.data[0]++;
      }
      break;
    case 3:
      _psReset(task.data[15]);
      itf.DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 `AnimTask_SetPsychicBackground` (effects_3.c:1372, 14 hits) : task de
 *  FOND (gAnimVisualTaskCount-- à l'init — ne bloque pas les waits) qui fait
 *  onduler la palette BG (rotation slots 1-11 toutes les 4 frames) jusqu'au
 *  sentinel args[7]==0xFFFF (posé par UnsetPsychicBackground). Le VRAI fond
 *  psy (fadetobg BG_PSYCHIC) = chantier BG — en attendant, l'ondulation
 *  s'applique au décor existant (paletteIndex BG3=2 net). */
function AnimTask_SetPsychicBackground(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { decVisualTaskCount?: () => void };
  itf.decVisualTaskCount?.();
  task.func = _PsychicBg_Step;
}
function _PsychicBg_Step(task: { taskId: number; data: number[] }): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void }; DestroyTask?: (id: number) => void } | undefined;
  const pf = rt?.gPlttBufferFaded;
  if (++task.data[5] === 4) {
    task.data[5] = 0;
    if (pf?.get && pf.set) {
      const base = 2 * 16; // GetBattleBgPaletteNum net : palette BG du terrain (slot 2)
      const last = pf.get(base + 11);
      for (let i = 10; i > 0; i--) pf.set(base + i + 1, pf.get(base + i));
      pf.set(base + 1, last);
    }
  }
  const args = (_e3ItfB() as { getArgs?: () => number[] }).getArgs?.() ?? [];
  if ((args[7] & 0xFFFF) === 0xFFFF) rt?.DestroyTask?.(task.taskId);
}
/** 1:1 `AnimTask_DefenseCurlDeformMon` (effects_3.c, 1 hit) : boule affine. */
import {
  PrepareAffineAnimInTaskData as _dcPrep, RunAffineAnimFromTaskData as _dcRun,
} from './battle_anim_mons';
import { BATTLE_ANIM_AFFINE_ANIMS as _dcTables } from '../engine/decomp-data/auto/src/battle-anim-sprites';
function AnimTask_DefenseCurlDeformMon(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  switch (task.data[0]) {
    case 0: {
      const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
      const sid = co?.getBattlerMonSpriteId?.(itf.getAttacker?.() ?? 0) ?? 0xFF;
      if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
      _dcPrep(task as never, sid, (_dcTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['DefenseCurlDeformMonAffineAnimCmds']);
      task.data[0]++;
      break;
    }
    case 1:
      if (!_dcRun(task as never)) itf.DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 `AnimTask_OdorSleuthMovement` (effects_3.c, 1 hit) : 2 clones de la
 *  cible oscillent en Cos (amplitude décroissante après 60f) en clignotant. */
import { CloneBattlerSpriteWithBlend as _osClone, DestroySpriteWithActiveSheet as _osDestroy } from './battle_anim_mons';
import { Cos as _osCos } from './trig';
function AnimTask_OdorSleuthMovement(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  const id1 = _osClone(1);
  if (id1 < 0) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const id2 = _osClone(1);
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number; data: number[]; callback: unknown; invisible?: boolean; oamIndex: number }>; gba?: { oam: Array<{ objMode: number }> } } | undefined;
  if (id2 < 0) {
    const s1 = rt?.gSprites?.get(id1);
    if (s1) _osDestroy(s1);
    itf.DestroyAnimVisualTask?.(task.taskId);
    return;
  }
  const s1 = rt?.gSprites?.get(id1);
  const s2 = rt?.gSprites?.get(id2);
  if (!s1 || !s2) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  s2.x2 += 24; s1.x2 -= 24;
  for (const [sp, d3, d4] of [[s2, 16, 0], [s1, -16, 128]] as Array<[typeof s1, number, number]>) {
    sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
    sp.data[0] = 0; sp.data[1] = 0; sp.data[2] = 0;
    sp.data[3] = d3; sp.data[4] = d4; sp.data[5] = 24;
    sp.data[6] = task.taskId; sp.data[7] = 0;
    const oam = rt?.gba?.oam[sp.oamIndex];
    if (oam) oam.objMode = 0;
    sp.callback = _MoveOdorSleuthClone;
  }
  s2.invisible = false;
  s1.invisible = true;
  task.data[0] = 2;
  task.func = _OdorSleuthWait;
}
function _OdorSleuthWait(task: { taskId: number; data: number[] }): void {
  if (task.data[0] === 0) (_e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void }).DestroyAnimVisualTask?.(task.taskId);
}
function _MoveOdorSleuthClone(sprite: { data: number[]; x2: number; invisible?: boolean }): void {
  if (++sprite.data[1] > 1) {
    sprite.data[1] = 0;
    sprite.invisible = !sprite.invisible;
  }
  sprite.data[4] = (sprite.data[4] + sprite.data[3]) & 0xFF;
  sprite.x2 = _osCos(sprite.data[4], sprite.data[5]);
  switch (sprite.data[0]) {
    case 0:
      if (++sprite.data[2] === 60) { sprite.data[2] = 0; sprite.data[0]++; }
      break;
    case 1:
      if (++sprite.data[2] > 0) {
        sprite.data[2] = 0;
        sprite.data[5] -= 2;
        if (sprite.data[5] < 0) {
          const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }> } | undefined;
          const t = rt?.gTasks?.get(sprite.data[6]);
          if (t) t.data[sprite.data[7]]--;
          _osDestroy(sprite);
        }
      }
      break;
  }
}
/** 1:1 `AnimTask_TeeterDanceMovement` (effects_3.c, 1 hit — Danse-Folle) :
 *  le mon titube — x absolu en sinus lent (>>3) + wobble x2 rapide (>>5). */
function AnimTask_TeeterDanceMovement(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const atk = itf.getAttacker?.() ?? 0;
  const sid = co?.getBattlerMonSpriteId?.(atk) ?? 0xFF;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x: number; y: number }> } | undefined;
  const sp = sid !== 0xFF ? rt?.gSprites?.get(sid) : undefined;
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[3] = sid;
  task.data[4] = (atk & 1) === 0 ? 1 : -1;
  task.data[6] = sp.y;
  task.data[5] = sp.x;
  task.data[9] = 0;
  task.data[11] = 0;
  task.data[10] = 1;
  task.data[12] = 0;
  task.data[0] = 0;
  task.func = _TeeterDance_Step;
}
function _TeeterDance_Step(task: { taskId: number; data: number[] }): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x: number; x2: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[3]);
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  switch (task.data[0]) {
    case 0:
      task.data[11] = (task.data[11] + 8) & 0xFF;
      sp.x2 = _osSinTable(task.data[11]) >> 5;
      task.data[9] = (task.data[9] + 2) & 0xFF;
      sp.x = (_osSinTable(task.data[9]) >> 3) * task.data[4] + task.data[5];
      if (task.data[9] === 0) {
        sp.x = task.data[5];
        task.data[0]++;
      }
      break;
    case 1:
      task.data[11] = (task.data[11] + 8) & 0xFF;
      sp.x2 = _osSinTable(task.data[11]) >> 5;
      if (task.data[11] === 0) {
        sp.x2 = 0;
        task.data[0]++;
      }
      break;
    case 2:
      itf.DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
// gSineTable importee en tete de fichier (trig) — acces brut 1:1
function _osSinTable(i: number): number { return gSineTable[i & 0xFF] ?? 0; }
/** Factory 1:1 du pattern « deform affine attaquant » (Stockpile/SpitUp/
 *  Swallow — effects_3.c, 3×1 hits) : Prepare puis Run jusqu'à la fin. */
function _mkDeformTask(tableName: string): (task: { taskId: number; data: number[] }) => void {
  return (task) => {
    const itf = _e3ItfB() as { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void };
    if (!task.data[0]) {
      const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
      const sid = co?.getBattlerMonSpriteId?.(itf.getAttacker?.() ?? 0) ?? 0xFF;
      if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
      _dcPrep(task as never, sid, (_dcTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)[tableName]);
      task.data[0]++;
    } else {
      if (!_dcRun(task as never)) itf.DestroyAnimVisualTask?.(task.taskId);
    }
  };
}
/** 1:1 `AnimTask_SlackOffSquish` (effects_3.c:5514) : table affine + micro
 *  tremblement x2 ±1 sur les frames 17-39. */
function AnimTask_SlackOffSquish(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  const b = a[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
  if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = 0;
  task.data[15] = sid;
  _dcPrep(task as never, sid, (_dcTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gSlackOffSquishAffineAnimCmds']);
  task.func = _SlackOff_Step;
}
function _SlackOff_Step(task: { taskId: number; data: number[] }): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[15]);
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0]++;
  if (task.data[0] > 16 && task.data[0] < 40) {
    if (++task.data[1] > 2) {
      task.data[1] = 0;
      task.data[2]++;
      sp.x2 = (task.data[2] & 1) ? 1 : -1;
    }
  } else {
    sp.x2 = 0;
  }
  if (!_dcRun(task as never)) itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_FlailMovement` (effects_3.c:2845 — Fléau) : oscillation
 *  rotation ±data[14] décroissante (0x800→16) + x2 dérivé. */
function AnimTask_FlailMovement(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  const b = a[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
  if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = 0; task.data[1] = 0; task.data[2] = 0; task.data[3] = 0;
  task.data[12] = 0x20;
  task.data[13] = 0x40;
  task.data[14] = 0x800;
  task.data[15] = sid;
  _psPrep(sid, 0);
  task.func = _Flail_Step;
}
function _Flail_Step(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[15]);
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  switch (task.data[0]) {
    case 0:
      task.data[2] += 0x200;
      if (task.data[2] >= task.data[14]) {
        const diff = task.data[14] - task.data[2];
        const div = Math.trunc(diff / (task.data[14] * 2));
        const mod = diff % (task.data[14] * 2);
        if ((div & 1) === 0) { task.data[2] = task.data[14] - mod; task.data[0] = 1; }
        else task.data[2] = mod - task.data[14];
      }
      break;
    case 1:
      task.data[2] -= 0x200;
      if (task.data[2] <= -task.data[14]) {
        const diff = task.data[14] - task.data[2];
        const div = Math.trunc(diff / (task.data[14] * 2));
        const mod = diff % (task.data[14] * 2);
        if ((div & 1) === 0) { task.data[2] = mod - task.data[14]; task.data[0] = 0; }
        else task.data[2] = task.data[14] - mod;
      }
      break;
    case 2:
      _psReset(task.data[15]);
      itf.DestroyAnimVisualTask?.(task.taskId);
      return;
  }
  _psSet(task.data[15], 0x100, 0x100, task.data[2] & 0xFFFF);
  _psYOff(task.data[15]);
  const t = task.data[2];
  sp.x2 = -((t >= 0 ? t : t + 63) >> 6);
  if (++task.data[1] > 8) {
    if (task.data[12]) {
      task.data[12]--;
      task.data[14] -= task.data[13];
      if (task.data[14] < 16) task.data[14] = 16;
    } else {
      task.data[0] = 2;
    }
  }
}
/** 1:1 `gFacadeBlendColors` (effects_3.c:902) — les 24 RGB15 du cycle. */
const _gFacadeBlendColors = [1852, 5820, 8795, 11739, 15706, 18682, 21625, 25625, 23577, 20505, 16409, 13337, 10266, 6170, 3098, 27, 59, 187, 315, 411, 540, 636, 764, 893];
/** 1:1 `AnimTask_FacadeColorBlend` (effects_3.c:3875) : cycle 24 couleurs
 *  coeff 8 sur la palette OBJ du battler pendant args[1] frames. */
function AnimTask_FacadeColorBlend(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  task.data[0] = 0;
  task.data[1] = a[1];
  const b = a[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { oamIndex: number }>; gba?: { oam: Array<{ paletteBank: number }> } } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
  const sp = sid !== 0xFF ? rt?.gSprites?.get(sid) : undefined;
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[2] = 256 + (rt?.gba?.oam[sp.oamIndex]?.paletteBank ?? 0) * 16;
  task.func = _FacadeBlend_Step;
}
function _FacadeBlend_Step(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  if (task.data[1]) {
    _e3Blend(task.data[2], 16, 8, _gFacadeBlendColors[task.data[0]]);
    if (++task.data[0] > 23) task.data[0] = 0;
    task.data[1]--;
  } else {
    _e3Blend(task.data[2], 16, 0, 0);
    itf.DestroyAnimVisualTask?.(task.taskId);
  }
}
import { BlendPalette as _e3Blend } from '../engine/system/decomp-globals';
/** 1:1 `AnimTask_SmellingSaltsSquish` (effects_3.c:4307) : squish affine ×N
 *  avec tremblement x2 ±2. */
function AnimTask_SmellingSaltsSquish(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getArgs?: () => number[]; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  if (a[0] === 0) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(itf.getTarget?.() ?? 1) ?? 0xFF;
  if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = a[1];
  task.data[15] = sid;
  _dcPrep(task as never, sid, (_dcTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gSmellingSaltsSquishAffineAnimCmds']);
  task.func = _SmellingSalts_Step;
}
function _SmellingSalts_Step(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[15]);
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  if (++task.data[1] > 1) {
    task.data[1] = 0;
    sp.x2 = (task.data[2] & 1) ? -2 : 2;
  }
  if (!_dcRun(task as never)) {
    sp.x2 = 0;
    if (--task.data[0]) {
      _dcPrep(task as never, task.data[15], (_dcTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gSmellingSaltsSquishAffineAnimCmds']);
    } else {
      itf.DestroyAnimVisualTask?.(task.taskId);
    }
  }
}
/** 1:1 `AnimTask_SquishAndSweatDroplets` (effects_3.c:3742) : squish affine
 *  ×N + 2 salves de 4 gouttes de sueur (frames 6 et 18 de chaque squish). */
function AnimTask_SquishAndSweatDroplets(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const a = itf.getArgs?.() ?? [];
  if (!a[1]) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const b = a[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
  if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[0] = 0;             // tState
  task.data[1] = 0;             // tTimer
  task.data[2] = 0;             // tActiveSprites
  task.data[3] = a[1];          // tNumSquishes
  task.data[4] = _e3Coord(b, 0); // tBaseX
  task.data[5] = _e3Coord(b, 1); // tBaseY
  task.data[6] = 25;            // tSubpriority (net)
  task.data[7] = sid;           // tBattlerSpriteId
  _dcPrep(task as never, sid, (_dcTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gFacadeSquishAffineAnimCmds']);
  task.func = _SquishSweat_Step;
}
import { GetBattlerSpriteCoord as _e3Coord } from './battle_anim_mons';
function _SquishSweat_Step(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  switch (task.data[0]) {
    case 0:
      task.data[1]++;
      if (task.data[1] === 6) _CreateSweatDroplets(task, false);
      if (task.data[1] === 18) _CreateSweatDroplets(task, true);
      if (!_dcRun(task as never)) {
        if (--task.data[3] === 0) {
          task.data[0]++;
        } else {
          task.data[1] = 0;
          _dcPrep(task as never, task.data[7], (_dcTables as unknown as Record<string, import('./battle_anim_mons').TaskAffineTable>)['gFacadeSquishAffineAnimCmds']);
        }
      }
      break;
    case 1:
      if (task.data[2] === 0) itf.DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
function _CreateSweatDroplets(task: { taskId: number; data: number[] }, lower: boolean): void {
  const xOffset = lower ? 30 : 18;
  const yOffset = lower ? 20 : -20;
  const xs = [task.data[4] - xOffset, task.data[4] - xOffset - 4, task.data[4] + xOffset, task.data[4] + xOffset + 4];
  const ys = [task.data[5] + yOffset, task.data[5] + yOffset + 6];
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { data: number[]; callback: unknown; oamIndex: number }>; CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number; gba?: { oam: Array<{ tileId: number }> } } | undefined;
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
  const tpl = bridge?.lookupGeneratedTemplateTags?.('gFacadeSweatDropSpriteTemplate');
  const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
  for (let i = 0; i < 4; i++) {
    const sid = rt?.CreateSpriteInline?.({ oam: { shape: 0, size: 0, priority: 2 }, images: [] } as never, xs[i], ys[i & 1], 20) ?? -1;
    if (sid >= 0) {
      const sp = rt?.gSprites?.get(sid);
      const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
      if (oam && tileStart !== 0xFFFF) oam.tileId = tileStart;
      if (sp) {
        sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
        sp.data[0] = 0;            // sTimer
        sp.data[1] = i < 2 ? -2 : 2; // sVelocX
        sp.data[2] = -1;           // sVelocY
        sp.data[3] = task.taskId;  // sTaskId
        sp.data[4] = 2;            // sActiveSpritesIdx (data[2] de la task)
        sp.callback = _AnimSweatDrop;
        task.data[2]++;
      }
    }
  }
}
function _AnimSweatDrop(sprite: { data: number[]; x: number; y: number }): void {
  sprite.x += sprite.data[1];
  sprite.y += sprite.data[2];
  if (++sprite.data[0] > 6) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }>; gSprites?: Map<number, unknown>; DestroySprite?: (i: number) => void } | undefined;
    const t = rt?.gTasks?.get(sprite.data[3]);
    if (t) t.data[sprite.data[4]]--;
    for (const [sid, sp] of rt?.gSprites ?? new Map()) {
      if (sp === (sprite as unknown)) { rt?.DestroySprite?.(sid); break; }
    }
  }
}
/** 1:1 `AnimTask_HelpingHandAttackerMovement` (effects_3.c, 1 hit) :
 *  la chorégraphie 9 états du « tope-là » (claps x2 puis poussée). */
function AnimTask_HelpingHandAttackerMovement(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const atk = itf.getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(atk) ?? 0xFF;
  if (sid === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  task.data[15] = sid;
  task.data[14] = (atk & 1) === 0 ? -1 : 1; // single 1:1
  task.data[0] = 0; task.data[1] = 0; task.data[2] = 0;
  task.func = _HelpingHand_Step;
}
function _HelpingHand_Step(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number }> } | undefined;
  const sp = rt?.gSprites?.get(task.data[15]);
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] === 13) { task.data[1] = 0; task.data[0]++; }
      break;
    case 1:
      sp.x2 -= task.data[14] * 3;
      if (++task.data[1] === 6) { task.data[1] = 0; task.data[0]++; }
      break;
    case 2:
      sp.x2 += task.data[14] * 3;
      if (++task.data[1] === 6) { task.data[1] = 0; task.data[0]++; }
      break;
    case 3:
      if (++task.data[1] === 2) {
        task.data[1] = 0;
        if (task.data[2] === 0) { task.data[2]++; task.data[0] = 1; }
        else task.data[0]++;
      }
      break;
    case 4:
      sp.x2 += task.data[14];
      if (++task.data[1] === 3) { task.data[1] = 0; task.data[0]++; }
      break;
    case 5:
      if (++task.data[1] === 6) { task.data[1] = 0; task.data[0]++; }
      break;
    case 6:
      sp.x2 -= task.data[14] * 4;
      if (++task.data[1] === 5) { task.data[1] = 0; task.data[0]++; }
      break;
    case 7:
      sp.x2 += task.data[14] * 4;
      if (++task.data[1] === 5) { task.data[1] = 0; task.data[0]++; }
      break;
    case 8:
      sp.x2 = 0;
      itf.DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 `AnimTask_GlareEyeDots` (effects_3.c, 1 hit — Regard Noir/Glare) :
 *  12 paires de points le long de la ligne attaquant→cible (interp 8.8),
 *  chaque point vit 36f, offsets ±3 en diagonale. */
function AnimTask_GlareEyeDots(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _e3ItfB() as { getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const atk = itf.getAttacker?.() ?? 0;
  const tgt = itf.getTarget?.() ?? 1;
  task.data[0] = 0;  // tState
  task.data[1] = 0;  // tTimer
  task.data[2] = 0;  // tPairNum
  task.data[3] = 12; // tPairMax
  task.data[4] = 3;  // tDotOffset
  task.data[5] = 0;  // tActiveSprites
  const h4 = 16; // ATTR_HEIGHT/4 net (64/4)
  task.data[10] = _e3Coord(atk, 2) + ((atk & 1) === 0 ? h4 : -h4); // tStartX
  task.data[11] = _e3Coord(atk, 3) - h4;                            // tStartY
  task.data[12] = _e3Coord(tgt, 2);                                 // tEndX
  task.data[13] = _e3Coord(tgt, 3);                                 // tEndY
  task.func = _GlareEyeDots_Step;
}
function _GlareEyeDots_Step(task: { taskId: number; data: number[] }): void {
  const itf = _e3ItfB() as { DestroyAnimVisualTask?: (id: number) => void };
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 3) {
        task.data[1] = 0;
        const [x, y] = _GlareDotCoords(task.data[10], task.data[11], task.data[12], task.data[13], task.data[3], task.data[2]);
        const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { x2: number; y2: number; data: number[]; callback: unknown; oamIndex: number }>; CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number; gba?: { oam: Array<{ tileId: number }> } } | undefined;
        const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number } | undefined;
        const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
        const tpl = bridge?.lookupGeneratedTemplateTags?.('gGlareEyeDotSpriteTemplate');
        const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
        for (let i = 0; i < 2; i++) {
          const sid = rt?.CreateSpriteInline?.({ oam: { shape: 0, size: 0, priority: 2 }, images: [] } as never, x, y, 35) ?? -1;
          if (sid >= 0) {
            const sp = rt?.gSprites?.get(sid);
            const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
            if (oam && tileStart !== 0xFFFF) oam.tileId = tileStart;
            if (sp) {
              sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
              const off = i === 0 ? -task.data[4] : task.data[4];
              sp.x2 = off;
              sp.y2 = off;
              sp.data[0] = 0;            // sTimer
              sp.data[3] = task.taskId;  // sTaskId
              sp.data[4] = 5;            // sActiveSpritesIdx
              sp.callback = _AnimGlareEyeDot;
              task.data[5]++;
            }
          }
        }
        if (task.data[2] === task.data[3]) task.data[0]++;
        task.data[2]++;
      }
      break;
    case 1:
      if (task.data[5] === 0) itf.DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
function _GlareDotCoords(sx: number, sy: number, ex: number, ey: number, pairMax: number, pairNum: number): [number, number] {
  if (pairNum === 0) return [sx, sy];
  if (pairNum >= pairMax) return [ex, ey];
  const pm = pairMax - 1;
  const x2 = (sx << 8) + pairNum * Math.trunc(((ex - sx) << 8) / pm);
  const y2 = (sy << 8) + pairNum * Math.trunc(((ey - sy) << 8) / pm);
  return [x2 >> 8, y2 >> 8];
}
function _AnimGlareEyeDot(sprite: { data: number[] }): void {
  if (++sprite.data[0] > 36) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }>; gSprites?: Map<number, unknown>; DestroySprite?: (i: number) => void } | undefined;
    const t = rt?.gTasks?.get(sprite.data[3]);
    if (t) t.data[sprite.data[4]]--;
    for (const [sid, sp] of rt?.gSprites ?? new Map()) {
      if (sp === (sprite as unknown)) { rt?.DestroySprite?.(sid); break; }
    }
  }
}
_e3RegTasks({
  AnimTask_GlareEyeDots: AnimTask_GlareEyeDots as never,
  AnimTask_HelpingHandAttackerMovement: AnimTask_HelpingHandAttackerMovement as never,
  AnimTask_SquishAndSweatDroplets: AnimTask_SquishAndSweatDroplets as never,
  AnimTask_FacadeColorBlend: AnimTask_FacadeColorBlend as never,
  AnimTask_SmellingSaltsSquish: AnimTask_SmellingSaltsSquish as never,
  AnimTask_SlackOffSquish: AnimTask_SlackOffSquish as never,
  AnimTask_FlailMovement: AnimTask_FlailMovement as never,
  AnimTask_StockpileDeformMon: _mkDeformTask('gStockpileDeformMonAffineAnimCmds') as never,
  AnimTask_SpitUpDeformMon: _mkDeformTask('gSpitUpDeformMonAffineAnimCmds') as never,
  AnimTask_SwallowDeformMon: _mkDeformTask('gSwallowDeformMonAffineAnimCmds') as never,
  AnimTask_TeeterDanceMovement: AnimTask_TeeterDanceMovement as never,
  AnimTask_OdorSleuthMovement: AnimTask_OdorSleuthMovement as never,
  AnimTask_DefenseCurlDeformMon: AnimTask_DefenseCurlDeformMon as never,
  AnimTask_SetPsychicBackground: AnimTask_SetPsychicBackground as never,
  AnimTask_PainSplitMovement: AnimTask_PainSplitMovement as never,
  AnimTask_RockMonBackAndForth: AnimTask_RockMonBackAndForth as never,
});

// ─── VAGUE F34-SCANLINE : AcidArmor (effects_3.c:3296-3470) ─────────────────
// Le mon « fond » : scanlines compressées vers le bas (mode DMA 32-BIT = paire
// HOFS+VOFS entrelacée par scanline) + fondu BLDALPHA.
import {
  ScanlineEffect_SetParams as _aaSetParams,
  gScanlineEffectRegBuffers as _aaBufs,
  gScanlineEffect as _aaScan,
  SCANLINE_EFFECT_DMACNT_32BIT as _aaDma32,
  SCANLINE_EFFECT_REG_BG1HOFS as _aaRegBg1H,
  SCANLINE_EFFECT_REG_BG2HOFS as _aaRegBg2H,
  REG_OFFSET_BG0HOFS as _aaRegBase,
} from './scanline_effect';
import { GetBattlerSpriteBGPriorityRank as _aaBgRank } from './battle_anim_mons';

type _AaTask = { taskId: number; data: number[]; func?: unknown };
function _aaBgXY(rank: number): [number, number] {
  const g = globalThis as Record<string, unknown>;
  return rank === 1
    ? [((g.gBattle_BG1_X as number) | 0), ((g.gBattle_BG1_Y as number) | 0)]
    : [((g.gBattle_BG2_X as number) | 0), ((g.gBattle_BG2_Y as number) | 0)];
}

/** 1:1 `AnimTask_AcidArmor` (effects_3.c:3296). arg0 = ANIM_ATTACKER/TARGET. */
function AnimTask_AcidArmor(task: _AaTask): void {
  const itf = _vItf();
  const args = itf.getArgs?.() ?? [0];
  const battler = args[0] === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);

  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = 0;
  task.data[3] = 16;
  task.data[4] = 0;
  task.data[5] = battler;
  task.data[6] = 32;
  task.data[7] = 0;
  task.data[8] = 24;
  if (_side(battler) === 1 /* B_SIDE_OPPONENT */) task.data[8] *= -1;

  task.data[13] = _GetBattlerYCoordWithElevation(battler) - 34;
  if (task.data[13] < 0) task.data[13] = 0;
  task.data[14] = task.data[13] + 66;
  task.data[15] = _GetAnimBattlerSpriteId(args[0]);

  const rank = _aaBgRank(battler);
  let dmaDest: number;
  let bgX: number, bgY: number;
  const rt = _grt();
  if (rank === 1) {
    dmaDest = _aaRegBase + _aaRegBg1H;
    // BLDCNT_TGT2_ALL(0x3F00) | BLDCNT_EFFECT_BLEND(0x40) | BLDCNT_TGT1_BG1(0x02)
    rt.SetGpuReg?.(REG_OFFSET_BLDCNT, 0x3F42);
    [bgX, bgY] = _aaBgXY(1);
  } else {
    dmaDest = _aaRegBase + _aaRegBg2H;
    // BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND | BLDCNT_TGT1_BG2(0x04)
    rt.SetGpuReg?.(REG_OFFSET_BLDCNT, 0x3F44);
    [bgX, bgY] = _aaBgXY(2);
  }

  for (let y = 0, i = 0; y < 160; y++, i += 2) {
    _aaBufs[0][i] = bgX;
    _aaBufs[1][i] = bgX;
    _aaBufs[0][i + 1] = bgY;
    _aaBufs[1][i + 1] = bgY;
  }

  _aaSetParams({ dmaDest, dmaControl: _aaDma32, initState: 1, unused9: 0 });
  task.func = _AcidArmor_Step;
}

/** 1:1 `AnimTask_AcidArmor_Step` (effects_3.c:3358). */
function _AcidArmor_Step(task: _AaTask): void {
  const rank = _aaBgRank(task.data[5]);
  const [bgX, bgY] = _aaBgXY(rank);
  const rt = _grt();

  switch (task.data[0]) {
    case 0: {
      let offset = task.data[14] * 2;
      let var1 = 0;
      let var2 = 0;
      let i = 0;
      task.data[1] = (task.data[1] + 2) & 0xFF;
      let sineIndex = task.data[1];
      task.data[9] = Math.trunc(0x7E0 / task.data[6]);
      task.data[10] = -Math.trunc((task.data[7] * 2) / task.data[9]);
      task.data[11] = task.data[7];
      let var3 = task.data[11] >> 5;
      task.data[12] = var3;
      let var0 = task.data[14];
      const sBuf = _aaBufs[_aaScan.srcBuffer];
      while (var0 > task.data[13]) {
        sBuf[offset + 1] = (i - var2) + bgY;
        sBuf[offset] = bgX + var3 + ((gSineTable[sineIndex] ?? 0) >> 5);
        sineIndex = (sineIndex + 10) & 0xFF;
        task.data[11] += task.data[10];
        var3 = task.data[11] >> 5;
        task.data[12] = var3;
        i++;
        offset -= 2;
        var1 += task.data[6];
        var2 = var1 >> 5;
        var0--;
      }

      var0 *= 2;
      while (var0 >= 0) {
        _aaBufs[0][var0] = bgX + 240; // + DISPLAY_WIDTH
        _aaBufs[1][var0] = bgX + 240;
        var0 -= 2;
      }

      if (++task.data[6] > 63) {
        task.data[6] = 64;
        task.data[2]++;
        if (task.data[2] & 1) task.data[3]--;
        else task.data[4]++;
        rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(task.data[3], task.data[4]));
        if (task.data[3] === 0 && task.data[4] === 16) {
          task.data[2] = 0;
          task.data[3] = 0;
          task.data[0]++;
        }
      } else {
        task.data[7] += task.data[8];
      }
      break;
    }
    case 1:
      if (++task.data[2] > 12) {
        _aaScan.state = 3;
        task.data[2] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      task.data[2]++;
      if (task.data[2] & 1) task.data[3]++;
      else task.data[4]--;
      rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, _BLDALPHA_BLEND(task.data[3], task.data[4]));
      if (task.data[3] === 16 && task.data[4] === 0) {
        task.data[2] = 0;
        task.data[3] = 0;
        task.data[0]++;
      }
      break;
    case 3:
      _vItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}

registerAnimTasks({ AnimTask_AcidArmor: AnimTask_AcidArmor as never });

// ─── VAGUE F36 : booléennes/power-levels (effects_3.c:1531 + :5060) ─────────
/** 1:1 `AnimTask_IsHealingMove` (effects_3.c:1531) → args[7] = (dmg <= 0). */
function AnimTask_IsHealingMove(task: { taskId: number }): void {
  const itf = _vItf() as { getArgs?: () => number[]; getAnimMoveDmg?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const args = itf.getArgs?.();
  if (args) args[7] = (itf.getAnimMoveDmg?.() ?? 0) > 0 ? 0 : 1;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_GetReturnPowerLevel` (effects_3.c:5060) → args[7] = 0..3. */
function AnimTask_GetReturnPowerLevel(task: { taskId: number }): void {
  const itf = _vItf() as { getArgs?: () => number[]; getAnimFriendship?: () => number; DestroyAnimVisualTask?: (id: number) => void };
  const f = itf.getAnimFriendship?.() ?? 0;
  const args = itf.getArgs?.();
  if (args) {
    args[7] = 0;
    if (f < 60) args[7] = 0;
    if (f > 60 && f < 92) args[7] = 1;
    if (f > 91 && f < 201) args[7] = 2;
    if (f > 200) args[7] = 3;
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
registerAnimTasks({
  AnimTask_IsHealingMove: AnimTask_IsHealingMove as never,
  AnimTask_GetReturnPowerLevel: AnimTask_GetReturnPowerLevel as never,
});

// ─── VAGUE F39b : AnimTask_FadeScreenToWhite (effects_3.c:1398) ─────────────
// Nom trompeur : ROTATION des couleurs 1..11 de la palette BG terrain toutes
// les 4f (le fond « psychédélique » de Solar Beam) jusqu'au signal
// args[7]=0xFFFF. Pattern « task de fond » (decVisualTaskCount à l'init).
function AnimTask_FadeScreenToWhite(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _vItf() as { decVisualTaskCount?: () => void };
  itf.decVisualTaskCount?.();   // 1:1 gAnimVisualTaskCount--
  task.func = _FadeScreenToWhite_Step;
}
function _FadeScreenToWhite_Step(task: { taskId: number; data: number[] }): void {
  const rt = _grt() as unknown as {
    gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void };
    DestroyTask?: (id: number) => void;
  };
  if (++task.data[5] === 4) {
    // GetBattleBgPaletteNum = 2 en single (la palette du terrain — LoadMoveBg slot 2).
    const base = 2 * 16;
    const pf = rt.gPlttBufferFaded;
    if (pf?.get && pf.set) {
      // rotation 1..11 (Unfaded aliase Faded chez nous → une rotation 1:1-net).
      const lastColor = pf.get(base + 11);
      for (let i = 10; i > 0; i--) pf.set(base + i + 1, pf.get(base + i));
      pf.set(base + 1, lastColor);
    }
    task.data[5] = 0;
  }
  const args = (_vItf() as { getArgs?: () => number[] }).getArgs?.();
  if (args && (args[7] & 0xFFFF) === 0xFFFF) {
    rt.DestroyTask?.(task.taskId);  // 1:1 DestroyTask (compteur déjà décrémenté)
  }
}
registerAnimTasks({ AnimTask_FadeScreenToWhite: AnimTask_FadeScreenToWhite as never });

// ─── VAGUE F43 : AnimTask_RapinSpinMonElevation (effects_3.c:1749-1891) ─────
// [typo décomp d'origine] Rapid Spin : le mon « décolle » — la bande scanline
// se rétrécit par le bas (alternance bgX/bgX+240 toutes les 2f = strobo).
import { SCANLINE_EFFECT_DMACNT_16BIT as _rsDma16 } from './scanline_effect';

function AnimTask_RapinSpinMonElevation(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _vItf();
  const args = itf.getArgs?.() ?? [0, 0, 0];
  const battler = !args[0] ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  const var0 = _GetBattlerYCoordWithElevation(battler) & 0xFF;
  const toBG2 = _aaBgRank(battler);

  task.data[0] = var0 + 36;
  task.data[1] = task.data[0];
  task.data[2] = var0 - 33;
  if (task.data[2] < 0) task.data[2] = 0;
  task.data[3] = task.data[0];
  task.data[4] = 8;
  task.data[5] = args[1] | 0;
  task.data[6] = 0;
  task.data[7] = 0;

  const g = globalThis as Record<string, unknown>;
  const var3 = toBG2 === 1 ? ((g.gBattle_BG1_X as number) | 0) : ((g.gBattle_BG2_X as number) | 0);
  task.data[8] = var3;
  const var4 = var3 + 240; // DISPLAY_WIDTH
  task.data[9] = var4;
  task.data[10] = args[2] | 0;

  let var2: number;
  if (!args[2]) {
    task.data[11] = var4;
    var2 = task.data[8];
  } else {
    task.data[11] = var3;
    var2 = task.data[9];
  }
  task.data[15] = 0;

  for (let i = task.data[2]; i <= task.data[3]; i++) {
    _aaBufs[0][i] = var2;
    _aaBufs[1][i] = var2;
  }
  const dmaDest = _aaRegBase + (toBG2 === 1 ? _aaRegBg1H : _aaRegBg2H);
  _aaSetParams({ dmaDest, dmaControl: _rsDma16, initState: 1, unused9: 0 });
  task.func = _RapinSpinMonElevation_Step;
}
function _RapinSpinMonElevation_Step(task: { taskId: number; data: number[] }): void {
  task.data[0] -= task.data[5];
  if (task.data[0] < task.data[2]) task.data[0] = task.data[2];

  if (task.data[4] === 0) {
    task.data[1] -= task.data[5];
    if (task.data[1] < task.data[2]) {
      task.data[1] = task.data[2];
      task.data[15] = 1;
    }
  } else {
    task.data[4]--;
  }

  if (++task.data[6] > 1) {
    task.data[6] = 0;
    task.data[7] = task.data[7] === 0 ? 1 : 0;
    task.data[12] = task.data[7] ? task.data[8] : task.data[9];
  }

  for (let i = task.data[0]; i < task.data[1]; i++) {
    _aaBufs[0][i] = task.data[12];
    _aaBufs[1][i] = task.data[12];
  }
  for (let i = task.data[1]; i <= task.data[3]; i++) {
    _aaBufs[0][i] = task.data[11];
    _aaBufs[1][i] = task.data[11];
  }

  if (task.data[15]) {
    if (task.data[10]) _aaScan.state = 3;
    _vItf().DestroyAnimVisualTask?.(task.taskId);
  }
}
registerAnimTasks({ AnimTask_RapinSpinMonElevation: AnimTask_RapinSpinMonElevation as never });

// ─── VAGUE F44 : AnimTask_TormentAttacker (effects_3.c:1892-2003) ───────────
// 6 bulles de pensée alternées G/D + squish affine ×6 de l'attaquant, puis
// les bulles « pop » (anim 2) et se détruisent.
const _tmAffine_Torment: import('./battle_anim_mons').TaskAffineTable = {
  // 1:1 sAffineAnims_Torment (effects_3.c:435)
  frames: [
    { xScale: -12, yScale: 8, rotation: 0, duration: 4 },
    { xScale: 20, yScale: -20, rotation: 0, duration: 4 },
    { xScale: -8, yScale: 12, rotation: 0, duration: 4 },
  ],
  terminator: 'END',
};
const _tmBubbles = new Map<number, number[]>(); // taskId -> spriteIds des bulles

function AnimTask_TormentAttacker(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _vItf();
  const atk = itf.getAttacker?.() ?? 0;
  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  task.data[3] = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  task.data[4] = 32;
  task.data[5] = -20;
  task.data[6] = 0;
  task.data[15] = _GetAnimBattlerSpriteId(0);
  _tmBubbles.set(task.taskId, []);
  task.func = _TormentAttacker_Step;
}
function _TormentAttacker_Step(task: { taskId: number; data: number[] }): void {
  const rt = (globalThis as Record<string, unknown>).__rt as {
    gSprites?: Map<number, { data: number[]; callback: unknown; oamIndex: number; hFlip?: boolean; animEnded?: boolean }>;
    CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
    gba?: { oam: Array<{ tileId: number; paletteBank?: number; hFlip?: boolean }> };
    DestroySprite?: (i: number) => void;
  } | undefined;
  switch (task.data[0]) {
    case 0: {
      const var1 = task.data[4];
      const x = (task.data[1] & 1) ? task.data[2] - var1 : task.data[2] + var1;
      const y = task.data[3] + task.data[5];
      const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
      const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
      const tpl = bridge?.lookupGeneratedTemplateTags?.('gThoughtBubbleSpriteTemplate');
      const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
      const sid = rt?.CreateSpriteInline?.({ oam: { shape: 0, size: 2, priority: 2 }, images: [] } as never, x, y, 6 - task.data[1]) ?? -1;
      (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(46 /* SE_M_METRONOME */);
      if (sid >= 0) {
        const sp = rt?.gSprites?.get(sid);
        const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
        if (oam && tileStart !== 0xFFFF) {
          oam.tileId = tileStart;
          const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
          if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
          if (oam.hFlip !== undefined) oam.hFlip = !!(task.data[1] & 1);
        }
        if (sp) {
          sp.hFlip = !!(task.data[1] & 1);
          sp.callback = (() => { /* SpriteCallbackDummy */ }) as never;
          _tmBubbles.get(task.taskId)?.push(sid);
        }
      }
      if (task.data[1] & 1) {
        task.data[4] -= 6;
        task.data[5] -= 6;
      }
      _dcPrep(task as never, task.data[15], _tmAffine_Torment);
      task.data[1]++;
      task.data[0] = 1;
      break;
    }
    case 1:
      if (!_dcRun(task as never)) {
        if (task.data[1] === 6) {
          task.data[6] = 8;
          task.data[0] = 3;
        } else {
          task.data[6] = task.data[1] <= 2 ? 10 : 0;
          task.data[0] = 2;
        }
      }
      break;
    case 2:
      if (task.data[6] !== 0) task.data[6]--;
      else task.data[0] = 0;
      break;
    case 3:
      if (task.data[6] !== 0) task.data[6]--;
      else task.data[0] = 4;
      break;
    case 4: {
      const ids = _tmBubbles.get(task.taskId) ?? [];
      let j = 0;
      for (const sid of ids) {
        const sp = rt?.gSprites?.get(sid);
        if (!sp) continue;
        sp.data[0] = task.taskId;
        sp.data[1] = 6;
        sp.data[7] = 0; // compteur de vie (la bulle inline n'a pas d'anim pop générique)
        sp.callback = _TormentBubble_Pop as never;
        if (++j === 6) break;
      }
      task.data[6] = j;
      task.data[0] = 5;
      break;
    }
    case 5:
      if (task.data[6] === 0) {
        _tmBubbles.delete(task.taskId);
        _vItf().DestroyAnimVisualTask?.(task.taskId);
      }
      break;
  }
}
/** 1:1 TormentAttacker_Callback : destroy à la fin du pop (vie 24f ≈ anim 2). */
function _TormentBubble_Pop(sprite: { data: number[]; animEnded?: boolean }): void {
  if (sprite.animEnded || ++sprite.data[7] > 24) {
    const rt = (globalThis as Record<string, unknown>).__rt as { gTasks?: Map<number, { data: number[] }>; gSprites?: Map<number, unknown>; DestroySprite?: (i: number) => void } | undefined;
    const t = rt?.gTasks?.get(sprite.data[0]);
    if (t) t.data[sprite.data[1]]--;
    for (const [sid, sp] of rt?.gSprites ?? new Map()) {
      if (sp === (sprite as unknown)) { rt?.DestroySprite?.(sid); break; }
    }
  }
}
registerAnimTasks({ AnimTask_TormentAttacker: AnimTask_TormentAttacker as never });

// --- VAGUE F57 : AnimTask_BarrageBall (effects_3.c:4158-4225) ---------------
// L'oeuf de Barrage : arc ralenti (1 tick/2f x8) puis arc plein, clignote 16
// demi-cycles a l'impact et meurt.
import {
  InitAnimArcTranslation as _bbArcInit,
  TranslateAnimHorizontalArc as _bbArcRun,
  GetBattlerSpriteSubpriority as _bbSubprio,
} from './battle_anim_mons';

function _bbPicHeight(battler: number): number {
  const party = (battler & 1) !== 0 ? gEnemyParty : gPlayerParty;
  const species = GetMonData(party[gBattlerPartyIndexes[battler]] as never, MON_DATA_SPECIES) as number;
  const name = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const coords = (battler & 1) === 0 ? getMonBackPicCoords(name) : getMonFrontPicCoords(name);
  return coords.h;
}

/** 1:1 AnimTask_BarrageBall (effects_3.c:4158). */
function AnimTask_BarrageBall(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _vItf();
  const atk = itf.getAttacker?.() ?? 0;
  const tgt = itf.getTarget?.() ?? 1;
  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = 0;
  task.data[11] = GetBattlerSpriteCoord(atk, BATTLER_COORD_X_2);
  task.data[12] = GetBattlerSpriteCoord(atk, BATTLER_COORD_Y_PIC_OFFSET);
  task.data[13] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_X_2);
  task.data[14] = GetBattlerSpriteCoord(tgt, BATTLER_COORD_Y_PIC_OFFSET) + Math.trunc(_bbPicHeight(tgt) / 4);
  const rt = _grt() as unknown as {
    gSprites?: Map<number, { data: number[]; invisible?: boolean; oamIndex: number }>;
    CreateSpriteInline?: (t: unknown, x: number, y: number, p: number) => number;
    DestroySprite?: (i: number) => void;
    gba?: { oam: Array<{ tileId: number; paletteBank?: number }> };
  };
  const dg = (globalThis as Record<string, unknown>).__sprite as { GetSpriteTileStartByTag?: (t: number) => number; IndexOfSpritePaletteTag?: (t: number | string) => number } | undefined;
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as { lookupGeneratedTemplateTags?: (n: string) => { tileTag: number } | undefined } | undefined;
  const tpl = bridge?.lookupGeneratedTemplateTags?.('gBarrageBallSpriteTemplate');
  const tileStart = tpl ? (dg?.GetSpriteTileStartByTag?.(tpl.tileTag) ?? 0xFFFF) : 0xFFFF;
  const sid = rt.CreateSpriteInline?.({ oam: { shape: 0, size: 1, priority: 2 }, images: [] } as never, task.data[11], task.data[12], _bbSubprio(tgt) - 5) ?? -1;
  task.data[15] = sid;
  if (sid >= 0) {
    const sp = rt.gSprites?.get(sid);
    const oam = sp ? rt.gba?.oam[sp.oamIndex] : undefined;
    if (oam && tileStart !== 0xFFFF) {
      oam.tileId = tileStart;
      const pal = dg?.IndexOfSpritePaletteTag?.(tpl?.tileTag ?? 0) ?? 0xFF;
      if (pal !== 0xFF && oam.paletteBank !== undefined) oam.paletteBank = pal;
    }
    if (sp) {
      sp.data[0] = 16;
      sp.data[2] = task.data[13];
      sp.data[4] = task.data[14];
      sp.data[5] = -32;
      _bbArcInit(sp as never);
      // (affine anim 1 = rotation inverse cote opponent — dette douce inline)
    }
    task.func = _BarrageBall_Step;
  } else {
    itf.DestroyAnimVisualTask?.(task.taskId);
  }
}
function _BarrageBall_Step(task: { taskId: number; data: number[]; func?: unknown }): void {
  const rt = _grt() as unknown as {
    gSprites?: Map<number, { data: number[]; invisible?: boolean; oamIndex: number }>;
    DestroySprite?: (i: number) => void;
  };
  const sp = rt.gSprites?.get(task.data[15]);
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        if (sp) _bbArcRun(sp as never);
        if (++task.data[2] > 7) task.data[0]++;
      }
      break;
    case 1:
      if (!sp || _bbArcRun(sp as never)) {
        task.data[1] = 0;
        task.data[2] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        task.data[2]++;
        if (sp) sp.invisible = !!(task.data[2] & 1);
        if (task.data[2] === 16) {
          rt.DestroySprite?.(task.data[15]);
          task.data[0]++;
        }
      }
      break;
    case 3:
      _vItf().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
registerAnimTasks({ AnimTask_BarrageBall: AnimTask_BarrageBall as never });

// --- VAGUE F69 : AnimTask_MorningSunLightBeam (effects_3.c) -----------------
// 4 rais de lumiere : masque light_beam en BG1, fondu 0..12, deplacement par
// table s8 [-24,24,-4,0], 4 cycles, demontage. SE MORNING_SUN par rai.
import {
  GetBattleAnimBg1Data as _msBgData,
  AnimLoadCompressedBgGfx as _msLoadGfx,
  AnimLoadCompressedBgTilemap as _msLoadMap,
  LoadAnimBgPalette as _msLoadPal,
  ClearBattleAnimBg as _msClearBg,
} from '../engine/battle/battle-anim-interpreter';

const _gMorningSunCoords: ReadonlyArray<number> = [-24, 24, -4, 0]; // s8 0xE8,0x18,0xFC,0x00
type _MsTask = { taskId: number; data: number[]; func?: unknown };
function _msItf(): { getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _msRt(): {
  SetGpuReg?: (o: number, v: number) => void;
  gba?: { bg: (i: number) => { config: { priority: number; screenSize: number; charBaseIndex: number } } };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _msSetBg1(x: number | null, y: number | null): void {
  const g = globalThis as Record<string, unknown>;
  if (x !== null) g.gBattle_BG1_X = x & 0xFFFF;
  if (y !== null) g.gBattle_BG1_Y = y & 0xFFFF;
}

/** 1:1 AnimTask_MorningSunLightBeam. */
function AnimTask_MorningSunLightBeam(task: _MsTask): void {
  const itf = _msItf();
  const rt = _msRt();
  switch (task.data[0]) {
    case 0: {
      rt.SetGpuReg?.(0x50, 0x3F42);
      rt.SetGpuReg?.(0x52, 0 | (16 << 8));
      const bg1 = rt.gba?.bg(1)?.config;
      if (bg1) {
        bg1.screenSize = 0;
        bg1.priority = 1;
        bg1.charBaseIndex = 1;
      }
      const animBg = _msBgData();
      _msLoadMap(animBg.bgId, 'gBattleAnimMaskTilemap_LightBeam');
      const atk = itf.getAttacker?.() ?? 0;
      if ((atk & 1) !== 0) _msSetBg1(-135, 0);
      else _msSetBg1(-10, 0);
      _msLoadGfx(animBg.bgId, 'gBattleAnimMaskImage_LightBeam', animBg.tilesOffset);
      _msLoadPal('gBattleAnimMaskPalette_LightBeam', animBg.paletteId);
      task.data[10] = ((globalThis as Record<string, unknown>).gBattle_BG1_X as number) | 0;
      task.data[11] = ((globalThis as Record<string, unknown>).gBattle_BG1_Y as number) | 0;
      task.data[0]++;
      (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(214 /* SE_M_MORNING_SUN */);
      break;
    }
    case 1:
      if (task.data[4]++ > 0) {
        task.data[4] = 0;
        if (++task.data[1] > 12) task.data[1] = 12;
        rt.SetGpuReg?.(0x52, (task.data[1] & 0xFF) | ((16 - task.data[1]) << 8));
        if (task.data[1] === 12) task.data[0]++;
      }
      break;
    case 2:
      if (--task.data[1] < 0) task.data[1] = 0;
      rt.SetGpuReg?.(0x52, (task.data[1] & 0xFF) | ((16 - task.data[1]) << 8));
      if (!task.data[1]) {
        _msSetBg1(_gMorningSunCoords[task.data[2]] + task.data[10], null);
        if (++task.data[2] === 4) task.data[0] = 4;
        else task.data[0] = 3;
      }
      break;
    case 3:
      if (++task.data[3] === 4) {
        task.data[3] = 0;
        task.data[0] = 1;
        (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(214);
      }
      break;
    case 4: {
      const animBg = _msBgData();
      _msClearBg(animBg.bgId);
      const bg1 = rt.gba?.bg(1)?.config;
      if (bg1) {
        bg1.charBaseIndex = 0;
        bg1.priority = 1;
      }
      _msSetBg1(0, 0);
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      _msItf().DestroyAnimVisualTask?.(task.taskId);
      break;
    }
  }
}
registerAnimTasks({ AnimTask_MorningSunLightBeam: AnimTask_MorningSunLightBeam as never });

// --- VAGUE F71 : AnimTask_StatusClearedEffect (effects_3.c:3904) ------------
/** 1:1 : StartMonScrollingBgMask(0x1A0, attacker, 10, 2, 30, cure_bubbles). */
function AnimTask_StatusClearedEffect(task: { taskId: number; data: number[]; func?: unknown }): void {
  const itf = _vItf() as { getAttacker?: () => number };
  const start = (globalThis as Record<string, unknown>).__startMonScrollingBgMask as
    ((t: unknown, sp: number, b: number, n: number, d: number, dur: number, g: string, m: string, p: string) => void) | undefined;
  start?.(task, 0x1A0, itf.getAttacker?.() ?? 0, 10, 2, 30, 'gCureBubblesGfx', 'gCureBubblesTilemap', 'gCureBubblesPal');
}
registerAnimTasks({ AnimTask_StatusClearedEffect: AnimTask_StatusClearedEffect as never });

// --- VAGUE F74 : AnimTask_CreateSpotlight / AnimTask_RemoveSpotlight --------
// (effects_3.c:1674/:1697) — la fenêtre 1 couvre la bande BASSE de l'écran
// (y 120-160, WININ win1 SANS CLR → le « noir » du projecteur s'applique hors
// cône) ; AnimSpotlight (OBJ_WINDOW affine, déjà porté plus haut) découpe le
// cône sur la cible. Clients : Encore, Flatter. Combat seul (pas IsContest).
// Les gBattle_WIN1H/V sont des MIROIRS réappliqués chaque VBlankCB_Battle
// (battle_main.ts:158-159) → écrire le miroir ET le registre.
const _SPT_REG_WININ = 0x48;
const _SPT_REG_WIN1H = 0x42;
const _SPT_REG_WIN1V = 0x46;
const _SPT_DISPCNT_WIN1_ON = 0x4000;
/** 1:1 WIN_RANGE(a, b) = (a << 8) | b. */
function _sptWinRange(a: number, b: number): number { return ((a & 0xFF) << 8) | (b & 0xFF); }
function _sptSetWin1(name: 'gBattle_WIN1H' | 'gBattle_WIN1V', v: number): void {
  (globalThis as Record<string, unknown>)[name] = v;
}
/** 1:1 `AnimTask_CreateSpotlight` (effects_3.c:1674), branche combat. */
function AnimTask_CreateSpotlight(task: { taskId: number }): void {
  const rt = _grt();
  // WININ_WIN0_BG_ALL|WIN0_OBJ|WIN0_CLR | WININ_WIN1_BG_ALL|WIN1_OBJ (sans CLR)
  rt.SetGpuReg?.(_SPT_REG_WININ, 0x1F3F);
  const h = _sptWinRange(0, 240);  // WIN_RANGE(0, DISPLAY_WIDTH)
  const v = _sptWinRange(120, 160); // WIN_RANGE(120, DISPLAY_HEIGHT)
  _sptSetWin1('gBattle_WIN1H', h);
  _sptSetWin1('gBattle_WIN1V', v);
  rt.SetGpuReg?.(_SPT_REG_WIN1H, h);
  rt.SetGpuReg?.(_SPT_REG_WIN1V, v);
  // SetGpuRegBits(DISPCNT, DISPCNT_WIN1_ON)
  rt.SetGpuReg?.(REG_OFFSET_DISPCNT, (rt.GetGpuReg?.(REG_OFFSET_DISPCNT) ?? 0) | _SPT_DISPCNT_WIN1_ON);
  _itf().DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `AnimTask_RemoveSpotlight` (effects_3.c:1697). */
function AnimTask_RemoveSpotlight(task: { taskId: number }): void {
  const rt = _grt();
  rt.SetGpuReg?.(_SPT_REG_WININ, 0x3F3F); // WININ all + CLR des deux fenêtres
  _sptSetWin1('gBattle_WIN1H', 0);
  _sptSetWin1('gBattle_WIN1V', 0);
  rt.SetGpuReg?.(_SPT_REG_WIN1H, 0);
  rt.SetGpuReg?.(_SPT_REG_WIN1V, 0);
  // ClearGpuRegBits(DISPCNT, DISPCNT_WIN1_ON)
  rt.SetGpuReg?.(REG_OFFSET_DISPCNT, (rt.GetGpuReg?.(REG_OFFSET_DISPCNT) ?? 0) & ~_SPT_DISPCNT_WIN1_ON);
  _itf().DestroyAnimVisualTask?.(task.taskId);
}
_e3RegTasks({
  AnimTask_CreateSpotlight: AnimTask_CreateSpotlight as never,
  AnimTask_RemoveSpotlight: AnimTask_RemoveSpotlight as never,
});

// --- VAGUE F77 : AnimTask_RolePlaySilhouette(+Step1/Step2) ------------------
// (effects_3.c:3183-3295) — la silhouette BLANCHE de la cible apparaît sur
// l'attaquant (sprite mon supplémentaire en OBJ_BLEND, palette remplie de
// blanc), fade-in BLDALPHA 0→10, puis aspirée (scaleX 256→112, scaleY 256+128/t)
// et détruite. Divergence plateforme : CreateAdditionalMonSpriteForMoveAnim est
// ASYNC → case d'attente (1-3 frames, documenté).

type _E3Task = { taskId: number; data: number[]; func?: unknown };
// jeton UNIQUE par invocation (les taskIds se RECYCLENT — une entrée stale
// détournait le run suivant, constaté A/B 2026-06-12) ; anti-orphelin à la
// résolution si la task est morte pendant le fetch.
let _rpsToken = 0;
const _rpsLoaded = new Map<number, number>(); // jeton → spriteId

function AnimTask_RolePlaySilhouette(task: _E3Task): void {
  const itf = _itf();
  const atk = itf.getAttacker?.() ?? 0;
  const tgt = itf.getTarget?.() ?? 1;
  if ((task.data[14] | 0) === 0) {
    // 1:1 :3206-3247 (branche combat) : pic de la TARGET — back si l'attacker
    // est côté joueur (xOffset -20), front sinon (+20).
    const atkIsPlayer = (atk & 1) === 0;
    const isBackPic = atkIsPlayer;
    const xOffset = atkIsPlayer ? -20 : 20;
    const party = (tgt & 1) === 0 ? gPlayerParty : gEnemyParty;
    const tgtMon = party[gBattlerPartyIndexes[tgt] ?? 0];
    const species = tgtMon ? (GetMonData(tgtMon as never, MON_DATA_SPECIES) as number) : 0;
    if (!species) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
    const coord1 = _e3Coord(atk, 0);
    const coord2 = _e3Coord(atk, 1);
    const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
      CreateAdditionalMonSpriteForMoveAnim?: (sp: number, back: boolean, id: number, x: number, y: number, subp: number, p: number, t: number, b: number) => Promise<number>;
    } | undefined;
    const token = ++_rpsToken;
    task.data[14] = token;
    void mons?.CreateAdditionalMonSpriteForMoveAnim?.(species, isBackPic, 0, coord1 + xOffset, coord2, 5, 0, 0, tgt)
      .then((sid) => {
        // anti-orphelin : la task porteuse du jeton vit-elle encore ?
        const rt0 = _grt() as unknown as { gTasks?: Map<number, { func?: unknown; data?: number[] }>; DestroySprite?: (i: number) => void };
        let alive = false;
        for (const [, t0] of rt0.gTasks ?? []) {
          if (t0.func === AnimTask_RolePlaySilhouette && ((t0.data?.[14] ?? 0) | 0) === token) { alive = true; break; }
        }
        if (!alive) { if ((sid ?? -1) >= 0) rt0.DestroySprite?.(sid); return; }
        _rpsLoaded.set(token, sid ?? -1);
      });
    return;
  }
  const loaded = _rpsLoaded.get(task.data[14]);
  if (loaded === undefined) return; // load en vol
  _rpsLoaded.delete(task.data[14]);
  if (loaded < 0) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const spriteId = loaded;
  const rt = _grt();
  const sp = rt.gSprites?.get(spriteId);
  const oam = sp && sp.oamIndex !== undefined ? rt.gba?.oam?.[sp.oamIndex] : undefined;
  const priority = _GetBattlerSpriteBGPriority(atk);
  if (oam) {
    (oam as { priority: number }).priority = priority;
    (oam as { objMode?: number }).objMode = 1; // ST_OAM_OBJ_BLEND
    // FillPalette(RGB_WHITE, OBJ_PLTT_ID(paletteNum)) : silhouette blanche.
    const slot = (oam as { paletteBank?: number }).paletteBank ?? 0;
    const bufs = rt as unknown as { gPlttBufferUnfaded?: { set: (i: number, v: number) => void }; gPlttBufferFaded?: { set: (i: number, v: number) => void } };
    for (let i = 0; i < 16; i++) {
      bufs.gPlttBufferUnfaded?.set(256 + slot * 16 + i, 0x7FFF);
      bufs.gPlttBufferFaded?.set(256 + slot * 16 + i, 0x7FFF);
    }
  }
  // le sprite décomp doit suivre l'objMode (syncSpritesToOam le réécrit)
  if (sp) (sp as { objMode?: number }).objMode = 1;
  rt.SetGpuReg?.(REG_OFFSET_BLDCNT, 0x3F40); // BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL
  rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, ((task.data[1] & 0xFF)) | ((16 - task.data[1]) << 8));
  task.data[0] = spriteId;
  task.func = _RolePlaySilhouette_Step1;
}
function _RolePlaySilhouette_Step1(task: _E3Task): void {
  const rt = _grt();
  if (task.data[10]++ > 1) {
    task.data[10] = 0;
    task.data[1]++;
    rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, (task.data[1] & 0xFF) | ((16 - task.data[1]) << 8));
    if (task.data[1] === 10) {
      task.data[10] = 256;
      task.data[11] = 256;
      task.func = _RolePlaySilhouette_Step2;
    }
  }
}
function _RolePlaySilhouette_Step2(task: _E3Task): void {
  const rt = _grt();
  const spriteId = task.data[0];
  task.data[10] -= 16;
  task.data[11] += 128;
  const sp = rt.gSprites?.get(spriteId);
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
    SetSpriteRotScale?: (sid: number, x: number, y: number, rot: number) => void;
    ResetSpriteRotScale?: (sid: number) => void;
  } | undefined;
  if (sp) {
    const oam = (sp.oamIndex !== undefined ? rt.gba?.oam?.[sp.oamIndex] : undefined) as { affineMode?: number } | undefined;
    if (oam) oam.affineMode = 3; // |= ST_OAM_AFFINE_DOUBLE_MASK
    (sp as { affineMode?: number }).affineMode = 3;
    mons?.SetSpriteRotScale?.(spriteId, task.data[10], task.data[11], 0);
  }
  if (++task.data[12] === 9) {
    if (sp) mons?.ResetSpriteRotScale?.(spriteId);
    // DestroySpriteAndFreeResources_ : destroy + libère tiles inline + palette tag.
    const spApi = (globalThis as Record<string, unknown>).__sprite as { FreeSpritePaletteByTag?: (t: number) => void } | undefined;
    const tags = ((globalThis as Record<string, unknown>).__battleAnimMons as { MoveEffectMonPaletteTags?: ReadonlyArray<number> } | undefined)?.MoveEffectMonPaletteTags;
    if (tags) spApi?.FreeSpritePaletteByTag?.(tags[0]);
    (rt as unknown as { DestroySprite?: (i: number) => void }).DestroySprite?.(spriteId);
    task.func = _RolePlay_DestroyTaskAndDisableBlend;
  }
}
/** 1:1 DestroyAnimVisualTaskAndDisableBlend (effects_3.c, partagé). */
function _RolePlay_DestroyTaskAndDisableBlend(task: _E3Task): void {
  const rt = _grt();
  rt.SetGpuReg?.(REG_OFFSET_BLDCNT, 0);
  rt.SetGpuReg?.(REG_OFFSET_BLDALPHA, 0);
  _itf().DestroyAnimVisualTask?.(task.taskId);
}
_e3RegTasks({ AnimTask_RolePlaySilhouette: AnimTask_RolePlaySilhouette as never });

// --- VAGUE F78 : AnimTask_TransformMon + IsMonInvisible + CastformGfxDataChange
// (effects_3.c:2250-2374) — Métamorphose : mosaïque BG montante (0→15), swap
// du gfx (HandleSpeciesGfxDataChange, DÉJÀ porté async + copie VRAM OBJ F78)
// + recopie du pic dans la copie monbg, mosaïque descendante, teardown +
// shadow callback (adverse). Attente async par JETON (pattern F77, data[14]).
import { HandleSpeciesGfxDataChange as _tfHandleGfx, gMonSpritesGfxPtr as _tfGfxPtr } from './battle_gfx_sfx_util';
import { GetBattlerSpriteBGPriorityRank as _tfBgRank } from './battle_anim_mons';

const _TF_REG_MOSAIC = 0x4C;
let _tfToken = 0;
const _tfDone = new Set<number>(); // jetons résolus

function _tfRt(): {
  SetGpuReg?: (o: number, v: number) => void;
  gSprites?: Map<number, { oamIndex?: number; invisible?: boolean }>;
  gba?: { bg: (i: number) => { vram: Uint8Array; config: { mosaic: boolean } }; oam: Array<{ tileId: number }>; objVram: Uint8Array };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
/** 1:1 AnimTask_TransformMon (effects_3.c:2250). args[0] = castform-like arg. */
function AnimTask_TransformMon(task: _E3Task): void {
  const itf = _itf();
  const atk = itf.getAttacker?.() ?? 0;
  const rt = _tfRt();
  switch (task.data[0]) {
    case 0: {
      rt.SetGpuReg?.(_TF_REG_MOSAIC, 0);
      const bgId = _tfBgRank(atk) === 1 ? 1 : 2;
      const cfg = rt.gba?.bg(bgId)?.config;
      if (cfg) cfg.mosaic = true; // SetAnimBgAttribute(bgId, BG_ANIM_MOSAIC, 1)
      task.data[10] = (itf.getArgs?.() ?? [0])[0] | 0;
      task.data[0]++;
      break;
    }
    case 1:
      if (task.data[2]++ > 1) {
        task.data[2] = 0;
        task.data[1]++;
        const stretch = task.data[1];
        rt.SetGpuReg?.(_TF_REG_MOSAIC, ((stretch & 0xF) << 4) | (stretch & 0xF));
        if (stretch === 15) task.data[0]++;
      }
      break;
    case 2: {
      // 1:1 :2284 HandleSpeciesGfxDataChange + GetBgDataForTransform +
      // CpuCopy32(pic → animBg.bgTiles) + LoadBgTiles. Async plateforme :
      // jeton data[14] (les taskIds se recyclent — cf. F77).
      if ((task.data[14] | 0) === 0) {
        const token = ++_tfToken;
        task.data[14] = token;
        const tgt = itf.getTarget?.() ?? 1;
        void _tfHandleGfx(atk, tgt, task.data[10] !== 0).then(() => {
          // recopie du pic fraîchement chargé dans la copie monbg (BG vram) —
          // 1:1 :2293-2296 (src = gMonSpritesGfxPtr.sprites.ptr[position]).
          const rank = _tfBgRank(atk);
          const bgId = rank === 1 ? 1 : 2;
          const tilesOffsetBytes = bgId === 2 ? 0x1000 : 0;
          const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
          void co; // position = battler position ; miroir _loadAndCreate (pos & 3)
          const position = atk & 3;
          const src = _tfGfxPtr.sprites.ptr[position];
          const rt2 = _tfRt();
          const bg = rt2.gba?.bg(bgId);
          if (src && bg) bg.vram.set(src.subarray(0, 0x800), tilesOffsetBytes);
          _tfDone.add(token);
        });
        return;
      }
      if (!_tfDone.has(task.data[14])) return; // load en vol
      _tfDone.delete(task.data[14]);
      task.data[0]++;
      break;
    }
    case 3:
      if (task.data[2]++ > 1) {
        task.data[2] = 0;
        task.data[1]--;
        const stretch = task.data[1];
        rt.SetGpuReg?.(_TF_REG_MOSAIC, ((stretch & 0xF) << 4) | (stretch & 0xF));
        if (stretch === 0) task.data[0]++;
      }
      break;
    case 4: {
      rt.SetGpuReg?.(_TF_REG_MOSAIC, 0);
      const bgId = _tfBgRank(atk) === 1 ? 1 : 2;
      const cfg = rt.gba?.bg(bgId)?.config;
      if (cfg) cfg.mosaic = false;
      // 1:1 :2350-2356 : côté ADVERSE, si args[0]==0 → ombre du transformSpecies.
      if ((atk & 1) !== 0 && task.data[10] === 0) {
        const gfx = (globalThis as Record<string, unknown>).__battleGfxSfxUtil as { SetBattlerShadowSpriteCallback?: (b: number, s: number) => void } | undefined;
        const spritesData = (globalThis as Record<string, unknown>).__battleSpritesData as { battlerData?: Array<{ transformSpecies?: number }> } | undefined;
        const ts = spritesData?.battlerData?.[atk]?.transformSpecies ?? 0;
        gfx?.SetBattlerShadowSpriteCallback?.(atk, ts);
      }
      itf.DestroyAnimVisualTask?.(task.taskId);
      break;
    }
  }
}
/** 1:1 AnimTask_IsMonInvisible (effects_3.c:2363) : args[7] = invisible. */
function AnimTask_IsMonInvisible(task: _E3Task): void {
  const itf = _itf();
  const atk = itf.getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(atk);
  const sp = sid !== undefined && sid !== 0xFF ? _tfRt().gSprites?.get(sid) : undefined;
  const args = itf.getArgs?.() ?? [];
  args[7] = sp?.invisible ? 1 : 0; // ARG_RET_ID
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 AnimTask_CastformGfxDataChange (effects_3.c:2369) — castform=TRUE :
 *  no-op net documenté (formes Castform non atteignables, cf. gfx_sfx_util). */
function AnimTask_CastformGfxDataChange(task: _E3Task): void {
  const itf = _itf();
  void _tfHandleGfx(itf.getAttacker?.() ?? 0, itf.getTarget?.() ?? 1, true);
  itf.DestroyAnimVisualTask?.(task.taskId);
}
_e3RegTasks({
  AnimTask_TransformMon: AnimTask_TransformMon as never,
  AnimTask_IsMonInvisible: AnimTask_IsMonInvisible as never,
  AnimTask_CastformGfxDataChange: AnimTask_CastformGfxDataChange as never,
});

// --- VAGUE F79 : AnimTask_MonToSubstitute(+Doll) (effects_3.c:4782-4875) ----
// Clonage : le mon se SQUISH (rotscale x+=0x60/y-=0xD ×9) puis disparaît, le
// DOLL (gfx swappé par BattleLoadSubstituteOrMonSpriteGfx FALSE — async jeton)
// tombe du haut (y2 -200, gravité 112 Q8.8) avec 2 rebonds. SE via __PlaySE.
import { LoadBattleMonGfxAndAnimate as _stLoadGfx } from './battle_gfx_sfx_util';

let _stToken = 0;
const _stDone = new Set<number>();

function AnimTask_MonToSubstitute(task: _E3Task): void {
  const itf = _itf();
  const atk = itf.getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const spriteId = co?.getBattlerMonSpriteId?.(atk) ?? 0xFF;
  if (spriteId === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
    PrepareBattlerSpriteForRotScale?: (sid: number, objMode: number) => void;
    SetSpriteRotScale?: (sid: number, x: number, y: number, rot: number) => void;
    ResetSpriteRotScale?: (sid: number) => void;
  } | undefined;
  const rt = _grt();
  if (task.data[0] === 0) {
    mons?.PrepareBattlerSpriteForRotScale?.(spriteId, 0 /* ST_OAM_OBJ_NORMAL */);
    task.data[1] = 0x100;
    task.data[2] = 0x100;
    task.data[0]++;
  } else if (task.data[0] === 1) {
    task.data[1] += 0x60;
    task.data[2] -= 0xD;
    mons?.SetSpriteRotScale?.(spriteId, task.data[1], task.data[2], 0);
    if (++task.data[3] === 9) {
      task.data[3] = 0;
      mons?.ResetSpriteRotScale?.(spriteId);
      const sp = rt.gSprites?.get(spriteId);
      if (sp) (sp as { invisible?: boolean }).invisible = true;
      task.data[0]++;
    }
  } else {
    // 1:1 :4809 LoadBattleMonGfxAndAnimate(atk, FALSE, spriteId) — async jeton.
    if ((task.data[14] | 0) === 0) {
      const token = ++_stToken;
      task.data[14] = token;
      void _stLoadGfx(atk, false, spriteId).then(() => { _stDone.add(token); });
      return;
    }
    if (!_stDone.has(task.data[14])) return; // load en vol
    _stDone.delete(task.data[14]);
    for (let i = 0; i < 16; i++) task.data[i] = 0;
    task.func = _MonToSubstituteDoll;
  }
}
/** 1:1 AnimTask_MonToSubstituteDoll (effects_3.c:4823) : chute + 2 rebonds. */
function _MonToSubstituteDoll(task: _E3Task): void {
  const itf = _itf();
  const atk = itf.getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
  const spriteId = co?.getBattlerMonSpriteId?.(atk) ?? 0xFF;
  const sp = spriteId !== 0xFF ? (_grt().gSprites?.get(spriteId) as { x?: number; y?: number; x2?: number; y2?: number; invisible?: boolean } | undefined) : undefined;
  if (!sp) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const playSE = (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE;
  switch (task.data[0]) {
    case 0:
      sp.y2 = -200;
      sp.x2 = 200;
      sp.invisible = false;
      task.data[10] = 0;
      task.data[0]++;
      break;
    case 1:
      task.data[10] += 112;
      sp.y2 = (sp.y2 ?? 0) + (task.data[10] >> 8);
      if ((sp.y ?? 0) + (sp.y2 ?? 0) >= -32) sp.x2 = 0;
      if ((sp.y2 ?? 0) > 0) sp.y2 = 0;
      if (sp.y2 === 0) {
        playSE?.(140); // SE_M_BUBBLE2
        task.data[10] -= 0x800;
        task.data[0]++;
      }
      break;
    case 2:
      task.data[10] -= 112;
      if (task.data[10] < 0) task.data[10] = 0;
      sp.y2 = (sp.y2 ?? 0) - (task.data[10] >> 8);
      if (task.data[10] === 0) task.data[0]++;
      break;
    case 3:
      task.data[10] += 112;
      sp.y2 = (sp.y2 ?? 0) + (task.data[10] >> 8);
      if ((sp.y2 ?? 0) > 0) sp.y2 = 0;
      if (sp.y2 === 0) {
        playSE?.(140);
        itf.DestroyAnimVisualTask?.(task.taskId);
      }
      break;
  }
}
_e3RegTasks({ AnimTask_MonToSubstitute: AnimTask_MonToSubstitute as never });
