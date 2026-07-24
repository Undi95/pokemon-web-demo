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
  FuncIsActiveTask, FindTaskIdByFunc, BgDmaFill, PlaySE,
} from '../harness/runtime/decomp-globals';
import { CreateTask, DestroyTask, gTasks } from './task';
import { LockPlayerFieldControls, UnlockPlayerFieldControls, ScriptContext_Enable } from './script';
import { SE_WARP_OUT, SE_ESCALATOR, SE_M_EXPLOSION, SE_M_DIG, SE_LAVARIDGE_FALL_WARP } from '../include/constants/songs';
import { Cos, Sin } from './trig';
import { MB_UP_ESCALATOR, MB_DOWN_ESCALATOR } from '../include/constants/metatile_behaviors';
import { FLDEFF_ASH_LAUNCH, FLDEFF_ASH_PUFF } from '../include/constants/field_effects';
import { MetatileBehavior_IsDoor, MetatileBehavior_IsNonAnimDoor } from './metatile_behavior';
import { MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './fieldmap';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
// ── ANTI-TDZ : l'import STATIQUE de './overworld' fermait un cycle ESM (pokemon_storage_system
// → field_screen_effect → overworld → … → TDZ PLAYER_AVATAR_FLAG_ON_FOOT au top-level
// d'overworld.ts:1397 → boot entier mort). Import DIFFÉRÉ (précédents : pokenav.ts:120,
// region_map.ts anti-TDZ) — Overworld_PlaySpecialMapMusic n'est appelée qu'à l'exécution (:555).
let _owPlaySpecialMapMusic: (() => void) | null = null;
// DoFallWarp (field_screen_effect.c:522) réutilise la mécanique de DoDiveWarp (hébergée
// dans overworld.ts par le canal pending-warp) + le pending-warp API — capturés par le
// même import différé (anti-TDZ) pour éviter l'arête statique field_screen_effect→overworld.
let _owDoDiveWarp: (() => void) | null = null;
let _owGetPendingWarp: (() => { warp: unknown; kind: string } | null) | null = null;
let _owSetPendingWarp: ((warp: unknown, kind: string) => void) | null = null;
import('./overworld').then((m) => {
  _owPlaySpecialMapMusic = m.Overworld_PlaySpecialMapMusic;
  _owDoDiveWarp = m.DoDiveWarp;
  _owGetPendingWarp = m.getPendingWarp as unknown as (() => { warp: unknown; kind: string } | null);
  _owSetPendingWarp = m.setPendingWarp as unknown as ((warp: unknown, kind: string) => void);
})
  .catch((e) => console.error('[field_screen_effect] import overworld (anti-TDZ) a échoué', e));
function Overworld_PlaySpecialMapMusic(): void {
  if (!_owPlaySpecialMapMusic) { console.error('[field_screen_effect] Overworld_PlaySpecialMapMusic appelée avant résolution de l\'import overworld'); return; }
  _owPlaySpecialMapMusic();
}
// ── ANTI-TDZ : DoPlayerSpinEntrance/IsPlayerSpinEntranceActive (field_player_avatar) +
// FreezeObjectEvents/UnfreezeObjectEvents (event_object_movement) pour Task_SpinEnterWarp
// (arrivée téléport / Repaire Aqua). Import STATIQUE de field_player_avatar tire son
// sous-arbre d'éval tôt (TDZ, cf. commentaire SignalWaitState:88) → capture DIFFÉRÉE.
let _DoPlayerSpinEntrance: (() => void) | null = null;
let _IsPlayerSpinEntranceActive: (() => boolean) | null = null;
let _FreezeObjectEvents: (() => void) | null = null;
let _UnfreezeObjectEvents: (() => void) | null = null;
import('./field_player_avatar').then((m) => {
  _DoPlayerSpinEntrance = m.DoPlayerSpinEntrance;
  _IsPlayerSpinEntranceActive = m.IsPlayerSpinEntranceActive;
}).catch((e) => console.error('[field_screen_effect] import field_player_avatar (spin) a échoué', e));
import('./event_object_movement').then((m) => {
  _FreezeObjectEvents = m.FreezeObjectEvents;
  _UnfreezeObjectEvents = m.UnfreezeObjectEvents;
}).catch((e) => console.error('[field_screen_effect] import event_object_movement (freeze) a échoué', e));
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

// ─── Fall warp (1:1 field_screen_effect.c:522) ───────────────────────────────

/** 1:1 décomp `void DoFallWarp(void)` (field_screen_effect.c:522) :
 *    DoDiveWarp();
 *    gFieldCallback = FieldCB_FallWarpExit;
 *  Chute sur sol fissuré (Sky Pillar / Granite Cave) : réutilise la mécanique de
 *  DoDiveWarp puis pose l'anim d'arrivée FieldCB_FallWarpExit (le joueur tombe du
 *  haut de l'écran + secousse caméra).
 *  ADAPTATION port : `DoDiveWarp` (overworld.ts, via pont anti-TDZ) pousse le
 *  pending-warp depuis la destination posée en amont ; on ré-étiquette ce
 *  pending-warp en kind 'fall' (executeWarp Phase 5 → FieldCB_FallWarpExit,
 *  précédent 'fly'). On pose aussi `gFieldCallback = FieldCB_FallWarpExit` pour le
 *  chemin RunFieldCallback (chemin script).
 *  ⚠️ DETTE (bout-en-bout) : la destination du fall est posée par le scrcmd
 *  `warphole` → `SetWarpDestinationToFixedHoleWarp` (scrcmd.ts VERROUILLÉ +
 *  fixed-hole-warp non porté dans overworld.ts). Sans dest, DoDiveWarp ne pousse
 *  rien hors chemin dive → DoFallWarp reste INERTE en jeu tant que ce câblage
 *  amont (trigger cracked-floor + fixed-hole dest) n'est pas fait par le pilote. */
export function DoFallWarp(): void {
  _owDoDiveWarp?.();
  const p = _owGetPendingWarp?.();
  if (p) _owSetPendingWarp?.(p.warp, 'fall');
  (globalThis as Record<string, unknown>).gFieldCallback =
    (globalThis as Record<string, unknown>).__FieldCB_FallWarpExit;
}
// Pont globalThis (lu par specials-registry, anti-cycle) — cf. section ci-dessous.
(globalThis as Record<string, unknown>).__DoFallWarp = DoFallWarp;

// ─── Spin-enter warp (téléport / Repaire Aqua) — 1:1 field_screen_effect.c:298/1000 ─
// #define tState data[0]. Le joueur descend en tournoyant sur la tuile d'arrivée.

/** 1:1 décomp `static void Task_SpinEnterWarp(u8 taskId)` (field_screen_effect.c:1000). */
function Task_SpinEnterWarp(taskId: number): void {
  switch (gTasks[taskId].data[0]) {   // tState
    case 0:
      _FreezeObjectEvents?.();
      LockPlayerFieldControls();
      _DoPlayerSpinEntrance?.();
      gTasks[taskId].data[0]++;
      break;
    case 1:
      if (WaitForWeatherFadeIn() && _IsPlayerSpinEntranceActive?.() !== true) {
        _UnfreezeObjectEvents?.();
        UnlockPlayerFieldControls();
        DestroyTask(taskId);
      }
      break;
  }
}

/** 1:1 décomp `static void FieldCB_SpinEnterWarp(void)` (field_screen_effect.c:298) :
 *    Overworld_PlaySpecialMapMusic();
 *    WarpFadeInScreen();
 *    PlaySE(SE_WARP_OUT);
 *    CreateTask(Task_SpinEnterWarp, 10);
 *    LockPlayerFieldControls();
 *  ADAPTATION port : `WarpFadeInScreen` est joué par executeWarp Phase 4 (précédent
 *  FieldCallback_FlyIntoMap, port-adapté SANS re-fade) → on ne rejoue PAS le fade ici
 *  (éviter le double-fade). Posé comme entrée d'arrivée pour le kind 'aqua_teleport'. */
export function FieldCB_SpinEnterWarp(): void {
  Overworld_PlaySpecialMapMusic();
  PlaySE(SE_WARP_OUT);
  _createTask(Task_SpinEnterWarp, 10);
  LockPlayerFieldControls();
}
// Exposé pour câblage 'aqua_teleport' (chemin warp verrouillé — cf. OverworldScene Phase 5).
(globalThis as Record<string, unknown>).__FieldCB_SpinEnterWarp = FieldCB_SpinEnterWarp;

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATOR + LAVARIDGE GYM WARPS — transcription 1:1 (INERTE)
// ═══════════════════════════════════════════════════════════════════════════
//
// SOURCE DE VÉRITÉ :
//  - Wrappers `DoEscalatorWarp` / `DoLavaridgeGymB1FWarp` / `DoLavaridgeGym1FWarp`
//    = field_screen_effect.c:528-543 (= CE fichier côté décomp).
//  - Familles `StartEscalatorWarp` / `Task_EscalatorWarpOut`/`In` (+ FieldCB) et
//    `StartLavaridgeGym*Warp` / `Task_LavaridgeGym*` (+ FieldCB) = field_effect.c:
//    1562-1826 (escalator) et 1948-2223 (lavaridge). Le foyer 1:1 de ces tasks
//    serait `field_effect_helpers.ts` (comme `FieldCallback_FlyIntoMap` /
//    `FieldCB_FallWarpExit`, câblés par 485297625/573549591), HORS de mon
//    périmètre ce tour → HÉBERGÉ ici (précédent : `Task_SpinEnterWarp` hébergé
//    ici alors qu'il vient bien de field_screen_effect.c ; ici la déviation de
//    fichier est notée). Le pilote pourra les redéplacer vers field_effect_helpers.
//
// ── POURQUOI INERTE (non câblé dans executeWarp) ────────────────────────────
// Le port a REMPLACÉ le modèle décomp « task auto-pilotée →
// WarpFadeOutScreen → WarpIntoMap → SetMainCallback2(CB2_LoadMap) → gFieldCallback »
// par l'adaptation asynchrone `OverworldScene.executeWarp` (fade-out → load async →
// fade-in → exit-task), exactement comme pour fly/fall/spin où SEULE l'arrivée
// (FieldCB) est portée 1:1, executeWarp possédant fade+load. Conséquences :
//   1. `WarpFadeOutScreen` / `WarpFadeInScreen` / `CB2_LoadMap` NE SONT PAS des
//      symboles exportés par le port → les sites d'appel décomp sont transcrits
//      via des accès paresseux qui restent NULL (INERTE, ne fire jamais). Le vrai
//      chemin de câblage = executeWarp (cf. plan pilote en fin de section).
//   2. LAVARIDGE dépend de `FLDEFF_ASH_LAUNCH` / `FLDEFF_ASH_PUFF` (le geyser de
//      cendre / la bouffée) dont les handlers `FldEff_AshLaunch` / `FldEff_AshPuff`
//      + templates `FLDEFFOBJ_ASH_*` vivent dans field_effect.c → field_effect.ts,
//      NON PORTÉS et HORS de mon périmètre. Les tasks Lavaridge gatent sur
//      `gSprites[data[1]].animCmdIndex` (sprite ash) qui n'avancerait pas → HANG.
//      Donc Lavaridge NE PEUT PAS être câblé sans cette dette amont (Règle 1 :
//      intranscriptible dans mon périmètre → transcrit INERTE + signalé).
//   3. Ces tasks manipulent `sprite->oam.priority` / `sprite->subspriteMode =
//      SUBSPRITES_IGNORE_PRIORITY` / `sprite->centerToCornerVecY` / `gSpriteCoordOffsetY`
//      dont le modèle renderer du port diffère (priority via oamIndex, subspriteMode
//      = union string). Accès via shims documentés (INERTE) → à reconnecter au câblage.
//
// ── PLAN DE CÂBLAGE POUR LE PILOTE (test EN JEU obligatoire, Règle 5) ────────
// Les métatuiles déclencheuses sont DÉJÀ mappées (field_control_avatar.ts VERROUILLÉ,
// déjà fait) : getWarpKindFor → 'escalator_up'/'escalator_down'/'lavaridge_b1f'/
// 'lavaridge_1f' → setPendingWarp → executeWarp(kind). executeWarp reçoit donc déjà
// ces kinds. Reste (côté pilote, executeWarp) :
//   A. ESCALATOR : Phase 1 pré-anim de MONTÉE/DESCENTE (= EscalatorWarpOut ride,
//      RideUp/DownEscalatorOut) sur le modèle 'door' (Task_DoDoorWarp inline) ;
//      puis Phase 5 arrivée = `FieldCallback_EscalatorWarpIn` (ci-dessous) sur le
//      modèle fly/fall/spin. StartEscalator/StopEscalator (fldeff_escalator.ts) OK.
//   B. LAVARIDGE : BLOQUÉ tant que FLDEFF_ASH_LAUNCH/PUFF (field_effect.ts) non
//      portés. Une fois portés : b1f arrivée = `FieldCB_LavaridgeGymB1FWarpExit`,
//      1f arrivée = `FieldCB_FallWarpExit` (déjà porté), pré-anim = Task_Lavaridge*.
//
// Les 3 wrappers + les familles sont exposés en fin de section (ponts __*).

// ─── Refs paresseuses (protègent le cycle ESM boot, cf. discipline du fichier) ─
// INERTE : si une ref reste null, la fonction ne fire jamais (aucun câblage runtime).
let _CameraObjectFreeze: (() => void) | null = null;
let _CameraObjectReset: (() => void) | null = null;
let _ObjectEventIsMovementOverridden: ((oe: unknown) => boolean) | null = null;
let _ObjectEventClearHeldMovementIfFinished: ((oe: unknown) => boolean) | null = null;
let _ObjectEventClearHeldMovementIfActive: ((oe: unknown) => void) | null = null;
let _ObjectEventSetHeldMovement: ((oe: unknown, action: number) => void) | null = null;
let _GetFaceDirectionMovementAction: ((dir: number) => number) | null = null;
let _GetWalkNormalMovementAction: ((dir: number) => number) | null = null;
let _GetJumpMovementAction: ((dir: number) => number) | null = null;
let _GetWalkInPlaceFasterMovementAction: ((dir: number) => number) | null = null;
let _gObjectEvents: Array<Record<string, unknown>> | null = null;
import('./event_object_movement').then((m) => {
  _CameraObjectFreeze = m.CameraObjectFreeze;
  _CameraObjectReset = m.CameraObjectReset;
  _ObjectEventIsMovementOverridden = m.ObjectEventIsMovementOverridden as unknown as (oe: unknown) => boolean;
  _ObjectEventClearHeldMovementIfFinished = m.ObjectEventClearHeldMovementIfFinished as unknown as (oe: unknown) => boolean;
  _ObjectEventClearHeldMovementIfActive = m.ObjectEventClearHeldMovementIfActive as unknown as (oe: unknown) => void;
  _ObjectEventSetHeldMovement = m.ObjectEventSetHeldMovement as unknown as (oe: unknown, action: number) => void;
  _GetFaceDirectionMovementAction = m.GetFaceDirectionMovementAction as unknown as (dir: number) => number;
  _GetWalkNormalMovementAction = m.GetWalkNormalMovementAction as unknown as (dir: number) => number;
  _GetJumpMovementAction = m.GetJumpMovementAction as unknown as (dir: number) => number;
  // GetWalkInPlaceFasterMovementAction (event_object_movement.c:4973) N'EST PAS porté
  // (le port a InPlaceFast/WalkFaster mais pas InPlaceFaster) → reste null (INERTE, Lavaridge
  // non câblé). À porter par le pilote au câblage Lavaridge (Règle 1 : pas de substitut inventé).
  _GetWalkInPlaceFasterMovementAction =
    ((m as unknown as Record<string, unknown>).GetWalkInPlaceFasterMovementAction as ((dir: number) => number) | undefined) ?? null;
  _gObjectEvents = m.gObjectEvents as unknown as Array<Record<string, unknown>>;
}).catch((e) => console.error('[field_screen_effect] import event_object_movement (escalator/lavaridge) a échoué', e));

let _gPlayerAvatar: { spriteId: number; objectEventId: number; preventStep: boolean } | null = null;
let _GetPlayerFacingDirection: (() => number) | null = null;
import('./field_player_avatar').then((m) => {
  _gPlayerAvatar = m.gPlayerAvatar as unknown as { spriteId: number; objectEventId: number; preventStep: boolean };
  _GetPlayerFacingDirection = m.GetPlayerFacingDirection;
}).catch((e) => console.error('[field_screen_effect] import field_player_avatar (escalator/lavaridge) a échoué', e));

let _StartEscalator: ((goingUp: boolean) => void) | null = null;
let _StopEscalator: (() => void) | null = null;
let _IsEscalatorMoving: (() => boolean) | null = null;
import('./fldeff_escalator').then((m) => {
  _StartEscalator = m.StartEscalator;
  _StopEscalator = m.StopEscalator;
  _IsEscalatorMoving = m.IsEscalatorMoving;
}).catch((e) => console.error('[field_screen_effect] import fldeff_escalator a échoué', e));

let _FieldEffectStart: ((id: number) => number) | null = null;
let _FieldEffectActiveListContains: ((id: number) => boolean) | null = null;
let _gFieldEffectArguments: number[] | null = null;
import('./field_effect').then((m) => {
  _FieldEffectStart = m.FieldEffectStart;
  _FieldEffectActiveListContains = m.FieldEffectActiveListContains;
  _gFieldEffectArguments = m.gFieldEffectArguments;
}).catch((e) => console.error('[field_screen_effect] import field_effect (ash fldeff) a échoué', e));

let _WarpIntoMap: (() => void) | null = null;
let _TryFadeOutOldMapMusic: (() => void) | null = null;
let _BGMusicStopped: (() => boolean) | null = null;
// _owGetPendingWarp/_owSetPendingWarp déjà capturés plus haut (anti-TDZ overworld).
import('./overworld').then((m) => {
  _WarpIntoMap = m.WarpIntoMap;
  _TryFadeOutOldMapMusic = m.TryFadeOutOldMapMusic;
  _BGMusicStopped = m.BGMusicStopped;
}).catch((e) => console.error('[field_screen_effect] import overworld (warp/music escalator) a échoué', e));

// Symboles NON exportés par le port (le décomp les appelle ; ici INERTE) :
//   WarpFadeOutScreen / WarpFadeInScreen / SetMainCallback2(CB2_LoadMap).
// Le vrai chemin = executeWarp (fade+load). Accès paresseux via globalThis (restent
// null → no-op INERTE), avec HURLEMENT si jamais appelés sans câblage (Règle 3).
function _WarpFadeOutScreen(): void {
  const f = (globalThis as Record<string, unknown>).__WarpFadeOutScreen as (() => void) | undefined;
  if (f) f(); else console.error('[field_screen_effect] WarpFadeOutScreen absent (port = executeWarp) — escalator/lavaridge INERTE');
}
function _WarpFadeInScreen(): void {
  const f = (globalThis as Record<string, unknown>).__WarpFadeInScreen as (() => void) | undefined;
  if (f) f(); else console.error('[field_screen_effect] WarpFadeInScreen absent (port = executeWarp) — escalator/lavaridge INERTE');
}
function _SetMainCallback2_LoadMap(): void {
  const f = (globalThis as Record<string, unknown>).__SetMainCallback2LoadMap as (() => void) | undefined;
  if (f) f(); else console.error('[field_screen_effect] CB2_LoadMap absent (port = executeWarp) — escalator/lavaridge INERTE');
}
/** Runtime live (window.__rt) — gSprites / gSpriteCoordOffsetY / gPaletteFade
 *  (état renderer non exporté en module ; cf. mémoire « runtime live = window.__rt »). */
function _runtime(): Record<string, unknown> {
  return ((globalThis as Record<string, unknown>).__rt as Record<string, unknown> | undefined) ?? {};
}
function _playerSprite(): Record<string, unknown> | undefined {
  const spr = _runtime().gSprites as Array<Record<string, unknown>> | undefined;
  if (!spr || !_gPlayerAvatar) return undefined;
  return spr[_gPlayerAvatar.spriteId];
}
function _spriteAt(id: number): Record<string, unknown> | undefined {
  const spr = _runtime().gSprites as Array<Record<string, unknown>> | undefined;
  return spr ? spr[id] : undefined;
}
function _playerObjEvent(): Record<string, unknown> | undefined {
  if (!_gObjectEvents || !_gPlayerAvatar) return undefined;
  return _gObjectEvents[_gPlayerAvatar.objectEventId];
}
function _paletteFadeActive(): boolean {
  const pf = _runtime().gPaletteFade as { active?: boolean } | undefined;
  return pf?.active === true;
}
/** 1:1 `SUBSPRITES_IGNORE_PRIORITY` (include/sprite.h) = 2 (modèle décomp ; le port
 *  utilise une union string pour subspriteMode → shim au câblage, cf. commentaire section). */
const SUBSPRITES_IGNORE_PRIORITY = 2;

// ─── DoEscalatorWarp / DoLavaridge* — 1:1 field_screen_effect.c:528-543 ───────

/** 1:1 décomp `void DoEscalatorWarp(u8 metatileBehavior)` (field_screen_effect.c:528) :
 *    LockPlayerFieldControls();
 *    StartEscalatorWarp(metatileBehavior, 10); */
export function DoEscalatorWarp(metatileBehavior: number): void {
  LockPlayerFieldControls();
  StartEscalatorWarp(metatileBehavior, 10);
}

/** 1:1 décomp `void DoLavaridgeGymB1FWarp(void)` (field_screen_effect.c:534) :
 *    LockPlayerFieldControls();
 *    StartLavaridgeGymB1FWarp(10); */
export function DoLavaridgeGymB1FWarp(): void {
  LockPlayerFieldControls();
  StartLavaridgeGymB1FWarp(10);
}

/** 1:1 décomp `void DoLavaridgeGym1FWarp(void)` (field_screen_effect.c:540) :
 *    LockPlayerFieldControls();
 *    StartLavaridgeGym1FWarp(10); */
export function DoLavaridgeGym1FWarp(): void {
  LockPlayerFieldControls();
  StartLavaridgeGym1FWarp(10);
}

// ─── ESCALATOR — 1:1 field_effect.c:1562-1826 ───────────────────────────────
// #define tState data[0] ; #define tGoingUp data[1]. Les subfuncs prennent le
// taskId et lisent gTasks[taskId].data (adaptation du `struct Task *task` décomp,
// même style que les tasks de ce fichier). La boucle `while(funcs[state](task))`
// est reproduite dans Task_EscalatorWarpOut/In.
const _E_tState = 0, _E_tGoingUp = 1;

/** 1:1 `void StartEscalatorWarp(u8 metatileBehavior, u8 priority)` (field_effect.c:1562). */
export function StartEscalatorWarp(metatileBehavior: number, priority: number): void {
  const taskId = _createTask(Task_EscalatorWarpOut, priority);
  gTasks[taskId].data[_E_tGoingUp] = 0;   // FALSE
  if (metatileBehavior === MB_UP_ESCALATOR) {
    gTasks[taskId].data[_E_tGoingUp] = 1; // TRUE
  }
}

const sEscalatorWarpOutFieldEffectFuncs: ReadonlyArray<(taskId: number) => boolean> = [
  EscalatorWarpOut_Init,
  EscalatorWarpOut_WaitForPlayer,
  EscalatorWarpOut_Up_Ride,
  EscalatorWarpOut_Up_End,
  EscalatorWarpOut_Down_Ride,
  EscalatorWarpOut_Down_End,
];

/** 1:1 `static void Task_EscalatorWarpOut(u8 taskId)` (field_effect.c:1573). */
function Task_EscalatorWarpOut(taskId: number): void {
  while (sEscalatorWarpOutFieldEffectFuncs[gTasks[taskId].data[_E_tState]](taskId));
}

/** 1:1 `EscalatorWarpOut_Init` (field_effect.c:1580). */
function EscalatorWarpOut_Init(taskId: number): boolean {
  const d = gTasks[taskId].data;
  _FreezeObjectEvents?.();
  _CameraObjectFreeze?.();
  _StartEscalator?.(d[_E_tGoingUp] !== 0);
  d[_E_tState]++;
  return false;
}

/** 1:1 `EscalatorWarpOut_WaitForPlayer` (field_effect.c:1589). */
function EscalatorWarpOut_WaitForPlayer(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  if (!_ObjectEventIsMovementOverridden?.(objectEvent) || _ObjectEventClearHeldMovementIfFinished?.(objectEvent)) {
    _ObjectEventSetHeldMovement?.(objectEvent, _GetFaceDirectionMovementAction?.(_GetPlayerFacingDirection?.() ?? 0) ?? 0);
    d[_E_tState]++;
    d[2] = 0;
    d[3] = 0;
    if ((d[_E_tGoingUp] & 0xFF) === 0) {   // (u8)task->tGoingUp == FALSE
      d[_E_tState] = 4;  // jump to EscalatorWarpOut_Down_Ride
    }
    PlaySE(SE_ESCALATOR);
  }
  return false;
}

/** 1:1 `EscalatorWarpOut_Up_Ride` (field_effect.c:1610). */
function EscalatorWarpOut_Up_Ride(taskId: number): boolean {
  const d = gTasks[taskId].data;
  RideUpEscalatorOut(taskId);
  if (d[2] > 3) {
    FadeOutAtEndOfEscalator();
    d[_E_tState]++;
  }
  return false;
}

/** 1:1 `EscalatorWarpOut_Up_End` (field_effect.c:1621). */
function EscalatorWarpOut_Up_End(taskId: number): boolean {
  RideUpEscalatorOut(taskId);
  WarpAtEndOfEscalator();
  return false;
}

/** 1:1 `EscalatorWarpOut_Down_Ride` (field_effect.c:1628). */
function EscalatorWarpOut_Down_Ride(taskId: number): boolean {
  const d = gTasks[taskId].data;
  RideDownEscalatorOut(taskId);
  if (d[2] > 3) {
    FadeOutAtEndOfEscalator();
    d[_E_tState]++;
  }
  return false;
}

/** 1:1 `EscalatorWarpOut_Down_End` (field_effect.c:1639). */
function EscalatorWarpOut_Down_End(taskId: number): boolean {
  RideDownEscalatorOut(taskId);
  WarpAtEndOfEscalator();
  return false;
}

/** 1:1 `static void RideUpEscalatorOut(struct Task *task)` (field_effect.c:1646). */
function RideUpEscalatorOut(taskId: number): void {
  const d = gTasks[taskId].data;
  const sprite = _playerSprite();
  if (sprite) {
    sprite.x2 = Cos(0x84, d[2]);
    sprite.y2 = Sin(0x94, d[2]);
  }
  d[3]++;
  if (d[3] & 1) {
    d[2]++;
  }
}

/** 1:1 `static void RideDownEscalatorOut(struct Task *task)` (field_effect.c:1660). */
function RideDownEscalatorOut(taskId: number): void {
  const d = gTasks[taskId].data;
  const sprite = _playerSprite();
  if (sprite) {
    sprite.x2 = Cos(0x7c, d[2]);
    sprite.y2 = Sin(0x76, d[2]);
  }
  d[3]++;
  if (d[3] & 1) {
    d[2]++;
  }
}

/** 1:1 `static void FadeOutAtEndOfEscalator(void)` (field_effect.c:1674). */
function FadeOutAtEndOfEscalator(): void {
  _TryFadeOutOldMapMusic?.();
  _WarpFadeOutScreen();
}

/** 1:1 `static void WarpAtEndOfEscalator(void)` (field_effect.c:1680). */
function WarpAtEndOfEscalator(): void {
  if (!_paletteFadeActive() && _BGMusicStopped?.() === true) {
    _StopEscalator?.();
    _WarpIntoMap?.();
    (globalThis as Record<string, unknown>).gFieldCallback = FieldCallback_EscalatorWarpIn;
    _SetMainCallback2_LoadMap();
    DestroyTask(FindTaskIdByFunc(Task_EscalatorWarpOut));
  }
}

/** 1:1 `static void FieldCallback_EscalatorWarpIn(void)` (field_effect.c:1691). */
export function FieldCallback_EscalatorWarpIn(): void {
  Overworld_PlaySpecialMapMusic();
  _WarpFadeInScreen();
  LockPlayerFieldControls();
  _createTask(Task_EscalatorWarpIn, 0);
  (globalThis as Record<string, unknown>).gFieldCallback = null;
}

const sEscalatorWarpInFieldEffectFuncs: ReadonlyArray<(taskId: number) => boolean> = [
  EscalatorWarpIn_Init,
  EscalatorWarpIn_Down_Init,
  EscalatorWarpIn_Down_Ride,
  EscalatorWarpIn_Up_Init,
  EscalatorWarpIn_Up_Ride,
  EscalatorWarpIn_WaitForMovement,
  EscalatorWarpIn_End,
];

/** 1:1 `static void Task_EscalatorWarpIn(u8 taskId)` (field_effect.c:1702). */
function Task_EscalatorWarpIn(taskId: number): void {
  while (sEscalatorWarpInFieldEffectFuncs[gTasks[taskId].data[_E_tState]](taskId));
}

/** 1:1 `EscalatorWarpIn_Init` (field_effect.c:1709). */
function EscalatorWarpIn_Init(taskId: number): boolean {
  const d = gTasks[taskId].data;
  _CameraObjectFreeze?.();
  const objectEvent = _playerObjEvent();
  _ObjectEventSetHeldMovement?.(objectEvent, _GetFaceDirectionMovementAction?.(3 /* DIR_EAST */) ?? 0);
  const coords = _playerGetDestCoordsInline();
  let behavior = MapGridGetMetatileBehaviorAt(coords.x, coords.y);
  d[_E_tState]++;
  d[1] = 16;
  if (behavior === MB_DOWN_ESCALATOR) {
    // dest = down escalator → le joueur monte (riding up)
    behavior = 1;   // TRUE
    d[_E_tState] = 3;   // jump to EscalatorWarpIn_Up_Init
  } else {  // MB_UP_ESCALATOR → riding down
    behavior = 0;   // FALSE
  }
  _StartEscalator?.(behavior !== 0);
  return true;
}

/** 1:1 `EscalatorWarpIn_Down_Init` (field_effect.c:1739). */
function EscalatorWarpIn_Down_Init(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const sprite = _playerSprite();
  if (sprite) {
    sprite.x2 = Cos(0x84, d[1]);
    sprite.y2 = Sin(0x94, d[1]);
  }
  d[_E_tState]++;
  return false;
}

/** 1:1 `EscalatorWarpIn_Down_Ride` (field_effect.c:1750). */
function EscalatorWarpIn_Down_Ride(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const sprite = _playerSprite();
  if (sprite) {
    sprite.x2 = Cos(0x84, d[1]);
    sprite.y2 = Sin(0x94, d[1]);
  }
  d[2]++;
  if (d[2] & 1) {
    d[1]--;
  }
  if (d[1] === 0) {
    if (sprite) { sprite.x2 = 0; sprite.y2 = 0; }
    d[_E_tState] = 5;
  }
  return false;
}

/** 1:1 `EscalatorWarpIn_Up_Init` (field_effect.c:1768). */
function EscalatorWarpIn_Up_Init(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const sprite = _playerSprite();
  if (sprite) {
    sprite.x2 = Cos(0x7c, d[1]);
    sprite.y2 = Sin(0x76, d[1]);
  }
  d[_E_tState]++;
  return false;
}

/** 1:1 `EscalatorWarpIn_Up_Ride` (field_effect.c:1779). */
function EscalatorWarpIn_Up_Ride(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const sprite = _playerSprite();
  if (sprite) {
    sprite.x2 = Cos(0x7c, d[1]);
    sprite.y2 = Sin(0x76, d[1]);
  }
  d[2]++;
  if (d[2] & 1) {
    d[1]--;
  }
  if (d[1] === 0) {
    if (sprite) { sprite.x2 = 0; sprite.y2 = 0; }
    d[_E_tState]++;
  }
  return false;
}

/** 1:1 `EscalatorWarpIn_WaitForMovement` (field_effect.c:1797). */
function EscalatorWarpIn_WaitForMovement(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (_IsEscalatorMoving?.()) {
    return false;
  }
  _StopEscalator?.();
  d[_E_tState]++;
  return true;
}

/** 1:1 `EscalatorWarpIn_End` (field_effect.c:1808). */
function EscalatorWarpIn_End(taskId: number): boolean {
  const objectEvent = _playerObjEvent();
  if (_ObjectEventClearHeldMovementIfFinished?.(objectEvent)) {
    _CameraObjectReset?.();
    UnlockPlayerFieldControls();
    _ObjectEventSetHeldMovement?.(objectEvent, _GetWalkNormalMovementAction?.(3 /* DIR_EAST */) ?? 0);
    DestroyTask(FindTaskIdByFunc(Task_EscalatorWarpIn));
  }
  return false;
}

/** Inline de `PlayerGetDestCoords(&x, &y)` — coords INTERNES (map+MAP_OFFSET).
 *  `getMetatileBehaviorAtPlayerPos` (ci-dessus) lit déjà pos+MAP_OFFSET ; ici on
 *  retourne le couple pour MapGridGetMetatileBehaviorAt. */
function _playerGetDestCoordsInline(): { x: number; y: number } {
  return { x: gSaveBlock1Ptr.pos.x + MAP_OFFSET, y: gSaveBlock1Ptr.pos.y + MAP_OFFSET };
}

// ─── LAVARIDGE GYM B1F WARP (geyser) — 1:1 field_effect.c:1948-2126 ──────────
// data[0] = state. Les subfuncs prennent taskId ; objectEvent/sprite = récupérés
// via gObjectEvents[gPlayerAvatar.objectEventId] / gSprites[gPlayerAvatar.spriteId]
// (= les args exacts du dispatcher décomp). BLOQUÉ EN JEU : FLDEFF_ASH_LAUNCH/PUFF
// non portés (cf. entête de section). oam.priority/subspriteMode = shims documentés.

/** 1:1 `void StartLavaridgeGymB1FWarp(u8 priority)` (field_effect.c:1948). */
export function StartLavaridgeGymB1FWarp(priority: number): void {
  _createTask(Task_LavaridgeGymB1FWarp, priority);
}

const sLavaridgeGymB1FWarpEffectFuncs: ReadonlyArray<(taskId: number) => boolean> = [
  LavaridgeGymB1FWarpEffect_Init,
  LavaridgeGymB1FWarpEffect_CameraShake,
  LavaridgeGymB1FWarpEffect_Launch,
  LavaridgeGymB1FWarpEffect_Rise,
  LavaridgeGymB1FWarpEffect_FadeOut,
  LavaridgeGymB1FWarpEffect_Warp,
];

/** 1:1 `static void Task_LavaridgeGymB1FWarp(u8 taskId)` (field_effect.c:1953). */
function Task_LavaridgeGymB1FWarp(taskId: number): void {
  while (sLavaridgeGymB1FWarpEffectFuncs[gTasks[taskId].data[0]](taskId));
}

/** 1:1 `LavaridgeGymB1FWarpEffect_Init` (field_effect.c:1958). */
function LavaridgeGymB1FWarpEffect_Init(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  _FreezeObjectEvents?.();
  _CameraObjectFreeze?.();
  SetCameraPanningCallback(null);
  if (_gPlayerAvatar) _gPlayerAvatar.preventStep = true;
  if (objectEvent) objectEvent.fixedPriority = 1;
  task[1] = 1;
  task[0]++;
  return true;
}

/** 1:1 `LavaridgeGymB1FWarpEffect_CameraShake` (field_effect.c:1969). */
function LavaridgeGymB1FWarpEffect_CameraShake(taskId: number): boolean {
  const task = gTasks[taskId].data;
  SetCameraPanning(0, task[1]);
  task[1] = -task[1];
  task[2]++;
  if (task[2] > 7) {
    task[2] = 0;
    task[0]++;
  }
  return false;
}

/** 1:1 `LavaridgeGymB1FWarpEffect_Launch` (field_effect.c:1982). */
function LavaridgeGymB1FWarpEffect_Launch(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  const sprite = _playerSprite();
  if (sprite) sprite.y2 = 0;
  task[3] = 1;
  if (_gFieldEffectArguments && objectEvent && sprite) {
    _gFieldEffectArguments[0] = (objectEvent.currentCoords as { x: number }).x;
    _gFieldEffectArguments[1] = (objectEvent.currentCoords as { y: number }).y;
    _gFieldEffectArguments[2] = (sprite.subpriority as number) - 1;
    _gFieldEffectArguments[3] = _oamPriority(sprite);
  }
  _FieldEffectStart?.(FLDEFF_ASH_LAUNCH);
  PlaySE(SE_M_EXPLOSION);
  task[0]++;
  return true;
}

/** 1:1 `LavaridgeGymB1FWarpEffect_Rise` (field_effect.c:2000). */
function LavaridgeGymB1FWarpEffect_Rise(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  const sprite = _playerSprite();
  let centerToCornerVecY: number;
  SetCameraPanning(0, task[1]);
  if ((task[1] = -task[1], ++task[2] <= 17)) {
    if (!(task[2] & 1) && (task[1] <= 3)) {
      task[1] <<= 1;
    }
  } else if (!(task[2] & 4) && (task[1] > 0)) {
    task[1] >>= 1;
  }
  if (sprite && task[2] > 6) {
    const ctcv = (sprite.centerToCornerVecY as number) | 0;
    const coordOffY = (_runtime().gSpriteCoordOffsetY as number) | 0;
    centerToCornerVecY = -(ctcv << 1);
    if ((sprite.y2 as number) > -((sprite.y as number) + ctcv + coordOffY + centerToCornerVecY)) {
      sprite.y2 = (sprite.y2 as number) - task[3];
      if (task[3] <= 7) {
        task[3]++;
      }
    } else {
      task[4] = 1;
    }
  }
  if (sprite && task[5] === 0 && (sprite.y2 as number) < -0x10) {
    task[5]++;
    if (objectEvent) objectEvent.fixedPriority = 1;
    _setOamPriority(sprite, 1);
    sprite.subspriteMode = SUBSPRITES_IGNORE_PRIORITY;   // shim (port : union string)
  }
  if (task[1] === 0 && task[4] !== 0) {
    task[0]++;
  }
  return false;
}

/** 1:1 `LavaridgeGymB1FWarpEffect_FadeOut` (field_effect.c:2040). */
function LavaridgeGymB1FWarpEffect_FadeOut(taskId: number): boolean {
  const task = gTasks[taskId].data;
  _TryFadeOutOldMapMusic?.();
  _WarpFadeOutScreen();
  task[0]++;
  return false;
}

/** 1:1 `LavaridgeGymB1FWarpEffect_Warp` (field_effect.c:2048). */
function LavaridgeGymB1FWarpEffect_Warp(taskId: number): boolean {
  if (!_paletteFadeActive() && _BGMusicStopped?.() === true) {
    _WarpIntoMap?.();
    (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_LavaridgeGymB1FWarpExit;
    _SetMainCallback2_LoadMap();
    DestroyTask(FindTaskIdByFunc(Task_LavaridgeGymB1FWarp));
  }
  return false;
}

/** 1:1 `static void FieldCB_LavaridgeGymB1FWarpExit(void)` (field_effect.c:2062). */
export function FieldCB_LavaridgeGymB1FWarpExit(): void {
  Overworld_PlaySpecialMapMusic();
  _WarpFadeInScreen();
  LockPlayerFieldControls();
  (globalThis as Record<string, unknown>).gFieldCallback = null;
  _createTask(Task_LavaridgeGymB1FWarpExit, 0);
}

const sLavaridgeGymB1FWarpExitEffectFuncs: ReadonlyArray<(taskId: number) => boolean> = [
  LavaridgeGymB1FWarpExitEffect_Init,
  LavaridgeGymB1FWarpExitEffect_StartPopOut,
  LavaridgeGymB1FWarpExitEffect_PopOut,
  LavaridgeGymB1FWarpExitEffect_End,
];

/** 1:1 `static void Task_LavaridgeGymB1FWarpExit(u8 taskId)` (field_effect.c:2071). */
function Task_LavaridgeGymB1FWarpExit(taskId: number): void {
  while (sLavaridgeGymB1FWarpExitEffectFuncs[gTasks[taskId].data[0]](taskId));
}

/** 1:1 `LavaridgeGymB1FWarpExitEffect_Init` (field_effect.c:2076). */
function LavaridgeGymB1FWarpExitEffect_Init(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  _CameraObjectFreeze?.();
  _FreezeObjectEvents?.();
  if (_gPlayerAvatar) _gPlayerAvatar.preventStep = true;
  if (objectEvent) objectEvent.invisible = true;
  task[0]++;
  return false;
}

/** 1:1 `LavaridgeGymB1FWarpExitEffect_StartPopOut` (field_effect.c:2086). */
function LavaridgeGymB1FWarpExitEffect_StartPopOut(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  const sprite = _playerSprite();
  if (IsWeatherNotFadingIn()) {
    if (_gFieldEffectArguments && objectEvent && sprite) {
      _gFieldEffectArguments[0] = (objectEvent.currentCoords as { x: number }).x;
      _gFieldEffectArguments[1] = (objectEvent.currentCoords as { y: number }).y;
      _gFieldEffectArguments[2] = (sprite.subpriority as number) - 1;
      _gFieldEffectArguments[3] = _oamPriority(sprite);
    }
    task[1] = _FieldEffectStart?.(FLDEFF_ASH_PUFF) ?? 0;
    task[0]++;
  }
  return false;
}

/** 1:1 `LavaridgeGymB1FWarpExitEffect_PopOut` (field_effect.c:2100). */
function LavaridgeGymB1FWarpExitEffect_PopOut(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  const sprite = _spriteAt(task[1]);
  if (sprite && (sprite.animCmdIndex as number) > 1) {
    task[0]++;
    if (objectEvent) objectEvent.invisible = false;
    _CameraObjectReset?.();
    PlaySE(SE_M_DIG);
    _ObjectEventSetHeldMovement?.(objectEvent, _GetJumpMovementAction?.(3 /* DIR_EAST */) ?? 0);
  }
  return false;
}

/** 1:1 `LavaridgeGymB1FWarpExitEffect_End` (field_effect.c:2114). */
function LavaridgeGymB1FWarpExitEffect_End(taskId: number): boolean {
  const objectEvent = _playerObjEvent();
  if (_ObjectEventClearHeldMovementIfFinished?.(objectEvent)) {
    if (_gPlayerAvatar) _gPlayerAvatar.preventStep = false;
    UnlockPlayerFieldControls();
    _UnfreezeObjectEvents?.();
    DestroyTask(FindTaskIdByFunc(Task_LavaridgeGymB1FWarpExit));
  }
  return false;
}

// ─── LAVARIDGE GYM 1F WARP (chute cendre) — 1:1 field_effect.c:2143-2223 ─────

/** 1:1 `void StartLavaridgeGym1FWarp(u8 priority)` (field_effect.c:2143). */
export function StartLavaridgeGym1FWarp(priority: number): void {
  _createTask(Task_LavaridgeGym1FWarp, priority);
}

const sLavaridgeGym1FWarpEffectFuncs: ReadonlyArray<(taskId: number) => boolean> = [
  LavaridgeGym1FWarpEffect_Init,
  LavaridgeGym1FWarpEffect_AshPuff,
  LavaridgeGym1FWarpEffect_Disappear,
  LavaridgeGym1FWarpEffect_FadeOut,
  LavaridgeGym1FWarpEffect_Warp,
];

/** 1:1 `static void Task_LavaridgeGym1FWarp(u8 taskId)` (field_effect.c:2148). */
function Task_LavaridgeGym1FWarp(taskId: number): void {
  while (sLavaridgeGym1FWarpEffectFuncs[gTasks[taskId].data[0]](taskId));
}

/** 1:1 `LavaridgeGym1FWarpEffect_Init` (field_effect.c:2153). */
function LavaridgeGym1FWarpEffect_Init(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  _FreezeObjectEvents?.();
  _CameraObjectFreeze?.();
  if (_gPlayerAvatar) _gPlayerAvatar.preventStep = true;
  if (objectEvent) objectEvent.fixedPriority = 1;
  task[0]++;
  return false;
}

/** 1:1 `LavaridgeGym1FWarpEffect_AshPuff` (field_effect.c:2163). */
function LavaridgeGym1FWarpEffect_AshPuff(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  const sprite = _playerSprite();
  if (_ObjectEventClearHeldMovementIfFinished?.(objectEvent)) {
    if (task[1] > 3) {
      if (_gFieldEffectArguments && objectEvent && sprite) {
        _gFieldEffectArguments[0] = (objectEvent.currentCoords as { x: number }).x;
        _gFieldEffectArguments[1] = (objectEvent.currentCoords as { y: number }).y;
        _gFieldEffectArguments[2] = (sprite.subpriority as number) - 1;
        _gFieldEffectArguments[3] = _oamPriority(sprite);
      }
      task[1] = _FieldEffectStart?.(FLDEFF_ASH_PUFF) ?? 0;
      task[0]++;
    } else {
      task[1]++;
      _ObjectEventSetHeldMovement?.(objectEvent,
        _GetWalkInPlaceFasterMovementAction?.(((objectEvent?.facingDirection as number) | 0)) ?? 0);
      PlaySE(SE_LAVARIDGE_FALL_WARP);
    }
  }
  return false;
}

/** 1:1 `LavaridgeGym1FWarpEffect_Disappear` (field_effect.c:2186). */
function LavaridgeGym1FWarpEffect_Disappear(taskId: number): boolean {
  const task = gTasks[taskId].data;
  const objectEvent = _playerObjEvent();
  const ashSprite = _spriteAt(task[1]);
  if (ashSprite && (ashSprite.animCmdIndex as number) === 2) {
    if (objectEvent) objectEvent.invisible = true;
    task[0]++;
  }
  return false;
}

/** 1:1 `LavaridgeGym1FWarpEffect_FadeOut` (field_effect.c:2197). */
function LavaridgeGym1FWarpEffect_FadeOut(taskId: number): boolean {
  const task = gTasks[taskId].data;
  if (!_FieldEffectActiveListContains?.(FLDEFF_ASH_PUFF)) {
    _TryFadeOutOldMapMusic?.();
    _WarpFadeOutScreen();
    task[0]++;
  }
  return false;
}

/** 1:1 `LavaridgeGym1FWarpEffect_Warp` (field_effect.c:2208). */
function LavaridgeGym1FWarpEffect_Warp(taskId: number): boolean {
  if (!_paletteFadeActive() && _BGMusicStopped?.() === true) {
    _WarpIntoMap?.();
    // 1:1 : gFieldCallback = FieldCB_FallWarpExit (arrivée réutilisée — déjà porté
    // field_effect_helpers.ts, exposé __FieldCB_FallWarpExit, cf. DoFallWarp).
    (globalThis as Record<string, unknown>).gFieldCallback =
      (globalThis as Record<string, unknown>).__FieldCB_FallWarpExit;
    _SetMainCallback2_LoadMap();
    DestroyTask(FindTaskIdByFunc(Task_LavaridgeGym1FWarp));
  }
  return false;
}

// ── Shims oam.priority (port : priority via oamIndex, pas de champ oam.priority
// direct sur DecompSprite — INERTE, à reconnecter au câblage par le pilote). ──
function _oamPriority(sprite: Record<string, unknown>): number {
  const oam = sprite.oam as { priority?: number } | undefined;
  return oam?.priority ?? ((sprite.priority as number | undefined) ?? 0);
}
function _setOamPriority(sprite: Record<string, unknown>, value: number): void {
  const oam = sprite.oam as { priority?: number } | undefined;
  if (oam) oam.priority = value;
  else sprite.priority = value;
}

// ─── Câblage pilote (executeWarp) : avortement des tasks de SORTIE ──────────
// executeWarp POSSÈDE fade+load (précédent door/fly/fall) : on laisse la task 1:1
// jouer son anim de sortie (ride escalator / rise+geyser lavaridge) ET son fondu
// (via le shim __WarpFadeOutScreen réel), qui GÈLE `WarpAtEndOf*`/`_Warp` (ils gatent
// sur !paletteFadeActive). Une fois le fondu lancé (= anim finie), executeWarp détruit
// la task AVANT son `WarpIntoMap`/`CB2_LoadMap` décomp (qu'il remplace par son load
// async), puis joue l'arrivée 1:1 en Phase 5. Ces Abort* nettoient l'état résiduel
// (sprite x2/y2, camera panning) que la fin de task décomp aurait remis à zéro.

/** Avorte `Task_EscalatorWarpOut` (fondu lancé) : détruit la task + stoppe l'escalator
 *  + reset l'offset de ride du sprite joueur. */
export function AbortEscalatorWarpOut(): void {
  const id = FindTaskIdByFunc(Task_EscalatorWarpOut);
  if (id !== 0xFF) DestroyTask(id);
  _StopEscalator?.();
  const sprite = _playerSprite();
  if (sprite) { sprite.x2 = 0; sprite.y2 = 0; }
}

/** Avorte `Task_LavaridgeGymB1FWarp` (fondu lancé) : détruit la task + reset le camera
 *  panning (secousse du geyser) + l'offset de rise du sprite. */
export function AbortLavaridgeGymB1FWarp(): void {
  const id = FindTaskIdByFunc(Task_LavaridgeGymB1FWarp);
  if (id !== 0xFF) DestroyTask(id);
  SetCameraPanning(0, 0);
  const sprite = _playerSprite();
  if (sprite) { sprite.y2 = 0; }
}

/** Avorte `Task_LavaridgeGym1FWarp` (fondu lancé) : détruit la task. */
export function AbortLavaridgeGym1FWarp(): void {
  const id = FindTaskIdByFunc(Task_LavaridgeGym1FWarp);
  if (id !== 0xFF) DestroyTask(id);
}

// ─── Ponts globalThis (câblage pilote — anti-cycle, cf. __DoFallWarp) ────────
(globalThis as Record<string, unknown>).__DoEscalatorWarp = DoEscalatorWarp;
(globalThis as Record<string, unknown>).__DoLavaridgeGymB1FWarp = DoLavaridgeGymB1FWarp;
(globalThis as Record<string, unknown>).__DoLavaridgeGym1FWarp = DoLavaridgeGym1FWarp;
(globalThis as Record<string, unknown>).__FieldCallback_EscalatorWarpIn = FieldCallback_EscalatorWarpIn;
(globalThis as Record<string, unknown>).__FieldCB_LavaridgeGymB1FWarpExit = FieldCB_LavaridgeGymB1FWarpExit;

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
