/**
 * src/game/battle_interface.ts — MIROIR 1:1 strict de `src/battle_interface.c`
 * (D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c, ~2600 l.).
 *
 * CONSOLIDATION EN COURS (mêmes noms de fonctions/globals que la décomp) :
 *   ✅ Tranche BARRES (ex battle-hp-bar.ts) : SetBattleBarStruct (1015) ·
 *      MoveBattleBar (2238) · CalcNewBarValue (2334) · CalcBarFilledPixels (2413) ·
 *      GetScaledExpFraction (2497) · GetHPBarLevel (2527) · struct battleBars.
 *   ✅ Tranche PARTY-SUMMARY (ex battle-party-summary.ts) :
 *      CreatePartyStatusSummarySprites (1450) · Task_HidePartyStatusSummary (1671)
 *      + _BattleStart_1/_2/_DuringBattle · SpriteCB_StatusSummaryBar/Balls_* (1817-1910)
 *      + tables subsprites (535-635) · gBattlerStatusSummaryTaskId.
 *   ⏳ À ABSORBER (phases C2-C3, vivent encore en src/engine/battle/) :
 *      battle-healthbox-l.ts (CreateBattlerHealthboxSprites / UpdateHealthboxAttribute /
 *      SetHealthboxSprite* / InitBattlerHealthboxCoords / UpdateHpTextInHealthbox /
 *      MoveBattleBarGraphically) + battle-healthbox.ts (primitives de rendu camelCase
 *      à renommer aux noms décomp : UpdateLvlInHealthbox / UpdateNickInHealthbox /
 *      UpdateStatusIconInHealthbox / TextIntoHealthboxObject / assets) +
 *      SwapHpBarsWithHpText (battle-controller-player) + GetScaledHPFraction (util).
 *
 * Les anciens fichiers engine sont des RE-EXPORTS de ce miroir (zéro dup — le code
 * vit ICI). Couche plateforme (sprites/OAM/tasks) = src/engine/system (cf.
 * sprite-c-platform-layer) ; modèle sprite PLAT (pas de sous-objet .oam).
 */

import { MAX_BATTLERS_COUNT } from './engine/battle/state';
import { DestroySprite } from './sprite';

/** 1:1 décomp `u8 GetScaledHPFraction(s16 hp, s16 maxhp, u8 scale)`
 *  (battle_interface.c:2517-2525). Re-homé ici depuis engine/battle/util.ts
 *  (consolidation C4) — util.ts ré-exporte. */
export function GetScaledHPFraction(hp: number, maxhp: number, scale: number): number {
  if (maxhp === 0) return 0;
  const result = Math.floor((hp * scale) / maxhp);
  if (result === 0 && hp > 0) return 1;
  return result;
}

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

/** Hook pour wire le graphical update (= 1:1 décomp `MoveBattleBar` appelle
 *  `MoveBattleBarGraphically`). CÂBLÉ au boot par battle-healthbox-l.ts:469
 *  `setMoveBattleBarGraphicallyHook(MoveBattleBarGraphically)` (rendu via le modèle
 *  gHealthboxSpriteIds). Le default no-op ci-dessous n'est utilisé qu'AVANT ce
 *  câblage (= entre l'import de ce module et celui de battle-healthbox-l.ts). */
let _moveBattleBarGraphicallyHook: (battler: number, whichBar: number) => void = (): void => {
  // default no-op (overridé au boot par setMoveBattleBarGraphicallyHook).
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
/**
 * battle-party-summary.ts — Port 1:1 strict de la tranche PARTY SUMMARY de
 * `battle_interface.c` (la barre + 6 balls d'état d'équipe à l'intro des combats
 * dresseur, et au switch-out en cours de combat).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c
 *   - sStatusSummaryBar_Subsprites_Enter/Exit + tables   (ll. 535-635)
 *   - sStatusSummaryBarSpriteSheet/Pal + Balls            (ll. 640-658)
 *   - sOamData_64x32 / sOamData_StatusSummaryBalls        (ll. 661-693)
 *   - sStatusSummaryBar/BallsSpriteTemplates              (ll. 695-737)
 *   - CreatePartyStatusSummarySprites                     (ll. 1450-1668)
 *   - Task_HidePartyStatusSummary (+_BattleStart_1/_2/_DuringBattle) (ll. 1671-1809)
 *   - SpriteCB_StatusSummaryBar_Enter/Exit                (ll. 1817-1831)
 *   - SpriteCB_StatusSummaryBalls_Enter/Exit/OnSwitchout  (ll. 1833-1910)
 *
 * Assets (mêmes gfx que la décomp, pré-extraits) :
 *   - ball_status_bar.png 128×8 = 16 tiles = gBattleInterface_BallStatusBarGfx (0x200)
 *   - ball_display.png     32×8 =  4 tiles = gHealthboxElementsGfxTable[HEALTHBOX_GFX_STATUS_BALL..]
 *     (4 états consécutifs : Full(+0) / Empty(+1) / Statused(+2) / Fainted(+3) — l'ordre
 *      des +N est celui des `oam.tileNum += N` du décomp : +1 empty, +2 status, +3 fainted.)
 *
 * TRANCHE de battle_interface.c → à CONSOLIDER dans src/game/battle_interface.ts
 * (migration miroir). Divergence plateforme : loads PNG async (préchargés puis
 * LoadSpriteSheet/LoadSpritePalette synchrones 1:1) ; SE via __PlaySE (pas de pan).
 */

import { getRuntime, SetSubspriteTables, clearSubspriteTable, FreeSpriteTilesByTag, type NamingSubsprite } from '../harness/runtime/decomp-globals';
import { LoadSpriteSheet, LoadSpritePalette, FreeSpritePaletteByTag } from './sprite';
import { loadIndexedPngStrict, extractPngPlte } from '../harness/gba/png-loader';
import { gBattleTypeFlags } from './engine/battle/state';
import { GET_BATTLER_SIDE, B_SIDE_PLAYER, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_MULTI, BATTLE_TYPE_TWO_OPPONENTS } from './engine/battle/constants';
import {
  setPartyStatusSummaryShown, incSummaryBarsActive, decSummaryBarsActive, getSummaryBarsActive,
} from './engine/battle/battle-sprites-data';
import { SE_BALL_TRAY_ENTER, SE_BALL_TRAY_BALL, SE_BALL_TRAY_EXIT } from '../include/constants/songs';

// ─── Constantes 1:1 ──────────────────────────────────────────────────────────
const PARTY_SIZE = 6;
/** 1:1 décomp `HP_EMPTY_SLOT` (battle_interface.h) : slot vide / œuf. */
export const HP_EMPTY_SLOT = 0xFFFF;
const TILE_BYTES = 32;

/** 1:1 décomp `struct HpAndStatus` (battle_interface.h). */
export interface HpAndStatus { hp: number; status: number; }

/** 1:1 décomp `EWRAM_DATA u8 gBattlerStatusSummaryTaskId[MAX_BATTLERS_COUNT]`
 *  (battle_main.c) — taskId de la barre party-summary par battler. */
export const gBattlerStatusSummaryTaskId: number[] = [0, 0, 0, 0];

// ─── Sprite/task plumbing types (modèle plat runtime) ───────────────────────
interface Spr {
  spriteId: number; oamIndex: number;
  x: number; y: number; x2: number; y2: number;
  data: number[]; tileBase: number; subpriority: number;
  invisible: boolean; inUse: boolean; hFlip: boolean;
  objMode: number;
  callback: ((s: Spr) => void) | null;
}
interface Tsk { taskId: number; func: ((t: Tsk) => void) | null; data: number[]; }

function _rt(): ReturnType<typeof getRuntime> { return getRuntime(); }
function _spr(id: number): Spr | undefined {
  return _rt()?.gSprites[id] as unknown as Spr | undefined;
}
function _playSE(id: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  g.__PlaySE?.(id);
}

// ─── Tables subsprites 1:1 (battle_interface.c:535-635) ─────────────────────
// .x décomp = u16 tronqué s8 (DISPLAY_WIDTH=240→-16 ; 32*5=160→-96 ; 32*6=192→-64 ;
// 32*7=224→-32 ; 32*0..2 = 0/32/64). Bande Enter = 128px [x-96, x+32).
const sStatusSummaryBar_Subsprites_Enter: readonly NamingSubsprite[] = [
  { x: -96, y: 0, shape: 1, size: 1, tileOffset: 0,  priority: 1 },
  { x: -64, y: 0, shape: 1, size: 1, tileOffset: 4,  priority: 1 },
  { x: -32, y: 0, shape: 1, size: 1, tileOffset: 8,  priority: 1 },
  { x: 0,   y: 0, shape: 1, size: 1, tileOffset: 12, priority: 1 },
];
// Exit = 192px (extension droite, ré-utilise tileOffset 8 ×2 + 12 en bout).
const sStatusSummaryBar_Subsprites_Exit: readonly NamingSubsprite[] = [
  { x: -96, y: 0, shape: 1, size: 1, tileOffset: 0,  priority: 1 },
  { x: -64, y: 0, shape: 1, size: 1, tileOffset: 4,  priority: 1 },
  { x: -32, y: 0, shape: 1, size: 1, tileOffset: 8,  priority: 1 },
  { x: 0,   y: 0, shape: 1, size: 1, tileOffset: 8,  priority: 1 },
  { x: 32,  y: 0, shape: 1, size: 1, tileOffset: 8,  priority: 1 },
  { x: 64,  y: 0, shape: 1, size: 1, tileOffset: 12, priority: 1 },
];

// ─── Assets (tags 1:1 ; data préchargée puis LoadSpriteSheet sync 1:1) ───────
const TAG_STATUS_SUMMARY_BAR_TILE = 'TAG_STATUS_SUMMARY_BAR_TILE';
const TAG_STATUS_SUMMARY_BALLS_TILE = 'TAG_STATUS_SUMMARY_BALLS_TILE';
const TAG_STATUS_SUMMARY_BAR_PAL = 'TAG_STATUS_SUMMARY_BAR_PAL';
const TAG_STATUS_SUMMARY_BALLS_PAL = 'TAG_STATUS_SUMMARY_BALLS_PAL';
const BALL_STATUS_BAR_PNG = '/decomp/em/battle_interface/ball_status_bar.png';
const BALL_DISPLAY_PNG = '/decomp/em/battle_interface/ball_display.png';

let _barGfx: Uint8Array | null = null;        // 16 tiles (0x200)
let _ballsGfx: Uint8Array | null = null;      // 4 tiles (0x80)
let _barPal: Uint16Array | null = null;
let _ballsPal: Uint16Array | null = null;

/** Précharge les PNG (1×). Les LoadSpriteSheet/Palette (tags) se font à CHAQUE
 *  création, 1:1 décomp CreatePartyStatusSummarySprites ll. 1489-1492. */
async function _ensurePartySummaryAssets(): Promise<boolean> {
  if (_barGfx && _ballsGfx && _barPal && _ballsPal) return true;
  try {
    const bar = await loadIndexedPngStrict(BALL_STATUS_BAR_PNG, 4);
    const balls = await loadIndexedPngStrict(BALL_DISPLAY_PNG, 4);
    const barPlte = await extractPngPlte(BALL_STATUS_BAR_PNG);
    const ballsPlte = await extractPngPlte(BALL_DISPLAY_PNG);
    if (!barPlte || !ballsPlte) return false;
    _barGfx = bar.charData; _ballsGfx = balls.charData;
    _barPal = barPlte.subarray(0, 16); _ballsPal = ballsPlte.subarray(0, 16);
    return true;
  } catch { return false; }
}

// ─── Sprite callbacks 1:1 (battle_interface.c:1817-1910) ────────────────────

/** 1:1 `SpriteCB_StatusSummaryBar_Enter` (:1817) : glisse x2 vers 0 par pas data[0]. */
function SpriteCB_StatusSummaryBar_Enter(sprite: Spr): void {
  if (sprite.x2 !== 0) sprite.x2 += sprite.data[0];
}

/** 1:1 `SpriteCB_StatusSummaryBar_Exit` (:1823) : accélère vers l'extérieur. */
function SpriteCB_StatusSummaryBar_Exit(sprite: Spr): void {
  sprite.data[1] += 32;
  if (sprite.data[0] > 0) sprite.x2 += sprite.data[1] >> 4;
  else sprite.x2 -= sprite.data[1] >> 4;
  sprite.data[1] &= 0xF;
}

/** 1:1 `SpriteCB_StatusSummaryBalls_Enter` (:1833) : délai data[1], puis x2
 *  accélère (data[3]+=56, pas = data[3]>>4) vers 0 ; SE à l'arrivée. */
function SpriteCB_StatusSummaryBalls_Enter(sprite: Spr): void {
  if (sprite.data[1] > 0) { sprite.data[1]--; return; }
  const isOpponent = sprite.data[2];
  let v = (sprite.data[3] + 56) & 0xFFFF;
  sprite.data[3] = v & 0xFFF0;
  if (isOpponent !== 0) {
    sprite.x2 += v >> 4;
    if (sprite.x2 > 0) sprite.x2 = 0;
  } else {
    sprite.x2 -= v >> 4;
    if (sprite.x2 < 0) sprite.x2 = 0;
  }
  if (sprite.x2 === 0) {
    // 1:1 : data[7]!=0 (slot vide) → SE_BALL_TRAY_EXIT, sinon SE_BALL_TRAY_BALL.
    // (pan stéréo omis : __PlaySE sans pan, pattern port.)
    if (sprite.data[7] !== 0) _playSE(SE_BALL_TRAY_EXIT);
    else _playSE(SE_BALL_TRAY_BALL);
    sprite.callback = null;  // = SpriteCallbackDummy
  }
}

/** 1:1 `SpriteCB_StatusSummaryBalls_Exit` (:1878). */
function SpriteCB_StatusSummaryBalls_Exit(sprite: Spr): void {
  if (sprite.data[1] > 0) { sprite.data[1]--; return; }
  const isOpponent = sprite.data[2];
  let v = (sprite.data[3] + 56) & 0xFFFF;
  sprite.data[3] = v & 0xFFF0;
  if (isOpponent !== 0) sprite.x2 += v >> 4;
  else sprite.x2 -= v >> 4;
  if (sprite.x2 + sprite.x > 248 || sprite.x2 + sprite.x < -8) {
    sprite.invisible = true;
    sprite.callback = null;  // = SpriteCallbackDummy
  }
}

/** 1:1 `SpriteCB_StatusSummaryBalls_OnSwitchout` (:1904) : suit la barre. */
function SpriteCB_StatusSummaryBalls_OnSwitchout(sprite: Spr): void {
  const bar = _spr(sprite.data[0]);
  if (!bar) return;
  sprite.x2 = bar.x2;
  sprite.y2 = bar.y2;
}

// ─── CreatePartyStatusSummarySprites 1:1 (battle_interface.c:1450-1668) ─────

/** 1:1 décomp `u8 CreatePartyStatusSummarySprites(battler, partyInfo, skipPlayer,
 *  isBattleStart)` — crée la barre (subsprites, slide-in) + 6 ball icons + la task
 *  porteuse. Retourne le taskId. ASYNC plateforme : les gfx sont préchargés par
 *  ensurePartySummaryAssets (cf. handlers controllers). */
export function CreatePartyStatusSummarySprites(
  battler: number, partyInfo: HpAndStatus[], skipPlayer: boolean, isBattleStart: boolean,
): number {
  const rt = _rt();
  if (!rt || !_barGfx || !_ballsGfx || !_barPal || !_ballsPal) return -1;

  // ── ll. 1459-1487 : géométrie par side. (B_POSITION_OPPONENT_RIGHT = doubles.)
  let isOpponent: boolean;
  let bar_X: number, bar_Y: number, bar_pos2_X: number, bar_data0: number;
  if (GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER) {
    isOpponent = false;
    bar_X = 136; bar_Y = 96;
    bar_pos2_X = 100;
    bar_data0 = -5;
  } else {
    isOpponent = true;
    bar_X = 104; bar_Y = 40;
    bar_pos2_X = -100;
    bar_data0 = 5;
  }

  // ── ll. 1489-1492 : load sheets + palettes (tags 1:1, idempotent par tag).
  const barTileStart = LoadSpriteSheet({ data: _barGfx, size: 0x200, tag: TAG_STATUS_SUMMARY_BAR_TILE });
  const ballsTileStart = LoadSpriteSheet({ data: _ballsGfx, size: 0x80, tag: TAG_STATUS_SUMMARY_BALLS_TILE });
  const barPalSlot = LoadSpritePalette({ data: _barPal, tag: TAG_STATUS_SUMMARY_BAR_PAL });
  const ballsPalSlot = LoadSpritePalette({ data: _ballsPal, tag: TAG_STATUS_SUMMARY_BALLS_PAL });

  // ── ll. 1494-1507 : la barre (sOamData_64x32, subpriority 10) + subsprites Enter.
  const bar = rt.CreateSpriteAtOam({
    tileId: barTileStart, paletteBank: barPalSlot,
    x: bar_X, y: bar_Y,
    shape: 1, size: 3,           // 1:1 sOamData_64x32 (le rendu réel = subsprites)
    priority: 1, subpriority: 10,
  });
  const barSp = _spr(bar.spriteId);
  if (!barSp) return -1;
  barSp.tileBase = barTileStart;
  SetSubspriteTables(bar.spriteId, sStatusSummaryBar_Subsprites_Enter);
  barSp.x2 = bar_pos2_X;
  barSp.data[0] = bar_data0;
  if (isOpponent) {
    barSp.x -= 96;
    barSp.hFlip = true;          // 1:1 oam.matrixNum = ST_OAM_HFLIP
  } else {
    barSp.x += 96;
  }
  barSp.callback = SpriteCB_StatusSummaryBar_Enter as unknown as Spr['callback'];

  // ── ll. 1509-1538 : 6 ball icons (8×8, subpriority 9).
  const ballIds: number[] = [];
  for (let i = 0; i < PARTY_SIZE; i++) {
    const b = rt.CreateSpriteAtOam({
      tileId: ballsTileStart, paletteBank: ballsPalSlot,
      x: bar_X, y: bar_Y - 4,
      shape: 0, size: 0,
      priority: 1, subpriority: 9,
    });
    const sp = _spr(b.spriteId);
    if (!sp) continue;
    sp.tileBase = ballsTileStart;
    sp.callback = (isBattleStart ? SpriteCB_StatusSummaryBalls_Enter : SpriteCB_StatusSummaryBalls_OnSwitchout) as unknown as Spr['callback'];
    sp.data[0] = bar.spriteId;
    if (!isOpponent) {
      sp.x += 10 * i + 24;
      sp.data[1] = i * 7 + 10;
      sp.x2 = 120;
    } else {
      sp.x -= 10 * (5 - i) + 24;
      sp.data[1] = (6 - i) * 7 + 10;
      sp.x2 = -120;
    }
    sp.data[2] = isOpponent ? 1 : 0;
    ballIds.push(b.spriteId);
  }

  // ── ll. 1540-1650 : états des balls (tileNum += 1 vide / 2 status / 3 KO).
  // (Clause BATTLE_TYPE_ARENA omise : arenaLostMons non porté, type jamais set.)
  const setTile = (spriteId: number, delta: number, isEmpty: boolean): void => {
    const sp = _spr(spriteId);
    if (!sp) return;
    sp.tileBase += delta;
    const oam = rt.gba.oam[sp.oamIndex];
    if (oam) oam.tileId = sp.tileBase;
    if (isEmpty) sp.data[7] = 1;
  };
  if (GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER) {
    if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      for (let i = 0; i < PARTY_SIZE; i++) {
        if (partyInfo[i].hp === HP_EMPTY_SLOT) setTile(ballIds[i], 1, true);
        else if (partyInfo[i].hp === 0) setTile(ballIds[i], 3, false);
        else if (partyInfo[i].status !== 0) setTile(ballIds[i], 2, false);
      }
    } else {
      // 1:1 ll. 1566-1592 : les slots vides se rangent à DROITE (var décroît),
      // les mons réels à GAUCHE (i croît).
      let iReal = 0, varEmpty = PARTY_SIZE - 1;
      for (let j = 0; j < PARTY_SIZE; j++) {
        if (partyInfo[j].hp === HP_EMPTY_SLOT) { setTile(ballIds[varEmpty], 1, true); varEmpty--; continue; }
        if (partyInfo[j].hp === 0) setTile(ballIds[iReal], 3, false);
        else if (partyInfo[j].status !== 0) setTile(ballIds[iReal], 2, false);
        iReal++;
      }
    }
  } else {
    if (gBattleTypeFlags & (BATTLE_TYPE_MULTI | BATTLE_TYPE_TWO_OPPONENTS)) {
      let v = PARTY_SIZE - 1;
      for (let i = 0; i < PARTY_SIZE; i++) {
        if (partyInfo[i].hp === HP_EMPTY_SLOT) setTile(ballIds[v], 1, true);
        else if (partyInfo[i].hp === 0) setTile(ballIds[v], 3, false);
        else if (partyInfo[i].status !== 0) setTile(ballIds[v], 2, false);
        v--;
      }
    } else {
      // 1:1 ll. 1622-1649 : vides à GAUCHE (i croît), mons réels à DROITE
      // (PARTY_SIZE-1-var décroît).
      let iEmpty = 0, varReal = 0;
      for (let j = 0; j < PARTY_SIZE; j++) {
        if (partyInfo[j].hp === HP_EMPTY_SLOT) { setTile(ballIds[iEmpty], 1, true); iEmpty++; continue; }
        if (partyInfo[j].hp === 0) setTile(ballIds[PARTY_SIZE - 1 - varReal], 3, false);
        else if (partyInfo[j].status !== 0) setTile(ballIds[PARTY_SIZE - 1 - varReal], 2, false);
        varReal++;
      }
    }
  }

  // ── ll. 1652-1666 : task porteuse (TaskDummy prio 5) + champs 1:1
  // (tBattler=data[0], tSummaryBarSpriteId=data[1], tBallIconSpriteId(i)=data[3+i],
  //  tIsBattleStart=data[10]).
  const taskId = rt.CreateTask(() => { /* 1:1 TaskDummy */ }, 5);
  const task = rt.gTasks[taskId] as unknown as Tsk | undefined;
  if (task) {
    task.data[0] = battler;
    task.data[1] = bar.spriteId;
    for (let i = 0; i < PARTY_SIZE; i++) task.data[3 + i] = ballIds[i] ?? -1;
    task.data[10] = isBattleStart ? 1 : 0;
  }
  if (isBattleStart) incSummaryBarsActive();   // 1:1 animationData->field_9_x1C++
  _playSE(SE_BALL_TRAY_ENTER);                 // 1:1 PlaySE12WithPanning(SE_BALL_TRAY_ENTER, 0)
  void skipPlayer;  // utilisé par le décomp pour B_POSITION_OPPONENT_RIGHT (doubles)
  return taskId;
}

