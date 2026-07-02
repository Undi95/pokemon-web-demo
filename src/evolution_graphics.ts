/**
 * evolution_graphics.ts — MIROIR 1:1 de `src/evolution_graphics.c`
 * (D:/Projet 1/decomps/pokeemeraude/src/evolution_graphics.c, 693 lignes).
 *
 * Les « étincelles » de la scène d'évolution : 4 effets tasks (spirale montante,
 * arc descendant, cercle convergent, spray+flash) + le cycle grow/shrink des
 * sprites pré/post-évolution (CycleEvolutionMonSprite). Consommé UNIQUEMENT par
 * evolution_scene.ts (Task_EvolutionScene / Task_TradeEvolutionScene).
 *
 * COUVERTURE COMPLÈTE (37/37 fonctions + 5 tables data) — port 2026-07-02.
 *
 * Divergences plateforme (assumées, pipeline assets) :
 *   - `INCGFX` sEvoSparkle_Gfx/_Pal = PNG pré-extrait `/decomp/em/misc/evo_sparkle.png`
 *     (tiles via loadTileBin, palette via PLTE) — fetch async dans
 *     LoadEvoSparkleSpriteAndPal (caller evolution_scene est déjà async-boot).
 *   - `oam.matrixNum`/`oam.affineMode` décomp = `sprite.matrixNum`/`sprite.affineMode`
 *     chez nous (syncSpritesToOam propage vers l'OAM chaque frame).
 *   - Les matrices 20-31 sont écrites DIRECT par SetEvoSparklesMatrices (convention
 *     décomp = matrices partagées, PAS AllocOamMatrix) — comme la ROM.
 */
import { CreateTask, DestroyTask } from './task';
import { getRuntime, PlaySE, LoadCompressedSpriteSheetUsingHeap, assetCache } from '../harness/runtime/decomp-globals';
import { CreateSprite, DestroySprite, SetOamMatrix, LoadSpritePalettes } from './sprite';
import { BeginNormalPaletteFade } from './palette';
import { Sin, Cos } from './trig';
import { Random } from './random';
import { loadTileBin, extractPngPlte } from '../harness/gba/png-loader';
import {
  SE_M_MEGA_KICK, SE_M_BUBBLE_BEAM2, SE_SHINY, SE_M_PETAL_DANCE,
} from '../include/constants/songs';

// Types plateforme (mêmes vues que battle_anim_* : sprite/task du runtime).
type EvoSprite = {
  x: number; y: number; x2: number; y2: number;
  data: number[]; invisible: boolean; subpriority: number;
  matrixNum: number; affineMode: number;
  callback: ((sprite: EvoSprite) => void) | null;
  spriteId: number;
};
type EvoTask = { data: number[]; taskId: number; func: unknown; isActive: boolean };
const _rt = () => getRuntime();
const _task = (taskId: number): EvoTask => _rt().gTasks[taskId] as unknown as EvoTask;
const _setTaskFunc = (taskId: number, fn: (taskId: number) => void): void => {
  // 1:1 décomp `gTasks[taskId].func = fn` — nos task fns runtime reçoivent (task),
  // les ports 1:1 travaillent par taskId → mini-adaptateur par assignation.
  (_task(taskId) as { func: unknown }).func = (t: { taskId: number }) => fn(t.taskId);
};
const _createTask = (fn: (taskId: number) => void, priority: number): number =>
  CreateTask((t: { taskId: number }) => fn(t.taskId), priority);

/** 1:1 décomp `#define TAG_SPARKLE 1001`. */
const TAG_SPARKLE = 1001;

// ─── Data 1:1 (evolution_graphics.c:41-111) ──────────────────────────────────

// 1:1 `sEvoSparkle_Pal` / `sEvoSparkle_Gfx` (INCGFX evo_sparkle.png) — remplis au
// fetch (LoadEvoSparkleSpriteAndPal), consommés par les 2 tables ci-dessous.
let sEvoSparkle_Pal: Uint16Array | null = null;
let sEvoSparkle_Gfx: Uint8Array | null = null;

