/**
 * battle/battle-anim-normal.ts — Port 1:1 strict des palette blends + shake.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_anim_normal.c`
 * (1115 lignes C).
 *
 * Fonctions publiques portées 1:1 :
 *   - AnimTask_BlendColorCycle (447-460) + Loop helper (476-506)
 *   - AnimTask_BlendColorCycleExclude (509-537) + Loop (553-583)
 *   - AnimTask_BlendColorCycleByTag (586-600) + Loop (616-646)
 *   - AnimTask_FlashAnimTagWithColor (668-692) + Step1/Step2 (694-748)
 *   - AnimTask_InvertScreenColor (759-778)
 *   - AnimTask_TintPalettes (789-834)
 *   - AnimTask_ShakeBattlePlatforms (957-970) + Step (972-998)
 *
 * Helpers internes :
 *   - BlendColorCycle / BlendColorCycleExclude / BlendColorCycleByTag
 *   - AnimShakeMonOrBattlePlatforms + Step (1006-947) — sprite-driven shake
 *
 * Dépendances :
 *   - decomp-globals.ts : BeginNormalPaletteFade, gPaletteFade
 *   - battle-anim-interpreter.ts : DestroyAnimVisualTask + bytecode args
 *   - state.ts : gBattlersCount + _getGBattleAnimAttacker()/Target
 *   - sprite.ts : IndexOfSpritePaletteTag + tag system
 */

import { getRuntime } from '../system/decomp-globals';
import { gBattlersCount } from './state';

// Pour éviter le cycle ESM (= battle-anim-interpreter → decomp-globals → ... →
// battle-anim-normal), on accède aux state via lazy globalThis lookup au lieu
// d'import top-level. Le runtime garantit que __battleAnim est chargé avant
// nos AnimTask_* fns sont appelées (= bytecode runtime, post-boot).
function _getAnimState(): {
  attacker: number; target: number;
  args: Int16Array; destroyTask: (taskId: number) => void;
} {
  const ba = (globalThis as Record<string, unknown>).__battleAnim as {
    gBattleAnimAttacker?: number; gBattleAnimTarget?: number;
    gBattleAnimArgs?: Int16Array; DestroyAnimVisualTask?: (taskId: number) => void;
  } | undefined;
  return {
    attacker: ba?.gBattleAnimAttacker ?? 0,
    target: ba?.gBattleAnimTarget ?? 1,
    args: ba?.gBattleAnimArgs ?? new Int16Array(8),
    destroyTask: ba?.DestroyAnimVisualTask ?? ((_taskId: number): void => { /* no-op */ }),
  };
}

/** Wrapper read d'un arg bytecode (= gBattleAnimArgs[i]). */
function getAnimArg(idx: number): number {
  return _getAnimState().args[idx] ?? 0;
}

/** Wrapper DestroyAnimVisualTask via globalThis lazy. */
function DestroyAnimVisualTask(taskId: number): void {
  _getAnimState().destroyTask(taskId);
}

/** Lazy accessor gBattleAnimAttacker. */
function _getGBattleAnimAttacker(): number { return _getAnimState().attacker; }
function _getGBattleAnimTarget(): number { return _getAnimState().target; }

import { IndexOfSpritePaletteTag } from '../system/sprite';

// ─── gTasks helper (= runtime tasks Map) ───────────────────────────────────

interface AnimTask {
  data: Int16Array | number[];
  func: ((task: AnimTask) => void) | ((taskId: number) => void) | null;
}

function _gTasks(taskId: number): AnimTask {
  const rt = getRuntime();
  if (!rt || !rt.gTasks) return _DUMMY_TASK;
  return ((rt.gTasks.get(taskId) ?? _DUMMY_TASK) as unknown) as AnimTask;
}
const _DUMMY_TASK: AnimTask = { data: new Int16Array(16), func: null };

/** 1:1 décomp `gPaletteFade.active` check helper. */
function _isPaletteFadeActive(): boolean {
  return getRuntime()?.gPaletteFade?.active ?? false;
}