// ─── Task_HidePartyStatusSummary 1:1 (battle_interface.c:1671-1809) ─────────

const BLDCNT_HIDE = 0x3F40;  // 1:1 BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND
function _bldAlpha(eva: number, evb: number): number { return (eva & 0x1F) | ((evb & 0x1F) << 8); }

/** 1:1 décomp `void Task_HidePartyStatusSummary(u8 taskId)` — lance le retrait
 *  (fade alpha + slide-out si battle-start, fade seul sinon). Poser via
 *  `gTasks[taskId].func = Task_HidePartyStatusSummary` (handlers Hide). */
export function Task_HidePartyStatusSummary(task: Tsk): void {
  const rt = _rt();
  if (!rt) return;
  const isBattleStart = task.data[10] !== 0;
  const summaryBarSpriteId = task.data[1];
  const battler = task.data[0];

  rt.SetGpuReg?.(0x050, BLDCNT_HIDE);
  rt.SetGpuReg?.(0x052, _bldAlpha(16, 0));
  task.data[15] = 16;  // tBlend

  for (let i = 0; i < PARTY_SIZE; i++) {
    const sp = _spr(task.data[3 + i]);
    if (sp) sp.objMode = 1;  // ST_OAM_OBJ_BLEND
  }
  const barSp = _spr(summaryBarSpriteId);
  if (barSp) barSp.objMode = 1;

  if (isBattleStart) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      // 1:1 : côté adverse les délais s'appliquent en ordre inversé.
      const id = GET_BATTLER_SIDE(battler) !== B_SIDE_PLAYER
        ? task.data[3 + (PARTY_SIZE - 1 - i)]
        : task.data[3 + i];
      const sp = _spr(id);
      if (!sp) continue;
      sp.data[1] = 7 * i;
      sp.data[3] = 0;
      sp.data[4] = 0;
      sp.callback = SpriteCB_StatusSummaryBalls_Exit as unknown as Spr['callback'];
    }
    if (barSp) {
      barSp.data[0] = (barSp.data[0] / 2) | 0;
      barSp.data[1] = 0;
      barSp.callback = SpriteCB_StatusSummaryBar_Exit as unknown as Spr['callback'];
      SetSubspriteTables(summaryBarSpriteId, sStatusSummaryBar_Subsprites_Exit);
    }
    task.func = Task_HidePartyStatusSummary_BattleStart_1;
  } else {
    task.func = Task_HidePartyStatusSummary_DuringBattle;
  }
}

/** 1:1 `Task_HidePartyStatusSummary_BattleStart_1` (:1727) : fade alpha 1 cran / 2 frames. */
function Task_HidePartyStatusSummary_BattleStart_1(task: Tsk): void {
  const rt = _rt();
  if (!rt) return;
  if ((task.data[11]++ % 2) === 0) {
    if (--task.data[15] < 0) return;
    rt.SetGpuReg?.(0x052, _bldAlpha(task.data[15], 16 - task.data[15]));
  }
  if (task.data[15] === 0) task.func = Task_HidePartyStatusSummary_BattleStart_2;
}

/** Destruction commune des sprites (bar + 6 balls) — 1:1 ll. 1750-1768 :
 *  les RESSOURCES (tiles/palette par tag) ne sont libérées que quand PLUS AUCUNE
 *  barre n'est active (field_9_x1C == 0). */
function _destroySummarySprites(task: Tsk, freeResources: boolean): void {
  const rt = _rt();
  if (!rt) return;
  const barId = task.data[1];
  clearSubspriteTable(barId);
  if (freeResources) {
    // 1:1 DestroySpriteAndFreeResources : tiles + palettes par tag.
    FreeSpriteTilesByTag(TAG_STATUS_SUMMARY_BAR_TILE);
    FreeSpriteTilesByTag(TAG_STATUS_SUMMARY_BALLS_TILE);
    FreeSpritePaletteByTag(TAG_STATUS_SUMMARY_BAR_PAL);
    FreeSpritePaletteByTag(TAG_STATUS_SUMMARY_BALLS_PAL);
  }
  DestroySprite(barId);
  for (let i = 0; i < PARTY_SIZE; i++) {
    const id = task.data[3 + i];
    if (id >= 0) DestroySprite(id);
  }
}

/** 1:1 `Task_HidePartyStatusSummary_BattleStart_2` (:1740). */
function Task_HidePartyStatusSummary_BattleStart_2(task: Tsk): void {
  const rt = _rt();
  if (!rt) return;
  const battler = task.data[0];
  if (--task.data[15] === -1) {
    decSummaryBarsActive();  // 1:1 animationData->field_9_x1C--
    _destroySummarySprites(task, getSummaryBarsActive() === 0);
  } else if (task.data[15] === -3) {
    setPartyStatusSummaryShown(battler, false);
    rt.SetGpuReg?.(0x050, 0);
    rt.SetGpuReg?.(0x052, 0);
    rt.DestroyTask(task.taskId);
  }
}

/** 1:1 `Task_HidePartyStatusSummary_DuringBattle` (:1779) : fade 1 cran/frame. */
function Task_HidePartyStatusSummary_DuringBattle(task: Tsk): void {
  const rt = _rt();
  if (!rt) return;
  const battler = task.data[0];
  if (--task.data[15] >= 0) {
    rt.SetGpuReg?.(0x052, _bldAlpha(task.data[15], 16 - task.data[15]));
  } else if (task.data[15] === -1) {
    _destroySummarySprites(task, true);
  } else if (task.data[15] === -3) {
    setPartyStatusSummaryShown(battler, false);
    rt.SetGpuReg?.(0x050, 0);
    rt.SetGpuReg?.(0x052, 0);
    rt.DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `gTasks[gBattlerStatusSummaryTaskId[battler]].func = Task_HidePartyStatusSummary`
 *  (PlayerHandleHidePartyStatusSummary :3060 / Opponent :1971) — inline statement décomp,
 *  exposé en helper car gTasks vit sur le runtime. */
export function SetTaskFuncToHidePartyStatusSummary(taskId: number): void {
  const task = _rt()?.gTasks[taskId] as unknown as Tsk | undefined;
  if (task) task.func = Task_HidePartyStatusSummary as unknown as Tsk['func'];
}

// ─── API handlers (controllers) ──────────────────────────────────────────────

/** Précharge des gfx (appelé par les handlers AVANT CreatePartyStatusSummarySprites —
 *  divergence plateforme async, cf. en-tête). */
export { _ensurePartySummaryAssets as ensurePartySummaryAssets };

/** Devtools / A-B. */
(globalThis as Record<string, unknown>).__battlePartySummary = {
  CreatePartyStatusSummarySprites, Task_HidePartyStatusSummary,
  ensurePartySummaryAssets: _ensurePartySummaryAssets,
  getSummaryBarsActive, gBattlerStatusSummaryTaskId,
};
/**
 * battle-healthbox-l.ts — Couche VOIE L du healthbox combat, modèle décomp STRICT.
 *
 * 1:1 décomp `src/battle_interface.c` : `gHealthboxSpriteIds[battler]` (= u8 sprite id
 * du healthbox LEFT) + `CreateBattlerHealthboxSprites` + `SpriteCB_HealthBar` /
 * `SpriteCB_HealthBoxOther` + `SetHealthboxSpriteVisible/Invisible` +
 * `InitBattlerHealthboxCoords` + `UpdateHealthboxAttribute` + `MoveBattleBarGraphically`.
 *
 * Les sprites sont liés par DATA FIELDS (1:1 décomp), pas par un struct "handle" :
 *   - LEFT  : data[5] = healthbar sprite id (hMain_HealthBarSpriteId)
 *             data[6] = battler             (hMain_Battler)
 *             data[7] = right sprite id     (décomp = oam.affineParam ; le runtime n'a
 *                                            pas de affineParam-comme-u8 → data[7])
 *   - RIGHT : data[5] = left sprite id      (hOther_HealthBoxSpriteId)
 *   - BAR   : data[5] = left sprite id      (hBar_HealthBoxSpriteId)
 *             data[6] = data6               (hBar_Data6 ; 0=player, 2=opponent single)
 *
 * Réutilise les PRIMITIVES DE RENDU 1:1 de battle-healthbox.ts (draw tiles barre/
 * digits/niveau/statut/nick/exp) + la logique de barre 1:1 de battle-hp-bar.ts
 * (MoveBattleBar/CalcNewBarValue). Le `HealthboxHandle` n'est utilisé que comme
 * BUNDLE TRANSIENT (reconstruit depuis les data fields à chaque appel) pour appeler
 * ces primitives — il n'est PAS l'état persistant (= gHealthboxSpriteIds l'est).
 *
 * La voie V (battle-flow.ts, handle persistant + hook) reste INTACTE = path
 * production des vraies rencontres. Dette explicite : à supprimer quand voie V part.
 *
 * Module à IMPORT TARDIF (boot voie L) : il s'auto-enregistre sur
 * `globalThis.__battleHealthbox` (que les controllers lisent déjà via
 * `_gHealthboxSpriteId` / `_UpdateHealthboxAttribute`). Pas de cycle TDZ (cf. warning
 * en tête de battle-healthbox.ts) car personne ne l'importe statiquement tôt.
 */

// (getRuntime / gBattleTypeFlags / GET_BATTLER_SIDE / B_SIDE_PLAYER : déjà importés
//  par les sections précédentes. SetBattleBarStruct / MoveBattleBar / battleBars /
//  HEALTH_BAR / EXP_BAR / setMoveBattleBarGraphicallyHook : LOCAUX, section barres.)
import { syncSubspriteOam } from '../harness/runtime/decomp-globals';
// (createBattlerHealthboxSprites / setHealthboxVisible / updateHealthbox* /
//  drawBallCaughtIndicator / HealthboxHandle : LOCAUX depuis la phase C3 —
//  la section primitives/assets ci-dessous, ex battle-healthbox.ts.)
import {
  gPlayerParty, gEnemyParty, GetMonData,
  MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_LEVEL, MON_DATA_STATUS,
  MON_DATA_SPECIES, MON_DATA_NICKNAME,
} from './engine/battle/party-storage';
import { gBattlerPartyIndexes, gBattlersCount } from './engine/battle/state';
import { getExpForLevel } from './data/pokemon/experience_tables';
import { getSpeciesGrowthRate } from './data/pokemon/species_info';
import { GetGenderFromSpeciesAndPersonality } from '../include/pokemon';
import { GetBattlerPosition } from './engine/battle/util';
import { BATTLE_TYPE_TRAINER, BATTLE_TYPE_WALLY_TUTORIAL } from './engine/battle/constants';
import { GetSetPokedexFlag } from './pokedex';
import { FLAG_GET_CAUGHT } from '../include/pokedex';
import { SpeciesToNationalPokedexNum } from './engine/data/game-data';

/** Type du paramètre mon de GetMonData (= Pokemon). Évite d'importer le type
 *  Pokemon (cycle potentiel) ; le bord hook __battleHealthbox passe `unknown`. */
type Mon = Parameters<typeof GetMonData>[0];

// ─── HEALTHBOX_* element ids (1:1 décomp include/battle_interface.h:52-63) ──────
const HEALTHBOX_ALL = 0;
const HEALTHBOX_CURRENT_HP = 1;
const HEALTHBOX_MAX_HP = 2;
const HEALTHBOX_LEVEL = 3;
const HEALTHBOX_NICK = 4;
const HEALTHBOX_HEALTH_BAR = 5;
const HEALTHBOX_EXP_BAR = 6;
const HEALTHBOX_STATUS_ICON = 9;

// ─── 1:1 décomp `gHealthboxSpriteIds[MAX_BATTLERS]` (battle_main.c) ─────────────
/** Sprite id du healthbox LEFT par battler (= ce que retourne CreateBattlerHealthboxSprites).
 *  -1 = pas encore créé. Lu par les controllers via `__battleHealthbox.gHealthboxSpriteIds`. */
export const gHealthboxSpriteIds: number[] = [-1, -1, -1, -1];

/** 1:1 décomp `IsDoubleBattle()` (battle_util.c) : gBattleTypeFlags & BATTLE_TYPE_DOUBLE.
 *  TOUS les chemins DOUBLE de ce module sont gatés dessus → single byte-identique. */
function IsDoubleBattle(): boolean {
  return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0;
}

// ─── 1:1 décomp `gBattleSpritesDataPtr->battlerData[b].hpNumbersNoBars:1` ────────
/** État par-battler : afficher les CHIFFRES PV au lieu des barres (toggle START en
 *  DOUBLE, 1:1 `SwapHpBarsWithHpText` battle_interface.c:1389). Reste 0 partout hors
 *  double (jamais togglé en single : le gate de SwapHpBars skippe les 2 battlers) →
 *  les gardes `!hpNumbersNoBars` valent TRUE en single = chemin single INCHANGÉ.
 *  Stocké ICI ("battle_interface local", cf. step 2 ; précédent = battlerData harness
 *  engine/battle/battle-sprites-data.ts pour behindSubstitute/invisible) car les 2
 *  LECTEURS (UpdateHpTextInHealthboxInDoubles, UpdateStatusIconInHealthbox) vivent
 *  dans ce module ; le WRITER _SwapHpBarsWithHpText (battle_controller_player.ts) y
 *  accède via le hook __battleHealthbox (comme gHealthboxSpriteIds). */
const _hpNumbersNoBars: number[] = [0, 0, 0, 0];
/** 1:1 lecture `gBattleSpritesDataPtr->battlerData[b].hpNumbersNoBars`. */
export function isHpNumbersNoBars(battler: number): boolean { return (_hpNumbersNoBars[battler] | 0) !== 0; }
/** 1:1 `hpNumbersNoBars ^= 1` (SwapHpBarsWithHpText:1389). Retourne la nouvelle valeur. */
export function toggleHpNumbersNoBars(battler: number): number { return (_hpNumbersNoBars[battler] ^= 1); }
/** Reset par combat (= alloc fraîche de gBattleSpritesDataPtr). */
export function resetHpNumbersNoBars(): void { for (let i = 0; i < _hpNumbersNoBars.length; i++) _hpNumbersNoBars[i] = 0; }

/** Side d'un battler (1:1 `GetBattlerSide` : position & BIT_SIDE). Single :
 *  position pair (0/2) = joueur, impair (1/3) = adversaire. */
function _sideOf(battler: number): 'player' | 'opponent' {
  return (GetBattlerPosition(battler) & 1) === 0 ? 'player' : 'opponent';
}

function _partyMon(battler: number): Mon {
  const party = _sideOf(battler) === 'player' ? gPlayerParty : gEnemyParty;
  return party[gBattlerPartyIndexes[battler]] as Mon;
}

/** Reconstruit un HealthboxHandle TRANSIENT depuis les data fields du sprite LEFT
 *  (1:1 décomp : les fonctions de rendu lisent gSprites[healthboxSpriteId].hMain_*).
 *  Le handle n'est PAS persistant — il bundle juste les 3 ids pour les primitives. */
function _handleFromSpriteId(healthboxSpriteId: number): HealthboxHandle | null {
  const rt = getRuntime();
  if (!rt) return null;
  const left = rt.gSprites[healthboxSpriteId];
  if (!left || !left.data) return null;
  const battler = left.data[6] | 0;
  const side = _sideOf(battler);
  const barSpriteId = left.data[5] | 0;
  // 1:1 décomp : les fns de rendu adressent via `gSprites[healthboxSpriteId].oam.tileNum
  // * TILE_SIZE_4BPP` (box) et `gSprites[healthBarSpriteId].oam.tileNum * TILE_SIZE_4BPP`
  // (barre). Le runtime nomme le champ `oam.tileId` (= décomp `oam.tileNum`). On lit donc
  // la base PAR POSITION directement depuis l'OAM du sprite (step 3). Fallback = constante
  // side single si l'OAM est absent → garantit le single INCHANGÉ même en cas de lecture
  // ratée. Preuve single : le box left est créé avec tileId = HEALTHBOX_{PLAYER,OPPONENT}_VRAM/32
  // → oam.tileId*32 == la constante ; idem barre = HPBAR_{PLAYER,OPP}_LEFT_VRAM.
  const leftOam = rt.gba.oam[left.oamIndex];
  const barSprite = rt.gSprites[barSpriteId];
  const barOam = barSprite ? rt.gba.oam[barSprite.oamIndex] : null;
  const baseVram = leftOam
    ? (leftOam.tileId | 0) * TILE_BYTES
    : (side === 'player' ? HEALTHBOX_PLAYER_VRAM : HEALTHBOX_OPPONENT_VRAM);
  const barBaseVram = barOam
    ? (barOam.tileId | 0) * TILE_BYTES
    : (side === 'player' ? HPBAR_PLAYER_LEFT_VRAM : HPBAR_OPP_LEFT_VRAM);
  return {
    leftSpriteId: healthboxSpriteId,
    rightSpriteId: left.data[7] | 0,
    healthbarSpriteId: barSpriteId,
    side,
    centerX: left.x,
    centerY: left.y,
    baseVram,
    barBaseVram,
  };
}

// ─── 1:1 décomp `SpriteCB_HealthBar` (battle_interface.c:979-1002) ──────────────
/** La barre HP suit le healthbox LEFT chaque frame (x = box.x + offset selon data6). */
function SpriteCB_HealthBar(sprite: { data: number[]; x: number; y: number; x2: number; y2: number }): void {
  const rt = getRuntime();
  if (!rt) return;
  const box = rt.gSprites[sprite.data[5] | 0];
  if (!box) return;
  const data6 = sprite.data[6] | 0;
  // 1:1 décomp : case 0/1 → +16 ; case 2 (opp) → +8.
  sprite.x = box.x + (data6 === 2 ? 8 : 16);
  sprite.y = box.y;
  sprite.x2 = box.x2;
  sprite.y2 = box.y2;
}

// ─── 1:1 décomp `SpriteCB_HealthBoxOther` (battle_interface.c:1004-1013) ─────────
/** Le sprite RIGHT du healthbox suit le LEFT (x = left.x + 64). */
function SpriteCB_HealthBoxOther(sprite: { data: number[]; x: number; y: number; x2: number; y2: number }): void {
  const rt = getRuntime();
  if (!rt) return;
  const main = rt.gSprites[sprite.data[5] | 0];
  if (!main) return;
  sprite.x = main.x + 64;
  sprite.y = main.y;
  sprite.x2 = main.x2;
  sprite.y2 = main.y2;
}

// ─── 1:1 décomp `CreateBattlerHealthboxSprites` (battle_interface.c:869-951) ─────
/** Crée le healthbox d'un battler, lie les 3 sprites par data fields + callbacks,
 *  pose `gHealthboxSpriteIds[battler]`, retourne le sprite id LEFT.
 *
 *  ASYNC : la création de sprites (createBattlerHealthboxSprites) attend les assets
 *  (ensureHealthboxAssets). Le décomp est sync (assets pré-chargés) ; côté voie L on
 *  attend. Le caller (_BattleInitAllSprites, state machine) gère l'attente. */
export async function CreateBattlerHealthboxSprites(battler: number): Promise<number> {
  const rt = getRuntime();
  if (!rt) return -1;
  const side = _sideOf(battler);
  const handle = await createBattlerHealthboxSprites(side, battler);
  if (!handle) return -1;

  // 1:1 décomp `hBar_Data6` : player single=0 (l.871), player DOUBLE=1 (l.915), opp=2
  // (single l.895 / double l.928). data6 pilote SpriteCB_HealthBar.x : 0/1→+16, 2→+8.
  const data6 = side === 'player' ? (IsDoubleBattle() ? 1 : 0) : 2;
  const left = rt.gSprites[handle.leftSpriteId];
  const right = rt.gSprites[handle.rightSpriteId];
  const bar = rt.gSprites[handle.healthbarSpriteId];

  // 1:1 décomp ll. 940-948 : liens par data fields (= remplace handle persistant).
  if (left && left.data) {
    left.data[5] = handle.healthbarSpriteId;  // hMain_HealthBarSpriteId
    left.data[6] = battler;                   // hMain_Battler
    left.data[7] = handle.rightSpriteId;      // (décomp oam.affineParam → data[7])
    left.invisible = true;
  }
  if (right && right.data) {
    right.data[5] = handle.leftSpriteId;       // hOther_HealthBoxSpriteId
    right.callback = SpriteCB_HealthBoxOther as never;
    right.invisible = true;
  }
  if (bar && bar.data) {
    bar.data[5] = handle.leftSpriteId;         // hBar_HealthBoxSpriteId
    bar.data[6] = data6;                       // hBar_Data6
    bar.callback = SpriteCB_HealthBar as never;
    bar.invisible = true;
  }

  gHealthboxSpriteIds[battler] = handle.leftSpriteId;
  return handle.leftSpriteId;
}

// ─── 1:1 décomp `InitBattlerHealthboxCoords` (battle_interface.c:1072-1103) ──────
/** Pose la position home du healthbox. 1:1 : single = player (158,88) / opp (44,30) ;
 *  DOUBLE = 4 colonnes distinctes par position (PLAYER_LEFT 159,76 · PLAYER_RIGHT
 *  171,101 · OPPONENT_LEFT 44,19 · OPPONENT_RIGHT 32,44). Sans la branche double, les
 *  flancs (battlers 2/3) restaient posés aux coords single → empilés sur 0/1 = invisibles. */
export function InitBattlerHealthboxCoords(battler: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  const left = rt.gSprites[spriteId];
  if (!left) return;
  let x = 0, y = 0;
  if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) === 0) {   // 1:1 !IsDoubleBattle()
    if (_sideOf(battler) !== 'player') { x = 44; y = 30; }
    else { x = 158; y = 88; }
  } else {
    // 1:1 décomp l.1085-1099 : switch (GetBattlerPosition(battler)).
    switch (GetBattlerPosition(battler)) {
      case 0: x = 159; y = 76; break;   // B_POSITION_PLAYER_LEFT
      case 2: x = 171; y = 101; break;  // B_POSITION_PLAYER_RIGHT
      case 1: x = 44; y = 19; break;    // B_POSITION_OPPONENT_LEFT
      case 3: x = 32; y = 44; break;    // B_POSITION_OPPONENT_RIGHT
    }
  }
  // 1:1 décomp l.1102 : UpdateSpritePos(gHealthboxSpriteIds[battler], x, y). Le port
  // pose la position home sur le sprite LEFT ; right/bar la suivent via leurs SpriteCB.
  left.x = x;
  left.y = y;
}