/** 1:1 `sEvoSparkleSpriteSheets` — {sEvoSparkle_Gfx, 0x20, TAG_SPARKLE} + terminator.
 *  data = clé assetCache (posée par LoadEvoSparkleSpriteAndPal). */
const sEvoSparkleSpriteSheets = [
  { data: 'sEvoSparkle_Gfx', size: 0x20, tag: TAG_SPARKLE },
  { data: null, size: 0, tag: 0 },
];

/** 1:1 `sOamData_EvoSparkle` (8x8, 4bpp, priority 1). */
const sOamData_EvoSparkle = {
  y: 160 /* DISPLAY_HEIGHT */, affineMode: 0 /* ST_OAM_AFFINE_OFF */, objMode: 0,
  mosaic: false, bpp: 0 /* ST_OAM_4BPP */, shape: 0 as const /* SPRITE_SHAPE(8x8) */,
  x: 0, matrixNum: 0, size: 0 as const /* SPRITE_SIZE(8x8) */, tileNum: 0,
  priority: 1, paletteNum: 0, affineParam: 0,
};

/** 1:1 `sSpriteAnim_EvoSparkle` : ANIMCMD_FRAME(0, 8) + ANIMCMD_END. */
const sSpriteAnim_EvoSparkle = [
  { type: 'frame', imageValue: 0, duration: 8 },
  { type: 'end' },
];

/** 1:1 `sSpriteAnimTable_EvoSparkle`. */
const sSpriteAnimTable_EvoSparkle = [sSpriteAnim_EvoSparkle];

/** 1:1 `sEvoSparkleSpriteTemplate`. */
const sEvoSparkleSpriteTemplate = {
  tileTag: TAG_SPARKLE,
  paletteTag: TAG_SPARKLE,
  oam: sOamData_EvoSparkle,
  anims: sSpriteAnimTable_EvoSparkle,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: SpriteCB_Sparkle_Dummy as (sprite: unknown) => void,
};

/** 1:1 `sEvoSparkleMatrices` (evolution_graphics.c:95-99) — 12 facteurs d'échelle
 *  (Q8.8 inverses) pour les matrices OAM partagées 20..31. */
const sEvoSparkleMatrices: readonly number[] = [
  0x3C0, 0x380, 0x340, 0x300, 0x2C0, 0x280,
  0x240, 0x200, 0x1C0, 0x180, 0x140, 0x100,
];

/** 1:1 `sUnused` (evolution_graphics.c:101-111) — table morte, conservée miroir. */
const sUnused: readonly number[] = [
  -4, 0x10, -3, 0x30, -2, 0x50, -1, 0x70,
  1, 0x70, 2, 0x50, 3, 0x30, 4, 0x10,
];
void sUnused;

// ─── Sprite callbacks sparkles (1:1 :113-281) ────────────────────────────────

function SpriteCB_Sparkle_Dummy(_sprite: EvoSprite): void {
}

/** 1:1 `SetEvoSparklesMatrices` (:118-123) : SetOamMatrix(20+i, m, 0, 0, m). */
function SetEvoSparklesMatrices(): void {
  for (let i = 0; i < sEvoSparkleMatrices.length; i++)
    SetOamMatrix(20 + i, sEvoSparkleMatrices[i], 0, 0, sEvoSparkleMatrices[i]);
}

// #define sSpeed data[3] · sAmplitude data[5] · sTrigIdx data[6] · sTimer data[7]

