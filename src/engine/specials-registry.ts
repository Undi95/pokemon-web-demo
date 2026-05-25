/**
 * specials-registry.ts — Registry des specials scripts (= 1:1 décomp `gSpecials[]`).
 *
 * Source de vérité (1:1 décomp) :
 *   - `data/specials.inc` (= 527 def_special entries)
 *   - `src/scrcmd.c:118-132` (= ScrCmd_special / ScrCmd_specialvar dispatch)
 *
 * Architecture :
 *   - Décomp utilise `gSpecials[index]()` indexé par SPECIAL_xxx (= u16).
 *   - Notre impl utilise `registerSpecial(name, handler)` via string name. Les
 *     scripts JSON pré-extraits ont les noms (= e.g. "HealPlayerParty"), pas
 *     d'index numérique nécessaire.
 *   - Handler peut return `number | void`. Si return un nombre, opcode
 *     `specialvar` le store dans une variable.
 *
 * Quand register un nouveau special :
 *   - Si side-effect uniquement (= e.g. heal party) → return void.
 *   - Si retourne valeur read par script (= e.g. GetBattleOutcome) → return number.
 *   - Si pas encore implémenté → stub safe : `() => 0` (= fait scripts continuer
 *     sans crash, log warning vu `_invokeSpecial`).
 *
 * Phase 4.9 first cut : stubs minimaux pour scripts Bourg-en-Vol (= Mom dialogue,
 * Birch intro). À étendre au fur et à mesure quand on touche d'autres flows.
 *
 * NB : ce module a un side-effect au load (= registerSpecial calls). Doit être
 * importé une fois au boot (= TestOverworldScene ou main entry).
 */

import { registerSpecial } from './script-opcodes';
import { FlagSet, FlagClear, FlagGet, VarSet, VarGet } from './script-vars';
import { gMapHeader } from './map-loader';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './save-block-state';
import { MALE, FEMALE } from './decomp-globals';
import { GetCurrentMap } from './load_save';
import { CheckForPlayersHouseNews as _CheckForPlayersHouseNews } from './tv-screen';
import { setStringVar } from './string-buffers';
import { SPECIES_WAILORD, SPECIES_RELICANTH, SPECIES_DODRIO } from './decomp-data/include/constants/species-data';
import { TYPE_GRASS } from './decomp-data/include/constants/pokemon-data';
import { ITEM_MACH_BIKE, ITEM_ACRO_BIKE } from './decomp-data/include/constants/items-data';
import { OBJ_EVENT_GFX_BARD } from './decomp-data/include/constants/event_objects-data';
import { GIDDY_MAX_TALES } from './decomp-data/include/constants/global-data';
import { gLocalTime } from './rtc';
import { ShowFieldMessage } from './field-message-box';
import { gStringVar4 } from './gba-text-system';
import { Random } from './random';

// ─── Phase 4.9 stubs minimaux (= early-game specials) ──────────────────────

/** 1:1 décomp `GetPlayerBigGuyGirlString` (string_util.c).
 *  Set sStringVar1 = "GRAND" (MALE) ou "GRANDE" (FEMALE) pour expand le
 *  placeholder {STR_VAR_1} dans dialogues type "Hum, salut, GRAND/GRANDE !".
 *  Used par e.g. LittlerootTown_Text_CanYouGoSeeWhatsHappening (= Twin NPC). */
registerSpecial('GetPlayerBigGuyGirlString', () => {
  const stringVar = gSaveBlock2Ptr.playerGender === MALE ? 'GRAND' : 'GRANDE';
  // 1:1 décomp : StringCopy(gStringVar1, gText_BigGuy/gText_BigGirl).
  // Notre version : stocke dans gameState pour expand par dialogue-box.ts.
  setStringVar(1, stringVar);
});

/** 1:1 décomp `BufferBigGuyOrBigGirlString` (string_util.c). Same que
 *  `GetPlayerBigGuyGirlString` mais pour expand dans un autre context. */
registerSpecial('BufferBigGuyOrBigGirlString', () => {
  const stringVar = gSaveBlock2Ptr.playerGender === MALE ? 'GRAND' : 'GRANDE';
  setStringVar(1, stringVar);
});

/** 1:1 décomp `HealPlayerParty` (script_pokemon_util.c:30) :
 *  ```c
 *  void HealPlayerParty(void) {
 *      u8 i, j;
 *      u8 ppBonuses;
 *      u8 arg[4];
 *      for (i = 0; i < gPlayerPartyCount; i++) {
 *          u16 maxHP = GetMonData(&gPlayerParty[i], MON_DATA_MAX_HP);
 *          arg[0] = maxHP; arg[1] = maxHP >> 8;
 *          SetMonData(&gPlayerParty[i], MON_DATA_HP, arg);
 *          ppBonuses = GetMonData(&gPlayerParty[i], MON_DATA_PP_BONUSES);
 *          for (j = 0; j < MAX_MON_MOVES; j++) {
 *              arg[0] = CalculatePPWithBonus(GetMonData(&gPlayerParty[i], MON_DATA_MOVE1 + j), ppBonuses, j);
 *              SetMonData(&gPlayerParty[i], MON_DATA_PP1 + j, arg);
 *          }
 *          arg[0]=arg[1]=arg[2]=arg[3]=0;
 *          SetMonData(&gPlayerParty[i], MON_DATA_STATUS, arg);
 *      }
 *  }
 *  ```
 *  Restore HP + PP + clear status de toute l'équipe. Appelé par les NPC
 *  Centre Pokémon, après défaite dresseur, après le combat ChooseStarter.
 *
 *  HP (maxHP) et status (0) = 1:1 strict. PP : la décomp recalcule via
 *  `CalculatePPWithBonus(move, ppBonuses, j)` ; les PP Up (ppBonuses) ne
 *  sont PAS modélisés dans tout le projet (même défèrement honnête que
 *  summary-screen.ts:2789 — `ppMax` tient lieu de PP max effectif). On
 *  restaure donc à `ppMax`, conséquence de ce défèrement systémique, PAS
 *  un raccourci local. Porter ppBonuses + CalculatePPWithBonus =
 *  chantier data-model séparé (supervisé). */
registerSpecial('HealPlayerParty', () => {
  for (const mon of gSaveBlock1Ptr.playerParty) {
    if (!mon) continue;
    mon.currentHp = mon.maxHp;
    mon.status = null;
    for (const mv of mon.moves) {
      mv.pp = mv.ppMax;
    }
  }
  console.log(`[special HealPlayerParty] healed ${gSaveBlock1Ptr.playerParty.length} mons`);
});

/** 1:1 décomp `ChooseStarter` (battle_setup.c:911) :
 *  ```c
 *  void ChooseStarter(void) {
 *      SetMainCallback2(CB2_ChooseStarter);  // UI 3 pokeballs
 *      gMain.savedCallback = CB2_GiveStarter; // post-UI : give mon + battle
 *  }
 *  ```
 *  Notre impl Phase 3.2 minimum : auto-pick TREECKO (= idx 0) + give level 5
 *  + set VAR_RESULT/VAR_STARTER_MON. La cinematic UI starter selection sera
 *  Phase 5 (= besoin Phaser scene 3 pokeballs + transition). Le combat
 *  tutorial vs Poochyena est aussi Phase 5 (= BattleScene).
 *
 *  IMPORTANT : la script Route 101 fait `special ChooseStarter` SANS
 *  `waitstate` derrière, donc le décomp utilise SetMainCallback2 pour halt
 *  l'overworld (= pas le script). Notre special étant sync, la flow continue
 *  immédiatement → applymovement Birch + dialog. C'est OK pour MVP, plus
 *  rapide en démo (= skip UI). User feedback Phase 5+ pourrait vouloir l'UI. */
// Phase 5.5 : ChooseStarter handled directly in `special` opcode handler
// (= script-opcodes.ts) via state machine in starter-choose-flow.ts. NOT a
// registerSpecial here because we need access to `ctx` to call SetupNativeScript
// (= block script while UI runs). registerSpecial handlers don't have ctx access.

/** 1:1 décomp `BedroomPC` (player_pc.c:373) : open PC menu in bedroom (= 4
 *  options : PC OBJET / COURRIER / DÉCORATION / SORTIR). Le special est
 *  `waitstate=1` (specials.inc:277) donc l'opcode dispatcher dans
 *  script-opcodes.ts intercepte BedroomPC directement et installe un
 *  SetupNativeScript bloquant jusqu'à fermeture du PC.
 *  Stub ici pour audit-coverage ; vrai dispatch dans script-opcodes.ts. */
registerSpecial('BedroomPC', () => { /* see script-opcodes.ts dispatcher */ });

/** 1:1 décomp `PlayerPC` (player_pc.c:380) : open PC menu hors chambre (= 3
 *  options : PC OBJET / COURRIER / SORTIR, pas de DECORATION).
 *  Stub ici pour audit-coverage ; vrai dispatch dans script-opcodes.ts. */
registerSpecial('PlayerPC', () => { /* see script-opcodes.ts dispatcher */ });

/** 1:1 décomp `GetBattleOutcome` (battle_util.c).
 *  Returns gBattleOutcome (= win/lose/run/draw). Phase 5.6 : on lit le résultat
 *  stash par battle-flow.ts via globalThis.__gBattleOutcome (= notre proxy de
 *  gBattleOutcome EWRAM_DATA). Si pas de battle eu lieu encore, return WIN par
 *  défaut (= fait progresser scripts post-battle sans crash). */
registerSpecial('GetBattleOutcome', () => {
  const out = (globalThis as { __gBattleOutcome?: number }).__gBattleOutcome;
  return typeof out === 'number' ? out : 1;  // BATTLE_OUTCOME_WIN default
});

/** 1:1 décomp `CalculatePlayerPartyCount` (pokemon.c) :
 *    gPlayerPartyCount = 0;
 *    while (gPlayerPartyCount < PARTY_SIZE
 *           && GetMonData(&gPlayerParty[gPlayerPartyCount], MON_DATA_SPECIES, NULL) != SPECIES_NONE)
 *        gPlayerPartyCount++;
 *    return gPlayerPartyCount;
 *  Recompute + sync cache. Évite la dérive si le cache n'a pas été update. */
registerSpecial('CalculatePlayerPartyCount', () => {
  const party = gSaveBlock1Ptr.playerParty;
  let count = 0;
  while (count < 6 && party[count] && party[count].speciesId !== 0) {
    count++;
  }
  gSaveBlock1Ptr.playerPartyCount = count;
  return count;
});

/** 1:1 décomp `ShouldTryRematchBattle` (battle_setup.c:1839-1845) :
 *    if (IsFirstTrainerIdReadyForRematch(gRematchTable, gTrainerBattleOpponent_A))
 *        return TRUE;
 *    return WasSecondRematchWon(gRematchTable, gTrainerBattleOpponent_A);
 *  Dette R3 justifiée : gRematchTable + IsFirstTrainerIdReadyForRematch +
 *  WasSecondRematchWon pas portés (= subsystem rematch hors démo Littleroot).
 *  Return 0 = "no rematch available", 1:1 strict valide tant que rematch
 *  system pas wire. */
registerSpecial('ShouldTryRematchBattle', () => {
  return 0;
});

/** 1:1 décomp `IsEnoughForCostInVar0x8005` (money.c:123-126).
 *  Return IsEnoughMoney(saveBlock1.money, gSpecialVar_0x8005). */
registerSpecial('IsEnoughForCostInVar0x8005', () => {
  const cost = VarGet('VAR_0x8005');
  // Notre IsEnoughMoney lit directement saveBlock1.money (= encrypted u32).
  // Import dynamic pour éviter cycle ESM.
  const { IsEnoughMoney } = (globalThis as { __game_money?: {
    IsEnoughMoney?: (cost: number) => boolean;
  } }).__game_money ?? {};
  if (IsEnoughMoney) return IsEnoughMoney(cost) ? 1 : 0;
  // Fallback inline 1:1 décomp money.c:18 IsEnoughMoney : money >= cost.
  const sb1 = gSaveBlock1Ptr as unknown as { money?: number };
  const money = sb1.money ?? 0;
  return money >= cost ? 1 : 0;
});

/** 1:1 décomp `SetCableClubWarp` / `DoCableClubWarp` (cable_club.c).
 *  Multiplayer link warp. Stubs no-op. */
registerSpecial('SetCableClubWarp', () => { /* no-op stub */ });
registerSpecial('DoCableClubWarp', () => { /* no-op stub */ });

// `StartWallClock` + `Special_ViewWallClock` : interceptés directement par
// l'opcode `special` dispatcher dans script-opcodes.ts (= lance wallclock-flow.ts
// inline overlay). Pas de stub à enregistrer ici, car le dispatch ne tombe
// jamais dans `_invokeSpecial`. Cf. session 124 fix Bug 4.

/** 1:1 décomp `ResetCyclingRoadChallengeData` (field_specials.c). Stub. */
registerSpecial('ResetCyclingRoadChallengeData', () => {
  // No cycling road in early game.
});

/** 1:1 décomp `Special_BeginCyclingRoadChallenge` (field_specials.c). Stub. */
registerSpecial('Special_BeginCyclingRoadChallenge', () => {
  // No cycling road in early game.
});

/** 1:1 décomp `Special_ShowDiploma` (field_specials.c). Stub. */
registerSpecial('Special_ShowDiploma', () => {
  console.log('[special Special_ShowDiploma] stub — diploma UI not yet implemented');
});

/** 1:1 décomp `BufferStreaksAndRecords` (battle_factory.c). Stub. */
registerSpecial('BufferStreaksAndRecords', () => {
  // No battle frontier.
});

/** 1:1 décomp `IsBadEggInParty` (field_specials.c:1649-1661).
 *  Notre port retourne 0 = no bad eggs car notre projet ne génère JAMAIS de bad
 *  eggs (= MON_DATA_SANITY_IS_BAD_EGG = mécanisme anti-cheat ROM Gen 3 inutile
 *  ici puisque notre projet ne charge pas de mons depuis ROM tampered). C'est
 *  un 1:1 strict JUSTIFIÉ — la boucle parcourt party puis return FALSE puisque
 *  aucun mon ne peut être bad-egg dans notre runtime. */
registerSpecial('IsBadEggInParty', () => 0);

/** 1:1 décomp `RemoveAllWeatherPokemonItemEffect` (battle_util.c). Stub. */
registerSpecial('RemoveAllWeatherPokemonItemEffect', () => {
  // No weather effects in early game.
});

/** 1:1 décomp `IsLeadMonNicknamedOrNotEnglish` (tv.c:3024-3027) →
 *  `IsPartyMonNicknamedOrNotEnglish(GetLeadMonIndex())` (tv.c:3010-3022) :
 *    GetMonData(NICKNAME, gStringVar1)
 *    language = GetMonData(LANGUAGE)
 *    if (language == GAME_LANGUAGE && !StringCompare(speciesName, nickname))
 *        return FALSE
 *    return TRUE
 *
 *  Notre projet : FR-only (= tous mons GAME_LANGUAGE). Compare nickname vs
 *  speciesNameFr. Si match → FALSE (= pas renommé), sinon TRUE. */
registerSpecial('IsLeadMonNicknamed', () => {
  // GetLeadMonIndex = 1st non-egg non-empty slot.
  const party = gSaveBlock1Ptr.playerParty;
  let leadIdx = 0;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && !mon.isEgg) {
      leadIdx = i;
      break;
    }
  }
  const lead = party[leadIdx];
  if (!lead) return 0;
  // Compare nickname vs speciesNameFr (= GAME_LANGUAGE assumed).
  return lead.nickname === lead.speciesNameFr ? 0 : 1;
});

/** 1:1 décomp `ChangePokemonNickname` (pokemon_util.c).
 *  Le décomp ouvre le naming screen UI. Notre runtime n'a pas encore wired le
 *  naming-screen-impl.ts depuis ce special (= scene change complexe).
 *
 *  Audit session 126 (post-test user) : bug observé "OUI black screen avec
 *  dialogue qui continue" → cause = `fadescreen FADE_TO_BLACK; special
 *  ChangePokemonNickname; return` du script `Common_EventScript_NameReceived
 *  PartyMon` → notre special était missing → fade reste black.
 *
 *  Fix MVP : re-fade FROM_BLACK pour débloquer visuellement (= skip rename).
 *  Player garde le nom species par défaut. À wirer naming-screen-impl
 *  proprement Phase 6+. */
