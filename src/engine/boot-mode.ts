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
import { DIR_SOUTH } from './direction-coords';
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
  // ⚠️ HOTFIX 2026-05-09 : était à 6, ce qui fait que walking dans
  // une maison fire le coord trigger `PetalburgGymReport` (= map_script_2
  // VAR_LITTLEROOT_INTRO_STATE, 6, ...). State=7 = post-PetalburgGymReport,
  // disable retrigger. Cf. data/scripts/players_house.inc:141.
  // User report : "Chez May : Active quand même l'event de la TV".
  gameState.setVar('VAR_LITTLEROOT_INTRO_STATE', 7);
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
    // HOTFIX P1 : =2 au lieu de =1 → "déjà rencontré le rival's mom" → disable
    // OnFrame trigger `YoureNewNeighbor` qui sinon fire dans BrendansHouse
    // au moment où player y entre (= cross-house event leak signalé par user).
    gameState.setVar('VAR_LITTLEROOT_HOUSES_STATE_MAY', 2);
  } else {
    // Player Brendan → sa maison = BrendansHouse, rival = May dans MaysHouse.
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM');             // hide player_mom dans rival's house
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM');   // hide rival_mom dans sa maison
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING'); // hide rival's sibling
    gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL');
    // HOTFIX P1 : same as FEMALE branch — passe à 2 (= déjà rencontré).
    gameState.setVar('VAR_LITTLEROOT_HOUSES_STATE_BRENDAN', 2);
  }
  // Vigoroth déménageurs : visibles pendant l'intro 1F seulement (= player coming
  // home). Une fois sortis (= ?nointro = post-intro), ils sont gone.
  // Pas spécifié dans SetIntroFlagsMale/Female mais après l'intro Maman talks
  // (`PlayersHouse_1F_EventScript_Mom`) ces flags sont set.
  // Cf. décomp data/scripts/players_house.inc lignes ~50.
  gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_1');
  gameState.setFlag('FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_2');

  // 1:1 décomp `BrendansHouse_1F_EventScript_MoveMomToTV` (scripts.inc:37-40) :
  //   setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 4, 5
  //   setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
  // À INTRO_STATE=7 (= post-PetalburgGymReport), le _OnTransition n'a aucune
  // branch — Mom doit rester à la dernière position persistée par state 6.
  // En `?nointro` on skip state 6, donc on applique manuellement l'override.
  // Sans ça Mom spawn à la position map.json default (2, 6) FACE_RIGHT au lieu
  // de (4, 5) FACE_UP devant la TV.
  // Audit follow-up Issue 3 : memory/audit-2026-05-09-followup.md
  const playerHouseMap = gameState.gender === 'FEMALE'
    ? 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F'
    : 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
  gameState.setObjectXY(playerHouseMap, 'LOCALID_PLAYERS_HOUSE_1F_MOM', 4, 5);
  // Note : movementType (FACE_UP) n'est pas persisté actuellement (= follow-up).
  // L'API `setObjectMovementType` n'existe pas encore sur gameState. Mom
  // gardera son MOVEMENT_TYPE_FACE_RIGHT du template jusqu'à ce qu'on étende.

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
    // User feedback : "Le menu nointro lache dans le jeu avec des flag deja
    // actif, tu pux le modifier pour montrer l'écran nouveau jeu direct,
    // comme ça on peut recharger la save facile". Si une save valid existe
    // déjà, on skip l'applyNoIntroPreset (= ne touche pas la save) et on
    // résume direct via le save path (= 1:1 ROM Continue behavior).
    if (gameState.hasPersistedSave() && gameState.load() && gameState.map) {
      const m = gameState.map;
      console.log(`[boot-mode] ?nointro + save valide → resume ${m.name} (${m.x}, ${m.y})`);
      return {
        mapId: m.name, x: m.x, y: m.y,
        facing: m.facing ?? DIR_SOUTH, mode: 'resume',
      };
    }
    applyNoIntroPreset();
    // 1:1 décomp `setdynamicwarp MAP_LITTLEROOT_TOWN, 3, 10` (MALE) /
    // `setdynamicwarp MAP_LITTLEROOT_TOWN, 12, 10` (FEMALE)
    // (data/maps/InsideOfTruck/scripts.inc:33,46). Le decomp décale x=3 (vs
    // notre warp position 5,8) car setdynamicwarp set le RESPAWN tile, pas
    // la position spawn. Pour le simple ?nointro on spawn directement devant
    // la porte de la maison du player :
    //   MALE   → devant Brendan's House à (5, 9) facing SOUTH
    //   FEMALE → devant May's House à (14, 9) facing SOUTH
    // Sans la branch gender, FEMALE entrait dans BRENDAN's house qui n'a
    // pas son layout actif → bug visible (= mauvaise maison).
    const isFemale = gameState.gender === 'FEMALE';
    const spawnX = isFemale ? 14 : 5;
    return { mapId: 'MAP_LITTLEROOT_TOWN', x: spawnX, y: 9, facing: DIR_SOUTH, mode: 'nointro' };
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
    // 1:1 décomp `WarpToTruck` (new_game.c:127) → SetWarpDestination(..., -1, -1, -1) →
    // SetPlayerCoordsFromWarp() falls into "Invalid warpId and coords" branch
    // → `pos.x = mapLayout->width / 2; pos.y = mapLayout->height / 2;`
    // Truck map 5×5 → spawn at (2, 2). Facing = DIR_SOUTH (= 1:1
    // ResetInitialPlayerAvatarState).
    return { mapId: 'MAP_INSIDE_OF_TRUCK', x: 2, y: 2, facing: DIR_SOUTH, mode: 'newgame' };
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
  // - Bug fix 2026-05-09 : RESET save d'abord. Sans ça, si user avait une save
  //   `?nointro` avec VAR_LITTLEROOT_INTRO_STATE=7 + FLAG_HIDE_*_VIGOROTH_*
  //   set, ces vars/flags persistent → truck cinematic / Mom dialog ne fire
  //   pas (= leurs gates checkent INTRO_STATE=0..2). User report : "En nouvelle
  //   partie normale, en sortant du camion (y a plus de camion, plus de saut),
  //   plus de script de maman".
  //   1:1 décomp `Sav2_ClearSetDefault` (load_save.c) wipe Save Block 1/2
  //   complètement avant `NewGameInitData`.
  //   Note : on PRÉSERVE playerName/gender qui viennent de Birch speech (= déjà
  //   sync dans gameState par BirchRuntimeScene.transitionToOverworld()).
  const preservedName = gameState.playerName;
  const preservedGender = gameState.gender;
  gameState.reset();
  if (preservedName && preservedName !== 'PLAYER') {
    gameState.playerName = preservedName;
    gameState.gender = preservedGender;
  }
  // - NewGameInit pour les flags d'init.
  // - setDynamicWarp Bourg (= sera utilisé par MAP_DYNAMIC quand le coord
  //   trigger SetIntroFlagsMale fait son setdynamicwarp + warp).
  NewGameInit();
  gameState.setDynamicWarp('MAP_LITTLEROOT_TOWN', 3, 10);
  // 1:1 décomp `WarpToTruck` (new_game.c:127) → coords par défaut center map +
  // facing DIR_SOUTH (= ResetInitialPlayerAvatarState). User a A/B testé contre
  // ROM (session 124) : spawn ROM = (2, 2) DIR_SOUTH pour truck 5×5.
  return { mapId: 'MAP_INSIDE_OF_TRUCK', x: 2, y: 2, facing: DIR_SOUTH, mode: 'newgame' };
}