/** 1:1 `SpriteCB_Sparkle_SpiralUpward` (:130-156). */
function SpriteCB_Sparkle_SpiralUpward(sprite: EvoSprite): void {
  if (sprite.y > 8) {
    sprite.y = 88 - Math.trunc((sprite.data[7] * sprite.data[7]) / 80);
    sprite.y2 = Math.trunc(Sin(sprite.data[6] & 0xFF, sprite.data[5]) / 4);
    sprite.x2 = Cos(sprite.data[6] & 0xFF, sprite.data[5]);
    sprite.data[6] += 4;
    if (sprite.data[7] & 1)
      sprite.data[5]--;
    sprite.data[7]++;
    if (sprite.y2 > 0)
      sprite.subpriority = 1;
    else
      sprite.subpriority = 20;
    let matrixNum = Math.trunc(sprite.data[5] / 4) + 20;
    if (matrixNum > 31)
      matrixNum = 31;
    sprite.matrixNum = matrixNum;
  } else {
    DestroySprite(sprite.spriteId);
  }
}

/** 1:1 `CreateSparkle_SpiralUpward` (:158-170). */
function CreateSparkle_SpiralUpward(trigIdx: number): void {
  const spriteId = CreateSprite(sEvoSparkleSpriteTemplate, 240 / 2 /* DISPLAY_WIDTH/2 */, 88, 0);
  if (spriteId !== 64 /* MAX_SPRITES */) {
    const s = _rt().gSprites[spriteId] as unknown as EvoSprite;
    s.data[5] = 48;
    s.data[6] = trigIdx;
    s.data[7] = 0;
    s.affineMode = 1;  // 1:1 oam.affineMode = ST_OAM_AFFINE_NORMAL
    s.matrixNum = 31;  // 1:1 oam.matrixNum
    s.callback = SpriteCB_Sparkle_SpiralUpward;
  }
}

/** 1:1 `SpriteCB_Sparkle_ArcDown` (:172-186). */
function SpriteCB_Sparkle_ArcDown(sprite: EvoSprite): void {
  if (sprite.y < 88) {
    sprite.y = 8 + Math.trunc((sprite.data[7] * sprite.data[7]) / 5);
    sprite.y2 = Math.trunc(Sin(sprite.data[6] & 0xFF, sprite.data[5]) / 4);
    sprite.x2 = Cos(sprite.data[6] & 0xFF, sprite.data[5]);
    sprite.data[5] = 8 + Sin((sprite.data[7] * 4) & 0xFF, 40);
    sprite.data[7]++;
  } else {
    DestroySprite(sprite.spriteId);
  }
}

/** 1:1 `CreateSparkle_ArcDown` (:188-201). */
function CreateSparkle_ArcDown(trigIdx: number): void {
  const spriteId = CreateSprite(sEvoSparkleSpriteTemplate, 240 / 2, 8, 0);
  if (spriteId !== 64) {
    const s = _rt().gSprites[spriteId] as unknown as EvoSprite;
    s.data[5] = 8;
    s.data[6] = trigIdx;
    s.data[7] = 0;
    s.affineMode = 1;
    s.matrixNum = 25;
    s.subpriority = 1;
    s.callback = SpriteCB_Sparkle_ArcDown;
  }
}

/** 1:1 `SpriteCB_Sparkle_CircleInward` (:203-216). */
function SpriteCB_Sparkle_CircleInward(sprite: EvoSprite): void {
  if (sprite.data[5] > 8) {
    sprite.y2 = Sin(sprite.data[6] & 0xFF, sprite.data[5]);
    sprite.x2 = Cos(sprite.data[6] & 0xFF, sprite.data[5]);
    sprite.data[5] -= sprite.data[3];
    sprite.data[6] += 4;
  } else {
    DestroySprite(sprite.spriteId);
  }
}

/** 1:1 `CreateSparkle_CircleInward` (:218-232). */
function CreateSparkle_CircleInward(trigIdx: number, speed: number): void {
  const spriteId = CreateSprite(sEvoSparkleSpriteTemplate, 240 / 2, 56, 0);
  if (spriteId !== 64) {
    const s = _rt().gSprites[spriteId] as unknown as EvoSprite;
    s.data[3] = speed;
    s.data[5] = 120;
    s.data[6] = trigIdx;
    s.data[7] = 0;
    s.affineMode = 1;
    s.matrixNum = 31;
    s.subpriority = 1;
    s.callback = SpriteCB_Sparkle_CircleInward;
  }
}