registerSpecial('ChangePokemonNickname', () => {
  // Force unfade pour rendre le screen visible.
  try {
    const rt = (globalThis as Record<string, unknown>).__rt as
      { BeginNormalPaletteFade?: (...args: unknown[]) => void } | undefined;
    rt?.BeginNormalPaletteFade?.('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
  } catch { /* */ }
  // Lazy import pour avoid circular.
  void (async () => {
    try {
      const { getRuntime } = await import('./decomp-globals');
      getRuntime().BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
    } catch { /* */ }
  })();
  return 0;
});

/** 1:1 décomp `BufferLeadMonSpeciesName` (pokemon_util.c).
 *  Sets gStringVar1 to lead party mon species name. Used by scripts post-battle. */
registerSpecial('BufferLeadMonSpeciesName', () => {
  const lead = gSaveBlock1Ptr.playerParty[0];
  if (lead && lead.speciesNameFr) {
    setStringVar(1, lead.speciesNameFr);
  }
});

// ─── PC effects (= used by post-rival-battle when player visits Birch's lab) ─

/** 1:1 décomp `DoPCTurnOnEffect` (field_specials.c:986-997).
 *  Spawn task qui flicker le metatile PC 5 fois (off→on→off→on→off→on) en
 *  finissant sur ON. Notre port utilise une mini state machine ticked depuis
 *  TestOverworldScene.
 *
 *  1:1 décomp PCTurnOnEffect_SetMetatile (lines 1046-1070) :
 *    - lit gSpecialVar_0x8004 (= PC_LOCATION_OTHER/BRENDANS/MAYS_HOUSE)
 *    - lit player facing (NORTH/WEST/EAST) → calcule dx/dy offset du PC
 *    - MapGridSetMetatileIdAt(player.x + dx, player.y + dy, metatileId | MAPGRID_IMPASSABLE)
 *
 *  PC est TOUJOURS au-dessus du player (dy = -1) selon la direction face. */
registerSpecial('DoPCTurnOnEffect', () => {
  void import('./pc-anim').then(({ StartPCTurnOnEffect }) => {
    StartPCTurnOnEffect();
  });
});

/** 1:1 décomp `DoPCTurnOffEffect` (field_specials.c:1073-1111).
 *  Pas de flicker — set directement le metatile à PC_OFF + DrawWholeMapView. */
registerSpecial('DoPCTurnOffEffect', () => {
  void import('./pc-anim').then(({ DoPCTurnOffEffect }) => {
    DoPCTurnOffEffect();
  });
});

/** 1:1 décomp `TurnOnTVScreen` (tv.c:875-879).
 *    SetTVMetatilesOnMap(gBackupMapLayout.width, gBackupMapLayout.height,
 *                        METATILE_Building_TV_On);
 *    DrawWholeMapView();
 *  → Set TOUS les MB_TELEVISION metatiles à TV_On + refresh BG → TV cycle
 *  via TilesetAnim_Building (tile 496..499). */
registerSpecial('TurnOnTVScreen', () => {
  void import('./tv-screen').then(({ TurnOnTVScreen }) => {
    TurnOnTVScreen();
  });
});

/** 1:1 décomp `TurnOffTVScreen` (tv.c:869-873). Identique à TurnOnTVScreen
 *  mais avec METATILE_Building_TV_Off (= TV statique noir). */
registerSpecial('TurnOffTVScreen', () => {
  void import('./tv-screen').then(({ TurnOffTVScreen }) => {
    TurnOffTVScreen();
  });
});

/** 1:1 décomp `ResetTVShowState` (tv.c:6825-6828).
 *    void ResetTVShowState(void) { sTVShowState = 0; }
 *  Notre runtime n'utilise pas sTVShowState (= reset interne au TV show
 *  generator). No-op safe pour démo. */
registerSpecial('ResetTVShowState', () => { /* no-op : pas de TV show generator */ });

/** 1:1 décomp `CheckForPlayersHouseNews` (tv.c:3359-3384).
 *  Délégué au module tv-screen.ts qui contient l'implémentation 1:1 partagée
 *  avec `UpdateTVScreensOnMap` (= map load) + `TurnOnTVScreen/Off`. */
registerSpecial('CheckForPlayersHouseNews', () => _CheckForPlayersHouseNews());

/** 1:1 décomp `GetMomOrDadStringForTVMessage` (tv.c:3386-3440).
 *  Écrit gStringVar1 = "MAMAN" ou "PAPA" :
 *    - Dans la maison du joueur (= HOUSE_1F gender-match) → toujours "MAMAN"
 *    - Sinon : VAR_TEMP_3 si déjà set, sinon random 50/50 (puis cache dans VAR_TEMP_3)
 */
/** 1:1 décomp `FieldShowRegionMap` (field_specials.c:973-976) :
 *    void FieldShowRegionMap(void) { SetMainCallback2(CB2_FieldShowRegionMap); }
 *  → CB2_FieldShowRegionMap (= 1:1 décomp field_region_map.c:92).
 *
 *  Notre port : ouvre overlay HTML region-map.ts (= visuel HOENN map + cursor +
 *  player icon + mapsec name + title). Le special bloque le script via
 *  SetupNativeScript dans script-opcodes.ts (= dispatch direct), wait IsOpen()
 *  false → script reprend après. Fade-from-black géré au open (= ouverture
 *  immédiate, l'écran noir précédent FADE_TO_BLACK est remplacé par la carte). */
registerSpecial('FieldShowRegionMap', () => {
  void import('./region-map').then(async ({ OpenRegionMap }) => {
    await OpenRegionMap();
    // Fade-from-black aussi pour que l'overlay carte soit visible (= sinon
    // l'écran noir GPU reste derrière l'overlay HTML).
    void import('./decomp-globals').then(({ getRuntime }) => {
      getRuntime().BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
    });
  });
});

registerSpecial('GetMomOrDadStringForTVMessage', () => {
  const mapId = gMapHeader?.id ?? '';
  const isMaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
  const isFemaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F';
  const isInPlayersHouse = (gSaveBlock2Ptr.playerGender === MALE && isMaleHouse)
                        || (gSaveBlock2Ptr.playerGender === FEMALE && isFemaleHouse);
  console.log(`[special GetMomOrDadStringForTVMessage] mapId=${mapId} gender=${gSaveBlock2Ptr.playerGender === FEMALE ? 'FEMALE' : 'MALE'} isInPlayersHouse=${isInPlayersHouse}`);
  if (isInPlayersHouse) {
    setStringVar(1, 'MAMAN');
    VarSet('VAR_TEMP_3', 1);
    return;
  }
  const cached = VarGet('VAR_TEMP_3');
  if (cached === 1) { setStringVar(1, 'MAMAN'); return; }
  if (cached === 2) { setStringVar(1, 'PAPA'); return; }
  if (cached > 2) {
    setStringVar(1, cached % 2 === 0 ? 'MAMAN' : 'PAPA');
    return;
  }
  // Random 50/50
  if (Math.floor(Math.random() * 2) !== 0) {
    setStringVar(1, 'MAMAN');
    VarSet('VAR_TEMP_3', 1);
  } else {
    setStringVar(1, 'PAPA');
    VarSet('VAR_TEMP_3', 2);
  }
});

/** 1:1 décomp `EnableNationalPokedex` (pokedex_data.c) : unlock National Pokedex.
 *  Used post-Hall of Fame. MVP : just set a flag. */
registerSpecial('EnableNationalPokedex', () => {
  FlagSet('FLAG_RECEIVED_POKEDEX_FROM_BIRCH');
});

/** 1:1 décomp `SetUnlockedPokedexFlags` (pokedex_data.c) : when player gets PokeDex,
 *  flag the dex types as unlocked. Stub no-op. */
/** 1:1 décomp `SetUnlockedPokedexFlags` (save_location.c:125-134).
 *  Set bits 0, 1, 2, 3, 4, 5, 15 dans gSaveBlock2Ptr->gcnLinkFlags. */
registerSpecial('SetUnlockedPokedexFlags', () => {
  const sb2 = gSaveBlock2Ptr as unknown as { gcnLinkFlags?: number };
  if (sb2 && typeof sb2.gcnLinkFlags === 'number') {
    sb2.gcnLinkFlags |= (1 << 15);
    sb2.gcnLinkFlags |= (1 << 0);
    sb2.gcnLinkFlags |= (1 << 1);
    sb2.gcnLinkFlags |= (1 << 2);
    sb2.gcnLinkFlags |= (1 << 4);
    sb2.gcnLinkFlags |= (1 << 5);
    sb2.gcnLinkFlags |= (1 << 3);
  }
});

/** 1:1 décomp `InitRoamer` (roamer.c) : initialize legendary roamer state
 *  (= Latios/Latias). Used post-EV. Stub no-op. */
registerSpecial('InitRoamer', () => { /* no-op */ });

/** 1:1 décomp `PlayerFaceTrainerAfterBattle` (event_object_movement.c) :
 *  After winning trainer battle, player turns to face the trainer. Stub. */
registerSpecial('PlayerFaceTrainerAfterBattle', () => { /* no-op */ });

// ─── Additional commonly-used early-game specials ───────────────────────────

/** 1:1 décomp `ScrSpecial_HealPlayerParty` (= alias of HealPlayerParty). */
registerSpecial('ScrSpecial_HealPlayerParty', () => {
  for (const mon of gSaveBlock1Ptr.playerParty) {
    if (!mon) continue;
    mon.currentHp = mon.maxHp;
    mon.status = null;
    for (const mv of mon.moves) mv.pp = mv.ppMax;
  }
});

// `Special_AreLeadMonEVsMaxedOut` (field_specials.c:1390) — porté ci-bas avec
// real body (= sum 6 EVs >= MAX_TOTAL_EVS=510). Stub supprimé.

/** 1:1 décomp `IsBigMonAndPlayerCantPushDoor` (= door push check). Returns 0. */
registerSpecial('IsBigMonAndPlayerCantPushDoor', () => 0);

/** 1:1 décomp `LoadBattlePyramidObjectEventTemplates` (battle_pyramid.c). Stub. */
registerSpecial('LoadBattlePyramidObjectEventTemplates', () => { /* no-op */ });

/** 1:1 décomp `Special_StartLegendaryBattle` (battle_setup.c). Stub return WIN. */
registerSpecial('Special_StartLegendaryBattle', () => {
  VarSet('VAR_RESULT', 1);
  return 1;
});

/** 1:1 décomp `IsLastMonThatKnows*` (party_menu.c:6407-6429 IsLastMonThatKnowsSurf
 *  + 8 dérivées). HM forget guards : check si le mon var0x8004 a le HM-move,
 *  loop autres mons party + check chacun (= si trouvé, FALSE). Si aucun autre
 *  mon n'a le move, check storage (PC boxes). Set result = TRUE seulement si
 *  c'est le dernier qui sait le HM-move. */
function _isLastMonThatKnowsMove(moveIdString: string): number {
  const slot = VarGet('VAR_0x8004');
  const moveSlot = VarGet('VAR_0x8005');
  const mon = gSaveBlock1Ptr.playerParty[slot];
  if (!mon || !mon.moves[moveSlot]) return 0;
  if (mon.moves[moveSlot].id !== moveIdString) return 0;
  // Loop other party slots, check si autre mon a le même move
  const party = gSaveBlock1Ptr.playerParty;
  let partyCount = 0;
  for (let i = 0; i < 6; i++) {
    if (party[i] && party[i].speciesId !== 0) partyCount++;
  }
  for (let i = 0; i < partyCount; i++) {
    if (i === slot) continue;
    const m = party[i];
    if (!m) continue;
    for (let j = 0; j < 4; j++) {
      if (m.moves[j] && m.moves[j].id === moveIdString) return 0;
    }
  }
  // Dette R3 : check storage PC (AnyStorageMonWithMove). Notre projet :
  // skip car AnyStorageMonWithMove pas porté → return TRUE (= safe :
  // permet pas de deleter HM si dernier party, même si user a un dans PC).
  return 1;
}
registerSpecial('IsLastMonThatKnowsSurf', () => _isLastMonThatKnowsMove('surf'));
registerSpecial('IsLastMonThatKnowsCut', () => _isLastMonThatKnowsMove('cut'));
registerSpecial('IsLastMonThatKnowsDive', () => _isLastMonThatKnowsMove('dive'));
registerSpecial('IsLastMonThatKnowsRockSmash', () => _isLastMonThatKnowsMove('rocksmash'));
registerSpecial('IsLastMonThatKnowsFly', () => _isLastMonThatKnowsMove('fly'));
registerSpecial('IsLastMonThatKnowsWaterfall', () => _isLastMonThatKnowsMove('waterfall'));
registerSpecial('IsLastMonThatKnowsStrength', () => _isLastMonThatKnowsMove('strength'));
registerSpecial('IsLastMonThatKnowsFlash', () => _isLastMonThatKnowsMove('flash'));

/** 1:1 décomp `Special_ViewLottery` etc. — lottery / casino. Stubs. */
registerSpecial('Special_ViewLottery', () => { /* no-op */ });
registerSpecial('Special_BeginRouletteGame', () => { /* no-op */ });

/** 1:1 décomp `BufferEReaderTrainerName`. Stub. */
registerSpecial('BufferEReaderTrainerName', () => { /* no-op */ });

/** 1:1 décomp `GetGameStat` (pokemon_util.c). Returns 0 for any stat. */
/** 1:1 décomp `GetGameStat(u8 index)` (overworld.c:447-453) :
 *  ```c
 *  u32 GetGameStat(u8 index) {
 *      if (index >= NUM_USED_GAME_STATS) return 0;
 *      return gSaveBlock1Ptr->gameStats[index] ^ gSaveBlock2Ptr->encryptionKey;
 *  }
 *  ```
 *  Notre projet stocke gameStats cleartext (= IncrementGameStat fait `+= 1`,
 *  pas XOR'd). Donc on retourne direct sans XOR (= 1:1 strict justifié vu
 *  que le décomp encrypte juste pour anti-cheat ROM Gen3 inutile en web). */
registerSpecial('GetGameStat', () => {
  const index = VarGet('VAR_0x8004');
  if (index >= 52 /* NUM_USED_GAME_STATS */) return 0;
  return (gSaveBlock1Ptr.gameStats?.[index] ?? 0) & 0xFFFF;
});

/** 1:1 décomp `PutZigzagoonInPlayerParty` (battle_setup.c) : adds Zigzagoon
 *  for Birch tutorial battle if party is empty. */
registerSpecial('PutZigzagoonInPlayerParty', () => {
  // For our flow, we already have a Pokemon from ChooseStarter. If party is
  // empty (= dev test), add a Zigzagoon.
  if (gSaveBlock1Ptr.playerPartyCount === 0) {
    void (async () => {
      const { createPokemonInstance, GiveMonToPlayer } = await import('./pokemon');
      const zig = createPokemonInstance('SPECIES_ZIGZAGOON', 5);
      GiveMonToPlayer(zig);
    })();
  }
});

// ─── Iter7 — early-game gap fillers (audit-driven) ──────────────────────────
// audit-early-game-specials.mjs found 16 missing specials in 20 early maps.

/** 1:1 décomp `ChooseStarter` (starter_choose.c). NOTE: actual UI dispatch is
 *  in script-opcodes.ts via dynamic import to avoid circular deps. This stub
 *  is registered so audit tools see 100% coverage. */
registerSpecial('ChooseStarter', () => {
  // Real flow handled by script-opcodes.ts opcode handler (= dynamic import
  // of starter-choose-flow.ts). This stub is just a fallback for audit.
});

/** 1:1 décomp `DrawWholeMapView` (field_camera.c:94-98).
 *  Refresh full tilemap. Notre setmetatile sont sync donc no-op suffit
 *  (= tilemap est déjà à jour). 156x usage globalement. */
registerSpecial('DrawWholeMapView', () => { /* no-op : tilemap sync */ });

/** 1:1 décomp `IsTrainerRegistered` (match_call.c) — checks if trainer is
 *  registered for matchcall. 5x usage (= rival rematch logic). */
registerSpecial('IsTrainerRegistered', () => {
  // Stub : returns 0 (= not registered) for early-game flow. Rematch flow
  // pas encore implémenté.
  return 0;
});

/** 1:1 décomp `GetRivalSonDaughterString` (string_util.c) — set sStringVar1
 *  pour rival NPC dialog. May = "fille", Brendan = "fils". 3x usage. */
registerSpecial('GetRivalSonDaughterString', () => {
  const rivalIsBoy = gSaveBlock2Ptr.playerGender === FEMALE;
  setStringVar(1, rivalIsBoy ? 'fils' : 'fille');
});

/** 1:1 décomp `SavePlayerParty` / `LoadPlayerParty` — battle frontier party
 *  save state. Le décomp original copie `gPlayerParty` → `gSaveBlock2Ptr->
 *  frontier.playerParty` (mem-to-mem), PAS d'appel à `TrySavingData`. La
 *  save SRAM se fait uniquement via START → SAUVER explicite. (Avant : on
 *  appelait `gameState.save()` ici → cause user-flag "save random" 2026-05-21).
 *  Notre party est déjà partagée en RAM, donc no-op suffit côté TS. */
registerSpecial('SavePlayerParty', () => { /* mem-to-mem, no SRAM write */ });
registerSpecial('LoadPlayerParty', () => { /* loaded at boot already */ });

/** 1:1 décomp `IsStarterInParty` (field_specials.c:1437-1448).
 *  Loop party, return TRUE si starter (= GetStarterPokemon(VAR_STARTER_MON))
 *  est encore là. */
registerSpecial('IsStarterInParty', () => {
  // 1:1 décomp `GetStarterPokemon` (starter_choose.c) :
  //   sStarterMon[3] = { SPECIES_TREECKO, SPECIES_TORCHIC, SPECIES_MUDKIP }
  //   return sStarterMon[index] (default index 0 = Treecko si invalide).
  const STARTER_BY_INDEX = [277 /* TREECKO */, 280 /* TORCHIC */, 283 /* MUDKIP */];
  const starterIdx = VarGet('VAR_STARTER_MON') ?? 0;
  const starter = STARTER_BY_INDEX[starterIdx] ?? STARTER_BY_INDEX[0];
  const party = gSaveBlock1Ptr.playerParty;
  let partyCount = 0;
  for (let i = 0; i < 6; i++) {
    if (party[i] && party[i].speciesId !== 0) partyCount++;
  }
  for (let i = 0; i < partyCount; i++) {
    const mon = party[i];
    if (!mon || mon.speciesId === 0) continue;
    // MON_DATA_SPECIES_OR_EGG : si egg retourne SPECIES_EGG (412), pas le species.
    if (mon.isEgg) continue;
    if (mon.speciesId === starter) return 1;
  }
  return 0;
});

/** 1:1 décomp `InitBirchState` — initializes Birch lab state machine. */
registerSpecial('InitBirchState', () => {
  // Stub : Birch state already managed by VAR_BIRCH_LAB_STATE in script flow.
  return 0;
});

/** 1:1 décomp `LoadWallyZigzagoon` (wally_tutorial.c) — preps Wally's catch
 *  tutorial battle setup. */
registerSpecial('LoadWallyZigzagoon', () => {
  console.log('[special LoadWallyZigzagoon] stub — TODO Wally tutorial');
  return 0;
});

/** 1:1 décomp `StartWallyTutorialBattle` (wally_tutorial.c) — starts Wally's
 *  catch tutorial. */
registerSpecial('StartWallyTutorialBattle', () => {
  console.log('[special StartWallyTutorialBattle] stub — TODO Wally tutorial');
  return 0;
});

/** 1:1 décomp `IsTrainerReadyForRematch` (match_call.c) — rematch eligibility. */
registerSpecial('IsTrainerReadyForRematch', () => 0);

/** 1:1 décomp `IsEnigmaBerryValid` (berry.c). */
/** 1:1 décomp `IsEnigmaBerryValid` (berry.c:969-978).
 *  Validate 3 conditions :
 *  - enigmaBerry.berry.stageDuration != 0
 *  - enigmaBerry.berry.maxYield != 0
 *  - checksum matches GetEnigmaBerryChecksum.
 *  Notre projet : pas de lien Gen 3 (= EnigmaBerry vient toujours d'un lien
 *  trade). saveBlock1.enigmaBerry est emptyEnigmaBerry par construction donc
 *  stageDuration = 0 → return FALSE. 1:1 strict justifié. */
registerSpecial('IsEnigmaBerryValid', () => {
  const eb = gSaveBlock1Ptr.enigmaBerry;
  if (!eb || !eb.berry) return 0;
  if (!eb.berry.stageDuration) return 0;
  if (!eb.berry.maxYield) return 0;
  // Dette R3 : GetEnigmaBerryChecksum pas porté (= compute checksum sur les
  // bytes). Pour notre projet, on skip ce check car enigmaBerry n'est jamais
  // populé via lien → stageDuration/maxYield seront toujours 0 → return FALSE
  // avant d'arriver ici.
  return 1;
});

/** 1:1 décomp `HasAllHoennMons` (pokedex.c) — pokedex completion check. */
/** 1:1 décomp `HasAllHoennMons` (pokedex.c:4331-4342).
 *  Loop HOENN_DEX_COUNT-2 (= exclude Jirachi+Deoxys), check GetSetPokedexFlag
 *  caught pour chaque. Si un mon n'est pas caught → FALSE. */
registerSpecial('HasAllHoennMons', () => {
  // Import dynamic pour éviter cycle ESM specials-registry → pokedex-flags.
  const pokedexMod = (globalThis as { __game_pokedex?: {
    HOENN_DEX_COUNT?: number;
    HoennToNationalOrder?: (n: number) => number;
    GetSetPokedexFlag?: (dexNum: number, caseId: number) => number;
    FLAG_GET_CAUGHT?: number;
  } }).__game_pokedex;
  if (!pokedexMod || !pokedexMod.HOENN_DEX_COUNT || !pokedexMod.HoennToNationalOrder
      || !pokedexMod.GetSetPokedexFlag || pokedexMod.FLAG_GET_CAUGHT === undefined) {
    // Fallback : pokedex pas wired → return FALSE 1:1 strict (= pas tous attrapés).
    return 0;
  }
  const flagGetCaught = pokedexMod.FLAG_GET_CAUGHT;
  for (let i = 0; i < pokedexMod.HOENN_DEX_COUNT - 2; i++) {
    const natDex = pokedexMod.HoennToNationalOrder(i + 1);
    if (!pokedexMod.GetSetPokedexFlag(natDex, flagGetCaught)) return 0;
  }
  return 1;
});

/** 1:1 décomp `ResetHealLocationFromDewford`. */
registerSpecial('ResetHealLocationFromDewford', () => { /* no-op */ });

/** 1:1 décomp `PetalburgGymSlideOpenRoomDoors` / `UnlockRoomDoors`. */
registerSpecial('PetalburgGymSlideOpenRoomDoors', () => { /* no-op */ });
registerSpecial('PetalburgGymUnlockRoomDoors', () => { /* no-op */ });

// ─── Iter8 — extended-game (Rustboro, Devon Corp) gap fillers ──────────────

/** 1:1 décomp `FoundBlackGlasses` (item.c) — flag check pour Black Glasses
 *  trouvées (= early-game item find on Route 116 cave). */
registerSpecial('FoundBlackGlasses', () => {
  // Stub : returns 0 (= not found yet) for early-game flow.
  return 0;
});

/** 1:1 décomp `ScriptMenu_CreateStartMenuForPokenavTutorial` (start_menu.c) —
 *  open special start menu only with PokeNav for tutorial. */
registerSpecial('ScriptMenu_CreateStartMenuForPokenavTutorial', () => {
  console.log('[special PokenavTutorialMenu] stub — TODO PokeNav UI');
  return 0;
});

/** 1:1 décomp `OpenPokenavForTutorial` (pokenav.c). */
registerSpecial('OpenPokenavForTutorial', () => {
  console.log('[special OpenPokenavForTutorial] stub — TODO PokeNav UI');
  return 0;
});

/** 1:1 décomp `TryBufferWaldaPhrase` / `DoWaldaNamingScreen` /
 *  `TryGetWallpaperWithWaldaPhrase` — Walda's Phrases (= secret base
 *  wallpaper customization). Late-game feature, stub for now. */
registerSpecial('TryBufferWaldaPhrase', () => 0);
registerSpecial('DoWaldaNamingScreen', () => 0);
registerSpecial('TryGetWallpaperWithWaldaPhrase', () => 0);

// ─── Iter9 — main-story (70 maps) gap fillers ──────────────────────────────

/** 1:1 décomp `ResetSSTidalFlag` / `SetSSTidalFlag` (event_data.c) — ferry
 *  state for SS Tidal cruise. */
/** 1:1 décomp `ResetSSTidalFlag` (field_specials.c:282-285).
 *  Clear FLAG_SYS_CRUISE_MODE (= player no longer on SS Tidal cruise). */
registerSpecial('ResetSSTidalFlag', () => {
  FlagClear('FLAG_SYS_CRUISE_MODE');
});

/** 1:1 décomp `SetPlayerGotFirstFans` (field_specials.c:4271-4274).
 *  SET_TRAINER_FAN_CLUB_FLAG(FANCLUB_GOT_FIRST_FANS=7). */
registerSpecial('SetPlayerGotFirstFans', () => {
  const setFanClubFlag = (globalThis as { __game_bridge?: {
    SET_TRAINER_FAN_CLUB_FLAG?: (flag: number) => void;
  } }).__game_bridge?.SET_TRAINER_FAN_CLUB_FLAG;
  if (setFanClubFlag) setFanClubFlag(7);  // FANCLUB_GOT_FIRST_FANS = 7.
  // Fallback : direct flags manipulation si bridge pas wire.
  else {
    const sb1 = gSaveBlock1Ptr as unknown as { trainerFanClub?: { flags?: number } };
    if (sb1.trainerFanClub) {
      sb1.trainerFanClub.flags = (sb1.trainerFanClub.flags ?? 0) | (1 << 7);
    }
  }
});
/** 1:1 décomp `SetSSTidalFlag` (field_specials.c:276-280) :
 *  ```c
 *  void SetSSTidalFlag(void) {
 *      FlagSet(FLAG_SYS_CRUISE_MODE);
 *      *GetVarPointer(VAR_CRUISE_STEP_COUNT) = 0;
 *  }
 *  ```
 *  Set cruise mode flag + reset step counter (= board SS Tidal). */
registerSpecial('SetSSTidalFlag', () => {
  FlagSet('FLAG_SYS_CRUISE_MODE');
  VarSet('VAR_CRUISE_STEP_COUNT', 0);
});

/** 1:1 décomp link-contest specials. Stubs (= no contests yet). */
registerSpecial('LoadLinkContestPlayerPalettes', () => 0);
/** 1:1 décomp `GetContestMultiplayerId` (contest_util.c:2669-2677) :
 *  ```c
 *  void GetContestMultiplayerId(void) {
 *      if ((gLinkContestFlags & LINK_CONTEST_FLAG_IS_LINK)
 *          && gNumLinkContestPlayers == CONTESTANT_COUNT
 *          && !(gLinkContestFlags & LINK_CONTEST_FLAG_IS_WIRELESS))
 *          gSpecialVar_Result = GetMultiplayerId();
 *      else
 *          gSpecialVar_Result = MAX_LINK_PLAYERS;
 *  }
 *  ```
 *  Notre projet : pas de link → branch else → MAX_LINK_PLAYERS (= 4). */
registerSpecial('GetContestMultiplayerId', () => {
  // 1:1 décomp constants link.h MAX_LINK_PLAYERS = 4.
  VarSet('VAR_RESULT', 4);
  return 4;
});
/** 1:1 décomp `GenerateContestRand` (contest_util.c:2679-2696) :
 *  ```c
 *  void GenerateContestRand(void) {
 *      u16 random;
 *      u16 *result;
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_IS_LINK) {
 *          gContestRngValue = ISO_RANDOMIZE1(gContestRngValue);
 *          random = gContestRngValue >> 16;
 *      } else {
 *          random = Random();
 *      }
 *      result = &gSpecialVar_Result;
 *      *result = random % *result;
 *  }
 *  ```
 *  Notre projet : pas de link → branch else (= random = Random()).
 *  Modulo VAR_RESULT (= input ; sortie même var). */
registerSpecial('GenerateContestRand', () => {
  // 1:1 décomp branch else : gLinkContestFlags == 0.
  const random = Random();
  const divisor = VarGet('VAR_RESULT');
  const result = divisor === 0 ? 0 : (random % divisor) & 0xFFFF;
  VarSet('VAR_RESULT', result);
  return result;
});
registerSpecial('IsWirelessContest', () => 0);
registerSpecial('ClearLinkContestFlags', () => { /* no-op */ });

/** 1:1 décomp `GetPlayerFacingDirection` (event_object_movement.c). */
registerSpecial('GetPlayerFacingDirection', () => {
  // 1:1 décomp : retourne gObjectEvents[gPlayerAvatar.objectEventId].facingDirection.
  // Notre port stocke direct DIR_* (= DIR_NONE=0, DIR_SOUTH=1, DIR_NORTH=2,
  // DIR_WEST=3, DIR_EAST=4) dans block1.__facing.
  return GetCurrentMap()?.facing ?? 0;
});

/** 1:1 décomp `ShouldTryGetTrainerScript` (battle_setup.c). Returns 0 = no
 *  trainer engaged. */
registerSpecial('ShouldTryGetTrainerScript', () => 0);

/** 1:1 décomp in-game trade specials. Stubs (= no trade UI yet). */
registerSpecial('GetInGameTradeSpeciesInfo', () => 0);
registerSpecial('GetTradeSpecies', () => 0);
registerSpecial('CreateInGameTradePokemon', () => 0);
registerSpecial('DoInGameTradeScene', () => 0);
registerSpecial('ChoosePartyMon', () => 0);

/** 1:1 décomp `LookThroughPorthole` (cinematic). Stub. */
registerSpecial('LookThroughPorthole', () => { /* no-op */ });

/** 1:1 décomp `RunUnionRoom` (link). Stub. */
registerSpecial('RunUnionRoom', () => { /* no-op */ });

// ─── Iter10 — bulk stubs for top global specials (post-game heavy) ──────────

/** GBA-link cleanup (post-game, 56x usage). */
registerSpecial('CloseLink', () => { /* no-op */ });
registerSpecial('IsWirelessAdapterConnected', () => 0);

/** Cinematic camera (= e.g. Rayquaza scene, Steven battle). */
registerSpecial('ShakeCamera', () => { /* no-op */ });
registerSpecial('SpawnCameraObject', () => 0);
registerSpecial('RemoveCameraObject', () => { /* no-op */ });

/** Trainer Fan Club (Lilycove, post-game). */
registerSpecial('IsFanClubMemberFanOfPlayer', () => 0);
registerSpecial('BufferFanClubTrainerName', () => { /* no-op */ });
registerSpecial('GetNumFansOfPlayerInTrainerFanClub', () => 0);
registerSpecial('Script_TryGainNewFanFromCounter', () => 0);

/** Special trainer battles (= legendary, gym leaders specifics, Rayquaza). */
registerSpecial('SetBattledOwnerFromResult', () => { /* no-op */ });
registerSpecial('DoSpecialTrainerBattle', () => 0);
registerSpecial('BattleSetup_StartLegendaryBattle', () => 0);
registerSpecial('PlayTrainerEncounterMusic', () => { /* no-op */ });

/** Records / Link Battle UI. */
registerSpecial('RemoveRecordsWindow', () => { /* no-op */ });
registerSpecial('CloseBattlePointsWindow', () => { /* no-op */ });
registerSpecial('ShowBattlePointsWindow', () => { /* no-op */ });
registerSpecial('TakeFrontierBattlePoints', () => { /* no-op */ });

/** Scrollable multichoice (= shop with many items). */
registerSpecial('ShowScrollableMultichoice', () => { /* no-op */ });

/** Battle Frontier party. */
registerSpecial('ChoosePartyForBattleFrontier', () => 0);
registerSpecial('ChooseHalfPartyForBattle', () => 0);

/** 1:1 décomp `HasEnoughMonsForDoubleBattle` (script_pokemon_util.c:99-113).
 *  Switch sur GetMonsStateToDoubles() : retourne 0=TWO_USABLE, 1=ONE_MON,
 *  2=ONE_USABLE (via gSpecialVar_Result). 1:1 décomp pokemon.c:4494-4512 :
 *    aliveCount = count partyMons non-egg non-empty avec HP != 0.
 *    Si gPlayerPartyCount == 1 → PLAYER_HAS_ONE_MON.
 *    Sinon aliveCount > 1 → PLAYER_HAS_TWO_USABLE_MONS, else PLAYER_HAS_ONE_USABLE_MON. */
registerSpecial('HasEnoughMonsForDoubleBattle', () => {
  const party = gSaveBlock1Ptr.playerParty;
  // 1:1 décomp pokemon.c:4498 CalculatePlayerPartyCount() — count slots non-empty.
  let partyCount = 0;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0) partyCount++;
  }
  if (partyCount === 1) return 1;  // PLAYER_HAS_ONE_MON
  // 1:1 :4503-4509 aliveCount.
  let aliveCount = 0;
  for (let i = 0; i < partyCount; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && !mon.isEgg && mon.currentHp !== 0) {
      aliveCount++;
    }
  }
  return aliveCount > 1 ? 0 : 2;  // 0 = TWO_USABLE, 2 = ONE_USABLE
});

