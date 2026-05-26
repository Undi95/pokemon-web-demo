/**
 * battle/battle-hp-bar.ts — Port 1:1 strict du HP bar drain animation.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c:2235-2549`
 *
 * Fonctions portées 1:1 :
 *   - SetBattleBarStruct (1015-1022) — init bar struct
 *   - MoveBattleBar (2238-2273) — drain animation entry (HP ou EXP bar)
 *   - CalcNewBarValue (2334-2411) — smooth interpolation Q24.8 fixed point
 *   - CalcBarFilledPixels (2413-2459) — calcul pixels filled par tile
 *   - GetScaledExpFraction (2497-2515) — fraction EXP scaled
 *   - GetHPBarLevel (2527-2549) — classification HP color (green/yellow/red)
 *
 * Mécanique 1:1 décomp :
 *   - Q24.8 fixed point pour smooth interpolation (= maxValue < scale path)
 *   - Bar drain = 1 pixel par frame jusqu'à atteindre newValue
 *   - 6 tiles HP bar (48px / 8) ; 8 tiles EXP bar (64px / 8)
 *   - Color thresholds : >50% green, >20% yellow, <=20% red, 0 empty
 *
 * Dépendances :
 *   - util.ts : GetScaledHPFraction (déjà 1:1 strict)
 *   - battle-healthbox.ts : healthbox handle pour wire visual
 */

import { GetScaledHPFraction } from './util';
import { MAX_BATTLERS_COUNT } from './state';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `B_HEALTHBAR_PIXELS` (battle_interface.c:2236) = 48 pixels = 6 tiles. */
export const B_HEALTHBAR_PIXELS = 48;

/** 1:1 décomp `B_EXPBAR_PIXELS` (battle_interface.c:2235) = 64 pixels = 8 tiles. */
export const B_EXPBAR_PIXELS = 64;

/** 1:1 décomp enum {HEALTH_BAR, EXP_BAR} (battle_interface.h:12-16). */
export const HEALTH_BAR = 0;
export const EXP_BAR = 1;

/** 1:1 décomp enum HP_BAR_* (battle_interface.h:18-25). */
export const HP_BAR_EMPTY = 0;
export const HP_BAR_RED = 1;
export const HP_BAR_YELLOW = 2;
export const HP_BAR_GREEN = 3;
export const HP_BAR_FULL = 4;

/** 1:1 décomp `Q_24_8(n)` macro = n << 8 (fixed-point 24.8). */
function Q_24_8(n: number): number { return n << 8; }

/** 1:1 décomp `Q_24_8_TO_INT(n)` macro = n >> 8. */
function Q_24_8_TO_INT(n: number): number { return n >> 8; }

// ─── BattleBarInfo struct 1:1 décomp ───────────────────────────────────────

/** 1:1 décomp `struct BattleBarInfo` (= field de `gBattleSpritesDataPtr->battleBars[]`).
 *  Tracking d'une animation de bar smooth (HP ou EXP). */
export interface BattleBarInfo {
  /** Sprite ID du healthbox (= référence pour update graphical). */
  healthboxSpriteId: number;
  /** Max value de la bar (= maxHP ou maxExp). */
  maxValue: number;
  /** Old value avant l'update (= currentHP ou currentExp pre-damage). */
  oldValue: number;
  /** Received value : positive = damage (drain), negative = heal (fill). */
  receivedValue: number;
  /** Current animation value (= interpolé entre oldValue et newValue).
   *  Q24.8 fixed-point quand maxValue < scale*8 (= petit max → smoother).
   *  Sentinel `-32768` = first frame, init pending. */
  currValue: number;
}

/** Helper : crée un BattleBarInfo blank. */
function _makeBlankBattleBarInfo(): BattleBarInfo {
  return { healthboxSpriteId: 0, maxValue: 0, oldValue: 0, receivedValue: 0, currValue: 0 };
}

/** 1:1 décomp `gBattleSpritesDataPtr->battleBars[MAX_BATTLERS_COUNT]`.
 *  Per-battler tracking de l'animation de bar en cours. */