/** 1:1 `SpriteCB_Sparkle_Spray` (:234-266). */
function SpriteCB_Sparkle_Spray(sprite: EvoSprite): void {
  if (!(sprite.data[7] & 3))
    sprite.y++;
  if (sprite.data[6] < 128) {
    sprite.y2 = -Sin(sprite.data[6] & 0xFF, sprite.data[5]);
    sprite.x = (240 / 2) + Math.trunc((sprite.data[3] * sprite.data[7]) / 3);
    sprite.data[6]++;
    let matrixNum = 31 - Math.trunc(sprite.data[6] * 12 / 128);
    if (sprite.data[6] > 64) {
      sprite.subpriority = 1;
    } else {
      sprite.invisible = false;
      sprite.subpriority = 20;
      if (sprite.data[6] > 112 && (sprite.data[6] & 1))
        sprite.invisible = true;
    }
    if (matrixNum < 20)
      matrixNum = 20;
    sprite.matrixNum = matrixNum;
    sprite.data[7]++;
  } else {
    DestroySprite(sprite.spriteId);
  }
}

/** 1:1 `CreateSparkle_Spray` (:268-281). NB : le param `id` décomp est INUTILISÉ
 *  (speed/amplitude viennent de Random()) — conservé pour la signature. */
function CreateSparkle_Spray(_id: number): void {
  const spriteId = CreateSprite(sEvoSparkleSpriteTemplate, 240 / 2, 56, 0);
  if (spriteId !== 64) {
    const s = _rt().gSprites[spriteId] as unknown as EvoSprite;
    s.data[3] = 3 - (Random() % 7);
    s.data[5] = 48 + (Random() & 0x3F);
    s.data[7] = 0;
    s.affineMode = 1;
    s.matrixNum = 31;
    s.subpriority = 20;
    s.callback = SpriteCB_Sparkle_Spray;
  }
}

/** 1:1 `LoadEvoSparkleSpriteAndPal` (:283-287) : sheet + palette taguées TAG_SPARKLE.
 *  Plateforme : fetch PNG pré-extrait (1er appel), puis chargement par tag. ASYNC —
 *  await par EvolutionScene/TradeEvolutionScene (setup déjà async chez nous). */
export async function LoadEvoSparkleSpriteAndPal(): Promise<void> {
  if (!sEvoSparkle_Gfx || !sEvoSparkle_Pal) {
    sEvoSparkle_Gfx = await loadTileBin('/decomp/em/misc/evo_sparkle.png', 4);
    sEvoSparkle_Pal = (await extractPngPlte('/decomp/em/misc/evo_sparkle.png')) ?? new Uint16Array(16);
  }
  assetCache.set('sEvoSparkle_Gfx', sEvoSparkle_Gfx);
  LoadCompressedSpriteSheetUsingHeap(sEvoSparkleSpriteSheets[0]);
  // 1:1 `LoadSpritePalettes(sEvoSparkleSpritePals)` — table {data, tag} + terminator.
  LoadSpritePalettes([
    { data: sEvoSparkle_Pal.subarray(0, 16), tag: TAG_SPARKLE },
    { data: null, tag: 0 },
  ]);
}

// #define tPalNum data[1] · tTimer data[15]

/** 1:1 `EvolutionSparkles_SpiralUpward(palNum)` (:292-297). */
export function EvolutionSparkles_SpiralUpward(palNum: number): number {
  const taskId = _createTask(Task_Sparkles_SpiralUpward_Init, 0);
  _task(taskId).data[1] = palNum;
  return taskId;
}

/** 1:1 `Task_Sparkles_SpiralUpward_Init` (:299-306). */
function Task_Sparkles_SpiralUpward_Init(taskId: number): void {
  SetEvoSparklesMatrices();
  _task(taskId).data[15] = 0;
  BeginNormalPaletteFade((3 << _task(taskId).data[1]) >>> 0, 0xA, 0, 0x10, 0x7FFF /* RGB_WHITE */);
  _setTaskFunc(taskId, Task_Sparkles_SpiralUpward);
  PlaySE(SE_M_MEGA_KICK); // 'Charging up' sound for the sparkles as they spiral upwards
}

