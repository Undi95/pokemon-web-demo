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
import { SetSaveLocked } from '../../src/save';
import { FlagSet, VarSet } from '../../src/engine/script/script-vars';
import { HasValidSave, LoadGameSave, ResetSaveBlocks, SAVE_STATUS_OK } from '../../src/save';
import { SetDynamicWarp } from '../../src/engine/field/warp-system';
import { GetCurrentMap } from '../../src/load_save';
import { SetObjEventTemplateCoords } from '../../src/load_save';
import { UseContinueGameWarp, ClearContinueGameWarpStatus } from '../../src/load_save';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../../src/engine/save/save-block-state';
import { MALE, FEMALE } from '../runtime/decomp-globals';
import { NewGameInit } from '../../src/engine/save/new-game-flags';
import { GetPlayerNameString } from '../../src/text';
import { AddBagItem, DEBUG_ExpandBagToFit } from '../../src/engine/bag/bag';
import { DIR_SOUTH, DIR_NORTH } from '../../src/engine/field/direction-coords';
import { loadItemsTable, getAllItemKeys, type ItemDef } from '../runtime/data-tables';
import { createTestMon, GiveMonToPlayer, CalculatePlayerPartyCount } from '../../src/engine/battle/party-storage';
import { loadGameData, getSpeciesInfo, getExperienceForLevel } from '../../src/engine/data/game-data';
import { resolveDecompConstant } from '../runtime/decomp-constants';
import { SpeciesToNationalPokedexNum, GetSetPokedexFlag, FLAG_SET_SEEN, FLAG_SET_CAUGHT } from '../../src/engine/ui/pokedex-flags';

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
  // Pré-charge les game-data (= species info + experienceTables) AVANT
  // `decideBootMode`. CRITIQUE pour la party `?nointro`/`?debug` injectée dans
  // le preset synchrone (= createPokemonInstance lit `globalThis.__game_data`
  // pour `getExperienceForLevel(growthRate, level)` → currentExp initial 1:1
  // décomp `CreateMon`/`CalculateMonStats`). Sans ça la party de boot naît avec
  // currentExp=0 (= barre d'XP figée en combat/summary) + growthRate fallback.
  // Même exposition que battle-flow.ts (CB2_InitBattleInternal).
  try {
    await loadGameData();
    const gameData = await import('../../src/engine/data/game-data');
    (globalThis as { __game_data?: unknown }).__game_data = gameData;
  } catch (e) {
    console.warn('[boot-mode] preloadBootData: game-data load failed', e);
  }
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

/** Lit `?clock` depuis l'URL courante (= dev shortcut : preset complet + spawn
 *  DEVANT l'horloge murale (maison joueur 2F) face NORD, pour tester
 *  CB2_ViewWallClock en pressant A. SRAM bloquée comme les autres modes test). */
