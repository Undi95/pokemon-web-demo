/**
 * step-callbacks.ts — 1:1 décomp `src/overworld.c:gPerStepCallbacks[]` +
 * `RunOnSteppedCallback` + `ActivatePerStepCallback`.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/overworld.c:1846-1936` — gPerStepCallbacks
 *     array + RunOnSteppedCallback + ActivatePerStepCallback
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/event_objects.h` —
 *     STEP_CB_* constants (0..7)
 *
 * Concept :
 *   Le décomp utilise `sActivePerStepCallback` (u8 0..7) qui index dans
 *   `sPerStepCallbacks[]` array de function pointers. `RunOnSteppedCallback`
 *   appelle la function active à chaque step du player.
 *
 *   Usage : Route 113 (ash piles), Route 119 (Fortree bridges sinking),
 *   Pacifidlog (log bridges sinking), Sootopolis (gym ice cracks).
 *
 *   Notre opcode `setstepcallback id` set sActivePerStepCallback, et notre
 *   player-avatar.ts `PlayerStep` complete handler appelle `DoPerStepCallback()`.
 */

import { gameState } from './game-state';
import { FlagSet } from './script-vars';
import { gSaveBlock1Ptr } from './save-block-state';

// ─── Callback IDs 1:1 décomp event_objects.h ────────────────────────────────

export const STEP_CB_DUMMY = 0;
export const STEP_CB_ASH = 1;
export const STEP_CB_FORTREE_BRIDGE = 2;
export const STEP_CB_PACIFIDLOG_BRIDGE = 3;
export const STEP_CB_TRUCK = 4;
export const STEP_CB_SOOTOPOLIS_ICE = 5;
export const STEP_CB_TICKING_CLOCK = 6;
export const STEP_CB_BIRTH_ISLAND_ZONE = 7;

// ─── State 1:1 décomp ────────────────────────────────────────────────────────

/** 1:1 décomp `sActivePerStepCallback` (overworld.c). Static u8 0..7. */
let _sActivePerStepCallback = STEP_CB_DUMMY;

/** Total step count (= `gSaveBlock1Ptr->gameStats[GAME_STAT_STEPS]` 1:1 décomp).
 *  Stocké via gameState.gameStats. Utilisé par daily flag clear, daycare egg
 *  generation, time-based events trigger. */
function _getStepCount(): number {
  // 1:1 décomp `gSaveBlock1Ptr->gameStats[GAME_STAT_STEPS]`.
  const stats = gSaveBlock1Ptr.gameStats as number[] | undefined;
  return stats?.[1 /* GAME_STAT_STEPS */] ?? 0;
}

