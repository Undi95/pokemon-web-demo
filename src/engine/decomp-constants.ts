/**
 * decomp-constants.ts — Flat lookup table for #define constants.
 *
 * Source de vérité : `src/engine/decomp-data/auto/include/constants/*-data.ts`
 * (= auto-extraits depuis `D:/Projet 1/decomps/pokeemeraude/include/constants/*.h`).
 *
 * Pourquoi ce module :
 *   - parseValue (script-opcodes.ts) doit résoudre des arg strings comme
 *     `OBJ_EVENT_GFX_RIVAL_MAY_NORMAL` → 105, `HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F`
 *     → 1, etc. Avant ce module, parseValue ne connaissait que MALE/FEMALE/
 *     LOCALID_* et fallback à 0 → setvar des constantes inconnues stockait 0
 *     (= bugs silencieux : VAR_OBJ_GFX_ID_0 = 0 = OBJ_EVENT_GFX_BRENDAN_NORMAL
 *     au lieu du sprite rival genre opposé).
 *   - Importer chaque module à la demande dans parseValue serait du round-trip
 *     async pour un appel sync ; un import statique de tout est trop lourd
 *     (= ~50 modules constants). Solution : importer SEULEMENT les modules
 *     dont les constantes apparaissent dans les scripts game flow critique.
 *
 * Coverage Phase 3.4 (= early game = title → Birch → naming → truck →
 * Littleroot → Mom → lab → Route 101 → starter → Route 103 → rival) :
 *   - event_objects (= OBJ_EVENT_GFX_*)
 *   - flags (= FLAG_* — used as args to checkflag/setflag/clearflag)
 *   - heal_locations (= HEAL_LOCATION_* — used by setrespawn)
 *   - items (= ITEM_* — used by additem/giveitem)
 *   - moves (= MOVE_* — used by trainer parties + special handlers)
 *   - songs (= MUS_*, SE_*, ME_* — used by playbgm/playse)
 *   - species (= SPECIES_* — used by setwildbattle/special spawns)
 *   - trainers (= TRAINER_* — used by trainerbattle)
 *   - trainer_classes (= TRAINER_CLASS_* — rare)
 *   - vars (= VAR_* IDs as numeric — used directly as halfword IDs sometimes)
 *
 * Étendre quand un script référence une constante non couverte : import le
 * module + add à `_constantsTable`. Log warning si parseValue retourne 0 pour
 * une string non-MALE/FEMALE/numeric (= aide à détecter manquant).
 */

import * as eventObjects from './decomp-data/auto/include/constants/event_objects-data';
import * as flags from './decomp-data/auto/include/constants/flags-data';
import * as items from './decomp-data/auto/include/constants/items-data';
import * as moves from './decomp-data/auto/include/constants/moves-data';
import * as songs from './decomp-data/auto/include/constants/songs-data';
import * as species from './decomp-data/auto/include/constants/species-data';
import * as trainers from './decomp-data/auto/include/constants/trainers-data';
import * as battle from './decomp-data/auto/include/constants/battle-data';
import * as global from './decomp-data/auto/include/constants/global-data';
import * as fieldEffects from './decomp-data/auto/include/constants/field_effects-data';
import * as opponents from './decomp-data/auto/include/constants/opponents-data';
import * as pokemon from './decomp-data/auto/include/constants/pokemon-data';
import * as vars from './decomp-data/auto/include/constants/vars-data';
// HEAL_LOCATION_* sont définis comme enum dans heal_locations.h mais pas
// extraits dans nos auto-data — pour setrespawn opcode, on accepte la string
// raw (= var stocke le hash, lookup ailleurs).

/** Flat constants table : merged maps from all imported namespaces. Built once
 *  at module load. Lookup order : last-wins (= rare collisions, e.g. ITEM_NONE
 *  vs MOVE_NONE — both 0). */
const _constantsTable: Record<string, number> = {};

function _mergeConstants(ns: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(ns)) {
    if (typeof value === 'number') {
      _constantsTable[key] = value;
    }
  }
}

_mergeConstants(eventObjects);
_mergeConstants(flags);
_mergeConstants(items);
_mergeConstants(moves);
_mergeConstants(songs);
_mergeConstants(species);
_mergeConstants(trainers);
_mergeConstants(battle);
_mergeConstants(global);
_mergeConstants(fieldEffects);
_mergeConstants(opponents);
_mergeConstants(pokemon);
_mergeConstants(vars);

/** Resolve a constant name to its numeric value. Returns undefined si pas trouvé.
 *  Caller decide quoi faire (= fallback 0, log warning, etc.). */
export function resolveDecompConstant(name: string): number | undefined {
  return _constantsTable[name];
}

/** Reverse lookup avec filtre prefix : value → name. Plusieurs namespaces ont
 *  des collisions (= ITEM_NONE = MOVE_NONE = SPECIES_NONE = 0), donc le prefix
 *  est obligatoire. Returns undefined si pas trouvé.
 *
 *  Use case principal : OBJ_EVENT_GFX_VAR_N résolution. Les rival NPCs ont
 *  graphics_id="OBJ_EVENT_GFX_VAR_0". Au spawn, on lit VAR_OBJ_GFX_ID_0 (=
 *  e.g. 105 = OBJ_EVENT_GFX_RIVAL_MAY_NORMAL) puis reverse lookup pour avoir
 *  la string "OBJ_EVENT_GFX_RIVAL_MAY_NORMAL" qui indexe le catalog graphics.
 *
 *  ```ts
 *  reverseDecompConstant(105, 'OBJ_EVENT_GFX_') // → 'OBJ_EVENT_GFX_RIVAL_MAY_NORMAL'
 *  ``` */
export function reverseDecompConstant(value: number, prefix: string): string | undefined {
  for (const [name, v] of Object.entries(_constantsTable)) {
    if (v === value && name.startsWith(prefix)) return name;
  }
  return undefined;
}

/** Total constants loaded — utile pour debug + sanity check. */
export const _constantsCount = Object.keys(_constantsTable).length;

console.log(`[decomp-constants] loaded ${_constantsCount} constants from 13 namespaces`);

if (typeof window !== 'undefined') {
  // Debug : window.dev.audit.constant("OBJ_EVENT_GFX_RIVAL_MAY_NORMAL") → 105
  // Useful pour vérifier qu'une const est résolvable.
  (globalThis as Record<string, unknown>).__decompConstants = _constantsTable;
}