/** 1:1 `Task_Sparkles_SpiralUpward` (:308-325). */
function Task_Sparkles_SpiralUpward(taskId: number): void {
  const data = _task(taskId).data;
  if (data[15] < 64) {
    if (!(data[15] & 7)) {
      for (let i = 0; i < 4; i++)
        CreateSparkle_SpiralUpward((data[15] & 120) * 2 + i * 64);
    }
    data[15]++;
  } else {
    data[15] = 96;
    _setTaskFunc(taskId, Task_Sparkles_SpiralUpward_End);
  }
}

/** 1:1 `Task_Sparkles_SpiralUpward_End` (:327-333). */
function Task_Sparkles_SpiralUpward_End(taskId: number): void {
  if (_task(taskId).data[15] !== 0)
    _task(taskId).data[15]--;
  else
    DestroyTask(taskId);
}

/** 1:1 `EvolutionSparkles_ArcDown` (:335-338). */
export function EvolutionSparkles_ArcDown(): number {
  return _createTask(Task_Sparkles_ArcDown_Init, 0);
}

/** 1:1 `Task_Sparkles_ArcDown_Init` (:340-346). */
function Task_Sparkles_ArcDown_Init(taskId: number): void {
  SetEvoSparklesMatrices();
  _task(taskId).data[15] = 0;
  _setTaskFunc(taskId, Task_Sparkles_ArcDown);
  PlaySE(SE_M_BUBBLE_BEAM2);
}

/** 1:1 `Task_Sparkles_ArcDown` (:348-364). */
function Task_Sparkles_ArcDown(taskId: number): void {
  const data = _task(taskId).data;
  if (data[15] < 96) {
    if (data[15] < 6) {
      for (let i = 0; i < 9; i++)
        CreateSparkle_ArcDown(i * 16);
    }
    data[15]++;
  } else {
    _setTaskFunc(taskId, Task_Sparkles_ArcDown_End);
  }
}

/** 1:1 `Task_Sparkles_ArcDown_End` (:366-369). */
function Task_Sparkles_ArcDown_End(taskId: number): void {
  DestroyTask(taskId);
}

/** 1:1 `EvolutionSparkles_CircleInward` (:371-374). */
export function EvolutionSparkles_CircleInward(): number {
  return _createTask(Task_Sparkles_CircleInward_Init, 0);
}

/** 1:1 `Task_Sparkles_CircleInward_Init` (:376-382). */
function Task_Sparkles_CircleInward_Init(taskId: number): void {
  SetEvoSparklesMatrices();
  _task(taskId).data[15] = 0;
  _setTaskFunc(taskId, Task_Sparkles_CircleInward);
  PlaySE(SE_SHINY);
}

/** 1:1 `Task_Sparkles_CircleInward` (:384-406). */
function Task_Sparkles_CircleInward(taskId: number): void {
  const data = _task(taskId).data;
  if (data[15] < 48) {
    if (data[15] === 0) {
      for (let i = 0; i < 16; i++)
        CreateSparkle_CircleInward(i * 16, 4);
    }
    if (data[15] === 32) {
      for (let i = 0; i < 16; i++)
        CreateSparkle_CircleInward(i * 16, 8);
    }
    data[15]++;
  } else {
    _setTaskFunc(taskId, Task_Sparkles_CircleInward_End);
  }
}

/** 1:1 `Task_Sparkles_CircleInward_End` (:408-411). */
function Task_Sparkles_CircleInward_End(taskId: number): void {
  DestroyTask(taskId);
}

// #define tSpecies data[2] // Never read

/** 1:1 `EvolutionSparkles_SprayAndFlash(species)` (:415-420). */
export function EvolutionSparkles_SprayAndFlash(species: number): number {
  const taskId = _createTask(Task_Sparkles_SprayAndFlash_Init, 0);
  _task(taskId).data[2] = species;
  return taskId;
}