// ─── 1:1 décomp `SetHealthboxSpriteVisible/Invisible` (ll. 1024-1036) ───────────
export function SetHealthboxSpriteVisible(healthboxSpriteId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (handle) setHealthboxVisible(handle, true);
}
export function SetHealthboxSpriteInvisible(healthboxSpriteId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (handle) setHealthboxVisible(handle, false);
  // Cacher la healthbox RÉARME le slide-in : la PROCHAINE sortie (send-out / switch-in)
  // doit la re-montrer ET la REDESSINER (UpdateHealthboxAttribute ALL) pour le mon
  // entrant. Sans ce reset, ShowHealthboxOnSendOut early-return (gate posé à l'intro,
  // jamais reset) → au switch la healthbox garde le NOM de l'ancien mon (niveau/PV OK).
  // 1:1 décomp : SwitchIn_TryShinyAnimShowHealthbox redessine la healthbox du nouveau mon.
  const b = gHealthboxSpriteIds.indexOf(healthboxSpriteId);
  if (b >= 0) _healthboxSlideInStarted[b] = false;
}

// ─── 1:1 décomp `StartHealthboxSlideIn` + callbacks (pokeball.c:1241-1278) ───────
// Le healthbox glisse depuis le côté à la sortie du mon (joueur : depuis la droite ;
// adversaire : depuis la gauche). data fields (1:1) : sSpeedX = data[0], sSpeedY =
// data[1] (slide) ; sDelayTimer = data[1] (variante PLAYER_RIGHT, double battle). Les
// 3 sprites (box LEFT / barre / right) glissent ensemble : barre et right copient
// box.x2 via leurs callbacks SpriteCB_HealthBar / SpriteCB_HealthBoxOther.
const B_POSITION_PLAYER_RIGHT = 2;  // 1:1 include/battle.h

/** 1:1 décomp `SpriteCallbackDummy` (sprite.c) : callback au repos du box LEFT. */
function SpriteCallbackDummy(_sprite: unknown): void { /* empty 1:1 */ }

/** 1:1 décomp `SpriteCB_HealthboxSlideIn(sprite)` (pokeball.c:1272-1278). */
function SpriteCB_HealthboxSlideIn(sprite: { data: number[]; x2: number; y2: number; callback?: unknown }): void {
  sprite.x2 -= sprite.data[0];  // sSpeedX
  sprite.y2 -= sprite.data[1];  // sSpeedY
  if (sprite.x2 === 0 && sprite.y2 === 0)
    sprite.callback = SpriteCallbackDummy as never;
}

/** 1:1 décomp `SpriteCB_HealthboxSlideInDelayed(sprite)` (pokeball.c:1262-1270).
 *  Attend 20 frames avant de lancer le slide (= partenaire droit, double battle). */
function SpriteCB_HealthboxSlideInDelayed(sprite: { data: number[]; callback?: unknown }): void {
  sprite.data[1]++;  // sDelayTimer
  if (sprite.data[1] === 20) {
    sprite.data[1] = 0;
    sprite.callback = SpriteCB_HealthboxSlideIn as never;
  }
}

/** 1:1 décomp `StartHealthboxSlideIn(battler)` (pokeball.c:1241-1260). Le box LEFT
 *  part offset de ±0x73 px et glisse vers sa position home (vitesse ±5/frame, ~23 frames). */
export function StartHealthboxSlideIn(battler: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  const healthboxSprite = rt.gSprites[spriteId];
  if (!healthboxSprite || !healthboxSprite.data) return;

  healthboxSprite.data[0] = 5;     // sSpeedX
  healthboxSprite.data[1] = 0;     // sSpeedY
  healthboxSprite.x2 = 0x73;
  healthboxSprite.y2 = 0;
  healthboxSprite.callback = SpriteCB_HealthboxSlideIn as never;
  if (_sideOf(battler) !== 'player') {
    healthboxSprite.data[0] = -healthboxSprite.data[0];
    healthboxSprite.data[1] = -healthboxSprite.data[1];
    healthboxSprite.x2 = -healthboxSprite.x2;
    healthboxSprite.y2 = -healthboxSprite.y2;
  }
  // 1:1 décomp l.1257 : kick le callback de la barre (data[5] = bar id) → sync x2 frame 1.
  const bar = rt.gSprites[(healthboxSprite.data[5] | 0)];
  if (bar && typeof bar.callback === 'function') (bar.callback as (s: unknown) => void)(bar);
  if (GetBattlerPosition(battler) === B_POSITION_PLAYER_RIGHT)
    healthboxSprite.callback = SpriteCB_HealthboxSlideInDelayed as never;
}

// ─── 1:1 décomp `MoveBattleBarGraphically` (battle_interface.c:2275-2330) ────────
/** Re-dessine les tuiles fill de la barre (HP ou EXP) au currValue interpolé. Lit
 *  battleBars[battler] (currValue Q24.8) → primitive de rendu 1:1. Appelé DIRECTEMENT
 *  par MoveBattleBar via le hook (= la seule indirection, cycle-safe ; sémantique
 *  identique à l'appel direct du décomp). */
function MoveBattleBarGraphically(battler: number, whichBar: number): void {
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  const handle = _handleFromSpriteId(spriteId);
  if (!handle) return;
  const bar = battleBars[battler];
  if (whichBar === HEALTH_BAR) {
    // Q24.8 quand maxValue < 48 (= B_HEALTHBAR_PIXELS), sinon entier (cf. CalcNewBarValue).
    // Dette b (sous-pixel) : on passe realHp (= currValue tronqué) ; updateHealthboxHpBar
    // recalcule l'array via la fonction 1:1 CalcBarFilledPixels. Le pixel-exact plein
    // (passer bar.currValue Q24.8) sera unifié lors de la consolidation battle_interface.
    const realHp = bar.maxValue < 48 ? bar.currValue / 256 : bar.currValue;
    updateHealthboxHpBar(handle, realHp, bar.maxValue);
  } else {
    // EXP : Q24.8 quand maxValue < 64 (= B_EXPBAR_PIXELS). Player only.
    const realExp = bar.maxValue < 64 ? bar.currValue / 256 : bar.currValue;
    const level = GetMonData(_partyMon(battler), MON_DATA_LEVEL) as number;
    updateHealthboxExpBar(handle, realExp, bar.maxValue, level);
  }
}

/** 1:1 décomp `TryAddPokeballIconToHealthbox` (battle_interface.c:1970-1991).
 *  CONDITION (combat sauvage + mon adverse déjà capturé) → affiche/efface le pokéball
 *  "owned" à côté du nom adverse (opp-only). Rendu VRAM = `drawBallCaughtIndicator`
 *  (battle-healthbox.ts, où vit l'asset) — split condition/asset assumé.
 *  noStatus = TRUE → affiche ; FALSE (un status occupe la place) → efface. */
function TryAddPokeballIconToHealthbox(battler: number, noStatus: boolean): void {
  if (gBattleTypeFlags & BATTLE_TYPE_WALLY_TUTORIAL) return;   // 1:1 :1974
  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) return;          // 1:1 :1976
  if (GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER) return;     // 1:1 :1980 (opp-only)
  const species = GetMonData(gEnemyParty[gBattlerPartyIndexes[battler]], MON_DATA_SPECIES) as number;  // 1:1 :1982
  if (!GetSetPokedexFlag(SpeciesToNationalPokedexNum(species), FLAG_GET_CAUGHT)) return;  // 1:1 :1982
  // 1:1 :1987-1990 : noStatus → CpuCopy32(BALL_CAUGHT) ; sinon → CpuFill32(0).
  drawBallCaughtIndicator(noStatus);
}

// ─── 1:1 décomp `UpdateHealthboxAttribute` (battle_interface.c:2163-2233) ────────
/** Dispatcher : dessine l'élément demandé (ALL = tout) sur le healthbox. Lit le mon
 *  via GetMonData (1:1). Réutilise les primitives de rendu 1:1. */
export function UpdateHealthboxAttribute(healthboxSpriteId: number, monRaw: unknown, elementId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle) return;
  const mon = monRaw as Mon;
  const battler = (() => {
    const rt = getRuntime();
    const left = rt?.gSprites[healthboxSpriteId];
    return left?.data ? (left.data[6] | 0) : 0;
  })();
  const isPlayer = handle.side === 'player';

  if (isPlayer) {
    if (elementId === HEALTHBOX_LEVEL || elementId === HEALTHBOX_ALL)
      UpdateLvlInHealthbox(handle, GetMonData(mon, MON_DATA_LEVEL) as number);
    if (elementId === HEALTHBOX_CURRENT_HP || elementId === HEALTHBOX_MAX_HP || elementId === HEALTHBOX_ALL)
      updateHealthboxHpDigits(handle, GetMonData(mon, MON_DATA_HP) as number, GetMonData(mon, MON_DATA_MAX_HP) as number);
    if (elementId === HEALTHBOX_HEALTH_BAR || elementId === HEALTHBOX_ALL) {
      const maxHp = GetMonData(mon, MON_DATA_MAX_HP) as number;
      const currHp = GetMonData(mon, MON_DATA_HP) as number;
      SetBattleBarStruct(battler, healthboxSpriteId, maxHp, currHp, 0);
      MoveBattleBar(battler, healthboxSpriteId, HEALTH_BAR, 0);  // → MoveBattleBarGraphically (hook)
    }
    if (!IsDoubleBattle() && (elementId === HEALTHBOX_EXP_BAR || elementId === HEALTHBOX_ALL)) {
      // 1:1 décomp l.2190 : `!isDoubles && (EXP_BAR || ALL)` — la barre EXP n'existe QUE
      // sur la grande box player single (la petite box double n'a pas la zone exp → écrire
      // aux offsets 0x24/0xB80 déborderait la région 0x800). Single : INCHANGÉ.
      // 1:1 décomp ll. 2197-2205 : currExpBarValue = exp - currLevelExp ;
      // maxExpBarValue = nextLevelExp - currLevelExp (via gExperienceTables).
      const species = GetMonData(mon, MON_DATA_SPECIES) as number;
      const level = GetMonData(mon, MON_DATA_LEVEL) as number;
      const exp = GetMonData(mon, 25 /* MON_DATA_EXP */) as number;
      const gr = getSpeciesGrowthRate(species);
      const currLevelExp = getExpForLevel(gr, level);
      const currExpBarValue = exp - currLevelExp;
      const maxExpBarValue = getExpForLevel(gr, level + 1) - currLevelExp;
      SetBattleBarStruct(battler, healthboxSpriteId, maxExpBarValue, currExpBarValue, 0);
      MoveBattleBar(battler, healthboxSpriteId, EXP_BAR, 0);
    }
    if (elementId === HEALTHBOX_NICK || elementId === HEALTHBOX_ALL)
      UpdateNickInHealthbox(handle, _nick(mon), _gender(mon));
    if (elementId === HEALTHBOX_STATUS_ICON || elementId === HEALTHBOX_ALL)
      UpdateStatusIconInHealthbox(handle, _statusString(mon));
  } else {
    if (elementId === HEALTHBOX_LEVEL || elementId === HEALTHBOX_ALL)
      UpdateLvlInHealthbox(handle, GetMonData(mon, MON_DATA_LEVEL) as number);
    if (elementId === HEALTHBOX_HEALTH_BAR || elementId === HEALTHBOX_ALL) {
      const maxHp = GetMonData(mon, MON_DATA_MAX_HP) as number;
      const currHp = GetMonData(mon, MON_DATA_HP) as number;
      SetBattleBarStruct(battler, healthboxSpriteId, maxHp, currHp, 0);
      MoveBattleBar(battler, healthboxSpriteId, HEALTH_BAR, 0);
    }
    if (elementId === HEALTHBOX_NICK || elementId === HEALTHBOX_ALL)
      UpdateNickInHealthbox(handle, _nick(mon), _gender(mon));
    if (elementId === HEALTHBOX_STATUS_ICON || elementId === HEALTHBOX_ALL) {
      const st = _statusString(mon);
      UpdateStatusIconInHealthbox(handle, st);
      // 1:1 décomp : UpdateStatusIconInHealthbox appelle TryAddPokeballIconToHealthbox
      // (pokéball "owned" à côté du nom adverse, combat sauvage). noStatus = pas de status.
      TryAddPokeballIconToHealthbox(battler, !st);
    }
  }
}

function _nick(mon: Mon): string {
  return (GetMonData(mon, MON_DATA_NICKNAME) as string) ?? '';
}

function _gender(mon: Mon): number {
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  const personality = (mon as { personality?: number }).personality ?? 0;
  return GetGenderFromSpeciesAndPersonality(species, personality);
}

/** Convertit status1 (bitmask) → string attendu par UpdateStatusIconInHealthbox
 *  ('PSN'/'PAR'/'SLP'/'FRZ'/'BRN'/null). 1:1 priorité décomp. */
function _statusString(mon: Mon): string | null {
  const s = (GetMonData(mon, MON_DATA_STATUS) as number) | 0;
  if (s & 0x07) return 'SLP';          // STATUS1_SLEEP (compteur bits 0-2)
  if (s & 0x08) return 'PSN';          // STATUS1_POISON
  if (s & 0x10) return 'BRN';          // STATUS1_BURN
  if (s & 0x20) return 'FRZ';          // STATUS1_FREEZE
  if (s & 0x40) return 'PAR';          // STATUS1_PARALYSIS
  if (s & 0x80) return 'PSN';          // STATUS1_TOXIC_POISON (icône PSN)
  return null;
}

/** Helper voie-L : crée le healthbox d'un battler, dessine TOUT (HEALTHBOX_ALL),
 *  puis le rend INVISIBLE. 1:1 décomp `BattleInitAllSprites` case 5
 *  (battle_gfx_sfx_util.c:886-892) : UpdateHealthboxAttribute(ALL) +
 *  SetHealthboxSpriteInvisible. Le healthbox est ensuite MONTRÉ + glissé au SEND-OUT
 *  du mon via ShowHealthboxOnSendOut (P1b — appelé par les handlers controller). */
export async function initBattlerHealthbox(battler: number): Promise<void> {
  const spriteId = await CreateBattlerHealthboxSprites(battler);
  if (spriteId < 0) return;
  InitBattlerHealthboxCoords(battler);
  UpdateHealthboxAttribute(spriteId, _partyMon(battler), HEALTHBOX_ALL);
  SetHealthboxSpriteInvisible(spriteId);  // 1:1 case 5 : créé caché, montré au send-out
}

/** 1:1 décomp : montre le healthbox d'un battler à la SORTIE du mon (send-out).
 *  Reproduit `Intro_TryShinyAnimShowHealthbox` (battle_controller_opponent.c:320-322 /
 *  battle_controller_player.c:1006-1008) : UpdateHealthboxAttribute(ALL) +
 *  StartHealthboxSlideIn + SetHealthboxSpriteVisible. Appelé par les handlers
 *  controller send-out (Player/Opponent HandleIntroTrainerBallThrow). Gate
 *  `_healthboxSlideInStarted` = 1:1 flag `healthboxSlideInStarted`. Le wait multi-frame
 *  du décomp (ball/shiny/cry anim) est collapsé ici = Dette R3 (intro simplifiée). */
const _healthboxSlideInStarted: boolean[] = [false, false, false, false];
export function ShowHealthboxOnSendOut(battler: number): void {
  const spriteId = gHealthboxSpriteIds[battler];
  if (spriteId < 0) return;
  if (_healthboxSlideInStarted[battler]) return;
  _healthboxSlideInStarted[battler] = true;
  UpdateHealthboxAttribute(spriteId, _partyMon(battler), HEALTHBOX_ALL);
  StartHealthboxSlideIn(battler);
  SetHealthboxSpriteVisible(spriteId);
}

// État de la state machine d'init (= 1:1 décomp BattleInitAllSprites étalé sur frames).
// 0 = pas lancé, 1 = création async en cours, 2 = fini.
let _hbInitState = 0;

/** State machine appelée par `_BattleInitAllSprites` (case 18) : kick off la création
 *  ASYNC des healthboxes des 2 battlers une fois, retourne false tant que pas fini,
 *  true ensuite. 1:1 esprit décomp (BattleInitAllSprites étale la création sur frames). */
export function initAllHealthboxes(): boolean {
  if (_hbInitState === 0) {
    _hbInitState = 1;
    // 1:1 décomp : la barre HP est un sprite à SOUS-SPRITES (SetSubspriteTables) ; ses
    // OAM enfants doivent être re-synchronisés (oam = sprite.x + sprite.x2 + sub.x) CHAQUE
    // frame, sinon ils restent à leur position de CRÉATION → barre désalignée + remplissage
    // qui ne glisse pas au slide-in. Le décomp le fait dans BuildOamBuffer
    // (AddSubspritesToOamBuffer) ; notre runtime l'expose via le hook globalThis.
    // _syncSubspriteOam (appelé chaque frame dans decomp-runtime:2360 après syncSpritesToOam).
    // On l'enregistre pour le combat (= 1:1 le pattern naming-screen-impl.ts:756).
    (globalThis as Record<string, unknown>)._syncSubspriteOam = syncSubspriteOam;
    // 1:1 décomp BattleInitAllSprites : crée la healthbox de TOUS les battlers (gBattlersCount
    // = 2 single, 4 double). Single INCHANGÉ (boucle 0,1). Double → 4 petites boxes.
    const _hbInits: Promise<void>[] = [];
    for (let b = 0; b < gBattlersCount; b++) _hbInits.push(initBattlerHealthbox(b));
    void Promise.all(_hbInits)
      .then(async () => {
        // 1:1 décomp BattleInitAllSprites case 6 (battle_gfx_sfx_util.c:899-903) :
        // healthboxes (case 5) PUIS LoadAndCreateEnemyShadowSprites. Le callback
        // (élévation espèce) est posé ici comme au reshow case 19 (1:1 même cascade).
        const gfx = await import('./battle_gfx_sfx_util');
        await gfx.ensureEnemyShadowAssets();
        gfx.LoadAndCreateEnemyShadowSprites();
        // (SetBattlerShadowSpriteCallback : PAS ici — 1:1, posé par le controller
        //  opponent APRÈS le send-out (Intro_WaitForShinyAnimAndHealthbox) et par le
        //  reshow case 19. L'appeler au boot rabattait l'ombre sur SetInvisible : le
        //  SpriteCB tickait avant la création du mon adverse.)
        _hbInitState = 2;
      })
      .catch((e) => { console.error('[healthbox-l] initAllHealthboxes THREW:', e); _hbInitState = 2; });
    return false;
  }
  return _hbInitState === 2;
}

/** Reset par combat (1:1 : sprites détruits par ResetSpriteData à CB2_InitBattle).
 *  À appeler au battle-start (BattleStartClearSetData) pour re-créer proprement. */
export function resetHealthboxL(): void {
  for (let i = 0; i < gHealthboxSpriteIds.length; i++) gHealthboxSpriteIds[i] = -1;
  for (let i = 0; i < _healthboxSlideInStarted.length; i++) _healthboxSlideInStarted[i] = false;
  _hbInitState = 0;
  resetHpNumbersNoBars();        // step 2 : hpNumbersNoBars = 0 par combat (1:1 alloc fraîche).
  resetDoublesHealthboxAssets(); // re-alloc/re-blit des régions doubles au prochain combat double.
  // Reset la machine BattleInitAllSprites du miroir gfx_sfx (refs gBattleCommunication
  // 1:1) — hook global (import statique = cycle, gfx_sfx importe déjà ce module).
  (globalThis as { __battleGfxSfxUtil?: { resetBattleInitAllSpritesState?: () => void } })
    .__battleGfxSfxUtil?.resetBattleInitAllSpritesState?.();
}

// ─── 1:1 décomp `UpdateHpTextInHealthbox` (battle_interface.c:1139-1172) ─────────
const HP_CURRENT = 0, HP_MAX = 1;  // 1:1 battle_interface.h
/** Met à jour les digits PV du healthbox (player single ; l'adversaire n'en a pas).
 *  hpId = HP_CURRENT/HP_MAX. Utilisé par CompleteOnHealthbarDone pour animer les
 *  digits AVEC la barre pendant le drain (value = valeur courante de MoveBattleBar).
 *  L'autre valeur (max si on update current, et inverse) vient du mon. */
export function UpdateHpTextInHealthbox(healthboxSpriteId: number, value: number, hpId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle || handle.side !== 'player') return;
  const rt = getRuntime();
  const left = rt?.gSprites[healthboxSpriteId];
  const battler = left?.data ? (left.data[6] | 0) : 0;
  const mon = _partyMon(battler);
  const currHp = hpId === HP_CURRENT ? value : (GetMonData(mon, MON_DATA_HP) as number);
  const maxHp = hpId === HP_MAX ? value : (GetMonData(mon, MON_DATA_MAX_HP) as number);
  updateHealthboxHpDigits(handle, currHp, maxHp);
}

// ─── Primitives spriteId pour SwapHpBarsWithHpText (battle_controller_player.ts) ──

/** 1:1 : `gSprites[healthboxSpriteId].callback == SpriteCallbackDummy` (box AU REPOS,
 *  = pas en slide-in). Le gate de SwapHpBarsWithHpText (l.1383) exige cet état. */
function isHealthboxAtRest(healthboxSpriteId: number): boolean {
  const rt = getRuntime();
  const sp = rt?.gSprites[healthboxSpriteId];
  if (!sp) return false;
  return sp.callback === (SpriteCallbackDummy as never) || sp.callback == null;
}

