/**
 * input-handler.ts — handler keyboard partagé pour toutes les scenes runtime.
 *
 * Pourquoi ce module :
 *   3 scenes (GameScene + BirchRuntimeScene + TestOverworldScene) avaient
 *   chacune leur propre `private heldKeys = 0` + `installKeyHandlers()` +
 *   `pollInput()` qui copiait dans `rt.gMain.heldKeys`. C'était de la
 *   duplication. Cette factorisation 1:1 décomp utilise directement
 *   `rt.gMain.heldKeys` comme canonical state (= matchant struct Main du
 *   décomp `src/main.c`).
 *
 * Architecture :
 *   - `installInputHandlers(scene, rt)` → installe window keydown/keyup qui
 *     écrivent directement dans `rt.gMain.heldKeys`. Cleanup auto au scene
 *     SHUTDOWN.
 *   - `setHeldKeysOverride(rt, mask)` → utilisé par `dev.skipUntil` pour
 *     simuler input. Override jusqu'à `clearHeldKeysOverride(rt)`.
 *   - Quand override actif, le keyboard handler est ignoré.
 *
 * NB : ESC handler reste scene-specific (= chaque scene gère son ESC).
 */
import Phaser from 'phaser';
import type { DecompRuntime } from './decomp-runtime';
import { keyToGbaMask } from '../../util/key-bindings';

/** Override flag stocké par rt (= permet d'avoir plusieurs runtimes en
 *  parallèle, théorique). En pratique 1 runtime à la fois. */
const _overrideMasks = new WeakMap<DecompRuntime, number | null>();

/** Force `rt.gMain.heldKeys = mask` au prochain frame. Si null, reprise du
 *  keyboard input normal. Utilisé par `dev.skipUntil` pour simuler input. */
export function setHeldKeysOverride(rt: DecompRuntime, mask: number | null): void {
  _overrideMasks.set(rt, mask);
  if (mask !== null) {
    rt.gMain.heldKeys = mask;
  }
}

export function clearHeldKeysOverride(rt: DecompRuntime): void {
  _overrideMasks.set(rt, null);
}

/** Installe les handlers keydown/keyup pour la scene + runtime donnés.
 *  Cleanup auto au SHUTDOWN.
 *
 *  Mécanisme :
 *  - keydown → rt.gMain.heldKeys |= mask
 *  - keyup   → rt.gMain.heldKeys &= ~mask
 *  - Si override actif (= dev.skipUntil), le keyboard est ignoré.
 *
 *  Focus : le canvas est focused au boot pour qu'il capture le keyboard
 *  natif. Listeners au window pour fonctionner peu importe la cible. */
export function installInputHandlers(scene: Phaser.Scene, rt: DecompRuntime): void {
  const canvas = scene.game.canvas;
  canvas.tabIndex = 0;
  canvas.style.outline = 'none';
  setTimeout(() => canvas.focus(), 0);

  const isOverridden = (): boolean => {
    const m = _overrideMasks.get(rt);
    return m !== undefined && m !== null;
  };

  const keydownHandler = (e: KeyboardEvent): void => {
    if (isOverridden()) return;
    const mask = keyToGbaMask(e.key);
    if (mask) {
      rt.gMain.heldKeys |= mask;
      if (document.activeElement === canvas) e.preventDefault();
    }
  };

  const keyupHandler = (e: KeyboardEvent): void => {
    if (isOverridden()) return;
    const mask = keyToGbaMask(e.key);
    if (mask) {
      rt.gMain.heldKeys &= ~mask;
      if (document.activeElement === canvas) e.preventDefault();
    }
  };

  window.addEventListener('keydown', keydownHandler);
  window.addEventListener('keyup', keyupHandler);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    window.removeEventListener('keydown', keydownHandler);
    window.removeEventListener('keyup', keyupHandler);
  });
}