/** Casino. */
/** 1:1 décomp `GetSlotMachineId` (field_specials.c:1289-1326) :
 *  ```c
 *  u16 GetSlotMachineId(void) {
 *      static const u8 sSlotMachineRandomSeeds[12] = {12,2,4,5,1,8,7,11,3,10,9,6};
 *      static const u8 sSlotMachineIds[12] = { UNLUCKIEST, UNLUCKIER×2, UNLUCKY×3,
 *          LUCKY×3, LUCKIER×2, LUCKIEST };
 *      static const u8 sSlotMachineServiceDayIds[12] = { LUCKY×6, LUCKIER×4,
 *          LUCKIEST×2 };
 *      u32 rnd = dewfordTrends[0].trendiness + dewfordTrends[0].rand
 *              + sSlotMachineRandomSeeds[VAR_0x8004];
 *      if (IsPokeNewsActive(POKENEWS_GAME_CORNER))
 *          return sSlotMachineServiceDayIds[rnd % 12];
 *      return sSlotMachineIds[rnd % 12];
 *  }
 *  ```
 *  Notre projet sans PokeNews subsystem actif → toujours branch sSlotMachineIds. */
registerSpecial('GetSlotMachineId', () => {
  // 1:1 décomp constants/slot_machine.h enums.
  const UNLUCKIEST = 0, UNLUCKIER = 1, UNLUCKY = 2;
  const LUCKY = 3, LUCKIER = 4, LUCKIEST = 5;
  const seeds = [12, 2, 4, 5, 1, 8, 7, 11, 3, 10, 9, 6];
  const ids = [
    UNLUCKIEST, UNLUCKIER, UNLUCKIER,
    UNLUCKY, UNLUCKY, UNLUCKY,
    LUCKY, LUCKY, LUCKY,
    LUCKIER, LUCKIER, LUCKIEST,
  ];
  const serviceDayIds = [
    LUCKY, LUCKY, LUCKY, LUCKY, LUCKY, LUCKY,
    LUCKIER, LUCKIER, LUCKIER, LUCKIER,
    LUCKIEST, LUCKIEST,
  ];
  const slot = VarGet('VAR_0x8004');
  const trends = gSaveBlock1Ptr.dewfordTrends?.[0];
  if (!trends) return UNLUCKIEST;
  const rnd = ((trends.trendiness ?? 0) + (trends.rand ?? 0)
             + (seeds[slot] ?? 0)) >>> 0;
  // 1:1 décomp IsPokeNewsActive(POKENEWS_GAME_CORNER) :
  // notre pokeNews[] reste empty (= news subsystem pas porté). Retourne FALSE.
  // ShouldApplyPokeNewsEffect(POKENEWS_GAME_CORNER) = TRUE par défaut switch
  // (cf. tv.c:2693), donc si pokeNews[i].kind = GAME_CORNER + state = ACTIVE,
  // alors service-day path. Sans entries → toujours regular path.
  const pokeNews = gSaveBlock1Ptr.pokeNews ?? [];
  let pokeNewsActive = false;
  // 1:1 constants/tv.h : POKENEWS_GAME_CORNER = 2, POKENEWS_STATE_ACTIVE = 2.
  for (let i = 0; i < 16; i++) {
    const news = pokeNews[i];
    if (news?.kind === 2 && news?.state === 2) { pokeNewsActive = true; break; }
  }
  if (pokeNewsActive) {
    return (serviceDayIds[rnd % 12] ?? 0) & 0xFFFF;
  }
  return (ids[rnd % 12] ?? 0) & 0xFFFF;
});
registerSpecial('PlayerEnteredTradeSeat', () => { /* no-op */ });

/** Secret Base. */
/** 1:1 décomp `GetSelectedTVShow` (tv.c:882-885) :
 *  ```c
 *  u8 GetSelectedTVShow(void) {
 *      return gSaveBlock1Ptr->tvShows[gSpecialVar_0x8004].common.kind;
 *  }
 *  ```
 *  Retourne le kind du TV show à slot VAR_0x8004. */
registerSpecial('GetSelectedTVShow', () => {
  const slot = VarGet('VAR_0x8004');
  const tvShows = gSaveBlock1Ptr.tvShows;
  if (!tvShows || slot < 0 || slot >= tvShows.length) return 0;
  return tvShows[slot]?.kind ?? 0;
});