/** 1:1 : `CpuFill32(0, OBJ_VRAM0 + healthBar.oam.tileNum*32, 0x100)` — efface les 8 tuiles
 *  de la barre HP (bars → text). barBaseVram = région barre par position (step 3). */
function clearHealthbarTiles(healthboxSpriteId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle) return;
  rt.gba.objVram.fill(0, handle.barBaseVram, handle.barBaseVram + 0x100);
}

/** 1:1 : `CpuCopy32(GetHealthboxElementGfxPtr(HEALTHBOX_GFX_FRAME_END_BAR), OBJ_VRAM0 + 0x680
 *  + box.oam.tileNum*32, 32)` (text → bars, l.1410). Asset = healthbox_doubles_frameend_bar.png. */
function copyFrameEndBarToHealthbox(healthboxSpriteId: number): void {
  const rt = getRuntime();
  if (!rt || !_frameEndBarDblTile) return;
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle) return;
  rt.gba.objVram.set(_frameEndBarDblTile, handle.baseVram + 0x680);
}

/** Wrapper spriteId de `UpdateStatusIconInHealthbox` (+ pokéball owned côté opp, 1:1 la
 *  cascade UpdateHealthboxAttribute STATUS_ICON). Utilisé par SwapHpBarsWithHpText (text→bars). */
function UpdateStatusIconInHealthboxById(healthboxSpriteId: number): void {
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle) return;
  const rt = getRuntime();
  const left = rt?.gSprites[healthboxSpriteId];
  const battler = left?.data ? (left.data[6] | 0) : 0;
  const mon = _partyMon(battler);
  const st = _statusString(mon);
  UpdateStatusIconInHealthbox(handle, st);
  if (handle.side !== 'player') TryAddPokeballIconToHealthbox(battler, !st);
}

// ─── Enregistrement global (lu par les controllers via __battleHealthbox) ───────
(globalThis as Record<string, unknown>).__battleHealthbox = {
  gHealthboxSpriteIds,
  CreateBattlerHealthboxSprites,
  InitBattlerHealthboxCoords,
  SetHealthboxSpriteVisible,
  SetHealthboxSpriteInvisible,
  updateHealthboxAttribute: UpdateHealthboxAttribute,  // nom hook attendu par battle-controller-player._UpdateHealthboxAttribute
  UpdateHealthboxAttribute,
  initBattlerHealthbox,
  initAllHealthboxes,
  resetHealthboxL,
  UpdateHpTextInHealthbox,
  StartHealthboxSlideIn,
  ShowHealthboxOnSendOut,
  // ── Surface SwapHpBarsWithHpText (step 5) + états hpNumbersNoBars (step 2) ──
  isHpNumbersNoBars,
  toggleHpNumbersNoBars,
  UpdateHpTextInHealthboxInDoubles,
  UpdateStatusIconInHealthboxById,
  isHealthboxAtRest,
  clearHealthbarTiles,
  copyFrameEndBarToHealthbox,
  HEALTHBOX_HEALTH_BAR,   // 1:1 constante (= 5) pour UpdateHealthboxAttribute(HEALTH_BAR).
};

// 1:1 décomp : MoveBattleBar appelle MoveBattleBarGraphically. En TS, MoveBattleBar
// (battle-hp-bar.ts) est dans un autre module → on branche via le hook (cycle-safe).
// Pour la voie L c'est NOTRE MoveBattleBarGraphically (modèle gHealthboxSpriteIds).
setMoveBattleBarGraphicallyHook(MoveBattleBarGraphically);
/**
 * battle-healthbox.ts — Port 1:1 décomp `src/battle_interface.c`
 * `CreateBattlerHealthboxSprites` (ll. 869-951) + assets graphiques.
 *
 * Les HP boxes en GBA Émeraude ne sont **PAS** des windows BG via AddWindow.
 * Ce sont des **sprites OAM** créés par `CreateBattlerHealthboxSprites`,
 * composés de 3 sprites par battler :
 *   - `healthboxLeftSprite` (= "healthboxMain") : sprite principal qui contient
 *     le nickname, level, gender symbol, et (côté player) le label "HP"
 *   - `healthboxRightSprite` (= "healthboxOther") : sprite collé à droite qui
 *     contient le HP bar widget (8x widgets de 8 pixels), le label numérique
 *     HP courant/max, et l'icone de status condition
 *   - `healthbarSprite` (= "healthBar") : sprite séparé pour la barre verte/
 *     jaune/rouge dynamique (= 0..48 pixels horizontalement)
 *
 * Tile data assets pré-extraits :
 *   - `/decomp/em/battle_interface/healthbox_singles_player.png`   (64×128)
 *   - `/decomp/em/battle_interface/healthbox_singles_opponent.png` (128×32)
 *   - `/decomp/em/battle_interface/hpbar.png`                      (96×8)
 *   - `/decomp/em/battle_interface/ball_status_bar.png`            (palette HEALTHBOX)
 *   - `/decomp/em/battle_interface/ball_display.png`               (palette HEALTHBAR)
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c:869-951`
 *     `CreateBattlerHealthboxSprites`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c:1072-1103`
 *     `InitBattlerHealthboxCoords` → positions player (158, 88) / opp (44, 30)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_gfx_sfx_util.c:45-84`
 *     `sSpriteSheet_SinglesPlayerHealthbox` + sSpriteSheets_HealthBar + palettes
 *   - `D:/Projet 1/decomps/pokeemeraude/src/graphics.c:628-629`
 *     `gHealthboxSinglesPlayerGfx` `-mwidth 8 -mheight 8`
 *     `gHealthboxSinglesOpponentGfx` `-mwidth 8 -mheight 4`
 *
 * D1 scope (= cette session) : juste les sprites + tile data + visibilité.
 * D2 (HP bar dynamique), D3 (digits Lv/HP), D4 (status icons), D5 (exp bar),
 * D6 (gender symbols) sont des sous-modules suivants.
 */

// (getRuntime / SetSubspriteTables / clearSubspriteTable / FreeSpriteTilesByTag /
//  NamingSubsprite / loadIndexedPngStrict / extractPngPlte / LoadSpritePalette :
//  déjà importés par les sections précédentes du miroir.)
import { loadIndexedPng, loadIndexedPngRawIndices } from '../harness/gba/png-loader';
import { MarkObjTilesAllocated, AllocSpriteTiles, AllocSpriteTileRange, GetSpriteTileStartByTag } from './sprite';
// Pipeline texte→OBJ healthbox (1:1 décomp AddTextPrinterAndCreateWindowOnHealthbox).
// UI modules bas-niveau (une seule direction d'import : battle_interface → ui/*).
import { AddWindow, RemoveWindow, FillWindowPixelBuffer, GetWindowPixelBuffer } from './window';
import { FONT_SMALL, TEXT_SKIP_DRAW, FONT_BOLD, RenderTextHandleBold, encodeStringForFont, getOwCharmap } from './text';
import { AddTextPrinterParameterized4 } from './menu';

/** RGB888 → RGB555 (= GBA palette format). Inline pour ÉVITER l'import de
 *  `./gba/types` qui introduit un cycle de modules (battle-healthbox est importé
 *  tôt via battle-flow → TDZ `BG_SCREEN_SIZE before initialization` au HMR). */
function _rgba8ToRgb15(r: number, g: number, b: number): number {
  return ((r >> 3) & 0x1F) | (((g >> 3) & 0x1F) << 5) | (((b >> 3) & 0x1F) << 10);
}

/** 1:1 décomp macro `RGB(r,g,b)` : composantes 0..31 → u16 RGB555 (= GBA palette).
 *  Utilisé pour `sStatusIconColors` (battle_interface.c:751-757). */
function _rgb555(r: number, g: number, b: number): number {
  return (r & 0x1F) | ((g & 0x1F) << 5) | ((b & 0x1F) << 10);
}

/** Charge un PNG indexed multi-sub-palette en tile data 4bpp avec indices LOCAUX
 *  (= `pltteIdx % 16`). Pattern identique à `_loadBattleTerrainTiles` (battle-bg.ts).
 *
 *  Nécessaire pour `status.png` : 5 status icons (PSN/PRZ/SLP/FRZ/BRN) partagent
 *  la MÊME tile data mais chaque status utilise une sub-palette différente. Le PNG
 *  indexé a une PLTE 80-color (= 5 sub-palettes 16) et les pixels utilisent des
 *  indices globaux (2,3,12 / 28 / 44 / 60 / 76 = même local 12 dans sub-pal 0..4).
 *
 *  1:1 décomp : `status.4bpp` contient des indices LOCAUX 0..15 ; la couleur est
 *  appliquée au runtime via la palette OBJ du sprite healthbox (= paletteBank).
 *  `loadIndexedPngStrict` ne prend que les 16 premières PLTE colors → les pixels
 *  sub-pal 1..4 (439 px) non mappés → transparent (warning + icônes invisibles). */
async function _loadMultiSubPalTiles(url: string): Promise<Uint8Array> {
  // Lecture des indices PNG RAW (= parse IDAT, PAS le canvas). La voie canvas
  // (drawImage → getImageData → reverse-lookup RGB→PLTE) échouait sur status.png :
  // les couleurs des 5 sous-palettes (PSN/PRZ/SLP/FRZ/BRN) entrent en collision RGB
  // ou le canvas resample → indices faux (spread) → icône status rendue avec des
  // couleurs healthbox arbitraires ("BRU bleu", user 2026-05-30). La voie raw
  // préserve l'index réel : status.png utilise raw {2,3,12+16*row} → %16 = {2,3,12}
  // (1:1 `status.4bpp` décomp : index 12 = couleur status remplie par FillPalette).
  const { widthPx, heightPx, indices } = await loadIndexedPngRawIndices(url);
  const widthTiles = widthPx / 8;
  const heightTiles = heightPx / 8;

  const charData = new Uint8Array(widthTiles * heightTiles * 32);
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileBaseOffset = (ty * widthTiles + tx) * 32;
      for (let row = 0; row < 8; row++) {
        for (let pairCol = 0; pairCol < 4; pairCol++) {
          // %16 = index LOCAL dans la sous-palette (= 1:1 décomp .4bpp).
          const px1 = indices[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2)] % 16;
          const px2 = indices[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2 + 1)] % 16;
          charData[tileBaseOffset + row * 4 + pairCol] = (px1 & 0xF) | ((px2 & 0xF) << 4);
        }
      }
    }
  }
  return charData;
}

// ─── Asset paths ────────────────────────────────────────────────────────────

const HEALTHBOX_PLAYER_PNG   = '/decomp/em/battle_interface/healthbox_singles_player.png';
const HEALTHBOX_OPPONENT_PNG = '/decomp/em/battle_interface/healthbox_singles_opponent.png';
const HPBAR_PNG              = '/decomp/em/battle_interface/hpbar.png';
const HPBAR_ANIM_PNG         = '/decomp/em/battle_interface/hpbar_anim.png';   // YELLOW + RED tile sets
const NUMBERS1_PNG           = '/decomp/em/battle_interface/numbers1.png';     // 11 tiles : [blank, 0..9]
const NUMBERS2_PNG           = '/decomp/em/battle_interface/numbers2.png';     // 12 tiles : [0..9, blank, slash/Lv]
const STATUS_PNG             = '/decomp/em/battle_interface/status.png';       // 15 tiles : PSN/PRZ/SLP/FRZ/BRN (3 tiles each)
const MISC_PNG               = '/decomp/em/battle_interface/misc.png';         // 11 tiles : GFX_36..46 ; tile 3 = GFX_39 "blank health window" (= groove cream)
const EXPBAR_PNG             = '/decomp/em/battle_interface/expbar.png';       // 9 tiles : exp bar levels 0..8 pixels filled
// (BALL_STATUS_BAR_PNG / BALL_DISPLAY_PNG : déjà déclarés section party-summary.)
const BALL_CAUGHT_INDICATOR_PNG = '/decomp/em/battle_interface/ball_caught_indicator.png';  // 1 tile = HEALTHBOX_GFX_STATUS_BALL_CAUGHT (idx 111)
const MISC_FRAMEEND_PNG      = '/decomp/em/battle_interface/misc_frameend.png';  // 1 tile = HEALTHBOX_GFX_65 "hp bar frame end"

// ─── VRAM byte offsets (= OBJ VRAM, allocations pour healthbox tile data) ───
//
// #VRAM 1:1 (étape 2c) : ALLOUÉS via le tile allocator OBJ (AllocSpriteTiles),
// exactement comme la décomp (LoadCompressedSpriteSheet → AllocTilesForSpriteSheet
// → AllocSpriteTiles). Fini les offsets EN DUR 0x0000-0x2200 (qui imposaient un
// setReservedSpriteTileCount(272) côté battle-flow + risquaient le chevauchement
// si le combat ré-utilisait la VRAM). Ces `let` sont (re)calculés à CHAQUE combat
// dans ensureHealthboxAssets (= byte offset du 1er tile alloué). TOUS les sites
// lecteurs (tileId = VRAM/32, offsets VRAM+0xNN) marchent INCHANGÉS car ils lisent
// ces variables au runtime (après l'allocation).
//
// Tailles 1:1 décomp (battle_gfx_sfx_util.c:45-78, champ `size` des sprite sheets) :
//   - sSpriteSheet_SinglesPlayerHealthbox   = 0x1000 → 128 tiles
//   - sSpriteSheet_SinglesOpponentHealthbox = 0x1000 → 128 tiles (64 utilisés, 1:1 réserve 128)
//   - sSpriteSheets_HealthBar[player]        = 0x100  → 8 tiles
//   - sSpriteSheets_HealthBar[opponent]      = 0x120  → 9 tiles (la 9e = frame-end, différée)
const HEALTHBOX_PLAYER_TILE_COUNT   = 0x1000 / 32;  // 128
const HEALTHBOX_OPPONENT_TILE_COUNT = 0x1000 / 32;  // 128
const HPBAR_PLAYER_TILE_COUNT       = 0x100 / 32;   // 8
const HPBAR_OPP_TILE_COUNT          = 0x120 / 32;   // 9
// Tags allocateur (= 1:1 TAG_HEALTHBOX_*1_TILE / TAG_HEALTHBAR_*1_TILE décomp).
const TAG_HB_PLAYER    = 'BATTLE_HB_PLAYER';
const TAG_HB_OPP       = 'BATTLE_HB_OPP';
const TAG_HPBAR_PLAYER = 'BATTLE_HPBAR_PLAYER';
const TAG_HPBAR_OPP    = 'BATTLE_HPBAR_OPP';
let HEALTHBOX_PLAYER_VRAM   = 0x0000;  // = AllocSpriteTiles(128) * 32  (recalculé /combat)
let HEALTHBOX_OPPONENT_VRAM = 0x1000;  // = AllocSpriteTiles(128) * 32
// 1:1 décomp : sSpriteSheets_HealthBar[player] alloc 0x100 = 8 tiles. La barre HP
// est UN sprite à sous-sprites (tileOffset 0 & 4) → LEFT = base. *_RIGHT_VRAM (=
// LEFT+0x80, +4 tiles) gardés pour doc/sécurité (plus lus : la table subsprite
// indexe via tileOffset). Update HP bar copie 6 fill tiles à tileNum+2..+7 (1:1).
let HPBAR_PLAYER_LEFT_VRAM   = 0x2000;  // = AllocSpriteTiles(8) * 32
let HPBAR_PLAYER_RIGHT_VRAM  = 0x2080;  // = LEFT + 0x80
let HPBAR_OPP_LEFT_VRAM      = 0x2100;  // = AllocSpriteTiles(9) * 32
let HPBAR_OPP_RIGHT_VRAM     = 0x2180;  // = LEFT + 0x80

// ─── VRAM DOUBLE (step 3/4) : 4 régions box de 0x800 (= 64 tiles) 1:1 décomp ────
// `sSpriteSheets_Doubles{Player,Opponent}Healthbox[2]` (battle_gfx_sfx_util.c:55-64,
// 0x800 chacune, tags PLAYER1/PLAYER2/OPPONENT1/OPPONENT2) + 4 barres (une par
// battler, comme les 4 `sSpriteSheets_HealthBar[gBattlerPositions[i]]`). Position →
// région : PLAYER_LEFT(0)→PLAYER1, PLAYER_RIGHT(2)→PLAYER2, OPPONENT_LEFT(1)→OPP1,
// OPPONENT_RIGHT(3)→OPP2. Allouées par `ensureDoublesHealthboxAssets` (gated
// IsDoubleBattle) — 0 hors double (jamais lues en single). La box double = 64×32
// (PETITE box, PAS le carré 64×64 single) → 0x800 (2 sprites 64×32 = 32+32 tiles).
let HEALTHBOX_DBL_PLAYER1_VRAM = 0;   // battler position 0 (B_POSITION_PLAYER_LEFT)
let HEALTHBOX_DBL_PLAYER2_VRAM = 0;   // battler position 2 (B_POSITION_PLAYER_RIGHT)
let HEALTHBOX_DBL_OPP1_VRAM    = 0;   // battler position 1 (B_POSITION_OPPONENT_LEFT)
let HEALTHBOX_DBL_OPP2_VRAM    = 0;   // battler position 3 (B_POSITION_OPPONENT_RIGHT)
// 4 barres double (indexées par battler 0..3). Barre = 8 tiles (player) / 9 (opp).
const HPBAR_DBL_VRAM: number[] = [0, 0, 0, 0];
// Tags allocateur double (1:1 tags décomp distincts).
const TAG_HB_DBL_PLAYER1 = 'BATTLE_HB_DBL_P1';
const TAG_HB_DBL_PLAYER2 = 'BATTLE_HB_DBL_P2';
const TAG_HB_DBL_OPP1    = 'BATTLE_HB_DBL_O1';
const TAG_HB_DBL_OPP2    = 'BATTLE_HB_DBL_O2';
const TAG_HPBAR_DBL = ['BATTLE_HPBAR_DBL0', 'BATTLE_HPBAR_DBL1', 'BATTLE_HPBAR_DBL2', 'BATTLE_HPBAR_DBL3'];
const HEALTHBOX_DBL_TILE_COUNT = 0x800 / 32;  // 64 tiles
// PNG doubles (128×32 = 16×4 = 64 tiles = 0x800), 1:1 gHealthboxDoubles{Player,Opponent}Gfx.
const HEALTHBOX_DBL_PLAYER_PNG   = '/decomp/em/battle_interface/healthbox_doubles_player.png';
const HEALTHBOX_DBL_OPPONENT_PNG = '/decomp/em/battle_interface/healthbox_doubles_opponent.png';
// HEALTHBOX_GFX_FRAME_END / FRAME_END_BAR doubles (8×8 = 1 tile), consommés par
// UpdateHpTextInHealthboxInDoubles (FRAME_END) et _SwapHpBarsWithHpText (FRAME_END_BAR).
const HEALTHBOX_DBL_FRAMEEND_PNG     = '/decomp/em/battle_interface/healthbox_doubles_frameend.png';
const HEALTHBOX_DBL_FRAMEEND_BAR_PNG = '/decomp/em/battle_interface/healthbox_doubles_frameend_bar.png';
let _hbDblPlayerTiles: Uint8Array | null = null;
let _hbDblOppTiles: Uint8Array | null = null;
let _frameEndDblTile: Uint8Array | null = null;      // HEALTHBOX_GFX_FRAME_END
let _frameEndBarDblTile: Uint8Array | null = null;   // HEALTHBOX_GFX_FRAME_END_BAR

// ─── OBJ palette slots ──────────────────────────────────────────────────────

// 1:1 décomp `sSpritePalettes_HealthBoxHealthBar[]` :
//   - TAG_HEALTHBOX_PAL ← `gBattleInterface_BallStatusBarPal` (= ball_status_bar.png .gbapal)
//   - TAG_HEALTHBAR_PAL ← `gBattleInterface_BallDisplayPal`   (= ball_display.png .gbapal)
// 1:1 décomp tags (battle_interface.h:47-48) : TAG_HEALTHBOX_PAL = TAG_HEALTHBOX_PLAYER1_TILE
// (0xD6FF), TAG_HEALTHBAR_PAL = TAG_HEALTHBAR_PLAYER1_TILE (0xD704).
const TAG_HEALTHBOX_PAL = 0xD6FF;
const TAG_HEALTHBAR_PAL = 0xD704;
// 1:1 décomp `sSpritePalettes_HealthBoxHealthBar` (battle_gfx_sfx_util.c:80) chargé via
// `LoadSpritePalette` (sprite.c:1591) → l'allocateur OBJ alloue+TAGUE un slot DYNAMIQUEMENT
// (sSpritePaletteTags) ET écrit gPlttBufferFaded → flush live par TransferPlttBuffer (= modèle
// BUFFERISÉ décomp, PLUS de live-direct LoadPaletteObj ni de workaround MarkObjPaletteAllocated).
// Le slot est donc dynamique (réservé nativement par le tag → la palette ball ne l'écrase plus,
// 1:1). Ré-alloué chaque combat (FreeAllSpritePalettes clear les tags à l'init → réalloc).
let HEALTHBOX_PALETTE_SLOT = -1;
let HEALTHBAR_PALETTE_SLOT = -1;

// ─── HP bar subsprite tables : 1:1 décomp sHealthBar_Subsprites_* (battle_interface.c:467-531) ─
// Le décomp rend la barre HP comme UN sprite avec une table de sous-sprites :
// chaque pièce devient une entrée OAM à `sprite.x + sub.x`, `sprite.y + sub.y`,
// SANS center-to-corner (cf. AddSubspritesToOamBuffer : baseX = oam.x - ctcvX =
// sprite.x). Conséquence : le TOP des pièces est à sprite.y (=88), et non
// sprite.y-4 comme un sprite 32×8 normal via ctcv → c'était le résidu de 4px
// "barre trop haute". `tileOffset` indexe dans la région VRAM barre (= tileBase
// du sprite) : pièce 0 = tiles 0..3 (label "PV" + 2 fill), pièce 1 = tiles 4..7.
const HEALTHBAR_SUBSPRITES_PLAYER: readonly NamingSubsprite[] = [
  { x: -16, y: 0, shape: 1, size: 1, tileOffset: 0, priority: 1 },  // 32×8 ; décomp .x=DISPLAY_WIDTH→s8 -16
  { x: 16, y: 0, shape: 1, size: 1, tileOffset: 4, priority: 1 },   // 32×8 ; décomp .x=16
];
// 1:1 décomp sHealthBar_Subsprites_Opponent (battle_interface.c:491-517) = 2×32×8
// + 1×8×8 à x = DISPLAY_WIDTH-16 → s8 = -32, tileOffset 8. La 3e pièce = le SLOT
// BALL "owned" : tile 8 de la région HPBAR_OPP, transparente (zéros) par défaut,
// écrite/effacée par TryAddPokeballIconToHealthbox → drawBallCaughtIndicator.
const HEALTHBAR_SUBSPRITES_OPPONENT: readonly NamingSubsprite[] = [
  { x: -16, y: 0, shape: 1, size: 1, tileOffset: 0, priority: 1 },
  { x: 16, y: 0, shape: 1, size: 1, tileOffset: 4, priority: 1 },
  { x: -32, y: 0, shape: 0, size: 0, tileOffset: 8, priority: 1 },  // slot ball (8×8)
];

