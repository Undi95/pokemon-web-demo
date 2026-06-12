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
import { registerAnimCallbacks } from '../engine/battle/battle-anim-generated-bridge';

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
  // 1:1 AnimBite : sprite->x += cmd->x (OFFSET — la base TARGET est posee
  // par Cmd_createsprite, battle_anim.c:406).
  sprite.x += args[0];
  sprite.y += args[1];
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

registerAnimCallbacks({ AnimBite: AnimBite as never });

// ════════════════════════════════════════════════════════════════════════════
// CLAW SLASH (2026-06-11, append-only) — AnimClawSlash (battle_anim_dark.c:808) :
// la griffure profonde de Metal Claw / Dragon Claw / Crush Claw
// (gClawSlashSpriteTemplate, sAnims_ClawSlash = 5 frames × 4 ticks, anim 1 = hFlip).
// ════════════════════════════════════════════════════════════════════════════
import { SetCallbackToStoredInData6, StoreSpriteCallbackInData6 } from './battle_anim_mons';

/** 1:1 `StartSpriteAnim` (sprite.c) — pattern repo (battle_anim_rock.ts). */
function _StartSpriteAnim(sprite: unknown, n: number): void {
  const spA = sprite as { anims?: unknown; animNum?: number; animBeginning?: boolean; animEnded?: boolean };
  if (spA.anims && n >= 0) { spA.animNum = n; spA.animBeginning = true; spA.animEnded = false; }
}

/** 1:1 `RunStoredCallbackWhenAnimEnds` (battle_anim_mons.c:735).
 *  Adaptation anti-leak (convention battle_anim_ice.ts:142) : pas de table
 *  anims posée → ended immédiat. */
function _RunStoredCallbackWhenAnimEnds(sprite: AnimSprite): void {
  const spA = sprite as { animEnded?: boolean; anims?: unknown };
  if (spA.animEnded || spA.anims === undefined) SetCallbackToStoredInData6(sprite as never);
}

/** Wrapper nommé `DestroyAnimSprite` — stockable en data6 (le C passe le ptr fonction). */
function _DestroyAnimSpriteCb(sprite: unknown): void { _itf().DestroyAnimSprite?.(sprite); }

/** 1:1 `AnimClawSlash` (battle_anim_dark.c:808) : griffure posée en offset de
 *  la position de création (cible), joue l'anim args[2] une fois → destroy.
 *  CMD_ARGS(x, y, animation). */
function AnimClawSlash(sprite: AnimSprite): void {
  const args = _itf().getArgs?.() ?? [0, 0, 0];
  sprite.x += args[0] | 0;
  sprite.y += args[1] | 0;
  sprite.invisible = false;
  _StartSpriteAnim(sprite, args[2] | 0);
  sprite.callback = _RunStoredCallbackWhenAnimEnds;
  StoreSpriteCallbackInData6(sprite as never, _DestroyAnimSpriteCb as never);
}

registerAnimCallbacks({ AnimClawSlash: AnimClawSlash as never });