/** Copie 1:1 `CpuCopy16(&gPlttBufferFaded[BG_PLTT_ID(2)], &gPlttBufferUnfaded[BG_PLTT_ID(2)],
 *  3 * PLTT_SIZE_4BPP)` — fige l'état fadé (fond noirci) comme nouvelle référence
 *  pendant le flash blanc (48 entrées à partir du slot BG 2). */
function _copyFadedToUnfadedBgPal2to4(): void {
  const r = _rt();
  for (let i = 0; i < 48; i++)
    r.gPlttBufferUnfaded.set(32 + i, r.gPlttBufferFaded.get(32 + i));
}

/** 1:1 `Task_Sparkles_SprayAndFlash_Init` (:422-430). */
function Task_Sparkles_SprayAndFlash_Init(taskId: number): void {
  SetEvoSparklesMatrices();
  _task(taskId).data[15] = 0;
  _copyFadedToUnfadedBgPal2to4();
  BeginNormalPaletteFade(0xFFF9041C, 0, 0, 0x10, 0x7FFF /* RGB_WHITE */); // was 0xFFF9001C in R/S
  _setTaskFunc(taskId, Task_Sparkles_SprayAndFlash);
  PlaySE(SE_M_PETAL_DANCE);
}

/** 1:1 `Task_Sparkles_SprayAndFlash` (:432-457). */
function Task_Sparkles_SprayAndFlash(taskId: number): void {
  const data = _task(taskId).data;
  if (data[15] < 128) {
    switch (data[15]) {
      default:
        if (data[15] < 50)
          CreateSparkle_Spray(Random() & 7);
        break;
      case 0:
        for (let i = 0; i < 8; i++)
          CreateSparkle_Spray(i);
        break;
      case 32:
        BeginNormalPaletteFade(0xFFFF041C, 0x10, 0x10, 0, 0x7FFF /* RGB_WHITE */); // was 0xFFF9001C in R/S
        break;
    }
    data[15]++;
  } else {
    _setTaskFunc(taskId, Task_Sparkles_SprayAndFlash_End);
  }
}

/** 1:1 `Task_Sparkles_SprayAndFlash_End` (:459-463). */
function Task_Sparkles_SprayAndFlash_End(taskId: number): void {
  if (!_rt().gPaletteFade.active)
    DestroyTask(taskId);
}

/** 1:1 `EvolutionSparkles_SprayAndFlash_Trade(species)` (:466-471) —
 *  « Separate from EvolutionSparkles_SprayAndFlash for difference in fade color ». */
export function EvolutionSparkles_SprayAndFlash_Trade(species: number): number {
  const taskId = _createTask(Task_Sparkles_SprayAndFlashTrade_Init, 0);
  _task(taskId).data[2] = species;
  return taskId;
}

/** 1:1 `Task_Sparkles_SprayAndFlashTrade_Init` (:473-481). */
function Task_Sparkles_SprayAndFlashTrade_Init(taskId: number): void {
  SetEvoSparklesMatrices();
  _task(taskId).data[15] = 0;
  _copyFadedToUnfadedBgPal2to4();
  BeginNormalPaletteFade(0xFFF90400, 0, 0, 0x10, 0x7FFF /* RGB_WHITE */); // was 0xFFFF0001 in R/S
  _setTaskFunc(taskId, Task_Sparkles_SprayAndFlashTrade);
  PlaySE(SE_M_PETAL_DANCE);
}

/** 1:1 `Task_Sparkles_SprayAndFlashTrade` (:483-508). */
function Task_Sparkles_SprayAndFlashTrade(taskId: number): void {
  const data = _task(taskId).data;
  if (data[15] < 128) {
    switch (data[15]) {
      default:
        if (data[15] < 50)
          CreateSparkle_Spray(Random() & 7);
        break;
      case 0:
        for (let i = 0; i < 8; i++)
          CreateSparkle_Spray(i);
        break;
      case 32:
        BeginNormalPaletteFade(0xFFFF0400, 0x10, 0x10, 0, 0x7FFF /* RGB_WHITE */); // was 0xFFFF0001 in R/S
        break;
    }
    data[15]++;
  } else {
    _setTaskFunc(taskId, Task_Sparkles_SprayAndFlash_End);
  }
}