// ─── Asset loading (idempotent) ─────────────────────────────────────────────

let _assetsLoaded = false;
// #VRAM 1:1 : la base healthbox (tiles boîte + barre vide) ne doit être (re)blittée
// qu'UNE FOIS par cycle d'allocation (= par combat / par reshow), PAS à chaque appel
// per-battler. Sinon la création de la healthbox adverse re-blitte la base du joueur
// PAR-DESSUS son contenu déjà dessiné par UpdateHealthboxAttribute → healthbox joueur
// VIDE après reshow (barre PV/nom/HP n'apparaissent qu'au coup suivant). 1:1 décomp :
// BattleLoadAllHealthBoxesGfx charge le gfx une fois ; CreateBattlerHealthboxSprites
// ne recharge pas. Reset à false à l'(ré)allocation → re-blit frais ce cycle-là.
let _hbBaseBlitted = false;

/** 1:1 décomp `BattleLoadAllHealthBoxesGfx` (battle_gfx_sfx_util.c) — (re)charge les
 *  sheets healthbox = (ré)alloue les 4 régions OBJ VRAM + (ré)upload les tiles.
 *
 *  Appelé par le RESHOW (reshow_battle_screen.c case 6), AVANT la (re)création des
 *  sprites mon (cases 7-14). C'est essentiel : la case 3 (ResetSpriteData) a vidé le
 *  bitmap d'alloc OBJ VRAM (sSpriteTileAllocBitmap + sSpriteTileRanges + les TAGS).
 *  Si on NE ré-alloue PAS le gfx healthbox ici, les sprites mon prennent les tiles
 *  bas (0..127) via AllocSpriteTiles → collision (= "blocs orange" après un switch /
 *  retour de party screen, root cause #8). En ré-allouant le healthbox D'ABORD
 *  (comme le décomp), il reprend les tiles bas et les mons s'allouent APRÈS.
 *
 *  La ré-allocation est automatique : le ResetSpriteData de la case 3 a purgé
 *  sSpriteTileRangeTags → l'ensure* voit le tag absent → ré-alloue + re-blitte la base
 *  (même critère qu'un boot de combat).
 *
 *  1:1 décomp : `BattleLoadAllHealthBoxesGfx` (bgsu.c:763-820) DISPATCHE single/double via
 *  IsDoubleBattle() — single (:774-798) = 2 grandes régions 0x1000, double (:800-820) =
 *  4 régions 0x800. On reproduit ce dispatch : sinon un reshow en double n'allouerait
 *  AUCUNE région (ensureHealthboxAssets self-gate IsDoubleBattle) → mons sur tiles bas. */
export async function BattleLoadAllHealthBoxesGfx(): Promise<void> {
  if (IsDoubleBattle()) await ensureDoublesHealthboxAssets();
  else await ensureHealthboxAssets();
}

// Cache des 2 palettes OBJ healthbox (vues 16-color). Ré-appliquées à CHAQUE
// combat même sur cache hit (cf. ensureHealthboxAssets) : en vrai flow OW→combat,
// OBJ pal HEALTHBOX/HEALTHBAR sont effacées (battle-init/transition) → healthbox noir.
let _hbPalette: Uint16Array | null = null;
let _hbarPalette: Uint16Array | null = null;
// Cache des tiles box healthbox (player/opp). Re-blittées à CHAQUE combat (cf.
// ensureHealthboxAssets cache-hit) : le battle-init wipe la VRAM + l'allocateur
// OBJ se reset au restore du champ entre combats → la région VRAM healthbox est
// écrasée par les tiles NPC → healthbox CORROMPUE dès le 2e combat consécutif
// (user-flag 2026-05-29 : "healthbox garbled combat 2+"). Cache hit ré-applique
// palette + re-blit ces tiles pour restaurer la région.
let _hbPlayerTiles: Uint8Array | null = null;
let _hbOppTiles: Uint8Array | null = null;

// 1:1 décomp `gHealthboxElementsGfxTable[]` (graphics.c:358-370) cache pour les
// 3 tiers de couleur HP bar. Chaque tier = 9 tiles (= 0..8 pixels remplis).
// Lus par updateHealthboxHpBar pour copier le bon tile dans OBJ VRAM dynamiquement.
// (TILE_BYTES : déjà déclaré section party-summary.)
let _hpBarTilesGreen:  Uint8Array | null = null;  // 9 tiles (= 288 bytes)
let _hpBarTilesYellow: Uint8Array | null = null;  // 9 tiles
let _hpBarTilesRed:    Uint8Array | null = null;  // 9 tiles
let _hpBarBaseTiles:   Uint8Array | null = null;  // 3 tiles = "blank/H/P" frame tiles 0..2 hpbar.png

// 1:1 décomp `numbers1.4bpp` (= player digits) + `numbers2.4bpp` (= opp digits).
// Tile layouts (= empirical inspection) :
//   - numbers1.png : tile 0 = blank, tiles 1..10 = digits 0..9
//   - numbers2.png : tiles 0..9 = digits 0..9, tile 10 = blank, tile 11 = "Lv" prefix or slash
let _numbers1Tiles: Uint8Array | null = null;
let _numbers2Tiles: Uint8Array | null = null;

// 1:1 décomp `status.4bpp` (= player single status icons) : 15 tiles arranged
// as 5 status types × 3 tiles each. Tile offsets dans le PNG :
//   - PSN : tiles 0..2
//   - PRZ : tiles 3..5
//   - SLP : tiles 6..8
//   - FRZ : tiles 9..11
//   - BRN : tiles 12..14
// For opp single nous utilisons status.png aussi (= les tile data sont identiques,
// la palette utilisée change la couleur d'affichage).
let _statusTiles: Uint8Array | null = null;

// 1:1 décomp `misc.4bpp` (= gHealthboxElementsGfxTable GFX_36..46). On cache le
// bloc entier ; le tile 3 (= HEALTHBOX_GFX_39 "blank health window") est le fond
// du groove (= tout index 2 = cream) que UpdateStatusIconInHealthbox recopie sur
// l'emplacement de l'icône status quand il n'y a PAS de status (= efface l'icône
// précédente SANS laisser un trou transparent qui laisserait voir le BG combat).
let _miscTiles: Uint8Array | null = null;

// 1:1 décomp `expbar.4bpp` : 9 tiles avec 9 niveaux "0..8 pixels remplis".
// Player single only (= opp single n'affiche pas d'exp bar).
let _expBarTiles: Uint8Array | null = null;
let _ballCaughtTiles: Uint8Array | null = null;  // 1 tile (= pokéball "owned", HEALTHBOX_GFX_STATUS_BALL_CAUGHT)
let _frameEndTile: Uint8Array | null = null;     // 1 tile (= HEALTHBOX_GFX_65 "hp bar frame end")

/** Re-arrange row-major tile data en metatile order.
 *
 *  Le décomp `-mwidth W -mheight H` réorganise le PNG en metatiles WxH (chacun
 *  W*H tiles). Notre `loadIndexedPng` retourne le tile data en row-major
 *  pixel-order. Pour les PNG dont `metaW * cols_metatiles == widthTiles`,
 *  les deux ordres coïncident. Sinon (e.g. opponent PNG 128×32 avec metatile
 *  8×4 = 2 metatiles horizontaux), il faut transposer.
 *
 *  PNG  : layout row-major par tile, dim = widthTiles × heightTiles
 *  Out  : metatiles séquentiels, chacun en row-major interne (= GBA OBJ VRAM
 *         layout attendu par OAM avec tileNum offset par metatile).
 */
function _rearrangeToMetatileOrder(
  charData: Uint8Array,
  widthTiles: number,
  heightTiles: number,
  metaW: number,
  metaH: number,
): Uint8Array {
  const TILE_BYTES = 32;
  if (widthTiles % metaW !== 0 || heightTiles % metaH !== 0) {
    throw new Error(`metatile dims mismatch: png ${widthTiles}×${heightTiles}, meta ${metaW}×${metaH}`);
  }
  // Si metaW === widthTiles → metatile order == row-major order, no-op.
  if (metaW === widthTiles) return charData;
  const totalTiles = widthTiles * heightTiles;
  const out = new Uint8Array(totalTiles * TILE_BYTES);
  const metaCols = widthTiles / metaW;
  const metaRows = heightTiles / metaH;
  let outIdx = 0;
  for (let mr = 0; mr < metaRows; mr++) {
    for (let mc = 0; mc < metaCols; mc++) {
      for (let r = 0; r < metaH; r++) {
        for (let c = 0; c < metaW; c++) {
          const srcTileIdx = (mr * metaH + r) * widthTiles + (mc * metaW + c);
          out.set(
            charData.subarray(srcTileIdx * TILE_BYTES, (srcTileIdx + 1) * TILE_BYTES),
            outIdx * TILE_BYTES,
          );
          outIdx++;
        }
      }
    }
  }
  return out;
}

/** (A) COMMUN single & double : fetch + conversion des PNG healthbox en caches module
 *  + chargement des 2 palettes OBJ (HEALTHBOX/HEALTHBAR). Idempotent (`_assetsLoaded`).
 *
 *  1:1 : les sprite sheets ET les palettes sont les MÊMES données en single et double ;
 *  SEULE l'ALLOCATION OBJ VRAM diffère (2 grandes régions 0x1000 single vs 4 petites
 *  0x800 doubles, cf. `BattleLoadAllHealthBoxesGfxAtOnce` if/else, battle_gfx_sfx_util.c:745).
 *  Cette fonction NE touche donc PAS la VRAM → réutilisable par `ensureDoublesHealthboxAssets`
 *  SANS réserver les ~273 tiles single inutiles en double (= root cause de l'OBJ VRAM saturé).
 *
 *  Cache-hit : ré-applique juste les PALETTES (les banks OBJ peuvent être effacées entre
 *  scènes) ; c'est l'appelant (single/double) qui (re)blitte SA région VRAM selon son alloc. */
async function _ensureHealthboxSharedAssets(): Promise<void> {
  if (!getRuntime()) return;

  if (_assetsLoaded) {
    if (_hbPalette) HEALTHBOX_PALETTE_SLOT = LoadSpritePalette({ data: _hbPalette, tag: TAG_HEALTHBOX_PAL });
    if (_hbarPalette) HEALTHBAR_PALETTE_SLOT = LoadSpritePalette({ data: _hbarPalette, tag: TAG_HEALTHBAR_PAL });
    return;
  }

  // ─── Player healthbox tile data ─────────────────────────────────────────
  // PNG 64×128 = 8w × 16t tiles. `-mwidth 8 -mheight 8` → 2 metatiles 8×8.
  // Comme metaW (8) === widthTiles (8), row-major == metatile order, no-op.
  // CRITIQUE : `loadIndexedPngStrict` lit la PLTE PNG (palette canonique partagée
  // avec ball_status_bar.png) ; `loadIndexedPng` reconstruirait via canvas → mismatch.
  const playerPng = await loadIndexedPngStrict(HEALTHBOX_PLAYER_PNG, 4);
  _hbPlayerTiles = _rearrangeToMetatileOrder(
    playerPng.charData, playerPng.widthTiles, playerPng.heightTiles, 8, 8,
  );

  // ─── Opponent healthbox tile data ───────────────────────────────────────
  // PNG 128×32 = 16w × 4t tiles. `-mwidth 8 -mheight 4` → 2 metatiles 8×4 (transposer).
  const oppPng = await loadIndexedPngStrict(HEALTHBOX_OPPONENT_PNG, 4);
  _hbOppTiles = _rearrangeToMetatileOrder(
    oppPng.charData, oppPng.widthTiles, oppPng.heightTiles, 8, 4,
  );

  // ─── HP bar widget tile data ────────────────────────────────────────────
  // 1:1 décomp `gHealthboxElementsGfxTable[]` (graphics.c:358) : sous-blocs cachés :
  //   - hpbar.png tiles 0..2     = "black bg" + "H" + "P" labels (= 3 tiles)
  //   - hpbar.png tiles 3..11    = GREEN bar 0..8 pixels remplis (= 9 tiles)
  //   - hpbar_anim.png tiles 0..8 = YELLOW bar 0..8 pixels (= 9 tiles)
  //   - hpbar_anim.png tiles 9..17 = RED bar 0..8 pixels (= 9 tiles)
  const hpbarPng = await loadIndexedPngStrict(HPBAR_PNG, 4);
  const hpbarAnimPng = await loadIndexedPngStrict(HPBAR_ANIM_PNG, 4);
  _hpBarBaseTiles  = hpbarPng.charData.subarray(0, 3 * TILE_BYTES);              // tiles 0..2
  _hpBarTilesGreen = hpbarPng.charData.subarray(3 * TILE_BYTES, 12 * TILE_BYTES); // tiles 3..11
  _hpBarTilesYellow = hpbarAnimPng.charData.subarray(0, 9 * TILE_BYTES);          // tiles 0..8
  _hpBarTilesRed    = hpbarAnimPng.charData.subarray(9 * TILE_BYTES, 18 * TILE_BYTES); // tiles 9..17

  // ─── Numbers tile sets (= digits 0..9 pour Lv + HP display) ─────────────
  // 1:1 graphics_file_rules.mk:90-91 : numbers1.4bpp (player) / numbers2.4bpp (opp).
  // PNG mode "L" (grayscale) sans PLTE → `loadIndexedPng` (reconstruct depuis pixels).
  const numbers1Png = await loadIndexedPng(NUMBERS1_PNG);
  const numbers2Png = await loadIndexedPng(NUMBERS2_PNG);
  _numbers1Tiles = numbers1Png.charData;  // 11 tiles
  _numbers2Tiles = numbers2Png.charData;  // 12 tiles

  // ─── Status icons tile data ─────────────────────────────────────────────
  // 1:1 `status.4bpp` (24×40 = 15 tiles : 5 status × 3). Multi-sub-palette (PLTE
  // 80-color, 5 sub-pal) → lire avec indices LOCAUX `% 16` via _loadMultiSubPalTiles.
  _statusTiles = await _loadMultiSubPalTiles(STATUS_PNG);

  // ─── misc tile data (= GFX_36..46) ──────────────────────────────────────
  // 1:1 `misc.4bpp` (88×8 = 11 tiles). Tile 3 (= HEALTHBOX_GFX_39) = fond "no status"
  // recopié par UpdateStatusIconInHealthbox quand pas de status.
  const miscPng = await loadIndexedPngStrict(MISC_PNG, 4);
  _miscTiles = miscPng.charData;

  // ─── EXP bar tile data ──────────────────────────────────────────────────
  // 1:1 `expbar.4bpp` 72×8 = 9 tiles avec progressive fill 0..8 pixels.
  const expbarPng = await loadIndexedPngStrict(EXPBAR_PNG, 4);
  _expBarTiles = expbarPng.charData;

  // ─── Ball "caught" indicator + frame end ────────────────────────────────
  // 1:1 `HEALTHBOX_GFX_STATUS_BALL_CAUGHT` (1 tile) + HEALTHBOX_GFX_65 "hp bar frame end".
  const ballCaughtPng = await loadIndexedPngStrict(BALL_CAUGHT_INDICATOR_PNG, 4);
  _ballCaughtTiles = ballCaughtPng.charData;
  const frameEndPng = await loadIndexedPngStrict(MISC_FRAMEEND_PNG, 4);
  _frameEndTile = frameEndPng.charData;

  // ─── Palettes ───────────────────────────────────────────────────────────
  // CRITIQUE : `extractPngPlte` lit la PLTE PNG raw (16 colors, ordre canonique),
  // comme le décomp `INCGFX_U16("ball_status_bar.png", ".gbapal")`.
  const ballStatusBarPlte = await extractPngPlte(BALL_STATUS_BAR_PNG);
  if (!ballStatusBarPlte) throw new Error(`PLTE missing: ${BALL_STATUS_BAR_PNG}`);
  _hbPalette = ballStatusBarPlte.subarray(0, 16);
  HEALTHBOX_PALETTE_SLOT = LoadSpritePalette({ data: _hbPalette, tag: TAG_HEALTHBOX_PAL });

  const ballDisplayPlte = await extractPngPlte(BALL_DISPLAY_PNG);
  if (!ballDisplayPlte) throw new Error(`PLTE missing: ${BALL_DISPLAY_PNG}`);
  _hbarPalette = ballDisplayPlte.subarray(0, 16);
  HEALTHBAR_PALETTE_SLOT = LoadSpritePalette({ data: _hbarPalette, tag: TAG_HEALTHBAR_PAL });

  _assetsLoaded = true;
}

/** Charge tous les assets healthbox + alloue/blitte la VRAM OBJ **SINGLE**. 1:1 décomp
 *  `BattleLoadAllHealthBoxesGfxAtOnce` (battle_gfx_sfx_util.c:738) branche `!IsDoubleBattle()`
 *  (:745-749) : 2 grandes régions 0x1000 (player/opp box) + 2 barres. Idempotent, appelé
 *  per-battler en single (createBattlerHealthboxSprites) + reshow single.
 *
 *  Mappings 1:1 décomp :
 *    - sSpriteSheet_SinglesPlayerHealthbox = (…, 0x1000, TAG_HEALTHBOX_PLAYER1_TILE)
 *    - sSpriteSheet_SinglesOpponentHealthbox = (…, 0x1000, TAG_HEALTHBOX_OPPONENT1_TILE)
 *    - sSpriteSheets_HealthBar[0] = (…, 0x100, TAG_HEALTHBAR_PLAYER1_TILE)
 *    - sSpriteSheets_HealthBar[1] = (…, 0x120, TAG_HEALTHBAR_OPPONENT1_TILE)
 *    - sSpritePalettes_HealthBoxHealthBar = palettes HEALTHBOX + HEALTHBAR */
export async function ensureHealthboxAssets(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;

  // (A) Chargement COMMUN (caches tuiles + palettes), partagé single & double.
  await _ensureHealthboxSharedAssets();

  // (B) GATE STRICT 1:1 `BattleLoadAllHealthBoxesGfxAtOnce` (:745) : les sheets healthbox
  //     SINGLE (0x1000×2 + 2 barres) ne sont alloués/blittés QUE hors double. En double
  //     c'est la branche `else` (:751) — 4 régions 0x800 — via `ensureDoublesHealthboxAssets`.
  //     Sans ce gate on allouait AUSSI les ~273 tiles single, inutilisées en double →
  //     OBJ VRAM saturé, les 4 sprites mon (256 tiles) ne trouvaient plus de place → mons
  //     ennemis non spawnés (AllocSpriteTiles échoué depuis _loadAndCreateBattlerMonSprite,
  //     bug launchTB(51)). En single, IsDoubleBattle()===false → tout ce qui suit s'exécute
  //     exactement comme avant (comportement single INCHANGÉ).
  if (IsDoubleBattle()) return;

  // ─── Allocation VRAM healthbox SINGLE (1× PAR COMBAT) ───────────────────
  // 1:1 décomp : LoadCompressedSpriteSheet → le tile allocator OBJ (AllocSpriteTiles).
  // Ordre décomp (battle_gfx_sfx_util.c:747-760) : player box → opp box →
  // HealthBar[player] → HealthBar[opp].
  // Critère « déjà alloué ce cycle » 1:1 décomp : l'état de l'ALLOCATEUR PAR TAG
  // (= GetSpriteTileStartByTag). ResetSpriteData (boot combat CB2_InitBattleInternal,
  // reshow case 3, swap de scène) purge sSpriteTileRangeTags → le tag disparaît →
  // on (ré)alloue + re-blitte, exactement comme la ROM où BattleLoadAllHealthBoxesGfx
  // recharge les sheets parce que leur tag n'existe plus. L'appel #2 per-battler du
  // même cycle voit le tag présent → réutilise les mêmes offsets. (Un flag privé
  // module-level survivrait au swap de scène → combat 2 jamais re-blitté = bouillie.)
  if (GetSpriteTileStartByTag(TAG_HB_PLAYER) === 0xFFFF) {
    const hbPlayerStart = AllocSpriteTiles(HEALTHBOX_PLAYER_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_PLAYER, hbPlayerStart, HEALTHBOX_PLAYER_TILE_COUNT);
    HEALTHBOX_PLAYER_VRAM = hbPlayerStart * TILE_BYTES;

    const hbOppStart = AllocSpriteTiles(HEALTHBOX_OPPONENT_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_OPP, hbOppStart, HEALTHBOX_OPPONENT_TILE_COUNT);
    HEALTHBOX_OPPONENT_VRAM = hbOppStart * TILE_BYTES;

    const hpbarPlayerStart = AllocSpriteTiles(HPBAR_PLAYER_TILE_COUNT);
    AllocSpriteTileRange(TAG_HPBAR_PLAYER, hpbarPlayerStart, HPBAR_PLAYER_TILE_COUNT);
    HPBAR_PLAYER_LEFT_VRAM  = hpbarPlayerStart * TILE_BYTES;
    HPBAR_PLAYER_RIGHT_VRAM = HPBAR_PLAYER_LEFT_VRAM + 0x80;

    const hpbarOppStart = AllocSpriteTiles(HPBAR_OPP_TILE_COUNT);
    AllocSpriteTileRange(TAG_HPBAR_OPP, hpbarOppStart, HPBAR_OPP_TILE_COUNT);
    HPBAR_OPP_LEFT_VRAM  = hpbarOppStart * TILE_BYTES;
    HPBAR_OPP_RIGHT_VRAM = HPBAR_OPP_LEFT_VRAM + 0x80;

    _hbBaseBlitted = false;   // nouvelle alloc → la base doit être (re)blittée ce cycle
  }

  // ─── Blit base SINGLE 1× par cycle d'allocation (depuis les caches partagés) ──
  // La VRAM OBJ NE SURVIT PAS entre combats (battle-init wipe + allocateur OBJ reset)
  // → on re-blitte à CHAQUE (ré)allocation, MAIS PAS à chaque appel per-battler (sinon la
  // base joueur écrase le contenu nom/HP/barre déjà dessiné par UpdateHealthboxAttribute
  // du battler précédent → healthbox VIDE après reshow). 1× par cycle via `_hbBaseBlitted`,
  // 1:1 décomp (BattleLoadAllHealthBoxesGfx une fois, pas par sprite créé). Les tiles
  // proviennent des caches partagés remplis par _ensureHealthboxSharedAssets ci-dessus.
  if (!_hbBaseBlitted) {
    if (_hbPlayerTiles) {
      rt.gba.objVram.set(_hbPlayerTiles, HEALTHBOX_PLAYER_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_PLAYER_VRAM, _hbPlayerTiles.length);
    }
    if (_hbOppTiles) {
      rt.gba.objVram.set(_hbOppTiles, HEALTHBOX_OPPONENT_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_OPPONENT_VRAM, _hbOppTiles.length);
    }
    if (_hpBarTilesGreen && _hpBarBaseTiles) {
      const fullGreen = _hpBarTilesGreen.subarray(8 * TILE_BYTES, 9 * TILE_BYTES);
      for (let i = 2; i < 8; i++) {
        rt.gba.objVram.set(fullGreen, HPBAR_PLAYER_LEFT_VRAM + i * TILE_BYTES);
        rt.gba.objVram.set(fullGreen, HPBAR_OPP_LEFT_VRAM + i * TILE_BYTES);
      }
      rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), HPBAR_PLAYER_LEFT_VRAM);
      rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), HPBAR_OPP_LEFT_VRAM);
      // Tile 8 opp = slot ball "owned" (3e subsprite) : RE-ZÉROTER à chaque re-blit —
      // 1:1 décomp : le sheet healthbar opp (0x120 = 9 tiles) est rechargé ENTIER au
      // reshow, sa 9e tile est transparente. Sans ça : le party screen (scene swap)
      // réutilise cette VRAM pour les icônes mons → au retour, si le mon adverse n'est
      // pas capturé, TryAddPokeballIconToHealthbox early-return SANS écrire → fragment
      // d'icône (triangle orange) rendu au slot status (A/B user 2026-06-09).
      rt.gba.objVram.fill(0, HPBAR_OPP_LEFT_VRAM + 8 * TILE_BYTES, HPBAR_OPP_LEFT_VRAM + 9 * TILE_BYTES);
      MarkObjTilesAllocated(HPBAR_PLAYER_LEFT_VRAM, 8 * TILE_BYTES);
      MarkObjTilesAllocated(HPBAR_OPP_LEFT_VRAM, 9 * TILE_BYTES);
    }
    _hbBaseBlitted = true;
  }
}