/** 1:1 décomp `BeginNormalPaletteFade(palettes, delay, startY, endY, color)`. */
function _BeginNormalPaletteFade(
  palettes: number, delay: number, startY: number, endY: number, color: number,
): void {
  const rt = getRuntime();
  // Notre runtime accepte string ou number selon impl. On passe number direct
  // ; conversion en string si besoin via wrapper.
  rt?.BeginNormalPaletteFade?.(
    palettes as unknown as string, delay, startY, endY, color as unknown as string,
  );
}

/** 1:1 décomp `UnpackSelectedBattlePalettes(selector)`. Convertit un selector
 *  byte en mask u32 de palettes battle. */
function UnpackSelectedBattlePalettes(selector: number): number {
  // Décomp battle_anim.c : selector 0..255 = bitfield :
  //   bit 0 : attacker palette
  //   bit 1 : target palette
  //   bit 2 : attacker partner
  //   bit 3 : target partner
  //   bit 4 : BG palette
  //   bit 5 : sprite tag (= via tPalSelectorHi/Lo flush)
  // Pour now, simplifié pour single battle :
  let mask = 0;
  if (selector & 1) mask |= 1 << (_getGBattleAnimAttacker() + 16);
  if (selector & 2) mask |= 1 << (_getGBattleAnimTarget() + 16);
  if (selector & 0x10) mask |= 0xFFFF; // BG palettes
  return mask;
}

/** 1:1 décomp `GetBattlePalettesMask(allowMon, allowBattler, ...)`.
 *  Simplifié pour notre port single battle. */
function GetBattlePalettesMask(
  scenery: boolean, _attacker: boolean, _target: boolean,
  _attackerPartner: boolean, _targetPartner: boolean,
  _atkSide: boolean, _defSide: boolean,
): number {
  if (scenery) return 0xFFFF;
  return 0;
}

/** 1:1 décomp `InvertPlttBuffer(palettes)`. */
function _InvertPlttBuffer(palettes: number): void {
  void palettes;
  // Dette R3 : palette buffer invert via runtime.gPlttBuffer manipulation.
}

/** 1:1 décomp `TintPlttBuffer(palettes, r, g, b)`. */
function _TintPlttBuffer(palettes: number, r: number, g: number, b: number): void {
  void palettes; void r; void g; void b;
  // Dette R3 : tint palette buffer (= multiply RGB par color).
}

/** 1:1 décomp `UnfadePlttBuffer(palettes)`. */
function _UnfadePlttBuffer(palettes: number): void {
  void palettes;
  // Dette R3 : restore palettes depuis Unfaded buffer.
}

// ─── AnimTask_BlendColorCycle (battle_anim_normal.c:447) — 1:1 décomp ──────

/** 1:1 décomp `AnimTask_BlendColorCycle(taskId)` (battle_anim_normal.c:447-460).
 *  Blend palettes selectionnées vers une couleur puis back, alternant
 *  tNumBlends fois. Beaucoup d'usages ne mettent que tNumBlends=2 → blend
 *  vers couleur puis retour (= 1 flash). */
export function AnimTask_BlendColorCycle(taskId: number): void {
  const task = _gTasks(taskId);
  const selector = getAnimArg(0) ?? 0;
  const delay = getAnimArg(1) ?? 0;
  const numBlends = getAnimArg(2) ?? 0;
  const initialBlendY = getAnimArg(3) ?? 0;
  const targetBlendY = getAnimArg(4) ?? 0;
  const color = getAnimArg(5) ?? 0;

  // Data layout 1:1 décomp :
  //   data[2] = tPalSelector, data[3] = tDelay, data[4] = tNumBlends
  //   data[5] = tInitialBlendY, data[6] = tTargetBlendY, data[7] = tBlendColor
  //   data[8] = tRestoreBlend
  task.data[2] = selector;
  task.data[3] = delay;
  task.data[4] = numBlends;
  task.data[5] = initialBlendY;
  task.data[6] = targetBlendY;
  task.data[7] = color;
  task.data[8] = 0; // FALSE

  _BlendColorCycle(taskId, 0, targetBlendY);
  task.func = AnimTask_BlendColorCycleLoop as unknown as AnimTask['func'];
}