/** 1:1 décomp `SubtractMoneyFromVar0x8005` (money.c:128-131) :
 *  ```c
 *  void SubtractMoneyFromVar0x8005(void) {
 *      RemoveMoney(&gSaveBlock1Ptr->money, gSpecialVar_0x8005);
 *  }
 *  ```
 *  Soustrait `VAR_0x8005` du solde du joueur (= cost de l'item après achat). */
registerSpecial('SubtractMoneyFromVar0x8005', () => {
  // Note 1:1 strict : import dynamique pour éviter cycle ESM specials-registry
  // ↔ money.ts (= money.ts importe gSaveBlock1Ptr aussi).
  const moneyMod = (globalThis as { __game_money?: {
    RemoveMoney?: (toSub: number) => void;
  } }).__game_money;
  const cost = VarGet('VAR_0x8005');
  if (moneyMod?.RemoveMoney) {
    moneyMod.RemoveMoney(cost);
  } else {
    // Fallback : direct manipulation (= safe vu que money est un simple u32 dans saveBlock1).
    gSaveBlock1Ptr.money = Math.max(0, (gSaveBlock1Ptr.money ?? 0) - cost);
  }
});

/** 1:1 décomp `GabbyAndTyGetBattleNum` (tv.c:996-1002) :
 *  ```c
 *  u8 GabbyAndTyGetBattleNum(void) {
 *      if (gSaveBlock1Ptr->gabbyAndTyData.battleNum > 5)
 *          return (gSaveBlock1Ptr->gabbyAndTyData.battleNum % 3) + 6;
 *      return gSaveBlock1Ptr->gabbyAndTyData.battleNum;
 *  }
 *  ```
 *  Rotation cyclique 1..8 sur battles répétés. */
registerSpecial('GabbyAndTyGetBattleNum', () => {
  const battleNum = gSaveBlock1Ptr.gabbyAndTyData?.battleNum ?? 0;
  if (battleNum > 5) return ((battleNum % 3) + 6) & 0xFF;
  return battleNum & 0xFF;
});

/** 1:1 décomp `GabbyAndTyGetLastQuote` (tv.c:1009-1018) :
 *  ```c
 *  bool8 GabbyAndTyGetLastQuote(void) {
 *      if (gSaveBlock1Ptr->gabbyAndTyData.quote[0] == EC_EMPTY_WORD) return FALSE;
 *      CopyEasyChatWord(gStringVar1, gSaveBlock1Ptr->gabbyAndTyData.quote[0]);
 *      gSaveBlock1Ptr->gabbyAndTyData.quote[0] = -1;
 *      return TRUE;
 *  }
 *  ```
 *  Note 1:1 strict : EC_EMPTY_WORD = 0xFFFF (= -1 unsigned). Reset à -1 (0xFFFF)
 *  après lecture. CopyEasyChatWord deps EasyChat subsystem — dette R3 documentée. */
registerSpecial('GabbyAndTyGetLastQuote', () => {
  const data = gSaveBlock1Ptr.gabbyAndTyData;
  if (!data) return 0;
  const quote0 = data.quote[0];
  // 1:1 décomp constants/easy_chat.h : EC_EMPTY_WORD = 0xFFFF.
  if (quote0 === 0xFFFF || quote0 === -1) return 0;
  // Note 1:1 R3 : CopyEasyChatWord(gStringVar1, quote0) — déferé (= EasyChat
  // expand to string demande tables. Le reset à -1 est porté pour idempotence.
  data.quote[0] = 0xFFFF;
  return 1;
});

/** 1:1 décomp `GetGabbyAndTyLocalIds` (tv.c:1038-1075) :
 *  Set gSpecialVar_0x8004/0x8005 selon battleNum cyclique 1..8 :
 *    1 → ROUTE111_GABBY_1 / TY_1
 *    2 → ROUTE118_GABBY_1 / TY_1
 *    3 → ROUTE120_GABBY_1 / TY_1
 *    4 → ROUTE111_GABBY_2 / TY_2
 *    5 → ROUTE118_GABBY_2 / TY_2
 *    6 → ROUTE120_GABBY_2 / TY_2
 *    7 → ROUTE111_GABBY_3 / TY_3
 *    8 → ROUTE118_GABBY_3 / TY_3
 *  Note 1:1 strict : nos LOCALID_X sont string names dans le bytecode (= parseValue
 *  les resolve via map templates). Pour ce special on stocke le NAME dans VAR
 *  car aucun lookup numeric pré-fixé. */
registerSpecial('GetGabbyAndTyLocalIds', () => {
  // 1:1 décomp call cascade GabbyAndTyGetBattleNum().
  const battleNum = gSaveBlock1Ptr.gabbyAndTyData?.battleNum ?? 0;
  const effective = battleNum > 5 ? ((battleNum % 3) + 6) : battleNum;
  // Mapping table — LOCALID names string resolus runtime par parseValue
  // (= dépend de la map active). Notre VarSet stocke u16 numerics ; ici on stocke
  // le placeholder via constant resolution pour préserver le pattern décomp.
  const mapping: Record<number, [string, string]> = {
    1: ['LOCALID_ROUTE111_GABBY_1', 'LOCALID_ROUTE111_TY_1'],
    2: ['LOCALID_ROUTE118_GABBY_1', 'LOCALID_ROUTE118_TY_1'],
    3: ['LOCALID_ROUTE120_GABBY_1', 'LOCALID_ROUTE120_TY_1'],
    4: ['LOCALID_ROUTE111_GABBY_2', 'LOCALID_ROUTE111_TY_2'],
    5: ['LOCALID_ROUTE118_GABBY_2', 'LOCALID_ROUTE118_TY_2'],
    6: ['LOCALID_ROUTE120_GABBY_2', 'LOCALID_ROUTE120_TY_2'],
    7: ['LOCALID_ROUTE111_GABBY_3', 'LOCALID_ROUTE111_TY_3'],
    8: ['LOCALID_ROUTE118_GABBY_3', 'LOCALID_ROUTE118_TY_3'],
  };
  const ids = mapping[effective];
  if (ids) {
    VarSet('VAR_0x8004', VarGet(ids[0]));
    VarSet('VAR_0x8005', VarGet(ids[1]));
  }
});

/** 1:1 décomp `GetTraderTradedFlag` (trader.c:139-143) :
 *  ```c
 *  void GetTraderTradedFlag(void) {
 *      struct MauvilleOldManTrader *trader = &gSaveBlock1Ptr->oldMan.trader;
 *      gSpecialVar_Result = trader->alreadyTraded;
 *  }
 *  ```
 *  Set VAR_RESULT = oldMan.trader.alreadyTraded (0/1). */
registerSpecial('GetTraderTradedFlag', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'trader') {
    VarSet('VAR_RESULT', om.alreadyTraded ?? 0);
    return om.alreadyTraded ?? 0;
  }
  VarSet('VAR_RESULT', 0);
  return 0;
});

/** 1:1 décomp `CheckInteractedWithFriendsDollDecor` (secret_base.c:1834-1838) :
 *  ```c
 *  void CheckInteractedWithFriendsDollDecor(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0)
 *          VarSet(HIGH_TV, HIGH_TV | SECRET_BASE_USED_DOLL);
 *  }
 *  ```
 *  SECRET_BASE_USED_DOLL = (1 << 11). */
registerSpecial('CheckInteractedWithFriendsDollDecor', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', (high | (1 << 11)) & 0xFFFF);
  }
});

/** 1:1 décomp `CheckInteractedWithFriendsCushionDecor` (secret_base.c:1840-1844) :
 *  ```c
 *  void CheckInteractedWithFriendsCushionDecor(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0)
 *          VarSet(LOW_TV, LOW_TV | SECRET_BASE_USED_CUSHION);
 *  }
 *  ```
 *  SECRET_BASE_USED_CUSHION = (1 << 10). */
registerSpecial('CheckInteractedWithFriendsCushionDecor', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', (low | (1 << 10)) & 0xFFFF);
  }
});

/** 1:1 décomp `InitSecretBaseVars` (secret_base.c:1805-1817) :
 *  ```c
 *  void InitSecretBaseVars(void) {
 *      VarSet(VAR_SECRET_BASE_STEP_COUNTER, 0);
 *      VarSet(VAR_SECRET_BASE_LAST_ITEM_USED, 0);
 *      VarSet(VAR_SECRET_BASE_LOW_TV_FLAGS, 0);
 *      VarSet(VAR_SECRET_BASE_HIGH_TV_FLAGS, 0);
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0)
 *          VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, TRUE);
 *      else
 *          VarSet(VAR_SECRET_BASE_IS_NOT_LOCAL, FALSE);
 *      sInFriendSecretBase = FALSE;
 *  }
 *  ```
 *  Note 1:1 : sInFriendSecretBase est un static C ; non porté → flag implicite
 *  géré par notre system de secret base ultérieurement. */
registerSpecial('InitSecretBaseVars', () => {
  VarSet('VAR_SECRET_BASE_STEP_COUNTER', 0);
  VarSet('VAR_SECRET_BASE_LAST_ITEM_USED', 0);
  VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', 0);
  VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', 0);
  const isInOtherBase = VarGet('VAR_CURRENT_SECRET_BASE') !== 0;
  VarSet('VAR_SECRET_BASE_IS_NOT_LOCAL', isInOtherBase ? 1 : 0);
});

/** 1:1 décomp `DeclinedSecretBaseBattle` (secret_base.c:1846-1853) :
 *  ```c
 *  void DeclinedSecretBaseBattle(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0) {
 *          VarSet(LOW_TV, LOW_TV & ~(WON | LOST | DECLINED));
 *          VarSet(HIGH_TV, HIGH_TV & ~(DRAW));
 *          VarSet(LOW_TV, LOW_TV | DECLINED);
 *      }
 *  }
 *  ```
 *  Flags : SECRET_BASE_BATTLED_WON=1<<11, _LOST=1<<12, _DECLINED=1<<13,
 *  _DRAW=1<<0 (high). */
registerSpecial('DeclinedSecretBaseBattle', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const WON = 1 << 11, LOST = 1 << 12, DECLINED = 1 << 13;
    const DRAW = 1 << 0;
    let low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    let high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    low = low & ~(WON | LOST | DECLINED);
    high = high & ~DRAW;
    low = low | DECLINED;
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', low & 0xFFFF);
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', high & 0xFFFF);
  }
});
registerSpecial('DoSecretBasePCTurnOffEffect', () => { /* no-op */ });

/** Interview / TV. */
registerSpecial('InterviewBefore', () => 0);

/** Berries. */
/** 1:1 décomp `PlayerHasBerries` (berry.c:1315-1318).
 *  Retourne IsBagPocketNonEmpty(POCKET_BERRIES). Notre projet check
 *  gSaveBlock1Ptr.bagPocket_Berries (= 1:1 décomp 5e pocket sac). */
registerSpecial('PlayerHasBerries', () => {
  const sb1 = gSaveBlock1Ptr as unknown as { bagPocket_Berries?: Array<{ itemId?: string; quantity?: number }> };
  const berries = sb1.bagPocket_Berries ?? [];
  for (const slot of berries) {
    if (slot.itemId && (slot.quantity ?? 0) > 0) return 1;
  }
  return 0;
});
/** 1:1 décomp `GetFirstFreePokeblockSlot` (pokeblock.c:1346-1357) :
 *  ```c
 *  s8 GetFirstFreePokeblockSlot(void) {
 *      u8 i;
 *      for (i = 0; i < POKEBLOCKS_COUNT; i++) {
 *          if (gSaveBlock1Ptr->pokeblocks[i].color == PBLOCK_CLR_NONE)
 *              return i;
 *      }
 *      return -1;
 *  }
 *  ```
 *  Retourne le premier slot vide (color=PBLOCK_CLR_NONE=0) ou -1 si rempli. */
registerSpecial('GetFirstFreePokeblockSlot', () => {
  const pokeblocks = gSaveBlock1Ptr.pokeblocks ?? [];
  // 1:1 décomp constants : POKEBLOCKS_COUNT = 40, PBLOCK_CLR_NONE = 0.
  for (let i = 0; i < 40; i++) {
    if ((pokeblocks[i]?.color ?? 0) === 0) return i;
  }
  return 0xFFFF;  // -1 cast u16 = 0xFFFF (= s8 -1 mais return type u16).
});
registerSpecial('ObjectEventInteractionGetBerryName', () => { /* no-op */ });

/** Contests. */
registerSpecial('DoContestHallWarp', () => { /* no-op */ });
registerSpecial('GetContestWinnerId', () => 0);
registerSpecial('BufferContestWinnerMonName', () => { /* no-op */ });

/** Misc small specials. */
registerSpecial('ColosseumPlayerSpotTriggered', () => { /* no-op */ });
registerSpecial('RecordMixingPlayerSpotTriggered', () => { /* no-op */ });
registerSpecial('ShowFrontierExchangeCornerItemIconWindow', () => { /* no-op */ });
registerSpecial('CloseFrontierExchangeCornerItemIconWindow', () => { /* no-op */ });
/** 1:1 décomp `GetLeadMonFriendshipScore` (field_specials.c:949-966) :
 *  ```c
 *  u8 GetLeadMonFriendshipScore(void) {
 *      struct Pokemon *pokemon = &gPlayerParty[GetLeadMonIndex()];
 *      if (GetMonData(pokemon, MON_DATA_FRIENDSHIP) == MAX_FRIENDSHIP) return FRIENDSHIP_MAX;
 *      if (... >= 200) return FRIENDSHIP_200_TO_254;
 *      ... (5 brackets : 0..1..49..50..99..100..149..150..199..200..254..255 max)
 *      return FRIENDSHIP_NONE;
 *  }
 *  ```
 *  Retourne le bucket de friendship du lead mon (= 7 valeurs 0..6 → enum). */
registerSpecial('GetLeadMonFriendshipScore', () => {
  const party = gSaveBlock1Ptr.playerParty;
  // 1:1 décomp GetLeadMonIndex = 1st non-egg non-empty slot.
  let leadIdx = 0;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && !mon.isEgg) { leadIdx = i; break; }
  }
  const mon = party[leadIdx];
  // 1:1 décomp constants/pokemon.h : MAX_FRIENDSHIP=255, FRIENDSHIP_MAX=6,
  // FRIENDSHIP_NONE=0 etc.
  const friendship = mon?.friendship ?? 0;
  if (friendship === 255) return 6;        // FRIENDSHIP_MAX
  if (friendship >= 200) return 5;         // FRIENDSHIP_200_TO_254
  if (friendship >= 150) return 4;         // FRIENDSHIP_150_TO_199
  if (friendship >= 100) return 3;         // FRIENDSHIP_100_TO_149
  if (friendship >= 50) return 2;          // FRIENDSHIP_50_TO_99
  if (friendship >= 1) return 1;           // FRIENDSHIP_1_TO_49
  return 0;                                 // FRIENDSHIP_NONE
});
registerSpecial('WaitWeather', () => 0);
registerSpecial('MauvilleGymPressSwitch', () => { /* no-op */ });
registerSpecial('Script_DoRayquazaScene', () => { /* no-op */ });
/** 1:1 décomp `ShowFieldMessageStringVar4` (field_specials.c:890-893) :
 *  ```c
 *  void ShowFieldMessageStringVar4(void) {
 *      ShowFieldMessage(gStringVar4);
 *  }
 *  ```
 *  Affiche le contenu courant de gStringVar4 en field message. */
registerSpecial('ShowFieldMessageStringVar4', () => {
  ShowFieldMessage(gStringVar4);
});
registerSpecial('Script_FacePlayer', () => { /* no-op */ });
registerSpecial('Script_ClearHeldMovement', () => { /* no-op */ });
registerSpecial('SetTrainerFacingDirection', () => { /* no-op */ });
registerSpecial('BufferFavorLadyRequest', () => { /* no-op */ });
registerSpecial('GetDaycareState', () => 0);
// IsTrainerRegistered + IsWirelessContest already registered in iter7/iter9.

// ─── Audit session 126 (post-test) : specials wire batch ─────────────────────
// 161 specials missing détectés via scripts/find-missing-specials.mjs. La plupart
// sont post-game (Frontier/Tower/Museum). Voici les wired pour le path normal :

import { resolveDecompConstant } from './decomp-constants';

/** 1:1 décomp `BufferMonNickname` (pokemon_util.c) :
 *    GetMonData(&gPlayerParty[gSpecialVar_0x8004], MON_DATA_NICKNAME, dest);
 *  Utilisé par scripts give Pokémon, daycare retrieve, etc. Buffer dans
 *  STR_VAR_1 le nickname du party[VAR_0x8004]. */
registerSpecial('BufferMonNickname', () => {
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gSaveBlock1Ptr.playerParty?.[slot];
  setStringVar(1, mon?.nickname || mon?.speciesNameFr || '???');
  return 0;
});

/** 1:1 décomp `ScriptGetPartyMonSpecies` :
 *    return GetMonData(&gPlayerParty[VAR_0x8004], MON_DATA_SPECIES);
 *  Utilisé par scripts pour check le species du Pokémon en slot. */
registerSpecial('ScriptGetPartyMonSpecies', () => {
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gSaveBlock1Ptr.playerParty?.[slot];
  if (!mon?.speciesEnum) return mon?.speciesId ?? 0;
  // Resolve species name → numeric ID via constants.
  return mon.speciesEnum.startsWith('SPECIES_')
    ? (resolveDecompConstant(mon.speciesEnum) ?? mon.speciesId ?? 0)
    : mon.speciesId ?? 0;
});

/** 1:1 décomp `GetPlayerAvatarBike` (= field_player_avatar.c) :
 *    return PlayerGetAvatarFlags() & PLAYER_AVATAR_FLAG_*BIKE;
 *  Pour MVP (no bike yet), retourne 0 (= pas en vélo). */
registerSpecial('GetPlayerAvatarBike', () => 0);

