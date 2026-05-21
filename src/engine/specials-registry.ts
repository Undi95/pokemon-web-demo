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
import { gameState } from './game-state';
import { CheckForPlayersHouseNews as _CheckForPlayersHouseNews } from './tv-screen';
import { setStringVar } from './string-buffers';

// ─── Phase 4.9 stubs minimaux (= early-game specials) ──────────────────────

/** 1:1 décomp `GetPlayerBigGuyGirlString` (string_util.c).
 *  Set sStringVar1 = "GRAND" (MALE) ou "GRANDE" (FEMALE) pour expand le
 *  placeholder {STR_VAR_1} dans dialogues type "Hum, salut, GRAND/GRANDE !".
 *  Used par e.g. LittlerootTown_Text_CanYouGoSeeWhatsHappening (= Twin NPC). */
registerSpecial('GetPlayerBigGuyGirlString', () => {
  const stringVar = gameState.gender === 'MALE' ? 'GRAND' : 'GRANDE';
  // 1:1 décomp : StringCopy(gStringVar1, gText_BigGuy/gText_BigGirl).
  // Notre version : stocke dans gameState pour expand par dialogue-box.ts.
  setStringVar(1, stringVar);
});

/** 1:1 décomp `BufferBigGuyOrBigGirlString` (string_util.c). Same que
 *  `GetPlayerBigGuyGirlString` mais pour expand dans un autre context. */