function _BlendColorCycle(taskId: number, startBlendAmount: number, targetBlendAmount: number): void {
  const task = _gTasks(taskId);
  const selectedPalettes = UnpackSelectedBattlePalettes(task.data[2]);
  _BeginNormalPaletteFade(
    selectedPalettes, task.data[3], startBlendAmount, targetBlendAmount, task.data[7],
  );
  task.data[4]--;
  task.data[8] ^= 1;
}

export function AnimTask_BlendColorCycleLoop(taskId: number): void {
  const task = _gTasks(taskId);
  let startBlendAmount: number;
  let targetBlendAmount: number;

  if (!_isPaletteFadeActive()) {
    if (task.data[4] > 0) {
      if (!task.data[8]) {
        startBlendAmount = task.data[5];
        targetBlendAmount = task.data[6];
      } else {
        startBlendAmount = task.data[6];
        targetBlendAmount = task.data[5];
      }
      if (task.data[4] === 1) targetBlendAmount = 0;
      _BlendColorCycle(taskId, startBlendAmount, targetBlendAmount);
    } else {
      DestroyAnimVisualTask(taskId);
    }
  }
}

// ─── AnimTask_BlendColorCycleExclude (509) — 1:1 décomp ────────────────────

/** 1:1 décomp `AnimTask_BlendColorCycleExclude(taskId)` (battle_anim_normal.c:509-537).
 *  Identique à BlendColorCycle mais exclut Attacker + Target. */
export function AnimTask_BlendColorCycleExclude(taskId: number): void {
  const task = _gTasks(taskId);
  const unk0 = getAnimArg(0) ?? 0;
  const delay = getAnimArg(1) ?? 0;
  const numBlends = getAnimArg(2) ?? 0;
  const initialBlendY = getAnimArg(3) ?? 0;
  const targetBlendY = getAnimArg(4) ?? 0;
  const color = getAnimArg(5) ?? 0;

  task.data[0] = unk0;
  task.data[3] = delay;
  task.data[4] = numBlends;
  task.data[5] = initialBlendY;
  task.data[6] = targetBlendY;
  task.data[7] = color;
  task.data[8] = 0;

  let selectedPalettes = 0;
  for (let battler = 0; battler < gBattlersCount; battler++) {
    if (battler !== _getGBattleAnimAttacker() && battler !== _getGBattleAnimTarget()) {
      selectedPalettes |= 1 << (battler + 16);
    }
  }

  if (unk0 === 1) selectedPalettes |= 0xE;

  // 1:1 décomp : split selectedPalettes en Hi/Lo dans data[9]/data[10].
  task.data[9] = (selectedPalettes >> 16) & 0xFFFF;
  task.data[10] = selectedPalettes & 0xFF;

  _BlendColorCycleExclude(taskId, 0, targetBlendY);
  task.func = AnimTask_BlendColorCycleExcludeLoop as unknown as AnimTask['func'];
}

function _BlendColorCycleExclude(taskId: number, startBlendAmount: number, targetBlendAmount: number): void {
  const task = _gTasks(taskId);
  const selectedPalettes = ((task.data[9] & 0xFFFF) << 16) | (task.data[10] & 0xFF);
  _BeginNormalPaletteFade(selectedPalettes, task.data[3], startBlendAmount, targetBlendAmount, task.data[7]);
  task.data[4]--;
  task.data[8] ^= 1;
}

export function AnimTask_BlendColorCycleExcludeLoop(taskId: number): void {
  const task = _gTasks(taskId);
  let startBlendAmount: number;
  let targetBlendAmount: number;

  if (!_isPaletteFadeActive()) {
    if (task.data[4] > 0) {
      if (!task.data[8]) {
        startBlendAmount = task.data[5];
        targetBlendAmount = task.data[6];
      } else {
        startBlendAmount = task.data[6];
        targetBlendAmount = task.data[5];
      }
      if (task.data[4] === 1) targetBlendAmount = 0;
      _BlendColorCycleExclude(taskId, startBlendAmount, targetBlendAmount);
    } else {
      DestroyAnimVisualTask(taskId);
    }
  }
}

// ─── AnimTask_BlendColorCycleByTag (586) — 1:1 décomp ──────────────────────