// ─── CycleEvolutionMonSprite (1:1 :513-693) ──────────────────────────────────

function SpriteCB_EvolutionMonSprite(_sprite: EvoSprite): void {
}

// #define tPreEvoSpriteId data[1] · tPostEvoSpriteId data[2] · tPreEvoScale data[3]
// #define tPostEvoScale data[4] · tShowingPostEvo data[5] · tScaleSpeed data[6]
// #define tEvoStopped data[8]

const MATRIX_PRE_EVO = 30;
const MATRIX_POST_EVO = 31;
const MON_MAX_SCALE = 256;
const MON_MIN_SCALE = 16;

/** 1:1 `CycleEvolutionMonSprite(preEvoSpriteId, postEvoSpriteId)` (:533-567) :
 *  alterne grow/shrink des deux sprites mon (matrices 30/31) — les deux palettes
 *  OBJ passent BLANC (CpuSet monPalette) pendant le cycle. Retourne le taskId
 *  (evolution_scene poll `.isActive` + set tEvoStopped sur B). */
export function CycleEvolutionMonSprite(preEvoSpriteId: number, postEvoSpriteId: number): number {
  const r = _rt();
  const monPalette = new Uint16Array(16).fill(0x7FFF /* RGB_WHITE */);

  const taskId = _createTask(Task_CycleEvolutionMonSprite_Init, 0);
  const data = _task(taskId).data;
  data[1] = preEvoSpriteId;
  data[2] = postEvoSpriteId;
  data[3] = MON_MAX_SCALE;
  data[4] = MON_MIN_SCALE;

  const toDiv = 65536;
  SetOamMatrix(MATRIX_PRE_EVO, MON_MAX_SCALE, 0, 0, MON_MAX_SCALE);
  SetOamMatrix(MATRIX_POST_EVO, Math.trunc(toDiv / data[4]), 0, 0, Math.trunc(toDiv / data[4]));

  const pre = r.gSprites[preEvoSpriteId] as unknown as EvoSprite & { oam?: { paletteNum?: number } };
  const post = r.gSprites[postEvoSpriteId] as unknown as EvoSprite & { oam?: { paletteNum?: number } };
  const preOam = r.gba.oam[(pre as unknown as { oamIndex: number }).oamIndex];
  const postOam = r.gba.oam[(post as unknown as { oamIndex: number }).oamIndex];

  pre.callback = SpriteCB_EvolutionMonSprite;
  pre.affineMode = 1;  // ST_OAM_AFFINE_NORMAL
  pre.matrixNum = MATRIX_PRE_EVO;
  pre.invisible = false;
  // 1:1 CpuSet(monPalette, &gPlttBufferFaded[OBJ_PLTT_ID(paletteNum)], 16) — OBJ = 256+.
  for (let i = 0; i < 16; i++)
    r.gPlttBufferFaded.set(256 + (preOam?.paletteBank ?? 0) * 16 + i, monPalette[i]);

  post.callback = SpriteCB_EvolutionMonSprite;
  post.affineMode = 1;
  post.matrixNum = MATRIX_POST_EVO;
  post.invisible = false;
  for (let i = 0; i < 16; i++)
    r.gPlttBufferFaded.set(256 + (postOam?.paletteBank ?? 0) * 16 + i, monPalette[i]);

  data[8] = 0;  // tEvoStopped = FALSE
  return taskId;
}

/** 1:1 `Task_CycleEvolutionMonSprite_Init` (:569-574). */
function Task_CycleEvolutionMonSprite_Init(taskId: number): void {
  const data = _task(taskId).data;
  data[5] = 0;   // tShowingPostEvo = FALSE
  data[6] = 8;   // tScaleSpeed
  _setTaskFunc(taskId, Task_CycleEvolutionMonSprite_TryEnd);
}

