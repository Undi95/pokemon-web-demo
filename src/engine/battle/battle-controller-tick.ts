/**
 * battle/battle-controller-tick.ts — Scheduler tick pour Controller IPC system.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c`
 * (= main loop AgbMain qui appelle gMain.callback2() chaque frame, et chaque
 * battler controller func via gBattlerControllerFuncs[]).
 *
 * ## Phase L14 — wire UI controllers
 *
 * Le scheduler ici fait le pont entre :
 *   - le main game loop Phaser (= scene.update)
 *   - les controllers IPC (= K29/K31/K32 + L1..L13 handlers wirés)
 *
 * **Flag d'activation** : `window.__USE_CONTROLLER_DISPATCH__`.
 *   - false (default) : battle-flow.ts state machine inline actuelle drive le
 *     combat. Pas de Controller IPC tick (= flow pré-Phase L).
 *   - true : Controller IPC system actif. tickActiveBattlerController() appelé
 *     chaque frame depuis le scene update loop pour drive le combat via
 *     gBattlerControllerFuncs.
 *
 * Permet rollback réversible : si user A/B trouve un bug avec Controller IPC,
 * il peut désactiver le flag pour retomber sur battle-flow.ts state machine.
 *
 * ## Architecture 1:1 décomp
 *
 * Le décomp main loop pseudocode :
 * ```c
 * while (1) {
 *   gMain.callback2();  // = current scene callback (CB2_BattleMainCB1 etc.)
 *   for (i = 0; i < gBattlersCount; i++) {
 *     if (gBattleControllerExecFlags & gBitTable[i]) {
 *       gActiveBattler = i;
 *       gBattlerControllerFuncs[i]();
 *     }
 *   }
 *   VBlankIntr();
 * }
 * ```
 *
 * Notre port : tickActiveBattlerController() implémente le loop interne for
 * (= tick chaque battler dont exec flag est set).
 */

import {
  gActiveBattler, setActiveBattler, gBattlersCount, gBattleControllerExecFlags,
} from './state';
import { gBitTable } from './battle-controllers';
import { getBattlerControllerFunc as _getBattlerControllerFuncPlayer } from '../../game/battle_controller_player';

// ─── Flag d'activation Controller IPC dispatch ─────────────────────────────

/** Flag global pour activer le Controller IPC system. Default false :
 *  battle-flow.ts state machine inline drive le combat. Set true via
 *  `window.__USE_CONTROLLER_DISPATCH__ = true` pour activer Phase L wires. */
export function isControllerDispatchEnabled(): boolean {
  const g = globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean };
  return !!g.__USE_CONTROLLER_DISPATCH__;
}

// ─── Scheduler tick (= main loop battlers controller funcs) ────────────────

/** 1:1 décomp main loop AgbMain inner for : pour chaque battler dont
 *  gBattleControllerExecFlags bit est set, set gActiveBattler = battler + call
 *  gBattlerControllerFuncs[battler]() (= dispatch ou direct handler).
 *
 *  Appelé chaque frame depuis scene update loop si flag dispatch activé. */
export function tickActiveBattlerController(): void {
  if (!isControllerDispatchEnabled()) return;

  const savedActive = gActiveBattler;
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleControllerExecFlags & gBitTable[i]) {
      setActiveBattler(i);
      const fn = _getBattlerControllerFuncPlayer(i);
      if (fn) {
        try { fn(); }
        catch (e) {
          console.warn('[battle-controller-tick] controller func threw:', i, e);
        }
      }
    }
  }
  // Restore gActiveBattler (= 1:1 décomp comportement, le caller s'attend).
  setActiveBattler(savedActive);
}

// ─── Devtools expose pour test A/B ─────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleControllerTick = {
  isControllerDispatchEnabled,
  tickActiveBattlerController,
  /** Enable Controller IPC dispatch (= Phase L wires actifs). */
  enable: () => { (globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean }).__USE_CONTROLLER_DISPATCH__ = true; },
  /** Disable Controller IPC dispatch (= rollback vers battle-flow inline). */
  disable: () => { (globalThis as { __USE_CONTROLLER_DISPATCH__?: boolean }).__USE_CONTROLLER_DISPATCH__ = false; },
};