/** Pour test/devtools : reset le cache (= force re-load). */
export function resetHealthboxAssetsCache(): void {
  _assetsLoaded = false;
}

// ─── Healthbox handle (= spriteIds des 3 sprites) ───────────────────────────

export interface HealthboxHandle {
  /** Sprite ID `healthboxLeftSpriteId` (= 64×64 SQUARE player, 64×32 WIDE opp). */
  leftSpriteId: number;
  /** Sprite ID `healthboxRightSpriteId` (= 64×64 SQUARE player, 64×32 WIDE opp). */
  rightSpriteId: number;
  /** Sprite ID du `healthbarSprite` = UN sprite à sous-sprites (1:1 décomp
   *  `sHealthBar_SubspriteTables`). Les pièces (2 joueur / 2 adverse) sont des
   *  child OAM gérés par `SetSubspriteTables` (positionnés sans ctcv). */
  healthbarSpriteId: number;
  /** Quel side : 'player' / 'opponent'. */
  side: 'player' | 'opponent';
  /** Position center du sprite left (= UpdateSpritePos `sprite.x`, `sprite.y`).
   *  Player : (158, 88). Opp : (44, 30). */
  centerX: number;
  centerY: number;
  /** Base OBJ VRAM (byte) de la box LEFT = 1:1 décomp `gSprites[healthboxSpriteId].oam.tileNum
   *  * TILE_SIZE_4BPP`. Les fns d'update écrivent à `baseVram + offset` (au lieu d'une
   *  constante side-keyée) → VRAM PAR POSITION (step 3). Single : player = HEALTHBOX_PLAYER_VRAM,
   *  opp = HEALTHBOX_OPPONENT_VRAM (prouvé inchangé) ; double : région PLAYER1/2 / OPP1/2. */
  baseVram: number;
  /** Base OBJ VRAM (byte) du sprite BARRE = 1:1 `gSprites[healthBarSpriteId].oam.tileNum
   *  * TILE_SIZE_4BPP`. Single : HPBAR_PLAYER_LEFT_VRAM / HPBAR_OPP_LEFT_VRAM. */
  barBaseVram: number;
}

// ─── Sprite creation 1:1 décomp ─────────────────────────────────────────────

/** 1:1 décomp `CreateBattlerHealthboxSprites` (battle_interface.c:869-951)
 *  pour single battle. Retourne handle avec 3 spriteIds.
 *
 *  Position défaut = `InitBattlerHealthboxCoords` (battle_interface.c:1072-1103) :
 *    - Player single : (158, 88)
 *    - Opponent single : (44, 30) */
export async function createBattlerHealthboxSprites(
  side: 'player' | 'opponent',
  battler?: number,
): Promise<HealthboxHandle | null> {
  // 1:1 décomp CreateBattlerHealthboxSprites (battle_interface.c:902-930) : en DOUBLE,
  // la box est créée avec le template[GetBattlerPosition/2] SANS l'override SQUARE (reste
  // 64×32 = la PETITE box) et right.tileNum += 32 (vs 64 single). Branche dédiée (gated
  // IsDoubleBattle → single INCHANGÉ, dispatch no-op en single).
  if (battler !== undefined && IsDoubleBattle()) {
    return _createDoublesHealthboxSprites(side, battler);
  }
  await ensureHealthboxAssets();
  const rt = getRuntime();
  if (!rt) return null;

  // 1:1 décomp CreateBattlerHealthboxSprites (battle_interface.c:880-886) : le
  // player healthbox est créé avec le template WIDE (`sOamData_64x32`), donc
  // `CalcCenterToCornerVec` calcule ctcv pour 64×32 = (-32, -16). PUIS le décomp
  // force `gSprites[id].oam.shape = ST_OAM_SQUARE` (→ 64×64) SANS recalculer le
  // ctcv (sprite.c ne recompute PAS le ctcv sur un set direct de oam.shape).
  // Donc le sprite s'affiche en 64×64 mais reste positionné avec ctcvY = -16.
  // CRITIQUE : créer directement en SQUARE donnerait ctcvY = -32 → box 16px trop
  // haute (= bug user 2026-05-29 "barres de vie décalées" : box recess 12px au-
  // dessus de la barre). Ce helper reproduit l'override 1:1.
  const forceSquareKeepWideCtcv = (h: { spriteId: number; oamIndex: number }): void => {
    const oam = rt.gba.oam[h.oamIndex];
    if (oam) oam.shape = 0;  // ST_OAM_SQUARE (64×64 render), size reste 3
    const sp = rt.gSprites[h.spriteId];
    if (sp) sp.shape = 0;    // garde centerToCornerVec calculé pour WIDE
  };

  if (side === 'player') {
    // 1:1 décomp ll. 880-887 player single :
    //   left  = CreateSprite(template WIDE sOamData_64x32, …, priority=1)
    //   right = CreateSpriteAtEnd(template WIDE, …, priority=1)
    //   left.oam.shape  = ST_OAM_SQUARE  (override sans recalc ctcv)
    //   right.oam.shape = ST_OAM_SQUARE
    //   right.tileNum  += 64
    // Position décomp (240,160) puis UpdateSpritePos → (158, 88) ; on crée direct.
    const centerX = 158;
    const centerY = 88;
    const left = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_PLAYER_VRAM / 32,
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      x: centerX, y: centerY,
      shape: 1,  // WIDE (= template sOamData_64x32) → ctcv (-32, -16)
      size: 3,   // 64×32
      priority: 1,
      subpriority: 1,   // 1:1 décomp box = CreateSprite(...,1) ; barre (subpri 0) passe DEVANT
    });
    forceSquareKeepWideCtcv(left);  // → render 64×64, ctcvY conservé à -16
    const right = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_PLAYER_VRAM / 32 + 64,  // tileNum += 64 (= second 64x64 metatile)
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      // `SpriteCB_HealthBoxOther` → sprite.x = leftSprite.x + 64.
      x: centerX + 64, y: centerY,
      shape: 1, size: 3,  // WIDE → ctcv (-32, -16)
      priority: 1,
      subpriority: 1,
    });
    forceSquareKeepWideCtcv(right);
    // 1:1 décomp ll. 932-947 + `sHealthBar_SubspriteTables[B_SIDE_PLAYER]` : la
    // barre HP = UN sprite (`healthbarSprite`) avec table de sous-sprites (2 pièces
    // 32×8). SpriteCB_HealthBar player (data6=0) → sprite.x = healthbox.x + 16.
    // Les pièces sont posées à sprite.x+sub.x, sprite.y+sub.y SANS ctcv → top à
    // sprite.y=88 (et non 84). `tileBase` = région VRAM barre ; les pièces lisent
    // tileBase+tileOffset, et le fill (updateHealthboxHpBar) écrit dans cette
    // même région (tiles 2..7).
    const bar = rt.CreateSpriteAtOam({
      tileId: HPBAR_PLAYER_LEFT_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 16, y: centerY,
      shape: 1, size: 1,  // primary oam (caché en mode subsprite)
      priority: 1,
      subpriority: 0,   // 1:1 décomp bar = CreateSpriteAtEnd(...,0) → DEVANT la boîte (subpri 1)
    });
    const barSp = rt.gSprites[bar.spriteId];
    if (barSp) barSp.tileBase = HPBAR_PLAYER_LEFT_VRAM / 32;
    SetSubspriteTables(bar.spriteId, HEALTHBAR_SUBSPRITES_PLAYER);
    return {
      leftSpriteId: left.spriteId,
      rightSpriteId: right.spriteId,
      healthbarSpriteId: bar.spriteId,
      side: 'player',
      centerX, centerY,
      // 1:1 : la box left est créée avec tileId = HEALTHBOX_PLAYER_VRAM/32 → baseVram
      // == HEALTHBOX_PLAYER_VRAM (= la valeur side-keyée single AVANT step 3, INCHANGÉE).
      baseVram: HEALTHBOX_PLAYER_VRAM,
      barBaseVram: HPBAR_PLAYER_LEFT_VRAM,
    };
  } else {
    // 1:1 décomp ll. 890-896 opponent single :
    //   left  = CreateSprite(template[0], 240, 160, 1)  // WIDE+size3 = 64×32
    //   right = CreateSpriteAtEnd(template[0], 240, 160, 1)
    //   right.tileNum += 32
    //   (no shape override → reste WIDE = 64×32)
    //   data6 = 2 (= utilisé par SpriteCB_HealthBar.x = mainSprite.x + 8)
    const centerX = 44;
    const centerY = 30;
    const left = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_OPPONENT_VRAM / 32,
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      x: centerX, y: centerY,
      shape: 1,  // = WIDE
      size: 3,   // = WIDE+size3 = 64×32
      priority: 1,
      subpriority: 1,   // 1:1 décomp box = CreateSprite(...,1) ; barre (subpri 0) passe DEVANT
    });
    const right = rt.CreateSpriteAtOam({
      tileId: HEALTHBOX_OPPONENT_VRAM / 32 + 32,
      paletteBank: HEALTHBOX_PALETTE_SLOT,
      x: centerX + 64, y: centerY,
      shape: 1, size: 3,
      priority: 1,
      subpriority: 1,
    });
    // 1:1 décomp `sHealthBar_SubspriteTables[B_SIDE_OPPONENT]` : barre = UN sprite
    // à sous-sprites. SpriteCB_HealthBar opp (data6=2) → sprite.x = healthbox.x + 8.
    const bar = rt.CreateSpriteAtOam({
      tileId: HPBAR_OPP_LEFT_VRAM / 32,
      paletteBank: HEALTHBAR_PALETTE_SLOT,
      x: centerX + 8, y: centerY,
      shape: 1, size: 1,
      priority: 1,
      subpriority: 0,   // 1:1 décomp bar = CreateSpriteAtEnd(...,0) → DEVANT la boîte (subpri 1)
    });
    const barSp = rt.gSprites[bar.spriteId];
    if (barSp) barSp.tileBase = HPBAR_OPP_LEFT_VRAM / 32;
    SetSubspriteTables(bar.spriteId, HEALTHBAR_SUBSPRITES_OPPONENT);
    return {
      leftSpriteId: left.spriteId,
      rightSpriteId: right.spriteId,
      healthbarSpriteId: bar.spriteId,
      side: 'opponent',
      centerX, centerY,
      baseVram: HEALTHBOX_OPPONENT_VRAM,   // 1:1 : tileId = HEALTHBOX_OPPONENT_VRAM/32 → INCHANGÉ.
      barBaseVram: HPBAR_OPP_LEFT_VRAM,
    };
  }
}

// ─── DOUBLE : assets + création box 1:1 (step 4) ────────────────────────────

let _dblAssetsLoaded = false;
let _hbDblBaseBlitted = false;

/** 1:1 décomp `BattleLoadAllHealthBoxesGfx` branche DOUBLE (battle_gfx_sfx_util.c:800-820)
 *  + `sSpriteSheets_Doubles*Healthbox`. Alloue les 4 régions box (PLAYER1/2/OPP1/2, 0x800)
 *  + 4 barres (une par battler), charge/blitte les gfx doubles + frameend doubles. Réutilise
 *  les caches partagés (status/numbers/misc/hpbar labels) + palettes chargés par
 *  `_ensureHealthboxSharedAssets` (PLTE identique aux singles). GATED : appelé uniquement
 *  par la branche double de createBattlerHealthboxSprites → 0 impact single.
 *  1:1 budget OBJ VRAM : le COMMUN passe par _ensureHealthboxSharedAssets (0 VRAM) → SEULES
 *  les 4 régions doubles (0x800×4 + 4 barres) sont allouées ici ; les ~273 tiles single ne
 *  le sont JAMAIS en double (fix saturation OBJ VRAM, launchTB(51)). */
async function ensureDoublesHealthboxAssets(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  // Caches partagés (status/numbers/misc/hpbar) + palettes HEALTHBOX/HEALTHBAR + slots —
  // COMMUN seul (0 VRAM single). L'alloc double (4×0x800 + barres) suit ci-dessous, 1:1
  // `BattleLoadAllHealthBoxesGfxAtOnce` branche `else` (battle_gfx_sfx_util.c:751-758).
  await _ensureHealthboxSharedAssets();
  // 1:1 décomp : UpdateHealthboxAttribute HEALTH_BAR appelle LoadBattleBarGfx(0) → barFontGfx
  // (font des chiffres PV doubles, consommée par UpdateHpTextInHealthboxInDoubles). On la
  // charge ici (au boot double) pour qu'elle soit prête au 1er rendu. Via le hook global.
  const _mg = (globalThis as { __monSpritesGfx?: { LoadBattleBarGfx?: (u: number) => Promise<void> } }).__monSpritesGfx;
  await _mg?.LoadBattleBarGfx?.(0)?.catch?.((e: unknown) => console.error('[healthbox-dbl] LoadBattleBarGfx', e));

  // ─── Allocation VRAM double (1× par combat, critère = tag absent, 1:1 single). ──
  if (GetSpriteTileStartByTag(TAG_HB_DBL_PLAYER1) === 0xFFFF) {
    const p1 = AllocSpriteTiles(HEALTHBOX_DBL_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_DBL_PLAYER1, p1, HEALTHBOX_DBL_TILE_COUNT);
    HEALTHBOX_DBL_PLAYER1_VRAM = p1 * TILE_BYTES;
    const p2 = AllocSpriteTiles(HEALTHBOX_DBL_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_DBL_PLAYER2, p2, HEALTHBOX_DBL_TILE_COUNT);
    HEALTHBOX_DBL_PLAYER2_VRAM = p2 * TILE_BYTES;
    const o1 = AllocSpriteTiles(HEALTHBOX_DBL_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_DBL_OPP1, o1, HEALTHBOX_DBL_TILE_COUNT);
    HEALTHBOX_DBL_OPP1_VRAM = o1 * TILE_BYTES;
    const o2 = AllocSpriteTiles(HEALTHBOX_DBL_TILE_COUNT);
    AllocSpriteTileRange(TAG_HB_DBL_OPP2, o2, HEALTHBOX_DBL_TILE_COUNT);
    HEALTHBOX_DBL_OPP2_VRAM = o2 * TILE_BYTES;
    // 4 barres double : 1:1 `sSpriteSheets_HealthBar[gBattlerPositions[i]]` (player 8, opp 9).
    for (let b = 0; b < 4; b++) {
      const cnt = (GetBattlerPosition(b) & 1) === 0 ? HPBAR_PLAYER_TILE_COUNT : HPBAR_OPP_TILE_COUNT;
      const s = AllocSpriteTiles(cnt);
      AllocSpriteTileRange(TAG_HPBAR_DBL[b], s, cnt);
      HPBAR_DBL_VRAM[b] = s * TILE_BYTES;
    }
    _hbDblBaseBlitted = false;
  }

  // ─── Chargement PNG doubles (128×32 = 16×4 tiles = 0x800 ; metatile 8×4 comme opp single). ──
  if (!_dblAssetsLoaded) {
    const playerPng = await loadIndexedPngStrict(HEALTHBOX_DBL_PLAYER_PNG, 4);
    _hbDblPlayerTiles = _rearrangeToMetatileOrder(playerPng.charData, playerPng.widthTiles, playerPng.heightTiles, 8, 4);
    const oppPng = await loadIndexedPngStrict(HEALTHBOX_DBL_OPPONENT_PNG, 4);
    _hbDblOppTiles = _rearrangeToMetatileOrder(oppPng.charData, oppPng.widthTiles, oppPng.heightTiles, 8, 4);
    const feEnd = await loadIndexedPngStrict(HEALTHBOX_DBL_FRAMEEND_PNG, 4);
    _frameEndDblTile = feEnd.charData.subarray(0, TILE_BYTES);
    const feBar = await loadIndexedPngStrict(HEALTHBOX_DBL_FRAMEEND_BAR_PNG, 4);
    _frameEndBarDblTile = feBar.charData.subarray(0, TILE_BYTES);
    _dblAssetsLoaded = true;
  }

  // ─── Blit base (box + barres) 1× par cycle d'allocation (comme ensureHealthboxAssets). ──
  if (!_hbDblBaseBlitted) {
    if (_hbDblPlayerTiles) {
      rt.gba.objVram.set(_hbDblPlayerTiles, HEALTHBOX_DBL_PLAYER1_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_DBL_PLAYER1_VRAM, _hbDblPlayerTiles.length);
      rt.gba.objVram.set(_hbDblPlayerTiles, HEALTHBOX_DBL_PLAYER2_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_DBL_PLAYER2_VRAM, _hbDblPlayerTiles.length);
    }
    if (_hbDblOppTiles) {
      rt.gba.objVram.set(_hbDblOppTiles, HEALTHBOX_DBL_OPP1_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_DBL_OPP1_VRAM, _hbDblOppTiles.length);
      rt.gba.objVram.set(_hbDblOppTiles, HEALTHBOX_DBL_OPP2_VRAM);
      MarkObjTilesAllocated(HEALTHBOX_DBL_OPP2_VRAM, _hbDblOppTiles.length);
    }
    if (_hpBarTilesGreen && _hpBarBaseTiles) {
      const fullGreen = _hpBarTilesGreen.subarray(8 * TILE_BYTES, 9 * TILE_BYTES);
      for (let b = 0; b < 4; b++) {
        const base = HPBAR_DBL_VRAM[b] | 0;
        if (!base) continue;
        for (let i = 2; i < 8; i++) rt.gba.objVram.set(fullGreen, base + i * TILE_BYTES);
        rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), base);
        if ((GetBattlerPosition(b) & 1) !== 0)  // opp : 9e tile = slot ball, transparent.
          rt.gba.objVram.fill(0, base + 8 * TILE_BYTES, base + 9 * TILE_BYTES);
        MarkObjTilesAllocated(base, ((GetBattlerPosition(b) & 1) === 0 ? 8 : 9) * TILE_BYTES);
      }
    }
    _hbDblBaseBlitted = true;
  }
}

/** Position → région box double (1:1 map tags PLAYER1/2/OPP1/2, cf. template[pos/2]). */
function _doublesBoxVram(position: number): number {
  switch (position) {
    case 0: return HEALTHBOX_DBL_PLAYER1_VRAM;  // B_POSITION_PLAYER_LEFT
    case 2: return HEALTHBOX_DBL_PLAYER2_VRAM;  // B_POSITION_PLAYER_RIGHT
    case 1: return HEALTHBOX_DBL_OPP1_VRAM;     // B_POSITION_OPPONENT_LEFT
    case 3: return HEALTHBOX_DBL_OPP2_VRAM;     // B_POSITION_OPPONENT_RIGHT
    default: return HEALTHBOX_DBL_PLAYER1_VRAM;
  }
}

/** 1:1 décomp `CreateBattlerHealthboxSprites` DOUBLE (battle_interface.c:902-930).
 *  Box = template[GetBattlerPosition/2], PETITE box 64×32 (PAS d'override ST_OAM_SQUARE
 *  → reste WIDE), right.tileNum += 32 (vs 64 single). La position home est posée ensuite
 *  par InitBattlerHealthboxCoords (branche double déjà 1:1) → on crée à un provisoire. */