export const battleBars: BattleBarInfo[] = (() => {
  const arr: BattleBarInfo[] = [];
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) arr.push(_makeBlankBattleBarInfo());
  return arr;
})();

// ─── SetBattleBarStruct (battle_interface.c:1015) — 1:1 décomp ─────────────

/** 1:1 décomp `SetBattleBarStruct(battler, healthboxSpriteId, maxVal, oldVal, receivedValue)`
 *  (battle_interface.c:1015-1022). Init un BattleBarInfo pour démarrer une
 *  animation de drain/fill.
 *
 *  Le `currValue = -32768` est le sentinel pour CalcNewBarValue first-call
 *  init (= il copie oldValue vers currValue, en Q24.8 si maxValue < scale). */
export function SetBattleBarStruct(
  battler: number, healthboxSpriteId: number,
  maxVal: number, oldVal: number, receivedValue: number,
): void {
  battleBars[battler].healthboxSpriteId = healthboxSpriteId;
  battleBars[battler].maxValue = maxVal;
  battleBars[battler].oldValue = oldVal;
  battleBars[battler].receivedValue = receivedValue;
  battleBars[battler].currValue = -32768;
}

// ─── MoveBattleBar (battle_interface.c:2238) — 1:1 décomp ──────────────────

/** 1:1 décomp `MoveBattleBar(battler, healthboxSpriteId, whichBar, unused)`
 *  (battle_interface.c:2238-2273). Tick une frame de bar drain animation.
 *  Returns la valeur courante de la bar après ce tick, ou -1 si animation
 *  terminée (= newValue atteint).
 *
 *  Caller doit appeler chaque frame jusqu'à -1 return. La graphical update
 *  (= MoveBattleBarGraphically) est appelée side-effect à chaque tick. */
export function MoveBattleBar(
  battler: number, _healthboxSpriteId: number, whichBar: number, _unused: number,
): number {
  let currentBarValue: number;
  const bar = battleBars[battler];

  if (whichBar === HEALTH_BAR) {
    // HP bar : scale 6 (= B_HEALTHBAR_PIXELS / 8 = 48/8 = 6), toAdd 1.
    const newCurr = _calcNewBarValueRef({ value: bar.currValue });
    currentBarValue = CalcNewBarValue(
      bar.maxValue, bar.oldValue, bar.receivedValue,
      newCurr, B_HEALTHBAR_PIXELS / 8, 1,
    );
    bar.currValue = newCurr.value;
  } else {
    // EXP bar : scale 8 (= B_EXPBAR_PIXELS / 8 = 64/8 = 8), toAdd dynamique.
    let expFraction = GetScaledExpFraction(
      bar.oldValue, bar.receivedValue, bar.maxValue, 8,
    );
    if (expFraction === 0) expFraction = 1;
    expFraction = Math.abs(Math.floor(bar.receivedValue / expFraction));

    const newCurr = _calcNewBarValueRef({ value: bar.currValue });
    currentBarValue = CalcNewBarValue(
      bar.maxValue, bar.oldValue, bar.receivedValue,
      newCurr, B_EXPBAR_PIXELS / 8, expFraction,
    );
    bar.currValue = newCurr.value;
  }

  // 1:1 décomp ll. 2266-2267 : graphical update (= MoveBattleBarGraphically).
  // Notre port : caller wire vers battle-healthbox.ts via _moveBattleBarGraphicallyHook.
  if (whichBar === EXP_BAR || whichBar === HEALTH_BAR) {
    _moveBattleBarGraphicallyHook(battler, whichBar);
  }

  if (currentBarValue === -1) {
    bar.currValue = 0;
  }

  return currentBarValue;
}

/** Helper : wraps un primitive number dans un objet pour pass-by-ref. */
type _ValueRef = { value: number };
function _calcNewBarValueRef(_r: _ValueRef): _ValueRef { return _r; }

