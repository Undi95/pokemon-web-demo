/**
 * src/data/pokemon/item_effects.ts — miroir 1:1 de `src/data/pokemon/item_effects.h`
 * (= `const u8 *const gItemEffectTable[]`, inclus par pokemon.c).
 *
 * Source de vérité : `public/decomp/em/item-effects-bytes.json` (extrait
 * 1:1 par scripts/extract-item-effects.mjs depuis
 * src/data/pokemon/item_effects.h ; gardé par npm run audit:item-effects).
 *
 * `getItemEffectBytes(itemId)` ≡ `gItemEffectTable[itemId - ITEM_POTION]`
 * (null = entrée NULL / hors table). La fonction lectrice
 * `GetItemEffectParamOffset` (pokemon.c:5311-5423) vit au foyer src/pokemon.ts.
 *
 * Module leaf (zéro import moteur) : consommé par l'AI dresseur objet
 * (ShouldUseItem) et bag-item-effects. Chargé au boot via loadItemEffects().
 */

import { ITEM_POTION } from '../../../include/constants/items';

interface RawItemEffects {
  _meta?: { itemPotion?: number; count?: number; nullEntries?: number };
  byId: Record<string, { name: string; size: number; bytes: number[] }>;
}

/** itemId absolu → octets `const u8 itemEffect[]` (≡ gItemEffectTable). */
let _byId: Map<number, number[]> = new Map();
let _loaded = false;

/** 1:1 décomp `gItemEffectTable[itemId - ITEM_POTION]`. null = NULL/hors. */
export function getItemEffectBytes(itemId: number): number[] | null {
  return _byId.get(itemId) ?? null;
}

export function isItemEffectsLoaded(): boolean {
  return _loaded;
}

/** Charge public/decomp/em/item-effects-bytes.json (async, boot). */
export async function loadItemEffects(): Promise<void> {
  if (_loaded) return;
  try {
    const resp = await fetch('/decomp/em/item-effects-bytes.json');
    if (!resp.ok) {
      console.warn(`[item-effects] fetch failed : ${resp.status}`);
      return;
    }
    const raw = (await resp.json()) as RawItemEffects;
    const map = new Map<number, number[]>();
    for (const [idStr, entry] of Object.entries(raw.byId || {})) {
      map.set(Number(idStr), entry.bytes.slice());
    }
    _byId = map;
    _loaded = true;
    console.log(
      `[item-effects] loaded ${_byId.size} items (= 1:1 décomp gItemEffectTable, base ITEM_POTION=${ITEM_POTION})`,
    );
  } catch (e) {
    console.error('[item-effects] load failed', e);
  }
}

/** Devtools / debug. (paramOffset : cf. __GetItemEffectParamOffset, pokemon.ts.) */
(globalThis as Record<string, unknown>).__itemEffectsData = {
  get: (itemId: number) => getItemEffectBytes(itemId),
  isLoaded: () => _loaded,
  count: () => _byId.size,
};
