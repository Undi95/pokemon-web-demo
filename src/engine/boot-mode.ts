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
import { SetSaveLocked } from './save/save-system';
import { FlagSet, VarSet } from './script/script-vars';
import { HasValidSave, LoadGameSave, ResetSaveBlocks, SAVE_STATUS_OK } from './save/save-system';
import { SetDynamicWarp } from './field/warp-system';
import { GetCurrentMap } from './save/load_save';
import { SetObjEventTemplateCoords } from './save/load_save';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './save/save-block-state';
import { MALE, FEMALE } from './decomp-globals';
import { NewGameInit } from './save/new-game-flags';
import { AddBagItem, DEBUG_ExpandBagToFit } from './bag/bag';
import { DIR_SOUTH } from './field/direction-coords';
import { loadItemsTable, getAllItemKeys, type ItemDef } from './data-tables';
import { createPokemonInstance, GiveMonToPlayer } from './pokemon/pokemon';

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

/** Lit `?debug` depuis l'URL courante (= true si présent).
 *  `?debug` = preset complet testing : tous les items du jeu, all flags
 *  (dex/pokemon/dash), Bourg-en-Vol devant la maison player.
 *  Renommage 2026-05-11 (ex-`?nointro` étendu): séparé en 2 params car le
 *  preset complet ≠ "skip intro et charger save". */
export function hasDebugParam(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.has('debug');
  } catch { return false; }
}

