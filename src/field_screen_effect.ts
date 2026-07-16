/**
 * field_screen_effect.ts — miroir 1:1 décomp `src/field_screen_effect.c` (1266 l).
 *
 * PORTÉ ICI (1:1) :
 *  - Data : sFlashLevelToRadius, gMaxFlashLevel, sFlashEffectParams.
 *  - Fades : FillPalBufferWhite/Black (ré-export decomp-globals), FadeInFromBlack,
 *    FadeInFromWhite.
 *  - FLASH grotte (cœur mission) : SetFlashScanlineEffectWindowBoundary(ies),
 *    WriteFlashScanlineEffectBuffer, WriteBattlePyramidViewScanlineEffectBuffer,
 *    UpdateFlashLevelEffect, Task_WaitForFlashUpdate, StartWaitForFlashUpdate,
 *    StartUpdateFlashLevelEffect, AnimateFlash, GetFlashLevel.
 *  - ORBE (Groudon/Kyogre — DETTE CLIMAX) : SetOrbFlashScanlineEffectWindowBoundary(ies),
 *    UpdateOrbFlashEffect, StartUpdateOrbFlashEffect, LoadOrbEffectPalette,
 *    UpdateOrbEffectBlend, Task_OrbEffect, DoOrbEffect, FadeOutOrbEffect.
 *  - Script/continuation : WaitForWeatherFadeIn, Task_WaitForFadeAndEnableScriptCtx,
 *    FieldCB_ContinueScript(HandleMusic), PaletteFadeActive, getExitTaskKindFor.
 *
 * === Chemin FLASH 1:1 (remplace l'ex-rustine harness/gba/flash-mask.ts) ===
 * Le décomp fait la pénombre de grotte par fenêtre WIN0 par-scanline : chaque HBlank,
 * un DMA écrit `gScanlineEffectRegBuffers[buf][y]` dans REG_WIN0H → le bord gauche/droit
 * du cercle de vision pour la ligne y. INTÉRIEUR WIN0 = tous les BG visibles (map),
 * EXTÉRIEUR = WINOUT = BG0 seul (vide en grotte → noir). Le compositor du port rend
 * WIN0 par-scanline (`hblankCallback(y)` compositor.ts:268 → win0.x1/x2) et le runtime
 * route WIN0H→win0.x1/x2, WININ→win0Inside, WINOUT→winOut, DISPCNT_WIN0_ON→win0.enabled.
 * Le setup complet (WININ/WINOUT/DISPCNT_WIN0_ON) est posé au map load par
 * `InitOverworldGraphicsRegisters` (overworld.ts:1124, 1:1 overworld.c:2096) ; le scanline
 * lui-même est armé par `InitCurrentFlashLevelScanlineEffect` (overworld.ts, 1:1
 * overworld.c:1794) qui appelle `WriteFlashScanlineEffectBuffer` + ScanlineEffect_SetParams
 * (via ponts globalThis anti-cycle, cf. bas de fichier).
 *
 * === Adaptations moteur (// HW-emu — logique 1:1) ===
 *  - `ScanlineEffectParams.dmaControl` = marqueur `SCANLINE_EFFECT_DMACNT_16BIT`
 *    (scanline_effect.ts) au lieu du raw DMA control C. Le flash EST 16-bit (le C
 *    `sFlashEffectParams.dmaControl` n'a PAS le flag DMA_16BIT/32BIT — DMA_16BIT=0 —
 *    donc == SCANLINE_EFFECT_DMACNT_16BIT côté décomp).
 *  - `dmaDest` = REG_OFFSET_WIN0H (0x40) au lieu de `&REG_WIN0H`.
 *  - Tasks : le runtime passe l'OBJET task aux func → wrapper `(t)=>fn(t.taskId)` +
 *    tag `funcRef` pour que FuncIsActiveTask/FindTaskIdByFunc (decomp-globals, fallback
 *    funcRef) retrouvent la func d'origine (pattern evolution_scene.ts:167-176).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/field_screen_effect.c
 */