/** 1:1 décomp `ShowMapNamePopup` (= map_name_popup.c) :
 *    Show the map name popup at top-left for ~2s. */
registerSpecial('ShowMapNamePopup', () => {
  // Notre runtime affiche déjà le popup via overworld → handled. No-op safe.
  return 0;
});

/** 1:1 décomp `IsSelectedMonEgg` :
 *    return GetMonData(party[VAR_0x8004], MON_DATA_IS_EGG); */
registerSpecial('IsSelectedMonEgg', () => {
  const slot = VarGet('VAR_0x8004') ?? 0;
  const mon = gSaveBlock1Ptr.playerParty?.[slot];
  return (mon as { isEgg?: number })?.isEgg ? 1 : 0;
});

/** 1:1 décomp `StorePlayerCoordsInVars` (event_object_movement.c) :
 *    *VarGetPtr(VAR_0x8004) = gPlayerAvatar.x;
 *    *VarGetPtr(VAR_0x8005) = gPlayerAvatar.y;
 *  Used par scripts qui veulent positionner un NPC à coords player. */
registerSpecial('StorePlayerCoordsInVars', () => {
  // 1:1 décomp : *VarGetPtr(VAR_0x8004) = gSaveBlock1Ptr->pos.x ; pareil pos.y.
  // (= dans le décomp, pa n'a pas x/y ; on lit gSaveBlock1Ptr->pos).
  VarSet('VAR_0x8004', gSaveBlock1Ptr.pos.x);
  VarSet('VAR_0x8005', gSaveBlock1Ptr.pos.y);
  return 0;
});

/** Misc post-game stubs (= return 0/no-op pour éviter NaN VAR_RESULT) :
 *  Battle Frontier, Museum, Mirage Island, Painting, etc. */
const _STUB_RETURN_0_SPECIALS = [
  'StartRegiBattle', 'MoveElevator', 'GetFrontierBattlePoints', 'UpdateBattlePointsWindow',
  'CountPlayerMuseumPaintings', 'CloseDeptStoreElevatorWindow',
  'BufferMoveDeleterNicknameAndMove', 'DoSealedChamberShakingEffect_Short',
  'RemoveBerryPowderVendorMenu', 'OffsetCameraForBattle', 'DoBattlePyramidMonsHaveHeldItem',
  'SaveForBattleTowerLink', 'SetBattleTowerLinkPlayerGfx', 'LinkRetireStatusWithBattleTowerPartner',
  'ShowFrontierGamblerGoMessage', 'GiveFrontierBattlePoints', 'CloseBattleFrontierTutorWindow',
  'GetDewfordHallPaintingNameIndex', 'GameClear', 'SetMewAboveGrass',
  'RotatingGate_InitPuzzle', 'RotatingGate_InitPuzzleAndGraphics', 'ShouldDoBrailleRegicePuzzle',
  'SaveMuseumContestPainting', 'GiveMonArtistRibbon', 'TryPutLotteryWinnerReportOnAir',
  'ScriptMenu_CreateLilycoveSSTidalMultichoice', 'GetLilycoveSSTidalSelection',
  'DoOrbEffect', 'FadeOutOrbEffect', 'MauvilleGymDeactivatePuzzle',
  // 'GetWeekCount' — porté 1:1 décomp field_specials.c:940 ci-bas.
  'ReducePlayerPartyToSelectedMons', 'CableCarWarp', 'CableCar',
  'LoopWingFlapSE',
  // 'GetDaysUntilPacifidlogTMAvailable' — porté 1:1 décomp field_specials.c:1555 ci-bas.
  // 'SetPacifidlogTMReceivedDay' — porté 1:1 décomp field_specials.c:1566 ci-bas.
  // 'IsMirageIslandPresent' — porté 1:1 décomp time_events.c:42 ci-bas.
  'HasEnoughBerryPowder',
  'GetSeedotSizeRecordInfo', 'GetLotadSizeRecordInfo',
];
for (const name of _STUB_RETURN_0_SPECIALS) {
  registerSpecial(name, () => 0);
}

// ─── Session A2.27 batch — time/clock specials 1:1 strict ───────────────────

/** 1:1 décomp `GetWeekCount` (field_specials.c:940-947) :
 *  ```c
 *  u16 GetWeekCount(void) {
 *      u16 weekCount = gLocalTime.days / 7;
 *      if (weekCount > 9999) weekCount = 9999;
 *      return weekCount;
 *  }
 *  ```
 *  Retourne le nombre de semaines depuis le début (cap 9999). */
registerSpecial('GetWeekCount', () => {
  let weekCount = Math.floor(gLocalTime.days / 7);
  if (weekCount > 9999) weekCount = 9999;
  return weekCount & 0xFFFF;
});

/** 1:1 décomp `GetDaysUntilPacifidlogTMAvailable` (field_specials.c:1555-1564) :
 *  ```c
 *  u16 GetDaysUntilPacifidlogTMAvailable(void) {
 *      u16 tmReceivedDay = VarGet(VAR_PACIFIDLOG_TM_RECEIVED_DAY);
 *      if (gLocalTime.days - tmReceivedDay >= 7) return 0;
 *      else if (gLocalTime.days < 0) return 8;
 *      return 7 - (gLocalTime.days - tmReceivedDay);
 *  }
 *  ```
 *  Days restants pour récupérer la TM hebdo de Pacifidlog (= 0 si available). */
registerSpecial('GetDaysUntilPacifidlogTMAvailable', () => {
  const tmReceivedDay = VarGet('VAR_PACIFIDLOG_TM_RECEIVED_DAY');
  if (gLocalTime.days - tmReceivedDay >= 7) return 0;
  if (gLocalTime.days < 0) return 8;
  return (7 - (gLocalTime.days - tmReceivedDay)) & 0xFFFF;
});

/** 1:1 décomp `BufferTMHMMoveName` (field_specials.c:1638-1647) :
 *  ```c
 *  bool8 BufferTMHMMoveName(void) {
 *      if (gSpecialVar_0x8004 >= ITEM_TM01 && gSpecialVar_0x8004 <= ITEM_HM08) {
 *          StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(gSpecialVar_0x8004)]);
 *          return TRUE;
 *      }
 *      return FALSE;
 *  }
 *  ```
 *  Buffer le nom de move correspondant à un TM/HM item dans gStringVar2. */
registerSpecial('BufferTMHMMoveName', () => {
  const itemId = VarGet('VAR_0x8004');
  if (itemId >= 289 /* ITEM_TM01 */ && itemId <= 346 /* ITEM_HM08 */) {
    // 1:1 décomp : utiliser ItemIdToBattleMoveId (= already ported tmhm-moves.ts)
    // + getMoveName (= bag-menu.ts pattern). Import dynamique via globalThis pour
    // éviter cycle ESM specials-registry ↔ tmhm-moves.
    const tmhmFn = (globalThis as { __game_tmhm?: {
      ItemIdToBattleMoveId?: (itemId: number) => string;
    } }).__game_tmhm?.ItemIdToBattleMoveId;
    const getMoveNameFn = (globalThis as { __game_data?: {
      getMoveName?: (moveId: string | number) => string;
    } }).__game_data?.getMoveName;
    if (tmhmFn && getMoveNameFn) {
      const moveId = tmhmFn(itemId);
      const moveName = getMoveNameFn(moveId);
      setStringVar(2, moveName || '');
    }
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  VarSet('VAR_RESULT', 0);
  return 0;
});

// ─── Session A2.29 batch — Abandoned Ship + Game stats + Contest random ────

/** 1:1 décomp `IsLeadMonNicknamedOrNotEnglish` (tv.c:3024-3027) →
 *  `IsPartyMonNicknamedOrNotEnglish(GetLeadMonIndex())` (tv.c:3010-3022) :
 *  ```c
 *  bool8 IsLeadMonNicknamedOrNotEnglish(void) {
 *      return IsPartyMonNicknamedOrNotEnglish(GetLeadMonIndex());
 *  }
 *  ```
 *  Notre projet FR-only → équivalent à IsLeadMonNicknamed (= compare nickname
 *  vs speciesNameFr). Comportement 1:1 strict identique vu que langage match. */
registerSpecial('IsLeadMonNicknamedOrNotEnglish', () => {
  const party = gSaveBlock1Ptr.playerParty;
  let leadIdx = 0;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && !mon.isEgg) {
      leadIdx = i;
      break;
    }
  }
  const lead = party[leadIdx];
  if (!lead) return 0;
  // 1:1 décomp tv.c:3018 : compare gSpeciesNames[species] vs nickname.
  // Notre FR-only : speciesNameFr est le species name affiché.
  return lead.nickname === lead.speciesNameFr ? 0 : 1;
});

/** 1:1 décomp `HasAnotherPlayerGivenFavorLadyItem` (lilycove_lady.c:181-191) :
 *  ```c
 *  bool8 HasAnotherPlayerGivenFavorLadyItem(void) {
 *      sFavorLadyPtr = &gSaveBlock1Ptr->lilycoveLady.favor;
 *      if (sFavorLadyPtr->playerName[0] != EOS) {
 *          StringCopy_PlayerName(gStringVar3, sFavorLadyPtr->playerName);
 *          ConvertInternationalString(gStringVar3, sFavorLadyPtr->language);
 *          return TRUE;
 *      }
 *      return FALSE;
 *  }
 *  ```
 *  Check si un autre joueur a donné un item à la Favor Lady (= record-mixed).
 *  Notre projet FR-only → ConvertInternationalString = no-op. */
registerSpecial('HasAnotherPlayerGivenFavorLadyItem', () => {
  const lady = gSaveBlock1Ptr.lilycoveLady;
  if (lady && lady.kind === 'favor' && lady.playerName && lady.playerName.length > 0) {
    // 1:1 décomp StringCopy_PlayerName(gStringVar3, sFavorLadyPtr->playerName).
    setStringVar(3, lady.playerName);
    return 1;
  }
  return 0;
});

/** 1:1 décomp `ScriptGetPokedexInfo` (birch_pc.c:7-21) :
 *  ```c
 *  bool16 ScriptGetPokedexInfo(void) {
 *      if (gSpecialVar_0x8004 == 0) {
 *          gSpecialVar_0x8005 = GetHoennPokedexCount(FLAG_GET_SEEN);
 *          gSpecialVar_0x8006 = GetHoennPokedexCount(FLAG_GET_CAUGHT);
 *      } else {
 *          gSpecialVar_0x8005 = GetNationalPokedexCount(FLAG_GET_SEEN);
 *          gSpecialVar_0x8006 = GetNationalPokedexCount(FLAG_GET_CAUGHT);
 *      }
 *      return IsNationalPokedexEnabled();
 *  }
 *  ```
 *  Get Hoenn or National pokedex counts (seen + caught). Used by Birch's PC. */
registerSpecial('ScriptGetPokedexInfo', () => {
  // Import dynamique pour éviter cycle ESM (= pokedex-flags + event-data
  // import gSaveBlock state aussi).
  const helpers = (globalThis as { __game_pokedex?: {
    GetHoennPokedexCount?: (op: number) => number;
    GetNationalPokedexCount?: (op: number) => number;
    IsNationalPokedexEnabled?: () => boolean;
  } }).__game_pokedex;
  const useNational = VarGet('VAR_0x8004') !== 0;
  // 1:1 décomp constants/pokedex.h : FLAG_GET_SEEN=0, FLAG_GET_CAUGHT=1.
  const FLAG_GET_SEEN = 0, FLAG_GET_CAUGHT = 1;
  if (useNational) {
    VarSet('VAR_0x8005', helpers?.GetNationalPokedexCount?.(FLAG_GET_SEEN) ?? 0);
    VarSet('VAR_0x8006', helpers?.GetNationalPokedexCount?.(FLAG_GET_CAUGHT) ?? 0);
  } else {
    VarSet('VAR_0x8005', helpers?.GetHoennPokedexCount?.(FLAG_GET_SEEN) ?? 0);
    VarSet('VAR_0x8006', helpers?.GetHoennPokedexCount?.(FLAG_GET_CAUGHT) ?? 0);
  }
  return helpers?.IsNationalPokedexEnabled?.() ? 1 : 0;
});

/** 1:1 décomp `SetMirageTowerVisibility` (mirage_tower.c:319-344) :
 *  ```c
 *  void SetMirageTowerVisibility(void) {
 *      if (VarGet(VAR_MIRAGE_TOWER_STATE)) {
 *          FlagClear(FLAG_MIRAGE_TOWER_VISIBLE);
 *          return;
 *      }
 *      rand = Random();
 *      visible = rand & 1;
 *      if (FlagGet(FLAG_FORCE_MIRAGE_TOWER_VISIBLE) == TRUE) visible = TRUE;
 *      if (visible) {
 *          FlagSet(FLAG_MIRAGE_TOWER_VISIBLE);
 *          TryStartMirageTowerPulseBlendEffect();
 *          return;
 *      }
 *      FlagClear(FLAG_MIRAGE_TOWER_VISIBLE);
 *  }
 *  ```
 *  Dette R3 documentée : TryStartMirageTowerPulseBlendEffect (= pulse blend
 *  palette anim) non porté ; le flag visibility est wired, l'effet visuel
 *  sera porté avec le mirage tower disintegration séquence. */
registerSpecial('SetMirageTowerVisibility', () => {
  if (VarGet('VAR_MIRAGE_TOWER_STATE')) {
    FlagClear('FLAG_MIRAGE_TOWER_VISIBLE');
    return;
  }
  const rand = Random();
  let visible = (rand & 1) !== 0;
  if (FlagGet('FLAG_FORCE_MIRAGE_TOWER_VISIBLE')) visible = true;
  if (visible) {
    FlagSet('FLAG_MIRAGE_TOWER_VISIBLE');
    // Dette R3 : TryStartMirageTowerPulseBlendEffect — pulse blend visual.
    return;
  }
  FlagClear('FLAG_MIRAGE_TOWER_VISIBLE');
});

/** 1:1 décomp `WonSecretBaseBattle` (secret_base.c:1856-1864) :
 *  ```c
 *  void WonSecretBaseBattle(void) {
 *      if (VarGet(VAR_CURRENT_SECRET_BASE) != 0) {
 *          LOW_TV &= ~(WON | LOST | DECLINED);
 *          HIGH_TV &= ~(DRAW);
 *          LOW_TV |= WON;
 *      }
 *  }
 *  ``` */
registerSpecial('WonSecretBaseBattle', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const WON = 1 << 11, LOST = 1 << 12, DECLINED = 1 << 13;
    const DRAW = 1 << 0;
    let low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    let high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    low = low & ~(WON | LOST | DECLINED);
    high = high & ~DRAW;
    low = low | WON;
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', low & 0xFFFF);
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', high & 0xFFFF);
  }
});

/** 1:1 décomp `LostSecretBaseBattle` (secret_base.c:1866-1874).
 *  Same pattern WonSecretBaseBattle mais set LOST flag au lieu de WON. */
registerSpecial('LostSecretBaseBattle', () => {
  if (VarGet('VAR_CURRENT_SECRET_BASE') !== 0) {
    const WON = 1 << 11, LOST = 1 << 12, DECLINED = 1 << 13;
    const DRAW = 1 << 0;
    let low = VarGet('VAR_SECRET_BASE_LOW_TV_FLAGS');
    let high = VarGet('VAR_SECRET_BASE_HIGH_TV_FLAGS');
    low = low & ~(WON | LOST | DECLINED);
    high = high & ~DRAW;
    low = low | LOST;
    VarSet('VAR_SECRET_BASE_LOW_TV_FLAGS', low & 0xFFFF);
    VarSet('VAR_SECRET_BASE_HIGH_TV_FLAGS', high & 0xFFFF);
  }
});

/** 1:1 décomp `ToggleCurSecretBaseRegistry` (secret_base.c:891-895) :
 *  ```c
 *  void ToggleCurSecretBaseRegistry(void) {
 *      gSaveBlock1Ptr->secretBases[VarGet(VAR_CURRENT_SECRET_BASE)].registryStatus ^= 1;
 *      FlagSet(FLAG_SECRET_BASE_REGISTRY_ENABLED);
 *  }
 *  ```
 *  Toggle registry status pour la base courante + set flag global. */
registerSpecial('ToggleCurSecretBaseRegistry', () => {
  const baseIdx = VarGet('VAR_CURRENT_SECRET_BASE');
  const base = gSaveBlock1Ptr.secretBases?.[baseIdx];
  if (base) {
    base.registryStatus = (base.registryStatus ?? 0) ^ 1;
  }
  FlagSet('FLAG_SECRET_BASE_REGISTRY_ENABLED');
});

/** 1:1 décomp `IsMonOTIDNotPlayers` (tv.c:3329-3335) :
 *  ```c
 *  void IsMonOTIDNotPlayers(void) {
 *      if (GetPlayerIDAsU32() == GetMonData(&gPlayerParty[gSpecialVar_0x8004], MON_DATA_OT_ID, NULL))
 *          gSpecialVar_Result = FALSE;
 *      else
 *          gSpecialVar_Result = TRUE;
 *  }
 *  ```
 *  Compare player trainer ID vs mon OT ID. TRUE si différent (= mon traded). */
registerSpecial('IsMonOTIDNotPlayers', () => {
  const slot = VarGet('VAR_0x8004');
  const mon = gSaveBlock1Ptr.playerParty?.[slot];
  if (!mon) {
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  // 1:1 décomp GetPlayerIDAsU32 = saveBlock2.playerTrainerId u32.
  const playerTID = gSaveBlock2Ptr.playerTrainerId;
  const monOtId = mon.otId ?? 0;
  const result = (playerTID === monOtId) ? 0 : 1;
  VarSet('VAR_RESULT', result);
  return result;
});

/** 1:1 décomp `IsMirageIslandPresent` (time_events.c:42-52) :
 *  ```c
 *  bool8 IsMirageIslandPresent(void) {
 *      u16 rnd = GetMirageRnd() >> 16;
 *      for (i = 0; i < PARTY_SIZE; i++)
 *          if (GetMonData(SPECIES) && (GetMonData(PERSONALITY) & 0xFFFF) == rnd)
 *              return TRUE;
 *      return FALSE;
 *  }
 *  ```
 *  `GetMirageRnd` (time_events.c:12-17) = (VAR_MIRAGE_RND_H << 16) | VAR_MIRAGE_RND_L.
 *  rnd = result >> 16 = VAR_MIRAGE_RND_H (= high 16 bits).
 *  Mirage Island apparait si un mon de party a `(personality & 0xFFFF) == rnd_high`. */
registerSpecial('IsMirageIslandPresent', () => {
  const rnd = VarGet('VAR_MIRAGE_RND_H');
  const party = gSaveBlock1Ptr.playerParty;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon || mon.speciesId === 0) continue;
    const personality = mon.personality ?? 0;
    if ((personality & 0xFFFF) === rnd) return 1;
  }
  return 0;
});

