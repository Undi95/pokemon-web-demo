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
