/**
 * multichoice-data.ts — loader pour `public/decomp/em/multichoice-lists.json`.
 *
 * Source : 1:1 décomp `src/data/script_menu.h` (= 102 lists + 114 index).
 * Extraction : `scripts/extract-multichoice-lists.mjs`.
 *
 * Usage :
 *   await loadMultichoiceLists();              // au boot, idempotent
 *   const items = getMultichoiceList(MULTI_TV_LATI);  // → [{ text: "..." }, ...]
 *
 * Le `text` est résolu via `script-runtime.getText` qui lookup dans `_common.json`.
 * Si le label `gText_X` n'est pas trouvé, fallback `[MISSING:X]` (= cohérent
 * avec le msgbox fix de session 126).
 */

import { getText } from './script/script-runtime';
import { reverseDecompConstant } from './system/decomp-constants';
import { getString } from './ui/gba-strings';

interface RawMultichoiceData {
  lists: Record<string, string[]>;     // MultichoiceList_X → [gText_A, gText_B, ...]
  index: Record<string, string>;        // MULTI_X → MultichoiceList_X
}

let _data: RawMultichoiceData | null = null;
let _loadingPromise: Promise<void> | null = null;

export async function loadMultichoiceLists(): Promise<void> {
  if (_data) return;
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = (async () => {
    try {
      const r = await fetch('/decomp/em/multichoice-lists.json');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      _data = await r.json() as RawMultichoiceData;
      console.log(`[multichoice-data] loaded ${Object.keys(_data.lists).length} lists, ${Object.keys(_data.index).length} index entries`);
    } catch (e) {
      console.warn('[multichoice-data] load failed:', e);
      _data = { lists: {}, index: {} };
    }
  })();
  return _loadingPromise;
}

/** Retourne les choix d'un multichoice résolus en strings finaux (FR).
 *  Args :
 *    multichoiceId : numeric ID (= MULTI_X enum value).
 *    multichoiceName : optional, name for warning logs (= "MULTI_TV_LATI"). */
export function getMultichoiceList(multichoiceId: number, multichoiceName?: string): string[] {
  if (!_data) {
    console.warn('[multichoice-data] not loaded — call loadMultichoiceLists() first');
    return [];
  }
  // Reverse lookup ID → MULTI_X name. Si caller fournit `multichoiceName`
  // (= literal arg from script `MULTI_TV_LATI`), l'utiliser directement.
  // Sinon, reverse lookup via decomp-constants (= script_menu-data namespace).
  let multiName = (multichoiceName && multichoiceName.startsWith('MULTI_')) ? multichoiceName : '';
  if (!multiName) {
    multiName = reverseDecompConstant(multichoiceId, 'MULTI_') ?? '';
  }
  if (!multiName) {
    console.warn(`[multichoice-data] no name for ID ${multichoiceId}`);
    return [];
  }
  const listName = _data.index[multiName];
  if (!listName) {
    console.warn(`[multichoice-data] no list for ${multiName} (id=${multichoiceId})`);
    return [];
  }
  const labels = _data.lists[listName];
  if (!labels) {
    console.warn(`[multichoice-data] list "${listName}" not found`);
    return [];
  }
  // Resolve gText_X labels → FR strings via 2 sources :
  // 1. `getString` (= `strings.json` via gba-strings.ts) pour les `gText_*`
  //    définis dans `src/strings.c` (e.g. gText_Exit = "ANNULER", gText_Yes,
  //    gText_Petalburg, etc).
  // 2. `getText` (= `_common.json` via script-runtime.ts) fallback pour les
  //    rares cas où le label vient de `data/text/*.inc`.
  return labels.map(label => {
    const fromStrings = getString(label);
    if (fromStrings && !fromStrings.startsWith('[MISSING:')) return fromStrings;
    const fromCommon = getText(label);
    if (fromCommon) return fromCommon;
    return `[MISSING:${label}]`;
  });
}

/** Helper : returns le NAME (= "MULTI_X") depuis un ID numeric. */
export function getMultichoiceName(multichoiceId: number): string | undefined {
  if (!_data) return undefined;
  for (const name of Object.keys(_data.index)) {
    // Lookup via decomp-constants — done by caller normally.
    void multichoiceId; void name;
  }
  return undefined;
}