import { FadeScreen, FADE_FROM_BLACK, FADE_FROM_WHITE, IsWeatherNotFadingIn } from './field_weather';
import {
  FillPalBufferBlack, FillPalBufferWhite, CpuFastSet, LoadPalette,
  FuncIsActiveTask, FindTaskIdByFunc, BgDmaFill,
} from '../harness/runtime/decomp-globals';
import { CreateTask, DestroyTask, gTasks } from './task';
import { LockPlayerFieldControls, ScriptContext_Enable } from './script';
import { MetatileBehavior_IsDoor, MetatileBehavior_IsNonAnimDoor } from './metatile_behavior';
import { MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './fieldmap';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
// ── ANTI-TDZ : l'import STATIQUE de './overworld' fermait un cycle ESM (pokemon_storage_system
// → field_screen_effect → overworld → … → TDZ PLAYER_AVATAR_FLAG_ON_FOOT au top-level
// d'overworld.ts:1397 → boot entier mort). Import DIFFÉRÉ (précédents : pokenav.ts:120,
// region_map.ts anti-TDZ) — Overworld_PlaySpecialMapMusic n'est appelée qu'à l'exécution (:555).
let _owPlaySpecialMapMusic: (() => void) | null = null;
import('./overworld').then((m) => { _owPlaySpecialMapMusic = m.Overworld_PlaySpecialMapMusic; })
  .catch((e) => console.error('[field_screen_effect] import overworld (anti-TDZ) a échoué', e));
function Overworld_PlaySpecialMapMusic(): void {
  if (!_owPlaySpecialMapMusic) { console.error('[field_screen_effect] Overworld_PlaySpecialMapMusic appelée avant résolution de l\'import overworld'); return; }
  _owPlaySpecialMapMusic();
}
import { SetGpuReg, GetGpuReg } from './gpu_regs';
import { SetGpuRegBits, ClearGpuRegBits } from '../harness/runtime/decomp-helpers';
import { ScheduleBgCopyTilemapToVram } from './window';
import {
  gScanlineEffect, gScanlineEffectRegBuffers,
  ScanlineEffect_SetParams, ScanlineEffect_Stop, ScanlineEffect_Clear,
  SCANLINE_EFFECT_DMACNT_16BIT, type ScanlineEffectParams,
} from './scanline_effect';
import { SetCameraPanning, SetCameraPanningCallback, InstallCameraPanAheadCallback } from './field_camera';
import { VarGet } from './engine/script/script-vars';

// SignalWaitState : pont globalThis anti-cycle (posé par scrcmd.ts) — l'import statique
// tirait le byte-VM entier dans le sous-arbre d'éval de field_player_avatar (TDZ).
function SignalWaitState(): void {
  ((globalThis as Record<string, unknown>).__SignalWaitState as (() => void) | undefined)?.();
}

// ─── Constantes GBA io_reg.h (registres + bits fenêtre/blend) ────────────────
// REG_OFFSET absolus (io_reg.h). Le runtime SetGpuReg/GetGpuReg route par offset.
const REG_OFFSET_DISPCNT = 0x000;
const REG_OFFSET_BLDCNT = 0x050;
const REG_OFFSET_BLDALPHA = 0x052;
const REG_OFFSET_WIN0H = 0x040;
const REG_OFFSET_WININ = 0x048;
const REG_OFFSET_WINOUT = 0x04A;
// Bits fenêtre/affichage (io_reg.h) — utilisés par Task_OrbEffect.
const DISPCNT_WIN1_ON = 0x4000;
const WININ_WIN0_BG_ALL = 0x0F;   // BG0|BG1|BG2|BG3
const WININ_WIN0_OBJ = 0x10;
const WININ_WIN0_CLR = 0x20;
const WINOUT_WIN01_BG1 = 0x02;
const WINOUT_WIN01_BG2 = 0x04;
const WINOUT_WIN01_BG3 = 0x08;
const WINOUT_WIN01_OBJ = 0x10;
/** 1:1 `gOrbEffectBackgroundLayerFlags[]` (io_reg.c:31) = { BLDCNT_TGT1_BG0..BG3 }. */
const gOrbEffectBackgroundLayerFlags: readonly number[] = [0x01, 0x02, 0x04, 0x08];
/** 1:1 `BLDALPHA_BLEND(a, b)` (gba/io_reg.h) = a | (b << 8). */
const BLDALPHA_BLEND = (a: number, b: number): number => (a & 0x1F) | ((b & 0x1F) << 8);
/** 1:1 `PIXEL_FILL(n)` (gba/defines.h) — remplit un octet 4bpp de 2 pixels de couleur n. */
const PIXEL_FILL = (n: number): number => (n) | (n << 4);
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 160;
const DISPLAY_TILE_WIDTH = 30;
const DISPLAY_TILE_HEIGHT = 20;
/** 1:1 constants/rgb.h (BGR555). */
const RGB_RED = 0x001F;
const RGB_BLUE = 0x7C00;

// ─── Helper task (wrapper (t)=>fn(t.taskId) + tag funcRef) ────────────────────
// Le runtime passe l'objet task ; nos func 1:1 prennent le taskId. Le tag funcRef
// permet à FuncIsActiveTask/FindTaskIdByFunc (decomp-globals, fallback funcRef) de
// retrouver la func d'origine (pattern evolution_scene.ts:172-176).
type TaskById = (taskId: number) => void;
function _createTask(fn: TaskById, priority: number): number {
  const id = CreateTask((t: { taskId: number }) => fn(t.taskId), priority);
  (gTasks[id] as unknown as { funcRef?: unknown }).funcRef = fn;
  return id;
}

// ─── SetBgTilemapPalette : accès paresseux (dép. bg.c hébergée hors 1:1 —
// pokemon_summary_screen.ts, module lourd/interdit → pont globalThis pour éviter
// le cycle ESM). No-op HURLANT si absent (l'Orbe reste fonctionnel sans la teinte). ─
function _setBgTilemapPalette(bg: number, x: number, y: number, w: number, h: number, pal: number): void {
  const fn = (globalThis as Record<string, unknown>).__SetBgTilemapPalette as
    ((bg: number, x: number, y: number, w: number, h: number, pal: number) => void) | undefined;
  if (fn) fn(bg, x, y, w, h, pal);
  else console.error('[field_screen_effect] __SetBgTilemapPalette absent — teinte Orbe skip (à exposer depuis bg.c)');
}

// data[0] = state universel des tasks de ce fichier (1:1 `#define tState data[0]`).

/** 1:1 décomp `sFlashLevelToRadius[]` (field_screen_effect.c:53) — rayon (px) du cercle
 *  de vision par niveau de flash (index 0 = pleine vue, 8 = noir total). */
export const sFlashLevelToRadius: readonly number[] = [200, 72, 64, 56, 48, 40, 32, 24, 0];

/** 1:1 décomp `const s32 gMaxFlashLevel = ARRAY_COUNT(sFlashLevelToRadius) - 1` (:54). */
export const gMaxFlashLevel = sFlashLevelToRadius.length - 1;  // = 8

/** 1:1 décomp `static const struct ScanlineEffectParams sFlashEffectParams` (:56).
 *  HW-emu : dmaDest = REG_OFFSET_WIN0H (0x40) ; dmaControl = marqueur 16-bit
 *  (le C `((DMA_ENABLE|DMA_START_HBLANK|DMA_REPEAT|DMA_DEST_RELOAD)<<16)|1` n'a PAS
 *  le flag DMA_16BIT — DMA_16BIT=0 — donc == SCANLINE_EFFECT_DMACNT_16BIT). initState=1. */
const sFlashEffectParams: ScanlineEffectParams = {
  dmaDest: REG_OFFSET_WIN0H,
  dmaControl: SCANLINE_EFFECT_DMACNT_16BIT,
  initState: 1,
  unused9: 0,
};

// ─── Fades (1:1 field_screen_effect.c:64-99) ─────────────────────────────────
// FillPalBufferWhite/Black : 1:1 (:64/:69), hébergées decomp-globals — ré-exportées ici
// (foyer 1:1). CpuFastFill16(RGB_WHITE/BLACK, gPlttBufferFaded, PLTT_SIZE).
export { FillPalBufferWhite, FillPalBufferBlack };

/** 1:1 décomp `void FadeInFromWhite(void)` (field_screen_effect.c:89). */
export function FadeInFromWhite(): void {
  FillPalBufferWhite();
  FadeScreen(FADE_FROM_WHITE, 8);
}

/** 1:1 décomp `void FadeInFromBlack(void)` (field_screen_effect.c:95). */
export function FadeInFromBlack(): void {
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
}

// ─── GetFlashLevel (1:1 overworld.c:988) ─────────────────────────────────────
// Hébergée overworld.c mais lue par tout le sous-système flash → définie ici
// (source de vérité = gSaveBlock1Ptr->flashLevel, posé par SetFlashLevel/
// SetDefaultFlashLevel). Exposée globalThis.GetFlashLevel (battle_setup transition FLASH).
/** 1:1 décomp `u8 GetFlashLevel(void)` (overworld.c:988) : `return gSaveBlock1Ptr->flashLevel`. */
export function GetFlashLevel(): number {
  return gSaveBlock1Ptr.flashLevel & 0xF;
}

// ─── Scanline windows du FLASH (1:1 field_screen_effect.c:766-838) ───────────

/** 1:1 décomp `SetFlashScanlineEffectWindowBoundary` (:766) — pose le WIN0H (left|right
 *  clampé 0..255) de la scanline y dans `dest[y]` (= (left<<8)|right). */
function SetFlashScanlineEffectWindowBoundary(dest: Uint16Array, y: number, left: number, right: number): void {
  if (y <= 160) {
    if (left < 0) left = 0;
    if (left > 255) left = 255;
    if (right < 0) right = 0;
    if (right > 255) right = 255;
    dest[y] = ((left << 8) | right) & 0xFFFF;
  }
}

/** 1:1 décomp `SetFlashScanlineEffectWindowBoundaries` (:782) — trace un cercle (algo
 *  de Bresenham / midpoint) de centre (centerX, centerY) et rayon `radius` en écrivant
 *  les bords WIN0H de chaque scanline dans `dest`. */
function SetFlashScanlineEffectWindowBoundaries(dest: Uint16Array, centerX: number, centerY: number, radius: number): void {
  let r = radius;
  let v2 = radius;
  let v3 = 0;
  while (r >= v3) {
    SetFlashScanlineEffectWindowBoundary(dest, centerY - v3, centerX - r, centerX + r);
    SetFlashScanlineEffectWindowBoundary(dest, centerY + v3, centerX - r, centerX + r);
    SetFlashScanlineEffectWindowBoundary(dest, centerY - r, centerX - v3, centerX + v3);
    SetFlashScanlineEffectWindowBoundary(dest, centerY + r, centerX - v3, centerX + v3);
    v2 -= (v3 * 2) - 1;
    v3++;
    if (v2 < 0) {
      v2 += 2 * (r - 1);
      r--;
    }
  }
}

/** 1:1 décomp `SetOrbFlashScanlineEffectWindowBoundary` (:803) — variante Orbe (clamp
 *  0..240 au lieu de 0..255). */
function SetOrbFlashScanlineEffectWindowBoundary(dest: Uint16Array, y: number, left: number, right: number): void {
  if (y <= 160) {
    if (left < 0) left = 0;
    if (left > 240) left = 240;
    if (right < 0) right = 0;
    if (right > 240) right = 240;
    dest[y] = ((left << 8) | right) & 0xFFFF;
  }
}

/** 1:1 décomp `SetOrbFlashScanlineEffectWindowBoundaries` (:819). */
function SetOrbFlashScanlineEffectWindowBoundaries(dest: Uint16Array, centerX: number, centerY: number, radius: number): void {
  let r = radius;
  let v2 = radius;
  let v3 = 0;
  while (r >= v3) {
    SetOrbFlashScanlineEffectWindowBoundary(dest, centerY - v3, centerX - r, centerX + r);
    SetOrbFlashScanlineEffectWindowBoundary(dest, centerY + v3, centerX - r, centerX + r);
    SetOrbFlashScanlineEffectWindowBoundary(dest, centerY - r, centerX - v3, centerX + v3);
    SetOrbFlashScanlineEffectWindowBoundary(dest, centerY + r, centerX - v3, centerX + v3);
    v2 -= (v3 * 2) - 1;
    v3++;
    if (v2 < 0) {
      v2 += 2 * (r - 1);
      r--;
    }
  }
}

// ─── Task UpdateFlashLevelEffect (1:1 field_screen_effect.c:840-879) ──────────
// Champs data (1:1 #define :840-845).
const tFlashCenterX = 1, tFlashCenterY = 2, tCurFlashRadius = 3;
const tDestFlashRadius = 4, tFlashRadiusDelta = 5, tClearScanlineEffect = 6;

/** 1:1 décomp `static void UpdateFlashLevelEffect(u8 taskId)` (:847). Anime le rayon
 *  (2 passes/frame : state 0→1 réécrit le buffer, state 1 incrémente le rayon). */
function UpdateFlashLevelEffect(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0]) {
    case 0:
      SetFlashScanlineEffectWindowBoundaries(
        gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer], data[tFlashCenterX], data[tFlashCenterY], data[tCurFlashRadius]);
      data[0] = 1;
      break;
    case 1:
      SetFlashScanlineEffectWindowBoundaries(
        gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer], data[tFlashCenterX], data[tFlashCenterY], data[tCurFlashRadius]);
      data[0] = 0;
      data[tCurFlashRadius] += data[tFlashRadiusDelta];
      if (data[tCurFlashRadius] > data[tDestFlashRadius]) {
        if (data[tClearScanlineEffect] === 1) {
          ScanlineEffect_Stop();
          data[0] = 2;
        } else {
          DestroyTask(taskId);
        }
      }
      break;
    case 2:
      ScanlineEffect_Clear();
      DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `static void UpdateOrbFlashEffect(u8 taskId)` (:881). Idem mais boundaries Orbe. */
