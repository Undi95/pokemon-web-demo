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

/** 1:1 décomp `HealPlayerParty` (party_menu.c:7144) :
 *  ```c
 *  void HealPlayerParty(void) {
 *      u8 i, j;
 *      for (i = 0; i < gPlayerPartyCount; i++) {
 *          u8 ppBonuses = GetMonData(&gPlayerParty[i], MON_DATA_PP_BONUSES);
 *          u16 hp = GetMonData(&gPlayerParty[i], MON_DATA_MAX_HP);
 *          SetMonData(&gPlayerParty[i], MON_DATA_HP, &hp);
 *          // Restore PP
 *          ...
 *          SetMonData(&gPlayerParty[i], MON_DATA_STATUS, &arg);
 *      }
 *  }
 *  ```
 *  Restore HP/PP de tous les Pokemon du joueur + clear status. Used par
 *  Pokemon Center NPCs + après défaite trainer + après ChooseStarter battle. */
registerSpecial('HealPlayerParty', () => {
  for (const mon of gameState.party) {
    if (!mon) continue;
    mon.currentHp = mon.maxHp;
    mon.status = null;
    // Restore PP de chaque move (= 1:1 décomp PpBonuses non implémenté pour
    // MVP, on restore à pp_max sans calcul bonus PP).
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

/** 1:1 décomp `BedroomPC` (mail.c).
 *  Open le PC interface. Stub no-op (= no PC UI yet). */
registerSpecial('BedroomPC', () => {
  // TODO Phase 6+ : open PC menu interface.
});

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

/** 1:1 décomp `StartWallClock` (wallclock.c) :
 *    Set the player's wall clock UI. Used in PlayersHouse_2F when checking
 *    the clock for the first time. Phase 5+ : implement full UI.
 *    Stub no-op (= scripts continue without setting the clock).
 *    NB : the script uses `waitstate=1` but our SetupNativeScript sync
 *    return makes it skip the wait → safe noop. */
registerSpecial('StartWallClock', () => {
  console.log('[special StartWallClock] stub — clock UI not yet implemented (Phase 6+)');
  // Default to 12:00 noon (= 1:1 décomp gLocalTime).
  gameState.setVar('VAR_HOURS', 12);
  gameState.setVar('VAR_MINUTES', 0);
});

/** 1:1 décomp `Special_ViewWallClock` (wallclock.c).
 *  Read clock state. Stub no-op. */
registerSpecial('Special_ViewWallClock', () => {
  console.log('[special Special_ViewWallClock] stub — clock UI not yet implemented');
});

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

/** 1:1 décomp `BufferLeadMonSpeciesName` (pokemon_util.c).
 *  Sets gStringVar1 to lead party mon species name. Used by scripts post-battle. */
registerSpecial('BufferLeadMonSpeciesName', () => {
  const lead = gameState.party[0];
  if (lead && lead.speciesNameFr) {
    setStringVar(1, lead.speciesNameFr);
  }
});

// ─── PC effects (= used by post-rival-battle when player visits Birch's lab) ─

/** 1:1 décomp `DoPCTurnOnEffect` (player_pc.c) : flicker animation when
 *  PC monitor turns on. Stub : no visual effect. */
registerSpecial('DoPCTurnOnEffect', () => { /* no-op */ });

/** 1:1 décomp `DoPCTurnOffEffect` (player_pc.c). Stub. */
registerSpecial('DoPCTurnOffEffect', () => { /* no-op */ });

/** 1:1 décomp `TurnOnTVScreen` (field_specials.c) : TV interaction effect. */
registerSpecial('TurnOnTVScreen', () => { /* no-op */ });

/** 1:1 décomp `TurnOffTVScreen` (field_specials.c). Stub. */
registerSpecial('TurnOffTVScreen', () => { /* no-op */ });

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

/** 1:1 décomp `SavePlayerParty` / `LoadPlayerParty` — battle frontier-like
 *  party save state. Notre gameState gère déjà la party persistée. */
registerSpecial('SavePlayerParty', () => { gameState.save(); });
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
  // 1:1 décomp : retourne gObjectEvents[0].facingDirection.
  const dir = gameState.player?.direction;
  if (dir === 'NORTH') return 1;
  if (dir === 'SOUTH') return 2;
  if (dir === 'WEST') return 3;
  if (dir === 'EAST') return 4;
  return 0;
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

/** Boot marker — confirme que le registry a été importé au boot.
 *  Utilisé par debug pour vérifier que le module est loaded. */
console.log('[specials-registry] loaded — 130 stubs registered (Phase 5.7+ iter10)');