export function hasClockParam(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.has('clock');
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
  const existingNameStr = GetPlayerNameString();   // décodé ('' si vide) — détecte un VRAI nom
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
  // Nom de session : préserve un VRAI nom existant (joueur passé par l'intro/naming),
  // sinon nomme le perso debug 'UNDI'. ⚠️ Un nom VIDE est `[EOS]` (array truthy ≠
  // 'PLAYER') → l'ancien check le « préservait » à tort (= nom vide → fallback 'UNDI'
  // au START). On décode via GetPlayerNameString ('' si vide).
  const hadRealName = existingNameStr !== '' && existingNameStr !== 'PLAYER'
    && existingNameStr !== 'DEBUG' && existingNameStr !== 'UNDI';
  gSaveBlock2Ptr.playerGender = hadRealName ? existingGender : MALE;
  // 1:1 décomp `RunScriptImmediately(EventScript_ResetAllMapFlags)` au tout début
  // d'une nouvelle partie. Sans ça les NPCs cachés réapparaissent.
  NewGameInit();
  // Nom posé APRÈS NewGameInit, en STRING directe (PAS SetPlayerName : la charmap OW
  // n'est pas chargée au boot → encodeOwText donnerait [0,0,0,0]). GetPlayerNameString
  // gère la branche string. ?debug → 'UNDI' ; ?nointro resume garde sa vraie save (autre chemin).
  gSaveBlock2Ptr.playerName = (hadRealName ? existingNameStr : 'UNDI') as unknown as number[];
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
    // ⚠️ DEBUG : ×5 pour tester la scène d'évolution en boucle (Arcko preset
    // à 1 exp du Lv16 → 1 SUPER BONBON = évolution MASSKO immédiate).
    'ITEM_RARE_CANDY': 5,
  };
  for (const k of getAllItemKeys()) {
    AddBagItem(k, SPECIAL_QTY[k] ?? 1);
  }
  // Running shoes (= FLAG_SYS_B_DASH set par dad in
  // LittlerootTown_EventScript_SetReceivedRunningShoes scripts.inc:889).
  FlagSet('FLAG_SYS_B_DASH');
  // ⚠️ DEBUG : options confort test (user 2026-07-02) — VIT. TEXTE « 3 » =
  // OPTIONS_TEXT_SPEED_FAST (2) + FENETRE « TYPE 3 » = frameType index 2
  // (affichage 1-based du menu OPTIONS).
  gSaveBlock2Ptr.optionsTextSpeed = 2;
  gSaveBlock2Ptr.optionsWindowFrameType = 2;
  // Pokédex + Pokémon menu unlocks (= 1:1 décomp BuildNormalStartMenu requis
  // pour POKéDEX et POKéMON entries du start menu). Permet aussi de tester
  // ces écrans via ?nointro sans avoir à faire toute l'intro.
  // FLAG_SYS_POKEMON_GET set par BirchSendPokemonToPlayer (= 1ère capture starter).
  // FLAG_SYS_POKEDEX_GET set par Prof Birch après combat zigzagton.
  FlagSet('FLAG_SYS_POKEMON_GET');
  FlagSet('FLAG_SYS_POKEDEX_GET');
  // ⚠️ DEBUG ONLY : les 8 badges d'arène (FLAG_BADGE01..08_GET). Débloque les CS
  // gatées par badge (Surf=BADGE05, Strength=BADGE03, Waterfall=BADGE08, Dive=BADGE07,
  // Rock Smash=BADGE03, Cut=BADGE01, Fly=BADGE03, Flash=BADGE01) pour pouvoir tester
  // les field moves en jeu. 1:1 noms décomp (flags.h FLAG_BADGE0N_GET).
  for (let n = 1; n <= 8; n++) FlagSet(`FLAG_BADGE0${n}_GET`);
  // ⚠️ DEBUG ONLY : marque toutes les villes comme VISITÉES (FLAG_VISITED_*). Cohérent avec
  // l'état 8-badges fin de jeu (un joueur à 8 badges a parcouru tout Hoenn). En jeu réel ces
  // flags se posent à l'entrée de chaque ville (OnTransition pour Oldale/Littleroot… ou un
  // coord_event trigger VAR_TEMP_1==0 pour Mossdeep — VÉRIFIÉ en jeu : marcher sur la tuile
  // trigger pose le flag). Le preset spawn DIRECT (sans transition) ne les déclenche pas → on
  // les pose ici pour que la carte région (Vol) propose des destinations CITY_CANFLY 1:1
  // (region_map.c GetMapsecType : FlagGet(FLAG_VISITED_X) → CANFLY/CANTFLY).
  for (const city of [
    'LITTLEROOT_TOWN', 'OLDALE_TOWN', 'DEWFORD_TOWN', 'LAVARIDGE_TOWN', 'FALLARBOR_TOWN',
    'VERDANTURF_TOWN', 'PACIFIDLOG_TOWN', 'PETALBURG_CITY', 'SLATEPORT_CITY', 'MAUVILLE_CITY',
    'RUSTBORO_CITY', 'FORTREE_CITY', 'LILYCOVE_CITY', 'MOSSDEEP_CITY', 'SOOTOPOLIS_CITY',
    'EVER_GRANDE_CITY',
  ]) FlagSet(`FLAG_VISITED_${city}`);
  // ⚠️ DEBUG ONLY : point de réapparition par défaut = Centre de Clémenti-Ville/Algatia
  // (le preset spawn à Algatia/Mossdeep). En jeu réel, `setrespawn` le pose à l'entrée
  // de chaque Centre (vérifié). Le preset spawn DIRECT ne le pose pas → sans ça, perdre
  // un combat (whiteout) ne saurait pas où réapparaître. Cf. DoWhiteOut (overworld.c).
  (gSaveBlock1Ptr as { respawnLocation?: string }).respawnLocation = 'HEAL_LOCATION_MOSSDEEP_CITY';
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
  const playerHouseMap = gSaveBlock2Ptr.playerGender === FEMALE
    ? 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F'
    : 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
  SetObjEventTemplateCoords(playerHouseMap, 'LOCALID_PLAYERS_HOUSE_1F_MOM', 4, 5);
  // Note : movementType (FACE_UP) n'est pas persisté actuellement (= follow-up).
  // L'API `setObjectMovementType` n'existe pas encore sur gameState. Mom
  // gardera son MOVEMENT_TYPE_FACE_RIGHT du template jusqu'à ce qu'on étende.

  // ⚠️ DEBUG ONLY : ajouter Arcko Lv15 complet à la party (= testing Pokemon
  // screen pages, party UI, battle system, SCÈNE D'ÉVOLUTION). Pokémon "complet" :
  //   - Species : SPECIES_TREECKO (= ARCKO en FR, starter gen 3 Hoenn)
  //   - Level : 15, exp = exp(Lv16) - 1 → PILE sous le niveau d'évolution :
  //     1 SUPER BONBON = Lv16 = learn POURSUITE (MAX_MOVES → flux replace)
  //     + évolution MASSKO — recipe de test scène évo en 1 item (user 2026-07-02)
  //   - Held item : ITEM_MIRACLE_SEED (= "Grain Miracle" FR, +20% dmg Plante)
  //   - Ability : "Overgrow" (= Engrais FR, +50% Plante moves quand HP < 1/3)
  //   - Moves 4 : Pound, Leer, Absorb, Quick Attack (= learnset naturel Lv15 :
  //     1/1/6/11 — le set plein déclenche le replace-move à POURSUITE Lv16)
  //   - Nature : Hardy (= +0/-0, balanced pour tests)
  //   - IVs : 31/31/31/31/31/31 (= max, simplifie damage calc tests)
  //   - EVs : 0 (= un fresh starter)
  // Skip si party déjà populée (= user a déjà fait l'intro + caught Treecko).
  // 1:1 : compte gPlayerParty natif (CalculatePlayerPartyCount) plutôt que la
  // façade de vues `gSaveBlock1Ptr.playerParty`.
  if (CalculatePlayerPartyCount() === 0) {
    const arcko = createTestMon('SPECIES_TREECKO', 15, {
      heldItem: 'ITEM_MIRACLE_SEED',  // DEBUG fixture (Grain Miracle FR)
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: ['pound', 'leer', 'absorb', 'quickattack'],
    });
    // Exp pile sous le seuil Lv16 (Treecko = GROWTH_MEDIUM_SLOW → 2535 - 1 =
    // 2534) — calculée depuis les tables réelles, pas de valeur en dur.
    const growthRate = getSpeciesInfo('SPECIES_TREECKO')?.growthRate ?? 'GROWTH_MEDIUM_SLOW';
    arcko.experience = getExperienceForLevel(growthRate, 16) - 1;
    // ⚠️ DEBUG ONLY : mons valides (user : "ball + lieu, qu'ils soient
    // valide"). Starter Treecko 1:1 = reçu à la ROUTE 101 niv.5 (sauvetage
    // Birch). pokeball déjà = ITEM_POKE_BALL (CreateMon 1:1). gender/nature/ability
    // dérivent du PID (CreateMon), pas d'override.
    arcko.metLocation = (resolveDecompConstant('MAPSEC_ROUTE_101') as number | undefined) ?? 0;
    arcko.metLevel = 5;
    // ⚠️ DEBUG ONLY : statut BRÛLÉ pour tester l'anim slide fenêtre STATUT
    // du résumé (MED2, 1:1 PositionStatusSlidingWindow). STATUS1_BURN = 1<<4.
    arcko.status = (resolveDecompConstant('STATUS1_BURN') as number | undefined) ?? 0x10;
    GiveMonToPlayer(arcko);
    console.log(`[boot-mode] ?debug Arcko ajouté : Lv${arcko.level} ${arcko.nickname} (${arcko.hp}/${arcko.maxHP}) held=${arcko.heldItem}`);
    // ⚠️ DEBUG ONLY : Jirachi Lv100 pour tester party menu selection
    // (= 2ème mon = test cursor LEFT/RIGHT/UP/DOWN entre slot 0 et slots 1-5).
    const jirachi = createTestMon('SPECIES_JIRACHI', 100, {
      heldItem: 'ITEM_STAR_PIECE',
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
      moves: ['psychic', 'doomdesire', 'thunderbolt', 'rest'],
    });
    // ⚠️ DEBUG ONLY : lieu valide (mon de test). pokeball = ITEM_POKE_BALL.
    jirachi.metLocation = (resolveDecompConstant('MAPSEC_LITTLEROOT_TOWN') as number | undefined) ?? 0;
    GiveMonToPlayer(jirachi);
    console.log(`[boot-mode] ?debug Jirachi ajouté : Lv${jirachi.level} ${jirachi.nickname} (${jirachi.hp}/${jirachi.maxHP})`);
    // ⚠️ DEBUG ONLY : Leveinard (Chansey) — testeur des field moves de SOIN/utilitaire que les 3
    // field-mons ne couvrent pas. PAS un œuf (`isEgg=false`) : un œuf est SKIPPÉ par checkpartymove /
    // la détection field-move du party menu (= inutilisable pour tester). Lui donne les 2 moves
    // GENUINEMENT manquants dans l'équipe (Soin = MILK_DRINK + SOFT_BOILED, sur personne d'autre) +
    // Doux Parfum (3e, déjà sur Linoone mais pratique sur le soigneur). [Avant : œuf pour tester la
    // page résumé œuf — repassser `isEgg=true` + retirer `moves` si on veut re-tester cette page.]
    const leveinard = createTestMon('SPECIES_CHANSEY', 5, {
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: ['MOVE_SOFT_BOILED', 'MOVE_MILK_DRINK', 'MOVE_SWEET_SCENT'],
    });
    leveinard.metLevel = 5;
    leveinard.metLocation = (resolveDecompConstant('MAPSEC_LITTLEROOT_TOWN') as number | undefined) ?? 0;
    GiveMonToPlayer(leveinard);
    console.log(`[boot-mode] ?debug Leveinard ajouté (field-move tester : SOFT_BOILED/MILK_DRINK/SWEET_SCENT)`);

    // ⚠️ DEBUG ONLY : 3 mons « porteurs de CS + capacités hors-combat » pour tester les field
    // moves overworld (surf/strength/cut/rocksmash/fly/flash/waterfall/dive + sweet scent/dig/
    // teleport/secret power). Moves donnés en enums décomp ('MOVE_*' → makeMoveSlot 1:1). Couvre
    // les 8 CS + les principales capacités utilisables depuis le menu, réparties sans doublon.
    const fieldMons: Array<{ species: string; lvl: number; ability: string; moves: string[] }> = [
      // Léviator — eau : Surf, Cascade, Plongée, Force.
      { species: 'SPECIES_GYARADOS', lvl: 100, ability: 'Intimidate',
        moves: ['MOVE_SURF', 'MOVE_WATERFALL', 'MOVE_DIVE', 'MOVE_STRENGTH'] },
      // Linéon — utilitaire terre : Coupe, Éclate-Roc, Tunnel, Doux Parfum.
      { species: 'SPECIES_LINOONE', lvl: 100, ability: 'Pickup',
        moves: ['MOVE_CUT', 'MOVE_ROCK_SMASH', 'MOVE_DIG', 'MOVE_SWEET_SCENT'] },
      // Hélédelle — vol/divers : Vol, Flash, Téléport, Pouvoir Secret.
      { species: 'SPECIES_SWELLOW', lvl: 100, ability: 'Guts',
        moves: ['MOVE_FLY', 'MOVE_FLASH', 'MOVE_TELEPORT', 'MOVE_SECRET_POWER'] },
    ];
    for (const fm of fieldMons) {
      const mon = createTestMon(fm.species, fm.lvl, {
        // ability dérive du PID (CreateMon) — fm.ability conservé en doc seulement.
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        moves: fm.moves,
      });
      mon.metLocation = (resolveDecompConstant('MAPSEC_MOSSDEEP_CITY') as number | undefined) ?? 0;
      mon.metLevel = fm.lvl;
      GiveMonToPlayer(mon);
      console.log(`[boot-mode] ?debug field-mon ajouté : ${fm.species} Lv${fm.lvl} [${fm.moves.join(', ')}]`);
    }

    // ⚠️ DEBUG ONLY : enregistre les mons de l'équipe debug au Pokédex (VUS + CAPTURÉS).
    // En jeu réel, obtenir un mon pose FLAG_SET_SEEN (rencontre) puis FLAG_SET_CAUGHT
    // (capture, cf. battle_main/battle_script_commands) — le preset spawn DIRECT bypass le
    // combat → on pose les flags ici pour que le dex reflète l'équipe (sinon il resterait
    // vide → ne s'ouvrirait même pas, cf. garde « dex vide »). SET_SEEN d'abord (triple
    // write seen/seen1/seen2 anti-triche) puis SET_CAUGHT (owned).
    const debugDexSpecies = ['SPECIES_TREECKO', 'SPECIES_JIRACHI', 'SPECIES_CHANSEY',
      ...fieldMons.map(fm => fm.species)];
    for (const sp of debugDexSpecies) {
      const speciesNum = resolveDecompConstant(sp);
      if (speciesNum === undefined) continue;
      const national = SpeciesToNationalPokedexNum(speciesNum);
      if (!national) continue;
      GetSetPokedexFlag(national, FLAG_SET_SEEN);
      GetSetPokedexFlag(national, FLAG_SET_CAUGHT);
      console.log(`[boot-mode] ?debug flag dex VU+PRIS : ${sp} (national ${national})`);
    }
  }

  // Migration Pokémon (palier B) : la party DEBUG ci-dessus est créée via
  // GiveMonToPlayer, qui écrit désormais DIRECTEMENT dans gPlayerParty (la
  // source 1:1) et pose la façade block1.playerParty = vues. Plus besoin d'un
  // LoadPlayerParty explicite ici (il sert au RESUME de save via
  // CopyPartyAndObjectsFromSave).

  // 1:1 ROM : pas de save SRAM auto, le mode test vit en RAM tant que user
  // n'appuie pas SAUVER explicitement. User-flag : "Retire save auto SRAM des
  // mode test (les ?) comme ca on peut tester sans ecraser sa save".
  console.log(`[boot-mode] ?nointro preset : name='${gSaveBlock2Ptr.playerName ?? ''}' gender='${gSaveBlock2Ptr.playerGender === FEMALE ? 'FEMALE' : 'MALE'}' INTRO_STATE=6 (RAM-only, pas de save auto)`);
}