/** Hook pour wire le graphical update (= caller fournit l'impl ; default no-op). */
let _moveBattleBarGraphicallyHook: (battler: number, whichBar: number) => void = (): void => {
  // Dette R3 : wire vers battle-healthbox.ts MoveBattleBarGraphically port.
};
export function setMoveBattleBarGraphicallyHook(fn: (battler: number, whichBar: number) => void): void {
  _moveBattleBarGraphicallyHook = fn;
}

// ─── CalcNewBarValue (battle_interface.c:2334) — 1:1 décomp ────────────────

/** 1:1 décomp `CalcNewBarValue(maxValue, oldValue, receivedValue, currValue*, scale, toAdd)`
 *  (battle_interface.c:2334-2411). Calcule la prochaine valeur de la bar
 *  pour smooth animation.
 *
 *  Logique :
 *  - First call (currValue == -32768) : init currValue depuis oldValue
 *    (= en Q24.8 si maxValue < scale).
 *  - Per call : avance currValue d'un step (toAdd ou Q_24_8(maxValue)/scale).
 *  - Return -1 si arrived at newValue (= animation done).
 *  - Return current displayed value sinon.
 *
 *  Le `currValue` est passé par référence (= TS object wrapper). */
export function CalcNewBarValue(
  maxValue: number, oldValue: number, receivedValue: number,
  currValue: _ValueRef, scale: number, toAdd: number,
): number {
  let ret: number;
  let newValue: number;
  scale *= 8;

  // 1:1 décomp ll. 2339-2345 : first function call init.
  if (currValue.value === -32768) {
    if (maxValue < scale) {
      currValue.value = Q_24_8(oldValue);
    } else {
      currValue.value = oldValue;
    }
  }

  newValue = oldValue - receivedValue;
  if (newValue < 0) newValue = 0;
  else if (newValue > maxValue) newValue = maxValue;

  // 1:1 décomp ll. 2353-2362 : done check.
  if (maxValue < scale) {
    if (newValue === Q_24_8_TO_INT(currValue.value) && (currValue.value & 0xFF) === 0) {
      return -1;
    }
  } else {
    if (newValue === currValue.value) {
      return -1;
    }
  }

  // 1:1 décomp ll. 2364-2391 : maxValue < scale path (Q24.8 fixed point).
  if (maxValue < scale) {
    const localToAdd = Math.floor(Q_24_8(maxValue) / scale);

    if (receivedValue < 0) {
      // 1:1 décomp ll. 2369-2376 : fill bar right (heal).
      currValue.value += localToAdd;
      ret = Q_24_8_TO_INT(currValue.value);
      if (ret >= newValue) {
        currValue.value = Q_24_8(newValue);
        ret = newValue;
      }
    } else {
      // 1:1 décomp ll. 2378-2390 : move bar left (damage).
      currValue.value -= localToAdd;
      ret = Q_24_8_TO_INT(currValue.value);
      // 1:1 décomp ll. 2382-2384 : try round up if fractional remains.
      if ((currValue.value & 0xFF) > 0) ret++;
      if (ret <= newValue) {
        currValue.value = Q_24_8(newValue);
        ret = newValue;
      }
    }
  } else {
    // 1:1 décomp ll. 2392-2408 : maxValue >= scale path (integer arithmetic).
    if (receivedValue < 0) {
      currValue.value += toAdd;
      if (currValue.value > newValue) currValue.value = newValue;
      ret = currValue.value;
    } else {
      currValue.value -= toAdd;
      if (currValue.value < newValue) currValue.value = newValue;
      ret = currValue.value;
    }
  }

  return ret;
}

// ─── CalcBarFilledPixels (battle_interface.c:2413) — 1:1 décomp ────────────

/** 1:1 décomp `CalcBarFilledPixels(maxValue, oldValue, receivedValue, currValue*, pixelsArray, scale)`
 *  (battle_interface.c:2413-2459). Calcule combien de pixels sont remplis
 *  par tile (= 8 pixels par tile, 6 ou 8 tiles total).
 *
 *  Returns le total de pixels filled (=0 à 48 pour HP, 0 à 64 pour EXP).
 *  `pixelsArray[]` est rempli avec le count par tile (0..8). */