function UpdateOrbFlashEffect(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0]) {
    case 0:
      SetOrbFlashScanlineEffectWindowBoundaries(
        gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer], data[tFlashCenterX], data[tFlashCenterY], data[tCurFlashRadius]);
      data[0] = 1;
      break;
    case 1:
      SetOrbFlashScanlineEffectWindowBoundaries(
        gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer], data[tFlashCenterX], data[tFlashCenterY], data[tCurFlashRadius]);
      data[0] = 0;
      data[tCurFlashRadius] += data[tFlashRadiusDelta];
      if (data[tCurFlashRadius] > data[tDestFlashRadius]) {
        if (data[tClearScanlineEffect] === 1) {
          ScanlineEffect_Stop();
          data[0] = 2;
        } else {
          DestroyTask(taskId);
        }
      }
      break;
    case 2:
      ScanlineEffect_Clear();
      DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `static void Task_WaitForFlashUpdate(u8 taskId)` (:915) — réactive le
 *  contexte script quand UpdateFlashLevelEffect a fini. */
function Task_WaitForFlashUpdate(taskId: number): void {
  if (!FuncIsActiveTask(UpdateFlashLevelEffect)) {
    ScriptContext_Enable();
    SignalWaitState();   // pont waitstate du port (reprise byte-VM), en plus du status RUNNING.
    DestroyTask(taskId);
  }
}

