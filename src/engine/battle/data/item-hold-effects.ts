/**
 * battle/data/item-hold-effects.ts — 1:1 décomp `gItems[].holdEffect` +
 * `gItems[].holdEffectParam`.
 *
 * Source : `public/decomp/em/items.json` (= extracted by extract-decomp-all.mjs
 * from `data/items.h`). 377 items, keyed par symbolic name "ITEM_X".
 *
 * Notre port reconstruit deux arrays indexés par u16 item id pour lookup
 * O(1) au runtime battle.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/data/items.h` (= struct Item def)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/hold_effects.h`
 *     (= HOLD_EFFECT_* enum 0..51)
 */

import { resolveDecompConstant } from '../../../../harness/runtime/decomp-constants';

interface RawItem {
  holdEffect?: string;
  holdEffectParam?: number;
}

let _holdEffects: number[] = [];
let _holdEffectParams: number[] = [];
let _loaded = false;

/** 1:1 décomp `GetItemHoldEffect(item)` (item.c). */
export function GetItemHoldEffect(itemId: number): number {
  return _holdEffects[itemId] ?? 0;
}

/** 1:1 décomp `GetItemHoldEffectParam(item)` (item.c). */
export function GetItemHoldEffectParam(itemId: number): number {
  return _holdEffectParams[itemId] ?? 0;
}

/** Load item hold effects depuis public/decomp/em/items.json. */
export async function loadItemHoldEffects(): Promise<void> {
  if (_loaded) return;
  try {
    const resp = await fetch('/decomp/em/items.json');
    if (!resp.ok) {
      console.warn(`[item-hold-effects] fetch failed : ${resp.status}`);
      return;
    }
    const raw = await resp.json() as Record<string, RawItem>;
    const maxId = 378; // ITEM_ENIGMA_BERRY est l'un des derniers, marge.
    _holdEffects = new Array(maxId).fill(0);
    _holdEffectParams = new Array(maxId).fill(0);
    for (const [itemName, data] of Object.entries(raw)) {
      const id = resolveDecompConstant(itemName);
      if (typeof id !== 'number' || id < 0 || id >= maxId) continue;
      if (data.holdEffect) {
        const eff = resolveDecompConstant(data.holdEffect);
        if (typeof eff === 'number') _holdEffects[id] = eff;
      }
      if (data.holdEffectParam !== undefined) {
        _holdEffectParams[id] = data.holdEffectParam;
      }
    }
    _loaded = true;
    console.log(`[item-hold-effects] loaded ${Object.keys(raw).length} items`);
  } catch (e) {
    console.error('[item-hold-effects] load failed', e);
  }
}

/** Expose pour devtools. */
(globalThis as Record<string, unknown>).__itemHoldEffectsData = {
  get: (itemId: number) => ({
    holdEffect: GetItemHoldEffect(itemId),
    holdEffectParam: GetItemHoldEffectParam(itemId),
  }),
  isLoaded: () => _loaded,
};