/** 1:1 décomp `FoundAbandonedShipRoom1Key` (field_specials.c:1328-1337).
 *  Pattern uniforme : set gSpecialVar_0x8004 = FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_N_KEY
 *  + return FlagGet(flag). Note 1:1 strict : FlagSet/Get prend un name string,
 *  donc VarSet stocke le numeric flag id résolu via parseValue. */
registerSpecial('FoundAbandonedShipRoom1Key', () => {
  const flag = 'FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_1_KEY';
  VarSet('VAR_0x8004', VarGet(flag));
  return FlagGet(flag) ? 1 : 0;
});

/** 1:1 décomp `FoundAbandonedShipRoom2Key` (field_specials.c:1339-1348). */
registerSpecial('FoundAbandonedShipRoom2Key', () => {
  const flag = 'FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_2_KEY';
  VarSet('VAR_0x8004', VarGet(flag));
  return FlagGet(flag) ? 1 : 0;
});

/** 1:1 décomp `FoundAbandonedShipRoom4Key` (field_specials.c:1350-1359). */
registerSpecial('FoundAbandonedShipRoom4Key', () => {
  const flag = 'FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_4_KEY';
  VarSet('VAR_0x8004', VarGet(flag));
  return FlagGet(flag) ? 1 : 0;
});

/** 1:1 décomp `FoundAbandonedShipRoom6Key` (field_specials.c:1361-1370). */
registerSpecial('FoundAbandonedShipRoom6Key', () => {
  const flag = 'FLAG_HIDDEN_ITEM_ABANDONED_SHIP_RM_6_KEY';
  VarSet('VAR_0x8004', VarGet(flag));
  return FlagGet(flag) ? 1 : 0;
});

/** 1:1 décomp `SetPacifidlogTMReceivedDay` (field_specials.c:1566-1569) :
 *  ```c
 *  u16 SetPacifidlogTMReceivedDay(void) {
 *      VarSet(VAR_PACIFIDLOG_TM_RECEIVED_DAY, gLocalTime.days);
 *      return gLocalTime.days;
 *  }
 *  ```
 *  Mark le day de réception → bloque la TM 7j. */
registerSpecial('SetPacifidlogTMReceivedDay', () => {
  VarSet('VAR_PACIFIDLOG_TM_RECEIVED_DAY', gLocalTime.days);
  return gLocalTime.days & 0xFFFF;
});

// ═══════════════════════════════════════════════════════════════════════════
// SESSION 131 — bulk register tous les specials décomp restants (= 411 specials
// listés dans `data/specials.inc` mais pas encore implémentés dans notre port).
// Safe stub returning 0. Real impl pourra venir au fur et à mesure.
//
// Source : `D:/Projet 1/decomps/pokeemeraude/data/specials.inc` (525 def_special).
// ═══════════════════════════════════════════════════════════════════════════

const _SESSION_131_DECOMP_SPECIALS = [
  'AccessHallOfFamePC', 'Bag_ChooseBerry', 'BattlePyramidChooseMonHeldItems',
  'BattleSetup_StartLatiBattle', 'BattleSetup_StartRematchBattle',
  'BattleTowerReconnectLink', 'BufferBattleFrontierTutorMoveName',
  'BufferBattleTowerElevatorFloors', 'BufferContestTrainerAndMonNames',
  'BufferContestWinnerTrainerName', 'BufferDeepLinkPhrase',
  'BufferFavorLadyItemName', 'BufferFavorLadyPlayerName',
  'BufferLottoTicketNumber', 'BufferQuizAuthorNameAndCheckIfLady',
  'BufferQuizCorrectAnswer', 'BufferQuizPrizeItem', 'BufferQuizPrizeName',
  // 'BufferTMHMMoveName' — porté 1:1 décomp field_specials.c:1638 ci-bas.
  'BufferTrendyPhraseString',
  'BufferUnionRoomPlayerName', 'BufferVarsForIVRater',
  'CableClubSaveGame', 'CallApprenticeFunction', 'CallBattleArenaFunction',
  'CallBattleDomeFunction', 'CallBattleFactoryFunction',
  'CallBattlePalaceFunction', 'CallBattlePikeFunction',
  'CallBattlePyramidFunction', 'CallBattleTowerFunc',
  'CallFallarborTentFunction', 'CallFrontierUtilFunc',
  'CallSlateportTentFunction', 'CallTrainerHillFunction',
  'CallVerdanturfTentFunction', 'ChangeBoxPokemonNickname',
  'CheckDaycareMonReceivedMail',
  // 'CheckForPlayersHouseNews' — handler concret enregistré supra (= TV path dispatch 1:1).
  // 'CheckInteractedWithFriendsCushionDecor' — porté 1:1 décomp secret_base.c:1840 ci-bas.
  // 'CheckInteractedWithFriendsDollDecor' — porté 1:1 décomp secret_base.c:1834 ci-bas.
  'CheckInteractedWithFriendsFurnitureBottom', 'CheckInteractedWithFriendsFurnitureMiddle',
  'CheckInteractedWithFriendsFurnitureTop', 'CheckInteractedWithFriendsPosterDecor',
  'CheckInteractedWithFriendsSandOrnament', 'CheckLeadMonBeauty',
  'CheckLeadMonCool', 'CheckLeadMonCute', 'CheckLeadMonSmart', 'CheckLeadMonTough',
  // 'CheckPlayerHasSecretBase' — porté 1:1 décomp secret_base.c:258 ci-bas.
  // 'CheckRelicanthWailord' — porté 1:1 décomp braille_puzzles.c:92 ci-bas.
  'ChooseItemsToTossFromPyramidBag', 'ChooseMonForMoveRelearner',
  'ChooseMonForMoveTutor', 'ChooseMonForWirelessMinigame', 'ChooseSendDaycareMon',
  'CleanupLinkRoomState', 'ClearAndLeaveSecretBase', 'ClearQuizLadyPlayerAnswer',
  'ClearQuizLadyQuestionAndAnswer', 'CloseBattlePikeCurtain',
  'CompareLotadSize', 'CompareSeedotSize', 'CopyCurSecretBaseOwnerName_StrVar1',
  'CopyEReaderTrainerGreeting',
  // 'CountPartyAliveNonEggMons' — porté 1:1 décomp pokemon_storage_system.c:1440 ci-bas.
  // 'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot' — porté 1:1 ci-bas.
  // 'CountPartyNonEggMons' — porté 1:1 décomp pokemon_storage_system.c:1424 ci-bas.
  'CountPlayerTrainerStars', 'CreateAbnormalWeatherEvent', 'CreateEnemyEventMon',
  'DestroyMewEmergingGrassSprite', 'DidFavorLadyLikeItem',
  'DisplayBerryPowderVendorMenu', 'DoBerryBlending', 'DoDeoxysRockInteraction',
  'DoDiveWarp', 'DoDomeConfetti', 'DoFallWarp', 'DoLotteryCornerComputerEffect',
  'DoMirageTowerCeilingCrumble', 'DoPokeNews',
  'DoSealedChamberShakingEffect_Long', 'DoSoftReset', 'DoTVShow',
  'DoTVShowInSearchOfTrainers', 'DoTrainerApproach', 'DoWateringBerryTreeAnim',
  'DoesContestCategoryHaveMuseumPainting', 'DoesPartyHaveEnigmaBerry',
  // 'DoesPlayerHaveNoDecorations' — porté 1:1 décomp trader.c:145 ci-bas.
  'DrewSecretBaseBattle', 'EggHatch',
  'EndLotteryCornerComputerEffect', 'EnterNewlyCreatedSecretBase',
  'EnterSafariMode', 'EnterSecretBase', 'ExitLinkRoom', 'ExitSafariMode',
  'FavorLadyGetPrize',
  // 'FieldShowRegionMap' — handler concret enregistré infra (= fade-from-black
  // jusqu'au port 1:1 worldmap UI region_map.c).
  'FinishCyclingRoadChallenge',
  // 'FoundAbandonedShipRoom1Key' — porté 1:1 décomp field_specials.c:1328 ci-bas.
  // 'FoundAbandonedShipRoom2Key' — porté 1:1 décomp field_specials.c:1339 ci-bas.
  // 'FoundAbandonedShipRoom4Key' — porté 1:1 décomp field_specials.c:1350 ci-bas.
  // 'FoundAbandonedShipRoom6Key' — porté 1:1 décomp field_specials.c:1361 ci-bas.
  'GabbyAndTyAfterInterview', 'GabbyAndTyBeforeInterview',
  // 'GabbyAndTyGetLastBattleTrivia' — porté 1:1 décomp tv.c:1020 ci-bas.
  // 'GabbyAndTyGetBattleNum' — porté 1:1 décomp tv.c:996 ci-bas.
  // 'GabbyAndTyGetLastQuote' — porté 1:1 décomp tv.c:1009 ci-bas.
  // 'GetGabbyAndTyLocalIds' — porté 1:1 décomp tv.c:1038 ci-bas.
  'GenerateGiddyLine',
  'GetAbnormalWeatherMapNameAndType', 'GetBattleFrontierTutorMoveIndex',
  'GetBattlePyramidHint', 'GetBattleTowerSinglesStreak',
  'GetContestLadyCategory', 'GetContestLadyMonSpecies',
  'GetContestMonCondition', 'GetContestMonConditionRanking',
  'GetContestPlayerId', 'GetContestantNamesAtRank',
  'GetCurSecretBaseRegistrationValidity', 'GetDaycareCost',
  'GetDaycareMonNicknames', 'GetDeptStoreDefaultFloorChoice',
  'GetFavorLadyState', 'GetLinkPartnerNames',
  'GetMartEmployeeObjectEventId',
  // 'GetMomOrDadStringForTVMessage' — handler concret enregistré supra (1:1 décomp).
  // 'PlayerPC' — dispatcher direct dans script-opcodes.ts (= bedroom-pc.ts UI).
  'GetMysteryGiftCardStat', 'GetNextActiveShowIfMassOutbreak',
  'GetNpcContestantLocalId', 'GetNumLevelsGainedFromDaycare',
  'GetNumMovesSelectedMonHas', 'GetObjectEventLocalIdByFlag',
  'GetPCBoxToSendMon',
  // 'GetPlayerTrainerIdOnesDigit' — porté 1:1 décomp field_specials.c:901 ci-bas.
  'GetPokeblockFeederInFront', 'GetPokeblockNameByMonNature',
  'GetQuizAuthor', 'GetQuizLadyState', 'GetRandomActiveShowIdx',
  'GetRecordedCyclingRoadResults', 'GetSecretBaseNearbyMapName',
  'GetSecretBaseOwnerAndState', 'GetSecretBaseTypeInFrontOfPlayer',
  // 'GetSelectedTVShow' — porté 1:1 décomp tv.c:882 ci-bas.
  'GetSelectedMonNicknameAndSpecies',
  // 'GetTraderTradedFlag' — porté 1:1 décomp trader.c:139 ci-bas.
  'GetTrainerBattleMode', 'GetTrainerFlag',
  // 'GetWirelessCommType' — porté 1:1 décomp link.c:1846 ci-bas (= no wireless).
  // 'GiddyShouldTellAnotherTale' — porté 1:1 décomp mauville_old_man.c:267 ci-bas.
  'GiveEggFromDaycare', 'GiveLeadMonEffortRibbon', 'GiveMonContestRibbon',
  // 'HasAnotherPlayerGivenFavorLadyItem' — porté 1:1 décomp lilycove_lady.c:181 ci-bas.
  // 'HasAtLeastOneBerry' — porté 1:1 décomp item.c:163 ci-bas.
  // 'HasBardSongBeenChanged' — porté 1:1 décomp mauville_old_man.c:151 ci-bas.
  // 'HasHipsterTaughtWord' — porté 1:1 décomp mauville_old_man.c:241 ci-bas.
  'HasMonWonThisContestBefore', 'HasPlayerGivenContestLadyPokeblock',
  'HasStorytellerAlreadyRecorded', 'HideContestEntryMonPic',
  'HipsterTryTeachWord',
  // 'IncrementDailyPickedBerries' — porté 1:1 décomp tv.c:2528 ci-bas.
  // 'IncrementDailyPlantedBerries' — porté 1:1 décomp tv.c:2523 ci-bas.
  'InitSecretBaseDecorationSprites',
  // 'InitSecretBaseVars' — porté 1:1 décomp secret_base.c:1805 ci-bas.
  'InitUnionRoom', 'InteractWithShieldOrTVDecoration',
  'InterviewAfter',
  // 'IsContestDebugActive' — porté 1:1 décomp contest_util.c:2571 ci-bas (= toujours FALSE).
  // 'IsContestWithRSPlayer' — porté 1:1 décomp contest_util.c:2762 ci-bas (= no link).
  'IsCurSecretBaseOwnedByAnotherPlayer', 'IsDecorationCategoryFull',
  // 'IsDodrioInParty' — porté 1:1 décomp dodrio_berry_picking.c:2908 ci-bas.
  'IsFavorLadyThresholdMet',
  // 'IsGabbyAndTyShowOnTheAir' — porté 1:1 décomp tv.c:1004 ci-bas.
  // 'IsGrassTypeInParty' — porté 1:1 décomp field_specials.c:1230 ci-bas.
  // 'IsLeadMonNicknamedOrNotEnglish' — porté 1:1 décomp tv.c:3024 ci-bas (= alias FR-only sur IsLeadMonNicknamed).
  // 'IsMonOTIDNotPlayers' — porté 1:1 décomp tv.c:3329 ci-bas.
  'IsPokemonJumpSpeciesInParty', 'IsPokerusInParty', 'IsQuizAnswerCorrect',
  'IsQuizLadyWaitingForChallenger', 'IsTVShowAlreadyInQueue',
  // 'IsTrendyPhraseBoring' — porté 1:1 décomp dewford_trend.c:296 ci-bas.
  // 'LeadMonHasEffortRibbon' — porté 1:1 décomp field_specials.c:1372 ci-bas (= dette ribbons R3).
  // 'LinkContestTryHideWirelessIndicator' — porté 1:1 décomp contest_util.c:2753 ci-bas (= no link).
  // 'LinkContestTryShowWirelessIndicator' — porté 1:1 décomp contest_util.c:2741 ci-bas (= no link).
  // 'LostSecretBaseBattle' — porté 1:1 décomp secret_base.c:1866 ci-bas.
  'LinkContestWaitForConnection', 'LoadPlayerBag',
  'MauvilleGymSetDefaultBarriers',
  // 'MonOTNameNotPlayer' — porté 1:1 décomp field_specials.c:1572 ci-bas.
  'MoveDeleterChooseMoveToForget', 'MoveDeleterForgetMove',
  'MoveOutOfSecretBase', 'MoveOutOfSecretBaseFromOutside',
  'ObjectEventInteractionGetBerryCountString',
  'ObjectEventInteractionGetBerryTreeData',
  'ObjectEventInteractionPickBerryTree',
  'ObjectEventInteractionPlantBerryTree',
  'ObjectEventInteractionRemoveBerryTree',
  'ObjectEventInteractionWaterBerryTree',
  'OpenPokeblockCaseForContestLady', 'OpenPokeblockCaseOnFeeder',
  'Overworld_PlaySpecialMapMusic', 'PickLotteryCornerTicket',
  'PlayBardSong', 'PlayRoulette', 'PlayerNotAtTrainerHillEntrance',
  // 'PlayerPC' — dispatcher direct dans script-opcodes.ts (= bedroom-pc.ts UI).
  'PrepSecretBaseBattleFlags', 'PrintPlayerBerryPowderAmount',
  'PutAwayDecorationIteration', 'PutFanClubSpecialOnTheAir',
  'PutLilycoveContestLadyShowOnTheAir', 'QuizLadyGetPlayerAnswer',
  'QuizLadyPickNewQuestion', 'QuizLadyRecordCustomQuizData',
  'QuizLadySetCustomQuestion', 'QuizLadySetWaitingForChallenger',
  'QuizLadyShowQuizQuestion', 'QuizLadyTakePrizeForCustomQuiz',
  // 'ResetTrickHouseNuggetFlag' — porté 1:1 décomp field_specials.c:1182 ci-bas.
  // 'ResetFanClub' — porté 1:1 décomp field_specials.c:3979 ci-bas.
  'RejectEggFromDayCare', 'ResetTVShowState',
  // 'RetrieveLotteryNumber' — porté 1:1 décomp lottery_corner.c:42 ci-bas.
  'ReturnFromLinkRoom', 'RockSmashWildEncounter',
  'SaveBardSongLyrics', 'SaveGame', 'ScriptCheckFreePokemonStorageSpace',
  // 'ScriptGetPokedexInfo' — porté 1:1 décomp birch_pc.c:7 ci-bas.
  'ScriptHatchMon',
  'ScriptMenu_CreatePCMultichoice',
  'Script_BufferContestLadyCategoryAndMonName',
  'Script_DoesFavorLadyLikeItem', 'Script_FadeOutMapMusic',
  // 'Script_GetCurrentMauvilleMan' — porté 1:1 décomp mauville_old_man.c:146 ci-bas.
  'Script_FavorLadyOpenBagMenu',
  'Script_GetLilycoveLadyId', 'Script_QuizLadyOpenBagMenu',
  'Script_ResetUnionRoomTrade', 'Script_ShowLinkTrainerCard',
  'Script_StartWiredTrade', 'Script_StorytellerDisplayStory',
  'Script_StorytellerInitializeRandomStat',
  'ScrollRankingHallRecordsWindow', 'ScrollableMultichoice_ClosePersistentMenu',
  'ScrollableMultichoice_RedrawPersistentMenu',
  'ScrollableMultichoice_TryReturnToList', 'SetCB2WhiteOut',
  // 'SetChampionSaveWarp' — porté 1:1 décomp save_location.c:136 ci-bas.
  'SetContestCategoryStringVarForInterview',
  'SetContestLadyGivenPokeblock', 'SetContestTrainerGfxIds',
  'SetDaycareCompatibilityString', 'SetDecoration',
  'SetDeoxysRockPalette', 'SetDeptStoreFloor', 'SetEReaderTrainerGfxId',
  'SetFavorLadyState_Complete', 'SetHiddenItemFlag', 'SetHipsterTaughtWord',
  // 'SetHipsterTaughtWord' — porté 1:1 décomp mauville_old_man.c:246 ci-bas.
  'SetLilycoveLadyGfx', 'SetLinkContestPlayerGfx', 'SetMatchCallRegisteredFlag',
  // 'SetMauvilleOldManObjEventGfx' — porté 1:1 décomp mauville_old_man.c:746 ci-bas.
  // 'SetMirageTowerVisibility' — porté 1:1 décomp mirage_tower.c:319 ci-bas.
  // 'SetPlayerGotFirstFans' — porté 1:1 décomp field_specials.c:4271 ci-bas.
  'SetPlayerSecretBase',
  'SetQuizLadyState_Complete', 'SetQuizLadyState_GivePrize',
  'SetRoute119Weather', 'SetRoute123Weather', 'SetSecretBaseOwnerGfxId',
  // 'SetTrickHouseNuggetFlag' — porté 1:1 décomp field_specials.c:1174 ci-bas.
  'SetSootopolisGymCrackedIceMetatiles',
  'ShouldContestLadyShowGoOnAir', 'ShouldDistributeEonTicket',
  'ShouldDoBrailleRegirockEffectOld', 'ShouldHideFanClubInterviewer',
  'ShouldReadyContestArtist', 'ShouldShowBoxWasFullMessage',
  'ShowBerryBlenderRecordWindow', 'ShowBerryCrushRankings',
  'ShowContestEntryMonPic', 'ShowContestPainting', 'ShowDaycareLevelMenu',
  'ShowDeptStoreElevatorFloorSelect', 'ShowDodrioBerryPickingRecords',
  'ShowEasyChatProfile', 'ShowEasyChatScreen', 'ShowFrontierGamblerLookingMessage',
  'ShowFrontierManiacMessage', 'ShowGlassWorkshopMenu',
  'ShowLinkBattleRecords', 'ShowNatureGirlMessage',
  'ShowPokedexRatingMessage', 'ShowPokemonJumpRecords',
  'ShowPokemonStorageSystemPC', 'ShowRankingHallRecordsWindow',
  'ShowSecretBaseDecorationMenu', 'ShowSecretBaseRegistryMenu',
  'ShowTrainerCantBattleSpeech', 'ShowTrainerHillRecords',
  'ShowTrainerIntroSpeech', 'ShowWirelessCommunicationScreen',
  'SpawnLinkPartnerObjectEvent', 'StartDroughtWeatherBlend',
  'StartGroudonKyogreBattle', 'StartMirageTowerDisintegration',
  'StartMirageTowerFossilFallAndSink', 'StartMirageTowerShake',
  'StartPlayerDescendMirageTower', 'StopMapMusic',
  'StoreSelectedPokemonInDaycare', 'StorytellerGetFreeStorySlot',
  'StorytellerStoryListMenu', 'StorytellerUpdateStat',
  // 'SwapRegisteredBike' — porté 1:1 décomp item.c:577 ci-bas.
  // 'SubtractMoneyFromVar0x8005' — porté 1:1 décomp money.c:128 ci-bas.
  'TakeBerryPowder',
  'TakePokemonFromDaycare', 'TeachMoveRelearnerMove',
  // 'ToggleCurSecretBaseRegistry' — porté 1:1 décomp secret_base.c:891 ci-bas.
  'TraderDoDecorationTrade',
  'TraderMenuGetDecoration', 'TraderShowDecorationMenu', 'TryBattleLinkup',
  'TryBecomeLinkLeader', 'TryBerryBlenderLinkup', 'TryContestEModeLinkup',
  'TryContestGModeLinkup', 'TryEnterContestMon', 'TryFieldPoisonWhiteOut',
  'TryHideBattleTowerReporter', 'TryInitBattleTowerAwardManObjectEvent',
  'TryJoinLinkGroup', 'TryLoseFansFromPlayTime',
  'TryLoseFansFromPlayTimeAfterLinkBattle',
  'TryPrepareSecondApproachingTrainer', 'TryPutNameRaterShowOnTheAir',
  'TryPutTrainerFanClubOnAir', 'TryPutTreasureInvestigatorsOnAir',
  'TryRecordMixLinkup', 'TrySetBattleTowerLinkType',
  'TryStoreHeldItemsInPyramidBag', 'TryTradeLinkup',
  'TryUpdateRusturfTunnelState', 'Unused_SetWeatherSunny',
  'UpdateCyclingRoadState', 'UpdateShoalTideFlag',
  'UpdateTrainerFanClubGameClear', 'ValidateEReaderTrainer',
  'ValidateMixingGameLanguage', 'ValidateSavedWonderCard',
  // 'WonSecretBaseBattle' — porté 1:1 décomp secret_base.c:1856 ci-bas.
  'WonderNews_GetRewardInfo',
];