/** 1:1 décomp `CB2_ContinueSavedGame` (overworld.c:1705) : si CONTINUE_GAME_WARP
 *  est posé dans specialSaveWarpFlags (= GameClear post-Ligue → chambre du joueur),
 *  le Continue warpe vers `continueGameWarp` au lieu de la position sauvée, puis
 *  CLEAR le flag (ClearContinueGameWarpStatus). Bridge name-based :
 *  `__continueGameWarpMapId` (posé par SetContinueGameWarp, overworld.ts). */
function tryContinueGameWarpSpawn(): BootSpawn | null {
  if (!UseContinueGameWarp()) return null;
  ClearContinueGameWarpStatus();
  const b1 = gSaveBlock1Ptr as {
    continueGameWarp?: { x: number; y: number };
    __continueGameWarpMapId?: string;
  };
  const mapId = b1.__continueGameWarpMapId;
  const w = b1.continueGameWarp;
  if (!mapId || !w) return null;
  console.log(`[boot-mode] CONTINUE_GAME_WARP → ${mapId} (${w.x}, ${w.y})`);
  return { mapId, x: w.x, y: w.y, facing: DIR_SOUTH, mode: 'resume' };
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
  const isTestMode = hasDebugParam() || hasNoIntroParam() || hasTruckParam() || hasClockParam();
  SetSaveLocked(isTestMode);

  if (hasClockParam()) {
    // `?clock` = preset complet (comme ?debug) + spawn DEVANT l'horloge murale
    // de la maison du joueur (2F), face NORD → presser A déclenche
    // CB2_ViewWallClock. Gender-routé (Brendan/May). Pour itérer sur wallclock.c.
    applyNoIntroPreset();
    const houseMap = gSaveBlock2Ptr.playerGender === FEMALE
      ? 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F'
      : 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F';
    console.log(`[boot-mode] ?clock → preset complet, spawn ${houseMap} (5, 2) face NORD devant l'horloge (SRAM bloquée)`);
    return { mapId: houseMap, x: 5, y: 2, facing: DIR_NORTH, mode: 'nointro' };
  }

  if (hasDebugParam()) {
    // `?debug` = preset complet testing : tous les items, all flags.
    // Toujours appliqué (même si save existante = override en RAM only).
    applyNoIntroPreset();
    // Spawn ALGATIA (= MAP_MOSSDEEP_CITY, FR « ALGATIA ») : ville insulaire entourée d'océan
    // (connexions Route 124 gauche / Route 125 haut / Route 127 bas = eau surfable de tous côtés),
    // cyclisme autorisé → hub idéal pour tester surf/vélo/field moves. (28, 17) = devant le Centre
    // Pokémon (warp 28,16).
    console.log(`[boot-mode] ?debug → preset complet, spawn ALGATIA/Mossdeep (28, 17) (SRAM bloquée)`);
    return { mapId: 'MAP_MOSSDEEP_CITY', x: 28, y: 17, facing: DIR_SOUTH, mode: 'nointro' };
  }

  if (hasNoIntroParam()) {
    // `?nointro` = charger save existante directement (= 1:1 ROM Continue).
    // Pas de preset, pas de touch à la save : juste resume.
    const _resumedMap = (HasValidSave() && LoadGameSave() === SAVE_STATUS_OK) ? GetCurrentMap() : undefined;
    if (_resumedMap) {
      const cgw = tryContinueGameWarpSpawn();
      if (cgw) return cgw;
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
    const cgw = tryContinueGameWarpSpawn();
    if (cgw) return cgw;
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