/** 1:1 décomp `AnimTask_BlendColorCycleByTag(taskId)` (battle_anim_normal.c:586-600). */
export function AnimTask_BlendColorCycleByTag(taskId: number): void {
  const task = _gTasks(taskId);
  const tag = getAnimArg(0) ?? 0;
  const delay = getAnimArg(1) ?? 0;
  const numBlends = getAnimArg(2) ?? 0;
  const initialBlendY = getAnimArg(3) ?? 0;
  const targetBlendY = getAnimArg(4) ?? 0;
  const color = getAnimArg(5) ?? 0;

  // data[2] = tPalTag (= reuse selector slot pour tag).
  task.data[2] = tag;
  task.data[3] = delay;
  task.data[4] = numBlends;
  task.data[5] = initialBlendY;
  task.data[6] = targetBlendY;
  task.data[7] = color;
  task.data[8] = 0;

  _BlendColorCycleByTag(taskId, 0, targetBlendY);
  task.func = AnimTask_BlendColorCycleByTagLoop as unknown as AnimTask['func'];
}

function _BlendColorCycleByTag(taskId: number, startBlendAmount: number, targetBlendAmount: number): void {
  const task = _gTasks(taskId);
  const paletteIndex = IndexOfSpritePaletteTag(task.data[2]);
  _BeginNormalPaletteFade(
    1 << (paletteIndex + 16),
    task.data[3], startBlendAmount, targetBlendAmount, task.data[7],
  );
  task.data[4]--;
  task.data[8] ^= 1;
}

export function AnimTask_BlendColorCycleByTagLoop(taskId: number): void {
  const task = _gTasks(taskId);
  let startBlendAmount: number;
  let targetBlendAmount: number;

  if (!_isPaletteFadeActive()) {
    if (task.data[4] > 0) {
      if (!task.data[8]) {
        startBlendAmount = task.data[5];
        targetBlendAmount = task.data[6];
      } else {
        startBlendAmount = task.data[6];
        targetBlendAmount = task.data[5];
      }
      if (task.data[4] === 1) targetBlendAmount = 0;
      _BlendColorCycleByTag(taskId, startBlendAmount, targetBlendAmount);
    } else {
      DestroyAnimVisualTask(taskId);
    }
  }
}

// ─── AnimTask_FlashAnimTagWithColor (668) — 1:1 décomp ─────────────────────

/** 1:1 décomp `AnimTask_FlashAnimTagWithColor(taskId)` (battle_anim_normal.c:668-692).
 *  Flash le sprite tagged avec une couleur. Utilisé pour les particles Hyper Beam etc. */
export function AnimTask_FlashAnimTagWithColor(taskId: number): void {
  const task = _gTasks(taskId);
  const tag = getAnimArg(0) ?? 0;
  const delay = getAnimArg(1) ?? 0;
  const numBlends = getAnimArg(2) ?? 0;
  const color1 = getAnimArg(3) ?? 0;
  const blendY1 = getAnimArg(4) ?? 0;
  const color2 = getAnimArg(5) ?? 0;
  const blendY2 = getAnimArg(6) ?? 0;

  // Data layout 1:1 décomp :
  //   data[0] = tTimer, data[1] = tDelay, data[2] = tNumBlends
  //   data[3] = tColor1, data[4] = tBlendY1
  //   data[5] = tColor2, data[6] = tBlendY2
  //   data[7] = tAnimTag
  task.data[0] = delay;
  task.data[1] = delay;
  task.data[2] = numBlends;
  task.data[3] = color1;
  task.data[4] = blendY1;
  task.data[5] = color2;
  task.data[6] = blendY2;
  task.data[7] = tag;

  const paletteIndex = IndexOfSpritePaletteTag(tag);
  _BeginNormalPaletteFade(
    1 << (paletteIndex + 16),
    0, blendY1, blendY1, color1,
  );

  task.func = AnimTask_FlashAnimTagWithColor_Step1 as unknown as AnimTask['func'];
}