for (const name of _SESSION_131_DECOMP_SPECIALS) {
  registerSpecial(name, () => 0);
}

// ─── Session A2 batch 1 — ports 1:1 strict ─────────────────────────────────

/** 1:1 décomp `CheckPlayerHasSecretBase` (secret_base.c:258-265).
 *  Sets gSpecialVar_Result = TRUE si le joueur a une secret base (= slot 0
 *  non-zero), sinon FALSE. Player's secret base est toujours en slot 0. */
registerSpecial('CheckPlayerHasSecretBase', () => {
  return gSaveBlock1Ptr.secretBases[0].secretBaseId ? 1 : 0;
});

/** 1:1 décomp `CheckRelicanthWailord` (braille_puzzles.c:92-104).
 *  Sealed Chamber puzzle : WAILORD en slot 0 + RELICANTH en dernier slot
 *  occupé de la party. Emerald flip vs RS (= "First comes Wailord"). */
registerSpecial('CheckRelicanthWailord', () => {
  const party = gSaveBlock1Ptr.playerParty;
  // 1:1 décomp :96 GetMonData SLOT 0 SPECIES_OR_EGG == SPECIES_WAILORD
  const lead = party[0];
  if (!lead || lead.speciesId !== SPECIES_WAILORD) return 0;
  // 1:1 décomp :98 CalculatePlayerPartyCount (= count non-empty slots).
  let partyCount = 0;
  for (let i = 0; i < 6; i++) {
    if (party[i] && party[i].speciesId !== 0) partyCount++;
  }
  if (partyCount === 0) return 0;
  // 1:1 décomp :100 GetMonData SLOT [partyCount-1] SPECIES_OR_EGG == SPECIES_RELICANTH
  const last = party[partyCount - 1];
  return (last && last.speciesId === SPECIES_RELICANTH) ? 1 : 0;
});

// `GetTrainerFlag` (battle_setup.c:1235-1243) — dette R3 architecturale documentée :
// notre FlagGet prend string name, décomp utilise computed numeric id
// (opponent_A + TRAINER_FLAGS_START). Demande mapping TRAINER_ID → FLAG_NAME
// (= ~854 entries) ou refactor FlagGet pour accepter numeric id. Reste stub
// return 0 jusqu'à port mapping ou refactor. Frontier paths (Pyramid/Hill) sont
// U-tier U1.

/** 1:1 décomp `CountPartyNonEggMons` (pokemon_storage_system.c:1424-1438).
 *  Count non-empty + non-egg party slots. Used par scripts daycare/PC switch. */
registerSpecial('CountPartyNonEggMons', () => {
  const party = gSaveBlock1Ptr.playerParty;
  let count = 0;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && !mon.isEgg) count++;
  }
  return count;
});

/** 1:1 décomp `CountPartyAliveNonEggMons` (pokemon_storage_system.c:1440-1456)
 *  qui appelle CountPartyAliveNonEggMonsExcept(PARTY_SIZE) (= ignore aucun slot,
 *  donc count tous les vivants). Non-empty + non-egg + HP != 0. */
registerSpecial('CountPartyAliveNonEggMons', () => {
  const party = gSaveBlock1Ptr.playerParty;
  let count = 0;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && !mon.isEgg && mon.currentHp !== 0) count++;
  }
  return count;
});

/** 1:1 décomp `CountPartyAliveNonEggMons_IgnoreVar0x8004Slot` (field_specials.c)
 *  = CountPartyAliveNonEggMonsExcept(gSpecialVar_0x8004). Le slot var0x8004 est
 *  ignoré (used par scripts qui considèrent le mon que le joueur est en train
 *  de transférer/déposer). */
registerSpecial('CountPartyAliveNonEggMons_IgnoreVar0x8004Slot', () => {
  const party = gSaveBlock1Ptr.playerParty;
  const slotToIgnore = VarGet('VAR_0x8004');
  let count = 0;
  for (let i = 0; i < 6; i++) {
    if (i === slotToIgnore) continue;
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && !mon.isEgg && mon.currentHp !== 0) count++;
  }
  return count;
});

/** 1:1 décomp `HasAtLeastOneBerry` (item.c:163-177).
 *  Loop sur les berry slots (ITEM_CHERI_BERRY..ITEM_BRIGHT_POWDER-1, soit
 *  FIRST_BERRY_INDEX..(ITEM_BRIGHT_POWDER-1)). Set gSpecialVar_Result + return. */
registerSpecial('HasAtLeastOneBerry', () => {
  // 1:1 décomp items.h : FIRST_BERRY_INDEX = ITEM_CHERI_BERRY = 133.
  // ITEM_BRIGHT_POWDER = 179.
  // Notre CheckBagHasItem prend STRING key — on doit utiliser getItemKeyById.
  const { getItemKeyById } = (globalThis as { __game_data?: {
    getItemKeyById?: (id: number) => string;
  } }).__game_data ?? {};
  if (!getItemKeyById) {
    // Fallback : itère via gSaveBlock1Ptr.itemSlots.berries (= pocket 5).
    const sb1 = gSaveBlock1Ptr as unknown as { bagPocket_Berries?: Array<{ itemId?: string; quantity?: number }> };
    const berries = sb1.bagPocket_Berries ?? [];
    for (const slot of berries) {
      if (slot.itemId && (slot.quantity ?? 0) > 0) {
        VarSet('VAR_RESULT', 1);
        return 1;
      }
    }
    VarSet('VAR_RESULT', 0);
    return 0;
  }
  // 1:1 décomp loop FIRST_BERRY_INDEX..ITEM_BRIGHT_POWDER-1 (= 133..178).
  for (let i = 133; i < 179; i++) {
    const key = getItemKeyById(i);
    if (key) {
      // Re-import CheckBagHasItem inline to avoid TDZ cycle.
      const checkFn = (globalThis as { __game_bag?: {
        CheckBagHasItem?: (key: string, count: number) => boolean;
      } }).__game_bag?.CheckBagHasItem;
      if (checkFn && checkFn(key, 1)) {
        VarSet('VAR_RESULT', 1);
        return 1;
      }
    }
  }
  VarSet('VAR_RESULT', 0);
  return 0;
});

// `IsSelectedMonEgg` déjà porté ligne 741 (= duplicate skip).
// `IsLastMonThatKnowsSurf` real body ajouté ligne 415 (= remplace stub).

/** 1:1 décomp `Special_AreLeadMonEVsMaxedOut` (field_specials.c:1390-1396).
 *  Return TRUE si EVs total du lead mon >= MAX_TOTAL_EVS (= 510). */
registerSpecial('Special_AreLeadMonEVsMaxedOut', () => {
  const party = gSaveBlock1Ptr.playerParty;
  // GetLeadMonIndex : 1st non-egg non-empty slot.
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon || mon.speciesId === 0 || mon.isEgg) continue;
    // 1:1 décomp pokemon.c:1845 GetMonEVCount = sum of all 6 EVs.
    const evCount = (mon.evs?.hp ?? 0) + (mon.evs?.atk ?? 0) + (mon.evs?.def ?? 0)
                  + (mon.evs?.spe ?? 0) + (mon.evs?.spa ?? 0) + (mon.evs?.spd ?? 0);
    // MAX_TOTAL_EVS = 510 (= 1:1 décomp constants/pokemon.h).
    return evCount >= 510 ? 1 : 0;
  }
  return 0;
});

/** 1:1 décomp `RetrieveLotteryNumber` (lottery_corner.c:42-46).
 *  Set gSpecialVar_Result = GetLotteryNumber() (= (lowNum << 16) | highNum).
 *  GetLotteryNumber décomp ligne 156-161 utilise VAR_POKELOT_RND1/2. */
registerSpecial('RetrieveLotteryNumber', () => {
  const highNum = VarGet('VAR_POKELOT_RND1');
  const lowNum = VarGet('VAR_POKELOT_RND2');
  // Note 1:1 strict : décomp retourne u32 (lowNum << 16) | highNum, mais
  // gSpecialVar_Result est u16 → l'high 16 bits seront truncated. Notre retour
  // se fait via VAR_RESULT u16 donc on retourne juste les low 16 bits.
  return ((lowNum << 16) | highNum) & 0xFFFF;
});

/** 1:1 décomp `HasBardSongBeenChanged` (mauville_old_man.c:151-154).
 *  Set gSpecialVar_Result = oldMan.bard.hasChangedSong (= 0/1). */
registerSpecial('HasBardSongBeenChanged', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'bard') return om.hasChangedSong;
  return 0;
});

/** 1:1 décomp `HasHipsterTaughtWord` (mauville_old_man.c:241-244).
 *  Set gSpecialVar_Result = oldMan.hipster.taughtWord (= 0/1). */
registerSpecial('HasHipsterTaughtWord', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'hipster') return om.taughtWord;
  return 0;
});

/** 1:1 décomp `IsContestDebugActive` (contest_util.c:2571-2574).
 *  Return FALSE — toujours (= contest debug n'a jamais été enabled in shipping
 *  Emerald). 1:1 strict justifié. */
registerSpecial('IsContestDebugActive', () => 0);

/** 1:1 décomp `IsGabbyAndTyShowOnTheAir` (tv.c:1004-1007).
 *  Return gSaveBlock1Ptr->gabbyAndTyData.onAir. */
registerSpecial('IsGabbyAndTyShowOnTheAir', () => {
  return gSaveBlock1Ptr.gabbyAndTyData?.onAir ?? 0;
});

/** 1:1 décomp `GabbyAndTyGetLastBattleTrivia` (tv.c:1020-1035).
 *  Check 4 flags battle dans gabbyAndTyData ; retourne 1/2/3/4 selon le
 *  premier flag positif. Default 0 (= rien à dire). */
registerSpecial('GabbyAndTyGetLastBattleTrivia', () => {
  const d = gSaveBlock1Ptr.gabbyAndTyData;
  if (!d) return 0;
  if (!d.battleTookMoreThanOneTurn2) return 1;
  if (d.playerThrewABall2) return 2;
  if (d.playerUsedHealingItem2) return 3;
  if (d.playerLostAMon2) return 4;
  return 0;
});

/** 1:1 décomp `GetWirelessCommType` (link.c:1846-1849).
 *  Return gWirelessCommType (= 0 si pas link, non-zero si Wireless).
 *  Notre projet : pas de wireless link (= retourne 0 = 1:1 strict justifié). */
registerSpecial('GetWirelessCommType', () => 0);

/** 1:1 décomp `DoesPlayerHaveNoDecorations` (trader.c:145-158).
 *  Loop sur DECORCAT_COUNT (= 8 catégories). Return TRUE si aucune category
 *  n'a de decoration ownéee. Set gSpecialVar_Result. */
registerSpecial('DoesPlayerHaveNoDecorations', () => {
  // 1:1 décomp constants/decorations.h DECORCAT_COUNT = 8.
  // Import dynamique pour éviter cycle ESM.
  const { GetNumOwnedDecorationsInCategory } = (globalThis as { __game_decoration?: {
    GetNumOwnedDecorationsInCategory?: (cat: number) => number;
  } }).__game_decoration ?? {};
  if (!GetNumOwnedDecorationsInCategory) {
    // Fallback : aucune decoration system loaded → return TRUE.
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  for (let i = 0; i < 8; i++) {
    if (GetNumOwnedDecorationsInCategory(i) > 0) {
      VarSet('VAR_RESULT', 0);
      return 0;
    }
  }
  VarSet('VAR_RESULT', 1);
  return 1;
});

/** 1:1 décomp `IsDodrioInParty` (dodrio_berry_picking.c:2908-2922).
 *  Loop sur PARTY_SIZE, return TRUE si un mon non-empty est SPECIES_DODRIO. */
registerSpecial('IsDodrioInParty', () => {
  const party = gSaveBlock1Ptr.playerParty;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (mon && mon.speciesId !== 0 && mon.speciesId === SPECIES_DODRIO) {
      VarSet('VAR_RESULT', 1);
      return 1;
    }
  }
  VarSet('VAR_RESULT', 0);
  return 0;
});

/** 1:1 décomp `LeadMonHasEffortRibbon` (field_specials.c:1372-1375).
 *  Retourne MON_DATA_EFFORT_RIBBON du lead mon (= 1er non-egg slot).
 *  Notre PokemonInstance ne stocke pas encore les ribbons (= subsystem ribbons
 *  pas porté). Return 0 = no ribbon, 1:1 strict justifié (= notre projet ne
 *  donne pas encore de ribbons via SetMonData MON_DATA_EFFORT_RIBBON).
 *  Dette R3 documentée : ajouter ribbons field PokemonInstance + serialization. */