/** 1:1 décomp `static void StartWaitForFlashUpdate(void)` (:924). */
function StartWaitForFlashUpdate(): void {
  if (!FuncIsActiveTask(Task_WaitForFlashUpdate))
    _createTask(Task_WaitForFlashUpdate, 80);
}

/** 1:1 décomp `static u8 StartUpdateFlashLevelEffect(...)` (:930). */
function StartUpdateFlashLevelEffect(
  centerX: number, centerY: number, initialFlashRadius: number, destFlashRadius: number,
  clearScanlineEffect: number, delta: number,
): number {
  const taskId = _createTask(UpdateFlashLevelEffect, 80);
  const data = gTasks[taskId].data;
  data[tCurFlashRadius] = initialFlashRadius;
  data[tDestFlashRadius] = destFlashRadius;
  data[tFlashCenterX] = centerX;
  data[tFlashCenterY] = centerY;
  data[tClearScanlineEffect] = clearScanlineEffect;
  if (initialFlashRadius < destFlashRadius) data[tFlashRadiusDelta] = delta;
  else data[tFlashRadiusDelta] = -delta;
  return taskId;
}

/** 1:1 décomp `static u8 StartUpdateOrbFlashEffect(...)` (:949). */
function StartUpdateOrbFlashEffect(
  centerX: number, centerY: number, initialFlashRadius: number, destFlashRadius: number,
  clearScanlineEffect: number, delta: number,
): number {
  const taskId = _createTask(UpdateOrbFlashEffect, 80);
  const data = gTasks[taskId].data;
  data[tCurFlashRadius] = initialFlashRadius;
  data[tDestFlashRadius] = destFlashRadius;
  data[tFlashCenterX] = centerX;
  data[tFlashCenterY] = centerY;
  data[tClearScanlineEffect] = clearScanlineEffect;
  if (initialFlashRadius < destFlashRadius) data[tFlashRadiusDelta] = delta;
  else data[tFlashRadiusDelta] = -delta;
  return taskId;
}

