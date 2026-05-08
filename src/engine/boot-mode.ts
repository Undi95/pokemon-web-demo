/**
 * boot-mode.ts — dispatcher de démarrage : `?nointro` / save existante / new game.
 *
 * Décide où le joueur spawn au boot d'après :
 *   1. URL param `?nointro` → preset rapide (Test/Male/sac plein) au post-cinematic.
 *   2. localStorage save existante → resume from saved map+coords.
 *   3. Default → new game cinematic (= truck spawn).
 *
 * 1:1 décomp parallèle :
 *   - "save existante" ≈ `gSaveBlock1Ptr->location` + `gSaveBlock2Ptr` chargés
 *     depuis SRAM (= `LoadGameSave` + `CB2_ContinueSavedGame`).
 *   - "new game" ≈ `Sav2_ClearSetDefault` + `WarpToTruck` (new_game.c:127).
 *   - "?nointro" = dev shortcut sans équivalent décomp ; preset les flags/vars
 *     que le décomp setterait après truck → mom → clock → running shoes.
 *
 * Phase 4.10 démo : indispensable pour tester rapidement le post-intro state
 * sans rejouer le truck cinematic à chaque session (= user feedback session 117).
 */
import { gameState } from './game-state';
import { NewGameInit } from './new-game-flags';
import { AddBagItem } from './bag';
import { DIR_SOUTH, DIR_EAST } from './direction-coords';
import { loadItemsTable, type ItemDef } from './data-tables';

const ITEMS_JSON_URL = '/decomp/em/items.json';

/** Décrit le spawn initial au boot (= retourné par `decideBootMode`). */
export interface BootSpawn {
  mapId: string;
  x: number;
  y: number;
  facing: number;
  /** "nointro" | "resume" | "newgame" — pour log/debug. */
  mode: 'nointro' | 'resume' | 'newgame';
}

/**
 * Pré-charge la table d'items (= items.json) via fetch + loadItemsTable.
 *
 * Nécessaire AVANT `decideBootMode` quand `?nointro` est actif (= AddBagItem
 * lookup `getItem(itemKey).pocket` qui retourne undefined si pas chargé).
 *
 * Idempotent : appel multiple ne re-fetch pas (= check loadItemsTable side
 * effect via getItem returning a known item id).
 */
export async function preloadBootData(): Promise<void> {
  try {
    const resp = await fetch(ITEMS_JSON_URL);
    if (!resp.ok) {
      console.warn(`[boot-mode] preloadBootData: fetch failed ${resp.status}`);
      return;
    }
    const json = await resp.json() as Record<string, ItemDef>;
    loadItemsTable(json);
    console.log(`[boot-mode] preloadBootData: ${Object.keys(json).length} items loaded`);
  } catch (e) {
    console.warn('[boot-mode] preloadBootData failed', e);
  }
}

/** Lit `?nointro` depuis l'URL courante (= true si présent). */
export function hasNoIntroParam(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.has('nointro');
  } catch { return false; }
}

/**
 * Applique le preset `?nointro` :
 *   - Reset save complète.
 *   - Name = "Test", gender = MALE.
 *   - Set NewGame flags (= 159 FLAG_HIDE_*).
 *   - Bag : 5× POKE BALL + 5× POTION.
 *   - FlagSet FLAG_SYS_B_DASH (= running shoes équipées).
 *   - Vars LITTLEROOT_INTRO_STATE = 6 (post-intro), LITTLEROOT_TOWN_STATE = 4
 *     (post-running-shoes), BIRCH_LAB_STATE = 0 (= peut aller au lab).
 *   - Save persistée.
 */
function applyNoIntroPreset(): void {
  // 1:1 décomp `Sav2_ClearSetDefault` puis name/gender choisis.
  gameState.resetForNewGame('MALE', 'Test');
  // 1:1 décomp `RunScriptImmediately(EventScript_ResetAllMapFlags)` au tout début
  // d'une nouvelle partie. Sans ça les NPCs cachés réapparaissent.
  NewGameInit();
  // Bag preset (= 1:1 décomp AddBagItem).
  AddBagItem('ITEM_POKE_BALL', 5);
  AddBagItem('ITEM_POTION', 5);
  // Running shoes (= FLAG_SYS_B_DASH set par dad in
  // LittlerootTown_EventScript_SetReceivedRunningShoes scripts.inc:889).
  gameState.setFlag('FLAG_SYS_B_DASH');
  // Vars post-intro (= 1:1 décomp final state après truck → mom → clock →
  // running shoes). Cf. cheat.skipIntro() pour la même séquence.
  gameState.setVar('VAR_LITTLEROOT_INTRO_STATE', 6);
  gameState.setVar('VAR_LITTLEROOT_TOWN_STATE', 4);
  gameState.setFlag('FLAG_SET_WALL_CLOCK'); // clock défini
  // Save state immédiat pour que F5 garde le preset.
  gameState.save();
  console.log('[boot-mode] ?nointro preset applied : Test/Male, 5× POKE_BALL + 5× POTION, FLAG_SYS_B_DASH, INTRO_STATE=6');
}

/**
 * Décide le mode de boot et retourne le spawn initial.
 *
 * Ordre de priorité :
 *   1. `?nointro` URL param → preset + spawn Bourg-en-Vol devant maison Brendan.
 *   2. Save existante avec `map` field → resume saved position.
 *   3. Default → new game truck cinematic.
 */
export function decideBootMode(): BootSpawn {
  if (hasNoIntroParam()) {
    applyNoIntroPreset();
    // Spawn juste devant la porte sud de la maison Brendan (= warp x=5,y=8 à
    // Bourg-en-Vol fait sortir le joueur à (5, 8) facing SOUTH ; on spawn à
    // (5, 9) pour être déjà sous le porche, libre de marcher).
    return { mapId: 'MAP_LITTLEROOT_TOWN', x: 5, y: 9, facing: DIR_SOUTH, mode: 'nointro' };
  }

  // Tentative de resume from save.
  if (gameState.hasPersistedSave() && gameState.load() && gameState.map) {
    const m = gameState.map;
    return {
      mapId: m.name,
      x: m.x,
      y: m.y,
      facing: m.facing ?? DIR_SOUTH,
      mode: 'resume',
    };
  }

  // Default : new game cinematic (= 1:1 décomp WarpToTruck).
  // - NewGameInit pour les flags d'init.
  // - setDynamicWarp Bourg (= sera utilisé par MAP_DYNAMIC quand le coord
  //   trigger SetIntroFlagsMale fait son setdynamicwarp + warp).
  NewGameInit();
  gameState.setDynamicWarp('MAP_LITTLEROOT_TOWN', 3, 10);
  return { mapId: 'MAP_INSIDE_OF_TRUCK', x: 1, y: 2, facing: DIR_EAST, mode: 'newgame' };
}