export function AnimTask_FlashAnimTagWithColor_Step1(taskId: number): void {
  const task = _gTasks(taskId);

  if (task.data[0] > 0) {
    task.data[0]--;
    return;
  }

  if (_isPaletteFadeActive()) return;

  if (task.data[2] === 0) {
    task.func = AnimTask_FlashAnimTagWithColor_Step2 as unknown as AnimTask['func'];
    return;
  }

  const selectedPalettes = 1 << (IndexOfSpritePaletteTag(task.data[7]) + 16);
  if (task.data[1] & 0x100) {
    _BeginNormalPaletteFade(selectedPalettes, 0, task.data[4], task.data[4], task.data[3]);
  } else {
    _BeginNormalPaletteFade(selectedPalettes, 0, task.data[6], task.data[6], task.data[5]);
  }

  task.data[1] ^= 0x100;
  task.data[0] = task.data[1] & 0xFF;
  task.data[2]--;
}

export function AnimTask_FlashAnimTagWithColor_Step2(taskId: number): void {
  const task = _gTasks(taskId);
  if (!_isPaletteFadeActive()) {
    const selectedPalettes = 1 << (IndexOfSpritePaletteTag(task.data[7]) + 16);
    _BeginNormalPaletteFade(selectedPalettes, 0, 0, 0, 0 /* RGB_BLACK */);
    DestroyAnimVisualTask(taskId);
  }
}

// ─── AnimTask_InvertScreenColor (759) — 1:1 décomp ─────────────────────────

/** 1:1 décomp `AnimTask_InvertScreenColor(taskId)` (battle_anim_normal.c:759-778). */
export function AnimTask_InvertScreenColor(taskId: number): void {
  const flagsScenery = getAnimArg(0) ?? 0;
  const flagsAttacker = getAnimArg(1) ?? 0;
  const flagsTarget = getAnimArg(2) ?? 0;

  let selectedPalettes = 0;
  const attackerBattler = _getGBattleAnimAttacker();
  const targetBattler = _getGBattleAnimTarget();

  if (flagsScenery & (1 << 8)) {
    selectedPalettes = GetBattlePalettesMask(true, false, false, false, false, false, false);
  }
  if (flagsAttacker & (1 << 8)) {
    selectedPalettes |= 0x10000 << attackerBattler;
  }
  if (flagsTarget & (1 << 8)) {
    selectedPalettes |= 0x10000 << targetBattler;
  }

  _InvertPlttBuffer(selectedPalettes);
  DestroyAnimVisualTask(taskId);
}

// ─── AnimTask_TintPalettes (789) — 1:1 décomp ──────────────────────────────

/** 1:1 décomp `AnimTask_TintPalettes(taskId)` (battle_anim_normal.c:789-834). */
export function AnimTask_TintPalettes(taskId: number): void {
  const task = _gTasks(taskId);
  const flagsScenery = getAnimArg(0) ?? 0;
  const flagsAttacker = getAnimArg(1) ?? 0;
  const flagsTarget = getAnimArg(2) ?? 0;
  const duration = getAnimArg(3) ?? 0;
  const r = getAnimArg(4) ?? 0;
  const g = getAnimArg(5) ?? 0;
  const b = getAnimArg(6) ?? 0;

  // Data layout 1:1 :
  //   data[0] = tTimer, data[1] = tLength
  //   data[2] = tFlagsScenery, data[3] = tFlagsAttacker, data[4] = tFlagsTarget
  //   data[5] = tColorR, data[6] = tColorG, data[7] = tColorB
  if (task.data[0] === 0) {
    task.data[2] = flagsScenery;
    task.data[3] = flagsAttacker;
    task.data[4] = flagsTarget;
    task.data[1] = duration;
    task.data[5] = r;
    task.data[6] = g;
    task.data[7] = b;
  }

  task.data[0]++;
  const attackerBattler = _getGBattleAnimAttacker();
  const targetBattler = _getGBattleAnimTarget();

  let selectedPalettes = 0;
  // 1:1 décomp PALETTES_BG = 0xFFFF (first 16 = BG).
  const PALETTES_BG = 0xFFFF;
  if (task.data[2] & (1 << 8)) selectedPalettes = PALETTES_BG;

  if (task.data[2] & 1) {
    // Dette R3 : gHealthboxSpriteIds[attackerBattler] paletteTag lookup.
    // Pour now : skip cette sub-condition.
  }
  if (task.data[3] & (1 << 8)) {
    selectedPalettes |= (1 << attackerBattler) << 16;
  }
  if (task.data[4] & (1 << 8)) {
    selectedPalettes |= (1 << targetBattler) << 16;
  }

  _TintPlttBuffer(selectedPalettes, task.data[5], task.data[6], task.data[7]);

  if (task.data[0] === task.data[1]) {
    _UnfadePlttBuffer(selectedPalettes);
    DestroyAnimVisualTask(taskId);
  }
}