/** 1:1 décomp `void AnimateFlash(u8 newFlashLevel)` (:974). Anime le rayon de vision du
 *  niveau courant (GetFlashLevel) vers newFlashLevel. Suppose le scanline effect DÉJÀ
 *  armé (InitCurrentFlashLevelScanlineEffect au map load). */
export function AnimateFlash(newFlashLevel: number): void {
  const curFlashLevel = GetFlashLevel();
  let fullBrightness = false;
  if (newFlashLevel === 0) fullBrightness = true;
  StartUpdateFlashLevelEffect(
    DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2,
    sFlashLevelToRadius[curFlashLevel], sFlashLevelToRadius[newFlashLevel],
    fullBrightness ? 1 : 0, 1);
  StartWaitForFlashUpdate();
  LockPlayerFieldControls();
}

/** true tant que l'anim de flash (UpdateFlashLevelEffect) tourne — pour ScrCmd_animateflash
 *  (bridge poll natif du port ; le décomp fait ScriptContext_Stop + Task_WaitForFlashUpdate). */
export function IsAnimateFlashActive(): boolean {
  return FuncIsActiveTask(UpdateFlashLevelEffect);
}

/** 1:1 décomp `void WriteFlashScanlineEffectBuffer(u8 flashLevel)` (:985) — remplit le
 *  buffer WIN0H du cercle du niveau `flashLevel` (buffer [0] → copié vers [1]). Appelé
 *  au map load par InitCurrentFlashLevelScanlineEffect (overworld.c). */
