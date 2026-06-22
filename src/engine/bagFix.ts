/**
 * bagFix.ts — Module SHIM ESM technique + getter `bag` debug compat.
 *
 * **NON-1:1 décomp** : le décomp n'a PAS de class GameState. Il utilise
 * `gSaveBlock1Ptr` + `gSaveBlock2Ptr` (globals) + helpers (FlagSet/VarSet/etc)
 * direct. **Code engine : 0 sites utilisent une `gameState.X` class.**
 *
 * Ce module (= ex `game-state.ts`, renommé `bagFix.ts` 2026-05-23) est gardé
 * pour DEUX raisons :
 *   1. **Init ESM eager chain** : la chaîne `save-system → bag → bagFix`
 *      est essentielle au boot. Sans bagFix.ts qui charge la chaîne
 *      complète des helpers 1:1, `main.ts` top-level ne s'exécute jamais
 *      (= boot stall silencieux après decomp-constants loaded).
 *      Cause root : cycle ESM subtil non identifié dans phaser → scenes →
 *      engine modules. **Investigation déférée**.
 *
 *   2. **Debug compat `window.gameState.bag`** : getter virtuel composite
 *      qui expose les 5 fields séparés `gSaveBlock1Ptr.bagPocket_*` comme
 *      un objet `{ items, keyItems, pokeBalls, tmHm, berries }` pour
 *      l'inspection console browser. Le sac REAL = `gBagPockets[]` (1:1
 *      item.c) ; ce getter n'est qu'une convenience debug.
 *
 * Investigation : session 2026-05-23 (= tentatives suppression complète →
 * boot stall reproductible, options de fix = refactor architectural des
 * scenes ou patch Vite resolver — toutes haut risque, déférées).
 *
 * **Helpers 1:1 à utiliser dans le code engine (= zero dependence à ce
 * module)** :
 *   - `gSaveBlock1Ptr` / `gSaveBlock2Ptr` (save-block-state.ts)
 *   - `FlagSet/FlagClear/FlagGet/VarSet/VarGet` (script-vars.ts)
 *   - `GetCurrentMap/SetCurrentMap` (load_save.ts)
 *   - `GetDynamicWarp/SetDynamicWarp` (warp-system.ts)
 *   - `SaveGame/LoadGameSave/ResetSaveBlocks/HasValidSave` (save-system.ts)
 *   - `GiveMonToPlayer` (pokemon.ts)
 *   - `gBagPockets` + AddBagItem/RemoveBagItem/etc. (bag.ts) ← sac réel
 *   - `SetObjEventTemplateCoords/GetObjEventTemplateCoords` (load_save.ts ;
 *     1:1 overworld.c:490 — modifie `gSaveBlock1Ptr.objectEventTemplates[]`)
 *   - `FlagSet('__ITEM_BALL_TAKEN_<scriptLabel>')` (= 1:1 mécanisme item ball
 *     respawn flag de la décomp item_ball scripts)
 */

// ─── Side-effect imports : préservent l'init ESM eager chain ────────────────
import './pokemon/pokemon';
import './bag/bag';
import './save/save-system';
import '../load_save';
import './save/save-block-state';
import './script/script-vars';
import './field/warp-system';

import { gSaveBlock1Ptr } from './save/save-block-state';
import type { ItemSlot, Bag } from './bag/bag';

// ─── Debug compat : `window.gameState.bag` ──────────────────────────────────
//
// Getter virtuel composite — expose les 5 fields séparés
// `gSaveBlock1Ptr.bagPocket_*` comme un objet `{ items, keyItems, pokeBalls,
// tmHm, berries }` 1:1 ancien API. Pour debug console uniquement (= le code
// engine accède direct gBagPockets[]).

if (typeof window !== 'undefined') {
  (window as unknown as { gameState: { readonly bag: Bag } }).gameState = {
    get bag(): Bag {
      const b1 = gSaveBlock1Ptr as unknown as Record<string, ItemSlot[]>;
      return {
        items: b1.bagPocket_Items ?? [],
        keyItems: b1.bagPocket_KeyItems ?? [],
        pokeBalls: b1.bagPocket_PokeBalls ?? [],
        tmHm: b1.bagPocket_TMHM ?? [],
        berries: b1.bagPocket_Berries ?? [],
      };
    },
  };
}