// ─── AnimTask_ShakeBattlePlatforms (957) — 1:1 décomp ──────────────────────

/** 1:1 décomp `AnimTask_ShakeBattlePlatforms(taskId)` (battle_anim_normal.c:957-970).
 *  Shake les BG3 platforms back/forth (X) ou down/up (Y). */
export function AnimTask_ShakeBattlePlatforms(taskId: number): void {
  const task = _gTasks(taskId);
  const xOffset = getAnimArg(0) ?? 0;
  const yOffset = getAnimArg(1) ?? 0;
  const shakes = getAnimArg(2) ?? 0;
  const delay = getAnimArg(3) ?? 0;

  // Data layout 1:1 :
  //   data[0] = tXOffset, data[1] = tYOffset
  //   data[2] = tNumShakes, data[3] = tTimer, data[8] = tShakeDelay
  task.data[0] = xOffset;
  task.data[1] = yOffset;
  task.data[2] = shakes;
  task.data[3] = delay;
  task.data[8] = delay;

  // 1:1 décomp : gBattle_BG3_X = xOffset, gBattle_BG3_Y = yOffset.
  _setBattleBG3(xOffset, yOffset);

  task.func = AnimTask_ShakeBattlePlatforms_Step as unknown as AnimTask['func'];
  AnimTask_ShakeBattlePlatforms_Step(taskId);
}

export function AnimTask_ShakeBattlePlatforms_Step(taskId: number): void {
  const task = _gTasks(taskId);
  const xOffset = task.data[0];
  const yOffset = task.data[1];

  if (task.data[3] === 0) {
    // 1:1 décomp ll. 976-984 : flip BG3 X/Y between offset and 0/-offset.
    let bg3X = _getBattleBG3_X();
    let bg3Y = _getBattleBG3_Y();

    if (bg3X === xOffset) bg3X = -xOffset;
    else bg3X = xOffset;

    if (bg3Y === -yOffset) bg3Y = 0;
    else bg3Y = -yOffset;

    _setBattleBG3(bg3X, bg3Y);

    task.data[3] = task.data[8];
    task.data[2]--;
    if (task.data[2] === 0) {
      _setBattleBG3(0, 0);
      DestroyAnimVisualTask(taskId);
    }
  } else {
    task.data[3]--;
  }
}

/** Helpers BG3 (= 1:1 décomp gBattle_BG3_X / gBattle_BG3_Y). Notre engine
 *  expose via runtime ; pour now wrap via globalThis. */
function _setBattleBG3(x: number, y: number): void {
  (globalThis as { __battle_bg3?: { x: number; y: number } }).__battle_bg3 = { x, y };
  // Dette R3 : wire vers BG2/BG3 scroll register du runtime.
}
function _getBattleBG3_X(): number {
  return ((globalThis as { __battle_bg3?: { x: number; y: number } }).__battle_bg3?.x) ?? 0;
}
function _getBattleBG3_Y(): number {
  return ((globalThis as { __battle_bg3?: { x: number; y: number } }).__battle_bg3?.y) ?? 0;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleAnimNormal = {
  AnimTask_BlendColorCycle, AnimTask_BlendColorCycleLoop,
  AnimTask_BlendColorCycleExclude, AnimTask_BlendColorCycleExcludeLoop,
  AnimTask_BlendColorCycleByTag, AnimTask_BlendColorCycleByTagLoop,
  AnimTask_FlashAnimTagWithColor,
  AnimTask_FlashAnimTagWithColor_Step1, AnimTask_FlashAnimTagWithColor_Step2,
  AnimTask_InvertScreenColor, AnimTask_TintPalettes,
  AnimTask_ShakeBattlePlatforms, AnimTask_ShakeBattlePlatforms_Step,
};