export function WriteFlashScanlineEffectBuffer(flashLevel: number): void {
  if (flashLevel) {
    SetFlashScanlineEffectWindowBoundaries(
      gScanlineEffectRegBuffers[0], DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, sFlashLevelToRadius[flashLevel]);
    // CpuFastSet(&buf[0], &buf[1], 480) — copie 480 words = tout le buffer (double-buffer C).
    CpuFastSet(gScanlineEffectRegBuffers[0], gScanlineEffectRegBuffers[1], 480);
  }
}

/** 1:1 décomp `void WriteBattlePyramidViewScanlineEffectBuffer(void)` (:994). Rayon =
 *  gSaveBlock2Ptr->frontier.pyramidLightRadius (accès paresseux ; 0 si absent = solo). */
export function WriteBattlePyramidViewScanlineEffectBuffer(): void {
  const sb2 = (globalThis as { gSaveBlock2Ptr?: { frontier?: { pyramidLightRadius?: number } } }).gSaveBlock2Ptr;
  const radius = sb2?.frontier?.pyramidLightRadius ?? 0;
  SetFlashScanlineEffectWindowBoundaries(
    gScanlineEffectRegBuffers[0], DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, radius);
  CpuFastSet(gScanlineEffectRegBuffers[0], gScanlineEffectRegBuffers[1], 480);
}

// ─── ORBE Rouge/Bleu — réveil Groudon/Kyogre (1:1 :1071-1251) ────────────────
// DETTE CLIMAX. Champs data Orbe (1:1 #define :1109-1118).
const tBlueOrb = 1, tCenterX = 2, tCenterY = 3, tShakeDelay = 4, tShakeDir = 5;
const tDispCnt = 6, tBldCnt = 7, tBldAlpha = 8, tWinIn = 9, tWinOut = 10;

/** 1:1 décomp `static void LoadOrbEffectPalette(bool8 blueOrb)` (:1071) — charge la
 *  couleur (rouge/bleu) dans la banque de palette BG 15. */
function LoadOrbEffectPalette(blueOrb: boolean): void {
  const color = new Uint16Array(1);
  color[0] = blueOrb ? RGB_BLUE : RGB_RED;
  // BG_PLTT_ID(15) = 15*16 = 240 ; PLTT_SIZEOF(1) = 2 bytes. 16 écritures d'1 couleur.
  for (let i = 0; i < 16; i++) LoadPalette(color, 15 * 16 + i, 2);
}

/** 1:1 décomp `static bool8 UpdateOrbEffectBlend(u16 shakeDir)` (:1085) — fait converger
 *  BLDALPHA vers (0, 16) (fondu vers plein écran teinté). true quand atteint. */
function UpdateOrbEffectBlend(shakeDir: number): boolean {
  const bldalpha = GetGpuReg(REG_OFFSET_BLDALPHA);
  let lo = bldalpha & 0xFF;
  let hi = (bldalpha >> 8) & 0xFF;
  if (shakeDir !== 0) {
    if (lo) lo--;
  } else {
    if (hi < 16) hi++;
  }
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(lo, hi));
  return lo === 0 && hi === 16;
}

