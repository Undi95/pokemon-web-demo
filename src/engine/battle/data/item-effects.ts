/**
 * battle/data/item-effects.ts — 1:1 décomp `gItemEffectTable` +
 * `GetItemEffectParamOffset` (pokemon.c:5311-5423).
 *
 * Source de vérité : `public/decomp/em/item-effects-bytes.json` (extrait
 * 1:1 par scripts/extract-item-effects.mjs depuis
 * src/data/pokemon/item_effects.h ; gardé par npm run audit:item-effects).
 *
 * `getItemEffectBytes(itemId)` ≡ `gItemEffectTable[itemId - ITEM_POTION]`
 * (null = entrée NULL / hors table). `GetItemEffectParamOffset` = port
 * exact (offset de l'argument d'un effet dans le buffer itemEffect[]).
 *
 * Module leaf (zéro import moteur) : consommé par le sous-système AI
 * dresseur objet (ShouldUseItem). Chargé au boot via loadItemEffects().
 */

import {
  ITEM_POTION,
  ITEM_ENIGMA_BERRY,
} from '../../decomp-data/include/constants/items-data';
import {
  ITEM_EFFECT_ARG_START,
  ITEM4_PP_UP,
  ITEM4_REVIVE,
} from '../../decomp-data/include/constants/item_effects-data';

interface RawItemEffects {
  _meta?: { itemPotion?: number; count?: number; nullEntries?: number };
  byId: Record<string, { name: string; size: number; bytes: number[] }>;
}

/** itemId absolu → octets `const u8 itemEffect[]` (≡ gItemEffectTable). */
let _byId: Map<number, number[]> = new Map();
let _loaded = false;

/**
 * 1:1 décomp `gEnigmaBerries[battler].itemEffect`. La Baie Mystère
 * (Enigma Berry) est une fonctionnalité câble/event jamais configurée
 * dans ce port → SaveBlock vierge = itemEffect tout-à-zéro pour tous les
 * battlers. GetItemEffectParamOffset ne lit que [4]/[5] → résultat
 * identique 1:1 (effectFlags=0 → boucle sautée → retourne offset).
 */
const _enigmaBerryItemEffect: number[] = new Array(18).fill(0);

/** 1:1 décomp `gItemEffectTable[itemId - ITEM_POTION]`. null = NULL/hors. */
export function getItemEffectBytes(itemId: number): number[] | null {
  return _byId.get(itemId) ?? null;
}

export function isItemEffectsLoaded(): boolean {
  return _loaded;
}

/**
 * 1:1 décomp `u8 GetItemEffectParamOffset(u16 itemId, u8 effectByte,
 * u8 effectBit)` (pokemon.c:5311-5423). Retourne l'offset (≥
 * ITEM_EFFECT_ARG_START) de l'argument associé au bit `effectBit` du
 * byte `effectByte` de l'effet de `itemId`, ou 0 si absent.
 */
export function GetItemEffectParamOffset(
  itemId: number,
  effectByte: number,
  effectBit: number,
): number {
  let offset = ITEM_EFFECT_ARG_START;

  let temp = getItemEffectBytes(itemId);
  if (!temp && itemId !== ITEM_ENIGMA_BERRY) return 0;
  if (itemId === ITEM_ENIGMA_BERRY) temp = _enigmaBerryItemEffect;
  const itemEffect = temp as number[];

  let j: number;
  let effectFlags: number;

  for (let i = 0; i < ITEM_EFFECT_ARG_START; i++) {
    switch (i) {
      case 0:
      case 1:
      case 2:
      case 3:
        if (i === effectByte) return 0;
        break;
      case 4:
        effectFlags = itemEffect[4] | 0;
        if (effectFlags & ITEM4_PP_UP) effectFlags &= ~ITEM4_PP_UP & 0xFF;
        j = 0;
        while (effectFlags) {
          if (effectFlags & 1) {
            // 1:1 décomp : case 2 nettoie le bit REVIVE puis FALLTHROUGH
            // vers le corps commun de case 0/1/2/3 (test offset).
            if (j === 2) {
              if (effectFlags & (ITEM4_REVIVE >> 2)) {
                effectFlags &= ~(ITEM4_REVIVE >> 2) & 0xFF;
              }
            }
            if (j === 0 || j === 1 || j === 2 || j === 3) {
              if (i === effectByte && (effectFlags & effectBit)) return offset;
              offset++;
            } else if (j === 7) { // ITEM4_EVO_STONE
              if (i === effectByte) return 0;
            }
          }
          j++;
          effectFlags = (effectFlags >> 1) & 0xFF;
          if (i === effectByte) effectBit = (effectBit >> 1) & 0xFF;
        }
        break;
      case 5:
        effectFlags = itemEffect[5] | 0;
        j = 0;
        while (effectFlags) {
          if (effectFlags & 1) {
            if (j >= 0 && j <= 6) {
              if (i === effectByte && (effectFlags & effectBit)) return offset;
              offset++;
            } else if (j === 7) { // ITEM5_FRIENDSHIP_HIGH
              if (i === effectByte) return 0;
            }
          }
          j++;
          effectFlags = (effectFlags >> 1) & 0xFF;
          if (i === effectByte) effectBit = (effectBit >> 1) & 0xFF;
        }
        break;
    }
  }

  return offset;
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

/** Devtools / debug. */
(globalThis as Record<string, unknown>).__itemEffectsData = {
  get: (itemId: number) => getItemEffectBytes(itemId),
  paramOffset: (itemId: number, eByte: number, eBit: number) =>
    GetItemEffectParamOffset(itemId, eByte, eBit),
  isLoaded: () => _loaded,
  count: () => _byId.size,
};
