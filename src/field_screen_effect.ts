/**
 * field_screen_effect.ts — miroir 1:1 décomp `src/field_screen_effect.c` (1267 l, 77 fn).
 *
 * ⚠️ AMORCE : seule `sFlashLevelToRadius` est portée ici pour l'instant (le reste du fichier
 * = TODO restructure/complétion 1:1). D'autres fn de field_screen_effect.c vivent encore
 * dispersées (ex. quelques-unes dans `harness/runtime/decomp-globals.ts`) → à consolider ici.
 */

import { FadeScreen, FADE_FROM_BLACK, IsWeatherNotFadingIn } from './field_weather';
import { FillPalBufferBlack } from '../harness/runtime/decomp-globals';
import { CreateTask, DestroyTask } from './task';
import { LockPlayerFieldControls, ScriptContext_Enable } from './script';
import { MetatileBehavior_IsDoor, MetatileBehavior_IsNonAnimDoor } from './metatile_behavior';
import { MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './fieldmap';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
// SignalWaitState : pont globalThis anti-cycle (posé par scrcmd.ts) — l'import statique
// tirait le byte-VM entier dans le sous-arbre d'éval de field_player_avatar (TDZ).
function SignalWaitState(): void {
  ((globalThis as Record<string, unknown>).__SignalWaitState as (() => void) | undefined)?.();
}
import { Overworld_PlaySpecialMapMusic } from './overworld';

/** 1:1 décomp `sFlashLevelToRadius` (field_screen_effect.c:53) — rayon (px) du cercle de
 *  pénombre de grotte par niveau de flash (index 0 = pleine vue, 8 = noir total).
 *  `static const u16` dans la décomp ; exporté ici car la post-process flash du harness
 *  (adaptation compositeur, cf. `harness/gba/flash-mask.ts`) le lit. */
export const sFlashLevelToRadius: readonly number[] = [200, 72, 64, 56, 48, 40, 32, 24, 0];
// Pont anti-cycle : flash-mask (harness, sous-arbre d'init decomp-globals) la lit
// via globalThis au lieu d'un import statique (sinon cycle ESM/TDZ, cf. flash-mask.ts).
(globalThis as Record<string, unknown>).__sFlashLevelToRadius = sFlashLevelToRadius;

/** 1:1 décomp `void FadeInFromBlack(void)` (field_screen_effect.c:95). */
export function FadeInFromBlack(): void {
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
}

/** 1:1 décomp `static bool32 WaitForWeatherFadeIn(void)` (field_screen_effect.c:476). */
function WaitForWeatherFadeIn(): boolean {
  return IsWeatherNotFadingIn();
}

/** 1:1 décomp `static void Task_WaitForFadeAndEnableScriptCtx(u8 taskID)`
 *  (field_screen_effect.c:134). `SignalWaitState()` en plus de ScriptContext_Enable :
 *  le décomp reprend un script suspendu sur `waitstate` via le status RUNNING ;
 *  notre ScrCmd_waitstate polle un signal (scrcmd.ts:186) — même sémantique. */
function Task_WaitForFadeAndEnableScriptCtx(taskId: number): void {
  if (WaitForWeatherFadeIn()) {
    DestroyTask(taskId);
    ScriptContext_Enable();
    SignalWaitState();
  }
}

/** 1:1 décomp `void FieldCB_ContinueScriptHandleMusic(void)` (field_screen_effect.c:142) :
 *  gFieldCallback des scènes lancées PENDANT un script (EggHatch waitstate…) — relance
 *  la musique de map, fade in, puis rend la main au script. */
export function FieldCB_ContinueScriptHandleMusic(): void {
  LockPlayerFieldControls();
  Overworld_PlaySpecialMapMusic();
  FadeInFromBlack();
  // Adaptateur : le runtime passe l'OBJET task au callback (convention TS), la fn 1:1
  // attend le taskId (pattern evolution_scene.ts:173).
  CreateTask((t: { taskId: number }) => Task_WaitForFadeAndEnableScriptCtx(t.taskId), 10);
}

// ─── SetUpWarpExitTask (1:1 field_screen_effect.c:256) ───────────────────────
// Rapatrié de engine/field/warp-system.ts (unification lot 16).

/** Type d'exit task à run au load de la dest map. ADAPTATION port de
 *  `SetUpWarpExitTask` (field_screen_effect.c:256) : le décomp CRÉE la task
 *  (sExitDoorTaskFunc/sExitNonAnimDoorTaskFunc/sExitNonDoorTaskFunc) ; notre
 *  executeWarp (scène MainCB2, harness) consomme ce kind et joue les tasks
 *  Task_ExitDoor / Task_ExitNonAnimDoor / Task_ExitNonDoor. */
export type ExitTaskKind =
  | 'door'        // MetatileBehavior_IsDoor (= MB_PETALBURG_GYM_DOOR | MB_ANIMATED_DOOR)
                  //   → Task_ExitDoor : door open + walk-down + door close
  | 'non_anim'    // MetatileBehavior_IsNonAnimDoor (= MB_NON_ANIMATED_DOOR | MB_WATER_DOOR | MB_DEEP_SOUTH_WARP)
                  //   → Task_ExitNonAnimDoor : juste walk-down
  | 'none';       // Else → Task_ExitNonDoor : no walk-down, juste unlock

/** 1:1 décomp `SetUpWarpExitTask` (field_screen_effect.c:256) — partie dispatch.
 *
 *  Body décomp :
 *  ```c
 *  static u8 SetUpWarpExitTask(void) {
 *      s16 x, y;
 *      u8 behavior;
 *      const TaskFunc *func;
 *      PlayerGetDestCoords(&x, &y);
 *      behavior = MapGridGetMetatileBehaviorAt(x, y);
 *      if (MetatileBehavior_IsDoor(behavior) == TRUE)
 *          func = sExitDoorTaskFunc;       // = Task_ExitDoor
 *      else if (MetatileBehavior_IsNonAnimDoor(behavior) == TRUE)
 *          func = sExitNonAnimDoorTaskFunc; // = Task_ExitNonAnimDoor
 *      else
 *          func = sExitNonDoorTaskFunc;    // = Task_ExitNonDoor
 *      return CreateTask(*func, 0);
 *  }
 *  ```
 *
 *  Délégué aux helpers 1:1 strict `MetatileBehavior_IsDoor` / `IsNonAnimDoor`. */
export function getExitTaskKindFor(behavior: number): ExitTaskKind {
  if (MetatileBehavior_IsDoor(behavior)) return 'door';
  if (MetatileBehavior_IsNonAnimDoor(behavior)) return 'non_anim';
  return 'none';
}

/** Read le metatile_behavior à la position courante du player (= le
 *  `PlayerGetDestCoords + MapGridGetMetatileBehaviorAt` de SetUpWarpExitTask).
 *  Helper pour scene executeWarp post-load → dispatch exit task. */
export function getMetatileBehaviorAtPlayerPos(): number {
  return MapGridGetMetatileBehaviorAt(gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
}