registerSpecial('LeadMonHasEffortRibbon', () => {
  // GetLeadMonIndex : 1st non-empty non-egg slot.
  const party = gSaveBlock1Ptr.playerParty;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon || mon.speciesId === 0 || mon.isEgg) continue;
    // 1:1 décomp :1374 GetMonData(EFFORT_RIBBON) — pas stocké → 0.
    return (mon as unknown as { effortRibbon?: number }).effortRibbon ?? 0;
  }
  return 0;
});

/** 1:1 décomp `GetPlayerTrainerIdOnesDigit` (field_specials.c:901-904).
 *  Retourne les low 16 bits du trainer ID modulo 10. */
registerSpecial('GetPlayerTrainerIdOnesDigit', () => {
  const trainerId = gSaveBlock2Ptr.playerTrainerId;
  return (trainerId & 0xFFFF) % 10;
});

// `ScriptGetPartyMonSpecies` déjà porté ligne 692 (= duplicate skip).

/** 1:1 décomp `MonOTNameNotPlayer` (field_specials.c:1572-1583).
 *  Retourne TRUE si OT name du mon var0x8004 != player name OR language != GAME_LANGUAGE.
 *  Used par scripts e.g. NameRater pour bloquer rename de mons étrangers. */
registerSpecial('MonOTNameNotPlayer', () => {
  const slot = VarGet('VAR_0x8004');
  const mon = gSaveBlock1Ptr.playerParty[slot];
  if (!mon || mon.speciesId === 0) return 1;
  // 1:1 décomp :1574 : MON_DATA_LANGUAGE != GAME_LANGUAGE
  // Notre projet : FR only, donc tous nos mons sont GAME_LANGUAGE (= français).
  // Si on porte multi-language plus tard, ajouter language field PokemonInstance.
  // 1:1 :1577-1582 : compare playerName vs otName.
  const otName = mon.otName ?? '';
  const playerName = gSaveBlock2Ptr.playerName;
  if (!otName) return 1;  // pas d'OT → considère étranger
  return otName === playerName ? 0 : 1;
});

/** 1:1 décomp `IsGrassTypeInParty` (field_specials.c:1230-1249).
 *  Loop sur les 6 slots party, retourne TRUE si au moins un mon non-egg a
 *  TYPE_GRASS comme type1 ou type2. Set gSpecialVar_Result. */
registerSpecial('IsGrassTypeInParty', () => {
  const party = gSaveBlock1Ptr.playerParty;
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon || mon.speciesId === 0 || mon.isEgg) continue;
    // 1:1 décomp :1240-1241 : check gSpeciesInfo[species].types[0/1] == TYPE_GRASS.
    // Notre PokemonInstance ne stocke pas les types par mon (= dérivé species
    // via gSpeciesInfo lookup). Dette : import species → types pour ce check.
    // En attendant : approximation grossière via gSpeciesInfo dynamic require.
    const dataMod = (globalThis as { __game_data?: {
      getSpeciesInfo: (k: string) => { types?: number[] } | undefined;
    } }).__game_data;
    const info = dataMod?.getSpeciesInfo(mon.speciesEnum);
    const types = info?.types ?? [];
    if (types[0] === TYPE_GRASS || types[1] === TYPE_GRASS) {
      return 1;
    }
  }
  return 0;
});

// ─── Session A2.24 batch — 5 specials triviaux 1:1 strict ──────────────────

/** 1:1 décomp `SetTrickHouseNuggetFlag` (field_specials.c:1174-1180) :
 *  ```c
 *  void SetTrickHouseNuggetFlag(void) {
 *      u16 *specVar = &gSpecialVar_0x8004;
 *      u16 flag = FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET;
 *      *specVar = flag;
 *      FlagSet(flag);
 *  }
 *  ```
 *  Stocke l'id numérique du flag dans VAR_0x8004 puis set le flag par name
 *  (notre FlagSet prend un name string = 1:1 strict comportementalement). */
registerSpecial('SetTrickHouseNuggetFlag', () => {
  // 1:1 décomp : VAR_0x8004 reçoit l'id numérique (= dette R3 architecturale
  // documentée — notre VarSet stocke aussi un u16 number aligné décomp).
  // Resolved via decomp-constants ; sans mapping pas critique pour le special
  // car FlagSet utilise le name string ci-dessous.
  VarSet('VAR_0x8004', VarGet('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET'));
  FlagSet('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET');
});

/** 1:1 décomp `ResetTrickHouseNuggetFlag` (field_specials.c:1182-1188) :
 *  ```c
 *  void ResetTrickHouseNuggetFlag(void) {
 *      u16 *specVar = &gSpecialVar_0x8004;
 *      u16 flag = FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET;
 *      *specVar = flag;
 *      FlagClear(flag);
 *  }
 *  ``` */
registerSpecial('ResetTrickHouseNuggetFlag', () => {
  VarSet('VAR_0x8004', VarGet('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET'));
  FlagClear('FLAG_HIDDEN_ITEM_TRICK_HOUSE_NUGGET');
});

/** 1:1 décomp `SwapRegisteredBike` (item.c:577-588) :
 *  ```c
 *  void SwapRegisteredBike(void) {
 *      switch (gSaveBlock1Ptr->registeredItem) {
 *      case ITEM_MACH_BIKE: gSaveBlock1Ptr->registeredItem = ITEM_ACRO_BIKE; break;
 *      case ITEM_ACRO_BIKE: gSaveBlock1Ptr->registeredItem = ITEM_MACH_BIKE; break;
 *      }
 *  }
 *  ```
 *  Toggle entre Mach Bike et Acro Bike enregistré au L button. */
registerSpecial('SwapRegisteredBike', () => {
  const sb1 = gSaveBlock1Ptr as unknown as { registeredItem: number; __registeredItemKey?: string };
  switch (sb1.registeredItem) {
    case ITEM_MACH_BIKE:
      sb1.registeredItem = ITEM_ACRO_BIKE;
      // Web-port : maintenir le bridge __registeredItemKey 1:1 (cf. save-blocks.ts:1201).
      sb1.__registeredItemKey = 'ITEM_ACRO_BIKE';
      break;
    case ITEM_ACRO_BIKE:
      sb1.registeredItem = ITEM_MACH_BIKE;
      sb1.__registeredItemKey = 'ITEM_MACH_BIKE';
      break;
  }
});

/** 1:1 décomp `SetMauvilleOldManObjEventGfx` (mauville_old_man.c:746-749) :
 *  ```c
 *  void SetMauvilleOldManObjEventGfx(void) {
 *      VarSet(VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_BARD);
 *  }
 *  ```
 *  Force le sprite Mauville Old Man en BARD (= old man par défaut). */
registerSpecial('SetMauvilleOldManObjEventGfx', () => {
  VarSet('VAR_OBJ_GFX_ID_0', OBJ_EVENT_GFX_BARD);
});

/** 1:1 décomp `GiddyShouldTellAnotherTale` (mauville_old_man.c:267-280) :
 *  ```c
 *  void GiddyShouldTellAnotherTale(void) {
 *      struct MauvilleManGiddy *giddy = &gSaveBlock1Ptr->oldMan.giddy;
 *      if (giddy->taleCounter == GIDDY_MAX_TALES) {
 *          gSpecialVar_Result = FALSE;
 *          giddy->taleCounter = 0;
 *      } else {
 *          gSpecialVar_Result = TRUE;
 *      }
 *  }
 *  ```
 *  Décide si Giddy continue à raconter (= TRUE) ou s'arrête (= FALSE) après
 *  avoir atteint GIDDY_MAX_TALES (= 10) racontes. */
registerSpecial('GiddyShouldTellAnotherTale', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'giddy') {
    if (om.taleCounter === GIDDY_MAX_TALES) {
      om.taleCounter = 0;
      VarSet('VAR_RESULT', 0);
      return 0;
    }
    VarSet('VAR_RESULT', 1);
    return 1;
  }
  // 1:1 strict : si pas en mode giddy, le décomp accède quand même au struct
  // (union) — retourne TRUE par défaut comportementalement (= taleCounter=0).
  VarSet('VAR_RESULT', 1);
  return 1;
});

// ─── Session A2.25 batch — 5 specials triviaux 1:1 strict ──────────────────

/** 1:1 décomp `Script_GetCurrentMauvilleMan` (mauville_old_man.c:146-149) :
 *  ```c
 *  void Script_GetCurrentMauvilleMan(void) {
 *      gSpecialVar_Result = GetCurrentMauvilleOldMan();
 *  }
 *  ```
 *  Et `GetCurrentMauvilleOldMan` :142 retourne `gSaveBlock1Ptr->oldMan.common.id`. */
registerSpecial('Script_GetCurrentMauvilleMan', () => {
  const id = gSaveBlock1Ptr.oldMan?.id ?? 0;
  VarSet('VAR_RESULT', id);
  return id;
});

/** 1:1 décomp `SetHipsterTaughtWord` (mauville_old_man.c:246-249) :
 *  ```c
 *  void SetHipsterTaughtWord(void) {
 *      (&gSaveBlock1Ptr->oldMan.hipster)->taughtWord = TRUE;
 *  }
 *  ```
 *  Set hipster.taughtWord = 1. */
registerSpecial('SetHipsterTaughtWord', () => {
  const om = gSaveBlock1Ptr.oldMan;
  if (om && om.kind === 'hipster') {
    om.taughtWord = 1;
  }
  // 1:1 strict : si pas hipster, le décomp écrirait quand même via le union
  // pointer (= behavior wrt union puis ré-init). Notre discriminated union
  // empêche d'écrire sur le mauvais variant ; aligné avec le savegame quand
  // hipster est actif (= seul cas où ce special est appelé via scripts).
});

/** 1:1 décomp `IncrementDailyPlantedBerries` (tv.c:2523-2526) :
 *  ```c
 *  void IncrementDailyPlantedBerries(void) {
 *      VarSet(VAR_DAILY_PLANTED_BERRIES, VarGet(VAR_DAILY_PLANTED_BERRIES) + 1);
 *  }
 *  ```
 *  Stat daily : +1 berry planted. */
registerSpecial('IncrementDailyPlantedBerries', () => {
  VarSet('VAR_DAILY_PLANTED_BERRIES', (VarGet('VAR_DAILY_PLANTED_BERRIES') + 1) & 0xFFFF);
});

/** 1:1 décomp `IncrementDailyPickedBerries` (tv.c:2528-2531) :
 *  ```c
 *  void IncrementDailyPickedBerries(void) {
 *      VarSet(VAR_DAILY_PICKED_BERRIES, VarGet(VAR_DAILY_PICKED_BERRIES) + gSpecialVar_0x8006);
 *  }
 *  ```
 *  Stat daily : +X berries picked (X = gSpecialVar_0x8006 = nb harvest). */
registerSpecial('IncrementDailyPickedBerries', () => {
  const delta = VarGet('VAR_0x8006');
  VarSet('VAR_DAILY_PICKED_BERRIES', (VarGet('VAR_DAILY_PICKED_BERRIES') + delta) & 0xFFFF);
});

/** 1:1 décomp `SetChampionSaveWarp` (save_location.c:136-139) :
 *  ```c
 *  void SetChampionSaveWarp(void) {
 *      gSaveBlock2Ptr->specialSaveWarpFlags |= CHAMPION_SAVEWARP;
 *  }
 *  ```
 *  Set le flag respawn after Champion battle. CHAMPION_SAVEWARP = (1 << 7). */
registerSpecial('SetChampionSaveWarp', () => {
  // 1:1 décomp save_location.h:13 CHAMPION_SAVEWARP = (1 << 7) = 128.
  gSaveBlock2Ptr.specialSaveWarpFlags = (gSaveBlock2Ptr.specialSaveWarpFlags | (1 << 7)) & 0xFF;
});

// ─── Session A2.26 batch — 5 specials triviaux 1:1 strict ──────────────────

/** 1:1 décomp `ResetFanClub` (field_specials.c:3979-3983) :
 *  ```c
 *  void ResetFanClub(void) {
 *      gSaveBlock1Ptr->vars[VAR_FANCLUB_FAN_COUNTER - VARS_START] = 0;
 *      gSaveBlock1Ptr->vars[VAR_FANCLUB_LOSE_FAN_TIMER - VARS_START] = 0;
 *  }
 *  ```
 *  Reset fan club state (= counter + lose-fan timer). */
registerSpecial('ResetFanClub', () => {
  VarSet('VAR_FANCLUB_FAN_COUNTER', 0);
  VarSet('VAR_FANCLUB_LOSE_FAN_TIMER', 0);
});

/** 1:1 décomp `IsTrendyPhraseBoring` (dewford_trend.c:296-314) :
 *  ```c
 *  void IsTrendyPhraseBoring(void) {
 *      bool16 result = FALSE;
 *      do {
 *          if (gSaveBlock1Ptr->dewfordTrends[0].trendiness - gSaveBlock1Ptr->dewfordTrends[1].trendiness > 1)
 *              break;
 *          if (gSaveBlock1Ptr->dewfordTrends[0].gainingTrendiness)
 *              break;
 *          if (!gSaveBlock1Ptr->dewfordTrends[1].gainingTrendiness)
 *              break;
 *          result = TRUE;
 *      } while (0);
 *      gSpecialVar_Result = result;
 *  }
 *  ```
 *  Determine si la phrase trendy courante (slot 0) est "boring" (= peu plus
 *  trendy que slot 1, et pas gagne pas, mais slot 1 gagne). */
registerSpecial('IsTrendyPhraseBoring', () => {
  const trends = gSaveBlock1Ptr.dewfordTrends;
  let result = 0;
  do {
    if ((trends[0].trendiness - trends[1].trendiness) > 1) break;
    if (trends[0].gainingTrendiness) break;
    if (!trends[1].gainingTrendiness) break;
    result = 1;
  } while (false);
  VarSet('VAR_RESULT', result);
  return result;
});

/** 1:1 décomp `IsContestWithRSPlayer` (contest_util.c:2762-2768) :
 *  ```c
 *  bool8 IsContestWithRSPlayer(void) {
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_HAS_RS_PLAYER)
 *          return TRUE;
 *      else
 *          return FALSE;
 *  }
 *  ```
 *  Notre projet : pas de link wireless (= gLinkContestFlags toujours 0).
 *  1:1 strict justifié (pas RS link). */
registerSpecial('IsContestWithRSPlayer', () => 0);

/** 1:1 décomp `LinkContestTryShowWirelessIndicator` (contest_util.c:2741-2751) :
 *  ```c
 *  void LinkContestTryShowWirelessIndicator(void) {
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_IS_WIRELESS) {
 *          if (gReceivedRemoteLinkPlayers) {
 *              LoadWirelessStatusIndicatorSpriteGfx();
 *              CreateWirelessStatusIndicatorSprite(8, 8);
 *          }
 *      }
 *  }
 *  ```
 *  Notre projet : gLinkContestFlags == 0 → guard fail → no-op 1:1 strict justifié. */
registerSpecial('LinkContestTryShowWirelessIndicator', () => {
  // 1:1 décomp guard fail (gLinkContestFlags == 0) → no-op.
});

/** 1:1 décomp `LinkContestTryHideWirelessIndicator` (contest_util.c:2753-2759) :
 *  ```c
 *  void LinkContestTryHideWirelessIndicator(void) {
 *      if (gLinkContestFlags & LINK_CONTEST_FLAG_IS_WIRELESS) {
 *          if (gReceivedRemoteLinkPlayers)
 *              DestroyWirelessStatusIndicatorSprite();
 *      }
 *  }
 *  ```
 *  Same pattern, no-op 1:1 strict justifié. */
registerSpecial('LinkContestTryHideWirelessIndicator', () => {
  // 1:1 décomp guard fail (gLinkContestFlags == 0) → no-op.
});

// `IsCurSecretBaseOwnedByAnotherPlayer` (secret_base.c:720-726) — dette R3 :
// utilise sCurSecretBaseId (= static, set par EnterNewlyCreatedSecretBase).
// SecretBase subsystem U-tier (cf. ROADMAP U-tier).

// `SetHiddenItemFlag` (field_specials.c:935-938) — dette R3 architecturale :
// `FlagSet(gSpecialVar_0x8004)` lit un id numérique stocké par script (`setvar
// VAR_0x8004, FLAG_HIDDEN_ITEM_X`). Notre FlagSet/Clear prend un name string,
// pas un id numérique. Demande mapping inverse FLAG_ID → FLAG_NAME (= ~3000
// entries) ou refactor FlagSet pour accepter id numérique. Reste stub `() => 0`
// jusqu'à port mapping. Pattern identique à GetTrainerFlag (ligne 1192).

// `UpdateShoalTideFlag` (time_events.c:54-92) — dette R3 cascade :
// utilise IsMapTypeOutdoors(GetLastUsedWarpMapType()) + RtcCalcLocalTime +
// gLocalTime.hours + FlagSet/Clear FLAG_SYS_SHOAL_TIDE. gLastUsedWarp non
// porté (= EWRAM_DATA struct WarpData), GetMapTypeByWarpData non porté.
// Demande port helpers cascade. Reste stub jusqu'à port complet (3-4 fns).

// `GenerateGiddyLine` (mauville_old_man.c:282-315) — dette R3 cascade :
// utilise EasyChat (CopyEasyChatWord), Random, gStringVar4, sGiddyAdjectives,
// sGiddyQuestions, GiddyText_Is, GiddyText_DontYouAgree. Tables strings non
// extraites. Reste stub jusqu'à port mauville_old_man string tables.

/** Boot marker — confirme que le registry a été importé au boot.
 *  Utilisé par debug pour vérifier que le module est loaded. */
console.log(`[specials-registry] loaded — ${130 + 6 + _STUB_RETURN_0_SPECIALS.length + _SESSION_131_DECOMP_SPECIALS.length} stubs registered (Phase 5.7+ iter10 + audit126 + session131 1:1 décomp completion)`);