/** Lit `?nointro` depuis l'URL courante (= true si présent).
 *  `?nointro` = juste charger la save existante directement sans title screen
 *  (= Continue automatique). Si pas de save valide → fallback new game truck. */
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
  const existingName = gSaveBlock2Ptr.playerName;
  const existingGender = gSaveBlock2Ptr.playerGender;
  // 1:1 décomp : NewGameInitData ne reset PAS les options (seul le cold boot
  // Sav2_ClearSetDefault les met aux défauts). Préserver à travers reset()
  // comme playerName/gender (bug #5 : options reset devant le prof).
  // Snapshot direct depuis gSaveBlock2Ptr (= 1:1 décomp fields).
  const existingOptions = {
    textSpeed: gSaveBlock2Ptr.optionsTextSpeed ?? 0,
    battleSceneOff: gSaveBlock2Ptr.optionsBattleSceneOff ?? 0,
    battleStyle: gSaveBlock2Ptr.optionsBattleStyle ?? 0,
    sound: gSaveBlock2Ptr.optionsSound ?? 0,
    buttonMode: gSaveBlock2Ptr.optionsButtonMode ?? 0,
    windowFrameType: gSaveBlock2Ptr.optionsWindowFrameType ?? 0,
  };
  // 1:1 décomp `Sav2_ClearSetDefault` mais on restore les fields preserved.
  ResetSaveBlocks();
  gSaveBlock2Ptr.optionsTextSpeed = existingOptions.textSpeed;
  gSaveBlock2Ptr.optionsBattleSceneOff = existingOptions.battleSceneOff;
  gSaveBlock2Ptr.optionsBattleStyle = existingOptions.battleStyle;
  gSaveBlock2Ptr.optionsSound = existingOptions.sound;
  gSaveBlock2Ptr.optionsButtonMode = existingOptions.buttonMode;
  gSaveBlock2Ptr.optionsWindowFrameType = existingOptions.windowFrameType;
  if (existingName && existingName !== 'PLAYER') {
    gSaveBlock2Ptr.playerName = existingName;
    gSaveBlock2Ptr.playerGender = existingGender;
  } else {
    // No prior save : default 1:1 décomp placeholder. User devrait passer par
    // l'intro proper pour set un vrai nom.
    gSaveBlock2Ptr.playerName = 'PLAYER';
    gSaveBlock2Ptr.playerGender = MALE;
  }
  // 1:1 décomp `RunScriptImmediately(EventScript_ResetAllMapFlags)` au tout début
  // d'une nouvelle partie. Sans ça les NPCs cachés réapparaissent.
  NewGameInit();
  // ⚠️ DEBUG ONLY : agrandit les pockets (= override les caps BAG_*_COUNT
  // 1:1 décomp) pour pouvoir afficher TOUS les items du jeu. POCKET_ITEMS
  // a 207 items mais cap 30, POCKET_KEY_ITEMS 57 mais cap 30. Sans cet
  // expand, on droppe les items après le 30ème slot.
  DEBUG_ExpandBagToFit(256);
  // Bag preset : tous les items du jeu × 1. AddBagItem dispatch automatiquement
  // au bon pocket via getItem(key).pocket. Items en quantité > 1 pour tester
  // le rendu ×N right-align :
  const SPECIAL_QTY: Record<string, number> = {
    'ITEM_POTION': 5,
    'ITEM_SUPER_POTION': 3,
    'ITEM_FULL_HEAL': 2,
    'ITEM_REVIVE': 1,
    'ITEM_ANTIDOTE': 4,
    'ITEM_POKE_BALL': 5,
    'ITEM_GREAT_BALL': 3,
    'ITEM_ULTRA_BALL': 2,
    'ITEM_ORAN_BERRY': 5,
    'ITEM_CHERI_BERRY': 4,
  };
  for (const k of getAllItemKeys()) {
    AddBagItem(k, SPECIAL_QTY[k] ?? 1);
  }
  // Running shoes (= FLAG_SYS_B_DASH set par dad in
  // LittlerootTown_EventScript_SetReceivedRunningShoes scripts.inc:889).
  FlagSet('FLAG_SYS_B_DASH');
  // Pokédex + Pokémon menu unlocks (= 1:1 décomp BuildNormalStartMenu requis
  // pour POKéDEX et POKéMON entries du start menu). Permet aussi de tester
  // ces écrans via ?nointro sans avoir à faire toute l'intro.
  // FLAG_SYS_POKEMON_GET set par BirchSendPokemonToPlayer (= 1ère capture starter).
  // FLAG_SYS_POKEDEX_GET set par Prof Birch après combat zigzagton.
  FlagSet('FLAG_SYS_POKEMON_GET');
  FlagSet('FLAG_SYS_POKEDEX_GET');
  // Vars post-intro.
  // ⚠️ HOTFIX 2026-05-09 : était à 6, ce qui fait que walking dans
  // une maison fire le coord trigger `PetalburgGymReport` (= map_script_2
  // VAR_LITTLEROOT_INTRO_STATE, 6, ...). State=7 = post-PetalburgGymReport,
  // disable retrigger. Cf. data/scripts/players_house.inc:141.
  // User report : "Chez May : Active quand même l'event de la TV".
  VarSet('VAR_LITTLEROOT_INTRO_STATE', 7);
  VarSet('VAR_LITTLEROOT_TOWN_STATE', 4);
  FlagSet('FLAG_SET_WALL_CLOCK');
  // 1:1 décomp `InsideOfTruck_EventScript_SetIntroFlagsMale` (scripts.inc:28-29) :
  // pose les flags HIDE_*_TRUCK pour que les sprites du camion ne soient pas
  // visibles dans Bourg-en-Vol après l'intro. Sans ces flags, les 2 trucks
  // (Brendan et May) apparaissent visibles sur la map → décor cassé.
  // Le preset ?nointro bypass le coord trigger qui set normalement ces flags.
  FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK');
  FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK');
  // 1:1 décomp `InsideOfTruck_EventScript_SetIntroFlags{Male,Female}`
  // (data/maps/InsideOfTruck/scripts.inc). Les deux maisons partagent le même
  // layout/objets — flags determinent qui est player_mom vs rival_mom.
  // Pattern :
  //   - Sa maison : show player_mom, hide rival_mom + rival_sibling
  //   - Maison rival : hide player_mom, show rival_mom + rival_sibling
  // Bug fix iter20 : on inversait MAYS_HOUSE_RIVAL_MOM ↔ BRENDANS_HOUSE_RIVAL_MOM.
  // Symptôme : les 2 maisons montraient les MEMES NPCs (= rival_mom partout, etc).
  if (gSaveBlock2Ptr.playerGender === FEMALE) {
    // Player May → sa maison = MaysHouse, rival = Brendan dans BrendansHouse.
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_MOM');         // hide player_mom dans rival's house
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_MOM');       // hide rival_mom dans sa maison
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_SIBLING');   // hide rival's sibling chez elle
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL');    // post-intro pokeball gone
    // HOTFIX P1 : =2 au lieu de =1 → "déjà rencontré le rival's mom" → disable
    // OnFrame trigger `YoureNewNeighbor` qui sinon fire dans BrendansHouse
    // au moment où player y entre (= cross-house event leak signalé par user).
    VarSet('VAR_LITTLEROOT_HOUSES_STATE_MAY', 2);
  } else {
    // Player Brendan → sa maison = BrendansHouse, rival = May dans MaysHouse.
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM');             // hide player_mom dans rival's house
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM');   // hide rival_mom dans sa maison
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING'); // hide rival's sibling
    FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL');
    // HOTFIX P1 : same as FEMALE branch — passe à 2 (= déjà rencontré).
    VarSet('VAR_LITTLEROOT_HOUSES_STATE_BRENDAN', 2);
  }
  // Vigoroth déménageurs : visibles pendant l'intro 1F seulement (= player coming
  // home). Une fois sortis (= ?nointro = post-intro), ils sont gone.
  // Pas spécifié dans SetIntroFlagsMale/Female mais après l'intro Maman talks
  // (`PlayersHouse_1F_EventScript_Mom`) ces flags sont set.
  // Cf. décomp data/scripts/players_house.inc lignes ~50.
  FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_1');
  FlagSet('FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_2');

  // 1:1 décomp `BrendansHouse_1F_EventScript_MoveMomToTV` (scripts.inc:37-40) :
  //   setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 4, 5
  //   setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
  // À INTRO_STATE=7 (= post-PetalburgGymReport), le _OnTransition n'a aucune
  // branch — Mom doit rester à la dernière position persistée par state 6.
  // En `?nointro` on skip state 6, donc on applique manuellement l'override.
  // Sans ça Mom spawn à la position map.json default (2, 6) FACE_RIGHT au lieu
  // de (4, 5) FACE_UP devant la TV.
  // Audit follow-up Issue 3 : memory/audit-2026-05-09-followup.md
  const playerHouseMap = gSaveBlock2Ptr.playerGender === FEMALE
    ? 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F'
    : 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
  SetObjEventTemplateCoords(playerHouseMap, 'LOCALID_PLAYERS_HOUSE_1F_MOM', 4, 5);
  // Note : movementType (FACE_UP) n'est pas persisté actuellement (= follow-up).
  // L'API `setObjectMovementType` n'existe pas encore sur gameState. Mom
  // gardera son MOVEMENT_TYPE_FACE_RIGHT du template jusqu'à ce qu'on étende.

  // ⚠️ DEBUG ONLY : ajouter Arcko Lv5 complet à la party (= testing Pokemon
  // screen pages, party UI, battle system). Pokémon "complet" :
  //   - Species : SPECIES_TREECKO (= ARCKO en FR, starter gen 3 Hoenn)
  //   - Level : 5 (= 1:1 décomp starter au début du jeu)
  //   - Held item : ITEM_MIRACLE_SEED (= "Grain Miracle" FR, +20% dmg Plante)
  //   - Ability : "Overgrow" (= Engrais FR, +50% Plante moves quand HP < 1/3)
  //   - Moves 4 : Pound, Leer (= level-up natural), Absorb (Lv6 cheat), Quick
  //     Attack (= variety pour test type categories Normal/Physical)
  //   - Nature : Hardy (= +0/-0, balanced pour tests)
  //   - IVs : 31/31/31/31/31/31 (= max, simplifie damage calc tests)
  //   - EVs : 0 (= un fresh starter)
  // Skip si party déjà populée (= user a déjà fait l'intro + caught Treecko).
  if (gSaveBlock1Ptr.playerParty.length === 0) {
    const arcko = createPokemonInstance('SPECIES_TREECKO', 5, {
      heldItem: 'miracleseed',  // DEBUG fixture (= ITEM_MIRACLE_SEED)
      ability: 'Overgrow',
      nature: 'Hardy',
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: ['pound', 'leer', 'absorb', 'quickattack'],
    });
    // ⚠️ DEBUG ONLY : force gender FEMALE pour Arcko (= test gender symbol ♀
    // bleu dans party screen). Override le calc personality-based 1:1 décomp.
    arcko.monGender = 254;  // MON_FEMALE
    // ⚠️ DEBUG ONLY : mons valides (user : "ball + lieu, qu'ils soient
    // valide"). Starter Treecko 1:1 = reçu à la ROUTE 101 niv.5 (sauvetage
    // Birch). pokeball déjà = ITEM_POKE_BALL (createPokemonInstance 1:1).
    arcko.metLocation = 'MAPSEC_ROUTE_101';
    arcko.metLevel = 5;
    // ⚠️ DEBUG ONLY : statut BRÛLÉ pour tester l'anim slide fenêtre STATUT
    // du résumé (MED2, 1:1 PositionStatusSlidingWindow). ailment BRN=5
    // (summary-screen _extractMonData : mon.status==='BRN' → ailment 5).
    arcko.status = 'BRN';
    GiveMonToPlayer(arcko);
    console.log(`[boot-mode] ?debug Arcko ajouté : Lv${arcko.level} ${arcko.nickname} (${arcko.currentHp}/${arcko.maxHp}) gender=FEMALE held=${arcko.heldItem}`);
    // ⚠️ DEBUG ONLY : Jirachi Lv100 pour tester party menu selection
    // (= 2ème mon = test cursor LEFT/RIGHT/UP/DOWN entre slot 0 et slots 1-5).
    const jirachi = createPokemonInstance('SPECIES_JIRACHI', 100, {
      heldItem: 'starpiece',
      ability: 'Serene Grace',
      nature: 'Modest',
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
      moves: ['psychic', 'doomdesire', 'thunderbolt', 'rest'],
    });
    // Jirachi est MON_GENDERLESS (= mythical) — pas de symbol affiché.
    jirachi.monGender = 255;  // MON_GENDERLESS
    // ⚠️ DEBUG ONLY : lieu valide (mon de test). pokeball = ITEM_POKE_BALL.
    jirachi.metLocation = 'MAPSEC_LITTLEROOT_TOWN';
    GiveMonToPlayer(jirachi);
    console.log(`[boot-mode] ?debug Jirachi ajouté : Lv${jirachi.level} ${jirachi.nickname} (${jirachi.currentHp}/${jirachi.maxHp}) gender=GENDERLESS`);
    // ⚠️ DEBUG ONLY : Œuf de Leveinard (Chansey) — test page résumé œuf 1:1
    // (user : "pas pour le faire éclore, juste afficher sa page"). isEgg →
    // PrintEggInfo/State/Memo + page_info_egg bg + 1 page. friendship élevé
    // (œuf frais) → "mettre du temps à éclore". metLevel=0 (œuf).
    const egg = createPokemonInstance('SPECIES_CHANSEY', 5, {
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    });
    egg.isEgg = true;
    egg.friendship = 80;          // frais → gText_EggWillTakeALongTime
    egg.metLevel = 0;             // œuf
    egg.metLocation = 'MAPSEC_LITTLEROOT_TOWN';
    GiveMonToPlayer(egg);
    console.log(`[boot-mode] ?debug Œuf Leveinard ajouté (isEgg, test page résumé œuf)`);
  }

  // 1:1 ROM : pas de save SRAM auto, le mode test vit en RAM tant que user
  // n'appuie pas SAUVER explicitement. User-flag : "Retire save auto SRAM des
  // mode test (les ?) comme ca on peut tester sans ecraser sa save".
  console.log(`[boot-mode] ?nointro preset : name='${gSaveBlock2Ptr.playerName ?? ''}' gender='${gSaveBlock2Ptr.playerGender === FEMALE ? 'FEMALE' : 'MALE'}' INTRO_STATE=6 (RAM-only, pas de save auto)`);
}