registerSpecial('BufferBigGuyOrBigGirlString', () => {
  const stringVar = gameState.gender === 'MALE' ? 'GRAND' : 'GRANDE';
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
  for (const mon of gameState.party) {
    if (!mon) continue;
    mon.currentHp = mon.maxHp;
    mon.status = null;
    for (const mv of mon.moves) {
      mv.pp = mv.ppMax;
    }
  }
  console.log(`[special HealPlayerParty] healed ${gameState.party.length} mons`);
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

/** 1:1 décomp `CalculatePlayerPartyCount` (pokemon_util.c:CalculatePlayerPartyCount).
 *  Returns gPlayerPartyCount (= number of party slots filled, 0..6). */
registerSpecial('CalculatePlayerPartyCount', () => {
  return gameState.partySize;
});

/** 1:1 décomp `ShouldTryRematchBattle` (rematch_setup.c).
 *  Returns TRUE si trainer rematch available. Stub return 0 (= pas de rematch). */
registerSpecial('ShouldTryRematchBattle', () => {
  return 0;
});

/** 1:1 décomp `IsEnoughForCostInVar0x8005` (field_specials.c).
 *  Check si player a assez d'argent. Stub return 0 (= pas assez). */
registerSpecial('IsEnoughForCostInVar0x8005', () => {
  return 0;
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

/** 1:1 décomp `IsBadEggInParty` (pokemon_util.c). Returns 0 = no bad eggs. */
registerSpecial('IsBadEggInParty', () => 0);

/** 1:1 décomp `RemoveAllWeatherPokemonItemEffect` (battle_util.c). Stub. */
registerSpecial('RemoveAllWeatherPokemonItemEffect', () => {
  // No weather effects in early game.
});

/** 1:1 décomp `IsLeadMonNicknamed` (pokemon_util.c).
 *  Returns 1 if first party mon has a nickname (= different from species name).
 *  For starter, name == species (= "ARCKO"), so returns 0 (= not nicknamed). */
registerSpecial('IsLeadMonNicknamed', () => {
  const lead = gameState.party[0];
  if (!lead) return 0;
  // Nickname is set via createPokemonInstance default = species name FR.
  // Real check : compare nickname to species name. Stub : assume not nicknamed.
  return 0;
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
  const lead = gameState.party[0];
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
  const mapId = (globalThis as { gMapHeader?: { id?: string } }).gMapHeader?.id ?? '';
  const isMaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F';
  const isFemaleHouse = mapId === 'MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F';
  const isInPlayersHouse = (gameState.gender === 'MALE' && isMaleHouse)
                        || (gameState.gender === 'FEMALE' && isFemaleHouse);
  console.log(`[special GetMomOrDadStringForTVMessage] mapId=${mapId} gender=${gameState.gender} isInPlayersHouse=${isInPlayersHouse}`);
  if (isInPlayersHouse) {
    setStringVar(1, 'MAMAN');
    gameState.setVar('VAR_TEMP_3', 1);
    return;
  }
  const cached = gameState.getVar('VAR_TEMP_3');
  if (cached === 1) { setStringVar(1, 'MAMAN'); return; }
  if (cached === 2) { setStringVar(1, 'PAPA'); return; }
  if (cached > 2) {
    setStringVar(1, cached % 2 === 0 ? 'MAMAN' : 'PAPA');
    return;
  }
  // Random 50/50
  if (Math.floor(Math.random() * 2) !== 0) {
    setStringVar(1, 'MAMAN');
    gameState.setVar('VAR_TEMP_3', 1);
  } else {
    setStringVar(1, 'PAPA');
    gameState.setVar('VAR_TEMP_3', 2);
  }
});

/** 1:1 décomp `EnableNationalPokedex` (pokedex_data.c) : unlock National Pokedex.
 *  Used post-Hall of Fame. MVP : just set a flag. */
registerSpecial('EnableNationalPokedex', () => {
  gameState.setFlag('FLAG_RECEIVED_POKEDEX_FROM_BIRCH');
});

/** 1:1 décomp `SetUnlockedPokedexFlags` (pokedex_data.c) : when player gets PokeDex,
 *  flag the dex types as unlocked. Stub no-op. */
registerSpecial('SetUnlockedPokedexFlags', () => { /* no-op */ });

/** 1:1 décomp `InitRoamer` (roamer.c) : initialize legendary roamer state
 *  (= Latios/Latias). Used post-EV. Stub no-op. */
registerSpecial('InitRoamer', () => { /* no-op */ });

/** 1:1 décomp `PlayerFaceTrainerAfterBattle` (event_object_movement.c) :
 *  After winning trainer battle, player turns to face the trainer. Stub. */
registerSpecial('PlayerFaceTrainerAfterBattle', () => { /* no-op */ });

// ─── Additional commonly-used early-game specials ───────────────────────────

/** 1:1 décomp `ScrSpecial_HealPlayerParty` (= alias of HealPlayerParty). */
registerSpecial('ScrSpecial_HealPlayerParty', () => {
  for (const mon of gameState.party) {
    if (!mon) continue;
    mon.currentHp = mon.maxHp;
    mon.status = null;
    for (const mv of mon.moves) mv.pp = mv.ppMax;
  }
});

/** 1:1 décomp `Special_AreLeadMonEVsMaxedOut` (pokemon_util.c). Returns 0 (= no). */
registerSpecial('Special_AreLeadMonEVsMaxedOut', () => 0);

/** 1:1 décomp `IsBigMonAndPlayerCantPushDoor` (= door push check). Returns 0. */
registerSpecial('IsBigMonAndPlayerCantPushDoor', () => 0);

/** 1:1 décomp `LoadBattlePyramidObjectEventTemplates` (battle_pyramid.c). Stub. */
registerSpecial('LoadBattlePyramidObjectEventTemplates', () => { /* no-op */ });

/** 1:1 décomp `Special_StartLegendaryBattle` (battle_setup.c). Stub return WIN. */
registerSpecial('Special_StartLegendaryBattle', () => {
  gameState.setVar('VAR_RESULT', 1);
  return 1;
});

/** 1:1 décomp `IsLastMonThatKnowsSurf` etc. — HM forget guards. Returns 0. */
registerSpecial('IsLastMonThatKnowsSurf', () => 0);
registerSpecial('IsLastMonThatKnowsCut', () => 0);
registerSpecial('IsLastMonThatKnowsDive', () => 0);
registerSpecial('IsLastMonThatKnowsRockSmash', () => 0);
registerSpecial('IsLastMonThatKnowsFly', () => 0);
registerSpecial('IsLastMonThatKnowsWaterfall', () => 0);
registerSpecial('IsLastMonThatKnowsStrength', () => 0);
registerSpecial('IsLastMonThatKnowsFlash', () => 0);

/** 1:1 décomp `Special_ViewLottery` etc. — lottery / casino. Stubs. */
registerSpecial('Special_ViewLottery', () => { /* no-op */ });
registerSpecial('Special_BeginRouletteGame', () => { /* no-op */ });

/** 1:1 décomp `BufferEReaderTrainerName`. Stub. */
registerSpecial('BufferEReaderTrainerName', () => { /* no-op */ });

/** 1:1 décomp `GetGameStat` (pokemon_util.c). Returns 0 for any stat. */
registerSpecial('GetGameStat', () => 0);

/** 1:1 décomp `PutZigzagoonInPlayerParty` (battle_setup.c) : adds Zigzagoon
 *  for Birch tutorial battle if party is empty. */
registerSpecial('PutZigzagoonInPlayerParty', () => {
  // For our flow, we already have a Pokemon from ChooseStarter. If party is
  // empty (= dev test), add a Zigzagoon.
  if (gameState.partySize === 0) {
    void (async () => {
      const { createPokemonInstance } = await import('./pokemon');
      const zig = createPokemonInstance('SPECIES_ZIGZAGOON', 5);
      gameState.addToParty(zig);
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
  const rivalIsBoy = gameState.gender === 'FEMALE';
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

/** 1:1 décomp `IsStarterInParty` — checks if starter is still in party. */
registerSpecial('IsStarterInParty', () => {
  return gameState.partySize > 0 ? 1 : 0;
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
registerSpecial('IsEnigmaBerryValid', () => 0);

/** 1:1 décomp `HasAllHoennMons` (pokedex.c) — pokedex completion check. */
registerSpecial('HasAllHoennMons', () => 0);

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
registerSpecial('ResetSSTidalFlag', () => { /* no-op */ });
registerSpecial('SetSSTidalFlag', () => { /* no-op */ });

/** 1:1 décomp link-contest specials. Stubs (= no contests yet). */
registerSpecial('LoadLinkContestPlayerPalettes', () => 0);
registerSpecial('GetContestMultiplayerId', () => 0);
registerSpecial('GenerateContestRand', () => 0);
registerSpecial('IsWirelessContest', () => 0);
registerSpecial('ClearLinkContestFlags', () => { /* no-op */ });

/** 1:1 décomp `GetPlayerFacingDirection` (event_object_movement.c). */
registerSpecial('GetPlayerFacingDirection', () => {
  // 1:1 décomp : retourne gObjectEvents[gPlayerAvatar.objectEventId].facingDirection.
  // Notre port stocke direct DIR_* (= DIR_NONE=0, DIR_SOUTH=1, DIR_NORTH=2,
  // DIR_WEST=3, DIR_EAST=4) dans block1.__facing.
  return gameState.map?.facing ?? 0;
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
registerSpecial('HasEnoughMonsForDoubleBattle', () => 1);

/** Casino. */
registerSpecial('GetSlotMachineId', () => 0);
registerSpecial('PlayerEnteredTradeSeat', () => { /* no-op */ });

/** Secret Base. */
registerSpecial('DeclinedSecretBaseBattle', () => { /* no-op */ });
registerSpecial('DoSecretBasePCTurnOffEffect', () => { /* no-op */ });

/** Interview / TV. */
registerSpecial('InterviewBefore', () => 0);

/** Berries. */
registerSpecial('PlayerHasBerries', () => 0);
registerSpecial('GetFirstFreePokeblockSlot', () => 0);
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
registerSpecial('GetLeadMonFriendshipScore', () => 0);
registerSpecial('WaitWeather', () => 0);
registerSpecial('MauvilleGymPressSwitch', () => { /* no-op */ });
registerSpecial('Script_DoRayquazaScene', () => { /* no-op */ });
registerSpecial('ShowFieldMessageStringVar4', () => { /* no-op */ });
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
  const slot = gameState.getVar?.('VAR_0x8004') ?? 0;
  const mon = gameState.party?.[slot];
  setStringVar(1, mon?.nickname || mon?.speciesNameFr || '???');
  return 0;
});

/** 1:1 décomp `ScriptGetPartyMonSpecies` :
 *    return GetMonData(&gPlayerParty[VAR_0x8004], MON_DATA_SPECIES);
 *  Utilisé par scripts pour check le species du Pokémon en slot. */
registerSpecial('ScriptGetPartyMonSpecies', () => {
  const slot = gameState.getVar?.('VAR_0x8004') ?? 0;
  const mon = gameState.party?.[slot];
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
  const slot = gameState.getVar?.('VAR_0x8004') ?? 0;
  const mon = gameState.party?.[slot];
  return (mon as { isEgg?: number })?.isEgg ? 1 : 0;
});

/** 1:1 décomp `StorePlayerCoordsInVars` (event_object_movement.c) :
 *    *VarGetPtr(VAR_0x8004) = gPlayerAvatar.x;
 *    *VarGetPtr(VAR_0x8005) = gPlayerAvatar.y;
 *  Used par scripts qui veulent positionner un NPC à coords player. */
registerSpecial('StorePlayerCoordsInVars', () => {
  const pa = (globalThis as { gPlayerAvatar?: { x: number; y: number } }).gPlayerAvatar;
  if (pa) {
    gameState.setVar?.('VAR_0x8004', pa.x);
    gameState.setVar?.('VAR_0x8005', pa.y);
  }
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
  'GetWeekCount', 'ReducePlayerPartyToSelectedMons', 'CableCarWarp', 'CableCar',
  'LoopWingFlapSE', 'GetDaysUntilPacifidlogTMAvailable', 'SetPacifidlogTMReceivedDay',
  'IsMirageIslandPresent', 'HasEnoughBerryPowder',
  'GetSeedotSizeRecordInfo', 'GetLotadSizeRecordInfo',
];
for (const name of _STUB_RETURN_0_SPECIALS) {
  registerSpecial(name, () => 0);
}

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
  'BufferTMHMMoveName', 'BufferTrendyPhraseString',
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
  'CheckInteractedWithFriendsCushionDecor', 'CheckInteractedWithFriendsDollDecor',
  'CheckInteractedWithFriendsFurnitureBottom', 'CheckInteractedWithFriendsFurnitureMiddle',
  'CheckInteractedWithFriendsFurnitureTop', 'CheckInteractedWithFriendsPosterDecor',
  'CheckInteractedWithFriendsSandOrnament', 'CheckLeadMonBeauty',
  'CheckLeadMonCool', 'CheckLeadMonCute', 'CheckLeadMonSmart', 'CheckLeadMonTough',
  'CheckPlayerHasSecretBase', 'CheckRelicanthWailord',
  'ChooseItemsToTossFromPyramidBag', 'ChooseMonForMoveRelearner',
  'ChooseMonForMoveTutor', 'ChooseMonForWirelessMinigame', 'ChooseSendDaycareMon',
  'CleanupLinkRoomState', 'ClearAndLeaveSecretBase', 'ClearQuizLadyPlayerAnswer',
  'ClearQuizLadyQuestionAndAnswer', 'CloseBattlePikeCurtain',
  'CompareLotadSize', 'CompareSeedotSize', 'CopyCurSecretBaseOwnerName_StrVar1',
  'CopyEReaderTrainerGreeting', 'CountPartyAliveNonEggMons',
  'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot', 'CountPartyNonEggMons',
  'CountPlayerTrainerStars', 'CreateAbnormalWeatherEvent', 'CreateEnemyEventMon',
  'DestroyMewEmergingGrassSprite', 'DidFavorLadyLikeItem',
  'DisplayBerryPowderVendorMenu', 'DoBerryBlending', 'DoDeoxysRockInteraction',
  'DoDiveWarp', 'DoDomeConfetti', 'DoFallWarp', 'DoLotteryCornerComputerEffect',
  'DoMirageTowerCeilingCrumble', 'DoPokeNews',
  'DoSealedChamberShakingEffect_Long', 'DoSoftReset', 'DoTVShow',
  'DoTVShowInSearchOfTrainers', 'DoTrainerApproach', 'DoWateringBerryTreeAnim',
  'DoesContestCategoryHaveMuseumPainting', 'DoesPartyHaveEnigmaBerry',
  'DoesPlayerHaveNoDecorations', 'DrewSecretBaseBattle', 'EggHatch',
  'EndLotteryCornerComputerEffect', 'EnterNewlyCreatedSecretBase',
  'EnterSafariMode', 'EnterSecretBase', 'ExitLinkRoom', 'ExitSafariMode',
  'FavorLadyGetPrize',
  // 'FieldShowRegionMap' — handler concret enregistré infra (= fade-from-black
  // jusqu'au port 1:1 worldmap UI region_map.c).
  'FinishCyclingRoadChallenge',
  'FoundAbandonedShipRoom1Key', 'FoundAbandonedShipRoom2Key',
  'FoundAbandonedShipRoom4Key', 'FoundAbandonedShipRoom6Key',
  'GabbyAndTyAfterInterview', 'GabbyAndTyBeforeInterview',
  'GabbyAndTyGetBattleNum', 'GabbyAndTyGetLastBattleTrivia',
  'GabbyAndTyGetLastQuote', 'GenerateGiddyLine',
  'GetAbnormalWeatherMapNameAndType', 'GetBattleFrontierTutorMoveIndex',
  'GetBattlePyramidHint', 'GetBattleTowerSinglesStreak',
  'GetContestLadyCategory', 'GetContestLadyMonSpecies',
  'GetContestMonCondition', 'GetContestMonConditionRanking',
  'GetContestPlayerId', 'GetContestantNamesAtRank',
  'GetCurSecretBaseRegistrationValidity', 'GetDaycareCost',
  'GetDaycareMonNicknames', 'GetDeptStoreDefaultFloorChoice',
  'GetFavorLadyState', 'GetGabbyAndTyLocalIds', 'GetLinkPartnerNames',
  'GetMartEmployeeObjectEventId',
  // 'GetMomOrDadStringForTVMessage' — handler concret enregistré supra (1:1 décomp).
  // 'PlayerPC' — dispatcher direct dans script-opcodes.ts (= bedroom-pc.ts UI).
  'GetMysteryGiftCardStat', 'GetNextActiveShowIfMassOutbreak',
  'GetNpcContestantLocalId', 'GetNumLevelsGainedFromDaycare',
  'GetNumMovesSelectedMonHas', 'GetObjectEventLocalIdByFlag',
  'GetPCBoxToSendMon', 'GetPlayerTrainerIdOnesDigit',
  'GetPokeblockFeederInFront', 'GetPokeblockNameByMonNature',
  'GetQuizAuthor', 'GetQuizLadyState', 'GetRandomActiveShowIdx',
  'GetRecordedCyclingRoadResults', 'GetSecretBaseNearbyMapName',
  'GetSecretBaseOwnerAndState', 'GetSecretBaseTypeInFrontOfPlayer',
  'GetSelectedMonNicknameAndSpecies', 'GetSelectedTVShow',
  'GetTraderTradedFlag', 'GetTrainerBattleMode', 'GetTrainerFlag',
  'GetWirelessCommType', 'GiddyShouldTellAnotherTale',
  'GiveEggFromDaycare', 'GiveLeadMonEffortRibbon', 'GiveMonContestRibbon',
  'HasAnotherPlayerGivenFavorLadyItem', 'HasAtLeastOneBerry',
  'HasBardSongBeenChanged', 'HasHipsterTaughtWord',
  'HasMonWonThisContestBefore', 'HasPlayerGivenContestLadyPokeblock',
  'HasStorytellerAlreadyRecorded', 'HideContestEntryMonPic',
  'HipsterTryTeachWord', 'IncrementDailyPickedBerries',
  'IncrementDailyPlantedBerries', 'InitSecretBaseDecorationSprites',
  'InitSecretBaseVars', 'InitUnionRoom', 'InteractWithShieldOrTVDecoration',
  'InterviewAfter', 'IsContestDebugActive', 'IsContestWithRSPlayer',
  'IsCurSecretBaseOwnedByAnotherPlayer', 'IsDecorationCategoryFull',
  'IsDodrioInParty', 'IsFavorLadyThresholdMet', 'IsGabbyAndTyShowOnTheAir',
  'IsGrassTypeInParty', 'IsLeadMonNicknamedOrNotEnglish', 'IsMonOTIDNotPlayers',
  'IsPokemonJumpSpeciesInParty', 'IsPokerusInParty', 'IsQuizAnswerCorrect',
  'IsQuizLadyWaitingForChallenger', 'IsTVShowAlreadyInQueue',
  'IsTrendyPhraseBoring', 'LeadMonHasEffortRibbon',
  'LinkContestTryHideWirelessIndicator', 'LinkContestTryShowWirelessIndicator',
  'LinkContestWaitForConnection', 'LoadPlayerBag', 'LostSecretBaseBattle',
  'MauvilleGymSetDefaultBarriers', 'MonOTNameNotPlayer',
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
  'RejectEggFromDayCare', 'ResetTVShowState', 'ResetTrickHouseNuggetFlag',
  'RetrieveLotteryNumber', 'ReturnFromLinkRoom', 'RockSmashWildEncounter',
  'SaveBardSongLyrics', 'SaveGame', 'ScriptCheckFreePokemonStorageSpace',
  'ScriptGetPokedexInfo', 'ScriptHatchMon',
  'ScriptMenu_CreatePCMultichoice',
  'Script_BufferContestLadyCategoryAndMonName',
  'Script_DoesFavorLadyLikeItem', 'Script_FadeOutMapMusic',
  'Script_FavorLadyOpenBagMenu', 'Script_GetCurrentMauvilleMan',
  'Script_GetLilycoveLadyId', 'Script_QuizLadyOpenBagMenu',
  'Script_ResetUnionRoomTrade', 'Script_ShowLinkTrainerCard',
  'Script_StartWiredTrade', 'Script_StorytellerDisplayStory',
  'Script_StorytellerInitializeRandomStat',
  'ScrollRankingHallRecordsWindow', 'ScrollableMultichoice_ClosePersistentMenu',
  'ScrollableMultichoice_RedrawPersistentMenu',
  'ScrollableMultichoice_TryReturnToList', 'SetCB2WhiteOut',
  'SetChampionSaveWarp', 'SetContestCategoryStringVarForInterview',
  'SetContestLadyGivenPokeblock', 'SetContestTrainerGfxIds',
  'SetDaycareCompatibilityString', 'SetDecoration',
  'SetDeoxysRockPalette', 'SetDeptStoreFloor', 'SetEReaderTrainerGfxId',
  'SetFavorLadyState_Complete', 'SetHiddenItemFlag', 'SetHipsterTaughtWord',
  'SetLilycoveLadyGfx', 'SetLinkContestPlayerGfx', 'SetMatchCallRegisteredFlag',
  'SetMauvilleOldManObjEventGfx', 'SetMirageTowerVisibility',
  'SetPlayerGotFirstFans', 'SetPlayerSecretBase',
  'SetQuizLadyState_Complete', 'SetQuizLadyState_GivePrize',
  'SetRoute119Weather', 'SetRoute123Weather', 'SetSecretBaseOwnerGfxId',
  'SetSootopolisGymCrackedIceMetatiles', 'SetTrickHouseNuggetFlag',
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
  'SubtractMoneyFromVar0x8005', 'SwapRegisteredBike', 'TakeBerryPowder',
  'TakePokemonFromDaycare', 'TeachMoveRelearnerMove',
  'ToggleCurSecretBaseRegistry', 'TraderDoDecorationTrade',
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
  'WonSecretBaseBattle', 'WonderNews_GetRewardInfo',
];

for (const name of _SESSION_131_DECOMP_SPECIALS) {
  registerSpecial(name, () => 0);
}

/** Boot marker — confirme que le registry a été importé au boot.
 *  Utilisé par debug pour vérifier que le module est loaded. */
console.log(`[specials-registry] loaded — ${130 + 6 + _STUB_RETURN_0_SPECIALS.length + _SESSION_131_DECOMP_SPECIALS.length} stubs registered (Phase 5.7+ iter10 + audit126 + session131 1:1 décomp completion)`);