// ─── VAGUE F3 : SetGrayscaleOrOriginalPal (battle_anim_dark.c.c:939, 14 hits) ─────────────
// mode 0 = griser la palette OBJ du battler (moyenne RGB depuis UNFADED) ;
// mode 1 = restore REEL (copie Unfaded→Faded). La logique vit dans son fichier
// miroir battle_anim_mons.ts (battle_anim_mons.c.c:1374) — re-câblé vague F73 (l'hypothèse
// « Unfaded aliase Faded » de F3 était fausse, buffers séparés vérifiés).
import { SetGrayscaleOrOriginalPalette as _dSetGrayPal } from './battle_anim_mons';
function _dItf3(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function AnimTask_SetGrayscaleOrOriginalPal(task: { taskId: number }): void {
  const itf = _dItf3();
  const a = itf.getArgs?.() ?? [];
  const b = a[0] === 0 ? (itf.getAttacker?.() ?? 0) : a[0] === 1 ? (itf.getTarget?.() ?? 1) : -1;
  if (b >= 0) {
    const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
    const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Map<number, { oamIndex: number }>; gba?: { oam: Array<{ paletteBank: number }> } } | undefined;
    const sid = co?.getBattlerMonSpriteId?.(b);
    const sp = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.get(sid) : undefined;
    const pal = sp ? (rt?.gba?.oam[sp.oamIndex]?.paletteBank ?? 0) : -1;
    // 1:1 battle_anim_dark.c.c:1005 : SetGrayscaleOrOriginalPalette(paletteNum + 16, mode).
    if (pal >= 0) _dSetGrayPal(pal + 16, a[1] !== 0);
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 `GetIsDoomDesireHitTurn` (battle_anim_dark.c.c:992) : args[7] = (gAnimMoveTurn == 2). */
function GetIsDoomDesireHitTurn(task: { taskId: number }): void {
  const itf = _dItf3();
  const args = itf.getArgs?.() ?? [];
  const turn = ((globalThis as Record<string, unknown>).__gAnimMoveTurn as number) ?? 0;
  if (turn < 2) args[7] = 0;
  if (turn === 2) args[7] = 1;
  itf.DestroyAnimVisualTask?.(task.taskId);
}
import { registerAnimTasks as _dRegT } from '../engine/battle/battle-anim-registry';
/** 1:1 les 3 fades attacker (battle_anim_dark.c.c:191-274) : BLDALPHA progressif sur le BG
 *  monbg (TGT1_BG1) — Feinte & co. args (stepDelay). */
function _dkRt(): { SetGpuReg?: (r: number, v: number) => void; gSprites?: Map<number, { invisible?: boolean }> } {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _dkAtkSprite(): { invisible?: boolean } | undefined {
  const itf = _dItf3();
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const sid = co?.getBattlerMonSpriteId?.(itf.getAttacker?.() ?? 0) ?? 0xFF;
  return sid !== 0xFF ? _dkRt().gSprites?.get(sid) : undefined;
}
function AnimTask_AttackerFadeToInvisible(task: { taskId: number; data: number[]; func?: unknown }): void {
  const a = _dItf3().getArgs?.() ?? [];
  task.data[0] = a[0];
  task.data[1] = 16;
  task.data[2] = 0;
  _dkRt().SetGpuReg?.(0x52, 16);
  _dkRt().SetGpuReg?.(0x50, 0x3F40 | 0x02);
  task.func = _FadeToInvisible_Step;
}
function _FadeToInvisible_Step(task: { taskId: number; data: number[] }): void {
  let evb = task.data[1] >> 8;
  let eva = task.data[1] & 0xFF;
  if (task.data[2] === (task.data[0] & 0xFF)) {
    evb++;
    eva--;
    task.data[1] = eva | (evb << 8);
    _dkRt().SetGpuReg?.(0x52, task.data[1]);
    task.data[2] = 0;
    if (evb === 16) {
      const sp = _dkAtkSprite();
      if (sp) sp.invisible = true;
      _dItf3().DestroyAnimVisualTask?.(task.taskId);
    }
  } else {
    task.data[2]++;
  }
}
function AnimTask_AttackerFadeFromInvisible(task: { taskId: number; data: number[]; func?: unknown }): void {
  const a = _dItf3().getArgs?.() ?? [];
  task.data[0] = a[0];
  task.data[1] = (16 << 8) | 0;
  task.data[2] = 0;
  _dkRt().SetGpuReg?.(0x52, task.data[1]);
  task.func = _FadeFromInvisible_Step;
}
function _FadeFromInvisible_Step(task: { taskId: number; data: number[] }): void {
  let evb = task.data[1] >> 8;
  let eva = task.data[1] & 0xFF;
  if (task.data[2] === (task.data[0] & 0xFF)) {
    evb--;
    eva++;
    task.data[1] = eva | (evb << 8);
    _dkRt().SetGpuReg?.(0x52, task.data[1]);
    task.data[2] = 0;
    if (evb === 0) {
      _dkRt().SetGpuReg?.(0x50, 0);
      _dkRt().SetGpuReg?.(0x52, 0);
      _dItf3().DestroyAnimVisualTask?.(task.taskId);
    }
  } else {
    task.data[2]++;
  }
}
function AnimTask_InitAttackerFadeFromInvisible(task: { taskId: number }): void {
  _dkRt().SetGpuReg?.(0x52, (16 << 8) | 0);
  _dkRt().SetGpuReg?.(0x50, 0x3F40 | 0x02);
  _dItf3().DestroyAnimVisualTask?.(task.taskId);
}
_dRegT({
  AnimTask_AttackerFadeToInvisible: AnimTask_AttackerFadeToInvisible as never,
  AnimTask_AttackerFadeFromInvisible: AnimTask_AttackerFadeFromInvisible as never,
  AnimTask_InitAttackerFadeFromInvisible: AnimTask_InitAttackerFadeFromInvisible as never,
  AnimTask_SetGrayscaleOrOriginalPal: AnimTask_SetGrayscaleOrOriginalPal as never,
  GetIsDoomDesireHitTurn: GetIsDoomDesireHitTurn as never,
});

// --- VAGUE F72 : AnimTask_MetallicShine (battle_anim_dark.c.c:822-940) --------------------
// L'eclat metallique : masque metal_shine en BG1 visible UNIQUEMENT a travers
// la silhouette OBJ-window du mon (moteur F71), mon GRISE (ou teinte arg2),
// le masque defile -4/f x2 cycles de 128, restore.
import {
  GetBattleAnimBg1Data as _mshBgData,
  AnimLoadCompressedBgGfx as _mshLoadGfx,
  AnimLoadCompressedBgTilemap as _mshLoadMap,
  LoadAnimBgPalette as _mshLoadPal,
  ClearBattleAnimBg as _mshClearBg,
} from '../engine/battle/battle-anim-interpreter';
import { BlendPalette as _mshBlend } from '../engine/system/decomp-globals';

type _MshTask = { taskId: number; data: number[]; func?: unknown };
function _mshItf(): { getArgs?: () => number[]; getAttacker?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _mshRt(): {
  SetGpuReg?: (o: number, v: number) => void;
  DestroySprite?: (i: number) => void;
  gSprites?: Map<number, { x: number; y: number; oamIndex: number }>;
  gba?: { bg: (i: number) => { config: { priority: number; screenSize: number; charBaseIndex: number } }; windows?: { winObjEnabled: boolean }; oam: Array<{ paletteBank: number }> };
  gPlttBufferFaded?: { get?: (i: number) => number; set?: (i: number, v: number) => void };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _mshAtkSpriteId(): number {
  const b = _mshItf().getAttacker?.() ?? 0;
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}
/** Slot OBJ du sprite de l'attacker (paletteBank OAM), -1 si introuvable. */
function _mshAtkPalSlot(): number {
  const spriteId = _mshAtkSpriteId();
  const sp = spriteId !== 0xFF ? _mshRt().gSprites?.get(spriteId) : undefined;
  if (!sp) return -1;
  const oam = _mshRt().gba?.oam[sp.oamIndex] as { paletteBank?: number } | undefined;
  return oam?.paletteBank ?? -1;
}

/** 1:1 AnimTask_MetallicShine (battle_anim_dark.c.c:822). args = [permanent, useColor, color]. */
function AnimTask_MetallicShine(task: _MshTask): void {
  const itf = _mshItf();
  const args = itf.getArgs?.() ?? [0, 0, 0];
  const rt = _mshRt();
  const g = globalThis as Record<string, unknown>;
  g.gBattle_WIN0H = 0;
  g.gBattle_WIN0V = 0;
  rt.SetGpuReg?.(0x48, 0x3F3F); // WININ all+CLR
  rt.SetGpuReg?.(0x4A, (0x3F << 8) | 0x3D); // WINOUT sans BG1 + WINOBJ all
  if (rt.gba?.windows) rt.gba.windows.winObjEnabled = true;
  rt.SetGpuReg?.(0x50, 0x3F42); // BLDCNT TGT2_ALL | EFFECT_BLEND | TGT1_BG1
  rt.SetGpuReg?.(0x52, 8 | (12 << 8));
  const bg1 = rt.gba?.bg(1)?.config;
  if (bg1) {
    bg1.priority = 0;
    bg1.screenSize = 0;
    bg1.charBaseIndex = 1;
  }
  const spriteId = _mshAtkSpriteId();
  if (spriteId === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as { CreateInvisibleSpriteCopy?: (b: number, s: number, sp: number) => number } | undefined;
  const newSpriteId = mons?.CreateInvisibleSpriteCopy?.(itf.getAttacker?.() ?? 0, spriteId, 0) ?? -1;
  const animBg = _mshBgData();
  _mshLoadMap(animBg.bgId, 'gMetalShineTilemap');
  _mshLoadGfx(animBg.bgId, 'gMetalShineGfx', animBg.tilesOffset);
  _mshLoadPal('gMetalShinePalette', animBg.paletteId);
  const sp = rt.gSprites?.get(spriteId);
  g.gBattle_BG1_X = (-(sp?.x ?? 0) + 96) & 0xFFFF;
  g.gBattle_BG1_Y = (-(sp?.y ?? 0) + 32) & 0xFFFF;
  const monPalSlot = sp ? (rt.gba?.oam[sp.oamIndex]?.paletteBank ?? 0) : 0;
  // 1:1 battle_anim_dark.c.c:880-885 : grayscale (battle_anim_mons.c.c:1374) ou BlendPalette(couleur).
  if ((args[1] | 0) === 0) {
    _dSetGrayPal(16 + monPalSlot, false);
  } else {
    _mshBlend(256 + monPalSlot * 16, 16, 11, args[2] | 0);
  }
  task.data[0] = newSpriteId;
  task.data[1] = args[0] | 0;  // permanent
  task.data[2] = args[1] | 0;  // useColor
  task.data[3] = args[2] | 0;  // color
  task.data[6] = 0;            // priorityChanged (single)
  task.data[10] = 0;
  task.data[11] = 0;
  task.func = _MetallicShine_Step;
}
/** 1:1 AnimTask_MetallicShine_Step (battle_anim_dark.c.c:895). */
function _MetallicShine_Step(task: _MshTask): void {
  const rt = _mshRt();
  const g = globalThis as Record<string, unknown>;
  task.data[10] += 4;
  g.gBattle_BG1_X = (((g.gBattle_BG1_X as number) | 0) - 4) & 0xFFFF;
  if (task.data[10] === 128) {
    task.data[10] = 0;
    g.gBattle_BG1_X = (((g.gBattle_BG1_X as number) | 0) + 128) & 0xFFFF;
    task.data[11]++;
    if (task.data[11] === 2) {
      // 1:1 battle_anim_dark.c.c:910-913 : restore REEL — paletteNum recalculé sur le sprite
      // de l'attacker, copie Unfaded→Faded si pas permanent.
      if (task.data[1] === 0) {
        const slot = _mshAtkPalSlot();
        if (slot >= 0) _dSetGrayPal(16 + slot, true);
      }
      if (task.data[0] >= 0) rt.DestroySprite?.(task.data[0]);
      const animBg = _mshBgData();
      _mshClearBg(animBg.bgId);
    } else if (task.data[11] === 3) {
      g.gBattle_WIN0H = 0;
      g.gBattle_WIN0V = 0;
      rt.SetGpuReg?.(0x48, 0x3F3F);
      rt.SetGpuReg?.(0x4A, 0x3F3F); // WINOUT all (teardown)
      const bg1 = rt.gba?.bg(1)?.config;
      if (bg1) bg1.charBaseIndex = 0;
      if (rt.gba?.windows) rt.gba.windows.winObjEnabled = false;
      rt.SetGpuReg?.(0x50, 0);
      rt.SetGpuReg?.(0x52, 0);
      _mshItf().DestroyAnimVisualTask?.(task.taskId);
    }
  }
}
_dRegT({ AnimTask_MetallicShine: AnimTask_MetallicShine as never });

// --- VAGUE F75 : MEMENTO (battle_anim_dark.c.c:408-795) -----------------------------------
// L'ombre du mon s'étire et se fait aspirer (attacker) puis s'abat sur la
// cible : scanline VOFS par ligne (étirement) + fenêtre WIN0 pincée + blend.
// AnimTask_InitMementoShadow / AnimTask_MoveAttackerMementoShadow(+Step) /
// AnimTask_MoveTargetMementoShadow(+Step) / DoMementoShadowEffect /
// SetAllBattlersSpritePriority.
import {
  gScanlineEffect as _dkScanFx,
  gScanlineEffectRegBuffers as _dkScanBufs,
  ScanlineEffect_SetParams as _dkScanSetParams,
} from './scanline_effect';
import {
  MoveBattlerSpriteToBG as _dkMoveToBG,
  IsBattlerSpriteVisible as _dkIsVisible,
  GetBattleAnimBg1Data as _dkBgData,
} from '../engine/battle/battle-anim-interpreter';
import {
  GetBattlerSpriteBGPriorityRank as _dkBgRank,
  GetBattlerSpriteCoord as _dkCoord,
} from './battle_anim_mons';
import { getMonBackPicCoords as _dkBackCoords, getMonFrontPicCoords as _dkFrontCoords } from './data/mon_pic_coords';
import { gBattlerPartyIndexes as _dkPartyIdx } from '../engine/battle/state';
import { gEnemyParty as _dkEnemyParty, gPlayerParty as _dkPlayerParty, GetMonData as _dkGetMon, MON_DATA_SPECIES as _dkSpeciesK } from '../engine/battle/party-storage';
import { reverseDecompConstant as _dkRevConst } from '../engine/system/decomp-constants';

const _DK_REG_BG1VOFS = 0x16;
const _DK_REG_BG2VOFS = 0x1A;
const _DK_REG_WININ = 0x48;
const _DK_REG_WINOUT = 0x4A;
const _DK_REG_BLDCNT = 0x50;
const _DK_REG_BLDALPHA = 0x52;

type _DkTask = { taskId: number; data: number[]; func?: unknown };
function _dkRtFull(): {
  SetGpuReg?: (o: number, v: number) => void;
  gSprites?: Map<number, { oamIndex: number; invisible?: boolean }>;
  gba?: { oam: Array<{ priority: number }> };
  gPlttBufferUnfaded?: { set?: (i: number, v: number) => void };
  gPlttBufferFaded?: { set?: (i: number, v: number) => void };
} {
  return ((globalThis as Record<string, unknown>).__rt as never) ?? {};
}
function _dkMonSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(battler) ?? 0xFF;
}
function _dkG(name: string): number {
  return ((globalThis as Record<string, unknown>)[name] as number) ?? 0;
}
function _dkSetG(name: string, v: number): void {
  (globalThis as Record<string, unknown>)[name] = v;
}
/** 1:1 GetBattlerSpriteCoordAttr — cases TOP seule utilisée par Memento
 *  (pattern locale, cf. effects_3.ts:463 ; dette douce : transform species). */
function _dkCoordAttrTop(battler: number): number {
  const party = (battler & 1) !== 0 ? _dkEnemyParty : _dkPlayerParty;
  const species = _dkGetMon(party[_dkPartyIdx[battler]] as never, _dkSpeciesK) as number;
  const name = _dkRevConst(species, 'SPECIES_') ?? 'SPECIES_NONE';
  const coords = (battler & 1) === 0 ? _dkBackCoords(name) : _dkFrontCoords(name);
  return _dkCoord(battler, 3 /* Y_PIC_OFFSET */) - ((coords.h / 2) | 0);
}
/** 1:1 FillPalette(RGB_BLACK, slot BG, 32) : 16 entrées Unfaded+Faded à 0. */
function _dkFillPaletteBlack(bgSlot: number): void {
  const rt = _dkRtFull();
  for (let i = 0; i < 16; i++) {
    rt.gPlttBufferUnfaded?.set?.(bgSlot * 16 + i, 0);
    rt.gPlttBufferFaded?.set?.(bgSlot * 16 + i, 0);
  }
}
/** 1:1 SetAllBattlersSpritePriority (battle_anim_dark.c.c:780). */
function _dkSetAllBattlersSpritePriority(priority: number): void {
  const rt = _dkRtFull();
  for (let i = 0; i < 4; i++) {
    const sid = _dkMonSpriteId(i);
    if (sid === 0xFF) continue;
    const sp = rt.gSprites?.get(sid);
    const oam = sp ? rt.gba?.oam[sp.oamIndex] : undefined;
    if (oam) oam.priority = priority;
  }
}
/** 1:1 DoMementoShadowEffect (battle_anim_dark.c.c:723) : VOFS interpolés par scanline. */
function _DoMementoShadowEffect(task: _DkTask): void {
  const buf = _dkScanBufs[_dkScanFx.srcBuffer];
  const var2 = (task.data[5] - task.data[4]) | 0;
  if (var2 !== 0) {
    const var0 = Math.trunc(task.data[13] / var2);
    let var1 = task.data[6] << 8;
    for (let i = 0; i < task.data[4]; i++) {
      buf[i] = (task.data[10] - (i - 159)) & 0xFFFF;
    }
    let i = task.data[4];
    for (; i <= task.data[5]; i++) {
      if (i >= 0) {
        const var3 = ((var1 >> 8) - i) | 0;
        buf[i] = (var3 + task.data[10]) & 0xFFFF;
      }
      var1 += var0;
    }
    let var4 = task.data[10] - (i - 159);
    for (; i < task.data[7]; i++) {
      if (i >= 0) {
        buf[i] = var4 & 0xFFFF;
        var4--;
      }
    }
  } else {
    let var4 = task.data[10] + 159;
    for (let i = 0; i < 112; i++) {
      _dkScanBufs[0][i] = var4 & 0xFFFF;
      _dkScanBufs[1][i] = var4 & 0xFFFF;
      var4--;
    }
  }
}
/** 1:1 AnimTask_InitMementoShadow (battle_anim_dark.c.c:781) : mon (+partner) vers le BG anim. */
function AnimTask_InitMementoShadow(task: _DkTask): void {
  const itf = _dItf3();
  const atk = itf.getAttacker?.() ?? 0;
  const toBG2 = (_dkBgRank(atk) ^ 1) !== 0 ? 1 : 0;
  _dkMoveToBG(atk, !!toBG2, true);
  const rt = _dkRtFull();
  const atkSp = rt.gSprites?.get(_dkMonSpriteId(atk));
  if (atkSp) atkSp.invisible = false;
  const partner = atk ^ 2;
  if (_dkIsVisible(partner)) {
    _dkMoveToBG(partner, !(toBG2 !== 0), true);
    const pSp = rt.gSprites?.get(_dkMonSpriteId(partner));
    if (pSp) pSp.invisible = false;
  }
  itf.DestroyAnimVisualTask?.(task.taskId);
}
/** 1:1 AnimTask_MoveAttackerMementoShadow (battle_anim_dark.c.c:408). */
function AnimTask_MoveAttackerMementoShadow(task: _DkTask): void {
  const itf = _dItf3();
  const atk = itf.getAttacker?.() ?? 0;
  const rt = _dkRtFull();
  task.data[7] = _dkCoord(atk, 1 /* Y */) + 31;
  task.data[6] = _dkCoordAttrTop(atk) - 7;
  task.data[5] = task.data[7];
  task.data[4] = task.data[6];
  task.data[13] = (task.data[7] - task.data[6]) << 8;
  const pos = _dkCoord(atk, 0 /* X */);
  task.data[14] = pos - 32;
  task.data[15] = pos + 32;
  task.data[8] = (atk & 1) === 0 ? -12 : -64; // B_SIDE_PLAYER ? -12 : -64
  task.data[3] = _dkBgRank(atk);
  let dmaDest: number;
  let var0: number;
  if (task.data[3] === 1) {
    const animBg = _dkBgData();
    task.data[10] = _dkG('gBattle_BG1_Y');
    rt.SetGpuReg?.(_DK_REG_BLDCNT, 0x3F41); // TGT2_ALL | EFFECT_BLEND | TGT1_BG1
    _dkFillPaletteBlack(animBg.paletteId);
    dmaDest = _DK_REG_BG1VOFS;
    var0 = 0x02; // WINOUT_WIN01_BG1
    _dkSetG('gBattle_BG2_X', _dkG('gBattle_BG2_X') + 240);
  } else {
    task.data[10] = _dkG('gBattle_BG2_Y');
    rt.SetGpuReg?.(_DK_REG_BLDCNT, 0x3F44); // TGT2_ALL | EFFECT_BLEND | TGT1_BG2
    _dkFillPaletteBlack(9);
    dmaDest = _DK_REG_BG2VOFS;
    var0 = 0x04; // WINOUT_WIN01_BG2
    _dkSetG('gBattle_BG1_X', _dkG('gBattle_BG1_X') + 240);
  }
  task.data[11] = 0;
  task.data[12] = 16;
  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = 0;
  _dkSetAllBattlersSpritePriority(3);
  for (let i = 0; i < 112; i++) {
    _dkScanBufs[0][i] = task.data[10] & 0xFFFF;
    _dkScanBufs[1][i] = task.data[10] & 0xFFFF;
  }
  _dkScanSetParams({ dmaDest, dmaControl: 0 /* 16BIT */, initState: 1, unused9: 0 } as never);
  // WINOUT = WINOBJ all+CLR | (var0 ^ WIN01 all+CLR)
  rt.SetGpuReg?.(_DK_REG_WINOUT, (0x3F << 8) | (var0 ^ 0x3F));
  rt.SetGpuReg?.(_DK_REG_WININ, 0x3F3F);
  _dkSetG('gBattle_WIN0H', ((task.data[14] & 0xFF) << 8) | (task.data[15] & 0xFF));
  _dkSetG('gBattle_WIN0V', 160); // DISPLAY_HEIGHT
  task.func = _MoveAttackerMementoShadow_Step;
}
/** 1:1 AnimTask_MoveAttackerMementoShadow_Step (battle_anim_dark.c.c:479). */
function _MoveAttackerMementoShadow_Step(task: _DkTask): void {
  const rt = _dkRtFull();
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        if (++task.data[2] & 1) {
          if (task.data[11] !== 12) task.data[11]++;
        } else {
          if (task.data[12] !== 8) task.data[12]--;
        }
        rt.SetGpuReg?.(_DK_REG_BLDALPHA, (task.data[11] & 0xFF) | ((task.data[12] & 0xFF) << 8));
        if (task.data[11] === 12 && task.data[12] === 8) task.data[0]++;
      }
      break;
    case 1:
      task.data[4] -= 8;
      _DoMementoShadowEffect(task);
      if (task.data[4] < task.data[8]) task.data[0]++;
      break;
    case 2:
      task.data[4] -= 8;
      _DoMementoShadowEffect(task);
      task.data[14] += 4;
      task.data[15] -= 4;
      if (task.data[14] >= task.data[15]) task.data[14] = task.data[15];
      _dkSetG('gBattle_WIN0H', ((task.data[14] & 0xFF) << 8) | (task.data[15] & 0xFF));
      if (task.data[14] === task.data[15]) task.data[0]++;
      break;
    case 3:
      _dkScanFx.state = 3;
      task.data[0]++;
      break;
    case 4:
      _dItf3().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
/** 1:1 AnimTask_MoveTargetMementoShadow (battle_anim_dark.c.c:537), branche combat. */
function AnimTask_MoveTargetMementoShadow(task: _DkTask): void {
  const itf = _dItf3();
  const tgt = itf.getTarget?.() ?? 1;
  const rt = _dkRtFull();
  switch (task.data[0]) {
    case 0:
      task.data[3] = _dkBgRank(tgt);
      if (task.data[3] === 1) {
        rt.SetGpuReg?.(_DK_REG_BLDCNT, 0x3F41);
        _dkSetG('gBattle_BG2_X', _dkG('gBattle_BG2_X') + 240);
      } else {
        rt.SetGpuReg?.(_DK_REG_BLDCNT, 0x3F44);
        _dkSetG('gBattle_BG1_X', _dkG('gBattle_BG1_X') + 240);
      }
      task.data[0]++;
      break;
    case 1:
      if (task.data[3] === 1) {
        const animBg = _dkBgData();
        task.data[10] = _dkG('gBattle_BG1_Y');
        _dkFillPaletteBlack(animBg.paletteId);
      } else {
        task.data[10] = _dkG('gBattle_BG2_Y');
        _dkFillPaletteBlack(9);
      }
      _dkSetAllBattlersSpritePriority(3);
      task.data[0]++;
      break;
    case 2: {
      task.data[7] = _dkCoord(tgt, 1) + 31;
      task.data[6] = _dkCoordAttrTop(tgt) - 7;
      task.data[13] = (task.data[7] - task.data[6]) << 8;
      const x = _dkCoord(tgt, 0);
      task.data[14] = x - 4;
      task.data[15] = x + 4;
      task.data[8] = (tgt & 1) === 0 ? -12 : -64;
      task.data[4] = task.data[8];
      task.data[5] = task.data[8];
      task.data[11] = 12;
      task.data[12] = 8;
      task.data[0]++;
      break;
    }
    case 3: {
      const dmaDest = task.data[3] === 1 ? _DK_REG_BG1VOFS : _DK_REG_BG2VOFS;
      for (let i = 0; i < 112; i++) {
        _dkScanBufs[0][i] = (task.data[10] + (159 - i)) & 0xFFFF;
        _dkScanBufs[1][i] = (task.data[10] + (159 - i)) & 0xFFFF;
      }
      _dkScanSetParams({ dmaDest, dmaControl: 0, initState: 1, unused9: 0 } as never);
      task.data[0]++;
      break;
    }
    case 4:
      // WINOUT : WINOBJ all+CLR | WIN01 sans le BG du mon (BG1 ou BG2)
      if (task.data[3] === 1) rt.SetGpuReg?.(_DK_REG_WINOUT, (0x3F << 8) | 0x3D);
      else rt.SetGpuReg?.(_DK_REG_WINOUT, (0x3F << 8) | 0x3B);
      rt.SetGpuReg?.(_DK_REG_WININ, 0x3F3F);
      _dkSetG('gBattle_WIN0H', ((task.data[14] & 0xFF) << 8) | (task.data[15] & 0xFF));
      _dkSetG('gBattle_WIN0V', 160);
      task.data[0] = 0;
      task.data[1] = 0;
      task.data[2] = 0;
      rt.SetGpuReg?.(_DK_REG_BLDALPHA, 12 | (8 << 8));
      task.func = _MoveTargetMementoShadow_Step;
      break;
  }
}
/** 1:1 AnimTask_MoveTargetMementoShadow_Step (battle_anim_dark.c.c:645). */
function _MoveTargetMementoShadow_Step(task: _DkTask): void {
  const rt = _dkRtFull();
  switch (task.data[0]) {
    case 0:
      task.data[5] += 8;
      if (task.data[5] >= task.data[7]) task.data[5] = task.data[7];
      _DoMementoShadowEffect(task);
      if (task.data[5] === task.data[7]) task.data[0]++;
      break;
    case 1:
      if (task.data[15] - task.data[14] < 0x40) {
        task.data[14] -= 4;
        task.data[15] += 4;
      } else {
        task.data[1] = 1;
      }
      _dkSetG('gBattle_WIN0H', ((task.data[14] & 0xFF) << 8) | (task.data[15] & 0xFF));
      task.data[4] += 8;
      if (task.data[4] >= task.data[6]) task.data[4] = task.data[6];
      _DoMementoShadowEffect(task);
      if (task.data[4] === task.data[6] && task.data[1]) {
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        task.data[2]++;
        if (task.data[2] & 1) {
          if (task.data[11]) task.data[11]--;
        } else {
          if (task.data[12] < 16) task.data[12]++;
        }
        rt.SetGpuReg?.(_DK_REG_BLDALPHA, (task.data[11] & 0xFF) | ((task.data[12] & 0xFF) << 8));
        if (task.data[11] === 0 && task.data[12] === 16) task.data[0]++;
      }
      break;
    case 3:
      _dkScanFx.state = 3;
      task.data[0]++;
      break;
    case 4:
      _dkSetG('gBattle_WIN0H', 0);
      _dkSetG('gBattle_WIN0V', 0);
      rt.SetGpuReg?.(_DK_REG_WININ, 0x3F3F);
      rt.SetGpuReg?.(_DK_REG_WINOUT, 0x3F3F);
      _dItf3().DestroyAnimVisualTask?.(task.taskId);
      break;
  }
}
_dRegT({
  AnimTask_InitMementoShadow: AnimTask_InitMementoShadow as never,
  AnimTask_MoveAttackerMementoShadow: AnimTask_MoveAttackerMementoShadow as never,
  AnimTask_MoveTargetMementoShadow: AnimTask_MoveTargetMementoShadow as never,
});

/** 1:1 AnimTask_MementoHandleBg (battle_anim_dark.c.c:796) : rend le(s) BG anim au combat. */
import { ResetBattleAnimBg as _dkResetBg } from '../engine/battle/battle-anim-interpreter';
function AnimTask_MementoHandleBg(task: _DkTask): void {
  const itf = _dItf3();
  const atk = itf.getAttacker?.() ?? 0;
  const toBG2 = (_dkBgRank(atk) ^ 1) !== 0;
  _dkResetBg(toBG2);
  if (_dkIsVisible(atk ^ 2)) _dkResetBg(!toBG2);
  itf.DestroyAnimVisualTask?.(task.taskId);
}
_dRegT({ AnimTask_MementoHandleBg: AnimTask_MementoHandleBg as never });