/** 1:1 décomp `static void Task_OrbEffect(u8 taskId)` (:1120). */
function Task_OrbEffect(taskId: number): void {
  const data = gTasks[taskId].data;
  switch (data[0]) {
    case 0:
      data[tDispCnt] = GetGpuReg(REG_OFFSET_DISPCNT);
      data[tBldCnt] = GetGpuReg(REG_OFFSET_BLDCNT);
      data[tBldAlpha] = GetGpuReg(REG_OFFSET_BLDALPHA);
      data[tWinIn] = GetGpuReg(REG_OFFSET_WININ);
      data[tWinOut] = GetGpuReg(REG_OFFSET_WINOUT);
      ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN1_ON);
      SetGpuRegBits(REG_OFFSET_BLDCNT, gOrbEffectBackgroundLayerFlags[0]);
      SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(12, 7));
      SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
      SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2 | WINOUT_WIN01_BG3 | WINOUT_WIN01_OBJ);
      _setBgTilemapPalette(0, 0, 0, DISPLAY_TILE_WIDTH, DISPLAY_TILE_HEIGHT, 0xF);
      ScheduleBgCopyTilemapToVram(0);
      SetOrbFlashScanlineEffectWindowBoundaries(gScanlineEffectRegBuffers[0], data[tCenterX], data[tCenterY], 1);
      CpuFastSet(gScanlineEffectRegBuffers[0], gScanlineEffectRegBuffers[1], 480);
      ScanlineEffect_SetParams(sFlashEffectParams);
      data[0] = 1;
      break;
    case 1:
      BgDmaFill(0, PIXEL_FILL(1), 0, 1);
      LoadOrbEffectPalette(data[tBlueOrb] !== 0);
      StartUpdateOrbFlashEffect(data[tCenterX], data[tCenterY], 1, 160, 1, 2);
      data[0] = 2;
      break;
    case 2:
      if (!FuncIsActiveTask(UpdateOrbFlashEffect)) {
        ScriptContext_Enable();
        SignalWaitState();
        data[0] = 3;
      }
      break;
    case 3:
      InstallCameraPanAheadCallback();
      SetCameraPanningCallback(null);
      data[tShakeDir] = 0;
      data[tShakeDelay] = 4;
      data[0] = 4;
      break;
    case 4:
      if (--data[tShakeDelay] === 0) {
        let panning: number;
        data[tShakeDelay] = 4;
        data[tShakeDir] ^= 1;
        if (data[tShakeDir]) panning = 4;
        else panning = -4;
        SetCameraPanning(0, panning);
      }
      break;
    case 6:
      InstallCameraPanAheadCallback();
      data[tShakeDelay] = 8;
      data[0] = 7;
      break;
    case 7:
      if (--data[tShakeDelay] === 0) {
        data[tShakeDelay] = 8;
        data[tShakeDir] ^= 1;
        if (UpdateOrbEffectBlend(data[tShakeDir])) {
          data[0] = 5;
          BgDmaFill(0, PIXEL_FILL(0), 0, 1);
        }
      }
      break;
    case 5:
      SetGpuReg(REG_OFFSET_WIN0H, 255);
      SetGpuReg(REG_OFFSET_DISPCNT, data[tDispCnt]);
      SetGpuReg(REG_OFFSET_BLDCNT, data[tBldCnt]);
      SetGpuReg(REG_OFFSET_BLDALPHA, data[tBldAlpha]);
      SetGpuReg(REG_OFFSET_WININ, data[tWinIn]);
      SetGpuReg(REG_OFFSET_WINOUT, data[tWinOut]);
      ScriptContext_Enable();
      SignalWaitState();
      DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `void DoOrbEffect(void)` (:1207) — lance l'effet Orbe (centre selon
 *  gSpecialVar_Result : 0=rouge/104, 1=bleu/136, 2=rouge/120, else bleu/120). */
export function DoOrbEffect(): void {
  const taskId = _createTask(Task_OrbEffect, 80);
  const data = gTasks[taskId].data;
  const result = VarGet('VAR_RESULT');   // 1:1 gSpecialVar_Result (backing VAR_RESULT 0x800D).
  if (result === 0) {
    data[tBlueOrb] = 0;   // FALSE
    data[tCenterX] = 104;
  } else if (result === 1) {
    data[tBlueOrb] = 1;   // TRUE
    data[tCenterX] = 136;
  } else if (result === 2) {
    data[tBlueOrb] = 0;
    data[tCenterX] = 120;
  } else {
    data[tBlueOrb] = 1;
    data[tCenterX] = 120;
  }
  data[tCenterY] = 80;
}

/** 1:1 décomp `void FadeOutOrbEffect(void)` (:1236) — bascule Task_OrbEffect en state 6
 *  (fondu de sortie). */
export function FadeOutOrbEffect(): void {
  const taskId = FindTaskIdByFunc(Task_OrbEffect);
  if (taskId !== 0xFF) gTasks[taskId].data[0] = 6;
}

// ─── Script / continuation (1:1 :133-155, 446-482) ───────────────────────────