/** 1:1 `Task_CycleEvolutionMonSprite_TryEnd` (:578-594). */
function Task_CycleEvolutionMonSprite_TryEnd(taskId: number): void {
  const data = _task(taskId).data;
  if (data[8]) {                       // tEvoStopped
    EndOnPreEvoMon(taskId);
  } else if (data[6] === 128) {        // tScaleSpeed
    EndOnPostEvoMon(taskId);
  } else {
    data[6] += 2;
    data[5] ^= 1;                      // tShowingPostEvo
    _setTaskFunc(taskId, Task_CycleEvolutionMonSprite_UpdateSize);
  }
}

/** 1:1 `Task_CycleEvolutionMonSprite_UpdateSize` (:596-667). */
function Task_CycleEvolutionMonSprite_UpdateSize(taskId: number): void {
  const data = _task(taskId).data;
  if (data[8]) {                       // tEvoStopped
    _setTaskFunc(taskId, EndOnPreEvoMon);
  } else {
    let numSpritesFinished = 0;
    if (!data[5]) {                    // !tShowingPostEvo
      // Set pre-evo sprite growth
      if (data[3] < MON_MAX_SCALE - data[6]) {
        data[3] += data[6];
      } else {
        data[3] = MON_MAX_SCALE;
        numSpritesFinished++;
      }
      // Set post-evo sprite shrink
      if (data[4] > MON_MIN_SCALE + data[6]) {
        data[4] -= data[6];
      } else {
        data[4] = MON_MIN_SCALE;
        numSpritesFinished++;
      }
    } else {
      // Set post-evo sprite growth
      if (data[4] < MON_MAX_SCALE - data[6]) {
        data[4] += data[6];
      } else {
        data[4] = MON_MAX_SCALE;
        numSpritesFinished++;
      }
      // Set pre-evo sprite shrink
      if (data[3] > MON_MIN_SCALE + data[6]) {
        data[3] -= data[6];
      } else {
        data[3] = MON_MIN_SCALE;
        numSpritesFinished++;
      }
    }

    // Grow/shrink pre-evo sprite
    let oamMatrixArg = Math.trunc(65536 / data[3]);
    SetOamMatrix(MATRIX_PRE_EVO, oamMatrixArg, 0, 0, oamMatrixArg);

    // Grow/shrink post-evo sprite
    oamMatrixArg = Math.trunc(65536 / data[4]);
    SetOamMatrix(MATRIX_POST_EVO, oamMatrixArg, 0, 0, oamMatrixArg);

    // Both sprites have reached their size extreme
    if (numSpritesFinished === 2)
      _setTaskFunc(taskId, Task_CycleEvolutionMonSprite_TryEnd);
  }
}

/** 1:1 `EndOnPostEvoMon` (:669-680). */
function EndOnPostEvoMon(taskId: number): void {
  const r = _rt();
  const data = _task(taskId).data;
  const pre = r.gSprites[data[1]] as unknown as EvoSprite | undefined;
  const post = r.gSprites[data[2]] as unknown as EvoSprite | undefined;
  if (pre) { pre.affineMode = 0; pre.matrixNum = 0; pre.invisible = true; }
  if (post) { post.affineMode = 0; post.matrixNum = 0; post.invisible = false; }
  DestroyTask(taskId);
}

/** 1:1 `EndOnPreEvoMon` (:682-693). */
function EndOnPreEvoMon(taskId: number): void {
  const r = _rt();
  const data = _task(taskId).data;
  const pre = r.gSprites[data[1]] as unknown as EvoSprite | undefined;
  const post = r.gSprites[data[2]] as unknown as EvoSprite | undefined;
  if (pre) { pre.affineMode = 0; pre.matrixNum = 0; pre.invisible = false; }
  if (post) { post.affineMode = 0; post.matrixNum = 0; post.invisible = true; }
  DestroyTask(taskId);
}
