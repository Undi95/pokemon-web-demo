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

/** Lit `?truck` depuis l'URL courante (= dev shortcut pour tester la cinematic). */
export function hasTruckParam(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.has('truck');
  } catch { return false; }
}

/**
 * Applique le preset `?nointro` :
 *   - Si save existante : preserve playerName + gender (= continue from where).
 *     Sinon : default 'PLAYER' / MALE (= 1:1 décomp default placeholder).
 *   - Set NewGame flags (= 159 FLAG_HIDE_*).
 *   - Bag : 5× POKE BALL + 5× POTION.
 *   - FlagSet FLAG_SYS_B_DASH (= running shoes équipées).
 *   - Vars LITTLEROOT_INTRO_STATE = 6 (post-intro), LITTLEROOT_TOWN_STATE = 4.
 *   - Save persistée.
 *
 *  User feedback session 121 : "Aussi notre nom est remplacé par 'Test',
 *  surement un leftover des test etc, retire". Le hardcoded "Test" qui était
 *  appliqué à chaque ?nointro reset été source de confusion (= overwrite le
 *  nom Birch). Maintenant ?nointro preserve le nom existant si présent.
 */
function applyNoIntroPreset(): void {
  // Preserve playerName/gender existants si une save valide existait.
  const existingName = gameState.playerName;
  const existingGender = gameState.gender;
  // 1:1 décomp `Sav2_ClearSetDefault` mais on restore les fields preserved.
  gameState.reset();
  if (existingName && existingName !== 'PLAYER') {
    gameState.playerName = existingName;
    gameState.gender = existingGender;
  } else {
    // No prior save : default 1:1 décomp placeholder. User devrait passer par
    // l'intro proper pour set un vrai nom.
    gameState.playerName = 'PLAYER';
    gameState.gender = 'MALE';
  }
  // 1:1 décomp `RunScriptImmediately(EventScript_ResetAllMapFlags)` au tout début
  // d'une nouvelle partie. Sans ça les NPCs cachés réapparaissent.
  NewGameInit();
  // Bag preset (= 1:1 décomp AddBagItem).
  AddBagItem('ITEM_POKE_BALL', 5);
  AddBagItem('ITEM_POTION', 5);
  // Running shoes (= FLAG_SYS_B_DASH set par dad in
  // LittlerootTown_EventScript_SetReceivedRunningShoes scripts.inc:889).
  gameState.setFlag('FLAG_SYS_B_DASH');
  // Vars post-intro.
  gameState.setVar('VAR_LITTLEROOT_INTRO_STATE', 6);
  gameState.setVar('VAR_LITTLEROOT_TOWN_STATE', 4);
  gameState.setFlag('FLAG_SET_WALL_CLOCK');
  // 1:1 décomp `InsideOfTruck_EventScript_SetIntroFlagsMale` (scripts.inc:28-29) :
  // pose les flags HIDE_*_TRUCK pour que les sprites du camion ne soient pas
  // visibles dans Bourg-en-Vol après l'intro. Sans ces flags, les 2 trucks
  // (Brendan et May) apparaissent visibles sur la map → décor cassé.
  // Le preset ?nointro bypass le coord trigger qui set normalement ces flags.
  gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK');
  gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK');
  // 1:1 décomp `InsideOfTruck_EventScript_SetIntroFlags{Male,Female}`
  // (data/maps/InsideOfTruck/scripts.inc). Les deux maisons partagent le même
  // layout/objets — flags determinent qui est player_mom vs rival_mom.
  // Pattern :
  //   - Sa maison : show player_mom, hide rival_mom + rival_sibling
  //   - Maison rival : hide player_mom, show rival_mom + rival_sibling
  // Bug fix iter20 : on inversait MAYS_HOUSE_RIVAL_MOM ↔ BRENDANS_HOUSE_RIVAL_MOM.
  // Symptôme : les 2 maisons montraient les MEMES NPCs (= rival_mom partout, etc).
  if (gameState.gender === 'FEMALE') {
    // Player May → sa maison = MaysHouse, rival = Brendan dans BrendansHouse.
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_MOM');         // hide player_mom dans rival's house
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_MOM');       // hide rival_mom dans sa maison
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_SIBLING');   // hide rival's sibling chez elle
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL');    // post-intro pokeball gone
    gameState.setVar('VAR_LITTLEROOT_HOUSES_STATE_MAY', 1);
  } else {
    // Player Brendan → sa maison = BrendansHouse, rival = May dans MaysHouse.
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM');             // hide player_mom dans rival's house
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM');   // hide rival_mom dans sa maison
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING'); // hide rival's sibling
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL');
    gameState.setVar('VAR_LITTLEROOT_HOUSES_STATE_BRENDAN', 1);
  }
  // Vigoroth déménageurs : visibles pendant l'intro 1F seulement (= player coming
  // home). Une fois sortis (= ?nointro = post-intro), ils sont gone.
  // Pas spécifié dans SetIntroFlagsMale/Female mais après l'intro Maman talks
  // (`PlayersHouse_1F_EventScript_Mom`) ces flags sont set.
  // Cf. décomp data/scripts/players_house.inc lignes ~50.
  gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_1');
  gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_2');
  gameState.save();
  console.log(`[boot-mode] ?nointro preset : name='${gameState.playerName}' gender='${gameState.gender}' INTRO_STATE=6`);
}

/**
 * Décide le mode de boot et retourne le spawn initial.
 *
 * Ordre de priorité :
 *   1. `?nointro` URL param → preset + spawn Bourg-en-Vol devant maison Brendan.
 *   2. `?truck` URL param → dev shortcut : reset save + truck cinematic spawn.
 *   3. Save existante avec `map` field → resume saved position.
 *   4. Default → new game truck cinematic.
 */
export function decideBootMode(): BootSpawn {
  if (hasNoIntroParam()) {
    applyNoIntroPreset();
    // Spawn juste devant la porte sud de la maison Brendan (= warp x=5,y=8 à
    // Bourg-en-Vol fait sortir le joueur à (5, 8) facing SOUTH ; on spawn à
    // (5, 9) pour être déjà sous le porche, libre de marcher).
    return { mapId: 'MAP_LITTLEROOT_TOWN', x: 5, y: 9, facing: DIR_SOUTH, mode: 'nointro' };
  }

  if (hasTruckParam()) {
    // Dev shortcut : reset save + spawn truck pour tester la cinematic intro.
    gameState.reset();
    // Default identity : "PLAYER" / MALE (= 1:1 décomp placeholder pre-Birch).
    // Sans nom set, dialog "MAMAN: , on est là, chouchou!" affiche {PLAYER} vide.
    // En vrai flow, Birch speech naming overwrite ces defaults — mais ?truck
    // skip Birch donc on doit fournir un nom valide.
    gameState.playerName = 'PLAYER';
    gameState.gender = 'MALE';
    NewGameInit();  // = trainerId set par InitPlayerTrainerId (= u32 random)
    gameState.setDynamicWarp('MAP_LITTLEROOT_TOWN', 3, 10);
    gameState.save();
    console.log('[boot-mode] ?truck shortcut : save reset + truck spawn pour test cinematic');
    return { mapId: 'MAP_INSIDE_OF_TRUCK', x: 1, y: 2, facing: DIR_EAST, mode: 'newgame' };
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