export function CalcBarFilledPixels(
  maxValue: number, oldValue: number, receivedValue: number,
  currValue: _ValueRef, pixelsArray: number[], scale: number,
): number {
  let pixels: number;
  let filledPixels: number;

  let newValue = oldValue - receivedValue;
  if (newValue < 0) newValue = 0;
  else if (newValue > maxValue) newValue = maxValue;

  const totalPixels = scale * 8;

  // 1:1 décomp l. 2427 : init pixelsArray à 0.
  for (let i = 0; i < scale; i++) pixelsArray[i] = 0;

  // 1:1 décomp ll. 2429-2432 : compute pixels.
  if (maxValue < totalPixels) {
    pixels = (currValue.value * totalPixels / maxValue) >> 8;
  } else {
    pixels = currValue.value * totalPixels / maxValue;
  }
  pixels = Math.floor(pixels);

  filledPixels = pixels;

  // 1:1 décomp ll. 2436-2456 : distribute pixels par tile.
  if (filledPixels === 0 && newValue > 0) {
    pixelsArray[0] = 1;
    filledPixels = 1;
  } else {
    for (let i = 0; i < scale; i++) {
      if (pixels >= 8) {
        pixelsArray[i] = 8;
      } else {
        pixelsArray[i] = pixels;
        break;
      }
      pixels -= 8;
    }
  }

  return filledPixels;
}

// ─── GetScaledExpFraction (battle_interface.c:2497) — 1:1 décomp ───────────

/** 1:1 décomp `GetScaledExpFraction(oldValue, receivedValue, maxValue, scale)`
 *  (battle_interface.c:2497-2515). Fraction EXP scaled pour MoveBattleBar
 *  EXP path (= determine vitesse d'animation EXP bar). */
export function GetScaledExpFraction(
  oldValue: number, receivedValue: number, maxValue: number, scale: number,
): number {
  scale *= 8;
  let newVal = oldValue - receivedValue;

  if (newVal < 0) newVal = 0;
  else if (newVal > maxValue) newVal = maxValue;

  // s8 cast côté décomp ; on simule en clipping aux 8 bits signés.
  const oldToMaxFull = Math.floor(oldValue * scale / maxValue);
  const newToMaxFull = Math.floor(newVal * scale / maxValue);
  const oldToMax = _toS8(oldToMaxFull);
  const newToMax = _toS8(newToMaxFull);
  const result = oldToMax - newToMax;

  return Math.abs(result);
}

/** Helper : convert int to signed 8-bit (s8). */
function _toS8(v: number): number {
  v = v & 0xFF;
  if (v >= 128) v -= 256;
  return v;
}

// ─── GetHPBarLevel (battle_interface.c:2527) — 1:1 décomp ──────────────────

/** 1:1 décomp `GetHPBarLevel(hp, maxhp)` (battle_interface.c:2527-2549).
 *  Classification HP color level (FULL/GREEN/YELLOW/RED/EMPTY). */
export function GetHPBarLevel(hp: number, maxhp: number): number {
  let result: number;

  if (hp === maxhp) {
    result = HP_BAR_FULL;
  } else {
    const fraction = GetScaledHPFraction(hp, maxhp, B_HEALTHBAR_PIXELS);
    if (fraction > Math.floor(B_HEALTHBAR_PIXELS * 50 / 100)) {
      result = HP_BAR_GREEN;
    } else if (fraction > Math.floor(B_HEALTHBAR_PIXELS * 20 / 100)) {
      result = HP_BAR_YELLOW;
    } else if (fraction > 0) {
      result = HP_BAR_RED;
    } else {
      result = HP_BAR_EMPTY;
    }
  }

  return result;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleHpBar = {
  SetBattleBarStruct, MoveBattleBar, CalcNewBarValue, CalcBarFilledPixels,
  GetScaledExpFraction, GetHPBarLevel,
  battleBars,
  HEALTH_BAR, EXP_BAR,
  HP_BAR_EMPTY, HP_BAR_RED, HP_BAR_YELLOW, HP_BAR_GREEN, HP_BAR_FULL,
  B_HEALTHBAR_PIXELS, B_EXPBAR_PIXELS,
};