/** 1:1 décomp `static bool32 WaitForWeatherFadeIn(void)` (:476). */
function WaitForWeatherFadeIn(): boolean {
  return IsWeatherNotFadingIn();
}

/** 1:1 décomp `static void Task_WaitForFadeAndEnableScriptCtx(u8 taskID)` (:133).
 *  `SignalWaitState()` en plus de ScriptContext_Enable : reprise du script suspendu sur
 *  `waitstate` (ScrCmd_waitstate polle le signal). */
function Task_WaitForFadeAndEnableScriptCtx(taskId: number): void {
  if (WaitForWeatherFadeIn()) {
    DestroyTask(taskId);
    ScriptContext_Enable();
    SignalWaitState();
  }
}

/** 1:1 décomp `void FieldCB_ContinueScriptHandleMusic(void)` (:142). */
export function FieldCB_ContinueScriptHandleMusic(): void {
  LockPlayerFieldControls();
  Overworld_PlaySpecialMapMusic();
  FadeInFromBlack();
  _createTask(Task_WaitForFadeAndEnableScriptCtx, 10);
}

/** 1:1 décomp `void FieldCB_ContinueScript(void)` (:150). */
export function FieldCB_ContinueScript(): void {
  LockPlayerFieldControls();
  FadeInFromBlack();
  _createTask(Task_WaitForFadeAndEnableScriptCtx, 10);
}

// ─── SetUpWarpExitTask (1:1 :256) — dispatch exit task ───────────────────────
// Le port utilise l'adaptation harness executeWarp (scène MainCB2) qui consomme ce
// kind pour jouer Task_ExitDoor / Task_ExitNonAnimDoor / Task_ExitNonDoor.

export type ExitTaskKind =
  | 'door'        // MetatileBehavior_IsDoor → Task_ExitDoor (open + walk-down + close)
  | 'non_anim'    // MetatileBehavior_IsNonAnimDoor → Task_ExitNonAnimDoor (walk-down)
  | 'none';       // else → Task_ExitNonDoor (unlock)

/** 1:1 décomp `SetUpWarpExitTask` (:256) — partie dispatch (PlayerGetDestCoords +
 *  MapGridGetMetatileBehaviorAt + MetatileBehavior_IsDoor/IsNonAnimDoor). */
export function getExitTaskKindFor(behavior: number): ExitTaskKind {
  if (MetatileBehavior_IsDoor(behavior)) return 'door';
  if (MetatileBehavior_IsNonAnimDoor(behavior)) return 'non_anim';
  return 'none';
}

/** Read le metatile_behavior à la position courante du player (= `PlayerGetDestCoords +
 *  MapGridGetMetatileBehaviorAt` de SetUpWarpExitTask). */
export function getMetatileBehaviorAtPlayerPos(): number {
  return MapGridGetMetatileBehaviorAt(gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
}

// ─── Ponts globalThis anti-cycle (lus par overworld/scrcmd sans import statique) ─
// overworld.ts::InitCurrentFlashLevelScanlineEffect (1:1 overworld.c:1794) appelle ces
// fns au map load ; un import statique overworld→field_screen_effect (qui importe déjà
// overworld) fermerait un cycle ESM à risque TDZ (cf. mémoire feedback-map-loader-var-tdz).
(globalThis as Record<string, unknown>).__WriteFlashScanlineEffectBuffer = WriteFlashScanlineEffectBuffer;
(globalThis as Record<string, unknown>).__WriteBattlePyramidViewScanlineEffectBuffer = WriteBattlePyramidViewScanlineEffectBuffer;
(globalThis as Record<string, unknown>).__SetupFlashScanlineParams = (): void => ScanlineEffect_SetParams(sFlashEffectParams);
// battle_setup lit globalThis.GetFlashLevel (transition combat FLASH en grotte).
(globalThis as Record<string, unknown>).GetFlashLevel = GetFlashLevel;
// scrcmd::ScrCmd_animateflash (opcode FLASH move / grotte) via pont — un import statique
// scrcmd→field_screen_effect (arête d'éval tôt) risque un TDZ (cf. mémoire).
(globalThis as Record<string, unknown>).__AnimateFlash = AnimateFlash;
(globalThis as Record<string, unknown>).__IsAnimateFlashActive = IsAnimateFlashActive;
// specials-registry (DoOrbEffect/FadeOutOrbEffect) via pont (idem anti-cycle).
(globalThis as Record<string, unknown>).__DoOrbEffect = DoOrbEffect;
(globalThis as Record<string, unknown>).__FadeOutOrbEffect = FadeOutOrbEffect;