async function _createDoublesHealthboxSprites(
  side: 'player' | 'opponent',
  battler: number,
): Promise<HealthboxHandle | null> {
  await ensureDoublesHealthboxAssets();
  const rt = getRuntime();
  if (!rt) return null;
  const position = GetBattlerPosition(battler);
  const boxVram = _doublesBoxVram(position);
  const barVram = HPBAR_DBL_VRAM[battler] | 0;
  const isPlayer = side === 'player';
  const centerX = isPlayer ? 159 : 44;   // provisoire (écrasé par InitBattlerHealthboxCoords).
  const centerY = isPlayer ? 76 : 19;
  // 1:1 ll.906-907/919-920 : left = CreateSprite(template[pos/2]) — WIDE 64×32, PAS de
  // forceSquareKeepWideCtcv (= la PETITE box double, PAS le carré 64×64 single).
  const left = rt.CreateSpriteAtOam({
    tileId: boxVram / 32,
    paletteBank: HEALTHBOX_PALETTE_SLOT,
    x: centerX, y: centerY,
    shape: 1, size: 3,   // WIDE 64×32
    priority: 1, subpriority: 1,
  });
  // 1:1 ll.912/925 : right.tileNum += 32 (double) — vs += 64 (single).
  const right = rt.CreateSpriteAtOam({
    tileId: boxVram / 32 + 32,
    paletteBank: HEALTHBOX_PALETTE_SLOT,
    x: centerX + 64, y: centerY,
    shape: 1, size: 3,
    priority: 1, subpriority: 1,
  });
  // Barre 1:1 : SpriteCB_HealthBar la reposera via data6 (player double=1 → +16 ; opp=2 → +8).
  const bar = rt.CreateSpriteAtOam({
    tileId: barVram / 32,
    paletteBank: HEALTHBAR_PALETTE_SLOT,
    x: centerX + (isPlayer ? 16 : 8), y: centerY,
    shape: 1, size: 1,
    priority: 1, subpriority: 0,
  });
  const barSp = rt.gSprites[bar.spriteId];
  if (barSp) barSp.tileBase = barVram / 32;
  SetSubspriteTables(bar.spriteId, isPlayer ? HEALTHBAR_SUBSPRITES_PLAYER : HEALTHBAR_SUBSPRITES_OPPONENT);
  return {
    leftSpriteId: left.spriteId,
    rightSpriteId: right.spriteId,
    healthbarSpriteId: bar.spriteId,
    side,
    centerX, centerY,
    baseVram: boxVram,
    barBaseVram: barVram,
  };
}

/** Reset des assets doubles (= re-alloc/re-blit au prochain combat double). */
export function resetDoublesHealthboxAssets(): void {
  _dblAssetsLoaded = false;
  _hbDblBaseBlitted = false;
}

/** Sprite IDs d'un healthbox handle (3 gSprites = box left/right + barre). Les
 *  pièces de la barre sont des child OAM (pas des gSprites) gérés à part. */
function _allSpriteIds(handle: HealthboxHandle): number[] {
  return [handle.leftSpriteId, handle.rightSpriteId, handle.healthbarSpriteId];
}

/** 1:1 décomp `SetHealthboxSpriteVisible/Invisible` (ll. 1024-1036) :
 *  toggle visibility de tous les sprites du healthbox (left/right + bar L/R) ensemble. */
export function setHealthboxVisible(handle: HealthboxHandle, visible: boolean): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const spriteId of _allSpriteIds(handle)) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) {
      sprite.invisible = !visible;
      const oam = rt.gba.oam[sprite.oamIndex];
      if (oam) oam.visible = visible;
    }
  }
}

// ─── Slide-in du healthbox (1:1 StartHealthboxSlideIn pokeball.c:1241) ──────
// La box (left/right = sprites normaux) suit son x2 via syncSpritesToOam ; la
// barre HP (subsprite) suit le x2 du parent via syncSubspriteOam (oam.x = x+x2+sub.x,
// déjà câblé pour le bounce y2). Donc poser x2 sur les 3 sprites + décrémenter
// jusqu'à 0 fait glisser tout le healthbox d'un bloc.
interface _HbSlideState { handle: HealthboxHandle; speedX: number; }
const _hbSlides: _HbSlideState[] = [];
let _hbSlideLastFc = -1;

/** 1:1 StartHealthboxSlideIn(battler) : x2 = 0x73 (115), sSpeedX = 5 ; côté
 *  ADVERSE (non-player) négativés (x2 = -115, sSpeedX = -5 → entre par la gauche).
 *  Rend le healthbox visible + lance le slide (tickHealthboxSlideIn fait x2 -= sSpeedX). */
export function startHealthboxSlideIn(handle: HealthboxHandle): void {
  const rt = getRuntime();
  if (!rt) return;
  const isPlayer = handle.side === 'player';
  const startX2 = isPlayer ? 0x73 : -0x73;   // 1:1 : x2 = 0x73, négativé côté opp
  const speedX = isPlayer ? 5 : -5;          // 1:1 : sSpeedX = 5, négativé côté opp
  for (const spriteId of _allSpriteIds(handle)) {
    const sprite = rt.gSprites[spriteId];
    if (!sprite) continue;
    sprite.x2 = startX2;
    sprite.y2 = 0;
    sprite.invisible = false;
    const oam = rt.gba.oam[sprite.oamIndex];
    if (oam) oam.visible = true;
  }
  // Remplace une éventuelle slide en cours sur le même handle.
  const i = _hbSlides.findIndex(s => s.handle === handle);
  if (i >= 0) _hbSlides.splice(i, 1);
  _hbSlides.push({ handle, speedX });
}

/** Tick per-frame (gated ~60fps). 1:1 SpriteCB_HealthboxSlideIn : x2 -= sSpeedX
 *  jusqu'à x2 == 0 (= ~23 frames à 5px). No-op si aucune slide active. */
export function tickHealthboxSlideIn(): void {
  if (_hbSlides.length === 0) return;
  const rt = getRuntime();
  if (!rt) { _hbSlides.length = 0; return; }
  // 1:1 timing : avance ≤1 step / FRAME LOGIQUE (gIntroFrameCounter, 60Hz tickFixed),
  // pas sur le mur d'horloge — lockstep avec la logique + déterministe au frame-step.
  const fc = rt.gIntroFrameCounter;
  if (fc === _hbSlideLastFc) return;
  _hbSlideLastFc = fc;
  for (let s = _hbSlides.length - 1; s >= 0; s--) {
    const { handle, speedX } = _hbSlides[s];
    let done = false;
    for (const spriteId of _allSpriteIds(handle)) {
      const sprite = rt.gSprites[spriteId];
      if (!sprite) continue;
      let x2 = (sprite.x2 ?? 0) - speedX;   // 1:1 : x2 -= sSpeedX
      // clamp au passage par 0 (évite l'overshoot avec un pas de 5).
      if ((speedX > 0 && x2 <= 0) || (speedX < 0 && x2 >= 0)) { x2 = 0; done = true; }
      sprite.x2 = x2;
    }
    if (done) _hbSlides.splice(s, 1);
  }
}

/** Annule toutes les slides en cours (= teardown combat). */
export function stopHealthboxSlideIn(): void { _hbSlides.length = 0; _hbSlideLastFc = -1; }

/** 1:1 décomp `DestoryHealthboxSprite` (ll. 1044-1049) : destroy tous les sprites. */
export function destroyHealthboxSprite(handle: HealthboxHandle): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 : libère d'abord les child OAM des sous-sprites de la barre (sinon ils
  // fuient = OAM visibles orphelins au combat suivant).
  clearSubspriteTable(handle.healthbarSpriteId);
  for (const spriteId of _allSpriteIds(handle)) DestroySprite(spriteId);
}

/** 1:1 décomp `UpdateOamPriorityInAllHealthboxes` (ll. 1056-1070) : update
 *  priority des sprites pour un battler. */
export function setHealthboxPriority(handle: HealthboxHandle, priority: number): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const spriteId of _allSpriteIds(handle)) {
    const sprite = rt.gSprites[spriteId];
    if (!sprite) continue;
    const oam = rt.gba.oam[sprite.oamIndex];
    if (oam) oam.priority = priority;
  }
}

// ─── HP bar widget : 1:1 décomp MoveBattleBarGraphically (D2) ───────────────

/** 1:1 décomp `CalcBarFilledPixels` (battle_interface.c:2413-2459).
 *
 *  Compute la décomposition de la HP courante en `scale` tiles de 8 pixels
 *  chacun. Retourne :
 *    - `filledPixels` (0..scale*8) : total pixels remplis
 *    - `pixelsArray[i]` (0..8) : pixels remplis dans tile i
 *
 *  Spécial : si HP > 0 et filledPixels == 0 → force 1 pixel (= "almost dead"
 *  display tier "≥1 pixel").
 *
 *  NB (2026-06-09) : helper d'AFFICHAGE INSTANTANÉ local, distinct de la
 *  `CalcBarFilledPixels` de battle-hp-bar.ts (= chemin ANIMATION, alimenté par la
 *  struct `battleBars` via MoveBattleBar). Tenté de dédoublonner via import direct
 *  → a régressé le rendu (corruption VRAM healthbox) → restauré. Le bon 1:1 pour
 *  dédoublonner = router l'instant via SetBattleBarStruct+MoveBattleBar (dette). */
function _calcBarFilledPixels(currHp: number, maxHp: number, scale: number): { filled: number; array: number[] } {
  const array = new Array<number>(scale).fill(0);
  if (maxHp <= 0) return { filled: 0, array };
  const totalPixels = scale * 8;
  let pixels = Math.floor(currHp * totalPixels / maxHp);
  let filledPixels = pixels;
  if (filledPixels === 0 && currHp > 0) {
    array[0] = 1;
    filledPixels = 1;
  } else {
    for (let i = 0; i < scale; i++) {
      if (pixels >= 8) {
        array[i] = 8;
      } else {
        array[i] = pixels;
        break;
      }
      pixels -= 8;
    }
  }
  return { filled: filledPixels, array };
}

/** 1:1 décomp `MoveBattleBarGraphically` HEALTH_BAR case (battle_interface.c:2275-2308).
 *
 *  Update les 6 fill tiles du HP bar widget à OBJ VRAM. Choisit le tier
 *  GREEN/YELLOW/RED selon `filledPixels` :
 *    - > 50% (= > 24 pixels) → GREEN
 *    - > 20% (= > 9.6 pixels) → YELLOW
 *    - else → RED
 *
 *  Pour chaque i de 0..5, copie `tiers[barTier][array[i]]` (= 32 bytes tile)
 *  à VRAM tile offset `barTileNumStart + 2 + i` (= les 6 fill tiles au milieu
 *  du bar widget, après les 2 tiles "H/P" labels au début). */
export function updateHealthboxHpBar(handle: HealthboxHandle, currHp: number, maxHp: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!_hpBarTilesGreen || !_hpBarTilesYellow || !_hpBarTilesRed) {
    // Assets not yet loaded — silent skip (= will be retried next update).
    return;
  }

  // 1:1 décomp `B_HEALTHBAR_PIXELS = 48`, scale = 6 tiles.
  const { filled, array } = _calcBarFilledPixels(currHp, maxHp, 6);

  // 1:1 décomp ll. 2291-2296 : color tier selection.
  let tiles: Uint8Array;
  if (filled > 48 * 50 / 100) tiles = _hpBarTilesGreen;
  else if (filled > 48 * 20 / 100) tiles = _hpBarTilesYellow;
  else tiles = _hpBarTilesRed;

  // 1:1 décomp ll. 2298-2307 : copy 6 fill tiles à OBJ VRAM at offset
  // `barTileNumStart + 2 + i`. tileNumStart = OBJ VRAM byte / 32.
  // For our 2-sprite bar layout, tiles 0..3 are in HPBAR_*_LEFT_VRAM,
  // tiles 4..7 are in HPBAR_*_RIGHT_VRAM (which is contiguous from LEFT + 4 tiles).
  // So we just write to (barBaseVram + (2 + i) * 32) for all i=0..5. barBaseVram =
  // handle.barBaseVram (step 3, par position) ; single = HPBAR_{PLAYER,OPP}_LEFT_VRAM.
  const baseVram = handle.barBaseVram;
  for (let i = 0; i < 6; i++) {
    const pixels = array[i];
    const srcOffset = pixels * TILE_BYTES;
    const destOffset = baseVram + (2 + i) * TILE_BYTES;
    rt.gba.objVram.set(tiles.subarray(srcOffset, srcOffset + TILE_BYTES), destOffset);
  }
}

// ─── Digits (Lv / HP) : D3 1:1 décomp UpdateLvlInHealthbox / UpdateHpTextInHealthbox ─

/** Convertit un nombre en array de tile indices `numbers1.png`.
 *  - numbers1.png tile 0 = blank
 *  - numbers1.png tiles 1..10 = digits 0..9 (= correspondance digit+1)
 *
 *  Right-align : pour `num=42` avec `len=3` → `[blank, '4', '2']` = `[0, 5, 3]`. */
function _digitsToNumbers1Tiles(num: number, len: number): number[] {
  const str = String(Math.max(0, Math.min(num, 999))).padStart(len, ' ');
  return str.split('').map(c => c === ' ' ? 0 : Number(c) + 1);
}

/** Convertit un nombre en array de tile indices `numbers2.png`.
 *  - numbers2.png tiles 0..9 = digits 0..9 (= digit directe)
 *  - numbers2.png tile 10 = blank
 *  - numbers2.png tile 11 = "Lv" prefix / slash special */
function _digitsToNumbers2Tiles(num: number, len: number): number[] {
  const str = String(Math.max(0, Math.min(num, 999))).padStart(len, ' ');
  return str.split('').map(c => c === ' ' ? 10 : Number(c));
}

/** Write N tiles à OBJ VRAM à partir d'un tile source array. */
function _writeTilesToVram(vramByteOffset: number, tileIndices: number[], tileSource: Uint8Array): void {
  const rt = getRuntime();
  if (!rt) return;
  for (let i = 0; i < tileIndices.length; i++) {
    const tileIdx = tileIndices[i];
    rt.gba.objVram.set(
      tileSource.subarray(tileIdx * TILE_BYTES, (tileIdx + 1) * TILE_BYTES),
      vramByteOffset + i * TILE_BYTES,
    );
  }
}

// ─── Pipeline texte → healthbox OBJ : 1:1 décomp (battle_interface.c:2551-2604) ─
//
// Le décomp ne dessine PAS le texte healthbox (nickname / "N." niveau / "cur/max"
// PV) avec des tiles pré-cuits : il rend le texte via le système de POLICE dans une
// window temporaire (FONT_SMALL), puis copie les tiles glyphes obtenus dans l'OBJ
// VRAM du sprite healthbox. C'est le port de ce pipeline ("D6b text-to-tiles renderer"
// déféré historiquement). Débloque surnom + préfixe niveau "N." + slash PV.

/** 1:1 décomp `sHealthboxWindowTemplate` (battle_interface.c:760-768) : window temp
 *  8×2 tiles (= 64×16 px) servant de canvas glyphes. */
const sHealthboxWindowTemplate = {
  bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 8, height: 2, paletteNum: 0, baseBlock: 0,
} as const;

/** 1:1 décomp `AddTextPrinterAndCreateWindowOnHealthbox` (battle_interface.c:2551).
 *  Crée la window temp, fond = PIXEL_FILL(bgColor), rend `str` en FONT_SMALL avec
 *  color = [bgColor, 1, 3]. TEXT_SKIP_DRAW = render synchrone dans le pixelBuffer. */
function _addTextPrinterAndCreateWindowOnHealthbox(str: string, x: number, y: number, bgColor: number): number {
  const winId = AddWindow(sHealthboxWindowTemplate);
  FillWindowPixelBuffer(winId, (bgColor << 4) | bgColor);  // = PIXEL_FILL(bgColor)
  AddTextPrinterParameterized4(winId, FONT_SMALL, x, y, 0, 0, [bgColor, 1, 3], TEXT_SKIP_DRAW, str);
  return winId;
}

/** Convertit le pixelBuffer linéaire (1 byte/pixel idx 0-15) de la window en tile
 *  data 4bpp tile-packed GBA — soit l'équivalent de ce que renvoie côté décomp
 *  `GetWindowAttribute(winId, WINDOW_TILE_DATA)`. Layout : tiles row-major, 32
 *  bytes/tile, 4 bytes/row, low nibble = pixel gauche. Window 8×2 → 512 bytes.
 *  Permet d'appliquer les `CpuCopy32` du décomp (offsets +256 / +20) à l'identique
 *  vers l'OBJ VRAM (qui est lui aussi 4bpp tile-packed). */
function _windowTextDataTo4bpp(winId: number): Uint8Array {
  const widthTiles = sHealthboxWindowTemplate.width;
  const heightTiles = sHealthboxWindowTemplate.height;
  const widthPx = widthTiles * 8;
  const out = new Uint8Array(widthTiles * heightTiles * TILE_BYTES);
  const pb = GetWindowPixelBuffer(winId);
  if (!pb) return out;
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileBase = (ty * widthTiles + tx) * TILE_BYTES;
      for (let row = 0; row < 8; row++) {
        const srcRow = (ty * 8 + row) * widthPx + tx * 8;
        for (let pc = 0; pc < 4; pc++) {
          const px1 = pb[srcRow + pc * 2] & 0xF;
          const px2 = pb[srcRow + pc * 2 + 1] & 0xF;
          out[tileBase + row * 4 + pc] = px1 | (px2 << 4);
        }
      }
    }
  }
  return out;
}

/** 1:1 décomp `TextIntoHealthboxObject` (battle_interface.c:2585-2598).
 *  Copie le bottom tile-row (windowData @ src+256) → dest+256 (windowWidth tiles),
 *  puis pour chaque tile du top-row, 12 bytes @ +20 → dest+20 (dé-interleave qui
 *  évite de copier les 4 lignes de pixels vides du haut du sHealthboxWindowTemplate). */
function _textIntoHealthboxObject(destOff: number, windowData: Uint8Array, srcOff: number, windowWidth: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const vram = rt.gba.objVram;
  vram.set(windowData.subarray(srcOff + 256, srcOff + 256 + windowWidth * TILE_BYTES), destOff + 256);
  for (let i = 0; i < windowWidth; i++) {
    vram.set(windowData.subarray(srcOff + i * 32 + 20, srcOff + i * 32 + 32), destOff + i * 32 + 20);
  }
}

/** 1:1 décomp `HpTextIntoHealthboxObject` (battle_interface.c:2580-2583).
 *  Copie SEULEMENT le bottom tile-row (windowData @ src+256) → dest (pas de +256). */
function _hpTextIntoHealthboxObject(destOff: number, windowData: Uint8Array, srcOff: number, windowWidth: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.objVram.set(windowData.subarray(srcOff + 256, srcOff + 256 + windowWidth * TILE_BYTES), destOff);
}

/** 1:1 décomp `ConvertIntToDecimalStringN(buf, n, STR_CONV_MODE_RIGHT_ALIGN, width)`
 *  côté chaîne : nombre right-aligned padé d'espaces à `width`. */
function _convIntRightAlign(num: number, width: number): string {
  return String(Math.max(0, Math.min(num, 999))).padStart(width, ' ');
}

/** 1:1 décomp `UpdateLvlInHealthbox` (battle_interface.c:1105-1137).
 *
 *  Rend "{LV_2}NN" (= glyphe niveau "N." FR + chiffres left-align) via la police,
 *  puis copie 3 tiles dans le sprite OAM healthbox.
 *
 *  Offsets décomp (relative à spriteTileNum) : player += 0x820, opp += 0x400 (single).
 *  Notre layout : spriteTileNum = HEALTHBOX_*_VRAM (tileNum * 32). */
export function UpdateLvlInHealthbox(handle: HealthboxHandle, level: number): void {
  // 1:1 décomp ll.1113-1117 : text = CHAR_EXTRA_SYMBOL + CHAR_LV_2 + left-align(lvl,3).
  // {LV_2} encode CHAR_EXTRA_SYMBOL(0xF9)+0x05 = le glyphe niveau "N." du décomp FR.
  const lvStr = String(Math.max(0, Math.min(level, 999)));
  const text = `{LV_2}${lvStr}`;
  const xPos = 5 * (3 - lvStr.length);  // 1:1 décomp l.1117.
  const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, xPos, 3, 2);
  const windowData = _windowTextDataTo4bpp(winId);
  // 1:1 décomp ll.1122-1134 : base = spriteTileNum (= handle.baseVram, step 3 par position) ;
  // player single += 0x820, player DOUBLE += 0x420, opp (single ET double) += 0x400.
  const destOff = handle.side === 'player'
    ? handle.baseVram + (IsDoubleBattle() ? 0x420 : 0x820)
    : handle.baseVram + 0x400;
  _textIntoHealthboxObject(destOff, windowData, 0, 3);
  RemoveWindow(winId);
}

/** 1:1 décomp `UpdateHpTextInHealthbox` (battle_interface.c:1139-1172) player single.
 *
 *  Display "currHp/maxHp" (= 7 chars max : "999/999") dans le sprite OAM healthbox.
 *  Opp single n'affiche PAS de HP digits (= juste la bar + status).
 *
 *  Offsets décomp player single :
 *    - HP current (3 digits) : split
 *      · 1 tile à spriteTileNum + 0x3E0 (= byte 0x3E0)
 *      · 2 tiles à spriteTileNum + 0xB00 (= byte 0xB00 + 0x20)
 *    - HP max (3 digits) : 2 tiles à spriteTileNum + 0xB40 */
// ─── Status icons : D4 1:1 décomp UpdateStatusIconInHealthbox ───────────────

/** 1:1 décomp `UpdateStatusIconInHealthbox` (battle_interface.c:1993-2072).
 *
 *  Affiche l'icone de status (= 3 tiles 8×8 horizontaux) sur le sprite OAM
 *  healthbox. Tile data depuis status.png arrangé en 5 types × 3 tiles each :
 *    - PSN : tiles 0..2
 *    - PRZ : tiles 3..5
 *    - SLP : tiles 6..8
 *    - FRZ : tiles 9..11
 *    - BRN : tiles 12..14
 *
 *  Tile offsets dans le sprite OAM (= 1:1 décomp ll. 2007-2015) :
 *    - Player single : tileNumAdder = 0x1A (= tile 26 = byte 0x340 from healthbox left)
 *    - Opp single    : tileNumAdder = 0x11 (= tile 17 = byte 0x220 from healthbox left)
 *
 *  Si status null/none : copy `HEALTHBOX_GFX_39` (= blank tile) à la même position
 *  pour effacer l'icone précédent. */