/**
 * Décide le mode de boot et retourne le spawn initial.
 *
 * Ordre de priorité :
 *   1. `?debug` → preset complet (tous items, all flags) + spawn Bourg.
 *   2. `?nointro` → resume save existante (= skip title screen / Continue auto).
 *      Si pas de save → fallback new game truck.
 *   3. `?truck` → dev shortcut : reset save + truck cinematic spawn.
 *   4. Save existante avec `map` field → resume saved position.
 *   5. Default → new game truck cinematic.
 */
export function decideBootMode(): BootSpawn {
  // 1:1 user-flag "Le mode debug écrase ma save toujours, j'aimerai bien
  // tester sans péter ma save a chaque fois" : les 3 modes test
  // (?debug / ?nointro / ?truck) BLOQUENT toute écriture SRAM via
  // `SetSaveLocked(true)`. Toute appel à `gameState.save()` (= START menu
  // SAUVER, wallclock confirm, SavePlayerParty special, cheats console)
  // devient un no-op tant que le latch est ON. La SRAM existante est donc
  // intacte. Reload sans param test → `SetSaveLocked(false)` re-déverrouille.
  const isTestMode = hasDebugParam() || hasNoIntroParam() || hasTruckParam();
  SetSaveLocked(isTestMode);

  if (hasDebugParam()) {
    // `?debug` = preset complet testing : tous les items, all flags.
    // Toujours appliqué (même si save existante = override en RAM only).
    applyNoIntroPreset();
    const isFemale = gSaveBlock2Ptr.playerGender === FEMALE;
    const spawnX = isFemale ? 14 : 5;
    console.log(`[boot-mode] ?debug → preset complet, spawn (${spawnX}, 9) (SRAM bloquée)`);
    return { mapId: 'MAP_LITTLEROOT_TOWN', x: spawnX, y: 9, facing: DIR_SOUTH, mode: 'nointro' };
  }

  if (hasNoIntroParam()) {
    // `?nointro` = charger save existante directement (= 1:1 ROM Continue).
    // Pas de preset, pas de touch à la save : juste resume.
    const _resumedMap = (HasValidSave() && LoadGameSave() === SAVE_STATUS_OK) ? GetCurrentMap() : undefined;
    if (_resumedMap) {
      const m = _resumedMap;
      console.log(`[boot-mode] ?nointro + save valide → resume ${m.name} (${m.x}, ${m.y}) (SRAM bloquée)`);
      return {
        mapId: m.name, x: m.x, y: m.y,
        facing: m.facing ?? DIR_SOUTH, mode: 'resume',
      };
    }
    // Pas de save valide → fallback new game truck (= cinematic).
    console.log(`[boot-mode] ?nointro mais pas de save valide → fallback newgame (SRAM bloquée)`);
  }

  if (hasTruckParam()) {
    // Dev shortcut : reset save + spawn truck pour tester la cinematic intro.
    ResetSaveBlocks();
    // Default identity : "PLAYER" / MALE (= 1:1 décomp placeholder pre-Birch).
    // Sans nom set, dialog "MAMAN: , on est là, chouchou!" affiche {PLAYER} vide.
    // En vrai flow, Birch speech naming overwrite ces defaults — mais ?truck
    // skip Birch donc on doit fournir un nom valide.
    gSaveBlock2Ptr.playerName = 'PLAYER';
    gSaveBlock2Ptr.playerGender = MALE;
    NewGameInit();  // = trainerId set par InitPlayerTrainerId (= u32 random)
    SetDynamicWarp('MAP_LITTLEROOT_TOWN', 3, 10);
    // 1:1 ROM : pas de save SRAM auto (= user-flag, ne pas écraser sa save).
    console.log('[boot-mode] ?truck shortcut : reset RAM + truck spawn (RAM-only, pas de save auto)');
    // 1:1 décomp `WarpToTruck` (new_game.c:127) → SetWarpDestination(..., -1, -1, -1) →
    // SetPlayerCoordsFromWarp() falls into "Invalid warpId and coords" branch
    // → `pos.x = mapLayout->width / 2; pos.y = mapLayout->height / 2;`
    // Truck map 5×5 → spawn at (2, 2). Facing = DIR_SOUTH (= 1:1
    // ResetInitialPlayerAvatarState).
    return { mapId: 'MAP_INSIDE_OF_TRUCK', x: 2, y: 2, facing: DIR_SOUTH, mode: 'newgame' };
  }

  // 1:1 décomp `NewGameInitData` (overworld.c:1537) flow : post-Birch =
  // playerName/gender SET EN RAM par BirchRuntimeScene.transitionToOverworld,
  // map UNDEFINED (= signal "fresh new game, pas de resume").
  //
  // Si on appelait `gameState.load()` ci-dessous, il OVERWRITE le RAM avec la
  // SRAM précédente → resume à l'ancienne position. Pour respecter la
  // philosophie ROM "pas de save automatique" : la SRAM persiste UNIQUEMENT
  // jusqu'au prochain `SAUVER` explicite (= START menu ou battle frontier
  // confirm). En RAM on a fresh state, donc on skip resume + fall-through au
  // default new game path infra (= gameState.reset + NewGameInit + spawn truck
  // sans save). User flag : "PAS DE SAVE SANS L'INPUT SAUVER" — la SRAM
  // précédente reste intacte tant que user n'a pas explicitement écrasé.
  const cameFromBirch = gSaveBlock2Ptr.playerName !== undefined
                     && gSaveBlock2Ptr.playerName !== ''
                     && gSaveBlock2Ptr.playerName !== 'PLAYER'
                     && GetCurrentMap() === undefined;
  // Tentative de resume from save (= cold boot avec save existante, pas post-Birch).
  const _loadedMap = (!cameFromBirch && HasValidSave() && LoadGameSave() === SAVE_STATUS_OK) ? GetCurrentMap() : undefined;
  if (_loadedMap) {
    const m = _loadedMap;
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
  const preservedName = gSaveBlock2Ptr.playerName;
  const preservedGender = gSaveBlock2Ptr.playerGender;
  // 1:1 décomp : la NOUVELLE PARTIE = `NewGameInitData` (overworld.c:1537)
  // qui NE TOUCHE PAS aux options. Les options sont mises aux défauts UNE
  // SEULE FOIS au cold boot par `Sav2_ClearSetDefault` (intro.c:1156 =
  // ClearSav2 + SetDefaultOptions), puis écrites par le menu OPTION du
  // titlescreen, et `NewGameInitData` les PRÉSERVE. Notre `gameState.reset()`
  // = Sav2_ClearSetDefault (recrée emptySaveBlock2 = SetDefaultOptions) →
  // sans cette préservation, les options perso réglées au titlescreen sont
  // remises à zéro "devant le prof" (bug #5). On les capture/restaure comme
  // playerName/gender (= 1:1 NewGameInitData : options intactes).
  const preservedOptions = {
    textSpeed: gSaveBlock2Ptr.optionsTextSpeed ?? 0,
    battleSceneOff: gSaveBlock2Ptr.optionsBattleSceneOff ?? 0,
    battleStyle: gSaveBlock2Ptr.optionsBattleStyle ?? 0,
    sound: gSaveBlock2Ptr.optionsSound ?? 0,
    buttonMode: gSaveBlock2Ptr.optionsButtonMode ?? 0,
    windowFrameType: gSaveBlock2Ptr.optionsWindowFrameType ?? 0,
  };
  ResetSaveBlocks();
  gSaveBlock2Ptr.optionsTextSpeed = preservedOptions.textSpeed;
  gSaveBlock2Ptr.optionsBattleSceneOff = preservedOptions.battleSceneOff;
  gSaveBlock2Ptr.optionsBattleStyle = preservedOptions.battleStyle;
  gSaveBlock2Ptr.optionsSound = preservedOptions.sound;
  gSaveBlock2Ptr.optionsButtonMode = preservedOptions.buttonMode;
  gSaveBlock2Ptr.optionsWindowFrameType = preservedOptions.windowFrameType;
  if (preservedName && preservedName !== 'PLAYER') {
    gSaveBlock2Ptr.playerName = preservedName;
    gSaveBlock2Ptr.playerGender = preservedGender;
  }
  // - NewGameInit pour les flags d'init.
  // - setDynamicWarp Bourg (= sera utilisé par MAP_DYNAMIC quand le coord
  //   trigger SetIntroFlagsMale fait son setdynamicwarp + warp).
  NewGameInit();
  SetDynamicWarp('MAP_LITTLEROOT_TOWN', 3, 10);
  // 1:1 décomp `WarpToTruck` (new_game.c:127) → coords par défaut center map +
  // facing DIR_SOUTH (= ResetInitialPlayerAvatarState). User a A/B testé contre
  // ROM (session 124) : spawn ROM = (2, 2) DIR_SOUTH pour truck 5×5.
  return { mapId: 'MAP_INSIDE_OF_TRUCK', x: 2, y: 2, facing: DIR_SOUTH, mode: 'newgame' };
}