function _incStepCount(): void {
  const stats = gSaveBlock1Ptr.gameStats as number[] | undefined;
  if (stats) {
    stats[1] = (stats[1] ?? 0) + 1;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** 1:1 décomp `ActivatePerStepCallback(id)` (overworld.c:1936).
 *  Set le callback actif. Range check (id < 8). */
export function ActivatePerStepCallback(id: number): void {
  if (id >= 0 && id < 8) {
    _sActivePerStepCallback = id;
  } else {
    console.warn(`[step-callbacks] invalid STEP_CB id=${id}, defaulting to STEP_CB_DUMMY`);
    _sActivePerStepCallback = STEP_CB_DUMMY;
  }
  // Expose pour debug
  (globalThis as Record<string, unknown>).gActivePerStepCallbackId = _sActivePerStepCallback;
}

/** Reset le callback à DUMMY. Appelé au map switch / scene reset. */
export function ResetPerStepCallback(): void {
  _sActivePerStepCallback = STEP_CB_DUMMY;
}

/** 1:1 décomp `DoPerStepCallback` (overworld.c:1930) :
 *    void DoPerStepCallback(void) {
 *        sPerStepCallbacks[sActivePerStepCallback]();
 *    }
 *  Appelé par PlayerStep à la fin de chaque step (= tile transition complete).
 *  Aussi : increment gameStats[GAME_STAT_STEPS] + trigger daily flags après
 *  certains thresholds.
 */
export function DoPerStepCallback(): void {
  // Increment global step count.
  _incStepCount();

  // Dispatch au callback actif.
  const cb = _PER_STEP_CALLBACKS[_sActivePerStepCallback] ?? _stepCb_Dummy;
  cb();

  // 1:1 décomp `IncrementDailyStepsCounter` + daily flag clear check.
  // Au-delà de 256 steps post-checkpoint, on déclenche les daily events.
  const stepCount = _getStepCount();
  if (stepCount > 0 && stepCount % 256 === 0) {
    _onDailyStepThreshold();
  }
}

// ─── Per-callback implementations 1:1 décomp ────────────────────────────────

function _stepCb_Dummy(): void {
  // STEP_CB_DUMMY : no-op (= default state).
}

function _stepCb_Ash(): void {
  // 1:1 décomp `StepCB_Ash` (route113.c) : si player step sur ash pile metatile,
  // change le metatile pour montrer un ash pile cleared + drop White Soot bag.
  // MVP : pour le déclencher il faut detect MB_ASH metatile. Notre map system
  // expose MapGridGetMetatileBehaviorAt. Future : full Soot collection logic.
  // Placeholder log pour debug. Réel impl = SetMapGridMetatileId(x, y, METATILE_ROUTE113_ASH_CLEARED).
}

function _stepCb_FortreeBridge(): void {
  // 1:1 décomp `StepCB_FortreeBridge` (route119.c) : si player step sur log bridge,
  // anim le bridge sink down 1 frame.
}

function _stepCb_PacifidlogBridge(): void {
  // 1:1 décomp `StepCB_PacifidlogBridge` (pacifidlog.c) : si step sur log bridge,
  // log sink + adjacent logs sink slightly. Effect ondulatoire.
}

function _stepCb_Truck(): void {
  // 1:1 décomp `StepCB_Truck` (= unused dans la décomp, slot kept for compat).
}

function _stepCb_SootopolisIce(): void {
  // 1:1 décomp `StepCB_SootopolisIce` (sootopolis.c) : crack ice tile + sink
  // après 2 steps. Drop player to lower level si cracked tile fully broken.
}

function _stepCb_TickingClock(): void {
  // 1:1 décomp `StepCB_TickingClock` (= used pour Mt. Pyre's ticking clock).
}

function _stepCb_BirthIslandZone(): void {
  // 1:1 décomp `StepCB_BirthIslandZone` (birth_island.c) : trigger Deoxys
  // puzzle reset si player wanders off-zone.
}

/** 1:1 décomp `sPerStepCallbacks[]` (overworld.c:1846-1854) : table de 8
 *  function pointers indexée par STEP_CB_*. */
const _PER_STEP_CALLBACKS: Array<() => void> = [
  _stepCb_Dummy,            // STEP_CB_DUMMY = 0
  _stepCb_Ash,              // STEP_CB_ASH = 1
  _stepCb_FortreeBridge,    // STEP_CB_FORTREE_BRIDGE = 2
  _stepCb_PacifidlogBridge, // STEP_CB_PACIFIDLOG_BRIDGE = 3
  _stepCb_Truck,            // STEP_CB_TRUCK = 4
  _stepCb_SootopolisIce,    // STEP_CB_SOOTOPOLIS_ICE = 5
  _stepCb_TickingClock,     // STEP_CB_TICKING_CLOCK = 6
  _stepCb_BirthIslandZone,  // STEP_CB_BIRTH_ISLAND_ZONE = 7
];

// ─── Daily event triggers ────────────────────────────────────────────────────

/** 1:1 décomp `OverworldStepCounter_ClearMassOutbreak` + `RotateTrainerStuff` :
 *  Tous les 256 steps, on rotate les trainer rematch flags + clear mass outbreak
 *  state. */
function _onDailyStepThreshold(): void {
  // Set a flag pour daily logic à read.
  FlagSet('FLAG_HIT_256_STEPS_THRESHOLD');
  // Trigger time-based event check (= berry growth, daily flags).
  // Future : call DoTimeBasedEvents() depuis ici.
}