export function UpdateStatusIconInHealthbox(handle: HealthboxHandle, status: string | null | undefined): void {
  const rt = getRuntime();
  if (!rt || !_statusTiles) return;

  // battler = 1:1 `gSprites[healthboxSpriteId].hMain_Battler` (data[6]) — pour hpNumbersNoBars.
  const leftSp = rt.gSprites[handle.leftSpriteId];
  const battler = leftSp?.data ? (leftSp.data[6] | 0) : 0;
  // 1:1 décomp ll. 2004-2015 : base = handle.baseVram (step 3, par position) ; tileNumAdder
  // player single = 0x1A, player DOUBLE = 0x12, opp (single/double) = 0x11.
  const baseVram = handle.baseVram;
  const tileNumAdder = handle.side === 'player' ? (IsDoubleBattle() ? 0x12 : 0x1A) : 0x11;
  const destVram = baseVram + tileNumAdder * TILE_BYTES;

  // 1:1 décomp ll. 2018-2055 : status → tile offset dans status.png.
  // Notre PokemonInstance.status format : 'PSN' | 'PAR' | 'BRN' | 'SLP' | 'FRZ' | 'TOX'
  // (TOX = STATUS1_PSN_ANY = same icon PSN).
  let statusTileStart: number;
  // 1:1 décomp `sStatusIconColors[]` (battle_interface.c:751-757) : couleur RGB555
  // appliquée à l'entrée palette de l'icône status via FillPalette (cf. plus bas).
  let statusPalColor: number;
  switch (status) {
    case 'PSN': case 'TOX': statusTileStart = 0;  statusPalColor = _rgb555(24, 12, 24); break; // PSN
    case 'PAR':             statusTileStart = 3;  statusPalColor = _rgb555(23, 23, 3);  break; // PRZ
    case 'SLP':             statusTileStart = 6;  statusPalColor = _rgb555(20, 20, 17); break; // SLP
    case 'FRZ':             statusTileStart = 9;  statusPalColor = _rgb555(17, 22, 28); break; // FRZ
    case 'BRN':             statusTileStart = 12; statusPalColor = _rgb555(28, 14, 10); break; // BRN
    default: {
      // 1:1 décomp ll. 2043-2048 : no status → copie HEALTHBOX_GFX_39 (= misc.4bpp
      // tile 3) sur les 3 tiles de l'emplacement de l'icône status. GFX_39 =
      // "blank health window" = tout index 2 = FOND du groove (cream), PAS un tile
      // transparent. L'emplacement status (tileNumAdder 0x11 côté opp) chevauche la
      // rangée groove de la box (tile-row 2, tiles 17..19 du sprite box-left) : avec
      // des zéros (ancien bug), ces tiles devenaient transparentes → aux rangées
      // transparentes haut/bas de la barre HP on voyait le BG combat (vert) au lieu
      // du cream du groove (user-flag 2026-05-30 "vert au lieu de cream, ultra subtil").
      if (!_miscTiles) return;
      const blankWindowTile = _miscTiles.subarray(3 * TILE_BYTES, 4 * TILE_BYTES); // = HEALTHBOX_GFX_39
      for (let i = 0; i < 3; i++) {
        rt.gba.objVram.set(blankWindowTile, destVram + i * TILE_BYTES);
      }
      // 1:1 décomp ll. 2050-2051 : no-status → restaure le label "PV" (HEALTHBOX_GFX_1,
      // 2 tiles, CpuCopy32 64B) sur les tiles 0-1 de la BARRE (handle.barBaseVram, step 3),
      // GATED `!hpNumbersNoBars` (en double, si les chiffres sont affichés, PAS de label).
      // hpNumbersNoBars=0 en single → restauration TOUJOURS = chemin single INCHANGÉ.
      if (!isHpNumbersNoBars(battler) && _hpBarBaseTiles) {
        rt.gba.objVram.set(_hpBarBaseTiles.subarray(1 * TILE_BYTES, 3 * TILE_BYTES), handle.barBaseVram);
      }
      return;
    }
  }

  // 1:1 décomp ll. 2057-2062 : la couleur de l'icône status est appliquée via
  // FillPalette sur l'entrée OBJ palette slot 5 index (12 + battler). Le gfx
  // status.4bpp utilise l'index LOCAL 12 (cf. _loadMultiSubPalTiles : raw {2,3,12}).
  // Sans ce fill, l'icône rend avec l'index 12 = placeholder BLEU de la palette
  // healthbox → "BRU bleu" (user 2026-05-30). Décomp = pltAdder = paletteNum*16 +
  // battler + 12 → index 12 (player) / 13 (opponent), SÉPARÉS pour permettre 2
  // status simultanés de couleurs différentes. Côté adverse on remap donc le gfx
  // 12→13 pour matcher l'entrée 13 (sinon il lirait l'entrée 12 = couleur joueur).
  // 1:1 décomp l.2058 : pltAdder += battler + 12 → index LOCAL (12 + battler). Single :
  // player battler=0 → 12, opp battler=1 → 13 (= l'ancien side-keyé, INCHANGÉ). Double :
  // 12..15 (1 entrée couleur par battler → 4 statuts simultanés possibles).
  const palColorIndex = 12 + battler;

  let tileData: Uint8Array = _statusTiles.subarray(
    statusTileStart * TILE_BYTES, (statusTileStart + 3) * TILE_BYTES,
  );
  if (palColorIndex !== 12) {
    const remapped = new Uint8Array(tileData);
    for (let i = 0; i < remapped.length; i++) {
      let lo = remapped[i] & 0xF;
      let hi = (remapped[i] >> 4) & 0xF;
      if (lo === 12) lo = palColorIndex;
      if (hi === 12) hi = palColorIndex;
      remapped[i] = lo | (hi << 4);
    }
    tileData = remapped;
  }
  // Copy 3 tiles consécutifs (= 96 bytes = 3 × 32) à OBJ VRAM.
  rt.gba.objVram.set(tileData, destVram);

  // 1:1 décomp ll. 2063-2070 : `IsDoubleBattle() || side == OPPONENT` (= adverse single/double
  // OU tout battler en double) ET `!hpNumbersNoBars` → l'icône recouvre la zone label "PV" de
  // la barre → GFX_0 (section noire) + GFX_65 (frame end) sur handle.barBaseVram (step 3).
  // Single player : condition FALSE (IsDoubleBattle=0, side=player) → INCHANGÉ.
  if ((IsDoubleBattle() || handle.side !== 'player') && !isHpNumbersNoBars(battler) && _hpBarBaseTiles && _frameEndTile) {
    rt.gba.objVram.set(_hpBarBaseTiles.subarray(0, TILE_BYTES), handle.barBaseVram);             // GFX_0
    rt.gba.objVram.set(_frameEndTile.subarray(0, TILE_BYTES), handle.barBaseVram + TILE_BYTES);  // GFX_65
  }

  // FillPalette (= 1:1 décomp FillPalette + CpuCopy16 sur OBJ_PLTT) : 1 couleur.
  // 1:1 décomp FillPalette : écrit le buffer FADED (→ TransferPlttBuffer) à l'index OBJ du slot
  // healthbox + palColorIndex. Faded (pas live-direct) sinon le flush du modèle bufferisé
  // écraserait la couleur de statut par la palette de base.
  const _statusIdx = 0x100 + HEALTHBOX_PALETTE_SLOT * 16 + palColorIndex;
  rt.gPlttBufferFaded.set(_statusIdx, statusPalColor);
  rt.gPlttBufferUnfaded.set(_statusIdx, statusPalColor);
}

/** 1:1 décomp `TryAddPokeballIconToHealthbox` — RENDU (battle_interface.c:1987-1990).
 *  Affiche (show=true) ou efface (show=false) le tile pokéball "owned" sur le healthbar
 *  ADVERSE (1:1 `gSprites[healthBarSpriteId].oam.tileNum + 8`, opp-only). La CONDITION
 *  (combat sauvage + mon déjà capturé) est portée 1:1 dans `TryAddPokeballIconToHealthbox`
 *  (battle-healthbox-l.ts) qui appelle cette primitive de rendu (split asset/condition). */
export function drawBallCaughtIndicator(show: boolean): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp : OBJ_VRAM0 + (healthBar.tileNum + 8) * TILE_SIZE_4BPP. healthbar adverse
  // = HPBAR_OPP_LEFT_VRAM ; +8 tiles.
  const dest = HPBAR_OPP_LEFT_VRAM + 8 * TILE_BYTES;
  if (show) {
    if (!_ballCaughtTiles) return;
    // 1:1 CpuCopy32(GetHealthboxElementGfxPtr(HEALTHBOX_GFX_STATUS_BALL_CAUGHT), dest, 32).
    rt.gba.objVram.set(_ballCaughtTiles.subarray(0, TILE_BYTES), dest);
  } else {
    // 1:1 CpuFill32(0, dest, 32) : efface (le status icon prend la place).
    rt.gba.objVram.fill(0, dest, dest + TILE_BYTES);
  }
}

// ─── EXP bar : D5 1:1 décomp MoveBattleBarGraphically EXP_BAR ───────────────

/** 1:1 décomp `MoveBattleBarGraphically` EXP_BAR case (battle_interface.c:2309-2330).
 *
 *  Update les 8 fill tiles de l'EXP bar widget à OBJ VRAM. Player single uniquement.
 *
 *  Tile offsets décomp :
 *    - i=0..3 : tile slots [tileNum+0x24..tileNum+0x27] (= bytes 0x480..0x500)
 *    - i=4..7 : tile slots [tileNum+0x60..tileNum+0x63] (= bytes 0xC00..0xC80)
 *
 *  Si `level == MAX_LEVEL` (= 100), tous les array[i] sont mis à 0 (= bar vide).
 *
 *  `B_EXPBAR_PIXELS = 64` (= 8 tiles × 8 pixels), scale = 8 tiles. */
export function updateHealthboxExpBar(
  handle: HealthboxHandle,
  currExp: number,
  nextLevelExp: number,
  level: number,
): void {
  if (handle.side !== 'player') return;  // Opp single doesn't have EXP bar
  if (!_expBarTiles) return;
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp ll. 2316-2320 : si MAX_LEVEL, all zeros (= bar vide).
  let array: number[];
  if (level >= 100) {
    array = new Array(8).fill(0);
  } else {
    // 1:1 décomp ll. 2310-2314 : CalcBarFilledPixels with scale=8 (B_EXPBAR_PIXELS/8).
    const { array: arr } = _calcBarFilledPixels(currExp, Math.max(1, nextLevelExp), 8);
    array = arr;
  }

  // 1:1 décomp ll. 2321-2329 : write 8 fill tiles à OBJ VRAM.
  // Tile slots player healthbox left sprite (tileNum=0) :
  //   - i=0..3 : (0 + 0x24 + i) * 32 = bytes 0x480, 0x4A0, 0x4C0, 0x4E0
  //   - i=4..7 : 0xB80 + (i + 0) * 32 = bytes 0xC80, 0xCA0, 0xCC0, 0xCE0
  //     WAIT recalc: 0xB80 + i * 32 for i=4..7 = 0xC00, 0xC20, 0xC40, 0xC60
  // Recalc: i=4 → OBJ_VRAM0 + 0xB80 + (4 + 0) * 32 = 0xB80 + 0x80 = 0xC00
  //         i=5 → 0xB80 + 5*32 = 0xC20
  //         i=6 → 0xC40
  //         i=7 → 0xC60
  const baseVram = handle.baseVram;  // step 3 : single player = HEALTHBOX_PLAYER_VRAM (INCHANGÉ).
  for (let i = 0; i < 8; i++) {
    const pixels = array[i];
    const srcOffset = pixels * TILE_BYTES;
    const destOffset = i < 4
      ? baseVram + (0x24 + i) * TILE_BYTES
      : baseVram + 0xB80 + i * TILE_BYTES;
    rt.gba.objVram.set(
      _expBarTiles.subarray(srcOffset, srcOffset + TILE_BYTES),
      destOffset,
    );
  }
}

/** 1:1 décomp `UpdateHpTextInHealthbox` (battle_interface.c:1139-1172) player single.
 *  Rend "cur/max" via la police (RIGHT_ALIGN 3 + CHAR_SLASH) puis copie dans l'OBJ
 *  VRAM. Opp single n'affiche PAS le PV numérique (= juste bar + status). */
export function updateHealthboxHpDigits(handle: HealthboxHandle, currHp: number, maxHp: number): void {
  // 1:1 décomp l.1146 : `side == PLAYER && !IsDoubleBattle()` (= digits PV dans la box).
  // En DOUBLE, le PV joueur passe par UpdateHpTextInHealthboxInDoubles (chemin hpNumbersNoBars,
  // rien par défaut) → ce primitive box-digits est no-op. Single player : INCHANGÉ.
  if (handle.side !== 'player' || IsDoubleBattle()) return;
  const baseVram = handle.baseVram;  // step 3 : single player = HEALTHBOX_PLAYER_VRAM (INCHANGÉ).
  // ── HP courant : 1:1 décomp ll.1158-1170 (RIGHT_ALIGN 3 + CHAR_SLASH, x=4). ──
  {
    const text = `${_convIntRightAlign(currHp, 3)}/`;
    const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, 4, 5, 2);
    const windowData = _windowTextDataTo4bpp(winId);
    _hpTextIntoHealthboxObject(baseVram + 0x3E0, windowData, 0, 1);     // 1 tile @ 0x3E0
    _hpTextIntoHealthboxObject(baseVram + 0xB00, windowData, 0x20, 2);  // 2 tiles @ 0xB00 (windowData+0x20)
    RemoveWindow(winId);
  }
  // ── HP max : 1:1 décomp ll.1149-1156 (RIGHT_ALIGN 3, x=0). ──
  {
    const text = _convIntRightAlign(maxHp, 3);
    const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, 0, 5, 2);
    const windowData = _windowTextDataTo4bpp(winId);
    _hpTextIntoHealthboxObject(baseVram + 0xB40, windowData, 0, 2);     // 2 tiles @ 0xB40
    RemoveWindow(winId);
  }
}

/** 1:1 décomp `UpdateHealthboxAttribute` branche nickname (battle_interface.c:1910-1968).
 *  Rend "{HIGHLIGHT 2}<nick><gender>" via la police puis copie dans l'OBJ VRAM.
 *  - gender 0 (MON_MALE) → "{COLOR 11}♂" (bleu) ; 254 (MON_FEMALE) → "{COLOR 10}♀"
 *    (rose) ; sinon (genderless / Nidoran ambigu = 100) → "{COLOR 11}" sans symbole.
 *  - player single : 6 tiles @ 0x40 + 1 tile @ 0x800 (windowData+0xC0).
 *  - opponent single : 7 tiles @ 0x20. */
export function UpdateNickInHealthbox(handle: HealthboxHandle, nickname: string, gender: number): void {
  let genderSuffix: string;
  if (gender === 0) genderSuffix = '{COLOR DYNAMIC_COLOR_2}♂';        // MON_MALE → idx 11 (bleu)
  else if (gender === 254) genderSuffix = '{COLOR DYNAMIC_COLOR_1}♀'; // MON_FEMALE → idx 10 (rose)
  else genderSuffix = '{COLOR DYNAMIC_COLOR_2}';                      // None / genderless
  const str = `{HIGHLIGHT DARK_GRAY}${nickname}${genderSuffix}`;
  const winId = _addTextPrinterAndCreateWindowOnHealthbox(str, 0, 3, 2);
  const windowData = _windowTextDataTo4bpp(winId);
  if (handle.side === 'player') {
    // 1:1 décomp ll.1952-1960 : player 6 tiles @ base+0x40 ; puis 1 tile @ base + (single
    // 0x800 / DOUBLE 0x400), windowData+0xC0. base = handle.baseVram (step 3, par position).
    _textIntoHealthboxObject(handle.baseVram + 0x40, windowData, 0, 6);
    _textIntoHealthboxObject(handle.baseVram + (IsDoubleBattle() ? 0x400 : 0x800), windowData, 0xC0, 1);
  } else {
    // 1:1 décomp l.1964 : opponent (single/double) 7 tiles @ base+0x20.
    _textIntoHealthboxObject(handle.baseVram + 0x20, windowData, 0, 7);
  }
  RemoveWindow(winId);
}

/** 1:1 décomp `UpdateHpTextInHealthboxInDoubles` (battle_interface.c:1216-1309).
 *  Rend les CHIFFRES PV en combat DOUBLE (uniquement quand `hpNumbersNoBars` du battler
 *  est set = après le toggle START). Deux branches :
 *   - PLAYER : rend via le pipeline window (AddTextPrinter → HpTextIntoHealthboxObject) dans
 *     la région BARRE (handle.barBaseVram, 1:1 `gSprites[data[5]].oam.tileNum`) + FRAME_END
 *     double dans la box (baseVram + 0x680).
 *   - OPPONENT : rend via `barFontGfx` + `RenderTextHandleBold(FONT_BOLD)` puis copie les
 *     tuiles BAS des glyphes dans la région barre (1:1 ll.1275-1306).
 *  Prend le healthboxSpriteId (1:1 signature décomp) → reconstruit le handle. No-op si
 *  hpNumbersNoBars=0 (= JAMAIS en single : SwapHpBars ne toggle pas les battlers single). */
export function UpdateHpTextInHealthboxInDoubles(healthboxSpriteId: number, value: number, maxOrCurrent: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const handle = _handleFromSpriteId(healthboxSpriteId);
  if (!handle) return;
  const left = rt.gSprites[healthboxSpriteId];
  const battler = left?.data ? (left.data[6] | 0) : 0;
  const boxBase = handle.baseVram;        // 1:1 gSprites[healthboxSpriteId].oam.tileNum * 32
  const barBase = handle.barBaseVram;     // 1:1 gSprites[data[5]].oam.tileNum * 32 (= BAR sprite)

  if (handle.side === 'player') {
    // 1:1 ll.1223-1250 : gated hpNumbersNoBars du battler (data[6]).
    if (!isHpNumbersNoBars(battler)) return;
    if (maxOrCurrent !== HP_CURRENT) {  // max HP
      const text = _convIntRightAlign(value, 3);
      const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, 0, 5, 0);
      const windowData = _windowTextDataTo4bpp(winId);
      _hpTextIntoHealthboxObject(barBase + 0xC0, windowData, 0, 2);  // 1:1 l.1234
      RemoveWindow(winId);
      // 1:1 ll.1236-1238 : CpuCopy32(GFX_FRAME_END, box tileNum*32 + 0x680, 0x20).
      if (_frameEndDblTile) rt.gba.objVram.set(_frameEndDblTile, boxBase + 0x680);
    } else {  // current HP ("cur/")
      const text = `${_convIntRightAlign(value, 3)}/`;  // 1:1 : digits + CHAR_SLASH
      const winId = _addTextPrinterAndCreateWindowOnHealthbox(text, 4, 5, 0);
      const windowData = _windowTextDataTo4bpp(winId);
      rt.gba.objVram.fill(0, barBase, barBase + 3 * TILE_BYTES);  // 1:1 l.1246 FillHealthboxObject(barBase,0,3)
      _hpTextIntoHealthboxObject(barBase + 0x60, windowData, 0, 3);  // 1:1 l.1247
      RemoveWindow(winId);
    }
    return;
  }

  // ── OPPONENT (1:1 ll.1252-1307) : rendu via barFontGfx + RenderTextHandleBold ──
  if (!isHpNumbersNoBars(battler)) return;
  const mg = (globalThis as { __monSpritesGfx?: { getBarFontGfx?: () => Uint8Array | null } }).__monSpritesGfx;
  const barFontGfx = mg?.getBarFontGfx?.() ?? null;
  if (!barFontGfx) return;  // barFontGfx pas encore chargée (LoadBattleBarGfx) → retry au prochain update.
  // 1:1 ll.1256/1270-1272 : text = sEmptyWhiteText_TransparentHighlight + digits. Le slash est
  // ajouté quand `!maxOrCurrent` (HP_CURRENT==0 → true : slash ; HP_MAX==1 → false : pas de slash).
  const digits = _convIntRightAlign(value, 3);
  const withSlash = maxOrCurrent === HP_CURRENT ? `${digits}/` : digits;
  const encoded = encodeStringForFont(`{COLOR WHITE}{HIGHLIGHT TRANSPARENT}${withSlash}`, getOwCharmap() ?? {});
  RenderTextHandleBold(barFontGfx, FONT_BOLD, encoded);
  const barTileNum = (barBase / TILE_BYTES) | 0;   // 1:1 gSprites[r7].oam.tileNum
  const varOff = maxOrCurrent === HP_CURRENT ? 0 : 4;  // 1:1 l.1261/1266-1267
  for (let i = varOff; i < varOff + 3; i++) {
    // 1:1 ll.1275-1288 : copie le tuile BAS (offset +32) du glyphe (i-var) dans la barre.
    const src = ((i - varOff) * 64) + 32;
    const dstTile = i < 3 ? (1 + barTileNum + i) : (i + barTileNum);
    const dstByte = (i < 3 ? 0 : 0x20) + 32 * dstTile;
    rt.gba.objVram.set(barFontGfx.subarray(src, src + TILE_BYTES), dstByte);
  }
  if (maxOrCurrent === HP_CURRENT) {
    // 1:1 ll.1291-1297 : slash (barFontGfx[224] = tuile bas du 4e glyphe) @ tileNum+4 ; fill @ tileNum.
    rt.gba.objVram.set(barFontGfx.subarray(224, 224 + TILE_BYTES), (barTileNum + 4) * TILE_BYTES);
    rt.gba.objVram.fill(0, barTileNum * TILE_BYTES, barTileNum * TILE_BYTES + TILE_BYTES);
  }
  // 1:1 ll.1298-1306 : l'autre branche (side==PLAYER) est UNREACHABLE ici (battler adverse).
}
